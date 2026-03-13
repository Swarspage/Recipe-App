import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ── Animated counter ──────────────────────────────────────────────────────────
const Counter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ── Floating badge ────────────────────────────────────────────────────────────
const FloatingBadge = ({ emoji, text, className }) => (
  <div className={`absolute flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-xl border border-primary/5 animate-bounce ${className}`}
    style={{ animation: 'float 3s ease-in-out infinite' }}>
    <span className="text-lg">{emoji}</span>
    <span className="text-[10px] uppercase tracking-widest text-primary/70 font-bold whitespace-nowrap">{text}</span>
  </div>
);

// ── Feature card ──────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay, to }) => (
  <Link to={to}
    className="premium-card group cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 space-y-5 relative overflow-hidden"
    style={{ animationDelay: delay }}>
    <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/5 -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors duration-500" />
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="space-y-2">
      <h3 className="font-poiret text-xl uppercase tracking-wider">{title}</h3>
      <p className="text-sm text-accent/70 leading-relaxed">{desc}</p>
    </div>
    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-accent font-bold group-hover:gap-4 transition-all">
      <span>Explore</span>
      <span className="transition-transform group-hover:translate-x-2">→</span>
    </div>
  </Link>
);

// ── Marquee strip items ───────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  '🍛 Butter Chicken', '🫓 Garlic Naan', '🥘 Dal Makhani', '🍝 Pasta Carbonara',
  '🫕 Biryani', '🍜 Ramen', '🥗 Avocado Bowl', '🍱 Sushi Platter',
  '🫙 Masala Chai', '🍰 Gulab Jamun', '🌮 Tacos', '🫔 Shawarma',
];

const Home = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Parallax on hero
  useEffect(() => {
    const handleMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 20,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 10,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="space-y-0">
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-fadeup { animation: fadeUp 0.8s ease-out forwards; }
        .animate-scalein { animation: scaleIn 0.9s ease-out forwards; }
        .marquee-track { animation: marquee 28s linear infinite; }
        .text-shimmer {
          background: linear-gradient(90deg, #2A1A14 0%, #8D7B6D 40%, #C4956A 60%, #2A1A14 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .hero-section {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          position: relative;
        }
      `}</style>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef}
        className="relative h-screen w-full flex items-center overflow-hidden"
        style={{ background: '#1a0e0a' }}>

        {/* Background image with parallax */}
        <div className="absolute inset-0 overflow-hidden w-full h-full">
          <img
            src="/hero-food.png"
            alt="Gourmet food spread"
            className="w-full h-full object-cover opacity-60 scale-110"
            style={{
              transform: `scale(1.1) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              transition: 'transform 0.1s ease-out',
              width: '100vw',
              height: '100vh'
            }}
          />
          {/* Deep gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/20" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C4956A 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8D7B6D 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24 grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* Left: text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 animate-fadeup"
              style={{ animationDelay: '0.1s' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold">AI-Powered · Indian Cuisine First</span>
            </div>

            <h1 className="font-poiret text-white leading-tight animate-fadeup" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', animationDelay: '0.2s' }}>
              Cook  Smarter.<br />
              <span className="text-shimmer">Eat Better.</span><br />
              <span className="text-white/60 text-[0.6em]">Every. Single. Day.</span>
            </h1>

            <p className="text-white/60 text-lg max-w-lg leading-relaxed animate-fadeup" style={{ animationDelay: '0.35s' }}>
              Your personal AI chef that creates custom recipes from your pantry, guides your cooking, and builds a personalised cookbook — made for Indian kitchens.
            </p>

            <div className="flex flex-wrap gap-4 animate-fadeup" style={{ animationDelay: '0.5s' }}>
              <Link to="/search"
                className="group flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl hover:shadow-white/20">
                <span>🔍 Find Recipes</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link to="/chef"
                className="flex items-center gap-3 border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                🤖 Ask Chef AI
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4 animate-fadeup" style={{ animationDelay: '0.65s' }}>
              {[
                { value: 97000, suffix: '+', label: 'Recipes' },
                { value: 12, suffix: '', label: 'Cuisines' },
                { value: 100, suffix: '%', label: 'AI Powered' },
              ].map(({ value, suffix, label }) => (
                <div key={label} className="text-center">
                  <div className="font-poiret text-3xl text-white">
                    <Counter target={value} suffix={suffix} />
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating food cards */}
          <div className="relative h-[520px] hidden lg:block animate-scalein" style={{ animationDelay: '0.3s' }}>
            {/* Main image card */}
            <div className="absolute left-8 top-10 w-64 rounded-3xl overflow-hidden shadow-2xl"
              style={{ transform: `rotate(-3deg) translate(${mousePos.x * -0.1}px, ${mousePos.y * -0.1}px)` }}>
              <img src="/food-card-1.png" alt="Butter Chicken" className="w-full h-48 object-cover" />
              <div className="bg-white p-4 space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-accent/50 font-bold">🔥 Trending Today</p>
                <h3 className="font-poiret text-lg text-primary">Butter Chicken</h3>
                <p className="text-[10px] text-primary/40">45 min · Medium · Indian</p>
              </div>
            </div>

            {/* Second card */}
            <div className="absolute right-4 top-4 w-56 rounded-3xl overflow-hidden shadow-2xl"
              style={{ transform: `rotate(2deg) translate(${mousePos.x * 0.12}px, ${mousePos.y * 0.08}px)` }}>
              <img src="/food-card-2.png" alt="Indian Thali" className="w-full h-44 object-cover" />
              <div className="bg-white p-4 space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-green-600 font-bold">✦ Chef AI Special</p>
                <h3 className="font-poiret text-lg text-primary">Full Thali</h3>
                <p className="text-[10px] text-primary/40">60 min · Festive</p>
              </div>
            </div>

            {/* Floating badges */}
            <FloatingBadge emoji="⭐" text="4.9 Rating" className="right-16 bottom-32"
              style={{ animationDelay: '0s', animation: 'float 3.2s ease-in-out infinite' }} />
            <FloatingBadge emoji="🤖" text="AI Generated" className="left-4 bottom-20"
              style={{ animationDelay: '0.5s', animation: 'float 2.8s ease-in-out infinite' }} />
            <FloatingBadge emoji="🇮🇳" text="Indian First" className="right-2 top-52"
              style={{ animationDelay: '1s', animation: 'float 3.5s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/30 text-[8px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ═══════════════════ MARQUEE STRIP ═══════════════════ */}
      <div className="overflow-hidden py-4 bg-primary border-y border-white/10">
        <div className="marquee-track flex gap-8 whitespace-nowrap w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-white/40 text-xs uppercase tracking-widest font-bold px-4">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <p className="text-[10px] uppercase tracking-[0.5em] text-accent/50 font-bold">Why Chefs Love Us</p>
          <h2 className="font-poiret text-5xl text-primary leading-tight">
            Everything your kitchen<br />
            <span className="text-accent">needs in one place</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="🤖" title="Chef AI" to="/chef"
            desc="Chat with your personal AI chef. Get custom recipes, substitutions, and cooking guidance — all food-only, all nutritional data included."
            delay="0s" />
          <FeatureCard
            icon="🧺" title="Fridge to Fork" to="/search"
            desc="Tell us what's in your fridge. Get recipes using exactly what you have — with a visual ingredient shelf and smart AI insights."
            delay="0.1s" />
          <FeatureCard
            icon="📖" title="My Cookbook" to="/profile"
            desc="Save recipes to personal collections. Build your AI Taste Profile — rated, noted, and beautifully organised just for you."
            delay="0.2s" />
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon="🇮🇳" title="Indian First" to="/search"
            desc="500+ authentic Indian recipes from the iconic butter chicken to regional gems — curated with love for Indian kitchens and tastes."
            delay="0.3s" />
          <FeatureCard
            icon="🥗" title="Nutrition Always" to="/chef"
            desc="Every Chef AI recipe includes a full nutrition table — calories, protein, carbs, fat, fiber and sodium — no guessing needed."
            delay="0.4s" />
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0e0a, #2A1A14)' }}>
        <div className="absolute inset-0 opacity-10">
          <img src="/hero-food.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">The Process</p>
            <h2 className="font-poiret text-5xl text-white">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🧺', title: 'Pick ingredients', desc: 'Tell us what\'s in your pantry or describe what you\'re craving.' },
              { step: '02', icon: '🤖', title: 'AI creates magic', desc: 'Chef AI builds a complete recipe with steps, nutrition, and tips just for you.' },
              { step: '03', icon: '♥', title: 'Save & repeat', desc: 'Save to your cookbook, rate it, add a note. Build your taste profile over time.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center space-y-5 group">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10 group-hover:border-white/30 transition-all" />
                  <div className="absolute -top-2 -right-2 text-[10px] font-bold text-accent/60 bg-primary/80 px-2 py-0.5 rounded-full border border-accent/20">{step}</div>
                  <div className="w-full h-full flex items-center justify-center text-3xl">{icon}</div>
                </div>
                <h3 className="font-poiret text-xl text-white uppercase tracking-wider">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOCIAL PROOF / CUISINES ═══════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="font-poiret text-5xl text-primary">Cuisines we love</h2>
          <p className="text-accent/60 max-w-md mx-auto">From the streets of Mumbai to the kitchens of Rome — we've got authentic recipes for every craving.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { flag: '🇮🇳', name: 'Indian', count: '200+' },
            { flag: '🇮🇹', name: 'Italian', count: '60+' },
            { flag: '🇯🇵', name: 'Japanese', count: '40+' },
            { flag: '🇲🇽', name: 'Mexican', count: '35+' },
            { flag: '🇹🇭', name: 'Thai', count: '30+' },
            { flag: '🇨🇳', name: 'Chinese', count: '45+' },
          ].map(({ flag, name, count }) => (
            <Link key={name} to="/search"
              className="premium-card text-center py-6 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-2 group-hover:scale-125 transition-transform">{flag}</div>
              <div className="font-poiret text-sm text-primary">{name}</div>
              <div className="text-[9px] uppercase tracking-widest text-accent/40 mt-1">{count} recipes</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="mx-6 mb-16 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #2A1A14 0%, #5a3520 50%, #2A1A14 100%)' }}>
        <div className="absolute inset-0 opacity-20">
          <img src="/hero-food.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/80" />

        {/* Floating circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/10 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 py-20 px-8 text-center space-y-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">Ready to Cook?</p>
          <h2 className="font-poiret text-5xl lg:text-6xl text-white">
            Your next favourite<br />recipe is one click away
          </h2>
          <p className="text-white/50 max-w-md mx-auto">
            Join thousands of home cooks who've discovered the joy of AI-assisted, personalised cooking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup"
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl">
              ✨ Start Cooking Free
            </Link>
            <Link to="/chef"
              className="border-2 border-white/30 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-sm">
              🤖 Try Chef AI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
