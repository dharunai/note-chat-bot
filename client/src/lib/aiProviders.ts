// AI Provider Configuration and Failover System
export interface AIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  limits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  headers?: Record<string, string>;
  transformRequest?: (prompt: string) => any;
  transformResponse?: (response: any) => string;
}

// Provider configurations with fallback priority order
export const AI_PROVIDERS: AIProvider[] = [
  {
    name: "Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    apiKey: "AIzaSyBbflcbTxjw1QwYAjLOXjyshuMxtubbLaA",
    model: "gemini-1.5-flash-latest",
    limits: {
      requestsPerMinute: 15,
      requestsPerHour: 1000,
      requestsPerDay: 1500
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      contents: [{
        parts: [{ text: prompt }]
      }]
    }),
    transformResponse: (response: any) => response.candidates?.[0]?.content?.parts?.[0]?.text || ""
  },
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKey: "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",
    model: "llama-3.1-70b-versatile",
    maxTokens: 2048,
    temperature: 0.7,
    limits: {
      requestsPerMinute: 30,
      requestsPerHour: 14400,
      requestsPerDay: 14400
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "Together",
    baseUrl: "https://api.together.xyz/v1/chat/completions",
    apiKey: "a921e784508650bf702faf5e7e268530599e23f521770532726e52609285e5b8",
    model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    maxTokens: 2048,
    temperature: 0.7,
    limits: {
      requestsPerMinute: 20,
      requestsPerHour: 1000,
      requestsPerDay: 1000
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "HuggingFace",
    baseUrl: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    apiKey: "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",
    model: "microsoft/DialoGPT-medium",
    limits: {
      requestsPerMinute: 10,
      requestsPerHour: 1000,
      requestsPerDay: 1000
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      inputs: prompt,
      parameters: { max_length: 2048, temperature: 0.7 }
    }),
    transformResponse: (response: any) => response.generated_text || response[0]?.generated_text || ""
  },
  {
    name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    apiKey: "wxV7C146JdOojr29MOG5H9qLWOzPBP0v",
    model: "mistral-small-latest",
    maxTokens: 2048,
    temperature: 0.7,
    limits: {
      requestsPerMinute: 5,
      requestsPerHour: 1000,
      requestsPerDay: 1000
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  },
  {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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",
    model: "microsoft/wizardlm-2-8x22b",
    maxTokens: 2048,
    temperature: 0.7,
    limits: {
      requestsPerMinute: 20,
      requestsPerHour: 200,
      requestsPerDay: 200
    },
    headers: { "Content-Type": "application/json" },
    transformRequest: (prompt: string) => ({
      model: "microsoft/wizardlm-2-8x22b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.7
    }),
    transformResponse: (response: any) => response.choices?.[0]?.message?.content || ""
  }
];

// Track provider usage and failures
interface ProviderUsage {
  requests: number;
  lastRequest: number;
  failures: number;
  lastFailure: number;
  lastFailureType?: string;
  creditExhausted?: boolean;
}

const providerUsage = new Map<string, ProviderUsage>();

// Check if provider is rate limited or failed recently
function isProviderAvailable(provider: AIProvider): boolean {
  const usage = providerUsage.get(provider.name);
  if (!usage) return true;

  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  // Reset counters if enough time has passed
  if (usage.lastRequest < minuteAgo) {
    usage.requests = 0;
  }

  // Check rate limits
  if (usage.requests >= provider.limits.requestsPerMinute) {
    console.log(`${provider.name} rate limited: ${usage.requests}/${provider.limits.requestsPerMinute} requests per minute`);
    return false;
  }
  if (usage.lastRequest > hourAgo && usage.requests >= provider.limits.requestsPerHour) {
    console.log(`${provider.name} rate limited: ${usage.requests}/${provider.limits.requestsPerHour} requests per hour`);
    return false;
  }
  if (usage.lastRequest > dayAgo && usage.requests >= provider.limits.requestsPerDay) {
    console.log(`${provider.name} rate limited: ${usage.requests}/${provider.limits.requestsPerDay} requests per day`);
    return false;
  }

  // Check if provider failed recently - longer cooldown for credit exhaustion
  const cooldownTime = usage.lastFailureType === 'CREDIT_EXHAUSTED' ? 30 * 60 * 1000 : 5 * 60 * 1000; // 30 min vs 5 min
  if (usage.failures > 3 && usage.lastFailure > now - cooldownTime) {
    console.log(`${provider.name} in cooldown: ${usage.failures} failures, last: ${usage.lastFailureType}`);
    return false;
  }

  return true;
}

// Update provider usage tracking
function updateProviderUsage(providerName: string, success: boolean, failureType?: string) {
  const usage = providerUsage.get(providerName) || {
    requests: 0,
    lastRequest: 0,
    failures: 0,
    lastFailure: 0,
    creditExhausted: false
  };

  usage.requests++;
  usage.lastRequest = Date.now();

  if (!success) {
    usage.failures++;
    usage.lastFailure = Date.now();
    usage.lastFailureType = failureType;
    
    // Mark as credit exhausted for specific failure types
    if (failureType === 'CREDIT_EXHAUSTED' || failureType === 'QUOTA_EXCEEDED') {
      usage.creditExhausted = true;
      console.warn(`${providerName} credits exhausted - will cooldown for 30 minutes`);
    }
  } else {
    // Reset failure count and credit status on success
    usage.failures = 0;
    usage.creditExhausted = false;
    usage.lastFailureType = undefined;
  }

  providerUsage.set(providerName, usage);
}

// Main AI request function with automatic failover
export async function requestAI(prompt: string, options: { 
  maxRetries?: number;
  preferredProvider?: string;
} = {}): Promise<{ content: string; provider: string }> {
  const { maxRetries = 3, preferredProvider } = options;
  
  let providers = [...AI_PROVIDERS];
  
  // Move preferred provider to front if specified
  if (preferredProvider) {
    const preferred = providers.find(p => p.name === preferredProvider);
    if (preferred) {
      providers = [preferred, ...providers.filter(p => p.name !== preferredProvider)];
    }
  }

  let lastError: Error | null = null;

  for (const provider of providers) {
    if (!isProviderAvailable(provider)) {
      console.log(`Skipping ${provider.name} - not available`);
      continue;
    }

    try {
      console.log(`Trying provider: ${provider.name}`);
      
      const requestBody = provider.transformRequest 
        ? provider.transformRequest(prompt)
        : { prompt };

      const response = await fetch(provider.baseUrl, {
        method: "POST",
        headers: {
          ...provider.headers,
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorLower = errorText.toLowerCase();
        
        // Classify different types of failures for better handling
        let failureType = 'UNKNOWN';
        
        if (response.status === 429 || errorLower.includes("rate limit") || errorLower.includes("too many requests")) {
          failureType = 'RATE_LIMITED';
        } else if (errorLower.includes("quota") || errorLower.includes("credit") || errorLower.includes("billing") || 
                   errorLower.includes("insufficient funds") || errorLower.includes("payment required") ||
                   response.status === 402) {
          failureType = 'CREDIT_EXHAUSTED';
        } else if (errorLower.includes("unauthorized") || response.status === 401) {
          failureType = 'AUTH_ERROR';
        } else if (errorLower.includes("forbidden") || response.status === 403) {
          failureType = 'FORBIDDEN';
        }
        
        updateProviderUsage(provider.name, false, failureType);
        
        if (failureType === 'RATE_LIMITED' || failureType === 'CREDIT_EXHAUSTED') {
          console.log(`${provider.name} ${failureType.toLowerCase().replace('_', ' ')}, trying next provider`);
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = provider.transformResponse 
        ? provider.transformResponse(data)
        : data.choices?.[0]?.message?.content || data.generated_text || "";

      if (!content) {
        throw new Error("Empty response from AI provider");
      }

      updateProviderUsage(provider.name, true);
      console.log(`Success with provider: ${provider.name}`);
      
      return { content, provider: provider.name };

    } catch (error) {
      lastError = error as Error;
      const errorMessage = error.message || "Unknown error";
      
      // Classify error type for better tracking
      let failureType = 'UNKNOWN';
      if (errorMessage.includes('quota') || errorMessage.includes('credit')) {
        failureType = 'CREDIT_EXHAUSTED';
      } else if (errorMessage.includes('rate limit')) {
        failureType = 'RATE_LIMITED';
      }
      
      updateProviderUsage(provider.name, false, failureType);
      console.error(`Error with ${provider.name}:`, error);
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}

// Helper function for specific AI tasks
export async function generateText(prompt: string, options?: {
  maxRetries?: number;
  preferredProvider?: string;
}): Promise<string> {
  const result = await requestAI(prompt, options);
  return result.content;
}

// Export provider info for UI
export function getProviderStatus() {
  return AI_PROVIDERS.map(provider => {
    const usage = providerUsage.get(provider.name) || { 
      requests: 0, 
      lastRequest: 0, 
      failures: 0, 
      lastFailure: 0,
      creditExhausted: false
    };
    
    return {
      name: provider.name,
      available: isProviderAvailable(provider),
      usage,
      status: usage.creditExhausted ? 'Credit Exhausted' : 
              usage.failures > 3 ? 'Temporarily Unavailable' :
              'Available'
    };
  });
}