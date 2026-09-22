// src/api/axiosConfig.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Créer une instance axios configurée
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important pour les cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Fonction pour récupérer le token CSRF
export const fetchCSRFToken = async () => {
    try {
        const response = await axios.get(`${API_URL}/csrf-token`, {
            withCredentials: true
        });
        return response.data.csrfToken;
    } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
        return null;
    }
};

// Intercepteur pour ajouter automatiquement le token CSRF
api.interceptors.request.use(
    async (config) => {
        // Pour les méthodes qui modifient les données
        if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            const csrfToken = await fetchCSRFToken();
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs CSRF
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_VALIDATION_FAILED') {
            console.error('Token CSRF invalide, rafraîchissement...');
            // Optionnel: réessayer la requête avec un nouveau token
        }
        return Promise.reject(error);
    }
);

export default api;
