import { useState } from 'react';
import IngredientSelector from '../components/IngredientSelector';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';

const CookingImport = () => {
  const [step, setStep] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null); // { imported: boolean, matches?: [], recipe?: {} }

  const handleFindRecipes = async () => {
    console.log('Wizard: Initiating discovery with ingredients:', ingredients);
    setLoading(true);
    try {
      const data = await api('/recipes/import', { 
        body: { ingredients, allowAI: true } 
      });
      console.log('Wizard: Received results:', data);
      setResults(data);
      setStep(2);
    } catch (err) {
      console.error('Wizard ERROR:', err);
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between px-12">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= i ? 'border-primary bg-primary text-background' : 'border-primary/20 text-primary/40'}`}>
              {i === 1 ? '🛒' : '✨'}
            </div>
            {i === 1 && <div className={`h-0.5 w-24 sm:w-48 mx-4 ${step > 1 ? 'bg-primary' : 'bg-primary/10'}`}></div>}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-poiret uppercase tracking-[0.2em] text-primary">Inventory Check</h1>
            <p className="text-primary/50 text-xs tracking-widest uppercase">What's in your pantry today?</p>
          </div>
          
          <IngredientSelector onChange={setIngredients} />

          <div className="flex justify-center">
            <button
              onClick={handleFindRecipes}
              disabled={ingredients.length === 0 || loading}
              className="btn-primary py-4 px-12 uppercase tracking-[0.3em] text-xs font-bold disabled:opacity-20"
            >
              {loading ? "Analyzing Flavors..." : "Initiate Discovery"}
            </button>
          </div>
        </div>
      )}

      {step === 2 && results && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-poiret uppercase tracking-[0.2em] text-primary">
              {results.matches ? "Matching Patterns" : "Intelligence Synthesized"}
            </h1>
            <p className="text-primary/50 text-xs tracking-widest uppercase">
              {results.matches ? "Optimized results from our collection" : "New creation added to your cookbook"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.matches && results.matches.length > 0 ? (
              results.matches.map(r => <RecipeCard key={r._id} recipe={r} matchCount={r.matchCount} />)
            ) : results.recipe ? (
              <div className="col-span-full">
                 <RecipeCard recipe={results.recipe} />
                 <div className="mt-8 p-6 bg-surface rounded-2xl border border-primary/5 text-center">
                   <p className="text-primary/70 text-sm italic font-light">"Our AI synthesized this recipe specifically for your current ingredients."</p>
                 </div>
              </div>
            ) : (
              <div className="col-span-full py-12 text-center text-primary/40">
                No recipes could be synthesized or found for these ingredients.
              </div>
            )}
          </div>

          <div className="flex justify-center pt-8">
            <button onClick={() => setStep(1)} className="text-primary/40 uppercase tracking-[0.3em] text-[10px] hover:text-primary transition-colors">
              Reset Wizard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingImport;
