#!/usr/bin/env python3
"""Záloha textů z webu do souborů v zdroj/obsah (spouští ji GitHub Actions, viz .github/workflows/zaloha-z-webu.yml).

  python3 zdroj/zaloha.py --vystup /tmp/zaloha.json    zapíše texty upravené na webu do souborů
  python3 zdroj/zaloha.py --potvrdit /tmp/zaloha.json  po uložení do gitu potvrdí databázi, že je záloha hotová

Potřebuje proměnné SUPABASE_URL a SUPABASE_SECRET. Jen standardní knihovna Pythonu.
"""
import json, os, re, sys, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OBSAH = os.path.join(ROOT, "zdroj", "obsah")
URL = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
KEY = next((os.environ[n].strip() for n in ("SUPABASE_SECRET", "SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY") if os.environ.get(n, "").strip()), "")
POVOLENE = re.compile(r"^(rody|osoby|kronika|druzina|mista|praha|protivnici|draconomicon/kapitoly|draconomicon/plemena)/[0-9A-Za-z_.-]+\.md$|^(vazby\.md|rodokmeny\.json)$")

def fail(msg):
    sys.exit("CHYBA: " + msg)

def rpc(fn, body):
    hdr = {"apikey": KEY, "Content-Type": "application/json"}
    if KEY.startswith("eyJ"):
        hdr["Authorization"] = "Bearer " + KEY
    req = urllib.request.Request(f"{URL}/rest/v1/rpc/{fn}", data=json.dumps(body, ensure_ascii=False).encode("utf-8"), headers=hdr, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read() or b"null")
    except urllib.error.HTTPError as e:
        fail(f"Supabase {fn}: HTTP {e.code} {e.read().decode('utf-8', 'replace')[:400]}")

if not URL or not KEY:
    fail("chybí SUPABASE_URL nebo SUPABASE_SECRET")
if "--potvrdit" in sys.argv:
    seznam = json.load(open(sys.argv[sys.argv.index("--potvrdit") + 1], encoding="utf-8"))
    n = rpc("mm_zaloha_hotovo", {"p_soubory": seznam}) if seznam else 0
    print(f"potvrzeno {n} z {len(seznam)} záznamů")
    sys.exit(0)

vystup = sys.argv[sys.argv.index("--vystup") + 1] if "--vystup" in sys.argv else os.path.join(ROOT, "zaloha.json")
zmeny = rpc("mm_zaloha_seznam", {}) or []
hotovo = []
for z in zmeny:
    soubor = z["soubor"]
    if not POVOLENE.match(soubor) or ".." in soubor:
        print(f"přeskakuji podezřelý název souboru: {soubor}")
        continue
    cesta = os.path.join(OBSAH, *soubor.split("/"))
    if z["smazano"]:
        if os.path.exists(cesta):
            os.remove(cesta)
        print(f"smazáno: {soubor}")
    else:
        os.makedirs(os.path.dirname(cesta), exist_ok=True)
        with open(cesta, "w", encoding="utf-8", newline="\n") as f:
            f.write(z["md"])
        print(f"uloženo: {soubor}")
    hotovo.append({"soubor": soubor, "hash": z["hash"]})
json.dump(hotovo, open(vystup, "w", encoding="utf-8"), ensure_ascii=False)
print(f"záloha: {len(hotovo)} změn z webu")
