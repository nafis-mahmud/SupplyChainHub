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
    // Return a simple list of mock projects for testing
    const mockProjects = [
      {
        id: "test-project-1",
        title: "Test Project 1",
        description: "A test project for Selenium scripts",
        category: "Testing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "test-project-2",
        title: "Test Project 2",
        description: "Another test project",
        category: "Development",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return new Response(JSON.stringify(mockProjects), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
