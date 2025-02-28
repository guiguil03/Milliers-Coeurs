import { Tabs } from 'expo-router';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';

export default function TabLayout() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ThemedView style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              title: 'Explore',
            }}
          />
        </Tabs>
      </ThemedView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  content: {
    flex: 1,
  },
});
