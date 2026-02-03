import React from 'react';
import { motion } from 'framer-motion';

const IngredientChip = ({ name, selected, onClick }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
        ${selected
                    ? 'bg-[#6B3A2A] text-white shadow-md'
                    : 'bg-[#EDE6DC] text-[#6B3A2A] hover:bg-[#E5DCD2]'
                }`}
        >
            {name}
        </motion.button>
    );
};

export default IngredientChip;
