# Guide de configuration Firebase

## Problème actuel
Vous rencontrez une erreur d'authentification indiquant que l'opération n'est pas autorisée (`auth/operation-not-allowed`). Cela signifie que l'authentification par email/mot de passe n'est pas activée dans votre projet Firebase.

## Comment activer l'authentification par email/mot de passe

1. Connectez-vous à la [console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet "millecoeurs-ba7a7"
3. Dans le menu de gauche, cliquez sur "Authentication"
4. Allez dans l'onglet "Sign-in method"
5. Trouvez "Email/Password" dans la liste des fournisseurs
6. Cliquez dessus et activez-le (mettez le commutateur sur "Enabled")
7. Assurez-vous que l'option "Email link (passwordless sign-in)" est configurée selon vos besoins
8. Cliquez sur "Save" pour enregistrer les modifications

![Activation de l'authentification par email/mot de passe](https://firebase.google.com/docs/auth/images/auth-providers.png)

## Comment obtenir les bonnes clés Firebase

Si vous avez besoin de vérifier ou d'obtenir les clés Firebase à nouveau :

1. Connectez-vous à la [console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet "millecoeurs-ba7a7"
3. Cliquez sur l'icône ⚙️ (roue dentée) en haut à droite, puis sur "Paramètres du projet"
4. Scrollez jusqu'à la section "Vos applications" et sélectionnez votre application web
5. Dans la section "SDK de configuration Firebase", vous trouverez toutes les clés nécessaires

## Vérifications supplémentaires

Après avoir activé l'authentification par email/mot de passe, assurez-vous que :

1. Vous avez bien redémarré votre application pour prendre en compte les changements
2. Votre application est autorisée à accéder à Firebase depuis son domaine (pertinent surtout pour les applications web)
3. La règle de sécurité de base de données permet l'authentification (si vous utilisez Firestore ou Realtime Database)

## Mise à jour du fichier .env.local (optionnel)

Si vous préférez ne pas avoir les clés Firebase en dur dans le code, vous pouvez créer un fichier `.env.local` à la racine de votre projet avec le contenu suivant :

```
FIREBASE_API_KEY=AIzaSyDIJyjyh2j9pUzgRhUZLeRlzj23FDHQBiw
FIREBASE_AUTH_DOMAIN=millecoeurs-ba7a7.firebaseapp.com
FIREBASE_DATABASE_URL=https://millecoeurs-ba7a7-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=millecoeurs-ba7a7
FIREBASE_STORAGE_BUCKET=millecoeurs-ba7a7.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=397224772460
FIREBASE_APP_ID=1:397224772460:web:b994c9511b12b9329a2949
FIREBASE_MEASUREMENT_ID=G-3BY2NJZWC4
```

## Dépannage supplémentaire

Si vous continuez à rencontrer des problèmes après ces étapes :

1. Vérifiez les journaux de console pour des erreurs détaillées
2. Assurez-vous que la date et l'heure de votre appareil sont correctes
3. Vérifiez que le plan de votre projet Firebase (Spark/Blaze) autorise l'opération que vous essayez d'effectuer
4. Consultez la documentation Firebase sur l'authentification : [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
