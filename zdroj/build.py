#!/usr/bin/env python3
"""Sestaví web Mundus Mutatus.

  python3 zdroj/build.py            -> public/  (hráčská verze, nasazuje Netlify)
  python3 zdroj/build.py --vypravec -> vypravec/index.html (s tajemstvími, NEPUBLIKOVAT)

Tajemství se ve zdroji značí  ⟦tajný text⟧  nebo  ⟦tajný text¦text pro hráče⟧.
Obsah (rody, osoby, vazby, Praha, Kronika, Družina, objevená místa) je v zdroj/obsah/ jako Markdown
s hlavičkou – viz zdroj/obsah/NÁVOD.md.
Jen standardní knihovna Pythonu (běží i na Netlify).
"""
import hashlib, html, json, os, re, shutil, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "zdroj", "koruna.html")
OBSAH = os.path.join(ROOT, "zdroj", "obsah")
GM = "--vypravec" in sys.argv
OUT = os.path.join(ROOT, "vypravec" if GM else "public")
# Napojení na Supabase (odhalování). Bez tajného klíče se web sestaví staticky jako dřív.
SB_URL = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
SB_KEY = os.environ.get("SUPABASE_KEY", "").strip()
SB_SECRET = os.environ.get("SUPABASE_SECRET", "").strip()
DB = bool(SB_URL and SB_KEY and SB_SECRET) and not GM and "--staticky" not in sys.argv
VETEV = (os.environ.get("MM_VETEV") or os.environ.get("BRANCH") or "mistni").strip()

def fail(msg):
    sys.exit("CHYBA: " + msg)

# ---------- Markdown s hlavičkou ----------
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)
    t = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', t)
    return t

def md(body):
    out = []
    for block in re.split(r"\n\s*\n", body.strip()):
        lines = block.strip().split("\n")
        if all(l.strip().startswith("|") for l in lines):
            rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
            head, body = (rows[0], rows[2:]) if len(rows) > 1 and all(set(c) <= set("-: ") for c in rows[1]) else (None, rows)
            t = '<div class="rtw"><table class="rtab">'
            if head:
                t += "<thead><tr>" + "".join(f'<th scope="col">{inline(c)}</th>' for c in head) + "</tr></thead>"
            t += "<tbody>" + "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body) + "</tbody></table></div>"
            out.append(t)
        elif all(l.lstrip().startswith(("- ", "* ")) for l in lines):
            out.append("<ul>" + "".join("<li>" + inline(l.lstrip()[2:]) + "</li>" for l in lines) + "</ul>")
        elif lines[0].startswith("## "):
            out.append("<h3>" + inline(lines[0][3:]) + "</h3>" + ("<p>" + inline(" ".join(lines[1:])) + "</p>" if lines[1:] else ""))
        else:
            out.append("<p>" + inline(" ".join(l.strip() for l in lines)) + "</p>")
    return "\n".join(out)

def parse_head(text, where):
    """Hlavička: řádky „klíč: hodnota“; seznam = „klíč:“ a pod ním řádky „  - položka“."""
    meta, key = {}, None
    for line in text.split("\n"):
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.lstrip().startswith("- ") and key:
            if not isinstance(meta.get(key), list):
                meta[key] = []
            meta[key].append(line.lstrip()[2:].strip())
            continue
        if ":" not in line:
            fail(f"{where}: nesrozumitelný řádek hlavičky: {line.strip()}")
        k, _, v = line.partition(":")
        key = k.strip()
        meta[key] = v.strip()
    return meta

def read_dir(name):
    d = os.path.join(OBSAH, name)
    items = []
    for fn in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not fn.endswith(".md") or fn.startswith("_"):
            continue
        raw = open(os.path.join(d, fn), encoding="utf-8").read().replace("\r\n", "\n")
        m = re.match(r"---\n(.*?)\n---\n?(.*)", raw, re.S)
        if not m:
            fail(f"{name}/{fn}: chybí hlavička --- … ---")
        meta = parse_head(m.group(1), f"{name}/{fn}")
        meta["_body"] = m.group(2)
        meta["_file"] = fn
        items.append(meta)
    return items

def text(body):
    """Prostý text (bez Markdownu): řádky se spojí mezerou."""
    return re.sub(r"\s*\n\s*", " ", body.strip())

def lines_file(name):
    p = os.path.join(OBSAH, name)
    out = []
    for i, line in enumerate(open(p, encoding="utf-8").read().split("\n"), 1):
        if line.strip().startswith("- "):
            out.append((i, line.strip()[2:].strip()))
    return out

def lst(v):
    if isinstance(v, list):
        return [x.strip() for x in v if x.strip()]
    return [x.strip() for x in v.split(",") if x.strip()] if v else []

def zapisy():
    out = []
    for z in read_dir("kronika"):
        for k in ("id", "title", "date", "place"):
            if not z.get(k):
                fail(f"kronika/{z['_file']}: chybí '{k}'")
        out.append({"id": z["id"], "n": z.get("n", ""), "date": z["date"], "datum": z.get("datum", ""),
                    "place": z["place"], "route": lst(z.get("route")) or [z["place"]],
                    "title": z["title"], "text": md(z["_body"]),
                    "praha": [int(x) for x in lst(z.get("praha")) if x.isdigit()],
                    "druzina": int(z["druzina"]) if str(z.get("druzina", "")).strip().isdigit() else None,
                    "hodina": int(str(z["hodina"]).split(":")[0]) % 24 if str(z.get("hodina", "")).strip().split(":")[0].isdigit() else None})
    return out

def druzina():
    out = []
    for p in read_dir("druzina"):
        if not p.get("id") or not p.get("n"):
            fail(f"druzina/{p['_file']}: chybí 'id' nebo 'n'")
        o = {"id": p["id"], "n": p["n"]}
        for k in ("epi", "cls", "faith", "origin", "img"):
            if p.get(k):
                o[k] = p[k]
        if p.get("sv"):
            o["sv"] = int(p["sv"])
        o["ctn"], o["ner"] = lst(p.get("ctnosti")), lst(p.get("nerresti") or p.get("neresti"))
        o["ties"] = [[t.split(":", 1)[0].strip(), t.split(":", 1)[1].strip()] for t in lst(p.get("vazby")) if ":" in t]
        o["x"] = md(p["_body"])
        out.append(o)
    return out

# ---------- odhalování: výchozí stavy ----------
UROVNE = {"skryta": 0, "skrytá": 0, "skryty": 0, "skrytý": 0, "skryte": 0, "skryté": 0, "0": 0,
          "slyseli": 1, "slyšeli": 1, "1": 1, "potkali": 2, "znaji": 2, "znají": 2, "2": 2}
SEED = {}

def seed(eid, meta, where):
    v = str(meta.get("stav", "") or "skryta").strip().lower()  # výchozí: družina nic neví
    if v not in UROVNE:
        fail(f"{where}: stav musí být skryta / slyseli / potkali (je „{v}“)")
    if eid in SEED:
        fail(f"{where}: id „{eid}“ už používá jiný rod, osoba nebo místo")
    SEED[eid] = UROVNE[v]

def mista():
    out = []
    for p in read_dir("mista"):
        w = "mista/" + p["_file"]
        try:
            o = {"name": p["name"], "lo": float(p["lo"]), "la": float(p["la"]), "note": p.get("note", ""), "z": p.get("zapis", "")}
        except (KeyError, ValueError):
            fail(f"{w}: potřebuje name, lo, la")
        o["id"] = p.get("id") or "m-" + re.sub(r"^\d+-", "", p["_file"][:-3])
        seed(o["id"], p, w)
        out.append(o)
    return out


ANO = lambda v: str(v).strip().lower() in ("ano", "true", "1", "yes")

def num(v, where):
    try:
        return float(v.replace(",", "."))
    except ValueError:
        fail(f"{where}: „{v}“ není číslo")

def rody():
    fam, short, arms = [], {}, {}
    for r in read_dir("rody"):
        w = "rody/" + r["_file"]
        for k in ("id", "zeme", "nazev", "vyznani"):
            if not r.get(k):
                fail(f"{w}: chybí '{k}'")
        seats = []
        for sd in r.get("sidla") or []:
            parts = [x.strip() for x in sd.split("|")]
            if len(parts) < 3:
                fail(f"{w}: sídlo „{sd}“ má mít tvar  název | délka | šířka")
            seat = [parts[0], num(parts[1], w), num(parts[2], w)]
            if len(parts) > 3 and parts[3]:
                seat.append(parts[3])
            seats.append(seat)
        o = {"id": r["id"], "land": r["zeme"], "name": r["nazev"], "conf": r["vyznani"], "head": r.get("hlava", ""),
             "seats": seats, "stance": r.get("postoj", ""), "note": text(r["_body"])}
        if ANO(r.get("mesto", "")): o["city"] = True
        if ANO(r.get("soused", "")): o["nbr"] = True
        if ANO(r.get("nemapovat", "")): o["nomap"] = True
        if any(f["id"] == o["id"] for f in fam):
            fail(f"{w}: id „{o['id']}“ už má jiný rod")
        fam.append(o)
        seed(o["id"], r, w)
        if r.get("kratce"): short[o["id"]] = r["kratce"]
        e = r.get("erb") or o["id"]
        if os.path.exists(os.path.join(ROOT, "art", "erby", e + ".webp")):
            arms[o["id"]] = f"art/erby/{e}.webp"
    return fam, short, arms

def osoby(ids):
    out = []
    for p in read_dir("osoby"):
        w = "osoby/" + p["_file"]
        for k in ("id", "jmeno", "rod", "role"):
            if not p.get(k):
                fail(f"{w}: chybí '{k}'")
        if p["rod"] not in ids:
            fail(f"{w}: rod „{p['rod']}“ neexistuje")
        o = {"id": p["id"], "n": p["jmeno"], "r": p["rod"], "role": p["role"]}
        if p.get("sidlo"): o["seat"] = p["sidlo"]
        o["x"] = text(p["_body"])
        if any(q["id"] == o["id"] for q in out):
            fail(f"{w}: id „{o['id']}“ už má jiná osoba")
        seed(o["id"], p, w)
        out.append(o)
    return out

def vazby(ids, removed):
    out = []
    for i, line in lines_file("vazby.md"):
        parts = [x.strip() for x in line.split("|", 2)]
        if len(parts) < 3:
            fail(f"vazby.md, řádek {i}: má mít tvar  - druh | rod, rod | text")
        kind = parts[0].split()
        secret = kind[0] in ("tajné", "tajne")
        t = kind[-1]
        if t not in ("rod", "spoj", "spor"):
            fail(f"vazby.md, řádek {i}: neznámý druh „{t}“ (rod / spoj / spor)")
        rids = [x.strip() for x in parts[1].split(",") if x.strip()]
        for x in rids:
            if x not in ids:
                fail(f"vazby.md, řádek {i}: rod „{x}“ neexistuje")
        o = {"t": t, "ids": rids, "x": parts[2]}
        if secret:
            removed.append(parts[2])
            o["$gm"] = True
        out.append(o)
    return out

def praha(ids, pids):
    out = []
    for p in read_dir("praha"):
        w = "praha/" + p["_file"]
        for k in ("cislo", "druh", "mesto", "nazev", "poloha"):
            if not p.get(k):
                fail(f"{w}: chybí '{k}'")
        if p["druh"] not in ("dvur", "urad", "cirkev", "hospoda", "anomalie"):
            fail(f"{w}: druh musí být dvur / urad / cirkev / hospoda / anomalie")
        if p["mesto"] not in ("hrad", "mala", "stare", "nove", "vys", "okoli"):
            fail(f"{w}: město musí být hrad / mala / stare / nove / vys / okoli")
        xy = [num(v, w) for v in p["poloha"].split(",")]
        o = {"n": int(p["cislo"]), "k": p["druh"], "t": p["mesto"], "name": p["nazev"], "c": p.get("vyznani", "")}
        if p.get("rod"):
            if p["rod"] not in ids: fail(f"{w}: rod „{p['rod']}“ neexistuje")
            o["r"] = p["rod"]
        if p.get("osoba"):
            if p["osoba"] not in pids: fail(f"{w}: osoba „{p['osoba']}“ neexistuje")
            o["p"] = p["osoba"]
        o["d"] = text(p["_body"])
        o["pos"] = xy
        if any(q["n"] == o["n"] for q in out):
            fail(f"{w}: číslo {o['n']} už má jiné místo")
        out.append(o)
    out.sort(key=lambda o: o["n"])
    return out

def ulice():
    out = []
    for i, line in lines_file("praha-ulice.md"):
        parts = [x.strip() for x in line.split("|")]
        if len(parts) < 2:
            fail(f"praha-ulice.md, řádek {i}: má mít tvar  - název | x, y | natočení")
        x, y = [num(v, f"praha-ulice.md, řádek {i}") for v in parts[1].split(",")]
        out.append([parts[0], x, y, num(parts[2], f"praha-ulice.md, řádek {i}") if len(parts) > 2 and parts[2] else 0])
    return out


def svet():
    geo = json.load(open(os.path.join(ROOT, "art", "svet.json"), encoding="utf-8"))
    out = []
    for p in read_dir("svet"):
        w = "svet/" + p["_file"]
        for k in ("id", "nazev", "vira"):
            if not p.get(k):
                fail(f"{w}: chybí '{k}'")
        if p["id"] not in geo["states"]:
            fail(f"{w}: oblast „{p['id']}“ na mapě neexistuje (art/svet.json)")
        if p["vira"] not in ("kat", "pra", "isl", "mix", "kal"):
            fail(f"{w}: víra musí být kat / pra / isl / mix / kal")
        out.append({"id": p["id"], "n": p["nazev"], "k": p.get("kratce") or p["nazev"], "v": p.get("vladce", ""), "s": p.get("sidlo", ""),
                    "c": p["vira"], "h": ANO(p.get("hlavni", "")), "x": text(p["_body"]),
                    "sp": lst(p.get("spor")), "al": lst(p.get("spojenec")), "na": lst(p.get("napeti"))})
    ids = {o["id"] for o in out}
    for o in out:
        for x in o["sp"]:
            if x not in ids:
                fail(f"svet: {o['id']} má spor s neexistující zemí „{x}“")
        for x in o["al"]:
            if x not in ids:
                fail(f"svet: {o['id']} má spojence s neexistující zemí „{x}“")
            if x in o["sp"]:
                fail(f"svet: {o['id']} má zemi „{x}“ zároveň jako spor i spojence")
        for x in o["na"]:
            if x not in ids:
                fail(f"svet: {o['id']} má napětí s neexistující zemí „{x}“")
    return out

def _ll(txt, where):
    a = txt.replace(",", " ").split()
    if len(a) != 2:
        fail(f"{where}: souřadnice mají tvar  délka, šířka")
    return [num(a[0], where), num(a[1], where)]

def svet_drzavy(ids):
    out = []
    for i, line in lines_file("svet-drzavy.md"):
        w = f"svet-drzavy.md, řádek {i}"
        a = [x.strip() for x in line.split("|")]
        if len(a) < 3:
            fail(f"{w}: má mít tvar  - název | délka, šířka | id země | poznámka")
        if a[2] not in ids:
            fail(f"{w}: země „{a[2]}“ neexistuje (svet/)")
        out.append([a[0], *_ll(a[1], w), a[2], a[3] if len(a) > 3 else ""])
    return out

def svet_cesty(mesta):
    p = os.path.join(OBSAH, "svet-cesty.md")
    raw = open(p, encoding="utf-8").read().split("\n")
    stops = {m[0]: [m[1], m[2]] for m in mesta}
    for i, line in enumerate(raw, 1):
        if line.strip().startswith("= "):
            a = [x.strip() for x in line.strip()[2:].split("|")]
            stops[a[0]] = _ll(a[1], f"svet-cesty.md, řádek {i}")
    out = []
    for i, line in lines_file("svet-cesty.md"):
        w = f"svet-cesty.md, řádek {i}"
        a = [x.strip() for x in line.split("|")]
        if len(a) != 3:
            fail(f"{w}: má mít tvar  - druh | název | zastávka; zastávka; …")
        if a[0] not in ("hanza", "benatky", "janov", "poutlod", "reka", "pout", "obchod"):
            fail(f"{w}: neznámý druh cesty „{a[0]}“")
        pts = []
        for t in [x.strip() for x in a[2].split(";") if x.strip()]:
            if t in stops:
                pts.append([t, *stops[t]])
            elif re.fullmatch(r"-?[\d.]+ +-?[\d.]+", t):
                pts.append(["", *[float(v) for v in t.split()]])
            else:
                fail(f"{w}: neznámá zastávka „{t}“ (doplňte ji řádkem  = {t} | délka, šířka)")
        if len(pts) < 2 or not pts[0][0] or not pts[-1][0]:
            fail(f"{w}: cesta musí začínat i končit pojmenovanou zastávkou")
        out.append({"k": a[0], "n": a[1], "p": pts})
    return out

def svet_mesta():
    out = []
    for i, line in lines_file("svet-mesta.md"):
        parts = [x.strip() for x in line.split("|")]
        if len(parts) < 2:
            fail(f"svet-mesta.md, řádek {i}: má mít tvar  - název | délka, šířka | hlavní | poznámka")
        lo, la = [num(v, f"svet-mesta.md, řádek {i}") for v in parts[1].split(",")]
        out.append([parts[0], lo, la, 1 if len(parts) > 2 and parts[2].lower().startswith("hlav") else 0, parts[3] if len(parts) > 3 else ""])
    return out


def draconomicon():
    kap = []
    for k in read_dir("draconomicon/kapitoly"):
        if not k.get("id") or not k.get("title"):
            fail(f"draconomicon/kapitoly/{k['_file']}: chybí 'id' nebo 'title'")
        kap.append({"id": k["id"], "t": k["title"], "h": md(k["_body"])})
    pl = []
    for p in read_dir("draconomicon/plemena"):
        w = "draconomicon/plemena/" + p["_file"]
        for k in ("id", "nazev", "trida"):
            if not p.get(k):
                fail(f"{w}: chybí '{k}'")
        if p["trida"] not in ("L", "S", "T"):
            fail(f"{w}: třída musí být L, S nebo T")
        img = p.get("obrazek") or p["id"]
        if not os.path.exists(os.path.join(ROOT, "art", "draci", img + ".webp")):
            img = ""
        pl.append({"id": p["id"], "n": p["nazev"], "j": p.get("jinak", ""), "la": p.get("latin", ""), "tr": p["trida"], "vz": p.get("vzacnost", ""),
                   "rod": p.get("rod", ""), "pd": p.get("pridomek", ""), "img": img, "prof": [p.get(k, "") for k in ("kridla", "ocas", "stavba", "let", "schopnost")], "h": md(p["_body"])})
    ids = [x["id"] for x in kap + pl] + ["plemena"]
    if len(ids) != len(set(ids)):
        fail("draconomicon: kapitoly a plemena musí mít různá id")
    return {"kap": kap, "pl": pl}

def portrety():
    d = os.path.join(ROOT, "art", "portrety")
    return sorted(fn[:-7] for fn in os.listdir(d) if fn.endswith("-m.webp")) if os.path.isdir(d) else []

# ---------- tajemství ----------
SECRET = re.compile(r"⟦(.*?)⟧", re.S)

def strip_secrets(s):
    removed = []
    def rep(m):
        sec, _, alt = m.group(1).partition("¦")
        removed.append(sec)
        return alt
    return SECRET.sub(rep, s), removed

def show_secrets(s):
    return SECRET.sub(lambda m: m.group(1).partition("¦")[0], s)

# ---------- odhalování: brány v datech ----------
# Hráčská data nesou značky, podle nichž databáze (mm_orez v supabase/schema.sql) vyřízne, co družina nezná.
# Stejný algoritmus je níže v Pythonu (statická verze bez databáze a test shody).
ZMINKA = re.compile(r"(\[\[([?!]?)([A-Za-z0-9_-]+)\|([^\]|]*)(\|([^\]]*))?\]\])")

def zminky(t, st):
    def rep(m):
        flag, eid, txt, alt = m.group(2), m.group(3), m.group(4), m.group(6)
        lv = st.get(eid, 0)
        if flag == "":
            return f"[[{eid}|{txt}]]" if lv >= 1 else (alt if m.group(5) is not None else txt)
        if flag == "?":
            return txt if lv >= 1 else (alt or "")
        return txt if lv >= 2 else (alt or "")
    return ZMINKA.sub(rep, t)

_VYNECH = object()

def uroven(st, g):
    if st is None:
        return 2
    ids = g if isinstance(g, list) else [g]
    return min((st.get(i, 0) for i in ids), default=2)

def rozbal(j, st, texty=True):
    """st = {id: 0|1|2}; st=None znamená „vše odhaleno“ (vypravěč)."""
    if isinstance(j, dict):
        if "$g" in j:
            lv = uroven(st, j["$g"])
            if lv < int(j.get("$u", 1)):
                return _VYNECH
            if "$x" in j:
                return rozbal(j["$x"], st, texty)
            plne = j.get("$plne")
            j = {k: v for k, v in j.items() if k not in ("$g", "$u", "$plne")}
            if isinstance(plne, dict) and lv >= 2:
                j = {**j, **plne}
        out = {}
        for k, v in j.items():
            x = rozbal(v, st, texty)
            if x is not _VYNECH:
                out[k] = x
        return out
    if isinstance(j, list):
        return [x for x in (rozbal(v, st, texty) for v in j) if x is not _VYNECH]
    if isinstance(j, str) and texty and st is not None and "[[" in j:
        return zminky(j, st)
    return j

def bez_tajnych(j, gm):
    """Tajné vazby (značka $gm): hráčům se vynechají, vypravěči se jen smaže značka."""
    if isinstance(j, dict):
        return {k: bez_tajnych(v, gm) for k, v in j.items() if k != "$gm"}
    if isinstance(j, list):
        return [bez_tajnych(v, gm) for v in j if gm or not (isinstance(v, dict) and v.get("$gm"))]
    return j

def odhalovaci_data(fam, short, arms, people, rel, praha_pl, mista_l, trees, portr_stem, zapisy_l, party):
    prod = {p["id"]: p["r"] for p in people}
    pids, rids = set(prod), {f["id"] for f in fam}
    pref = lambda pid: {"$g": [pid, prod[pid]], "$x": pid}
    rref = lambda rid: {"$g": rid, "$x": rid}
    F = []
    for f in fam:
        base = {k: v for k, v in f.items() if k not in ("stance", "note")}
        base.update({"stance": "", "note": "", "sl": True})
        F.append({"$g": f["id"], **base, "$plne": {"stance": f["stance"], "note": f["note"], "sl": False}})
    P = []
    for p in people:
        base = {"id": p["id"], "n": p["n"], "r": p["r"], "role": p["role"], "x": "", "sl": True}
        plne = {"x": p["x"], "sl": False}
        if p.get("seat"):
            plne["seat"] = p["seat"]
        P.append({"$g": p["r"], "$x": {"$g": p["id"], **base, "$plne": plne}})
    REL_ = [{"$g": list(r["ids"]), **r} for r in rel]
    PR = []
    for q in praha_pl:
        q = dict(q)
        if "r" in q: q["r"] = rref(q["r"])
        if "p" in q: q["p"] = pref(q["p"])
        PR.append(q)
    MI = [{"$g": m["id"], "id": m["id"], "name": m["name"], "lo": m["lo"], "la": m["la"], "note": "", "z": "",
           "$plne": {"note": m["note"], "z": m["z"]}} for m in mista_l]
    def tnode(n, prvek, where):
        n = dict(n)
        for k in ("p", "pl"):
            if k in n and n[k] not in pids:
                fail(f"rodokmeny.json, {where}: osoba „{n[k]}“ neexistuje")
        for k in ("r", "rl"):
            if k in n and n[k] not in rids:
                fail(f"rodokmeny.json, {where}: rod „{n[k]}“ neexistuje")
        if "pl" in n: n["pl"] = pref(n["pl"])
        if "r" in n: n["r"] = rref(n["r"])
        if "rl" in n: n["rl"] = rref(n["rl"])
        for k in ("kids", "sp"):
            if k in n: n[k] = [tnode(c, True, where) for c in n[k]]
        if "p" in n:
            if prvek:
                n = {"$g": [n["p"], prod[n["p"]]], **n}
            else:
                n["p"] = pref(n["p"])
        return n
    T = {}
    for rid, t in trees.items():
        if rid not in rids:
            fail(f"rodokmeny.json: rod „{rid}“ neexistuje")
        t = dict(t)
        for k in ("root", "main"):
            if k in t: t[k] = tnode(t[k], False, rid)
        if "kids" in t: t["kids"] = [tnode(c, True, rid) for c in t["kids"]]
        T[rid] = {"$g": rid, "$u": 2, "$x": t}
    return {"FAM": F, "PEOPLE": P, "REL": REL_, "PRAHA_PLACES": PR, "MISTA": MI, "TREES": T,
            "SHORT": {k: {"$g": k, "$x": v} for k, v in short.items()},
            "ARMS": {k: {"$g": k, "$x": v} for k, v in arms.items()},
            "PORTR": {pid: {"$g": prod[pid], "$x": {"$g": pid, "$u": 2, "$x": stem}} for pid, stem in portr_stem.items()},
            "ZAPISY": zapisy_l, "PARTY": party}

def sb_rpc(fn, body):
    hdr = {"apikey": SB_SECRET, "Content-Type": "application/json"}
    if SB_SECRET.startswith("eyJ"):
        hdr["Authorization"] = "Bearer " + SB_SECRET
    req = urllib.request.Request(f"{SB_URL}/rest/v1/rpc/{fn}", data=json.dumps(body, ensure_ascii=False).encode("utf-8"), headers=hdr, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        fail(f"Supabase {fn}: HTTP {e.code} {e.read().decode('utf-8', 'replace')[:400]}")
    except urllib.error.URLError as e:
        fail(f"Supabase {fn}: {e.reason}")

# ---------- sestavení ----------
s = open(SRC, encoding="utf-8").read()
J = lambda v: json.dumps(v, ensure_ascii=False, separators=(",", ":"))
removed_items = []
FAM, SHORT, ARMS = rody()
IDS = {f["id"] for f in FAM}
PEOPLE = osoby(IDS)
PIDS = {p["id"] for p in PEOPLE}
SV, SVM = svet(), svet_mesta()
TREES = json.load(open(os.path.join(OBSAH, "rodokmeny.json"), encoding="utf-8"))
PORTR_IDS = [x for x in portrety() if x in PIDS]
if DB:  # portréty pod nečitelnými názvy, aby se nedalo uhodnout, kdo existuje
    STEM = {pid: hashlib.sha256(f"mm-portret:{SB_SECRET}:{pid}".encode()).hexdigest()[:24] for pid in PORTR_IDS}
else:
    STEM = {pid: pid for pid in PORTR_IDS}
ODH = odhalovaci_data(FAM, SHORT, ARMS, PEOPLE, vazby(IDS, removed_items), praha(IDS, PIDS), mista(), TREES, STEM, zapisy(), druzina())
STAT = {"PSTREETS": ulice(), "SVET": SV, "SVETMESTA": SVM, "SVETDRZ": svet_drzavy({o["id"] for o in SV}),
        "SVETCESTY": svet_cesty(SVM), "DRACI": draconomicon()}

def pro_hrace(txt):
    t, rem = strip_secrets(txt)
    return t.replace("✦ ", "").replace("✦", ""), rem

_odh = J(ODH)
HRAC_TXT, rem1 = pro_hrace(_odh)
HRAC = bez_tajnych(json.loads(HRAC_TXT), False)            # s branami – nahrává se do databáze
GMD = rozbal(bez_tajnych(json.loads(show_secrets(_odh)), True), None, texty=False)  # vypravěč vidí vše
_stat = J(STAT)
STAT_H_TXT, rem2 = pro_hrace(_stat)
STAT_H, STAT_G = json.loads(STAT_H_TXT), json.loads(show_secrets(_stat))
secrets_all = rem1 + rem2 + removed_items

if "--vypis" in sys.argv:  # pro testy: data s branami a výchozí stavy
    _d = sys.argv[sys.argv.index("--vypis") + 1]
    os.makedirs(_d, exist_ok=True)
    json.dump(HRAC, open(os.path.join(_d, "hrac.json"), "w", encoding="utf-8"), ensure_ascii=False)
    json.dump(SEED, open(os.path.join(_d, "seed.json"), "w", encoding="utf-8"), ensure_ascii=False)

if GM:
    DATA = {**GMD, **STAT_G, "GM": True, "STAV": SEED}
elif DB:
    DATA = None
else:
    DATA = {**rozbal(HRAC, SEED), **STAT_H}

# značky ve zdroji → čtení z window.__D
for key in list(ODH) + list(STAT):
    for empty in ("[]", "{}"):
        tag = f"/*@{key}@*/{empty}"
        if tag in s:
            s = s.replace(tag, f"(__D.{key}||{empty})")
            break
    else:
        fail(f"ve zdroji chybí značka /*@{key}@*/")
if "/*@GM@*/false" not in s or "/*@MMDATA@*/" not in s:
    fail("ve zdroji chybí značka /*@GM@*/ nebo /*@MMDATA@*/")
s = s.replace("/*@GM@*/false", "!!__D.GM")
safe = lambda v: J(v).replace("</", "<\\/")
if DB:
    s = s.replace("/*@MMDATA@*/", "window.MMCFG=" + safe({"url": SB_URL, "key": SB_KEY, "vetev": VETEV}) + ";window.__S=" + safe(STAT_H) + ";")
    if '<script id="mmhlavni">' not in s:
        fail('ve zdroji chybí <script id="mmhlavni">')
    s = s.replace('<script id="mmhlavni">', '<script type="text/x-mm" id="mmhlavni">')
else:
    s = s.replace("/*@MMDATA@*/", "window.__D=" + safe(DATA) + ";")

if GM:
    s = show_secrets(s)
else:
    s, removed = strip_secrets(s)
    s = s.replace("✦ ", "").replace("✦", "")
    hrac_vse = s + (J(HRAC) if DB else "")
    for sec in removed + secrets_all:  # pojistka: žádný tajný text nesmí zůstat
        probe = sec.strip()[:40]
        if len(probe) > 12 and probe in hrac_vse:
            fail("tajemství proteklo do hráčské verze: " + probe)
    if "⟦" in hrac_vse or "⟧" in hrac_vse:
        fail("neuzavřená značka tajemství ⟦ ⟧")

s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
head, body = s[: s.index('<div class="wrap">')], s[s.index('<div class="wrap">'):]
reset = ("<style>\nhtml{-webkit-text-size-adjust:100%}\n:root{padding-top:env(safe-area-inset-top,0px);"
         "padding-bottom:env(safe-area-inset-bottom,0px)}\nbody{margin:0}\nimg{max-width:100%}\n[hidden]{display:none!important}\n</style>\n")
robots = '<meta name="robots" content="noindex">\n' if GM else ""
page = ('<!doctype html>\n<html lang="cs">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + robots +
        '<meta name="description" content="Rody Čech, Moravy, Slezska, Lužic a sousedních zemí k 3. březnu 1458: mapa držav, vyznání, vazby a spory.">\n'
        + head + reset + "</head>\n<body>\n" + body + "\n</body>\n</html>\n")

if DB:
    ver = sb_rpc("mm_nahraj_obsah", {"p_vetev": VETEV, "p_hrac": HRAC,
                                     "p_gm": {**GMD, **{k: v for k, v in STAT_G.items() if v != STAT_H.get(k)}},
                                     "p_vychozi": SEED})
    print(f"supabase: obsah větve „{VETEV}“ nahrán, verze výřezu {ver}")

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
shutil.copytree(os.path.join(ROOT, "art"), os.path.join(OUT, "art"), ignore=shutil.ignore_patterns("portrety") if DB else None)
if DB:
    src_p, dst_p = os.path.join(ROOT, "art", "portrety"), os.path.join(OUT, "art", "portrety")
    os.makedirs(dst_p)
    for pid, stem in STEM.items():
        for suf in ("", "-m"):
            if os.path.exists(os.path.join(src_p, f"{pid}{suf}.webp")):
                shutil.copyfile(os.path.join(src_p, f"{pid}{suf}.webp"), os.path.join(dst_p, f"{stem}{suf}.webp"))
mode = "vypravěčská" if GM else ("hráčská, napojená na databázi" if DB else "hráčská, statická")
print(f"ok: {OUT}/index.html ({len(page)//1024} kB), {mode} verze")
