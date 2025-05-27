
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
      console.log('Sending message to AI...');
      
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
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        console.error('AI response error:', data.error);
        throw new Error(data.error);
      }

      console.log('AI response received:', data.response);
      return data.response;
      
    } catch (error) {
      console.error('Error calling AI:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la comunicazione con l'AI. Riprova.",
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
