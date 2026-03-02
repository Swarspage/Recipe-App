import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Recipe, type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSavedRecipes() {
  return useQuery({
    queryKey: [api.user.saved.path],
    queryFn: async () => {
      const res = await fetch(api.user.saved.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch saved recipes");
      return res.json() as Promise<Recipe[]>;
    },
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (recipeId: number) => {
      const res = await fetch(api.user.saveRecipe.path, {
        method: api.user.saveRecipe.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save recipe");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.saved.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.profile.path] });
      toast({ title: "Saved!", description: "Recipe added to your collection." });
    },
  });
}

export function useRemoveSavedRecipe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (recipeId: number) => {
      const url = api.user.removeSavedRecipe.path.replace(":id", recipeId.toString());
      const res = await fetch(url, {
        method: api.user.removeSavedRecipe.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove recipe");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.saved.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.profile.path] });
      toast({ title: "Removed", description: "Recipe removed from your collection." });
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: [api.user.profile.path],
    queryFn: async () => {
      const res = await fetch(api.user.profile.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json() as Promise<{ user: User; savedCount: number; joinDate: string }>;
    },
  });
}

export function usePlanner() {
  return useQuery({
    queryKey: [api.user.planner.path],
    queryFn: async () => {
      const res = await fetch(api.user.planner.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch planner");
      return res.json() as Promise<User>;
    },
  });
}

export function useUpdatePlanner() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { day: string; recipeId: number }) => {
      const res = await fetch(api.user.updatePlanner.path, {
        method: api.user.updatePlanner.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update planner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.user.planner.path] });
    },
  });
}
