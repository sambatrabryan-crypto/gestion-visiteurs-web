import React, { useEffect, useState, useCallback, useRef } from 'react';

function CRUDEmployes({ onNavigate, apiCall, showAlert }) {
    const [employes, setEmployes] = useState([]);
    const [departements, setDepartements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmploye, setSelectedEmploye] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nom_employe: '',
        prenom_employe: '',
        poste: '',
        telephone: '',
        email: '',
        id_departement: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [illuminatedEmployes, setIlluminatedEmployes] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // 🔥 ICÔNES SVG MODERNES COHÉRENTES
    const Icons = {
        // Header et navigation
        employes: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
        delete: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        building: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        position: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
        usersEmpty: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
    const illuminateEmploye = useCallback((employeId) => {
        if (illuminationTimeoutRef.current[employeId]) {
            clearTimeout(illuminationTimeoutRef.current[employeId]);
        }

        setIlluminatedEmployes(prev => new Set([...prev, employeId]));

        illuminationTimeoutRef.current[employeId] = setTimeout(() => {
            setIlluminatedEmployes(prev => {
                const newSet = new Set(prev);
                newSet.delete(employeId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔄 CHARGEMENT DES DONNÉES AVEC USECALLBACK
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log("🔄 Chargement des employés et départements...");

            let employesData = [];
            let departementsData = [];

            try {
                employesData = await apiCall("/employes");
                console.log("✅ Données employés reçues:", employesData);
            } catch (employeError) {
                console.error("❌ Erreur récupération employés:", employeError);
                showToast("Erreur lors du chargement des employés", "error");
            }

            try {
                departementsData = await apiCall("/departements");
                console.log("✅ Données départements reçues:", departementsData);
            } catch (departementError) {
                console.error("❌ Erreur récupération départements:", departementError);
                showToast("Erreur lors du chargement des départements", "error");
            }

            // Gestion robuste des données
            const processData = (data, fallback = []) => {
                if (Array.isArray(data)) return data;
                if (data && data.data && Array.isArray(data.data)) return data.data;
                return fallback;
            };

            setEmployes(processData(employesData, []));
            setDepartements(processData(departementsData, []));

        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            showToast("Impossible de charger les données: " + error.message, "error");
            setEmployes([]);
            setDepartements([]);
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

    // Valider le formulaire
    const validateForm = () => {
        const errors = {};

        if (!formData.nom_employe.trim()) errors.nom_employe = "Le nom est obligatoire";
        if (!formData.prenom_employe.trim()) errors.prenom_employe = "Le prénom est obligatoire";
        if (!formData.poste.trim()) errors.poste = "Le poste est obligatoire";
        if (!formData.telephone.trim()) errors.telephone = "Le téléphone est obligatoire";
        if (!formData.email.trim()) errors.email = "L'email est obligatoire";
        if (!formData.id_departement) errors.id_departement = "Le département est obligatoire";

        // Validation email
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "L'email n'est pas valide";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Filtrer les employés selon la recherche
    const filteredEmployes = employes.filter(employe =>
        (employe.nom_employe?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employe.prenom_employe?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employe.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (employe.poste?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Fonction pour rafraîchir les données
    const refreshData = async () => {
        await fetchData();
        showToast("Données actualisées avec succès", "success");
    };

    // Créer ou modifier un employé
    const saveEmploye = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Veuillez corriger les erreurs dans le formulaire", "error");
            return;
        }

        try {
            const url = editing
                ? `/employes/${editing.id_employe}`
                : '/employes';

            const method = editing ? 'PUT' : 'POST';

            console.log(`💾 ${editing ? 'Modification' : 'Création'} employé:`, formData);

            await apiCall(url, {
                method,
                body: JSON.stringify(formData)
            });

            // Rafraîchir les données après création
            await refreshData();

            // Animation pour l'employé modifié/créé
            if (editing) {
                illuminateEmploye(editing.id_employe);
            }

            setShowForm(false);
            setEditing(null);
            setFormData({
                nom_employe: '',
                prenom_employe: '',
                poste: '',
                email: '',
                telephone: '',
                id_departement: ''
            });
            setFormErrors({});

            showToast(
                editing
                    ? `Employé "${formData.prenom_employe} ${formData.nom_employe}" modifié avec succès !`
                    : `Employé "${formData.prenom_employe} ${formData.nom_employe}" créé avec succès !`,
                "success"
            );
        } catch (error) {
            console.error("❌ Erreur sauvegarde:", error);
            showToast("Erreur lors de la sauvegarde: " + error.message, "error");
        }
    };

    // Supprimer un employé
    const deleteEmploye = async (id) => {
        try {
            const employeName = selectedEmploye.prenom_employe + " " + selectedEmploye.nom_employe;

            await apiCall(`/employes/${id}`, {
                method: 'DELETE'
            });

            // Mettre à jour localement sans recharger
            setEmployes(employes.filter(e => e.id_employe !== id));
            setShowDeleteModal(false);
            setSelectedEmploye(null);

            showToast(`Employé "${employeName}" supprimé avec succès !`, "success");
        } catch (error) {
            console.error("❌ Erreur suppression:", error);
            showToast("Erreur lors de la suppression: " + error.message, "error");
        }
    };

    const editEmploye = (employe) => {
        setFormData({
            nom_employe: employe.nom_employe || '',
            prenom_employe: employe.prenom_employe || '',
            poste: employe.poste || '',
            email: employe.email || '',
            telephone: employe.telephone || '',
            id_departement: employe.id_departement || ''
        });
        setEditing(employe);
        setFormErrors({});
        setShowForm(true);
    };

    // Fonction pour ouvrir les détails d'un employé
    const openDetails = (employe) => {
        setSelectedEmploye(employe);
        setShowDetailModal(true);
    };

    // Fonction pour obtenir le libellé du département
    const getLibelleDepartement = (idDepartement) => {
        if (!idDepartement) return "Non assigné";
        const departement = departements.find(dep => dep.id_departement === idDepartement);
        return departement ? departement.nom_departement : "Département inconnu";
    };

    // Grouper les employés par département
    const employesParDepartement = departements.map(departement => {
        const employesDuDepartement = filteredEmployes.filter(emp =>
            emp.id_departement === departement.id_departement
        );
        return {
            ...departement,
            employes: employesDuDepartement,
            count: employesDuDepartement.length
        };
    }).filter(dept => dept.count > 0);

    // Ajouter les employés non assignés
    const employesNonAssignes = filteredEmployes.filter(emp => !emp.id_departement);
    if (employesNonAssignes.length > 0) {
        employesParDepartement.push({
            id_departement: null,
            nom_departement: 'Non assigné',
            employes: employesNonAssignes,
            count: employesNonAssignes.length
        });
    }

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
                                <div className="text-2xl">{Icons.employes}</div>
                                <div className="text-sm">EMPLOYÉS</div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Gestion des Employés
                            </h1>
                            <p className="text-gray-600 mt-1">Gérez le personnel de votre entreprise •
                                <span className="text-green-600 font-semibold ml-2">
                                    {employes.length} employé{employes.length > 1 ? 's' : ''}
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
                                    placeholder="Rechercher par nom, prénom, poste ou email..."
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
                            <button
                                onClick={refreshData}
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
                                <>{filteredEmployes.length} employé{filteredEmployes.length > 1 ? 's' : ''} trouvé{filteredEmployes.length > 1 ? 's' : ''} pour "{searchTerm}"</>
                            ) : (
                                <>{filteredEmployes.length} employé{filteredEmployes.length > 1 ? 's' : ''} au total</>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                        </div>
                    </div>
                </div>

                {/* Bouton d'ajout flottant */}
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({
                            nom_employe: '',
                            prenom_employe: '',
                            poste: '',
                            email: '',
                            telephone: '',
                            id_departement: ''
                        });
                        setFormErrors({});
                        setShowForm(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl"
                    title="Ajouter un employé"
                >
                    {Icons.add}
                </button>

                {/* Modal pour le formulaire d'ajout/modification */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">
                                        {editing ? 'Modifier' : 'Nouvel'} Employé
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({
                                                nom_employe: '',
                                                prenom_employe: '',
                                                poste: '',
                                                email: '',
                                                telephone: '',
                                                id_departement: ''
                                            });
                                            setFormErrors({});
                                        }}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                    >
                                        {Icons.close}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveEmploye} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom_employe}
                                        onChange={(e) => setFormData({ ...formData, nom_employe: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.nom_employe ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="Nom"
                                        required
                                        autoFocus
                                    />
                                    {formErrors.nom_employe && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.nom_employe}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Prénom *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prenom_employe}
                                        onChange={(e) => setFormData({ ...formData, prenom_employe: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.prenom_employe ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="Prénom"
                                        required
                                    />
                                    {formErrors.prenom_employe && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.prenom_employe}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Poste *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.poste}
                                        onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.poste ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="Poste occupé"
                                        required
                                    />
                                    {formErrors.poste && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.poste}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="email@exemple.com"
                                        required
                                    />
                                    {formErrors.email && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Téléphone *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telephone}
                                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.telephone ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="+33 1 23 45 67 89"
                                        required
                                    />
                                    {formErrors.telephone && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.telephone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Département *
                                    </label>
                                    <select
                                        value={formData.id_departement}
                                        onChange={(e) => setFormData({ ...formData, id_departement: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 bg-white ${formErrors.id_departement ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        required
                                    >
                                        <option value="">Sélectionnez un département</option>
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

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                                    >
                                        {editing ? 'Modifier' : 'Créer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({
                                                nom_employe: '',
                                                prenom_employe: '',
                                                poste: '',
                                                email: '',
                                                telephone: '',
                                                id_departement: ''
                                            });
                                            setFormErrors({});
                                        }}
                                        className="flex-1 border-2 border-orange-500 text-orange-600 py-4 rounded-xl hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Affichage des employés */}
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
                ) : employes.length > 0 ? (
                    /* Liste des employés groupés par département */
                    <div className="space-y-8">
                        {employesParDepartement.map((departement) => (
                            <div key={departement.id_departement || 'non-assigne'} className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                                {/* En-tête du département */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                                {Icons.building}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{departement.nom_departement}</h2>
                                                <p className="text-orange-100 font-medium">
                                                    {departement.count} employé{departement.count > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                                                {departement.count} employé{departement.count > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Liste des employés du département */}
                                <div className="p-6">
                                    <div className="grid gap-4">
                                        {departement.employes.map((employe) => {
                                            const isIlluminated = illuminatedEmployes.has(employe.id_employe);
                                            const cardClass = isIlluminated
                                                ? "group p-6 border-2 border-orange-300 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse"
                                                : "group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg";

                                            return (
                                                <div key={employe.id_employe} className={cardClass}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-4 mb-4">
                                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform bg-gradient-to-r from-orange-500 to-red-600">
                                                                    <span className="text-white text-xl">{Icons.user}</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800 text-xl">
                                                                        {employe.prenom_employe} {employe.nom_employe}
                                                                    </h3>
                                                                    {employe.poste && (
                                                                        <p className="text-orange-600 font-semibold text-lg flex items-center">
                                                                            {Icons.position}
                                                                            <span className="ml-2">{employe.poste}</span>
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                                                                <div className="flex items-center">
                                                                    {Icons.email}
                                                                    <span className="ml-3">{employe.email || 'Non renseigné'}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    {Icons.phone}
                                                                    <span className="ml-3">{employe.telephone || 'Non renseigné'}</span>
                                                                </div>
                                                                <div className="flex items-center">
                                                                    {Icons.department}
                                                                    <span className="ml-3">{departement.nom_departement}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Boutons d'action */}
                                                        <div className="flex space-x-3 ml-6">
                                                            <button
                                                                onClick={() => openDetails(employe)}
                                                                className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                                title="Voir les détails"
                                                            >
                                                                {Icons.details}
                                                            </button>

                                                            <button
                                                                onClick={() => editEmploye(employe)}
                                                                className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                                title="Modifier"
                                                            >
                                                                {Icons.edit}
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelectedEmploye(employe);
                                                                    setShowDeleteModal(true);
                                                                }}
                                                                className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                                                title="Supprimer"
                                                            >
                                                                {Icons.delete}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Message si aucun employé */
                    <div className="bg-white rounded-2xl shadow-xl border border-orange-200">
                        <div className="text-center py-16">
                            <div className="text-8xl mb-6">{Icons.usersEmpty}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {searchTerm ? "Aucun employé trouvé" : "Aucun employé"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {searchTerm
                                    ? `Aucun employé ne correspond à "${searchTerm}"`
                                    : "Commencez par créer votre premier employé."
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                >
                                    Créer un employé
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
                    </div>
                )}

                {/* Modal de confirmation suppression */}
                {showDeleteModal && selectedEmploye && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {Icons.delete}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
                                <p className="text-gray-600">
                                    Êtes-vous sûr de vouloir supprimer l'employé{" "}
                                    <strong className="text-red-600">
                                        {selectedEmploye.prenom_employe} {selectedEmploye.nom_employe}
                                    </strong>{" "}
                                    ?
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-xl hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => deleteEmploye(selectedEmploye.id_employe)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    {Icons.delete}
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ MODAL DÉTAILS MODERNE */}
                {showDetailModal && selectedEmploye && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Détails de l'Employé</h2>
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
                                {/* Informations personnelles */}
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <span className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                            {Icons.user}
                                        </span>
                                        Informations Personnelles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                                <span className="text-gray-600 font-medium">ID Employé</span>
                                                <span className="font-bold text-orange-600">{selectedEmploye.id_employe}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                                <span className="text-gray-600 font-medium">Nom complet</span>
                                                <span className="font-bold text-gray-800">{selectedEmploye.prenom_employe} {selectedEmploye.nom_employe}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                                <span className="text-gray-600 font-medium">Email</span>
                                                <span className="font-bold text-gray-800">{selectedEmploye.email || 'Non renseigné'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                                <span className="text-gray-600 font-medium">Poste</span>
                                                <span className="font-bold text-orange-600">{selectedEmploye.poste || 'Non renseigné'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-orange-100">
                                                <span className="text-gray-600 font-medium">Téléphone</span>
                                                <span className="font-bold text-gray-800">{selectedEmploye.telephone || 'Non renseigné'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Informations du département */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                        <span className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 text-white">
                                            {Icons.building}
                                        </span>
                                        Département
                                    </h3>
                                    {selectedEmploye.id_departement ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-blue-100">
                                                <span className="text-gray-600 font-medium">ID Département</span>
                                                <span className="font-bold text-blue-600">{selectedEmploye.id_departement}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600 font-medium">Nom du département</span>
                                                <span className="font-bold text-gray-800">{getLibelleDepartement(selectedEmploye.id_departement)}</span>
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
                                        editEmploye(selectedEmploye);
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
        </div>
    );
}

export default CRUDEmployes;