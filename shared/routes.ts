import { z } from 'zod';
import { insertUserSchema, insertRecipeSchema, recipes, users, loginSchema } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: { 200: z.void() }
    },
    check: {
      method: 'GET' as const,
      path: '/api/auth/check' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  recipes: {
    list: {
      method: 'GET' as const,
      path: '/api/recipes' as const,
      responses: { 200: z.array(z.custom<typeof recipes.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/recipes/:id' as const,
      responses: {
        200: z.custom<typeof recipes.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  user: {
    saved: {
      method: 'GET' as const,
      path: '/api/user/saved' as const,
      responses: { 200: z.array(z.custom<typeof recipes.$inferSelect>()) }
    },
    saveRecipe: {
      method: 'POST' as const,
      path: '/api/user/saved' as const,
      input: z.object({ recipeId: z.number() }),
      responses: { 200: z.void(), 401: errorSchemas.unauthorized }
    },
    removeSavedRecipe: {
      method: 'DELETE' as const,
      path: '/api/user/saved/:id' as const,
      responses: { 200: z.void(), 401: errorSchemas.unauthorized }
    },
    profile: {
      method: 'GET' as const,
      path: '/api/user/profile' as const,
      responses: {
        200: z.object({
          user: z.custom<typeof users.$inferSelect>(),
          savedCount: z.number(),
          joinDate: z.string()
        }),
        401: errorSchemas.unauthorized
      }
    },
    planner: {
      method: 'GET' as const,
      path: '/api/user/planner' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized
      }
    },
    updatePlanner: {
      method: 'POST' as const,
      path: '/api/user/planner' as const,
      input: z.object({ day: z.string(), recipeId: z.number() }),
      responses: { 200: z.void(), 401: errorSchemas.unauthorized }
    }
  },
  ai: {
    substitute: {
      method: 'POST' as const,
      path: '/api/ai/substitute' as const,
      input: z.object({ ingredient: z.string(), recipeContext: z.string() }),
      responses: {
        200: z.object({ suggestion: z.string() }),
        401: errorSchemas.unauthorized,
        500: errorSchemas.internal
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
