// src/services/apiService.js
import { getCSRFToken } from './csrfService';

const BASE_URL = 'http://localhost:5000/api';

export const apiService = {
    async call(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${cleanEndpoint}`;

        const config = {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const methodsRequiringCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const method = (options.method || 'GET').toUpperCase();

        if (methodsRequiringCSRF.includes(method)) {
            const csrfToken = await getCSRFToken();
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Session expirée');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    },

    handleUnauthorized() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        window.location.reload();
    },

    // Méthodes spécifiques
    async fetchStats() {
        return this.call('/statistiques/accueil');
    },

    async createVisiteur(data) {
        return this.call('/visiteurs', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async createRendezVous(data) {
        return this.call('/rendezvous', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async registerFCMToken(token) {
        return this.call('/utilisateurs/fcm-token', {
            method: 'POST',
            body: JSON.stringify({ fcm_token: token })
        });
    }
};