export interface CurriculumLesson {
  id: string;
  title: string;
  hebrewFocus: string;
  durationMin: number;
  track: 'biblical' | 'spoken' | 'manuscript';
  summary: string;
  objectives: string[];
  actionTab: 'alphabet' | 'niqqud' | 'manuscripts' | 'speaking' | 'flashcards' | 'tutor';
  tutorPrompt: string;
}

export interface CurriculumStage {
  stage: number;
  title: string;
  hebrewTitle: string;
  level: string;
  goal: string;
  lessons: CurriculumLesson[];
}

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    stage: 1,
    title: 'The Sacred Aleph-Bet & Ancient Word Pictures',
    hebrewTitle: 'שלב א׳ — אל״ף־בי״ת וציורי מילים',
    level: 'Complete Beginner',
    goal: 'Recognize, write, and pronounce all 22 Hebrew consonants, 5 final (Sofit) forms, and their ancient Proto-Sinaitic pictographs.',
    lessons: [
      {
        id: 's1-l1',
        title: 'Letters 1–7: Aleph to Zayin (Ox, House, Foot, Door, Behold, Peg, Plow)',
        hebrewFocus: 'א ב ג ד ה ו ז',
        durationMin: 15,
        track: 'biblical',
        summary: 'Master the first 7 consonants through their ancient word pictures (Friends of Eber style) and first 2-letter roots like אָב (Father) and בֵּן (Son).',
        objectives: [
          'Distinguish Bet (בּ/ב) hard vs. soft pronunciation',
          'Connect Paleo-Hebrew pictographs to modern square shapes',
          'Read your first 5 Biblical words aloud',
        ],
        actionTab: 'alphabet',
        tutorPrompt: 'Teach me Lesson 1: Hebrew letters Aleph through Zayin (א–ז). Include their ancient word pictures (Friends of Eber style), how to distinguish similar letters like Bet/Kaf and Dalet/Resh, and give me a quick 3-word reading quiz!',
      },
      {
        id: 's1-l2',
        title: 'Letters 8–14: Chet to Nun (Wall, Basket, Hand, Palm, Staff, Water, Seed)',
        hebrewFocus: 'ח ט י כ ך ל מ ם נ ן',
        durationMin: 15,
        track: 'biblical',
        summary: 'Learn the middle heart of the Aleph-Bet, final forms ך ם ן, and iconic words like חַי (Life), לֵב (Heart), and מַיִם (Waters).',
        objectives: [
          'Master guttural Chet (ח) vs. He (ה)',
          'Learn Final Kaf, Mem, and Nun (ך ם ן)',
          'Understand prefixes לְ (to), כְּ (like), and מִ (from)',
        ],
        actionTab: 'alphabet',
        tutorPrompt: 'Teach me Lesson 2: Hebrew letters Chet through Nun (ח–נ) including final forms ך ם ן, their pictographs, and word-picture roots like לֵב (Lev) and מֶלֶךְ (Melekh).',
      },
      {
        id: 's1-l3',
        title: 'Letters 15–22: Samekh to Tav (Support, Eye, Mouth, Trail, Horizon, Head, Teeth, Mark)',
        hebrewFocus: 'ס ע פ ף צ ץ ק ר ש ת',
        durationMin: 15,
        track: 'biblical',
        summary: 'Complete the 22 letters, distinguish Shin (שׁ) vs. Sin (שׂ), and unlock שָׁלוֹם (Shalom), רוּחַ (Ruach), and תּוֹרָה (Torah).',
        objectives: [
          'Distinguish Samekh (ס) from Final Mem (ם)',
          'Practice Biblical pharyngeal Ayin (ע) vs. Aleph (א)',
          'Master Shin (right dot) vs. Sin (left dot)',
        ],
        actionTab: 'alphabet',
        tutorPrompt: 'Teach me Lesson 3: Hebrew letters Samekh through Tav (ס–ת), including Shin vs. Sin, final forms ף ץ, and the ancient word picture of שָׁלוֹם (Shalom) and אֱמֶת (Emet).',
      },
    ],
  },
  {
    stage: 2,
    title: 'Tiberian Vowels (Niqqud), Syllables & Pronunciation',
    hebrewTitle: 'שלב ב׳ — ניקוד והגייה',
    level: 'Beginner',
    goal: 'Decode any pointed Biblical Hebrew word fluently, knowing both Modern/Sephardi spoken pronunciation and Tiberian Biblical nuances.',
    lessons: [
      {
        id: 's2-l1',
        title: 'The 5 Vowel Families (A, E, I, O, U) & Mater Lectionis',
        hebrewFocus: 'בָּ בַּ בֵּ בֶּ בִּ בוֹ בּוּ',
        durationMin: 20,
        track: 'biblical',
        summary: 'Learn how the Masoretes of Tiberias preserved ancient Hebrew pronunciation with dots and dashes under and above consonants.',
        objectives: [
          'Read all long and short A/E/I/O/U vowel signs',
          'Recognize vowel-letters Vav (וֹ / וּ) and Yod (יִ)',
          'Compare Tiberian Kamatz (/ɔː/) with Modern Sephardi (/a/)',
        ],
        actionTab: 'niqqud',
        tutorPrompt: 'Guide me through the Tiberian Niqqud vowel system (A, E, I, O, U classes) and explain the difference between Modern Sephardi and Tiberian Biblical pronunciation with 5 practice words.',
      },
      {
        id: 's2-l2',
        title: 'Vocal vs. Silent Shva, Chataf Vowels & Dagesh Kal/Chazak',
        hebrewFocus: 'שְׁוָא • דָּגֵשׁ • בְּגַדְכְּפַת',
        durationMin: 20,
        track: 'biblical',
        summary: 'Unlock the two rules that make Hebrew syllable division crystal clear — when Shva speaks vs. stays silent, and when a dot doubles a letter.',
        objectives: [
          'Apply the 2-shva rule and open/closed syllables',
          'Recognize Chataf vowels under gutturals (אֱלֹהִים)',
          'Distinguish Dagesh Kal (Begadkefat) vs. Dagesh Chazak (doubling)',
        ],
        actionTab: 'niqqud',
        tutorPrompt: 'Explain Vocal vs. Silent Shva, Guttural Chataf vowels, and Dagesh Kal vs. Dagesh Chazak using Genesis 1:1–3 words as examples, then quiz me!',
      },
    ],
  },
  {
    stage: 3,
    title: 'Roots (Shorashim), Prefixes & Word-Picture Families',
    hebrewTitle: 'שלב ג׳ — שורשים, קידומות וסמיכות',
    level: 'Early Intermediate',
    goal: 'See Hebrew like a native scribe: spot the 3-letter root inside any word and build dozens of words from a single shoresh.',
    lessons: [
      {
        id: 's3-l1',
        title: 'The "Moshe Ve-Kalev" Prefixes & Pronominal Suffixes',
        hebrewFocus: 'הַ־ וְ־ בְּ־ כְּ־ לְ־ מִ־ • ־ִי ־ךָ ־וֹ ־ֵנוּ',
        durationMin: 20,
        track: 'biblical',
        summary: 'In Hebrew, "and in our house" is ONE word (וּבְבֵיתֵנוּ)! Learn the 7 inseparable prefixes and possessive suffixes to strip any word down to its core root.',
        objectives: [
          'Decode Definite Article הַ + Dagesh Chazak',
          'Master בְּ (in), כְּ (like), לְ (to), מִ (from), וְ (and)',
          'Recognize all possessive endings (my, your, his, her, our)',
        ],
        actionTab: 'manuscripts',
        tutorPrompt: 'Teach me the inseparable Hebrew prefixes (ב כ ל מ ה ו) and possessive suffixes using Deuteronomy 6:5 (בְּכָל־לְבָבְךָ וּבְכָל־נַפְשְׁךָ) as a live workshop!',
      },
      {
        id: 's3-l2',
        title: 'Triconsonantal Roots (Shorashim) & Construct Chains (Smikhut)',
        hebrewFocus: 'שׁ-ל-ם • מ-ל-ך • ד-ב-ר • עַל־פְּנֵי',
        durationMin: 20,
        track: 'biblical',
        summary: 'Discover how one 3-letter root blooms into verbs, nouns, and adjectives — and how Hebrew expresses "of" by leaning two nouns together.',
        objectives: [
          'Trace word families from מ-ל-ך (king/reign/kingdom) and ק-ד-שׁ (holy/sanctuary)',
          'Spot construct chains like רוּחַ אֱלֹהִים and מֵי מְנֻחוֹת',
          'Combine ancient pictograph mnemonics with Semitic root linguistics',
        ],
        actionTab: 'tutor',
        tutorPrompt: 'Teach me how 3-letter Hebrew roots (shorashim) work using מ-ל-ך, שׁ-מ-ע, and ק-ד-שׁ. Show both the Friends-of-Eber pictographic memory picture and the scholarly root derivatives, plus construct state (smikhut).',
      },
    ],
  },
  {
    stage: 4,
    title: 'Biblical Verbs (The 7 Binyanim) & Narrative Flow',
    hebrewTitle: 'שלב ד׳ — הבניינים וו״ו ההיפוך',
    level: 'Intermediate',
    goal: 'Master the Hebrew verb system (Pa’al through Hitpa’el) and the Vav-Consecutive narrative engine that drives Genesis through Kings.',
    lessons: [
      {
        id: 's4-l1',
        title: 'Qatal (Perfect), Yiqtol (Imperfect) & Wayyiqtol Narrative Chains',
        hebrewFocus: 'בָּרָא • יִבְרָא • וַיֹּאמֶר • וְאָהַבְתָּ',
        durationMin: 25,
        track: 'biblical',
        summary: 'Learn why Biblical Hebrew verbs express completed vs. ongoing aspect rather than strict English tenses, and how וַיֹּאמֶר ("and He said") drives Biblical storytelling.',
        objectives: [
          'Recognize Qatal suffixes and Yiqtol prefixes (Eitan letters א י ת נ)',
          'Spot Wayyiqtol (past narrative) vs. Weqatal (future/instruction)',
          'Translate Genesis 1:1–5 verbs without a dictionary',
        ],
        actionTab: 'manuscripts',
        tutorPrompt: 'Teach me Biblical Hebrew Qatal, Yiqtol, and Vav-Consecutive (Wayyiqtol & Weqatal) step-by-step using Genesis 1 and Deuteronomy 6, with a short interactive drill.',
      },
      {
        id: 's4-l2',
        title: 'The 7 Binyanim ("Houses" of the Verb)',
        hebrewFocus: 'פָּעַל • נִפְעַל • פִּעֵל • פֻּעַל • הִפְעִיל • הֻפְעַל • הִתְפַּעֵל',
        durationMin: 25,
        track: 'biblical',
        summary: 'Just as Bet means "house," Hebrew verbs live in 7 architectural "houses" (Binyanim): Simple, Passive, Intensive, Causative, and Reflexive.',
        objectives: [
          'Recognize Nif’al (נִ passive), Pi’el (middle dagesh intensive), Hif’il (הִ causative), Hitpa’el (הִתְ reflexive)',
          'Spot Hif’il and Pi’el verbs inside Psalm 23 and Isaiah 53',
          'See how one root shifts nuance across all 7 binyanim',
        ],
        actionTab: 'tutor',
        tutorPrompt: 'Walk me through the 7 Hebrew Binyanim (Qal/Paal, Nifal, Piel, Pual, Hifil, Hofal, Hitpael) using one clear root like ק-ד-שׁ or שׁ-מ-ר, plus examples from Psalm 23 and Isaiah 53.',
      },
    ],
  },
  {
    stage: 5,
    title: 'Spoken Hebrew Bridge & Conversational Fluency',
    hebrewTitle: 'שלב ה׳ — עברית מדוברת ושיחה',
    level: 'Intermediate',
    goal: 'Speak and understand living Hebrew with Modern/Sephardi pronunciation via Deepgram voice coaching, bridging Biblical roots to everyday speech.',
    lessons: [
      {
        id: 's5-l1',
        title: 'Greetings, Introductions & Biblical-to-Modern Vocabulary Shifts',
        hebrewFocus: 'שָׁלוֹם • בֹּקֶר טוֹב • מַה שְׁלוֹמְךָ • תּוֹדָה רַבָּה',
        durationMin: 20,
        track: 'spoken',
        summary: 'Start speaking immediately! Discover how Modern Israeli Hebrew is built directly on Biblical roots (with fascinating shifts like חשמל "amber/glow" → "electricity"!).',
        objectives: [
          'Hold a 5-turn spoken greeting exchange using Deepgram mic',
          'Learn Modern present-tense Benoni (participle) sentences',
          'Bridge 15 Biblical words into everyday Modern conversation',
        ],
        actionTab: 'speaking',
        tutorPrompt: 'Give me an interactive Spoken Hebrew starter lesson: everyday greetings, self-introduction, and 8 cool examples showing how Biblical Hebrew words evolved into Modern Hebrew conversation.',
      },
      {
        id: 's5-l2',
        title: 'Live Roleplay: Jerusalem Market & Studying Tanakh in Hebrew',
        hebrewFocus: 'אֲנִי לוֹמֵד עִבְרִית • כַּמָּה זֶה עוֹלֶה • אֵיפֹה הַסֵּפֶר',
        durationMin: 20,
        track: 'spoken',
        summary: 'Practice natural Hebrew conversation out loud with real-time Deepgram Nova-3 transcription, pronunciation scoring, and spoken AI responses.',
        objectives: [
          'Ask questions using מָה, מִי, אֵיפֹה, לָמָּה, כַּמָּה',
          'Build confidence speaking full sentences aloud',
          'Train ear comprehension with slow and natural Hebrew TTS',
        ],
        actionTab: 'speaking',
        tutorPrompt: 'Start a gentle Modern Hebrew conversation practice about buying fruit and scrolls in Jerusalem! Use niqqud, transliteration, English, and wait for my Hebrew reply.',
      },
    ],
  },
  {
    stage: 6,
    title: 'Cantillation (Te’amim) & Unpointed Reading Mastery',
    hebrewTitle: 'שלב ו׳ — טעמי המקרא וקריאה ללא ניקוד',
    level: 'Upper Intermediate',
    goal: 'Read Biblical verses syntactically using Masoretic accent trees AND transition cleanly to reading unvocalized (unpointed) Hebrew scrolls.',
    lessons: [
      {
        id: 's6-l1',
        title: 'Reading Masoretic Cantillation (Te’amim) as Syntax & Punctuation',
        hebrewFocus: 'סִלּוּק ׃ • אֶתְנַחְתָּא ֑ • זָקֵף ֔ • טִפְּחָא ֖',
        durationMin: 20,
        track: 'manuscript',
        summary: 'Cantillation marks are not just melody — they are a 1,000-year-old syntactic commentary showing exact clause boundaries and stressed syllables!',
        objectives: [
          'Identify Emperors (Sof Pasuk, Etnachta) and Kings (Zakef, Tipcha)',
          'Distinguish disjunctive (pause) vs. conjunctive (connect) marks',
          'Parse Genesis 1:1–3 and Psalm 23 by accent hierarchy',
        ],
        actionTab: 'niqqud',
        tutorPrompt: 'Teach me how to read Masoretic cantillation (Te’amim) as syntactic punctuation using Genesis 1:1–3 and Deuteronomy 6:4. Show the pause hierarchy clearly!',
      },
      {
        id: 's6-l2',
        title: 'Weaning Off Niqqud: Reading Unpointed Scrolls Like a Scribe',
        hebrewFocus: 'בראשית ברא אלהים את השמים ואת הארץ',
        durationMin: 25,
        track: 'manuscript',
        summary: 'Toggle off vowels in the Manuscript Reader and train your brain to recognize consonant root patterns (mishkalim), prefixes, and mater lectionis.',
        objectives: [
          'Read Genesis 1:1–3 and the Shema completely unpointed',
          'Predict hidden vowels from root patterns & grammar context',
          'Handle plene (full) vs. defective (short) Hebrew spelling',
        ],
        actionTab: 'manuscripts',
        tutorPrompt: 'Train me to read unpointed Hebrew! Give me 5 short unpointed Biblical phrases with hints on root patterns and prefixes so I can supply the vowels and translate them.',
      },
    ],
  },
  {
    stage: 7,
    title: 'Ancient Manuscripts: Aleppo, Leningrad & Dead Sea Scrolls',
    hebrewTitle: 'שלב ז׳ — כתבי היד העתיקים ומגילות מדבר יהודה',
    level: 'Advanced / Fluent',
    goal: 'Navigate the Masoretic apparatus, Ketiv/Qere notes, Aleppo & Leningrad Codices, and read Qumran Dead Sea Scrolls (1QIsaᵃ) directly.',
    lessons: [
      {
        id: 's7-l1',
        title: 'The Masoretes: Aleppo Codex ("The Crown") vs. Leningrad Codex (B19A)',
        hebrewFocus: 'כֶּתֶר אֲרָם צוֹבָא • כְּתִיב וּקְרֵי • מָסוֹרָה קְטַנָּה',
        durationMin: 25,
        track: 'manuscript',
        summary: 'Explore how the Ben Asher scribal family in 10th-century Tiberias engineered checksums (Masorah Parva/Magna) to guard every single letter of Scripture.',
        objectives: [
          'Understand what survives in Aleppo Codex vs. complete Leningrad B19A',
          'Read Masoretic marginalia: Ketiv (written) vs. Qere (read), Lamed (ל̇ = occurs once!)',
          'Compare Aleppo and Leningrad codex readings in Psalm 23 & Isaiah 53',
        ],
        actionTab: 'manuscripts',
        tutorPrompt: 'Give me an in-depth seminar on reading the Aleppo Codex and Leningrad Codex (B19A): explain Masorah Parva/Magna, Ketiv/Qere, the Lamed-dot (hapax legomenon), and how the two codices compare.',
      },
      {
        id: 's7-l2',
        title: 'Dead Sea Scrolls (Qumran): Great Isaiah Scroll (1QIsaᵃ) & Paleo-Hebrew',
        hebrewFocus: 'מגילת ישעיהו הגדולה • 𐤉𐤄𐤅𐤄 • כתיב מלא',
        durationMin: 30,
        track: 'manuscript',
        summary: 'Step back 2,100 years into Qumran Cave 1! Decode Qumran plene orthography (הואה, כול, לוא), scribal corrections, and Paleo-Hebrew divine names.',
        objectives: [
          'Recognize Herodian square script & Qumran plene (mater lectionis) conventions',
          'Compare 1QIsaᵃ Isaiah 53:5–11 directly with Aleppo & Leningrad',
          'Read Paleo-Hebrew (𐤀–𐤕) Tetragrammaton and early Torah fragments',
        ],
        actionTab: 'manuscripts',
        tutorPrompt: 'Teach me how to read the Great Isaiah Scroll (1QIsa-a) from the Dead Sea Scrolls! Explain Qumran plene orthography (like הואה and כול), Paleo-Hebrew script usage, and walk me through Isaiah 53:5 and 53:11 side-by-side with the Masoretic Text.',
      },
    ],
  },
];

export interface StarterFlashcard {
  id: string;
  hebrew: string;
  transliteration: string;
  meaning: string;
  root: string;
  pictographNote: string;
  category: 'biblical' | 'spoken' | 'letter';
}

export const STARTER_FLASHCARDS: StarterFlashcard[] = [
  {
    id: 'starter-elohim',
    hebrew: 'אֱלֹהִים',
    transliteration: 'Elohim',
    meaning: 'God / Mighty Creator',
    root: 'א-ל-ה',
    pictographNote: 'א (Ox/Strength) + ל (Staff/Authority) + ה (Behold) + י (Hand) + ם (Waters/Plurality of Majesty)',
    category: 'biblical',
  },
  {
    id: 'starter-shalom',
    hebrew: 'שָׁלוֹם',
    transliteration: 'Shalom',
    meaning: 'Peace, wholeness, completeness, hello/goodbye',
    root: 'שׁ-ל-ם',
    pictographNote: 'שׁ (Consume chaos) + ל (Authority) + וֹ (Connect) + ם (Waters) → "Wholeness restored"',
    category: 'biblical',
  },
  {
    id: 'starter-av',
    hebrew: 'אָב',
    transliteration: 'Av',
    meaning: 'Father',
    root: 'א-ב',
    pictographNote: 'א (Strength/Leader) + ב (House/Tent) → "Strength of the House"',
    category: 'biblical',
  },
  {
    id: 'starter-ben',
    hebrew: 'בֵּן',
    transliteration: 'Ben',
    meaning: 'Son',
    root: 'ב-נ-ה',
    pictographNote: 'ב (House) + נ (Seed/Continuing Life) → "Builder/Continuer of the House"',
    category: 'biblical',
  },
  {
    id: 'starter-lev',
    hebrew: 'לֵב',
    transliteration: 'Lev',
    meaning: 'Heart, mind, inner will',
    root: 'ל-ב-ב',
    pictographNote: 'ל (Shepherd’s Staff/Authority) + ב (Inside the House) → "What governs within"',
    category: 'biblical',
  },
  {
    id: 'starter-chesed',
    hebrew: 'חֶסֶד',
    transliteration: 'Chesed',
    meaning: 'Steadfast covenant love, loyal kindness',
    root: 'ח-ס-ד',
    pictographNote: 'ח (Protective Wall) + ס (Support/Pillar) + ד (Door) → "Sheltering, loyal love"',
    category: 'biblical',
  },
  {
    id: 'starter-emet',
    hebrew: 'אֱמֶת',
    transliteration: 'Emet',
    meaning: 'Truth, faithfulness, reliability',
    root: 'א-מ-ן',
    pictographNote: 'א (First) + מ (Middle) + ת (Last letter of the Aleph-Bet) → "What endures from start to finish"',
    category: 'biblical',
  },
  {
    id: 'starter-ruach',
    hebrew: 'רוּחַ',
    transliteration: 'Ruach',
    meaning: 'Spirit, wind, breath',
    root: 'ר-ו-ח',
    pictographNote: 'ר (Head/Person) + וּ (Connect) + ח (Inner Courtyard/Life)',
    category: 'biblical',
  },
  {
    id: 'starter-davar',
    hebrew: 'דָּבָר',
    transliteration: 'Davar',
    meaning: 'Word, matter, thing, event',
    root: 'ד-ב-ר',
    pictographNote: 'ד (Door) + ב (House) + ר (Head) → "Ordered words/deeds proceeding forth"',
    category: 'biblical',
  },
  {
    id: 'starter-melekh',
    hebrew: 'מֶלֶךְ',
    transliteration: 'Melekh',
    meaning: 'King, sovereign',
    root: 'מ-ל-ך',
    pictographNote: 'מ (Mighty) + ל (Staff) + ך (Open Palm) → "Ruler who counsels and guides"',
    category: 'biblical',
  },
  {
    id: 'starter-boker-tov',
    hebrew: 'בֹּקֶר טוֹב',
    transliteration: 'Boker Tov',
    meaning: 'Good morning!',
    root: 'ב-ק-ר + ט-ו-ב',
    pictographNote: 'בֹּקֶר (morning/breaking light, Genesis 1:5!) + טוֹב (good, Genesis 1:4!)',
    category: 'spoken',
  },
  {
    id: 'starter-toda',
    hebrew: 'תּוֹדָה רַבָּה',
    transliteration: 'Todah Rabah',
    meaning: 'Thank you very much!',
    root: 'י-ד-ה + ר-ב-ב',
    pictographNote: 'From Biblical יָדָה (to extend the hand in praise/thanksgiving, Psalm 100!)',
    category: 'spoken',
  },
  {
    id: 'starter-ma-shlomkha',
    hebrew: 'מַה שְׁלוֹמְךָ?',
    transliteration: 'Mah shlomkha? (m) / shlomekh? (f)',
    meaning: 'How are you? (Literally: What is your peace/wholeness?)',
    root: 'שׁ-ל-ם',
    pictographNote: 'Echoes Biblical greetings like 2 Samuel 20:9 ("הֲשָׁלוֹם אַתָּה")!',
    category: 'spoken',
  },
  {
    id: 'starter-ani-lomed',
    hebrew: 'אֲנִי לוֹמֵד עִבְרִית',
    transliteration: 'Ani lomed Ivrit',
    meaning: 'I am learning Hebrew',
    root: 'ל-מ-ד + ע-ב-ר',
    pictographNote: 'לָמַד (Shepherd’s staff of learning) + עִבְרִית (from Eber עֵבֶר — crossing over!)',
    category: 'spoken',
  },
];

export const SPEAKING_DRILLS = [
  {
    id: 'drill-shalom',
    track: 'spoken' as const,
    level: 'Beginner',
    hebrew: 'שָׁלוֹם, בֹּקֶר טוֹב',
    transliteration: 'Shalom, boker tov',
    english: 'Peace / Hello, good morning',
    tip: 'Keep the "o" in Shalom and Boker clean and rounded, stress on final syllable (sha-LOM, BO-ker TOV).',
  },
  {
    id: 'drill-gen1',
    track: 'biblical' as const,
    level: 'Beginner',
    hebrew: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ',
    transliteration: 'Be-reshit bara Elohim et ha-shamayim ve-et ha-aretz',
    english: 'In the beginning God created the heavens and the earth.',
    tip: 'Pause slightly after Elohim (Etnachta divider!). Pronounce the crisp "t" at the end of Bereshit.',
  },
  {
    id: 'drill-shema',
    track: 'biblical' as const,
    level: 'Beginner',
    hebrew: 'שְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד',
    transliteration: 'Shema Yisrael Adonai Eloheinu Adonai echad',
    english: 'Hear, O Israel: The LORD is our God, the LORD is One.',
    tip: 'Say "Adonai" for יהוה. Make the Chet in echad a warm throat friction (not a hard "k").',
  },
  {
    id: 'drill-ps23',
    track: 'biblical' as const,
    level: 'Intermediate',
    hebrew: 'מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר',
    transliteration: 'Mizmor le-David, Adonai ro-i lo echsar',
    english: 'A Psalm of David. The LORD is my shepherd; I shall not lack.',
    tip: 'Clearly articulate both syllables of ro-i (רֹעִי — watch the Ayin hiatus between o and i!).',
  },
  {
    id: 'drill-intro',
    track: 'spoken' as const,
    level: 'Beginner',
    hebrew: 'אֲנִי לוֹמֵד עִבְרִית מִקְרָאִית וּמְדֻבֶּרֶת',
    transliteration: 'Ani lomed Ivrit mikra-it u-meduberet',
    english: 'I am learning Biblical and spoken Hebrew.',
    tip: 'Great everyday sentence! Notice Ivrit (עִבְרִית) carries the ancient root of Eber (עֵבֶר).',
  },
];
