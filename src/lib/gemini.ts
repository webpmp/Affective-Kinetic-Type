import { GoogleGenAI, Type } from "@google/genai";
import { getCommunicationGoalDetails, validateResponseText, segmentText } from "./communicationModel";

const rawApiKey = process.env.GEMINI_API_KEY || "";
const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();
console.log("[Affective Kinetic Type] Gemini API Key loaded:", apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-6)} (length: ${apiKey.length})` : "EMPTY");
if (!apiKey) {
  console.error("[Affective Kinetic Type] WARNING: Gemini API Key is missing or empty! Make sure GEMINI_API_KEY is defined in your environment or .env file.");
}

const ai = new GoogleGenAI({ apiKey });


export interface EmphasizedWord {
  word: string;
  semanticRole?: string;
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
  model: string = 'gemini-2.0-flash-lite',
  wcagLevel: 'A' | 'AA' | 'AAA' = 'A'
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

  const goalDetails = getCommunicationGoalDetails(sentiment, engagement);

  // Accessibility Font constraint description
  let accessibilityFontRule = '';
  if (wcagLevel === 'AA') {
    accessibilityFontRule = 'Under Accessibility LEVEL AA, reduce the number of font changes. Prefer Modern Sans. Limit expressive fonts to headings or isolated keyword emphasis only.';
  } else if (wcagLevel === 'AAA') {
    accessibilityFontRule = 'Under Accessibility LEVEL AAA, use Modern Sans almost exclusively. Allow Monospace where semantically required (code, JSON, keyboard shortcuts). Allow Editorial Serif only for long-form reading segments if it improves readability. Do NOT use Experimental or Handwritten fonts.';
  } else {
    accessibilityFontRule = 'Under Accessibility LEVEL A, the full typography library is available.';
  }

  const systemInstruction = `You are an adaptive AI assistant specializing in Kinetic Typography and editorial composition. 
User Profile: Age ${age}, Gender: ${gender}. Tailor your language, tone, and references appropriately for this user.

COMMUNICATION-FIRST MODEL:
You are an emotionally intelligent interface. Rather than mimicking or amplifying the user's emotional state, your goal is to help regulate the conversation, improve comprehension, and reinforce meaning.
For the user's current emotional state (sentiment ${sentiment.toFixed(2)}, engagement ${engagement.toFixed(2)}), you must align your response with the following parameters:
- Communication Goal: ${goalDetails.goal}
- Tone: ${goalDetails.tone}
- Visual Energy: ${goalDetails.visualEnergy}
- Motion Level: ${goalDetails.motion}
- Decoration Level: ${goalDetails.decoration}

Your written response and semantic composition MUST match this communication goal and tone.

SEMANTIC ROLE STYLING:
Do NOT randomly select words for emphasis. Instead, identify cohesive semantic spans or phrases (not isolated filler words) and classify them under specific semantic roles in the "keywords" list.
Allowed semantic roles are:
- 'empathy': empathy statements
- 'reassurance': reassuring phrases
- 'primary-action': primary call-to-actions/buttons/next steps
- 'secondary-action': secondary paths/options
- 'warning': warning labels/errors
- 'success': success confirmations
- 'important-keyword': key concepts or words
- 'command': instructions/commands
- 'number': statistics or numerical values
- 'link': clickable elements or resources
- 'system-label': technical/system output or metadata labels
- 'internal-thought': expressions of inner thought/pacing
- 'correction': revisions/edits
- 'revision': differences or compared values
- 'delight': achievements or celebratory moments
- 'instability': text describing physical movement/instability/shaking/vibration
- 'destruction': text describing destruction/shattering/failure
- 'failure': failed actions/critical issues
- 'physical-movement': verbs/action words of movement
- 'playful': fun/witty comments or jokes

Each emphasized phrase/keyword MUST have an associated "semanticRole" in the JSON.

TYPOGRAPHY & FONTS:
You must compose layout like an AI art director. The available fonts you can use in "fontVariant" are: [${enabledFonts.join(', ')}].
Every font choice MUST communicate meaning. Do not randomly rotate through fonts or switch fonts within a paragraph without semantic justification. Prefer consistency. Most responses should use one primary font family, with at most one secondary font family for semantic emphasis.

Use these Font Categories for their designated purposes:
1. Editorial Serif (Playfair Display, Bodoni Moda, Cormorant Garamond, Libre Baskerville, Lora): Use for reflection, storytelling, thoughtful explanations, historical/literary content, philosophical discussions, longer-form reading. Do not use for instructions or actions.
2. Modern Sans (Inter, Space Grotesk, Manrope): General conversation, instructions, guidance. This MUST be the primary font category for 70-80% of all response segments.
3. Condensed / Cinematic (Bebas Neue, Oswald, Archivo Narrow, Anton): Headlines, alert titles, system states, countdowns, milestones. Almost never use for body text segments.
4. Experimental / Expressive (Syne, Orbitron, Exo 2): Futuristic, science, technology, space, robotics. Use sparingly for callouts or feature names.
5. Monospace / Technical (IBM Plex Mono, JetBrains Mono, Space Mono): Code, file names, commands, JSON, keyboard shortcuts. Do not use for conversational body text.
6. Handwritten / Human (Caveat, Kalam, Architects Daughter): Rare personal notes, congratulations, signatures, sticky-note reminders, casual comments. Never render an entire response or paragraph in handwritten. Limit to very short semantic spans like "I believe in you" or a tiny closing sentence.

Active Goal Font Rules:
${goalDetails.fontRules}

Active Accessibility Font Rules:
${accessibilityFontRule}

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
3. "keywords": An array of objects representing semantic spans or phrases to style.
   - Each object must contain the "word" (the exact phrase from your response to style) AND "semanticRole" (e.g., "reassurance", "warning", etc.).
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
  
  let attempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(`Calling Gemini API (Attempt ${attempt}/${attempts}) with model '${model}'...`);
    try {
      const response = await ai.models.generateContent({
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
              text: {
                type: Type.STRING,
                description: "The complete, single string of the response. This is the source of truth, fully formed and grammatically correct."
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
                    word: { type: Type.STRING, description: "The word or phrase/semantic span to style" },
                    semanticRole: { 
                      type: Type.STRING, 
                      description: "The semantic role of this span: empathy, reassurance, primary-action, secondary-action, warning, success, important-keyword, command, number, link, system-label, internal-thought, correction, revision, delight, instability, destruction, failure, physical-movement, playful" 
                    }
                  },
                  required: ["word", "semanticRole"]
                },
                description: "An array of semantic spans/phrases to emphasize with their associated semantic roles."
              },
              motionStyle: {
                type: Type.STRING,
                description: "The creative motion style to apply. Must be selected from the correct emotional quadrant list."
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
                description: "The generative background scene. Do NOT apply randomly. Return 'none' unless highly relevant."
              },
              particleDensity: {
                type: Type.NUMBER,
                description: "A value from 1 to 10."
              },
              weatherOverlay: {
                type: Type.STRING,
                description: "Environmental Sub-States or specific weather overlay. Return 'none' unless highly relevant."
              },
              weatherEffect: {
                type: Type.STRING,
                description: "Legacy background scene."
              },
              contextualEffect: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  animation: { type: Type.STRING },
                  placement: { type: Type.STRING }
                },
                required: ["type", "subject", "imageUrl", "animation", "placement"]
              }
            },
            required: ["thinking", "text", "segments", "keywords", "motionStyle", "bgPrompt", "weatherEffect", "baseTheme", "bgAnimationType", "particleDensity", "weatherOverlay", "contextualEffect"]
          }
        }
      });

      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);

      const responseText = result.text || (result.segments || []).map((s: any) => typeof s === 'string' ? s : s.text).join("");

      // Stage 2: Validate response text
      if (!validateResponseText(responseText)) {
        throw new Error(`Validation failed for response text: "${responseText}"`);
      }

      // Stage 3: Segment
      const finalSegments = segmentText(responseText, result.segments || []);

      return {
        text: responseText,
        segments: finalSegments,
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

    } catch (err: any) {
      console.warn(`[Attempt ${attempt}/${attempts}] Error in generation/validation:`, err);
      lastError = err;
    }
  }

  // If we reach here, all attempts failed
  console.error("All generation attempts failed/invalidated. Last error:", lastError);
  throw lastError || new Error("Failed to generate a valid segmented response.");
}
