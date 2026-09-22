// components/PublicRendezVous.jsx
import React, { useState, useEffect, useCallback } from 'react';

function PublicRendezVous() {
    const [formData, setFormData] = useState({
        nom_visiteur: '',
        prenom_visiteur: '',
        telephone: '',
        email: '',
        nom_organisation: '',
        type_organisation: '',
        id_type_visite: '',
        id_type_service: '',
        date_rendezvous: '',
        motif: ''
    });

    const [typesVisite, setTypesVisite] = useState([]);
    const [typesService, setTypesService] = useState([]);
    const [typesServiceFiltres, setTypesServiceFiltres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [message, setMessage] = useState('');
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // État pour la navigation par étapes
    const [etapeActuelle, setEtapeActuelle] = useState(1);
    const totalEtapes = 4;

    // État pour le picker de date moderne
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

    // Charger les types de visite depuis l'API publique
    const chargerTypesVisite = useCallback(async () => {
        setLoadingTypes(true);
        try {
            const response = await fetch('/api/public/types-visite');
            const data = await response.json();
            if (data.success) {
                setTypesVisite(data.data);
            }
        } catch (error) {
            console.error("❌ Erreur chargement types visite:", error);
            setMessage('❌ Erreur lors du chargement des types de visite');
            showToast("Impossible de charger les types de visite", "error");
        } finally {
            setLoadingTypes(false);
        }
    }, []);

    // Charger les types de service depuis l'API publique
    const chargerTypesService = useCallback(async () => {
        try {
            const response = await fetch('/api/public/types-service');
            const data = await response.json();
            if (data.success) {
                setTypesService(data.data);
            }
        } catch (error) {
            console.error("❌ Erreur chargement types service:", error);
        }
    }, []);

    useEffect(() => {
        chargerTypesVisite();
        chargerTypesService();
    }, [chargerTypesVisite, chargerTypesService]);

    // Filtrer les types de service quand le type de visite change
    useEffect(() => {
        if (!formData.id_type_visite) {
            setTypesServiceFiltres([]);
            return;
        }
        // Afficher tous les services pour le type de visite sélectionné
        setTypesServiceFiltres(typesService);
    }, [formData.id_type_visite, typesService]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleTypeVisiteClick = (idTypeVisite) => {
        setFormData(prevState => ({
            ...prevState,
            id_type_visite: idTypeVisite.toString(),
            id_type_service: ''
        }));
    };

    const handleTypeServiceClick = (idTypeService) => {
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

    // Fonctions pour le picker de date moderne
    const ouvrirDateTimePicker = () => {
        if (formData.date_rendezvous) {
            const date = new Date(formData.date_rendezvous);
            setDateTimePicker({
                show: true,
                selectedDate: date,
                selectedTime: date.toTimeString().slice(0, 5)
            });
        } else {
            const maintenant = new Date();
            maintenant.setHours(maintenant.getHours() + 1);
            setDateTimePicker({
                show: true,
                selectedDate: maintenant,
                selectedTime: '09:00'
            });
        }
    };

    const fermerDateTimePicker = () => {
        setDateTimePicker(prev => ({ ...prev, show: false }));
    };

    const confirmerDateTime = () => {
        const { selectedDate, selectedTime } = dateTimePicker;
        const [hours, minutes] = selectedTime.split(':');
        selectedDate.setHours(parseInt(hours), parseInt(minutes));
        const dateTimeString = selectedDate.toISOString();
        setFormData(prev => ({ ...prev, date_rendezvous: dateTimeString }));
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

    const formaterDateCalendrier = (date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const validerDateRendezVous = (dateTime) => {
        if (!dateTime) return "Veuillez sélectionner une date et heure";

        const maintenant = new Date();
        const dateRendezVous = new Date(dateTime);

        if (dateRendezVous <= maintenant) {
            return "La date et l'heure du rendez-vous doivent être dans le futur";
        }

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (!formData.nom_visiteur.trim() || !formData.prenom_visiteur.trim() || !formData.telephone.trim()) {
                setMessage('Veuillez remplir les champs obligatoires (Nom, Prénom, Téléphone)');
                setLoading(false);
                return;
            }

            if (!formData.id_type_visite || !formData.id_type_service) {
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

            const erreurDate = validerDateRendezVous(formData.date_rendezvous);
            if (erreurDate) {
                setMessage(`❌ ${erreurDate}`);
                setLoading(false);
                return;
            }

            const dataToSend = {
                nom_visiteur: formData.nom_visiteur,
                prenom_visiteur: formData.prenom_visiteur,
                telephone: formData.telephone,
                email: formData.email || null,
                nom_organisation: formData.nom_organisation || null,
                type_organisation: formData.type_organisation || null,
                id_type_visite: parseInt(formData.id_type_visite),
                id_type_service: parseInt(formData.id_type_service),
                date_rendezvous: formData.date_rendezvous,
                duree_estimee: 60,
                motif: formData.motif
            };

            const response = await fetch('/api/public/rendez-vous', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            const result = await response.json();

            if (result.success) {
                showSuccessAlert();
                setFormData({
                    nom_visiteur: '',
                    prenom_visiteur: '',
                    telephone: '',
                    email: '',
                    nom_organisation: '',
                    type_organisation: '',
                    id_type_visite: '',
                    id_type_service: '',
                    date_rendezvous: '',
                    motif: ''
                });
                setEtapeActuelle(1);
            } else {
                setMessage('❌ ' + (result.message || 'Erreur lors de la création'));
                showToast(result.message || 'Erreur', "error");
            }
        } catch (error) {
            console.error("❌ Erreur:", error);
            setMessage('❌ Erreur de connexion au serveur');
            showToast("Erreur de connexion", "error");
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
            id_type_visite: '',
            id_type_service: '',
            date_rendezvous: '',
            motif: ''
        });
        setMessage('');
        setEtapeActuelle(1);
    };

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

    const peutPasserEtapeSuivante = () => {
        switch (etapeActuelle) {
            case 1:
                return formData.id_type_visite && formData.id_type_service;
            case 2:
                return true;
            case 3:
                return formData.nom_visiteur.trim() && formData.prenom_visiteur.trim() && formData.telephone.trim();
            case 4:
                return formData.date_rendezvous && formData.motif.trim();
            default:
                return false;
        }
    };

    // Rendu de l'étape 1 : Sélection du Service
    const renderEtape1 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Sélection du Service</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Type de visite <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {typesVisite.map(type => (
                                <button
                                    key={type.id_type_visite}
                                    type="button"
                                    onClick={() => handleTypeVisiteClick(type.id_type_visite)}
                                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${formData.id_type_visite === type.id_type_visite.toString()
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                        : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-center">{type.libelle_type}</div>
                                </button>
                            ))}
                        </div>
                        {typesVisite.length === 0 && !loadingTypes && (
                            <div className="text-center py-4 text-gray-500">Aucun type de visite disponible</div>
                        )}
                    </div>

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
                                        onClick={() => handleTypeServiceClick(service.id_type_service)}
                                        className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${formData.id_type_service === service.id_type_service.toString()
                                            ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                            : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="font-semibold text-center">{service.libelle_type_service}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

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
        </div>
    );

    // Rendu de l'étape 2 : Informations Organisation (identique)
    const renderEtape2 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Informations Organisation</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Type d'organisation</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['Entreprise', 'Particulier', 'Administration', 'Autre'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleTypeOrganisationClick(type)}
                                    className={`p-3 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${formData.type_organisation === type
                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                                        : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                                        }`}
                                >
                                    <div className="font-semibold text-center text-sm">{type}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Nom de l'organisation</label>
                        <input
                            type="text"
                            name="nom_organisation"
                            value={formData.nom_organisation}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Nom de l'organisation"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // Rendu de l'étape 3 : Informations Personnelles (identique)
    const renderEtape3 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Informations Personnelles</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Nom <span className="text-red-500">*</span></label>
                        <input type="text" name="nom_visiteur" value={formData.nom_visiteur} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Nom du visiteur" required />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Prénom <span className="text-red-500">*</span></label>
                        <input type="text" name="prenom_visiteur" value={formData.prenom_visiteur} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Prénom du visiteur" required />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                        <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="+33 1 23 45 67 89" required />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="email@exemple.com" />
                    </div>
                </div>
            </div>
        </div>
    );

    // Rendu de l'étape 4 : Détails du Rendez-vous (identique)
    const renderEtape4 = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Détails du Rendez-vous</h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-100">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center">
                            <span className="bg-orange-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Date et heure <span className="text-red-500 ml-1">*</span>
                        </label>
                        <button type="button" onClick={ouvrirDateTimePicker}
                            className="w-full px-4 py-4 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-left">
                            {formData.date_rendezvous ? (
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-gray-800 text-lg">{formaterDateAffichage(formData.date_rendezvous)}</div>
                                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-800">Sélectionner une date et heure</div>
                                        <div className="text-sm text-gray-500 mt-1">Lundi-Vendredi 9h-17h</div>
                                    </div>
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">Motif du rendez-vous <span className="text-red-500">*</span></label>
                        <textarea name="motif" value={formData.motif} onChange={handleInputChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            placeholder="Décrivez l'objet de la visite..." required />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEtapeActuelle = () => {
        switch (etapeActuelle) {
            case 1: return renderEtape1();
            case 2: return renderEtape2();
            case 3: return renderEtape3();
            case 4: return renderEtape4();
            default: return renderEtape1();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">

                    {/* Picker de date */}
                    {dateTimePicker.show && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-3xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold">Choisir la date et l'heure</h3>
                                        <button onClick={fermerDateTimePicker} className="text-white hover:text-orange-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div className="text-center font-bold">{formaterDateCalendrier(dateTimePicker.selectedDate)}</div>
                                            <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Heure</label>
                                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                            {creneauxDisponibles.map(creneau => (
                                                <button key={creneau} type="button" onClick={() => handleTimeChange(creneau)}
                                                    className={`p-3 rounded-xl border-2 ${dateTimePicker.selectedTime === creneau
                                                        ? 'bg-orange-500 text-white border-orange-500'
                                                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                                                        }`}>
                                                    {creneau}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button onClick={fermerDateTimePicker} className="flex-1 px-4 py-3 bg-gray-200 rounded-xl font-semibold">Annuler</button>
                                        <button onClick={confirmerDateTime} className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold">Confirmer</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modale de succès */}
                    {showSuccessModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                            <div className="bg-white rounded-3xl shadow-2xl border border-green-200 mx-4 max-w-md w-full">
                                <div className="p-6 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Demande envoyée !</h3>
                                    <p className="text-gray-600 mb-6">Votre demande de rendez-vous a été transmise. Vous serez contacté pour confirmation.</p>
                                    <button onClick={() => setShowSuccessModal(false)}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold transform hover:scale-105">
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Toast Notification */}
                    {toast.show && (
                        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl shadow-2xl border-l-4 ${toast.type === "success" ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    {toast.type === "success" ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <p className="font-medium">{toast.message}</p>
                            </div>
                        </div>
                    )}

                    {/* En-tête */}
                    <div className="text-center mb-8">
                        <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-6">
                                <svg className="w-10 h-10 text-white transform -rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                            Prendre un rendez-vous
                        </h1>

                        {/* Indicateur de progression */}
                        <div className="max-w-2xl mx-auto mb-6">
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 -z-10"></div>
                                <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 -translate-y-1/2 -z-10 transition-all duration-500"
                                    style={{ width: `${((etapeActuelle - 1) / (totalEtapes - 1)) * 100}%` }}></div>
                                {[1, 2, 3, 4].map((etape) => (
                                    <div key={etape} className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${etape <= etapeActuelle
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white shadow-lg scale-110'
                                            : 'bg-white border-gray-300 text-gray-400'
                                            }`}>
                                            {etape < etapeActuelle ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="font-bold text-sm">{etape}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium mt-2 ${etape === etapeActuelle ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
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

                    {/* Message d'erreur */}
                    {message && !message.includes('✅') && (
                        <div className="mb-6 p-4 rounded-2xl border-l-4 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 border-red-500 text-red-800">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p className="font-semibold">{message}</p>
                            </div>
                        </div>
                    )}

                    {/* Carte principale */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden">
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

                        <div className="p-6">
                            {loadingTypes ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
                                    <p className="text-gray-600">Chargement...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-8">{renderEtapeActuelle()}</div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                        {etapeActuelle > 1 && (
                                            <button type="button" onClick={etapePrecedente}
                                                className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 font-bold transform hover:scale-105 shadow-lg">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    <span>Précédent</span>
                                                </div>
                                            </button>
                                        )}

                                        {etapeActuelle < totalEtapes && (
                                            <button type="button" onClick={etapeSuivante} disabled={!peutPasserEtapeSuivante()}
                                                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 font-bold shadow-lg disabled:opacity-50 transform hover:scale-105">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span>Suivant</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>
                                        )}

                                        {etapeActuelle === totalEtapes && (
                                            <>
                                                <button type="button" onClick={handleCancel} disabled={loading}
                                                    className="flex-1 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 font-bold transform hover:scale-105 shadow-lg">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        <span>Annuler</span>
                                                    </div>
                                                </button>
                                                <button type="submit" disabled={loading || !peutPasserEtapeSuivante()}
                                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 font-bold shadow-lg disabled:opacity-50 transform hover:scale-105">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        {loading ? (
                                                            <>
                                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Envoi...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span>Demander</span>
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

                    <div className="text-center mt-6 text-gray-500 text-sm">
                        <p>Horaires d'ouverture : Lundi-Vendredi 9h-17h</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PublicRendezVous;