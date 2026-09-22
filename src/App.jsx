// src/App.jsx - VERSION CORRIGÉE (Hooks toujours au même endroit)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LogOut, Menu, X, User, Shield, Calendar } from 'lucide-react';

// 🔥 COMPOSANTS
import Login from './components/Login';
import NotificationDetail from './components/NotificationDetail';
import KibanaEmbed from './components/KibanaEmbed';
import PublicRendezVous from './components/PublicRendezVous';

// 🔥 SERVICES & UTILS EXTERNALISÉS
import { apiService } from './services/apiService';
import { useAuth } from './hooks/useAuth';
import { requestPermission, onMessageListener } from "./firebase";
import {
  USER_ROLES,
  Permissions,
  getMenuItems,
  getPageTitle,
  getPageSubtitle,
  validateNavigation
} from './utils/rolePermissions';
import { getMenuIcon } from './utils/menuIcons';
import { showAlert, alertConfig } from './utils/alertUtils';
import { loadAppComponents } from './utils/componentLoader';

// ==================== COMPOSANT PRINCIPAL APP ====================

function App() {
  // 🔥 TOUS LES HOOKS DOIVENT ÊTRE DÉCLARÉS ICI (avant tout return conditionnel)

  // HOOK D'AUTHENTIFICATION (toujours appelé)
  const {
    isAuthenticated,
    currentUser,
    getUserRole,
    handleLoginSuccess: authLoginSuccess,
    handleLogout: authLogout
  } = useAuth();

  // ÉTATS LOCAUX (toujours déclarés)
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView || 'accueil';
  });
  const [selectedRendezVous, setSelectedRendezVous] = useState(null);
  const [selectedVisiteur, setSelectedVisiteur] = useState(null);
  const [stats, setStats] = useState({
    visitesAujourdhui: 0,
    rdvPlanifies: 0,
    enAttente: 0
  });
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [components, setComponents] = useState({});
  const [appInitialized, setAppInitialized] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const menuRef = useRef(null);

  // FONCTIONS MÉMOISÉES (toujours déclarées)
  const showAlertMessage = useCallback((message, type = 'success') => {
    showAlert(setAlert, message, type);
  }, []);

  // GESTION DES DONNÉES
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const realStats = await apiService.fetchStats();
      setStats(realStats);
    } catch (error) {
      console.warn('Stats non disponibles:', error.message);
      setStats({
        visitesAujourdhui: Math.floor(Math.random() * 20) + 5,
        rdvPlanifies: Math.floor(Math.random() * 15) + 3,
        enAttente: Math.floor(Math.random() * 10) + 1
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // GESTION DES NOTIFICATIONS FIREBASE
  const handleFirebaseNotification = useCallback((payload) => {
    const type = payload.data?.type || 'new_visitor';
    console.log(`📊 Type: ${type}`);

    const handleRendezVousNotification = (payload, type) => {
      const rendezvousData = {
        id_rendezvous: payload.data?.id_rendezvous || '',
        nom_complet: payload.data?.nom_complet || `${payload.data?.prenom || ''} ${payload.data?.nom || ''}`.trim(),
        prenom: payload.data?.prenom || '',
        nom: payload.data?.nom || '',
        email: payload.data?.email || '',
        telephone: payload.data?.telephone || '',
        nom_organisation: payload.data?.nom_organisation || '',
        type_organisation: payload.data?.type_organisation || '',
        date_rendezvous: payload.data?.date_rendezvous || '',
        duree_estimee: payload.data?.duree_estimee || '60',
        motif: payload.data?.motif || '',
        statut: payload.data?.statut || '',
        id_status: payload.data?.id_status || '',
        ancien_statut: payload.data?.ancien_statut || '',
        type_visite: payload.data?.type_visite || '',
        type_service: payload.data?.type_service || '',
        date_prise_en_charge: payload.data?.date_prise_en_charge || '',
        duree_prise_en_charge: payload.data?.duree_prise_en_charge || '0',
        timestamp: payload.data?.timestamp || new Date().toISOString()
      };

      if (payload.notification) {
        if (type === 'new_rendezvous') {
          showAlertMessage(`📅 ${payload.notification.title}\n${payload.notification.body}`, 'success');
          fetchStats();
        } else if (type === 'status_changed') {
          const duree = rendezvousData.duree_prise_en_charge;
          const dureeText = duree && parseInt(duree) > 0
            ? ` (${Math.floor(parseInt(duree) / 60)} min)`
            : '';
          showAlertMessage(`📊 RDV: ${rendezvousData.statut}${dureeText}\n${rendezvousData.nom_complet}`, 'success');
          fetchStats();
        } else if (type === 'rendezvous_updated') {
          showAlertMessage(`📝 RDV mis à jour\n${rendezvousData.nom_complet}`, 'success');
          fetchStats();
        }
      }
    };

    const handleVisiteurNotification = (payload, type) => {
      const visiteurData = {
        id_visiteur: payload.data?.id_visiteur || '',
        nom_complet: payload.data?.nom_complet || `${payload.data?.prenom || ''} ${payload.data?.nom || ''}`.trim(),
        prenom: payload.data?.prenom || '',
        nom: payload.data?.nom || '',
        email: payload.data?.email || '',
        telephone: payload.data?.telephone || '',
        nom_organisation: payload.data?.nom_organisation || '',
        type_organisation: payload.data?.type_organisation || '',
        date_visite: payload.data?.date_visite || '',
        statut: payload.data?.statut || '',
        id_status: payload.data?.id_status || '',
        ancien_statut: payload.data?.ancien_statut || '',
        departement: payload.data?.departement || '',
        type_visite: payload.data?.type_visite || '',
        type_service: payload.data?.type_service || '',
        date_prise_en_charge: payload.data?.date_prise_en_charge || '',
        duree_prise_en_charge: payload.data?.duree_prise_en_charge || '0',
        timestamp: payload.data?.timestamp || new Date().toISOString()
      };

      if (payload.notification) {
        if (type === 'new_visitor') {
          showAlertMessage(`${payload.notification.title}\n${payload.notification.body}`, 'success');
          setSelectedNotification(visiteurData);
          fetchStats();
        } else if (type === 'status_changed') {
          const duree = visiteurData.duree_prise_en_charge;
          const dureeText = duree && parseInt(duree) > 0
            ? ` (${Math.floor(parseInt(duree) / 60)} min)`
            : '';
          showAlertMessage(`📊 Statut: ${visiteurData.statut}${dureeText}\n${visiteurData.nom_complet}`, 'success');
          fetchStats();
        } else if (type === 'visitor_updated') {
          showAlertMessage(`📝 Mis à jour\n${visiteurData.nom_complet}`, 'success');
          fetchStats();
        }
      }
    };

    if (type === 'new_rendezvous' || type.includes('rendezvous')) {
      handleRendezVousNotification(payload, type);
    } else {
      handleVisiteurNotification(payload, type);
    }
  }, [showAlertMessage, fetchStats]);

  // EFFETS PRINCIPAUX (toujours déclarés)
  useEffect(() => {
    if (!isAuthenticated) return;

    const initializeApp = async () => {
      console.log('🚀 Initialisation de l\'application...');

      const role = getUserRole();

      if (role === USER_ROLES.KIOSQUE) {
        setCurrentView('rendezvous');
      } else if (role === USER_ROLES.UTILISATEUR) {
        setCurrentView('rapports');
      } else if (role === USER_ROLES.ACCUEIL) {
        setCurrentView('liste-visiteurs');
      } else {
        setCurrentView('accueil');
      }

      setSelectedRendezVous(null);
      setSelectedVisiteur(null);
      setIsMenuOpen(false);
      setAlert({ show: false, message: '', type: '' });

      if (role === USER_ROLES.ADMIN) {
        await fetchStats();
      } else if (role === USER_ROLES.ACCUEIL) {
        try {
          const visiteursDuJour = await apiService.call('/visiteurs/today');
          setStats({
            visitesAujourdhui: visiteursDuJour.length || 0,
            rdvPlanifies: 0,
            enAttente: visiteursDuJour.filter(v => v.statut === 'en attente').length || 0
          });
        } catch (error) {
          console.warn('Stats visiteurs non disponibles:', error.message);
          setStats({
            visitesAujourdhui: Math.floor(Math.random() * 20) + 5,
            rdvPlanifies: 0,
            enAttente: Math.floor(Math.random() * 10) + 1
          });
        }
      }

      setAppInitialized(true);
      console.log('✅ Application initialisée');
    };

    if (!appInitialized) {
      initializeApp();
    }
  }, [isAuthenticated, appInitialized, getUserRole, fetchStats]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const setupFirebaseNotifications = async () => {
      console.log('🔔 Configuration Firebase...');

      try {
        const token = await requestPermission();
        if (token) {
          console.log('✅ Permission Firebase + Abonnement topics OK');
          await apiService.registerFCMToken(token);
        } else {
          console.warn('⚠️ Aucun token FCM obtenu');
        }
      } catch (error) {
        console.warn('⚠️ Erreur permission Firebase:', error);
      }

      onMessageListener().then(payload => {
        console.log('📨 Notification Firebase reçue:', payload);
        handleFirebaseNotification(payload);
      }).catch(error => {
        console.warn('⚠️ Erreur Firebase:', error);
      });
    };

    setupFirebaseNotifications();
  }, [isAuthenticated, handleFirebaseNotification]);

  useEffect(() => {
    if (appInitialized) {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView, appInitialized]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadComponents = async () => {
      const loadedComponents = await loadAppComponents();
      setComponents(loadedComponents);
    };

    loadComponents();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // GESTION AUTHENTIFICATION
  const handleLoginSuccess = async (user) => {
    authLoginSuccess(user);

    const role = getUserRole();

    if (role === USER_ROLES.KIOSQUE) {
      setCurrentView('rendezvous');
    } else if (role === USER_ROLES.UTILISATEUR) {
      setCurrentView('rapports');
    } else if (role === USER_ROLES.ACCUEIL) {
      setCurrentView('liste-visiteurs');
    } else {
      setCurrentView('accueil');
    }

    showAlertMessage('Connexion réussie ! Bienvenue.', 'success');
  };

  const handleLogout = async () => {
    console.log('🔴🔴🔴 LOGOUT WEB INITIÉ 🔴🔴🔴');

    try {
      await apiService.call('/utilisateurs/logout', { method: 'POST' });
      console.log('✅ Backend logout réussi');
    } catch (error) {
      console.warn('⚠️ Erreur logout backend:', error.message);
    }

    localStorage.removeItem('currentView');
    authLogout();

    setCurrentView('accueil');
    setSelectedRendezVous(null);
    setSelectedVisiteur(null);
    setIsMenuOpen(false);
    setAppInitialized(false);

    console.log('🔴🔴🔴 LOGOUT WEB COMPLÉTÉ ✅ 🔴🔴🔴');
    showAlertMessage('Déconnexion réussie. À bientôt !', 'success');
  };

  // NAVIGATION
  const handleNavigate = (view, data = null) => {
    const userRole = getUserRole();
    console.log('🔍 handleNavigate - Rôle utilisateur:', userRole, 'Vue demandée:', view);

    const validation = validateNavigation(view, currentUser);
    if (!validation.allowed) {
      showAlertMessage(validation.message, 'error');
      return;
    }

    if (view === 'modifier-rendezvous') {
      setSelectedRendezVous(data);
    } else if (view === 'modifier-visiteur') {
      setSelectedVisiteur(data);
    }
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  const handleBackRendezVous = () => {
    setCurrentView('liste-rendezvous');
    setSelectedRendezVous(null);
  };

  const handleBackVisiteur = () => {
    setCurrentView('liste-visiteurs');
    setSelectedVisiteur(null);
  };

  const handleResetToHome = () => {
    const userRole = getUserRole();

    if (userRole === USER_ROLES.ACCUEIL) {
      setCurrentView('liste-visiteurs');
      return;
    }

    if (userRole === USER_ROLES.KIOSQUE) {
      setCurrentView('rendezvous');
      return;
    }
    if (userRole === USER_ROLES.UTILISATEUR) {
      setCurrentView('rapports');
      return;
    }

    setCurrentView('accueil');
    setSelectedRendezVous(null);
    setSelectedVisiteur(null);
    setIsMenuOpen(false);

    if (userRole === USER_ROLES.ADMIN) {
      fetchStats();
    }
  };

  const creerVisiteur = async (dataVisiteur) => {
    try {
      const result = await apiService.createVisiteur(dataVisiteur);

      const role = getUserRole();
      if (role === USER_ROLES.ADMIN) {
        await fetchStats();
      } else if (role === USER_ROLES.ACCUEIL) {
        setStats(prev => ({
          ...prev,
          visitesAujourdhui: prev.visitesAujourdhui + 1,
          enAttente: prev.enAttente + 1
        }));
      }

      return { success: true, data: result };
    } catch (error) {
      showAlertMessage(error.message, 'error');
      return { success: false, error: error.message };
    }
  };

  const creerRendezVous = async (dataRendezVous) => {
    try {
      const result = await apiService.createRendezVous(dataRendezVous);

      if (getUserRole() === USER_ROLES.ADMIN) {
        await fetchStats();
      }

      return { success: true, data: result };
    } catch (error) {
      showAlertMessage(error.message, 'error');
      return { success: false, error: error.message };
    }
  };

  const handleUpdateRendezVous = () => {
    if (getUserRole() === USER_ROLES.ADMIN) {
      fetchStats();
    }
  };

  const handleUpdateVisiteur = () => {
    const role = getUserRole();
    if (role === USER_ROLES.ADMIN) {
      fetchStats();
    } else if (role === USER_ROLES.ACCUEIL) {
      apiService.call('/visiteurs/today')
        .then(visiteursDuJour => {
          setStats({
            visitesAujourdhui: visiteursDuJour.length || 0,
            rdvPlanifies: 0,
            enAttente: visiteursDuJour.filter(v => v.statut === 'en attente').length || 0
          });
        })
        .catch(console.warn);
    }
  };

  // ==================== RENDU PRINCIPAL ====================
  // VÉRIFICATION DE LA ROUTE PUBLIQUE APRÈS TOUS LES HOOKS

  const isPublicRoute = window.location.pathname === '/public/rendez-vous';

  if (isPublicRoute) {
    return <PublicRendezVous />;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} apiCall={apiService.call} />;
  }

  // ==================== COMPOSANTS INTERNES ====================

  const FallbackComponent = ({ componentName }) => (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Composant manquant</h1>
        <p className="text-gray-600">Le composant {componentName} n'a pas pu être chargé.</p>
        <button
          onClick={handleResetToHome}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors duration-200"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  const BackButton = () => {
    const userRole = getUserRole();

    if (userRole === USER_ROLES.KIOSQUE) return null;
    if (userRole === USER_ROLES.UTILISATEUR) return null;
    if (userRole === USER_ROLES.ACCUEIL && currentView === 'liste-visiteurs') return null;
    if (currentView === 'accueil') return null;

    return (
      <button
        onClick={handleResetToHome}
        className="group relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:from-orange-600 hover:to-red-700 z-30 overflow-hidden"
        title="Retour à l'accueil"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <svg
          className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
    );
  };

  const GlobalAlert = () => {
    if (!alert.show) return null;

    const config = alertConfig[alert.type] || alertConfig.success;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className={`relative w-full max-w-md mx-4 ${config.bgColor} ${config.borderColor} border-2 rounded-3xl shadow-2xl z-50 transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95`}>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full ${config.bgColor} border-2 ${config.borderColor}`}>
                {config.icon}
              </div>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${config.textColor}`}>
              {alert.type === 'success' ? 'Succès' : 'Erreur'}
            </h3>
            <p className={`text-lg mb-6 ${config.textColor} whitespace-pre-line`}>
              {alert.message}
            </p>
            <button
              onClick={() => setAlert({ show: false, message: '', type: '' })}
              className={`px-8 py-3 ${config.progressColor} text-white rounded-full font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-lg`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ModernMenu = () => {
    const userRole = getUserRole();
    const menuItems = getMenuItems(currentView, userRole);

    const getRoleLabel = () => {
      switch (userRole) {
        case USER_ROLES.ADMIN: return 'Administrateur';
        case USER_ROLES.UTILISATEUR: return 'Utilisateur';
        case USER_ROLES.ACCUEIL: return 'Accueil';
        case USER_ROLES.KIOSQUE: return 'Kiosque';
        default: return 'Utilisateur';
      }
    };

    return (
      <div
        ref={menuRef}
        className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-white to-orange-50 border-r border-orange-200 z-40 shadow-2xl transform transition-all duration-300 ease-in-out backdrop-blur-lg"
        style={{
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          opacity: isMenuOpen ? 1 : 0
        }}
      >
        <div className="p-6 border-b border-orange-200 bg-gradient-to-r from-orange-500 to-red-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-1.5 rounded-lg shadow-lg">
                <img
                  src="/EA.png"
                  alt="Logo EA"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs rounded">EA</div>';
                  }}
                />
              </div>
              <div>
                <p className="text-white font-bold text-sm">EUROP INNOVATION</p>
                <p className="text-orange-200 text-xs">Continuelle</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-white hover:text-orange-200 transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {currentUser && (
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm truncate">
                    {currentUser.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Shield className="w-3 h-3 text-orange-200" />
                    <p className="text-orange-100 text-xs capitalize">
                      {getRoleLabel()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="py-4 overflow-y-auto h-[calc(100vh-200px)]">
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <div key={`separator-${index}`} className="my-2 px-6">
                  <div className="border-t border-orange-100"></div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    handleLogout();
                  } else {
                    handleNavigate(item.id);
                  }
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-all duration-200 group relative overflow-hidden ${item.special
                  ? 'hover:bg-red-50 text-red-600 hover:text-red-700 mt-4 border-t border-orange-100'
                  : item.active
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className={`flex-shrink-0 relative z-10 ${item.special
                  ? 'text-red-500 group-hover:text-red-600'
                  : item.active
                    ? 'text-white'
                    : 'text-orange-500 group-hover:text-orange-600'
                  }`}>
                  {getMenuIcon(item.icon)}
                </div>
                <span className={`font-medium relative z-10 ${item.special
                  ? 'text-red-600 group-hover:text-red-700'
                  : item.active
                    ? 'text-white'
                    : 'text-gray-700 group-hover:text-orange-600'
                  }`}>
                  {item.title}
                </span>
                {item.active && !item.special && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse relative z-10"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-200 bg-white/80 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">© 2024 EUROP-ALU</p>
            <p className="text-xs text-gray-400 mt-1">Version 2.0.0</p>
          </div>
        </div>
      </div>
    );
  };

  const MenuToggleButton = () => (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-50 relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      {isMenuOpen ? <X className="w-6 h-6 relative z-10" /> : <Menu className="w-6 h-6 relative z-10" />}
    </button>
  );

  const renderView = () => {
    if (Object.keys(components).length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement des composants...</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      showAlert: showAlertMessage,
      onNavigate: handleNavigate,
      onBack: handleResetToHome,
      apiCall: apiService.call
    };

    const viewComponents = {
      'accueil': components.Accueil ? (
        <components.Accueil
          onNavigate={handleNavigate}
          stats={stats}
          loading={loading}
          onRefresh={fetchStats}
          user={currentUser}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="Accueil" />,

      'formulaire': components.FormulaireVisiteur ? (
        <components.FormulaireVisiteur
          onBack={handleResetToHome}
          onCreateVisiteur={creerVisiteur}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="FormulaireVisiteur" />,

      'rendezvous': components.RendezVous ? (
        <components.RendezVous
          onBack={handleResetToHome}
          onCreateRendezVous={creerRendezVous}
          onNavigate={handleNavigate}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="RendezVous" />,

      'liste-visiteurs': components.ListeVisiteurs ? (
        <components.ListeVisiteurs
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          canEdit={Permissions.canEditVisitor(currentUser)}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="ListeVisiteurs" />,

      'liste-rendezvous': components.ListeRendezVous ? (
        <components.ListeRendezVous
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          canEdit={Permissions.canEditRendezVous(currentUser)}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="ListeRendezVous" />,

      'crud-departements': components.CRUDDepartements ? (
        <components.CRUDDepartements
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="CRUDDepartements" />,

      'crud-employes': components.CRUDEmployes ? (
        <components.CRUDEmployes
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="CRUDEmployes" />,

      'modifier-rendezvous': components.ModifierRendezVous && selectedRendezVous ? (
        <components.ModifierRendezVous
          onBack={handleBackRendezVous}
          rendezvous={selectedRendezVous}
          onUpdate={handleUpdateRendezVous}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="ModifierRendezVous" />,

      'modifier-visiteur': components.ModifierVisiteur && selectedVisiteur ? (
        <components.ModifierVisiteur
          onBack={handleBackVisiteur}
          visiteur={selectedVisiteur}
          onUpdate={handleUpdateVisiteur}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="ModifierVisiteur" />,

      'gestion-ciblages': components.GestionCiblages ? (
        <components.GestionCiblages
          apiCall={apiService.call}
          showAlert={showAlertMessage}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="GestionCiblages" />,

      'gestion-types-service': components.GestionTypesService ? (
        <components.GestionTypesService
          apiCall={apiService.call}
          showAlert={showAlertMessage}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="GestionTypesService" />,

      'gestion-utilisateurs': components.GestionUtilisateurs ? (
        <components.GestionUtilisateurs
          apiCall={apiService.call}
          showAlert={showAlertMessage}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="GestionUtilisateurs" />,

      'statistiques': Permissions.canViewStatistics(currentUser) ? (
        <KibanaEmbed
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          {...commonProps}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h1>
            <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <button
              onClick={handleResetToHome}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors duration-200"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      ),

      'rapports': components.Rapport ? (
        <components.Rapport
          onBack={handleResetToHome}
          onNavigate={handleNavigate}
          apiCall={apiService.call}
          showAlert={showAlertMessage}
          {...commonProps}
        />
      ) : <FallbackComponent componentName="Rapport" />
    };

    return viewComponents[currentView] || viewComponents['accueil'];
  };

  // MODE KIOSQUE
  if (isAuthenticated && getUserRole() === USER_ROLES.KIOSQUE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <nav className={`fixed left-0 top-0 bottom-0 bg-gradient-to-b from-orange-500 to-orange-700 transition-all duration-300 z-50 flex flex-col ${isMenuOpen ? 'w-80' : 'w-20'} shadow-2xl`}>
          <div className="p-4 border-b border-orange-600 flex items-center justify-between">
            {isMenuOpen ? (
              <div className="flex items-center space-x-3">
                <div className="bg-white p-1.5 rounded-lg">
                  <img
                    src="/EA.png"
                    alt="Logo EA"
                    className="w-6 h-6 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-6 h-6 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-xs rounded">EA</div>';
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">KIOSQUE</p>
                  <p className="text-orange-200 text-xs">Rendez-vous</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto">
                <img
                  src="/EA.png"
                  alt="EA"
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="text-orange-600 font-bold text-xs">EA</div>';
                  }}
                />
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-orange-600 rounded-lg p-2 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {isMenuOpen && currentUser && (
            <div className="p-4 border-b border-orange-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-orange-200 text-xs">Kiosque</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 py-4">
            {isMenuOpen && (
              <div className="space-y-2 px-4">
                <button
                  onClick={() => handleNavigate('rendezvous')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  <Calendar size={18} />
                  <span className="font-medium">Nouveau RDV</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-orange-600">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center space-x-3 px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors ${!isMenuOpen && 'px-3'}`}
            >
              <LogOut size={18} />
              {isMenuOpen && <span className="font-medium">Déconnexion</span>}
            </button>
          </div>
        </nav>

        <div className={`transition-all duration-300 ${isMenuOpen ? 'ml-80' : 'ml-20'}`}>
          <div className="bg-white border-b">
            <div className="h-4"></div>
          </div>
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {components.RendezVous ? (
                <components.RendezVous
                  onBack={handleResetToHome}
                  onCreateRendezVous={creerRendezVous}
                  onNavigate={handleNavigate}
                  kioskMode={true}
                  showAlert={showAlertMessage}
                  apiCall={apiService.call}
                />
              ) : (
                <FallbackComponent componentName="RendezVous" />
              )}
            </div>
          </div>
        </div>

        <GlobalAlert />
      </div>
    );
  }

  // Rendu normal pour les autres rôles
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-white flex">
      <GlobalAlert />
      {selectedNotification && (
        <NotificationDetail
          visiteur={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
      <ModernMenu />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMenuOpen ? 'md:ml-80' : 'ml-0'}`}>
        <header className="bg-white/90 backdrop-blur-lg border-b border-orange-200 shadow-lg relative z-30">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <MenuToggleButton />

              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2.5 rounded-xl shadow-2xl">
                      <img
                        src="/EA.png"
                        alt="Logo EA"
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-12 h-12 flex items-center justify-center text-white font-bold text-lg rounded">EA</div>';
                        }}
                      />
                    </div>

                    <div className="h-10 w-px bg-gradient-to-b from-orange-300 to-red-300"></div>

                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        {getPageTitle(currentView)}
                      </h1>
                      <p className="text-sm text-gray-600 font-medium">
                        {getPageSubtitle(currentView)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {currentView !== 'accueil' && <BackButton />}
            </div>
          </div>
        </header>

        <main className="flex-1 relative z-10">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;