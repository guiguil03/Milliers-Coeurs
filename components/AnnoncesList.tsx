import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import { Ionicons } from '@expo/vector-icons';
import AnnonceItem from './AnnonceItem';

type AnnonceListFilterProps = {
  categorie?: string;
  location?: string;
  search?: {
    location?: string;
    categorie?: string;
  };
}

type Props = {
  filter?: AnnonceListFilterProps;
};

const AnnoncesList: React.FC<Props> = ({ filter }) => {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchAnnonces = async () => {
    try {
      setLoading(true);
      setError(null);
      let result: Annonce[] = [];

      if (filter?.search) {
        result = await annonceService.searchAnnonces({
          location: filter.search.location,
          categorie: filter.search.categorie,
        });
      } else if (filter?.location) {          result = await annonceService.searchAnnoncesByLocation(filter.location);
      } else if (filter?.categorie) {
        result = await annonceService.searchAnnoncesByCategory(filter.categorie);
      } else {
        result = await annonceService.getAnnonces();
      }
      
      setAnnonces(result);
    } catch (err) {
      console.error('Erreur lors de la récupération des annonces:', err);
      setError('Erreur lors de la récupération des annonces. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnonces();
  }, [filter]);

  const handleAnnoncePress = (annonceId: string | undefined) => {
    if (annonceId) {
      router.push(`/annonce/details?id=${annonceId}`);
    }
  };

  const handleAnnonceDelete = (deletedAnnonceId: string | undefined) => {
    if (deletedAnnonceId) {
      // Mettre à jour la liste locale sans avoir à refaire un appel au serveur
      setAnnonces(prevAnnonces => 
        prevAnnonces.filter(annonce => annonce.id !== deletedAnnonceId)
      );
    }
  };

  const renderAnnonceItem = ({ item }: { item: Annonce }) => (
    <AnnonceItem 
      annonce={item} 
      onPress={() => handleAnnoncePress(item.id)}
      onDelete={() => handleAnnonceDelete(item.id)}
    />
  );


  if (annonces.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="search-outline" size={40} color="#666" />
        <Text style={styles.emptyText}>Aucune annonce trouvée</Text>
        {(filter?.location || filter?.categorie || filter?.search) && (
          <Text style={styles.suggestionText}>
            Essayez de modifier vos critères de recherche
          </Text>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={annonces}
      renderItem={renderAnnonceItem}
      keyExtractor={(item) => item.id || Math.random().toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    width: screenWidth,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#E0485A',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  suggestionText: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default AnnoncesList;
