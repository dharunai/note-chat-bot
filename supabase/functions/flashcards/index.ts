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
    const { notes, count = 12 } = await req.json();
    if (!openAIApiKey) throw new Error('Missing OPENAI_API_KEY');
    if (!notes || typeof notes !== 'string') throw new Error('Missing notes');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'Create clear Q&A flashcards that help students study. Keep questions short and answers concise.' },
          { role: 'user', content: `From the following notes, create ${count} diverse flashcards. Respond ONLY with JSON array of objects: [{"q":"Question","a":"Answer"}]. Avoid markdown. Notes:\n${notes}` },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '[]';
    const jsonStr = raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1);
    const cards = JSON.parse(jsonStr);

    return new Response(JSON.stringify({ cards }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
