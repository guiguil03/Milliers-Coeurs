import React from 'react';
import { Stack } from 'expo-router';
import MesReservationsScreen from '../../screens/MesReservationsScreen';
import { useAuthContext } from '../../contexts/AuthContext';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReservationsTab() {
  const { user } = useAuthContext();

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!user) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Ionicons name="bookmark-outline" size={64} color="#ccc" />
        <Text style={styles.notLoggedInTitle}>Connexion requise</Text>
        <Text style={styles.notLoggedInText}>
          Connectez-vous pour voir vos réservations de missions de bénévolat
        </Text>
      </View>
    );
  }

  return <MesReservationsScreen />;
}

const styles = StyleSheet.create({
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    lineHeight: 22,
  },
}); 