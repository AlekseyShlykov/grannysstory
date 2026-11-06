"""One-off editorial pass over src/i18n/en.generated.json.

Fixes proper names (places, people, administrative units) that the machine translation
lower-cased or mangled, and normalises capitalisation/trailing periods of short labels.
Idempotent: safe to run again after the catalog is regenerated.
"""
import json
import re
from pathlib import Path

CATALOG = Path(__file__).resolve().parents[2] / "src/i18n/en.generated.json"

# Exact source -> target for names and locatives (world locations, places, menus, name palettes).
EXACT = {
    # States and countries
    "Мир": "World", "в мире": "in the world",
    "Франция": "France", "во Франции": "in France",
    "Великобритания": "United Kingdom", "в Великобритании": "in the United Kingdom",
    "Англия": "England", "в Англии": "in England",
    "Польша": "Poland", "в Польше": "in Poland",
    "США": "United States", "в США": "in the United States",
    "Россия": "Russia", "в России": "in Russia",
    "РСФСР": "RSFSR", "в РСФСР": "in the RSFSR",
    "СССР": "USSR", "в СССР": "in the USSR",
    "Российская империя": "Russian Empire", "в Российской империи": "in the Russian Empire",
    "Российская республика": "Russian Republic", "в Российской республике": "in the Russian Republic",
    "Австро-Венгрия": "Austria-Hungary", "в Австро-Венгрии": "in Austria-Hungary",
    "Германская империя": "German Empire", "в Германской империи": "in the German Empire",
    "Германия": "Germany", "в Германии": "in Germany",
    "Вольный город Данциг": "Free City of Danzig", "в Вольном городе Данциге": "in the Free City of Danzig",
    "Королевство Польское (регентское)": "Regency Kingdom of Poland", "в Королевстве Польском": "in the Kingdom of Poland",
    # France
    "Буш-дю-Рон": "Bouches-du-Rhône", "в департаменте Буш-дю-Рон": "in Bouches-du-Rhône",
    "Финистер": "Finistère", "в департаменте Финистер": "in Finistère",
    "Нор": "Nord", "в департаменте Нор": "in the Nord department",
    "Рона": "Rhône", "в департаменте Рона": "in the Rhône department",
    "Сона и Луара": "Saône-et-Loire", "в департаменте Сона и Луара": "in Saône-et-Loire",
    "Париж (департамент)": "Paris (department)", "в департаменте Париж": "in the Paris department",
    "Сена": "Seine", "в департаменте Сена": "in the Seine department",
    "Ле-Крёзо": "Le Creusot", "в Ле-Крёзо": "in Le Creusot",
    "Лилль": "Lille", "в Лилле": "in Lille",
    "Лион": "Lyon", "в Лионе": "in Lyon",
    "Марсель": "Marseille", "в Марселе": "in Marseille",
    "Париж": "Paris", "в Париже": "in Paris",
    "Плозеве": "Plozévet", "в Плозеве": "in Plozévet",
    "Овернь — Рона — Альпы": "Auvergne-Rhône-Alpes", "в регионе Овернь — Рона — Альпы": "in Auvergne-Rhône-Alpes",
    "Бургундия — Франш-Конте": "Bourgogne-Franche-Comté", "в регионе Бургундия — Франш-Конте": "in Bourgogne-Franche-Comté",
    "Бургундия": "Burgundy", "в Бургундии": "in Burgundy",
    "Бретань": "Brittany", "в Бретани": "in Brittany",
    "Нор — Па-де-Кале — Пикардия": "Nord-Pas-de-Calais-Picardie", "в регионе Нор — Па-де-Кале — Пикардия": "in Nord-Pas-de-Calais-Picardie",
    "О-де-Франс": "Hauts-de-France", "в регионе О-де-Франс": "in Hauts-de-France",
    "Парижский район": "Paris Region", "в Парижском районе": "in the Paris Region",
    "Иль-де-Франс": "Île-de-France", "в Иль-де-Франс": "in Île-de-France",
    "Нор — Па-де-Кале": "Nord-Pas-de-Calais", "в регионе Нор — Па-де-Кале": "in Nord-Pas-de-Calais",
    "Прованс — Лазурный Берег — Корсика": "Provence-Côte d'Azur-Corsica", "в регионе Прованс — Лазурный Берег — Корсика": "in Provence-Côte d'Azur-Corsica",
    "Прованс — Лазурный Берег": "Provence-Côte d'Azur", "в регионе Прованс — Лазурный Берег": "in Provence-Côte d'Azur",
    "Прованс — Альпы — Лазурный Берег": "Provence-Alpes-Côte d'Azur", "в регионе Прованс — Альпы — Лазурный Берег": "in Provence-Alpes-Côte d'Azur",
    "Рона — Альпы": "Rhône-Alpes", "в регионе Рона — Альпы": "in Rhône-Alpes",
    # United Kingdom
    "Бирмингем": "Birmingham", "в Бирмингеме": "in Birmingham",
    "Корби": "Corby", "в Корби": "in Corby",
    "Графство Лондон": "County of London", "в графстве Лондон": "in the County of London",
    "Большой Лондон": "Greater London", "в Большом Лондоне": "in Greater London",
    "Большой Манчестер": "Greater Manchester", "в Большом Манчестере": "in Greater Manchester",
    "Ланкашир": "Lancashire", "в Ланкашире": "in Lancashire",
    "Лестершир": "Leicestershire", "в Лестершире": "in Leicestershire",
    "Лондон": "London", "в Лондоне": "in London",
    "Манчестер": "Manchester", "в Манчестере": "in Manchester",
    "Нортгемптоншир": "Northamptonshire", "в Нортгемптоншире": "in Northamptonshire",
    "Ратленд": "Rutland", "в Ратленде": "in Rutland",
    "Уорикшир": "Warwickshire", "в Уорикшире": "in Warwickshire",
    "Уэст-Мидлендс": "West Midlands", "в графстве Уэст-Мидлендс": "in the West Midlands",
    # Poland
    "Галиция": "Galicia", "в Галиции": "in Galicia",
    "Данциг": "Danzig", "в Данциге": "in Danzig",
    "Гданьск": "Gdańsk", "в Гданьске": "in Gdańsk",
    "Петроковская губерния": "Piotrków Governorate", "в Петроковской губернии": "in Piotrków Governorate",
    "Варшавская губерния": "Warsaw Governorate", "в Варшавской губернии": "in Warsaw Governorate",
    "Краков": "Kraków", "в Кракове": "in Kraków",
    "Лодзь": "Łódź", "в Лодзи": "in Łódź",
    "Западная Пруссия": "West Prussia", "в Западной Пруссии": "in West Prussia",
    "Варшава": "Warsaw", "в Варшаве": "in Warsaw",
    "Гданьское воеводство": "Gdańsk Voivodeship", "в Гданьском воеводстве": "in Gdańsk Voivodeship",
    "Краковское воеводство": "Kraków Voivodeship", "в Краковском воеводстве": "in Kraków Voivodeship",
    "Лодзинское воеводство": "Łódź Voivodeship", "в Лодзинском воеводстве": "in Łódź Voivodeship",
    "Малопольское воеводство": "Lesser Poland Voivodeship", "в Малопольском воеводстве": "in Lesser Poland Voivodeship",
    "Мазовецкое воеводство": "Masovian Voivodeship", "в Мазовецком воеводстве": "in Masovian Voivodeship",
    "Краковское воеводство (городское)": "Kraków Voivodeship (city)",
    "Лодзинское воеводство (городское)": "Łódź Voivodeship (city)",
    "Поморское воеводство": "Pomeranian Voivodeship", "в Поморском воеводстве": "in Pomeranian Voivodeship",
    "Столичное Варшавское воеводство": "Warsaw Capital Voivodeship", "в Столичном Варшавском воеводстве": "in Warsaw Capital Voivodeship",
    "Варшавское воеводство": "Warsaw Voivodeship", "в Варшавском воеводстве": "in Warsaw Voivodeship",
    "Тарновское воеводство": "Tarnów Voivodeship", "в Тарновском воеводстве": "in Tarnów Voivodeship",
    "Залипье": "Zalipie", "в Залипье": "in Zalipie",
    # Russia
    "Московская губерния": "Moscow Governorate", "в Московской губернии": "in Moscow Governorate",
    "Новгородская губерния": "Novgorod Governorate", "в Новгородской губернии": "in Novgorod Governorate",
    "Санкт-Петербургская губерния": "Saint Petersburg Governorate", "в Санкт-Петербургской губернии": "in Saint Petersburg Governorate",
    "Петроградская губерния": "Petrograd Governorate", "в Петроградской губернии": "in Petrograd Governorate",
    "Ленинградская губерния": "Leningrad Governorate", "в Ленинградской губернии": "in Leningrad Governorate",
    "Смоленская губерния": "Smolensk Governorate", "в Смоленской губернии": "in Smolensk Governorate",
    "Тверская губерния": "Tver Governorate", "в Тверской губернии": "in Tver Governorate",
    "Кузнецовский район": "Kuznetsovo District", "в Кузнецовском районе": "in Kuznetsovo District",
    "Конаковский район": "Konakovo District", "в Конаковском районе": "in Konakovo District",
    "Ленинградская область": "Leningrad Oblast", "в Ленинградской области": "in Leningrad Oblast",
    "Москва": "Moscow", "в Москве": "in Moscow",
    "Центрально-Промышленная область": "Central Industrial Oblast", "в Центрально-Промышленной области": "in the Central Industrial Oblast",
    "Московская область": "Moscow Oblast", "в Московской области": "in Moscow Oblast",
    "Новгородская область": "Novgorod Oblast", "в Новгородской области": "in Novgorod Oblast",
    "Санкт-Петербург": "Saint Petersburg", "в Санкт-Петербурге": "in Saint Petersburg",
    "Петроград": "Petrograd", "в Петрограде": "in Petrograd",
    "Ленинград": "Leningrad", "в Ленинграде": "in Leningrad",
    "Смоленск": "Smolensk", "в Смоленске": "in Smolensk",
    "Смоленская область": "Smolensk Oblast", "в Смоленской области": "in Smolensk Oblast",
    "Торжок": "Torzhok", "в Торжке": "in Torzhok",
    "Тверь": "Tver", "в Твери": "in Tver",
    "Калинин": "Kalinin", "в Калинине": "in Kalinin",
    "Калининская область": "Kalinin Oblast", "в Калининской области": "in Kalinin Oblast",
    "Тверская область": "Tver Oblast", "в Тверской области": "in Tver Oblast",
    "Новгород": "Novgorod", "в Новгороде": "in Novgorod",
    "Великий Новгород": "Veliky Novgorod", "в Великом Новгороде": "in Veliky Novgorod",
    "Западная область": "Western Oblast", "в Западной области": "in the Western Oblast",
    "Тверь / Калинин": "Tver / Kalinin",
    # United States
    "Чикаго": "Chicago", "в Чикаго": "in Chicago",
    "Детройт": "Detroit", "в Детройте": "in Detroit",
    "сельская местность округа Холмс": "rural Holmes County", "в сельской местности округа Холмс": "in rural Holmes County",
    "Иллинойс": "Illinois", "в Иллинойсе": "in Illinois",
    "округ Кук": "Cook County", "в округе Кук": "in Cook County",
    "Мариетта": "Marietta", "в Мариетте": "in Marietta",
    "Мичиган": "Michigan", "в Мичигане": "in Michigan",
    "округ Уэйн": "Wayne County", "в округе Уэйн": "in Wayne County",
    "Нью-Йорк": "New York", "в Нью-Йорке": "in New York",
    "штат Нью-Йорк": "New York State", "в штате Нью-Йорк": "in New York State",
    "Огайо": "Ohio", "в Огайо": "in Ohio",
    "округ Холмс": "Holmes County", "в округе Холмс": "in Holmes County",
    "округ Вашингтон (Огайо)": "Washington County (Ohio)", "в округе Вашингтон": "in Washington County",
    # Fictional name palettes (content/scenes/names.ts)
    "Анна": "Anna", "Валентина": "Valentina", "Галина": "Galina", "Зоя": "Zoya", "Лидия": "Lidiya",
    "Нина": "Nina", "Раиса": "Raisa", "Тамара": "Tamara",
    "Алексеевна": "Alekseyevna", "Васильевна": "Vasilyevna", "Ивановна": "Ivanovna", "Михайловна": "Mikhaylovna",
    "Николаевна": "Nikolayevna", "Петровна": "Petrovna", "Сергеевна": "Sergeyevna",
    "Беляева": "Belyaeva", "Воронова": "Voronova", "Громова": "Gromova", "Крылова": "Krylova",
    "Лебедева": "Lebedeva", "Орлова": "Orlova", "Соколова": "Sokolova", "Фёдорова": "Fyodorova",
    "Жанна": "Jeanne", "Мадлен": "Madeleine", "Сюзанна": "Suzanne", "Симона": "Simone", "Одетта": "Odette",
    "Жермена": "Germaine", "Иветта": "Yvette",
    "Мартен": "Martin", "Бернар": "Bernard", "Дюбуа": "Dubois", "Тома": "Thomas", "Робер": "Robert",
    "Ришар": "Richard", "Пети": "Petit", "Дюран": "Durand",
    "Дороти": "Dorothy", "Хелен": "Helen", "Маргарет": "Margaret", "Рут": "Ruth", "Бетти": "Betty",
    "Ширли": "Shirley", "Джоан": "Joan", "Мэри": "Mary",
    "Миллер": "Miller", "Дэвис": "Davis", "Уилсон": "Wilson", "Андерсон": "Anderson", "Тейлор": "Taylor",
    "Кларк": "Clark", "Льюис": "Lewis", "Янг": "Young",
    "Айрин": "Irene", "Дорис": "Doris", "Эйлин": "Eileen", "Джойс": "Joyce", "Вера": "Vera", "Сильвия": "Sylvia",
    "Браун": "Brown", "Ричардсон": "Richardson", "Хьюз": "Hughes", "Тёрнер": "Turner", "Купер": "Cooper",
    "Уорд": "Ward", "Беннет": "Bennett",
    "Барбара": "Barbara", "Кристина": "Krystyna", "Ядвига": "Jadwiga", "Халина": "Halina", "Зофья": "Zofia",
    "Ирена": "Irena", "Данута": "Danuta", "Тереса": "Teresa",
    "Новак": "Nowak", "Ковальская": "Kowalska", "Вишневская": "Wiśniewska", "Домбровская": "Dąbrowska",
    "Левандовская": "Lewandowska", "Зелиньская": "Zielińska", "Шиманьская": "Szymańska", "Возняк": "Woźniak",
}

# Substring fixes applied to every English value (mangled transliterations inside sentences).
SUBSTITUTIONS = [
    (r"renamed Łód[А-Яа-яЁё]* Litzmanstadt", "renamed Łódź Litzmannstadt"),
    (r"Litzmanstadt", "Litzmannstadt"),
    (r"Łód(?!ź)[А-Яа-яЁё]*-Fabrichná", "Łódź Fabryczna"),
    (r"Lodz-Fabrichna", "Łódź Fabryczna"),
    (r"Łód(?!ź)[А-Яа-яЁё]*", "Łódź"),
    (r"\bLODZ\b|\bLodz\b", "Łódź"),
    (r"\bKrakow\b", "Kraków"),
    (r"\b[Gg]dansk\b", "Gdańsk"),
    (r"\bZalip(?:ye|ya|e)\b", "Zalipie"),
    (r"\bzalipe\b", "Zalipie"),
    (r"\bTarnovo\b", "Tarnów"),
    (r"\bMazovetsk [Vv]oivodeship", "Masovian Voivodeship"),
    (r"\bDombrovsk(?:iy)? povyat", "Dąbrowa County"),
    (r"\bpovyat\b", "powiat"),
    (r"\bLe Cro(?:eso|ezo)\b", "Le Creusot"),
    (r"\bCreusot-Monso\b", "Creusot-Montceau"),
    (r"\bPloze(?:wa|vo|ve|w)\b", "Plozévet"),
    (r"\bLille-Lesken\b", "Lille-Lesquin"),
    (r"\bPar-D(?:ieu|yeu)\b", "Part-Dieu"),
    (r"\bSeine-y-Oise\b", "Seine-et-Oise"),
    (r"\bParis-South-East\b", "Paris-Sud-Est"),
    (r"\bMarseilles\b", "Marseille"),
    (r"\bTorzhka\b", "Torzhok"),
    (r"\bTorjok\b", "Torzhok"),
    (r"\bTwerk\b\.?", "Tver"),
    (r"\bCorbyn\b", "Corby"),
    (r"\bKonakovskaya GRES\b", "Konakovo Power Station"),
    (r"\bKuznetsov district\b", "Kuznetsovo District"),
    (r"\bBoucher[- ]du[- ]Rh[oô]ne\b", "Bouches-du-Rhône"),
    (r"\bde Bouches-du-Rhône\b", "Bouches-du-Rhône"),
    (r"\bFinister\b", "Finistère"),
    (r"\bRhona\b", "Rhône"),
    (r"\bAuvergne-Rhone-Alps\b", "Auvergne-Rhône-Alpes"),
    (r"\bNortenden, Baguly, Norten-Etchells\b", "Northenden, Baguley, Northen Etchells"),
    (r"\bbormingham\b", "Birmingham"),
]

# Lower-cased proper nouns that are unambiguous in English text.
PROPER = [
    "kalinin", "tver", "petrograd", "leningrad", "novgorod", "smolensk", "moscow", "torzhok", "konakovo",
    "london", "paris", "lille", "lyon", "birmingham", "manchester", "corby", "marietta", "lancashire",
    "northamptonshire", "warwickshire", "leicestershire", "galicia", "brittany", "burgundy",
    "kraków", "warsaw", "danzig", "detroit", "chicago", "ohio", "michigan", "illinois",
]

TRAILING_PUNCT = re.compile(r"[.!?…:;]$")


def fix_value(source: str, target: str) -> str:
    if source in EXACT:
        return EXACT[source]
    value = target
    for pattern, replacement in SUBSTITUTIONS:
        value = re.sub(pattern, replacement, value)
    for name in PROPER:
        value = re.sub(rf"(?<![\w/.@-]){name}\b", name[0].upper() + name[1:], value)
    # Short labels: keep the source's capitalisation and do not invent a trailing period.
    if not TRAILING_PUNCT.search(source) and re.search(r"(?<!\.)\.$", value) and not re.search(r"\b(?:St|Mr|Mrs|Dr|etc|Co|Ltd|Inc)\.$", value):
        value = value[:-1]
    if source[:1].isupper() and value[:1].islower():
        value = value[0].upper() + value[1:]
    return value


def main() -> None:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    changed = 0
    for source, target in list(catalog["exact"].items()):
        fixed = fix_value(source, target)
        if fixed != target:
            catalog["exact"][source] = fixed
            changed += 1
    for pattern in catalog["patterns"]:
        fixed = pattern["target"]
        for regex, replacement in SUBSTITUTIONS:
            fixed = re.sub(regex, replacement, fixed)
        pattern["target"] = fixed
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"updated {changed} entries")


if __name__ == "__main__":
    main()
