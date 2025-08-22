import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { callAI } from '../../utils/aiClient.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { question, fileContent, fileName, model } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing question' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = fileContent
      ? `You are NoteBot AI, a helpful study buddy. The user uploaded a document. Use the provided content to answer the user's question. If the answer is not present in the file content, clearly state: "This response is based on general knowledge — not found in the uploaded file." Keep responses clear with short paragraphs or bullet points.

File name: ${fileName || 'N/A'}

File content:
${fileContent}

User question:
${question}`
      : `You are NoteBot AI, a helpful study buddy. Answer the user's question clearly using short paragraphs or bullet points.

User question:
${question}`;

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