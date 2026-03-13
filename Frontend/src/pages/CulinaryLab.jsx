import { Link } from 'react-router-dom';

const CulinaryLab = () => {
  const experiments = [
    {
      id: 'vision',
      title: 'Kitchen Vision',
      emoji: '👁️',
      desc: 'Harness the power of Computer Vision. Capture your ingredients and let AI architect your next meal instantly.',
      status: 'Live & Stable',
      link: '/search',
      cta: 'Launch Scanner',
      accent: '#FF6B00',
      bg: 'linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(20,10,0,0.4) 100%)'
    },
    {
      id: 'ghost',
      title: 'Ghost Chef',
      emoji: '🎙️',
      desc: 'Experience zero-touch culinary guidance. Command your kitchen with voice while your hands create art.',
      status: 'In AI Beta',
      link: '#',
      cta: 'Available in Recipes',
      accent: '#00F0FF',
      bg: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,20,20,0.4) 100%)'
    },
    {
      id: 'alchemist',
      title: 'Recipe Alchemist',
      emoji: '🧪',
      desc: 'The ultimate recipe mutator. Morph any dish across cuisines, diets, and skill levels with a single click.',
      status: 'High-Tech Alpha',
      link: '#',
      cta: 'Available in Recipes',
      accent: '#CC00FF',
      bg: 'linear-gradient(135deg, rgba(204,0,255,0.15) 0%, rgba(20,0,20,0.4) 100%)'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-20">
      <header className="text-center space-y-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 blur-[120px] -z-10 rounded-full" />

        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-md text-[11px] uppercase tracking-[0.5em] text-accent font-black animate-pulse">
          Experimental Pulse
        </div>

        <h1 className="font-poiret text-6xl md:text-8xl uppercase tracking-[0.25em] text-primary leading-tight">
          Culinary <span className="text-accent underline decoration-accent/10 underline-offset-8">Lab</span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm md:text-base text-primary/60 uppercase tracking-[0.15em] leading-relaxed font-light">
          Where Generative AI meets the pan. Explore our suite of <span className="text-primary font-bold">multimodal experiments</span> designed to revolutionize your kitchen workflow.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {experiments.map((exp) => (
          <div
            key={exp.id}
            className="group relative flex flex-col p-8 rounded-[2rem] border border-white/10 bg-black/60 backdrop-blur-2xl h-full transition-all duration-700 hover:border-accent/40 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Background Gradient Layer */}
            <div
              className="absolute inset-0 opacity-20 group-hover:opacity-50 transition-opacity duration-700 -z-10"
              style={{ background: exp.bg }}
            />

            {/* Animated Glow Component */}
            <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-accent/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                {exp.emoji}
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border transition-all duration-500"
                style={{
                  borderColor: `${exp.accent}60`,
                  color: '#FFFFFF',
                  backgroundColor: exp.accent
                }}
              >
                {exp.status}
              </span>
            </div>

            <div className="space-y-4 flex-1">
              <h2 className="font-poiret text-3xl uppercase tracking-widest text-white group-hover:text-accent transition-colors duration-500 leading-none">
                {exp.title}
              </h2>
              <p className="text-sm text-white leading-relaxed uppercase tracking-widest font-bold">
                {exp.desc}
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5">
              {exp.link === '#' ? (
                <div
                  className="w-full py-5 rounded-2xl border border-white/10 bg-white/10 text-center text-[11px] uppercase tracking-[0.4em] text-white/90 font-bold"
                >
                  {exp.cta}
                </div>
              ) : (
                <Link
                  to={exp.link}
                  className="w-full py-5 rounded-2xl bg-accent text-background text-center text-[11px] uppercase tracking-[0.4em] font-black hover:tracking-[0.5em] transition-all duration-500 flex items-center justify-center gap-2 group/btn"
                >
                  {exp.cta}
                  <span className="group-hover/btn:translate-x-2 transition-transform">→</span>
                </Link>
              )}
            </div>

            {/* Interactive Corner Light */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
          </div>
        ))}
      </div>

      <div className="premium-card bg-surface/20 border-dashed border-primary/20 text-center py-16 group hover:border-accent/40 transition-colors">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-12 bg-primary/10" />
          <span className="text-[11px] uppercase tracking-[0.8em] text-primary/30 font-bold group-hover:text-accent/60 transition-colors">
            Infinite Potential
          </span>
          <div className="h-px w-12 bg-primary/10" />
        </div>
        <p className="max-w-lg mx-auto text-xs text-primary/40 uppercase tracking-widest leading-loose">
          Our researchers are currently training new vision and voice models to further integrate AI into your physical kitchen experience.
        </p>
      </div>
    </div>
  );
};

export default CulinaryLab;
