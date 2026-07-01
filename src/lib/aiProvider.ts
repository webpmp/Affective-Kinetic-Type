// AI Provider type definitions, LM Studio connection & generation utilities
import { validateResponseText, segmentText } from './communicationModel';

export type AIProvider =
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.0-flash'
  | 'gemini-2.5-flash'
  | 'gemini-3.5-flash'
  | 'gemini-2.5-pro'
  | 'lm-studio'
  | 'offline';

export interface AIProviderOption {
  id: AIProvider;
  label: string;
  group: 'Gemini' | 'Local' | 'Simulation';
}

export const AI_PROVIDERS: AIProviderOption[] = [
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', group: 'Gemini' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', group: 'Gemini' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', group: 'Gemini' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', group: 'Gemini' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', group: 'Gemini' },
  { id: 'lm-studio', label: 'LM Studio', group: 'Local' },
  { id: 'offline', label: 'Offline Mode', group: 'Simulation' },
];

export const AI_PROVIDER_GROUPS = ['Gemini', 'Local', 'Simulation'] as const;

export interface LMStudioConfig {
  url: string;
  modelId: string;
  apiKey: string;
}

export const DEFAULT_LM_STUDIO_CONFIG: LMStudioConfig = {
  url: 'http://localhost:1234',
  modelId: '',
  apiKey: '',
};

const LM_STUDIO_STORAGE_KEY = 'lm-studio-config';

export function loadLMStudioConfig(): LMStudioConfig {
  try {
    const stored = localStorage.getItem(LM_STUDIO_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_LM_STUDIO_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_LM_STUDIO_CONFIG };
}

export function saveLMStudioConfig(config: LMStudioConfig): void {
  localStorage.setItem(LM_STUDIO_STORAGE_KEY, JSON.stringify(config));
}

export async function testLMStudioConnection(config: LMStudioConfig): Promise<{ ok: boolean; error?: string; models?: string[] }> {
  try {
    const url = config.url.replace(/\/+$/, '');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    const response = await fetch(`${url}/v1/models`, { headers, signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      return { ok: false, error: `Server responded with ${response.status}: ${response.statusText}` };
    }
    const data = await response.json();
    const models = data?.data?.map((m: any) => m.id) || [];
    return { ok: true, models };
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { ok: false, error: 'Connection timed out. Is LM Studio running with the server enabled?' };
    }
    return { ok: false, error: `Could not connect: ${err.message || 'Unknown error'}` };
  }
}

export async function generateLMStudioResponse(
  config: LMStudioConfig,
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<{
  text: string;
  segments: any[];
  keywords: any[];
  thinking: string;
  motionStyle: string;
  bgPrompt: string;
  weatherEffect: string;
  baseTheme: string;
  bgAnimationType: string;
  particleDensity: number;
  weatherOverlay: string;
  contextualEffect: any;
  followUpQuestion: string | null;
}> {
  const url = config.url.replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const jsonSchema = `{"thinking":"string","text":"string","segments":[{"text":"string","scale":"normal|large|small|oversized|massive","alignment":"center|left|right","fontVariant":"string"}],"keywords":[{"word":"string","semanticRole":"string"}],"motionStyle":"string","bgPrompt":"string","baseTheme":"string","bgAnimationType":"string","particleDensity":5,"weatherOverlay":"none","weatherEffect":"none","contextualEffect":{"type":"none","subject":"none","imageUrl":"none","animation":"none","placement":"none"},"followUpQuestion":"string|null"}`;

  const chatMessages = [
    {
      role: 'system',
      content: systemPrompt + `\n\nRESPONSE FORMAT: You MUST output ONLY a raw JSON object — no prose, no markdown, no explanation, no code fences. The JSON must match this schema exactly:\n${jsonSchema}`
    },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const body: any = {
    messages: chatMessages,
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: 'text' },
  };
  if (config.modelId) {
    body.model = config.modelId;
  }

  // --- DIAGNOSTICS: PHASE 1 REQUEST LOGGING ---
  console.group('[LM Studio Diagnostics] Request Details');
  console.log('API Endpoint:', `${url}/v1/chat/completions`);
  console.log('Model ID Configured:', config.modelId || 'Default / Not Specified');
  console.log('Request Payload Body:', JSON.stringify(body, null, 2));
  console.log('Complete System Prompt String:', systemPrompt);
  console.log('Messages Array Sent:', JSON.stringify(chatMessages, null, 2));
  console.groupEnd();

  const requestStartTime = performance.now();

  const response = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const firstByteTime = performance.now();

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let errMessage = errText || response.statusText;
    try {
      const errJson = JSON.parse(errText);
      if (errJson?.error?.message) errMessage = errJson.error.message;
      else if (errJson?.message) errMessage = errJson.message;
    } catch { /* not JSON, use raw text */ }
    throw new Error(errMessage);
  }

  const data = await response.json();
  const responseEndTime = performance.now();
  const rawContent = data?.choices?.[0]?.message?.content || '';

  // --- DIAGNOSTICS: PHASE 1 RESPONSE LOGGING ---
  console.group('[LM Studio Diagnostics] Response Details');
  console.log('Raw Response JSON Payload:', JSON.stringify(data, null, 2));
  console.log('Streaming Enabled:', body.stream || false);
  console.log('Request Timing (ms):', {
    totalDuration: responseEndTime - requestStartTime,
    firstByteLatency: firstByteTime - requestStartTime,
    processingDuration: responseEndTime - firstByteTime
  });
  console.log('Response Metadata:', {
    finishReason: data?.choices?.[0]?.finish_reason || 'Unknown',
    usage: data?.usage || 'No usage object provided',
    promptTokens: data?.usage?.prompt_tokens,
    completionTokens: data?.usage?.completion_tokens,
    totalTokens: data?.usage?.total_tokens
  });
  console.log('Parsed Content Length (Characters):', rawContent.length);
  console.log('Final Assistant Content Passed to Pipeline:', rawContent);
  console.groupEnd();

  const unescapeText = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  };

  const tryParseJSON = (str: string): any | null => {
    if (!str.trim()) return null;
    
    const normalizeParsedObject = (obj: any): any | null => {
      if (!obj || typeof obj !== 'object') return null;
      const res = { ...obj };
      if (!res.text) {
        res.text = res.response || res.message || res.content || '';
      }
      return res;
    };

    // 1. Direct parse
    try {
      const parsed = JSON.parse(str.trim());
      const normalized = normalizeParsedObject(parsed);
      if (normalized) return normalized;
    } catch {}
    
    // 2. Scan braces
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      let idx = firstBrace;
      while (idx !== -1 && idx < lastBrace) {
        const candidate = str.slice(idx, lastBrace + 1);
        try {
          const parsed = JSON.parse(candidate);
          const normalized = normalizeParsedObject(parsed);
          if (normalized) return normalized;
        } catch {}
        idx = str.indexOf('{', idx + 1);
      }
      
      let rIdx = lastBrace;
      while (rIdx !== -1 && rIdx > firstBrace) {
        const candidate = str.slice(firstBrace, rIdx + 1);
        try {
          const parsed = JSON.parse(candidate);
          const normalized = normalizeParsedObject(parsed);
          if (normalized) return normalized;
        } catch {}
        rIdx = str.lastIndexOf('}', rIdx - 1);
      }
    }
    
    // 3. Strip code fences
    const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      try {
        const parsed = JSON.parse(fenceMatch[1].trim());
        const normalized = normalizeParsedObject(parsed);
        if (normalized) return normalized;
      } catch {}
    }
    
    return null;
  };

  const result = tryParseJSON(rawContent);

  if (result) {
    const rawText = result.text || (result.segments || []).map((s: any) => typeof s === 'string' ? s : s.text).join("");
    const responseText = unescapeText(rawText);
    const rawSegments = (result.segments || []).map((s: any) => {
      if (typeof s === 'string') {
        return { text: unescapeText(s) };
      } else {
        return { 
          ...s, 
          text: unescapeText(s.text || ''),
          fontVariant: s.fontVariant ? unescapeText(s.fontVariant) : undefined
        };
      }
    });
    const finalSegments = segmentText(responseText, rawSegments);
    return {
      text: responseText,
      segments: finalSegments,
      keywords: (result.keywords || []).map((kw: any) => ({
        word: unescapeText(kw.word || ''),
        semanticRole: unescapeText(kw.semanticRole || '')
      })),
      thinking: unescapeText(result.thinking || ''),
      motionStyle: unescapeText(result.motionStyle || 'default'),
      bgPrompt: unescapeText(result.bgPrompt || 'beautiful landscape, realistic, 8k'),
      weatherEffect: unescapeText(result.weatherEffect || 'none'),
      baseTheme: unescapeText(result.baseTheme || 'Minimalist'),
      bgAnimationType: unescapeText(result.bgAnimationType || 'none'),
      particleDensity: result.particleDensity || 5,
      weatherOverlay: unescapeText(result.weatherOverlay || 'none'),
      contextualEffect: result.contextualEffect || { type: 'none', subject: 'none', imageUrl: 'none', animation: 'none', placement: 'none' },
      followUpQuestion: result.followUpQuestion ? unescapeText(result.followUpQuestion) : null
    };
  }

  // Final fallback: Extract segments via regex instead of showing raw JSON text
  console.warn('[LM Studio] Could not parse JSON from response, attempting regex recovery');
  let recoveredSegments: any[] = [];
  
  const hasBraces = rawContent.includes('{') && rawContent.includes('}');
  if (!hasBraces) {
    const cleanProse = unescapeText(rawContent.trim());
    recoveredSegments.push({
      text: cleanProse,
      scale: "normal",
      alignment: "center",
      fontVariant: "Inter"
    });
  } else {
    const textSegmentRegex = /"text"\s*:\s*"([^"]+)"/g;
    let match;
    while ((match = textSegmentRegex.exec(rawContent)) !== null) {
      recoveredSegments.push({
        text: unescapeText(match[1]),
        scale: "normal",
        alignment: "center",
        fontVariant: "Inter"
      });
    }

    if (recoveredSegments.length === 0) {
      const cleanProse = rawContent
        .replace(/\{[\s\S]*\}/g, "") 
        .replace(/"[^"]+"\s*:\s*"[^"]*"/g, "") 
        .replace(/[{}["\]]+/g, "") 
        .trim();
      recoveredSegments.push({
        text: unescapeText(cleanProse) || "I received your message but encountered a formatting issue. Let's try again.",
        scale: "normal",
        alignment: "center",
        fontVariant: "Inter"
      });
    }
  }

  const responseText = recoveredSegments.map(s => s.text).join("");
  const finalSegments = segmentText(responseText, recoveredSegments);

  const thinkingMatch = rawContent.match(/"thinking"\s*:\s*"([^"]+)"/);
  const recoveredThinking = thinkingMatch 
    ? unescapeText(thinkingMatch[1]) 
    : "The local model returned a response that had formatting issues, but the system successfully recovered the text segments.";

  return {
    text: responseText,
    segments: finalSegments,
    keywords: [],
    thinking: recoveredThinking,
    motionStyle: 'default',
    bgPrompt: 'beautiful landscape, realistic, 8k',
    weatherEffect: 'none',
    baseTheme: 'Minimalist',
    bgAnimationType: 'none',
    particleDensity: 5,
    weatherOverlay: 'none',
    contextualEffect: { type: 'none', subject: 'none', imageUrl: 'none', animation: 'none', placement: 'none' },
    followUpQuestion: null
  };
}
