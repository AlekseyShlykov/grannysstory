import type { MilestoneDefinition } from "../historical/milestoneSchema";
import { historicalVoice, speakableSentence } from "./historicalVoice";

// How verified history becomes her speech. The fact is the verified record (layer A); the life it is told
// from is fiction (layer B); these phrases are her voice (layer C). A passage moves from how she perceived
// it, through the fact, to what changed in ordinary days, and back to her own story. It never recites a title:
// a record without a speakable sentence and without hand-written voice is not spoken at all.

export interface NarrationContext {
  /** Her age in the year the event reached her. */
  age: number;
  /** False when the event needed her presence in a place where this biography says she was not. */
  wasPresent: boolean;
  /** Her residence was under military occupation then (registry fact, not a personal claim). */
  placeOccupied?: boolean;
  runSeed: string;
  /** Position among the historical passages of this life; keeps phrases from repeating. */
  order: number;
}

/** Per-run permutation: distinct `order` values never repeat while order < pool size. */
function pickInOrder<T>(pool: readonly T[], seed: string, order: number): T {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  const indexes = pool.map((_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    const swap = hash % (index + 1);
    [indexes[index], indexes[swap]] = [indexes[swap]!, indexes[index]!];
  }
  return pool[indexes[((order % pool.length) + pool.length) % pool.length]!]!;
}

const MONTHS = "января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря";
const MONTHS_IN = "январе|феврале|марте|апреле|мае|июне|июле|августе|сентябре|октябре|ноябре|декабре";

/**
 * Speech, not a reference book: a leading date and the forms «в 1961 году», «в мае 1945 года» give way to
 * «тогда», since the question has already named the years. Anything else with numbers (ranges, «в ночь на
 * 7 июля», counts) cannot be rephrased safely, so the sentence is not spoken (null).
 */
export function softenDates(sentence: string): string | null {
  const leadingDay = new RegExp(`^(?:[Сс]\\s)?\\d{1,2}(?:\\s\\(\\d{1,2}\\))?\\s(?:${MONTHS})(?:\\s\\d{4}(?:\\sгода)?)?,?\\s`);
  const monthYear = new RegExp(`(^|\\s)[Вв]\\s(?:${MONTHS_IN})\\s\\d{4}\\sгода`, "g");
  let text = sentence
    .replace(leadingDay, "")
    .replace(/^\d{4}(?:\sгода)?,?\s/, "")
    .replace(monthYear, "$1тогда")
    .replace(/(^|\s)[Вв]\s\d{4}\sгоду/g, "$1тогда")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/^,\s*/, "")
    .trim();
  if (!text || /\d/.test(text) || text.split(/\s+/).length < 3) return null;
  text = text.charAt(0).toLocaleUpperCase("ru") + text.slice(1);
  return text.replaceAll("тогда, тогда", "тогда").replaceAll("Тогда тогда", "Тогда").replaceAll("тогда тогда", "тогда");
}

/**
 * Several country packs abbreviate years («В 1900 г.», «В 1965–1966 гг.», «в 1950-е гг.»); the period of the
 * abbreviation would otherwise end the sentence. Expanded to words, the dates can then be softened as usual.
 */
export function expandYearAbbreviations(text: string): string {
  return text
    .replace(/(^|[\s(])([Вв]\s(?:\d{4}(?:[–-]\d{4})?))\sгг\./g, "$1$2 годах")
    .replace(/(^|[\s(])([Вв]\s\d{4})\sг\./g, "$1$2 году")
    .replace(/(^|\s)(?:[Вв]\s)?\d{4}-е(?:\sгг\.|\sгоды)?/g, "$1в те годы")
    .replace(/(\d{4})\sгг\./g, "$1 годов")
    .replace(/(\d{4})\sг\./g, "$1 года");
}

/** The verified fact as she can say it, or null: then the record stays in the atlas and is not spoken. */
export function spokenFactSentence(summary: string): string | null {
  const sentence = speakableSentence(expandYearAbbreviations(summary));
  // «ныне» is reference-book Russian; she says «сейчас».
  return sentence ? softenDates(sentence.replace(/(^|\s)ныне(?=\s)/g, "$1сейчас")) : null;
}

// How she places herself next to a fact. `lead` takes the fact as its own clause («…, что тогда открылся
// трамвай»), so it is used only when the fact can be lowercased safely; `after` follows the stated fact and
// refers back to it. A reaction never comes before the listener knows what it is about.
interface Perspective {
  lead: string[];
  after: string[];
}

const perspective: Record<"heard" | "child" | "adult" | "elderly" | "away", Perspective> = {
  heard: {
    lead: [
      "Мне потом рассказывали, что",
      "Мама моя потом не раз вспоминала, что",
      "Сама я этого помнить не могу, но взрослые потом говорили, что"
    ],
    after: [
      "Сама я этого не помню, знаю по рассказам.",
      "Это я знаю уже со слов взрослых.",
      "Мама моя потом не раз к этому возвращалась."
    ]
  },
  child: {
    lead: [
      "Я помню, взрослые за ужином говорили, что",
      "Я слышала, как старшие вполголоса обсуждали, что"
    ],
    after: [
      "Я была ещё девчонкой и понимала не всё, но взрослые говорили об этом за ужином.",
      "Я слушала, как об этом говорят старшие, и делала вид, что понимаю.",
      "Я помню, как взрослые читали об этом в газетах и спорили."
    ]
  },
  adult: {
    lead: [],
    after: [
      "У нас тогда только об этом и говорили.",
      "Об этом говорили у нас и на работе, и в очередях.",
      "Я узнала об этом, как все, из газет и от соседей.",
      "Мимо этого и мы не прошли, хоть и жили своими делами.",
      "Об этом тогда спорили в каждом доме, и у нас тоже.",
      "Это было при мне, я это помню без всяких книжек."
    ]
  },
  elderly: {
    lead: [],
    after: [
      "В моём возрасте новости уже не так пугают, а это я запомнила.",
      "Я была уже немолодая и на многое смотрела спокойнее, а это задело.",
      "Казалось бы, чем меня в мои годы удивишь, а вот удивили."
    ]
  },
  away: {
    lead: ["Меня там тогда не было, но все знали, что"],
    after: [
      "Меня там тогда не было, но знали об этом все.",
      "Я жила далеко от тех мест, но новости доходили и до нас."
    ]
  }
};

// First words after which a fact reads naturally inside «…, что»: prepositions and adverbs, or a verb or
// participle followed by a lowercase word («Открылся новый…», «Подписан договор…»). A name stays capitalised,
// so «Юрий Гагарин…» or «Калинин…» is never embedded.
const embeddableStarts = new Set([
  "тогда", "в", "во", "на", "после", "из", "когда", "при", "с", "со", "по", "у", "для", "за", "под", "над",
  "через", "к", "от", "до", "о", "об", "это", "все", "многие", "полностью", "официально", "впервые"
]);
const VERB_ENDING = /(?:лся|лась|лось|лись|ла|ло|ли|ал|ил|ел|ыл|ан|ана|ано|аны|ен|ена|ено|ены|ыт|ыта|ыто|ыты|ит|ита|ито|иты)$/;

/** The fact lowercased to follow «…, что», or null when its first word may be a name. */
export function embeddableFact(fact: string): string | null {
  const [first = "", second = ""] = fact.split(/[\s,]+/);
  const word = first.toLocaleLowerCase("ru");
  const safe = embeddableStarts.has(word) || (VERB_ENDING.test(word) && /^[а-яё]/.test(second));
  return safe ? word + fact.slice(first.length) : null;
}

/** The fact with her relation to it: embedded after a lead, or stated first with her reaction after it. */
function tellFact(fact: string, pool: Perspective, seed: string, order: number): string {
  const embedded = embeddableFact(fact);
  const choices = [...(embedded ? pool.lead.map((lead) => `${lead} ${embedded}`) : []), ...pool.after.map((after) => `${fact} ${after}`)];
  return pickInOrder(choices, seed, order);
}

/** What became different in ordinary days, by kind of record; deliberately general, it adds no new facts. */
const changeByCategory: Record<string, string[]> = {
  economic_crisis: [
    "Деньги вдруг стали считать дважды, а разговоры за столом сделались короче.",
    "Многие тогда впервые всерьёз испугались за завтрашний день."
  ],
  local_economy: ["Для многих семей это значило другую работу или другой распорядок дня."],
  labor: [
    "На работе потом ещё долго обсуждали, что теперь можно, а что нельзя.",
    "Для тех, кто работал, это быстро стало заметно в обычной неделе."
  ],
  political_change: [
    "Жизнь вроде шла как раньше, но слова вокруг стали другими.",
    "Люди стали осторожнее говорить, или, наоборот, смелее, смотря кто."
  ],
  war_conflict: ["После этого ещё долго в каждом доме считали, кого ждут и кого уже не ждут."],
  occupation: ["Говорили об этом тихо и не при всех."],
  public_health: ["Все стали осторожнее, мыли руки, сидели по домам, если могли."],
  healthcare: ["Для стариков и больных это была перемена, которую чувствовали сразу."],
  consumer_life: [
    "Поменялось то, что лежит в кошельке и на прилавке, а к этому привыкаешь дольше всего.",
    "Хозяйки ещё долго пересчитывали в уме старые цены."
  ],
  media_communication: ["Вечера после этого понемногу стали другими."],
  technology: ["Казалось, мир чуть-чуть сдвинулся, и мы вместе с ним."],
  housing_urban: ["Город от этого понемногу менялся, и мы вместе с ним, хоть и не сразу это замечали."],
  social_policy: ["Кому-то это облегчило жизнь, а кто-то и не заметил."],
  migration: ["Люди тогда трогались с мест, и знакомых вокруг становилось то больше, то меньше."],
  education: ["Для детей и их родителей это меняло многое."],
  culture_leisure: ["Об этом потом вспоминали с удовольствием."],
  sport: ["Радовались все, даже те, кто сроду не смотрел спорт."],
  infrastructure_transport: ["К таким переменам в городе привыкаешь быстрее, чем ожидаешь, а потом не помнишь, как было раньше."],
  disaster: ["Потом ещё долго вспоминали, кто где был в те дни."],
  women_rights: ["Для женщин это было не пустое слово, хотя на кухне ничего сразу не поменялось."],
  family_law: ["Касалось это каждой семьи, хоть и не каждая об этом говорила."],
  environment: ["Даже воздух, казалось, стал другим, или нам так хотелось."],
  religion: ["Кому-то это было важно, кому-то нет, но говорили все."],
  everyday_life: ["Такие вещи меняют жизнь незаметно, а потом не помнишь, как было раньше."],
  border_administrative: ["На бумаге поменялось многое, а в жизни не сразу."]
};

const ties = [
  "Но жизнь, конечно, шла не только по газетам.",
  "Большое и маленькое тогда так и шло рядом.",
  "А свои заботы от этого никуда не девались.",
  "Вот так оно всё и перемешивалось, общее и своё.",
  "Это я к тому, что время было такое, а жили мы всё равно каждый своей жизнью."
];

function perspectiveFor(ctx: NarrationContext): keyof typeof perspective {
  return !ctx.wasPresent ? "away"
    : ctx.age < 6 ? "heard"
    : ctx.age < 14 ? "child"
    : ctx.age >= 65 ? "elderly"
    : "adult";
}

function changeFor(category: string | undefined, ctx: NarrationContext): string | null {
  const pool = category ? changeByCategory[category] : undefined;
  return pool ? pickInOrder(pool, `${ctx.runSeed}:change:${category}`, ctx.order) : null;
}

/** An essential milestone: hand-written lines, optionally with the occupation of her place and a change. */
export function narrateMilestone(definition: MilestoneDefinition, ctx: NarrationContext): string {
  const voice = definition.voice;
  const main = ctx.age < 6 ? voice.heard : ctx.age < 16 ? voice.young : voice.lived;
  return [main, ctx.placeOccupied && ctx.age >= 6 ? voice.occupied : null, voice.change].filter(Boolean).join(" ");
}

export interface NarratableRecord {
  eventId: string;
  summary: string;
  category?: string;
}

/**
 * A record that is not a milestone: legacy hand-written voice when it exists, otherwise perspective + fact +
 * change + tie. Null when the record has no sentence she could say; the caller then says nothing about it.
 */
export function narrateRecord(record: NarratableRecord, ctx: NarrationContext): string | null {
  const voice = historicalVoice[record.eventId];
  if (voice) {
    // Hand-written lines are complete passages; a generic line after them could contradict their detail.
    return !ctx.wasPresent && voice.away ? voice.away : ctx.age < 6 ? voice.heard : voice.lived;
  }
  const fact = spokenFactSentence(record.summary);
  if (!fact) return null;
  const kind = perspectiveFor(ctx);
  return [tellFact(fact, perspective[kind], `${ctx.runSeed}:perspective:${kind}`, ctx.order), changeFor(record.category, ctx), pickInOrder(ties, `${ctx.runSeed}:tie`, ctx.order)].filter(Boolean).join(" ");
}

const framing: Record<"young" | "adult", Perspective> = {
  young: {
    lead: [
      "Взрослые тогда часто говорили о том, что",
      "Дома тогда разговоры всё время возвращались к тому, что"
    ],
    after: [
      "Я ещё мало что понимала, но слышала, как об этом говорят старшие.",
      "Взрослые тогда часто об этом говорили."
    ]
  },
  adult: {
    lead: [],
    after: [
      "Вокруг как раз многое менялось.",
      "Время было такое, что всё сдвигалось.",
      "Так что решать пришлось не в пустоте."
    ]
  }
};

/**
 * The verified circumstance she mentions just before a turning point («тогда же», never «поэтому»). Silent
 * when the record has no sentence she could say: a title or a statistic is atlas material, not speech.
 */
export function narrateFraming(age: number, summary: string, runSeed: string): string | null {
  const fact = spokenFactSentence(summary);
  if (!fact) return null;
  return tellFact(fact, age < 16 ? framing.young : framing.adult, `${runSeed}:framing`, 0);
}

/** The single prompt that lets the player stay with a milestone a little longer. */
export const milestoneFollowUpQuestion = "А как это было у вас, расскажи?";
