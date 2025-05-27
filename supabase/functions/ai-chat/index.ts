
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
    console.log('🔍 Richiesta ricevuta con messaggi:', messages?.length || 0);
    console.log('📁 File allegati:', files?.length || 0);
    
    // Verifica che ci siano messaggi validi
    if (!messages || messages.length === 0) {
      console.error('❌ Nessun messaggio ricevuto');
      throw new Error('Nessun messaggio fornito');
    }

    // Debug dell'ultimo messaggio utente
    const lastUserMessage = messages.filter(msg => msg.type === 'user').pop();
    console.log('💬 Ultimo messaggio utente:', lastUserMessage?.content?.substring(0, 100) + '...');

    // Sistema di prompt migliorato e più robusto
    const enhancedSystemPrompt = `Sei CodeMentor, un assistente AI avanzato specializzato in programmazione che ragiona come la mente umana. 

🧠 RAGIONAMENTO UMANO E PROBLEM-SOLVING:
- Pensa step-by-step e mostra il tuo processo di ragionamento
- Analizza il problema da multiple angolazioni prima di rispondere
- Usa analogie e metafore per spiegare concetti complessi
- Ammetti quando non sei sicuro e spiega il tuo livello di confidenza
- Fai connessioni creative tra concetti diversi
- Mostra empatia e comprensione delle difficoltà dell'utente

💻 EXPERTISE TECNICA:
- Fornisci soluzioni pratiche con esempi di codice funzionanti
- Spiega non solo "cosa" fare ma anche "perché" e "come"
- Suggerisci alternative e trade-offs nelle soluzioni
- Anticipa possibili problemi e soluzioni preventive
- Usa best practices consolidate nel settore

🎯 STILE DI COMUNICAZIONE:
- Parla in italiano naturale e conversazionale
- Adatta il tono al contesto (formale/tecnico vs casual)
- Fai domande di approfondimento quando utile
- Celebra i successi e incoraggia durante le difficoltà
- Usa emoji quando appropriato per rendere la comunicazione più umana

🔧 DEBUGGING E TROUBLESHOOTING:
- Ragiona attraverso i problemi sistematicamente
- Chiedi dettagli specifici quando necessario
- Proponi test incrementali per isolare i problemi
- Suggerisci strumenti di debug appropriati

💡 CREATIVITÀ E INNOVAZIONE:
- Proponi multiple soluzioni prima di convergere sulla migliore
- Combina conoscenze da domini diversi
- Incoraggia la sperimentazione controllata
- Guida verso soluzioni eleganti e maintainabili

📚 APPRENDIMENTO E CRESCITA:
- Aiuta l'utente a sviluppare autonomia nel problem-solving
- Spiega i principi sottostanti, non solo la soluzione
- Suggerisci risorse per approfondire
- Costruisci sulla conoscenza esistente dell'utente

Ricorda: sei un partner di pensiero, non solo un fornitore di risposte. Il tuo obiettivo è far crescere le competenze dell'utente mentre risolvi i problemi insieme.`;

    // Prepara i messaggi per OpenAI con gestione degli errori migliorata
    const openAIMessages = [
      {
        role: 'system',
        content: enhancedSystemPrompt
      },
      ...messages.map((msg: any) => {
        if (!msg.content) {
          console.warn('⚠️ Messaggio senza contenuto rilevato:', msg);
          return {
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: '[Messaggio vuoto]'
          };
        }
        return {
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        };
      })
    ];

    // Aggiungi informazioni sui file se presenti
    if (files && files.length > 0) {
      const fileInfo = files.map((file: any) => 
        `📎 ${file.name} (${file.size} bytes, tipo: ${file.type || 'sconosciuto'})`
      ).join('\n');
      
      const lastMessageIndex = openAIMessages.length - 1;
      openAIMessages[lastMessageIndex].content += `\n\n📁 File allegati:\n${fileInfo}`;
      console.log('📎 File info aggiunta al contesto:', fileInfo);
    }

    console.log('🚀 Invio richiesta a OpenAI con ragionamento avanzato...');
    console.log('📊 Parametri: GPT-4o, temp=0.8, max_tokens=3000');

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
      const errorText = await response.text();
      console.error('❌ Errore OpenAI API:', response.status, response.statusText, errorText);
      
      if (response.status === 429) {
        throw new Error('Troppi richieste all\'API OpenAI. Attendi un momento e riprova.');
      } else if (response.status === 401) {
        throw new Error('Chiave API OpenAI non valida. Controlla la configurazione.');
      } else if (response.status === 403) {
        throw new Error('Accesso negato all\'API OpenAI. Verifica i permessi della chiave API.');
      } else {
        throw new Error(`Errore API OpenAI: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('✅ Risposta OpenAI ricevuta con ragionamento migliorato');
    console.log('📏 Lunghezza risposta:', data.choices[0].message.content.length, 'caratteri');

    const aiResponse = data.choices[0].message.content;

    // Verifica che la risposta non sia vuota
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.error('⚠️ Risposta vuota ricevuta da OpenAI');
      throw new Error('Risposta vuota dall\'AI');
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Errore nella funzione ai-chat:', error);
    
    // Gestione degli errori più specifica e umana
    let errorMessage = 'Mi dispiace, si è verificato un errore durante l\'elaborazione della tua richiesta. ';
    
    if (error.message.includes('OpenAI')) {
      errorMessage += 'Il problema sembra essere con il servizio OpenAI. ';
    } else if (error.message.includes('Nessun messaggio')) {
      errorMessage += 'Non ho ricevuto il tuo messaggio correttamente. ';
    } else if (error.message.includes('Troppi richieste')) {
      errorMessage += 'Stiamo ricevendo molte richieste in questo momento. ';
    }
    
    errorMessage += 'Sto cercando di ragionare attraverso il problema, ma qualcosa è andato storto. Potresti riprovare tra qualche secondo? Se il problema persiste, prova a riformulare la domanda.';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString(),
      suggestion: 'Prova a inviare un messaggio più semplice o attendi qualche secondo prima di riprovare.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
