// Fictional name palettes by country of birth. A uniform choice among them is a game assumption, not a
// statistic about naming in any decade. Russian forms, because the game text is Russian.

export interface NamePalette {
  firstNames: readonly string[];
  /** Absent where the culture has no patronymic. */
  patronymics?: readonly string[];
  surnames: readonly string[];
  /** Family name first, as in Chinese («Ван Шулань»). */
  surnameFirst?: boolean;
}

export const namePalettes: Record<string, NamePalette> = {
  RU: {
    firstNames: ["Анна", "Валентина", "Галина", "Зоя", "Лидия", "Нина", "Раиса", "Тамара"],
    patronymics: ["Алексеевна", "Васильевна", "Ивановна", "Михайловна", "Николаевна", "Петровна", "Сергеевна"],
    surnames: ["Беляева", "Воронова", "Громова", "Крылова", "Лебедева", "Орлова", "Соколова", "Фёдорова"]
  },
  FR: {
    firstNames: ["Жанна", "Мадлен", "Сюзанна", "Симона", "Одетта", "Жермена", "Иветта", "Марсель"],
    surnames: ["Мартен", "Бернар", "Дюбуа", "Тома", "Робер", "Ришар", "Пети", "Дюран"]
  },
  US: {
    firstNames: ["Дороти", "Хелен", "Маргарет", "Рут", "Бетти", "Ширли", "Джоан", "Мэри"],
    surnames: ["Миллер", "Дэвис", "Уилсон", "Андерсон", "Тейлор", "Кларк", "Льюис", "Янг"]
  },
  GB: {
    firstNames: ["Джоан", "Айрин", "Дорис", "Эйлин", "Джойс", "Вера", "Сильвия", "Маргарет"],
    surnames: ["Тейлор", "Браун", "Ричардсон", "Хьюз", "Тёрнер", "Купер", "Уорд", "Беннет"]
  },
  PL: {
    firstNames: ["Барбара", "Кристина", "Ядвига", "Халина", "Зофья", "Ирена", "Данута", "Тереса"],
    surnames: ["Новак", "Ковальская", "Вишневская", "Домбровская", "Левандовская", "Зелиньская", "Шиманьская", "Возняк"]
  },
  // Italian women kept their own surname in documents; the surname here is hers, not a husband's.
  IT: {
    firstNames: ["Мария", "Джузеппина", "Анна", "Роза", "Кармела", "Джованна", "Тереза", "Лючия", "Анджела", "Катерина"],
    surnames: ["Росси", "Руссо", "Ферраро", "Эспозито", "Бьянки", "Романо", "Коломбо", "Риччи", "Марино", "Конти"]
  },
  DE: {
    firstNames: ["Гертруда", "Ильза", "Хильдегард", "Урсула", "Эрика", "Ирмгард", "Шарлотта", "Эльфрида", "Маргарета", "Герда"],
    surnames: ["Мюллер", "Шмидт", "Шнайдер", "Фишер", "Вебер", "Майер", "Вагнер", "Беккер", "Шульц", "Хофман"]
  },
  // Palladius transcription; family name first.
  CN: {
    firstNames: ["Сюин", "Гуйин", "Шучжэнь", "Юйлань", "Сюлань", "Фэнъин", "Шухуа", "Гуйлань", "Юйчжэнь", "Шулань"],
    surnames: ["Ван", "Ли", "Чжан", "Лю", "Чэнь", "Ян", "Чжао", "Хуан", "Чжоу", "У"],
    surnameFirst: true
  },
  FI: {
    firstNames: ["Айно", "Хельми", "Айли", "Элли", "Мартта", "Лемпи", "Сюльви", "Кертту", "Тююне", "Анна"],
    surnames: ["Виртанен", "Корхонен", "Мякинен", "Ниеминен", "Мякеля", "Хямяляйнен", "Лайне", "Хейккинен", "Койвисто", "Лехтонен"]
  },
  // Surnames became obligatory in Turkey only with the 1934 law; she carries the one her family took then.
  TR: {
    firstNames: ["Фатма", "Айше", "Эмине", "Хатидже", "Зейнеп", "Мерьем", "Шерифе", "Зехра", "Ханифе", "Хюррие"],
    surnames: ["Йылмаз", "Кая", "Демир", "Шахин", "Челик", "Йылдыз", "Арслан", "Озтюрк", "Айдын", "Доган"]
  },
  // Serbian names of women born 1900–1940; Russian transcription of the Cyrillic. Surnames do not change for women.
  RS: {
    firstNames: ["Милица", "Елена", "Любица", "Десанка", "Зорка", "Драгица", "Стана", "Ружица", "Вида", "Нада"],
    surnames: ["Петрович", "Йованович", "Николич", "Маркович", "Джорджевич", "Стоянович", "Илич", "Павлович", "Попович", "Живкович"]
  }
};
