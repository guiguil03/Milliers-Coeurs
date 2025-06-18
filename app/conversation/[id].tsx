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
  Alert,
  SafeAreaView,
  Dimensions
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
  const [inputHeight, setInputHeight] = useState(40);
  
  const { user } = useAuthContext();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  
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
      setInputHeight(40); // Reset input height
      
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
  
  const handleInputChange = (text: string) => {
    setNewMessage(text);
    // Auto-scroll quand on tape
      setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    setInputHeight(Math.max(40, Math.min(height + 20, 120)));
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
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement de la conversation...</Text>
      </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color="#E0485A" />
          <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
        {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#E0485A" />
        </TouchableOpacity>
          
          <Image 
            source={{
              uri: `https://api.dicebear.com/7.x/initials/png?seed=${contactName}&backgroundColor=E0485A`
            }} 
            style={styles.contactAvatar} 
          />
          
        <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.onlineStatus}>En ligne</Text>
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
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
        />

        {/* Input Container with Shadow */}
        <View style={styles.inputWrapper}>
      <View style={styles.inputContainer}>
            <View style={styles.inputBackground}>
        <TextInput
                ref={textInputRef}
                style={[styles.textInput, { height: inputHeight }]}
                value={newMessage}
                onChangeText={handleInputChange}
                onContentSizeChange={handleContentSizeChange}
          placeholder="Tapez votre message..."
                placeholderTextColor="#999"
          multiline
                maxLength={1000}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!newMessage.trim() || sending) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                activeOpacity={0.7}
        >
                {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
        </TouchableOpacity>
            </View>
          </View>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  flex: {
    flex: 1
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
    color: '#E0485A',
    textAlign: 'center'
  },
  backButton: {
    marginTop: 16,
    backgroundColor: '#E0485A',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  backBtn: {
    marginRight: 12,
    padding: 4
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  onlineStatus: {
    fontSize: 13,
    color: '#E0485A',
    marginTop: 2
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8
  },
  messageContainer: {
    marginVertical: 3
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
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  myMessageBubble: {
    backgroundColor: '#E0485A',
    borderBottomRightRadius: 4
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  myMessageText: {
    color: '#fff'
  },
  otherMessageText: {
    color: '#333'
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right'
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  otherMessageTime: {
    color: '#999'
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  inputBackground: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    maxHeight: 120,
    minHeight: 40
  },
  sendButton: {
    backgroundColor: '#E0485A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#E0485A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0
  }
});
