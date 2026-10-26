"""Build public/data.json for Time Machine for Money.

Standard library only. Run from the project root:

    python scripts/build_data.py

Raw downloads are cached in scripts/.cache so re-runs work offline and stay
inside the BLS public API's daily limit.

Sources
- World Bank WDI (CC BY 4.0): CPI, official exchange rate, GDP per capita (LCU).
- World Bank WDI Database Archives (CC BY 4.0): pump price for gasoline, US$/litre.
- World Bank Commodity Price Data, "Pink Sheet" (CC BY 4.0): gold, silver, US$/troy oz.
- US Bureau of Labor Statistics average prices (public domain).
- UK Office for National Statistics RPI average prices (Open Government Licence v3.0).
- Single reference prices cited in REFERENCE_PRICES below.
"""

import json
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / ".cache"
OUT = ROOT / "public" / "data.json"
UA = {"User-Agent": "Mozilla/5.0 (money-time-machine data build)"}

FIRST_YEAR = 1960
LAST_YEAR = date.today().year - 1  # the current year never has annual data yet

# Add a country here and it flows through the whole site. Countries without
# local item prices still get CPI, income, fuel (where the World Bank has it)
# and gold.
COUNTRIES = [
    {"iso3": "IND", "name": "India", "currency": "INR", "symbol": "₹", "defaultAmount": 100},
    {"iso3": "USA", "name": "United States", "currency": "USD", "symbol": "$", "defaultAmount": 100},
    {"iso3": "GBR", "name": "United Kingdom", "currency": "GBP", "symbol": "£", "defaultAmount": 100},
    {"iso3": "JPN", "name": "Japan", "currency": "JPY", "symbol": "¥", "defaultAmount": 10000},
    {"iso3": "BRA", "name": "Brazil", "currency": "BRL", "symbol": "R$", "defaultAmount": 100,
     "currencyNote": {"before": 1994,
                      "text": "Brazil adopted the real in July 1994. Earlier years are older currencies converted to reais by the World Bank, so they are not amounts anyone held at the time."}},
]

ITEMS = [
    {"id": "bread", "name": "Loaf of white bread", "unit": "800 g loaf", "plural": "loaves"},
    {"id": "milk", "name": "Milk", "unit": "1 litre", "plural": "litres of milk"},
    {"id": "fuel", "name": "Petrol", "unit": "1 litre", "plural": "litres of petrol"},
    {"id": "ticket", "name": "Cinema ticket", "unit": "1 average ticket", "plural": "cinema tickets"},
    {"id": "gold", "name": "Gold", "unit": "1 gram", "plural": "grams of gold"},
]

WB_SERIES = {
    "cpi": "FP.CPI.TOTL",       # Consumer price index (2010 = 100)
    "fx": "PA.NUS.FCRF",        # Official exchange rate (LCU per US$, period average)
    "gdppc": "NY.GDP.PCAP.CN",  # GDP per capita (current LCU)
}

TROY_OZ_G = 31.1034768
US_GALLON_L = 3.785411784
UK_PINT_L = 0.56826125
LB_G = 453.59237

# One-off published figures, each with its source. Values are local currency
# per the item's unit (bread already scaled to 800 g where noted).
REFERENCE_PRICES = {
    "IND": {
        "milk": {"year": 2024, "value": 58.98,
                 "source": "Dept. of Consumer Affairs (India) daily all-India average retail price, 7 Jun 2024, as reported by CEIC"},
        "ticket": {"year": 2024, "value": 134,
                   "source": "Ormax Media, The Ormax Box Office Report 2024 (all-India average ticket price)"},
    },
    "USA": {
        "ticket": {"year": 2024, "value": 11.31,
                   "source": "The Numbers, average North American ticket price 2024 (estimated from AMC, Cinemark and Cineplex filings)"},
    },
    "GBR": {
        "ticket": {"year": 2023, "value": 7.92,
                   "source": "UK Cinema Association, average admission price 2023 (as reported by Statista)"},
    },
    "JPN": {
        "bread": {"year": 2024, "value": round(531 * 0.8, 1),
                  "source": "Statistics Bureau of Japan, Retail Price Survey, white bread per kg, Ku-area of Tokyo, Jan 2024 (¥531/kg, scaled to 800 g)"},
        "milk": {"year": 2024, "value": 255,
                 "source": "Statistics Bureau of Japan, Retail Price Survey, fresh milk 1,000 mL, Ku-area of Tokyo, Jan 2024"},
        "ticket": {"year": 2024, "value": 1433,
                   "source": "Motion Picture Producers Association of Japan (Eiren), average admission price 2024"},
    },
    "BRA": {
        "ticket": {"year": 2024, "value": 19.88,
                   "source": "ANCINE, Mercado Audiovisual Brasileiro 2002-2024, average ticket price 2024"},
    },
}


# ---------------------------------------------------------------- helpers

def fetch(url, cache_name, data=None, headers=None, max_age_days=7):
    """GET/POST with a file cache. Falls back to a stale cache if offline."""
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / cache_name
    if path.exists() and time.time() - path.stat().st_mtime < max_age_days * 86400:
        return path.read_bytes()
    try:
        req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
        path.write_bytes(body)
        return body
    except Exception as e:  # noqa: BLE001
        if path.exists():
            print(f"  ! {cache_name}: {e} - using cached copy", file=sys.stderr)
            return path.read_bytes()
        raise


def years():
    return list(range(FIRST_YEAR, LAST_YEAR + 1))


def as_array(by_year, digits=6):
    out = []
    for y in years():
        v = by_year.get(y)
        out.append(None if v is None else float(f"{v:.{digits}g}"))
    return out


# ---------------------------------------------------------------- World Bank

def wb_indicator(code):
    isos = ";".join(c["iso3"] for c in COUNTRIES)
    url = (f"https://api.worldbank.org/v2/country/{isos}/indicator/{code}"
           f"?format=json&per_page=20000&date={FIRST_YEAR}:{LAST_YEAR}")
    meta, rows = json.loads(fetch(url, f"wb_{code}.json"))
    out = {c["iso3"]: {} for c in COUNTRIES}
    for r in rows or []:
        if r["value"] is not None and r["countryiso3code"] in out:
            out[r["countryiso3code"]][int(r["date"])] = r["value"]
    return out, meta.get("lastupdated")


def wb_fuel():
    """Pump price for gasoline (US$/litre), WDI archive version 2020-12."""
    isos = ";".join(c["iso3"] for c in COUNTRIES)
    url = (f"https://api.worldbank.org/v2/sources/57/country/{isos}/series/EP.PMP.SGAS.CD"
           f"/version/202012/time/all?format=json&per_page=5000")
    doc = json.loads(fetch(url, "wb_fuel_archive.json", max_age_days=365))
    out = {c["iso3"]: {} for c in COUNTRIES}
    for r in doc["source"]["data"]:
        if r["value"] is None:
            continue
        var = {v["concept"]: v for v in r["variable"]}
        out[var["Country"]["id"]][int(var["Time"]["value"])] = r["value"]
    return out


def pink_sheet():
    """Annual nominal gold and silver prices (US$/troy oz)."""
    page = fetch("https://www.worldbank.org/en/research/commodity-markets", "cmo_page.html").decode("utf8", "ignore")
    m = re.search(r'https?://[^"\']*CMO-Historical-Data-Annual\.xlsx', page)
    if not m:
        raise RuntimeError("Pink Sheet link not found on the commodity-markets page")
    raw = fetch(m.group(0), "cmo_annual.xlsx")
    ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    rid = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
    import io
    z = zipfile.ZipFile(io.BytesIO(raw))
    strings = ["".join(t.itertext()) for t in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", ns)]
    rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
    sheet = next(s for s in ET.fromstring(z.read("xl/workbook.xml")).find("m:sheets", ns)
                 if s.get("name") == "Annual Prices (Nominal)")
    root = ET.fromstring(z.read("xl/" + rels[sheet.get(rid)].lstrip("/").removeprefix("xl/")))
    grid = []
    for row in root.iter(f"{{{ns['m']}}}row"):
        cells = {}
        for c in row:
            v = c.find("m:v", ns)
            if v is None:
                continue
            col = re.match(r"[A-Z]+", c.get("r")).group()
            cells[col] = strings[int(v.text)] if c.get("t") == "s" else v.text
        grid.append(cells)
    header = next(r for r in grid if "Gold" in r.values())
    cols = {name: col for col, name in header.items() if name in ("Gold", "Silver")}
    updated = next((v for r in grid[:6] for v in r.values() if str(v).startswith("Updated")), "")
    out = {"gold": {}, "silver": {}}
    for r in grid:
        y = r.get("A", "")
        if re.fullmatch(r"\d{4}", str(y)):
            for k, col in cols.items():
                try:
                    out[k.lower()][int(y)] = float(r[col])
                except (KeyError, ValueError):
                    pass
    return out, updated


# ---------------------------------------------------------------- national series

def bls_annual():
    """US average prices: bread (per lb), whole milk (per gallon), gasoline (per gallon)."""
    series = {"bread": "APU0000702111", "milk": "APU0000709112", "fuel": "APU00007471A"}
    monthly = {k: {} for k in series}
    for start in range(1980, LAST_YEAR + 1, 10):
        end = min(start + 9, LAST_YEAR)
        body = json.dumps({"seriesid": list(series.values()), "startyear": str(start), "endyear": str(end)}).encode()
        doc = json.loads(fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", f"bls_{start}.json",
                               data=body, headers={"Content-Type": "application/json"}, max_age_days=30))
        if doc.get("status") != "REQUEST_SUCCEEDED":
            raise RuntimeError(f"BLS: {doc.get('message')}")
        for s in doc["Results"]["series"]:
            key = next(k for k, v in series.items() if v == s["seriesID"])
            for d in s["data"]:
                if d["period"].startswith("M") and d["period"] != "M13" and d["value"] not in ("-", ""):
                    monthly[key].setdefault(int(d["year"]), []).append(float(d["value"]))
    factor = {"bread": 800 / LB_G, "milk": 1 / US_GALLON_L, "fuel": 1 / US_GALLON_L}
    return {k: {y: sum(v) / len(v) * factor[k] for y, v in by_year.items() if len(v) >= 6}
            for k, by_year in monthly.items()}


def ons_annual():
    """UK RPI average prices: white sliced 800 g loaf (CZOH), pasteurised milk pint (CZNT). Pence."""
    out = {}
    for key, cdid, factor in (("bread", "czoh", 1 / 100), ("milk", "cznt", 1 / 100 / UK_PINT_L)):
        doc = json.loads(fetch(f"https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/{cdid}/mm23/data",
                               f"ons_{cdid}.json"))
        out[key] = {int(y["year"]): float(y["value"]) * factor for y in doc["years"] if y["value"]}
    return out


# ---------------------------------------------------------------- assemble

def main():
    print("World Bank indicators...")
    wb, wb_updated = {}, None
    for k, code in WB_SERIES.items():
        wb[k], wb_updated = wb_indicator(code)
    print("World Bank fuel archive...")
    fuel_usd = wb_fuel()
    print("Pink Sheet (gold, silver)...")
    metals, pink_updated = pink_sheet()
    print("BLS (US)...")
    bls = bls_annual()
    print("ONS (UK)...")
    ons = ons_annual()

    countries = []
    gaps = []
    for c in COUNTRIES:
        iso = c["iso3"]
        fx = wb["fx"][iso]
        prices = {}

        def put(item, year, value, source, kind):
            prices.setdefault(item, {})[str(year)] = {"v": float(f"{value:.5g}"), "s": source, "k": kind}

        # gold: world price converted with that year's exchange rate
        for y, usd in metals["gold"].items():
            if y in fx and FIRST_YEAR <= y <= LAST_YEAR:
                put("gold", y, usd / TROY_OZ_G * fx[y], "pink", "derived")
        # fuel: national series where we have one, otherwise World Bank US$/litre x exchange rate
        if iso == "USA":
            for y, v in bls["fuel"].items():
                put("fuel", y, v, "bls", "observed")
        else:
            for y, usd in fuel_usd.get(iso, {}).items():
                if y in fx:
                    put("fuel", y, usd * fx[y], "wbfuel", "observed")
        if iso == "USA":
            for item in ("bread", "milk"):
                for y, v in bls[item].items():
                    put(item, y, v, "bls", "observed")
        if iso == "GBR":
            for item in ("bread", "milk"):
                for y, v in ons[item].items():
                    if FIRST_YEAR <= y <= LAST_YEAR:
                        put(item, y, v, "ons", "observed")
        for item, ref in REFERENCE_PRICES.get(iso, {}).items():
            src_id = f"ref:{iso}:{item}"
            put(item, ref["year"], ref["value"], src_id, "reference")

        for it in ITEMS:
            if it["id"] not in prices:
                gaps.append(f"{c['name']}: {it['name']}")
        countries.append({
            **c,
            "cpi": as_array(wb["cpi"][iso]),
            "fx": as_array(fx),
            "gdppc": as_array(wb["gdppc"][iso]),
            "prices": prices,
        })

    sources = {
        "wb": {"name": "World Bank, World Development Indicators", "licence": "CC BY 4.0",
               "url": "https://data.worldbank.org/", "updated": wb_updated},
        "wbfuel": {"name": "World Bank, WDI Database Archives: pump price for gasoline (US$ per litre), converted at the official exchange rate",
                   "licence": "CC BY 4.0", "url": "https://databank.worldbank.org/source/wdi-database-archives"},
        "pink": {"name": "World Bank Commodity Price Data (Pink Sheet): gold, US$ per troy ounce, converted at the official exchange rate",
                 "licence": "CC BY 4.0", "url": "https://www.worldbank.org/en/research/commodity-markets",
                 "updated": pink_updated.replace("Updated on ", "")},
        "bls": {"name": "US Bureau of Labor Statistics, CPI average prices (white bread per lb, whole milk per gallon, gasoline per gallon), converted to 800 g and litres",
                "licence": "Public domain", "url": "https://www.bls.gov/cpi/factsheets/average-prices.htm"},
        "ons": {"name": "UK Office for National Statistics, RPI average prices: white sliced loaf 800 g (CZOH), pasteurised milk per pint (CZNT)",
                "licence": "Open Government Licence v3.0", "url": "https://www.ons.gov.uk/economy/inflationandpriceindices"},
    }
    for iso, refs in REFERENCE_PRICES.items():
        for item, ref in refs.items():
            sources[f"ref:{iso}:{item}"] = {"name": ref["source"], "licence": "Cited figure"}

    data = {
        "generated": date.today().isoformat(),
        "years": [FIRST_YEAR, LAST_YEAR],
        "items": ITEMS,
        "countries": countries,
        "metals": {"gold": as_array(metals["gold"]), "silver": as_array(metals["silver"])},
        "sources": sources,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf8")
    print(f"Wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size / 1024:.0f} KB)")
    for c in countries:
        def span(arr):
            ys = [y for y, v in zip(years(), arr) if v is not None]
            return f"{ys[0]}-{ys[-1]}" if ys else "none"
        print(f"  {c['iso3']}: cpi {span(c['cpi'])}, fx {span(c['fx'])}, income {span(c['gdppc'])}, "
              f"items {', '.join(f'{k}({len(v)})' for k, v in c['prices'].items())}")
    if gaps:
        print("  No price anchor at all (shown as 'no data'): " + "; ".join(gaps))


if __name__ == "__main__":
    main()
