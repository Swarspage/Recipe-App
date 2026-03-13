const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const auth = (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });
  next();
};

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
