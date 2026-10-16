# Sestaví art/kouzla.json z anglických dat SRD 5.2.1 (zdroj/kouzla/srd-5.2.1-spells.json, z 5e-bits/5e-database, src/2024)
# a českého překladu (zdroj/kouzla/preklad.json). Spouští se ručně při změně překladu:  python3 zdroj/kouzla/sestav.py
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
out, chybi = [], []
for x in sorted(en, key=lambda q: (q["level"], q["name"])):
    t = cz.get(x["index"]) or {}
    if not t: chybi.append(x["index"])
    k = list(x.get("components") or [])
    out.append({"i": x["index"], "en": x["name"], "cz": t.get("cz") or "", "l": x["level"], "s": SKOLY.get(x["school"]["name"], x["school"]["name"]),
        "p": [POV.get(c["name"], c["name"]) for c in x.get("classes", [])], "ct": sesilani(x["casting_time"]), "r": dosah(x["range"]),
        "k": k, "m": t.get("mat") or x.get("material") or "", "d": trvani(x["duration"], x.get("concentration")),
        "ko": 1 if x.get("concentration") else 0, "ri": 1 if x.get("ritual") else 0,
        "t": t.get("pop") or x["description"], "v": t.get("vys") or x.get("higher_level") or "", "cs": 1 if t else 0})
json.dump(out, open(os.path.join(ROOT, "art", "kouzla.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"art/kouzla.json: {len(out)} kouzel, bez překladu {len(chybi)}")
