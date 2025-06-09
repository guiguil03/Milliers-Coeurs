import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FavorisScreen from '../screens/FavorisScreen';

export default function FavorisPage() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Mes Favoris',
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
      <View style={styles.container}>
        <FavorisScreen />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});
