import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { annonceService, Annonce } from '../../services/annonceFirebaseService';
import { getCategoryById, getCategoryByName } from '../../constants/categories';
import { useAuthContext } from '../../contexts/AuthContext';

export default function AnnonceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!id) {
      setError('ID de l\'annonce non spécifié');
      setLoading(false);
      return;
    }

    loadAnnonceDetails();
  }, [id]);

  const loadAnnonceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const annonceDetails = await annonceService.getAnnonceById(id as string);
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

  const handleReservation = () => {
    // À implémenter
    Alert.alert(
      "Réservation",
      "Voulez-vous vraiment réserver une place pour cette mission ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => Alert.alert("Réservation confirmée", "Votre réservation a été prise en compte.") }
      ]
    );
  };

  const handleContact = () => {
    // À implémenter
    Alert.alert(
      "Contact",
      "Souhaitez-vous contacter l'organisateur ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: () => Alert.alert("Message", "Une fenêtre de message va s'ouvrir.") }
      ]
    );
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
          style={[styles.actionButton, styles.reserverButton]}
          onPress={handleReservation}
        >
          <Ionicons name="calendar" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>RÉSERVER</Text>
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
        >
          <Ionicons name="heart" size={22} color="#fff" />
          <Text style={styles.actionButtonText}>FAVORIS</Text>
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
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  imagesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  additionalImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  reserverButton: {
    backgroundColor: '#4CAF50',
  },
  contactButton: {
    backgroundColor: '#03A9F4',
  },
  favorisButton: {
    backgroundColor: '#E0485A',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  errorText: {
    fontSize: 16,
    color: '#E0485A',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#E0485A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginBottom: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
