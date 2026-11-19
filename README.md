# Eber (עֵבֶר) — Biblical & Spoken Hebrew Academy

A complete local web application to take you from **complete beginner** to **fluent reader of Biblical Hebrew manuscripts** (Westminster Leningrad Codex, Aleppo Codex, and Dead Sea Scrolls) while also building **practical Modern/Sephardi spoken Hebrew**.

## Highlights
- **7-Stage Beginner-to-Manuscript Roadmap**: Guided progression from the 22 letters → Tiberian vowels → 3-letter roots → 7 Binyanim verbs → Modern spoken Hebrew → Cantillation (*Te'amim*) & unpointed reading → Ancient Manuscripts.
- **Aleph-Bet & Ancient Word Pictures Studio**: All 22 letters + 5 final (*Sofit*) forms displayed across **Proto-Sinaitic pictographs**, **Paleo-Hebrew (`𐤀–𐤕`)**, **Masoretic Codex**, and **Modern Square** scripts — combining *The Friends of Eber*-inspired word pictures with Semitic linguistics, plus an interactive letter-tracing pad and cached AI mnemonic illustrations.
- **Niqqud & Cantillation Workshop**: Interactive syllable synthesizer comparing Tiberian Biblical vs. Modern Sephardi pronunciation + Masoretic syntax phrasing trees.
- **Ancient Manuscript Reader**: Study Genesis 1, the Shema (Deut 6), Psalm 23, and Isaiah 53 across **4 progressive modes** (Beginner Gloss → Masoretic Codex → Unpointed Scroll → Paleo/DSS) with side-by-side Leningrad Codex (B19A), Aleppo Codex, and Dead Sea Scrolls (`1QIsaᵃ`) comparisons + Deepgram read-aloud scoring + AI custom passage analyzer.
- **Speaking & Pronunciation Studio**: Powered by **Deepgram Nova-3 (`language=he`)** for Hebrew speech recognition + **Google Gemini Native Hebrew TTS** (with OpenAI TTS and free browser `he-IL` fallback) for both Biblical recitation drills and live Modern/Biblical conversation roleplay.
- **Visual SM-2 Flashcards**: Spaced-repetition deck with locally cached AI mnemonic artwork so you never pay twice for the same illustration.
- **Multi-Provider AI Scribe**: Defaults to **Google Gemini** (`gemini-2.5-flash` + `gemini-2.5-flash-image` + `gemini-2.5-flash-preview-tts`), with one-click switching to **OpenAI, Anthropic Claude, xAI Grok, Kimi, or Qwen**.

## Quick Start
```bash
npm install
npm run dev
```
Then open **http://localhost:5173** and visit **API & Settings** in the left sidebar to enter your Deepgram and Gemini (or OpenAI/Claude/Grok/Kimi/Qwen) API keys. They are stored locally in `.env`.
