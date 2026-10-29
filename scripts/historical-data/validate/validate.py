"""Validate every authored location, source, event and context record.

Usage:
  python3 scripts/historical-data/validate/validate.py            # all, exit 1 on errors
  python3 scripts/historical-data/validate/validate.py --country FR   # only report FR files
  python3 scripts/historical-data/validate/validate.py --report docs/VALIDATION_REPORT.md
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import List
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from dataset import (  # noqa: E402
    ACCESS_METHODS, CATEGORIES, CONFIDENCE, CONTEXT_TYPES, LEVEL_BY_TYPE, SCOPES, SETTLEMENT_CLASSES,
    SETTLEMENT_TYPES, SOURCE_STATUSES, STATUSES, DateError, Dataset, Problem, event_span, parse_partial,
    period_end, period_start, ROOT,
)

ID_RE = re.compile(r"^[a-z0-9]+(?:[-_][a-z0-9]+)*$")
LOCATION_PREFIXES = ("fr-", "us-", "gb-", "pl-", "ru-", "state-")
COMMON_LOCATIONS = {"world", "fr", "us", "gb", "pl", "ru", "su", "ru-empire", "gb-eng"}
MIN_YEAR, MAX_YEAR = 1850, 2026
SPECULATIVE_WORDS = ("она пережила", "бабушка", "героиня")


def tokens(text: str) -> set:
    return {word for word in re.findall(r"[\wёЁ]+", (text or "").lower()) if len(word) > 3}


class Validator:
    def __init__(self, data: Dataset):
        self.data = data
        self.problems: List[Problem] = list(data.load_problems)
        cache = ROOT / "data" / "cache" / "wikidata" / "entities.json"
        self.wikidata = json.loads(cache.read_text(encoding="utf-8")) if cache.exists() else {}

    def error(self, record: dict, message: str) -> None:
        self.problems.append(Problem("error", record.get("_file", "?"), record.get("id") or record.get("source_id") or "-", message))

    def warn(self, record: dict, message: str) -> None:
        self.problems.append(Problem("warning", record.get("_file", "?"), record.get("id") or record.get("source_id") or "-", message))

    # -- sources -------------------------------------------------------------------
    def sources(self) -> None:
        for source in self.data.sources.values():
            for field in ("source_id", "name", "url", "license", "status", "access_method"):
                if not source.get(field):
                    self.error(source, f"source is missing '{field}'")
            if source.get("status") and source["status"] not in SOURCE_STATUSES:
                self.error(source, f"unknown source status {source['status']}")
            if source.get("access_method") and source["access_method"] not in ACCESS_METHODS:
                self.error(source, f"unknown access_method {source['access_method']}")
            parsed = urlparse(source.get("url") or "")
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                self.error(source, "source url is not an absolute http(s) URL")
            if source.get("status") == "accessed" and not source.get("accessed") and not source.get("_legacy"):
                self.warn(source, "accessed source without an 'accessed' date")

    # -- locations -----------------------------------------------------------------
    def locations(self) -> None:
        locations = self.data.locations
        for location in locations.values():
            location_id = location.get("id", "")
            if not ID_RE.match(location_id):
                self.error(location, "location id must be lowercase kebab-case")
            if location_id not in COMMON_LOCATIONS and not location_id.startswith(LOCATION_PREFIXES):
                self.error(location, "location id needs a country prefix (fr-, us-, gb-, pl-, ru-) or state-")
            if location.get("type") not in LEVEL_BY_TYPE:
                self.error(location, f"unknown location type {location.get('type')}")
            if location.get("type") in SETTLEMENT_TYPES - {"neighborhood"} and location.get("settlement_class") not in SETTLEMENT_CLASSES:
                self.warn(location, "settlement without a valid settlement_class")
            if not location.get("names_ru"):
                self.error(location, "location has no names_ru for display")
            if location.get("wikidata") and not re.match(r"^Q\d+$", location["wikidata"]):
                self.error(location, "wikidata must look like Q123")
            for source_id in location.get("source_ids", []):
                if source_id not in self.data.sources:
                    self.error(location, f"unknown source {source_id}")
            coords = location.get("coordinates")
            cached = self.wikidata.get(location.get("wikidata") or "", {})
            if coords and cached.get("lat") is not None:
                if abs(float(coords["lat"]) - cached["lat"]) > 0.2 or abs(float(coords["lon"]) - cached["lon"]) > 0.3:
                    self.warn(location, f"coordinates differ from Wikidata ({cached['lat']:.3f}, {cached['lon']:.3f})")
            if coords:
                if not (-90 <= float(coords.get("lat", 999)) <= 90 and -180 <= float(coords.get("lon", 999)) <= 180):
                    self.error(location, "coordinates out of range")
                if coords.get("source_id") and coords["source_id"] not in self.data.sources:
                    self.error(location, f"coordinate source {coords['source_id']} is not registered")
            elif location.get("type") in SETTLEMENT_TYPES and cached.get("lat") is None:
                self.warn(location, "settlement has no coordinates (authored or Wikidata cache)")
            self._periods(location, "names_ru")
            self._periods(location, "names", by_lang=True)
            self._periods(location, "parents")
            for parent in location.get("parents", []):
                if parent.get("id") not in locations:
                    self.error(location, f"unknown parent {parent.get('id')}")
            for occupation in location.get("occupations", []):
                self._date_pair(location, occupation.get("from"), occupation.get("to"), "occupation")
            if location.get("type") != "world":
                self._chain_reaches_state(location)

    def _date_pair(self, record: dict, start, end, label: str) -> bool:
        try:
            if period_start(start) > period_end(end):
                self.error(record, f"{label}: from is after to")
                return False
        except DateError as error:
            self.error(record, f"{label}: {error}")
            return False
        return True

    def _periods(self, location: dict, key: str, by_lang: bool = False) -> None:
        groups = defaultdict(list)
        for entry in location.get(key, []):
            if not self._date_pair(location, entry.get("from"), entry.get("to"), key):
                return
            groups[entry.get("lang") if by_lang else "_"].append(entry)
        for entries in groups.values():
            ordered = sorted(entries, key=lambda entry: period_start(entry.get("from")))
            for previous, current in zip(ordered, ordered[1:]):
                if period_end(previous.get("to")) >= period_start(current.get("from")):
                    self.error(location, f"overlapping {key} periods around {current.get('from')}")

    def _chain_reaches_state(self, location: dict) -> None:
        """At sampled dates within its validity, the chain must reach a state and then world."""
        start = max(period_start(location.get("valid_from")), dt.date(1900, 1, 1))
        end = min(period_end(location.get("valid_to")), dt.date(2025, 12, 31))
        changes = {start, end}
        for parent in location.get("parents", []):
            for edge in (parent.get("from"), parent.get("to")):
                if edge:
                    try:
                        day = parse_partial(edge)[0]
                    except DateError:
                        continue
                    if start <= day <= end:
                        changes.add(day)
        for day in sorted(changes):
            chain = self.data.ancestors_at(location["id"], day)
            if chain[-1] != "world":
                self.error(location, f"hierarchy does not reach 'world' on {day.isoformat()} (chain: {' > '.join(chain)})")
                return
            if not any(self.data.locations.get(node, {}).get("type") == "state" for node in chain):
                self.error(location, f"no state in hierarchy on {day.isoformat()}")
                return

    # -- events --------------------------------------------------------------------
    def events(self) -> None:
        seen = {}
        by_country_year = defaultdict(list)
        for event in self.data.events:
            event_id = event.get("id") or ""
            if not ID_RE.match(event_id):
                self.error(event, "event id must be lowercase kebab/snake case")
            if event_id in seen:
                self.error(event, f"duplicate event id (also in {seen[event_id]})")
            seen[event_id] = event.get("_file")
            for field in ("title", "start_date", "date_precision", "geographic_scope", "location_ids", "category",
                          "historical_summary", "source_ids", "verification_status", "confidence"):
                if not event.get(field):
                    self.error(event, f"missing '{field}'")
            if not self._event_dates(event):
                continue
            if event.get("category") and event["category"] not in CATEGORIES:
                self.error(event, f"unknown category {event['category']}")
            if event.get("verification_status") not in STATUSES:
                self.error(event, f"unknown verification_status {event.get('verification_status')}")
            if event.get("confidence") not in CONFIDENCE:
                self.error(event, f"unknown confidence {event.get('confidence')}")
            self._scope(event)
            self._sources_and_evidence(event)
            summary = (event.get("historical_summary") or "").lower()
            if any(word in summary for word in SPECULATIVE_WORDS):
                self.error(event, "historical_summary mentions the character; keep personal effects in narrative_hooks")
            if "probability" in event or "weight" in event:
                self.error(event, "unconfirmed probability/weight field on a historical event")
            for country in event.get("country_codes", []):
                by_country_year[(country, event_span(event)[0].year)].append(event)
        for group in by_country_year.values():
            for index, first in enumerate(group):
                for second in group[index + 1:]:
                    a, b = tokens(first.get("title", "")), tokens(second.get("title", ""))
                    if a and b and len(a & b) / len(a | b) >= 0.6 and set(first.get("location_ids", [])) & set(second.get("location_ids", [])):
                        self.warn(second, f"possible duplicate of {first.get('id')}")

    def _event_dates(self, event: dict) -> bool:
        try:
            start, _, precision = parse_partial(event.get("start_date") or "")
            if event.get("date_precision") != precision:
                self.error(event, f"start_date {event.get('start_date')} does not match date_precision {event.get('date_precision')}")
            if event.get("end_date"):
                _, end, end_precision = parse_partial(event["end_date"])
                if end < start:
                    self.error(event, "end_date before start_date")
            if not MIN_YEAR <= start.year <= MAX_YEAR:
                self.error(event, f"start year {start.year} outside {MIN_YEAR}-{MAX_YEAR}")
            if start > dt.date(2026, 10, 29):
                self.error(event, "event in the future")
        except DateError as error:
            self.error(event, str(error))
            return False
        return True

    def _scope(self, event: dict) -> None:
        scope = event.get("geographic_scope")
        if scope not in SCOPES:
            self.error(event, f"unknown geographic_scope {scope}")
            return
        for location_id in event.get("location_ids", []):
            level = self.data.level(location_id)
            if level is None:
                self.error(event, f"unknown location {location_id}")
                continue
            if scope == "international" and level in {"international", "national"}:
                continue
            if level != scope:
                self.error(event, f"scope '{scope}' does not match location {location_id} (level '{level}')")
        start, end = event_span(event)
        for location_id in event.get("location_ids", []):
            location = self.data.locations.get(location_id)
            if not location:
                continue
            valid_from, valid_to = period_start(location.get("valid_from")), period_end(location.get("valid_to"))
            if end < valid_from or start > valid_to:
                self.error(event, f"location {location_id} did not exist during the event")

    def _sources_and_evidence(self, event: dict) -> None:
        for source_id in event.get("source_ids", []):
            source = self.data.sources.get(source_id)
            if not source:
                self.error(event, f"unregistered source {source_id}")
            elif source.get("status") in {"inaccessible", "unverified"} and event.get("verification_status") == "verified":
                self.error(event, f"verified record cites {source['status']} source {source_id}")
        if event.get("_legacy"):
            return
        evidence = event.get("evidence") or []
        if event.get("verification_status") == "verified" and not evidence:
            self.error(event, "verified record without evidence URL")
        for item in evidence:
            if item.get("source_id") not in event.get("source_ids", []):
                self.error(event, f"evidence source {item.get('source_id')} not listed in source_ids")
            parsed = urlparse(item.get("url") or "")
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                self.error(event, "evidence url is not absolute")
            if not item.get("accessed"):
                self.error(event, "evidence without accessed date")

    # -- contexts ------------------------------------------------------------------
    def contexts(self) -> None:
        seen = set()
        for context in self.data.contexts:
            if context.get("id") in seen:
                self.error(context, "duplicate context id")
            seen.add(context.get("id"))
            for field in ("id", "country_code", "location_id", "period_start", "period_end", "context_type", "description",
                          "source_ids", "verification_status", "confidence"):
                if context.get(field) in (None, "", []):
                    self.error(context, f"missing '{field}'")
            if context.get("context_type") not in CONTEXT_TYPES:
                self.error(context, f"unknown context_type {context.get('context_type')}")
            if context.get("location_id") not in self.data.locations:
                self.error(context, f"unknown location {context.get('location_id')}")
            try:
                if int(context.get("period_start", 0)) > int(context.get("period_end", 0)):
                    self.error(context, "period_start after period_end")
                if not 1850 <= int(context.get("period_start", 0)) <= 2026:
                    self.error(context, "period_start outside 1850-2026")
            except (TypeError, ValueError):
                self.error(context, "period_start/period_end must be integers (years)")
            for source_id in context.get("source_ids", []):
                if source_id not in self.data.sources:
                    self.error(context, f"unregistered source {source_id}")
            if context.get("verification_status") == "verified" and not context.get("evidence"):
                self.error(context, "verified context without evidence URL")
            for stat in context.get("statistics", []):
                for field in ("indicator", "value", "unit", "year", "area_id", "source_id"):
                    if stat.get(field) in (None, ""):
                        self.error(context, f"statistic missing '{field}'")
                if not stat.get("population"):
                    self.warn(context, f"statistic {stat.get('indicator')} has no population definition")
                if stat.get("area_id") and stat["area_id"] not in self.data.locations:
                    self.error(context, f"statistic area {stat['area_id']} unknown")
                if stat.get("source_id") and stat["source_id"] not in context.get("source_ids", []):
                    self.error(context, f"statistic source {stat['source_id']} not in source_ids")

    def run(self) -> List[Problem]:
        self.sources()
        self.locations()
        self.events()
        self.contexts()
        return self.problems


def write_report(path: Path, data: Dataset, problems: List[Problem]) -> None:
    errors = [problem for problem in problems if problem.severity == "error"]
    warnings = [problem for problem in problems if problem.severity == "warning"]
    status = Counter(event.get("verification_status") for event in data.events)
    lines = [
        "# Отчёт проверки исторических данных",
        "",
        f"Сгенерирован `scripts/historical-data/validate/validate.py` {dt.date.today().isoformat()}.",
        "",
        f"- Мест: {len(data.locations)}; источников: {len(data.sources)}; событий: {len(data.events)}; контекстных записей: {len(data.contexts)}.",
        f"- Статусы событий: " + ", ".join(f"{key}: {value}" for key, value in sorted(status.items(), key=lambda item: str(item[0]))) + ".",
        f"- Ошибок: {len(errors)}; предупреждений: {len(warnings)}.",
        "",
        "Валидатор проверяет структуру, даты и их точность, соответствие масштаба уровню географии, существование мест в период события, временную иерархию (цепочка до государства и `world` на каждой дате смены), пересечение периодов названий, регистрацию источников, наличие URL-доказательств, статистические поля и возможные дубликаты. Он не доказывает истинность содержания страниц.",
        "",
    ]
    for title, items in (("Ошибки", errors), ("Предупреждения", warnings)):
        lines.append(f"## {title}")
        lines.append("")
        if not items:
            lines.append("Нет.")
        by_message = Counter()
        for item in items[:400]:
            lines.append(f"- `{item.file}` · `{item.record}` — {item.message}")
            by_message[item.message] += 1
        if len(items) > 400:
            lines.append(f"- … и ещё {len(items) - 400}")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--country", help="only report problems from files of this country (FR, US, GB, PL, RU)")
    parser.add_argument("--report", help="write a markdown report to this path")
    parser.add_argument("--quiet-warnings", action="store_true")
    args = parser.parse_args()
    data = Dataset.load()
    problems = Validator(data).run()
    if args.country:
        problems = [problem for problem in problems if data.country_of_file(problem.file) == args.country.upper() or "common" in problem.file]
    if args.report:
        write_report(ROOT / args.report, data, problems)
    errors = [problem for problem in problems if problem.severity == "error"]
    for problem in problems:
        if problem.severity == "error" or not args.quiet_warnings:
            print(problem)
    print(f"\n{len(data.locations)} locations, {len(data.sources)} sources, {len(data.events)} events, {len(data.contexts)} contexts; "
          f"{len(errors)} errors, {len(problems) - len(errors)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
