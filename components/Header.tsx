import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AuthScreen from './AuthScreen';
import { useAuthContext } from '../contexts/AuthContext';
import { userDataService } from '../services/userDataService';

interface HeaderProps {}

export const Header: React.FC<HeaderProps> = () => {
  const [isAuthVisible, setIsAuthVisible] = useState(false);
  const { user, logout } = useAuthContext();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisplayName = async () => {
      if (user) {
        if (user.displayName) {
          console.log("[Header] DisplayName trouvé dans Firebase:", user.displayName);
          setDisplayName(user.displayName);
        } else {
          console.log("[Header] Pas de displayName dans Firebase, tentative de récupération locale");
          try {
            const localName = await userDataService.getDisplayName(user.uid);
            if (localName) {
              console.log("[Header] DisplayName trouvé localement:", localName);
              setDisplayName(localName);
            } else {
              console.log("[Header] Aucun displayName trouvé");
              setDisplayName(null);
            }
          } catch (error) {
            console.error("[Header] Erreur lors de la récupération du displayName local:", error);
            setDisplayName(null);
          }
        }
      } else {
        setDisplayName(null);
      }
    };

    fetchDisplayName();
  }, [user]);

  // Fermer automatiquement l'écran d'authentification si l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      setIsAuthVisible(false);
    }
  }, [user]);

  const handleAuthPress = () => {
    if (user) {
      // Si l'utilisateur est connecté, afficher un menu de déconnexion
      Alert.alert(
        'Déconnexion',
        `Êtes-vous sûr de vouloir vous déconnecter, ${displayName || 'utilisateur'} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Déconnexion', 
            style: 'destructive', 
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.error('[Header] Erreur lors de la déconnexion:', error);
              }
            } 
          }
        ]
      );
    } else {
      // Si l'utilisateur n'est pas connecté, afficher l'écran d'authentification
      setIsAuthVisible(true);
    }
  };

  const handleAuthClose = () => {
    setIsAuthVisible(false);
  };

  // Vérifier si on doit afficher le prénom ou l'icône
  const shouldShowDisplayName = user && displayName && displayName.trim() !== '';
  
  return (
    <SafeAreaView>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={{ width: 40, height: 40 }} />
        <Text style={styles.Titre}> Milliers de Coeurs</Text>
        
        <TouchableOpacity onPress={handleAuthPress} style={styles.authButton}>
          {shouldShowDisplayName ? (
            <View style={styles.userContainer}>
              <Ionicons name="person-circle" size={22} color="#E0485A" />
              <Text style={styles.userName}>{displayName}</Text>
            </View>
          ) : (
            <Ionicons name="person" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>
      
      {!user && <AuthScreen visible={isAuthVisible} onClose={handleAuthClose} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    display:'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#E0485A',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  Titre: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  authButton: {
    padding: 5,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0485A',
    marginLeft: 5,
  }
});
