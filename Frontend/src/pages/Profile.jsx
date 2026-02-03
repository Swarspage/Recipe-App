import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import StatsCard from '../components/StatsCard';

const Profile = () => {
    const { user, api, updateProfile } = useContext(AuthContext);
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ username: '', email: '' });
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const res = await api.get('/user/saved');
            setSavedRecipes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        if (user) setEditData({ username: user.username, email: user.email });
    }, [user, api]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(editData);
            setIsEditing(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    const handleUnsave = async (recipe) => {
        try {
            await api.delete(`/user/saved/${recipe._id}`);
            // Optimistic update
            setSavedRecipes(prev => prev.filter(r => r._id !== recipe._id));
        } catch (err) {
            console.error('Failed to unsave');
        }
    };

    // Compute Stats
    const totalSaved = savedRecipes.length;
    const uniqueIngredients = new Set(savedRecipes.flatMap(r => r.ingredients)).size;
    const uniqueCategories = new Set(savedRecipes.map(r => r.category)).size;

    // Avatar Color
    const getAvatarColor = (name) => {
        // Simple hash to color
        const colors = ['bg-[#6B3A2A]', 'bg-[#C8884A]', 'bg-[#E8605A]', 'bg-[#6BAF7B]'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-[#E5DCD2] flex flex-col md:flex-row items-center gap-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-serif text-white ${getAvatarColor(user.username)}`}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-3xl font-serif font-bold text-[#3B2415]">{user.username}</h1>
                    <p className="text-[#8A7060]">{user.email}</p>
                    <p className="text-sm text-[#A89080] mt-1">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="border border-[#6B3A2A] text-[#6B3A2A] px-6 py-2 rounded-full font-medium hover:bg-[#F7F0E8] transition-colors"
                >
                    Edit Profile
                </button>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-serif font-bold mb-6">Edit Profile</h2>
                        {error && <p className="text-[#E06B5A] mb-4 text-sm">{error}</p>}
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#3B2415] mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editData.username}
                                    onChange={e => setEditData({ ...editData, username: e.target.value })}
                                    className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#3B2415] mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editData.email}
                                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-2"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 text-[#8A7060] hover:text-[#3B2415]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-[#6B3A2A] text-white rounded-full hover:bg-[#5A3020]"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard title="Total Saved" value={totalSaved} icon="📖" />
                <StatsCard title="Ingredients Used" value={uniqueIngredients} icon="🥕" />
                <StatsCard title="Categories Explored" value={uniqueCategories} icon="🏷️" />
            </div>

            {/* Saved Recipes */}
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#3B2415] mb-6">My Saved Recipes</h2>
                {savedRecipes.length === 0 ? (
                    <p className="text-[#8A7060]">No recipes saved yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe._id}
                                recipe={recipe}
                                isSaved={true}
                                onToggleSave={handleUnsave}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
