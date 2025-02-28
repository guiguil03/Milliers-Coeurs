export interface Message {
  id: number;
  sender: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export const messages: Message[] = [
  {
    id: 1,
    sender: 'Cibou & Compagnie',
    avatar: 'https://i.pravatar.cc/100?img=10',
    lastMessage: 'Bonjour ! Êtes-vous toujours disponible pour promener nos chiens ce samedi ?',
    time: '10:30',
    unread: true
  },
  {
    id: 2,
    sender: 'La Croix Rouge Fontainebleau',
    avatar: 'https://i.pravatar.cc/100?img=13',
    lastMessage: 'Merci pour votre aide lors de la dernière maraude. Serez-vous présent(e) dimanche prochain ?',
    time: 'Hier',
    unread: false
  },
  {
    id: 3,
    sender: 'Les Restos du Coeur Nemours',
    avatar: 'https://i.pravatar.cc/100?img=1',
    lastMessage: 'Nous confirmons votre inscription pour la collecte du 28 décembre. Merci d\'avance !',
    time: 'Lun',
    unread: false
  },
  {
    id: 4,
    sender: 'Association Abeilles & Nature',
    avatar: 'https://i.pravatar.cc/100?img=5',
    lastMessage: 'Nous organisons un atelier de sensibilisation ce week-end. Seriez-vous intéressé(e) ?',
    time: 'Mar',
    unread: false
  },
  {
    id: 5,
    sender: 'Bibliothèque Municipale',
    avatar: 'https://i.pravatar.cc/100?img=8',
    lastMessage: 'Votre aide pour l\'animation de l\'heure du conte a été très appréciée. Merci !',
    time: 'Mer',
    unread: true
  }
];
