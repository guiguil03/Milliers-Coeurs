import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  IMessage,
  listenToConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUserNameById
} from '../../services/messageSupabaseService';

export default function ConversationPage() {
  const { id, userId, name } = useLocalSearchParams<{ 
    id: string; 
    userId: string; 
    name: string; 
  }>();
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contactName, setContactName] = useState(name || 'Contact');
  
  const { user } = useAuthContext();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user?.id) {
      setError('Paramètres de conversation manquants');
      setLoading(false);
      return;
    }

    console.log('📱 [CONVERSATION] Chargement conversation:', { id, userId, name });

    // Récupérer le nom du contact si pas fourni
    if (userId && !name) {
      getUserNameById(userId).then(setContactName);
    }

    // Écouter les messages en temps réel
    const unsubscribe = listenToConversationMessages(id, (newMessages) => {
      console.log('📱 [CONVERSATION] Messages reçus:', newMessages.length);
      setMessages(newMessages);
      setLoading(false);
      
      // Marquer les messages comme lus
      if (newMessages.some(msg => msg.receiver_id === user.id && !msg.read)) {
        markMessagesAsRead(id, user.id).catch(err => {
          console.error('Erreur lors du marquage des messages comme lus:', err);
        });
      }

      // Défiler vers le bas pour voir le dernier message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      unsubscribe();
    };
  }, [id, user, userId, name]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !userId || !id) {
      return;
    }

    setSending(true);
    try {
      console.log('📤 [CONVERSATION] Envoi message:', {
        conversationId: id,
        senderId: user.id,
        receiverId: userId,
        content: newMessage.trim()
      });

      await sendMessage(id, user.id, userId, newMessage.trim());
      setNewMessage('');
      
      // Défiler vers le bas après envoi
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('❌ [CONVERSATION] Erreur envoi message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }: { item: IMessage }) => {
    const isMe = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMe ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMe ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <Image 
          source={{
            uri: `https://api.dicebear.com/7.x/initials/png?seed=${contactName}&backgroundColor=4f46e5`
          }} 
          style={styles.contactAvatar} 
        />
        
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{contactName}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Tapez votre message..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
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
  backButton: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  backBtn: {
    marginRight: 12
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  messagesContent: {
    padding: 16
  },
  messageContainer: {
    marginVertical: 4
  },
  myMessage: {
    alignItems: 'flex-end'
  },
  otherMessage: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20
  },
  myMessageBubble: {
    backgroundColor: '#4f46e5'
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20
  },
  myMessageText: {
    color: '#fff'
  },
  otherMessageText: {
    color: '#111827'
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4
  },
  myMessageTime: {
    color: '#e0e7ff'
  },
  otherMessageTime: {
    color: '#6b7280'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af'
  }
});
