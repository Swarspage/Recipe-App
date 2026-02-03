import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F7F0E8] flex flex-col justify-center items-center text-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#C8884A] opacity-10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6B3A2A] opacity-10 rounded-full filter blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl z-10"
            >
                <span className="text-[#C8884A] font-bold tracking-widest uppercase text-sm mb-4 block">
                    Elevate Your Cooking
                </span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#3B2415] mb-6 leading-tight">
                    Cook smarter with <br /> <span className="text-[#6B3A2A]">what you have.</span>
                </h1>
                <p className="text-[#8A7060] text-lg md:text-xl mb-10 max-w-xl mx-auto">
                    Zest helps you discover premium recipes based on the ingredients already in your pantry. No waste, just taste.
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    className="bg-[#6B3A2A] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#5A3020] transition-colors shadow-lg"
                >
                    Get Started
                </motion.button>

                <div className="mt-8">
                    <button onClick={() => navigate('/login')} className="text-[#8A7060] hover:text-[#6B3A2A] text-sm font-medium">
                        Already have an account? Log In
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
