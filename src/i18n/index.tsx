import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import generatedCatalog from "./en.generated.json";

export type Locale = "ru" | "en";

interface TranslationPattern {
  source: string;
  target: string;
}

interface GeneratedCatalog {
  exact: Record<string, string>;
  patterns: TranslationPattern[];
}

const catalog = generatedCatalog as GeneratedCatalog;
const STORAGE_KEY = "babushka.locale";
const russianText = /[А-Яа-яЁё]/u;

const overrides: Record<string, string> = {
  "История бабушки": "Grandmother's Story",
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
  "Самое сильное воспоминание бабушки": "Grandmother's strongest memory",
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
  "Детей у меня не было": "I did not have children of my own",
  "Биологических детей у меня не было": "I did not have biological children",
  "Твою маму я удочерила": "I adopted your mother",
  "Твоего папу я усыновила": "I adopted your father",
  "Твоего родителя я усыновила или удочерила": "I adopted your parent",
  "новый город": "the new city",
  "ту жизнь, которая у меня потом получилась": "the life I eventually made there",
  "что-нибудь вроде того, о чём я тебе рассказывала, совсем обычное": "something like the ordinary thing I told you about",
  "какой-нибудь совсем обычный вторник": "some perfectly ordinary Tuesday"
};

const embeddedHistoricalLeads: Array<[string, string]> = [
  ["Мне потом рассказывали, что", "I was later told that"],
  ["Мама моя потом не раз вспоминала, что", "My mother often remembered that"],
  ["Сама я этого помнить не могу, но взрослые потом говорили, что", "I cannot remember it myself, but the adults later said that"],
  ["Я помню, взрослые за ужином говорили, что", "I remember the adults saying over dinner that"],
  ["Я слышала, как старшие вполголоса обсуждали, что", "I heard the grown-ups quietly discussing how"],
  ["Меня там тогда не было, но все знали, что", "I was not there then, but everyone knew that"],
  ["Взрослые тогда часто говорили о том, что", "The adults often talked about how"],
  ["Дома тогда разговоры всё время возвращались к тому, что", "At home, the conversation kept returning to how"]
];

const manualPatterns: TranslationPattern[] = [
  { source: "Родилась я в {{0}} году, {{1}}. Это я точно знаю, так в паспорте записано.", target: "I was born {{1}}, in {{0}}. I know that for certain; it is written in my passport." },
  { source: "Родилась {{0}}, в {{1}} году.", target: "I was born {{0}}, in {{1}}." },
  { source: "{{0}}, в {{1}} году. Мама говорила, что в тот день мела метель, а отец уверял, что шёл дождь. Так они и не договорились.", target: "{{0}}, in {{1}}. My mother said there was a snowstorm that day; my father insisted it rained. They never agreed." },
  { source: "Мама всегда говорила: родилась ты в {{0}} году, {{1}}, под утро, когда все спали. Будто я с самого начала старалась никого не беспокоить.", target: "My mother always said: you were born {{1}}, in {{0}}, just before dawn while everyone was asleep. As if I had tried not to trouble anyone from the very beginning." },
  { source: "По метрике в {{0}} году, {{1}}. Отец, правда, уверял, что записали на несколько дней позже.", target: "According to the records, in {{0}}, {{1}}. My father insisted they registered me a few days late." },
  { source: "В {{0}} году, {{1}}. Больше про тот день я толком ничего не знаю, а выдумывать не стану.", target: "In {{0}}, {{1}}. I do not really know anything else about that day, and I will not invent it." },
  { source: "Бабушка моя рассказывала, что родилась я {{0}}, в {{1}} году, и кричала так, что соседи стучали в стену.", target: "My grandmother said I was born {{0}}, in {{1}}, and cried so loudly that the neighbours knocked on the wall." },
  { source: "{{0}}. В {{1}} году. Отец любил повторять, что я появилась в самый неподходящий момент, но говорил это всегда с улыбкой.", target: "{{0}}. In {{1}}. My father liked to say I arrived at the worst possible time, but he always said it with a smile." },
  { source: "{{0}} год, {{1}}. Так во всех бумагах и стоит, сколько я их ни заполняла за жизнь.", target: "{{0}}, {{1}}. That is what every form has said, however many I filled out in my life." },
  { source: "Родилась {{0}}, в {{1}} году. Старшие потом любили рассказывать, кто первым меня увидел, и каждый раз выходило по-разному.", target: "I was born {{0}}, in {{1}}. The older relatives liked to argue over who saw me first, and the story changed every time." },
  { source: "Где-где, {{0}}. В {{1}} году. Ты будто анкету заполняешь.", target: "Where do you think? {{0}}. In {{1}}. You sound as if you are filling out a form." },
  { source: "Мама говорила, что я родилась {{0}} в {{1}} году, в тот самый год, когда у нас наконец перестала течь крыша. Так у неё и считалось: крыша и я.", target: "My mother said I was born {{0}} in {{1}}, the very year our roof finally stopped leaking. That was how she remembered it: the roof and me." },
  { source: "{{0}} Но в семье меня всегда звали бабушкой, и ты тоже.{{1}}", target: "{{0}} But everyone in the family always called me Grandma, and so did you.{{1}}" },
  { source: "{{0}}. {{1}}, а дальше были обычные семейные дни, хорошие и невозможные.", target: "{{0}}. {{1}}, and after that came ordinary family days, good ones and impossible ones." },
  { source: "Она родилась в {{0}} году.", target: "She was born in {{0}}." },
  { source: "в городе {{0}}", target: "in {{0}}" },
  { source: "Вот и дошли до {{0}} года. Давай лучше поставим чайник.", target: "And that brings us to {{0}}. Let us put the kettle on." },
  { source: "Вот и дошли до {{0}} года.{{1}} Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.", target: "And that brings us to {{0}}.{{1}} I am still here, so do not turn my life into a finished book. Let us put the kettle on." },
  { source: "Про замужество меня всё спрашивают, будто там главный ответ. Мы ведь чуть не разошлись за неделю до свадьбы, ты знаешь. Жалею ли я, что всё-таки пошла? Слово не то. Были годы, когда я думала, что ошиблась, и годы, когда без него не представляла утра. {{0}}", target: "Everyone asks me about marriage as if it contains the main answer. We nearly separated a week before the wedding, you know. Do I regret going through with it? That is not the word. There were years when I thought I had made a mistake, and years when I could not imagine a morning without him. {{0}}" },
  { source: "Честно? Большого сожаления нет. Наверное, мне повезло, а может, просто память добрая. Ошибки были, и глупости, и обиды. Но если что и хочется прожить ещё раз, то не какой-то главный день, а {{0}}.", target: "Honestly? I have no great regret. Perhaps I was lucky, or perhaps memory is kind. There were mistakes, foolishness and hurt. But if I could live anything again, it would not be some great day, but {{0}}." }
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
  return value.match(/[^.!?…]+[.!?…]+(?:[»”"'][.!?…]*)?|[^.!?…]+$/gu)?.map(normalize).filter(Boolean) ?? [];
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

const compiledNamedPatterns = Object.entries(catalog.exact)
  .filter(([source, target]) => /\{[A-Za-z][A-Za-z0-9]*\}/u.test(source) && /\{[A-Za-z][A-Za-z0-9]*\}/u.test(target))
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

function translateEnglish(value: string): string {
  const cached = translationCache.get(value);
  if (cached !== undefined) return cached;
  const translated = translateEnglishUncached(value);
  translationCache.set(value, translated);
  return translated;
}

function translateEnglishUncached(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || !russianText.test(trimmed)) return value;
  const normalized = normalize(trimmed);
  const lowerInitial = normalized.charAt(0).toLocaleLowerCase("ru") + normalized.slice(1);
  const exact = overrides[normalized] ?? catalog.exact[normalized] ?? sentenceCatalog[normalized] ?? headlineCatalog[normalized]
    ?? overrides[lowerInitial] ?? catalog.exact[lowerInitial] ?? sentenceCatalog[lowerInitial] ?? headlineCatalog[lowerInitial];
  if (exact) return cleanEnglish(exact);

  const historicalAge = normalized.match(/^Мне тогда (?:ещё не было года|был(?:о)? (\d+) (?:год|года|лет))\.$/u);
  if (historicalAge) {
    const age = historicalAge[1];
    return age ? `I was ${age} ${age === "1" ? "year" : "years"} old then.` : "I was not even a year old then.";
  }
  if (normalized === "Мне тогда был год.") return "I was one year old then.";

  const currentAge = normalized.match(/^Сейчас (\d{4}) год, тебе (\d+) (?:год|года|лет)\.$/u);
  if (currentAge) return `It is ${currentAge[1]}, and you are ${currentAge[2]} years old.`;
  const pastAge = normalized.match(/^В (\d{4}) году тебе было (\d+) (?:год|года|лет)\.$/u);
  if (pastAge) return `In ${pastAge[1]}, you were ${pastAge[2]} years old.`;

  for (const [source, target] of embeddedHistoricalLeads) {
    if (!normalized.startsWith(`${source} `)) continue;
    const remainder = normalized.slice(source.length + 1);
    const capitalized = remainder.charAt(0).toLocaleUpperCase("ru") + remainder.slice(1);
    const translated = translateEnglish(capitalized);
    if (!russianText.test(translated)) return `${target} ${translated.charAt(0).toLocaleLowerCase("en") + translated.slice(1)}`;
  }

  for (const pattern of compiledPatterns) {
    const match = normalized.match(pattern.regex);
    if (!match) continue;
    let result = pattern.target;
    pattern.markers.forEach((marker, index) => {
      result = result.replaceAll(`{{${marker}}}`, translateEnglish(match[index + 1] ?? ""));
    });
    return cleanEnglish(result);
  }

  for (const pattern of compiledNamedPatterns) {
    const match = normalized.match(pattern.regex);
    if (!match) continue;
    let result = pattern.target;
    pattern.markers.forEach((marker, index) => {
      result = result.replaceAll(`{${marker}}`, translateEnglish(match[index + 1] ?? ""));
    });
    return cleanEnglish(result);
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
    document.title = locale === "en" ? "Grandmother's Story" : "История бабушки";
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
