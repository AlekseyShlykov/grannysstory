# Бриф: архивные и официальные подтверждения событий

Требование владельца (12 ноября 2026): события должны опираться на архивы, особенно государственные, и на официальные источники, а не только на Wikipedia. Историческая правда важнее числа записей.

## Задача

Для своей страны пройти проверенные события по приоритету и к каждому, где возможно, добавить доказательство из архива или официального органа. Список: `python3 scripts/verify/evidence_status.py <CC>` (приоритет 1 — записи, которые бабушка произносит в вехах и местных репликах; 2 — национальные; 3 — города меню; 4 — остальные). Сводка: `--summary`.

Что считается архивным или официальным (`source_type`): государственный, региональный или муниципальный архив (`archive`, `municipal`); правительство, парламент, официальный вестник законов (`government`); статистическая служба (`statistics`); национальная или городская библиотека (`library`); государственный или городской музей (`museum`); университет, академия (`academic`); официальная местная хроника 地方志 (`gazetteer`). Энциклопедии, СМИ, частные сайты — не в счёт (`encyclopedia`, `newspaper`, `other`).

Приоритет внутри этого: **государственные архивы** (их онлайн-хроники, выставки, описи и карточки дел), затем официальные вестники законов (дата закона — по вестнику), статистические службы, городские архивы и хроники городов на официальных сайтах муниципалитетов, национальные библиотеки, государственные музеи.

Ориентиры (проверяйте сами, ничего не считайте доступным заранее):
- Италия: Archivio Centrale dello Stato (acs.beniculturali.it), Sistema Archivistico Nazionale, archivi di Stato провинций, Gazzetta Ufficiale и Normattiva, Senato/Camera (storia), ISTAT (serie storiche), Archivio storico della città (Roma Capitale, Comune di Milano/Torino/Napoli/Palermo), MuseoTorino, Istituto Luce (только метаданные).
- Германия: Bundesarchiv (chroniken, Themenportale, «Chronik der Mauer»), Landesarchive, Stadtarchiv/Stadtchronik München, Köln, Leipzig, Halle, Hamburg, Berlin (berlin.de), Bundesgesetzblatt, Bundestag, Destatis, LeMO/DHM, bpb.
- Китай: 中国政府网 gov.cn (法律, 历史), 国家档案局 saac.gov.cn, 中国共产党新闻网 и 新华网 только как официальные публикации, 地方志 провинций и городов (официальные сайты 地方志办公室), статистические ежегодники, сайты городских администраций.
- Финляндия: Kansallisarkisto, Finlex (законы), eduskunta.fi, Statistics Finland, городские архивы и музеи (Helsingin kaupunginmuseo, Tampereen historia, Turun museokeskus), Kela, Finna (метаданные).
- Франция: Archives nationales (France Archives), archives départementales et municipales (Paris, Lyon, Marseille, Lille, Saône-et-Loire, Finistère), Légifrance / Journal officiel, INSEE, Gallica (BnF, метаданные и страницы документов), vie-publique.fr, Assemblée nationale / Sénat (histoire).
- США: National Archives (archives.gov, «Milestone Documents», catalog.archives.gov), Library of Congress, Census Bureau (history), congress.gov / govinfo, государственные архивы штатов (New York State Archives, Michigan, Illinois, Ohio), городские архивы и официальные сайты Нью-Йорка, Чикаго, Детройта, Мариетты, Smithsonian.
- Великобритания: The National Archives (nationalarchives.gov.uk), legislation.gov.uk, UK Parliament (Hansard, «Living Heritage»), ONS, British Library, местные архивы (London Metropolitan Archives, Birmingham, Manchester, Northamptonshire, Rutland), Imperial War Museums.
- Польша: Archiwa Państwowe (szukajwarchiwach.gov.pl, archiwa państwowe w Warszawie, Łodzi, Krakowie, Gdańsku), ISAP / Dziennik Ustaw (Sejm), GUS, Biblioteka Narodowa / Polona, NAC (метаданные), IPN, muzea miejskie.
- Россия: Президентская библиотека, Росархив и федеральные архивы (ГА РФ, РГАСПИ — выставки и публикации), pravo.gov.ru и КонсультантПлюс только как официальные тексты законов, Росстат, официальные сайты городов и областные архивы (Тверь, Москва, Санкт-Петербург, Смоленск, Новгород).
- Турция: Devlet Arşivleri (Cumhurbaşkanlığı Devlet Arşivleri Başkanlığı), Resmî Gazete (законы с номером и датой), TBMM (история, законы), TÜİK (исторические публикации), сайты муниципалитетов и губернаторств (il valiliği, belediye tarihçe), Atatürk Kitaplığı.

## Метод (указание владельца 12.11.2026)

Найдите несколько официальных архивов и официальных сайтов страны и ищите в них **события, которые уже есть в игре**. Когда нашлась страница о том же событии, просто добавьте её как ссылку-доказательство. Глубоко перепроверять каждую запись не нужно: достаточно убедиться, что страница о том же событии (дата и место совпадают). Исправлять запись только если страница явно противоречит дате или месту.

## Как добавлять

1. Откройте страницу (WebFetch) и убедитесь, что она о том же событии (дата и место совпадают). Если страница явно противоречит дате или месту, исправьте запись и отметьте это в `data/research-notes/<cc>.md`; если страница не о том событии, запись не трогайте.
2. Добавьте в `evidence` новый элемент `{"source_id", "url", "accessed": "2026-11-12", "supports": "что именно подтверждает"}` и id источника в `source_ids`. Wikipedia-доказательства не удаляйте.
3. Если подтверждает официальный или архивный источник, поставьте `confidence: "high"`.
4. Зарегистрируйте источник в `data/sources/<cc>.json` с `source_type`, `languages`, `location_ids`, `api` (проверенный или нет), лицензией и условиями, как вы их поняли, `status: "accessed"`. Каталог архива, который вы открыли, но где запись подтвердить не удалось, — `catalogued` с причиной в `notes`.
5. Можно добавлять новые события, найденные в архивных хрониках (особенно местные), по общим правилам (`data/RESEARCH_BRIEF.md`, `data/RESEARCH_BRIEF_WORLD_1_2.md`), с `title_en`/`historical_summary_en`.

Экономьте: ищите страницы, которые подтверждают много записей сразу (хроника города за век, хронология архива, перечень законов), правьте JSON пакетно скриптом. Не копируйте архивные тексты, только свой пересказ и ссылку.

## Цель

Владелец: архивные или официальные подтверждения минимум у **55%** проверенных событий страны (12.11.2026). Ищите архивные и официальные публикации **тех же** событий.

## Без массовой выгрузки

Не скачивайте сайты и сканы пачками: один из серверов (Мангейм, западногерманские ежегодники) начал отказывать в соединении после массовой загрузки. Открывайте только нужные страницы, с паузами; если сервер отказывает, остановитесь на нём и отметьте это в заметках.

## Границы

Пишите только в файлы своей страны: `data/historical/<country>/`, `data/contexts/<country>/`, `data/sources/<cc>.json`, `data/research-notes/<cc>.md`. Наследие v0.4 (`content/historical/*`) не трогайте. Не трогайте `data/locations/`, `content/`, `src/`, `public/`, чужие страны. Не запускайте npm. Без вложенных агентов. Сохраняйте файлы после каждого пакета; проверка: `python3 scripts/historical-data/validate/validate.py --country <CC> --quiet-warnings` — 0 ошибок.

## Итог

До 250 слов: сводка `evidence_status.py <CC> --summary` до и после, какие архивы реально дали подтверждения (и сколько), какие оказались недоступны или без нужных материалов, исправленные расхождения, сомнения.
