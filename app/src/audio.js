// Petits outils audio partagés par tous les écrans.
// Un seul son joue à la fois : lancer un son arrête le précédent.

let lecteur = null

// Arrête le son en cours (fichier ou voix de synthèse).
export function arreterSon() {
  if (lecteur) {
    lecteur.onended = null
    lecteur.pause()
    lecteur = null
  }
  try {
    window.speechSynthesis?.cancel()
  } catch {
    /* synthèse vocale absente : rien à arrêter */
  }
}

// Joue un fichier audio (ex. « audio/unit_01_school_s1_texte.wav »).
// « quandFini » est appelé à la fin, ou tout de suite en cas d'erreur.
export function jouerFichier(url, quandFini) {
  arreterSon()
  const a = new Audio(url)
  lecteur = a
  const fin = () => {
    if (lecteur === a) lecteur = null
    quandFini?.()
  }
  a.onended = fin
  a.play().catch(fin)
}

// Lit une phrase avec la voix de synthèse de la tablette.
export function parler(texte, langue = 'fr-FR') {
  arreterSon()
  try {
    const u = new SpeechSynthesisUtterance(texte)
    u.lang = langue
    u.rate = 0.95
    window.speechSynthesis.speak(u)
  } catch {
    /* synthèse vocale absente : on ignore */
  }
}
