// Interfaces pour les données de profil utilisateur
export interface ICompetence {
  name: string;
  level: number;
}

export interface IExperience {
  title: string;
  organization: string;
  date: string;
  description: string;
}

export interface IProfile {
  uid: string;
  prenom: string;
  nom: string;
  email: string;
  image: string;
  adresse?: string;
  ville?: string;
  code_postal?: string;
  telephone?: string;
  biographie?: string;
  userType: 'association' | 'benevole';
  competences: ICompetence[];
  experiences: IExperience[];
  permis?: boolean;
  vehicule?: boolean;
  preferences?: {
    notificationsEmail: boolean;
    notificationsApp: boolean;
    visibilitePublique: boolean;
  };
  dateCreation?: string;
  dateModification?: string;
}

// Profil par défaut pour les tests
export const defaultProfile: IProfile = {
  uid: 'default-uid',
  nom: 'Mesnil',
  prenom: 'Margot',
  image: 'https://i.pravatar.cc/100?img=30',
  email: 'margot.mesnil@gmail.com',
  adresse: '12 rue de la paix',
  ville: 'Paris',
  code_postal: '75001',
  telephone: '06 12 34 56 78',
  biographie: "Hello, je m'appelle Margot. Je serais ravie de vous aider dans diverses missions lors de mes temps libres (dimanche et jeudi après-midi) ! J'adore les animaux et je me suis souvent impliquée dans des causes humanitaires, mais je suis vraiment ouverte à tout !",
  userType: 'benevole',
  permis: false,
  vehicule: false,
  competences: [
    { name: "Soin aux Animaux Domestique", level: 4 },
    { name: "Collecte alimentaire et distribution", level: 5 },
    { name: "Maraude", level: 3 }
  ],
  experiences: [
    { 
      title: "Bénévolat",
      organization: "Cibou & Compagnie",
      date: "2020-01-01",
      description: "Aide et soin aux animaux"
    },
    { 
      title: "Bénévolat",
      organization: "La Croix Rouge Fontainebleau",
      date: "2019-06-01",
      description: "Distribution de nourriture"
    },
    { 
      title: "Bénévolat",
      organization: "Les Amis de la Terre",
      date: "2018-03-01",
      description: "Sensibilisation à l'environnement"
    },
    { 
      title: "Bénévolat",
      organization: "Les Restos du Coeur Nemours",
      date: "2017-11-01",
      description: "Aide aux personnes défavorisées"
    }
  ],
  preferences: {
    notificationsEmail: true,
    notificationsApp: true,
    visibilitePublique: true
  },
  dateCreation: new Date().toISOString(),
  dateModification: new Date().toISOString()
};