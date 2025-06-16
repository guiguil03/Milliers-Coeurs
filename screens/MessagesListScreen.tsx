import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { IConversation, getUserConversations, getUserNameById, deleteConversation, clearConversationMessages } from '../services/messageService';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessagesListScreen = () => {
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const { user } = useAuthContext();
  const router = useRouter();

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
      
      // Charger les noms des utilisateurs pour chaque conversation
      const names: Record<string, string> = {};
      for (const conv of userConversations) {
        for (const participantId of conv.participants) {
          if (participantId !== user.uid && !names[participantId]) {
            names[participantId] = await getUserNameById(participantId);
          }
        }
      }
      setUserNames(names);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger vos conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const getOtherParticipantName = (conversation: IConversation): string => {
    if (!user) return 'Contact';
    
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return 'Contact';
    
    return userNames[otherParticipantId] || 'Contact';
  };

  const formatTimestamp = (timestamp: number): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: fr
      });
    } catch (error) {
      return '';
    }
  };

  const getUnreadCount = (conversation: IConversation): number => {
    if (!user || !conversation.unread_count) return 0;
    return conversation.unread_count[user.uid] || 0;
  };

  const navigateToConversation = (conversationId: string, otherUserId: string) => {
    router.push(`/messages/conversation?id=${conversationId}&userId=${otherUserId}`);
  };

  const showConversationOptions = (conversationId: string, otherUserName: string) => {
    console.log("🔘 Bouton options cliqué pour conversation:", conversationId, "utilisateur:", otherUserName);
    
    // Utiliser une approche compatible web
    const choice = window.confirm(`Options pour la conversation avec ${otherUserName}\n\nCliquez OK pour SUPPRIMER la conversation entière\nCliquez Annuler pour VIDER seulement les messages`);
    
    if (choice) {
      // Utilisateur a choisi OK -> Supprimer la conversation
      const confirmDelete = window.confirm(`ATTENTION: Supprimer définitivement votre conversation avec ${otherUserName} ?\n\nTous les messages seront perdus !`);
      if (confirmDelete) {
        handleDeleteConversation(conversationId, otherUserName);
      }
    } else {
      // Utilisateur a choisi Annuler -> Vider les messages
      const confirmClear = window.confirm(`Vider tous les messages de votre conversation avec ${otherUserName} ?\n\nLa conversation sera conservée mais tous les messages seront supprimés.`);
      if (confirmClear) {
        handleClearConversation(conversationId, otherUserName);
      }
    }
  };

  const handleDeleteConversation = async (conversationId: string, otherUserName: string) => {
    if (!conversationId) return;
    
    console.log("🗑️ Suppression conversation:", conversationId);
    
    try {
      await deleteConversation(conversationId);
      alert("✅ Conversation supprimée avec succès");
      loadConversations(); // Recharger la liste
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      alert("❌ Impossible de supprimer la conversation");
    }
  };

  const handleClearConversation = async (conversationId: string, otherUserName: string) => {
    if (!conversationId) return;
    
    console.log("🧹 Vidage conversation:", conversationId);
    
    try {
      await clearConversationMessages(conversationId);
      alert("✅ Messages supprimés avec succès");
      loadConversations(); // Recharger la liste
    } catch (error) {
      console.error("❌ Erreur lors du vidage:", error);
      alert("❌ Impossible de vider la conversation");
    }
  };

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement de vos conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#E0485A" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={loadConversations}
        >
          <Text style={styles.actionButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => {
          const otherUserId = item.participants.find(id => id !== user.uid) || '';
          const otherUserName = getOtherParticipantName(item);
          const unreadCount = getUnreadCount(item);
          
          return (
            <TouchableOpacity 
              style={styles.conversationItem}
              onPress={() => navigateToConversation(item.id || '', otherUserId)}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {otherUserName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.userName}>{otherUserName}</Text>
                  {item.last_message?.timestamp && (
                    <Text style={styles.timestamp}>
                      {formatTimestamp(item.last_message.timestamp)}
                    </Text>
                  )}
                </View>
                
                <Text 
                  style={[
                    styles.lastMessage, 
                    unreadCount > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {item.last_message?.content || 'Nouvelle conversation'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.optionsButton}
                onPress={(e) => {
                  console.log("🎯 Clic sur bouton options détecté!");
                  console.log("🎯 Event:", e);
                  console.log("🎯 ConversationId:", item.id);
                  console.log("🎯 OtherUserName:", otherUserName);
                  
                  e.stopPropagation(); // Empêcher la propagation du clic
                  showConversationOptions(item.id || '', otherUserName);
                }}
                onPressIn={() => console.log("🔘 Press In détecté")}
                onPressOut={() => console.log("🔘 Press Out détecté")}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#E0485A']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Vous n'avez pas encore de conversations</Text>
            <Text style={styles.emptySubText}>
              Contactez un organisateur depuis une annonce pour démarrer une conversation
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0485A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#E0485A',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#E0485A',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#E0485A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  optionsButton: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagesListScreen;
