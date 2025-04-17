import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAnnonce, AnnonceWithFavori } from '../hooks/useAnnonce';
import { useAuthContext } from '../contexts/AuthContext';
import AnnonceCard from '../components/AnnonceCard';
import { Colors } from '../constants/Colors';

const FavorisScreen = () => {
  const [favoris, setFavoris] = useState<AnnonceWithFavori[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { getFavorisAnnonces, loading, error, removeFromFavoris } = useAnnonce();
  const { user } = useAuthContext();
  const router = useRouter();

  // Charger les favoris
  const loadFavoris = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      const annoncesEnFavoris = await getFavorisAnnonces();
      setFavoris(annoncesEnFavoris);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Charger les favoris au chargement de l'écran
  useEffect(() => {
    loadFavoris();
  }, [user]);

  // Gérer le retrait d'un favori
  const handleToggleFavorite = async (annonceId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Si on retire des favoris, mettre à jour l'UI immédiatement
      setFavoris(prev => prev.filter(annonce => annonce.id !== annonceId));
      
      // Puis effectuer l'opération en base de données
      await removeFromFavoris(annonceId);
    }
    
    // Recharger les favoris pour s'assurer que la liste est à jour
    loadFavoris();
  };

  // Naviguer vers le détail d'une annonce
  const navigateToDetail = (annonceId: string) => {
    router.push(`/annonce/details?id=${annonceId}`);
  };

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="person-circle-outline" size={60} color={Colors.light.tint} />
        <Text style={styles.messageText}>Connectez-vous pour voir vos favoris</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/profile')}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoris}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToDetail(item.id || '')}>
            <AnnonceCard 
              annonce={item} 
              onToggleFavorite={handleToggleFavorite}
            />
          </TouchableOpacity>
        )}
        refreshing={refreshing}
        onRefresh={loadFavoris}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Vous n'avez pas encore d'annonces en favoris</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.exploreButtonText}>Explorer les annonces</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={favoris.length === 0 ? styles.emptyListContent : styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  exploreButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FavorisScreen;
