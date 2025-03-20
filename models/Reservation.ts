/**
 * Modèle représentant une réservation d'annonce de bénévolat
 */
export interface Reservation {
  id?: string;                // ID unique de la réservation (généré par Firestore)
  annonceId: string;          // ID de l'annonce réservée
  benevoleId: string;         // ID de l'utilisateur bénévole qui a réservé
  benevoleName?: string;      // Nom du bénévole
  benevoleEmail?: string;     // Email du bénévole
  dateReservation: Date;      // Date de la réservation
  statut: ReservationStatut;  // Statut de la réservation
  message?: string;           // Message optionnel du bénévole
  commentaireAssociation?: string; // Commentaire optionnel de l'association
}

/**
 * Enumération des statuts possibles pour une réservation
 */
export enum ReservationStatut {
  EnAttente = "en_attente",     // Réservation en attente de confirmation
  Confirmee = "confirmee",      // Réservation confirmée par l'association
  Annulee = "annulee",          // Réservation annulée par le bénévole
  Refusee = "refusee",          // Réservation refusée par l'association
  Terminee = "terminee"         // Mission de bénévolat terminée
}

/**
 * Interface pour la création d'une nouvelle réservation
 */
export interface NouvelleReservation {
  annonceId: string;
  benevoleId: string;
  benevoleName?: string;
  benevoleEmail?: string;
  message?: string;
}
