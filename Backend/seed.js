const mongoose = require('mongoose');
const Recipe = require('./models/Recipe');
require('dotenv').config();

const seedRecipes = [
  {
    title: "Classic Garlic Butter Shrimp",
    ingredients: [
      { name: "Shrimp", quantity: "500g", note: "Peeled and deveined" },
      { name: "Butter", quantity: "50g", note: "Unsalted" },
      { name: "Garlic", quantity: "4 cloves", note: "Minced" },
      { name: "Lemon", quantity: "1", note: "Juiced" },
      { name: "Parsley", quantity: "1 tbsp", note: "Chopped" }
    ],
    steps: [
      "In a large skillet, melt the butter over medium-high heat.",
      "Add the minced garlic and sauté for 1 minute until fragrant.",
      "Add the shrimp and cook for 2-3 minutes per side until pink and opaque.",
      "Stir in the lemon juice and half of the parsley.",
      "Garnish with remaining parsley and serve immediately."
    ],
    cuisine: "Mediterranean",
    cookTime: 15,
    difficulty: "easy",
    tags: ["seafood", "quick", "low-carb"]
  },
  {
    title: "Creamy Mushroom Risotto",
    ingredients: [
      { name: "Arborio Rice", quantity: "1 cup" },
      { name: "Mushrooms", quantity: "200g", note: "Sliced" },
      { name: "Onion", quantity: "1 small", note: "Diced" },
      { name: "Vegetable Broth", quantity: "3 cups" },
      { name: "Parmesan", quantity: "1/4 cup", note: "Grated" }
    ],
    steps: [
      "Warm the vegetable broth in a saucepan over low heat.",
      "In a large pan, sauté onions and mushrooms in butter until soft.",
      "Add the Arborio rice and toast for 2 minutes until translucent at the edges.",
      "Add broth one ladle at a time, stirring constantly until absorbed.",
      "Once rice is creamy and tender, stir in the Parmesan cheese."
    ],
    cuisine: "Italian",
    cookTime: 40,
    difficulty: "medium",
    tags: ["vegetarian", "comfort-food"]
  },
  {
    title: "Spicy Basil Chicken (Pad Krapow)",
    ingredients: [
      { name: "Chicken", quantity: "300g", note: "Minced" },
      { name: "Basil", quantity: "1 cup", note: "Holy basil preferred" },
      { name: "Chili", quantity: "3", note: "Bird's eye" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Soy Sauce", quantity: "1 tbsp" }
    ],
    steps: [
      "Pound the garlic and chilies into a coarse paste using a mortar and pestle.",
      "Heat oil in a wok and fry the garlic-chili paste until fragrant.",
      "Add the minced chicken and stir-fry until cooked through.",
      "Season with soy sauce, oyster sauce (optional), and a pinch of sugar.",
      "Turn off the heat and toss in the fresh basil leaves until wilted."
    ],
    cuisine: "Thai",
    cookTime: 10,
    difficulty: "easy",
    tags: ["spicy", "asian", "quick"]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    await Recipe.deleteMany({});
    console.log("Cleared existing recipes.");

    // Drop any ghost indexes that might cause issues (like the null id_1 index)
    try {
      await Recipe.collection.dropIndexes();
      console.log("Dropped existing indexes.");
    } catch (e) {
      console.log("No indexes to drop or collection doesn't exist yet.");
    }
    
    await Recipe.create(seedRecipes);
    console.log("Seeded successfully!");
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();
