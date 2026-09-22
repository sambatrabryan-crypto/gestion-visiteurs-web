import React, { useEffect, useState, useCallback, useRef } from "react";

function GestionUtilisateurs({ apiCall, showAlert }) {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [utilisateursEnAttente, setUtilisateursEnAttente] = useState([]);
    const [employes, setEmployes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationAction, setValidationAction] = useState(null);
    const [selectedUserForValidation, setSelectedUserForValidation] = useState(null);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: '',
        role: 'utilisateur',
        id_employe: ''
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [illuminatedUsers, setIlluminatedUsers] = useState(new Set());
    const illuminationTimeoutRef = useRef({});

    // 🔥 ICÔNES SVG MODERNES COHÉRENTES
    const Icons = {
        // Header et navigation
        users: (
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
        validate: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        suspend: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        user: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        email: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        lock: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        pending: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    // Animation d'illumination
    const illuminateUser = useCallback((userId) => {
        if (illuminationTimeoutRef.current[userId]) {
            clearTimeout(illuminationTimeoutRef.current[userId]);
        }

        setIlluminatedUsers(prev => new Set([...prev, userId]));

        illuminationTimeoutRef.current[userId] = setTimeout(() => {
            setIlluminatedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }, 3000);
    }, []);

    // Charger les données
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            const usersResponse = await apiCall('utilisateurs');
            setUtilisateurs(Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []));

            try {
                const pendingResponse = await apiCall('utilisateurs/en-attente');
                setUtilisateursEnAttente(Array.isArray(pendingResponse) ? pendingResponse : (pendingResponse.data || []));
                console.log('📋 Comptes en attente:', Array.isArray(pendingResponse) ? pendingResponse.length : (pendingResponse.data || []).length);
            } catch (err) {
                console.warn('Pas de comptes en attente');
                setUtilisateursEnAttente([]);
            }

            const employesResponse = await apiCall('employes');
            setEmployes(Array.isArray(employesResponse) ? employesResponse : (employesResponse.data || []));

        } catch (error) {
            console.error("Erreur:", error);
            showAlert?.("Erreur de chargement", "error");
        } finally {
            setLoading(false);
        }
    }, [apiCall, showAlert]);

    useEffect(() => {
        fetchData();

        return () => {
            const timeouts = { ...illuminationTimeoutRef.current };
            Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
        };
    }, [fetchData]);

    // Valider un compte
    const validerCompte = async (userId) => {
        try {
            await apiCall(`utilisateurs/${userId}/valider`, { method: 'PATCH' });
            await fetchData();
            setShowValidationModal(false);
            showAlert?.("Compte validé avec succès !", "success");
            illuminateUser(userId);
        } catch (error) {
            showAlert?.("Erreur: " + error.message, "error");
        }
    };

    // Suspendre un compte
    const suspendreCompte = async (userId) => {
        try {
            await apiCall(`utilisateurs/${userId}/suspendre`, { method: 'PATCH' });
            await fetchData();
            setShowValidationModal(false);
            showAlert?.("Compte suspendu avec succès !", "success");
            illuminateUser(userId);
        } catch (error) {
            showAlert?.("Erreur: " + error.message, "error");
        }
    };

    // Modifier un utilisateur (SEULEMENT LE RÔLE)
    const editUser = (user) => {
        setFormData({
            email: user.email || '',
            mot_de_passe: '',
            role: user.role || 'utilisateur',
            id_employe: user.id_employe?.toString() || ''
        });
        setEditing(user);
        setShowForm(true);
    };

    // Valider le formulaire (SEULEMENT POUR LE RÔLE)
    const validateForm = () => {
        const errors = {};

        if (!formData.email.trim()) errors.email = "L'email est obligatoire";
        if (!formData.role) errors.role = "Le rôle est obligatoire";

        // Validation email
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "L'email n'est pas valide";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Créer ou modifier un utilisateur
    const saveUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showAlert?.("Veuillez corriger les erreurs dans le formulaire", "error");
            return;
        }

        try {
            const requestData = {
                email: formData.email,
                role: formData.role,
                id_employe: formData.id_employe ? parseInt(formData.id_employe) : null
            };

            // Ajouter le mot de passe seulement s'il est fourni
            if (formData.mot_de_passe) {
                requestData.mot_de_passe = formData.mot_de_passe;
            }

            if (editing) {
                // Pour la modification, on envoie seulement le rôle
                await apiCall(`utilisateurs/${editing.id_utilisateur}`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: formData.role })
                });
                showAlert?.("Utilisateur modifié avec succès !", "success");
                illuminateUser(editing.id_utilisateur);
            } else {
                // Pour la création, mot de passe obligatoire
                if (!formData.mot_de_passe) {
                    showAlert?.("Le mot de passe est requis pour la création", "error");
                    return;
                }

                await apiCall('utilisateurs/register', {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                });
                showAlert?.("Utilisateur créé avec succès !", "success");
            }

            await fetchData();
            setShowForm(false);
            setEditing(null);
            setFormData({ email: '', mot_de_passe: '', role: 'utilisateur', id_employe: '' });
            setFormErrors({});
        } catch (error) {
            showAlert?.("Erreur: " + error.message, "error");
        }
    };

    // Supprimer un utilisateur
    const deleteUser = async () => {
        try {
            await apiCall(`utilisateurs/${userToDelete.id_utilisateur}`, { method: 'DELETE' });
            await fetchData();
            setShowDeleteModal(false);
            showAlert?.(`Utilisateur "${userToDelete.email}" supprimé avec succès`, "success");
        } catch (error) {
            showAlert?.("Erreur: " + error.message, "error");
        }
    };

    // Fonction pour ouvrir la modal de suppression
    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    // Employés disponibles (sans compte)
    const employesDisponibles = employes.filter(emp =>
        !utilisateurs.some(u => u.id_employe === emp.id_employe && (!editing || u.id_utilisateur !== editing.id_utilisateur)) &&
        !utilisateursEnAttente.some(u => u.id_employe === emp.id_employe)
    );

    // Filtrer utilisateurs
    const filteredUsers = utilisateurs.filter(user => {
        const matchSearch = (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.employe?.nom_employe?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchRole = !filterRole || user.role === filterRole;
        return matchSearch && matchRole;
    });

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-red-600',
            utilisateur: 'bg-blue-600',
            acceuil: 'bg-green-600',
            kiosque: 'bg-purple-600'
        };
        return colors[role] || 'bg-gray-600';
    };

    const getStatusBadge = (status) => {
        const styles = {
            actif: 'bg-green-100 text-green-800 border border-green-200',
            suspendu: 'bg-red-100 text-red-800 border border-red-200',
            en_attente: 'bg-orange-100 text-orange-800 border border-orange-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
    };

    // Fonction pour rafraîchir les données
    const refreshData = async () => {
        await fetchData();
        showAlert?.("Données actualisées avec succès", "success");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center py-12">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl shadow-2xl">
                            <div className="text-center font-bold">
                                <div className="text-2xl">{Icons.users}</div>
                                <div className="text-sm">UTILISATEURS</div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Gestion des Utilisateurs
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Gérez les accès et permissions de votre entreprise •
                                <span className="text-green-600 font-semibold ml-2">
                                    {utilisateurs.length} utilisateur{utilisateurs.length > 1 ? 's' : ''} actif{utilisateurs.length > 1 ? 's' : ''}
                                </span>
                                {utilisateursEnAttente.length > 0 && (
                                    <span className="text-orange-600 font-semibold ml-2">
                                        • {utilisateursEnAttente.length} en attente
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* SECTION COMPTES EN ATTENTE */}
                {utilisateursEnAttente.length > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl shadow-xl p-6 mb-8 animate-pulse">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center">
                                    {Icons.pending}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-orange-900">
                                        ⏳ Comptes en attente de validation
                                    </h2>
                                    <p className="text-orange-700 font-medium">
                                        {utilisateursEnAttente.length} compte{utilisateursEnAttente.length > 1 ? 's' : ''} à traiter
                                    </p>
                                </div>
                            </div>
                            <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                {utilisateursEnAttente.length} EN ATTENTE
                            </span>
                        </div>

                        <div className="space-y-4">
                            {utilisateursEnAttente.map((user) => {
                                const isIlluminated = illuminatedUsers.has(user.id_utilisateur);
                                return (
                                    <div
                                        key={user.id_utilisateur}
                                        className={`bg-white border-2 border-orange-200 rounded-xl p-6 shadow-lg ${isIlluminated ? 'animate-pulse ring-2 ring-orange-400' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 flex items-center justify-center">
                                                        {Icons.email}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-lg text-gray-900">
                                                                {user.email}
                                                            </span>
                                                            <span className={`${getRoleBadge(user.role)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Créé le: {new Date(user.createdAt).toLocaleString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {user.employe && (
                                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                                                                {Icons.user}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {user.employe.prenom_employe} {user.employe.nom_employe}
                                                                </p>
                                                                {user.employe.poste && (
                                                                    <p className="text-sm text-gray-600">💼 {user.employe.poste}</p>
                                                                )}
                                                                {user.employe.departement && (
                                                                    <p className="text-sm text-gray-600">🏢 {user.employe.departement.nom_departement}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-3 ml-6">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUserForValidation(user);
                                                        setValidationAction('valider');
                                                        setShowValidationModal(true);
                                                    }}
                                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                                                    title="Valider le compte"
                                                >
                                                    {Icons.validate}
                                                    <span>Valider</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUserForValidation(user);
                                                        setValidationAction('suspendre');
                                                        setShowValidationModal(true);
                                                    }}
                                                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-rose-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                                                    title="Refuser le compte"
                                                >
                                                    {Icons.delete}
                                                    <span>Refuser</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Barre de recherche et filtres */}
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
                                    placeholder="Rechercher par email, nom, prénom..."
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
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-all duration-300 min-w-[180px]"
                            >
                                <option value="">Tous les rôles</option>
                                <option value="admin">Admin</option>
                                <option value="utilisateur">Utilisateur</option>
                                <option value="acceuil">Accueil</option>
                                <option value="kiosque">Kiosque</option>
                            </select>

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
                                <>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''} pour "{searchTerm}"</>
                            ) : (
                                <>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} au total</>
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
                            email: '',
                            mot_de_passe: '',
                            role: 'utilisateur',
                            id_employe: ''
                        });
                        setFormErrors({});
                        setShowForm(true);
                    }}
                    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 rounded-full hover:from-orange-600 hover:to-red-700 font-medium transition-all duration-300 hover:scale-110 shadow-2xl"
                    title="Créer un compte utilisateur"
                >
                    {Icons.add}
                </button>

                {/* Liste des utilisateurs avec design moderne */}
                {utilisateurs.length > 0 ? (
                    <div className="space-y-4">
                        {filteredUsers.map((user) => {
                            const isIlluminated = illuminatedUsers.has(user.id_utilisateur);
                            const cardClass = isIlluminated
                                ? "group p-6 border-2 border-orange-300 rounded-xl bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg animate-pulse"
                                : "group p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 hover:scale-105 hover:shadow-lg";

                            return (
                                <div key={user.id_utilisateur} className={cardClass}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform bg-gradient-to-r from-orange-500 to-red-600">
                                                    <span className="text-white text-xl">{Icons.user}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="font-bold text-gray-800 text-xl">
                                                            {user.email}
                                                        </h3>
                                                        <span className={`${getRoleBadge(user.role)} text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg`}>
                                                            {user.role.toUpperCase()}
                                                        </span>
                                                        <span className={`${getStatusBadge(user.statut || 'actif')} px-3 py-1 rounded-full text-xs font-semibold`}>
                                                            {user.statut || 'actif'}
                                                        </span>
                                                    </div>
                                                    {user.employe && (
                                                        <p className="text-orange-600 font-medium text-lg flex items-center mt-2">
                                                            {Icons.user}
                                                            <span className="ml-2">
                                                                {user.employe.prenom_employe} {user.employe.nom_employe}
                                                            </span>
                                                            {user.employe.poste && (
                                                                <span className="ml-4 text-gray-600 font-normal">
                                                                    • {user.employe.poste}
                                                                </span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
                                                <div className="flex items-center">
                                                    {Icons.email}
                                                    <span className="ml-3">{user.email}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    {Icons.lock}
                                                    <span className="ml-3">••••••</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="ml-3">
                                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Boutons d'action */}
                                        <div className="flex space-x-3 ml-6">
                                            {user.statut === 'suspendu' ? (
                                                // Compte suspendu : seulement Réactiver ou Supprimer
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserForValidation(user);
                                                            setValidationAction('valider');
                                                            setShowValidationModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                                        title="Réactiver le compte"
                                                    >
                                                        {Icons.validate}
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                                                        title="Supprimer"
                                                    >
                                                        {Icons.delete}
                                                    </button>
                                                </>
                                            ) : (
                                                // Compte actif : Modifier, Suspendre ou Supprimer
                                                <>
                                                    <button
                                                        onClick={() => editUser(user)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
                                                        title="Modifier"
                                                    >
                                                        {Icons.edit}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserForValidation(user);
                                                            setValidationAction('suspendre');
                                                            setShowValidationModal(true);
                                                        }}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
                                                        title="Suspendre"
                                                    >
                                                        {Icons.suspend}
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="p-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:scale-110 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
                                                        title="Supprimer"
                                                    >
                                                        {Icons.delete}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Message si aucun utilisateur */
                    <div className="bg-white rounded-2xl shadow-xl border border-orange-200">
                        <div className="text-center py-16">
                            <div className="text-8xl mb-6">{Icons.users}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {searchTerm
                                    ? `Aucun utilisateur ne correspond à "${searchTerm}"`
                                    : "Commencez par créer votre premier utilisateur."
                                }
                            </p>
                            {!searchTerm && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                                >
                                    Créer un utilisateur
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

                {/* Modal formulaire de création/modification */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-8 py-6 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">
                                        {editing ? 'Modifier' : 'Nouvel'} Utilisateur
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditing(null);
                                            setFormData({
                                                email: '',
                                                mot_de_passe: '',
                                                role: 'utilisateur',
                                                id_employe: ''
                                            });
                                            setFormErrors({});
                                        }}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200 hover:scale-110"
                                    >
                                        {Icons.close}
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={saveUser} className="p-8 space-y-6">
                                {!editing && (
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
                                            autoFocus
                                        />
                                        {formErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                                        )}
                                    </div>
                                )}

                                {!editing && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Mot de passe *
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.mot_de_passe}
                                            onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${formErrors.mot_de_passe ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                                }`}
                                            placeholder="Minimum 6 caractères"
                                            required={!editing}
                                            minLength={6}
                                        />
                                        {formErrors.mot_de_passe && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.mot_de_passe}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Rôle *
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 bg-white ${formErrors.role ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                            }`}
                                        required
                                    >
                                        <option value="utilisateur">Utilisateur</option>
                                        <option value="admin">Admin</option>
                                        <option value="acceuil">Accueil</option>
                                        <option value="kiosque">Kiosque</option>
                                    </select>
                                    {formErrors.role && (
                                        <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
                                    )}
                                </div>

                                {!editing && ['admin', 'utilisateur'].includes(formData.role) && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Employé (obligatoire) *
                                        </label>
                                        <select
                                            required={!editing}
                                            value={formData.id_employe}
                                            onChange={(e) => setFormData({ ...formData, id_employe: e.target.value })}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 bg-white ${formErrors.id_employe ? 'border-red-500 bg-red-50' : 'border-orange-200'
                                                }`}
                                        >
                                            <option value="">-- Sélectionner un employé --</option>
                                            {employesDisponibles.map(emp => (
                                                <option key={emp.id_employe} value={emp.id_employe}>
                                                    {emp.nom_employe} {emp.prenom_employe} - {emp.departement?.nom_departement || 'N/A'}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {employesDisponibles.length} employé{employesDisponibles.length > 1 ? 's' : ''} disponible{employesDisponibles.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )}

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
                                                email: '',
                                                mot_de_passe: '',
                                                role: 'utilisateur',
                                                id_employe: ''
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

                {/* Modal confirmation suppression */}
                {showDeleteModal && userToDelete && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {Icons.delete}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Confirmer la suppression</h3>
                                <p className="text-gray-600">
                                    Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                                    <strong className="text-red-600">
                                        {userToDelete.email}
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
                                    onClick={deleteUser}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                                >
                                    {Icons.delete}
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal confirmation validation/suspension */}
                {showValidationModal && selectedUserForValidation && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl border border-orange-200">
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 
                                    ${validationAction === 'valider' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                                    {validationAction === 'valider' ? Icons.validate : Icons.suspend}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {validationAction === 'valider'
                                        ? (selectedUserForValidation.statut === 'suspendu' ? 'Réactiver le compte' : 'Valider le compte')
                                        : 'Suspendre le compte'}
                                </h3>
                                <p className="text-gray-600">
                                    Confirmer l'action pour{" "}
                                    <strong className="text-orange-600">
                                        {selectedUserForValidation.email}
                                    </strong>{" "}
                                    ?
                                </p>
                            </div>

                            {selectedUserForValidation.employe && (
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white">
                                            {Icons.user}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {selectedUserForValidation.employe.nom_employe} {selectedUserForValidation.employe.prenom_employe}
                                            </p>
                                            <p className="text-sm text-gray-600">Rôle: {selectedUserForValidation.role}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={`p-4 rounded-xl mb-6 text-sm ${validationAction === 'valider' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {validationAction === 'valider'
                                    ? (selectedUserForValidation.statut === 'suspendu'
                                        ? '✅ Le compte sera réactivé et l\'utilisateur pourra se reconnecter.'
                                        : '✅ L\'utilisateur recevra une notification de validation sur son mobile.')
                                    : '⚠️ L\'utilisateur sera bloqué et recevra une notification.'}
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setShowValidationModal(false);
                                        setSelectedUserForValidation(null);
                                    }}
                                    className="flex-1 border-2 border-orange-500 text-orange-600 py-3 rounded-xl hover:bg-orange-50 font-semibold transition-all duration-300 hover:scale-105"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => {
                                        if (validationAction === 'valider') {
                                            validerCompte(selectedUserForValidation.id_utilisateur);
                                        } else {
                                            suspendreCompte(selectedUserForValidation.id_utilisateur);
                                        }
                                    }}
                                    className={`flex-1 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${validationAction === 'valider'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                        : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                                        }`}
                                >
                                    {validationAction === 'valider' ? Icons.validate : Icons.suspend}
                                    <span>
                                        {validationAction === 'valider'
                                            ? (selectedUserForValidation.statut === 'suspendu' ? 'Réactiver' : 'Valider')
                                            : 'Suspendre'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GestionUtilisateurs;