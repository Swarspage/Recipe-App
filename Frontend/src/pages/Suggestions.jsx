import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ingredientCategories } from '../data/ingredients';
import IngredientChip from '../components/IngredientChip';
import RecipeCard from '../components/RecipeCard';
import { HiSearch, HiX, HiFilter } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const Suggestions = () => {
    const { api, user } = useContext(AuthContext);
    const [recipes, setRecipes] = useState([]);
    const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
    const [selectedIngredients, setSelectedIngredients] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch Recipes & User's Saved Recipes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recipeRes, savedRes] = await Promise.all([
                    api.get('/recipes'),
                    api.get('/user/saved')
                ]);
                setRecipes(recipeRes.data);
                // Map saved recipes to ID set for O(1) lookup
                // Check if savedRes.data is array of objects or strings to be safe
                // Based on backend, it returns recipe objects. So map _id.
                const ids = new Set(savedRes.data.map(r => r._id));
                setSavedRecipeIds(ids);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    // Toggle Ingredient
    const toggleIngredient = (ing) => {
        const newSelected = new Set(selectedIngredients);
        if (newSelected.has(ing)) {
            newSelected.delete(ing);
        } else {
            newSelected.add(ing);
        }
        setSelectedIngredients(newSelected);
    };

    // Clear All
    const clearSelection = () => {
        setSelectedIngredients(new Set());
        setSearchQuery('');
    };

    // Recipe Matching Logic
    const matchedRecipes = useMemo(() => {
        if (selectedIngredients.size === 0) return [];

        const results = recipes.map(recipe => {
            // ingredients in recipe are lowercase strings
            const matched = recipe.ingredients.filter(ing => selectedIngredients.has(ing));
            const count = matched.length;
            const score = Math.round((count / recipe.ingredients.length) * 100);
            return { ...recipe, matchedCount: count, matchScore: score };
        })
            .filter(r => r.matchedCount > 0)
            .sort((a, b) => b.matchScore - a.matchScore || a.time_minutes - b.time_minutes);

        return results;
    }, [selectedIngredients, recipes]);

    // Handle Save Toggle
    const handleToggleSave = async (recipe) => {
        try {
            if (savedRecipeIds.has(recipe._id)) {
                // Unsave
                await api.delete(`/user/saved/${recipe._id}`);
                setSavedRecipeIds(prev => {
                    const next = new Set(prev);
                    next.delete(recipe._id);
                    return next;
                });
            } else {
                // Save
                await api.post('/user/saved', { recipeId: recipe._id });
                setSavedRecipeIds(prev => new Set(prev).add(recipe._id));
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-100px)]">
            {/* LEFT PANEL: Ingredient Selector */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E5DCD2] sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-serif font-bold text-[#3B2415]">Pantry</h2>
                        <button
                            onClick={clearSelection}
                            className="text-sm text-[#8A7060] hover:text-[#6B3A2A] font-medium"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <HiSearch className="absolute left-3 top-3 text-[#A89080]" />
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl pl-10 pr-4 py-2 text-[#3B2415] focus:outline-none focus:border-[#6B3A2A]"
                        />
                    </div>

                    {/* Categories & Chips */}
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {ingredientCategories.map(cat => {
                            // Filter items based on search
                            const visibleItems = cat.items.filter(item =>
                                item.toLowerCase().includes(searchQuery.toLowerCase())
                            );

                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={cat.categoryName}>
                                    <h3 className="flex items-center text-sm font-bold text-[#8A7060] uppercase tracking-wide mb-3">
                                        <span className="mr-2 text-lg">{cat.icon}</span> {cat.categoryName}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {visibleItems.map(item => (
                                            <IngredientChip
                                                key={item}
                                                name={item}
                                                selected={selectedIngredients.has(item)}
                                                onClick={() => toggleIngredient(item)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Results */}
            <div className="w-full lg:w-2/3">
                <div className="mb-6">
                    <h1 className="text-3xl font-serif font-bold text-[#3B2415] mb-2">Recipe Suggestions</h1>
                    <p className="text-[#8A7060]">
                        {selectedIngredients.size === 0
                            ? "Select ingredients from the pantry to see what you can cook."
                            : `Found ${matchedRecipes.length} recipes based on your selection.`}
                    </p>
                </div>

                {selectedIngredients.size === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-[#E5DCD2] p-12 text-center">
                        <div className="bg-[#F7F0E8] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            👩‍🍳
                        </div>
                        <p className="text-[#8A7060] text-lg font-medium">Your countertop is empty!</p>
                        <p className="text-[#A89080]">Start selecting ingredients to find delicious recipes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {matchedRecipes.map(recipe => (
                                <RecipeCard
                                    key={recipe._id}
                                    recipe={recipe}
                                    isSaved={savedRecipeIds.has(recipe._id)}
                                    onToggleSave={handleToggleSave}
                                    matchScore={recipe.matchScore}
                                />
                            ))}
                        </AnimatePresence>

                        {matchedRecipes.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-[#8A7060]">No recipes match this exact combination. Try adding more ingredients or removing some.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Suggestions;
