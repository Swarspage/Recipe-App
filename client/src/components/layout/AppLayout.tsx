import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export function AppLayout({ children, requireAuth = false }: { children: ReactNode, requireAuth?: boolean }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-secondary" />
        <p className="font-serif text-2xl animate-pulse">Preparing your kitchen...</p>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Redirect to={`/login?returnTo=${encodeURIComponent(location)}`} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-secondary selection:text-white">
      <Navbar />
      <main className="flex-grow flex flex-col relative w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
