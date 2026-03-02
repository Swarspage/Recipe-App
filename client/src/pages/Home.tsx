import { AppLayout } from "@/components/layout/AppLayout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Leaf, CalendarCheck } from "lucide-react";

export default function Home() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* landing page hero scenic cooking environment */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80&auto=format&fit=crop" 
            alt="Hero kitchen" 
            className="w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium tracking-wider uppercase">AI-Powered Culinary Magic</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] mb-6">
              Your pantry,<br/>
              <span className="text-secondary italic font-light">reimagined.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 font-body mb-10 leading-relaxed text-balance max-w-xl">
              Tell us what's in your kitchen. We'll curate premium recipes, suggest brilliant substitutions, and plan your week with algorithmic precision.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="px-8 py-4 rounded-full bg-secondary text-white font-bold text-center hover:bg-secondary/90 shadow-lg shadow-secondary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Start Cooking Now
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-center hover:bg-white/20 transition-all duration-300">
                Sign In to Zest
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Elevate Everyday Cooking</h2>
            <div className="w-24 h-1 bg-secondary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Leaf className="w-8 h-8 text-secondary" />,
                title: "Smart Ingredients",
                desc: "Input your pantry staples using text or voice. We instantly match you with recipes you can make right now, eliminating food waste."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-secondary" />,
                title: "AI Substitutions",
                desc: "Missing an ingredient? Our Zest AI intelligently suggests flavor-matching alternatives based on the exact recipe context."
              },
              {
                icon: <CalendarCheck className="w-8 h-8 text-secondary" />,
                title: "Elegant Planning",
                desc: "Organize your meals with a beautiful drag-and-drop weekly planner. Save favorites and build your personal digital cookbook."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-card p-8 rounded-[24px] shadow-sm border border-border/50 hover:shadow-premium transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold font-serif text-primary mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-body">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
