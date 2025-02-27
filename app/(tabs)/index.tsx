import { StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

const FeaturedCard = ({ title, image, description }) => (
  <TouchableOpacity style={styles.featuredCard}>
    <Image source={{ uri: image }} style={styles.featuredImage} />
    <ThemedView style={styles.featuredContent}>
      <ThemedText style={styles.featuredTitle}>{title}</ThemedText>
      <ThemedText style={styles.featuredDescription}>{description}</ThemedText>
    </ThemedView>
  </TouchableOpacity>
);

const QuickAction = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <ThemedView style={styles.quickActionIcon}>
      <Ionicons name={icon} size={24} color="#2196F3" />
    </ThemedView>
    <ThemedText style={styles.quickActionTitle}>{title}</ThemedText>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <ThemedView style={styles.mainContent}>
          <ThemedText style={styles.welcomeText}>Bonjour, John! 👋</ThemedText>
          
          <ThemedView style={styles.quickActions}>
            <QuickAction icon="camera-outline" title="Nouvelle photo" />
            <QuickAction icon="people-outline" title="Amis" />
            <QuickAction icon="bookmark-outline" title="Sauvegardés" />
            <QuickAction icon="search-outline" title="Explorer" />
          </ThemedView>

          <ThemedText style={styles.sectionTitle}>À la une</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            <FeaturedCard
              title="Photographie"
              image="https://via.placeholder.com/300x200"
              description="Découvrez les dernières tendances en photographie"
            />
            <FeaturedCard
              title="Tutoriels"
              image="https://via.placeholder.com/300x200"
              description="Apprenez de nouvelles techniques"
            />
            <FeaturedCard
              title="Événements"
              image="https://via.placeholder.com/300x200"
              description="Participez aux prochains événements"
            />
          </ScrollView>

          <ThemedText style={styles.sectionTitle}>Activité récente</ThemedText>
          <ThemedView style={styles.activityList}>
            {/* Activités récentes ici */}
          </ThemedView>
        </ThemedView>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickAction: {
    alignItems: 'center',
    width: '23%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuredScroll: {
    marginBottom: 30,
  },
  featuredCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 150,
  },
  featuredContent: {
    padding: 15,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityList: {
    marginTop: 10,
  },
});
