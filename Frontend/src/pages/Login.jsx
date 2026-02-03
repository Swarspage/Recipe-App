import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login(formData.username, formData.password);
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                await register(formData.username, formData.email, formData.password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F0E8] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-[0_8px_32px_rgba(107,58,42,0.15)] w-full max-w-md p-8"
            >
                <div className="flex justify-center mb-8 space-x-8 border-b border-[#E5DCD2] pb-4">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`text-lg font-serif font-bold pb-4 -mb-4 border-b-2 transition-colors ${isLogin ? 'text-[#6B3A2A] border-[#6B3A2A]' : 'text-[#A89080] border-transparent hover:text-[#3B2415]'}`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`text-lg font-serif font-bold pb-4 -mb-4 border-b-2 transition-colors ${!isLogin ? 'text-[#6B3A2A] border-[#6B3A2A]' : 'text-[#A89080] border-transparent hover:text-[#3B2415]'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {error && (
                    <div className="bg-[#E06B5A]/10 text-[#E06B5A] px-4 py-2 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-3 text-[#3B2415] placeholder-[#A89080] focus:outline-none focus:border-[#6B3A2A] focus:ring-1 focus:ring-[#6B3A2A] transition-all"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-3 text-[#3B2415] placeholder-[#A89080] focus:outline-none focus:border-[#6B3A2A] focus:ring-1 focus:ring-[#6B3A2A] transition-all"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-3 text-[#3B2415] placeholder-[#A89080] focus:outline-none focus:border-[#6B3A2A] focus:ring-1 focus:ring-[#6B3A2A] transition-all"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-[#FAFAFA] border border-[#E5DCD2] rounded-xl px-4 py-3 text-[#3B2415] placeholder-[#A89080] focus:outline-none focus:border-[#6B3A2A] focus:ring-1 focus:ring-[#6B3A2A] transition-all"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#6B3A2A] text-white py-3 rounded-full font-semibold text-lg hover:bg-[#5A3020] transition-colors shadow-sm mt-6"
                    >
                        {isLogin ? 'Log In' : 'Create Account'}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#8A7060] hover:text-[#6B3A2A] text-sm"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
