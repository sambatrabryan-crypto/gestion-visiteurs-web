// components/ListeVisiteurs.js - VERSION AVEC ICÔNES SVG 3D
import React, { useState, useEffect, useRef, useCallback } from "react";

function ListeVisiteurs({ onBack, onNavigate, apiCall, showAlert, canEdit }) {
    const [visiteurs, setVisiteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVisiteur, setSelectedVisiteur] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [illuminatedStatus, setIlluminatedStatus] = useState(new Set());
    const statusTimeoutRef = useRef({});

    // ⏱️ STATE POUR LE MINUTEUR LIVE
    const [elapsedLive, setElapsedLive] = useState(0);
    const liveTimerRef = useRef();

    // CSS pour les effets 3D
    const styles3D = `
        .icon-3d {
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .icon-3d:hover {
            filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
            transform: translateY(-2px) scale(1.05);
        }
        
        .icon-3d-glow {
            filter: drop-shadow(0 0 8px currentColor);
        }
        
        .floating-icon {
            animation: float-3d 3s ease-in-out infinite;
        }
        
        @keyframes float-3d {
            0%, 100% { transform: translateY(0px) rotateX(0deg); }
            50% { transform: translateY(-5px) rotateX(5deg); }
        }
        
        .pulse-3d {
            animation: pulse-3d 2s ease-in-out infinite;
        }
        
        @keyframes pulse-3d {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;

    // Afficher une alerte toast moderne
    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    }, []);

    // Afficher la modale de succès
    const showSuccessAlert = (message) => {
        showToast(message, "success");
    };

    // Afficher la modale d'erreur
    const showErrorAlert = (message) => {
        showToast(message, "error");
    };

    // ⏱️ FONCTION POUR FORMATER LA DURÉE
    const formatDuree = useCallback((secondes) => {
        if (!secondes || secondes === 0) return null;
        const heures = Math.floor(secondes / 3600);
        const minutes = Math.floor((secondes % 3600) / 60);
        const secs = secondes % 60;

        if (heures > 0) {
            return `${heures}h ${minutes.toString().padStart(2, '0')}min`;
        } else if (minutes > 0) {
            return `${minutes}min ${secs.toString().padStart(2, '0')}s`;
        } else {
            return `${secs}s`;
        }
    }, []);

    const illuminateStatus = useCallback((visiteurId) => {
        if (statusTimeoutRef.current[visiteurId]) {
            clearTimeout(statusTimeoutRef.current[visiteurId]);
        }

        setIlluminatedStatus(prev => new Set([...prev, visiteurId]));

        statusTimeoutRef.current[visiteurId] = setTimeout(() => {
            setIlluminatedStatus(prev => {
                const newSet = new Set(prev);
                newSet.delete(visiteurId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔥 FETCHDATA AVEC USECALLBACK POUR ÉVITER LES WARNINGS
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const visiteursData = await apiCall("/visiteurs");

            let visiteursArray;
            if (Array.isArray(visiteursData)) {
                visiteursArray = visiteursData;
            } else if (visiteursData && Array.isArray(visiteursData.data)) {
                visiteursArray = visiteursData.data;
            } else {
                visiteursArray = [];
            }

            const sortedVisiteurs = visiteursArray.sort((a, b) => {
                const dateA = new Date(a.date_visite || a.created_at || 0);
                const dateB = new Date(b.date_visite || b.created_at || 0);
                return dateB - dateA;
            });

            setVisiteurs(sortedVisiteurs);

        } catch (error) {
            console.error("❌ Erreur chargement des données:", error);
            const errorMessage = error.message || "Impossible de charger les données depuis le serveur.";
            setError(errorMessage);
            showErrorAlert("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    // 🔥 ACTUALISATION AUTOMATIQUE CORRIGÉE
    useEffect(() => {
        // Chargement initial
        fetchData();

        // Écoute des messages Firebase en temps réel
        const setupFirebaseListener = async () => {
            try {
                const { onMessageListener } = await import('../firebase');

                onMessageListener().then(payload => {
                    const type = payload.data?.type;
                    const idVisiteur = parseInt(payload.data?.id_visiteur);

                    if (type === 'new_visitor' || type === 'visitor_updated' || type === 'status_changed') {
                        console.log('🔄 Mise à jour Firebase reçue:', type);

                        // Mettre à jour les données immédiatement
                        fetchData();

                        if (type === 'status_changed' && idVisiteur) {
                            const nouveauStatut = payload.data?.statut;
                            const ancienStatut = payload.data?.ancien_statut;
                            const duree = parseInt(payload.data?.duree_prise_en_charge || '0');

                            illuminateStatus(idVisiteur);

                            if (nouveauStatut === 'Terminé' && duree > 0) {
                                showSuccessAlert(`Statut mis à jour: ${nouveauStatut} - Durée: ${formatDuree(duree)}`);
                            } else {
                                showSuccessAlert(`Statut mis à jour: ${ancienStatut} → ${nouveauStatut}`);
                            }
                        } else if (type === 'new_visitor') {
                            showSuccessAlert('Nouveau visiteur ajouté');
                        } else if (type === 'visitor_updated') {
                            showSuccessAlert('Visiteur modifié');
                        }
                    }
                }).catch(error => {
                    console.warn('⚠️ Erreur Firebase listener:', error);
                });
            } catch (error) {
                console.warn('⚠️ Firebase non disponible:', error);
            }
        };

        setupFirebaseListener();

        // Intervalle d'actualisation automatique (toutes les 15 secondes)
        const interval = setInterval(() => {
            fetchData();
        }, 15000);

        // 🔥 CLEANUP CORRIGÉ
        return () => {
            clearInterval(interval);
            // Copier les références pour éviter les warnings
            const timeouts = { ...statusTimeoutRef.current };
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
            clearInterval(liveTimerRef.current);
        };
    }, [fetchData, illuminateStatus, formatDuree]);

    // 🔄 EFFET POUR LE MINUTEUR LIVE DANS LE MODAL
    useEffect(() => {
        if (showDetailModal && selectedVisiteur) {
            if (selectedVisiteur.id_status === 3 && selectedVisiteur.date_prise_en_charge) {
                const datePriseEnCharge = new Date(selectedVisiteur.date_prise_en_charge);
                const initialElapsed = Math.floor((Date.now() - datePriseEnCharge) / 1000);
                setElapsedLive(initialElapsed);

                liveTimerRef.current = setInterval(() => {
                    setElapsedLive(prev => prev + 1);
                }, 1000);
            } else {
                clearInterval(liveTimerRef.current);
                setElapsedLive(0);
            }

            return () => {
                clearInterval(liveTimerRef.current);
                setElapsedLive(0);
            };
        }
    }, [showDetailModal, selectedVisiteur]);

    // Fonction pour formater la date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "Non renseigné";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Date invalide";

            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return "Date invalide";
        }
    }, []);

    const getLibelleDepartement = useCallback((visiteur) => {
        return visiteur?.ciblage_utilise?.departement?.nom_departement ||
            visiteur?.departement?.nom_departement ||
            'Non assigné';
    }, []);

    const getLibelleTypeVisite = useCallback((visiteur) => {
        return visiteur?.ciblage_utilise?.type_visite?.libelle_type ||
            visiteur?.type_visite?.libelle_type ||
            'Non spécifié';
    }, []);

    const getLibelleTypeService = useCallback((visiteur) => {
        return visiteur?.ciblage_utilise?.type_service?.libelle_type_service ||
            visiteur?.type_service?.libelle_type_service ||
            'Non spécifié';
    }, []);

    // Fonction pour filtrer par période
    const getFilteredByDate = useCallback((visiteursList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case "today":
                return visiteursList.filter(visiteur => {
                    try {
                        const visitDate = new Date(visiteur.date_visite || visiteur.created_at);
                        if (isNaN(visitDate.getTime())) return false;
                        visitDate.setHours(0, 0, 0, 0);
                        return visitDate.getTime() === today.getTime();
                    } catch {
                        return false;
                    }
                });
            case "lastWeek":
                return visiteursList.filter(visiteur => {
                    try {
                        const visitDate = new Date(visiteur.date_visite || visiteur.created_at);
                        if (isNaN(visitDate.getTime())) return false;
                        visitDate.setHours(0, 0, 0, 0);
                        return visitDate >= lastWeek && visitDate <= today;
                    } catch {
                        return false;
                    }
                });
            case "all":
            default:
                return visiteursList;
        }
    }, [dateFilter]);

    // Filtrer les visiteurs
    const filteredVisiteurs = getFilteredByDate(
        visiteurs.filter(visiteur =>
            (visiteur.nom_visiteur || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (visiteur.prenom_visiteur || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (visiteur.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (visiteur.id_visiteur?.toString() || '').includes(searchTerm) ||
            getLibelleDepartement(visiteur).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLibelleTypeVisite(visiteur).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLibelleTypeService(visiteur).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (visiteur.nom_organisation || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Annuler la visite
    const annulerVisite = async (id) => {
        try {
            await apiCall(`/visiteurs/${id}`, {
                method: 'DELETE'
            });

            setVisiteurs((prev) => prev.filter((v) => v.id_visiteur !== id));
            setShowDeleteModal(false);
            setSelectedVisiteur(null);
            showSuccessAlert("Visite annulée avec succès");
        } catch (error) {
            console.error("❌ Erreur lors de l'annulation:", error);
            showErrorAlert("Erreur lors de l'annulation: " + error.message);
        }
    };

    // Rafraîchir manuellement les données
    const refreshVisiteurs = async () => {
        await fetchData();
        showSuccessAlert("Liste actualisée");
    };

    const getFilterLabel = useCallback(() => {
        switch (dateFilter) {
            case "today": return "Aujourd'hui";
            case "lastWeek": return "Semaine dernière";
            case "all": return "Tous les visiteurs";
            default: return "Tous les visiteurs";
        }
    }, [dateFilter]);

    // 🔥 ICÔNES SVG 3D MODERNES
    const Icons3D = {
        // Header et navigation
        visiteurs: (
            <svg className="w-6 h-6 icon-3d floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        search: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        clear: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        chevron: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
            </svg>
        ),
        refresh: (
            <svg className="w-5 h-5 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        add: (
            <svg className="w-7 h-7 icon-3d floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
        ),
        close: (
            <svg className="w-6 h-6 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),

        // Actions
        details: (
            <svg className="w-6 h-6 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        edit: (
            <svg className="w-6 h-6 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        // NOUVELLE ICÔNE "ANNULER" - HORLOGE BARRÉE
        cancel: (
            <svg className="w-6 h-6 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6" />
            </svg>
        ),

        // Informations
        email: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        phone: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        department: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        organization: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        calendar: (
            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        time: (
            <svg className="w-6 h-6 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),

        // Sections modales
        user: (
            <svg className="w-10 h-10 icon-3d floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        building: (
            <svg className="w-10 h-10 icon-3d floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        chart: (
            <svg className="w-10 h-10 icon-3d floating-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        stopwatch: (
            <svg className="w-12 h-12 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),

        // Indicateurs
        warning: (
            <svg className="w-8 h-8 icon-3d icon-3d-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        calendarEmpty: (
            <svg className="w-8 h-8 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        searchEmpty: (
            <svg className="w-8 h-8 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),

        // 🔥 NOUVELLES ICÔNES DE STATUT 3D
        status: {
            nouveau: (
                <svg className="w-4 h-4 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            attente: (
                <svg className="w-4 h-4 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            priseEnCharge: (
                <svg className="w-4 h-4 icon-3d pulse-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            termine: (
                <svg className="w-4 h-4 icon-3d icon-3d-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            ),
            inconnu: (
                <svg className="w-4 h-4 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    };

    // ✅ Obtenir la couleur du statut avec illumination
    const getStatusColor = useCallback((libelle, isIlluminated = false) => {
        const baseColors = {
            "Nouveau": {
                bg: "bg-blue-100",
                text: "text-blue-800",
                icon: Icons3D.status.nouveau
            },
            "En attente": {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                icon: Icons3D.status.attente
            },
            "Pris en charge": {
                bg: "bg-purple-100",
                text: "text-purple-800",
                icon: Icons3D.status.priseEnCharge
            },
            "Terminé": {
                bg: "bg-green-100",
                text: "text-green-800",
                icon: Icons3D.status.termine
            }
        };

        const defaultColors = {
            bg: "bg-gray-100",
            text: "text-gray-800",
            icon: Icons3D.status.inconnu
        };

        const colors = baseColors[libelle] || defaultColors;

        if (isIlluminated) {
            return {
                ...colors,
                bg: colors.bg + " animate-pulse shadow-lg",
                text: colors.text + " font-bold"
            };
        }

        return colors;
    }, [Icons3D.status]);

    const openDetails = (visiteur) => {
        setSelectedVisiteur(visiteur);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedVisiteur(null);
        clearInterval(liveTimerRef.current);
        setElapsedLive(0);
    };

    // 🔥 COMPOSANT TOAST MODERNE AU CENTRE
    const ModernToast = () => {
        if (!toast.show) return null;

        const toastConfig = {
            success: {
                bg: "bg-gradient-to-r from-green-500 to-emerald-600",
                icon: (
                    <svg className="w-6 h-6 icon-3d icon-3d-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                border: "border-l-4 border-emerald-400"
            },
            error: {
                bg: "bg-gradient-to-r from-red-500 to-rose-600",
                icon: (
                    <svg className="w-6 h-6 icon-3d icon-3d-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                border: "border-l-4 border-rose-400"
            }
        };

        const config = toastConfig[toast.type] || toastConfig.success;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className={`${config.bg} ${config.border} text-white px-8 py-6 rounded-2xl shadow-2xl transform animate-scale-in pointer-events-auto max-w-md mx-4`}>
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl animate-bounce">
                            {config.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-lg">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast({ show: false, message: "", type: "" })}
                            className="text-white/80 hover:text-white transition-colors duration-200 hover:scale-110 text-xl"
                        >
                            <svg className="w-5 h-5 icon-3d" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <style>{styles3D}</style>
            <div className="max-w-7xl mx-auto px-4">
                {/* 🔥 TOAST MODERNE AU CENTRE */}
                <ModernToast />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-2xl">
                            <div className="text-center font-bold">
                                <div className="text-2xl">{Icons3D.visiteurs}</div>
                                <div className="text-sm">VISITEURS</div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Gestion des Visiteurs
                            </h1>
                            <p className="text-gray-600 mt-1">Consultez et gérez l'ensemble des visiteurs</p>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="flex-1">
                            <div className="relative max-w-xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {Icons3D.search}
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300"
                                    placeholder="Rechercher par nom, prénom, email, département..."
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:scale-110 transition-transform duration-200"
                                    >
                                        {Icons3D.clear}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative">
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl hover:bg-orange-50 font-medium transition-all duration-300 hover:scale-105 appearance-none cursor-pointer pr-10"
                                >
                                    <option value="all">Tous les visiteurs</option>
                                    <option value="today">Aujourd'hui</option>
                                    <option value="lastWeek">Semaine dernière</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-orange-500">
                                    {Icons3D.chevron}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-sm text-orange-600 font-medium">
                            {searchTerm ? (
                                <>{filteredVisiteurs.length} visiteur{filteredVisiteurs.length > 1 ? 's' : ''} trouvé{filteredVisiteurs.length > 1 ? 's' : ''} pour "{searchTerm}"</>
                            ) : (
                                <>{filteredVisiteurs.length} visiteur{filteredVisiteurs.length > 1 ? 's' : ''} {getFilterLabel().toLowerCase()}</>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bouton flottant */}
                {canEdit && (
                    <button
                        onClick={() => onNavigate("formulaire")}
                        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl"
                        title="Ajouter un visiteur"
                    >
                        {Icons3D.add}
                    </button>
                )}

                {/* Liste */}
                <div className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{getFilterLabel()}</h2>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                                    {filteredVisiteurs.length} visiteur{filteredVisiteurs.length > 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={`skeleton-${i}`} className="animate-pulse p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-orange-200 rounded w-48"></div>
                                                <div className="h-3 bg-orange-200 rounded w-32"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">{Icons3D.warning}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h3>
                                <p className="text-gray-600 mb-8 text-lg">{error}</p>
                                <button
                                    onClick={refreshVisiteurs}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : filteredVisiteurs.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">
                                    {dateFilter === "today" ? Icons3D.calendarEmpty : dateFilter === "lastWeek" ? Icons3D.calendarEmpty : Icons3D.searchEmpty}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {searchTerm
                                        ? "Aucun visiteur trouvé"
                                        : dateFilter === "today"
                                            ? "Aucun visiteur aujourd'hui"
                                            : dateFilter === "lastWeek"
                                                ? "Aucun visiteur cette semaine"
                                                : "Aucun visiteur"}
                                </h3>
                                {canEdit && (
                                    <button
                                        onClick={() => onNavigate("formulaire")}
                                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                    >
                                        Créer un visiteur
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredVisiteurs.map((visiteur) => {
                                    const isIlluminated = illuminatedStatus.has(visiteur.id_visiteur);
                                    const statusColor = getStatusColor(visiteur.status_visite?.libelle_status, isIlluminated);
                                    const dureeFormatee = formatDuree(visiteur.duree_prise_en_charge);

                                    return (
                                        <div key={visiteur.id_visiteur} className="group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform bg-gradient-to-r from-orange-500 to-red-600">
                                                            <span className="text-white text-xl">{Icons3D.user}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-800 text-xl">
                                                                {visiteur.prenom_visiteur} {visiteur.nom_visiteur}
                                                            </h3>
                                                            <p className="text-orange-600 font-semibold text-lg">
                                                                ID: {visiteur.id_visiteur} • {getLibelleTypeVisite(visiteur)} • {getLibelleTypeService(visiteur)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-gray-600">
                                                        <div className="flex items-center">
                                                            {Icons3D.email}
                                                            <span className="ml-3">{visiteur.email || 'Non renseigné'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons3D.phone}
                                                            <span className="ml-3">{visiteur.telephone || 'Non renseigné'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons3D.department}
                                                            <span className="ml-3">{getLibelleDepartement(visiteur)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons3D.organization}
                                                            <span className="ml-3">{visiteur.nom_organisation || 'Non renseigné'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons3D.calendar}
                                                            <span className="ml-3">{formatDate(visiteur.date_visite || visiteur.created_at)}</span>
                                                        </div>

                                                        {/* ✅ BADGE STATUT AVEC ICÔNES SVG 3D */}
                                                        <div className="flex items-center justify-center">
                                                            <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-bold transition-all duration-300 ${statusColor.bg} ${statusColor.text}`}>
                                                                {statusColor.icon}
                                                                <span>{visiteur.status_visite?.libelle_status || "Inconnu"}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* ⏱️ DURÉE SI TERMINÉ */}
                                                    {visiteur.id_status === 4 && dureeFormatee && (
                                                        <div className="mt-4 flex items-center space-x-2 px-4 py-3 bg-green-100 rounded-2xl border-2 border-green-300">
                                                            {Icons3D.time}
                                                            <span className="font-bold text-green-700 text-lg">Durée: {dureeFormatee}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Boutons d'action */}
                                                <div className="flex space-x-3 ml-6">
                                                    <button
                                                        onClick={() => openDetails(visiteur)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                        title="Voir les détails"
                                                    >
                                                        {Icons3D.details}
                                                    </button>

                                                    {canEdit && (
                                                        <button
                                                            onClick={() => onNavigate("modifier-visiteur", visiteur)}
                                                            className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                            title="Modifier"
                                                        >
                                                            {Icons3D.edit}
                                                        </button>
                                                    )}

                                                    {canEdit && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVisiteur(visiteur);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                            title="Annuler la visite"
                                                        >
                                                            {Icons3D.cancel}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal annulation */}
            {showDeleteModal && selectedVisiteur && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                {Icons3D.cancel}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Annuler la visite</h3>
                            <p className="text-gray-600">
                                Êtes-vous sûr de vouloir annuler la visite de{" "}
                                <strong className="text-red-600">
                                    {selectedVisiteur.prenom_visiteur} {selectedVisiteur.nom_visiteur}
                                </strong>{" "}
                                ?
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-xl hover:bg-orange-50 font-semibold transition-all duration-300"
                            >
                                Non
                            </button>
                            <button
                                onClick={() => annulerVisite(selectedVisiteur.id_visiteur)}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
                            >
                                {Icons3D.cancel}
                                <span>Annuler la visite</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ MODAL DÉTAILS AVEC SECTION MINUTEUR LIVE */}
            {showDetailModal && selectedVisiteur && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Détails du Visiteur</h2>
                                </div>
                                <button
                                    onClick={closeDetailModal}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                >
                                    {Icons3D.close}
                                </button>
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-8 space-y-8">
                            {/* Informations personnelles */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons3D.user}
                                    </span>
                                    Informations Personnelles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">Nom complet</span>
                                            <span className="font-bold text-gray-800">{selectedVisiteur.prenom_visiteur} {selectedVisiteur.nom_visiteur}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">Email</span>
                                            <span className="font-bold text-gray-800">{selectedVisiteur.email || 'Non renseigné'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">Téléphone</span>
                                            <span className="font-bold text-gray-800">{selectedVisiteur.telephone || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Date de visite</span>
                                            <span className="font-bold text-gray-800">{formatDate(selectedVisiteur.date_visite || selectedVisiteur.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations professionnelles */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons3D.building}
                                    </span>
                                    Informations Professionnelles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Organisation</span>
                                            <span className="font-bold text-gray-800">{selectedVisiteur.nom_organisation || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Département</span>
                                            <span className="font-bold text-gray-800">{getLibelleDepartement(selectedVisiteur)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Type de visite</span>
                                            <span className="font-bold text-gray-800">{getLibelleTypeVisite(selectedVisiteur)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Type de service</span>
                                            <span className="font-bold text-gray-800">{getLibelleTypeService(selectedVisiteur)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Statut */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons3D.chart}
                                    </span>
                                    Statut Actuel
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <span className={`inline-flex items-center space-x-2 px-4 py-3 rounded-full text-lg font-bold ${getStatusColor(selectedVisiteur.status_visite?.libelle_status).bg} ${getStatusColor(selectedVisiteur.status_visite?.libelle_status).text}`}>
                                        {getStatusColor(selectedVisiteur.status_visite?.libelle_status).icon}
                                        <span>{selectedVisiteur.status_visite?.libelle_status || "Inconnu"}</span>
                                    </span>
                                </div>
                            </div>

                            {/* ⏱️ SECTION MINUTEUR AVEC MINUTEUR LIVE */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <span className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 text-white text-2xl">
                                        {Icons3D.stopwatch}
                                    </span>
                                    Suivi du Temps
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {selectedVisiteur.date_prise_en_charge && (
                                        <div className="text-center p-6 bg-white/70 rounded-2xl border border-green-100 shadow-sm">
                                            <div className="text-4xl mb-3">{Icons3D.time}</div>
                                            <div className="text-gray-600 font-semibold text-sm mb-2">Pris en charge le</div>
                                            <div className="text-lg font-bold text-gray-800">{formatDate(selectedVisiteur.date_prise_en_charge)}</div>
                                        </div>
                                    )}
                                    {selectedVisiteur.date_terminee && (
                                        <div className="text-center p-6 bg-white/70 rounded-2xl border border-green-100 shadow-sm">
                                            <div className="text-4xl mb-3">{Icons3D.time}</div>
                                            <div className="text-gray-600 font-semibold text-sm mb-2">Terminé le</div>
                                            <div className="text-lg font-bold text-gray-800">{formatDate(selectedVisiteur.date_terminee)}</div>
                                        </div>
                                    )}

                                    {/* ⏱️ MINUTEUR LIVE PENDANT LA PRISE EN CHARGE */}
                                    {selectedVisiteur.id_status === 3 && selectedVisiteur.date_prise_en_charge && (
                                        <div className="text-center p-6 bg-gradient-to-r from-green-200 to-emerald-200 rounded-2xl border-2 border-green-300 shadow-lg animate-pulse">
                                            <div className="text-4xl mb-3">{Icons3D.stopwatch}</div>
                                            <div className="text-gray-600 font-semibold text-sm mb-2">Durée en cours</div>
                                            <div className="text-3xl font-bold text-green-700">
                                                {formatDuree(elapsedLive)}
                                            </div>
                                        </div>
                                    )}

                                    {/* ⏱️ DURÉE TOTALE SI TERMINÉ */}
                                    {selectedVisiteur.id_status === 4 && selectedVisiteur.duree_prise_en_charge && (
                                        <div className="text-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300 shadow-lg">
                                            <div className="text-4xl mb-3">{Icons3D.stopwatch}</div>
                                            <div className="text-gray-600 font-semibold text-sm mb-2">Durée Totale</div>
                                            <div className="text-3xl font-bold text-green-600">{formatDuree(selectedVisiteur.duree_prise_en_charge)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex justify-end border-t border-gray-200">
                            <button
                                onClick={closeDetailModal}
                                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
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

export default ListeVisiteurs;