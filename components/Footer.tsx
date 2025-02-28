import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter, usePathname } from 'expo-router';

interface FooterProps {}

export const Footer: React.FC<FooterProps> = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.navbar}>
        <Link href="/" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/')}
          >
            <Ionicons 
              name={isActive('/') ? 'home' : 'home-outline'} 
              size={24} 
              color={isActive('/') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/') && styles.activeText]}>Actualité</Text>
          </TouchableOpacity>
        </Link>


        <Link href="/explorer" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/explorer')}
          >
            <Ionicons 
              name={isActive('/explorer') ? 'compass' : 'compass-outline'} 
              size={24} 
              color={isActive('/explorer') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/explorer') && styles.activeText]}>Explorer</Text>
          </TouchableOpacity>
        </Link>


       

        <Link href="/messages" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/messages')}
          >
            <Ionicons 
              name={isActive('/messages') ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={isActive('/messages') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/messages') && styles.activeText]}>Messages</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/profile')}
          >
            <Ionicons 
              name={isActive('/profile') ? 'person' : 'person-outline'} 
              size={24} 
              color={isActive('/profile') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/profile') && styles.activeText]}>Profil</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#212529',
  },
  activeText: {
    color: '#FFF',
  },
});
