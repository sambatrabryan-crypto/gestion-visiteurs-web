// src/config/viewsConfig.js
export const viewComponentsConfig = {
    'accueil': {
        component: 'Accueil',
        requiresAuth: true,
        props: ['onNavigate', 'stats', 'loading', 'onRefresh', 'user']
    },
    'formulaire': {
        component: 'FormulaireVisiteur',
        requiresAuth: true,
        props: ['onBack', 'onCreateVisiteur']
    },
    'rendezvous': {
        component: 'RendezVous',
        requiresAuth: true,
        props: ['onBack', 'onCreateRendezVous', 'onNavigate']
    },
    'liste-visiteurs': {
        component: 'ListeVisiteurs',
        requiresAuth: true,
        props: ['onBack', 'onNavigate', 'canEdit']
    },
    'liste-rendezvous': {
        component: 'ListeRendezVous',
        requiresAuth: true,
        props: ['onBack', 'onNavigate', 'canEdit']
    },
    'rapports': {
        component: 'KibanaEmbed',
        requiresAuth: true,
        props: ['onBack', 'onNavigate']
    }
};