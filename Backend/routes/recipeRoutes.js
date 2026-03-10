const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

router.get('/dashboard', recipeController.getDashboardRecipes);
router.get('/stats', recipeController.getDashboardStats);
router.get('/search', recipeController.searchRecipes);
router.post('/import', recipeController.importRecipe);
router.get('/:id/image', recipeController.getRecipeImage);
router.get('/:id', recipeController.getRecipe);
router.post('/', auth, recipeController.createRecipe);

module.exports = router;
