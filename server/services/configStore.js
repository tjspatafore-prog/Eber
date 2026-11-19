import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const SETTINGS_PATH = path.join(ROOT_DIR, 'server', 'data', 'settings.json');

export const IS_VERCEL = Boolean(process.env.VERCEL);

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
  pronunciationStyle: 'dual',
  showCantillation: true,
  showTransliteration: true,
};

let memorySettings = { ...DEFAULT_SETTINGS };

function ensureDir(filePath) {
  if (IS_VERCEL) return;
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadEnv() {
  if (!IS_VERCEL && fs.existsSync(ENV_PATH)) {
    dotenv.config({ path: ENV_PATH, override: true });
  }
}

export function getApiKey(name, overrides = {}) {
  if (overrides && overrides[name] && String(overrides[name]).trim()) {
    return String(overrides[name]).trim();
  }
  loadEnv();
  return (process.env[name] || '').trim();
}

export function extractRequestKeyOverrides(req) {
  const overrides = {};
  const map = {
    'x-key-deepgram': 'DEEPGRAM_API_KEY',
    'x-key-gemini': 'GEMINI_API_KEY',
    'x-key-openai': 'OPENAI_API_KEY',
    'x-key-anthropic': 'ANTHROPIC_API_KEY',
    'x-key-grok': 'GROK_API_KEY',
    'x-key-kimi': 'KIMI_API_KEY',
    'x-key-qwen': 'QWEN_API_KEY',
  };
  for (const [header, envKey] of Object.entries(map)) {
    const val = req.headers?.[header];
    if (typeof val === 'string' && val.trim()) {
      overrides[envKey] = val.trim();
    }
  }
  return overrides;
}

export function extractRequestSettingsOverride(req) {
  const raw = req.headers?.['x-eber-settings'];
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function maskKey(val) {
  if (!val) return '';
  if (val.length <= 8) return '••••••••';
  return `${val.slice(0, 4)}••••••${val.slice(-4)}`;
}

export function getKeyStatuses(overrides = {}) {
  loadEnv();
  const status = {};
  for (const field of KEY_FIELDS) {
    const envVal = (process.env[field] || '').trim();
    const overrideVal = (overrides[field] || '').trim();
    const val = overrideVal || envVal;
    status[field] = {
      configured: Boolean(val),
      masked: maskKey(val),
      source: overrideVal ? 'device' : envVal ? 'server' : 'none',
    };
  }
  return status;
}

export function updateApiKeys(updates) {
  if (IS_VERCEL) {
    // On Vercel, environment variables are managed in Vercel dashboard or saved in browser localStorage.
    return getKeyStatuses(updates);
  }
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

export function getSettings(override = null) {
  let base = { ...DEFAULT_SETTINGS };
  if (IS_VERCEL) {
    base = { ...memorySettings };
  } else {
    ensureDir(SETTINGS_PATH);
    if (!fs.existsSync(SETTINGS_PATH)) {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
    } else {
      try {
        const parsed = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
        base = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          tutorModels: {
            ...DEFAULT_SETTINGS.tutorModels,
            ...(parsed.tutorModels || {}),
          },
        };
      } catch {
        base = { ...DEFAULT_SETTINGS };
      }
    }
  }

  if (override && typeof override === 'object') {
    return {
      ...base,
      ...override,
      tutorModels: {
        ...base.tutorModels,
        ...(override.tutorModels || {}),
      },
    };
  }
  return base;
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
  if (IS_VERCEL) {
    memorySettings = next;
    return next;
  }
  ensureDir(SETTINGS_PATH);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2), 'utf8');
  return next;
}
