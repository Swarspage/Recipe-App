import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    if (location.pathname === '/' || location.pathname === '/login') return null;

    return (
        <nav className="bg-white border-b border-[#E5DCD2] sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/dashboard" className="text-2xl font-serif font-bold text-[#6B3A2A] tracking-tight">
                    Zest.
                </Link>

                {user && (
                    <div className="flex items-center space-x-6">
                        <Link to="/dashboard" className="text-[#3B2415] hover:text-[#6B3A2A] font-medium transition-colors">
                            Dashboard
                        </Link>
                        <Link to="/suggestions" className="text-[#3B2415] hover:text-[#6B3A2A] font-medium transition-colors">
                            Find Recipes
                        </Link>
                        <Link to="/profile" className="text-[#3B2415] hover:text-[#6B3A2A] font-medium transition-colors">
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-[#8A7060] hover:text-[#6B3A2A] text-sm font-medium transition-colors"
                        >
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
