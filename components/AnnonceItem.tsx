import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Annonce } from '../services/annonceFirebaseService';

// Propriétés nécessaires pour le composant
interface AnnonceItemProps {
  annonce: Annonce;
  onPress?: () => void;
}

const AnnonceItem: React.FC<AnnonceItemProps> = ({ 
  annonce,
  onPress 
}) => {
  // S'assurer que l'annonce existe et extraire ses propriétés avec des valeurs par défaut
  if (!annonce) {
    return null; // Ne rien afficher si l'annonce est undefined
  }
  
  const { 
    logo, 
    organisation = 'Organisation', 
    description = 'Aucune description', 
    important = 'Information importante'
  } = annonce;
  
  // Simulation d'un temps (à remplacer par un calcul réel du temps écoulé)
  const temps = "il y a quelques heures"; 

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
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          {description} <Text style={styles.important}>{important}</Text> !
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.repondreButton]}>
          <Text style={styles.actionText}>RÉPONDRE</Text>
          <Ionicons name="chatbubble-outline" size={18} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.reserverButton]}>
          <Text style={styles.actionText}>RÉSERVER</Text>
          <Ionicons name="calendar-outline" size={18} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.partagerButton]}>
          <Text style={styles.actionText}>PARTAGER</Text>
          <Ionicons name="arrow-redo-outline" size={18} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.favorisButton]}>
          <Text style={styles.actionText}>FAVORIS</Text>
          <Ionicons name="heart-outline" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  annonceContainer: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  orgText: {
    marginLeft: 10,
  },
  orgName: {
    fontWeight: 'bold',
  },
  timeAgo: {
    color: '#666',
    fontSize: 12,
  },
  content: {
    padding: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  important: {
    fontWeight: 'bold',
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
    padding: 10,
    margin: 2,
    borderRadius: 4,
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
  }
});

export default AnnonceItem;
