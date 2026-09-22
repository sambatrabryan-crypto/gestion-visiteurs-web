import React, { useState, useEffect, useCallback } from 'react';

function ModifierVisiteur({ onBack, visiteur, onUpdate, apiCall, showAlert }) {
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
    const [ciblageSelectionne, setCiblageSelectionne] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // 🔹 Charger les règles de ciblage depuis l'API
    useEffect(() => {
        chargerCiblages();
    }, [apiCall]);

    const initialiserDonneesVisiteur = useCallback(() => {
        if (!visiteur) return;

        console.log('Données du visiteur reçues:', visiteur);

        // Récupérer le ciblage complet à partir de l'ID ciblage
        const ciblageComplet = ciblagesDisponibles.find(c => c.id_ciblage === visiteur.id_ciblage);

        if (ciblageComplet) {
            console.log('Ciblage trouvé:', ciblageComplet);
            setFormData({
                nom_visiteur: visiteur.nom_visiteur || '',
                prenom_visiteur: visiteur.prenom_visiteur || '',
                telephone: visiteur.telephone || '',
                email: visiteur.email || '',
                nom_organisation: visiteur.nom_organisation || '',
                type_organisation: visiteur.type_organisation || '',
                id_ciblage: visiteur.id_ciblage?.toString() || '',
                id_type_visite: ciblageComplet.id_type_visite?.toString() || '',
                id_type_service: ciblageComplet.id_type_service?.toString() || ''
            });

            setCiblageSelectionne(ciblageComplet);
        } else {
            console.log('Aucun ciblage trouvé pour ID:', visiteur.id_ciblage);
            // Initialiser sans les types si le ciblage n'est pas trouvé
            setFormData({
                nom_visiteur: visiteur.nom_visiteur || '',
                prenom_visiteur: visiteur.prenom_visiteur || '',
                telephone: visiteur.telephone || '',
                email: visiteur.email || '',
                nom_organisation: visiteur.nom_organisation || '',
                type_organisation: visiteur.type_organisation || '',
                id_ciblage: visiteur.id_ciblage?.toString() || '',
                id_type_visite: '',
                id_type_service: ''
            });
        }
    }, [visiteur, ciblagesDisponibles]);

    // 🔹 Initialiser les données du visiteur une fois les ciblages chargés
    useEffect(() => {
        if (visiteur && ciblagesDisponibles.length > 0) {
            initialiserDonneesVisiteur();
            setInitialLoading(false);
        }
    }, [visiteur, ciblagesDisponibles, initialiserDonneesVisiteur]);

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

        // Ne réinitialiser que si le service actuel n'est pas compatible avec le nouveau type de visite
        if (formData.id_type_service) {
            const serviceActuelEstValide = servicesUniques.some(
                service => service.id_type_service === parseInt(formData.id_type_service)
            );
            if (!serviceActuelEstValide) {
                setFormData(prev => ({ ...prev, id_type_service: '', id_ciblage: '' }));
                setCiblageSelectionne(null);
            }
        }
    }, [formData.id_type_visite, ciblagesDisponibles, formData.id_type_service]);

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

    const chargerCiblages = async () => {
        setInitialLoading(true);
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
            const errorMessage = error.message || 'Erreur lors du chargement des règles de ciblage';
            showAlert(errorMessage, "error");
        } finally {
            setInitialLoading(false);
        }
    };

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

        try {
            // Validation des champs requis
            if (!formData.nom_visiteur.trim() || !formData.prenom_visiteur.trim() || !formData.telephone.trim()) {
                const errorMessage = 'Veuillez remplir les champs obligatoires (Nom, Prénom, Téléphone)';
                showAlert(errorMessage, "error");
                setLoading(false);
                return;
            }

            // ❌ SUPPRIMER la validation du ciblage - NE PLUS EXIGER
            // if (!formData.id_ciblage || !formData.id_type_visite || !formData.id_type_service) {
            //     setMessage('❌ Veuillez sélectionner un type de visite et un type de service valides');
            //     setLoading(false);
            //     return;
            // }

            // ❌ SUPPRIMER id_ciblage, id_type_visite, id_type_service de l'envoi
            const dataToSend = {
                nom_visiteur: formData.nom_visiteur,
                prenom_visiteur: formData.prenom_visiteur,
                telephone: formData.telephone,
                email: formData.email || null,
                nom_organisation: formData.nom_organisation || null,
                type_organisation: formData.type_organisation || null,
                // ❌ NE PLUS ENVOYER:
                // id_ciblage: parseInt(formData.id_ciblage),
                // id_type_visite: parseInt(formData.id_type_visite),
                // id_type_service: parseInt(formData.id_type_service),
            };

            console.log('📤 Modification visiteur:', dataToSend);

            const result = await apiCall(`/visiteurs/${visiteur.id_visiteur}`, {
                method: 'PUT',
                body: JSON.stringify(dataToSend)
            });

            console.log("✅ Visiteur modifié:", result);

            const successMessage = result.message || 'Visiteur modifié avec succès!';
            showAlert(successMessage, "success");

            if (onUpdate) {
                onUpdate(result);
            }

            setTimeout(() => {
                onBack();
            }, 1000); // Réduit à 1 seconde pour une meilleure UX

        } catch (error) {
            console.error("❌ Erreur modification visiteur:", error);

            let errorMessage = error.message || "Erreur lors de la modification";

            // ✅ Message spécifique pour visiteur en cours de prise en charge
            if (error.status === 403 || errorMessage.includes('En cours')) {
                errorMessage = 'Impossible de modifier un visiteur en cours de prise en charge';
            } else if (error.status === 400) {
                errorMessage = 'Données invalides. Vérifiez les champs du formulaire.';
            }

            showAlert(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onBack();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">

                    {/* En-tête moderne */}
                    <div className="text-center mb-12">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform rotate-6">
                                <svg className="w-12 h-12 text-white transform -rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-4 border-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                            Modifier la Visite
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-4"></div>
                        <p className="text-gray-600 text-lg">Modification du visiteur</p>
                    </div>

                    {/* Carte principale modernisée */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden transform hover:shadow-2xl transition-all duration-300">

                        {/* En-tête de la carte */}
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">Modification du Visiteur</h2>
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-white text-sm font-medium">Modification</span>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <div className="p-8">
                            {initialLoading ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-6"></div>
                                    <p className="text-gray-600 text-lg">Chargement en cours...</p>
                                    <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {/* Section Informations personnelles */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-gray-800">Informations Personnelles</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
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
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
                                                    placeholder="Prénom du visiteur"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Contact */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
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
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
                                                    placeholder="email@exemple.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organisation */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-gray-800">Informations Organisation</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Organisation
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nom_organisation"
                                                    value={formData.nom_organisation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300"
                                                    placeholder="Nom de l'organisation"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Type d'organisation
                                                </label>
                                                <select
                                                    name="type_organisation"
                                                    value={formData.type_organisation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:border-orange-300 appearance-none"
                                                >
                                                    <option value="">Sélectionnez le type...</option>
                                                    <option value="Entreprise">Entreprise</option>
                                                    <option value="Particulier">Particulier</option>
                                                    <option value="Administration">Administration</option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION CIBLAGE - LECTURE SEULE */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                                            <h3 className="text-xl font-bold text-gray-800">Ciblage (non modifiable)</h3>
                                        </div>

                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
                                            {ciblageSelectionne ? (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-semibold text-gray-600">Type de visite</span>
                                                        <div className="text-gray-800 font-medium mt-1">
                                                            {ciblageSelectionne.type_visite?.libelle_type}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-600">Type de service</span>
                                                        <div className="text-gray-800 font-medium mt-1">
                                                            {ciblageSelectionne.type_service?.libelle_type_service}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-gray-600">Département</span>
                                                        <div className="text-gray-800 font-bold text-lg mt-1">
                                                            {ciblageSelectionne.departement?.nom_departement}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 text-center">Aucun ciblage associé</p>
                                            )}

                                            {/* Message d'information */}
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center space-x-2 text-blue-700">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">
                                                        Le ciblage ne peut pas être modifié après la création
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Boutons d'action modernisés */}
                                    <div className="flex flex-col sm:flex-row gap-6 pt-8 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex-1 px-8 py-5 bg-white border-3 border-orange-500 text-orange-600 rounded-2xl hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                                        >
                                            <div className="flex items-center justify-center space-x-3">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>Annuler</span>
                                            </div>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 px-8 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-offset-2 transition-all duration-300 font-bold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 hover:shadow-2xl"
                                        >
                                            <div className="flex items-center justify-center space-x-3">
                                                {loading ? (
                                                    <>
                                                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Modification...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Modifier la visite</span>
                                                    </>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Pied de page */}
                    <div className="text-center mt-8 text-gray-500 text-sm">
                        <p>Système de gestion des visiteurs</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModifierVisiteur;