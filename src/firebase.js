// src/firebase.js - VERSION AVEC SUPPORT VISITEURS + RENDEZ-VOUS
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
};

const app = initializeApp(firebaseConfig);

let messaging = null;
(async () => {
    if (await isSupported()) {
        messaging = getMessaging(app);
    } else {
        console.warn("⚠️ Notifications push non supportées par ce navigateur.");
    }
})();

// 🔥 FONCTION : S'abonner à un topic spécifique
const subscribeToTopic = async (token, topic) => {
    try {
        const jwtToken = localStorage.getItem('token');

        if (!jwtToken) {
            console.warn(`⚠️ Pas de JWT token, abonnement ${topic} impossible`);
            return false;
        }

        const response = await fetch('http://localhost:5000/api/utilisateurs/subscribe-topic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            credentials: 'include',
            body: JSON.stringify({
                token: token,
                topic: topic
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Abonné au topic ${topic}:`, data);
            return true;
        } else {
            const errorText = await response.text();
            console.warn(`⚠️ Erreur abonnement ${topic}:`, response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erreur abonnement ${topic}:`, error);
        return false;
    }
};

// 🔥 FONCTION COMPLÈTE : Demander permission + S'abonner aux topics
export const requestPermission = async () => {
    try {
        if (!messaging) {
            console.warn("⚠️ Messaging non supporté");
            return null;
        }

        // 1. Enregistrer le service worker
        let registration = null;
        if ("serviceWorker" in navigator) {
            registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            await navigator.serviceWorker.ready;
            console.log("✅ Service Worker Firebase enregistré");
        }

        // 2. Demander permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("⚠️ Permission notifications refusée");
            return null;
        }

        // 3. Obtenir le token FCM
        const token = await getToken(messaging, {
            vapidKey: "BCU7SnP8a90YHfQZagtubVhPHZo54rSpLYnB-2yiTZmqeZl8QKOWKTBcxR9gGFiT8zMBwk4kswLiDCbrtVxjOAo",
            serviceWorkerRegistration: registration || undefined,
        });

        if (!token) {
            console.warn("⚠️ Aucun token FCM obtenu");
            return null;
        }

        console.log("✅ Token FCM Web :", token);

        // 🔥 4. S'ABONNER AUX DEUX TOPICS (VISITEURS + RENDEZ-VOUS)
        console.log("📡 Abonnement aux topics...");

        const [visitorSuccess, rendezvousSuccess] = await Promise.all([
            subscribeToTopic(token, 'visitor_updates'),
            subscribeToTopic(token, 'rendezvous_updates')
        ]);

        if (visitorSuccess && rendezvousSuccess) {
            console.log("✅✅ Abonné aux 2 topics (visiteurs + rendez-vous)");
        } else if (visitorSuccess || rendezvousSuccess) {
            console.warn("⚠️ Abonné partiellement:", {
                visitor_updates: visitorSuccess ? '✅' : '❌',
                rendezvous_updates: rendezvousSuccess ? '✅' : '❌'
            });
        } else {
            console.warn("❌ Échec abonnement aux topics");
        }

        return token;
    } catch (err) {
        console.error("❌ Erreur requestPermission:", err);
        return null;
    }
};

// Écouter les messages en premier plan
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) {
            console.warn("⚠️ Messaging non supporté: onMessage inactif");
            return;
        }
        onMessage(messaging, (payload) => {
            console.log("📨 Message Firebase reçu (foreground):", payload);
            resolve(payload);
        });
    });
