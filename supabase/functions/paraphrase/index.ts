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
    const { text, tone = 'formal' } = await req.json();
    if (!openAIApiKey) throw new Error('Missing OPENAI_API_KEY');
    if (!text || typeof text !== 'string') throw new Error('Missing text');

    const toneHints: Record<string, string> = {
      formal: 'Use a formal academic tone suitable for essays and reports.',
      casual: 'Use a relaxed, conversational tone while staying clear and respectful.',
      academic: 'Use precise academic language, objective voice, and concise phrasing.',
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.5,
        messages: [
          { role: 'system', content: 'You paraphrase text faithfully, preserving meaning and key details while improving clarity and flow. Avoid plagiarism and do not add new facts.' },
          { role: 'user', content: `Tone: ${tone}. ${toneHints[tone] ?? ''}\n\nText to paraphrase (up to ~10k words):\n${text}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const paraphrased = data.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ paraphrased }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
