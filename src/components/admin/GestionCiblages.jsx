import React, { useEffect, useState, useCallback, useRef } from "react";

function GestionCiblages({ apiCall, showAlert }) {
    const [ciblages, setCiblages] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [typesVisite, setTypesVisite] = useState([]);
    const [typesService, setTypesService] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCiblage, setSelectedCiblage] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id_type_visite: '',
        id_type_service: '',
        id_departement: '',
        priorite: 1,
        actif: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartement, setFilterDepartement] = useState("");
    const [filterActif, setFilterActif] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [illuminatedCiblages, setIlluminatedCiblages] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // 🎨 ICÔNES SVG
    const Icons = {
        target: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        edit: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        ),
        delete: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        ),
        department: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        visit: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        service: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        priority: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        filter: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
        ),
        arrow: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        ),
        check: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        routing: (
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        empty: (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        lock: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        unlock: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
        )
    };

    // 🎨 STYLES CSS
    const styles = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(-30px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .animate-fadeIn {
            animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideIn {
            animation: slideIn 0.8s ease-out;
        }
        
        .animate-scale-in {
            animation: scaleIn 0.3s ease-out;
        }
        
        .border-glow-orange {
            box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
            transition: all 0.3s ease;
        }
        
        .border-glow-orange:hover {
            box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.6),
                        0 0 30px rgba(249, 115, 22, 0.4);
        }
        
        .gradient-text-orange {
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
        
        .hover-lift {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
    `;

    // 🎨 TOAST MODERNE
    const ModernToast = () => {
        if (!toast.show) return null;

        const toastConfig = {
            success: {
                bg: "bg-gradient-to-r from-green-500 to-emerald-600",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ),
                border: "border-l-4 border-emerald-400"
            },
            error: {
                bg: "bg-gradient-to-r from-red-500 to-red-700",
                icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                ),
                border: "border-l-4 border-red-400"
            }
        };

        const config = toastConfig[toast.type] || toastConfig.success;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className={`${config.bg} ${config.border} text-white px-8 py-6 rounded-2xl shadow-2xl transform animate-scale-in pointer-events-auto max-w-md mx-4`}>
                    <div className="flex items-center space-x-4">
                        <div className="animate-bounce">{config.icon}</div>
                        <div className="flex-1">
                            <p className="font-semibold text-lg">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast({ show: false, message: "", type: "" })}
                            className="text-white/80 hover:text-white transition-colors duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    }, []);

    const illuminateCiblage = useCallback((ciblageId) => {
        if (illuminationTimeoutRef.current[ciblageId]) {
            clearTimeout(illuminationTimeoutRef.current[ciblageId]);
        }

        setIlluminatedCiblages(prev => new Set([...prev, ciblageId]));

        illuminationTimeoutRef.current[ciblageId] = setTimeout(() => {
            setIlluminatedCiblages(prev => {
                const newSet = new Set(prev);
                newSet.delete(ciblageId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔄 CHARGEMENT DES DONNÉES - CORRIGÉ
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log("🔄 Chargement des données...");

            // Charger les ciblages (TOUS, actifs ET inactifs)
            const ciblagesResponse = await apiCall('/ciblage-departement');
            console.log("📦 Données brutes reçues:", ciblagesResponse);

            let processedCiblages = [];

            if (Array.isArray(ciblagesResponse)) {
                processedCiblages = ciblagesResponse;
            } else if (ciblagesResponse && typeof ciblagesResponse === 'object') {
                // Essayer différentes propriétés
                processedCiblages = ciblagesResponse.data ||
                    ciblagesResponse.ciblages ||
                    ciblagesResponse.records ||
                    ciblagesResponse.result ||
                    [];
            }

            console.log("✅ Ciblages traités:", processedCiblages.length, "enregistrements");
            console.log("📊 Détails des ciblages:", processedCiblages);

            setCiblages(processedCiblages);

            // Charger les autres données
            const deptsResponse = await apiCall('/departements');
            const processedDepts = Array.isArray(deptsResponse)
                ? deptsResponse
                : (deptsResponse?.data || deptsResponse?.departements || deptsResponse?.result || []);
            console.log("🏢 Départements:", processedDepts.length);
            setDepartements(processedDepts);

            const visitesResponse = await apiCall('/typevisites');
            const processedVisites = Array.isArray(visitesResponse)
                ? visitesResponse
                : (visitesResponse?.data || visitesResponse?.types || visitesResponse?.result || []);
            console.log("👥 Types visite:", processedVisites.length);
            setTypesVisite(processedVisites);

            const servicesResponse = await apiCall('/types-service');
            const processedServices = Array.isArray(servicesResponse)
                ? servicesResponse
                : (servicesResponse?.data || servicesResponse?.types_service || servicesResponse?.result || []);
            console.log("⚙️ Types service:", processedServices.length);
            setTypesService(processedServices);

        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            showToast("Impossible de charger les ciblages: " + error.message, "error");
            setCiblages([]);
            setDepartements([]);
            setTypesVisite([]);
            setTypesService([]);
        } finally {
            setLoading(false);
        }
    }, [apiCall, showToast]);

    // Chargement initial
    useEffect(() => {
        fetchData();

        return () => {
            const timeouts = { ...illuminationTimeoutRef.current };
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
        };
    }, [fetchData]);

    const validateForm = () => {
        const errors = {};

        if (!formData.id_type_visite) {
            errors.id_type_visite = "Le type de visite est obligatoire";
        }

        if (!formData.id_type_service) {
            errors.id_type_service = "Le type de service est obligatoire";
        }

        if (!formData.id_departement) {
            errors.id_departement = "Le département est obligatoire";
        }

        if (!formData.priorite || formData.priorite < 1) {
            errors.priorite = "La priorité doit être supérieure à 0";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const filteredCiblages = ciblages.filter(ciblage => {
        // Accès sécurisé aux propriétés imbriquées
        const typeVisite = ciblage.type_visite || ciblage.TypeVisite || {};
        const typeService = ciblage.type_service || ciblage.TypeService || {};
        const departement = ciblage.departement || ciblage.Departement || {};

        const matchSearch =
            (typeVisite.libelle_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (typeService.libelle_type_service?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (departement.nom_departement?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (ciblage.id_ciblage?.toString() || '').includes(searchTerm);

        const matchDept = !filterDepartement ||
            ciblage.id_departement?.toString() === filterDepartement ||
            departement.id_departement?.toString() === filterDepartement;

        const matchActif = filterActif === "" ||
            (filterActif === "true" ? ciblage.actif === true : ciblage.actif === false);

        return matchSearch && matchDept && matchActif;
    });

    const refreshData = async () => {
        await fetchData();
        showToast("Données actualisées avec succès", "success");
    };

    // Fonction pour réactiver un ciblage
    const reactivateCiblage = async (ciblageId) => {
        try {
            await apiCall(`/ciblage-departement/${ciblageId}`, {
                method: 'PUT',
                body: JSON.stringify({ actif: true })
            });

            await fetchData();
            illuminateCiblage(ciblageId);
            showToast("Ciblage réactivé avec succès !", "success");
        } catch (error) {
            console.error("❌ Erreur réactivation:", error);
            showToast("Erreur: " + error.message, "error");
        }
    };

    const saveCiblage = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Veuillez corriger les erreurs dans le formulaire", "error");
            return;
        }

        try {
            const dataToSend = {
                id_type_visite: parseInt(formData.id_type_visite),
                id_type_service: parseInt(formData.id_type_service),
                id_departement: parseInt(formData.id_departement),
                priorite: parseInt(formData.priorite),
                actif: formData.actif
            };

            console.log("📤 Données envoyées:", dataToSend);

            let result;
            if (editing) {
                result = await apiCall(`/ciblage-departement/${editing.id_ciblage}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend)
                });

                await fetchData();
                illuminateCiblage(editing.id_ciblage);
            } else {
                result = await apiCall('/ciblage-departement', {
                    method: 'POST',
                    body: JSON.stringify(dataToSend)
                });

                await fetchData();

                const newCiblage = result.ciblage || result.data || result;
                if (newCiblage?.id_ciblage) {
                    illuminateCiblage(newCiblage.id_ciblage);
                }
            }

            setShowForm(false);
            setEditing(null);
            setFormData({ id_type_visite: '', id_type_service: '', id_departement: '', priorite: 1, actif: true });
            setFormErrors({});

            showToast(
                editing ? "Ciblage modifié avec succès !" : "Ciblage créé avec succès !",
                "success"
            );
        } catch (error) {
            console.error("❌ Erreur sauvegarde:", error);
            showToast("Erreur: " + (error.message || "Erreur inconnue"), "error");
        }
    };

    const deleteCiblage = async (id) => {
        try {
            await apiCall(`/ciblage-departement/${id}`, { method: 'DELETE' });

            await fetchData();
            setShowDeleteModal(false);
            setSelectedCiblage(null);

            showToast("Ciblage désactivé avec succès !", "success");
        } catch (error) {
            console.error("❌ Erreur suppression:", error);
            showToast("Erreur: " + error.message, "error");
        }
    };

    const editCiblage = (ciblage) => {
        setFormData({
            id_type_visite: ciblage.id_type_visite?.toString() || '',
            id_type_service: ciblage.id_type_service?.toString() || '',
            id_departement: ciblage.id_departement?.toString() || '',
            priorite: ciblage.priorite || 1,
            actif: ciblage.actif !== false
        });
        setEditing(ciblage);
        setFormErrors({});
        setShowForm(true);
    };

    // Compteurs
    const ciblagesActifs = ciblages.filter(c => c.actif).length;
    const ciblagesInactifs = ciblages.filter(c => !c.actif).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <style>{styles}</style>
            <div className="max-w-7xl mx-auto px-4">
                {/* 🎨 TOAST MODERNE */}
                <ModernToast />

                {/* 🔥 SECTION DE RECHERCHE SANS EN-TÊTE */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6 hover-lift">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Barre de recherche */}
                            <div className="relative md:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-500">
                                    {Icons.search}
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300"
                                    placeholder="Rechercher un ciblage..."
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 hover:scale-110 transition-transform duration-200 text-orange-500 hover:text-orange-600"
                                    >
                                        {Icons.clear}
                                    </button>
                                )}
                            </div>

                            {/* Filtre par département */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-500">
                                    {Icons.department}
                                </div>
                                <select
                                    value={filterDepartement}
                                    onChange={(e) => setFilterDepartement(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all duration-300 appearance-none"
                                >
                                    <option value="">Tous les départements</option>
                                    {departements.map(dept => (
                                        <option key={dept.id_departement} value={dept.id_departement}>
                                            {dept.nom_departement}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtre actif/inactif */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-500">
                                    {Icons.filter}
                                </div>
                                <select
                                    value={filterActif}
                                    onChange={(e) => setFilterActif(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all duration-300 appearance-none"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="true">Actifs uniquement</option>
                                    <option value="false">Inactifs uniquement</option>
                                </select>
                            </div>
                        </div>

                        {/* Compteurs de statut */}
                        <div className="mt-4 flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600 font-medium">
                                    Actifs: {ciblagesActifs}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                                <span className="text-sm text-gray-600 font-medium">
                                    Inactifs: {ciblagesInactifs}
                                </span>
                            </div>
                        </div>

                        {/* Compteur de résultats et bouton d'actualisation */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-orange-600 font-medium">
                                {searchTerm || filterDepartement || filterActif ? (
                                    <>{filteredCiblages.length} ciblage{filteredCiblages.length > 1 ? 's' : ''} trouvé{filteredCiblages.length > 1 ? 's' : ''}</>
                                ) : (
                                    <>{filteredCiblages.length} règle{filteredCiblages.length > 1 ? 's' : ''} au total</>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-xs text-gray-500">
                                    {new Date().toLocaleDateString('fr-FR')} {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <button
                                    onClick={refreshData}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-700 font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 whitespace-nowrap shadow-lg hover-lift text-sm"
                                >
                                    {Icons.refresh}
                                    <span>{loading ? '...' : 'Actualiser'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔥 BOUTON D'AJOUT FLOTTANT - ORANGE/ROUGE */}
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ id_type_visite: '', id_type_service: '', id_departement: '', priorite: 1, actif: true });
                        setFormErrors({});
                        setShowForm(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl hover-lift"
                    title="Ajouter un ciblage"
                >
                    {Icons.add}
                </button>

                {/* Modal pour le formulaire */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-md w-full mx-auto shadow-2xl border-2 border-orange-200 my-8 hover-lift">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">
                                        {editing ? 'Modifier' : 'Nouveau'} Ciblage
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({ id_type_visite: '', id_type_service: '', id_departement: '', priorite: 1, actif: true });
                                            setFormErrors({});
                                        }}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                    >
                                        {Icons.close}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveCiblage} className="p-8 space-y-6">
                                {/* Type de visite */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.visit}</span>
                                        <span>Type de visite *</span>
                                    </label>
                                    <select
                                        value={formData.id_type_visite}
                                        onChange={(e) => setFormData({ ...formData, id_type_visite: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.id_type_visite ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        required
                                    >
                                        <option value="">Sélectionner un type de visite</option>
                                        {typesVisite.map(tv => (
                                            <option key={tv.id_type_visite} value={tv.id_type_visite}>
                                                {tv.libelle_type}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.id_type_visite && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.id_type_visite}</p>
                                    )}
                                </div>

                                {/* Type de service */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.service}</span>
                                        <span>Type de service *</span>
                                    </label>
                                    <select
                                        value={formData.id_type_service}
                                        onChange={(e) => setFormData({ ...formData, id_type_service: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.id_type_service ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        required
                                    >
                                        <option value="">Sélectionner un type de service</option>
                                        {typesService.map(ts => (
                                            <option key={ts.id_type_service} value={ts.id_type_service}>
                                                {ts.libelle_type_service}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.id_type_service && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.id_type_service}</p>
                                    )}
                                </div>

                                {/* Département cible */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.department}</span>
                                        <span>Département cible *</span>
                                    </label>
                                    <select
                                        value={formData.id_departement}
                                        onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.id_departement ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        required
                                    >
                                        <option value="">Sélectionner un département</option>
                                        {departements.map(dept => (
                                            <option key={dept.id_departement} value={dept.id_departement}>
                                                {dept.nom_departement}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.id_departement && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.id_departement}</p>
                                    )}
                                </div>

                                {/* Priorité */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.priority}</span>
                                        <span>Priorité *</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.priorite}
                                        onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.priorite ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="1"
                                        required
                                    />
                                    {formErrors.priorite && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.priorite}</p>
                                    )}
                                    <p className="text-xs text-gray-500">Plus le chiffre est petit, plus la priorité est élevée</p>
                                </div>

                                {/* Statut actif */}
                                <div className="flex items-center space-x-3 bg-orange-50 p-4 rounded-xl border border-orange-200">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="actif" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                        Ciblage actif
                                    </label>
                                </div>

                                {/* 🔥 BOUTONS DU FORMULAIRE */}
                                <div className="flex space-x-4 pt-4">
                                    {/* Bouton Sauvegarder - ORANGE/ROUGE */}
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover-lift"
                                    >
                                        {editing ? 'Modifier' : 'Créer'}
                                    </button>
                                    {/* Bouton Annuler - GRIS NEUTRE */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({ id_type_visite: '', id_type_service: '', id_departement: '', priorite: 1, actif: true });
                                            setFormErrors({});
                                        }}
                                        className="flex-1 border-2 border-gray-400 text-gray-600 py-4 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-105 hover-lift"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Affichage des ciblages */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={`skeleton-${i}`} className="animate-pulse p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover-lift">
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
                ) : filteredCiblages.length > 0 ? (
                    /* Liste des ciblages */
                    <div className="space-y-4">
                        {filteredCiblages
                            .sort((a, b) => (a.priorite || 0) - (b.priorite || 0))
                            .map((ciblage) => {
                                const isIlluminated = illuminatedCiblages.has(ciblage.id_ciblage);

                                // Accès sécurisé aux propriétés
                                const typeVisite = ciblage.type_visite || ciblage.TypeVisite || {};
                                const typeService = ciblage.type_service || ciblage.TypeService || {};
                                const departement = ciblage.departement || ciblage.Departement || {};

                                // Classes CSS conditionnelles
                                let cardClass = "group p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover-lift ";

                                if (!ciblage.actif) {
                                    cardClass += "border-gray-300 bg-gradient-to-r from-gray-100 to-gray-200 opacity-75 hover:opacity-100";
                                } else if (isIlluminated) {
                                    cardClass += "border-orange-300 bg-gradient-to-r from-orange-100 to-red-100 animate-pulse hover:scale-105";
                                } else {
                                    cardClass += "border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 hover:scale-105";
                                }

                                return (
                                    <div key={ciblage.id_ciblage} className={cardClass}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-4">
                                                    {/* ICÔNE PRINCIPALE */}
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${ciblage.actif
                                                        ? 'bg-gradient-to-r from-orange-500 to-red-600'
                                                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                                        }`}>
                                                        <span className="text-white">
                                                            {ciblage.actif ? Icons.target : Icons.lock}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-bold text-gray-800 text-lg">
                                                                {typeVisite.libelle_type || 'Type visite inconnu'}
                                                            </h3>
                                                            {ciblage.actif ? (
                                                                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                                    Actif
                                                                </span>
                                                            ) : (
                                                                <span className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                                    Inactif
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-orange-600 font-semibold text-sm">
                                                            ID: {ciblage.id_ciblage} • Priorité: {ciblage.priorite}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Informations du ciblage */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg border border-orange-100">
                                                        <span className="text-orange-500">{Icons.service}</span>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase">Service</p>
                                                            <p className="font-bold text-gray-800 text-sm">
                                                                {typeService.libelle_type_service || 'Non défini'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start space-x-2 bg-white/50 p-3 rounded-lg border border-orange-100">
                                                        <span className="text-orange-500">{Icons.department}</span>
                                                        <div>
                                                            <p className="text-xs text-gray-500 uppercase">Département cible</p>
                                                            <p className="font-bold text-gray-800 text-sm">
                                                                {departement.nom_departement || 'Non défini'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🔥 BOUTONS D'ACTION */}
                                            <div className="flex space-x-3 ml-6">
                                                {/* Bouton Modifier */}
                                                <button
                                                    onClick={() => editCiblage(ciblage)}
                                                    className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover-lift"
                                                    title="Modifier"
                                                >
                                                    {Icons.edit}
                                                </button>

                                                {ciblage.actif ? (
                                                    /* Bouton Désactiver */
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCiblage(ciblage);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover-lift"
                                                        title="Désactiver"
                                                    >
                                                        {Icons.delete}
                                                    </button>
                                                ) : (
                                                    /* Bouton Réactiver */
                                                    <button
                                                        onClick={() => reactivateCiblage(ciblage.id_ciblage)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover-lift"
                                                        title="Réactiver"
                                                    >
                                                        {Icons.unlock}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    /* Message si aucun ciblage */
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 hover-lift">
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-6 flex justify-center">{Icons.empty}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {searchTerm || filterDepartement || filterActif ? "Aucun ciblage trouvé" : "Aucune règle de routage"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {searchTerm || filterDepartement || filterActif
                                    ? "Aucun ciblage ne correspond aux critères de recherche"
                                    : "Commencez par créer votre première règle de routage."
                                }
                            </p>
                            {!(searchTerm || filterDepartement || filterActif) && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg hover-lift"
                                >
                                    Créer une règle
                                </button>
                            )}
                            {(searchTerm || filterDepartement || filterActif) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterDepartement("");
                                        setFilterActif("");
                                    }}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg hover-lift"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal de confirmation suppression */}
                {showDeleteModal && selectedCiblage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border-2 border-orange-200 hover-lift">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                    {Icons.delete}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Désactiver la règle</h3>
                                <p className="text-gray-600">
                                    Êtes-vous sûr de vouloir désactiver cette règle de routage ?
                                </p>
                                <div className="mt-4 p-4 bg-orange-50 rounded-xl text-left text-sm space-y-1 border border-orange-200">
                                    <p><strong>Visite :</strong> {selectedCiblage.type_visite?.libelle_type}</p>
                                    <p><strong>Service :</strong> {selectedCiblage.type_service?.libelle_type_service}</p>
                                    <p><strong>Département :</strong> {selectedCiblage.departement?.nom_departement}</p>
                                    <p><strong>Priorité :</strong> {selectedCiblage.priorite}</p>
                                    <p><strong>Statut :</strong> {selectedCiblage.actif ? 'Actif' : 'Inactif'}</p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                {/* Bouton Annuler */}
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 border-2 border-gray-400 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-105 hover-lift"
                                >
                                    Annuler
                                </button>
                                {/* Bouton Désactiver */}
                                <button
                                    onClick={() => deleteCiblage(selectedCiblage.id_ciblage)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 hover-lift"
                                >
                                    {Icons.delete}
                                    <span>Désactiver</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GestionCiblages;