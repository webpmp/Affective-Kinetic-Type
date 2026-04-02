import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { DECORATION_POOL } from '../lib/decorations';
import { ANIMATION_POOL } from '../lib/animations';
import { ensureContrast, getRequiredContrast, getLuminance, hexToRgb } from '../lib/wcag';

interface KineticWordProps {
  key?: React.Key;
  word: string;
  sentiment: number;
  engagement: number;
  isEmphasized: boolean;
  baseColor: string;
  backgroundColor?: string;
  motionStyle?: string;
  activeDecorations?: string[];
  activeAnimations?: string[];
  emotionInfluence?: number;
  animationIntensity?: number;
  animationStability?: boolean;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  wcagStrictMode?: boolean;
}

export function KineticWord({ 
  word, 
  sentiment, 
  engagement, 
  isEmphasized, 
  baseColor, 
  backgroundColor = '#0f172a',
  motionStyle = 'default', 
  activeDecorations = [],
  activeAnimations = [],
  emotionInfluence = 1.0,
  animationIntensity = 1.0,
  animationStability = true,
  wcagLevel = 'AA',
  wcagStrictMode = true
}: KineticWordProps) {
  if (!isEmphasized) {
    return <span>{word}</span>;
  }

  const isPositive = sentiment >= 0;
  const isHighEngagement = engagement >= 0;
  const intensity = Math.sqrt(sentiment * sentiment + engagement * engagement);

  // Check background luminance to pick high-contrast colors
  const bgRgb = hexToRgb(backgroundColor);
  const isBgLight = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b) > 0.5;

  // Determine emotional styling
  let emotionColor = baseColor;
  let fontWeight = 500;
  let scale = 1;
  let kineticFont = 'inherit';
  
  let initialY = 0;
  let initialX = 0;
  let initialRotate = 0;

  if (isPositive && isHighEngagement) {
    emotionColor = isBgLight ? '#78350f' : '#fde68a'; // Amber-900 : Amber-200
    fontWeight = 700;
    scale = 1.1 + (intensity * 0.1 * animationIntensity);
    kineticFont = '"Inter", sans-serif';
    initialY = 10 * intensity * animationIntensity;
  } else if (!isPositive && isHighEngagement) {
    emotionColor = isBgLight ? '#7f1d1d' : '#fecaca'; // Red-900 : Red-200
    fontWeight = 700;
    scale = 1.15 + (intensity * 0.15 * animationIntensity);
    kineticFont = '"Space Grotesk", sans-serif';
    initialX = -10 * intensity * animationIntensity;
    initialRotate = -5 * intensity * animationIntensity;
  } else if (!isPositive && !isHighEngagement) {
    emotionColor = isBgLight ? '#1e3a8a' : '#bfdbfe'; // Blue-900 : Blue-200
    fontWeight = 400;
    scale = 0.95 - (intensity * 0.05 * animationIntensity);
    kineticFont = '"JetBrains Mono", monospace';
    initialY = -8 * intensity * animationIntensity;
  } else if (isPositive && !isHighEngagement) {
    emotionColor = isBgLight ? '#064e3b' : '#a7f3d0'; // Emerald-900 : Emerald-200
    fontWeight = 500;
    scale = 1.05 + (intensity * 0.05 * animationIntensity);
    kineticFont = '"Playfair Display", serif';
    initialY = 8 * intensity * animationIntensity;
  }

  // Global constraints for layout integrity
  scale = Math.min(1.1, Math.max(0.9, scale));
  initialY = Math.min(4, Math.max(-4, initialY));
  initialX = Math.min(4, Math.max(-4, initialX));
  initialRotate = Math.min(2, Math.max(-2, initialRotate));

  // Select CSS decoration from pool
  let selectedCssDecoration: React.CSSProperties = {};
  if (activeDecorations && activeDecorations.length > 0) {
    const availableDecorations = DECORATION_POOL.filter(d => activeDecorations.includes(d.id));
    if (availableDecorations.length > 0) {
      const distances = availableDecorations.map(d => {
        const dist = Math.sqrt(Math.pow(d.sentiment - sentiment, 2) + Math.pow(d.engagement - engagement, 2));
        return { ...d, dist };
      });
      distances.sort((a, b) => a.dist - b.dist);
      const topN = distances.slice(0, Math.min(3, distances.length));
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const chosen = topN[hash % topN.length];
      selectedCssDecoration = chosen.style;
    }
  }

  // Select animation from pool
  const chosenAnimation = useMemo(() => {
    if (activeAnimations && activeAnimations.length > 0) {
      const availableAnimations = ANIMATION_POOL.filter(a => activeAnimations.includes(a.id));
      if (availableAnimations.length > 0) {
        const distances = availableAnimations.map(a => {
          const dist = Math.sqrt(
            Math.pow((a.sentiment - sentiment) * emotionInfluence, 2) + 
            Math.pow((a.engagement - engagement) * emotionInfluence, 2)
          );
          return { ...a, dist };
        });
        
        distances.sort((a, b) => a.dist - b.dist);
        const topN = distances.slice(0, Math.min(3, distances.length));
        
        let hash = 0;
        if (animationStability) {
          hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        } else {
          hash = Math.floor(Math.random() * 10000);
        }
        
        return topN[hash % topN.length].id;
      }
    }
    return motionStyle;
  }, [activeAnimations, sentiment, engagement, emotionInfluence, animationStability, word, motionStyle]);

  let selectedAnimation = chosenAnimation;

  // WCAG Enforcement
  let finalCssDecoration = { ...selectedCssDecoration };
  let finalColor = emotionColor;
  if (finalCssDecoration.color) {
    finalColor = finalCssDecoration.color as string;
    delete finalCssDecoration.color;
  }
  
  let finalFont = kineticFont;
  let finalScale = scale;
  let finalWeight = fontWeight;
  let finalAnimationIntensity = animationIntensity;
  let finalSelectedAnimation = selectedAnimation;
  let wasOverridden = false;
  let overrideWarning = false;

  const checkWcag = (level: 'A' | 'AA' | 'AAA') => {
    let overridden = false;
    let newColor = finalColor;
    let newFont = kineticFont;
    let newScale = scale;
    let newWeight = fontWeight;
    let newAnimIntensity = animationIntensity;
    let newAnim = selectedAnimation;
    let newDeco = { ...finalCssDecoration };

    const isLargeText = newScale >= 1.2 || newWeight >= 700;
    const requiredContrast = getRequiredContrast(level, isLargeText);

    // Enforce Contrast
    const contrastColor = ensureContrast(newColor, backgroundColor, requiredContrast);
    if (contrastColor !== newColor) {
      newColor = contrastColor;
      overridden = true;
    }

    // Background and Decoration Safety
    if (newDeco.backgroundColor) {
      const decoBgContrast = ensureContrast(newColor, newDeco.backgroundColor as string, requiredContrast);
      if (decoBgContrast !== newColor) {
        newColor = decoBgContrast;
        overridden = true;
      }
      const bgToMainBgContrast = ensureContrast(newDeco.backgroundColor as string, backgroundColor, 3.0);
      if (bgToMainBgContrast !== newDeco.backgroundColor) {
        newDeco.backgroundColor = bgToMainBgContrast;
        overridden = true;
      }
    }

    if (level === 'AAA') {
      if (kineticFont === '"Space Grotesk", sans-serif' || kineticFont === '"Playfair Display", serif') { newFont = '"Inter", sans-serif'; overridden = true; }
      if (fontWeight < 400) { newWeight = 400; overridden = true; }
      if (fontWeight > 700) { newWeight = 700; overridden = true; }
      if (scale > 1.1) { newScale = 1.1; overridden = true; }
      if (scale < 0.95) { newScale = 0.95; overridden = true; }
      const distractingAnimations = ['glitch', 'shake', 'vibrate', 'flash', 'jerk', 'spin', 'flip', 'bounce', 'jump', 'pop', 'slam', 'wobble'];
      if (distractingAnimations.includes(selectedAnimation)) { newAnim = 'breathe'; overridden = true; }
      if (animationIntensity > 0.2) { newAnimIntensity = 0.2; overridden = true; }
      if (newDeco.textShadow || newDeco.textDecorationStyle === 'wavy' || newDeco.textDecorationStyle === 'dashed' || newDeco.textDecorationStyle === 'dotted') { newDeco = {}; overridden = true; }
    } else if (level === 'AA') {
      const distractingAnimations = ['glitch', 'flash', 'vibrate'];
      if (distractingAnimations.includes(selectedAnimation)) { newAnim = 'pulse'; overridden = true; }
      if (animationIntensity > 0.6) { newAnimIntensity = 0.6; overridden = true; }
      if (newDeco.textShadow && typeof newDeco.textShadow === 'string' && newDeco.textShadow.includes('rgba')) { newDeco = {}; overridden = true; }
    }

    return { overridden, newColor, newFont, newScale, newWeight, newAnimIntensity, newAnim, newDeco };
  };

  const wcagResult = checkWcag(wcagLevel);
  
  if (wcagStrictMode) {
    if (wcagResult.overridden) {
      wasOverridden = true;
      finalColor = wcagResult.newColor;
      finalFont = wcagResult.newFont;
      finalScale = wcagResult.newScale;
      finalWeight = wcagResult.newWeight;
      finalAnimationIntensity = wcagResult.newAnimIntensity;
      finalSelectedAnimation = wcagResult.newAnim;
      finalCssDecoration = wcagResult.newDeco;
    }
  } else {
    if (wcagResult.overridden) {
      overrideWarning = true;
      if (wcagLevel === 'AAA') {
        const fallbackResult = checkWcag('AA');
        finalColor = fallbackResult.newColor;
        finalFont = fallbackResult.newFont;
        finalScale = fallbackResult.newScale;
        finalWeight = fallbackResult.newWeight;
        finalAnimationIntensity = fallbackResult.newAnimIntensity;
        finalSelectedAnimation = fallbackResult.newAnim;
        finalCssDecoration = fallbackResult.newDeco;
      }
    }
  }

  // Define creative animations based on finalSelectedAnimation
  let animateProps: any = {
    color: finalColor,
    opacity: 1,
    scale: finalScale,
    y: 0,
    x: 0,
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    scaleY: 1,
    scaleX: 1,
    skewX: 0,
    filter: "blur(0px)"
  };
  
  let transitionProps: any = {
    color: { duration: 0.8 },
    opacity: { duration: 0.8 },
    scale: { duration: 0.8, type: "spring" },
    y: { duration: 0.8, type: "spring" },
    x: { duration: 0.8, type: "spring" },
    rotate: { duration: 0.8, type: "spring" },
    rotateX: { duration: 0.8, type: "spring" },
    rotateY: { duration: 0.8, type: "spring" },
    scaleY: { duration: 0.8, type: "spring" },
    scaleX: { duration: 0.8, type: "spring" },
    skewX: { duration: 0.8, type: "spring" },
    filter: { duration: 0.8 }
  };

  // Alive motions (continuous loops)
  const aliveDuration = Math.max(0.5, (2 + (1 - intensity)) / finalAnimationIntensity); 
  
  // Q1 (Positive, High Engagement)
  if (finalSelectedAnimation === 'bounce') {
    animateProps.y = [0, -6 * finalAnimationIntensity, 0];
    transitionProps.y = { repeat: Infinity, duration: aliveDuration * 0.5, ease: "easeOut", repeatDelay: 0.5 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'spin') {
    animateProps.rotate = [-4 * finalAnimationIntensity, 4 * finalAnimationIntensity];
    transitionProps.rotate = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === '3d-spin') {
    animateProps.rotateY = [0, 360];
    animateProps.rotateX = [0, 15 * finalAnimationIntensity, 0];
    transitionProps.rotateY = { repeat: Infinity, duration: aliveDuration * 2.0, ease: "linear" };
    transitionProps.rotateX = { repeat: Infinity, duration: aliveDuration * 2.0, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'jump') {
    animateProps.y = [0, -12 * finalAnimationIntensity, 0];
    transitionProps.y = { repeat: Infinity, duration: aliveDuration * 0.4, ease: "circOut", repeatDelay: 1.0 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'pop') {
    animateProps.scale = [finalScale, finalScale * (1 + 0.25 * finalAnimationIntensity), finalScale];
    transitionProps.scale = { repeat: Infinity, duration: aliveDuration * 0.3, ease: "backOut", repeatDelay: 1.2 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'flip') {
    animateProps.rotateX = [0, 360];
    transitionProps.rotateX = { repeat: Infinity, duration: aliveDuration * 0.8, ease: "easeInOut", repeatDelay: 1.5 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'jiggle') {
    const j = 3 * finalAnimationIntensity;
    animateProps.rotate = [-j, j, -j, j, 0];
    transitionProps.rotate = { repeat: Infinity, duration: 0.3 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration * 0.8 };
  } else if (finalSelectedAnimation === 'sparkle') {
    animateProps.opacity = [1, 0.3, 1, 0.3, 1];
    animateProps.scale = [finalScale, finalScale * (1 + 0.1 * finalAnimationIntensity), finalScale, finalScale * (1 + 0.1 * finalAnimationIntensity), finalScale];
    transitionProps.opacity = { repeat: Infinity, duration: 0.6 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration };
    transitionProps.scale = { repeat: Infinity, duration: 0.6 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration };
  } else if (finalSelectedAnimation === 'zoom-bounce') {
    animateProps.scale = [finalScale, finalScale * (1 + 0.2 * finalAnimationIntensity), finalScale];
    animateProps.y = [0, -8 * finalAnimationIntensity, 0];
    transitionProps.scale = { repeat: Infinity, duration: aliveDuration * 0.6, ease: "easeInOut", repeatDelay: 0.5 / finalAnimationIntensity };
    transitionProps.y = { repeat: Infinity, duration: aliveDuration * 0.6, ease: "easeOut", repeatDelay: 0.5 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'wobble') {
    const w = 5 * finalAnimationIntensity;
    animateProps.rotate = [-w, w, -w/2, w/2, 0];
    animateProps.x = [-w, w, -w/2, w/2, 0];
    transitionProps.rotate = { repeat: Infinity, duration: 0.5 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration };
    transitionProps.x = { repeat: Infinity, duration: 0.5 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration };
  
  // Q2 (Negative, High Engagement)
  } else if (finalSelectedAnimation === 'shake') {
    const s = 2 * finalAnimationIntensity;
    animateProps.x = [-s, s, -s, s, 0];
    transitionProps.x = { repeat: Infinity, duration: 0.4 / finalAnimationIntensity, ease: "easeInOut", repeatDelay: aliveDuration };
  } else if (finalSelectedAnimation === 'pulse') {
    animateProps.opacity = [1, Math.max(0.2, 1 - 0.4 * finalAnimationIntensity)];
    animateProps.scale = [finalScale, finalScale * (1 + 0.05 * finalAnimationIntensity)];
    transitionProps.opacity = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 0.8, ease: "easeInOut" };
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 0.8, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'shiver') {
    const s = 1 * finalAnimationIntensity;
    animateProps.x = [-s, s, -s, s, -s, s, 0];
    transitionProps.x = { repeat: Infinity, duration: 0.2 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration * 0.5 };
  } else if (finalSelectedAnimation === 'glitch') {
    const g = 3 * finalAnimationIntensity;
    animateProps.x = [0, -g, g, -g/3, g*0.6, 0];
    animateProps.skewX = [0, 10 * finalAnimationIntensity, -10 * finalAnimationIntensity, 5 * finalAnimationIntensity, 0];
    transitionProps.x = { repeat: Infinity, duration: 0.3 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration * 1.2 };
    transitionProps.skewX = { repeat: Infinity, duration: 0.3 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration * 1.2 };
  } else if (finalSelectedAnimation === 'tremble') {
    const t = 1 * finalAnimationIntensity;
    animateProps.x = [-t, t, -t, t];
    animateProps.y = [t, -t, t, -t];
    transitionProps.x = { repeat: Infinity, repeatType: "reverse", duration: 0.1 / finalAnimationIntensity, ease: "linear" };
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: 0.15 / finalAnimationIntensity, ease: "linear" };
  } else if (finalSelectedAnimation === 'slam') {
    animateProps.scale = [finalScale * (1 + 0.5 * finalAnimationIntensity), finalScale];
    animateProps.y = [-10 * finalAnimationIntensity, 0];
    transitionProps.scale = { repeat: Infinity, duration: 0.2 / finalAnimationIntensity, ease: "easeIn", repeatDelay: aliveDuration * 1.5 };
    transitionProps.y = { repeat: Infinity, duration: 0.2 / finalAnimationIntensity, ease: "easeIn", repeatDelay: aliveDuration * 1.5 };
  } else if (finalSelectedAnimation === 'vibrate') {
    const v = 0.5 * finalAnimationIntensity;
    animateProps.x = [-v, v];
    animateProps.y = [-v, v];
    transitionProps.x = { repeat: Infinity, repeatType: "reverse", duration: 0.05 / finalAnimationIntensity, ease: "linear" };
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: 0.06 / finalAnimationIntensity, ease: "linear" };
  } else if (finalSelectedAnimation === 'flash') {
    animateProps.opacity = [1, 0, 1];
    transitionProps.opacity = { repeat: Infinity, duration: 0.15 / finalAnimationIntensity, ease: "linear", repeatDelay: aliveDuration * 1.5 };
  } else if (finalSelectedAnimation === 'jerk') {
    const j = 4 * finalAnimationIntensity;
    animateProps.x = [0, -j, 0];
    animateProps.y = [0, j/2, 0];
    transitionProps.x = { repeat: Infinity, duration: 0.15 / finalAnimationIntensity, ease: "easeOut", repeatDelay: aliveDuration * 1.2 };
    transitionProps.y = { repeat: Infinity, duration: 0.15 / finalAnimationIntensity, ease: "easeOut", repeatDelay: aliveDuration * 1.2 };

  // Q3 (Negative, Low Engagement)
  } else if (finalSelectedAnimation === 'sink') {
    animateProps.y = [0, 4 * finalAnimationIntensity];
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.2, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'fade') {
    animateProps.opacity = [1, Math.max(0.1, 1 - 0.7 * finalAnimationIntensity)];
    transitionProps.opacity = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'droop') {
    animateProps.rotate = [0, 8 * finalAnimationIntensity];
    animateProps.y = [0, 3 * finalAnimationIntensity];
    transitionProps.rotate = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'melt') {
    animateProps.scaleY = [1, Math.max(0.5, 1 - 0.2 * finalAnimationIntensity)];
    animateProps.scaleX = [1, 1 + 0.05 * finalAnimationIntensity];
    animateProps.y = [0, 2 * finalAnimationIntensity];
    transitionProps.scaleY = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
    transitionProps.scaleX = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'sigh') {
    animateProps.y = [0, -2 * finalAnimationIntensity, 4 * finalAnimationIntensity, 0];
    transitionProps.y = { repeat: Infinity, duration: aliveDuration * 2, ease: "easeInOut", repeatDelay: 1 / finalAnimationIntensity };
  } else if (finalSelectedAnimation === 'blur') {
    animateProps.filter = ["blur(0px)", `blur(${2 * finalAnimationIntensity}px)`];
    animateProps.opacity = [1, Math.max(0.3, 1 - 0.3 * finalAnimationIntensity)];
    transitionProps.filter = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
    transitionProps.opacity = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'drift-down') {
    animateProps.y = [0, 5 * finalAnimationIntensity];
    animateProps.x = [0, 3 * finalAnimationIntensity];
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
    transitionProps.x = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'dissolve') {
    animateProps.opacity = [1, 0];
    animateProps.filter = ["blur(0px)", `blur(${4 * finalAnimationIntensity}px)`];
    transitionProps.opacity = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2.5, ease: "easeInOut" };
    transitionProps.filter = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'shrink') {
    animateProps.scale = [finalScale, finalScale * Math.max(0.5, 1 - 0.2 * finalAnimationIntensity)];
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };

  // Q4 (Positive, Low Engagement)
  } else if (finalSelectedAnimation === 'wave') {
    animateProps.y = [-3 * finalAnimationIntensity, 3 * finalAnimationIntensity];
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'float') {
    animateProps.y = [-4 * finalAnimationIntensity, 0];
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.2, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'breathe') {
    animateProps.scale = [finalScale, finalScale * (1 + 0.04 * finalAnimationIntensity)];
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.8, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'sway') {
    animateProps.rotate = [-2 * finalAnimationIntensity, 2 * finalAnimationIntensity];
    transitionProps.rotate = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'glide') {
    animateProps.x = [-4 * finalAnimationIntensity, 4 * finalAnimationIntensity];
    transitionProps.x = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'drift-up') {
    animateProps.y = [0, -5 * finalAnimationIntensity];
    animateProps.x = [0, -3 * finalAnimationIntensity];
    transitionProps.y = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2, ease: "easeInOut" };
    transitionProps.x = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 2.5, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'shimmer') {
    animateProps.opacity = [Math.max(0.2, 1 - 0.2 * finalAnimationIntensity), 1, Math.max(0.2, 1 - 0.2 * finalAnimationIntensity)];
    animateProps.color = [finalColor, '#ffffff', finalColor];
    transitionProps.opacity = { repeat: Infinity, duration: aliveDuration, ease: "easeInOut" };
    transitionProps.color = { repeat: Infinity, duration: aliveDuration, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'zoom') {
    animateProps.scale = [finalScale, finalScale * (1 + 0.08 * finalAnimationIntensity)];
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration, ease: "easeInOut" };
  } else if (finalSelectedAnimation === 'expand') {
    animateProps.scale = [finalScale, finalScale * (1 + 0.1 * finalAnimationIntensity)];
    animateProps.letterSpacing = ["0em", `${0.05 * finalAnimationIntensity}em`];
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
    transitionProps.letterSpacing = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  } else {
    // default subtle breath
    animateProps.scale = [finalScale, finalScale * (1 + 0.02 * finalAnimationIntensity)];
    transitionProps.scale = { repeat: Infinity, repeatType: "reverse", duration: aliveDuration * 1.5, ease: "easeInOut" };
  }

  const clampArrayOrValue = (val: any, min: number, max: number) => {
    if (Array.isArray(val)) {
      return val.map(v => Math.min(max, Math.max(min, v)));
    }
    return Math.min(max, Math.max(min, val));
  };

  if (animateProps.scale) animateProps.scale = clampArrayOrValue(animateProps.scale, 0.9, 1.1);
  if (animateProps.scaleX) animateProps.scaleX = clampArrayOrValue(animateProps.scaleX, 0.9, 1.1);
  if (animateProps.scaleY) animateProps.scaleY = clampArrayOrValue(animateProps.scaleY, 0.9, 1.1);
  if (animateProps.x) animateProps.x = clampArrayOrValue(animateProps.x, -4, 4);
  if (animateProps.y) animateProps.y = clampArrayOrValue(animateProps.y, -4, 4);
  if (animateProps.rotate) animateProps.rotate = clampArrayOrValue(animateProps.rotate, -2, 2);
  if (animateProps.rotateX) animateProps.rotateX = clampArrayOrValue(animateProps.rotateX, -5, 5);
  if (animateProps.skewX) animateProps.skewX = clampArrayOrValue(animateProps.skewX, -2, 2);
  if (animateProps.letterSpacing) {
    delete animateProps.letterSpacing;
    if (transitionProps.letterSpacing) delete transitionProps.letterSpacing;
  }

  // Enforce WCAG on dynamic states
  if (wcagStrictMode || wcagLevel === 'AAA') {
    const isLargeText = finalScale >= 1.2 || finalWeight >= 700;
    const requiredContrast = getRequiredContrast(wcagLevel, isLargeText);
    
    // Clamp opacity to ensure text remains readable
    const minOpacity = wcagLevel === 'AAA' ? 0.6 : 0.4;
    if (animateProps.opacity) {
      animateProps.opacity = clampArrayOrValue(animateProps.opacity, minOpacity, 1);
    }
    
    // Ensure dynamic colors meet contrast
    if (animateProps.color && Array.isArray(animateProps.color)) {
      const bgToCheck = finalCssDecoration.backgroundColor ? finalCssDecoration.backgroundColor as string : backgroundColor;
      animateProps.color = animateProps.color.map((c: string) => ensureContrast(c, bgToCheck, requiredContrast));
    }
  }

  return (
    <span className="relative inline-block mx-[0.15em] px-[0.05em] align-baseline">
      <motion.span
        initial={{ 
          color: baseColor, 
          scale: scale,
          y: initialY,
          x: initialX,
          rotate: initialRotate,
          rotateX: 0,
          scaleY: 1,
          scaleX: 1,
          skewX: 0,
          filter: "blur(0px)",
          opacity: 0
        }}
        animate={animateProps}
        transition={transitionProps}
        style={{
          fontWeight: finalWeight,
          fontFamily: finalFont,
          display: 'inline-block',
          transformOrigin: 'center center',
          lineHeight: 'inherit',
          boxSizing: 'border-box',
          ...finalCssDecoration
        }}
      >
        {word}
      </motion.span>
    </span>
  );
}

