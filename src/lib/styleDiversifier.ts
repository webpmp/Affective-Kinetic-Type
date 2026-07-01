import { ANIMATION_POOL, TextAnimation } from './animations';
import { DECORATION_POOL, TextDecoration } from './decorations';

interface SelectionState {
  animationFreq: Record<string, number>;
  decorationFreq: Record<string, number>;
  lastUsedIndex: Record<string, number>;
  cooccurrencePairs: Record<string, number>;
  recentAnimations: string[];
  recentDecorations: string[];
  recentPairs: string[];
  cooldowns: Record<string, number>; // Maps styleId -> segmentIndex when cooldown ends
  segmentCounter: number;
}

// Global state persisting across chat interactions
const state: SelectionState = {
  animationFreq: {},
  decorationFreq: {},
  lastUsedIndex: {},
  cooccurrencePairs: {},
  recentAnimations: [],
  recentDecorations: [],
  recentPairs: [],
  cooldowns: {},
  segmentCounter: 0,
};

const EXPRESSIVE_ANIMATIONS = [
  'bounce', 'spin', '3d-spin', 'jump', 'pop', 'flip', 'jiggle',
  'sparkle', 'zoom-bounce', 'wobble', 'stretch', 'rotate', 'neon',
  'shake', 'shiver', 'glitch', 'tremble', 'slam', 'vibrate', 'flash',
  'jerk', 'shatter'
];

const SUBTLE_ANIMATIONS = [
  'sink', 'fade', 'droop', 'melt', 'sigh', 'blur', 'drift-down',
  'dissolve', 'shrink', 'wave', 'float', 'breathe', 'sway', 'glide',
  'drift-up', 'shimmer', 'zoom', 'expand', 'pulse'
];

const MINIMAL_ANIMATIONS = [
  'default', 'fade', 'breathe', 'float', 'sway', 'glide', 'pulse'
];

// Helper to select item via weighted random sampling
function weightedSample<T extends { id: string }>(
  items: T[],
  weights: Record<string, number>
): T {
  let totalWeight = 0;
  const filteredItems = items.filter(item => (weights[item.id] || 0) > 0);
  
  if (filteredItems.length === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  filteredItems.forEach(item => {
    totalWeight += weights[item.id] || 0;
  });

  let r = Math.random() * totalWeight;
  for (const item of filteredItems) {
    r -= weights[item.id] || 0;
    if (r <= 0) {
      return item;
    }
  }
  return filteredItems[filteredItems.length - 1];
}

const styleCache = new Map<string, { animationId: string, decorationId: string, intensity: number }>();

export function selectSegmentStyles(
  message: {
    sentiment: number;
    engagement: number;
    activeAnimations?: string[];
    activeDecorations?: string[];
    emotionInfluence?: number;
    animationIntensity?: number;
    role?: string;
    content: string;
  }
) {
  const cacheKey = message.content;
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }
  if (styleCache.size > 200) {
    styleCache.clear();
  }
  state.segmentCounter++;
  const currentIdx = state.segmentCounter;

  // 1. Context Gating Classification
  // Define content tier based on message properties
  const isUserOrSystem = message.role === 'user' || message.content.includes('```') || /^[\[{]/.test(message.content.trim());
  const sentimentAbs = Math.abs(message.sentiment);
  const engagementAbs = Math.abs(message.engagement);
  const isHighIntensity = !isUserOrSystem && (sentimentAbs > 0.4 || engagementAbs > 0.4);

  let allowedAnims = ANIMATION_POOL;
  
  if (isUserOrSystem) {
    // Restrict to minimal/low-motion styles for structured/system/user content
    allowedAnims = ANIMATION_POOL.filter(a => MINIMAL_ANIMATIONS.includes(a.id));
  } else if (!isHighIntensity) {
    // Bias toward subtle motion for neutral or lower intensity responses
    allowedAnims = ANIMATION_POOL.filter(a => SUBTLE_ANIMATIONS.includes(a.id) || MINIMAL_ANIMATIONS.includes(a.id));
  }

  // Filter styles down to only those currently enabled/active
  const enabledAnims = message.activeAnimations && message.activeAnimations.length > 0
    ? allowedAnims.filter(a => message.activeAnimations!.includes(a.id))
    : allowedAnims;

  const enabledDecos = message.activeDecorations && message.activeDecorations.length > 0
    ? DECORATION_POOL.filter(d => message.activeDecorations!.includes(d.id))
    : DECORATION_POOL;

  // Add default placeholders to pool if empty
  const animPool = enabledAnims.length > 0 ? enabledAnims : [{ id: 'default', name: 'Default', sentiment: 0, engagement: 0 }];
  const decoPool = enabledDecos.length > 0 ? enabledDecos : [{ id: 'none', name: 'None', style: {}, sentiment: 0, engagement: 0 }];

  let selectedAnim: string = 'default';
  let selectedDeco: string = 'none';
  let retryCount = 0;

  while (retryCount < 3) {
    // Calculate weights for Animations
    const animWeights: Record<string, number> = {};
    animPool.forEach(item => {
      let w = 1.0;
      
      // Frequency balancing (lifetime)
      const freq = state.animationFreq[item.id] || 0;
      w *= 1 / (1 + freq);

      // Anti-repetition window (last 10 segments)
      const recentWindowIdx = state.recentAnimations.indexOf(item.id);
      if (recentWindowIdx !== -1) {
        w *= 0.05; // Heavily down-weighted
      }

      // Cooldown timer (3-6 segments)
      const cooldownEnd = state.cooldowns[item.id] || 0;
      if (currentIdx < cooldownEnd) {
        w *= 0.1; // Under cooldown
      }

      animWeights[item.id] = w;
    });

    // Calculate weights for Decorations
    const decoWeights: Record<string, number> = {};
    decoPool.forEach(item => {
      let w = 1.0;

      // Frequency balancing
      const freq = state.decorationFreq[item.id] || 0;
      w *= 1 / (1 + freq);

      // Anti-repetition
      const recentWindowIdx = state.recentDecorations.indexOf(item.id);
      if (recentWindowIdx !== -1) {
        w *= 0.05;
      }

      // Cooldown
      const cooldownEnd = state.cooldowns[item.id] || 0;
      if (currentIdx < cooldownEnd) {
        w *= 0.1;
      }

      // Heavily down-weight double underline if not high intensity
      if (item.id.includes('double') && !isHighIntensity) {
        w *= 0.1;
      }

      decoWeights[item.id] = w;
    });

    const sampledAnim = weightedSample(animPool, animWeights).id;
    const sampledDeco = weightedSample(decoPool, decoWeights).id;
    const pairKey = `${sampledAnim}+${sampledDeco}`;

    // Composition constraint: check if this exact pair has occurred in last 10 segments
    const isPairRepeated = state.recentPairs.includes(pairKey);
    
    if (!isPairRepeated) {
      selectedAnim = sampledAnim;
      selectedDeco = sampledDeco;
      break;
    }

    retryCount++;
  }

  // Fallback behavior if retry exhaustion occurs
  if (retryCount >= 3) {
    selectedAnim = 'default';
    selectedDeco = 'none';
  }

  // Choose dynamic intensity level based on base setting scaled with emotion influence
  const baseIntensity = message.animationIntensity !== undefined ? message.animationIntensity : 1.0;
  const influence = message.emotionInfluence !== undefined ? message.emotionInfluence : 1.0;
  // Vary slightly around base intensity (+/- 15%) to increase diversity
  const variance = (Math.random() * 0.3 - 0.15) * influence;
  const selectedIntensity = Math.max(0.2, Math.min(2.0, baseIntensity + variance));

  // Update statistics and history buffers
  state.animationFreq[selectedAnim] = (state.animationFreq[selectedAnim] || 0) + 1;
  state.decorationFreq[selectedDeco] = (state.decorationFreq[selectedDeco] || 0) + 1;
  state.lastUsedIndex[selectedAnim] = currentIdx;
  state.lastUsedIndex[selectedDeco] = currentIdx;

  const pairKey = `${selectedAnim}+${selectedDeco}`;
  state.cooccurrencePairs[pairKey] = (state.cooccurrencePairs[pairKey] || 0) + 1;

  // Add to rolling history buffers (max N = 10 segments)
  state.recentAnimations.push(selectedAnim);
  if (state.recentAnimations.length > 10) state.recentAnimations.shift();

  state.recentDecorations.push(selectedDeco);
  if (state.recentDecorations.length > 10) state.recentDecorations.shift();

  state.recentPairs.push(pairKey);
  if (state.recentPairs.length > 10) state.recentPairs.shift();

  // Set style cooldown (3 to 6 subsequent segments)
  const cooldownLength = Math.floor(Math.random() * 4) + 3; // [3, 4, 5, 6]
  state.cooldowns[selectedAnim] = currentIdx + cooldownLength;
  state.cooldowns[selectedDeco] = currentIdx + cooldownLength;

  const result = {
    animationId: selectedAnim,
    decorationId: selectedDeco,
    intensity: selectedIntensity,
  };
  styleCache.set(cacheKey, result);
  return result;
}
