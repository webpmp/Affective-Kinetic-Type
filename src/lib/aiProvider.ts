// AI Provider type definitions, LM Studio connection & generation utilities

export type AIProvider =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-pro'
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-3.5-flash'
  | 'lm-studio'
  | 'offline';

export interface AIProviderOption {
  id: AIProvider;
  label: string;
  group: 'Gemini' | 'Local' | 'Simulation';
}

export const AI_PROVIDERS: AIProviderOption[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', group: 'Gemini' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', group: 'Gemini' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', group: 'Gemini' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', group: 'Gemini' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', group: 'Gemini' },
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
}> {
  const url = config.url.replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const jsonSchema = `{"thinking":"string","segments":[{"text":"string","scale":"normal|large|small|oversized|massive","alignment":"center|left|right","fontVariant":"string"}],"keywords":[{"word":"string"}],"motionStyle":"string","bgPrompt":"string","baseTheme":"string","bgAnimationType":"string","particleDensity":5,"weatherOverlay":"none","weatherEffect":"none","contextualEffect":{"type":"none","subject":"none","imageUrl":"none","animation":"none","placement":"none"}}`;

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

  console.log('[LM Studio] Sending request to', `${url}/v1/chat/completions`, 'with body:', body);

  const response = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

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
  const rawContent = data?.choices?.[0]?.message?.content || '';

  console.log('[LM Studio] Raw response:', rawContent);

  // Robustly extract JSON: try multiple strategies
  const tryParseJSON = (str: string): any | null => {
    if (!str.trim()) return null;
    // Strategy 1: direct parse
    try { return JSON.parse(str.trim()); } catch {}
    // Strategy 2: strip markdown code fences anywhere in the string
    const fenceMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) { try { return JSON.parse(fenceMatch[1].trim()); } catch {} }
    // Strategy 3: extract first {...} block
    const braceStart = str.indexOf('{');
    const braceEnd = str.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd > braceStart) {
      try { return JSON.parse(str.slice(braceStart, braceEnd + 1)); } catch {}
    }
    return null;
  };

  const result = tryParseJSON(rawContent);

  if (result) {
    const segments = result.segments?.length
      ? result.segments
      : [{ text: result.thinking || rawContent || 'No response', scale: 'normal', alignment: 'center', fontVariant: 'Inter' }];
    return {
      text: segments.map((s: any) => typeof s === 'string' ? s : s.text).join(' '),
      segments,
      keywords: result.keywords || [],
      thinking: result.thinking || '',
      motionStyle: result.motionStyle || 'default',
      bgPrompt: result.bgPrompt || 'beautiful landscape, realistic, 8k',
      weatherEffect: result.weatherEffect || 'none',
      baseTheme: result.baseTheme || 'Minimalist',
      bgAnimationType: result.bgAnimationType || 'none',
      particleDensity: result.particleDensity || 5,
      weatherOverlay: result.weatherOverlay || 'none',
      contextualEffect: result.contextualEffect || { type: 'none', subject: 'none', imageUrl: 'none', animation: 'none', placement: 'none' },
    };
  }

  // Final fallback: return raw content as plain text segment
  console.warn('[LM Studio] Could not parse JSON from response, using raw text fallback');
  const fallbackText = rawContent || 'No response received from LM Studio.';
  return {
    text: fallbackText,
    segments: [{ text: fallbackText, scale: 'normal', alignment: 'center', fontVariant: 'Inter' }],
    keywords: [],
    thinking: `LM Studio response could not be parsed as JSON. Raw response: ${rawContent.slice(0, 200)}`,
    motionStyle: 'default',
    bgPrompt: 'beautiful landscape, realistic, 8k',
    weatherEffect: 'none',
    baseTheme: 'Minimalist',
    bgAnimationType: 'none',
    particleDensity: 5,
    weatherOverlay: 'none',
    contextualEffect: { type: 'none', subject: 'none', imageUrl: 'none', animation: 'none', placement: 'none' },
  };
}
