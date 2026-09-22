// src/utils/componentLoader.js

export const loadAppComponents = async () => {
    try {
        console.log('🔍 DEBUG: Début du chargement des composants...');

        const imports = [
            import('../components/Accueil'),
            import('../components/FormulaireVisiteur'),
            import('../components/RendezVous'),
            import('../components/ListeVisiteurs'),
            import('../components/ListeRendezVous'),
            import('../components/CRUDDepartements'),
            import('../components/CRUDEmployes'),
            import('../components/ModifierRendezVous'),
            import('../components/ModifierVisiteur'),
            import('../components/Rapport'),
            // ADMIN
            import('../components/admin/GestionCiblages'),
            import('../components/admin/GestionTypesService'),
            import('../components/admin/GestionUtilisateurs')
        ];

        const componentNames = [
            'Accueil', 'FormulaireVisiteur', 'RendezVous', 'ListeVisiteurs',
            'ListeRendezVous', 'CRUDDepartements', 'CRUDEmployes',
            'ModifierRendezVous', 'ModifierVisiteur', 'Rapport',
            'GestionCiblages', 'GestionTypesService', 'GestionUtilisateurs'
        ];

        const componentModules = await Promise.allSettled(imports);

        const loadedComponents = {};
        componentModules.forEach((result, index) => {
            const name = componentNames[index];
            if (result.status === 'fulfilled') {
                loadedComponents[name] = result.value.default;
                console.log(`✅ ${name} → CHARGÉ`);
            } else {
                loadedComponents[name] = null;
                console.error(`❌ ${name} → ERREUR:`, result.reason);
            }
        });

        return loadedComponents;

    } catch (error) {
        console.error('💥 ERREUR GLOBALE componentLoader:', error);
        return {};
    }
};
