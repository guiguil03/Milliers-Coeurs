import { supabase, type User, type AuthError } from '../config/supabase';
import { userDataService } from './userDataService';

export interface UserData {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  userType?: 'association' | 'benevole'; 
}

// Mapper les codes d'erreur Supabase en messages plus lisibles
export const getErrorMessage = (error: AuthError | Error): string => {
  console.log("Erreur Supabase reçue:", error.message);
  
  if ('message' in error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('email already registered')) {
      return 'Cet email est déjà utilisé par un autre compte.';
    }
    if (message.includes('invalid email')) {
      return 'L\'adresse email est invalide.';
    }
    if (message.includes('weak password') || message.includes('password should be at least')) {
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    }
    if (message.includes('email not confirmed')) {
      return 'Vous devez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail ou contactez l\'administrateur.';
    }
    if (message.includes('email logins are disabled')) {
      return 'Les connexions par email sont désactivées. Contactez l\'administrateur pour activer cette fonctionnalité.';
    }
    if (message.includes('invalid login credentials')) {
      return 'Email ou mot de passe incorrect.';
    }
    if (message.includes('too many requests')) {
      return 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
    }
    if (message.includes('network')) {
      return 'Problème de connexion réseau. Vérifiez votre connexion internet.';
    }
  }
  
  return 'Une erreur s\'est produite. Veuillez réessayer.';
};

// Inscription d'un nouvel utilisateur
export const registerUser = async (userData: UserData): Promise<User> => {
  console.log("[authSupabaseService] Tentative d'inscription avec :", {
    email: userData.email,
    displayName: userData.displayName || "Non fourni",
    userType: userData.userType || "Non spécifié"
  });
  
  if (!userData.email || !userData.password) {
    throw new Error("L'email et le mot de passe sont obligatoires");
  }
  
  try {
    // 1. Créer l'utilisateur Supabase
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          display_name: userData.displayName || '',
          user_type: userData.userType || 'benevole'
        }
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Impossible de créer l'utilisateur");
    }
    
    console.log("[authSupabaseService] Compte créé, UID:", data.user.id);
    
    // 2. Enregistrer les données supplémentaires localement
    if (userData.displayName) {
      await userDataService.saveDisplayName(data.user.id, userData.displayName);
      console.log("[authSupabaseService] Prénom enregistré dans le stockage local");
    }
    
    if (userData.userType) {
      await userDataService.saveUserType(data.user.id, userData.userType);
      console.log("[authSupabaseService] Type d'utilisateur enregistré:", userData.userType);
    }
    
    // 3. Créer le profil utilisateur dans la base de données
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: userData.email,
        display_name: userData.displayName || '',
        user_type: userData.userType || 'benevole',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error("[authSupabaseService] Erreur création profil:", profileError);
      // Ne pas faire échouer l'inscription pour cette erreur
    }
    
    return data.user;
  } catch (error: any) {
    console.error("[authSupabaseService] Erreur d'inscription:", error);
    
    // Améliorer le message d'erreur
    const errorMessage = getErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).code = error.code || 'unknown';
    
    throw enhancedError;
  }
};

// Connexion d'un utilisateur existant
export const loginUser = async (email: string, password: string): Promise<User> => {
  console.log("[authSupabaseService] Tentative de connexion pour:", email);
  console.log("[authSupabaseService] Longueur mot de passe:", password?.length || 0);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    console.log("[authSupabaseService] Réponse Supabase:", {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      hasError: !!error
    });
    
    if (error) {
      console.log("[authSupabaseService] Erreur détaillée:", {
        message: error.message,
        code: error.code || 'no-code',
        status: error.status || 'no-status',
        details: error
      });
      throw error;
    }
    
    if (!data.user) {
      throw new Error("Impossible de se connecter");
    }
    
    console.log("[authSupabaseService] Connexion réussie pour", email);
    
    // Synchroniser les données locales si nécessaire
    const displayName = data.user.user_metadata?.display_name;
    const userType = data.user.user_metadata?.user_type;
    
    if (displayName) {
      await userDataService.saveDisplayName(data.user.id, displayName);
    }
    
    if (userType) {
      await userDataService.saveUserType(data.user.id, userType);
    }
    
    return data.user;
  } catch (error: any) {
    console.error("[authSupabaseService] Erreur de connexion:", error);
    
    // Améliorer le message d'erreur
    const errorMessage = getErrorMessage(error);
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).code = error.code || 'unknown';
    
    throw enhancedError;
  }
};

// Déconnexion de l'utilisateur courant
export const logoutUser = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    console.log("[authSupabaseService] Déconnexion réussie");
  } catch (error: any) {
    console.error("[authSupabaseService] Erreur de déconnexion:", error);
    throw error;
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://votre-app.com/reset-password', // Remplacez par votre URL
    });
    
    if (error) {
      throw error;
    }
    
    console.log("[authSupabaseService] Email de réinitialisation envoyé");
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe :", error);
    throw error;
  }
};

// Obtenir l'utilisateur actuellement connecté
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((event: any, session: any) => {
    callback(session?.user || null);
  });
}; 