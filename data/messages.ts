// Définition des types
export interface ConversationMessage {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other'; // 'me' pour l'utilisateur, 'other' pour l'interlocuteur
  read: boolean;
}

export interface Message {
  id: number;
  sender: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  conversation?: ConversationMessage[];
}

// Données des messages
export const messages: Message[] = [
  {
    id: 1,
    sender: 'Cibou & Compagnie',
    avatar: 'https://i.pravatar.cc/100?img=10',
    lastMessage: 'Bonjour ! Êtes-vous toujours disponible pour promener nos chiens ce samedi ?',
    time: '10:30',
    unread: true,
    conversation: [
      {
        id: 1,
        text: 'Bonjour, nous cherchons une personne pour promener nos chiens ce week-end.',
        time: 'Hier, 15:45',
        sender: 'other',
        read: true
      },
      {
        id: 2,
        text: 'Bonjour ! Je serais disponible. À quelle heure ?',
        time: 'Hier, 16:30',
        sender: 'me',
        read: true
      },
      {
        id: 3,
        text: 'Super ! Ce serait pour samedi à 14h, pendant environ 1h30.',
        time: 'Hier, 17:00',
        sender: 'other',
        read: true
      },
      {
        id: 4,
        text: 'Bonjour ! Êtes-vous toujours disponible pour promener nos chiens ce samedi ?',
        time: '10:30',
        sender: 'other',
        read: false
      }
    ]
  },
  {
    id: 2,
    sender: 'Association Pattes en Liberté',
    avatar: 'https://i.pravatar.cc/100?img=32',
    lastMessage: 'Nous aurions besoin d\'aide pour un événement d\'adoption le mois prochain.',
    time: 'Hier',
    unread: true,
    conversation: [
      {
        id: 1,
        text: 'Bonjour, nous organisons un événement d\'adoption le mois prochain et recherchons des bénévoles.',
        time: 'Lundi, 09:15',
        sender: 'other',
        read: true
      },
      {
        id: 2,
        text: 'Bonjour ! Je suis intéressée. Quel jour et où aura lieu l\'événement ?',
        time: 'Lundi, 10:22',
        sender: 'me',
        read: true
      },
      {
        id: 3,
        text: 'Nous aurions besoin d\'aide pour un événement d\'adoption le mois prochain.',
        time: 'Hier, 14:45',
        sender: 'other',
        read: false
      }
    ]
  },
  {
    id: 3,
    sender: 'Marie Dupont',
    avatar: 'https://i.pravatar.cc/100?img=5',
    lastMessage: 'Merci pour avoir gardé mon chat ce week-end, tout s\'est bien passé !',
    time: 'Lundi',
    unread: false,
    conversation: [
      {
        id: 1,
        text: 'Bonjour, pourriez-vous garder mon chat ce week-end ? Je dois m\'absenter de manière imprévue.',
        time: 'Vendredi dernier, 18:30',
        sender: 'other',
        read: true
      },
      {
        id: 2,
        text: 'Bonjour Marie, oui bien sûr. À quelle heure souhaitez-vous que je vienne ?',
        time: 'Vendredi dernier, 19:15',
        sender: 'me',
        read: true
      },
      {
        id: 3,
        text: 'Ce serait parfait si vous pouviez venir vers 8h samedi matin. Je rentrerai dimanche soir.',
        time: 'Vendredi dernier, 19:45',
        sender: 'other',
        read: true
      },
      {
        id: 4,
        text: 'Pas de problème, je serai là à 8h !',
        time: 'Vendredi dernier, 20:00',
        sender: 'me',
        read: true
      },
      {
        id: 5,
        text: 'Merci pour avoir gardé mon chat ce week-end, tout s\'est bien passé !',
        time: 'Lundi, 09:30',
        sender: 'other',
        read: true
      }
    ]
  },
  {
    id: 4,
    sender: 'Refuge des Amis à Quatre Pattes',
    avatar: 'https://i.pravatar.cc/100?img=60',
    lastMessage: 'Pouvez-vous nous aider à distribuer des flyers pour notre collecte de dons ?',
    time: '23/05',
    unread: false,
    conversation: [
      {
        id: 1,
        text: 'Bonjour, nous organisons une collecte de dons pour le refuge et cherchons des volontaires.',
        time: '23/05, 11:15',
        sender: 'other',
        read: true
      },
      {
        id: 2,
        text: 'Pouvez-vous nous aider à distribuer des flyers pour notre collecte de dons ?',
        time: '23/05, 11:17',
        sender: 'other',
        read: true
      }
    ]
  }
];
