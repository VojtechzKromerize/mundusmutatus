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


# ---- ceny v mincích tažení (Vojta 2026-10-27): 1 GP z pravidel = 10 pražských grošů = 100 haléřů; kopa = 60 grošů,
# uherský zlatý = 40 grošů. Katalog z Wordu zůstává v GP, do art/vybaveni.json jdou groše a kopy (všechny texty kromě mincí).
MINCE_HAL = {"gp": 100, "sp": 10, "cp": 1, "ep": 50, "pp": 1000, "fp": 100}  # FP = překlep ve Wordu (Prismatic Rune)
CENA_RE = re.compile(r"(?<![\d,.])(\d{1,3}(?:[ ,\u00a0]\d{3})+|\d+)\s*(GP|SP|CP|EP|PP|FP)\b", re.I)


def tisice(n):
    return f"{n:,}".replace(",", "\u00a0")


def halere_txt(h):
    """částka v haléřích → „2 kopy 30 gr.“; od deseti kop zaokrouhleně v kopách a zlatých"""
    if h >= 6000:  # od deseti kop stačí celé kopy a zlaté
        kop = round(h / 600)
        return f"{tisice(kop)} kop (≈ {tisice(round(h / 400))} zl.)"
    kop, r = divmod(h, 600)
    gr, hal = divmod(r, 10)
    casti = []
    if kop:
        casti.append(f"{tisice(kop)} {'kopa' if kop == 1 else 'kopy' if kop < 5 else 'kop'}")
    if gr:
        casti.append(f"{gr} gr.")
    if hal:
        casti.append(f"{hal} hal.")
    return " ".join(casti) or "0 gr."


def ceny_tazeni(t, f=1.0):
    """GP/SP/CP v textu → mince tažení; f = násobek (běžné zboží dobově f = 0,2, tj. 1 GP = 2 groše)"""
    t = t.replace("cena v GP dělená deseti", "cena v groších dělená stem")
    t = re.sub(r"\bB\+(?=\d)", "základ + ", t)  # „B+500 GP“ = cena základního předmětu a k tomu částka
    return CENA_RE.sub(lambda m: halere_txt(max(1, round(int(re.sub(r"\D", "", m.group(1))) * MINCE_HAL[m.group(2).lower()] * f))), t)


def ceny_vsude(o, f=1.0):
    if isinstance(o, dict):
        return {k: ceny_vsude(v, f) for k, v in o.items()}
    if isinstance(o, list):
        return [ceny_vsude(v, f) for v in o]
    return ceny_tazeni(o, f) if isinstance(o, str) else o


# ---- dobové ceny běžného zboží (Vojta 2026-10-29: „co nejrealističtěji“): D&D ceny jsou vůči mzdám vysoké – v Čechách 15. století
# bral pacholek 1½ groše a tesař 2 groše denně, kůň stál kolem 2 kop, kráva 24–40 grošů, meč 24–70 grošů, kuše 30–64 grošů,
# plná zbroj 8–40 kop, píšťala kolem 24 a hákovnice kolem 60 grošů (Nowakowski, Uzbrojenie w Polsce 1450–1500; české přehledy cen).
# Běžné zboží proto 1 GP = 2 groše (DOBA_F); kde se dobová cena liší víc, platí přímo DOBA (v groších). Kouzelné a polokouzelné
# věci (lektvary, svitky, alchymie, jedy, magické předměty) dobovou cenu nemají – zůstávají 1 GP = 10 grošů, jako kořist a výkupné.
DOBA_F = 0.2
DOBA = {
    "Pistol": 30, "Musket": 60, "Bullets, Firearm": 2,
    "Plate Armor": 1800, "Half Plate Armor": 900, "Breastplate": 180, "Splint Armor": 300,
    "Greatsword": 60, "Longbow": 48, "Spear": 6,
    "Clothes, Fine": 120, "Clothes, Traveler's": 15, "Book": 300, "Ink": 3, "Parchment": 1,
    "Mule": 60,
}
MAGIE = {"Potion of Healing", "Spell Scroll (Cantrip)", "Spell Scroll (Level 1)", "Acid", "Alchemist's Fire", "Antitoxin",
         "Poison, Basic", "Holy Water", "Bright Fungal Cloak", "Garb of Light and Shadow", "Genie Robe", "Monster Camouflage",
         "Warm Fungal Clothing", "Winter Camouflage", "Devil Mask", "Locking Spellbook"}
BEZNE = ("zbroj", "zbrane", "strelivo", "vybava", "naradi", "zvirata", "sedla", "vozy", "plavidla")


def ceny_dobove(sk, x):
    """položka běžného zboží: cena dobově, popis v téže míře; kouzelné zboží jako dřív"""
    if x.get("en") in MAGIE:
        return ceny_vsude(x)
    o = ceny_vsude(x, DOBA_F)
    if x.get("en") in DOBA:
        o["cena"] = halere_txt(DOBA[x["en"]] * 10)
        o["doba"] = 1
    return o


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
    V = {k: (v if k == "mince" else [ceny_dobove(k, x) for x in v] if k in BEZNE else ceny_vsude(v)) for k, v in V.items()}
    chybi = sorted(set(DOBA) - {x["en"] for sk in BEZNE for x in V[sk]})
    if chybi:
        print("POZOR – dobová cena bez položky v katalogu:", chybi, file=sys.stderr)
    json.dump(V, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"art/vybaveni.json: {sum(len(V[k]) for k in V if isinstance(V[k], list))} položek, magické {len(V['magicke'])} "
          f"(SRD {len(V['magicke']) - mimo}, mimo SRD {mimo}), {os.path.getsize(out) // 1024} kB")
    if dlouhe:
        print(f"shrnutí delší než {MAX_T} znaků:", dlouhe)


if __name__ == "__main__":
    main()
