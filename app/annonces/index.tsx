import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import AnnoncesList from '../../components/AnnoncesList'; // Assurer que l'importation d'AnnoncesList est correcte
import { getCategoryById } from '../../constants/categories';
import { Ionicons } from '@expo/vector-icons';

export default function AnnoncesScreen() {
  const { categorie, location, count, searchMode } = useLocalSearchParams<{ 
    categorie?: string;
    location?: string; 
    count?: string;
    searchMode?: string;
  }>();
  
  // Obtenir les informations de la catégorie pour afficher le titre approprié
  const category = categorie ? getCategoryById(categorie) : null;
  let title = 'Annonces';
  
  if (location && categorie && searchMode === 'advanced') {
    title = 'Recherche avancée';
  } else if (location) {
    title = `Annonces - ${location}`;
  } else if (category) {
    title = `Annonces - ${category.name}`;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: title,
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      
      {/* Filtre de recherche avancée */}
      {searchMode === 'advanced' && (
        <View style={styles.filterInfo}>
          <Ionicons name="options" size={16} color="#444" style={styles.filterIcon} />
          <Text style={styles.filterText}>
            Recherche avancée
            {count && (
              <Text style={styles.countText}> • {count} résultat{parseInt(count) > 1 ? 's' : ''}</Text>
            )}
          </Text>
        </View>
      )}
      
      {/* Filtre par location uniquement */}
      {location && !searchMode && (
        <View style={styles.filterInfo}>
          <Ionicons name="map" size={16} color="#444" style={styles.filterIcon} />
          <Text style={styles.filterText}>
            Résultats pour <Text style={styles.filterValue}>{location}</Text>
            {count && (
              <Text style={styles.countText}> • {count} résultat{parseInt(count) > 1 ? 's' : ''}</Text>
            )}
          </Text>
        </View>
      )}
      
      {/* Filtre par catégorie uniquement */}
      {categorie && category && !location && !searchMode && (
        <View style={styles.filterInfo}>
          <Ionicons name={category.icon as any} size={16} color="#444" style={styles.filterIcon} />
          <Text style={styles.filterText}>
            Filtre actif: <Text style={styles.filterValue}>{category.name}</Text>
          </Text>
        </View>
      )}
      
      {/* Utilisation de la nouvelle structure de filtres */}
      {searchMode === 'advanced' ? (
        <AnnoncesList 
          filter={{ 
            search: { 
              location: location, 
              categorie: categorie 
            } 
          }} 
        />
      ) : (
        <AnnoncesList 
          filter={{ 
            location: location, 
            categorie: categorie 
          }} 
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
  filterInfo: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  filterValue: {
    fontWeight: 'bold',
    color: '#E0485A',
  },
  countText: {
    fontStyle: 'italic',
    color: '#666',
  },
});
