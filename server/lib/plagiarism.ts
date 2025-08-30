
declare const google_web_search: (args: { query: string }) => Promise<{ results: { url: string; title: string; snippet: string }[] }>;

import { callAI } from './aiClient';

interface PlagiarismResult {
  url: string;
  title: string;
  snippet: string;
}

// Function to split text into sentences.
function getSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [];
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult[]> {
  const sentences = getSentences(text);
  const uniqueResults: { [url: string]: PlagiarismResult } = {};

  try {
    for (const sentence of sentences) {
      const query = `"${sentence}"`;
      const searchResults = await google_web_search({ query });
      if (searchResults && searchResults.results) {
        for (const result of searchResults.results) {
          if (result.url && !uniqueResults[result.url]) {
            uniqueResults[result.url] = {
              url: result.url,
              title: result.title,
              snippet: result.snippet,
            };
          }
        }
      }
    }
    return Object.values(uniqueResults);
  } catch (error) {
    console.error('Error performing web search, falling back to AI', error);
    const prompt = `Analyze the following text for potential plagiarism. Provide a score from 0-100 (0=original, 100=likely plagiarized), a detailed analysis, and suggestions for improvement.
Respond ONLY with a valid JSON object in the format: {"score": number, "analysis": "detailed explanation", "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]}. Do not include any other text, greetings, or explanations outside of the JSON object.

Text to analyze:
---
${text}
---`;
    const result = await callAI(prompt);
    const parsedResult = JSON.parse(result.content);
    return [
      {
        url: '#',
        title: `Plagiarism Score: ${parsedResult.score}`,
        snippet: `${parsedResult.analysis} Suggestions: ${parsedResult.suggestions.join(', ')}`,
      },
    ];
  }
}
