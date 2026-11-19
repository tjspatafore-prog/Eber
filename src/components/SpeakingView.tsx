import React, { useRef, useState } from 'react';
import {
  Loader2,
  Mic,
  Send,
  Sparkles,
  Square,
  Volume2,
  MessageCircle,
  BookOpen,
} from 'lucide-react';
import { SPEAKING_DRILLS } from '../data/curriculum';
import { api, speakHebrew } from '../lib/api';

interface ConversationTurn {
  role: 'user' | 'assistant';
  hebrew: string;
  transliteration?: string;
  english?: string;
  coaching?: string;
  biblicalRootLink?: string;
}

const SCENARIOS = [
  { id: 'greetings', track: 'modern' as const, label: 'Warm Greetings & Introductions (Modern)' },
  { id: 'market', track: 'modern' as const, label: 'Shuk Mahane Yehuda Market in Jerusalem (Modern)' },
  { id: 'study', track: 'modern' as const, label: 'Chatting with a Hebrew Study Partner (Modern)' },
  { id: 'genesis', track: 'biblical' as const, label: 'Reciting & Discussing Genesis 1 (Biblical)' },
  { id: 'psalms', track: 'biblical' as const, label: 'Shepherd & Psalms Recitation (Biblical)' },
];

export const SpeakingView: React.FC = () => {
  const [subTab, setSubTab] = useState<'drills' | 'conversation'>('drills');

  // Drill state
  const [activeDrill, setActiveDrill] = useState(SPEAKING_DRILLS[0]);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [drillResult, setDrillResult] = useState<{
    transcript: string;
    confidence: number;
    matchScore: number | null;
    wordComparison: { word: string; matched: boolean }[];
  } | null>(null);
  const [error, setError] = useState('');

  // Live Conversation state
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [convRecording, setConvRecording] = useState(false);

  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startOrStopRecording = async (
    isConv: boolean,
    onBlobReady: (blob: Blob) => Promise<void>
  ) => {
    setError('');
    const activeState = isConv ? convRecording : recording;
    const setActive = isConv ? setConvRecording : setRecording;

    if (activeState && mediaRecRef.current) {
      mediaRecRef.current.stop();
      setActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        await onBlobReady(blob);
      };
      mediaRecRef.current = rec;
      rec.start();
      setActive(true);
    } catch {
      setError('Could not access microphone. Please allow microphone permission in your browser.');
    }
  };

  const handleDrillRecord = () =>
    startOrStopRecording(false, async (blob) => {
      setTranscribing(true);
      try {
        const res = await api.transcribeHebrew(blob, activeDrill.hebrew);
        setDrillResult(res);
      } catch (err: any) {
        setError(err.message || 'Deepgram Nova-3 transcription failed. Check your Deepgram API key in Settings.');
      } finally {
        setTranscribing(false);
      }
    });

  const sendConversationTurn = async (textToSend: string) => {
    setError('');
    setAiThinking(true);
    const nextTurns: ConversationTurn[] = textToSend
      ? [...turns, { role: 'user', hebrew: textToSend }]
      : [...turns];
    if (textToSend) setTurns(nextTurns);

    try {
      const history = nextTurns.map((t) => ({
        role: t.role,
        content: t.hebrew,
      }));
      const reply = await api.conversation({
        history,
        scenario: scenario.label,
        userHebrew: textToSend,
        track: scenario.track,
      });

      setTurns((prev) => [
        ...prev,
        {
          role: 'assistant',
          hebrew: reply.hebrew,
          transliteration: reply.transliteration,
          english: reply.english,
          coaching: reply.coaching,
          biblicalRootLink: reply.biblicalRootLink,
        },
      ]);
      // Automatically speak the AI tutor's Hebrew response!
      speakHebrew(reply.hebrew, { mode: scenario.track, slow: false });
    } catch (err: any) {
      setError(err.message || 'Conversation request failed. Make sure an AI key is configured in Settings.');
    } finally {
      setAiThinking(false);
    }
  };

  const handleConvVoiceRecord = () =>
    startOrStopRecording(true, async (blob) => {
      setTranscribing(true);
      try {
        const res = await api.transcribeHebrew(blob);
        if (res.transcript) {
          await sendConversationTurn(res.transcript);
        } else {
          setError('No Hebrew speech detected. Try speaking slightly closer to the microphone.');
        }
      } catch (err: any) {
        setError(err.message || 'Deepgram voice capture failed.');
      } finally {
        setTranscribing(false);
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            Speaking &amp; Pronunciation Studio (Deepgram Nova-3 + AI Coach)
          </h1>
          <p className="text-sm text-[#66543f]">
            Practice Biblical recitation AND Modern/Sephardi spoken Hebrew out loud with real-time Hebrew speech
            recognition.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-[#efe5d3] p-1 border border-[#dfd1b7] self-start">
          <button
            onClick={() => setSubTab('drills')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'drills' ? 'bg-amber-900 text-white' : 'text-[#5b4733]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Pronunciation Drills
          </button>
          <button
            onClick={() => setSubTab('conversation')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              subTab === 'conversation' ? 'bg-amber-900 text-white' : 'text-[#5b4733]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> Live Conversation Partner
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-800">
          {error}
        </div>
      )}

      {subTab === 'drills' ? (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2.5">
            {SPEAKING_DRILLS.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setActiveDrill(d);
                  setDrillResult(null);
                  setError('');
                }}
                className={`w-full text-left rounded-xl p-3.5 border transition cursor-pointer ${
                  activeDrill.id === d.id
                    ? 'bg-amber-900 text-white border-amber-950'
                    : 'bg-white border-[#e4d8c1] hover:border-amber-500 text-[#2b1e10]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                  <span className={activeDrill.id === d.id ? 'text-amber-200' : 'text-amber-800'}>
                    {d.track} • {d.level}
                  </span>
                </div>
                <div className="font-hebrew-biblical text-xl mt-1 leading-snug">{d.hebrew}</div>
                <div className={`text-xs mt-1 ${activeDrill.id === d.id ? 'text-amber-100' : 'text-[#6a5741]'}`}>
                  {d.english}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 parchment-card rounded-2xl p-6 space-y-5">
            <div className="text-center space-y-3 py-4 bg-[#f7efe0] rounded-2xl border border-[#e6d7ba] px-4">
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-900/10 text-amber-950">
                {activeDrill.track === 'biblical' ? 'Biblical Recitation' : 'Modern Spoken Phrase'}
              </span>
              <div className="font-hebrew-biblical text-4xl md:text-5xl text-[#211a13] leading-relaxed">
                {activeDrill.hebrew}
              </div>
              <div className="text-base font-semibold text-amber-900">{activeDrill.transliteration}</div>
              <div className="text-sm text-[#5d4a35]">&ldquo;{activeDrill.english}&rdquo;</div>
            </div>

            <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-3.5 text-xs text-sky-950">
              <strong>Pronunciation Coach Tip:</strong> {activeDrill.tip}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() =>
                  speakHebrew(activeDrill.hebrew, {
                    mode: activeDrill.track === 'spoken' ? 'modern' : 'biblical',
                    slow: true,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Listen Slowly
              </button>
              <button
                onClick={() =>
                  speakHebrew(activeDrill.hebrew, {
                    mode: activeDrill.track === 'spoken' ? 'modern' : 'biblical',
                    slow: false,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> Natural Pace
              </button>
              <button
                onClick={handleDrillRecord}
                disabled={transcribing}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition ${
                  recording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {transcribing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : recording ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {transcribing ? 'Analyzing via Deepgram...' : recording ? 'Stop & Score' : 'Record Yourself'}
              </button>
            </div>

            {drillResult && (
              <div className="rounded-2xl bg-white border border-emerald-300 p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs font-bold uppercase text-emerald-800">
                      Deepgram Nova-3 (Hebrew) Feedback
                    </div>
                    <div className="text-2xl font-bold text-emerald-950">
                      Match Score: {drillResult.matchScore ?? 0}%{' '}
                      <span className="text-xs font-normal text-[#6a5741]">
                        (ASR confidence {drillResult.confidence}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#6a5741]">What Deepgram heard:</div>
                    <div className="font-hebrew-modern text-xl font-bold text-[#211a13]">
                      {drillResult.transcript || '(no words detected)'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#efe5d3]" dir="rtl">
                  {drillResult.wordComparison.map((w, idx) => (
                    <span
                      key={idx}
                      className={`font-hebrew-modern text-lg px-3 py-1 rounded-lg border ${
                        w.matched
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : 'bg-amber-100 border-amber-300 text-amber-950'
                      }`}
                    >
                      {w.word} {w.matched ? '✓' : '•'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Dual-Track AI Conversation */
        <div className="parchment-card rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eadfcb] pb-4">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase text-amber-900 block mb-1">
                Choose Conversation Scenario (Modern or Biblical Track)
              </label>
              <select
                value={scenario.id}
                onChange={(e) => {
                  const found = SCENARIOS.find((s) => s.id === e.target.value);
                  if (found) {
                    setScenario(found);
                    setTurns([]);
                  }
                }}
                className="w-full sm:w-auto min-w-72 rounded-xl border border-[#dcccb0] bg-white px-3 py-2 text-sm font-medium"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => sendConversationTurn('')}
              disabled={aiThinking}
              className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-end"
            >
              <Sparkles className="w-4 h-4" />
              {turns.length === 0 ? 'Start Conversation' : 'Prompt Next Turn'}
            </button>
          </div>

          <div className="space-y-3 min-h-72 max-h-[440px] overflow-y-auto pr-1">
            {turns.length === 0 && (
              <div className="text-center py-14 text-sm text-[#76624a] space-y-2">
                <MessageCircle className="w-10 h-10 mx-auto text-amber-800/40" />
                <p>
                  Click <strong>Start Conversation</strong> — Eber will greet you in spoken Hebrew and connect every
                  exchange back to Biblical roots!
                </p>
              </div>
            )}

            {turns.map((t, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-4 border ${
                  t.role === 'user'
                    ? 'bg-sky-50 border-sky-200 ml-8'
                    : 'bg-white border-[#e5d8c0] mr-8 space-y-2'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-hebrew-biblical text-2xl text-[#211a13]">{t.hebrew}</div>
                  {t.role === 'assistant' && (
                    <button
                      onClick={() => speakHebrew(t.hebrew, { mode: scenario.track, slow: false })}
                      className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 shrink-0 cursor-pointer"
                      title="Listen again"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {t.transliteration && (
                  <div className="text-xs font-semibold text-amber-900">{t.transliteration}</div>
                )}
                {t.english && <div className="text-sm text-[#3d2d1d]">{t.english}</div>}
                {t.coaching && (
                  <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                    <strong>Coach:</strong> {t.coaching}
                  </div>
                )}
                {t.biblicalRootLink && (
                  <div className="text-xs text-amber-950 bg-[#f7efe0] border border-[#e6d6b8] rounded-lg p-2.5">
                    <strong>Biblical Root &amp; Word Picture Link:</strong> {t.biblicalRootLink}
                  </div>
                )}
              </div>
            ))}

            {(aiThinking || transcribing) && (
              <div className="flex items-center gap-2 text-xs text-amber-900 px-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {transcribing ? 'Transcribing your Hebrew with Deepgram Nova-3...' : 'Eber is replying in Hebrew...'}
              </div>
            )}
          </div>

          {/* Reply Bar (Mic + Text) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!userInput.trim() || aiThinking) return;
              const txt = userInput.trim();
              setUserInput('');
              sendConversationTurn(txt);
            }}
            className="flex items-center gap-2 pt-3 border-t border-[#eadfcb]"
          >
            <button
              type="button"
              onClick={handleConvVoiceRecord}
              disabled={aiThinking || transcribing}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 ${
                convRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {convRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {convRecording ? 'Stop Mic' : 'Speak Hebrew'}
            </button>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Or type your reply in Hebrew or transliteration (e.g. Shalom! Ani tov)..."
              className="flex-1 rounded-xl border border-[#dfd1b7] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-700"
            />
            <button
              type="submit"
              disabled={aiThinking || !userInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
