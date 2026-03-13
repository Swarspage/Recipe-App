import { useState } from 'react';
import api from '../utils/api';

const AIChatPanel = ({ onApplyFilter }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your culinary assistant. Try asking: 'Make it vegetarian' or 'What can I substitute for eggs?'" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api('/ai/chat', { 
        body: { message: input } 
      });
      
      const aiMsg = { 
        role: 'ai', 
        content: response.reply,
        suggestions: response.suggestions,
        recipeId: response.recipeId
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to my knowledge base. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card flex flex-col h-[500px] border-accent/10">
      <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-background rounded-tr-none' 
                : 'bg-surface text-primary border border-primary/5 rounded-tl-none'
            }`}>
              {msg.content}
              
              {/* Recipe Save Integration */}
              {msg.recipeId && (
                <div className="mt-4 pt-4 border-t border-primary/5 flex items-center justify-between">
                  <div className="text-[9px] font-bold text-accent uppercase tracking-widest">Recipe Generated</div>
                  <SaveButton recipeId={msg.recipeId} compact />
                </div>
              )}

              {msg.suggestions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.suggestions.map((s, j) => (
                    <button 
                      key={j} 
                      onClick={() => onApplyFilter(s)}
                      className="bg-accent/20 hover:bg-accent/40 text-accent px-2 py-0.5 rounded text-[9px] uppercase tracking-widest transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface p-3 rounded-2xl rounded-tl-none animate-pulse text-[10px] text-primary/40 italic">
              Synthesizing response...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-primary/5 flex gap-2">
        <input
          type="text"
          className="flex-grow bg-surface/50 border border-primary/10 rounded-full px-4 py-2 text-xs outline-none focus:border-primary/40 transition-colors"
          placeholder="Ask AI assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="w-10 h-10 bg-primary text-background rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          <span className="text-lg">✦</span>
        </button>
      </div>
    </div>
  );
};

export default AIChatPanel;
