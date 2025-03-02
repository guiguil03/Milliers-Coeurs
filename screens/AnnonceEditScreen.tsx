import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AnnonceForm from '../components/AnnonceForm';

// Définir les types pour la navigation
type RootStackParamList = {
  AnnonceEdit: { annonceId: string };
  AnnonceDetail: { annonceId: string };
  // Ajoutez d'autres écrans au besoin
};

type AnnonceEditScreenRouteProp = RouteProp<RootStackParamList, 'AnnonceEdit'>;
type AnnonceEditScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnnonceEdit'>;

interface AnnonceEditScreenProps {
  route: AnnonceEditScreenRouteProp;
  navigation: AnnonceEditScreenNavigationProp;
}

const AnnonceEditScreen: React.FC<AnnonceEditScreenProps> = ({ route, navigation }) => {
  const { annonceId } = route.params;

  const handleSuccess = (id: string) => {
    // Rediriger vers la page de détail de l'annonce mise à jour
    navigation.navigate('AnnonceDetail', { annonceId: id });
  };

  const handleCancel = () => {
    // Retourner à la page précédente
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AnnonceForm 
        annonceId={annonceId} 
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

export default AnnonceEditScreen;
