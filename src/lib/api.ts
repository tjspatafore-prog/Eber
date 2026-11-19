import {
  getCachedBrowserImage,
  loadLocalJson,
  LS_KEYS,
  saveCachedBrowserImage,
  saveLocalJson,
} from './localCache';

export interface SettingsData {
  tutorProvider: 'gemini' | 'openai' | 'anthropic' | 'grok' | 'kimi' | 'qwen';
  tutorModels: Record<string, string>;
  imageProvider: 'gemini' | 'openai';
  imageModel: string;
  ttsProvider: 'gemini' | 'openai' | 'browser';
  ttsVoice: string;
  pronunciationStyle: 'dual' | 'biblical' | 'modern';
  showCantillation: boolean;
  showTransliteration: boolean;
}

export interface KeyStatusMap {
  [key: string]: {
    configured: boolean;
    masked: string;
    source?: 'server' | 'device' | 'none';
  };
}

export interface UserProfile {
  xp: number;
  streakDays: number;
  lastStudyDate: string;
  completedLessons: string[];
  masteredLetters: string[];
  readPassages: string[];
  speakingSessions: number;
}

export interface Flashcard {
  id: string;
  hebrew: string;
  transliteration: string;
  meaning: string;
  pictographNote: string;
  root: string;
  category: string;
  imageUrl?: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  dueAt: number;
}

export interface SavedLesson {
  id: string;
  title: string;
  lessonId?: string;
  prompt: string;
  content: string;
  provider?: string;
  model?: string;
  createdAt: number;
  updatedAt: number;
}

export interface StoreData {
  profile: UserProfile;
  flashcards: Flashcard[];
  savedLessons?: SavedLesson[];
  imageCacheIndex: Record<string, string>;
  deployment?: 'local' | 'vercel';
}

const HEADER_KEY_MAP: Record<string, string> = {
  DEEPGRAM_API_KEY: 'x-key-deepgram',
  GEMINI_API_KEY: 'x-key-gemini',
  OPENAI_API_KEY: 'x-key-openai',
  ANTHROPIC_API_KEY: 'x-key-anthropic',
  GROK_API_KEY: 'x-key-grok',
  KIMI_API_KEY: 'x-key-kimi',
  QWEN_API_KEY: 'x-key-qwen',
};

export function getDeviceApiKeys(): Record<string, string> {
  return loadLocalJson<Record<string, string>>(LS_KEYS.DEVICE_API_KEYS, {});
}

export function saveDeviceApiKeys(updates: Record<string, string>): void {
  const current = getDeviceApiKeys();
  for (const [k, v] of Object.entries(updates)) {
    const trimmed = (v || '').trim();
    if (trimmed.includes('••••')) continue;
    if (trimmed === '') delete current[k];
    else current[k] = trimmed;
  }
  saveLocalJson(LS_KEYS.DEVICE_API_KEYS, current);
}

export function getAccessPin(): string {
  return localStorage.getItem(LS_KEYS.ACCESS_PIN) || '';
}

export function saveAccessPin(pin: string): void {
  if (!pin.trim()) localStorage.removeItem(LS_KEYS.ACCESS_PIN);
  else localStorage.setItem(LS_KEYS.ACCESS_PIN, pin.trim());
}

function sanitizeHeaderValue(val: string): string {
  // Strip newlines, control characters, and non-Latin1 chars so browser fetch() never throws on headers
  return val.replace(/[^\x20-\x7E]/g, '').trim();
}

function buildAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const pin = sanitizeHeaderValue(getAccessPin());
  if (pin) headers['x-access-pin'] = pin;

  const deviceKeys = getDeviceApiKeys();
  for (const [envKey, headerName] of Object.entries(HEADER_KEY_MAP)) {
    const clean = sanitizeHeaderValue(deviceKeys[envKey] || '');
    if (clean) {
      headers[headerName] = clean;
    }
  }

  const localSettings = loadLocalJson<SettingsData | null>(LS_KEYS.SETTINGS, null);
  if (localSettings) {
    headers['x-eber-settings'] = sanitizeHeaderValue(JSON.stringify(localSettings));
  }
  return headers;
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const baseHeaders = buildAuthHeaders(isFormData ? {} : { 'Content-Type': 'application/json' });
  const mergedHeaders = {
    ...baseHeaders,
    ...((init?.headers as Record<string, string>) || {}),
  };

  let res: Response;
  try {
    res = await fetch(url, { ...init, credentials: 'include', headers: mergedHeaders });
  } catch (err: any) {
    throw new Error(
      `Could not reach ${url} (${err?.message || 'Failed to fetch'}). If you are on Vercel, refresh the page to ensure Vercel Authentication is active (or disable Vercel SSO for Production and use APP_ACCESS_PIN instead).`
    );
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(
      'Vercel Authentication intercepted the API request and returned a login page. Refresh the page to sign in, or switch Vercel Deployment Protection to Preview-only (and protect your keys with APP_ACCESS_PIN).'
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getSettings: () =>
    req<{
      deployment: 'local' | 'vercel';
      pinProtected: boolean;
      settings: SettingsData;
      keys: KeyStatusMap;
      cacheStats: { cachedImages: number; cachedAudio: number };
    }>('/api/settings'),

  saveSettings: (payload: { settings?: Partial<SettingsData>; keys?: Record<string, string> }) =>
    req<{ ok: boolean; deployment: 'local' | 'vercel'; settings: SettingsData; keys: KeyStatusMap }>('/api/settings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  testProvider: (provider: string) =>
    req<{ ok: boolean; message: string }>('/api/settings/test', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),

  listGeminiModels: () =>
    req<{ models: { id: string; displayName: string }[] }>('/api/ai/models'),

  getStore: () => req<StoreData>('/api/store'),

  completeLesson: (lessonId: string, xpGain = 25) =>
    req<{ profile: UserProfile }>('/api/progress/lesson', {
      method: 'POST',
      body: JSON.stringify({ lessonId, xpGain }),
    }),

  toggleLetterMastery: (letterId: string, mastered: boolean) =>
    req<{ profile: UserProfile }>('/api/progress/letter', {
      method: 'POST',
      body: JSON.stringify({ letterId, mastered }),
    }),

  markPassageRead: (passageId: string) =>
    req<{ profile: UserProfile }>('/api/progress/passage', {
      method: 'POST',
      body: JSON.stringify({ passageId }),
    }),

  upsertFlashcard: (card: Partial<Flashcard>) =>
    req<{ flashcards: Flashcard[] }>('/api/flashcards', {
      method: 'POST',
      body: JSON.stringify(card),
    }),

  reviewFlashcard: (id: string, quality: 1 | 2 | 3 | 4) =>
    req<{ card: Flashcard; profile: UserProfile }>(`/api/flashcards/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    }),

  deleteFlashcard: (id: string) =>
    req<{ flashcards: Flashcard[] }>(`/api/flashcards/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  upsertSavedLesson: (lesson: Partial<SavedLesson>) =>
    req<{ savedLessons: SavedLesson[] }>('/api/saved-lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    }),

  deleteSavedLesson: (id: string) =>
    req<{ savedLessons: SavedLesson[] }>(`/api/saved-lessons/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  chat: (messages: { role: 'user' | 'assistant'; content: string }[], provider?: string) =>
    req<{ text: string; provider: string; model: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, provider }),
    }),

  conversation: (payload: {
    history: { role: 'user' | 'assistant'; content: string }[];
    scenario: string;
    userHebrew: string;
    track: 'modern' | 'biblical';
    provider?: string;
  }) =>
    req<{
      hebrew: string;
      transliteration: string;
      english: string;
      coaching: string;
      biblicalRootLink: string;
      provider: string;
      model: string;
    }>('/api/ai/conversation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzePassage: (payload: { reference?: string; hebrewText?: string; provider?: string }) =>
    req<{ text: string; provider: string; model: string }>('/api/ai/analyze-passage', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  generateImage: async (payload: {
    concept: string;
    hebrew?: string;
    pictograph?: string;
    styleHint?: string;
    forceRegenerate?: boolean;
  }) => {
    const cacheKey = `${payload.concept}|${payload.hebrew || ''}`;
    if (!payload.forceRegenerate) {
      const browserCached = await getCachedBrowserImage(cacheKey);
      if (browserCached) {
        return { imageUrl: browserCached, cached: true, provider: 'browser-cache' };
      }
    }
    const res = await req<{ imageUrl: string; cached: boolean; provider: string }>('/api/ai/image', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.imageUrl) {
      await saveCachedBrowserImage(cacheKey, res.imageUrl);
    }
    return res;
  },

  transcribeHebrew: async (audioBlob: Blob, targetHebrew = '', keyterms: string[] = []) => {
    const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
    const form = new FormData();
    form.append('audio', audioBlob, `recording.${ext}`);
    form.append('targetHebrew', targetHebrew);
    if (keyterms.length > 0) form.append('keyterms', keyterms.join(','));
    return req<{
      transcript: string;
      confidence: number;
      matchScore: number | null;
      wordComparison: { word: string; matched: boolean }[];
    }>('/api/speech/transcribe', {
      method: 'POST',
      body: form,
    });
  },
};

/**
 * Picks an iOS Safari + Android Chrome + Desktop compatible audio MIME type for MediaRecorder.
 */
export function getPreferredAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play spoken Hebrew: tries AI TTS (Gemini/OpenAI) with device/server keys,
 * and falls back seamlessly to the browser's built-in Hebrew Web Speech API.
 */
export async function speakHebrew(
  text: string,
  options: { mode?: 'biblical' | 'modern' | 'syllable'; slow?: boolean; phoneticHint?: string } = {}
): Promise<{ usedProvider: string }> {
  const { mode = 'biblical', slow = false, phoneticHint = '' } = options;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    const res = await fetch('/api/speech/tts', {
      method: 'POST',
      credentials: 'include',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ text, mode, slow, phoneticHint }),
    });
    const data = await res.json();
    if (res.ok && data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      currentAudio = audio;
      await audio.play();
      return { usedProvider: data.provider || 'ai' };
    }
  } catch {
    // fall through to Web Speech API
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'he-IL';
    utter.rate = slow ? 0.72 : 0.94;
    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find((v) => v.lang.toLowerCase().startsWith('he'));
    if (heVoice) utter.voice = heVoice;
    window.speechSynthesis.speak(utter);
    return { usedProvider: 'browser-tts' };
  }

  return { usedProvider: 'none' };
}

const SQUARE_TO_PALEO: Record<string, string> = {
  א: '𐤀',
  ב: '𐤁',
  ג: '𐤂',
  ד: '𐤃',
  ה: '𐤄',
  ו: '𐤅',
  ז: '𐤆',
  ח: '𐤇',
  ט: '𐤈',
  י: '𐤉',
  כ: '𐤊',
  ך: '𐤊',
  ל: '𐤋',
  מ: '𐤌',
  ם: '𐤌',
  נ: '𐤍',
  ן: '𐤍',
  ס: '𐤎',
  ע: '𐤏',
  פ: '𐤐',
  ף: '𐤐',
  צ: '𐤑',
  ץ: '𐤑',
  ק: '𐤒',
  ר: '𐤓',
  ש: '𐤔',
  ת: '𐤕',
};

export function toPaleoHebrew(text: string): string {
  const stripped = text.replace(/[\u0591-\u05C7]/g, '');
  let out = '';
  for (const ch of stripped) {
    out += SQUARE_TO_PALEO[ch] ?? ch;
  }
  return out;
}
