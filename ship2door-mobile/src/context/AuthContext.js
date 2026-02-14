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

    /**
     * Google Login — supports two flows:
     * 1. idToken flow (preferred): sends Google ID token to backend for verification
     * 2. userInfo flow (fallback): when expo-auth-session returns only accessToken,
     *    the screen fetches Google user info and sends it directly
     */
    const googleLogin = async (idToken, userInfo) => {
        let res;
        if (idToken) {
            // Flow 1: ID token verification on backend
            res = await authAPI.googleLogin({ idToken });
        } else if (userInfo) {
            // Flow 2: Direct user info (accessToken fallback)
            res = await authAPI.googleLogin({
                google_id: userInfo.google_id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
            });
        } else {
            throw new Error('No authentication data provided');
        }

        const { token, user: userData } = res.data.data;
        await AsyncStorage.setItem('ship2door_token', token);
        await AsyncStorage.setItem('ship2door_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const registerPushToken = async (pushToken) => {
        try {
            await authAPI.registerPushToken(pushToken);
        } catch (e) {
            console.error('Failed to register push token:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateUser, registerPushToken }}>
            {children}
        </AuthContext.Provider>
    );
}
