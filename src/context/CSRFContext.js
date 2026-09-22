// src/context/CSRFContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchCSRFToken } from '../api/axiosConfig';

const CSRFContext = createContext();

export const CSRFProvider = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const refreshCSRFToken = async () => {
        setIsLoading(true);
        const token = await fetchCSRFToken();
        if (token) {
            setCsrfToken(token);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshCSRFToken();
    }, []);

    return (
        <CSRFContext.Provider value={{ csrfToken, refreshCSRFToken, isLoading }}>
            {children}
        </CSRFContext.Provider>
    );
};

export const useCSRF = () => {
    const context = useContext(CSRFContext);
    if (!context) {
        throw new Error('useCSRF doit être utilisé dans un CSRFProvider');
    }
    return context;
};
