import { IconeHautParleur, IconeRetour, IconeHorsLigne } from './Icones'
import { useEnLigne } from './useEnLigne'

// Barre du haut commune : bouton retour, titre (avec sur-titre facultatif),
// badge « hors ligne » (ou « Correction indisponible ») si besoin, et bouton jaune d'aide.
export default function EnTete({ titre, surTitre, onRetour, onAide, padding = '0 48px', taille = 42, sansCorrection = false }) {
  const enLigne = useEnLigne()

  return (
    <div style={{ height: 100, flex: 'none', display: 'flex', alignItems: 'center', gap: 22, padding }}>
      {onRetour && (
        <button className="btn btn-retour" onClick={onRetour} title="Retour">
          <IconeRetour />
        </button>
      )}
      <div style={{ minWidth: 0 }}>
        {surTitre && <div style={{ fontSize: 18, color: '#6B6F86', fontWeight: 500 }}>{surTitre}</div>}
        <div style={{ fontWeight: 600, fontSize: surTitre ? 36 : taille, lineHeight: 1.1 }}>{titre}</div>
      </div>
      <div style={{ flex: 1 }} />
      {(!enLigne || sansCorrection) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 20px', borderRadius: 26, background: '#EFE6D3', fontSize: 18, color: '#5B5340' }}>
          <IconeHorsLigne />
          {sansCorrection ? 'Correction indisponible' : 'Hors ligne'}
        </div>
      )}
      {onAide && (
        <button className="btn btn-aide" onClick={onAide} title="Aide">
          <IconeHautParleur />
        </button>
      )}
    </div>
  )
}
