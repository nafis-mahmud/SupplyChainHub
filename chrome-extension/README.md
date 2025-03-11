# Selenium Recorder Chrome Extension

## Overview
This Chrome extension records user interactions (mouse clicks, hovers, and keyboard inputs) in the current tab when activated. It generates a Python Selenium script based on the recorded interactions and sends it to the Supply Chain Hub web app for storage and retrieval.

## Features
- Record user interactions in any web page
- Generate Python Selenium scripts automatically
- Pause and resume recording
- Save scripts to your Supply Chain Hub projects
- Copy scripts to clipboard

## Installation

### Developer Mode Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now appear in your extensions list

## Usage

1. Click on the Selenium Recorder extension icon in your browser toolbar
2. Enter your Supply Chain Hub API URL (e.g., https://your-app-url.com)
3. Click "Refresh Projects" to load your projects
4. Select a project from the dropdown
5. Enter a name and optional description for your script
6. Click "Start Recording" to begin recording your interactions
7. Perform the actions you want to record
8. Click "Pause" to temporarily pause recording (click "Resume" to continue)
9. Click "Stop" to end recording and generate the script
10. Review the generated script
11. Click "Save to Project" to save the script to your selected project

## Recorded Interactions
- Page navigation
- Mouse clicks
- Text input
- Dropdown selections
- Checkbox/radio button changes
- Special key presses (Enter, Tab, Escape)

## Integration with Supply Chain Hub
The extension communicates with the Supply Chain Hub web app via API endpoints:
- `/api/projects` - Fetches the list of available projects
- `/api/selenium-scripts` - Saves the generated scripts

## Troubleshooting
- If the extension doesn't appear to be recording, check for the red recording indicator in the top-right corner of the page
- If you can't connect to your projects, verify the API URL is correct
- For any other issues, check the browser console for error messages
