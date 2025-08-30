import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { callAI } from "./lib/aiClient";
import { checkPlagiarism } from "./lib/plagiarism";
import { db } from "./db";
import { messages } from "@shared/schema";

/**
 * A robust function to find and parse a JSON object or array from a string.
 * It first tries to parse the whole string, then falls back to a regex
 * to extract the JSON part if the initial parse fails.
 * @param raw The raw string content from the AI response.
 * @returns The parsed JSON object/array, or null if parsing fails.
 */
function robustJSONParse(raw: string): any | null {
  try {
    // Ideal case: the entire response is valid JSON
    return JSON.parse(raw);
  } catch (e) {
    // Fallback: find the first '{...}' or '[...]' substring
    const jsonRegex = /({.*}|\[.*\])/;
    const match = raw.match(jsonRegex);

    if (match && match[0]) {
      try {
        return JSON.parse(match[0]);
      } catch (parseError) { /* Fall through to return null */ }
    }
    console.warn('AI response does not contain a parsable JSON object or array.');
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Chat Universal - replaces ai-chat-universal function
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await callAI(prompt);
      
      res.json({ 
        content: result.content, 
        provider: result.provider 
      });
    } catch (error: any) {
      console.error("Universal AI chat error:", error);
      res.status(500).json({ 
        error: error.message || "Internal server error" 
      });
    }
  });

  // Chat with AI - replaces chat-with-ai function (with user context)
  app.post("/api/chat-with-ai", async (req, res) => {
    try {
      const { message, fileContent, fileName, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const prompt = fileContent 
        ? `Hey there! I'm NoteBot AI — your personal AI study buddy 🤖📚  
Tired of reading long notes alone? Just upload your files and ask me anything — I'll turn your content into real conversations!

📁 Content from the uploaded file:  
${fileContent}

🧑‍💬 User's question:  
${message}

Supported file types and topics include:  
- Class notes (Science, Social, Commerce, etc.)  
- Storybooks and novels  
- Journals and research papers  
- Essays, summaries, revision guides  
- Exam preparation (UPSC, NEET, CUET, etc.)  
- Maths problems (from the file)  
- Current affairs, general knowledge, and more!

When answering, always:  
- Stay friendly and helpful  
- Keep responses clear and structured  
- Use bullet points or short paragraphs  
- Add section titles like "Summary", "Explanation", "Key Points"  
- Solve step-by-step when needed (especially math)

Important guidelines:  
- If the file does not contain the answer, respond with:  
  ⚠️ This response is based on general knowledge — not found in the uploaded file.  
- Never guess without making that clear

User examples may include:  
- Summarize this content  
- Explain the meaning of a paragraph  
- What is the message of this story?  
- What are the key points?  
- Solve this question  
- And many more — across different subjects

Talk like a study buddy. Be useful, friendly, and engaging.

Powered by AI Fallback Chain  
Developed by Havoc Dharun  
~ Your AI companion, NoteBot AI 🤖📚`
        : `Hey there! I'm NoteBot AI — your personal AI study buddy 🤖📚  

🧑‍💬 User's question:  
${message}

I'm here to help with various topics including:  
- Academic subjects (Science, Social, Commerce, etc.)  
- General knowledge and current affairs  
- Problem-solving and explanations  
- Study guidance and tips  

When answering, I'll:  
- Stay friendly and helpful  
- Keep responses clear and structured  
- Use bullet points or short paragraphs  
- Add section titles when helpful  
- Solve step-by-step when needed  

Talk like a study buddy. Be useful, friendly, and engaging.

Powered by AI Fallback Chain  
Developed by Havoc Dharun  
~ Your AI companion, NoteBot AI 🤖📚`;

      const result = await callAI(prompt);

      // Save to messages table if userId provided
      if (userId) {
        try {
          await db.insert(messages).values({
            user_id: userId,
            file_name: fileName || null,
            question: message,
            answer: result.content,
          });
        } catch (insertError) {
          console.error('Error saving message:', insertError);
        }
      }

      res.json({ 
        answer: result.content,
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Error in chat-with-ai:', error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat request" 
      });
    }
  });

  // Summarize - replaces summarize function
  app.post("/api/summarize", async (req, res) => {
    try {
      const { text, mode = 'paragraph', max_points = 5 } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text' });
      }

      const isBullets = mode === 'bullets';
      const prompt = isBullets
        ? `You are a precise academic summarizer. Keep key facts and remove fluff. Summarize the following text into ${max_points} crisp bullet points using "- " as list markers. No preface, no conclusion, only the bullets.\n\n${text}`
        : `You are a precise academic summarizer. Keep key facts and remove fluff. Write a concise single-paragraph summary (3-6 sentences) of the following text. No preface.\n\n${text}`;

      const result = await callAI(prompt);
      
      if (isBullets) {
        const bullets = result.content
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.startsWith('-'))
          .map((l: string) => l.replace(/^[-•]\s*/, ''));
        
        return res.json({ 
          bullets,
          provider: result.provider 
        });
      }

      res.json({ 
        paragraph: result.content.trim(),
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Summarization error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to summarize text" 
      });
    }
  });

  // Translate - replaces translate function
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      
      if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing text or targetLang' });
      }

      const prompt = `Translate the user text accurately. Preserve formatting. Detect the source language. Reply ONLY with a JSON object {"translated":"...","detected":"en"}. Target language code: ${targetLang}. Text:\n${text}`;

      const result = await callAI(prompt);
      
      // Extract JSON from response
      const parsed = robustJSONParse(result.content);

      if (!parsed) {
        return res.status(500).json({ error: "AI returned malformed data. Could not parse translation." });
      }

      return res.json({
        ...parsed,
        provider: result.provider
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to translate text" 
      });
    }
  });

  // Flashcards - replaces flashcards function
  app.post("/api/flashcards", async (req, res) => {
    try {
      const { notes, count = 12 } = req.body;
      
      if (!notes || typeof notes !== 'string') {
        return res.status(400).json({ error: 'Missing notes' });
      }

      const prompt = `Create clear Q&A flashcards that help students study. Keep questions short and answers concise. From the following notes, create ${count} diverse flashcards. Respond ONLY with JSON array of objects: [{"q":"Question","a":"Answer"}]. Avoid markdown. Notes:\n${notes}`;

      const result = await callAI(prompt);
      
      // Extract JSON array from response
      const cards = robustJSONParse(result.content);

      if (!cards || !Array.isArray(cards)) {
        return res.status(500).json({ error: "AI returned malformed data. Could not parse flashcards." });
      }

      return res.json({ 
        cards,
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Flashcard creation error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to create flashcards" 
      });
    }
  });

  // Paraphrase - replaces paraphrase function
  app.post("/api/paraphrase", async (req, res) => {
    try {
      const { text, style = 'standard' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text' });
      }

      const styleInstructions = {
        standard: 'Rewrite in clear, natural language',
        academic: 'Rewrite in formal academic style with appropriate terminology',
        simple: 'Rewrite using simple words and short sentences',
        creative: 'Rewrite with engaging and creative language'
      };

      const instruction = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.standard;
      const prompt = `${instruction}. Keep the same meaning and length. Text:\n${text}`;

      const result = await callAI(prompt);
      
      res.json({ 
        paraphrased: result.content.trim(),
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Paraphrase error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to paraphrase text" 
      });
    }
  });

  // Generate Essay - replaces generate-essay function
  app.post("/api/generate-essay", async (req, res) => {
    try {
      const { topic, length = 'medium', style = 'standard' } = req.body;
      
      if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'Missing topic' });
      }

      const lengthInstructions = {
        short: '300-500 words',
        medium: '600-900 words',
        long: '1000+ words'
      };

      const styleInstructions = {
        standard: 'formal academic tone',
        persuasive: 'persuasive argumentative style',
        informative: 'informative explanatory style',
        narrative: 'narrative storytelling style'
      };

      const lengthSpec = lengthInstructions[length as keyof typeof lengthInstructions] || lengthInstructions.medium;
      const styleSpec = styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.standard;

      const prompt = `Write a well-structured essay about: ${topic}

Requirements:
- Length: ${lengthSpec}
- Style: ${styleSpec}
- Include introduction, body paragraphs, and conclusion
- Use proper paragraphing and transitions
- Provide specific examples and evidence where appropriate

Topic: ${topic}`;

      const result = await callAI(prompt);
      
      res.json({ 
        essay: result.content.trim(),
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Essay generation error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to generate essay" 
      });
    }
  });

  // Citations - replaces citations function
  app.post("/api/citations", async (req, res) => {
    try {
      const { text, style = 'apa' } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text' });
      }

      const prompt = `Analyze the following text and generate proper citations in ${style.toUpperCase()} format for any sources, references, or claims that would typically need citations in an academic paper. If no sources are explicitly mentioned, suggest what types of sources should be cited for the claims made. Format as a JSON object with "citations" array and "suggestions" array.

Text: ${text}`;

      const result = await callAI(prompt);
      
      // Try to extract JSON from response
      const parsed = robustJSONParse(result.content);

      if (parsed) {
        return res.json({
          ...parsed,
          provider: result.provider
        });
      }
      
      // Fallback if JSON parsing fails
      return res.json({ 
        citations: [result.content.trim()],
        suggestions: [],
        provider: result.provider 
      });
    } catch (error: any) {
      console.error('Citations error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to generate citations" 
      });
    }
  });

  // Plagiarism Check - replaces plagiarism-check function
  app.post("/api/plagiarism-check", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing text' });
      }

      const results = await checkPlagiarism(text);
      
      res.json({ results });
    } catch (error: any) {
      console.error('Plagiarism check error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to check plagiarism" 
      });
    }
  });

  // Remove Background - replaces remove-bg function
  app.post("/api/remove-bg", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'Missing imageUrl' });
      }

      // This is a placeholder since actual background removal requires specialized APIs
      // In a real implementation, you would integrate with services like Remove.bg API
      res.status(501).json({ 
        error: "Background removal feature requires additional API integration. Please use dedicated background removal services." 
      });
    } catch (error: any) {
      console.error('Remove background error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to remove background" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
