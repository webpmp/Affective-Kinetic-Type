import React, { useState } from 'react';
import { Circumplex } from './Circumplex';
import { Settings, Type, Palette, Move, User, BrainCircuit, ChevronDown, ChevronRight, Sparkles, Accessibility, Clock, Terminal } from 'lucide-react';
import { DECORATION_POOL } from '../lib/decorations';
import { ANIMATION_POOL } from '../lib/animations';
import { KineticWord } from './KineticWord';

interface ControlPanelProps {
  layout?: 'side' | 'stacked';
  sentiment: number;
  engagement: number;
  onEmotionChange: (v: number, a: number) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontColor: string;
  onFontColorChange: (color: string) => void;
  age: number;
  onAgeChange: (age: number) => void;
  sex: string;
  onSexChange: (sex: string) => void;
  activeDecorations: string[];
  onActiveDecorationsChange: (decorations: string[]) => void;
  activeAnimations: string[];
  onActiveAnimationsChange: (animations: string[]) => void;
  emotionInfluence: number;
  onEmotionInfluenceChange: (val: number) => void;
  animationIntensity: number;
  onAnimationIntensityChange: (val: number) => void;
  maxAnimatedKeywords: number;
  onMaxAnimatedKeywordsChange: (val: number) => void;
  animationStability: boolean;
  onAnimationStabilityChange: (val: boolean) => void;
  wcagLevel: 'A' | 'AA' | 'AAA';
  onWcagLevelChange: (level: 'A' | 'AA' | 'AAA') => void;
  wcagStrictMode: boolean;
  onWcagStrictModeChange: (strict: boolean) => void;
  bgType: 'image' | 'gradient';
  onBgTypeChange: (type: 'image' | 'gradient') => void;
  gradientColor1: string;
  onGradientColor1Change: (color: string) => void;
  gradientColor2: string;
  onGradientColor2Change: (color: string) => void;
  gradientDirection: string;
  onGradientDirectionChange: (direction: string) => void;
  conversationMode: boolean;
  onConversationModeChange: (val: boolean) => void;
  messageInterval: number;
  onMessageIntervalChange: (val: number) => void;
}

const FONTS = [
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

const SEX_OPTIONS = ['Neutral', 'Female', 'Male'];

export function ControlPanel({
  layout = 'side',
  sentiment,
  engagement,
  onEmotionChange,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  fontColor,
  onFontColorChange,
  age,
  onAgeChange,
  sex,
  onSexChange,
  activeDecorations,
  onActiveDecorationsChange,
  activeAnimations,
  onActiveAnimationsChange,
  emotionInfluence,
  onEmotionInfluenceChange,
  animationIntensity,
  onAnimationIntensityChange,
  maxAnimatedKeywords,
  onMaxAnimatedKeywordsChange,
  animationStability,
  onAnimationStabilityChange,
  wcagLevel,
  onWcagLevelChange,
  wcagStrictMode,
  onWcagStrictModeChange,
  bgType,
  onBgTypeChange,
  gradientColor1,
  onGradientColor1Change,
  gradientColor2,
  onGradientColor2Change,
  gradientDirection,
  onGradientDirectionChange,
  conversationMode,
  onConversationModeChange,
  messageInterval,
  onMessageIntervalChange,
}: ControlPanelProps) {

  const [sections, setSections] = useState({
    affective: true,
    typography: false,
    decorations: false,
    animations: false,
    animControls: false,
    accessibility: false,
    profile: false,
    background: false,
    playback: false
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ title, icon: Icon, sectionKey }: { title: string, icon: any, sectionKey: keyof typeof sections }) => (
    <button 
      onClick={() => layout === 'side' && toggleSection(sectionKey)} 
      className={`w-full flex items-center justify-between text-slate-700 font-medium py-2 ${layout === 'side' ? 'hover:text-indigo-600 cursor-pointer' : 'cursor-default'} transition-colors`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <h3>{title}</h3>
      </div>
      {layout === 'side' && (sections[sectionKey] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
    </button>
  );

  const isPos = sentiment >= 0;
  const isHigh = engagement >= 0;
  let mood = '';
  let font = '';
  let color = '';
  let motion = '';

  if (isPos && isHigh) {
    mood = 'enthusiastic and excited';
    font = 'Inter';
    color = 'Amber';
    motion = 'large, energetic upward motion';
  } else if (!isPos && isHigh) {
    mood = 'firm and stressed/angry';
    font = 'Space Grotesk';
    color = 'Red';
    motion = 'sharp, aggressive shaking motion';
  } else if (!isPos && !isHigh) {
    mood = 'empathetic and sad';
    font = 'JetBrains Mono';
    color = 'Blue';
    motion = 'subtle, sinking motion';
  } else {
    mood = 'serene and relaxed';
    font = 'Playfair Display';
    color = 'Emerald';
    motion = 'gentle, floating motion';
  }

  const systemThinking = `User is feeling ${mood} (Sentiment: ${sentiment.toFixed(2)}, Engagement: ${engagement.toFixed(2)}). The AI will tailor its response to match this state. Kinetic type will use ${font} font in ${color}, applying a one-time ${motion}.`;

  const isStacked = layout === 'stacked';

  const containerClasses = isStacked 
    ? "flex gap-4 overflow-x-auto pb-4 custom-scrollbar h-full items-start" 
    : "p-6 flex-1 overflow-y-auto space-y-6";

  const cardClasses = isStacked
    ? "bg-white rounded-xl shadow-sm border border-slate-200 p-5 min-w-[320px] max-w-[320px] shrink-0 h-full overflow-y-auto custom-scrollbar"
    : "space-y-2";

  const renderSectionContent = (key: keyof typeof sections, content: React.ReactNode) => {
    if (isStacked) return <div className="space-y-4 pt-2">{content}</div>;
    return sections[key] && <div className="space-y-4 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">{content}</div>;
  };

  const renderDivider = () => {
    if (isStacked) return null;
    return <hr className="border-slate-100" />;
  };

  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full ${isStacked ? 'bg-transparent border-none shadow-none' : ''}`}>
      {!isStacked && (
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-500" />
          <h2 className="font-semibold text-slate-800">Control Panel</h2>
        </div>
      )}

      <div className={containerClasses}>
        
        {/* 1. Affective State */}
        <section className={cardClasses}>
          <SectionHeader title="Affective State" icon={BrainCircuit} sectionKey="affective" />
          {renderSectionContent('affective', (
            <>
              <p className="text-sm text-slate-500 leading-relaxed">
                Click and drag on the circumplex model to simulate the user's emotional state. 
                This defines the context for the AI's response and typographic behavior.
              </p>
              <div className="flex justify-center py-4">
                <Circumplex sentiment={sentiment} engagement={engagement} onChange={onEmotionChange} />
              </div>

              <details className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900 leading-relaxed mt-4 group">
                <summary className="flex items-center gap-2 font-semibold mb-1 cursor-pointer select-none list-none">
                  <Terminal className="w-4 h-4" />
                  System Interpretation
                  <ChevronRight className="w-4 h-4 ml-auto group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 italic pl-6 border-l-2 border-indigo-200">
                  {systemThinking}
                </div>
              </details>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 2. Typography Settings */}
        <section className={cardClasses}>
          <SectionHeader title="Baseline Typography" icon={Type} sectionKey="typography" />
          {renderSectionContent('typography', (
            <>
              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => onFontFamilyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FONTS.map(f => (
                    <option key={f.name} value={f.value}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-600">Base Size</label>
                  <span className="text-xs text-slate-400 font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="24"
                  step="1"
                  value={fontSize}
                  onChange={(e) => onFontSizeChange(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Font Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-500" />
                  <label className="text-sm font-medium text-slate-600">Base Color</label>
                </div>
                <div className="flex gap-2">
                  {['#1e293b', '#334155', '#475569', '#0f172a', '#172554'].map(color => (
                    <button
                      key={color}
                      onClick={() => onFontColorChange(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        fontColor === color ? 'border-indigo-500 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 3. Decoration Pool */}
        <section className={cardClasses}>
          <SectionHeader title="Decoration Pool" icon={Sparkles} sectionKey="decorations" />
          {renderSectionContent('decorations', (
            <>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-600">Active Styles ({activeDecorations.length}/{DECORATION_POOL.length})</label>
                <div className="space-x-2">
                  <button 
                    onClick={() => onActiveDecorationsChange(DECORATION_POOL.map(d => d.id))}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    All
                  </button>
                  <button 
                    onClick={() => onActiveDecorationsChange([])}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar ${isStacked ? 'max-h-[400px]' : 'max-h-48'}`}>
                {DECORATION_POOL.map(dec => {
                  const isActive = activeDecorations.includes(dec.id);
                  return (
                    <button
                      key={dec.id}
                      onClick={() => {
                        if (isActive) {
                          onActiveDecorationsChange(activeDecorations.filter(id => id !== dec.id));
                        } else {
                          onActiveDecorationsChange([...activeDecorations, dec.id]);
                        }
                      }}
                      className={`text-xs text-left px-2 py-1.5 rounded border transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span style={dec.style}>{dec.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 4. Animation Library */}
        <section className={cardClasses}>
          <SectionHeader title="Animation Library" icon={Move} sectionKey="animations" />
          {renderSectionContent('animations', (
            <>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-600">Active Animations ({activeAnimations.length}/{ANIMATION_POOL.length})</label>
                <div className="space-x-2">
                  <button 
                    onClick={() => onActiveAnimationsChange(ANIMATION_POOL.map(a => a.id))}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    All
                  </button>
                  <button 
                    onClick={() => onActiveAnimationsChange([])}
                    className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className={`grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar ${isStacked ? 'max-h-[400px]' : 'max-h-48'}`}>
                {ANIMATION_POOL.map(anim => {
                  const isActive = activeAnimations.includes(anim.id);
                  return (
                    <button
                      key={anim.id}
                      onClick={() => {
                        if (isActive) {
                          onActiveAnimationsChange(activeAnimations.filter(id => id !== anim.id));
                        } else {
                          onActiveAnimationsChange([...activeAnimations, anim.id]);
                        }
                      }}
                      className={`text-xs text-left px-2 py-1.5 rounded border transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {anim.name}
                    </button>
                  );
                })}
              </div>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 5. Animation Controls */}
        <section className={cardClasses}>
          <SectionHeader title="Animation Controls" icon={Settings} sectionKey="animControls" />
          {renderSectionContent('animControls', (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-600">Emotion Influence</label>
                  <span className="text-xs text-slate-400">{emotionInfluence.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.1" 
                  value={emotionInfluence}
                  onChange={(e) => onEmotionInfluenceChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-[10px] text-slate-400 leading-tight">Scales how strongly sentiment/engagement affect selection.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-600">Animation Intensity</label>
                  <span className="text-xs text-slate-400">{animationIntensity.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" max="3" step="0.1" 
                  value={animationIntensity}
                  onChange={(e) => onAnimationIntensityChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-[10px] text-slate-400 leading-tight">Adjusts amplitude, speed, and duration.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-600">Max Animated Keywords</label>
                  <span className="text-xs text-slate-400">{maxAnimatedKeywords}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" step="1" 
                  value={maxAnimatedKeywords}
                  onChange={(e) => onMaxAnimatedKeywordsChange(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-sm font-medium text-slate-600">Animation Stability</label>
                <button
                  onClick={() => onAnimationStabilityChange(!animationStability)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${animationStability ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${animationStability ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight -mt-1">Maintains consistent animation per keyword.</p>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 6. Background */}
        <section className={cardClasses}>
          <SectionHeader title="Background" icon={Palette} sectionKey="background" />
          {renderSectionContent('background', (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Background Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onBgTypeChange('gradient')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                      bgType === 'gradient'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Gradient
                  </button>
                  <button
                    onClick={() => onBgTypeChange('image')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                      bgType === 'image'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    AI Image
                  </button>
                </div>
              </div>

              {bgType === 'gradient' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Direction</label>
                    <select
                      value={gradientDirection}
                      onChange={(e) => onGradientDirectionChange(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="to right">To Right</option>
                      <option value="to left">To Left</option>
                      <option value="to bottom">To Bottom</option>
                      <option value="to top">To Top</option>
                      <option value="135deg">Diagonal (135deg)</option>
                      <option value="45deg">Diagonal (45deg)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Color 1</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={gradientColor1}
                        onChange={(e) => onGradientColor1Change(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={gradientColor1}
                        onChange={(e) => onGradientColor1Change(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Color 2</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={gradientColor2}
                        onChange={(e) => onGradientColor2Change(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={gradientColor2}
                        onChange={(e) => onGradientColor2Change(e.target.value)}
                        className="flex-1 px-2 py-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        {renderDivider()}

        {/* 7. Accessibility (WCAG) */}
        <section className={cardClasses}>
          <SectionHeader title="Accessibility (WCAG)" icon={Accessibility} sectionKey="accessibility" />
          {renderSectionContent('accessibility', (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Compliance Level</label>
                <div className="flex gap-2">
                  {['A', 'AA', 'AAA'].map(level => (
                    <button
                      key={level}
                      onClick={() => onWcagLevelChange(level as any)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                        wcagLevel === level
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-sm font-medium text-slate-600">Strict Mode</label>
                <button
                  onClick={() => onWcagStrictModeChange(!wcagStrictMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${wcagStrictMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${wcagStrictMode ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight -mt-1">
                {wcagStrictMode ? 'Enforces hard compliance.' : 'Allows minor deviations with warnings.'}
              </p>

              {/* Preview Mode */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview Mode</label>
                <div className="space-y-3">
                  {(['A', 'AA', 'AAA'] as const).map(level => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 w-8">{level}</span>
                      <div className="flex-1 flex justify-center">
                        <KineticWord 
                          word="Dynamic"
                          sentiment={0.8}
                          engagement={0.9}
                          isEmphasized={true}
                          baseColor="#1e293b"
                          motionStyle="glitch"
                          activeAnimations={['glitch']}
                          animationIntensity={1.5}
                          wcagLevel={level}
                          wcagStrictMode={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-400 text-center pt-2">Simulating High Engagement + Glitch</p>
              </div>
            </>
          ))}
        </section>

        {renderDivider()}

        {/* 8. User Profile */}
        <section className={cardClasses}>
          <SectionHeader title="User Profile" icon={User} sectionKey="profile" />
          {renderSectionContent('profile', (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Age</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  value={age}
                  onChange={(e) => onAgeChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 block">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => onSexChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SEX_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </section>

        {renderDivider()}

        {/* 9. Playback & Timing */}
        <section className={cardClasses}>
          <SectionHeader title="Playback & Timing" icon={Clock} sectionKey="playback" />
          {renderSectionContent('playback', (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Conversation Mode</label>
                <button
                  onClick={() => onConversationModeChange(!conversationMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${conversationMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${conversationMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, segments play automatically. When disabled, use manual navigation.
              </p>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-700">Message Interval</label>
                  <span className="text-sm text-slate-500">{messageInterval}s</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="1"
                  value={messageInterval}
                  onChange={(e) => onMessageIntervalChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-xs text-slate-500">
                  Duration each segment is visible before transitioning (10-60s).
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
