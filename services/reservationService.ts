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
import { Reservation, ReservationStatut, NouvelleReservation } from '../models/Reservation';
import { annonceService } from './annonceFirebaseService';

// Convertir un document Firestore en objet Reservation
const convertReservationDoc = (doc: QueryDocumentSnapshot<DocumentData>): Reservation => {
  const data = doc.data();
  return {
    id: doc.id,
    annonceId: data.annonceId,
    benevoleId: data.benevoleId,
    benevoleName: data.benevoleName,
    benevoleEmail: data.benevoleEmail,
    dateReservation: data.dateReservation instanceof Timestamp 
      ? data.dateReservation.toDate() 
      : new Date(data.dateReservation),
    statut: data.statut,
    message: data.message,
    commentaireAssociation: data.commentaireAssociation
  };
};

/**
 * Service de gestion des réservations - VERSION SIMPLIFIÉE ET FONCTIONNELLE
 */
export const reservationService = {

  /**
   * Créer une nouvelle réservation
   */
  createReservation: async (reservation: NouvelleReservation): Promise<string> => {
    try {
      console.log('🎯 [RESERVATION] Création réservation:', reservation);
      
      const newReservation = {
        annonceId: reservation.annonceId,
        benevoleId: reservation.benevoleId,
        benevoleName: reservation.benevoleName || 'Bénévole',
        benevoleEmail: reservation.benevoleEmail || '',
        message: reservation.message || 'Nouvelle réservation',
        dateReservation: Timestamp.fromDate(new Date()),
        statut: ReservationStatut.EnAttente
      };
      
      const reservationRef = await addDoc(collection(db, 'reservations'), newReservation);
      
      console.log('✅ [RESERVATION] Créée avec succès, ID:', reservationRef.id);
      return reservationRef.id;
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur création:", error);
      throw new Error(`Impossible de créer la réservation: ${error}`);
    }
  },

  /**
   * Récupérer les réservations d'un utilisateur
   */
  getReservationsByUser: async (userId: string): Promise<Reservation[]> => {
    try {
      console.log('📋 [RESERVATION] Récupération pour utilisateur:', userId);

      if (!userId) {
        console.log("❌ [RESERVATION] Pas d'ID utilisateur");
        return [];
      }
      
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('benevoleId', '==', userId)
      );
      
      const querySnapshot = await getDocs(reservationsQuery);
      console.log(`📋 [RESERVATION] ${querySnapshot.docs.length} documents trouvés`);

      const reservations: Reservation[] = [];
      
      querySnapshot.docs.forEach(doc => {
        try {
          const data = doc.data();
          const reservation: Reservation = {
            id: doc.id,
            annonceId: data.annonceId,
            benevoleId: data.benevoleId,
            benevoleName: data.benevoleName,
            benevoleEmail: data.benevoleEmail,
            dateReservation: data.dateReservation?.toDate() || new Date(),
            statut: data.statut,
            message: data.message,
            commentaireAssociation: data.commentaireAssociation
          };
          reservations.push(reservation);
          console.log(`✅ [RESERVATION] Ajoutée: ${doc.id}`);
        } catch (error) {
          console.error(`❌ [RESERVATION] Erreur conversion ${doc.id}:`, error);
        }
      });
      
      // Tri par date (plus récent en premier)
      reservations.sort((a, b) => b.dateReservation.getTime() - a.dateReservation.getTime());

      console.log(`✅ [RESERVATION] ${reservations.length} réservations récupérées`);
      return reservations;
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur récupération:", error);
      return [];
    }
  },

  /**
   * Récupérer une réservation par ID
   */
  getReservationById: async (id: string): Promise<Reservation | null> => {
    try {
      const reservationDoc = await getDoc(doc(db, 'reservations', id));
      
      if (reservationDoc.exists()) {
        const data = reservationDoc.data();
        return {
          id: reservationDoc.id,
          annonceId: data.annonceId,
          benevoleId: data.benevoleId,
          benevoleName: data.benevoleName,
          benevoleEmail: data.benevoleEmail,
          dateReservation: data.dateReservation instanceof Timestamp 
            ? data.dateReservation.toDate() 
            : new Date(data.dateReservation),
          statut: data.statut,
          message: data.message,
          commentaireAssociation: data.commentaireAssociation
        };
      }
      
      return null;
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur récupération par ID:", error);
      return null;
    }
  },

  /**
   * Vérifier si l'utilisateur a déjà réservé une annonce
   */
  hasExistingReservation: async (userId: string, annonceId: string): Promise<boolean> => {
    try {
      console.log(`🔍 [RESERVATION] Vérification réservation existante: ${userId} -> ${annonceId}`);
      
      if (!userId || !annonceId) {
        return false;
      }
      
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('benevoleId', '==', userId),
        where('annonceId', '==', annonceId)
      );
      
      const querySnapshot = await getDocs(reservationsQuery);
      
      // Vérifier s'il y a une réservation active
      const hasActiveReservation = querySnapshot.docs.some(doc => {
        const data = doc.data();
        return data.statut === ReservationStatut.EnAttente || 
               data.statut === ReservationStatut.Confirmee;
      });
      
      console.log(`🔍 [RESERVATION] Réservation existante: ${hasActiveReservation}`);
      return hasActiveReservation;
      
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur vérification:", error);
      return false;
    }
  },

  /**
   * Mettre à jour le statut d'une réservation
   */
  updateReservationStatus: async (id: string, statut: ReservationStatut, commentaire?: string): Promise<void> => {
    try {
      const reservationRef = doc(db, 'reservations', id);
      const updateData: any = { statut };
      
      if (commentaire) {
        updateData.commentaireAssociation = commentaire;
      }
      
      await updateDoc(reservationRef, updateData);
      console.log('✅ [RESERVATION] Statut mis à jour:', statut);
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur mise à jour statut:", error);
      throw error;
    }
  },

  /**
   * Supprimer une réservation
   */
  deleteReservation: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'reservations', id));
      console.log('✅ [RESERVATION] Réservation supprimée:', id);
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur suppression:", error);
      throw error;
    }
  }
};
