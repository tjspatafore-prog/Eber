import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Flame,
  GraduationCap,
  Layers,
  Mic,
  ScrollText,
  Sparkles,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { CURRICULUM_STAGES, CurriculumLesson } from '../data/curriculum';
import { UserProfile } from '../lib/api';

interface DashboardViewProps {
  profile: UserProfile;
  dueFlashcardsCount: number;
  hasAnyAiKey: boolean;
  hasDeepgramKey: boolean;
  onNavigate: (tab: string) => void;
  onCompleteLesson: (lessonId: string) => void;
  onAskTutor: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  dueFlashcardsCount,
  hasAnyAiKey,
  hasDeepgramKey,
  onNavigate,
  onCompleteLesson,
  onAskTutor,
}) => {
  const totalLessons = CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const completedCount = profile.completedLessons.length;
  const masteryPct = Math.round((completedCount / totalLessons) * 100);

  const trackBadge = (track: CurriculumLesson['track']) => {
    if (track === 'biblical')
      return 'bg-amber-100 text-amber-900 border-amber-300';
    if (track === 'spoken')
      return 'bg-sky-100 text-sky-900 border-sky-300';
    return 'bg-indigo-100 text-indigo-900 border-indigo-300';
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="parchment-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/10 text-amber-950 text-xs font-semibold tracking-wide uppercase">
              <ScrollText className="w-3.5 h-3.5" />
              Dual-Track Mastery: Ancient Manuscripts + Living Speech
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-[#2b1e10]">
              Shalom! Welcome to <span className="text-amber-800">Eber</span>{' '}
              <span className="font-hebrew-biblical text-amber-900/80 text-3xl ml-1">עֵבֶר</span>
            </h1>
            <p className="text-sm md:text-base text-[#5c4a35] leading-relaxed">
              Journey from complete beginner to fluent reader of the <strong>Leningrad Codex</strong>,{' '}
              <strong>Aleppo Codex</strong>, and <strong>Dead Sea Scrolls</strong> — learning ancient word
              pictures, Tiberian vowels &amp; cantillation, and Modern/Sephardi spoken Hebrew along the way.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onNavigate('alphabet')}
              className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              Study Aleph-Bet
            </button>
            <button
              onClick={() => onNavigate('manuscripts')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 font-medium text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ScrollText className="w-4 h-4" />
              Open Manuscripts
            </button>
          </div>
        </div>

        {/* Setup Prompt if keys missing */}
        {(!hasAnyAiKey || !hasDeepgramKey) && (
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/90 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-amber-950">
              <strong>Connect your API keys when ready:</strong>{' '}
              {!hasAnyAiKey && 'Add your Google Gemini (or OpenAI/Claude/Grok/Kimi/Qwen) key for AI tutoring & cheap mnemonic pictures. '}
              {!hasDeepgramKey && 'Add your Deepgram key for Hebrew pronunciation scoring & voice conversation.'}
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-semibold hover:bg-amber-950 shrink-0 cursor-pointer"
            >
              Configure APIs →
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="parchment-card rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6e5c46] font-medium">Scholar XP</div>
            <div className="text-2xl font-bold text-[#2b1e10]">{profile.xp}</div>
          </div>
        </div>

        <div className="parchment-card rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6e5c46] font-medium">Letters Mastered</div>
            <div className="text-2xl font-bold text-[#2b1e10]">
              {profile.masteredLetters.length} <span className="text-sm font-normal text-[#7a6852]">/ 22</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('flashcards')}
          className="parchment-card rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6e5c46] font-medium">Flashcards Due</div>
            <div className="text-2xl font-bold text-[#2b1e10]">{dueFlashcardsCount}</div>
          </div>
        </div>

        <div
          onClick={() => onNavigate('speaking')}
          className="parchment-card rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:border-amber-400 transition"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#6e5c46] font-medium">Roadmap Progress</div>
            <div className="text-2xl font-bold text-[#2b1e10]">{masteryPct}%</div>
          </div>
        </div>
      </div>

      {/* 7-Stage Beginner-to-Manuscript Roadmap */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2b1e10] flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-800" />
              7-Stage Mastery Path: Beginner to Ancient Manuscripts
            </h2>
            <p className="text-sm text-[#6b5842]">
              Follow step-by-step or jump into any stage. Click &ldquo;Teach with AI Scribe&rdquo; for a guided interactive lesson.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-amber-900">
              {completedCount} / {totalLessons} Lessons Complete
            </div>
            <div className="w-40 h-2 bg-amber-900/15 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-amber-700 rounded-full transition-all"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {CURRICULUM_STAGES.map((stage) => {
            const stageDone = stage.lessons.filter((l) => profile.completedLessons.includes(l.id)).length;
            return (
              <div key={stage.stage} className="parchment-card rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eadfcb] pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-50 text-xs font-bold">
                        Stage {stage.stage}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                        {stage.level}
                      </span>
                      <span className="font-hebrew-biblical text-base text-[#6b5842]">
                        {stage.hebrewTitle}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#2b1e10] mt-1">{stage.title}</h3>
                    <p className="text-xs text-[#66543f] mt-0.5">{stage.goal}</p>
                  </div>
                  <div className="text-xs font-semibold text-[#5f4d39] shrink-0">
                    {stageDone} / {stage.lessons.length} done
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {stage.lessons.map((lesson) => {
                    const isDone = profile.completedLessons.includes(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`rounded-xl p-4 border transition flex flex-col justify-between gap-3 ${
                          isDone
                            ? 'bg-emerald-50/50 border-emerald-200'
                            : 'bg-white/80 border-[#e7dcc7] hover:border-amber-400'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${trackBadge(
                                lesson.track
                              )}`}
                            >
                              {lesson.track} • {lesson.durationMin}m
                            </span>
                            <button
                              onClick={() => onCompleteLesson(lesson.id)}
                              title={isDone ? 'Completed' : 'Mark lesson complete'}
                              className="text-emerald-700 hover:scale-110 transition cursor-pointer"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#bba98f]" />
                              )}
                            </button>
                          </div>

                          <div className="font-hebrew-biblical text-xl text-amber-950 bg-[#f8f1e2] px-3 py-1.5 rounded-lg text-center border border-[#ece0c9]">
                            {lesson.hebrewFocus}
                          </div>

                          <h4 className="font-semibold text-sm text-[#2b1e10] leading-snug">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-[#66543f] leading-relaxed">{lesson.summary}</p>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-[#efe5d3]">
                          <button
                            onClick={() => onNavigate(lesson.actionTab)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#f4ead7] hover:bg-amber-200/70 text-amber-950 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            Practice <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onAskTutor(lesson.tutorPrompt)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Lesson
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
