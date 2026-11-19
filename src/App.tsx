import React, { useEffect, useState } from 'react';
import {
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
import { api, Flashcard, KeyStatusMap, SettingsData, UserProfile } from './lib/api';
import { STARTER_FLASHCARDS } from './data/curriculum';
import { DashboardView } from './components/DashboardView';
import { AlphabetView } from './components/AlphabetView';
import { NiqqudView } from './components/NiqqudView';
import { ManuscriptReaderView } from './components/ManuscriptReaderView';
import { SpeakingView } from './components/SpeakingView';
import { FlashcardsView } from './components/FlashcardsView';
import { TutorChatView } from './components/TutorChatView';
import { SettingsView } from './components/SettingsView';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Mastery Path', icon: Compass },
  { id: 'alphabet', label: 'Aleph-Bet & Pictures', icon: BookOpen },
  { id: 'niqqud', label: 'Vowels & Cantillation', icon: Music },
  { id: 'manuscripts', label: 'Manuscript Reader', icon: ScrollText },
  { id: 'speaking', label: 'Speak & Pronounce', icon: Mic },
  { id: 'flashcards', label: 'Visual Flashcards', icon: Layers },
  { id: 'tutor', label: 'AI Scribe Chat', icon: Sparkles },
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

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [keys, setKeys] = useState<KeyStatusMap>({});
  const [cacheStats, setCacheStats] = useState({ cachedImages: 0, cachedAudio: 0 });
  const [queuedTutorPrompt, setQueuedTutorPrompt] = useState<string | null>(null);

  const loadInitial = async () => {
    try {
      const [storeRes, settingsRes] = await Promise.all([api.getStore(), api.getSettings()]);
      setProfile(storeRes.profile);
      setSettings(settingsRes.settings);
      setKeys(settingsRes.keys);
      setCacheStats(settingsRes.cacheStats);

      // Seed starter flashcards on first run
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
    } catch {
      // Fallback if API server is still booting
      setFlashcards(
        STARTER_FLASHCARDS.map((c) => ({
          ...c,
          ease: 2.5,
          intervalDays: 0,
          repetitions: 0,
          dueAt: Date.now(),
        }))
      );
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

  const handleAskTutor = (prompt: string) => {
    setQueuedTutorPrompt(prompt);
    setActiveTab('tutor');
  };

  const handleCompleteLesson = async (lessonId: string) => {
    const res = await api.completeLesson(lessonId);
    setProfile(res.profile);
  };

  const handleToggleLetter = async (letterId: string, mastered: boolean) => {
    const res = await api.toggleLetterMastery(letterId, mastered);
    setProfile(res.profile);
  };

  const handleMarkPassage = async (passageId: string) => {
    const res = await api.markPassageRead(passageId);
    setProfile(res.profile);
  };

  const handleAddFlashcard = async (card: Partial<Flashcard>) => {
    const res = await api.upsertFlashcard(card);
    setFlashcards(res.flashcards);
  };

  const handleReviewFlashcard = async (id: string, quality: 1 | 2 | 3 | 4) => {
    const res = await api.reviewFlashcard(id, quality);
    setProfile(res.profile);
    setFlashcards((prev) => prev.map((c) => (c.id === id ? res.card : c)));
  };

  const handleDeleteFlashcard = async (id: string) => {
    const res = await api.deleteFlashcard(id);
    setFlashcards(res.flashcards);
  };

  const handleChangeTutorProvider = async (provider: SettingsData['tutorProvider']) => {
    const res = await api.saveSettings({ settings: { tutorProvider: provider } });
    setSettings(res.settings);
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                    activeTab === item.id ? 'bg-amber-700 text-white' : 'text-[#e3d4bc]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {item.label}
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
              hasAnyAiKey={hasAnyAiKey}
              hasDeepgramKey={hasDeepgramKey}
              onNavigate={setActiveTab}
              onCompleteLesson={handleCompleteLesson}
              onAskTutor={handleAskTutor}
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
              queuedPrompt={queuedTutorPrompt}
              onConsumeQueuedPrompt={() => setQueuedTutorPrompt(null)}
              onChangeProvider={handleChangeTutorProvider}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              keys={keys}
              cacheStats={cacheStats}
              onUpdated={(nextS, nextK) => {
                setSettings(nextS);
                setKeys(nextK);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
