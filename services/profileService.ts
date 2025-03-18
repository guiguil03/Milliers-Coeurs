import {
  setDoc,
  getDoc,
  updateDoc,
  doc,
  DocumentData,
  deleteField
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../config/firebase';
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

/**
 * Crée ou remplace un profil utilisateur complet
 */
export const setUserProfile = async (profile: IProfile): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const updatedProfile = {
      ...profile,
      dateModification: now,
      dateCreation: profile.dateCreation || now,
    };
    
    await setDoc(doc(db, 'profiles', profile.uid), updatedProfile);
    console.log(`Profil créé/mis à jour pour l'utilisateur ${profile.uid}`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};

/**
 * Récupère le profil complet d'un utilisateur
 */
export const getUserProfile = async (uid: string): Promise<IProfile | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', uid));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data() as DocumentData;
      const profileData: IProfile = {
        uid: profileDoc.id,
        prenom: data.prenom || '',
        nom: data.nom || '',
        email: data.email || '',
        image: data.image || '',
        adresse: data.adresse,
        code_postal: data.code_postal,
        ville: data.ville,
        telephone: data.telephone,
        biographie: data.biographie || data.bio, // Compatibilité avec l'ancien format
        competences: data.competences || [],
        experiences: data.experiences || [],
        permis: data.permis || (data.transport?.permifiee) || false,
        vehicule: data.vehicule || (data.transport?.vehiculee) || false,
        userType: data.userType || 'benevole',
        preferences: data.preferences || {
          notificationsEmail: true,
          notificationsApp: true,
          visibilitePublique: true
        },
        dateCreation: data.dateCreation || '',
        dateModification: data.dateModification || ''
      };
      return profileData;
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    throw error;
  }
};

/**
 * Met à jour partiellement un profil utilisateur
 */
export const updateUserProfile = async (uid: string, profileData: Partial<IProfile>): Promise<void> => {
  try {
    // Ajouter la date de modification
    const updatedData = {
      ...profileData,
      dateModification: new Date().toISOString()
    };
    
    await updateDoc(doc(db, 'profiles', uid), updatedData);
    console.log(`Profil mis à jour partiellement pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};

/**
 * Supprime un champ spécifique du profil utilisateur
 */
export const removeProfileField = async (uid: string, fieldPath: string): Promise<void> => {
  try {
    const updates: any = {
      dateModification: new Date().toISOString()
    };
    
    updates[fieldPath] = deleteField();
    
    await updateDoc(doc(db, 'profiles', uid), updates);
    console.log(`Champ ${fieldPath} supprimé du profil de l'utilisateur ${uid}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du champ ${fieldPath} :`, error);
    throw error;
  }
};

/**
 * Télécharge une image vers Firebase Storage et met à jour l'URL dans le profil
 */
export const uploadProfileImage = async (uid: string, imageUri: string): Promise<string> => {
  try {
    // Convertir l'URI de l'image en blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Créer une référence au fichier dans Firebase Storage
    const imageRef = ref(storage, `profiles/${uid}/profile-image`);
    
    // Télécharger l'image
    const snapshot = await uploadBytes(imageRef, blob);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Mettre à jour le profil avec la nouvelle URL d'image
    await updateUserProfile(uid, { image: downloadURL });
    
    console.log(`Image de profil mise à jour pour l'utilisateur ${uid}`);
    return downloadURL;
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image de profil :", error);
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
    
    const competences = [...(profile.competences || [])];
    
    // Vérifier si la compétence existe déjà
    const existingIndex = competences.findIndex(comp => comp.name === competence.name);
    
    if (existingIndex >= 0) {
      // Mettre à jour la compétence existante
      competences[existingIndex] = competence;
    } else {
      // Ajouter la nouvelle compétence
      competences.push(competence);
    }
    
    await updateUserProfile(uid, { competences });
    console.log(`Compétence ajoutée/mise à jour pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la compétence :", error);
    throw error;
  }
};

/**
 * Supprime une compétence du profil utilisateur
 */
export const removeProfileCompetence = async (uid: string, competenceName: string): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile || !profile.competences) {
      throw new Error("Profil utilisateur ou compétences non trouvés");
    }
    
    const updatedCompetences = profile.competences.filter(comp => comp.name !== competenceName);
    
    await updateUserProfile(uid, { competences: updatedCompetences });
    console.log(`Compétence supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétence :", error);
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
    
    const experiences = [...(profile.experiences || [])];
    experiences.push(experience);
    
    await updateUserProfile(uid, { experiences });
    console.log(`Expérience ajoutée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'expérience :", error);
    throw error;
  }
};

/**
 * Supprime une expérience du profil utilisateur
 */
export const removeProfileExperience = async (uid: string, experienceIndex: number): Promise<void> => {
  try {
    const profile = await getUserProfile(uid);
    
    if (!profile || !profile.experiences) {
      throw new Error("Profil utilisateur ou expériences non trouvés");
    }
    
    if (experienceIndex < 0 || experienceIndex >= profile.experiences.length) {
      throw new Error("Index d'expérience invalide");
    }
    
    const updatedExperiences = [...profile.experiences];
    updatedExperiences.splice(experienceIndex, 1);
    
    await updateUserProfile(uid, { experiences: updatedExperiences });
    console.log(`Expérience supprimée pour l'utilisateur ${uid}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'expérience :", error);
    throw error;
  }
};

// Service objet exporté pour un accès plus propre
export const profileService = {
  getProfile: getUserProfile,
  setProfile: setUserProfile,
  updateProfile: updateUserProfile,
  removeField: removeProfileField,
  uploadImage: uploadProfileImage,
  addCompetence: addProfileCompetence,
  removeCompetence: removeProfileCompetence,
  addExperience: addProfileExperience,
  removeExperience: removeProfileExperience
};
