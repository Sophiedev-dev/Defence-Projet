import { IconeReessayer } from '../composants/Icones'

// Écran d'erreur (E17 du design) : grand pictogramme Wi-Fi barré,
// message rassurant et bouton « Réessayer ».
export default function Erreur({ message, onReessayer }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 72, padding: '0 100px' }}>
      <div style={{ flex: 'none', width: 340, height: 340, borderRadius: '50%', background: '#EFE6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A7F66' }}>
        <svg width="170" height="170" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 8.5a15 15 0 0120 0M5.5 12a10 10 0 0113 0M9 15.5a5 5 0 016 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
          <path d="M3 3l18 18" />
        </svg>
      </div>
      <div style={{ maxWidth: 560 }}>
        <div style={{ fontWeight: 600, fontSize: 46, lineHeight: 1.1 }}>Les leçons ne sont pas disponibles</div>
        <div style={{ fontSize: 26, color: '#5B6078', marginTop: 16, lineHeight: 1.4 }}>{message}</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 40 }}>
          <button className="btn btn-blanc" onClick={onReessayer} style={{ height: 80, fontSize: 26 }}>
            <IconeReessayer />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}
