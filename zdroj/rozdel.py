#!/usr/bin/env python3
"""Rozdělí zdroj/koruna.html na menší soubory v zdroj/web/ (styly a hlavní skript po oddílech).

V koruna.html zůstane kostra stránky (hlavička, HTML pohledů, zavaděč dat) a místo stylů a skriptu řádky
/*@vloz web/…*/. build.py je při sestavení nahradí obsahem souborů, takže výsledek je bajt po bajtu stejný
jako původní soubor (skript to ověří, jinak nic nezapíše).

    python3 zdroj/rozdel.py          rozdělí (když už rozdělený je, nic nedělá)
    python3 zdroj/rozdel.py --spoj   spojí zpět do jednoho souboru (pro případ nouze)
    python3 zdroj/rozdel.py --zkus   jen ověří, že by rozdělení prošlo

Hranice oddílů se hledají podle začátku hlavičky komentáře, ne podle čísel řádků – skript jde pustit znovu
na novější verzi souboru. Když hlavička chybí, oddíl se přiřadí k předchozímu souboru a skript to vypíše.
"""
import os, re, sys

ZDROJ = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ZDROJ, "koruna.html")
WEB = os.path.join(ZDROJ, "web")
VLOZ = re.compile(r"^/\*@vloz (web/[\w./-]+)\*/\n", re.M)

# soubor → začátek prvního řádku oddílu (hlavička komentáře); první soubor začíná hned za <script id="mmhlavni">
JS = [
    ("01-zaklad.js", None),
    ("02-mapa.js", "/* --- map geometry --- */"),
    ("02b-mapa-kresba.js", "/* ===== Mapa zemí: kresba"),
    ("02c-zbroj.js", "/* @čisté – Druhy zbroje podle Artikulí"),
    ("02d-pojmy.js", "/* @čisté – Pojmy pro zobrazení česky"),
    ("02e-krajina.js", "/* @čisté – Krajina roku 1458"),
    ("02f-mapa-cela.js", "/* ===== Mapy přes celou obrazovku"),
    ("02g-mista.js", "/* ===== Shrnutí míst mapy (CITYINFO)"),
    ("03-artikule.js", "/* ---------- Artikule: pravidla tažení"),
    ("04-praha.js", "/* ---------- Praha: plán města"),
    ("04b-praha-plan.js", "/* ===== Praha: kreslený plán"),
    ("05-svet.js", "/* ---------- Známý svět: mapa Evropy"),
    ("05b-svet-mapa.js", "/* ===== Známý svět: kresba"),
    ("06-draconomicon-rodokmeny.js", "/* ---------- Draconomicon ---------- */"),
    ("07-druzina-kronika.js", "/* ======== Družina · Kronika tažení"),
    ("07s-stopa.js", "/* @čisté – Stopa družiny na mapě"),
    ("08-navigace-pravidla.js", "/* ---------- site navigation"),
    ("09-vypravec-herni-cas.js", "/* ===== Vypravěč: stavy odhalení"),
    ("09g-generator-postav.js", "/* @čisté – Generátor postav doby"),
    ("10-kouzla.js", "/* ===== Kouzla: SRD 5.2.1 česky"),
    ("10g-hledej.js", "/* @čisté – Hledání v pravidlech"),
    ("10h-hledani.js", "/* ===== Hledání v pravidlech"),
    ("10k-import-pdf.js", "/* @čisté – Import listu postavy z PDF"),
    ("10p-pravidla.js", "/* @čisté – Pravidla boje a Artikulí"),
    ("10q-plne-texty.js", "/* ===== Plné znění kouzel a předmětů"),
    ("10r-reakce.js", "/* @čisté – Okno reakce"),
    ("10t-tah.js", "/* @čisté – Účet tahu"),
    ("10u-ucinky.js", "/* @čisté – Účinky v jednom formátu"),
    ("10v-veci.js", "/* @čisté – Vlastní předměty z Dílny"),
    ("10w-zbrane.js", "/* @čisté – Vlastnosti a mistrovství zbraní"),
    ("10x-strelec.js", "/* @čisté – Střelec (Gunslinger"),
    ("10y-sluzby.js", "/* @čisté – Služby a mzdy tažení"),
    ("11-boj.js", "/* ===== BOJ: tracker slotové iniciativy"),
    ("11b-rucni-kostky.js", "/* ===== Ruční kostky"),
    ("12-boj-tah-postavy.js", "/* ===== automatizace tahu:"),
    ("13-karty.js", "/* ===== Karty postav: import listu z PDF"),
    ("14-karty-bojova-karta.js", "/* ===== Karta: vybavení z nabídky"),
    ("14b-vybaveni.js", "/* ===== Vybavení (2026-10-19)"),
    ("14c-boj-reakce.js", "/* ===== Boj: zásahy rovnou do karty"),
    ("14d-vybaveni-katalog.js", "/* ===== Vybavení: katalog"),
    ("15-karty-artikule.js", "/* ===== Karta postavy podle Artikulí"),
    ("16-srd-ukazky-sezeni-hrac.js", "/* ===== SRD 5.2.1: magické předměty"),
    ("17-karty-ii.js", "/* ===== Karta postavy II"),
    ("17b-kouzla-ucinky.js", "/* ===== Kouzla: účinky na cílech"),
    ("18-pravidla-postavy.js", "/* ===== Pravidla postavy"),
    ("19-karty-beyond.js", "/* ===== karta jako D&D Beyond (2026-10-17 b)"),
    ("19b-automatika.js", "/* ===== Automatika podle karet družiny"),
    ("20-boj-hraci.js", "/* ===== Boj: hráč na telefonu"),
    ("20b-boj-vypravec.js", "/* ===== Boj: vypravěč – vyhodnocení"),
    ("20c-boj-ridery.js", "/* ===== Boj: volby po zásahu"),
    ("20d-boj-render.js", "/* ===== Boj: vykreslení"),
    ("20e-boj-vlastnosti.js", "/* ===== Boj: vlastnosti zbraní z Artikulí v boji"),
    ("20f-scena.js", "/* ===== Scéna mimo boj"),
    ("20g-boj-mistrovstvi.js", "/* ===== Boj: vlastnosti a mistrovství zbraní"),
    ("21-editor-pecet.js", "/* ===== Vypravěč: úpravy textů a obrázků"),
    ("22-vyprava.js", "/* ===== VÝPRAVA: cesta družiny"),
    ("22b-vyprava.js", "/* ===== Výprava: stránka vypravěče"),
    ("23-potvrzovani.js", "/* ===== Potvrzování akcí hráčů"),
    ("24-boj-zaznam.js", "/* ===== Boj: herní záznam ve třetím sloupci"),
    ("25-puls.js", "/* ===== Puls: jeden dotaz"),
    ("26-start.js", "/* ===== Pečeť:"),
]
CSS = "styly.css"


def sestav(text, koren=ZDROJ):
    """Nahradí řádky /*@vloz web/…*/ obsahem souborů (stejná funkce je v build.py)."""
    def rep(m):
        p = os.path.join(koren, m.group(1))
        if not os.path.isfile(p):
            raise SystemExit(f"chybí soubor {m.group(1)} (vkládá ho koruna.html)")
        return open(p, encoding="utf-8").read()
    return VLOZ.sub(rep, text)


def rozdel(s):
    a = s.find('<script id="mmhlavni">\n')
    b = s.rfind("</script>")
    if a < 0 or b < a:
        raise SystemExit('nenašel jsem <script id="mmhlavni"> … </script>')
    a += len('<script id="mmhlavni">\n')
    js = s[a:b]
    st = [m.start() for m in re.finditer(r"<style>\n", s)]
    if len(st) < 2:
        raise SystemExit("nenašel jsem druhý blok <style>")
    ca = st[1] + len("<style>\n")
    cb = s.find("</style>", ca)
    css = s[ca:cb]
    # hranice JS oddílů
    zac, chybi = [0], []
    for jm, hl in JS[1:]:
        m = re.search("^" + re.escape(hl), js, re.M)
        if not m or m.start() <= zac[-1]:
            chybi.append(jm); zac.append(None); continue
        zac.append(m.start())
    casti, posl = [], None
    for i, (jm, _) in enumerate(JS):
        if zac[i] is None:
            continue
        konec = next((z for z in zac[i + 1:] if z is not None), len(js))
        casti.append((jm, js[zac[i]:konec]))
    soubory = {"web/" + CSS: css, **{"web/js/" + jm: t for jm, t in casti}}
    kostra = (s[:ca] + f"/*@vloz web/{CSS}*/\n" + s[cb:a]
              + "".join(f"/*@vloz web/js/{jm}*/\n" for jm, _ in casti) + s[b:])
    return kostra, soubory, chybi


def main():
    s = open(SRC, encoding="utf-8").read()
    if "--spoj" in sys.argv:
        if not VLOZ.search(s):
            print("koruna.html už je jeden soubor."); return
        cele = sestav(s)
        open(SRC, "w", encoding="utf-8").write(cele)
        for p in VLOZ.findall(s):
            os.remove(os.path.join(ZDROJ, p))
        print(f"Spojeno zpět do koruna.html ({len(cele)//1024} kB); soubory ve web/ smazány.")
        return
    if VLOZ.search(s):
        print("koruna.html už je rozdělený – nic nedělám."); return
    kostra, soubory, chybi = rozdel(s)
    # ověření: po sestavení musí vyjít přesně původní soubor
    def rep(m): return soubory[m.group(1)]
    if VLOZ.sub(rep, kostra) != s:
        raise SystemExit("Ověření selhalo: po spojení by soubor nebyl stejný. Nic jsem nezapsal.")
    for jm in chybi:
        print(f"pozor: hlavička oddílu pro {jm} nenalezena – oddíl je v předchozím souboru")
    if "--zkus" in sys.argv:
        print(f"Rozdělení by prošlo: kostra {len(kostra)//1024} kB + {len(soubory)} souborů."); return
    os.makedirs(os.path.join(WEB, "js"), exist_ok=True)
    for p, t in soubory.items():
        open(os.path.join(ZDROJ, p), "w", encoding="utf-8").write(t)
    open(SRC, "w", encoding="utf-8").write(kostra)
    print(f"Rozděleno: koruna.html {len(kostra)//1024} kB (kostra) + {len(soubory)} souborů ve zdroj/web/.")
    for p, t in soubory.items():
        print(f"  {p:42} {t.count(chr(10)):6} řádků")


if __name__ == "__main__":
    main()
