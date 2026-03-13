const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  savedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  culinaryProfile: {
    basics: {
      homeCuisine: { type: String, default: '' },
      currentRegion: { type: String, default: '' },
      heritageStory: { type: String, default: '' },
    },
    dietary: {
      primaryDiet: { type: String, default: 'None' },
      strictness: { type: Number, default: 5, min: 1, max: 10 },
      allergies: [String],
      hatedIngredients: [String],
    },
    flavorDNA: {
      spiceLevel: { type: Number, default: 3, min: 1, max: 5 },
      sweetTooth: { type: Number, default: 3, min: 1, max: 5 },
      saltIndex: { type: Number, default: 3, min: 1, max: 5 },
      umamiFocus: { type: Number, default: 3, min: 1, max: 5 },
    },
    equipment: [String],
    goals: {
      macroTarget: { type: String, default: 'Balanced' },
      healthFocus: { type: String, default: '' },
      cookingMotivation: { type: String, default: '' },
    },
    meta: {
      skillLevel: { type: String, default: 'Beginner' },
      onboardingComplete: { type: Boolean, default: false },
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
