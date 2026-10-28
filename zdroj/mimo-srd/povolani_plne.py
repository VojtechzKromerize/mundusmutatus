#!/usr/bin/env python3
"""Plné znění povolání mimo SRD (Vojtův překlad, např. Střelec / Gunslinger) → JSON / SQL pro tabulku pravidla_texty (klíč „povolani“).

Text NENÍ v repozitáři (je veřejný) – zdrojem je Markdown v projektu claude.ai (pravidla/gunslinger-AAAA-MM-DD.md).
Na webu se zobrazí jen přihlášeným (mm_pravidla_texty, Pravidla › Doplňky mimo SRD › Povolání). Použití:
  python3 zdroj/mimo-srd/povolani_plne.py gunslinger.md [další.md …]          # JSON na výstup
  python3 zdroj/mimo-srd/povolani_plne.py gunslinger.md --sql                 # příkaz pro SQL editor / konektor Supabase

Formát Markdownu: „# Česky (English) – …“, úvodní odstavec „> …“ (poznámka pro vypravěče, na web nejde), oddíly „## …“
a rysy „### …“, tabulky, odrážky „- …“, rámečky „> **Artikule – …**“. Oddíl „## Nerozhodnuté otázky“ se vynechá.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pojmy_textu import pojmy  # noqa: E402  sjednocené pojmy a názvy stavů (Vojta 2026-10-24)


def povolani(md):
    hlava, _, telo = md.lstrip().partition("\n")
    m = re.match(r"# (.+?) \(([^)]+)\)", hlava)
    if not m:
        raise SystemExit(f"neznámá hlavička: {hlava!r}")
    cz, en = m.group(1).strip(), m.group(2).strip()
    oddily = re.split(r"(?m)^(?=## )", telo)
    oddily = [o for o in oddily[1:] if not o.startswith("## Nerozhodnut")]
    t = "\n".join(oddily)
    t = re.sub(r"(?m)^---\s*$", "", t)
    t = re.sub(r",?\s*`[^`]*\.md`", "", t).replace("`", "")
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    if len(t) < 500:
        raise SystemExit(f"{en}: text je podezřele krátký")
    return {"en": en, "cz": cz, "t": pojmy(t)}


if __name__ == "__main__":
    P = [povolani(open(f, encoding="utf-8").read()) for f in sys.argv[1:] if not f.startswith("--")]
    j = json.dumps(P, ensure_ascii=False, separators=(",", ":"))
    if "--sql" in sys.argv:
        print(f"insert into public.pravidla_texty (klic, data, zmeneno) values ('povolani', $mmpov${j}$mmpov$::jsonb, now())"
              " on conflict (klic) do update set data = excluded.data, zmeneno = now();")
    else:
        print(j)
    print(f"{len(P)} povolání: " + ", ".join(p["en"] for p in P), file=sys.stderr)
