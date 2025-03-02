import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useAnnonce } from '../hooks/useAnnonce';
import { Annonce } from '../services/annonceFirebaseService';
import AnnonceItem from '../components/AnnonceItem';
import { useRouter } from 'expo-router';

const AnnoncesScreen: React.FC = () => {
  const [myAnnonces, setMyAnnonces] = useState<Annonce[]>([]);
  const [allAnnonces, setAllAnnonces] = useState<Annonce[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  
  const { 
    getMyAnnonces, 
    getAllAnnonces, 
    loading, 
    error 
  } = useAnnonce();
  
  const router = useRouter();

  const loadData = async () => {
    // Charger toutes les annonces
    const fetchedAllAnnonces = await getAllAnnonces();
    setAllAnnonces(fetchedAllAnnonces);
    
    // Charger mes annonces
    const fetchedMyAnnonces = await getMyAnnonces();
    setMyAnnonces(fetchedMyAnnonces);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAnnoncePress = (annonce: Annonce) => {
    // Naviguer vers les détails de l'annonce
    router.push({
      pathname: '/annonce/details',
      params: { id: annonce.id }
    });
  };

  const handleCreatePress = () => {
    // Naviguer vers le formulaire de création
    router.push('/annonce/create');
  };

  const renderAnnonce = ({ item }: { item: Annonce }) => (
    <AnnonceItem 
      annonce={item} 
      onPress={() => handleAnnoncePress(item)}
    />
  );

  const annoncesToDisplay = activeTab === 'all' ? allAnnonces : myAnnonces;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Annonces de bénévolat</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreatePress}
        >
          <Text style={styles.createButtonText}>+ Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'all' && styles.activeTabButton
          ]} 
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'all' && styles.activeTabButtonText
          ]}>
            Toutes les annonces
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'my' && styles.activeTabButton
          ]} 
          onPress={() => setActiveTab('my')}
        >
          <Text style={[
            styles.tabButtonText, 
            activeTab === 'my' && styles.activeTabButtonText
          ]}>
            Mes annonces
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0485A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={annoncesToDisplay}
          renderItem={renderAnnonce}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E0485A']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'all' 
                  ? 'Aucune annonce disponible pour le moment'
                  : 'Vous n\'avez pas encore créé d\'annonces'}
              </Text>
              {activeTab === 'my' && (
                <TouchableOpacity 
                  style={styles.emptyButton} 
                  onPress={handleCreatePress}
                >
                  <Text style={styles.emptyButtonText}>Créer une annonce</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#E0485A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTabButton: {
    backgroundColor: '#E0485A',
  },
  tabButtonText: {
    fontWeight: '500',
    color: '#555',
  },
  activeTabButtonText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#E0485A',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AnnoncesScreen;
