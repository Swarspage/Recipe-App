import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import StatsCard from '../components/StatsCard';
import { HiArrowRight } from 'react-icons/hi';

const Dashboard = () => {
    const { user, api } = useContext(AuthContext);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/user/saved');
                setSavedRecipes(res.data);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    // Compute Stats
    const totalSaved = savedRecipes.length;
    const uniqueIngredients = new Set(
        savedRecipes.flatMap(r => r.ingredients)
    ).size;
    const uniqueCategories = new Set(
        savedRecipes.map(r => r.category)
    ).size;

    if (loading) return <div className="text-center py-20 text-[#8A7060]">Loading your kitchen...</div>;

    return (
        <div>
            {/* Welcome Banner */}
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-[#3B2415] mb-2">
                    Welcome back, {user?.username}
                </h1>
                <p className="text-[#8A7060]">Here is what is happening in your kitchen today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard title="Total Saved" value={totalSaved} icon="📖" />
                <StatsCard title="Ingredients Used" value={uniqueIngredients} icon="🥕" />
                <StatsCard title="Categories Explored" value={uniqueCategories} icon="🏷️" />
            </div>

            {/* CTA Section */}
            <div className="bg-[#6B3A2A] rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between text-white shadow-lg relative overflow-hidden">
                <div className="z-10">
                    <h2 className="text-2xl font-serif font-bold mb-2">Ready to cook something new?</h2>
                    <p className="text-[#E5DCD2] mb-6 md:mb-0">Tell us what ingredients you have, and we will do the magic.</p>
                </div>
                <button
                    onClick={() => navigate('/suggestions')}
                    className="bg-white text-[#6B3A2A] px-6 py-3 rounded-full font-semibold hover:bg-[#F7F0E8] transition-colors flex items-center z-10"
                >
                    Find Recipes <HiArrowRight className="ml-2" />
                </button>
                {/* Decorative Circle */}
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            {/* Recently Saved */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#3B2415]">Recently Saved</h2>
                    {savedRecipes.length > 0 && (
                        <button onClick={() => navigate('/profile')} className="text-[#6B3A2A] hover:underline font-medium">
                            View All
                        </button>
                    )}
                </div>

                {savedRecipes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#E5DCD2]">
                        <p className="text-[#8A7060] mb-4">You haven't saved any recipes yet.</p>
                        <button onClick={() => navigate('/suggestions')} className="text-[#6B3A2A] font-medium hover:underline">
                            Start exploring recipes →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedRecipes.slice(0, 3).map(recipe => (
                            <RecipeCard
                                key={recipe._id}
                                recipe={recipe}
                                isSaved={true}
                                onToggleSave={() => { }} // Could implement unsave here, but simplified for dashboard
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
