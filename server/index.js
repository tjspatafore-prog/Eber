import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  loadEnv,
  getKeyStatuses,
  updateApiKeys,
  getSettings,
  updateSettings,
} from './services/configStore.js';
import {
  readStore,
  updateProfile,
  upsertFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from './services/dataStore.js';
import {
  generateTutorReply,
  generateMnemonicImage,
  synthesizeHebrewSpeech,
  transcribeHebrewWithDeepgram,
  testProviderConnection,
} from './services/aiProvider.js';

loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3001);

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve cached mnemonic images & TTS audio
app.use('/cache', express.static(path.join(ROOT_DIR, 'server', 'cache')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'Eber Hebrew Academy API', timestamp: new Date().toISOString() });
});

// Settings & API keys (never returns plaintext keys!)
app.get('/api/settings', (_req, res) => {
  const cacheImagesDir = path.join(ROOT_DIR, 'server', 'cache', 'images');
  const cacheAudioDir = path.join(ROOT_DIR, 'server', 'cache', 'audio');
  const cachedImages = fs.existsSync(cacheImagesDir) ? fs.readdirSync(cacheImagesDir).length : 0;
  const cachedAudio = fs.existsSync(cacheAudioDir) ? fs.readdirSync(cacheAudioDir).length : 0;
  res.json({
    settings: getSettings(),
    keys: getKeyStatuses(),
    cacheStats: { cachedImages, cachedAudio },
  });
});

app.post('/api/settings', (req, res) => {
  try {
    const { settings: settingsPatch, keys: keyUpdates } = req.body || {};
    const updatedKeys = keyUpdates ? updateApiKeys(keyUpdates) : getKeyStatuses();
    const updatedSettings = settingsPatch ? updateSettings(settingsPatch) : getSettings();
    res.json({ ok: true, settings: updatedSettings, keys: updatedKeys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/test', async (req, res) => {
  try {
    const { provider } = req.body || {};
    if (!provider) return res.status(400).json({ error: 'Missing provider' });
    const result = await testProviderConnection(provider);
    res.json(result);
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Learner progress & store
app.get('/api/store', (_req, res) => {
  res.json(readStore());
});

app.post('/api/progress/lesson', (req, res) => {
  const { lessonId, xpGain = 25 } = req.body || {};
  const profile = updateProfile((p) => {
    if (lessonId && !p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      p.xp += xpGain;
    } else if (xpGain) {
      p.xp += Math.min(xpGain, 10);
    }
  });
  res.json({ profile });
});

app.post('/api/progress/letter', (req, res) => {
  const { letterId, mastered = true } = req.body || {};
  const profile = updateProfile((p) => {
    if (!letterId) return;
    const exists = p.masteredLetters.includes(letterId);
    if (mastered && !exists) {
      p.masteredLetters.push(letterId);
      p.xp += 15;
    } else if (!mastered && exists) {
      p.masteredLetters = p.masteredLetters.filter((x) => x !== letterId);
    }
  });
  res.json({ profile });
});

app.post('/api/progress/passage', (req, res) => {
  const { passageId } = req.body || {};
  const profile = updateProfile((p) => {
    if (passageId && !p.readPassages.includes(passageId)) {
      p.readPassages.push(passageId);
      p.xp += 30;
    }
  });
  res.json({ profile });
});

// Flashcards (SM-2)
app.post('/api/flashcards', (req, res) => {
  try {
    const cards = upsertFlashcard(req.body || {});
    res.json({ flashcards: cards });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/flashcards/:id/review', (req, res) => {
  const { quality } = req.body || {};
  const result = reviewFlashcard(req.params.id, Number(quality));
  if (!result) return res.status(404).json({ error: 'Flashcard not found' });
  res.json(result);
});

app.delete('/api/flashcards/:id', (req, res) => {
  const flashcards = deleteFlashcard(req.params.id);
  res.json({ flashcards });
});

// AI Tutor Chat
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, provider, model, systemPrompt, temperature } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }
    const result = await generateTutorReply({ messages, provider, model, systemPrompt, temperature });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Spoken Conversation Partner (Dual-track Biblical & Modern)
app.post('/api/ai/conversation', async (req, res) => {
  try {
    const { history = [], scenario, userHebrew, track = 'modern', provider } = req.body || {};
    const systemPrompt =
      track === 'modern'
        ? `You are a friendly Israeli & Biblical Hebrew conversation tutor conducting a roleplay scenario: "${scenario || 'Everyday Hebrew Conversation'}".
Respond ONLY as valid JSON (no markdown fences) with this exact shape:
{
  "hebrew": "Your reply in Hebrew WITH niqqud (vowel points)",
  "transliteration": "Clear phonetic transliteration",
  "english": "Natural English translation",
  "coaching": "Brief warm feedback on the student's Hebrew + one tip",
  "biblicalRootLink": "Connect one key word from your reply to its Biblical Hebrew 3-letter root (shoresh) and ancient pictographic word picture"
}`
        : `You are a Biblical Hebrew master scribe guiding a student in reading and reciting Biblical Hebrew in the scenario: "${scenario || 'Biblical Study & Recitation'}".
Respond ONLY as valid JSON (no markdown fences) with this exact shape:
{
  "hebrew": "A short Biblical Hebrew phrase or verse WITH full niqqud",
  "transliteration": "Clear Tiberian/Sephardi transliteration",
  "english": "Faithful English translation",
  "coaching": "Pronunciation & grammar coaching (gutturals, dagesh, stress, or root insight)",
  "biblicalRootLink": "Ancient word picture (Friends of Eber style) + 3-letter shoresh insight for a key word"
}`;

    const messages = [
      ...history,
      { role: 'user', content: userHebrew || 'Begin the conversation with a warm greeting suitable for a beginner-intermediate student.' },
    ];

    const reply = await generateTutorReply({ messages, systemPrompt, provider, temperature: 0.65 });
    let parsed;
    try {
      const cleaned = reply.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        hebrew: 'שָׁלוֹם! בְּרוּכִים הַבָּאִים לְלִמּוּד עִבְרִית.',
        transliteration: 'Shalom! Berukhim haba-im le-limud Ivrit.',
        english: reply.text,
        coaching: 'Keep practicing! You can speak again using the microphone.',
        biblicalRootLink: 'שָׁלוֹם (Shalom) comes from the root ש-ל-ם (completeness, wholeness, peace).',
      };
    }

    updateProfile((p) => {
      p.speakingSessions = (p.speakingSessions || 0) + 1;
      p.xp += 10;
    });

    res.json({ ...parsed, provider: reply.provider, model: reply.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Word/Verse Deep Analysis (Manuscript + Word Picture + Grammar)
app.post('/api/ai/analyze-passage', async (req, res) => {
  try {
    const { reference, hebrewText, provider } = req.body || {};
    const prompt = `Provide an interactive Biblical Hebrew study breakdown for: ${reference || 'this Hebrew text'}
${hebrewText ? `Text: ${hebrewText}` : ''}

Include:
1. Full vocalized Masoretic Hebrew text (Leningrad Codex standard) with transliteration and faithful translation.
2. Word-by-word table (Hebrew | Root Shoresh | Grammar/Binyan | Meaning).
3. Ancient Word Picture / Pictographic Study (inspired by Paleo-Hebrew pictographs & Friends of Eber) for the 2-3 most important roots, clearly noting pictographic mnemonics vs. historical linguistics.
4. Manuscript Notes: mention how this passage appears in the Leningrad Codex (B19A), Aleppo Codex (note if extant or missing), and any known Dead Sea Scrolls fragments (e.g., 1QIsa-a, 4Q fragments).`;

    const reply = await generateTutorReply({
      messages: [{ role: 'user', content: prompt }],
      provider,
      temperature: 0.4,
    });
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cheap Cached Mnemonic Image Generation
app.post('/api/ai/image', async (req, res) => {
  try {
    const { concept, hebrew, pictograph, styleHint, forceRegenerate } = req.body || {};
    if (!concept) return res.status(400).json({ error: 'concept is required' });
    const result = await generateMnemonicImage({ concept, hebrew, pictograph, styleHint, forceRegenerate });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hebrew TTS
app.post('/api/speech/tts', async (req, res) => {
  try {
    const { text, mode = 'biblical', slow = false } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    const result = await synthesizeHebrewSpeech({ text, mode, slow });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, fallbackToBrowser: true });
  }
});

// Deepgram Nova-3 Hebrew Speech-to-Text
app.post('/api/speech/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'audio file is required' });
    const targetHebrew = req.body?.targetHebrew || '';
    const keytermsRaw = req.body?.keyterms || '';
    const keyterms = keytermsRaw ? keytermsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const result = await transcribeHebrewWithDeepgram({
      audioBuffer: req.file.buffer,
      mimeType: req.file.mimetype || 'audio/webm',
      targetHebrew,
      keyterms,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve production frontend if built
const distDir = path.join(ROOT_DIR, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/cache')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n📜 Eber Hebrew Academy API running on http://localhost:${PORT}`);
});
