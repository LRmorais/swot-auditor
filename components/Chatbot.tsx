
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { ReportRenderer } from './ReportRenderer'; // Reusing renderer for nice text formatting

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Olá! Sou a **SWOT AuditorIA**, sua consultora especializada em legislação cultural e audiovisual. Como posso ajudar seu projeto hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Parser to split text and suggestions
  const processAIResponse = (rawText: string): { content: string, suggestions: string[] } => {
      // Regex to find content between [SUGESTOES] and [/SUGESTOES]
      const suggestionRegex = /\[SUGESTOES\]([\s\S]*?)\[\/SUGESTOES\]/i;
      const match = rawText.match(suggestionRegex);
      
      let content = rawText;
      let suggestions: string[] = [];

      if (match) {
          // Remove the suggestion block from the main content
          content = rawText.replace(match[0], '').trim();
          
          // Split the suggestions by newline and filter empty ones
          suggestions = match[1]
              .split('\n')
              .map(s => s.trim())
              .filter(s => s.length > 0);
      }

      return { content, suggestions };
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;

    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the previous messages (context)
      // Only passing the text content to the API
      const historyContext = messages.map(m => ({ role: m.role, text: m.text })); 
      const responseText = await sendChatMessage(historyContext, userMsg.text);
      
      // Parse response to extract suggestions
      const { content, suggestions } = processAIResponse(responseText);

      const botMsg: ChatMessage = { role: 'model', text: content, suggestions: suggestions };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro ao conectar com a AuditorIA. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
      handleSend(question);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-slate-800 text-gold-400 rotate-90' : 'bg-gold-600 text-slate-950 hover:bg-gold-500'}`}
        title="Falar com SWOT AuditorIA"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-slate-900 border border-gold-600/30 rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 h-[600px] max-h-[80vh]' : 'opacity-0 scale-95 h-0 overflow-hidden pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-gold-600/20 flex items-center gap-3 rounded-t-lg">
          <div className="p-2 bg-gold-600/10 rounded-full border border-gold-600/50">
            <Bot className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm">SWOT AuditorIA</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Consultora Cultural & Audiovisual</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/90 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col gap-2">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                        ? 'bg-gold-600 text-slate-950 rounded-tr-none' 
                        : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'
                    }`}
                >
                    {/* Use ReportRenderer for Markdown support but simpler styling */}
                    <div className="prose-report prose-sm">
                        {msg.role === 'model' ? (
                        <ReportRenderer content={msg.text} mode="dark" /> 
                        ) : (
                        msg.text
                        )}
                    </div>
                </div>
                </div>

                {/* Suggestions Chips (Only for last model message to avoid clutter, or all model messages) */}
                {/* Logic: Showing suggestions for all model messages allows going back to topics */}
                {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 ml-2 max-w-[90%]">
                        {msg.suggestions.map((suggestion, sIdx) => (
                            <button
                                key={sIdx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-gold-600/30 rounded-full text-[10px] text-gold-400 hover:bg-gold-600/10 hover:border-gold-500 transition-colors text-left"
                            >
                                <HelpCircle className="w-3 h-3 min-w-[12px]" />
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Digitando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 rounded-b-lg">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre leis, editais ou projetos..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-full py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-1 p-1.5 bg-gold-600 text-slate-950 rounded-full hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-[9px] text-center text-slate-600">
            A IA pode cometer erros. Verifique as fontes oficiais.
          </div>
        </div>
      </div>
    </>
  );
};
