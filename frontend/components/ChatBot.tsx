import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, MessageSquare } from 'lucide-react';
import { chatWithAI, ChatMessage } from '../services/geminiService';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am TarvizBot. How can I help you grow your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await chatWithAI(userMsg.text, messages);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" 
          onClick={onClose}
        ></div>
      )}

      {/* Slide-in Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Bot size={24} />
             </div>
             <div>
                <h3 className="font-bold text-lg">TarvizBot</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                   <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#6C5CE7] text-white rounded-br-none' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                 }`}>
                    {msg.text}
                 </div>
              </div>
           ))}
           {loading && (
              <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#6C5CE7]" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
           <div className="relative">
              <input 
                 type="text" 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Ask about our services..."
                 className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/50 transition-all text-sm"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-[#6C5CE7] text-white rounded-full hover:bg-[#5a4ad1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                 <Send size={16} />
              </button>
           </div>
           <p className="text-[10px] text-center text-slate-400 mt-2">
              AI can make mistakes. Contact our team for verified info.
           </p>
        </form>
      </div>
    </>
  );
};

export default ChatBot;