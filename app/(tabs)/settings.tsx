import { StyleSheet, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);

  const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch' }) => (
    <ThemedView style={styles.settingItem}>
      <ThemedView style={styles.settingHeader}>
        <Ionicons name={icon} size={24} color="#666" />
        <ThemedView style={styles.settingText}>
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText style={styles.settingDescription}>{description}</ThemedText>
        </ThemedView>
      </ThemedView>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#2196F3' : '#f4f3f4'}
        />
      )}
      {type === 'chevron' && (
        <Ionicons name="chevron-forward" size={24} color="#666" />
      )}
    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ThemedView style={styles.content}>
        <ThemedView style={styles.mainContent}>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Préférences</ThemedText>
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              description="Activer les notifications push"
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingItem
              icon="moon-outline"
              title="Mode sombre"
              description="Changer l'apparence de l'application"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="Compte privé"
              description="Seuls vos amis peuvent voir votre profil"
              value={privateAccount}
              onValueChange={setPrivateAccount}
            />
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Compte</ThemedText>
            <TouchableOpacity>
              <SettingItem
                icon="person-outline"
                title="Informations personnelles"
                description="Modifier vos informations"
                type="chevron"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <SettingItem
                icon="key-outline"
                title="Sécurité"
                description="Mot de passe et authentification"
                type="chevron"
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
