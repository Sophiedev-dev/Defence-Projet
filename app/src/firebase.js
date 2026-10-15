// Connexion à Firebase avec cache hors ligne.
//
// La configuration est lue dans le fichier .env.local (voir .env.example).
// Grâce à « persistentLocalCache », Firestore garde une copie des données
// dans le navigateur (IndexedDB) : une fois chargé une première fois avec
// Internet, le contenu reste disponible sans connexion.
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Vrai si les clés indispensables sont renseignées.
export const configOk = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

const app = initializeApp(firebaseConfig)

// Cache persistant partagé entre plusieurs onglets ouverts.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
