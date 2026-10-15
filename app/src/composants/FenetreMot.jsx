import { useEffect, useRef, useState } from 'react'
import { IconeHautParleur, IconeMicro } from './Icones'
import { STYLE_STATUT } from './statuts'
import { useEnregistreur } from './useEnregistreur'
import { evaluerLecture, statutErreur, urlVoixModele } from '../evaluation'
import { DUREE_MAX_MOT_MS } from '../config'
import { arreterSon, jouerFichier, parler } from '../audio'

// Messages sous le mot, selon l'étape.
const MESSAGES = {
  attente: { texte: 'Écoute, puis répète.', couleur: '#6B6F86' },
  ecoute: { texte: 'Écoute bien…', couleur: '#23305E' },
  enregistre: { texte: 'À toi ! Dis le mot.', couleur: '#C9472E' },
  verifie: { texte: 'Je vérifie…', couleur: '#6B6F86' },
  bien: { texte: 'Bravo ! C’est parfait.', couleur: '#146C36' },
  presque: { texte: 'Presque ! Réessaie ce mot.', couleur: '#8A5A00' },
  reessayer: { texte: 'Encore un effort ! Réessaie ce mot.', couleur: '#B23A1E' },
  panne: { texte: 'Correction indisponible. Répète quand même !', couleur: '#6B6F86' },
}

// Fenêtre « Mot » (écran E9 du design) : le mot en grand, un bouton pour
// l'écouter (voix /tts d'OpenPronounce) et un micro pour le redire seul.
// « onNouveauStatut » reçoit le statut du mot après chaque essai.
export default function FenetreMot({ mot, statut, onNouveauStatut, onFermer }) {
  const [etape, setEtape] = useState('attente')
  const micro = useEnregistreur()
  const arretAuto = useRef(null)
  const ouverte = useRef(true)

  useEffect(() => () => {
    ouverte.current = false
    clearTimeout(arretAuto.current)
    arreterSon()
  }, [])

  async function ecouter() {
    if (micro.actif) return
    setEtape('ecoute')
    try {
      jouerFichier(await urlVoixModele(mot), () => ouverte.current && setEtape('attente'))
    } catch {
      // Serveur injoignable : voix de synthèse de la tablette à la place.
      parler(mot, 'en-GB')
      setEtape('attente')
    }
  }

  async function toucherMicro() {
    if (etape === 'verifie') return
    if (micro.actif) return verifier()
    arreterSon()
    try {
      await micro.demarrer()
      setEtape('enregistre')
      // Un mot est court : on arrête tout seul au bout de quelques secondes.
      arretAuto.current = setTimeout(verifier, DUREE_MAX_MOT_MS)
    } catch {
      setEtape('panne')
    }
  }

  // Arrête le micro et envoie le mot seul au serveur.
  async function verifier() {
    clearTimeout(arretAuto.current)
    const blob = await micro.arreter()
    if (!blob || !ouverte.current) return
    setEtape('verifie')
    try {
      const reponse = await evaluerLecture(blob, mot)
      const erreur = reponse.differences?.errors?.[0]
      const nouveau = erreur ? statutErreur(erreur) : 'bien'
      if (!ouverte.current) return
      onNouveauStatut(nouveau)
      setEtape(nouveau)
    } catch {
      if (ouverte.current) setEtape('panne')
    }
  }

  const style = STYLE_STATUT[statut] || STYLE_STATUT.reessayer
  const message = MESSAGES[etape]
  const enregistre = micro.actif

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1B2242B3', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
      <div style={{ position: 'relative', width: 620, background: '#FFF7E8', borderRadius: 40, padding: '44px 48px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, animation: 'fadeUp .25s' }}>
        <button className="btn" onClick={onFermer} title="Fermer" style={{ position: 'absolute', top: 20, right: 20, width: 60, height: 60, borderRadius: '50%', background: '#fff' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        {/* Le mot en grand, avec la couleur de son statut */}
        <div style={{ fontFamily: "'Andika', sans-serif", fontSize: 104, lineHeight: 1.1, color: style.c, textDecorationLine: 'underline', textDecorationStyle: style.ds, textDecorationColor: style.dc, textDecorationThickness: 5, textUnderlineOffset: 16 }}>
          {mot}
        </div>

        <div style={{ height: 60, display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 600, color: message.couleur }}>
          {message.texte}
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          {/* Écouter le modèle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ecouter" onClick={ecouter} style={{ width: 120, height: 120, padding: 0, borderRadius: '50%', boxShadow: '0 7px 0 #D99A12' }}>
              <IconeHautParleur taille={56} epaisseur={2.2} />
            </button>
            <span style={{ fontSize: 20, fontWeight: 500 }}>Écouter</span>
          </div>

          {/* Redire le mot */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              {enregistre && [0, 0.8].map((d) => (
                <div key={d} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F2664A66', animation: `pulse 1.6s ${d}s ease-out infinite`, pointerEvents: 'none' }} />
              ))}
              <button className="btn" onClick={toucherMicro} style={{ position: 'absolute', inset: 0, borderRadius: '50%', color: '#fff', background: enregistre ? '#23305E' : '#F2664A', boxShadow: `0 7px 0 ${enregistre ? '#18214A' : '#C9472E'}`, opacity: etape === 'verifie' ? 0.5 : 1 }}>
                {enregistre
                  ? <svg width="40" height="40" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="3" fill="#fff" /></svg>
                  : <IconeMicro taille={54} />}
              </button>
            </div>
            <span style={{ fontSize: 20, fontWeight: 500 }}>{enregistre ? 'Stop' : 'Répéter'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
