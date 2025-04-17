import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Annonce } from '../services/annonceFirebaseService';
import { AnnonceWithFavori } from '../hooks/useAnnonce';
import FavoriteButton from './FavoriteButton';

interface AnnonceCardProps {
  annonce: Annonce | AnnonceWithFavori;
  onToggleFavorite?: (annonceId: string, isFavorite: boolean) => void;
}

const AnnonceCard: React.FC<AnnonceCardProps> = ({ annonce, onToggleFavorite }) => {
  // Fonction pour raccourcir la description si nécessaire
  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {annonce.logo ? (
          <Image source={{ uri: annonce.logo }} style={styles.logo} />
        ) : (
          <View style={styles.placeholderLogo}>
            <Ionicons name="briefcase-outline" size={20} color="#666" />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.organisation}>{annonce.organisation}</Text>
          {annonce.temps && <Text style={styles.time}>{annonce.temps}</Text>}
        </View>
        
        {/* Bouton Favoris */}
        <View style={styles.favoriteButton}>
          <FavoriteButton 
            annonceId={annonce.id || ''} 
            initialIsFavorite={'isFavori' in annonce ? annonce.isFavori : false}
            onToggle={(isFavorite) => onToggleFavorite && onToggleFavorite(annonce.id || '', isFavorite)}
          />
        </View>
      </View>
      
      <Text style={styles.title}>{annonce.titre || 'Sans titre'}</Text>
      
      <Text style={styles.description}>
        {truncateDescription(annonce.description)}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{annonce.date || 'Date non spécifiée'}</Text>
        </View>
        
        {annonce.lieu && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{annonce.lieu}</Text>
          </View>
        )}
        
        {annonce.categorie && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{annonce.categorie}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  organisation: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  categoryTag: {
    backgroundColor: '#E0485A15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  categoryText: {
    fontSize: 12,
    color: '#E0485A',
    fontWeight: '500',
  },
});

export default AnnonceCard;
