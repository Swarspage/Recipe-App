const Groq = require('groq-sdk');
require('dotenv').config();

if (!process.env.GROQ_API_KEY) {
  console.warn('WARNING: GROQ_API_KEY is not defined in .env');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.generateRecipeFromGroq = async (ingredients, options = {}) => {
  const { preferCuisine = 'any' } = options;
  
  const prompt = `Create a high-end, premium recipe using these ingredients: ${ingredients.join(', ')}. 
  Preferred cuisine: ${preferCuisine}. 
  Return ONLY a JSON object with the following fields: 
  { 
    "title": "Recipe Name", 
    "ingredients": [{"name": "item", "quantity": "amount", "note": "optional"}], 
    "steps": ["Step 1", "Step 2"], 
    "cuisine": "Cuisine Type", 
    "cookTime": 30, 
    "difficulty": "easy/medium/hard", 
    "tags": ["tag1", "tag2"],
    "notes": "optional chef tips"
  }`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error('Groq AI Error, falling back to local heuristic:', err.message);
    return this.generateRecipeLocalHeuristic(ingredients);
  }
};

exports.getChatResponse = async (history) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a premium culinary assistant. Return JSON: {"reply": "Concise elegant response", "suggestions": ["ShortTag1", "ShortTag2"]}' },
        ...history
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
    });

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error('Groq Chat ERROR:', err);
    return { 
      reply: "I'm having a brief connection issue. How else can I assist with your culinary journey?", 
      suggestions: ["Try again", "Search recipes"] 
    };
  }
};

exports.generateRecipeLocalHeuristic = (ingredients) => {
  // Simple deterministic fallback
  return {
    title: `${ingredients[0]} & ${ingredients[1] || 'Herb'} Fusion`,
    ingredients: ingredients.map(name => ({ name, quantity: '1 unit', note: 'Freshly sourced' })),
    steps: [
      `Prepare all ingredients: ${ingredients.join(', ')}.`,
      "Sear the main protein or base vegetable in a hot pan with olive oil.",
      "Deglaze with a splash of water or wine to create a rich reduction.",
      "Season with sea salt and cracked black pepper.",
      "Plate elegantly and garnish with fresh herbs."
    ],
    cuisine: "International",
    cookTime: 25,
    difficulty: "medium",
    tags: ["quick", "fresh", "fusion"],
    notes: "A simple yet elegant preparation focused on ingredient quality."
  };
};

exports.searchByIngredients = async (ingredientsArray, options = {}) => {
  const Recipe = require('../models/Recipe');
  const { cuisine, tags, limit = 12, page = 1 } = options;
  const skip = (page - 1) * limit;

  const searchTerms = ingredientsArray.map(i => i.toLowerCase());

  const pipeline = [
    { $match: { ingredientNames: { $in: searchTerms } } },
    {
      $addFields: {
        matchCount: {
          $size: { $setIntersection: ["$ingredientNames", searchTerms] }
        },
        missingIngredients: {
          $setDifference: ["$ingredientNames", searchTerms]
        }
      }
    },
    {
      $addFields: {
        missingCount: { $size: "$missingIngredients" }
      }
    },
    { $sort: { missingCount: 1, matchCount: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ];

  const items = await Recipe.aggregate(pipeline);
  const total = await Recipe.countDocuments({ ingredientNames: { $in: searchTerms } });

  return { items, total, page, limit };
};
