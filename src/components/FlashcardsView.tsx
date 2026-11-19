import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { api, Flashcard, speakHebrew } from '../lib/api';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onReview: (id: string, quality: 1 | 2 | 3 | 4) => Promise<void>;
  onAddCard: (card: Partial<Flashcard>) => Promise<void>;
  onDeleteCard: (id: string) => Promise<void>;
  onUpdateCard: (card: Partial<Flashcard>) => Promise<void>;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  onReview,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
}) => {
  const [filter, setFilter] = useState<'due' | 'all' | 'biblical' | 'spoken'>('due');
  const [flipped, setFlipped] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({
    hebrew: '',
    transliteration: '',
    meaning: '',
    root: '',
    pictographNote: '',
    category: 'biblical',
  });

  const now = Date.now();
  const filtered = flashcards.filter((c) => {
    if (filter === 'due') return (c.dueAt ?? 0) <= now;
    if (filter === 'biblical') return c.category === 'biblical';
    if (filter === 'spoken') return c.category === 'spoken';
    return true;
  });

  const activeCard = filtered[cardIdx % Math.max(filtered.length, 1)];

  const handleGrade = async (q: 1 | 2 | 3 | 4) => {
    if (!activeCard) return;
    await onReview(activeCard.id, q);
    setFlipped(false);
    setCardIdx((prev) => (prev + 1 >= filtered.length - 1 ? 0 : prev));
  };

  const handleGenerateCardArt = async () => {
    if (!activeCard) return;
    setImgLoading(true);
    setImgError('');
    try {
      const res = await api.generateImage({
        concept: `Hebrew vocabulary "${activeCard.transliteration}" meaning "${activeCard.meaning}"`,
        hebrew: activeCard.hebrew,
        pictograph: activeCard.pictographNote,
      });
      await onUpdateCard({ id: activeCard.id, imageUrl: res.imageUrl });
    } catch (err: any) {
      setImgError(err.message || 'Image generation failed.');
    } finally {
      setImgLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.hebrew.trim() || !newCard.meaning.trim()) return;
    await onAddCard(newCard);
    setNewCard({ hebrew: '', transliteration: '', meaning: '', root: '', pictographNote: '', category: 'biblical' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#2b1e10]">
            Visual Spaced-Repetition Flashcards (SM-2)
          </h1>
          <p className="text-sm text-[#66543f]">
            Pair Hebrew roots with ancient word pictures, spoken audio, and cached AI mnemonic illustrations so vocabulary
            sticks for life.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#efe5d3] p-1 border border-[#dfd1b7]">
            {(
              [
                { id: 'due', label: `Due (${flashcards.filter((c) => (c.dueAt ?? 0) <= now).length})` },
                { id: 'all', label: `All (${flashcards.length})` },
                { id: 'biblical', label: 'Biblical' },
                { id: 'spoken', label: 'Spoken' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setCardIdx(0);
                  setFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filter === f.id ? 'bg-amber-900 text-white' : 'text-[#5b4733]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdd((v) => !v)}
            className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Card
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="parchment-card rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Hebrew word (e.g. תּוֹרָה)"
            value={newCard.hebrew}
            onChange={(e) => setNewCard({ ...newCard, hebrew: e.target.value })}
            className="rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-sm font-hebrew-biblical"
          />
          <input
            placeholder="Transliteration (e.g. Torah)"
            value={newCard.transliteration}
            onChange={(e) => setNewCard({ ...newCard, transliteration: e.target.value })}
            className="rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="English meaning (e.g. Instruction / Teaching)"
            value={newCard.meaning}
            onChange={(e) => setNewCard({ ...newCard, meaning: e.target.value })}
            className="rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder="3-letter root (e.g. י-ר-ה)"
            value={newCard.root}
            onChange={(e) => setNewCard({ ...newCard, root: e.target.value })}
            className="rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder="Ancient word picture / mnemonic note"
            value={newCard.pictographNote}
            onChange={(e) => setNewCard({ ...newCard, pictographNote: e.target.value })}
            className="sm:col-span-2 rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-sm"
          />
          <div className="sm:col-span-2 flex items-center justify-between">
            <select
              value={newCard.category}
              onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
              className="rounded-xl border border-[#dfd1b7] bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="biblical">Biblical Hebrew</option>
              <option value="spoken">Spoken Hebrew</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
            >
              Save Flashcard
            </button>
          </div>
        </form>
      )}

      {/* Active Study Card */}
      {activeCard ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="parchment-card rounded-3xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950">
                {activeCard.category} • Card {(cardIdx % filtered.length) + 1} of {filtered.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    speakHebrew(activeCard.hebrew, {
                      mode: activeCard.category === 'spoken' ? 'modern' : 'biblical',
                      slow: true,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Hear
                </button>
                <button
                  onClick={handleGenerateCardArt}
                  disabled={imgLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 border border-[#dcccb0] text-amber-950 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {imgLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  {activeCard.imageUrl ? 'Art Ready' : 'Paint Mnemonic'}
                </button>
                <button
                  onClick={() => onDeleteCard(activeCard.id)}
                  className="p-1.5 rounded-lg text-[#8c7860] hover:text-red-700 cursor-pointer"
                  title="Delete card"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {imgError && <div className="text-xs text-red-700">{imgError}</div>}

            {activeCard.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#e2d3b5] max-h-60 bg-[#f4ead5]">
                <img
                  src={activeCard.imageUrl}
                  alt={activeCard.transliteration}
                  className="w-full h-60 object-cover"
                />
              </div>
            )}

            <div className="text-center py-4 space-y-2">
              <div className="font-hebrew-biblical text-6xl text-[#211a13] leading-relaxed">
                {activeCard.hebrew}
              </div>

              {flipped ? (
                <div className="space-y-3 pt-4 border-t border-[#eadfcb]">
                  <div className="text-xl font-bold text-amber-900">{activeCard.transliteration}</div>
                  <div className="text-2xl font-display font-bold text-[#2b1e10]">
                    {activeCard.meaning}
                  </div>
                  {activeCard.root && (
                    <div className="text-xs font-semibold text-[#6e5c46]">
                      Root (Shoresh):{' '}
                      <span className="font-hebrew-biblical text-base text-amber-950 ml-1">
                        {activeCard.root}
                      </span>
                    </div>
                  )}
                  {activeCard.pictographNote && (
                    <div className="rounded-xl bg-[#f7efe0] border border-[#e6d6b8] p-3 text-xs text-[#3b2916]">
                      <strong>Word Picture:</strong> {activeCard.pictographNote}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setFlipped(true)}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reveal Meaning &amp; Word Picture
                </button>
              )}
            </div>

            {flipped && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => handleGrade(1)}
                  className="py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 text-xs font-bold cursor-pointer"
                >
                  Again (15m)
                </button>
                <button
                  onClick={() => handleGrade(2)}
                  className="py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold cursor-pointer"
                >
                  Hard
                </button>
                <button
                  onClick={() => handleGrade(3)}
                  className="py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold cursor-pointer"
                >
                  Good
                </button>
                <button
                  onClick={() => handleGrade(4)}
                  className="py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 text-xs font-bold cursor-pointer"
                >
                  Easy
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="parchment-card rounded-2xl p-10 text-center space-y-3 max-w-xl mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="font-display text-2xl font-bold text-[#2b1e10]">All Due Cards Reviewed!</h2>
          <p className="text-sm text-[#66543f]">
            Switch to <strong>All ({flashcards.length})</strong> to review ahead, or add new words from the Aleph-Bet
            and Manuscript Reader.
          </p>
        </div>
      )}
    </div>
  );
};
