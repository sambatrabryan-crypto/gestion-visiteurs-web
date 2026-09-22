import React, { useState, useEffect, useCallback, useRef } from "react";

function ListeRendezVous({ onBack, onNavigate, apiCall, showAlert }) {
    const [rendezvous, setRendezVous] = useState([]);
    const [ciblages, setCiblages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRendezVous, setSelectedRendezVous] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [illuminatedRendezVous, setIlluminatedRendezVous] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // ⏱️ État pour gérer les timers actifs
    const [activeTimers, setActiveTimers] = useState({});

    // 🔥 ICÔNES SVG MODERNES COHÉRENTES
    const Icons = {
        // Header et navigation
        rendezvous: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        search: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        clear: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        refresh: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        add: (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        ),
        close: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),

        // Actions
        details: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        edit: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        // NOUVELLE ICÔNE "ANNULER" POUR RENDEZ-VOUS
        cancel: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6" />
            </svg>
        ),

        // Informations
        email: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        phone: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
        department: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        user: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        calendar: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        time: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        building: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        target: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        service: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        message: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
        ),

        // Indicateurs
        warning: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        searchEmpty: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        calendarEmpty: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    };

    // 🔥 TOAST MODERNE AU CENTRE
    const ModernToast = () => {
        if (!toast.show) return null;

        const toastConfig = {
            success: {
                bg: "bg-gradient-to-r from-green-500 to-emerald-600",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ),
                border: "border-l-4 border-emerald-400"
            },
            error: {
                bg: "bg-gradient-to-r from-red-500 to-rose-600",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            {Icons.close}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Afficher une alerte toast moderne
    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    }, []);

    // Animation d'illumination pour les nouvelles modifications
    const illuminateRendezVous = useCallback((rdvId) => {
        if (illuminationTimeoutRef.current[rdvId]) {
            clearTimeout(illuminationTimeoutRef.current[rdvId]);
        }

        setIlluminatedRendezVous(prev => new Set([...prev, rdvId]));

        illuminationTimeoutRef.current[rdvId] = setTimeout(() => {
            setIlluminatedRendezVous(prev => {
                const newSet = new Set(prev);
                newSet.delete(rdvId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔹 Charger toutes les données avec useCallback
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("🔄 Chargement des rendez-vous et ciblages...");

            const [rdvData, ciblagesData] = await Promise.all([
                apiCall("/rendezvous"),
                apiCall("/ciblage-departement")
            ]);

            console.log("✅ Rendez-vous chargés:", rdvData.length);
            console.log("✅ Ciblages chargés:", ciblagesData.length);

            // Gestion robuste de la réponse API
            const processData = (data, fallback = []) => {
                if (Array.isArray(data)) return data;
                if (data && data.data && Array.isArray(data.data)) return data.data;
                return fallback;
            };

            const rdvArray = processData(rdvData, []);
            const ciblagesArray = processData(ciblagesData, []);

            if (!rdvArray.length && !ciblagesArray.length) {
                throw new Error("Données manquantes dans la réponse");
            }

            // Trier les rendez-vous par date (plus récent en premier)
            const sortedRdv = rdvArray.sort((a, b) => {
                const dateA = new Date(a.date_rendezvous || a.created_at || 0);
                const dateB = new Date(b.date_rendezvous || b.created_at || 0);
                return dateB - dateA;
            });

            setRendezVous(sortedRdv);
            setCiblages(ciblagesArray);
        } catch (error) {
            console.error("❌ Erreur chargement des données:", error);
            const errorMessage = error.message || "Impossible de charger les données. Vérifie la connexion au serveur.";
            setError(errorMessage);
            showToast("Erreur lors du chargement des données", "error");
        } finally {
            setLoading(false);
        }
    }, [apiCall, showToast]);

    // Chargement initial
    useEffect(() => {
        fetchData();

        // Cleanup
        return () => {
            const timeouts = { ...illuminationTimeoutRef.current };
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
        };
    }, [fetchData]);

    // ⏱️ Démarrer les timers pour les RDV en cours
    useEffect(() => {
        const timers = {};

        rendezvous.forEach(rdv => {
            if (rdv.id_status === 3 && rdv.date_prise_en_charge && !rdv.date_terminee) {
                const startTime = new Date(rdv.date_prise_en_charge).getTime();

                const updateTimer = () => {
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - startTime) / 1000);

                    setActiveTimers(prev => ({
                        ...prev,
                        [rdv.id_rendezvous]: elapsedSeconds
                    }));
                };

                updateTimer();
                timers[rdv.id_rendezvous] = setInterval(updateTimer, 1000);
            }
        });

        return () => {
            Object.values(timers).forEach(timer => clearInterval(timer));
        };
    }, [rendezvous]);

    // ⏱️ Formater le temps du minuteur
    const formatTimerDuration = useCallback((seconds) => {
        if (!seconds) return '00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // ⏱️ Formater la durée finale (terminée)
    const formatFinalDuration = useCallback((seconds) => {
        if (!seconds) return '';
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${remainingMinutes}min`;
        }
        return `${minutes} min`;
    }, []);

    // Fonction pour formater la date avec gestion d'erreur
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
            console.error("Erreur formatage date:", error);
            return "Date invalide";
        }
    }, []);

    // Fonction pour formater la durée estimée
    const formatDuree = useCallback((minutes) => {
        if (!minutes) return 'Non spécifiée';
        if (minutes < 60) return `${minutes} min`;
        const heures = Math.floor(minutes / 60);
        const minsRestantes = minutes % 60;
        return minsRestantes > 0 ? `${heures}h${minsRestantes.toString().padStart(2, '0')}` : `${heures}h`;
    }, []);

    // Fonction pour obtenir les informations de ciblage
    const getCiblageInfo = useCallback((idCiblage) => {
        if (!idCiblage) return null;
        const ciblage = ciblages.find(c => c.id_ciblage === idCiblage);
        return ciblage || null;
    }, [ciblages]);

    // Fonction pour obtenir le libellé du département via le ciblage
    const getLibelleDepartement = useCallback((idCiblage) => {
        const ciblage = getCiblageInfo(idCiblage);
        return ciblage?.departement?.nom_departement || "Non assigné";
    }, [getCiblageInfo]);

    // Fonction pour obtenir le libellé du type de visite via le ciblage
    const getLibelleTypeVisite = useCallback((idCiblage) => {
        const ciblage = getCiblageInfo(idCiblage);
        return ciblage?.type_visite?.libelle_type || "Non spécifié";
    }, [getCiblageInfo]);

    // Fonction pour obtenir le libellé du type de service via le ciblage
    const getLibelleTypeService = useCallback((idCiblage) => {
        const ciblage = getCiblageInfo(idCiblage);
        return ciblage?.type_service?.libelle_type_service || "Non spécifié";
    }, [getCiblageInfo]);

    // Fonction pour obtenir l'ID du département via le ciblage
    const getIdDepartement = useCallback((idCiblage) => {
        const ciblage = getCiblageInfo(idCiblage);
        return ciblage?.id_departement || null;
    }, [getCiblageInfo]);

    // Fonction pour déterminer le badge de statut
    const getStatusBadge = useCallback((rdv) => {
        const maintenant = new Date();
        const dateRdv = new Date(rdv.date_rendezvous);

        if (dateRdv < maintenant && rdv.id_status !== 4) {
            return { text: 'Passé', color: 'bg-gray-100 text-gray-800' };
        }

        switch (rdv.id_status) {
            case 1:
                return { text: 'Nouveau', color: 'bg-blue-100 text-blue-800' };
            case 2:
                return { text: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
            case 3:
                return { text: 'Pris en charge', color: 'bg-green-100 text-green-800' };
            case 4:
                return { text: 'Terminé', color: 'bg-gray-100 text-gray-800' };
            default:
                return { text: 'Planifié', color: 'bg-orange-100 text-orange-800' };
        }
    }, []);

    // Fonction pour obtenir le libellé du statut
    const getLibelleStatus = useCallback((idStatus) => {
        switch (idStatus) {
            case 1: return 'Nouveau';
            case 2: return 'En attente';
            case 3: return 'Pris en charge';
            case 4: return 'Terminé';
            default: return 'Inconnu';
        }
    }, []);

    // Fonction pour filtrer par période avec gestion d'erreur
    const getFilteredByDate = useCallback((rdvList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);

        switch (dateFilter) {
            case "today":
                return rdvList.filter(rdv => {
                    try {
                        const rdvDate = new Date(rdv.date_rendezvous);
                        if (isNaN(rdvDate.getTime())) return false;
                        rdvDate.setHours(0, 0, 0, 0);
                        return rdvDate.getTime() === today.getTime();
                    } catch {
                        return false;
                    }
                });
            case "week":
                return rdvList.filter(rdv => {
                    try {
                        const rdvDate = new Date(rdv.date_rendezvous);
                        if (isNaN(rdvDate.getTime())) return false;
                        return rdvDate >= today && rdvDate <= nextWeek;
                    } catch {
                        return false;
                    }
                });
            case "past":
                return rdvList.filter(rdv => {
                    try {
                        const rdvDate = new Date(rdv.date_rendezvous);
                        if (isNaN(rdvDate.getTime())) return false;
                        return rdvDate < today;
                    } catch {
                        return false;
                    }
                });
            case "all":
            default:
                return rdvList;
        }
    }, [dateFilter]);

    // Filtrer les rendez-vous selon la recherche et la période
    const filteredRendezVous = getFilteredByDate(
        rendezvous.filter(rdv =>
            (rdv.nom_visiteur || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rdv.prenom_visiteur || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rdv.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (rdv.id_rendezvous?.toString() || '').includes(searchTerm) ||
            (rdv.motif || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLibelleDepartement(rdv.id_ciblage).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLibelleTypeVisite(rdv.id_ciblage).toLowerCase().includes(searchTerm.toLowerCase()) ||
            getLibelleTypeService(rdv.id_ciblage).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // 🔹 Annuler un rendez-vous
    const annulerRendezVous = async (id) => {
        try {
            console.log("🗑️ Annulation rendez-vous:", id);
            await apiCall(`/rendezvous/${id}`, {
                method: 'DELETE'
            });

            console.log("✅ Rendez-vous annulé:", id);
            setRendezVous((prev) => prev.filter((r) => r.id_rendezvous !== id));
            setShowDeleteModal(false);
            setSelectedRendezVous(null);
            showToast(`Rendez-vous "${selectedRendezVous.prenom_visiteur} ${selectedRendezVous.nom_visiteur}" annulé avec succès !`, "success");
        } catch (error) {
            console.error("❌ Erreur lors de l'annulation:", error);
            showToast("Erreur lors de l'annulation du rendez-vous: " + error.message, "error");
        }
    };

    // Fonction pour rafraîchir les données
    const refreshRendezVous = async () => {
        await fetchData();
        showToast("Liste actualisée avec succès", "success");
    };

    // Obtenir le libellé du filtre actif
    const getFilterLabel = useCallback(() => {
        switch (dateFilter) {
            case "today": return "Aujourd'hui";
            case "week": return "Cette semaine";
            case "past": return "Rendez-vous passés";
            case "all": return "Tous les rendez-vous";
            default: return "Tous les rendez-vous";
        }
    }, [dateFilter]);

    // Fonction pour ouvrir les détails d'un rendez-vous
    const openDetails = (rdv) => {
        setSelectedRendezVous(rdv);
        setShowDetailModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* 🔥 TOAST MODERNE AU CENTRE */}
                <ModernToast />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-2xl">
                            <div className="text-center font-bold">
                                <div className="text-2xl">{Icons.rendezvous}</div>
                                <div className="text-sm">RENDEZ-VOUS</div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Gestion des Rendez-vous
                            </h1>
                            <p className="text-gray-600 mt-1">Consultez et gérez l'ensemble des rendez-vous •
                                <span className="text-green-600 font-semibold ml-2">
                                    {rendezvous.length} rendez-vous
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="bg-white rounded-2xl shadow-xl border border-orange-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="flex-1">
                            <div className="relative max-w-xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {Icons.search}
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300"
                                    placeholder="Rechercher par nom, prénom, email, motif, département..."
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:scale-110 transition-transform duration-200"
                                    >
                                        {Icons.clear}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* Menu déroulant pour le filtre par période */}
                            <div className="relative">
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-xl hover:bg-orange-50 font-medium transition-all duration-300 hover:scale-105 appearance-none cursor-pointer pr-10"
                                >
                                    <option value="all">Tous les rendez-vous</option>
                                    <option value="today">Aujourd'hui</option>
                                    <option value="week">Cette semaine</option>
                                    <option value="past">Rendez-vous passés</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-orange-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Bouton Actualiser */}
                            <button
                                onClick={refreshRendezVous}
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 whitespace-nowrap shadow-lg"
                            >
                                {Icons.refresh}
                                <span>{loading ? 'Actualisation...' : 'Actualiser'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Compteur de résultats */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-sm text-orange-600 font-medium">
                            {searchTerm ? (
                                <>{filteredRendezVous.length} rendez-vous{filteredRendezVous.length > 1 ? '' : ''} trouvé{filteredRendezVous.length > 1 ? 's' : ''} pour "{searchTerm}"</>
                            ) : (
                                <>{filteredRendezVous.length} rendez-vous{filteredRendezVous.length > 1 ? '' : ''} {getFilterLabel().toLowerCase()}</>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                        </div>
                    </div>
                </div>

                {/* Bouton d'ajout flottant */}
                <button
                    onClick={() => onNavigate("rendezvous")}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl"
                    title="Créer un rendez-vous"
                >
                    {Icons.add}
                </button>

                {/* Liste des rendez-vous */}
                <div className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{getFilterLabel()}</h2>
                                <p className="text-orange-100 font-medium">
                                    {dateFilter === "today"
                                        ? "Rendez-vous prévus aujourd'hui"
                                        : dateFilter === "week"
                                            ? "Rendez-vous de la semaine"
                                            : dateFilter === "past"
                                                ? "Historique des rendez-vous"
                                                : "Gérez l'ensemble des rendez-vous"}
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                                    {filteredRendezVous.length} rendez-vous{filteredRendezVous.length > 1 ? '' : ''}
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
                                            <div className="flex space-x-2">
                                                <div className="h-10 bg-orange-200 rounded w-10"></div>
                                                <div className="h-10 bg-orange-200 rounded w-10"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">{Icons.warning}</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h3>
                                <p className="text-gray-600 mb-8 text-lg">{error}</p>
                                <button
                                    onClick={refreshRendezVous}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : filteredRendezVous.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-8xl mb-6">
                                    {dateFilter === "today" ? Icons.calendarEmpty : dateFilter === "week" ? Icons.calendarEmpty : dateFilter === "past" ? Icons.calendarEmpty : Icons.searchEmpty}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {searchTerm
                                        ? "Aucun rendez-vous trouvé"
                                        : dateFilter === "today"
                                            ? "Aucun rendez-vous aujourd'hui"
                                            : dateFilter === "week"
                                                ? "Aucun rendez-vous cette semaine"
                                                : dateFilter === "past"
                                                    ? "Aucun rendez-vous passé"
                                                    : "Aucun rendez-vous"
                                    }
                                </h3>
                                <p className="text-gray-600 mb-8 text-lg">
                                    {searchTerm
                                        ? `Aucun rendez-vous ne correspond à "${searchTerm}"`
                                        : dateFilter === "today"
                                            ? "Aucun rendez-vous n'est prévu pour aujourd'hui."
                                            : dateFilter === "week"
                                                ? "Aucun rendez-vous n'est prévu cette semaine."
                                                : dateFilter === "past"
                                                    ? "Aucun rendez-vous n'a eu lieu."
                                                    : "Commencez par planifier votre premier rendez-vous."
                                    }
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => onNavigate("rendezvous")}
                                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                    >
                                        Créer un rendez-vous
                                    </button>
                                )}
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                    >
                                        Réinitialiser la recherche
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredRendezVous.map((rdv) => {
                                    const status = getStatusBadge(rdv);
                                    const isIlluminated = illuminatedRendezVous.has(rdv.id_rendezvous);
                                    const cardClass = isIlluminated
                                        ? "group p-6 border-2 border-orange-300 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse"
                                        : "group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg";

                                    return (
                                        <div key={rdv.id_rendezvous} className={cardClass}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform bg-gradient-to-r from-orange-500 to-red-600">
                                                            <span className="text-white text-xl">{Icons.calendar}</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-4">
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800 text-xl">
                                                                        {rdv.prenom_visiteur} {rdv.nom_visiteur}
                                                                    </h3>
                                                                    <p className="text-orange-600 font-semibold text-lg">
                                                                        ID: {rdv.id_rendezvous} • {formatDate(rdv.date_rendezvous)} • {formatDuree(rdv.duree_estimee)}
                                                                    </p>
                                                                </div>
                                                                <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${status.color}`}>
                                                                    {status.text}
                                                                </span>

                                                                {/* ⏱️ AFFICHAGE DU MINUTEUR */}
                                                                {rdv.id_status === 3 && activeTimers[rdv.id_rendezvous] && (
                                                                    <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border-2 border-green-300">
                                                                        <svg className="w-5 h-5 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span className="text-green-800 font-mono font-bold">
                                                                            {formatTimerDuration(activeTimers[rdv.id_rendezvous])}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {/* ⏱️ AFFICHAGE DE LA DURÉE FINALE */}
                                                                {rdv.id_status === 4 && rdv.duree_prise_en_charge && (
                                                                    <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border-2 border-gray-300">
                                                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        <span className="text-gray-800 font-semibold">
                                                                            Durée: {formatFinalDuration(rdv.duree_prise_en_charge)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 text-gray-600">
                                                        <div className="flex items-center">
                                                            {Icons.email}
                                                            <span className="ml-3">{rdv.email || 'Non renseigné'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons.phone}
                                                            <span className="ml-3">{rdv.telephone || 'Non renseigné'}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons.department}
                                                            <span className="ml-3">{getLibelleDepartement(rdv.id_ciblage)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons.target}
                                                            <span className="ml-3">{getLibelleTypeVisite(rdv.id_ciblage)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons.service}
                                                            <span className="ml-3">{getLibelleTypeService(rdv.id_ciblage)}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            {Icons.message}
                                                            <span className="ml-3">{rdv.motif || 'Non spécifié'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Boutons d'action */}
                                                <div className="flex space-x-3 ml-6">
                                                    <button
                                                        onClick={() => openDetails(rdv)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                        title="Voir les détails du rendez-vous"
                                                    >
                                                        {Icons.details}
                                                    </button>

                                                    <button
                                                        onClick={() => onNavigate("modifier-rendezvous", rdv)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                        title="Modifier le rendez-vous"
                                                    >
                                                        {Icons.edit}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedRendezVous(rdv);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                        title="Annuler le rendez-vous"
                                                    >
                                                        {Icons.cancel}
                                                    </button>
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

            {/* ✅ MODAL ANNULATION MODERNE */}
            {showDeleteModal && selectedRendezVous && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                {Icons.cancel}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Annuler le rendez-vous</h3>
                            <p className="text-gray-600">
                                Êtes-vous sûr de vouloir annuler le rendez-vous de{" "}
                                <strong className="text-red-600">
                                    {selectedRendezVous.prenom_visiteur}{" "}
                                    {selectedRendezVous.nom_visiteur}
                                </strong>{" "}
                                prévu le {formatDate(selectedRendezVous.date_rendezvous)} ?
                            </p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-xl hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Non
                            </button>
                            <button
                                onClick={() => annulerRendezVous(selectedRendezVous.id_rendezvous)}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                                {Icons.cancel}
                                <span>Annuler le RDV</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ MODAL DÉTAILS MODERNE */}
            {showDetailModal && selectedRendezVous && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Détails du Rendez-vous</h2>
                                    <p className="text-orange-100 font-medium">Informations complètes</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                >
                                    {Icons.close}
                                </button>
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="p-8 space-y-8">
                            {/* Informations du rendez-vous */}
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons.calendar}
                                    </span>
                                    Informations du Rendez-vous
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">ID Rendez-vous</span>
                                            <span className="font-bold text-orange-600">{selectedRendezVous.id_rendezvous}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">Date et heure</span>
                                            <span className="font-bold text-gray-800">{formatDate(selectedRendezVous.date_rendezvous)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                            <span className="text-gray-600 font-medium">Durée estimée</span>
                                            <span className="font-bold text-gray-800">{formatDuree(selectedRendezVous.duree_estimee)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Statut</span>
                                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(selectedRendezVous).color}`}>
                                                {getStatusBadge(selectedRendezVous).text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-orange-100">
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600 font-medium">Motif</span>
                                        <span className="font-bold text-gray-800 text-right max-w-xs">{selectedRendezVous.motif || 'Non spécifié'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Informations du visiteur */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons.user}
                                    </span>
                                    Informations du Visiteur
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Nom</span>
                                            <span className="font-bold text-gray-800">{selectedRendezVous.nom_visiteur}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Prénom</span>
                                            <span className="font-bold text-gray-800">{selectedRendezVous.prenom_visiteur}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                            <span className="text-gray-600 font-medium">Email</span>
                                            <span className="font-bold text-gray-800">{selectedRendezVous.email || 'Non renseigné'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Téléphone</span>
                                            <span className="font-bold text-gray-800">{selectedRendezVous.telephone || 'Non renseigné'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations du ciblage */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons.target}
                                    </span>
                                    Règle de Ciblage
                                </h3>
                                {selectedRendezVous.id_ciblage ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                                <span className="text-gray-600 font-medium">ID Ciblage</span>
                                                <span className="font-bold text-purple-600">{selectedRendezVous.id_ciblage}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                                <span className="text-gray-600 font-medium">Type de visite</span>
                                                <span className="font-bold text-gray-800">{getLibelleTypeVisite(selectedRendezVous.id_ciblage)}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-purple-100">
                                                <span className="text-gray-600 font-medium">Type de service</span>
                                                <span className="font-bold text-gray-800">{getLibelleTypeService(selectedRendezVous.id_ciblage)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600 font-medium">Priorité</span>
                                                <span className="font-bold text-gray-800">{getCiblageInfo(selectedRendezVous.id_ciblage)?.priorite || 'Non spécifiée'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">{Icons.target}</div>
                                        <p className="text-gray-500 font-medium text-lg">Aucune règle de ciblage assignée</p>
                                    </div>
                                )}
                            </div>

                            {/* Informations du département */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                        {Icons.building}
                                    </span>
                                    Département Assigné
                                </h3>
                                {selectedRendezVous.id_ciblage ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                                            <span className="text-gray-600 font-medium">ID Département</span>
                                            <span className="font-bold text-green-600">{getIdDepartement(selectedRendezVous.id_ciblage)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600 font-medium">Nom du département</span>
                                            <span className="font-bold text-gray-800">{getLibelleDepartement(selectedRendezVous.id_ciblage)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="text-4xl mb-4">{Icons.building}</div>
                                        <p className="text-gray-500 font-medium text-lg">Aucun département assigné</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 bg-gray-50 rounded-b-3xl flex justify-end space-x-4 border-t border-gray-200">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-2xl hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    onNavigate("modifier-rendezvous", selectedRendezVous);
                                }}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl hover:from-blue-600 hover:to-blue-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                            >
                                {Icons.edit}
                                <span>Modifier</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListeRendezVous;