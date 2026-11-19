import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const SETTINGS_PATH = path.join(ROOT_DIR, 'server', 'data', 'settings.json');

export const KEY_FIELDS = [
  'DEEPGRAM_API_KEY',
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GROK_API_KEY',
  'KIMI_API_KEY',
  'QWEN_API_KEY',
];

export const DEFAULT_SETTINGS = {
  tutorProvider: 'gemini',
  tutorModels: {
    gemini: 'gemini-2.5-flash',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-sonnet-4-20250514',
    grok: 'grok-3-mini',
    kimi: 'kimi-k2-0711-preview',
    qwen: 'qwen-plus',
  },
  imageProvider: 'gemini',
  imageModel: 'gemini-2.5-flash-image',
  ttsProvider: 'gemini',
  ttsVoice: 'Kore',
  pronunciationStyle: 'dual', // 'dual' | 'biblical' | 'modern'
  showCantillation: true,
  showTransliteration: true,
};

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    dotenv.config({ path: ENV_PATH, override: true });
  }
}

export function getApiKey(name) {
  loadEnv();
  return (process.env[name] || '').trim();
}

export function maskKey(val) {
  if (!val) return '';
  if (val.length <= 8) return '••••••••';
  return `${val.slice(0, 4)}••••••${val.slice(-4)}`;
}

export function getKeyStatuses() {
  loadEnv();
  const status = {};
  for (const field of KEY_FIELDS) {
    const val = (process.env[field] || '').trim();
    status[field] = {
      configured: Boolean(val),
      masked: maskKey(val),
    };
  }
  return status;
}

export function updateApiKeys(updates) {
  loadEnv();
  let lines = [];
  if (fs.existsSync(ENV_PATH)) {
    lines = fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  }

  const map = new Map();
  const order = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx > 0) {
      const k = line.slice(0, eqIdx).trim();
      const v = line.slice(eqIdx + 1).trim();
      map.set(k, v);
      order.push(k);
    }
  }

  for (const field of KEY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      const nextVal = String(updates[field] ?? '').trim();
      // Ignore masked placeholder values sent back accidentally
      if (nextVal.includes('••••')) continue;
      if (nextVal === '') {
        map.delete(field);
        delete process.env[field];
      } else {
        map.set(field, nextVal);
        process.env[field] = nextVal;
        if (!order.includes(field)) order.push(field);
      }
    }
  }

  const outLines = ['# Eber Hebrew Academy Local Environment'];
  for (const key of order) {
    if (map.has(key)) {
      outLines.push(`${key}=${map.get(key)}`);
    }
  }
  fs.writeFileSync(ENV_PATH, outLines.join('\n') + '\n', 'utf8');
  return getKeyStatuses();
}

export function getSettings() {
  ensureDir(SETTINGS_PATH);
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      tutorModels: {
        ...DEFAULT_SETTINGS.tutorModels,
        ...(parsed.tutorModels || {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function updateSettings(patch) {
  const current = getSettings();
  const next = {
    ...current,
    ...patch,
    tutorModels: {
      ...current.tutorModels,
      ...(patch.tutorModels || {}),
    },
  };
  ensureDir(SETTINGS_PATH);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2), 'utf8');
  return next;
}
