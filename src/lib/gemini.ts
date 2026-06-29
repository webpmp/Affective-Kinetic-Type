import { GoogleGenAI, Type } from "@google/genai";

const rawApiKey = process.env.GEMINI_API_KEY || "";
const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();
console.log("[Affective Kinetic Type] Gemini API Key loaded:", apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)} (length: ${apiKey.length})` : "EMPTY");
if (!apiKey) {
  console.error("[Affective Kinetic Type] WARNING: Gemini API Key is missing or empty! Make sure GEMINI_API_KEY is defined in your environment or .env file.");
}

const ai = new GoogleGenAI({ apiKey });


export interface EmphasizedWord {
  word: string;
}

export interface TextSegment {
  text: string;
  scale?: "small" | "normal" | "large" | "oversized" | "massive";
  alignment?: "left" | "center" | "right" | "justify";
  fontVariant?: string;
}

export interface ContextualEffect {
  type: 'none' | 'sport' | 'location' | 'other';
  subject: string;
  imageUrl?: string;
  animation?: 'none' | 'roll' | 'float' | 'bounce' | 'slide';
  placement?: 'background' | 'bottom-right' | 'top-right' | 'left-side' | 'right-side' | 'floating' | 'none';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  segments?: TextSegment[];
  emphasizedWords?: EmphasizedWord[];
  thinking?: string;
  motionStyle?: string;
  sentiment?: number;
  engagement?: number;
  fontSize?: number;
  fontFamily?: string;
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
  gender?: string;
  weatherEffect?: 'none' | 'rain' | 'fog' | 'eclipse' | 'clouds' | 'sun' | 'snow' | 'confetti' | 'floral' | 'data-stream';
  baseTheme?: string;
  bgAnimationType?: string;
  particleDensity?: number;
  weatherOverlay?: string;
  contextualEffect?: ContextualEffect;
}

export async function generateResponse(
  messages: ChatMessage[], 
  sentiment: number, 
  engagement: number,
  age: number,
  gender: string,
  enabledFonts: string[],
  model: string = 'gemini-2.0-flash-lite'
): Promise<{ 
  text: string, 
  segments: TextSegment[], 
  keywords: EmphasizedWord[], 
  thinking: string, 
  motionStyle: string, 
  bgPrompt: string, 
  weatherEffect: 'none' | 'rain' | 'fog' | 'eclipse' | 'clouds' | 'sun' | 'snow' | 'confetti' | 'floral' | 'data-stream',
  baseTheme: string,
  bgAnimationType: string,
  particleDensity: number,
  weatherOverlay: string,
  contextualEffect?: ContextualEffect
}> {
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

  const systemInstruction = `You are an adaptive AI assistant specializing in Kinetic Typography and editorial composition. 
User Profile: Age ${age}, Gender: ${gender}. Tailor your language, tone, and references appropriately for this user.

The user's current emotional state is defined by a circumplex model:
Sentiment (Negative to Positive): ${sentiment.toFixed(2)} (-1 to 1)
Engagement (Low to High): ${engagement.toFixed(2)} (-1 to 1)

CRITICAL: The user may select and resubmit a message from their conversation history. You MUST ignore the sentiment, tone, and kinetic formatting of any duplicate or similar historical messages in the conversation log, and strictly generate a fresh response matching the CURRENT Sentiment and Engagement values specified above.

EMPHASIS PRIORITY RULES:
Prioritize emphasis for:
1. emotionally charged words
2. visually evocative nouns
3. experiential phrases
4. strong adjectives
5. unusual terminology
6. culturally significant references
7. atmospheric descriptors
8. narrative anchors

Avoid emphasizing filler words, articles, connectors, grammatical scaffolding, or generic auxiliary verbs (like "The", "And", "But", "A", "It") unless intentionally used for rhythm, irony, cinematic pacing, or title-card composition.

PHRASE-LEVEL EMPHASIS:
Prefer emphasizing meaningful PHRASES (e.g. "sheer scale", "electric silence") instead of isolated words. The emphasis system should feel designed and cinematic, not randomly formatted. Before emphasizing, ask yourself: Is this semantically meaningful? Is it emotionally resonant? Would a human art director intentionally emphasize this? If no, do not emphasize it.

TYPOGRAPHY & FONTS:
You must compose layout like an AI art director. The available fonts you can use in "fontVariant" are: [${enabledFonts.join(', ')}].
Use 2-4 font families per response. Intelligently pair compatible fonts. Do not use random fonts. Make your typography reflect the emotion (e.g. condensed for urgency, serif for nostalgia).

Respond to the user's input appropriately based on their emotional state.
If they are negative and high engagement (angry/stressed), be calming but firm.
If they are negative and low engagement (sad/depressed), be empathetic and gentle.
If they are positive and high engagement (excited/happy), be enthusiastic.
If they are positive and low engagement (calm/relaxed), be serene and pleasant.

AFFECTIVE RENDERING PRINCIPLES:
Emotion is not a visual theme. Emotion influences timing, pacing, structure, density, diffusion, compression, and visual pressure. Proactively infer latent emotional qualities from the user input (tension, uncertainty, exhaustion, relief, awe, intimacy, etc.) and translate these into kinetic properties.

RESPONSE VARIABILITY: Never render emphasis the same way repeatedly. Rotate between spatial emphasis, temporal emphasis, staggered reveals, asymmetrical composition, etc. Ensure the system feels stateful and continuous with affective persistence.

STRUCTURAL EXPRESSION: Emotion influences response structures. Possible variations include fragmented thoughts, cascaded structures, recursive corrections, staggered paragraphs, delayed completion.
TYPOGRAPHIC COMPOSITION AND SPATIAL LAYOUT: Compose responses like editorial layouts or cinematic title cards. Do NOT rely primarily on bold, underline, italics, or text decorations. Instead, use typographic contrast, scale shifts, spatial interruption, asymmetrical balance, oversized opening phrases, and staggered positioning. Vary font scale, weight, spacing, alignment, and rhythm to intelligently occupy the screen space instead of looking like a tiny centered chat block. Apply novelty bias to avoid repeating composition styles.

ENVIRONMENTAL SCENE SYNTHESIS & PRIORITY SYSTEM: 
Generate cohesive atmospheric scenes by inferring the PRIMARY CONVERSATIONAL SCENE. Do NOT use simple keyword triggers (like "summer" -> sunrise).
1. Semantic Prioritization: Priority order -> 1. Destinations/places, 2. People/relationships, 3. Activities/experiences, 4. Emotional conditions, 5. Objects, 6. Weather/time (LOWEST priority, avoid unless weather is the explicit subject).
2. Location Interpretation: For locations, prioritize emotional/atmospheric identity (e.g., Seattle -> "overcast cinematic glow, pine silhouettes", Italy -> "Mediterranean warmth, textured stone"). 
3. Scene Variety: Intentionally seek visual diversity. Rotate intelligently between environment categories: GEOGRAPHIC, CULTURAL, EMOTIONAL, CINEMATIC, ABSTRACT, MEMORY/ANTICIPATION. Deprioritize weather.

You must return a JSON object containing eleven fields:
1. "thinking": A brief explanation of how the user's latent emotional state influenced your response structure, affective rendering, and visual pacing.
2. "segments": A natural, conversational response to the user, split into expressive chunks (such as complete clauses or full sentences) to create a visual rhythm. Avoid returning isolated single-word tags or keyword labels; the combined segments MUST read together as a fully formed, coherent conversational reply. Return an array of objects. Each object must have:
   - "text": The textual content of the chunk.
   - "scale": Typographic scale ("small", "normal", "large", "oversized", "massive"). Use oversized/massive rarely, for high emotional impact.
   - "alignment": Spatial placement ("left", "center", "right", "justify"). Vary to create cascading or asymmetrical structures.
   - "fontVariant": Typographic pairing (MUST be one of the explicitly provided available fonts). Use font changes to signify shifts in tone.
3. "keywords": An array of objects representing words or phrases to emphasize.
   - Scale emphasis based on emotional intensity. Vary the selection (sometimes full phrases, sometimes single action-driving verbs).
   - Each object must contain the "word" (the exact word or phrase from your response).
4. "motionStyle": A single string representing the creative motion to apply to the keywords. Select a UNIQUE motion style for each response, matching the quadrant of Sentiment and Engagement. 
- Quadrant 1 (Pos, High Eng): "bounce", "spin", "3d-spin", "jump", "pop", "flip", "jiggle", "sparkle"
- Quadrant 2 (Neg, High Eng): "shake", "pulse", "shiver", "glitch", "tremble", "slam", "vibrate"
- Quadrant 3 (Neg, Low Eng): "sink", "fade", "droop", "melt", "sigh", "blur", "drift-down"
- Quadrant 4 (Pos, Low Eng): "wave", "float", "breathe", "sway", "glide", "drift-up", "shimmer", "zoom"
DO NOT repeat the same motion style iteratively.
5. "bgPrompt": A highly descriptive image generation prompt. DO NOT use generic stock-photo descriptions, literal tourist landmarks, or high-contrast weather unless specifically demanded. Compose for cinematic depth, low contrast, partial environmental fragments, layered atmosphere, and emotional identity based on the semantic priorities. Avoid cluttered collages and sharp edges.
6. "baseTheme": The primary visual aesthetic category. MUST be one of: Minimalist, Brutalist, Glassmorphism, Organic, Geometric, Atmospheric.
7. "bgAnimationType": A generative background scene matching the semantics. Do NOT feel like every response requires a background animation. Default to "none" unless highly relevant to the semantic context of the conversation. Select one from:
  [Geometric]: GridShift, Isostep, Crosshatch, Loom, Prism, Circuitry, Honeycomb, Blueprint, Ascent, Parallax_Planes.
  [Atmospheric]: Mist_Veil, Heat_Haze, Aurora, Drizzle, Blizzard, Tide, Eclipse, Solar_Flare, Petal_Drift, Static, Prism_Refraction.
  [Organic]: Blob_Morph, Mycelium, Diffusion, Swirl, Pulse_Core, Tendril, Caustic, Soft_Focus, Lava, Bloom, Bioluminescence.
  [Minimalist]: Dot_Matrix, Scanline, Flicker, Floaters, Breathing, Trace, Marquee, Strobe_Soft, Minimal_Vortex, Shadow_Play, Golden_Hour, Halo.
  [High-Energy]: Confetti_Pop, Streamers, Pyrotechnic, Glitch, Hyperdrive, Bounce_Ball, Radiance, ZigZag, Pixel_Rain, Kaleidoscope.
  Or "none". Make sure it aligns with the Standardized Design Theme.
  ANTI-REPETITION PROTOCOL: Do NOT repeat the same bgAnimationType in back-to-back responses. Cycle through at least 5 variants. If "none", you may repeat it.
8. "particleDensity": A number from 1 to 10 based on environment intensity.
9. "weatherOverlay": Environmental Sub-States / Time of Day to change the vibe. Do NOT feel like every interaction requires an overlay. Choose wisely based on semantic context, otherwise return "none". (e.g., return "eclipse" ONLY if eclipses, moons, deep solar shadows, or celestial alignment are explicitly relevant to the user's text; return "rain" only if wet weather, storm, or sadness/depression is explicitly discussed). Choose from: "Pre-Dawn", "Overcast", "High-Noon", "rain", "fog", "snow", "eclipse", "sun", "clouds". Otherwise, "none".
10. "weatherEffect": (Legacy mapping) A string representing a legacy background scene. Otherwise, return "none".
11. "contextualEffect": An object identifying any specific sport, location, or distinctive topic mentioned, enabling custom interactive overlay cards or watermarks:
   - "type": MUST be 'sport' (if user mentions sports or specific ball games), 'location' (if user mentions cities/countries/landmarks), 'other' (if other physical topics like cat, dog, food, music are mentioned), or 'none'.
   - "subject": The specific subject mentioned, lowercase (e.g., 'soccer', 'tennis', 'london', 'paris', 'tokyo', 'basketball', 'cat'). If none, return 'none'.
   - "imageUrl": A highly specific image prompt to generate a transparent or white background illustration or high-quality styled sticker/icon representing the subject. For locations, make it a descriptive photo cue like "Eiffel tower, vintage travel illustration" or "Big Ben silhouette icon, minimalist white vector, transparent background". For sports, make it an icon cue like "tennis racket and tennis ball flat vector graphic, transparent background". If none, return 'none'.
   - "animation": MUST be 'roll' (for sports with round balls like soccer, tennis, basketball), 'float' (for locations or static objects), 'bounce', 'slide', or 'none'. MUST NOT be 'none' if a sport or location is identified.
   - "placement": MUST be 'background' (faint silhouette landmark watermarks behind text), 'bottom-right' (as a beautiful corner Polaroid travel stamp/badge), or 'none'. CRITICAL: If a sport is identified, placement MUST be 'bottom-right'. If a location is identified, placement MUST be 'bottom-right' or 'background'. NEVER return 'none' for placement or animation if a sport or location is successfully identified.`;

  console.log(`Calling Gemini API with model '${model}'...`);
  console.log("History sent to Gemini:", history);
  
  let response;
  try {
    response = await ai.models.generateContent({
      model: model,
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
              items: { 
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The textual content" },
                  scale: { type: Type.STRING, description: "Typographic scale: small, normal, large, oversized, massive" },
                  alignment: { type: Type.STRING, description: "Spatial placement: left, center, right, justify" },
                  fontVariant: { type: Type.STRING, description: "The exact font value string from the available fonts list" }
                },
                required: ["text"]
              },
              description: "The response to the user, split into expressive textual chunks with typographic styling parameters."
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
            baseTheme: {
              type: Type.STRING,
              description: "The primary visual aesthetic category. Must be one of: Minimalist, Brutalist, Glassmorphism, Organic, Geometric, Atmospheric."
            },
            bgAnimationType: {
              type: Type.STRING,
              description: "The generative background scene. Do NOT apply randomly. Return 'none' unless highly relevant to the semantic context of the conversation (e.g., 'GridShift', 'Confetti_Pop', 'Golden_Hour', 'Mist_Veil', 'none')."
            },
            particleDensity: {
              type: Type.NUMBER,
              description: "A value from 1 to 10."
            },
            weatherOverlay: {
              type: Type.STRING,
              description: "Environmental Sub-States or specific weather overlay. Return 'none' unless highly relevant to the semantic context of the conversation (e.g., 'eclipse' ONLY if eclipses/moons are explicitly relevant to user text). Choose from: 'Pre-Dawn', 'Overcast', 'High-Noon', 'none', 'rain', 'fog', 'snow', 'eclipse', 'sun', 'clouds'."
            },
            weatherEffect: {
              type: Type.STRING,
              description: "Legacy generative background scene to apply based on conversation context. Must be 'none', 'rain', 'fog', 'eclipse', 'clouds', 'sun', 'snow', 'confetti', 'floral', 'data-stream'."
            },
            contextualEffect: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Categorize the semantic theme of the conversation: 'sport', 'location', 'other', or 'none'."
                },
                subject: {
                  type: Type.STRING,
                  description: "The specific sport, location, or other subject. Return 'none' if none."
                },
                imageUrl: {
                  type: Type.STRING,
                  description: "Highly specific image prompt for a transparent or white background illustration representing the subject. Return 'none' if none."
                },
                animation: {
                  type: Type.STRING,
                  description: "Animation style: 'roll', 'float', 'bounce', 'slide', or 'none'."
                },
                placement: {
                  type: Type.STRING,
                  description: "Placement: 'background', 'bottom-right', or 'none'."
                }
              },
              required: ["type", "subject", "imageUrl", "animation", "placement"]
            }
          },
          required: ["thinking", "segments", "keywords", "motionStyle", "bgPrompt", "weatherEffect", "baseTheme", "bgAnimationType", "particleDensity", "weatherOverlay", "contextualEffect"]
        }
      }
    });
    console.log("Gemini API response received:", response);
  } catch (apiError) {
    console.error("Gemini API call threw an error:", apiError);
    throw apiError;
  }

  let jsonStr = "";
  try {
    jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr);
    const segments = result.segments || ["I'm not sure how to respond."];
    return {
      text: segments.map((s: any) => typeof s === 'string' ? s : s.text).join(" "),
      segments: segments,
      keywords: result.keywords || [],
      thinking: result.thinking || "",
      motionStyle: result.motionStyle || "default",
      bgPrompt: result.bgPrompt || "beautiful landscape, realistic, 8k",
      weatherEffect: result.weatherEffect || "none",
      baseTheme: result.baseTheme || "Minimalist",
      bgAnimationType: result.bgAnimationType || "none",
      particleDensity: result.particleDensity || 5,
      weatherOverlay: result.weatherOverlay || "none",
      contextualEffect: result.contextualEffect || { type: "none", subject: "none", imageUrl: "none", animation: "none", placement: "none" }
    };
  } catch (e) {
    console.error("Failed to parse JSON response, attempting robust recovery:", e);
    
    // Try to extract segments via regex
    let recoveredSegments: TextSegment[] = [];
    const textSegmentRegex = /"text"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = textSegmentRegex.exec(jsonStr)) !== null) {
      recoveredSegments.push({
        text: match[1],
        scale: "normal",
        alignment: "center",
        fontVariant: enabledFonts[0] || "Inter"
      });
    }

    if (recoveredSegments.length === 0) {
      // Try to strip everything except prose
      const cleanProse = jsonStr
        .replace(/\{[\s\S]*\}/g, "") // remove brackets
        .replace(/"[^"]+"\s*:\s*"[^"]*"/g, "") // remove KV pairs
        .replace(/[{}["\]]+/g, "") // remove remaining JSON structures
        .trim();
      recoveredSegments.push({
        text: cleanProse || "I received your message but encountered a formatting issue. Let's try again.",
        scale: "normal",
        alignment: "center",
        fontVariant: enabledFonts[0] || "Inter"
      });
    }

    return {
      text: recoveredSegments.map(s => s.text).join(" "),
      segments: recoveredSegments,
      keywords: [],
      thinking: "The response was returned with minor formatting errors, which the system automatically recovered.",
      motionStyle: "default",
      bgPrompt: "beautiful landscape, realistic, 8k",
      weatherEffect: "none",
      baseTheme: "Minimalist",
      bgAnimationType: "none",
      particleDensity: 5,
      weatherOverlay: "none",
      contextualEffect: { type: "none", subject: "none", imageUrl: "none", animation: "none", placement: "none" }
    };
  }
}
