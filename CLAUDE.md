# Mundus Mutatus – pracovní poznámky pro Clauda

Web tažení „Sub utraque sunt dracones“ (D&D 2024, Čechy 1458 po Protržení Závoje). Je to především
**nástroj vypravěče** (Vojta) pro vedení hry; hráčská část je druhotná. Hraje se u stolu s fyzickými
figurkami, hráči mají web na telefonech. Obecný popis pro lidi je v `README.md`, úpravy obsahu
v `zdroj/obsah/NÁVOD.md`, testy v `testy/README.md`. Tady je jen to, co ušetří průzkum.

## Jak pracovat

- **Větve:** změny nahrávej rovnou do `dev` bez ptaní (dá se vrátit). Do `main` jen když Vojta řekne „nasaď“.
  Náhled `dev`: https://dev--mundusmutatus.netlify.app, ostrý web: https://mundusmutatus.netlify.app.
- **Souběh:** na repozitáři často pracuje víc relací naráz a hodinová záloha z webu commituje do `dev`.
  Před pushem vždy `git fetch origin dev` a rebase; nepřepisuj cizí commity.
- **Testy:** úplnou kontrolu (hráč i vypravěč) spouštěj, jen když o ni Vojta požádá – zdržuje.
  CI ji stejně spustí při každém pushi: `gh run list -L 5`, chyby `gh run view <id> --log-failed`.
- **Commity česky**, popisují, co se změnilo pro uživatele webu.
- **Zdroj pravdy je kód.** Dokumenty v projektu claude.ai (`vyvoj/*.md`, audity, zadání) mohou zaostávat
  za `dev` – než něco označíš za chybějící, ověř to v kódu.

## Struktura

```
zdroj/koruna.html    celý web v jednom souboru (~1,4 MB, ~10 500 řádků) včetně tajemství vypravěče
zdroj/build.py       sestaví public/ (hráč) nebo vypravec/ (--vypravec, NEPUBLIKOVAT); --staticky bez databáze;
                     řádky /*@vloz web/…*/ v koruna.html nahradí obsahem souborů ze zdroj/web/
zdroj/rozdel.py      rozdělí koruna.html na kostru + zdroj/web/styly.css a zdroj/web/js/NN-*.js (ověří, že
                     sestavení dá bajt po bajtu stejný výsledek); --spoj vrátí jeden soubor, --zkus jen ověří
zdroj/generator.js   z textů obsahu vyrobí data webu; běží v buildu (Node) i v prohlížeči vypravěče
zdroj/obsah/         rody, osoby, vazby, Praha, místa, Kronika, Družina, Draconomicon, protivníci,
                     přívlastky, setkání, karty – ZÁLOHA databáze (viz níže)
zdroj/pravidla/      český překlad SRD 5.2.1 (NN-srd.md) → art/pravidla.json (sestav.py, volá ho build)
zdroj/srd/           nestvůry a předměty SRD → art/netvori.json, predmety.json, pojmy.json (sestav.py)
zdroj/kouzla/        kouzla SRD (5e-bits, src/2024) + preklad.json + mimo-srd.json → art/kouzla.json (sestav.py, ručně)
zdroj/mimo-srd/      podtřídy, featy, zázemí, Aasimar z D&D 2024 mimo SRD – vlastní shrnutí mechaniky
                     → art/mimo-srd.json (sestav.py, ručně; kontroluje formát a délky textů)
zdroj/sw.js          service worker (offline)    zdroj/zaloha.py  záloha textů z databáze do souborů
supabase/schema.sql  celá databáze; idempotentní, spouští se celá znovu
testy/               spustit.sh, prochazka.py, bezpecnost.py, prohlizec_*.py, supabase_mock.py
art/                 obrázky + velká data (*.json se načítají líně, až když je stránka potřebuje)
podklady/            skripty na geodata map
```

Pořadí sestavení dat: `zdroj/pravidla/sestav.py` → `zdroj/srd/sestav.py` (potřebuje art/pravidla.json).
Do repozitáře nepatří `public/`, `vypravec/` ani snímky obrazovky (`.gitignore`).

## zdroj/koruna.html – orientace

Soubor je velký a řádky jsou dlouhé: **nečti ho celý**. Hledej grepem a čti výřezy (`sed -n A,Bp | cut -c1-300`).
Úpravy dělej Editem s jednoznačným úryvkem; nikdy nepřepisuj soubor z výstupu nástroje (může být oříznutý).

Rozvržení (orientačně, čísla řádků se posouvají): styly ~23–2555 · HTML pohledů ~2556–2850 ·
zavaděč dat ~2851–3003 · hlavní skript `<script id="mmhlavni">` ~3004–konec.

Oddíly mají hlavičky `/* ===== název ===== */` nebo `/* ---------- název ---------- */`; přehled:
`grep -n -E '^/\* ?[=-]{3,}' zdroj/koruna.html`. Hlavní orientační body:

- `route()` – hashový router; seznam stránek `VIEWS`, popisky `NAVNAME`. Stránky: uvod, hra, svet, mapa,
  praha, desky (#rod/…, #osoba/…), druzina, artikule, draconomicon, kronika, pravidla, karty, boj,
  vyprava, kouzla, sezeni, gm. `kouzla` a `sezeni` jen pro vypravěče.
- Každá stránka má `render<Stránka>()` (renderBoj, renderKarty, renderVyprava, renderPravidla…).
- Boj: tracker slotové iniciativy, bestiář (jen vypravěč), automatizace tahu, postavy v boji, průvodce tahem.
- Karty postav: import PDF z D&D Beyond, stav karty, hody se Závojem; „Pravidla postavy“ počítají kartu
  podle D&D 2024 (PDF je jen výchozí podklad, rozdíly jsou viditelné úpravy „z D&D Beyond“).
- Výprava: cesty podle Uncharted Journeys na mapách Svět → Koruna → Praha, počasí, setkání (jen vypravěč).
- Databáze z prohlížeče: `rpc("mm_…", {p_…})` a objekt `MMDB` (gm, nastavHru, discordLogin…).

## Tajemství vypravěče

- V textu `⟦tajné⟧` nebo `⟦tajné¦text pro hráče⟧`; v kódu `const GMV=/*@GM@*/false` (build přepne pro vypravěče).
  Kód jen pro vypravěče větvi podle `GMV` / přihlášení vypravěče.
- Build hlídá, že do hráčské verze nic neproteklo; test to ověřuje znovu. Hráč nesmí dostat ani seznamy
  (bestiář, setkání) – z databáze přijde prázdné.
- Hráčská data nesou brány `{"$g": id, "$u": 1|2}`; databáze (`mm_orez`) vyřízne, co družina nezná
  (0 skryté, 1 slyšeli, 2 potkali). Odhalení platí pro celou družinu, ne pro jednotlivé hráče.

## Databáze (Supabase)

- Jeden projekt pro `main` i `dev` (data rozlišuje sloupec `vetev`) → **jakákoli změna schématu míří na ostrá
  data.** `supabase/schema.sql` spouští Vojta v SQL Editoru; i když je k dispozici konektor Supabase,
  před spuštěním migrace se ho zeptej.
- Texty obsahu jsou v databázi (tabulka `zaznamy`, vypravěč je upravuje na webu). `zdroj/obsah/` je záloha:
  změna souboru v `dev` se při buildu přenese do databáze, **pokud záznam mezitím nikdo neupravil na webu**
  (jinak build vypíše KONFLIKT a vyhraje web). Před úpravou souborů obsahu spusť zálohu:
  `gh workflow run "Záloha textů z webu"`, počkej a stáhni `dev`.
- Funkce mají předponu `mm_`. Nová tabulka = RLS + případ v `testy/bezpecnost.py` (anonym ani hráč nečtou
  obsah vypravěče a nic nemění; vypravěč nemá služební práva).
- Bezplatný Supabase usíná; denní „Budíček databáze“ ho drží vzhůru.

## Testy v tomto prostředí

- K dispozici je Python, Node a Playwright. Bez databáze: `MM_BEZ_DB=1 bash testy/spustit.sh`
  (sestavení, kontrola tajemství, prohlídka statické verze, bestiář).
- S databází: nejdřív `eval "$(bash testy/priprav-prostredi.sh)"` (spustí PostgreSQL, stáhne PostgREST přes curl –
  `gh release download` tu nefunguje), pak rychle jen dotčené testy: `MM_TESTY="boj karta" bash testy/spustit.sh`
  (sestavení, schéma, práva a vybrané `prohlizec_*.py`, bez prohlídek všech stránek; pár minut).
  Jednotlivé `prohlizec_*.py` potřebují proměnné ze `spustit.sh`, pouštěj je přes něj.
- Logy GitHub Actions se odsud stáhnout nedají (`--log-failed` selže). Chyby jsou v anotacích:
  `gh run view <id>` → ANNOTATIONS (řádky FAIL a konec chyby Pythonu).
- Nové chování doplň do příslušného `prohlizec_*.py`. Vzhled kontroluj jako vypravěč i hráč, desktop i mobil,
  světlý i tmavý režim.

## Konvence

- **Jazyk:** celé rozhraní česky; pojmy a názvy kategorií pro hráče česky, hráči neumí latinu.
  Lore a Kronika jsou psané jako kronika Vojtěcha z Kroměříže – čeština evokující 15. století, ale čtivá.
- **Terminologie pravidel** (jako v art/pravidla.json): dovednosti, typy zranění, Resistance / Vulnerability /
  Immunity, názvy kouzel a magických předmětů **anglicky**; stavy česky s anglickým názvem v závorce
  („Sražen (Prone)“); vlastnosti STR/AGI/CON/INT/WIS/CHA; v datech protivníků `AGI DC 15`.
- **Domácí pravidla (Artikule) mají přednost před SRD.** V Pravidlech jsou jako rámečky „Artikule“.
  Aktuální text Artikulí je v projektu claude.ai (`pravidla/artikule-*.md`, nejnovější datum).
- **Vzhled:** středověká kronika / iluminovaný kodex (vínová kůže, zlaté linky, iluminační modř).
  Mobil je hlavní zařízení hráčů. Pro hráče má srozumitelnost přednost před historickou přesností.
- **Nebudou:** bojová mapa (hraje se s figurkami) a tvorba postavy (postavy se nahrávají z PDF D&D Beyond).
- Herní čas: tažení začíná 3. 3. 1458 (Jiří zvolen králem), juliánský kalendář; věk osob se počítá k hernímu datu.

## Licence (hlídej vždy)

- Smí se: SRD 5.2.1 (CC-BY-4.0) s uvedením zdroje – na úvodní stránce Pravidel a pod každou kapitolou;
  vlastní obsah; data z PDF, která nahraje hráč. Herní mechaniku (čísla, kostky, záchrany) lze převzít i mimo
  SRD, ale **bez textu**: obsah mimo SRD (`zdroj/mimo-srd/`, kouzla s `x: 1`) má jen vlastní stručná shrnutí
  (rys/feat max. 350 znaků, kouzlo 450) a na webu upozornění, že nejde o oficiální text.
- Na kartě se rys mimo SRD pozná podle názvu z PDF (`mimoNajdi`); počty použití, kostky a trvalé bonusy (`ef`)
  počítá `kMimoZdroje` / `kMimoEf`. Rysy, které pravidla už počítají jménem (Tough, Speedy, Lucky…), jsou v `MIMOSKIP`.
- Nesmí se: texty z PHB/DMG/MM 2024 mimo SRD, vytěžování D&D Beyond, jiná zmínka o Wizards of the Coast
  než povinné uvedení zdroje SRD (smí se „5E compatible“).
