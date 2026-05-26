import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface CircumplexProps {
  sentiment: number;
  engagement: number;
  onChange: (sentiment: number, engagement: number) => void;
  isMini?: boolean;
}

const EMOTIONS = [
  // High Sentiment / High Engagement
  { label: 'Elation', v: 0.74, a: 0.62 },
  { label: 'Excitement', v: 0.54, a: 0.78 },
  { label: 'Joy', v: 0.72, a: 0.49 },
  { label: 'Enthusiasm', v: 0.49, a: 0.72 },
  // High Sentiment / Low Engagement
  { label: 'Satisfaction', v: 0.48, a: -0.37 },
  { label: 'Contentment', v: 0.65, a: -0.43 },
  { label: 'Calm', v: 0.41, a: -0.75 },
  { label: 'Relaxation', v: 0.46, a: -0.81 },
  // Low Sentiment / Low Engagement
  { label: 'Fatigue', v: -0.46, a: -0.81 },
  { label: 'Depression', v: -0.78, a: -0.54 },
  { label: 'Sadness', v: -0.65, a: -0.43 },
  { label: 'Boredom', v: -0.45, a: -0.56 },
  // Low Sentiment / High Engagement
  { label: 'Stress', v: -0.46, a: 0.81 },
  { label: 'Anxiety', v: -0.58, a: 0.70 },
  { label: 'Anger', v: -0.78, a: 0.54 },
  { label: 'Fear', v: -0.62, a: 0.74 },
  // Neutral
  { label: 'Neutral', v: 0, a: 0 }
];

export function getClosestEmotion(v: number, a: number) {
  let closest = EMOTIONS[EMOTIONS.length - 1]; // Default to Neutral
  let minDistance = Infinity;

  for (const emotion of EMOTIONS) {
    const distance = Math.sqrt(Math.pow(emotion.v - v, 2) + Math.pow(emotion.a - a, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closest = emotion;
    }
  }

  return closest.label;
}

export function Circumplex({ sentiment, engagement, onChange, isMini = false }: CircumplexProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return;

    // Calculate normalized coordinates (-1 to 1)
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    
    // Convert to -1 to 1 (y is inverted because top is 0)
    let newSentiment = (x * 2) - 1;
    let newEngagement = 1 - (y * 2);

    // Clamp to unit circle
    const distance = Math.sqrt(newSentiment * newSentiment + newEngagement * newEngagement);
    if (distance > 1) {
      newSentiment = newSentiment / distance;
      newEngagement = newEngagement / distance;
    }

    // Prevent NaN
    if (!isNaN(newSentiment) && !isNaN(newEngagement)) {
      onChange(newSentiment, newEngagement);
    }
  }, [onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setShowTooltip(true);
    updatePosition(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Tooltip remains visible
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, updatePosition]);

  // Convert sentiment/engagement back to percentages for the dot position
  const dotX = ((sentiment + 1) / 2) * 100;
  const dotY = ((1 - engagement) / 2) * 100;
  
  const currentEmotion = getClosestEmotion(sentiment, engagement);

  if (isMini) {
    return (
      <div className="flex flex-col items-center w-full gap-2 max-w-[170px] select-none">
        {/* Sentiment & Engagement Status Panel (In Focus) */}
        <div className="flex justify-between items-center w-full bg-slate-50 border border-slate-100 p-1.5 rounded-xl text-[9px] font-mono shadow-sm shrink-0">
          <div className="flex flex-col items-center flex-1 border-r border-slate-200/60 pr-1">
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Sentiment</span>
            <span className={`text-[10px] font-extrabold leading-none ${sentiment >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {sentiment >= 0 ? '+' : ''}{sentiment.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col items-center flex-1 pl-1">
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Engagement</span>
            <span className={`text-[10px] font-extrabold leading-none ${engagement >= 0 ? 'text-indigo-600' : 'text-amber-500'}`}>
              {engagement >= 0 ? '+' : ''}{engagement.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Perfectly Centered Circle Graph (No side-rotated labels clashing with layout boundaries) */}
        <div className="relative w-full aspect-square shrink-0">
          <div 
            ref={containerRef}
            className="absolute inset-0 rounded-full border-2 border-slate-200 bg-slate-50 cursor-crosshair overflow-hidden shadow-inner touch-none"
            onPointerDown={handlePointerDown}
            style={{
              background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            {/* Axes */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-slate-300 -translate-x-1/2" />
            
            {/* Quadrant Colors (Subtle) */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-500/5 rounded-tr-full" />
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/5 rounded-tl-full" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 rounded-bl-full" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-green-500/5 rounded-br-full" />

            {/* In-Graph Axis Labels */}
            <span className="absolute left-1/2 -translate-x-1/2 text-slate-400 font-bold uppercase tracking-wider top-1 text-[8px]">High</span>
            <span className="absolute left-1/2 -translate-x-1/2 text-slate-400 font-bold uppercase tracking-wider bottom-1 text-[8px]">Low</span>
            <span className="absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase tracking-wider left-1.5 text-[8px]">Neg</span>
            <span className="absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase tracking-wider right-1.5 text-[8px]">Pos</span>
          </div>

          {/* Interactive Dot */}
          <motion.div 
            className="absolute bg-indigo-600 rounded-full shadow-md border-2 border-white pointer-events-none z-20 w-4 h-4"
            animate={{
              left: `${dotX}%`,
              top: `${dotY}%`,
            }}
            style={{
              translateX: '-50%',
              translateY: '-50%'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  key="tooltip"
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.9 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-slate-800 text-white text-[9px] font-semibold rounded shadow-lg whitespace-nowrap pointer-events-none z-30"
                >
                  {currentEmotion}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-4 max-w-[300px]">
      <div className="text-slate-700 flex justify-between items-center w-full text-sm font-medium">
        <Minus className="w-5 h-5 text-red-500" />
        <span className="relative left-[10px]">Sentiment</span>
        <Plus className="w-5 h-5 text-green-500" />
      </div>
      
      <div className="flex items-center gap-2 w-full">
        <div className="text-slate-700 -rotate-90 whitespace-nowrap flex flex-col justify-center h-full relative text-sm font-medium w-4 top-[26px]">
          Engagement
        </div>
        
        <div className="relative w-full aspect-square">
          <div 
            ref={containerRef}
            className="absolute inset-0 rounded-full border-2 border-slate-200 bg-slate-50 cursor-crosshair overflow-hidden shadow-inner touch-none"
            onPointerDown={handlePointerDown}
            style={{
              background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            {/* Axes */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-slate-300 -translate-x-1/2" />
            
            {/* Quadrant Colors (Subtle) */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-500/10 rounded-tr-full" />
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/10 rounded-tl-full" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/10 rounded-bl-full" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-green-500/10 rounded-br-full" />

            {/* Labels */}
            <span className="absolute left-1/2 -translate-x-1/2 text-slate-400 font-medium uppercase tracking-wider top-2 text-[10px]">High</span>
            <span className="absolute left-1/2 -translate-x-1/2 text-slate-400 font-medium uppercase tracking-wider bottom-2 text-[10px]">Low</span>
            <span className="absolute top-1/2 -translate-y-1/2 text-slate-400 font-medium uppercase tracking-wider left-2 text-[10px]">Neg</span>
            <span className="absolute top-1/2 -translate-y-1/2 text-slate-400 font-medium uppercase tracking-wider right-2 text-[10px]">Pos</span>
          </div>

          {/* Interactive Dot */}
          <motion.div 
            className="absolute bg-indigo-600 rounded-full shadow-md border-2 border-white pointer-events-none z-20 w-6 h-6"
            animate={{
              left: `${dotX}%`,
              top: `${dotY}%`,
            }}
            style={{
              translateX: '-50%',
              translateY: '-50%'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  key="tooltip"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs font-medium rounded shadow-lg whitespace-nowrap pointer-events-none"
                >
                  {currentEmotion}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-center gap-4 w-full text-slate-500 font-mono text-xs pl-8 gap-4">
        <div className="flex gap-1 bg-slate-100 px-2 py-0.5 rounded">
          <span className="font-semibold">S:</span>
          <span>{sentiment.toFixed(2)}</span>
        </div>
        <div className="flex gap-1 bg-slate-100 px-2 py-0.5 rounded">
          <span className="font-semibold">E:</span>
          <span>{engagement.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
