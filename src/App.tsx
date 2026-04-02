import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ChatArea } from './components/ChatArea';
import { ChatMessage, generateResponse } from './lib/gemini';
import { DECORATION_POOL } from './lib/decorations';
import { ANIMATION_POOL } from './lib/animations';
import { Activity, LayoutTemplate } from 'lucide-react';

export default function App() {
  const [sentiment, setSentiment] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [fontFamily, setFontFamily] = useState('"Inter", sans-serif');
  const [fontSize, setFontSize] = useState(16);
  const [fontColor, setFontColor] = useState('#ffffff');
  
  // New State
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState('Neutral');
  const [activeDecorations, setActiveDecorations] = useState<string[]>(
    DECORATION_POOL.map(d => d.id).filter(id => !['lt-solid', 'lt-wavy', 'ts-sharp', 'lt-red'].includes(id))
  );
  
  const [activeAnimations, setActiveAnimations] = useState<string[]>(ANIMATION_POOL.map(a => a.id));
  const [emotionInfluence, setEmotionInfluence] = useState(1.0);
  const [animationIntensity, setAnimationIntensity] = useState(1.0);
  const [maxAnimatedKeywords, setMaxAnimatedKeywords] = useState(3);
  const [animationStability, setAnimationStability] = useState(true);
  const [wcagLevel, setWcagLevel] = useState<'A' | 'AA' | 'AAA'>('AA');
  const [wcagStrictMode, setWcagStrictMode] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'side' | 'stacked'>('side');
  const [viewMode, setViewMode] = useState<'threaded' | 'focus'>('threaded');
  const [conversationMode, setConversationMode] = useState(true);
  const [messageInterval, setMessageInterval] = useState(13);
  const [bgPrompt, setBgPrompt] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'image' | 'gradient'>('gradient');
  const [gradientColor1, setGradientColor1] = useState('#ffffff');
  const [gradientColor2, setGradientColor2] = useState('#2432ff');
  const [gradientDirection, setGradientDirection] = useState('135deg');
  const [weatherContext, setWeatherContext] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model. You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?",
      segments: [
        "Hello. I’m your AI assistant. My responses and typography will adapt to the emotional state you select on the circumplex model.",
        "You can talk with me about almost anything, like questions, ideas, plans, or whatever is on your mind. What would you like to do right now?"
      ],
      sentiment: 0,
      engagement: 0,
      fontFamily: '"Inter", sans-serif',
      fontSize: 16,
      fontColor: '#ffffff',
      age: 30,
      sex: 'Neutral'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

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

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: text,
      sentiment,
      engagement,
      fontFamily,
      fontSize,
      fontColor
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const { text: aiText, segments, keywords, thinking, motionStyle, bgPrompt: newBgPrompt, weatherEffect } = await generateResponse(
        [...messages, userMessage], 
        sentiment, 
        engagement,
        age,
        sex
      );
      
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
        fontFamily,
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
        weatherEffect
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleViewModeChange = async (newMode: 'threaded' | 'focus') => {
    setViewMode(newMode);
    
    // Find the last user message to regenerate the response
    const lastUserIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserIndex !== -1) {
      // Keep messages up to the last user message
      const previousMessages = messages.slice(0, lastUserIndex + 1);
      setMessages(previousMessages);
      setIsTyping(true);

      try {
        const { text: aiText, segments, keywords, thinking, motionStyle, bgPrompt: newBgPrompt, weatherEffect } = await generateResponse(
          previousMessages, 
          sentiment, 
          engagement,
          age,
          sex
        );
        
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
          fontFamily,
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
          weatherEffect
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error generating response:", error);
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans text-slate-900 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Affective Kinetic Type</h1>
            <p className="text-sm text-slate-500 font-medium">Adaptive AI Communication Interface</p>
          </div>
        </div>
        <button
          onClick={() => setLayoutMode(prev => prev === 'side' ? 'stacked' : 'side')}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Toggle Layout"
        >
          <LayoutTemplate className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className={`flex-1 p-6 flex gap-6 overflow-hidden z-10 ${layoutMode === 'stacked' ? 'flex-col' : 'flex-row'}`}>
        {/* Control Panel */}
        {viewMode !== 'focus' && (
          <div className={layoutMode === 'stacked' ? 'w-full h-[320px] shrink-0' : 'w-80 shrink-0 h-full'}>
            <ControlPanel
              layout={layoutMode}
              sentiment={sentiment}
              engagement={engagement}
              onEmotionChange={handleEmotionChange}
              fontFamily={fontFamily}
              onFontFamilyChange={setFontFamily}
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
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            bgPrompt={bgPrompt}
            bgType={bgType}
            gradientColor1={gradientColor1}
            gradientColor2={gradientColor2}
            gradientDirection={gradientDirection}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            conversationMode={conversationMode}
            messageInterval={messageInterval}
          />
        </div>
      </main>
      <footer className="bg-slate-100 py-2 text-center text-xs text-slate-500 border-t border-slate-200 shrink-0">
        &copy; 2026 Chris Adkins
      </footer>
    </div>
  );
}
