import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('ship2door_admin_token');
        const savedUser = localStorage.getItem('ship2door_admin_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user: userData } = res.data.data;
        if (userData.role !== 'admin') {
            throw new Error('Access denied. Admin privileges required.');
        }
        localStorage.setItem('ship2door_admin_token', token);
        localStorage.setItem('ship2door_admin_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('ship2door_admin_token');
        localStorage.removeItem('ship2door_admin_user');
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(data);
        localStorage.setItem('ship2door_admin_user', JSON.stringify(data));
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
