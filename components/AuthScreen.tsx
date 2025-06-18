import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { getErrorMessage } from '../services/authSupabaseService';
import { userDataService } from '../services/userDataService';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [userType, setUserType] = useState<'association' | 'benevole'>('benevole');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, register, forgotPassword } = useAuthContext();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setUserType('benevole');
    setLoading(false);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      
      if (!email || !password) {
        setErrorMessage("Veuillez remplir tous les champs obligatoires");
        setLoading(false);
        return;
      }
      
      if (!isLogin && !firstName.trim()) {
        setErrorMessage("Veuillez entrer votre prénom");
        setLoading(false);
        return;
      }

      if (isLogin) {
        console.log("[AuthScreen] Tentative de connexion avec l'email:", email);
        const user = await login(email, password);
        console.log("[AuthScreen] Connexion réussie, UID:", user?.id);
      } else {
        const displayName = firstName.trim();
        console.log("[AuthScreen] Tentative d'inscription avec email:", email, "et prénom:", displayName, "type:", userType);
        
        const user = await register({ 
          email, 
          password, 
          displayName,
          userType
        });
        
        if (user && user.id) {
          console.log("[AuthScreen] Enregistrement local du prénom pour l'utilisateur:", user.id);
          await userDataService.saveDisplayName(user.id, displayName);
          await userDataService.saveUserType(user.id, userType);
        }
        
        console.log("[AuthScreen] Inscription réussie");
      }
      
      // Fermer la modal automatiquement après connexion/inscription réussie
      console.log("[AuthScreen] Fermeture automatique de la modal après succès");
      onClose();
    } catch (error: any) {
      console.error("[AuthScreen] Erreur d'authentification:", error);
      setErrorMessage(error.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Veuillez entrer votre email pour réinitialiser votre mot de passe');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Demande de réinitialisation de mot de passe pour:", email);
      await forgotPassword(email);
      Alert.alert('Succès', 'Un email de réinitialisation a été envoyé à votre adresse');
      setLoading(false);
    } catch (error: any) {
      console.error('Erreur de réinitialisation de mot de passe:', error);
      
      let message = 'Impossible d\'envoyer l\'email de réinitialisation';
      if (error.code) {
        message = getErrorMessage(error.code);
      }
      
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </Text>

            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
            />

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Votre prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  testID="firstName-input"
                />
              </View>
            )}

            {!isLogin && (
              <View style={styles.userTypeContainer}>
                <Text style={styles.label}>Vous êtes :</Text>
                <View style={styles.userTypeOptions}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'benevole' && styles.selectedUserType
                    ]}
                    onPress={() => setUserType('benevole')}
                  >
                    <Text 
                      style={[
                        styles.userTypeText, 
                        userType === 'benevole' && styles.selectedUserTypeText
                      ]}
                    >
                      Bénévole
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'association' && styles.selectedUserType
                    ]}
                    onPress={() => setUserType('association')}
                  >
                    <Text 
                      style={[
                        styles.userTypeText, 
                        userType === 'association' && styles.selectedUserTypeText
                      ]}
                    >
                      Association
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage(null);
              }}
              secureTextEntry
              textContentType="password"
              autoComplete="password"
            />

            {isLogin && (
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsLogin(!isLogin);
                setErrorMessage(null);
              }}
            >
              <Text style={styles.switchText}>
                {isLogin ? 'Créer un compte' : 'Déjà un compte? Se connecter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  userTypeContainer: {
    marginBottom: 15,
  },
  userTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userTypeButton: {
    borderWidth: 1,
    borderColor: '#E0485A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedUserType: {
    backgroundColor: '#E0485A',
  },
  userTypeText: {
    color: '#E0485A',
    fontWeight: 'bold',
  },
  selectedUserTypeText: {
    color: 'white',
  },
  button: {
    backgroundColor: '#E0485A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#B71C1C',
    fontSize: 14,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
  },
  switchText: {
    color: '#E0485A',
    fontWeight: '600',
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
  },
  closeText: {
    color: '#666',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: '#E0485A',
    fontSize: 14,
  }
});

export default AuthScreen;
