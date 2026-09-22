/* eslint-disable no-undef */
/* global importScripts, firebase, self, clients */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Configuration Firebase (identique à src/firebase.js)
firebase.initializeApp({
    apiKey: "AIzaSyCMXOEJOZ-91y06ay-B1BFj15rugYAOHgE",
    authDomain: "visitorsystem-99758.firebaseapp.com",
    projectId: "visitorsystem-99758",
    storageBucket: "visitorsystem-99758.firebasestorage.app",
    messagingSenderId: "884430603769",
    appId: "1:884430603769:web:ec4c52ecb6803faca96928",
});

const messaging = firebase.messaging();

// 🔔 Notifications en arrière-plan (onglet fermé/inactif)
messaging.onBackgroundMessage((payload) => {
    console.log("📨 [Service Worker] Message en arrière-plan:", payload);

    const title = payload.notification?.title || "Notification EUROP-ALU";
    const options = {
        body: payload.notification?.body || "Nouvelle notification",
        icon: "/logo192.png",
        badge: "/badge-72x72.png",
        data: payload.data || {},
        tag: 'visitor-notification',
        requireInteraction: false,
    };

    // eslint-disable-next-line no-restricted-globals
    self.registration.showNotification(title, options);
});

// 🖱️ Gérer le clic sur la notification
// eslint-disable-next-line no-restricted-globals
self.addEventListener('notificationclick', (event) => {
    console.log("🖱️ [Service Worker] Notification cliquée:", event.notification.data);

    event.notification.close();

    // Ouvrir l'application web
    event.waitUntil(
        // eslint-disable-next-line no-restricted-globals
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si l'app est déjà ouverte, la focus
            for (const client of clientList) {
                // eslint-disable-next-line no-restricted-globals
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon, ouvrir un nouvel onglet
            // eslint-disable-next-line no-restricted-globals
            if (clients.openWindow) {
                // eslint-disable-next-line no-restricted-globals
                return clients.openWindow('/');
            }
        })
    );
});

// 🔄 Lifecycle: Installation
// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', (event) => {
    console.log('📦 [Service Worker] Installation');
    // eslint-disable-next-line no-restricted-globals
    self.skipWaiting();
});

// ✅ Lifecycle: Activation
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', (event) => {
    console.log('✅ [Service Worker] Activation');
    // eslint-disable-next-line no-restricted-globals
    event.waitUntil(clients.claim());
});
