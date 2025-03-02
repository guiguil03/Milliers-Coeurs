import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import AnnonceEditScreen from '../../../screens/AnnonceEditScreen';

export default function AnnonceEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  if (!id) {
    throw new Error("L'ID de l'annonce est requis");
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Modifier l\'annonce',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <AnnonceEditScreen 
        route={{ params: { annonceId: id } }} 
        navigation={{ 
          navigate: (name, params) => {
            if (name === 'AnnonceDetail') {
              router.push(`/annonces/${params?.annonceId}`);
            } else {
              router.push('/');
            }
          }, 
          goBack: () => {
            router.back();
          } 
        }} 
      />
    </>
  );
}
