# Sestaví art/kouzla.json z anglických dat SRD 5.2.1 (zdroj/kouzla/srd-5.2.1-spells.json, z 5e-bits/5e-database, src/2024),
# českého překladu (zdroj/kouzla/preklad.json) a Vojtova katalogu (zdroj/kouzla/katalog.json, z Wordu přes katalog.py).
# Text kouzla bere z katalogu; kde automatika karty a Boje čte z katalogového textu jiný výsledek než z dřívějšího
# (zdroj/kouzla/automatika.json, hlídá test), dostane kouzlo dřívější text v polích ta/va jen pro automatiku.
# Spouští se ručně při změně překladu nebo katalogu:  python3 zdroj/kouzla/sestav.py
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))
en = json.load(open(os.path.join(D, "srd-5.2.1-spells.json"), encoding="utf-8"))
cz = {x["index"]: x for x in json.load(open(os.path.join(D, "preklad.json"), encoding="utf-8"))}

def pl(n, a, b, c):  # 1 minuta, 2 minuty, 5 minut
    n = int(n); return a if n == 1 else b if 2 <= n <= 4 else c
JEDN = {"minute": ("minuta", "minuty", "minut"), "hour": ("hodina", "hodiny", "hodin"), "day": ("den", "dny", "dní"),
        "round": ("kolo", "kola", "kol"), "mile": ("míle", "míle", "mil"), "foot": ("stopa", "stopy", "stop")}
def cas(t):
    m = re.fullmatch(r"(\d+)\s+(minute|hour|day|round|mile|foot|feet)s?", t.strip(), re.I)
    if not m: return None
    n, u = m.group(1), m.group(2).lower()
    u = "foot" if u == "feet" else u
    return f"{n} {pl(n, *JEDN[u])}"
SESILANI = {
 "Action": "Akce", "Bonus Action": "Bonusová akce",
 "Bonus Action, which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike": "Bonusová akce hned poté, co zasáhneš cíl zbraní na blízko nebo úderem beze zbraně",
 "Bonus Action, which you take immediately after hitting a creature with a weapon": "Bonusová akce hned poté, co zasáhneš tvora zbraní",
 "Bonus Action, which you take immediately after hitting a creature with a Melee weapon or an Unarmed Strike": "Bonusová akce hned poté, co zasáhneš tvora zbraní na blízko nebo úderem beze zbraně",
 "Reaction, which you take when you see a creature within 60 feet of yourself casting a spell with Verbal, Somatic, or Material components": "Reakce, když vidíš tvora do 60 stop od sebe sesílat kouzlo s verbální, pohybovou nebo materiální složkou",
 "Reaction, which you take when you or a creature you can see within 60 feet of you falls": "Reakce, když ty nebo tvor, kterého vidíš do 60 stop od sebe, padáte",
 "Reaction, which you take in response to taking damage from a creature that you can see within 60 feet of yourself": "Reakce, když utržíš zranění od tvora, kterého vidíš do 60 stop od sebe",
 "Reaction, which you take when you are hit by an attack roll or targeted by the Magic Missile spell": "Reakce, když tě zasáhne hod na útok nebo tě zaměří kouzlo Magic Missile",
 "Action (Overgrowth) or 8 hours (Enrichment)": "Akce (Bujení) nebo 8 hodin (Obohacení)"}
def sesilani(t): return SESILANI.get(t) or cas(t) or t
def dosah(t):
    t = re.sub(r"\s*Component:.*$", "", t).strip()
    return {"Self": "Sebe", "Touch": "Dotyk", "Sight": "Dohled", "Special": "Zvláštní", "Unlimited": "Neomezený"}.get(t) or cas(t) or t
def trvani(t, konc):
    s = t.strip(); low = s.lower()
    if low.startswith("concentration "): s = s[14:]; low = s.lower()
    az = low.startswith("up to ")
    if az: s = s[6:]
    base = {"instantaneous": "Okamžité", "until dispelled": "Do rozptýlení", "until dispelled or triggered": "Do rozptýlení nebo spuštění",
            "special": "Zvláštní"}.get(s.lower()) or cas(s) or s
    if az: base = "až " + base.replace("minuta", "minutu").replace("hodina", "hodinu")
    return ("Concentration, " + base) if konc else base[0].upper() + base[1:]
SKOLY = {"Abjuration": "Abjurace", "Conjuration": "Vyvolávání", "Divination": "Věštění", "Enchantment": "Očarování",
         "Evocation": "Evokace", "Illusion": "Iluze", "Necromancy": "Nekromancie", "Transmutation": "Přeměna"}
POV = {"Bard": "Bard", "Cleric": "Klerik", "Druid": "Druid", "Paladin": "Paladin", "Ranger": "Hraničář",
       "Sorcerer": "Čaroděj", "Warlock": "Černokněžník", "Wizard": "Kouzelník"}
kat = json.load(open(os.path.join(D, "katalog.json"), encoding="utf-8"))
KAT = {x["en"].lower(): x for x in kat}
AUT = json.load(open(os.path.join(D, "automatika.json"), encoding="utf-8")) if os.path.exists(os.path.join(D, "automatika.json")) else {}
pouzite = set()
def z_katalogu(o):
    """text kouzla z katalogu; dřívější text zůstane pro automatiku (ta/va), když ho automatika potřebuje"""
    k = KAT.get(o["en"].lower())
    if not k: return o
    pouzite.add(k["en"].lower())
    if AUT.get(o["en"]) == "stary": o["ta"], o["va"] = o["t"], o["v"]
    elif AUT.get(o["en"]) == "bez": o["ta"], o["va"] = "", ""
    o["t"], o["v"] = k["t"], k["v"]
    if k.get("m"): o["m"] = k["m"]
    if k.get("a"): o["a"] = k["a"]
    o["vt"] = 1
    return o
out, chybi = [], []
for x in sorted(en, key=lambda q: (q["level"], q["name"])):
    t = cz.get(x["index"]) or {}
    if not t: chybi.append(x["index"])
    k = list(x.get("components") or [])
    konc = bool(x.get("concentration")) or x["duration"].lower().startswith("concentration")  # data 5e-bits mají u pár kouzel příznak špatně
    out.append({"i": x["index"], "en": x["name"], "cz": t.get("cz") or "", "l": x["level"], "s": SKOLY.get(x["school"]["name"], x["school"]["name"]),
        "p": [POV.get(c["name"], c["name"]) for c in x.get("classes", [])], "ct": sesilani(x["casting_time"]), "r": dosah(x["range"]),
        "k": k, "m": t.get("mat") or x.get("material") or "", "d": trvani(x["duration"], konc),
        "ko": 1 if konc else 0, "ri": 1 if x.get("ritual") else 0,
        "t": t.get("pop") or x["description"], "v": t.get("vys") or x.get("higher_level") or "", "cs": 1 if t else 0})
    z_katalogu(out[-1])
# kouzla D&D 2024 mimo SRD: vlastní stručné shrnutí mechaniky (pole x = 1), nikdy text příruček
mimo = json.load(open(os.path.join(D, "mimo-srd.json"), encoding="utf-8"))
znama = {x["en"].lower() for x in out}
for x in mimo:
    if x["en"].lower() in znama:
        raise SystemExit(f"CHYBA: kouzlo {x['en']} je už v SRD")
    k = KAT.get(x["en"].lower())
    if k: x = dict(x, **{f: k[f] for f in ("l", "s", "ct", "r", "d", "ko", "ri", "k")})  # u kouzel mimo SRD platí údaje z katalogu
    out.append(z_katalogu(dict(x, x=1, cs=1)))
    znama.add(x["en"].lower())
# kouzla z katalogu, která web dosud neznal (mimo SRD): vše z katalogu
for k in kat:
    if k["en"].lower() in znama: continue
    if not k.get("cz") or not k.get("p"): raise SystemExit(f"CHYBA: kouzlo {k['en']} z katalogu nemá český název nebo povolání (katalog.py: CZ, POV)")
    i = re.sub(r"[^a-z0-9]+", "-", k["en"].lower()).strip("-")
    out.append({"i": i, "en": k["en"], "cz": k["cz"], "l": k["l"], "s": k["s"], "p": k["p"], "ct": k["ct"], "r": k["r"], "k": k["k"], "m": k["m"],
                "d": k["d"], "ko": k["ko"], "ri": k["ri"], "t": k["t"], "v": k["v"], "cs": 1, "x": 1, "vt": 1, **({"a": k["a"]} if k.get("a") else {})})
    if AUT.get(k["en"]) == "bez": out[-1]["ta"] = out[-1]["va"] = ""
    pouzite.add(k["en"].lower())
# licence: obsah mimo SRD jen jako vlastní shrnutí, nejvýš 1 000 znaků (CLAUDE.md, oddíl Licence)
for x in out:
    if x.get("x") and len(x.get("t", "")) > 1000:
        raise SystemExit(f"CHYBA: popis kouzla {x['en']} mimo SRD je delší než 1 000 znaků")
if len(pouzite) != len(kat): raise SystemExit("CHYBA: nepoužitá kouzla z katalogu: " + ", ".join(sorted(set(KAT) - pouzite)))
out.sort(key=lambda q: (q["l"], q["en"]))
json.dump(out, open(os.path.join(ROOT, "art", "kouzla.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"art/kouzla.json: {len(out)} kouzel ({sum(1 for x in out if x.get('x'))} mimo SRD, {sum(1 for x in out if x.get('vt'))} s textem z katalogu, "
      f"{sum(1 for x in out if 'ta' in x)} s dřívějším textem pro automatiku), bez překladu {len(chybi)}")
