import React, { useState, useEffect, useCallback } from "react";

function Rapport({ apiCall, showAlert }) {
    const [visiteurs, setVisiteurs] = useState([]);
    const [rendezvous, setRendezVous] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [itemType, setItemType] = useState(null);
    const [activeTab, setActiveTab] = useState("visiteurs");
    const [searchTerm, setSearchTerm] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [userDepartment, setUserDepartment] = useState(null);

    // 🔥 ÉTAT UNIFIÉ POUR LA DATE - CORRIGÉ POUR LE DÉCALAGE HORAIRE
    const [dateFilter, setDateFilter] = useState({
        selectedDate: new Date().toLocaleDateString('fr-CA'), // Format YYYY-MM-DD
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        mode: 'specific'
    });

    // 🔥 ICÔNES SVG MODERNES
    const Icons = {
        visiteurs: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
        ),
        rendezvous: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        calendar: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        search: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        filter: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
        ),
        department: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        ),
        close: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        chevronLeft: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        ),
        chevronRight: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        ),
        today: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        allDates: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        firebase: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.89 15.673L6.255.461A.542.542 0 017.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z" />
            </svg>
        )
    };

    // 🔥 FONCTION CORRIGÉE POUR FORMATER LES DATES SANS DÉCALAGE
    const formatDisplayDate = (dateString) => {
        if (!dateString) return 'Toutes les dates';
        try {
            // Utiliser toLocaleDateString avec le fuseau horaire local
            const date = new Date(dateString + 'T00:00:00'); // Ajouter l'heure pour éviter le décalage
            return date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    // 🔥 FONCTION POUR OBTENIR LA DATE AU FORMAT YYYY-MM-DD SANS DÉCALAGE
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 🔥 CHARGEMENT DES DONNÉES
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiCall("/events");

            const data = response?.data || response || {};
            const visiteursArray = Array.isArray(data.visiteurs) ? data.visiteurs : [];
            const rendezvousArray = Array.isArray(data.rendezvous) ? data.rendezvous : [];

            setVisiteurs(visiteursArray);
            setRendezVous(rendezvousArray);
            setIsFiltered(response?.filtered || false);
            setUserDepartment(response?.department || null);

        } catch (error) {
            console.error("❌ Erreur chargement des données:", error);
            showAlert("Erreur lors du chargement des rapports", "error");
        } finally {
            setLoading(false);
        }
    }, [apiCall, showAlert]);

    // 🔥 EFFET PRINCIPAL AVEC FIREBASE INTÉGRÉ
    useEffect(() => {
        // Chargement initial
        fetchData();

        // 🔥 ÉCOUTE FIREBASE POUR LES MISES À JOUR EN TEMPS RÉEL
        const setupFirebaseListener = async () => {
            try {
                const { onMessageListener } = await import('../firebase');

                onMessageListener().then(payload => {
                    const type = payload.data?.type;
                    console.log('📊 Rapport - Notification Firebase:', type);

                    // Recharger pour tous les types d'événements pertinents
                    if (['new_visitor', 'visitor_updated', 'status_changed',
                        'new_rendezvous', 'rendezvous_updated', 'visitor_deleted'].includes(type)) {

                        fetchData(); // Actualisation automatique des données

                        // Feedback utilisateur
                        switch (type) {
                            case 'new_visitor':
                                showAlert('🔄 Nouveau visiteur - mise à jour automatique', 'info');
                                break;
                            case 'visitor_updated':
                                showAlert('🔄 Visiteur modifié - mise à jour automatique', 'info');
                                break;
                            case 'new_rendezvous':
                                showAlert('🔄 Nouveau rendez-vous - mise à jour automatique', 'info');
                                break;
                            case 'status_changed':
                                showAlert('🔄 Statut modifié - mise à jour automatique', 'info');
                                break;
                            default:
                                console.log('📊 Rapport mis à jour via Firebase');
                        }
                    }
                }).catch(error => {
                    console.warn('⚠️ Erreur Firebase listener dans Rapport:', error);
                });
            } catch (error) {
                console.warn('⚠️ Firebase non disponible pour Rapport:', error);
            }
        };

        setupFirebaseListener();

        // Intervalle de secours (toutes les 30 secondes)
        const interval = setInterval(() => {
            fetchData();
        }, 30000);

        // Nettoyage
        return () => {
            clearInterval(interval);
        };
    }, [fetchData, showAlert]);

    // 🔥 FILTRAGE CORRIGÉ POUR LES DATES
    const filterByDate = useCallback((items, dateField) => {
        // Si mode "all", on retourne tous les éléments
        if (dateFilter.mode === 'all') {
            return items;
        }

        // Si mode "specific", on filtre par la date sélectionnée
        if (!dateFilter.selectedDate) return items;

        return items.filter(item => {
            if (!item[dateField]) return false;

            // Convertir la date de l'item en format local YYYY-MM-DD
            const itemDate = new Date(item[dateField]);
            const itemDateString = getLocalDateString(itemDate);

            return itemDateString === dateFilter.selectedDate;
        });
    }, [dateFilter]);

    // 🔥 FILTRAGE PAR RECHERCHE
    const filterBySearch = useCallback((items) => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            const nomComplet = `${item.prenom_visiteur || ''} ${item.nom_visiteur || ''}`.toLowerCase();
            const organisation = (item.nom_organisation || '').toLowerCase();
            const email = (item.email || '').toLowerCase();
            return nomComplet.includes(term) || organisation.includes(term) || email.includes(term);
        });
    }, [searchTerm]);

    // 🔥 DONNÉES FILTRÉES COHÉRENTES
    const filteredVisiteurs = filterBySearch(filterByDate(visiteurs, 'date_visite'));
    const filteredRendezvous = filterBySearch(filterByDate(rendezvous, 'date_rendezvous'));

    // 🔥 GÉNÉRATION DU CALENDRIER
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const generateCalendar = () => {
        const daysInMonth = getDaysInMonth(dateFilter.currentMonth, dateFilter.currentYear);
        const firstDay = getFirstDayOfMonth(dateFilter.currentMonth, dateFilter.currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    // 🔥 GESTION DES DATES CORRIGÉE
    const handleDateClick = (day) => {
        if (!day) return;

        // Créer la date en format local sans décalage horaire
        const selectedDate = new Date(dateFilter.currentYear, dateFilter.currentMonth, day);
        const dateString = getLocalDateString(selectedDate);

        setDateFilter(prev => ({
            ...prev,
            selectedDate: dateString,
            mode: 'specific'
        }));
        setShowCalendar(false);
    };

    const handlePrevMonth = () => {
        setDateFilter(prev => {
            if (prev.currentMonth === 0) {
                return {
                    ...prev,
                    currentMonth: 11,
                    currentYear: prev.currentYear - 1
                };
            } else {
                return {
                    ...prev,
                    currentMonth: prev.currentMonth - 1
                };
            }
        });
    };

    const handleNextMonth = () => {
        setDateFilter(prev => {
            if (prev.currentMonth === 11) {
                return {
                    ...prev,
                    currentMonth: 0,
                    currentYear: prev.currentYear + 1
                };
            } else {
                return {
                    ...prev,
                    currentMonth: prev.currentMonth + 1
                };
            }
        });
    };

    const handleTodayClick = () => {
        const today = new Date();
        const todayString = getLocalDateString(today);

        setDateFilter({
            selectedDate: todayString,
            currentMonth: today.getMonth(),
            currentYear: today.getFullYear(),
            mode: 'specific'
        });
        setShowCalendar(false);
    };

    const handleAllDatesClick = () => {
        setDateFilter(prev => ({
            ...prev,
            mode: 'all'
        }));
        setShowCalendar(false);
    };

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    // 🔥 FONCTION POUR VÉRIFIER SI UN JOUR EST SÉLECTIONNÉ (CORRIGÉE)
    const isDateSelected = (day) => {
        if (!day || dateFilter.mode !== 'specific') return false;

        const currentDate = new Date(dateFilter.currentYear, dateFilter.currentMonth, day);
        const currentDateString = getLocalDateString(currentDate);

        return currentDateString === dateFilter.selectedDate;
    };

    // 🔥 FONCTION POUR VÉRIFIER SI C'EST AUJOURD'HUI (CORRIGÉE)
    const isToday = (day) => {
        if (!day) return false;

        const today = new Date();
        const currentDate = new Date(dateFilter.currentYear, dateFilter.currentMonth, day);

        return currentDate.getDate() === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    // 🔥 AFFICHER LES DÉTAILS
    const handleViewDetails = (item, type) => {
        setSelectedItem(item);
        setItemType(type);
        setShowDetailModal(true);
    };

    // 🔥 BADGE STATUT
    const getStatusBadge = (idStatus) => {
        const statusMap = {
            1: { label: "Nouveau", color: "bg-orange-100 text-orange-800 border border-orange-200" },
            2: { label: "En attente", color: "bg-blue-100 text-blue-800 border border-blue-200" },
            3: { label: "En cours", color: "bg-green-100 text-green-800 border border-green-200" },
            4: { label: "Terminé", color: "bg-gray-100 text-gray-800 border border-gray-200" }
        };
        const status = statusMap[idStatus] || { label: "Inconnu", color: "bg-gray-100 text-gray-800 border border-gray-200" };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                {status.label}
            </span>
        );
    };

    // 🔥 FONCTION POUR FORMATER LES DATES D'AFFICHAGE DANS LES CARTES
    const formatCardDate = (dateString) => {
        if (!dateString) return 'Date non disponible';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // 🔥 RAFRAÎCHISSEMENT MANUEL
    const handleRefresh = () => {
        fetchData();
        showAlert("📊 Rapport actualisé", "success");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Chargement des rapports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* 🔥 HEADER AVEC INDICATEUR DE FILTRAGE ET FIREBASE */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-2xl">
                            <div className="text-center font-bold">
                                <div className="flex justify-center">
                                    {activeTab === "visiteurs" ? Icons.visiteurs : Icons.rendezvous}
                                </div>
                                <div className="text-sm mt-1">RAPPORT</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    Rapport d'Activité
                                </h1>
                                {/* 🔥 INDICATEUR FIREBASE ACTIF */}
                                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                                    {Icons.firebase}
                                    <span>En temps réel</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-1 text-sm lg:text-base">
                                Consultation des visiteurs et rendez-vous •
                                {dateFilter.mode === 'all' ? ' Toutes les dates' : ` ${formatDisplayDate(dateFilter.selectedDate)}`}
                            </p>

                            {isFiltered && userDepartment && (
                                <div className="mt-2 inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                                    {Icons.department}
                                    <span>Vue départementale : {userDepartment}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 🔥 BOUTON RAFRAÎCHISSEMENT */}
                    <button
                        onClick={handleRefresh}
                        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Actualiser</span>
                    </button>
                </div>

                {/* 🔥 FILTRES ET RECHERCHE */}
                <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Recherche */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {Icons.search}
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher par nom, organisation, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-gray-50"
                            />
                        </div>

                        {/* Sélecteur de date unifié */}
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {Icons.calendar}
                            </div>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-left focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all hover:bg-gray-50 bg-gray-50"
                            >
                                {dateFilter.mode === 'all' ? 'Toutes les dates' : formatDisplayDate(dateFilter.selectedDate)}
                            </button>

                            {/* Calendrier déroulant amélioré */}
                            {showCalendar && (
                                <div className="absolute z-10 mt-2 bg-white rounded-2xl shadow-2xl p-4 w-full border-2 border-gray-200">
                                    {/* En-tête du calendrier */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                                        >
                                            {Icons.chevronLeft}
                                        </button>
                                        <div className="text-center font-bold text-gray-800">
                                            {monthNames[dateFilter.currentMonth]} {dateFilter.currentYear}
                                        </div>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                                        >
                                            {Icons.chevronRight}
                                        </button>
                                    </div>

                                    {/* Jours de la semaine */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {dayNames.map(day => (
                                            <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grille des jours CORRIGÉE */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {generateCalendar().map((day, index) => {
                                            const selected = isDateSelected(day);
                                            const today = isToday(day);

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDateClick(day)}
                                                    disabled={!day}
                                                    className={`p-2 text-center rounded-lg transition-all text-sm font-medium ${day
                                                        ? selected
                                                            ? "bg-orange-600 text-white font-bold shadow-lg"
                                                            : today
                                                                ? "bg-orange-100 text-orange-600 border border-orange-300"
                                                                : "hover:bg-orange-100 text-gray-800 hover:text-orange-600"
                                                        : "cursor-not-allowed"
                                                        }`}
                                                >
                                                    {day || ""}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Actions rapides */}
                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleTodayClick}
                                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold text-sm"
                                        >
                                            {Icons.today}
                                            <span>Aujourd'hui</span>
                                        </button>
                                        <button
                                            onClick={handleAllDatesClick}
                                            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all font-semibold text-sm ${dateFilter.mode === 'all'
                                                ? "bg-green-600 text-white"
                                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                }`}
                                        >
                                            {Icons.allDates}
                                            <span>Toutes dates</span>
                                        </button>
                                    </div>

                                    <div className="mt-3">
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🔥 INDICATEUR DE FILTRAGE */}
                <div className="mb-6">
                    {dateFilter.mode === 'all' ? (
                        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200">
                            {Icons.allDates}
                            <span>Affichage de toutes les dates</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold border border-orange-200">
                            {Icons.calendar}
                            <span>Filtré par date spécifique</span>
                            <span className="font-bold">({dateFilter.selectedDate})</span>
                        </div>
                    )}
                </div>

                {/* 🔥 ONGLETS */}
                <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 inline-flex">
                    <button
                        onClick={() => setActiveTab("visiteurs")}
                        className={`flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "visiteurs"
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {Icons.visiteurs}
                        <span>Visiteurs ({filteredVisiteurs.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("rendezvous")}
                        className={`flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "rendezvous"
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                            : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {Icons.rendezvous}
                        <span>Rendez-vous ({filteredRendezvous.length})</span>
                    </button>
                </div>

                {/* 🔥 CARTES MODERNES AVEC DATES CORRIGÉES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === "visiteurs" ? (
                        filteredVisiteurs.length > 0 ? (
                            filteredVisiteurs.map(visiteur => (
                                <div
                                    key={visiteur.id_visiteur}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-orange-300 hover:scale-[1.02]"
                                >
                                    {/* En-tête avec avatar et statut */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {visiteur.prenom_visiteur?.[0]}{visiteur.nom_visiteur?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                                    {visiteur.prenom_visiteur} {visiteur.nom_visiteur}
                                                </h3>
                                                <p className="text-sm text-gray-600">{visiteur.nom_organisation}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(visiteur.id_status)}
                                    </div>

                                    {/* Informations */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>{visiteur.email || 'Email non renseigné'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{visiteur.telephone || 'Téléphone non renseigné'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatCardDate(visiteur.date_visite)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewDetails(visiteur, 'visiteur')}
                                        className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                                    >
                                        Voir les détails
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-lg font-semibold">
                                    {dateFilter.mode === 'all'
                                        ? 'Aucun visiteur trouvé'
                                        : 'Aucun visiteur trouvé pour cette date'
                                    }
                                </p>
                                <p className="text-gray-500 mt-2">
                                    {searchTerm
                                        ? `Aucun résultat pour "${searchTerm}"`
                                        : 'Essayez de modifier vos critères de recherche'
                                    }
                                </p>
                            </div>
                        )
                    ) : (
                        filteredRendezvous.length > 0 ? (
                            filteredRendezvous.map(rdv => (
                                <div
                                    key={rdv.id_rendezvous}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-gray-100 hover:border-blue-300 hover:scale-[1.02]"
                                >
                                    {/* En-tête avec avatar et statut */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {rdv.prenom_visiteur?.[0]}{rdv.nom_visiteur?.[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {rdv.prenom_visiteur} {rdv.nom_visiteur}
                                                </h3>
                                                <p className="text-sm text-gray-600">{rdv.nom_organisation}</p>
                                            </div>
                                        </div>
                                        {getStatusBadge(rdv.id_status)}
                                    </div>

                                    {/* Informations spécifiques RDV */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="font-medium">Motif:</span>
                                            <span>{rdv.motif || 'Non spécifié'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="font-medium">Durée:</span>
                                            <span>{rdv.duree_estimee || 60} minutes</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatCardDate(rdv.date_rendezvous)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleViewDetails(rdv, 'rendezvous')}
                                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                                    >
                                        Voir les détails
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 text-lg font-semibold">
                                    {dateFilter.mode === 'all'
                                        ? 'Aucun rendez-vous trouvé'
                                        : 'Aucun rendez-vous trouvé pour cette date'
                                    }
                                </p>
                                <p className="text-gray-500 mt-2">
                                    {searchTerm
                                        ? `Aucun résultat pour "${searchTerm}"`
                                        : 'Essayez de modifier vos critères de recherche'
                                    }
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* 🔥 MODAL DÉTAILS AVEC DATES CORRIGÉES */}
            {showDetailModal && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Détails {itemType === 'visiteur' ? 'du Visiteur' : 'du Rendez-vous'}
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    {Icons.close}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Prénom</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.prenom_visiteur}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Nom</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.nom_visiteur}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Email</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Téléphone</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.telephone || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Organisation</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.nom_organisation}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Type</p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.type_organisation}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">Statut</p>
                                    <div className="p-2">
                                        {getStatusBadge(selectedItem.id_status)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-semibold">
                                        {itemType === 'visiteur' ? 'Date de visite' : 'Date du RDV'}
                                    </p>
                                    <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">
                                        {formatCardDate(itemType === 'visiteur' ? selectedItem.date_visite : selectedItem.date_rendezvous)}
                                    </p>
                                </div>
                                {itemType === 'rendezvous' && (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">Motif</p>
                                            <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.motif || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">Durée estimée</p>
                                            <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.duree_estimee || 60} minutes</p>
                                        </div>
                                    </>
                                )}
                                {selectedItem.ciblage_utilise && (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">Type de visite</p>
                                            <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.ciblage_utilise.type_visite?.libelle_type || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">Service</p>
                                            <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.ciblage_utilise.type_service?.libelle_type_service || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-gray-600 font-semibold">Département</p>
                                            <p className="text-gray-800 p-2 bg-gray-50 rounded-lg">{selectedItem.ciblage_utilise.departement?.nom_departement || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all hover:scale-105 active:scale-95"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rapport;