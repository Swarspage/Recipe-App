const SavedRecipe = require('../models/SavedRecipe');
const Recipe = require('../models/Recipe');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── GET /api/cookbook — get all saved recipes for this user ──────────────────
exports.getSaved = async (req, res) => {
  try {
    const saved = await SavedRecipe.find({ userId: req.session.userId })
      .populate('recipeId', 'title cuisine cookTime difficulty tags imageUrl ingredients slug')
      .sort({ updatedAt: -1 });

    const items = saved.map(s => {
      // Use populated data if available, else fall back to snapshot stored in SavedRecipe
      const r = s.recipeId ? s.recipeId.toObject() : {};
      return {
        savedId: s._id,
        _id: r._id || s.recipeId,   // keep the recipe _id accessible
        title:      r.title      || s.title,
        cuisine:    r.cuisine    || s.cuisine,
        cookTime:   r.cookTime   || s.cookTime,
        difficulty: r.difficulty || s.difficulty,
        tags:       r.tags       || s.tags,
        imageUrl:   r.imageUrl   || s.imageUrl,
        ingredients: r.ingredients || [],
        board:    s.board,
        notes:    s.notes,
        rating:   s.rating,
        savedAt:  s.createdAt,
      };
    });
    res.json(items);
  } catch (err) {
    console.error('[Cookbook] getSaved:', err.message);
    res.status(500).json({ message: 'Failed to fetch cookbook' });
  }
};

// ── POST /api/cookbook — save a recipe ───────────────────────────────────────
exports.saveRecipe = async (req, res) => {
  try {
    const { recipeId, board = 'All Recipes', notes = '', rating = null } = req.body;
    if (!recipeId) return res.status(400).json({ message: 'recipeId is required' });

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      console.error('[Cookbook] Recipe not found:', recipeId);
      return res.status(404).json({ message: 'Recipe not found — it may not have been saved to DB yet' });
    }

    const saved = await SavedRecipe.findOneAndUpdate(
      { userId: req.session.userId, recipeId },
      {
        board, notes, rating,
        // snapshot so we can show it even if recipe is later deleted
        title: recipe.title, cuisine: recipe.cuisine, cookTime: recipe.cookTime,
        difficulty: recipe.difficulty, tags: recipe.tags, imageUrl: recipe.imageUrl,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('[Cookbook] Saved recipe:', recipe.title, 'for user:', req.session.userId);
    res.status(201).json({ message: 'Recipe saved!', savedId: saved._id });
  } catch (err) {
    console.error('[Cookbook] saveRecipe error:', err.message);
    res.status(500).json({ message: 'Failed to save recipe: ' + err.message });
  }
};


// ── PATCH /api/cookbook/:savedId — update board/notes/rating ─────────────────
exports.updateSaved = async (req, res) => {
  try {
    const { board, notes, rating } = req.body;
    const saved = await SavedRecipe.findOneAndUpdate(
      { _id: req.params.savedId, userId: req.session.userId },
      { board, notes, rating },
      { new: true }
    );
    if (!saved) return res.status(404).json({ message: 'Not found' });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update' });
  }
};

// ── DELETE /api/cookbook/:savedId — unsave ───────────────────────────────────
exports.unsaveRecipe = async (req, res) => {
  try {
    // Accept either savedId or recipeId
    const query = { userId: req.session.userId };
    const id = req.params.savedId;
    // Try as recipeId first (more common from UI)
    const byRecipe = await SavedRecipe.findOneAndDelete({ ...query, recipeId: id });
    if (!byRecipe) {
      await SavedRecipe.findOneAndDelete({ ...query, _id: id });
    }
    res.json({ message: 'Unsaved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsave' });
  }
};

// ── GET /api/cookbook/check/:recipeId — is it saved? ────────────────────────
exports.checkSaved = async (req, res) => {
  try {
    const doc = await SavedRecipe.findOne({ userId: req.session.userId, recipeId: req.params.recipeId });
    res.json({ saved: !!doc, savedId: doc?._id, board: doc?.board, notes: doc?.notes, rating: doc?.rating });
  } catch (err) {
    res.json({ saved: false });
  }
};

// ── GET /api/cookbook/taste-profile — AI analyse saved recipes ──────────────
exports.getTasteProfile = async (req, res) => {
  try {
    const saved = await SavedRecipe.find({ userId: req.session.userId }).limit(30);
    if (saved.length < 2) return res.json({ profile: null, message: 'Save more recipes to unlock your taste profile!' });

    const cuisines = {};
    const tagCounts = {};
    let totalCookTime = 0, cookTimeCount = 0;

    saved.forEach(s => {
      if (s.cuisine) cuisines[s.cuisine] = (cuisines[s.cuisine] || 0) + 1;
      s.tags?.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
      if (s.cookTime) { totalCookTime += s.cookTime; cookTimeCount++; }
    });

    const topCuisines = Object.entries(cuisines).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
    const avgTime = cookTimeCount > 0 ? Math.round(totalCookTime / cookTimeCount) : null;

    const prompt = `A user has saved ${saved.length} recipes. Their top cuisines are: ${topCuisines.join(', ')}. Their most common recipe tags are: ${topTags.join(', ')}. Their average preferred cook time is ${avgTime} minutes.

Based on this, return JSON:
{
  "headline": "A fun 1-line summary of their taste identity (e.g. 'A spice-loving Indian food adventurer')",
  "emoji": "One fitting emoji",
  "traits": ["Trait 1 (max 4 words)", "Trait 2", "Trait 3"],
  "topCuisine": "${topCuisines[0] || 'Indian'}",
  "cookingStyle": "One of: Quick & Easy | Weekend Chef | Adventurous | Healthy Eater | Comfort Seeker",
  "recommendation": "One specific dish they should try next (dish name only)"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 250,
    });
    const profile = JSON.parse(completion.choices[0].message.content);
    res.json({ profile, stats: { total: saved.length, topCuisines, topTags, avgTime } });
  } catch (err) {
    console.error('[Taste Profile]', err.message);
    res.json({ profile: null });
  }
};
