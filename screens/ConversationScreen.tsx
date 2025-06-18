import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import {
  IMessage,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUserNameById,
  getCurrentUserId,
  deleteMessage,
  clearConversationMessages
} from '../services/messageSupabaseService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationScreen = () => {
  const { id, userId } = useLocalSearchParams<{ id: string; userId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState('Contact');
  const { user } = useAuthContext();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les messages
        const conversationMessages = await getConversationMessages(id);
        setMessages(conversationMessages);
        
        // Marquer les messages comme lus
        await markMessagesAsRead(id, user.id);
        
        // Charger le nom de l'autre utilisateur
        if (userId) {
          const name = await getUserNameById(userId);
          setOtherUserName(name);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des messages:', err);
        setError('Impossible de charger les messages');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Configurer un intervalle pour recharger les messages toutes les 5 secondes
    const interval = setInterval(loadMessages, 5000);
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval);
  }, [id, user, userId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !id || !userId) return;
    
    try {
      setSending(true);
      
      // Créer le message
      const messageData: Omit<IMessage, 'id'> = {
        sender_id: user.id,
        receiver_id: userId,
        content: newMessage.trim(),
        timestamp: new Date().getTime(),
        read: false,
        conversation_id: id
      };
      
      // Envoyer le message
      await sendMessage(messageData);
      
      // Effacer le champ de saisie
      setNewMessage('');
      
      // Recharger les messages
      const updatedMessages = await getConversationMessages(id);
      setMessages(updatedMessages);
      
      // Faire défiler jusqu'au dernier message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      Alert.alert('Erreur', 'Impossible d\'envoyer votre message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp: number): string => {
    try {
      return format(new Date(timestamp), 'HH:mm', { locale: fr });
    } catch (error) {
      return '';
    }
  };

  const formatMessageDate = (timestamp: number): string => {
    try {
      return format(new Date(timestamp), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      return '';
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!messageId || !id) return;
    
    console.log("🗑️ Tentative suppression message:", messageId);
    
    const confirmDelete = window.confirm("Supprimer ce message ?");
    if (confirmDelete) {
      console.log("✅ Confirmation suppression message");
      deleteMessageConfirmed(messageId);
    }
  };

  const deleteMessageConfirmed = async (messageId: string) => {
    try {
      await deleteMessage(id!, messageId);
      console.log("✅ Message supprimé avec succès");
      // Recharger les messages
      const updatedMessages = await getConversationMessages(id!);
      setMessages(updatedMessages);
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du message:", error);
      alert("❌ Impossible de supprimer le message");
    }
  };

  const handleClearAllMessages = () => {
    if (!id) return;
    
    console.log("🧹 Tentative vidage conversation:", id);
    
    const confirmClear = window.confirm("Vider TOUS les messages de cette conversation ?");
    if (confirmClear) {
      console.log("✅ Confirmation vidage conversation");
      clearAllMessagesConfirmed();
    }
  };

  const clearAllMessagesConfirmed = async () => {
    try {
      await clearConversationMessages(id!);
      console.log("✅ Conversation vidée avec succès");
      // Recharger les messages
      const updatedMessages = await getConversationMessages(id!);
      setMessages(updatedMessages);
      alert("✅ Tous les messages ont été supprimés");
    } catch (error) {
      console.error("❌ Erreur lors du vidage de la conversation:", error);
      alert("❌ Impossible de vider la conversation");
    }
  };

  const renderMessageItem = ({ item, index }: { item: IMessage; index: number }) => {
    const isCurrentUser = item.sender_id === user?.id;
    const showDate = index === 0 || 
      formatMessageDate(item.timestamp) !== formatMessageDate(messages[index - 1].timestamp);
    
    return (
      <>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatMessageDate(item.timestamp)}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
          ]}
          onLongPress={() => {
            if (item.id) {
              console.log("📱 Long press sur message:", item.id);
              const confirmDelete = window.confirm("Supprimer ce message ?");
              if (confirmDelete) {
                handleDeleteMessage(item.id);
              }
            }
          }}
        >
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}>
            <Text style={styles.messageText}>{item.content}</Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Vous devez être connecté pour accéder à cette conversation</Text>
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
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
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
          onPress={() => router.push('/messages')}
        >
          <Text style={styles.actionButtonText}>Retour aux messages</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUserName}</Text>
        <TouchableOpacity 
          style={styles.optionsButton}
          onPress={() => {
            console.log("🔘 Bouton options header cliqué");
            const confirmClear = window.confirm("Vider tous les messages de cette conversation ?");
            if (confirmClear) {
              handleClearAllMessages();
            }
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesContainer}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucun message</Text>
            <Text style={styles.emptySubText}>Envoyez un message pour démarrer la conversation</Text>
          </View>
        }
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrivez votre message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.disabledButton
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 20,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  currentUserMessage: {
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  currentUserBubble: {
    backgroundColor: '#E0485A',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#E0485A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
  disabledButton: {
    opacity: 0.5,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  optionsButton: {
    padding: 5,
  },
});

export default ConversationScreen;
