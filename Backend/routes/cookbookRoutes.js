const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cookbookController');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

router.use(auth); // All cookbook routes require login

router.get('/',                   ctrl.getSaved);
router.post('/',                  ctrl.saveRecipe);
router.get('/taste-profile',      ctrl.getTasteProfile);
router.get('/check/:recipeId',    ctrl.checkSaved);
router.patch('/:savedId',         ctrl.updateSaved);
router.delete('/:savedId',        ctrl.unsaveRecipe);

module.exports = router;
