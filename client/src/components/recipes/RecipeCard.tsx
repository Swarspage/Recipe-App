import { type Recipe } from "@shared/schema";
import { motion } from "framer-motion";
import { Clock, ChefHat } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  matchScore: number;
  missingCount: number;
  onClick: () => void;
}

export function RecipeCard({ recipe, matchScore, missingCount, onClick }: RecipeCardProps) {
  
  const getScoreColor = () => {
    if (matchScore >= 100) return "bg-primary text-white";
    if (matchScore >= 75) return "bg-secondary text-white";
    return "bg-background text-foreground border border-border";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-card rounded-[20px] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-300 cursor-pointer group border border-transparent hover:border-border/50 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={recipe.imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=60"} 
          alt={recipe.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Match Badge */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-lg backdrop-blur-md ${getScoreColor()}`}>
            {matchScore >= 100 ? 'PERFECT MATCH' : `${Math.round(matchScore)}% MATCH`}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-serif text-xl font-bold text-primary leading-tight group-hover:text-secondary transition-colors">
            {recipe.name}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
          {recipe.description}
        </p>

        <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-foreground/70 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-secondary" />
              {recipe.timeMinutes}m
            </span>
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-primary" />
              {recipe.difficulty}
            </span>
          </div>
          
          {missingCount > 0 ? (
            <span className="text-destructive font-medium text-xs bg-destructive/10 px-2 py-1 rounded-md">
              Missing {missingCount} {missingCount === 1 ? 'item' : 'items'}
            </span>
          ) : (
            <span className="text-primary font-medium text-xs bg-primary/10 px-2 py-1 rounded-md">
              Ready to cook!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
