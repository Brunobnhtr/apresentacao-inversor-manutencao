// Primitivas reutilizáveis das cenas — camadas de profundidade (parallax 2.5D)
// Tudo em SVG/CSS para rodar leve em qualquer projetor.

// ----- Partículas de poeira flutuando (camada de atmosfera) -----
export function DustParticles({ count = 24, color = '#00d4ff' }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.5 }}>
      {Array.from({ length: count }).map((_, i) => {
        const size = 1 + Math.random() * 3
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: color,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              opacity: 0.15 + Math.random() * 0.35,
              animation: `float ${5 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        )
      })}
    </div>
  )
}

// ----- Raios de luz volumétrica vindos do alto (dá profundidade cinematográfica) -----
export function LightRays({ color = '#00d4ff', count = 4 }) {
  const gid = `ray-${color.replace('#', '')}`
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: count }).map((_, i) => {
        const x = 150 + i * (980 / count)
        return (
          <polygon
            key={i}
            points={`${x},0 ${x + 60},0 ${x + 180},720 ${x - 120},720`}
            fill={`url(#${gid})`}
            style={{ animation: `rayPulse ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }}
          />
        )
      })}
    </svg>
  )
}

// ----- Piso em perspectiva (grade que some no horizonte) -----
export function PerspectiveFloor({ color = '#00d4ff' }) {
  const lines = []
  // linhas que convergem para o ponto de fuga
  for (let i = -10; i <= 10; i++) {
    const x = 640 + i * 130
    lines.push(<line key={`v${i}`} x1={640} y1={430} x2={x} y2={720} stroke={color} strokeOpacity={0.12} strokeWidth={1} />)
  }
  // linhas horizontais com espaçamento perspectivo
  for (let i = 1; i <= 8; i++) {
    const y = 430 + (290 * (i / 8) ** 1.8)
    lines.push(<line key={`h${i}`} x1={0} y1={y} x2={1280} y2={y} stroke={color} strokeOpacity={0.1} strokeWidth={1} />)
  }
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1280 720">
      {lines}
    </svg>
  )
}

// ----- Estrutura/parede da fábrica (camada de fundo) -----
export function FactoryShell({ color = '#00d4ff', windows = true }) {
  const gid = `wall-${color.replace('#', '')}`
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a0a1e" />
          <stop offset="100%" stopColor="#050510" />
        </linearGradient>
      </defs>
      <rect width="1280" height="720" fill={`url(#${gid})`} />

      {/* Treliças do teto */}
      <g stroke={color} strokeOpacity="0.1" strokeWidth="2" fill="none">
        <path d="M0,90 L1280,90" />
        <path d="M0,50 L1280,50" />
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={i} d={`M${i * 110},50 L${i * 110 + 55},90 L${i * 110 + 110},50`} />
        ))}
      </g>

      {/* Pilares laterais */}
      <g fill={color} fillOpacity="0.06">
        <rect x="20" y="90" width="40" height="630" />
        <rect x="1220" y="90" width="40" height="630" />
      </g>
      <g stroke={color} strokeOpacity="0.15" strokeWidth="2" fill="none">
        <rect x="20" y="90" width="40" height="630" />
        <rect x="1220" y="90" width="40" height="630" />
      </g>

      {/* Janelas industriais altas */}
      {windows && (
        <g>
          {[140, 340, 940, 1140].map((x, i) => (
            <g key={i}>
              <rect x={x} y="120" width="120" height="160" fill={color} fillOpacity="0.08" stroke={color} strokeOpacity="0.2" />
              <line x1={x + 60} y1="120" x2={x + 60} y2="280" stroke={color} strokeOpacity="0.2" />
              <line x1={x} y1="200" x2={x + 120} y2="200" stroke={color} strokeOpacity="0.2" />
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

// ----- Tubulações de fundo (industriais) -----
export function Pipes({ color = '#00d4ff' }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1280 720">
      <g stroke={color} strokeOpacity="0.18" strokeWidth="10" fill="none" strokeLinecap="round">
        <path d="M-20,160 L300,160 L340,200 L340,420" />
        <path d="M1300,200 L1000,200 L960,240 L960,500" />
      </g>
      <g fill={color} fillOpacity="0.25">
        <circle cx="340" cy="200" r="8" />
        <circle cx="960" cy="240" r="8" />
      </g>
    </svg>
  )
}

// ----- Vinheta escura nas bordas (foco no centro) -----
export function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)' }}
    />
  )
}

// ----- Brilho ambiente colorido (cor do setor) -----
export function AmbientGlow({ color = '#00d4ff', x = 50, y = 55 }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: `radial-gradient(ellipse at ${x}% ${y}%, ${color}22 0%, transparent 55%)` }}
    />
  )
}
