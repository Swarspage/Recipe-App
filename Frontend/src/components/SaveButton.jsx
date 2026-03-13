import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../utils/api';

const BOARDS = ['All Recipes', 'Weeknight Meals', 'Party Food', 'Diet Recipes', 'Weekend Cooking', 'Quick Bites', 'Favourites'];

const SaveButton = ({ recipeId, compact = false, onSaved }) => {
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [board, setBoard]       = useState('All Recipes');
  const [notes, setNotes]       = useState('');
  const [rating, setRating]     = useState(null);
  const [ripples, setRipples]   = useState([]);
  const [error, setError]       = useState('');
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    api(`/cookbook/check/${recipeId}`)
      .then(d => {
        setSaved(d.saved);
        setBoard(d.board || 'All Recipes');
        setNotes(d.notes || '');
        setRating(d.rating || null);
      })
      .catch(() => {});
  }, [recipeId]);

  /* ── ripple ── */
  const addRipple = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(p => [...p, { id, x: e.clientX - b.left, y: e.clientY - b.top }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 650);
  };

  const handleClick = async (e) => {
    e.preventDefault(); e.stopPropagation();
    addRipple(e);
    setError('');
    if (loading || !recipeId) return;

    if (saved) {
      setLoading(true);
      try {
        await api(`/cookbook/${recipeId}`, { method: 'DELETE' });
        setSaved(false);
      } catch (err) {
        setError('Could not unsave');
        setTimeout(() => setError(''), 2500);
      } finally { setLoading(false); }
    } else {
      setShowModal(true);
    }
  };

  const confirmSave = async () => {
    if (!recipeId) { setError('No recipe ID — try refreshing'); return; }
    setLoading(true);
    setError('');
    try {
      await api('/cookbook', { body: { recipeId, board, notes, rating } });
      setSaved(true);
      setShowModal(false);
      onSaved?.({ recipeId, board });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Save failed. Please try again.');
    } finally { setLoading(false); }
  };

  /* ── what to show inside the button ── */
  const icon = loading ? '…' : (saved && hovering) ? '🚫' : saved ? '♥' : '♡';
  const label = saved ? (hovering ? 'Remove' : 'Saved!') : 'Save Recipe';

  const modalContent = showModal && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setShowModal(false)}
      style={{ background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl bg-white animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h3 className="font-poiret text-xl text-primary uppercase tracking-widest">♥ Save Recipe</h3>
          <button onClick={() => setShowModal(false)} className="text-primary/30 hover:text-primary text-xl">✕</button>
        </div>

        {/* Error inside modal */}
        {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        {/* Board */}
        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-[0.3em] text-primary/40 font-bold">Collection</label>
          <div className="flex flex-wrap gap-1.5">
            {BOARDS.map(b => (
              <button key={b} onClick={() => setBoard(b)}
                className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wide border transition-all ${
                  board === b ? 'bg-primary text-background border-primary' : 'bg-surface/50 text-primary/50 border-primary/10 hover:border-accent/40'
                }`}>{b}</button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-[0.3em] text-primary/40 font-bold">Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(rating === n ? null : n)}
                className={`text-2xl transition-all hover:scale-125 ${n <= (rating||0) ? 'text-amber-400' : 'text-primary/15 hover:text-amber-300'}`}>★</button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[8px] uppercase tracking-[0.3em] text-primary/40 font-bold">Note to self</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. reduce salt, great for parties…"
            rows={2} className="w-full input-field text-xs resize-none" />
        </div>

        <button onClick={confirmSave} disabled={loading || !recipeId}
          className="w-full btn-primary text-sm py-3 disabled:opacity-40 relative overflow-hidden transition-all active:scale-[0.98]"
          style={{ background: loading ? '#ddd' : 'linear-gradient(135deg,#2A1A14,#5a3928)', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
               <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
               <span>Saving...</span>
            </div>
          ) : '♥ Save to My Cookbook'}
        </button>

        {!recipeId && <p className="text-[9px] text-center text-red-400 font-bold animate-pulse">Wait! Recipe still alchemizing...</p>}
      </div>
    </div>
  );

  return (
    <>
      <style>{`@keyframes sv-ripple{to{width:220px;height:220px;opacity:0}}`}</style>

      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={loading}
        title={!recipeId ? 'Generating recipe…' : saved ? 'Click to remove' : 'Save to cookbook'}
        style={{ position: 'relative', overflow: 'hidden', cursor: loading ? 'wait' : 'pointer' }}
        className={`transition-all duration-200 select-none flex items-center gap-1.5 ${
          compact
            ? `w-9 h-9 rounded-full justify-center border-2 text-base font-bold
               ${saved
                 ? hovering
                   ? 'bg-red-100 border-red-400 text-red-500'
                   : 'bg-red-500 border-red-500 text-white shadow-md'
                 : 'bg-white border-primary/20 text-primary/40 hover:border-red-400 hover:text-red-400'}`
            : `px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border-2
               ${saved
                 ? hovering
                   ? 'border-red-400 text-red-500 bg-red-50'
                   : 'bg-red-500 border-red-500 text-white shadow-md'
                 : 'border-accent/40 text-accent hover:bg-red-500 hover:border-red-500 hover:text-white'}`
        }`}
      >
        {/* ripple spans */}
        {ripples.map(r => (
          <span key={r.id} style={{
            position:'absolute', left:r.x, top:r.y,
            width:0, height:0, borderRadius:'50%',
            background:'rgba(255,255,255,0.45)',
            transform:'translate(-50%,-50%)',
            animation:'sv-ripple 0.65s ease-out',
            pointerEvents:'none',
          }} />
        ))}
        <span style={{ fontSize: compact ? '1rem' : '0.9rem' }}>{icon}</span>
        {!compact && <span>{label}</span>}
      </button>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white text-xs px-5 py-2.5 rounded-full shadow-lg animate-pulse">
          {error}
        </div>
      )}

      {/* Save modal via Portal to escape parent stacking context */}
      {showModal && createPortal(modalContent, document.body)}
    </>
  );
};

export default SaveButton;
