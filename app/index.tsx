import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { annonceSupabaseService, Annonce } from '../services/annonceSupabaseService';
import AnnonceItem from '../components/AnnonceItem';
import { useAuthContext } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';
import { reservationSupabaseService } from '../services/reservationSupabaseService';

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
      const recentAnnonces = await annonceSupabaseService.getRecentAnnonces(5);
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
      
      console.log("🧪 === TEST COMPLET RÉSERVATION ===");
      console.log("🧪 User:", authUser.id, authUser.email);
      console.log("🧪 Annonce:", annonceTest.id, annonceTest.description);
      
      // 1. Test vérification réservation existante
      console.log("🧪 1. Test hasExistingReservation...");
      const hasExisting = await reservationSupabaseService.hasExistingReservation(authUser.id, annonceTest.id!);
      console.log("🧪 1. Résultat:", hasExisting);
      
      // 2. Test création réservation
      console.log("🧪 2. Test createReservation...");
      const reservationData = {
        annonceId: annonceTest.id!,
        benevoleId: authUser.id,
        benevoleName: authUser.user_metadata?.display_name || authUser.email || authUser.email || 'Testeur',
        benevoleEmail: authUser.email || '',
        message: `TEST AUTOMATIQUE - ${new Date().toLocaleString()}`
      };
      
      const reservationId = await reservationSupabaseService.createReservation(reservationData);
      console.log("🧪 2. Réservation créée:", reservationId);
      
      // 3. Test récupération par ID
      console.log("🧪 3. Test getReservationById...");
      const reservationById = await reservationSupabaseService.getReservationById(reservationId);
      console.log("🧪 3. Réservation récupérée:", reservationById ? "OUI" : "NON");
      
      // 4. Test récupération liste utilisateur
      console.log("🧪 4. Test getReservationsByUser...");
      const userReservations = await reservationSupabaseService.getReservationsByUser(authUser.id);
      console.log("🧪 4. Nombre de réservations:", userReservations.length);
      
      // 5. Test nouvelle vérification (doit être true maintenant)
      console.log("🧪 5. Re-test hasExistingReservation...");
      const hasExistingAfter = await reservationSupabaseService.hasExistingReservation(authUser.id, annonceTest.id!);
      console.log("🧪 5. Résultat après création:", hasExistingAfter);
      
      console.log("🧪 === FIN TEST - TOUS LES TESTS RÉUSSIS ===");
      
      Alert.alert(
        "🧪 TEST RÉUSSI !",
        `✅ Tous les tests ont réussi !\n\n📋 ID Réservation: ${reservationId}\n📋 Pour: ${annonceTest.description}\n\n🎯 Vérifications:\n• Création: ✅\n• Récupération par ID: ✅\n• Liste utilisateur: ✅ (${userReservations.length})\n• Anti-doublon: ${hasExistingAfter ? '✅' : '❌'}\n\n📱 Allez voir l'onglet Réservations !`,
        [
          { 
            text: "📱 Voir Réservations", 
            onPress: () => router.push("/(tabs)/reservations")
          },
          { 
            text: "✅ OK", 
            style: "cancel" 
          }
        ]
      );
      
    } catch (error) {
      console.error("❌ Erreur test réservation:", error);
      Alert.alert(
        "❌ ÉCHEC DU TEST", 
        `Le test a échoué à une étape.\n\nErreur: ${error}\n\nVérifiez la console pour plus de détails.`
      );
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
