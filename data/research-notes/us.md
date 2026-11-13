# США — заметки исследователя (2026-10-29)

## Места
`us` → `us-ny`, `us-il`, `us-mi`, `us-oh` (us_state, FIPS штатов) → округа `us-il-cook` (17031), `us-mi-wayne` (26163), `us-oh-washington` (39167), `us-oh-holmes` (39075) → `us-chicago`, `us-detroit`, `us-marietta` (small_town), `us-holmes-county-rural` (rural_area). `us-new-york-city` прикреплён прямо к `us-ny`, без уровня графств (город охватывает пять графств; консолидация 1 января 1898 г. отмечена в `admin_note`). QID, координаты и FIPS/GNIS взяты из Wikidata (Special:EntityData). У сельского узла Холмса своего QID нет, координаты — центроид округа.
Тест «сельский Огайо не получает событий Нью-Йорка» обеспечен иерархией: городские события Нью-Йорка привязаны только к `us-new-york-city`, общештатные — к `us-ny`.
Новые узлы `state-…` не создавались.

## Источники, реально использованные
NARA Milestone Documents; Federal Reserve History; CDC (архив archive.cdc.gov и музейная хронология COVID); CDC/NCHS Health US 2017, табл. 15; Cornell LII (решения Верховного суда); EEOC; Office of the Historian (State Dept.); NASA; BLS (TED 2000; Report 991 «100 Years of U.S. Consumer Spending», текст извлечён из PDF); Census Bureau (.txt и .xls/.xlsx: homeownership и plumbing 1900–2000, POP-WP027 население городов 1900–1990, MS-2, HH-6, Fertility Historical Table 2); NCES Digest 104.10; Detroit Historical Society, Encyclopedia of Detroit (≈15 статей); 9/11 Memorial FAQ; Kheel Center Cornell (Triangle fire); Young Center (Elizabethtown College); Marietta Times (статьи 2023 г.); Ford corporate; Wikipedia (вторичный, confidence=medium; Timeline of NYC/Chicago/Detroit и тематические статьи).

## Не удалось
- Encyclopedia of Chicago — ECONNREFUSED/тайм-аут весь день (зарегистрирован как inaccessible). Чикаго поэтому опирается в основном на Wikipedia.
- Britannica — 403 на все статьи.
- Ohio History Connection (Ohio Memory 403, Ohio History Central 404), SSA history (403), страницы DOL (FLSA/Title IX — 404), NYC DORIS history (404), FDA PDF без точной даты одобрения таблетки (запись о таблетке 1960 г. не создана), sss.gov страница лотерей (404; краткое резюме главной страницы SSS отброшено как ненадёжное).
- Library of Congress / Chronicling America, IPUMS, Smithsonian Open Access — зарегистрированы как catalogued, данные не извлекались (газетные полосы дают дату публикации, IPUMS требует регистрации).

## Пробелы и сомнения
- Огайо тонкий: Мариетта 6 событий, округ Вашингтон 3, Холмс 7 (+ 3 общештатных). Местные архивы (Washington County Historical Society, Marietta College Legacy Library, Holmes County Historical Society) не опрошены. Наводнение 1937 г. для Мариетты не подтверждено (страница NWS не упоминает город) — запись не создана.
- `us-holmes-1969-flood-railroad` — needs_review/low: дата 1969 только из популярной статьи и любительского сайта.
- В Holmes доля амишей по Wikipedia противоречива (42% vs 48%); в контекст взята цифра 2010 г. (41,7%) и оценка Young Center 2024 (поселение шире округа).
- BLS 1901: «19% семей владели жильём» относится к обследованным городским семьям рабочих, а не ко всем (по переписи 1900 — 46,5%); в контекст не включено.
- Хронология Wikipedia по Чикаго датирует первую смерть от COVID и самоизоляцию 16.03.2020 — не сверено с городом/штатом.
- Детройт: события на заводах Highland Park и Dearborn (Rouge) отнесены к округу Уэйн (это отдельные города внутри/рядом с Детройтом); Northland (Саутфилд) — округ Окленд, упомянут лишь в тексте детройтского события Hudson's.
- 34 события помечены sensitive (беспорядки 1919/1943/1967, катастрофы, эпидемии, репрессии, войны).
- Мало событий 2000–2025 (35) и мало местных событий 1980–2025 для Огайо.

## Итог (фактически)
События: 203 (verified 202, needs_review 1; high 59, medium 143, low 1).
По местам: США 63; Нью-Йорк 40; Чикаго 36; Детройт 33; округ Уэйн 6; Мариетта 6; округ Вашингтон (OH) 3; округ Холмс 7; штаты: Огайо 3, Мичиган 4, Нью-Йорк 1, Иллинойс 1.
По эпохам (≈): 1900–19: 28; 1920–39: 34; 1940–59: 40; 1960–79: 45; 1980–99: 21; 2000–09: 12; 2010–19: 13; 2020–25: 10.
Контексты: 31 (национальные 13 — доли расходов на еду, автомобили, бюджет 1901, собственность на жильё, водопровод, возраст брака, размер домохозяйства, бездетность ×2, образование, продолжительность жизни, женщины в рабочей силе ×2; местные 18 — собственность и водопровод по 4 штатам, население городов/округов, амиши Холмса, быт Нью-Йорка 1930–70-х).

## Архивные и официальные ссылки (13.11.2026)
Метод владельца: поиск уже имеющихся событий на официальных сайтах, без глубокой перепроверки. Доля проверенных событий с архивным/официальным доказательством: 60/202 → 112/202 (55,4%).

Источники, давшие ссылки: American Presidency Project, UCSB (`us_presidency_project`, новый; 14 законов и указов: FMLA, ADA, реформа пособий 1996, ECOA, ACA, CARES, TARP, REA, FLSA, призыв 1940, лотерея 1969); NWS/NOAA (`us_nws`, 13: метели 1947/1978/1979, жара 1995, наводнение 1913 в Огайо и Мариетте — данные гидропоста через api.water.noaa.gov, «Сэнди», «Ида»); Detroit Historical Society (8); NARA (`us_nara`, 6: Корейская война, Великая миграция ×2, блог Prologue о полиомиелите ×2); CDC/MMWR (5); Census Bureau (5: таблицы POP-twps0027 1920/1950/1960, релиз переписи 2010); Port Authority NY&NJ (`us_panynj`, новый, 2); Chicago Department of Aviation (`us_flychicago`, новый, 2); по одной — FDA, BLS, NSF (новый), NTIA (новый), Reuther Library (новый), Kent State (новый), Mackinac Bridge Authority (новый), NYC Department of City Planning (`us_nyc_gov`, теперь accessed).

Исправление: `us-chicago-1927-municipal-airport` — по хронологии Департамента авиации Чикаго аэропорт открыт 8 мая 1926 г., а в 1927 г. лишь торжественно освящён. Дата изменена на 1926-05-08 (точность — день), текст уточнён; id оставлен прежним.

Оговорки: Renaissance Center — первая башня открыта 1 июля 1976 г., гостиничная — в 1977 г. (запись «1977» оставлена). NSF даёт только год закрытия NSFNET (1995), без дня. MMWR 2014 говорит о вспышке среди амишей Огайо без названия округов. Хронология TARP, FLSA, REA и призыва 1940 подтверждена записями хронологий президентов (UCSB), а не текстами законов.

Недоступно для автоматического доступа (не обходили): congress.gov (403), loc.gov «Today in History» (403), Smithsonian americanhistory.si.edu (403), sph.umich.edu (403); water.weather.gov больше не резолвится; страница nyc.gov planning/zoning/background.page и mackinacbridge.org/history/history-of-the-bridge — 404; history.state.gov/milestones/1945-1952/korean-war-1 — 404; страницы истории panynj.gov отдают только заголовок.
