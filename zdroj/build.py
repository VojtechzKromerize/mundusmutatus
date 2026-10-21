#!/usr/bin/env python3
"""Sestaví web Mundus Mutatus.

  python3 zdroj/build.py            -> public/  (hráčská verze, nasazuje Netlify)
  python3 zdroj/build.py --vypravec -> vypravec/index.html (s tajemstvími, NEPUBLIKOVAT)

Tajemství se ve zdroji značí  ⟦tajný text⟧  nebo  ⟦tajný text¦text pro hráče⟧.
Obsah (rody, osoby, vazby, Praha, Kronika, Družina, objevená místa) je v zdroj/obsah/ jako Markdown
s hlavičkou – viz zdroj/obsah/NÁVOD.md.
Jen standardní knihovna Pythonu a Node.js pro zdroj/generator.js (obojí běží i na Netlify). Hráčské soubory v/ zmenší esbuild z package.json (npm ci; bez něj se nezmenšují).
"""
import hashlib, json, os, re, shutil, subprocess, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "zdroj", "koruna.html")
OBSAH = os.path.join(ROOT, "zdroj", "obsah")
GM = "--vypravec" in sys.argv
OUT = os.path.join(ROOT, "vypravec" if GM else "public")
# Napojení na Supabase (odhalování). Bez tajného klíče se web sestaví staticky jako dřív.
SB_URL = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
SB_KEY = os.environ.get("SUPABASE_KEY", "").strip()
SB_SECRET = next((os.environ[n].strip() for n in ("SUPABASE_SECRET", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY",
                  "SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE", "SECRET_KEY", "SUPABASE_SB_SECRET") if os.environ.get(n, "").strip()), "")
DB = bool(SB_URL and SB_KEY and SB_SECRET) and not GM and "--staticky" not in sys.argv
VETEV = (os.environ.get("MM_VETEV") or os.environ.get("BRANCH") or "mistni").strip()
if not GM and not DB and "--staticky" not in sys.argv and (SB_URL or SB_KEY or SB_SECRET):
    chybi = [n for n, v in (("SUPABASE_URL", SB_URL), ("SUPABASE_KEY", SB_KEY), ("SUPABASE_SECRET", SB_SECRET)) if not v]
    print("supabase: chybí proměnná " + ", ".join(chybi) + " – sestavuji statickou verzi bez odhalování")

def fail(msg):
    sys.exit("CHYBA: " + msg)

# ---------- Markdown s hlavičkou ----------
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

ANO = lambda v: str(v).strip().lower() in ("ano", "true", "1", "yes")

def num(v, where):
    try:
        return float(v.replace(",", "."))
    except ValueError:
        fail(f"{where}: „{v}“ není číslo")

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

class ChybiFunkce(Exception):
    pass

def sb_rpc(fn, body, volitelna=False):
    hdr = {"apikey": SB_SECRET, "Content-Type": "application/json"}
    if SB_SECRET.startswith("eyJ"):
        hdr["Authorization"] = "Bearer " + SB_SECRET
    req = urllib.request.Request(f"{SB_URL}/rest/v1/rpc/{fn}", data=json.dumps(body, ensure_ascii=False).encode("utf-8"), headers=hdr, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        txt = e.read().decode("utf-8", "replace")
        if volitelna and e.code in (400, 404) and "PGRST202" in txt:
            raise ChybiFunkce(fn)
        fail(f"Supabase {fn}: HTTP {e.code} {txt[:400]}")
    except urllib.error.URLError as e:
        fail(f"Supabase {fn}: {e.reason}")

# ---------- obsah: soubory, obrázky, generátor ----------
# Rody, osoby, vazby, rodokmeny, Praha, místa, Kronika, Družina, protivníci a Draconomicon zpracovává zdroj/generator.js
# (stejný kód používá web, když vypravěč upraví text). Na webu napojeném na databázi je zdrojem pravdy
# databáze (tabulka zaznamy); soubory v repozitáři jsou její záloha a nové či změněné soubory se do ní přenesou.
ZAZNAMY_SLOZKY = ("rody/", "osoby/", "kronika/", "druzina/", "mista/", "praha/", "protivnici/", "privlastky/", "setkani/", "draconomicon/kapitoly/", "draconomicon/plemena/")
ZAZNAMY_SOUBORY = ("vazby.md", "rodokmeny.json", "postavy-1458.json", "vyprava-setkani.json")
GENERATOR = os.path.join(ROOT, "zdroj", "generator.js")

def je_zaznam(rel):
    name = rel.rsplit("/", 1)[-1]
    if rel.startswith("karty/") and rel.endswith(".json") and not name.startswith("_") and rel.count("/") == 1:
        return True
    return rel in ZAZNAMY_SOUBORY or (rel.startswith(ZAZNAMY_SLOZKY) and rel.endswith(".md") and not name.startswith("_") and rel.count("/") == (2 if rel.startswith("draconomicon/") else 1))

def soubory_z_disku():
    out = {}
    for koren, _, files in os.walk(OBSAH):
        for fn in files:
            rel = os.path.relpath(os.path.join(koren, fn), OBSAH).replace(os.sep, "/")
            if je_zaznam(rel):
                out[rel] = open(os.path.join(koren, fn), encoding="utf-8").read().replace("\r\n", "\n")
    return dict(sorted(out.items()))

def otisk(t):
    return hashlib.md5(t.encode("utf-8")).hexdigest()

def manifest_z_disku():
    """Které obrázky existují: erby rodů, portréty osob (+ zmenšenina -m), obrázky dračích plemen."""
    art = os.path.join(ROOT, "art")
    ls = lambda d: sorted(os.listdir(os.path.join(art, d))) if os.path.isdir(os.path.join(art, d)) else []
    erby = {fn[:-5]: f"art/erby/{fn}" for fn in ls("erby") if fn.endswith(".webp") and os.path.isfile(os.path.join(art, "erby", fn))}
    portrety = [fn[:-7] for fn in ls("portrety") if fn.endswith("-m.webp")]
    draci = [fn[:-5] for fn in ls("draci") if fn.endswith(".webp") and not fn.endswith(("-h.webp", "-m.webp", "-t.webp"))]
    bestiar = [fn[:-5] for fn in ls("bestiar") if fn.endswith(".webp") and not fn.endswith("-96.webp")]  # obrázky protivníků pro žetony v Boji (art/bestiar/<id>.webp)
    if DB:  # nečitelné názvy, aby se nedalo uhodnout, kdo či co existuje
        P = {pid: hashlib.sha256(f"mm-portret:{SB_SECRET}:{pid}".encode()).hexdigest()[:24] for pid in portrety}
        D = {i: hashlib.sha256(f"mm-drak:{SB_SECRET}:{i}".encode()).hexdigest()[:24] for i in draci}
        B = {i: hashlib.sha256(f"mm-bestiar:{SB_SECRET}:{i}".encode()).hexdigest()[:24] for i in bestiar}
    else:
        P, D, B = {pid: pid for pid in portrety}, {i: i for i in draci}, {i: i for i in bestiar}
    return {"erby": erby, "portrety": P, "draci": D, "bestiar": B}

def generuj(soubory, manifest):
    try:
        r = subprocess.run(["node", GENERATOR], input=json.dumps({"soubory": soubory, "manifest": manifest}, ensure_ascii=False),
                           capture_output=True, text=True, encoding="utf-8", timeout=120)
    except FileNotFoundError:
        fail("pro sestavení je potřeba Node.js (příkaz node)")
    if r.returncode == 2:
        fail(r.stderr.strip())
    if r.returncode != 0:
        fail("generátor obsahu selhal: " + r.stderr.strip()[-800:])
    return json.loads(r.stdout)

# ---------- sestavení ----------
# koruna.html může být jeden soubor, nebo kostra s řádky /*@vloz web/…*/ (zdroj/rozdel.py) – vloží se obsah souborů
def vloz_soubory(t):
    def rep(m):
        p = os.path.join(ROOT, "zdroj", m.group(1))
        if not os.path.isfile(p):
            fail(f"chybí zdroj/{m.group(1)} (vkládá ho koruna.html)")
        t = open(p, encoding="utf-8").read()
        # hranice souborů skriptu: hráčská verze podle nich dělí skript na díly s vlastním otiskem (viz níže)
        mm = re.match(r"web/js/(\d\d)", m.group(1))
        return (f"/*@soubor {mm.group(1)}*/\n" + t) if mm else t
    return re.sub(r"^/\*@vloz (web/[\w./-]+)\*/\n", rep, t, flags=re.M)
s = vloz_soubory(open(SRC, encoding="utf-8").read())
J = lambda v: json.dumps(v, ensure_ascii=False, separators=(",", ":"))
GEN_VERZE = otisk(open(GENERATOR, encoding="utf-8").read())[:12]
SOUBORY = soubory_z_disku()
MANIFEST = manifest_z_disku()
if DB:
    # 1) změny ze souborů do databáze – jen na větvi, kam se zálohuje (jinak by starší větev přepsala novější texty)
    sync_vetve = [v.strip() for v in os.environ.get("MM_SYNC_VETVE", "dev").split(",") if v.strip()]
    try:
        if VETEV in sync_vetve:
            generuj(SOUBORY, MANIFEST)  # nejdřív kontrola souborů – chybný soubor se do databáze nedostane
            r = sb_rpc("mm_sync_zaznamy", {"p_soubory": [{"soubor": k, "md": v, "hash": otisk(v)} for k, v in SOUBORY.items()], "p_uplny": True}, True)
            print(f"supabase: ze souborů nových {r['nove']}, změněných {r['zmenene']}, smazaných {r['smazane']}")
            for k in r.get("konflikty") or []:
                print(f"supabase: KONFLIKT {k} – na webu upraveno od poslední zálohy, ponechávám verzi z webu")
        if "--jen-zaznamy" in sys.argv:  # workflow „Texty do ostré databáze“: jen přenos souborů obsahu, bez sestavení webu
            sys.exit(0 if VETEV in sync_vetve else fail(f"--jen-zaznamy: větev {VETEV} není v MM_SYNC_VETVE"))
        # 2) obsah se generuje z databáze (zdroj pravdy); nahrané obrázky mají přednost před soubory
        z = sb_rpc("mm_zaznamy_vse", {}, True)
        if z:
            SOUBORY = dict(sorted(z.items()))
        else:
            print("supabase: databáze zatím nemá žádné texty – používám soubory z repozitáře")
        nahrane = sb_rpc("mm_obrazky", {}, True) or {}
        for typ in ("erby", "portrety", "draci"):
            MANIFEST[typ].update(nahrane.get(typ) or {})
    except ChybiFunkce as e:
        if "--jen-zaznamy" in sys.argv:
            fail(f"v databázi chybí funkce {e} – spusťte aktuální supabase/schema.sql")
        print(f"supabase: v databázi chybí funkce {e} – spusťte aktuální supabase/schema.sql; zatím sestavuji ze souborů")
G = generuj(SOUBORY, MANIFEST)
HRAC, GMD, SEED = G["hrac"], G["gm"], G["seed"]
GMD["MANIFEST"] = MANIFEST
STAT = {"PSTREETS": ulice(), "SVET": svet(), "SVETMESTA": svet_mesta()}
STAT["SVETDRZ"] = svet_drzavy({o["id"] for o in STAT["SVET"]})
STAT["SVETCESTY"] = svet_cesty(STAT["SVETMESTA"])
_stat = J(STAT)
STAT_H_TXT, rem2 = strip_secrets(_stat)
STAT_H, STAT_G = json.loads(STAT_H_TXT.replace("✦ ", "").replace("✦", "")), json.loads(show_secrets(_stat))
secrets_all = G["odstranene"] + rem2
ODH_KLICE = list(HRAC)

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
for key in ODH_KLICE + list(STAT):
    for empty in ("[]", "{}"):
        tag = f"/*@{key}@*/{empty}"
        if tag in s:
            s = s.replace(tag, f"(__D.{key}||{empty})")
            break
    else:
        fail(f"ve zdroji chybí značka /*@{key}@*/")
for tag in ("/*@GM@*/false", "/*@MMDATA@*/"):
    if tag not in s:
        fail(f"ve zdroji chybí značka {tag}")
s = s.replace("/*@GM@*/false", "!!__D.GM")
safe = lambda v: J(v).replace("</", "<\\/")
if DB:
    s = s.replace("/*@MMDATA@*/", "window.MMCFG=" + safe({"url": SB_URL, "key": SB_KEY, "vetev": VETEV, "gen": GEN_VERZE}) + ";window.__S=" + safe(STAT_H) + ";/*@MMLINE@*/")
    if '<script id="mmhlavni">' not in s:
        fail('ve zdroji chybí <script id="mmhlavni">')
    s = s.replace('<script id="mmhlavni">', '<script type="text/x-mm" id="mmhlavni">')
else:
    s = s.replace("/*@MMDATA@*/", "window.__D=" + safe(DATA) + ";/*@MMLINE@*/")

if GM:
    s = show_secrets(s)
    s = re.sub(r"^/\*@soubor \d\d\*/\n", "", s, flags=re.M)
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
        head + reset + "</head>\n<body>\n" + body + "\n</body>\n</html>\n")

if DB:
    _arg = {"p_vetev": VETEV, "p_hrac": HRAC, "p_gm": {**GMD, **{k: v for k, v in STAT_G.items() if v != STAT_H.get(k)}}, "p_vychozi": SEED}
    try:
        ver = sb_rpc("mm_nahraj_obsah", {**_arg, "p_gen": GEN_VERZE}, True)
    except ChybiFunkce:
        ver = sb_rpc("mm_nahraj_obsah", _arg)
    print(f"supabase: obsah větve „{VETEV}“ nahrán, verze výřezu {ver}")

# Zmenšení hráčských souborů v/ (2026-10-21): esbuild odstraní mezery a komentáře a zkrátí místní jména; jména na nejvyšší
# úrovni (sdílená mezi díly) zůstanou, takže díly spolu dál mluví. Zdroj i vypravěčská verze zůstávají čitelné.
# Potřebuje `npm ci` (Netlify ho spustí sám podle package.json); bez esbuildu nebo s MM_BEZ_ZMENSENI=1 se nezmenšuje.
ESBUILD = os.path.join(ROOT, "node_modules", ".bin", "esbuild")
def zmensi_vse(soubory):
    if os.environ.get("MM_BEZ_ZMENSENI") or not os.path.exists(ESBUILD):
        print("  (soubory v/ se nezmenšují – " + ("MM_BEZ_ZMENSENI" if os.environ.get("MM_BEZ_ZMENSENI") else "chybí esbuild, spusť npm ci") + ")")
        return soubory
    ven, pred, po = {}, 0, 0
    for jm, t in soubory.items():
        typ = "css" if jm.endswith(".css") else "js" if jm.endswith(".js") else None
        if not typ:
            ven[jm] = t
            continue
        r = subprocess.run([ESBUILD, "--minify", f"--loader={typ}", "--log-level=error", "--charset=utf8"], input=t, capture_output=True, text=True, encoding="utf-8")
        if r.returncode != 0:
            fail(f"zmenšení v/{jm} selhalo: {r.stderr.strip()[-600:]}")
        # esbuild s --charset=utf8 přepíše \u27e6 a \u27e7 v řetězcích na znaky ⟦ ⟧ – ty ale kontrola tajemství hledá; vrátit jako escape
        ven[jm] = r.stdout.replace("\u27e6", "\\u27e6").replace("\u27e7", "\\u27e7") if typ == "js" else r.stdout
        pred += len(t.encode("utf-8"))
        po += len(r.stdout.encode("utf-8"))
    print(f"  zmenšeno: {pred // 1024} kB → {po // 1024} kB")
    return ven

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)
VSOUB = {}  # soubory s otiskem obsahu ve jménu: v/<jméno> -> obsah
if not GM:
    # Hráčská verze: hlavní styl a hlavní skript jdou do samostatných souborů s otiskem obsahu.
    # Prohlížeč (a service worker) si je uloží natrvalo; při další návštěvě se stahuje jen malá stránka s daty.
    otisk_v = lambda t: hashlib.md5(t.encode("utf-8")).hexdigest()[:10]
    a = page.index("<style>", page.index("</style>") + 8)  # druhý blok stylů = hlavní styl (první jsou písma)
    b = page.index("</style>", a)
    css = page[a + 7:b].replace("url(art/", "url(../art/").replace('url("art/', 'url("../art/').replace("url('art/", "url('../art/")
    jm_css = f"styl-{otisk_v(css)}.css"
    VSOUB[jm_css] = css
    page = page[:a] + f'<link rel="stylesheet" href="v/{jm_css}">' + page[b + 8:]
    zn = '<script type="text/x-mm" id="mmhlavni">' if DB else '<script id="mmhlavni">'
    a = page.index(zn)
    b = page.index("</script>", a)
    js = page[a + len(zn):b]
    # samostatné části (/*@cast název{*/ … /*@cast}*/): stáhnou se, až je stránka potřebuje (mmLina v 01-zaklad.js)
    CASTI = {}
    def vyrizni(m):
        CASTI[m.group(1)] = CASTI.get(m.group(1), "") + m.group(2)
        return ""
    js = re.sub(r"/\*@cast (\w+)\{\*/\n(.*?)/\*@cast\}\*/\n", vyrizni, js, flags=re.S)
    if "/*@cast" in js:
        fail("neuzavřená část /*@cast …*/ ve skriptu")
    LINE = {}
    for jm, t in CASTI.items():
        t = re.sub(r"^/\*@soubor \d\d\*/\n", "", t, flags=re.M)
        jmc = f"cast-{jm}-{otisk_v(t)}.js"
        VSOUB[jmc] = t
        LINE[jm] = f"v/{jmc}"
    # zbytek skriptu: díly podle čísel souborů – po nasazení se stáhne jen díl, který se změnil
    # jádro (zaklad, stav, start) se stáhne hned a stránka se ukáže; boj, karta a hra (soubory 10–25) tvoří
    # líně načítanou část „hra“ (MMLINE.hra, pořadí dílů zachované) – 26-start ji stáhne na pozadí po vykreslení
    # díly jsou menší (2026-10-20): po nasazení se stáhne jen ten, který se změnil – karta 13–19 byla jeden díl 180 kB (gz),
    # a měnila se skoro každým nasazením
    DILY = [("zaklad", 1, 8, 0), ("stav", 9, 9, 0), ("boj", 10, 12, 1), ("karta", 13, 15, 1), ("karta2", 16, 19, 1), ("hra", 20, 20, 1), ("hra2", 21, 25, 1), ("start", 26, 99, 0)]
    kusy = re.split(r"^/\*@soubor (\d\d)\*/\n", js, flags=re.M)
    obsah = {d[0]: "" for d in DILY}
    obsah[DILY[0][0]] += kusy[0]
    for i in range(1, len(kusy), 2):
        n = int(kusy[i])
        obsah[next(d[0] for d in DILY if d[1] <= n <= d[2])] += kusy[i + 1]
    jm_jsy, line_hra = [], []
    for d in DILY:
        t = obsah[d[0]]
        if t.strip():
            jm = f"{d[0]}-{otisk_v(t)}.js"
            VSOUB[jm] = t
            (line_hra if d[3] else jm_jsy).append(jm)
    if line_hra:
        LINE["hra"] = ["v/" + j for j in line_hra]
    if DB:
        tag = f'<script type="text/x-mm" id="mmhlavni" data-src="{" ".join("v/" + j for j in jm_jsy)}"></script>'
    else:
        tag = f'<script id="mmhlavni" src="v/{jm_jsy[0]}"></script>' + "".join(f'\n<script src="v/{j}"></script>' for j in jm_jsy[1:])
    page = page[:a] + tag + page[b + 9:]
    page = page.replace("/*@MMLINE@*/", "window.MMLINE=" + safe(LINE) + ";", 1)  # až po vyříznutí (posunulo by indexy)
    page = page.replace("</head>", "".join(f'<link rel="preload" href="v/{j}" as="script">\n' for j in jm_jsy) + "</head>", 1)
    js = "".join(obsah.values())
    # service worker: offline režim a rychlé opakované návštěvy (verze podle otisku stránky)
    sw = open(os.path.join(ROOT, "zdroj", "sw.js"), encoding="utf-8").read()
    sw = (sw.replace("/*@VERZE@*/", otisk_v(css + js + page)).replace("/*@JADRO@*/[]", json.dumps(["./", f"v/{jm_css}"] + [f"v/{j}" for j in jm_jsy + line_hra]))
          .replace("/*@SOUBORY@*/[]", json.dumps(["v/" + j for j in VSOUB])))
    open(os.path.join(OUT, "sw.js"), "w", encoding="utf-8").write(sw)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
os.makedirs(os.path.join(OUT, "v"), exist_ok=True)
if VSOUB:
    VSOUB = zmensi_vse(VSOUB)
for jm, obsah in VSOUB.items():
    open(os.path.join(OUT, "v", jm), "w", encoding="utf-8").write(obsah)
if DB:  # generátor si stáhne jen vypravěč, když upravuje texty na webu
    shutil.copyfile(GENERATOR, os.path.join(OUT, "v", f"generator-{GEN_VERZE}.js"))
shutil.copytree(os.path.join(ROOT, "art"), os.path.join(OUT, "art"), ignore=shutil.ignore_patterns("portrety", "draci", "bestiar") if DB else None)
# kouzla pro karty hráčů (2026-10-20): bez popisu tam, kde automatika čte starší text (ta) – popis
# si karta dotáhne z plného art/kouzla.json, až hráč kouzlo rozklikne; plný soubor čte vypravěč (stránka Kouzla, kouzla NPC)
try:
    _kz = json.load(open(os.path.join(ROOT, "art", "kouzla.json"), encoding="utf-8"))
    _lehka = []
    for _x in _kz:
        _y = {k: v for k, v in _x.items() if k not in ("cs", "vt")}  # povolání (p) karta potřebuje při učení kouzel
        if _y.get("ta") is not None:
            _y.pop("t", None)
        _lehka.append(_y)
    with open(os.path.join(OUT, "art", "kouzla-karta.json"), "w", encoding="utf-8") as _f:
        json.dump(_lehka, _f, ensure_ascii=False, separators=(",", ":"))
except FileNotFoundError:
    pass
if DB:
    for slozka, mapa, pripony in (("draci", MANIFEST["draci"], ("", "-h", "-m", "-t")), ("portrety", MANIFEST["portrety"], ("", "-m", "-s")), ("bestiar", MANIFEST.get("bestiar", {}), ("", "-96"))):
        src_d, dst_d = os.path.join(ROOT, "art", slozka), os.path.join(OUT, "art", slozka)
        os.makedirs(dst_d)
        for jm, stem in mapa.items():
            if not isinstance(stem, str):
                continue  # nahraný obrázek – leží v úložišti Supabase
            for suf in pripony:
                if os.path.exists(os.path.join(src_d, f"{jm}{suf}.webp")):
                    shutil.copyfile(os.path.join(src_d, f"{jm}{suf}.webp"), os.path.join(dst_d, f"{stem}{suf}.webp"))
mode = "vypravěčská" if GM else ("hráčská, napojená na databázi" if DB else "hráčská, statická")
print(f"ok: {OUT}/index.html ({len(page)//1024} kB), {mode} verze")
