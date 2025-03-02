import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import AnnoncesList from '../../components/AnnoncesList';

export default function AnnoncesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Annonces',
          headerStyle: {
            backgroundColor: '#FFF',
          },
          headerTintColor: '#FF69B4',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <AnnoncesList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
