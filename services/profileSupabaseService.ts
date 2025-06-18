import { supabase } from '../config/supabase';
import { ICompetence, IExperience, IProfile as DataProfile } from '../data/profil';

export interface IProfile {
  uid: string;
  prenom: string;
  nom: string;
  email: string;
  image: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  biographie?: string;
  competences: ICompetence[];
  experiences: IExperience[];
  permis?: boolean;
  vehicule?: boolean;
  userType: 'association' | 'benevole';
  preferences?: {
    notificationsEmail: boolean;
    notificationsApp: boolean;
    visibilitePublique: boolean;
  };
  dateCreation?: string;
  dateModification?: string;
}

// Convertir l'objet du format de données au format du service
const convertToServiceProfile = (profile: DataProfile): IProfile => {
  return {
    ...profile,
    competences: profile.competences || [],
    experiences: profile.experiences || []
  };
};

// Convertir l'objet du format du service au format de données
const convertToDataProfile = (profile: IProfile): DataProfile => {
  return {
    ...profile,
    competences: profile.competences || [],
    experiences: profile.experiences || []
  };
};

// Convertir un objet Supabase en IProfile
const convertSupabaseToProfile = (data: any): IProfile => {
  return {
    uid: data.id,
    prenom: data.display_name?.split(' ')[0] || data.prenom || '',
    nom: data.display_name?.split(' ').slice(1).join(' ') || data.nom || '',
    email: data.email || '',
    image: data.image || data.avatar_url || '',
    adresse: data.adresse,
    code_postal: data.code_postal,
    ville: data.ville,
    telephone: data.telephone,
    biographie: data.biographie || data.bio,
    competences: data.competences || [],
    experiences: data.experiences || [],
    permis: data.permis || false,
    vehicule: data.vehicule || false,
    userType: data.user_type || 'benevole',
    preferences: data.preferences || {
      notificationsEmail: true,
      notificationsApp: true,
      visibilitePublique: true
    },
    dateCreation: data.created_at || '',
    dateModification: data.dateModification || data.updated_at || ''
  };
};

/**
 * Crée ou remplace un profil utilisateur complet
 */
export const setUserProfile = async (profile: IProfile): Promise<void> => {
  try {
    const now = new Date().toISOString();
    
    // Préparer les données pour Supabase
    const profileData = {
      id: profile.id,
      display_name: `${profile.prenom} ${profile.nom}`.trim(),
      email: profile.email,
      image: profile.image,
      avatar_url: profile.image, // Alias pour compatibilité
      prenom: profile.prenom,
      nom: profile.nom,
      adresse: profile.adresse,
      code_postal: profile.code_postal,
      ville: profile.ville,
      telephone: profile.telephone,
      biographie: profile.biographie,
      bio: profile.biographie, // Alias pour compatibilité
      competences: profile.competences,
      experiences: profile.experiences,
      permis: profile.permis,
      vehicule: profile.vehicule,
      user_type: profile.userType,
      preferences: profile.preferences,
      dateModification: now,
      dateCreation: profile.dateCreation || now
    };
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ [PROFIL] Profil créé/mis à jour pour l'utilisateur ${profile.id}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};

/**
 * Récupère le profil complet d'un utilisateur
 */
export const getUserProfile = async (uid: string): Promise<IProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Aucun profil trouvé
        return null;
      }
      throw error;
    }
    
    return convertSupabaseToProfile(data);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la récupération du profil :", error);
    throw error;
  }
};

/**
 * Met à jour partiellement un profil utilisateur
 */
export const updateUserProfile = async (uid: string, profileData: Partial<IProfile>): Promise<void> => {
  try {
    console.log('🔄 [PROFIL] Mise à jour du profil pour:', uid);
    console.log('📋 [PROFIL] Données à envoyer:', profileData);

    // Préparer les données pour la mise à jour
    const updateData: any = {};
    
    // Mapper les champs du format IProfile vers le format Supabase
    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined) {
        switch (key) {
          case 'prenom':
          case 'nom':
            updateData[key] = value;
            // Mettre à jour aussi display_name si on a les deux
            if (profileData.prenom !== undefined && profileData.nom !== undefined) {
              updateData.display_name = `${profileData.prenom} ${profileData.nom}`.trim();
            }
            break;
          case 'userType':
            updateData.user_type = value;
            break;
          case 'biographie':
            updateData.biographie = value;
            updateData.bio = value; // Alias
            break;
          case 'image':
            updateData.image = value;
            updateData.avatar_url = value; // Alias
            break;
          case 'uid':
            // Ne pas inclure uid dans les mises à jour (c'est l'ID primary key)
            break;
          case 'dateCreation':
            // Ne pas inclure dateCreation dans les mises à jour
            break;
          case 'dateModification':
            // Ne pas inclure dateModification dans les mises à jour (géré automatiquement)
            break;
          default:
            updateData[key] = value;
        }
      }
    });
    
    console.log('📤 [PROFIL] Données finales envoyées:', updateData);
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', uid);
    
    if (error) {
      console.error('❌ [PROFIL] Erreur lors de la mise à jour du profil :', error);
      throw error;
    }
    
    console.log(`✅ [PROFIL] Profil mis à jour partiellement pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};

/**
 * Supprime un champ spécifique du profil utilisateur
 */
export const removeProfileField = async (uid: string, fieldPath: string): Promise<void> => {
  try {
    const updateData: any = {
      dateModification: new Date().toISOString()
    };
    
    // Définir le champ à null pour le supprimer
    updateData[fieldPath] = null;
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', uid);
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ [PROFIL] Champ ${fieldPath} supprimé du profil de l'utilisateur ${uid}`);
  } catch (error) {
    console.error(`❌ [PROFIL] Erreur lors de la suppression du champ ${fieldPath} :`, error);
    throw error;
  }
};

/**
 * Télécharge une image vers Supabase Storage et met à jour l'URL dans le profil
 */
export const uploadProfileImage = async (uid: string, imageUri: string): Promise<string> => {
  try {
    // Convertir l'URI de l'image en blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Générer un nom de fichier unique
    const fileName = `profile-${uid}-${Date.now()}.jpg`;
    const filePath = `profiles/${uid}/${fileName}`;
    
    // Télécharger l'image vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars') // Assure-toi que ce bucket existe
      .upload(filePath, blob);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Obtenir l'URL publique de l'image
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    const downloadURL = urlData.publicUrl;
    
    // Mettre à jour le profil avec la nouvelle URL d'image
    await updateUserProfile(uid, { image: downloadURL });
    
    console.log(`✅ [PROFIL] Image de profil mise à jour pour l'utilisateur ${uid}`);
    return downloadURL;
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors du téléchargement de l'image de profil :", error);
    throw error;
  }
};

/**
 * Ajoute une compétence au profil utilisateur
 */
export const addProfileCompetence = async (uid: string, competence: ICompetence): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile) {
      throw new Error("Profil utilisateur non trouvé");
    }
    
    const competences = [...(profile.competences || []), competence];
    await updateUserProfile(uid, { competences });
    
    console.log(`✅ [PROFIL] Compétence ajoutée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de l'ajout de compétence :", error);
    throw error;
  }
};

/**
 * Supprime une compétence du profil utilisateur
 */
export const removeProfileCompetence = async (uid: string, competenceName: string): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile) {
      throw new Error("Profil utilisateur non trouvé");
    }
    
    const competences = (profile.competences || []).filter(c => c.nom !== competenceName);
    await updateUserProfile(uid, { competences });
    
    console.log(`✅ [PROFIL] Compétence supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la suppression de compétence :", error);
    throw error;
  }
};

/**
 * Ajoute une expérience au profil utilisateur
 */
export const addProfileExperience = async (uid: string, experience: IExperience): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile) {
      throw new Error("Profil utilisateur non trouvé");
    }
    
    const experiences = [...(profile.experiences || []), experience];
    await updateUserProfile(uid, { experiences });
    
    console.log(`✅ [PROFIL] Expérience ajoutée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de l'ajout d'expérience :", error);
    throw error;
  }
};

/**
 * Supprime une expérience du profil utilisateur
 */
export const removeProfileExperience = async (uid: string, experienceIndex: number): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile) {
      throw new Error("Profil utilisateur non trouvé");
    }
    
    const experiences = [...(profile.experiences || [])];
    experiences.splice(experienceIndex, 1);
    await updateUserProfile(uid, { experiences });
    
    console.log(`✅ [PROFIL] Expérience supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la suppression d'expérience :", error);
    throw error;
  }
}; 