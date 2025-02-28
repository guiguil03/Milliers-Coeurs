import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface UserData {
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
}

// Inscription d'un nouvel utilisateur
export const registerUser = async (userData: UserData): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    // Mettre à jour le profil si displayName ou photoURL sont fournis
    if (userData.displayName || userData.photoURL) {
      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
    }
    
    return userCredential.user;
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    throw error;
  }
};

// Connexion d'un utilisateur
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    throw error;
  }
};

// Déconnexion d'un utilisateur
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
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
