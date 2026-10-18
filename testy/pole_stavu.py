# Kontrola: každé pole stavu karty, které web zapisuje (kartaStavZmen, KDB.stav, MMDB.kartaStav), musí databáze
# přijmout (mm_karta_stav v supabase/schema.sql). Jinak se změna na ostrém webu tiše vrátí („neplatná hodnota“).
import re, glob, os, sys
K = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = "".join(open(f, encoding="utf-8").read() for f in sorted(glob.glob(os.path.join(K, "zdroj/web/js/*.js"))))
pole = set()
for m in re.finditer(r'kartaStavZmen\([^,]+,\{([^}]*)\}', src):
    pole |= set(re.findall(r'(?:^|,)\s*([A-Za-z_]\w*)\s*:', m.group(1)))
pole |= set(re.findall(r'\bch\.([A-Za-z_]\w*)\s*=', src))
pole |= set(re.findall(r'(?:KDB\.stav|MMDB\.kartaStav)\([^,]+,"(\w+)"', src))
sch = open(os.path.join(K, "supabase/schema.sql"), encoding="utf-8").read()
a = sch.index("create or replace function public.mm_karta_stav("); b = sch.index("else false end;", a)
povolena = set(re.findall(r"when '(\w+)' then", sch[a:b]))
chybi = sorted(pole - povolena)
print("pole stavu karty:", len(pole), "· databáze nepřijme:", chybi or "nic")
sys.exit(1 if chybi else 0)
