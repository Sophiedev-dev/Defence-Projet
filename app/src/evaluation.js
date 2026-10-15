// Évaluation de la prononciation avec le serveur OpenPronounce.
import {
  SERVEUR_OPENPRONOUNCE, LANGUE, SEUIL_PRESQUE,
  SCORE_TROIS_ETOILES, SCORE_DEUX_ETOILES, DELAI_MAX_SERVEUR_MS,
} from './config'

// --- Découpage du texte en mots ---------------------------------------------
//
// Le serveur numérote les mots avec la règle Python  \b[\w']+\b  :
// la ponctuation est ignorée (« Sam says, "Good morning!" » → sam, says, good, morning).
// On applique ici la même règle pour que « position » désigne le bon mot affiché.
const MOT = /[\p{L}\p{N}_]+(?:'[\p{L}\p{N}_]+)*/gu

// Découpe le texte pour l'affichage.
// Renvoie :
//   jetons : un tableau par groupe séparé par des espaces, chaque groupe étant
//            une liste de morceaux { texte, mot } où « mot » est le numéro du mot
//            (ou null pour la ponctuation) ;
//   mots   : la liste des mots seuls, dans l'ordre (mots[n] = mot numéro n).
export function decouperTexte(texte) {
  const jetons = []
  const mots = []
  for (const groupe of texte.split(/\s+/).filter(Boolean)) {
    const morceaux = []
    let fin = 0
    for (const m of groupe.matchAll(MOT)) {
      if (m.index > fin) morceaux.push({ texte: groupe.slice(fin, m.index), mot: null })
      morceaux.push({ texte: m[0], mot: mots.length })
      mots.push(m[0])
      fin = m.index + m[0].length
    }
    if (fin < groupe.length) morceaux.push({ texte: groupe.slice(fin), mot: null })
    jetons.push(morceaux)
  }
  return { jetons, mots }
}

// --- Statut d'un mot --------------------------------------------------------
// 'bien' (vert), 'presque' (jaune) ou 'reessayer' (rouge).

export function statutErreur(erreur) {
  if (!erreur.actual) return 'reessayer'              // mot manquant
  const confiance = erreur.confidence ?? 1             // absente en mode texte : on la considère sûre
  return confiance < SEUIL_PRESQUE ? 'presque' : 'reessayer'
}

// Calcule le statut de chaque mot à partir de differences.errors.
// On vérifie que errors[i].position désigne bien le mot errors[i].word ;
// sinon (ancien mode du serveur où position compte les phonèmes), on cherche
// ce mot dans le texte, après le dernier mot trouvé.
export function statutsDesMots(mots, erreurs = []) {
  const statuts = mots.map(() => 'bien')
  const pareil = (n, mot) => mots[n]?.toLowerCase() === String(mot).toLowerCase()
  let suivant = 0
  for (const e of erreurs) {
    let n = e.position
    if (!pareil(n, e.word)) {
      n = mots.findIndex((_, k) => k >= suivant && pareil(k, e.word))
      if (n === -1) {
        console.warn('Mot du serveur introuvable dans le texte :', e)
        continue
      }
    }
    statuts[n] = statutErreur(e)
    suivant = n + 1
  }
  return statuts
}

export function etoilesDuScore(score) {
  if (score >= SCORE_TROIS_ETOILES) return 3
  if (score >= SCORE_DEUX_ETOILES) return 2
  return 1
}

// --- Appels au serveur ------------------------------------------------------

// fetch avec délai maximum : au-delà, on considère que le serveur ne répond pas.
async function appeler(chemin, formulaire) {
  const res = await fetch(SERVEUR_OPENPRONOUNCE + chemin, {
    method: 'POST',
    body: formulaire,
    signal: AbortSignal.timeout(DELAI_MAX_SERVEUR_MS),
  })
  if (!res.ok) throw new Error(`OpenPronounce ${chemin} : erreur ${res.status}`)
  return res
}

// Extension du fichier selon le format enregistré par le navigateur.
function nomFichier(blob) {
  if (blob.type.includes('mp4')) return 'lecture.m4a'
  if (blob.type.includes('ogg')) return 'lecture.ogg'
  return 'lecture.webm'
}

// Envoie un enregistrement et le texte attendu ; renvoie la réponse du serveur
// ({ score, differences: { errors: [...] }, ... }).
export async function evaluerLecture(blob, texteAttendu) {
  const f = new FormData()
  f.append('file', blob, nomFichier(blob))
  f.append('expected_text', texteAttendu)
  f.append('lang', LANGUE)
  return (await appeler('/pronunciation', f)).json()
}

// Prononciation modèle d'un mot (fichier wav), gardée en mémoire pour ne pas
// redemander le même mot au serveur.
const voixModele = new Map()

export async function urlVoixModele(texte) {
  const cle = texte.toLowerCase()
  if (!voixModele.has(cle)) {
    const f = new FormData()
    f.append('text', texte)
    f.append('lang', LANGUE)
    const blob = await (await appeler('/tts', f)).blob()
    voixModele.set(cle, URL.createObjectURL(blob))
  }
  return voixModele.get(cle)
}
