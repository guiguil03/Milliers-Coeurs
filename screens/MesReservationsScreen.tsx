import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthContext } from '../contexts/AuthContext';
import { reservationService } from '../services/reservationService';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import { Reservation, ReservationStatut } from '../models/Reservation';

// Type pour la navigation
type RootStackParamList = {
  AnnonceDetail: { annonceId: string };
  MesReservations: undefined;
};

type MesReservationsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MesReservations'
>;

const MesReservationsScreen: React.FC = () => {
  const { user } = useAuthContext();
  const navigation = useNavigation<MesReservationsNavigationProp>();
  
  const [reservations, setReservations] = useState<Array<Reservation & { annonce?: Annonce }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Chargement des réservations pour l'utilisateur:", user.uid);
      
      // Récupérer les réservations de l'utilisateur
      const userReservations = await reservationService.getReservationsByUser(user.uid);
      
      console.log("Réservations récupérées:", userReservations.length);
      
      // Pour chaque réservation, récupérer les détails de l'annonce associée
      const reservationsWithAnnonces = await Promise.all(
        userReservations.map(async (reservation) => {
          try {
            console.log("Récupération de l'annonce:", reservation.annonceId);
            const annonce = await annonceService.getAnnonceById(reservation.annonceId);
            return { ...reservation, annonce: annonce || undefined };
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'annonce ${reservation.annonceId}:`, error);
            return { ...reservation, annonce: undefined };
          }
        })
      );
      
      // Filtrer uniquement les réservations avec des annonces valides
      const validReservations = reservationsWithAnnonces.filter(reservation => reservation.annonce);
      
      // Trier par date de réservation (plus récent en premier)
      const sortedReservations = validReservations.sort((a, b) => {
        // Vérifier si les dates sont valides
        if (!a.dateReservation) return 1;
        if (!b.dateReservation) return -1;
        return b.dateReservation.getTime() - a.dateReservation.getTime();
      });
      
      console.log("Réservations triées et prêtes à afficher:", sortedReservations.length);
      
      setReservations(sortedReservations);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setError('Impossible de charger vos réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleCancelReservation = async (reservation: Reservation) => {
    if (!reservation.id) {
      console.log('🔴 [CANCEL] Pas d\'ID de réservation');
      return;
    }
    
    console.log('🔵 [CANCEL] Annulation directe de la réservation:', reservation.id);
    
    // Annulation directe sans confirmation pour éviter le problème de boîte de dialogue
    try {
      console.log('🟡 [CANCEL] Début de l\'annulation');
      setLoading(true);
      
      await reservationService.updateReservationStatus(
        reservation.id!, 
        ReservationStatut.Annulee
      );
      
      console.log('✅ [CANCEL] Réservation annulée avec succès');
      
      // Recharger les réservations
      await loadReservations();
      
      Alert.alert(
        "Réservation annulée",
        "Votre réservation a été annulée avec succès."
      );
    } catch (error) {
      console.error('🔴 [CANCEL] Erreur lors de l\'annulation de la réservation:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'annulation. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateToAnnonceDetail = (annonceId: string) => {
    navigation.navigate('AnnonceDetail', { annonceId });
  };

  // Fonction pour afficher le statut sous forme lisible
  const getStatusText = (statut: ReservationStatut) => {
    switch (statut) {
      case ReservationStatut.EnAttente:
        return 'En attente de confirmation';
      case ReservationStatut.Confirmee:
        return 'Confirmée';
      case ReservationStatut.Annulee:
        return 'Annulée';
      case ReservationStatut.Refusee:
        return 'Refusée';
      case ReservationStatut.Terminee:
        return 'Terminée';
      default:
        return 'Statut inconnu';
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: ReservationStatut) => {
    switch (statut) {
      case ReservationStatut.EnAttente:
        return '#f0ad4e'; // Orange
      case ReservationStatut.Confirmee:
        return '#5cb85c'; // Vert
      case ReservationStatut.Annulee:
        return '#d9534f'; // Rouge
      case ReservationStatut.Refusee:
        return '#d9534f'; // Rouge
      case ReservationStatut.Terminee:
        return '#5bc0de'; // Bleu
      default:
        return '#777'; // Gris
    }
  };

  const renderReservationItem = ({ item }: { item: Reservation & { annonce?: Annonce } }) => {
    // Ne pas afficher la réservation si l'annonce n'existe pas
    if (!item.annonce) {
      return null;
    }

    return (
      <View style={styles.reservationCard}>
        <TouchableOpacity
          style={styles.reservationHeader}
          onPress={() => navigateToAnnonceDetail(item.annonceId)}
        >
          <View style={styles.reservationInfo}>
            <Text style={styles.reservationTitle}>
              {item.annonce.titre}
            </Text>
            <Text style={styles.reservationOrganisation}>
              {item.annonce.organisation}
            </Text>
            <Text style={styles.reservationDate}>
              Réservé le {item.dateReservation.toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}>
            <Text style={styles.statusText}>{getStatusText(item.statut)}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Détails supplémentaires de l'annonce */}
        <View style={styles.detailsSection}>
          {item.annonce?.date && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Date: {item.annonce.date}</Text>
            </View>
          )}
          
          {item.annonce?.lieu && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Lieu: {item.annonce.lieu}</Text>
            </View>
          )}
          
          {item.annonce?.categorie && (
            <View style={styles.detailItem}>
              <Ionicons name="bookmark-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Catégorie: {item.annonce.categorie}</Text>
            </View>
          )}
          
          {item.annonce?.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{item.annonce.description}</Text>
            </View>
          )}
          
          {(item.annonce?.contact?.email || item.annonce?.email) && (
            <View style={styles.detailItem}>
              <Ionicons name="mail-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                Contact: {item.annonce.contact?.email || item.annonce.email}
              </Text>
            </View>
          )}
        </View>
        
        {(item.statut === ReservationStatut.EnAttente || item.statut === ReservationStatut.Confirmee) && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}
        
        {item.commentaireAssociation && (
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Message de l'association :</Text>
            <Text style={styles.commentText}>{item.commentaireAssociation}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes Réservations</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReservations}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Vous n'avez pas encore de réservations</Text>
          <Text style={styles.emptySubText}>
            Parcourez les annonces et réservez des missions de bénévolat
          </Text>
          
          {/* Bouton de test en mode développement uniquement */}
          {__DEV__ && (
            <TouchableOpacity 
              style={styles.testButton}
              onPress={async () => {
                try {
                  setLoading(true);
                  
                  if (!user) {
                    Alert.alert("Erreur", "Vous devez être connecté pour créer une réservation de test");
                    setLoading(false);
                    return;
                  }
                  
                  // Récupérer la première annonce disponible
                  const annonceSnapshot = await reservationService.getTestAnnonce();
                  if (!annonceSnapshot) {
                    Alert.alert("Erreur", "Aucune annonce disponible pour le test");
                    setLoading(false);
                    return;
                  }
                  
                  // Créer une réservation de test
                  await reservationService.createReservation({
                    annonceId: annonceSnapshot.id,
                    benevoleId: user.uid,
                    benevoleName: user.displayName || 'Bénévole Test',
                    benevoleEmail: user.email || 'test@example.com',
                    message: 'Ceci est une réservation de test'
                  });
                  
                  Alert.alert("Succès", "Une réservation de test a été créée");
                  loadReservations();
                } catch (error) {
                  console.error("Erreur lors de la création de la réservation de test:", error);
                  Alert.alert("Erreur", "Impossible de créer une réservation de test");
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.testButtonText}>Créer une réservation de test</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id || `${item.annonceId}-${item.benevoleId}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reservationInfo: {
    flex: 1,
    marginRight: 12,
  },
  reservationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reservationOrganisation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reservationDate: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#E0485A',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailsSection: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
  },
  commentSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
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
  retryButton: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MesReservationsScreen;
