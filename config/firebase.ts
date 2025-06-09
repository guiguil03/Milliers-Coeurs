// Import Firebase
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getDatabase, Database } from 'firebase/database';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Obtenir les variables d'environnement d'Expo
const expoConstants = Constants.expoConfig?.extra || {};

// Configuration Firebase avec variables d'environnement Expo
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENT_ID
};

// Vérifier si la configuration est valide
const isValidConfig = (config: any) => {
  return Object.values(config).every(value => 
    value && typeof value === 'string' && !value.includes("YOUR_")
  );
};

if (!isValidConfig(firebaseConfig)) {
  console.error("⚠️ CONFIGURATION FIREBASE INVALIDE:", 
    Object.entries(firebaseConfig)
      .filter(([_, value]) => !value || typeof value !== 'string' || value.includes("YOUR_"))
      .map(([key]) => key)
      .join(", ")
  );
}

console.log("Initialisation de Firebase avec la configuration:", JSON.stringify(firebaseConfig, null, 2));

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const rtdb: Database = getDatabase(app);

let analytics: Analytics | undefined;
try {
  analytics = getAnalytics(app);
  console.log("✅ Firebase Analytics initialisé avec succès!");
} catch (e) {
  console.log("ℹ️ Firebase Analytics non initialisé - peut ne pas être supporté sur cette plateforme");
}

console.log("✅ Firebase initialisé avec succès!");

// Exporter les instances
export { app, auth, db, storage, analytics, rtdb };
