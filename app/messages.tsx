import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { messages as dummyMessages, Message } from '../data/messages';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { IConversation, getUserConversations, getCurrentUserId } from '../services/messageService';
import { auth } from '../config/firebase';

// Interface pour adapter les messages Firebase au format de l'application
interface AppMessage extends Message {
  firebaseId?: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messagesList, setMessagesList] = useState<AppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les conversations de l'utilisateur
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // Vérifier si l'utilisateur est connecté
        if (!auth.currentUser) {
          // Si l'utilisateur n'est pas connecté, utiliser les messages fictifs
          setMessagesList(dummyMessages);
          setLoading(false);
          return;
        }
        
        // Solution temporaire: Toujours utiliser les messages fictifs en attendant la mise à jour des règles Firebase
        console.log("Utilisation des données fictives en attendant la mise à jour des règles de sécurité Firebase");
        setMessagesList(dummyMessages);
        setLoading(false);
        
        /* Commenté temporairement en attendant la mise à jour des règles Firebase
        const userId = getCurrentUserId();
        const conversations = await getUserConversations(userId);
        
        // Cas où les conversations sont vides mais pas d'erreur (possible problème d'autorisation)
        if (conversations.length === 0) {
          console.log("Aucune conversation trouvée ou permissions insuffisantes");
          // On utilise les données fictives pour ne pas bloquer l'interface
          setMessagesList(dummyMessages);
          setLoading(false);
          return;
        }
        
        // Transformer les conversations Firebase en format de l'application
        const transformedMessages = conversations.map((conversation, index) => {
          // Trouver le destinataire (l'autre participant)
          const otherParticipant = conversation.participants.find(p => p !== userId) || '';
          
          // Calculer les messages non lus
          const unreadCount = conversation.unread_count?.[userId] || 0;
          
          return {
            id: index + 1,
            firebaseId: conversation.id,
            sender: otherParticipant, // Idéalement, récupérer le nom d'utilisateur
            avatar: `https://i.pravatar.cc/100?img=${index + 10}`, // Placeholder
            lastMessage: conversation.last_message?.content || 'Nouvelle conversation',
            time: formatFirebaseTime(conversation.last_message?.timestamp),
            unread: unreadCount > 0
          };
        });
        
        setMessagesList(transformedMessages);
        */
      } catch (err: any) {
        console.error('Erreur lors du chargement des conversations :', err);
        if (err.code === 'permission_denied') {
          setError('Vous n\'avez pas les autorisations nécessaires pour accéder à vos conversations');
        } else {
          setError('Impossible de charger les conversations');
        }
        // Utiliser les messages fictifs en cas d'erreur
        setMessagesList(dummyMessages);
      } finally {
        setLoading(false);
      }
    };
    
    loadConversations();
    
    // Ajouter un écouteur pour recharger les conversations lors des changements d'authentification
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadConversations();
    });
    
    return () => unsubscribe();
  }, []);
  
  // Nombre de messages non lus
  const unreadCount = messagesList.filter(msg => msg.unread).length;
  
  const navigateToConversation = (message: AppMessage) => {
    const conversationId = message.firebaseId || message.id.toString();
    router.push(`/conversation/${conversationId}`);
  };
  
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
        return 'Hier';
      }
      
      // Sinon, afficher la date
      return date.toLocaleDateString();
    } catch (err) {
      return 'Date inconnue';
    }
  };
  
  // Formater la date pour l'affichage
  const formatTime = (timeString: string) => {
    if (timeString === "À l'instant") return timeString;
    if (timeString.includes(':')) return timeString; // Déjà formaté comme heure
    return timeString; // Jour ou autre format
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement des messages...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {unreadCount > 0 && (
        <View style={styles.unreadSection}>
          <Text style={styles.sectionTitle}>Nouveaux messages</Text>
          {messagesList
            .filter(message => message.unread)
            .map(message => (
              <TouchableOpacity 
                key={message.id} 
                style={styles.messageItem}
                onPress={() => navigateToConversation(message)}
              >
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: message.avatar }} style={styles.avatar} />
                  <View style={styles.unreadIndicator} />
                </View>
                
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderName}>{message.sender}</Text>
                    <Text style={styles.messageTime}>{formatTime(message.time)}</Text>
                  </View>
                  <Text 
                    style={styles.unreadText} 
                    numberOfLines={2}
                  >
                    {message.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
      )}
      
      <View style={styles.allMessagesSection}>
        <Text style={styles.sectionTitle}>Tous les messages</Text>
        {messagesList.length === 0 ? (
          <Text style={styles.emptyText}>Aucun message pour l'instant</Text>
        ) : (
          messagesList
            .sort((a, b) => {
              // Mettre les messages non lus en premier
              if (a.unread && !b.unread) return -1;
              if (!a.unread && b.unread) return 1;
              return 0;
            })
            .map(message => (
              <TouchableOpacity 
                key={message.id} 
                style={styles.messageItem}
                onPress={() => navigateToConversation(message)}
              >
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: message.avatar }} style={styles.avatar} />
                  {message.unread && <View style={styles.unreadIndicator} />}
                </View>
                
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderName}>{message.sender}</Text>
                    <Text style={styles.messageTime}>{formatTime(message.time)}</Text>
                  </View>
                  <Text 
                    style={[styles.messagePreview, message.unread && styles.unreadText]} 
                    numberOfLines={2}
                  >
                    {message.lastMessage}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  badgeContainer: {
    backgroundColor: '#E0485A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777'
  },
  errorContainer: {
    padding: 15,
    backgroundColor: '#ffeeee',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
  },
  unreadSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0485A',
    marginBottom: 15,
  },
  allMessagesSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
    paddingVertical: 20,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0485A',
    borderWidth: 2,
    borderColor: '#fff',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#333',
  }
});
