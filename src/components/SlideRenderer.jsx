import { motion } from 'framer-motion'
import InverterSim from './simulations/InverterSim'
import MaintenanceSim from './simulations/MaintenanceSim'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
}
const stagger = { animate: { transition: { staggerChildren: 0.08 } } }
const item = { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 } }

export default function SlideRenderer({ slide, isAdmin, simData, onSimUpdate }) {
  if (!slide) return null

  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} />
    case 'definition':
      return <DefinitionSlide slide={slide} />
    case 'diagram':
      return <DiagramSlide slide={slide} />
    case 'simulation':
      return (
        <SimSlide slide={slide} isAdmin={isAdmin} simData={simData} onUpdate={onSimUpdate} />
      )
    case 'applications':
      return <ApplicationsSlide slide={slide} />
    case 'energy':
      return <EnergySlide slide={slide} />
    case 'impact':
      return <ImpactSlide slide={slide} />
    case 'types':
      return <TypesSlide slide={slide} />
    case 'importance':
      return <ImportanceSlide slide={slide} />
    case 'tools':
      return <ToolsSlide slide={slide} />
    case 'safety':
      return <SafetySlide slide={slide} />
    case 'roi':
      return <RoiSlide slide={slide} />
    default:
      return <div className="p-8 text-white">{slide.title}</div>
  }
}

function Particles({ color = '#00d4ff', count = 12 }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  )
}

function SectionBadge({ section, accent }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-industrial tracking-widest uppercase mb-4"
      style={{ background: `${accent}22`, border: `1px solid ${accent}44`, color: accent }}
    >
      {section === 'inversor' ? '⚡ Inversor de Frequência' : '🔧 Manutenção Elétrica'}
    </div>
  )
}

function TitleSlide({ slide }) {
  const isInversor = slide.section === 'inversor'
  const bg = isInversor
    ? 'radial-gradient(ellipse at 30% 50%, rgba(0,80,160,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(0,50,100,0.3) 0%, transparent 60%)'
    : 'radial-gradient(ellipse at 30% 50%, rgba(160,40,0,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(100,30,0,0.3) 0%, transparent 60%)'

  return (
    <div className="h-full w-full grid-bg flex flex-col items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      <div className="absolute inset-0" style={{ background: bg }} />
      <Particles color={slide.accent} count={20} />

      <motion.div className="relative z-10 text-center max-w-4xl px-8" {...fadeUp}>
        <motion.div
          className="text-7xl mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          {isInversor ? '⚡' : '🔧'}
        </motion.div>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h1 className="text-5xl md:text-6xl font-industrial font-bold text-white leading-tight mb-4"
          style={{ textShadow: `0 0 40px ${slide.accent}66` }}>
          {slide.title}
        </h1>
        <p className="text-xl text-gray-400 mb-8">{slide.subtitle}</p>
        <div className="text-sm text-gray-600 font-industrial tracking-widest uppercase">{slide.meta}</div>

        {/* Decorative line */}
        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${slide.accent})` }} />
          <div className="w-2 h-2 rounded-full" style={{ background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${slide.accent})` }} />
        </div>
      </motion.div>
    </div>
  )
}

function DefinitionSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <motion.div className="glass rounded-2xl p-6 glow-blue" {...fadeUp} transition={{ delay: 0.1 }}>
        <p className="text-lg text-gray-200 leading-relaxed">{slide.definition}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.2 }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-3">Também conhecido como</div>
          {slide.aliases.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-electric flex-shrink-0" />
              <span className="text-gray-300 font-industrial">{a}</span>
            </div>
          ))}
        </motion.div>

        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-3">Características</div>
          <motion.ul variants={stagger} initial="initial" animate="animate" className="space-y-2">
            {slide.bullets.map((b, i) => (
              <motion.li key={i} variants={item} className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{b.icon}</span>
                <span className="text-sm text-gray-300">{b.text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  )
}

function DiagramSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      {/* Block diagram */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {slide.stages.map((s, i) => (
          <motion.div key={i} className="flex items-center gap-2" {...fadeUp} transition={{ delay: i * 0.1 }}>
            <div
              className="glass rounded-xl p-4 text-center min-w-[110px]"
              style={{ borderColor: `${s.color}44`, boxShadow: `0 0 20px ${s.color}22` }}
            >
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-sm font-industrial font-bold text-white">{s.label}</div>
              <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
            </div>
            {i < slide.stages.length - 1 && (
              <motion.div
                className="flex flex-col items-center gap-0.5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-8 h-0.5" style={{ background: s.color }} />
                <div className="text-xs" style={{ color: s.color }}>→</div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div className="glass rounded-2xl p-5 text-center" {...fadeUp} transition={{ delay: 0.5 }}>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-2">Princípio Fundamental</div>
        <div className="text-xl font-industrial text-electric font-bold mb-2">{slide.principle}</div>
        <div className="text-sm text-gray-400">Ns = velocidade síncrona (RPM) · f = frequência (Hz) · p = número de polos</div>
      </motion.div>

      {/* PWM explanation */}
      <motion.div className="glass rounded-2xl p-4" {...fadeUp} transition={{ delay: 0.6 }}>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-3">Sinal PWM — Modulação por Largura de Pulso</div>
        <div className="flex gap-2 items-end h-10">
          {[1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,0,0,1].map((v, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{
              height: v ? '100%' : '30%',
              background: v ? '#00d4ff' : 'rgba(0,212,255,0.15)',
              transition: 'all 0.3s'
            }} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function SimSlide({ slide, isAdmin, simData, onUpdate }) {
  return (
    <div className="h-full w-full flex flex-col grid-bg overflow-hidden">
      <div className="px-6 pt-4 pb-2 flex items-center gap-4 flex-shrink-0">
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-2xl font-industrial font-bold text-white">{slide.title}</h2>
      </div>
      <div className="flex-1 overflow-hidden">
        {slide.simType === 'inverter'
          ? <InverterSim isAdmin={isAdmin} simData={simData} onUpdate={onUpdate} />
          : <MaintenanceSim isAdmin={isAdmin} simData={simData} onUpdate={onUpdate} />
        }
      </div>
    </div>
  )
}

function ApplicationsSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {slide.apps.map((app, i) => (
          <motion.div
            key={i}
            className="glass rounded-xl p-5 flex flex-col gap-3 hover:border-orange-500/40 transition-colors"
            {...fadeUp}
            transition={{ delay: i * 0.08 }}
            style={{ borderColor: 'rgba(255,107,0,0.15)' }}
          >
            <div className="text-4xl">{app.icon}</div>
            <div>
              <div className="text-lg font-industrial font-bold text-white mb-1">{app.name}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{app.desc}</div>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-industrial">Economia de energia</span>
                <span className="text-neon-green font-bold font-industrial">{app.save}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full">
                <motion.div
                  className="h-1.5 rounded-full"
                  style={{ background: 'linear-gradient(to right, #00ff88, #00d4ff)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${app.save}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function EnergySlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col gap-4">
          <motion.div className="glass rounded-2xl p-5 glow-blue" {...fadeUp} transition={{ delay: 0.1 }}>
            <div className="text-sm text-gray-500 font-industrial uppercase tracking-widest mb-2">Lei da Afinidade</div>
            <div className="text-2xl font-industrial font-bold text-electric">{slide.law}</div>
          </motion.div>
          <motion.div className="glass-orange rounded-2xl p-5 flex-1" {...fadeUp} transition={{ delay: 0.2 }}>
            <div className="text-lg text-neon-orange font-industrial font-bold mb-4">{slide.explanation}</div>
            <div className="space-y-2">
              {slide.table.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-14 font-industrial">{row.speed}% vel.</span>
                  <div className="flex-1 h-4 bg-gray-800 rounded relative overflow-hidden">
                    <motion.div
                      className="h-full rounded"
                      style={{
                        background: `linear-gradient(to right, #00ff88, ${row.power > 70 ? '#ff6b00' : '#00d4ff'})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.power}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-xs font-industrial text-neon-green w-10">{row.power}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div className="glass rounded-2xl p-5 flex flex-col justify-center items-center gap-6" {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="text-center">
            <div className="text-8xl font-industrial font-bold text-neon-green mb-2">87%</div>
            <div className="text-gray-400">Economia a 50% da velocidade</div>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="text-center glass-orange rounded-xl p-4 w-full">
            <div className="text-neon-orange font-industrial font-bold text-lg">{slide.roi}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Motor 100 cv — 8.760 h/ano</div>
            <div className="text-2xl font-industrial font-bold text-electric mt-1">Economia: R$ 45.000/ano</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function ImpactSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {slide.stats.map((s, i) => (
          <motion.div key={i} className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: i * 0.1 }}>
            <div className="text-3xl font-industrial font-bold text-electric mb-1">{s.value}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div className="glass rounded-2xl p-5 flex-1" {...fadeUp} transition={{ delay: 0.4 }}>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-4">Benefícios do Inversor de Frequência</div>
        <div className="grid grid-cols-2 gap-3">
          {slide.benefits.map((b, i) => (
            <motion.div key={i} variants={item} initial="initial" animate="animate" transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-electric mt-1.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{b}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function TypesSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        {slide.types.map((t, i) => (
          <motion.div
            key={i}
            className="glass rounded-2xl p-6 flex flex-col gap-4"
            {...fadeUp}
            transition={{ delay: i * 0.15 }}
            style={{ borderColor: `${t.color}33`, boxShadow: `0 0 30px ${t.color}11` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{t.icon}</span>
              <div>
                <div className="text-xl font-industrial font-bold" style={{ color: t.color }}>{t.name}</div>
                <div className="text-xs text-gray-500 font-industrial">{t.when}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed flex-1">{t.desc}</p>
            <div className="flex gap-3">
              <span className="text-xs glass px-3 py-1 rounded-full font-industrial" style={{ color: t.color, borderColor: `${t.color}33` }}>
                {t.cost}
              </span>
              <span className="text-xs glass px-3 py-1 rounded-full font-industrial" style={{ color: t.color, borderColor: `${t.color}33` }}>
                {t.risk}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ImportanceSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        {slide.stats.map((s, i) => (
          <motion.div key={i} className="glass rounded-xl p-4 text-center" {...fadeUp} transition={{ delay: i * 0.1 }}
            style={{ borderColor: '#ef444433' }}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-3xl font-industrial font-bold text-red-400 mb-1">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div className="glass rounded-2xl p-5 flex-1" {...fadeUp} transition={{ delay: 0.4 }}>
        <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-4">Efeito Cascata de uma Falha Elétrica</div>
        <div className="flex items-center gap-2 flex-wrap">
          {slide.cascade.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="glass rounded-lg px-3 py-2 text-xs font-industrial"
                style={{ borderColor: `rgba(239,68,68,${0.2 + i * 0.12})`, color: `rgba(239,${200 - i * 30},${200 - i * 30},1)` }}>
                {step}
              </div>
              {i < slide.cascade.length - 1 && (
                <span className="text-red-500 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function ToolsSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {slide.tools.map((t, i) => (
          <motion.div key={i} className="glass rounded-xl p-4" {...fadeUp} transition={{ delay: i * 0.08 }}>
            <div className="text-3xl mb-2">{t.icon}</div>
            <div className="font-industrial font-bold text-white mb-2">{t.name}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{t.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function SafetySlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-5 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <motion.div className="glass-orange rounded-2xl p-4" {...fadeUp} transition={{ delay: 0.1 }}>
        <p className="text-sm text-neon-orange leading-relaxed">{slide.norma}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        <motion.div className="glass rounded-2xl p-5" {...fadeUp} transition={{ delay: 0.2 }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-3">Requisitos NR-10</div>
          {slide.requirements.map((r, i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
              <span className="text-lg">{r.icon}</span>
              <span className="text-sm text-gray-300">{r.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div className="glass rounded-2xl p-5 flex flex-col gap-4" {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-industrial mb-1">Zonas de Risco Elétrico</div>
          {slide.zones.map((z, i) => (
            <div key={i} className="glass rounded-xl p-3" style={{ borderColor: `${z.color}44` }}>
              <div className="flex justify-between items-center">
                <span className="font-industrial font-bold text-sm" style={{ color: z.color }}>{z.name}</span>
                <span className="text-xs text-gray-500 font-industrial">{z.desc}</span>
              </div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(3 - i) * 33}%`, background: z.color, opacity: 0.7 }} />
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-2">
            ⚡ Equipamentos acima de 1000V = Alta tensão (AT)<br/>
            ⚡ Abaixo de 1000V = Baixa tensão (BT)
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function RoiSlide({ slide }) {
  return (
    <div className="h-full w-full flex flex-col p-10 gap-6 grid-bg overflow-auto">
      <motion.div {...fadeUp}>
        <SectionBadge section={slide.section} accent={slide.accent} />
        <h2 className="text-4xl font-industrial font-bold text-white">{slide.title}</h2>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {slide.comparison.map((c, i) => (
          <motion.div
            key={i}
            className="glass rounded-2xl p-6 flex flex-col gap-3"
            {...fadeUp}
            transition={{ delay: i * 0.2 }}
            style={{ borderColor: `${c.color}33`, boxShadow: `0 0 30px ${c.color}11` }}
          >
            <div className="font-industrial font-bold text-lg" style={{ color: c.color }}>{c.scenario}</div>
            <div className="space-y-2 flex-1">
              {c.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: c.color }} />
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-3 text-center font-industrial font-bold" style={{ color: c.color, borderColor: `${c.color}33` }}>
              {c.total}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="glass rounded-2xl p-5 text-center"
        {...fadeUp}
        transition={{ delay: 0.4 }}
        style={{ borderColor: '#00ff8844', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}
      >
        <div className="text-xl font-industrial font-bold text-neon-green">{slide.conclusion}</div>
      </motion.div>
    </div>
  )
}
