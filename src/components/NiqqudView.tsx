import React, { useState } from 'react';
import { Volume2, Music, Sparkles } from 'lucide-react';
import { CANTILLATION_MARKS, NIQQUD_VOWELS } from '../data/niqqudAndCantillation';
import { speakHebrew } from '../lib/api';

const CONSONANTS = [
  { char: 'בּ', sound: 'b' },
  { char: 'שׁ', sound: 'sh' },
  { char: 'מ', sound: 'm' },
  { char: 'ל', sound: 'l' },
  { char: 'ד', sound: 'd' },
  { char: 'א', sound: '' },
  { char: 'ת', sound: 't' },
  { char: 'ר', sound: 'r' },
  { char: 'ח', sound: 'ch' },
  { char: 'ק', sound: 'k' },
];

const ENDINGS = [
  { char: '', sound: '', label: 'Open (no coda)' },
  { char: 'ם', sound: 'm', label: '-m (ם)' },
  { char: 'ל', sound: 'l', label: '-l (ל)' },
  { char: 'ר', sound: 'r', label: '-r (ר)' },
  { char: 'ת', sound: 't', label: '-t (ת)' },
  { char: 'ן', sound: 'n', label: '-n (ן)' },
];

const VOWEL_SIM = [
  { name: 'Kamatz', mark: '\u05B8', sound: 'a', tiberian: 'aw' },
  { name: 'Patach', mark: '\u05B7', sound: 'a', tiberian: 'a' },
  { name: 'Tzere', mark: '\u05B5', sound: 'e', tiberian: 'ē' },
  { name: 'Segol', mark: '\u05B6', sound: 'e', tiberian: 'ɛ' },
  { name: 'Chirik', mark: '\u05B4', sound: 'i', tiberian: 'i' },
  { name: 'Cholam', mark: '\u05B9', sound: 'o', tiberian: 'ō' },
  { name: 'Shuruk', mark: 'וּ', sound: 'u', tiberian: 'ū' },
];

export const NiqqudView: React.FC<{ onAskTutor: (prompt: string) => void }> = ({ onAskTutor }) => {
  const [cIdx, setCIdx] = useState(0);
  const [vIdx, setVIdx] = useState(0);
  const [eIdx, setEIdx] = useState(0);
  const [pronMode, setPronMode] = useState<'dual' | 'tiberian' | 'modern'>('dual');

  const c = CONSONANTS[cIdx];
  const v = VOWEL_SIM[vIdx];
  const e = ENDINGS[eIdx];
  const syllable = `${c.char}${v.mark}${e.char}`;
  const modernReading = `${c.sound}${v.sound}${e.sound}`;
  const tiberianReading = `${c.sound}${v.tiberian}${e.sound}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            Niqqud (Tiberian Vowels) &amp; Cantillation (Te&rsquo;amim)
          </h1>
          <p className="text-sm text-[#66543f]">
            Master the vowel points added by the Masoretes of Tiberias (7th–10th c. CE) and the cantillation marks
            that unlock Biblical verse syntax in the Aleppo and Leningrad Codices.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-[#efe5d3] p-1 border border-[#dfd1b7] self-start">
          {(['dual', 'tiberian', 'modern'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setPronMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer transition ${
                pronMode === m ? 'bg-amber-900 text-white' : 'text-[#5b4733] hover:text-amber-950'
              }`}
            >
              {m === 'dual' ? 'Dual View' : m === 'tiberian' ? 'Tiberian Biblical' : 'Modern Sephardi'}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Syllable Builder */}
      <div className="parchment-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1 w-full">
            <h2 className="font-display text-2xl font-bold text-[#2b1e10]">
              Interactive Syllable Synthesizer
            </h2>
            <p className="text-xs text-[#6b5842]">
              Combine any consonant + Tiberian vowel + optional closing consonant to train instant reading reflexes.
            </p>

            <div className="space-y-2.5">
              <div>
                <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">1. Consonant</div>
                <div className="flex flex-wrap gap-1.5" dir="rtl">
                  {CONSONANTS.map((item, i) => (
                    <button
                      key={item.char}
                      onClick={() => setCIdx(i)}
                      className={`w-10 h-10 rounded-lg font-hebrew-biblical text-2xl border cursor-pointer transition ${
                        cIdx === i
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-white border-[#e2d5bd] hover:border-amber-500'
                      }`}
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">2. Vowel (Niqqud)</div>
                <div className="flex flex-wrap gap-1.5">
                  {VOWEL_SIM.map((item, i) => (
                    <button
                      key={item.name}
                      onClick={() => setVIdx(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                        vIdx === i
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-white border-[#e2d5bd] text-[#3a2a19] hover:border-amber-500'
                      }`}
                    >
                      {item.name} ({item.sound})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase text-amber-900 mb-1">3. Closing Consonant</div>
                <div className="flex flex-wrap gap-1.5">
                  {ENDINGS.map((item, i) => (
                    <button
                      key={item.label}
                      onClick={() => setEIdx(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${
                        eIdx === i
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-white border-[#e2d5bd] text-[#3a2a19] hover:border-amber-500'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Output Display */}
          <div className="w-full md:w-64 shrink-0 rounded-2xl bg-[#f5ebd6] border border-[#e0d0b3] p-6 text-center space-y-3">
            <div className="font-hebrew-biblical text-7xl text-[#211a13] leading-tight py-2">
              {syllable}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-bold text-amber-950">
                Modern: &ldquo;{modernReading}&rdquo;
              </div>
              <div className="text-xs text-[#69553e]">
                Tiberian: /{tiberianReading}/
              </div>
            </div>
            <button
              onClick={() => speakHebrew(syllable, { mode: 'biblical', slow: true })}
              className="w-full py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Pronounce Syllable
            </button>
          </div>
        </div>
      </div>

      {/* Complete Niqqud Chart */}
      <div className="parchment-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#2b1e10]">
          Complete Tiberian Vowel System
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {NIQQUD_VOWELS.map((vItem) => (
            <div
              key={vItem.id}
              className="rounded-xl bg-white border border-[#e6d9c2] p-4 flex flex-col justify-between gap-2.5 hover:border-amber-400 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-950">
                    {vItem.vowelClass}-Class • {vItem.length}
                  </span>
                  <h3 className="font-bold text-base text-[#2b1e10] mt-1">
                    {vItem.name}{' '}
                    <span className="font-hebrew-biblical text-amber-800 font-normal ml-1">
                      {vItem.hebrewName}
                    </span>
                  </h3>
                </div>
                <div className="font-hebrew-biblical text-4xl text-amber-950 bg-[#faf4e8] w-14 h-14 rounded-xl flex items-center justify-center border border-[#ece0c9]">
                  {vItem.sample}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                {(pronMode === 'dual' || pronMode === 'modern') && (
                  <p className="text-sky-900">
                    <strong>Modern:</strong> {vItem.modernPronunciation}
                  </p>
                )}
                {(pronMode === 'dual' || pronMode === 'tiberian') && (
                  <p className="text-amber-950">
                    <strong>Tiberian:</strong> {vItem.tiberianPronunciation}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f0e6d4]">
                <div>
                  <span className="font-hebrew-biblical text-xl text-[#211a13] mr-2">
                    {vItem.exampleWord}
                  </span>
                  <span className="text-xs text-[#6b5842]">
                    {vItem.exampleTranslit} ({vItem.exampleMeaning})
                  </span>
                </div>
                <button
                  onClick={() => speakHebrew(vItem.exampleWord, { mode: 'biblical', slow: true })}
                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cantillation (Te'amim) Guide */}
      <div className="parchment-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#2b1e10] flex items-center gap-2">
              <Music className="w-5 h-5 text-amber-800" />
              Masoretic Cantillation (Te&rsquo;amim) — Syntax &amp; Rhythm
            </h2>
            <p className="text-xs text-[#66543f]">
              Every word in the Leningrad &amp; Aleppo Codices carries a cantillation mark showing 1) word stress, 2)
              exact sentence phrasing, and 3) chanted melody.
            </p>
          </div>
          <button
            onClick={() =>
              onAskTutor(
                'Teach me how to parse Genesis 1:1-3 using Masoretic cantillation marks (Tipcha, Munach, Etnachta, Mercha, Silluq/Sof Pasuk) like a visual phrase tree.'
              )
            }
            className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 self-start cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Cantillation Tree Lesson
          </button>
        </div>

        {/* Live Genesis 1:1 Syntax Split */}
        <div className="rounded-xl bg-[#f5ebd6] border border-[#e2d1b2] p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-900">
            Example: Genesis 1:1 Split by Etnachta (֑) &amp; Sof Pasuk (׃)
          </div>
          <div className="grid md:grid-cols-2 gap-3" dir="rtl">
            <div className="rounded-lg bg-white/90 border border-amber-300 p-3 text-center">
              <div className="font-hebrew-codex text-2xl text-[#211a13]">
                בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים
              </div>
              <div className="text-xs text-[#5d4a36] mt-1" dir="ltr">
                <strong>First Half (ends at Etnachta ֑):</strong> &ldquo;In the beginning, God created...&rdquo;
              </div>
            </div>
            <div className="rounded-lg bg-white/90 border border-indigo-300 p-3 text-center">
              <div className="font-hebrew-codex text-2xl text-[#211a13]">
                אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃
              </div>
              <div className="text-xs text-[#5d4a36] mt-1" dir="ltr">
                <strong>Second Half (ends at Sof Pasuk ׃):</strong> &ldquo;...the heavens and the earth.&rdquo;
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CANTILLATION_MARKS.map((mark) => (
            <div key={mark.id} className="rounded-xl bg-white border border-[#e6d9c2] p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                  {mark.rank}
                </span>
                <span className="font-hebrew-codex text-3xl text-amber-900">{mark.symbol}</span>
              </div>
              <div className="font-bold text-sm text-[#2b1e10]">
                {mark.name} <span className="font-hebrew-biblical font-normal text-amber-800">{mark.hebrewName}</span>
              </div>
              <p className="text-xs text-[#66543f] leading-relaxed">{mark.functionDesc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-[#f0e6d4] text-xs">
                <span className="font-hebrew-codex text-lg text-[#211a13]">{mark.example}</span>
                <span className="text-[#78634a] font-medium">{mark.englishParallel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
