export default function Logo({ size = 48, fontSize = 20, gap = 10 }) {
  // logo3.png mide 812x477; el ícono mide 232x232 centrado en (50.1%, 32.3%).
  // Escalamos la imagen para que el ícono ocupe `size` px y la centramos en
  // un contenedor con overflow:hidden para recortar el resto (incluido el
  // texto blanco del PNG). Junto al ícono renderizamos "Optimixage" en HTML
  // con el azul oscuro de los títulos.
  const imgWidth = size * (812 / 232)         // ≈ 3.5 × size
  const imgLeft  = size * 0.5 - size * (407 / 232)   // centra eje X del ícono
  const imgTop   = size * 0.5 - size * (154 / 232)   // centra eje Y del ícono
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px` }}>
      <div style={{
        width: `${size}px`, height: `${size}px`,
        overflow: 'hidden', position: 'relative', flexShrink: 0,
      }}>
        <img src="/logo3.png" alt="Optimixage" style={{
          position: 'absolute',
          width: `${imgWidth}px`, height: 'auto',
          left: `${imgLeft}px`, top: `${imgTop}px`,
          display: 'block', maxWidth: 'none',
        }} />
      </div>
      <span style={{
        fontSize: `${fontSize}px`, fontWeight: 800,
        color: '#0a0a4e', letterSpacing: '-0.3px', lineHeight: 1,
      }}>
        Optimixage
      </span>
    </div>
  )
}
