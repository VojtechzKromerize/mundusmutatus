#!/usr/bin/env bash
# Kompletní kontrola webu. Spouští ji GitHub Actions (.github/workflows/testy.yml) při každém nahrání;
# jde spustit i ručně:  bash testy/spustit.sh
#
# 1. sestaví hráčskou (statickou) a vypravěčskou verzi – build sám hlídá, že žádné tajemství ⟦…⟧ neproteklo
# 2. projde všechny stránky statické verze v prohlížeči
# 3. (když je k dispozici PostgreSQL a PostgREST) rozjede testovací náhradu Supabase, sestaví verzi
#    napojenou na databázi a vyzkouší práva v databázi, odhalování, herní stav, tracker, editor, zápisy, pečeť
#    a projde web jako hráč i jako přihlášený vypravěč
#
# Vše běží v dočasné kopii repozitáře, zdroj ani public/ se nemění.
# Proměnné: MM_PSQL (příkaz psql, výchozí "psql"), PGHOST/PGUSER/PGPASSWORD, POSTGREST (cesta k programu),
#           MM_BEZ_DB=1 přeskočí část s databází, MM_PORT (první z volných portů, výchozí 18700).
set -uo pipefail
KOREN="$(cd "$(dirname "$0")/.." && pwd)"
PRAC="$(mktemp -d)"; WEB="$PRAC/web"; VYSTUP="${MM_VYSTUP:-$PRAC/vystup}"; mkdir -p "$VYSTUP"
P0="${MM_PORT:-18700}"; P_WEB=$P0; P_SB=$((P0+1)); P_PGRST=$((P0+2))
PSQL="${MM_PSQL:-psql}"; DBN="mm_testy"; POSTGREST="${POSTGREST:-postgrest}"
PIDS=(); CHYBY=()
uklid(){ for p in "${PIDS[@]:-}"; do [ -n "$p" ] && kill "$p" 2>/dev/null; done; rm -rf "$PRAC"; }
trap uklid EXIT
krok(){ echo; echo "=== $*"; }
SHRN="${GITHUB_STEP_SUMMARY:-/dev/null}"; echo "### Kontrola webu" >> "$SHRN"
zkus(){ local jm="$1"; shift; if "$@"; then echo "✓ $jm"; echo "- ✓ $jm" >> "$SHRN"; else echo "✗ $jm"; echo "- ✗ **$jm**" >> "$SHRN"; CHYBY+=("$jm"); fi; }
cekej(){ for i in $(seq 1 60); do curl -s -o /dev/null "$1" && return 0; sleep 0.5; done; echo "nenaběhlo: $1"; return 1; }
server(){ (cd "$1" && exec python3 -m http.server "$2" --bind 127.0.0.1 >/dev/null 2>&1) & PIDS+=($!); cekej "http://127.0.0.1:$2/"; }

krok "Kopie repozitáře"
mkdir -p "$WEB"
tar -C "$KOREN" --exclude=.git --exclude=public --exclude=vypravec --exclude=__pycache__ -cf - . | tar -C "$WEB" -xf -
cp -r "$KOREN/testy/data/." "$WEB/zdroj/obsah/"   # testovací záznamy (např. koncept Kroniky)

krok "Sestavení"
zkus "hráčská verze (statická) bez tajemství" python3 "$WEB/zdroj/build.py" --staticky
zkus "vypravěčská verze" python3 "$WEB/zdroj/build.py" --vypravec
zkus "service worker je platný JavaScript" node --check "$WEB/public/sw.js"
zkus "žádná značka tajemství v hráčské verzi" python3 -c "
import pathlib,sys
z=[str(p) for p in pathlib.Path(sys.argv[1]).rglob('*') if p.suffix in ('.html','.js','.css','.json') and any(chr(c) in p.read_text(errors='ignore') for c in (0x27e6,0x27e7))]
print(chr(10).join(z));sys.exit(1 if z or not (pathlib.Path(sys.argv[1])/'index.html').exists() else 0)" "$WEB/public"

krok "Prohlídka statické verze"
server "$WEB/public" $P_WEB && zkus "statická verze: všechny stránky bez chyb" python3 "$KOREN/testy/prochazka.py" "http://127.0.0.1:$P_WEB/"
server "$WEB/vypravec" $((P_WEB+4)) && MM_GMWEB="http://127.0.0.1:$((P_WEB+4))/" MM_HRWEB="http://127.0.0.1:$P_WEB/" MM_KOREN="$WEB" MM_VYSTUP="$VYSTUP" \
  zkus "bestiář v Boji (vypravěč bez databáze)" python3 "$KOREN/testy/prohlizec_bestiar.py"

if [ "${MM_BEZ_DB:-}" = "1" ] || ! command -v "${PSQL%% *}" >/dev/null || ! command -v "$POSTGREST" >/dev/null; then
  echo; echo "(databázová část přeskočena – chybí psql nebo postgrest, případně MM_BEZ_DB=1)"
  echo "- (databázová část přeskočena)" >> "$SHRN"
else
  krok "Testovací databáze"
  $PSQL -q -d postgres -c "drop database if exists $DBN" -c "create database $DBN" >/dev/null
  $PSQL -q -v ON_ERROR_STOP=1 -d $DBN < "$KOREN/testy/priprava.sql" >/dev/null && \
  $PSQL -q -v ON_ERROR_STOP=1 -d $DBN < "$KOREN/supabase/schema.sql" >/dev/null && \
  $PSQL -q -d $DBN -c "insert into public.gm values ('11111111-1111-1111-1111-111111111111')" >/dev/null
  zkus "schéma databáze se nahraje" test $? -eq 0
  cat > "$PRAC/pgrst.conf" <<KONF
db-uri = "postgres://authenticator:auth@${PGHOST:-localhost}:${PGPORT:-5432}/$DBN"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "testovaci-tajemstvi-pro-jwt-0123456789abcdef"
server-port = $P_PGRST
KONF
  "$POSTGREST" "$PRAC/pgrst.conf" > "$PRAC/pgrst.log" 2>&1 & PIDS+=($!)
  MM_PGRST="http://127.0.0.1:$P_PGRST" MM_SB_PORT=$P_SB python3 "$KOREN/testy/supabase_mock.py" & PIDS+=($!)
  cekej "http://127.0.0.1:$P_PGRST/" && cekej "http://127.0.0.1:$P_SB/"

  krok "Sestavení napojené na databázi"
  export MM_SB="http://127.0.0.1:$P_SB" MM_WEB="http://127.0.0.1:$((P_WEB+3))/" MM_VYSTUP="$VYSTUP" MM_VYPIS="$PRAC/vypis" MM_DB=$DBN MM_PSQL="$PSQL"
  SUPABASE_URL="$MM_SB" SUPABASE_KEY=sb_publishable_test SUPABASE_SECRET=sb_secret_test MM_VETEV=test MM_SYNC_VETVE=test \
    zkus "sestavení s databází (nahrání obsahu)" python3 "$WEB/zdroj/build.py" --vypis "$MM_VYPIS"
  server "$WEB/public" $((P_WEB+3))

  krok "Práva v databázi"
  zkus "práva v databázi" python3 "$KOREN/testy/bezpecnost.py"

  krok "Testy v prohlížeči"
  for t in odhalovani herni_stav draci boj tah pecet editor zapisy vyprava; do
    zkus "prohlížeč: $t" python3 "$KOREN/testy/prohlizec_$t.py"
  done

  krok "Prohlídka jako hráč a jako vypravěč"
  zkus "hráč: všechny stránky bez chyb" python3 "$KOREN/testy/prochazka.py" "$MM_WEB"
  python3 - "$PRAC/relace.json" <<PY
import json,sys,urllib.request
r=urllib.request.Request("$MM_SB/auth/v1/token?grant_type=password",data=json.dumps({"email":"gm@x.cz","password":"heslo"}).encode(),headers={"apikey":"sb_publishable_test","Content-Type":"application/json"},method="POST")
j=json.loads(urllib.request.urlopen(r).read());json.dump({"at":j["access_token"],"rt":j["refresh_token"],"exp":j["expires_at"],"email":"gm@x.cz"},open(sys.argv[1],"w"))
PY
  RELACE="$PRAC/relace.json" zkus "vypravěč: všechny stránky bez chyb" python3 "$KOREN/testy/prochazka.py" "$MM_WEB"
fi

echo
if [ ${#CHYBY[@]} -eq 0 ]; then echo "VŠECHNY KONTROLY PROŠLY"; exit 0; fi
echo "NEPROŠLO (${#CHYBY[@]}):"; printf ' - %s\n' "${CHYBY[@]}"
[ -n "${MM_VYSTUP:-}" ] && echo "snímky obrazovky: $MM_VYSTUP"
exit 1
