import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SaveButton from './SaveButton';

const RecipeCard = ({ recipe, matchCount }) => {
  const [imgUrl, setImgUrl] = useState(recipe.imageUrl);
  const [isLoading, setIsLoading] = useState(!recipe.imageUrl);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [recipe._id]);

  useEffect(() => {
    if (hasEnteredView && !imgUrl) {
      setIsLoading(true);
      // Small random delay (50-300ms) to ensure staggered requests 
      // even if multiple cards enter view at once
      const delay = Math.random() * 250 + 50;
      
      const timer = setTimeout(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/recipes/${recipe._id}/image`)
          .then(res => res.json())
          .then(data => {
            if (data.imageUrl) setImgUrl(data.imageUrl);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Lazy load failed:', err);
            setIsLoading(false);
          });
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [hasEnteredView, recipe._id, imgUrl]);

  return (
    <div ref={cardRef} className="premium-card group relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
        {matchCount !== undefined && (
          <div className="bg-primary text-background text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            {matchCount} {matchCount === 1 ? 'MATCH' : 'MATCHES'}
          </div>
        )}
        {recipe.missingCount > 0 && (
          <div className="bg-accent text-background text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            MISSING {recipe.missingCount}
          </div>
        )}
      </div>
      
      <div className="aspect-video bg-accent/5 rounded-xl mb-4 overflow-hidden relative group bg-surface">
        <div className={`absolute inset-0 flex items-center justify-center text-4xl opacity-20 transition-opacity duration-500 ${!imgUrl || isLoading ? 'animate-pulse opacity-20' : 'opacity-0'}`}>
          🥘
        </div>
        {imgUrl && (
          <img 
            src={imgUrl} 
            alt={recipe.title} 
            loading="lazy"
            onLoad={(e) => { 
                e.target.style.opacity = '1';
            }}
            onError={(e) => { 
                e.target.style.display = 'none';
            }}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-0 relative z-10"
          />
        )}
      </div>

      <div className="flex-grow space-y-3">
        <div className="flex flex-wrap gap-1">
          {recipe.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[8px] uppercase tracking-widest text-accent/60 border border-accent/20 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="font-poiret text-xl leading-tight group-hover:text-accent transition-colors">
          {recipe.title}
        </h3>
        
        <div className="text-[10px] uppercase tracking-widest text-primary/40 leading-relaxed line-clamp-2">
          {recipe.ingredients?.slice(0, 3).map(i => i.name).join(' • ')}
          {recipe.ingredients?.length > 3 && ' ...'}
        </div>

        {recipe.missingCount > 0 && (
          <div className="bg-red-50 p-2 rounded-lg border border-red-100">
            <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest block mb-1">Missing:</span>
            <span className="text-[10px] text-red-500 uppercase tracking-tighter">
              {recipe.missingIngredients?.join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-accent/5 pt-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-accent/50 italic">
          {recipe.cuisine || 'International'}
        </div>
        <div className="flex items-center gap-2">
          <SaveButton recipeId={recipe._id} compact />
          <Link 
            to={`/recipe/${recipe._id}`}
            className="text-[10px] uppercase tracking-[0.2em] font-bold border-b border-accent/30 hover:border-accent transition-all pb-0.5"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
