import { useState } from 'react';
import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { annonceService, Annonce } from '../services/annonceFirebaseService';

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
        lieu: data.lieu || null,
        categorie: data.categorie || null,
        logo: data.logo || null,
        places: data.places || null,
        contact: data.contact ? {
          email: data.contact.email || null,
          telephone: data.contact.telephone || null
        } : null,
        utilisateurId: user.uid,
        statut: 'active' as AnnonceStatusType
      };

      // Créer l'annonce avec le service
      const annonceId = await annonceService.createAnnonce(annonceData);
      
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
      const annonce = await annonceService.getAnnonceById(id);
      if (!annonce) {
        setError('Annonce introuvable');
        return false;
      }

      if (annonce.utilisateurId !== user.uid) {
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
      if (data.lieu !== undefined) updateData.lieu = data.lieu || null;
      if (data.categorie !== undefined) updateData.categorie = data.categorie || null;
      if (data.logo !== undefined) updateData.logo = data.logo || null;
      if (data.places !== undefined) updateData.places = data.places || null;
      
      // Gérer l'objet contact
      if (data.contact !== undefined) {
        updateData.contact = {
          email: data.contact.email || null,
          telephone: data.contact.telephone || null
        };
      }

      // Mettre à jour l'annonce
      await annonceService.updateAnnonce(id, updateData);
      
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
      const annonce = await annonceService.getAnnonceById(id);
      if (!annonce) {
        setError('Annonce introuvable');
        return false;
      }

      if (annonce.utilisateurId !== user.uid) {
        setError('Vous n\'êtes pas autorisé à supprimer cette annonce');
        return false;
      }

      // Supprimer l'annonce
      await annonceService.deleteAnnonce(id);
      
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
      const annonces = await annonceService.getAnnoncesByUser(user.uid);
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
      const annonces = await annonceService.getRecentAnnonces(count);
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
      const annonces = await annonceService.getAllAnnonces();
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
      const annonces = await annonceService.getAnnoncesByCategorie(category);
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
      const annonce = await annonceService.getAnnonceById(id);
      return annonce;
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
    getAnnonceById
  };
};
