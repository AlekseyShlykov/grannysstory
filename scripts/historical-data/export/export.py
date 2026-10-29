"""Export browser-ready packs from data/research/historical.sqlite.

Output (all generated, safe to delete):
  public/data/world/manifest.json          version, checksums, per-pack counts, per-settlement coverage
  public/data/world/locations.json        compact registry with time-aware names and parents (bundled by the app)
  public/data/world/sources.json          attribution list for the atlas
  public/data/world/packs/<location>.json verified events and contexts anchored at that location
  data/locations/{locations,historical_names,historical_boundaries}.json   merged research views
  data/sources/source_registry.json
  docs/COVERAGE_REPORT.md

Only `verified` records are exported to the game. `needs_review` stays in the research database.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import shutil
import sqlite3
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from dataset import DATA, LEVEL_BY_TYPE, ROOT, Dataset, event_span  # noqa: E402

DB_PATH = DATA / "research" / "historical.sqlite"
OUT = ROOT / "public" / "data" / "world"
WORLD_DATASET_VERSION = "world-1.1.0"
DECADES = list(range(1900, 2030, 10))
SETTLEMENT_TYPES = {"city", "town", "village", "rural_area", "gmina"}
ERAS = [(1900, 1919), (1920, 1939), (1940, 1959), (1960, 1979), (1980, 1999), (2000, 2009), (2010, 2019), (2020, 2025)]
# A settlement is offered only when every decade a 1900–1940 birth cohort lives through (to 2026) has inherited
# background, and the place itself has enough local records to be distinguishable from its neighbours.
GATE_DECADES = list(range(1900, 2030, 10))
GATE_MIN_EVENTS_PER_DECADE = 2
GATE_MIN_LOCAL_EVENTS = 8


def dump(path: Path, payload) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True) + "\n"
    path.write_text(text, encoding="utf-8")
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def pretty(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_from_db() -> Dataset:
    connection = sqlite3.connect(str(DB_PATH))
    data = Dataset()
    for (payload,) in connection.execute("SELECT json FROM locations"):
        location = json.loads(payload)
        data.locations[location["id"]] = location
    for (payload, legacy) in connection.execute("SELECT json, legacy FROM events ORDER BY start_date, id"):
        event = json.loads(payload)
        event["_legacy"] = bool(legacy)
        data.events.append(event)
    for (payload,) in connection.execute("SELECT json FROM contexts ORDER BY id"):
        data.contexts.append(json.loads(payload))
    for (payload, legacy) in connection.execute("SELECT json, legacy FROM sources"):
        source = json.loads(payload)
        source["_legacy"] = bool(legacy)
        data.sources[source["source_id"]] = source
    connection.close()
    return data


def compact_location(location: dict) -> dict:
    coords = location.get("coordinates")
    return {
        "id": location["id"],
        "type": location["type"],
        "level": LEVEL_BY_TYPE[location["type"]],
        "country": location.get("country"),
        "settlementClass": location.get("settlement_class"),
        "wikidata": location.get("wikidata"),
        "coordinates": {"lat": coords["lat"], "lon": coords["lon"]} if coords else None,
        "names": [{"name": name["name"], "locative": name.get("locative"), "from": name.get("from"), "to": name.get("to")}
                  for name in location.get("names_ru", [])],
        "parents": [{"id": parent["id"], "from": parent.get("from"), "to": parent.get("to")} for parent in location.get("parents", [])],
        "occupations": [{"by": item.get("by_ru"), "from": item.get("from"), "to": item.get("to")} for item in location.get("occupations", [])],
        "validFrom": location.get("valid_from"),
        "validTo": location.get("valid_to"),
        "legacyIds": location.get("legacy_ids", []),
    }


def compact_event(event: dict) -> dict:
    eligibility = event.get("eligibility") or {}
    record = {
        "id": event["id"],
        "title": event["title"],
        "start": event["start_date"],
        "end": event.get("end_date"),
        "precision": event["date_precision"],
        "approximate": bool(event.get("approximate")),
        "scope": event["geographic_scope"],
        "locationIds": event["location_ids"],
        "countries": event.get("country_codes", []),
        "category": event["category"],
        "summary": event["historical_summary"],
        "groups": event.get("affected_groups", []),
        "eligibility": {"minAge": eligibility.get("min_age"), "maxAge": eligibility.get("max_age"), "groupsAny": eligibility.get("groups_any", [])},
        "impacts": event.get("potential_impacts", []),
        "hooks": event.get("narrative_hooks", []),
        "sensitive": bool(event.get("sensitive")),
        "sourceIds": event["source_ids"],
        "confidence": event["confidence"],
        "legacy": bool(event.get("_legacy")),
    }
    if event.get("legacy_requires_flag"):
        record["requiresFlag"] = event["legacy_requires_flag"]
    return record


def compact_context(context: dict) -> dict:
    return {
        "id": context["id"],
        "locationId": context["location_id"],
        "from": int(context["period_start"]),
        "to": int(context["period_end"]),
        "type": context["context_type"],
        "attribute": context.get("attribute"),
        "title": context.get("title"),
        "description": context["description"],
        "statistics": [{key: stat.get(key) for key in ("indicator", "value", "unit", "year", "area_id", "population", "source_id")}
                       for stat in context.get("statistics", [])],
        "sourceIds": context["source_ids"],
        "confidence": context["confidence"],
    }


def inherited_events(data: Dataset, location_id: str, start_year: int, end_year: int, events: list) -> list:
    """Events relevant at a fixed residence between two years, matched with the hierarchy valid at the event date."""
    result = []
    for event in events:
        start, end = event_span(event)
        if end.year < start_year or start.year > end_year:
            continue
        probe = max(start, dt.date(start_year, 1, 1))
        chain = set(data.ancestors_at(location_id, probe))
        if chain & set(event["location_ids"]):
            result.append(event)
    return result


def matched_level(data: Dataset, location_id: str, event: dict, year: int) -> str:
    chain = data.ancestors_at(location_id, max(event_span(event)[0], dt.date(year, 1, 1)))
    hits = [node for node in chain if node in event["location_ids"]]
    return (data.level(hits[0]) or "?") if hits else "?"


def coverage(data: Dataset, events: list) -> dict:
    result = {}
    for location in data.locations.values():
        if location["type"] not in SETTLEMENT_TYPES:
            continue
        decades = {}
        for decade in DECADES:
            matched = inherited_events(data, location["id"], decade, min(decade + 9, 2025), events)
            levels = Counter(matched_level(data, location["id"], event, decade) for event in matched)
            usable = [event for event in matched if not event.get("sensitive")]
            context_count = sum(1 for context in data.contexts if int(context["period_start"]) <= decade + 9 and int(context["period_end"]) >= decade
                                and context["location_id"] in set(data.ancestors_at(location["id"], dt.date(decade, 6, 30))))
            decades[str(decade)] = {"events": len(matched), "usable": len(usable), "levels": dict(levels), "contexts": context_count}
        local = [event for event in events if location["id"] in event["location_ids"]]
        gate_ok = len(local) >= GATE_MIN_LOCAL_EVENTS and all(decades[str(decade)]["usable"] >= GATE_MIN_EVENTS_PER_DECADE for decade in GATE_DECADES)
        result[location["id"]] = {"localEvents": len(local), "decades": decades, "meetsCoverageGate": gate_ok}
    return result


def report(data: Dataset, all_events: list, exported: list, contexts: list, cover: dict, sources: dict) -> str:
    by_country = Counter(country for event in exported for country in event.get("country_codes", []))
    ctx_country = Counter(context.get("country_code") for context in contexts)
    status = Counter((event.get("country_codes") or ["?"])[0] + ":" + event.get("verification_status", "?") for event in all_events)
    by_decade = defaultdict(Counter)
    by_category = defaultdict(Counter)
    by_location = Counter()
    by_scope = defaultdict(Counter)
    for event in exported:
        country = (event.get("country_codes") or ["?"])[0]
        by_decade[country][event_span(event)[0].year // 10 * 10] += 1
        by_category[country][event["category"]] += 1
        by_scope[country][event["geographic_scope"]] += 1
        for location_id in event["location_ids"]:
            by_location[location_id] += 1
    ctx_decade = defaultdict(Counter)
    ctx_type = defaultdict(Counter)
    for context in contexts:
        for decade in range(int(context["period_start"]) // 10 * 10, int(context["period_end"]) + 1, 10):
            ctx_decade[context["country_code"]][decade] += 1
        ctx_type[context["country_code"]][context["context_type"]] += 1
    countries = ["FR", "US", "GB", "PL", "RU"]
    targets = {"FR": (250, 125), "US": (250, 125), "GB": (250, 125), "PL": (250, 125), "RU": (250, 125)}
    lines = [
        "# Покрытие исторической базы",
        "",
        f"Сгенерирован `scripts/historical-data/export/export.py` {dt.date.today().isoformat()}, набор `{WORLD_DATASET_VERSION}`. "
        "Считаются только записи со статусом `verified`, попавшие в браузерные пакеты. Российская линия, унаследованная от v0.4.0 и опубликованная в браузерном манифесте v0.5.0 (`content/historical`), включена в RU.",
        "",
        "## Страны",
        "",
        "| Страна | События (цель) | Контексты (цель) | Масштабы событий |",
        "|---|---:|---:|---|",
    ]
    for country in countries:
        scopes = ", ".join(f"{key} {value}" for key, value in sorted(by_scope[country].items()))
        lines.append(f"| {country} | {by_country[country]} ({targets[country][0]}) | {ctx_country[country]} ({targets[country][1]}) | {scopes or '—'} |")
    lines += ["", f"Статусы всех авторских записей (включая неэкспортированные): " + ", ".join(f"{key} {value}" for key, value in sorted(status.items())) + ".", ""]
    lines += ["## События по десятилетиям", "", "| Страна | " + " | ".join(f"{decade}е" for decade in DECADES) + " |", "|---|" + "---:|" * len(DECADES)]
    for country in countries:
        lines.append(f"| {country} | " + " | ".join(str(by_decade[country][decade]) for decade in DECADES) + " |")
    lines += ["", "## Контексты по десятилетиям (запись считается в каждом десятилетии своего периода)", "", "| Страна | " + " | ".join(f"{decade}е" for decade in DECADES) + " |", "|---|" + "---:|" * len(DECADES)]
    for country in countries:
        lines.append(f"| {country} | " + " | ".join(str(ctx_decade[country][decade]) for decade in DECADES) + " |")
    lines += ["", "## События по категориям", ""]
    for country in countries:
        lines.append(f"- **{country}**: " + (", ".join(f"{key} {value}" for key, value in by_category[country].most_common()) or "нет"))
    lines += ["", "## Контексты по типам", ""]
    for country in countries:
        lines.append(f"- **{country}**: " + (", ".join(f"{key} {value}" for key, value in ctx_type[country].most_common()) or "нет"))
    lines += ["", "## События, привязанные к узлу географии", "", "| Узел | Тип | Записей |", "|---|---|---:|"]
    for location_id, count in sorted(by_location.items(), key=lambda item: (item[0].split("-")[0], -item[1])):
        lines.append(f"| `{location_id}` {data.name_ru_at(location_id, dt.date(2000, 1, 1)) if location_id in data.locations else ''} | {data.locations.get(location_id, {}).get('type', '?')} | {count} |")
    lines += [
        "",
        "## Унаследованное покрытие населённых пунктов",
        "",
        "Число проверенных событий, доступных жительнице места в каждом десятилетии через иерархию на дату события (все уровни; в скобках — без чувствительных). "
        f"Порог для меню: ≥{GATE_MIN_LOCAL_EVENTS} собственных записей места и ≥{GATE_MIN_EVENTS_PER_DECADE} пригодных событий в каждом десятилетии 1920–2020-х.",
        "",
        "| Место | Свои | " + " | ".join(f"{decade}е" for decade in DECADES) + " | Порог |",
        "|---|---:|" + "---:|" * len(DECADES) + "---|",
    ]
    for location_id, item in sorted(cover.items()):
        cells = " | ".join(f"{item['decades'][str(decade)]['events']} ({item['decades'][str(decade)]['usable']})" for decade in DECADES)
        lines.append(f"| `{location_id}` | {item['localEvents']} | {cells} | {'да' if item['meetsCoverageGate'] else 'нет'} |")
    sparse = [(location_id, decade) for location_id, item in cover.items() for decade in GATE_DECADES if item["decades"][str(decade)]["usable"] < GATE_MIN_EVENTS_PER_DECADE]
    thin_local = [(location_id, decade) for location_id, item in cover.items() for decade in DECADES
                  if not any(level in {"municipal", "local", "district", "regional"} for level in item["decades"][str(decade)]["levels"])]
    lines += ["", "## Пробелы", "", f"- Пар «место × десятилетие» ниже порога: {len(sparse)}.",
              "- Десятилетия, где у места нет ни одной местной/районной/региональной записи (только национальный фон):"]
    by_place = defaultdict(list)
    for location_id, decade in thin_local:
        by_place[location_id].append(str(decade))
    for location_id, decades in sorted(by_place.items()):
        lines.append(f"  - `{location_id}`: {', '.join(decades)}")
    accessed = sorted(source_id for source_id, source in sources.items() if source.get("status") == "accessed")
    missing = sorted(f"{source_id} ({source.get('status')})" for source_id, source in sources.items() if source.get("status") != "accessed")
    lines += ["", "## Источники", "", f"- Использовано (`accessed`): {len(accessed)}.", f"- Зарегистрировано, но не использовано: {len(missing)}: " + (", ".join(missing) or "нет") + ".", ""]
    return "\n".join(lines)


def main() -> int:
    data = load_from_db()
    exported = [event for event in data.events if event.get("verification_status") == "verified"]
    contexts = [context for context in data.contexts if context.get("verification_status") == "verified"]
    if OUT.exists():
        shutil.rmtree(OUT)
    packs = defaultdict(lambda: {"events": [], "contexts": []})
    for event in exported:
        for location_id in event["location_ids"]:
            packs[location_id]["events"].append(compact_event(event))
    for context in contexts:
        packs[context["location_id"]]["contexts"].append(compact_context(context))
    pack_index = {}
    for location_id, pack in sorted(packs.items()):
        file = f"packs/{location_id}.json"
        checksum = dump(OUT / file, {"locationId": location_id, "version": WORLD_DATASET_VERSION, **pack})
        pack_index[location_id] = {"file": file, "events": len(pack["events"]), "contexts": len(pack["contexts"]), "sha256": checksum}
    locations = [compact_location(location) for location in sorted(data.locations.values(), key=lambda item: item["id"])]
    locations_checksum = dump(OUT / "locations.json", {"version": WORLD_DATASET_VERSION, "locations": locations})
    public_sources = [{"id": source_id, "name": source.get("name"), "publisher": source.get("publisher"), "url": source.get("url"),
                       "license": source.get("license")} for source_id, source in sorted(data.sources.items()) if source.get("status") == "accessed"]
    sources_checksum = dump(OUT / "sources.json", {"version": WORLD_DATASET_VERSION, "sources": public_sources})
    cover = coverage(data, exported)
    manifest = {
        "worldDatasetVersion": WORLD_DATASET_VERSION,
        "schema": "world-dataset-v1",
        "locations": {"file": "locations.json", "sha256": locations_checksum},
        "sources": {"file": "sources.json", "sha256": sources_checksum},
        "packs": pack_index,
        "coverage": cover,
        "coverageGate": {"decades": GATE_DECADES, "minEventsPerDecade": GATE_MIN_EVENTS_PER_DECADE, "minLocalEvents": GATE_MIN_LOCAL_EVENTS},
        "counts": {"events": len(exported), "contexts": len(contexts), "locations": len(locations), "sources": len(public_sources)},
    }
    dump(OUT / "manifest.json", manifest)

    # Research-side merged views.
    pretty(DATA / "locations" / "locations.json", {"generated": True, "locations": [location for location in locations]})
    pretty(DATA / "locations" / "historical_names.json", {"generated": True, "names": {
        location["id"]: {"local": location.get("names", []), "ru": location.get("names_ru", []), "alt": location.get("alt_names", [])}
        for location in data.locations.values()}})
    pretty(DATA / "locations" / "historical_boundaries.json", {"generated": True, "note": "Временные связи «место → родитель»; суверенитет — верхнее государство цепочки на дату.", "relations": {
        location["id"]: {"parents": location.get("parents", []), "occupations": location.get("occupations", []),
                         "valid_from": location.get("valid_from"), "valid_to": location.get("valid_to")}
        for location in data.locations.values()}})
    pretty(DATA / "sources" / "source_registry.json", {"generated": True, "sources": [
        {key: value for key, value in source.items() if not key.startswith("_")} for source in data.sources.values()]})
    (ROOT / "docs" / "COVERAGE_REPORT.md").write_text(report(data, data.events, exported, contexts, cover, data.sources), encoding="utf-8")
    print(f"Exported {len(exported)} events, {len(contexts)} contexts, {len(pack_index)} packs, {len(locations)} locations to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
