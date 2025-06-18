import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { annonceSupabaseService, Annonce } from '../services/annonceSupabaseService';
import { useAuthContext } from '../contexts/AuthContext';
import { MISSION_CATEGORIES, Category } from '../constants/categories';

interface AnnonceFormProps {
  annonceId?: string; // Si fourni, mode édition
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

const AnnonceForm: React.FC<AnnonceFormProps> = ({ annonceId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAnnonce, setLoadingAnnonce] = useState<boolean>(false);
  const { user } = useAuthContext();

  // États du formulaire
  const [organisation, setOrganisation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [important, setImportant] = useState<string>('');
  const [lieu, setLieu] = useState<string>('');
  const [categorie, setCategorie] = useState<string>('');
  const [logo, setLogo] = useState<string>('');
  const [places, setPlaces] = useState<string>('');
  const [contact, setContact] = useState<{email?: string, telephone?: string}>({});

  const isEditMode = !!annonceId;

  useEffect(() => {
    if (isEditMode) {
      fetchAnnonce();
    }
  }, [annonceId]);

  const fetchAnnonce = async () => {
    if (!annonceId) return;

    try {
      setLoadingAnnonce(true);
      const annonce = await annonceSupabaseService.getAnnonceById(annonceId);
      
      if (annonce) {
        setOrganisation(annonce.organisation || '');
        setDescription(annonce.description || '');
        setDate(annonce.date || '');
        setImportant(annonce.important || '');
        setLieu(annonce.lieu || '');
        setCategorie(annonce.categorie || '');
        setLogo(annonce.logo || '');
        setPlaces(annonce.places?.toString() || '');
        setContact(annonce.contact || {});
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'annonce:", error);
      Alert.alert("Erreur", "Impossible de charger l'annonce. Veuillez réessayer.");
    } finally {
      setLoadingAnnonce(false);
    }
  };

  const handleSubmit = async () => {
    if (!organisation || !description || !date || !important) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour publier une annonce.");
      return;
    }

    try {
      setLoading(true);

      const annonceData = {
        organisation,
        description,
        date,
        important,
        lieu: lieu || null,
        categorie: categorie || null,
        logo: logo || null,
        places: places ? parseInt(places) : null,
        contact: Object.keys(contact).length > 0 ? contact : null,
        utilisateurId: user.id
      };

      let id;
      if (isEditMode && annonceId) {
        await annonceSupabaseService.updateAnnonce(annonceId, annonceData);
        id = annonceId;
      } else {
        id = await annonceSupabaseService.createAnnonce(annonceData);
      }

      Alert.alert(
        "Succès",
        isEditMode ? "Annonce mise à jour avec succès!" : "Annonce créée avec succès!",
        [
          {
            text: "OK",
            onPress: () => {
              if (onSuccess) onSuccess(id);
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'annonce:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAnnonce) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E0485A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {isEditMode ? "Modifier l'annonce" : "Nouvelle annonce"}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Organisation *</Text>
          <TextInput
            style={styles.input}
            value={organisation}
            onChangeText={setOrganisation}
            placeholder="Nom de l'organisation"
            maxLength={50}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Description de l'annonce"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Date de l'événement"
            maxLength={50}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Information importante *</Text>
          <TextInput
            style={styles.input}
            value={important}
            onChangeText={setImportant}
            placeholder="Information à mettre en évidence"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Lieu</Text>
          <TextInput
            style={styles.input}
            value={lieu}
            onChangeText={setLieu}
            placeholder="Lieu de l'événement"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoriesContainer}>
            {MISSION_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  categorie === category.id && styles.selectedCategory
                ]}
                onPress={() => setCategorie(category.id)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={28} 
                  color={categorie === category.id ? "#fff" : "#E0485A"} 
                />
                <Text 
                  style={[
                    styles.categoryTitle,
                    categorie === category.id && styles.selectedCategoryText
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>URL du logo</Text>
          <TextInput
            style={styles.input}
            value={logo}
            onChangeText={setLogo}
            placeholder="URL de l'image du logo"
            maxLength={500}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de places</Text>
          <TextInput
            style={styles.input}
            value={places}
            onChangeText={setPlaces}
            placeholder="Nombre de places disponibles"
            keyboardType="number-pad"
            maxLength={5}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email de contact</Text>
          <TextInput
            style={styles.input}
            value={contact.email || ''}
            onChangeText={(value) => setContact({...contact, email: value})}
            placeholder="Email de contact"
            keyboardType="email-address"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Téléphone de contact</Text>
          <TextInput
            style={styles.input}
            value={contact.telephone || ''}
            onChangeText={(value) => setContact({...contact, telephone: value})}
            placeholder="Téléphone de contact"
            keyboardType="phone-pad"
            maxLength={20}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditMode ? "Mettre à jour" : "Publier"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#E0485A',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  categoryTitle: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  selectedCategory: {
    backgroundColor: '#E0485A',
    borderColor: '#E0485A',
  },
  selectedCategoryText: {
    color: '#fff',
  },
});

export default AnnonceForm;
