import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  Check,
  Copy,
  Download,
  Edit3,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { SavedLesson, speakHebrew } from '../lib/api';

interface SavedLessonsViewProps {
  lessons: SavedLesson[];
  initialSelectedId?: string | null;
  onConsumeInitialSelected?: () => void;
  onUpdateLesson: (lesson: Partial<SavedLesson>) => Promise<void>;
  onDeleteLesson: (id: string) => Promise<void>;
  onContinueInTutor: (prompt: string) => void;
}

/**
 * Clean lightweight markdown renderer tailored for Hebrew study lessons
 * (headings, bold, italic, bullets, horizontal rules, inline code).
 */
function renderStudyMarkdown(content: string): React.ReactNode[] {
  const lines = content.split(/\r?\n/);

  const formatInline = (text: string, keyPrefix: string) => {
    const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return (
          <strong key={`${keyPrefix}-${i}`} className="font-bold text-[#211a13]">
            {tok.slice(2, -2)}
          </strong>
        );
      }
      if (tok.startsWith('`') && tok.endsWith('`')) {
        return (
          <code
            key={`${keyPrefix}-${i}`}
            className="px-1.5 py-0.5 rounded bg-[#f3e9d6] text-amber-950 text-[13px] font-mono"
          >
            {tok.slice(1, -1)}
          </code>
        );
      }
      if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
        return <em key={`${keyPrefix}-${i}`}>{tok.slice(1, -1)}</em>;
      }
      return <React.Fragment key={`${keyPrefix}-${i}`}>{tok}</React.Fragment>;
    });
  };

  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2" />;
    if (/^---+$/.test(trimmed)) {
      return <hr key={idx} className="my-3 border-[#e5d8c0]" />;
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="font-display text-lg font-bold text-amber-950 mt-4 mb-1">
          {formatInline(trimmed.slice(4), `h4-${idx}`)}
        </h4>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h3 key={idx} className="font-display text-xl font-bold text-[#2b1e10] mt-5 mb-1.5 border-b border-[#efe5d3] pb-1">
          {formatInline(trimmed.slice(3), `h3-${idx}`)}
        </h3>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h2 key={idx} className="font-display text-2xl font-bold text-[#2b1e10] mt-4 mb-2">
          {formatInline(trimmed.slice(2), `h2-${idx}`)}
        </h2>
      );
    }
    if (/^[-*•]\s+/.test(trimmed)) {
      return (
        <div key={idx} className="flex gap-2 pl-2 my-1">
          <span className="text-amber-800 font-bold">•</span>
          <div className="flex-1 leading-relaxed">
            {formatInline(trimmed.replace(/^[-*•]\s+/, ''), `li-${idx}`)}
          </div>
        </div>
      );
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const m = trimmed.match(/^(\d+\.)\s+(.*)$/);
      return (
        <div key={idx} className="flex gap-2 pl-2 my-1">
          <span className="text-amber-900 font-bold shrink-0">{m?.[1]}</span>
          <div className="flex-1 leading-relaxed">{formatInline(m?.[2] || trimmed, `ol-${idx}`)}</div>
        </div>
      );
    }
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      return (
        <div key={idx} className="font-mono text-xs bg-[#faf4e8] px-2.5 py-1 border-x border-[#e6d9c2] overflow-x-auto">
          {trimmed}
        </div>
      );
    }
    return (
      <p key={idx} className="leading-relaxed my-1">
        {formatInline(line, `p-${idx}`)}
      </p>
    );
  });
}

export const SavedLessonsView: React.FC<SavedLessonsViewProps> = ({
  lessons,
  initialSelectedId,
  onConsumeInitialSelected,
  onUpdateLesson,
  onDeleteLesson,
  onContinueInTutor,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(lessons[0]?.id || null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialSelectedId) {
      setSelectedId(initialSelectedId);
      onConsumeInitialSelected?.();
    }
  }, [initialSelectedId, onConsumeInitialSelected]);

  const filtered = lessons.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.content.toLowerCase().includes(q) ||
      (l.prompt || '').toLowerCase().includes(q)
    );
  });

  const active =
    filtered.find((l) => l.id === selectedId) ||
    lessons.find((l) => l.id === selectedId) ||
    filtered[0] ||
    null;

  const extractHebrewPhrases = (text: string): string[] => {
    const matches = text.match(/[\u0590-\u05FF][\u0590-\u05FF\s־]{1,36}/g) || [];
    return [...new Set(matches.map((m) => m.trim()).filter((m) => m.length >= 2))].slice(0, 12);
  };

  const handleStartRename = () => {
    if (!active) return;
    setTitleDraft(active.title);
    setEditingTitle(true);
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !titleDraft.trim()) return;
    await onUpdateLesson({ id: active.id, title: titleDraft.trim() });
    setEditingTitle(false);
  };

  const handleCopy = async () => {
    if (!active) return;
    await navigator.clipboard.writeText(`# ${active.title}\n\n${active.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!active) return;
    const blob = new Blob([`# ${active.title}\n\n${active.content}\n`], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${active.title.replace(/[^a-z0-9-_]+/gi, '_').slice(0, 50) || 'hebrew_lesson'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hebrewSnippets = active ? extractHebrewPhrases(active.content) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10] flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-amber-800" />
            Saved Hebrew Lessons Library
          </h1>
          <p className="text-sm text-[#66543f]">
            Re-read your saved AI Scribe lessons &amp; passage studies anytime — stored permanently on your device so you
            never have to regenerate them.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#8c7860] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved lessons or Hebrew..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#dfd1b7] bg-white text-xs focus:outline-none focus:border-amber-700"
          />
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="parchment-card rounded-2xl p-10 text-center space-y-3 max-w-xl mx-auto">
          <BookOpen className="w-12 h-12 text-amber-800/40 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-[#2b1e10]">No Saved Lessons Yet</h2>
          <p className="text-sm text-[#66543f]">
            Whenever the <strong>AI Scribe</strong> creates a lesson (or analyzes a Bible passage in the{' '}
            <strong>Manuscript Reader</strong>), click <strong>Save Lesson</strong> and it will appear right here for
            unlimited offline reading!
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Lesson List */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
            {filtered.map((item) => {
              const isSelected = active?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setEditingTitle(false);
                  }}
                  className={`w-full text-left rounded-xl p-3.5 border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-sm'
                      : 'bg-white border-[#e4d8c1] hover:border-amber-500 text-[#2b1e10]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-semibold opacity-80">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.model && <span className="truncate max-w-36">{item.model}</span>}
                  </div>
                  <div className="font-bold text-sm mt-1 leading-snug line-clamp-2">{item.title}</div>
                  <div
                    className={`text-xs mt-1 line-clamp-2 ${
                      isSelected ? 'text-amber-100/90' : 'text-[#6a5741]'
                    }`}
                  >
                    {item.content.replace(/[#*`]/g, '').slice(0, 110)}...
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-xs text-[#7a664e] text-center py-8">No lessons match &ldquo;{search}&rdquo;.</div>
            )}
          </div>

          {/* Right: Full Lesson Reader */}
          {active && (
            <div className="lg:col-span-8 parchment-card rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#eadfcb] pb-4">
                <div className="flex-1 min-w-0">
                  {editingTitle ? (
                    <form onSubmit={handleSaveTitle} className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="flex-1 rounded-lg border border-amber-600 bg-white px-2.5 py-1 text-base font-bold"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-bold text-[#2b1e10] break-words">
                        {active.title}
                      </h2>
                      <button
                        onClick={handleStartRename}
                        className="p-1 rounded-md text-[#8c7860] hover:text-amber-900 cursor-pointer shrink-0"
                        title="Rename lesson"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-[#78634a] mt-1">
                    Saved {new Date(active.createdAt).toLocaleString()}
                    {active.provider ? ` • ${active.provider}` : ''}
                    {active.model ? ` (${active.model})` : ''}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadMd}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> .md
                  </button>
                  <button
                    onClick={() =>
                      onContinueInTutor(
                        `Let's continue studying my saved lesson titled "${active.title}". Quiz me with 3 quick review questions based on this lesson, or expand on the key roots:\n\n${active.content.slice(0, 1200)}`
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Review with AI
                  </button>
                  <button
                    onClick={() => onDeleteLesson(active.id)}
                    className="p-1.5 rounded-lg text-[#8c7860] hover:text-red-700 cursor-pointer"
                    title="Delete saved lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Audio Chips for Hebrew Words in This Lesson */}
              {hebrewSnippets.length > 0 && (
                <div className="rounded-xl bg-[#f7efe0] border border-[#e6d6b8] p-3 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Tap Any Hebrew Word from This Lesson to Hear It
                  </div>
                  <div className="flex flex-wrap gap-1.5" dir="rtl">
                    {hebrewSnippets.map((word) => (
                      <button
                        key={word}
                        onClick={() => speakHebrew(word, { mode: 'biblical', slow: true })}
                        className="font-hebrew-biblical text-lg px-2.5 py-0.5 rounded-lg bg-white hover:bg-amber-100 border border-[#e0d0b3] text-[#211a13] cursor-pointer transition"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Body */}
              <div className="text-sm text-[#2c2014] space-y-0.5">{renderStudyMarkdown(active.content)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
