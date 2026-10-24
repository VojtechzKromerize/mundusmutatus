# Sestaví art/vybaveni.json: Vojtův Přehled vybavení (katalog.json z katalog.py) doplněný o pravidla Artikulí
# (vlastnosti zbraní, druh zbroje s Resistance a počtem obětování) a o vazbu na magické předměty SRD (art/predmety.json).
#   python3 zdroj/vybaveni/sestav.py        (ručně, po změně katalogu; výsledek patří do repozitáře)
# Licence: zbraně, zbroj, výbava, nářadí, zvířata, doprava a jedy jsou v SRD 5.2.1; texty jsou Vojtova vlastní shrnutí.
# Magické předměty mimo SRD (bez „srd“) nesou x: 1 – web u nich ukáže upozornění, že nejde o oficiální text.
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))
MAX_T = 1000  # nejdelší vlastní shrnutí (znaků) – jako u kouzel (Vojtovo rozhodnutí 2026-10-20)

# Artikule › Výzbroj › Zbraně: vlastnost → zbraně (Handgun = Musket a Pistol)
ARTZV = {"Krvežíznivá": ["Sickle", "Scimitar", "Glaive", "Longbow", "Shortbow"],
         "Drtivá": ["Maul", "Mace", "Flail", "Warhammer"],
         "Omračující": ["Club", "Greatclub", "Mace", "Flail", "Morningstar", "Maul", "Sling"],
         "Ratiště": ["Halberd", "Pike", "Glaive", "Spear"],
         "Ničivá": ["Warhammer", "War Pick", "Heavy Crossbow", "Musket"],
         "Průrazná": ["Pistol", "Musket", "Heavy Crossbow", "Lance", "Halberd", "War Pick"],
         "Odvetná": ["Shortsword", "Longsword", "Rapier", "Greatsword"],
         "Šikovná": ["Shortsword", "Longsword", "Greatsword", "Halberd"],
         "Přibodnutí": ["Spear", "Pike"],
         "Ostrá": ["Shortsword", "Longsword", "Greatsword", "Scimitar", "Battleaxe"], "Půlmeč": ["Longsword", "Greatsword"],
         "Do slabin!": ["Dagger"], "Strhující": ["Halberd"], "Vpřed!": ["Lance"], "Štěpící": ["Greataxe", "Handaxe", "Battleaxe"],
         "Nepřímá": ["Longbow", "Shortbow", "Sling"], "Hrom a kouř!": ["Pistol", "Musket"]}
# Artikule › Výzbroj › Zbroj: druh → zbroje
ARTZB = {"Vycpávaná": ["Padded Armor", "Leather Armor", "Studded Leather Armor", "Hide Armor"],
         "Kroužková": ["Chain Shirt", "Scale Mail", "Ring Mail", "Chain Mail"],
         "Plátová": ["Breastplate", "Half Plate Armor", "Splint Armor"], "Komplexní": ["Plate Armor"], "Štít": ["Shield"]}
# jména v katalogu → jména v SRD (předměty se jmény tvůrců, varianty)
SRDJM = {"apparatus of kwalish": "apparatus-of-the-crab", "heward's handy haversack": "handy-haversack", "quaal's feather token": "feather-token",
         "daern's instant fortress": "instant-fortress", "iron bands of bilarro": "iron-bands", "nolzur's marvelous pigments": "marvelous-pigments",
         "deck of many things": "mysterious-deck", "quiver of ehlonna": "efficient-quiver", "orb of dragonkind": "dragon-orb",
         "weapon, +1, +2 or +3": "weapon-1", "wand of the war mage, +1, +2 or +3": "wand-of-the-war-mage-1", "armor, +1, +2 or +3": "armor-1",
         "shield, +1, +2 or +3": "shield-1", "ammunition, +1, +2 or +3": "ammunition-1"}


def norm(s):
    return re.sub(r"[’']", "'", str(s or "").lower()).strip()


def slug(s):
    s = norm(s).replace("+", "plus")
    s = re.sub(r"[^a-z0-9]+", "-", s.encode("ascii", "ignore").decode()).strip("-")
    return s


def main():
    K = json.load(open(os.path.join(D, "katalog.json"), encoding="utf-8"))
    P = json.load(open(os.path.join(ROOT, "art", "predmety.json"), encoding="utf-8"))
    srd = {norm(p["en"]): p["id"] for p in P}
    for p in P:  # „Belt of Giant Strength (hill)“ → i bez varianty
        base = norm(re.sub(r"\s*\([^)]*\)\s*$", "", p["en"]))
        srd.setdefault(base, p["id"])
        m = re.match(r"^(.*),\s*\+1$", p["en"])  # „Weapon, +1“ → „+1 weapon“ i „weapon +1“
        if m:
            srd.setdefault(norm("+1 " + m.group(1)), p["id"])
    V = {k: K[k] for k in ("zbroj", "zbrane", "strelivo", "vybava", "naradi", "zvirata", "sedla", "vozy", "plavidla", "jedy", "magicke",
                            "vlastnosti", "mistrovstvi", "mince", "vyroba", "uvod")}
    # vlastnosti a mistrovství zbraní: plné znění z Pravidel (zdroj/pravidla/04-srd.md, Vojtův překlad 2026-10-24) místo shrnutí z Wordu
    md = open(os.path.join(ROOT, "zdroj", "pravidla", "04-srd.md"), encoding="utf-8").read()
    for klic, nadpis in (("vlastnosti", "Weapon Traits"), ("mistrovstvi", "Weapon Masteries")):
        oddil = re.search(r"#### " + nadpis + r".*?\n(.*?)(?=\n#### )", md, re.S).group(1)
        V[klic] = {m.group(1): {"cz": m.group(2), "t": m.group(3).strip()} for m in re.finditer(r"\*\*([A-Za-z-]+) \(([^)]+)\)\.\*\* (.+)", oddil)}
    for z in V["zbrane"]:
        z["art"] = [v for v, L in ARTZV.items() if z["en"] in L]
        z["id"] = slug(z["en"])
    for z in V["zbroj"]:
        z["art"] = next((d for d, L in ARTZB.items() if z["en"] in L), "")
        z["id"] = slug(z["en"])
    for sk in ("strelivo", "vybava", "naradi", "zvirata", "sedla", "vozy", "plavidla", "jedy"):
        for x in V[sk]:
            x["id"] = slug(x["en"])
    # Potion of Healing je ve výbavě (koupit za 50 GP) i mezi magickými předměty (varianty) – ve výbavě dostane vlastní id
    for x in V["vybava"]:
        if x["id"] == "potion-of-healing":
            x["id"] = "potion-of-healing-vybava"
    for p in V["plavidla"]:
        if p.get("druh") == "vzducholoď":
            p["x"] = 1  # Eberron – mimo SRD
    dlouhe, mimo = [], 0
    # české názvy zvolené při sjednocení s Vojtovou tabulkou předmětů (2026-10-24) – i pro art/predmety.json (zdroj/srd/sestav.py)
    JMENA = {k.lower(): v for k, v in json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "jmena.json"), encoding="utf-8")).items()}
    for m in V["magicke"]:
        if m["en"].lower() in JMENA:
            m["cz"] = JMENA[m["en"].lower()]
        key = norm(m["en"])
        sid = SRDJM.get(key) or srd.get(key) or srd.get(re.sub(r"^\+\d\s+", "", key))
        if sid:
            m["srd"] = sid
        else:
            m["x"] = 1
            mimo += 1
        m["id"] = slug(m["en"])
        if any(q is not m and q["en"] == m["en"] for q in V["magicke"]):
            m["id"] += "-" + slug(m["vz"])
        if len(m.get("t", "")) > MAX_T:
            dlouhe.append((m["en"], len(m["t"])))
    ids = [x["id"] for sk in ("zbroj", "zbrane", "strelivo", "vybava", "naradi", "zvirata", "sedla", "vozy", "plavidla", "jedy", "magicke") for x in V[sk]]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        print("POZOR – zdvojené id:", dup, file=sys.stderr)
    out = os.path.join(ROOT, "art", "vybaveni.json")
    json.dump(V, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"art/vybaveni.json: {sum(len(V[k]) for k in V if isinstance(V[k], list))} položek, magické {len(V['magicke'])} "
          f"(SRD {len(V['magicke']) - mimo}, mimo SRD {mimo}), {os.path.getsize(out) // 1024} kB")
    if dlouhe:
        print(f"shrnutí delší než {MAX_T} znaků:", dlouhe)


if __name__ == "__main__":
    main()
