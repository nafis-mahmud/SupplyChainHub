// Background script for the Selenium Recorder extension

// Listen for installation
chrome.runtime.onInstalled.addListener(function () {
  console.log("Selenium Recorder extension installed");
});

// Set up context menu
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "startRecording",
    title: "Start Recording",
    contexts: ["page"],
  });

  chrome.contextMenus.create({
    id: "stopRecording",
    title: "Stop Recording",
    contexts: ["page"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "startRecording") {
    chrome.tabs.sendMessage(tab.id, { action: "startRecording" });
  } else if (info.menuItemId === "stopRecording") {
    chrome.tabs.sendMessage(tab.id, { action: "stopRecording" });
  }
});

// Set up communication with API
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "fetchProjects") {
    fetch(request.apiUrl + "/api/projects")
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() }),
      );
    return true; // Required for async sendResponse
  }

  if (request.action === "saveScript") {
    fetch(request.apiUrl + "/api/selenium-scripts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request.data),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ success: true, data: data }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() }),
      );
    return true; // Required for async sendResponse
  }
});
