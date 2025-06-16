import { 
  getDatabase,
  ref, 
  set,
  push,
  get, 
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
  serverTimestamp
} from 'firebase/database';
import { auth, rtdb } from '../config/firebase';

// Interface pour les messages
export interface IMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: any;
  read: boolean;
  conversation_id: string;
}

// Interface pour les conversations
export interface IConversation {
  id?: string;
  participants: string[];
  last_message?: {
    content: string;
    timestamp: any;
  };
  unread_count?: Record<string, number>;
}

// Obtenir une référence à la base de données
const database = rtdb; // Utiliser directement l'instance rtdb exportée du fichier firebase.ts

// Obtenir les conversations d'un utilisateur
export const getUserConversations = async (userId: string): Promise<IConversation[]> => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!auth.currentUser) {
      console.warn("Aucun utilisateur authentifié pour accéder aux conversations");
      return [];
    }

    const conversationsRef = ref(database, 'conversations');
    const conversationsQuery = query(conversationsRef, orderByChild('participants'));
    
    return new Promise((resolve, reject) => {
      onValue(conversationsQuery, (snapshot) => {
        const conversations: IConversation[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const conversation = childSnapshot.val() as IConversation;
          conversation.id = childSnapshot.key;
          
          // Vérifie si l'utilisateur est un participant de cette conversation
          if (conversation.participants.includes(userId)) {
            conversations.push(conversation);
          }
        });
        
        // Trier les conversations par horodatage du dernier message (du plus récent au plus ancien)
        conversations.sort((a, b) => {
          const timestampA = a.last_message?.timestamp || 0;
          const timestampB = b.last_message?.timestamp || 0;
          return timestampB - timestampA;
        });
        
        resolve(conversations);
      }, (error) => {
        console.error("Erreur d'accès aux conversations:", error);
        // Résoudre avec un tableau vide plutôt que de rejeter la promesse
        // pour éviter de bloquer l'interface utilisateur
        resolve([]);
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations :", error);
    // Retourner un tableau vide plutôt que de lancer une erreur
    return [];
  }
};

// Obtenir les messages d'une conversation
export const getConversationMessages = async (conversationId: string): Promise<IMessage[]> => {
  try {
    const messagesRef = ref(database, `messages/${conversationId}`);
    
    return new Promise((resolve, reject) => {
      onValue(messagesRef, (snapshot) => {
        const messages: IMessage[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const message = childSnapshot.val() as IMessage;
          message.id = childSnapshot.key;
          messages.push(message);
        });
        
        // Trier les messages par horodatage (du plus ancien au plus récent)
        messages.sort((a, b) => {
          const timestampA = a.timestamp || 0;
          const timestampB = b.timestamp || 0;
          return timestampA - timestampB;
        });
        
        resolve(messages);
      }, (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des messages :", error);
    throw error;
  }
};

// Écouter les nouveaux messages en temps réel
export const listenToConversationMessages = (
  conversationId: string, 
  callback: (messages: IMessage[]) => void
) => {
  const messagesRef = ref(database, `messages/${conversationId}`);
  
  return onValue(messagesRef, (snapshot) => {
    const messages: IMessage[] = [];
    
    snapshot.forEach((childSnapshot) => {
      const message = childSnapshot.val() as IMessage;
      message.id = childSnapshot.key;
      messages.push(message);
    });
    
    // Trier les messages par horodatage (du plus ancien au plus récent)
    messages.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampA - timestampB;
    });
    
    callback(messages);
  });
};

// Créer un nouveau message
export const sendMessage = async (message: Omit<IMessage, 'id'>): Promise<string> => {
  try {
    console.log("Envoi de message:", message);
    
    // S'assurer que le timestamp est correctement défini
    const messageWithTimestamp = {
      ...message,
      // Utiliser un timestamp numérique au lieu de serverTimestamp() pour un affichage immédiat
      timestamp: message.timestamp || new Date().getTime()
    };
    
    // Créer une référence pour un nouveau message
    const messagesRef = ref(database, `messages/${message.conversation_id}`);
    const newMessageRef = push(messagesRef);
    
    // Ajouter le message
    await set(newMessageRef, messageWithTimestamp);
    
    // Créer la conversation si elle n'existe pas
    const conversationRef = ref(database, `conversations/${message.conversation_id}`);
    const conversationSnapshot = await get(conversationRef);
    
    if (conversationSnapshot.exists()) {
      const conversationData = conversationSnapshot.val();
      const unreadCount = conversationData.unread_count ? { ...conversationData.unread_count } : {};
      
      // Incrémenter le compteur de messages non lus pour le destinataire
      if (!unreadCount[message.receiver_id]) {
        unreadCount[message.receiver_id] = 0;
      }
      unreadCount[message.receiver_id]++;
      
      // Mettre à jour la conversation
      await update(conversationRef, {
        last_message: {
          content: message.content,
          timestamp: messageWithTimestamp.timestamp
        },
        unread_count: unreadCount
      });
    } else {
      // Créer une nouvelle conversation si elle n'existe pas
      const participants = [message.sender_id, message.receiver_id];
      
      const newConversation = {
        participants,
        last_message: {
          content: message.content,
          timestamp: messageWithTimestamp.timestamp
        },
        unread_count: {
          [message.receiver_id]: 1
        }
      };
      
      await set(conversationRef, newConversation);
      console.log("Nouvelle conversation créée:", message.conversation_id);
    }
    
    console.log("Message envoyé avec succès, ID:", newMessageRef.key);
    return newMessageRef.key as string;
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    throw error;
  }
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Mettre à jour le compteur de messages non lus
    const conversationRef = ref(database, `conversations/${conversationId}`);
    const conversationSnapshot = await get(conversationRef);
    
    if (conversationSnapshot.exists()) {
      const data = conversationSnapshot.val();
      const unreadCount = data.unread_count ? { ...data.unread_count } : {};
      
      // Réinitialiser le compteur pour cet utilisateur
      if (unreadCount[userId]) {
        unreadCount[userId] = 0;
        await update(conversationRef, { unread_count: unreadCount });
      }
    }
  } catch (error) {
    console.error("Erreur lors du marquage des messages comme lus :", error);
    throw error;
  }
};

// Créer une nouvelle conversation
export const createConversation = async (participants: string[]): Promise<string> => {
  try {
    // Créer un timestamp
    const timestamp = new Date().getTime();
    
    const conversationData: IConversation = {
      participants,
      last_message: {
        content: "Nouvelle conversation",
        timestamp: timestamp
      },
      unread_count: {}
    };
    
    // Créer une référence pour une nouvelle conversation
    const conversationsRef = ref(database, 'conversations');
    const newConversationRef = push(conversationsRef);
    
    // Ajouter la conversation
    await set(newConversationRef, conversationData);
    const conversationId = newConversationRef.key as string;
    
    console.log("Conversation créée avec l'ID:", conversationId);
    return conversationId;
  } catch (error) {
    console.error("Erreur lors de la création de la conversation :", error);
    throw error;
  }
};

export const getCurrentUserId = (): string => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Utilisateur non connecté");
  }
  return user.uid;
};

// Vérifier si une conversation existe, sinon la créer
export const getOrCreateConversation = async (userId: string, otherUserId: string): Promise<string> => {
  try {
    // Récupérer les conversations de l'utilisateur
    const userConversations = await getUserConversations(userId);
    
    // Vérifier si une conversation existe déjà entre les deux utilisateurs
    const existingConversation = userConversations.find(conv => 
      conv.participants.includes(userId) && 
      conv.participants.includes(otherUserId) &&
      conv.participants.length === 2
    );
    
    if (existingConversation && existingConversation.id) {
      console.log("Conversation existante trouvée:", existingConversation.id);
      return existingConversation.id;
    }
    
    // Créer une nouvelle conversation
    console.log("Création d'une nouvelle conversation entre", userId, "et", otherUserId);
    return await createConversation([userId, otherUserId]);
  } catch (error) {
    console.error("Erreur lors de la création/récupération de la conversation:", error);
    throw error;
  }
};

// Envoyer un message avec création automatique de conversation si nécessaire
export const sendMessageWithAutoConversation = async (
  senderUserId: string, 
  receiverUserId: string, 
  content: string
): Promise<string> => {
  try {
    // Obtenir ou créer une conversation
    const conversationId = await getOrCreateConversation(senderUserId, receiverUserId);
    
    // Créer le message
    const message: Omit<IMessage, 'id'> = {
      sender_id: senderUserId,
      receiver_id: receiverUserId,
      content,
      timestamp: new Date().getTime(),
      read: false,
      conversation_id: conversationId
    };
    
    // Envoyer le message
    return await sendMessage(message);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message avec auto-conversation:", error);
    throw error;
  }
};

// Obtenir le prénom de l'utilisateur connecté
export const getCurrentUserName = (): string => {
  const user = auth.currentUser;
  
  if (!user) {
    return 'Vous';
  }
  
  // Si le displayName existe, retourner le prénom (premier mot du nom complet)
  if (user.displayName) {
    return user.displayName.split(' ')[0];
  }
  
  // Si l'email existe, retourner la partie avant le @
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  // Par défaut
  return 'Utilisateur';
};

// Obtenir le prénom d'un utilisateur par son ID
export const getUserNameById = async (userId: string): Promise<string> => {
  // Vérifier si c'est l'utilisateur courant
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === userId) {
    return getCurrentUserName();
  }
  
  try {
   
    return 'Contact'; // À remplacer par une recherche dans la base de données
  } catch (error) {
    console.error("Erreur lors de la récupération du nom d'utilisateur:", error);
    return 'Contact';
  }
};

// Supprimer une conversation entière (conversation + tous ses messages)
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    console.log("🗑️ Suppression de la conversation:", conversationId);
    
    // Supprimer tous les messages de la conversation
    const messagesRef = ref(database, `messages/${conversationId}`);
    await set(messagesRef, null);
    
    // Supprimer la conversation elle-même
    const conversationRef = ref(database, `conversations/${conversationId}`);
    await set(conversationRef, null);
    
    console.log("✅ Conversation supprimée avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la conversation:", error);
    throw error;
  }
};

// Supprimer tous les messages d'une conversation sans supprimer la conversation
export const clearConversationMessages = async (conversationId: string): Promise<void> => {
  try {
    console.log("🧹 Effacement des messages de la conversation:", conversationId);
    
    // Supprimer tous les messages
    const messagesRef = ref(database, `messages/${conversationId}`);
    await set(messagesRef, null);
    
    // Mettre à jour la conversation pour retirer le dernier message
    const conversationRef = ref(database, `conversations/${conversationId}`);
    await update(conversationRef, {
      last_message: {
        content: "Conversation vidée",
        timestamp: new Date().getTime()
      },
      unread_count: {}
    });
    
    console.log("✅ Messages de la conversation supprimés avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'effacement des messages:", error);
    throw error;
  }
};

// Supprimer un message spécifique
export const deleteMessage = async (conversationId: string, messageId: string): Promise<void> => {
  try {
    console.log("🗑️ Suppression du message:", messageId, "dans la conversation:", conversationId);
    
    const messageRef = ref(database, `messages/${conversationId}/${messageId}`);
    await set(messageRef, null);
    
    // Récupérer les messages restants pour mettre à jour le dernier message de la conversation
    const messages = await getConversationMessages(conversationId);
    
    if (messages.length > 0) {
      // Mettre à jour le dernier message
      const lastMessage = messages[messages.length - 1];
      const conversationRef = ref(database, `conversations/${conversationId}`);
      await update(conversationRef, {
        last_message: {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp
        }
      });
    } else {
      // Aucun message restant, mettre à jour avec un message par défaut
      const conversationRef = ref(database, `conversations/${conversationId}`);
      await update(conversationRef, {
        last_message: {
          content: "Aucun message",
          timestamp: new Date().getTime()
        }
      });
    }
    
    console.log("✅ Message supprimé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du message:", error);
    throw error;
  }
};