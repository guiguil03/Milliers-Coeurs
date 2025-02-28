// import { 
//   collection, 
//   addDoc, 
//   getDocs, 
//   getDoc,  
//   updateDoc, 
//   doc, 
//   query,
//   where,
//   orderBy,
//   Timestamp,
//   DocumentData,
//   QueryDocumentSnapshot
// } from 'firebase/firestore';
// import { db } from '../config/firebase';

// // Interface pour les messages
// export interface IMessage {
//   id?: string;
//   sender_id: string;
//   receiver_id: string;
//   content: string;
//   timestamp: Date | Timestamp;
//   read: boolean;
//   conversation_id: string;
// }

// // Interface pour les conversations
// export interface IConversation {
//   id?: string;
//   participants: string[];
//   last_message?: {
//     content: string;
//     timestamp: Date | Timestamp;
//   };
//   unread_count?: Record<string, number>; // userId -> nombre de messages non lus
// }

// // Convertir un document Firestore en objet Message
// const convertMessageDoc = (doc: QueryDocumentSnapshot<DocumentData>): IMessage => {
//   const data = doc.data();
//   return {
//     id: doc.id,
//     sender_id: data.sender_id,
//     receiver_id: data.receiver_id,
//     content: data.content,
//     timestamp: data.timestamp,
//     read: data.read,
//     conversation_id: data.conversation_id
//   };
// };

// // Convertir un document Firestore en objet Conversation
// const convertConversationDoc = (doc: QueryDocumentSnapshot<DocumentData>): IConversation => {
//   const data = doc.data();
//   return {
//     id: doc.id,
//     participants: data.participants,
//     last_message: data.last_message,
//     unread_count: data.unread_count || {}
//   };
// };

// // Obtenir les conversations d'un utilisateur
// export const getUserConversations = async (userId: string): Promise<IConversation[]> => {
//   try {
//     const conversationQuery = query(
//       collection(db, 'conversations'),
//       where('participants', 'array-contains', userId),
//       orderBy('last_message.timestamp', 'desc')
//     );
    
//     const querySnapshot = await getDocs(conversationQuery);
//     return querySnapshot.docs.map(convertConversationDoc);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des conversations :", error);
//     throw error;
//   }
// };

// // Obtenir les messages d'une conversation
// export const getConversationMessages = async (conversationId: string): Promise<IMessage[]> => {
//   try {
//     const messageQuery = query(
//       collection(db, 'messages'),
//       where('conversation_id', '==', conversationId),
//       orderBy('timestamp', 'asc')
//     );
    
//     const querySnapshot = await getDocs(messageQuery);
//     return querySnapshot.docs.map(convertMessageDoc);
//   } catch (error) {
//     console.error("Erreur lors de la récupération des messages :", error);
//     throw error;
//   }
// };

// // Créer un nouveau message
// export const sendMessage = async (message: Omit<IMessage, 'id'>): Promise<string> => {
//   try {
//     // Assurer que timestamp est un Timestamp Firestore
//     const messageWithTimestamp = {
//       ...message,
//       timestamp: Timestamp.fromDate(
//         message.timestamp instanceof Date 
//           ? message.timestamp 
//           : new Date()
//       )
//     };
    
//     // Ajouter le message à la collection messages
//     const docRef = await addDoc(collection(db, 'messages'), messageWithTimestamp);
    
//     // Mettre à jour la conversation
//     const conversationRef = doc(db, 'conversations', message.conversation_id);
//     const conversationDoc = await getDoc(conversationRef);
    
//     if (conversationDoc.exists()) {
//       const conversationData = conversationDoc.data();
//       const unreadCount = { ...conversationData.unread_count } || {};
      
//       // Incrémenter le compteur de messages non lus pour le destinataire
//       if (!unreadCount[message.receiver_id]) {
//         unreadCount[message.receiver_id] = 0;
//       }
//       unreadCount[message.receiver_id]++;
      
//       // Mettre à jour la conversation
//       await updateDoc(conversationRef, {
//         last_message: {
//           content: message.content,
//           timestamp: messageWithTimestamp.timestamp
//         },
//         unread_count: unreadCount
//       });
//     }
    
//     return docRef.id;
//   } catch (error) {
//     console.error("Erreur lors de l'envoi du message :", error);
//     throw error;
//   }
// };

// // Marquer les messages comme lus
// export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
//   try {
//     // Mettre à jour le compteur de messages non lus
//     const conversationRef = doc(db, 'conversations', conversationId);
//     const conversationDoc = await getDoc(conversationRef);
    
//     if (conversationDoc.exists()) {
//       const data = conversationDoc.data();
//       const unreadCount = { ...data.unread_count };
      
//       // Réinitialiser le compteur pour cet utilisateur
//       if (unreadCount && unreadCount[userId]) {
//         unreadCount[userId] = 0;
//         await updateDoc(conversationRef, { unread_count: unreadCount });
//       }
      
//       // Marquer tous les messages non lus comme lus
//       const messageQuery = query(
//         collection(db, 'messages'),
//         where('conversation_id', '==', conversationId),
//         where('receiver_id', '==', userId),
//         where('read', '==', false)
//       );
      
//       const querySnapshot = await getDocs(messageQuery);
      
//       const updatePromises = querySnapshot.docs.map(messageDoc => 
//         updateDoc(doc(db, 'messages', messageDoc.id), { read: true })
//       );
      
//       await Promise.all(updatePromises);
//     }
//   } catch (error) {
//     console.error("Erreur lors du marquage des messages comme lus :", error);
//     throw error;
//   }
// };

// // Créer une nouvelle conversation
// export const createConversation = async (participants: string[]): Promise<string> => {
//   try {
//     const conversationData: IConversation = {
//       participants,
//       unread_count: {}
//     };
    
//     const docRef = await addDoc(collection(db, 'conversations'), conversationData);
//     return docRef.id;
//   } catch (error) {
//     console.error("Erreur lors de la création de la conversation :", error);
//     throw error;
//   }
// };
