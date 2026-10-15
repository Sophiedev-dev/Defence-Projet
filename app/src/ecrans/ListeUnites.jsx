import EnTete from '../composants/EnTete'
import { TEINTES } from '../composants/Icones'
import { fichier } from '../donnees'
import { parler } from '../audio'

// Écran « Unités » (repris de E4 « Mes leçons ») : grille de cartes avec
// l'illustration du premier écran, le numéro de l'unité et son titre.
export default function ListeUnites({ niveau, matiere, onRetour, onChoisir }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', paddingTop: 28 }}>
      <EnTete
        surTitre={niveau.nom}
        titre="Mes unités"
        onRetour={onRetour}
        onAide={() => parler('Choisis une unité.')}
      />

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 48px 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 26, alignContent: 'start' }}>
        {matiere.unites.map((u, i) => {
          const image = u.ecrans[0]?.image
          const nbEcrans = u.ecrans.length
          return (
            <button key={u.id} className="carte" onClick={() => onChoisir(u)} style={{ borderRadius: 28, padding: '14px 14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Illustration : l'image, ou une teinte unie si elle manque */}
              <div style={{ position: 'relative', width: '100%', height: 150, borderRadius: 18, overflow: 'hidden', background: TEINTES[i % TEINTES.length] }}>
                {image && <img src={fichier(image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                <div style={{ position: 'absolute', top: 10, left: 10, width: 46, height: 46, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 22 }}>
                  {i + 1}
                </div>
              </div>
              <div style={{ padding: '0 6px' }}>
                <div style={{ fontWeight: 600, fontSize: 26, lineHeight: 1.1 }}>{u.titre}</div>
                <div style={{ fontSize: 17, color: '#6B6F86', marginTop: 2 }}>
                  {nbEcrans} {nbEcrans > 1 ? 'écrans' : 'écran'}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
