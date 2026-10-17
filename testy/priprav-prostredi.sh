#!/usr/bin/env bash
# Připraví prostředí pro databázové testy na stroji, kde je PostgreSQL 16 nainstalovaný, ale neběží
# (cloudové prostředí Clauda, čistý Linux). Spustí PostgreSQL, nastaví heslo uživatele postgres,
# stáhne PostgREST v12.2.3 (stejný jako CI) a vypíše proměnné pro testy.
#
# Použití:   eval "$(bash testy/priprav-prostredi.sh)"
#            MM_TESTY="boj karta" bash testy/spustit.sh      # rychle jen vybrané testy
#            bash testy/spustit.sh                            # celá kontrola
set -euo pipefail
PGR="${POSTGREST:-/tmp/postgrest}"
log(){ echo "$*" >&2; }

if ! pg_isready -q -h localhost 2>/dev/null; then
  if command -v pg_ctlcluster >/dev/null; then
    log "Spouštím PostgreSQL…"; (service postgresql start || pg_ctlcluster 16 main start) >/dev/null 2>&1 || true
  fi
  for i in $(seq 1 30); do pg_isready -q -h localhost && break; sleep 0.5; done
fi
pg_isready -q -h localhost || { log "PostgreSQL neběží a nepodařilo se ho spustit."; exit 1; }
if [ "$(id -u)" = 0 ] && id postgres >/dev/null 2>&1; then
  su postgres -c "psql -q -c \"alter user postgres password 'postgres'\"" >/dev/null
fi

if [ ! -x "$PGR" ]; then
  log "Stahuji PostgREST v12.2.3…"
  T="$(mktemp -d)"
  curl -sSL https://github.com/PostgREST/postgrest/releases/download/v12.2.3/postgrest-v12.2.3-linux-static-x64.tar.xz -o "$T/p.tar.xz"
  tar -xJf "$T/p.tar.xz" -C "$T" && mv "$T/postgrest" "$PGR" && rm -rf "$T"
fi
"$PGR" --version >/dev/null 2>&1 || { log "PostgREST v $PGR nejde spustit."; exit 1; }

python3 -c "import playwright" 2>/dev/null || log "Pozor: chybí Python balík playwright (pip install playwright pillow)."
log "Prostředí je připravené."
echo "export PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres POSTGREST=$PGR"
