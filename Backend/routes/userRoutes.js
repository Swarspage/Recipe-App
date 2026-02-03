const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to ensure auth
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) return next();
    res.status(401).json({ message: 'Unauthorized' });
};

router.use(isAuthenticated);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/saved', userController.getSavedRecipes);
router.post('/saved', userController.saveRecipe);
router.delete('/saved/:recipeId', userController.unsaveRecipe);

module.exports = router;
