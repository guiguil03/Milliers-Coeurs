import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAnnonce, CreateAnnonceData, AnnonceCategoryType } from '../../hooks/useAnnonce';

const AnnonceCreationExample: React.FC = () => {
  // États du formulaire
  const [organisation, setOrganisation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [important, setImportant] = useState('');
  const [lieu, setLieu] = useState('');
  const [categorie, setCategorie] = useState<AnnonceCategoryType | ''>('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');

  // Utiliser notre ook
  const { createAnnonce, loading, error } = useAnnonce();

  const handleSubmit = async () => {
    // Validation de base
    if (!organisation || !description || !date || !important) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Préparer les données
    const annonceData: CreateAnnonceData = {
      organisation,
      description,
      date,
      important,
      lieu: lieu || undefined,
      categorie: categorie as AnnonceCategoryType || undefined,
      contact: {
        email: email || undefined,
        telephone: telephone || undefined
      }
    };

    // Créer l'annonce
    const annonceId = await createAnnonce(annonceData);

    if (annonceId) {
      Alert.alert('Succès', 'Votre annonce a été créée avec succès!');
      // Réinitialiser le formulaire
      setOrganisation('');
      setDescription('');
      setDate('');
      setImportant('');
      setLieu('');
      setCategorie('');
      setEmail('');
      setTelephone('');
    } else if (error) {
      Alert.alert('Erreur', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer une nouvelle annonce</Text>

      <Text style={styles.label}>Organisation *</Text>
      <TextInput 
        style={styles.input} 
        value={organisation}
        onChangeText={setOrganisation}
        placeholder="Nom de l'organisation"
      />

      <Text style={styles.label}>Description *</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={description}
        onChangeText={setDescription}
        placeholder="Description de l'annonce"
        multiline
      />

      <Text style={styles.label}>Date *</Text>
      <TextInput 
        style={styles.input} 
        value={date}
        onChangeText={setDate}
        placeholder="Date de l'événement (ex: dimanche 22 décembre)"
      />

      <Text style={styles.label}>Information importante *</Text>
      <TextInput 
        style={styles.input} 
        value={important}
        onChangeText={setImportant}
        placeholder="Information à mettre en évidence"
      />

      <Text style={styles.label}>Lieu</Text>
      <TextInput 
        style={styles.input} 
        value={lieu}
        onChangeText={setLieu}
        placeholder="Lieu de l'événement"
      />

      <Text style={styles.label}>Catégorie</Text>
      <TextInput 
        style={styles.input} 
        value={categorie}
        onChangeText={(text) => setCategorie(text as AnnonceCategoryType)}
        placeholder="Catégorie (ex: Animaux, Aide humanitaire)"
      />

      <Text style={styles.label}>Email de contact</Text>
      <TextInput 
        style={styles.input} 
        value={email}
        onChangeText={setEmail}
        placeholder="Email de contact"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Téléphone de contact</Text>
      <TextInput 
        style={styles.input} 
        value={telephone}
        onChangeText={setTelephone}
        placeholder="Téléphone de contact"
        keyboardType="phone-pad"
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Créer l'annonce</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#E0485A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  }
});

export default AnnonceCreationExample;
