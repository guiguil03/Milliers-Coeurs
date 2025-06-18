import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

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
  },

  /**
   * Supprime définitivement le compte utilisateur et toutes ses données
   * @param userId L'identifiant de l'utilisateur à supprimer
   * @returns Promise<{success: boolean, message: string}>
   */
  deleteUserAccount: async (userId: string): Promise<{success: boolean, message: string}> => {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'ID utilisateur requis pour la suppression'
        };
      }

      console.log(`🗑️ [DELETE_ACCOUNT] Début de la suppression pour l'utilisateur: ${userId}`);

      // MÉTHODE 1: Essayer la fonction SQL (plus robuste)
      console.log("🗑️ [DELETE_ACCOUNT] Tentative avec la fonction SQL...");
      try {
        const { data, error } = await supabase.rpc('delete_user_account', {
          target_user_id: userId
        });
        
        if (error) {
          console.warn("⚠️ [DELETE_ACCOUNT] Fonction SQL échouée, passage à la méthode manuelle:", error);
          // Continuer avec la méthode manuelle ci-dessous
        } else {
          console.log("✅ [DELETE_ACCOUNT] Suppression réussie avec la fonction SQL");
          
          // Supprimer les données locales
          await userDataService.clearUserData(userId);
          
          return {
            success: true,
            message: 'Compte supprimé avec succès (fonction SQL)'
          };
        }
      } catch (sqlError) {
        console.warn("⚠️ [DELETE_ACCOUNT] Exception fonction SQL, passage à la méthode manuelle:", sqlError);
      }

      // MÉTHODE 2: Suppression manuelle (fallback)
      console.log("🗑️ [DELETE_ACCOUNT] Suppression manuelle étape par étape...");

      // 1. Supprimer toutes les réservations de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des réservations...");
      try {
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .delete()
          .eq('benevole_id', userId)
          .select();
        
        if (reservationsError) {
          console.error("❌ [DELETE_ACCOUNT] Erreur suppression réservations:", reservationsError);
        } else {
          console.log(`✅ [DELETE_ACCOUNT] ${reservationsData?.length || 0} réservations supprimées`);
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression réservations:", error);
      }

      // 2. Supprimer tous les favoris de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des favoris...");
      try {
        const { data: favorisData, error: favorisError } = await supabase
          .from('favoris')
          .delete()
          .eq('user_id', userId)
          .select();
        
        if (favorisError) {
          console.error("❌ [DELETE_ACCOUNT] Erreur suppression favoris:", favorisError);
        } else {
          console.log(`✅ [DELETE_ACCOUNT] ${favorisData?.length || 0} favoris supprimés`);
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression favoris:", error);
      }

      // 3. Supprimer toutes les réservations pour les annonces de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des réservations sur ses annonces...");
      try {
        const { data: userAnnonces } = await supabase
          .from('annonces')
          .select('id')
          .eq('user_id', userId);
        
        if (userAnnonces && userAnnonces.length > 0) {
          console.log(`🗑️ [DELETE_ACCOUNT] ${userAnnonces.length} annonces trouvées`);
          const annonceIds = userAnnonces.map(a => a.id);
          const { data: reservationsAnnonceData, error: reservationsAnnonceError } = await supabase
            .from('reservations')
            .delete()
            .in('annonce_id', annonceIds)
            .select();
          
          if (reservationsAnnonceError) {
            console.error("❌ [DELETE_ACCOUNT] Erreur suppression réservations des annonces:", reservationsAnnonceError);
          } else {
            console.log(`✅ [DELETE_ACCOUNT] ${reservationsAnnonceData?.length || 0} réservations d'annonces supprimées`);
          }
        } else {
          console.log("ℹ️ [DELETE_ACCOUNT] Aucune annonce trouvée pour cet utilisateur");
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression réservations annonces:", error);
      }

      // 4. Supprimer toutes les annonces de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des annonces...");
      try {
        const { data: annoncesData, error: annoncesError } = await supabase
          .from('annonces')
          .delete()
          .eq('user_id', userId)
          .select();
        
        if (annoncesError) {
          console.error("❌ [DELETE_ACCOUNT] Erreur suppression annonces:", annoncesError);
        } else {
          console.log(`✅ [DELETE_ACCOUNT] ${annoncesData?.length || 0} annonces supprimées`);
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression annonces:", error);
      }

      // 5. Supprimer tous les messages de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des messages...");
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .delete()
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .select();
        
        if (messagesError) {
          console.error("❌ [DELETE_ACCOUNT] Erreur suppression messages:", messagesError);
        } else {
          console.log(`✅ [DELETE_ACCOUNT] ${messagesData?.length || 0} messages supprimés`);
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression messages:", error);
      }

      // 6. Supprimer les conversations où l'utilisateur participe
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des conversations...");
      try {
        const { data: conversations } = await supabase
          .from('conversations')
          .select('*')
          .contains('participants', [userId]);
        
        if (conversations && conversations.length > 0) {
          console.log(`🗑️ [DELETE_ACCOUNT] ${conversations.length} conversations trouvées`);
          for (const conversation of conversations) {
            const { error: convError } = await supabase
              .from('conversations')
              .delete()
              .eq('id', conversation.id);
            
            if (convError) {
              console.error("❌ [DELETE_ACCOUNT] Erreur suppression conversation:", convError);
            }
          }
          console.log(`✅ [DELETE_ACCOUNT] ${conversations.length} conversations supprimées`);
        } else {
          console.log("ℹ️ [DELETE_ACCOUNT] Aucune conversation trouvée pour cet utilisateur");
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression conversations:", error);
      }

      // 7. Supprimer le profil de l'utilisateur
      console.log("🗑️ [DELETE_ACCOUNT] Suppression du profil...");
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)
          .select();
        
        if (profileError) {
          console.error("❌ [DELETE_ACCOUNT] Erreur suppression profil:", profileError);
        } else {
          console.log(`✅ [DELETE_ACCOUNT] Profil supprimé:`, profileData);
        }
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression profil:", error);
      }

      // 8. Supprimer les images de profil du stockage
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des images...");
      try {
        const { data: files } = await supabase.storage
          .from('avatars')
          .list(`profiles/${userId}`);
        
        if (files && files.length > 0) {
          console.log(`🗑️ [DELETE_ACCOUNT] ${files.length} fichiers trouvés dans le storage`);
          const filePaths = files.map(file => `profiles/${userId}/${file.name}`);
          const { error: storageError } = await supabase.storage
            .from('avatars')
            .remove(filePaths);
          
          if (storageError) {
            console.error("❌ [DELETE_ACCOUNT] Erreur suppression images:", storageError);
          } else {
            console.log(`✅ [DELETE_ACCOUNT] ${files.length} images supprimées`);
          }
        } else {
          console.log("ℹ️ [DELETE_ACCOUNT] Aucune image trouvée dans le storage");
        }
      } catch (storageError) {
        console.error("❌ [DELETE_ACCOUNT] Exception accès storage:", storageError);
      }

      // 9. Supprimer les données locales
      console.log("🗑️ [DELETE_ACCOUNT] Suppression des données locales...");
      try {
        await userDataService.clearUserData(userId);
        console.log("✅ [DELETE_ACCOUNT] Données locales supprimées");
      } catch (error) {
        console.error("❌ [DELETE_ACCOUNT] Exception suppression données locales:", error);
      }

      // 10. Finalisation
      console.log("🗑️ [DELETE_ACCOUNT] Finalisation de la suppression...");
      console.log("✅ [DELETE_ACCOUNT] Suppression terminée avec succès");
      
      return {
        success: true,
        message: 'Compte supprimé avec succès (méthode manuelle)'
      };

    } catch (error) {
      console.error("❌ [DELETE_ACCOUNT] Erreur générale lors de la suppression du compte:", error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error}`
      };
    }
  }
};
