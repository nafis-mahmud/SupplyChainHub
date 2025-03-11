import { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSeleniumScript } from "@/lib/seleniumScriptService";
import { Code, Loader2 } from "lucide-react";

export default function SeleniumScriptDemo() {
  const [name, setName] = useState("Demo Selenium Script");
  const [description, setDescription] = useState("A sample Selenium script for testing");
  const [scriptContent, setScriptContent] = useState(
`from selenium import webdriver
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
    # Navigate to the starting URL
    driver.get("https://example.com")
    time.sleep(0.5)  # Small wait between actions

    # Click on the link
    driver.find_element(By.XPATH, "//a[contains(text(), 'More information')]").click()
    time.sleep(0.5)  # Small wait between actions

    # End of test
    print("Test completed successfully")

except Exception as e:
    print(f"Test failed: {e}")

finally:
    # Close the browser
    driver.quit()
`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Ensure user is logged in for demo
  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", "demo@example.com");
    
    // Get the first project ID for demo purposes
    const fetchFirstProject = async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/projects`);
        if (response.ok) {
          const projects = await response.json();
          if (projects && projects.length > 0) {
            setProjectId(projects[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    
    fetchFirstProject();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Script name is required");
      }

      if (!scriptContent.trim()) {
        throw new Error("Script content is required");
      }

      if (!projectId) {
        throw new Error("No project available to save the script");
      }

      const script = await createSeleniumScript({
        name,
        description,
        script_content: scriptContent,
        project_id: projectId,
      });

      if (script) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error("Failed to create script");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {