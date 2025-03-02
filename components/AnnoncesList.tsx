import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AnnoncesList: React.FC = () => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await annonceService.getAllAnnonces();
      setAnnonces(data);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
      setError('Impossible de charger les annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnnonces();
    setRefreshing(false);
  };

  const navigateToDetail = (annonce: Annonce) => {
    if (annonce.id) {
      // Naviguer vers la page de détails en utilisant expo-router
      router.push(`/annonces/${annonce.id}`);
    }
  };

  const renderAnnonceItem = ({ item }: { item: Annonce }) => {
    // Vérifier si l'annonce existe
    if (!item) return null;
    
    return (
      <TouchableOpacity 
        style={styles.annonceItem} 
        onPress={() => navigateToDetail(item)}
        activeOpacity={0.7}
      >
        <View style={styles.logoContainer}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.placeholderLogo]}>
              <Text style={styles.placeholderText}>
                {item.organisation?.substring(0, 2).toUpperCase() || 'AN'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.organisation}>{item.organisation || 'Organisation'}</Text>
            <Text style={styles.temps}>{"il y a quelques heures"}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'Aucune description'} 
            <Text style={styles.important}> {item.important || ''}</Text>
          </Text>
          
          {item.lieu && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{item.lieu}</Text>
            </View>
          )}
          
          {item.categorie && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{item.categorie}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={annonces}
      renderItem={renderAnnonceItem}
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      contentContainerStyle={styles.listContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Aucune annonce disponible</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  annonceItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderLogo: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  organisation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  temps: {
    fontSize: 12,
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    lineHeight: 20,
  },
  important: {
    fontWeight: 'bold',
    color: '#E0485A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
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
  retryButton: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default AnnoncesList;
