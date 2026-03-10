import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 sm:mt-24 px-4">
      <div className="premium-card space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-poiret uppercase tracking-widest">Welcome Back</h1>
          <p className="text-xs text-accent/50 uppercase tracking-[0.2em] mt-2">Access your culinary suite</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="chef@recipeai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right mt-2">
              <Link to="#" className="text-[10px] uppercase tracking-widest text-accent/40 hover:text-accent transition-colors">Forgot Password?</Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs text-accent/40 uppercase tracking-widest">
            New here? <Link to="/signup" className="text-accent border-b border-accent/20 pb-0.5 ml-1">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
