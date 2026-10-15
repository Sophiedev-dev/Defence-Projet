// Voile de chargement (repris de l'écran E7 « Analyse en cours » du design) :
// quatre ronds de couleur qui rebondissent.
export default function Chargement({ texte = 'Un petit instant…', sousTexte }) {
  const couleurs = ['#F2664A', '#FFC23D', '#2FA36B', '#3A7BD5']
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFF7E8F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, zIndex: 10 }}>
      <div style={{ height: 90, display: 'flex', alignItems: 'flex-end', gap: 22 }}>
        {couleurs.map((c, i) => (
          <div key={c} style={{ width: 44, height: 44, borderRadius: '50%', background: c, animation: `bounce 1.2s ${i * 0.15}s ease-in-out infinite` }} />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 46 }}>{texte}</div>
        {sousTexte && <div style={{ fontSize: 24, color: '#6B6F86', marginTop: 8 }}>{sousTexte}</div>}
      </div>
    </div>
  )
}
