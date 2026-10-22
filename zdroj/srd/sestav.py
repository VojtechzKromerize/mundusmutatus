# Sestaví z dat SRD 5.2.1 (zdroj/srd/netvori, zdroj/srd/predmety) a z českých pravidel (art/pravidla.json):
#   art/netvori.json  – nestvůry a zvířata jako statblocky pro bestiář a Boj (tvar jako protivníci z generator.js)
#   art/predmety.json – magické předměty s českým popisem (karta postavy, vyhledávání)
#   art/pojmy.json    – krátké definice pojmů z Glosáře pravidel pro popisky v textu
# Spuštění: python3 zdroj/srd/sestav.py   (art/pravidla.json musí být sestavené – zdroj/pravidla/sestav.py)
import glob, html, json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))
ART = os.path.join(ROOT, "art")


def slug(t):
    t = t.lower().translate(str.maketrans("áčďéěíňóřšťúůýž’'", "acdeeinorstuuyz  "))
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60]


def inl(t):
    t = html.escape(str(t or ""), quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    return t


def mdtxt(t):
    out, lst = [], []
    for b in re.split(r"\n+", str(t or "").strip()):
        b = b.strip()
        if not b:
            continue
        if b.startswith("- "):
            lst.append("<li>" + inl(b[2:]) + "</li>"); continue
        if lst:
            out.append("<ul>" + "".join(lst) + "</ul>"); lst = []
        out.append("<p>" + inl(b) + "</p>")
    if lst:
        out.append("<ul>" + "".join(lst) + "</ul>")
    return "".join(out)


def jed(t):
    h = mdtxt(t)
    return h[3:-4] if h.count("<p>") == 1 and h.startswith("<p>") and h.endswith("</p>") else h


def nacti(sl):
    o = []
    for f in sorted(glob.glob(os.path.join(D, sl, "*.json"))):
        o += json.load(open(f, encoding="utf-8"))
    return o


AB = ["STR", "AGI", "CON", "INT", "WIS", "CHA"]
mod = lambda v: (v - 10) // 2
sg = lambda v: ("+" if v >= 0 else "−") + str(abs(v))


def zdroje_srd(x):
    """počty použití ze statbloku (2026-10-20): kouzla „2× za den každé: A, B“ / „1× za den: C“ a schopnosti „Název (3× za den)“
       – každé kouzlo i schopnost má vlastní počitadlo; „Libovolně“ se nepočítá"""
    zd = []
    def pridej(n, mx):
        n = re.sub(r"\s*\(.*?\)\s*$", "", n).strip(" .,:;")
        if n and not any(z["n"] == n for z in zd): zd.append({"n": n, "max": mx})
    for k in ("rysy", "akce", "bonus", "reakce"):
        for a in x.get(k) or []:
            m = re.search(r"\((\d+)\s*×\s*za den", a.get("n", ""))
            if m: pridej(a["n"], int(m.group(1)))
            t = re.sub(r"<[^>]+>|\*", " ", str(a.get("t", "")))
            for m in re.finditer(r"(\d+)\s*×\s*za den(?: každé)?\s*:\s*(.*?)(?=\s*(?:\d+\s*×\s*za den|Libovolně\s*:|$))", t, re.S):
                for s in re.split(r",\s*", m.group(2)):
                    if s.strip(): pridej(s, int(m.group(1)))
    return zd


def netvor(x):
    leg = bool(x.get("leg"))
    u = "zhoubce" if leg else "sok"
    vl = x.get("vl") or {}
    tab = ('<table><thead><tr>' + "".join(f"<th>{a}</th>" for a in AB) + "</tr></thead><tbody><tr>" +
           "".join(f"<td>{vl.get(a, '–')} ({sg(mod(vl[a])) if a in vl else ''})<br><small>záchr. {html.escape(str((x.get('zach') or {}).get(a, '')))}</small></td>" for a in AB) +
           "</tr></tbody></table>")
    det = []
    for k, l in (("dov", "Dovednosti"), ("zra", "Vulnerability"), ("odol", "Resistance"), ("imu", "Immunity"), ("vyb", "Výbava"), ("smysly", "Smysly"), ("jaz", "Jazyky")):
        if x.get(k):
            det.append(f"<b>{l}</b> {inl(x[k])}")
    sec = []
    for k, l in (("rysy", "Vlastnosti"), ("akce", "Akce"), ("bonus", "Bonusové akce"), ("reakce", "Reakce"), ("leg", "Legendární akce")):
        L = x.get(k) or []
        if not L:
            continue
        pre = mdtxt(x.get("legT")) if k == "leg" else ""
        sec.append(f"<h3>{l}</h3>{pre}<ul>" + "".join(f"<li><b>{inl(a['n'])}.</b> {jed(a.get('t', ''))}</li>" for a in L) + "</ul>")
    xpt = x.get("xpt") or f"{int(x.get('xp') or 0):,} XP".replace(",", " ")
    hlava = (f"<p><b>{'Zhoubce' if leg else 'Sok'}</b> · {html.escape(x.get('vel', ''))} {html.escape(x.get('typ', ''))}, {html.escape(x.get('pres', ''))}"
             f" · <b>Výzva</b> {html.escape(str(x.get('cr', '')))} ({html.escape(xpt)}) · <b>Bonus zdatnosti</b> {html.escape(str(x.get('pb', '')))}</p>"
             f"<p><b>AC</b> {inl(x.get('ac'))} · <b>HP</b> {x.get('hp')} ({html.escape(str(x.get('hpk', '')))}) · <b>Rychlost</b> {inl(x.get('rych'))} · <b>Iniciativa</b> {html.escape(str(x.get('ini', '')))}</p>")
    h = hlava + tab + (f"<p>{' · '.join(det)}</p>" if det else "") + "".join(sec) + f'<p class="rsmall">SRD 5.2.1, s. {x.get("str", "")}{" · zvíře" if x.get("zvire") else ""}</p>'
    at = []
    for a in x.get("utoky") or []:
        o = {"n": a.get("n", "")}
        if isinstance(a.get("b"), (int, float)):
            o["b"] = int(a["b"])
        elif a.get("dc"):
            o["dc"] = a["dc"]
        if a.get("z"):
            o["z"] = str(a["z"]).replace(" ", "")
        if a.get("zt"):
            o["zt"] = a["zt"]
        if a.get("p"):
            o["p"] = a["p"]
        at.append(o)
    vy = f"{x.get('cr', '')} ({(x.get('xpt') or str(x.get('xp', ''))+' XP')})"
    st = ["SRD", re.sub(r"\s*\(.*", "", x.get("typ", ""))] + (["zvíře"] if x.get("zvire") else [])
    o = {"id": "srd-" + slug(x["en"]), "n": x["en"], "u": u, "ac": x.get("ac", ""), "hp": [{"n": "", "max": int(x.get("hp") or 1)}],
         "ut": "", "poz": "", "pok": "", "kom": "", "ner": "", "zak": "", "vy": vy, "h": h, "at": at, "zd": zdroje_srd(x), "st": st,
         "xp": int(x.get("xp") or 0), "vk": "", "srd": 1, "cr": str(x.get("cr", "")), "typ": x.get("typ", "")}
    if x.get("cz") and x["cz"].lower() != x["en"].lower():
        o["cz"] = x["cz"]
    return o


def predmet(x):
    o = {"id": slug(x["en"]), "en": x["en"], "druh": x.get("druh", ""), "vz": x.get("vz", ""), "pr": x.get("pr", False), "t": x.get("t", ""), "str": x.get("str")}
    for k in ("cz", "upr", "vzt", "ef"):
        if x.get(k):
            o[k] = x[k]
    return o


POJMY = {  # anglický pojem z Glosáře → další tvary, které se v textu označí
    "Advantage": [], "Disadvantage": [], "Concentration": [], "Resistance": [], "Vulnerability": [], "Immunity": [],
    "Opportunity Attacks": ["Opportunity Attack"], "Heroic Inspiration": [], "Difficult Terrain": [], "Cover": [],
    "Bloodied": [], "Temporary Hit Points": [], "Hit Point Dice": [], "Long Rest": [], "Short Rest": [],
    "Death Saving Throw": ["Death Saving Throws", "Death Save"], "Attunement": [], "Passive Perception": [],
    "Bonus Action": [], "Darkvision": [], "Blindsight": [], "Truesight": [], "Tremorsense": [], "Unarmed Strike": [],
    "Lightly Obscured": [], "Heavily Obscured": [], "Dim Light": [], "Bright Light": [], "Expertise": [],
    "Blinded": [], "Charmed": [], "Deafened": [], "Exhaustion": [], "Frightened": [], "Grappled": [], "Incapacitated": [],
    "Invisible": [], "Paralyzed": [], "Petrified": [], "Poisoned": [], "Prone": [], "Restrained": [], "Stunned": [], "Unconscious": [],
    "Dash": [], "Disengage": [], "Dodge": [], "Ready": [], "Stable": [], "Surprise": [], "Grappling": ["Grapple"],
    "Challenge Rating": [], "Proficiency": [], "Spell Attack": [], "Ritual": [], "Spellcasting Focus": [],
}


def pojmy():
    P = json.load(open(os.path.join(ART, "pravidla.json"), encoding="utf-8"))
    g = next(k for k in P["kap"] if k["id"] == "glosar")
    h = g["h"]
    out = []
    for t in g["toc"]:
        m = re.match(r"^(.*?)(?:\s*\[[^\]]*\])?\s*\((.*)\)\s*$", t["n"])
        if not m:
            continue
        en = m.group(1).strip()
        if en not in POJMY:
            continue
        cz = re.sub(r"\s*\[[^\]]*\]", "", m.group(2)).strip()
        i = h.find(f'id="{t["id"]}"')
        seg = h[i:]
        pm = re.search(r"<p>(.*?)</p>", seg, re.S)
        d = re.sub(r"<[^>]+>", "", pm.group(1)) if pm else ""
        d = html.unescape(re.sub(r"\s+", " ", d)).strip()
        if len(d) > 420:
            d = d[:400].rsplit(" ", 1)[0] + "…"
        out.append({"id": t["id"], "en": en, "cz": cz, "d": d, "f": [en] + POJMY[en]})
    chybi = set(POJMY) - {x["en"] for x in out}
    if chybi:
        print("pojmy: v glosáři nenalezeno", sorted(chybi), file=sys.stderr)
    return out


if __name__ == "__main__":
    M = [netvor(x) for x in nacti("netvori")]
    ids = [m["id"] for m in M]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicitní id nestvůr")
    Pr = [predmet(x) for x in nacti("predmety")]
    W = lambda n, v: json.dump(v, open(os.path.join(ART, n), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    W("netvori.json", M)
    W("predmety.json", Pr)
    Po = pojmy()
    W("pojmy.json", Po)
    print(f"netvori.json {len(M)}, predmety.json {len(Pr)}, pojmy.json {len(Po)}")
