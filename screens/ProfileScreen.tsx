import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profile } from '../data/profil';

const ProfileScreen: React.FC = () => {
  const [isPermifiee, setIsPermifiee] = useState(true);
  const [isVehiculee, setIsVehiculee] = useState(true);
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profile.image }} 
            style={styles.profileImage} 
          />
        </View>
        
        <Text style={styles.name}>{profile.prenom} {profile.nom}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <Ionicons name="pencil-outline" size={24} color="black"/>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordonnées</Text>
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
          <Text style={styles.infoText}> {profile.telephone}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Moyen de transport</Text>
        <View style={styles.transportItem}>  
          <Text style={styles.transportLabel}>Permifiée</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#E0485A" }}
            onValueChange={() => setIsPermifiee(previousState => !previousState)}
            value={isPermifiee}
          />
        </View>
        <View style={styles.transportItem}>  
          <Text style={styles.transportLabel}>Véhiculée</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#E0485A" }}
            onValueChange={() => setIsVehiculee(previousState => !previousState)}
            value={isVehiculee}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.bioText}>{profile.bio}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expériences de bénévolat</Text>
        {profile.experiences.map((experience, index) => (
          <View key={index} style={styles.experienceItem}>
            <Text style={styles.experienceTitle}>{experience.title}</Text>
            <Text style={styles.experienceOrganization}>{experience.organization}</Text>
            <Text style={styles.experienceDate}>{experience.date}</Text>
            <Text style={styles.experienceDescription}>{experience.description}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compétences</Text>
        {profile.competences.map((competence, index) => (
          <View key={index} style={styles.skillItem}>
            <Text style={styles.skillName}>{competence.name}</Text>
            <View style={styles.starsContainer}>
              {[...Array(5)].map((_, i) => (
                <Ionicons 
                  key={i}
                  name="star" 
                  size={16} 
                  color={i < competence.level ? "#E0485A" : "#e0e0e0"} 
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  bioText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  experienceItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  experienceTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  experienceOrganization: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  experienceDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 16,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  transportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transportLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
});

export default ProfileScreen;
