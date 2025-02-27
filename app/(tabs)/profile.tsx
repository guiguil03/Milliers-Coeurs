import { StyleSheet, SafeAreaView, View, Image } from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ThemedView style={styles.content}>
        <ThemedView style={styles.mainContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
            </View>
            <ThemedText style={styles.name}>John Doe</ThemedText>
            <ThemedText style={styles.email}>john.doe@example.com</ThemedText>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>42</ThemedText>
              <ThemedText style={styles.statLabel}>Publications</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>1.2k</ThemedText>
              <ThemedText style={styles.statLabel}>Abonnés</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>890</ThemedText>
              <ThemedText style={styles.statLabel}>Abonnements</ThemedText>
            </View>
          </View>

          <ThemedView style={styles.bioContainer}>
            <ThemedText style={styles.bioTitle}>À propos</ThemedText>
            <ThemedText style={styles.bioText}>
              Passionné de photographie et de voyages. Je partage mes aventures et mes découvertes à travers le monde.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
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
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  bioContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
