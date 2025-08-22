// Universal AI Client with Fallback Chain
// Provides robust AI completions across multiple providers

interface AIProvider {
  name: string;
  baseUrl: string;
  apiKey: string | undefined;
  model: string;
  transformRequest: (prompt: string) => any;
  transformResponse: (response: any) => string;
  headers?: Record<string, string>;
}

// Provider configurations in fallback order
const AI_PROVIDERS: AIProvider[] = [
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    transformRequest: (prompt: string) => ({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: process.env.OPENROUTER_API_KEY,
    model: "mistralai/mistral-7b-instruct",
    transformRequest: (prompt: string) => ({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "HuggingFace",
    baseUrl: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "microsoft/DialoGPT-medium",
    transformRequest: (prompt: string) => ({
      inputs: prompt,
      parameters: {
        max_length: 2048,
        temperature: 0.7,
        return_full_text: false
      }
    }),
    transformResponse: (response: any) => {
      if (Array.isArray(response)) {
        return response[0]?.generated_text || "";
      }
      return response.generated_text || "";
    }
  },
  {
    name: "TogetherAI",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    apiKey: process.env.TOGETHER_API_KEY,
    model: "meta-llama/Llama-2-7b-chat-hf",
    transformRequest: (prompt: string) => ({
      model: "meta-llama/Llama-2-7b-chat-hf",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash",
    transformRequest: (prompt: string) => ({
      contents: [{ parts: [{ text: prompt }] }]
    }),
    transformResponse: (response: any) => response.candidates?.[0]?.content?.parts?.[0]?.text || ""
  },
  {
    name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-tiny",
    transformRequest: (prompt: string) => ({
      model: "mistral-tiny",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  }
];

async function tryProvider(provider: AIProvider, prompt: string): Promise<string> {
  if (!provider.apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  console.log(`Attempting ${provider.name} with model ${provider.model}`);

  const requestBody = provider.transformRequest(prompt);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${provider.apiKey}`,
    ...provider.headers
  };

  const response = await fetch(provider.baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Handle rate limiting
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    
    // Handle model decommissioned errors
    if (errorText.includes("decommissioned") || errorText.includes("deprecated")) {
      throw new Error("MODEL_DECOMMISSIONED");
    }
    
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = provider.transformResponse(data);
  
  if (!content || content.trim() === "") {
    throw new Error("Empty response from AI provider");
  }

  console.log(`Success with ${provider.name}`);
  return content;
}

/**
 * Universal AI completion function with automatic fallback
 * @param prompt - The text prompt to send to AI
 * @returns Promise<{ content: string; provider: string }> - The response and which provider succeeded
 */
export async function callAI(prompt: string): Promise<{ content: string; provider: string }> {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt provided');
  }

  let lastError: string = "";
  
  // Try each provider in sequence
  for (const provider of AI_PROVIDERS) {
    try {
      const content = await tryProvider(provider, prompt);
      return { content, provider: provider.name };
      
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      console.error(`${provider.name} failed:`, errorMessage);
      lastError = errorMessage;
      
      // Skip providers with missing API keys
      if (errorMessage === "API_KEY_MISSING") {
        console.log(`Skipping ${provider.name} - API key not configured`);
        continue;
      }
      
      // Continue to next provider on rate limits or model issues
      if (errorMessage === "RATE_LIMITED" || errorMessage === "MODEL_DECOMMISSIONED") {
        console.log(`Skipping ${provider.name} due to: ${errorMessage}`);
        continue;
      }
      
      // For other errors, still try next provider but log the issue
      console.log(`Trying next provider after ${provider.name} error: ${errorMessage}`);
    }
  }

  // All providers failed
  const configuredProviders = AI_PROVIDERS.filter(p => p.apiKey).length;
  if (configuredProviders === 0) {
    throw new Error("No AI provider API keys are configured. Please set up at least one API key in your environment variables.");
  }
  throw new Error(`All configured AI providers failed. Last error: ${lastError}`);
}

/**
 * Convenience function that returns just the content string
 * @param prompt - The text prompt to send to AI
 * @returns Promise<string> - Just the AI response content
 */
export async function getAIResponse(prompt: string): Promise<string> {
  const result = await callAI(prompt);
  return result.content;
}

/**
 * Get status of all providers (for debugging/monitoring)
 * @returns Array of provider names and their configuration status
 */
export function getProviderStatus() {
  return AI_PROVIDERS.map(provider => ({
    name: provider.name,
    model: provider.model,
    hasApiKey: !!provider.apiKey,
    configured: !!provider.apiKey
  }));
}