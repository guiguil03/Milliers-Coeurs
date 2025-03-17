import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = '@UserData:';
const USER_DISPLAY_NAME_KEY = '@UserDisplayName:';
const USER_TYPE_KEY = '@UserType:'; // Nouvelle clé pour le type d'utilisateur

/**
 * Service permettant de stocker et récupérer les données utilisateur
 * en complément de Firebase Authentication
 */
export const userDataService = {
  /**
   * Enregistre le prénom d'un utilisateur localement
   * @param userId L'identifiant Firebase de l'utilisateur
   * @param displayName Le prénom à enregistrer
   */
  saveDisplayName: async (userId: string, displayName: string): Promise<void> => {
    try {
      if (!userId || !displayName) {
        console.error('UserID et displayName sont requis pour enregistrer le prénom');
        return;
      }
      await AsyncStorage.setItem(`${USER_DISPLAY_NAME_KEY}${userId}`, displayName);
      console.log(`[userDataService] Prénom enregistré pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('[userDataService] Erreur lors de l\'enregistrement du prénom:', error);
    }
  },

  /**
   * Récupère le prénom d'un utilisateur depuis le stockage local
   * @param userId L'identifiant Firebase de l'utilisateur
   * @returns Le prénom enregistré ou null si non trouvé
   */
  getDisplayName: async (userId: string): Promise<string | null> => {
    try {
      if (!userId) {
        console.error('UserID requis pour récupérer le prénom');
        return null;
      }
      const displayName = await AsyncStorage.getItem(`${USER_DISPLAY_NAME_KEY}${userId}`);
      console.log(`[userDataService] Prénom récupéré pour l'utilisateur ${userId}:`, displayName);
      return displayName;
    } catch (error) {
      console.error('[userDataService] Erreur lors de la récupération du prénom:', error);
      return null;
    }
  },

  /**
   * Enregistre le type d'utilisateur (association ou bénévole)
   * @param userId L'identifiant Firebase de l'utilisateur
   * @param userType Le type d'utilisateur ('association' ou 'benevole')
   */
  saveUserType: async (userId: string, userType: 'association' | 'benevole'): Promise<void> => {
    try {
      if (!userId) {
        console.error('UserID requis pour enregistrer le type d\'utilisateur');
        return;
      }
      await AsyncStorage.setItem(`${USER_TYPE_KEY}${userId}`, userType);
      console.log(`[userDataService] Type d'utilisateur enregistré pour ${userId}: ${userType}`);
    } catch (error) {
      console.error('[userDataService] Erreur lors de l\'enregistrement du type d\'utilisateur:', error);
    }
  },

  /**
   * Récupère le type d'utilisateur (association ou bénévole)
   * @param userId L'identifiant Firebase de l'utilisateur
   * @returns Le type d'utilisateur ou null si non trouvé
   */
  getUserType: async (userId: string): Promise<'association' | 'benevole' | null> => {
    try {
      if (!userId) {
        console.error('UserID requis pour récupérer le type d\'utilisateur');
        return null;
      }
      const userType = await AsyncStorage.getItem(`${USER_TYPE_KEY}${userId}`);
      if (userType === 'association' || userType === 'benevole') {
        return userType;
      }
      return null;
    } catch (error) {
      console.error('[userDataService] Erreur lors de la récupération du type d\'utilisateur:', error);
      return null;
    }
  },

  /**
   * Enregistre les données complètes d'un utilisateur
   * @param userId L'identifiant Firebase de l'utilisateur
   * @param userData Les données à enregistrer
   */
  saveUserData: async (userId: string, userData: any): Promise<void> => {
    try {
      if (!userId) {
        console.error('UserID requis pour enregistrer les données utilisateur');
        return;
      }
      await AsyncStorage.setItem(`${USER_DATA_KEY}${userId}`, JSON.stringify(userData));
      console.log(`[userDataService] Données enregistrées pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('[userDataService] Erreur lors de l\'enregistrement des données:', error);
    }
  },

  /**
   * Récupère les données complètes d'un utilisateur
   * @param userId L'identifiant Firebase de l'utilisateur
   * @returns Les données utilisateur ou null si non trouvées
   */
  getUserData: async (userId: string): Promise<any | null> => {
    try {
      if (!userId) {
        console.error('UserID requis pour récupérer les données utilisateur');
        return null;
      }
      const userData = await AsyncStorage.getItem(`${USER_DATA_KEY}${userId}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('[userDataService] Erreur lors de la récupération des données:', error);
      return null;
    }
  },

  /**
   * Supprime toutes les données d'un utilisateur du stockage local
   * @param userId L'identifiant Firebase de l'utilisateur
   */
  clearUserData: async (userId: string): Promise<void> => {
    try {
      if (!userId) {
        console.error('UserID requis pour supprimer les données utilisateur');
        return;
      }
      await AsyncStorage.removeItem(`${USER_DATA_KEY}${userId}`);
      await AsyncStorage.removeItem(`${USER_DISPLAY_NAME_KEY}${userId}`);
      await AsyncStorage.removeItem(`${USER_TYPE_KEY}${userId}`);
      console.log(`[userDataService] Données supprimées pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('[userDataService] Erreur lors de la suppression des données:', error);
    }
  }
};
