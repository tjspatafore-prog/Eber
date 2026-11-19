import React, { useRef, useState } from 'react';
import {
  CheckCircle2,
  Eraser,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { FINAL_LETTERS, HEBREW_ALPHABET, HebrewLetter } from '../data/alphabet';
import { api, speakHebrew } from '../lib/api';
import { toEnglishPronunciation } from '../lib/hebrewPhonetics';

interface AlphabetViewProps {
  masteredLetters: string[];
  onToggleMastery: (letterId: string, mastered: boolean) => void;
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

export const AlphabetView: React.FC<AlphabetViewProps> = ({
  masteredLetters,
  onToggleMastery,
  onAddFlashcard,
  onAskTutor,
}) => {
  const [selected, setSelected] = useState<HebrewLetter>(HEBREW_ALPHABET[0]);
  const [letterImages, setLetterImages] = useState<Record<string, string>>({});
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const isMastered = masteredLetters.includes(selected.id);

  const handleGenerateArt = async (force = false) => {
    setImgLoading(true);
    setImgError('');
    try {
      const res = await api.generateImage({
        concept: `Hebrew letter ${selected.name} (${selected.pictographName}): ${selected.wordPictureKeywords.join(', ')}`,
        hebrew: selected.letter,
        pictograph: selected.pictographName,
        styleHint: selected.mnemonicPrompt,
        forceRegenerate: force,
      });
      setLetterImages((prev) => ({ ...prev, [selected.id]: res.imageUrl }));
    } catch (err: any) {
      setImgError(err.message || 'Image generation failed. Check your Gemini or OpenAI API key in Settings.');
    } finally {
      setImgLoading(false);
    }
  };

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * e.currentTarget.width,
      y: ((e.clientY - rect.top) / rect.height) * e.currentTarget.height,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPointerPos(e);
    ctx.strokeStyle = '#3b240e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPointerPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    drawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const selectLetter = (l: HebrewLetter) => {
    setSelected(l);
    setImgError('');
    clearCanvas();
  };

  const addWordCard = (wp: HebrewLetter['wordPictures'][0]) => {
    onAddFlashcard({
      hebrew: wp.hebrew,
      transliteration: wp.transliteration,
      meaning: wp.meaning,
      pictographNote: wp.breakdown,
      root: selected.name,
      category: 'biblical',
      imageUrl: letterImages[selected.id],
    });
    setSavedNotice(`Added "${wp.transliteration}" to Flashcards!`);
    setTimeout(() => setSavedNotice(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            Aleph-Bet &amp; Ancient Word Pictures Studio
          </h1>
          <p className="text-sm text-[#66543f]">
            Explore all 22 Hebrew letters through Modern Square script, Masoretic Codex script, Paleo-Hebrew, and
            Proto-Sinaitic pictographs (inspired by <em>The Friends of Eber</em> &amp; Semitic epigraphy).
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 self-start">
          Mastered: {masteredLetters.length} / 22 Letters
        </div>
      </div>

      {/* 22-Letter Selector Grid (RTL visual order hint, clickable) */}
      <div className="parchment-card rounded-2xl p-4">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2" dir="rtl">
          {HEBREW_ALPHABET.map((item) => {
            const active = item.id === selected.id;
            const done = masteredLetters.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => selectLetter(item)}
                dir="ltr"
                className={`relative rounded-xl p-2 text-center border transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  active
                    ? 'bg-amber-800 text-white border-amber-900 shadow-md scale-[1.03]'
                    : done
                    ? 'bg-emerald-50 border-emerald-300 text-[#2b1e10] hover:border-amber-500'
                    : 'bg-white/90 border-[#e4d8c1] text-[#2b1e10] hover:border-amber-500'
                }`}
              >
                {done && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 absolute top-1 right-1 ${
                      active ? 'text-emerald-300' : 'text-emerald-600'
                    }`}
                  />
                )}
                <span className="text-[10px] opacity-70">{item.gematria}</span>
                <span className="font-hebrew-biblical text-3xl leading-none py-0.5">
                  {item.dageshForm?.split(' ')[0] || item.letter}
                </span>
                <span className="text-[10px] font-semibold truncate w-full">{item.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Letter Detail Studio */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: 4-Script Evolution + Meaning & Word Pictures */}
        <div className="lg:col-span-7 space-y-5">
          <div className="parchment-card rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfcb] pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-50">
                    #{selected.order} • Gematria {selected.gematria}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f1e6d2] text-amber-950 capitalize">
                    {selected.category}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold text-[#2b1e10] mt-1">
                  {selected.name}{' '}
                  <span className="font-hebrew-biblical text-2xl text-amber-800 ml-2">
                    {selected.hebrewName}
                  </span>
                </h2>
                <div className="text-xs font-bold text-amber-900 mt-0.5">
                  Sounds like: &ldquo;{toEnglishPronunciation(selected.hebrewName)}&rdquo;
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakHebrew(selected.hebrewName, { mode: 'biblical', slow: true })}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                  Hear Name
                </button>
                <button
                  onClick={() => onToggleMastery(selected.id, !isMastered)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition ${
                    isMastered
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-[#3a2a19] border-[#dcccb0] hover:border-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isMastered ? 'Mastered' : 'Mark Mastered'}
                </button>
              </div>
            </div>

            {/* 4-Script Evolution Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white border border-[#e7dbc5] p-3 text-center">
                <div className="text-[11px] font-semibold text-[#78634a] mb-1">Proto-Sinaitic</div>
                <svg
                  viewBox="0 0 64 64"
                  className="w-12 h-12 mx-auto text-amber-900"
                  dangerouslySetInnerHTML={{ __html: selected.pictographSvg }}
                />
                <div className="text-[11px] font-medium text-amber-950 mt-1 leading-tight">
                  {selected.pictographName.split('(')[0]}
                </div>
              </div>

              <div className="rounded-xl bg-white border border-[#e7dbc5] p-3 text-center flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-[#78634a]">Paleo-Hebrew</div>
                <div className="font-paleo text-5xl text-amber-900 leading-none my-1">
                  {selected.paleoGlyph}
                </div>
                <div className="text-[11px] text-[#7a664e]">1st Temple / DSS</div>
              </div>

              <div className="rounded-xl bg-white border border-[#e7dbc5] p-3 text-center flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-[#78634a]">Masoretic Codex</div>
                <div className="font-hebrew-codex text-5xl text-[#211a13] leading-none my-1">
                  {selected.dageshForm || selected.letter}
                </div>
                <div className="text-[11px] text-[#7a664e]">Aleppo / Leningrad</div>
              </div>

              <div className="rounded-xl bg-white border border-[#e7dbc5] p-3 text-center flex flex-col justify-between">
                <div className="text-[11px] font-semibold text-[#78634a]">Modern / Final</div>
                <div className="font-hebrew-modern text-5xl text-[#211a13] leading-none my-1">
                  {selected.letter}
                  {selected.finalForm ? (
                    <span className="text-amber-700 ml-2">{selected.finalForm}</span>
                  ) : null}
                </div>
                <div className="text-[11px] text-[#7a664e]">
                  {selected.finalForm ? `Sofit final: ${selected.finalForm}` : 'No final form'}
                </div>
              </div>
            </div>

            {/* Dual Pronunciation Box */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-3.5">
                <div className="text-xs font-bold text-sky-900 uppercase tracking-wide">
                  Modern / Sephardi Spoken Sound
                </div>
                <div className="text-sm font-semibold text-[#1f2937] mt-1">{selected.modernSound}</div>
                <div className="text-xs text-sky-800 mt-0.5">IPA: {selected.modernIpa}</div>
              </div>
              <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5">
                <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Tiberian / Biblical Manuscript Nuance
                </div>
                <div className="text-xs text-[#4a3723] mt-1 leading-relaxed">{selected.tiberianNote}</div>
              </div>
            </div>

            {/* Word Picture & Friends of Eber Depth */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {selected.wordPictureKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-0.5 rounded-full bg-amber-900/10 text-amber-950 text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>

              <div className="rounded-xl bg-[#f7efe0] border border-[#e5d5b8] p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Ancient Word Picture &amp; Conceptual Depth (Friends of Eber Style)
                </div>
                <p className="text-sm text-[#352617] leading-relaxed">{selected.friendsOfEberDepth}</p>
                <div className="pt-2 border-t border-[#e5d5b8] text-xs text-[#69553e]">
                  <strong>Historical Epigraphy &amp; Philology Note:</strong> {selected.scholarlyNote}
                </div>
              </div>
            </div>

            {/* Word Picture Examples */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2b1e10]">
                  Ancient Word Pictures Featuring {selected.name}
                </h3>
                {savedNotice && (
                  <span className="text-xs font-semibold text-emerald-700">{savedNotice}</span>
                )}
              </div>
              <div className="space-y-2">
                {selected.wordPictures.map((wp) => (
                  <div
                    key={wp.hebrew}
                    className="rounded-xl bg-white border border-[#e6d9c2] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-center">
                          <div className="font-hebrew-biblical text-2xl font-bold text-amber-950 leading-none">
                            {wp.hebrew}
                          </div>
                          <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                            {toEnglishPronunciation(wp.hebrew)}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#3a2a19]">
                          {wp.transliteration} — &ldquo;{wp.meaning}&rdquo;
                        </span>
                      </div>
                      <p className="text-xs text-[#66543f]">{wp.breakdown}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => speakHebrew(wp.hebrew, { mode: 'biblical', slow: true })}
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
                        title="Listen"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addWordCard(wp)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Flashcard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                onAskTutor(
                  `Give me a deep word-picture study (inspired by The Friends of Eber and Paleo-Hebrew pictographs) AND scholarly Semitic root study on the Hebrew letter ${selected.name} (${selected.letter}). Include 4 high-frequency Biblical words built with ${selected.letter}.`
                )
              }
              className="w-full py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-amber-50 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Sparkles className="w-4 h-4" />
              Deep-Dive {selected.name} with AI Scribe
            </button>
          </div>
        </div>

        {/* Right: AI Visual Mnemonic Art + Interactive Writing Pad */}
        <div className="lg:col-span-5 space-y-5">
          {/* AI Mnemonic Picture Card */}
          <div className="parchment-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2b1e10] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-800" />
                  Visual Mnemonic Art (Cached Locally)
                </h3>
                <p className="text-xs text-[#6e5c46]">
                  Generated once cheaply via Gemini Image (or OpenAI) &amp; saved on disk forever.
                </p>
              </div>
            </div>

            <div className="aspect-square rounded-xl border border-[#e3d5bc] bg-[#f4ead5] overflow-hidden flex items-center justify-center relative">
              {letterImages[selected.id] ? (
                <img
                  src={letterImages[selected.id]}
                  alt={`Mnemonic illustration for ${selected.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-6 text-center space-y-3">
                  <svg
                    viewBox="0 0 64 64"
                    className="w-24 h-24 mx-auto text-amber-800/70"
                    dangerouslySetInnerHTML={{ __html: selected.pictographSvg }}
                  />
                  <div className="font-display text-xl font-bold text-[#3b2916]">
                    {selected.name} — {selected.pictographName}
                  </div>
                  <p className="text-xs text-[#6c5944] max-w-xs mx-auto">
                    Click below to paint a custom illuminated parchment memory picture for this letter!
                  </p>
                </div>
              )}
              {imgLoading && (
                <div className="absolute inset-0 bg-[#faf6ee]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-7 h-7 animate-spin text-amber-800" />
                  <span className="text-xs font-semibold text-amber-950">
                    Illuminating parchment card...
                  </span>
                </div>
              )}
            </div>

            {imgError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {imgError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleGenerateArt(false)}
                disabled={imgLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {letterImages[selected.id] ? 'Load / Regenerate Picture' : 'Generate Mnemonic Picture'}
              </button>
              {letterImages[selected.id] && (
                <button
                  onClick={() => handleGenerateArt(true)}
                  disabled={imgLoading}
                  className="px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-[#ddcdb2] text-xs font-semibold text-amber-950 cursor-pointer"
                >
                  New Art
                </button>
              )}
            </div>
          </div>

          {/* Interactive Letter Tracing Pad */}
          <div className="parchment-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#2b1e10]">Practice Writing {selected.name}</h3>
                <p className="text-xs text-[#6e5c46]">Trace right-to-left over the scribal guide</p>
              </div>
              <button
                onClick={clearCanvas}
                className="px-2.5 py-1 rounded-lg bg-[#f3e9d6] hover:bg-amber-200/70 text-xs font-semibold text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            <div className="relative rounded-xl border border-[#dfd1b7] bg-white overflow-hidden h-52 select-none">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-hebrew-biblical text-[145px] text-amber-900/12 leading-none">
                  {selected.letter}
                </span>
              </div>
              <canvas
                ref={canvasRef}
                width={420}
                height={208}
                onPointerDown={startDraw}
                onPointerMove={moveDraw}
                onPointerUp={endDraw}
                onPointerCancel={endDraw}
                className="w-full h-full touch-none cursor-crosshair relative z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Final (Sofit) Letters Reference */}
      <div className="parchment-card rounded-2xl p-5">
        <h3 className="font-display text-xl font-bold text-[#2b1e10] mb-3">
          The 5 Final (Sofit) Letters — <span className="font-hebrew-biblical">מנצפ״ך</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FINAL_LETTERS.map((fl) => (
            <div key={fl.name} className="rounded-xl bg-white border border-[#e7dbc5] p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">{fl.name}</span>
                <span className="text-xs text-[#6e5c46]">{fl.sound}</span>
              </div>
              <div className="font-hebrew-biblical text-3xl text-center py-1 bg-[#faf4e8] rounded-lg">
                {fl.regular} <span className="text-amber-700 mx-1 text-lg">→</span> {fl.final}
              </div>
              <p className="text-[11px] text-[#66543f] leading-snug">{fl.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
