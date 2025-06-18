const path = require("path");
const dotenv = require("dotenv");

// Charger les variables d'environnement à partir du fichier .env (si disponible)
const env = process.env.NODE_ENV || "development";
const envPath = path.resolve(
  __dirname,
  env === "production" ? ".env" : ".env.local"
);
dotenv.config({ path: envPath });

module.exports = {
  expo: {
    name: "Milliers de Coeurs",
    slug: "milliers-de-coeurs",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#E0485A",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.guigui.mld",
    },
    android: {
      package: "com.guigui.mld",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#E0485A",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    scheme: "milliersdecoeurs",
    newArchEnabled: true,
    plugins: ["expo-router", "expo-web-browser"],
    extra: {
      // Variables Firebase
      firebaseApiKey:
        process.env.FIREBASE_API_KEY ||
        "AIzaSyDIJyjyh2j9pUzgRhUZLeRlzj23FDHQBiw",
      firebaseAuthDomain:
        process.env.FIREBASE_AUTH_DOMAIN || "millecoeurs-ba7a7.firebaseapp.com",
      firebaseDatabaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://millecoeurs-ba7a7-default-rtdb.firebaseio.com",
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "millecoeurs-ba7a7",
      firebaseStorageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        "millecoeurs-ba7a7.firebasestorage.app",
      firebaseMessagingSenderId:
        process.env.FIREBASE_MESSAGING_SENDER_ID || "397224772460",
      firebaseAppId:
        process.env.FIREBASE_APP_ID ||
        "1:397224772460:web:b994c9511b12b9329a2949",
      firebaseMeasurementId:
        process.env.FIREBASE_MEASUREMENT_ID || "G-3BY2NJZWC4",

      // Autres variables d'environnement si nécessaire
      eas: {
        projectId: "your-project-id",
      },
    },
  },
};
