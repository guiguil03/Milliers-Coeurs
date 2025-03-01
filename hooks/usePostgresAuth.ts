import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword,
  getCurrentUser,
  verifyToken,
  UserData,
  LoginCredentials
} from '../services/postgresAuthService';

// Type pour l'état d'authentification
interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function usePostgresAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null
  });

  // Clé pour stocker le token dans AsyncStorage
  const TOKEN_STORAGE_KEY = 'auth_token';

  // Charger l'utilisateur à partir du token stocké
  useEffect(() => {
    const loadUserFromToken = async () => {
      try {
        setAuthState(prev => ({ ...prev, loading: true }));
        
        // Récupérer le token stocké
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (token) {
          // Vérifier que le token est valide
          try {
            // Vérifier le token
            verifyToken(token);
            
            // Récupérer les données de l'utilisateur
            const user = await getCurrentUser(token);
            
            setAuthState({
              user,
              token,
              loading: false,
              error: null
            });
          } catch (error) {
            // Token invalide, supprimer
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
            setAuthState({
              user: null,
              token: null,
              loading: false,
              error: null
            });
          }
        } else {
          setAuthState({
            user: null,
            token: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        setAuthState({
          user: null,
          token: null,
          loading: false,
          error: error.message || "Erreur lors du chargement de l'utilisateur"
        });
      }
    };

    loadUserFromToken();
  }, []);

  // Fonction de connexion
  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, token } = await loginUser(credentials.email, credentials.password);
      
      // Stocker le token
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      setAuthState({
        user,
        token,
        loading: false,
        error: null
      });
      
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
  const register = async (userData: UserData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { user, token } = await registerUser(userData);
      
      // Stocker le token
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      setAuthState({
        user,
        token,
        loading: false,
        error: null
      });
      
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
      
      // Appeler la fonction de déconnexion du service
      await logoutUser();
      
      // Supprimer le token stocké
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      
      setAuthState({
        user: null,
        token: null,
        loading: false,
        error: null
      });
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
    token: authState.token,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.token,
    login,
    register,
    logout,
    forgotPassword
  };
}
