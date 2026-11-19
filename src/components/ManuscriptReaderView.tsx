import React, { useRef, useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Mic,
  Plus,
  ScrollText,
  Sparkles,
  Square,
  Volume2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { InterlinearWord, MANUSCRIPT_PASSAGES, ManuscriptPassage } from '../data/manuscripts';
import { api, getPreferredAudioMimeType, speakHebrew, toPaleoHebrew } from '../lib/api';

interface ManuscriptReaderViewProps {
  readPassages: string[];
  onMarkPassageRead: (id: string) => void;
  onAddFlashcard: (card: {
    hebrew: string;
    transliteration: string;
    meaning: string;
    pictographNote: string;
    root: string;
    category: string;
    imageUrl?: string;
  }) => void;
  onAskTutor: (prompt: string) => void;
}

type ScriptMode = 'beginner' | 'codex' | 'unpointed' | 'paleo';

export const ManuscriptReaderView: React.FC<ManuscriptReaderViewProps> = ({
  readPassages,
  onMarkPassageRead,
  onAddFlashcard,
  onAskTutor,
}) => {
  const [passage, setPassage] = useState<ManuscriptPassage>(MANUSCRIPT_PASSAGES[0]);
  const [scriptMode, setScriptMode] = useState<ScriptMode>('beginner');
  const [selectedWord, setSelectedWord] = useState<InterlinearWord>(
    MANUSCRIPT_PASSAGES[0].verses[0].words[0]
  );
  const [wordImage, setWordImage] = useState<Record<string, string>>({});
  const [imgLoading, setImgLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Custom passage analyzer
  const [customRef, setCustomRef] = useState('');
  const [customAnalysis, setCustomAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // Read-aloud Deepgram check
  const [recordingVerse, setRecordingVerse] = useState<number | null>(null);
  const [sttLoading, setSttLoading] = useState(false);
  const [sttResult, setSttResult] = useState<{
    verseNum: number;
    transcript: string;
    matchScore: number | null;
    wordComparison: { word: string; matched: boolean }[];
  } | null>(null);
  const [sttError, setSttError] = useState('');
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSelectPassage = (p: ManuscriptPassage) => {
    setPassage(p);
    setSelectedWord(p.verses[0].words[0]);
    setSttResult(null);
    setSttError('');
  };

  const handleGenerateWordArt = async () => {
    setImgLoading(true);
    try {
      const res = await api.generateImage({
        concept: `Biblical Hebrew word "${selectedWord.transliteration}" meaning "${selectedWord.gloss}"`,
        hebrew: selectedWord.hebrew,
        pictograph: selectedWord.pictographStudy,
      });
      setWordImage((prev) => ({ ...prev, [selectedWord.unpointed]: res.imageUrl }));
    } catch (err: any) {
      setNotice(err.message || 'Image error');
    } finally {
      setImgLoading(false);
    }
  };

  const handleSaveCard = () => {
    onAddFlashcard({
      hebrew: selectedWord.hebrew,
      transliteration: selectedWord.transliteration,
      meaning: selectedWord.gloss,
      pictographNote: selectedWord.pictographStudy,
      root: selectedWord.root,
      category: 'biblical',
      imageUrl: wordImage[selectedWord.unpointed],
    });
    setNotice(`Saved "${selectedWord.transliteration}" to Flashcards!`);
    setTimeout(() => setNotice(''), 2500);
  };

  const toggleRecordVerse = async (verseNum: number, targetHebrew: string) => {
    setSttError('');
    if (recordingVerse === verseNum && mediaRecRef.current) {
      mediaRecRef.current.stop();
      setRecordingVerse(null);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredAudioMimeType();
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        setSttLoading(true);
        try {
          const result = await api.transcribeHebrew(blob, targetHebrew);
          setSttResult({
            verseNum,
            transcript: result.transcript,
            matchScore: result.matchScore,
            wordComparison: result.wordComparison,
          });
        } catch (err: any) {
          setSttError(err.message || 'Deepgram transcription failed.');
        } finally {
          setSttLoading(false);
        }
      };
      mediaRecRef.current = rec;
      rec.start();
      setRecordingVerse(verseNum);
    } catch {
      setSttError('Microphone access was denied or unavailable.');
    }
  };

  const handleAnalyzeCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRef.trim()) return;
    setAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await api.analyzePassage({ reference: customRef.trim() });
      setCustomAnalysis(res.text);
    } catch (err: any) {
      setAnalyzeError(err.message || 'Analysis failed. Configure an AI key in Settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  const renderWordText = (w: InterlinearWord) => {
    if (scriptMode === 'unpointed') return w.unpointed;
    if (scriptMode === 'paleo') return toPaleoHebrew(w.unpointed);
    return w.hebrew;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            Ancient Manuscript Reader — Aleppo, Leningrad &amp; Dead Sea Scrolls
          </h1>
          <p className="text-sm text-[#66543f]">
            Click any Hebrew word to inspect its 3-letter root, grammar, and ancient word picture. Progress from full
            vowels to unpointed scrolls &amp; Paleo-Hebrew!
          </p>
        </div>

        {/* Script Progression Switcher */}
        <div className="inline-flex flex-wrap rounded-xl bg-[#efe5d3] p-1 border border-[#dfd1b7]">
          {(
            [
              { id: 'beginner', label: '1. Beginner Gloss' },
              { id: 'codex', label: '2. Masoretic Codex' },
              { id: 'unpointed', label: '3. Unpointed Scroll' },
              { id: 'paleo', label: '4. Paleo / DSS' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setScriptMode(m.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                scriptMode === m.id
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-[#5b4733] hover:text-amber-950'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Passage Selector Strip */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MANUSCRIPT_PASSAGES.map((p) => {
          const active = p.id === passage.id;
          const isRead = readPassages.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPassage(p)}
              className={`text-left rounded-xl p-3.5 border transition cursor-pointer ${
                active
                  ? 'bg-amber-900 text-amber-50 border-amber-950 shadow-sm'
                  : 'bg-white/90 border-[#e4d8c1] hover:border-amber-500 text-[#2b1e10]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    active ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 text-amber-950'
                  }`}
                >
                  {p.difficulty}
                </span>
                {isRead && (
                  <CheckCircle2 className={`w-4 h-4 ${active ? 'text-emerald-300' : 'text-emerald-600'}`} />
                )}
              </div>
              <div className="font-hebrew-biblical text-lg mt-1.5 leading-snug">{p.hebrewTitle}</div>
              <div className="font-semibold text-xs mt-0.5">{p.title}</div>
            </button>
          );
        })}
      </div>

      {/* Main Reader + Word Inspector */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Scroll Canvas & Manuscript Comparisons */}
        <div className="lg:col-span-8 space-y-5">
          <div className="scroll-manuscript-bg rounded-2xl border-2 border-[#d9c7a3] p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d8c7a7] pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  {passage.reference}
                </div>
                <h2 className="font-display text-2xl font-bold text-[#2b1e10]">{passage.title}</h2>
                <p className="text-xs text-[#5d4a35] mt-1 max-w-2xl">{passage.summary}</p>
              </div>
              <button
                onClick={() => onMarkPassageRead(passage.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {readPassages.includes(passage.id) ? 'Passage Studied' : 'Mark Studied (+30 XP)'}
              </button>
            </div>

            {/* Verses */}
            <div className="space-y-6">
              {passage.verses.map((v) => {
                const fullHebrew = v.words.map((w) => w.hebrew).join(' ');
                const isRec = recordingVerse === v.verseNum;
                return (
                  <div
                    key={v.verseNum}
                    className="rounded-xl bg-[#fffcf4]/90 border border-[#e3d3b5] p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900/10 text-amber-950">
                        Verse {v.verseNum}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakHebrew(fullHebrew, { mode: 'biblical', slow: true })}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Slow
                        </button>
                        <button
                          onClick={() => speakHebrew(fullHebrew, { mode: 'biblical', slow: false })}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Normal
                        </button>
                        <button
                          onClick={() => toggleRecordVerse(v.verseNum, fullHebrew)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                            isRec
                              ? 'bg-red-600 text-white animate-pulse'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {isRec ? <Square className="w-3 h-3" /> : <Mic className="w-3.5 h-3.5" />}
                          {isRec ? 'Stop' : 'Read Aloud'}
                        </button>
                      </div>
                    </div>

                    {/* Interactive RTL Word Tiles */}
                    <div className="flex flex-wrap gap-2.5 py-2" dir="rtl">
                      {v.words.map((w, idx) => {
                        const isSel = selectedWord === w;
                        return (
                          <button
                            key={`${v.verseNum}-${idx}`}
                            onClick={() => setSelectedWord(w)}
                            title={scriptMode === 'unpointed' ? `Hover hint: ${w.hebrew} (${w.transliteration})` : w.gloss}
                            className={`group rounded-xl px-3 py-2 transition cursor-pointer text-center border ${
                              isSel
                                ? 'bg-amber-800 text-white border-amber-950 shadow-md'
                                : 'bg-white hover:bg-amber-50 text-[#211a13] border-[#e7dbc5]'
                            }`}
                          >
                            <div
                              className={`${
                                scriptMode === 'paleo'
                                  ? 'font-paleo text-3xl'
                                  : 'font-hebrew-codex text-3xl'
                              } leading-relaxed`}
                            >
                              {renderWordText(w)}
                            </div>

                            {scriptMode === 'paleo' && (
                              <div className={`font-hebrew-biblical text-sm mt-0.5 ${isSel ? 'text-amber-200' : 'text-[#7c6951]'}`}>
                                {w.unpointed}
                              </div>
                            )}

                            {scriptMode === 'beginner' && (
                              <div className="mt-1 space-y-0.5" dir="ltr">
                                <div className={`text-[11px] font-semibold ${isSel ? 'text-amber-100' : 'text-amber-900'}`}>
                                  {w.transliteration}
                                </div>
                                <div className={`text-[10px] ${isSel ? 'text-amber-200' : 'text-[#6e5b44]'}`}>
                                  {w.gloss}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-sm text-[#3c2d1d] italic border-t border-[#efe4cf] pt-2.5">
                      &ldquo;{v.english}&rdquo;
                    </div>

                    {v.cantillationNote && (
                      <div className="text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-200 rounded-lg px-3 py-2">
                        <strong>Masoretic Cantillation &amp; Syntax:</strong> {v.cantillationNote}
                      </div>
                    )}

                    {/* Deepgram Read-Aloud Score */}
                    {sttLoading && sttResult?.verseNum !== v.verseNum && recordingVerse === null && (
                      <div className="text-xs text-amber-900 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scoring Hebrew pronunciation with Deepgram Nova-3...
                      </div>
                    )}

                    {sttResult && sttResult.verseNum === v.verseNum && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900">
                            Deepgram Nova-3 Reading Score: {sttResult.matchScore}%
                          </span>
                          <span className="font-hebrew-modern text-sm text-emerald-950">
                            Heard: {sttResult.transcript || '(silence)'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5" dir="rtl">
                          {sttResult.wordComparison.map((wc, i) => (
                            <span
                              key={i}
                              className={`font-hebrew-modern text-sm px-2 py-0.5 rounded-md border ${
                                wc.matched
                                  ? 'bg-emerald-200/70 border-emerald-400 text-emerald-950'
                                  : 'bg-amber-100 border-amber-300 text-amber-950'
                              }`}
                            >
                              {wc.word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {sttError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {sttError}
                </div>
              )}
            </div>
          </div>

          {/* Manuscript Variant Comparison Drawer (Leningrad vs Aleppo vs DSS) */}
          <div className="parchment-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-xl font-bold text-[#2b1e10] flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-800" />
                Manuscript Witness Comparison (Leningrad • Aleppo • Dead Sea Scrolls)
              </h3>
              <div className="flex flex-wrap gap-2">
                {passage.manuscriptLinks.map((lnk) => (
                  <a
                    key={lnk.url}
                    href={lnk.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-amber-900 hover:text-amber-700 underline inline-flex items-center gap-1"
                  >
                    {lnk.label} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {passage.variants.map((vr) => (
                <div key={vr.manuscript} className="rounded-xl bg-white border border-[#e5d8c0] p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-[#2b1e10]">{vr.manuscript}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vr.status === 'Extant'
                          ? 'bg-emerald-100 text-emerald-900'
                          : vr.status === 'Variant Reading'
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {vr.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-800">{vr.siglum}</div>
                  {vr.hebrewSample && (
                    <div className="font-hebrew-codex text-base bg-[#faf4e8] p-2 rounded-lg border border-[#ece0c9] text-right leading-relaxed">
                      {vr.hebrewSample}
                    </div>
                  )}
                  <p className="text-xs text-[#5d4a35] leading-relaxed">{vr.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Load Any Biblical Passage via AI Scribe */}
          <div className="parchment-card rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-xl font-bold text-[#2b1e10] flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-800" />
              Study Any Bible Passage (AI Interlinear &amp; Manuscript Scribe)
            </h3>
            <form onSubmit={handleAnalyzeCustom} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customRef}
                onChange={(e) => setCustomRef(e.target.value)}
                placeholder='e.g. "Psalm 119:1-4", "Ruth 1:16", "Isaiah 40:1-3", or paste Hebrew text...'
                className="flex-1 rounded-xl border border-[#dfd1b7] bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-700"
              />
              <button
                type="submit"
                disabled={analyzing}
                className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze Passage
              </button>
            </form>
            {analyzeError && <div className="text-xs text-red-700">{analyzeError}</div>}
            {customAnalysis && (
              <div className="rounded-xl bg-white border border-[#e5d8c0] p-4 text-sm text-[#2b1e10] whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {customAnalysis}
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Word Inspector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="parchment-card rounded-2xl p-5 space-y-4 sticky top-4">
            <div className="text-center border-b border-[#eadfcb] pb-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Word Inspector {selectedWord.strongs ? `• ${selectedWord.strongs}` : ''}
              </div>
              <div className="font-hebrew-codex text-5xl text-[#211a13] py-1">
                {selectedWord.hebrew}
              </div>
              <div className="font-paleo text-2xl text-amber-900/75">
                {toPaleoHebrew(selectedWord.unpointed)}
              </div>
              <div className="text-base font-bold text-amber-950">{selectedWord.transliteration}</div>
              <div className="text-sm text-[#5b4733]">&ldquo;{selectedWord.gloss}&rdquo;</div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => speakHebrew(selectedWord.hebrew, { mode: 'biblical', slow: true })}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Hear Slow
                </button>
                <button
                  onClick={handleSaveCard}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Flashcard
                </button>
              </div>
              {notice && <div className="text-xs font-semibold text-emerald-700">{notice}</div>}
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-white border border-[#e6d9c2] p-3">
                <div className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">
                  3-Letter Root (Shoresh)
                </div>
                <div className="font-hebrew-biblical text-2xl text-[#211a13] mt-0.5">
                  {selectedWord.root}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#e6d9c2] p-3">
                <div className="font-bold text-amber-900 uppercase tracking-wide text-[10px]">
                  Grammar &amp; Morphology
                </div>
                <p className="text-sm text-[#352617] mt-1">{selectedWord.grammar}</p>
              </div>

              <div className="rounded-xl bg-[#f7efe0] border border-[#e3d3b5] p-3 space-y-1">
                <div className="font-bold text-amber-900 uppercase tracking-wide text-[10px] flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Ancient Word Picture Study
                </div>
                <p className="text-xs text-[#3b2916] leading-relaxed">{selectedWord.pictographStudy}</p>
              </div>

              {/* Cached Mnemonic Picture for this word */}
              {wordImage[selectedWord.unpointed] && (
                <div className="rounded-xl overflow-hidden border border-[#e0d0b3]">
                  <img
                    src={wordImage[selectedWord.unpointed]}
                    alt={selectedWord.transliteration}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleGenerateWordArt}
                  disabled={imgLoading}
                  className="w-full py-2 rounded-xl bg-white hover:bg-amber-50 border border-[#dac8a9] text-amber-950 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {imgLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  Generate Mnemonic Picture
                </button>
                <button
                  onClick={() =>
                    onAskTutor(
                      `Analyze the Biblical Hebrew word ${selectedWord.hebrew} (${selectedWord.transliteration}, "${selectedWord.gloss}", root ${selectedWord.root}) from ${passage.reference}. Give me its full grammatical parsing, ancient word-picture breakdown (Friends of Eber style), how it's used in Modern Hebrew today, and any Leningrad/Aleppo/Dead Sea Scrolls notes.`
                    )
                  }
                  className="w-full py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI Scribe Deep Dive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
