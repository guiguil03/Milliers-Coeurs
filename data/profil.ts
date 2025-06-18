/**
 * Interface pour les compétences
 */
export interface ICompetence {
  nom: string;
  niveau: 'débutant' | 'intermédiaire' | 'avancé' | 'expert';
  description?: string;
}

/**
 * Interface pour les expériences
 */
export interface IExperience {
  titre: string;
  organisation: string;
  dateDebut: string;
  dateFin?: string;
  description: string;
  competences?: string[];
}

/**
 * Interface pour les profils (format de données)
 */
export interface IProfile {
  uid: string;
  prenom: string;
  nom: string;
  email: string;
  image: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  telephone?: string;
  biographie?: string;
  competences: ICompetence[];
  experiences: IExperience[];
  permis?: boolean;
  vehicule?: boolean;
  userType: 'association' | 'benevole';
  preferences?: {
    notificationsEmail: boolean;
    notificationsApp: boolean;
    visibilitePublique: boolean;
  };
  dateCreation?: string;
} 