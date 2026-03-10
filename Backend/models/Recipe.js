const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  ingredients: [{
    name: String,
    quantity: String,
    note: String,
  }],
  ingredientNames: {
    type: [String], // Lowercase versions for search
    index: true,
  },
  steps: [String],
  notes: String,
  cuisine: String,
  cookTime: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  tags: [String],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  sourceUrl: String,
  imageUrl: String,
}, { timestamps: true });

// Pre-save hook to generate ingredientNames and slug
RecipeSchema.pre('validate', function(next) {
  if ((!this.ingredientNames || this.ingredientNames.length === 0) && this.isModified('ingredients') && Array.isArray(this.ingredients)) {
    this.ingredientNames = this.ingredients
      .filter(i => i && i.name)
      .map(i => i.name.toLowerCase());
  }
  if (!this.title) {
    this.title = "Untitled Culinary Secret";
  }
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }
  next();
});

module.exports = mongoose.model('Recipe', RecipeSchema);
