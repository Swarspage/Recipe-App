import { AppLayout } from "@/components/layout/AppLayout";
import { usePlanner, useSavedRecipes, useUpdatePlanner } from "@/hooks/use-user";
import { useRecipes } from "@/hooks/use-recipes";
import { DndContext, useDraggable, useDroppable, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { Calendar, Plus } from "lucide-react";
import { type Recipe } from "@shared/schema";

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Sub-components for DnD
function DraggableRecipe({ recipe }: { recipe: Recipe }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: recipe
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes}
      className={`p-3 bg-white rounded-xl border shadow-sm cursor-grab active:cursor-grabbing mb-2 ${isDragging ? 'opacity-50' : 'opacity-100 hover:border-secondary'}`}
    >
      <div className="font-medium text-sm text-primary line-clamp-1">{recipe.name}</div>
      <div className="text-xs text-muted-foreground">{recipe.timeMinutes}m • {recipe.difficulty}</div>
    </div>
  );
}

function DroppableDay({ day, recipes }: { day: string, recipes: Recipe[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });

  return (
    <div 
      ref={setNodeRef}
      className={`p-4 rounded-2xl min-h-[160px] transition-colors border ${isOver ? 'bg-secondary/10 border-secondary' : 'bg-background border-border'}`}
    >
      <h3 className="font-serif font-bold text-primary mb-3 capitalize border-b border-border/50 pb-2">
        {day}
      </h3>
      <div className="space-y-2">
        {recipes.map((r, i) => (
          <div key={`${r.id}-${i}`} className="p-3 bg-card rounded-xl shadow-sm border border-border/50">
            <div className="font-medium text-sm text-primary line-clamp-1">{r.name}</div>
          </div>
        ))}
        {recipes.length === 0 && (
          <div className="h-20 flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl">
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs">Drop recipe</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Planner() {
  const { data: user } = usePlanner();
  const { data: saved = [] } = useSavedRecipes();
  const { data: allRecipes = [] } = useRecipes();
  const updateMutation = useUpdatePlanner();
  
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  if (!user) return null;

  const plannerData = user.weeklyPlanner as Record<string, number[]>;

  const handleDragStart = (event: any) => {
    setActiveRecipe(event.active.data.current as Recipe);
  };

  const handleDragEnd = (event: any) => {
    setActiveRecipe(null);
    const { over, active } = event;
    
    if (over && over.id.startsWith('day-')) {
      const day = over.id.replace('day-', '');
      const recipeId = parseInt(active.id.replace('recipe-', ''), 10);
      
      updateMutation.mutate({ day, recipeId });
    }
  };

  // Build recipes per day mapping
  const getRecipesForDay = (day: string) => {
    const ids = plannerData[day] || [];
    return ids.map(id => allRecipes.find(r => r.id === id)).filter(Boolean) as Recipe[];
  };

  return (
    <AppLayout requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col h-full">
        
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-secondary" />
            Weekly Menu Plan
          </h1>
          <p className="text-muted-foreground">Drag your saved recipes into the days below to organize your week.</p>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-col lg:flex-row gap-8 flex-grow">
            
            {/* Sidebar: Draggable items */}
            <div className="w-full lg:w-64 shrink-0">
              <div className="bg-card rounded-[24px] p-5 shadow-sm border border-border/50 sticky top-24">
                <h3 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Saved Recipes</h3>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  {saved.map(recipe => (
                    <DraggableRecipe key={recipe.id} recipe={recipe} />
                  ))}
                  {saved.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">Save recipes first to plan them.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Grid: Droppable days */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {DAYS.map(day => (
                <DroppableDay key={day} day={day} recipes={getRecipesForDay(day)} />
              ))}
            </div>

          </div>

          <DragOverlay>
            {activeRecipe ? (
              <div className="p-3 bg-white rounded-xl border-2 border-secondary shadow-xl rotate-3 scale-105 opacity-90">
                <div className="font-bold text-sm text-primary">{activeRecipe.name}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
      </div>
    </AppLayout>
  );
}
