import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AnnonceForm from '../components/AnnonceForm';

// Définir les types pour la navigation
type RootStackParamList = {
  AnnonceCreate: undefined;
  AnnonceDetail: { annonceId: string };
  Home: undefined;
  // Ajoutez d'autres écrans au besoin
};

type AnnonceCreateScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnnonceCreate'>;

interface AnnonceCreateScreenProps {
  navigation: AnnonceCreateScreenNavigationProp;
}

const AnnonceCreateScreen: React.FC<AnnonceCreateScreenProps> = ({ navigation }) => {
  const handleSuccess = (id: string) => {
    // Rediriger vers la page de détail de la nouvelle annonce
    navigation.navigate('AnnonceDetail', { annonceId: id });
  };

  const handleCancel = () => {
    // Retourner à l'écran d'accueil
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <AnnonceForm 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
});

export default AnnonceCreateScreen;
