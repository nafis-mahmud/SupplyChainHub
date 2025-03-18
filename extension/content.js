// content.js - Content script that runs in the context of web pages

console.log("SupplyChainHub Interaction Recorder content script loaded");

let isRecording = false;
let extensionContextValid = true;

// Check if extension context is valid
function checkExtensionContext() {
  try {
    return chrome.runtime && chrome.runtime.id;
  } catch (error) {
    console.warn("Extension context is invalid:", error);
    extensionContextValid = false;
    return false;
  }
}

// Initialize by sending the token to the background script if available
(function initializeContentScript() {
  console.log("Initializing content script");
  
  // Check extension context first
  if (!checkExtensionContext()) {
    console.error("Extension context is invalid during initialization");
    return;
  }
  
  setTimeout(() => {
    getAuthToken().then(token => {
      if (token) {
        console.log("Found token on page load, sending to background script");
        sendMessageToBackground({ 
          action: "tokenUpdated", 
          token 
        });
      }
    }).catch(err => {
      console.error("Error getting auth token:", err);
    });
  }, 1000); // Give the page a second to load
})();

// Helper function to safely send messages to the background script
function sendMessageToBackground(message, callback) {
  if (!checkExtensionContext()) {
    console.warn("Cannot send message to background, extension context is invalid");
    if (callback) callback({ success: false, error: "Extension context invalid" });
    return;
  }
  
  try {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to background:", chrome.runtime.lastError);
        extensionContextValid = false;
        if (callback) callback({ success: false, error: chrome.runtime.lastError.message });
      } else {
        if (callback) callback(response);
      }
    });
  } catch (error) {
    console.error("Error sending message to background:", error);
    extensionContextValid = false;
    if (callback) callback({ success: false, error: error.message });
  }
}

// Listen for messages from the web application
window.addEventListener('message', function(event) {
  // Only accept messages from the same window
  if (event.source !== window) return;
  
  const message = event.data;
  
  // Check if the message is from our web app
  if (message && message.source === 'extension-bridge') {
    console.log('Content script received message from web app:', message.action);
    
    if (message.action === 'authTokenResponse' && message.token) {
      console.log('Received auth token from web app');
      
      // Forward the token to the background script
      sendMessageToBackground({
        action: 'tokenUpdated',
        token: message.token
      }, response => {
        if (response && response.success) {
          console.log("Token from web app forwarded to background script successfully");
        } else {
          console.error("Failed to forward token to background script:", response ? response.error : "Unknown error");
        }
      });
    }
  }
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Content script received message:", request.action);
  
  // Update extension context status
  extensionContextValid = true;
  
  switch (request.action) {
    case "getToken":
      getAuthToken().then(token => {
        sendResponse({ token });
      }).catch(err => {
        console.error("Error getting token:", err);
        sendResponse({ token: null, error: err.message });
      });
      return true; // Keep the message channel open for async response
      
    case "clearToken":
      // We don't actually clear the token from localStorage here
      // as that would log the user out of the web app too
      // Instead, we just notify that the token is cleared for the extension
      sendResponse({ success: true });
      break;
      
    case "startRecording":
      startRecording();
      sendResponse({ success: true });
      break;
      
    case "stopRecording":
      stopRecording();
      sendResponse({ success: true });
      break;
      
    case "authStateChanged":
      // Handle auth state changes from background script
      console.log("Auth state changed:", request.isAuthenticated);
      sendResponse({ success: true });
      break;
  }
});

/**
 * Get the authentication token from localStorage
 * @returns {Promise<string>} The authentication token or null
 */
async function getAuthToken() {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log("No auth token found in localStorage");
      return null;
    }
    
    return token;
  } catch (error) {
    console.error("Error in getAuthToken:", error);
    return null;
  }
}

/**
 * Start recording user interactions
 */
function startRecording() {
  console.log("Starting to record user interactions");
  isRecording = true;
  
  // Add event listeners for user interactions
  document.addEventListener('click', handleClick, true);
  document.addEventListener('input', handleInput, true);
  document.addEventListener('change', handleChange, true);
  
  // Visual indicator that recording is active
  showRecordingIndicator();
  
  // Log a test action to verify the recording pipeline
  console.log("Testing recording pipeline...");
  setTimeout(() => {
    if (isRecording) {
      recordAction('test', 'TEST', 'test-selector', 'test-value');
    }
  }, 1000);
}

/**
 * Stop recording user interactions
 */
function stopRecording() {
  console.log("Stopping recording of user interactions");
  isRecording = false;
  
  // Remove event listeners
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('input', handleInput, true);
  document.removeEventListener('change', handleChange, true);
  
  // Remove visual indicator
  hideRecordingIndicator();
}

/**
 * Show a visual indicator that recording is active
 */
function showRecordingIndicator() {
  // Create or show the recording indicator
  let indicator = document.getElementById('supply-chain-hub-recording-indicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'supply-chain-hub-recording-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '10px';
    indicator.style.right = '10px';
    indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
    indicator.style.color = 'white';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.style.fontFamily = 'Arial, sans-serif';
    indicator.style.fontSize = '12px';
    indicator.style.fontWeight = 'bold';
    indicator.textContent = 'Recording...';
    document.body.appendChild(indicator);
  } else {
    indicator.style.display = 'block';
  }
}

/**
 * Hide the recording indicator
 */
function hideRecordingIndicator() {
  const indicator = document.getElementById('supply-chain-hub-recording-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

/**
 * Handle click events
 * @param {MouseEvent} event - The click event
 */
function handleClick(event) {
  if (!isRecording) return;
  
  const element = event.target;
  
  // Only record clicks on interactive elements
  if (isInteractiveElement(element)) {
    const selector = getBestSelector(element);
    const locatorType = getLocatorType(element, selector);
    
    console.log("Recording click:", { locatorType, selector });
    recordAction('click', locatorType, selector);
  } else {
    console.log("Click on non-interactive element, not recording:", element);
  }
}

/**
 * Handle input events
 * @param {Event} event - The input event
 */
function handleInput(event) {
  if (!isRecording) return;
  
  const element = event.target;
  
  // Only record input on input elements
  if (isInputElement(element)) {
    const selector = getBestSelector(element);
    const locatorType = getLocatorType(element, selector);
    const value = element.value;
    
    console.log("Recording input:", { locatorType, selector, value });
    recordAction('input', locatorType, selector, value);
  }
}

/**
 * Handle change events (for select elements)
 * @param {Event} event - The change event
 */
function handleChange(event) {
  if (!isRecording) return;
  
  const element = event.target;
  
  // Only record changes on select elements
  if (element.tagName.toLowerCase() === 'select') {
    const selector = getBestSelector(element);
    const locatorType = getLocatorType(element, selector);
    let value = '';
    
    // Get the selected option text
    if (element.selectedIndex >= 0) {
      value = element.options[element.selectedIndex].text;
    }
    
    console.log("Recording select:", { locatorType, selector, value });
    recordAction('select', locatorType, selector, value);
  }
}

/**
 * Check if an element is interactive
 * @param {Element} element - The element to check
 * @returns {boolean} Whether the element is interactive
 */
function isInteractiveElement(element) {
  const tagName = element.tagName.toLowerCase();
  
  // Common interactive elements
  if (['a', 'button', 'input', 'select', 'textarea'].includes(tagName)) {
    return true;
  }
  
  // Elements with click handlers (approximation)
  if (element.onclick || element.getAttribute('onclick')) {
    return true;
  }
  
  // Elements with role attributes
  const role = element.getAttribute('role');
  if (role && ['button', 'link', 'checkbox', 'radio', 'menuitem', 'tab'].includes(role)) {
    return true;
  }
  
  // Elements with common interactive classes (approximation)
  const classNames = typeof element.className === 'string' 
    ? element.className.split(' ') 
    : (element.classList ? Array.from(element.classList) : []);
  if (classNames.some(cls => /btn|button|clickable|link|nav-item|menu-item/.test(cls))) {
    return true;
  }
  
  return false;
}

/**
 * Check if an element is an input element
 * @param {Element} element - The element to check
 * @returns {boolean} Whether the element is an input element
 */
function isInputElement(element) {
  const tagName = element.tagName.toLowerCase();
  
  // Input elements
  if (tagName === 'input') {
    const type = element.type.toLowerCase();
    return ['text', 'email', 'password', 'number', 'search', 'tel', 'url'].includes(type);
  }
  
  // Textarea elements
  if (tagName === 'textarea') {
    return true;
  }
  
  // Contenteditable elements
  if (element.getAttribute('contenteditable') === 'true') {
    return true;
  }
  
  return false;
}

/**
 * Get the best selector for an element
 * @param {Element} element - The element to get a selector for
 * @returns {string} The best selector for the element
 */
function getBestSelector(element) {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }
  
  // Try data-testid
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }
  
  // Try name attribute
  const name = element.getAttribute('name');
  if (name) {
    return `[name="${name}"]`;
  }
  
  // Try class names
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/);
    if (classes.length > 0 && classes[0]) {
      // Use the first class name
      return `.${classes[0]}`;
    }
  }
  
  // Try tag name with position
  const tagName = element.tagName.toLowerCase();
  const sameTagElements = Array.from(document.getElementsByTagName(tagName));
  const index = sameTagElements.indexOf(element);
  if (index >= 0) {
    return `${tagName}:nth-of-type(${index + 1})`;
  }
  
  // Fallback to XPath
  return getXPath(element);
}

/**
 * Get the XPath for an element
 * @param {Element} element - The element to get an XPath for
 * @returns {string} The XPath for the element
 */
function getXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  // If we reached the root, return the path
  if (!element.parentNode) {
    return '';
  }
  
  // Get all siblings of the same type
  const siblings = Array.from(element.parentNode.children).filter(
    sibling => sibling.tagName === element.tagName
  );
  
  // If there's only one, no need for index
  if (siblings.length === 1) {
    return `${getXPath(element.parentNode)}/${element.tagName.toLowerCase()}`;
  }
  
  // Find the index of the element among its siblings
  const index = siblings.indexOf(element) + 1;
  return `${getXPath(element.parentNode)}/${element.tagName.toLowerCase()}[${index}]`;
}

/**
 * Get the locator type for an element and selector
 * @param {Element} element - The element
 * @param {string} selector - The selector
 * @returns {string} The locator type
 */
function getLocatorType(element, selector) {
  // Check if it's an XPath
  if (selector.startsWith('/')) {
    return 'XPATH';
  }
  
  // Check if it's an ID selector
  if (selector.startsWith('#')) {
    return 'ID';
  }
  
  // Check if it's a class selector
  if (selector.startsWith('.')) {
    return 'CLASS_NAME';
  }
  
  // Check if it's a name attribute
  if (selector.startsWith('[name=')) {
    return 'NAME';
  }
  
  // Check if it's a data-testid attribute
  if (selector.startsWith('[data-testid=')) {
    return 'CSS_SELECTOR';
  }
  
  // Default to CSS selector
  return 'CSS_SELECTOR';
}

/**
 * Record an action by sending it to the background script
 * @param {string} type - The type of action
 * @param {string} locator - The locator type
 * @param {string} selector - The selector
 * @param {string} value - The value (for input actions)
 */
function recordAction(type, locator, selector, value = '') {
  console.log(`Attempting to record action: ${type} on ${selector} with value: ${value}`);
  
  try {
    // Check if we're recording and extension context is valid
    if (!isRecording) {
      console.warn("Not recording action because recording is not active");
      return;
    }
    
    if (!extensionContextValid) {
      console.warn("Not recording action because extension context is invalid");
      return;
    }
    
    const message = {
      action: 'recordAction',
      type,
      locator,
      selector,
      value,
      url: window.location.href // Include the current URL
    };
    
    console.log("Sending recordAction message to background:", message);
    
    sendMessageToBackground(message, response => {
      if (!response || !response.success) {
        console.error("Failed to record action:", response ? response.error : "Unknown error");
      } else {
        console.log(`Action recorded successfully. Total actions: ${response.actionCount || 'unknown'}`);
        
        // Show a visual feedback that the action was recorded
        showActionRecordedFeedback(selector);
      }
    });
  } catch (error) {
    console.error("Error sending recordAction message:", error);
  }
}

/**
 * Show visual feedback that an action was recorded
 * @param {string} selector - The selector of the element
 */
function showActionRecordedFeedback(selector) {
  try {
    // Try to find the element
    let element;
    try {
      element = document.querySelector(selector);
    } catch (error) {
      console.log("Could not find element with selector:", selector);
      return;
    }
    
    if (!element) return;
    
    // Create a temporary overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.border = '2px solid rgba(255, 0, 0, 0.7)';
    overlay.style.borderRadius = '3px';
    overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    overlay.style.transition = 'opacity 0.5s ease-out';
    
    // Position the overlay
    const rect = element.getBoundingClientRect();
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Fade out and remove
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }, 500);
  } catch (error) {
    console.error("Error showing action recorded feedback:", error);
  }
}

// Listen for auth token changes in localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'authToken') {
    console.log("Auth token changed in localStorage");
    
    // Send the updated token to the background script
    if (event.newValue) {
      try {
        // Check if extension context is still valid before sending message
        if (chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage({
            action: 'tokenUpdated',
            token: event.newValue
          }, response => {
            if (chrome.runtime.lastError) {
              console.error("Error sending updated token to background:", chrome.runtime.lastError);
            }
          });
        } else {
          console.warn("Extension context is no longer valid, can't send token update");
        }
      } catch (error) {
        console.error("Error sending token update message:", error);
      }
    } else {
      // Token was removed
      try {
        // Check if extension context is still valid before sending message
        if (chrome.runtime && chrome.runtime.id) {
          chrome.runtime.sendMessage({
            action: 'logout'
          }, response => {
            if (chrome.runtime.lastError) {
              console.error("Error sending logout to background:", chrome.runtime.lastError);
            }
          });
        } else {
          console.warn("Extension context is no longer valid, can't send logout message");
        }
      } catch (error) {
        console.error("Error sending logout message:", error);
      }
    }
  }
});
