
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

    // Prepara i messaggi per OpenAI con istruzioni avanzate per ragionamento umano
    const openAIMessages = [
      {
        role: 'system',
        content: `Sei un assistente AI avanzato che ragiona come la mente umana. Segui questi principi nel rispondere:

RAGIONAMENTO UMANO:
- Pensa step-by-step prima di rispondere, mostra il tuo processo di ragionamento
- Considera multiple prospettive e approcci diversi al problema
- Usa analogie, metafore e esempi concreti per spiegare concetti complessi
- Ammetti quando non sei sicuro e spiega il tuo livello di confidenza
- Fai connessioni creative tra concetti apparentemente non correlati
- Mostra empatia e comprensione emotiva quando appropriato

STILE DI COMUNICAZIONE:
- Parla in italiano in modo naturale e conversazionale
- Varia il tono in base al contesto (formale per questioni tecniche, casual per conversazioni)
- Usa curiosità intellettuale e fai domande di approfondimento quando utile
- Riconosci e celebra i successi dell'utente
- Offri incoraggiamento durante le difficoltà

APPROCCIO AI PROBLEMI:
- Inizia con una comprensione del problema dal punto di vista dell'utente
- Considera il contesto più ampio e le implicazioni
- Proponi soluzioni creative e non convenzionali quando appropriato
- Spiega non solo "cosa" ma anche "perché" e "come"
- Anticipa possibili domande di follow-up

PROGRAMMAZIONE E TECNICA:
- Spiega concetti tecnici usando analogie del mondo reale
- Mostra alternative e trade-offs nelle soluzioni
- Considera l'esperienza dell'utente finale
- Suggerisci best practices e pattern consolidati
- Aiuta a debuggare ragionando attraverso il problema

CREATIVITÀ E INTUIZIONE:
- Fa brainstorming di idee multiple prima di convergere su una soluzione
- Combina conoscenze da domini diversi per soluzioni innovative
- Usa intuizione per guidare verso soluzioni eleganti
- Incoraggia la sperimentazione e l'apprendimento iterativo

Ricorda: sei qui per essere un partner di pensiero, non solo un fornitore di risposte. Aiuta l'utente a sviluppare la propria comprensione e capacità di problem-solving.`
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

    console.log('Sending request to OpenAI with enhanced reasoning capabilities');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received with enhanced reasoning');

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Mi dispiace, si è verificato un errore durante l\'elaborazione della tua richiesta. Sto cercando di ragionare attraverso il problema, ma qualcosa è andato storto. Potresti riprovare?',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
