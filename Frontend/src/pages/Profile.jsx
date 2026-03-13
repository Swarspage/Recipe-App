import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import SaveButton from '../components/SaveButton';

const BOARDS = ['All Recipes', 'Weeknight Meals', 'Party Food', 'Diet Recipes', 'Weekend Cooking', 'Quick Bites', 'Favourites'];

// ── Star Rating display ─────────────────────────────────────────────────────
const Stars = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} className={`text-xs ${n <= (rating || 0) ? 'text-amber-400' : 'text-primary/10'}`}>★</span>
    ))}
  </div>
);

// ── Taste Profile AI card ───────────────────────────────────────────────────
const TasteProfileCard = ({ profile, stats, loading }) => {
  if (loading) return (
    <div className="premium-card border-accent/20 space-y-3 animate-pulse">
      <div className="h-4 bg-primary/5 rounded w-1/3" />
      <div className="h-8 bg-primary/5 rounded w-2/3" />
      <div className="flex gap-2">{[1, 2, 3].map(i => <div key={i} className="h-6 bg-primary/5 rounded-full w-24" />)}</div>
    </div>
  );

  if (!profile) return (
    <div className="premium-card border-dashed border-accent/20 text-center py-8 space-y-3">
      <div className="text-4xl opacity-20">🔮</div>
      <p className="font-poiret text-lg text-primary/30 uppercase tracking-widest">Taste Profile Locked</p>
      <p className="text-[10px] uppercase tracking-widest text-primary/20">Save at least 2 recipes to unlock your AI taste analysis</p>
    </div>
  );

  return (
    <div className="premium-card border-accent/20 space-y-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #fff 0%, #F7F1EA 100%)' }}>
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/30 via-accent to-accent/30" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[8px] uppercase tracking-[0.4em] text-accent/50 font-bold">AI Taste Profile</div>
          <h2 className="font-poiret text-2xl text-primary leading-tight">
            {profile.emoji} {profile.headline}
          </h2>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-poiret text-primary">{stats?.total}</div>
          <div className="text-[8px] uppercase tracking-widest text-primary/30">Recipes Saved</div>
        </div>
      </div>

      {/* Traits chips */}
      <div className="flex flex-wrap gap-2">
        {profile.traits?.map((t, i) => (
          <span key={i} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-accent/20 text-accent/80 bg-accent/5">
            {t}
          </span>
        ))}
        {profile.cookingStyle && (
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider bg-primary text-background">
            {profile.cookingStyle}
          </span>
        )}
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-primary/5">
          <div className="text-center">
            <div className="font-poiret text-lg text-primary">{stats.topCuisines?.[0] || '—'}</div>
            <div className="text-[8px] uppercase tracking-widest text-primary/30">Top Cuisine</div>
          </div>
          <div className="text-center border-x border-primary/5">
            <div className="font-poiret text-lg text-primary">{stats.avgTime ? `${stats.avgTime}m` : '—'}</div>
            <div className="text-[8px] uppercase tracking-widest text-primary/30">Avg Cook Time</div>
          </div>
          <div className="text-center">
            <div className="font-poiret text-lg text-primary text-xs line-clamp-1">{profile.recommendation || '—'}</div>
            <div className="text-[8px] uppercase tracking-widest text-primary/30">Try Next</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Saved Recipe Card ────────────────────────────────────────────────────────
const SavedCard = ({ item, onUnsave }) => {
  const [imgSrc, setImgSrc] = useState(item.imageUrl);
  const [hoveringRemove, setHoveringRemove] = useState(false);

  return (
    <div className="premium-card !p-0 overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgSrc(null)} />
        ) : (
          <div className="w-full h-full bg-surface flex items-center justify-center">
            <span className="text-3xl opacity-20">🍽</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />

        {/* Board badge */}
        {item.board && item.board !== 'All Recipes' && (
          <div className="absolute top-2 left-2 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/70 text-background">
            {item.board}
          </div>
        )}

        {/* 🚫 Unsave button with hover effect */}
        <button
          onMouseEnter={() => setHoveringRemove(true)}
          onMouseLeave={() => setHoveringRemove(false)}
          onClick={() => onUnsave(item._id)}
          title="Remove from cookbook"
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all
            opacity-0 group-hover:opacity-100
            bg-white/90 hover:bg-red-500 hover:text-white shadow"
        >
          {hoveringRemove ? '🚫' : '✕'}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div>
          <h3 className="font-poiret text-sm leading-snug text-primary line-clamp-2 group-hover:text-accent transition-colors">
            {item.title}
          </h3>
          <div className="text-[8px] uppercase tracking-widest text-primary/30 mt-0.5">
            {item.cuisine} {item.cookTime && `· ${item.cookTime}m`}
          </div>
        </div>

        {item.rating && <Stars rating={item.rating} />}

        {item.notes && (
          <p className="text-[10px] text-primary/40 italic line-clamp-2 border-l-2 border-accent/20 pl-2">
            {item.notes}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-primary/5">
          <Link to={`/recipe/${item._id}`}
            className="text-[9px] uppercase tracking-widest text-accent font-bold hover:underline">
            View →
          </Link>
          <span className="text-[8px] text-primary/20">
            {new Date(item.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
};


// ── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState('All Recipes');
  const [activeTab, setActiveTab] = useState('collection'); // 'collection' | 'ai'

  useEffect(() => {
    loadSaved();
    loadTasteProfile();
  }, []);

  const loadSaved = async () => {
    try {
      const data = await api('/cookbook');
      setSaved(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasteProfile = async () => {
    try {
      const data = await api('/cookbook/taste-profile');
      setProfileData(data);
    } catch { }
    finally { setProfileLoading(false); }
  };

  const unsave = async (recipeId) => {
    try {
      await api(`/cookbook/${recipeId}`, { method: 'DELETE' });
      setSaved(prev => prev.filter(r => r._id !== recipeId));
    } catch { }
  };

  const allBoards = ['All Recipes', ...new Set(saved.map(r => r.board).filter(b => b && b !== 'All Recipes'))];
  const filtered = activeBoard === 'All Recipes' ? saved : saved.filter(r => r.board === activeBoard);

  // Board counts
  const boardCounts = {};
  saved.forEach(r => { boardCounts[r.board] = (boardCounts[r.board] || 0) + 1; });

  const firstName = user?.name?.split(' ')[0] || 'Chef';

  return (
    <div className="space-y-10 mt-16">

      {/* ── Profile Header ── */}
      <header className="premium-card border-accent/10 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        <div className="w-20 h-20 rounded-2xl bg-primary text-background flex items-center justify-center text-3xl font-bold font-poiret flex-shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h1 className="font-poiret text-3xl uppercase tracking-widest text-primary">{user?.name}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/50">{user?.email}</p>
          </div>
          <div className="flex gap-6 pt-1">
            <div className="text-center">
              <div className="font-poiret text-2xl text-primary">{saved.length}</div>
              <div className="text-[8px] uppercase tracking-widest text-primary/30">Saved</div>
            </div>
            <div className="border-l border-primary/5 h-10" />
            <div className="text-center">
              <div className="font-poiret text-2xl text-primary">
                {saved.filter(r => r.tags?.includes('ai-generated')).length}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-primary/30">AI Created</div>
            </div>
            <div className="border-l border-primary/5 h-10" />
            <div className="text-center">
              <div className="font-poiret text-2xl text-primary">
                {[...new Set(saved.map(r => r.cuisine).filter(Boolean))].length}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-primary/30">Cuisines</div>
            </div>
            <div className="border-l border-primary/5 h-10" />
            <div className="text-center">
              <div className="font-poiret text-2xl text-primary">{allBoards.length - 1}</div>
              <div className="text-[8px] uppercase tracking-widest text-primary/30">Collections</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-primary/5">
        {[['collection', '📖 My Collection'], ['ai', '🤖 My Taste Profile']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-5 py-2.5 text-[10px] uppercase tracking-widest transition-all border-b-2 -mb-px ${activeTab === id ? 'border-accent text-accent font-bold' : 'border-transparent text-primary/40 hover:text-primary/60'
              }`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── COLLECTION TAB ── */}
      {activeTab === 'collection' && (
        <div className="space-y-6">

          {/* Board filter */}
          <div className="flex flex-wrap gap-2">
            {allBoards.map(b => (
              <button key={b} onClick={() => setActiveBoard(b)}
                className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-wider border transition-all ${activeBoard === b ? 'bg-primary text-background border-primary' : 'bg-surface/50 text-primary/50 border-primary/10 hover:border-accent/40'
                  }`}>
                {b} {boardCounts[b] ? `(${boardCounts[b]})` : ''}
              </button>
            ))}
          </div>

          {/* Recipe grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => <div key={i} className="rounded-2xl h-56 bg-surface animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center space-y-5">
              <div className="text-7xl opacity-10">📖</div>
              <h2 className="font-poiret text-2xl text-primary/30 uppercase tracking-widest">
                {activeBoard === 'All Recipes' ? 'Your cookbook is empty' : `No recipes in "${activeBoard}"`}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-primary/20">
                Click the ♡ on any recipe to save it here
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link to="/" className="btn-primary text-xs">Browse Recipes</Link>
                <Link to="/chef" className="border border-accent/30 text-accent text-xs px-6 py-2 rounded-full hover:bg-accent hover:text-background transition-all">
                  Ask Chef AI
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(item => (
                <SavedCard key={item.savedId || item._id} item={item} onUnsave={unsave} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TASTE PROFILE TAB ── */}
      {activeTab === 'ai' && (
        <div className="space-y-8 max-w-3xl">
          <TasteProfileCard
            profile={profileData?.profile}
            stats={profileData?.stats}
            loading={profileLoading}
          />

          {profileData?.profile && (
            <>
              {/* Try Next recommendation */}
              <div className="premium-card border-accent/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl flex-shrink-0">🍽</div>
                <div className="flex-1">
                  <div className="text-[8px] uppercase tracking-[0.3em] text-accent/50 font-bold">Chef AI Recommends You Try</div>
                  <div className="font-poiret text-xl text-primary mt-0.5">{profileData.profile.recommendation}</div>
                </div>
                <Link to="/chef" className="btn-primary text-xs flex-shrink-0">
                  🤖 Make This
                </Link>
              </div>

              {/* Top cuisines breakdown */}
              {profileData.stats?.topCuisines?.length > 0 && (
                <div className="premium-card border-accent/10 space-y-4">
                  <h3 className="text-[9px] uppercase tracking-[0.3em] text-accent/50 font-bold">Your Cuisine Breakdown</h3>
                  <div className="space-y-3">
                    {profileData.stats.topCuisines.map((c, i) => {
                      const count = saved.filter(r => r.cuisine === c).length;
                      const pct = Math.round((count / saved.length) * 100);
                      return (
                        <div key={c} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-primary/70">{c}</span>
                            <span className="text-primary/30">{count} recipes · {pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-primary/5 overflow-hidden">
                            <div className="h-full rounded-full bg-accent/60 transition-all duration-1000"
                              style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="text-center">
            <button onClick={loadTasteProfile}
              className="text-[9px] uppercase tracking-widest text-accent/50 hover:text-accent transition-colors">
              ↻ Refresh AI Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
