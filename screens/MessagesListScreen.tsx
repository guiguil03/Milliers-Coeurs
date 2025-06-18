import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import {
  IConversation,
  IMessage,
  getConversations,
  getConversationMessages,
  getUserNameById,
  getUnreadMessagesCount,
  deleteConversation
} from '../services/messageSupabaseService';

interface ConversationWithLastMessage extends IConversation {
  lastMessage?: IMessage;
  otherUserName: string;
  unreadCount: number;
}

export default function MessagesListScreen() {
  const [conversations, setConversations] = useState<ConversationWithLastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const router = useRouter();

  const loadConversations = async () => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      setLoading(false);
      return;
    }

    try {
      console.log('📱 [MESSAGES] Chargement des conversations pour:', user.id);
      
      // Récupérer toutes les conversations
      const convs = await getConversations(user.id);
      console.log('📱 [MESSAGES] Conversations trouvées:', convs.length);
      
      // Enrichir chaque conversation avec les informations supplémentaires
      const enrichedConversations = await Promise.all(
        convs.map(async (conv) => {
          try {
            // Déterminer l'ID de l'autre utilisateur
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
            
            // Récupérer le nom de l'autre utilisateur
            const otherUserName = await getUserNameById(otherUserId);
            
            // Récupérer le dernier message
            const messages = await getConversationMessages(conv.id);
            const lastMessage = messages[messages.length - 1];
            
            // Compter les messages non lus
            const unreadCount = messages.filter(
              msg => msg.receiver_id === user.id && !msg.read
            ).length;

            return {
              ...conv,
              lastMessage,
              otherUserName,
              unreadCount
            };
          } catch (error) {
            console.error('Erreur lors de l\'enrichissement de la conversation:', error);
            return {
              ...conv,
              otherUserName: 'Utilisateur inconnu',
              unreadCount: 0
            };
        }
        })
      );

      // Trier par date du dernier message
      enrichedConversations.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      setConversations(enrichedConversations);
      setError(null);
    } catch (error) {
      console.error('❌ [MESSAGES] Erreur lors du chargement des conversations:', error);
      setError('Impossible de charger les conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleDeleteConversation = (conversationId: string, otherUserName: string) => {
    Alert.alert(
      'Supprimer la conversation',
      `Voulez-vous vraiment supprimer la conversation avec ${otherUserName} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
    try {
              await deleteConversation(conversationId, user!.id);
              loadConversations(); // Recharger la liste
    } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la conversation');
    }
          }
        }
      ]
    );
  };

  const openConversation = (conversation: ConversationWithLastMessage) => {
    const otherUserId = conversation.user1_id === user?.id ? conversation.user2_id : conversation.user1_id;
    router.push(`/conversation/${conversation.id}?userId=${otherUserId}&name=${encodeURIComponent(conversation.otherUserName)}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}min`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}j`;
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationWithLastMessage }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openConversation(item)}
      onLongPress={() => handleDeleteConversation(item.id, item.otherUserName)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/initials/png?seed=${item.otherUserName}&backgroundColor=4f46e5`
          }}
          style={styles.avatar}
        />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.headerRow}>
          <Text style={styles.userName}>{item.otherUserName}</Text>
          {item.lastMessage && (
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          )}
        </View>

        <Text 
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && styles.unreadMessage
          ]}
          numberOfLines={1}
        >
          {item.lastMessage ? item.lastMessage.content : 'Aucun message'}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  useEffect(() => {
    loadConversations();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Connectez-vous pour accéder à vos messages</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.actionButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Chargement des conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConversations}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity 
          style={styles.newMessageButton}
          onPress={() => router.push('/new-conversation')}
            >
          <Ionicons name="create-outline" size={24} color="#4f46e5" />
        </TouchableOpacity>
              </View>
              
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucune conversation</Text>
          <Text style={styles.emptySubtext}>
            Commencez une conversation en contactant une association !
                </Text>
              </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  newMessageButton: {
    padding: 8
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280'
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  actionButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8
  },
  listContainer: {
    paddingVertical: 8
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  conversationContent: {
    flex: 1,
    marginRight: 8
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280'
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280'
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#111827'
  }
});
