import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/')}
        >
          <Ionicons 
            name={isActive('/') ? 'home' : 'home-outline'} 
            size={24} 
            color={isActive('/') ? '#2196F3' : '#212529'} 
          />
          <Text style={[styles.navText, isActive('/') && styles.activeText]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons 
            name={isActive('/profile') ? 'person' : 'person-outline'} 
            size={24} 
            color={isActive('/profile') ? '#2196F3' : '#212529'} 
          />
          <Text style={[styles.navText, isActive('/profile') && styles.activeText]}>Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/settings')}
        >
          <Ionicons 
            name={isActive('/settings') ? 'settings' : 'settings-outline'} 
            size={24} 
            color={isActive('/settings') ? '#2196F3' : '#212529'} 
          />
          <Text style={[styles.navText, isActive('/settings') && styles.activeText]}>Paramètres</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f8f9fa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    height: 60,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    marginTop: 5,
    fontSize: 12,
    color: '#212529',
  },
  activeText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});

export default Footer;
