// Máquinas-herói de cada setor da fábrica (camada do meio das cenas).
// SVG stylizado e animado — o "personagem" de cada slide.

const CYAN = '#00d4ff'
const ORANGE = '#ff6b00'
const GREEN = '#00ff88'

// Wrapper para posicionar a hero no centro-baixo da cena
function HeroStage({ children, w = 520, scale = 1 }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none">
      <svg viewBox={`0 0 ${w} 380`} width={w * scale} height={380 * scale} style={{ maxWidth: '60vw', maxHeight: '52vh' }}>
        {children}
      </svg>
    </div>
  )
}

// ===================== FACHADA DA EMPRESA (exterior) =====================
export function BuildingFacade() {
  return (
    <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
      <svg viewBox="0 0 1280 600" preserveAspectRatio="xMidYMax meet" width="100%" height="80%">
        {/* Prédio principal */}
        <g>
          <rect x="240" y="200" width="800" height="400" fill="#0d1530" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
          {/* Telhado dente-de-serra (típico de galpão industrial) */}
          {[0, 1, 2, 3, 4].map(i => (
            <path key={i} d={`M${240 + i * 160},200 L${240 + i * 160 + 80},150 L${240 + i * 160 + 160},200`}
              fill="#0a1024" stroke={CYAN} strokeOpacity="0.3" strokeWidth="2" />
          ))}
          {/* Janelas acesas */}
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={280 + c * 92} y={240 + r * 80} width="56" height="48"
                fill={CYAN} fillOpacity={(r + c) % 3 === 0 ? 0.35 : 0.12}
                style={(r + c) % 3 === 0 ? { animation: `blink ${3 + ((r + c) % 4)}s ease-in-out infinite` } : undefined} />
            ))
          )}
          {/* Portão de entrada */}
          <rect x="560" y="450" width="160" height="150" fill="#060a18" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
          <line x1="640" y1="450" x2="640" y2="600" stroke={CYAN} strokeOpacity="0.3" />
        </g>
        {/* Letreiro */}
        <g>
          <rect x="500" y="165" width="280" height="34" rx="6" fill="#060a18" stroke={CYAN} strokeOpacity="0.6" />
          <text x="640" y="189" textAnchor="middle" fill={CYAN} fontSize="20" fontFamily="Rajdhani" fontWeight="700" letterSpacing="3"
            style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }}>INDÚSTRIA</text>
        </g>
        {/* Chaminés/torres laterais */}
        <rect x="180" y="280" width="50" height="320" fill="#0a1024" stroke={CYAN} strokeOpacity="0.3" />
        <rect x="1050" y="250" width="50" height="350" fill="#0a1024" stroke={CYAN} strokeOpacity="0.3" />
        {/* Chão */}
        <rect x="0" y="595" width="1280" height="8" fill={CYAN} fillOpacity="0.2" />
      </svg>
    </div>
  )
}

// ===================== MOTOR + INVERSOR =====================
export function MotorHero({ accent = CYAN }) {
  return (
    <HeroStage w={560}>
      {/* Base */}
      <rect x="60" y="300" width="440" height="20" rx="4" fill={accent} fillOpacity="0.15" />
      {/* Inversor (gabinete) à esquerda */}
      <g>
        <rect x="80" y="120" width="120" height="190" rx="6" fill="#0d1530" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
        <rect x="95" y="135" width="90" height="50" rx="3" fill="#060a18" stroke={accent} strokeOpacity="0.4" />
        {/* display */}
        <text x="140" y="167" textAnchor="middle" fill={GREEN} fontSize="20" fontFamily="Rajdhani" fontWeight="700"
          style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }}>60.0</text>
        {/* LEDs */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={110 + i * 25} cy="205" r="5" fill={[GREEN, accent, ORANGE][i]}
            style={{ animation: `blink ${1.5 + i * 0.5}s ease-in-out infinite` }} />
        ))}
        {/* botões */}
        {[0, 1, 2, 3].map(i => <rect key={i} x={100 + i * 22} y="230" width="14" height="14" rx="2" fill={accent} fillOpacity="0.2" />)}
        {/* grade de ventilação */}
        {[0, 1, 2, 3].map(i => <line key={i} x1="95" y1={265 + i * 10} x2="185" y2={265 + i * 10} stroke={accent} strokeOpacity="0.3" strokeWidth="2" />)}
      </g>
      {/* Cabo conectando */}
      <path d="M200,250 C240,250 240,260 280,260" stroke={accent} strokeOpacity="0.6" strokeWidth="4" fill="none" />
      {/* Motor à direita */}
      <g transform="translate(360,260)">
        {/* corpo */}
        <rect x="-60" y="-55" width="150" height="110" rx="14" fill="#0d1530" stroke={accent} strokeOpacity="0.6" strokeWidth="2.5" />
        {/* aletas */}
        {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={-55 + i * 22} y1="-55" x2={-55 + i * 22} y2="55" stroke={accent} strokeOpacity="0.25" strokeWidth="2" />)}
        {/* eixo + ventoinha girando */}
        <g style={{ transformOrigin: '15px 0px', animation: 'motorSpin 1.5s linear infinite' }}>
          <circle cx="15" cy="0" r="38" fill="#060a18" stroke={accent} strokeOpacity="0.5" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2
            return <line key={i} x1="15" y1="0" x2={15 + Math.cos(a) * 34} y2={Math.sin(a) * 34} stroke={accent} strokeOpacity="0.6" strokeWidth="3" />
          })}
        </g>
        <circle cx="15" cy="0" r="9" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
        {/* eixo saindo */}
        <rect x="90" y="-6" width="50" height="12" rx="3" fill={accent} fillOpacity="0.4" />
        {/* base do motor */}
        <rect x="-60" y="55" width="150" height="14" fill={accent} fillOpacity="0.15" />
      </g>
    </HeroStage>
  )
}

// ===================== BOMBA D'ÁGUA =====================
export function PumpHero() {
  return (
    <HeroStage w={560}>
      {/* tubulação de entrada e saída com fluxo animado */}
      <g stroke={CYAN} strokeWidth="22" fill="none" strokeOpacity="0.25" strokeLinecap="round">
        <path d="M20,330 L160,330 L160,210" />
        <path d="M400,210 L400,120 L540,120" />
      </g>
      {/* fluxo de água (dash animado) */}
      <g stroke={CYAN} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="14 18"
        style={{ animation: 'flowDash 0.8s linear infinite' }}>
        <path d="M20,330 L160,330 L160,210" />
        <path d="M400,210 L400,120 L540,120" />
      </g>
      {/* corpo da bomba (voluta) */}
      <g transform="translate(280,210)">
        <circle r="90" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="3" />
        <circle r="62" fill="#060a18" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
        {/* rotor girando */}
        <g style={{ transformOrigin: '0px 0px', animation: 'motorSpin 0.9s linear infinite' }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const a = (i / 7) * Math.PI * 2
            return <path key={i} d={`M0,0 Q${Math.cos(a) * 30},${Math.sin(a) * 30} ${Math.cos(a + 0.5) * 58},${Math.sin(a + 0.5) * 58}`}
              stroke={CYAN} strokeOpacity="0.7" strokeWidth="5" fill="none" strokeLinecap="round" />
          })}
        </g>
        <circle r="12" fill={CYAN} style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }} />
        {/* motor acoplado atrás */}
        <rect x="-130" y="-32" width="90" height="64" rx="10" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
      </g>
      {/* base */}
      <rect x="120" y="300" width="320" height="18" rx="4" fill={CYAN} fillOpacity="0.15" />
      {/* gotas */}
      {[0, 1, 2].map(i => (
        <circle key={i} cx={540} cy={120} r="4" fill={CYAN}
          style={{ animation: `drip 1.4s ease-in ${i * 0.4}s infinite` }} />
      ))}
    </HeroStage>
  )
}

// ===================== VENTILADOR / HVAC =====================
export function FanHero() {
  return (
    <HeroStage w={520}>
      {/* duto */}
      <rect x="20" y="120" width="120" height="170" fill="#0d1530" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
      {/* carcaça do ventilador */}
      <g transform="translate(300,205)">
        <circle r="130" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="3" />
        <circle r="118" fill="#060a18" stroke={CYAN} strokeOpacity="0.3" strokeWidth="2" />
        {/* pás girando */}
        <g style={{ transformOrigin: '0px 0px', animation: 'motorSpin 0.6s linear infinite' }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <path key={i}
                d={`M0,0 Q${Math.cos(a - 0.3) * 60},${Math.sin(a - 0.3) * 60} ${Math.cos(a) * 110},${Math.sin(a) * 110} Q${Math.cos(a + 0.35) * 70},${Math.sin(a + 0.35) * 70} 0,0`}
                fill={CYAN} fillOpacity="0.18" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
            )
          })}
        </g>
        <circle r="22" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2" />
        <circle r="8" fill={CYAN} style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }} />
      </g>
      {/* linhas de fluxo de ar saindo */}
      <g stroke={CYAN} strokeWidth="3" fill="none" strokeOpacity="0.4" strokeLinecap="round" strokeDasharray="20 24"
        style={{ animation: 'flowDash 0.7s linear infinite' }}>
        <path d="M430,160 L510,150" />
        <path d="M440,205 L510,205" />
        <path d="M430,250 L510,260" />
      </g>
      <rect x="120" y="320" width="360" height="16" rx="4" fill={CYAN} fillOpacity="0.15" />
    </HeroStage>
  )
}

// ===================== ESTEIRA TRANSPORTADORA =====================
export function ConveyorHero() {
  return (
    <HeroStage w={580}>
      {/* roletes */}
      <g transform="translate(0,250)">
        {[90, 490].map((x, i) => (
          <g key={i} style={{ transformOrigin: `${x}px 0px`, animation: 'motorSpin 1.2s linear infinite' }}>
            <circle cx={x} cy="0" r="46" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="3" />
            <line x1={x} y1="-46" x2={x} y2="46" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
            <line x1={x - 46} y1="0" x2={x + 46} y2="0" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
          </g>
        ))}
        {/* correia */}
        <line x1="90" y1="-46" x2="490" y2="-46" stroke={CYAN} strokeOpacity="0.6" strokeWidth="5" />
        <line x1="90" y1="46" x2="490" y2="46" stroke={CYAN} strokeOpacity="0.4" strokeWidth="5" />
        {/* marcas da correia se movendo */}
        <g stroke={CYAN} strokeOpacity="0.3" strokeWidth="3" strokeDasharray="16 22"
          style={{ animation: 'flowDash 0.6s linear infinite' }}>
          <line x1="90" y1="-46" x2="490" y2="-46" />
        </g>
      </g>
      {/* caixas se movendo sobre a esteira */}
      {[0, 1, 2].map(i => (
        <g key={i} style={{ animation: `boxMove 3s linear ${i * 1}s infinite` }}>
          <rect x="120" y="160" width="56" height="48" rx="4" fill="#0d1530" stroke={ORANGE} strokeOpacity="0.6" strokeWidth="2" />
          <line x1="120" y1="184" x2="176" y2="184" stroke={ORANGE} strokeOpacity="0.4" />
          <line x1="148" y1="160" x2="148" y2="208" stroke={ORANGE} strokeOpacity="0.4" />
        </g>
      ))}
    </HeroStage>
  )
}

// ===================== COMPRESSOR DE AR =====================
export function CompressorHero() {
  return (
    <HeroStage w={520}>
      {/* tanque cilíndrico */}
      <g transform="translate(140,210)">
        <rect x="-100" y="-30" width="200" height="150" rx="40" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="3" />
        <ellipse cx="0" cy="-30" rx="100" ry="22" fill="#060a18" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
        {/* manômetro */}
        <circle cx="0" cy="-60" r="22" fill="#060a18" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2" />
        <line x1="0" y1="-60" x2="12" y2="-72" stroke={GREEN} strokeWidth="3" strokeLinecap="round"
          style={{ transformOrigin: '0px -60px', animation: 'gaugeWobble 2s ease-in-out infinite' }} />
        <circle cx="0" cy="-60" r="3" fill={GREEN} />
      </g>
      {/* bloco do compressor + pistão */}
      <g transform="translate(360,230)">
        <rect x="-60" y="-40" width="120" height="120" rx="8" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2.5" />
        {/* pistão subindo/descendo */}
        <g style={{ animation: 'pistonMove 0.5s ease-in-out infinite' }}>
          <rect x="-14" y="-70" width="28" height="50" rx="3" fill={CYAN} fillOpacity="0.4" />
        </g>
        <rect x="-20" y="-24" width="40" height="40" rx="4" fill="#060a18" stroke={CYAN} strokeOpacity="0.4" />
        {/* polia girando */}
        <g transform="translate(0,40)" style={{ transformOrigin: '0px 40px', animation: 'motorSpin 0.8s linear infinite' }}>
          <circle r="34" fill="#060a18" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2
            return <line key={i} x1="0" y1="40" x2={Math.cos(a) * 30} y2={40 + Math.sin(a) * 30} stroke={CYAN} strokeOpacity="0.5" strokeWidth="3" />
          })}
        </g>
      </g>
      {/* tubo de ar comprimido */}
      <path d="M240,180 L300,180" stroke={CYAN} strokeOpacity="0.5" strokeWidth="8" strokeLinecap="round" />
      <rect x="100" y="330" width="320" height="16" rx="4" fill={CYAN} fillOpacity="0.15" />
    </HeroStage>
  )
}

// ===================== ELEVADOR / GUINDASTE =====================
export function ElevatorHero() {
  return (
    <HeroStage w={460}>
      {/* estrutura/torre */}
      <g stroke={CYAN} strokeOpacity="0.4" strokeWidth="3" fill="none">
        <rect x="120" y="20" width="220" height="340" />
        {Array.from({ length: 6 }).map((_, i) => <line key={i} x1="120" y1={20 + i * 57} x2="340" y2={20 + i * 57} strokeOpacity="0.15" />)}
      </g>
      {/* cabo */}
      <line x1="230" y1="20" x2="230" y2="200" stroke={CYAN} strokeOpacity="0.6" strokeWidth="3"
        style={{ animation: 'cabinMove 4s ease-in-out infinite' }} />
      {/* polia no topo */}
      <g style={{ transformOrigin: '230px 20px', animation: 'motorSpin 3s linear infinite' }}>
        <circle cx="230" cy="20" r="18" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2" />
      </g>
      {/* cabine subindo/descendo */}
      <g style={{ animation: 'cabinMove 4s ease-in-out infinite' }}>
        <rect x="160" y="200" width="140" height="120" rx="6" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2.5" />
        <rect x="175" y="215" width="50" height="90" fill={CYAN} fillOpacity="0.12" stroke={CYAN} strokeOpacity="0.3" />
        <rect x="235" y="215" width="50" height="90" fill={CYAN} fillOpacity="0.12" stroke={CYAN} strokeOpacity="0.3" />
        <line x1="230" y1="200" x2="230" y2="320" stroke={CYAN} strokeOpacity="0.4" />
      </g>
      {/* contrapeso */}
      <g style={{ animation: 'counterMove 4s ease-in-out infinite' }}>
        <rect x="300" y="120" width="28" height="70" fill={CYAN} fillOpacity="0.2" stroke={CYAN} strokeOpacity="0.4" />
      </g>
    </HeroStage>
  )
}

// ===================== CNC / USINAGEM =====================
export function CncHero() {
  return (
    <HeroStage w={540}>
      {/* base da máquina */}
      <rect x="60" y="240" width="420" height="100" rx="8" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2.5" />
      {/* pórtico */}
      <rect x="120" y="80" width="40" height="180" fill="#0d1530" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
      <rect x="380" y="80" width="40" height="180" fill="#0d1530" stroke={CYAN} strokeOpacity="0.4" strokeWidth="2" />
      <rect x="120" y="80" width="300" height="36" fill="#0d1530" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
      {/* cabeçote que desliza */}
      <g style={{ animation: 'headSlide 3s ease-in-out infinite' }}>
        <rect x="250" y="116" width="44" height="70" rx="4" fill="#0d1530" stroke={CYAN} strokeOpacity="0.6" strokeWidth="2" />
        {/* ferramenta girando */}
        <g style={{ transformOrigin: '272px 200px', animation: 'motorSpin 0.4s linear infinite' }}>
          <polygon points="266,186 278,186 272,210" fill={ORANGE} fillOpacity="0.7" />
        </g>
        {/* faíscas */}
        {[0, 1, 2].map(i => (
          <circle key={i} cx={272} cy={212} r="2.5" fill={ORANGE}
            style={{ animation: `spark 0.6s ease-out ${i * 0.2}s infinite` }} />
        ))}
      </g>
      {/* peça sendo usinada */}
      <rect x="240" y="212" width="64" height="28" rx="3" fill={CYAN} fillOpacity="0.2" stroke={CYAN} strokeOpacity="0.4" />
    </HeroStage>
  )
}

// ===================== QUADRO ELÉTRICO (manutenção) =====================
export function PanelHero({ accent = ORANGE }) {
  return (
    <HeroStage w={460}>
      {/* gabinete */}
      <rect x="80" y="40" width="300" height="320" rx="8" fill="#0d1530" stroke={accent} strokeOpacity="0.5" strokeWidth="2.5" />
      {/* porta aberta (lado) */}
      <rect x="380" y="40" width="14" height="320" fill={accent} fillOpacity="0.1" stroke={accent} strokeOpacity="0.3" />
      {/* barramento */}
      <rect x="100" y="70" width="260" height="10" fill={accent} fillOpacity="0.3" rx="2" />
      {/* trilho de disjuntores */}
      {[0, 1].map(row => (
        <g key={row}>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={108 + i * 42} y={110 + row * 70} width="32" height="50" rx="3"
              fill="#060a18" stroke={accent} strokeOpacity="0.4" strokeWidth="1.5" />
          ))}
          {/* alavancas */}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={117 + i * 42} y={118 + row * 70} width="14" height="16" rx="2"
              fill={accent} fillOpacity={i === 1 && row === 1 ? 0.8 : 0.3}
              style={i === 1 && row === 1 ? { animation: 'blink 1s ease-in-out infinite' } : undefined} />
          ))}
        </g>
      ))}
      {/* contatores embaixo */}
      {[0, 1, 2].map(i => (
        <rect key={i} x={120 + i * 80} y="270" width="60" height="70" rx="4"
          fill="#060a18" stroke={accent} strokeOpacity="0.4" strokeWidth="1.5" />
      ))}
      {/* ponto quente piscando (defeito) */}
      <circle cx="200" cy="305" r="14" fill="none" stroke="#ef4444" strokeWidth="2"
        style={{ animation: 'hotPulse 1.2s ease-in-out infinite' }} />
    </HeroStage>
  )
}

// ===================== SALA DE CONTROLE / SCADA =====================
export function ControlDeskHero() {
  return (
    <HeroStage w={600}>
      {/* mesa */}
      <rect x="120" y="300" width="360" height="20" rx="4" fill={CYAN} fillOpacity="0.15" />
      {/* monitores */}
      {[{ x: 150, w: 130 }, { x: 300, w: 150 }, { x: 470, w: 130 }].map((m, i) => (
        <g key={i}>
          <rect x={m.x} y="120" width={m.w} height="100" rx="6" fill="#060a18" stroke={CYAN} strokeOpacity="0.5" strokeWidth="2" />
          {/* gráfico na tela */}
          <polyline
            points={Array.from({ length: 8 }).map((_, k) => `${m.x + 10 + k * (m.w - 20) / 7},${150 + Math.sin(k + i) * 18 + 20}`).join(' ')}
            fill="none" stroke={[GREEN, CYAN, ORANGE][i]} strokeOpacity="0.8" strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 4px ${[GREEN, CYAN, ORANGE][i]})` }} />
          {/* barras */}
          {Array.from({ length: 4 }).map((_, k) => (
            <rect key={k} x={m.x + 12 + k * 18} y={195 - (k % 3) * 8} width="10" height={(k % 3) * 8 + 6} fill={CYAN} fillOpacity="0.4" />
          ))}
          <rect x={m.x + m.w / 2 - 10} y="220" width="20" height="14" fill={CYAN} fillOpacity="0.2" />
        </g>
      ))}
      {/* teclado */}
      <rect x="260" y="280" width="120" height="20" rx="3" fill="#0d1530" stroke={CYAN} strokeOpacity="0.4" />
    </HeroStage>
  )
}

// ===================== OFICINA / BANCADA DE FERRAMENTAS =====================
export function WorkbenchHero() {
  return (
    <HeroStage w={560}>
      {/* painel de ferramentas */}
      <rect x="80" y="60" width="400" height="160" rx="6" fill="#0d1530" stroke={ORANGE} strokeOpacity="0.4" strokeWidth="2" />
      {/* silhuetas de ferramentas penduradas */}
      <g stroke={ORANGE} strokeOpacity="0.5" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M130,90 L130,150 M115,150 L145,150" /> {/* chave fenda */}
        <circle cx="200" cy="110" r="16" /> <path d="M200,126 L200,170" /> {/* alicate */}
        <path d="M270,90 L290,110 L270,130 L250,110 Z" /> {/* chave */}
        <rect x="330" y="90" width="40" height="70" rx="4" /> {/* multímetro */}
        <path d="M345,160 L345,180 M360,160 L360,180" />
        <path d="M410,90 L430,90 L430,160 L410,160 Z" /> {/* alicate amperímetro */}
        <circle cx="420" cy="80" r="14" />
      </g>
      {/* bancada */}
      <rect x="100" y="250" width="360" height="24" rx="4" fill="#0d1530" stroke={ORANGE} strokeOpacity="0.5" strokeWidth="2" />
      {/* multímetro em cima da bancada com display */}
      <g transform="translate(220,200)">
        <rect x="0" y="0" width="70" height="50" rx="6" fill="#060a18" stroke={GREEN} strokeOpacity="0.5" strokeWidth="2" />
        <text x="35" y="32" textAnchor="middle" fill={GREEN} fontSize="18" fontFamily="Rajdhani" fontWeight="700"
          style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }}>380V</text>
      </g>
      {/* pernas da bancada */}
      <rect x="120" y="274" width="14" height="70" fill={ORANGE} fillOpacity="0.2" />
      <rect x="426" y="274" width="14" height="70" fill={ORANGE} fillOpacity="0.2" />
    </HeroStage>
  )
}

// ===================== ÁREA DE RISCO (alerta) =====================
export function HazardHero() {
  return (
    <HeroStage w={520}>
      {/* poste com placa de alerta */}
      <rect x="244" y="120" width="14" height="220" fill={ORANGE} fillOpacity="0.3" />
      {/* triângulo de perigo */}
      <g transform="translate(251,90)">
        <polygon points="0,-70 70,55 -70,55" fill="#1a0f00" stroke="#f59e0b" strokeWidth="5"
          style={{ animation: 'hotPulse 1.5s ease-in-out infinite' }} />
        <rect x="-7" y="-35" width="14" height="55" rx="3" fill="#f59e0b" />
        <circle cx="0" cy="38" r="8" fill="#f59e0b" />
        {/* raio */}
        <path d="M-3,-25 L8,-2 L0,-2 L6,18 L-8,-6 L0,-6 Z" fill="#ef4444" transform="scale(0.6)" />
      </g>
      {/* faixa zebrada no chão */}
      <g>
        {Array.from({ length: 14 }).map((_, i) => (
          <polygon key={i} points={`${40 + i * 32},320 ${40 + i * 32 + 16},320 ${40 + i * 32 - 4},344 ${40 + i * 32 - 20},344`}
            fill={i % 2 ? '#f59e0b' : '#1a0f00'} fillOpacity="0.6" />
        ))}
      </g>
      {/* faíscas de curto */}
      {[0, 1, 2, 3].map(i => (
        <circle key={i} cx={251 + (Math.random() - 0.5) * 40} cy={130} r="3" fill="#ef4444"
          style={{ animation: `spark 0.8s ease-out ${i * 0.25}s infinite` }} />
      ))}
    </HeroStage>
  )
}

// ===================== SEGURANÇA / NR-10 (EPI) =====================
export function SafetyHero() {
  return (
    <HeroStage w={460}>
      {/* boneco com EPI */}
      <g transform="translate(230,80)">
        {/* capacete */}
        <path d="M-34,40 A34,34 0 0 1 34,40 Z" fill="#f59e0b" fillOpacity="0.7" stroke="#f59e0b" strokeWidth="2" />
        <rect x="-38" y="38" width="76" height="8" rx="3" fill="#f59e0b" />
        {/* rosto/viseira */}
        <rect x="-26" y="46" width="52" height="36" rx="8" fill="#060a18" stroke={CYAN} strokeOpacity="0.4" />
        {/* corpo/colete */}
        <path d="M-40,90 L40,90 L50,210 L-50,210 Z" fill="#0d1530" stroke="#f59e0b" strokeOpacity="0.5" strokeWidth="2" />
        {/* faixas refletivas */}
        <line x1="-44" y1="140" x2="44" y2="140" stroke={GREEN} strokeOpacity="0.6" strokeWidth="6" strokeDasharray="10 6" />
        <line x1="-47" y1="175" x2="47" y2="175" stroke={GREEN} strokeOpacity="0.6" strokeWidth="6" strokeDasharray="10 6" />
        {/* luvas */}
        <circle cx="-52" cy="150" r="14" fill="#f59e0b" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="52" cy="150" r="14" fill="#f59e0b" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="2" />
      </g>
      {/* cadeado LOTO */}
      <g transform="translate(120,250)">
        <rect x="-18" y="0" width="36" height="30" rx="5" fill="#ef4444" fillOpacity="0.6" stroke="#ef4444" strokeWidth="2" />
        <path d="M-10,0 A10,12 0 0 1 10,0" fill="none" stroke="#ef4444" strokeWidth="4" />
      </g>
      {/* escudo de proteção */}
      <g transform="translate(340,250)">
        <path d="M0,-20 L22,-10 L22,15 Q22,32 0,40 Q-22,32 -22,15 L-22,-10 Z"
          fill={GREEN} fillOpacity="0.15" stroke={GREEN} strokeOpacity="0.6" strokeWidth="2" />
        <path d="M-8,8 L-2,16 L10,-2" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
      </g>
    </HeroStage>
  )
}

// ===================== MEDIDORES DE ENERGIA (economia) =====================
export function MetersHero() {
  return (
    <HeroStage w={560}>
      {/* três medidores grandes */}
      {[{ x: 130, v: 0.9, c: GREEN, label: 'kWh' }, { x: 300, v: 0.5, c: CYAN, label: 'Hz' }, { x: 470, v: 0.3, c: ORANGE, label: 'A' }].map((m, i) => {
        const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25
        const ang = a0 + (a1 - a0) * m.v
        return (
          <g key={i} transform={`translate(${m.x},190)`}>
            <circle r="64" fill="#0d1530" stroke={m.c} strokeOpacity="0.5" strokeWidth="3" />
            <circle r="50" fill="#060a18" />
            {/* arco preenchido */}
            <path d={describeArc(0, 0, 50, 135, 135 + 270 * m.v)} fill="none" stroke={m.c} strokeOpacity="0.7" strokeWidth="6"
              style={{ filter: `drop-shadow(0 0 4px ${m.c})` }} />
            {/* ponteiro */}
            <line x1="0" y1="0" x2={Math.cos(ang) * 42} y2={Math.sin(ang) * 42} stroke={m.c} strokeWidth="3" strokeLinecap="round"
              style={{ transformOrigin: '0 0', animation: `gaugeWobble 2.5s ease-in-out ${i * 0.3}s infinite` }} />
            <circle r="6" fill={m.c} />
            <text x="0" y="44" textAnchor="middle" fill={m.c} fontSize="14" fontFamily="Rajdhani" fontWeight="700">{m.label}</text>
          </g>
        )
      })}
      <rect x="100" y="290" width="380" height="16" rx="4" fill={GREEN} fillOpacity="0.15" />
    </HeroStage>
  )
}

// helper para arco SVG
function polarToCartesian(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}
