const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Using ID from JSON for consistency if needed, though _id exists
    name: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String }],
    category: { type: String },
    cuisine: { type: String },
    time_minutes: { type: Number },
    difficulty: { type: String },
    servings: { type: Number },
    image_url: { type: String },
    steps: [{ type: String }],
    tags: [{ type: String }]
});

module.exports = mongoose.model('Recipe', recipeSchema);
