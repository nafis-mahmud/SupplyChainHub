// Variables to track recording state
let isRecording = false;
let isPaused = false;
let events = [];
let startUrl = "";

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startRecording") {
    startRecording();
  } else if (request.action === "pauseRecording") {
    togglePause();
  } else if (request.action === "stopRecording") {
    stopRecording();
  }
});

// Start recording user interactions
function startRecording() {
  isRecording = true;
  isPaused = false;
  events = [];
  startUrl = window.location.href;

  // Add event listeners
  document.addEventListener("click", recordClick, true);
  document.addEventListener("input", recordInput, true);
  document.addEventListener("change", recordChange, true);
  document.addEventListener("keydown", recordKeyDown, true);

  // Record initial page load
  events.push({
    type: "navigate",
    url: startUrl,
    timestamp: Date.now(),
  });

  // Show recording indicator
  showRecordingIndicator();
}

// Toggle pause/resume recording
function togglePause() {
  isPaused = !isPaused;

  if (isPaused) {
    // Update recording indicator
    const indicator = document.getElementById("selenium-recorder-indicator");
    if (indicator) {
      indicator.style.backgroundColor = "orange";
    }
  } else {
    // Update recording indicator
    const indicator = document.getElementById("selenium-recorder-indicator");
    if (indicator) {
      indicator.style.backgroundColor = "red";
    }
  }
}

// Stop recording and generate script
function stopRecording() {
  isRecording = false;
  isPaused = false;

  // Remove event listeners
  document.removeEventListener("click", recordClick, true);
  document.removeEventListener("input", recordInput, true);
  document.removeEventListener("change", recordChange, true);
  document.removeEventListener("keydown", recordKeyDown, true);

  // Remove recording indicator
  const indicator = document.getElementById("selenium-recorder-indicator");
  if (indicator) {
    indicator.remove();
  }

  // Generate Selenium script
  const script = generateSeleniumScript();

  // Send script back to popup
  chrome.runtime.sendMessage({
    action: "recordingComplete",
    script: script,
  });
}

// Record click events
function recordClick(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  const xpath = getXPath(element);
  const css = getCssSelector(element);

  events.push({
    type: "click",
    xpath: xpath,
    css: css,
    tagName: element.tagName.toLowerCase(),
    id: element.id,
    className: element.className,
    text: element.textContent.trim().substring(0, 50),
    timestamp: Date.now(),
  });
}

// Record input events
function recordInput(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const xpath = getXPath(element);
    const css = getCssSelector(element);

    events.push({
      type: "input",
      xpath: xpath,
      css: css,
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      value: element.value,
      timestamp: Date.now(),
    });
  }
}

// Record select/checkbox/radio changes
function recordChange(event) {
  if (!isRecording || isPaused) return;

  const element = event.target;
  if (
    element.tagName === "SELECT" ||
    (element.tagName === "INPUT" &&
      (element.type === "checkbox" || element.type === "radio"))
  ) {
    const xpath = getXPath(element);
    const css = getCssSelector(element);

    let value;
    if (element.tagName === "SELECT") {
      value = element.options[element.selectedIndex].value;
    } else if (element.type === "checkbox" || element.type === "radio") {
      value = element.checked;
    }

    events.push({
      type: "change",
      xpath: xpath,
      css: css,
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      elementType: element.type,
      value: value,
      timestamp: Date.now(),
    });
  }
}

// Record special key presses (Enter, Tab, etc.)
function recordKeyDown(event) {
  if (!isRecording || isPaused) return;

  // Only record special keys
  if (event.key === "Enter" || event.key === "Tab" || event.key === "Escape") {
    const element = event.target;
    const xpath = getXPath(element);
    const css = getCssSelector(element);

    events.push({
      type: "keydown",
      key: event.key,
      xpath: xpath,
      css: css,
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      timestamp: Date.now(),
    });
  }
}

// Generate Selenium Python script from recorded events
function generateSeleniumScript() {
  let script = `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Initialize the WebDriver
driver = webdriver.Chrome()

# Set implicit wait time
driver.implicitly_wait(10)

try:
`;

  // Process events
  events.forEach((event, index) => {
    // Add a comment with the event number
    script += `    # Event ${index + 1}: ${event.type}\n`;

    if (event.type === "navigate") {
      script += `    # Navigate to the starting URL\n`;
      script += `    driver.get("${event.url}")\n`;
    } else if (event.type === "click") {
      // Prefer ID if available
      if (event.id) {
        script += `    # Click on element with ID: ${event.id}\n`;
        script += `    driver.find_element(By.ID, "${event.id}").click()\n`;
      }
      // Then try CSS selector
      else if (event.css) {
        script += `    # Click on element with CSS selector: ${event.css}\n`;
        script += `    driver.find_element(By.CSS_SELECTOR, "${event.css}").click()\n`;
      }
      // Fall back to XPath
      else {
        script += `    # Click on element with XPath: ${event.xpath}\n`;
        script += `    driver.find_element(By.XPATH, "${event.xpath}").click()\n`;
      }
    } else if (event.type === "input") {
      // Prefer ID if available
      if (event.id) {
        script += `    # Input text into element with ID: ${event.id}\n`;
        script += `    input_element = driver.find_element(By.ID, "${event.id}")\n`;
        script += `    input_element.clear()\n`;
        script += `    input_element.send_keys("${event.value}")\n`;
      }
      // Then try CSS selector
      else if (event.css) {
        script += `    # Input text into element with CSS selector: ${event.css}\n`;
        script += `    input_element = driver.find_element(By.CSS_SELECTOR, "${event.css}")\n`;
        script += `    input_element.clear()\n`;
        script += `    input_element.send_keys("${event.value}")\n`;
      }
      // Fall back to XPath
      else {
        script += `    # Input text into element with XPath: ${event.xpath}\n`;
        script += `    input_element = driver.find_element(By.XPATH, "${event.xpath}")\n`;
        script += `    input_element.clear()\n`;
        script += `    input_element.send_keys("${event.value}")\n`;
      }
    } else if (event.type === "change") {
      if (event.tagName === "select") {
        // Handle select dropdown
        if (event.id) {
          script += `    # Select option in dropdown with ID: ${event.id}\n`;
          script += `    from selenium.webdriver.support.ui import Select\n`;
          script += `    select = Select(driver.find_element(By.ID, "${event.id}"))\n`;
          script += `    select.select_by_value("${event.value}")\n`;
        } else if (event.css) {
          script += `    # Select option in dropdown with CSS selector: ${event.css}\n`;
          script += `    from selenium.webdriver.support.ui import Select\n`;
          script += `    select = Select(driver.find_element(By.CSS_SELECTOR, "${event.css}"))\n`;
          script += `    select.select_by_value("${event.value}")\n`;
        } else {
          script += `    # Select option in dropdown with XPath: ${event.xpath}\n`;
          script += `    from selenium.webdriver.support.ui import Select\n`;
          script += `    select = Select(driver.find_element(By.XPATH, "${event.xpath}"))\n`;
          script += `    select.select_by_value("${event.value}")\n`;
        }
      } else if (
        event.elementType === "checkbox" ||
        event.elementType === "radio"
      ) {
        // Handle checkbox/radio
        const action = event.value ? "Check" : "Uncheck";
        if (event.id) {
          script += `    # ${action} checkbox/radio with ID: ${event.id}\n`;
          script += `    checkbox = driver.find_element(By.ID, "${event.id}")\n`;
          script += `    if checkbox.is_selected() != ${event.value}:\n`;
          script += `        checkbox.click()\n`;
        } else if (event.css) {
          script += `    # ${action} checkbox/radio with CSS selector: ${event.css}\n`;
          script += `    checkbox = driver.find_element(By.CSS_SELECTOR, "${event.css}")\n`;
          script += `    if checkbox.is_selected() != ${event.value}:\n`;
          script += `        checkbox.click()\n`;
        } else {
          script += `    # ${action} checkbox/radio with XPath: ${event.xpath}\n`;
          script += `    checkbox = driver.find_element(By.XPATH, "${event.xpath}")\n`;
          script += `    if checkbox.is_selected() != ${event.value}:\n`;
          script += `        checkbox.click()\n`;
        }
      }
    } else if (event.type === "keydown") {
      // Handle special key presses
      let keyConstant;
      if (event.key === "Enter") keyConstant = "Keys.RETURN";
      else if (event.key === "Tab") keyConstant = "Keys.TAB";
      else if (event.key === "Escape") keyConstant = "Keys.ESCAPE";

      if (keyConstant) {
        if (event.id) {
          script += `    # Press ${event.key} key in element with ID: ${event.id}\n`;
          script += `    driver.find_element(By.ID, "${event.id}").send_keys(${keyConstant})\n`;
        } else if (event.css) {
          script += `    # Press ${event.key} key in element with CSS selector: ${event.css}\n`;
          script += `    driver.find_element(By.CSS_SELECTOR, "${event.css}").send_keys(${keyConstant})\n`;
        } else {
          script += `    # Press ${event.key} key in element with XPath: ${event.xpath}\n`;
          script += `    driver.find_element(By.XPATH, "${event.xpath}").send_keys(${keyConstant})\n`;
        }
      }
    }

    // Add a small wait between actions
    script += `    time.sleep(0.5)  # Small wait between actions\n\n`;
  });

  // Add closing code
  script += `    # End of test\n    print("Test completed successfully")\n\n`;
  script += `except Exception as e:\n    print(f"Test failed: {e}")\n\nfinally:\n    # Close the browser\n    driver.quit()\n`;

  return script;
}

// Helper function to get XPath of an element
function getXPath(element) {
  if (!element) return "";

  try {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }

    if (element === document.body) {
      return "/html/body";
    }

    let ix = 0;
    const siblings = element.parentNode.childNodes;

    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];

      if (sibling === element) {
        const path = getXPath(element.parentNode);
        const tagName = element.tagName.toLowerCase();
        return `${path}/${tagName}[${ix + 1}]`;
      }

      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  } catch (e) {
    console.error("Error generating XPath:", e);
    return "";
  }

  return "";
}

// Helper function to get a CSS selector for an element
function getCssSelector(element) {
  if (!element) return "";

  try {
    // If element has ID, use that
    if (element.id) {
      return `#${element.id}`;
    }

    // If element has a class, use the first class
    if (element.className && typeof element.className === "string") {
      const classes = element.className
        .split(" ")
        .filter((c) => c.trim().length > 0);
      if (classes.length > 0) {
        // Check if this selector is unique
        const selector = `.${classes[0]}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }

    // Try to create a selector with tag name and attributes
    const tagName = element.tagName.toLowerCase();

    // For inputs, include the type
    if (tagName === "input" && element.type) {
      const selector = `${tagName}[type="${element.type}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    // For links, use the text content
    if (tagName === "a" && element.textContent.trim()) {
      const text = element.textContent.trim();
      if (text.length < 50) {
        // Only use text if it's reasonably short
        const selector = `${tagName}:contains("${text}")`;
        // Note: :contains is not a standard CSS selector, but it's used in jQuery
        // For Selenium, we'd need to use XPath instead
        return "";
      }
    }

    // If we can't create a unique selector, return empty string
    // and we'll fall back to XPath
    return "";
  } catch (e) {
    console.error("Error generating CSS selector:", e);
    return "";
  }
}

// Show recording indicator
function showRecordingIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "selenium-recorder-indicator";
  indicator.style.position = "fixed";
  indicator.style.top = "10px";
  indicator.style.right = "10px";
  indicator.style.width = "15px";
  indicator.style.height = "15px";
  indicator.style.borderRadius = "50%";
  indicator.style.backgroundColor = "red";
  indicator.style.zIndex = "9999";
  indicator.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)";
  document.body.appendChild(indicator);
}
