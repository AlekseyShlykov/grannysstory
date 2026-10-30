import type { BranchType, ChildrenStatus, EmotionalQualities, RegretStance } from "../../src/data/types";

// The late-life conversation about regret. Clusters are a PROVISIONAL labelling vocabulary taken from
// BABUSHKA_REGRETS_PROMPT.md, not a verified Sprouht ranking: no transcripts have been collected or coded
// (see docs/SPROUHT_REGRETS_REPORT.md). Their weights are therefore equal. Every line is original fiction;
// nothing here quotes or paraphrases a real interviewee.

export type ProvisionalClusterId =
  | "time_with_loved_ones"
  | "others_expectations"
  | "work_over_life"
  | "not_taking_a_chance"
  | "relationship_decision"
  | "postponing"
  | "own_needs";

/** Equal on purpose until a coded, deduplicated sample exists; then replace with the measured shares. */
export const provisionalClusterWeight: Record<ProvisionalClusterId, number> = {
  time_with_loved_ones: 1,
  others_expectations: 1,
  work_over_life: 1,
  not_taking_a_chance: 1,
  relationship_decision: 1,
  postponing: 1,
  own_needs: 1
};

/** Canon of this life as the reflection may use it; built by src/engine/regrets.ts, never invented here. */
export interface ReflectionFacts {
  branch: { type: BranchType; outcome: "pathA" | "pathB"; year: number; eventId: string } | null;
  birthPlace: string;
  /** Where she moved at the turning point, if she did. */
  movedTo: string | null;
  motherAliveAtBranch: boolean;
  /** Her age when her mother died, if before the conversation. */
  motherDiedAtAge: number | null;
  hasOwnChildren: boolean;
  childrenStatus: ChildrenStatus;
  childIsDaughter: boolean;
  partnership: "none" | "together" | "widowed" | "separated";
  work: { title: string; years: number; eventId: string } | null;
  /** Atlas pattern keys she has already told, and the life event ids they were stored as. */
  toldPatterns: Map<string, string>;
  /** A quiet memory she has told, for answers that look for happiness in small things. */
  quietMemoryTitle: string | null;
}

export interface RegretArchetype {
  id: string;
  clusterId: ProvisionalClusterId | null;
  stance: RegretStance;
  /** Only real canon: the archetype is offered when what it talks about happened in this life. */
  eligible: (facts: ReflectionFacts) => boolean;
  /** How strongly this life points at it, on top of the cluster weight. */
  personalWeight: (facts: ReflectionFacts) => number;
  relatedEventIds: (facts: ReflectionFacts) => string[];
  speech: (facts: ReflectionFacts) => string;
  summary: (facts: ReflectionFacts) => string;
  qualities: EmotionalQualities;
}

const outcome = (facts: ReflectionFacts, type: BranchType, path: "pathA" | "pathB") => facts.branch?.type === type && facts.branch.outcome === path;
const branchEvent = (facts: ReflectionFacts) => (facts.branch ? [facts.branch.eventId] : []);
const told = (facts: ReflectionFacts, ...keys: string[]) => keys.filter((key) => facts.toldPatterns.has(key)).map((key) => facts.toldPatterns.get(key)!);
const childNom = (facts: ReflectionFacts) => (facts.childIsDaughter ? "дочь" : "сын");
const childPronoun = (facts: ReflectionFacts) => (facts.childIsDaughter ? "она" : "он");

const movedAway = (facts: ReflectionFacts) => facts.movedTo !== null && (outcome(facts, "migration", "pathA") || outcome(facts, "education", "pathA") || outcome(facts, "love", "pathA"));
const stayed = (facts: ReflectionFacts) => facts.movedTo === null && (outcome(facts, "migration", "pathB") || outcome(facts, "love", "pathB") || outcome(facts, "education", "pathB"));

export const regretArchetypes: RegretArchetype[] = [
  {
    id: "left_home_missed_mother",
    clusterId: "time_with_loved_ones",
    stance: "mixed",
    eligible: (facts) => movedAway(facts) && facts.motherAliveAtBranch,
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: (facts) => `Я уехала из родного города, когда мне было чуть за двадцать, а мама осталась там. Я приезжала на праздники, писала, потом звонила. И вот это жалею: последние её годы я знаю больше по письмам, чем по её кухне. Но ${facts.movedTo === null ? "новый город" : "ту жизнь, которая у меня потом получилась"} я бы обратно не отдала. Как это вместе укладывается, не спрашивай, само укладывается.`,
    summary: () => "Жалеет, что последние годы мамы знала больше по письмам, но жизнь после отъезда не отдала бы.",
    qualities: { pride: false, regret: true, gratitude: true, acceptance: true }
  },
  {
    id: "left_home_grateful",
    clusterId: null,
    stance: "no_major_regret",
    eligible: movedAway,
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Меня часто спрашивали, не жалею ли, что уехала. Нет. Первые зимы были такие, что я плакала в подушку и злилась на себя за это. Но там я впервые сама решала, во сколько вставать и с кем дружить. Жалеть о том, что стала собой, как-то глупо.",
    summary: () => "Не жалеет, что уехала: первые годы были трудными, но там она начала решать за себя.",
    qualities: { pride: true, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "stayed_and_wondered",
    clusterId: "not_taking_a_chance",
    stance: "mixed",
    eligible: stayed,
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: (facts) => `Я ведь тогда осталась. Всю жизнь, считай, прожила там, где родилась. Иногда, когда поезд мимо идёт, думаю: а какой бы я была в другом городе? Может, смелее. А может, такой же, только уставшей по-другому. Узнать нельзя, и это, пожалуй, единственное, что меня по-настоящему злит.`,
    summary: () => "Иногда думает о жизни, которая могла бы быть в другом городе, и не знает, была бы она лучше.",
    qualities: { pride: false, regret: true, gratitude: true, acceptance: true }
  },
  {
    id: "chose_the_quiet_job",
    clusterId: "others_expectations",
    stance: "mixed",
    eligible: (facts) => outcome(facts, "profession", "pathB"),
    personalWeight: () => 3,
    relatedEventIds: (facts) => [...branchEvent(facts), ...(facts.work ? [facts.work.eventId] : [])],
    speech: () => "Я тогда выбрала место поспокойнее, потому что так было понятнее маме и надёжнее для всех. А руками работать мне нравилось больше, я это знала уже тогда. Жалею не о конторе, контора меня кормила. Жалею, что спросила всех, кроме себя.",
    summary: () => "Жалеет не о спокойной работе, а о том, что, выбирая её, спросила всех, кроме себя.",
    qualities: { pride: false, regret: true, gratitude: true, acceptance: false }
  },
  {
    id: "chose_the_craft",
    clusterId: null,
    stance: "no_major_regret",
    eligible: (facts) => outcome(facts, "profession", "pathA"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "О ремесле не жалею. Платили меньше, руки к вечеру гудели, мама вздыхала. Зато я до сих пор, если вижу хорошо сделанную вещь, сначала смотрю, как она сделана, а потом уже, красивая ли. Это мне досталось бесплатно, вместе с мозолями.",
    summary: () => "Не жалеет, что выбрала ремесло, хотя платили меньше.",
    qualities: { pride: true, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "married_after_the_quarrel",
    clusterId: "relationship_decision",
    stance: "rejects_the_word",
    eligible: (facts) => outcome(facts, "marriage", "pathA"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: (facts) => `Про замужество меня всё спрашивают, будто там главный ответ. Мы ведь чуть не разошлись за неделю до свадьбы, ты знаешь. Жалею ли я, что всё-таки пошла? Слово не то. Были годы, когда я думала, что ошиблась, и годы, когда без него не представляла утра. ${facts.partnership === "widowed" ? "Теперь его нет, и я спорю с ним молча, по старой памяти." : "Это всё и есть брак, по-моему, а не ошибка."}`,
    summary: () => "Слово «сожаление» к браку не подходит: в нём были и годы сомнений, и годы, без которых она себя не представляет.",
    qualities: { pride: false, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "cancelled_wedding_shame",
    clusterId: "others_expectations",
    stance: "mixed",
    eligible: (facts) => outcome(facts, "marriage", "pathB"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Что замуж не вышла, не жалею. Правда, не делай такое лицо. Жалею, что потом годами стыдилась той отменённой свадьбы, будто я гостям что-то должна была. Столько сил ушло на то, что скажут, а говорили-то, наверное, неделю.",
    summary: () => "Не жалеет, что не вышла замуж; жалеет, сколько лет стыдилась перед чужими ожиданиями.",
    qualities: { pride: true, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "trains_instead_of_sundays",
    clusterId: "time_with_loved_ones",
    stance: "regret",
    eligible: (facts) => outcome(facts, "familyResponsibility", "pathA"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Я тогда взяла ту работу с поездками, а за мамой смотрели другие. Хорошо смотрели, мне упрекнуть некого. А я жалею о воскресеньях, которые просидела в поездах, считая, что ещё успею. Мама ни разу не сказала мне ни слова. Лучше бы сказала.",
    summary: () => "Жалеет о воскресеньях в поездах, пока за мамой смотрели другие.",
    qualities: { pride: true, regret: true, gratitude: true, acceptance: false }
  },
  {
    id: "refused_promotion_own_needs",
    clusterId: "own_needs",
    stance: "mixed",
    eligible: (facts) => outcome(facts, "familyResponsibility", "pathB"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "От повышения я тогда отказалась, чтобы быть рядом с мамой. Об этом не жалею, это было моё решение, никто меня не заставлял. Жалею о другом: что ни разу за те годы не спросила себя, а чего хочу я. Будто это вопрос неприличный.",
    summary: () => "Не жалеет, что осталась с мамой; жалеет, что тогда не спрашивала себя, чего хочет сама.",
    qualities: { pride: true, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "unreconciled_friend",
    clusterId: "postponing",
    stance: "regret",
    eligible: (facts) => outcome(facts, "friendship", "pathB"),
    personalWeight: () => 3.5,
    relatedEventIds: branchEvent,
    speech: () => "С подругой мы так и не помирились, ты помнишь, я рассказывала. Я всё собиралась написать. Сначала гордость мешала, потом казалось неловко после стольких лет, потом уже и адреса не знала. Вот это жалею, честно. Не ссору, ссоры у всех бывают. Что собиралась.",
    summary: () => "Жалеет, что так и не написала подруге, хотя собиралась годами.",
    qualities: { pride: false, regret: true, gratitude: false, acceptance: false }
  },
  {
    id: "reconciled_friend_grateful",
    clusterId: null,
    stance: "no_major_regret",
    eligible: (facts) => outcome(facts, "friendship", "pathA"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Знаешь, большого сожаления у меня, кажется, нет. Есть маленькие, как у всех. Но я рада, что тогда первой написала подруге. Гордость потом проходит, а человек остаётся. Мы с ней потом ещё лет сорок ругались по пустякам, и это было прекрасно.",
    summary: () => "Большого сожаления не называет; рада, что когда-то первой написала подруге.",
    qualities: { pride: false, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "postponed_song",
    clusterId: "postponing",
    stance: "mixed",
    eligible: (facts) => outcome(facts, "dream", "pathB"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Хор я тогда отложила на потом. А потом, оказывается, не бывает отдельно, оно всё время занято чем-нибудь срочным. Пою вот на кухне, соседи терпят. Жалею немного. Но не так, чтобы плакать, а так, чтобы петь громче.",
    summary: () => "Немного жалеет, что отложила хор «на потом», и до сих пор поёт на кухне.",
    qualities: { pride: false, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "sang_anyway",
    clusterId: null,
    stance: "no_major_regret",
    eligible: (facts) => outcome(facts, "dream", "pathA"),
    personalWeight: () => 3,
    relatedEventIds: branchEvent,
    speech: () => "Я, наверное, разочарую тебя, но большого сожаления нет. Были ошибки, конечно, кто ж без них. А вот хор у меня был. Дома тогда ворчали, что я ухожу по вечерам. Теперь те вечера я помню лучше, чем почти все рабочие годы.",
    summary: () => "Большого сожаления нет; рада, что когда-то всё-таки пошла петь в хор.",
    qualities: { pride: true, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "work_over_evenings",
    clusterId: "work_over_life",
    stance: "mixed",
    eligible: (facts) => Boolean(facts.work && facts.work.years >= 25 && (facts.hasOwnChildren || told(facts, "30:3", "30:1").length)),
    personalWeight: (facts) => 1 + told(facts, "30:3", "30:1", "40:3").length,
    relatedEventIds: (facts) => [...(facts.work ? [facts.work.eventId] : []), ...told(facts, "30:3", "30:1", "40:3")],
    speech: (facts) => facts.hasOwnChildren
      ? `Работала я много, и мне это нравилось, врать не буду. Только когда ${childNom(facts)} была ${facts.childIsDaughter ? "маленькой" : "маленьким"}, я часто приходила, когда ${childPronoun(facts)} уже спал${facts.childIsDaughter ? "а" : ""}. Утром одно, вечером одно. Вот этих вечеров жалко. Работа без меня бы обошлась, а вечера без меня обошлись.`
      : "Работала я много, и мне это нравилось. Только сейчас понимаю, сколько раз говорила близким «потом», а потом работа заканчивалась, и я просто ложилась спать. Ничего страшного не случилось. Просто жалко этих вечеров.",
    summary: () => "Любила работу, но жалеет вечеров, которые отдала ей вместо близких.",
    qualities: { pride: true, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "the_postponed_visit",
    clusterId: "time_with_loved_ones",
    stance: "regret",
    eligible: (facts) => facts.motherDiedAtAge !== null && facts.motherDiedAtAge >= 35,
    personalWeight: (facts) => 1 + told(facts, "35:3", "40:5", "45:2", "30:7").length,
    relatedEventIds: (facts) => told(facts, "35:3", "40:5", "45:2", "30:7"),
    speech: () => "Мама как-то просила меня приехать в выходной, просто так, без дела. А я перенесла на следующий: стирка, усталость, что-то ещё. Следующий был, и ещё много было, она ещё долго жила. Но тот выходной я почему-то помню. Глупо, правда? Ничего не случилось, а помню.",
    summary: () => "Помнит выходной, который когда-то перенесла вместо поездки к маме, хотя ничего тогда не случилось.",
    qualities: { pride: false, regret: true, gratitude: true, acceptance: true }
  },
  {
    id: "lived_for_their_opinion",
    clusterId: "others_expectations",
    stance: "mixed",
    eligible: (facts) => told(facts, "15:7", "30:5").length > 0,
    personalWeight: (facts) => 1.5 + told(facts, "15:7", "30:5").length,
    relatedEventIds: (facts) => told(facts, "15:7", "30:5"),
    speech: () => "Больше всего, наверное, жалею, сколько я думала о том, что скажут. Родня, соседи, люди на работе. Я ведь тебе рассказывала, как мы спорили. Я и тогда, и потом многое делала, чтобы никто не поднял бровь. А бровь поднимали всё равно. Могла бы сэкономить силы.",
    summary: () => "Жалеет, сколько сил потратила на чужое мнение.",
    qualities: { pride: false, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "carried_everyone",
    clusterId: "own_needs",
    stance: "mixed",
    eligible: (facts) => told(facts, "50:5", "45:2", "30:1", "40:3").length > 0,
    personalWeight: (facts) => 1 + told(facts, "50:5", "45:2", "30:1", "40:3").length,
    relatedEventIds: (facts) => told(facts, "50:5", "45:2", "30:1", "40:3"),
    speech: () => "Я много лет всех везла, как лошадь: работа, дом, больные, здоровые. Не жалею, что помогала, иначе я бы не умела. Жалею, что сама к врачу ходила, только когда уже не могла не идти. И что отдыхать стеснялась, будто отдых надо заслужить справкой.",
    summary: () => "Не жалеет, что помогала другим; жалеет, что о себе вспоминала последней.",
    qualities: { pride: true, regret: true, gratitude: false, acceptance: true }
  },
  {
    id: "children_postponed",
    clusterId: "postponing",
    stance: "mixed",
    eligible: (facts) => !facts.hasOwnChildren && facts.childrenStatus === "circumstances_changed",
    personalWeight: () => 1.5,
    relatedEventIds: () => ["life:family-connection"],
    speech: () => "Своих детей у меня не было. Я всё откладывала, ждала, когда будет лучше с жильём, с работой, а потом жизнь повернула по-своему. Жалею ли? Иногда да, по вечерам. А иногда смотрю на свою жизнь и думаю, что она и так была полной, просто другой. Оба ответа правда.",
    summary: () => "О детях, которых всё откладывала, думает по-разному: иногда с сожалением, иногда с чувством, что жизнь и так была полной.",
    qualities: { pride: false, regret: true, gratitude: true, acceptance: true }
  },
  {
    id: "children_wanted_not_regret",
    clusterId: null,
    stance: "grief_without_regret",
    eligible: (facts) => !facts.hasOwnChildren && facts.childrenStatus === "wanted_no_children",
    personalWeight: () => 1.5,
    relatedEventIds: () => ["life:family-connection"],
    speech: () => "Детей я хотела, а их не было. Только это не сожаление, сожалеют о том, что сами решили. Это просто грусть, она иногда приходит, посидит и уходит. А жалеть мне в жизни особенно не о чем, вот что странно.",
    summary: () => "О детях, которых хотела, говорит как о грусти, а не о сожалении: это не было её решением.",
    qualities: { pride: false, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "no_big_regret",
    clusterId: null,
    stance: "no_major_regret",
    eligible: () => true,
    personalWeight: () => 1.2,
    relatedEventIds: () => [],
    speech: (facts) => `Честно? Большого сожаления нет. Наверное, мне повезло, а может, просто память добрая. Ошибки были, и глупости, и обиды. Но если что и хочется прожить ещё раз, то не какой-то главный день, а ${facts.quietMemoryTitle ? "что-нибудь вроде того, о чём я тебе рассказывала, совсем обычное" : "какой-нибудь совсем обычный вторник"}.`,
    summary: () => "Говорит, что большого сожаления нет; заново хотела бы прожить обычный день, а не главный.",
    qualities: { pride: false, regret: false, gratitude: true, acceptance: true }
  },
  {
    id: "the_word_is_wrong",
    clusterId: null,
    stance: "rejects_the_word",
    eligible: () => true,
    personalWeight: () => 0.6,
    relatedEventIds: () => [],
    speech: () => "Сожаление... Не люблю я это слово. Как будто жизнь можно было сдать на проверку и получить обратно с исправлениями. Что-то я сделала бы иначе, конечно. Но тогда это была бы уже не я, а какая-то другая женщина, и неизвестно ещё, понравилась бы она мне.",
    summary: () => "Отказывается от слова «сожаление»: иначе прожитая жизнь была бы уже не её.",
    qualities: { pride: false, regret: false, gratitude: false, acceptance: true }
  }
];

export const reflectionQuestions = [
  "А если бы можно было прожить всё заново, ты бы что-нибудь изменила?",
  "Есть что-то, о чём ты до сих пор жалеешь?",
  "А что ты тогда считала важным, а теперь уже нет?"
] as const;

/** Her first reaction depends on how the question was put; the answer itself stays the same canon. */
export const reflectionOpenings: Record<number, string[]> = {
  0: [
    "Заново? Ох. Второй раз всё это я бы не потянула, даже с подсказками.",
    "Ты так спрашиваешь, будто у меня где-то черновик лежит.",
    "Прожить заново... Смешно. Я и эту-то не до конца прожила."
  ],
  1: [
    "А почему ты спрашиваешь? Решаешь что-то своё? Ладно, ладно, отвечу.",
    "Жалею? Дай подумать. Не хочу отвечать красиво.",
    "Хм. Это вопрос не к чаю, а к вечеру. Ну хорошо."
  ],
  2: [
    "Что скажут, вот что казалось важным. Ну и ещё кое-что.",
    "Многое казалось важным, а потом куда-то делось. А кое-что, наоборот, выросло.",
    "Ты прямо как я в твои годы, всё хочешь итоги подвести."
  ]
};

export const reflectionClosings = [
  "Ну вот. Сказала, и как-то легче. Налей-ка мне ещё.",
  "Только ты из этого урок не делай, ладно? Это мой ответ, у тебя будет свой.",
  "Всё, хватит. А то у меня чай остыл, вот об этом я точно жалею.",
  "Ты подумай лучше, о чём ещё меня спросить, пока я помню.",
  "Ладно. Пусть это полежит. Расскажи лучше, как у тебя дела."
];
