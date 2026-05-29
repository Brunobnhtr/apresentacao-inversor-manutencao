// Conteúdo dos slides. Cada slide referencia uma CENA (setor da fábrica)
// que aparece no fundo; a câmera viaja de setor em setor ao avançar.

const CYAN = '#00d4ff'
const ORANGE = '#ff6b00'

export const SLIDES = [
  // ============================================================
  // SEÇÃO 1 — INVERSOR DE FREQUÊNCIA
  // ============================================================
  {
    id: 0, section: 'inversor', type: 'title', scene: 'street', accent: CYAN,
    title: 'Inversor de Frequência na Indústria',
    subtitle: 'Controle inteligente de velocidade para motores',
    meta: 'Técnico em Eletrotécnica · 2026',
  },
  {
    id: 1, section: 'inversor', type: 'definition', scene: 'facade', accent: CYAN,
    title: 'O que é um Inversor de Frequência?',
    definition: 'Dispositivo eletrônico de potência que controla a velocidade de motores CA variando a FREQUÊNCIA e a TENSÃO de alimentação. Ele gera sua própria frequência — não depende dos 60 Hz da rede.',
    aliases: ['VFD (Variable Frequency Drive)', 'Drive de Frequência', 'Conversor de Frequência'],
    bullets: [
      { icon: '⚡', text: 'Converte os 60 Hz fixos da rede em frequência variável (0 a 90+ Hz)' },
      { icon: '🔧', text: 'Usa transistores IGBT chaveando em alta velocidade (PWM)' },
      { icon: '🚀', text: 'PODE ultrapassar 60 Hz e fazer o motor girar acima do nominal' },
      { icon: '🏭', text: 'Presente na maioria dos sistemas industriais modernos' },
    ],
  },
  {
    id: 2, section: 'inversor', type: 'diagram', scene: 'corridor', accent: '#8b5cf6',
    title: 'Como Funciona: Etapas de Conversão',
    stages: [
      { label: 'Entrada CA', desc: '3Φ · 380V · 60Hz', icon: '🔌', color: CYAN },
      { label: 'Retificador', desc: 'CA → CC (diodos)', icon: '⬛', color: '#8b5cf6' },
      { label: 'Barramento DC', desc: 'Filtro capacitivo', icon: '🔋', color: '#f59e0b' },
      { label: 'Inversor IGBT', desc: 'CC → CA variável', icon: '💡', color: ORANGE },
      { label: 'Motor CA', desc: 'Velocidade variável', icon: '⚙️', color: '#00ff88' },
    ],
    principle: 'Ns = (120 × f) / p',
    principleNote: 'A velocidade do motor é proporcional à frequência. Dobrou a frequência → dobrou a rotação.',
  },
  {
    id: 3, section: 'inversor', type: 'simulation', simType: 'inverter', scene: 'motor-room', accent: '#00ff88',
    title: 'Simulação — Controle de Velocidade',
    desc: 'Varie a frequência e veja o motor responder',
  },
  {
    id: 4, section: 'inversor', type: 'overview', scene: 'control-room', accent: CYAN,
    title: 'Onde o Inversor é Usado?',
    subtitle: 'Vamos visitar 6 setores da indústria',
    sectors: [
      { icon: '💧', name: 'Bombas', tag: 'até 60% economia' },
      { icon: '💨', name: 'Ventiladores', tag: 'até 55% economia' },
      { icon: '📦', name: 'Esteiras', tag: 'controle preciso' },
      { icon: '🌀', name: 'Compressores', tag: 'até 45% economia' },
      { icon: '🏗️', name: 'Elevadores', tag: 'partida suave' },
      { icon: '🔩', name: 'CNC', tag: 'torque constante' },
    ],
  },
  // --- Aplicações desmembradas (cada uma com seu setor de fundo) ---
  {
    id: 5, section: 'inversor', type: 'app', scene: 'pump-room', accent: CYAN,
    icon: '💧', name: 'Bombas d\'Água', save: 60,
    desc: 'Estações de tratamento, abastecimento e irrigação.',
    points: [
      'Em vez de estrangular válvulas (desperdício), o inversor reduz a rotação',
      'Pela Lei da Afinidade, a potência cai com o CUBO da velocidade',
      'Reduzir 20% da rotação já economiza ~49% de energia',
    ],
  },
  {
    id: 6, section: 'inversor', type: 'app', scene: 'fan-room', accent: CYAN,
    icon: '💨', name: 'Ventiladores e HVAC', save: 55,
    desc: 'Climatização, exaustão industrial e torres de resfriamento.',
    points: [
      'Ajusta a vazão de ar conforme a real necessidade do ambiente',
      'Elimina dampers e registros que só desperdiçam energia',
      'Mesma física das bombas: economia enorme com o controle de rotação',
    ],
  },
  {
    id: 7, section: 'inversor', type: 'app', scene: 'conveyor', accent: CYAN,
    icon: '📦', name: 'Esteiras Transportadoras', save: 35,
    desc: 'Linhas de produção e logística com velocidade ajustável.',
    points: [
      'Sincroniza a velocidade entre vários trechos da linha',
      'Partida suave evita tombar produtos e reduz desgaste mecânico',
      'Carga de torque constante: economia vem da otimização do ritmo',
    ],
  },
  {
    id: 8, section: 'inversor', type: 'app', scene: 'compressor-room', accent: CYAN,
    icon: '🌀', name: 'Compressores de Ar', save: 45,
    desc: 'Ar comprimido com demanda variável ao longo do dia.',
    points: [
      'Mantém a pressão estável sem ciclar liga/desliga constantemente',
      'Evita o pico de corrente de partida (6 a 8× a corrente nominal)',
      'Acompanha o consumo real da fábrica em tempo real',
    ],
  },
  {
    id: 9, section: 'inversor', type: 'app', scene: 'elevator', accent: CYAN,
    icon: '🏗️', name: 'Elevadores e Guindastes', save: 30,
    desc: 'Elevação de carga e pessoas com precisão e conforto.',
    points: [
      'Partida e parada suaves — conforto e segurança',
      'Frenagem regenerativa devolve energia para a rede',
      'Precisão de parada no nível exato do andar',
    ],
  },
  {
    id: 10, section: 'inversor', type: 'app', scene: 'cnc', accent: CYAN,
    icon: '🔩', name: 'Usinagem CNC', save: 25,
    desc: 'Tornos, fresas e centros de usinagem.',
    points: [
      'Controle fino da velocidade de corte para cada material',
      'Mantém torque constante mesmo em baixa rotação',
      'Aqui o inversor costuma trabalhar ACIMA de 60 Hz (alta rotação)',
    ],
  },
  {
    id: 11, section: 'inversor', type: 'affinity', scene: 'energy-room', accent: '#00ff88',
    title: 'Lei da Afinidade — Por que economiza tanto?',
    intro: 'Em bombas e ventiladores centrífugos, tudo depende da rotação (N):',
    laws: [
      { name: 'Vazão', formula: 'Q ∝ N', at50: 'cai para 50%', color: CYAN },
      { name: 'Pressão', formula: 'H ∝ N²', at50: 'cai para 25%', color: '#f59e0b' },
      { name: 'Potência', formula: 'P ∝ N³', at50: 'cai para 12,5%', color: '#00ff88' },
    ],
    key: 'O CUBO na potência é a mágica: uma pequena redução de velocidade gera uma economia gigante de energia.',
    table: [
      { speed: 100, power: 100 },
      { speed: 90, power: 73 },
      { speed: 80, power: 51 },
      { speed: 70, power: 34 },
      { speed: 50, power: 13 },
    ],
    note: '⚠️ Vale para cargas centrífugas (bombas/ventiladores). Em esteiras e guindastes (torque constante) a economia é menor.',
    example: 'Motor de 100 cv a 80% da velocidade → economia de ~R$ 45.000/ano',
  },
  {
    id: 12, section: 'inversor', type: 'impact', scene: 'control-room', accent: CYAN,
    title: 'Impacto no Setor Industrial',
    stats: [
      { value: '70%', label: 'da energia elétrica industrial vai para motores' },
      { value: '60%', label: 'desses motores poderiam usar inversor' },
      { value: 'R$ 4 bi', label: 'de economia potencial/ano no Brasil' },
      { value: '30%', label: 'menos emissão de CO₂ com inversores' },
    ],
    benefits: [
      'Elimina o pico de corrente de partida (6 a 8× a nominal)',
      'Partida suave protege a mecânica da máquina',
      'Controle preciso de torque e velocidade',
      'Proteções integradas: sobretensão, subtensão, sobrecarga',
      'Integração digital com CLP e SCADA',
    ],
  },

  // ============================================================
  // SEÇÃO 2 — MANUTENÇÃO ELÉTRICA
  // ============================================================
  {
    id: 13, section: 'manutencao', type: 'title', scene: 'electrical-wing', accent: ORANGE,
    title: 'Manutenção Elétrica na Indústria',
    subtitle: 'Segurança, confiabilidade e continuidade operacional',
    meta: 'Técnico em Eletrotécnica · 2026',
  },
  {
    id: 14, section: 'manutencao', type: 'types', scene: 'workshop', accent: ORANGE,
    title: 'Tipos de Manutenção Elétrica',
    types: [
      { name: 'Corretiva', icon: '🔴', color: '#ef4444', when: 'Após a falha', desc: 'Conserta depois que quebra. Alto custo por parada não planejada.', cost: 'Custo alto', risk: 'Risco alto' },
      { name: 'Preventiva', icon: '🟡', color: '#f59e0b', when: 'Por tempo', desc: 'Inspeções e trocas programadas. Evita a maioria das falhas.', cost: 'Custo médio', risk: 'Risco médio' },
      { name: 'Preditiva', icon: '🟢', color: '#00ff88', when: 'Por condição', desc: 'Monitora em tempo real e intervém só quando preciso.', cost: 'Custo baixo', risk: 'Risco baixo' },
    ],
  },
  {
    id: 15, section: 'manutencao', type: 'importance', scene: 'hazard-room', accent: '#ef4444',
    title: 'Por que é Crítica?',
    stats: [
      { icon: '💀', value: '23%', label: 'das mortes no trabalho são por choque elétrico' },
      { icon: '🔥', value: '40%', label: 'dos incêndios industriais têm origem elétrica' },
      { icon: '💰', value: 'R$ 50 mil', label: 'custo médio de 1h de parada em linha automotiva' },
      { icon: '📈', value: '85%', label: 'das falhas elétricas são evitáveis' },
    ],
    cascade: [
      'Isolamento do cabo falha',
      'Curto-circuito no painel',
      'Disjuntor defeituoso não atua',
      'Incêndio no quadro',
      'Parada total por 48h',
      'Prejuízo: R$ 2,4 milhões',
    ],
  },
  {
    id: 16, section: 'manutencao', type: 'simulation', simType: 'maintenance', scene: 'panel-room', accent: ORANGE,
    title: 'Simulação — Inspeção de Painel',
    desc: 'Inspecione, use a câmera térmica e ache as falhas',
  },
  {
    id: 17, section: 'manutencao', type: 'tools', scene: 'tool-bench', accent: CYAN,
    title: 'Ferramentas de Diagnóstico',
    tools: [
      { icon: '🌡️', name: 'Termografia', desc: 'Câmera infravermelha acha pontos quentes sem desligar o sistema' },
      { icon: '📊', name: 'Analisador de Qualidade', desc: 'Mede harmônicos, fator de potência e desequilíbrio de fases' },
      { icon: '🔌', name: 'Megôhmetro', desc: 'Testa isolamento de cabos e motores (mín. 1 MΩ/kV)' },
      { icon: '📡', name: 'Análise de Vibração', desc: 'Detecta desbalanceamento e desalinhamento em motores' },
      { icon: '🔊', name: 'Ultrassom', desc: 'Acha descargas parciais e conexões frouxas' },
      { icon: '⚡', name: 'Osciloscópio', desc: 'Visualiza formas de onda e transitórios da rede' },
    ],
  },
  {
    id: 18, section: 'manutencao', type: 'safety', scene: 'safety-room', accent: '#f59e0b',
    title: 'NR-10 — Segurança Elétrica',
    norma: 'Norma Regulamentadora 10 — obrigatória para quem trabalha com energia elétrica.',
    requirements: [
      { icon: '📋', label: 'Prontuário das instalações atualizado' },
      { icon: '🎓', label: 'Capacitação mínima (curso NR-10)' },
      { icon: '🧤', label: 'EPI dielétrico: luvas, óculos, calçado isolado' },
      { icon: '🔒', label: 'LOTO — bloqueio e etiquetagem' },
      { icon: '⚠️', label: 'Análise de risco antes da intervenção' },
      { icon: '👥', label: 'Dois eletricistas acima de 50V CA' },
    ],
    zones: [
      { name: 'Zona de Risco', desc: '< 10 cm', color: '#ef4444' },
      { name: 'Zona Controlada', desc: '10–30 cm', color: '#f59e0b' },
      { name: 'Zona Livre', desc: '> 30 cm', color: '#00d4ff' },
    ],
  },
  {
    id: 19, section: 'manutencao', type: 'roi', scene: 'office', accent: '#00ff88',
    title: 'Manutenção vs Falha — O Custo',
    comparison: [
      {
        scenario: 'Com Manutenção Preventiva', color: '#00ff88',
        items: ['Custo anual: R$ 120 mil', 'Paradas programadas: 48h/ano', 'Disponibilidade: 98,6%', 'Vida útil: 15–20 anos', 'Zero acidentes (meta)'],
        total: 'Total: R$ 120 mil/ano',
      },
      {
        scenario: 'Só Corretiva (sem plano)', color: '#ef4444',
        items: ['Reparos emergenciais: R$ 340 mil', 'Paradas inesperadas: 240h+/ano', 'Disponibilidade: 87%', 'Vida útil: 5–8 anos', 'Alto risco de acidentes'],
        total: 'Total: R$ 1,2 milhão+/ano',
      },
    ],
    conclusion: 'Cada R$ 1 em prevenção evita R$ 10 em correção',
  },
]

export const TOTAL_SLIDES = SLIDES.length
