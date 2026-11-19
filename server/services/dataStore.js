import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const STORE_PATH = path.join(ROOT_DIR, 'server', 'data', 'store.json');

const DEFAULT_STORE = {
  profile: {
    xp: 0,
    streakDays: 1,
    lastStudyDate: new Date().toISOString().slice(0, 10),
    completedLessons: [],
    masteredLetters: [],
    readPassages: [],
    speakingSessions: 0,
  },
  flashcards: [],
  imageCacheIndex: {},
  notes: [],
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readStore() {
  ensureDir(STORE_PATH);
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
    return structuredClone(DEFAULT_STORE);
  }
  try {
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    return {
      ...DEFAULT_STORE,
      ...raw,
      profile: {
        ...DEFAULT_STORE.profile,
        ...(raw.profile || {}),
      },
    };
  } catch {
    return structuredClone(DEFAULT_STORE);
  }
}

export function writeStore(data) {
  ensureDir(STORE_PATH);
  const tmpPath = `${STORE_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, STORE_PATH);
  return data;
}

export function updateProfile(mutator) {
  const store = readStore();
  const today = new Date().toISOString().slice(0, 10);
  if (store.profile.lastStudyDate !== today) {
    const prev = new Date(store.profile.lastStudyDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr - prev) / 86400000);
    store.profile.streakDays = diffDays === 1 ? store.profile.streakDays + 1 : 1;
    store.profile.lastStudyDate = today;
  }
  mutator(store.profile);
  writeStore(store);
  return store.profile;
}

export function upsertFlashcard(card) {
  const store = readStore();
  const idx = store.flashcards.findIndex((c) => c.id === card.id);
  const now = Date.now();
  if (idx >= 0) {
    store.flashcards[idx] = { ...store.flashcards[idx], ...card };
  } else {
    store.flashcards.push({
      id: card.id || `card_${now}_${Math.random().toString(36).slice(2, 7)}`,
      hebrew: card.hebrew,
      transliteration: card.transliteration || '',
      meaning: card.meaning || '',
      pictographNote: card.pictographNote || '',
      root: card.root || '',
      category: card.category || 'biblical',
      imageUrl: card.imageUrl || '',
      ease: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueAt: now,
      createdAt: now,
    });
  }
  writeStore(store);
  return store.flashcards;
}

export function reviewFlashcard(id, quality) {
  // SM-2 spaced repetition algorithm (quality: 1=Again, 2=Hard, 3=Good, 4=Easy -> mapped to 0..5)
  const qMap = { 1: 1, 2: 3, 3: 4, 4: 5 };
  const q = qMap[quality] ?? 4;
  const store = readStore();
  const card = store.flashcards.find((c) => c.id === id);
  if (!card) return null;

  let ease = card.ease ?? 2.5;
  let reps = card.repetitions ?? 0;
  let interval = card.intervalDays ?? 0;

  if (q < 3) {
    reps = 0;
    interval = 0.01; // review again in ~15 mins
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  card.ease = Number(ease.toFixed(2));
  card.repetitions = reps;
  card.intervalDays = interval;
  card.dueAt = Date.now() + interval * 86400000;

  store.profile.xp += quality >= 3 ? 10 : 3;
  writeStore(store);
  return { card, profile: store.profile };
}

export function deleteFlashcard(id) {
  const store = readStore();
  store.flashcards = store.flashcards.filter((c) => c.id !== id);
  writeStore(store);
  return store.flashcards;
}

export function getCachedImagePath(cacheKey) {
  const store = readStore();
  return store.imageCacheIndex[cacheKey] || null;
}

export function saveCachedImagePath(cacheKey, publicUrl) {
  const store = readStore();
  store.imageCacheIndex[cacheKey] = publicUrl;
  writeStore(store);
}
