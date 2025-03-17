import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User,
  updateProfile,
  AuthError,
  AuthErrorCodes
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userDataService } from './userDataService';

export interface UserData {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  userType?: 'association' | 'benevole'; 
}

// Mapper les codes d'erreur Firebase en messages plus lisibles
export const getErrorMessage = (errorCode: string): string => {
  console.log("Code d'erreur Firebase reçu:", errorCode);
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Cet email est déjà utilisé par un autre compte.';
    case 'auth/invalid-email':
      return 'L\'adresse email est invalide.';
    case 'auth/weak-password':
      return 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
    case 'auth/user-not-found':
      return 'Aucun compte associé à cet email.';
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
    case 'auth/network-request-failed':
      return 'Problème de connexion réseau. Vérifiez votre connexion internet.';
    case 'auth/operation-not-allowed':
      return 'L\'authentification par email/mot de passe n\'est pas activée. Veuillez contacter l\'administrateur pour activer cette fonctionnalité dans la console Firebase.';
    case 'auth/popup-closed-by-user':
      return 'La fenêtre d\'authentification a été fermée avant la fin du processus.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'Configuration Firebase incorrecte. Clé API invalide.';
    default:
      return 'Une erreur s\'est produite. Veuillez réessayer.';
  }
};

// Inscription d'un nouvel utilisateur
export const registerUser = async (userData: UserData): Promise<User> => {
  console.log("[authService] Tentative d'inscription avec :", {
    email: userData.email,
    displayName: userData.displayName || "Non fourni",
    userType: userData.userType || "Non spécifié"
  });
  
  if (!userData.email || !userData.password) {
    throw new Error("L'email et le mot de passe sont obligatoires");
  }
  
  try {
    // 1. Créer l'utilisateur Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    console.log("[authService] Compte créé, UID:", userCredential.user.uid);
    
    // 2. Mettre à jour le profil si displayName est fourni
    if (userData.displayName) {
      console.log("[authService] Mise à jour du profil avec displayName:", userData.displayName);
      
      // Mettre à jour le profil
      await updateProfile(userCredential.user, {
        displayName: userData.displayName
      });
      
      // Enregistrer le prénom dans le stockage local également
      await userDataService.saveDisplayName(userCredential.user.uid, userData.displayName);
      console.log("[authService] Prénom enregistré dans le stockage local");
      
      // Vérifier que la mise à jour a fonctionné
      console.log("[authService] DisplayName après mise à jour:", userCredential.user.displayName);
      
      // Si le displayName n'a pas été mis à jour correctement, on a toujours le stockage local
      if (!userCredential.user.displayName) {
        console.log("[authService] DisplayName non défini dans Firebase, mais sauvegardé localement");
      }
    }
    
    // 3. Enregistrer le type d'utilisateur s'il est spécifié
    if (userData.userType) {
      console.log("[authService] Enregistrement du type d'utilisateur:", userData.userType);
      await userDataService.saveUserType(userCredential.user.uid, userData.userType);
    }
    
    // 4. Récupérer l'utilisateur mis à jour
    if (auth.currentUser) {
      await auth.currentUser.reload();
      console.log("[authService] Utilisateur mis à jour:", auth.currentUser.displayName);
      return auth.currentUser;
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error("[authService] Erreur d'inscription:", error);
    
    // Améliorer le message d'erreur
    if (error.code) {
      error.message = getErrorMessage(error.code);
    }
    
    throw error;
  }
};

// Connexion d'un utilisateur existant
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("[authService] Connexion réussie pour", email);
    
    // Vérifier si l'utilisateur a un displayName, sinon essayer de le charger depuis le stockage local
    if (!userCredential.user.displayName) {
      console.log("[authService] Pas de displayName dans Firebase, tentative de récupération locale");
      const localDisplayName = await userDataService.getDisplayName(userCredential.user.uid);
      
      if (localDisplayName) {
        console.log("[authService] DisplayName trouvé localement:", localDisplayName);
        
        // Tenter de mettre à jour le profil Firebase
        try {
          await updateProfile(userCredential.user, {
            displayName: localDisplayName
          });
          console.log("[authService] Profil Firebase mis à jour avec le displayName local");
        } catch (updateError) {
          console.error("[authService] Erreur lors de la mise à jour du profil avec le displayName local:", updateError);
        }
      }
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error("[authService] Erreur de connexion:", error);
    
    // Améliorer le message d'erreur
    if (error.code) {
      error.message = getErrorMessage(error.code);
    }
    
    throw error;
  }
};

// Déconnexion de l'utilisateur courant
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("[authService] Déconnexion réussie");
  } catch (error: any) {
    console.error("[authService] Erreur de déconnexion:", error);
    throw error;
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe :", error);
    throw error;
  }
};

// Obtenir l'utilisateur actuellement connecté
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
