import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean);

    // GET /api/selenium-scripts
    if (req.method === "GET" && path[1] === "selenium-scripts") {
      // Get project_id from query params
      const projectId = url.searchParams.get("project_id");

      if (!projectId) {
        return new Response(
          JSON.stringify({ error: "project_id is required" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      const { data, error } = await supabase
        .from("selenium_scripts")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /api/selenium-scripts/:id
    if (req.method === "GET" && path[1] === "selenium-scripts" && path[2]) {
      const id = path[2];
      const { data, error } = await supabase
        .from("selenium_scripts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /api/selenium-scripts
    if (req.method === "POST" && path[1] === "selenium-scripts") {
      const { name, description, script_content, project_id } =
        await req.json();

      if (!name || !script_content || !project_id) {
        return new Response(
          JSON.stringify({
            error: "name, script_content, and project_id are required",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          },
        );
      }

      const { data, error } = await supabase
        .from("selenium_scripts")
        .insert({
          name,
          description: description || "",
          script_content,
          project_id,
        })
        .select();

      if (error) throw error;

      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /api/selenium-scripts/:id
    if (req.method === "DELETE" && path[1] === "selenium-scripts" && path[2]) {
      const id = path[2];
      const { error } = await supabase
        .from("selenium_scripts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no route matches
    return new Response(JSON.stringify({ error: "Not found" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 404,
    });
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
