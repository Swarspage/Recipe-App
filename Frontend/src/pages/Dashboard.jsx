import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

// --- Time-aware helpers ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5)  return { text: 'Still up late?', emoji: '🌙' };
  if (hour < 12) return { text: 'Good Morning',   emoji: '☀️' };
  if (hour < 17) return { text: 'Good Afternoon', emoji: '🌤' };
  if (hour < 21) return { text: 'Good Evening',   emoji: '🌅' };
  return         { text: 'Good Night',             emoji: '🌙' };
};

const getMealContext = () => {
  const hour = new Date().getHours();
  if (hour < 10) return { label: "Breakfast ideas", icon: "🍳", desc: "Start your day right" };
  if (hour < 14) return { label: "Lunch is calling", icon: "🥗", desc: "Something light & fresh" };
  if (hour < 19) return { label: "Dinner tonight?", icon: "🍽", desc: "Time to plan your meal" };
  return         { label: "Late night cravings", icon: "🌙", desc: "Something quick & comforting" };
};

const getDate = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
};

// --- Animated Counter ---
const AnimatedStat = ({ value, label, icon }) => (
  <div className="flex flex-col gap-1 text-center p-4">
    <span className="text-2xl">{icon}</span>
    <span className="font-poiret text-3xl text-primary">{value.toLocaleString()}</span>
    <span className="text-[9px] uppercase tracking-widest text-primary/40">{label}</span>
  </div>
);

// --- Skeleton Card ---
const SkeletonCard = () => (
  <div className="premium-card space-y-4 animate-pulse">
    <div className="aspect-video bg-primary/5 rounded-xl" />
    <div className="h-4 bg-primary/5 rounded w-3/4" />
    <div className="h-3 bg-primary/5 rounded w-1/2" />
  </div>
);

// --- CTA Banner ---
const CTABanner = ({ icon, title, desc, to, label, color = 'accent' }) => (
  <Link to={to} className="group">
    <div className={`premium-card border-${color}/10 bg-${color}/5 p-6 flex items-center gap-6 hover:border-${color}/30 transition-all hover:-translate-y-0.5`}>
      <span className="text-4xl">{icon}</span>
      <div className="flex-1">
        <h3 className={`font-poiret text-lg text-${color} uppercase tracking-widest`}>{title}</h3>
        <p className="text-sm text-primary/50 mt-0.5">{desc}</p>
      </div>
      <span className={`text-[10px] uppercase tracking-[0.2em] font-bold text-${color} border-b border-${color}/30 group-hover:border-${color} transition-all pb-0.5`}>
        {label} →
      </span>
    </div>
  </Link>
);

// ============================
// MAIN DASHBOARD
// ============================
const Dashboard = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState({ total: 0, aiGenerated: 0, cuisines: 0 });
  const [loading, setLoading] = useState(true);

  const greeting = getGreeting();
  const mealCtx = getMealContext();
  const firstName = user?.name?.split(' ')[0] || 'Chef';

  useEffect(() => {
    const load = async () => {
      try {
        const [data, statsData] = await Promise.allSettled([
          api('/recipes/dashboard'),
          api('/recipes/stats'),
        ]);
        if (data.status === 'fulfilled') setRecipes(data.value);
        if (statsData.status === 'fulfilled') setStats(statsData.value);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-16">

      {/* ===== HERO WELCOME SECTION ===== */}
      <section className="relative overflow-hidden rounded-3xl min-h-[300px]" style={{
        background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a1a2e 100%)'
      }}>
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #ff6b35, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #ffd700, transparent)' }} />
        <div className="absolute top-1/2 left-0 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #c0392b, transparent)' }} />

        {/* Floating food emojis — decorative */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {[
            { e: '🍛', top: '10%', right: '8%',  size: '4rem', rot: '-8deg',  anim: 'animate-bounce', delay: '0s'    },
            { e: '🫓', top: '60%', right: '20%', size: '3rem', rot: '12deg',  anim: 'animate-pulse',  delay: '0.5s'  },
            { e: '🌶️', top: '20%', right: '32%', size: '2.5rem', rot: '-5deg', anim: 'animate-bounce', delay: '1s'  },
            { e: '🫕', top: '70%', right: '5%',  size: '3.5rem', rot: '8deg',  anim: 'animate-pulse',  delay: '1.5s' },
            { e: '🥘', top: '35%', right: '45%', size: '2rem',   rot: '-12deg', anim: 'animate-bounce', delay: '0.3s' },
            { e: '🫙', top: '80%', right: '38%', size: '2.5rem', rot: '5deg',  anim: 'animate-pulse',  delay: '0.8s' },
          ].map(({ e, top, right, size, rot, anim, delay }, i) => (
            <span key={i} className={`absolute ${anim} opacity-20 hover:opacity-60 transition-opacity`}
              style={{ top, right, fontSize: size, transform: `rotate(${rot})`, animationDelay: delay }}>
              {e}
            </span>
          ))}
        </div>

        {/* Top accent ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 opacity-60" style={{
          background: 'linear-gradient(90deg, #ff6b35, #ffd700, #ff6b35)'
        }} />

        {/* Content */}
        <div className="relative p-8 lg:p-12 flex flex-col justify-between h-full gap-8">
          {/* Top row */}
          <div className="flex items-start justify-between">
            {/* Date + meal chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,107,53,0.3)', color: '#ff9a7a' }}>
              <span>{mealCtx.icon}</span>
              <span>{getDate()}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-[8px] uppercase tracking-widest"
              style={{ background: 'rgba(255,215,0,0.1)', borderColor: 'rgba(255,215,0,0.2)', color: '#ffd700', border: '1px solid' }}>
              🇮🇳 Indian Curated
            </div>
          </div>

          {/* Main greeting area */}
          <div className="space-y-4 max-w-xl">
            {/* Greeting subtitle */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10" style={{ background: 'rgba(255,107,53,0.5)' }} />
              <span className="text-[9px] uppercase tracking-[0.4em]" style={{ color: '#ff9a7a' }}>{mealCtx.label}</span>
            </div>

            {/* Big headline */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-5xl lg:text-6xl drop-shadow-lg">{greeting.emoji}</span>
                <h1 className="font-poiret text-3xl lg:text-5xl uppercase tracking-[0.15em] leading-none"
                  style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {greeting.text},
                </h1>
              </div>
              <h2 className="font-poiret text-4xl lg:text-6xl uppercase tracking-widest mt-1"
                style={{ background: 'linear-gradient(90deg, #ff6b35, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {firstName}
              </h2>
            </div>

            {/* Subtext */}
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {mealCtx.desc} &nbsp;·&nbsp; Your curated Indian picks are ready below.
            </p>

            {/* Action chips */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/search"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                style={{ background: 'linear-gradient(90deg, #ff6b35, #e74c3c)', color: '#fff', boxShadow: '0 4px 20px rgba(255,107,53,0.4)' }}>
                🔍 Find by Ingredients
              </Link>
              <Link to="/chef"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 border"
                style={{ borderColor: 'rgba(255,215,0,0.4)', color: '#ffd700', background: 'rgba(255,215,0,0.08)' }}>
                🤖 Ask Chef AI
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom accent ribbon */}
        <div className="absolute bottom-0 left-0 right-0 h-px opacity-30" style={{
          background: 'linear-gradient(90deg, transparent, #ffd700, transparent)'
        }} />
      </section>


      {/* ===== STATS STRIP ===== */}
      <section className="premium-card border-accent/5 bg-surface/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-primary/5">
          <AnimatedStat icon="🍽" value={stats.total || 6500} label="Recipes" />
          <AnimatedStat icon="🤖" value={stats.aiGenerated || 0} label="AI Created" />
          <AnimatedStat icon="🌍" value={stats.cuisines || 12} label="Cuisines" />
          <AnimatedStat icon="⚡" value={stats.quick || 240} label="Under 15 min" />
        </div>
      </section>

      {/* ===== FEATURED RECIPES ===== */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <h2 className="font-poiret text-2xl uppercase tracking-[0.3em] text-primary">
              Today's Picks
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-primary/30">{mealCtx.label} · Curated for you</p>
          </div>
          <div className="h-px bg-gradient-to-r from-accent/20 to-transparent flex-1" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA BANNERS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CTABanner
          icon="🔍"
          title="Pantry Finder"
          desc="Search by what's in your fridge right now"
          to="/search"
          label="Find recipes"
          color="accent"
        />
        <CTABanner
          icon="🤖"
          title="Chef AI"
          desc="Let AI craft a custom recipe just for you"
          to="/chef"
          label="Start cooking"
          color="accent"
        />
        <CTABanner
          icon="📖"
          title="My Cookbook"
          desc="Your saved recipes and AI creations"
          to="/profile"
          label="View all"
          color="accent"
        />
      </section>
    </div>
  );
};

export default Dashboard;
