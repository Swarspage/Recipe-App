import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Utensils } from "lucide-react";

export default function Login() {
  const { login, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password }, {
      onSuccess: () => setLocation("/dashboard")
    });
  };

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-card p-8 md:p-10 rounded-[24px] shadow-premium border border-border/50">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/5 mb-4">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your digital kitchen</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-full bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-8 text-muted-foreground text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-secondary font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
