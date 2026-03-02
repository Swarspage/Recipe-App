import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.check.path, (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).json({ message: "Not authenticated" });
  });

  // Recipes
  app.get(api.recipes.list.path, async (req, res) => {
    const recipes = await storage.getRecipes();
    res.json(recipes);
  });

  app.get(api.recipes.get.path, async (req, res) => {
    const recipe = await storage.getRecipe(Number(req.params.id));
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  });

  // User
  app.get(api.user.saved.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const recipes = await storage.getSavedRecipes(req.user.id);
    res.json(recipes);
  });

  app.post(api.user.saveRecipe.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { recipeId } = req.body;
    await storage.saveRecipe(req.user.id, recipeId);
    res.sendStatus(200);
  });

  app.delete(api.user.removeSavedRecipe.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeSavedRecipe(req.user.id, Number(req.params.id));
    res.sendStatus(200);
  });

  app.get(api.user.profile.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const saved = await storage.getSavedRecipes(req.user.id);
    res.json({
      user: req.user,
      savedCount: saved.length,
      joinDate: req.user.createdAt?.toISOString() || new Date().toISOString()
    });
  });

  app.get(api.user.planner.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.post(api.user.updatePlanner.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { day, recipeId } = req.body;
    await storage.updatePlanner(req.user.id, day, recipeId);
    res.sendStatus(200);
  });

  // AI
  app.post(api.ai.substitute.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { ingredient, recipeContext } = req.body;

    try {
      const response = await openai.chat.completions.create({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [
          { role: "system", content: "You are a culinary assistant helping young adults find ingredient substitutes using easily available items in a basic pantry. Be concise — max 2 sentences." },
          { role: "user", content: `I'm missing ${ingredient} for ${recipeContext}. What can I substitute it with using common items?` }
        ]
      });

      const suggestion = response.choices[0]?.message?.content || "No substitute found.";
      res.json({ suggestion });
    } catch (error: any) {
      console.error("AI Substitution error:", error);
      res.status(500).json({ message: "Failed to generate substitute." });
    }
  });

  // Seed DB
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getRecipes();
  if (existing.length === 0) {
    const seedRecipes = [
      {
        name: "Dal Tadka",
        description: "Classic Indian yellow lentils tempered with spices",
        ingredients: ["Yellow dal", "Onion", "Tomato", "Garlic", "Cumin", "Turmeric"],
        category: "Lunch",
        cuisine: "Indian",
        timeMinutes: 25,
        difficulty: "Easy",
        servings: 2,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80",
        steps: ["Boil dal until soft", "Sauté onions, tomatoes, and garlic", "Add spices and mix with dal"],
        tags: ["Vegetarian", "Healthy"]
      },
      {
        name: "Pasta Aglio e Olio",
        description: "Simple Italian pasta with garlic and olive oil",
        ingredients: ["Pasta", "Olive oil", "Garlic", "Chili flakes"],
        category: "Dinner",
        cuisine: "Italian",
        timeMinutes: 15,
        difficulty: "Easy",
        servings: 1,
        imageUrl: "https://images.unsplash.com/photo-1621996311210-ea237a6b088e?auto=format&fit=crop&q=80",
        steps: ["Boil pasta", "Sauté garlic and chili flakes in olive oil", "Toss pasta in the oil"],
        tags: ["Quick", "Vegan"]
      },
      {
        name: "Maggi Upgrade",
        description: "Elevated instant noodles with veggies and egg",
        ingredients: ["Maggi", "Onion", "Tomato", "Egg", "Butter"],
        category: "Snack",
        cuisine: "Fusion",
        timeMinutes: 10,
        difficulty: "Easy",
        servings: 1,
        imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80",
        steps: ["Sauté veggies in butter", "Add water and Maggi", "Crack an egg and stir until cooked"],
        tags: ["Comfort", "Quick"]
      }
    ];

    for (const r of seedRecipes) {
      await storage.createRecipe(r);
    }
  }
}
