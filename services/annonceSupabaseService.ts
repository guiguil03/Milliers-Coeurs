import { supabase } from '../config/supabase';

/**
 * Interface Annonce adaptée pour Supabase
 */
export interface Annonce {
  id?: string;               // ID unique généré par Supabase
  logo?: string;             // URL du logo de l'organisation
  organisation: string;      // Nom de l'organisation
  temps?: string;            // Temps écoulé depuis la publication (calculé côté client)
  titre?: string;            // Titre de l'annonce
  description: string;       // Description de l'annonce
  date: string;              // Date de l'événement
  important: string;         // Information importante
  created_at?: string;       // Date de création (format ISO)
  updated_at?: string;       // Date de modification (format ISO)
  user_id?: string;          // ID de l'utilisateur qui a créé l'annonce
  lieu?: string;             // Lieu de l'événement
  categorie?: string;        // Catégorie
  places?: number;           // Nombre de places disponibles
  contact?: {                // Informations de contact
    email?: string;
    telephone?: string;
  };
  email?: string;
  telephone?: string;
  images?: string[];         // URLs des images supplémentaires
  statut?: 'active' | 'terminée' | 'annulée'; // Statut de l'annonce
}

/**
 * Service pour gérer les annonces dans Supabase
 */
class AnnonceSupabaseService {
  private tableName = 'annonces';
  
  /**
   * Calculer le temps écoulé depuis la création
   */
  private calculerTempsEcoule(dateString?: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
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
   * Convertir un enregistrement Supabase en objet Annonce
   */
  private convertAnnonceData(data: any): Annonce {
    return {
      id: data.id,
      logo: data.logo,
      organisation: data.organisation,
      temps: this.calculerTempsEcoule(data.created_at),
      titre: data.titre,
      description: data.description,
      date: data.date,
      important: data.important,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user_id: data.user_id,
      lieu: data.lieu,
      categorie: data.categorie,
      places: data.places,
      contact: data.contact,
      images: data.images,
      statut: data.statut
    };
  }

  /**
   * Obtenir toutes les annonces
   */
  async getAllAnnonces(): Promise<Annonce[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limitCount);
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('organisation', organisation)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
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
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('categorie', categorie)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
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
      const { data, error } = await supabase
        .from(this.tableName)
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
      
      return data ? this.convertAnnonceData(data) : null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'annonce:", error);
      return null;
    }
  }

  /**
   * Créer une nouvelle annonce
   */
  async createAnnonce(annonce: Omit<Annonce, 'id' | 'created_at' | 'updated_at' | 'temps'>): Promise<string> {
    try {
      console.log('🎯 [ANNONCE] Création annonce:', annonce);
      
      const newAnnonce = {
        logo: annonce.logo,
        organisation: annonce.organisation,
        titre: annonce.titre,
        description: annonce.description,
        date: annonce.date,
        important: annonce.important,
        user_id: annonce.user_id,
        lieu: annonce.lieu,
        categorie: annonce.categorie,
        places: annonce.places,
        contact: annonce.contact,
        email: annonce.email,
        telephone: annonce.telephone,
        images: annonce.images,
        statut: annonce.statut || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(newAnnonce)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [ANNONCE] Créée avec succès, ID:', data.id);
      return data.id;
    } catch (error) {
      console.error("❌ [ANNONCE] Erreur création:", error);
      throw new Error(`Impossible de créer l'annonce: ${error}`);
    }
  }

  /**
   * Mettre à jour une annonce
   */
  async updateAnnonce(id: string, annonce: Partial<Omit<Annonce, 'id' | 'created_at' | 'temps'>>): Promise<void> {
    try {
      console.log('🔄 [ANNONCE] Mise à jour annonce:', id, annonce);
      
      const updateData = {
        ...annonce,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [ANNONCE] Mise à jour réussie:', id);
    } catch (error) {
      console.error("❌ [ANNONCE] Erreur mise à jour:", error);
      throw new Error(`Impossible de mettre à jour l'annonce: ${error}`);
    }
  }

  /**
   * Supprimer une annonce
   */
  async deleteAnnonce(id: string): Promise<void> {
    try {
      console.log('🗑️ [ANNONCE] Suppression annonce:', id);
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ [ANNONCE] Suppression réussie:', id);
    } catch (error) {
      console.error("❌ [ANNONCE] Erreur suppression:", error);
      throw new Error(`Impossible de supprimer l'annonce: ${error}`);
    }
  }

  /**
   * Obtenir les annonces d'un utilisateur
   */
  async getAnnoncesByUser(userId: string): Promise<Annonce[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
    } catch (error) {
      console.error("Erreur lors de la récupération des annonces de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Rechercher des annonces par catégorie
   */
  async searchAnnoncesByCategory(category: string): Promise<Annonce[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('categorie', category)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
    } catch (error) {
      console.error("Erreur lors de la recherche par catégorie:", error);
      throw error;
    }
  }

  /**
   * Rechercher des annonces par lieu
   */
  async searchAnnoncesByLocation(location: string): Promise<Annonce[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .ilike('lieu', `%${location}%`)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
    } catch (error) {
      console.error("Erreur lors de la recherche par lieu:", error);
      throw error;
    }
  }

  /**
   * Recherche avancée d'annonces avec filtres
   */
  async searchAnnonces(filters: {
    location?: string;
    categorie?: string;
    dateDebut?: Date;
    dateFin?: Date;
  }): Promise<Annonce[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*');

      if (filters.location) {
        query = query.ilike('lieu', `%${filters.location}%`);
      }

      if (filters.categorie) {
        query = query.eq('categorie', filters.categorie);
      }

      if (filters.dateDebut) {
        query = query.gte('created_at', filters.dateDebut.toISOString());
      }

      if (filters.dateFin) {
        query = query.lte('created_at', filters.dateFin.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data ? data.map(item => this.convertAnnonceData(item)) : [];
    } catch (error) {
      console.error("Erreur lors de la recherche avancée:", error);
      throw error;
    }
  }
}

// Exporter une instance unique du service
export const annonceSupabaseService = new AnnonceSupabaseService(); 