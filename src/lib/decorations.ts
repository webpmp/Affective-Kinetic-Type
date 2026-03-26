import React from 'react';

export interface TextDecoration {
  id: string;
  name: string;
  style: React.CSSProperties;
  sentiment: number;
  engagement: number;
}

export const DECORATION_POOL: TextDecoration[] = [
  { id: 'ts-soft-gray', name: 'Soft Gray Shadow', style: { textShadow: '1px 1px 2px rgba(100,116,139,0.5)' }, sentiment: 0, engagement: -0.2 },
  { id: 'ts-vibrant-yellow', name: 'Vibrant Yellow Glow', style: { textShadow: '0 0 6px rgba(250,204,21,0.6)' }, sentiment: 0.4, engagement: 0.6 },
  { id: 'ul-dashed', name: 'Dashed Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dashed', textUnderlineOffset: '4px' }, sentiment: -0.2, engagement: 0.3 },
  { id: 'ul-dotted', name: 'Dotted Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '4px' }, sentiment: 0.2, engagement: -0.4 },
  { id: 'ul-double', name: 'Double Underline', style: { textDecoration: 'underline', textDecorationStyle: 'double', textUnderlineOffset: '4px' }, sentiment: 0.6, engagement: 0.4 },
  { id: 'fw-black', name: 'Extra Bold', style: { fontWeight: 900 }, sentiment: 0.1, engagement: 0.7 },
  { id: 'ts-hard-red', name: 'Hard Red Shadow', style: { textShadow: '2px 2px 0px #fca5a5' }, sentiment: -0.3, engagement: 0.9 },
  { id: 'ol-solid', name: 'Overline', style: { textDecoration: 'overline' }, sentiment: -0.4, engagement: -0.3 },
  { id: 'lt-solid', name: 'Strike-through', style: { textDecoration: 'line-through' }, sentiment: -0.7, engagement: -0.1 },
  { id: 'lt-wavy', name: 'Wavy Strike', style: { textDecoration: 'line-through', textDecorationStyle: 'wavy' }, sentiment: -0.8, engagement: 0.7 },
  { id: 'ts-indigo-soft', name: 'Soft Indigo Shadow', style: { textShadow: '1px 1px 3px rgba(55,48,163,0.4)' }, sentiment: 0, engagement: 0.5 },
  { id: 'ts-red-soft', name: 'Soft Red Shadow', style: { textShadow: '1px 1px 3px rgba(153,27,27,0.4)' }, sentiment: -0.6, engagement: 0.8 },
  { id: 'ts-green-soft', name: 'Soft Green Shadow', style: { textShadow: '1px 1px 3px rgba(22,101,52,0.4)' }, sentiment: 0.7, engagement: 0.7 },
  { id: 'ul-blue-dashed', name: 'Blue Dashed Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dashed', textDecorationColor: '#3b82f6', textUnderlineOffset: '4px' }, sentiment: 0.3, engagement: -0.5 },
  { id: 'ul-yellow-dotted', name: 'Yellow Dotted Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationColor: '#eab308', textUnderlineOffset: '4px' }, sentiment: 0.5, engagement: 0.2 },
  { id: 'ul-purple-double', name: 'Purple Double Underline', style: { textDecoration: 'underline', textDecorationStyle: 'double', textDecorationColor: '#a855f7', textUnderlineOffset: '4px' }, sentiment: 0.6, engagement: 0.5 },
  { id: 'ts-orange-bright', name: 'Bright Orange Shadow', style: { textShadow: '1px 1px 4px rgba(194,65,12,0.5)' }, sentiment: 0.4, engagement: 0.8 },
  { id: 'ts-pink-glow', name: 'Pink Glow', style: { textShadow: '0 0 4px #f472b6' }, sentiment: 0.8, engagement: 0.6 },
  { id: 'lt-gray', name: 'Gray Strike', style: { textDecoration: 'line-through', textDecorationColor: '#94a3b8' }, sentiment: -0.3, engagement: -0.7 },
  { id: 'ol-thick-black', name: 'Black Thick Over', style: { textDecoration: 'overline', textDecorationThickness: '4px', textDecorationColor: '#0f172a' }, sentiment: -0.6, engagement: 0.6 },
  { id: 'ts-glow', name: 'Glow Shadow', style: { textShadow: '0 0 4px rgba(250,204,21,0.6)' }, sentiment: 0.9, engagement: 0.7 },
  { id: 'ts-sharp', name: 'Sharp Shadow', style: { textShadow: '1px 1px 0px rgba(220,38,38,0.8)' }, sentiment: -0.7, engagement: 0.9 },
  { id: 'ts-soft', name: 'Soft Shadow', style: { textShadow: '1px 1px 2px rgba(148,163,184,0.5)' }, sentiment: 0.4, engagement: -0.6 },
  { id: 'ls-wide', name: 'Wide Spacing', style: { letterSpacing: '0.05em' }, sentiment: 0.5, engagement: -0.5 },
  { id: 'ls-tight', name: 'Tight Spacing', style: { letterSpacing: '0em' }, sentiment: -0.5, engagement: 0.7 },
  { id: 'fs-italic', name: 'Italic', style: { fontStyle: 'italic' }, sentiment: 0.2, engagement: 0.1 },
  { id: 'fw-bold-italic', name: 'Bold Italic', style: { fontWeight: 'bold', fontStyle: 'italic' }, sentiment: 0.4, engagement: 0.5 },
  { id: 'ls-widest', name: 'Widest Spacing', style: { letterSpacing: '0.1em' }, sentiment: 0.3, engagement: -0.3 },
  { id: 'ls-tighter', name: 'Tighter Spacing', style: { letterSpacing: '0em' }, sentiment: -0.3, engagement: 0.5 },
  { id: 'ol-dashed', name: 'Dashed Overline', style: { textDecoration: 'overline', textDecorationStyle: 'dashed' }, sentiment: -0.4, engagement: 0.2 },
  { id: 'ol-dotted', name: 'Dotted Overline', style: { textDecoration: 'overline', textDecorationStyle: 'dotted' }, sentiment: 0.1, engagement: -0.6 },
  { id: 'ol-wavy', name: 'Wavy Overline', style: { textDecoration: 'overline', textDecorationStyle: 'wavy' }, sentiment: 0.2, engagement: 0.6 },
  { id: 'ol-double', name: 'Double Overline', style: { textDecoration: 'overline', textDecorationStyle: 'double' }, sentiment: 0.5, engagement: 0.3 },
  { id: 'lt-red', name: 'Red Strike', style: { textDecoration: 'line-through', textDecorationColor: '#ef4444' }, sentiment: -0.8, engagement: 0.4 },
  { id: 'lt-green', name: 'Green Strike', style: { textDecoration: 'line-through', textDecorationColor: '#22c55e' }, sentiment: 0.3, engagement: -0.3 },
  { id: 'lt-blue', name: 'Blue Strike', style: { textDecoration: 'line-through', textDecorationColor: '#3b82f6' }, sentiment: -0.1, engagement: -0.5 },
  { id: 'ul-thick-dashed', name: 'Thick Dashed Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dashed', textDecorationThickness: '2px', textUnderlineOffset: '4px' }, sentiment: -0.4, engagement: 0.6 },
  { id: 'ul-thick-dotted', name: 'Thick Dotted Underline', style: { textDecoration: 'underline', textDecorationStyle: 'dotted', textDecorationThickness: '2px', textUnderlineOffset: '4px' }, sentiment: -0.2, engagement: 0.4 },
  { id: 'ts-highlight', name: 'Highlight Shadow', style: { textShadow: '0 0 8px rgba(250,204,21,0.5)' }, sentiment: 0.7, engagement: 0.4 },
  { id: 'ts-dark', name: 'Dark Shadow', style: { textShadow: '1px 1px 3px rgba(15,23,42,0.8)' }, sentiment: -0.7, engagement: -0.4 },
];
