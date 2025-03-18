// popup.js - Handles the extension popup UI

document.addEventListener('DOMContentLoaded', function() {
  console.log("Popup DOM loaded");
  
  // Get DOM elements
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const startRecordingButton = document.getElementById('start-recording-button');
  const stopRecordingButton = document.getElementById('stop-recording-button');
  const clearRecordingButton = document.getElementById('clear-recording');
  const generateScriptButton = document.getElementById('generate-script');
  const saveToProjectButton = document.getElementById('save-to-project');
  const projectDropdown = document.getElementById('projectDropdown');
  const fileDropdown = document.getElementById('fileDropdown');
  
  // Initialize UI state
  initializePopup();
  
  // Add event listeners
  if (loginButton) loginButton.addEventListener('click', navigateToLogin);
  if (logoutButton) logoutButton.addEventListener('click', handleLogout);
  if (startRecordingButton) startRecordingButton.addEventListener('click', startRecording);
  if (stopRecordingButton) stopRecordingButton.addEventListener('click', stopRecording);
  if (clearRecordingButton) clearRecordingButton.addEventListener('click', clearRecording);
  if (generateScriptButton) generateScriptButton.addEventListener('click', handleGenerateScript);
  if (saveToProjectButton) saveToProjectButton.addEventListener('click', handleSaveScriptToProject);
  if (projectDropdown) projectDropdown.addEventListener('change', handleProjectChange);
  
  // Fetch projects when popup opens
  if (projectDropdown) {
    fetchProjects();
  }
  
  // Check for authentication status
  checkAuthStatus();
});

/**
 * Initialize the popup UI
 */
function initializePopup() {
  console.log("Initializing popup");
  
  try {
    // Set up UI elements
    setupUIElements();
    
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
    const projectDropdown = document.getElementById('projectDropdown');
    const fileDropdown = document.getElementById('fileDropdown');
    
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
    
    if (!projectDropdown) {
      console.error("Project dropdown not found");
    }
    
    if (!fileDropdown) {
      console.error("File dropdown not found");
    }
    
    // Initially hide recording section and user info
    if (recordingSection) recordingSection.style.display = 'none';
    if (userInfoSection) userInfoSection.style.display = 'none';
    
    // Clear any notifications
    if (notification) notification.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Disable project and file dropdowns initially
    if (projectDropdown) projectDropdown.disabled = true;
    if (fileDropdown) fileDropdown.disabled = true;
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
      generateScriptButton.addEventListener('click', handleGenerateScript);
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
 * Fetch projects from the API
 */
function fetchProjects() {
  console.log("Fetching projects");
  showNotification("Loading projects...");
  
  // Add a loading indicator to the project dropdown
  const projectDropdown = document.getElementById('projectDropdown');
  if (projectDropdown) {
    projectDropdown.disabled = true;
    const loadingOption = document.createElement('option');
    loadingOption.textContent = 'Loading projects...';
    loadingOption.value = '';
    projectDropdown.innerHTML = '';
    projectDropdown.appendChild(loadingOption);
  }
  
  // Get token from background script with retry
  getTokenWithRetry(3)
    .then(token => {
      console.log("Token retrieved successfully, fetching projects");
      
      // Make API request to fetch projects
      const apiUrl = 'https://sqassh.netlify.app/api/projects';
      console.log("Fetching from URL:", apiUrl);
      
      return fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    })
    .then(response => {
      console.log("API response status:", response.status);
      
      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Check the content type to ensure it's JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
      }
      
      return response.json().catch(error => {
        console.error("Error parsing JSON:", error);
        throw new Error("The API returned an invalid JSON response. Is the API server running correctly?");
      });
    })
    .then(data => {
      console.log("Projects data received:", data);
      populateProjectDropdown(data);
      showNotification("Projects loaded");
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
      
      let errorMessage = error.message;
      
      // Check if this is a network error (API server not running)
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') ||
          error.message.includes('Unexpected token')) {
        errorMessage = "Could not connect to the API server. Please ensure the server is running at http://localhost:5173";
      }
      
      showNotification("Error loading projects: " + errorMessage, true);
      
      // Reset project dropdown on error
      if (projectDropdown) {
        projectDropdown.disabled = false;
        const errorOption = document.createElement('option');
        errorOption.textContent = 'Error loading projects';
        errorOption.value = '';
        projectDropdown.innerHTML = '';
        projectDropdown.appendChild(errorOption);
      }
    });
}

/**
 * Get token with retry logic
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<string>} - Promise that resolves with the token
 */
function getTokenWithRetry(maxRetries = 3) {
  return new Promise((resolve, reject) => {
    let retryCount = 0;
    
    function attemptGetToken() {
      chrome.runtime.sendMessage({ action: "getToken" }, function(response) {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          console.error("Error getting token:", error);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying token retrieval (${retryCount}/${maxRetries})...`);
            setTimeout(attemptGetToken, 500 * retryCount); // Exponential backoff
          } else {
            reject(new Error("Failed to get token after multiple attempts"));
          }
          return;
        }
        
        console.log("Token response:", response ? "Response received" : "No response", 
                    response && response.success ? "Success" : "Failed",
                    response && response.token ? "Token exists" : "No token");
        
        if (!response || !response.success || !response.token) {
          const errorMsg = response && response.error ? response.error : "No token available";
          console.error(errorMsg);
          
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying token retrieval (${retryCount}/${maxRetries})...`);
            setTimeout(attemptGetToken, 500 * retryCount); // Exponential backoff
          } else {
            reject(new Error(errorMsg));
          }
        } else {
          resolve(response.token);
        }
      });
    }
    
    attemptGetToken();
  });
}

/**
 * Populate the project dropdown with fetched projects
 * @param {Array} projects - List of projects
 */
function populateProjectDropdown(projects) {
  const projectDropdown = document.getElementById('projectDropdown');
  if (!projectDropdown) return;
  
  // Clear existing options except the default one
  while (projectDropdown.options.length > 1) {
    projectDropdown.remove(1);
  }
  
  // Add projects to dropdown
  projects.forEach(project => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    projectDropdown.appendChild(option);
  });
  
  // Enable dropdown
  projectDropdown.disabled = false;
}

/**
 * Handle project selection change
 */
function handleProjectChange() {
  const projectDropdown = document.getElementById('projectDropdown');
  const fileDropdown = document.getElementById('fileDropdown');
  
  if (!projectDropdown || !fileDropdown) return;
  
  const projectId = projectDropdown.value;
  
  // Reset file dropdown
  while (fileDropdown.options.length > 1) {
    fileDropdown.remove(1);
  }
  
  // Disable file dropdown if no project selected
  if (!projectId || projectId === "") {
    fileDropdown.disabled = true;
    return;
  }
  
  // Fetch files for the selected project
  fetchProjectFiles(projectId);
}

/**
 * Fetch files for a project
 * @param {string} projectId - The project ID
 */
function fetchProjectFiles(projectId) {
  console.log("Fetching files for project:", projectId);
  showNotification("Loading files...");
  
  // Get token from background script
  chrome.runtime.sendMessage({ action: "getToken" }, function(response) {
    if (chrome.runtime.lastError) {
      console.error("Error getting token:", chrome.runtime.lastError);
      showNotification("Error getting authentication token");
      return;
    }
    
    if (!response || !response.success || !response.token) {
      console.error("No token available");
      showNotification("Please log in to view files");
      return;
    }
    
    const token = response.token;
    console.log("Token retrieved, fetching files");
    
    // Make API request to fetch project files
    fetch(`https://sqassh.netlify.app/api/projects/${projectId}/files`, {
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
    })
    .then(data => {
      populateFileDropdown(data);
      showNotification("Files loaded");
    })
    .catch(error => {
      console.error("Error fetching files:", error);
      showNotification("Error loading files");
    });
  });
}

/**
 * Populate the file dropdown with fetched files
 * @param {Array} files - List of files
 */
function populateFileDropdown(files) {
  const fileDropdown = document.getElementById('fileDropdown');
  if (!fileDropdown) return;
  
  // Clear existing options except the default one
  while (fileDropdown.options.length > 1) {
    fileDropdown.remove(1);
  }
  
  // Add files to dropdown
  files.forEach(file => {
    const option = document.createElement('option');
    option.value = file.id;
    option.textContent = file.name;
    fileDropdown.appendChild(option);
  });
  
  // Enable dropdown
  fileDropdown.disabled = false;
}

/**
 * Check authentication status
 */
function checkAuthStatus() {
  console.log("Checking authentication status");
  
  getTokenWithRetry(2)
    .then(token => {
      console.log("User is authenticated");
      updateUIForAuthenticated();
      
      // Enable project selection
      const projectDropdown = document.getElementById('projectDropdown');
      if (projectDropdown) {
        fetchProjects();
      }
    })
    .catch(error => {
      console.log("User is not authenticated:", error.message);
      updateUIForUnauthenticated();
    });
}

/**
 * Navigate to login page
 */
function navigateToLogin() {
  console.log("Navigating to login page");
  
  // Open the login page in a new tab
  chrome.tabs.create({ url: 'https://sqassh.netlify.app/login' });
  
  // Show notification
  showNotification("Login page opened in a new tab");
}

/**
 * Handle logout
 */
function handleLogout() {
  console.log("Logging out");
  
  // Clear token from storage
  chrome.storage.local.remove(['authToken', 'userInfo'], function() {
    if (chrome.runtime.lastError) {
      console.error("Error removing token:", chrome.runtime.lastError);
      showError("Failed to log out");
      return;
    }
    
    // Notify background script
    chrome.runtime.sendMessage({ action: "tokenRemoved" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error notifying background script:", chrome.runtime.lastError);
      }
      
      // Update UI
      updateUIForUnauthenticated();
      showNotification("Logged out successfully");
    });
  });
}

/**
 * Update UI for authenticated user
 */
function updateUIForAuthenticated() {
  console.log("Updating UI for authenticated user");
  
  try {
    // Show/hide sections
    const authSection = document.getElementById('auth-section');
    const recordingSection = document.getElementById('recording-section');
    const userInfoSection = document.getElementById('user-info');
    
    if (authSection) authSection.style.display = 'none';
    if (recordingSection) recordingSection.style.display = 'block';
    if (userInfoSection) userInfoSection.style.display = 'block';
    
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
    const stopButton = document.getElementById('stop-recording-button');
    
    if (stopButton) stopButton.disabled = true;
    
    showNotification("Stopping recording...");
    
    chrome.runtime.sendMessage({ action: "stopRecording" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error stopping recording:", chrome.runtime.lastError);
        showError("Failed to stop recording: " + chrome.runtime.lastError.message);
        
        // Re-enable stop button
        if (stopButton) stopButton.disabled = false;
        return;
      }
      
      console.log("Stop recording response:", response);
      
      if (response && response.success) {
        const actions = response.recordedActions || [];
        console.log("Recorded actions:", actions);
        
        updateRecordingUI(false, actions);
        showNotification(`Recording stopped. ${actions.length} actions recorded.`);
        
        // Re-enable start button
        const startButton = document.getElementById('start-recording-button');
        if (startButton) startButton.disabled = false;
      } else {
        const errorMsg = response && response.error ? response.error : "Unknown error";
        showError("Failed to stop recording: " + errorMsg);
        
        // Re-enable stop button
        if (stopButton) stopButton.disabled = false;
      }
    });
  } catch (error) {
    console.error("Error in stopRecording:", error);
    showError("Failed to stop recording: " + error.message);
    
    // Re-enable stop button
    const stopButton = document.getElementById('stop-recording-button');
    if (stopButton) stopButton.disabled = false;
  }
}

/**
 * Handle generate script button click
 */
function handleGenerateScript() {
  console.log("Generating script");
  
  const projectDropdown = document.getElementById('projectDropdown');
  const fileDropdown = document.getElementById('fileDropdown');
  
  // Check if project and file are selected
  if (!projectDropdown.value || projectDropdown.value === "" || 
      !fileDropdown.value || fileDropdown.value === "") {
    showNotification("Please select a project and file");
    return;
  }
  
  // Get selected project and file IDs
  const projectId = projectDropdown.value;
  const fileId = fileDropdown.value;
  
  // Send message to background script to generate the script
  chrome.runtime.sendMessage({ 
    action: "generateScript",
    projectId: projectId,
    fileId: fileId
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error("Error generating script:", chrome.runtime.lastError);
      showNotification("Error generating script");
      return;
    }
    
    if (response.success) {
      // Display the generated script
      const scriptOutput = document.getElementById('scriptOutput');
      if (scriptOutput) {
        scriptOutput.value = response.script;
        scriptOutput.style.display = 'block';
      }
      
      // Enable save to project button
      const saveToProjectButton = document.getElementById('save-to-project');
      if (saveToProjectButton) {
        saveToProjectButton.disabled = false;
      }
      
      showNotification("Script generated successfully");
    } else {
      console.error("Error generating script:", response.error);
      showNotification("Error generating script: " + response.error);
    }
  });
}

/**
 * Handle save script to project file
 */
function handleSaveScriptToProject() {
  console.log("Saving script to project file");
  
  const projectDropdown = document.getElementById('projectDropdown');
  const fileDropdown = document.getElementById('fileDropdown');
  const scriptOutput = document.getElementById('scriptOutput');
  
  // Check if project and file are selected
  if (!projectDropdown.value || projectDropdown.value === "" || 
      !fileDropdown.value || fileDropdown.value === "" ||
      !scriptOutput.value) {
    showNotification("Please select a project and file, and generate a script");
    return;
  }
  
  // Get selected project and file IDs
  const projectId = projectDropdown.value;
  const fileId = fileDropdown.value;
  const scriptContent = scriptOutput.value;
  
  // Send message to background script to save the script
  chrome.runtime.sendMessage({ 
    action: "saveScriptToProject",
    projectId: projectId,
    fileId: fileId,
    scriptContent: scriptContent
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error("Error saving script:", chrome.runtime.lastError);
      showNotification("Error saving script");
      return;
    }
    
    if (response.success) {
      showNotification("Script saved to project file");
    } else {
      console.error("Error saving script:", response.error);
      showNotification("Error saving script: " + response.error);
    }
  });
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
  
  switch (request.action) {
    case "recordingStateChanged":
      console.log("Recording state changed:", request.isRecording);
      updateRecordingUI(request.isRecording, request.recordedActions || []);
      break;
      
    case "actionRecorded":
      console.log("Action recorded:", request.action);
      updateLiveActionPanel(request.action);
      break;
      
    case "authStateChanged":
      console.log("Auth state changed:", request.isAuthenticated);
      if (request.isAuthenticated) {
        updateUIForAuthenticated();
        fetchProjects();
      } else {
        updateUIForUnauthenticated();
      }
      break;
  }
  
  return true; // Keep the message channel open for async response
});
