document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const loginSection = document.getElementById("loginSection");
  const mainSection = document.getElementById("mainSection");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginStatusDiv = document.getElementById("loginStatus");
  
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

  // Check if user is logged in
  chrome.storage.local.get(["isLoggedIn", "userEmail", "apiUrl"], function (result) {
    if (result.isLoggedIn) {
      // User is logged in, show main section
      loginSection.style.display = "none";
      mainSection.style.display = "block";
      
      // Set API URL if available
      if (result.apiUrl) {
        apiUrlInput.value = result.apiUrl;
        loadProjects();
      }
    }
  });

  // Event listeners
  loginBtn.addEventListener("click", function() {
    const email = emailInput.value;
    const password = passwordInput.value;
    
    if (!email || !password) {
      updateLoginStatus("Please enter email and password", "error");
      return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    updateLoginStatus("", "");
    
    // Call your web app's login API
    fetch("https://wyivyeysreruaqqbksjp.supabase.co/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aXZ5ZXlzcmVydWFxcWJrc2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTA3MjgsImV4cCI6MjA1NzEyNjcyOH0.5pDKb5NmDhUachX9wkcdgZ2cT3WY4jbSt9l-6064vQk"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    })
    .then(data => {
      // Save login state and token
      chrome.storage.local.set({
        isLoggedIn: true,
        userEmail: email,
        authToken: data.access_token,
        apiUrl: "https://wyivyeysreruaqqbksjp.supabase.co/functions/v1/api-projects-direct"
      });
      
      // Show main section
      loginSection.style.display = "none";
      mainSection.style.display = "block";
      
      // Set API URL and load projects
      apiUrlInput.value = "https://wyivyeysreruaqqbksjp.supabase.co/functions/v1/api-projects-direct";
      loadProjects();
    })
    .catch(error => {
      console.error("Login error:", error);
      updateLoginStatus("Login failed. Please check your credentials.", "error");
    })
    .finally(() => {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    });
  });
  
  logoutBtn.addEventListener("click", function() {
    // Clear login state
    chrome.storage.local.remove(["isLoggedIn", "userEmail", "authToken"]);
    
    // Show login section
    mainSection.style.display = "none";
    loginSection.style.display = "block";
    
    // Clear form fields
    emailInput.value = "";
    passwordInput.value = "";
    projectSelect.innerHTML = '<option value="">Select a project</option>';
    scriptNameInput.value = "";
    scriptDescriptionInput.value = "";
    scriptContentTextarea.value = "";
  });
  
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

    // Get auth token if available
    chrome.storage.local.get(["authToken"], function(result) {
      const headers = {
        "Content-Type": "application/json"
      };
      
      if (result.authToken) {
        headers["Authorization"] = `Bearer ${result.authToken}`;
      }

      fetch(apiUrl)
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

  function updateLoginStatus(message, type) {
    loginStatusDiv.textContent = message;
    loginStatusDiv.className = "status " + (type || "");
  }

  function saveScript() {
    if (!validateForm()) return;

    if (!scriptContentTextarea.value) {
      updateStatus("No script to save", "error");
      return;
    }

    const apiUrl = apiUrlInput.value.replace('api-projects-direct', 'api-selenium-scripts-direct');
    const projectId = projectSelect.value;
    const scriptName = scriptNameInput.value;
    const scriptDescription = scriptDescriptionInput.value;
    const scriptContent = scriptContentTextarea.value;

    updateStatus("Saving script...", "info");

    // Get auth token if available
    chrome.storage.local.get(["authToken"], function(result) {
      const headers = {
        "Content-Type": "application/json"
      };
      
      if (result.authToken) {
        headers["Authorization"] = `Bearer ${result.authToken}`;
      }

      fetch(apiUrl, {
        method: "POST",
        headers: headers,
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
