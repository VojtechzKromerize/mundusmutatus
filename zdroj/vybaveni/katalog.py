# Převede Vojtův Přehled vybavení (Word) do zdroj/vybaveni/katalog.json; sestav.py z něj (a z Artikulí) vyrobí art/vybaveni.json.
#   python3 zdroj/vybaveni/katalog.py Prehled_Vybaveni.docx      (potřebuje pandoc)
# Texty jsou Vojtova vlastní shrnutí (žádný text z PHB/DMG mimo SRD); převod jen sjednotí výrazy s webem (DEX → AGI,
# typy zranění anglicky, kostky), aby na ně navázala karta postavy a Boj.
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))

TYPZR = {"drtivé": "Bludgeoning", "bodné": "Piercing", "sečné": "Slashing", "ohnivé": "Fire", "mrazivé": "Cold", "bleskové": "Lightning",
         "hromové": "Thunder", "kyselinové": "Acid", "jedové": "Poison", "prokleté": "Necrotic", "nekrotické": "Necrotic", "svaté": "Radiant",
         "zářivé": "Radiant", "psychické": "Psychic", "silové": "Force"}
RARITY = {"Common": "běžný", "Uncommon": "neobvyklý", "Rare": "vzácný", "Very Rare": "velmi vzácný", "Legendary": "legendární", "Artifact": "artefakt"}


def txt(x):
    if isinstance(x, list):
        return "".join(txt(i) for i in x)
    if isinstance(x, dict):
        t, c = x.get("t"), x.get("c")
        if t == "Str":
            return c
        if t in ("Space", "SoftBreak", "LineBreak"):
            return " "
        if t in ("Emph", "Strong", "Para", "Plain", "Underline", "SmallCaps", "Strikeout"):
            return txt(c)
        if t in ("Span", "Link", "Quoted"):
            return txt(c[1])
        if t == "Div":
            return txt(c[1])
        if t in ("BulletList", "OrderedList"):
            items = c if t == "BulletList" else c[1]
            return " ".join("• " + txt(i) for i in items)
    return ""


def table(b):
    head, bodies = b["c"][3], b["c"][4]
    rows = lambda rs: [[norm(txt(cell[4])) for cell in r[1]] for r in rs]
    H = rows(head[1])
    B = []
    for body in bodies:
        B += rows(body[3])
    return (H[0] if H else []), B


def norm(s):
    s = re.sub(r"\s+", " ", s or "").strip()
    s = s.replace(" ", " ")
    return s


def sjednot(s):
    """Výrazy jako na webu: kostky, vlastnosti AGI, typy zranění anglicky, DC → SO zůstává (web používá SO i DC)."""
    s = norm(s)
    s = re.sub(r"\b(\d*)k(\d+)\b", r"\1d\2", s)
    s = re.sub(r"\bDEX\b", "AGI", s)
    for cz, en in TYPZR.items():
        s = re.sub(r"\b" + cz + r"(ho|mu|m|)\s+zranění", en, s)
        s = re.sub(r"\b" + cz + r"ho\b", en, s)
    return s


def jmeno(s):
    """„Longsword (dlouhý meč)“ → ("Longsword", "dlouhý meč"); bez závorky → (s, "")"""
    s = norm(s)
    m = re.match(r"^(.*?)\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)\s*$", s)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return s, ""


def lb(s):
    s = norm(s).replace(",", "")
    m = re.match(r"^(\d+)(?:\s+(\d)/(\d))?\s*lb", s) or re.match(r"^(\d+)/(\d+)\s*lb", s)
    if not m:
        m2 = re.match(r"^(\d+(?:\.\d+)?)\s*lb", s)
        return float(m2.group(1)) if m2 else None
    if m.re.pattern.startswith("^(\\d+)/"):
        return int(m.group(1)) / int(m.group(2))
    v = int(m.group(1))
    if m.group(2):
        v += int(m.group(2)) / int(m.group(3))
    return v


def cena(s):
    return norm(s).replace(" GP", " GP").replace(" ", " ")


def zbran(r):
    en, cz = jmeno(r[0])
    zv = sjednot(r[1])
    m = re.match(r"^(\d+(?:d\d+)?)\s+(\w+)\s*(.*)$", zv)
    dmg, typ, rest = (m.group(1), m.group(2), m.group(3)) if m else ("", "", zv)
    # vlastnosti: „Finesse (obratná), Light (lehká), Thrown (vrhací) (Range (dostřel) 20/60)“
    vl, rng, strel = [], "", ""
    for v in re.split(r",\s*(?=[A-Z])", rest):
        v = v.strip()
        if not v:
            continue
        nm = re.match(r"^([A-Za-z-]+)", v)
        if not nm:
            continue
        name = nm.group(1)
        rm = re.search(r"\(Range[^)]*\)\s*(\d+/\d+)(?:;\s*([A-Za-z ]+))?\)?", v) or re.search(r"(\d+/\d+)(?:;\s*([A-Za-z ]+))?", v)
        if rm:
            rng = rm.group(1)
            if rm.group(2):
                strel = rm.group(2).strip()
        vm = re.match(r"^Versatile[^)]*\)\s*\((\d+d\d+)\)", v) or re.search(r"\((\d+d\d+)\)\s*$", v)
        vl.append(name + (f" ({vm.group(1)})" if vm and name == "Versatile" else ""))
    o = {"en": en, "cz": cz, "z": dmg, "zt": TYPZR.get(typ.lower(), typ), "vl": vl, "ma": jmeno(r[2])[0], "w": lb(r[3]), "cena": cena(r[4])}
    if rng:
        o["dostrel"] = rng
    if strel:
        o["strelivo"] = strel
    return o


def zbroj(r, typ):
    en, cz = jmeno(r[0])
    ac = norm(r[1])
    m = re.match(r"^\+?(\d+)(?:\s*\+\s*(?:DEX|AGI))?(?:\s*\(nejvýše \+(\d)\))?", ac)
    o = {"en": en, "cz": cz, "typ": typ, "ac": int(m.group(1)) if m else None, "w": lb(r[4]), "cena": cena(r[5])}
    if typ in ("lehká", "střední"):
        o["agi"] = 2 if (m and m.group(2)) else 9
    sm = re.match(r"STR (\d+)", norm(r[2]))
    if sm:
        o["str"] = int(sm.group(1))
    if "ano" in norm(r[3]):
        o["plizeni"] = 1
    return o


def hlavicka_mag(s):
    """„Wondrous Item (divotvorný předmět) · Attunement (připoutání): ne“ """
    m = re.match(r"^(.*?)\s*·\s*Attunement[^:]*:\s*(.*)$", s)
    druh = jmeno(m.group(1))[1] if m else s
    pr = m.group(2).strip() if m else ""
    o = {"druh": druh or jmeno(m.group(1) if m else s)[0]}
    if pr and not pr.lower().startswith("ne"):
        o["pr"] = pr if pr.lower() != "ano" else True
    return o


def main(docx):
    js = json.loads(subprocess.run(["pandoc", docx, "-t", "json"], capture_output=True, text=True, check=True).stdout)
    blocks = js["blocks"]
    K = {"zbroj": [], "zbrane": [], "strelivo": [], "vybava": [], "naradi": [], "zvirata": [], "sedla": [], "vozy": [], "plavidla": [],
         "jedy": [], "magicke": [], "vlastnosti": {}, "mistrovstvi": {}, "uvod": {}, "mince": [], "vyroba": {}}
    h1 = h2 = ""
    cur = None  # rozepsaná položka (výbava, jed, magický předmět)
    tabulky = []

    def zavri():
        nonlocal cur
        if cur:
            cur["t"] = sjednot(" ".join(cur.pop("_t", [])).strip())
            if cur.get("_tabs"):
                cur["tab"] = cur.pop("_tabs")
            cur = None

    for b in blocks:
        t = b["t"]
        if t == "Header":
            zavri()
            if b["c"][0] == 1:
                h1, h2 = txt(b["c"][2]), ""
            else:
                h2 = txt(b["c"][2])
            continue
        if t == "Table":
            H, B = table(b)
            if cur is not None:
                cur.setdefault("_tabs", []).append({"h": H, "r": B})
                continue
            if h1.startswith("1 "):
                K["mince"] = [{"n": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "gp": r[1]} for r in B]
            elif h1.startswith("2 "):
                typ = {"Light": "lehká", "Medium": "střední", "Heavy": "těžká", "Shield": "štít"}[h2.split()[0]]
                K["zbroj"] += [zbroj(r, typ) for r in B]
            elif h1.startswith("3 ") and h2.startswith("Ammunition"):
                K["strelivo"] += [{"en": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "pocet": int(r[1]), "w": lb(r[2]), "cena": cena(r[3])} for r in B]
            elif h1.startswith("3 "):
                kat = ("jednoduchá" if h2.startswith("Simple") else "válečná") + (" na dálku" if "Ranged" in h2 else " na blízko")
                for r in B:
                    z = zbran(r); z["kat"] = kat; K["zbrane"].append(z)
            elif h1.startswith("5 "):
                sk = h2.split(" ")[0] + " " + h2.split(" ")[1] if h2.startswith(("Artisan", "Other", "Gaming", "Musical")) else h2
                for r in B:
                    o = {"en": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "sk2": {"Artisan Tools": "řemeslnické nářadí", "Other Tools": "ostatní nářadí",
                         "Gaming Sets": "herní souprava", "Musical Instruments": "hudební nástroj"}.get(sk, sk)}
                    if H and "Vlastnost" in H:
                        o["vl"] = r[1]; o["w"] = lb(r[2]); o["cena"] = cena(r[3]); o["t"] = sjednot(r[4]) if len(r) > 4 else ""
                    else:
                        o["w"] = lb(r[1]) if len(r) > 2 else None; o["cena"] = cena(r[-1]); o["t"] = sjednot(r[2]) if len(r) > 3 else ""
                    K["naradi"].append(o)
            elif h1.startswith("6 "):
                if h2.startswith("Mounts"):
                    K["zvirata"] += [{"en": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "nosnost": r[1], "cena": cena(r[2])} for r in B]
                elif h2.startswith("Saddles"):
                    K["sedla"] += [{"en": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "w": lb(r[1]), "cena": cena(r[2])} for r in B]
                elif h2.startswith("Drawn"):
                    K["vozy"] += [{"en": jmeno(r[0])[0], "cz": jmeno(r[0])[1], "w": lb(r[1]), "cena": cena(r[2])} for r in B]
                else:
                    druh = "vzducholoď" if "Eberron" in h2 else "plavidlo"
                    for r in B:
                        en, cz = jmeno(r[0])
                        p = next((x for x in K["plavidla"] if x["en"] == en), None)
                        if not p:
                            p = {"en": en, "cz": cz, "druh": druh}; K["plavidla"].append(p)
                        if "Rychlost" in H:
                            p.update({"rychlost": r[1], "posadka": r[2], "cestujici": r[3], "cena": cena(r[4])})
                        else:
                            p.update({"naklad": r[1], "ac": r[2], "hp": r[3], "prah": r[4]})
            elif h1.startswith("8 "):
                K["vyroba"]["magicka"] = [{"vz": jmeno(r[0])[0], "dny": r[1], "material": r[2]} for r in B]
            continue
        if t != "Para":
            continue
        s = norm(txt(b["c"]))
        strong = bool(b["c"]) and b["c"][0].get("t") == "Strong" and txt(b["c"][0]) and norm(txt(b["c"][0])) == s
        if h1.startswith(("4 ", "7 ", "9 ")):
            if strong:
                zavri()
                en, cz = jmeno(s)
                cur = {"en": en, "cz": cz, "_t": []}
                if h1.startswith("4 "):
                    K["vybava"].append(cur)
                elif h1.startswith("7 "):
                    K["jedy"].append(cur)
                else:
                    cur["vz"] = RARITY.get(h2.split(" (")[0], h2)
                    K["magicke"].append(cur)
                continue
            if cur is None:
                K["uvod"].setdefault(h1[:1], []).append(s)
                continue
            if h1.startswith("4 ") and s.startswith("Hmotnost"):
                m = re.match(r"^Hmotnost (.*?) · Cena (.*)$", s)
                if m:
                    cur["w"] = lb(m.group(1)); cur["wtxt"] = m.group(1); cur["cena"] = cena(m.group(2))
                continue
            if h1.startswith("7 ") and " · " in s and "GP" in s and "_t" in cur and not cur["_t"]:
                a, c = s.split(" · ", 1)
                cur["druh"] = jmeno(a)[1] or a; cur["cena"] = cena(c)
                continue
            if h1.startswith("9 ") and s.startswith("Vzácnost a cena"):
                cur["cenatxt"] = s.split(":", 1)[1].strip()
                m = re.search(r":\s*([^:]*)$", s)
                cur["cena"] = cena(m.group(1)) if m else ""
                continue
            if h1.startswith("9 ") and "Attunement" in s and "_t" in cur and not cur["_t"]:
                cur.update(hlavicka_mag(s))
                continue
            cur["_t"].append(s)
        elif h1.startswith("3 ") and h2.startswith(("Weapon Properties", "Mastery Properties")):
            m = re.match(r"^([A-Za-z-]+)(?: \(([^)]*)\))?[:.]?\s*(.*)$", s)
            if m:
                (K["vlastnosti"] if h2.startswith("Weapon") else K["mistrovstvi"])[m.group(1)] = {"cz": m.group(2) or "", "t": sjednot(m.group(3))}
        elif h1.startswith("8 "):
            K["vyroba"].setdefault("t", []).append(sjednot(s))
        else:
            K["uvod"].setdefault(h1[:1] or "0", []).append(sjednot(s))
    zavri()
    for sk in ("vybava", "jedy", "magicke"):
        for x in K[sk]:
            x.pop("_t", None)
    out = os.path.join(D, "katalog.json")
    json.dump(K, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"katalog.json: zbroj {len(K['zbroj'])}, zbraně {len(K['zbrane'])}, střelivo {len(K['strelivo'])}, výbava {len(K['vybava'])}, "
          f"nářadí {len(K['naradi'])}, zvířata {len(K['zvirata'])}, vozy {len(K['vozy'])}, plavidla {len(K['plavidla'])}, jedy {len(K['jedy'])}, "
          f"magické {len(K['magicke'])}, vlastnosti {len(K['vlastnosti'])}, mistrovství {len(K['mistrovstvi'])}")


if __name__ == "__main__":
    main(sys.argv[1])
