import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { annonceService, Annonce } from '../../services/annonceFirebaseService';
import { getCategoryById, getCategoryByName } from '../../constants/categories';
import { useAuthContext } from '../../contexts/AuthContext';
import { reservationService } from '../../services/reservationService';
import { ReservationStatut } from '../../models/Reservation';
import { useAnnonce, AnnonceWithFavori } from '../../hooks/useAnnonce';

export default function AnnonceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [annonce, setAnnonce] = useState<AnnonceWithFavori | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReservationLoading, setIsReservationLoading] = useState(false);
  const [hasReserved, setHasReserved] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const router = useRouter();
  const { user, userType } = useAuthContext();
  const { getAnnonceByIdWithFavoriStatus, addToFavoris, removeFromFavoris } = useAnnonce();

  useEffect(() => {
    if (!id) {
      setError('ID de l\'annonce non spécifié');
      setLoading(false);
      return;
    }

    loadAnnonceDetails();
  }, [id]);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà réservé cette annonce
    const checkReservationStatus = async () => {
      if (user && id) {
        try {
          const reserved = await reservationService.hasBenevoleReservedAnnonce(id as string, user.uid);
          setHasReserved(reserved);
        } catch (error) {
          console.error('Erreur lors de la vérification de la réservation:', error);
        }
      }
    };

    checkReservationStatus();
  }, [user, id]);

  const loadAnnonceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser la fonction qui récupère l'annonce avec son statut de favori
      const annonceDetails = await getAnnonceByIdWithFavoriStatus(id as string);
      if (!annonceDetails) {
        setError('Annonce non trouvée');
      } else {
        setAnnonce(annonceDetails);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails de l\'annonce:', err);
      setError('Impossible de charger les détails de l\'annonce.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        "Connexion requise", 
        "Vous devez vous connecter pour réserver une place.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/profile") }
        ]
      );
      return;
    }

    // Vérifier si l'utilisateur est un bénévole
    if (userType !== 'benevole') {
      Alert.alert(
        "Action non disponible", 
        "Seuls les bénévoles peuvent réserver des missions."
      );
      return;
    }

    // Vérifier si l'annonce n'est pas celle de l'utilisateur
    if (annonce && annonce.utilisateurId === user.uid) {
      Alert.alert(
        "Action non disponible", 
        "Vous ne pouvez pas réserver votre propre annonce."
      );
      return;
    }

    // Si l'utilisateur a déjà réservé, proposer d'annuler la réservation
    if (hasReserved) {
      Alert.alert(
        "Réservation existante",
        "Vous avez déjà réservé une place pour cette mission. Souhaitez-vous annuler votre réservation ?",
        [
          { text: "Non", style: "cancel" },
          { 
            text: "Oui, annuler", 
            style: "destructive",
            onPress: async () => {
              try {
                setIsReservationLoading(true);
                // Récupérer la réservation existante
                const reservations = await reservationService.getReservationsByBenevole(user.uid);
                const reservation = reservations.find(r => r.annonceId === id);
                
                if (reservation && reservation.id) {
                  // Annuler la réservation
                  await reservationService.updateReservationStatus(reservation.id, ReservationStatut.Annulee);
                  setHasReserved(false);
                  Alert.alert("Réservation annulée", "Votre réservation a été annulée avec succès.");
                }
              } catch (error) {
                console.error("Erreur lors de l'annulation de la réservation:", error);
                Alert.alert("Erreur", "Impossible d'annuler la réservation. Veuillez réessayer.");
              } finally {
                setIsReservationLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    // Créer une nouvelle réservation
    Alert.alert(
      "Réserver une place",
      "Voulez-vous réserver une place pour cette mission ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Confirmer", 
          onPress: async () => {
            try {
              setIsReservationLoading(true);
              await reservationService.createReservation({
                annonceId: id as string,
                benevoleId: user.uid,
                benevoleName: user.displayName || undefined,
                benevoleEmail: user.email || undefined
              });
              
              setHasReserved(true);
              Alert.alert(
                "Réservation effectuée", 
                "Votre demande de réservation a été enregistrée. Vous pouvez consulter son statut dans votre profil."
              );
            } catch (error) {
              console.error("Erreur lors de la réservation:", error);
              Alert.alert("Erreur", "Impossible de créer la réservation. Veuillez réessayer.");
            } finally {
              setIsReservationLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleContact = () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        "Connexion requise", 
        "Vous devez vous connecter pour contacter l'organisateur.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/profile") }
        ]
      );
      return;
    }

    // Vérifier si l'annonce a un utilisateur associé
    if (!annonce || !annonce.utilisateurId) {
      Alert.alert("Erreur", "Impossible de contacter l'organisateur de cette annonce.");
      return;
    }

    // Rediriger vers la page de messagerie avec l'ID de l'annonce
    router.push(`/messages/new?annonceId=${id}`);
  };

  // Fonction pour gérer l'ajout/suppression des favoris
  const handleToggleFavorite = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      Alert.alert(
        "Connexion requise", 
        "Vous devez vous connecter pour ajouter des favoris.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/profile") }
        ]
      );
      return;
    }

    if (!annonce || !id) return;

    try {
      setIsFavoriteLoading(true);
      
      if (annonce.isFavori) {
        // Retirer des favoris
        await removeFromFavoris(id);
      } else {
        // Ajouter aux favoris
        await addToFavoris(id);
      }
      
      // Recharger les détails de l'annonce pour mettre à jour le statut de favori
      await loadAnnonceDetails();
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la modification des favoris.");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Fonction pour supprimer l'annonce
  const handleDelete = () => {
    if (!user || !annonce || !annonce.utilisateurId || user.uid !== annonce.utilisateurId) {
      return;
    }
    
    Alert.alert(
      "Supprimer l'annonce",
      "Êtes-vous sûr de vouloir supprimer cette annonce ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (annonce.id) {
                await annonceService.deleteAnnonce(annonce.id);
                Alert.alert(
                  "Succès", 
                  "L'annonce a été supprimée avec succès.",
                  [{ text: "OK", onPress: () => router.back() }]
                );
              }
            } catch (error) {
              console.error("Erreur lors de la suppression de l'annonce:", error);
              Alert.alert("Erreur", "Impossible de supprimer l'annonce. Veuillez réessayer.");
            }
          } 
        }
      ]
    );
  };

  // Vérifier si l'utilisateur connecté est le propriétaire de l'annonce
  const isOwner = user && annonce && annonce.utilisateurId && user.uid === annonce.utilisateurId;

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadAnnonceDetails}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!annonce) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Annonce non disponible</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonIcon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la mission</Text>
        
        {isOwner && (
          <TouchableOpacity 
            style={styles.deleteButtonIcon}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#E0485A" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.orgSection}>
        <View style={styles.orgHeader}>
          <View style={styles.logoContainer}>
            {annonce.logo ? (
              <Image source={{ uri: annonce.logo }} style={styles.logo} />
            ) : (
              <View style={[styles.logo, styles.placeholderLogo]}>
                <Ionicons name="business" size={30} color="#999" />
              </View>
            )}
          </View>
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{annonce.organisation}</Text>
            <Text style={styles.timeAgo}>{annonce.temps || 'Date inconnue'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailSection}>
          <Ionicons name="information-circle" size={22} color="#E0485A" style={styles.detailIcon} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailText}>{annonce.description}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Ionicons name="alert-circle" size={22} color="#E0485A" style={styles.detailIcon} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Information importante</Text>
            <Text style={styles.detailText}>{annonce.important}</Text>
          </View>
        </View>

        <View style={styles.detailSection}>
          <Ionicons name="calendar" size={22} color="#E0485A" style={styles.detailIcon} />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailText}>{annonce.date}</Text>
          </View>
        </View>

        {annonce.lieu && (
          <View style={styles.detailSection}>
            <Ionicons name="location" size={22} color="#E0485A" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Lieu</Text>
              <Text style={styles.detailText}>{annonce.lieu}</Text>
            </View>
          </View>
        )}

        {annonce.places !== undefined && (
          <View style={styles.detailSection}>
            <Ionicons name="people" size={22} color="#E0485A" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Places disponibles</Text>
              <Text style={styles.detailText}>{annonce.places}</Text>
            </View>
          </View>
        )}

        {annonce.categorie && (
          <View style={styles.detailSection}>
            <Ionicons 
              name={(getCategoryById(annonce.categorie) || getCategoryByName(annonce.categorie) || { icon: 'pricetag' }).icon as any} 
              size={22} 
              color="#E0485A" 
              style={styles.detailIcon} 
            />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Catégorie</Text>
              <Text style={styles.detailText}>
                {(getCategoryById(annonce.categorie) || getCategoryByName(annonce.categorie) || { name: annonce.categorie }).name}
              </Text>
            </View>
          </View>
        )}

        {annonce.contact && (
          <View style={styles.detailSection}>
            <Ionicons name="call" size={22} color="#E0485A" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Contact</Text>
              {annonce.contact.email && <Text style={styles.detailText}>Email: {annonce.contact.email}</Text>}
              {annonce.contact.telephone && <Text style={styles.detailText}>Tél: {annonce.contact.telephone}</Text>}
            </View>
          </View>
        )}
      </View>

      {/* Images supplémentaires */}
      {annonce.images && annonce.images.length > 0 && (
        <View style={styles.imagesContainer}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {annonce.images.map((image, index) => (
              <Image 
                key={index} 
                source={{ uri: image }} 
                style={styles.additionalImage} 
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[
            styles.actionButton, 
            styles.reserverButton,
            hasReserved && styles.cancelButton,
            isReservationLoading && styles.disabledButton
          ]}
          onPress={handleReservation}
          disabled={isReservationLoading}
        >
          {isReservationLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name={hasReserved ? "close-circle" : "calendar"} size={22} color="#fff" />
              <Text style={styles.actionButtonText}>{hasReserved ? "ANNULER" : "RÉSERVER"}</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.contactButton]}
          onPress={handleContact}
        >
          <Ionicons name="chatbubble" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>CONTACTER</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.favorisButton]}
          onPress={handleToggleFavorite}
        >
          {isFavoriteLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons 
                name={annonce?.isFavori ? "heart" : "heart-outline"} 
                size={22} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {annonce?.isFavori ? "RETIRER" : "FAVORIS"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButtonIcon: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  deleteButtonIcon: {
    padding: 5,
  },
  orgSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderLogo: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeAgo: {
    color: '#666',
    fontSize: 14,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
  },
  detailSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 16,
    marginTop: 3,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  imagesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  additionalImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  reserverButton: {
    backgroundColor: '#03A9F4',
  },
  contactButton: {
    backgroundColor: '#4CAF50',
  },
  favorisButton: {
    backgroundColor: '#E0485A',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#E0485A',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
