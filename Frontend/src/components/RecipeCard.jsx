import React, { useState } from 'react';
import { HiHeart, HiOutlineHeart, HiClock, HiFire } from 'react-icons/hi';
import { motion } from 'framer-motion';

const RecipeCard = ({ recipe, isSaved, onToggleSave, matchScore }) => {
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.stopPropagation();
        setLoading(true);
        await onToggleSave(recipe);
        setLoading(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-[0_2px_12px_rgba(107,58,42,0.08)] overflow-hidden cursor-pointer group hover:shadow-[0_8px_32px_rgba(107,58,42,0.12)] transition-all duration-300"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={recipe.image_url || "https://images.unsplash.com/photo-1495521841625-f4006adc4f89?auto=format&fit=crop&q=80&w=1000"}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
                    >
                        {isSaved ? (
                            <HiHeart className="w-6 h-6 text-[#E8605A]" />
                        ) : (
                            <HiOutlineHeart className="w-6 h-6 text-[#A89080]" />
                        )}
                    </button>
                </div>
                {matchScore && (
                    <div className="absolute top-3 left-3 bg-[#C8884A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {matchScore}% Match
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 bg-[#F0E6DA] text-[#6B3A2A] text-xs font-semibold rounded uppercase tracking-wide">
                        {recipe.category}
                    </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-[#3B2415] mb-1 line-clamp-1">{recipe.name}</h3>
                <p className="text-[#8A7060] text-sm line-clamp-2 mb-4">{recipe.description}</p>

                <div className="flex items-center space-x-4 text-sm text-[#8A7060]">
                    <div className="flex items-center">
                        <HiClock className="w-4 h-4 mr-1" />
                        {recipe.time_minutes}m
                    </div>
                    <div className="flex items-center capitalize">
                        <HiFire className="w-4 h-4 mr-1" />
                        {recipe.difficulty}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RecipeCard;
