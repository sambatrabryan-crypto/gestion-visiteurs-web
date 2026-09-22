// src/utils/rolePermissions.js

// ==================== CONSTANTES DES RÔLES ====================

export const USER_ROLES = {
    ADMIN: 'admin',
    UTILISATEUR: 'user', // Utilisateur « employé »
    ACCUEIL: 'acceuil',  // Réception
    KIOSQUE: 'kiosque'
};

// ==================== FONCTIONS D'UTILITÉ ====================

/**
 * Normalise le rôle de l'utilisateur
 */
export const getNormalizedUserRole = (user) => {
    if (!user || !user.role) return USER_ROLES.UTILISATEUR;

    const role = user.role.toLowerCase();

    // Nettoyage des "anciens" rôles si présents
    if (role === 'superviseur' || role === 'mobile' || role === 'utilisateur') {
        return USER_ROLES.UTILISATEUR;
    }
    return Object.values(USER_ROLES).includes(role)
        ? role
        : USER_ROLES.UTILISATEUR;
};

/**
 * Vérifie si une vue est autorisée pour un rôle donné
 */
export const isViewAllowed = (view, userRole) => {
    const allowedViewsByRole = {
        // ADMIN : Accès total + nouvelles interfaces admin
        [USER_ROLES.ADMIN]: [
            'accueil', 'formulaire', 'rendezvous', 'liste-visiteurs',
            'liste-rendezvous', 'modifier-rendezvous', 'modifier-visiteur',
            'crud-departements', 'crud-employes', 'statistiques', 'rapports',
            'gestion-ciblages', 'gestion-types-service', 'gestion-utilisateurs'
        ],
        // ACCUEIL : Visiteurs + Rendez-vous (ÉTENDU) - PAS DE RAPPORTS
        [USER_ROLES.ACCUEIL]: [
            'accueil',
            'formulaire',           // Nouveau visiteur
            'liste-visiteurs',      // Liste des visiteurs du jour
            'modifier-visiteur',    // Correction si erreur saisie
            'rendezvous',           // ✅ AJOUT : Nouveau rendez-vous
            'liste-rendezvous',     // ✅ AJOUT : Liste des rendez-vous
            'modifier-rendezvous'   // ✅ AJOUT : Modifier rendez-vous
        ],
        // KIOSQUE : Uniquement Ajout RDV
        [USER_ROLES.KIOSQUE]: [
            'rendezvous'
        ],
        // UTILISATEUR (Mobile) : Rapports sur le web uniquement
        [USER_ROLES.UTILISATEUR]: [
            'rapports'
        ]
    };
    const allowedViews = allowedViewsByRole[userRole] || [];
    return allowedViews.includes(view);
};

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (user, role) => {
    const userRole = getNormalizedUserRole(user);
    return userRole === role;
};

/**
 * Vérifie si l'utilisateur a au moins un des rôles spécifiés
 */
export const hasAnyRole = (user, roles) => {
    const userRole = getNormalizedUserRole(user);
    return roles.includes(userRole);
};

/**
 * Vérifie si l'utilisateur peut éditer
 */
export const canEdit = (user) => {
    const userRole = getNormalizedUserRole(user);
    return userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.ACCUEIL;
};

// ==================== PERMISSIONS SPÉCIFIQUES ====================

export const Permissions = {
    // Gestion des visiteurs (Accueil + Admin)
    canCreateVisitor: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.ACCUEIL]),
    canEditVisitor: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.ACCUEIL]),
    canViewVisitors: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.ACCUEIL]),

    // ✅ Gestion des rendez-vous (Accueil + Kiosque + Admin)
    canCreateRendezVous: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.KIOSQUE, USER_ROLES.ACCUEIL]),
    canEditRendezVous: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.ACCUEIL]),  // ✅ AJOUT acceuil
    canViewRendezVous: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.ACCUEIL]),  // ✅ AJOUT acceuil

    // Administration
    canManageDepartments: (user) => hasRole(user, USER_ROLES.ADMIN),
    canManageEmployees: (user) => hasRole(user, USER_ROLES.ADMIN),
    canViewStatistics: (user) => hasRole(user, USER_ROLES.ADMIN),

    // NOUVELLES PERMISSIONS ADMIN UNIQUEMENT
    canManageCiblages: (user) => hasRole(user, USER_ROLES.ADMIN),
    canManageTypesService: (user) => hasRole(user, USER_ROLES.ADMIN),
    canManageUtilisateurs: (user) => hasRole(user, USER_ROLES.ADMIN),

    // RAPPORTS : Admin ET User SEULEMENT (ACCUEIL EXCLU)
    canViewReports: (user) => hasAnyRole(user, [USER_ROLES.ADMIN, USER_ROLES.UTILISATEUR]),

    // Navigation Web
    canAccessWeb: (user) => true,

    // Mode Kiosque unique
    isKioskMode: (user) => hasRole(user, USER_ROLES.KIOSQUE)
};

// ==================== CONFIGURATION DES MENUS ====================

export const getMenuItems = (currentView, userRole) => {
    // 1. KIOSQUE : Menu ultra-minimal
    if (userRole === USER_ROLES.KIOSQUE) {
        return [
            {
                id: 'deconnexion',
                title: 'Quitter le mode borne',
                icon: 'deconnexion',
                action: true,
                special: true
            }
        ];
    }

    // 2. UTILISATEUR (Mobile) : Seulement Rapports
    if (userRole === USER_ROLES.UTILISATEUR) {
        return [
            {
                id: 'rapports',
                title: 'Rapports',
                icon: 'rapports',
                active: currentView === 'rapports'
            },
            { type: 'separator' },
            {
                id: 'deconnexion',
                title: 'Se Déconnecter',
                icon: 'deconnexion',
                action: true,
                special: true
            }
        ];
    }

    // 3. ACCUEIL (Réception) : Visiteurs + Rendez-vous - PAS DE RAPPORTS
    if (userRole === USER_ROLES.ACCUEIL) {
        return [
            {
                id: 'accueil',
                title: 'Accueil',
                icon: 'accueil',
                active: currentView === 'accueil'
            },
            { type: 'separator' },
            {
                id: 'formulaire',
                title: 'Nouveau Visiteur',
                icon: 'formulaire',
                active: currentView === 'formulaire'
            },
            {
                id: 'liste-visiteurs',
                title: 'Liste des Visiteurs',
                icon: 'liste',
                active: currentView === 'liste-visiteurs'
            },
            { type: 'separator' },
            // ✅ AJOUT : Menu Rendez-vous pour ACCUEIL
            {
                id: 'rendezvous',
                title: 'Nouveau Rendez-vous',
                icon: 'rendezvous',
                active: currentView === 'rendezvous'
            },
            {
                id: 'liste-rendezvous',
                title: 'Liste des Rendez-vous',
                icon: 'liste',
                active: currentView === 'liste-rendezvous'
            },
            { type: 'separator' },
            {
                id: 'deconnexion',
                title: 'Se Déconnecter',
                icon: 'deconnexion',
                action: true,
                special: true
            }
        ];
    }

    // 4. ADMIN : menu complet avec nouvelles interfaces
    const menuItems = [
        {
            id: 'accueil',
            title: 'Accueil',
            icon: 'accueil',
            active: currentView === 'accueil'
        },
        {
            id: 'formulaire',
            title: 'Nouveau Visiteur',
            icon: 'formulaire',
            active: currentView === 'formulaire'
        },
        {
            id: 'rendezvous',
            title: 'Nouveau Rendez-vous',
            icon: 'rendezvous',
            active: currentView === 'rendezvous'
        },
        { type: 'separator' },
        {
            id: 'liste-visiteurs',
            title: 'Liste des Visiteurs',
            icon: 'liste',
            active: currentView === 'liste-visiteurs'
        },
        {
            id: 'liste-rendezvous',
            title: 'Liste des Rendez-vous',
            icon: 'liste',
            active: currentView === 'liste-rendezvous'
        },
        { type: 'separator' },
        // NOUVELLES INTERFACES ADMIN
        {
            id: 'gestion-ciblages',
            title: 'Ciblages Département',
            icon: 'target',
            active: currentView === 'gestion-ciblages'
        },
        {
            id: 'gestion-types-service',
            title: 'Types de Service',
            icon: 'services',
            active: currentView === 'gestion-types-service'
        },
        {
            id: 'gestion-utilisateurs',
            title: 'Utilisateurs',
            icon: 'users',
            active: currentView === 'gestion-utilisateurs'
        },
        { type: 'separator' },
        {
            id: 'statistiques',
            title: 'Tableaux de Bord',
            icon: 'dashboard',
            active: currentView === 'statistiques'
        },
        {
            id: 'rapports',
            title: 'Rapports Internes',
            icon: 'rapports',
            active: currentView === 'rapports'
        },
        { type: 'separator' },
        {
            id: 'crud-departements',
            title: 'Départements',
            icon: 'departements',
            active: currentView === 'crud-departements'
        },
        {
            id: 'crud-employes',
            title: 'Employés',
            icon: 'employes',
            active: currentView === 'crud-employes'
        },
        { type: 'separator' },
        {
            id: 'deconnexion',
            title: 'Se Déconnecter',
            icon: 'deconnexion',
            action: true,
            special: true
        }
    ];
    return menuItems;
};

// ==================== TITRES ET SOUS-TITRES ====================

export const getPageTitle = (currentView) => {
    const titles = {
        'accueil': 'Tableau de Bord',
        'formulaire': 'Portail Visiteurs',
        'rendezvous': 'Gestion des Rendez-vous',
        'liste-visiteurs': 'Liste des Visiteurs',
        'liste-rendezvous': 'Rendez-vous à Venir',
        'crud-departements': 'Gestion des Départements',
        'crud-employes': 'Gestion des Employés',
        'modifier-rendezvous': 'Modifier Rendez-vous',
        'modifier-visiteur': 'Modifier Visiteur',
        'statistiques': 'Tableaux de Bord Kibana',
        'rapports': 'Rapports Internes',
        'gestion-ciblages': 'Gestion des Ciblages',
        'gestion-types-service': 'Types de Service',
        'gestion-utilisateurs': 'Gestion des Utilisateurs'
    };
    return titles[currentView] || 'Tableau de Bord';
};

export const getPageSubtitle = (currentView) => {
    const subtitles = {
        'accueil': 'Système intelligent de gestion des accès',
        'formulaire': 'Enregistrement d\'un nouveau visiteur',
        'rendezvous': 'Planification et suivi des visites programmées',
        'liste-visiteurs': 'Consultation et gestion des visiteurs',
        'liste-rendezvous': 'Prochaines visites programmées',
        'crud-departements': 'Gestion des départements de l\'entreprise',
        'crud-employes': 'Gestion du personnel de l\'entreprise',
        'modifier-rendezvous': 'Mise à jour des informations du rendez-vous',
        'modifier-visiteur': 'Mise à jour des informations du visiteur',
        'statistiques': 'Analytique en temps réel avec Kibana',
        'rapports': 'Rapports détaillés des visiteurs et rendez-vous',
        'gestion-ciblages': 'Associez départements, visites et services',
        'gestion-types-service': 'Configurez les services disponibles',
        'gestion-utilisateurs': 'Gérez les accès et permissions'
    };
    return subtitles[currentView] || 'Système intelligent de gestion des accès';
};

// ==================== VALIDATION DE NAVIGATION ====================

/**
 * Valide la navigation vers une vue spécifique
 */
export const validateNavigation = (view, user) => {
    const userRole = getNormalizedUserRole(user);

    // User (mobile) : accès aux rapports seul sur web
    if (userRole === USER_ROLES.UTILISATEUR && view !== 'rapports') {
        return {
            allowed: false,
            redirect: 'rapports',
            message: 'Redirection vers la page Rapports.'
        };
    }

    // ✅ ACCUEIL : accès visiteurs + rendez-vous - PAS DE RAPPORTS NI ADMIN
    if (userRole === USER_ROLES.ACCUEIL) {
        const accueilViews = [
            'formulaire',
            'liste-visiteurs',
            'modifier-visiteur',
            'accueil',
            'rendezvous',           // ✅ AJOUT
            'liste-rendezvous',     // ✅ AJOUT
            'modifier-rendezvous'   // ✅ AJOUT
        ];

        if (!accueilViews.includes(view)) {
            return {
                allowed: false,
                redirect: 'liste-visiteurs',
                message: 'Redirection : Accueil peut accéder aux visiteurs et rendez-vous uniquement.'
            };
        }
    }

    // Kiosque : seulement rendezvous
    if (userRole === USER_ROLES.KIOSQUE && view !== 'rendezvous') {
        return {
            allowed: false,
            message: 'Navigation bloquée : Mode Borne Kiosque actif.'
        };
    }

    // ✅ VÉRIFICATION DES INTERFACES ADMIN UNIQUEMENT (modifier-rendezvous retiré)
    const adminOnlyViews = [
        'gestion-ciblages',
        'gestion-types-service',
        'gestion-utilisateurs',
        'crud-departements',
        'crud-employes',
        'statistiques'
    ];

    if (adminOnlyViews.includes(view) && userRole !== USER_ROLES.ADMIN) {
        return {
            allowed: false,
            message: "Accès réservé aux administrateurs"
        };
    }

    // Vérification standard
    if (!isViewAllowed(view, userRole)) {
        return {
            allowed: false,
            message: `Accès non autorisé à cette fonctionnalité.`
        };
    }

    return { allowed: true };
};

// ==================== EXPORT PAR DÉFAUT ====================

const rolePermissions = {
    USER_ROLES,
    getNormalizedUserRole,
    isViewAllowed,
    hasRole,
    hasAnyRole,
    canEdit,
    Permissions,
    getMenuItems,
    getPageTitle,
    getPageSubtitle,
    validateNavigation
};

export default rolePermissions;