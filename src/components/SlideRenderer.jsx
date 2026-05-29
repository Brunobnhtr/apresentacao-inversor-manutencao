import { motion } from 'framer-motion'
import InverterSim from './simulations/InverterSim'
import MaintenanceSim from './simulations/MaintenanceSim'

// Conteúdo dos slides — TRANSPARENTE, flutua sobre a cena. O lado direito fica
// livre pra mostrar a máquina/fábrica; o texto vai à esquerda com um scrim leve.
const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } }
const stagger = { animate: { transition: { staggerChildren: 0.07 } } }
const item = { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 } }

// Wrapper de palco: controla alinhamento, largura e o scrim de leitura
function Stage({ children, center = false, wide = false }) {
  if (center) {
    return (
      <div className="relative h-full w-full flex items-center justify-center text-center p-6 md:p-10">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(5,5,16,0.55) 0%, transparent 65%)' }} />
        <div className="relative">{children}</div>
      </div>
    )
  }
  return (
    <div className="relative h-full w-full flex items-center p-6 md:p-10">
      <div className="absolute inset-y-0 left-0 w-[70%] pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(5,5,16,0.86) 0%, rgba(5,5,16,0.7) 45%, transparent 100%)' }} />
      <div className={`relative w-full ${wide ? 'max-w-[820px]' : 'max-w-[540px]'}`}>{children}</div>
    </div>
  )
}

export default function SlideRenderer({ slide, isAdmin, simData, onSimUpdate }) {
  if (!slide) return null
  const props = { slide, isAdmin, simData, onUpdate: onSimUpdate }
  switch (slide.type) {
    case 'title': return <TitleSlide {...props} />
    case 'definition': return <DefinitionSlide {...props} />
    case 'diagram': return <DiagramSlide {...props} />
    case 'simulation': return <SimSlide {...props} />
    case 'overview': return <OverviewSlide {...props} />
    case 'app': return <AppSlide {...props} />
    case 'affinity': return <AffinitySlide {...props} />
    case 'impact': return <ImpactSlide {...props} />
    case 'types': return <TypesSlide {...props} />
    case 'importance': return <ImportanceSlide {...props} />
    case 'tools': return <ToolsSlide {...props} />
    case 'safety': return <SafetySlide {...props} />
    case 'roi': return <RoiSlide {...props} />
    default: return <div className="p-8 text-white">{slide.title}</div>
  }
}

function Badge({ slide }) {
  const c = slide.accent
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-industrial tracking-widest uppercase mb-3"
      style={{ background: `${c}22`, border: `1px solid ${c}55`, color: c, backdropFilter: 'blur(4px)' }}>
      {slide.section === 'inversor' ? '⚡ Inversor de Frequência' : '🔧 Manutenção Elétrica'}
    </div>
  )
}

function Title({ children, slide }) {
  return (
    <h2 className="text-3xl md:text-4xl font-industrial font-bold text-white"
      style={{ textShadow: `0 2px 20px rgba(0,0,0,0.95), 0 0 30px ${slide.accent}44` }}>
      {children}
    </h2>
  )
}

// ---------------- TÍTULO ----------------
function TitleSlide({ slide }) {
  return (
    <Stage center>
      <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
        <motion.div className="text-7xl mb-4" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
          {slide.section === 'inversor' ? '⚡' : '🔧'}
        </motion.div>
        <Badge slide={slide} />
        <h1 className="text-5xl md:text-6xl font-industrial font-bold text-white leading-tight mb-3"
          style={{ textShadow: `0 2px 30px rgba(0,0,0,0.95), 0 0 50px ${slide.accent}66` }}>{slide.title}</h1>
        <p className="text-xl text-gray-200 mb-6" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.95)' }}>{slide.subtitle}</p>
        <div className="text-sm text-gray-300 font-industrial tracking-widest uppercase">{slide.meta}</div>
        <div className="mt-6 flex items-center gap-3 justify-center">
          <div className="w-24 h-px" style={{ background: `linear-gradient(to right, transparent, ${slide.accent})` }} />
          <div className="w-2 h-2 rounded-full" style={{ background: slide.accent, boxShadow: `0 0 10px ${slide.accent}` }} />
          <div className="w-24 h-px" style={{ background: `linear-gradient(to left, transparent, ${slide.accent})` }} />
        </div>
      </motion.div>
    </Stage>
  )
}

// ---------------- DEFINIÇÃO ----------------
function DefinitionSlide({ slide }) {
  return (
    <Stage>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <motion.div className="glass rounded-2xl p-5 glow-blue" {...fadeUp} transition={{ delay: 0.1 }}>
          <p className="text-base text-gray-100 leading-relaxed">{slide.definition}</p>
        </motion.div>
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.2 }}>
          <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-2.5">
            {slide.bullets.map((b, i) => (
              <motion.li key={i} variants={item} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{b.icon}</span><span className="text-sm text-gray-100">{b.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div className="flex flex-wrap gap-2" {...fadeUp} transition={{ delay: 0.3 }}>
          {slide.aliases.map((a, i) => <span key={i} className="text-xs glass px-3 py-1.5 rounded-full font-industrial text-electric">{a}</span>)}
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- DIAGRAMA ----------------
function DiagramSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-5">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="flex items-center gap-2 flex-wrap">
          {slide.stages.map((s, i) => (
            <motion.div key={i} className="flex items-center gap-2" {...fadeUp} transition={{ delay: i * 0.12 }}>
              <div className="glass rounded-xl p-3 text-center min-w-[100px]" style={{ borderColor: `${s.color}55`, boxShadow: `0 0 20px ${s.color}22` }}>
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-sm font-industrial font-bold text-white">{s.label}</div>
                <div className="text-xs text-gray-300 mt-0.5">{s.desc}</div>
              </div>
              {i < slide.stages.length - 1 && <motion.span className="text-lg" style={{ color: s.color }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>}
            </motion.div>
          ))}
        </div>
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.6 }}>
          <div className="text-3xl font-industrial font-bold text-electric mb-1" style={{ filter: 'drop-shadow(0 0 8px #00d4ff66)' }}>{slide.principle}</div>
          <div className="text-sm text-gray-200">{slide.principleNote}</div>
          <div className="text-xs text-gray-400 mt-1">Ns = velocidade (RPM) · f = frequência (Hz) · p = nº de polos</div>
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- SIMULAÇÃO ----------------
function SimSlide({ slide, isAdmin, simData, onUpdate }) {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="px-6 pt-3 flex-shrink-0">
        <Badge slide={slide} />
        <h2 className="text-2xl font-industrial font-bold text-white inline-block ml-2" style={{ textShadow: '0 2px 12px #000' }}>{slide.title}</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {slide.simType === 'inverter'
          ? <InverterSim isAdmin={isAdmin} simData={simData} onUpdate={onUpdate} />
          : <MaintenanceSim isAdmin={isAdmin} simData={simData} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}

// ---------------- OVERVIEW ----------------
function OverviewSlide({ slide }) {
  return (
    <Stage center>
      <motion.div {...fadeUp}>
        <Badge slide={slide} />
        <h2 className="text-4xl font-industrial font-bold text-white" style={{ textShadow: '0 2px 20px #000' }}>{slide.title}</h2>
        <p className="text-gray-200 mt-1" style={{ textShadow: '0 2px 10px #000' }}>{slide.subtitle}</p>
      </motion.div>
      <motion.div className="grid grid-cols-3 gap-3 mt-7 max-w-3xl" variants={stagger} initial="initial" animate="animate">
        {slide.sectors.map((s, i) => (
          <motion.div key={i} variants={item} className="glass rounded-xl p-4 flex flex-col items-center gap-1.5">
            <div className="text-4xl">{s.icon}</div>
            <div className="font-industrial font-bold text-white text-sm">{s.name}</div>
            <div className="text-xs text-neon-green font-industrial">{s.tag}</div>
          </motion.div>
        ))}
      </motion.div>
    </Stage>
  )
}

// ---------------- APLICAÇÃO ----------------
function AppSlide({ slide }) {
  return (
    <Stage>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}>
          <Badge slide={slide} />
          <div className="flex items-center gap-3 mt-1"><span className="text-5xl">{slide.icon}</span><Title slide={slide}>{slide.name}</Title></div>
        </motion.div>
        <motion.p className="text-base text-gray-100" {...fadeUp} transition={{ delay: 0.1 }} style={{ textShadow: '0 2px 10px #000' }}>{slide.desc}</motion.p>
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.2 }}>
          <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-2.5">
            {slide.points.map((p, i) => (
              <motion.li key={i} variants={item} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-electric mt-2 flex-shrink-0" style={{ boxShadow: '0 0 6px #00d4ff' }} />
                <span className="text-sm text-gray-100">{p}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
        <motion.div className="glass rounded-2xl p-4" {...fadeUp} transition={{ delay: 0.35 }}>
          <div className="flex justify-between text-sm mb-1.5 font-industrial"><span className="text-gray-300">Economia de energia possível</span><span className="text-neon-green font-bold">{slide.save}%</span></div>
          <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(to right, #00ff88, #00d4ff)' }} initial={{ width: 0 }} animate={{ width: `${slide.save}%` }} transition={{ duration: 1, delay: 0.4 }} />
          </div>
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- LEI DA AFINIDADE ----------------
function AffinitySlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-3.5">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <motion.p className="text-base text-gray-100" {...fadeUp} transition={{ delay: 0.1 }} style={{ textShadow: '0 2px 10px #000' }}>{slide.intro}</motion.p>
        <div className="grid grid-cols-3 gap-3">
          {slide.laws.map((l, i) => (
            <motion.div key={i} className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: 0.15 + i * 0.1 }} style={{ borderColor: `${l.color}55`, boxShadow: `0 0 20px ${l.color}22` }}>
              <div className="text-xs text-gray-300 font-industrial uppercase tracking-widest">{l.name}</div>
              <div className="text-2xl font-industrial font-bold my-1" style={{ color: l.color, filter: `drop-shadow(0 0 6px ${l.color}66)` }}>{l.formula}</div>
              <div className="text-xs text-gray-200">a 50% da rotação<br /><b style={{ color: l.color }}>{l.at50}</b></div>
            </motion.div>
          ))}
        </div>
        <motion.div className="glass rounded-xl p-4 glow-blue" {...fadeUp} transition={{ delay: 0.5 }}>
          <p className="text-sm text-neon-green font-industrial font-bold">{slide.key}</p>
          <div className="flex items-end gap-2 h-16 mt-3">
            {slide.table.map((r, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-industrial text-neon-green">{r.power}%</span>
                <motion.div className="w-full rounded-t" style={{ background: r.power > 70 ? '#ff6b00' : 'linear-gradient(to top, #00ff88, #00d4ff)' }} initial={{ height: 0 }} animate={{ height: `${r.power * 0.4}px` }} transition={{ delay: 0.6 + i * 0.08 }} />
                <span className="text-xs text-gray-300">{r.speed}%</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center mt-1">velocidade → potência consumida</div>
        </motion.div>
        <motion.div className="flex gap-3 text-xs" {...fadeUp} transition={{ delay: 0.7 }}>
          <span className="glass-orange rounded-lg px-3 py-2 text-orange-200 flex-1">{slide.note}</span>
          <span className="glass rounded-lg px-3 py-2 text-electric font-industrial flex-shrink-0">{slide.example}</span>
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- IMPACTO ----------------
function ImpactSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="grid grid-cols-4 gap-3">
          {slide.stats.map((s, i) => (
            <motion.div key={i} className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: i * 0.1 }}>
              <div className="text-3xl font-industrial font-bold text-electric mb-1" style={{ filter: 'drop-shadow(0 0 8px #00d4ff66)' }}>{s.value}</div>
              <div className="text-xs text-gray-200">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.4 }}>
          <div className="text-xs text-gray-300 uppercase tracking-widest font-industrial mb-3">Benefícios</div>
          <div className="grid grid-cols-2 gap-2.5">
            {slide.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-electric mt-1.5 flex-shrink-0" /><span className="text-sm text-gray-100">{b}</span></div>
            ))}
          </div>
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- TIPOS ----------------
function TypesSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-5">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="grid grid-cols-3 gap-4">
          {slide.types.map((t, i) => (
            <motion.div key={i} className="glass rounded-2xl p-5 flex flex-col gap-3" {...fadeUp} transition={{ delay: i * 0.15 }} style={{ borderColor: `${t.color}55`, boxShadow: `0 0 30px ${t.color}22` }}>
              <div className="flex items-center gap-2"><span className="text-3xl">{t.icon}</span><div><div className="text-lg font-industrial font-bold" style={{ color: t.color }}>{t.name}</div><div className="text-xs text-gray-300 font-industrial">{t.when}</div></div></div>
              <p className="text-sm text-gray-200 flex-1">{t.desc}</p>
              <div className="flex gap-2"><span className="text-xs glass px-2 py-1 rounded-full" style={{ color: t.color }}>{t.cost}</span><span className="text-xs glass px-2 py-1 rounded-full" style={{ color: t.color }}>{t.risk}</span></div>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  )
}

// ---------------- IMPORTÂNCIA ----------------
function ImportanceSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="grid grid-cols-4 gap-3">
          {slide.stats.map((s, i) => (
            <motion.div key={i} className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: i * 0.1 }} style={{ borderColor: '#ef444455' }}>
              <div className="text-3xl mb-1">{s.icon}</div><div className="text-3xl font-industrial font-bold text-red-400 mb-1">{s.value}</div><div className="text-xs text-gray-200">{s.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.4 }} style={{ borderColor: '#ef444433' }}>
          <div className="text-xs text-gray-300 uppercase tracking-widest font-industrial mb-3">Efeito cascata de uma falha</div>
          <div className="flex items-center gap-2 flex-wrap">
            {slide.cascade.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="glass rounded-lg px-3 py-2 text-xs font-industrial" style={{ borderColor: `rgba(239,68,68,${0.25 + i * 0.12})`, color: `rgb(239,${190 - i * 25},${190 - i * 25})` }}>{step}</div>
                {i < slide.cascade.length - 1 && <span className="text-red-500">→</span>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Stage>
  )
}

// ---------------- FERRAMENTAS ----------------
function ToolsSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-5">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="grid grid-cols-3 gap-3">
          {slide.tools.map((t, i) => (
            <motion.div key={i} className="glass rounded-xl p-4" {...fadeUp} transition={{ delay: i * 0.08 }}>
              <div className="text-3xl mb-2">{t.icon}</div><div className="font-industrial font-bold text-white mb-1">{t.name}</div><div className="text-xs text-gray-200">{t.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </Stage>
  )
}

// ---------------- SEGURANÇA ----------------
function SafetySlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <motion.div className="glass-orange rounded-xl p-3" {...fadeUp} transition={{ delay: 0.1 }}><p className="text-sm text-orange-200">{slide.norma}</p></motion.div>
        <div className="grid grid-cols-2 gap-4">
          <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.2 }}>
            <div className="text-xs text-gray-300 uppercase tracking-widest font-industrial mb-2">Requisitos</div>
            {slide.requirements.map((r, i) => (<div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"><span className="text-lg">{r.icon}</span><span className="text-sm text-gray-200">{r.label}</span></div>))}
          </motion.div>
          <motion.div className="glass rounded-2xl p-5 flex flex-col gap-3" {...fadeUp} transition={{ delay: 0.3 }}>
            <div className="text-xs text-gray-300 uppercase tracking-widest font-industrial">Zonas de risco</div>
            {slide.zones.map((z, i) => (
              <div key={i} className="glass rounded-xl p-3" style={{ borderColor: `${z.color}55` }}>
                <div className="flex justify-between items-center"><span className="font-industrial font-bold text-sm" style={{ color: z.color }}>{z.name}</span><span className="text-xs text-gray-300 font-industrial">{z.desc}</span></div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </Stage>
  )
}

// ---------------- ROI ----------------
function RoiSlide({ slide }) {
  return (
    <Stage wide>
      <div className="flex flex-col gap-4">
        <motion.div {...fadeUp}><Badge slide={slide} /><Title slide={slide}>{slide.title}</Title></motion.div>
        <div className="grid grid-cols-2 gap-4">
          {slide.comparison.map((c, i) => (
            <motion.div key={i} className="glass rounded-2xl p-5 flex flex-col gap-2" {...fadeUp} transition={{ delay: i * 0.2 }} style={{ borderColor: `${c.color}55`, boxShadow: `0 0 30px ${c.color}22` }}>
              <div className="font-industrial font-bold text-lg" style={{ color: c.color }}>{c.scenario}</div>
              <div className="space-y-1.5 flex-1">
                {c.items.map((it, j) => (<div key={j} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.color }} /><span className="text-sm text-gray-100">{it}</span></div>))}
              </div>
              <div className="glass rounded-lg p-2.5 text-center font-industrial font-bold" style={{ color: c.color }}>{c.total}</div>
            </motion.div>
          ))}
        </div>
        <motion.div className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: 0.4 }} style={{ borderColor: '#00ff8855', boxShadow: '0 0 20px #00ff8822' }}>
          <div className="text-xl font-industrial font-bold text-neon-green">{slide.conclusion}</div>
        </motion.div>
      </div>
    </Stage>
  )
}
