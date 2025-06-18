import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { annonceSupabaseService, Annonce } from '../../services/annonceSupabaseService';
import { getCategoryById, getCategoryByName } from '../../constants/categories';
import { useAuthContext } from '../../contexts/AuthContext';
import { reservationSupabaseService } from '../../services/reservationSupabaseService';
import { ReservationStatut, Reservation } from '../../models/Reservation';
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
          console.log('🔍 Vérification réservation pour:', user.id, 'annonce:', id);
          const reserved = await reservationSupabaseService.hasExistingReservation(user.id, id as string);
          console.log('🔍 Déjà réservé:', reserved);
          setHasReserved(reserved);
        } catch (error) {
          console.error('❌ Erreur vérification réservation:', error);
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
      alert("❌ Vous devez vous connecter pour réserver une place.");
      router.push("/profile");
      return;
    }

    // Vérifier si l'utilisateur est un bénévole
    if (userType !== 'benevole') {
      alert("❌ Seuls les bénévoles peuvent réserver des missions.");
      return;
    }

    // Vérifier si l'annonce n'est pas celle de l'utilisateur
    const isOwner = annonce && annonce.user_id === user.id;
    if (isOwner) {
      alert("❌ Vous ne pouvez pas réserver votre propre mission !");
      return;
    }

    // Si l'utilisateur a déjà réservé, proposer d'annuler la réservation
    if (hasReserved) {
      if (confirm("Vous avez déjà réservé cette mission. Souhaitez-vous annuler votre réservation ?")) {
        try {
          setIsReservationLoading(true);
          // Récupérer la réservation existante
          const reservations = await reservationSupabaseService.getReservationsByUser(user.id);
          const reservation = reservations.find((r: Reservation) => r.annonceId === id);
          
          if (reservation && reservation.id) {
            // Annuler la réservation
            await reservationSupabaseService.updateReservationStatus(reservation.id, ReservationStatut.Annulee);
            setHasReserved(false);
            alert("✅ Réservation annulée avec succès.");
          }
        } catch (error) {
          console.error("❌ Erreur lors de l'annulation de la réservation:", error);
          alert("❌ Impossible d'annuler la réservation. Veuillez réessayer.");
        } finally {
          setIsReservationLoading(false);
        }
      }
      return;
    }

    // Créer une nouvelle réservation DIRECTEMENT
    try {
      setIsReservationLoading(true);
      console.log("🎯 [DETAILS] Création réservation pour annonce:", id);
      
      const reservationData = {
        annonceId: id as string,
        benevoleId: user.id,
        benevoleName: user.user_metadata?.display_name || user.email || user.email || 'Bénévole',
        benevoleEmail: user.email || '',
        message: `Réservation pour ${annonce?.titre || 'cette mission'}`
      };
      
      const reservationId = await reservationSupabaseService.createReservation(reservationData);
      console.log("✅ [DETAILS] Réservation créée avec ID:", reservationId);
      
      // ✅ CONFIRMATION
      setHasReserved(true);
      
      // 🎉 MESSAGE DE SUCCÈS
      alert("🎉 RÉSERVATION CONFIRMÉE !");
      
      // 🔄 NAVIGATION AUTOMATIQUE vers l'onglet réservations
      setTimeout(() => {
        router.push("/(tabs)/reservations");
      }, 2000);
      
    } catch (error) {
      console.error("🔴 [DETAILS] Erreur lors de la réservation:", error);
      alert(`❌ Impossible de créer la réservation. Erreur: ${error}`);
    } finally {
      setIsReservationLoading(false);
    }
  };

  const handleContact = async () => {
    console.log("🔍 [CONTACT] Début handleContact");
    console.log("🔍 [CONTACT] User:", user);
    console.log("🔍 [CONTACT] Annonce:", annonce);
    console.log("🔍 [CONTACT] Annonce user_id:", annonce?.user_id);

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      console.log("❌ [CONTACT] Utilisateur non connecté");
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
    if (!annonce || !annonce.user_id) {
      console.log("❌ [CONTACT] Annonce ou user_id manquant");
      console.log("❌ [CONTACT] Annonce présente:", !!annonce);
      console.log("❌ [CONTACT] user_id présent:", !!annonce?.user_id);
      Alert.alert("Erreur", "Impossible de contacter l'organisateur de cette annonce.");
      return;
    }

    // Vérifier qu'on ne se contacte pas soi-même
    if (user.id === annonce.user_id) {
      console.log("❌ [CONTACT] Tentative de se contacter soi-même");
      Alert.alert("Information", "Vous ne pouvez pas vous contacter vous-même.");
      return;
    }

    try {
      console.log("📤 [CONTACT] Tentative d'envoi message");
      console.log("📤 [CONTACT] Sender ID:", user.id);
      console.log("📤 [CONTACT] Receiver ID:", annonce.user_id);

      // Importer le service de messagerie
      const { sendMessageWithAutoConversation } = await import('../../services/messageSupabaseService');
      
      // Créer la conversation et envoyer le premier message
      await sendMessageWithAutoConversation(
        user.id,
        annonce.user_id,
        `Bonjour ! Je suis intéressé(e) par votre annonce "${annonce.titre}". Pouvez-vous me donner plus d'informations ?`
      );

      console.log("✅ [CONTACT] Message envoyé avec succès");
      Alert.alert(
        "Message envoyé !",
        "Votre message a été envoyé à l'organisateur. Vous pouvez consulter la conversation dans vos messages.",
        [
          { text: "Voir mes messages", onPress: () => router.push("/messages") },
          { text: "OK", style: "cancel" }
        ]
      );
    } catch (error) {
      console.error("❌ [CONTACT] Erreur lors de l'envoi du message:", error);
      Alert.alert("Erreur", `Impossible d'envoyer le message. Détails: ${error}`);
    }
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
    if (!user || !annonce || !annonce.utilisateurId || user.id !== annonce.utilisateurId) {
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
                await annonceSupabaseService.deleteAnnonce(annonce.id);
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
  const isOwner = user && annonce && annonce.user_id && user.id === annonce.user_id;

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
    <View style={styles.container}>
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
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

      <View style={styles.orgSection}>
        <View style={styles.orgHeader}>
          <View style={styles.logoContainer}>
            {annonce.logo ? (
              <Image 
            source={
              annonce.logo 
                ? { uri: annonce.logo }
                : { uri: 'https://via.placeholder.com/50x50.png?text=Logo' }
            } 
            style={styles.logo} 
          />
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
            (annonce && annonce.utilisateurId === user?.id) ? styles.ownerButton : (hasReserved ? styles.cancelButton : styles.reserverButton),
            isReservationLoading && styles.disabledButton
          ]}
          onPress={handleReservation}
          disabled={isReservationLoading || (annonce && annonce.utilisateurId === user?.id)}
        >
          {isReservationLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              {(annonce && annonce.utilisateurId === user?.id) ? (
                <>
                  <Ionicons name="person" size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>VOTRE MISSION</Text>
                </>
              ) : (
                <>
                  <Ionicons name={hasReserved ? "close-circle" : "calendar"} size={22} color="#fff" />
                  <Text style={styles.actionButtonText}>{hasReserved ? "ANNULER" : "RÉSERVER"}</Text>
                </>
              )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    marginTop: 10,
    marginBottom: 0,
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
  ownerButton: {
    backgroundColor: '#757575',
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
