import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../utils/aiClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Missing or invalid prompt');
    }

    const fullPrompt = `You are Note Bot AI, a concise academic essay writer. Write structured essays with intro, body sections with headings, and a conclusion. Keep it factual and cite general sources inline when obvious.

${prompt}`;

    const result = await callAI(fullPrompt);
    
    return new Response(JSON.stringify({ 
      generatedText: result.content,
      provider: result.provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Essay generation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to generate essay" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});