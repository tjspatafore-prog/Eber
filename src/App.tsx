import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  Compass,
  Layers,
  Mic,
  Music,
  ScrollText,
  Settings,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { api, Flashcard, KeyStatusMap, SavedLesson, SettingsData, UserProfile } from './lib/api';
import { countCachedBrowserImages, loadLocalJson, LS_KEYS, saveLocalJson } from './lib/localCache';
import { STARTER_FLASHCARDS } from './data/curriculum';
import { DashboardView } from './components/DashboardView';
import { AlphabetView } from './components/AlphabetView';
import { NiqqudView } from './components/NiqqudView';
import { ManuscriptReaderView } from './components/ManuscriptReaderView';
import { SpeakingView } from './components/SpeakingView';
import { FlashcardsView } from './components/FlashcardsView';
import { QueuedTutorRequest, TutorChatView } from './components/TutorChatView';
import { SavedLessonsView } from './components/SavedLessonsView';
import { SettingsView } from './components/SettingsView';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Mastery Path', icon: Compass },
  { id: 'alphabet', label: 'Aleph-Bet & Pictures', icon: BookOpen },
  { id: 'niqqud', label: 'Vowels & Cantillation', icon: Music },
  { id: 'manuscripts', label: 'Manuscript Reader', icon: ScrollText },
  { id: 'speaking', label: 'Speak & Pronounce', icon: Mic },
  { id: 'flashcards', label: 'Visual Flashcards', icon: Layers },
  { id: 'tutor', label: 'AI Scribe Chat', icon: Sparkles },
  { id: 'saved-lessons', label: 'Saved Lessons', icon: Bookmark },
  { id: 'settings', label: 'API & Settings', icon: Settings },
] as const;

const DEFAULT_PROFILE: UserProfile = {
  xp: 0,
  streakDays: 1,
  lastStudyDate: new Date().toISOString().slice(0, 10),
  completedLessons: [],
  masteredLetters: [],
  readPassages: [],
  speakingSessions: 0,
};

const DEFAULT_SETTINGS: SettingsData = {
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

function makeStarterCards(): Flashcard[] {
  const now = Date.now();
  return STARTER_FLASHCARDS.map((c) => ({
    ...c,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now,
  }));
}

function applySm2(card: Flashcard, quality: 1 | 2 | 3 | 4): Flashcard {
  const qMap = { 1: 1, 2: 3, 3: 4, 4: 5 };
  const q = qMap[quality] ?? 4;
  let ease = card.ease ?? 2.5;
  let reps = card.repetitions ?? 0;
  let interval = card.intervalDays ?? 0;

  if (q < 3) {
    reps = 0;
    interval = 0.01;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }
  ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return {
    ...card,
    ease: Number(ease.toFixed(2)),
    repetitions: reps,
    intervalDays: interval,
    dueAt: Date.now() + interval * 86400000,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deployment, setDeployment] = useState<'local' | 'vercel'>('local');
  const [pinProtected, setPinProtected] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(() =>
    loadLocalJson<UserProfile>(LS_KEYS.PROFILE, DEFAULT_PROFILE)
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = loadLocalJson<Flashcard[]>(LS_KEYS.FLASHCARDS, []);
    return saved.length > 0 ? saved : makeStarterCards();
  });
  const [savedLessons, setSavedLessons] = useState<SavedLesson[]>(() =>
    loadLocalJson<SavedLesson[]>(LS_KEYS.SAVED_LESSONS, [])
  );
  const [selectedSavedLessonId, setSelectedSavedLessonId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsData>(() =>
    loadLocalJson<SettingsData>(LS_KEYS.SETTINGS, DEFAULT_SETTINGS)
  );
  const [keys, setKeys] = useState<KeyStatusMap>({});
  const [cacheStats, setCacheStats] = useState({ cachedImages: 0, cachedAudio: 0 });
  const [queuedTutorRequest, setQueuedTutorRequest] = useState<QueuedTutorRequest | null>(null);

  useEffect(() => {
    saveLocalJson(LS_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    saveLocalJson(LS_KEYS.FLASHCARDS, flashcards);
  }, [flashcards]);

  useEffect(() => {
    saveLocalJson(LS_KEYS.SAVED_LESSONS, savedLessons);
  }, [savedLessons]);

  useEffect(() => {
    saveLocalJson(LS_KEYS.SETTINGS, settings);
  }, [settings]);

  const loadInitial = async () => {
    const browserImgCount = await countCachedBrowserImages();
    try {
      const settingsRes = await api.getSettings();
      setDeployment(settingsRes.deployment || 'local');
      setPinProtected(Boolean(settingsRes.pinProtected));
      setSettings(settingsRes.settings);
      setKeys(settingsRes.keys);
      setCacheStats({
        cachedImages: Math.max(settingsRes.cacheStats.cachedImages, browserImgCount),
        cachedAudio: settingsRes.cacheStats.cachedAudio,
      });

      if (settingsRes.deployment !== 'vercel') {
        const storeRes = await api.getStore();
        setProfile(storeRes.profile);
        if (Array.isArray(storeRes.savedLessons) && storeRes.savedLessons.length > 0) {
          setSavedLessons(storeRes.savedLessons);
        }
        if (storeRes.flashcards.length === 0) {
          let latestCards: Flashcard[] = [];
          for (const sc of STARTER_FLASHCARDS) {
            const r = await api.upsertFlashcard(sc);
            latestCards = r.flashcards;
          }
          setFlashcards(latestCards);
        } else {
          setFlashcards(storeRes.flashcards);
        }
      }
    } catch {
      setCacheStats((prev) => ({ ...prev, cachedImages: browserImgCount }));
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const hasAnyAiKey = Boolean(
    keys.GEMINI_API_KEY?.configured ||
      keys.OPENAI_API_KEY?.configured ||
      keys.ANTHROPIC_API_KEY?.configured ||
      keys.GROK_API_KEY?.configured ||
      keys.KIMI_API_KEY?.configured ||
      keys.QWEN_API_KEY?.configured
  );
  const hasDeepgramKey = Boolean(keys.DEEPGRAM_API_KEY?.configured);

  const dueCount = flashcards.filter((c) => (c.dueAt ?? 0) <= Date.now()).length;

  const handleAskTutor = (prompt: string, meta?: { title?: string; lessonId?: string }) => {
    setQueuedTutorRequest({ prompt, title: meta?.title, lessonId: meta?.lessonId });
    setActiveTab('tutor');
  };

  const handleOpenSavedLesson = (savedId: string) => {
    setSelectedSavedLessonId(savedId);
    setActiveTab('saved-lessons');
  };

  const handleSaveLesson = async (lesson: Partial<SavedLesson>): Promise<SavedLesson> => {
    const now = Date.now();
    const record: SavedLesson = {
      id: lesson.id || `lesson_${now}_${Math.random().toString(36).slice(2, 7)}`,
      title: lesson.title || 'Saved Hebrew Lesson',
      lessonId: lesson.lessonId || '',
      prompt: lesson.prompt || '',
      content: lesson.content || '',
      provider: lesson.provider || '',
      model: lesson.model || '',
      createdAt: lesson.createdAt || now,
      updatedAt: now,
    };

    setSavedLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...lesson, updatedAt: now };
        return copy;
      }
      return [record, ...prev];
    });

    if (deployment !== 'vercel') {
      try {
        const res = await api.upsertSavedLesson(record);
        setSavedLessons(res.savedLessons);
      } catch {
        // localStorage already persisted it
      }
    }
    return record;
  };

  const handleUpdateSavedLesson = async (lesson: Partial<SavedLesson>) => {
    const now = Date.now();
    setSavedLessons((prev) =>
      prev.map((l) => (l.id === lesson.id ? { ...l, ...lesson, updatedAt: now } : l))
    );
    if (deployment !== 'vercel') {
      try {
        const res = await api.upsertSavedLesson(lesson);
        setSavedLessons(res.savedLessons);
      } catch {
        // local state updated
      }
    }
  };

  const handleDeleteSavedLesson = async (id: string) => {
    setSavedLessons((prev) => prev.filter((l) => l.id !== id));
    if (deployment !== 'vercel') {
      try {
        const res = await api.deleteSavedLesson(id);
        setSavedLessons(res.savedLessons);
      } catch {
        // local state updated
      }
    }
  };

  const handleCompleteLesson = async (lessonId: string) => {
    setProfile((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        xp: prev.xp + 25,
      };
    });
    if (deployment !== 'vercel') {
      try {
        const res = await api.completeLesson(lessonId);
        setProfile(res.profile);
      } catch {
        // local state already updated
      }
    }
  };

  const handleToggleLetter = async (letterId: string, mastered: boolean) => {
    setProfile((prev) => {
      const exists = prev.masteredLetters.includes(letterId);
      if (mastered && !exists) {
        return { ...prev, masteredLetters: [...prev.masteredLetters, letterId], xp: prev.xp + 15 };
      }
      if (!mastered && exists) {
        return { ...prev, masteredLetters: prev.masteredLetters.filter((x) => x !== letterId) };
      }
      return prev;
    });
    if (deployment !== 'vercel') {
      try {
        const res = await api.toggleLetterMastery(letterId, mastered);
        setProfile(res.profile);
      } catch {
        // local state already updated
      }
    }
  };

  const handleMarkPassage = async (passageId: string) => {
    setProfile((prev) => {
      if (prev.readPassages.includes(passageId)) return prev;
      return { ...prev, readPassages: [...prev.readPassages, passageId], xp: prev.xp + 30 };
    });
    if (deployment !== 'vercel') {
      try {
        const res = await api.markPassageRead(passageId);
        setProfile(res.profile);
      } catch {
        // local state already updated
      }
    }
  };

  const handleAddFlashcard = async (card: Partial<Flashcard>) => {
    const now = Date.now();
    setFlashcards((prev) => {
      const idx = card.id ? prev.findIndex((c) => c.id === card.id) : -1;
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...card };
        return copy;
      }
      return [
        ...prev,
        {
          id: card.id || `card_${now}_${Math.random().toString(36).slice(2, 7)}`,
          hebrew: card.hebrew || '',
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
        },
      ];
    });
    if (deployment !== 'vercel') {
      try {
        const res = await api.upsertFlashcard(card);
        setFlashcards(res.flashcards);
      } catch {
        // local state already updated
      }
    }
  };

  const handleReviewFlashcard = async (id: string, quality: 1 | 2 | 3 | 4) => {
    setFlashcards((prev) => prev.map((c) => (c.id === id ? applySm2(c, quality) : c)));
    setProfile((prev) => ({ ...prev, xp: prev.xp + (quality >= 3 ? 10 : 3) }));
    if (deployment !== 'vercel') {
      try {
        const res = await api.reviewFlashcard(id, quality);
        setProfile(res.profile);
        setFlashcards((prev) => prev.map((c) => (c.id === id ? res.card : c)));
      } catch {
        // local state already updated
      }
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
    if (deployment !== 'vercel') {
      try {
        const res = await api.deleteFlashcard(id);
        setFlashcards(res.flashcards);
      } catch {
        // local state already updated
      }
    }
  };

  const handleChangeTutorProvider = async (provider: SettingsData['tutorProvider']) => {
    const next = { ...settings, tutorProvider: provider };
    setSettings(next);
    saveLocalJson(LS_KEYS.SETTINGS, next);
    try {
      await api.saveSettings({ settings: { tutorProvider: provider } });
    } catch {
      // local settings already saved
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf6ee] text-[#211a13]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#241a11] text-[#f5ebd8] border-r border-[#3b2c1d] sticky top-0 h-screen">
        <div className="p-5 border-b border-[#3b2c1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-600/25 border border-amber-500/40 flex items-center justify-center font-hebrew-biblical text-2xl text-amber-300">
              ע
            </div>
            <div>
              <div className="font-display text-2xl font-bold leading-none text-amber-100">
                Eber
              </div>
              <div className="text-[11px] text-amber-300/80 mt-0.5">Biblical &amp; Spoken Hebrew</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  active
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-[#dfd0b8] hover:bg-[#332619] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.id === 'flashcards' && dueCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-100">
                    {dueCount}
                  </span>
                )}
                {item.id === 'saved-lessons' && savedLessons.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100">
                    {savedLessons.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#3b2c1d] space-y-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#c5b398]">AI Scribe ({settings.tutorProvider})</span>
            <span className={hasAnyAiKey ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {hasAnyAiKey ? '● Ready' : '○ Setup'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#c5b398]">Deepgram Nova-3</span>
            <span className={hasDeepgramKey ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {hasDeepgramKey ? '● Ready' : '○ Setup'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#241a11] text-amber-100 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="font-hebrew-biblical text-2xl text-amber-300">ע</span>
            <span className="font-display text-xl font-bold">Eber Hebrew</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg bg-[#35271a] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#2b1f14] text-amber-100 p-3 grid grid-cols-2 gap-1.5 border-b border-[#423222]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === item.id ? 'bg-amber-700 text-white' : 'text-[#e3d4bc]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" /> {item.label}
                  </span>
                  {item.id === 'saved-lessons' && savedLessons.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/30">
                      {savedLessons.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              dueFlashcardsCount={dueCount}
              savedLessons={savedLessons}
              hasAnyAiKey={hasAnyAiKey}
              hasDeepgramKey={hasDeepgramKey}
              onNavigate={setActiveTab}
              onCompleteLesson={handleCompleteLesson}
              onAskTutor={handleAskTutor}
              onOpenSavedLesson={handleOpenSavedLesson}
            />
          )}

          {activeTab === 'alphabet' && (
            <AlphabetView
              masteredLetters={profile.masteredLetters}
              onToggleMastery={handleToggleLetter}
              onAddFlashcard={handleAddFlashcard}
              onAskTutor={handleAskTutor}
            />
          )}

          {activeTab === 'niqqud' && <NiqqudView onAskTutor={handleAskTutor} />}

          {activeTab === 'manuscripts' && (
            <ManuscriptReaderView
              readPassages={profile.readPassages}
              onMarkPassageRead={handleMarkPassage}
              onAddFlashcard={handleAddFlashcard}
              onAskTutor={handleAskTutor}
              onSaveLesson={handleSaveLesson}
              onOpenSavedLesson={handleOpenSavedLesson}
            />
          )}

          {activeTab === 'speaking' && <SpeakingView />}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              flashcards={flashcards}
              onReview={handleReviewFlashcard}
              onAddCard={handleAddFlashcard}
              onDeleteCard={handleDeleteFlashcard}
              onUpdateCard={handleAddFlashcard}
            />
          )}

          {activeTab === 'tutor' && (
            <TutorChatView
              settings={settings}
              queuedRequest={queuedTutorRequest}
              savedLessons={savedLessons}
              onConsumeQueuedRequest={() => setQueuedTutorRequest(null)}
              onChangeProvider={handleChangeTutorProvider}
              onSaveLesson={handleSaveLesson}
              onOpenSavedLesson={handleOpenSavedLesson}
            />
          )}

          {activeTab === 'saved-lessons' && (
            <SavedLessonsView
              lessons={savedLessons}
              initialSelectedId={selectedSavedLessonId}
              onConsumeInitialSelected={() => setSelectedSavedLessonId(null)}
              onUpdateLesson={handleUpdateSavedLesson}
              onDeleteLesson={handleDeleteSavedLesson}
              onContinueInTutor={(prompt) => handleAskTutor(prompt)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              deployment={deployment}
              pinProtected={pinProtected}
              settings={settings}
              keys={keys}
              cacheStats={cacheStats}
              onUpdated={(nextS, nextK) => {
                setSettings(nextS);
                setKeys(nextK);
              }}
              onRefresh={loadInitial}
            />
          )}
        </main>
      </div>
    </div>
  );
}
