import React, { useState, useEffect, useCallback } from 'react';

function FormulaireVisite({ apiCall }) {
    const [formData, setFormData] = useState({
        nom_visiteur: '',
        prenom_visiteur: '',
        telephone: '',
        email: '',
        nom_organisation: '',
        type_organisation: '',
        id_ciblage: '',
        id_type_visite: '',
        id_type_service: ''
    });

    const [ciblagesDisponibles, setCiblagesDisponibles] = useState([]);
    const [typesVisiteUniques, setTypesVisiteUniques] = useState([]);
    const [typesServiceFiltres, setTypesServiceFiltres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [ciblageSelectionne, setCiblageSelectionne] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Afficher une alerte toast pour les erreurs légères
    const showToast = (message, type = "error") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    // Afficher la modale de succès
    const showSuccessAlert = () => {
        setShowSuccessModal(true);
    };

    // Afficher la modale d'erreur
    const showErrorAlert = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    // 🔹 Charger les règles de ciblage depuis l'API - version useCallback
    const chargerCiblages = useCallback(async () => {
        setLoading(true);
        try {
            console.log("🔄 Chargement des ciblages...");
            const data = await apiCall('/ciblage-departement');
            setCiblagesDisponibles(data);

            // Extraire les types de visite uniques
            const typesVisite = [...new Map(data.map(item => [
                item.id_type_visite,
                { id_type_visite: item.id_type_visite, libelle_type: item.type_visite?.libelle_type }
            ])).values()];

            setTypesVisiteUniques(typesVisite);
            console.log("✅ Ciblages chargés:", data.length);

        } catch (error) {
            console.error("❌ Erreur chargement ciblages:", error);
            showErrorAlert("Impossible de charger les règles de ciblage: " + error.message);
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    // 🔹 Charger les ciblages au montage du composant
    useEffect(() => {
        chargerCiblages();
    }, [chargerCiblages]);

    // 🔹 Filtrer les types de service quand le type de visite change
    useEffect(() => {
        if (!formData.id_type_visite) {
            setTypesServiceFiltres([]);
            setFormData(prev => ({ ...prev, id_type_service: '', id_ciblage: '' }));
            setCiblageSelectionne(null);
            return;
        }

        // Trouver tous les types de service associés au type de visite sélectionné
        const services = ciblagesDisponibles
            .filter(ciblage => ciblage.id_type_visite === parseInt(formData.id_type_visite))
            .map(ciblage => ({
                id_type_service: ciblage.id_type_service,
                libelle_type_service: ciblage.type_service?.libelle_type_service
            }));

        // Éliminer les doublons
        const servicesUniques = [...new Map(services.map(item => [
            item.id_type_service, item
        ])).values()];

        setTypesServiceFiltres(servicesUniques);
        setFormData(prev => ({ ...prev, id_type_service: '', id_ciblage: '' }));
        setCiblageSelectionne(null);
    }, [formData.id_type_visite, ciblagesDisponibles]);

    // 🔹 Trouver le ciblage quand les deux sélections sont faites
    useEffect(() => {
        if (!formData.id_type_visite || !formData.id_type_service) {
            setCiblageSelectionne(null);
            setFormData(prev => ({ ...prev, id_ciblage: '' }));
            return;
        }

        // Trouver le ciblage correspondant
        const ciblage = ciblagesDisponibles.find(c =>
            c.id_type_visite === parseInt(formData.id_type_visite) &&
            c.id_type_service === parseInt(formData.id_type_service)
        );

        if (ciblage) {
            setCiblageSelectionne(ciblage);
            setFormData(prev => ({ ...prev, id_ciblage: ciblage.id_ciblage.toString() }));
        } else {
            setCiblageSelectionne(null);
            setFormData(prev => ({ ...prev, id_ciblage: '' }));
        }
    }, [formData.id_type_visite, formData.id_type_service, ciblagesDisponibles]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTypeServiceClick = (idTypeService, libelleTypeService) => {
        setFormData(prevState => ({
            ...prevState,
            id_type_service: idTypeService.toString()
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Validation des champs requis
            if (!formData.nom_visiteur.trim() || !formData.prenom_visiteur.trim() || !formData.telephone.trim()) {
                showErrorAlert('Veuillez remplir les champs obligatoires (Nom, Prénom, Téléphone)');
                setLoading(false);
                return;
            }

            if (!formData.id_ciblage || !formData.id_type_visite || !formData.id_type_service) {
                showErrorAlert('Veuillez sélectionner un type de visite et un type de service valides');
                setLoading(false);
                return;
            }

            // Préparer les données pour l'API - TOUS les champs requis
            const dataToSend = {
                nom_visiteur: formData.nom_visiteur,
                prenom_visiteur: formData.prenom_visiteur,
                telephone: formData.telephone,
                email: formData.email || null,
                nom_organisation: formData.nom_organisation || null,
                type_organisation: formData.type_organisation || null,
                id_ciblage: parseInt(formData.id_ciblage),
                id_type_visite: parseInt(formData.id_type_visite),
                id_type_service: parseInt(formData.id_type_service)
            };

            console.log('💾 Enregistrement visiteur:', dataToSend);

            const result = await apiCall('/visiteurs', {
                method: 'POST',
                body: JSON.stringify(dataToSend)
            });

            console.log("✅ Visiteur enregistré:", result);

            const successMessage = result.message || 'Visiteur enregistré avec succès!';
            setMessage(`✅ ${successMessage}`);

            // Afficher la modale de succès au lieu du toast
            showSuccessAlert();

            // Réinitialiser le formulaire
            setFormData({
                nom_visiteur: '',
                prenom_visiteur: '',
                telephone: '',
                email: '',
                nom_organisation: '',
                type_organisation: '',
                id_ciblage: '',
                id_type_visite: '',
                id_type_service: ''
            });
            setCiblageSelectionne(null);

        } catch (error) {
            console.error("❌ Erreur enregistrement:", error);
            const errorMessage = error.message || "Erreur lors de l'enregistrement";
            setMessage('❌ ' + errorMessage);
            showErrorAlert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            nom_visiteur: '',
            prenom_visiteur: '',
            telephone: '',
            email: '',
            nom_organisation: '',
            type_organisation: '',
            id_ciblage: '',
            id_type_visite: '',
            id_type_service: ''
        });
        setCiblageSelectionne(null);
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-6">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Modale de succès centrée */}
                    {showSuccessModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl shadow-2xl border border-green-200 transform scale-100 animate-pop-in mx-4 max-w-md w-full">
                                <div className="p-6 text-center">
                                    {/* Icône de succès animée */}
                                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    {/* Titre */}
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Succès !
                                    </h3>

                                    {/* Message */}
                                    <p className="text-gray-600 mb-6">
                                        Le visiteur a été enregistré avec succès
                                    </p>

                                    {/* Bouton de fermeture */}
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 font-bold transform hover:scale-105 active:scale-95"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modale d'erreur centrée */}
                    {showErrorModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl shadow-2xl border border-red-200 transform scale-100 animate-pop-in mx-4 max-w-md w-full">
                                <div className="p-6 text-center">
                                    {/* Icône d'erreur animée */}
                                    <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>

                                    {/* Titre */}
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        Erreur
                                    </h3>

                                    {/* Message */}
                                    <p className="text-gray-600 mb-6">
                                        {errorMessage}
                                    </p>

                                    {/* Bouton de fermeture */}
                                    <button
                                        onClick={() => setShowErrorModal(false)}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-300 font-bold transform hover:scale-105 active:scale-95"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toast Notification (pour les erreurs légères) */}
                    {toast.show && (
                        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl border-l-4 transform transition-all duration-500 ${toast.type === "success"
                            ? "bg-green-50 border-green-500 text-green-800"
                            : toast.type === "error"
                                ? "bg-red-50 border-red-500 text-red-800"
                                : "bg-yellow-50 border-yellow-500 text-yellow-800"
                            } animate-slide-in`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === "success"
                                    ? "bg-green-100 text-green-600"
                                    : toast.type === "error"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {toast.type === "success" && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {toast.type === "error" && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                    {toast.type === "warning" && (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{toast.message}</p>
                                </div>
                                <button
                                    onClick={() => setToast({ show: false, message: "", type: "" })}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-110"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* En-tête simplifié sans la grande icône */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                            Nouvelle Visite
                        </h1>
                        <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-2"></div>
                        <p className="text-gray-600">Formulaire d'enregistrement des visiteurs</p>
                    </div>

                    {/* Message de statut (pour les messages non critiques) */}
                    {message && !message.includes('✅') && (
                        <div className={`mb-6 p-4 rounded-xl border-l-4 bg-gradient-to-r from-red-50 to-orange-50 border-red-500 text-red-800`}>
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold">{message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Carte principale avec dimensions augmentées */}
                    <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">

                        {/* En-tête de la carte */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Formulaire d'Enregistrement</h2>
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-white text-sm font-medium">Enregistrement</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire avec dimensions augmentées */}
                        <div className="p-6">
                            {loading && ciblagesDisponibles.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-gray-600">Chargement en cours...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                        {/* Colonne de gauche - Informations personnelles */}
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                                                <h3 className="text-lg font-bold text-gray-800">Informations Personnelles</h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Nom <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nom_visiteur"
                                                        value={formData.nom_visiteur}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                        placeholder="Nom du visiteur"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Prénom <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="prenom_visiteur"
                                                        value={formData.prenom_visiteur}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                        placeholder="Prénom du visiteur"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Téléphone <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="telephone"
                                                        value={formData.telephone}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                        placeholder="+33 1 23 45 67 89"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                        placeholder="email@exemple.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Colonne de droite - Organisation et Service */}
                                        <div className="space-y-4">
                                            {/* Organisation */}
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-6 bg-red-500 rounded-full"></div>
                                                    <h3 className="text-lg font-bold text-gray-800">Organisation</h3>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Organisation
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="nom_organisation"
                                                            value={formData.nom_organisation}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                            placeholder="Nom de l'organisation"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-semibold text-gray-700">
                                                            Type d'organisation
                                                        </label>
                                                        <select
                                                            name="type_organisation"
                                                            value={formData.type_organisation}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 appearance-none"
                                                        >
                                                            <option value="">Sélectionnez...</option>
                                                            <option value="Entreprise">Entreprise</option>
                                                            <option value="Particulier">Particulier</option>
                                                            <option value="Administration">Administration</option>
                                                            <option value="Autre">Autre</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sélection du service */}
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                                                    <h3 className="text-lg font-bold text-gray-800">Service</h3>
                                                </div>

                                                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                                                    <div className="space-y-3">
                                                        {/* Type de visite */}
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-semibold text-gray-700">
                                                                Type de visite <span className="text-red-500">*</span>
                                                            </label>
                                                            <select
                                                                name="id_type_visite"
                                                                value={formData.id_type_visite}
                                                                onChange={handleInputChange}
                                                                className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                                                required
                                                            >
                                                                <option value="">Sélectionnez...</option>
                                                                {typesVisiteUniques.map(type => (
                                                                    <option key={type.id_type_visite} value={type.id_type_visite}>
                                                                        {type.libelle_type}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Boutons Type de service */}
                                                        {formData.id_type_visite && (
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-semibold text-gray-700">
                                                                    Type de service <span className="text-red-500">*</span>
                                                                </label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {typesServiceFiltres.map(service => (
                                                                        <button
                                                                            key={service.id_type_service}
                                                                            type="button"
                                                                            onClick={() => handleTypeServiceClick(service.id_type_service, service.libelle_type_service)}
                                                                            className={`p-3 rounded-xl border transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formData.id_type_service === service.id_type_service.toString()
                                                                                ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                                                                                : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                                                                }`}
                                                                        >
                                                                            <div className="font-semibold text-center text-sm">
                                                                                {service.libelle_type_service}
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {typesServiceFiltres.length === 0 && (
                                                                    <div className="text-center py-2 text-gray-500 text-sm">
                                                                        Aucun service disponible
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Affichage du département cible */}
                                                    {ciblageSelectionne && (
                                                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span className="font-bold text-green-800">
                                                                        Département : {ciblageSelectionne.departement?.nom_departement}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons d'action avec dimensions augmentées */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Effacer</span>
                                            </div>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.id_ciblage}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Enregistrement...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Enregistrer</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormulaireVisite;