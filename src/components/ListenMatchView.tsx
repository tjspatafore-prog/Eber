import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Headphones,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { HEBREW_ALPHABET } from '../data/alphabet';
import { STARTER_FLASHCARDS } from '../data/curriculum';
import { speakHebrew } from '../lib/api';

type DrillMode =
  | 'vowels'
  | 'dots'
  | 'letters'
  | 'syllables'
  | 'pictographs'
  | 'words';

interface QuizOption {
  id: string;
  hebrew: string;
  sublabel?: string;
  markExplanation: string;
}

interface QuizQuestion {
  id: string;
  promptLabel: string;
  audioText: string;
  audioMode: 'biblical' | 'modern' | 'syllable';
  phoneticHint: string;
  meaningHint?: string;
  pictographSvg?: string;
  correctId: string;
  options: QuizOption[];
  explanation: string;
}

const DRILL_MODES: { id: DrillMode; title: string; badge: string; desc: string }[] = [
  {
    id: 'vowels',
    title: 'Vowels (Niqqud) Under, Above & Inside',
    badge: 'Most Popular',
    desc: 'Hear a syllable (ba, be, bi, bo, boo) and pick which vowel mark under/above/inside the letter matches!',
  },
  {
    id: 'dots',
    title: 'Dots Inside & Above (Dagesh & Shin/Sin)',
    badge: 'Precision',
    desc: 'Master בּ vs ב, כּ vs כ, פּ vs פ, שׁ vs שׂ, and וֹ vs וּ — the trickiest dots in Hebrew!',
  },
  {
    id: 'letters',
    title: 'Aleph-Bet Letters by Sound',
    badge: 'Beginner',
    desc: 'Hear the letter name & sound and choose between 4 often-confused Hebrew letters (e.g. ד vs ר, ה vs ח).',
  },
  {
    id: 'syllables',
    title: 'Closed Syllables (2–3 Letters)',
    badge: 'Reading Flow',
    desc: 'Decode real pointed syllables like שָׁם (sham) vs שֵׁם (shem) vs שִׁים (shim) vs שׁוּם (shum).',
  },
  {
    id: 'pictographs',
    title: 'Ancient Word Pictures → Letter',
    badge: 'Friends of Eber',
    desc: 'See the Proto-Sinaitic pictograph & hear the letter name — tap the matching Hebrew letter!',
  },
  {
    id: 'words',
    title: 'Biblical & Spoken Words',
    badge: 'Vocabulary',
    desc: 'Hear real Hebrew words (Shalom, Bereshit, Elohim, Chesed, Boker Tov) and tap the exact pointed word.',
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pleasant Web Audio chime for instant Duolingo-like feedback
function playTone(correct: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (correct) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(185, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
      osc.start();
      osc.stop(ctx.currentTime + 0.24);
    }
  } catch {
    // ignore if browser audio context blocked
  }
}

const VOWEL_CONSONANTS = [
  { char: 'בּ', sound: 'b', name: 'Bet' },
  { char: 'מ', sound: 'm', name: 'Mem' },
  { char: 'ל', sound: 'l', name: 'Lamed' },
  { char: 'שׁ', sound: 'sh', name: 'Shin' },
  { char: 'דּ', sound: 'd', name: 'Dalet' },
  { char: 'תּ', sound: 't', name: 'Tav' },
  { char: 'נ', sound: 'n', name: 'Nun' },
  { char: 'ר', sound: 'r', name: 'Resh' },
  { char: 'ק', sound: 'k', name: 'Qof' },
  { char: 'ס', sound: 's', name: 'Samekh' },
];

const VOWEL_PATTERNS = [
  { id: 'kamatz', mark: '\u05B8', sound: 'ah', label: 'Kamatz (T-shape underneath → "ah")' },
  { id: 'patach', mark: '\u05B7', sound: 'a', label: 'Patach (flat line underneath → "a")' },
  { id: 'tzere', mark: '\u05B5', sound: 'eh', label: 'Tzere (2 horizontal dots underneath → "e/ey")' },
  { id: 'segol', mark: '\u05B6', sound: 'eh', label: 'Segol (3-dot triangle underneath → "e")' },
  { id: 'chirik', mark: '\u05B4', sound: 'ee', label: 'Chirik (1 single dot underneath → "ee")' },
  { id: 'cholam', mark: '\u05B9', sound: 'oh', label: 'Cholam (dot ABOVE upper-left → "oh")' },
  { id: 'shuruk', mark: 'וּ', sound: 'oo', label: 'Shuruk (Vav with dot INSIDE → "oo")' },
  { id: 'kubutz', mark: '\u05BB', sound: 'oo', label: 'Kubutz (3 diagonal dots underneath → "oo")' },
];

const DOT_TRICKY_SETS: {
  prompt: string;
  items: { hebrew: string; phonetic: string; explain: string }[];
}[] = [
  {
    prompt: 'Listen carefully for B vs V or K vs Kh (dot INSIDE the letter makes it hard!)',
    items: [
      { hebrew: 'בָּ', phonetic: 'ba', explain: 'בּ with dot inside = hard B ("ba")' },
      { hebrew: 'בָ', phonetic: 'va', explain: 'ב without dot = soft V ("va")' },
      { hebrew: 'כָּ', phonetic: 'ka', explain: 'כּ with dot inside = hard K ("ka")' },
      { hebrew: 'כָ', phonetic: 'kha', explain: 'כ without dot = soft throat Kh ("kha")' },
    ],
  },
  {
    prompt: 'Listen for P vs F or SH vs S (watch dots INSIDE and ABOVE!)',
    items: [
      { hebrew: 'פָּ', phonetic: 'pa', explain: 'פּ with dot inside = hard P ("pa")' },
      { hebrew: 'פָ', phonetic: 'fa', explain: 'פ without dot = soft F ("fa")' },
      { hebrew: 'שָׁ', phonetic: 'sha', explain: 'שׁ with dot on upper-RIGHT = SH ("sha")' },
      { hebrew: 'שָׂ', phonetic: 'sa', explain: 'שׂ with dot on upper-LEFT = S ("sa")' },
    ],
  },
  {
    prompt: 'Watch where the dot sits on Vav (ABOVE = "oh", INSIDE = "oo") & Bet!',
    items: [
      { hebrew: 'בּוֹ', phonetic: 'bo', explain: 'Vav with dot ABOVE (וֹ) = "oh" ("bo")' },
      { hebrew: 'בּוּ', phonetic: 'boo', explain: 'Vav with dot INSIDE (וּ) = "oo" ("boo")' },
      { hebrew: 'בוֹ', phonetic: 'vo', explain: 'Soft Bet (no dot) + Cholam Vav = "vo"' },
      { hebrew: 'בוּ', phonetic: 'voo', explain: 'Soft Bet (no dot) + Shuruk = "voo"' },
    ],
  },
  {
    prompt: 'Shin (dot right) vs Sin (dot left) + Vav vowels!',
    items: [
      { hebrew: 'שׁוֹ', phonetic: 'sho', explain: 'Dot on upper-RIGHT (שׁ) + Vav dot ABOVE = "sho"' },
      { hebrew: 'שׂוֹ', phonetic: 'so', explain: 'Dot on upper-LEFT (שׂ) + Vav dot ABOVE = "so"' },
      { hebrew: 'שׁוּ', phonetic: 'shoo', explain: 'Dot on upper-RIGHT (שׁ) + Vav dot INSIDE = "shoo"' },
      { hebrew: 'שׂוּ', phonetic: 'soo', explain: 'Dot on upper-LEFT (שׂ) + Vav dot INSIDE = "soo"' },
    ],
  },
  {
    prompt: 'Begadkefat Dagesh Check: P, F, B, V with Chirik ("ee" dot underneath)!',
    items: [
      { hebrew: 'פִּי', phonetic: 'pee', explain: 'פּ (dot inside = P) + Chirik = "pee"' },
      { hebrew: 'פִי', phonetic: 'fee', explain: 'פ (no dot = F) + Chirik = "fee"' },
      { hebrew: 'בִּי', phonetic: 'bee', explain: 'בּ (dot inside = B) + Chirik = "bee"' },
      { hebrew: 'בִי', phonetic: 'vee', explain: 'ב (no dot = V) + Chirik = "vee"' },
    ],
  },
];

const SYLLABLE_GROUPS = [
  [
    { hebrew: 'שָׁם', phonetic: 'sham', explain: 'Kamatz ("a") under Shin → sham ("there")' },
    { hebrew: 'שֵׁם', phonetic: 'shem', explain: 'Tzere ("e") under Shin → shem ("name")' },
    { hebrew: 'שִׁים', phonetic: 'shim', explain: 'Chirik ("i") under Shin → shim' },
    { hebrew: 'שׁוּם', phonetic: 'shum', explain: 'Shuruk ("u") after Shin → shum ("garlic")' },
  ],
  [
    { hebrew: 'בָּן', phonetic: 'ban', explain: 'Hard Bet + Kamatz ("a") + Final Nun → ban' },
    { hebrew: 'בֵּן', phonetic: 'ben', explain: 'Hard Bet + Tzere ("e") + Final Nun → ben ("son")' },
    { hebrew: 'בִּין', phonetic: 'bin', explain: 'Hard Bet + Chirik-Yod ("i") + Final Nun → bin ("understand")' },
    { hebrew: 'בּוֹן', phonetic: 'bon', explain: 'Hard Bet + Cholam-Vav ("o") + Final Nun → bon' },
  ],
  [
    { hebrew: 'לָב', phonetic: 'lav', explain: 'Lamed + Kamatz ("a") + Soft Vet → lav' },
    { hebrew: 'לֵב', phonetic: 'lev', explain: 'Lamed + Tzere ("e") + Soft Vet → lev ("heart")' },
    { hebrew: 'לִבּ', phonetic: 'lib', explain: 'Lamed + Chirik ("i") + Hard Bet → lib' },
    { hebrew: 'לוֹב', phonetic: 'lov', explain: 'Lamed + Cholam-Vav ("o") + Soft Vet → lov' },
  ],
  [
    { hebrew: 'אוֹר', phonetic: 'or', explain: 'Aleph + Cholam-Vav ("o") + Resh → or ("light")' },
    { hebrew: 'אוּר', phonetic: 'ur', explain: 'Aleph + Shuruk ("u") + Resh → ur ("flame/Ur")' },
    { hebrew: 'אִיר', phonetic: 'ir', explain: 'Aleph + Chirik-Yod ("i") + Resh → ir' },
    { hebrew: 'אֵר', phonetic: 'er', explain: 'Aleph + Tzere ("e") + Resh → er' },
  ],
  [
    { hebrew: 'דָּם', phonetic: 'dam', explain: 'Dalet + Kamatz ("a") + Final Mem → dam ("blood")' },
    { hebrew: 'דֹּם', phonetic: 'dom', explain: 'Dalet + Cholam ("o") + Final Mem → dom ("be still")' },
    { hebrew: 'דִּים', phonetic: 'dim', explain: 'Dalet + Chirik-Yod ("i") + Final Mem → dim' },
    { hebrew: 'דּוּם', phonetic: 'dum', explain: 'Dalet + Shuruk ("u") + Final Mem → dum' },
  ],
  [
    { hebrew: 'קָל', phonetic: 'kal', explain: 'Qof + Kamatz ("a") + Lamed → kal ("light/easy")' },
    { hebrew: 'קוֹל', phonetic: 'kol', explain: 'Qof + Cholam-Vav ("o") + Lamed → kol ("voice")' },
    { hebrew: 'קִיל', phonetic: 'kil', explain: 'Qof + Chirik-Yod ("i") + Lamed → kil' },
    { hebrew: 'קֵל', phonetic: 'kel', explain: 'Qof + Tzere ("e") + Lamed → kel' },
  ],
];

const CONFUSABLE_LETTER_GROUPS = [
  ['bet', 'kaf', 'mem', 'pe'],
  ['dalet', 'resh', 'he', 'chet'],
  ['he', 'chet', 'tav', 'mem'],
  ['vav', 'zayin', 'yod', 'nun'],
  ['samekh', 'mem', 'tet', 'ayin'],
  ['aleph', 'ayin', 'shin', 'tsadi'],
  ['gimel', 'nun', 'zayin', 'lamed'],
  ['qof', 'resh', 'dalet', 'kaf'],
];

function generateRound(mode: DrillMode, count = 10): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    if (mode === 'vowels') {
      const cons = VOWEL_CONSONANTS[i % VOWEL_CONSONANTS.length];
      // Pick 4 distinct vowel sound classes (A, E, I, O, U) so audio is unmistakably different!
      const distinctVowels = shuffle([
        VOWEL_PATTERNS[Math.random() > 0.5 ? 0 : 1], // A: Kamatz or Patach
        VOWEL_PATTERNS[Math.random() > 0.5 ? 2 : 3], // E: Tzere or Segol
        VOWEL_PATTERNS[4], // I: Chirik
        VOWEL_PATTERNS[5], // O: Cholam
        VOWEL_PATTERNS[Math.random() > 0.5 ? 6 : 7], // U: Shuruk or Kubutz
      ]).slice(0, 4);

      const targetV = distinctVowels[Math.floor(Math.random() * distinctVowels.length)];
      const opts: QuizOption[] = distinctVowels.map((v) => ({
        id: `${cons.char}-${v.id}`,
        hebrew: `${cons.char}${v.mark}`,
        markExplanation: v.label,
      }));

      questions.push({
        id: `q-v-${i}-${Date.now()}`,
        promptLabel: `Which vowel mark on ${cons.name} (${cons.char}) matches the sound you hear?`,
        audioText: `${cons.char}${targetV.mark}`,
        audioMode: 'syllable',
        phoneticHint: `${cons.sound}${targetV.sound}`,
        correctId: `${cons.char}-${targetV.id}`,
        options: opts,
        explanation: `${cons.char}${targetV.mark} sounds like "${cons.sound}${targetV.sound}" — ${targetV.label}.`,
      });
    } else if (mode === 'dots') {
      const set = DOT_TRICKY_SETS[i % DOT_TRICKY_SETS.length];
      const shuffledItems = shuffle(set.items);
      const target = shuffledItems[Math.floor(Math.random() * shuffledItems.length)];
      questions.push({
        id: `q-d-${i}-${Date.now()}`,
        promptLabel: set.prompt,
        audioText: target.hebrew,
        audioMode: 'syllable',
        phoneticHint: target.phonetic,
        correctId: target.hebrew,
        options: shuffledItems.map((it) => ({
          id: it.hebrew,
          hebrew: it.hebrew,
          markExplanation: it.explain,
        })),
        explanation: `${target.hebrew} ("${target.phonetic}"): ${target.explain}.`,
      });
    } else if (mode === 'letters') {
      const groupIds = CONFUSABLE_LETTER_GROUPS[i % CONFUSABLE_LETTER_GROUPS.length];
      const groupLetters = shuffle(
        groupIds.map((id) => HEBREW_ALPHABET.find((l) => l.id === id)!).filter(Boolean)
      );
      const target = groupLetters[Math.floor(Math.random() * groupLetters.length)];
      questions.push({
        id: `q-l-${i}-${Date.now()}`,
        promptLabel: 'Listen to the Hebrew letter name & tap the matching letter:',
        audioText: target.hebrewName,
        audioMode: 'biblical',
        phoneticHint: `${target.name} (${target.modernSound.split('(')[0].trim()})`,
        correctId: target.id,
        options: groupLetters.map((l) => ({
          id: l.id,
          hebrew: l.dageshForm?.split(' ')[0] || l.letter,
          markExplanation: `${l.name} — ${l.modernSound}`,
        })),
        explanation: `${target.letter} is ${target.name} (${target.hebrewName}): ${target.modernSound}. Pictograph: ${target.pictographName}.`,
      });
    } else if (mode === 'syllables') {
      const grp = shuffle(SYLLABLE_GROUPS[i % SYLLABLE_GROUPS.length]);
      const target = grp[Math.floor(Math.random() * grp.length)];
      questions.push({
        id: `q-s-${i}-${Date.now()}`,
        promptLabel: 'Listen to the pointed Hebrew syllable & tap the exact match:',
        audioText: target.hebrew,
        audioMode: 'syllable',
        phoneticHint: target.phonetic,
        correctId: target.hebrew,
        options: grp.map((g) => ({
          id: g.hebrew,
          hebrew: g.hebrew,
          markExplanation: `${g.phonetic}: ${g.explain}`,
        })),
        explanation: `${target.hebrew} (${target.phonetic}) — ${target.explain}.`,
      });
    } else if (mode === 'pictographs') {
      const pool = shuffle(HEBREW_ALPHABET).slice(0, 4);
      const target = pool[0];
      questions.push({
        id: `q-p-${i}-${Date.now()}`,
        promptLabel: `Ancient Word Picture: "${target.pictographName}" (${target.wordPictureKeywords.slice(0, 3).join(', ')})`,
        audioText: target.hebrewName,
        audioMode: 'biblical',
        phoneticHint: target.name,
        pictographSvg: target.pictographSvg,
        correctId: target.id,
        options: shuffle(pool).map((l) => ({
          id: l.id,
          hebrew: l.letter,
          sublabel: l.paleoGlyph,
          markExplanation: `${l.name} = ${l.pictographName}`,
        })),
        explanation: `${target.letter} (${target.name}) comes from the pictograph of "${target.pictographName}" — keywords: ${target.wordPictureKeywords.join(', ')}.`,
      });
    } else {
      const pool = shuffle(STARTER_FLASHCARDS).slice(0, 4);
      const target = pool[0];
      questions.push({
        id: `q-w-${i}-${Date.now()}`,
        promptLabel: 'Listen to the Hebrew word and select the matching pointed word:',
        audioText: target.hebrew,
        audioMode: target.category === 'spoken' ? 'modern' : 'biblical',
        phoneticHint: target.transliteration,
        meaningHint: target.meaning,
        correctId: target.id,
        options: shuffle(pool).map((w) => ({
          id: w.id,
          hebrew: w.hebrew,
          markExplanation: `${w.transliteration} — "${w.meaning}"`,
        })),
        explanation: `${target.hebrew} (${target.transliteration}) means "${target.meaning}". Word picture: ${target.pictographNote}`,
      });
    }
  }

  return questions;
}

export const ListenMatchView: React.FC<{ onEarnXp: (xp: number) => void }> = ({ onEarnXp }) => {
  const [mode, setMode] = useState<DrillMode>('vowels');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => generateRound('vowels', 10));
  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showPhoneticHint, setShowPhoneticHint] = useState(true);
  const [soundFx, setSoundFx] = useState(true);
  const [finished, setFinished] = useState(false);

  const current = questions[qIndex];

  const playCurrentAudio = (slow = true) => {
    if (!current) return;
    speakHebrew(current.audioText, {
      mode: current.audioMode,
      slow,
      phoneticHint: current.phoneticHint,
    });
  };

  // Auto-play audio when moving to a new question
  useEffect(() => {
    if (!finished && current) {
      const timer = setTimeout(() => {
        playCurrentAudio(true);
      }, 220);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, mode, finished]);

  const startMode = (nextMode: DrillMode) => {
    setMode(nextMode);
    setQuestions(generateRound(nextMode, 10));
    setQIndex(0);
    setSelectedId(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
  };

  const handleChoose = (optId: string) => {
    if (selectedId || !current) return;
    setSelectedId(optId);
    const isCorrect = optId === current.correctId;
    if (soundFx) playTone(isCorrect);

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      onEarnXp(10);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelectedId(null);
    }
  };

  const progressPct = Math.round(((qIndex + (selectedId ? 1 : 0)) / questions.length) * 100);
  const pickedOption = current?.options.find((o) => o.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10] flex items-center gap-2">
            <Headphones className="w-7 h-7 text-amber-800" />
            Listen &amp; Match Trainer (Niqqud, Dots &amp; Sound)
          </h1>
          <p className="text-sm text-[#66543f]">
            Duolingo &amp; Rosetta Stone-style 4-option audio drills built specifically to master Hebrew vowel dots
            under, above, and inside every letter!
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setShowPhoneticHint((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-[#dfd1b7] text-xs font-semibold text-amber-950 flex items-center gap-1.5 cursor-pointer"
          >
            {showPhoneticHint ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showPhoneticHint ? 'Sound Clue: ON' : 'Ear-Only Mode'}
          </button>
          <button
            onClick={() => setSoundFx((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-[#dfd1b7] text-xs font-semibold text-amber-950 cursor-pointer"
          >
            Chimes: {soundFx ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Mode Selector Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {DRILL_MODES.map((m) => {
          const active = m.id === mode;
          return (
            <button
              key={m.id}
              onClick={() => startMode(m.id)}
              className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
                active
                  ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-sm'
                  : 'bg-white/90 border-[#e4d8c1] hover:border-amber-500 text-[#2b1e10]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm leading-snug">{m.title}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    active ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  {m.badge}
                </span>
              </div>
              <p className={`text-xs mt-1 leading-snug ${active ? 'text-amber-100/90' : 'text-[#6a5741]'}`}>
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Quiz Arena */}
      {finished ? (
        <div className="parchment-card rounded-3xl p-8 md:p-10 max-w-xl mx-auto text-center space-y-5">
          <Award className="w-16 h-16 text-amber-700 mx-auto" />
          <div>
            <h2 className="font-display text-3xl font-bold text-[#2b1e10]">Round Complete!</h2>
            <p className="text-sm text-[#66543f] mt-1">
              You scored <strong>{score} / {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%)
              • Best Streak: <strong>{bestStreak}</strong> • Earned <strong>+{score * 10} XP</strong>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => startMode(mode)}
              className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Practice Another 10
            </button>
            <button
              onClick={() => startMode(mode === 'vowels' ? 'dots' : mode === 'dots' ? 'syllables' : 'words')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 text-sm font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Next Challenge Mode
            </button>
          </div>
        </div>
      ) : (
        current && (
          <div className="parchment-card rounded-3xl p-5 sm:p-8 max-w-3xl mx-auto space-y-6">
            {/* Progress & Streak Header */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-3 bg-[#eadfcb] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#5b4733] shrink-0">
                {qIndex + 1} / {questions.length}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 shrink-0">
                <Flame className="w-3.5 h-3.5" /> {streak}
              </span>
            </div>

            {/* Prompt & Audio Controls */}
            <div className="text-center space-y-4 bg-[#f7efe0] rounded-2xl border border-[#e6d6b8] p-5 sm:p-6">
              <div className="text-sm font-semibold text-[#3a2a19]">{current.promptLabel}</div>

              {current.pictographSvg && (
                <svg
                  viewBox="0 0 64 64"
                  className="w-20 h-20 mx-auto text-amber-900"
                  dangerouslySetInnerHTML={{ __html: current.pictographSvg }}
                />
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => playCurrentAudio(true)}
                  className="px-6 py-3 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
                >
                  <Volume2 className="w-5 h-5" />
                  Listen Slowly
                </button>
                <button
                  onClick={() => playCurrentAudio(false)}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Normal Pace
                </button>
              </div>

              {showPhoneticHint && (
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#e4d5ba] text-xs font-bold text-amber-950">
                  <span>Sound: &ldquo;{current.phoneticHint}&rdquo;</span>
                  {current.meaningHint && (
                    <span className="text-[#6b5842] font-medium">• Meaning: {current.meaningHint}</span>
                  )}
                </div>
              )}
            </div>

            {/* 4 Big Tactile Hebrew Option Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
              {current.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const isCorrect = opt.id === current.correctId;
                let style =
                  'bg-white hover:bg-amber-50 border-[#e2d4bc] hover:border-amber-600 text-[#211a13]';
                if (selectedId) {
                  if (isCorrect) {
                    style = 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/30';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-red-50 border-red-500 text-red-950';
                  } else {
                    style = 'bg-white/60 border-[#ebe0cd] text-[#8a7761] opacity-70';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleChoose(opt.id)}
                    disabled={Boolean(selectedId)}
                    className={`rounded-2xl border-2 p-5 sm:p-6 text-center transition flex flex-col items-center justify-center gap-1.5 min-h-32 cursor-pointer disabled:cursor-default ${style}`}
                  >
                    <span className="font-hebrew-codex text-5xl sm:text-6xl leading-relaxed tracking-wide">
                      {opt.hebrew}
                    </span>
                    {opt.sublabel && (
                      <span className="font-paleo text-2xl opacity-70">{opt.sublabel}</span>
                    )}
                    {selectedId && (
                      <span className="text-[11px] font-semibold mt-1 leading-tight">
                        {opt.markExplanation}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback Drawer */}
            {selectedId && (
              <div
                className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedId === current.correctId
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {selectedId === current.correctId ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm space-y-0.5">
                    <div className="font-bold">
                      {selectedId === current.correctId
                        ? 'Correct! +10 XP'
                        : `Not quite — you tapped ${pickedOption?.hebrew} (${pickedOption?.markExplanation}).`}
                    </div>
                    <div>{current.explanation}</div>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {qIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
