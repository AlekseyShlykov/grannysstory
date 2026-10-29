"""Normalise authored JSON (plus the v0.4.0 legacy packs) into data/research/historical.sqlite.

The database is a rebuildable research artefact: it is deleted and recreated on every run.
Coordinates missing from authored files are filled from the Wikidata cache (collect/wikidata_locations.py).

  python3 scripts/historical-data/normalize/build_sqlite.py
"""
from __future__ import annotations

import json
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from dataset import DATA, LEVEL_BY_TYPE, Dataset, event_span, public_record  # noqa: E402

DB_PATH = DATA / "research" / "historical.sqlite"
WIKIDATA_CACHE = DATA / "cache" / "wikidata" / "entities.json"

SCHEMA = """
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE sources (
  source_id TEXT PRIMARY KEY, name TEXT, publisher TEXT, country TEXT, url TEXT, license TEXT,
  attribution_required INTEGER, access_method TEXT, bulk_download INTEGER, status TEXT, accessed TEXT,
  notes TEXT, legacy INTEGER, file TEXT, json TEXT
);
CREATE TABLE locations (
  id TEXT PRIMARY KEY, type TEXT, level TEXT, country TEXT, wikidata TEXT, settlement_class TEXT,
  lat REAL, lon REAL, coord_source TEXT, valid_from TEXT, valid_to TEXT, file TEXT, json TEXT
);
CREATE TABLE location_names (location_id TEXT, lang TEXT, name TEXT, locative TEXT, valid_from TEXT, valid_to TEXT, display INTEGER);
CREATE TABLE location_parents (location_id TEXT, parent_id TEXT, valid_from TEXT, valid_to TEXT);
CREATE TABLE location_occupations (location_id TEXT, occupier TEXT, valid_from TEXT, valid_to TEXT, source_id TEXT);
CREATE TABLE location_codes (location_id TEXT, scheme TEXT, code TEXT);
CREATE TABLE events (
  id TEXT PRIMARY KEY, title TEXT, title_original TEXT, start_date TEXT, end_date TEXT, date_precision TEXT,
  approximate INTEGER, start_year INTEGER, end_year INTEGER, scope TEXT, category TEXT, subcategory TEXT,
  summary TEXT, sensitive INTEGER, verification_status TEXT, confidence TEXT, legacy INTEGER, file TEXT, json TEXT
);
CREATE TABLE event_locations (event_id TEXT, location_id TEXT);
CREATE TABLE event_countries (event_id TEXT, country TEXT);
CREATE TABLE event_sources (event_id TEXT, source_id TEXT);
CREATE TABLE event_groups (event_id TEXT, group_name TEXT);
CREATE TABLE event_hooks (event_id TEXT, kind TEXT, value TEXT);
CREATE TABLE evidence (record_kind TEXT, record_id TEXT, source_id TEXT, url TEXT, accessed TEXT, supports TEXT);
CREATE TABLE contexts (
  id TEXT PRIMARY KEY, country TEXT, location_id TEXT, period_start INTEGER, period_end INTEGER, context_type TEXT,
  attribute TEXT, title TEXT, description TEXT, verification_status TEXT, confidence TEXT, file TEXT, json TEXT
);
CREATE TABLE context_sources (context_id TEXT, source_id TEXT);
CREATE TABLE context_statistics (
  context_id TEXT, indicator TEXT, value TEXT, unit TEXT, year INTEGER, area_id TEXT, population TEXT,
  method_note TEXT, source_id TEXT
);
CREATE INDEX idx_event_locations ON event_locations(location_id);
CREATE INDEX idx_events_year ON events(start_year, end_year);
CREATE INDEX idx_parents ON location_parents(location_id);
CREATE INDEX idx_contexts_location ON contexts(location_id, period_start);
"""


def with_wikidata_coordinates(data: Dataset) -> None:
    cache = json.loads(WIKIDATA_CACHE.read_text(encoding="utf-8")) if WIKIDATA_CACHE.exists() else {}
    for location in data.locations.values():
        if location.get("coordinates") or not location.get("wikidata"):
            continue
        entity = cache.get(location["wikidata"])
        if entity and entity.get("lat") is not None and location.get("type") in {
            "city", "town", "village", "rural_area", "gmina", "neighborhood"
        }:
            location["coordinates"] = {"lat": round(entity["lat"], 6), "lon": round(entity["lon"], 6), "source_id": "wikidata"}


def build(data: Dataset) -> Path:
    with_wikidata_coordinates(data)
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()
    connection = sqlite3.connect(str(DB_PATH))
    connection.executescript(SCHEMA)
    insert = connection.execute
    insert("INSERT INTO meta VALUES ('schema', 'world-dataset-v1')")

    for source in data.sources.values():
        insert("INSERT INTO sources VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", (
            source["source_id"], source.get("name"), source.get("publisher"), source.get("country"), source.get("url"),
            source.get("license"), int(bool(source.get("attribution_required"))), source.get("access_method"),
            int(bool(source.get("bulk_download"))), source.get("status"), source.get("accessed"), source.get("notes"),
            int(bool(source.get("_legacy"))), source.get("_file"), json.dumps(public_record(source), ensure_ascii=False)))

    for location in data.locations.values():
        coords = location.get("coordinates") or {}
        insert("INSERT INTO locations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", (
            location["id"], location.get("type"), LEVEL_BY_TYPE.get(location.get("type")), location.get("country"),
            location.get("wikidata"), location.get("settlement_class"), coords.get("lat"), coords.get("lon"),
            coords.get("source_id"), location.get("valid_from"), location.get("valid_to"), location.get("_file"),
            json.dumps(public_record(location), ensure_ascii=False)))
        for name in location.get("names", []):
            insert("INSERT INTO location_names VALUES (?,?,?,?,?,?,0)", (location["id"], name.get("lang"), name.get("name"), None, name.get("from"), name.get("to")))
        for name in location.get("names_ru", []):
            insert("INSERT INTO location_names VALUES (?,?,?,?,?,?,1)", (location["id"], "ru", name.get("name"), name.get("locative"), name.get("from"), name.get("to")))
        for parent in location.get("parents", []):
            insert("INSERT INTO location_parents VALUES (?,?,?,?)", (location["id"], parent.get("id"), parent.get("from"), parent.get("to")))
        for occupation in location.get("occupations", []):
            insert("INSERT INTO location_occupations VALUES (?,?,?,?,?)", (location["id"], occupation.get("by_ru"), occupation.get("from"), occupation.get("to"), occupation.get("source_id")))
        for scheme, code in (location.get("codes") or {}).items():
            insert("INSERT INTO location_codes VALUES (?,?,?)", (location["id"], scheme, str(code)))

    for event in data.events:
        start, end = event_span(event)
        insert("INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", (
            event["id"], event.get("title"), event.get("title_original"), event.get("start_date"), event.get("end_date"),
            event.get("date_precision"), int(bool(event.get("approximate"))), start.year, end.year, event.get("geographic_scope"),
            event.get("category"), event.get("subcategory"), event.get("historical_summary"), int(bool(event.get("sensitive"))),
            event.get("verification_status"), event.get("confidence"), int(bool(event.get("_legacy"))), event.get("_file"),
            json.dumps(public_record(event), ensure_ascii=False)))
        for location_id in event.get("location_ids", []):
            insert("INSERT INTO event_locations VALUES (?,?)", (event["id"], location_id))
        for country in event.get("country_codes", []):
            insert("INSERT INTO event_countries VALUES (?,?)", (event["id"], country))
        for source_id in event.get("source_ids", []):
            insert("INSERT INTO event_sources VALUES (?,?)", (event["id"], source_id))
        for group in event.get("affected_groups", []):
            insert("INSERT INTO event_groups VALUES (?,?)", (event["id"], group))
        for kind in ("potential_impacts", "narrative_hooks"):
            for value in event.get(kind, []):
                insert("INSERT INTO event_hooks VALUES (?,?,?)", (event["id"], kind, value))
        for item in event.get("evidence", []):
            insert("INSERT INTO evidence VALUES ('event',?,?,?,?,?)", (event["id"], item.get("source_id"), item.get("url"), item.get("accessed"), item.get("supports")))

    for context in data.contexts:
        insert("INSERT INTO contexts VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", (
            context["id"], context.get("country_code"), context.get("location_id"), context.get("period_start"),
            context.get("period_end"), context.get("context_type"), context.get("attribute"), context.get("title"),
            context.get("description"), context.get("verification_status"), context.get("confidence"), context.get("_file"),
            json.dumps(public_record(context), ensure_ascii=False)))
        for source_id in context.get("source_ids", []):
            insert("INSERT INTO context_sources VALUES (?,?)", (context["id"], source_id))
        for stat in context.get("statistics", []):
            insert("INSERT INTO context_statistics VALUES (?,?,?,?,?,?,?,?,?)", (
                context["id"], stat.get("indicator"), json.dumps(stat.get("value"), ensure_ascii=False), stat.get("unit"),
                stat.get("year"), stat.get("area_id"), stat.get("population"), stat.get("method_note"), stat.get("source_id")))
        for item in context.get("evidence", []):
            insert("INSERT INTO evidence VALUES ('context',?,?,?,?,?)", (context["id"], item.get("source_id"), item.get("url"), item.get("accessed"), item.get("supports")))

    connection.commit()
    connection.close()
    return DB_PATH


if __name__ == "__main__":
    path = build(Dataset.load())
    print(f"Wrote {path}")
