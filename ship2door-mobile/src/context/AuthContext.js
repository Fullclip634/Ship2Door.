import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await AsyncStorage.getItem('ship2door_token');
            const savedUser = await AsyncStorage.getItem('ship2door_user');
            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user: userData } = res.data.data;
        await AsyncStorage.setItem('ship2door_token', token);
        await AsyncStorage.setItem('ship2door_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token, user: userData } = res.data.data;
        await AsyncStorage.setItem('ship2door_token', token);
        await AsyncStorage.setItem('ship2door_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('ship2door_token');
        await AsyncStorage.removeItem('ship2door_user');
        setUser(null);
    };

    const updateUser = async (data) => {
        setUser(data);
        await AsyncStorage.setItem('ship2door_user', JSON.stringify(data));
    };

    const googleLogin = async (idToken) => {
        const res = await authAPI.googleLogin({ idToken });
        const { token, user: userData } = res.data.data;
        await AsyncStorage.setItem('ship2door_token', token);
        await AsyncStorage.setItem('ship2door_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
