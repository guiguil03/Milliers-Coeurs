import { Stack } from 'expo-router';
import { ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={DefaultTheme}>
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: 'transparent' } 
            }} 
          />
        </View>
        <Footer />
      </SafeAreaView>
    </ThemeProvider>
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
