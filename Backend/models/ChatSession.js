const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  // If assistant generated a recipe, store its ID
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
  recipeData: { type: Object, default: null }, // Snapshot so it renders even if recipe is deleted
}, { timestamps: true });

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' }, // Auto-set from first user message
  messages: [MessageSchema],
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
