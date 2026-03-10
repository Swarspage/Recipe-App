const Recipe = require('../models/Recipe');
const searchService = require('../services/recipeSearchService');
const imageService = require('../services/imageService');

// Smart time-aware tags for Indian meal context (IST-aware)
function getMealTags() {
  // Use offset from UTC — IST is UTC+5:30
  const now = new Date();
  const istHour = (now.getUTCHours() + 5 + Math.floor((now.getUTCMinutes() + 30) / 60)) % 24;

  if (istHour >= 5 && istHour < 11) {
    // Breakfast: Light Indian staples
    return { tags: ['breakfast', 'quick', 'light', 'tiffin', 'snack'], label: 'breakfast' };
  } else if (istHour >= 11 && istHour < 16) {
    // Lunch: Rice dishes, dal, sabzi
    return { tags: ['lunch', 'rice', 'dal', 'curry', 'vegetarian', 'sabzi'], label: 'lunch' };
  } else if (istHour >= 16 && istHour < 19) {
    // Evening snacks / chai time
    return { tags: ['snack', 'tea-time', 'quick', 'street-food', 'appetizer'], label: 'snack' };
  } else {
    // Dinner: Hearty dishes, biryani, paneer, non-veg
    return { tags: ['dinner', 'biryani', 'curry', 'paneer', 'main-course', 'chicken'], label: 'dinner' };
  }
}

// Get featured recipes for dashboard — smart Indian-first selection
exports.getDashboardRecipes = async (req, res) => {
  try {
    const { tags } = getMealTags();

    // Attempt 1: Indian recipes matching meal-time tags (6 cards)
    let indianTimely = await Recipe.aggregate([
      { $match: { cuisine: 'Indian', tags: { $in: tags } } },
      { $sample: { size: 6 } }
    ]);

    // Attempt 2: If not enough tagged matches, fill with any Indian recipes
    let indianGeneral = [];
    if (indianTimely.length < 6) {
      const existingIds = indianTimely.map(r => r._id.toString());
      indianGeneral = await Recipe.aggregate([
        { $match: { cuisine: 'Indian', _id: { $nin: indianTimely.map(r => r._id) } } },
        { $sample: { size: 6 - indianTimely.length } }
      ]);
    }

    // Attempt 3: Fill remaining 2 slots with any other cuisine for variety
    const indianIds = [...indianTimely, ...indianGeneral].map(r => r._id);
    const variety = await Recipe.aggregate([
      { $match: { cuisine: { $ne: 'Indian' }, _id: { $nin: indianIds } } },
      { $sample: { size: 2 } }
    ]);

    const allRecipes = [...indianTimely, ...indianGeneral, ...variety];
    const processedRecipes = await imageService.processRecipesWithImages(allRecipes);
    res.json(processedRecipes);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard content' });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [total, aiGenerated, cuisines, quickCook] = await Promise.all([
      Recipe.countDocuments(),
      Recipe.countDocuments({ tags: 'ai-generated' }),
      Recipe.distinct('cuisine').then(r => r.filter(Boolean).length),
      Recipe.countDocuments({ cookTime: { $lte: 15 } }),
    ]);
    res.json({ total, aiGenerated, cuisines, quick: quickCook });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

exports.searchRecipes = async (req, res) => {
  try {
    const { ingredients, cuisine, tags, limit, page } = req.query;
    if (!ingredients) return res.status(400).json({ message: 'Ingredients are required' });

    const ingredientsArray = ingredients ? ingredients.split(',').filter(i => i.trim() !== '') : [];
    if (ingredientsArray.length === 0) return res.status(400).json({ message: 'At least one valid ingredient is required' });
    
    const limitNum = parseInt(limit) || 12;
    const pageNum = parseInt(page) || 1;

    const results = await searchService.searchByIngredients(ingredientsArray.map(i => i.trim().toLowerCase()), { 
      cuisine, 
      tags, 
      limit: limitNum, 
      page: pageNum 
    });

    // Ensure results have images
    results.items = await imageService.processRecipesWithImages(results.items);
    
    res.json(results);
  } catch (err) {
    console.error('Search ERROR [400 candidate]:', err);
    res.status(500).json({ message: 'Search failed', details: err.message });
  }
};

exports.createRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, ownerId: req.session.userId });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: 'Could not create recipe' });
  }
};

exports.getRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id).populate('ownerId', 'name avatarUrl');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    // Fetch and cache image for single recipe view
    const imageUrl = await imageService.getAndCacheImage(recipe);
    const recipeObj = recipe.toObject();
    recipeObj.imageUrl = imageUrl;

    res.json(recipeObj);
  } catch (err) {
    console.error('Get Recipe ERROR:', err);
    res.status(404).json({ message: 'Recipe not found' });
  }
};

exports.importRecipe = async (req, res) => {
  try {
    const { ingredients, allowAI } = req.body;
    console.log('Import request for:', ingredients, 'allowAI:', allowAI);
    const ingredientsArray = Array.isArray(ingredients) ? ingredients : ingredients.split(',');
    
    // 1. Search DB first
    console.log('Searching DB for matches...');
    const dbResults = await searchService.searchByIngredients(ingredientsArray, { limit: 5 });
    console.log('DB Matches found:', dbResults.items.length);
    
    if (dbResults.items.length > 0) {
      return res.json({ imported: false, matches: dbResults.items });
    }

    if (allowAI) {
      // 2. Generate via AI (Groq or Fallback)
      console.log('No DB matches. Triggering AI Generation...');
      let generatedRecipeData;
      try {
        generatedRecipeData = await searchService.generateRecipeFromGroq(ingredientsArray);
      } catch (aiErr) {
        console.error('AI Model failed, using local heuristic:', aiErr.message);
        generatedRecipeData = searchService.generateRecipeLocalHeuristic(ingredientsArray);
      }

      console.log('AI Generated/Heuristic Recipe:', generatedRecipeData.title);
      
      try {
        const recipe = new Recipe({
          ...generatedRecipeData,
          ownerId: req.session.userId
        });
        console.log('Saving synthesized recipe...');
        await recipe.save();
        console.log('Successfully saved recipe ID:', recipe._id);

        return res.json({ 
          imported: true, 
          recipe,
          message: 'Intelligence Synthesized'
        });
      } catch (saveErr) {
        console.error('Save failed, returning unsaved recipe:', saveErr.message);
        return res.json({
          imported: true,
          recipe: { ...generatedRecipeData, _id: 'temp-' + Date.now() },
          message: 'Preview Mode (Storage full or invalid)'
        });
      }
    }

    res.status(404).json({ message: 'No matching recipes found' });
  } catch (err) {
    console.error('Import ERROR:', err);
    res.status(500).json({ message: 'Import failed', details: err.message });
  }
};
exports.getRecipeImage = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const imageUrl = await imageService.getAndCacheImage(recipe);
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch image' });
  }
};
