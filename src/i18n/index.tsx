import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { spokenFactSentence } from "../../content/scenes/historicalNarration";
import generatedCatalog from "./en.generated.json";
import worldCatalog from "./en.world.generated.json";

export type Locale = "ru" | "en";

interface TranslationPattern {
  source: string;
  target: string;
}

interface GeneratedCatalog {
  exact: Record<string, string>;
  patterns: TranslationPattern[];
}

// Countries added in world-1.2 carry English next to the Russian: the export writes it to en.world.generated.json,
// and hand-written content for those countries (names, regional texts, milestones, work) lives in en/<country>.json.
// The reviewed full catalog wins where both translate the same string.
const contentCatalogs = import.meta.glob<{ exact: Record<string, string> }>("./en/*.json", { eager: true, import: "default" });
const catalog: GeneratedCatalog = {
  exact: Object.assign(
    {},
    ...Object.keys(contentCatalogs).sort().map((file) => contentCatalogs[file]!.exact),
    (worldCatalog as { exact: Record<string, string> }).exact,
    (generatedCatalog as GeneratedCatalog).exact
  ),
  patterns: (generatedCatalog as GeneratedCatalog).patterns
};
const STORAGE_KEY = "babushka.locale";
const russianText = /[А-Яа-яЁё]/u;

const overrides: Record<string, string> = {
  "История бабушки": "Granny's Story",
  "Другая история": "Another story",
  "К содержанию": "Skip to content",
  "Выключить звук": "Turn sound off",
  "Включить звук": "Turn sound on",
  "Написать Алексу Шлыкову": "Email Alex Shlykov",
  "Посмотрите на историю глазами простых людей. Каждая история генерируется случайным образом. Исторический фон и события опираются на архивные данные и воспоминания людей.": "See history through the eyes of ordinary people. Every story is generated at random. Its historical background and events are grounded in archival records and people's memories.",
  "Выберите место и год рождения или доверьте выбор случаю.": "Choose a birthplace and year of birth, or leave both to chance.",
  "Продолжить разговор": "Continue the conversation",
  "Где она родилась?": "Where was she born?",
  "В каком году?": "What year?",
  "Другие места": "Other places",
  "Начать с выбранными данными": "Start with these details",
  "Случайная история": "Random story",
  "Загружаем местный пакет…": "Loading local history…",
  "Не удалось начать историю.": "The story could not be started.",
  "Для случайной истории пока нет доступных данных.": "There is not enough data for a random story yet.",
  "История создается на основании архивов": "This story is created from archival sources",
  "Архивы и официальные источники": "Archives and official sources",
  "страна не указана": "country not specified",
  "Последний вопрос и ответ": "Latest question and answer",
  "Что спросить": "What to ask",
  "Сейчас, только очки найду…": "Just a moment, let me find my glasses…",
  "Самое сильное воспоминание бабушки": "Granny's strongest memory",
  "Вы можете помочь и улучшить эту игру. Если какое-то событие вам сильно запомнилось, поставьте палец вверх, а если какое-то показалось лишним, поставьте палец вниз.": "You can help improve this game. Give a thumbs-up to an event that stayed with you, or a thumbs-down to one that felt unnecessary.",
  "Хронология": "Timeline",
  "Исторический контекст": "Historical context",
  "Личная жизнь": "Personal life",
  "рождение": "birth",
  "Её город в это время был под оккупацией.": "Her city was under occupation at the time.",
  "Об этом она сегодня не рассказывала.": "She did not speak about this today.",
  "Источник": "Source",
  "Спустя годы": "Years later",
  "Тогда же": "At the same time",
  "Понравилось": "Relevant",
  "Не понравилось": "Not relevant",
  "Другие мои игры": "My other games",
  "Подписаться на мои обновления": "Subscribe to my updates",
  "Поделиться игрой": "Share the game",
  "Послушать другую жизнь": "Listen to another life",
  "ссылка на игру добавлена в буфер обмена.": "The game link has been copied to the clipboard.",
  "Не удалось скопировать ссылку.": "The link could not be copied.",
  "Если хотите оставить фидбек или обратить внимание на неточность, пишите мне на": "If you would like to leave feedback or point out an inaccuracy, email me at",
  "Посмотреть жизнь снова": "Replay this life",
  "Пауза": "Pause",
  "Скорость": "Speed",
  "Скорость воспроизведения": "Playback speed",
  "Другой вариант": "Other possibility",
  "Разговор завершился": "The conversation ended",
  "Как могла повернуть жизнь": "The paths this life might have taken",
  "Выбранная жизнь": "Chosen life",
  "Другая возможность": "Another possibility",
  "Дерево всех возможных дорог жизни": "All possible paths through this life",
  "Начало этой сгенерированной жизни.": "The beginning of this generated life.",
  "Рождение": "Birth",
  "Детей у меня не было": "I had no children",
  "Биологических детей у меня не было": "I had no biological children",
  "Твою маму я удочерила": "I adopted your mum",
  "Твоего папу я усыновила": "I adopted your dad",
  "Твоего родителя я усыновила или удочерила": "I adopted your parent",
  "новый город": "the new city",
  "ту жизнь, которая у меня потом получилась": "the life I made for myself afterwards",
  "что-нибудь вроде того, о чём я тебе рассказывала, совсем обычное": "something like that thing I told you about, something perfectly ordinary",
  "какой-нибудь совсем обычный вторник": "some perfectly ordinary Tuesday",
  "Это всё и есть брак, по-моему, а не ошибка.": "That's what a marriage is, if you ask me, not a mistake.",
  "Теперь его нет, и я спорю с ним молча, по старой памяти.": "Now he's gone, and I still argue with him in my head, out of old habit.",
  "Сто лет, подумать только.": "A hundred years, just think of it.",
  "Работала я много, и мне это нравилось, врать не буду. Только когда дочь была маленькой, я часто приходила, когда она уже спала. Утром одно, вечером одно. Вот этих вечеров жалко. Работа без меня бы обошлась, а вечера без меня обошлись.": "I worked a lot, and I liked it, I won't lie. Only when my daughter was little, I'd often come home after she was already asleep. One thing in the morning, one thing at night. Those evenings are what I'm sorry about. The work would have managed without me, but the evenings did manage without me.",
  "Работала я много, и мне это нравилось, врать не буду. Только когда сын был маленьким, я часто приходила, когда он уже спал. Утром одно, вечером одно. Вот этих вечеров жалко. Работа без меня бы обошлась, а вечера без меня обошлись.": "I worked a lot, and I liked it, I won't lie. Only when my son was little, I'd often come home after he was already asleep. One thing in the morning, one thing at night. Those evenings are what I'm sorry about. The work would have managed without me, but the evenings did manage without me.",
  "удочерила твою маму": "adopted your mother",
  "усыновила твоего папу": "adopted your father",
  "мама твоей мамы": "your mother's mother",
  "мама твоего папы": "your father's mother",
  "твою маму она удочерила": "she adopted your mother",
  "твоего папу она усыновила": "she adopted your father",
  "ась дочь, твоя мама": "a daughter, your mother",
  "ся сын, твой папа": "a son, your father",
  "сестра": "sister",
  "брат": "brother",
  "двоюродная сестра": "cousin",
  "двоюродный брат": "cousin",
  "твоя бабушка": "your grandmother",
  "твой дедушка": "your grandfather",
  "твоей бабушки": "your grandmother",
  "твоего дедушки": "your grandfather",
  // Memory placeholders filled in src/engine/memory/atlas.ts ({lostParent}, {sibling}, {child} …).
  "мама": "mum",
  "папа": "dad",
  "мамы": "mum",
  "папы": "dad",
  "сестру": "sister",
  "брата": "brother",
  "дочь": "daughter",
  "сын": "son",
  "сына": "son"
};

const embeddedHistoricalLeads: Array<[string, string]> = [
  ["Мне потом рассказывали, что", "I was told later that"],
  ["Мама моя потом не раз вспоминала, что", "Mum often recalled later that"],
  ["Сама я этого помнить не могу, но взрослые потом говорили, что", "I can't remember it myself, but the grown-ups said later that"],
  ["Я помню, взрослые за ужином говорили, что", "I remember the grown-ups saying over supper that"],
  ["Я слышала, как старшие вполголоса обсуждали, что", "I overheard the grown-ups saying under their breath that"],
  ["Меня там тогда не было, но все знали, что", "I wasn't there, but everyone knew that"],
  ["Взрослые тогда часто говорили о том, что", "The grown-ups often said back then that"],
  ["Дома тогда разговоры всё время возвращались к тому, что", "At home the talk kept coming back to the fact that"]
];

// First words that may be lower-cased when a translated sentence is spliced after a lead-in.
const commonSentenceStarts = new Set([
  "A", "An", "The", "In", "On", "At", "By", "For", "From", "During", "After", "Before", "Since", "Until", "With",
  "This", "That", "These", "Those", "There", "It", "Its", "Many", "Most", "Some", "All", "Every", "Each", "Over",
  "Under", "About", "Around", "Almost", "Nearly", "More", "Several", "Thousands", "Hundreds", "Women", "Men",
  "People", "Workers", "Children", "Families", "Residents", "Prices", "Food", "Bread", "Two", "Three", "Four",
  "Five", "One", "Ten", "Half", "Then", "Now", "Here", "When", "While", "As", "New", "Local", "Free", "Mass"
]);

const manualPatterns: TranslationPattern[] = [
  // Birth statements (content/scenes/birthVoice.ts); `where` already carries its preposition.
  { source: "Родилась я в {{0}} году, {{1}}. Это я точно знаю, так в паспорте записано.", target: "I was born {{1}}, in {{0}}. That much I know for certain, it's in my passport." },
  { source: "Родилась {{0}}, в {{1}} году.", target: "I was born {{0}}, in {{1}}." },
  { source: "{{0}}, в {{1}} году. Мама говорила, что в тот день мела метель, а отец уверял, что шёл дождь. Так они и не договорились.", target: "{{0}}, in {{1}}. Mum said there was a snowstorm that day, and Dad swore it was raining. They never did agree." },
  { source: "Мама всегда говорила: родилась ты в {{0}} году, {{1}}, под утро, когда все спали. Будто я с самого начала старалась никого не беспокоить.", target: "Mum always said: you were born {{1}}, in {{0}}, just before dawn, while everyone was asleep. As if I'd been trying not to bother anyone from the very start." },
  { source: "По метрике в {{0}} году, {{1}}. Отец, правда, уверял, что записали на несколько дней позже.", target: "According to my birth certificate, in {{0}}, {{1}}. Though Dad always insisted they registered me a few days late." },
  { source: "В {{0}} году, {{1}}. Больше про тот день я толком ничего не знаю, а выдумывать не стану.", target: "In {{0}}, {{1}}. I don't really know anything else about that day, and I'm not going to make it up." },
  { source: "Бабушка моя рассказывала, что родилась я {{0}}, в {{1}} году, и кричала так, что соседи стучали в стену.", target: "My grandmother used to say I was born {{0}}, in {{1}}, and screamed so loudly the neighbours banged on the wall." },
  { source: "{{0}}. В {{1}} году. Отец любил повторять, что я появилась в самый неподходящий момент, но говорил это всегда с улыбкой.", target: "{{0}}. In {{1}}. Dad liked to say I'd turned up at the worst possible moment, but he always said it with a smile." },
  { source: "{{0}} год, {{1}}. Так во всех бумагах и стоит, сколько я их ни заполняла за жизнь.", target: "{{0}}, {{1}}. That's what it says on every form, and I've filled in plenty of them in my life." },
  { source: "Родилась {{0}}, в {{1}} году. Старшие потом любили рассказывать, кто первым меня увидел, и каждый раз выходило по-разному.", target: "I was born {{0}}, in {{1}}. The grown-ups loved arguing later about who saw me first, and it came out differently every time." },
  { source: "Где-где, {{0}}. В {{1}} году. Ты будто анкету заполняешь.", target: "Well, {{0}}, where else. In {{1}}. You sound like you're filling in a form." },
  { source: "Мама говорила, что я родилась {{0}} в {{1}} году, в тот самый год, когда у нас наконец перестала течь крыша. Так у неё и считалось: крыша и я.", target: "Mum said I was born {{0}} in {{1}}, the very year our roof finally stopped leaking. That's how she counted it: the roof and me." },
  { source: "Она родилась в {{0}} году.", target: "She was born in {{0}}." },
  { source: "Родилась в городе {{0}}", target: "Born in {{0}}" },
  { source: "в городе {{0}}", target: "in {{0}}" },
  // Kinship (content/scenes/kinshipVoice.ts, src/engine/biography.ts).
  { source: "{{0}} Но в семье меня всегда звали бабушкой, и ты тоже.{{1}}", target: "{{0}} But in the family I was always Grandma, and to you as well.{{1}}" },
  { source: "Я сестра {{0}}.", target: "I'm {{0}}'s sister." },
  { source: "По документам, я сестра {{0}}.", target: "On paper, I'm {{0}}'s sister." },
  { source: "Я двоюродная сестра {{0}}, мы росли через два двора друг от друга. Для тебя я с самого начала была просто бабушкой.", target: "I'm {{0}}'s cousin, we grew up two yards apart. To you I was just Grandma from the very beginning." },
  { source: "Формально она сестра {{0}}. В семье её всегда звали бабушкой, и ты тоже.", target: "Formally, she is {{0}}'s sister. The family always called her Grandma, and so did you." },
  { source: "Она двоюродная сестра {{0}}. Для тебя она всегда была просто бабушкой.", target: "She is {{0}}'s cousin. To you, she was always simply Grandma." },
  { source: "{{0}}. {{1}}, а дальше были обычные семейные дни, хорошие и невозможные.", target: "{{0}}. {{1}}, and after that came ordinary family days, the good ones and the impossible ones." },
  { source: "Она {{0}} задолго до твоего рождения. Слово «приёмная» здесь объясняет родство, но не дистанцию.", target: "She {{0}} long before you were born. The word “adoptive” explains the kinship here, not the distance." },
  { source: "Она твоя родная бабушка, {{0}}, хотя близость между вами всё равно складывалась не автоматически.", target: "She is your grandmother by blood, {{0}}, though the closeness between you still did not come by itself." },
  { source: "У неё не было биологических детей; {{0}}.", target: "She had no biological children; {{0}}." },
  { source: "У неё родил{{0}}.", target: "She had {{0}}." },
  { source: "её {{0}}, {{1}}", target: "her {{0}}, {{1}}" },
  { source: "{{0}} Родство с игроком идёт по боковой ветви семьи и не создаёт ей вымышленных потомков.", target: "{{0}} She is related to the player through a side branch of the family, which gives her no invented descendants." },
  // Endings and reflections (src/engine/dialogue.ts, content/scenes/regretArchetypes.ts).
  { source: "Вот и дошли до {{0}} года. Давай лучше поставим чайник.", target: "And here we are, {{0}}. Let's put the kettle on instead." },
  { source: "Вот и дошли до {{0}} года.{{1}} Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.", target: "And here we are, {{0}}.{{1}} I'm still here, so don't turn my life into a finished book. Let's put the kettle on instead." },
  { source: "Про замужество меня всё спрашивают, будто там главный ответ. Мы ведь чуть не разошлись за неделю до свадьбы, ты знаешь. Жалею ли я, что всё-таки пошла? Слово не то. Были годы, когда я думала, что ошиблась, и годы, когда без него не представляла утра. {{0}}", target: "Everyone asks me about marriage, as if that's where the main answer is. We nearly split up a week before the wedding, you know. Do I regret going through with it? That's not the word. There were years when I thought I'd made a mistake, and years when I couldn't imagine a morning without him. {{0}}" },
  { source: "Я уехала из родного города, когда мне было чуть за двадцать, а мама осталась там. Я приезжала на праздники, писала, потом звонила. И вот это жалею: последние её годы я знаю больше по письмам, чем по её кухне. Но {{0}} я бы обратно не отдала. Как это вместе укладывается, не спрашивай, само укладывается.", target: "I left my home town when I was just past twenty, and Mum stayed there. I came back for the holidays, wrote, later phoned. And that's what I regret: I know her last years better from her letters than from her kitchen. But I wouldn't give back {{0}}. How the two fit together, don't ask, they just do." },
  { source: "Честно? Большого сожаления нет. Наверное, мне повезло, а может, просто память добрая. Ошибки были, и глупости, и обиды. Но если что и хочется прожить ещё раз, то не какой-то главный день, а {{0}}.", target: "Honestly? No big regret. Maybe I was lucky, or maybe my memory is just kind. There were mistakes, and foolishness, and grudges. But if there's anything I'd like to live through again, it isn't some big day, it's {{0}}." },
  { source: "{{0}} Хотя помню это смутно, может, что-то и досочинила.", target: "{{0}} Though I remember it only vaguely, I may have made some of it up." },
  // Life replay and path graph (src/app/LifeReplay.tsx, src/engine/lifePaths.ts, src/engine/work.ts).
  { source: "Уехала учиться {{0}}", target: "Left to study {{0}}" },
  { source: "Уехала с любимым человеком {{0}}", target: "Left with the person she loved to live {{0}}" },
  { source: "Начала жить {{0}}", target: "Began a new life {{0}}" },
  { source: "Работа: {{0}}", target: "Work: {{0}}" },
  { source: "Вы спросили: «{{0}}» Она ответила: «{{1}}» Позднее: {{2}}", target: "You asked: “{{0}}” She answered: “{{1}}” Later: {{2}}" },
  { source: "Возможная другая жизнь. Вопрос: «{{0}}» Возможный ответ: «{{1}}» Позднее: {{2}}", target: "A possible other life. Question: “{{0}}” Possible answer: “{{1}}” Later: {{2}}" },
  { source: "Эта дорога стала недоступна. {{0}}", target: "This path was closed off. {{0}}" },
  { source: "{{0}} проверенных местных записей; вступление и бытовые воспоминания вычитаны для этой локации.", target: "{{0}} verified local records; the introduction and everyday memories have been proofread for this place." }
];

function normalize(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function cleanEnglish(value: string): string {
  return value
    .replace(/Łód[А-Яа-яЁё]+/gu, "Łódź")
    .replace(/^Łód в$/u, "in Łódź");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function sentences(value: string): string[] {
  // A sentence ends at . ! ? … (optionally followed by closing quotes) before whitespace, so decimals like 8.62
  // stay whole; a single capital before the period is an initial or "U.S.", not a sentence end.
  return value.split(/(?<!(?:^|[\s.])[A-ZА-ЯЁ][.])(?<=[.!?…][»”"'’)]*)\s+/u).map(normalize).filter(Boolean);
}

const sentenceCatalog = Object.entries(catalog.exact).reduce<Record<string, string>>((entries, [source, target]) => {
  const sourceSentences = sentences(source);
  const targetSentences = sentences(target);
  if (sourceSentences.length === targetSentences.length) {
    sourceSentences.forEach((sentence, index) => {
      if (!entries[sentence] && targetSentences[index]) entries[sentence] = targetSentences[index];
    });
  }
  return entries;
}, {});

const headlineCatalog = Object.entries(catalog.exact).reduce<Record<string, string>>((entries, [source, target]) => {
  const sourceHeadline = sentences(source)[0]?.replace(/[.!?…]+$/u, "").trim();
  const targetHeadline = sentences(target)[0]?.replace(/[.!?…]+$/u, "").trim();
  if (sourceHeadline && targetHeadline && !entries[sourceHeadline]) entries[sourceHeadline] = targetHeadline;
  return entries;
}, {});

const MONTHS_EN = "January|February|March|April|May|June|July|August|September|October|November|December";
const englishLeadingDate = [
  new RegExp(`^(?:On|By|From|Since|Until)?\\s?(?:the\\s)?\\d{1,2}(?:\\s\\(\\d{1,2}\\))?\\s(?:${MONTHS_EN})(?:\\s\\d{4})?,?\\s`, "u"),
  new RegExp(`^(?:On\\s)?(?:${MONTHS_EN})\\s\\d{1,2},?\\s\\d{4},?\\s`, "u"),
  new RegExp(`^(?:In\\s)?(?:(?:early|late|mid-)\\s?)?(?:${MONTHS_EN}\\s)?\\d{4},?\\s`, "u")
];

/**
 * English counterpart of softenDates (content/scenes/historicalNarration.ts): she does not recite dates, so a
 * leading date is dropped and «в 1961 году» becomes "then". Falls back to the dated sentence if numbers remain.
 */
function softenEnglishDates(sentence: string, spokenRussian: string): string {
  let text = sentence;
  for (const pattern of englishLeadingDate) text = text.replace(pattern, "");
  text = text
    .replace(new RegExp(`\\s(?:in|In)\\s(?:${MONTHS_EN}\\s)?\\d{4}(?=[\\s,.!?])`, "gu"), " then")
    .replace(/\s+([,.!?])/gu, "$1")
    .replace(/^,\s*/u, "")
    .trim();
  if (!text || /\d/u.test(text)) return sentence;
  const firstWord = text.match(/^[A-Za-z]+/u)?.[0] ?? "";
  if (/^Тогда\b/u.test(spokenRussian) && firstWord !== "Then") {
    return `Then ${commonSentenceStarts.has(firstWord) ? text.charAt(0).toLocaleLowerCase("en") + text.slice(1) : text}`;
  }
  return text.charAt(0).toLocaleUpperCase("en") + text.slice(1);
}

// Historical records as she speaks them: the first sentence of a summary with its date softened.
const spokenCatalog = Object.entries(catalog.exact).reduce<Record<string, string>>((entries, [source, target]) => {
  if (!/\d{4}/u.test(source)) return entries;
  const spoken = spokenFactSentence(source);
  const english = sentences(target)[0];
  if (spoken && english && !entries[spoken] && !catalog.exact[spoken]) entries[spoken] = softenEnglishDates(english, spoken);
  return entries;
}, {});

/** Headlines cut by narrativeHeadline (src/engine/eventTitles.ts) end with «…»: find the full text they came from. */
function translateTruncatedHeadline(value: string): string | null {
  if (!value.endsWith("…")) return null;
  const prefix = value.slice(0, -1).trim();
  if (prefix.length < 40) return null;
  const source = Object.keys(overrides).find((key) => key.startsWith(prefix)) ?? Object.keys(catalog.exact).find((key) => key.startsWith(prefix));
  if (!source) return null;
  const headline = sentences(overrides[source] ?? catalog.exact[source] ?? "")[0]?.replace(/[.!?…]+$/u, "").trim();
  if (!headline) return null;
  return headline.length <= 132 ? headline : `${headline.slice(0, 131).replace(/\s+\S*$/u, "")}…`;
}

const compiledPatterns = [...manualPatterns, ...catalog.patterns.filter((pattern) => !manualPatterns.some((manual) => manual.source === pattern.source))]
  .filter(({ source, target }) => source.includes("{{") && target.includes("{{"))
  .sort((a, b) => b.source.length - a.source.length)
  .map(({ source, target }) => {
    const markers: number[] = [];
    let cursor = 0;
    let expression = "^";
    for (const match of source.matchAll(/\{\{(\d+)\}\}/gu)) {
      expression += escapeRegExp(source.slice(cursor, match.index)) + "([\\s\\S]*?)";
      markers.push(Number(match[1]));
      cursor = (match.index ?? 0) + match[0].length;
    }
    expression += escapeRegExp(source.slice(cursor)) + "$";
    return { regex: new RegExp(expression, "u"), target, markers };
  });

const namedPlaceholder = /\{[A-Za-z][A-Za-z0-9]*\}/u;
const namedEntries = Object.entries(catalog.exact).filter(([source, target]) => namedPlaceholder.test(source) && namedPlaceholder.test(target));
// Memory titles are the first sentence of a filled-in memory text, so its headline is a pattern too.
const namedHeadlines = namedEntries
  .map(([source, target]) => [sentences(source)[0]?.replace(/[.!?…]+$/u, "").trim() ?? "", sentences(target)[0]?.replace(/[.!?…]+$/u, "").trim() ?? ""] as [string, string])
  .filter(([source, target]) => namedPlaceholder.test(source) && namedPlaceholder.test(target));

const compiledNamedPatterns = [...namedEntries, ...namedHeadlines]
  .sort(([a], [b]) => b.length - a.length)
  .map(([source, target]) => {
    const markers: string[] = [];
    let cursor = 0;
    let expression = "^";
    for (const match of source.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/gu)) {
      expression += escapeRegExp(source.slice(cursor, match.index)) + "([\\s\\S]*?)";
      markers.push(match[1] ?? "");
      cursor = (match.index ?? 0) + match[0].length;
    }
    expression += escapeRegExp(source.slice(cursor)) + "$";
    return { regex: new RegExp(expression, "u"), target, markers };
  });

const translationCache = new Map<string, string>();

/** Substitutes translated captures, keeping their leading space and capitalising them at a sentence start. */
function fillPattern(target: string, captures: Array<[string, string]>): string {
  let result = target;
  for (const [token, raw] of captures) {
    const lead = raw.match(/^\s*/u)?.[0] ?? "";
    const value = translateEnglish(raw.trim());
    result = result.replace(new RegExp(`(^|[.!?…]\\s+)?${escapeRegExp(token)}`, "gu"), (_, before: string | undefined) => {
      const text = before !== undefined && value ? value.charAt(0).toLocaleUpperCase("en") + value.slice(1) : value;
      return `${before ?? ""}${value ? lead : ""}${text}`;
    });
  }
  return result;
}

/** A Russian sentence that starts with a capital letter must not turn into an English one that starts lower-case. */
function withSourceCase(source: string, translated: string): string {
  const first = source.charAt(0);
  if (first !== first.toLocaleUpperCase("ru") || first === first.toLocaleLowerCase("ru")) return translated;
  return translated.charAt(0).toLocaleUpperCase("en") + translated.slice(1);
}

function translateEnglish(value: string): string {
  const cached = translationCache.get(value);
  if (cached !== undefined) return cached;
  // Keep paragraph and line breaks: translate each block separately so normalisation cannot merge them.
  const translated = /\n/u.test(value.trim())
    ? value.split(/(\s*\n\s*)/u).map((part) => (part.includes("\n") ? part.replace(/[^\n]/gu, "") : translateEnglishUncached(part))).join("")
    : translateEnglishUncached(value);
  translationCache.set(value, translated);
  return translated;
}

function translateEnglishUncached(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || !russianText.test(trimmed)) return value;
  const normalized = normalize(trimmed);
  const lowerInitial = normalized.charAt(0).toLocaleLowerCase("ru") + normalized.slice(1);
  const exact = overrides[normalized] ?? catalog.exact[normalized] ?? sentenceCatalog[normalized] ?? headlineCatalog[normalized] ?? spokenCatalog[normalized];
  if (exact) return cleanEnglish(exact);
  const lowerExact = overrides[lowerInitial] ?? catalog.exact[lowerInitial] ?? sentenceCatalog[lowerInitial] ?? headlineCatalog[lowerInitial];
  if (lowerExact) return withSourceCase(normalized, cleanEnglish(lowerExact));
  const truncated = translateTruncatedHeadline(normalized);
  if (truncated) return truncated;

  const historicalAge = normalized.match(/^Мне тогда (?:ещё не было года|был(?:о)? (\d+) (?:год|года|лет))\.$/u);
  if (historicalAge) {
    const age = historicalAge[1];
    return age ? `I was ${age} ${age === "1" ? "year" : "years"} old then.` : "I wasn't even a year old then.";
  }
  if (normalized === "Мне тогда был год.") return "I was just one then.";
  const yearCount = normalized.match(/^(\d+) (?:год|года|лет)$/u);
  if (yearCount) return `${yearCount[1]} ${yearCount[1] === "1" ? "year" : "years"}`;

  const currentAge = normalized.match(/^Сейчас (\d{4}) год, тебе (\d+) (?:год|года|лет)\.$/u);
  if (currentAge) return `It is ${currentAge[1]}, and you are ${currentAge[2]} years old.`;
  const pastAge = normalized.match(/^В (\d{4}) году тебе было (\d+) (?:год|года|лет)\.$/u);
  if (pastAge) return `In ${pastAge[1]}, you were ${pastAge[2]} years old.`;

  for (const [source, target] of embeddedHistoricalLeads) {
    if (!normalized.startsWith(`${source} `)) continue;
    const remainder = normalized.slice(source.length + 1);
    const capitalized = remainder.charAt(0).toLocaleUpperCase("ru") + remainder.slice(1);
    const translated = translateEnglish(capitalized);
    if (russianText.test(translated)) continue;
    const firstWord = translated.match(/^[A-Za-z]+/u)?.[0] ?? "";
    const spliced = commonSentenceStarts.has(firstWord) ? translated.charAt(0).toLocaleLowerCase("en") + translated.slice(1) : translated;
    return `${target} ${spliced}`;
  }

  for (const pattern of compiledPatterns) {
    const match = normalized.match(pattern.regex);
    if (!match) continue;
    const result = fillPattern(pattern.target, pattern.markers.map((marker, index) => [`{{${marker}}}`, match[index + 1] ?? ""]));
    if (!russianText.test(result)) return withSourceCase(normalized, cleanEnglish(result));
  }

  for (const pattern of compiledNamedPatterns) {
    const match = normalized.match(pattern.regex);
    if (!match) continue;
    const result = fillPattern(pattern.target, pattern.markers.map((marker, index) => [`{${marker}}`, match[index + 1] ?? ""]));
    if (!russianText.test(result)) return withSourceCase(normalized, cleanEnglish(result));
  }

  const parts = sentences(normalized);
  if (parts.length > 1) {
    const translated: string[] = [];
    let index = 0;
    while (index < parts.length) {
      let consumed = false;
      for (let end = parts.length; end > index; end -= 1) {
        if (index === 0 && end === parts.length) continue;
        const candidate = parts.slice(index, end).join(" ");
        const result = translateEnglish(candidate);
        if (result === candidate || russianText.test(result)) continue;
        translated.push(result);
        index = end;
        consumed = true;
        break;
      }
      if (!consumed) {
        const candidate = parts[index] ?? "";
        translated.push(translateEnglish(candidate));
        index += 1;
      }
    }
    const joined = translated.join(" ");
    if (joined !== normalized) return cleanEnglish(joined);
  }
  return value;
}

export function translateText(value: string, locale: Locale): string {
  return locale === "en" ? translateEnglish(value) : value;
}

export function yearsLabel(value: number, locale: Locale): string {
  if (locale === "en") {
    const years = Math.max(0, Math.floor(value));
    if (years === 0) return "under a year old";
    return `${years} ${years === 1 ? "year" : "years"} old`;
  }
  const years = Math.max(0, Math.floor(value));
  const lastTwo = years % 100;
  const last = years % 10;
  const noun = lastTwo >= 11 && lastTwo <= 14 ? "лет" : last === 1 ? "год" : last >= 2 && last <= 4 ? "года" : "лет";
  return `${years} ${noun}`;
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (value: string) => string;
}

const I18nContext = createContext<I18nValue>({ locale: "ru", setLocale: () => undefined, t: (value) => value });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem(STORAGE_KEY) === "ru" ? "ru" : "en");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.title = locale === "en" ? "Granny's Story" : "История бабушки";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = locale === "en"
      ? "A short interactive story of a long life, grounded in archival sources and people's memories."
      : "Короткая интерактивная история о долгой жизни. Основана на архивных данных и воспоминаниях.";
  }, [locale]);

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t: (text) => translateText(text, locale) }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
