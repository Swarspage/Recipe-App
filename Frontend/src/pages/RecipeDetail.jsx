import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [morphedRecipe, setMorphedRecipe] = useState(null);
  const [morphing, setMorphing] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [currentStepVoice, setCurrentStepVoice] = useState(-1);
  const [synth] = useState(window.speechSynthesis);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await api(`/recipes/${id}`);
        setRecipe(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  // --- Recipe Alchemist Logic ---
  const handleMorph = async (mutation) => {
    setMorphing(true);
    try {
      const currentRecipe = morphedRecipe || recipe;
      const data = await api('/ai/morph-recipe', { body: { recipe: currentRecipe, mutation } });
      setMorphedRecipe(data);
      // Speak the new title
      if (voiceActive) speak(`Poof! Your recipe is now ${data.title}`);
    } catch (err) {
      console.error('Alchemist error:', err);
    } finally {
      setMorphing(false);
    }
  };

  const synthesizeRecipe = async () => {
    setMorphing(true);
    try {
      const data = await api('/ai/synthesize-recipe', { body: { recipe: morphedRecipe || recipe } });
      setMorphedRecipe(data);
      // Transition to the new persistent recipe ID
      if (data._id) {
        navigate(`/recipe/${data._id}`, { replace: true });
      }
      if (voiceActive) speak("Recipe synthesized successfully! It is now detailed and complete.");
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setMorphing(false);
    }
  };

  // --- Ghost Chef (Voice) Logic ---
  const speak = (text) => {
    if (!voiceActive) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  const startVoiceMode = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser doesn't support voice commands.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Voice Command:', command);

      const currentR = morphedRecipe || recipe;

      if (command.includes('next')) {
        setCurrentStepVoice(prev => {
          const next = Math.min(prev + 1, currentR.steps.length - 1);
          speak(currentR.steps[next]);
          return next;
        });
      } else if (command.includes('back') || command.includes('previous')) {
        setCurrentStepVoice(prev => {
          const next = Math.max(prev - 1, 0);
          speak(currentR.steps[next]);
          return next;
        });
      } else if (command.includes('repeat')) {
        if (currentStepVoice >= 0) speak(currentR.steps[currentStepVoice]);
      } else if (command.includes('ingredients')) {
        speak(`You need ${currentR.ingredients.map(i => i.name).join(', ')}`);
      } else if (command.includes('stop') || command.includes('cancel')) {
        setVoiceActive(false);
      }
    };

    recognition.onend = () => {
      if (voiceActive) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();
    speak("Ghost Chef activated. Say Next to read the first step.");
  };

  useEffect(() => {
    if (voiceActive) {
      startVoiceMode();
    } else {
      recognitionRef.current?.stop();
      synth.cancel();
    }
    return () => recognitionRef.current?.stop();
  }, [voiceActive]);

  const displayRecipe = morphedRecipe || recipe;

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-24 text-center space-y-4">
      <h2 className="text-2xl font-poiret uppercase tracking-widest text-red-500">Recipe Not Found</h2>
      <p className="text-xs text-primary/40 uppercase tracking-widest">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] hover:text-accent transition-colors"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Lab
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <span className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-medium">
                {recipe.cuisine} • {recipe.difficulty}
               </span>
               {(!displayRecipe.steps || displayRecipe.steps.length < 3) && (
                 <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-widest border border-amber-500/20">Incomplete Draft</span>
               )}
            </div>
            <h1 className="text-4xl lg:text-7xl font-poiret uppercase tracking-tight leading-none text-primary">
              {displayRecipe.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Ghost Chef Toggle */}
            <button 
              onClick={() => setVoiceActive(!voiceActive)}
              className={`premium-card py-2 px-6 flex flex-col items-center transition-all ${voiceActive ? 'border-accent bg-accent/10 text-accent scale-105 shadow-lg shadow-accent/20' : 'hover:border-accent/30'}`}
            >
              <span className="text-xl">{voiceActive ? '🎙️' : '🔇'}</span>
              <span className="text-[8px] uppercase tracking-widest font-bold">Ghost Chef</span>
            </button>

            <div className="premium-card py-2 px-6 flex flex-col items-center">
              <span className="text-xl font-poiret">{displayRecipe.cookTime || '??'}</span>
              <span className="text-[8px] uppercase tracking-widest text-primary/40">Minutes</span>
            </div>
            <div className="premium-card py-2 px-6 flex flex-col items-center">
              <span className="text-xl font-poiret">{displayRecipe.ingredients?.length || 0}</span>
              <span className="text-[8px] uppercase tracking-widest text-primary/40">Items</span>
            </div>
          </div>
        </div>

        {displayRecipe.imageUrl && (
          <div className="w-full aspect-video rounded-[3rem] overflow-hidden border border-primary/5 shadow-2xl mb-8 relative bg-surface">
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 animate-pulse">
               🍳
            </div>
            <img 
              src={displayRecipe.imageUrl} 
              alt={displayRecipe.title} 
              onLoad={(e) => { e.target.classList.remove('opacity-0'); }}
              className={`w-full h-full object-cover relative z-10 transition-all duration-1000 ${morphing ? 'blur-xl scale-110 opacity-50' : 'opacity-100'}`} 
            />
            
            {/* AI Synthesis Overlay Call-to-Action */}
            {(!displayRecipe.steps || displayRecipe.steps.length < 3) && !morphing && !morphedRecipe && (
              <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center">
                <button 
                  onClick={synthesizeRecipe}
                  className="px-8 py-4 bg-white shadow-2xl rounded-2xl border border-primary/10 flex items-center gap-4 group hover:scale-105 transition-all active:scale-95"
                >
                   <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl group-hover:bg-accent group-hover:text-white transition-colors">✨</div>
                   <div className="text-left">
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest">Recipe appears sparse</p>
                     <p className="text-[9px] text-primary/40 uppercase tracking-widest">Synthesize full culinary blueprint now</p>
                   </div>
                </button>
              </div>
            )}

            {morphing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="premium-card bg-white/10 backdrop-blur-md px-8 py-4 space-y-2 border-white/20 animate-fadeup">
                  <div className="flex justify-center gap-1">
                    {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                  </div>
                  <p className="font-poiret uppercase tracking-[0.2em] text-white">Culinary Alchemy in Progress...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-primary/10 to-transparent w-full"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <aside className="lg:col-span-1 space-y-8">
          {/* Recipe Alchemist Panel */}
          <div className="premium-card border-accent/20 bg-accent/5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">Recipe Alchemist</h3>
            </div>
            <p className="text-[9px] uppercase tracking-widest text-primary/40 leading-relaxed italic">
              Mutate this recipe instantly with AI
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Indianize', m: 'Add Indian spices and flavors', icon: '🇮🇳' },
                { label: 'Veganize', m: 'Make it strictly vegan', icon: '🌱' },
                { label: '10-Min Hack', m: 'Simplify for speed', icon: '⚡' },
                { label: 'Kids Fav', m: 'Make it child-friendly and mild', icon: '👶' },
              ].map(opt => (
                <button 
                  key={opt.label}
                  disabled={morphing}
                  onClick={() => handleMorph(opt.m)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border border-accent/10 bg-white/50 hover:bg-accent hover:text-white transition-all text-[9px] uppercase tracking-widest font-medium"
                >
                  <span className="text-lg">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={synthesizeRecipe}
              disabled={morphing}
              className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
            >
              ✨ Synthesize Full Recipe
            </button>

            {morphedRecipe && (
              <button 
                onClick={() => setMorphedRecipe(null)}
                className="w-full pt-2 text-[8px] uppercase tracking-widest text-accent/50 hover:text-accent font-bold"
              >
                ↻ Restore Original
              </button>
            )}
          </div>

          <div className="premium-card border-primary/5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-primary border-b border-primary/5 pb-4 mb-6">Ingredients</h3>
            <ul className="space-y-4">
              {displayRecipe.ingredients.map((ing, i) => (
                <li key={i} className="flex flex-col">
                  <span className="text-xs font-medium text-primary leading-relaxed">{ing.name}</span>
                  {(ing.quantity || ing.note) && (
                    <span className="text-[10px] text-primary/50 uppercase tracking-widest mt-0.5">
                      {ing.quantity} {ing.note && `(${ing.note})`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-12">
          <section className="space-y-10">
            <h3 className="text-sm uppercase tracking-[0.3em] text-primary/60 border-b border-primary/5 pb-4">Preparation Protocol</h3>
            <div className="space-y-10 relative">
              {/* Vertical line through steps for a continuous look */}
              <div className="absolute left-[1.15rem] top-8 bottom-8 w-px bg-primary/5"></div>
              
              {displayRecipe.steps.map((step, i) => (
                <div key={i} className={`flex gap-8 group relative bg-background transition-all duration-500 ${currentStepVoice === i ? 'scale-105 z-20' : ''}`}>
                  <div className="flex flex-col items-center">
                    <span className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-poiret transition-all duration-500 z-10 ${currentStepVoice === i ? 'bg-accent text-background border-accent shadow-lg shadow-accent/30' : 'border-primary/10 text-primary/40 bg-background group-hover:bg-primary group-hover:text-background'}`}>
                      {i + 1}
                    </span>
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl transition-all duration-500 ${currentStepVoice === i ? 'bg-accent/5 border border-accent/20' : ''}`}>
                    <p className={`text-sm leading-[1.8] font-light max-w-prose ${currentStepVoice === i ? 'text-primary font-normal' : 'text-primary/80'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {displayRecipe.notes && (
            <footer className="bg-surface p-8 rounded-3xl border border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-primary">Chef's Technical Notes</h4>
                <p className="text-xs italic text-primary/60 leading-relaxed">"{displayRecipe.notes}"</p>
              </div>
              {displayRecipe.sourceUrl && (
                <a 
                  href={displayRecipe.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary py-3 px-8 text-[10px] uppercase tracking-widest"
                >
                  Original Source
                </a>
              )}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipeDetail;
