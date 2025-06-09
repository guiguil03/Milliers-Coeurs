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
 * Service de gestion des réservations d'annonces de bénévolat
 */
export const reservationService = {
  /**
   * Créer une nouvelle réservation pour une annonce
   * @param reservation Données de la réservation à créer
   * @returns ID de la réservation créée
   */
  createReservation: async (reservation: NouvelleReservation): Promise<string> => {
    try {
      console.log('🔵 [RESERVATION_SERVICE] Début createReservation avec:', reservation);
      
      // Vérifier si l'annonce existe et est disponible
      const annonce = await annonceService.getAnnonceById(reservation.annonceId);
      console.log('🔵 [RESERVATION_SERVICE] Annonce récupérée:', annonce ? 'trouvée' : 'non trouvée');
      
      if (!annonce) {
        throw new Error("Cette annonce n'existe plus");
      }
      
      // Vérifier si l'utilisateur a déjà une réservation active pour cette annonce
      const hasExisting = await reservationService.hasExistingReservation(
        reservation.benevoleId, 
        reservation.annonceId
      );
      console.log('🔵 [RESERVATION_SERVICE] A déjà une réservation:', hasExisting);
      
      if (hasExisting) {
        throw new Error("Vous avez déjà réservé cette annonce");
      }
      
      // Créer l'objet réservation avec le statut par défaut et s'assurer qu'aucun champ n'est undefined
      const cleanReservation = {
        annonceId: reservation.annonceId,
        benevoleId: reservation.benevoleId,
        benevoleName: reservation.benevoleName || '',
        benevoleEmail: reservation.benevoleEmail || '',
        message: reservation.message || ''
      };
      
      const newReservation: Omit<Reservation, 'id'> = {
        ...cleanReservation,
        dateReservation: new Date(),
        statut: ReservationStatut.EnAttente
      };
      
      console.log('🔵 [RESERVATION_SERVICE] Objet réservation à créer:', newReservation);
      
      // Ajouter la réservation à Firestore
      const reservationRef = await addDoc(collection(db, 'reservations'), {
        ...newReservation,
        dateReservation: Timestamp.fromDate(newReservation.dateReservation)
      });
      
      console.log('✅ [RESERVATION_SERVICE] Réservation créée avec ID:', reservationRef.id);
      
      // Mettre à jour le nombre de places disponibles dans l'annonce si nécessaire
      if (annonce.places !== undefined && annonce.places > 0) {
        await annonceService.updateAnnonce(reservation.annonceId, {
          places: annonce.places - 1
        });
        console.log('🔵 [RESERVATION_SERVICE] Places mises à jour');
      }
      
      return reservationRef.id;
    } catch (error) {
      console.error("🔴 [RESERVATION_SERVICE] Erreur lors de la création de la réservation :", error);
      throw error;
    }
  },
  
  /**
   * Récupérer une réservation par son ID
   * @param id ID de la réservation
   * @returns Objet Reservation ou null si non trouvé
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
      console.error("Erreur lors de la récupération de la réservation :", error);
      throw error;
    }
  },
  
  /**
   * Récupérer toutes les réservations d'un bénévole
   * @param benevoleId ID de l'utilisateur bénévole
   * @returns Liste des réservations du bénévole
   */
  getReservationsByBenevole: async (benevoleId: string): Promise<Reservation[]> => {
    try {
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('benevoleId', '==', benevoleId),
        orderBy('dateReservation', 'desc')
      );
      
      const querySnapshot = await getDocs(reservationsQuery);
      return querySnapshot.docs.map(convertReservationDoc);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations du bénévole :", error);
      throw error;
    }
  },
  
  /**
   * Récupérer toutes les réservations d'un utilisateur (quel que soit son type)
   * @param userId ID de l'utilisateur
   * @returns Liste des réservations de l'utilisateur
   */
  getReservationsByUser: async (userId: string): Promise<Reservation[]> => {
    try {
      console.log(`Récupération des réservations pour l'utilisateur: ${userId}`);

      if (!userId) {
        console.error("ID utilisateur non valide");
        return [];
      }
      
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('benevoleId', '==', userId)
      );
      
      console.log("Exécution de la requête Firestore");
      const querySnapshot = await getDocs(reservationsQuery);
      console.log(`Nombre de réservations trouvées: ${querySnapshot.docs.length}`);

      // Convertir les documents en objets Reservation
      const reservations = querySnapshot.docs.map(doc => {
        try {
          return convertReservationDoc(doc);
        } catch (error) {
          console.error(`Erreur lors de la conversion du document ${doc.id}:`, error);
          return null;
        }
      }).filter(reservation => reservation !== null) as Reservation[];
      
      // Tri côté client
      reservations.sort((a, b) => {
        if (!a.dateReservation) return 1;
        if (!b.dateReservation) return -1;
        return b.dateReservation.getTime() - a.dateReservation.getTime();
      });

      console.log(`${reservations.length} réservations valides récupérées`);
      return reservations;
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations de l'utilisateur :", error);
      // Retourner un tableau vide au lieu de propager l'erreur
      return [];
    }
  },
  
  /**
   * Récupérer toutes les réservations pour une annonce
   * @param annonceId ID de l'annonce
   * @returns Liste des réservations pour cette annonce
   */
  getReservationsByAnnonce: async (annonceId: string): Promise<Reservation[]> => {
    try {
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('annonceId', '==', annonceId),
        orderBy('dateReservation', 'desc')
      );
      
      const querySnapshot = await getDocs(reservationsQuery);
      return querySnapshot.docs.map(convertReservationDoc);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations de l'annonce :", error);
      throw error;
    }
  },
  
  /**
   * Récupérer une annonce disponible pour les tests
   * @returns La première annonce disponible ou null si aucune n'est trouvée
   */
  getTestAnnonce: async () => {
    try {
      console.log("Récupération d'une annonce pour les tests");
      const annoncesCollection = collection(db, 'annonces');
      const querySnapshot = await getDocs(annoncesCollection);
      
      if (querySnapshot.empty) {
        console.log("Aucune annonce trouvée pour les tests");
        return null;
      }
      
      // Retourner la première annonce
      const annonceDoc = querySnapshot.docs[0];
      console.log(`Annonce trouvée pour les tests: ${annonceDoc.id}`);
      return {
        id: annonceDoc.id,
        ...annonceDoc.data()
      };
    } catch (error) {
      console.error("Erreur lors de la récupération d'une annonce de test:", error);
      return null;
    }
  },
  
  /**
   * Vérifie si un utilisateur a déjà une réservation active pour une annonce donnée
   * @param userId ID de l'utilisateur
   * @param annonceId ID de l'annonce
   * @returns true si l'utilisateur a déjà une réservation, false sinon
   */
  hasExistingReservation: async (userId: string, annonceId: string): Promise<boolean> => {
    try {
      if (!userId || !annonceId) {
        return false;
      }
      
      // Recherche des réservations existantes non annulées pour cet utilisateur et cette annonce
      const reservationsQuery = query(
        collection(db, 'reservations'),
        where('benevoleId', '==', userId),
        where('annonceId', '==', annonceId),
        where('statut', 'in', [
          ReservationStatut.EnAttente, 
          ReservationStatut.Confirmee
        ])
      );
      
      const querySnapshot = await getDocs(reservationsQuery);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erreur lors de la vérification des réservations existantes:", error);
      return false;
    }
  },
  
  /**
   * Vérifie si un bénévole a déjà réservé une annonce spécifique
   * @param annonceId ID de l'annonce
   * @param benevoleId ID du bénévole
   * @returns true si le bénévole a déjà une réservation active pour cette annonce
   */
  hasBenevoleReservedAnnonce: async (annonceId: string, benevoleId: string): Promise<boolean> => {
    return reservationService.hasExistingReservation(benevoleId, annonceId);
  },
  
  /**
   * Mettre à jour le statut d'une réservation
   * @param id ID de la réservation
   * @param statut Nouveau statut
   * @param commentaire Commentaire optionnel (pour les associations)
   */
  updateReservationStatus: async (id: string, statut: ReservationStatut, commentaire?: string): Promise<void> => {
    try {
      console.log('🔵 [RESERVATION_SERVICE] Mise à jour du statut de la réservation:', id, 'vers', statut);
      
      const reservationRef = doc(db, 'reservations', id);
      const updateData: Partial<Reservation> = { statut };
      
      if (commentaire) {
        updateData.commentaireAssociation = commentaire;
      }
      
      await updateDoc(reservationRef, updateData);
      console.log('✅ [RESERVATION_SERVICE] Statut de la réservation mis à jour');
      
      // Si la réservation est annulée ou refusée, mettre à jour le nombre de places disponibles
      if (statut === ReservationStatut.Annulee || statut === ReservationStatut.Refusee) {
        console.log('🔵 [RESERVATION_SERVICE] Réservation annulée/refusée, remise de la place disponible');
        const reservation = await reservationService.getReservationById(id);
        if (reservation && reservation.annonceId) {
          const annonce = await annonceService.getAnnonceById(reservation.annonceId);
          console.log('🔵 [RESERVATION_SERVICE] Annonce récupérée, places actuelles:', annonce?.places);
          if (annonce && annonce.places !== undefined) {
            await annonceService.updateAnnonce(reservation.annonceId, {
              places: annonce.places + 1
            });
            console.log('✅ [RESERVATION_SERVICE] Place remise à disposition, nouvelles places:', annonce.places + 1);
          }
        }
      }
    } catch (error) {
      console.error("🔴 [RESERVATION_SERVICE] Erreur lors de la mise à jour du statut de la réservation :", error);
      throw error;
    }
  },
  
  /**
   * Supprimer une réservation (utilisée principalement pour les tests)
   * @param id ID de la réservation à supprimer
   */
  deleteReservation: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la réservation :", error);
      throw error;
    }
  }
};
