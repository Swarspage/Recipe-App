const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound unique index to prevent saving the same recipe twice
savedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
