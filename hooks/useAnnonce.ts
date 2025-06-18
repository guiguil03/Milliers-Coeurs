import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { annonceSupabaseService, Annonce } from '../services/annonceSupabaseService';
import { favorisSupabaseService } from '../services/favorisSupabaseService';

// Types pour les annonces
export type AnnonceStatusType = 'active' | 'terminée' | 'annulée';
export type AnnonceCategoryType = 'Animaux' | 'Aide humanitaire' | 'Aide alimentaire' | 'Environnement' | 'Éducation' | 'Santé' | 'Autre';

// Interface pour la création d'une annonce
export interface CreateAnnonceData {
  organisation: string;
  description: string;
  date: string;
  important: string;
  lieu?: string;
  categorie?: AnnonceCategoryType;
  logo?: string;
  places?: number;
  contact?: {
    email?: string;
    telephone?: string;
  };
}

export interface AnnonceWithFavori extends Annonce {
  isFavori?: boolean;
}

export const useAnnonce = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  /**
   * Fonction pour créer une nouvelle annonce
   */
  const createAnnonce = async (data: CreateAnnonceData): Promise<string | null> => {
    if (!user) {
      setError('Vous devez être connecté pour créer une annonce');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Préparer les données en évitant les valeurs undefined
      const annonceData = {
        ...data,
        // Gérer les valeurs optionnelles
        lieu: data.lieu || undefined,
        categorie: data.categorie || undefined,
        logo: data.logo || undefined,
        places: data.places || undefined,
        contact: data.contact ? {
          email: data.contact.email || undefined,
          telephone: data.contact.telephone || undefined
        } : undefined,
        utilisateurId: user.id,
        statut: 'active' as AnnonceStatusType
      };

      // Créer l'annonce avec le service
      const annonceId = await annonceSupabaseService.createAnnonce(annonceData);
      
      return annonceId;
    } catch (err) {
      console.error('Erreur lors de la création de l\'annonce:', err);
      setError('Une erreur est survenue lors de la création de l\'annonce');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour mettre à jour une annonce existante
   */
  const updateAnnonce = async (id: string, data: Partial<CreateAnnonceData>): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour modifier une annonce');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'utilisateur est autorisé à modifier cette annonce
      const annonce = await annonceSupabaseService.getAnnonceById(id);
      if (!annonce) {
        setError('Annonce introuvable');
        return false;
      }

      if (annonce.utilisateurId !== user.id) {
        setError('Vous n\'êtes pas autorisé à modifier cette annonce');
        return false;
      }

      // Préparer les données en évitant les valeurs undefined
      const updateData: Partial<Annonce> = {};

      // Traiter chaque champ pour éviter les undefined
      if (data.organisation !== undefined) updateData.organisation = data.organisation;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.date !== undefined) updateData.date = data.date;
      if (data.important !== undefined) updateData.important = data.important;
      if (data.lieu !== undefined) updateData.lieu = data.lieu || undefined;
      if (data.categorie !== undefined) updateData.categorie = data.categorie || undefined;
      if (data.logo !== undefined) updateData.logo = data.logo || undefined;
      if (data.places !== undefined) updateData.places = data.places || undefined;
      
      // Gérer l'objet contact
      if (data.contact !== undefined) {
        updateData.contact = {
          email: data.contact.email || undefined,
          telephone: data.contact.telephone || undefined
        };
      }

      // Mettre à jour l'annonce
      await annonceSupabaseService.updateAnnonce(id, updateData);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', err);
      setError('Une erreur est survenue lors de la mise à jour de l\'annonce');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour supprimer une annonce
   */
  const deleteAnnonce = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour supprimer une annonce');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier si l'utilisateur est autorisé à supprimer cette annonce
      const annonce = await annonceSupabaseService.getAnnonceById(id);
      if (!annonce) {
        setError('Annonce introuvable');
        return false;
      }

      if (annonce.utilisateurId !== user.id) {
        setError('Vous n\'êtes pas autorisé à supprimer cette annonce');
        return false;
      }

      // Supprimer l'annonce
      await annonceSupabaseService.deleteAnnonce(id);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'annonce:', err);
      setError('Une erreur est survenue lors de la suppression de l\'annonce');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour récupérer les annonces créées par l'utilisateur courant
   */
  const getMyAnnonces = async (): Promise<Annonce[]> => {
    if (!user) {
      setError('Vous devez être connecté pour voir vos annonces');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer les annonces de l'utilisateur
      const annonces = await annonceSupabaseService.getAnnoncesByUser(user.id);
      return annonces;
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces:', err);
      setError('Une erreur est survenue lors de la récupération de vos annonces');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour récupérer les annonces récentes
   */
  const getRecentAnnonces = async (count: number = 5): Promise<Annonce[]> => {
    setLoading(true);
    setError(null);

    try {
      const annonces = await annonceSupabaseService.getRecentAnnonces(count);
      return annonces;
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces récentes:', err);
      setError('Une erreur est survenue lors de la récupération des annonces récentes');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour récupérer toutes les annonces
   */
  const getAllAnnonces = async (): Promise<Annonce[]> => {
    setLoading(true);
    setError(null);

    try {
      const annonces = await annonceSupabaseService.getAllAnnonces();
      return annonces;
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces:', err);
      setError('Une erreur est survenue lors de la récupération des annonces');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour récupérer les annonces par catégorie
   */
  const getAnnoncesByCategory = async (category: AnnonceCategoryType): Promise<Annonce[]> => {
    setLoading(true);
    setError(null);

    try {
      const annonces = await annonceSupabaseService.getAnnoncesByCategorie(category);
      return annonces;
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces par catégorie:', err);
      setError('Une erreur est survenue lors de la récupération des annonces');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction pour récupérer une annonce par son ID
   */
  const getAnnonceById = async (id: string): Promise<Annonce | null> => {
    setLoading(true);
    setError(null);

    try {
      const annonce = await annonceSupabaseService.getAnnonceById(id);
      return annonce;
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'annonce:', err);
      setError('Une erreur est survenue lors de la récupération de l\'annonce');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ajouter une annonce aux favoris
   */
  const addToFavoris = async (annonceId: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour ajouter des favoris');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await favorisSupabaseService.addFavori(user.id, annonceId);
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout aux favoris:', err);
      setError('Une erreur est survenue lors de l\'ajout aux favoris');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer une annonce des favoris
   */
  const removeFromFavoris = async (annonceId: string): Promise<boolean> => {
    if (!user) {
      setError('Vous devez être connecté pour gérer vos favoris');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await favorisSupabaseService.removeFavori(user.id, annonceId);
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du favori:', err);
      setError('Une erreur est survenue lors de la suppression du favori');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vérifier si une annonce est dans les favoris
   */
  const isFavori = async (annonceId: string): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      return await favorisSupabaseService.isFavori(user.id, annonceId);
    } catch (err) {
      console.error('Erreur lors de la vérification du favori:', err);
      return false;
    }
  };

  /**
   * Récupérer toutes les annonces en favoris
   */
  const getFavorisAnnonces = async (): Promise<AnnonceWithFavori[]> => {
    if (!user) {
      setError('Vous devez être connecté pour voir vos favoris');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const annonces = await favorisSupabaseService.getFavorisAnnonces(user.id);
      // Marquer toutes les annonces comme favorites
      return annonces.map(annonce => ({ ...annonce, isFavori: true }));
    } catch (err) {
      console.error('Erreur lors de la récupération des favoris:', err);
      setError('Une erreur est survenue lors de la récupération de vos favoris');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupérer toutes les annonces avec statut favori
   */
  const getAllAnnoncesWithFavoriStatus = async (): Promise<AnnonceWithFavori[]> => {
    setLoading(true);
    setError(null);

    try {
      const annonces = await annonceSupabaseService.getAllAnnonces();
      
      if (!user) {
        return annonces.map(annonce => ({ ...annonce, isFavori: false }));
      }
      
      // Pour chaque annonce, vérifier si elle est en favori
      const annoncesWithFavori: AnnonceWithFavori[] = [];
      
      for (const annonce of annonces) {
        const favoriStatus = await favorisSupabaseService.isFavori(user.id, annonce.id || '');
        annoncesWithFavori.push({
          ...annonce,
          isFavori: favoriStatus
        });
      }
      
      return annoncesWithFavori;
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces avec statut favori:', err);
      setError('Une erreur est survenue lors de la récupération des annonces');
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Récupérer une annonce par ID avec statut favori
   */
  const getAnnonceByIdWithFavoriStatus = async (id: string): Promise<AnnonceWithFavori | null> => {
    setLoading(true);
    setError(null);

    try {
      const annonce = await annonceSupabaseService.getAnnonceById(id);
      
      if (!annonce) {
        return null;
      }
      
      if (!user) {
        return { ...annonce, isFavori: false };
      }
      
      const favoriStatus = await favorisSupabaseService.isFavori(user.id, id);
      
      return {
        ...annonce,
        isFavori: favoriStatus
      };
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'annonce:', err);
      setError('Une erreur est survenue lors de la récupération de l\'annonce');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createAnnonce,
    updateAnnonce,
    deleteAnnonce,
    getMyAnnonces,
    getRecentAnnonces,
    getAllAnnonces,
    getAnnoncesByCategory,
    getAnnonceById,
    // Nouvelles fonctions pour les favoris
    addToFavoris,
    removeFromFavoris,
    isFavori,
    getFavorisAnnonces,
    getAllAnnoncesWithFavoriStatus,
    getAnnonceByIdWithFavoriStatus
  };
};
