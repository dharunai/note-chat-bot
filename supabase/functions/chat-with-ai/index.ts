import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';
import { callAI } from "../utils/aiClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, fileContent, fileName } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const prompt = fileContent 
      ? `Hey there! I'm NoteBot AI — your personal AI study buddy 🤖📚  
Tired of reading long notes alone? Just upload your files and ask me anything — I'll turn your content into real conversations!

📁 Content from the uploaded file:  
${fileContent}

🧑‍💬 User's question:  
${question}

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
${question}

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

    // Save to messages table
    const { error: insertError } = await supabaseClient
      .from('messages')
      .insert({
        user_id: user.id,
        file_name: fileName || null,
        question,
        answer: result.content,
      });

    if (insertError) {
      console.error('Error saving message:', insertError);
    }

    return new Response(JSON.stringify({ 
      answer: result.content,
      provider: result.provider 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to process chat request" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});