// Définition des catégories de missions de bénévolat
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export const MISSION_CATEGORIES: Category[] = [
  {
    id: 'animaux',
    name: 'Animaux',
    icon: 'paw-outline',
    description: 'Aider à prendre soin des animaux, sauvetage, refuges, etc.'
  },
  {
    id: 'social',
    name: 'Social',
    icon: 'people-outline',
    description: 'Aider les personnes dans le besoin, inclusion sociale, etc.'
  },
  {
    id: 'environnement',
    name: 'Environnement',
    icon: 'leaf-outline',
    description: 'Protéger la nature, nettoyage, sensibilisation, etc.'
  },
  {
    id: 'education',
    name: 'Éducation',
    icon: 'book-outline',
    description: 'Soutien scolaire, alphabétisation, formation, etc.'
  },
  {
    id: 'sante',
    name: 'Santé',
    icon: 'medical-outline',
    description: 'Aide médicale, sensibilisation, bien-être, etc.'
  }
];

// Fonction utilitaire pour obtenir une catégorie par son ID
export const getCategoryById = (id: string): Category | undefined => {
  return MISSION_CATEGORIES.find(category => category.id === id);
};

// Fonction utilitaire pour obtenir une catégorie par son nom
export const getCategoryByName = (name: string): Category | undefined => {
  return MISSION_CATEGORIES.find(category => 
    category.name.toLowerCase() === name.toLowerCase()
  );
};
