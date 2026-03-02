import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useMemo } from "react";
import { useRecipes } from "@/hooks/use-recipes";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import { Mic, Search, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type Recipe } from "@shared/schema";

const CATEGORIES = {
  "Vegetables": ["Tomato", "Onion", "Garlic", "Potato", "Spinach", "Carrot", "Bell Pepper", "Broccoli", "Zucchini"],
  "Proteins": ["Chicken", "Beef", "Pork", "Tofu", "Eggs", "Salmon", "Shrimp", "Lentils", "Black Beans"],
  "Grains & Pasta": ["Rice", "Pasta", "Bread", "Quinoa", "Oats", "Flour", "Tortillas"],
  "Dairy": ["Milk", "Butter", "Cheese", "Yogurt", "Cream", "Parmesan"],
  "Pantry & Spices": ["Olive Oil", "Soy Sauce", "Salt", "Black Pepper", "Cumin", "Paprika", "Oregano", "Sugar", "Honey"]
};

export default function Pantry() {
  const { data: allRecipes = [] } = useRecipes();
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<{ recipe: Recipe; missing: string[] } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleIngredient = (ing: string) => {
    const next = new Set(selectedIngredients);
    if (next.has(ing)) next.delete(ing);
    else next.add(ing);
    setSelectedIngredients(next);
  };

  const handleVoiceInput = () => {
    // Basic implementation of Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported in this browser.");

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const allPossible = Object.values(CATEGORIES).flat();
      const newSelections = new Set(selectedIngredients);
      
      allPossible.forEach(ing => {
        if (transcript.includes(ing.toLowerCase())) {
          newSelections.add(ing);
        }
      });
      setSelectedIngredients(newSelections);
    };

    recognition.start();
  };

  // Calculate scores and filter
  const matchedRecipes = useMemo(() => {
    if (selectedIngredients.size === 0) return allRecipes.map(r => ({ recipe: r, score: 0, missing: r.ingredients }));

    return allRecipes.map(recipe => {
      const recipeIngLower = recipe.ingredients.map(i => i.toLowerCase());
      const selectedLower = Array.from(selectedIngredients).map(i => i.toLowerCase());
      
      const matched = recipeIngLower.filter(rIng => selectedLower.some(sIng => rIng.includes(sIng)));
      const missing = recipe.ingredients.filter(rIng => !matched.includes(rIng.toLowerCase()));
      
      const score = (matched.length / recipe.ingredients.length) * 100;
      return { recipe, score, missing };
    }).sort((a, b) => b.score - a.score);
  }, [allRecipes, selectedIngredients]);

  return (
    <AppLayout requireAuth>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full">
        
        {/* Left Panel: Ingredients */}
        <div className="w-full lg:w-[40%] bg-white border-r border-border p-6 md:p-8 flex flex-col h-[calc(100vh-80px)] lg:sticky lg:top-20 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Your Pantry</h1>
            <p className="text-muted-foreground text-sm">Select what you have, we'll find what you can make.</p>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search ingredients..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <button 
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${isListening ? 'bg-destructive/10 border-destructive text-destructive animate-pulse' : 'bg-background border-border text-primary hover:border-primary'}`}
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {selectedIngredients.size > 0 && (
            <div className="mb-6 p-4 rounded-[16px] bg-primary/5 border border-primary/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-primary">Selected ({selectedIngredients.size})</h3>
                <button onClick={() => setSelectedIngredients(new Set())} className="text-xs text-destructive hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedIngredients).map(ing => (
                  <span key={ing} onClick={() => toggleIngredient(ing)} className="px-3 py-1 bg-primary text-white text-xs rounded-full cursor-pointer hover:bg-destructive transition-colors">
                    {ing} ×
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-8 flex-grow">
            {Object.entries(CATEGORIES).map(([category, items]) => {
              const filteredItems = items.filter(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
              if (filteredItems.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredItems.map(item => {
                      const isSelected = selectedIngredients.has(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleIngredient(item)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                            isSelected 
                              ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20' 
                              : 'bg-white text-foreground border-border hover:border-primary hover:text-primary'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="w-full lg:w-[60%] bg-background p-6 md:p-8 min-h-[50vh]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary">Recipe Matches</h2>
              <p className="text-muted-foreground text-sm">
                {selectedIngredients.size === 0 ? "Showing all recipes" : `Found ${matchedRecipes.length} recipes ordered by match.`}
              </p>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            <AnimatePresence>
              {matchedRecipes.map(({ recipe, score, missing }) => (
                <RecipeCard 
                  key={recipe.id}
                  recipe={recipe}
                  matchScore={score}
                  missingCount={missing.length}
                  onClick={() => setSelectedRecipe({ recipe, missing })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe.recipe} 
          missingIngredients={selectedRecipe.missing} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </AppLayout>
  );
}
