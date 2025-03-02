# Configuration de PostgreSQL pour Milliers de Coeurs

Ce document explique comment configurer PostgreSQL pour l'application Milliers de Coeurs.

## Prérequis

1. [PostgreSQL](https://www.postgresql.org/download/) installé sur votre machine ou un serveur accessible
2. [Node.js](https://nodejs.org/) et npm

## Installation de PostgreSQL

### Windows

1. Téléchargez et installez PostgreSQL depuis [le site officiel](https://www.postgresql.org/download/windows/)
2. Suivez les instructions d'installation et notez le mot de passe que vous avez défini pour l'utilisateur `postgres`
3. Installez pgAdmin pour faciliter la gestion de vos bases de données (inclus dans l'installateur)

### macOS

```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

## Configuration de la base de données

1. Créez un fichier `.env.local` à la racine du projet basé sur le fichier `.env.example`
2. Remplissez-le avec vos informations de connexion PostgreSQL

```
# PostgreSQL Configuration
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=milliers_de_coeurs_dev
DB_TEST_NAME=milliers_de_coeurs_test
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET=une_chaine_secrete_aleatoire_longue
```

3. Créez les bases de données nécessaires

```bash
# Connexion à PostgreSQL avec l'utilisateur postgres
psql -U postgres

# Dans l'invite PostgreSQL
CREATE DATABASE milliers_de_coeurs_dev;
CREATE DATABASE milliers_de_coeurs_test;
```

## Exécution des migrations

Pour initialiser la structure de la base de données, exécutez les commandes suivantes :

```bash
# Installation de Sequelize CLI globalement (si pas déjà fait)
npm install -g sequelize-cli

# Exécuter les migrations
npx sequelize-cli db:migrate

# Ajouter des données de test (optionnel)
npx sequelize-cli db:seed:all
```

## Démarrer le serveur API

```bash
node server/index.js
```

Le serveur API démarrera sur http://localhost:5000.

## Endpoints de l'API

### Authentification

- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
  ```json
  {
    "email": "utilisateur@example.com",
    "password": "motdepasse",
    "firstName": "Prénom",
    "lastName": "Nom"
  }
  ```

- `POST /api/auth/login` - Connexion d'un utilisateur
  ```json
  {
    "email": "utilisateur@example.com",
    "password": "motdepasse"
  }
  ```

- `POST /api/auth/forgot-password` - Demande de réinitialisation de mot de passe
  ```json
  {
    "email": "utilisateur@example.com"
  }
  ```

- `POST /api/auth/reset-password` - Réinitialisation du mot de passe
  ```json
  {
    "token": "token_de_reinitialisation",
    "newPassword": "nouveau_mot_de_passe"
  }
  ```

### Profil utilisateur

- `GET /api/profile` - Récupérer le profil de l'utilisateur connecté
  - Nécessite un en-tête d'authentification : `Authorization: Bearer votre_token_jwt`

## Structure de la base de données

### Table "users"
- `id` (UUID) - Identifiant unique de l'utilisateur (clé primaire)
- `email` (STRING) - Email de l'utilisateur, unique
- `password` (STRING) - Mot de passe haché 
- `firstName` (STRING) - Prénom
- `lastName` (STRING) - Nom
- `phoneNumber` (STRING) - Numéro de téléphone
- `address` (STRING) - Adresse
- `postalCode` (STRING) - Code postal
- `city` (STRING) - Ville
- `bio` (TEXT) - Biographie
- `profileImageUrl` (STRING) - URL de l'image de profil
- `skills` (ARRAY) - Tableau des compétences
- `experiences` (JSONB) - Expériences professionnelles en JSON
- `transport` (STRING) - Mode de transport
- `isAdmin` (BOOLEAN) - Indicateur d'administrateur
- `lastLogin` (DATE) - Date de dernière connexion
- `resetPasswordToken` (STRING) - Token de réinitialisation de mot de passe
- `resetPasswordExpires` (DATE) - Date d'expiration du token
- `createdAt` (DATE) - Date de création
- `updatedAt` (DATE) - Date de dernière mise à jour

## Sécurité

- Les mots de passe sont hachés avec bcrypt avant stockage
- L'authentification utilise des tokens JWT
- Les tokens JWT expirent après 24 heures

## Ressources utiles

- [Documentation Sequelize](https://sequelize.org/)
- [Documentation Express](https://expressjs.com/fr/)
- [Documentation JWT](https://github.com/auth0/node-jsonwebtoken)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
