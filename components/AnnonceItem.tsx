import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Annonce } from '../services/annonceFirebaseService';
import { useAuthContext } from '../contexts/AuthContext';
import { annonceService } from '../services/annonceFirebaseService';
import { useRouter } from 'expo-router';

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
  const { user } = useAuthContext();
  const router = useRouter();
  
  // S'assurer que l'annonce existe et extraire ses propriétés avec des valeurs par défaut
  if (!annonce) {
    return null; // Ne rien afficher si l'annonce est undefined
  }
  
  const { 
    logo, 
    organisation = 'Organisation', 
    description = 'Aucune description', 
    important = 'Information importante',
    utilisateurId
  } = annonce;
  
  // Vérifier si l'utilisateur connecté est le propriétaire de l'annonce
  const isOwner = user && utilisateurId && user.uid === utilisateurId;
  
  // Simulation d'un temps (à remplacer par un calcul réel du temps écoulé)
  const temps = "il y a quelques heures"; 

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
        <TouchableOpacity style={[styles.actionButton, styles.repondreButton]}>
          <Text style={styles.actionText}>RÉPONDRE</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.reserverButton]}>
          <Text style={styles.actionText}>RÉSERVER</Text>
          <Ionicons name="calendar-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.partagerButton]}>
          <Text style={styles.actionText}>PARTAGER</Text>
          <Ionicons name="arrow-redo-outline" size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.favorisButton]}>
          <Text style={styles.actionText}>FAVORIS</Text>
          <Ionicons name="heart-outline" size={18} color="#fff" />
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
