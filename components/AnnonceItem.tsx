import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Annonce } from '../services/annonceFirebaseService';
import { useAuthContext } from '../contexts/AuthContext';
import { annonceService } from '../services/annonceFirebaseService';
import { useRouter } from 'expo-router';
import { reservationService } from '../services/reservationService';
import { useAnnonce } from '../hooks/useAnnonce';

// Propriétés nécessaires pour le composant
interface AnnonceItemProps {
  annonce: Annonce;
  onPress?: () => void;
  onDelete?: () => void;
}

const AnnonceItem: React.FC<AnnonceItemProps> = ({ 
  annonce,
  onPress,
  onDelete
}) => {
  const { user, userType } = useAuthContext();
  const router = useRouter();
  const [isReserving, setIsReserving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { addToFavoris, removeFromFavoris, isFavori } = useAnnonce();
  
  // S'assurer que l'annonce existe et extraire ses propriétés avec des valeurs par défaut
  if (!annonce) {
    return null; // Ne rien afficher si l'annonce est undefined
  }
  
  const { 
    logo, 
    organisation = 'Organisation', 
    description = 'Aucune description', 
    important = 'Information importante',
    utilisateurId,
    id: annonceId
  } = annonce;
  
  // Vérifier si l'utilisateur connecté est le propriétaire de l'annonce
  const isOwner = user && utilisateurId && user.uid === utilisateurId;
  
  // Formater la date de création pour afficher la date réelle
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date inconnue';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };
  
  const temps = annonce.dateCreation ? formatDate(annonce.dateCreation) : 'Date inconnue';
  
  // Vérifier si l'annonce est en favoris
  useEffect(() => {
    const checkFavoriStatus = async () => {
      if (user && annonce.id) {
        try {
          const status = await isFavori(annonce.id);
          setIsFavorite(status);
        } catch (error) {
          console.error('Erreur lors de la vérification du statut favori:', error);
        }
      }
    };
    
    checkFavoriStatus();
  }, [user, annonce.id]);

  // Fonction pour supprimer l'annonce
  const handleDelete = () => {
    if (!isOwner) return;
    
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
                if (onDelete) {
                  onDelete();
                }
                Alert.alert("Succès", "L'annonce a été supprimée avec succès.");
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

  // Fonction pour gérer la réservation
  const handleReservation = async () => {
    console.log('🚀 [RESERVATION] === RÉSERVATION DIRECTE ===');
    console.log('🚀 [RESERVATION] User:', user?.uid, user?.email);
    console.log('🚀 [RESERVATION] AnnonceId:', annonceId);

    // Vérifications préliminaires
    if (!user) {
      console.log('❌ [RESERVATION] Pas d\'utilisateur connecté');
      return;
    }

    if (!annonceId) {
      console.log('❌ [RESERVATION] Pas d\'ID d\'annonce');
      return;
    }

    try {
      setIsReserving(true);
      console.log('🚀 [RESERVATION] Début création réservation...');

      // Vérification anti-double réservation
      console.log('🔍 [RESERVATION] Vérification réservation existante...');
      const hasExisting = await reservationService.hasExistingReservation(user.uid, annonceId);
      console.log('🔍 [RESERVATION] Résultat vérification:', hasExisting);

      if (hasExisting) {
        console.log('⚠️ [RESERVATION] Réservation déjà existante');
        alert("Vous avez déjà réservé cette mission !");
        setIsReserving(false);
        return;
      }

      // Données de réservation
      const reservationData = {
        annonceId: annonceId,
        benevoleId: user.uid,
        benevoleName: user.displayName || user.email || 'Bénévole',
        benevoleEmail: user.email || '',
        message: `Réservation pour: ${description || 'Mission'}`
      };

      console.log('📝 [RESERVATION] Données de réservation:', reservationData);

      // Création de la réservation DIRECTE
      console.log('🚀 [RESERVATION] Création réservation...');
      const reservationId = await reservationService.createReservation(reservationData);
      console.log('🎉 [RESERVATION] Réservation créée! ID:', reservationId);

      // Vérification immédiate
      console.log('🔍 [RESERVATION] Vérification immédiate...');
      const verification = await reservationService.getReservationById(reservationId);
      console.log('🔍 [RESERVATION] Vérification:', verification ? 'TROUVÉE' : 'NON TROUVÉE');

      // Test récupération liste utilisateur
      console.log('📋 [RESERVATION] Test récupération liste utilisateur...');
      const userReservations = await reservationService.getReservationsByUser(user.uid);
      console.log('📋 [RESERVATION] Réservations utilisateur:', userReservations.length);

      // Succès - utiliser alert simple qui fonctionne partout
      console.log('🎉 [RESERVATION] SUCCÈS - Affichage confirmation');
      alert(`🎉 RÉSERVATION CONFIRMÉE !\n\nID: ${reservationId}\n\nAllez dans l'onglet "Réservations" pour voir votre réservation !`);

      // Navigation automatique vers les réservations après 2 secondes
      setTimeout(() => {
        console.log('📱 [RESERVATION] Navigation automatique vers réservations');
        if (router) {
          router.push("/(tabs)/reservations");
        }
      }, 2000);

    } catch (error) {
      console.error('💥 [RESERVATION] Erreur:', error);
      alert(`❌ Erreur lors de la réservation: ${error}`);
      setIsReserving(false);
    } finally {
      setIsReserving(false);
    }

    console.log('🏁 [RESERVATION] === FIN RÉSERVATION ===');
  };

  // Fonction pour gérer la réponse
  const handleRepondre = () => {
    if (onPress) {
      onPress(); // Rediriger vers la page de détail de l'annonce
    }
  };
  
  // Fonction pour gérer les favoris
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
    
    if (isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      if (isFavorite) {
        await removeFromFavoris(annonceId || '');
        setIsFavorite(false);
        Alert.alert("Succès", "L'annonce a été retirée de vos favoris.");
      } else {
        await addToFavoris(annonceId || '');
        setIsFavorite(true);
        Alert.alert("Succès", "L'annonce a été ajoutée à vos favoris.");
      }
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la modification des favoris.");
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.annonceContainer} 
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.orgInfo}>
          <View style={[styles.logo, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logo} />
            ) : (
              <Ionicons name="person" size={24} color="#999" />
            )}
          </View>
          <View style={styles.orgText}>
            <Text style={styles.orgName}>{organisation} a publié...</Text>
            <Text style={styles.timeAgo}>{temps}</Text>
          </View>
        </View>
        
        {isOwner && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={20} color="#E0485A" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          {description} <Text style={styles.important}>{important}</Text> !
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.repondreButton]} 
          onPress={handleRepondre}
        >
          <Text style={styles.actionText}>RÉPONDRE</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.reserverButton]} 
          onPress={handleReservation}
          disabled={isReserving}
        >
          {isReserving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.actionText}>RÉSERVER</Text>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.partagerButton]}>
          <Text style={styles.actionText}>PARTAGER</Text>
          <Ionicons name="arrow-redo-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.favorisButton]}
          onPress={handleToggleFavorite}
          disabled={isTogglingFavorite}
        >
          {isTogglingFavorite ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.actionText}>FAVORIS</Text>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={18} 
                color="#fff" 
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  annonceContainer: {
    backgroundColor: '#fff',
    width: screenWidth,
    marginVertical: 10,
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  orgText: {
    marginLeft: 10,
  },
  orgName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  important: {
    fontWeight: 'bold',
    color: '#E0485A',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    margin: 1,
  },
  repondreButton: {
    backgroundColor: '#4CAF50',
  },
  reserverButton: {
    backgroundColor: '#03A9F4',
  },
  partagerButton: {
    backgroundColor: '#FF9800',
  },
  favorisButton: {
    backgroundColor: '#E0485A',
  },
  actionText: {
    marginRight: 5,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteButton: {
    padding: 5,
  }
});

export default AnnonceItem;
