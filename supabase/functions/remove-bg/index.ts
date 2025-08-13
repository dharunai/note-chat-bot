import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const EREMOVE_API_KEY = Deno.env.get("EREMOVE_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Remove BG function called");
    
    if (!EREMOVE_API_KEY) {
      console.error("Missing EREMOVE_API_KEY server secret");
      return new Response(JSON.stringify({ error: "Missing EREMOVE_API_KEY server secret" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data with image_file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get("image_file") as File | null;
    const size = (form.get("size") as string) || "auto";

    if (!file) {
      return new Response(JSON.stringify({ error: "No image_file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = new FormData();
    upstream.append("image_file", file, file.name || "upload.png");
    upstream.append("size", size);

    const upstreamResp = await fetch("https://api.eremovebg.com/v1/remove", {
      method: "POST",
      headers: { "X-Api-Key": EREMOVE_API_KEY },
      body: upstream,
    });

    if (!upstreamResp.ok) {
      const text = await upstreamResp.text();
      return new Response(JSON.stringify({ error: "Eremove.bg error", details: text }), {
        status: upstreamResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ct = upstreamResp.headers.get("content-type") || "image/png";
    const buf = await upstreamResp.arrayBuffer();
    return new Response(buf, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": ct },
    });
  } catch (err) {
    console.error("remove-bg function error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
