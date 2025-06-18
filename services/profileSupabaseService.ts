import { supabase } from '../config/supabase';

// Interfaces pour les compétences et expériences compatibles avec l'app
export interface ICompetence {
  name: string;
  level: number; // 1-5
}

export interface IExperience {
  title: string;
  organization: string;
  date: string;
  description: string;
}

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
}

// Convertir un objet Supabase en IProfile
const convertSupabaseToProfile = (data: any): IProfile => {
  return {
    uid: data.id,
    prenom: data.display_name?.split(' ')[0] || data.prenom || '',
    nom: data.display_name?.split(' ').slice(1).join(' ') || data.nom || '',
    email: data.email || '',
    image: data.image || data.avatar_url || '',
    adresse: data.adresse || '',
    code_postal: data.code_postal || '',
    ville: data.ville || '',
    telephone: data.telephone || '',
    biographie: data.biographie || data.bio || '',
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
    dateCreation: data.created_at || ''
  };
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
            if (profileData.prenom && profileData.nom) {
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
          case 'dateCreation':
            // Ne pas inclure ces champs dans les mises à jour
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
 * Crée ou remplace un profil utilisateur complet
 */
export const setUserProfile = async (profile: IProfile): Promise<void> => {
  try {
    // Préparer les données pour Supabase
    const profileData = {
      id: profile.uid,
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
      preferences: profile.preferences
    };
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      });
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ [PROFIL] Profil créé/mis à jour pour l'utilisateur ${profile.uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la mise à jour du profil :", error);
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
 * Ajoute une compétence au profil
 */
export const addProfileCompetence = async (uid: string, competence: ICompetence): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) {
      throw new Error('Profil introuvable');
    }
    
    const newCompetences = [...profile.competences, competence];
    await updateUserProfile(uid, { competences: newCompetences });
    
    console.log(`✅ [PROFIL] Compétence ajoutée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de l'ajout de la compétence :", error);
    throw error;
  }
};

/**
 * Supprime une compétence du profil
 */
export const removeProfileCompetence = async (uid: string, competenceName: string): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) {
      throw new Error('Profil introuvable');
    }
    
    const newCompetences = profile.competences.filter(comp => comp.name !== competenceName);
    await updateUserProfile(uid, { competences: newCompetences });
    
    console.log(`✅ [PROFIL] Compétence supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la suppression de la compétence :", error);
    throw error;
  }
};

/**
 * Ajoute une expérience au profil
 */
export const addProfileExperience = async (uid: string, experience: IExperience): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) {
      throw new Error('Profil introuvable');
    }
    
    const newExperiences = [...profile.experiences, experience];
    await updateUserProfile(uid, { experiences: newExperiences });
    
    console.log(`✅ [PROFIL] Expérience ajoutée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de l'ajout de l'expérience :", error);
    throw error;
  }
};

/**
 * Supprime une expérience du profil
 */
export const removeProfileExperience = async (uid: string, experienceIndex: number): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    if (!profile) {
      throw new Error('Profil introuvable');
    }
    
    const newExperiences = profile.experiences.filter((_, index) => index !== experienceIndex);
    await updateUserProfile(uid, { experiences: newExperiences });
    
    console.log(`✅ [PROFIL] Expérience supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("❌ [PROFIL] Erreur lors de la suppression de l'expérience :", error);
    throw error;
  }
}; 