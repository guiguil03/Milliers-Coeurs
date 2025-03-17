import { StyleSheet, View, Text, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { messages as dummyMessages, Message, ConversationMessage } from '../../data/messages';
import { 
  IMessage, 
  listenToConversationMessages, 
  sendMessage as sendFirebaseMessage,
  sendMessageWithAutoConversation,
  markMessagesAsRead, 
  getCurrentUserId 
} from '../../services/messageService';
import { auth } from '../../config/firebase';

// Interface pour adapter les messages Firebase au format de l'application
interface AppConversationMessage extends ConversationMessage {
  firebaseId?: string;
}

export default function ConversationPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<AppConversationMessage[]>([]);
  const [currentContact, setCurrentContact] = useState<{ id: string; sender: string; avatar: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Détermine si nous utilisons Firebase ou les données fictives
  const [usingFirebase, setUsingFirebase] = useState(false);
  
  // Trouver la conversation correspondante
  useEffect(() => {
    if (!id) return;
    
    const conversationId = id.toString();
    
    // Vérifier si l'utilisateur est connecté
    if (!auth.currentUser) {
      // Utiliser les données fictives
      const messageId = parseInt(conversationId);
      const foundMessage = dummyMessages.find(m => m.id === messageId);
      
      if (foundMessage) {
        setCurrentContact({
          id: foundMessage.id.toString(),
          sender: foundMessage.sender,
          avatar: foundMessage.avatar
        });
        setCurrentConversation(foundMessage.conversation || []);
        
        // Marquer tous les messages comme lus
        if (foundMessage.unread) {
          foundMessage.unread = false;
          if (foundMessage.conversation) {
            foundMessage.conversation.forEach(msg => {
              if (msg.sender === 'other') {
                msg.read = true;
              }
            });
          }
        }
      }
      
      setLoading(false);
      return;
    }
    
    // Utiliser Firebase
    setUsingFirebase(true);
    
    try {
      const userId = getCurrentUserId();
      
      // Définir un contact temporaire (pour le moment)
      setCurrentContact({
        id: conversationId,
        sender: 'Contact',
        avatar: 'https://i.pravatar.cc/100?img=10'
      });
      
      // Charger les messages et écouter les mises à jour
      const unsubscribe = listenToConversationMessages(conversationId, (messages) => {
        // Transformer les messages Firebase en format de l'application
        const transformedMessages = messages.map((msg, index) => {
          return {
            id: index + 1,
            firebaseId: msg.id,
            text: msg.content,
            time: formatFirebaseTime(msg.timestamp),
            sender: msg.sender_id === userId ? 'me' : 'other',
            read: msg.read
          };
        });
        
        setCurrentConversation(transformedMessages);
        setLoading(false);
        
        // Marquer les messages comme lus
        if (messages.some(msg => msg.receiver_id === userId && !msg.read)) {
          markMessagesAsRead(conversationId, userId).catch(err => {
            console.error('Erreur lors du marquage des messages comme lus:', err);
          });
        }
      });
      
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError('Impossible de charger la conversation');
      setLoading(false);
    }
  }, [id]);
  
  // Formater l'horodatage Firebase pour l'affichage
  const formatFirebaseTime = (timestamp: any): string => {
    if (!timestamp) return 'À l\'instant';
    
    try {
      // Convertir le timestamp en date
      const date = new Date(timestamp);
      
      // Date d'aujourd'hui
      const today = new Date();
      
      // Si c'est aujourd'hui, afficher l'heure
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Si c'est hier
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Hier, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Sinon, afficher la date et l'heure
      return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      return 'Date inconnue';
    }
  };
  
  // Faire défiler jusqu'au dernier message
  useEffect(() => {
    if (flatListRef.current && currentConversation.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 200);
    }
  }, [currentConversation]);
  
  const handleSend = async () => {
    if (message.trim() === '') return;
    
    if (usingFirebase) {
      // Envoyer un message via Firebase
      try {
        const conversationId = id?.toString() || '';
        // Vérifier si l'utilisateur est connecté
        if (!auth.currentUser) {
          setError("Vous devez être connecté pour envoyer un message");
          return;
        }
        
        const userId = getCurrentUserId();
        // Définir l'ID du destinataire - dans une vraie application, cela viendrait des données de la conversation
        // Pour l'instant, nous utilisons une valeur par défaut si currentContact n'est pas défini
        const receiverId = currentContact?.id || 'receiver123';
        
        // Log pour le débogage
        console.log("Envoi d'un message Firebase:", {
          conversationId,
          userId,
          receiverId,
          message
        });
        
        let messageId;
        
        if (conversationId === 'new') {
          // Créer une nouvelle conversation et envoyer le message
          messageId = await sendMessageWithAutoConversation(userId, receiverId, message);
        } else {
          // Créer un nouveau message dans une conversation existante
          const newMessage = {
            sender_id: userId,
            receiver_id: receiverId,
            content: message,
            timestamp: new Date().getTime(),
            read: false,
            conversation_id: conversationId
          };
          
          // Envoyer le message et récupérer l'ID
          messageId = await sendFirebaseMessage(newMessage);
        }
        
        console.log("Message envoyé avec l'ID:", messageId);
        
        // Vider le champ de message
        setMessage('');
      } catch (err) {
        console.error('Erreur lors de l\'envoi du message:', err);
        setError('Impossible d\'envoyer le message: ' + (err instanceof Error ? err.message : String(err)));
      }
    } else {
      // Utiliser les données fictives pour l'UI
      // Ajouter le nouveau message à la conversation
      const newMessage: AppConversationMessage = {
        id: currentConversation.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'me',
        read: true
      };
      
      // Mettre à jour la conversation
      const updatedConversation = [...currentConversation, newMessage];
      setCurrentConversation(updatedConversation);
      
      setMessage('');
      
      // Simuler une réponse après 2 secondes
      setTimeout(() => {
        const autoReply: AppConversationMessage = {
          id: updatedConversation.length + 1,
          text: 'Merci pour votre message. Nous vous répondrons dès que possible.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sender: 'other',
          read: true
        };
        
        setCurrentConversation([...updatedConversation, autoReply]);
      }, 2000);
    }
  };
  
  const renderItem = ({ item }: { item: AppConversationMessage }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}>
        {!isMe && (
          <Image 
            source={{ uri: currentContact?.avatar }} 
            style={styles.avatar} 
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.time}</Text>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
    );
  }
  
  if (!currentContact) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Conversation introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={{ uri: currentContact.avatar }} style={styles.contactAvatar} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{currentContact.sender}</Text>
          <Text style={styles.contactStatus}>En ligne</Text>
        </View>
      </View>
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
      
      <FlatList
        ref={flatListRef}
        data={currentConversation}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.conversationContainer}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tapez votre message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, message.trim() === '' ? styles.disabledButton : {}]} 
          onPress={handleSend}
          disabled={message.trim() === ''}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#E0485A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: '#ffeeee',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffcccc',
  },
  errorBannerText: {
    color: '#cc0000',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  conversationContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: '#E0485A',
  },
  otherBubble: {
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#777',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0485A',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  }
});
