import { Link } from "wouter";
import { Utensils, Heart, Mail, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="w-8 h-8 text-secondary" />
              <div className="flex flex-col -gap-1">
                <span className="font-serif text-3xl font-bold text-white leading-none">Zest</span>
                <span className="font-serif text-xs italic text-secondary leading-none ml-1">by you</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-sm font-body leading-relaxed text-balance">
              Transform your everyday ingredients into extraordinary culinary experiences. 
              Refined utility for the modern kitchen.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xl text-white mb-6">Navigation</h4>
            <ul className="space-y-3 text-primary-foreground/70 font-body">
              <li><Link href="/dashboard" className="hover:text-secondary transition-colors">Dashboard</Link></li>
              <li><Link href="/pantry" className="hover:text-secondary transition-colors">Your Pantry</Link></li>
              <li><Link href="/planner" className="hover:text-secondary transition-colors">Weekly Planner</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl text-white mb-6">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-secondary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-primary-foreground/50 text-sm flex items-center gap-1 font-body">
              Made with <Heart className="w-3 h-3 text-destructive" /> by Zest
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
