// Lecture du contenu pédagogique dans Firestore.
//
// Structure (créée par OpenPronounce/import-contenu/envoyer.py) :
//   niveaux/{id}  → { id, nom, ordre }
//   unites/{id}   → { id, niveau, matiere, titre, ordre, ecrans: [...] }
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase'

// Chemin d'un fichier placé dans public/ (fonctionne aussi si l'app
// est servie dans un sous-dossier).
export const fichier = (chemin) => import.meta.env.BASE_URL + chemin

// Trie par « ordre » (les valeurs vides passent à la fin), puis par id.
function trier(liste) {
  return [...liste].sort((a, b) => {
    const oa = a.ordre ?? Infinity
    const ob = b.ordre ?? Infinity
    if (oa !== ob) return oa - ob
    return String(a.id).localeCompare(String(b.id))
  })
}

// Tous les niveaux, dans l'ordre.
export async function chargerNiveaux() {
  const res = await getDocs(collection(db, 'niveaux'))
  return trier(res.docs.map((d) => ({ id: d.id, ...d.data() })))
}

// Toutes les unités d'un niveau, dans l'ordre.
// Chaque écran reçoit une image : celle de Firestore si elle existe,
// sinon les images de public/images/ numérotées dans l'ordre des écrans
// (1.jpeg = unité 1 écran 1, 2.jpeg = unité 1 écran 2, etc.).
export async function chargerUnites(niveauId) {
  const q = query(collection(db, 'unites'), where('niveau', '==', niveauId))
  const res = await getDocs(q)
  const unites = trier(res.docs.map((d) => ({ id: d.id, ...d.data() })))

  let numero = 0
  return unites.map((u) => ({
    ...u,
    ecrans: [...(u.ecrans || [])]
      .sort((a, b) => a.screen_number - b.screen_number)
      .map((e) => {
        numero += 1
        return { ...e, image: e.image ? `images/${e.image}` : `images/${numero}.jpeg` }
      }),
  }))
}

// Regroupe les unités par matière : [{ nom, unites: [...] }, ...]
export function grouperParMatiere(unites) {
  const groupes = new Map()
  for (const u of unites) {
    const nom = u.matiere || 'General'
    if (!groupes.has(nom)) groupes.set(nom, [])
    groupes.get(nom).push(u)
  }
  return [...groupes].map(([nom, liste]) => ({ nom, unites: liste }))
}
