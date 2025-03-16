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
import { getErrorMessage } from '../services/authService';
import { userDataService } from '../services/userDataService';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, register, forgotPassword } = useAuthContext();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
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
        console.log("[AuthScreen] Connexion réussie, UID:", user?.uid);
      } else {
        const displayName = firstName.trim();
        console.log("[AuthScreen] Tentative d'inscription avec email:", email, "et prénom:", displayName);
        
        const user = await register({ 
          email, 
          password, 
          displayName 
        });
        
        if (user && user.uid) {
          console.log("[AuthScreen] Enregistrement local du prénom pour l'utilisateur:", user.uid);
          await userDataService.saveDisplayName(user.uid, displayName);
        }
        
        console.log("[AuthScreen] Inscription réussie");
      }
      
      Alert.alert(
        isLogin ? "Connexion réussie" : "Inscription réussie",
        isLogin ? "Vous êtes maintenant connecté." : `Bienvenue ${firstName}! Votre compte a été créé avec succès.`,
        [{ text: "OK", onPress: onClose }]
      );
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
    width: 'auto',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
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
    color: '#E0485A',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#E0485A',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginVertical: 10,
  },
  switchText: {
    color: '#E0485A',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10,
  },
  closeText: {
    color: '#777',
    fontSize: 14,
  },
  forgotPasswordContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#E0485A',
    fontSize: 14,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default AuthScreen;
