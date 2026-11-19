import { IconeHautParleur, COULEURS, SYMBOLES } from '../composants/Icones'
import { parler } from '../audio'

// Écran « Choix du niveau » (inspiré de E2 « Qui lit aujourd'hui ? ») :
// une grande carte par niveau, avec une pastille de couleur et un symbole.
// Le cadenas discret en bas à droite ouvre les réglages (adresse du serveur).
export default function ChoixNiveau({ niveaux, onChoisir, onReglages }) {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '56px 72px 40px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 44 }}>Choisis ton niveau</div>
        <button className="btn btn-aide" style={{ width: 60, height: 60 }} onClick={() => parler('Touche ton niveau pour commencer.')} title="Aide">
          <IconeHautParleur />
        </button>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '28px 40px', alignContent: 'center', padding: '20px 80px 0' }}>
        {niveaux.map((n, i) => {
          const couleur = COULEURS[i % COULEURS.length]
          // Le chiffre du niveau (« Nursery 2 » → « 2 »), sinon sa première lettre
          const pastille = n.nom.match(/\d+/)?.[0] ?? n.nom.charAt(0).toUpperCase()
          return (
            <button key={n.id} className="carte" onClick={() => onChoisir(n)} style={{ borderRadius: 32, padding: '26px 0 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 132, height: 132, borderRadius: '50%', background: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 64, color: '#fff' }}>
                {pastille}
                <div style={{ position: 'absolute', right: -6, bottom: -6, width: 52, height: 52, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.12)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24"><path d={SYMBOLES[i % SYMBOLES.length]} fill={couleur} /></svg>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 30 }}>{n.nom}</div>
            </button>
          )
        })}
      </div>

      <button onClick={onReglages} title="Réglages" style={{ position: 'absolute', right: 28, bottom: 24, width: 48, height: 48, borderRadius: 12, border: 'none', background: 'transparent', color: '#A9A08C', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
      </button>
    </div>
  )
}
