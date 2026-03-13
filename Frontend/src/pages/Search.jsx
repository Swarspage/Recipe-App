import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import SaveButton from '../components/SaveButton';

// ── Ingredient shelf ──────────────────────────────────────────────────────────
const INGREDIENT_SHELF = {
  '🥩 Proteins': ['Chicken', 'Mutton', 'Paneer', 'Egg', 'Fish', 'Tofu', 'Dal', 'Chana'],
  '🥦 Vegetables': ['Onion', 'Tomato', 'Spinach', 'Potato', 'Cauliflower', 'Peas', 'Capsicum', 'Brinjal', 'Carrot', 'Mushroom'],
  '🧄 Pantry': ['Ghee', 'Oil', 'Rice', 'Atta', 'Maida', 'Bread', 'Besan', 'Poha'],
  '🧀 Dairy': ['Milk', 'Cream', 'Curd', 'Butter', 'Cheese', 'Khoa'],
  '🌶 Spices': ['Turmeric', 'Cumin', 'Coriander', 'Garam Masala', 'Red Chilli', 'Ginger', 'Garlic'],
};

const MOODS = [
  { id: 'spicy', emoji: '🔥', label: 'Spicy', tags: ['spicy', 'hot'] },
  { id: 'comfort', emoji: '😌', label: 'Comfort', tags: ['comfort', 'creamy', 'dal'] },
  { id: 'quick', emoji: '⚡', label: 'Quick 15m', cookTime: 15 },
  { id: 'party', emoji: '🎉', label: 'Party', tags: ['party', 'snack', 'starter'] },
  { id: 'healthy', emoji: '🥗', label: 'Healthy', tags: ['healthy', 'light'] },
];

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
const RecipeResultCard = ({ recipe, isReady }) => {
  const [imgSrc, setImgSrc] = useState(recipe.imageUrl);
  const cardRef = useRef(null);

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

  const total = recipe.ingredients?.length || 1;
  const isOneAway = recipe.missingCount === 1;

  return (
    <div ref={cardRef} className="premium-card group flex flex-col overflow-hidden !p-0">

      {/* Clickable image area */}
      <Link to={`/recipe/${recipe._id}`} className="block">
        <div className="relative h-40 overflow-hidden rounded-t-2xl">
          {imgSrc ? (
            <img src={imgSrc} alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <span className="text-4xl opacity-20">🍽</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {isReady && (
              <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold bg-green-600 text-white">
                ✔ Cook Now
              </span>
            )}
            {isOneAway && !isReady && (
              <span className="text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white">
                1 Away
              </span>
            )}
          </div>
          {recipe.cookTime && (
            <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/60 text-background">
              ⏱ {recipe.cookTime}m
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3 flex flex-col flex-1">
        <div className="flex-1">
          <Link to={`/recipe/${recipe._id}`}>
            <h3 className="font-poiret text-base text-primary leading-snug group-hover:text-accent transition-colors line-clamp-2">
              {recipe.title}
            </h3>
          </Link>
          <div className="flex gap-2 mt-1 text-[9px] uppercase tracking-widest text-primary/40">
            {recipe.cuisine && <span>{recipe.cuisine}</span>}
            {recipe.difficulty && <span>· {recipe.difficulty}</span>}
          </div>
        </div>

        {/* Missing hint */}
        {recipe.missingIngredients?.length > 0 && recipe.missingCount <= 2 && (
          <div className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            Missing: {recipe.missingIngredients.slice(0, 3).join(', ')}
          </div>
        )}

        <MatchBar matchCount={recipe.matchCount || 0} total={total} />

        {/* Footer: Save + View */}
        <div className="flex items-center justify-between pt-2 border-t border-primary/5">
          <SaveButton recipeId={recipe._id} compact />
          <Link to={`/recipe/${recipe._id}`}
            className="text-[9px] uppercase tracking-widest font-bold text-accent hover:underline">
            View →
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
  const [ingredients, setIngredients] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeMoods, setActiveMoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState(Object.keys(INGREDIENT_SHELF)[0]);
  const [customInput, setCustomInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef(null);

  const doSearch = useCallback(async (ings) => {
    if (ings.length === 0) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api(`/recipes/search?ingredients=${encodeURIComponent(ings.join(','))}&limit=24`);
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

  const toggleMood = (id) => setActiveMoods(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  // Client-side mood filter
  const filtered = results.filter(r => {
    if (activeMoods.length === 0) return true;
    return MOODS.filter(m => activeMoods.includes(m.id)).some(mood => {
      if (mood.cookTime) return r.cookTime && r.cookTime <= mood.cookTime;
      return mood.tags?.some(t => r.tags?.includes(t));
    });
  });

  const readyNow = filtered.filter(r => r.missingCount === 0);
  const oneAway = filtered.filter(r => r.missingCount === 1);
  const potential = filtered.filter(r => r.missingCount > 1);

  return (
    <div className="space-y-10 mt-16">

      {/* ── Header ── */}
      <header className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🧑‍🍳</span>
          <div>
            <h1 className="font-poiret text-4xl lg:text-5xl uppercase tracking-widest text-primary">Fridge-to-Fork</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40 mt-0.5">
              Tell us what's in your pantry · AI finds the perfect dish
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">

        {/* LEFT PANEL */}
        <aside className="lg:col-span-3 space-y-5 lg:sticky top-24">

          {/* Your Pantry */}
          <div className="premium-card !p-4 space-y-3 border-accent/20">
            <div className="text-[8px] uppercase tracking-[0.3em] text-accent font-bold">Your Pantry</div>

            {ingredients.length === 0 ? (
              <p className="text-xs text-primary/30 italic">Click ingredients below to add them…</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {ingredients.map(ing => (
                  <button key={ing} onClick={() => toggleIngredient(ing)}
                    className="group flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-primary text-background hover:bg-accent transition-all">
                    {ing} <span className="opacity-50 group-hover:opacity-100">✕</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom input */}
            <div className="flex gap-2 pt-1 border-t border-primary/5">
              <input type="text" value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                placeholder="Add custom ingredient…"
                className="flex-1 input-field text-xs" />
                <button onClick={addCustom}
                className="btn-primary px-4 py-1 text-sm">+</button>
            </div>

            {/* Kitchen Vision Button */}
            <div className="pt-2">
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleVisionScan}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={scanning}
                className={`w-full py-2.5 rounded-xl border border-dashed border-accent/40 text-accent bg-accent/5 flex items-center justify-center gap-2 transition-all hover:bg-accent/10 ${scanning ? 'animate-pulse cursor-not-allowed opacity-50' : ''}`}
              >
                {scanning ? '🩻 Scanning Kitchen...' : '📸 Snap Fridge/Pantry'}
              </button>
              <p className="text-[8px] uppercase tracking-widest text-center text-primary/30 mt-2">
                AI will detect ingredients from your photo
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <InsightBanner ingredients={ingredients} />

          {/* Mood Filters */}
          <div className="space-y-2">
            <div className="text-[8px] uppercase tracking-[0.3em] text-primary/40 font-bold">Cook by Mood</div>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(mood => (
                <button key={mood.id} onClick={() => toggleMood(mood.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider border transition-all hover:scale-105 ${activeMoods.includes(mood.id)
                      ? 'bg-primary text-background border-primary'
                      : 'bg-surface/50 text-primary/60 border-primary/10 hover:border-primary/30'
                    }`}>
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ingredient Shelf */}
          <div className="space-y-3">
            <div className="text-[8px] uppercase tracking-[0.3em] text-primary/40 font-bold">Ingredient Shelf</div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(INGREDIENT_SHELF).map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wide border transition-all ${activeCategory === cat
                      ? 'bg-accent text-background border-accent'
                      : 'bg-surface/50 text-primary/50 border-primary/10 hover:border-accent/40'
                    }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Ingredient pills */}
            <div className="flex flex-wrap gap-1.5">
              {INGREDIENT_SHELF[activeCategory]?.map(ing => {
                const on = ingredients.includes(ing.toLowerCase());
                return (
                  <button key={ing} onClick={() => toggleIngredient(ing)}
                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider border transition-all hover:scale-105 ${on ? 'bg-primary text-background border-primary shadow-md' : 'bg-surface/50 text-primary/60 border-primary/10 hover:border-primary/30'
                      }`}>
                    {ing}
                  </button>
                );
              })}
            </div>
          </div>

          {ingredients.length > 0 && (
            <button onClick={() => { setIngredients([]); setResults([]); }}
              className="text-[9px] uppercase tracking-widest text-primary/30 hover:text-accent transition-colors w-full text-center pt-2">
              ✕ Clear all
            </button>
          )}
        </aside>

        {/* RIGHT PANEL */}
        <main className="lg:col-span-7 space-y-10">

          {/* Empty state */}
          {!loading && ingredients.length === 0 && (
            <div className="py-24 flex flex-col items-center text-center gap-5">
              <div className="text-8xl opacity-10">🥘</div>
              <div className="space-y-2">
                <h2 className="font-poiret text-2xl uppercase tracking-widest text-primary/30">What's in your fridge?</h2>
                <p className="text-[10px] uppercase tracking-widest text-primary/20">Pick ingredients from the shelf · AI finds your perfect dish</p>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-surface h-64" />
              ))}
            </div>
          )}

          {/* ✔ Ready to Cook */}
          {!loading && readyNow.length > 0 && (
            <section className="space-y-5">
              <SectionHeader label="✔ Ready to Cook" count={readyNow.length} color="#16a34a" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {readyNow.map(r => <RecipeResultCard key={r._id} recipe={r} isReady />)}
              </div>
            </section>
          )}

          {/* ⭐ One Ingredient Away */}
          {!loading && oneAway.length > 0 && (
            <section className="space-y-5">
              <SectionHeader label="⭐ Just 1 Away — Buy It!" count={oneAway.length} color="#d97706" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {oneAway.map(r => <RecipeResultCard key={r._id} recipe={r} />)}
              </div>
            </section>
          )}

          {/* 🌀 More Potential */}
          {!loading && potential.length > 0 && (
            <section className="space-y-5">
              <SectionHeader label="🌀 Culinary Potential" count={potential.length} color="#8D7B6D" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {potential.slice(0, 9).map(r => <RecipeResultCard key={r._id} recipe={r} />)}
              </div>
            </section>
          )}

          {/* No results */}
          {!loading && ingredients.length > 0 && filtered.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="text-6xl opacity-20">🤔</div>
              <p className="font-poiret text-xl text-primary/30 uppercase tracking-widest">No matches found</p>
              <p className="text-[10px] uppercase tracking-widest text-primary/20">Try removing a mood filter or adding more ingredients</p>
              <Link to="/chef"
                className="inline-flex items-center gap-2 mt-3 btn-primary text-sm">
                🤖 Let Chef AI create a recipe instead
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
