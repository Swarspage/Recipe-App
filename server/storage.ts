import { db } from "./db";
import { users, recipes, savedRecipes, type User, type InsertUser, type Recipe, type InsertRecipe } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export function setupSessionStore() {
  return new PostgresSessionStore({ pool, createTableIfMissing: true });
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getSavedRecipes(userId: number): Promise<Recipe[]>;
  saveRecipe(userId: number, recipeId: number): Promise<void>;
  removeSavedRecipe(userId: number, recipeId: number): Promise<void>;
  updatePlanner(userId: number, day: string, recipeId: number): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getRecipes(): Promise<Recipe[]> {
    return await db.select().from(recipes);
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [r] = await db.insert(recipes).values(recipe).returning();
    return r;
  }

  async getSavedRecipes(userId: number): Promise<Recipe[]> {
    const saved = await db.select({
      recipe: recipes
    })
    .from(savedRecipes)
    .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
    .where(eq(savedRecipes.userId, userId));
    
    return saved.map(s => s.recipe);
  }

  async saveRecipe(userId: number, recipeId: number): Promise<void> {
    const existing = await db.select().from(savedRecipes).where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));
    if (existing.length === 0) {
      await db.insert(savedRecipes).values({ userId, recipeId });
    }
  }

  async removeSavedRecipe(userId: number, recipeId: number): Promise<void> {
    await db.delete(savedRecipes).where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));
  }

  async updatePlanner(userId: number, day: string, recipeId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const planner = { ...(user.weeklyPlanner as any) };
    if (!planner[day]) planner[day] = [];
    
    if (!planner[day].includes(recipeId)) {
      planner[day].push(recipeId);
    }
    
    const [updatedUser] = await db.update(users)
      .set({ weeklyPlanner: planner })
      .where(eq(users.id, userId))
      .returning();
      
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();
