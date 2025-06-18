import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../contexts/AuthContext';
import AuthScreen from './AuthScreen';

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const { user, userType, logout } = useAuthContext();
  const router = useRouter();

  // Fermer la modal automatiquement quand l'utilisateur se connecte
  useEffect(() => {
    if (user && modalVisible) {
      console.log("[Header] Utilisateur connecté détecté, fermeture de la modal");
      setModalVisible(false);
    }
  }, [user, modalVisible]);

  useEffect(() => {
    if (user) {
      // Récupérer et formater le nom d'affichage de l'utilisateur
      const displayName = user.user_metadata?.display_name || user.email || user.email?.split('@')[0] || '';
      setUserDisplayName(displayName);
    } else {
      setUserDisplayName(null);
    }
  }, [user]);

  const handleLogin = () => {
    setModalVisible(true);
  };

  const handleHomePress = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.logoContainer}
          onPress={handleHomePress}
        >
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Milliers de Coeurs</Text>
        </TouchableOpacity>
        
        {user ? (
          <View style={styles.userSection}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.greeting}>
                Bonjour, <Text style={styles.userName}>{userDisplayName}</Text>
              </Text>
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={async () => {
                  await logout();
                  router.push('/');
                }}
              >
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => router.push('/mes-reservations')}
              >
                <Text style={styles.navButtonText}>Mes Réservations</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Connexion</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <AuthScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0485A',
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
  },
  userName: {
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#E0485A',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default Header;
