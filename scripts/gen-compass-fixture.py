"""Golden fixture for test/compass.test.js, computed with pyedautils.

The card's classification (src/compass.js) is a port of
pyedautils.comfort.comfort_compass_distribution. This script classifies a set of
reproducible daily means with pyedautils and writes the expected category per
day and the counts to test/fixtures/compass.json, so the JavaScript port is
checked against the reference implementation.

Only needed when pyedautils changes:

    pip install pyedautils   (or PYTHONPATH=../pyedautils)
    python scripts/gen-compass-fixture.py
"""

import json
import random
import subprocess
from pathlib import Path

import pandas as pd
import pyedautils
from pyedautils.comfort import comfort_compass_distribution

OUT = Path(__file__).resolve().parent.parent / "test" / "fixtures" / "compass.json"


def records(seed, n):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        # Spread over all directions and stages, plus exact zone and band edges.
        t = round(rnd.uniform(14, 32), 2)
        h = round(rnd.uniform(15, 90), 1)
        out.append((t, h))
    edges_t = [20, 26, 19, 27, 17.5, 28.5, 16, 30]
    edges_h = [30, 65, 25, 70, 20, 75]
    for t in edges_t:
        out.append((float(t), 50.0))
    for h in edges_h:
        out.append((23.0, float(h)))
    return out


def classify_one(t, h, kw):
    df = pd.DataFrame({"temperature": [t], "humidity": [h]})
    counts = comfort_compass_distribution(df, aggregate_daily=False, **kw)
    return next(k for k, v in counts.items() if v)


CASES = [
    {
        "name": "default zone with absolute humidity",
        "comfort_zone": {"temperature": [20, 26], "humidity": [30, 65], "absolute_humidity": [0, 12]},
        "warning_bands": None,
        "pressure": 101325,
        "seed": 1,
    },
    {
        "name": "relative humidity only",
        "comfort_zone": {"temperature": [20, 26], "humidity": [30, 65]},
        "warning_bands": None,
        "pressure": 101325,
        "seed": 2,
    },
    {
        "name": "custom bands, narrow zone, 450 m",
        "comfort_zone": {"temperature": [21, 24], "humidity": [35, 55], "absolute_humidity": [4, 10]},
        "warning_bands": {
            "orange": {"temperature": 0.5, "humidity": 3, "absolute_humidity": 0.5},
            "red": {"temperature": 2, "humidity": 8, "absolute_humidity": 2},
        },
        "pressure": 96034.58,
        "seed": 3,
    },
]


def pyedautils_version():
    """Git commit of the pyedautils checkout, else the installed version."""
    try:
        root = Path(pyedautils.__file__).resolve().parent.parent
        return subprocess.check_output(["git", "-C", str(root), "describe", "--always", "--dirty"], text=True).strip()
    except Exception:
        return getattr(pyedautils, "__version__", "?")


def main():
    cases = []
    for c in CASES:
        cz, wb = c["comfort_zone"], c["warning_bands"] or {}
        o, r = wb.get("orange", {}), wb.get("red", {})
        kw = {
            "temp_band": tuple(cz["temperature"]),
            "hum_band": tuple(cz["humidity"]),
            "hum_abs_band": tuple(v / 1000 for v in cz["absolute_humidity"]) if "absolute_humidity" in cz else None,
            "pressure": c["pressure"],
            "temp_stage_limits": (o.get("temperature", 1.0), r.get("temperature", 2.5)),
            "hum_stage_limits": (o.get("humidity", 5.0), r.get("humidity", 10.0)),
            "hum_abs_stage_limits": (o.get("absolute_humidity", 1.0) / 1000, r.get("absolute_humidity", 2.5) / 1000),
        }
        recs = records(c["seed"], 300)
        df = pd.DataFrame({"temperature": [t for t, _ in recs], "humidity": [h for _, h in recs]})
        cases.append({
            "name": c["name"],
            "comfort_zone": cz,
            "warning_bands": c["warning_bands"],
            "pressure": c["pressure"],
            "records": [{"t": t, "rh": h, "expected": classify_one(t, h, kw)} for t, h in recs],
            "counts": comfort_compass_distribution(df, aggregate_daily=False, **kw),
        })
    OUT.write_text(json.dumps({"pyedautils": pyedautils_version(), "cases": cases}, separators=(",", ":")) + "\n",
                   encoding="utf-8", newline="\n")
    print(f"wrote {OUT} ({sum(len(c['records']) for c in cases)} records)")


if __name__ == "__main__":
    main()
