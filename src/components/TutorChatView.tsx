import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Loader2, Send, Sparkles, Trash2, Volume2 } from 'lucide-react';
import { api, SavedLesson, SettingsData, speakHebrew } from '../lib/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  meta?: string;
  provider?: string;
  model?: string;
  sourcePrompt?: string;
  suggestedTitle?: string;
  lessonId?: string;
}

export interface QueuedTutorRequest {
  prompt: string;
  title?: string;
  lessonId?: string;
}

interface TutorChatViewProps {
  settings: SettingsData;
  queuedRequest: QueuedTutorRequest | null;
  savedLessons: SavedLesson[];
  onConsumeQueuedRequest: () => void;
  onChangeProvider: (provider: SettingsData['tutorProvider']) => void;
  onSaveLesson: (lesson: Partial<SavedLesson>) => Promise<SavedLesson>;
  onOpenSavedLesson: (savedId: string) => void;
}

const QUICK_PROMPTS = [
  'Give me a Friends-of-Eber style ancient word picture + scholarly root study of בְּרֵאשִׁית (Bereshit).',
  'Compare how Isaiah 53:11 differs between the Dead Sea Scrolls (1QIsa-a) and the Masoretic Leningrad/Aleppo Codices.',
  'Teach me the 10 most common Biblical Hebrew prefixes and suffixes with quick memory hooks.',
  'Bridge 6 Biblical Hebrew words into everyday Modern Israeli conversation sentences I can speak today.',
];

function deriveLessonTitle(content: string, prompt?: string, suggested?: string): string {
  if (suggested && suggested.trim()) return suggested.trim();
  const headingMatch = content.match(/^#{1,3}\s+(.+)$/m);
  if (headingMatch?.[1]) {
    return headingMatch[1].replace(/[*`]/g, '').trim().slice(0, 80);
  }
  if (prompt) {
    return prompt.replace(/\s+/g, ' ').trim().slice(0, 72);
  }
  return 'Hebrew Study Lesson';
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  settings,
  queuedRequest,
  savedLessons,
  onConsumeQueuedRequest,
  onChangeProvider,
  onSaveLesson,
  onOpenSavedLesson,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'שָׁלוֹם! (Shalom!) I am **Eber**, your Biblical & Spoken Hebrew Scribe.\n\nAsk me anything — from your very first Aleph-Bet letter and ancient Proto-Sinaitic word pictures (*Friends of Eber* style), to Tiberian vowels & cantillation, 7 Binyanim verbs, Modern Hebrew conversation, or comparing the **Leningrad Codex**, **Aleppo Codex**, and **Dead Sea Scrolls**!\n\nTip: Click **Save Lesson** on any reply to keep it forever in your **Saved Lessons** tab.',
      meta: 'Eber Scribe',
    },
  ]);
  const [savedMsgMap, setSavedMsgMap] = useState<Record<string, string>>({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async (text: string, metaCtx?: { title?: string; lessonId?: string }) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError('');
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const nextHistory: ChatMessage[] = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const apiMsgs = nextHistory.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.chat(apiMsgs, settings.tutorProvider);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: res.text,
          meta: `${res.provider} • ${res.model}`,
          provider: res.provider,
          model: res.model,
          sourcePrompt: trimmed,
          suggestedTitle: metaCtx?.title,
          lessonId: metaCtx?.lessonId,
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'AI Tutor failed. Open Settings to configure your API key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queuedRequest) {
      const req = queuedRequest;
      onConsumeQueuedRequest();
      sendMessage(req.prompt, { title: req.title, lessonId: req.lessonId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedRequest]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const extractHebrewSnippet = (content: string): string | null => {
    const matches = content.match(/[\u0590-\u05FF][\u0590-\u05FF\s־]{2,40}/g);
    return matches ? matches[0].trim() : null;
  };

  const handleSaveReply = async (m: ChatMessage) => {
    const title = deriveLessonTitle(m.content, m.sourcePrompt, m.suggestedTitle);
    const saved = await onSaveLesson({
      title,
      lessonId: m.lessonId,
      prompt: m.sourcePrompt || '',
      content: m.content,
      provider: m.provider,
      model: m.model,
    });
    setSavedMsgMap((prev) => ({ ...prev, [m.id]: saved.id }));
  };

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-7.5rem)] min-h-[540px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            AI Hebrew Scribe &amp; Multi-Model Tutor
          </h1>
          <p className="text-xs text-[#66543f]">
            Switch anytime between Gemini, OpenAI, Claude, Grok, Kimi, or Qwen — and save any lesson forever.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={settings.tutorProvider}
            onChange={(e) => onChangeProvider(e.target.value as SettingsData['tutorProvider'])}
            className="rounded-xl border border-[#dcccb0] bg-white px-3 py-2 text-xs font-semibold text-[#2b1e10]"
          >
            <option value="gemini">Google Gemini (Default)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="grok">xAI (Grok)</option>
            <option value="kimi">Moonshot (Kimi)</option>
            <option value="qwen">Alibaba (Qwen)</option>
          </select>

          <button
            onClick={() => setMessages(messages.slice(0, 1))}
            className="p-2 rounded-xl bg-white hover:bg-red-50 border border-[#dfd1b7] text-[#6e5c46] hover:text-red-700 cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp}
            onClick={() => sendMessage(qp)}
            disabled={loading}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 border border-[#e3d5bc] text-[#4c3925] cursor-pointer transition text-left"
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-amber-700" />
            {qp.slice(0, 68)}...
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="flex-1 parchment-card rounded-2xl p-4 md:p-5 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const heb = m.role === 'assistant' ? extractHebrewSnippet(m.content) : null;
          const savedId =
            savedMsgMap[m.id] || savedLessons.find((l) => l.content === m.content)?.id || null;
          const isSaveable = m.role === 'assistant' && m.id !== 'welcome';

          return (
            <div
              key={m.id}
              className={`rounded-2xl p-4 border max-w-3xl ${
                m.role === 'user'
                  ? 'ml-auto bg-amber-900 text-amber-50 border-amber-950'
                  : 'mr-auto bg-white text-[#211a13] border-[#e6d9c2]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    m.role === 'user' ? 'text-amber-200' : 'text-amber-800'
                  }`}
                >
                  {m.role === 'user' ? 'You' : m.meta || 'Eber Scribe'}
                </span>

                <div className="flex items-center gap-2">
                  {heb && (
                    <button
                      onClick={() => speakHebrew(heb, { mode: 'biblical', slow: true })}
                      className="text-[11px] font-semibold text-amber-900 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Hear Hebrew
                    </button>
                  )}

                  {isSaveable &&
                    (savedId ? (
                      <button
                        onClick={() => onOpenSavedLesson(savedId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Saved — View Lesson
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveReply(m)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save Lesson
                      </button>
                    ))}
                </div>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-900 px-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Consulting the scrolls with {settings.tutorProvider}...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any Hebrew letter, root, verse, Aleppo/Leningrad/DSS variant, or spoken phrase..."
          className="flex-1 rounded-xl border border-[#dfd1b7] bg-white px-4 py-3 text-sm focus:outline-none focus:border-amber-700"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-semibold text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
};
