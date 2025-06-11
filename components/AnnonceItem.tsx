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
    console.log('🔵 [DEBUG] handleReservation appelée');
    console.log('🔵 [DEBUG] User:', user ? 'connecté' : 'non connecté');
    console.log('🔵 [DEBUG] AnnonceId:', annonceId);
    console.log('🔵 [DEBUG] IsOwner:', isOwner);
    
    if (!user) {
      console.log('🔴 [DEBUG] Utilisateur non connecté');
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

    if (isOwner) {
      console.log('🔴 [DEBUG] L\'utilisateur est propriétaire de l\'annonce');
      Alert.alert(
        "Action non disponible",
        "Vous ne pouvez pas réserver votre propre annonce."
      );
      return;
    }

    try {
      console.log('🟡 [DEBUG] Début du processus de réservation');
      setIsReserving(true);
      console.log('[Réservation] Vérification si déjà réservé...');
      
      const hasReserved = await reservationService.hasExistingReservation(user.uid, annonceId || '');
      console.log('🔵 [DEBUG] A déjà réservé:', hasReserved);
      
      if (hasReserved) {
        console.log('🔴 [DEBUG] L\'utilisateur a déjà réservé');
        Alert.alert(
          "Déjà réservé",
          "Vous avez déjà réservé une place pour cette mission. Vous pouvez consulter vos réservations dans votre profil."
        );
        return;
      }
      
      console.log('🟢 [DEBUG] Affichage de la confirmation');
      
      // Réinitialiser l'état avant d'afficher la popup
      setIsReserving(false);
      
      // Confirmation utilisateur
      Alert.alert(
        "🎯 Réserver une place",
        "Voulez-vous réserver une place pour cette mission ?",
        [
          { 
            text: "❌ Annuler", 
            style: "cancel", 
            onPress: () => console.log('🔴 [DEBUG] Réservation annulée par l\'utilisateur') 
          },
          {
            text: "✅ Confirmer",
            onPress: async () => {
              try {
                console.log('🟢 [DEBUG] Confirmation par l\'utilisateur');
                console.log('[Réservation] Création de la réservation...');
                
                const reservationData = {
                  annonceId: annonceId || '',
                  benevoleId: user.uid,
                  benevoleName: user.displayName || user.email || 'Bénévole',
                  benevoleEmail: user.email || '',
                  message: 'Réservation depuis la liste des annonces'
                };
                
                const reservationId = await reservationService.createReservation(reservationData);
                console.log('✅ [DEBUG] Réservation créée avec succès, ID:', reservationId);
                
                Alert.alert(
                  "🎉 Réservation Confirmée !",
                  `Votre réservation a été enregistrée avec succès !\n\n📋 Numéro : ${reservationId}\n\n✅ Statut : En attente de confirmation\n\nConsultez l'onglet "Réservations" pour suivre votre demande.`,
                  [
                    { 
                      text: "📱 Voir mes réservations", 
                      onPress: () => {
                        // Navigation vers l'onglet réservations
                        if (router) {
                          router.push("/(tabs)/reservations");
                        }
                      }
                    },
                    { 
                      text: "✅ OK", 
                      style: "cancel" 
                    }
                  ]
                );
              } catch (error) {
                console.error("🔴 [DEBUG] Erreur lors de la réservation:", error);
                Alert.alert(
                  "❌ Erreur", 
                  `Impossible de créer la réservation.\n\nErreur: ${error}\n\nVeuillez réessayer.`
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("🔴 [DEBUG] Erreur lors de la vérification de réservation:", error);
      Alert.alert("❌ Erreur", "Une erreur est survenue. Veuillez réessayer.");
      setIsReserving(false);
    }
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
