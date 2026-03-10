import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await api(`/recipes/${id}`);
        setRecipe(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-24 text-center space-y-4">
      <h2 className="text-2xl font-poiret uppercase tracking-widest text-red-500">Recipe Not Found</h2>
      <p className="text-xs text-primary/40 uppercase tracking-widest">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="space-y-6 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.4em] text-primary/60 font-medium">
              {recipe.cuisine} • {recipe.difficulty}
            </span>
            <h1 className="text-4xl lg:text-7xl font-poiret uppercase tracking-tight leading-none">
              {recipe.title}
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="premium-card py-2 px-6 flex flex-col items-center">
              <span className="text-xl font-poiret">{recipe.cookTime || '??'}</span>
              <span className="text-[8px] uppercase tracking-widest text-primary/40">Minutes</span>
            </div>
            <div className="premium-card py-2 px-6 flex flex-col items-center">
              <span className="text-xl font-poiret">{recipe.ingredients?.length || 0}</span>
              <span className="text-[8px] uppercase tracking-widest text-primary/40">Items</span>
            </div>
          </div>
        </div>

        {recipe.imageUrl && (
          <div className="w-full aspect-video rounded-[3rem] overflow-hidden border border-primary/5 shadow-2xl mb-8 relative bg-surface">
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10 animate-pulse">
               🍳
            </div>
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              onLoad={(e) => { e.target.classList.remove('opacity-0'); }}
              className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity duration-1000" 
            />
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-primary/10 to-transparent w-full"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <aside className="lg:col-span-1 space-y-8">
          <div className="premium-card border-primary/5">
            <h3 className="text-sm uppercase tracking-[0.3em] text-primary border-b border-primary/5 pb-4 mb-6">Ingredients</h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex flex-col">
                  <span className="text-xs font-medium text-primary leading-relaxed">{ing.name}</span>
                  {(ing.quantity || ing.note) && (
                    <span className="text-[10px] text-primary/50 uppercase tracking-widest mt-0.5">
                      {ing.quantity} {ing.note && `(${ing.note})`}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="lg:col-span-2 space-y-12">
          <section className="space-y-10">
            <h3 className="text-sm uppercase tracking-[0.3em] text-primary/60 border-b border-primary/5 pb-4">Preparation Protocol</h3>
            <div className="space-y-10 relative">
              {/* Vertical line through steps for a continuous look */}
              <div className="absolute left-[1.15rem] top-8 bottom-8 w-px bg-primary/5"></div>
              
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-8 group relative bg-background">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-sm font-poiret text-primary/40 group-hover:bg-primary group-hover:text-background transition-all duration-500 z-10 bg-background">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-sm leading-[1.8] text-primary/80 font-light pt-2 max-w-prose">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {recipe.notes && (
            <footer className="bg-surface p-8 rounded-3xl border border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-primary">Chef's Technical Notes</h4>
                <p className="text-xs italic text-primary/60 leading-relaxed">"{recipe.notes}"</p>
              </div>
              {recipe.sourceUrl && (
                <a 
                  href={recipe.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary py-3 px-8 text-[10px] uppercase tracking-widest"
                >
                  Original Source
                </a>
              )}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipeDetail;
