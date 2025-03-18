// background.js - Background script for the extension

console.log("SupplyChainHub Interaction Recorder background script loaded");

// State
let isAuthenticated = false;
let authToken = null;
let isRecording = false;
let recordedActions = [];

// Initialize
(function initialize() {
  console.log("Initializing background script");
  
  // Check if we have a stored token
  chrome.storage.local.get(['authToken'], function(result) {
    if (chrome.runtime.lastError) {
      console.error("Error retrieving token:", chrome.runtime.lastError);
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
  });
})();

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Background received message:", request.action);
  
  switch (request.action) {
    case "tokenUpdated":
      handleTokenUpdate(request.token, sendResponse);
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
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});

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
    chrome.tabs.query({}, function(tabs) {
      for (let tab of tabs) {
        try {
          chrome.tabs.sendMessage(tab.id, { action: "startRecording" }, function(response) {
            // Ignore chrome.runtime.lastError to prevent console errors for tabs without content script
            const error = chrome.runtime.lastError;
            if (error) {
              console.log(`Tab ${tab.id} does not have content script or had an error:`, error.message);
            }
          });
        } catch (error) {
          console.error(`Error sending startRecording to tab ${tab.id}:`, error);
        }
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
 * @param {object} request - The request object
 * @param {function} sendResponse - Function to send response
 */
function handleRecordAction(request, sendResponse) {
  console.log("Handling record action:", request);
  
  try {
    if (!isRecording) {
      console.warn("Received action but not recording");
      sendResponse({ success: false, error: "Not recording" });
      return;
    }
    
    // Add timestamp and additional metadata
    const action = {
      type: request.type,
      locator: request.locator,
      selector: request.selector,
      value: request.value,
      timestamp: new Date().toISOString(),
      url: request.url || "unknown"
    };
    
    // Add to recorded actions
    recordedActions.push(action);
    
    console.log(`Recorded action: ${action.type} on ${action.selector}. Total actions: ${recordedActions.length}`);
    
    // Update extension icon to show recording is active
    updateExtensionIcon();
    
    // Notify popup about the new action
    notifyPopupActionRecorded(action);
    
    sendResponse({ 
      success: true, 
      actionCount: recordedActions.length,
      lastAction: action
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
    // Clear recorded actions array
    recordedActions = [];
    console.log("Recorded actions cleared, new length:", recordedActions.length);
    
    // Notify popup about the change
    notifyPopupRecordingStateChanged();
    
    sendResponse({ success: true });
  } catch (error) {
    console.error("Error handling clear recorded actions:", error);
    sendResponse({ success: false, error: error.message });
  }
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
