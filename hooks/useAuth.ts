import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  UserData
} from '../services/authService';
import { getUserProfile, IProfile } from '../services/profileService';
import { userDataService } from '../services/userDataService';

interface AuthState {
  user: User | null;
  profile: IProfile | null;
  userType: 'association' | 'benevole' | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    userType: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    // Attendre que Firebase soit prêt avant d'initialiser
    const timer = setTimeout(() => {
      try {
        const firebaseAuth = auth;
        
        if (firebaseAuth) {
          console.log("🔐 Initialisation du listener d'authentification...");
          unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            setAuthState(prev => ({ ...prev, loading: true }));
            
            if (user) {
              try {
                // Charger le profil de l'utilisateur
                const userProfile = await getUserProfile(user.uid);
                
                // Récupérer le type d'utilisateur (association ou bénévole)
                const userType = await userDataService.getUserType(user.uid);
                
                setAuthState({
                  user,
                  profile: userProfile,
                  userType,
                  loading: false,
                  error: null
                });
              } catch (error) {
                console.error("Erreur lors du chargement du profil :", error);
                setAuthState({
                  user,
                  profile: null,
                  userType: null,
                  loading: false,
                  error: "Erreur lors du chargement du profil"
                });
              }
            } else {
              setAuthState({
                user: null,
                profile: null,
                userType: null,
                loading: false,
                error: null
              });
            }
          });
        } else {
          console.error("Firebase auth non disponible, réessai dans 1 seconde...");
          // Réessayer dans 1 seconde
          setTimeout(() => {
            const retryAuth = auth;
            if (retryAuth) {
              console.log("🔐 Deuxième tentative d'initialisation d'auth...");
              unsubscribe = onAuthStateChanged(retryAuth, async (user) => {
                // ... même logique que ci-dessus
                setAuthState(prev => ({ ...prev, loading: true }));
                
                if (user) {
                  try {
                    const userProfile = await getUserProfile(user.uid);
                    const userType = await userDataService.getUserType(user.uid);
                    
                    setAuthState({
                      user,
                      profile: userProfile,
                      userType,
                      loading: false,
                      error: null
                    });
                  } catch (error) {
                    console.error("Erreur lors du chargement du profil :", error);
                    setAuthState({
                      user,
                      profile: null,
                      userType: null,
                      loading: false,
                      error: "Erreur lors du chargement du profil"
                    });
                  }
                } else {
                  setAuthState({
                    user: null,
                    profile: null,
                    userType: null,
                    loading: false,
                    error: null
                  });
                }
              });
            } else {
              setAuthState(prev => ({
                ...prev,
                loading: false,
                error: "Erreur d'initialisation Firebase Auth"
              }));
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'auth listener:", error);
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: "Erreur d'initialisation Firebase"
        }));
      }
    }, 1000); // Attendre 1 seconde avant d'initialiser
    
    // Nettoyer l'abonnement et le timer quand le composant est démonté
    return () => {
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<User> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await loginUser(email, password);
      // L'état sera mis à jour par le listener onAuthStateChanged
      return user;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Erreur de connexion" 
      }));
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData: UserData): Promise<User> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await registerUser(userData);
      // L'état sera mis à jour par le listener onAuthStateChanged
      return user;
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Erreur d'inscription" 
      }));
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await logoutUser();
      // L'état sera mis à jour par le listener onAuthStateChanged
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Erreur de déconnexion" 
      }));
      throw error;
    }
  };

  // Fonction de réinitialisation du mot de passe
  const forgotPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Erreur de réinitialisation du mot de passe" 
      }));
      throw error;
    }
  };

  return {
    user: authState.user,
    profile: authState.profile,
    userType: authState.userType,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    forgotPassword
  };
}
