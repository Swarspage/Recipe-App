import { pgTable, text, serial, integer, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  weeklyPlanner: jsonb("weekly_planner").$type<{
    monday: number[]; tuesday: number[]; wednesday: number[];
    thursday: number[]; friday: number[]; saturday: number[]; sunday: number[];
  }>().default({ monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").array().notNull(),
  category: text("category").notNull(),
  cuisine: text("cuisine").notNull(),
  timeMinutes: integer("time_minutes").notNull(),
  difficulty: text("difficulty").notNull(),
  servings: integer("servings").notNull(),
  imageUrl: text("image_url").notNull(),
  steps: text("steps").array().notNull(),
  tags: text("tags").array().notNull(),
  averageRating: real("average_rating").default(0),
});

export const savedRecipes = pgTable("saved_recipes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipeId: integer("recipe_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, createdAt: true, weeklyPlanner: true 
});
export const insertRecipeSchema = createInsertSchema(recipes).omit({ id: true });
export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
