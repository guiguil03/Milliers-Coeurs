import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExplorerPage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Explorer les opportunités</Text>
      </View>

      <View style={styles.searchCity}>
        <Ionicons name="map" size={24} color="black" />
        <TextInput
          style={styles.searchInput}
          placeholder="Ville ou Code Postal"
          placeholderTextColor="#999"
        />
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="black" />
          <Text> Rechercher</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container1}>
        <Ionicons style={styles.person} name="person-outline" size={24} color="black" />
        <Text  style={styles.title}> Types de Mission</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <TouchableOpacity style={styles.categoryCard}>
          <Ionicons name="paw-outline" size={36} color="#E0485A" />
          <Text style={styles.categoryTitle}>Animaux</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryCard}>
          <Ionicons name="people-outline" size={36} color="#E0485A" />
          <Text style={styles.categoryTitle}>Social</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryCard}>
          <Ionicons name="leaf-outline" size={36} color="#E0485A" />
          <Text style={styles.categoryTitle}>Environnement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryCard}>
          <Ionicons name="book-outline" size={36} color="#E0485A" />
          <Text style={styles.categoryTitle}>Éducation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.categoryCard}>
          <Ionicons name="medical-outline" size={36} color="#E0485A" />
          <Text style={styles.categoryTitle}>Santé</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
 },
 container1:{
  display:'flex',
  flexDirection:'row',
  padding:30,
 },
  person:{
    display :'flex',
    flexDirection : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 100,
  },
  titleContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    width: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  searchCity:{
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',


  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  }

});
