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
    const { text, tone = 'formal' } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Missing text');
    }

    const toneHints: Record<string, string> = {
      formal: 'Use a formal academic tone suitable for essays and reports.',
      casual: 'Use a relaxed, conversational tone while staying clear and respectful.',
      academic: 'Use precise academic language, objective voice, and concise phrasing.',
    };

    const prompt = `You paraphrase text faithfully, preserving meaning and key details while improving clarity and flow. Avoid plagiarism and do not add new facts.

Tone: ${tone}. ${toneHints[tone] ?? ''}

Text to paraphrase (up to ~10k words):
${text}`;

    const result = await callAI(prompt);
    
    return new Response(JSON.stringify({ 
      paraphrased: result.content,
      provider: result.provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Paraphrasing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to paraphrase text" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});