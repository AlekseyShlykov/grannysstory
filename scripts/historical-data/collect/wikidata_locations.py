"""Offline collector: fetch coordinates and labels for every location that names a Wikidata QID.

Wikidata content is CC0. Requests go to the entity JSON endpoint one QID at a time with a pause,
a descriptive User-Agent and a local cache, so reruns do not hit the network.

  python3 scripts/historical-data/collect/wikidata_locations.py            # fetch missing QIDs
  python3 scripts/historical-data/collect/wikidata_locations.py --refresh  # refetch everything

Output: data/cache/wikidata/entities.json  {QID: {label_en, label_local, lat, lon, fetched}}
The normaliser reads this cache; authored files are never rewritten.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))
from dataset import DATA, Dataset  # noqa: E402

CACHE = DATA / "cache" / "wikidata" / "entities.json"
USER_AGENT = "BabushkaGameDataPipeline/1.0 (offline research build; static narrative game)"
LANGS = ("en", "fr", "pl", "ru")


def tls_context() -> ssl.SSLContext:
    # Older python.org builds on macOS ship without a CA bundle; fall back to the system one.
    context = ssl.create_default_context()
    if not context.get_ca_certs() and Path("/etc/ssl/cert.pem").exists():
        context = ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    return context


TLS = tls_context()


def fetch(qid: str) -> dict:
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=30, context=TLS) as response:
        payload = json.load(response)
    entity = next(iter(payload["entities"].values()))
    labels = entity.get("labels", {})
    record = {"labels": {lang: labels[lang]["value"] for lang in LANGS if lang in labels}, "lat": None, "lon": None,
              "fetched": dt.date.today().isoformat(), "redirected_to": entity.get("id") if entity.get("id") != qid else None}
    coordinates = entity.get("claims", {}).get("P625", [])
    preferred = [claim for claim in coordinates if claim.get("rank") == "preferred"] or [claim for claim in coordinates if claim.get("rank") != "deprecated"]
    if preferred:
        value = preferred[0]["mainsnak"].get("datavalue", {}).get("value", {})
        record["lat"], record["lon"] = value.get("latitude"), value.get("longitude")
    return record


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--pause", type=float, default=0.5)
    args = parser.parse_args()
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    data = Dataset.load(include_legacy=False)
    wanted = sorted({location["wikidata"] for location in data.locations.values() if location.get("wikidata")})
    failures = []
    for qid in wanted:
        if qid in cache and not args.refresh:
            continue
        try:
            cache[qid] = fetch(qid)
            print(f"{qid}: {cache[qid]['labels'].get('en')} {cache[qid]['lat']},{cache[qid]['lon']}")
        except (urllib.error.URLError, KeyError, ValueError, TimeoutError) as error:
            failures.append(f"{qid}: {error}")
        time.sleep(args.pause)
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print(f"{len(cache)} cached entities, {len(failures)} failures")
    for failure in failures:
        print("  failed", failure)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
