import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import MesReservationsScreen from '../screens/MesReservationsScreen';
import { useAuthContext } from '../contexts/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MesReservationsPage() {
  const { user } = useAuthContext();
  const router = useRouter();

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user) {
      // Utilisateur non connecté, afficher une alerte ou rediriger
      console.log("Utilisateur non connecté, redirection nécessaire");
    } else {
      console.log("Utilisateur connecté:", user.id);
    }
  }, [user]);

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!user) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: 'Mes Réservations',
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
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInText}>
            Vous devez être connecté pour voir vos réservations
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Mes Réservations',
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
      <MesReservationsScreen />
    </>
  );
}

const styles = StyleSheet.create({
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#E0485A',
    padding: 15,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
