import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Provider configurations with failover
const AI_PROVIDERS = [
  {
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    apiKey: Deno.env.get("GEMINI_API_KEY"),
    transformRequest: (prompt: string) => ({
      contents: [{ parts: [{ text: prompt }] }]
    }),
    transformResponse: (response: any) => response.candidates?.[0]?.content?.parts?.[0]?.text || ""
  },
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: Deno.env.get("GROQ_API_KEY"),
    transformRequest: (prompt: string) => ({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  }
];

async function tryProvider(provider: any, prompt: string) {
  if (!provider.apiKey) {
    throw new Error(`${provider.name} API key not configured`);
  }

  const requestBody = provider.transformRequest(prompt);
  
  const response = await fetch(provider.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = provider.transformResponse(data);
  
  if (!content) {
    throw new Error("Empty response from AI provider");
  }

  return { content, provider: provider.name };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { text, mode = 'paragraph', max_points = 5 } = await req.json();
    if (!text || typeof text !== 'string') throw new Error('Missing text');

    const isBullets = mode === 'bullets';
    const prompt = isBullets
      ? `You are a precise academic summarizer. Keep key facts and remove fluff. Summarize the following text into ${max_points} crisp bullet points using "- " as list markers. No preface, no conclusion, only the bullets.\n\n${text}`
      : `You are a precise academic summarizer. Keep key facts and remove fluff. Write a concise single-paragraph summary (3-6 sentences) of the following text. No preface.\n\n${text}`;

    let lastError: string = "";

    for (const provider of AI_PROVIDERS) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        const result = await tryProvider(provider, prompt);
        
        console.log(`Success with provider: ${provider.name}`);
        
        if (isBullets) {
          const bullets = result.content
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.startsWith('-'))
            .map((l: string) => l.replace(/^[-•]\s*/, ''));
          return new Response(JSON.stringify({ bullets }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ paragraph: result.content.trim() }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      } catch (error: any) {
        console.error(`Error with ${provider.name}:`, error.message);
        lastError = error.message;
        
        if (error.message === "RATE_LIMITED") {
          console.log(`Rate limited on ${provider.name}, trying next provider`);
          continue;
        }
      }
    }

    return new Response(JSON.stringify({ error: `All AI providers failed. Last error: ${lastError}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
