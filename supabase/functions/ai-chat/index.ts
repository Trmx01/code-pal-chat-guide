
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { messages, files } = await req.json();
    console.log('Received request with messages:', messages);

    // Prepara i messaggi per OpenAI
    const openAIMessages = [
      {
        role: 'system',
        content: `Sei un assistente AI esperto in programmazione che parla in italiano. Puoi:
- Rispondere a domande di programmazione e coding
- Analizzare e spiegare codice
- Aiutare con debugging e risoluzione errori
- Fornire tutorial e spiegazioni passo-passo
- Generare codice su richiesta
- Rispondere a domande generali oltre alla programmazione

Sei amichevole, competente e dai sempre spiegazioni chiare e dettagliate. Quando possibile, fornisci esempi pratici di codice.`
      },
      ...messages.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    ];

    // Se ci sono file, aggiungi informazioni sui file al contesto
    if (files && files.length > 0) {
      const fileInfo = files.map((file: any) => `File: ${file.name} (${file.size} bytes)`).join('\n');
      openAIMessages[openAIMessages.length - 1].content += `\n\nFile allegati:\n${fileInfo}`;
    }

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Si è verificato un errore durante la generazione della risposta. Riprova più tardi.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
