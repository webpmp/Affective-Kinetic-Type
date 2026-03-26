export interface TextAnimation {
  id: string;
  name: string;
  sentiment: number;
  engagement: number;
}

export const ANIMATION_POOL: TextAnimation[] = [
  // Q1: Positive, High Engagement
  { id: 'bounce', name: 'Bounce', sentiment: 0.6, engagement: 0.8 },
  { id: 'spin', name: 'Spin', sentiment: 0.5, engagement: 0.7 },
  { id: '3d-spin', name: '3D Spin', sentiment: 0.6, engagement: 0.9 },
  { id: 'jump', name: 'Jump', sentiment: 0.8, engagement: 0.9 },
  { id: 'pop', name: 'Pop', sentiment: 0.7, engagement: 0.6 },
  { id: 'flip', name: 'Flip', sentiment: 0.4, engagement: 0.8 },
  { id: 'jiggle', name: 'Jiggle', sentiment: 0.3, engagement: 0.5 },
  { id: 'sparkle', name: 'Sparkle', sentiment: 0.9, engagement: 0.4 },
  { id: 'zoom-bounce', name: 'Zoom Bounce', sentiment: 0.7, engagement: 0.7 },
  { id: 'wobble', name: 'Wobble', sentiment: 0.4, engagement: 0.6 },
  
  // Q2: Negative, High Engagement
  { id: 'shake', name: 'Shake', sentiment: -0.6, engagement: 0.8 },
  { id: 'pulse', name: 'Pulse', sentiment: -0.4, engagement: 0.6 },
  { id: 'shiver', name: 'Shiver', sentiment: -0.7, engagement: 0.7 },
  { id: 'glitch', name: 'Glitch', sentiment: -0.9, engagement: 0.9 },
  { id: 'tremble', name: 'Tremble', sentiment: -0.5, engagement: 0.5 },
  { id: 'slam', name: 'Slam', sentiment: -0.8, engagement: 0.8 },
  { id: 'vibrate', name: 'Vibrate', sentiment: -0.3, engagement: 0.9 },
  { id: 'flash', name: 'Flash', sentiment: -0.5, engagement: 0.7 },
  { id: 'jerk', name: 'Jerk', sentiment: -0.6, engagement: 0.6 },
  
  // Q3: Negative, Low Engagement
  { id: 'sink', name: 'Sink', sentiment: -0.6, engagement: -0.6 },
  { id: 'fade', name: 'Fade', sentiment: -0.4, engagement: -0.8 },
  { id: 'droop', name: 'Droop', sentiment: -0.7, engagement: -0.5 },
  { id: 'melt', name: 'Melt', sentiment: -0.8, engagement: -0.4 },
  { id: 'sigh', name: 'Sigh', sentiment: -0.3, engagement: -0.6 },
  { id: 'blur', name: 'Blur', sentiment: -0.5, engagement: -0.7 },
  { id: 'drift-down', name: 'Drift Down', sentiment: -0.4, engagement: -0.5 },
  { id: 'dissolve', name: 'Dissolve', sentiment: -0.7, engagement: -0.8 },
  { id: 'shrink', name: 'Shrink', sentiment: -0.6, engagement: -0.4 },
  
  // Q4: Positive, Low Engagement
  { id: 'wave', name: 'Wave', sentiment: 0.6, engagement: -0.5 },
  { id: 'float', name: 'Float', sentiment: 0.5, engagement: -0.7 },
  { id: 'breathe', name: 'Breathe', sentiment: 0.8, engagement: -0.8 },
  { id: 'sway', name: 'Sway', sentiment: 0.4, engagement: -0.6 },
  { id: 'glide', name: 'Glide', sentiment: 0.7, engagement: -0.4 },
  { id: 'drift-up', name: 'Drift Up', sentiment: 0.5, engagement: -0.5 },
  { id: 'shimmer', name: 'Shimmer', sentiment: 0.9, engagement: -0.3 },
  { id: 'zoom', name: 'Zoom', sentiment: 0.3, engagement: -0.4 },
  { id: 'expand', name: 'Expand', sentiment: 0.6, engagement: -0.6 },
];
