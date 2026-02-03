const Recipe = require('../models/Recipe');
const fs = require('fs');
const path = require('path');

exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes' });
    }
};

exports.seedRecipes = async () => {
    try {
        const count = await Recipe.countDocuments();
        if (count === 0) {
            const dataPath = path.join(__dirname, '../recipes.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            const json = JSON.parse(data);

            await Recipe.insertMany(json.recipes);
            console.log('Recipes seeded successfully');
        } else {
            console.log('Recipes already exist, skipping seed');
        }
    } catch (error) {
        console.error('Seeding error:', error);
    }
};
