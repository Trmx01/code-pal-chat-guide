
import { useState, useRef } from 'react';
import { Send, Paperclip, Image, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  files?: File[];
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Ciao! 👋 Sono il tuo assistente AI per la programmazione. Posso aiutarti a scrivere codice, risolvere errori e imparare passo dopo passo. Puoi inviarmi anche file e immagini!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      files: selectedFiles,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setSelectedFiles([]);

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputMessage, selectedFiles),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const getAIResponse = (message: string, files: File[]) => {
    if (files.length > 0) {
      return `Ho ricevuto ${files.length} file! 📁 Analizziamo insieme il codice. Dalle informazioni che vedo, posso aiutarti a migliorare la struttura, trovare errori o spiegare come funziona. Cosa vorresti sapere nello specifico?`;
    }
    
    if (message.toLowerCase().includes('errore') || message.toLowerCase().includes('error')) {
      return `Vedo che hai un problema con un errore! 🔍 Per aiutarti meglio, puoi condividere il codice che ti dà problemi? Posso analizzare il messaggio d'errore e spiegarti passo dopo passo come risolverlo.`;
    }
    
    if (message.toLowerCase().includes('imparare') || message.toLowerCase().includes('tutorial')) {
      return `Perfetto! Adoro insegnare programmazione! 📚 Su cosa vorresti concentrarti? Posso spiegarti concetti base, best practices, o aiutarti con linguaggi specifici come JavaScript, Python, React e molto altro. Dimmi il tuo livello attuale!`;
    }
    
    return `Ottima domanda! 💡 Sono qui per aiutarti con qualsiasi cosa riguardi la programmazione. Posso spiegarti concetti, revisionare il tuo codice, aiutarti a risolvere bug, o guidarti nell'apprendimento di nuove tecnologie. Come posso assisterti al meglio?`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Assistente AI Programmazione</h1>
              <p className="text-sm text-gray-600">Il tuo compagno di coding intelligente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6 mb-24">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <Card className={`p-4 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-4' 
                    : 'bg-white shadow-sm mr-4'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                          {file.type.startsWith('image/') ? (
                            <Image className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'order-1 bg-gray-300' : 'order-2 bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                {message.type === 'user' ? (
                  <span className="text-sm font-semibold text-gray-700">Tu</span>
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] order-1">
                <Card className="p-4 bg-white shadow-sm mr-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-500">L'AI sta scrivendo...</span>
                  </div>
                </Card>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 order-2">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t">
        <div className="max-w-4xl mx-auto p-4">
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-3 h-3" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Input */}
          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => imageInputRef.current?.click()}
                className="h-10 w-10"
              >
                <Image className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio, fai una domanda sul codice, o carica dei file..."
                className="min-h-[40px] max-h-[120px] resize-none pr-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!inputMessage.trim() && selectedFiles.length === 0}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default Index;
