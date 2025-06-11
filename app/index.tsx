import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { annonceService, Annonce } from '../services/annonceFirebaseService';
import AnnonceItem from '../components/AnnonceItem';
import { useAuthContext } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';
import { reservationService } from '../services/reservationService';

export default function HomePage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, userType } = useAuthContext();
  const { user: authUser } = useAuth();
  const [isTestingReservation, setIsTestingReservation] = useState(false);

  useEffect(() => {
    loadRecentAnnonces();
  }, []);

  const loadRecentAnnonces = async () => {
    try {
      setLoading(true);
      setError(null);
      const recentAnnonces = await annonceService.getRecentAnnonces(5);
      setAnnonces(recentAnnonces);
    } catch (err) {
      console.error('Erreur lors du chargement des annonces:', err);
      setError('Impossible de charger les annonces. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const testReservation = async () => {
    if (!authUser) {
      Alert.alert("Erreur", "Vous devez être connecté pour tester les réservations");
      return;
    }

    if (annonces.length === 0) {
      Alert.alert("Erreur", "Aucune annonce disponible pour le test");
      return;
    }

    try {
      setIsTestingReservation(true);
      
      // Prendre la première annonce disponible
      const annonceTest = annonces[0];
      
      console.log("🧪 Test réservation pour annonce:", annonceTest.id);
      
      const reservationData = {
        annonceId: annonceTest.id!,
        benevoleId: authUser.uid,
        benevoleName: authUser.displayName || authUser.email || 'Testeur',
        benevoleEmail: authUser.email || '',
        message: `Test de réservation - ${new Date().toLocaleString()}`
      };
      
      const reservationId = await reservationService.createReservation(reservationData);
      
      Alert.alert(
        "🧪 Test Réussi !",
        `Réservation de test créée avec succès !\n\nID: ${reservationId}\nPour: ${annonceTest.titre}\n\nAllez voir l'onglet Réservations !`,
        [
          { 
            text: "Voir Réservations", 
            onPress: () => router.push("/(tabs)/reservations")
          },
          { 
            text: "OK", 
            style: "cancel" 
          }
        ]
      );
      
    } catch (error) {
      console.error("❌ Erreur test réservation:", error);
      Alert.alert("Erreur", `Echec du test: ${error}`);
    } finally {
      setIsTestingReservation(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Accueil',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => null,
          gestureEnabled: false,
        }} 
      />
      <ScrollView style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Annonces de bénévolat</Text>
          <Link href="/annonces" asChild>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Voir tout</Text>
              <Ionicons name="chevron-forward" size={16} color="#E0485A" />
            </TouchableOpacity>
          </Link>
        </View>

        <Link href="/annonces/create" asChild>
          <TouchableOpacity style={styles.createButton}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Créer une annonce</Text>
          </TouchableOpacity>
        </Link>
        
        {/* Bouton de test pour créer des annonces de démonstration */}
        {authUser && (
          <TouchableOpacity 
            style={{
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 10,
              marginTop: 10,
              marginBottom: 10,
              opacity: isTestingReservation ? 0.5 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3
            }}
            onPress={testReservation}
            disabled={isTestingReservation}
          >
            <Text style={{ 
              color: 'white', 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: 16
            }}>
              {isTestingReservation ? '🧪 Test en cours...' : '🧪 TESTER LES RÉSERVATIONS'}
            </Text>
            <Text style={{ 
              color: 'white', 
              textAlign: 'center', 
              fontSize: 12,
              marginTop: 5,
              opacity: 0.9
            }}>
              Créer une réservation de test et la voir dans l'onglet
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E0485A" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadRecentAnnonces}
          >
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : annonces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune annonce disponible</Text>
          <TouchableOpacity 
            style={styles.createEmptyButton}
            onPress={() => router.push('/annonces/create')}
          >
            <Text style={styles.createEmptyText}>Créer la première annonce</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.annoncesSection}>
          <Text style={styles.sectionTitle}>
            {userType === 'association' 
              ? 'Vos annonces récentes' 
              : 'Annonces récentes'}
          </Text>
          {annonces.map(annonce => (
            <AnnonceItem 
              key={annonce.id}
              annonce={annonce}
              onPress={() => router.push(`/annonce/details?id=${annonce.id}`)}
            />
          ))}
        </View>
      )}
      </ScrollView>
    </>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#E0485A',
    fontSize: 14,
    marginRight: 2,
  },
  createButton: {
    backgroundColor: '#E0485A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 5,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E0485A',
    marginBottom: 16,
    textAlign: 'center',
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
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  createEmptyButton: {
    backgroundColor: '#E0485A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createEmptyText: {
    color: 'white',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  annoncesSection: {
    backgroundColor: '#fff',
    marginVertical: 15,
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    paddingHorizontal: 16,
  },
});
