// src/components/NotificationDetail.jsx
import React from 'react';

const NotificationDetail = ({ visiteur, onClose }) => {
    const formatDate = (date) => {
        try {
            return new Date(date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return date || 'N/A';
        }
    };

    const formatTime = (time) => {
        try {
            return new Date(time).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return time || 'N/A';
        }
    };

    const DetailCard = ({ label, value, icon }) => (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{icon}</span>
                <p className="text-sm text-gray-600 font-medium">{label}</p>
            </div>
            <p className="font-semibold text-gray-800">{value || 'N/A'}</p>
        </div>
    );

    const SectionHeader = ({ title, icon, color }) => (
        <div className={`border-l-4 ${color} pl-4 mb-4`}>
            <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <span>{icon}</span>
                <span>{title}</span>
            </h3>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white p-6 flex justify-between items-center sticky top-0 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">📋</div>
                        <div>
                            <h2 className="text-2xl font-bold">Détails du Visiteur</h2>
                            <p className="text-orange-100 text-sm">{visiteur.nom_complet || 'Visiteur'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                        aria-label="Fermer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Contenu scrollable */}
                <div className="overflow-y-auto flex-1">
                    <div className="p-8 space-y-8">

                        {/* ==================== SECTION 1 : PERSONNELLES ==================== */}
                        <section>
                            <SectionHeader
                                title="Informations Personnelles"
                                icon="👤"
                                color="border-orange-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailCard
                                    label="Nom Complet"
                                    value={visiteur.nom_complet}
                                    icon="👤"
                                />
                                <DetailCard
                                    label="Email"
                                    value={visiteur.email}
                                    icon="📧"
                                />
                                <DetailCard
                                    label="Téléphone"
                                    value={visiteur.telephone}
                                    icon="📞"
                                />
                                <DetailCard
                                    label="Type Organisation"
                                    value={visiteur.type_organisation}
                                    icon="🏷️"
                                />
                            </div>
                        </section>

                        {/* ==================== SECTION 2 : ENTREPRISE ==================== */}
                        <section>
                            <SectionHeader
                                title="Entreprise"
                                icon="🏢"
                                color="border-blue-500"
                            />
                            <DetailCard
                                label="Nom Entreprise"
                                value={visiteur.entreprise}
                                icon="🏢"
                            />
                        </section>

                        {/* ==================== SECTION 3 : DÉTAILS DE VISITE ==================== */}
                        <section>
                            <SectionHeader
                                title="Détails de la Visite"
                                icon="📅"
                                color="border-green-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailCard
                                    label="Date de Visite"
                                    value={formatDate(visiteur.date_visite)}
                                    icon="📆"
                                />
                                <DetailCard
                                    label="Heure d'Arrivée"
                                    value={formatTime(visiteur.heure_arrivee)}
                                    icon="🕐"
                                />
                                <DetailCard
                                    label="Motif de Visite"
                                    value={visiteur.objet_visite}
                                    icon="📝"
                                />
                                <DetailCard
                                    label="Hôte/Destinataire"
                                    value={visiteur.hote}
                                    icon="👨‍💼"
                                />
                                <DetailCard
                                    label="Durée Prévue"
                                    value={visiteur.duree_prevue}
                                    icon="⏱️"
                                />
                                <DetailCard
                                    label="Heure de Départ"
                                    value={formatTime(visiteur.heure_depart)}
                                    icon="🕑"
                                />
                            </div>
                        </section>

                        {/* ==================== SECTION 4 : IDENTIFICATION ==================== */}
                        <section>
                            <SectionHeader
                                title="Identification"
                                icon="🆔"
                                color="border-purple-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailCard
                                    label="Numéro Badge"
                                    value={visiteur.numero_badge}
                                    icon="🎫"
                                />
                                <DetailCard
                                    label="Numéro Plaque"
                                    value={visiteur.numero_plaque}
                                    icon="🚗"
                                />
                            </div>
                        </section>

                        {/* ==================== SECTION 5 : STATUT ==================== */}
                        <section>
                            <SectionHeader
                                title="Statut & Département"
                                icon="📊"
                                color="border-red-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 font-medium mb-2">Statut</p>
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-3 h-3 rounded-full ${visiteur.statut === 'en_attente' ? 'bg-yellow-500' :
                                            visiteur.statut === 'accepté' ? 'bg-green-500' :
                                                visiteur.statut === 'rejeté' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                            }`}></span>
                                        <p className="font-semibold text-gray-800 capitalize">
                                            {visiteur.statut || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <DetailCard
                                    label="Département"
                                    value={visiteur.departement}
                                    icon="🏛️"
                                />
                            </div>
                        </section>

                        {/* ==================== SECTION 6 : CLASSIFICATION ==================== */}
                        <section>
                            <SectionHeader
                                title="Classification"
                                icon="🎯"
                                color="border-yellow-500"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <DetailCard
                                    label="Type de Visite"
                                    value={visiteur.type_visite}
                                    icon="📑"
                                />
                                <DetailCard
                                    label="Type de Service"
                                    value={visiteur.type_service}
                                    icon="⚙️"
                                />
                            </div>
                        </section>

                        {/* ==================== SECTION 7 : NOTES ==================== */}
                        {visiteur.notes && (
                            <section>
                                <SectionHeader
                                    title="Notes & Observations"
                                    icon="📝"
                                    color="border-indigo-500"
                                />
                                <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                                    <p className="text-gray-800 leading-relaxed">{visiteur.notes}</p>
                                </div>
                            </section>
                        )}

                        {/* ==================== SECTION 8 : MÉTADONNÉES ==================== */}
                        <section className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500">
                                📍 Horodatage: {new Date(visiteur.timestamp).toLocaleString('fr-FR')}
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                    >
                        ✓ Fermer
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                        title="Imprimer les détails"
                    >
                        🖨️ Imprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetail;
