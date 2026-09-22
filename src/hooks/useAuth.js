// src/hooks/useAuth.js - VERSION FINALE
import { useState, useEffect, useCallback } from 'react';
import { getNormalizedUserRole } from '../utils/rolePermissions'; // 🔥 Supprimé USER_ROLES

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const authStatus = localStorage.getItem('isAuthenticated');

        if (token && user && authStatus === 'true') {
            setIsAuthenticated(true);
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    const getUserRole = useCallback(() => getNormalizedUserRole(currentUser), [currentUser]);

    const handleLoginSuccess = useCallback((user, token) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(user));
        if (token) {
            localStorage.setItem('token', token);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
        setCurrentUser(null);
    }, []);

    const getToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    return {
        isAuthenticated,
        currentUser,
        loading,
        getUserRole,
        handleLoginSuccess,
        handleLogout,
        getToken
    };
};