# Покрытие исторической базы

Сгенерирован `scripts/historical-data/export/export.py` 2026-11-13, набор `world-1.2.0`. Считаются только записи со статусом `verified`, попавшие в браузерные пакеты. Российская линия, унаследованная от v0.4.0 и опубликованная в браузерном манифесте v0.5.0 (`content/historical`), включена в RU.

## Страны

| Страна | События (цель) | Контексты (цель) | Масштабы событий |
|---|---:|---:|---|
| FR | 173 (250) | 12 (125) | municipal 100, national 73 |
| US | 202 (250) | 31 (125) | district 15, municipal 115, national 63, regional 9 |
| GB | 199 (250) | 36 (125) | constituent 13, district 21, municipal 102, national 63 |
| PL | 170 (250) | 43 (125) | municipal 104, national 66 |
| RU | 200 (250) | 43 (125) | district 4, municipal 96, national 93, regional 7 |
| IT | 290 (300) | 46 (150) | district 1, municipal 223, national 61, regional 5 |
| DE | 333 (300) | 59 (150) | constituent 5, municipal 185, national 115, regional 28 |
| CN | 306 (300) | 43 (150) | municipal 191, national 86, regional 29 |
| FI | 254 (300) | 90 (150) | constituent 11, municipal 157, national 81, regional 5 |
| TR | 271 (300) | 96 (150) | municipal 174, national 89, regional 8 |
| RS | 94 (250) | 8 (125) | constituent 5, district 3, municipal 56, national 29, regional 1 |
| HR | 65 (250) | 11 (125) | constituent 12, municipal 44, national 9 |
| SI | 72 (250) | 14 (125) | constituent 8, municipal 52, national 10, regional 2 |
| BA | 0 (250) | 0 (125) | — |
| ME | 0 (250) | 0 (125) | — |
| GR | 0 (250) | 0 (125) | — |
| AT | 0 (250) | 0 (125) | — |
| HU | 0 (250) | 0 (125) | — |
| CZ | 0 (250) | 0 (125) | — |
| SK | 0 (250) | 0 (125) | — |
| PT | 0 (250) | 0 (125) | — |
| IE | 0 (250) | 0 (125) | — |
| ES | 0 (250) | 0 (125) | — |
| AR | 0 (250) | 0 (125) | — |
| CL | 0 (250) | 0 (125) | — |
| BR | 0 (250) | 0 (125) | — |
| CU | 0 (250) | 0 (125) | — |
| CA | 0 (250) | 0 (125) | — |
| AU | 0 (250) | 0 (125) | — |
| ZA | 0 (250) | 0 (125) | — |
| CD | 0 (250) | 0 (125) | — |
| NG | 0 (250) | 0 (125) | — |
| EG | 0 (250) | 0 (125) | — |
| MA | 0 (250) | 0 (125) | — |
| JP | 0 (250) | 0 (125) | — |
| TH | 0 (250) | 0 (125) | — |
| VN | 0 (250) | 0 (125) | — |
| SG | 0 (250) | 0 (125) | — |
| IN | 0 (250) | 0 (125) | — |

Статусы всех авторских записей (включая неэкспортированные): CN:verified 306, DE:verified 333, FI:needs_review 1, FI:verified 254, FR:verified 173, GB:verified 199, HR:verified 65, IT:verified 290, PL:needs_review 5, PL:verified 170, RS:verified 94, RU:verified 200, SI:verified 72, TR:verified 271, US:needs_review 1, US:verified 202.

## Чем подтверждены события

Доля опубликованных событий, у которых есть хотя бы одно доказательство из архива или официального органа (государственный или муниципальный архив, правительство и парламент, официальный вестник, статистическая служба, национальная библиотека, государственный музей, университет), и доля событий, опирающихся только на Wikipedia. Наследие v0.4 (российские записи без поля `evidence`) считается по реестру источников.

| Страна | События | Архив/официальный источник | Только Wikipedia |
|---|---:|---:|---:|
| FR | 173 | 56% | 44% |
| US | 202 | 55% | 42% |
| GB | 199 | 55% | 45% |
| PL | 170 | 56% | 44% |
| RU | 200 | 63% | 30% |
| IT | 290 | 55% | 44% |
| DE | 333 | 55% | 45% |
| CN | 306 | 56% | 44% |
| FI | 254 | 55% | 45% |
| TR | 271 | 55% | 43% |
| RS | 94 | 83% | 0% |
| HR | 65 | 94% | 0% |
| SI | 72 | 99% | 0% |
| BA | 0 | 0% | 0% |
| ME | 0 | 0% | 0% |
| GR | 0 | 0% | 0% |
| AT | 0 | 0% | 0% |
| HU | 0 | 0% | 0% |
| CZ | 0 | 0% | 0% |
| SK | 0 | 0% | 0% |
| PT | 0 | 0% | 0% |
| IE | 0 | 0% | 0% |
| ES | 0 | 0% | 0% |
| AR | 0 | 0% | 0% |
| CL | 0 | 0% | 0% |
| BR | 0 | 0% | 0% |
| CU | 0 | 0% | 0% |
| CA | 0 | 0% | 0% |
| AU | 0 | 0% | 0% |
| ZA | 0 | 0% | 0% |
| CD | 0 | 0% | 0% |
| NG | 0 | 0% | 0% |
| EG | 0 | 0% | 0% |
| MA | 0 | 0% | 0% |
| JP | 0 | 0% | 0% |
| TH | 0 | 0% | 0% |
| VN | 0 | 0% | 0% |
| SG | 0 | 0% | 0% |
| IN | 0 | 0% | 0% |

## События по десятилетиям

| Страна | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FR | 10 | 13 | 10 | 12 | 34 | 7 | 22 | 17 | 12 | 10 | 13 | 9 | 3 |
| US | 7 | 21 | 16 | 18 | 16 | 24 | 23 | 21 | 9 | 12 | 12 | 13 | 10 |
| GB | 11 | 13 | 5 | 16 | 18 | 15 | 20 | 24 | 12 | 15 | 22 | 15 | 13 |
| PL | 8 | 15 | 9 | 16 | 29 | 14 | 7 | 15 | 13 | 13 | 8 | 17 | 6 |
| RU | 8 | 15 | 12 | 20 | 28 | 20 | 19 | 11 | 9 | 20 | 11 | 19 | 6 |
| IT | 20 | 13 | 21 | 16 | 37 | 20 | 29 | 22 | 28 | 25 | 18 | 25 | 16 |
| DE | 16 | 31 | 22 | 24 | 43 | 43 | 36 | 25 | 23 | 29 | 18 | 18 | 5 |
| CN | 13 | 23 | 28 | 23 | 26 | 38 | 16 | 20 | 26 | 19 | 22 | 35 | 17 |
| FI | 22 | 26 | 9 | 22 | 27 | 14 | 29 | 14 | 15 | 19 | 17 | 20 | 20 |
| TR | 11 | 26 | 40 | 22 | 14 | 21 | 16 | 16 | 18 | 21 | 24 | 29 | 13 |
| RS | 12 | 9 | 9 | 9 | 15 | 4 | 8 | 2 | 4 | 9 | 5 | 6 | 2 |
| HR | 7 | 10 | 4 | 2 | 8 | 2 | 6 | 3 | 1 | 12 | 3 | 4 | 3 |
| SI | 6 | 8 | 5 | 3 | 11 | 6 | 3 | 3 | 4 | 10 | 5 | 5 | 3 |
| BA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ME | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| HU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CZ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| SK | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| IE | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ES | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CL | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| BR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ZA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CD | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| NG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| EG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| MA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| JP | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| TH | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| VN | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| SG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| IN | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Контексты по десятилетиям (запись считается в каждом десятилетии своего периода)

| Страна | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FR | 4 | 4 | 4 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 6 | 6 | 3 |
| US | 17 | 16 | 16 | 18 | 25 | 26 | 26 | 28 | 27 | 27 | 20 | 12 | 11 |
| GB | 6 | 9 | 11 | 13 | 15 | 18 | 17 | 23 | 21 | 23 | 23 | 23 | 14 |
| PL | 1 | 2 | 4 | 6 | 9 | 10 | 9 | 11 | 11 | 19 | 18 | 18 | 17 |
| RU | 1 | 4 | 5 | 6 | 6 | 8 | 9 | 11 | 12 | 11 | 11 | 9 | 6 |
| IT | 7 | 7 | 7 | 7 | 6 | 22 | 14 | 13 | 9 | 11 | 12 | 12 | 14 |
| DE | 2 | 6 | 4 | 5 | 13 | 21 | 22 | 29 | 31 | 14 | 10 | 12 | 7 |
| CN | 0 | 1 | 1 | 2 | 5 | 14 | 12 | 14 | 13 | 13 | 15 | 29 | 23 |
| FI | 12 | 12 | 13 | 14 | 14 | 13 | 13 | 32 | 41 | 68 | 75 | 75 | 79 |
| TR | 0 | 1 | 8 | 8 | 9 | 9 | 16 | 17 | 16 | 17 | 18 | 32 | 14 |
| RS | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 3 | 3 | 0 |
| HR | 2 | 2 | 2 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 9 | 0 |
| SI | 0 | 1 | 2 | 2 | 4 | 4 | 5 | 3 | 2 | 4 | 6 | 6 | 4 |
| BA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ME | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| GR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| HU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CZ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| SK | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| PT | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| IE | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ES | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CL | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| BR | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| AU | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ZA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| CD | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| NG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| EG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| MA | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| JP | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| TH | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| VN | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| SG | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| IN | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## События по категориям

- **FR**: war_conflict 21, infrastructure_transport 18, culture_leisure 13, women_rights 12, media_communication 11, labor 10, political_change 10, occupation 10, family_law 9, local_economy 8, disaster 7, social_policy 6, education 5, border_administrative 5, housing_urban 4, public_health 4, repression 4, consumer_life 4, migration 3, healthcare 2, sport 2, everyday_life 2, economic_crisis 2, religion 1
- **US**: infrastructure_transport 26, disaster 19, housing_urban 18, local_economy 16, labor 16, war_conflict 16, economic_crisis 15, public_health 14, migration 9, culture_leisure 8, social_policy 7, women_rights 6, political_change 6, education 5, family_law 5, technology 4, media_communication 4, healthcare 3, consumer_life 2, everyday_life 2, repression 1
- **GB**: infrastructure_transport 36, war_conflict 19, local_economy 14, culture_leisure 14, political_change 12, housing_urban 11, social_policy 9, border_administrative 9, consumer_life 9, labor 8, women_rights 7, media_communication 7, education 6, disaster 6, economic_crisis 5, family_law 5, sport 5, environment 5, healthcare 4, migration 3, public_health 3, technology 2
- **PL**: political_change 19, culture_leisure 14, war_conflict 13, labor 12, repression 12, local_economy 10, migration 9, infrastructure_transport 7, border_administrative 7, occupation 7, housing_urban 7, family_law 6, social_policy 6, consumer_life 6, media_communication 5, religion 5, disaster 5, education 4, everyday_life 3, economic_crisis 3, sport 3, women_rights 2, environment 2, technology 1, healthcare 1, public_health 1
- **RU**: political_change 46, infrastructure_transport 29, local_economy 15, disaster 12, culture_leisure 12, everyday_life 10, labor 9, social_policy 8, border_administrative 8, war_conflict 7, education 6, housing_urban 6, consumer_life 5, economic_crisis 4, repression 4, occupation 4, media_communication 3, technology 3, women_rights 2, family_law 2, migration 2, religion 1, public_health 1, environment 1
- **IT**: culture_leisure 49, infrastructure_transport 45, local_economy 19, labor 17, sport 16, political_change 15, disaster 14, war_conflict 14, housing_urban 13, migration 11, everyday_life 10, education 7, religion 6, repression 6, media_communication 5, social_policy 5, occupation 5, family_law 5, consumer_life 4, public_health 4, women_rights 4, border_administrative 4, environment 4, economic_crisis 3, healthcare 3, technology 2
- **DE**: culture_leisure 34, infrastructure_transport 28, political_change 27, border_administrative 26, local_economy 22, housing_urban 17, everyday_life 16, economic_crisis 16, migration 16, war_conflict 15, education 14, labor 12, social_policy 12, women_rights 11, repression 10, sport 8, media_communication 8, environment 8, consumer_life 7, occupation 6, family_law 5, disaster 4, technology 4, religion 4, public_health 3
- **CN**: political_change 61, local_economy 31, infrastructure_transport 28, border_administrative 27, disaster 22, war_conflict 21, culture_leisure 18, education 13, migration 13, public_health 12, repression 10, housing_urban 7, everyday_life 7, family_law 6, sport 6, technology 5, media_communication 4, occupation 4, labor 2, women_rights 2, environment 2, consumer_life 2, economic_crisis 2, healthcare 1
- **FI**: border_administrative 31, culture_leisure 25, local_economy 23, infrastructure_transport 21, migration 17, social_policy 17, political_change 16, education 16, war_conflict 15, economic_crisis 14, housing_urban 7, consumer_life 7, media_communication 7, sport 6, healthcare 5, labor 4, disaster 4, technology 4, public_health 4, women_rights 3, everyday_life 3, repression 2, family_law 2, religion 1
- **TR**: infrastructure_transport 38, political_change 30, local_economy 25, culture_leisure 24, border_administrative 23, education 23, everyday_life 13, war_conflict 12, migration 12, disaster 11, women_rights 10, repression 9, media_communication 8, economic_crisis 8, occupation 7, sport 4, family_law 3, labor 3, consumer_life 3, housing_urban 2, public_health 2, environment 1
- **RS**: political_change 26, war_conflict 13, infrastructure_transport 12, culture_leisure 7, border_administrative 6, housing_urban 6, education 4, local_economy 4, economic_crisis 3, religion 2, occupation 2, repression 2, media_communication 2, women_rights 1, social_policy 1, everyday_life 1, disaster 1, public_health 1
- **HR**: political_change 12, culture_leisure 7, infrastructure_transport 6, media_communication 5, education 4, war_conflict 4, everyday_life 4, housing_urban 4, technology 3, local_economy 3, economic_crisis 3, disaster 2, public_health 2, women_rights 1, occupation 1, repression 1, sport 1, migration 1, border_administrative 1
- **SI**: political_change 13, infrastructure_transport 8, culture_leisure 8, occupation 7, housing_urban 5, war_conflict 5, public_health 5, education 4, migration 2, local_economy 2, media_communication 2, sport 2, environment 2, consumer_life 2, social_policy 1, religion 1, repression 1, healthcare 1, disaster 1
- **BA**: нет
- **ME**: нет
- **GR**: нет
- **AT**: нет
- **HU**: нет
- **CZ**: нет
- **SK**: нет
- **PT**: нет
- **IE**: нет
- **ES**: нет
- **AR**: нет
- **CL**: нет
- **BR**: нет
- **CU**: нет
- **CA**: нет
- **AU**: нет
- **ZA**: нет
- **CD**: нет
- **NG**: нет
- **EG**: нет
- **MA**: нет
- **JP**: нет
- **TH**: нет
- **VN**: нет
- **SG**: нет
- **IN**: нет

## Контексты по типам

- **FR**: women_employment 3, appliances 2, work 2, housing 1, communication 1, family_marriage 1, fertility_childlessness 1, demography 1
- **US**: housing 10, demography 9, fertility_childlessness 2, family_marriage 2, women_employment 2, transport 1, education 1, prices_spending 1, wages_income 1, healthcare 1, appliances 1
- **GB**: family_marriage 5, housing 4, demography 4, work 3, retirement 2, prices_spending 2, fertility_childlessness 2, transport 2, communication 2, healthcare 2, women_employment 2, food 2, appliances 1, migration 1, wages_income 1, education 1
- **PL**: demography 14, family_marriage 7, work 7, fertility_childlessness 3, migration 2, food 2, communication 2, education 1, wages_income 1, leisure_culture 1, housing 1, healthcare 1, transport 1
- **RU**: demography 21, housing 7, wages_income 4, education 3, communication 3, work 1, healthcare 1, women_employment 1, consumer_goods 1, fertility_childlessness 1
- **IT**: demography 15, education 9, housing 4, fertility_childlessness 3, migration 3, healthcare 2, transport 2, family_marriage 2, communication 2, work 1, wages_income 1, appliances 1, women_employment 1
- **DE**: housing 11, demography 7, family_marriage 6, work 5, migration 5, women_employment 5, wages_income 4, appliances 3, fertility_childlessness 3, retirement 2, prices_spending 2, food 2, social_policy 2, communication 1, leisure_culture 1
- **CN**: demography 17, wages_income 4, housing 3, migration 3, communication 2, work 2, transport 2, appliances 1, food 1, prices_spending 1, women_employment 1, healthcare 1, retirement 1, consumer_goods 1, fertility_childlessness 1, education 1, family_marriage 1
- **FI**: demography 33, work 11, fertility_childlessness 11, education 10, housing 9, healthcare 6, migration 3, social_policy 2, leisure_culture 2, food 1, family_marriage 1, transport 1
- **TR**: demography 30, migration 11, education 9, fertility_childlessness 7, wages_income 7, prices_spending 7, healthcare 7, communication 7, work 5, women_employment 4, transport 1, family_marriage 1
- **RS**: family_marriage 3, social_policy 2, food 1, leisure_culture 1, prices_spending 1
- **HR**: housing 3, family_marriage 2, fertility_childlessness 1, communication 1, wages_income 1, retirement 1, demography 1, education 1
- **SI**: family_marriage 3, housing 3, demography 2, fertility_childlessness 2, consumer_goods 1, wages_income 1, work 1, transport 1
- **BA**: нет
- **ME**: нет
- **GR**: нет
- **AT**: нет
- **HU**: нет
- **CZ**: нет
- **SK**: нет
- **PT**: нет
- **IE**: нет
- **ES**: нет
- **AR**: нет
- **CL**: нет
- **BR**: нет
- **CU**: нет
- **CA**: нет
- **AU**: нет
- **ZA**: нет
- **CD**: нет
- **NG**: нет
- **EG**: нет
- **MA**: нет
- **JP**: нет
- **TH**: нет
- **VN**: нет
- **SG**: нет
- **IN**: нет

## События, привязанные к узлу географии

| Узел | Тип | Записей |
|---|---|---:|
| `cn` Китай | state | 56 |
| `cn-beijing` Пекин | city | 32 |
| `cn-shanghai` Шанхай | city | 31 |
| `cn-guangzhou` Гуанчжоу | city | 24 |
| `cn-wuhan` Ухань | city | 22 |
| `cn-chengdu` Чэнду | city | 18 |
| `cn-xian` Сиань | city | 15 |
| `cn-zigong` Цзыгун | town | 15 |
| `cn-guanghan` Гуанхань | rural_area | 12 |
| `cn-shenzhen` Шэньчжэнь | town | 12 |
| `cn-sichuan` Сычуань | province | 11 |
| `cn-xiaogang` Сяоган | village | 10 |
| `cn-guangdong` Гуандун | province | 9 |
| `cn-hubei` Хубэй | province | 3 |
| `cn-shaanxi` Шэньси | province | 3 |
| `cn-beijing-municipality` Пекин (город центрального подчинения) | region | 2 |
| `cn-anhui` Аньхой | province | 1 |
| `de` Германия | state | 48 |
| `de-leipzig` Лейпциг | city | 22 |
| `de-hamburg` Гамбург | city | 22 |
| `de-berlin` Берлин | city | 21 |
| `de-muenchen` Мюнхен | city | 21 |
| `de-koeln` Кёльн | city | 21 |
| `de-halle` Галле | city | 16 |
| `de-eisenhuettenstadt` Айзенхюттенштадт | town | 12 |
| `de-oberammergau` Обераммергау | village | 12 |
| `de-wolfsburg` Вольфсбург | town | 11 |
| `de-altmark` Альтмарк | rural_area | 11 |
| `de-berlin-west` Западный Берлин | city | 10 |
| `de-berlin-east` Восточный Берлин | city | 10 |
| `de-nrw` Северный Рейн-Вестфалия | land | 9 |
| `de-bayern` Бавария | land | 4 |
| `de-sachsen-anhalt` Саксония-Анхальт | land | 4 |
| `de-sachsen` Саксония | land | 4 |
| `de-zone-soviet` Советская зона оккупации | occupation_zone | 3 |
| `de-land-hamburg` Гамбург (земля) | land | 2 |
| `de-zone-us` Американская зона оккупации | occupation_zone | 2 |
| `de-zone-british` Британская зона оккупации | occupation_zone | 2 |
| `de-brandenburg` Бранденбург | land | 2 |
| `de-niedersachsen` Нижняя Саксония | land | 2 |
| `de-prov-rhine` Провинция Северный Рейн | province | 1 |
| `de-prov-halle-merseburg` Провинция Галле-Мерзебург | province | 1 |
| `de-prov-magdeburg` Провинция Магдебург | province | 1 |
| `de-zone-french` Французская зона оккупации | occupation_zone | 1 |
| `de-bezirk-halle` Округ Галле | region | 1 |
| `de-land-berlin` Берлин (земля) | land | 1 |
| `fi` Финляндия | state | 81 |
| `fi-helsinki` Хельсинки | city | 38 |
| `fi-tampere` Тампере | city | 28 |
| `fi-oulu` Оулу | city | 21 |
| `fi-turku` Турку | city | 20 |
| `fi-jyvaskyla` Ювяскюля | city | 15 |
| `fi-grand-duchy` Великое княжество Финляндское | constituent_country | 11 |
| `fi-tyrnava` Тюрнявя | rural_area | 9 |
| `fi-varkaus` Варкаус | town | 9 |
| `fi-rauma` Раума | town | 9 |
| `fi-ilomantsi` Иломантси | rural_area | 8 |
| `fi-laani-uusimaa` губерния Уусимаа | province | 2 |
| `fi-laani-pohjois-karjala` губерния Северная Карелия | province | 1 |
| `fi-laani-keski-suomi` губерния Центральная Финляндия | province | 1 |
| `fi-uusimaa` Уусимаа | region | 1 |
| `fr` Франция | state | 73 |
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
| `hr-zagreb` Загреб | city | 44 |
| `hr-republic` Республика Хорватия | republic | 9 |
| `hr` Хорватия | state | 8 |
| `hr-croatia-slavonia` Хорватия и Славония | constituent_country | 3 |
| `hr-ndh` Независимое государство Хорватия | transitional_administration | 1 |
| `it` Италия | state | 61 |
| `it-torino` Турин | city | 35 |
| `it-palermo` Палермо | city | 28 |
| `it-firenze` Флоренция | city | 28 |
| `it-napoli` Неаполь | city | 26 |
| `it-milano` Милан | city | 26 |
| `it-roma` Рим | city | 19 |
| `it-ivrea` Иврея | town | 15 |
| `it-sesto-san-giovanni` Сесто-Сан-Джованни | town | 14 |
| `it-gibellina` Джибеллина | village | 13 |
| `it-matera` Матера | town | 10 |
| `it-santangelo-dei-lombardi` Сант-Анджело-деи-Ломбарди | village | 9 |
| `it-sicilia` Сицилия | region | 2 |
| `it-campania` Кампания | region | 2 |
| `it-basilicata` Базиликата | region | 2 |
| `it-prov-matera` провинция Матера | provincia | 1 |
| `it-lombardia` Ломбардия | region | 1 |
| `pl` Польша | state | 66 |
| `pl-lodz` Лодзь | city | 27 |
| `pl-warszawa` Варшава | city | 25 |
| `pl-gdansk` Гданьск | city | 25 |
| `pl-krakow` Краков | city | 24 |
| `pl-zalipie` Залипье | village | 4 |
| `rs-beograd` Белград | city | 27 |
| `rs-subotica` Суботица | city | 15 |
| `rs-novi-sad` Нови-Сад | city | 15 |
| `rs-republic` Республика Сербия | republic | 5 |
| `rs` Сербия | state | 4 |
| `rs-bacs-bodrog` медье Бач-Бодрог | county | 3 |
| `rs-vojvodina` Воеводина | province | 1 |
| `ru` Россия | state | 32 |
| `ru-tver` Тверь | city | 30 |
| `ru-moscow` Москва | city | 20 |
| `ru-saint-petersburg` Санкт-Петербург | city | 19 |
| `ru-smolensk` Смоленск | city | 11 |
| `ru-veliky-novgorod` Великий Новгород | city | 11 |
| `ru-empire` Российская республика | state | 9 |
| `ru-torzhok` Торжок | town | 5 |
| `ru-tver-oblast` Тверская область | oblast | 5 |
| `ru-konakovsky-raion` Конаковский район | raion | 4 |
| `ru-smolensk-oblast` Смоленская область | oblast | 2 |
| `si-ljubljana` Любляна | city | 52 |
| `si` Словения | state | 10 |
| `si-republic` Республика Словения | republic | 8 |
| `si-ljubljana-province` Люблянская провинция | region | 2 |
| `state-de-reich` Германия | state | 29 |
| `state-gdr` ГДР | state | 27 |
| `state-cn-roc` Китайская Республика | state | 22 |
| `state-ottoman` Османская империя | state | 14 |
| `state-de-empire` Германская империя | state | 14 |
| `state-yu` Социалистическая Федеративная Республика Югославия | state | 14 |
| `state-cn-qing` Империя Цин | state | 8 |
| `state-yu-fr` Союзная Республика Югославия | state | 6 |
| `state-rs-kingdom` Королевство Сербия | state | 5 |
| `su` СССР | state | 53 |
| `tr` Турция | state | 75 |
| `tr-istanbul` Стамбул | city | 38 |
| `tr-ankara` Анкара | city | 27 |
| `tr-izmir` Измир | city | 22 |
| `tr-gaziantep` Газиантеп | city | 18 |
| `tr-bursa` Бурса | city | 18 |
| `tr-konya` Конья | city | 12 |
| `tr-zonguldak` Зонгулдак | town | 11 |
| `tr-karabuk` Карабюк | town | 10 |
| `tr-cumra` Чумра | rural_area | 9 |
| `tr-pasinler` Пасинлер | rural_area | 9 |
| `tr-il-bursa` провинция Бурса | province | 2 |
| `tr-il-zonguldak` провинция Зонгулдак | province | 2 |
| `tr-il-konya` провинция Конья | province | 2 |
| `tr-vil-konya` Конийский вилайет | province | 1 |
| `tr-vil-erzurum` Эрзурумский вилайет | province | 1 |
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

## Собственные записи узлов по десятилетиям

Только события, привязанные к самому узлу (без наследования).

| Узел | Тип | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `cn` | state | 0 | 0 | 0 | 0 | 1 | 9 | 6 | 8 | 6 | 4 | 6 | 7 | 9 |
| `cn-anhui` | province | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `cn-beijing` | city | 3 | 4 | 4 | 2 | 4 | 2 | 3 | 2 | 2 | 2 | 2 | 2 | 0 |
| `cn-beijing-municipality` | region | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `cn-chengdu` | city | 0 | 1 | 3 | 1 | 2 | 2 | 2 | 0 | 2 | 0 | 2 | 3 | 0 |
| `cn-guangdong` | province | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 1 | 1 | 0 | 2 | 1 | 0 |
| `cn-guanghan` | rural_area | 0 | 1 | 1 | 0 | 0 | 2 | 0 | 2 | 4 | 0 | 1 | 0 | 1 |
| `cn-guangzhou` | city | 1 | 2 | 4 | 5 | 1 | 3 | 1 | 0 | 1 | 3 | 1 | 2 | 0 |
| `cn-hubei` | province | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| `cn-shaanxi` | province | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| `cn-shanghai` | city | 2 | 2 | 5 | 2 | 2 | 4 | 1 | 0 | 1 | 4 | 1 | 6 | 1 |
| `cn-shenzhen` | town | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 2 | 3 | 1 | 0 | 1 | 0 |
| `cn-sichuan` | province | 1 | 2 | 0 | 1 | 0 | 2 | 1 | 0 | 1 | 1 | 1 | 1 | 0 |
| `cn-wuhan` | city | 0 | 1 | 2 | 3 | 3 | 4 | 1 | 0 | 1 | 1 | 2 | 4 | 0 |
| `cn-xian` | city | 0 | 1 | 1 | 2 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 4 | 2 |
| `cn-xiaogang` | village | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 3 | 0 | 0 | 2 | 3 | 1 |
| `cn-zigong` | town | 0 | 0 | 0 | 2 | 3 | 1 | 0 | 1 | 3 | 2 | 1 | 1 | 1 |
| `de` | state | 0 | 0 | 0 | 0 | 2 | 12 | 8 | 5 | 3 | 7 | 4 | 5 | 2 |
| `de-altmark` | rural_area | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 2 | 1 | 2 | 3 | 0 | 0 |
| `de-bayern` | land | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 |
| `de-berlin` | city | 2 | 2 | 4 | 2 | 6 | 0 | 0 | 0 | 0 | 3 | 1 | 1 | 0 |
| `de-berlin-east` | city | 0 | 0 | 0 | 0 | 0 | 3 | 3 | 1 | 3 | 0 | 0 | 0 | 0 |
| `de-berlin-west` | city | 0 | 0 | 0 | 0 | 1 | 2 | 5 | 1 | 1 | 0 | 0 | 0 | 0 |
| `de-bezirk-halle` | region | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-brandenburg` | land | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 |
| `de-eisenhuettenstadt` | town | 1 | 0 | 1 | 0 | 1 | 3 | 1 | 0 | 2 | 2 | 0 | 0 | 1 |
| `de-halle` | city | 1 | 1 | 1 | 0 | 2 | 2 | 3 | 1 | 0 | 3 | 0 | 2 | 0 |
| `de-hamburg` | city | 2 | 3 | 2 | 1 | 3 | 1 | 3 | 2 | 2 | 0 | 1 | 2 | 0 |
| `de-koeln` | city | 0 | 3 | 3 | 1 | 4 | 3 | 0 | 2 | 1 | 1 | 2 | 1 | 0 |
| `de-land-berlin` | land | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `de-land-hamburg` | land | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `de-leipzig` | city | 3 | 2 | 1 | 1 | 2 | 1 | 4 | 1 | 2 | 1 | 1 | 2 | 1 |
| `de-muenchen` | city | 2 | 3 | 2 | 3 | 2 | 1 | 1 | 2 | 1 | 1 | 2 | 1 | 0 |
| `de-niedersachsen` | land | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 |
| `de-nrw` | land | 0 | 0 | 0 | 0 | 1 | 1 | 3 | 2 | 1 | 0 | 0 | 1 | 0 |
| `de-oberammergau` | village | 1 | 0 | 1 | 2 | 1 | 1 | 0 | 1 | 1 | 1 | 1 | 1 | 1 |
| `de-prov-halle-merseburg` | province | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-prov-magdeburg` | province | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-prov-rhine` | province | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-sachsen` | land | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 1 | 0 |
| `de-sachsen-anhalt` | land | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `de-wolfsburg` | town | 0 | 0 | 0 | 1 | 2 | 2 | 1 | 2 | 1 | 0 | 1 | 1 | 0 |
| `de-zone-british` | occupation_zone | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-zone-french` | occupation_zone | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-zone-soviet` | occupation_zone | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `de-zone-us` | occupation_zone | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fi` | state | 0 | 6 | 4 | 6 | 12 | 5 | 8 | 4 | 5 | 8 | 7 | 7 | 9 |
| `fi-grand-duchy` | constituent_country | 8 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fi-helsinki` | city | 4 | 4 | 0 | 5 | 1 | 3 | 4 | 3 | 4 | 3 | 2 | 4 | 1 |
| `fi-ilomantsi` | rural_area | 1 | 0 | 0 | 0 | 3 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | 1 |
| `fi-jyvaskyla` | city | 1 | 2 | 1 | 1 | 1 | 1 | 3 | 0 | 1 | 1 | 1 | 1 | 1 |
| `fi-laani-keski-suomi` | province | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fi-laani-pohjois-karjala` | province | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fi-laani-uusimaa` | province | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `fi-oulu` | city | 2 | 4 | 0 | 4 | 2 | 2 | 2 | 0 | 1 | 1 | 2 | 1 | 0 |
| `fi-rauma` | town | 0 | 0 | 0 | 0 | 1 | 2 | 0 | 1 | 0 | 2 | 1 | 1 | 1 |
| `fi-tampere` | city | 3 | 2 | 0 | 4 | 3 | 0 | 5 | 3 | 2 | 2 | 1 | 0 | 3 |
| `fi-turku` | city | 2 | 2 | 1 | 2 | 0 | 1 | 2 | 2 | 1 | 2 | 0 | 4 | 1 |
| `fi-tyrnava` | rural_area | 1 | 1 | 1 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 2 | 0 | 1 |
| `fi-uusimaa` | region | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `fi-varkaus` | town | 0 | 2 | 2 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 1 |
| `fr` | state | 3 | 4 | 3 | 8 | 9 | 4 | 9 | 7 | 6 | 6 | 8 | 3 | 3 |
| `fr-le-creusot` | town | 0 | 1 | 0 | 0 | 5 | 0 | 0 | 2 | 2 | 1 | 0 | 0 | 0 |
| `fr-lille` | city | 1 | 4 | 3 | 0 | 4 | 1 | 3 | 0 | 1 | 1 | 3 | 0 | 0 |
| `fr-lyon` | city | 2 | 1 | 1 | 1 | 4 | 2 | 1 | 4 | 1 | 1 | 1 | 2 | 0 |
| `fr-marseille` | city | 1 | 0 | 1 | 1 | 7 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 0 |
| `fr-paris` | city | 2 | 1 | 0 | 1 | 4 | 0 | 3 | 2 | 0 | 1 | 1 | 3 | 0 |
| `fr-plozevet` | village | 1 | 2 | 2 | 1 | 1 | 0 | 5 | 0 | 2 | 0 | 0 | 0 | 0 |
| `gb` | state | 4 | 8 | 3 | 4 | 7 | 5 | 7 | 6 | 3 | 5 | 4 | 3 | 4 |
| `gb-birmingham` | city | 3 | 2 | 1 | 3 | 2 | 2 | 2 | 5 | 1 | 1 | 4 | 4 | 2 |
| `gb-corby` | town | 0 | 0 | 0 | 2 | 0 | 1 | 1 | 1 | 0 | 1 | 3 | 0 | 2 |
| `gb-eng` | constituent_country | 0 | 0 | 0 | 3 | 1 | 1 | 1 | 2 | 0 | 1 | 2 | 1 | 1 |
| `gb-greater-london` | county | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 |
| `gb-greater-manchester` | metropolitan_county | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |
| `gb-lancashire` | county | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `gb-london` | city | 3 | 1 | 0 | 0 | 4 | 5 | 4 | 3 | 5 | 0 | 3 | 4 | 1 |
| `gb-manchester` | city | 1 | 1 | 1 | 3 | 3 | 1 | 3 | 3 | 2 | 3 | 3 | 2 | 0 |
| `gb-rutland` | county | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 3 | 0 | 3 | 1 | 1 | 1 |
| `gb-west-midlands` | metropolitan_county | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |
| `hr` | state | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 1 | 2 | 2 |
| `hr-croatia-slavonia` | constituent_country | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `hr-ndh` | transitional_administration | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `hr-republic` | republic | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 2 | 0 | 5 | 0 | 0 | 0 |
| `hr-zagreb` | city | 7 | 7 | 4 | 2 | 6 | 2 | 5 | 1 | 1 | 4 | 2 | 2 | 1 |
| `it` | state | 5 | 6 | 5 | 4 | 7 | 5 | 4 | 8 | 4 | 3 | 3 | 3 | 4 |
| `it-basilicata` | region | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `it-campania` | region | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 |
| `it-firenze` | city | 2 | 0 | 1 | 3 | 4 | 2 | 3 | 2 | 2 | 2 | 2 | 4 | 1 |
| `it-gibellina` | village | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 4 | 1 | 0 | 2 | 2 |
| `it-ivrea` | town | 1 | 1 | 2 | 0 | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 1 |
| `it-lombardia` | region | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `it-matera` | town | 0 | 0 | 1 | 0 | 2 | 1 | 1 | 0 | 2 | 1 | 0 | 2 | 0 |
| `it-milano` | city | 2 | 1 | 3 | 3 | 1 | 1 | 4 | 1 | 0 | 4 | 3 | 2 | 1 |
| `it-napoli` | city | 3 | 0 | 2 | 1 | 4 | 2 | 3 | 2 | 2 | 2 | 2 | 3 | 0 |
| `it-palermo` | city | 3 | 1 | 1 | 3 | 4 | 2 | 3 | 2 | 1 | 3 | 1 | 2 | 2 |
| `it-prov-matera` | provincia | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `it-roma` | city | 0 | 2 | 1 | 0 | 3 | 1 | 2 | 1 | 1 | 3 | 1 | 3 | 1 |
| `it-santangelo-dei-lombardi` | village | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 3 | 1 | 1 | 0 | 2 |
| `it-sesto-san-giovanni` | town | 3 | 1 | 2 | 0 | 3 | 2 | 0 | 1 | 0 | 1 | 0 | 1 | 0 |
| `it-sicilia` | region | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `it-torino` | city | 1 | 1 | 3 | 2 | 5 | 2 | 5 | 1 | 6 | 2 | 4 | 2 | 1 |
| `pl` | state | 0 | 5 | 3 | 6 | 6 | 6 | 3 | 8 | 5 | 10 | 3 | 7 | 4 |
| `pl-gdansk` | city | 0 | 0 | 3 | 3 | 7 | 1 | 0 | 1 | 5 | 1 | 1 | 3 | 0 |
| `pl-krakow` | city | 1 | 5 | 0 | 2 | 5 | 2 | 1 | 2 | 0 | 0 | 2 | 3 | 1 |
| `pl-lodz` | city | 4 | 3 | 1 | 4 | 6 | 1 | 1 | 1 | 2 | 1 | 1 | 2 | 0 |
| `pl-warszawa` | city | 3 | 2 | 2 | 1 | 4 | 4 | 1 | 2 | 1 | 1 | 1 | 2 | 1 |
| `pl-zalipie` | village | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| `rs` | state | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 |
| `rs-bacs-bodrog` | county | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `rs-beograd` | city | 2 | 2 | 4 | 6 | 5 | 1 | 2 | 1 | 0 | 1 | 1 | 2 | 0 |
| `rs-novi-sad` | city | 2 | 2 | 0 | 1 | 3 | 0 | 2 | 0 | 1 | 1 | 1 | 2 | 0 |
| `rs-republic` | republic | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 2 | 0 | 0 | 0 |
| `rs-subotica` | city | 4 | 2 | 2 | 1 | 1 | 1 | 2 | 0 | 0 | 1 | 0 | 1 | 0 |
| `rs-vojvodina` | province | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `ru` | state | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 8 | 8 | 5 | 5 |
| `ru-empire` | state | 3 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `ru-konakovsky-raion` | raion | 0 | 0 | 0 | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| `ru-moscow` | city | 0 | 1 | 0 | 3 | 3 | 3 | 3 | 0 | 0 | 1 | 1 | 4 | 1 |
| `ru-saint-petersburg` | city | 2 | 2 | 3 | 0 | 2 | 2 | 2 | 1 | 1 | 2 | 1 | 1 | 0 |
| `ru-smolensk` | city | 1 | 0 | 1 | 0 | 3 | 2 | 1 | 0 | 1 | 1 | 0 | 1 | 0 |
| `ru-smolensk-oblast` | oblast | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| `ru-torzhok` | town | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 3 | 0 |
| `ru-tver` | city | 2 | 3 | 1 | 3 | 4 | 4 | 3 | 2 | 0 | 1 | 1 | 4 | 0 |
| `ru-tver-oblast` | oblast | 0 | 0 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| `ru-veliky-novgorod` | city | 0 | 0 | 0 | 0 | 5 | 1 | 1 | 1 | 0 | 2 | 0 | 1 | 0 |
| `si` | state | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 3 | 2 | 3 |
| `si-ljubljana` | city | 6 | 8 | 5 | 3 | 9 | 5 | 3 | 3 | 4 | 1 | 2 | 3 | 0 |
| `si-ljubljana-province` | region | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `si-republic` | republic | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 7 | 0 | 0 | 0 |
| `state-cn-qing` | state | 6 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-cn-roc` | state | 0 | 6 | 7 | 3 | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-de-empire` | state | 4 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-de-reich` | state | 0 | 7 | 6 | 12 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-gdr` | state | 0 | 0 | 0 | 0 | 1 | 9 | 5 | 4 | 4 | 4 | 0 | 0 | 0 |
| `state-ottoman` | state | 5 | 8 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-rs-kingdom` | state | 2 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `state-yu` | state | 0 | 1 | 3 | 1 | 5 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 |
| `state-yu-fr` | state | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 4 | 2 | 0 | 0 |
| `su` | state | 0 | 0 | 5 | 9 | 7 | 8 | 8 | 7 | 5 | 4 | 0 | 0 | 0 |
| `tr` | state | 0 | 0 | 12 | 9 | 5 | 6 | 6 | 5 | 6 | 7 | 6 | 7 | 6 |
| `tr-ankara` | city | 0 | 1 | 5 | 3 | 3 | 3 | 1 | 2 | 2 | 1 | 3 | 3 | 0 |
| `tr-bursa` | city | 0 | 1 | 4 | 1 | 0 | 2 | 2 | 3 | 1 | 1 | 1 | 2 | 0 |
| `tr-cumra` | rural_area | 0 | 1 | 1 | 1 | 0 | 0 | 1 | 0 | 1 | 2 | 0 | 2 | 0 |
| `tr-gaziantep` | city | 2 | 2 | 4 | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 2 | 4 | 1 |
| `tr-il-bursa` | province | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `tr-il-konya` | province | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| `tr-il-zonguldak` | province | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 |
| `tr-istanbul` | city | 2 | 7 | 4 | 0 | 3 | 5 | 2 | 3 | 3 | 2 | 3 | 4 | 0 |
| `tr-izmir` | city | 2 | 2 | 3 | 1 | 1 | 2 | 0 | 1 | 2 | 2 | 4 | 1 | 1 |
| `tr-karabuk` | town | 0 | 0 | 1 | 4 | 0 | 1 | 0 | 0 | 0 | 2 | 1 | 0 | 1 |
| `tr-konya` | city | 0 | 0 | 2 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 3 | 2 | 1 |
| `tr-pasinler` | rural_area | 0 | 1 | 2 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 0 | 2 | 0 |
| `tr-vil-erzurum` | province | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `tr-vil-konya` | province | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `tr-zonguldak` | town | 0 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 1 | 2 | 0 | 1 | 1 |
| `us` | state | 1 | 4 | 5 | 6 | 7 | 7 | 10 | 5 | 3 | 4 | 5 | 2 | 4 |
| `us-chicago` | city | 2 | 4 | 3 | 5 | 1 | 6 | 4 | 3 | 1 | 3 | 2 | 1 | 1 |
| `us-detroit` | city | 1 | 2 | 6 | 1 | 3 | 5 | 2 | 4 | 2 | 2 | 2 | 3 | 0 |
| `us-il` | us_state | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| `us-marietta` | town | 0 | 2 | 0 | 0 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| `us-mi` | us_state | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| `us-mi-wayne` | county | 0 | 2 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 0 |
| `us-new-york-city` | city | 3 | 5 | 1 | 4 | 4 | 3 | 5 | 4 | 2 | 1 | 2 | 2 | 4 |
| `us-ny` | us_state | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `us-oh` | us_state | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| `us-oh-holmes` | county | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 2 | 1 |
| `us-oh-washington` | county | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | 0 |

## Унаследованное покрытие населённых пунктов

Число проверенных событий, доступных жительнице места в каждом десятилетии через иерархию на дату события (все уровни; в скобках — без чувствительных). Порог для меню: ≥8 собственных записей места и ≥2 пригодных событий в каждом десятилетии 1920–2020-х.

| Место | Свои | 1900е | 1910е | 1920е | 1930е | 1940е | 1950е | 1960е | 1970е | 1980е | 1990е | 2000е | 2010е | 2020е | Порог |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `cn-beijing` | 32 | 9 (7) | 11 (11) | 11 (10) | 5 (4) | 11 (8) | 12 (9) | 11 (8) | 14 (12) | 9 (8) | 7 (7) | 10 (9) | 10 (8) | 9 (7) | да |
| `cn-chengdu` | 18 | 7 (6) | 10 (8) | 11 (10) | 6 (5) | 9 (8) | 13 (10) | 12 (8) | 11 (10) | 10 (9) | 5 (5) | 10 (7) | 11 (10) | 9 (7) | да |
| `cn-guanghan` | 12 | 7 (6) | 10 (9) | 9 (8) | 5 (4) | 7 (6) | 13 (10) | 10 (7) | 13 (12) | 12 (11) | 5 (5) | 9 (7) | 8 (7) | 10 (8) | да |
| `cn-guangzhou` | 24 | 7 (6) | 10 (9) | 12 (10) | 9 (7) | 8 (6) | 12 (10) | 9 (7) | 12 (11) | 9 (9) | 7 (7) | 10 (9) | 10 (9) | 9 (7) | да |
| `cn-shanghai` | 31 | 8 (7) | 9 (9) | 12 (10) | 5 (3) | 8 (7) | 13 (11) | 9 (6) | 11 (10) | 8 (8) | 8 (8) | 8 (7) | 13 (10) | 10 (7) | да |
| `cn-shenzhen` | 12 | 6 (5) | 8 (8) | 8 (8) | 4 (3) | 8 (6) | 12 (9) | 9 (6) | 15 (13) | 12 (11) | 5 (5) | 9 (8) | 9 (8) | 9 (7) | да |
| `cn-wuhan` | 22 | 6 (5) | 8 (8) | 9 (9) | 7 (4) | 10 (7) | 13 (10) | 9 (6) | 11 (10) | 8 (8) | 5 (5) | 9 (7) | 11 (8) | 12 (8) | да |
| `cn-xian` | 15 | 6 (5) | 8 (7) | 8 (8) | 6 (5) | 8 (7) | 11 (8) | 10 (7) | 12 (11) | 8 (8) | 4 (4) | 8 (7) | 11 (10) | 11 (8) | да |
| `cn-xiaogang` | 10 | 6 (5) | 7 (7) | 7 (7) | 3 (3) | 6 (5) | 11 (7) | 10 (6) | 14 (13) | 7 (7) | 4 (4) | 9 (8) | 10 (9) | 10 (8) | да |
| `cn-zigong` | 15 | 7 (6) | 9 (8) | 8 (7) | 7 (5) | 10 (8) | 12 (9) | 10 (7) | 12 (11) | 11 (10) | 7 (7) | 9 (7) | 9 (8) | 10 (8) | да |
| `de-altmark` | 11 | 4 (4) | 17 (16) | 6 (6) | 12 (8) | 11 (9) | 11 (9) | 6 (5) | 6 (6) | 5 (5) | 14 (14) | 7 (7) | 5 (5) | 2 (2) | да |
| `de-berlin` | 21 | 6 (6) | 19 (18) | 10 (10) | 14 (10) | 9 (6) | 12 (10) | 8 (6) | 5 (5) | 4 (4) | 10 (10) | 5 (5) | 6 (6) | 2 (2) | да |
| `de-berlin-east` | 10 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 1 (1) | 12 (10) | 8 (6) | 5 (5) | 7 (7) | 4 (4) | 0 (0) | 0 (0) | 0 (0) | нет |
| `de-berlin-west` | 10 | 0 (0) | 0 (0) | 0 (0) | 0 (0) | 3 (3) | 14 (14) | 13 (12) | 6 (6) | 4 (4) | 0 (0) | 0 (0) | 0 (0) | 0 (0) | нет |
| `de-eisenhuettenstadt` | 12 | 5 (5) | 17 (16) | 7 (7) | 12 (8) | 9 (7) | 12 (10) | 6 (5) | 4 (4) | 6 (6) | 15 (15) | 4 (4) | 5 (5) | 3 (3) | да |
| `de-halle` | 16 | 5 (5) | 18 (17) | 7 (7) | 12 (8) | 12 (10) | 13 (11) | 8 (7) | 5 (5) | 4 (4) | 15 (15) | 5 (5) | 7 (6) | 2 (2) | да |
| `de-hamburg` | 22 | 6 (6) | 20 (19) | 8 (7) | 14 (10) | 11 (10) | 13 (13) | 11 (10) | 7 (7) | 6 (6) | 7 (7) | 5 (5) | 7 (7) | 2 (2) | да |
| `de-koeln` | 21 | 4 (4) | 20 (19) | 10 (9) | 13 (9) | 13 (11) | 16 (16) | 11 (11) | 9 (9) | 5 (5) | 9 (9) | 6 (6) | 7 (6) | 2 (2) | да |
| `de-leipzig` | 22 | 7 (7) | 19 (18) | 7 (7) | 13 (9) | 11 (9) | 10 (8) | 9 (7) | 5 (5) | 6 (6) | 13 (13) | 6 (5) | 8 (7) | 3 (3) | да |
| `de-muenchen` | 21 | 6 (6) | 20 (18) | 8 (7) | 15 (10) | 11 (9) | 13 (13) | 10 (10) | 7 (7) | 5 (4) | 9 (9) | 6 (6) | 6 (6) | 2 (2) | да |
| `de-oberammergau` | 12 | 5 (5) | 17 (16) | 7 (7) | 14 (10) | 10 (9) | 13 (13) | 9 (9) | 6 (6) | 5 (4) | 9 (9) | 5 (5) | 6 (6) | 3 (3) | да |
| `de-wolfsburg` | 11 | 0 (0) | 0 (0) | 0 (0) | 4 (3) | 10 (8) | 14 (14) | 9 (9) | 7 (7) | 4 (4) | 8 (8) | 6 (6) | 6 (6) | 2 (2) | нет |
| `fi-helsinki` | 38 | 15 (13) | 20 (17) | 5 (5) | 12 (10) | 17 (14) | 11 (11) | 12 (12) | 9 (9) | 9 (9) | 11 (11) | 10 (10) | 12 (12) | 11 (11) | да |
| `fi-ilomantsi` | 8 | 12 (10) | 16 (13) | 5 (5) | 7 (6) | 17 (13) | 6 (6) | 10 (10) | 6 (6) | 6 (6) | 9 (9) | 9 (9) | 10 (10) | 11 (11) | да |
| `fi-jyvaskyla` | 15 | 12 (10) | 18 (15) | 6 (6) | 8 (7) | 15 (12) | 7 (7) | 12 (12) | 7 (7) | 7 (7) | 10 (10) | 9 (9) | 9 (9) | 10 (10) | да |
| `fi-oulu` | 21 | 13 (11) | 20 (16) | 5 (5) | 11 (9) | 16 (12) | 9 (9) | 10 (9) | 6 (6) | 6 (6) | 9 (9) | 10 (10) | 9 (9) | 9 (9) | да |
| `fi-rauma` | 9 | 11 (9) | 16 (13) | 5 (5) | 7 (6) | 15 (12) | 9 (9) | 8 (8) | 7 (7) | 5 (5) | 10 (10) | 9 (9) | 9 (9) | 10 (10) | да |
| `fi-tampere` | 28 | 14 (12) | 18 (13) | 5 (5) | 11 (9) | 18 (14) | 7 (7) | 14 (14) | 10 (10) | 8 (8) | 10 (10) | 9 (9) | 8 (8) | 12 (12) | да |
| `fi-turku` | 20 | 13 (11) | 18 (14) | 6 (6) | 9 (7) | 15 (11) | 7 (7) | 11 (11) | 8 (8) | 6 (6) | 10 (10) | 8 (8) | 12 (12) | 10 (10) | да |
| `fi-tyrnava` | 9 | 12 (10) | 17 (14) | 7 (7) | 8 (7) | 16 (13) | 8 (8) | 10 (10) | 8 (8) | 5 (5) | 8 (8) | 10 (10) | 8 (8) | 10 (10) | да |
| `fi-varkaus` | 9 | 11 (9) | 18 (14) | 7 (7) | 7 (6) | 15 (12) | 6 (6) | 9 (9) | 6 (6) | 5 (5) | 8 (8) | 9 (9) | 9 (9) | 10 (10) | да |
| `fr-le-creusot` | 12 | 4 (4) | 5 (4) | 3 (3) | 8 (8) | 14 (7) | 5 (5) | 9 (8) | 9 (9) | 8 (8) | 7 (7) | 8 (6) | 3 (3) | 3 (3) | да |
| `fr-lille` | 21 | 4 (4) | 8 (3) | 6 (6) | 8 (8) | 13 (7) | 5 (5) | 12 (11) | 8 (8) | 8 (8) | 8 (8) | 11 (9) | 3 (3) | 3 (3) | да |
| `fr-lyon` | 21 | 5 (5) | 6 (5) | 5 (5) | 10 (10) | 14 (7) | 7 (7) | 11 (10) | 12 (12) | 7 (7) | 7 (7) | 9 (7) | 5 (5) | 3 (3) | да |
| `fr-marseille` | 14 | 4 (4) | 4 (3) | 4 (4) | 9 (8) | 16 (8) | 6 (6) | 11 (10) | 9 (8) | 6 (6) | 6 (6) | 8 (6) | 4 (4) | 3 (3) | да |
| `fr-paris` | 18 | 5 (4) | 5 (4) | 3 (3) | 9 (9) | 13 (7) | 4 (4) | 12 (11) | 10 (10) | 6 (6) | 7 (7) | 9 (7) | 6 (5) | 3 (3) | да |
| `fr-plozevet` | 14 | 4 (4) | 6 (5) | 6 (5) | 10 (10) | 10 (5) | 4 (4) | 14 (13) | 8 (8) | 8 (8) | 6 (6) | 8 (6) | 3 (3) | 3 (3) | да |
| `gb-birmingham` | 32 | 7 (7) | 10 (10) | 4 (4) | 10 (10) | 10 (9) | 8 (8) | 10 (10) | 14 (13) | 4 (2) | 8 (8) | 10 (10) | 9 (9) | 7 (7) | да |
| `gb-corby` | 11 | 4 (4) | 8 (8) | 3 (3) | 9 (9) | 8 (8) | 7 (7) | 9 (9) | 9 (9) | 3 (2) | 7 (7) | 9 (8) | 5 (5) | 7 (7) | да |
| `gb-london` | 33 | 7 (7) | 9 (8) | 3 (3) | 7 (7) | 12 (10) | 11 (9) | 13 (12) | 11 (10) | 9 (6) | 6 (6) | 10 (9) | 9 (7) | 7 (7) | да |
| `gb-manchester` | 26 | 5 (5) | 10 (10) | 4 (4) | 10 (10) | 12 (11) | 7 (7) | 11 (11) | 11 (10) | 5 (3) | 9 (8) | 10 (10) | 7 (6) | 6 (6) | да |
| `hr-zagreb` | 44 | 7 (7) | 11 (10) | 7 (7) | 3 (3) | 13 (9) | 3 (3) | 7 (7) | 5 (5) | 3 (3) | 13 (10) | 4 (4) | 4 (4) | 3 (3) | да |
| `it-firenze` | 28 | 7 (7) | 7 (4) | 6 (6) | 7 (6) | 12 (8) | 9 (9) | 9 (9) | 11 (11) | 7 (7) | 5 (4) | 5 (5) | 7 (7) | 6 (6) | да |
| `it-gibellina` | 13 | 5 (5) | 7 (4) | 5 (5) | 4 (3) | 9 (7) | 7 (7) | 9 (8) | 12 (12) | 10 (10) | 5 (5) | 4 (4) | 5 (5) | 7 (7) | да |
| `it-ivrea` | 15 | 6 (6) | 8 (5) | 7 (7) | 5 (4) | 10 (7) | 9 (9) | 7 (7) | 10 (10) | 6 (6) | 5 (5) | 4 (4) | 4 (4) | 6 (6) | да |
| `it-matera` | 10 | 5 (5) | 7 (4) | 6 (6) | 4 (3) | 11 (8) | 8 (8) | 7 (7) | 9 (9) | 9 (8) | 4 (4) | 3 (3) | 5 (5) | 5 (5) | да |
| `it-milano` | 26 | 7 (7) | 8 (5) | 8 (8) | 7 (6) | 9 (7) | 8 (8) | 10 (9) | 10 (10) | 5 (5) | 7 (7) | 6 (5) | 5 (5) | 6 (6) | да |
| `it-napoli` | 26 | 8 (8) | 7 (4) | 7 (7) | 5 (4) | 12 (8) | 9 (9) | 9 (9) | 11 (11) | 9 (8) | 5 (5) | 5 (5) | 6 (6) | 5 (5) | да |
| `it-palermo` | 28 | 8 (8) | 8 (5) | 6 (6) | 7 (6) | 13 (9) | 9 (9) | 10 (10) | 12 (11) | 7 (6) | 7 (6) | 5 (5) | 5 (5) | 7 (7) | да |
| `it-roma` | 19 | 5 (5) | 9 (6) | 6 (6) | 5 (4) | 12 (9) | 8 (8) | 8 (8) | 10 (9) | 6 (6) | 6 (6) | 4 (4) | 6 (6) | 6 (6) | да |
| `it-santangelo-dei-lombardi` | 9 | 5 (5) | 7 (4) | 5 (5) | 4 (3) | 9 (6) | 7 (7) | 6 (6) | 10 (10) | 10 (8) | 4 (4) | 5 (5) | 4 (4) | 8 (8) | да |
| `it-sesto-san-giovanni` | 14 | 8 (8) | 8 (5) | 7 (7) | 5 (4) | 11 (8) | 9 (9) | 7 (7) | 10 (10) | 5 (5) | 4 (4) | 3 (3) | 4 (4) | 6 (6) | да |
| `it-torino` | 35 | 6 (6) | 8 (5) | 8 (8) | 6 (5) | 13 (7) | 9 (9) | 11 (11) | 10 (10) | 11 (10) | 5 (5) | 7 (7) | 5 (5) | 6 (6) | да |
| `pl-gdansk` | 25 | 4 (4) | 17 (16) | 3 (3) | 4 (3) | 11 (6) | 7 (6) | 4 (3) | 9 (7) | 10 (9) | 12 (11) | 4 (4) | 10 (8) | 4 (3) | да |
| `pl-krakow` | 24 | 1 (1) | 10 (10) | 4 (3) | 9 (2) | 13 (7) | 8 (7) | 4 (2) | 10 (9) | 5 (4) | 10 (10) | 5 (5) | 10 (9) | 5 (4) | нет |
| `pl-lodz` | 27 | 7 (5) | 14 (13) | 5 (4) | 11 (5) | 14 (8) | 7 (6) | 4 (3) | 10 (9) | 8 (7) | 12 (12) | 4 (4) | 9 (8) | 4 (3) | да |
| `pl-warszawa` | 25 | 6 (5) | 13 (12) | 6 (4) | 8 (2) | 12 (5) | 10 (9) | 4 (3) | 10 (9) | 6 (5) | 11 (11) | 4 (4) | 9 (8) | 5 (4) | да |
| `pl-zalipie` | 4 | 1 (1) | 5 (5) | 4 (3) | 7 (2) | 9 (6) | 6 (5) | 4 (3) | 9 (8) | 5 (4) | 10 (10) | 3 (3) | 7 (6) | 4 (3) | нет |
| `rs-beograd` | 27 | 4 (3) | 6 (3) | 7 (7) | 7 (7) | 10 (5) | 3 (3) | 4 (4) | 3 (3) | 2 (2) | 7 (5) | 4 (4) | 3 (3) | 2 (2) | да |
| `rs-novi-sad` | 15 | 4 (4) | 3 (3) | 3 (3) | 2 (2) | 9 (6) | 2 (2) | 4 (4) | 2 (2) | 4 (4) | 7 (5) | 4 (4) | 3 (3) | 2 (2) | да |
| `rs-subotica` | 15 | 6 (6) | 3 (3) | 5 (5) | 2 (2) | 7 (5) | 3 (3) | 4 (4) | 2 (2) | 3 (3) | 7 (6) | 3 (3) | 2 (2) | 2 (2) | да |
| `ru-moscow` | 20 | 3 (3) | 10 (9) | 8 (7) | 13 (8) | 10 (7) | 11 (11) | 12 (12) | 7 (7) | 6 (6) | 13 (12) | 9 (9) | 9 (8) | 6 (5) | да |
| `ru-saint-petersburg` | 19 | 5 (4) | 11 (9) | 12 (10) | 10 (5) | 9 (6) | 10 (10) | 11 (11) | 8 (8) | 7 (7) | 14 (13) | 9 (9) | 6 (6) | 5 (4) | да |
| `ru-smolensk` | 11 | 4 (4) | 9 (8) | 9 (8) | 10 (5) | 11 (7) | 10 (10) | 10 (10) | 7 (7) | 8 (8) | 13 (12) | 8 (8) | 6 (5) | 5 (4) | да |
| `ru-torzhok` | 5 | 3 (3) | 9 (8) | 8 (7) | 12 (7) | 10 (6) | 9 (9) | 9 (9) | 7 (7) | 7 (7) | 13 (12) | 8 (8) | 8 (8) | 5 (4) | нет |
| `ru-tver` | 30 | 5 (5) | 12 (11) | 9 (8) | 14 (8) | 14 (10) | 14 (14) | 13 (13) | 10 (10) | 8 (8) | 15 (14) | 9 (9) | 9 (9) | 5 (4) | да |
| `ru-veliky-novgorod` | 11 | 3 (3) | 9 (8) | 8 (7) | 10 (5) | 12 (8) | 9 (9) | 10 (10) | 8 (7) | 6 (6) | 14 (13) | 8 (8) | 6 (6) | 5 (4) | да |
| `si-ljubljana` | 52 | 6 (5) | 9 (9) | 9 (9) | 4 (4) | 17 (15) | 7 (7) | 4 (4) | 4 (4) | 5 (5) | 10 (8) | 5 (5) | 5 (5) | 3 (3) | да |
| `tr-ankara` | 27 | 5 (5) | 9 (7) | 18 (16) | 12 (11) | 8 (7) | 10 (9) | 7 (6) | 8 (5) | 8 (6) | 8 (7) | 9 (9) | 10 (8) | 6 (5) | да |
| `tr-bursa` | 18 | 5 (5) | 9 (6) | 16 (14) | 11 (10) | 5 (4) | 9 (8) | 8 (7) | 9 (7) | 7 (5) | 8 (7) | 7 (7) | 9 (8) | 7 (6) | да |
| `tr-cumra` | 9 | 5 (5) | 10 (8) | 14 (12) | 10 (9) | 6 (5) | 8 (7) | 7 (6) | 6 (4) | 7 (5) | 9 (8) | 7 (7) | 11 (10) | 7 (6) | да |
| `tr-gaziantep` | 18 | 7 (7) | 10 (7) | 16 (13) | 10 (9) | 5 (4) | 7 (6) | 7 (6) | 7 (5) | 6 (4) | 7 (6) | 8 (8) | 11 (10) | 7 (5) | да |
| `tr-istanbul` | 38 | 7 (7) | 15 (12) | 15 (13) | 9 (8) | 8 (7) | 12 (10) | 8 (7) | 9 (6) | 9 (7) | 9 (7) | 9 (9) | 11 (10) | 6 (5) | да |
| `tr-izmir` | 22 | 7 (7) | 10 (7) | 15 (12) | 10 (9) | 6 (5) | 9 (8) | 6 (5) | 7 (5) | 8 (6) | 9 (8) | 10 (10) | 8 (7) | 7 (5) | да |
| `tr-karabuk` | 10 | 5 (5) | 8 (6) | 14 (12) | 13 (12) | 5 (4) | 8 (7) | 6 (5) | 6 (4) | 6 (4) | 10 (9) | 7 (7) | 7 (6) | 7 (6) | да |
| `tr-konya` | 12 | 5 (5) | 9 (7) | 15 (13) | 9 (8) | 6 (5) | 7 (6) | 7 (6) | 7 (5) | 7 (5) | 7 (6) | 9 (9) | 10 (9) | 8 (7) | да |
| `tr-pasinler` | 9 | 5 (5) | 10 (6) | 15 (13) | 9 (8) | 5 (4) | 8 (7) | 7 (6) | 6 (4) | 7 (4) | 8 (7) | 6 (6) | 9 (8) | 6 (5) | да |
| `tr-zonguldak` | 11 | 5 (5) | 9 (7) | 15 (13) | 10 (9) | 6 (5) | 9 (8) | 7 (6) | 6 (4) | 7 (5) | 10 (8) | 7 (7) | 8 (7) | 7 (6) | да |
| `us-chicago` | 36 | 3 (2) | 9 (5) | 9 (9) | 13 (12) | 9 (7) | 14 (10) | 15 (13) | 12 (11) | 6 (6) | 8 (7) | 8 (7) | 3 (3) | 5 (5) | да |
| `us-detroit` | 33 | 2 (2) | 8 (7) | 13 (13) | 11 (10) | 11 (7) | 14 (12) | 14 (12) | 15 (14) | 7 (7) | 7 (6) | 7 (6) | 6 (5) | 4 (4) | да |
| `us-holmes-county-rural` | 0 | 1 (1) | 5 (3) | 6 (6) | 8 (8) | 8 (6) | 9 (7) | 11 (10) | 10 (8) | 4 (4) | 5 (5) | 6 (5) | 4 (4) | 5 (5) | нет |
| `us-marietta` | 6 | 1 (1) | 7 (5) | 6 (6) | 8 (8) | 9 (7) | 9 (7) | 13 (12) | 11 (9) | 5 (5) | 4 (4) | 5 (4) | 3 (3) | 4 (4) | нет |
| `us-new-york-city` | 40 | 4 (3) | 9 (5) | 7 (7) | 12 (12) | 12 (8) | 11 (9) | 16 (15) | 12 (10) | 6 (5) | 5 (4) | 7 (6) | 5 (4) | 8 (8) | да |

## Пробелы

- Пар «место × десятилетие» ниже порога: 23.
- Десятилетия, где у места нет ни одной местной/районной/региональной записи (только национальный фон):
  - `cn-beijing`: 2020
  - `cn-chengdu`: 1970, 2020
  - `cn-guangzhou`: 2020
  - `cn-shanghai`: 1970
  - `cn-shenzhen`: 1900, 2020
  - `cn-wuhan`: 1900, 1970
  - `cn-xian`: 1900, 1990
  - `cn-xiaogang`: 1900, 1910, 1920, 1930, 1940, 1980, 1990
  - `de-altmark`: 1900, 1910, 1920, 1930, 2010, 2020
  - `de-berlin`: 1940, 1990, 2020
  - `de-berlin-east`: 1900, 1910, 1920, 1930, 1940, 1990, 2000, 2010, 2020
  - `de-berlin-west`: 1900, 1910, 1920, 1930, 1990, 2000, 2010, 2020
  - `de-eisenhuettenstadt`: 1910, 1930, 1970, 2000, 2010
  - `de-halle`: 1930, 1980, 2020
  - `de-hamburg`: 1990, 2020
  - `de-koeln`: 1900, 2020
  - `de-muenchen`: 2020
  - `de-oberammergau`: 1910
  - `de-wolfsburg`: 1900, 1910, 1920, 2020
  - `fi-helsinki`: 1920
  - `fi-ilomantsi`: 1910, 1920, 1930, 1950, 1970
  - `fi-oulu`: 1920, 1970, 2020
  - `fi-rauma`: 1900, 1910, 1920, 1930, 1960, 1980
  - `fi-tampere`: 1920, 2010
  - `fi-turku`: 2000
  - `fi-tyrnava`: 1980, 1990, 2010
  - `fi-varkaus`: 1900, 1930, 1950, 1970, 1980, 1990
  - `fr-le-creusot`: 1920, 1930, 1960, 2000, 2010, 2020
  - `fr-lille`: 1930, 2010, 2020
  - `fr-lyon`: 2020
  - `fr-marseille`: 1910, 1980, 1990, 2000, 2020
  - `fr-paris`: 1920, 1950, 1980, 2020
  - `fr-plozevet`: 1950, 1990, 2000, 2010, 2020
  - `gb-corby`: 1900, 1910, 1920, 1940, 1980, 2010
  - `gb-london`: 1920, 1930, 1990
  - `it-firenze`: 1910
  - `it-gibellina`: 1900, 1910, 1920, 1930, 1950
  - `it-matera`: 1900, 1910, 1930, 1970, 2000, 2020
  - `it-milano`: 1980
  - `it-napoli`: 1910, 2020
  - `it-roma`: 1900
  - `it-santangelo-dei-lombardi`: 1900, 1910, 1920, 1930, 1950, 1960
  - `it-sesto-san-giovanni`: 1980, 2000
  - `pl-gdansk`: 1900, 1910, 2020
  - `pl-krakow`: 1920, 1980, 1990
  - `pl-lodz`: 2020
  - `pl-zalipie`: 1910, 1920, 1930, 1950, 1980, 1990, 2000, 2010, 2020
  - `rs-beograd`: 1980, 2020
  - `rs-novi-sad`: 1920, 1950, 1970, 2020
  - `rs-subotica`: 1970, 2000, 2020
  - `ru-moscow`: 1900, 1920, 1970, 1980
  - `ru-saint-petersburg`: 1930, 2020
  - `ru-smolensk`: 1910, 1930, 1970, 2000, 2020
  - `ru-torzhok`: 1900, 1910, 1920, 1960, 1970, 2000, 2020
  - `ru-tver`: 2020
  - `ru-veliky-novgorod`: 1900, 1910, 1920, 1930, 1980, 2000, 2020
  - `si-ljubljana`: 2020
  - `tr-ankara`: 1900, 2020
  - `tr-bursa`: 1900, 1940
  - `tr-cumra`: 1900, 1970
  - `tr-gaziantep`: 1940, 1950, 1980, 1990
  - `tr-istanbul`: 1930, 2020
  - `tr-izmir`: 1960
  - `tr-karabuk`: 1900, 1910, 1940, 1960, 1970, 1980, 2010
  - `tr-konya`: 1900, 1930, 1950, 1990
  - `tr-pasinler`: 1900, 1930, 1940, 1970, 2000, 2020
  - `tr-zonguldak`: 1900, 1970
  - `us-detroit`: 2020
  - `us-holmes-county-rural`: 1900, 1920, 1930, 1940, 1960, 1980
  - `us-marietta`: 1900, 1920, 1930, 1990, 2000, 2020

## Источники

- Использовано (`accessed`): 361.
- Зарегистрировано, но не использовано: 75: cn_difangzhi (catalogued), cn_nbs_data (catalogued), cn_nlc (catalogued), cn_yearbooks (catalogued), fi_digi_kansalliskirjasto (catalogued), fi_finna (catalogued), fi_kansallisarkisto (catalogued), fr_ad_13 (catalogued), fr_ad_nord (catalogued), fr_ad_rhone (catalogued), fr_bnf_api (catalogued), fr_britannica (catalogued), fr_chemins_de_memoire (inaccessible), fr_data_gouv (catalogued), fr_francearchives (inaccessible), fr_ined (inaccessible), fr_larousse (catalogued), fr_ratp (inaccessible), fr_unesco_whc (inaccessible), fr_vie_publique (catalogued), gb_bna (inaccessible), gb_parliament (inaccessible), gb_tna_discovery (catalogued), gb_ukds (catalogued), gb_vision_of_britain (inaccessible), hr_daz (inaccessible), it_bncr (catalogued), it_internet_culturale (catalogued), it_lastampa_archivio (catalogued), it_san (catalogued), it_treccani (catalogued), pl_britannica (inaccessible), pl_culture_pl (inaccessible), pl_fbc (catalogued), pl_ipn_main (catalogued), pl_isap (inaccessible), pl_muzeum_tarnow (inaccessible), pl_polona (catalogued), pl_pwn (inaccessible), rs_anno (inaccessible), rs_arcanum (inaccessible), rs_bms_digital (catalogued), rs_gallica (inaccessible), rs_hungaricana (inaccessible), rs_loc_chronam (inaccessible), rs_nbs_digital (catalogued), rs_novisad_city (catalogued), rs_subotica_city (inaccessible), rs_subotica_library (catalogued), ru_bigenc (catalogued), ru_demoscope (inaccessible), ru_gato (catalogued), ru_glavarchiv (catalogued), ru_prozhito (catalogued), ru_rgakfd (catalogued), ru_rosstat (inaccessible), ru_spbarchives (inaccessible), si_arsq (inaccessible), si_dlib (catalogued), si_mnzs (catalogued), si_sazu (catalogued), si_sta (inaccessible), si_ukc (inaccessible), tr_ataturk_kitapligi (catalogued), tr_devlet_arsivleri (catalogued), tr_milli_kutuphane (catalogued), tr_tuik (catalogued), us_britannica (inaccessible), us_chicago_encyclopedia (inaccessible), us_dol (catalogued), us_ipums (catalogued), us_loc (catalogued), us_ohio_history (inaccessible), us_smithsonian (catalogued), us_ssa (inaccessible).
