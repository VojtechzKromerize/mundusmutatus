#!/usr/bin/env python3
"""Sestaví web Mundus Mutatus.

  python3 zdroj/build.py            -> public/  (hráčská verze, nasazuje Netlify)
  python3 zdroj/build.py --vypravec -> vypravec/index.html (s tajemstvími, NEPUBLIKOVAT)

Tajemství se ve zdroji značí  ⟦tajný text⟧  nebo  ⟦tajný text¦text pro hráče⟧.
Obsah Kroniky, Družiny a objevených míst je v zdroj/obsah/*/ jako Markdown s hlavičkou.
Jen standardní knihovna Pythonu (běží i na Netlify).
"""
import html, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "zdroj", "koruna.html")
OBSAH = os.path.join(ROOT, "zdroj", "obsah")
GM = "--vypravec" in sys.argv
OUT = os.path.join(ROOT, "vypravec" if GM else "public")

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
        if all(l.lstrip().startswith(("- ", "* ")) for l in lines):
            out.append("<ul>" + "".join("<li>" + inline(l.lstrip()[2:]) + "</li>" for l in lines) + "</ul>")
        elif lines[0].startswith("## "):
            out.append("<h3>" + inline(lines[0][3:]) + "</h3>" + ("<p>" + inline(" ".join(lines[1:])) + "</p>" if lines[1:] else ""))
        else:
            out.append("<p>" + inline(" ".join(l.strip() for l in lines)) + "</p>")
    return "\n".join(out)

def read_dir(name):
    d = os.path.join(OBSAH, name)
    items = []
    for fn in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not fn.endswith(".md") or fn.startswith("_"):
            continue
        raw = open(os.path.join(d, fn), encoding="utf-8").read()
        m = re.match(r"---\n(.*?)\n---\n?(.*)", raw, re.S)
        if not m:
            fail(f"{name}/{fn}: chybí hlavička --- … ---")
        meta = {}
        for line in m.group(1).split("\n"):
            if line.strip() and not line.lstrip().startswith("#"):
                k, _, v = line.partition(":")
                meta[k.strip()] = v.strip()
        meta["_body"] = m.group(2)
        meta["_file"] = fn
        items.append(meta)
    return items

def lst(v):
    return [x.strip() for x in v.split(",") if x.strip()] if v else []

def zapisy():
    out = []
    for z in read_dir("kronika"):
        for k in ("id", "title", "date", "place"):
            if not z.get(k):
                fail(f"kronika/{z['_file']}: chybí '{k}'")
        out.append({"id": z["id"], "n": z.get("n", ""), "date": z["date"], "datum": z.get("datum", ""),
                    "place": z["place"], "route": lst(z.get("route")) or [z["place"]],
                    "title": z["title"], "text": md(z["_body"])})
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

def mista():
    out = []
    for p in read_dir("mista"):
        try:
            out.append({"name": p["name"], "lo": float(p["lo"]), "la": float(p["la"]), "note": p.get("note", ""), "z": p.get("zapis", "")})
        except (KeyError, ValueError):
            fail(f"mista/{p['_file']}: potřebuje name, lo, la")
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

# ---------- sestavení ----------
s = open(SRC, encoding="utf-8").read()
J = lambda v: json.dumps(v, ensure_ascii=False, separators=(",", ":"))
for key, val in (("ZAPISY", zapisy()), ("PARTY", druzina()), ("MISTA", mista())):
    tag = f"/*@{key}@*/[]"
    if tag not in s:
        fail(f"ve zdroji chybí značka {tag}")
    s = s.replace(tag, J(val))

if GM:
    s = show_secrets(s)
else:
    s, removed = strip_secrets(s)
    s = s.replace("✦ ", "").replace("✦", "")
    for sec in removed:  # pojistka: žádný tajný text nesmí zůstat
        probe = sec.strip()[:40]
        if len(probe) > 12 and probe in s:
            fail("tajemství proteklo do hráčské verze: " + probe)
    if "⟦" in s or "⟧" in s:
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

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(page)
shutil.copytree(os.path.join(ROOT, "art"), os.path.join(OUT, "art"))
print(f"ok: {OUT}/index.html ({len(page)//1024} kB), {'vypravěčská' if GM else 'hráčská'} verze")
