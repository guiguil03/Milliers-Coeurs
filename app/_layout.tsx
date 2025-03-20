import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Footer } from '../components/Footer';

export default function RootLayout() {
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
});
