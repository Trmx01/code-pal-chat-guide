
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  files?: File[];
  timestamp: Date;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessageToAI = async (messages: Message[], files?: File[]) => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Invio messaggio all\'AI...');
      console.log('💬 Numero messaggi:', messages.length);
      console.log('📁 File allegati:', files?.length || 0);
      
      // Verifica che ci sia almeno un messaggio
      if (!messages || messages.length === 0) {
        throw new Error('Nessun messaggio da inviare');
      }

      // Verifica che l'ultimo messaggio abbia contenuto
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.content || lastMessage.content.trim().length === 0) {
        throw new Error('Il messaggio è vuoto');
      }

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: messages,
          files: files?.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          })) || []
        }
      });

      if (error) {
        console.error('❌ Errore funzione Supabase:', error);
        
        // Gestione specifica degli errori di rete
        if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
          throw new Error('Problema di connessione. Controlla la tua connessione internet e riprova.');
        }
        
        throw error;
      }

      if (data?.error) {
        console.error('❌ Errore nella risposta AI:', data.error);
        
        // Mostra l'errore specifico dall'AI se disponibile
        toast({
          title: "Errore AI",
          description: data.error,
          variant: "destructive",
        });
        
        throw new Error(data.error);
      }

      if (!data?.response || data.response.trim().length === 0) {
        console.error('⚠️ Risposta vuota dall\'AI');
        throw new Error('L\'AI ha restituito una risposta vuota');
      }

      console.log('✅ Risposta AI ricevuta:', data.response.substring(0, 100) + '...');
      return data.response;
      
    } catch (error) {
      console.error('💥 Errore durante la chiamata AI:', error);
      
      // Gestione degli errori più specifica e user-friendly
      let errorTitle = "Errore di Comunicazione";
      let errorDescription = "Si è verificato un errore durante la comunicazione con l'AI.";
      
      if (error.message?.includes('messaggio è vuoto')) {
        errorTitle = "Messaggio Vuoto";
        errorDescription = "Per favore scrivi qualcosa prima di inviare il messaggio.";
      } else if (error.message?.includes('connessione')) {
        errorTitle = "Problema di Connessione";
        errorDescription = "Controlla la tua connessione internet e riprova.";
      } else if (error.message?.includes('OpenAI')) {
        errorTitle = "Servizio Temporaneamente Non Disponibile";
        errorDescription = "Il servizio AI è temporaneamente sovraccarico. Riprova tra qualche secondo.";
      } else if (error.message?.includes('risposta vuota')) {
        errorTitle = "Risposta Non Ricevuta";
        errorDescription = "L'AI non ha generato una risposta. Prova a riformulare la domanda.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessageToAI,
    isLoading
  };
};
