const path = require('path');
const dotenv = require('dotenv');

// Charger les variables d'environnement à partir du fichier .env (si disponible)
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, env === 'production' ? '.env' : '.env.local');
dotenv.config({ path: envPath });

module.exports = {
  expo: {
    name: "Milliers de Coeurs",
    slug: "milliers-de-coeurs",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#FF69B4"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FF69B4"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Variables Firebase
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      
      // Autres variables d'environnement si nécessaire
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
