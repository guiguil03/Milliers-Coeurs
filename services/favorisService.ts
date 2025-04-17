import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  doc, 
  query,
  where,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Annonce, annonceService } from './annonceFirebaseService';

/**
 * Interface pour les favoris
 */
export interface Favori {
  id?: string;               // ID unique généré par Firestore
  utilisateurId: string;     // ID de l'utilisateur qui a ajouté le favori
  annonceId: string;         // ID de l'annonce mise en favori
  dateCreation?: any;        // Date d'ajout aux favoris
}

/**
 * Service pour gérer les favoris dans Firebase Firestore
 */
class FavorisService {
  private collectionName = 'favoris';
  
  /**
   * Convertir un document Firestore en objet Favori
   */
  private convertFavoriDoc(doc: QueryDocumentSnapshot<DocumentData>): Favori {
    const data = doc.data();
    return {
      id: doc.id,
      utilisateurId: data.utilisateurId,
      annonceId: data.annonceId,
      dateCreation: data.dateCreation
    };
  }

  /**
   * Ajouter une annonce aux favoris
   */
  async addFavori(utilisateurId: string, annonceId: string): Promise<string> {
    try {
      // Vérifier si l'annonce existe déjà dans les favoris
      const existingFavori = await this.getFavoriByUserAndAnnonce(utilisateurId, annonceId);
      if (existingFavori) {
        return existingFavori.id as string;
      }

      // Créer un nouveau favori
      const favoriData = {
        utilisateurId,
        annonceId,
        dateCreation: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.collectionName), favoriData);
      return docRef.id;
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      throw error;
    }
  }

  /**
   * Supprimer une annonce des favoris
   */
  async removeFavori(utilisateurId: string, annonceId: string): Promise<boolean> {
    try {
      // Trouver le favori à supprimer
      const favori = await this.getFavoriByUserAndAnnonce(utilisateurId, annonceId);
      if (!favori || !favori.id) {
        return false;
      }

      // Supprimer le favori
      await deleteDoc(doc(db, this.collectionName, favori.id));
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      throw error;
    }
  }

  /**
   * Vérifier si une annonce est dans les favoris d'un utilisateur
   */
  async isFavori(utilisateurId: string, annonceId: string): Promise<boolean> {
    try {
      const favori = await this.getFavoriByUserAndAnnonce(utilisateurId, annonceId);
      return !!favori;
    } catch (error) {
      console.error("Erreur lors de la vérification du favori:", error);
      throw error;
    }
  }

  /**
   * Récupérer un favori par utilisateur et annonce
   */
  async getFavoriByUserAndAnnonce(utilisateurId: string, annonceId: string): Promise<Favori | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('utilisateurId', '==', utilisateurId),
        where('annonceId', '==', annonceId)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      
      return this.convertFavoriDoc(querySnapshot.docs[0]);
    } catch (error) {
      console.error("Erreur lors de la récupération du favori:", error);
      throw error;
    }
  }

  /**
   * Récupérer tous les favoris d'un utilisateur
   */
  async getFavorisByUser(utilisateurId: string): Promise<Favori[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('utilisateurId', '==', utilisateurId),
        orderBy('dateCreation', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFavoriDoc(doc));
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les annonces en favoris d'un utilisateur
   */
  async getFavorisAnnonces(utilisateurId: string): Promise<Annonce[]> {
    try {
      // Récupérer tous les favoris de l'utilisateur
      const favoris = await this.getFavorisByUser(utilisateurId);
      
      // Récupérer les annonces correspondantes
      const annonces: Annonce[] = [];
      for (const favori of favoris) {
        const annonce = await annonceService.getAnnonceById(favori.annonceId);
        if (annonce) {
          annonces.push(annonce);
        }
      }
      
      return annonces;
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces en favoris:", error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const favorisService = new FavorisService();
