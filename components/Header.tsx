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

  useEffect(() => {
    if (user) {
      // Récupérer et formater le nom d'affichage de l'utilisateur
      const displayName = user.displayName || user.email?.split('@')[0] || '';
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
          <View style={styles.userInfoContainer}>
            <Text style={styles.greeting}>
              Bonjour, <Text style={styles.userName}>{userDisplayName}</Text>
            </Text>
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
  },
  userName: {
    fontWeight: 'bold',
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#E0485A',
    fontWeight: 'bold',
  },
});

export default Header;
