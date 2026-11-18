// Fictional name palettes by country of birth. A uniform choice among them is a game assumption, not a
// statistic about naming in any decade. Russian forms, because the game text is Russian.

export interface NamePalette {
  firstNames: readonly string[];
  /** Absent where the culture has no patronymic. */
  patronymics?: readonly string[];
  surnames: readonly string[];
  /** Family name first, as in Chinese («Ван Шулань»). */
  surnameFirst?: boolean;
  /**
   * Naming traditions within one country: the surname is drawn from the group of the first name, so a pair reads
   * naturally. Mixed families existed; this is a simplification of naming, not a statement about anyone's life.
   */
  groups?: readonly { firstNames: readonly string[]; surnames: readonly string[] }[];
}

export const namePalettes: Record<string, NamePalette> = {
  // Fictional Japanese palette for the supported cohorts, not measured regional name frequencies.
  JP: {
    firstNames: ["Хару", "Фуми", "Ёси", "Сидзу", "Умэ", "Кику", "Сатико", "Тосико"],
    surnames: ["Сато", "Судзуки", "Такахаси", "Танака", "Ватанабэ", "Ито", "Ямамото", "Накамура"],
    surnameFirst: true
  },
  // Fictional palette, not a frequency table. No patronymic or marriage-driven surname replacement.
  ES: {
    firstNames: ["Мария дель Кармен", "Пилар", "Исабель", "Тереса", "Росарио", "Долорес", "Консепсьон", "Хосефа"],
    surnames: ["Гарсия Руис", "Лопес Мартин", "Перес Гомес", "Мартинес Диас", "Санчес Ромеро", "Фернандес Торрес"]
  },
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
  },
  // Croatian names of women born 1900–1940; surnames do not change for women.
  HR: {
    firstNames: ["Мария", "Ана", "Катарина", "Ивка", "Мира", "Вера", "Зденка", "Лерка", "Бранка", "Драгица"],
    surnames: ["Хорват", "Ковачевич", "Бабич", "Марич", "Новак", "Юрич", "Кнежевич", "Вукович", "Томич", "Краль"]
  },
  // Slovene names of women born 1900–1940; Russian transcription; surnames do not change for women.
  SI: {
    firstNames: ["Мария", "Ангела", "Франчишка", "Иванка", "Йожефа", "Милка", "Терезия", "Антония", "Зора", "Олга"],
    surnames: ["Новак", "Хорват", "Крайнц", "Котник", "Жагар", "Подобник", "Колар", "Врхунец", "Зупан", "Кос"]
  },
  // Names of women born 1900–1940 in Sarajevo, by naming tradition; Russian transcription; surnames do not change.
  BA: {
    firstNames: ["Фатима", "Хайра", "Эмина", "Зейна", "Сафия", "Милица", "Стана", "Йованка", "Ана", "Ката", "Ивка"],
    surnames: ["Хаджич", "Бегович", "Мехмедович", "Османович", "Савич", "Симич", "Деспич", "Йованович", "Перич", "Юрич", "Томич", "Марич"],
    groups: [
      { firstNames: ["Фатима", "Хайра", "Эмина", "Зейна", "Сафия"], surnames: ["Хаджич", "Бегович", "Мехмедович", "Османович"] },
      { firstNames: ["Милица", "Стана", "Йованка"], surnames: ["Савич", "Симич", "Деспич", "Йованович"] },
      { firstNames: ["Ана", "Ката", "Ивка"], surnames: ["Перич", "Юрич", "Томич", "Марич"] }
    ]
  }
};
