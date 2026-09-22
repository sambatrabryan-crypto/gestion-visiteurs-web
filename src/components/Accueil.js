import { useState, useEffect } from 'react';

function Accueil({ onNavigate, user }) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Logique de rôle
    const isAdmin = user && user.role === 'admin';
    const isUtilisateur = user && user.role === 'utilisateur';
    const isAccueil = user && user.role === 'acceuil';
    const isKiosque = user && user.role === 'kiosque';

    const userRoleLabel = isAdmin
        ? 'Administrateur'
        : isUtilisateur
            ? 'Utilisateur'
            : isAccueil
                ? "Agent d'accueil"
                : isKiosque
                    ? 'Kiosque'
                    : 'Invité';

    // Effet pour suivre la position de la souris pour les effets de parallaxe
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // CSS intégré avec thème orange-rouge-blanc amélioré
    const styles = `
        @keyframes slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        .animate-slide-in {
            animation: slide-in 0.3s ease-out;
        }
        @keyframes fade-in {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out;
        }
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 0 5px rgba(249, 115, 22, 0.3);
            }
            50% {
                box-shadow: 0 0 25px rgba(249, 115, 22, 0.8);
            }
        }
        .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes bounce-subtle {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-8px);
            }
        }
        .animate-bounce-subtle {
            animation: bounce-subtle 3s ease-in-out infinite;
        }
        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-15px);
            }
        }
        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }
            100% {
                background-position: 1000px 0;
            }
        }
        .glass-effect {
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            background: rgba(255, 255, 255, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .glass-effect-dark {
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hover-lift {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover-lift:hover {
            transform: translateY(-12px) scale(1.02);
            box-shadow: 0 35px 60px rgba(0,0,0,0.15);
        }
        .btn-ripple {
            position: relative;
            overflow: hidden;
            transform: translate3d(0, 0, 0);
        }
        .btn-ripple:after {
            content: "";
            display: block;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
            background-repeat: no-repeat;
            background-position: 50%;
            transform: scale(10, 10);
            opacity: 0;
            transition: transform .5s, opacity 1s;
        }
        .btn-ripple:active:after {
            transform: scale(0, 0);
            opacity: .2;
            transition: 0s;
        }
        .hover-shine {
            position: relative;
            overflow: hidden;
        }
        .hover-shine:before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.6),
                transparent
            );
            transition: left 0.8s;
        }
        .hover-shine:hover:before {
            left: 100%;
        }
        .module-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .module-hover:hover {
            transform: translateY(-8px) rotate(2deg) scale(1.05);
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }
        .pulse-on-hover:hover {
            animation: pulse-glow 1s ease-in-out infinite;
        }
        .glow-on-hover:hover {
            animation: glow 1.5s ease-in-out infinite;
        }
        .float-on-hover:hover {
            animation: float 2s ease-in-out infinite;
        }
        .border-glow {
            box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
            transition: all 0.3s ease;
        }
        .border-glow:hover {
            box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.6),
                        0 0 30px rgba(249, 115, 22, 0.4);
        }
        .text-glow {
            text-shadow: 0 0 15px currentColor;
        }
        .gradient-text {
            background: linear-gradient(135deg, #f97316, #dc2626, #fb923c, #ea580c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
        }
        @keyframes gradientShift {
            0% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
            100% {
                background-position: 0% 50%;
            }
        }
        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 5px currentColor;
            }
            50% {
                box-shadow: 0 0 25px currentColor;
            }
        }
        @keyframes morph {
            0%, 100% {
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            50% {
                border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }
        }
        .morph-animation {
            animation: morph 8s ease-in-out infinite;
        }
        .parallax-bg {
            transform: translate(calc(var(--mouse-x) * -0.02px), calc(var(--mouse-y) * -0.02px));
        }
        .parallax-content {
            transform: translate(calc(var(--mouse-x) * 0.01px), calc(var(--mouse-y) * 0.01px));
        }

        /* Couleurs spécifiques pour le thème orange-rouge */
        .module-orange-light { 
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.1)); 
            border: 2px solid rgba(249, 115, 22, 0.25); 
        }
        .module-orange-light:hover { 
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2)); 
        }
        .module-orange-dark { 
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(251, 146, 60, 0.15)); 
            border: 2px solid rgba(249, 115, 22, 0.4); 
        }
        .module-orange-dark:hover { 
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.25), rgba(251, 146, 60, 0.25)); 
        }

        .module-red-light { 
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(248, 113, 113, 0.1)); 
            border: 2px solid rgba(220, 38, 38, 0.25); 
        }
        .module-red-light:hover { 
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(248, 113, 113, 0.2)); 
        }
        .module-red-dark { 
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(248, 113, 113, 0.15)); 
            border: 2px solid rgba(220, 38, 38, 0.4); 
        }
        .module-red-dark:hover { 
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(248, 113, 113, 0.25)); 
        }

        .module-amber-light { 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.1)); 
            border: 2px solid rgba(245, 158, 11, 0.25); 
        }
        .module-amber-light:hover { 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2)); 
        }
        .module-amber-dark { 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15)); 
            border: 2px solid rgba(245, 158, 11, 0.4); 
        }
        .module-amber-dark:hover { 
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(251, 191, 36, 0.25)); 
        }

        .module-indigo-light { 
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.1)); 
            border: 2px solid rgba(99, 102, 241, 0.25); 
        }
        .module-indigo-light:hover { 
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.2)); 
        }
        .module-indigo-dark { 
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(129, 140, 248, 0.15)); 
            border: 2px solid rgba(99, 102, 241, 0.4); 
        }
        .module-indigo-dark:hover { 
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(129, 140, 248, 0.25)); 
        }

        .module-cyan-light { 
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(34, 211, 238, 0.1)); 
            border: 2px solid rgba(6, 182, 212, 0.25); 
        }
        .module-cyan-light:hover { 
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(34, 211, 238, 0.2)); 
        }
        .module-cyan-dark { 
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(34, 211, 238, 0.15)); 
            border: 2px solid rgba(6, 182, 212, 0.4); 
        }
        .module-cyan-dark:hover { 
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(34, 211, 238, 0.25)); 
        }

        .text-orange-light { color: #f97316; }
        .text-orange-dark { color: #fb923c; }
        .text-red-light { color: #dc2626; }
        .text-red-dark { color: #ef4444; }
        .text-amber-light { color: #d97706; }
        .text-amber-dark { color: #f59e0b; }
        .text-indigo-light { color: #6366f1; }
        .text-indigo-dark { color: #818cf8; }
        .text-cyan-light { color: #06b6d4; }
        .text-cyan-dark { color: #22d3ee; }
        
        .floating-shapes {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 0;
        }
        .floating-shape {
            position: absolute;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
        }
        .shape-1 {
            width: 200px;
            height: 200px;
            background: linear-gradient(45deg, #f97316, #dc2626);
            top: 10%;
            left: 5%;
            animation-delay: 0s;
        }
        .shape-2 {
            width: 150px;
            height: 150px;
            background: linear-gradient(45deg, #dc2626, #f97316);
            top: 60%;
            right: 10%;
            animation-delay: 2s;
        }
        .shape-3 {
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #fb923c, #ea580c);
            bottom: 20%;
            left: 20%;
            animation-delay: 4s;
        }
    `;

    // Icônes SVG améliorées avec thème orange-rouge
    const Icons = {
        Visitor: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        NewVisitor: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
        Appointment: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        Department: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        Employee: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
        Report: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        Users: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        Target: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        Service: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        Statistics: () => (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
        ),
        Sun: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        Moon: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        )
    };

    // ✅ Configuration des modules dynamiques selon le rôle - AVEC STATISTIQUES
    let modules = [];

    // Modules pour Admin
    if (isAdmin) {
        modules = [
            { icon: <Icons.Visitor />, label: 'Liste des Visiteurs', navigate: 'liste-visiteurs', color: 'orange' },
            { icon: <Icons.Appointment />, label: 'Rendez-vous', navigate: 'liste-rendezvous', color: 'red' },
            { icon: <Icons.Department />, label: 'Départements', navigate: 'crud-departements', color: 'orange' },
            { icon: <Icons.Employee />, label: 'Employés', navigate: 'crud-employes', color: 'red' },
            { icon: <Icons.Users />, label: 'Utilisateurs', navigate: 'gestion-utilisateurs', color: 'indigo' },
            { icon: <Icons.Target />, label: 'Ciblages', navigate: 'gestion-ciblages', color: 'cyan' },
            { icon: <Icons.Service />, label: 'Types de Service', navigate: 'gestion-types-service', color: 'amber' },
            { icon: <Icons.Statistics />, label: 'Statistiques', navigate: 'statistiques', color: 'indigo' },
            { icon: <Icons.Report />, label: 'Rapports', navigate: 'rapports', color: 'orange' }
        ];
    }
    // Modules pour Utilisateur (employé mobile)
    else if (isUtilisateur) {
        modules = [
            { icon: <Icons.Visitor />, label: 'Liste des Visiteurs', navigate: 'liste-visiteurs', color: 'orange' },
            { icon: <Icons.Appointment />, label: 'Rendez-vous', navigate: 'liste-rendezvous', color: 'red' },
            { icon: <Icons.Report />, label: 'Mes Rapports', navigate: 'rapports', color: 'amber' }
        ];
    }
    // Modules pour Accueil et Kiosque
    else {
        modules = [
            { icon: <Icons.Visitor />, label: 'Liste des Visiteurs', navigate: 'liste-visiteurs', color: 'orange' },
            { icon: <Icons.Appointment />, label: 'Rendez-vous', navigate: 'liste-rendezvous', color: 'red' }
        ];
    }

    // Interface principale - affichée directement sans bannière
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white relative overflow-hidden"
            style={{
                '--mouse-x': mousePosition.x,
                '--mouse-y': mousePosition.y,
            }}
        >
            {/* Styles CSS intégrés */}
            <style>{styles}</style>

            {/* Formes flottantes de fond */}
            <div className="floating-shapes parallax-bg">
                <div className="floating-shape shape-1 morph-animation"></div>
                <div className="floating-shape shape-2 morph-animation"></div>
                <div className="floating-shape shape-3 morph-animation"></div>
            </div>

            <div className="container mx-auto px-6 py-8 relative z-10">
                {/* Actions principales avec thème orange-rouge */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Carte Nouveau Visiteur améliorée */}
                    <div
                        onClick={() => onNavigate('formulaire')}
                        onMouseEnter={() => setHoveredButton('visitor')}
                        onMouseLeave={() => setHoveredButton(null)}
                        className="btn-ripple hover-shine bg-white rounded-3xl border-2 border-orange-200 p-8 cursor-pointer transition-all duration-300 group hover-lift animate-fade-in border-glow glow-on-hover shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-125 animate-pulse-glow bg-gradient-to-r from-orange-500 to-orange-600 transform group-hover:rotate-12">
                                <Icons.NewVisitor />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black mb-3 text-gray-800">Nouveau Visiteur</h3>
                                <p className="text-orange-600 font-semibold text-lg">Enregistrez immédiatement un visiteur</p>
                                <div className="flex items-center text-base mt-3 text-green-600 font-semibold">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                                    Accès rapide - Formulaire simplifié
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>

                    {/* Carte Rendez-vous améliorée */}
                    <div
                        onClick={() => onNavigate('rendezvous')}
                        onMouseEnter={() => setHoveredButton('appointment')}
                        onMouseLeave={() => setHoveredButton(null)}
                        className="btn-ripple hover-shine bg-white rounded-3xl border-2 border-red-200 p-8 cursor-pointer transition-all duration-300 group hover-lift animate-fade-in border-glow glow-on-hover shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center space-x-8">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-125 bg-gradient-to-r from-red-500 to-red-600 transform group-hover:rotate-12">
                                <Icons.Appointment />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black mb-3 text-gray-800">Gestion des RDV</h3>
                                <p className="text-red-600 font-semibold text-lg">Planifiez et gérez les rendez-vous</p>
                                <div className="flex items-center text-base mt-3 text-red-600 font-semibold">
                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                                    Calendrier intégré - Rappels automatiques
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                    </div>
                </div>

                {/* ✅ Modules de gestion - AVEC STATISTIQUES */}
                <div className="bg-white rounded-3xl border-2 border-orange-200 p-10 transition-all duration-500 animate-fade-in hover-lift border-glow shadow-2xl mb-12">
                    <div className="flex items-center mb-8">
                        <div className="w-2 h-12 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-4"></div>
                        <h2 className="text-3xl font-black gradient-text">Modules de Gestion</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {modules.map((module, index) => (
                            <button
                                key={index}
                                onClick={() => onNavigate(module.navigate)}
                                onMouseEnter={() => setHoveredButton(module.navigate)}
                                onMouseLeave={() => setHoveredButton(null)}
                                className={`btn-ripple module-hover rounded-2xl p-6 text-center group transition-all duration-300 border-glow relative overflow-hidden ${isDarkMode
                                    ? `module-${module.color}-dark text-${module.color}-dark`
                                    : `module-${module.color}-light text-${module.color}-light`
                                    }`}
                            >
                                <div className={`flex justify-center mb-4 transition-all duration-300 group-hover:scale-125 transform group-hover:rotate-6`}>
                                    {module.icon}
                                </div>
                                <div className="text-base font-black text-gray-800 group-hover:text-gray-900 transition-all duration-500">
                                    {module.label}
                                </div>
                                <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-${module.color}-500 to-${module.color}-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Accueil;