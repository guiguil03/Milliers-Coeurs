import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Footer } from '../components/Footer';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Attendre un délai simple pour permettre à Firebase de s'initialiser
    const timer = setTimeout(() => {
      console.log("✅ Application prête!");
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isInitialized) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#E0485A" />
        <Text style={styles.loadingText}>Initialisation en cours...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <SafeAreaView style={styles.container}>
          <Header />
          <View style={styles.content}>
            <Stack 
              screenOptions={{ 
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerTintColor: '#E0485A',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18,
                },
                headerShadowVisible: false,
              }} 
            />
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
