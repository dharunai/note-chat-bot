import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkWikipedia(sentence: string) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srprop=snippet&srlimit=3&format=json&origin=*&srsearch=${encodeURIComponent(sentence.slice(0, 300))}`;
  const res = await fetch(url);
  if (!res.ok) return [] as any[];
  const data = await res.json();
  return (data?.query?.search || []) as any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    const sentences = String(text)
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 60);

    const results: { title: string; url: string; snippet: string }[] = [];
    let hits = 0;

    for (const s of sentences.slice(0, 10)) { // limit queries
      const found = await checkWikipedia(s);
      if (found.length) hits += 1;
      found.forEach((item) => {
        results.push({
          title: item.title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
          snippet: item.snippet?.replace(/<[^>]+>/g, '')?.slice(0, 160) || ''
        });
      });
    }

    // Deduplicate by URL
    const unique: Record<string, { title: string; url: string; snippet: string }> = {};
    results.forEach((r) => (unique[r.url] = unique[r.url] || r));

    const sources = Object.values(unique).slice(0, 10);
    const score = sentences.length ? Math.min(1, hits / sentences.length) : 0;

    return new Response(JSON.stringify({ score, sources }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
