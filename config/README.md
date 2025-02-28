# Configuration Firebase

Pour configurer Firebase dans l'application, suivez ces étapes :

1. Créez un projet Firebase sur [console.firebase.google.com](https://console.firebase.google.com)
2. Ajoutez une application web à votre projet Firebase
3. Copiez les informations de configuration qui vous sont fournies
4. Remplacez les valeurs dans le fichier `firebase.ts` par vos propres informations :

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Services Firebase utilisés

Cette application utilise les services Firebase suivants :

- **Authentication** : pour gérer l'authentification des utilisateurs
- **Firestore** : pour stocker les données (annonces, profils, messages)
- **Storage** : pour stocker les fichiers (images des annonces, photos de profil)

## Sécurité

Ne partagez jamais votre fichier de configuration Firebase avec vos clés API dans un dépôt public.
Utilisez des variables d'environnement ou un système sécurisé pour gérer vos clés en production.
