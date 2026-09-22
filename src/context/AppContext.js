// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { statsService, visiteursService, rendezVousService } from '../api/api';

const AppContext = createContext();

const initialState = {
    stats: {
        visitesAujourdhui: 0,
        rdvPlanifies: 0,
        enAttente: 0,
    },
    loading: false,
    error: null,
    visiteurs: [],
    rendezVous: [],
};

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_STATS':
            return { ...state, stats: action.payload };
        case 'SET_VISITEURS':
            return { ...state, visiteurs: action.payload };
        case 'SET_RENDEZ_VOUS':
            return { ...state, rendezVous: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const fetchStats = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await statsService.getStats();
            dispatch({ type: 'SET_STATS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const fetchVisiteurs = async () => {
        try {
            const response = await visiteursService.getAll();
            dispatch({ type: 'SET_VISITEURS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    const fetchRendezVous = async () => {
        try {
            const response = await rendezVousService.getAll();
            dispatch({ type: 'SET_RENDEZ_VOUS', payload: response.data });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    // Charger les données au montage du composant
    useEffect(() => {
        fetchStats();
        fetchVisiteurs();
        fetchRendezVous();
    }, []);

    const value = {
        ...state,
        fetchStats,
        fetchVisiteurs,
        fetchRendezVous,
        refreshData: () => {
            fetchStats();
            fetchVisiteurs();
            fetchRendezVous();
        },
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};