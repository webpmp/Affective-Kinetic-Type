import { FONTS, FontDef } from './fonts';

export interface TypographyContext {
  text: string;
  sentiment: number;
  engagement: number;
  emotionInfluence: number;
  animationIntensity: number;
  enabledFonts: string[];
  recentFonts: string[];
  expressiveSegmentsCount: number;
}

// Relative weights of fonts within their categories
const FONT_PREFERENCE_WEIGHTS: Record<string, number> = {
  // Modern Sans
  'Inter': 1.0,
  'Manrope': 1.0,
  'Space Grotesk': 0.8,
  
  // Editorial Serif
  'Playfair Display': 1.0,
  'Libre Baskerville': 0.8,
  'Lora': 0.8,
  'Cormorant Garamond': 0.5,
  'Bodoni Moda': 0.5,

  // Condensed / Cinematic
  'Oswald': 0.9,
  'Bebas Neue': 0.6,
  'Archivo Narrow': 0.5,
  'Anton': 0.2,

  // Monospace / Technical
  'IBM Plex Mono': 1.0,
  'JetBrains Mono': 1.0,
  'Space Mono': 0.6,

  // Handwritten / Human
  'Caveat': 0.7,
  'Kalam': 0.4,
  'Architects Daughter': 0.3,

  // Experimental / Expressive
  'Syne': 0.3,
  'Exo 2': 0.3,
  'Orbitron': 0.1
};

// Check if content matches technical/code patterns
function isTechnicalContent(text: string): boolean {
  const codePatterns = [
    /const\s+\w+/i, /let\s+\w+/i, /function\s+\w+/i, /import\s+.*?from/i,
    /\{\}/, /\[\]/, /=>/, /async/i, /api/i, /json/i, /url/i, /diagnostic/i,
    /terminal/i, /output/i, /system/i, /workflow/i, /database/i, /git\s+\w+/i
  ];
  return codePatterns.some(pattern => pattern.test(text));
}

// Check if content matches handwritten/encouragement/warm patterns
function isHandwrittenContent(text: string): boolean {
  const warmWords = [
    'thank you', 'thanks', 'gratitude', 'sorry', 'apologize', 'congratulations',
    'congrats', 'proud of', 'believe in', 'dear', 'love', 'cheer', 'encourage',
    'support', 'journal', 'letter', 'personal', 'story', 'remember when'
  ];
  const lowercase = text.toLowerCase();
  return warmWords.some(word => lowercase.includes(word));
}

// Check if content matches reflective/serif patterns
function isReflectiveContent(text: string): boolean {
  const intellectualWords = [
    'think', 'thought', 'reflect', 'reason', 'philosoph', 'intellect', 'educat',
    'history', 'historic', 'literary', 'poet', 'existential', 'meaning', 'concept',
    'elegant', 'classic', 'narrative', 'story'
  ];
  const lowercase = text.toLowerCase();
  return intellectualWords.some(word => lowercase.includes(word));
}

// Check if content is condensed (short heading / title)
function isCondensedContent(text: string): boolean {
  const wordsCount = text.trim().split(/\s+/).length;
  // Headlines: short, capitalized, or exclamation
  return wordsCount > 0 && wordsCount <= 5 && (text === text.toUpperCase() || text.includes('!'));
}

// Select category based on rules & weights
function selectCategory(ctx: TypographyContext): string {
  const intensity = Math.sqrt(ctx.sentiment * ctx.sentiment + ctx.engagement * ctx.engagement);
  
  // 1. Check Experimental/Expressive conditions
  const isExpressiveAllowed = 
    ctx.emotionInfluence > 1.3 &&
    intensity > 0.6 &&
    ctx.animationIntensity > 1.0 &&
    ctx.expressiveSegmentsCount < 2;

  // 2. Map guidelines directly to categories
  if (isTechnicalContent(ctx.text)) {
    return 'Monospace / Technical';
  }
  if (isHandwrittenContent(ctx.text)) {
    return 'Handwritten / Human';
  }
  if (isCondensedContent(ctx.text)) {
    return 'Condensed / Cinematic';
  }
  if (isExpressiveAllowed && intensity > 0.8 && Math.random() < 0.3) {
    // Only select experimental occasionally even when allowed, to keep it rare
    return 'Experimental / Expressive';
  }
  if (isReflectiveContent(ctx.text)) {
    return 'Editorial Serif';
  }

  // 3. Fallback to weighted random category priority
  // Modern Sans: 50%, Editorial Serif: 30%, Condensed: 10%, Mono: 5%, Handwritten: 3%, Experimental: 2%
  const categories = [
    { name: 'Modern Sans', weight: 0.50 },
    { name: 'Editorial Serif', weight: 0.30 },
    { name: 'Condensed / Cinematic', weight: 0.10 },
    { name: 'Monospace / Technical', weight: 0.05 },
    { name: 'Handwritten / Human', weight: 0.03 },
    { name: 'Experimental / Expressive', weight: isExpressiveAllowed ? 0.02 : 0.00 }
  ];

  const totalCategoryWeight = categories.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalCategoryWeight;
  for (const c of categories) {
    random -= c.weight;
    if (random <= 0) {
      return c.name;
    }
  }

  return 'Modern Sans';
}

export function selectFont(ctx: TypographyContext): string {
  let category = selectCategory(ctx);

  // Filter fonts in the chosen category that are enabled
  let candidates = FONTS.filter(f => f.category === category && ctx.enabledFonts.includes(f.name));

  // If no fonts are enabled in the target category, fallback to Modern Sans or any enabled font
  if (candidates.length === 0) {
    category = 'Modern Sans';
    candidates = FONTS.filter(f => f.category === category && ctx.enabledFonts.includes(f.name));
    
    // Ultimate fallback if no Modern Sans fonts are enabled: pick any enabled font
    if (candidates.length === 0) {
      candidates = FONTS.filter(f => ctx.enabledFonts.includes(f.name));
    }
    
    // Absolute fallback to Inter if nothing is enabled
    if (candidates.length === 0) {
      return 'Inter';
    }
  }

  // Apply recency cooldown multipliers
  // recentFonts is ordered from newest to oldest
  const scoredCandidates = candidates.map(f => {
    const prefWeight = FONT_PREFERENCE_WEIGHTS[f.name] || 0.5;
    const historyIndex = ctx.recentFonts.indexOf(f.name);
    
    let multiplier = 1.0;
    if (historyIndex === 0) {
      multiplier = 0.0; // Do not use the same font consecutively
    } else if (historyIndex === 1) {
      multiplier = 0.1; // heavily penalized
    } else if (historyIndex === 2) {
      multiplier = 0.3; // moderately penalized
    } else if (historyIndex === 3) {
      multiplier = 0.6; // slightly penalized
    }

    return { font: f, score: prefWeight * multiplier };
  });

  const totalScore = scoredCandidates.reduce((sum, c) => sum + c.score, 0);
  
  // If all candidates are completely cooled down, fallback to preference weights ignoring cooldown
  if (totalScore <= 0) {
    const fallbackCandidates = candidates.map(f => ({
      font: f,
      score: FONT_PREFERENCE_WEIGHTS[f.name] || 0.5
    }));
    const fallbackTotal = fallbackCandidates.reduce((sum, c) => sum + c.score, 0);
    let random = Math.random() * fallbackTotal;
    for (const c of fallbackCandidates) {
      random -= c.score;
      if (random <= 0) {
        return c.font.name;
      }
    }
    return candidates[0].name;
  }

  // Select candidate using weighted scores
  let random = Math.random() * totalScore;
  for (const c of scoredCandidates) {
    random -= c.score;
    if (random <= 0) {
      return c.font.name;
    }
  }

  return candidates[0].name;
}
