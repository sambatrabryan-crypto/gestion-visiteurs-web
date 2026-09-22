// src/services/csrfService.js

let cachedCSRFToken = null;
let csrfTokenExpiry = null;

export const getCSRFToken = async () => {
    const now = Date.now();
    if (cachedCSRFToken && csrfTokenExpiry && now < csrfTokenExpiry) {
        return cachedCSRFToken;
    }

    try {
        const response = await fetch('http://localhost:5000/api/csrf-token', {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            cachedCSRFToken = data.csrfToken;
            csrfTokenExpiry = now + (5 * 60 * 1000); // 5 minutes
            console.log('✅ Token CSRF récupéré et mis en cache');
            return cachedCSRFToken;
        }
    } catch (error) {
        console.error('❌ Erreur récupération CSRF:', error);
    }
    return null;
};

export const clearCSRFToken = () => {
    cachedCSRFToken = null;
    csrfTokenExpiry = null;
};