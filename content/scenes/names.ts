// Fictional name palettes by country of birth. A uniform choice among them is a game assumption, not a
// statistic about naming in any decade. Russian forms, because the game text is Russian.

export interface NamePalette {
  firstNames: readonly string[];
  /** Absent where the culture has no patronymic. */
  patronymics?: readonly string[];
  surnames: readonly string[];
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
  }
};
