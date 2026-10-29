// How she answers the very first question, where and when she was born. The year and the place are canon
// (the place name is the historical one for that year); who told her and any detail of the day are fiction
// and are never stored as facts. `where` already carries its preposition: «в Калинине», «в деревне …».

export type BirthStatement = (year: number, where: string) => string;

function capitalised(text: string): string {
  return text.charAt(0).toLocaleUpperCase("ru") + text.slice(1);
}

// Sources vary on purpose: a document, a parent, a grandmother, or nobody at all.
export const birthStatements: readonly BirthStatement[] = [
  (year, where) => `Родилась я в ${year} году, ${where}. Это я точно знаю, так в паспорте записано.`,
  (year, where) => `Родилась ${where}, в ${year} году.`,
  (year, where) => `${capitalised(where)}, в ${year} году. Мама говорила, что в тот день мела метель, а отец уверял, что шёл дождь. Так они и не договорились.`,
  (year, where) => `Мама всегда говорила: родилась ты в ${year} году, ${where}, под утро, когда все спали. Будто я с самого начала старалась никого не беспокоить.`,
  (year, where) => `По метрике в ${year} году, ${where}. Отец, правда, уверял, что записали на несколько дней позже: до конторы ещё надо было добраться.`,
  (year, where) => `В ${year} году, ${where}. Больше про тот день я толком ничего не знаю, а выдумывать не стану.`,
  (year, where) => `Бабушка моя рассказывала, что родилась я ${where}, в ${year} году, и кричала так, что соседи стучали в стену.`,
  (year, where) => `${capitalised(where)}. В ${year} году. Отец любил повторять, что я появилась в самый неподходящий момент, но говорил это всегда с улыбкой.`,
  (year, where) => `${year} год, ${where}. Так во всех бумагах и стоит, сколько я их ни заполняла за жизнь.`,
  (year, where) => `Родилась ${where}, в ${year} году. Старшие потом любили рассказывать, кто первым меня увидел, и каждый раз выходило по-разному.`,
  (year, where) => `Где-где, ${where}. В ${year} году. Ты будто анкету заполняешь.`,
  (year, where) => `Мама говорила, что я родилась ${where} в ${year} году, в тот самый год, когда у нас наконец перестала течь крыша. Так у неё и считалось: крыша и я.`
];

// What she says next, before her own earliest memory. An empty string means she goes straight to it.
export const birthAfterwords: readonly string[] = [
  "А что было совсем маленькой, почти не помню, так, обрывки.",
  "Из самых первых лет у меня остались не события, а картинки.",
  "Первые годы помню кусками и не уверена, что все куски мои, а не пересказанные.",
  "",
  "А своё, не по рассказам, начинается вот с чего.",
  "Что помню сама, то помню странно.",
  "А дальше уже моя память, и она у меня с причудами."
];
