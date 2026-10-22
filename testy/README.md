# Testy webu

`bash testy/spustit.sh` udělá kompletní kontrolu v dočasné kopii repozitáře (zdroj ani `public/` nemění):

1. **Sestavení** hráčské a vypravěčské verze; build sám hlídá, že do hráčské verze neproteklo žádné tajemství,
   a test ještě ověří, že v ní nezůstala žádná značka tajemství. Pak **kontrola kódu** (`kontrola_kodu.mjs`, ~8 s):
   ESLint nad skriptem složeným jako v prohlížeči – zdvojená jména, neznámá jména (překlepy), zdvojené klíče, čárka
   jako operátor, nedosažitelný kód – a pravidlo, že jádro (01–09, 26) při načtení nevolá líně stahované díly 10–25.
   Chyby ukazuje v původním souboru a řádku. Potřebuje `npm ci` (balíčky z `package.json`; bez nich se přeskočí).
   Hned potom **rychlé testy výpočtů** (`jednotky/*.test.mjs`, `npm test`, ~6 s): vypravěčská verze se načte do jsdom
   a testy volají funkce přímo (pravidla postavy, útok, Artikule, kouzla, vybavení, zápis útoku vypravěče, generátor),
   a **kontrola formátu** (Prettier; `npm run format` opraví).
2. **Prohlídka statické verze** (`prochazka.py`): otevře všechny stránky odkaz po odkazu a hlásí chyby JavaScriptu,
   rozbité obrázky, prázdné stránky a přetečení do stran.
3. **Databáze** (když je k dispozici PostgreSQL a PostgREST): založí čistou testovací databázi ze `supabase/schema.sql`,
   místo Supabase spustí `supabase_mock.py` a sestaví verzi napojenou na databázi. Pak:
   - `bezpecnost.py` – anonym ani hráč nečtou obsah vypravěče a nic nemění; vypravěč nemá služební práva,
   - `prohlizec_*.py` – odhalování (Skryté / Slyšeli / Potkali), herní stav a Novinky, draci, tracker iniciativy,
     upozornění na tah, pečeť, editor textů a obrázků, zápisy Kroniky,
   - prohlídka všech stránek jako hráč i jako přihlášený vypravěč.

Na GitHubu běží automaticky při každém nahrání (`.github/workflows/kontrola.yml`), výsledek je u commitu (✓ / ✗).
Běh má **rychlou kontrolu** (sestavení, tajemství, kontrola kódu, schéma, práva; ~3 min, novější nahrání ji neruší)
a **čtyři souběžné části v prohlížeči** (stránky a bestiář · boj · karta · ostatní a prohlídka). Při chybě úloha
„Od posledního zeleného stavu“ vypíše poslední úspěšný commit a seznam změn od něj. Délky jednotlivých testů jsou
ve výpisu („✓ prohlížeč: boj (107 s)“) – podle nich se části vyvažují v matrixu `kontrola.yml`.
Testovací záznamy, které se přidají jen do testovací kopie, jsou v `testy/data/` (např. koncept Kroniky).

Ručně, např. na vlastním počítači s PostgreSQL:

    pip install playwright pillow && python -m playwright install chromium
    POSTGREST=/cesta/k/postgrest bash testy/spustit.sh        # celé
    MM_BEZ_DB=1 bash testy/spustit.sh                         # jen sestavení a statická verze
    MM_TESTY="boj karta" bash testy/spustit.sh                # rychle: sestavení, databáze, práva a jen tyto prohlizec_*.py
    MM_RYCHLA=1 bash testy/spustit.sh                         # bez prohlížeče: sestavení, kontrola kódu, schéma, práva
    MM_TESTY="" MM_PROHLIDKY="staticka" bash testy/spustit.sh  # jen prohlídka statické verze a bestiář (db = prohlídka s databází)
    node testy/kontrola_kodu.mjs                              # jen kontrola kódu (po npm ci)

Prostředí bez běžící databáze (např. cloudové prostředí Clauda): `eval "$(bash testy/priprav-prostredi.sh)"`
spustí PostgreSQL, nastaví heslo, stáhne PostgREST do `/tmp/postgrest` a nastaví proměnné.

Když kontrola na GitHubu selže, každý řádek `FAIL …` a konec chyby Pythonu se zapíše jako anotace běhu:
`gh run view <id>` je ukáže v oddílu ANNOTATIONS (a v souhrnu běhu) bez stahování logů.

Proměnné: `MM_PSQL` (příkaz psql, např. `sudo -u postgres psql`), `PGHOST`/`PGUSER`/`PGPASSWORD`,
`MM_VYSTUP` (kam uložit snímky obrazovky), `MM_PORT` (první z volných portů, výchozí 18700),
`MM_DBN` (jméno testovací databáze, výchozí mm_testy – pro dva běhy naráz na jednom počítači).
