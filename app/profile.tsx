import { StyleSheet, View, Text, Image, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profile } from '../data/profil';
import { useState } from 'react';

export default function ProfilePage() {
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
        <Text style={styles.sectionTitle}>À propos de moi</Text>
        <Text style={styles.bio}>{profile.biographie}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon historique</Text>
        
        {Object.entries(profile.historique).map(([key, value], index) => (
          <View key={index} style={styles.historyItem}>
            <Ionicons name="checkmark-circle" size={24} color="#E0485A" />
            <Text style={styles.historyText}>{value.toString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes compétences</Text>
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
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E0485A',
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
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#444',
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
  competenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  competenceName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptySpace: {
    height: 80,
  }
});
