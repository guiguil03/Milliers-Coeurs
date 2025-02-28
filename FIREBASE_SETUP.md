# Configuration de Firebase pour Milliers de Coeurs

Ce document explique comment configurer Firebase pour l'application Milliers de Coeurs.

## Prérequis

1. Un compte Google
2. Un projet Firebase (gratuit)

## Étapes de configuration

### 1. Créer un projet Firebase

1. Rendez-vous sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez sur "Ajouter un projet"
3. Donnez un nom à votre projet (par exemple, "milliers-de-coeurs")
4. Désactivez Google Analytics si vous n'en avez pas besoin
5. Cliquez sur "Créer un projet"

### 2. Enregistrer l'application web

1. Sur la page d'accueil du projet, cliquez sur l'icône Web (</>) pour ajouter une application web
2. Donnez un surnom à votre application (par exemple, "milliers-de-coeurs-web")
3. Cochez la case "Configurer également Firebase Hosting pour cette application" si vous prévoyez de déployer l'application web
4. Cliquez sur "Enregistrer l'application"
5. Copiez les informations de configuration Firebase qui s'affichent

### 3. Configuration dans l'application

1. Créez un fichier `.env.local` à la racine du projet basé sur le fichier `.env.example`
2. Remplissez-le avec les informations de configuration Firebase copiées précédemment

```
# Firebase Configuration
FIREBASE_API_KEY=votre_api_key
FIREBASE_AUTH_DOMAIN=votre_auth_domain
FIREBASE_PROJECT_ID=votre_project_id
FIREBASE_STORAGE_BUCKET=votre_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
FIREBASE_APP_ID=votre_app_id

# Expo Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID
```

### 4. Activer les services nécessaires

#### Authentication
1. Dans la console Firebase, accédez à "Authentication" dans le menu latéral
2. Cliquez sur "Commencer"
3. Activez au moins la méthode "Email/Mot de passe"
4. Cliquez sur "Enregistrer"

#### Firestore Database
1. Dans la console Firebase, accédez à "Firestore Database" dans le menu latéral
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode de test" pour commencer (n'oubliez pas de définir des règles de sécurité avant la production)
4. Sélectionnez l'emplacement du serveur le plus proche de vos utilisateurs
5. Cliquez sur "Activer"

#### Storage
1. Dans la console Firebase, accédez à "Storage" dans le menu latéral
2. Cliquez sur "Commencer"
3. Acceptez les règles de sécurité par défaut pour le moment
4. Cliquez sur "Terminé"

### 5. Règles de sécurité (à configurer avant la production)

#### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /annonces/{annonceId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /annonces/{annonceId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Structure de la base de données

### Collection "profiles"
- Document ID: uid de l'utilisateur
- Champs: prenom, nom, email, image, adresse, code_postal, ville, telephone, bio, competences, experiences, transport

### Collection "annonces"
- Document ID: auto-généré
- Champs: titre, description, organisation, date, lieu, categorie, competences_requises, date_creation, image, nombre_places, duree

### Collection "conversations"
- Document ID: auto-généré
- Champs: participants, last_message, unread_count

### Collection "messages"
- Document ID: auto-généré
- Champs: sender_id, receiver_id, content, timestamp, read, conversation_id

## Ressources utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide React Native Firebase](https://rnfirebase.io/)
- [Guide d'utilisation de Firebase avec Expo](https://docs.expo.dev/guides/using-firebase/)
