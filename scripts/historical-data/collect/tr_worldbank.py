"""Fetch World Bank WDI series for Turkey (TUR) into data/cache/tr/worldbank/.

Offline research helper only; the game never calls it. Stdlib only.
The World Bank Indicators API (https://api.worldbank.org/v2/) is open, no key needed;
data licensed CC BY 4.0. Re-running overwrites the cache; use --offline to just
print a summary of what is cached (reproducible without network).

Usage:
  python3 scripts/historical-data/collect/tr_worldbank.py            # fetch + summary
  python3 scripts/historical-data/collect/tr_worldbank.py --offline  # summary from cache
"""
from __future__ import annotations

import json
import os
import ssl
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CACHE = ROOT / "data" / "cache" / "tr" / "worldbank"
API = "https://api.worldbank.org/v2/country/TUR/indicator/{code}?format=json&per_page=200&date=1960:2025"
INDICATORS = [
    "SP.POP.TOTL", "SP.URB.TOTL.IN.ZS", "SP.DYN.TFRT.IN", "SP.DYN.CBRT.IN", "SP.ADO.TFRT", "SP.DYN.IMRT.IN",
    "SP.DYN.LE00.IN", "SP.DYN.LE00.FE.IN", "SH.STA.MMRT", "SL.TLF.CACT.FE.ZS", "SL.TLF.CACT.MA.ZS",
    "SL.AGR.EMPL.ZS", "SL.AGR.EMPL.FE.ZS", "IT.NET.USER.ZS", "IT.CEL.SETS.P2", "IT.MLT.MAIN.P2",
    "FP.CPI.TOTL.ZG", "SE.ADT.LITR.ZS", "SE.ADT.LITR.FE.ZS", "SE.ADT.LITR.MA.ZS", "SE.SEC.ENRR.FE", "SE.SEC.ENRR",
    "SE.TER.ENRR", "SE.TER.ENRR.FE", "SE.PRM.ENRR.FE", "NY.GDP.PCAP.CD", "SM.POP.NETM", "SP.DYN.AMRT.FE",
]
UA = {"User-Agent": "babushka-historical-research/0.1 (offline game dataset)"}


def context() -> ssl.SSLContext:
    # The bundled Python on some macOS installs lacks CA certificates; fall back to the system bundle.
    for cafile in (os.environ.get("SSL_CERT_FILE"), "/etc/ssl/cert.pem"):
        if cafile and os.path.exists(cafile):
            return ssl.create_default_context(cafile=cafile)
    return ssl.create_default_context()


def fetch() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    ctx = context()
    for code in INDICATORS:
        url = API.format(code=code)
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60, context=ctx) as response:
            payload = json.loads(response.read().decode("utf-8"))
        (CACHE / f"{code}.json").write_text(json.dumps({"url": url, "response": payload}, ensure_ascii=False, indent=1), encoding="utf-8")
        time.sleep(0.5)


def summary() -> None:
    for path in sorted(CACHE.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))["response"]
        rows = [row for row in (data[1] if len(data) > 1 and data[1] else []) if row.get("value") is not None]
        years = sorted(int(row["date"]) for row in rows)
        name = rows[0]["indicator"]["value"] if rows else "?"
        print(f"{path.stem}: {len(rows)} values {years[0] if years else '-'}–{years[-1] if years else '-'} · {name}")


if __name__ == "__main__":
    if "--offline" not in sys.argv:
        fetch()
    summary()
