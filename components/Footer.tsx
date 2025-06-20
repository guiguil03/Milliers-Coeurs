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
    <SafeAreaView style={styles.container}>
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


        <Link href="/favoris" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/favoris')}
          >
            <Ionicons 
              name={isActive('/favoris') ? 'heart' : 'heart-outline'} 
              size={24} 
              color={isActive('/favoris') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/favoris') && styles.activeText]}>Favoris</Text>
          </TouchableOpacity>
        </Link>


        <Link href="/mes-reservations" asChild>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/mes-reservations')}
          >
            <Ionicons 
              name={isActive('/mes-reservations') ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={isActive('/mes-reservations') ? '#000000' : '#212529'} 
            />
            <Text style={[styles.navText, isActive('/mes-reservations') && styles.activeText]}>Réservations</Text>
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
    backgroundColor: '#E0485A',
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
