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
    const { notes, count = 12 } = await req.json();
    
    if (!notes || typeof notes !== 'string') {
      throw new Error('Missing notes');
    }

    const prompt = `Create clear Q&A flashcards that help students study. Keep questions short and answers concise. From the following notes, create ${count} diverse flashcards. Respond ONLY with JSON array of objects: [{"q":"Question","a":"Answer"}]. Avoid markdown. Notes:\n${notes}`;

    const result = await callAI(prompt);
    
    // Extract JSON array from response
    const raw = result.content;
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid JSON response from AI');
    }
    
    const jsonStr = raw.slice(jsonStart, jsonEnd);
    const cards = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ 
      cards,
      provider: result.provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Flashcard creation error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create flashcards" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});