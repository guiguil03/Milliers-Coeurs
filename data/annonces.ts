// Types pour les annonces
export interface Annonce {
  id: number;
  logo?: string;
  organisation: string;
  temps: string;
  description: string;
  date: string;
  important: string;
}

// Données des annonces
export const annonces: Annonce[] = [
  {
    id: 1,
    logo: 'https://i.pravatar.cc/100?img=10',
    organisation: 'Cibou & Compagnie',
    temps: 'il y a 23 min',
    description: 'Nous recherchons un(e) bénévole pour promener nos chiens durant 2h ce',
    date: 'samedi 21 décembre',
    important: 'samedi 21 décembre'
  },
  {
    id: 2,
    logo: 'https://i.pravatar.cc/100?img=13',
    organisation: 'La Croix Rouge Fontainebleau',
    temps: 'il y a 3 heures',
    description: 'Nous recherchons plusieurs bénévoles pour une maraude dans Fontainebleau de 10h à 16h ce',
    date: 'dimanche 22 décembre',
    important: 'dimanche 22 décembre'
  },
  {
    id: 3,
    logo: 'https://i.pravatar.cc/100?img=1',
    organisation: 'Les Restos du Coeur Nemours',
    temps: 'il y a 7 heures',
    description: 'Nous recherchons plusieurs bénévoles pour une collecte au E.Leclerc de Varennes sur Seine le',
    date: 'vendredi 28 décembre',
    important: 'vendredi 28 décembre'
  }
];
