// Réglages de l'évaluation de la prononciation.
// Modifier ces valeurs ici suffit : aucun autre fichier n'est à toucher.

// Adresse du serveur OpenPronounce : l'adresse IP du PC sur le Wi-Fi.
// Elle se change dans l'appli (écran Réglages, cadenas en bas à droite du
// choix du niveau) et reste enregistrée sur l'appareil.
// Valeur de départ : VITE_OPENPRONOUNCE_URL dans .env.local, sinon celle-ci.
const ADRESSE_PAR_DEFAUT = import.meta.env.VITE_OPENPRONOUNCE_URL || 'http://192.168.1.20:8000'
const CLE_ADRESSE = 'adresseServeurOpenPronounce'

export function lireAdresseServeur() {
  try {
    return localStorage.getItem(CLE_ADRESSE) || ADRESSE_PAR_DEFAUT
  } catch {
    return ADRESSE_PAR_DEFAUT
  }
}

// Enregistre l'adresse (sans « / » final, pour pouvoir y ajouter « /tts » etc.).
export function enregistrerAdresseServeur(adresse) {
  const propre = adresse.trim().replace(/\/+$/, '')
  try {
    localStorage.setItem(CLE_ADRESSE, propre)
  } catch {
    /* stockage indisponible : l'adresse ne sera pas gardée */
  }
  return propre
}

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
