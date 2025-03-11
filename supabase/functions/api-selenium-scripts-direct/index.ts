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
    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean);

    // POST /api/selenium-scripts
    if (req.method === "POST") {
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

      // Mock successful response
      const mockScript = {
        id: crypto.randomUUID(),
        name,
        description: description || "",
        script_content,
        project_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return new Response(JSON.stringify(mockScript), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /api/selenium-scripts
    if (req.method === "GET") {
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

      // Return empty array for now
      return new Response(JSON.stringify([]), {
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
