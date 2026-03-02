import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Utensils } from "lucide-react";

export default function Register() {
  const { register, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(formData, {
      onSuccess: () => setLocation("/dashboard")
    });
  };

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card p-8 md:p-10 rounded-[24px] shadow-premium border border-border/50">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
              <Utensils className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Join Zest</h1>
            <p className="text-muted-foreground">Elevate your home cooking experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input 
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input 
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-full bg-secondary text-white font-bold hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-8 text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
