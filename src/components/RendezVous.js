import React, { useState, useEffect, useCallback } from 'react';

function RendezVous({ onBack, onNavigate, apiCall, showAlert }) {
    const [formData, setFormData] = useState({
        nom_visiteur: '',
        prenom_visiteur: '',
        telephone: '',
        email: '',
        nom_organisation: '',
        type_organisation: '',
        id_ciblage: '',
        id_type_visite: '',
        id_type_service: '',
        date_rendezvous: '',
        duree_estimee: 60,
        motif: ''
    });

    const [ciblagesDisponibles, setCiblagesDisponibles] = useState([]);
    const [typesVisiteUniques, setTypesVisiteUniques] = useState([]);
    const [typesServiceFiltres, setTypesServiceFiltres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [ciblageSelectionne, setCiblageSelectionne] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // État pour la navigation par étapes
    const [etapeActuelle, setEtapeActuelle] = useState(1);
    const totalEtapes = 4;

    // 🔥 ÉTAT POUR LE PICKER DE DATE MODERNE
    const [dateTimePicker, setDateTimePicker] = useState({
        show: false,
        selectedDate: new Date(),
        selectedTime: '09:00'
    });

    // Afficher une alerte toast
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "" });
        }, 3000);
    };

    // Afficher la modale de succès
    const showSuccessAlert = () => {
        setShowSuccessModal(true);
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 3000);
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
            setMessage('❌ Erreur lors du chargement des règles de ciblage');
            showToast("Impossible de charger les règles de ciblage: " + error.message, "error");
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

    const handleTypeVisiteClick = (idTypeVisite, libelleType) => {
        setFormData(prevState => ({
            ...prevState,
            id_type_visite: idTypeVisite.toString(),
            id_type_service: '',
            id_ciblage: ''
        }));
        setCiblageSelectionne(null);
    };

    const handleTypeServiceClick = (idTypeService, libelleTypeService) => {
        setFormData(prevState => ({
            ...prevState,
            id_type_service: idTypeService.toString()
        }));
    };

    const handleTypeOrganisationClick = (type) => {
        setFormData(prevState => ({
            ...prevState,
            type_organisation: type
        }));
    };

    const handleDureeClick = (duree) => {
        setFormData(prevState => ({
            ...prevState,
            duree_estimee: duree
        }));
    };

    // 🔥 FONCTIONS POUR LE PICKER DE DATE MODERNE
    const ouvrirDateTimePicker = () => {
        if (formData.date_rendezvous) {
            const date = new Date(formData.date_rendezvous);
            setDateTimePicker({
                show: true,
                selectedDate: date,
                selectedTime: date.toTimeString().slice(0, 5)
            });
        } else {
            // Définir la date minimale (aujourd'hui + 1 heure)
            const maintenant = new Date();
            maintenant.setHours(maintenant.getHours() + 1);
            setDateTimePicker({
                show: true,
                selectedDate: maintenant,
                selectedTime: maintenant.toTimeString().slice(0, 5)
            });
        }
    };

    const fermerDateTimePicker = () => {
        setDateTimePicker(prev => ({ ...prev, show: false }));
    };

    // SEULE MODIFICATION : Utiliser le format ISO complet comme dans ModifierRendezVous
    const confirmerDateTime = () => {
        const { selectedDate, selectedTime } = dateTimePicker;
        const [hours, minutes] = selectedTime.split(':');

        selectedDate.setHours(parseInt(hours), parseInt(minutes));

        // Format ISO 8601 complet (standard international) - COMME DANS ModifierRendezVous
        const dateTimeString = selectedDate.toISOString();

        setFormData(prev => ({
            ...prev,
            date_rendezvous: dateTimeString
        }));

        fermerDateTimePicker();
    };

    const handleDateChange = (increment) => {
        setDateTimePicker(prev => {
            const newDate = new Date(prev.selectedDate);
            newDate.setDate(newDate.getDate() + increment);
            return { ...prev, selectedDate: newDate };
        });
    };

    const handleTimeChange = (time) => {
        setDateTimePicker(prev => ({ ...prev, selectedTime: time }));
    };

    // 🔥 FORMATAGE MODERNE DES DATES
    const formaterDateAffichage = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formaterDateCourte = (dateTime) => {
        if (!dateTime) return '';
        const date = new Date(dateTime);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formaterDateCalendrier = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    // 🔹 Validation de la date et heure
    const validerDateRendezVous = (dateTime) => {
        if (!dateTime) return "Veuillez sélectionner une date et heure";

        const maintenant = new Date();
        const dateRendezVous = new Date(dateTime);

        // La date doit être dans le futur
        if (dateRendezVous <= maintenant) {
            return "La date et l'heure du rendez-vous doivent être dans le futur";
        }

        // Vérifier les heures ouvrables (9h-17h du lundi au vendredi)
        const jour = dateRendezVous.getDay();
        const heure = dateRendezVous.getHours();

        if (jour === 0 || jour === 6) {
            return "Les rendez-vous sont disponibles du lundi au vendredi uniquement";
        }

        if (heure < 9 || heure >= 17) {
            return "Les rendez-vous sont disponibles entre 9h et 17h";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // Validation des champs requis
            if (!formData.nom_visiteur.trim() || !formData.prenom_visiteur.trim() || !formData.telephone.trim()) {
                setMessage('Veuillez remplir les champs obligatoires (Nom, Prénom, Téléphone)');
                setLoading(false);
                return;
            }

            if (!formData.id_ciblage || !formData.id_type_visite || !formData.id_type_service) {
                setMessage('❌ Veuillez sélectionner un type de visite et un type de service valides');
                setLoading(false);
                return;
            }

            if (!formData.date_rendezvous) {
                setMessage('❌ Veuillez sélectionner une date et heure pour le rendez-vous');
                setLoading(false);
                return;
            }

            if (!formData.motif.trim()) {
                setMessage('❌ Veuillez saisir le motif du rendez-vous');
                setLoading(false);
                return;
            }

            // Validation de la date
            const erreurDate = validerDateRendezVous(formData.date_rendezvous);
            if (erreurDate) {
                setMessage(`❌ ${erreurDate}`);
                setLoading(false);
                return;
            }

            // Préparer les données pour l'API
            const dataToSend = {
                nom_visiteur: formData.nom_visiteur,
                prenom_visiteur: formData.prenom_visiteur,
                telephone: formData.telephone,
                email: formData.email || null,
                nom_organisation: formData.nom_organisation || null,
                type_organisation: formData.type_organisation || null,
                id_ciblage: parseInt(formData.id_ciblage),
                id_type_visite: parseInt(formData.id_type_visite),
                id_type_service: parseInt(formData.id_type_service),
                date_rendezvous: formData.date_rendezvous, // Format ISO déjà (comme ModifierRendezVous)
                duree_estimee: parseInt(formData.duree_estimee),
                motif: formData.motif,
                id_status: 1 // Statut "planifié"
            };

            console.log('💾 Création rendez-vous:', dataToSend);

            const result = await apiCall('/rendezvous', {
                method: 'POST',
                body: JSON.stringify(dataToSend)
            });

            console.log("✅ Rendez-vous créé:", result);

            const successMessage = result.message || 'Rendez-vous planifié avec succès!';
            setMessage(`✅ ${successMessage}`);

            // Afficher la modale de succès
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
                id_type_service: '',
                date_rendezvous: '',
                duree_estimee: 60,
                motif: ''
            });
            setCiblageSelectionne(null);
            setEtapeActuelle(1);

        } catch (error) {
            console.error("❌ Erreur création rendez-vous:", error);
            const errorMessage = error.message || "Erreur lors de la planification";
            setMessage('❌ ' + errorMessage);
            showToast(errorMessage, "error");
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
            id_type_service: '',
            date_rendezvous: '',
            duree_estimee: 60,
            motif: ''
        });
        setCiblageSelectionne(null);
        setMessage('');
        setEtapeActuelle(1);
    };

    // Navigation entre les étapes
    const etapeSuivante = () => {
        if (etapeActuelle < totalEtapes && peutPasserEtapeSuivante()) {
            setEtapeActuelle(etapeActuelle + 1);
        }
    };

    const etapePrecedente = () => {
        if (etapeActuelle > 1) {
            setEtapeActuelle(etapeActuelle - 1);
        }
    };

    // Obtenir la date minimale (maintenant)
    const getMinDateTime = () => {
        const now = new Date();
        // Ajouter 1 heure pour éviter les rendez-vous trop proches
        now.setHours(now.getHours() + 1);
        return now.toISOString().slice(0, 16);
    };

    // 🔥 GÉNÉRER LES CRÉNEAUX HORAIRES DISPONIBLES
    const genererCreneauxHoraires = () => {
        const creneaux = [];
        for (let heure = 9; heure < 17; heure++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${heure.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                creneaux.push(timeString);
            }
        }
        return creneaux;
    };

    const creneauxDisponibles = genererCreneauxHoraires();

    // Rendu de l'étape 1 : Sélection du Service
    const renderEtape1 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Sélection du Service</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    {/* Type de visite - Boutons */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Type de visite <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {typesVisiteUniques.map(type => (
                                <button
                                    key={type.id_type_visite}
                                    type="button"
                                    onClick={() => handleTypeVisiteClick(type.id_type_visite, type.libelle_type)}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formData.id_type_visite === type.id_type_visite.toString()
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                        : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-center">
                                        {type.libelle_type}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {typesVisiteUniques.length === 0 && !loading && (
                            <div className="text-center py-4 text-gray-500">
                                Aucun type de visite disponible
                            </div>
                        )}
                    </div>

                    {/* Boutons Type de service */}
                    {formData.id_type_visite && (
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center">
                                <span className="bg-red-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                                Type de service <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {typesServiceFiltres.map(service => (
                                    <button
                                        key={service.id_type_service}
                                        type="button"
                                        onClick={() => handleTypeServiceClick(service.id_type_service, service.libelle_type_service)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formData.id_type_service === service.id_type_service.toString()
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                            : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-center">
                                            {service.libelle_type_service}
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {typesServiceFiltres.length === 0 && (
                                <div className="text-center py-3 text-gray-500">
                                    Aucun service disponible pour ce type de visite
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Affichage simplifié du département cible */}
                {ciblageSelectionne && (
                    <div className="mt-6 p-4 bg-white rounded-xl border-2 border-green-200 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-green-800 text-lg">
                                    Département : {ciblageSelectionne.departement?.nom_departement}
                                </span>
                            </div>
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Message d'erreur pour l'étape 1 */}
            {etapeActuelle === 1 && !formData.id_type_visite && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center space-x-2 text-yellow-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">Veuillez sélectionner un type de visite pour continuer</span>
                    </div>
                </div>
            )}
            {etapeActuelle === 1 && formData.id_type_visite && !formData.id_type_service && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center space-x-2 text-yellow-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">Veuillez sélectionner un type de service pour continuer</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Rendu de l'étape 2 : Informations Organisation
    const renderEtape2 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Informations Organisation</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    {/* Type d'organisation - Boutons */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Type d'organisation
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['Entreprise', 'Particulier', 'Administration', 'Autre'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleTypeOrganisationClick(type)}
                                    className={`p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formData.type_organisation === type
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                        : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-center text-sm">
                                        {type}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nom de l'organisation */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                            Nom de l'organisation
                        </label>
                        <input
                            type="text"
                            name="nom_organisation"
                            value={formData.nom_organisation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Nom de l'organisation"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Rendu de l'étape 3 : Informations Personnelles
    const renderEtape3 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Informations Personnelles</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-2 h-2 rounded-full mr-2"></span>
                            Nom <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="nom_visiteur"
                            value={formData.nom_visiteur}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Nom du visiteur"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-2 h-2 rounded-full mr-2"></span>
                            Prénom <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="prenom_visiteur"
                            value={formData.prenom_visiteur}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="Prénom du visiteur"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>
                            Téléphone <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="tel"
                            name="telephone"
                            value={formData.telephone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="+33 1 23 45 67 89"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-red-500 w-2 h-2 rounded-full mr-2"></span>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                            placeholder="email@exemple.com"
                        />
                    </div>
                </div>
            </div>

            {/* Message d'erreur pour l'étape 3 */}
            {etapeActuelle === 3 && (!formData.nom_visiteur || !formData.prenom_visiteur || !formData.telephone) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center space-x-2 text-yellow-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">Veuillez remplir tous les champs obligatoires (Nom, Prénom, Téléphone) pour continuer</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Rendu de l'étape 4 : Détails du Rendez-vous (MODERNISÉ)
    const renderEtape4 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Détails du Rendez-vous</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    {/* 🔥 SELECTEUR DE DATE ET HEURE MODERNE */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Date et heure <span className="text-red-500 ml-1">*</span>
                        </label>

                        {/* Bouton pour ouvrir le picker moderne */}
                        <button
                            type="button"
                            onClick={ouvrirDateTimePicker}
                            className="w-full px-4 py-4 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 text-left"
                        >
                            {formData.date_rendezvous ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-800 text-lg">
                                            {formaterDateAffichage(formData.date_rendezvous)}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Cliquez pour modifier
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            Sélectionner une date et heure
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Lundi-Vendredi 9h-17h
                                        </div>
                                    </div>
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Durée estimée - Boutons */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-red-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Durée estimée
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { value: 30, label: '30 min' },
                                { value: 60, label: '1h' },
                                { value: 90, label: '1h30' },
                                { value: 120, label: '2h' },
                                { value: 180, label: '3h' }
                            ].map(duree => (
                                <button
                                    key={duree.value}
                                    type="button"
                                    onClick={() => handleDureeClick(duree.value)}
                                    className={`p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 ${formData.duree_estimee === duree.value
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                        : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-center text-sm">
                                        {duree.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Motif */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Motif du rendez-vous <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                            name="motif"
                            value={formData.motif}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none"
                            placeholder="Décrivez l'objet de la visite..."
                            required
                        />
                    </div>
                </div>

                {/* Affichage de la date sélectionnée */}
                {formData.date_rendezvous && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center space-x-3 text-blue-700">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="font-bold text-sm">RENDEZ-VOUS PLANIFIÉ</div>
                                <div className="font-semibold text-lg">
                                    {formaterDateAffichage(formData.date_rendezvous)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Message d'erreur pour l'étape 4 */}
            {etapeActuelle === 4 && (!formData.date_rendezvous || !formData.motif.trim()) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center space-x-2 text-yellow-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="font-medium">Veuillez sélectionner une date et saisir le motif pour finaliser</span>
                    </div>
                </div>
            )}
        </div>
    );

    // Fonction pour rendre l'étape actuelle
    const renderEtapeActuelle = () => {
        switch (etapeActuelle) {
            case 1:
                return renderEtape1();
            case 2:
                return renderEtape2();
            case 3:
                return renderEtape3();
            case 4:
                return renderEtape4();
            default:
                return renderEtape1();
        }
    };

    // Vérifier si on peut passer à l'étape suivante
    const peutPasserEtapeSuivante = () => {
        switch (etapeActuelle) {
            case 1:
                return formData.id_type_visite && formData.id_type_service;
            case 2:
                return true; // L'organisation est optionnelle
            case 3:
                return formData.nom_visiteur.trim() && formData.prenom_visiteur.trim() && formData.telephone.trim();
            case 4:
                return formData.date_rendezvous && formData.motif.trim();
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">

                    {/* 🔥 MODALE PICKER DE DATE MODERNE */}
                    {dateTimePicker.show && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform scale-100 animate-pop-in">
                                {/* En-tête */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-3xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold">Choisir la date et l'heure</h3>
                                        <button
                                            onClick={fermerDateTimePicker}
                                            className="text-white hover:text-orange-200 transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Contenu du picker */}
                                <div className="p-6">
                                    {/* Sélecteur de date */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <button
                                                onClick={() => handleDateChange(-1)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-800 text-lg">
                                                    {formaterDateCalendrier(dateTimePicker.selectedDate)}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {dateTimePicker.selectedDate.toLocaleDateString('fr-FR', { year: 'numeric' })}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDateChange(1)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sélecteur d'heure */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Heure du rendez-vous
                                        </label>
                                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                            {creneauxDisponibles.map(creneau => (
                                                <button
                                                    key={creneau}
                                                    type="button"
                                                    onClick={() => handleTimeChange(creneau)}
                                                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${dateTimePicker.selectedTime === creneau
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-sm">
                                                        {creneau}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Informations */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                        <div className="flex items-center space-x-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <div className="text-sm text-blue-700">
                                                <div className="font-semibold">Horaires d'ouverture</div>
                                                <div>Lundi-Vendredi • 9h-17h</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={fermerDateTimePicker}
                                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={confirmerDateTime}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all shadow-lg"
                                        >
                                            Confirmer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                        Rendez-vous planifié avec succès
                                    </p>

                                    {/* Bouton de fermeture */}
                                    <button
                                        onClick={() => setShowSuccessModal(false)}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 font-bold transform hover:scale-105 active:scale-95"
                                    >
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toast Notification (pour les erreurs) */}
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

                    {/* En-tête moderne */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-6">
                                <svg className="w-10 h-10 text-white transform -rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border-3 border-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                            Nouveau Rendez-vous
                        </h1>

                        {/* Indicateur de progression */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="flex items-center justify-between relative">
                                {/* Ligne de progression */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 -translate-y-1/2 -z-10 transition-all duration-500"
                                    style={{ width: `${((etapeActuelle - 1) / (totalEtapes - 1)) * 100}%` }}
                                ></div>

                                {/* Étapes */}
                                {[1, 2, 3, 4].map((etape) => (
                                    <div key={etape} className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${etape <= etapeActuelle
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white shadow-lg scale-110'
                                                : 'bg-white border-gray-300 text-gray-400'
                                                }`}
                                        >
                                            {etape < etapeActuelle ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="font-bold text-sm">{etape}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium mt-2 transition-all duration-300 ${etape === etapeActuelle
                                            ? 'text-orange-600 font-bold'
                                            : 'text-gray-500'
                                            }`}>
                                            {etape === 1 && 'Service'}
                                            {etape === 2 && 'Organisation'}
                                            {etape === 3 && 'Personnel'}
                                            {etape === 4 && 'Rendez-vous'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Message de statut (pour les erreurs) */}
                    {message && !message.includes('✅') && (
                        <div className={`mb-6 p-4 rounded-2xl border-l-4 shadow-lg transition-all duration-300 bg-gradient-to-r from-red-50 to-orange-50 border-red-500 text-red-800`}>
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
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

                    {/* Carte principale */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden transform transition-all duration-300">

                        {/* En-tête de la carte */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">
                                    Étape {etapeActuelle} sur {totalEtapes} :
                                    {etapeActuelle === 1 && ' Sélection du Service'}
                                    {etapeActuelle === 2 && ' Informations Organisation'}
                                    {etapeActuelle === 3 && ' Informations Personnelles'}
                                    {etapeActuelle === 4 && ' Détails du Rendez-vous'}
                                </h2>
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-white text-sm font-medium">Étape {etapeActuelle}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contenu du formulaire */}
                        <div className="p-6">
                            {loading && ciblagesDisponibles.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-gray-600">Chargement en cours...</p>
                                    <p className="text-sm text-gray-500 mt-1">Veuillez patienter</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {/* Étape actuelle */}
                                    <div className="mb-8">
                                        {renderEtapeActuelle()}
                                    </div>

                                    {/* Boutons de navigation */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                        {/* Bouton précédent */}
                                        {etapeActuelle > 1 && (
                                            <button
                                                type="button"
                                                onClick={etapePrecedente}
                                                className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
                                            >
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    <span>Précédent</span>
                                                </div>
                                            </button>
                                        )}

                                        {/* Bouton suivant */}
                                        {etapeActuelle < totalEtapes && (
                                            <button
                                                type="button"
                                                onClick={etapeSuivante}
                                                disabled={!peutPasserEtapeSuivante()}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                            >
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>Suivant</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>
                                        )}

                                        {/* Boutons de soumission (dernière étape) */}
                                        {etapeActuelle === totalEtapes && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
                                                >
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        <span>Annuler</span>
                                                    </div>
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading || !peutPasserEtapeSuivante()}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                                >
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {loading ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Planification...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Planifier</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Pied de page */}
                    <div className="text-center mt-6 text-gray-500 text-sm">
                        <p>Système de gestion des rendez-vous • Horaires d'ouverture : Lundi-Vendredi 9h-17h</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RendezVous;