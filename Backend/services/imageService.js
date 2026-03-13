const axios = require('axios');
const Recipe = require('../models/Recipe');
const Groq = require('groq-sdk');

const PIXABAY_API_URL = 'https://pixabay.com/api/';
const API_KEY = (process.env.PIXABAY_API_KEY || '').trim();
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = new Groq({ apiKey: GROQ_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let LAST_429_TIME = 0;
const COOLDOWN_PERIOD = 2 * 60 * 1000; 

/**
 * Use AI to simplify a messy recipe title into a clean dish name for image search.
 */
async function getSimplifiedDishName(title) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a culinary expert. Summarize the following recipe title into a simple, 2-3 word common name for the dish that would work best for an image search. Output ONLY the dish name, nothing else. Example: "Auntie Marys Spiced Okra" -> "Bhindi Masala"'
        },
        { role: 'user', content: title }
      ],
      model: 'llama-3.1-8b-instant',
    });
    return completion.choices[0]?.message?.content?.trim() || title;
  } catch (err) {
    console.error('[AI] Simplification failed:', err.message);
    return title;
  }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // Salad
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', // Veggie bowl
  'https://images.unsplash.com/photo-1476224488681-aba3553ef8c1?auto=format&fit=crop&w=800&q=80', // Roast
  'https://images.unsplash.com/photo-1484723046330-39909458bb97?auto=format&fit=crop&w=800&q=80', // Toast
  'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80'  // Pasta
];

/**
 * Fetch and cache an image for a recipe from Pixabay.
 */
exports.getAndCacheImage = async (recipe) => {
  if (recipe.imageUrl && (recipe.imageUrl.startsWith('http') || recipe.imageUrl.includes('pixabay.com'))) return recipe.imageUrl;
  
  // Choose a semi-random fallback from our curated list as a baseline
  const defaultFallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

  if (!API_KEY) return defaultFallback;

  // Circuit Breaker check
  if (Date.now() - LAST_429_TIME < COOLDOWN_PERIOD) return defaultFallback;

  try {
    const cleanTitle = await getSimplifiedDishName(recipe.title);
    // Add "photography" or "gourmet" to query for better results
    const query = `${cleanTitle} gourmet food`.replace(/[^\w\s]/g, '').trim();

    const response = await axios.get(PIXABAY_API_URL, {
      params: {
        key: API_KEY,
        q: encodeURIComponent(query),
        image_type: 'photo',
        category: 'food',
        orientation: 'horizontal',
        safesearch: 'true',
        per_page: 3
      }
    });

    if (response.data.hits && response.data.hits.length > 0) {
      const imageUrl = response.data.hits[0].webformatURL;
      
      // Update cache
      recipe.imageUrl = imageUrl;
      await Recipe.updateOne({ _id:  recipe._id }, { $set: { imageUrl: imageUrl } });
      
      return imageUrl;
    }
  } catch (err) {
    if (err.response?.status === 429) {
      LAST_429_TIME = Date.now();
    }
    console.error(`[ImageService] Failed to fetch for ${recipe.title}:`, err.message);
  }

  // Final fallback if Pixabay had no hits or failed
  return defaultFallback;
};

/**
 * Process a list of recipes (Passive, relies on frontend for on-demand fetch).
 */
exports.processRecipesWithImages = async (recipes) => {
  if (!recipes || recipes.length === 0) return [];
  
  return recipes.map(recipe => {
    // If it's a Mongoose doc, convert to object for consistency
    const r = typeof recipe.toObject === 'function' ? recipe.toObject() : recipe;
    return r;
  });
};
