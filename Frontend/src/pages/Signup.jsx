import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0); // 0-3
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const pw = formData.password;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    setStrength(s);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (strength < 2) {
      return setError('Password is too weak');
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      navigate('/profile');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const strengthLabels = ['Weak', 'Medium', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  return (
    <div className="max-w-md mx-auto mt-12 sm:mt-16 px-4">
      <div className="premium-card space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-poiret uppercase tracking-widest">Join the Circle</h1>
          <p className="text-xs text-accent/50 uppercase tracking-[0.2em] mt-2">Step into the future of taste</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Full Name</label>
            <input
              type="text"
              required
              className="input-field text-sm"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              autoFocus
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Email</label>
            <input
              type="email"
              required
              className="input-field text-sm"
              placeholder="jane@palette.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Password</label>
            <input
              type="password"
              required
              className="input-field text-sm"
              placeholder="Min 8 chars, 1 Upper, 1 Digit"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-0.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`flex-1 rounded-full ${i < strength ? strengthColors[strength-1] : 'bg-white/10'}`}></div>
                  ))}
                </div>
                <p className="text-[8px] uppercase tracking-[0.2em] text-accent/40 font-bold">
                  Strength: <span className={strength > 0 ? strengthColors[strength-1].replace('bg-','text-') : ''}>{strengthLabels[strength-1] || 'Poor'}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase tracking-widest text-accent/60 mb-1 ml-1">Confirm Password</label>
            <input
              type="password"
              required
              className="input-field text-sm"
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" required className="accent-accent w-3 h-3 bg-transparent border border-accent/30" />
            <label className="text-[9px] uppercase tracking-widest text-accent/40 leading-none">
              I agree to the <Link to="#" className="text-accent underline decoration-accent/10 ml-1">Privacy Protocol</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 disabled:opacity-50 flex items-center justify-center font-bold uppercase tracking-widest text-xs"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin"></div>
            ) : (
              "Initialize Account"
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-accent/40 uppercase tracking-widest">
            Existing Chef? <Link to="/login" className="text-accent border-b border-accent/20 pb-0.5 ml-1">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
