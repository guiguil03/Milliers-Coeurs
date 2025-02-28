import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour les annonces
export interface IAnnonce {
  id?: string;
  titre: string;
  description: string;
  organisation: {
    nom: string;
    logo: string;
  };
  date: string;
  lieu: string;
  categorie: string;
  competences_requises: string[];
  date_creation: Date | Timestamp;
  // Champs optionnels
  image?: string;
  nombre_places?: number;
  duree?: string;
}

// Convertir un document Firestore en objet Annonce
const convertAnnonceDoc = (doc: QueryDocumentSnapshot<DocumentData>): IAnnonce => {
  const data = doc.data();
  return {
    id: doc.id,
    titre: data.titre,
    description: data.description,
    organisation: data.organisation,
    date: data.date,
    lieu: data.lieu,
    categorie: data.categorie,
    competences_requises: data.competences_requises,
    date_creation: data.date_creation,
    image: data.image,
    nombre_places: data.nombre_places,
    duree: data.duree
  };
};

// Obtenir toutes les annonces
export const getAllAnnonces = async (): Promise<IAnnonce[]> => {
  try {
    const annonceQuery = query(
      collection(db, 'annonces'),
      orderBy('date_creation', 'desc')
    );
    
    const querySnapshot = await getDocs(annonceQuery);
    return querySnapshot.docs.map(convertAnnonceDoc);
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces :", error);
    throw error;
  }
};

// Obtenir les annonces par catégorie
export const getAnnoncesByCategory = async (categorie: string): Promise<IAnnonce[]> => {
  try {
    const annonceQuery = query(
      collection(db, 'annonces'),
      where('categorie', '==', categorie),
      orderBy('date_creation', 'desc')
    );
    
    const querySnapshot = await getDocs(annonceQuery);
    return querySnapshot.docs.map(convertAnnonceDoc);
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces par catégorie :", error);
    throw error;
  }
};

// Obtenir une annonce par ID
export const getAnnonceById = async (id: string): Promise<IAnnonce | null> => {
  try {
    const annonceDoc = await getDoc(doc(db, 'annonces', id));
    
    if (annonceDoc.exists()) {
      const data = annonceDoc.data();
      return {
        id: annonceDoc.id,
        titre: data.titre,
        description: data.description,
        organisation: data.organisation,
        date: data.date,
        lieu: data.lieu,
        categorie: data.categorie,
        competences_requises: data.competences_requises,
        date_creation: data.date_creation,
        image: data.image,
        nombre_places: data.nombre_places,
        duree: data.duree
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce :", error);
    throw error;
  }
};

// Créer une nouvelle annonce
export const createAnnonce = async (annonce: Omit<IAnnonce, 'id'>): Promise<string> => {
  try {
    // Assurer que date_creation est un Timestamp Firestore
    const annonceWithTimestamp = {
      ...annonce,
      date_creation: Timestamp.fromDate(
        annonce.date_creation instanceof Date 
          ? annonce.date_creation 
          : new Date()
      )
    };
    
    const docRef = await addDoc(collection(db, 'annonces'), annonceWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de l'annonce :", error);
    throw error;
  }
};

// Mettre à jour une annonce
export const updateAnnonce = async (id: string, annonce: Partial<IAnnonce>): Promise<void> => {
  try {
    const annonceRef = doc(db, 'annonces', id);
    
    // Convertir date_creation en Timestamp si présent
    if (annonce.date_creation && annonce.date_creation instanceof Date) {
      annonce.date_creation = Timestamp.fromDate(annonce.date_creation);
    }
    
    await updateDoc(annonceRef, annonce);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce :", error);
    throw error;
  }
};

// Supprimer une annonce
export const deleteAnnonce = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'annonces', id));
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce :", error);
    throw error;
  }
};
