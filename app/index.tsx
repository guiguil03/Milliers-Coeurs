import { StyleSheet, ScrollView, View, Text } from 'react-native';
import AnnonceItem from '../components/AnnonceItem';
import { annonces } from '../data/annonces';

export default function HomePage() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Annonces de bénévolat</Text>
      </View>
      
      {annonces.map(annonce => (
        <AnnonceItem 
          key={annonce.id}
          {...annonce}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  }
});
