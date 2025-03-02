/**
 * Modèle représentant une annonce dans l'application
 */
export interface Annonce {
  id?: string;               // ID unique de l'annonce (généré par Firestore)
  titre: string;             // Titre de l'annonce
  description: string;       // Description détaillée
  prix?: number;             // Prix (optionnel)
  categorie: string;         // Catégorie de l'annonce
  images: string[];          // URLs des images
  localisation?: string;     // Localisation de l'annonce
  utilisateurId: string;     // ID de l'utilisateur qui a posté l'annonce
  utilisateurNom?: string;   // Nom de l'utilisateur qui a posté l'annonce
  dateCreation: Date;        // Date de création
  dateModification: Date;    // Date de dernière modification
  statut: "active" | "vendue" | "réservée" | "inactive"; // Statut de l'annonce
  vues: number;              // Nombre de vues
  contact?: {                // Informations de contact (optionnelles)
    telephone?: string;
    email?: string;
  };
  tags?: string[];           // Tags pour faciliter la recherche
}

/**
 * Interface pour la création d'une nouvelle annonce
 * Contient uniquement les champs obligatoires pour créer une annonce
 */
export interface NouvelleAnnonce {
  titre: string;
  description: string;
  categorie: string;
  images: string[];
  utilisateurId: string;
  localisation?: string;
  prix?: number;
  contact?: {
    telephone?: string;
    email?: string;
  };
  tags?: string[];
}

/**
 * Enum des catégories d'annonces disponibles
 */
export enum CategorieAnnonce {
  Vêtements = "Vêtements",
  Chaussures = "Chaussures",
  Accessoires = "Accessoires",
  Bijoux = "Bijoux",
  Beauté = "Beauté",
  Maison = "Maison",
  Livres = "Livres",
  Jeux = "Jeux",
  Sport = "Sport",
  Électronique = "Électronique",
  Musique = "Musique",
  Voitures = "Voitures",
  Immobilier = "Immobilier",
  Emploi = "Emploi",
  Services = "Services",
  Autre = "Autre"
}
