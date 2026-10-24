#!/usr/bin/env python3
"""Plné znění featů (Vojtův překlad, mimo SRD) → JSON / SQL pro tabulku pravidla_texty (klíč „featy“).

Text NENÍ v repozitáři (je veřejný) – zdrojem je Markdown v projektu claude.ai (pravidla/featy-AAAA-MM-DD.md).
Na webu se zobrazí jen přihlášeným (mm_pravidla_texty). Použití:
  python3 zdroj/mimo-srd/featy_plne.py featy.md            # JSON na výstup
  python3 zdroj/mimo-srd/featy_plne.py featy.md --sql      # příkaz pro SQL editor / konektor Supabase

Formát Markdownu: „# English (Česky)“, pod ním kurzívou kategorie a předpoklady („*Obecný feat (předpoklad: …)*“),
pak text; odstavce „> **Artikule – …**“ jsou úpravy z Artikulí, tabulky jako v GitHub Markdownu.
"""
import json
import re
import sys

KAT = [
    ("Feat původu", "origin"),
    ("Obecný feat", "general"),
    ("Feat bojového stylu", "fightStyle"),
    ("Náhrada bojového stylu", "fightStyle"),
    ("Feat epického daru", "epic"),
    ("Feat temného daru", "darkGift"),
    ("Feat dračího znamení", "dragonmark"),
]


def featy(md):
    out = []
    for blok in re.split(r"(?m)^(?=# )", md)[1:]:
        hlava, _, telo = blok.partition("\n")
        m = re.match(r"# (.+?) \((.+)\)\s*$", hlava)
        if not m:
            raise SystemExit(f"neznámá hlavička: {hlava!r}")
        en, cz = m.group(1).strip(), m.group(2).strip()
        telo = telo.strip("\n")
        k = re.match(r"\*([^*\n]+)\*\s*\n", telo)
        if not k:
            raise SystemExit(f"{en}: chybí řádek s kategorií")
        radek, telo = k.group(1).strip(), telo[k.end():].strip()
        jm, kat = next(((n, c) for n, c in KAT if radek.startswith(n)), (None, None))
        if not kat:
            raise SystemExit(f"{en}: neznámá kategorie {radek!r}")
        pred = radek[len(jm):].strip()
        if pred.startswith("(") and pred.endswith(")"):
            pred = pred[1:-1].replace(") (", "; ")
        f = {"en": en, "cz": cz, "kat": kat, "pred": pred, "t": telo}
        if radek.startswith("Náhrada"):
            f["nahr"] = 1
        out.append(f)
    return out


if __name__ == "__main__":
    F = featy(open(sys.argv[1], encoding="utf-8").read())
    j = json.dumps(F, ensure_ascii=False, separators=(",", ":"))
    if "--sql" in sys.argv:
        print(f"insert into public.pravidla_texty (klic, data, zmeneno) values ('featy', $mmfeaty${j}$mmfeaty$::jsonb, now())"
              " on conflict (klic) do update set data = excluded.data, zmeneno = now();")
    else:
        print(j)
    print(f"{len(F)} featů", file=sys.stderr)
