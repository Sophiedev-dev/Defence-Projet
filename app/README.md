# Lecture guidée — application tablette

Application React (Vite) qui reprend le design « Lecture Guidée Tablette »
et lit le contenu pédagogique dans Firestore (`niveaux/` et `unites/`,
remplis par `OpenPronounce/import-contenu/envoyer.py`).

## Démarrer

```powershell
cd app
npm install
copy .env.example .env.local   # puis remplir la configuration Firebase
npm run dev
```

Ouvrir l'adresse affichée (http://localhost:5173). Le serveur est aussi
visible sur le réseau local pour tester sur la tablette.

> Le micro du navigateur ne fonctionne qu'en `localhost` ou en `https`.

## Écrans

| Écran | Fichier | Inspiré de |
|---|---|---|
| Démarrage | `src/ecrans/Demarrage.jsx` | E1 |
| Choix du niveau | `src/ecrans/ChoixNiveau.jsx` | E2 (choix du profil) |
| Matière | `src/ecrans/ChoixMatiere.jsx` | E3 (cartes « Mes leçons ») |
| Unités | `src/ecrans/ListeUnites.jsx` | E4 (liste des leçons) |
| Activité | `src/ecrans/Activite.jsx` | E5–E8 (lecture, enregistrement, analyse, correction) |
| Fenêtre « Mot » | `src/composants/FenetreMot.jsx` | E9 |
| Résultat | `src/ecrans/Resultat.jsx` | E10 |
| Serveur injoignable | `src/ecrans/ServeurIndisponible.jsx` | E17 |
| Erreur de chargement | `src/ecrans/Erreur.jsx` | E17 |

## Évaluation de la prononciation

L'enregistrement est envoyé au serveur OpenPronounce (`/pronunciation`,
voix modèle des mots avec `/tts`). Le serveur doit tourner :
`OpenPronounce/start_server.bat`.

Les seuils (couleur des mots, étoiles) et l'adresse du serveur sont dans
`src/config.js`. L'adresse peut aussi être donnée dans `.env.local` avec
`VITE_OPENPRONOUNCE_URL` (utile quand l'appli tourne sur la tablette).

## Hors ligne

- **Données** : Firestore utilise un cache persistant (`src/firebase.js`).
  Il faut ouvrir l'application une première fois avec Internet.
- **Images et sons** : servis depuis `public/images` et `public/audio`.
