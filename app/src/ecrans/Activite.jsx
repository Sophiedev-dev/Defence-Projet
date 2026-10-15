import { useEffect, useRef, useState } from 'react'
import EnTete from '../composants/EnTete'
import FenetreMot from '../composants/FenetreMot'
import { IconeHautParleur, IconeMicro, IconeStop, IconeSuivant, IconeRetour } from '../composants/Icones'
import { STYLE_STATUT, styleMot } from '../composants/statuts'
import { useEnregistreur } from '../composants/useEnregistreur'
import Chargement from './Chargement'
import Resultat from './Resultat'
import ServeurIndisponible from './ServeurIndisponible'
import { fichier } from '../donnees'
import { arreterSon, jouerFichier } from '../audio'
import { decouperTexte, etoilesDuScore, evaluerLecture, statutsDesMots } from '../evaluation'

const deuxChiffres = (n) => String(n).padStart(2, '0')

// Écran « Activité » : lecture d'un écran de l'unité, puis correction.
//
// Étapes (« etape ») :
//   'lecture'     E5  l'élève écoute le modèle et lit le texte
//   'enregistre'  E6  le micro est ouvert
//   'analyse'     E7  l'enregistrement est envoyé à OpenPronounce
//   'corrige'     E8  chaque mot est coloré ; toucher un mot ouvre E9
//   'resultat'    E10 étoiles et mots à retravailler
//   'panne'       E17 le serveur ne répond pas
export default function Activite({ unite, numeroUnite, onQuitter }) {
  const [index, setIndex] = useState(0)                 // écran affiché dans l'unité
  const [etape, setEtape] = useState('lecture')
  const [ecoute, setEcoute] = useState(false)           // le modèle est en train d'être lu
  const [statuts, setStatuts] = useState([])            // statut de chaque mot après correction
  const [resultat, setResultat] = useState(null)        // { etoiles, bien, total, aRetravailler }
  const [motOuvert, setMotOuvert] = useState(null)      // numéro du mot affiché dans la fenêtre E9
  const [sansCorrection, setSansCorrection] = useState(false)
  const [messagePanne, setMessagePanne] = useState('')
  const [erreurMicro, setErreurMicro] = useState('')

  const micro = useEnregistreur()
  const dernierEnregistrement = useRef(null)            // gardé pour « Réessayer » (E17)
  const jeton = useRef(0)                               // ignore les réponses arrivées trop tard

  const ecran = unite.ecrans[index]
  const dernier = index === unite.ecrans.length - 1
  const { jetons, mots } = decouperTexte(ecran.expected_text)
  const corrige = etape === 'corrige'

  // --- Écoute ---------------------------------------------------------------
  function ecouterModele() {
    if (micro.actif) return
    if (ecoute) {
      arreterSon()
      setEcoute(false)
      return
    }
    setEcoute(true)
    jouerFichier(fichier(ecran.audio_texte), () => setEcoute(false))
  }

  function ecouterConsigne() {
    setEcoute(false)
    jouerFichier(fichier(ecran.audio_consigne))
  }

  // --- Enregistrement puis analyse -----------------------------------------
  async function commencer() {
    arreterSon()
    setEcoute(false)
    setErreurMicro('')
    try {
      await micro.demarrer()
      setEtape('enregistre')
    } catch (e) {
      console.error(e)
      setErreurMicro('Micro indisponible')
    }
  }

  async function arreter() {
    const blob = await micro.arreter()
    if (!blob) return
    dernierEnregistrement.current = blob
    analyser(blob)
  }

  // Envoie l'enregistrement à OpenPronounce et colore les mots avec la réponse.
  async function analyser(blob) {
    const monJeton = ++jeton.current
    setEtape('analyse')
    try {
      const reponse = await evaluerLecture(blob, ecran.expected_text)
      if (monJeton !== jeton.current) return
      const nouveaux = statutsDesMots(mots, reponse.differences?.errors)
      const aRetravailler = nouveaux.flatMap((s, n) => (s === 'bien' ? [] : [n]))
      setStatuts(nouveaux)
      setResultat({
        etoiles: etoilesDuScore(reponse.score),
        bien: mots.length - aRetravailler.length,
        total: mots.length,
        aRetravailler,
      })
      setSansCorrection(false)
      setEtape('corrige')
    } catch (e) {
      if (monJeton !== jeton.current) return
      console.error(e)
      setEtape('panne')
    }
  }

  // E17 : on renvoie le même enregistrement. Si cela échoue encore, on le dit.
  function reessayer() {
    setMessagePanne('Toujours injoignable. Préviens ton enseignant.')
    analyser(dernierEnregistrement.current)
  }

  function continuerSansCorrection() {
    setSansCorrection(true)
    setMessagePanne('')
    setEtape('lecture')
  }

  // Après un essai dans la fenêtre « Mot », on met à jour la couleur du mot.
  function changerStatut(n, statut) {
    setStatuts((anciens) => anciens.map((s, k) => (k === n ? statut : s)))
  }

  // --- Navigation entre les écrans de l'unité ------------------------------
  function allerA(i) {
    jeton.current++
    micro.annuler()
    arreterSon()
    setEcoute(false)
    setEtape('lecture')
    setStatuts([])
    setResultat(null)
    setMotOuvert(null)
    setErreurMicro('')
    setMessagePanne('')
    setIndex(i)
  }

  // À l'arrivée sur un écran, on lit la consigne.
  useEffect(() => {
    if (ecran.audio_consigne) jouerFichier(fichier(ecran.audio_consigne))
  }, [index])

  useEffect(() => () => { jeton.current++; arreterSon() }, [])

  // --- Affichage ------------------------------------------------------------
  const fenetreMot = motOuvert !== null && (
    <FenetreMot
      // « key » : la fenêtre repart de zéro pour chaque mot
      key={motOuvert}
      mot={mots[motOuvert]}
      statut={statuts[motOuvert]}
      onNouveauStatut={(s) => changerStatut(motOuvert, s)}
      onFermer={() => setMotOuvert(null)}
    />
  )

  if (etape === 'resultat') {
    return (
      <>
        <Resultat
          resultat={resultat}
          mots={mots}
          statuts={statuts}
          dernier={dernier}
          onMot={setMotOuvert}
          onRecommencer={() => allerA(index)}
          onAccueil={onQuitter}
          onSuivant={() => (dernier ? onQuitter() : allerA(index + 1))}
        />
        {fenetreMot}
      </>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
      <EnTete
        surTitre={`Unité ${numeroUnite} · Écran ${index + 1} sur ${unite.ecrans.length}`}
        titre={unite.titre}
        onRetour={onQuitter}
        onAide={ecouterConsigne}
        padding="0 40px"
        sansCorrection={sansCorrection}
      />

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 36, padding: '4px 40px 0' }}>
        {/* Colonne gauche : illustration, puis légende des couleurs (E8) ou progression */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          <div style={{ flex: 1, maxHeight: 420, borderRadius: 28, overflow: 'hidden', background: '#FFD9A8' }}>
            <img src={fichier(ecran.image)} alt={ecran.visual_description || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {corrige ? (
            <div style={{ background: '#fff', borderRadius: 22, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 19, animation: 'fadeUp .4s' }}>
              {Object.entries(STYLE_STATUT).map(([cle, s]) => (
                <div key={cle} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: "'Andika', sans-serif", fontSize: 22, ...styleMot(cle, 6), background: 'transparent' }}>word</span>
                  {s.libelle}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, paddingBottom: 12 }}>
              {unite.ecrans.map((e, i) => (
                <div key={e.screen_number} style={{ width: i === index ? 36 : 14, height: 14, borderRadius: 7, background: i === index ? '#23305E' : i < index ? '#2FA36B' : '#EADFC8', transition: 'width .2s' }} />
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : consigne (ou astuce E8) + texte à lire */}
        <div style={{ minHeight: 0, overflow: 'auto', padding: '4px 8px 24px 0' }}>
          {corrige ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: '14px 20px', borderRadius: 20, background: '#E5F0FF', fontSize: 21, animation: 'fadeUp .4s' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11V5a1.5 1.5 0 013 0v5" /><path d="M12 10V4a1.5 1.5 0 013 0v6" /><path d="M15 10V6a1.5 1.5 0 013 0v7a7 7 0 01-7 7h-.5a6 6 0 01-5-2.7L3 14a1.6 1.6 0 012.6-1.8L9 15V11" /></svg>
              Touche un mot coloré pour l'écouter et le redire.
            </div>
          ) : (
            <button onClick={ecouterConsigne} style={{ width: '100%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: '14px 20px', borderRadius: 20, background: '#E5F0FF', fontSize: 21, color: '#23305E', textAlign: 'left', animation: 'fadeUp .4s' }}>
              <IconeHautParleur taille={28} epaisseur={2} />
              {ecran.audio_instruction}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '12px 14px', borderRadius: 22, background: ecoute ? '#FFE9A8' : 'transparent', transition: 'background .2s' }}>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '4px 2px', fontFamily: "'Andika', sans-serif", fontSize: 42, lineHeight: 1.55 }}>
              {jetons.map((morceaux, i) => (
                <span key={i} style={{ padding: '0 3px' }}>
                  {morceaux.map((m, j) => {
                    // Ponctuation : jamais colorée
                    if (m.mot === null) return <span key={j}>{m.texte}</span>
                    const statut = corrige ? statuts[m.mot] : null
                    const touchable = corrige && statut !== 'bien'
                    return (
                      <span
                        key={j}
                        onClick={touchable ? () => setMotOuvert(m.mot) : undefined}
                        style={{ padding: '0 4px', borderRadius: 12, cursor: touchable ? 'pointer' : 'default', ...styleMot(statut) }}
                      >
                        {m.texte}
                      </span>
                    )
                  })}
                </span>
              ))}
            </div>
            <button className="btn btn-phrase" onClick={ecouterModele} title="Écouter cette phrase" style={{ marginTop: 10 }}>
              <IconeHautParleur taille={24} ondes={1} />
            </button>
          </div>
        </div>
      </div>

      {/* Barre du bas : écouter · micro · suivant / mon résultat */}
      <div style={{ height: 172, flex: 'none', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 40px', borderTop: '2px solid #F1E6CF', background: '#FFFBF2' }}>
        <div>
          <button className="btn btn-ecouter" onClick={ecouterModele} style={{ opacity: micro.actif ? 0.4 : 1 }}>
            <IconeHautParleur taille={34} />
            {ecoute ? 'Arrêter' : 'Écouter'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {micro.actif ? (
            <>
              <div style={{ position: 'relative', width: 124, height: 124 }}>
                {/* Anneaux qui pulsent autour du bouton stop */}
                {[0, 0.8].map((d) => (
                  <div key={d} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#23305E55', animation: `pulse 1.6s ${d}s ease-out infinite`, pointerEvents: 'none' }} />
                ))}
                <button className="btn" onClick={arreter} title="Stop" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#23305E', boxShadow: '0 8px 0 #18214A' }}>
                  <IconeStop />
                </button>
              </div>
              <div style={{ fontSize: 19, fontWeight: 500 }}>Stop quand tu as fini</div>
            </>
          ) : corrige ? (
            <>
              <button className="btn btn-relire" onClick={commencer} title="Relire">
                <IconeMicro taille={48} />
              </button>
              <div style={{ fontSize: 19, fontWeight: 500, color: '#6B6F86' }}>Relire</div>
            </>
          ) : (
            <>
              <button className="btn btn-micro" onClick={commencer} title="Lire à voix haute">
                <IconeMicro />
              </button>
              <div style={{ fontSize: 19, fontWeight: 500, color: erreurMicro ? '#B23A1E' : '#6B6F86' }}>{erreurMicro || 'Appuie et lis'}</div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 18 }}>
          {micro.actif ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Ondes animées pendant l'enregistrement */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 56 }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} style={{ width: 6, height: 56, borderRadius: 3, background: '#F2664A', animation: `wave ${0.7 + ((i * 37) % 5) / 10}s ${(i * 0.13) % 0.6}s ease-in-out infinite` }} />
                ))}
              </div>
              <div style={{ fontWeight: 600, fontSize: 30, fontVariantNumeric: 'tabular-nums', width: 80 }}>
                {Math.floor(micro.secondes / 60)}:{deuxChiffres(micro.secondes % 60)}
              </div>
            </div>
          ) : corrige ? (
            <button className="btn btn-suivant" onClick={() => { arreterSon(); setEtape('resultat') }}>
              Mon résultat
              <IconeSuivant />
            </button>
          ) : (
            <>
              {index > 0 && (
                <button className="btn btn-rond" onClick={() => allerA(index - 1)} title="Écran précédent">
                  <IconeRetour taille={36} />
                </button>
              )}
              <button className="btn btn-suivant" onClick={() => (dernier ? onQuitter() : allerA(index + 1))}>
                {dernier ? 'Terminer' : 'Suivant'}
                <IconeSuivant />
              </button>
            </>
          )}
        </div>
      </div>

      {etape === 'analyse' && <Chargement texte="Je vérifie ta lecture…" sousTexte="Encore un petit instant." />}
      {etape === 'panne' && (
        <ServeurIndisponible message={messagePanne} onReessayer={reessayer} onContinuer={continuerSansCorrection} />
      )}
      {fenetreMot}
    </div>
  )
}
