import { type Recipe } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChefHat, Clock, Sparkles, Heart, BookmarkPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAiSubstitute } from "@/hooks/use-recipes";
import { useSaveRecipe, useSavedRecipes, useRemoveSavedRecipe } from "@/hooks/use-user";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export function RecipeModal({ 
  recipe, 
  missingIngredients, 
  onClose 
}: { 
  recipe: Recipe; 
  missingIngredients: string[];
  onClose: () => void;
}) {
  const [substitutes, setSubstitutes] = useState<Record<string, string>>({});
  const [activeSubst, setActiveSubst] = useState<string | null>(null);
  
  const aiMutation = useAiSubstitute();
  const { data: saved = [] } = useSavedRecipes();
  const saveMutation = useSaveRecipe();
  const removeMutation = useRemoveSavedRecipe();
  
  const isSaved = saved.some(r => r.id === recipe.id);

  const handleSubstitute = (ingredient: string) => {
    setActiveSubst(ingredient);
    aiMutation.mutate({ ingredient, recipeContext: recipe.name }, {
      onSuccess: (data) => {
        setSubstitutes(prev => ({ ...prev, [ingredient]: data.suggestion }));
        setActiveSubst(null);
      }
    });
  };

  const handleSaveToggle = () => {
    if (isSaved) {
      removeMutation.mutate(recipe.id);
    } else {
      saveMutation.mutate(recipe.id);
    }
  };

  // Mock macro data - normally would come from DB
  const macroData = [
    { name: 'Protein', value: 30, color: '#1C3829' }, // Primary Green
    { name: 'Carbs', value: 50, color: '#C9963A' },   // Accent Gold
    { name: 'Fat', value: 20, color: '#E04F3D' },     // Terracotta
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[24px] shadow-premium relative flex flex-col md:flex-row z-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-foreground hover:bg-white shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0">
          <img 
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60"} 
            alt={recipe.name}
            className="w-full h-full object-cover rounded-t-[24px] md:rounded-l-[24px] md:rounded-tr-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold uppercase tracking-wider">
                {recipe.category}
              </span>
              <span className="px-3 py-1 bg-secondary rounded-full text-white text-xs font-semibold uppercase tracking-wider">
                {recipe.difficulty}
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white leading-tight">{recipe.name}</h2>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
            <div className="flex gap-6 text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span>{recipe.timeMinutes} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-secondary" />
                <span>{recipe.servings} serves</span>
              </div>
            </div>
            <button 
              onClick={handleSaveToggle}
              disabled={saveMutation.isPending || removeMutation.isPending}
              className={`p-3 rounded-full border transition-all ${
                isSaved 
                  ? 'bg-primary/5 border-primary text-primary hover:bg-primary/10' 
                  : 'bg-white border-border text-muted-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {isSaved ? <Heart className="w-5 h-5 fill-primary text-primary" /> : <BookmarkPlus className="w-5 h-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-primary mb-4 flex items-center gap-2">
                Ingredients
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => {
                  const isMissing = missingIngredients.some(m => ing.toLowerCase().includes(m.toLowerCase()));
                  return (
                    <li key={i} className="flex flex-col bg-background/50 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-sm ${isMissing ? 'text-destructive font-medium' : 'text-foreground'}`}>
                          • {ing}
                        </span>
                        {isMissing && !substitutes[ing] && (
                          <button 
                            onClick={() => handleSubstitute(ing)}
                            disabled={activeSubst === ing}
                            className="text-[10px] uppercase font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1 shrink-0 bg-secondary/10 px-2 py-1 rounded"
                          >
                            {activeSubst === ing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            Substitute
                          </button>
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {substitutes[ing] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 text-sm bg-secondary/10 text-primary p-3 rounded-lg border border-secondary/30"
                          >
                            <span className="font-bold text-secondary mr-1">Zest AI:</span>
                            {substitutes[ing]}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-serif font-bold text-primary mb-4">Macros Overview</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground mt-2">
                {macroData.map((m) => (
                  <div key={m.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-primary mb-4">Instructions</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-foreground/80 pt-1 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
