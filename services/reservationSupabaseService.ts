import { supabase } from '../config/supabase';
import { Reservation, ReservationStatut, NouvelleReservation } from '../models/Reservation';
import { annonceSupabaseService } from './annonceSupabaseService';

// Convertir un objet Supabase en Reservation
const convertReservationData = (data: any): Reservation => {
  return {
    id: data.id,
    annonceId: data.annonce_id,
    benevoleId: data.benevole_id,
    benevoleName: data.benevole_name,
    benevoleEmail: data.benevole_email,
    dateReservation: new Date(data.created_at),
    statut: data.statut,
    message: data.message,
    commentaireAssociation: data.commentaire_association
  };
};

/**
 * Service de gestion des réservations avec Supabase
 */
export const reservationSupabaseService = {

  /**
   * Créer une nouvelle réservation
   */
  createReservation: async (reservation: NouvelleReservation): Promise<string> => {
    try {
      console.log('🎯 [RESERVATION] Création réservation:', reservation);
      
      const newReservation = {
        annonce_id: reservation.annonceId,
        benevole_id: reservation.benevoleId,
        benevole_name: reservation.benevoleName || 'Bénévole',
        benevole_email: reservation.benevoleEmail || '',
        message: reservation.message || 'Nouvelle réservation',
        statut: ReservationStatut.EnAttente,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('reservations')
        .insert(newReservation)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [RESERVATION] Créée avec succès, ID:', data.id);
      return data.id;
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
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('benevole_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      console.log(`📋 [RESERVATION] ${data?.length || 0} documents trouvés`);

      const reservations: Reservation[] = [];
      
      if (data) {
        data.forEach(item => {
          try {
            const reservation = convertReservationData(item);
            reservations.push(reservation);
            console.log(`✅ [RESERVATION] Ajoutée: ${item.id}`);
          } catch (error) {
            console.error(`❌ [RESERVATION] Erreur conversion ${item.id}:`, error);
          }
        });
      }

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
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun enregistrement trouvé
          return null;
        }
        throw error;
      }
      
      return convertReservationData(data);
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
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('benevole_id', userId)
        .eq('annonce_id', annonceId);
      
      if (error) {
        throw error;
      }
      
      // Vérifier s'il y a une réservation active
      const hasActiveReservation = data?.some(item => {
        return item.statut === ReservationStatut.EnAttente || 
               item.statut === ReservationStatut.Confirmee;
      }) || false;
      
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
      const updateData: any = { 
        statut,
        updated_at: new Date().toISOString()
      };
      
      if (commentaire) {
        updateData.commentaire_association = commentaire;
      }
      
      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [RESERVATION] Statut mis à jour:', id, statut);
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur mise à jour statut:", error);
      throw new Error(`Impossible de mettre à jour le statut: ${error}`);
    }
  },

  /**
   * Supprimer une réservation
   */
  deleteReservation: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [RESERVATION] Supprimée:', id);
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur suppression:", error);
      throw new Error(`Impossible de supprimer la réservation: ${error}`);
    }
  },

  /**
   * Récupérer les réservations pour les annonces d'une association
   */
  getReservationsForAssociation: async (associationUserId: string): Promise<Reservation[]> => {
    try {
      // D'abord récupérer les annonces de l'association
      const annonces = await annonceSupabaseService.getAnnoncesByUser(associationUserId);
      const annonceIds = annonces.map(a => a.id).filter(id => id) as string[];
      
      if (annonceIds.length === 0) {
        return [];
      }
      
      // Puis récupérer les réservations pour ces annonces
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .in('annonce_id', annonceIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(convertReservationData) : [];
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur récupération pour association:", error);
      return [];
    }
  },

  /**
   * Compter les réservations par statut pour un utilisateur
   */
  getReservationStats: async (userId: string): Promise<Record<ReservationStatut, number>> => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('statut')
        .eq('benevole_id', userId);
      
      if (error) {
        throw error;
      }
      
      const stats: Record<ReservationStatut, number> = {
        [ReservationStatut.EnAttente]: 0,
        [ReservationStatut.Confirmee]: 0,
        [ReservationStatut.Annulee]: 0,
        [ReservationStatut.Refusee]: 0,
        [ReservationStatut.Terminee]: 0
      };
      
      if (data) {
        data.forEach(item => {
          if (item.statut in stats) {
            stats[item.statut as ReservationStatut]++;
          }
        });
      }
      
      return stats;
    } catch (error) {
      console.error("❌ [RESERVATION] Erreur récupération statistiques:", error);
      return {
        [ReservationStatut.EnAttente]: 0,
        [ReservationStatut.Confirmee]: 0,
        [ReservationStatut.Annulee]: 0,
        [ReservationStatut.Refusee]: 0,
        [ReservationStatut.Terminee]: 0
      };
    }
  }
}; 