const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

// Chat session CRUD
router.get('/chats', auth, aiController.listChats);
router.post('/chats', auth, aiController.createChat);
router.get('/chats/:id', auth, aiController.getChat);
router.delete('/chats/:id', auth, aiController.deleteChat);

// Core AI chat endpoint
router.post('/chat', auth, aiController.handleChat);
router.post('/pantry-insight', aiController.getPantryInsight);

// Legacy
router.delete('/chat', auth, aiController.clearChat);

module.exports = router;
