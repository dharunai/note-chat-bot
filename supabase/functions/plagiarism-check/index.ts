import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function checkWikipedia(sentence: string) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srprop=snippet&srlimit=3&format=json&origin=*&srsearch=${encodeURIComponent(sentence.slice(0, 300))}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.query?.search || []);
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Missing text');
    }

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 60);

    const results: { title: string; url: string; snippet: string }[] = [];
    let hits = 0;

    // Check up to 10 sentences to avoid overwhelming the API
    for (const sentence of sentences.slice(0, 10)) {
      const found = await checkWikipedia(sentence);
      if (found.length) hits += 1;
      
      found.forEach((item: any) => {
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

    return new Response(JSON.stringify({ 
      score, 
      sources 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Plagiarism check error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to check plagiarism" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});