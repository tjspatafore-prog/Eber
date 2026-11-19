import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { getApiKey, getSettings, IS_VERCEL } from './configStore.js';
import { getCachedImagePath, saveCachedImagePath } from './dataStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const IMAGE_CACHE_DIR = path.join(ROOT_DIR, 'server', 'cache', 'images');
const AUDIO_CACHE_DIR = path.join(ROOT_DIR, 'server', 'cache', 'audio');

if (!IS_VERCEL) {
  for (const dir of [IMAGE_CACHE_DIR, AUDIO_CACHE_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

const OPENAI_COMPAT_PROVIDERS = {
  openai: {
    envKey: 'OPENAI_API_KEY',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  grok: {
    envKey: 'GROK_API_KEY',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3-mini',
  },
  kimi: {
    envKey: 'KIMI_API_KEY',
    baseUrl: 'https://api.moonshot.ai/v1',
    defaultModel: 'kimi-k2-0711-preview',
  },
  qwen: {
    envKey: 'QWEN_API_KEY',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
  },
};

export const HEBREW_TUTOR_SYSTEM_PROMPT = `You are "Eber", an extraordinary Biblical and Spoken Hebrew master teacher, Semitic linguist, and ancient manuscript scribe.
Your student is learning Hebrew from complete beginner to fluent reading of the Hebrew Bible in ancient manuscripts (Westminster Leningrad Codex, Aleppo Codex, and Dead Sea Scrolls) AND practical Modern/Sephardi spoken Hebrew.

Teaching principles:
1. Always display Hebrew with clear vowel points (niqqud) AND transliteration + English gloss when teaching beginners, while gradually introducing unpointed reading.
2. When explaining letters or roots (shorashim), honor BOTH:
   - Ancient Pictographic / Word-Picture Mnemonics (in the spirit of ancient Proto-Sinaitic pictographs and letter-meaning studies like "The Friends of Eber") — clearly labeled as "Word Picture / Pictographic Mnemonic" so the student builds unforgettable visual memory hooks.
   - Standard Semitic philology, 3-letter root morphology (shoresh), binyanim, and Masoretic grammar — clearly labeled as "Linguistic / Grammatical Analysis".
3. When discussing manuscripts, give concrete insights about the Masoretic Text (Leningrad Codex B19A, Aleppo Codex), Tiberian cantillation (te'amim), Ketiv/Qere notes, and Dead Sea Scrolls (e.g., 1QIsa-a plene orthography, Paleo-Hebrew Tetragrammaton, textual variants).
4. For pronunciation & speaking, explain both Modern/Sephardi conversational pronunciation and Tiberian Biblical nuances (e.g., gutturals Ayin/Chet, Begadkefat letters, vowel length) when helpful.
5. Be warm, encouraging, concise, and structured with clean Markdown.`;

export async function generateTutorReply({
  messages,
  systemPrompt,
  provider,
  model,
  temperature = 0.7,
  keyOverrides = {},
  settingsOverride = null,
}) {
  const settings = getSettings(settingsOverride);
  const activeProvider = provider || settings.tutorProvider || 'gemini';
  const activeModel = model || settings.tutorModels?.[activeProvider];
  const finalSystem = systemPrompt || HEBREW_TUTOR_SYSTEM_PROMPT;

  if (activeProvider === 'gemini') {
    const apiKey = getApiKey('GEMINI_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Open Settings (or Vercel Env Vars) to add your Google Gemini API key.');
    }
    const targetModel = (activeModel || 'gemini-2.5-flash').trim().replace(/^models\//i, '');
    if (/\s/.test(targetModel)) {
      throw new Error(
        `Invalid Gemini Model ID "${targetModel}" (model IDs cannot contain spaces). Choose a valid API model ID in API & Settings such as "gemini-2.5-flash", "gemini-2.5-pro", "gemini-3-flash-preview", or "gemini-3.1-pro-preview".`
      );
    }
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: finalSystem }] },
          contents,
          generationConfig: { temperature },
        }),
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error?.message || `Gemini API error (${res.status})`;
      if (res.status === 404) {
        throw new Error(
          `Model "${targetModel}" was not found on your Gemini API key (${msg}). Try "gemini-2.5-flash", "gemini-3-flash-preview", or click "Load My Models" in API & Settings.`
        );
      }
      throw new Error(msg);
    }
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('')
        .trim() || '';
    return { text, provider: 'gemini', model: targetModel };
  }

  if (activeProvider === 'anthropic') {
    const apiKey = getApiKey('ANTHROPIC_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured. Open Settings to add your Anthropic key.');
    }
    const targetModel = activeModel || 'claude-sonnet-4-20250514';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: targetModel,
        max_tokens: 2048,
        temperature,
        system: finalSystem,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Anthropic API error (${res.status})`);
    }
    const text = data.content?.map((c) => c.text || '').join('').trim() || '';
    return { text, provider: 'anthropic', model: targetModel };
  }

  if (OPENAI_COMPAT_PROVIDERS[activeProvider]) {
    const cfg = OPENAI_COMPAT_PROVIDERS[activeProvider];
    const apiKey = getApiKey(cfg.envKey, keyOverrides);
    if (!apiKey) {
      throw new Error(`${cfg.envKey} is not configured. Open Settings to add your key.`);
    }
    const targetModel = activeModel || cfg.defaultModel;
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        temperature,
        messages: [
          { role: 'system', content: finalSystem },
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `${activeProvider} API error (${res.status})`);
    }
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    return { text, provider: activeProvider, model: targetModel };
  }

  throw new Error(`Unsupported AI provider: ${activeProvider}`);
}

/**
 * Cheap Visual Mnemonic Image Generation.
 * Caches to local disk when running locally; returns inline data URL (cached in browser IndexedDB) on Vercel.
 */
export async function generateMnemonicImage({
  concept,
  hebrew,
  pictograph,
  styleHint,
  forceRegenerate = false,
  keyOverrides = {},
  settingsOverride = null,
}) {
  const settings = getSettings(settingsOverride);
  const provider = settings.imageProvider || 'gemini';
  const cacheKey = crypto
    .createHash('sha1')
    .update(`${provider}|${concept}|${hebrew || ''}|${pictograph || ''}`)
    .digest('hex');

  if (!IS_VERCEL && !forceRegenerate) {
    const existing = getCachedImagePath(cacheKey);
    if (existing) {
      const diskPath = path.join(ROOT_DIR, 'server', existing.replace(/^\//, ''));
      if (fs.existsSync(diskPath)) {
        return { imageUrl: existing, cached: true, provider };
      }
    }
  }

  const prompt = [
    'Create a warm, museum-grade illuminated educational illustration on antique cream parchment paper for a Hebrew language flashcard.',
    `Concept: "${concept}".`,
    pictograph ? `Ancient Near Eastern pictographic motif: ${pictograph}.` : '',
    styleHint ||
      'Hand-inked sepia and lapis lazuli watercolor woodcut style, clear iconic visual storytelling, uncluttered composition, no garbled text or watermarks.',
  ]
    .filter(Boolean)
    .join(' ');

  let imageBuffer = null;
  let ext = 'png';
  let mimeType = 'image/png';

  if (provider === 'gemini') {
    const apiKey = getApiKey('GEMINI_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured for image generation. Add it in Settings or Vercel Env Vars.');
    }
    const imageModel = settings.imageModel || 'gemini-2.5-flash-image';
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(imageModel)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Gemini Image API error (${res.status})`);
    }
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    if (!imgPart) {
      throw new Error('Gemini did not return an image part. Try switching image model in Settings.');
    }
    mimeType = imgPart.inlineData.mimeType || 'image/png';
    ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
    imageBuffer = Buffer.from(imgPart.inlineData.data, 'base64');
  } else if (provider === 'openai') {
    const apiKey = getApiKey('OPENAI_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured for image generation. Add it in Settings.');
    }
    const model =
      settings.imageModel?.startsWith('gpt-image') || settings.imageModel === 'dall-e-3'
        ? settings.imageModel
        : 'gpt-image-1-mini';
    const body =
      model === 'dall-e-3'
        ? { model, prompt, size: '1024x1024', response_format: 'b64_json' }
        : { model, prompt, size: '1024x1024', quality: 'low' };
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `OpenAI Image API error (${res.status})`);
    }
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) throw new Error('OpenAI did not return image bytes.');
    imageBuffer = Buffer.from(b64, 'base64');
  } else {
    throw new Error(`Image provider "${provider}" is not supported. Choose Gemini or OpenAI in Settings.`);
  }

  if (IS_VERCEL) {
    const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    return { imageUrl: dataUrl, cached: false, provider };
  }

  const filename = `${cacheKey}.${ext}`;
  const fullPath = path.join(IMAGE_CACHE_DIR, filename);
  fs.writeFileSync(fullPath, imageBuffer);
  const publicUrl = `/cache/images/${filename}`;
  saveCachedImagePath(cacheKey, publicUrl);

  return { imageUrl: publicUrl, cached: false, provider };
}

function pcm16ToWav(pcmBuffer, sampleRate = 24000, numChannels = 1) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const dataSize = pcmBuffer.length;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Hebrew TTS — caches to disk locally, returns inline data URL on Vercel.
 */
export async function synthesizeHebrewSpeech({
  text,
  mode = 'biblical',
  slow = false,
  phoneticHint = '',
  keyOverrides = {},
  settingsOverride = null,
}) {
  const settings = getSettings(settingsOverride);
  const provider = settings.ttsProvider || 'gemini';
  const voice = settings.ttsVoice || 'Kore';
  const cacheKey = crypto
    .createHash('sha1')
    .update(`${provider}|${voice}|${mode}|${slow}|${phoneticHint}|${text}`)
    .digest('hex');

  const wavPath = path.join(AUDIO_CACHE_DIR, `${cacheKey}.wav`);
  const mp3Path = path.join(AUDIO_CACHE_DIR, `${cacheKey}.mp3`);

  if (!IS_VERCEL) {
    if (fs.existsSync(wavPath)) {
      return { audioUrl: `/cache/audio/${cacheKey}.wav`, cached: true, provider };
    }
    if (fs.existsSync(mp3Path)) {
      return { audioUrl: `/cache/audio/${cacheKey}.mp3`, cached: true, provider };
    }
  }

  if (provider === 'gemini') {
    const apiKey = getApiKey('GEMINI_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY missing for Gemini TTS (browser fallback available).');
    }

    const stylePrompt =
      mode === 'syllable'
        ? `Pronounce ONLY this single Hebrew syllable aloud clearly and slowly — do NOT say the letter's name, say ONLY the syllable sound${phoneticHint ? ` (pronounced "${phoneticHint}")` : ''}. Output ONLY the spoken syllable once:\n${text}`
        : mode === 'biblical'
        ? `Pronounce the following Biblical Hebrew text clearly and reverently${slow ? ', very slowly syllable by syllable for a beginner student' : ', at a measured scholarly pace'}. Speak ONLY the Hebrew words, nothing else:\n${text}`
        : `Speak the following Modern Israeli Hebrew naturally and clearly${slow ? ', slowly for a language learner' : ''}. Speak ONLY the Hebrew words, nothing else:\n${text}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: stylePrompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || `Gemini TTS error (${res.status})`);
    }
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) throw new Error('Gemini TTS returned no audio data.');

    const mime = part.inlineData.mimeType || 'audio/L16;rate=24000';
    const rawBuf = Buffer.from(part.inlineData.data, 'base64');

    let finalBuf = rawBuf;
    let outMime = 'audio/wav';
    let outPath = wavPath;

    if (mime.toLowerCase().includes('l16') || mime.toLowerCase().includes('pcm')) {
      const rateMatch = mime.match(/rate=(\d+)/i);
      const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
      finalBuf = pcm16ToWav(rawBuf, sampleRate, 1);
      outMime = 'audio/wav';
      outPath = wavPath;
    } else if (mime.includes('mpeg') || mime.includes('mp3')) {
      outMime = 'audio/mpeg';
      outPath = mp3Path;
    }

    if (IS_VERCEL) {
      return {
        audioUrl: `data:${outMime};base64,${finalBuf.toString('base64')}`,
        cached: false,
        provider: 'gemini',
      };
    }

    fs.writeFileSync(outPath, finalBuf);
    return {
      audioUrl: `/cache/audio/${path.basename(outPath)}`,
      cached: false,
      provider: 'gemini',
    };
  }

  if (provider === 'openai') {
    const apiKey = getApiKey('OPENAI_API_KEY', keyOverrides);
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY missing for OpenAI TTS.');
    }
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: 'onyx',
        input: text,
        speed: slow ? 0.78 : 1.0,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI TTS error (${res.status}): ${errText}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (IS_VERCEL) {
      return {
        audioUrl: `data:audio/mpeg;base64,${buf.toString('base64')}`,
        cached: false,
        provider: 'openai',
      };
    }
    fs.writeFileSync(mp3Path, buf);
    return { audioUrl: `/cache/audio/${cacheKey}.mp3`, cached: false, provider: 'openai' };
  }

  throw new Error('Use browser speech synthesis when ttsProvider is set to browser.');
}

export function stripHebrewMarks(str = '') {
  return str
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[.,!?;:"'״׳־\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deepgram Nova-3 Hebrew Speech-to-Text + Pronunciation Scoring
 */
export async function transcribeHebrewWithDeepgram({
  audioBuffer,
  mimeType = 'audio/webm',
  targetHebrew = '',
  keyterms = [],
  keyOverrides = {},
}) {
  const apiKey = getApiKey('DEEPGRAM_API_KEY', keyOverrides);
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY is not configured. Open Settings (or Vercel Env Vars) to add your Deepgram API key.');
  }

  const params = new URLSearchParams({
    model: 'nova-3',
    language: 'he',
    smart_format: 'true',
  });

  const cleanTargetWords = stripHebrewMarks(targetHebrew)
    .split(' ')
    .filter((w) => w.length >= 2)
    .slice(0, 12);
  const allTerms = [...new Set([...cleanTargetWords, ...keyterms])].slice(0, 15);
  for (const term of allTerms) {
    params.append('keyterm', term);
  }

  // Strip ;codecs=... suffix cleanly for iOS Safari audio/mp4 compatibility
  const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim() || 'audio/webm';

  const res = await fetch(`https://api.deepgram.com/v1/listen?${params.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': cleanMime,
    },
    body: audioBuffer,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.err_msg || data.message || `Deepgram API error (${res.status})`);
  }

  const alt = data.results?.channels?.[0]?.alternatives?.[0] || {};
  const transcript = (alt.transcript || '').trim();
  const confidence = alt.confidence ?? 0;
  const words = alt.words || [];

  let matchScore = null;
  let wordComparison = [];
  if (targetHebrew) {
    const targetWords = stripHebrewMarks(targetHebrew).split(' ').filter(Boolean);
    const spokenWords = stripHebrewMarks(transcript).split(' ').filter(Boolean);

    let matched = 0;
    wordComparison = targetWords.map((tw) => {
      const norm = (s) => s.replace(/[וי]/g, '');
      const hit = spokenWords.some(
        (sw) => sw === tw || (norm(sw).length >= 2 && norm(sw) === norm(tw))
      );
      if (hit) matched += 1;
      return { word: tw, matched: hit };
    });

    matchScore = targetWords.length > 0 ? Math.round((matched / targetWords.length) * 100) : 0;
  }

  return {
    transcript,
    confidence: Math.round(confidence * 100),
    words,
    matchScore,
    wordComparison,
  };
}

export async function listAvailableGeminiModels(keyOverrides = {}) {
  const apiKey = getApiKey('GEMINI_API_KEY', keyOverrides);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add your Google Gemini API key first.');
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=100`
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error?.message || `Failed to list Gemini models (${res.status})`);
  }
  const models = (data.models || [])
    .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m) => ({
      id: String(m.name || '').replace(/^models\//, ''),
      displayName: m.displayName || m.name,
    }))
    .filter((m) => m.id.startsWith('gemini-'));
  return models;
}

export async function testProviderConnection(provider, keyOverrides = {}, settingsOverride = null) {
  if (provider === 'deepgram') {
    const apiKey = getApiKey('DEEPGRAM_API_KEY', keyOverrides);
    if (!apiKey) return { ok: false, message: 'No Deepgram API key saved.' };
    const res = await fetch('https://api.deepgram.com/v1/projects', {
      headers: { Authorization: `Token ${apiKey}` },
    });
    if (res.ok) return { ok: true, message: 'Deepgram connected (Nova-3 Hebrew ready).' };
    return { ok: false, message: `Deepgram rejected key (${res.status}).` };
  }

  try {
    const reply = await generateTutorReply({
      provider,
      messages: [{ role: 'user', content: 'Reply with ONLY the Hebrew word Shalom (שָׁלוֹם).' }],
      systemPrompt: 'Reply concisely.',
      temperature: 0.1,
      keyOverrides,
      settingsOverride,
    });
    return { ok: true, message: `Connected (${reply.model}): ${reply.text}` };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
