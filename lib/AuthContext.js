'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('JurisNode_auth');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setUser(parsed.user);
                setToken(parsed.token);
            } catch { }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('JurisNode_auth', JSON.stringify({ user: userData, token: authToken }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('JurisNode_auth');
    };

    const authFetch = async (url, options = {}) => {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(url, { ...options, headers });
        return res;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
