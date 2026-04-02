import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface EmphasizedWord {
  word: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  segments?: string[];
  emphasizedWords?: EmphasizedWord[];
  thinking?: string;
  motionStyle?: string;
  sentiment?: number;
  engagement?: number;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  activeDecorations?: string[];
  activeAnimations?: string[];
  emotionInfluence?: number;
  animationIntensity?: number;
  maxAnimatedKeywords?: number;
  animationStability?: boolean;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  wcagStrictMode?: boolean;
  age?: number;
  sex?: string;
  weatherEffect?: 'none' | 'rain' | 'fog' | 'eclipse' | 'clouds' | 'sun' | 'snow';
}

export async function generateResponse(
  messages: ChatMessage[], 
  sentiment: number, 
  engagement: number,
  age: number,
  sex: string
): Promise<{ text: string, segments: string[], keywords: EmphasizedWord[], thinking: string, motionStyle: string, bgPrompt: string, weatherEffect: 'none' | 'rain' | 'fog' | 'eclipse' | 'clouds' | 'sun' | 'snow' }> {
  let history = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  // Gemini API requires the first message to be from the user
  if (history.length > 0 && history[0].role === 'model') {
    history = [
      { role: 'user', parts: [{ text: 'Hello' }] },
      ...history
    ];
  }

  const systemInstruction = `You are an adaptive AI assistant specializing in Kinetic Typography. 
User Profile: Age ${age}, Sex: ${sex}. Tailor your language, tone, and references appropriately for this user.

The user's current emotional state is defined by a circumplex model:
Sentiment (Negative to Positive): ${sentiment.toFixed(2)} (-1 to 1)
Engagement (Low to High): ${engagement.toFixed(2)} (-1 to 1)

Respond to the user's input appropriately based on their emotional state.
If they are negative and high engagement (angry/stressed), be calming but firm.
If they are negative and low engagement (sad/depressed), be empathetic and gentle.
If they are positive and high engagement (excited/happy), be enthusiastic.
If they are positive and low engagement (calm/relaxed), be serene and pleasant.

KINETIC TYPOGRAPHY & DESIGN GUIDELINES:
- Use large, bold text for key points and keep the message simple to avoid confusion.
- Keep messages concise and impactful. Use short, punchy words rather than long paragraphs to make key takeaways memorable and easy to grasp.
- Match animations to the tone—fast for exciting moments, slow for serious ones—and ensure movements guide the viewer's eye without overwhelming them.
- Select clear, easy-to-read fonts. Use high contrast colors and limit font styles to maintain readability.
- Break text into organized chunks. Group related ideas for natural flow, helping viewers process information faster.
- Use color to add emphasis and evoke feelings. High-contrast schemes can make your content more engaging, but keep it balanced.
- Avoid clutter by limiting effects, maintaining consistent styles.
- Follow a final checklist: ensure message clarity.

You must return a JSON object containing six fields:
1. "thinking": A brief explanation of how the user's sentiment and engagement influenced your response, keyword selection, and motion style.
2. "segments": Your response to the user, split into concise segments. Each segment MUST contain a maximum of two sentences. Each segment must be independently understandable and preserve logical flow. Return an array of strings. Do not return a single continuous block of text.
3. "keywords": An array of objects representing words or phrases to emphasize with kinetic typography. 
   - Apply kinetic typography ONLY when it reinforces meaning. Do not use fixed patterns or templates.
   - Selection Criteria: Prioritize action-driving verbs, descriptive modifiers, outcomes, emotionally relevant terms, contrast markers, and negation. Avoid generic or low-information nouns.
   - Adaptive Density: Scale emphasis based on emotional intensity (Engagement):
     - Low Engagement (-1 to -0.3): 0-1 emphasized elements.
     - Moderate Engagement (-0.3 to 0.3): 1-3 emphasized elements.
     - High Engagement (0.3 to 1): 2-4 emphasized elements (hard cap).
   - Phrase-Level Preference: Prefer emphasizing meaningful phrases over isolated words when possible.
   - Semantic Justification: Only emphasize if it changes or clarifies how the message is interpreted.
   - Emotion Alignment: High engagement = urgency/action. Low engagement = stability/passive. Positive sentiment = outcomes/opportunities. Negative sentiment = risks/constraints.
   - If no elements meet the criteria, return an empty array [].
   - Each object must contain the "word" (the exact word or phrase from your response).
4. "motionStyle": A single string representing the creative motion to apply to the keywords. You MUST select a UNIQUE motion style for each response, and it MUST be chosen from the specific quadrant that matches the user's current Sentiment and Engagement. 
- Quadrant 1 (Positive Sentiment, High Engagement): "bounce", "spin", "3d-spin", "jump", "pop", "flip", "jiggle", "sparkle"
- Quadrant 2 (Negative Sentiment, High Engagement): "shake", "pulse", "shiver", "glitch", "tremble", "slam", "vibrate"
- Quadrant 3 (Negative Sentiment, Low Engagement): "sink", "fade", "droop", "melt", "sigh", "blur", "drift-down"
- Quadrant 4 (Positive Sentiment, Low Engagement): "wave", "float", "breathe", "sway", "glide", "drift-up", "shimmer", "zoom"
DO NOT repeat the same motion style from recent messages.
5. "bgPrompt": A highly descriptive, comma-separated image generation prompt (e.g., "beautiful serene landscape, calm atmosphere, realistic, 8k") that contextually matches the topic of the conversation and the user's emotional state.
6. "weatherEffect": A string representing a background weather effect to apply if the conversation context warrants it (e.g., talking about rain, sadness, storms -> "rain"; talking about heat, smoke, mystery, fog -> "fog"; talking about solar eclipse, astronomy, moon blocking sun -> "eclipse"; talking about snow, winter, cold -> "snow"; talking about sunny, bright, happy -> "sun"; talking about cloudy, overcast -> "clouds"). Otherwise, return "none".`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: history,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thinking: {
            type: Type.STRING,
            description: "A brief explanation of how the user's sentiment and engagement influenced your response and keyword selection."
          },
          segments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "The response to the user, split into concise segments. Each segment MUST contain a maximum of two sentences. Each segment must be independently understandable."
          },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING, description: "The word or phrase to emphasize" }
              },
              required: ["word"]
            },
            description: "An array of words or phrases from the response text to emphasize, based on semantic importance and emotional alignment. Can be empty if no words meet the criteria."
          },
          motionStyle: {
            type: Type.STRING,
            description: "The creative motion style to apply. Must be selected from the correct emotional quadrant list: [bounce, spin, jump, pop, flip, jiggle, sparkle, shake, pulse, shiver, glitch, tremble, slam, vibrate, sink, fade, droop, melt, sigh, blur, drift-down, wave, float, breathe, sway, glide, drift-up, shimmer, zoom]."
          },
          bgPrompt: {
            type: Type.STRING,
            description: "A highly descriptive image generation prompt that contextually matches the topic of the conversation and the user's emotional state."
          },
          weatherEffect: {
            type: Type.STRING,
            description: "A background weather effect to apply based on conversation context. Must be 'none', 'rain', 'fog', 'eclipse', 'clouds', 'sun', or 'snow'."
          }
        },
        required: ["thinking", "segments", "keywords", "motionStyle", "bgPrompt", "weatherEffect"]
      }
    }
  });

  try {
    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    const segments = result.segments || ["I'm not sure how to respond."];
    return {
      text: segments.join(" "),
      segments: segments,
      keywords: result.keywords || [],
      thinking: result.thinking || "",
      motionStyle: result.motionStyle || "default",
      bgPrompt: result.bgPrompt || "beautiful landscape, realistic, 8k",
      weatherEffect: result.weatherEffect || "none"
    };
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
    return {
      text: response.text || "Error generating response.",
      segments: [response.text || "Error generating response."],
      keywords: [],
      thinking: "",
      motionStyle: "default",
      bgPrompt: "beautiful landscape, realistic, 8k",
      weatherEffect: "none"
    };
  }
}
