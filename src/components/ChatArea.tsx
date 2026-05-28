import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, History, X } from "lucide-react";
import { ChatMessage, TextSegment, ContextualEffect } from "../lib/gemini";
import { KineticWord } from "./KineticWord";
import { FONTS } from "../lib/fonts";
import { motion, AnimatePresence } from "motion/react";
import { getLuminance, hexToRgb, getContrastRatio } from "../lib/wcag";

interface ContextualEffectOverlayProps {
  effect: ContextualEffect;
  wcagStrictMode: boolean;
  isTextLight: boolean;
  backgroundOpacityScalar: number;
}

export function ContextualEffectOverlay({
  effect,
  wcagStrictMode,
  isTextLight,
  backgroundOpacityScalar,
}: ContextualEffectOverlayProps) {
  const { type, subject, imageUrl, animation, placement } = effect;

  const getBallEmoji = (sub: string) => {
    const s = sub.toLowerCase();
    if (s.includes("soccer") || (s.includes("football") && !s.includes("american"))) return "⚽";
    if (s.includes("tennis")) return "🎾";
    if (s.includes("basketball")) return "🏀";
    if (s.includes("baseball")) return "⚾";
    if (s.includes("golf")) return "⛳";
    if (s.includes("volleyball")) return "🏐";
    if (s.includes("american football") || s.includes("rugby")) return "🏈";
    return null;
  };

  const ballEmoji = getBallEmoji(subject);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. Ball Rolls and Stops 2/3 of the way across the screen behind the text */}
      {animation === "roll" && ballEmoji && (
        <motion.div
          key={`roll-${subject}`}
          initial={{ left: "-10%", top: "78%", rotate: 0, opacity: 0.8 }}
          animate={{
            left: "66%",
            rotate: 720,
            opacity: [0.8, 0.8, wcagStrictMode ? 0.08 : 0.15]
          }}
          transition={{
            duration: 4.5,
            ease: "easeOut",
            times: [0, 0.82, 1], // Stays opaque while rolling, then fades to ultra-low watermark at rest
            delay: 0.5
          }}
          style={{ transformOrigin: "center" }}
          className="absolute text-8xl drop-shadow-sm filter select-none z-0"
        >
          {ballEmoji}
        </motion.div>
      )}
      {/* 2. Watermarks and Badges have been removed to focus entirely on the animated rolling balls */}
    </div>
  );
}

interface GenerationAmbientLayerProps {
  userMessageContent: string;
  sentiment: number;
  engagement: number;
  wcagStrictMode: boolean;
}

export function GenerationAmbientLayer({
  userMessageContent,
  sentiment,
  engagement,
  wcagStrictMode,
}: GenerationAmbientLayerProps) {
  const content = userMessageContent.toLowerCase();

  const getDetectedSport = (): string | null => {
    const hasWord = (...words: string[]) => 
      words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(content));

    if (hasWord("tennis") && !hasWord("table")) return "tennis";
    if (hasWord("table tennis", "ping pong")) return "table_tennis";
    if (hasWord("basketball")) return "basketball";
    if (hasWord("golf")) return "golf";
    if (hasWord("american football", "nfl") || (hasWord("football") && !hasWord("soccer"))) return "football";
    if (hasWord("baseball")) return "baseball";
    if (hasWord("soccer")) return "soccer";
    if (hasWord("hockey", "puck", "pucks")) return "hockey";
    if (hasWord("volleyball")) return "volleyball";
    if (hasWord("bowling")) return "bowling";
    if (hasWord("billiard", "billiards", "pool", "cue ball")) return "billiards";
    if (hasWord("running", "run", "runner", "runners", "sprint", "jogging", "jog")) return "running";
    if (hasWord("cycling", "bike", "bicycle", "bikes", "bicycles")) return "cycling";
    if (hasWord("skateboard", "skateboarding")) return "skateboarding";
    if (hasWord("surf", "surfing", "wave", "waves")) return "surfing";
    if (hasWord("swimming", "swim", "ripple", "ripples")) return "swimming";
    if (hasWord("boxing", "punch", "glove", "gloves")) return "boxing";
    if (hasWord("archery", "arrow", "arrows")) return "archery";
    if (hasWord("racing", "race", "f1", "nascar")) return "racing";
    if (hasWord("sailing", "sailboat", "boat", "boats")) return "sailing";
    return null;
  };

  const sport = getDetectedSport();
  if (!sport) return null;

  const isAnalysis =
    content.includes("analysis") ||
    content.includes("strategy") ||
    content.includes("tactic") ||
    content.includes("formation") ||
    content.includes("route") ||
    content.includes("stats") ||
    content.includes("statistics") ||
    content.includes("playbook") ||
    content.includes("diagram") ||
    content.includes("coaching") ||
    content.includes("breakdown");

  const durationMultiplier = engagement <= 0 ? 1.6 : 0.75;
  const isNegative = sentiment < 0;

  const getBallEmoji = (s: string) => {
    if (s === "soccer") return "⚽";
    if (s === "tennis") return "🎾";
    if (s === "basketball") return "🏀";
    if (s === "baseball") return "⚾";
    if (s === "golf") return "⛳";
    if (s === "volleyball") return "🏐";
    if (s === "football") return "🏈";
    if (s === "bowling") return "🎳";
    if (s === "hockey") return "🏒";
    if (s === "table_tennis") return "🏓";
    if (s === "billiards") return "🎱";
    if (s === "boxing") return "🥊";
    if (s === "archery") return "🏹";
    if (s === "sailing") return "⛵";
    if (s === "cycling") return "🚲";
    if (s === "skateboarding") return "🛹";
    return null;
  };

  const ballEmoji = getBallEmoji(sport);
  const baseDuration = 4.5 * durationMultiplier;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: wcagStrictMode ? 0.05 : 0.12 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-transparent"
    >
      {isAnalysis ? (
        // Tactical Sports Visualizations (Strategy diagrams drawing themselves)
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          {sport === "basketball" && (
            <svg viewBox="0 0 400 300" className="w-4/5 h-4/5 text-emerald-500/20 stroke-current fill-none stroke-2">
              {/* Half Court Grid */}
              <rect x="10" y="10" width="380" height="280" rx="4" strokeWidth="1" className="text-slate-700/20" />
              <path d="M 10 150 L 390 150" strokeWidth="1" className="text-slate-700/20" />
              <circle cx="200" cy="150" r="40" strokeWidth="1" className="text-slate-700/20" />
              <path d="M 150 10 H 250 V 90 H 150 Z" strokeWidth="1" className="text-slate-700/20" />
              <circle cx="200" cy="90" r="30" strokeWidth="1" className="text-slate-700/20" />
              {/* Animated Shot Arc */}
              <motion.path
                d={isNegative ? "M 80 250 Q 150 120 180 180 T 200 90" : "M 80 240 Q 200 60 320 240"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                strokeWidth="3"
                className="text-indigo-500/40"
                strokeDasharray="6,4"
              />
              {/* Rest Spot / Release Guide */}
              <motion.circle
                cx="80"
                cy={isNegative ? 250 : 240}
                r="6"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: baseDuration - 1 }}
                className="fill-indigo-500/30 stroke-indigo-400/40"
              />
            </svg>
          )}

          {sport === "football" && (
            <svg viewBox="0 0 400 300" className="w-4/5 h-4/5 text-amber-500/20 stroke-current fill-none stroke-2">
              {/* Tactical Yard Lines Grid */}
              <line x1="20" y1="50" x2="380" y2="50" strokeWidth="1" className="text-slate-700/10" />
              <line x1="20" y1="100" x2="380" y2="100" strokeWidth="1" className="text-slate-700/10" />
              <line x1="20" y1="150" x2="380" y2="150" strokeWidth="1" className="text-slate-700/10" />
              <line x1="20" y1="200" x2="380" y2="200" strokeWidth="1" className="text-slate-700/10" />
              <line x1="20" y1="250" x2="380" y2="250" strokeWidth="1" className="text-slate-700/10" />
              {/* Route line drawing itself with receiver cut */}
              <motion.path
                d={isNegative ? "M 50 250 L 50 120 L 90 140 L 150 90" : "M 200 270 L 200 150 L 320 80"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                strokeWidth="3.5"
                className="text-amber-500/40"
              />
            </svg>
          )}

          {sport === "soccer" && (
            <svg viewBox="0 0 400 300" className="w-4/5 h-4/5 text-emerald-500/20 stroke-current fill-none stroke-2">
              {/* Center Circle & Penalty Box outline */}
              <circle cx="200" cy="150" r="50" strokeWidth="1" className="text-slate-700/20" />
              <rect x="80" y="10" width="240" height="80" strokeWidth="1" className="text-slate-700/20" />
              {/* Formation markers repositioning themselves */}
              <motion.circle
                cx={isNegative ? 120 : 150}
                cy={isNegative ? 180 : 130}
                r="10"
                animate={isNegative ? { cx: [120, 90, 120], cy: [180, 140, 180] } : { cx: [150, 180, 150], cy: [130, 90, 130] }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                className="fill-emerald-500/15 stroke-emerald-400/30"
              />
              <motion.circle
                cx={isNegative ? 280 : 250}
                cy={isNegative ? 180 : 130}
                r="10"
                animate={isNegative ? { cx: [280, 310, 280], cy: [180, 140, 180] } : { cx: [250, 220, 250], cy: [130, 90, 130] }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                className="fill-emerald-500/15 stroke-emerald-400/30"
              />
            </svg>
          )}

          {sport === "golf" && (
            <svg viewBox="0 0 400 300" className="w-4/5 h-4/5 text-emerald-400/20 stroke-current fill-none stroke-2">
              {/* Contour waves representing the putting green contour map */}
              <path d="M 20 80 Q 200 40 380 80" strokeWidth="1" className="text-emerald-800/10" />
              <path d="M 20 150 Q 200 110 380 150" strokeWidth="1" className="text-emerald-800/10" />
              {/* Putting trajectory guide drawing itself */}
              <motion.path
                d={isNegative ? "M 100 240 C 130 180, 220 220, 280 120" : "M 80 250 Q 200 180 300 110"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                strokeWidth="2.5"
                className="text-emerald-500/40"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {sport === "racing" && (
            <svg viewBox="0 0 400 300" className="w-4/5 h-4/5 text-red-500/20 stroke-current fill-none stroke-2">
              {/* S-curve racing line tracing */}
              <motion.path
                d={isNegative ? "M 50 50 C 150 50, 100 250, 350 250" : "M 50 250 Q 200 100 350 250"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
                strokeWidth="3.5"
                className={isNegative ? "text-rose-500/40" : "text-emerald-500/40"}
              />
            </svg>
          )}
        </div>
      ) : (
        // Ambient Physical Object Animations (1-3 objects floating elegantly behind text)
        <div className="absolute inset-0 bg-transparent">
          {/* Volleyball Float */}
          {sport === "volleyball" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "85%", scale: 0.9, rotate: 0 }}
              animate={{
                left: "110%",
                top: ["85%", "25%", "85%"],
                rotate: 360,
              }}
              transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Basketball Parabolic Arc */}
          {sport === "basketball" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "80%", scale: 1.0, rotate: 0 }}
              animate={{
                left: "110%",
                top: ["80%", "20%", "80%"],
                rotate: 360,
              }}
              transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-6xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Soccer Zigzag Dribbling */}
          {sport === "soccer" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "85%", rotate: 0 }}
              animate={{
                left: ["-10%", "25%", "55%", "85%", "110%"],
                top: isNegative
                  ? ["85%", "65%", "88%", "60%", "85%"] // Erratic tense dribble
                  : ["85%", "78%", "85%", "78%", "85%"], // Smooth rounded flow
                rotate: 1440,
              }}
              transition={{ duration: baseDuration, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Tennis Ball Diagonal Bounce */}
          {sport === "tennis" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "85%", rotate: 0 }}
              animate={{
                left: "110%",
                top: isNegative
                  ? ["85%", "40%", "75%", "35%", "85%"] // Sharp rebounds
                  : ["85%", "35%", "70%", "30%"], // Smooth rounded bounce
                rotate: 1080,
              }}
              transition={{ duration: baseDuration - 0.5, ease: "linear", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Golf Ball Putt */}
          {sport === "golf" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "88%", rotate: 0 }}
              animate={{
                left: "110%",
                rotate: 360,
              }}
              transition={{ duration: baseDuration + 2.5, ease: "easeOut", repeat: Infinity }}
              className="absolute text-4xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* American Football Spiral Pass */}
          {sport === "football" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "80%", rotate: 0 }}
              animate={{
                left: "110%",
                top: ["80%", "32%", "80%"],
                rotate: 720,
              }}
              transition={{ duration: baseDuration - 0.5, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-6xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Baseball Curveball Path */}
          {sport === "baseball" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "65%", rotate: 0 }}
              animate={{
                left: "110%",
                top: isNegative ? ["65%", "40%", "90%"] : ["65%", "55%", "80%"],
                rotate: 1080,
              }}
              transition={{ duration: baseDuration - 1.0, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Hockey Puck Slide & Rebound */}
          {sport === "hockey" && ballEmoji && (
            <motion.div
              initial={{ left: "-10%", top: "92%" }}
              animate={{
                left: isNegative ? ["-10%", "100%", "70%", "100%", "-10%"] : ["-10%", "100%", "85%"],
                top: "92%",
              }}
              transition={{ duration: baseDuration - 1.5, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-4xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Table Tennis Rally */}
          {sport === "table_tennis" && ballEmoji && (
            <motion.div
              initial={{ left: "20%", top: "75%", scale: 1 }}
              animate={{
                left: ["20%", "50%", "80%", "50%", "20%"],
                top: ["75%", "40%", "75%", "45%", "75%"],
                scale: [1, 0.8, 1, 0.85, 1],
              }}
              transition={{ duration: baseDuration - 2.0, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Billiards soft boundary ricochet */}
          {sport === "billiards" && ballEmoji && (
            <motion.div
              initial={{ left: "10%", top: "20%" }}
              animate={{
                left: ["10%", "90%", "65%", "10%"],
                top: ["20%", "75%", "12%", "20%"],
              }}
              transition={{ duration: baseDuration + 1, ease: "linear", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Running Footprints Silhouette Steps */}
          {sport === "running" && (
            <div className="absolute bottom-6 left-0 right-0 h-10 flex justify-around">
              {Array.from({ length: 4 }).map((_, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: idx * 0.6,
                  }}
                  className="text-4xl select-none filter grayscale opacity-20"
                >
                  👣
                </motion.span>
              ))}
            </div>
          )}

          {/* Cycling wheel crossing */}
          {sport === "cycling" && ballEmoji && (
            <motion.div
              initial={{ left: "-15%", top: "85%", rotate: 0 }}
              animate={{
                left: "115%",
                rotate: 1440,
              }}
              transition={{ duration: baseDuration + 1.5, ease: "linear", repeat: Infinity }}
              className="absolute text-6xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Skateboarding rolling and kickflip */}
          {sport === "skateboarding" && ballEmoji && (
            <motion.div
              initial={{ left: "-15%", top: "88%", rotate: 0 }}
              animate={{
                left: ["-15%", "50%", "50%", "115%"],
                rotate: [0, 0, 360, 360],
                top: ["88%", "88%", "68%", "88%"],
              }}
              transition={{ duration: baseDuration + 1, ease: "easeInOut", repeat: Infinity }}
              className="absolute text-5xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Surfing gentle wave crest SVG */}
          {sport === "surfing" && (
            <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden flex items-end">
              <svg viewBox="0 0 1440 320" className="w-full h-full text-sky-400/25 fill-current">
                <motion.path
                  animate={{
                    d: [
                      "M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,192C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,160L48,170.7C96,181,192,203,288,218.7C384,235,480,245,576,224C672,203,768,149,864,138.7C960,128,1056,160,1152,186.7C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                      "M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,192C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                    ],
                  }}
                  transition={{ duration: baseDuration + 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </div>
          )}

          {/* Swimming expanding ripples */}
          {sport === "swimming" && (
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 3 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.1, opacity: 0.6 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{
                    duration: 3.5,
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: idx * 1.1,
                  }}
                  className="absolute w-44 h-44 rounded-full border border-sky-300/40"
                />
              ))}
            </div>
          )}

          {/* Boxing glove quick jabs */}
          {sport === "boxing" && ballEmoji && (
            <motion.div
              initial={{ right: "-20%", top: "45%", scale: 1.2 }}
              animate={{
                right: ["-20%", "15%", "-20%"],
                top: ["45%", "40%", "45%"],
              }}
              transition={{ duration: baseDuration - 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="absolute text-7xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Archery smooth arrow glide */}
          {sport === "archery" && ballEmoji && (
            <motion.div
              initial={{ left: "-15%", top: "45%" }}
              animate={{
                left: "115%",
                top: ["45%", "43%", "45%"],
              }}
              transition={{ duration: baseDuration - 1.5, ease: "easeOut", repeat: Infinity }}
              className="absolute text-6xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}

          {/* Sailing Drifting Boat */}
          {sport === "sailing" && ballEmoji && (
            <motion.div
              initial={{ left: "-15%", top: "78%" }}
              animate={{
                left: "115%",
                y: [0, -6, 0],
              }}
              transition={{
                left: { duration: baseDuration + 4, ease: "linear", repeat: Infinity },
                y: { duration: 3, ease: "easeInOut", repeat: Infinity },
              }}
              className="absolute text-6xl select-none"
            >
              {ballEmoji}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearHistory?: () => void;
  isTyping: boolean;
  bgPrompt?: string | null;
  bgType?: "image" | "gradient";
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: string;
  viewMode: "threaded" | "focus";
  conversationMode: boolean;
  messageInterval: number;
}

export function ChatArea({
  messages,
  onSendMessage,
  onClearHistory,
  isTyping,
  bgPrompt,
  bgType = "gradient",
  gradientColor1 = "#4f46e5",
  gradientColor2 = "#ec4899",
  gradientDirection = "135deg",
  viewMode,
  conversationMode,
  messageInterval,
}: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [showSystemThinking, setShowSystemThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "thinking" | "settings" | "accessibility"
  >("thinking");
  const [isAnimatingTabs, setIsAnimatingTabs] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isTabsCollapsed, setIsTabsCollapsed] = useState(true);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);

  const handleTabClick = (tab: "thinking" | "settings" | "accessibility") => {
    if (activeTab === tab) {
      setIsTabsCollapsed(!isTabsCollapsed);
    } else {
      setActiveTab(tab);
      setIsTabsCollapsed(false);
    }
  };

  const latestAiMessageRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectHistoryMessage = (content: string) => {
    setInput(content);
    setShowHistoryOverlay(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const aiMessages = messages.filter((m) => m.role === "assistant");
  const userMessages = messages.filter((m) => m.role === "user");
  const hasUserMessages = userMessages.length > 0;
  const latestAiMessage =
    aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;
  const latestUserMessage =
    userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  const messageHash = latestAiMessage?.content
    ? latestAiMessage.content.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const showSunrise = messageHash % 3 === 0;
  const segments =
    latestAiMessage?.segments && latestAiMessage.segments.length > 0
      ? latestAiMessage.segments
      : latestAiMessage
        ? [
            {
              text: latestAiMessage.content,
              scale: "normal" as const,
              alignment: "center" as const,
              fontVariant: "primary" as const,
            },
          ]
        : [];

  useEffect(() => {
    setCurrentSegmentIndex(0);
  }, [messages.length]);

  useEffect(() => {
    if (
      !conversationMode ||
      isTyping ||
      !latestAiMessage ||
      segments.length <= 1
    )
      return;

    if (currentSegmentIndex < segments.length - 1) {
      const timer = setTimeout(() => {
        setCurrentSegmentIndex((prev) => prev + 1);
      }, messageInterval * 1000);
      return () => clearTimeout(timer);
    }
  }, [
    conversationMode,
    isTyping,
    latestAiMessage,
    currentSegmentIndex,
    messageInterval,
    segments.length,
  ]);

  const scrollToBottom = () => {
    if (viewMode === "threaded") {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
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
      setActiveTab("thinking");
      setIsAnimatingTabs(false);
      setShowHistoryOverlay(false);
    } else {
      // If the AI message is completely empty (no words to animate), show thinking immediately
      const latestAiMessage = messages
        .filter((m) => m.role === "assistant")
        .pop();
      if (latestAiMessage && latestAiMessage.content.trim() === "") {
        setShowSystemThinking(true);
      }
    }
  }, [isTyping, messages]);

  useEffect(() => {
    if (isTyping) {
      setIsTabsCollapsed(true);
    }
  }, [isTyping]);

  useEffect(() => {
    if (showSystemThinking) {
      setIsTabsCollapsed(false);
    }
  }, [showSystemThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput("");
      setShowHistoryOverlay(false);
    }
  };

  // Helper to split text and wrap emphasized words
  const renderMessageContent = (
    message: ChatMessage,
    isFocusMode: boolean = false,
    contentOverride?: TextSegment,
  ) => {
    if (message.role === "user") {
      return <p className="text-slate-800">{message.content}</p>;
    }

    // Assistant message with kinetic typography
    const contentToRender = contentOverride
      ? contentOverride.text
      : message.content;
    const words = contentToRender.split(/(\s+)/); // Split by whitespace but keep the spaces
    const emphasizedWords = message.emphasizedWords || [];

    let lastNonSpaceIndex = -1;
    for (let i = words.length - 1; i >= 0; i--) {
      if (!/^\s+$/.test(words[i])) {
        lastNonSpaceIndex = i;
        break;
      }
    }

    let msgFontFamily = '"Inter", sans-serif';
    if (contentOverride?.fontVariant) {
      msgFontFamily =
        FONTS.find((f) => f.name === contentOverride.fontVariant)?.value ||
        contentOverride.fontVariant;
    }

    let msgFontColor = message.fontColor || "#ffffff";
    let effectiveBgColor = "#ffffff"; // Default to white

    // 1. Determine base background luminance
    let avgLum = 1.0; // Default light
    if (bgType === "gradient" || (bgType === "image" && !bgPrompt)) {
      const rgb1 = hexToRgb(gradientColor1);
      const rgb2 = hexToRgb(gradientColor2);
      const avgR = Math.round((rgb1.r + rgb2.r) / 2);
      const avgG = Math.round((rgb1.g + rgb2.g) / 2);
      const avgB = Math.round((rgb1.b + rgb2.b) / 2);
      effectiveBgColor =
        "#" +
        [avgR, avgG, avgB].map((x) => x.toString(16).padStart(2, "0")).join("");
      avgLum = getLuminance(avgR, avgG, avgB);
    } else if (bgType === "image" && bgPrompt) {
      const textRgb = hexToRgb(msgFontColor);
      const isTextLight = getLuminance(textRgb.r, textRgb.g, textRgb.b) > 0.5;
      avgLum = isTextLight ? 0.1 : 0.9;
      effectiveBgColor = isTextLight ? "#0f172a" : "#ffffff";
    }

    // 2. Override based on Generative Background (Foreground Priority & Color Separation)
    if (message.weatherOverlay === "eclipse") {
      avgLum = 0.1; // Eclipse is very dark
      effectiveBgColor = "#0f172a";
    } else if (
      message.weatherOverlay === "fog" ||
      message.weatherOverlay === "clouds" ||
      message.weatherOverlay === "snow"
    ) {
      avgLum = 0.9; // Fog, clouds, snow are light
      effectiveBgColor = "#ffffff";
    } else if (message.weatherOverlay === "sun") {
      avgLum = 0.9; // Sun is light
      effectiveBgColor = "#fffbeb"; // Light yellow
    } else if (message.bgAnimationType === "data_grid") {
      avgLum = 0.1; // dark background for data stream
      effectiveBgColor = "#0f172a";
    } else if (message.weatherOverlay === "rain") {
      avgLum = Math.max(0, avgLum - 0.1);
    }

    // 3. WCAG Contrast Enforcement
    let textRgb = hexToRgb(msgFontColor);
    let textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);

    let requiredRatio = 4.5;
    if (message.wcagLevel === "A") requiredRatio = 3.0;
    if (message.wcagLevel === "AAA") requiredRatio = 7.0;

    let brightest = Math.max(avgLum, textLum);
    let darkest = Math.min(avgLum, textLum);
    let ratio = (brightest + 0.05) / (darkest + 0.05);

    // Hard luminance threshold for "light" background flip.
    if (
      avgLum > 0.5 ||
      ratio < requiredRatio ||
      message.weatherOverlay === "sun" ||
      message.weatherOverlay === "fog" ||
      message.weatherOverlay === "clouds" ||
      message.weatherOverlay === "snow" ||
      message.bgAnimationType === "confetti" ||
      message.bgAnimationType === "blooming_petals"
    ) {
      msgFontColor = avgLum > 0.5 ? "#1a1a1a" : "#ffffff";
      textRgb = hexToRgb(msgFontColor);
      textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
      effectiveBgColor = textLum > 0.5 ? "#1a1a1a" : "#ffffff";

      // Secondary check specifically for AAA compliance enforcement
      brightest = Math.max(avgLum, textLum);
      darkest = Math.min(avgLum, textLum);
      ratio = (brightest + 0.05) / (darkest + 0.05);

      if (ratio < requiredRatio && message.wcagLevel === "AAA") {
        // Force extreme contrast if AAA fails
        msgFontColor = avgLum > 0.5 ? "#000000" : "#ffffff";
        effectiveBgColor = avgLum > 0.5 ? "#000000" : "#ffffff";
      }
    }

    const needsTextShadow =
      message.wcagLevel === "AAA" &&
      (bgType === "gradient" || bgType === "image");
    const textShadowValue = needsTextShadow
      ? avgLum > 0.5
        ? "0 0 8px rgba(255,255,255,0.8)"
        : "0 0 8px rgba(0,0,0,0.8)"
      : "none";

    // Opacity scaling based on text length to prevent visual noise
    const isLongText = message.content.length > 200;
    const backgroundOpacityScalar = isLongText ? 0.3 : 1.0;

    const msgFontSize = message.fontSize || 16;
    const msgSentiment = message.sentiment ?? 0;
    const msgEngagement = message.engagement ?? 0;
    const maxKeywords = message.maxAnimatedKeywords ?? 3;
    const allowedEmphasizedWords = (message.emphasizedWords || []).slice(
      0,
      maxKeywords,
    );

    // Calculate timing based on engagement
    // Low engagement (<= 0): slightly slower (upper bounds)
    // High engagement (> 0): slightly faster (lower bounds)
    const normalizedEngagement = Math.max(-1, Math.min(1, msgEngagement));
    const speedFactor = (normalizedEngagement + 1) / 2; // 0 (slow) to 1 (fast)

    // Fade Duration: 180–260ms
    const baseDuration = 0.26 - speedFactor * 0.08; // 0.26s to 0.18s

    // Word-Length Adjustment: +40–80ms
    const longWordBonus = 0.08 - speedFactor * 0.04; // 0.08s to 0.04s

    // Punctuation Timing: Comma 150–250ms, Sentence end 250–400ms
    const punctuationPause = 0.25 - speedFactor * 0.1; // 0.25s to 0.15s
    const sentencePause = 0.4 - speedFactor * 0.15; // 0.40s to 0.25s

    let currentAccumulatedDelay = 0;

    let textAlignmentClass = "text-center";
    let justifyContentClass = "justify-center";
    let alignItemsClass = "items-center";
    let marginClass = "mx-auto";

    if (contentOverride?.alignment) {
      if (contentOverride.alignment === "left") {
        textAlignmentClass = "text-left";
        justifyContentClass = "justify-start";
        alignItemsClass = "items-start";
        marginClass = "ml-0 mr-auto";
      }
      if (contentOverride.alignment === "right") {
        textAlignmentClass = "text-right";
        justifyContentClass = "justify-end";
        alignItemsClass = "items-end";
        marginClass = "ml-auto mr-0";
      }
      if (contentOverride.alignment === "justify") {
        textAlignmentClass = "text-justify";
      }
    }

    let dynamicScale = 1;
    if (contentOverride?.scale) {
      if (contentOverride.scale === "small") dynamicScale = 0.8;
      if (contentOverride.scale === "large") dynamicScale = 1.4;
      if (contentOverride.scale === "oversized") dynamicScale = 2.0;
      if (contentOverride.scale === "massive") dynamicScale = 2.8;
    }

    return (
      <div
        className={`flex flex-col gap-3 w-full ${textAlignmentClass} ${isFocusMode ? `h-full ${justifyContentClass}` : ""}`}
      >
        <motion.div
          style={{
            fontFamily: msgFontFamily,
            fontSize: `${msgFontSize * dynamicScale}px`,
            color: msgFontColor,
            textShadow: textShadowValue,
            transition: "color 0.3s ease-in-out, text-shadow 0.3s ease-in-out",
          }}
          className={`leading-relaxed whitespace-pre-wrap ${isFocusMode ? `w-[90%] max-w-[90%] ${marginClass}` : ""}`}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
            },
          }}
        >
          {words.map((word, index) => {
            // Clean punctuation for matching
            const cleanWord = word
              .replace(/[.,!?()[\]{}"']/g, "")
              .toLowerCase()
              .trim();

            // Check if this word is part of an emphasized phrase
            let matchedEmphasizedWord = null;
            if (cleanWord) {
              matchedEmphasizedWord = allowedEmphasizedWords.find((ew) => {
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
                      ease: "easeOut",
                    },
                  },
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

  const aiMessagesToShow =
    viewMode === "focus" ? aiMessages.slice(-1) : aiMessages;
  const userMessagesToShow =
    viewMode === "focus" ? userMessages.slice(-1) : userMessages;

  // 1. Calculate the background luminance (avgLum) exactly like the text scope
  let avgLum = 1.0;
  if (bgType === "gradient" || (bgType === "image" && !bgPrompt)) {
    const rgb1 = hexToRgb(gradientColor1);
    const rgb2 = hexToRgb(gradientColor2);
    const avgR = Math.round((rgb1.r + rgb2.r) / 2);
    const avgG = Math.round((rgb1.g + rgb2.g) / 2);
    const avgB = Math.round((rgb1.b + rgb2.b) / 2);
    avgLum = getLuminance(avgR, avgG, avgB);
  } else if (bgType === "image" && bgPrompt) {
    // Standard base image: starts light or dark based on message's fontColor
    const startFontColor = latestAiMessage?.fontColor || "#ffffff";
    const textRgb = hexToRgb(startFontColor);
    const isTextLight = getLuminance(textRgb.r, textRgb.g, textRgb.b) > 0.5;
    avgLum = isTextLight ? 0.1 : 0.9;
  }

  // 2. Apply weather and generative overlay modifications
  if (latestAiMessage) {
    if (latestAiMessage.weatherOverlay === "eclipse") {
      avgLum = 0.1;
    } else if (
      latestAiMessage.weatherOverlay === "fog" ||
      latestAiMessage.weatherOverlay === "clouds" ||
      latestAiMessage.weatherOverlay === "snow" ||
      latestAiMessage.weatherOverlay === "sun"
    ) {
      avgLum = 0.9;
    } else if (latestAiMessage.bgAnimationType === "data_grid") {
      avgLum = 0.1;
    } else if (latestAiMessage.weatherOverlay === "rain") {
      avgLum = Math.max(0, avgLum - 0.1);
    }
  }

  // 3. Contrast Check to find the final, true effective font color
  let effectiveFontColor = latestAiMessage?.fontColor || "#ffffff";
  const textRgb = hexToRgb(effectiveFontColor);
  const textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);

  let requiredRatio = 4.5;
  if (latestAiMessage) {
    if (latestAiMessage.wcagLevel === "A") requiredRatio = 3.0;
    if (latestAiMessage.wcagLevel === "AAA") requiredRatio = 7.0;
  }

  const brightest = Math.max(avgLum, textLum);
  const darkest = Math.min(avgLum, textLum);
  const ratio = (brightest + 0.05) / (darkest + 0.05);

  if (
    avgLum > 0.5 ||
    ratio < requiredRatio ||
    latestAiMessage?.weatherOverlay === "sun" ||
    latestAiMessage?.weatherOverlay === "fog" ||
    latestAiMessage?.weatherOverlay === "clouds" ||
    latestAiMessage?.weatherOverlay === "snow" ||
    latestAiMessage?.bgAnimationType === "confetti" ||
    latestAiMessage?.bgAnimationType === "blooming_petals"
  ) {
    effectiveFontColor = avgLum > 0.5 ? "#1a1a1a" : "#ffffff";
  }

  const effectiveRgb = hexToRgb(effectiveFontColor);
  const isTextLight =
    getLuminance(effectiveRgb.r, effectiveRgb.g, effectiveRgb.b) > 0.5;
  const containerBgColor = isTextLight ? "#0f172a" : "#ffffff";

  const isLongText = latestAiMessage?.content
    ? latestAiMessage.content.length > 200
    : false;
  const backgroundOpacityScalar = isLongText ? 0.3 : 1.0;

  return (
    <div className="flex flex-col flex-grow flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 relative min-h-0">
      {/* AI Response Area (Top) */}
      <div 
        className={`relative p-6 pb-16 ${!isTabsCollapsed ? "z-20" : "z-10"} flex flex-col justify-center items-center flex-grow flex-1 min-h-[320px] md:min-h-[400px] max-h-none h-auto rounded-t-2xl overflow-hidden transition-colors duration-1000`}
        style={{ backgroundColor: containerBgColor }}
      >
        {/* Environmental Scene & Background Image */}
        <div
          className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none ${bgType === "gradient" || (bgType === "image" && !bgPrompt) ? "animate-gradient-bg" : ""}`}
          style={{
            backgroundImage:
              bgType === "image" && bgPrompt
                ? `url(https://image.pollinations.ai/prompt/${encodeURIComponent(bgPrompt)}?width=1920&height=1080&nologo=true)`
                : `linear-gradient(${gradientDirection}, ${gradientColor1}, ${gradientColor2})`,
            backgroundSize:
              bgType === "image" && bgPrompt ? "cover" : undefined,
            backgroundPosition:
              bgType === "image" && bgPrompt ? "center" : undefined,
            opacity: 1, // Full sharp opacity to act as a complete, gorgeous painting/photo replacement
            filter: "none", // No blur to maintain pristine visual resolution
            transform: "none",
          }}
        />

        {/* Cinematic Compositing & Depth Fog for Text Contrast */}
        {bgType === "image" && bgPrompt && (
          <div
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at center, ${containerBgColor}e6 0%, ${containerBgColor}b3 50%, ${containerBgColor}22 100%)`,
              mixBlendMode: "normal",
            }}
          />
        )}

        {/* Soft Vignette Masking */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 100px ${containerBgColor}66`,
          }}
        />

        {/* Weather Effects & Animations */}
        <AnimatePresence>
          {!isTyping && latestAiMessage?.weatherOverlay === "rain" && (
            <motion.div
              key="rain"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.7 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="rain-container z-0 pointer-events-none"
            >
              {Array.from({
                length: Math.floor(
                  30 * (latestAiMessage?.particleDensity || 5),
                ),
              }).map((_, i) => (
                <div
                  key={i}
                  className="drop"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.5 + Math.random() * 0.5,
                  }}
                />
              ))}
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherOverlay === "snow" && (
            <motion.div
              key="snow"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="snow-container z-0 pointer-events-none"
            >
              {Array.from({
                length: Math.floor(
                  15 * (latestAiMessage?.particleDensity || 5),
                ),
              }).map((_, i) => (
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
                    opacity: 0.5 + Math.random() * 0.5,
                  }}
                />
              ))}
            </motion.div>
          )}
           {!isTyping && latestAiMessage?.weatherOverlay === "sun" && showSunrise && (
            <motion.div
              key="sun"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="sun-container absolute inset-0 overflow-hidden pointer-events-none z-0"
            >
              <motion.div
                initial={{ left: "-10%", top: "calc(30% + 25px)" }}
                animate={{ left: "50%", top: "calc(10% + 25px)" }}
                transition={{ duration: 15, ease: "easeOut", delay: 0.5 }}
                className="absolute w-28 h-28 bg-yellow-400 rounded-full blur-xl animate-pulse"
                style={{
                  translateX: "-50%",
                  translateY: "-50%",
                  animationDuration: "4s",
                }}
              />
              <motion.div
                initial={{ left: "-10%", top: "calc(30% + 25px)" }}
                animate={{ left: "50%", top: "calc(10% + 25px)" }}
                transition={{ duration: 15, ease: "easeOut", delay: 0.5 }}
                className="absolute w-14 h-14 bg-yellow-200 rounded-full shadow-[0_0_45px_rgba(253,224,71,0.8)]"
                style={{ translateX: "-50%", translateY: "-50%" }}
              />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherOverlay === "clouds" && (
            <motion.div
              key="clouds"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.8 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="clouds-container absolute inset-0 overflow-hidden pointer-events-none z-0"
            >
              <div className="absolute top-10 left-10 w-64 h-24 bg-white rounded-full blur-md animate-cloud-move-1" />
              <div className="absolute top-20 right-20 w-80 h-32 bg-white rounded-full blur-md animate-cloud-move-2" />
              <div className="absolute top-40 left-1/3 w-72 h-28 bg-white rounded-full blur-md animate-cloud-move-3" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherOverlay === "fog" && (
            <motion.div
              key="fog"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.7 * (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="fog-container z-0 pointer-events-none"
            >
              <div className="fog-layer" />
              <div className="fog-layer-2" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.weatherOverlay === "eclipse" && (
            <motion.div
              key="eclipse"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.8 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="eclipse-container z-0 pointer-events-none"
            >
              <div className="eclipse-sun" />
              <div className="eclipse-moon" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.bgAnimationType === "confetti" && (
            <motion.div
              key="confetti"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.8 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            >
              {Array.from({
                length: Math.floor(
                  10 * (latestAiMessage?.particleDensity || 5),
                ),
              }).map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-3 h-3 rounded-sm ${["bg-pink-500", "bg-yellow-400", "bg-blue-500", "bg-green-400"][Math.floor(Math.random() * 4)]}`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`,
                    animation: `snowfall ${2 + Math.random() * 3}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    opacity: 0.7 + Math.random() * 0.3,
                  }}
                />
              ))}
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.bgAnimationType === "data_grid" && (
            <motion.div
              key="data-stream"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.6 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-900/50"
            >
              <div className="absolute inset-0 grid grid-cols-12 gap-1 opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full w-full border-r border-[#00FFFF]/20"
                  />
                ))}
              </div>
              {Array.from({
                length: Math.floor(5 * (latestAiMessage?.particleDensity || 5)),
              }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#00FFFF] to-transparent"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 50}%`,
                    height: "30%",
                    animation: `snowfall ${1 + Math.random() * 2}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </motion.div>
          )}
          {!isTyping &&
            latestAiMessage?.bgAnimationType === "blooming_petals" && (
              <motion.div
                key="floral"
                initial={{ opacity: 0 }}
                animate={{
                  opacity:
                    0.5 *
                    (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                    backgroundOpacityScalar,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, delay: 0.5 }}
                className="absolute inset-0 overflow-hidden pointer-events-none z-0"
              >
                <div className="bg-bloom absolute inset-0 w-full h-full" />
              </motion.div>
            )}
          {!isTyping && latestAiMessage?.bgAnimationType === "GridShift" && (
            <motion.div
              key="gridshift"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.5 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gridshift"
            />
          )}
          {!isTyping && latestAiMessage?.bgAnimationType === "Tide" && (
            <motion.div
              key="tide"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.5 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-tide"
            />
          )}
          {!isTyping && latestAiMessage?.bgAnimationType === "Mist_Veil" && (
            <motion.div
              key="mist_veil"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.8 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="bg-mist-veil"
            >
              <div className="mist-blob-1" />
              <div className="mist-blob-2" />
            </motion.div>
          )}
          {!isTyping && latestAiMessage?.bgAnimationType === "Aurora" && (
            <motion.div
              key="aurora"
              initial={{ opacity: 0 }}
              animate={{
                opacity:
                  0.7 *
                  (latestAiMessage?.wcagStrictMode ? 0.6 : 1.0) *
                  backgroundOpacityScalar,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, delay: 0.5 }}
              className="absolute inset-0 z-0 pointer-events-none bg-aurora"
            />
          )}
        </AnimatePresence>

        {/* Contextual Effects & Animations (Sports, Locations, etc.) */}
        {!isTyping && latestAiMessage?.contextualEffect && latestAiMessage.contextualEffect.type !== "none" && (
          <ContextualEffectOverlay
            effect={latestAiMessage.contextualEffect}
            wcagStrictMode={latestAiMessage.wcagStrictMode || false}
            isTextLight={isTextLight}
            backgroundOpacityScalar={backgroundOpacityScalar}
          />
        )}

        {/* Subtle Ambient Generation Layer (only active while generating response) */}
        <AnimatePresence>
          {isTyping && latestUserMessage && (
            <GenerationAmbientLayer
              userMessageContent={latestUserMessage.content}
              sentiment={latestUserMessage.sentiment ?? 0}
              engagement={latestUserMessage.engagement ?? 0}
              wcagStrictMode={latestAiMessage?.wcagStrictMode || false}
            />
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
                <div className="w-full h-full p-8 md:p-16 flex flex-col justify-center transition-all duration-700 bg-transparent">
                  {renderMessageContent(
                    latestAiMessage,
                    true,
                    segments[currentSegmentIndex],
                  )}
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
                  <span className="text-sm text-slate-200 font-medium">
                    Analyzing emotional context...
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Manual Navigation Controls (Bottom of Response Window) */}
          {!isTyping &&
            latestAiMessage &&
            !conversationMode &&
            segments.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex items-center gap-4 justify-center z-20">
                <button
                  onClick={() =>
                    setCurrentSegmentIndex(Math.max(0, currentSegmentIndex - 1))
                  }
                  disabled={currentSegmentIndex === 0}
                  className={`p-2 rounded-full transition-colors backdrop-blur-sm border disabled:opacity-30 disabled:cursor-not-allowed ${
                    isTextLight
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-black/5 hover:bg-black/10 text-slate-800 border-black/10"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <span
                  className={`text-xs font-mono ${isTextLight ? "text-white/70" : "text-slate-500"}`}
                >
                  {currentSegmentIndex + 1} / {segments.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentSegmentIndex(
                      Math.min(segments.length - 1, currentSegmentIndex + 1),
                    )
                  }
                  disabled={currentSegmentIndex === segments.length - 1}
                  className={`p-2 rounded-full transition-colors backdrop-blur-sm border disabled:opacity-30 disabled:cursor-not-allowed ${
                    isTextLight
                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                      : "bg-black/5 hover:bg-black/10 text-slate-800 border-black/10"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
        </div>

        {/* Tab Bar Overlaid Inside AI Response Window (Bottom edge) */}
        {(latestAiMessage || isTyping) && hasUserMessages && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex space-x-2 px-6">
            <button
              onClick={() => hasUserMessages && !isTyping && !isAnimatingTabs && handleTabClick("thinking")}
              disabled={!hasUserMessages || isTyping || isAnimatingTabs}
              className={`px-4 py-2 font-semibold rounded-t-md border relative bottom-[-1px] ${
                hasUserMessages && activeTab === "thinking" && !isTabsCollapsed && !isTyping && !isAnimatingTabs
                  ? "bg-slate-800 text-slate-100 border-slate-600 border-b-slate-800 shadow-[0_-2px_6px_-2px_rgba(0,0,0,0.5)] text-xs"
                  : `bg-slate-900 ${!hasUserMessages ? 'text-slate-500' : 'text-slate-400'} border-slate-700/50 border-b-slate-600 text-xs ${hasUserMessages && !isTyping && !isAnimatingTabs ? "hover:bg-slate-800 hover:text-slate-300 transition-colors" : "cursor-default"}`
              }`}
            >
              SYSTEM THINKING
            </button>
            <button
              onClick={() => hasUserMessages && !isTyping && !isAnimatingTabs && handleTabClick("settings")}
              disabled={!hasUserMessages || isTyping || isAnimatingTabs}
              className={`px-4 py-2 text-xs font-semibold rounded-t-md border relative bottom-[-1px] ${
                hasUserMessages && activeTab === "settings" && !isTabsCollapsed && !isTyping && !isAnimatingTabs
                  ? "bg-slate-800 text-slate-100 border-slate-600 border-b-slate-800 shadow-[0_-2px_6px_-2px_rgba(0,0,0,0.5)]"
                  : `bg-slate-900 ${!hasUserMessages ? 'text-slate-500' : 'text-slate-400'} border-slate-700/50 border-b-slate-600 ${hasUserMessages && !isTyping && !isAnimatingTabs ? "hover:bg-slate-800 hover:text-slate-300 transition-colors" : "cursor-default"}`
              }`}
            >
              KINETIC TYPE SETTINGS
            </button>
            <button
              onClick={() => hasUserMessages && !isTyping && !isAnimatingTabs && handleTabClick("accessibility")}
              disabled={!hasUserMessages || isTyping || isAnimatingTabs}
              className={`px-4 py-2 text-xs font-semibold rounded-t-md border relative bottom-[-1px] ${
                hasUserMessages && activeTab === "accessibility" && !isTabsCollapsed && !isTyping && !isAnimatingTabs
                  ? "bg-slate-800 text-slate-100 border-slate-600 border-b-slate-800 shadow-[0_-2px_6px_-2px_rgba(0,0,0,0.5)]"
                  : `bg-slate-900 ${!hasUserMessages ? 'text-slate-500' : 'text-slate-400'} border-slate-700/50 border-b-slate-600 ${hasUserMessages && !isTyping && !isAnimatingTabs ? "hover:bg-slate-800 hover:text-slate-300 transition-colors" : "cursor-default"}`
              }`}
            >
              ACCESSIBILITY ADJUSTMENTS
            </button>
          </div>
        )}
      </div>

      {/* Expanded Tab Content Drawer (Middle) */}
      <AnimatePresence>
        {hasUserMessages && !isTyping && !isTabsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 230, opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ 
              duration: 0.25, 
              ease: "easeOut"
            }}
            onAnimationStart={() => setIsAnimatingTabs(true)}
            onAnimationComplete={() => setIsAnimatingTabs(false)}
            className="shrink-0 bg-slate-800 border-t border-b border-slate-600 py-4 px-6 shadow-lg text-xs text-slate-300 leading-relaxed overflow-y-auto relative z-10 w-full -mt-[1px]"
          >
                {activeTab === "thinking" && (
                  <div className="font-normal not-italic text-[14px] pl-3 border-l-2 border-slate-500/50">
                    {latestAiMessage?.thinking || "..."}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-lg border border-slate-700/50 text-[11px] font-mono space-y-1.5 text-slate-300">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>
                        <span className="text-slate-400">Sentiment:</span>{" "}
                        {(latestAiMessage?.sentiment ?? 0).toFixed(2)}
                      </div>
                      <div
                        className="truncate"
                        title={latestAiMessage?.fontFamily}
                      >
                        <span className="text-slate-400">Font:</span>{" "}
                        {
                          (latestAiMessage?.fontFamily || '"Inter"')
                            .replace(/"/g, "")
                            .split(",")[0]
                        }
                      </div>
                      <div>
                        <span className="text-slate-400">Engagement:</span>{" "}
                        {(latestAiMessage?.engagement ?? 0).toFixed(2)}
                      </div>
                      <div>
                        <span className="text-slate-400">Size:</span>{" "}
                        {latestAiMessage?.fontSize || 16}px
                      </div>
                      <div>
                        <span className="text-slate-400">Sex:</span>{" "}
                        {latestAiMessage?.sex || "Neutral"}
                      </div>
                      <div
                        className="truncate"
                        title={latestAiMessage?.motionStyle || "default"}
                      >
                        <span className="text-slate-400">Motion:</span>{" "}
                        {latestAiMessage?.motionStyle || "default"}
                      </div>
                      <div>
                        <span className="text-slate-400">Age:</span>{" "}
                        {latestAiMessage?.age || 30}
                      </div>
                      <div>
                        <span className="text-slate-400">Access:</span>{" "}
                        {latestAiMessage?.wcagLevel || "AA"}
                      </div>
                      <div className="col-span-2 border-t border-slate-700/50 my-1 pt-1"></div>
                      <div className="col-span-2 font-semibold text-slate-200">
                        Generative Semantic Mapping:
                      </div>
                      <div>
                        <span className="text-slate-400">Base Theme:</span>{" "}
                        {latestAiMessage?.baseTheme || "Minimalist"}
                      </div>
                      <div>
                        <span className="text-slate-400">BG Animation:</span>{" "}
                        {latestAiMessage?.bgAnimationType || "none"}
                      </div>
                      <div>
                        <span className="text-slate-400">Density:</span>{" "}
                        {latestAiMessage?.particleDensity || 5}
                      </div>
                      <div>
                        <span className="text-slate-400">Weather:</span>{" "}
                        {latestAiMessage?.weatherOverlay || "none"}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "accessibility" && (
                  <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-lg border border-slate-700/50 text-[11px] font-mono space-y-1.5 text-slate-300">
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>
                        <span className="text-slate-400">Contrast:</span>{" "}
                        Enforced {latestAiMessage?.wcagLevel || "AA"} compliance
                        (minimum ratio{" "}
                        {latestAiMessage?.wcagLevel === "AAA"
                          ? "7.0:1"
                          : latestAiMessage?.wcagLevel === "A"
                            ? "3.0:1"
                            : "4.5:1"}
                        ).
                      </li>
                      <li>
                        <span className="text-slate-400">Text Size:</span> Base
                        size {latestAiMessage?.fontSize || 16}px.
                      </li>
                      <li>
                        <span className="text-slate-400">Animation:</span>{" "}
                        Motion '{latestAiMessage?.motionStyle || "default"}'
                        applied.{" "}
                        {latestAiMessage?.wcagStrictMode
                          ? "Strict mode active: rapid flashing and excessive movement disabled."
                          : "Standard motion limits applied."}
                      </li>
                      <li>
                        <span className="text-slate-400">Decoration:</span>{" "}
                        Visual effects filtered to maintain legibility and
                        prevent visual noise.
                      </li>
                    </ul>
                  </div>
                )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Input & History Area (Bottom) */}
      <div className="shrink-0 flex flex-col relative bg-slate-50 border-t border-slate-200 rounded-b-2xl z-30">
        {/* Input Form */}
        <div className="p-4 bg-white relative z-50 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryOverlay(!showHistoryOverlay)}
              className={`p-2.5 rounded-xl border border-slate-200 transition-colors ${showHistoryOverlay ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700'}`}
              title="Show Conversation History"
            >
              <History className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:bg-slate-100 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* History Overlay Drawer (Rendered absolutely above or beneath the Input Field depending on viewMode) */}
        <AnimatePresence>
          {showHistoryOverlay && (
            <motion.div
              initial={
                viewMode === "focus"
                  ? { opacity: 0, y: 10, scale: 0.95 }
                  : { opacity: 0, y: -10, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                viewMode === "focus"
                  ? { opacity: 0, y: 10, scale: 0.95 }
                  : { opacity: 0, y: -10, scale: 0.95 }
              }
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute left-4 right-4 z-40 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 flex flex-col ${
                viewMode === "focus"
                  ? "bottom-[84px] max-h-[300px]"
                  : "top-[76px] max-h-[250px]"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 mb-2">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Conversation History</span>
                </div>
                <div className="flex items-center gap-2">
                  {onClearHistory && userMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearHistory();
                        setShowHistoryOverlay(false);
                      }}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      title="Clear all messages in the conversation"
                    >
                      Clear History
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistoryOverlay(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[180px]">
                {userMessages.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No sent messages in this conversation.
                  </div>
                ) : (
                  [...userMessages].reverse().map((msg, idx) => (
                    <button 
                      key={`hist-${idx}`}
                      type="button"
                      onClick={() => handleSelectHistoryMessage(msg.content)}
                      className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-900 text-xs font-normal leading-relaxed break-words shadow-sm transition-all flex items-center justify-between group"
                      title="Click to select and edit this message"
                    >
                      <span className="flex-1 pr-4">{msg.content}</span>
                      <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-semibold shrink-0">
                        Select &rarr;
                      </span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
