import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Image, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { ICompetence, IExperience, IProfile } from '../data/profil';
import { profileService } from '../services/profileService';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Stack, useRouter } from 'expo-router';
import Header from '../components/Header';
import firebase from 'firebase/app';
import 'firebase/firestore';

export default function ProfilePage() {
  const { user, userType, logout } = useAuthContext();
  const router = useRouter();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<IProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddCompetence, setShowAddCompetence] = useState(false);
  const [newExperience, setNewExperience] = useState<IExperience>({ 
    title: '', 
    organization: '', 
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [newCompetence, setNewCompetence] = useState<ICompetence>({ name: '', level: 3 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) {
      setLoading(false);
      setError("Vous devez être connecté pour accéder à votre profil");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userProfile = await profileService.getProfile(user.uid);
      
      if (userProfile) {
        setProfile(userProfile);
        setTempProfile(userProfile);
      } else {
        // Créer un profil par défaut si aucun n'existe
        const defaultProfile: IProfile = {
          uid: user.uid,
          prenom: user.displayName?.split(' ')[0] || '',
          nom: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          image: 'https://i.pravatar.cc/300',
          userType: userType || 'benevole',
          competences: [],
          experiences: []
        };
        await profileService.setProfile(defaultProfile);
        setProfile(defaultProfile);
        setTempProfile(defaultProfile);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement du profil:", err);
      setError(err.message || "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    
    try {
      setUploading(true);
      
      // Convertir l'URI en blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Créer une référence de stockage avec un nom de fichier unique
      const imageRef = ref(storage, `profileImages/${user.uid}_${new Date().getTime()}`);
      
      // Uploader le blob
      await uploadBytes(imageRef, blob);
      
      // Obtenir l'URL de l'image uploadée
      const downloadURL = await getDownloadURL(imageRef);
      
      // Mettre à jour le profil avec la nouvelle image
      if (tempProfile) {
        setTempProfile({
          ...tempProfile,
          image: downloadURL
        });
      }
      
      // Si nous ne sommes pas en mode édition, sauvegarder immédiatement
      if (!isEditing && profile) {
        await profileService.updateProfile(user.uid, {
          ...profile,
          image: downloadURL
        });
        
        setProfile(prev => prev ? {
          ...prev,
          image: downloadURL
        } : null);
      }
      
      Alert.alert("Succès", "Image de profil mise à jour avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      Alert.alert("Erreur", "Impossible d'uploader l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setTempProfile({...profile});
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!user || !tempProfile) return;
    
    try {
      setLoading(true);
      
      // S'assurer que les valeurs ne sont pas undefined
      const updatedProfile = {
        ...tempProfile,
        // Fournir des valeurs par défaut pour les champs obligatoires
        prenom: tempProfile.prenom || '',
        nom: tempProfile.nom || '',
        email: tempProfile.email || '',
        image: tempProfile.image || '',
        // Convertir undefined en chaînes vides pour les champs optionnels
        adresse: tempProfile.adresse || '',
        code_postal: tempProfile.code_postal || '',
        ville: tempProfile.ville || '',
        telephone: tempProfile.telephone || '',
        biographie: tempProfile.biographie || ''
      };
      
      await profileService.updateProfile(user.uid, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert("Succès", "Vos modifications ont été enregistrées.");
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de sauvegarder les modifications");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setTempProfile({...profile});
    }
  };

  const handleChange = (field: keyof IProfile, value: any) => {
    if (!tempProfile) return;
    
    setTempProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleCompetenceChange = (index: number, field: keyof ICompetence, value: any) => {
    if (!tempProfile?.competences) return;
    
    setTempProfile(prev => {
      if (!prev || !prev.competences) return prev;
      const newCompetences = [...prev.competences];
      newCompetences[index] = {
        ...newCompetences[index],
        [field]: field === 'level' ? Number(value) : value
      };
      return {
        ...prev,
        competences: newCompetences
      };
    });
  };

  const handleExperienceChange = (index: number, field: keyof IExperience, value: string) => {
    if (!tempProfile?.experiences) return;
    
    setTempProfile(prev => {
      if (!prev || !prev.experiences) return prev;
      const newExperiences = [...prev.experiences];
      newExperiences[index] = {
        ...newExperiences[index],
        [field]: value
      };
      return {
        ...prev,
        experiences: newExperiences
      };
    });
  };

  const handleAddExperience = async () => {
    if (!user || !tempProfile) return;
    
    if (newExperience.title.trim() === '' || newExperience.organization.trim() === '') {
      Alert.alert("Erreur", "Veuillez entrer un titre et une organisation valides.");
      return;
    }
    
    try {
      await profileService.addExperience(user.uid, newExperience);
      
      // Mettre à jour l'état local
      setTempProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          experiences: [...(prev.experiences || []), newExperience]
        };
      });
      
      // Réinitialiser le formulaire
      setNewExperience({ 
        title: '', 
        organization: '', 
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setShowAddExperience(false);
      
      if (!isEditing) {
        // Rafraîchir le profil si nous ne sommes pas en mode édition
        fetchUserProfile();
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible d'ajouter l'expérience");
    }
  };

  const handleAddCompetence = async () => {
    if (!user || !tempProfile) return;
    
    if (newCompetence.name.trim() === '') {
      Alert.alert("Erreur", "Veuillez entrer un nom de compétence valide.");
      return;
    }
    
    try {
      await profileService.addCompetence(user.uid, newCompetence);
      
      // Mettre à jour l'état local
      setTempProfile(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          competences: [...(prev.competences || []), newCompetence]
        };
      });
      
      // Réinitialiser le formulaire
      setNewCompetence({ name: '', level: 3 });
      setShowAddCompetence(false);
      
      if (!isEditing) {
        // Rafraîchir le profil si nous ne sommes pas en mode édition
        fetchUserProfile();
      }
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible d'ajouter la compétence");
    }
  };

  const handleDeleteExperience = async (index: number) => {
    if (!user || !tempProfile?.experiences) return;
    
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette expérience ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer", 
          onPress: async () => {
            try {
              await profileService.removeExperience(user.uid, index);
              
              // Mettre à jour l'état local
              setTempProfile(prev => {
                if (!prev || !prev.experiences) return prev;
                const newExperiences = [...prev.experiences];
                newExperiences.splice(index, 1);
                return {
                  ...prev,
                  experiences: newExperiences
                };
              });
              
              if (!isEditing) {
                // Rafraîchir le profil si nous ne sommes pas en mode édition
                fetchUserProfile();
              }
            } catch (err: any) {
              Alert.alert("Erreur", err.message || "Impossible de supprimer l'expérience");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteCompetence = (index: number) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette compétence ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer", 
          onPress: () => {
            const newCompetences = [...(tempProfile?.competences || [])];
            newCompetences.splice(index, 1);
            
            setTempProfile(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                competences: newCompetences
              };
            });
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Impossible de se déconnecter");
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Mon Profil',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#E0485A',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/')}
              style={{ paddingLeft: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color="#E0485A" />
            </TouchableOpacity>
          ),
          headerBackTitleVisible: false,
        }} 
      />
      <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#E0485A" />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.header}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: isEditing ? tempProfile.image : profile.image }} 
                style={styles.profileImage} 
              />
              {isEditing && (
                <TouchableOpacity style={styles.imageEditButton} onPress={pickImage}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditing ? (
              <View style={styles.editFieldContainer}>
                <TextInput 
                  style={styles.editField}
                  value={tempProfile.prenom}
                  onChangeText={(text) => handleChange('prenom', text)}
                  placeholder="Prénom"
                />
                <TextInput 
                  style={styles.editField}
                  value={tempProfile.nom}
                  onChangeText={(text) => handleChange('nom', text)}
                  placeholder="Nom"
                />
                <TextInput 
                  style={styles.editField}
                  value={tempProfile.email}
                  onChangeText={(text) => handleChange('email', text)}
                  placeholder="Email"
                  keyboardType="email-address"
                />
              </View>
            ) : (
              <>
                <Text style={styles.name}>{profile.prenom} {profile.nom}</Text>
                <Text style={styles.email}>{profile.email}</Text>
              </>
            )}
            
            {!isEditing ? (
              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={24} color="#E0485A"/>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Ionicons name="checkmark" size={24} color="#fff"/>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Ionicons name="close" size={24} color="#fff"/>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coordonnées</Text>
            
            {isEditing ? (
              <>
                <View style={styles.editItemContainer}>
                  <Ionicons name="location-outline" size={22} color="#666" />
                  <TextInput 
                    style={styles.editInfoText}
                    value={tempProfile.adresse}
                    onChangeText={(text) => handleChange('adresse', text)}
                    placeholder="Adresse"
                  />
                </View>
                <View style={styles.editItemContainer}>
                  <TextInput 
                    style={[styles.editInfoText, {marginLeft: 32}]}
                    value={tempProfile.code_postal}
                    onChangeText={(text) => handleChange('code_postal', text)}
                    placeholder="Code postal"
                    keyboardType="numeric"
                  />
                  <TextInput 
                    style={styles.editInfoText}
                    value={tempProfile.ville}
                    onChangeText={(text) => handleChange('ville', text)}
                    placeholder="Ville"
                  />
                </View>
                <View style={styles.editItemContainer}>
                  <Ionicons name="mail-outline" size={22} color="#666" />
                  <TextInput 
                    style={styles.editInfoText}
                    value={tempProfile.email}
                    onChangeText={(text) => handleChange('email', text)}
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.editItemContainer}>
                  <Ionicons name="phone-portrait" size={22} color="#666" />
                  <TextInput 
                    style={styles.editInfoText}
                    value={tempProfile.telephone}
                    onChangeText={(text) => handleChange('telephone', text)}
                    placeholder="Téléphone"
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={22} color="#666" />
                  <Text style={styles.infoText}>{profile.adresse}, {profile.code_postal} {profile.ville}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="mail-outline" size={22} color="#666" />
                  <Text style={styles.infoText}>{profile.email}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="phone-portrait" size={22} color="#666" />
                  <Text style={styles.infoText}>{profile.telephone}</Text>
                </View>
              </>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Moyen de transport</Text>
            <View style={styles.transportItem}>  
              <Text style={styles.transportLabel}>Permis</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#E0485A" }}
                onValueChange={() => {
                  if (isEditing && tempProfile) {
                    setTempProfile(prev => {
                      if (!prev) return prev;
                      return {...prev, permis: !prev.permis};
                    });
                  }
                }}
                value={tempProfile?.permis || false}
              />
            </View>
            <View style={styles.transportItem}>  
              <Text style={styles.transportLabel}>Véhicule</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#E0485A" }}
                onValueChange={() => {
                  if (isEditing && tempProfile) {
                    setTempProfile(prev => {
                      if (!prev) return prev;
                      return {...prev, vehicule: !prev.vehicule};
                    });
                  }
                }}
                value={tempProfile?.vehicule || false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos de moi</Text>
            {isEditing ? (
              <TextInput
                style={styles.editBio}
                value={tempProfile?.biographie || ''}
                onChangeText={(text) => handleChange('biographie', text)}
                placeholder="Parlez de vous..."
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.bio}>{profile?.biographie || ''}</Text>
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mon historique</Text>
            
            {isEditing ? (
              <>
                {tempProfile.experiences.map((experience, index) => (
                  <View key={index} style={styles.editHistoryItem}>
                    <Ionicons name="checkmark-circle" size={24} color="#E0485A" />
                    <TextInput 
                      style={styles.editHistoryText}
                      value={experience.title}
                      onChangeText={(text) => handleExperienceChange(index, 'title', text)}
                      placeholder="Titre de l'expérience"
                    />
                    <TextInput 
                      style={styles.editHistoryText}
                      value={experience.organization}
                      onChangeText={(text) => handleExperienceChange(index, 'organization', text)}
                      placeholder="Organisation"
                    />
                    <TextInput 
                      style={styles.editHistoryText}
                      value={experience.date}
                      onChangeText={(text) => handleExperienceChange(index, 'date', text)}
                      placeholder="Date"
                    />
                    <TextInput 
                      style={styles.editHistoryText}
                      value={experience.description}
                      onChangeText={(text) => handleExperienceChange(index, 'description', text)}
                      placeholder="Description"
                    />
                    <TouchableOpacity onPress={() => handleDeleteExperience(index)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {showAddExperience ? (
                  <View style={styles.addItemContainer}>
                    <TextInput 
                      style={styles.addItemInput}
                      value={newExperience.title}
                      onChangeText={(text) => setNewExperience(prev => ({ ...prev, title: text }))}
                      placeholder="Titre de l'expérience"
                      autoFocus
                    />
                    <TextInput 
                      style={styles.addItemInput}
                      value={newExperience.organization}
                      onChangeText={(text) => setNewExperience(prev => ({ ...prev, organization: text }))}
                      placeholder="Organisation"
                    />
                    <TextInput 
                      style={styles.addItemInput}
                      value={newExperience.date}
                      onChangeText={(text) => setNewExperience(prev => ({ ...prev, date: text }))}
                      placeholder="Date"
                    />
                    <TextInput 
                      style={styles.addItemInput}
                      value={newExperience.description}
                      onChangeText={(text) => setNewExperience(prev => ({ ...prev, description: text }))}
                      placeholder="Description"
                    />
                    <View style={styles.addItemActions}>
                      <TouchableOpacity onPress={handleAddExperience} style={styles.addItemButton}>
                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowAddExperience(false)} style={styles.addItemButton}>
                        <Ionicons name="close" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setShowAddExperience(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color="#E0485A" />
                    <Text style={styles.addButtonText}>Ajouter une expérience</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                {profile.experiences.map((experience, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Ionicons name="checkmark-circle" size={24} color="#E0485A" />
                    <Text style={styles.historyText}>{experience.title}</Text>
                    <Text style={styles.historyText}>{experience.organization}</Text>
                    <Text style={styles.historyText}>{experience.date}</Text>
                    <Text style={styles.historyText}>{experience.description}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mes compétences</Text>
            
            {isEditing ? (
              <>
                {tempProfile.competences.map((competence, index) => (
                  <View key={index} style={styles.editCompetenceItem}>
                    <TextInput 
                      style={styles.editCompetenceName}
                      value={competence.name}
                      onChangeText={(text) => handleCompetenceChange(index, 'name', text)}
                      placeholder="Compétence"
                    />
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map(starIndex => (
                        <TouchableOpacity 
                          key={starIndex} 
                          onPress={() => handleCompetenceChange(index, 'level', starIndex)}
                        >
                          <Ionicons 
                            name={starIndex <= competence.level ? "star" : "star-outline"} 
                            size={18} 
                            color={starIndex <= competence.level ? "#E0485A" : "#ddd"} 
                            style={{ marginRight: 3 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteCompetence(index)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                {showAddCompetence ? (
                  <View style={styles.addItemContainer}>
                    <TextInput 
                      style={styles.addItemInput}
                      value={newCompetence.name}
                      onChangeText={(text) => setNewCompetence(prev => ({ ...prev, name: text }))}
                      placeholder="Nouvelle compétence"
                      autoFocus
                    />
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map(starIndex => (
                        <TouchableOpacity 
                          key={starIndex} 
                          onPress={() => setNewCompetence(prev => ({ ...prev, level: starIndex }))}
                        >
                          <Ionicons 
                            name={starIndex <= newCompetence.level ? "star" : "star-outline"} 
                            size={18} 
                            color={starIndex <= newCompetence.level ? "#E0485A" : "#ddd"} 
                            style={{ marginRight: 3 }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.addItemActions}>
                      <TouchableOpacity onPress={handleAddCompetence} style={styles.addItemButton}>
                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowAddCompetence(false)} style={styles.addItemButton}>
                        <Ionicons name="close" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setShowAddCompetence(true)} style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color="#E0485A" />
                    <Text style={styles.addButtonText}>Ajouter une compétence</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                {profile.competences.map((competence, index) => (
                  <View key={index} style={styles.competenceItem}>
                    <Text style={styles.competenceName}>{competence.name}</Text>
                    <View style={styles.starsContainer}>
                      {[1, 2, 3, 4, 5].map(starIndex => (
                        <Ionicons 
                          key={starIndex} 
                          name={starIndex <= competence.level ? "star" : "star-outline"} 
                          size={18} 
                          color={starIndex <= competence.level ? "#E0485A" : "#ddd"} 
                          style={{ marginRight: 3 }}
                        />
                      ))}
                    </View>
                  </View>
                ))}
               </>
            )}
          </View>
          
          <View style={styles.emptySpace}></View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    color: '#E0485A',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E0485A',
  },
  imageEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#E0485A',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  editButton: {
    padding: 8,
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
  },
  editFieldContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
  },
  editField: {
    width: '100%',
    padding: 8,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0485A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  bio: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  editBio: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  editHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
  },
  editHistoryText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  editItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
  },
  editInfoText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
  },
  transportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transportLabel: {
    fontSize: 14,
    color: '#444',
  },
  competenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editCompetenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  competenceName: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  editCompetenceName: {
    fontSize: 14,
    color: '#444',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#E0485A',
    marginLeft: 5,
    fontSize: 14,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 8,
  },
  addItemContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addItemInput: {
    fontSize: 14,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  addItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  addItemButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptySpace: {
    height: 100,
  },
  logoutButton: {
    backgroundColor: '#E0485A',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});
