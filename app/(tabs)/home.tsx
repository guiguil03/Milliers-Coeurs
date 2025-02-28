import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const QuickAction = ({ icon, title }) => (
  <TouchableOpacity style={styles.quickAction}>
    <ThemedView style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color="#2196F3" />
    </ThemedView>
    <ThemedText style={styles.actionTitle}>{title}</ThemedText>
  </TouchableOpacity>
);

const FeaturedCard = ({ title, image, description }) => (
  <TouchableOpacity style={styles.featuredCard}>
    <ThemedView style={styles.cardContent}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <ThemedText style={styles.cardDescription}>{description}</ThemedText>
    </ThemedView>
  </TouchableOpacity>
);

export default function HomeContent() {
  return (
    <ScrollView style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  featuredScroll: {
    marginBottom: 30,
  },
  featuredCard: {
    width: 280,
    height: 180,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityList: {
    marginBottom: 20,
  },
});
