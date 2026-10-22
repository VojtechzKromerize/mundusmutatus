# Sestaví art/mimo-srd.json z obsahu D&D 2024 mimo SRD 5.2.1 (podtřídy, featy, zázemí, druhy).
# Texty jsou VLASTNÍ stručná shrnutí mechaniky – nikdy sem nevkládej text příruček (viz CLAUDE.md › Licence).
# Kouzla mimo SRD jsou v zdroj/kouzla/mimo-srd.json a přidává je zdroj/kouzla/sestav.py.
# Spuštění: python3 zdroj/mimo-srd/sestav.py   (zkontroluje formát a délky, při chybě skončí)
import json, os, sys

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))
nacti = lambda n: json.load(open(os.path.join(D, n), encoding="utf-8"))

POV = {"Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"}
VL = {"STR", "AGI", "DEX", "CON", "INT", "WIS", "CHA"}
CAS = {"A", "BA", "R"}
KAT = {"origin", "general", "fightStyle", "epic"}
EF = {"ac", "rych", "ini", "hpU", "hpL", "spab", "ov"}  # ov: ["CHA", "WIS"] = k ověřením CHA přičti modifikátor WIS (min. 1)
chyby = []


def chyba(kde, co):
    chyby.append(f"{kde}: {co}")


def rys(r, kde, max_t=350):
    k = f"{kde} › {r.get('en', '?')}"
    for p in ("en", "cz", "t"):
        if not r.get(p):
            chyba(k, f"chybí {p}")
    if len(r.get("t", "")) > max_t:
        chyba(k, f"text má {len(r['t'])} znaků (max. {max_t})")
    if r.get("cas") and r["cas"] not in CAS:
        chyba(k, f"neznámý čas {r['cas']}")
    p = r.get("pocet")
    if p is not None and not (isinstance(p, int) or (isinstance(p, str) and (p == "PB" or p in VL)) or
                              (isinstance(p, list) and all(isinstance(x, list) and len(x) == 2 for x in p))):
        chyba(k, f"neznámý počet {p!r}")
    for e, v in (r.get("ef") or {}).items():
        if e not in EF:
            chyba(k, f"neznámý efekt {e}")
        if e == "ov" and not (isinstance(v, list) and len(v) == 2 and v[0] in VL and (v[1] in VL or v[1] == "PB")):
            chyba(k, f"efekt ov musí být [vlastnost ověření, vlastnost bonusu nebo PB], ne {v!r}")


podtridy = nacti("podtridy.json")
featy = nacti("featy.json")
zazemi = nacti("zazemi.json")
druhy = nacti("druhy.json")

ids = set()
for p in podtridy:
    kde = p.get("en", "?")
    if p.get("tr") not in POV:
        chyba(kde, f"neznámé povolání {p.get('tr')}")
    if p.get("id") in ids:
        chyba(kde, "id už existuje")
    ids.add(p.get("id"))
    if len(p.get("t", "")) > 150:
        chyba(kde, "popis podtřídy je delší než 150 znaků")
    for r in p.get("rysy", []):
        rys(r, kde)
        if not isinstance(r.get("u"), int) or not 3 <= r["u"] <= 20:
            chyba(f"{kde} › {r.get('en')}", f"úroveň {r.get('u')!r} mimo 3–20")
for f in featy:
    rys(f, "feat")
    if f.get("kat") not in KAT:
        chyba(f"feat {f.get('en')}", f"neznámá kategorie {f.get('kat')}")
for z in zazemi:
    for p in ("en", "cz", "vl", "feat", "dov"):
        if not z.get(p):
            chyba(f"zázemí {z.get('en')}", f"chybí {p}")
for d in druhy:
    for r in d.get("rysy", []):
        rys(r, f"druh {d.get('en')}")

if chyby:
    sys.exit("CHYBA v zdroj/mimo-srd:\n  " + "\n  ".join(chyby))

out = {"podtridy": podtridy, "featy": featy, "zazemi": zazemi, "druhy": druhy}
json.dump(out, open(os.path.join(ROOT, "art", "mimo-srd.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"art/mimo-srd.json: {len(podtridy)} podtříd ({sum(len(p['rysy']) for p in podtridy)} rysů), "
      f"{len(featy)} featů, {len(zazemi)} zázemí, {len(druhy)} druhů")
