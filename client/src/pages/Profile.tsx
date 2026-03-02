import { AppLayout } from "@/components/layout/AppLayout";
import { useUserProfile, useSavedRecipes } from "@/hooks/use-user";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import { useState } from "react";
import { type Recipe } from "@shared/schema";
import { User as UserIcon, Calendar, Heart } from "lucide-react";

export default function Profile() {
  const { data: profile } = useUserProfile();
  const { data: saved = [] } = useSavedRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  if (!profile) return null;

  return (
    <AppLayout requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Profile Header */}
        <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-premium border border-border/50 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-primary/10 border-4 border-white shadow-lg flex items-center justify-center shrink-0 text-primary">
            <UserIcon className="w-16 h-16" />
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">{profile.user.username}</h1>
            <p className="text-muted-foreground mb-6 flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-4 h-4" /> Joined Zest community recently
            </p>
            
            <div className="flex gap-6 justify-center md:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{saved.length}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Saved Recipes</div>
              </div>
              <div className="w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">
                  {Object.values(profile.user.weeklyPlanner || {}).flat().length}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Planned Meals</div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Recipes */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 fill-secondary text-secondary" />
            Your Digital Cookbook
          </h2>
          
          {saved.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-[24px] border border-dashed border-border">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-primary mb-2">No saved recipes yet</h3>
              <p className="text-muted-foreground mb-6">Explore the pantry to find and save recipes you love.</p>
              <a href="/pantry" className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                Go to Pantry
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saved.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  matchScore={100} // Assuming saved means they like it
                  missingCount={0}
                  onClick={() => setSelectedRecipe(recipe)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          missingIngredients={[]} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
    </AppLayout>
  );
}
