import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SaveButton from '../components/SaveButton';

// Quick Mode presets — auto-generate targeted prompts
const QUICK_MODES = [
  { emoji: '⚡', label: 'Under 15 min', prompt: 'GENERATE a complete recipe for a delicious meal I can make in under 15 minutes using common pantry staples. Include full ingredients list and step-by-step method.' },
  { emoji: '💪', label: 'High Protein', prompt: 'GENERATE a complete high-protein meal recipe for fitness enthusiasts. Include full ingredients, cooking steps, and estimate macros in nutrition.' },
  { emoji: '🧒', label: 'Kid Friendly', prompt: 'GENERATE a complete fun kid-friendly recipe that children will love. Include full ingredients list and simple step-by-step instructions.' },
  { emoji: '🎉', label: 'Party Snack', prompt: 'GENERATE a complete party appetizer or snack recipe that serves 6-8 people. Include full ingredients and detailed preparation steps.' },
  { emoji: '🥗', label: 'No Oil/Healthy', prompt: 'GENERATE a complete healthy oil-free recipe that is still packed with flavor. Include all ingredients (no oil), full cooking method, and nutritional breakdown.' },
  { emoji: '🇮🇳', label: 'Indian Classic', prompt: 'GENERATE a complete authentic Indian recipe with all spices, full ingredients, and detailed step-by-step cooking instructions.' },
  { emoji: '🍝', label: 'Italian Night', prompt: 'GENERATE a complete authentic Italian pasta or risotto recipe with full ingredients list and step-by-step cooking method.' },
  { emoji: '🌱', label: 'Vegan', prompt: 'GENERATE a complete satisfying vegan recipe with lots of flavor. Include full ingredients, cooking steps, and nutrition info.' },
];


// Component that renders an AI-generated recipe beautifully
const RecipeCanvas = ({ recipe, isGenerating }) => {
  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12">
        <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        <p className="text-primary/40 uppercase tracking-widest text-xs animate-pulse">Chef AI is cooking...</p>
      </div>
    );
  }

  // Guard against malformed/empty recipe objects (e.g. AI returned {} or recipe with no ingredients)
  const isValidRecipe = recipe && recipe.title && recipe.ingredients?.length > 0 && recipe.steps?.length > 0;

  if (!isValidRecipe) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
        <div className="text-6xl opacity-20">🍳</div>
        <div className="space-y-2">
          <h2 className="font-poiret text-2xl text-primary/30 uppercase tracking-widest">Your Recipe Appears Here</h2>
          <p className="text-primary/30 text-sm">Ask Chef AI to make you something, or pick a Quick Mode preset above</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6">
      <div className="premium-card space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b border-accent/10 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags?.map((tag, i) => (
              <span key={i} className="text-[8px] uppercase tracking-widest text-accent/60 border border-accent/20 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-poiret text-2xl lg:text-3xl text-primary leading-tight">{recipe.title}</h1>
            <div className="flex-shrink-0 pt-1">
              <SaveButton recipeId={recipe._id} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] uppercase tracking-widest text-primary/40">
            {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
            {recipe.cookTime && <span>⏱ {recipe.cookTime} min</span>}
            {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
          </div>
        </div>

        {/* Ingredients + Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-[9px] uppercase tracking-[0.3em] text-accent/60 font-bold">Ingredients</h2>
            <ul className="space-y-1.5">
              {recipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 group">
                  <div className="w-1 h-1 rounded-full bg-accent/40 mt-2 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-primary">{ing.quantity} {ing.name}</span>
                    {ing.note && <div className="text-[9px] text-primary/30 italic">{ing.note}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-[9px] uppercase tracking-[0.3em] text-accent/60 font-bold">Method</h2>
            <ol className="space-y-3">
              {recipe.steps?.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full border border-primary/10 flex items-center justify-center text-[9px] text-primary/40 font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-primary/70 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutrition Table */}
        {recipe.nutrition && (
          <div className="space-y-2">
            <h2 className="text-[9px] uppercase tracking-[0.3em] text-accent/60 font-bold">Nutritional Value (per serving)</h2>
            <div className="overflow-hidden rounded-xl border border-primary/5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface/80">
                    {Object.keys(recipe.nutrition).map(k => (
                      <th key={k} className="px-3 py-2 text-[8px] uppercase tracking-widest text-primary/40 font-bold text-left">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-primary/5">
                    {Object.values(recipe.nutrition).map((v, i) => (
                      <td key={i} className="px-3 py-2 text-primary/70 font-medium">{v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {recipe.notes && (
          <div className="bg-accent/5 rounded-xl p-4 border border-accent/10">
            <h3 className="text-[9px] uppercase tracking-[0.3em] text-accent/60 font-bold mb-1">Chef's Notes</h3>
            <p className="text-xs text-primary/60 italic leading-relaxed">{recipe.notes}</p>
          </div>
        )}
        <div className="pt-1 text-center">
          <span className="text-[8px] uppercase tracking-widest text-primary/20">✨ Generated by Chef AI · Saved to your cookbook</span>
        </div>
      </div>
    </div>
  );
};

// Lightweight markdown → JSX renderer (bold, bullet lists, numbered lists, line breaks)
const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    // Bullet point lines: - item or • item or * item
    const bulletMatch = line.match(/^[\-\*•]\s+(.+)/);
    if (bulletMatch) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0 opacity-60" />
          <span>{applyInline(bulletMatch[1])}</span>
        </div>
      );
    }
    // Numbered list: 1. item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="font-bold opacity-50 text-xs flex-shrink-0 mt-0.5">{numberedMatch[1]}.</span>
          <span>{applyInline(numberedMatch[2])}</span>
        </div>
      );
    }
    // Empty line → spacing
    if (line.trim() === '') return <div key={i} className="h-1" />;
    // Normal line
    return <div key={i}>{applyInline(line)}</div>;
  });
};

// Applies inline formatting: **bold** and *italic*
const applyInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
};

// Individual message bubble
const MessageBubble = ({ msg, onRecipeShow }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1 ${isUser ? 'bg-primary text-background' : 'bg-accent/20 text-accent'}`}>
        {isUser ? '👤' : '👨‍🍳'}
      </div>
      <div className={`max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-0.5 ${isUser ? 'bg-[#895737] text-[background] rounded-tr-sm' : 'bg-surface border border-primary/5 text-primary/80 rounded-tl-sm'}`}>
          {isUser ? msg.content : renderMarkdown(msg.content)}
        </div>
        {msg.recipeData && (
          <button
            onClick={() => onRecipeShow(msg.recipeData)}
            className="text-[10px] uppercase tracking-widest text-accent border border-accent/30 px-3 py-1 rounded-full hover:bg-accent hover:text-background transition-all"
          >
            📋 View Recipe
          </button>
        )}
      </div>
    </div>
  );
};

// Main Chef AI Page
const ChefAI = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Load chat list on mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const data = await api('/ai/chats');
      setChats(data);
      if (data.length > 0 && !activeChatId) {
        await openChat(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const openChat = async (chatId) => {
    try {
      setActiveChatId(chatId);
      setActiveRecipe(null);
      const data = await api(`/ai/chats/${chatId}`);
      setActiveChat(data);
      // Show last generated recipe if any
      const lastWithRecipe = [...(data.messages || [])].reverse().find(m => m.recipeData);
      if (lastWithRecipe) setActiveRecipe(lastWithRecipe.recipeData);
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await api('/ai/chats', { method: 'POST', body: {} });
      setChats(prev => [{ _id: newChat._id, title: 'New Chat', messageCount: 0, updatedAt: new Date() }, ...prev].slice(0, 4));
      setActiveChatId(newChat._id);
      setActiveChat(newChat);
      setActiveRecipe(null);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await api(`/ai/chats/${chatId}`, { method: 'DELETE' });
      const updatedChats = chats.filter(c => c._id !== chatId);
      setChats(updatedChats);
      if (activeChatId === chatId) {
        if (updatedChats.length > 0) {
          await openChat(updatedChats[0]._id);
        } else {
          setActiveChatId(null);
          setActiveChat(null);
          setActiveRecipe(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const sendMessage = async (msg) => {
    const textToSend = msg || message.trim();
    if (!textToSend || isLoading) return;

    // Create chat if none exists
    let currentChatId = activeChatId;
    if (!currentChatId) {
      try {
        const newChat = await api('/ai/chats', { method: 'POST', body: {} });
        currentChatId = newChat._id;
        setActiveChatId(currentChatId);
        setActiveChat(newChat);
        setChats(prev => [{ _id: newChat._id, title: textToSend.slice(0, 40), messageCount: 0, updatedAt: new Date() }, ...prev].slice(0, 4));
      } catch (err) { return; }
    }

    // Optimistic UI update
    const userMsg = { role: 'user', content: textToSend, _id: Date.now() };
    setActiveChat(prev => ({ ...prev, messages: [...(prev?.messages || []), userMsg] }));
    setMessage('');
    setIsLoading(true);
    setIsGenerating(true);

    try {
      const response = await api('/ai/chat', { body: { chatId: currentChatId, message: textToSend } });

      const assistantMsg = {
        role: 'assistant',
        content: response.reply || 'Here is your recipe!',
        recipeData: response.recipe || null,
        _id: Date.now() + 1,
      };

      setActiveChat(prev => ({ ...prev, messages: [...(prev?.messages || []), assistantMsg] }));

      if (response.recipe) {
        // Attach the DB _id returned by backend so SaveButton can use it
        setActiveRecipe({ ...response.recipe, _id: response.recipeId || null });
      }

      // Update chat preview in sidebar
      setChats(prev => prev.map(c =>
        c._id === currentChatId
          ? { ...c, title: textToSend.slice(0, 40), lastMessage: response.reply?.slice(0, 80), updatedAt: new Date() }
          : c
      ));
    } catch (err) {
      const errMsg = { role: 'assistant', content: "I'm having a moment. Could you try again?", _id: Date.now() + 1 };
      setActiveChat(prev => ({ ...prev, messages: [...(prev?.messages || []), errMsg] }));
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen pt-16 overflow-hidden">
      {/* Left Panel — Chat Sidebar (30%) */}
      <div className="w-full max-w-[280px] border-r border-accent/10 flex flex-col bg-surface/30 flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-accent/10 flex items-center justify-between">
          <div>
            <h2 className="font-poiret text-lg tracking-widest text-primary">Chef AI</h2>
            <p className="text-[9px] uppercase tracking-widest text-primary/30">Your culinary brain</p>
          </div>
          <button
            onClick={createNewChat}
            disabled={chats.length >= 4 && false}
            title="New Chat"
            className="w-8 h-8 rounded-full bg-accent/10 hover:bg-accent hover:text-background border border-accent/20 flex items-center justify-center transition-all text-accent text-lg"
          >
            +
          </button>
        </div>

        {/* Quick Modes */}
        <div className="p-3 border-b border-accent/10">
          <p className="text-[8px] uppercase tracking-widest text-primary/30 mb-2">Quick Modes</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_MODES.slice(0, 4).map((mode) => (
              <button
                key={mode.label}
                onClick={() => sendMessage(mode.prompt)}
                disabled={isLoading}
                className="text-[9px] uppercase tracking-wide border border-accent/20 px-2 py-1 rounded-full hover:bg-accent hover:text-background hover:border-accent transition-all disabled:opacity-40 flex items-center gap-1"
              >
                {mode.emoji} {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-2xl opacity-20">💬</p>
              <p className="text-[9px] uppercase tracking-widest text-primary/30">No chats yet</p>
              <button onClick={createNewChat} className="text-[9px] uppercase tracking-widest text-accent hover:underline">Start your first</button>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => openChat(chat._id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2 ${activeChatId === chat._id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-surface border border-transparent'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-primary truncate">{chat.title || 'New Chat'}</p>
                  <p className="text-[9px] text-primary/30 truncate mt-0.5">{chat.lastMessage || `${chat.messageCount || 0} messages`}</p>
                </div>
                <button
                  onClick={(e) => deleteChat(chat._id, e)}
                  className="opacity-0 group-hover:opacity-100 text-primary/20 hover:text-red-400 transition-all flex-shrink-0 text-sm mt-0.5"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Chat count indicator */}
        <div className="p-3 border-t border-accent/10">
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= chats.length ? 'bg-accent' : 'bg-accent/15'}`} />
            ))}
          </div>
          <p className="text-[8px] uppercase tracking-widest text-primary/20 text-center mt-1">{chats.length}/4 chats</p>
        </div>

        {/* Chat input (in sidebar) */}
        <div className="p-3 border-t border-accent/10 space-y-2">
          {!activeChatId && chats.length === 0 && (
            <p className="text-[9px] text-primary/30 text-center">Create a chat to start</p>
          )}
          <textarea
            ref={inputRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Chef AI anything..."
            rows={2}
            disabled={isLoading}
            className="w-full bg-surface/50 border border-primary/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent/40 transition-colors disabled:opacity-40 placeholder-primary/20"
          />
          <div className="flex gap-2">
            <button
              onClick={() => sendMessage()}
              disabled={!message.trim() || isLoading}
              className="flex-1 btn-primary text-xs py-2 disabled:opacity-30"
            >
              {isLoading ? '...' : 'Send ↑'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel — true side-by-side: Chat (45%) | Recipe (55%) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Quick modes bar */}
        <div className="border-b border-accent/10 p-3 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0 bg-background/50">
          <span className="text-[9px] uppercase tracking-widest text-primary/30 flex-shrink-0 self-center mr-1">Quick:</span>
          {QUICK_MODES.map((mode) => (
            <button key={mode.label} onClick={() => sendMessage(mode.prompt)} disabled={isLoading}
              className="text-[9px] uppercase tracking-wide border border-accent/20 px-3 py-1.5 rounded-full hover:bg-accent hover:text-background hover:border-accent transition-all disabled:opacity-30 flex-shrink-0 flex items-center gap-1.5 whitespace-nowrap">
              {mode.emoji} {mode.label}
            </button>
          ))}
        </div>

        {/* Horizontal split: Chat | Recipe */}
        <div className="flex-1 overflow-hidden flex flex-row">

          {/* Chat panel — 45% */}
          <div className="w-[45%] flex flex-col border-r border-accent/10">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(!activeChat || activeChat.messages?.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                  <div className="text-5xl">👨‍🍳</div>
                  <p className="text-[10px] uppercase tracking-widest text-center">Ask me for a recipe,<br />cooking tips, or nutrition info</p>
                </div>
              )}
              {activeChat?.messages?.map((msg, i) => (
                <MessageBubble key={msg._id || i} msg={msg} onRecipeShow={setActiveRecipe} />
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-full bg-accent/50 flex items-center justify-center text-xs">👨‍🍳</div>
                  <div className="flex gap-1 px-4 py-3 bg-surface rounded-2xl rounded-tl-sm">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <div className="p-3 border-t border-accent/10 space-y-2 flex-shrink-0">
              <textarea ref={inputRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask Chef AI about food only…" rows={2} disabled={isLoading}
                className="w-full bg-surface/50 border border-primary/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent/40 transition-colors disabled:opacity-40 placeholder-primary/20" />
              <button onClick={() => sendMessage()} disabled={!message.trim() || isLoading}
                className="w-full btn-primary text-xs py-2 disabled:opacity-30">
                {isLoading ? '...' : 'Send ↑'}
              </button>
            </div>
          </div>

          {/* Recipe Canvas — 55% */}
          <div className="flex-1 overflow-y-auto">
            <RecipeCanvas recipe={activeRecipe} isGenerating={isGenerating && !activeRecipe} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefAI;
