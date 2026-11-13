"""List a country's verified events by narrative priority with the kind of evidence they rest on.

  python3 scripts/verify/evidence_status.py IT            # events without archival/official evidence, priority first
  python3 scripts/verify/evidence_status.py IT --all      # every event
  python3 scripts/verify/evidence_status.py IT --summary  # counts only

Priority: 1 = cited by a milestone or a hand-written local line in content/scenes/countries/<cc>.ts,
2 = national records, 3 = records of menu settlements, 4 = everything else.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "historical-data" / "lib"))
sys.path.insert(0, str(ROOT / "scripts" / "historical-data" / "export"))
from dataset import Dataset  # noqa: E402
from export import evidence_kind  # noqa: E402


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    country = sys.argv[1].upper()
    data = Dataset.load(include_legacy=False)
    content_file = ROOT / "content" / "scenes" / "countries" / f"{country.lower()}.ts"
    spoken_files = [content_file, ROOT / "content" / "historical" / "milestones.ts", ROOT / "content" / "scenes" / "historicalVoice.ts"]
    spoken = {match for path in spoken_files if path.exists() for match in re.findall(r'"([a-z0-9_-]+)"', path.read_text(encoding="utf-8"))}
    manifest = json.loads((ROOT / "public" / "data" / "world" / "manifest.json").read_text(encoding="utf-8"))
    menu = {location_id for location_id, item in manifest["coverage"].items() if item["meetsCoverageGate"] and location_id.startswith(country.lower() + "-")}
    rows = []
    for event in data.events:
        if country not in event.get("country_codes", []) or event.get("verification_status") != "verified":
            continue
        kinds = sorted({evidence_kind(data.sources.get(item.get("source_id"), {}), item.get("url", "")) for item in event.get("evidence", [])})
        priority = 1 if event["id"] in spoken else 2 if event["geographic_scope"] in {"national", "constituent"} else 3 if set(event["location_ids"]) & menu else 4
        rows.append((priority, event["start_date"], event["id"], ",".join(kinds), event["title"]))
    rows.sort()
    counts = Counter("official" in row[3] for row in rows)
    print(f"{country}: {len(rows)} events, with archival/official evidence {counts[True]}, without {counts[False]}")
    if "--summary" in sys.argv:
        return 0
    for priority, start, event_id, kinds, title in rows:
        if "--all" in sys.argv or "official" not in kinds:
            print(f"{priority}\t{start}\t{event_id}\t{kinds}\t{title}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
