import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// AI Provider configurations
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
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: Deno.env.get("OPENAI_API_KEY"),
    transformRequest: (prompt: string) => ({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, preferredProvider } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let providers = [...AI_PROVIDERS];
    
    // Move preferred provider to front if specified
    if (preferredProvider) {
      const preferred = providers.find(p => p.name === preferredProvider);
      if (preferred) {
        providers = [preferred, ...providers.filter(p => p.name !== preferredProvider)];
      }
    }

    let lastError: string = "";

    for (const provider of providers) {
      try {
        console.log(`Trying provider: ${provider.name}`);
        const result = await tryProvider(provider, prompt);
        
        console.log(`Success with provider: ${provider.name}`);
        return new Response(
          JSON.stringify({ 
            content: result.content, 
            provider: result.provider 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error: any) {
        console.error(`Error with ${provider.name}:`, error.message);
        lastError = error.message;
        
        if (error.message === "RATE_LIMITED") {
          console.log(`Rate limited on ${provider.name}, trying next provider`);
          continue;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        error: `All AI providers failed. Last error: ${lastError}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Universal AI chat function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});