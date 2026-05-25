export interface FontDef {
  name: string;
  value: string;
  category: string;
}

export const FONTS: FontDef[] = [
  // EDITORIAL SERIF
  { name: 'Playfair Display', value: '"Playfair Display", serif', category: 'Editorial Serif' },
  { name: 'Bodoni Moda', value: '"Bodoni Moda", serif', category: 'Editorial Serif' },
  { name: 'Cormorant Garamond', value: '"Cormorant Garamond", serif', category: 'Editorial Serif' },
  { name: 'Libre Baskerville', value: '"Libre Baskerville", serif', category: 'Editorial Serif' },
  { name: 'Lora', value: '"Lora", serif', category: 'Editorial Serif' },
  
  // MODERN SANS
  { name: 'Inter', value: '"Inter", sans-serif', category: 'Modern Sans' },
  { name: 'Space Grotesk', value: '"Space Grotesk", sans-serif', category: 'Modern Sans' },
  { name: 'Manrope', value: '"Manrope", sans-serif', category: 'Modern Sans' },

  // CONDENSED / CINEMATIC
  { name: 'Bebas Neue', value: '"Bebas Neue", sans-serif', category: 'Condensed / Cinematic' },
  { name: 'Oswald', value: '"Oswald", sans-serif', category: 'Condensed / Cinematic' },
  { name: 'Archivo Narrow', value: '"Archivo Narrow", sans-serif', category: 'Condensed / Cinematic' },
  { name: 'Anton', value: '"Anton", sans-serif', category: 'Condensed / Cinematic' },

  // EXPERIMENTAL / EXPRESSIVE
  { name: 'Syne', value: '"Syne", sans-serif', category: 'Experimental / Expressive' },
  { name: 'Orbitron', value: '"Orbitron", sans-serif', category: 'Experimental / Expressive' },
  { name: 'Exo 2', value: '"Exo 2", sans-serif', category: 'Experimental / Expressive' },

  // MONOSPACE / TECHNICAL
  { name: 'IBM Plex Mono', value: '"IBM Plex Mono", monospace', category: 'Monospace / Technical' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace', category: 'Monospace / Technical' },
  { name: 'Space Mono', value: '"Space Mono", monospace', category: 'Monospace / Technical' },

  // HANDWRITTEN / HUMAN
  { name: 'Caveat', value: '"Caveat", cursive', category: 'Handwritten / Human' },
  { name: 'Kalam', value: '"Kalam", cursive', category: 'Handwritten / Human' },
  { name: 'Architects Daughter', value: '"Architects Daughter", cursive', category: 'Handwritten / Human' },
];
