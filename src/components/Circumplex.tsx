import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

interface CircumplexProps {
  sentiment: number;
  engagement: number;
  onChange: (sentiment: number, engagement: number) => void;
}

const EMOTIONS = [
  // High Sentiment / High Engagement
  { label: 'Excitement', v: 0.54, a: 0.78 },
  { label: 'Joy', v: 0.72, a: 0.49 },
  { label: 'Elation', v: 0.74, a: 0.62 },
  { label: 'Enthusiasm', v: 0.49, a: 0.72 },
  // High Sentiment / Low Engagement
  { label: 'Contentment', v: 0.65, a: -0.43 },
  { label: 'Calm', v: 0.41, a: -0.75 },
  { label: 'Relaxation', v: 0.46, a: -0.81 },
  { label: 'Satisfaction', v: 0.48, a: -0.37 },
  // Low Sentiment / Low Engagement
  { label: 'Depression', v: -0.78, a: -0.54 },
  { label: 'Sadness', v: -0.65, a: -0.43 },
  { label: 'Fatigue', v: -0.46, a: -0.81 },
  { label: 'Boredom', v: -0.45, a: -0.56 },
  // Low Sentiment / High Engagement
  { label: 'Anxiety', v: -0.58, a: 0.70 },
  { label: 'Anger', v: -0.78, a: 0.54 },
  { label: 'Stress', v: -0.46, a: 0.81 },
  { label: 'Fear', v: -0.62, a: 0.74 },
  // Neutral
  { label: 'Neutral', v: 0, a: 0 }
];

function getClosestEmotion(v: number, a: number) {
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

export function Circumplex({ sentiment, engagement, onChange }: CircumplexProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
      setTimeout(() => setShowTooltip(false), 1500);
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

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[300px]">
      <div className="text-sm font-medium text-slate-700 flex justify-between items-center w-full">
        <Minus className="w-5 h-5 text-red-500" />
        <span className="relative left-[10px]">Sentiment</span>
        <Plus className="w-5 h-5 text-green-500" />
      </div>
      
      <div className="flex items-center gap-4 w-full">
        <div className="text-sm font-medium text-slate-700 -rotate-90 whitespace-nowrap w-4 flex flex-col justify-center h-full relative top-[26px]">
          Engagement
        </div>
        
        <div className="relative w-full aspect-square">
          <div 
            ref={containerRef}
            className="absolute inset-0 rounded-full border-2 border-slate-200 bg-slate-50 cursor-crosshair overflow-hidden shadow-inner touch-none"
            onPointerDown={handlePointerDown}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => !isDragging && setShowTooltip(false)}
            style={{
              background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            {/* Axes */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-300 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-px h-full bg-slate-300 -translate-x-1/2" />
            
            {/* Quadrant Colors (Subtle) */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-500/10 rounded-tr-full" /> {/* High Engagement, Positive Sentiment */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-purple-500/10 rounded-tl-full" /> {/* High Engagement, Negative Sentiment */}
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/10 rounded-bl-full" /> {/* Low Engagement, Negative Sentiment */}
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-green-500/10 rounded-br-full" /> {/* Low Engagement, Positive Sentiment */}

            {/* Labels */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">High</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Low</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Neg</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Pos</span>
          </div>

          {/* Interactive Dot */}
          <motion.div 
            className="absolute w-6 h-6 bg-indigo-600 rounded-full shadow-md border-2 border-white pointer-events-none z-20"
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

      <div className="flex justify-center gap-4 w-full text-xs text-slate-500 font-mono pl-8">
        <div className="flex gap-2 bg-slate-100 px-3 py-1 rounded">
          <span className="font-semibold">S:</span>
          <span>{sentiment.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 bg-slate-100 px-3 py-1 rounded">
          <span className="font-semibold">E:</span>
          <span>{engagement.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
