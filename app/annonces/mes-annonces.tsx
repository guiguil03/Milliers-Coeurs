import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAnnonce } from '../../hooks/useAnnonce';
import { Annonce } from '../../services/annonceFirebaseService';
import { Ionicons } from '@expo/vector-icons';
import AnnonceItem from '../../components/AnnonceItem';

export default function MesAnnoncesScreen() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getMyAnnonces } = useAnnonce();
  const router = useRouter();

  useEffect(() => {
    loadMyAnnonces();
  }, []);

  const loadMyAnnonces = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAnnonces = await getMyAnnonces();
      setAnnonces(fetchedAnnonces);
    } catch (err) {
      console.error('Erreur lors du chargement de mes annonces:', err);
      setError('Impossible de charger vos annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMyAnnonces();
    setRefreshing(false);
  };

  const navigateToDetail = (annonce: Annonce) => {
    if (annonce.id) {
      router.push(`/annonces/${annonce.id}`);
    }
  };

  const navigateToCreate = () => {
    router.push('/annonces/create');
  };

  const renderAnnonceItem = ({ item }: { item: Annonce }) => (
    <AnnonceItem 
      annonce={item}
      onPress={() => navigateToDetail(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Mes Annonces',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E0485A" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={annonces}
          renderItem={renderAnnonceItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Vous n'avez pas encore publié d'annonces</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={navigateToCreate}
              >
                <Text style={styles.createButtonText}>Créer une annonce</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
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
  createButton: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
