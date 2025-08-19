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
    const { text, mode = 'paragraph', max_points = 5 } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Missing text');
    }

    const isBullets = mode === 'bullets';
    const prompt = isBullets
      ? `You are a precise academic summarizer. Keep key facts and remove fluff. Summarize the following text into ${max_points} crisp bullet points using "- " as list markers. No preface, no conclusion, only the bullets.\n\n${text}`
      : `You are a precise academic summarizer. Keep key facts and remove fluff. Write a concise single-paragraph summary (3-6 sentences) of the following text. No preface.\n\n${text}`;

    const result = await callAI(prompt);
    
    if (isBullets) {
      const bullets = result.content
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.startsWith('-'))
        .map((l: string) => l.replace(/^[-•]\s*/, ''));
      
      return new Response(JSON.stringify({ 
        bullets,
        provider: result.provider 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      paragraph: result.content.trim(),
      provider: result.provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Summarization error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to summarize text" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});