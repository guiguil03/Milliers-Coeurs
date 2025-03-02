import {
  setDoc,
  getDoc,
  updateDoc,
  doc,
  DocumentData
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface ICompetence {
  name: string;
  level: number;
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
  bio?: string;
  competences?: ICompetence[];
  experiences?: IExperience[];
  transport?: {
    permifiee: boolean;
    vehiculee: boolean;
  };
}

export const setUserProfile = async (profile: IProfile): Promise<void> => {
  try {
    await setDoc(doc(db, 'profiles', profile.uid), profile);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<IProfile | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'profiles', uid));
    
    if (profileDoc.exists()) {
      const data = profileDoc.data() as DocumentData;
      return {
        uid: profileDoc.id,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        image: data.image,
        adresse: data.adresse,
        code_postal: data.code_postal,
        ville: data.ville,
        telephone: data.telephone,
        bio: data.bio,
        competences: data.competences,
        experiences: data.experiences,
        transport: data.transport
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    throw error;
  }
};

// Mettre à jour partiellement un profil utilisateur
export const updateUserProfile = async (uid: string, profileData: Partial<IProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'profiles', uid), profileData);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    throw error;
  }
};


