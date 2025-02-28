export interface Profile {
    nom: string;
    prenom: string;
    image: string;
    email: string;
    adresse: string;
    ville: string;
    code_postal: string;
    telephone: string;
    biographie: string;
    competences: { [key: string]: string };
    historique: { [key: string]: string };
  }
  
  export const profile: Profile = {
    nom: 'Mesnil',
    prenom: 'Margot',
    image: 'https://i.pravatar.cc/100?img=30',
    email: 'margot.mesnil@gmail.com',
    adresse: '12 rue de la paix',
    ville: 'Paris',
    code_postal: '75001',
    telephone: '06 12 34 56 78',
    biographie: "Hello, je m'appelle Margot. Je serais ravie de vous aider dans diverses missions lors de mes temps libres (dimanche et jeudi après-midi) ! J'adore les animaux et je me suis souvent impliquée dans des causes humanitaires, mais je suis vraiment ouverte à tout !",
    competences:{
        "Soin aux Animaux Domestique": "4",
        "Collecte alimentaire et distribution": "5",
        "Maraude": "3"
    },
    
    historique: {
      Bénévolat1: 'Cibou & Compagnie',
      Bénévolat2: 'La Croix Rouge Fontainebleau',
      Bénévolat3: 'Les Amis de la Terre',
      Bénévolat4: 'Les Restos du Coeur Nemours'
    }
  };
  