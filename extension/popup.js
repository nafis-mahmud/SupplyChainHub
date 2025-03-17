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
    const startRecordingButton = document.getElementById('start-recording');
    if (startRecordingButton) {
      startRecordingButton.addEventListener('click', startRecording);
    } else {
      console.error("Start recording button not found");
    }
    
    // Stop recording button
    const stopRecordingButton = document.getElementById('stop-recording');
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
    try {
      if (response.token) {
        // Our token is a simple base64-encoded JSON string, not a JWT
        const payload = JSON.parse(atob(response.token));
        
        console.log("Decoded token payload:", payload);
        
        // Update user info
        const userEmail = document.getElementById('user-email');
        if (userEmail && payload.email) {
          userEmail.textContent = payload.email;
        } else if (userEmail) {
          userEmail.textContent = "Unknown";
        }
        
        const userRole = document.getElementById('user-role');
        if (userRole && payload.role) {
          userRole.textContent = payload.role;
        } else if (userRole) {
          userRole.textContent = "User";
        }
      } else if (response.userData) {
        // If token couldn't be decoded but userData is provided, use that
        const userEmail = document.getElementById('user-email');
        if (userEmail) {
          userEmail.textContent = response.userData.email || "Unknown";
        }
        
        const userRole = document.getElementById('user-role');
        if (userRole) {
          userRole.textContent = response.userData.role || "User";
        }
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      // Continue anyway, just won't show user info
      showNotification("Could not display user info", true);
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
    const startRecordingButton = document.getElementById('start-recording');
    const stopRecordingButton = document.getElementById('stop-recording');
    
    if (startRecordingButton) {
      startRecordingButton.disabled = isRecording;
    }
    
    if (stopRecordingButton) {
      stopRecordingButton.disabled = !isRecording;
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
    chrome.runtime.sendMessage({ action: "startRecording" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error starting recording:", chrome.runtime.lastError);
        showError("Failed to start recording");
        return;
      }
      
      if (response && response.success) {
        updateRecordingUI(true, []);
        showNotification("Recording started");
      } else {
        showError("Failed to start recording");
      }
    });
  } catch (error) {
    console.error("Error in startRecording:", error);
    showError("Failed to start recording");
  }
}

/**
 * Stop recording
 */
function stopRecording() {
  console.log("Stopping recording");
  
  try {
    chrome.runtime.sendMessage({ action: "stopRecording" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error stopping recording:", chrome.runtime.lastError);
        showError("Failed to stop recording");
        return;
      }
      
      if (response && response.success) {
        updateRecordingUI(false, response.recordedActions || []);
        showNotification("Recording stopped");
      } else {
        showError("Failed to stop recording");
      }
    });
  } catch (error) {
    console.error("Error in stopRecording:", error);
    showError("Failed to stop recording");
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
  console.log("Clearing recording");
  
  try {
    chrome.runtime.sendMessage({ action: "clearRecordedActions" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error clearing recorded actions:", chrome.runtime.lastError);
        showError("Failed to clear recording");
        return;
      }
      
      if (response && response.success) {
        updateRecordingUI(false, []);
        showNotification("Recording cleared");
      } else {
        showError("Failed to clear recording");
      }
    });
  } catch (error) {
    console.error("Error in clearRecording:", error);
    showError("Failed to clear recording");
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

// Listen for authentication state changes from background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "authStateChanged") {
    console.log("Auth state changed:", request.isAuthenticated);
    
    // Get the elements (they might not be available if popup is not open)
    const authSection = document.getElementById('auth-section');
    const recordingSection = document.getElementById('recording-section');
    const userInfoSection = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const userRole = document.getElementById('user-role');
    
    // Update UI based on authentication state
    if (request.isAuthenticated) {
      // Show authenticated UI
      if (authSection) {
        authSection.style.display = 'none';
      }
      
      // Display user info
      if (userEmail) {
        userEmail.textContent = request.userData?.email || "Unknown";
      }
      
      if (userRole) {
        userRole.textContent = request.userData?.role || "User";
      }
      
      // Show/hide appropriate views
      if (recordingSection) recordingSection.style.display = 'block';
      if (userInfoSection) userInfoSection.style.display = 'block';
    } else {
      // Show unauthenticated UI
      if (authSection) {
        authSection.style.display = 'block';
      }
      
      // Show/hide appropriate views
      if (recordingSection) recordingSection.style.display = 'none';
      if (userInfoSection) userInfoSection.style.display = 'none';
    }
  }
});
