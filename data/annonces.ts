// Interface pour les annonces
export interface Annonce {
  id: string;
  organisation: string;
  logo?: string;
  temps?: string;
  titre?: string;
  description: string;
  date: string;
  important: string;
  lieu?: string;
  categorie?: string;
  places?: number;
  contact?: {
    email?: string;
    telephone?: string;
  };
  email?: string;
  telephone?: string;
  images?: string[];
  statut?: 'active' | 'terminée' | 'annulée';
}

// Données fictives pour les annonces
export const annonces: Annonce[] = [
  {
    id: "1",
    organisation: "Les Restos du Cœur",
    logo: "https://i.pravatar.cc/100?img=1",
    temps: "Il y a 2h",
    titre: "Distribution alimentaire",
    description: "Nous recherchons des bénévoles pour notre prochaine distribution alimentaire. Aidez-nous à distribuer des repas aux personnes dans le besoin.",
    date: "2024-06-15",
    important: "Formation obligatoire le matin",
    lieu: "Paris 15ème",
    categorie: "Aide alimentaire",
    places: 20,
    contact: {
      email: "contact@restosducoeur.org",
      telephone: "01 42 85 85 85"
    },
    statut: "active"
  },
  {
    id: "2",
    organisation: "Secours Populaire Français",
    logo: "https://i.pravatar.cc/100?img=2",
    temps: "Il y a 5h",
    titre: "Collecte de vêtements",
    description: "Grande collecte de vêtements pour l'hiver. Nous avons besoin de bénévoles pour trier et distribuer les vêtements donnés.",
    date: "2024-06-20",
    important: "Apporter des gants de travail",
    lieu: "Marseille",
    categorie: "Collecte",
    places: 15,
    contact: {
      email: "marseille@secourspopulaire.fr",
      telephone: "04 91 55 66 77"
    },
    statut: "active"
  },
  {
    id: "3",
    organisation: "Croix-Rouge Française",
    logo: "https://i.pravatar.cc/100?img=3",
    temps: "Il y a 1j",
    titre: "Formation premiers secours",
    description: "Formation aux gestes de premiers secours ouverte à tous. Apprenez à sauver des vies avec nos formateurs certifiés.",
    date: "2024-06-25",
    important: "Inscription obligatoire - Places limitées",
    lieu: "Lyon",
    categorie: "Formation",
    places: 12,
    contact: {
      email: "formation@croixrouge.fr",
      telephone: "04 72 77 88 99"
    },
    statut: "active"
  },
  {
    id: "4",
    organisation: "Emmaus France",
    logo: "https://i.pravatar.cc/100?img=4",
    temps: "Il y a 2j",
    titre: "Collecte de meubles",
    description: "Nous organisons une collecte de meubles et d'objets du quotidien. Venez nous aider à donner une seconde vie aux objets !",
    date: "2024-06-30",
    important: "Véhicule utilitaire fourni",
    lieu: "Toulouse",
    categorie: "Collecte",
    places: 8,
    contact: {
      email: "toulouse@emmaus.org",
      telephone: "05 61 22 33 44"
    },
    statut: "active"
  },
  {
    id: "5",
    organisation: "Médecins du Monde",
    logo: "https://i.pravatar.cc/100?img=5",
    temps: "Il y a 3j",
    titre: "Maraude nocturne",
    description: "Maraude de nuit pour aller à la rencontre des personnes sans-abri. Distribution de repas chauds et de couvertures.",
    date: "2024-07-05",
    important: "Mission de nuit - 20h à 2h du matin",
    lieu: "Bordeaux",
    categorie: "Maraude",
    places: 6,
    contact: {
      email: "bordeaux@medecinsdumonde.org",
      telephone: "05 56 78 90 12"
    },
    statut: "active"
  },
  {
    id: "6",
    organisation: "Banque Alimentaire",
    logo: "https://i.pravatar.cc/100?img=6",
    temps: "Il y a 1 semaine",
    titre: "Tri des denrées alimentaires",
    description: "Aide au tri et à la préparation des colis alimentaires pour les familles en difficulté. Une action concrète et utile !",
    date: "2024-07-10",
    important: "Tenue de travail recommandée",
    lieu: "Lille",
    categorie: "Aide alimentaire",
    places: 25,
    contact: {
      email: "lille@banquealimentaire.org",
      telephone: "03 20 12 34 56"
    },
    statut: "active"
  }
];

// Fonction pour obtenir toutes les annonces
export const getAllAnnonces = (): Annonce[] => {
  return annonces;
};

// Fonction pour obtenir une annonce par ID
export const getAnnonceById = (id: string): Annonce | undefined => {
  return annonces.find(annonce => annonce.id === id);
};

// Fonction pour obtenir les annonces par catégorie
export const getAnnoncesByCategorie = (categorie: string): Annonce[] => {
  return annonces.filter(annonce => annonce.categorie === categorie);
};

// Fonction pour rechercher des annonces
export const searchAnnonces = (searchTerm: string): Annonce[] => {
  const term = searchTerm.toLowerCase();
  return annonces.filter(annonce => 
    annonce.titre?.toLowerCase().includes(term) ||
    annonce.description.toLowerCase().includes(term) ||
    annonce.organisation.toLowerCase().includes(term) ||
    annonce.lieu?.toLowerCase().includes(term)
  );
}; 