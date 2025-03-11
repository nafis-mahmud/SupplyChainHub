document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const apiUrlInput = document.getElementById("apiUrl");
  const projectSelect = document.getElementById("projectSelect");
  const refreshProjectsBtn = document.getElementById("refreshProjects");
  const scriptNameInput = document.getElementById("scriptName");
  const scriptDescriptionInput = document.getElementById("scriptDescription");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  const scriptContentTextarea = document.getElementById("scriptContent");
  const copyBtn = document.getElementById("copyBtn");
  const saveBtn = document.getElementById("saveBtn");
  const statusDiv = document.getElementById("status");

  // Load saved API URL
  chrome.storage.local.get(["apiUrl"], function (result) {
    if (result.apiUrl) {
      apiUrlInput.value = result.apiUrl;
      loadProjects();
    }
  });

  // Event listeners
  apiUrlInput.addEventListener("blur", function () {
    chrome.storage.local.set({ apiUrl: apiUrlInput.value });
  });

  refreshProjectsBtn.addEventListener("click", loadProjects);

  startBtn.addEventListener("click", function () {
    if (!validateForm()) return;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" });
      updateStatus("Recording started", "info");
      updateButtonStates(true);
    });
  });

  pauseBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "pauseRecording" });

      if (pauseBtn.textContent === "Pause") {
        pauseBtn.textContent = "Resume";
        updateStatus("Recording paused", "info");
      } else {
        pauseBtn.textContent = "Pause";
        updateStatus("Recording resumed", "info");
      }
    });
  });

  stopBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecording" });
      updateButtonStates(false);
      updateStatus("Recording stopped", "info");
    });
  });

  copyBtn.addEventListener("click", function () {
    scriptContentTextarea.select();
    document.execCommand("copy");
    updateStatus("Script copied to clipboard", "success");
  });

  saveBtn.addEventListener("click", saveScript);

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.action === "recordingComplete") {
        scriptContentTextarea.value = request.script;
        updateButtonStates(false);
        updateStatus("Script generated successfully", "success");
      }
    },
  );

  // Functions
  function loadProjects() {
    const apiUrl = apiUrlInput.value;
    if (!apiUrl) {
      updateStatus("Please enter API URL", "error");
      return;
    }

    updateStatus("Loading projects...", "info");

    fetch(`${apiUrl}/api/projects`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch projects");
        return response.json();
      })
      .then((data) => {
        projectSelect.innerHTML = '<option value="">Select a project</option>';

        data.forEach((project) => {
          const option = document.createElement("option");
          option.value = project.id;
          option.textContent = project.title;
          projectSelect.appendChild(option);
        });

        updateStatus("Projects loaded", "success");
      })
      .catch((error) => {
        console.error("Error loading projects:", error);
        updateStatus("Failed to load projects", "error");
      });
  }

  function validateForm() {
    if (!apiUrlInput.value) {
      updateStatus("Please enter API URL", "error");
      return false;
    }

    if (!projectSelect.value) {
      updateStatus("Please select a project", "error");
      return false;
    }

    if (!scriptNameInput.value) {
      updateStatus("Please enter a script name", "error");
      return false;
    }

    return true;
  }

  function updateButtonStates(isRecording) {
    startBtn.disabled = isRecording;
    pauseBtn.disabled = !isRecording;
    stopBtn.disabled = !isRecording;

    if (!isRecording) {
      pauseBtn.textContent = "Pause";
    }
  }

  function updateStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = "status " + type;

    // Clear status after 3 seconds
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "status";
    }, 3000);
  }

  function saveScript() {
    if (!validateForm()) return;

    if (!scriptContentTextarea.value) {
      updateStatus("No script to save", "error");
      return;
    }

    const apiUrl = apiUrlInput.value;
    const projectId = projectSelect.value;
    const scriptName = scriptNameInput.value;
    const scriptDescription = scriptDescriptionInput.value;
    const scriptContent = scriptContentTextarea.value;

    updateStatus("Saving script...", "info");

    fetch(`${apiUrl}/api/selenium-scripts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: scriptName,
        description: scriptDescription,
        script_content: scriptContent,
        project_id: projectId,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to save script");
        return response.json();
      })
      .then((data) => {
        updateStatus("Script saved successfully", "success");

        // Clear form
        scriptNameInput.value = "";
        scriptDescriptionInput.value = "";
        scriptContentTextarea.value = "";
      })
      .catch((error) => {
        console.error("Error saving script:", error);
        updateStatus("Failed to save script", "error");
      });
  }
});
