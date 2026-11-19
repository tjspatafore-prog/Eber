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

export interface StoreData {
  profile: UserProfile;
  flashcards: Flashcard[];
  imageCacheIndex: Record<string, string>;
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getSettings: () =>
    req<{ settings: SettingsData; keys: KeyStatusMap; cacheStats: { cachedImages: number; cachedAudio: number } }>(
      '/api/settings'
    ),

  saveSettings: (payload: { settings?: Partial<SettingsData>; keys?: Record<string, string> }) =>
    req<{ ok: boolean; settings: SettingsData; keys: KeyStatusMap }>('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  testProvider: (provider: string) =>
    req<{ ok: boolean; message: string }>('/api/settings/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    }),

  getStore: () => req<StoreData>('/api/store'),

  completeLesson: (lessonId: string, xpGain = 25) =>
    req<{ profile: UserProfile }>('/api/progress/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, xpGain }),
    }),

  toggleLetterMastery: (letterId: string, mastered: boolean) =>
    req<{ profile: UserProfile }>('/api/progress/letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letterId, mastered }),
    }),

  markPassageRead: (passageId: string) =>
    req<{ profile: UserProfile }>('/api/progress/passage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passageId }),
    }),

  upsertFlashcard: (card: Partial<Flashcard>) =>
    req<{ flashcards: Flashcard[] }>('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    }),

  reviewFlashcard: (id: string, quality: 1 | 2 | 3 | 4) =>
    req<{ card: Flashcard; profile: UserProfile }>(`/api/flashcards/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality }),
    }),

  deleteFlashcard: (id: string) =>
    req<{ flashcards: Flashcard[] }>(`/api/flashcards/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  chat: (messages: { role: 'user' | 'assistant'; content: string }[], provider?: string) =>
    req<{ text: string; provider: string; model: string }>('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  analyzePassage: (payload: { reference?: string; hebrewText?: string; provider?: string }) =>
    req<{ text: string; provider: string; model: string }>('/api/ai/analyze-passage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  generateImage: (payload: {
    concept: string;
    hebrew?: string;
    pictograph?: string;
    styleHint?: string;
    forceRegenerate?: boolean;
  }) =>
    req<{ imageUrl: string; cached: boolean; provider: string }>('/api/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),

  transcribeHebrew: async (audioBlob: Blob, targetHebrew = '', keyterms: string[] = []) => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
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

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play spoken Hebrew: tries AI TTS (Gemini/OpenAI, cached on disk) and seamlessly falls back
 * to the browser's built-in Hebrew Web Speech API if no TTS key is configured yet.
 */
export async function speakHebrew(
  text: string,
  options: { mode?: 'biblical' | 'modern'; slow?: boolean } = {}
): Promise<{ usedProvider: string }> {
  const { mode = 'biblical', slow = false } = options;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    const res = await fetch('/api/speech/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode, slow }),
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

  // Free browser fallback
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

/**
 * Convert square Hebrew letters into approximate Paleo-Hebrew / Phoenician Unicode glyphs
 * for visual script comparison with ancient inscriptions & Qumran Paleo-Hebrew manuscripts.
 */
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
