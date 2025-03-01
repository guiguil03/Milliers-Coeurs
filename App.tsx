import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Ce fichier n'est pas utilisé car l'application utilise Expo Router
// Le point d'entrée principal est défini dans package.json comme "expo-router/entry"
// et la structure de l'application est définie dans app/_layout.tsx

export default function App() {
  console.log("Ce fichier App.tsx n'est pas utilisé dans cette application.");
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Ce fichier App.tsx n'est pas utilisé. L'application utilise Expo Router avec app/_layout.tsx comme structure principale.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  }
});
