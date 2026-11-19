/**
 * Intuitive English pronunciation engine for Biblical & Modern Hebrew.
 * Converts vocalized Hebrew (with niqqud & optional cantillation) into easy-to-read
 * English syllable pronunciation guides (e.g. בְּרֵאשִׁית → "beh-ray-SHEET").
 */

// Strip cantillation marks (U+0591-U+05AF) and punctuation, keeping consonants & vowels (niqqud)
function stripCantillation(text: string): string {
  return text
    .replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C3\u05C6]/g, '')
    .replace(/[׃.,!?;:"'()]/g, '')
    .trim();
}

// Strip all niqqud & cantillation (pure consonantal skeleton for dictionary lookup)
function stripAllMarks(text: string): string {
  return text
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[׃.,!?;:"'״׳־\-()]/g, '')
    .trim();
}

/**
 * Curated, syllable-stressed English pronunciation dictionary for all built-in
 * letters, vowels, curriculum words, flashcards, speaking drills, and manuscript verses.
 * Capitalized syllable marks primary Hebrew stress!
 */
const PHONETIC_DICT: Record<string, string> = {
  // Brand & Meta
  עבר: 'EH-ver',
  עברית: 'eev-REET',
  אלףבית: 'AH-lef-bayt',

  // 22 Letter Names
  אלף: 'AH-lef',
  בית: 'BAY-eet',
  גימל: 'GEE-mel',
  דלת: 'DAH-let',
  הא: 'hay',
  וו: 'vahv',
  זין: 'ZAH-yeen',
  חית: 'khayt',
  טית: 'tayt',
  יוד: 'yohd',
  כף: 'kahf',
  למד: 'LAH-med',
  מם: 'mem',
  נון: 'noon',
  סמך: 'SAH-mekh',
  עין: 'AH-yeen',
  פא: 'pay',
  צדי: 'TZAH-dee',
  קוף: 'kohf',
  ריש: 'raysh',
  שין: 'sheen',
  תו: 'tahv',
  מנצפך: 'mah-neh-tzah-PAKH',

  // Vowel & Cantillation Names
  קמץ: 'kah-MAHTZ',
  פתח: 'pah-TAHKH',
  צירי: 'tzay-RAY',
  סגול: 'seh-GOHL',
  חיריק: 'khee-REEK',
  חולם: 'khoh-LAHM',
  קבוץ: 'koo-BOOTZ',
  שורוק: 'shoo-ROOK',
  שוא: 'sheh-VAH',
  דגש: 'dah-GESH',
  בגדכפת: 'beh-gahd-keh-FAHT',
  חטף: 'khah-TAHF',
  סלוק: 'see-LOOK',
  וסוף: 'veh-SOHF',
  פסוק: 'pah-SOOK',
  אתנחתא: 'et-nahkh-TAH',
  זקף: 'zah-KAYF',
  קטן: 'kah-TOHN',
  טפחא: 'teep-KHAH',
  רביע: 'reh-VEE-ah',
  מונח: 'moo-NAHKH',
  מרכא: 'mayr-KHAH',

  // Core Alphabet Word Pictures & Starter Vocabulary
  אב: 'ahv',
  אל: 'ayl',
  אמת: 'eh-MET',
  בן: 'bayn',
  בת: 'baht',
  גדול: 'gah-DOHL',
  גן: 'gahn',
  דרך: 'DEH-rekh',
  דם: 'dahm',
  הנה: 'hee-NAY',
  הלך: 'hah-LAHKH',
  אור: 'ohr',
  זכר: 'zah-KHAHR',
  זרע: 'ZEH-rah',
  חי: 'khai',
  חיים: 'khah-YEEM',
  חסד: 'KHEH-sed',
  טוב: 'tohv',
  יד: 'yahd',
  ידע: 'yah-DAH',
  כבוד: 'kah-VOHD',
  כל: 'kohl',
  לב: 'layv',
  מים: 'MAH-yeem',
  מלך: 'MEH-lekh',
  נפש: 'NEH-fesh',
  נר: 'nayr',
  ספר: 'SEH-fer',
  עולם: 'oh-LAHM',
  פנים: 'pah-NEEM',
  צדק: 'TZEH-dek',
  קדוש: 'kah-DOHSH',
  קול: 'kohl',
  רוח: 'ROO-ahkh',
  ראשית: 'ray-SHEET',
  שלום: 'shah-LOHM',
  שם: 'shaym',
  תורה: 'toh-RAH',
  אות: 'oht',
  דבר: 'dah-VAHR',
  איש: 'eesh',
  שלחן: 'shool-KHAHN',
  אדמה: 'ah-dah-MAH',
  חלי: 'khoh-LEE',

  // Spoken Hebrew Essentials
  בקר: 'BOH-ker',
  בוקר: 'BOH-ker',
  תודה: 'toh-DAH',
  רבה: 'rah-BAH',
  מה: 'mah',
  שלומך: 'shloh-MKHAH',
  אני: 'ah-NEE',
  לומד: 'loh-MED',
  מקראית: 'meek-rah-EET',
  ומדברת: 'oo-meh-doo-BEH-ret',
  כמה: 'KAH-mah',
  זה: 'zeh',
  עולה: 'oh-LEH',
  איפה: 'AY-foh',
  הספר: 'hah-SEH-fer',
  ברוכים: 'beh-roo-KHEEM',
  הבאים: 'hah-bah-EEM',
  ללמוד: 'leel-MOHD',

  // Genesis 1:1–3
  בראשית: 'beh-ray-SHEET',
  ברא: 'bah-RAH',
  אלהים: 'eh-loh-HEEM',
  את: 'ayt',
  השמים: 'hah-shah-MAH-yeem',
  ואת: 'veh-AYT',
  הארץ: 'hah-AH-retz',
  והארץ: 'veh-hah-AH-retz',
  היתה: 'hah-yeh-TAH',
  תהו: 'TOH-hoo',
  ובהו: 'vah-VOH-hoo',
  וחשך: 'veh-KHOH-shekh',
  על: 'ahl',
  פני: 'peh-NAY',
  תהום: 'teh-HOHM',
  ורוח: 'veh-ROO-ahkh',
  מרחפת: 'meh-rah-KHEH-fet',
  המים: 'hah-MAH-yeem',
  ויאמר: 'vah-YOH-mer',
  יהי: 'yeh-HEE',
  ויהי: 'vah-yeh-HEE',

  // Deuteronomy 6:4–5 (The Shema)
  דברים: 'deh-vah-REEM',
  שמע: 'sheh-MAH',
  ישראל: 'yees-rah-EL',
  יהוה: 'ah-doh-NAI (YHWH)',
  אלהינו: 'eh-loh-HAY-noo',
  אחד: 'eh-KHAHD',
  ואהבת: 'veh-ah-hahv-TAH',
  אלהיך: 'eh-loh-HEH-khah',
  בכל: 'beh-KHOHL',
  לבבך: 'leh-vah-veh-KHAH',
  ובכל: 'oo-veh-KHOHL',
  נפשך: 'nahf-sheh-KHAH',
  מאדך: 'meh-oh-DEH-khah',

  // Psalm 23:1–3
  תהלים: 'teh-hee-LEEM',
  מזמור: 'meez-MOHR',
  לדוד: 'leh-dah-VEED',
  רעי: 'roh-EE',
  לא: 'loh',
  אחסר: 'ekh-SAHR',
  בנאות: 'been-OHT',
  דשא: 'DEH-sheh',
  ירביצני: 'yahr-bee-TZAY-nee',
  מי: 'may',
  מנחות: 'meh-noo-KHOHT',
  ינהלני: 'yeh-nah-hah-LAY-nee',
  נפשי: 'nahf-SHEE',
  ישובב: 'yeh-shoh-VAYV',
  ינחני: 'yahn-KHAY-nee',
  במעגלי: 'veh-mah-geh-LAY',
  למען: 'leh-MAH-ahn',
  שמו: 'sheh-MOH',

  // Isaiah 53:5–6
  ישעיהו: 'yeh-shah-YAH-hoo',
  והוא: 'veh-HOO',
  מחלל: 'meh-khoh-LAHL',
  מפשענו: 'mee-peh-shah-AY-noo',
  מדכא: 'meh-doo-KAH',
  מעונתינו: 'may-ah-voh-noh-TAY-noo',
  מוסר: 'moo-SAHR',
  שלומנו: 'sheh-loh-MAY-noo',
  עליו: 'ah-LAHV',
  ובחברתו: 'oo-vah-khah-voo-rah-TOH',
  נרפא: 'neer-PAH',
  לנו: 'LAH-noo',
  כלנו: 'koo-LAH-noo',
  כצאן: 'kah-TZOHN',
  תעינו: 'tah-EE-noo',
  לדרכו: 'leh-dahr-KOH',
  פנינו: 'pah-NEE-noo',
  ויהוה: 'vah-ah-doh-NAI',
  הפגיע: 'heef-GEE-ah',
  בו: 'boh',
  עון: 'ah-VOHN',

  // Curriculum Stage & Binyanim terms
  שלב: 'shah-LAHV',
  ניקוד: 'nee-KOOD',
  והגייה: 'veh-hah-gee-YAH',
  שורשים: 'shoh-rah-SHEEM',
  קידומות: 'kee-doh-MOHT',
  וסמיכות: 'oo-smee-KHOOT',
  הבניינים: 'hah-been-yah-NEEM',
  ההיפוך: 'hah-hee-POOKH',
  מדוברת: 'meh-doo-BEH-ret',
  ושיחה: 'veh-see-KHAH',
  טעמי: 'tah-ah-MAY',
  המקרא: 'hah-meek-RAH',
  וקריאה: 'oo-kree-AH',
  ללא: 'leh-LOH',
  כתבי: 'keet-VAY',
  היד: 'hah-YAHD',
  העתיקים: 'hah-ah-tee-KEEM',
  ומגילות: 'oo-meh-gee-LOHT',
  מדבר: 'meed-BAHR',
  יהודה: 'yeh-hoo-DAH',
  פעל: 'pah-AHL',
  נפעל: 'neef-AHL',
  פועל: 'poo-AHL',
  הפעיל: 'heef-EEL',
  הפעל: 'hoof-AHL',
  התפעל: 'heet-pah-EL',
  יברא: 'yeev-RAH',
  כתר: 'KEH-ter',
  ארם: 'ah-RAHM',
  צובא: 'tzoh-VAH',
  כתיב: 'keh-TEEV',
  וקרי: 'oo-keh-RAY',
  מסורה: 'mah-soh-RAH',
  קטנה: 'keh-tah-NAH',
  מגילת: 'meh-gee-LAHT',
  הגדולה: 'hah-geh-doh-LAH',
  מלא: 'mah-LAY',
};

// Special vowel-dependent disambiguations (same consonants, different vowels!)
const VOCALIZED_OVERRIDES: Record<string, string> = {
  'בֵּית': 'bayt',
  'בַּיִת': 'BAH-yeet',
  'שֵׁם': 'shaym',
  'שָׁם': 'shahm',
  'שִׁים': 'sheem',
  'שׁוּם': 'shoom',
  'דָּם': 'dahm',
  'דֹּם': 'dohm',
  'דִּים': 'deem',
  'דּוּם': 'doom',
  'לֵב': 'layv',
  'לָב': 'lahv',
  'לִבּ': 'leeb',
  'לוֹב': 'lohv',
  'אוֹר': 'ohr',
  'אוּר': 'oor',
  'אִיר': 'eer',
  'אֵר': 'ayr',
  'קָל': 'kahl',
  'קוֹל': 'kohl',
  'קִיל': 'keel',
  'קֵל': 'kayl',
  'בָּן': 'bahn',
  'בֵּן': 'bayn',
  'בִּין': 'been',
  'בּוֹן': 'bohn',
  'פִּעֵל': 'pee-EL',
  'פֻּעַל': 'poo-AHL',
  'הֻפְעַל': 'hoof-AHL',
  'פָּעַל': 'pah-AHL',
  'מֵי': 'may',
  'מִי': 'mee',
  'לֹא': 'loh',
  'לוֹ': 'loh',
};

function decodeSingleHebrewWord(rawWord: string): string {
  const cleaned = stripCantillation(rawWord);
  if (!cleaned) return '';

  // Check exact vocalized override first
  if (VOCALIZED_OVERRIDES[cleaned]) return VOCALIZED_OVERRIDES[cleaned];

  // Check consonantal dictionary (skip if it's a single pointed syllable like בָּ or שָׁ)
  const skeleton = stripAllMarks(cleaned);
  if (skeleton.length >= 2 && PHONETIC_DICT[skeleton]) {
    return PHONETIC_DICT[skeleton];
  }

  // Algorithmic niqqud-to-English decoder for arbitrary vocalized Hebrew words & syllables
  const chars = Array.from(cleaned);
  interface Token {
    base: string;
    marks: string;
  }
  const tokens: Token[] = [];
  for (const ch of chars) {
    const code = ch.charCodeAt(0);
    if (code >= 0x0591 && code <= 0x05c7) {
      if (tokens.length > 0) tokens[tokens.length - 1].marks += ch;
    } else if (code >= 0x05d0 && code <= 0x05ea) {
      tokens.push({ base: ch, marks: '' });
    }
  }
  if (tokens.length === 0) return '';

  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const next = tokens[i + 1];
    const hasDagesh = t.marks.includes('\u05BC');
    const isShin = t.marks.includes('\u05C1');
    const isSin = t.marks.includes('\u05C2');
    const hasCholam = t.marks.includes('\u05B9') || t.marks.includes('\u05BA');

    // Mater lectionis: Vav acting purely as O (וֹ) or U (וּ)
    if (t.base === 'ו' && hasDagesh && i > 0 && !/[\u05B0-\u05B8\u05BB]/.test(t.marks)) {
      current += 'oo';
      syllables.push(current);
      current = '';
      continue;
    }
    if (t.base === 'ו' && hasCholam && i > 0 && !/[\u05B0-\u05B8\u05BB]/.test(t.marks)) {
      current += 'oh';
      syllables.push(current);
      current = '';
      continue;
    }

    // Silent mater lectionis Yod after Chirik / Tzere / Segol
    if (
      t.base === 'י' &&
      !t.marks &&
      i > 0 &&
      (tokens[i - 1].marks.includes('\u05B4') ||
        tokens[i - 1].marks.includes('\u05B5') ||
        tokens[i - 1].marks.includes('\u05B6'))
    ) {
      continue;
    }

    // Silent final He without Mappiq
    if (t.base === 'ה' && i === tokens.length - 1 && !hasDagesh && !t.marks) {
      continue;
    }

    // Consonant sound
    let cons = '';
    switch (t.base) {
      case 'א':
      case 'ע':
        cons = '';
        break;
      case 'ב':
        cons = hasDagesh ? 'b' : 'v';
        break;
      case 'ג':
        cons = 'g';
        break;
      case 'ד':
        cons = 'd';
        break;
      case 'ה':
        cons = 'h';
        break;
      case 'ו':
        cons = 'v';
        break;
      case 'ז':
        cons = 'z';
        break;
      case 'ח':
        cons = 'kh';
        break;
      case 'ט':
      case 'ת':
        cons = 't';
        break;
      case 'י':
        cons = 'y';
        break;
      case 'כ':
      case 'ך':
        cons = hasDagesh ? 'k' : 'kh';
        break;
      case 'ל':
        cons = 'l';
        break;
      case 'מ':
      case 'ם':
        cons = 'm';
        break;
      case 'נ':
      case 'ן':
        cons = 'n';
        break;
      case 'ס':
        cons = 's';
        break;
      case 'פ':
      case 'ף':
        cons = hasDagesh ? 'p' : 'f';
        break;
      case 'צ':
      case 'ץ':
        cons = 'tz';
        break;
      case 'ק':
        cons = 'k';
        break;
      case 'ר':
        cons = 'r';
        break;
      case 'ש':
        cons = isSin ? 's' : isShin ? 'sh' : 'sh';
        break;
    }

    // Vowel sound
    let vow = '';
    if (t.marks.includes('\u05B8') || t.marks.includes('\u05B7') || t.marks.includes('\u05B2')) {
      vow = 'ah';
    } else if (t.marks.includes('\u05B5')) {
      vow = 'ay';
    } else if (t.marks.includes('\u05B6') || t.marks.includes('\u05B1')) {
      vow = 'eh';
    } else if (t.marks.includes('\u05B4')) {
      vow = 'ee';
    } else if (hasCholam || t.marks.includes('\u05B3')) {
      vow = 'oh';
    } else if (t.marks.includes('\u05BB')) {
      vow = 'oo';
    } else if (t.marks.includes('\u05B0')) {
      // Vocal shva at start of word or after another shva; silent mid/end of word
      vow = i === 0 ? 'eh' : '';
    }

    // Furtive patach under final Chet / Ayin (e.g. רוּחַ → roo-ahkh)
    if (i === tokens.length - 1 && (t.base === 'ח' || t.base === 'ע') && t.marks.includes('\u05B7')) {
      current += `ah${cons}`;
      syllables.push(current);
      current = '';
      continue;
    }

    if (vow) {
      current += cons + vow;
      // Check if next token is a closing consonant with no vowel (or silent shva)
      const nextIsCoda =
        next &&
        !/[\u05B1-\u05B9\u05BB]/.test(next.marks) &&
        !(next.base === 'ו' && (next.marks.includes('\u05BC') || next.marks.includes('\u05B9'))) &&
        !(next.base === 'ה' && i + 1 === tokens.length - 1 && !next.marks) &&
        !(next.base === 'י' && !next.marks) &&
        (i + 1 === tokens.length - 1 || next.marks.includes('\u05B0'));

      if (!nextIsCoda) {
        syllables.push(current);
        current = '';
      }
    } else {
      current += cons;
      if (i === tokens.length - 1 && current) {
        syllables.push(current);
        current = '';
      } else if (t.marks.includes('\u05B0') && current) {
        syllables.push(current);
        current = '';
      }
    }
  }

  if (current) syllables.push(current);
  return syllables.filter(Boolean).join('-');
}

/**
 * Convert any Hebrew word or multi-word phrase into an intuitive English pronunciation string.
 * Example: "בְּרֵאשִׁית בָּרָא אֱלֹהִים" → "beh-ray-SHEET bah-RAH eh-loh-HEEM"
 */
export function toEnglishPronunciation(hebrewText: string): string {
  if (!hebrewText) return '';
  // Split by whitespace, maqqef (־), bullets (•), or slashes while preserving hyphenated maqqef pairs
  const segments = hebrewText
    .replace(/־/g, ' ')
    .replace(/[•|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (const seg of segments) {
    // Only convert tokens that actually contain Hebrew letters (U+05D0-U+05EA)
    if (!/[\u05D0-\u05EA]/.test(seg)) continue;
    const pron = decodeSingleHebrewWord(seg);
    if (pron) out.push(pron);
  }
  return out.join(' ');
}
