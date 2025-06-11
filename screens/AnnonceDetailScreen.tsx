import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import { useAuthContext } from '../contexts/AuthContext';
import { reservationService } from '../services/reservationService';
import { ReservationStatut } from '../models/Reservation';

// Définir les types pour la navigation
type RootStackParamList = {
  AnnonceDetail: { annonceId: string };
  AnnonceEdit: { annonceId: string };
  // Ajoutez d'autres écrans au besoin
};

type AnnonceDetailScreenRouteProp = RouteProp<RootStackParamList, 'AnnonceDetail'>;
type AnnonceDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnnonceDetail'>;

interface AnnonceDetailScreenProps {
  route: AnnonceDetailScreenRouteProp;
  navigation: AnnonceDetailScreenNavigationProp;
}

const AnnonceDetailScreen: React.FC<AnnonceDetailScreenProps> = ({ route, navigation }) => {
  const { annonceId } = route.params;
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userType } = useAuthContext();

  // États pour la réservation
  const [reservationModalVisible, setReservationModalVisible] = useState<boolean>(false);
  const [reservationMessage, setReservationMessage] = useState<string>('');
  const [isReservationLoading, setIsReservationLoading] = useState<boolean>(false);
  const [hasReserved, setHasReserved] = useState<boolean>(false);

  useEffect(() => {
    fetchAnnonceDetail();
    // Vérifier si l'utilisateur a déjà réservé cette annonce
    if (user) {
      checkReservationStatus();
    }
  }, [annonceId, user]);

  const fetchAnnonceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await annonceService.getAnnonceById(annonceId);
      setAnnonce(data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails de l\'annonce:', error);
      setError('Impossible de charger les détails. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const checkReservationStatus = async () => {
    if (!user) return;
    
    try {
      const hasReservation = await reservationService.hasExistingReservation(user.uid, annonceId);
      setHasReserved(hasReservation);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de réservation:', error);
    }
  };

  const handleShare = async () => {
    if (!annonce) return;
    
    try {
      await Share.share({
        message: `${annonce.organisation} - ${annonce.description} ${annonce.important}\n\nRejoingnez-nous sur l'application Milliers de Coeurs !`,
        title: `Annonce de ${annonce.organisation}`,
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleContact = (type: 'email' | 'phone') => {
    if (!annonce || !annonce.contact) return;
    
    if (type === 'email' && annonce.contact.email) {
      Linking.openURL(`mailto:${annonce.contact.email}`);
    } else if (type === 'phone' && annonce.contact.telephone) {
      Linking.openURL(`tel:${annonce.contact.telephone}`);
    }
  };

  const handleEdit = () => {
    // Naviguer vers l'écran d'édition
    navigation.navigate('AnnonceEdit', { annonceId });
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await annonceService.deleteAnnonce(annonceId);
              Alert.alert("Succès", "L'annonce a été supprimée avec succès.");
              navigation.goBack();
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert("Erreur", "Impossible de supprimer l'annonce. Veuillez réessayer.");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Fonction pour ouvrir la modal de réservation
  const openReservationModal = () => {
    if (!user) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour réserver cette annonce.",
        [
          { text: "OK" }
        ]
      );
      return;
    }
    
    setReservationModalVisible(true);
  };

  // Fonction pour soumettre une réservation
  const handleReservation = async () => {
    if (!user || !annonce) return;
    
    try {
      setIsReservationLoading(true);
      
      // Vérifier si l'utilisateur a déjà une réservation pour cette annonce
      const hasExistingReservation = await reservationService.hasExistingReservation(user.uid, annonceId);
      if (hasExistingReservation) {
        Alert.alert(
          "Réservation impossible",
          "Vous avez déjà réservé cette annonce. Vous ne pouvez pas réserver la même annonce plusieurs fois.",
          [{ text: "OK" }]
        );
        setReservationModalVisible(false);
        return;
      }
      
      // Créer la réservation
      await reservationService.createReservation({
        annonceId: annonceId,
        benevoleId: user.uid,
        benevoleName: user.displayName || '',
        benevoleEmail: user.email || '',
        message: reservationMessage.trim() || ''
      });
      
      setReservationModalVisible(false);
      setReservationMessage('');
      setHasReserved(true);
      
      // Rafraîchir les détails de l'annonce pour mettre à jour le nombre de places
      fetchAnnonceDetail();
      
      Alert.alert(
        "Réservation envoyée",
        "Votre demande de réservation a été envoyée avec succès. L'association vous contactera pour confirmer votre participation.",
        [
          { text: "OK" }
        ]
      );
    } catch (error: any) {
      console.error('Erreur lors de la réservation:', error);
      
      // Afficher un message d'erreur spécifique si l'utilisateur a déjà réservé
      if (error.message && error.message.includes("déjà réservé")) {
        Alert.alert(
          "Réservation impossible",
          "Vous avez déjà réservé cette annonce. Vous ne pouvez pas réserver la même annonce plusieurs fois.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la réservation. Veuillez réessayer.",
          [
            { text: "OK" }
          ]
        );
      }
    } finally {
      setIsReservationLoading(false);
    }
  };

  // Fonction pour annuler une réservation
  const handleCancelReservation = async () => {
    if (!user) return;
    
    Alert.alert(
      "Annuler la réservation",
      "Êtes-vous sûr de vouloir annuler votre réservation ?",
      [
        { text: "Non", style: "cancel" },
        { 
          text: "Oui", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              
              // Récupérer toutes les réservations de l'utilisateur pour cette annonce
              const reservations = await reservationService.getReservationsByBenevole(user.uid);
              const reservation = reservations.find(r => r.annonceId === annonceId && 
                (r.statut === ReservationStatut.EnAttente || r.statut === ReservationStatut.Confirmee));
              
              if (reservation && reservation.id) {
                // Mettre à jour le statut de la réservation
                await reservationService.updateReservationStatus(
                  reservation.id, 
                  ReservationStatut.Annulee
                );
                
                setHasReserved(false);
                // Rafraîchir les détails de l'annonce
                fetchAnnonceDetail();
                
                Alert.alert(
                  "Réservation annulée",
                  "Votre réservation a été annulée avec succès.",
                  [
                    { text: "OK" }
                  ]
                );
              } else {
                throw new Error("Réservation introuvable");
              }
            } catch (error) {
              console.error('Erreur lors de l\'annulation de la réservation:', error);
              Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de l'annulation. Veuillez réessayer.",
                [
                  { text: "OK" }
                ]
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  if (error || !annonce) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Annonce introuvable"}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchAnnonceDetail}>
          <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Vérifier si l'utilisateur est le créateur de l'annonce
  const isOwner = user && user.uid === annonce.utilisateurId;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {annonce.logo ? (
            <Image source={{ uri: annonce.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.placeholderLogo]}>
              <Text style={styles.placeholderText}>
                {annonce.organisation.substring(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.organisation}>{annonce.organisation}</Text>
          <Text style={styles.temps}>{annonce.temps}</Text>
          
          {annonce.categorie && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{annonce.categorie}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.description}>
          {annonce.description} <Text style={styles.important}>{annonce.important}</Text>
        </Text>
        
        {annonce.lieu && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.infoText}>{annonce.lieu}</Text>
          </View>
        )}
        
        {annonce.places !== undefined && (
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={18} color="#666" />
            <Text style={styles.infoText}>
              {annonce.places} {annonce.places > 1 ? 'places disponibles' : 'place disponible'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Section de contact */}
      {(annonce.contact?.email || annonce.contact?.telephone) && (
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>
          
          {annonce.contact.email && (
            <TouchableOpacity 
              style={styles.contactButton} 
              onPress={() => handleContact('email')}
            >
              <Ionicons name="mail-outline" size={20} color="#E0485A" />
              <Text style={styles.contactButtonText}>{annonce.contact.email}</Text>
            </TouchableOpacity>
          )}
          
          {annonce.contact.telephone && (
            <TouchableOpacity 
              style={styles.contactButton} 
              onPress={() => handleContact('phone')}
            >
              <Ionicons name="call-outline" size={20} color="#E0485A" />
              <Text style={styles.contactButtonText}>{annonce.contact.telephone}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Galerie d'images (si disponible) */}
      {annonce.images && annonce.images.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {annonce.images.map((image, index) => (
              <Image 
                key={index} 
                source={{ uri: image }} 
                style={styles.galleryImage} 
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#E0485A" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
        
        {isOwner && (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Ionicons name="create-outline" size={24} color="#E0485A" />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#E0485A" />
              <Text style={[styles.actionText, { color: '#E0485A' }]}>Supprimer</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Afficher le bouton de réservation uniquement pour les bénévoles qui ne sont pas les créateurs */}
        {userType === 'benevole' && !isOwner && (
          hasReserved ? (
            <TouchableOpacity style={styles.reservationButton} onPress={handleCancelReservation}>
              <Ionicons name="close-circle-outline" size={24} color="#fff" />
              <Text style={styles.reservationButtonText}>Annuler ma réservation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[
                styles.reservationButton, 
                (annonce.places !== undefined && annonce.places <= 0) ? styles.disabledButton : {}
              ]} 
              onPress={openReservationModal}
              disabled={annonce.places !== undefined && annonce.places <= 0}
            >
              <Ionicons name="calendar-outline" size={24} color="#fff" />
              <Text style={styles.reservationButtonText}>Réserver cette mission</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {/* Modal de réservation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reservationModalVisible}
        onRequestClose={() => setReservationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Réserver cette mission</Text>
            
            <Text style={styles.modalLabel}>Message pour l'association (optionnel)</Text>
            <TextInput
              style={styles.modalInput}
              multiline={true}
              numberOfLines={4}
              placeholder="Présentez-vous et expliquez pourquoi vous souhaitez participer..."
              value={reservationMessage}
              onChangeText={setReservationMessage}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setReservationModalVisible(false)}
                disabled={isReservationLoading}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={handleReservation}
                disabled={isReservationLoading}
              >
                {isReservationLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E0485A',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  placeholderLogo: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  organisation: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  temps: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  contentSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 16,
  },
  important: {
    fontWeight: 'bold',
    color: '#E0485A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  contactSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  imagesSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  galleryImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  // Styles pour le bouton de réservation
  reservationButton: {
    backgroundColor: '#E0485A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    width: '100%',
  },
  reservationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  // Styles pour la modal de réservation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalConfirmButton: {
    backgroundColor: '#E0485A',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AnnonceDetailScreen;
