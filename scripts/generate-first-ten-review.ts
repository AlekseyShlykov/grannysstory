import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { branchCatalog } from "../content/scenes/branchCatalog";
import { earlyLifeThreads } from "../content/scenes/earlyLifeThreads";
import { finalQuestionForms, lifeCourseFragments, questionFormForPoint } from "../content/scenes/lifeCourse";
import { occupations } from "../content/scenes/occupations";
import { spokenChildren, spokenRelationship } from "../content/scenes/kinshipVoice";
import {
  reflectionClosings,
  reflectionOpenings,
  reflectionQuestions,
  regretArchetypes
} from "../content/scenes/regretArchetypes";
import type { ReflectionFacts } from "../content/scenes/regretArchetypes";
import { atlasPatterns } from "../content/memory/atlasPatterns";
import { yearsCount } from "../content/language/russian";
import { milestones } from "../content/historical/milestones";
import { historicalVoice } from "../content/scenes/historicalVoice";
import {
  historicalAgeLine,
  historicalNarrationReviewPhrases,
  milestoneFollowUpQuestions,
  narrateMilestone,
  narrateRecord
} from "../content/scenes/historicalNarration";
import { manifest } from "../src/data/world";
import { secondMemoryLeads } from "../src/engine/dialogue";

const output: string[] = [];
const line = (text = "") => output.push(text);
const reviewOutputPath = process.env.REVIEW_OUTPUT_PATH || "docs/steps-1-10-review.md";

function collectJsonFiles(root: string): string[] {
  const result: string[] = [];
  if (!statSync(root, { throwIfNoEntry: false })) return result;
  for (const name of readdirSync(root)) {
    const path = join(root, name);
    if (statSync(path).isDirectory()) result.push(...collectJsonFiles(path));
    else if (path.endsWith(".json")) result.push(path);
  }
  return result;
}

function eventYears(): Map<string, number> {
  const years = new Map<string, number>();
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    const record = value as Record<string, unknown>;
    if (typeof record.id === "string") {
      const raw = record.start ?? record.startDate ?? record.date ?? record.year;
      const year = Number(String(raw ?? "").slice(0, 4));
      if (Number.isInteger(year) && year >= 1800 && year <= 2100 && !years.has(record.id)) years.set(record.id, year);
    }
    Object.values(record).forEach(visit);
  };
  for (const root of ["content/historical", "data/historical", "public/data/world/packs"]) {
    for (const path of collectJsonFiles(root)) {
      try { visit(JSON.parse(readFileSync(path, "utf8"))); } catch { /* validation catches malformed data elsewhere */ }
    }
  }
  return years;
}

const years = eventYears();
const countryNames: Record<string, string> = { RU: "Россия / СССР", PL: "Польша", FR: "Франция", GB: "Великобритания", US: "США" };

line("# Вся история, ещё не прошедшая ревью");
line();
line(`Здесь собраны все ещё не вычитанные личные тексты от шага 5 до конца разговора и исторические тексты всей жизни, с 1900 по ${manifest.conversationYear} год. Уже исправленные вступление и личные тексты шагов 1–4 остаются в [docs/first-steps-phrases.md](first-steps-phrases.md) и здесь не повторяются.`);
line();
line("Править этот файл можно как редакторскую разметку. После ревью изменения нужно перенести в исходники, указанные в заголовках; сама игра этот Markdown не читает.");
line();

line("## 1. Вопросы игрока от шага 5 до конца жизни");
line();
line("В одном прохождении ни одна формулировка вопроса не повторяется. Шаг 17 использует отдельные вопросы позднего переосмысления вместо обычной тройки.");
line();
const stepDefinitions = [
  { step: 5, age: 20, pointIndex: 4, phase: "youth", label: "начало самостоятельной жизни" },
  { step: 6, age: 25, pointIndex: 5, phase: "youth", label: "первые большие последствия" },
  { step: 7, age: 30, pointIndex: 6, phase: "adult", label: "собственный уклад" },
  { step: 8, age: 35, pointIndex: 7, phase: "adult", label: "работа и близкие между делами" },
  { step: 9, age: 40, pointIndex: 8, phase: "adult", label: "устоявшаяся взрослая жизнь" },
  { step: 10, age: 45, pointIndex: 9, phase: "midlife", label: "середина жизни" },
  { step: 11, age: 50, pointIndex: 10, phase: "midlife", label: "время и ответственность" },
  { step: 12, age: 55, pointIndex: 11, phase: "midlife", label: "поздняя середина жизни" },
  { step: 13, age: 60, pointIndex: 12, phase: "later", label: "смена привычного ритма" },
  { step: 14, age: 65, pointIndex: 13, phase: "later", label: "жизнь после прежнего уклада" },
  { step: 15, age: 70, pointIndex: 14, phase: "later", label: "близкие, память и самостоятельность" },
  { step: 16, age: 75, pointIndex: 15, phase: "oldAge", label: "старость без готовых итогов" },
  { step: 17, age: 80, pointIndex: 16, phase: "oldAge", label: "переосмысление прожитого" },
  { step: 18, age: 85, pointIndex: 17, phase: "oldAge", label: "обычные дни поздней жизни" },
  { step: 19, age: 90, pointIndex: 18, phase: "oldAge", label: "память и настоящее" },
  { step: 20, age: 95, pointIndex: 19, phase: "oldAge", label: "то, что ещё продолжается" },
  { step: 21, age: 100, pointIndex: 20, phase: "oldAge", label: "столетие и незаконченная жизнь" }
] as const;
const angles = ["detail", "feeling", "meaning"] as const;
for (const step of stepDefinitions) {
  line(`### Шаг ${step.step} — ${step.age} лет: ${step.label}`);
  line();
  if (step.age === 80) {
    reflectionQuestions.forEach((question) => line(`- ${question}`));
  } else {
    for (const angle of angles) line(`- В <год> году тебе было ${yearsCount(step.age)}. ${questionFormForPoint(angle, step.pointIndex)}`);
  }
  line();
}

line("### Последний неполный пятилетний шаг");
line();
line(`Если к ${manifest.conversationYear} году бабушке ещё нет ста лет и её возраст не кратен пяти, движок добавляет отдельную финальную точку. Ниже все такие варианты для разрешённых годов рождения; вместо «В … году» в игре звучит «Сейчас … год».`);
line();
for (let birthYear = manifest.allowedBirthYears.from; birthYear <= manifest.allowedBirthYears.to; birthYear += 1) {
  const conversationYear = Math.min(birthYear + 100, manifest.conversationYear);
  const age = conversationYear - birthYear;
  if (age % 5 === 0) continue;
  line(`#### Родилась в ${birthYear}: финал в ${conversationYear} году, ${yearsCount(age)}`);
  line();
  for (const angle of angles) line(`- Сейчас ${conversationYear} год, тебе ${yearsCount(age)}. ${finalQuestionForms[angle]}`);
  line();
}

line("### Дополнительные вопросы об историческом событии");
line();
line("Если после исторической реплики можно задержаться на теме, вопросы используются по порядку и не повторяются в одном прохождении.");
line();
milestoneFollowUpQuestions.forEach((question) => line(`- ${question}`));
line();

line("## 2. Возвраты к предмету из детства");
line();
line("Здесь оставлены только ещё не вычитанные возвраты после шага 4 и финальная реплика выбранной детской нити. Источник: [content/scenes/earlyLifeThreads.ts](../content/scenes/earlyLifeThreads.ts).");
line();
for (const thread of earlyLifeThreads) {
  line(`### ${thread.id}`);
  line();
  line(`- **20 лет:** ${thread.echoes.youth}`);
  line(`- **30 лет:** ${thread.echoes.adult}`);
  line(`- **45 лет:** ${thread.echoes.midlife}`);
  line(`- **60 лет:** ${thread.echoes.later}`);
  line(`- **в самом конце:** ${thread.echoes.closing}`);
  line();
}

line("## 3. Основные пулы личных реплик от шага 5 до конца");
line();
line("Если атлас памяти не подменил основной фрагмент, движок выбирает пул по возрастной фазе. Вопрос определяет окончание: `detail + feeling` либо `detail + meaning`. Источник: [content/scenes/lifeCourse.ts](../content/scenes/lifeCourse.ts).");
line();
const phaseLabels = {
  youth: "20 и 25 лет — youth",
  adult: "30, 35 и 40 лет — adult",
  midlife: "45, 50 и 55 лет — midlife",
  later: "60, 65 и 70 лет — later",
  oldAge: "75 лет и старше — oldAge"
} as const;
for (const phase of ["youth", "adult", "midlife", "later", "oldAge"] as const) {
  line(`### ${phaseLabels[phase]}`);
  line();
  for (const fragment of lifeCourseFragments[phase]) {
    line(`#### ${fragment.title}`);
    line();
    line(`- **detail:** ${fragment.detail}`);
    line(`- **feeling:** ${fragment.feeling}`);
    line(`- **meaning:** ${fragment.meaning}`);
    line();
  }
}

line("## 4. Воспоминания атласа от шага 5 до поздней старости");
line();
line("Если условия варианта совпали с биографией, эта сцена может заменить основной фрагмент или прозвучать второй короткой памятью. Источник: [content/memory/atlasPatterns.ts](../content/memory/atlasPatterns.ts).");
line();
line("### Фразы перед второй памятью той же пятилетки");
line();
secondMemoryLeads.forEach((lead) => line(`- ${lead}`));
line();
for (const age of [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]) {
  line(`### ${age}–${age + 4} лет`);
  line();
  for (const pattern of atlasPatterns.filter((entry) => entry.key.startsWith(`${age}:`))) {
    line(`#### ${pattern.key}`);
    line();
    pattern.variants.forEach((variant, index) => {
      if (pattern.variants.length > 1) line(`**Вариант ${index + 1}; условия:** ${variant.when.length ? variant.when.join(", ") : "без дополнительных условий"}`);
      else line(`**Условия:** ${variant.when.length ? variant.when.join(", ") : "без дополнительных условий"}`);
      line();
      line(`- **scene:** ${variant.scene}`);
      line(`- **feeling:** ${variant.feeling}`);
      line(`- **now:** ${variant.now}`);
      line();
    });
  }
}

line("## 5. Поворотные точки и их поздние последствия");
line();
line("Конкретный год развилки задаёт биография. До решения звучит предвестие и setup, затем один из вопросов и ответов; позднее — последствие. Источник: [content/scenes/branchCatalog.ts](../content/scenes/branchCatalog.ts).");
line();
for (const branch of branchCatalog) {
  line(`### ${branch.label} · ${branch.type}`);
  line();
  line(`- **foreshadow:** ${branch.foreshadow}`);
  line(`- **setup:** ${branch.setup}`);
  line(`- **question A:** ${branch.questionA}`);
  line(`- **answer A:** ${branch.answerA}`);
  line(`- **question B:** ${branch.questionB}`);
  line(`- **answer B:** ${branch.answerB}`);
  line(`- **consequence A:** ${branch.consequenceA}`);
  line(`- **consequence B:** ${branch.consequenceB}`);
  line(`- **late A, в финале:** ${branch.lateA}`);
  line(`- **late B, в финале:** ${branch.lateB}`);
  line();
}

line("## 6. Работа от начала до завершения");
line();
line("Начало работы обычно попадает в первую подходящую точку после 18 лет, середина — не раньше 35 лет. Закрытие предприятия может прозвучать раньше пенсии. Источник: [content/scenes/occupations.ts](../content/scenes/occupations.ts).");
line();
for (const occupation of occupations) {
  line(`### ${occupation.title} · ${occupation.id}`);
  line();
  line(`- **start:** ${occupation.start}`);
  line(`- **middle:** ${occupation.middle}`);
  line(`- **late:** ${occupation.late}`);
  if (occupation.closure) {
    line(`- **closure before:** ${occupation.closure.before}`);
    line(`- **closure after:** ${occupation.closure.after}`);
  }
  line();
}

line("## 7. Родство и дети, если семейная связь раскрывается после шага 4");
line();
line("Источник: [content/scenes/kinshipVoice.ts](../content/scenes/kinshipVoice.ts).");
line();
line("### Родственная связь");
line();
const relationVariants = ["biological_grandmother", "adoptive_grandmother", "great_aunt", "cousin_grandmother"] as const;
const sexes = ["female", "male", undefined] as const;
const relationshipLines = new Set<string>();
for (const variant of relationVariants) for (const bridge of sexes) for (const parent of sexes) relationshipLines.add(spokenRelationship(variant, bridge, parent));
relationshipLines.forEach((text) => line(`- ${text}`));
line();
line("### Собственные дети и семейный путь");
line();
const childrenStatuses = ["biological_parent", "adoptive_parent", "chose_no_children", "wanted_no_children", "circumstances_changed", "no_strong_preference", "mentor_without_children"] as const;
const childrenLines = new Set<string>();
for (const status of childrenStatuses) for (const parent of sexes) childrenLines.add(spokenChildren(status, parent));
childrenLines.forEach((text) => line(`- ${text}`));
line();

line("## 8. Переосмысление жизни в 80–90 лет");
line();
line("Эта сцена заменяет обычный вопрос в первой подходящей точке между 80 и 90 годами. Выбирается только ответ, совместимый с уже рассказанной жизнью. Подстановки ниже показаны на условном примере; в игре город, семейный путь и работа берутся из канона. Источник: [content/scenes/regretArchetypes.ts](../content/scenes/regretArchetypes.ts).");
line();
line("Вопросы этой сцены приведены выше, в шаге 17, и здесь не дублируются.");
line();
line("### Первые реакции на формулировку вопроса");
line();
for (const [questionIndex, openings] of Object.entries(reflectionOpenings)) {
  line(`#### Вопрос ${Number(questionIndex) + 1}`);
  line();
  openings.forEach((opening) => line(`- ${opening}`));
  line();
}

const reflectionFacts: ReflectionFacts = {
  branch: { type: "migration", outcome: "pathA", year: 1952, eventId: "life:migration:decision" },
  birthPlace: "Калинин",
  movedTo: "Ленинград",
  motherAliveAtBranch: true,
  motherDiedAtAge: 62,
  hasOwnChildren: true,
  childrenStatus: "biological_parent",
  childIsDaughter: true,
  partnership: "together",
  work: { title: "работа", years: 35, eventId: "life:work" },
  toldPatterns: new Map(),
  quietMemoryTitle: "обычный день"
};

line("### Возможные основные ответы");
line();
for (const archetype of regretArchetypes) {
  line(`#### ${archetype.id}`);
  line();
  const variants: ReflectionFacts[] = [reflectionFacts];
  if (archetype.id === "married_after_the_quarrel") variants.push({ ...reflectionFacts, partnership: "widowed" });
  if (archetype.id === "work_over_evenings") variants.push({ ...reflectionFacts, hasOwnChildren: false });
  if (archetype.id === "no_big_regret") variants.push({ ...reflectionFacts, quietMemoryTitle: null });
  [...new Set(variants.map((facts) => archetype.speech(facts)))].forEach((speech, index, all) => {
    line(all.length > 1 ? `- **Вариант ${index + 1}:** ${speech}` : `- ${speech}`);
  });
  line(`- **Краткая запись для атласа:** ${archetype.summary(reflectionFacts)}`);
  line();
}

line("### Завершения ответа");
line();
reflectionClosings.forEach((closing) => line(`- ${closing}`));
line();

line("## 9. Финал разговора");
line();
line("После обычной последней памяти добавляются позднее последствие выбранной развилки, финальная реплика детской нити и одна из строк ниже. Источник: [src/engine/dialogue.ts](../src/engine/dialogue.ts).");
line();
line(`- Если ей меньше ста: «Вот и дошли до ${manifest.conversationYear} года. Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.»`);
line(`- Если ей сто: «Вот и дошли до <год столетия> года. Сто лет, подумать только. Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.»`);
line("- Если переосмысление пришлось на финальную точку: «Вот и дошли до <год разговора> года. Давай лучше поставим чайник.»");
line();

line("## 10. Исторические тексты всей жизни");
line();
line(`Для годов рождения 1900–1940 разговор охватывает исторические даты с 1900 по ${manifest.conversationYear} год. В каждой исторической реплике после события бабушка называет свой возраст. Одно и то же событие получает разную первую фразу по возрасту: \`heard\` до 6 лет, \`young\` в 6–15 лет, \`lived\` с 16 лет. Затем может добавиться \`occupied\` и всегда добавляется \`change\`, если он задан. \`deeper\` звучит только после одного из дополнительных исторических вопросов, перечисленных в разделе 1. Источники: [content/historical/milestones.ts](../content/historical/milestones.ts), [content/scenes/historicalNarration.ts](../content/scenes/historicalNarration.ts).`);
line();

const milestoneEventIds = new Set(milestones.flatMap((milestone) => milestone.eventIds));
for (const country of ["RU", "PL", "FR", "GB", "US"] as const) {
  line(`### ${countryNames[country]}`);
  line();
  const entries = milestones
    .filter((milestone) => milestone.country === country)
    .map((milestone) => ({ milestone, year: milestone.eventIds.map((id) => years.get(id)).find((value) => value !== undefined) }))
    .filter((entry) => entry.year === undefined || (entry.year >= 1900 && entry.year <= manifest.conversationYear))
    .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
  for (const { milestone, year } of entries) {
    line(`#### ${year ?? "год не найден"} · ${milestone.id}`);
    line();
    line(`- **Полная реплика, пример в 3 года:** ${narrateMilestone(milestone, { age: 3, wasPresent: true, runSeed: "review", order: 0 })}`);
    line(`- **Полная реплика, пример в 10 лет:** ${narrateMilestone(milestone, { age: 10, wasPresent: true, runSeed: "review", order: 0 })}`);
    line(`- **Полная реплика, пример в 30 лет:** ${narrateMilestone(milestone, { age: 30, wasPresent: true, runSeed: "review", order: 0 })}`);
    if (milestone.voice.occupied) line(`- **Полная реплика в оккупированном месте, пример в 30 лет:** ${narrateMilestone(milestone, { age: 30, wasPresent: true, placeOccupied: true, runSeed: "review", order: 0 })}`);
    line(`- **deeper:** ${milestone.voice.deeper}`);
    line();
  }
}

line(`## 11. Другие ручные исторические реплики 1900–${manifest.conversationYear}`);
line();
line("Эти фразы используются для проверенных событий, у которых нет записи в реестре ключевых вех. Источник: [content/scenes/historicalVoice.ts](../content/scenes/historicalVoice.ts).");
line();
for (const { eventId, voice, year } of Object.entries(historicalVoice)
  .map(([eventId, voice]) => ({ eventId, voice, year: years.get(eventId) }))
  .filter((entry) => !milestoneEventIds.has(entry.eventId) && (entry.year === undefined || (entry.year >= 1900 && entry.year <= manifest.conversationYear)))
  .sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))) {
  line(`### ${year ?? "год не найден"} · ${eventId}`);
  line();
  const record = { eventId, summary: "Проверенный факт события." };
  line(`- **Полная реплика, пример в 3 года:** ${narrateRecord(record, { age: 3, wasPresent: true, runSeed: "review", order: 0 })}`);
  line(`- **Полная реплика, пример в 30 лет:** ${narrateRecord(record, { age: 30, wasPresent: true, runSeed: "review", order: 0 })}`);
  if (voice.away) line(`- **Полная реплика вдали от события, пример в 30 лет:** ${narrateRecord(record, { age: 30, wasPresent: false, runSeed: "review", order: 0 })}`);
  line();
}

line("## 12. Составные фразы для остальных проверенных событий");
line();
line("Если у события нет ручной реплики, движок берёт одно проверяемое предложение из записи и окружает его фразами ниже. Источник: [content/scenes/historicalNarration.ts](../content/scenes/historicalNarration.ts).");
line();
const phrasebook = historicalNarrationReviewPhrases();
line("### Строка с возрастом");
line();
line("Она автоматически ставится сразу после названного исторического события. Варианты согласования:");
line();
for (const age of [0, 1, 2, 4, 5, 21, 22, 25, 100]) line(`- **${age}:** ${historicalAgeLine(age)}`);
line();
for (const [kind, pool] of Object.entries(phrasebook.perspective)) {
  line(`### Позиция: ${kind}`);
  line();
  for (const phrase of pool.lead) line(`- **до факта:** ${phrase} …`);
  for (const phrase of pool.after) line(`- **после факта:** … ${phrase}`);
  line();
}
line("### Изменение обычной жизни по категории");
line();
for (const [category, phrases] of Object.entries(phrasebook.changeByCategory)) {
  line(`- **${category}:** ${phrases.join(" / ")}`);
}
line();
line("### Возврат от истории к её жизни");
line();
phrasebook.ties.forEach((phrase) => line(`- ${phrase}`));
line();
line("### Исторический фон перед жизненной развилкой");
line();
for (const [kind, pool] of Object.entries(phrasebook.framing)) {
  line(`- **${kind}, до факта:** ${pool.lead.join(" / ") || "—"}`);
  line(`- **${kind}, после факта:** ${pool.after.join(" / ")}`);
}

writeFileSync(reviewOutputPath, `${output.join("\n")}\n`);
