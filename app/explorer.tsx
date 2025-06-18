import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MISSION_CATEGORIES } from '../constants/categories';
import { annonceSupabaseService } from '../services/annonceSupabaseService';

export default function ExplorerPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Si la catégorie est déjà sélectionnée, la désélectionner
      setSelectedCategory(null);
    } else {
      // Sinon, sélectionner cette catégorie
      setSelectedCategory(categoryId);
    }
  };

  const handleSearch = async () => {
    try {
      if (!searchQuery && !selectedCategory) {
        Alert.alert('Recherche vide', 'Veuillez entrer un lieu ou sélectionner une catégorie.');
        return;
      }

      setLoading(true);

      // Construire les filtres de recherche
      const searchFilters: {
        location?: string;
        categorie?: string;
      } = {};

      if (searchQuery.trim()) {
        searchFilters.location = searchQuery.trim();
      }

      if (selectedCategory) {
        searchFilters.categorie = selectedCategory;
      }

      // Effectuer la  
      const results = await annonceSupabaseService.searchAnnonces(searchFilters);
      
      // Naviguer vers la page des résultats avec les paramètres de recherche
      router.push({
        pathname: '/annonces',
        params: {
          ...(searchQuery ? { location: searchQuery } : {}),
          ...(selectedCategory ? { categorie: selectedCategory } : {}),
          count: String(results.length),
          searchMode: 'advanced'
        }
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la recherche. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Explorer les missions',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/')}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#E0485A" />
            </TouchableOpacity>
          ),
          headerBackTitleVisible: false,
        }} 
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Trouver une mission</Text>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ville ou code postal"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.searchButtonText}>Rechercher</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.filterTitle}>Type de mission</Text>
          <View style={styles.categoriesGrid}>
            {MISSION_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={[
                  styles.categoryIconContainer,
                  selectedCategory === category.id && styles.selectedCategoryIconContainer
                ]}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={28} 
                    color={selectedCategory === category.id ? "#FFF" : "#E0485A"} 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#E0485A',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#444',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCategoryCard: {
    backgroundColor: '#fce4e7',
    borderColor: '#E0485A',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCategoryIconContainer: {
    backgroundColor: '#E0485A',
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  selectedCategoryName: {
    fontWeight: 'bold',
    color: '#E0485A',
  },
  popularSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  popularCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
  },
  popularCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularCardText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#444',
  },
});
