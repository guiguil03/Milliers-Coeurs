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

interface AuthState {
  user: User | null;
  profile: IProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      if (user) {
        try {
          // Charger le profil de l'utilisateur
          const userProfile = await getUserProfile(user.uid);
          
          setAuthState({
            user,
            profile: userProfile,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error("Erreur lors du chargement du profil :", error);
          setAuthState({
            user,
            profile: null,
            loading: false,
            error: "Erreur lors du chargement du profil"
          });
        }
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null
        });
      }
    });

    // Nettoyer l'abonnement quand le composant est démonté
    return () => unsubscribe();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await loginUser(email, password);
      // L'état sera mis à jour par le listener onAuthStateChanged
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
  const register = async (userData: UserData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await registerUser(userData);
      // L'état sera mis à jour par le listener onAuthStateChanged
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
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    forgotPassword
  };
}
