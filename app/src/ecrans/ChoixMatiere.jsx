import EnTete from '../composants/EnTete'
import { IconeLivre } from '../composants/Icones'
import { parler } from '../audio'

// Fonds pastel des pictogrammes, repris des cartes « Mes leçons » / « Mes progrès ».
const FONDS = ['#FFE7A3', '#CDE7D8', '#CFE0F7', '#F9D1D1', '#E6DAF5', '#D6EEF2']

// Noms de matières affichés en français (le nom d'origine sert sinon).
const NOMS = { General: 'Général', English: 'Anglais', French: 'Français', Maths: 'Mathématiques' }

// Écran « Matière » : une grande carte par matière du niveau choisi.
export default function ChoixMatiere({ niveau, matieres, onRetour, onChoisir }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
      <EnTete
        surTitre={niveau.nom}
        titre="Choisis une matière"
        onRetour={onRetour}
        onAide={() => parler('Choisis une matière.')}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 48px 40px', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridAutoRows: 200, gap: 28, alignContent: 'start' }}>
        {matieres.map((m, i) => (
          <button key={m.nom} className="carte" onClick={() => onChoisir(m)} style={{ borderRadius: 32, display: 'flex', alignItems: 'center', gap: 24, padding: '0 32px' }}>
            <div style={{ width: 96, height: 96, flex: 'none', borderRadius: 28, background: FONDS[i % FONDS.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconeLivre />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 34 }}>{NOMS[m.nom] ?? m.nom}</div>
              <div style={{ fontSize: 20, color: '#6B6F86' }}>
                {m.unites.length} {m.unites.length > 1 ? 'unités' : 'unité'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
