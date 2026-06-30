// Decision flow: User Affective State -> Communication Goal -> Response Intent & Visual Properties
import { getClosestEmotion } from '../components/Circumplex';

export interface VisualBudget {
  animation: number; // percentage (0.0 to 1.0)
  decoration: number; // percentage (0.0 to 1.0)
}

export interface CommunicationGoalDetails {
  goal: string;
  tone: string;
  visualEnergy: 'Low' | 'Medium' | 'High';
  motion: 'none' | 'minimal' | 'moderate' | 'full';
  decoration: 'none' | 'minimal' | 'moderate' | 'full';
  budget: VisualBudget;
  preferredDecorations: string[];
  avoidDecorations: string[];
  preferredAnimations: string[];
  avoidAnimations: string[];
  fontRules: string;
}

export function getCommunicationGoalDetails(sentiment: number, engagement: number): CommunicationGoalDetails {
  const closestEmotion = getClosestEmotion(sentiment, engagement);

  switch (closestEmotion) {
    case 'Fear':
      return {
        goal: 'Create safety',
        tone: 'Calm, reassuring, stable, and protective',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'minimal',
        budget: { animation: 0.05, decoration: 0.08 },
        preferredDecorations: ['ts-soft', 'ts-indigo-soft', 'ts-soft-gray', 'fw-black', 'ts-highlight'],
        avoidDecorations: ['ol-solid', 'ol-dashed', 'ol-thick-black', 'lt-solid', 'lt-wavy', 'lt-red'],
        preferredAnimations: ['breathe', 'fade', 'float', 'pulse'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'neon', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Editorial Serif (Playfair Display, Bodoni Moda, Cormorant Garamond, Libre Baskerville, Lora) can be used for longer explanations. Avoid highly expressive fonts (Experimental or Handwritten).',
      };

    case 'Anxiety':
      return {
        goal: 'Reduce cognitive load',
        tone: 'Soothing, gentle, structured, and clear',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'minimal',
        budget: { animation: 0.05, decoration: 0.10 },
        preferredDecorations: ['ts-soft', 'ts-soft-gray', 'ts-indigo-soft', 'fw-black', 'ts-highlight', 'ls-wide', 'ls-widest'],
        avoidDecorations: ['ol-solid', 'ol-dashed', 'ol-thick-black', 'ol-wavy', 'lt-solid', 'lt-wavy', 'lt-red', 'ts-sharp', 'ts-hard-red'],
        preferredAnimations: ['breathe', 'float', 'fade'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'neon', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk', 'wobble'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Editorial Serif (Playfair Display, Bodoni Moda, Cormorant Garamond, Libre Baskerville, Lora) for reassurance. Prioritize calm, stable typography. Avoid highly expressive fonts.',
      };

    case 'Stress':
      return {
        goal: 'Increase clarity',
        tone: 'Direct, focused, structured, and unambiguous',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'moderate',
        budget: { animation: 0.08, decoration: 0.12 },
        preferredDecorations: ['fw-black', 'ts-highlight', 'ts-soft', 'ts-soft-gray'],
        avoidDecorations: ['ol-wavy', 'lt-wavy', 'ts-sharp', 'ts-hard-red', 'ul-dotted', 'ul-yellow-dotted'],
        preferredAnimations: ['fade', 'pulse', 'zoom'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Condensed fonts (Bebas Neue, Oswald, Archivo Narrow, Anton) should only be used for clear section headers. Strong visual hierarchy must be established. Avoid visual novelty.',
      };

    case 'Anger':
      return {
        goal: 'Remain neutral, calm, and grounded',
        tone: 'Objective, serene, non-reactive, and spacious',
        visualEnergy: 'Low',
        motion: 'none',
        decoration: 'minimal',
        budget: { animation: 0.02, decoration: 0.05 },
        preferredDecorations: ['ls-wide', 'ls-widest', 'ts-soft-gray'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'ol-thick-black', 'lt-red'],
        preferredAnimations: ['fade', 'breathe'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk', 'bounce', 'jump', 'pop', 'sparkle'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Neutral presentation. Avoid dramatic or expressive fonts.',
      };

    case 'Sadness':
      return {
        goal: 'Add warmth and encouragement',
        tone: 'Warm, compassionate, supportive, and gentle',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'minimal',
        budget: { animation: 0.10, decoration: 0.12 },
        preferredDecorations: ['ls-wide', 'ls-widest', 'ts-soft', 'ts-highlight', 'fs-italic', 'ts-indigo-soft'],
        avoidDecorations: ['ol-solid', 'ol-thick-black', 'lt-solid', 'lt-red', 'ts-hard-red', 'ts-sharp'],
        preferredAnimations: ['drift-up', 'breathe', 'float', 'fade'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk', 'bounce', 'jump'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Editorial Serif (Playfair Display, Bodoni Moda, Cormorant Garamond, Libre Baskerville, Lora) for reflective or supportive responses. Optional Handwritten font (Caveat, Kalam, Architects Daughter) for a brief encouraging closing sentence.',
      };

    case 'Depression':
      return {
        goal: 'Be calm and gently motivating',
        tone: 'Kind, steady, quietly hopeful, and structured',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'minimal',
        budget: { animation: 0.05, decoration: 0.08 },
        preferredDecorations: ['ls-wide', 'ts-soft', 'ts-soft-gray', 'fw-black'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'lt-wavy', 'lt-red'],
        preferredAnimations: ['drift-up', 'breathe', 'fade'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk'],
        fontRules: 'Modern Sans (Inter, Space Grotesk, Manrope) is preferred. Editorial Serif for supportive responses. Minimize visual complexity. Handwritten font (Caveat, Kalam, Architects Daughter) only for short, sincere encouragement when appropriate.',
      };

    case 'Boredom':
      return {
        goal: 'Increase engagement',
        tone: 'Interesting, curious, interactive, and stimulating',
        visualEnergy: 'Medium',
        motion: 'moderate',
        decoration: 'moderate',
        budget: { animation: 0.15, decoration: 0.15 },
        preferredDecorations: ['ts-highlight', 'ts-indigo-soft', 'fw-black', 'fs-italic'],
        avoidDecorations: ['lt-solid', 'lt-gray'],
        preferredAnimations: ['pulse', 'zoom', 'expand', 'wave', 'shimmer'],
        avoidAnimations: ['shake', 'vibrate', 'shatter', 'glitch'],
        fontRules: 'Modern Sans is preferred. Use Editorial Serif or Experimental fonts (Syne, Orbitron, Exo 2) to increase engagement.',
      };

    case 'Fatigue':
      return {
        goal: 'Reduce visual effort',
        tone: 'Minimalist, clear, slow-paced, and quiet',
        visualEnergy: 'Low',
        motion: 'none',
        decoration: 'minimal',
        budget: { animation: 0.02, decoration: 0.05 },
        preferredDecorations: ['fw-black', 'ts-soft-gray'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'ol-thick-black', 'lt-solid', 'lt-wavy'],
        preferredAnimations: ['fade'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk', 'bounce', 'jump', 'pop', 'sparkle', 'shimmer', 'wave', 'float', 'breathe'],
        fontRules: 'Modern Sans almost exclusively. Maximum readability. Minimal font variation.',
      };

    case 'Calm':
    case 'Relaxation':
      return {
        goal: 'Preserve calmness',
        tone: 'Serene, clear, tranquil, and peaceful',
        visualEnergy: 'Low',
        motion: 'minimal',
        decoration: 'minimal',
        budget: { animation: 0.10, decoration: 0.10 },
        preferredDecorations: ['ts-soft', 'ls-wide', 'ts-soft-gray', 'fs-italic'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'ol-solid', 'lt-solid'],
        preferredAnimations: ['float', 'breathe', 'fade'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk', 'bounce', 'jump', 'pop'],
        fontRules: 'Modern Sans is preferred. Editorial Serif (Playfair Display, Bodoni Moda, Cormorant Garamond, Libre Baskerville, Lora) for reflective conversations.',
      };

    case 'Satisfaction':
    case 'Contentment':
      return {
        goal: 'Reinforce satisfaction',
        tone: 'Warm, content, accomplished, and steady',
        visualEnergy: 'Medium',
        motion: 'minimal',
        decoration: 'moderate',
        budget: { animation: 0.12, decoration: 0.15 },
        preferredDecorations: ['ts-soft', 'ts-highlight', 'fw-black', 'ul-double'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'lt-solid', 'lt-red'],
        preferredAnimations: ['breathe', 'float', 'drift-up', 'pop'],
        avoidAnimations: ['shake', 'vibrate', 'flash', 'glitch', 'jiggle', 'tremble', 'shatter', 'slam', 'spin', '3d-spin', 'jerk'],
        fontRules: 'Mostly Modern Sans. Occasional Editorial Serif.',
      };

    case 'Joy':
    case 'Elation':
    case 'Enthusiasm':
      return {
        goal: 'Celebrate lightly',
        tone: 'Cheerful, appreciative, positive, and delightful',
        visualEnergy: 'Medium',
        motion: 'moderate',
        decoration: 'moderate',
        budget: { animation: 0.25, decoration: 0.20 },
        preferredDecorations: ['ts-glow', 'ts-pink-glow', 'ts-vibrant-yellow', 'ts-highlight', 'fw-black'],
        avoidDecorations: ['ts-hard-red', 'ts-sharp', 'lt-solid', 'lt-red', 'ol-thick-black'],
        preferredAnimations: ['bounce', 'pop', 'sparkle', 'shimmer', 'drift-up', 'expand'],
        avoidAnimations: ['shake', 'vibrate', 'glitch', 'shatter', 'slam', 'jerk', 'tremble'],
        fontRules: 'Modern Sans is preferred. Experimental fonts (Syne, Orbitron, Exo 2) for occasional callouts. Handwritten font (Caveat, Kalam, Architects Daughter) for congratulations or celebratory notes.',
      };

    case 'Excitement':
      return {
        goal: 'Match the user’s energy without becoming chaotic',
        tone: 'Dynamic, enthusiastic, bright, and engaging',
        visualEnergy: 'High',
        motion: 'moderate',
        decoration: 'moderate',
        budget: { animation: 0.40, decoration: 0.30 },
        preferredDecorations: ['ts-glow', 'ts-pink-glow', 'ts-vibrant-yellow', 'ts-orange-bright', 'fw-black', 'ts-highlight'],
        avoidDecorations: ['lt-solid', 'lt-red', 'ts-sharp'],
        preferredAnimations: ['bounce', 'pop', 'sparkle', 'shimmer', 'zoom', 'expand', 'wave', 'jump'],
        avoidAnimations: ['shake', 'vibrate', 'glitch', 'shatter', 'slam', 'jerk', 'tremble'],
        fontRules: 'Modern Sans is preferred. Experimental fonts (Syne, Orbitron, Exo 2) for feature names, announcements, or highlights. Condensed fonts (Bebas Neue, Oswald, Archivo Narrow, Anton) for headlines and major milestones.',
      };

    default: // Neutral
      return {
        goal: 'Remain balanced',
        tone: 'Balanced, clear, objective, and helpful',
        visualEnergy: 'Medium',
        motion: 'moderate',
        decoration: 'moderate',
        budget: { animation: 0.15, decoration: 0.15 },
        preferredDecorations: ['fw-black', 'ts-soft', 'ts-soft-gray', 'fs-italic'],
        avoidDecorations: [],
        preferredAnimations: ['fade', 'breathe', 'float', 'pulse'],
        avoidAnimations: ['shake', 'vibrate', 'glitch', 'shatter', 'slam'],
        fontRules: 'Modern Sans is preferred for most of the response (70-80%). Use other categories intentionally based on semantic context.',
      };
  }
}

// Mappings for Semantic Roles (Step 3 & Step 5)
export interface SemanticStyleMapping {
  decorationId: string;
  animationId: string;
  priority: number; // lower value is higher priority for the budget allocation
}

export const SEMANTIC_ROLE_MAP: Record<string, SemanticStyleMapping> = {
  'warning': { decorationId: 'fw-black', animationId: 'pulse', priority: 1 },
  'primary-action': { decorationId: 'ul-double', animationId: 'pop', priority: 2 },
  'success': { decorationId: 'ts-highlight', animationId: 'pop', priority: 3 },
  'reassurance': { decorationId: 'ts-soft', animationId: 'breathe', priority: 4 },
  'important-keyword': { decorationId: 'fw-black', animationId: 'pulse', priority: 5 },
  'important': { decorationId: 'fw-black', animationId: 'pulse', priority: 5 },
  'secondary-action': { decorationId: 'ul-dashed', animationId: 'fade', priority: 6 },
  'empathy': { decorationId: 'ts-soft', animationId: 'breathe', priority: 7 },
  'internal-thought': { decorationId: 'fs-italic', animationId: 'float', priority: 8 },
  'gentle-emphasis': { decorationId: 'ts-soft-gray', animationId: 'breathe', priority: 8 },
  'helpful-guidance': { decorationId: 'ts-indigo-soft', animationId: 'fade', priority: 8 },
  'system-label': { decorationId: 'ol-solid', animationId: 'fade', priority: 9 },
  'correction': { decorationId: 'lt-solid', animationId: 'dissolve', priority: 9 },
  'revision': { decorationId: 'lt-blue', animationId: 'dissolve', priority: 9 },
  'delight': { decorationId: 'ts-glow', animationId: 'sparkle', priority: 5 },
  // Rare high impact triggers
  'instability': { decorationId: 'fw-black', animationId: 'glitch', priority: 5 },
  'destruction': { decorationId: 'fw-black', animationId: 'shatter', priority: 5 },
  'failure': { decorationId: 'lt-red', animationId: 'glitch', priority: 5 },
  'physical-movement': { decorationId: 'fw-black', animationId: 'wave', priority: 5 },
  'playful': { decorationId: 'fw-black', animationId: 'bounce', priority: 7 },
};

export interface TextSegment {
  text: string;
  scale: "small" | "normal" | "large" | "oversized" | "massive";
  alignment: "left" | "center" | "right" | "justify";
  fontVariant: string;
}

export function validateResponseText(text: string): boolean {
  if (!text) return false;
  
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // 1. Parentheses and quotes balance
  const openParens = (trimmed.match(/\(/g) || []).length;
  const closeParens = (trimmed.match(/\)/g) || []).length;
  if (openParens !== closeParens) return false;

  const doubleQuotes = (trimmed.match(/"/g) || []).length;
  const curlyDoubleOpen = (trimmed.match(/“/g) || []).length;
  const curlyDoubleClose = (trimmed.match(/”/g) || []).length;
  
  if (doubleQuotes % 2 !== 0) return false;
  if (curlyDoubleOpen !== curlyDoubleClose) return false;

  // 2. Trailing characters check
  const validEndChars = ['.', '!', '?', '"', '”', "'", '’', ')', '`', '*', '}', ']'];
  const lastChar = trimmed[trimmed.length - 1];
  if (!validEndChars.includes(lastChar)) {
    return false;
  }

  // 3. Must not end with invalid elements
  if ([',', ':', ';', '(', '"', '“', '‘', '['].includes(lastChar)) {
    return false;
  }
  
  const trailingConjunctions = /\b(and|but|or|so|because|although|if|then|for|nor|yet)\s*$/i;
  if (trailingConjunctions.test(trimmed)) {
    return false;
  }

  // 4. No dangling punctuation
  if (/\s+[.,;:!?]/g.test(trimmed)) {
    return false;
  }

  return true;
}

export function segmentText(
  text: string, 
  originalSegments: { text: string; scale?: string; alignment?: string; fontVariant?: string }[]
): TextSegment[] {
  const FONTS = [
    'Playfair Display', 'Bodoni Moda', 'Cormorant Garamond', 'Libre Baskerville', 'Lora',
    'Inter', 'Space Grotesk', 'Manrope', 'Bebas Neue', 'Oswald', 'Archivo Narrow', 'Anton',
    'Syne', 'Orbitron', 'Exo 2', 'IBM Plex Mono', 'JetBrains Mono', 'Space Mono',
    'Caveat', 'Kalam', 'Architects Daughter'
  ];
  const defaultFont = originalSegments[0]?.fontVariant || 'Inter';

  if (!originalSegments || originalSegments.length === 0) {
    originalSegments = [{ text: text, scale: 'normal', alignment: 'left', fontVariant: defaultFont }];
  }

  const concatOriginal = originalSegments.map(s => s.text).join("");

  let originalIsValid = false;
  if (concatOriginal === text) {
    let valid = true;
    for (let i = 0; i < originalSegments.length; i++) {
      const seg = originalSegments[i];
      const trimmed = seg.text.trim();
      if (trimmed.length === 0) continue;
      const lastChar = trimmed[trimmed.length - 1];
      if ([',', ':', ';', '(', '"', '“', '‘'].includes(lastChar)) {
        valid = false;
        break;
      }
      const trailingConjunctions = /\b(and|but|or|so|because|although|if|then|for|nor|yet)\s*$/i;
      if (trailingConjunctions.test(trimmed)) {
        valid = false;
        break;
      }
    }
    originalIsValid = valid;
  }

  if (originalIsValid && concatOriginal === text) {
    return originalSegments.map(s => ({
      text: s.text,
      scale: (s.scale || 'normal') as any,
      alignment: (s.alignment || 'left') as any,
      fontVariant: s.fontVariant || defaultFont
    }));
  }

  const segments: TextSegment[] = [];
  let currentStart = 0;
  
  let inDoubleQuotes = false;
  let inSingleQuotes = false;
  let parenDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"' || char === '“' || char === '”') {
      inDoubleQuotes = !inDoubleQuotes;
    }
    if (char === "'" || char === '‘' || char === '’') {
      const prevIsLetter = i > 0 && /[a-zA-Z]/.test(text[i - 1]);
      const nextIsLetter = i < text.length - 1 && /[a-zA-Z]/.test(text[i + 1]);
      if (!(prevIsLetter && nextIsLetter)) {
        inSingleQuotes = !inSingleQuotes;
      }
    }
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth = Math.max(0, parenDepth - 1);

    if (!inDoubleQuotes && !inSingleQuotes && parenDepth === 0) {
      if (text.substr(i, 2) === '\n\n') {
        const slice = text.substring(currentStart, i + 2);
        segments.push({
          text: slice,
          scale: "normal",
          alignment: "left",
          fontVariant: defaultFont
        });
        currentStart = i + 2;
        i++;
        continue;
      }

      if (/[.!?]/.test(char)) {
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) {
          j++;
        }
        
        if (j === text.length || (j < text.length && /[A-Z0-9]/.test(text[j]))) {
          const preceding = text.substring(Math.max(0, i - 4), i + 1);
          const isAbbrev = /\b(e\.g\.|i\.e\.|Mr\.|Dr\.|vs\.)/i.test(preceding);
          const numberAndUnit = /\b\d+\s*$/i.test(text.substring(currentStart, i));

          if (!isAbbrev && !numberAndUnit) {
            const slice = text.substring(currentStart, j);
            segments.push({
              text: slice,
              scale: "normal",
              alignment: "left",
              fontVariant: defaultFont
            });
            currentStart = j;
            i = j - 1;
          }
        }
      }
    }
  }

  if (currentStart < text.length) {
    segments.push({
      text: text.substring(currentStart),
      scale: "normal",
      alignment: "left",
      fontVariant: defaultFont
    });
  }

  const finalSegments: TextSegment[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const trimmed = seg.text.trim();
    if (trimmed.length === 0) {
      if (finalSegments.length > 0) {
        finalSegments[finalSegments.length - 1].text += seg.text;
      }
      continue;
    }

    const lastChar = trimmed[trimmed.length - 1];
    const isInvalidEnd = [',', ':', ';', '(', '"', '“', '‘'].includes(lastChar) || 
                         /\b(and|but|or|so|because|although|if|then|for|nor|yet)\s*$/i.test(trimmed);

    if (isInvalidEnd && i < segments.length - 1) {
      segments[i + 1].text = seg.text + segments[i + 1].text;
    } else {
      finalSegments.push(seg);
    }
  }

  const styledSegments = finalSegments.map((seg, idx) => {
    const ratio = idx / finalSegments.length;
    const origIdx = Math.min(originalSegments.length - 1, Math.floor(ratio * originalSegments.length));
    const orig: any = originalSegments[origIdx] || {};
    return {
      text: seg.text,
      scale: (orig.scale || "normal") as any,
      alignment: (orig.alignment || "left") as any,
      fontVariant: orig.fontVariant || defaultFont
    };
  });

  const reconstructed = styledSegments.map(s => s.text).join("");
  if (reconstructed !== text) {
    const origFirst: any = originalSegments[0] || {};
    return [{
      text: text,
      scale: (origFirst.scale || "normal") as any,
      alignment: (origFirst.alignment || "left") as any,
      fontVariant: defaultFont
    }];
  }

  return styledSegments;
}
