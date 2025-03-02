import React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import AnnonceDetailScreen from '../../screens/AnnonceDetailScreen';

export default function AnnonceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  if (!id) {
    throw new Error("L'ID de l'annonce est requis");
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Détails de l\'annonce',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <AnnonceDetailScreen 
        route={{ params: { annonceId: id } }} 
        navigation={{ navigate: (name, params) => {
          
          console.log(`Navigation vers ${name} avec params:`, params);
          
          if (name === 'AnnonceEdit') {
            
            return `/annonces/edit/${params?.annonceId}`;
          }
          return '/';
        }, goBack: () => {
          
          console.log('Navigation: retour');
        } }} 
      />
    </>
  );
}
