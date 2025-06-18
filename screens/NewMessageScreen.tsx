import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { annonceSupabaseService } from '../services/annonceSupabaseService';
import { sendMessageWithAutoConversation } from '../services/messageSupabaseService';

const NewMessageScreen = () => {
  const { annonceId } = useLocalSearchParams<{ annonceId: string }>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [annonceTitle, setAnnonceTitle] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!annonceId) {
      setError('ID de l\'annonce non spécifié');
      setLoading(false);
      return;
    }

    const loadAnnonceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const annonceDetails = await annonceSupabaseService.getAnnonceById(annonceId);
        if (!annonceDetails) {
          setError('Annonce non trouvée');
          return;
        }
        
        setAnnonceTitle(annonceDetails.titre || 'Annonce sans titre');
        setOrganisationName(annonceDetails.organisation || 'Organisation');
        
        if (!annonceDetails.utilisateurId) {
          setError('Impossible de contacter l\'organisateur');
          return;
        }
        
        setReceiverId(annonceDetails.utilisateurId);
      } catch (err) {
        console.error('Erreur lors du chargement des détails de l\'annonce:', err);
        setError('Impossible de charger les détails de l\'annonce');
      } finally {
        setLoading(false);
      }
    };

    loadAnnonceDetails();
  }, [annonceId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !receiverId) return;
    
    try {
      setSending(true);
      
      // Envoyer le message
      await sendMessageWithAutoConversation(
        user.id,
        receiverId,
        message.trim()
      );
      
      Alert.alert(
        'Message envoyé',
        'Votre message a été envoyé avec succès',
        [
          { 
            text: 'Voir mes messages', 
            onPress: () => router.push('/messages') 
          }
        ]
      );
      
      // Réinitialiser le formulaire
      setMessage('');
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      Alert.alert('Erreur', 'Impossible d\'envoyer votre message');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Vous devez être connecté pour contacter l'organisateur</Text>
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
        <Text style={styles.loadingText}>Chargement...</Text>
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
          onPress={() => router.back()}
        >
          <Text style={styles.actionButtonText}>Retour</Text>
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
        <Text style={styles.headerTitle}>Nouveau message</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.annonceInfoContainer}>
          <Text style={styles.infoLabel}>Organisation:</Text>
          <Text style={styles.infoValue}>{organisationName}</Text>
          
          <Text style={styles.infoLabel}>Annonce:</Text>
          <Text style={styles.infoValue}>{annonceTitle}</Text>
        </View>
        
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Votre message:</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Écrivez votre message ici..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {message.length}/1000 caractères
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.disabledButton
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="white" style={styles.sendIcon} />
                <Text style={styles.sendButtonText}>Envoyer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  annonceInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  messageContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  sendButton: {
    backgroundColor: '#E0485A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '80%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default NewMessageScreen;
