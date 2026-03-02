import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Recipe } from "@shared/schema";

export function useRecipes() {
  return useQuery({
    queryKey: [api.recipes.list.path],
    queryFn: async () => {
      const res = await fetch(api.recipes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json() as Promise<Recipe[]>;
    },
  });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: [api.recipes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.recipes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch recipe");
      return res.json() as Promise<Recipe>;
    },
    enabled: !!id,
  });
}

export function useAiSubstitute() {
  return useMutation({
    mutationFn: async (data: { ingredient: string; recipeContext: string }) => {
      const res = await fetch(api.ai.substitute.path, {
        method: api.ai.substitute.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get substitution");
      return res.json() as Promise<{ suggestion: string }>;
    },
  });
}
