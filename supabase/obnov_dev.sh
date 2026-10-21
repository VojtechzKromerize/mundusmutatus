#!/usr/bin/env bash
# Obnoví vývojovou databázi z ostré: herní data (karty, odhalení, texty, ukázky, boj, nastavení hry) se zkopírují
# z ostré do vývojové; ostrá se jen čte. Spouští ji workflow „Databáze“ (akce „obnovit dev z ostré“).
#   ZDROJ=<připojení k ostré>  CIL=<připojení k vývojové>  bash supabase/obnov_dev.sh
# Nekopíruje: přihlášení hráčů (účty jsou v každém projektu jiné – na dev se hráči přihlásí znovu), hesla ke kartám,
# odběry upozornění a adresu služby upozornění (dev nesmí posílat upozornění skutečným hráčům), hody, zprávy, výzvy, historii.
# Vypravěč: kdo je vypravěčem na ostré, bude jím i na dev, pokud na dev existuje účet se stejným e-mailem.
set -euo pipefail
: "${ZDROJ:?chybí ZDROJ (připojení k ostré databázi)}" "${CIL:?chybí CIL (připojení k vývojové databázi)}"
[ "$ZDROJ" = "$CIL" ] && { echo "ZDROJ a CIL jsou stejné – končím"; exit 1; }
TAB="zaznamy karty karty_texty stavy ukazky boj nastaveni"
q(){ psql "$1" -v ON_ERROR_STOP=1 -X -q -A -t -c "$2"; }

echo "== vyprázdnit vývojovou databázi (jen kopírované tabulky)"
q "$CIL" "truncate $(for t in $TAB; do printf 'public.%s,' "$t"; done | sed 's/,$//')"
for t in $TAB; do
  # jen sloupce, které mají obě databáze (vývojová může mít novější schéma)
  cols=$(q "$CIL" "select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns where table_schema = 'public' and table_name = '$t'")
  zcols=$(q "$ZDROJ" "select string_agg(column_name, ',') from information_schema.columns where table_schema = 'public' and table_name = '$t'")
  spol=$(python3 -c 'import sys; z=set(sys.argv[2].split(",")); print(",".join(c for c in sys.argv[1].split(",") if c in z))' "$cols" "$zcols")
  kde=""; [ "$t" = nastaveni ] && kde="where klic not in ('push', 'discord')"
  psql "$ZDROJ" -X -q -v ON_ERROR_STOP=1 -c "\\copy (select $spol from public.$t $kde) to stdout" \
    | psql "$CIL" -X -q -v ON_ERROR_STOP=1 -c "\\copy public.$t ($spol) from stdin"
  echo "  $t: $(q "$CIL" "select count(*) from public.$t") řádků"
done
echo "== karty na dev volné (účty hráčů se nekopírují)"
q "$CIL" "update public.karty set zamceno = false, hrac = null"
echo "== vypravěč podle e-mailu"
for e in $(q "$ZDROJ" "select lower(u.email) from public.gm g join auth.users u on u.id = g.user_id"); do
  r=$(q "$CIL" "with x as (insert into public.gm (user_id) select id from auth.users where lower(email) = '$e' on conflict do nothing returning 1) select count(*) from x")
  ok=$(q "$CIL" "select count(*) from public.gm g join auth.users u on u.id = g.user_id where lower(u.email) = '$e'")
  if [ "$ok" = "1" ]; then echo "  vypravěč: ${e%%@*}@… (na dev nastaven)"; else echo "  vypravěč: ${e%%@*}@… na dev nemá účet – založ ho v Supabase (Authentication → Users → Add user) a spusť obnovení znovu"; fi
done
echo "Hotovo. Hráčský snímek a obsah se na dev přepočítají při příštím nasazení větve dev."
