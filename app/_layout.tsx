import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Attendre que Firebase soit initialisé
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
      }
    };

    checkAuth();
  }, []);

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <SafeAreaView style={styles.container}>
          <Header />
          <View style={styles.content}>
            <Stack />
          </View>
          <Footer />
        </SafeAreaView>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
