// background.js - Background script for the extension

console.log("SupplyChainHub Interaction Recorder background script loaded");

// State
let isAuthenticated = false;
let authToken = null;
let isRecording = false;
let recordedActions = [];
let currentScript = null;
let tokenInitialized = false; // Flag to track if token initialization is complete

// Initialize
(function initialize() {
  console.log("Initializing background script");
  
  // Check if we have a stored token
  chrome.storage.local.get(['authToken'], function(result) {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving token:", chrome.runtime.lastError);
      tokenInitialized = true; // Mark as initialized even on error
      return;
    }
    
    if (result.authToken) {
      console.log("Found stored token");
      authToken = result.authToken;
      isAuthenticated = true;
      updateExtensionIcon();
    } else {
      console.log("No stored token found");
      isAuthenticated = false;
      updateExtensionIcon();
    }
    
    tokenInitialized = true; // Mark token initialization as complete
    console.log("Token initialization complete");
  });
})();

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Background received message:", request.action);
  
  switch (request.action) {
    case "tokenUpdated":
      handleTokenUpdated(request, sendResponse);
      break;
      
    case "checkAuth":
      handleCheckAuth(sendResponse);
      break;
      
    case "logout":
      handleLogout(sendResponse);
      break;
      
    case "startRecording":
      handleStartRecording(sendResponse);
      break;
      
    case "stopRecording":
      handleStopRecording(sendResponse);
      break;
      
    case "recordAction":
      handleRecordAction(request, sendResponse);
      break;
      
    case "getRecordedActions":
      handleGetRecordedActions(sendResponse);
      break;
      
    case "clearRecordedActions":
      handleClearRecordedActions(sendResponse);
      break;
      
    case "generateSeleniumScript":
      handleGenerateSeleniumScript(sendResponse);
      break;
      
    case "generateScript":
      handleGenerateScript(request, sendResponse);
      return true; // Keep the message channel open for async response
      
    case "saveScriptToProject":
      handleSaveScriptToProject(request, sendResponse);
      return true; // Keep the message channel open for async response
      
    case "getToken":
      handleGetToken(request, sendResponse);
      return true; // Keep the message channel open for async response
      
    default:
      console.log("Unknown action:", request.action);
      sendResponse({ success: false, error: "Unknown action" });
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

/**
 * Handle token updated message
 * @param {Object} request - The request object
 * @param {function} sendResponse - Function to send response back to popup
 */
function handleTokenUpdated(request, sendResponse) {
  console.log("Token updated");
  
  if (!request.token) {
    console.error("No token provided in token update");
    sendResponse({ success: false, error: "No token provided" });
    return;
  }
  
  // Store token in memory
  authToken = request.token;
  
  // Store token in chrome.storage.local
  chrome.storage.local.set({ authToken: request.token }, function() {
    if (chrome.runtime.lastError) {
      console.error("Error storing token:", chrome.runtime.lastError);
      sendResponse({ success: false, error: "Failed to store token" });
      return;
    }
    
    console.log("Token stored successfully");
    
    // Get user info with the token
    fetchUserInfo(request.token)
      .then(userInfo => {
        // Store user info
        chrome.storage.local.set({ userInfo: userInfo }, function() {
          if (chrome.runtime.lastError) {
            console.error("Error storing user info:", chrome.runtime.lastError);
          } else {
            console.log("User info stored successfully");
          }
          
          sendResponse({ success: true, userInfo });
        });
      })
      .catch(error => {
        console.error("Error fetching user info:", error);
        sendResponse({ success: true }); // Still consider token update successful
      });
  });
  
  // Return true to indicate we'll respond asynchronously
  return true;
}

/**
 * Fetch user info from the API
 * @param {string} token - The auth token
 * @returns {Promise} - Promise that resolves with user info
 */
function fetchUserInfo(token) {
  return fetch('http://localhost:5173/api/user/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  });
}

/**
 * Handle get token message
 * @param {Object} request - The request object
 * @param {function} sendResponse - Function to send response back to popup
 */
function handleGetToken(request, sendResponse) {
  console.log("Getting token, initialization status:", tokenInitialized);
  
  // If token initialization is not complete, wait for it
  if (!tokenInitialized) {
    console.log("Token not yet initialized, waiting...");
    // Wait for token initialization to complete (max 1 second)
    let waitCount = 0;
    const waitInterval = setInterval(() => {
      waitCount++;
      if (tokenInitialized || waitCount > 10) { // 10 * 100ms = 1 second max wait
        clearInterval(waitInterval);
        if (!tokenInitialized) {
          console.warn("Token initialization timed out");
        }
        continueTokenRetrieval();
      }
    }, 100);
  } else {
    continueTokenRetrieval();
  }
  
  function continueTokenRetrieval() {
    // First check if we have the token in memory
    if (authToken) {
      console.log("Token found in memory");
      validateToken(authToken)
        .then(isValid => {
          if (isValid) {
            sendResponse({ success: true, token: authToken });
          } else {
            // Token is invalid, try to get from storage
            getTokenFromStorage();
          }
        })
        .catch(error => {
          console.error("Error validating token:", error);
          // On validation error, try storage as fallback
          getTokenFromStorage();
        });
    } else {
      // If not in memory, try to get from storage
      getTokenFromStorage();
    }
  }
  
  function getTokenFromStorage() {
    chrome.storage.local.get(['authToken'], function(result) {
      if (chrome.runtime.lastError) {
        console.error("Error getting token from storage:", chrome.runtime.lastError);
        sendResponse({ success: false, error: "Failed to get token from storage" });
        return;
      }
      
      if (result.authToken) {
        console.log("Token found in storage");
        // Update memory token
        authToken = result.authToken;
        
        // Validate the token
        validateToken(authToken)
          .then(isValid => {
            if (isValid) {
              sendResponse({ success: true, token: authToken });
            } else {
              console.log("Token from storage is invalid");
              sendResponse({ success: false, error: "Token is invalid" });
            }
          })
          .catch(error => {
            console.error("Error validating token from storage:", error);
            // If validation fails, still return the token
            // The API call will fail if the token is truly invalid
            sendResponse({ success: true, token: authToken });
          });
      } else {
        console.log("No token found in storage");
        sendResponse({ success: false, error: "No token found" });
      }
    });
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
}

/**
 * Validate a token by making a lightweight API call
 * @param {string} token - The token to validate
 * @returns {Promise<boolean>} - Promise that resolves with whether the token is valid
 */
function validateToken(token) {
  // Simple validation - just check if the token exists and is not empty
  if (!token || token.trim() === '') {
    return Promise.resolve(false);
  }
  
  // For more thorough validation, you could make a lightweight API call
  // This is optional and can be implemented later if needed
  return Promise.resolve(true);
}

/**
 * Handle token update from web app
 * @param {string} token - The authentication token
 * @param {function} sendResponse - Function to send response
 */
function handleTokenUpdate(token, sendResponse) {
  console.log("Handling token update");
  
  if (!token) {
    console.error("No token provided");
    sendResponse({ success: false, error: "No token provided" });
    return;
  }
  
  try {
    // Store the token
    authToken = token;
    isAuthenticated = true;
    
    // Save to storage
    chrome.storage.local.set({ authToken: token }, function() {
      if (chrome.runtime.lastError) {
        console.error("Error storing token:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      console.log("Token stored successfully");
      
      // Update extension icon
      updateExtensionIcon();
      
      // Notify all tabs about the auth state change
      notifyAuthStateChanged();
      
      sendResponse({ success: true });
    });
  } catch (error) {
    console.error("Error handling token update:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle authentication check
 * @param {function} sendResponse - Function to send response
 */
function handleCheckAuth(sendResponse) {
  console.log("Handling auth check, isAuthenticated:", isAuthenticated);
  
  try {
    if (isAuthenticated && authToken) {
      // Try to extract user data from token
      let userData = null;
      try {
        // Our token is a base64-encoded JSON string, not a JWT
        const payload = JSON.parse(atob(authToken));
        userData = {
          email: payload.email || "Unknown",
          role: payload.role || "User"
        };
        console.log("Decoded user data:", userData);
      } catch (error) {
        console.error("Error decoding token:", error);
        // Token might not be in expected format
        userData = {
          email: "Error decoding token",
          role: "Unknown"
        };
      }
      
      sendResponse({
        isAuthenticated: true,
        token: authToken,
        userData: userData
      });
    } else {
      sendResponse({ isAuthenticated: false });
    }
  } catch (error) {
    console.error("Error handling auth check:", error);
    sendResponse({ isAuthenticated: false, error: error.message });
  }
}

/**
 * Handle logout
 * @param {function} sendResponse - Function to send response
 */
function handleLogout(sendResponse) {
  console.log("Handling logout");
  
  try {
    // Clear auth state
    authToken = null;
    isAuthenticated = false;
    
    // Clear from storage
    chrome.storage.local.remove('authToken', function() {
      if (chrome.runtime.lastError) {
        console.error("Error removing token:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      console.log("Token removed successfully");
      
      // Update extension icon
      updateExtensionIcon();
      
      // Notify all tabs about the auth state change
      notifyAuthStateChanged();
      
      sendResponse({ success: true });
    });
  } catch (error) {
    console.error("Error handling logout:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle start recording
 * @param {function} sendResponse - Function to send response
 */
function handleStartRecording(sendResponse) {
  console.log("Handling start recording");
  
  try {
    if (!isAuthenticated) {
      console.error("Cannot start recording: Not authenticated");
      sendResponse({ success: false, error: "Not authenticated" });
      return;
    }
    
    // Set recording state
    isRecording = true;
    
    // Clear previous recordings to ensure a fresh start
    recordedActions = [];
    console.log("Previous recorded actions cleared, starting fresh recording");
    
    // Update extension icon
    updateExtensionIcon();
    
    // Notify content scripts to start recording
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs.length > 0) {
        const activeTab = tabs[0];
        
        // Record the initial navigation action for the current tab
        recordedActions.push({
          type: 'navigate',
          locator: 'url',
          selector: '',
          value: '',
          url: activeTab.url,
          timestamp: new Date().toISOString()
        });
        
        console.log("Recorded initial navigation to:", activeTab.url);
        
        // Now notify the content script to start recording
        chrome.tabs.sendMessage(activeTab.id, { action: "startRecording" }, function(response) {
          // Ignore chrome.runtime.lastError to prevent console errors
          const error = chrome.runtime.lastError;
          if (error) {
            console.log(`Active tab does not have content script or had an error:`, error.message);
          }
        });
      }
    });
    
    // Notify popup about recording state change
    notifyPopupRecordingStateChanged();
    
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling start recording:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle stop recording
 * @param {function} sendResponse - Function to send response
 */
function handleStopRecording(sendResponse) {
  console.log("Handling stop recording");
  
  try {
    isRecording = false;
    
    // Update extension icon
    updateExtensionIcon();
    
    // Notify content scripts to stop recording
    chrome.tabs.query({}, function(tabs) {
      for (let tab of tabs) {
        try {
          chrome.tabs.sendMessage(tab.id, { action: "stopRecording" }, function(response) {
            // Ignore chrome.runtime.lastError to prevent console errors for tabs without content script
            const error = chrome.runtime.lastError;
            if (error) {
              console.log(`Tab ${tab.id} does not have content script or had an error:`, error.message);
            }
          });
        } catch (error) {
          console.error(`Error sending stopRecording to tab ${tab.id}:`, error);
        }
      }
    });
    
    // Notify popup about recording state change
    notifyPopupRecordingStateChanged();
    
    sendResponse({ 
      success: true, 
      recordedActions: recordedActions 
    });
  } catch (error) {
    console.error("Error handling stop recording:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle record action
 * @param {object} request - The request
 * @param {function} sendResponse - Function to send response
 */
function handleRecordAction(request, sendResponse) {
  console.log("Handling record action:", request.type);
  
  try {
    if (!isRecording) {
      console.error("Cannot record action: Not recording");
      sendResponse({ success: false, error: "Not recording" });
      return;
    }
    
    if (!isAuthenticated) {
      console.error("Cannot record action: Not authenticated");
      sendResponse({ success: false, error: "Not authenticated" });
      return;
    }
    
    // Skip recording navigate actions that match the initial URL
    // to avoid duplicate navigation entries
    if (request.type === 'navigate' && recordedActions.length > 0) {
      const firstAction = recordedActions[0];
      if (firstAction.type === 'navigate' && firstAction.url === request.url) {
        console.log("Skipping duplicate navigation action");
        sendResponse({ 
          success: true, 
          actionCount: recordedActions.length,
          skipped: true
        });
        return;
      }
    }
    
    // Create action object
    const action = {
      type: request.type,
      locator: request.locator,
      selector: request.selector,
      value: request.value || '',
      timestamp: new Date().toISOString(),
      url: request.url || ''
    };
    
    // Add action to recorded actions
    recordedActions.push(action);
    console.log(`Action recorded. Total actions: ${recordedActions.length}`);
    
    // Notify popup about the change
    notifyPopupRecordingStateChanged();
    
    sendResponse({ 
      success: true, 
      actionCount: recordedActions.length 
    });
  } catch (error) {
    console.error("Error handling record action:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle get recorded actions
 * @param {function} sendResponse - Function to send response
 */
function handleGetRecordedActions(sendResponse) {
  console.log("Handling get recorded actions");
  
  try {
    sendResponse({
      success: true,
      isRecording: isRecording,
      recordedActions: recordedActions
    });
  } catch (error) {
    console.error("Error handling get recorded actions:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle clear recorded actions
 * @param {function} sendResponse - Function to send response
 */
function handleClearRecordedActions(sendResponse) {
  console.log("Handling clear recorded actions");
  
  try {
    // Clear recorded actions array by creating a new empty array
    recordedActions = [];
    console.log("Recorded actions cleared, new length:", recordedActions.length);
    
    // Notify popup about the change
    notifyPopupRecordingStateChanged();
    
    // Also notify all content scripts to clear their state
    chrome.tabs.query({}, function(tabs) {
      for (let tab of tabs) {
        try {
          chrome.tabs.sendMessage(tab.id, { action: "clearRecording" }, function(response) {
            // Ignore chrome.runtime.lastError to prevent console errors for tabs without content script
            const error = chrome.runtime.lastError;
          });
        } catch (error) {
          console.error(`Error sending clearRecording to tab ${tab.id}:`, error);
        }
      }
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling clear recorded actions:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle generate Selenium script
 * @param {function} sendResponse - Function to send response
 */
function handleGenerateSeleniumScript(sendResponse) {
  console.log("Handling generate Selenium script");
  
  try {
    const script = generateSeleniumScript();
    sendResponse({ success: true, script: script });
  } catch (error) {
    console.error("Error handling generate Selenium script:", error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Generate Selenium script from recorded actions
 * @returns {string} The generated script
 */
function generateSeleniumScript() {
  console.log("Generating Selenium script from recorded actions:", recordedActions);
  
  if (!recordedActions || recordedActions.length === 0) {
    return "# No actions recorded yet\n";
  }
  
  // Generate Python script for Selenium
  let script = `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.common.keys import Keys\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nimport time\n\n`;
  script += `# Setup Chrome driver\ndriver = webdriver.Chrome()\n\n`;
  
  // Get the URL of the first navigation action, if any
  const firstNavAction = recordedActions.find(action => action.type === 'navigate');
  if (firstNavAction) {
    script += `# Navigate to the starting URL\ndriver.get('${firstNavAction.url}')\n\n`;
  } else {
    script += `# Navigate to your test URL\ndriver.get('YOUR_TEST_URL')\n\n`;
  }
  
  script += `# Set implicit wait time\ndriver.implicitly_wait(10)\n\n`;
  script += `# Start of recorded actions\n`;
  
  // Add actions
  for (const action of recordedActions) {
    if (action.type === 'navigate') {
      // Skip the initial navigation as we've already added it
      continue;
    }
    
    switch (action.type) {
      case 'click':
        script += `# Click on element\ntry:\n`;
        script += `    element = WebDriverWait(driver, 10).until(\n`;
        script += `        EC.element_to_be_clickable((By.CSS_SELECTOR, '${action.selector}'))\n`;
        script += `    )\n`;
        script += `    element.click()\n`;
        script += `except Exception as e:\n`;
        script += `    print(f"Error clicking element: {e}")\n`;
        break;
        
      case 'doubleClick':
        script += `# Double click on element\ntry:\n`;
        script += `    from selenium.webdriver.common.action_chains import ActionChains\n`;
        script += `    element = WebDriverWait(driver, 10).until(\n`;
        script += `        EC.element_to_be_clickable((By.CSS_SELECTOR, '${action.selector}'))\n`;
        script += `    )\n`;
        script += `    ActionChains(driver).double_click(element).perform()\n`;
        script += `except Exception as e:\n`;
        script += `    print(f"Error double-clicking element: {e}")\n`;
        break;
        
      case 'input':
        script += `# Input text\ntry:\n`;
        script += `    element = WebDriverWait(driver, 10).until(\n`;
        script += `        EC.presence_of_element_located((By.CSS_SELECTOR, '${action.selector}'))\n`;
        script += `    )\n`;
        script += `    element.clear()\n`;
        script += `    element.send_keys('${action.value}')\n`;
        script += `except Exception as e:\n`;
        script += `    print(f"Error inputting text: {e}")\n`;
        break;
    }
    
    // Add a small delay between actions for stability
    script += `time.sleep(0.5)\n\n`;
  }
  
  // Add closing code
  script += `# End of test\nprint("Test completed successfully")\n\n`;
  script += `# Close the browser\n# driver.quit()\n`;
  
  return script;
}

/**
 * Generate a script from recorded actions and save it to a project file
 * @param {Object} request - The request object containing projectId and fileId
 * @param {function} sendResponse - Function to send response back to popup
 */
function handleGenerateScript(request, sendResponse) {
  console.log("Generating script for project:", request.projectId, "file:", request.fileId);
  
  // Check if we have recorded actions
  if (!recordedActions || recordedActions.length === 0) {
    sendResponse({ success: false, error: "No actions recorded" });
    return;
  }
  
  // Generate the script
  const script = generateSeleniumScript(recordedActions);
  
  // Store the script with project and file info for later saving
  currentScript = {
    content: script,
    projectId: request.projectId,
    fileId: request.fileId
  };
  
  sendResponse({ success: true, script: script });
}

/**
 * Save the generated script to a project file
 * @param {Object} request - The request object containing projectId, fileId, and scriptContent
 * @param {function} sendResponse - Function to send response back to popup
 */
function handleSaveScriptToProject(request, sendResponse) {
  console.log("Saving script to project:", request.projectId, "file:", request.fileId);
  
  // Use the stored token directly
  if (!authToken) {
    console.error("No auth token available");
    sendResponse({ success: false, error: "Not authenticated" });
    return;
  }
  
  // Make API request to save the script to the project file
  fetch(`http://localhost:5173/api/projects/${request.projectId}/files/${request.fileId}/content`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: request.scriptContent })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Script saved successfully:", data);
    sendResponse({ success: true });
  })
  .catch(error => {
    console.error("Error saving script:", error);
    sendResponse({ success: false, error: error.message });
  });
  
  // Return true to indicate we'll send the response asynchronously
  return true;
}

/**
 * Generate a Selenium script from recorded actions
 * @param {Array} actions - The recorded actions
 * @returns {string} - The generated Selenium script
 */
function generateSeleniumScript(actions) {
  // Start with the script template
  let script = `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time

# Initialize the WebDriver
driver = webdriver.Chrome()

try:
`;
  
  // Add each action to the script
  actions.forEach((action, index) => {
    script += `    # Action ${index + 1}: ${action.type} on ${action.selector}\n`;
    
    // Handle different action types
    switch (action.type) {
      case 'navigate':
        script += `    driver.get("${action.url}")\n`;
        break;
        
      case 'click':
        script += `    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "${action.selector}"))
    )
    element.click()\n`;
        break;
        
      case 'doubleClick':
        script += `    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "${action.selector}"))
    )
    ActionChains(driver).double_click(element).perform()\n`;
        break;
        
      case 'input':
        script += `    element = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "${action.selector}"))
    )
    element.clear()
    element.send_keys("${action.value}")\n`;
        break;
    }
    
    script += `    time.sleep(0.5)  # Wait for action to complete\n\n`;
  });
  
  // Add the closing template
  script += `    # Script completed successfully
    print("Test completed successfully!")
    
except Exception as e:
    print(f"An error occurred: {e}")
    
finally:
    # Close the browser
    driver.quit()
`;
  
  return script;
}

/**
 * Notify popup about a new recorded action
 * @param {object} action - The recorded action
 */
function notifyPopupActionRecorded(action) {
  try {
    chrome.runtime.sendMessage({
      action: "actionRecorded",
      lastAction: action,
      actionCount: recordedActions.length
    }, function(response) {
      // Ignore chrome.runtime.lastError to prevent console errors when popup is not open
      const error = chrome.runtime.lastError;
    });
  } catch (error) {
    console.error("Error notifying popup about recorded action:", error);
  }
}

/**
 * Notify popup about recording state change
 */
function notifyPopupRecordingStateChanged() {
  try {
    chrome.runtime.sendMessage({
      action: "recordingStateChanged",
      isRecording: isRecording,
      recordedActions: recordedActions
    }, function(response) {
      // Ignore chrome.runtime.lastError to prevent console errors when popup is not open
      const error = chrome.runtime.lastError;
    });
  } catch (error) {
    console.error("Error notifying popup about recording state change:", error);
  }
}

/**
 * Update extension icon based on current state
 */
function updateExtensionIcon() {
  console.log("Updating extension icon");
  
  try {
    let iconPath;
    
    if (!isAuthenticated) {
      // Not authenticated
      iconPath = {
        16: "icons/icon16_disabled.png",
        48: "icons/icon48_disabled.png",
        128: "icons/icon128_disabled.png"
      };
    } else if (isRecording) {
      // Authenticated and recording
      iconPath = {
        16: "icons/icon16_recording.png",
        48: "icons/icon48_recording.png",
        128: "icons/icon128_recording.png"
      };
    } else {
      // Authenticated but not recording
      iconPath = {
        16: "icons/icon16.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png"
      };
    }
    
    chrome.action.setIcon({ path: iconPath });
  } catch (error) {
    console.error("Error updating extension icon:", error);
  }
}

/**
 * Notify all tabs about authentication state change
 */
function notifyAuthStateChanged() {
  console.log("Notifying tabs about auth state change");
  
  try {
    // Extract user data from token if authenticated
    let userData = null;
    
    if (isAuthenticated && authToken) {
      try {
        // Our token is a base64-encoded JSON string, not a JWT
        const payload = JSON.parse(atob(authToken));
        userData = {
          email: payload.email || "Unknown",
          role: payload.role || "User"
        };
      } catch (error) {
        console.error("Error decoding token for notification:", error);
      }
    }
    
    // Send message to all tabs
    chrome.tabs.query({}, function(tabs) {
      for (let tab of tabs) {
        try {
          chrome.tabs.sendMessage(tab.id, {
            action: "authStateChanged",
            isAuthenticated: isAuthenticated,
            userData: userData
          }, function(response) {
            // Ignore chrome.runtime.lastError to prevent console errors for tabs without content script
            const error = chrome.runtime.lastError;
            if (error) {
              console.log(`Tab ${tab.id} does not have content script or had an error:`, error.message);
            }
          });
        } catch (error) {
          console.error(`Error notifying tab ${tab.id}:`, error);
        }
      }
    });
  } catch (error) {
    console.error("Error notifying auth state change:", error);
  }
}
