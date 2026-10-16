# Sestaví art/pravidla.json z českého překladu SRD 5.2.1 (zdroj/pravidla/NN-*.md) s poznámkami Artikulí.
# Volá ho zdroj/build.py; jde spustit i ručně:  python3 zdroj/pravidla/sestav.py
import json, os, re, html

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(D))

KAP = [  # id, název, soubory (pořadí), popis
    ("hrani", "Hraní hry", "01 02 03", "Testy d20, zdatnost, akce, průzkum, boj, zranění a léčení"),
    ("tvorba", "Tvorba postavy", "11", "Tvorba postavy, postup na úroveň, více povolání"),
    ("povolani", "Povolání", "12 13 14 15 16 17 18 19 20 21 22 23", "Rysy, podtřídy a seznamy kouzel dvanácti povolání"),
    ("puvod", "Původ a featy", "24", "Zázemí, druhy (species) a featy"),
    ("vybava", "Výbava", "04 05", "Mince, zbraně, zbroj, nástroje, výstroj, jízdní zvířata, služby"),
    ("kouzleni", "Sesílání kouzel", "06", "Sloty, složky, soustředění, oblasti účinku"),
    ("glosar", "Glosář pravidel", "07 08", "Definice pravidel, stavy, akce a nebezpečí od A do Z"),
    ("nastroje", "Nástroje vypravěče", "09 10", "Cestování, prostředí, kletby, jedy, pasti, stavba setkání"),
]
ATTR = ("Tento web obsahuje materiál ze System Reference Document 5.2.1 („SRD 5.2.1“) od Wizards of the Coast LLC, "
        "dostupného na https://www.dndbeyond.com/srd. SRD 5.2.1 je licencováno pod licencí Creative Commons Attribution 4.0 "
        "International, dostupnou na https://creativecommons.org/licenses/by/4.0/legalcode.")
ATTR_EN = ("This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, "
           "available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 "
           "International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.")


def slug(t):
    t = t.lower()
    t = t.translate(str.maketrans("áčďéěíňóřšťúůýž", "acdeeinorstuuyz"))
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60] or "oddil"


def inl(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", t)
    t = re.sub(r"(https?://[^\s<)]+)", r'<a href="\1" rel="noopener" target="_blank">\1</a>', t)
    return t


def md(src, kid, toc, nazev="", posun=0):
    out, para, lst, tab, quote = [], [], [], [], []
    used = set()

    def flush():
        nonlocal para, lst, tab, quote
        if para:
            out.append("<p>" + inl(" ".join(para)) + "</p>"); para = []
        if lst:
            out.append("<ul>" + "".join(f"<li>{inl(x)}</li>" for x in lst) + "</ul>"); lst = []
        if tab:
            rows = [r for r in tab if not re.fullmatch(r"\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?", r.strip())]
            cells = [[c.strip() for c in r.strip().strip("|").split("|")] for r in rows]
            if cells:
                h, b = cells[0], cells[1:]
                out.append('<div class="srdtab"><table><thead><tr>' + "".join(f"<th>{inl(c)}</th>" for c in h) + "</tr></thead><tbody>"
                           + "".join("<tr>" + "".join(f"<td>{inl(c)}</td>" for c in r) + "</tr>" for r in b) + "</tbody></table></div>")
            tab = []
        if quote:
            q = " ".join(quote)
            if re.match(r"\*\*Artikule:?\*\*", q):
                out.append('<aside class="srdart"><b>Artikule</b> ' + inl(re.sub(r"^\*\*Artikule:?\*\*\s*:?\s*", "", q)) + "</aside>")
            else:
                out.append("<blockquote>" + inl(q) + "</blockquote>")
            quote = []

    for raw in src.replace("\r", "").split("\n"):
        line = raw.rstrip()
        if line.startswith("<!--"):
            continue
        m = re.match(r"^(#{2,6})\s+(.*)$", line)
        if m:
            flush()
            lvl, t = len(m.group(1)), m.group(2).strip()
            if lvl == 2 and not out and not toc and (not posun or t == nazev):
                continue  # název kapitoly dává web sám
            lvl = min(6, (3 if lvl == 2 else lvl) + (posun if lvl > 2 else 0))
            i = base = kid + "-" + slug(t)
            n = 2
            while i in used:
                i = f"{base}-{n}"; n += 1
            used.add(i)
            if lvl <= 5:
                toc.append({"id": i, "n": re.sub(r"\*", "", t), "l": lvl - 2})
            out.append(f'<h{lvl} id="{i}">{inl(t)}</h{lvl}>')
            continue
        if line.startswith(">"):
            if para or lst or tab: flush()
            quote.append(line.lstrip(">").strip()); continue
        if line.lstrip().startswith("|"):
            if para or lst or quote: flush()
            tab.append(line); continue
        mm = re.match(r"^\s*[-*]\s+(.*)$", line)
        if mm and not line.strip().startswith("**"):
            if para or tab or quote: flush()
            lst.append(mm.group(1)); continue
        if not line.strip():
            flush(); continue
        if lst and raw.startswith("  "):
            lst[-1] += " " + line.strip(); continue
        if tab or quote or lst:
            flush()
        para.append(line.strip())
    flush()
    return "\n".join(out)


def sestav():
    kap = []
    for kid, n, files, popis in KAP:
        src, chyby = "", []
        for f in files.split():
            p = [x for x in sorted(os.listdir(D)) if x.startswith(f + "-") and x.endswith(".md")]
            if not p:
                chyby.append(f); continue
            src += open(os.path.join(D, p[0]), encoding="utf-8").read() + "\n\n"
        if chyby:
            raise SystemExit(f"pravidla: chybí soubory {chyby}")
        toc = []
        kap.append({"id": kid, "n": n, "p": popis, "h": md(src, kid, toc, n, 1 if kid in ("povolani", "puvod") else 0), "toc": toc})
    return {"kap": kap, "attr": ATTR, "attr_en": ATTR_EN}


if __name__ == "__main__":
    j = sestav()
    os.makedirs(os.path.join(ROOT, "art"), exist_ok=True)
    json.dump(j, open(os.path.join(ROOT, "art", "pravidla.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    # rejstřík rysů, featů a druhů pro prolinkování z karty postavy (art/srd-rysy.json)
    R = {}
    for k in j["kap"]:
        if k["id"] not in ("povolani", "puvod"):
            continue
        for t in k["toc"]:
            nm = re.sub(r"^Úroveň\s+\d+:\s*", "", t["n"]).strip()
            if re.fullmatch(r"[A-Za-z][A-Za-z’'\- :,()]+", nm) and nm not in R:
                R[nm] = [k["id"], t["id"]]
    json.dump(R, open(os.path.join(ROOT, "art", "srd-rysy.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("srd-rysy.json:", len(R), "rysů")
    print("pravidla.json:", sum(len(k["h"]) for k in j["kap"]), "znaků,", sum(len(k["toc"]) for k in j["kap"]), "oddílů")
