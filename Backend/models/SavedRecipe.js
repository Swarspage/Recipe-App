const mongoose = require('mongoose');

const SavedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  // Snapshot fields — store at save-time so they're available without always joining
  title:      { type: String },
  cuisine:    { type: String },
  cookTime:   { type: Number },
  difficulty: { type: String },
  tags:       { type: [String], default: [] },
  imageUrl:   { type: String },
  // Personalisation
  board:  { type: String, default: 'All Recipes' }, // user-created board name
  notes:  { type: String, default: '' },           // personal note
  rating: { type: Number, min: 1, max: 5, default: null }, // 1-5 stars
}, { timestamps: true });

// One user can save a recipe only once
SavedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('SavedRecipe', SavedRecipeSchema);
