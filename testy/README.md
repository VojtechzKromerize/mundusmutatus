# Testy webu

`bash testy/spustit.sh` udělá kompletní kontrolu v dočasné kopii repozitáře (zdroj ani `public/` nemění):

1. **Sestavení** hráčské a vypravěčské verze; build sám hlídá, že do hráčské verze neproteklo žádné tajemství,
   a test ještě ověří, že v ní nezůstala žádná značka tajemství. Pak **kontrola kódu** (`kontrola_kodu.mjs`, ~8 s):
   ESLint nad skriptem složeným jako v prohlížeči – zdvojená jména, neznámá jména (překlepy), zdvojené klíče, čárka
   jako operátor, nedosažitelný kód – a pravidlo, že jádro (01–09, 26) při načtení nevolá líně stahované díly 10–25.
   Chyby ukazuje v původním souboru a řádku. Potřebuje `npm ci` (balíčky z `package.json`; bez nich se přeskočí).
   Hned potom **rychlé testy výpočtů** (`jednotky/*.test.mjs`, `npm test`, ~20 s): vypravěčská verze se načte do jsdom
   (jednou na soubor, ~5 s) a testy volají funkce přímo, a **kontrola formátu** (Prettier; `npm run format` opraví).
   Co rychlé testy pokrývají:
   - `web.test.mjs` – modifikátory a bonus zdatnosti, útok (`bojUtokPriprav`: 1 a 20, výhoda, kritický rozsah, ruční kostky,
     vyčerpání, Vpřed!), kostky zranění, vlastnosti zbraní a zbroje z katalogu vybavení, přidání věci do vybavení, kouzla
     se zraněním a léčením (`kSpUcinek`: Fireball, Magic Missile, Eldritch Blast, Cure Wounds), zápis útoku vypravěče za hráče,
     Bless / Bane / Bardic Inspiration k hodům, stavy a hody proti smrti postavy s kartou v boji.
   - `pravidla.test.mjs` – pravidla postavy D&D 2024 (bonus zdatnosti, maximum HP, sloty i při více povoláních a pakt, AC ze
     zbroje a Unarmored Defense, nošená zbroj, záchrany s Aura of Protection, Jack of All Trades, rychlost, počty použití,
     rysy mimo SRD, zbraň podle názvu), Výdrž podle Artikulí, stavy SRD (nevýhody, automatický neúspěch, rychlost 0,
     návrh výhody v boji), vyčerpání, Artikule zbroje v boji (druh z popisu AC, Resistance zbroje, Drtivá a Průrazná,
     Immunity a Vulnerability, obětování a vyčerpaná zbroj), Půlmeč, kritická zranění (závažnost, místo na těle, druh),
     podtřídy hráčů (Emboldening Bond, Otherworldly Glamour, Warrior of the Gods, Portent z dlouhého odpočinku, Expert Divination,
     přídavky Dreadful Strikes a Divine Fury, manévry k ověřením).
   - **čistá pravidla** (`ucinky.test.mjs`, `tah.test.mjs`, `reakce.test.mjs`) – soubory zdroj/web/js s `@čisté` na 1. řádku
     (10r okno reakce, 10t účet tahu, 10u účinky) se načtou zavaděčem `ciste.mjs` do prázdného kontextu Node bez stránky (milisekundy):
     sčítání účinků (různé ano, stejnojmenné ne), AC/HP/rychlost/záchrany z účinků, kostky k hodům a jednou za tah, akce v tahu,
     kdo smí reagovat a co reakce vrátí. Nové výpočty piš do čistého souboru a testuj tady.
   - `zlate.test.mjs` – **zlaté snímky karet**: spočítaná karta Balduina a vzorových postav podtříd družiny
     (`testy/zlate/karty/*.json`; AC, HP, záchrany, dovednosti, odolnosti, kouzla, sloty, zdroje, útoky, přídavky, Výdrž, i se stavy)
     se porovná se snímkem v `testy/zlate/snimky/`. Záměrná změna výpočtu: `MM_ZLATE=obnov node --test testy/jednotky/zlate.test.mjs`,
     zkontrolovat `git diff testy/zlate/snimky` a commitnout s důvodem. Další karta = další soubor v `testy/zlate/karty/`.
   - `inventura_kouzel.mjs` (není test; `node testy/jednotky/inventura_kouzel.mjs [--vse]`) – TSV: co web umí s každým kouzlem
     (zranění/léčení z textu, útok/záchrana, stav, tabulky UCINKY/KZOPAK/KZOBL/KZLEC/KZSUM); bez `--vse` jen kouzla bez automatiky.
   - `kouzla.test.mjs` – účinky dalších kouzel z dat SRD (Guiding Bolt, Scorching Ray, triky podle úrovně, záchrany
     s polovinou, Hex, Mass Healing Word), posílení na kartě (Shield, Haste, Mage Armor, Barkskin, Aid, Stoneskin),
     posílení od jiné postavy (Warding Bond, Shield of Faith, Bless), trvání účinku v kolech boje, opakovaná kouzla bez slotu
     (Spiritual Weapon, Call Lightning), oblasti (Spirit Guardians, Moonbeam, Grease, Web, Cloud of Daggers), rituály, trvání z textu.
   - `cas.test.mjs` – juliánský kalendář (přestupné roky, Velikonoce 1458, svátky), věk osob k hernímu datu, posun herního času,
     kostka Závoje (výsledky, bez záchran, svátky podle vyznání, Hodina Závoje a Hodina Pravdy, dopočet v záznamu boje),
     okno putování podle ročního období.
   - `generator.test.mjs` – tajemství vypravěče a zmínky podle odhalení (`zdroj/generator.js`, bez jsdom).
   Kostky se nastaví `S.kostky([[číslo, stěn], …])`, konstanty skriptu se čtou výrazem `V("výraz")`; nové pravidlo dostane test
   do souboru podle oblasti.
2. **Prohlídka statické verze** (`prochazka.py`): otevře všechny stránky odkaz po odkazu a hlásí chyby JavaScriptu,
   rozbité obrázky, prázdné stránky a přetečení do stran.
3. **Databáze** (když je k dispozici PostgreSQL a PostgREST): založí čistou testovací databázi ze `supabase/schema.sql`,
   místo Supabase spustí `supabase_mock.py` a sestaví verzi napojenou na databázi. Pak:
   - `bezpecnost.py` – anonym ani hráč nečtou obsah vypravěče a nic nemění; vypravěč nemá služební práva,
   - `prohlizec_*.py` – odhalování (Skryté / Slyšeli / Potkali), herní stav a Novinky, draci, tracker iniciativy,
     upozornění na tah, pečeť, editor textů a obrázků, zápisy Kroniky,
   - prohlídka všech stránek jako hráč i jako přihlášený vypravěč.

Na GitHubu běží automaticky při každém nahrání (`.github/workflows/kontrola.yml`), výsledek je u commitu (✓ / ✗).
Běh má **rychlou kontrolu** (sestavení, tajemství, kontrola kódu, schéma, práva; ~1 min, novější nahrání ji neruší)
a **šest souběžných částí v prohlížeči** (karta · boj a tah · boj a reakce · potvrzování, karta – ostatní, editor ·
statické stránky a bestiář · prohlídka hráče a vypravěče), každou na 2–3 min; celý běh trvá kolem 4 minut. Při chybě úloha
„Od posledního zeleného stavu“ vypíše poslední úspěšný commit a seznam změn od něj. Délky jednotlivých testů jsou
ve výpisu („✓ prohlížeč: boj (107 s)“) – podle nich se části vyvažují v matrixu `kontrola.yml`.
Testovací záznamy, které se přidají jen do testovací kopie, jsou v `testy/data/` (např. koncept Kroniky).

Co testy zdržuje a jak se tomu vyhnout (2026-10-22): prohlídka stránek (`prochazka.py`) prochází frontu odkazů
v šesti záložkách najednou (`MM_ZALOZEK`) a na každé stránce počká na líný díl a na text, ne pevných 250 ms.
Testy boje místo čekání na další tik pulsu (2,5–6 s) volají `puls(stránka, od=odesílatel)` z `testy/_puls.py`:
počká, až odesílatel dopíše do databáze, a příjemce se pulsem zeptá hned. Testy karty (`karta`, `karta_vse`) místo
`wait_for_timeout(N)` volají `klid(stránka, N)` z `testy/_klid.py`: vrátí se, jakmile stránka nic nedělá (žádný fetch,
krátký časovač, rozpracované uložení karty či boje), nejdéle po N ms – test nikdy není pomalejší než s pevným čekáním
(karta 185 → 105 s). `MM_KLID=1` vypíše, co stránku drží v práci, když se čeká až do N. Před přechodem na jinou stránku
(`goto`) a u věcí, které se mají stát „po čase“, zůstává pevné čekání nebo `wait_for_function` na podmínku.
V nových testech používej `puls`, `klid` a `wait_for_function` místo `wait_for_timeout` s vteřinami.

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
