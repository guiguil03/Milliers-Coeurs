import { StyleSheet, View, Text, Image, ScrollView, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profile as initialProfile } from '../data/profil';
import { useState } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [isPermifiee, setIsPermifiee] = useState(true);
  const [isVehiculee, setIsVehiculee] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(initialProfile);
  const [newCompetence, setNewCompetence] = useState({ nom: '', niveau: '3' });
  const [newExperience, setNewExperience] = useState('');
  const [showAddCompetence, setShowAddCompetence] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  
  const handleEdit = () => {
    setTempProfile({...profile});
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setProfile(tempProfile);
    setIsEditing(false);
    Alert.alert("Succès", "Vos modifications ont été enregistrées.");
    // Ici vous pourriez ajouter une fonction pour sauvegarder les données sur un serveur
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setTempProfile(profile);
  };
  
  const handleChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCompetenceChange = (competence, rating) => {
    setTempProfile(prev => ({
      ...prev,
      competences: {
        ...prev.competences,
        [competence]: rating.toString()
      }
    }));
  };
  
  const handleHistoriqueChange = (key, value) => {
    setTempProfile(prev => ({
      ...prev,
      historique: {
        ...prev.historique,
        [key]: value
      }
    }));
  };
  
  const handleAddExperience = () => {
    if (newExperience.trim() === '') {
      Alert.alert("Erreur", "Veuillez entrer une expérience valide.");
      return;
    }
    
    const newKey = `Bénévolat${Object.keys(tempProfile.historique).length + 1}`;
    
    setTempProfile(prev => ({
      ...prev,
      historique: {
        ...prev.historique,
        [newKey]: newExperience
      }
    }));
    
    setNewExperience('');
    setShowAddExperience(false);
  };
  
  const handleAddCompetence = () => {
    if (newCompetence.nom.trim() === '') {
      Alert.alert("Erreur", "Veuillez entrer un nom de compétence valide.");
      return;
    }
    
    setTempProfile(prev => ({
      ...prev,
      competences: {
        ...prev.competences,
        [newCompetence.nom]: newCompetence.niveau
      }
    }));
    
    setNewCompetence({ nom: '', niveau: '3' });
    setShowAddCompetence(false);
  };
  
  const handleDeleteExperience = (keyToDelete) => {
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
          onPress: () => {
            const newHistorique = { ...tempProfile.historique };
            delete newHistorique[keyToDelete];
            
            setTempProfile(prev => ({
              ...prev,
              historique: newHistorique
            }));
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleDeleteCompetence = (competenceToDelete) => {
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
            const newCompetences = { ...tempProfile.competences };
            delete newCompetences[competenceToDelete];
            
            setTempProfile(prev => ({
              ...prev,
              competences: newCompetences
            }));
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: isEditing ? tempProfile.image : profile.image }} 
            style={styles.profileImage} 
          />
          {isEditing && (
            <TouchableOpacity style={styles.imageEditButton}>
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
          <Text style={styles.transportLabel}>Permifiée</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#E0485A" }}
            onValueChange={() => {
              if (isEditing) {
                setTempProfile(prev => ({...prev, permifiee: !isPermifiee}));
              }
              setIsPermifiee(previousState => !previousState);
            }}
            value={isPermifiee}
          />
        </View>
        <View style={styles.transportItem}>  
          <Text style={styles.transportLabel}>Véhiculée</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#E0485A" }}
            onValueChange={() => {
              if (isEditing) {
                setTempProfile(prev => ({...prev, vehiculee: !isVehiculee}));
              }
              setIsVehiculee(previousState => !previousState);
            }}
            value={isVehiculee}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>À propos de moi</Text>
        {isEditing ? (
          <TextInput
            style={styles.editBio}
            value={tempProfile.biographie}
            onChangeText={(text) => handleChange('biographie', text)}
            placeholder="Parlez de vous..."
            multiline
            numberOfLines={4}
          />
        ) : (
          <Text style={styles.bio}>{profile.biographie}</Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon historique</Text>
        
        {isEditing ? (
          <>
            {Object.entries(tempProfile.historique).map(([key, value], index) => (
              <View key={index} style={styles.editHistoryItem}>
                <Ionicons name="checkmark-circle" size={24} color="#E0485A" />
                <TextInput 
                  style={styles.editHistoryText}
                  value={value.toString()}
                  onChangeText={(text) => handleHistoriqueChange(key, text)}
                  placeholder="Expérience de bénévolat"
                />
                <TouchableOpacity onPress={() => handleDeleteExperience(key)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            
            {showAddExperience ? (
              <View style={styles.addItemContainer}>
                <TextInput 
                  style={styles.addItemInput}
                  value={newExperience}
                  onChangeText={setNewExperience}
                  placeholder="Nouvelle expérience de bénévolat"
                  autoFocus
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
            {Object.entries(profile.historique).map(([key, value], index) => (
              <View key={index} style={styles.historyItem}>
                <Ionicons name="checkmark-circle" size={24} color="#E0485A" />
                <Text style={styles.historyText}>{value.toString()}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes compétences</Text>
        
        {isEditing ? (
          <>
            {Object.entries(tempProfile.competences).map(([key, value], index) => {
              const rating = parseInt(value);
              return (
                <View key={index} style={styles.editCompetenceItem}>
                  <TextInput 
                    style={styles.editCompetenceName}
                    value={key}
                    onChangeText={(text) => {
                      // Gérer le changement de nom de la compétence
                      const newCompetences = {...tempProfile.competences};
                      delete newCompetences[key];
                      newCompetences[text] = value;
                      setTempProfile(prev => ({
                        ...prev,
                        competences: newCompetences
                      }));
                    }}
                    placeholder="Compétence"
                  />
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(starIndex => (
                      <TouchableOpacity 
                        key={starIndex} 
                        onPress={() => handleCompetenceChange(key, starIndex)}
                      >
                        <Ionicons 
                          name={starIndex <= rating ? "star" : "star-outline"} 
                          size={18} 
                          color={starIndex <= rating ? "#E0485A" : "#ddd"} 
                          style={{ marginRight: 3 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteCompetence(key)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {showAddCompetence ? (
              <View style={styles.addItemContainer}>
                <TextInput 
                  style={styles.addItemInput}
                  value={newCompetence.nom}
                  onChangeText={(text) => setNewCompetence(prev => ({ ...prev, nom: text }))}
                  placeholder="Nouvelle compétence"
                  autoFocus
                />
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map(starIndex => (
                    <TouchableOpacity 
                      key={starIndex} 
                      onPress={() => setNewCompetence(prev => ({ ...prev, niveau: starIndex.toString() }))}
                    >
                      <Ionicons 
                        name={starIndex <= parseInt(newCompetence.niveau) ? "star" : "star-outline"} 
                        size={18} 
                        color={starIndex <= parseInt(newCompetence.niveau) ? "#E0485A" : "#ddd"} 
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
            {Object.entries(profile.competences).map(([key, value], index) => {
              const rating = parseInt(value);
              const stars = [];
              for (let i = 0; i < 5; i++) {
                stars.push(
                  <Ionicons 
                    key={i} 
                    name={i < rating ? "star" : "star-outline"} 
                    size={18} 
                    color={i < rating ? "#E0485A" : "#ddd"} 
                    style={{ marginRight: 3 }}
                  />
                );
              }
              return (
                <View key={index} style={styles.competenceItem}>
                  <Text style={styles.competenceName}>{key}</Text>
                  <View style={styles.starsContainer}>
                    {stars}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
      
      <View style={styles.emptySpace}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});
