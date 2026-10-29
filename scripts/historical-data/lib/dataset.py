"""Shared loading, date and geography helpers for the offline historical pipeline.

Stdlib only (Python 3.8+). No network access here: collectors live in collect/.
"""
from __future__ import annotations

import calendar
import datetime as dt
import json
import re
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data"
LEGACY = ROOT / "content" / "historical"

COUNTRY_DIRS = {"FR": "france", "US": "usa", "GB": "england", "PL": "poland", "RU": "russia"}
COUNTRY_FILES = {"FR": "fr", "US": "us", "GB": "gb", "PL": "pl", "RU": "ru"}

LEVEL_BY_TYPE = {
    "world": "international",
    "state": "national",
    "transitional_administration": "national",
    "constituent_country": "constituent",
    "republic": "constituent",
    "region": "regional",
    "us_state": "regional",
    "voivodeship": "regional",
    "oblast": "regional",
    "governorate": "regional",
    "department": "district",
    "county": "district",
    "metropolitan_county": "district",
    "local_authority": "district",
    "district": "district",
    "powiat": "district",
    "raion": "district",
    "city": "municipal",
    "town": "municipal",
    "village": "municipal",
    "rural_area": "municipal",
    "gmina": "municipal",
    "neighborhood": "local",
}
LEVEL_ORDER = ["international", "national", "constituent", "regional", "district", "municipal", "local"]
SETTLEMENT_TYPES = {"city", "town", "village", "rural_area", "gmina", "neighborhood"}
SETTLEMENT_CLASSES = {"capital", "large_city", "medium_city", "small_town", "rural"}

CATEGORIES = {
    "war_conflict", "occupation", "political_change", "repression", "economic_crisis", "local_economy",
    "labor", "disaster", "public_health", "migration", "technology", "infrastructure_transport", "education",
    "healthcare", "housing_urban", "culture_leisure", "media_communication", "consumer_life", "family_law",
    "women_rights", "social_policy", "sport", "border_administrative", "religion", "environment", "everyday_life",
}
CONTEXT_TYPES = {
    "work", "wages_income", "prices_spending", "housing", "appliances", "transport", "communication", "education",
    "healthcare", "leisure_culture", "family_marriage", "fertility_childlessness", "women_employment", "demography",
    "migration", "consumer_goods", "food", "social_policy", "retirement",
}
SCOPES = set(LEVEL_ORDER)
STATUSES = {"verified", "needs_review", "unverified"}
CONFIDENCE = {"high", "medium", "low"}
ACCESS_METHODS = {"api", "bulk_download", "open_dataset", "website", "catalogue", "manual_extraction", "not_accessible"}
SOURCE_STATUSES = {"accessed", "catalogued", "inaccessible", "unverified"}

DATE_RE = re.compile(r"^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$")
PRECISION_BY_LENGTH = {4: "year", 7: "month", 10: "day"}


# v0.4.0 national.json mixed in one city-specific record; the world dataset scopes it correctly.
LEGACY_LOCAL_IN_NATIONAL = {"kalinin_tv_relay_1955": "ru-tver"}
LEGACY_DUPLICATES_IN_WORLD = {"october_manifesto_1905"}


class DateError(ValueError):
    pass


def parse_partial(value: str) -> Tuple[dt.date, dt.date, str]:
    """Return (first_day, last_day, precision) for YYYY, YYYY-MM or YYYY-MM-DD."""
    match = DATE_RE.match(value or "")
    if not match:
        raise DateError(f"bad date {value!r}")
    year = int(match.group(1))
    if match.group(3):
        day = dt.date(year, int(match.group(2)), int(match.group(3)))
        return day, day, "day"
    if match.group(2):
        month = int(match.group(2))
        if not 1 <= month <= 12:
            raise DateError(f"bad month {value!r}")
        return dt.date(year, month, 1), dt.date(year, month, calendar.monthrange(year, month)[1]), "month"
    return dt.date(year, 1, 1), dt.date(year, 12, 31), "year"


def period_start(value: Optional[str]) -> dt.date:
    return dt.date.min if value is None else parse_partial(value)[0]


def period_end(value: Optional[str]) -> dt.date:
    return dt.date.max if value is None else parse_partial(value)[1]


def in_period(day: dt.date, start: Optional[str], end: Optional[str]) -> bool:
    return period_start(start) <= day <= period_end(end)


def read_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


class Problem:
    def __init__(self, severity: str, file: str, record: str, message: str):
        self.severity, self.file, self.record, self.message = severity, file, record, message

    def __str__(self) -> str:
        return f"[{self.severity}] {self.file} :: {self.record} :: {self.message}"


class Dataset:
    """All authored files, with the file each record came from."""

    def __init__(self) -> None:
        self.locations: Dict[str, dict] = {}
        self.sources: Dict[str, dict] = {}
        self.events: List[dict] = []
        self.contexts: List[dict] = []
        self.origin: Dict[str, str] = {}
        self.load_problems: List[Problem] = []

    # -- loading -----------------------------------------------------------------
    def _load(self, path: Path, key: str) -> List[dict]:
        rel = str(path.relative_to(ROOT))
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError) as error:
            self.load_problems.append(Problem("error", rel, "-", f"unreadable JSON: {error}"))
            return []
        records = payload.get(key) if isinstance(payload, dict) else None
        if not isinstance(records, list):
            self.load_problems.append(Problem("error", rel, "-", f"expected top-level object with a '{key}' list"))
            return []
        for record in records:
            if isinstance(record, dict):
                record["_file"] = rel
        return [record for record in records if isinstance(record, dict)]

    @classmethod
    def load(cls, include_legacy: bool = True) -> "Dataset":
        data = cls()
        for path in sorted((DATA / "locations").glob("*.json")):
            if path.name in {"locations.json", "historical_names.json", "historical_boundaries.json"}:
                continue
            for location in data._load(path, "locations"):
                data._add_unique(data.locations, location.get("id"), location, "location")
        for path in sorted((DATA / "sources").glob("*.json")):
            if path.name == "source_registry.json":
                continue
            for source in data._load(path, "sources"):
                data._add_unique(data.sources, source.get("source_id"), source, "source")
        for path in sorted((DATA / "historical").rglob("*.json")):
            data.events.extend(data._load(path, "records"))
        for path in sorted((DATA / "contexts").rglob("*.json")):
            data.contexts.extend(data._load(path, "records"))
        if include_legacy:
            data._load_legacy()
        return data

    def _add_unique(self, table: Dict[str, dict], key: Optional[str], record: dict, kind: str) -> None:
        if not key:
            self.load_problems.append(Problem("error", record.get("_file", "?"), "-", f"{kind} without id"))
            return
        if key in table:
            self.load_problems.append(Problem("error", record.get("_file", "?"), key, f"duplicate {kind} id (also in {table[key].get('_file')})"))
            return
        table[key] = record

    def _load_legacy(self) -> None:
        """Map v0.4.0 content/historical records into the world schema, keeping their IDs."""
        if not LEGACY.exists():
            return
        legacy_place = {"moscow": "ru-moscow", "saint-petersburg": "ru-saint-petersburg", "tver": "ru-tver",
                        "veliky-novgorod": "ru-veliky-novgorod", "smolensk": "ru-smolensk"}
        for source in read_json(LEGACY / "sources.json"):
            record = {
                "source_id": source["id"], "name": source["title"], "publisher": source["publisher"], "country": "RU",
                "url": source["url"], "historical_coverage": None, "geographic_coverage": ["RU"], "categories": [],
                "access_method": "website", "bulk_download": False, "license": source["rightsStatus"],
                "attribution_required": True, "access_restrictions": [], "status": "accessed",
                "accessed": source["accessedAt"], "notes": source.get("recordId"), "_file": "content/historical/sources.json",
                "_legacy": True,
            }
            self._add_unique(self.sources, record["source_id"], record, "source")
        national = read_json(LEGACY / "national.json")
        for event in national["events"]:
            if event["id"] in LEGACY_DUPLICATES_IN_WORLD:
                continue
            year = int(event["startDate"][:4])
            if event["id"] in LEGACY_LOCAL_IN_NATIONAL:
                location, scope = LEGACY_LOCAL_IN_NATIONAL[event["id"]], "municipal"
            else:
                day = event["startDate"]
                location = "ru" if day >= "1992-01-01" else "su" if day >= "1922-12-30" else "ru" if day >= "1917-11-08" else "ru-empire"
                scope = "national"
            self.events.append(self._legacy_event(event, location, scope, "content/historical/national.json"))
        manifest = read_json(LEGACY / "manifest.json")
        for region in manifest["regions"]:
            pack = read_json(LEGACY / region["pack"])
            for event in pack["events"]:
                record = self._legacy_event(event, legacy_place[event["locationId"]], "municipal", f"content/historical/{region['pack']}")
                record["eligibility"] = {"min_age": event["applicability"]["minAge"], "max_age": event["applicability"]["maxAge"], "groups_any": []}
                if event["applicability"].get("requiresFlag"):
                    record["legacy_requires_flag"] = event["applicability"]["requiresFlag"]
                self.events.append(record)

    @staticmethod
    def _legacy_event(event: dict, location: str, scope: str, file: str) -> dict:
        same_day = event["startDate"] == event["endDate"]
        return {
            "id": event["id"], "title": event["title"], "title_original": None,
            "start_date": event["startDate"], "end_date": None if same_day else event["endDate"], "date_precision": "day",
            "approximate": False, "country_codes": ["RU"], "geographic_scope": scope, "location_ids": [location],
            "category": {"major": "political_change", "cultural": "culture_leisure", "everyday": "everyday_life"}.get(event.get("scale", "major"), "political_change"),
            "subcategory": "legacy_v0_4",
            # Legacy texts carry game notes about the character; the world dataset keeps only the fact.
            "historical_summary": " ".join(part for part in re.split(r"(?<=[.!?])\s+", event["historicalContext"]) if "героин" not in part), "affected_groups": ["all_residents"],
            "potential_impacts": [], "narrative_hooks": [], "sensitive": False, "source_ids": [event["sourceId"]],
            "evidence": [], "verification_status": "verified", "confidence": event.get("confidence", "high"),
            "_file": file, "_legacy": True,
        }

    # -- geography -----------------------------------------------------------------
    def parent_at(self, location_id: str, day: dt.date) -> Optional[str]:
        location = self.locations.get(location_id)
        if not location:
            return None
        for parent in location.get("parents", []):
            if in_period(day, parent.get("from"), parent.get("to")):
                return parent["id"]
        return None

    def ancestors_at(self, location_id: str, day: dt.date) -> List[str]:
        chain, current, seen = [], location_id, set()
        while current and current not in seen:
            seen.add(current)
            chain.append(current)
            current = self.parent_at(current, day)
        return chain

    def level(self, location_id: str) -> Optional[str]:
        location = self.locations.get(location_id)
        return LEVEL_BY_TYPE.get(location.get("type")) if location else None

    def sovereign_at(self, location_id: str, day: dt.date) -> Optional[str]:
        states = [node for node in self.ancestors_at(location_id, day) if self.locations.get(node, {}).get("type") == "state"]
        return states[-1] if states else None

    def name_ru_at(self, location_id: str, day: dt.date) -> str:
        location = self.locations[location_id]
        for name in location.get("names_ru", []):
            if in_period(day, name.get("from"), name.get("to")):
                return name["name"]
        names = location.get("names_ru") or location.get("names") or [{"name": location_id}]
        return names[-1]["name"]

    def country_of_file(self, file: str) -> Optional[str]:
        for code, folder in COUNTRY_DIRS.items():
            if f"/{folder}/" in file:
                return code
        for code, stem in COUNTRY_FILES.items():
            if file.endswith(f"/{stem}.json"):
                return code
        if file.startswith("content/historical"):
            return "RU"
        return None


def event_span(event: dict) -> Tuple[dt.date, dt.date]:
    start = parse_partial(event["start_date"])[0]
    end = parse_partial(event["end_date"])[1] if event.get("end_date") else parse_partial(event["start_date"])[1]
    return start, end


def public_record(record: dict) -> dict:
    return {key: value for key, value in record.items() if not key.startswith("_")}


def iter_years(start: int, end: int) -> Iterable[int]:
    return range(start, end + 1)
