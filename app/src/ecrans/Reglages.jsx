import { useState } from 'react'
import { lireAdresseServeur, enregistrerAdresseServeur } from '../config'
import { serveurJoignable } from '../evaluation'

// Écran « Réglages » (repris de la carte « Serveur d'analyse local » de E16) :
// l'adulte saisit l'adresse du PC qui fait tourner OpenPronounce et la teste.
export default function Reglages({ onRetour }) {
  const [adresse, setAdresse] = useState(lireAdresseServeur())
  const [test, setTest] = useState(null)   // null | 'encours' | 'ok' | 'echec'

  async function tester() {
    const propre = enregistrerAdresseServeur(adresse)
    setAdresse(propre)
    setTest('encours')
    setTest((await serveurJoignable(propre)) ? 'ok' : 'echec')
  }

  // Pastille d'état, comme dans le design
  const pastille = {
    ok: { texte: 'Serveur connecté', fond: '#E3F4EA', c: '#1F7A4E', point: '#2FA36B' },
    echec: { texte: 'Serveur injoignable', fond: '#FDECE7', c: '#B23A1E', point: '#E0573A' },
  }[test]
  const message = {
    encours: { texte: 'Test en cours…', c: '#5D6275' },
    ok: { texte: 'Connexion réussie (OpenPronounce répond).', c: '#1F7A4E' },
    echec: { texte: 'Échec : serveur injoignable sur le Wi-Fi local.', c: '#B23A1E' },
  }[test]

  const champ = { height: 42, border: '1px solid #D5D9E0', borderRadius: 8, padding: '0 12px', font: "16px ui-monospace,Menlo,monospace", color: '#1C2333' }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F4F5F7', fontFamily: "'Public Sans', sans-serif", color: '#1C2333', padding: '40px 64px', userSelect: 'text' }}>
      <button onClick={onRetour} style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', color: '#5D6275', fontSize: 16, cursor: 'pointer', padding: 0, marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Retour
      </button>
      <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 22 }}>Réglages</div>

      <div style={{ maxWidth: 620, background: '#fff', border: '1px solid #E2E5EA', borderRadius: 12, padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Serveur d'analyse local</div>
          {pastille && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 12, background: pastille.fond, color: pastille.c }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: pastille.point }} />
              {pastille.texte}
            </span>
          )}
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#3B4256' }}>
          Adresse
          <input
            value={adresse}
            onChange={(e) => { setAdresse(e.target.value); setTest(null) }}
            onBlur={() => setAdresse(enregistrerAdresseServeur(adresse))}
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="http://192.168.1.20:8000"
            style={champ}
          />
        </label>
        <div style={{ fontSize: 13, color: '#6A7085', lineHeight: 1.5 }}>
          L'adresse IP du PC où tourne OpenPronounce, suivie de « :8000 ».
          Le téléphone et le PC doivent être sur le même Wi-Fi.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={tester} style={{ height: 40, padding: '0 16px', borderRadius: 8, border: 'none', background: '#23305E', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Enregistrer et tester
          </button>
          {message && <span style={{ fontSize: 13, color: message.c }}>{message.texte}</span>}
        </div>
      </div>
    </div>
  )
}
