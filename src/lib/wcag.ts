export function hexToRgb(color: string) {
  if (!color) return { r: 0, g: 0, b: 0 };
  
  // Handle rgb/rgba
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10)
      };
    }
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let hex = color;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(color1: string, color2: string) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function ensureContrast(color: string, bg: string, targetRatio: number): string {
  let currentRatio = getContrastRatio(color, bg);
  if (currentRatio >= targetRatio) return color;

  const rgb = hexToRgb(color);
  const bgRgb = hexToRgb(bg);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const isBgLight = bgLum > 0.5;

  // Step towards black or white to improve contrast
  let r = rgb.r, g = rgb.g, b = rgb.b;
  const step = isBgLight ? -10 : 10;

  for (let i = 0; i < 25; i++) {
    r = Math.max(0, Math.min(255, r + step));
    g = Math.max(0, Math.min(255, g + step));
    b = Math.max(0, Math.min(255, b + step));
    
    const hex = '#' + [r, g, b].map(x => {
      const hexStr = Math.round(x).toString(16);
      return hexStr.length === 1 ? '0' + hexStr : hexStr;
    }).join('');
    
    if (getContrastRatio(hex, bg) >= targetRatio) {
      return hex;
    }
  }
  
  return isBgLight ? '#000000' : '#ffffff';
}

export function getRequiredContrast(level: 'A' | 'AA' | 'AAA', isLargeText: boolean): number {
  if (level === 'AAA') return isLargeText ? 4.5 : 7.0;
  if (level === 'AA') return isLargeText ? 3.0 : 4.5;
  return isLargeText ? 3.0 : 4.5; // A and AA have same minimums for text in WCAG 2.1, but A is generally 4.5 for normal
}
