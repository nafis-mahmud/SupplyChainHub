// content.js - Content script for SupplyChainHub Interaction Recorder

console.log("SupplyChainHub Interaction Recorder content script loaded");

// Flag to track if recording is active
let isRecording = false;

// Initialize extension
(function initialize() {
  console.log("Initializing content script");
  
  // Check if we can access the Chrome API
  if (!chrome.runtime || !chrome.runtime.id) {
    console.error("Extension context is invalid during initialization");
    return;
  }
  
  // Try to get the auth token from localStorage
  setTimeout(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("Found token on page load, sending to background script");
      chrome.runtime.sendMessage({ 
        action: "tokenUpdated", 
        token 
      });
    }
  }, 1000); // Give the page a second to load
})();

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request.action);
  
  switch (request.action) {
    case "getToken":
      const token = localStorage.getItem('authToken');
      console.log("Sending token to background:", token ? "Token exists" : "No token");
      sendResponse({ token });
      break;
      
    case "startRecording":
      console.log("Starting recording");
      startRecording();
      sendResponse({ success: true });
      break;
      
    case "stopRecording":
      console.log("Stopping recording");
      stopRecording();
      sendResponse({ success: true });
      break;
      
    case "clearRecording":
      console.log("Clearing recording state");
      isRecording = false;
      removeRecordingIndicator();
      sendResponse({ success: true });
      break;
  }
});

// Event handlers
function handleClick(e) {
  if (!isRecording) return;
  
  try {
    let selector = getElementSelector(e.target);
    console.log("Click detected on:", selector);
    chrome.runtime.sendMessage({
      action: 'recordAction',
      type: 'click',
      selector: selector,
      url: window.location.href
    });
  } catch (error) {
    console.error("Error handling click:", error);
  }
}

function handleDoubleClick(e) {
  if (!isRecording) return;
  
  try {
    let selector = getElementSelector(e.target);
    console.log("Double-click detected on:", selector);
    chrome.runtime.sendMessage({
      action: 'recordAction',
      type: 'doubleClick',
      selector: selector,
      url: window.location.href
    });
  } catch (error) {
    console.error("Error handling double-click:", error);
  }
}

function handleInput(e) {
  if (!isRecording) return;
  
  // Only handle input events on input, textarea, and select elements
  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
  
  try {
    // Debounce input events
    if (e.target._inputTimeout) {
      clearTimeout(e.target._inputTimeout);
    }
    
    e.target._inputTimeout = setTimeout(() => {
      let selector = getElementSelector(e.target);
      let value = e.target.value || '';
      
      console.log("Input detected on:", selector, "with value:", value);
      chrome.runtime.sendMessage({
        action: 'recordAction',
        type: 'input',
        selector: selector,
        value: value,
        url: window.location.href
      });
    }, 500);
  } catch (error) {
    console.error("Error handling input:", error);
  }
}

// Get a selector for an element
function getElementSelector(element) {
  // Use ID if available
  if (element.id) return `#${element.id}`;
  
  // Use name if available
  if (element.name) return `[name="${element.name}"]`;
  
  // Use tag name with position
  const tagName = element.tagName.toLowerCase();
  
  // Find the element's position among siblings with the same tag
  if (element.parentNode) {
    const siblings = Array.from(element.parentNode.children).filter(
      child => child.tagName === element.tagName
    );
    
    if (siblings.length > 1) {
      const index = siblings.indexOf(element) + 1;
      return `${tagName}:nth-of-type(${index})`;
    }
  }
  
  // Fallback to just the tag name
  return tagName;
}

// Start recording
function startRecording() {
  if (isRecording) {
    console.log("Already recording, ignoring start request");
    return;
  }
  
  console.log("Starting to record interactions");
  isRecording = true;
  
  // Add recording indicator
  addRecordingIndicator();
  
  // Add event listeners
  document.addEventListener('click', handleClick, true);
  document.addEventListener('dblclick', handleDoubleClick, true);
  document.addEventListener('input', handleInput, true);
}

// Stop recording
function stopRecording() {
  if (!isRecording) {
    console.log("Not recording, ignoring stop request");
    return;
  }
  
  console.log("Stopping recording");
  isRecording = false;
  
  // Remove recording indicator
  removeRecordingIndicator();
  
  // Remove event listeners
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('dblclick', handleDoubleClick, true);
  document.removeEventListener('input', handleInput, true);
}

// Add recording indicator
function addRecordingIndicator() {
  // Remove existing indicator if any
  removeRecordingIndicator();
  
  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'extension-recording-indicator';
  indicator.style.position = 'fixed';
  indicator.style.top = '10px';
  indicator.style.right = '10px';
  indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 10px';
  indicator.style.borderRadius = '4px';
  indicator.style.fontFamily = 'Arial, sans-serif';
  indicator.style.fontSize = '12px';
  indicator.style.fontWeight = 'bold';
  indicator.style.zIndex = '9999';
  indicator.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  indicator.textContent = 'Recording';
  
  // Add pulsing animation
  indicator.style.animation = 'pulse 1.5s infinite';
  
  // Add animation style
  const style = document.createElement('style');
  style.id = 'extension-recording-indicator-style';
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(indicator);
}

// Remove recording indicator
function removeRecordingIndicator() {
  const indicator = document.getElementById('extension-recording-indicator');
  if (indicator) {
    indicator.parentNode.removeChild(indicator);
  }
  
  const style = document.getElementById('extension-recording-indicator-style');
  if (style) {
    style.parentNode.removeChild(style);
  }
}

// Listen for auth token changes in localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'authToken') {
    console.log('Auth token changed in localStorage');
    
    if (event.newValue) {
      // Token was added or updated
      chrome.runtime.sendMessage({
        action: 'tokenUpdated',
        token: event.newValue
      });
    } else {
      // Token was removed
      chrome.runtime.sendMessage({
        action: 'tokenRemoved'
      });
    }
  }
});
