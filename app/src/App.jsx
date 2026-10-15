import { useEffect, useState } from 'react'
import Cadre from './composants/Cadre'
import Demarrage from './ecrans/Demarrage'
import Chargement from './ecrans/Chargement'
import Erreur from './ecrans/Erreur'
import ChoixNiveau from './ecrans/ChoixNiveau'
import ChoixMatiere from './ecrans/ChoixMatiere'
import ListeUnites from './ecrans/ListeUnites'
import Activite from './ecrans/Activite'
import { chargerNiveaux, chargerUnites, grouperParMatiere } from './donnees'
import { configOk } from './firebase'
import { arreterSon } from './audio'

// Navigation de l'application (sans routeur, un simple état « ecran ») :
//   demarrage → niveau → matiere → unites → activite
export default function App() {
  const [ecran, setEcran] = useState('demarrage')
  const [erreur, setErreur] = useState(null)       // message affiché par l'écran Erreur
  const [chargement, setChargement] = useState(false)

  const [niveaux, setNiveaux] = useState([])
  const [niveau, setNiveau] = useState(null)       // niveau choisi
  const [matieres, setMatieres] = useState([])     // [{ nom, unites }]
  const [matiere, setMatiere] = useState(null)     // matière choisie
  const [unite, setUnite] = useState(null)         // unité choisie

  // Change d'écran en coupant le son en cours.
  const aller = (nom) => {
    arreterSon()
    setEcran(nom)
  }

  // Au démarrage : charge les niveaux pendant l'écran d'accueil
  // (au moins 2,2 s pour laisser la barre de chargement se remplir).
  async function demarrer() {
    setErreur(null)
    setEcran('demarrage')
    if (!configOk) {
      setErreur('La configuration Firebase est absente. Remplis le fichier .env.local.')
      return
    }
    const pause = new Promise((r) => setTimeout(r, 2200))
    try {
      const [liste] = await Promise.all([chargerNiveaux(), pause])
      if (liste.length === 0) throw new Error('aucun niveau')
      setNiveaux(liste)
      setEcran('niveau')
    } catch (e) {
      console.error(e)
      setErreur("Le contenu n'a pas pu être chargé. Connecte la tablette à Internet une première fois.")
    }
  }

  useEffect(() => {
    demarrer()
  }, [])

  // Niveau choisi : on charge ses unités puis on affiche les matières.
  async function choisirNiveau(n) {
    setNiveau(n)
    setChargement(true)
    try {
      setMatieres(grouperParMatiere(await chargerUnites(n.id)))
      aller('matiere')
    } catch (e) {
      console.error(e)
      setErreur("Les unités de ce niveau n'ont pas pu être chargées.")
    } finally {
      setChargement(false)
    }
  }

  // --- Affichage -----------------------------------------------------------
  let contenu
  if (erreur) {
    contenu = <Erreur message={erreur} onReessayer={demarrer} />
  } else if (ecran === 'demarrage') {
    contenu = <Demarrage />
  } else if (ecran === 'niveau') {
    contenu = <ChoixNiveau niveaux={niveaux} onChoisir={choisirNiveau} />
  } else if (ecran === 'matiere') {
    contenu = (
      <ChoixMatiere
        niveau={niveau}
        matieres={matieres}
        onRetour={() => aller('niveau')}
        onChoisir={(m) => { setMatiere(m); aller('unites') }}
      />
    )
  } else if (ecran === 'unites') {
    contenu = (
      <ListeUnites
        niveau={niveau}
        matiere={matiere}
        onRetour={() => aller('matiere')}
        onChoisir={(u) => { setUnite(u); aller('activite') }}
      />
    )
  } else if (ecran === 'activite') {
    contenu = (
      <Activite
        // « key » : repart de zéro quand on change d'unité
        key={unite.id}
        unite={unite}
        numeroUnite={matiere.unites.indexOf(unite) + 1}
        onQuitter={() => aller('unites')}
      />
    )
  }

  return (
    <Cadre>
      {contenu}
      {chargement && <Chargement />}
    </Cadre>
  )
}
