# Покрытие исторической базы

Сгенерирован `scripts/historical-data/export/export.py` 2026-10-29, набор `world-1.1.0`. Считаются только записи со статусом `verified`, попавшие в браузерные пакеты. Российская линия, унаследованная от v0.4.0 и опубликованная в браузерном манифесте v0.5.0 (`content/historical`), включена в RU.

## Страны

| Страна | События (цель) | Контексты (цель) | Масштабы событий |
|---|---:|---:|---|
| FR | 169 (250) | 12 (125) | municipal 100, national 69 |
| US | 202 (250) | 31 (125) | district 15, municipal 115, national 63, regional 9 |
| GB | 199 (250) | 36 (125) | constituent 13, district 21, municipal 102, national 63 |
| PL | 169 (250) | 43 (125) | municipal 104, national 65 |
| RU | 199 (250) | 43 (125) | district 4, municipal 96, national 92, regional 7 |

Статусы всех авторских записей (включая неэкспортированные): FR:verified 169, GB:verified 199, PL:needs_review 5, PL:verified 169, RU:verified 199, US:needs_review 1, US:verified 202.

## События по десятилетиям

| Страна | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FR | 10 | 12 | 10 | 11 | 32 | 7 | 22 | 17 | 12 | 10 | 13 | 9 | 3 |
| US | 7 | 21 | 16 | 18 | 16 | 24 | 23 | 21 | 9 | 12 | 12 | 13 | 10 |
| GB | 11 | 13 | 5 | 16 | 18 | 15 | 20 | 24 | 12 | 15 | 22 | 15 | 13 |
| PL | 8 | 15 | 9 | 16 | 28 | 14 | 7 | 15 | 13 | 13 | 8 | 17 | 6 |
| RU | 8 | 14 | 12 | 20 | 28 | 20 | 19 | 11 | 9 | 20 | 11 | 19 | 6 |

## Контексты по десятилетиям (запись считается в каждом десятилетии своего периода)

| Страна | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FR | 4 | 4 | 4 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 6 | 6 | 3 |
| US | 17 | 16 | 16 | 18 | 25 | 26 | 26 | 28 | 27 | 27 | 20 | 12 | 11 |
| GB | 6 | 9 | 11 | 13 | 15 | 18 | 17 | 23 | 21 | 23 | 23 | 23 | 14 |
| PL | 1 | 2 | 4 | 6 | 9 | 10 | 9 | 11 | 11 | 19 | 18 | 18 | 17 |
| RU | 1 | 4 | 5 | 6 | 6 | 8 | 9 | 11 | 12 | 11 | 11 | 9 | 6 |

## События по категориям

- **FR**: infrastructure_transport 18, war_conflict 17, culture_leisure 13, women_rights 12, media_communication 11, labor 10, political_change 10, occupation 10, family_law 9, local_economy 8, disaster 7, social_policy 6, education 5, border_administrative 5, housing_urban 4, public_health 4, repression 4, consumer_life 4, migration 3, healthcare 2, sport 2, everyday_life 2, economic_crisis 2, religion 1
- **US**: infrastructure_transport 26, disaster 19, housing_urban 18, local_economy 16, labor 16, war_conflict 16, economic_crisis 15, public_health 14, migration 9, culture_leisure 8, social_policy 7, women_rights 6, political_change 6, education 5, family_law 5, technology 4, media_communication 4, healthcare 3, consumer_life 2, everyday_life 2, repression 1
- **GB**: infrastructure_transport 36, war_conflict 19, local_economy 14, culture_leisure 14, political_change 12, housing_urban 11, social_policy 9, border_administrative 9, consumer_life 9, labor 8, women_rights 7, media_communication 7, education 6, disaster 6, economic_crisis 5, family_law 5, sport 5, environment 5, healthcare 4, migration 3, public_health 3, technology 2
- **PL**: political_change 19, culture_leisure 14, labor 12, repression 12, war_conflict 12, local_economy 10, migration 9, infrastructure_transport 7, border_administrative 7, occupation 7, housing_urban 7, family_law 6, social_policy 6, consumer_life 6, media_communication 5, religion 5, disaster 5, education 4, everyday_life 3, economic_crisis 3, sport 3, women_rights 2, environment 2, technology 1, healthcare 1, public_health 1
- **RU**: political_change 46, infrastructure_transport 29, local_economy 15, disaster 12, culture_leisure 12, everyday_life 10, labor 9, social_policy 8, border_administrative 8, war_conflict 6, education 6, housing_urban 6, consumer_life 5, economic_crisis 4, repression 4, occupation 4, media_communication 3, technology 3, women_rights 2, family_law 2, migration 2, religion 1, public_health 1, environment 1

## Контексты по типам

- **FR**: women_employment 3, appliances 2, work 2, housing 1, communication 1, family_marriage 1, fertility_childlessness 1, demography 1
- **US**: housing 10, demography 9, fertility_childlessness 2, family_marriage 2, women_employment 2, transport 1, education 1, prices_spending 1, wages_income 1, healthcare 1, appliances 1
- **GB**: family_marriage 5, housing 4, demography 4, work 3, retirement 2, prices_spending 2, fertility_childlessness 2, transport 2, communication 2, healthcare 2, women_employment 2, food 2, appliances 1, migration 1, wages_income 1, education 1
- **PL**: demography 14, family_marriage 7, work 7, fertility_childlessness 3, migration 2, food 2, communication 2, education 1, wages_income 1, leisure_culture 1, housing 1, healthcare 1, transport 1
- **RU**: demography 21, housing 7, wages_income 4, education 3, communication 3, work 1, healthcare 1, women_employment 1, consumer_goods 1, fertility_childlessness 1

## События, привязанные к узлу географии

| Узел | Тип | Записей |
|---|---|---:|
| `fr` Франция | state | 69 |
| `fr-lyon` Лион | city | 21 |
| `fr-lille` Лилль | city | 21 |
| `fr-paris` Париж | city | 18 |
| `fr-plozevet` Плозеве | village | 14 |
| `fr-marseille` Марсель | city | 14 |
| `fr-le-creusot` Ле-Крёзо | town | 12 |
| `gb` Великобритания | state | 63 |
| `gb-london` Лондон | city | 33 |
| `gb-birmingham` Бирмингем | city | 32 |
| `gb-manchester` Манчестер | city | 26 |
| `gb-eng` Англия | constituent_country | 13 |
| `gb-corby` Корби | town | 11 |
| `gb-rutland` Ратленд | county | 11 |
| `gb-greater-london` Большой Лондон | county | 4 |
| `gb-lancashire` Ланкашир | county | 2 |
| `gb-west-midlands` Уэст-Мидлендс | metropolitan_county | 2 |
| `gb-greater-manchester` Большой Манчестер | metropolitan_county | 2 |
| `pl` Польша | state | 65 |
| `pl-lodz` Лодзь | city | 27 |
| `pl-warszawa` Варшава | city | 25 |
| `pl-gdansk` Гданьск | city | 25 |
| `pl-krakow` Краков | city | 24 |
| `pl-zalipie` Залипье | village | 4 |
| `ru` Россия | state | 31 |
| `ru-tver` Тверь | city | 30 |
| `ru-moscow` Москва | city | 20 |
| `ru-saint-petersburg` Санкт-Петербург | city | 19 |
| `ru-smolensk` Смоленск | city | 11 |
| `ru-veliky-novgorod` Великий Новгород | city | 11 |
| `ru-empire` Российская республика | state | 8 |
| `ru-torzhok` Торжок | town | 5 |
| `ru-tver-oblast` Тверская область | oblast | 5 |
| `ru-konakovsky-raion` Конаковский район | raion | 4 |
| `ru-smolensk-oblast` Смоленская область | oblast | 2 |
| `su` СССР | state | 53 |
| `us` США | state | 63 |
| `us-new-york-city` Нью-Йорк | city | 40 |
| `us-chicago` Чикаго | city | 36 |
| `us-detroit` Детройт | city | 33 |
| `us-mi-wayne` округ Уэйн | county | 6 |
| `us-marietta` Мариетта | town | 6 |
| `us-oh-holmes` округ Холмс | county | 6 |
| `us-mi` Мичиган | us_state | 4 |
| `us-oh` Огайо | us_state | 3 |
| `us-oh-washington` округ Вашингтон (Огайо) | county | 3 |
| `us-il` Иллинойс | us_state | 1 |
| `us-ny` штат Нью-Йорк | us_state | 1 |

## Унаследованное покрытие населённых пунктов

Число проверенных событий, доступных жительнице места в каждом десятилетии через иерархию на дату события (все уровни; в скобках — без чувствительных). Порог для меню: ≥8 собственных записей места и ≥2 пригодных событий в каждом десятилетии 1920–2020-х.

| Место | Свои | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е | Порог |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `fr-le-creusot` | 12 | 4 (4) | 4 (3) | 3 (3) | 7 (7) | 12 (5) | 5 (5) | 9 (8) | 9 (9) | 8 (8) | 7 (7) | 8 (6) | 3 (3) | 3 (3) | да |
| `fr-lille` | 21 | 4 (4) | 7 (2) | 6 (6) | 7 (7) | 11 (5) | 5 (5) | 12 (11) | 8 (8) | 8 (8) | 8 (8) | 11 (9) | 3 (3) | 3 (3) | да |
| `fr-lyon` | 21 | 5 (5) | 5 (4) | 5 (5) | 9 (9) | 12 (5) | 7 (7) | 11 (10) | 12 (12) | 7 (7) | 7 (7) | 9 (7) | 5 (5) | 3 (3) | да |
| `fr-marseille` | 14 | 4 (4) | 3 (2) | 4 (4) | 8 (7) | 14 (6) | 6 (6) | 11 (10) | 9 (8) | 6 (6) | 6 (6) | 8 (6) | 4 (4) | 3 (3) | да |
| `fr-paris` | 18 | 5 (4) | 4 (3) | 3 (3) | 8 (8) | 11 (5) | 4 (4) | 12 (11) | 10 (10) | 6 (6) | 7 (7) | 9 (7) | 6 (5) | 3 (3) | да |
| `fr-plozevet` | 14 | 4 (4) | 5 (4) | 6 (5) | 9 (9) | 8 (3) | 4 (4) | 14 (13) | 8 (8) | 8 (8) | 6 (6) | 8 (6) | 3 (3) | 3 (3) | да |
| `gb-birmingham` | 32 | 7 (7) | 10 (10) | 4 (4) | 10 (10) | 10 (9) | 8 (8) | 10 (10) | 14 (13) | 4 (2) | 8 (8) | 10 (10) | 9 (9) | 7 (7) | да |
| `gb-corby` | 11 | 4 (4) | 8 (8) | 3 (3) | 9 (9) | 8 (8) | 7 (7) | 9 (9) | 9 (9) | 3 (2) | 7 (7) | 9 (8) | 5 (5) | 7 (7) | да |
| `gb-london` | 33 | 7 (7) | 9 (8) | 3 (3) | 7 (7) | 12 (10) | 11 (9) | 13 (12) | 11 (10) | 9 (6) | 6 (6) | 10 (9) | 9 (7) | 7 (7) | да |
| `gb-manchester` | 26 | 5 (5) | 10 (10) | 4 (4) | 10 (10) | 12 (11) | 7 (7) | 11 (11) | 11 (10) | 5 (3) | 9 (8) | 10 (10) | 7 (6) | 6 (6) | да |
| `pl-gdansk` | 25 | 0 (0) | 0 (0) | 3 (3) | 3 (2) | 9 (5) | 7 (6) | 4 (3) | 9 (7) | 10 (9) | 12 (11) | 4 (4) | 10 (8) | 4 (3) | нет |
| `pl-krakow` | 24 | 1 (1) | 10 (10) | 4 (3) | 9 (2) | 12 (6) | 8 (7) | 4 (2) | 10 (9) | 5 (4) | 10 (10) | 5 (5) | 10 (9) | 5 (4) | нет |
| `pl-lodz` | 27 | 7 (5) | 10 (9) | 5 (4) | 11 (5) | 13 (7) | 7 (6) | 4 (3) | 10 (9) | 8 (7) | 12 (12) | 4 (4) | 9 (8) | 4 (3) | да |
| `pl-warszawa` | 25 | 6 (5) | 9 (8) | 6 (4) | 8 (2) | 11 (4) | 10 (9) | 4 (3) | 10 (9) | 6 (5) | 11 (11) | 4 (4) | 9 (8) | 5 (4) | да |
| `pl-zalipie` | 4 | 1 (1) | 5 (5) | 4 (3) | 7 (2) | 8 (5) | 6 (5) | 4 (3) | 9 (8) | 5 (4) | 10 (10) | 3 (3) | 7 (6) | 4 (3) | нет |
| `ru-moscow` | 20 | 3 (3) | 9 (8) | 7 (6) | 13 (8) | 10 (7) | 11 (11) | 12 (12) | 7 (7) | 6 (6) | 13 (12) | 9 (9) | 9 (8) | 6 (5) | да |
| `ru-saint-petersburg` | 19 | 5 (4) | 10 (8) | 11 (9) | 10 (5) | 9 (6) | 10 (10) | 11 (11) | 8 (8) | 7 (7) | 14 (13) | 9 (9) | 6 (6) | 5 (4) | да |
| `ru-smolensk` | 11 | 4 (4) | 8 (7) | 8 (7) | 10 (5) | 11 (7) | 10 (10) | 10 (10) | 7 (7) | 8 (8) | 13 (12) | 8 (8) | 6 (5) | 5 (4) | да |
| `ru-torzhok` | 5 | 3 (3) | 8 (7) | 7 (6) | 12 (7) | 10 (6) | 9 (9) | 9 (9) | 7 (7) | 7 (7) | 13 (12) | 8 (8) | 8 (8) | 5 (4) | нет |
| `ru-tver` | 30 | 5 (5) | 11 (10) | 8 (7) | 14 (8) | 14 (10) | 14 (14) | 13 (13) | 10 (10) | 8 (8) | 15 (14) | 9 (9) | 9 (9) | 5 (4) | да |
| `ru-veliky-novgorod` | 11 | 3 (3) | 8 (7) | 7 (6) | 10 (5) | 12 (8) | 9 (9) | 10 (10) | 8 (7) | 6 (6) | 14 (13) | 8 (8) | 6 (6) | 5 (4) | да |
| `us-chicago` | 36 | 3 (2) | 9 (5) | 9 (9) | 13 (12) | 9 (7) | 14 (10) | 15 (13) | 12 (11) | 6 (6) | 8 (7) | 8 (7) | 3 (3) | 5 (5) | да |
| `us-detroit` | 33 | 2 (2) | 8 (7) | 13 (13) | 11 (10) | 11 (7) | 14 (12) | 14 (12) | 15 (14) | 7 (7) | 7 (6) | 7 (6) | 6 (5) | 4 (4) | да |
| `us-holmes-county-rural` | 0 | 1 (1) | 5 (3) | 6 (6) | 8 (8) | 8 (6) | 9 (7) | 11 (10) | 10 (8) | 4 (4) | 5 (5) | 6 (5) | 4 (4) | 5 (5) | нет |
| `us-marietta` | 6 | 1 (1) | 7 (5) | 6 (6) | 8 (8) | 9 (7) | 9 (7) | 13 (12) | 11 (9) | 5 (5) | 4 (4) | 5 (4) | 3 (3) | 4 (4) | нет |
| `us-new-york-city` | 40 | 4 (3) | 9 (5) | 7 (7) | 12 (12) | 12 (8) | 11 (9) | 16 (15) | 12 (10) | 6 (5) | 5 (4) | 7 (6) | 5 (4) | 8 (8) | да |

## Пробелы

- Пар «место × десятилетие» ниже порога: 6.
- Десятилетия, где у места нет ни одной местной/районной/региональной записи (только национальный фон):
  - `fr-le-creusot`: 1920, 1930, 1960, 2000, 2010, 2020
  - `fr-lille`: 1930, 2010, 2020
  - `fr-lyon`: 2020
  - `fr-marseille`: 1910, 1980, 1990, 2000, 2020
  - `fr-paris`: 1920, 1950, 1980, 2020
  - `fr-plozevet`: 1950, 1990, 2000, 2010, 2020
  - `gb-corby`: 1900, 1910, 1920, 1940, 1980, 2010
  - `gb-london`: 1920, 1930, 1990
  - `pl-gdansk`: 1900, 1910, 2020
  - `pl-krakow`: 1920, 1980, 1990
  - `pl-lodz`: 2020
  - `pl-zalipie`: 1910, 1920, 1930, 1950, 1980, 1990, 2000, 2010, 2020
  - `ru-moscow`: 1900, 1920, 1970, 1980
  - `ru-saint-petersburg`: 1930, 2020
  - `ru-smolensk`: 1910, 1930, 1970, 2000, 2020
  - `ru-torzhok`: 1900, 1910, 1920, 1960, 1970, 2000, 2020
  - `ru-tver`: 2020
  - `ru-veliky-novgorod`: 1900, 1910, 1920, 1930, 1980, 2000, 2020
  - `us-detroit`: 2020
  - `us-holmes-county-rural`: 1900, 1920, 1930, 1940, 1960, 1980
  - `us-marietta`: 1900, 1920, 1930, 1990, 2000, 2020

## Источники

- Использовано (`accessed`): 97.
- Зарегистрировано, но не использовано: 44: fr_ad_13 (catalogued), fr_ad_nord (catalogued), fr_ad_rhone (catalogued), fr_archives_paris (catalogued), fr_bnf_api (catalogued), fr_britannica (catalogued), fr_data_gouv (catalogued), fr_ined (inaccessible), fr_larousse (catalogued), fr_unesco_whc (inaccessible), fr_vie_publique (catalogued), gb_bna (inaccessible), gb_parliament (inaccessible), gb_tna_discovery (catalogued), gb_ukds (catalogued), gb_vision_of_britain (inaccessible), pl_britannica (inaccessible), pl_culture_pl (inaccessible), pl_fbc (catalogued), pl_ipn_main (catalogued), pl_isap (inaccessible), pl_muzeum_tarnow (inaccessible), pl_muzhp (catalogued), pl_polona (catalogued), pl_pwn (inaccessible), ru_bigenc (catalogued), ru_demoscope (inaccessible), ru_gato (catalogued), ru_glavarchiv (catalogued), ru_historyrussia_docs (catalogued), ru_prozhito (catalogued), ru_rgakfd (catalogued), ru_rosstat (inaccessible), ru_spbarchives (inaccessible), ru_tverlib (catalogued), us_britannica (inaccessible), us_chicago_encyclopedia (inaccessible), us_dol (catalogued), us_ipums (catalogued), us_loc (catalogued), us_nyc_gov (catalogued), us_ohio_history (inaccessible), us_smithsonian (catalogued), us_ssa (inaccessible).
