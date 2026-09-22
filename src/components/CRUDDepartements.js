import React, { useEffect, useState, useCallback, useRef } from "react";

function ListeDepartements({ onNavigate, apiCall, showAlert }) {
    const [departements, setDepartements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartement, setSelectedDepartement] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nom_departement: '' });
    const [formErrors, setFormErrors] = useState({});
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [illuminatedDepartements, setIlluminatedDepartements] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // 🔥 ICÔNES SVG MODERNES COHÉRENTES
    const Icons = {
        // Header et navigation
        departements: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
        building: (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        id: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
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
        buildingEmpty: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
    const illuminateDepartement = useCallback((departementId) => {
        if (illuminationTimeoutRef.current[departementId]) {
            clearTimeout(illuminationTimeoutRef.current[departementId]);
        }

        setIlluminatedDepartements(prev => new Set([...prev, departementId]));

        illuminationTimeoutRef.current[departementId] = setTimeout(() => {
            setIlluminatedDepartements(prev => {
                const newSet = new Set(prev);
                newSet.delete(departementId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔄 CHARGEMENT DES DONNÉES AVEC USECALLBACK
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log("🔄 Chargement des départements...");

            const data = await apiCall("/departements");

            // Gestion robuste des données
            const processData = (data, fallback = []) => {
                if (Array.isArray(data)) return data;
                if (data && data.data && Array.isArray(data.data)) return data.data;
                return fallback;
            };

            setDepartements(processData(data, []));

        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            showToast("Impossible de charger les départements: " + error.message, "error");
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

        if (!formData.nom_departement.trim()) {
            errors.nom_departement = "Le nom du département est obligatoire";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Filtrer les départements selon la recherche
    const filteredDepartements = departements.filter(departement =>
        (departement.nom_departement?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (departement.id_departement?.toString() || '').includes(searchTerm)
    );

    // Fonction pour rafraîchir les données
    const refreshData = async () => {
        await fetchData();
        showToast("Données actualisées avec succès", "success");
    };

    // Créer ou modifier un département
    const saveDepartement = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Veuillez corriger les erreurs dans le formulaire", "error");
            return;
        }

        try {
            const url = editing
                ? `/departements/${editing.id_departement}`
                : '/departements';

            const method = editing ? 'PUT' : 'POST';

            console.log(`💾 ${editing ? 'Modification' : 'Création'} département:`, formData);

            const result = await apiCall(url, {
                method,
                body: JSON.stringify(formData)
            });

            // Mettre à jour localement
            if (editing) {
                setDepartements(prev =>
                    prev.map(d => d.id_departement === editing.id_departement ? result.departement || result : d)
                );
                illuminateDepartement(editing.id_departement);
            } else {
                setDepartements(prev => [...prev, result.departement || result]);
            }

            setShowForm(false);
            setEditing(null);
            setFormData({ nom_departement: '' });
            setFormErrors({});

            showToast(
                editing
                    ? `Département "${formData.nom_departement}" modifié avec succès !`
                    : `Département "${formData.nom_departement}" créé avec succès !`,
                "success"
            );
        } catch (error) {
            console.error("❌ Erreur sauvegarde:", error);
            showToast("Erreur lors de la sauvegarde: " + error.message, "error");
        }
    };

    // Supprimer un département
    const deleteDepartement = async (id) => {
        try {
            const departementName = selectedDepartement.nom_departement;

            await apiCall(`/departements/${id}`, {
                method: 'DELETE'
            });

            // Mettre à jour localement
            setDepartements(departements.filter(d => d.id_departement !== id));
            setShowDeleteModal(false);
            setSelectedDepartement(null);

            showToast(`Département "${departementName}" supprimé avec succès !`, "success");
        } catch (error) {
            console.error("❌ Erreur suppression:", error);
            showToast("Erreur lors de la suppression: " + error.message, "error");
        }
    };

    const editDepartement = (departement) => {
        setFormData({
            nom_departement: departement.nom_departement || ''
        });
        setEditing(departement);
        setFormErrors({});
        setShowForm(true);
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
                                <div className="text-2xl">{Icons.departements}</div>
                                <div className="text-sm">DÉPARTEMENTS</div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Gestion des Départements
                            </h1>
                            <p className="text-gray-600 mt-1">Organisez la structure de votre entreprise •
                                <span className="text-green-600 font-semibold ml-2">
                                    {departements.length} département{departements.length > 1 ? 's' : ''}
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
                                    placeholder="Rechercher par nom ou ID de département..."
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
                                <>{filteredDepartements.length} département{filteredDepartements.length > 1 ? 's' : ''} trouvé{filteredDepartements.length > 1 ? 's' : ''} pour "{searchTerm}"</>
                            ) : (
                                <>{filteredDepartements.length} département{filteredDepartements.length > 1 ? 's' : ''} au total</>
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
                        setFormData({ nom_departement: '' });
                        setFormErrors({});
                        setShowForm(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl"
                    title="Ajouter un département"
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
                                        {editing ? 'Modifier' : 'Nouveau'} Département
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({ nom_departement: '' });
                                            setFormErrors({});
                                        }}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                    >
                                        {Icons.close}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveDepartement} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Nom du département *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nom_departement}
                                        onChange={(e) => setFormData({ ...formData, nom_departement: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.nom_departement ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        placeholder="Nom du département"
                                        required
                                        autoFocus
                                    />
                                    {formErrors.nom_departement && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.nom_departement}</p>
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
                                            setFormData({ nom_departement: '' });
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

                {/* Affichage des départements */}
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
                ) : departements.length > 0 ? (
                    /* Liste des départements */
                    <div className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                        {Icons.building}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Tous les départements</h2>
                                        <p className="text-orange-100 font-medium">
                                            {filteredDepartements.length} département{filteredDepartements.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                                        {filteredDepartements.length} département{filteredDepartements.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid gap-4">
                                {filteredDepartements
                                    .sort((a, b) => (a.id_departement || 0) - (b.id_departement || 0))
                                    .map((departement) => {
                                        const isIlluminated = illuminatedDepartements.has(departement.id_departement);
                                        const cardClass = isIlluminated
                                            ? "group p-6 border-2 border-orange-300 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse"
                                            : "group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg";

                                        return (
                                            <div key={departement.id_departement} className={cardClass}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-4 mb-4">
                                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform bg-gradient-to-r from-orange-500 to-red-600">
                                                                <span className="text-white font-bold text-lg">
                                                                    #{departement.id_departement}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-800 text-xl">
                                                                    {departement.nom_departement}
                                                                </h3>
                                                                <p className="text-orange-600 font-semibold text-lg flex items-center">
                                                                    {Icons.id}
                                                                    <span className="ml-2">ID: {departement.id_departement}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Boutons d'action */}
                                                    <div className="flex space-x-3 ml-6">
                                                        <button
                                                            onClick={() => editDepartement(departement)}
                                                            className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                                                            title="Modifier"
                                                        >
                                                            {Icons.edit}
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedDepartement(departement);
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
                ) : (
                    /* Message si aucun département */
                    <div className="bg-white rounded-2xl shadow-xl border border-orange-200">
                        <div className="text-center py-16">
                            <div className="text-8xl mb-6">{Icons.buildingEmpty}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {searchTerm ? "Aucun département trouvé" : "Aucun département"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {searchTerm
                                    ? `Aucun département ne correspond à "${searchTerm}"`
                                    : "Commencez par créer votre premier département."
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                >
                                    Créer un département
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
                {showDeleteModal && selectedDepartement && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {Icons.delete}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
                                <p className="text-gray-600">
                                    Êtes-vous sûr de vouloir supprimer le département{" "}
                                    <strong className="text-red-600">
                                        {selectedDepartement.nom_departement}
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
                                    onClick={() => deleteDepartement(selectedDepartement.id_departement)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    {Icons.delete}
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ListeDepartements;