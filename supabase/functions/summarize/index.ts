import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, mode = 'paragraph', max_points = 5 } = await req.json();
    if (!openAIApiKey) throw new Error('Missing OPENAI_API_KEY');
    if (!text || typeof text !== 'string') throw new Error('Missing text');

    const isBullets = mode === 'bullets';
    const userPrompt = isBullets
      ? `Summarize the following text into ${max_points} crisp bullet points using "- " as list markers. No preface, no conclusion, only the bullets.\n\n${text}`
      : `Write a concise single-paragraph summary (3-6 sentences) of the following text. No preface.\n\n${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a precise academic summarizer. Keep key facts and remove fluff.' },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    if (isBullets) {
      const bullets = content
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.startsWith('-'))
        .map((l: string) => l.replace(/^[-•]\s*/, ''));
      return new Response(JSON.stringify({ bullets }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ paragraph: content.trim() }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
