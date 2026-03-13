import { Link } from 'react-router-dom';

const CulinaryLab = () => {
  const experiments = [
    {
      id: 'vision',
      title: 'Kitchen Vision',
      emoji: '👁️',
      desc: 'Snap a photo of your fridge and let AI detect every ingredient instantly.',
      status: 'Live',
      link: '/search',
      cta: 'Open Scanner',
      bg: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 100%)'
    },
    {
      id: 'ghost',
      title: 'Ghost Chef',
      emoji: '🎙️',
      desc: 'Hands-free cooking mode. Control recipes with your voice while your hands are busy.',
      status: 'Limited Beta',
      link: '#',
      cta: 'Coming to Recipes',
      bg: 'linear-gradient(135deg, #001a1a 0%, #002d2d 100%)'
    },
    {
      id: 'alchemist',
      title: 'Recipe Alchemist',
      emoji: '🧪',
      desc: '"Morph" any recipe. Turn a pasta into a curry or make it vegan with one click.',
      status: 'Alpha',
      link: '#',
      cta: 'Coming to Recipes',
      bg: 'linear-gradient(135deg, #1a001a 0%, #2d002d 100%)'
    }
  ];

  return (
    <div className="space-y-12 mt-16 pb-24">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-accent/20 bg-accent/5 text-[10px] uppercase tracking-[0.4em] text-accent font-bold">
          High-Tech Culinary Studio
        </div>
        <h1 className="font-poiret text-5xl lg:text-7xl uppercase tracking-[0.2em] text-primary">
          Culinary <span className="text-accent underline decoration-accent/20">Lab</span>
        </h1>
        <p className="max-w-xl mx-auto text-sm text-primary/40 uppercase tracking-widest leading-relaxed">
          Experimental AI features designed to bridge the gap between imagination and the dinner table.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiments.map((exp) => (
          <div 
            key={exp.id} 
            className="premium-card relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 border-white/5"
            style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: exp.bg }} />
            
            <div className="relative z-10 flex flex-col h-full space-y-6">
              <div className="flex justify-between items-start">
                <span className="text-5xl">{exp.emoji}</span>
                <span className="text-[8px] uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50">
                  {exp.status}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <h2 className="font-poiret text-2xl uppercase tracking-widest text-white group-hover:text-accent transition-colors">
                  {exp.title}
                </h2>
                <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider">
                  {exp.desc}
                </p>
              </div>

              {exp.link === '#' ? (
                <div className="w-full py-4 rounded-xl border border-white/5 bg-white/5 text-center text-[10px] uppercase tracking-[0.3em] text-white/20">
                  {exp.cta}
                </div>
              ) : (
                <Link 
                  to={exp.link}
                  className="w-full py-4 rounded-xl bg-accent text-background text-center text-[10px] uppercase tracking-[0.3em] font-bold hover:scale-[1.02] transition-all shadow-lg shadow-accent/20"
                >
                  {exp.cta} →
                </Link>
              )}
            </div>

            {/* Decorative Pulse */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/30 transition-all" />
          </div>
        ))}
      </div>

      <section className="premium-card bg-surface/30 border-dashed border-primary/10 text-center py-12">
        <p className="text-[10px] uppercase tracking-[0.5em] text-primary/20">
          More Experiments Arriving Soon • Powered by Groq AI
        </p>
      </section>
    </div>
  );
};

export default CulinaryLab;
