export interface WordPictureExample {
  hebrew: string;
  transliteration: string;
  meaning: string;
  breakdown: string;
}

export interface HebrewLetter {
  id: string;
  order: number;
  letter: string;
  dageshForm?: string;
  finalForm?: string;
  paleoGlyph: string; // Unicode Phoenician U+10900-U+10915
  name: string;
  hebrewName: string;
  gematria: number;
  modernSound: string;
  modernIpa: string;
  tiberianNote: string;
  category: 'guttural' | 'begadkefat' | 'sibilant' | 'standard';
  pictographName: string;
  pictographSvg: string; // SVG inner paths in 0 0 64 64 viewBox
  wordPictureKeywords: string[];
  friendsOfEberDepth: string;
  scholarlyNote: string;
  mnemonicPrompt: string;
  wordPictures: WordPictureExample[];
}

export const HEBREW_ALPHABET: HebrewLetter[] = [
  {
    id: 'aleph',
    order: 1,
    letter: 'א',
    paleoGlyph: '𐤀',
    name: 'Aleph',
    hebrewName: 'אָלֶף',
    gematria: 1,
    modernSound: 'Silent (glottal stop, carries vowel)',
    modernIpa: '/ʔ/ or silent',
    tiberianNote: 'Distinct glottal stop /ʔ/ at syllable onset; silent when closing a syllable (quiescent).',
    category: 'guttural',
    pictographName: 'Ox Head (Strength & Leader)',
    pictographSvg:
      '<path d="M16 14 C22 24, 24 30, 32 34 C40 30, 42 24, 48 14 M22 28 L32 52 L42 28 M24 34 L40 34" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Ox', 'Strength', 'Leader', 'First', 'Thousand', 'Teach / Learn'],
    friendsOfEberDepth:
      'Aleph depicts the horned head of an ox — the strongest, guiding animal of the ancient world. In letter-meaning traditions like The Friends of Eber, Aleph represents quiet primacy, covenant headship, and the unseen strength that initiates speech without making a sound of its own. The root א-ל-ף also means "to learn/teach" and "a thousand."',
    scholarlyNote:
      'Historically derived from Proto-Sinaitic *ʾalp ("ox"), which also gave rise to Greek Alpha (turn A upside-down to see the horned ox head!).',
    mnemonicPrompt:
      'A noble horned ox head etched in antique sepia ink and gold leaf on parchment, radiating quiet strength and leadership, ancient Near Eastern manuscript woodcut style',
    wordPictures: [
      {
        hebrew: 'אָב',
        transliteration: 'Av',
        meaning: 'Father',
        breakdown: 'א (Strength / Leader) + ב (House / Tent) → "The Strength of the House"',
      },
      {
        hebrew: 'אֵל',
        transliteration: 'El',
        meaning: 'God / Mighty One',
        breakdown: 'א (Ox / Strength) + ל (Shepherd’s Staff / Authority) → "The Mighty One of Authority"',
      },
      {
        hebrew: 'אֱמֶת',
        transliteration: 'Emet',
        meaning: 'Truth / Faithfulness',
        breakdown: 'א (First letter) + מ (Middle letter) + ת (Last letter) → "What stands from Beginning, Middle, to End"',
      },
    ],
  },
  {
    id: 'bet',
    order: 2,
    letter: 'ב',
    dageshForm: 'בּ',
    paleoGlyph: '𐤁',
    name: 'Bet / Vet',
    hebrewName: 'בֵּית',
    gematria: 2,
    modernSound: 'B (with dagesh בּ) / V (without ב)',
    modernIpa: '/b/ or /v/',
    tiberianNote: 'Begadkefat letter: hard stop /b/ with dagesh kal (בּ), soft fricative /v/ after a vowel (ב).',
    category: 'begadkefat',
    pictographName: 'Tent / House Floorplan',
    pictographSvg:
      '<path d="M16 48 V18 H48 V48 H30 V36" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['House', 'Tent', 'Inside', 'Family', 'Household', 'In / With'],
    friendsOfEberDepth:
      'Bet sketches the floorplan of a nomadic tent with an inward-turning doorway protecting the family within. As the very first letter of the Torah (בְּרֵאשִׁית, Bereshit), rabbinic and word-picture traditions note that creation itself is built as a dwelling place (Bayit). As a prefix (בְּ־), Bet means "in, inside, with."',
    scholarlyNote:
      'From Proto-Sinaitic *bayt ("house"). Compare Hebrew בַּיִת (bayit, house) and Bethlehem (בֵּית לֶחֶם, "House of Bread").',
    mnemonicPrompt:
      'An ancient nomad woven tent and courtyard dwelling under starlight, warm lamp glowing inside the open doorway, sepia and lapis watercolor parchment illustration',
    wordPictures: [
      {
        hebrew: 'בֵּן',
        transliteration: 'Ben',
        meaning: 'Son',
        breakdown: 'ב (House) + נ (Seed / Continuing Life) → "The one who continues the House"',
      },
      {
        hebrew: 'בַּיִת',
        transliteration: 'Bayit',
        meaning: 'House / Household',
        breakdown: 'ב (Tent) + י (Hand/Work) + ת (Covenant Mark) → "The marked dwelling built by hand"',
      },
    ],
  },
  {
    id: 'gimel',
    order: 3,
    letter: 'ג',
    dageshForm: 'גּ',
    paleoGlyph: '𐤂',
    name: 'Gimel',
    hebrewName: 'גִּימֶל',
    gematria: 3,
    modernSound: 'G as in "go"',
    modernIpa: '/ɡ/',
    tiberianNote: 'Begadkefat letter: hard /ɡ/ with dagesh (גּ); historically soft velar fricative /ɣ/ (like Arabic ghayn) without dagesh.',
    category: 'begadkefat',
    pictographName: 'Foot / Camel / Throw-Stick',
    pictographSvg:
      '<path d="M22 14 V44 L44 48 M22 44 L14 48" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Walk', 'Lift Up', 'Camel', 'Bestow / Reward', 'Benefit'],
    friendsOfEberDepth:
      'Gimel pictures a striding foot or the arched neck of a camel — carrying provision across long distances. In Hebrew thought, Gimel connects to גָּמַל (gamal: to ripen, wean, or bestow kindness). Notice how Gimel leans forward toward Dalet (the poor man’s door): picturing the generous one walking to give to the one in need.',
    scholarlyNote:
      'Debated in epigraphy between *gaml ("throw-stick/boomerang") and *gamal ("camel"); both reflect movement, reach, and carrying.',
    mnemonicPrompt:
      'A stately desert camel carrying spice bundles striding across golden dunes toward a tent doorway, vintage parchment ink illustration',
    wordPictures: [
      {
        hebrew: 'גָּדוֹל',
        transliteration: 'Gadol',
        meaning: 'Great / Large',
        breakdown: 'ג (Lift up) + ד (Door) + ל (Staff) → "Lifted high in authority"',
      },
      {
        hebrew: 'גַּן',
        transliteration: 'Gan',
        meaning: 'Garden / Protected Enclosure',
        breakdown: 'ג (Gather/Lift) + נ (Sprouting Life) → "Where life rises and flourishes"',
      },
    ],
  },
  {
    id: 'dalet',
    order: 4,
    letter: 'ד',
    dageshForm: 'דּ',
    paleoGlyph: '𐤃',
    name: 'Dalet',
    hebrewName: 'דָּלֶת',
    gematria: 4,
    modernSound: 'D as in "door"',
    modernIpa: '/d/',
    tiberianNote: 'Begadkefat letter: hard /d/ with dagesh (דּ); historically soft /ð/ (like "this") without dagesh.',
    category: 'begadkefat',
    pictographName: 'Hanging Tent Door',
    pictographSvg:
      '<path d="M18 16 L48 32 L18 48 Z" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Door', 'Pathway', 'Enter / Exit', 'Dangle', 'Humble / Poor (Dal)'],
    friendsOfEberDepth:
      'Dalet portrays a triangular tent flap hanging from the ridgepole — the threshold between outside and inside. It also shares consonants with דַּל (dal, humble/poor), teaching that humility is the very doorway through which wisdom and generosity enter.',
    scholarlyNote:
      'Proto-Sinaitic *dalt ("door") or *dag ("fish"); evolved into Greek Delta (Δ), preserving the ancient triangular tent-flap shape!',
    mnemonicPrompt:
      'An open wooden and woven doorway of an ancient Levantine stone home opening onto a sunlit pathway, sepia engraving watercolor style',
    wordPictures: [
      {
        hebrew: 'דֶּרֶךְ',
        transliteration: 'Derekh',
        meaning: 'Way / Road / Journey',
        breakdown: 'ד (Door/Pathway) + ר (Head/Person) + ך (Open Palm) → "The path a person treads"',
      },
      {
        hebrew: 'דָּם',
        transliteration: 'Dam',
        meaning: 'Blood',
        breakdown: 'ד (Doorway) + מ (Water/Liquid) → "The crimson river of life"',
      },
    ],
  },
  {
    id: 'he',
    order: 5,
    letter: 'ה',
    paleoGlyph: '𐤄',
    name: 'He',
    hebrewName: 'הֵא',
    gematria: 5,
    modernSound: 'H as in "house" (silent at word end)',
    modernIpa: '/h/ or silent',
    tiberianNote: 'Guttural breath consonant; with a dot inside at word end (Mappiq הּ), the /h/ is pronounced audibly ("her").',
    category: 'guttural',
    pictographName: 'Person with Arms Raised ("Behold!")',
    pictographSvg:
      '<path d="M32 14 a4 4 0 1 0 0.1 0 M32 22 V42 M18 18 L32 28 L46 18 M24 52 L32 42 L40 52" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Behold!', 'Breath', 'Window', 'Reveal', 'Praise', 'The (prefix)'],
    friendsOfEberDepth:
      'He depicts a figure lifting both arms toward heaven in wonder — "Behold!" It is pure breath leaving the mouth, symbolizing revelation, spirit, and grace. When God renamed Abram to Abraham (אַבְרָהָם) and Sarai to Sarah (שָׂרָה), He breathed the letter He into their names. As a prefix (הַ־), it means "the" — pointing and saying "Behold this one!"',
    scholarlyNote:
      'From Proto-Sinaitic *hll ("jubilation / shouting for joy"), related to הָלַל (halal, to praise → Hallelujah). Source of Greek Epsilon (E).',
    mnemonicPrompt:
      'A traveler standing on a Judean hilltop at dawn raising both arms in awe toward golden rays breaking through clouds, parchment ink and watercolor',
    wordPictures: [
      {
        hebrew: 'הִנֵּה',
        transliteration: 'Hineh',
        meaning: 'Behold! / Here I am',
        breakdown: 'ה (Behold) + נ (Life/Activity) + ה (Reveal) → "Look closely, right here!"',
      },
      {
        hebrew: 'הָלַךְ',
        transliteration: 'Halakh',
        meaning: 'To walk / live',
        breakdown: 'ה (Reveal/Direct) + ל (Staff) + ך (Palm/Sole) → "To walk along one’s course of life"',
      },
    ],
  },
  {
    id: 'vav',
    order: 6,
    letter: 'ו',
    paleoGlyph: '𐤅',
    name: 'Vav / Waw',
    hebrewName: 'וָו',
    gematria: 6,
    modernSound: 'V (or vowel O/U with niqqud: וֹ / וּ)',
    modernIpa: '/v/ (Biblical /w/)',
    tiberianNote: 'In ancient Biblical & Tiberian Hebrew, Vav was pronounced /w/ (as in "water"). Also serves as vowel letter (mater lectionis) for O (וֹ) and U (וּ).',
    category: 'standard',
    pictographName: 'Tent Peg / Hook / Nail',
    pictographSvg:
      '<path d="M22 14 C22 24, 42 24, 42 14 M32 22 V52" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Peg', 'Hook', 'Connect', 'And (prefix)', 'Secure', 'Nail'],
    friendsOfEberDepth:
      'Vav is a wooden tent peg or bronze hook that fastens curtains together and anchors the tent to the earth (literally called vavim in Exodus 26–27!). Appropriately, as a prefix (וְ־) Vav is the Hebrew conjunction "and" — the grammatical hook joining words, clauses, and whole chains of Biblical narrative together!',
    scholarlyNote:
      'Proto-Sinaitic *waw ("hook/peg"). In Biblical Hebrew, Vav-consecutive (וַיֹּאמֶר, wayyomer, "and he said") drives nearly all narrative storytelling.',
    mnemonicPrompt:
      'An ancient forged bronze tent peg and rope hook anchoring a woven linen tabernacle curtain firmly into warm desert earth, sepia manuscript illustration',
    wordPictures: [
      {
        hebrew: 'אוֹר',
        transliteration: 'Or',
        meaning: 'Light',
        breakdown: 'א (Strength/Source) + וֹ (Connect/Extend) + ר (Head/Summit) → "Ordered illumination streaming forth"',
      },
      {
        hebrew: 'וַיֹּאמֶר',
        transliteration: 'Wayyomer',
        meaning: 'And He said',
        breakdown: 'וַ (Narrative Hook "And then...") + יֹּאמֶר (he said) — the heartbeat of Genesis!',
      },
    ],
  },
  {
    id: 'zayin',
    order: 7,
    letter: 'ז',
    paleoGlyph: '𐤆',
    name: 'Zayin',
    hebrewName: 'זַיִן',
    gematria: 7,
    modernSound: 'Z as in "Zion"',
    modernIpa: '/z/',
    tiberianNote: 'Voiced alveolar sibilant /z/. Note its crowned top stroke in calligraphic Torah script (Stam).',
    category: 'sibilant',
    pictographName: 'Plow / Mattock / Sword',
    pictographSvg:
      '<path d="M18 18 H46 M32 18 V46 M18 46 H46" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Cut', 'Plow', 'Harvest', 'Weapon', 'Nourish / Sustain', 'Crown'],
    friendsOfEberDepth:
      'Zayin looks like a bronze mattock, plowshare, or crowned scepter — tools that cut furrows into soil to bring forth food, or defend a household. In Hebrew, the root ז-ו-ן (zun) means "to feed and sustain," reminding us that cutting and pruning exist to nourish life. Its value is 7 — the number of Sabbath completion.',
    scholarlyNote:
      'From Proto-Sinaitic *zayn ("weapon/sword/mattock"). Descended into Greek Zeta (Z).',
    mnemonicPrompt:
      'An ancient bronze plow blade and golden wheat sheaf with a subtle olive-leaf crown on aged parchment, warm sepia ink illustration',
    wordPictures: [
      {
        hebrew: 'זָכַר',
        transliteration: 'Zakhar',
        meaning: 'To remember',
        breakdown: 'ז (Cut/Engrave) + כ (Palm) + ר (Head/Mind) → "To engrave indelibly in the mind"',
      },
      {
        hebrew: 'זֶרַע',
        transliteration: 'Zera',
        meaning: 'Seed / Offspring',
        breakdown: 'ז (Plow/Cut soil) + ר (Beginning/Head) + ע (Watch/Spring) → "Sown seed springing to life"',
      },
    ],
  },
  {
    id: 'chet',
    order: 8,
    letter: 'ח',
    paleoGlyph: '𐤇',
    name: 'Chet / Het',
    hebrewName: 'חֵית',
    gematria: 8,
    modernSound: 'Ch as in "Bach" or Scottish "loch"',
    modernIpa: '/χ/ (Biblical /ħ/)',
    tiberianNote: 'Guttural voiceless pharyngeal fricative /ħ/ (deep breath from the lower throat, softer and deeper than modern uvular /χ/).',
    category: 'guttural',
    pictographName: 'Courtyard Wall / Protective Fence',
    pictographSvg:
      '<path d="M20 14 V50 M44 14 V50 M20 22 H44 M20 32 H44 M20 42 H44" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Fence', 'Wall', 'Protect', 'Inner Chamber', 'Life (Chai)', 'Grace (Chen)'],
    friendsOfEberDepth:
      'Chet pictures a walled courtyard or woven tent-screen that surrounds and shelters what is precious inside — separating sacred from profane. Strikingly, Chet begins the core Hebrew words for Life (חַיִּים, Chayyim), Wisdom (חָכְמָה, Chokhmah), Grace (חֵן, Chen), and Covenant Love (חֶסֶד, Chesed).',
    scholarlyNote:
      'From Proto-Sinaitic *ḥaṣr ("courtyard/enclosure"). Note the visual difference from He (ה): Chet has a closed roof with no gap on the upper left!',
    mnemonicPrompt:
      'A sunlit stone courtyard wall enclosing an olive tree and quiet spring of living water, antique sepia and lapis manuscript illustration',
    wordPictures: [
      {
        hebrew: 'חַי',
        transliteration: 'Chai',
        meaning: 'Living / Life',
        breakdown: 'ח (Protected Enclosure) + י (Hand/Deed) → "Sustained, active vitality"',
      },
      {
        hebrew: 'חֶסֶד',
        transliteration: 'Chesed',
        meaning: 'Steadfast Covenant Love',
        breakdown: 'ח (Shelter/Wall) + ס (Support/Prop) + ד (Doorway) → "Protective, supporting faithfulness"',
      },
    ],
  },
  {
    id: 'tet',
    order: 9,
    letter: 'ט',
    paleoGlyph: '𐤈',
    name: 'Tet',
    hebrewName: 'טֵית',
    gematria: 9,
    modernSound: 'T as in "top"',
    modernIpa: '/t/',
    tiberianNote: 'Historically an emphatic pharyngealized /tˤ/ (distinct from Tav ת).',
    category: 'standard',
    pictographName: 'Woven Basket / Coiled Surround',
    pictographSvg:
      '<circle cx="32" cy="32" r="18" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M20 20 L44 44 M44 20 L20 44" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
    wordPictureKeywords: ['Basket', 'Surround', 'Contain', 'Good (Tov)', 'Pure (Tahor)', 'Hidden'],
    friendsOfEberDepth:
      'Tet resembles a coiled clay vessel or woven harvest basket holding treasure safely within its rim. Its first appearance in the entire Bible is Genesis 1:4 — "God saw the light, that it was GOOD (טוֹב, Tov)" — linking Tet deeply to hidden goodness, purity, and wholesome containment.',
    scholarlyNote:
      'Proto-Sinaitic circle-with-cross glyph (*ṭēt, "wheel/spindle/basket"). Source of Greek Theta (Θ).',
    mnemonicPrompt:
      'A finely woven ancient harvest basket overflowing with figs, olives, and golden light, warm parchment ink illustration',
    wordPictures: [
      {
        hebrew: 'טוֹב',
        transliteration: 'Tov',
        meaning: 'Good / Harmonious / Functional',
        breakdown: 'ט (Basket/Contain) + וֹ (Connect) + ב (House) → "That which surrounds and blesses the house"',
      },
    ],
  },
  {
    id: 'yod',
    order: 10,
    letter: 'י',
    paleoGlyph: '𐤉',
    name: 'Yod',
    hebrewName: 'יוֹד',
    gematria: 10,
    modernSound: 'Y as in "yes" (also vowel I/E)',
    modernIpa: '/j/',
    tiberianNote: 'Palatal glide /j/; also functions as vowel marker (mater lectionis) for long ī/ē. Smallest letter in the Aleph-Bet ("not one jot/yod").',
    category: 'standard',
    pictographName: 'Arm & Working Hand',
    pictographSvg:
      '<path d="M16 42 H36 V20 M36 28 H48 M36 36 H46" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Hand', 'Arm', 'Work', 'Deed', 'Create', 'My (suffix)'],
    friendsOfEberDepth:
      'Though Yod is the smallest letter of the Hebrew alphabet, it represents the outstretched hand and forearm — agency, craft, action, and blessing. In scribal art, every other Hebrew letter begins with the stroke of a Yod! It is also the first letter of the Divine Name (יהוה) and means "my" when suffixed to a noun.',
    scholarlyNote:
      'From Proto-Sinaitic *yad ("hand/forearm"), identical to Hebrew יָד (yad, hand). Source of Greek Iota (I).',
    mnemonicPrompt:
      'A gentle artist and scribe hand lifting a reed pen over a scroll with a subtle spark of golden light, antique sepia parchment illustration',
    wordPictures: [
      {
        hebrew: 'יָד',
        transliteration: 'Yad',
        meaning: 'Hand / Power',
        breakdown: 'י (Hand/Work) + ד (Doorway/Path) → "The hand that opens and acts"',
      },
      {
        hebrew: 'יָדַע',
        transliteration: 'Yada',
        meaning: 'To know intimately',
        breakdown: 'י (Hand/Experience) + ד (Door) + ע (Eye/See) → "To see and experience firsthand"',
      },
    ],
  },
  {
    id: 'kaf',
    order: 11,
    letter: 'כ',
    dageshForm: 'כּ',
    finalForm: 'ך',
    paleoGlyph: '𐤊',
    name: 'Kaf / Khaf',
    hebrewName: 'כַּף',
    gematria: 20,
    modernSound: 'K (with dagesh כּ) / Kh (without כ, ך)',
    modernIpa: '/k/ or /χ/',
    tiberianNote: 'Begadkefat letter: hard /k/ with dagesh (כּ), soft fricative /x/ without. Takes elongated final form ך (Kaf Sofit) at the end of a word.',
    category: 'begadkefat',
    pictographName: 'Open Palm / Cupped Hand',
    pictographSvg:
      '<path d="M32 50 V28 M32 34 L18 18 M32 28 L32 14 M32 34 L46 18" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Open Palm', 'Cup', 'Cover', 'Allow', 'Tame', 'Like / As (prefix)'],
    friendsOfEberDepth:
      'While Yod is the active arm at work, Kaf is the open, cupped palm — ready to receive, cover, shape clay, or bless. Notice how the letter כ itself curves like a cupped palm! As a prefix (כְּ־), Kaf means "like / according to" — just as a palm takes the exact impression of what it holds.',
    scholarlyNote:
      'Proto-Sinaitic *kapp ("palm of the hand"), matching Hebrew כַּף (kaf, palm/spoon). Final form ך (Sofit) occurs only at word end.',
    mnemonicPrompt:
      'An open cupped human palm gently holding fresh spring water and olive leaves, warm sepia and gold-ochre parchment illustration',
    wordPictures: [
      {
        hebrew: 'כָּבוֹד',
        transliteration: 'Kavod',
        meaning: 'Glory / Weight / Honor',
        breakdown: 'כ (Palm/Vessel) + ב (House) + וֹ (Connect) + ד (Door) → "The weighty presence filling the house"',
      },
      {
        hebrew: 'כֹּל',
        transliteration: 'Kol',
        meaning: 'All / Every / Whole',
        breakdown: 'כ (Open Palm) + ל (Staff/Reach) → "All held within the palm’s reach"',
      },
    ],
  },
  {
    id: 'lamed',
    order: 12,
    letter: 'ל',
    paleoGlyph: '𐤋',
    name: 'Lamed',
    hebrewName: 'לָמֶד',
    gematria: 30,
    modernSound: 'L as in "light"',
    modernIpa: '/l/',
    tiberianNote: 'Alveolar lateral /l/. Tallest letter in the Aleph-Bet, rising above the upper writing line.',
    category: 'standard',
    pictographName: 'Shepherd’s Staff / Ox Goad',
    pictographSvg:
      '<path d="M24 14 V40 C24 50, 44 50, 44 38 C44 32, 38 30, 34 32" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Staff', 'Shepherd', 'Guide', 'Learn / Teach (Lamad)', 'Toward / For (prefix)'],
    friendsOfEberDepth:
      'Lamed is the curved shepherd’s staff and ox-goad, towering above every other letter as an emblem of guidance and learning. Its very name comes from לָמַד (lamad — "to learn, to teach"), because true authority guides rather than crushes. As a prefix (לְ־), Lamed means "to, toward, for" — pointing the flock in the right direction.',
    scholarlyNote:
      'Proto-Sinaitic *lamd ("goad/crook"). Descended into Greek Lambda (Λ) and Latin L.',
    mnemonicPrompt:
      'A carved wooden shepherd crook resting beside green Judean hillside pastures at sunrise, ancient manuscript woodcut watercolor',
    wordPictures: [
      {
        hebrew: 'לֵב',
        transliteration: 'Lev',
        meaning: 'Heart / Mind / Inner Self',
        breakdown: 'ל (Staff/Authority) + ב (House/Inside) → "The governing center within the house"',
      },
      {
        hebrew: 'לָמַד',
        transliteration: 'Lamad',
        meaning: 'To learn / teach',
        breakdown: 'ל (Shepherd’s Staff) + מ (Flowing Water) + ד (Doorway) → "Guided through flowing wisdom’s door"',
      },
    ],
  },
  {
    id: 'mem',
    order: 13,
    letter: 'מ',
    finalForm: 'ם',
    paleoGlyph: '𐤌',
    name: 'Mem',
    hebrewName: 'מֵם',
    gematria: 40,
    modernSound: 'M as in "morning"',
    modernIpa: '/m/',
    tiberianNote: 'Bilabial nasal /m/. Has a closed square final form ם (Mem Sofit) at the end of words.',
    category: 'standard',
    pictographName: 'Waves of Water (Mayim)',
    pictographSvg:
      '<path d="M10 38 L18 24 L26 38 L34 24 L42 38 L50 24 L56 34" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Water', 'Mighty', 'Chaos / Cleansing', 'From (prefix)', 'Womb / Source'],
    friendsOfEberDepth:
      'Mem draws the rippling crest of waves — מַיִם (mayim, waters). Water can be untamed chaos (the Flood) or life-giving cleansing and revelation. Notice its two forms: Open Mem (מ) is flowing, revealed truth; Closed Final Mem (ם) is sealed, hidden depths. As a prefix (מִ־), Mem means "from / out of" — like a spring flowing from its source.',
    scholarlyNote:
      'Proto-Sinaitic *maym ("water"), directly ancestral to Greek Mu (M) and Latin M — the waves are still visible in our letter M!',
    mnemonicPrompt:
      'Deep lapis blue flowing waves of a mountain spring spilling across ancient limestone into a calm pool, parchment ink and watercolor',
    wordPictures: [
      {
        hebrew: 'מַיִם',
        transliteration: 'Mayim',
        meaning: 'Water(s)',
        breakdown: 'מ (Open Flowing Water) + י (Action) + ם (Contained Pool) — always grammatically dual/plural in Hebrew!',
      },
      {
        hebrew: 'מֶלֶךְ',
        transliteration: 'Melekh',
        meaning: 'King / Counselor',
        breakdown: 'מ (Mighty/Waters) + ל (Staff) + ך (Open Palm) → "Mighty guide with an open hand"',
      },
    ],
  },
  {
    id: 'nun',
    order: 14,
    letter: 'נ',
    finalForm: 'ן',
    paleoGlyph: '𐤍',
    name: 'Nun',
    hebrewName: 'נוּן',
    gematria: 50,
    modernSound: 'N as in "noon"',
    modernIpa: '/n/',
    tiberianNote: 'Alveolar nasal /n/. Frequently assimilates into a following consonant (creating a dagesh chazak!). Long final form: ן (Nun Sofit).',
    category: 'standard',
    pictographName: 'Sprouting Seed / Swimming Fish',
    pictographSvg:
      '<path d="M20 46 C18 32, 30 28, 34 16 C38 22, 46 24, 46 32 C46 42, 36 48, 28 46" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Seed', 'Fish', 'Life', 'Continuity', 'Heir / Offspring', 'Faithfulness'],
    friendsOfEberDepth:
      'Nun depicts either a sprouting seed or a darting fish swimming through the waters of Mem — both emblems of vibrant, multiplying life and generational continuity. In Aramaic, "nun" literally means fish (Joshua son of Nun!). Notice how regular Nun (נ) bows in humility, while Final Nun (ן) stands tall and upright.',
    scholarlyNote:
      'Proto-Sinaitic *naḥaš ("serpent") or Aramaic *nūn ("fish"); both capture sinuous vitality and motion. Descended into Greek Nu (N).',
    mnemonicPrompt:
      'A sprouting olive seed breaking through fertile earth alongside a silver fish leaping from blue water, sepia and lapis manuscript art',
    wordPictures: [
      {
        hebrew: 'נֶפֶשׁ',
        transliteration: 'Nefesh',
        meaning: 'Soul / Living Being / Throat',
        breakdown: 'נ (Life) + פ (Mouth/Breath) + ש (Consume/Vitality) → "A breathing, desiring living being"',
      },
      {
        hebrew: 'נֵר',
        transliteration: 'Ner',
        meaning: 'Lamp',
        breakdown: 'נ (Continuing Life) + ר (Head/Flame) → "A continuing light upon a stand"',
      },
    ],
  },
  {
    id: 'samekh',
    order: 15,
    letter: 'ס',
    paleoGlyph: '𐤎',
    name: 'Samekh',
    hebrewName: 'סָמֶךְ',
    gematria: 60,
    modernSound: 'S as in "sun"',
    modernIpa: '/s/',
    tiberianNote: 'Voiceless alveolar sibilant /s/ (merged in pronunciation with Sin שׂ, though kept distinct in spelling).',
    category: 'sibilant',
    pictographName: 'Tent Prop / Pillar / Support',
    pictographSvg:
      '<path d="M32 12 V52 M18 20 H46 M18 30 H46 M18 40 H46" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Support', 'Prop', 'Lean Upon', 'Protect', 'Circle / Surround'],
    friendsOfEberDepth:
      'Samekh originally pictured a sturdy wooden prop or thorn-pillar supporting a structure, and in square Hebrew script forms a complete protective circle. Its root ס-מ-ך (samakh) literally means "to uphold, support, or lay hands upon" — as in Psalm 145:14, where Samekh opens the verse: "The LORD upholds (סוֹמֵךְ) all who fall!"',
    scholarlyNote:
      'Proto-Sinaitic pillar/fishbone glyph (*samk, "support"). Be careful not to confuse rounded Samekh (ס) with squared Final Mem (ם)!',
    mnemonicPrompt:
      'A strong carved cedar pillar supporting a sunlit stone arch and encircling wreath on parchment, antique woodcut watercolor',
    wordPictures: [
      {
        hebrew: 'סֵפֶר',
        transliteration: 'Sefer',
        meaning: 'Scroll / Book',
        breakdown: 'ס (Support/Preserve) + פ (Mouth/Speech) + ר (Head/Record) → "Spoken words preserved and recounted"',
      },
    ],
  },
  {
    id: 'ayin',
    order: 16,
    letter: 'ע',
    paleoGlyph: '𐤏',
    name: 'Ayin',
    hebrewName: 'עַיִן',
    gematria: 70,
    modernSound: 'Silent (carries vowel; pharyngeal in Mizrahi/Biblical)',
    modernIpa: '/ʕ/ (Biblical) or silent',
    tiberianNote: 'Voiced pharyngeal fricative /ʕ/ — a deep resonant squeeze in the lower throat (like Arabic ʿayn). Distinguishes words like עַל ("upon") from אַל ("do not")!',
    category: 'guttural',
    pictographName: 'Watching Eye / Spring of Water',
    pictographSvg:
      '<path d="M12 32 C20 18, 44 18, 52 32 C44 46, 20 46, 12 32 Z" stroke="currentColor" stroke-width="3.5" fill="none"/><circle cx="32" cy="32" r="6" fill="currentColor"/>',
    wordPictureKeywords: ['Eye', 'See', 'Watch', 'Know', 'Spring / Fountain', 'Experience'],
    friendsOfEberDepth:
      'Ayin is a watchful eye — and in Hebrew, עַיִן (ayin) means BOTH "eye" and "a natural spring of water" (like En-Gedi, "Spring of the Wild Goat")! Sight and springs are both windows into what lies beneath the surface. The letter’s Paleo-Hebrew circle even gave the world our round letter O.',
    scholarlyNote:
      'Proto-Sinaitic *ʿayn ("eye"), ancestral to Greek Omicron (O) and Latin O. Mastering the Biblical pharyngeal sound helps you never confuse Aleph and Ayin.',
    mnemonicPrompt:
      'An expressive ancient Near Eastern eye inlaid in lapis lazuli reflected in a clear desert oasis spring, warm parchment manuscript illustration',
    wordPictures: [
      {
        hebrew: 'עוֹלָם',
        transliteration: 'Olam',
        meaning: 'Eternity / Vanishing Horizon / Age',
        breakdown: 'ע (Eye/Sight) + וֹ (Extend) + ל (Toward) + ם (Hidden Waters) → "Beyond the vanishing point of the eye"',
      },
      {
        hebrew: 'עֵבֶר',
        transliteration: 'Eber / Ever',
        meaning: 'Beyond / Across the River (Root of "Hebrew" עִבְרִי)',
        breakdown: 'ע (See/Spring) + ב (House) + ר (Person/Head) → "One who crosses over to the other side"',
      },
    ],
  },
  {
    id: 'pe',
    order: 17,
    letter: 'פ',
    dageshForm: 'פּ',
    finalForm: 'ף',
    paleoGlyph: '𐤐',
    name: 'Pe / Fe',
    hebrewName: 'פֵּא',
    gematria: 80,
    modernSound: 'P (with dagesh פּ) / F (without פ, ף)',
    modernIpa: '/p/ or /f/',
    tiberianNote: 'Begadkefat letter: hard /p/ with dagesh (פּ), soft /f/ without. Elongated final form: ף (Pe Sofit).',
    category: 'begadkefat',
    pictographName: 'Open Mouth / Speech',
    pictographSvg:
      '<path d="M14 34 C22 18, 42 18, 50 34 C42 46, 22 46, 14 34 Z M20 34 H44" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Mouth', 'Speak', 'Blow / Breath', 'Edge', 'Open', 'Expression'],
    friendsOfEberDepth:
      'Pe depicts an open mouth — פֶּה (peh, mouth). Notice its order right after Ayin (Eye): first we see with Ayin, then we speak with Pe! Look closely inside the white negative space of a calligraphic Pe (פ) and scribes love pointing out a hidden Bet (house) — because words spoken from the mouth build or tear down a house.',
    scholarlyNote:
      'Proto-Sinaitic *piʾt / *pē ("mouth/corner"). Evolved into Greek Pi (Π) and Latin P.',
    mnemonicPrompt:
      'An ancient herald blowing a silver trumpet with golden breath curls and spoken scrolls, sepia ink and parchment illustration',
    wordPictures: [
      {
        hebrew: 'פָּנִים',
        transliteration: 'Panim',
        meaning: 'Face / Presence',
        breakdown: 'פ (Mouth/Opening) + נ (Life) + י (Action) + ם (Plurality) → "The turning, expressive presence of a person"',
      },
    ],
  },
  {
    id: 'tsadi',
    order: 18,
    letter: 'צ',
    finalForm: 'ץ',
    paleoGlyph: '𐤑',
    name: 'Tsadi',
    hebrewName: 'צָדִי',
    gematria: 90,
    modernSound: 'TS as in "cats" or "pizza"',
    modernIpa: '/ts/',
    tiberianNote: 'Historically an emphatic pharyngealized /sˤ/. Final form: ץ (Tsadi Sofit).',
    category: 'sibilant',
    pictographName: 'Fishhook / Trail / Papyrus Plant',
    pictographSvg:
      '<path d="M32 14 V44 C32 52, 46 52, 46 42 M20 26 L32 34" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Hunt / Pull In', 'Desire', 'Trail', 'Righteous (Tzadik)', 'Side'],
    friendsOfEberDepth:
      'Tsadi pictures a curved hook or desert hunter’s snare — drawing something in toward a goal — or in rabbinic calligraphy, a humble figure kneeling with arms lifted to heaven (a צַדִּיק, Tzadik, a righteous person). It anchors words like צֶדֶק (Tzedek, justice/righteousness) and צִיּוֹן (Tziyyon, Zion).',
    scholarlyNote:
      'From Proto-Sinaitic *ṣādē ("plant/papyrus" or "hunting hook", cf. צוּד "to hunt/catch").',
    mnemonicPrompt:
      'A gleaming brass balance scale beside a straight desert trail leading toward Jerusalem hills, warm parchment sepia watercolor',
    wordPictures: [
      {
        hebrew: 'צֶדֶק',
        transliteration: 'Tzedek',
        meaning: 'Righteousness / Straight Standard',
        breakdown: 'צ (Straight Trail/Aim) + ד (Doorway) + ק (Horizon/Sun) → "Walking straight on the path of truth"',
      },
    ],
  },
  {
    id: 'qof',
    order: 19,
    letter: 'ק',
    paleoGlyph: '𐤒',
    name: 'Qof / Kof',
    hebrewName: 'קוֹף',
    gematria: 100,
    modernSound: 'K as in "king" (deeper uvular in Biblical)',
    modernIpa: '/k/ (Biblical /q/)',
    tiberianNote: 'Historically a deep uvular stop /q/ articulated at the very back of the throat (distinct from Kaf כּ). Notice its descender dips below the baseline.',
    category: 'standard',
    pictographName: 'Sun at the Horizon / Eye of a Needle',
    pictographSvg:
      '<circle cx="32" cy="26" r="14" stroke="currentColor" stroke-width="3.5" fill="none"/><path d="M32 12 V54" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
    wordPictureKeywords: ['Horizon', 'Time / Cycle', 'Back of Head', 'Gather', 'Holy (Kadosh)'],
    friendsOfEberDepth:
      'Qof portrays the sun rising or setting on the horizon — or the eye of a needle (the Talmudic meaning of קוֹף) through which thread passes. It marks cycles of time, drawing near (קָרַב, karav), and holiness (קָדוֹשׁ, kadosh) — because Qof’s leg reaches down into the lower world to elevate it.',
    scholarlyNote:
      'Proto-Sinaitic *qōp ("eye of needle / back of head / monkey"). Ancestor of Latin Q!',
    mnemonicPrompt:
      'A golden sun rising symmetrically on a desert horizon line casting a long beam of light across limestone, sepia and gold parchment art',
    wordPictures: [
      {
        hebrew: 'קָדוֹשׁ',
        transliteration: 'Kadosh',
        meaning: 'Holy / Set Apart',
        breakdown: 'ק (Horizon/Set Apart) + ד (Door) + וֹ (Connect) + שׁ (Radiant/Consume) → "Set apart in radiant purpose"',
      },
      {
        hebrew: 'קוֹל',
        transliteration: 'Qol',
        meaning: 'Voice / Sound',
        breakdown: 'ק (Gather/Call) + וֹ (Extend) + ל (Toward) → "A resonant call extending outward"',
      },
    ],
  },
  {
    id: 'resh',
    order: 20,
    letter: 'ר',
    paleoGlyph: '𐤓',
    name: 'Resh',
    hebrewName: 'רֵישׁ',
    gematria: 200,
    modernSound: 'R (uvular in Modern; rolled tap in Biblical)',
    modernIpa: '/ʁ/ (Biblical /r/)',
    tiberianNote: 'Historically an alveolar trilled/tapped /r/ (and behaves partly like a guttural — it resists taking a dagesh!). Curved corner distinguishes it from squared Dalet (ד).',
    category: 'guttural',
    pictographName: 'Human Head (Rosh)',
    pictographSvg:
      '<path d="M24 50 V22 C24 14, 44 14, 44 26 C44 34, 34 38, 24 38" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Head', 'Person', 'First / Chief', 'Beginning (Reshit)', 'Highest'],
    friendsOfEberDepth:
      'Resh is the silhouette of a human head in profile — רֹאשׁ (rosh, head, chief, beginning). It stands at the heart of the Bible’s very first word, בְּרֵאשִׁית (Bereshit, "In the Beginning"), as well as רוּחַ (Ruach, spirit/wind/breath) and רֹעֶה (Ro’eh, shepherd).',
    scholarlyNote:
      'Proto-Sinaitic *raʾš ("head"). Turn Paleo-Hebrew 𐤓 right-to-left and you get Greek Rho (Ρ) and Latin R!',
    mnemonicPrompt:
      'A dignified ancient profile portrait bust carved in warm Jerusalem limestone bathed in morning light, parchment sepia engraving',
    wordPictures: [
      {
        hebrew: 'רוּחַ',
        transliteration: 'Ruach',
        meaning: 'Spirit / Wind / Breath',
        breakdown: 'ר (Head/Person) + וּ (Connect) + ח (Inner Courtyard/Life) → "The invisible breath animating a person"',
      },
      {
        hebrew: 'רֵאשִׁית',
        transliteration: 'Reshit',
        meaning: 'Beginning / Firstfruits',
        breakdown: 'ר (Head) + א (First/Leader) + שׁ (Vitality) + י (Hand) + ת (Mark) → "The chief, crowning firstfruits"',
      },
    ],
  },
  {
    id: 'shin',
    order: 21,
    letter: 'ש',
    dageshForm: 'שׁ / שׂ',
    paleoGlyph: '𐤔',
    name: 'Shin / Sin',
    hebrewName: 'שִׁין',
    gematria: 300,
    modernSound: 'SH (dot on right שׁ) / S (dot on left שׂ)',
    modernIpa: '/ʃ/ or /s/',
    tiberianNote: 'Dot on upper-right = Shin /ʃ/ ("sh"). Dot on upper-left = Sin /s/ (historically lateral fricative /ɬ/). Memory trick: "Shin is on the right side (right-SH)!"',
    category: 'sibilant',
    pictographName: 'Two Front Teeth / Sharp Press',
    pictographSvg:
      '<path d="M12 22 L22 44 L32 24 L42 44 L52 22" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    wordPictureKeywords: ['Teeth', 'Sharp', 'Press / Crush', 'Consume', 'Fire', 'Two / Return'],
    friendsOfEberDepth:
      'Shin depicts two sharp teeth (שֵׁן, shen) — or three rising tongues of flame! Teeth press, crush, and transform raw grain into nourishment; fire refines gold and illuminates the dark. Shin crowns the words שָׁלוֹם (Shalom, peace/wholeness), שֵׁם (Shem, name), and שָׁמַיִם (Shamayim, heavens).',
    scholarlyNote:
      'Proto-Sinaitic *šinn ("tooth") or *ṯann ("composite bow"). Direct ancestor of Greek Sigma (Σ) and Latin S/W shapes.',
    mnemonicPrompt:
      'Three gentle golden flames rising from an ancient olive-oil menorah lamp against deep lapis night sky, sepia manuscript art',
    wordPictures: [
      {
        hebrew: 'שָׁלוֹם',
        transliteration: 'Shalom',
        meaning: 'Peace / Wholeness / Flourishing',
        breakdown: 'שׁ (Consume/Destroy chaos) + ל (Authority/Staff) + וֹ (Connect) + ם (Waters/Chaos) → "Authority binding chaos into wholeness"',
      },
      {
        hebrew: 'שֵׁם',
        transliteration: 'Shem',
        meaning: 'Name / Breath / Character',
        breakdown: 'שׁ (Vital Flame/Essence) + ם (Waters/Depth) → "A person’s enduring renown and essence"',
      },
    ],
  },
  {
    id: 'tav',
    order: 22,
    letter: 'ת',
    dageshForm: 'תּ',
    paleoGlyph: '𐤕',
    name: 'Tav',
    hebrewName: 'תָּו',
    gematria: 400,
    modernSound: 'T as in "Torah"',
    modernIpa: '/t/',
    tiberianNote: 'Begadkefat letter: hard /t/ with dagesh (תּ); historically soft /θ/ (like "thin") without dagesh (preserved as "s" in Ashkenazi pronunciation, e.g. Shabbas).',
    category: 'begadkefat',
    pictographName: 'Crossed Sticks / Covenant Mark',
    pictographSvg:
      '<path d="M18 18 L46 46 M46 18 L18 46" stroke="currentColor" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
    wordPictureKeywords: ['Mark', 'Sign', 'Signature', 'Covenant', 'Seal', 'Completion'],
    friendsOfEberDepth:
      'The final letter of the Aleph-Bet, Tav in Paleo-Hebrew was a simple X or + mark (literally called a "tav" in Ezekiel 9:4 — "set a mark [תָּו] upon the foreheads"). It was the ancient signature, boundary marker, and covenant seal. Together, Aleph and Tav (אֵת) span the entire alphabet — the first and the last!',
    scholarlyNote:
      'Proto-Sinaitic *tāw ("mark/cross"). Direct ancestor of Greek Tau (T) and Latin T. Notice the little "foot" on the bottom-left leg distinguishing ת from ח!',
    mnemonicPrompt:
      'An ancient clay wax covenant seal stamped with a crisp crossed-mark emblem resting on a tied parchment scroll, sepia and crimson ink watercolor',
    wordPictures: [
      {
        hebrew: 'תּוֹרָה',
        transliteration: 'Torah',
        meaning: 'Instruction / Teaching / Aiming straight',
        breakdown: 'From root י-ר-ה (to shoot an arrow straight/teach) crowned with ת (Covenant Mark) → "Covenant direction"',
      },
      {
        hebrew: 'אוֹת',
        transliteration: 'Ot',
        meaning: 'Sign / Letter / Covenant Token',
        breakdown: 'א (First/Strength) + וֹ (Connect) + ת (Mark/Seal) → "A sealed sign connecting heaven and earth"',
      },
    ],
  },
];

export const FINAL_LETTERS = [
  { regular: 'כ', final: 'ך', name: 'Kaf Sofit', sound: 'kh (as in Bach)', tip: 'Drops straight down below the baseline.' },
  { regular: 'מ', final: 'ם', name: 'Mem Sofit', sound: 'm', tip: 'Closes completely into a crisp square (unlike rounded Samekh ס).' },
  { regular: 'נ', final: 'ן', name: 'Nun Sofit', sound: 'n', tip: 'Extends long below the baseline (longer than Vav ו!).' },
  { regular: 'פ', final: 'ף', name: 'Pe Sofit', sound: 'f', tip: 'Unfolds downward below the baseline.' },
  { regular: 'צ', final: 'ץ', name: 'Tsadi Sofit', sound: 'ts', tip: 'Straight vertical stem extending below the baseline.' },
];
