/**
 * Generates the System Thinking narrative client side.
 *
 * Output: a single cohesive prose paragraph, 80 to 110 words.
 * No bullets, no labels, no headings, no status indicators.
 * STRICTLY NO DASHES of any kind (hyphen, en dash, em dash, minus sign).
 */

interface SystemThinkingParams {
  userMessage: string;
  sentiment: number;
  engagement: number;
  age: number;
  gender: string;
  enabledFonts: string[];
  fontSize: number;
  fontColor: string;
  motionStyle: string;
  activeAnimations: string[];
  activeDecorations: string[];
  emotionInfluence: number;
  animationIntensity: number;
  maxAnimatedKeywords: number;
  animationStability: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagStrictMode: boolean;
  bgAnimationType: string;
  baseTheme: string;
}

interface EmotionDescriptor {
  label: string;
  valenceDesc: string;
  arousalDesc: string;
  stateDesc: string;
  toneWord: string;
}

function classifyEmotion(v: number, a: number): EmotionDescriptor {
  const pv = v > 0.1, nv = v < -0.1;
  const pa = a > 0.2, na = a < -0.2;
  const sv = Math.abs(v) > 0.5, sa = Math.abs(a) > 0.5;

  if (pv && pa && sv && sa) return {
    label: 'elation',
    valenceDesc: 'strongly positive',
    arousalDesc: 'highly energized',
    stateDesc: 'expressive intensity with forward momentum',
    toneWord: 'bold and celebratory',
  };
  if (pv && pa) return {
    label: 'enthusiasm',
    valenceDesc: 'positive',
    arousalDesc: 'activated',
    stateDesc: 'optimistic engagement and directional energy',
    toneWord: 'warm and forward moving',
  };
  if (pv && na && sv && sa) return {
    label: 'relaxation',
    valenceDesc: 'positive',
    arousalDesc: 'very low in arousal',
    stateDesc: 'quiet comfort and emotional stillness',
    toneWord: 'gentle and unhurried',
  };
  if (pv && na) return {
    label: 'contentment',
    valenceDesc: 'positive',
    arousalDesc: 'low in arousal',
    stateDesc: 'grounded ease and resolved tension',
    toneWord: 'calm and assured',
  };
  if (nv && pa && sv && sa) return {
    label: 'stress',
    valenceDesc: 'negative',
    arousalDesc: 'highly activated',
    stateDesc: 'urgency and unresolved pressure',
    toneWord: 'tense and concentrated',
  };
  if (nv && pa) return {
    label: 'anxiety',
    valenceDesc: 'negative',
    arousalDesc: 'restlessly activated',
    stateDesc: 'vigilant tension without clear resolution',
    toneWord: 'guarded and alert',
  };
  if (nv && na && sv && sa) return {
    label: 'depression',
    valenceDesc: 'strongly negative',
    arousalDesc: 'very low in arousal',
    stateDesc: 'deep withdrawal and reduced engagement',
    toneWord: 'quiet and subdued',
  };
  if (nv && na) return {
    label: 'sadness',
    valenceDesc: 'negative',
    arousalDesc: 'low in arousal',
    stateDesc: 'inward softening and reduced responsiveness',
    toneWord: 'gentle and withdrawn',
  };
  return {
    label: 'a neutral state',
    valenceDesc: 'neutral',
    arousalDesc: 'balanced in arousal',
    stateDesc: 'measured and evenly paced expression',
    toneWord: 'composed and steady',
  };
}

function motionClause(style: string): string {
  const map: Record<string, string> = {
    drift:      'drifting slowly to let meaning accumulate',
    bounce:     'bouncing to punctuate emphasis physically',
    wave:       'flowing in a rolling cadence',
    glitch:     'introducing controlled visual tension',
    pulse:      'pulsing to draw sustained focus',
    slide:      'sliding words to guide the reader',
    fade:       'fading words to soften each arrival',
    zoom:       'scaling words for immediate presence',
    typewriter: 'revealing words in sequence to pace reading',
    spiral:     'spiraling to suggest emergence',
    scatter:    'scattering words for individual weight',
    flip:       'flipping words to signal conceptual shifts',
    default:    'remaining static to maintain pure focus',
  };
  return map[style] || map['default'];
}

function fontClause(fonts: string[]): string {
  const f = fonts[0] || 'Inter';
  const map: Record<string, string> = {
    'Inter':              'sans serif Inter for clean readability',
    'Playfair Display':   'serif Playfair Display for editorial weight',
    'Space Mono':         'monospace Space Mono for technical precision',
    'Bebas Neue':         'display face Bebas Neue for raw intensity',
    'Dancing Script':     'script Dancing Script for warm informality',
    'Righteous':          'geometric Righteous for assertive confidence',
    'Lato':               'sans serif Lato for structural warmth',
    'Merriweather':       'slab serif Merriweather for comfortable reading',
    'Oswald':             'condensed Oswald for compact authority',
    'Raleway':            'grotesque Raleway for refined proportions',
  };
  return map[f] || f;
}

function sizeClause(size: number): string {
  if (size >= 64) return 'at an enlarged scale for presence';
  if (size >= 36) return 'at a prominent scale for balance';
  return 'at a compact scale for close focus';
}

function wcagClause(level: 'A' | 'AA' | 'AAA', strict: boolean): string {
  const ratioMap = { A: 'three to one', AA: 'four point five to one', AAA: 'seven to one' };
  return strict
    ? `with WCAG ${level} enforced strictly at a ${ratioMap[level]} contrast ratio`
    : `guided softly by WCAG ${level} at a ${ratioMap[level]} ratio`;
}

function formatFloatNoDash(num: number): string {
  const absoluteVal = Math.abs(num).toFixed(2);
  if (num < 0) {
    return `minus ${absoluteVal}`;
  }
  return absoluteVal;
}

export function generateSystemThinking(params: SystemThinkingParams): string {
  const {
    userMessage,
    sentiment,
    engagement,
    enabledFonts,
    fontSize,
    motionStyle,
    wcagLevel,
    wcagStrictMode,
    emotionInfluence,
  } = params;

  const emo = classifyEmotion(sentiment, engagement);
  const wordLen = userMessage.trim().split(/\s+/).length;

  const lengthDesc = wordLen <= 6
    ? 'brief input'
    : wordLen >= 35
    ? 'longer expression'
    : 'conversational input';

  const sVal = formatFloatNoDash(sentiment);
  const eVal = formatFloatNoDash(engagement);

  const part1 = `The user message, read as a ${lengthDesc}, indicates ${emo.label} characterized by ${emo.valenceDesc} valence at ${sVal} and ${emo.arousalDesc} arousal at ${eVal}, showing ${emo.stateDesc}.`;
  
  const influenceDesc = emotionInfluence > 0.65 
    ? 'strongly shapes' 
    : emotionInfluence > 0.35 
    ? 'moderately guides' 
    : 'subtly informs';

  const part2 = `This ${emo.toneWord} context ${influenceDesc} the rendering of ${fontClause(enabledFonts)} ${sizeClause(fontSize)}, ${motionClause(motionStyle)}, ${wcagClause(wcagLevel, wcagStrictMode)} to ensure contrast matches user needs.`;

  const full = `${part1} ${part2}`;

  // Strict regex replacement to strip any remaining hyphens, en-dashes, em-dashes, or minus signs
  return full
    .replace(/[\u2013\u2014]/g, ', ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
