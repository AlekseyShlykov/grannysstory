"""Run the offline pipeline: validate → normalise (SQLite) → export (static packs + reports).

  python3 scripts/historical-data/run_pipeline.py            # uses cached Wikidata entities
  python3 scripts/historical-data/run_pipeline.py --collect  # first refresh missing Wikidata entities (network)
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def step(*args: str) -> None:
    print(f"\n== {' '.join(args)}")
    result = subprocess.run([sys.executable, *args])
    if result.returncode:
        sys.exit(result.returncode)


if __name__ == "__main__":
    if "--collect" in sys.argv:
        step(str(HERE / "collect" / "wikidata_locations.py"))
    step(str(HERE / "validate" / "validate.py"), "--quiet-warnings", "--report", "docs/VALIDATION_REPORT.md")
    step(str(HERE / "normalize" / "build_sqlite.py"))
    step(str(HERE / "export" / "export.py"))
