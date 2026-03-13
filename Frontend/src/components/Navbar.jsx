import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm border-b border-white/10 text-white">
      <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-poiret text-2xl font-bold tracking-widest text-white">
          RECIPE<span className="text-accent">AI</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link>
          <Link to="/search" className="hover:text-accent transition-colors">Pantry Finder</Link>
          <Link to="/chef" className="hover:text-accent transition-colors">Chef AI</Link>
          {user && <Link to="/profile" className="hover:text-accent transition-colors">My Cookbook</Link>}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:inline text-accent/80">Hello, {user.name}</span>
              <button 
                onClick={logout}
                className="text-xs uppercase tracking-widest hover:text-accent transition-colors"
              >
                Logout
              </button>
              <Link to="/profile">
                <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="text-sm hover:text-accent transition-colors">Login</Link>
              <Link to="/signup" className="btn-primary text-sm py-1.5">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
