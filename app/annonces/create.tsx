import React from 'react';
import { Stack, useRouter } from 'expo-router';
import AnnonceCreateScreen from '../../screens/AnnonceCreateScreen';

export default function AnnonceCreateRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Créer une annonce',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <AnnonceCreateScreen 
        navigation={{ 
          navigate: (name, params) => {
            if (name === 'AnnonceDetail' && params?.annonceId) {
              router.push(`/annonces/${params.annonceId}`);
            } else if (name === 'Home') {
              router.push('/');
            }
          }
        }} 
      />
    </>
  );
}
