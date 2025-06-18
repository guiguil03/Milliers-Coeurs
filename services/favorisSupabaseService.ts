import { supabase } from '../config/supabase';
import { annonceSupabaseService, Annonce } from './annonceSupabaseService';

/**
 * Interface pour les favoris avec Supabase
 */
export interface Favori {
  id?: string;               // ID unique généré par Supabase
  user_id: string;           // ID de l'utilisateur qui a ajouté le favori
  annonce_id: string;        // ID de l'annonce mise en favori
  created_at?: string;       // Date d'ajout aux favoris (format ISO)
}

/**
 * Service pour gérer les favoris dans Supabase
 */
class FavorisSupabaseService {
  private tableName = 'favoris';
  
  /**
   * Convertir un enregistrement Supabase en objet Favori
   */
  private convertFavoriData(data: any): Favori {
    return {
      id: data.id,
      user_id: data.user_id,
      annonce_id: data.annonce_id,
      created_at: data.created_at
    };
  }

  /**
   * Ajouter une annonce aux favoris
   */
  async addFavori(userId: string, annonceId: string): Promise<string> {
    try {
      // Vérifier si l'annonce existe déjà dans les favoris
      const existingFavori = await this.getFavoriByUserAndAnnonce(userId, annonceId);
      if (existingFavori) {
        return existingFavori.id as string;
      }

      // Créer un nouveau favori
      const favoriData = {
        user_id: userId,
        annonce_id: annonceId,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(favoriData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [FAVORIS] Ajouté avec succès, ID:', data.id);
      return data.id;
    } catch (error) {
      console.error("Erreur lors de l'ajout aux favoris:", error);
      throw error;
    }
  }

  /**
   * Supprimer une annonce des favoris
   */
  async removeFavori(userId: string, annonceId: string): Promise<boolean> {
    try {
      // Trouver le favori à supprimer
      const favori = await this.getFavoriByUserAndAnnonce(userId, annonceId);
      if (!favori || !favori.id) {
        return false;
      }

      // Supprimer le favori
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', favori.id);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [FAVORIS] Supprimé avec succès, ID:', favori.id);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du favori:", error);
      throw error;
    }
  }

  /**
   * Vérifier si une annonce est dans les favoris d'un utilisateur
   */
  async isFavori(userId: string, annonceId: string): Promise<boolean> {
    try {
      const favori = await this.getFavoriByUserAndAnnonce(userId, annonceId);
      return !!favori;
    } catch (error) {
      console.error("Erreur lors de la vérification du favori:", error);
      return false;
    }
  }

  /**
   * Récupérer un favori par utilisateur et annonce
   */
  async getFavoriByUserAndAnnonce(userId: string, annonceId: string): Promise<Favori | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('annonce_id', annonceId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      return data ? this.convertFavoriData(data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération du favori:", error);
      return null;
    }
  }

  /**
   * Récupérer tous les favoris d'un utilisateur
   */
  async getFavorisByUser(userId: string): Promise<Favori[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertFavoriData(item)) : [];
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris:", error);
      return [];
    }
  }

  /**
   * Récupérer toutes les annonces en favoris d'un utilisateur
   */
  async getFavorisAnnonces(userId: string): Promise<Annonce[]> {
    try {
      const favoris = await this.getFavorisByUser(userId);
      const annonces: Annonce[] = [];
      
      for (const favori of favoris) {
        const annonce = await annonceSupabaseService.getAnnonceById(favori.annonce_id);
        if (annonce) {
          annonces.push(annonce);
        }
      }
      
      return annonces;
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces en favoris:", error);
      return [];
    }
  }

  /**
   * Supprimer tous les favoris d'un utilisateur
   */
  async clearFavorisForUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [FAVORIS] Tous les favoris supprimés pour l\'utilisateur:', userId);
    } catch (error) {
      console.error("Erreur lors de la suppression des favoris:", error);
      throw error;
    }
  }

  /**
   * Obtenir le nombre total de favoris d'un utilisateur
   */
  async getFavorisCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return count || 0;
    } catch (error) {
      console.error("Erreur lors du comptage des favoris:", error);
      return 0;
    }
  }

  /**
   * Basculer le statut favori d'une annonce (ajouter si pas présent, supprimer si présent)
   */
  async toggleFavori(userId: string, annonceId: string): Promise<boolean> {
    try {
      const isFavorited = await this.isFavori(userId, annonceId);
      
      if (isFavorited) {
        await this.removeFavori(userId, annonceId);
        return false; // Plus en favori
      } else {
        await this.addFavori(userId, annonceId);
        return true; // Maintenant en favori
      }
    } catch (error) {
      console.error("Erreur lors du basculement du favori:", error);
      throw error;
    }
  }
}

// Créer et exporter une instance unique du service
export const favorisSupabaseService = new FavorisSupabaseService();