import { supabase } from "./supabase";

export interface SeleniumScript {
  id: string;
  name: string;
  description: string | null;
  script_content: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface SeleniumScriptCreateData {
  name: string;
  description?: string;
  script_content: string;
  project_id: string;
}

export interface SeleniumScriptUpdateData {
  name?: string;
  description?: string;
  script_content?: string;
}

// Get all selenium scripts for a project
export async function getProjectSeleniumScripts(projectId: string) {
  try {
    const { data, error } = await supabase
      .from("selenium_scripts")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching selenium scripts:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProjectSeleniumScripts:", error);
    return [];
  }
}

// Get a single selenium script by ID
export async function getSeleniumScriptById(id: string) {
  try {
    const { data, error } = await supabase
      .from("selenium_scripts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching selenium script:", error);
      return null;
    }

    return data as SeleniumScript;
  } catch (error) {
    console.error("Error in getSeleniumScriptById:", error);
    return null;
  }
}

// Create a new selenium script
export async function createSeleniumScript(
  scriptData: SeleniumScriptCreateData,
) {
  try {
    console.log("Creating selenium script with data:", scriptData);

    const { data, error } = await supabase
      .from("selenium_scripts")
      .insert({
        name: scriptData.name,
        description: scriptData.description || "",
        script_content: scriptData.script_content,
        project_id: scriptData.project_id,
      })
      .select();

    if (error) {
      console.error("Error creating selenium script:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No selenium script returned after insert");
      return null;
    }

    console.log("Selenium script created successfully:", data[0]);
    return data[0] as SeleniumScript;
  } catch (error) {
    console.error("Error in createSeleniumScript:", error);
    return null;
  }
}

// Update a selenium script
export async function updateSeleniumScript(
  id: string,
  updateData: SeleniumScriptUpdateData,
) {
  try {
    const { data, error } = await supabase
      .from("selenium_scripts")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating selenium script:", error);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No selenium script returned after update");
      return null;
    }

    console.log("Selenium script updated successfully:", data[0]);
    return data[0] as SeleniumScript;
  } catch (error) {
    console.error("Error in updateSeleniumScript:", error);
    return null;
  }
}

// Delete a selenium script
export async function deleteSeleniumScript(id: string) {
  try {
    const { error } = await supabase
      .from("selenium_scripts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting selenium script:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSeleniumScript:", error);
    return false;
  }
}
