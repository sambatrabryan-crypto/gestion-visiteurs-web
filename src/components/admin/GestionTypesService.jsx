// frontend/src/components/admin/GestionTypesService.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";

function GestionTypesService({ apiCall, showAlert }) {
    const [typesService, setTypesService] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReactiverModal, setShowReactiverModal] = useState(false); // ✅ Nouveau
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        libelle_type_service: '',
        description: '',
        actif: true
    });
    const [formErrors, setFormErrors] = useState({});
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterActif, setFilterActif] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [illuminatedTypes, setIlluminatedTypes] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // 🎨 ICÔNES SVG
    const Icons = {
        service: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
        // ✅ Icône réactiver
        reactiver: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        text: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
        ),
        description: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
        ),
        filter: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
        ),
        empty: (
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        tools: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        checkCircle: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        exclamation: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        )
    };

    // 🎨 STYLES CSS
    const styles = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
            from { transform: translateX(-30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-slideIn { animation: slideIn 0.8s ease-out; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out; }
        .border-glow-orange {
            box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3);
            transition: all 0.3s ease;
        }
        .border-glow-orange:hover {
            box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.6), 0 0 30px rgba(249, 115, 22, 0.4);
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
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .hover-lift {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .card-inactif {
            opacity: 0.75;
            background: linear-gradient(to right, #f9fafb, #f3f4f6) !important;
            border-color: #d1d5db !important;
        }
    `;

    // 🎨 TOAST MODERNE
    const ModernToast = () => {
        if (!toast.show) return null;
        const toastConfig = {
            success: {
                bg: "bg-gradient-to-r from-green-500 to-emerald-600",
                icon: Icons.checkCircle,
                border: "border-l-4 border-emerald-400"
            },
            error: {
                bg: "bg-gradient-to-r from-red-500 to-red-700",
                icon: Icons.exclamation,
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
                            {Icons.close}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    }, []);

    const illuminateType = useCallback((typeId) => {
        if (illuminationTimeoutRef.current[typeId]) {
            clearTimeout(illuminationTimeoutRef.current[typeId]);
        }
        setIlluminatedTypes(prev => new Set([...prev, typeId]));
        illuminationTimeoutRef.current[typeId] = setTimeout(() => {
            setIlluminatedTypes(prev => {
                const newSet = new Set(prev);
                newSet.delete(typeId);
                return newSet;
            });
        }, 3000);
    }, []);

    // 🔄 CHARGEMENT DES DONNÉES
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiCall('/types-service');
            const processedTypes = Array.isArray(response)
                ? response
                : (response.data || response.typesService || []);
            setTypesService(processedTypes);
        } catch (error) {
            console.error("❌ Erreur chargement données:", error);
            showToast("Impossible de charger les types de service: " + error.message, "error");
            setTypesService([]);
        } finally {
            setLoading(false);
        }
    }, [apiCall, showToast]);

    useEffect(() => {
        fetchData();
        return () => {
            const timeouts = { ...illuminationTimeoutRef.current };
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
        };
    }, [fetchData]);

    const validateForm = () => {
        const errors = {};
        if (!formData.libelle_type_service || !formData.libelle_type_service.trim()) {
            errors.libelle_type_service = "Le libellé est obligatoire";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Filtrer les types de service
    const filteredTypes = typesService.filter(type => {
        const matchSearch =
            (type.libelle_type_service?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (type.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (type.id_type_service?.toString() || '').includes(searchTerm);

        const matchActif = filterActif === "" ||
            (filterActif === "true" ? type.actif === true : type.actif === false);

        return matchSearch && matchActif;
    });

    const refreshData = async () => {
        await fetchData();
        showToast("Données actualisées avec succès", "success");
    };

    // Sauvegarder (créer ou modifier)
    const saveTypeService = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast("Veuillez corriger les erreurs dans le formulaire", "error");
            return;
        }
        try {
            const dataToSend = {
                libelle_type_service: formData.libelle_type_service.trim(),
                description: formData.description?.trim() || null,
                actif: formData.actif
            };

            let result;
            if (editing) {
                result = await apiCall(`/types-service/${editing.id_type_service}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend)
                });
                await fetchData();
                illuminateType(editing.id_type_service);
            } else {
                result = await apiCall('/types-service', {
                    method: 'POST',
                    body: JSON.stringify(dataToSend)
                });
                await fetchData();
                const newType = result.typeService || result.data || result;
                if (newType?.id_type_service) {
                    illuminateType(newType.id_type_service);
                }
            }

            setShowForm(false);
            setEditing(null);
            setFormData({ libelle_type_service: '', description: '', actif: true });
            setFormErrors({});
            showToast(
                editing ? "Type de service modifié avec succès !" : "Type de service créé avec succès !",
                "success"
            );
        } catch (error) {
            console.error("❌ Erreur sauvegarde:", error);
            showToast("Erreur: " + (error.message || "Erreur inconnue"), "error");
        }
    };

    // Désactiver (soft delete)
    const deleteTypeService = async (id) => {
        try {
            await apiCall(`/types-service/${id}`, { method: 'DELETE' });
            await fetchData();
            setShowDeleteModal(false);
            setSelectedType(null);
            showToast("Type de service désactivé avec succès !", "success");
        } catch (error) {
            console.error("❌ Erreur suppression:", error);
            showToast("Erreur: " + error.message, "error");
        }
    };

    // ✅ Réactiver un type de service inactif
    const reactiverTypeService = async (id) => {
        try {
            await apiCall(`/types-service/${id}/reactiver`, { method: 'PATCH' });
            await fetchData();
            setShowReactiverModal(false);
            setSelectedType(null);
            illuminateType(id);
            showToast("Type de service réactivé avec succès !", "success");
        } catch (error) {
            console.error("❌ Erreur réactivation:", error);
            showToast("Erreur: " + error.message, "error");
        }
    };

    const editTypeService = (type) => {
        setFormData({
            libelle_type_service: type.libelle_type_service || '',
            description: type.description || '',
            actif: type.actif !== false
        });
        setEditing(type);
        setFormErrors({});
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <style>{styles}</style>
            <div className="max-w-7xl mx-auto px-4">

                <ModernToast />

                {/* 🔥 SECTION RECHERCHE */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-6 hover-lift">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative md:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-500">
                                    {Icons.search}
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300"
                                    placeholder="Rechercher un type de service..."
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

                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-orange-600 font-medium">
                                {searchTerm || filterActif ? (
                                    <>{filteredTypes.length} type{filteredTypes.length > 1 ? 's' : ''} trouvé{filteredTypes.length > 1 ? 's' : ''}</>
                                ) : (
                                    <>{filteredTypes.length} type{filteredTypes.length > 1 ? 's' : ''} au total</>
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

                {/* 🔥 BOUTON AJOUT FLOTTANT */}
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormData({ libelle_type_service: '', description: '', actif: true });
                        setFormErrors({});
                        setShowForm(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl hover-lift"
                    title="Ajouter un type de service"
                >
                    {Icons.add}
                </button>

                {/* Modal formulaire */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-3xl max-w-md w-full mx-auto shadow-2xl border-2 border-orange-200 my-8 hover-lift">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">
                                        {editing ? 'Modifier' : 'Nouveau'} Type de Service
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({ libelle_type_service: '', description: '', actif: true });
                                            setFormErrors({});
                                        }}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                    >
                                        {Icons.close}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveTypeService} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.text}</span>
                                        <span>Libellé *</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.libelle_type_service}
                                        onChange={(e) => setFormData({ ...formData, libelle_type_service: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.libelle_type_service ? 'border-red-500 bg-red-50' : 'border-orange-200'}`}
                                        placeholder="Ex: Installation, Maintenance, Dépannage"
                                        required
                                        autoFocus
                                    />
                                    {formErrors.libelle_type_service && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.libelle_type_service}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 flex items-center space-x-2">
                                        <span className="text-orange-500">{Icons.description}</span>
                                        <span>Description (optionnelle)</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 resize-none"
                                        placeholder="Décrivez ce type de service..."
                                        rows="4"
                                    />
                                </div>

                                <div className="flex items-center space-x-3 bg-orange-50 p-4 rounded-xl border border-orange-200">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="actif" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                        Type de service actif
                                    </label>
                                </div>

                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover-lift"
                                    >
                                        {editing ? 'Modifier' : 'Créer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({ libelle_type_service: '', description: '', actif: true });
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

                {/* Affichage des types de service */}
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
                ) : filteredTypes.length > 0 ? (
                    <div className="space-y-4">
                        {filteredTypes
                            .sort((a, b) => (a.libelle_type_service || '').localeCompare(b.libelle_type_service || ''))
                            .map((type) => {
                                const isIlluminated = illuminatedTypes.has(type.id_type_service);
                                const cardClass = isIlluminated
                                    ? "group p-6 border-2 border-orange-300 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse hover-lift"
                                    : type.actif
                                        ? "group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg hover-lift"
                                        : "group p-6 border-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover-lift card-inactif"; // ✅ Style différent pour inactifs

                                return (
                                    <div key={type.id_type_service} className={cardClass}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-3">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ${type.actif ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                                                        <span className="text-white">{Icons.tools}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-bold text-gray-800 text-lg">
                                                                {type.libelle_type_service}
                                                            </h3>
                                                            {type.actif ? (
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
                                                            ID: {type.id_type_service}
                                                        </p>
                                                    </div>
                                                </div>

                                                {type.description && (
                                                    <div className="bg-white/50 p-3 rounded-lg border border-orange-100">
                                                        <p className="text-xs text-gray-500 uppercase mb-1">Description</p>
                                                        <p className="text-gray-700 text-sm">{type.description}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 🔥 BOUTONS D'ACTION — adaptés selon actif/inactif */}
                                            <div className="flex space-x-3 ml-6">
                                                {/* Bouton Modifier - toujours visible */}
                                                <button
                                                    onClick={() => editTypeService(type)}
                                                    className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover-lift"
                                                    title="Modifier"
                                                >
                                                    {Icons.edit}
                                                </button>

                                                {type.actif ? (
                                                    // ✅ Si actif → bouton Désactiver (rouge)
                                                    <button
                                                        onClick={() => {
                                                            setSelectedType(type);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover-lift"
                                                        title="Désactiver"
                                                    >
                                                        {Icons.delete}
                                                    </button>
                                                ) : (
                                                    // ✅ Si inactif → bouton Réactiver (vert)
                                                    <button
                                                        onClick={() => {
                                                            setSelectedType(type);
                                                            setShowReactiverModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover-lift"
                                                        title="Réactiver"
                                                    >
                                                        {Icons.reactiver}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 hover-lift">
                        <div className="text-center py-16">
                            <div className="text-gray-400 mb-6 flex justify-center">{Icons.empty}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {searchTerm || filterActif ? "Aucun type de service trouvé" : "Aucun type de service"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {searchTerm || filterActif
                                    ? "Aucun type de service ne correspond aux critères de recherche"
                                    : "Commencez par créer votre premier type de service."}
                            </p>
                            {!(searchTerm || filterActif) && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg hover-lift"
                                >
                                    Créer un type de service
                                </button>
                            )}
                            {(searchTerm || filterActif) && (
                                <button
                                    onClick={() => { setSearchTerm(""); setFilterActif(""); }}
                                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-xl hover:from-gray-600 hover:to-gray-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg hover-lift"
                                >
                                    Réinitialiser les filtres
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal confirmation désactivation */}
                {showDeleteModal && selectedType && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border-2 border-orange-200 hover-lift">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                    {Icons.delete}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Désactiver le type de service</h3>
                                <p className="text-gray-600">Êtes-vous sûr de vouloir désactiver ce type de service ?</p>
                                <div className="mt-4 p-4 bg-orange-50 rounded-xl text-left text-sm space-y-1 border border-orange-200">
                                    <p><strong>Libellé :</strong> {selectedType.libelle_type_service}</p>
                                    {selectedType.description && (
                                        <p><strong>Description :</strong> {selectedType.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => { setShowDeleteModal(false); setSelectedType(null); }}
                                    className="flex-1 border-2 border-gray-400 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-105 hover-lift"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => deleteTypeService(selectedType.id_type_service)}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 hover-lift"
                                >
                                    {Icons.delete}
                                    <span>Désactiver</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Modal confirmation réactivation */}
                {showReactiverModal && selectedType && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border-2 border-green-200 hover-lift">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                    {Icons.reactiver}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Réactiver le type de service</h3>
                                <p className="text-gray-600">Souhaitez-vous réactiver ce type de service ?</p>
                                <div className="mt-4 p-4 bg-green-50 rounded-xl text-left text-sm space-y-1 border border-green-200">
                                    <p><strong>Libellé :</strong> {selectedType.libelle_type_service}</p>
                                    {selectedType.description && (
                                        <p><strong>Description :</strong> {selectedType.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => { setShowReactiverModal(false); setSelectedType(null); }}
                                    className="flex-1 border-2 border-gray-400 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-105 hover-lift"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => reactiverTypeService(selectedType.id_type_service)}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 hover-lift"
                                >
                                    {Icons.reactiver}
                                    <span>Réactiver</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default GestionTypesService;