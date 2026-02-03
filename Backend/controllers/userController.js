const User = require('../models/User');
const SavedRecipe = require('../models/SavedRecipe');
const Recipe = require('../models/Recipe');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check uniqueness if changing
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Username taken' });
            user.username = username;
        }
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email taken' });
            user.email = email;
        }

        await user.save();
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getSavedRecipes = async (req, res) => {
    try {
        const saved = await SavedRecipe.find({ userId: req.session.userId })
            .populate('recipeId')
            .sort({ savedAt: -1 });

        // Transform to return just recipe objects with savedAt if needed, or keeping structure
        const recipes = saved.map(item => ({
            ...item.recipeId.toObject(),
            savedAt: item.savedAt
        }));

        res.json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching saved recipes' });
    }
};

exports.saveRecipe = async (req, res) => {
    try {
        const { recipeId } = req.body;

        // Prevent duplicate
        const existing = await SavedRecipe.findOne({
            userId: req.session.userId,
            recipeId
        });

        if (existing) {
            return res.status(400).json({ message: 'Recipe already saved' });
        }

        const newSaved = new SavedRecipe({
            userId: req.session.userId,
            recipeId
        });

        await newSaved.save();
        res.status(201).json({ message: 'Recipe saved' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.unsaveRecipe = async (req, res) => {
    try {
        const { recipeId } = req.params;
        await SavedRecipe.findOneAndDelete({
            userId: req.session.userId,
            recipeId
        });
        res.json({ message: 'Recipe removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
