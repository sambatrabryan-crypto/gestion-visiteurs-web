import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const LoginForm = ({ onLoginSuccess, apiCall }) => {
    const [showLogin, setShowLogin] = useState(false);
    const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredButton, setHoveredButton] = useState(null);

    // Écran d'accueil initial
    if (!showLogin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-red-50 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Formes flottantes animées */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-72 h-72 bg-gradient-to-r from-orange-300/25 to-red-400/25 rounded-full -top-40 -left-40 animate-float"></div>
                    <div className="absolute w-96 h-96 bg-gradient-to-r from-red-300/20 to-orange-400/20 rounded-full -bottom-48 -right-48 animate-float" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute w-56 h-56 bg-gradient-to-r from-amber-300/15 to-orange-400/15 rounded-full top-1/3 left-1/4 animate-float" style={{ animationDelay: '3s' }}></div>
                </div>

                <div className="text-center max-w-4xl mx-auto w-full relative z-10">
                    {/* Logo principal avec effet 3D */}
                    <div className="mb-16 transform perspective-1000">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-10 rounded-3xl shadow-2xl inline-block animate-pulse hover:scale-105 transform transition-all duration-500 hover:rotate-x-12">
                            <div className="text-center font-bold transform transition-transform duration-500">
                                <div className="text-6xl tracking-wider mb-3 text-white drop-shadow-lg">EUROP-ALU</div>
                                <div className="text-xl font-light opacity-90 tracking-widest text-orange-100">INNOVATION CONTINUE</div>
                            </div>
                        </div>
                    </div>

                    {/* Message de bienvenue principal */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl border-2 border-orange-200 p-16 mb-12 animate-fade-in shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 animate-pulse"></div>

                        <h1 className="text-7xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-8 leading-tight">
                            BIENVENUE
                        </h1>
                        <p className="text-3xl text-gray-700 mb-8 leading-relaxed font-medium">
                            Système de gestion intégré pour une expérience optimisée
                        </p>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Accédez à l'ensemble des fonctionnalités de gestion des visiteurs et des rendez-vous
                        </p>

                        {/* Bouton Commencer - version originale sans flèche */}
                        <button
                            onClick={() => setShowLogin(true)}
                            onMouseEnter={() => setHoveredButton('start')}
                            onMouseLeave={() => setHoveredButton(null)}
                            className="btn-ripple bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-24 py-8 rounded-2xl font-black text-3xl transition-all duration-300 hover:scale-110 hover:shadow-2xl animate-bounce-subtle relative overflow-hidden group"
                        >
                            <span className="relative z-10 text-glow">COMMENCER</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            {hoveredButton === 'start' && (
                                <div className="absolute inset-0 rounded-2xl bg-white/30 animate-pulse"></div>
                            )}
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes slide-in {
                        from {
                            transform: translateX(100%);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(0);
                            opacity: 1;
                        }
                    }
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-out;
                    }
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.8;
                        }
                    }
                    .animate-pulse {
                        animation: pulse 2s ease-in-out infinite;
                    }
                    @keyframes bounce-subtle {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-8px);
                        }
                    }
                    .animate-bounce-subtle {
                        animation: bounce-subtle 2s ease-in-out infinite;
                    }
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px) rotate(0deg);
                        }
                        50% {
                            transform: translateY(-25px) rotate(5deg);
                        }
                    }
                    .animate-float {
                        animation: float 8s ease-in-out infinite;
                    }
                    .perspective-1000 {
                        perspective: 1000px;
                    }
                    .hover\:rotate-x-12:hover {
                        transform: rotateX(12deg);
                    }
                    .btn-ripple {
                        position: relative;
                        overflow: hidden;
                        transform: translate3d(0, 0, 0);
                    }
                    .btn-ripple:after {
                        content: "";
                        display: block;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        top: 0;
                        left: 0;
                        pointer-events: none;
                        background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
                        background-repeat: no-repeat;
                        background-position: 50%;
                        transform: scale(10, 10);
                        opacity: 0;
                        transition: transform .5s, opacity 1s;
                    }
                    .btn-ripple:active:after {
                        transform: scale(0, 0);
                        opacity: .2;
                        transition: 0s;
                    }
                    .text-glow {
                        text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
                    }
                `}</style>
            </div>
        );
    }

    // Formulaire de connexion (code existant)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format d'email invalide";
        }
        if (!formData.mot_de_passe) {
            newErrors.mot_de_passe = 'Le mot de passe est requis';
        } else if (formData.mot_de_passe.length < 4) {
            newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 4 caractères';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            let response;
            try {
                response = await apiCall('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: formData.email,
                        mot_de_passe: formData.mot_de_passe
                    })
                });
            } catch (authError) {
                console.log('Endpoint /auth/login non trouvé, essai /utilisateurs/login...');
                response = await apiCall('/utilisateurs/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: formData.email,
                        mot_de_passe: formData.mot_de_passe
                    })
                });
            }

            if (!response.token || !response.user) {
                throw new Error("Structure de réponse invalide de l'API");
            }

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('isAuthenticated', 'true');

            if (onLoginSuccess) {
                onLoginSuccess(response.user);
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            if (error.message.includes('404') || error.message.toLowerCase().includes('non trouvé')) {
                setErrors({ submit: "Service d'authentification indisponible" });
            } else if (error.message.includes('401') || error.message.toLowerCase().includes('non valide')) {
                setErrors({ submit: 'Email ou mot de passe incorrect' });
            } else if (error.message.includes('Structure de réponse invalide')) {
                setErrors({ submit: 'Erreur de configuration du serveur' });
            } else {
                setErrors({ submit: error.message || 'Erreur de connexion au serveur' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Retour au formulaire de connexion
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center p-4">
            <div className="relative max-w-md w-full">
                {/* Effets de fond animés */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 via-amber-400/20 to-red-500/20 rounded-3xl blur-3xl opacity-70 animate-pulse pointer-events-none" />
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-300/30 to-red-400/30 rounded-3xl blur-xl opacity-50 animate-float pointer-events-none" />

                {/* Carte principale */}
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    {/* En-tête avec logo EA */}
                    <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
                        <div className="relative">
                            {/* Logo EA */}
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20">
                                <div className="w-16 h-16 flex items-center justify-center">
                                    <img
                                        src="/EA.png"
                                        alt="Logo EA"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/64?text=EA";
                                        }}
                                    />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                                Connexion
                            </h1>
                            <p className="text-orange-100/90 mt-2 text-lg">Accédez à votre espace personnel</p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {errors.submit && (
                            <div
                                role="alert"
                                className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/80 text-red-700 px-4 py-4 rounded-2xl text-sm backdrop-blur-sm shadow-sm"
                            >
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                                    {errors.submit}
                                </div>
                            </div>
                        )}

                        {/* Champ Email */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700/90"
                            >
                                Adresse email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                                    <Mail className="h-5 w-5 text-orange-500/80 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                    className={`block w-full pl-12 pr-4 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300
                    focus:outline-none focus:scale-[1.02] focus:shadow-lg
                    ${errors.email
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                                            : 'border-orange-200/50 focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400'
                                        }`}
                                    placeholder="votre@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p id="email-error" className="text-sm text-red-600/90 flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="space-y-2">
                            <label
                                htmlFor="mot_de_passe"
                                className="block text-sm font-semibold text-gray-700/90"
                            >
                                Mot de passe
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
                                    <Lock className="h-5 w-5 text-orange-500/80 group-focus-within:text-orange-500 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="mot_de_passe"
                                    name="mot_de_passe"
                                    value={formData.mot_de_passe}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    aria-invalid={!!errors.mot_de_passe}
                                    aria-describedby={errors.mot_de_passe ? 'password-error' : undefined}
                                    className={`block w-full pl-12 pr-12 py-4 rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all duration-300
                    focus:outline-none focus:scale-[1.02] focus:shadow-lg
                    ${errors.mot_de_passe
                                            ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                                            : 'border-orange-200/50 focus:ring-2 focus:ring-orange-200/50 focus:border-orange-400'
                                        }`}
                                    placeholder="Votre mot de passe"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-500/70 hover:text-orange-600 focus:outline-none transition-all hover:scale-110"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ?
                                        <EyeOff className="h-5 w-5 transition-transform" /> :
                                        <Eye className="h-5 w-5 transition-transform" />
                                    }
                                </button>
                            </div>
                            {errors.mot_de_passe && (
                                <p id="password-error" className="text-sm text-red-600/90 flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
                                    {errors.mot_de_passe}
                                </p>
                            )}
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 font-bold
                         shadow-xl transition-all duration-300 hover:from-orange-600 hover:to-red-600 hover:shadow-2xl
                         focus:outline-none focus:ring-4 focus:ring-orange-200/50 focus:scale-[1.02]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {isLoading ? (
                                    <>
                                        <div className="relative w-6 h-6 mr-3">
                                            <div className="absolute inset-0 border-3 border-white/30 rounded-full" />
                                            <div className="absolute inset-0 border-3 border-transparent border-t-white rounded-full animate-spin" />
                                            <Sparkles className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                        </div>
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1" />
                                        Se connecter
                                    </>
                                )}
                            </span>

                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] 
                               group-hover:translate-x-[100%] transition-transform duration-700" />

                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm group-hover:blur-md" />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="bg-gradient-to-b from-orange-50/60 to-orange-100/30 px-8 py-6 border-t border-orange-100/50">
                        <p className="text-center text-sm text-gray-600/90">
                            Pas encore de compte ?{' '}
                            <a
                                href="/contact"
                                className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 inline-block"
                            >
                                Contactez le responsable
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;