import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Utensils, LogOut, User as UserIcon, Calendar, Menu } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link href="/pantry" className={`text-sm font-medium transition-colors hover:text-secondary ${location === '/pantry' ? 'text-secondary' : 'text-primary'}`}>
        Pantry
      </Link>
      <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-secondary ${location === '/dashboard' ? 'text-secondary' : 'text-primary'}`}>
        Dashboard
      </Link>
      <Link href="/planner" className={`text-sm font-medium transition-colors hover:text-secondary ${location === '/planner' ? 'text-secondary' : 'text-primary'}`}>
        Planner
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = "/"}>
            <Utensils className="w-8 h-8 text-primary" />
            <div className="flex flex-col -gap-1">
              <span className="font-serif text-3xl font-bold text-primary leading-none">Zest</span>
              <span className="font-serif text-xs italic text-secondary leading-none ml-1">by you</span>
            </div>
          </div>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden md:flex items-center gap-8">
              <NavLinks />
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <UserIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-5 py-2 rounded-full font-medium border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 inline-block mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-primary font-medium hover:text-secondary transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-6 py-2.5 rounded-full font-medium bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Join Zest
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-border px-4 py-4 space-y-4 shadow-xl"
          >
            {user ? (
              <>
                <div className="flex flex-col gap-4 mb-6">
                  <NavLinks />
                  <Link href="/profile" className="text-sm font-medium text-primary">Profile</Link>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full px-5 py-3 rounded-full font-medium bg-primary/10 text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Link href="/login" className="w-full text-center px-5 py-3 rounded-full font-medium border border-primary/20 text-primary">
                  Sign In
                </Link>
                <Link href="/register" className="w-full text-center px-5 py-3 rounded-full font-medium bg-primary text-white">
                  Join Zest
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
