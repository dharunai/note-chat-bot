import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../../utils/aiClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang } = await req.json();
    
    if (!text || !targetLang) {
      throw new Error('Missing text or targetLang');
    }

    const prompt = `Translate the user text accurately. Preserve formatting. Detect the source language. Reply ONLY with a JSON object {"translated":"...","detected":"en"}. Target language code: ${targetLang}. Text:\n${text}`;

    const result = await callAI(prompt);
    
    // Extract JSON from response
    const raw = result.content;
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const jsonStr = raw.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonStr);

    return new Response(JSON.stringify({
      ...parsed,
      provider: result.provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to translate text" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});