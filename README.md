# Mon Application Mobile

Une application mobile moderne construite avec React Native et Expo.

## Structure du Projet

```
src/
├── components/
│   ├── layout/         # Composants de mise en page (Header, Footer)
│   ├── themed/         # Composants avec thème (ThemedText, ThemedView)
│   └── ui/
│       ├── buttons/    # Boutons et actions
│       ├── cards/      # Cartes et conteneurs
│       └── navigation/ # Composants de navigation
├── config/
│   └── AppConfig.ts    # Configuration globale de l'application
├── constants/
│   └── styles.ts       # Styles globaux et thèmes
├── screens/
│   ├── home/          # Écran d'accueil et ses composants
│   ├── profile/       # Écran de profil et ses composants
│   └── settings/      # Écran des paramètres et ses composants
├── types/
│   └── navigation.ts  # Types TypeScript pour la navigation
└── utils/            # Utilitaires et helpers
```

## Fonctionnalités

- Navigation entre les pages avec Expo Router
- Design moderne et responsive
- Thème personnalisable
- Composants réutilisables
- Support TypeScript complet

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Lancer l'application :
```bash
npx expo start
```

## Technologies Utilisées

- React Native
- Expo
- TypeScript
- Expo Router
- React Navigation
- Ionicons

## Développement

Pour ajouter une nouvelle page :

1. Créer un nouveau dossier dans `src/screens/`
2. Ajouter la route dans `app/(tabs)/_layout.tsx`
3. Mettre à jour les types dans `src/types/navigation.ts`

## Conventions de Code

- Utiliser TypeScript pour tous les nouveaux fichiers
- Suivre les conventions de nommage :
  - PascalCase pour les composants
  - camelCase pour les fonctions et variables
  - snake_case pour les fichiers de configuration
- Utiliser les composants Themed* pour la cohérence visuelle
