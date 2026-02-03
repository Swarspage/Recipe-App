import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        withCredentials: true
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/check');
                setUser(res.data.user);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        setUser(res.data.user);
        return res.data;
    };

    const register = async (username, email, password) => {
        const res = await api.post('/auth/register', { username, email, password });
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await api.put('/user/profile', data);
        setUser(prev => ({ ...prev, ...res.data.user }));
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, api }}>
            {children}
        </AuthContext.Provider>
    );
};
