// popup.js - Handles the extension popup UI

document.addEventListener('DOMContentLoaded', function() {
  console.log("Popup DOM loaded");
  
  // Initialize the popup UI
  initializePopup();
});

/**
 * Initialize the popup UI
 */
function initializePopup() {
  console.log("Initializing popup");
  
  try {
    // Set up UI elements
    setupUIElements();
    
    // Check authentication status
    checkAuthStatus();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error("Error initializing popup:", error);
    showError("Failed to initialize popup");
  }
}

/**
 * Set up UI elements
 */
function setupUIElements() {
  console.log("Setting up UI elements");
  
  try {
    // Get UI sections
    const authSection = document.getElementById('auth-section');
    const recordingSection = document.getElementById('recording-section');
    const userInfoSection = document.getElementById('user-info');
    const notification = document.getElementById('notification');
    const errorMessage = document.getElementById('error-message');
    
    if (!authSection) {
      console.error("Auth section not found");
    }
    
    if (!recordingSection) {
      console.error("Recording section not found");
    }
    
    if (!userInfoSection) {
      console.error("User info section not found");
    }
    
    if (!notification) {
      console.error("Notification element not found");
    }
    
    if (!errorMessage) {
      console.error("Error message element not found");
    }
    
    // Initially hide recording section and user info
    if (recordingSection) recordingSection.style.display = 'none';
    if (userInfoSection) userInfoSection.style.display = 'none';
    
    // Clear any notifications
    if (notification) notification.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
  } catch (error) {
    console.error("Error setting up UI elements:", error);
    // Don't call showError here to avoid infinite loop if error elements don't exist
    console.error("Failed to set up UI:", error);
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  console.log("Setting up event listeners");
  
  try {
    // Login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.addEventListener('click', navigateToLogin);
    } else {
      console.error("Login button not found");
    }
    
    // Logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    } else {
      console.error("Logout button not found");
    }
    
    // Start recording button
    const startRecordingButton = document.getElementById('start-recording-button');
    if (startRecordingButton) {
      startRecordingButton.addEventListener('click', startRecording);
    } else {
      console.error("Start recording button not found");
    }
    
    // Stop recording button
    const stopRecordingButton = document.getElementById('stop-recording-button');
    if (stopRecordingButton) {
      stopRecordingButton.addEventListener('click', stopRecording);
    } else {
      console.error("Stop recording button not found");
    }
    
    // Generate script button
    const generateScriptButton = document.getElementById('generate-script');
    if (generateScriptButton) {
      generateScriptButton.addEventListener('click', generateScript);
    } else {
      console.error("Generate script button not found");
    }
    
    // Clear recording button
    const clearRecordingButton = document.getElementById('clear-recording');
    if (clearRecordingButton) {
      clearRecordingButton.addEventListener('click', clearRecording);
    } else {
      console.error("Clear recording button not found");
    }
  } catch (error) {
    console.error("Error setting up event listeners:", error);
    showError("Failed to set up event handlers");
  }
}

/**
 * Check authentication status
 */
function checkAuthStatus() {
  console.log("Checking authentication status");
  
  try {
    chrome.runtime.sendMessage({ action: "checkAuth" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error checking auth status:", chrome.runtime.lastError);
        showError("Failed to check authentication status");
        updateUIForUnauthenticated();
        return;
      }
      
      console.log("Auth status response:", response);
      
      if (response && response.isAuthenticated) {
        updateUIForAuthenticated(response);
      } else {
        updateUIForUnauthenticated();
      }
    });
  } catch (error) {
    console.error("Error in checkAuthStatus:", error);
    showError("Failed to check authentication");
    updateUIForUnauthenticated();
  }
}

/**
 * Update UI for authenticated user
 * @param {object} response - The authentication response
 */
function updateUIForAuthenticated(response) {
  console.log("Updating UI for authenticated user");
  
  try {
    // Show/hide sections
    const authSection = document.getElementById('auth-section');
    const recordingSection = document.getElementById('recording-section');
    const userInfoSection = document.getElementById('user-info');
    
    if (authSection) authSection.style.display = 'none';
    if (recordingSection) recordingSection.style.display = 'block';
    if (userInfoSection) userInfoSection.style.display = 'block';
    
    // Try to decode the token to get user info
    if (response.token) {
      updateUserInfoFromToken(response.token);
    } else if (response.userData) {
      // If token couldn't be decoded but userData is provided, use that
      updateUserInfo(response.userData);
    }
    
    // Check recording status
    checkRecordingStatus();
  } catch (error) {
    console.error("Error updating UI for authenticated user:", error);
    showError("Failed to update UI");
  }
}

/**
 * Update UI for unauthenticated user
 */
function updateUIForUnauthenticated() {
  console.log("Updating UI for unauthenticated user");
  
  try {
    // Show/hide sections
    const authSection = document.getElementById('auth-section');
    const recordingSection = document.getElementById('recording-section');
    const userInfoSection = document.getElementById('user-info');
    
    if (authSection) authSection.style.display = 'block';
    if (recordingSection) recordingSection.style.display = 'none';
    if (userInfoSection) userInfoSection.style.display = 'none';
  } catch (error) {
    console.error("Error updating UI for unauthenticated user:", error);
    showError("Failed to update UI");
  }
}

/**
 * Navigate to login page
 */
function navigateToLogin() {
  try {
    chrome.tabs.create({url: "http://localhost:5174/login"}, function(tab) {
      if (chrome.runtime.lastError) {
        console.error("Error opening login page:", chrome.runtime.lastError);
        showNotification("Error opening login page");
      }
    });
  } catch (error) {
    console.error("Error navigating to login:", error);
    showError("Failed to open login page");
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  console.log("Handling logout");
  
  try {
    chrome.runtime.sendMessage({ action: "logout" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error logging out:", chrome.runtime.lastError);
        showError("Failed to log out");
        return;
      }
      
      console.log("Logout response:", response);
      
      if (response && response.success) {
        updateUIForUnauthenticated();
        showNotification("Logged out successfully");
      } else {
        showError("Failed to log out");
      }
    });
  } catch (error) {
    console.error("Error in handleLogout:", error);
    showError("Failed to log out");
  }
}

/**
 * Check recording status
 */
function checkRecordingStatus() {
  console.log("Checking recording status");
  
  try {
    chrome.runtime.sendMessage({ action: "getRecordedActions" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error checking recording status:", chrome.runtime.lastError);
        return;
      }
      
      console.log("Recording status response:", response);
      
      if (response && response.success) {
        updateRecordingUI(response.isRecording, response.recordedActions);
      }
    });
  } catch (error) {
    console.error("Error in checkRecordingStatus:", error);
  }
}

/**
 * Update recording UI
 * @param {boolean} isRecording - Whether recording is active
 * @param {Array} recordedActions - List of recorded actions
 */
function updateRecordingUI(isRecording, recordedActions) {
  console.log("Updating recording UI:", { isRecording, actionCount: recordedActions.length });
  
  try {
    // Update recording status
    const recordingStatus = document.getElementById('recording-status');
    if (recordingStatus) {
      recordingStatus.textContent = isRecording ? "Recording..." : "Not recording";
      recordingStatus.className = isRecording ? "status-recording" : "status-not-recording";
    }
    
    // Update action count
    const actionCount = document.getElementById('action-count');
    if (actionCount) {
      actionCount.textContent = recordedActions.length.toString();
    }
    
    // Update buttons
    const startRecordingButton = document.getElementById('start-recording-button');
    const stopRecordingButton = document.getElementById('stop-recording-button');
    
    if (startRecordingButton) {
      startRecordingButton.disabled = isRecording;
    }
    
    if (stopRecordingButton) {
      stopRecordingButton.disabled = !isRecording;
    }
    
    // Update live action panel
    if (recordedActions.length > 0) {
      recordedActions.forEach(action => {
        updateLiveActionPanel(action);
      });
    } else {
      clearLiveActionPanel();
    }
  } catch (error) {
    console.error("Error updating recording UI:", error);
  }
}

/**
 * Start recording
 */
function startRecording() {
  console.log("Starting recording");
  
  try {
    // Disable start button and enable stop button
    const startButton = document.getElementById('start-recording-button');
    const stopButton = document.getElementById('stop-recording-button');
    
    if (startButton) startButton.disabled = true;
    if (stopButton) stopButton.disabled = false;
    
    // Update status
    const statusElement = document.getElementById('recording-status');
    if (statusElement) {
      statusElement.textContent = "Recording";
      statusElement.className = "status-recording";
    }
    
    // Clear the action count
    const actionCountElement = document.getElementById('action-count');
    if (actionCountElement) {
      actionCountElement.textContent = "0";
    }
    
    // Clear the live action panel to start fresh
    clearLiveActionPanel();
    
    // Show notification
    showNotification("Recording started. Interact with the web page to record actions.");
    
    // Send message to background script
    chrome.runtime.sendMessage({ action: "startRecording" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error starting recording:", chrome.runtime.lastError);
        showError("Error starting recording: " + chrome.runtime.lastError.message);
        
        // Reset UI
        if (startButton) startButton.disabled = false;
        if (stopButton) stopButton.disabled = true;
        if (statusElement) {
          statusElement.textContent = "Not recording";
          statusElement.className = "status-not-recording";
        }
        return;
      }
      
      console.log("Start recording response:", response);
      
      if (response && response.success) {
        console.log("Recording started successfully");
      } else {
        console.error("Failed to start recording:", response ? response.error : "Unknown error");
        showError("Failed to start recording: " + (response ? response.error : "Unknown error"));
        
        // Reset UI
        if (startButton) startButton.disabled = false;
        if (stopButton) stopButton.disabled = true;
        if (statusElement) {
          statusElement.textContent = "Not recording";
          statusElement.className = "status-not-recording";
        }
      }
    });
  } catch (error) {
    console.error("Error in startRecording:", error);
    showError("Error starting recording: " + error.message);
  }
}

/**
 * Stop recording
 */
function stopRecording() {
  console.log("Stopping recording");
  
  try {
    // Disable the stop button and show loading state
    const startRecordingButton = document.getElementById('start-recording-button');
    const stopRecordingButton = document.getElementById('stop-recording-button');
    
    if (stopRecordingButton) stopRecordingButton.disabled = true;
    
    showNotification("Stopping recording...");
    
    chrome.runtime.sendMessage({ action: "stopRecording" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error stopping recording:", chrome.runtime.lastError);
        showError("Failed to stop recording: " + chrome.runtime.lastError.message);
        
        // Re-enable stop button
        if (stopRecordingButton) stopRecordingButton.disabled = false;
        return;
      }
      
      console.log("Stop recording response:", response);
      
      if (response && response.success) {
        const actions = response.recordedActions || [];
        console.log("Recorded actions:", actions);
        
        updateRecordingUI(false, actions);
        showNotification(`Recording stopped. ${actions.length} actions recorded.`);
        
        // Re-enable start button
        if (startRecordingButton) startRecordingButton.disabled = false;
      } else {
        const errorMsg = response && response.error ? response.error : "Unknown error";
        showError("Failed to stop recording: " + errorMsg);
        
        // Re-enable stop button
        if (stopRecordingButton) stopRecordingButton.disabled = false;
      }
    });
  } catch (error) {
    console.error("Error in stopRecording:", error);
    showError("Failed to stop recording: " + error.message);
    
    // Re-enable stop button
    const stopRecordingButton = document.getElementById('stop-recording-button');
    if (stopRecordingButton) stopRecordingButton.disabled = false;
  }
}

/**
 * Generate script from recorded actions
 */
function generateScript() {
  console.log("Generating script");
  
  try {
    chrome.runtime.sendMessage({ action: "getRecordedActions" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error getting recorded actions:", chrome.runtime.lastError);
        showError("Failed to generate script");
        return;
      }
      
      if (response && response.success) {
        if (response.recordedActions && response.recordedActions.length > 0) {
          // For now, just show a notification
          showNotification(`Generated script with ${response.recordedActions.length} actions`);
          
          // In a real implementation, we would generate and download the script
          // or show it in a modal
        } else {
          showNotification("No actions recorded yet");
        }
      } else {
        showError("Failed to generate script");
      }
    });
  } catch (error) {
    console.error("Error in generateScript:", error);
    showError("Failed to generate script");
  }
}

/**
 * Clear recorded actions
 */
function clearRecording() {
  console.log("Clearing recorded actions");
  
  try {
    // Send message to background script
    chrome.runtime.sendMessage({ action: "clearRecordedActions" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error clearing recording:", chrome.runtime.lastError);
        showError("Error clearing recording: " + chrome.runtime.lastError.message);
        return;
      }
      
      console.log("Clear recording response:", response);
      
      if (response && response.success) {
        console.log("Recording cleared successfully");
        showNotification("Recording cleared successfully.");
        
        // Update action count
        const actionCountElement = document.getElementById('action-count');
        if (actionCountElement) {
          actionCountElement.textContent = "0";
        }
        
        // Clear live action panel
        clearLiveActionPanel();
      } else {
        console.error("Failed to clear recording:", response ? response.error : "Unknown error");
        showError("Failed to clear recording: " + (response ? response.error : "Unknown error"));
      }
    });
  } catch (error) {
    console.error("Error in clearRecording:", error);
    showError("Error clearing recording: " + error.message);
  }
}

/**
 * Update user info from token
 * @param {string} token - The token
 */
function updateUserInfoFromToken(token) {
  try {
    // Our token is a base64-encoded JSON string, not a JWT
    const payload = JSON.parse(atob(token));
    
    // Update user info
    updateUserInfo({
      email: payload.email || "Unknown",
      role: payload.role || "User"
    });
    
    return true;
  } catch (error) {
    console.error("Error decoding token:", error);
    updateUserInfo({
      email: "Error decoding token",
      role: "Unknown"
    });
    return false;
  }
}

/**
 * Show error message
 * @param {string} message - The error message
 */
function showError(message) {
  console.error("Error:", message);
  
  try {
    // Show error in UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Hide after 5 seconds
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
    
    // Also show as notification
    showNotification(message, true);
  } catch (error) {
    console.error("Error showing error message:", error);
  }
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {boolean} isError - Whether this is an error notification
 */
function showNotification(message, isError = false) {
  console.log("Showing notification:", message);
  
  try {
    // Show notification in UI
    const notificationElement = document.getElementById('notification');
    if (notificationElement) {
      notificationElement.textContent = message;
      notificationElement.className = isError ? 'notification error' : 'notification';
      notificationElement.style.display = 'block';
      
      // Hide after 3 seconds
      setTimeout(() => {
        notificationElement.style.display = 'none';
      }, 3000);
    }
  } catch (error) {
    console.error("Error showing notification:", error);
  }
}

/**
 * Update user info
 * @param {object} userData - The user data
 */
function updateUserInfo(userData) {
  console.log("Updating user info:", userData);
  
  try {
    // Update user info
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
      userEmail.textContent = userData.email || "Unknown";
    }
    
    const userRole = document.getElementById('user-role');
    if (userRole) {
      userRole.textContent = userData.role || "User";
    }
  } catch (error) {
    console.error("Error updating user info:", error);
  }
}

/**
 * Update the live action panel with a new action
 * @param {object} action - The recorded action
 */
function updateLiveActionPanel(action) {
  console.log("Updating live action panel with action:", action);
  
  try {
    const liveActionsPanel = document.getElementById('live-actions-panel');
    if (!liveActionsPanel) return;
    
    // Remove empty message if it exists
    const emptyMessage = liveActionsPanel.querySelector('.empty-message');
    if (emptyMessage) {
      liveActionsPanel.removeChild(emptyMessage);
    }
    
    // Create action element
    const actionElement = document.createElement('div');
    actionElement.className = 'action-item';
    
    // Format timestamp
    let timestamp = '';
    try {
      const date = new Date(action.timestamp);
      timestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (error) {
      timestamp = 'Unknown time';
    }
    
    // Format action text based on type
    let actionText = '';
    switch (action.type) {
      case 'click':
        actionText = `Clicked on ${action.selector}`;
        break;
      case 'input':
        actionText = `Entered text in ${action.selector}: "${action.value.substring(0, 20)}${action.value.length > 20 ? '...' : ''}"`;
        break;
      case 'select':
        actionText = `Selected option in ${action.selector}: "${action.value}"`;
        break;
      case 'navigate':
        actionText = `Navigated to ${action.value || action.url}`;
        break;
      default:
        actionText = `${action.type} on ${action.selector}`;
    }
    
    // Create HTML content
    actionElement.innerHTML = `
      <div class="action-header">
        <span class="action-type">${action.type}</span>
        <span class="action-time">${timestamp}</span>
      </div>
      <div class="action-details">${actionText}</div>
    `;
    
    // Add to panel (at the top)
    if (liveActionsPanel.firstChild) {
      liveActionsPanel.insertBefore(actionElement, liveActionsPanel.firstChild);
    } else {
      liveActionsPanel.appendChild(actionElement);
    }
    
    // Limit to 10 most recent actions
    const actionItems = liveActionsPanel.querySelectorAll('.action-item');
    if (actionItems.length > 10) {
      liveActionsPanel.removeChild(actionItems[actionItems.length - 1]);
    }
  } catch (error) {
    console.error("Error updating live action panel:", error);
  }
}

/**
 * Clear the live action panel
 */
function clearLiveActionPanel() {
  console.log("Clearing live action panel");
  
  try {
    const liveActionsPanel = document.getElementById('live-actions-panel');
    if (!liveActionsPanel) return;
    
    // Clear all action items
    liveActionsPanel.innerHTML = '<div class="empty-message">No actions recorded yet</div>';
  } catch (error) {
    console.error("Error clearing live action panel:", error);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Popup received message:", request.action);
  
  if (request.action === "authStateChanged") {
    console.log("Auth state changed:", request.isAuthenticated);
    
    // Update UI based on new auth state
    isAuthenticated = request.isAuthenticated;
    updateUIForAuthState(isAuthenticated);
    
    if (isAuthenticated && request.userData) {
      updateUserInfo(request.userData);
    }
    
    sendResponse({ success: true });
  } else if (request.action === "recordingStateChanged") {
    console.log("Recording state changed:", request.isRecording);
    
    // Update UI based on new recording state
    isRecording = request.isRecording;
    updateRecordingUI(isRecording, request.recordedActions || []);
    
    sendResponse({ success: true });
  } else if (request.action === "actionRecorded") {
    console.log("New action recorded:", request.action);
    
    // Update action count
    const actionCountElement = document.getElementById('action-count');
    if (actionCountElement && request.actionCount) {
      actionCountElement.textContent = request.actionCount;
    }
    
    // Update live action panel with the new action
    if (request.lastAction) {
      updateLiveActionPanel(request.lastAction);
    }
    
    sendResponse({ success: true });
  }
  
  // Return true to indicate we'll respond asynchronously
  return true;
});
