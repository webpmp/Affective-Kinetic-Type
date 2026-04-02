import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Maximize2, List } from 'lucide-react';
import { ChatMessage } from '../lib/gemini';
import { KineticWord } from './KineticWord';
import { motion, AnimatePresence } from 'motion/react';
import { getLuminance, hexToRgb, getContrastRatio } from '../lib/wcag';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  bgPrompt?: string | null;
  bgType?: 'image' | 'gradient';
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  viewMode: 'threaded' | 'focus';
  onViewModeChange: (mode: 'threaded' | 'focus') => void;
  conversationMode: boolean;
  messageInterval: number;
}

export function ChatArea({ 
  messages, 
  onSendMessage, 
  isTyping, 
  bgPrompt, 
  bgType = 'gradient',
  gradientColor1 = '#4f46e5',
  gradientColor2 = '#ec4899',
  gradientDirection = '135deg',
  viewMode, 
  onViewModeChange,
  conversationMode,
  messageInterval
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [showSystemThinking, setShowSystemThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'thinking' | 'settings' | 'accessibility'>('thinking');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  
  const latestAiMessageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const aiMessages = messages.filter(m => m.role === 'assistant');
  const userMessages = messages.filter(m => m.role === 'user');
  const latestAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;
  const segments = latestAiMessage?.segments && latestAiMessage.segments.length > 0 
    ? latestAiMessage.segments 
    : (latestAiMessage ? [latestAiMessage.content] : []);

  useEffect(() => {
    setCurrentSegmentIndex(0);
  }, [messages.length]);

  useEffect(() => {
    if (!conversationMode || isTyping || !latestAiMessage || segments.length <= 1) return;

    if (currentSegmentIndex < segments.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSegmentIndex(prev => prev + 1);
      }, messageInterval * 1000);
      return () => clearTimeout(timer);
    }
  }, [conversationMode, isTyping, latestAiMessage, currentSegmentIndex, messageInterval, segments.length]);

  const scrollToBottom = () => {
    if (viewMode === 'threaded') {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, viewMode]);

  useEffect(() => {
    if (isTyping) {
      setShowSystemThinking(false);
    } else {
      // If the AI message is completely empty (no words to animate), show thinking immediately
      const latestAiMessage = messages.filter(m => m.role === 'assistant').pop();
      if (latestAiMessage && latestAiMessage.content.trim() === '') {
        setShowSystemThinking(true);
      }
    }
  }, [isTyping, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Helper to split text and wrap emphasized words
  const renderMessageContent = (message: ChatMessage, isFocusMode: boolean = false, contentOverride?: string) => {
    if (message.role === 'user') {
      return <p className="text-slate-800">{message.content}</p>;
    }

    // Assistant message with kinetic typography
    const contentToRender = contentOverride || message.content;
    const words = contentToRender.split(/(\s+)/); // Split by whitespace but keep the spaces
    const emphasizedWords = message.emphasizedWords || [];
    
    let lastNonSpaceIndex = -1;
    for (let i = words.length - 1; i >= 0; i--) {
      if (!/^\s+$/.test(words[i])) {
        lastNonSpaceIndex = i;
        break;
      }
    }
    
    const msgFontFamily = message.fontFamily || '"Inter", sans-serif';
    let msgFontColor = message.fontColor || '#334155';
    let effectiveBgColor = '#ffffff'; // Default to white

    // 1. Determine base background luminance
    let avgLum = 1.0; // Default light
    if (bgType === 'gradient' || (bgType === 'image' && !bgPrompt)) {
      const rgb1 = hexToRgb(gradientColor1);
      const rgb2 = hexToRgb(gradientColor2);
      const avgR = Math.round((rgb1.r + rgb2.r) / 2);
      const avgG = Math.round((rgb1.g + rgb2.g) / 2);
      const avgB = Math.round((rgb1.b + rgb2.b) / 2);
      effectiveBgColor = '#' + [avgR, avgG, avgB].map(x => x.toString(16).padStart(2, '0')).join('');
      avgLum = getLuminance(avgR, avgG, avgB);
    } else if (bgType === 'image' && bgPrompt) {
      const textRgb = hexToRgb(msgFontColor);
      const isTextLight = getLuminance(textRgb.r, textRgb.g, textRgb.b) > 0.5;
      avgLum = isTextLight ? 0.1 : 0.9;
      effectiveBgColor = isTextLight ? '#0f172a' : '#ffffff';
    }

    // 2. Override based on Weather Effects (Foreground Priority & Color Separation)
    if (message.weatherEffect === 'eclipse') {
      avgLum = 0.1; // Eclipse is very dark
      effectiveBgColor = '#0f172a';
    } else if (message.weatherEffect === 'fog' || message.weatherEffect === 'clouds' || message.weatherEffect === 'snow') {
      avgLum = 0.9; // Fog, clouds, snow are light
      effectiveBgColor = '#ffffff';
    } else if (message.weatherEffect === 'sun') {
      avgLum = 0.9; // Sun is light
      effectiveBgColor = '#fffbeb'; // Light yellow
    } else if (message.weatherEffect === 'rain') {
      avgLum = Math.max(0, avgLum - 0.1); 
    }

    // 3. WCAG Contrast Enforcement
    let textRgb = hexToRgb(msgFontColor);
    let textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    
    let requiredRatio = 4.5;
    if (message.wcagLevel === 'A') requiredRatio = 3.0;
    if (message.wcagLevel === 'AAA') requiredRatio = 7.0;

    let brightest = Math.max(avgLum, textLum);
    let darkest = Math.min(avgLum, textLum);
    let ratio = (brightest + 0.05) / (darkest + 0.05);

    if (ratio < requiredRatio || message.weatherEffect === 'eclipse' || message.weatherEffect === 'fog' || message.weatherEffect === 'clouds' || message.weatherEffect === 'snow' || message.weatherEffect === 'sun') {
      msgFontColor = avgLum > 0.5 ? '#0f172a' : '#ffffff';
      textRgb = hexToRgb(msgFontColor);
      textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
      effectiveBgColor = textLum > 0.5 ? '#0f172a' : '#ffffff';
    }

    const msgFontSize = message.fontSize || 16;
    const msgSentiment = message.sentiment ?? 0;
    const msgEngagement = message.engagement ?? 0;
    const maxKeywords = message.maxAnimatedKeywords ?? 3;
    const allowedEmphasizedWords = (message.emphasizedWords || []).slice(0, maxKeywords);

    // Calculate timing based on engagement
    // Low engagement (<= 0): slightly slower (upper bounds)
    // High engagement (> 0): slightly faster (lower bounds)
    const normalizedEngagement = Math.max(-1, Math.min(1, msgEngagement));
    const speedFactor = (normalizedEngagement + 1) / 2; // 0 (slow) to 1 (fast)

    // Fade Duration: 180–260ms
    const baseDuration = 0.26 - (speedFactor * 0.08); // 0.26s to 0.18s
    
    // Word-Length Adjustment: +40–80ms
    const longWordBonus = 0.08 - (speedFactor * 0.04); // 0.08s to 0.04s
    
    // Punctuation Timing: Comma 150–250ms, Sentence end 250–400ms
    const punctuationPause = 0.25 - (speedFactor * 0.10); // 0.25s to 0.15s
    const sentencePause = 0.40 - (speedFactor * 0.15); // 0.40s to 0.25s

    let currentAccumulatedDelay = 0;

    return (
      <div className={`flex flex-col gap-3 ${isFocusMode ? 'items-center text-center h-full justify-center' : ''}`}>
        <motion.div 
          style={{ fontFamily: msgFontFamily, fontSize: `${msgFontSize}px`, color: msgFontColor }}
          className={`leading-relaxed whitespace-pre-wrap ${isFocusMode ? 'w-[90%] max-w-[90%] mx-auto' : ''}`}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1
            }
          }}
        >
          {words.map((word, index) => {
            // Clean punctuation for matching
            const cleanWord = word.replace(/[.,!?()[\]{}"']/g, '').toLowerCase().trim();
            
            // Check if this word is part of an emphasized phrase
            let matchedEmphasizedWord = null;
            if (cleanWord) {
               matchedEmphasizedWord = allowedEmphasizedWords.find(ew => {
                 const phraseWords = ew.word.toLowerCase().split(/\s+/);
                 return phraseWords.includes(cleanWord);
               });
            }

            const isSpace = /^\s+$/.test(word);

            if (isSpace) {
              return <span key={index}>{word}</span>;
            }

            // Calculate specific timing for this word
            let wordDuration = baseDuration;
            if (cleanWord.length > 6) {
              wordDuration += longWordBonus;
            }

            // Overlap Rule: Start next word at ~75% completion of the previous word's fade
            let step = wordDuration * 0.75; 

            if (/[.!?]/.test(word)) {
              step = wordDuration + sentencePause;
            } else if (/[,;:]/.test(word)) {
              step = wordDuration + punctuationPause;
            }

            const delayForThisWord = currentAccumulatedDelay;
            currentAccumulatedDelay += step;

            const content = matchedEmphasizedWord ? (
              <KineticWord 
                word={word} 
                sentiment={msgSentiment} 
                engagement={msgEngagement} 
                isEmphasized={true} 
                baseColor={msgFontColor}
                backgroundColor={effectiveBgColor}
                motionStyle={message.motionStyle}
                activeDecorations={message.activeDecorations || []}
                activeAnimations={message.activeAnimations}
                emotionInfluence={message.emotionInfluence}
                animationIntensity={message.animationIntensity}
                animationStability={message.animationStability}
                wcagLevel={message.wcagLevel}
                wcagStrictMode={message.wcagStrictMode}
              />
            ) : (
              <span>{word}</span>
            );

            return (
              <motion.span 
                key={index}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: {
                      duration: wordDuration,
                      delay: delayForThisWord,
                      ease: "easeOut"
                    }
                  }
                }}
                onAnimationComplete={() => {
                  if (index === lastNonSpaceIndex) {
                    setShowSystemThinking(true);
                  }
                }}
                className="inline-block"
              >
                {content}
              </motion.span>
            );
          })}
        </motion.div>
      </div>
    );
  };

  const aiMessagesToShow = viewMode === 'focus' ? aiMessages.slice(-1) : aiMessages;
  const userMessagesToShow = viewMode === 'focus' ? userMessages.slice(-1) : userMessages;
  
  let effectiveFontColor = latestAiMessage?.fontColor || '#ffffff';
  if (bgType === 'gradient' || (bgType === 'image' && !bgPrompt)) {
    const rgb1 = hexToRgb(gradientColor1);
    const rgb2 = hexToRgb(gradientColor2);
    const avgLum = (getLuminance(rgb1.r, rgb1.g, rgb1.b) + getLuminance(rgb2.r, rgb2.g, rgb2.b)) / 2;
    const textRgb = hexToRgb(effectiveFontColor);
    const textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    
    const brightest = Math.max(avgLum, textLum);
    const darkest = Math.min(avgLum, textLum);
    const ratio = (brightest + 0.05) / (darkest + 0.05);

    if (ratio < 4.5) {
      effectiveFontColor = avgLum > 0.5 ? '#0f172a' : '#ffffff';
    }
  }
  const effectiveRgb = hexToRgb(effectiveFontColor);
  const isTextLight = getLuminance(effectiveRgb.r, effectiveRgb.g, effectiveRgb.b) > 0.5;

  return (
    <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-0">
      
      {/* View Mode Toggle */}
      <button 
        onClick={() => onViewModeChange(viewMode === 'threaded' ? 'focus' : 'threaded')}
        className="absolute top-4 right-4 z-50 p-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-xl text-slate-700 shadow-sm border border-slate-200 transition-all"
        title={viewMode === 'threaded' ? "Switch to Focus Mode" : "Switch to Threaded Mode"}
      >
        {viewMode === 'threaded' ? <Maximize2 className="w-5 h-5" /> : <List className="w-5 h-5" />}
      </button>

      {/* AI Response Area (Top) */}
      <div className="relative p-6 z-10 flex flex-col justify-center items-center bg-slate-900 flex-1 min-h-[150px] max-h-[400px] overflow-hidden">
        <div 
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none ${bgType === 'gradient' || (bgType === 'image' && !bgPrompt) ? 'animate-gradient-bg' : ''}`}
          style={{
            backgroundImage: bgType === 'image' && bgPrompt 
              ? `url(https://image.pollinations.ai/prompt/${encodeURIComponent(bgPrompt)}?width=1920&height=1080&nologo=true)`
              : `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`,
            backgroundSize: bgType === 'image' && bgPrompt ? 'cover' : undefined,
            backgroundPosition: bgType === 'image' && bgPrompt ? 'center' : undefined,
            opacity: bgType === 'image' && bgPrompt ? 0.3 : 1,
            filter: bgType === 'image' && bgPrompt ? 'blur(4px)' : 'none',
            transform: bgType === 'image' && bgPrompt ? 'scale(1.05)' : 'none' // Prevent blurred edges from showing
          }}
        />
        {/* Dark/Light overlay for better text contrast - removed per user request */}
        <div className="absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 bg-transparent" />

        {/* Weather Effects */}
        <AnimatePresence>
          {!isTyping && latestAiMessage?.weatherEffect === 'rain' && (
            <motion.div 
              key="rain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="rain-container"
            >
              {Array.from({ length: 150 }).map((_, i) => (
                <div 
                  key={i} 
                  className="drop" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.5 + Math.random() * 0.5
                  }}
                />
              ))}
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherEffect === 'snow' && (
            <motion.div 
              key="snow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="snow-container"
            >
              {Array.from({ length: 75 }).map((_, i) => (
                <div 
                  key={i} 
                  className="snowflake bg-white rounded-full absolute" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    width: `${Math.random() * 6 + 3}px`,
                    height: `${Math.random() * 6 + 3}px`,
                    animation: `snowfall ${3 + Math.random() * 5}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: 0.5 + Math.random() * 0.5
                  }}
                />
              ))}
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherEffect === 'sun' && (
            <motion.div 
              key="sun"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="sun-container absolute inset-0 overflow-hidden pointer-events-none"
            >
              <motion.div 
                initial={{ left: '-10%', top: 'calc(30% + 25px)' }}
                animate={{ left: '50%', top: 'calc(10% + 25px)' }}
                transition={{ duration: 15, ease: "easeOut" }}
                className="absolute w-28 h-28 bg-yellow-400 rounded-full blur-xl animate-pulse" 
                style={{ translateX: '-50%', translateY: '-50%', animationDuration: '4s' }} 
              />
              <motion.div 
                initial={{ left: '-10%', top: 'calc(30% + 25px)' }}
                animate={{ left: '50%', top: 'calc(10% + 25px)' }}
                transition={{ duration: 15, ease: "easeOut" }}
                className="absolute w-14 h-14 bg-yellow-200 rounded-full shadow-[0_0_45px_rgba(253,224,71,0.8)]" 
                style={{ translateX: '-50%', translateY: '-50%' }} 
              />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherEffect === 'clouds' && (
            <motion.div 
              key="clouds"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="clouds-container absolute inset-0 overflow-hidden pointer-events-none"
            >
              <div className="absolute top-10 left-10 w-64 h-24 bg-white rounded-full blur-md animate-cloud-move-1" />
              <div className="absolute top-20 right-20 w-80 h-32 bg-white rounded-full blur-md animate-cloud-move-2" />
              <div className="absolute top-40 left-1/3 w-72 h-28 bg-white rounded-full blur-md animate-cloud-move-3" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherEffect === 'fog' && (
            <motion.div 
              key="fog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="fog-container"
            >
              <div className="fog-layer" />
              <div className="fog-layer-2" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherEffect === 'eclipse' && (
            <motion.div 
              key="eclipse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="eclipse-container"
            >
              <div className="eclipse-sun" />
              <div className="eclipse-moon" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative z-10 flex flex-col h-full justify-center w-full">
          <AnimatePresence mode="wait">
            {!isTyping && latestAiMessage ? (
              <motion.div
                key={`ai-${aiMessages.length - 1}-${currentSegmentIndex}`}
                ref={latestAiMessageRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="flex justify-center w-full h-full items-center absolute inset-0"
              >
                <div className="w-full p-8 flex flex-col justify-center items-center text-center transition-all duration-700 bg-transparent">
                  {renderMessageContent(latestAiMessage, true, segments[currentSegmentIndex])}
                </div>
              </motion.div>
            ) : isTyping ? (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center w-full absolute bottom-6 left-0 right-0"
              >
                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10 shadow-sm flex items-center gap-2 mx-auto">
                  <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                  <span className="text-sm text-slate-200 font-medium">Analyzing emotional context...</span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Manual Navigation Controls (Bottom of Response Window) */}
          {!isTyping && latestAiMessage && !conversationMode && segments.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 justify-center pb-0 z-20">
              <button
                onClick={() => setCurrentSegmentIndex(Math.max(0, currentSegmentIndex - 1))}
                disabled={currentSegmentIndex === 0}
                className={`p-2 rounded-full transition-colors backdrop-blur-sm border disabled:opacity-30 disabled:cursor-not-allowed ${
                  isTextLight 
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                    : 'bg-black/5 hover:bg-black/10 text-slate-800 border-black/10'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <span className={`text-xs font-mono ${isTextLight ? 'text-white/70' : 'text-slate-500'}`}>
                {currentSegmentIndex + 1} / {segments.length}
              </span>
              <button
                onClick={() => setCurrentSegmentIndex(Math.min(segments.length - 1, currentSegmentIndex + 1))}
                disabled={currentSegmentIndex === segments.length - 1}
                className={`p-2 rounded-full transition-colors backdrop-blur-sm border disabled:opacity-30 disabled:cursor-not-allowed ${
                  isTextLight 
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                    : 'bg-black/5 hover:bg-black/10 text-slate-800 border-black/10'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* System Thinking Area (Middle) */}
      <AnimatePresence>
        {latestAiMessage?.thinking && showSystemThinking && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 border-t border-b border-slate-700 p-4 shrink-0 z-10 w-full"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex space-x-2 border-b border-slate-700 mb-3">
                <button
                  onClick={() => setActiveTab('thinking')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'thinking' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  System Thinking
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  Kinetic Type Settings
                </button>
                <button
                  onClick={() => setActiveTab('accessibility')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors ${activeTab === 'accessibility' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  Accessibility Adjustments
                </button>
              </div>
              
              <div className="text-xs text-slate-300 leading-relaxed h-[160px] overflow-y-auto">
                {activeTab === 'thinking' && (
                  <div className="italic pl-3 border-l-2 border-white/20">{latestAiMessage.thinking}</div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono space-y-1.5 text-slate-300">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div><span className="text-slate-400">Sentiment:</span> {(latestAiMessage.sentiment ?? 0).toFixed(2)}</div>
                      <div className="truncate" title={latestAiMessage.fontFamily}><span className="text-slate-400">Font:</span> {(latestAiMessage.fontFamily || '"Inter"').replace(/"/g, '').split(',')[0]}</div>
                      <div><span className="text-slate-400">Engagement:</span> {(latestAiMessage.engagement ?? 0).toFixed(2)}</div>
                      <div><span className="text-slate-400">Size:</span> {latestAiMessage.fontSize || 16}px</div>
                      <div><span className="text-slate-400">Sex:</span> {latestAiMessage.sex || 'Neutral'}</div>
                      <div className="truncate" title={latestAiMessage.motionStyle || 'default'}><span className="text-slate-400">Motion:</span> {latestAiMessage.motionStyle || 'default'}</div>
                      <div><span className="text-slate-400">Age:</span> {latestAiMessage.age || 30}</div>
                      <div><span className="text-slate-400">Accessibility:</span> {latestAiMessage.wcagLevel || 'AA'} {latestAiMessage.wcagStrictMode ? '(Strict)' : ''}</div>
                      <div><span className="text-slate-400">Conv. Mode:</span> {conversationMode ? 'On' : 'Off'}</div>
                      <div><span className="text-slate-400">Interval:</span> {messageInterval}s</div>
                    </div>
                  </div>
                )}

                {activeTab === 'accessibility' && (
                  <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono space-y-1.5 text-slate-300">
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li><span className="text-slate-400">Contrast:</span> Enforced {latestAiMessage.wcagLevel || 'AA'} compliance (minimum ratio {latestAiMessage.wcagLevel === 'AAA' ? '7.0:1' : latestAiMessage.wcagLevel === 'A' ? '3.0:1' : '4.5:1'}).</li>
                      <li><span className="text-slate-400">Text Size:</span> Base size {latestAiMessage.fontSize || 16}px.</li>
                      <li><span className="text-slate-400">Animation:</span> Motion '{latestAiMessage.motionStyle || 'default'}' applied. {latestAiMessage.wcagStrictMode ? 'Strict mode active: rapid flashing and excessive movement disabled.' : 'Standard motion limits applied.'}</li>
                      <li><span className="text-slate-400">Decoration:</span> Visual effects filtered to maintain legibility and prevent visual noise.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Input Area (Bottom) */}
      <div className="border-t border-slate-200 bg-slate-50 flex flex-col z-10 flex-1 min-h-0">
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <AnimatePresence initial={false}>
            {userMessagesToShow.map((msg, idx) => (
              <motion.div
                key={`user-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] bg-indigo-50 text-indigo-900 rounded-2xl rounded-br-sm px-5 py-3 border border-indigo-200 shadow-sm">
                  {renderMessageContent(msg, false)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Input Form */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
