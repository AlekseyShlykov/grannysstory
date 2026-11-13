"""Offline collector for Statistics Finland StatFin (PxWeb API) series used by the Finnish contexts.

Stdlib only. The game never calls this; it is run by a researcher, and every raw response is cached in
data/cache/fi/statfin/<name>.json so the summary can be rebuilt offline.

Usage:
  python3 scripts/historical-data/collect/fi_statfin.py            # use cache, fetch only missing tables
  python3 scripts/historical-data/collect/fi_statfin.py --refresh  # refetch every table
  python3 scripts/historical-data/collect/fi_statfin.py --offline  # never touch the network

Output: data/cache/fi/statfin/summary.json — {table: {area_or_total: {indicator: {year: value}}}}.
API documentation: https://pxdata.stat.fi/api1.html (PxWeb API v1). Data licence: CC BY 4.0, Statistics Finland.
"""
from __future__ import annotations

import argparse
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / "data" / "cache" / "fi" / "statfin"
BASE = "https://pxdata.stat.fi/PxWeb/api/v1/en/StatFin/"
USER_AGENT = "babushka-historical-data/1.0 (offline research collector)"

# StatFin municipality / region codes (regional division of the table's reference year) -> game location ids.
AREAS = {
    "SSS": "fi", "KU091": "fi-helsinki", "KU837": "fi-tampere", "KU853": "fi-turku", "KU564": "fi-oulu",
    "KU179": "fi-jyvaskyla", "KU915": "fi-varkaus", "KU684": "fi-rauma", "KU146": "fi-ilomantsi", "KU859": "fi-tyrnava",
    "MK01": "fi-uusimaa", "MK06": "fi-pirkanmaa", "MK02": "fi-varsinais-suomi", "MK17": "fi-pohjois-pohjanmaa",
    "MK13": "fi-keski-suomi", "MK04": "fi-satakunta", "MK11": "fi-pohjois-savo", "MK12": "fi-pohjois-karjala",
}
MUNICIPALITIES = [code for code in AREAS if code.startswith("KU") or code == "SSS"]
DECADE_YEARS = ["1900", "1910", "1920", "1930", "1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2020", "2025"]

# name -> (table path, {variable code prefix: values}); unspecified variables take their first value (usually 'Total').
TABLES = {
    "population_national": ("vaerak/11rb.px", {"timeperiod": DECADE_YEARS, "sukupuoli": ["SSS"]}),
    "vital_national": ("ssaaty/121v.px", {"timeperiod": DECADE_YEARS + ["1945", "1969", "1970", "1975"], "contentscode": None}),
    "tfr_national": ("synt/12dt.px", {"timeperiod": DECADE_YEARS + ["1947", "1973"]}),
    "life_expectancy": ("kuol/12am.px", {"timeperiod": None, "sukupuoli": ["1", "2"]}),
    "infant_mortality": ("kuol/12aq.px", {"timeperiod": DECADE_YEARS, "sukupuoli": ["SSS"], "contentscode": ["imr"]}),
    "births_out_of_wedlock": ("synt/12dk.px", {"timeperiod": None, "contentscode": ["synt-vm01", "aitieiavio_p"]}),
    "vehicles": ("mkan/11ib.px", {"timeperiod": ["1922", "1930", "1938", "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2020", "2025"],
                                  "ajoneuvolaji": ["01", "07", "08", "09"]}),
    "municipal_population_1972_1990": ("vaerak/11re.px", {"alue": MUNICIPALITIES, "timeperiod": ["1972", "1980", "1990"],
                                                          "ikaryhma": ["SSS"], "sukupuoli": ["SSS"]}),
    "municipal_key_figures": ("vaerak/11ra.px", {"alue": list(AREAS), "timeperiod": ["1990", "2000", "2010", "2020", "2025"],
                                                 "contentscode": ["vaerak-vaesto", "vaesto_yli64_p", "vaesto_keski_ika", "vaesto_kieli_sv_p",
                                                                  "vaesto_tausta_ulk_p", "vaesto_ks_p", "vaesto_ms_p", "vaesto_askunta_skunta_p"]}),
    "municipal_employment": ("tyokay/115x.px", {"alue": list(AREAS), "timeperiod": ["1987", "1990", "1994", "2000", "2008", "2010", "2015", "2020", "2024"],
                                               "contentscode": None}),
    "municipal_fertility": ("synt/14lh.px", {"alue": list(AREAS), "timeperiod": ["1993", "2000", "2010", "2020", "2025"]}),
    "municipal_education": ("vkour/12bq.px", {"alue": list(AREAS), "timeperiod": ["1970", "1980", "1990", "2000", "2010", "2020", "2025"],
                                             "ikaryhma": ["SSS"], "sukupuoli": ["SSS", "2"], "koulutusaste": ["SSS", "9", "3T8", "7"]}),
    "regional_housing_tenure": ("asku/15gq.px", {"alue": [code for code in AREAS if code == "SSS" or code.startswith("MK")],
                                                 "timeperiod": ["2005", "2010", "2015", "2020", "2025"], "hallintaperuste": ["SSS", "1-2", "3-4", "5", "6"],
                                                 "contentscode": ["asku-Lkm", "aht_asku"]}),
}


def tls_context() -> ssl.SSLContext:
    context = ssl.create_default_context()
    if not context.get_ca_certs() and Path("/etc/ssl/cert.pem").exists():
        context = ssl.create_default_context(cafile="/etc/ssl/cert.pem")
    return context


TLS = tls_context()


def request(url: str, body: dict | None = None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"User-Agent": USER_AGENT, "Content-Type": "application/json"}
    for attempt in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers), timeout=60, context=TLS) as response:
                return json.loads(response.read().decode("utf-8-sig"))
        except urllib.error.HTTPError as error:
            if error.code == 429 and attempt < 4:  # PxWeb limits ~30 requests per 10 s
                time.sleep(10 * (attempt + 1))
                continue
            raise
    raise RuntimeError("unreachable")


def build_query(meta: dict, selection: dict) -> dict:
    query = []
    for variable in meta["variables"]:
        code = variable["code"]
        chosen = next((values for prefix, values in selection.items() if code.startswith(prefix)), "first")
        if chosen is None:  # all values
            values = variable["values"]
        elif chosen == "first":
            if variable.get("elimination"):
                continue
            values = variable["values"][:1]
        else:
            values = [value for value in dict.fromkeys(chosen) if value in variable["values"]]  # PxWeb rejects duplicates
        query.append({"code": code, "selection": {"filter": "item", "values": values}})
    return {"query": query, "response": {"format": "json-stat2"}}


def fetch(name: str, path: str, selection: dict, refresh: bool, offline: bool) -> dict | None:
    cached = CACHE / f"{name}.json"
    if cached.exists() and not refresh:
        return json.loads(cached.read_text(encoding="utf-8"))
    if offline:
        print(f"  {name}: no cache, skipped (offline)", file=sys.stderr)
        return None
    meta = request(BASE + path)
    time.sleep(0.5)
    payload = request(BASE + path, build_query(meta, selection))
    record = {"table": path, "url": BASE + path, "fetched": time.strftime("%Y-%m-%d"), "title": meta.get("title"), "response": payload}
    CACHE.mkdir(parents=True, exist_ok=True)
    cached.write_text(json.dumps(record, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    time.sleep(0.5)
    return record


def flatten(payload: dict) -> list:
    """json-stat2 -> list of ({dimension: category label}, value)."""
    ids, sizes, dims = payload["id"], payload["size"], payload["dimension"]
    categories = []
    for dim in ids:
        index = dims[dim]["category"]["index"]
        order = sorted(index, key=index.get) if isinstance(index, dict) else index
        labels = dims[dim]["category"].get("label", {})
        categories.append([(code, labels.get(code, code)) for code in order])
    rows = []
    for position, value in enumerate(payload["value"]):
        rest, coords = position, []
        for size in reversed(sizes):
            coords.append(rest % size)
            rest //= size
        coords.reverse()
        rows.append(({dim: categories[i][coords[i]] for i, dim in enumerate(ids)}, value))
    return rows


def summarise(record: dict) -> dict:
    payload = record["response"]
    out: dict = {}
    for labels, value in flatten(payload):
        area_dim = next((dim for dim in labels if dim.startswith("alue")), None)
        area = AREAS.get(labels[area_dim][0], labels[area_dim][1]) if area_dim else "fi"
        time_dim = next(dim for dim in labels if dim.startswith("timeperiod"))
        others = [labels[dim][1] for dim in labels if dim not in {area_dim, time_dim}]
        out.setdefault(area, {}).setdefault(" / ".join(others), {})[labels[time_dim][1]] = value
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--offline", action="store_true")
    args = parser.parse_args()
    summary = {}
    for name, (path, selection) in TABLES.items():
        record = fetch(name, path, selection, args.refresh, args.offline)
        if record:
            summary[name] = {"table": record["table"], "url": record["url"], "fetched": record["fetched"], "title": record["title"],
                             "data": summarise(record)}
            print(f"  {name}: {record['title']}")
    CACHE.mkdir(parents=True, exist_ok=True)
    (CACHE / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"summary: {len(summary)} tables -> {CACHE / 'summary.json'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
