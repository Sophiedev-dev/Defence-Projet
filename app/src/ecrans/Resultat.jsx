import { IconeReessayer, IconeSuivant } from '../composants/Icones'

const ETOILE = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z'

// Couleurs des pastilles « mots à retravailler » selon le statut actuel du mot.
const PASTILLE = {
  bien: { bord: '#7CCB9C', fond: '#EAF7EF', c: '#146C36' },
  presque: { bord: '#F2CC6B', fond: '#FFF7DD', c: '#8A5A00' },
  reessayer: { bord: '#F0A08C', fond: '#FFF1EC', c: '#B23A1E' },
}

// Écran « Résultat » (E10 du design) : étoiles, nombre de mots bien lus
// et liste des mots à retravailler (un toucher ouvre la fenêtre « Mot »).
//   resultat : { etoiles, bien, total, aRetravailler: [numéros de mots] }
export default function Resultat({ resultat, mots, statuts, dernier, onMot, onRecommencer, onAccueil, onSuivant }) {
  const bravo = ['Bon effort', 'Très bien', 'Excellent'][resultat.etoiles - 1] + ' !'

  return (
    <div style={{ position: 'absolute', inset: 0, padding: '56px 64px 44px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 36 }}>
      {/* Carte bleue : étoiles et score */}
      <div style={{ background: '#23305E', borderRadius: 40, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 32 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', height: 130 }}>
          {[0, 1, 2].map((i) => {
            const gagnee = i < resultat.etoiles
            const taille = i === 1 ? 130 : 104   // l'étoile du milieu est plus grande
            return (
              <svg key={i} width={taille} height={taille} viewBox="0 0 24 24" style={{ animation: `pop .5s ${0.2 + i * 0.25}s both` }}>
                <path d={ETOILE} fill={gagnee ? '#FFC23D' : '#3A4677'} stroke={gagnee ? '#FFD978' : '#4A578A'} strokeWidth="1" strokeLinejoin="round" />
              </svg>
            )
          })}
        </div>
        <div style={{ fontWeight: 600, fontSize: 54, textAlign: 'center', lineHeight: 1.1, marginTop: 10 }}>{bravo}</div>
        <div style={{ fontSize: 24, color: '#C9D1EE' }}>Continue comme ça, tu progresses.</div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 12, background: '#ffffff14', borderRadius: 24, padding: '16px 30px' }}>
          <span style={{ fontWeight: 700, fontSize: 56, color: '#FFC23D' }}>{resultat.bien}</span>
          <span style={{ fontSize: 26 }}>mots bien lus sur {resultat.total}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minHeight: 0 }}>
        {/* Mots à retravailler */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 32, padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 6px 0 #EADFC8', minHeight: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 30 }}>Mots à retravailler</div>
          {resultat.aRetravailler.length > 0 ? (
            <>
              <div style={{ fontSize: 20, color: '#6B6F86' }}>Touche un mot pour l'entraîner.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, overflow: 'auto', alignContent: 'flex-start' }}>
                {resultat.aRetravailler.map((n) => {
                  const corrige = statuts[n] === 'bien'
                  const p = PASTILLE[statuts[n]]
                  return (
                    <button key={n} className="btn" onClick={() => onMot(n)} style={{ height: 68, padding: '0 24px', borderRadius: 34, border: `3px solid ${p.bord}`, background: p.fond, color: p.c, fontFamily: "'Andika', sans-serif", fontSize: 30, gap: 10 }}>
                      {mots[n]}
                      {corrige && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F8A4C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 24, color: '#146C36' }}>Aucun ! Tous les mots sont bien lus.</div>
          )}
        </div>

        {/* Recommencer · Accueil · Suivant */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 16 }}>
          <button className="btn btn-rond" onClick={onRecommencer} title="Recommencer" style={{ width: 84, height: 84 }}>
            <IconeReessayer taille={38} />
          </button>
          <button className="btn btn-rond" onClick={onAccueil} title="Retour aux unités" style={{ width: 84, height: 84 }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
          </button>
          <button className="btn btn-suivant" onClick={onSuivant} style={{ height: 84, borderRadius: 42, background: '#F2664A', boxShadow: '0 6px 0 #C9472E', fontSize: 30, padding: '0 26px' }}>
            {dernier ? 'Terminer' : 'Écran suivant'}
            <IconeSuivant taille={34} />
          </button>
        </div>
      </div>
    </div>
  )
}
