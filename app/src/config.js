// Réglages de l'évaluation de la prononciation.
// Modifier ces valeurs ici suffit : aucun autre fichier n'est à toucher.

// Adresse du serveur OpenPronounce. Peut être remplacée dans .env.local par
// VITE_OPENPRONOUNCE_URL (par ex. l'adresse IP du PC si l'appli tourne sur la tablette).
export const SERVEUR_OPENPRONOUNCE = import.meta.env.VITE_OPENPRONOUNCE_URL || 'http://localhost:8000'

// Langue envoyée au serveur (champ « lang »).
export const LANGUE = 'en'

// Couleur d'un mot en erreur selon la confiance du serveur (0 à 1) :
//   confiance < SEUIL_PRESQUE  → jaune ondulé « Presque »
//   confiance ≥ SEUIL_PRESQUE  → rouge pointillé « À réessayer »
// Un mot manquant (rien entendu) est toujours « À réessayer ».
export const SEUIL_PRESQUE = 0.7

// Nombre d'étoiles selon le score du serveur (0 à 100).
export const SCORE_TROIS_ETOILES = 90
export const SCORE_DEUX_ETOILES = 70

// Temps maximum d'attente d'une réponse du serveur (la première analyse
// peut être lente : le serveur charge ses modèles).
export const DELAI_MAX_SERVEUR_MS = 90000

// Dans la fenêtre « Mot », l'enregistrement s'arrête seul après ce délai.
export const DUREE_MAX_MOT_MS = 4000
