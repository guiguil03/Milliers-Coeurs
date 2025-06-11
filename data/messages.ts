// Types et interfaces pour les messages
export interface ConversationMessage {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
  read: boolean;
}

export interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  avatar: string;
  unread: boolean;
  conversation?: ConversationMessage[];
}

// Données fictives pour les messages
export const messages: Message[] = [
  {
    id: 1,
    sender: "Association Les Restos du Cœur",
    content: "Bonjour ! Nous avons bien reçu votre demande de bénévolat. Pouvez-vous nous confirmer vos disponibilités ?",
    time: "10:30",
    avatar: "https://i.pravatar.cc/100?img=1",
    unread: true,
    conversation: [
      {
        id: 1,
        text: "Bonjour ! Je souhaite devenir bénévole dans votre association.",
        time: "10:15",
        sender: "me",
        read: true
      },
      {
        id: 2,
        text: "Bonjour ! Nous avons bien reçu votre demande de bénévolat. Pouvez-vous nous confirmer vos disponibilités ?",
        time: "10:30",
        sender: "other",
        read: false
      }
    ]
  },
  {
    id: 2,
    sender: "Secours Populaire Français",
    content: "Merci pour votre engagement ! Voici les détails de notre prochaine mission...",
    time: "09:45",
    avatar: "https://i.pravatar.cc/100?img=2",
    unread: false,
    conversation: [
      {
        id: 1,
        text: "Bonjour, je suis intéressé par votre mission de distribution alimentaire.",
        time: "09:30",
        sender: "me",
        read: true
      },
      {
        id: 2,
        text: "Merci pour votre engagement ! Voici les détails de notre prochaine mission de distribution alimentaire qui aura lieu samedi prochain.",
        time: "09:45",
        sender: "other",
        read: true
      }
    ]
  },
  {
    id: 3,
    sender: "Croix-Rouge Française",
    content: "Votre formation de secourisme est confirmée pour demain à 14h.",
    time: "Hier",
    avatar: "https://i.pravatar.cc/100?img=3",
    unread: false,
    conversation: [
      {
        id: 1,
        text: "Je me suis inscrit à la formation de secourisme. Pouvez-vous me confirmer l'horaire ?",
        time: "Hier 13:30",
        sender: "me",
        read: true
      },
      {
        id: 2,
        text: "Votre formation de secourisme est confirmée pour demain à 14h. Rendez-vous au 15 rue de la Paix.",
        time: "Hier 14:15",
        sender: "other",
        read: true
      }
    ]
  },
  {
    id: 4,
    sender: "Emmaus France",
    content: "Nouvelle collecte d'objets organisée ce weekend.",
    time: "2 jours",
    avatar: "https://i.pravatar.cc/100?img=4",
    unread: true,
    conversation: [
      {
        id: 1,
        text: "Bonjour, quand aura lieu la prochaine collecte d'objets ?",
        time: "Il y a 2 jours 10:00",
        sender: "me",
        read: true
      },
      {
        id: 2,
        text: "Nouvelle collecte d'objets organisée ce weekend. Pouvez-vous nous aider ?",
        time: "Il y a 2 jours 15:30",
        sender: "other",
        read: false
      }
    ]
  },
  {
    id: 5,
    sender: "Médecins du Monde",
    content: "Merci pour votre participation à la maraude de la semaine dernière.",
    time: "3 jours",
    avatar: "https://i.pravatar.cc/100?img=5",
    unread: false,
    conversation: [
      {
        id: 1,
        text: "Merci pour votre participation à la maraude de la semaine dernière. Votre aide a été précieuse.",
        time: "Il y a 3 jours 20:00",
        sender: "other",
        read: true
      },
      {
        id: 2,
        text: "Merci ! J'étais ravi de pouvoir aider. Quand aura lieu la prochaine ?",
        time: "Il y a 3 jours 20:15",
        sender: "me",
        read: true
      }
    ]
  }
];

// Fonction pour obtenir une conversation par ID
export const getConversationById = (id: number): Message | undefined => {
  return messages.find(message => message.id === id);
};

// Fonction pour marquer une conversation comme lue
export const markConversationAsRead = (id: number): void => {
  const conversation = messages.find(message => message.id === id);
  if (conversation) {
    conversation.unread = false;
    if (conversation.conversation) {
      conversation.conversation.forEach(msg => {
        if (msg.sender === 'other') {
          msg.read = true;
        }
      });
    }
  }
}; 