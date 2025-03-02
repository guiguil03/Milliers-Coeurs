// Script pour migrer les annonces du fichier local vers Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - COPIER DEPUIS config/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyDIJyjyh2j9pUzgRhUZLeRlzj23FDHQBiw",
  authDomain: "millecoeurs-ba7a7.firebaseapp.com",
  databaseURL: "https://millecoeurs-ba7a7-default-rtdb.firebaseio.com",
  projectId: "millecoeurs-ba7a7",
  storageBucket: "millecoeurs-ba7a7.firebasestorage.app",
  messagingSenderId: "397224772460",
  appId: "1:397224772460:web:b994c9511b12b9329a2949",
  measurementId: "G-3BY2NJZWC4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données des annonces à migrer
const annoncesData = [
  {
    logo: 'https://i.pravatar.cc/100?img=10',
    organisation: 'Cibou & Compagnie',
    description: 'Nous recherchons un(e) bénévole pour promener nos chiens durant 2h ce',
    date: 'samedi 21 décembre',
    important: 'samedi 21 décembre',
    lieu: 'Fontainebleau',
    categorie: 'Animaux'
  },
  {
    logo: 'https://i.pravatar.cc/100?img=13',
    organisation: 'La Croix Rouge Fontainebleau',
    description: 'Nous recherchons plusieurs bénévoles pour une maraude dans Fontainebleau de 10h à 16h ce',
    date: 'dimanche 22 décembre',
    important: 'dimanche 22 décembre',
    lieu: 'Fontainebleau',
    categorie: 'Aide humanitaire'
  },
  {
    logo: 'https://i.pravatar.cc/100?img=1',
    organisation: 'Les Restos du Coeur Nemours',
    description: 'Nous recherchons plusieurs bénévoles pour une collecte au E.Leclerc de Varennes sur Seine le',
    date: 'vendredi 28 décembre',
    important: 'vendredi 28 décembre',
    lieu: 'Varennes sur Seine',
    categorie: 'Aide alimentaire'
  }
];

// Fonction pour migrer les annonces vers Firestore
async function migrateAnnonces() {
  console.log('Début de la migration des annonces vers Firestore...');
  
  try {
    const annoncesCollection = collection(db, 'annonces');
    
    for (const annonce of annoncesData) {
      // Filtrer les champs undefined (pas acceptés par Firestore)
      const cleanedAnnonce = Object.fromEntries(
        Object.entries(annonce).filter(([_, value]) => value !== undefined)
      );
      
      // Ajouter les champs timestamp
      const annonceWithTimestamps = {
        ...cleanedAnnonce,
        dateCreation: serverTimestamp(),
        dateModification: serverTimestamp(),
        statut: 'active',
        places: null,
        contact: { email: null, telephone: null }
      };
      
      const docRef = await addDoc(annoncesCollection, annonceWithTimestamps);
      console.log(`Annonce créée avec succès - ID: ${docRef.id}`);
    }
    
    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
}

// Exécuter la migration
migrateAnnonces().then(() => {
  console.log('Processus de migration terminé');
});
