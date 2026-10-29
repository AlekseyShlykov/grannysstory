# Схема исторической базы «Бабушки» (world dataset v1)

Рабочий язык текстов — русский. Ключи — английские. Схема общая для всех стран. Проверка: `python3 scripts/historical-data/validate/validate.py` (подробности в [EXPANDING.md](EXPANDING.md)).

## Файлы и владение

| Путь | Что | Кто пишет |
|---|---|---|
| `data/locations/common.json` | корень `world` и государства, общие для нескольких стран | интеграция |
| `data/locations/<cc>.json` | регионы, районы, города страны и исторические государства, нужные только ей | исследователь страны |
| `data/sources/<cc>.json` | реестр источников страны | исследователь страны |
| `data/historical/<country>/**/*.json` | исторические события (`national/`, `regions/`, `cities/`) | исследователь страны |
| `data/contexts/<country>/*.json` | повседневные условия и статистика | исследователь страны |
| `data/research-notes/<cc>.md` | доступ к источникам, отказы, лицензии, пробелы | исследователь страны |
| `data/cache/` | сырые ответы офлайн-сборщиков | скрипты `collect/` |
| `data/research/historical.sqlite` | нормализованная база (генерируется) | `normalize/` |
| `public/data/world/` | браузерные пакеты + манифест (генерируются) | `export/` |

`<cc>`: `fr`, `us`, `gb`, `pl`, `ru`. `<country>`: `france`, `usa`, `england`, `poland`, `russia`.

Наследие: `content/historical/*` (38 записей v0.4.0) не переписывается. Нормализатор импортирует его в базу с исходными ID.

## Даты

Строки `YYYY`, `YYYY-MM` или `YYYY-MM-DD`. Длина строки обязана соответствовать `date_precision` (`year` | `month` | `day`). Год без месяца не дополняется выдуманным `-01-01`. Для периодов валидности (`from`/`to`) допускается любая из трёх форм; `null` — открытый край. `from: "1974-04-01"` — изменение вступило в силу в этот день; `to` включительно.

Неточная дата: `approximate: true`. Дата публикации газеты — не дата события; если известна только она, событие не публикуется как датированное этим днём.

## Location

```json
{
  "id": "fr-lyon",
  "type": "city",
  "country": "FR",
  "wikidata": "Q456",
  "codes": { "insee": "69123" },
  "settlement_class": "large_city",
  "names": [
    { "name": "Lyon", "lang": "fr", "from": null, "to": null }
  ],
  "names_ru": [
    { "name": "Лион", "locative": "в Лионе", "from": null, "to": null }
  ],
  "alt_names": ["Lugdunum"],
  "coordinates": { "lat": 45.7578, "lon": 4.8320, "source_id": "wikidata" },
  "parents": [
    { "id": "fr-dep-69", "from": null, "to": null }
  ],
  "sovereignty_note": null,
  "occupations": [
    { "by_ru": "Германия", "from": "1942-11-11", "to": "1944-09-03", "source_id": "..." }
  ],
  "source_ids": ["wikidata", "insee_cog"]
}
```

- `id`: `^[a-z0-9]+(-[a-z0-9]+)*$`, с префиксом страны (`fr-`, `us-`, `gb-`, `pl-`, `ru-`) или `state-` для исторических государств. ID не меняется при переименовании.
- `type`: `world`, `state`, `transitional_administration`, `constituent_country`, `republic`, `region`, `us_state`, `voivodeship`, `oblast`, `governorate`, `department`, `county`, `metropolitan_county`, `local_authority`, `district`, `powiat`, `raion`, `gmina`, `city`, `town`, `village`, `rural_area`, `neighborhood`. `transitional_administration` имеет национальный масштаб, но не считается суверенным государством: цепочка должна продолжаться до фактического узла `state`.
- `settlement_class` (только для населённых пунктов): `capital`, `large_city`, `medium_city`, `small_town`, `rural`.
- `parents`: временная иерархия. В любой момент действует не больше одного родителя. Цепочка должна доходить до узла `state`, а через него до `world`. Суверенитет определяется первым `state` в цепочке на дату, поэтому смена границ записывается сменой родителя (Гданьск: `state-de-empire` → `state-danzig` → … → Польша).
- `occupations`: военная оккупация без смены суверенитета (Лилль 1940–1944, Варшава 1939–1945). Не меняет иерархию.
- `coordinates`: только из источника; `null`, если не проверено. Сборщик Wikidata сверяет и дополняет.
- `names` — исторически точные местные названия; `names_ru` — то, что видит игрок, с периодами (Тверь / Калинин / Тверь).

Уровень наследования определяется типом узла: `world` → international; `state`, `transitional_administration` → national; `constituent_country`, `republic` → constituent; `region`, `us_state`, `voivodeship`, `oblast`, `governorate` → regional; `department`, `county`, `metropolitan_county`, `local_authority`, `district`, `powiat`, `raion` → district; `city`, `town`, `village`, `rural_area`, `gmina` → municipal; `neighborhood` → local.

## HistoricalEvent

```json
{
  "id": "fr-lyon-1978-example",
  "title": "Краткий заголовок по-русски",
  "title_original": "Titre original (необязательно)",
  "start_date": "1975",
  "end_date": null,
  "date_precision": "year",
  "approximate": false,
  "country_codes": ["FR"],
  "geographic_scope": "municipal",
  "location_ids": ["fr-lyon"],
  "category": "local_economy",
  "subcategory": "employment",
  "historical_summary": "Проверенный факт своими словами, 1–3 предложения.",
  "affected_groups": ["industrial_workers"],
  "eligibility": { "min_age": 14, "max_age": null, "groups_any": ["industrial_workers"] },
  "potential_impacts": ["employment_change"],
  "narrative_hooks": ["decision_to_move"],
  "sensitive": false,
  "source_ids": ["fr_insee"],
  "evidence": [
    { "source_id": "fr_insee", "url": "https://...", "accessed": "2026-10-29", "supports": "дата и масштаб закрытия" }
  ],
  "verification_status": "verified",
  "confidence": "high"
}
```

- `geographic_scope` ∈ `international`, `national`, `constituent`, `regional`, `district`, `municipal`, `local` и обязан совпадать с уровнем каждого узла из `location_ids` (кроме `international`, который допускает узлы `state`). Городское событие не привязывается к стране.
- `location_ids` — область, где событие реально происходило или действовало. Не дублируйте национальное событие в городские записи.
- `category`: `war_conflict`, `occupation`, `political_change`, `repression`, `economic_crisis`, `local_economy`, `labor`, `disaster`, `public_health`, `migration`, `technology`, `infrastructure_transport`, `education`, `healthcare`, `housing_urban`, `culture_leisure`, `media_communication`, `consumer_life`, `family_law`, `women_rights`, `social_policy`, `sport`, `border_administrative`, `religion`, `environment`, `everyday_life`.
- `affected_groups` (словарь, дополняемый): `all_residents`, `women`, `men`, `children`, `school_pupils`, `students`, `young_adults`, `parents`, `mothers`, `elderly`, `pensioners`, `industrial_workers`, `textile_workers`, `miners`, `dock_workers`, `agricultural_workers`, `office_workers`, `teachers`, `medical_workers`, `scientists_engineers`, `homemakers`, `unemployed`, `rural_residents`, `urban_residents`, `commuters`, `tenants`, `homeowners`, `migrants`, `ethnic_minorities`, `jewish_population`, `veterans`, `soldiers_families`, `consumers`, `television_owners`, `internet_users`.
- `eligibility` — необязательные ограничения для «личной» релевантности (не для фона): `min_age`, `max_age`, `groups_any`. Без них событие — только фон.
- `potential_impacts` и `narrative_hooks` — спекулятивные сценарные возможности, а не исторический факт. Никогда не утверждают, что событие случилось с героиней.
- `sensitive: true` — репрессии, массовая гибель, этнические преследования, насилие. Такие записи остаются фоном, пока человек-редактор не подтвердит их сценарное использование.
- `verification_status`: `verified` — утверждение сверено минимум с одним надёжным источником, страница которого реально открыта (URL в `evidence`); `needs_review` — источник слабый или есть расхождения; `unverified` — не экспортируется.
- `confidence`: `high` (официальный/архивный/научный источник, данные однозначны), `medium` (надёжный вторичный источник), `low`.

## EverydayContext

```json
{
  "id": "pl-ctx-1950s-housing-warsaw",
  "country_code": "PL",
  "location_id": "pl-warszawa",
  "period_start": 1950,
  "period_end": 1959,
  "context_type": "housing",
  "attribute": "housing_conditions",
  "title": "Короткое название",
  "description": "Описание по источнику, своими словами.",
  "statistics": [
    {
      "indicator": "persons_per_room",
      "value": 1.7,
      "unit": "persons/room",
      "year": 1950,
      "area_id": "pl-warszawa",
      "population": "все жилые помещения города",
      "method_note": "перепись жилищного фонда",
      "source_id": "pl_gus"
    }
  ],
  "source_ids": ["pl_gus"],
  "evidence": [{ "source_id": "pl_gus", "url": "https://...", "accessed": "2026-10-29", "supports": "..." }],
  "verification_status": "verified",
  "confidence": "medium"
}
```

`context_type`: `work`, `wages_income`, `prices_spending`, `housing`, `appliances`, `transport`, `communication`, `education`, `healthcare`, `leisure_culture`, `family_marriage`, `fertility_childlessness`, `women_employment`, `demography`, `migration`, `consumer_goods`, `food`, `social_policy`, `retirement`.

`location_id` — узел любого уровня (страна, регион, город). Движок ищет контекст снизу вверх по иерархии на нужный год и сообщает, с какого уровня пришёл ответ. Статистика всегда хранит год, единицу, область и определение населения. Популяционная статистика не превращается в правило для конкретной героини.

## Source

```json
{
  "source_id": "fr_insee",
  "name": "INSEE",
  "publisher": "Institut national de la statistique et des études économiques",
  "country": "FR",
  "url": "https://www.insee.fr/",
  "historical_coverage": { "from": 1946, "to": 2025 },
  "geographic_coverage": ["FR"],
  "categories": ["demography"],
  "access_method": "website",
  "bulk_download": true,
  "license": "Licence Ouverte / Etalab 2.0",
  "attribution_required": true,
  "access_restrictions": [],
  "status": "accessed",
  "accessed": "2026-10-29",
  "notes": "..."
}
```

`access_method`: `api`, `bulk_download`, `open_dataset`, `website`, `catalogue`, `manual_extraction`, `not_accessible`. `status`: `accessed` (данные реально использованы), `catalogued` (ресурс найден, данные не извлекались), `inaccessible` (платный доступ, авторизация, блокировка, нерабочий адрес), `unverified`. В игровых записях можно ссылаться только на `accessed`.

## Права

В записи — только собственный краткий пересказ факта. Не копировать газетные тексты, транскрипты интервью, дневники, изображения. Короткие цитаты для исследований — в `data/research-notes/` с атрибуцией и статусом прав. Персональные данные живых людей не хранить; для современных периодов только агрегаты.
