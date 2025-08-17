import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, fileContent, fileName, model } = await req.json();
    
    if (!question) {
      throw new Error('Question is required');
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    let user = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
        
        if (authError) {
          console.error('Authentication error:', authError);
        } else {
          user = authUser;
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    }

    // Call Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
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

Powered by Gemini  
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

Powered by Gemini  
Developed by Havoc Dharun  
~ Your AI companion, NoteBot AI 🤖📚`;

    console.log('Making request to Gemini API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        }),
      }
    );

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');
    
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    // Save to messages table only if user is authenticated
    if (user) {
      try {
        const { error: insertError } = await supabaseClient
          .from('messages')
          .insert({
            user_id: user.id,
            file_name: fileName || null,
            question,
            answer,
          });

        if (insertError) {
          console.error('Error saving message:', insertError);
        }
      } catch (saveError) {
        console.error('Error saving message to database:', saveError);
        // Don't fail the request if saving fails
      }
    }

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-with-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});