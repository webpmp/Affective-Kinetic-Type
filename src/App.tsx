import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ChatArea } from './components/ChatArea';
import { ChatMessage, generateResponse } from './lib/gemini';
import { DECORATION_POOL } from './lib/decorations';
import { ANIMATION_POOL } from './lib/animations';
import { FONTS } from './lib/fonts';
import { LayoutTemplate, Maximize2, List } from 'lucide-react';

export default function App() {
  const [sentiment, setSentiment] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [enabledFonts, setEnabledFonts] = useState<string[]>([
    FONTS.find(f => f.name === 'Inter')?.name || 'Inter',
    FONTS.find(f => f.name === 'Playfair Display')?.name || 'Playfair Display',
    FONTS.find(f => f.name === 'JetBrains Mono')?.name || 'JetBrains Mono'
  ]);
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState('#ffffff');
  
  // New State
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState('Neutral');
  const [activeDecorations, setActiveDecorations] = useState<string[]>(
    DECORATION_POOL.map(d => d.id).filter(id => !id.startsWith('lt-') && id !== 'ts-sharp')
  );
  
  const [activeAnimations, setActiveAnimations] = useState<string[]>(ANIMATION_POOL.map(a => a.id));
  const [emotionInfluence, setEmotionInfluence] = useState(1.0);
  const [animationIntensity, setAnimationIntensity] = useState(1.0);
  const [maxAnimatedKeywords, setMaxAnimatedKeywords] = useState(3);
  const [animationStability, setAnimationStability] = useState(true);
  const [wcagLevel, setWcagLevel] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [wcagStrictMode, setWcagStrictMode] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'side' | 'right-side' | 'stacked' | 'below' | 'hidden'>('below');
  const [viewMode, setViewMode] = useState<'threaded' | 'focus'>('threaded');
  const [conversationMode, setConversationMode] = useState(true);
  const [messageInterval, setMessageInterval] = useState(13);
  const [bgPrompt, setBgPrompt] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'image' | 'gradient'>('gradient');
  const [gradientColor1, setGradientColor1] = useState('#EC4646');
  const [gradientColor2, setGradientColor2] = useState('#2432ff');
  const [gradientDirection, setGradientDirection] = useState('135deg');
  const [weatherContext, setWeatherContext] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model. You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?",
      segments: [
        { text: "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model.", scale: "large", alignment: "center", fontVariant: "Playfair Display" },
        { text: "You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?", scale: "normal", alignment: "center", fontVariant: "Inter" }
      ],
      sentiment: 0,
      engagement: 0,
      fontSize: 24,
      fontColor: '#ffffff',
      age: 30,
      sex: 'Neutral'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Immediate state updates for typography
  useEffect(() => {
    setMessages(prev => {
      const newMessages = [...prev];
      let lastAiIndex = -1;
      for (let i = newMessages.length - 1; i >= 0; i--) {
        if (newMessages[i].role === 'assistant') {
          lastAiIndex = i;
          break;
        }
      }
      if (lastAiIndex !== -1) {
        newMessages[lastAiIndex] = {
          ...newMessages[lastAiIndex],
          fontSize,
          fontColor
        };
      }
      return newMessages;
    });
  }, [fontSize, fontColor]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const ipRes = await fetch('https://freeipapi.com/api/json');
        const ipData = await ipRes.json();
        const lat = ipData.latitude;
        const lon = ipData.longitude;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const weatherData = await weatherRes.json();
        const code = weatherData.current_weather.weathercode;
        const isDay = weatherData.current_weather.is_day;
        
        let condition = 'clear sky';
        if (code === 0) condition = 'clear sky';
        else if (code === 1 || code === 2) condition = 'partly cloudy sky';
        else if (code === 3) condition = 'overcast sky';
        else if (code >= 45 && code <= 48) condition = 'foggy sky';
        else if (code >= 51 && code <= 67) condition = 'rainy sky';
        else if (code >= 71 && code <= 77) condition = 'snowy sky';
        else if (code >= 80 && code <= 82) condition = 'rain showers sky';
        else if (code >= 85 && code <= 86) condition = 'snow showers sky';
        else if (code >= 95 && code <= 99) condition = 'thunderstorm sky';

        const timeStr = isDay ? 'daytime' : 'night';
        setWeatherContext(`${condition} ${timeStr}`);
      } catch (err) {
        // Silently fail if weather cannot be fetched (e.g. adblocker or network issue)
        setWeatherContext(null);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    if (bgType === 'image' && !bgPrompt) {
      setBgPrompt(`beautiful ${weatherContext || 'nature'} landscape, realistic, 8k`);
    }
  }, [bgType, weatherContext, bgPrompt]);

  const handleEmotionChange = (v: number, a: number) => {
    setSentiment(v);
    setEngagement(a);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model. You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?",
        segments: [
          { text: "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model.", scale: "large", alignment: "center", fontVariant: "Playfair Display" },
          { text: "You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?", scale: "normal", alignment: "center", fontVariant: "Inter" }
        ],
        sentiment: 0,
        engagement: 0,
        fontSize: 24,
        fontColor: '#ffffff',
        age: 30,
        sex: 'Neutral'
      }
    ]);
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: text,
      sentiment,
      engagement,
      fontSize,
      fontColor
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let aiText = "";
      let segments: any[] = [];
      let keywords: any[] = [];
      let thinking = "";
      let motionStyle = "default";
      let newBgPrompt = "";
      let weatherEffect: any = "none";
      let baseTheme = "Minimalist";
      let bgAnimationType = "none";
      let particleDensity = 5;
      let weatherOverlay = "none";
      let contextualEffect: any = { type: "none", subject: "none", imageUrl: "none", animation: "none", placement: "none" };

      if (isOfflineMode) {
        // Generate a rich, topic-aware simulated response instantly!
        await new Promise(resolve => setTimeout(resolve, 1200)); // simulate thinking latency
        const lower = text.toLowerCase();
        const hasWord = (...words: string[]) => 
          words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lower));
        
        let type: 'sport' | 'location' | 'other' | 'none' = 'none';
        let subject = 'none';
        let imageUrl = 'none';
        let animation: 'roll' | 'float' | 'bounce' | 'slide' | 'none' = 'none';
        let placement: 'background' | 'bottom-right' | 'none' = 'none';

        if (lower.includes('soccer') || lower.includes('football')) {
          type = 'sport';
          subject = lower.includes('soccer') ? 'soccer' : 'football';
          imageUrl = 'soccer ball flat minimalist vector graphic, transparent background';
          animation = 'roll';
          placement = 'bottom-right';
        } else if (lower.includes('basketball')) {
          type = 'sport';
          subject = 'basketball';
          imageUrl = 'orange basketball flat minimalist vector graphic, transparent background';
          animation = 'roll';
          placement = 'bottom-right';
        } else if (lower.includes('tennis')) {
          type = 'sport';
          subject = 'tennis';
          imageUrl = 'tennis ball flat minimalist vector graphic, transparent background';
          animation = 'roll';
          placement = 'bottom-right';
        } else if (lower.includes('baseball')) {
          type = 'sport';
          subject = 'baseball';
          imageUrl = 'baseball flat minimalist vector graphic, transparent background';
          animation = 'roll';
          placement = 'bottom-right';
        } else if (lower.includes('london') || lower.includes('big ben')) {
          type = 'location';
          subject = 'london';
          imageUrl = 'Big Ben clock tower silhouette vector, minimalist white, transparent background';
          animation = 'float';
          placement = 'background';
        } else if (lower.includes('paris') || lower.includes('eiffel')) {
          type = 'location';
          subject = 'paris';
          imageUrl = 'Eiffel tower silhouette vector, minimalist white, transparent background';
          animation = 'float';
          placement = 'background';
        } else if (lower.includes('tokyo') || lower.includes('fuji')) {
          type = 'location';
          subject = 'tokyo';
          imageUrl = 'Mount fuji minimalist art illustration, transparent background';
          animation = 'float';
          placement = 'background';
        } else if (hasWord('cat', 'cats', 'dog', 'dogs', 'pet', 'pets')) {
          type = 'other';
          subject = hasWord('cat', 'cats') ? 'cat' : 'dog';
          imageUrl = 'minimalist cute pet line art vector, transparent background';
          animation = 'bounce';
          placement = 'bottom-right';
        }

        const isPos = sentiment >= 0;
        const isHigh = engagement >= 0;

        if (type === 'sport') {
          aiText = `Ah, ${subject}! There is a pure, geometric energy to playing and strategizing. The bounce, the pace, the focus—it defines motion. Are you analyzing play tactics or hitting the court?`;
          segments = [
            { text: `Ah, ${subject}!`, scale: "large", alignment: "left", fontVariant: enabledFonts[0] || "Inter" },
            { text: "There is a pure, geometric energy to playing and strategizing.", scale: "normal", alignment: "center", fontVariant: enabledFonts[0] || "Inter" },
            { text: "The bounce, the pace, the focus—it defines motion.", scale: "oversized", alignment: "right", fontVariant: enabledFonts[0] || "Inter" }
          ];
          keywords = [
            { word: "geometric energy" },
            { word: "defines motion" }
          ];
          thinking = `Offline Simulation Mode: Generated rich response for sport topic '${subject}'.`;
          motionStyle = isHigh ? "bounce" : "sway";
          newBgPrompt = `Minimalist athletic concept with clean geometric lines and soft background shadows, 8k`;
          baseTheme = "Geometric";
        } else if (type === 'location') {
          aiText = `Traveling to ${subject} is an immersive experience. The architecture, the atmosphere, and the memories paint a scenic story. What draws you to visit this beautiful place?`;
          segments = [
            { text: `Traveling to ${subject}`, scale: "large", alignment: "left", fontVariant: enabledFonts[1] || "Playfair Display" },
            { text: "is an immersive experience.", scale: "normal", alignment: "left", fontVariant: enabledFonts[1] || "Playfair Display" },
            { text: "The architecture, the atmosphere, and the memories paint a scenic story.", scale: "normal", alignment: "center", fontVariant: enabledFonts[0] || "Inter" }
          ];
          keywords = [
            { word: "immersive experience" },
            { word: "scenic story" }
          ];
          thinking = `Offline Simulation Mode: Generated rich response for location '${subject}'.`;
          motionStyle = "float";
          newBgPrompt = `Poetic cinematically soft watercolor illustration of ${subject}, misty skies, low contrast`;
          baseTheme = "Atmospheric";
        } else {
          if (isPos && isHigh) {
            aiText = "That is absolutely fantastic! The vibrant energy and bright enthusiasm carry a clean, expanding rhythm. Let's keep this momentum going forward!";
            segments = [
              { text: "That is absolutely fantastic!", scale: "large", alignment: "center", fontVariant: enabledFonts[0] || "Inter" },
              { text: "The vibrant energy and bright enthusiasm carry a clean, expanding rhythm.", scale: "normal", alignment: "center", fontVariant: enabledFonts[0] || "Inter" }
            ];
            keywords = [{ word: "absolutely fantastic!" }, { word: "vibrant energy" }];
            motionStyle = "bounce";
            baseTheme = "Organic";
          } else if (!isPos && isHigh) {
            aiText = "I hear the tension and stress in your words. The visual pressure feels tight, staggered, and urgent. Let's slow down and find a steady ground together.";
            segments = [
              { text: "I hear the tension and stress in your words.", scale: "normal", alignment: "left", fontVariant: enabledFonts[2] || "JetBrains Mono" },
              { text: "The visual pressure feels tight, staggered, and urgent.", scale: "normal", alignment: "left", fontVariant: enabledFonts[2] || "JetBrains Mono" }
            ];
            keywords = [{ word: "visual pressure" }, { word: "tension and stress" }];
            motionStyle = "glitch";
            baseTheme = "Brutalist";
          } else if (!isPos && !isHigh) {
            aiText = "I sense a quiet, drifting weariness. The phrases sink slowly and gently, mirroring the quiet weight. Speak softly, and take all the time you need.";
            segments = [
              { text: "I sense a quiet, drifting weariness.", scale: "normal", alignment: "center", fontVariant: enabledFonts[1] || "Playfair Display" },
              { text: "Speak softly, and take all the time you need.", scale: "small", alignment: "center", fontVariant: enabledFonts[1] || "Playfair Display" }
            ];
            keywords = [{ word: "drifting weariness" }];
            motionStyle = "sink";
            baseTheme = "Atmospheric";
          } else {
            aiText = "A calm, peaceful silence surrounds us. The rhythm is smooth, breathing, and balanced. Let the words float gently in the golden light.";
            segments = [
              { text: "A calm, peaceful silence surrounds us.", scale: "large", alignment: "center", fontVariant: enabledFonts[1] || "Playfair Display" },
              { text: "Let the words float gently in the golden light.", scale: "normal", alignment: "center", fontVariant: enabledFonts[0] || "Inter" }
            ];
            keywords = [{ word: "peaceful silence" }];
            motionStyle = "breathe";
            baseTheme = "Minimalist";
          }
          thinking = `Offline Simulation Mode: Generated custom emotional response for sentiment: ${sentiment}, engagement: ${engagement}`;
        }

        // --- Context-Aware Visual Background Scene Selector ---
        // Ensure backgrounds are not applied randomly but reflect actual semantic conversation context!
        bgAnimationType = "none";
        weatherOverlay = "none";

        if (hasWord("eclipse", "space", "moon", "solar", "cosmic", "astronomy")) {
          bgAnimationType = "Scanline";
          weatherOverlay = "eclipse";
        } else if (hasWord("rain", "rainy", "raining", "rains", "drizzle", "drizzling", "storm", "stormy", "wet", "sad", "sadness", "sadly", "depressed", "depression", "depressing", "weariness", "weary")) {
          bgAnimationType = "Drizzle";
          weatherOverlay = "rain";
        } else if (hasWord("snow", "snowy", "snowing", "snowfall", "blizzard", "winter", "cold", "colder", "coldest", "freeze", "freezing", "frozen", "ice", "icy")) {
          bgAnimationType = "none";
          weatherOverlay = "snow";
        } else if (hasWord("fog", "foggy", "mist", "misty", "haze", "hazy", "obscure", "obscured")) {
          bgAnimationType = "Mist_Veil";
          weatherOverlay = "fog";
        } else if (hasWord("cloud", "clouds", "cloudy", "overcast", "gloomy", "gloom")) {
          bgAnimationType = "none";
          weatherOverlay = "clouds";
        } else if (hasWord("sun", "sunny", "sunshine", "summer", "bright", "brighter", "warm", "warmer", "warmth")) {
          bgAnimationType = "Golden_Hour";
          weatherOverlay = "sun";
        } else if (hasWord("celebrate", "celebrating", "celebration", "congratulate", "congratulations", "win", "winner", "winning", "wins", "success", "successful", "successfully", "fantastic", "yay", "hooray")) {
          bgAnimationType = "confetti";
          weatherOverlay = "none";
        } else if (hasWord("nature", "natural", "flower", "flowers", "garden", "gardens", "bloom", "blooming", "blooms", "spring", "petal", "petals")) {
          bgAnimationType = "blooming_petals";
          weatherOverlay = "none";
        } else if (hasWord("code", "coding", "codes", "data", "matrix", "computer", "computers", "digital", "tech", "technology", "technical", "terminal", "terminals")) {
          bgAnimationType = "data_grid";
          weatherOverlay = "none";
        } else if (hasWord("aurora", "auroras", "northern lights", "magic", "magical")) {
          bgAnimationType = "Aurora";
          weatherOverlay = "none";
        } else if (type === "sport") {
          bgAnimationType = "GridShift";
          weatherOverlay = "none";
        } else if (type === "location") {
          bgAnimationType = "Mist_Veil";
          weatherOverlay = "Overcast";
        }

        contextualEffect = { type, subject, imageUrl, animation, placement };
      } else {
        const response = await generateResponse(
          [...messages, userMessage], 
          sentiment, 
          engagement,
          age,
          sex,
          enabledFonts
        );
        aiText = response.text;
        segments = response.segments;
        keywords = response.keywords;
        thinking = response.thinking;
        motionStyle = response.motionStyle;
        newBgPrompt = response.bgPrompt;
        weatherEffect = response.weatherEffect;
        baseTheme = response.baseTheme;
        bgAnimationType = response.bgAnimationType;
        particleDensity = response.particleDensity;
        weatherOverlay = response.weatherOverlay;
        contextualEffect = response.contextualEffect;
      }

      if (newBgPrompt) {
        setBgPrompt(newBgPrompt);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiText,
        segments: segments,
        emphasizedWords: keywords,
        thinking: thinking,
        motionStyle: motionStyle,
        sentiment,
        engagement,
        fontSize,
        fontColor,
        activeDecorations,
        activeAnimations,
        emotionInfluence,
        animationIntensity,
        maxAnimatedKeywords,
        animationStability,
        wcagLevel,
        wcagStrictMode,
        age,
        sex,
        weatherEffect,
        baseTheme,
        bgAnimationType,
        particleDensity,
        weatherOverlay,
        contextualEffect
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error generating response:", error);
      const isRateLimit = error && (
        error.status === 429 || 
        (error.message && error.message.includes('429')) || 
        (error.message && error.message.toLowerCase().includes('quota')) ||
        (error.message && error.message.toLowerCase().includes('rate limit')) ||
        (error.message && error.message.toLowerCase().includes('resource_exhausted'))
      );

      const errorMessage = isRateLimit 
        ? "We are experiencing a temporary rush of thoughts! Please wait about 15-20 seconds before your next message so the AI can catch its breath. 🌬️"
        : "I'm sorry, I encountered an error processing your request.";

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        segments: [
          { 
            text: errorMessage, 
            scale: "large", 
            alignment: "center", 
            fontVariant: enabledFonts[0] || "Inter" 
          }
        ],
        emphasizedWords: isRateLimit ? [{ word: "rush of thoughts!" }] : [],
        thinking: "The API returned a rate limit (429) or other request error, showing fallback message.",
        motionStyle: "drift-down",
        sentiment: -0.3,
        engagement: -0.2,
        fontSize,
        fontColor: isRateLimit ? "#f43f5e" : fontColor,
        activeDecorations: [],
        activeAnimations: [],
        emotionInfluence,
        animationIntensity,
        maxAnimatedKeywords: 1,
        animationStability: true,
        wcagLevel,
        wcagStrictMode,
        age,
        sex,
        weatherEffect: "none",
        baseTheme: "Minimalist",
        bgAnimationType: "none",
        particleDensity: 2,
        weatherOverlay: "none",
        contextualEffect: {
          type: "none",
          subject: "none",
          imageUrl: "none",
          animation: "none",
          placement: "none"
        }
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleViewModeChange = async (newMode: 'threaded' | 'focus') => {
    setViewMode(newMode);
  };

  const renderControlPanel = (mode: typeof layoutMode) => (
    <ControlPanel
      layout={mode}
      sentiment={sentiment}
      engagement={engagement}
      onEmotionChange={handleEmotionChange}
      enabledFonts={enabledFonts}
      onEnabledFontsChange={setEnabledFonts}
      fontSize={fontSize}
      onFontSizeChange={setFontSize}
      fontColor={fontColor}
      onFontColorChange={setFontColor}
      age={age}
      onAgeChange={setAge}
      sex={sex}
      onSexChange={setSex}
      activeDecorations={activeDecorations}
      onActiveDecorationsChange={setActiveDecorations}
      activeAnimations={activeAnimations}
      onActiveAnimationsChange={setActiveAnimations}
      emotionInfluence={emotionInfluence}
      onEmotionInfluenceChange={setEmotionInfluence}
      animationIntensity={animationIntensity}
      onAnimationIntensityChange={setAnimationIntensity}
      maxAnimatedKeywords={maxAnimatedKeywords}
      onMaxAnimatedKeywordsChange={setMaxAnimatedKeywords}
      animationStability={animationStability}
      onAnimationStabilityChange={setAnimationStability}
      wcagLevel={wcagLevel}
      onWcagLevelChange={setWcagLevel}
      wcagStrictMode={wcagStrictMode}
      onWcagStrictModeChange={setWcagStrictMode}
      bgType={bgType}
      onBgTypeChange={setBgType}
      gradientColor1={gradientColor1}
      onGradientColor1Change={setGradientColor1}
      gradientColor2={gradientColor2}
      onGradientColor2Change={setGradientColor2}
      gradientDirection={gradientDirection}
      onGradientDirectionChange={setGradientDirection}
      conversationMode={conversationMode}
      onConversationModeChange={setConversationMode}
      messageInterval={messageInterval}
      onMessageIntervalChange={setMessageInterval}
      isOfflineMode={isOfflineMode}
      onOfflineModeChange={setIsOfflineMode}
    />
  );

  return (
    <div className="h-dvh bg-slate-100 flex flex-col font-sans text-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Kinetic Type Logo" 
            className="w-10 h-10 object-contain rounded-xl shadow-sm border border-slate-100" 
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Affective Kinetic Type</h1>
            <p className="text-sm text-slate-500 font-medium">Adaptive AI Communication Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(prev => prev === 'threaded' ? 'focus' : 'threaded')}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex flex-col items-center justify-center gap-1 min-w-[80px]"
            title={viewMode === 'threaded' ? 'Switch to Presentation Mode' : 'Switch to Designer Mode'}
          >
            {viewMode === 'threaded' ? (
              <Maximize2 className="w-5 h-5" />
            ) : (
              <List className="w-5 h-5" />
            )}
            <span className="text-[9px] font-bold tracking-wider uppercase leading-none mt-0.5">
              {viewMode === 'threaded' ? 'Presentation Mode' : 'Designer Mode'}
            </span>
          </button>
          <button
            onClick={() => setLayoutMode(prev => {
              if (prev === 'side') return 'right-side';
              if (prev === 'right-side') return 'stacked';
              if (prev === 'stacked') return 'below';
              if (prev === 'below') return 'hidden';
              return 'side';
            })}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all flex flex-col items-center justify-center gap-1 min-w-[80px]"
            title="Toggle Layout"
          >
            <LayoutTemplate className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wider uppercase leading-none mt-0.5">
              Toggle Layout
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 p-6 flex gap-6 overflow-hidden z-10 ${(layoutMode === 'side' || layoutMode === 'right-side') ? 'flex-row' : 'flex-col'}`}>
        {/* Control Panel (Left Sidebar / Stacked Top) */}
        {viewMode !== 'focus' && (layoutMode === 'side' || layoutMode === 'stacked') && (
          <div className={layoutMode === 'stacked' ? 'w-full h-[320px] shrink-0' : 'w-80 shrink-0 h-full'}>
            {renderControlPanel(layoutMode)}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            isTyping={isTyping}
            bgPrompt={bgPrompt}
            bgType={bgType}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientDirection={gradientDirection}
            viewMode={viewMode}
            conversationMode={conversationMode}
            messageInterval={messageInterval}
          />
        </div>

        {/* Control Panel (Right Sidebar) */}
        {viewMode !== 'focus' && layoutMode === 'right-side' && (
          <div className="w-80 shrink-0 h-full">
            {renderControlPanel(layoutMode)}
          </div>
        )}

        {/* Control Panel (Bottom) */}
        {viewMode !== 'focus' && layoutMode === 'below' && (
          <div className="w-full h-[320px] shrink-0">
            {renderControlPanel(layoutMode)}
          </div>
        )}
      </main>
      <footer className="bg-slate-100 py-2 text-center text-xs text-slate-500 border-t border-slate-200 shrink-0">
        &copy; 2026 Chris Adkins
      </footer>
    </div>
  );
}
