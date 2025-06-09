import React from 'react';
import { View, Text, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ReservationPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const handleConfirm = () => {
    // Ici tu ajoutes la logique pour enregistrer la réservation dans Firebase
    alert('Réservation confirmée pour l\'annonce ' + id);
    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Réserver l'annonce {id}</Text>
      {/* Ajoute ici un formulaire si besoin */}
      <Button title="Confirmer la réservation" onPress={handleConfirm} />
    </View>
  );
} 