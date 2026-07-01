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
  activeDecorations?: string[];
  activeAnimations?: string[];
  emotionInfluence?: number;
  animationIntensity?: number;
  animatedWordLimit?: number;
  fontWeightDefault?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  trackingDefault?: number;
  textCaseDefault?: 'auto' | 'sentence' | 'title' | 'uppercase';
  alignmentDefault?: 'auto' | 'left' | 'center' | 'right';
  textContrastDefault?: 'auto' | 'light' | 'dark';
  contrastEnhancement?: number;
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
  followUpQuestion?: string | null;
}

export async function generateResponse(
  messages: ChatMessage[], 
  sentiment: number, 
  engagement: number,
  age: number,
  gender: string,
  enabledFonts: string[],
  model: string = 'gemini-2.0-flash-lite',
  wcagLevel: 'A' | 'AA' | 'AAA' = 'A',
  animatedWordLimit: number = 8
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
  contextualEffect?: ContextualEffect,
  followUpQuestion: string | null
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
${animatedWordLimit === 0 ? "Do not highlight any words for animation." : `Highlight no more than ${animatedWordLimit} words for animation.`}
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

CONDITIONAL FOLLOW-UP QUESTION RULES:
The default behavior is no follow-up (return empty string or null in followUpQuestion).
Only generate a follow-up question when it materially advances the user’s current task.
Trigger Conditions (Generate ONLY if at least one is true):
- The user’s request is incomplete or open-ended by nature.
- The response produces multiple viable paths, decisions, or configurations.
- Additional clarification would significantly improve precision or usefulness.
- The user explicitly requests iterative refinement, expansion, or comparison.
- The output contains structured options that require selection or prioritization.
Do NOT generate follow-ups when:
- The response is informational or explanatory and complete.
- The task has a clear endpoint and no meaningful branching.
- The user intent is satisfied by a single coherent output.
- The system is summarizing, defining, or describing without actionable next steps.
Follow-Up Construction:
- It must be tightly scoped to the current context.
- It must introduce a concrete next action (e.g. "Compare these options by cost or performance?" or "Prioritize speed or accuracy for the next iteration?"), not a generic continuation.
- It must not repeat or paraphrase the completed response.
- It must avoid conversational filler (e.g., "Would you like to know more?", "Is there anything else?").
- It must be optional in tone, not directive or demanding.

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

You must return a JSON object containing twelve fields:
1. "thinking": A brief explanation of how the user's latent emotional state influenced your response structure, affective rendering, and visual pacing.
2. "text": The complete, single string of the response. This is the source of truth, fully formed, and grammatically correct. It MUST contain the complete user-facing response with nothing omitted (e.g., all steps, ingredients, explanations, and details must be present here).
3. "segments": A list of objects representing visual subdivisions of the "text" field for rendering purposes. The combined text of all segments must equal the "text" field. They must never omit information or introduce new information that is not already present in the "text" field.
4. "keywords": An array of objects representing semantic spans or phrases to style.
5. "motionStyle": A single string representing the creative motion to apply to the keywords.
6. "bgPrompt": A highly descriptive image generation prompt.
7. "baseTheme": The primary visual aesthetic category.
8. "bgAnimationType": A generative background scene matching the semantics.
9. "particleDensity": A number from 1 to 10.
10. "weatherOverlay": Environmental Sub-States or specific weather overlay.
11. "weatherEffect": (Legacy mapping) A string representing a legacy background scene.
12. "followUpQuestion": A tightly scoped follow-up question. This must only be generated after the user’s request has been completely answered. It must never be used to defer requested content or continue an incomplete response.`;

  // --- DIAGNOSTICS: PHASE 1 REQUEST LOGGING (Gemini) ---
  console.group('[Gemini Diagnostics] Request Details');
  console.log('Model ID Configured:', model);
  console.log('Complete System Prompt String:', systemInstruction);
  console.log('History Array Sent:', JSON.stringify(history, null, 2));
  console.groupEnd();

  let attempts = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(`Calling Gemini API (Attempt ${attempt}/${attempts}) with model '${model}'...`);
    const requestStartTime = performance.now();
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
                description: "The complete, single string of the response. This is the source of truth, fully formed and grammatically correct. It MUST contain the complete user-facing response with nothing omitted (e.g. all steps, ingredients, explanations, and details must be present here)."
              },
              segments: {
                type: Type.ARRAY,
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "The textual content of this segment" },
                    scale: { type: Type.STRING, description: "Typographic scale: small, normal, large, oversized, massive" },
                    alignment: { type: Type.STRING, description: "Spatial placement: left, center, right, justify" },
                    fontVariant: { type: Type.STRING, description: "The exact font value string from the available fonts list" }
                  },
                  required: ["text"]
                },
                description: "A list of objects representing visual subdivisions of the text field for rendering purposes. The combined text of all segments must equal the text field. They must never omit information or introduce new information that is not already present in the text field."
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
              },
              followUpQuestion: {
                type: Type.STRING,
                description: "A tightly scoped follow-up question. This must only be generated after the user’s request has been completely answered. It must never be used to defer requested content or continue an incomplete response."
              }
            },
            required: ["thinking", "text", "segments", "keywords", "motionStyle", "bgPrompt", "weatherEffect", "baseTheme", "bgAnimationType", "particleDensity", "weatherOverlay", "contextualEffect", "followUpQuestion"]
          }
        }
      });

      const responseEndTime = performance.now();
      const jsonStr = response.text?.trim() || "{}";
      const result = JSON.parse(jsonStr);

      const responseText = result.text || (result.segments || []).map((s: any) => typeof s === 'string' ? s : s.text).join("");

      // --- DIAGNOSTICS: PHASE 1 RESPONSE LOGGING (Gemini) ---
      console.group('[Gemini Diagnostics] Response Details');
      console.log('Raw Response JSON Payload String:', jsonStr);
      console.log('Parsed Response Object:', result);
      console.log('Request Duration (ms):', responseEndTime - requestStartTime);
      console.log('Response Metadata:', {
        candidates: response.candidates,
        usageMetadata: response.usageMetadata
      });
      console.log('Parsed Content Length (Characters):', jsonStr.length);
      console.log('Final Assistant Content Passed to Pipeline:', responseText);
      console.groupEnd();

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
        contextualEffect: result.contextualEffect || { type: "none", subject: "none", imageUrl: "none", animation: "none", placement: "none" },
        followUpQuestion: result.followUpQuestion || null
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
