import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import SaveButton from '../components/SaveButton';

// ── Ingredient shelf ──────────────────────────────────────────────────────────
const INGREDIENT_SHELF = {
  '🥩 Proteins': ['Chicken', 'Mutton', 'Paneer', 'Egg', 'Fish', 'Tofu', 'Dal', 'Chana'],
  '🥦 Vegetables': ['Onion', 'Tomato', 'Spinach', 'Potato', 'Cauliflower', 'Peas', 'Capsicum', 'Brinjal', 'Carrot', 'Mushroom'],
  '🧄 Pantry': ['Ghee', 'Oil', 'Rice', 'Atta', 'Maida', 'Bread', 'Besan', 'Poha'],
  '🧀 Dairy': ['Milk', 'Cream', 'Curd', 'Butter', 'Cheese', 'Khoa'],
  '🌶 Spices': ['Turmeric', 'Cumin', 'Coriander', 'Garam Masala', 'Red Chilli', 'Ginger', 'Garlic'],
};

const DNA_WEIGHTS = {
  cuisine: 40,
  equipment: 30,
  spice: 20,
  difficulty: 10
};

// ── Match progress bar ────────────────────────────────────────────────────────
const MatchBar = ({ matchCount, total }) => {
  const pct = total > 0 ? Math.round((matchCount / total) * 100) : 0;
  const isReady = pct === 100;
  const color = isReady ? '#16a34a' : pct >= 60 ? '#d97706' : '#8D7B6D';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] uppercase tracking-widest" style={{ color }}>
        <span>{isReady ? '✔ Ready to cook' : `${matchCount} of ${total} matched`}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-primary/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

// ── Recipe Card ───────────────────────────────────────────────────────────────
const RecipeResultCard = ({ recipe, isReady, dnaMatch, alchemyHack }) => {
  const [imgSrc, setImgSrc] = useState(recipe.imageUrl);
  const [labHack, setLabHack] = useState(null);
  const [loadingHack, setLoadingHack] = useState(false);
  const cardRef = useRef(null);

  const fetchHack = async () => {
    if (labHack || loadingHack) return;
    setLoadingHack(true);
    try {
      const data = await api('/ai/pantry-labs', { 
        body: { 
          ingredients: recipe.ingredientsMatched || [], 
          recipeTitle: recipe.title,
          recipeIngredients: recipe.ingredients || []
        } 
      });
      setLabHack(data);
    } catch (err) { console.error(err); }
    finally { setLoadingHack(false); }
  };

  useEffect(() => {
    if (imgSrc || !recipe._id) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetch(`http://localhost:5000/api/recipes/${recipe._id}/image`, { credentials: 'include' })
          .then(r => r.json()).then(d => { if (d.imageUrl) setImgSrc(d.imageUrl); })
          .catch(() => { });
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [recipe._id, imgSrc]);

  const handleImageError = () => {
    // Elegant fallback image if the URL fails to load
    setImgSrc('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
  };

  return (
    <div ref={cardRef} className="group relative flex flex-col rounded-2xl border border-primary/10 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* DNA Match Overlay */}
      {dnaMatch > 70 && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-full bg-accent text-white shadow-lg flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">{dnaMatch}% DNA Match</span>
        </div>
      )}

      {/* Image Block */}
      <Link to={`/recipe/${recipe._id}`} className="relative h-48 overflow-hidden bg-primary/5">
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt={recipe.title} 
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 opacity-30">
            <span className="text-4xl">🍳</span>
            <span className="text-[8px] font-black uppercase tracking-widest">Alchemizing Image...</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        
        <div className="absolute bottom-3 right-3 flex gap-2">
          {isReady ? (
            <span className="px-3 py-1.5 bg-green-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest shadow-md">Ready to Cook</span>
          ) : recipe.missingCount === 1 ? (
             <span className="px-3 py-1.5 bg-amber-500 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest shadow-md">1 Missing</span>
          ) : null}
        </div>
      </Link>

      <div className="p-5 space-y-4 flex flex-col flex-1">
        <div className="space-y-1.5">
          <Link to={`/recipe/${recipe._id}`}>
            <h3 className="font-poiret text-xl text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight uppercase font-bold tracking-tight">
              {recipe.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-[11px] font-bold text-primary/60 uppercase tracking-widest">
            <span className="text-accent">{recipe.cuisine || 'Global'}</span>
            <span className="w-1 h-1 rounded-full bg-primary/20" />
            <span>{recipe.cookTime || '20'} MINS</span>
          </div>
        </div>

        {/* Alchemy Lab Hack */}
        {!isReady && (
          <div className="space-y-2">
            {labHack ? (
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">🧪</span>
                  <span className="text-[11px] font-black text-accent uppercase tracking-widest leading-none">Alchemy Hack</span>
                </div>
                <p className="text-xs text-primary/80 leading-relaxed italic font-medium">"{labHack.instruction}"</p>
              </div>
            ) : (
              <button 
                onClick={(e) => { e.preventDefault(); fetchHack(); }}
                disabled={loadingHack}
                className="w-full py-3 bg-accent/5 border border-dashed border-accent/30 rounded-xl text-[11px] font-black text-accent uppercase tracking-widest hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
              >
                {loadingHack ? (
                  <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                ) : '🔮 Unlock Alchemy Hack'}
              </button>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-primary/10">
          <SaveButton recipeId={recipe._id} compact />
          <Link 
            to={`/recipe/${recipe._id}`}
            className="px-4 py-2 bg-primary/5 hover:bg-accent hover:text-white rounded-full text-[11px] font-bold text-primary transition-all uppercase tracking-widest"
          >
            Experiment →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── AI Insight Banner ────────────────────────────────────────────────────────
const InsightBanner = ({ ingredients }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (ingredients.length === 0) { setInsight(null); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api('/ai/pantry-insight', { body: { ingredients } });
        setInsight(data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 1200);
    return () => clearTimeout(timerRef.current);
  }, [ingredients.join(',')]);

  if (ingredients.length === 0) return null;

  return (
    <div className="premium-card border-accent/30 bg-surface space-y-2 !p-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center text-sm">🤖</div>
        <span className="text-[8px] uppercase tracking-[0.3em] text-accent/70 font-bold">Chef AI Insight</span>
        {loading && (
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
      {insight && !loading && (
        <div>
          <p className="text-sm text-primary font-semibold leading-snug">{insight.headline}</p>
          {insight.tip && <p className="text-[11px] text-primary/50 mt-1 leading-relaxed">{insight.tip}</p>}
        </div>
      )}
    </div>
  );
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ label, count, color }) => (
  <div className="flex items-center gap-3">
    <div className="h-px flex-1" style={{ backgroundColor: `${color}30` }} />
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}30` }}>
      <span className="text-xs font-bold" style={{ color }}>{label}</span>
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>{count}</span>
    </div>
    <div className="h-px flex-1" style={{ backgroundColor: `${color}30` }} />
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ingredients, setIngredients] = useState(() => {
    const p = searchParams.get('q');
    return p ? p.split(',').map(s => s.trim().toLowerCase()) : [];
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(INGREDIENT_SHELF)[0]);
  const [customInput, setCustomInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [alchemyMode, setAlchemyMode] = useState(() => searchParams.get('alchemy') === 'true');
  const [userProfile, setUserProfile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api('/user/profile');
        setUserProfile(data.culinaryProfile);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
    if (ingredients.length > 0) doSearch(ingredients);
  }, []);

  // Update URL params when state changes
  useEffect(() => {
    const params = {};
    if (ingredients.length > 0) params.q = ingredients.join(',');
    if (alchemyMode) params.alchemy = 'true';
    setSearchParams(params, { replace: true });
  }, [ingredients, alchemyMode]);

  const calculateDNAMatch = (recipe) => {
    if (!userProfile) return 0;
    let score = 0;
    
    // 1. Cuisine Match
    if (recipe.cuisine?.toLowerCase() === userProfile.basics?.homeCuisine?.toLowerCase()) score += DNA_WEIGHTS.cuisine;
    
    // 2. Equipment Match
    const eqMatch = userProfile.equipment?.some(eq => 
      recipe.steps?.some(s => s.toLowerCase().includes(eq.toLowerCase())) ||
      recipe.tags?.some(t => t.toLowerCase().includes(eq.toLowerCase()))
    );
    if (eqMatch) score += DNA_WEIGHTS.equipment;

    // 3. Spice Match
    const isSpicy = recipe.tags?.some(t => ['spicy', 'hot', 'chilli'].includes(t.toLowerCase()));
    const userWantsSpicy = userProfile.flavorDNA?.spiceLevel >= 4;
    if (isSpicy === userWantsSpicy) score += DNA_WEIGHTS.spice;

    // 4. Difficulty Match
    const skillMap = { 'Beginner': 'easy', 'Intermediate': 'medium', 'Advanced': 'hard' };
    const userSkill = skillMap[userProfile.meta?.skillLevel] || 'medium';
    if (recipe.difficulty?.toLowerCase() === userSkill) score += DNA_WEIGHTS.difficulty;

    return Math.min(score + 30, 99); // Base matching + cap
  };

  const doSearch = useCallback(async (ings) => {
    if (ings.length === 0) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api(`/recipes/search?ingredients=${encodeURIComponent(ings.join(','))}&limit=40`);
      setResults(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleIngredient = (ing) => {
    const lower = ing.toLowerCase();
    const next = ingredients.includes(lower)
      ? ingredients.filter(i => i !== lower)
      : [...ingredients, lower];
    setIngredients(next);
    doSearch(next);
  };

  const addCustom = () => {
    const trimmed = customInput.trim().toLowerCase();
    if (!trimmed || ingredients.includes(trimmed)) { setCustomInput(''); return; }
    const next = [...ingredients, trimmed];
    setIngredients(next);
    setCustomInput('');
    doSearch(next);
  };

  const handleVisionScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        const data = await api('/ai/vision-pantry', { body: { image: base64 } });
        
        if (data.ingredients?.length > 0) {
          const newIngredients = [...new Set([...ingredients, ...data.ingredients.map(i => i.toLowerCase())])];
          setIngredients(newIngredients);
          doSearch(newIngredients);
        }
      };
    } catch (err) {
      console.error('Vision scan error:', err);
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const readyNow = results.filter(r => r.missingCount === 0);
  const alchemyPotential = results.filter(r => r.missingCount >= 1 && r.missingCount <= 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-primary/10 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-bold text-accent uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
            Lab Discovery Suite
          </div>
          <h1 className="font-poiret text-5xl md:text-7xl uppercase tracking-widest text-primary leading-none">
            Pantry <span className="text-accent underline decoration-accent/20 underline-offset-8">Alchemy</span>
          </h1>
          <p className="text-sm text-primary/60 uppercase tracking-widest font-semibold max-w-xl">
            Reveal personalized culinary potential across 97,000 global recipes.
          </p>
        </div>

        <div className="flex items-center gap-5 bg-white p-4 rounded-3xl border border-primary/10 shadow-sm">
           <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold text-primary/40 uppercase tracking-widest">Alchemy Mode</span>
              <span className={`text-xs font-black uppercase tracking-widest ${alchemyMode ? 'text-accent' : 'text-primary/20'}`}>{alchemyMode ? 'Active' : 'Standby'}</span>
           </div>
           <button 
             onClick={() => setAlchemyMode(!alchemyMode)}
             className={`w-16 h-9 rounded-full transition-all duration-300 relative shadow-inner ${alchemyMode ? 'bg-accent' : 'bg-primary/5'}`}
           >
              <div className={`absolute top-1.5 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-md ${alchemyMode ? 'left-8' : 'left-2'}`} />
           </button>
        </div>
      </header>

      {/* HORIZONTAL PANTRY TOOLS */}
      <div className="space-y-8">
        <section className="p-6 rounded-[2.5rem] bg-white border border-primary/10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Elements Selection */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pantry Elements</h2>
              <span className="text-[10px] font-black text-accent bg-accent/5 px-3 py-1 rounded-lg border border-accent/10">{ingredients.length}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {ingredients.length === 0 ? (
                <div className="w-full text-center py-4 border-2 border-dashed border-primary/5 rounded-2xl bg-primary/[0.02]">
                  <p className="text-[9px] text-primary/30 uppercase tracking-widest font-bold italic">No elements detected</p>
                </div>
              ) : ingredients.map(ing => (
                <button key={ing} onClick={() => toggleIngredient(ing)}
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-accent hover:-translate-y-0.5 shadow-md shadow-primary/10">
                  {ing} <span className="ml-1 opacity-50 font-normal">✕</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input type="text" value={customInput} onChange={e => setCustomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="ADD ELEMENT..." className="flex-1 bg-primary/[0.02] border border-primary/10 rounded-2xl px-4 py-2 text-[9px] font-bold text-primary uppercase tracking-[0.1em] outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/5" />
              <button onClick={addCustom} className="px-5 rounded-2xl bg-primary text-white font-bold hover:bg-accent transition-all shadow-lg shadow-primary/10">+</button>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleVisionScan} />
              <button onClick={() => fileInputRef.current?.click()} disabled={scanning}
                className={`px-6 py-2 rounded-2xl bg-gradient-to-r from-primary to-slate-800 text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl ${scanning ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {scanning ? '🧬...' : '📸 SCAN'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
             <InsightBanner ingredients={ingredients} />
          </div>
        </section>

        {/* Elemental Shelf (Categories as Toggle Buttons) */}
        <section className="p-6 rounded-[2.5rem] bg-primary/[0.02] border border-primary/5 space-y-6">
          <div className="flex flex-wrap gap-2">
            {Object.keys(INGREDIENT_SHELF).map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20 scale-105' : 'bg-white border-primary/10 text-primary/40 hover:text-primary hover:border-primary/30'}`}>
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {INGREDIENT_SHELF[activeCategory]?.map(ing => {
              const on = ingredients.includes(ing.toLowerCase());
              return (
                <button key={ing} onClick={() => toggleIngredient(ing)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${on ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-primary/10 text-primary/60 hover:border-primary/30 hover:bg-white active:scale-95'}`}>
                  {ing}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* RESULTS DECK */}
      <main className="space-y-16">
        
        {ingredients.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
             <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-6xl opacity-20">⌬</div>
             <div className="space-y-4">
               <h2 className="font-poiret text-4xl text-primary/10 uppercase tracking-[0.4em]">Initialize Pantry</h2>
               <p className="text-[10px] text-primary/10 uppercase tracking-[0.6em] font-black">Scan or input items to begin sequence</p>
             </div>
          </div>
        ) : (
          <>
            {/* Ready Matches */}
            {readyNow.length > 0 && (
              <section className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="flex items-center justify-between border-b-2 border-green-500/10 pb-3">
                  <h2 className="text-sm font-black text-green-600 uppercase tracking-[0.3em] flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                     Perfect Synthesis
                  </h2>
                  <span className="text-xs font-black text-primary/20 uppercase tracking-widest">{readyNow.length} Blueprints</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {readyNow.map(r => (
                    <RecipeResultCard key={r._id} recipe={r} isReady dnaMatch={calculateDNAMatch(r)} />
                  ))}
                </div>
              </section>
            )}

            {/* Alchemy Potential */}
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
              <div className="flex items-center justify-between border-b-2 border-primary/5 pb-3">
                  <h2 className="text-sm font-black text-primary/40 uppercase tracking-[0.3em] flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-primary/20" />
                     Alchemist Discoveries
                  </h2>
                  <span className="text-xs font-black text-primary/20 uppercase tracking-widest">{alchemyPotential.length} Reachable</span>
              </div>
              
              {!alchemyMode && (
                <div className="p-16 rounded-[2.5rem] bg-gradient-to-br from-primary/[0.03] to-white border-2 border-dashed border-primary/10 text-center space-y-6">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-3xl">🔮</div>
                  <div className="space-y-2">
                     <p className="text-xs text-primary font-black uppercase tracking-[0.2em]">Deep Scan Available</p>
                     <p className="text-sm text-primary/40 max-w-sm mx-auto font-medium">97,000+ recipes can be "morphed" using AI substitutions if you activate Alchemy.</p>
                  </div>
                  <button onClick={() => setAlchemyMode(true)} className="px-8 py-3.5 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-accent transition-all shadow-2xl shadow-primary/20 active:scale-95">Initiate Alchemy Search</button>
                </div>
              )}

              {alchemyMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {alchemyPotential.map(r => (
                    <RecipeResultCard key={r._id} recipe={r} dnaMatch={calculateDNAMatch(r)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* No results */}
        {ingredients.length > 0 && results.length === 0 && !loading && (
          <div className="py-24 text-center space-y-8 animate-in zoom-in-95 duration-700">
            <span className="text-8xl opacity-10">⌬</span>
            <div className="space-y-4">
              <h3 className="font-poiret text-4xl text-primary/20 uppercase tracking-widest">Synthesis Failure</h3>
              <p className="text-[11px] text-primary/20 uppercase tracking-widest font-black">Adjust elements for global potential</p>
              <Link to="/chef" className="inline-block mt-6 px-10 py-4 border-2 border-primary/5 rounded-2xl text-[11px] font-black text-primary/40 uppercase tracking-[0.2em] hover:border-accent/40 hover:text-accent transition-all">
                 Consult Chef AI Intelligence →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
