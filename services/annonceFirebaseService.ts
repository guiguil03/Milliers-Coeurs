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
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Interface Annonce basée sur votre structure existante
 * avec quelques adaptations pour Firestore
 */
export interface Annonce {
  id?: string;               // ID unique généré par Firestore
  logo?: string;             // URL du logo de l'organisation
  organisation: string;      // Nom de l'organisation
  temps?: string;            // Temps écoulé depuis la publication (calculé côté client)
  description: string;       // Description de l'annonce
  date: string;              // Date de l'événement
  important: string;         // Information importante
  dateCreation?: Timestamp;  // Date de création (ajouté pour Firestore)
  dateModification?: Timestamp; // Date de modification (ajouté pour Firestore)
  utilisateurId?: string;    // ID de l'utilisateur qui a créé l'annonce (ajouté pour Firestore)
  lieu?: string;             // Lieu de l'événement (optionnel)
  categorie?: string;        // Catégorie (optionnel)
  places?: number;           // Nombre de places disponibles (optionnel)
  contact?: {                // Informations de contact (optionnel)
    email?: string;
    telephone?: string;
  };
  images?: string[];         // URLs des images supplémentaires (optionnel)
  statut?: 'active' | 'terminée' | 'annulée'; // Statut de l'annonce (optionnel)
}

/**
 * Service pour gérer les annonces dans Firebase Firestore
 */
class AnnonceService {
  private collectionName = 'annonces';
  
  /**
   * Convertir un document Firestore en objet Annonce
   */
  private convertAnnonceDoc(doc: QueryDocumentSnapshot<DocumentData>): Annonce {
    const data = doc.data();
    return {
      id: doc.id,
      logo: data.logo,
      organisation: data.organisation,
      temps: this.calculerTempsEcoule(data.dateCreation?.toDate()),
      description: data.description,
      date: data.date,
      important: data.important,
      dateCreation: data.dateCreation,
      dateModification: data.dateModification,
      utilisateurId: data.utilisateurId,
      lieu: data.lieu,
      categorie: data.categorie,
      places: data.places,
      contact: data.contact,
      images: data.images,
      statut: data.statut
    };
  }

  /**
   * Calculer le temps écoulé depuis la création
   */
  private calculerTempsEcoule(date?: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `il y a ${diffMins} min`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Obtenir toutes les annonces
   */
  async getAllAnnonces(): Promise<Annonce[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('dateCreation', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertAnnonceDoc(doc));
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces:", error);
      throw error;
    }
  }

  /**
   * Obtenir les annonces les plus récentes (avec limite)
   */
  async getRecentAnnonces(limitCount: number = 10): Promise<Annonce[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('dateCreation', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertAnnonceDoc(doc));
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces récentes:", error);
      throw error;
    }
  }

  /**
   * Obtenir les annonces par organisation
   */
  async getAnnoncesByOrganisation(organisation: string): Promise<Annonce[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('organisation', '==', organisation),
        orderBy('dateCreation', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertAnnonceDoc(doc));
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de ${organisation}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les annonces par catégorie
   */
  async getAnnoncesByCategorie(categorie: string): Promise<Annonce[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('categorie', '==', categorie),
        orderBy('dateCreation', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertAnnonceDoc(doc));
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de la catégorie ${categorie}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir une annonce par ID
   */
  async getAnnonceById(id: string): Promise<Annonce | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          logo: data.logo,
          organisation: data.organisation,
          temps: this.calculerTempsEcoule(data.dateCreation?.toDate()),
          description: data.description,
          date: data.date,
          important: data.important,
          dateCreation: data.dateCreation,
          dateModification: data.dateModification,
          utilisateurId: data.utilisateurId,
          lieu: data.lieu,
          categorie: data.categorie,
          places: data.places,
          contact: data.contact,
          images: data.images,
          statut: data.statut
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'annonce ${id}:`, error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle annonce
   */
  async createAnnonce(annonce: Omit<Annonce, 'id' | 'dateCreation' | 'dateModification' | 'temps'>): Promise<string> {
    try {
      // Filtrer les champs undefined (pas acceptés par Firestore)
      const cleanedAnnonce = Object.fromEntries(
        Object.entries(annonce).filter(([_, value]) => value !== undefined)
      );
      
      // Ajouter les champs timestamp
      const annonceWithTimestamps = {
        ...cleanedAnnonce,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
        statut: annonce.statut || 'active'
      };
      
      const docRef = await addDoc(collection(db, this.collectionName), annonceWithTimestamps);
      console.log("Annonce créée avec l'ID:", docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
      throw error;
    }
  }

  /**
   * Mettre à jour une annonce existante
   */
  async updateAnnonce(id: string, annonce: Partial<Omit<Annonce, 'id' | 'dateCreation' | 'temps'>>): Promise<void> {
    try {
      // Filtrer les champs undefined (pas acceptés par Firestore)
      const cleanedAnnonce = Object.fromEntries(
        Object.entries(annonce).filter(([_, value]) => value !== undefined)
      );
      
      // Ajouter la date de modification
      const updateData = {
        ...cleanedAnnonce,
        dateModification: serverTimestamp()
      };
      
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, updateData);
      
      console.log("Annonce mise à jour avec succès:", id);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'annonce ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprimer une annonce
   */
  async deleteAnnonce(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      
      console.log("Annonce supprimée avec succès:", id);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'annonce ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les annonces d'un utilisateur
   */
  async getAnnoncesByUser(userId: string): Promise<Annonce[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('utilisateurId', '==', userId),
        orderBy('dateCreation', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertAnnonceDoc(doc));
    } catch (error) {
      console.error(`Erreur lors de la récupération des annonces de l'utilisateur ${userId}:`, error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const annonceService = new AnnonceService();
