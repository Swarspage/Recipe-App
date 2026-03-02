import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user";
import { useRecipes } from "@/hooks/use-recipes";
import { Link } from "wouter";
import { ArrowRight, ChefHat, Heart, Calendar } from "lucide-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeModal } from "@/components/recipes/RecipeModal";
import { useState } from "react";
import { type Recipe } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { data: recipes = [] } = useRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const featured = recipes.slice(0, 3);

  return (
    <AppLayout requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Welcome Banner */}
        <div className="bg-primary rounded-[24px] p-8 md:p-12 mb-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-premium">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1200&q=80')] bg-cover bg-center mix-blend-overlay" />
          
          <div className="relative z-10 w-full md:w-2/3 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Good evening, {user?.username}
            </h1>
            <p className="text-primary-foreground/80 text-lg font-body max-w-lg mb-8">
              What are we cooking today? Let's turn your pantry ingredients into something extraordinary.
            </p>
            <Link href="/pantry" className="inline-flex items-center px-8 py-4 rounded-full bg-secondary text-white font-bold hover:bg-secondary/90 transition-all hover:gap-3 gap-2 shadow-lg group">
              Start Cooking from Pantry
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Quick Stats Grid inside Banner */}
          <div className="relative z-10 flex flex-row gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 md:w-32 border border-white/20 text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-serif font-bold">{profile?.savedCount || 0}</div>
              <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Saved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 md:w-32 border border-white/20 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-serif font-bold">
                {profile?.user.weeklyPlanner ? Object.values(profile.user.weeklyPlanner).flat().length : 0}
              </div>
              <div className="text-xs uppercase tracking-wider text-white/60 mt-1">Planned</div>
            </div>
          </div>
        </div>

        {/* Featured Inspiration */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-secondary" />
              Curated Inspiration
            </h2>
            <Link href="/pantry" className="text-secondary font-bold hover:text-primary transition-colors">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                matchScore={0} // No pantry active on dashboard
                missingCount={0}
                onClick={() => setSelectedRecipe(recipe)} 
              />
            ))}
          </div>
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
