// Écran de démarrage (E1 du design) : logo, titre et barre de chargement.
export default function Demarrage() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#23305E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, color: '#fff' }}>
      {/* Emplacement du logo (à remplacer par l'image du logo Cosmos) */}
      <div style={{ width: 140, height: 140, borderRadius: 36, background: 'repeating-linear-gradient(135deg,#2E3D72 0 10px,#34447C 10px 20px)', border: '2px dashed #5A6AA3', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '500 13px ui-monospace,Menlo,monospace', color: '#AEB8DB', textAlign: 'center' }}>
        logo<br />Cosmos
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 52, letterSpacing: '-.01em' }}>Beginning English</div>
        <div style={{ fontSize: 24, color: '#FFC23D', marginTop: 6 }}>Lecture guidée</div>
      </div>
      <div style={{ width: 320, height: 12, borderRadius: 6, background: '#34447C', overflow: 'hidden', marginTop: 24 }}>
        <div style={{ height: '100%', background: '#FFC23D', borderRadius: 6, animation: 'load 2.1s ease-in-out forwards' }} />
      </div>
    </div>
  )
}
