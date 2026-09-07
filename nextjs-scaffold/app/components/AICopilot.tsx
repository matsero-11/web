'use client';
import { useState, useRef, useEffect } from 'react';
import { askCopilot } from '@/app/actions/copilot';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function AICopilot({ toolContext }: { toolContext?: Record<string, any> }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', parts: [{ text: input }] };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    const res = await askCopilot(messages, input, toolContext);

    if (res.success && res.text) {
      setMessages([...newHistory, { role: 'model', parts: [{ text: res.text }] }]);
    } else {
      setMessages([...newHistory, { role: 'model', parts: [{ text: res.error || "Ocurrió un error inesperado." }] }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-zinc-100 flex flex-col h-[500px]">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-emerald-400 font-medium text-sm">
        <Sparkles size={16} /> Copiloto Financiero MetaBox
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-2 text-sm">
        {messages.length === 0 && (
          <p className="text-zinc-500 text-center text-xs mt-20">
            Pregúntame sobre tus números, simulaciones o escenarios financieros...
          </p>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
              m.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700/50'
            }`}>
              {m.parts[0].text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
            <Loader2 size={14} className="animate-spin text-emerald-500" /> Analizando escenarios...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-zinc-800">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta financiera..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

