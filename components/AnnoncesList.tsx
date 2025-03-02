import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import { Ionicons } from '@expo/vector-icons';

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

  useEffect(() => {
    async function fetchAnnonces() {
      try {
        setLoading(true);
        setError(null);
        let result: Annonce[] = [];

        // Utiliser la nouvelle méthode de recherche avancée si des filtres sont fournis
        if (filter?.search) {
          // Utiliser la recherche avancée avec plusieurs filtres
          result = await annonceService.searchAnnonces({
            location: filter.search.location,
            categorie: filter.search.categorie,
          });
        } else if (filter?.location) {
          // Recherche par localisation uniquement
          result = await annonceService.searchAnnoncesByLocation(filter.location);
        } else if (filter?.categorie) {
          // Recherche par catégorie uniquement
          result = await annonceService.searchAnnoncesByCategory(filter.categorie);
        } else {
          // Pas de filtre, récupérer toutes les annonces
          result = await annonceService.getAnnonces();
        }
        
        setAnnonces(result);
      } catch (err) {
        console.error('Erreur lors de la récupération des annonces:', err);
        setError('Erreur lors de la récupération des annonces. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnnonces();
  }, [filter]);

  const renderAnnonceItem = ({ item }: { item: Annonce }) => (
    <TouchableOpacity 
      style={styles.annonceCard}
      onPress={() => router.push(`/annonce/details?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.annonceTitle} numberOfLines={2}>{item.titre}</Text>
        <Text style={styles.annonceOrganisation} numberOfLines={1}>{item.organisation}</Text>
      </View>
      
      <View style={styles.cardInfo}>
        {item.lieu && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.lieu}</Text>
          </View>
        )}
        
        {item.categorie && (
          <View style={styles.infoItem}>
            <Ionicons name="pricetag-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.categorie}</Text>
          </View>
        )}
      </View>
      
      {item.description && (
        <Text style={styles.annonceDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Chargement des annonces...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color="#E0485A" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  annonceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 10,
  },
  annonceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  annonceOrganisation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  annonceDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
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
    color: '#555',
  },
  suggestionText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default AnnoncesList;
