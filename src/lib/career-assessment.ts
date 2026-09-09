// Content + scoring for the three grade-specific career-guidance instruments used by
// Presidential School Gulistan's counselor: Klimov's DDO (grade 9), a RIASEC/Holland
// interest inventory (grade 10), and Crites' CMI career-maturity structure (grade 11).
// Kept as a pure, dependency-free module so both the student test-taking page and the
// counselor results page can import the same content + scoring functions.

export type AssessmentType = 'ddo' | 'riasec' | 'cmi';

export function gradeToAssessmentType(gradeLevel?: string | null): AssessmentType | null {
  if (gradeLevel === '9') return 'ddo';
  if (gradeLevel === '10') return 'riasec';
  if (gradeLevel === '11') return 'cmi';
  return null;
}

export const ASSESSMENT_META: Record<
  AssessmentType,
  { title: string; subtitle: string; totalQuestions: number; gradeLevel: string }
> = {
  ddo: {
    title: "Kasbga yo'naltirish testi",
    subtitle: "E.A. Klimov metodikasi (DDO) — 9-sinf",
    totalQuestions: 20,
    gradeLevel: '9',
  },
  riasec: {
    title: 'Kasbiy qiziqishlar inventari',
    subtitle: 'Holland RIASEC nazariyasi — 10-sinf',
    totalQuestions: 60,
    gradeLevel: '10',
  },
  cmi: {
    title: 'Kasbiy yetuklik testi',
    subtitle: 'Crites CMI tuzilishi — 11-sinf',
    totalQuestions: 50,
    gradeLevel: '11',
  },
};

// ---------------------------------------------------------------------------
// 9-sinf: DDO (Klimov)
// ---------------------------------------------------------------------------

export type DdoCategoryKey = 'nature' | 'technology' | 'sign_systems' | 'artistic' | 'social';

export interface DdoQuestion {
  number: number;
  textA: string;
  textB: string;
  categoryA: DdoCategoryKey;
  categoryB: DdoCategoryKey;
}

export const DDO_CATEGORY_INFO: Record<DdoCategoryKey, { label: string; careers: string[] }> = {
  nature: {
    label: 'Inson — Tabiat',
    careers: ['Biolog', 'veterinar', 'agronom', 'ekolog', "o'rmonchi", 'florist', 'baliqchi'],
  },
  technology: {
    label: 'Inson — Texnika',
    careers: ['Muhandis', 'mexanik', 'elektrik', 'quruvchi', 'avtomexanik', 'texnolog'],
  },
  sign_systems: {
    label: 'Inson — Belgi tizimi',
    careers: ['Dasturchi', 'buxgalter', 'iqtisodchi', 'tahlilchi', 'tarjimon', 'kutubxonachi'],
  },
  artistic: {
    label: 'Inson — Badiiy obraz',
    careers: ['Dizayner', 'rassom', 'musiqachi', 'yozuvchi', 'stilist', 'rejissyor'],
  },
  social: {
    label: 'Inson — Inson',
    careers: ['Oʻqituvchi', 'shifokor', 'psixolog', 'menejer', 'ijtimoiy xodim', 'jurnalist'],
  },
};

const ddoPair = (
  number: number,
  textA: string,
  categoryA: DdoCategoryKey,
  textB: string,
  categoryB: DdoCategoryKey
): DdoQuestion => ({ number, textA, categoryA, textB, categoryB });

export const DDO_QUESTIONS: DdoQuestion[] = [
  ddoPair(1, "Hayvonlarga g'amxo'rlik qilish", 'nature', 'Asbob-uskunalarni sozlash', 'technology'),
  ddoPair(2, "O'simliklarni parvarish qilish", 'nature', 'Statistik jadval yoki hisobot tuzish', 'sign_systems'),
  ddoPair(3, "Bog'dagi mevalarni parvarish qilish", 'nature', 'Rasm chizish yoki hunarmandchilik bilan shugʻullanish', 'artistic'),
  ddoPair(4, 'Tabiat va hayvonlar ustida kuzatuv olib borish', 'nature', "Kasal yoki yordamga muhtoj odamlarga g'amxo'rlik qilish", 'social'),
  ddoPair(5, 'Mexanizm yoki qurilmani yigʻish', 'technology', 'Moliyaviy hisob-kitoblar yuritish', 'sign_systems'),
  ddoPair(6, "Elektr asboblarini ta'mirlash", 'technology', 'Musiqa asbobida ijro etish', 'artistic'),
  ddoPair(7, 'Texnik uskunani sozlash va ishga tushirish', 'technology', "Odamlarga texnika ishlatishni o'rgatish", 'social'),
  ddoPair(8, 'Hujjatlar va raqamlar bilan ishlash', 'sign_systems', "She'r yoki hikoya yozish", 'artistic'),
  ddoPair(9, "Ma'lumotlarni tartibga solish va arxivlash", 'sign_systems', 'Mijozlar yoki mehmonlar bilan muloqot qilish', 'social'),
  ddoPair(10, 'Sahna yoki bayram uchun bezak tayyorlash', 'artistic', 'Bolalar yoki kattalar bilan mashgʻulot oʻtkazish', 'social'),
  ddoPair(11, "O'rmonda daraxt ekish yoki parvarish qilish", 'nature', 'Kompyuter yoki maishiy texnikani taʻmirlash', 'technology'),
  ddoPair(12, "Tabiatni kuzatib, undan namunalar yig'ish", 'nature', "Ma'lumotlar bazasi yoki jadvallar bilan ishlash", 'sign_systems'),
  ddoPair(13, "Qishloq xo'jaligi mahsulotlarini yetishtirish", 'nature', 'Film yoki video kontent yaratish', 'artistic'),
  ddoPair(14, 'Veterinariya klinikasida hayvonlarga yordam berish', 'nature', "Kichik bolalarga ta'lim berish", 'social'),
  ddoPair(15, 'Dastgoh yoki mashinada ishlash', 'technology', 'Dasturlash kodi yozish', 'sign_systems'),
  ddoPair(16, "Avtomobil yoki mexanizmni ta'mirlash", 'technology', 'Kiyim-kechak yoki interyer dizaynini yaratish', 'artistic'),
  ddoPair(17, 'Qurilish yoki montaj ishlarini bajarish', 'technology', 'Xodimlarga texnika xavfsizligini oʻrgatish', 'social'),
  ddoPair(18, 'Buxgalteriya yoki moliyaviy hisobotlar yuritish', 'sign_systems', 'Rassomlik yoki dizayn asari yaratish', 'artistic'),
  ddoPair(19, "Kutubxona yoki arxiv kataloglarini yuritish", 'sign_systems', "Mijozlarga maslahat va xizmat ko'rsatish", 'social'),
  ddoPair(20, 'Konsert yoki tomosha dasturini tayyorlash', 'artistic', "Ijtimoiy loyiha yoki ko'ngillilar guruhini boshqarish", 'social'),
];

export interface DdoResultRow {
  key: DdoCategoryKey;
  label: string;
  careers: string[];
  score: number;
}

export function scoreDdo(answers: Record<number, 'A' | 'B'>): DdoResultRow[] {
  const scores: Record<DdoCategoryKey, number> = {
    nature: 0,
    technology: 0,
    sign_systems: 0,
    artistic: 0,
    social: 0,
  };

  DDO_QUESTIONS.forEach((q) => {
    const choice = answers[q.number];
    if (choice === 'A') scores[q.categoryA] += 1;
    else if (choice === 'B') scores[q.categoryB] += 1;
  });

  return (Object.keys(scores) as DdoCategoryKey[])
    .map((key) => ({ key, label: DDO_CATEGORY_INFO[key].label, careers: DDO_CATEGORY_INFO[key].careers, score: scores[key] }))
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// 10-sinf: Holland RIASEC
// ---------------------------------------------------------------------------

export type RiasecCategoryKey = 'realistic' | 'investigative' | 'artistic' | 'social' | 'enterprising' | 'conventional';

export interface RiasecItem {
  number: number;
  text: string;
  category: RiasecCategoryKey;
}

export const RIASEC_CATEGORY_INFO: Record<RiasecCategoryKey, { letter: string; label: string; careers: string[] }> = {
  realistic: {
    letter: 'R',
    label: 'Amaliy-texnik (Realistic)',
    careers: ['Muhandis', 'mexanik', 'quruvchi', 'uchuvchi', 'fermer', 'avtomexanik'],
  },
  investigative: {
    letter: 'I',
    label: 'Tadqiqot-tahliliy (Investigative)',
    careers: ['Olim', 'shifokor', 'dasturchi', 'tahlilchi', 'farmatsevt', 'laborant'],
  },
  artistic: {
    letter: 'A',
    label: 'Ijodiy (Artistic)',
    careers: ['Dizayner', 'rassom', 'yozuvchi', 'musiqachi', 'jurnalist', 'rejissyor'],
  },
  social: {
    letter: 'S',
    label: 'Ijtimoiy (Social)',
    careers: ["Oʻqituvchi", 'psixolog', 'ijtimoiy xodim', 'hamshira', 'murabbiy'],
  },
  enterprising: {
    letter: 'E',
    label: 'Tashkilotchi-tadbirkorlik (Enterprising)',
    careers: ['Menejer', 'tadbirkor', 'marketolog', 'yurist', "sotuv bo'yicha mutaxassis"],
  },
  conventional: {
    letter: 'C',
    label: 'Tizimli-amaliy (Conventional)',
    careers: ['Buxgalter', 'moliyachi', "ma'muriy xodim", 'auditor', 'statistik'],
  },
};

const RIASEC_TEXTS: Record<RiasecCategoryKey, string[]> = {
  realistic: [
    "Uy jihozlarini yig'ish yoki o'rnatish",
    'Avtomobil yoki mototsikl mexanizmini taʻmirlash',
    'Qurilish maydonida ishlash',
    'Elektr simlarini ulash va sozlash',
    "Yog'och ustaxonasida mebel yasash",
    "Bog'dorchilik yoki fermerlik ishlari bilan shug'ullanish",
    'Sport anjomlari yoki mashqlarni tashkil qilish',
    "Texnik asboblarni sinovdan o'tkazish",
    "Robot yoki mexanik qurilma yig'ish",
    "Uskunalarga texnik xizmat ko'rsatish",
  ],
  investigative: [
    "Ilmiy tajriba o'tkazish",
    'Murakkab matematik masalani yechish',
    'Kompyuter dasturidagi xatoni aniqlash (debugging)',
    'Tabiat hodisalarini tadqiq qilish',
    "Statistik ma'lumotlarni tahlil qilish",
    "Yangi nazariya yoki g'oyani sinab ko'rish",
    "Kimyoviy yoki fizik tajriba o'tkazish",
    'Ilmiy maqolalarni tanqidiy tahlil qilish',
    "Sun'iy intellekt yoki algoritmlar haqida o'rganish",
    'Tadqiqot natijalarini konferensiyada taqdim etish',
  ],
  artistic: [
    'Rasm chizish yoki haykal yasash',
    "Qo'shiq yozish yoki musiqa bastalash",
    'Spektakl yoki badiiy film sahnalashtirish',
    "She'r yoki hikoya yozish",
    'Interyer yoki moda dizaynini yaratish',
    'Fotosurat yoki video badiiy asar yaratish',
    'Cholgʻu asbobida ijro etish',
    "Raqs qo'yish yoki xoreografiya yaratish",
    "Reklama yoki brend uchun kreativ g'oya taklif qilish",
    'Grafik dizayn yoki animatsiya yaratish',
  ],
  social: [
    'Kichik bolalarga dars berish',
    "Kasallarga yoki keksalarga g'amxo'rlik qilish",
    "Ijtimoiy loyihada ko'ngilli bo'lish",
    "Do'stlarga shaxsiy muammolarida maslahat berish",
    'Guruh mashgʻulotini tashkil qilish va boshqarish',
    'Nogironligi boʻlgan insonlarga yordam berish',
    'Jamoat tashkilotida faoliyat yuritish',
    "Yangi kelgan xodim yoki o'quvchiga moslashishda yordam berish",
    'Nizolarni hal qilishda vositachilik qilish',
    "Sog'liqni saqlash sohasida bemorlar bilan ishlash",
  ],
  enterprising: [
    'Kichik biznes yoki startap ochish',
    'Jamoa loyihasiga rahbarlik qilish',
    'Mahsulot yoki xizmatni sotish',
    "Ijtimoiy yoki targ'ibot kampaniyasini boshqarish",
    'Yangi mijoz yoki hamkorlar bilan muzokara olib borish',
    'Kompaniya yoki loyiha strategiyasini ishlab chiqish',
    'Jamoaviy tadbirni tashkillashtirish',
    'Investorlarni loyihaga jalb qilish',
    "Raqobatchilardan ustun bo'lish uchun reja tuzish",
    'Guruhni umumiy maqsad sari yetaklash',
  ],
  conventional: [
    'Moliyaviy hisobotlarni tayyorlash',
    "Ma'lumotlar bazasini tartibga solish",
    'Ofis hujjatlarini boshqarish',
    'Byudjet rejasini tuzish',
    'Elektron jadvallarda hisob-kitob yuritish',
    'Arxiv yoki fayllarni tizimlashtirish',
    "Aniq ko'rsatmalarga rioya qilib ishlash",
    'Ombor yoki inventarizatsiya hisobini yuritish',
    "Standart protsedura bo'yicha hujjat tayyorlash",
    'Vaqt jadvalini tuzish va nazorat qilish',
  ],
};

const RIASEC_ORDER: RiasecCategoryKey[] = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];

export const RIASEC_ITEMS: RiasecItem[] = RIASEC_ORDER.flatMap((category, blockIndex) =>
  RIASEC_TEXTS[category].map((text, i) => ({ number: blockIndex * 10 + i + 1, text, category }))
);

export interface RiasecResultRow {
  key: RiasecCategoryKey;
  letter: string;
  label: string;
  careers: string[];
  score: number;
}

export interface RiasecResult {
  ranked: RiasecResultRow[];
  hollandCode: string;
}

export function scoreRiasec(answers: Record<number, number>): RiasecResult {
  const scores: Record<RiasecCategoryKey, number> = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  RIASEC_ITEMS.forEach((item) => {
    const value = answers[item.number];
    if (typeof value === 'number' && value >= 1 && value <= 5) {
      scores[item.category] += value;
    }
  });

  const ranked = RIASEC_ORDER.map((key) => ({
    key,
    letter: RIASEC_CATEGORY_INFO[key].letter,
    label: RIASEC_CATEGORY_INFO[key].label,
    careers: RIASEC_CATEGORY_INFO[key].careers,
    score: scores[key],
  })).sort((a, b) => b.score - a.score);

  const hollandCode = ranked.slice(0, 3).map((r) => r.letter).join('-');

  return { ranked, hollandCode };
}

// ---------------------------------------------------------------------------
// 11-sinf: Career Maturity Inventory (Crites)
// ---------------------------------------------------------------------------

export type CmiBlockKey = 'decisiveness' | 'confidence' | 'independence' | 'involvement' | 'compromise';

export interface CmiStatement {
  number: number;
  text: string;
  block: CmiBlockKey;
  // Which answer ('true' i.e. To'g'ri, or 'false' i.e. Noto'g'ri) earns the point for this item.
  keyedAnswer: 'true' | 'false';
}

export const CMI_BLOCK_INFO: Record<CmiBlockKey, { label: string }> = {
  decisiveness: { label: "Qat'iylik" },
  confidence: { label: 'Ishonch' },
  independence: { label: 'Mustaqillik' },
  involvement: { label: 'Jarayonga qiziqish' },
  compromise: { label: 'Moslashuvchanlik' },
};

const CMI_TEXTS: Record<CmiBlockKey, string[]> = {
  decisiveness: [
    'Men kelajakda qanday kasb tanlashni allaqachon aniq bilaman.',
    "Ko'plab turli kasblar meni bir xilda qiziqtiradi, shuning uchun birini tanlay olmayapman.",
    'Kasb tanlashni oxirgi kunlargacha qoldiraman.',
    "Bitta aniq yo'nalishni tanlab, unga intilib harakat qilyapman.",
    "Kasb haqida o'ylagan sari fikrim tez-tez o'zgarib turadi.",
    "Kelajakdagi kasbim haqida qat'iy qarorga kelganman.",
    'Kasb tanlash masalasi meni doimo tashvishga solib, qaror qabul qila olmayman.',
    "O'zim uchun aniq bitta yo'nalishni belgilab oldim.",
    'Kasb tanlashni "keyinroq hal qilaman" deb qoʻyib yuboraman.',
    "Maqsadim aniq va men unga qat'iy amal qilaman.",
  ],
  confidence: [
    'Tanlagan kasbim menga mos kelishiga ishonaman.',
    "Tanlovim to'g'ri emasligidan qo'rqaman.",
    "Qobiliyatlarim tanlagan yo'nalishim uchun yetarli deb hisoblayman.",
    'Agar boshqalar tanlovimni tanqid qilsa, ishonchim yoʻqoladi.',
    "O'z kuchimga — tanlagan kasbimni muvaffaqiyatli egallashimga ishonch bilan qarayman.",
    "Tanlagan kasbim to'g'ri emasligi haqida ko'p o'ylayman.",
    'Kelajakda tanlagan sohamda yaxshi natijalarga erisha olishimga aminman.',
    "O'z tanlovimga hali ham to'liq ishonmayman.",
    "Qiyinchiliklarga qaramay, tanlagan yo'lim to'g'ri ekanligiga ishonaman.",
    'Boshqalar meni yoʻldan urishi mumkinligidan doim xavotirdaman.',
  ],
  independence: [
    'Kasb tanlashda oʻz fikrim va qiziqishlarimga tayanaman.',
    'Ota-onam yoki doʻstlarim aytgan kasbni tanlashim kerak deb oʻylayman.',
    "Qaror qabul qilishdan oldin ko'p odamning fikriga qarab ish tutaman.",
    "Kasb tanlash — mening shaxsiy qarorim, hatto boshqalar rozi bo'lmasa ham.",
    "Oilamning kutganidek kasb tanlamasam, o'zimni aybdor his qilaman.",
    "O'z tanlovim uchun mas'uliyatni o'z zimmamga olaman.",
    "Do'stlarim qaysi yo'nalishni tanlasa, men ham o'shani tanlashga moyilman.",
    "Kasb tanlashda birinchi navbatda o'zimning manfaatlarimni o'ylayman.",
    'Kattalarning roziligisiz muhim qaror qabul qila olmayman.',
    'Meni hech kim ishontira olmaydi — oʻz yoʻlimni oʻzim tanlayman.',
  ],
  involvement: [
    "Turli kasblar haqida faol ma'lumot to'playman.",
    'Kasb tanlash haqida hozircha oʻylashni istamayman.',
    'Kasblar bilan tanishish uchun tadbir yoki ustaxonalarga qatnashaman.',
    "Bu masala hali erta, kattaroq bo'lganimda o'ylab ko'raman deb hisoblayman.",
    "Mutaxassislar bilan suhbatlashib, ularning tajribasidan o'rganaman.",
    'Kasb tanlash mavzusi meni unchalik qiziqtirmaydi.',
    "O'zimning qobiliyat va qiziqishlarimni bilish uchun testlardan o'taman.",
    'Bu haqda oʻylash meni charchatadi, shuning uchun chetlab oʻtaman.',
    "Turli OTM va kasb-hunar yo'nalishlari haqida tadqiqot olib boraman.",
    'Kasb tanlash jarayoni bilan faol shugʻullanaman.',
  ],
  compromise: [
    "Orzu qilgan kasbim imkoniyatlarimga mos kelmasa, muqobil variantlarni ko'rib chiqaman.",
    'Faqat orzuimdagi bitta kasbdan boshqasini koʻz oldimga keltira olmayman.',
    "Qiziqishlarim bilan real imkoniyatlarim o'rtasida muvozanat topishga harakat qilaman.",
    "Agar birinchi tanlovim amalga oshmasa, bu butun kelajagim barbod bo'lishini anglatadi deb o'ylayman.",
    "Turli omillarni (bozor talabi, o'z qobiliyatim, xarajatlar) hisobga olib qaror qabul qilaman.",
    "Faqat mashhur yoki obro'li kasblarni tanlashni to'g'ri deb bilaman.",
    "Agar kerak bo'lsa, dastlabki rejamni o'zgartirishga tayyorman.",
    "Boshqalar nima deyishidan qat'iy nazar, faqat bitta kasbni xohlayman.",
    'Real sharoitlarni hisobga olib, moslashuvchan reja tuzaman.',
    "Sharoit o'zgarsa ham, rejalarimni moslashtira olaman.",
  ],
};

const CMI_KEYED_TRUE_NUMBERS = new Set([
  1, 4, 6, 8, 10,
  11, 13, 15, 17, 19,
  21, 24, 26, 28, 30,
  31, 33, 35, 37, 39, 40,
  41, 43, 45, 47, 49, 50,
]);

const CMI_ORDER: CmiBlockKey[] = ['decisiveness', 'confidence', 'independence', 'involvement', 'compromise'];

export const CMI_STATEMENTS: CmiStatement[] = CMI_ORDER.flatMap((block, blockIndex) =>
  CMI_TEXTS[block].map((text, i) => {
    const number = blockIndex * 10 + i + 1;
    return { number, text, block, keyedAnswer: CMI_KEYED_TRUE_NUMBERS.has(number) ? 'true' : 'false' } as CmiStatement;
  })
);

export interface CmiBlockScore {
  key: CmiBlockKey;
  label: string;
  score: number;
}

export interface CmiResult {
  blocks: CmiBlockScore[];
  total: number;
  level: 'high' | 'medium' | 'low';
  levelLabel: string;
}

export function scoreCmi(answers: Record<number, boolean>): CmiResult {
  const scores: Record<CmiBlockKey, number> = {
    decisiveness: 0,
    confidence: 0,
    independence: 0,
    involvement: 0,
    compromise: 0,
  };

  CMI_STATEMENTS.forEach((statement) => {
    const answer = answers[statement.number];
    if (answer === undefined) return;
    const answeredAs = answer ? 'true' : 'false';
    if (answeredAs === statement.keyedAnswer) {
      scores[statement.block] += 1;
    }
  });

  const blocks = CMI_ORDER.map((key) => ({ key, label: CMI_BLOCK_INFO[key].label, score: scores[key] }));
  const total = blocks.reduce((sum, b) => sum + b.score, 0);

  let level: CmiResult['level'] = 'low';
  let levelLabel = "Past daraja: chuqurroq individual ishlash tavsiya etiladi";
  if (total >= 40) {
    level = 'high';
    levelLabel = 'Yuqori kasbiy yetuklik: kasb tanlashga yaxshi tayyor';
  } else if (total >= 25) {
    level = 'medium';
    levelLabel = "O'rtacha daraja: ba'zi bloklarda qo'shimcha maslahat tavsiya etiladi";
  }

  return { blocks, total, level, levelLabel };
}
