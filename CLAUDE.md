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
zdroj/koruna.html    kostra stránky (~53 kB): hlavička, HTML pohledů, zavaděč dat, řádky /*@vloz web/…*/
zdroj/web/styly.css  všechny styly (~2 800 řádků)
zdroj/web/js/NN-*.js hlavní skript po oddílech (viz níže); dohromady jeden skript ve sdíleném
                     prostoru – pořadí podle čísla, funkce a konstanty jsou vidět ze všech souborů
zdroj/build.py       sestaví public/ (hráč) nebo vypravec/ (--vypravec, NEPUBLIKOVAT); --staticky bez databáze;
                     hráčské soubory v/ zmenší esbuildem (jména na nejvyšší úrovni zůstanou; MM_BEZ_ZMENSENI=1 vypne);
                     řádky /*@vloz …*/ nahradí obsahem souborů; vypravěčský soubor je jeden, hráčská verze
                     má skript v dílech v/*.js a samostatných částech v/cast-*.js (viz níže)
zdroj/rozdel.py      --spoj spojí vše zpět do jednoho koruna.html; bez přepínače rozdělí jeden soubor znovu
zdroj/generator.js   z textů obsahu vyrobí data webu; běží v buildu (Node) i v prohlížeči vypravěče
zdroj/obsah/         rody, osoby, vazby, Praha, místa, Kronika, Družina, Draconomicon, protivníci,
                     přívlastky, setkání, karty – ZÁLOHA databáze (viz níže)
zdroj/pravidla/      český překlad SRD 5.2.1 (NN-srd.md) → art/pravidla.json (sestav.py, volá ho build)
zdroj/srd/           nestvůry a předměty SRD → art/netvori.json, predmety.json, pojmy.json (sestav.py)
zdroj/kouzla/        kouzla SRD (5e-bits, src/2024) + preklad.json + mimo-srd.json + katalog.json → art/kouzla.json (sestav.py, ručně);
                     katalog.json = Vojtův katalog kouzel (Word → katalog.py), dává texty všem kouzlům; automatika.json říká,
                     která kouzla čtou pro automatiku dřívější text (ta/va), aby se nezměnilo chování karty a Boje
zdroj/mimo-srd/      podtřídy, featy, zázemí, Aasimar z D&D 2024 mimo SRD – vlastní shrnutí mechaniky
                     → art/mimo-srd.json (sestav.py, ručně; kontroluje formát a délky textů)
zdroj/vybaveni/      Vojtův Přehled vybavení (Word → katalog.py → katalog.json) + Artikule (vlastnosti zbraní ARTZV, druhy zbroje ARTZB)
                     a vazba magických předmětů na SRD → art/vybaveni.json (sestav.py, ručně); stránka #pravidla/vybaveni (14d),
                     věci z katalogu jdou přidat do vybavení karty (`kVybPridej`), v inventáři se najdou podle jména (`vybNajdi`)
zdroj/sw.js          service worker (offline)    zdroj/zaloha.py  záloha textů z databáze do souborů
supabase/schema.sql  celá databáze; idempotentní, spouští se celá znovu
testy/               spustit.sh, prochazka.py, bezpecnost.py, prohlizec_*.py, supabase_mock.py
art/                 obrázky + velká data (*.json se načítají líně, až když je stránka potřebuje)
podklady/            skripty na geodata map
```

Pořadí sestavení dat: `zdroj/pravidla/sestav.py` → `zdroj/srd/sestav.py` (potřebuje art/pravidla.json).
Do repozitáře nepatří `public/`, `vypravec/` ani snímky obrazovky (`.gitignore`).

## Zdroj webu – orientace

Celý web (včetně tajemství vypravěče) je `koruna.html` + `zdroj/web/`. Build soubory spojí; v prohlížeči
je to jeden skript, takže na pořadí souborů záleží jen u kódu, který běží hned při načtení (konstanty
použité v jiném souboru musí být definované v souboru s nižším číslem nebo až uvnitř funkcí).
Nový kód dej do souboru, kam věcně patří; nový velký celek může dostat vlastní soubor – přidej ho
do kostry řádkem `/*@vloz web/js/NN-nazev.js*/` na správné místo (a do seznamu `JS` v `rozdel.py`).

Kód je formátovaný Prettierem (od 2026-10-21; `.prettierrc.json`, řádek do 150 znaků): **po úpravě skriptu spusť
`npm run format`** – rychlá kontrola CI neformátovaný soubor odmítne. Piš běžné víceřádkové funkce, ne jednořádkové
zhuštěniny (ty dřív dělaly konflikty mezi relacemi). Hledej grepem (`grep -n … zdroj/web/js/*.js`), soubory jsou delší
(~48 000 řádků), čti výřezy. Úpravy dělej Editem s jednoznačným úryvkem; nikdy nepřepisuj soubor z výstupu nástroje.
Značky dat pro build (`/*@FAM@*/ []`, `/*@GM@*/ false` …) smí mít mezeru – build ji snese.

**Vazby mezi soubory hlídá kontrola kódu jako u modulů** (od 2026-10-21; skutečné moduly prohlížeče ne – rozbily by
testy, které sahají na globální jména, a 53 vědomých sdílení): zapisovat do proměnné jiného souboru smí jen jména v `SDILENE`,
přepsat (obalit) funkci jiného souboru jen jména v `OBALENE` (`testy/kontrola_kodu.mjs`); nepoužitá definice je chyba
(smaž mrtvý kód); const/let se při načtení nesmí číst dřív, než jsou definované. **Orientace místo grepu:**
`node testy/kontrola_kodu.mjs --kde bojUtokPriprav` (kde je definované, které soubory ho čtou a zapisují) a
`--soubor 14d` (co soubor poskytuje ostatním a co odkud používá).

Soubory skriptu: 01 základ (data z buildu, erby) · 02 mapa · 03 Artikule · 04 Praha · 05 Známý svět ·
06 Draconomicon a rodokmeny · 07 Družina, Kronika, kalendář, odkazy, hledání · 08 navigace (`route()`),
Pravidla · 09 vypravěč: odhalování, panel, herní čas · 10 Kouzla · 11 Boj: tracker, ikony, bestiář ·
12 Boj: tah, postavy v boji · 13 Karty: import PDF, stav, stránka · 14 karta: vybavení, bojová karta · 14c Boj: zásahy do karty, reakce na telefonu, výzvy · 14d katalog vybavení (stránka, popis věci, Artikule) ·
15 karta podle Artikulí · 16 SRD předměty, ukázky, příprava sezení, kořist, stránka Hra · 17 Karta II ·
17b kouzla: posílení na cílech (KZEF), trvání v kolech, rituál, opakování bez slotu (KZOPAK), oblasti (KZOBL), Counterspell ·
18 Pravidla postavy (D&D 2024) · 19 karta jako D&D Beyond · 20 Boj: hráč na telefonu (formulář útoku BJU, hod, odeslání) ·
20b Boj: vypravěč (vyhodnocení a potvrzení útoků hráčů, veřejný záznam, pruh „co teď“, formuláře, klávesy, Zpět) · 20c volby po zásahu, přesun Hexu, Riposte ·
20d Boj: vykreslení (kostra, záložky, renderBoj) ·
21 editor textů · 22 Výprava (počasí, Zpět herního času) · 23 potvrzování akcí hráčů · 24 Boj: herní záznam (kdo · co · komu, kostky, Závoj) ·
25 puls (jeden dotaz „co se změnilo“, Realtime) · 26 start: pečeť a první `route()`.

**Samostatné části (načtou se až na své stránce):** 02b kresba mapy, 04b plán Prahy, 05b mapa světa, 21 editor, 22b stránka Výprava –
obsah mezi `/*@cast název{*/ … /*@cast}*/` build vyřízne do `v/cast-…js`. Kód mimo část na její funkce sahá jen přes `route()`
(`MMLINY_V` v 01, `mmLina()`), přes `typeof … === "function"` nebo přes zástupnou funkci (`drawMap` → `drawMapK`). Vypravěč dostane
všechny části hned po startu. Zbytek skriptu build dělí na díly s otiskem podle čísel souborů, takže po nasazení se stáhne jen díl,
který se změnil: **jádro** (zaklad 01–08, stav 09, start 26) se stáhne hned a stránka se ukáže; boj 10–12, karta 13–19 a hra 20–25
tvoří líně načítanou část `hra` (stránky pravidla, karty, boj, hra, sezení, kouzla, gm ji čekají; 26-start ji jinak stáhne na pozadí,
až je stránka načtená). Jádro proto nesmí při načtení ani při vykreslení svých stránek (úvod, mapy, desky, Družina, Kronika,
Artikule, Draconomicon) volat funkce ze souborů 10–25; co se musí ukázat hned (např. návod pro první návštěvu), patří do jádra. Hráč se na změny ptá jen pulsem (`mm_puls`) – nový
pravidelný dotaz nepřidávej, přidej druh do pulsu (trigger `mm_puls_tg` v schématu, obsluha v `pulsZpracuj`).
Oddíly uvnitř mají hlavičky `/* ===== název ===== */`; přehled: `grep -n -E '^/\* ?[=-]{3,}' zdroj/web/js/*.js`.
Hlavní orientační body:

- `route()` – hashový router; seznam stránek `VIEWS`, popisky `NAVNAME`. Stránky: uvod, hra, svet, mapa,
  praha, desky (#rod/…, #osoba/…), druzina, artikule, draconomicon, kronika, pravidla, karty, boj,
  vyprava, kouzla, sezeni, gm. `kouzla` a `sezeni` jen pro vypravěče.
- **Hráčská Hra = karta a boj na jedné stránce** (od 2026-10-22, plán `vyvoj/hra-prestavba.md` v projektu): hráč na `#hra` je uvnitř
  na stránce Boj (`curView === "boj"`, `#bojview`, `renderBoj`); mimo boj vykreslí `hraHracHtml()` (16) jen kartu, nebo přihlášení
  a volbu postavy. `#boj` hráče přesměruje na `#hra`; „je otevřená Hra?“ = `mmNaHre()` (08). Výzvy k hodu ukazuje lišta `#mmvyz`.
  Tajné zprávy a ukázky = list ✉ „Od vypravěče“ na vlastní kartě, pokladna = list Peníze, telefon a odhlášení = list Postava,
  úkoly družiny = Kronika. Vypravěč má zatím Hru (`#hraview`, `renderHra`) a Boj zvlášť (sloučení do pultu: krok 6 plánu).
- **Tichá příprava boje** (`s.ticha`): příprava založená otevřením Boje vypravěčem hráči nevidí; uvidí ji po „Hráči hodí
  iniciativu“, „Ukázat hráčům“ (`data-bukaz`) nebo „Začít boj“.
- Každá stránka má `render<Stránka>()` (renderBoj, renderKarty, renderVyprava, renderPravidla…). Po změně dat volej
  **`bojPrekresli()` / `kartyPrekresli()`** – víc změn v jedné obsluze se překreslí jednou (`mmPozdeji` v 01);
  `renderBoj()` přímo jen tam, kde hned potom sáhneš na nově vykreslený prvek (fokus, posun).
- Boj: tracker slotové iniciativy, bestiář (jen vypravěč), automatizace tahu, postavy v boji, průvodce tahem.
  Rozvržení: pruh iniciativy nahoře, pod ním tři sloupce – karta (hráč: jeho; vypravěč: vybraný účastník, sám přepne na toho,
  kdo je na tahu – `bojVybranaKarta`, vždy jen jedna rozbalená), účastníci, herní záznam; na mobilu záložky (`BTAB`).
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

- **Dvě databáze (od 2026-10-21):** ostrá „Mundus Mutatus“ (`rzbflnwxpyepjcpndqyj`, web `main`) a vývojová
  „Mundus Mutatus dev“ (`cjgyhzgirzhgiwjxuqvj`, náhled `dev` a ostatní větve – `netlify.toml` kontexty branch-deploy/deploy-preview).
  Na vývojové smíš zkoušet cokoli (i přes konektor Supabase); **ostrou jen číst** – změny schématu do ostré jen na Vojtův pokyn.
- Workflow **Databáze**: změna `schema.sql` v `dev` se sama nahraje do vývojové; „[obnovit dev]“ ve zprávě commitu (nebo ručně
  „obnovit vývojovou z ostré“) zkopíruje z ostré karty, odhalení, texty, ukázky, boj a nastavení hry (`supabase/obnov_dev.sh`;
  bez účtů hráčů, hesel a upozornění); „schéma do ostré“ ručně s potvrzením NASADIT (schema.sql z `main`) – při „nasaď“, když se
  schéma změnilo. Tajemství `SUPABASE_DB_DEV` / `SUPABASE_DB_MAIN` (Session pooler). Ruční spuštění funguje, až je workflow v `main`.
- Texty obsahu jsou v ostré databázi (tabulka `zaznamy`, vypravěč je upravuje na **ostrém** webu). `zdroj/obsah/` je záloha:
  změna souboru v `dev` se přenese do ostré databáze workflow **Texty do ostré databáze** (`build.py --jen-zaznamy`)
  a při sestavení náhledu i do vývojové, **pokud záznam mezitím nikdo neupravil na webu** (jinak KONFLIKT, vyhraje web).
  Hráči změnu uvidí po příštím nasazení `main`. Před úpravou souborů obsahu spusť zálohu:
  `gh workflow run "Záloha textů z webu"`, počkej a stáhni `dev`.
- Supabase novým tabulkám nedává práva: veřejně čitelná tabulka potřebuje v schématu `grant select … to anon, authenticated`
  (testovací `priprava.sql` práva také nedává). Edge funkce (`supabase/functions/`: mm-push, mm-discord) nemají práva
  k tabulkám – čtou a zapisují jen přes funkce `mm_*` povolené pro `service_role`.
- Boj ukládá vypravěč s kontrolou verze (`mm_boj_uloz_v`), aby nepřepsal zápisy hráčů z telefonu. Tabulku `boj` čte přímo jen
  vypravěč; hráči přes `mm_boj_cti` (GET, kešuje ho service worker), která vyřízne účastníky `skryt` („hráči zatím nevidí“)
  i jejich řádky záznamu. Hráč mění jen svou postavu přes `mm_boj_hrac` (pole `spol` = jeho společník v boji) a útočí přes `mm_boj_utok`.
- **Stavy a hody proti smrti postavy s kartou jsou jen na kartě** (`kartaStav(id).stavy` / `.ds`, od 2026-10-22). Stav boje v prohlížeči
  nese jen jejich obraz (`h.stav`, `h.ds`, značka `h._k`): `bojZmen` a `bojHracAkce` ho na začátku načtou z karty (`bojPcNaplnit`),
  rozdíl zapíšou na kartu (`bojPcOdvod`) a do databáze boje se neukládá (`bojPcBez`); kód tedy dál čte a píše `h.stav` / `h.ds`.
  Kryt (`h.kryt`) zůstává v boji. Postava bez karty má stavy v boji jako dřív. Seznam povolených stavů je jeden: `mm_stavy_pc_ok`.
- Hráči se přihlašují přes Supabase Auth – Discordem nebo účtem s heslem (Úvod / Hra, `MMDB.ucetZaloz` / `ucetPrihlas`, 08):
  přezdívka se převede na umělou adresu `….hrac@mundusmutatus.netlify.app`, e-mail se nepotvrzuje (v Supabase musí být vypnuté
  „Confirm email“). Obojí končí stejnou relací `mm-hrac-relace` a vazbou `hraci_ucty` (`mm_ja`, `mm_ja_karta`); starší heslo
  přímo ke kartě (`mm_hrac_heslo`, `relace_hracu`) zůstává jako záloha.
- Funkce mají předponu `mm_`. Nová tabulka = RLS + případ v `testy/bezpecnost.py` (anonym ani hráč nečtou
  obsah vypravěče a nic nemění; vypravěč nemá služební práva).
- Bezplatný Supabase usíná; denní „Budíček databáze“ drží vzhůru obě databáze.

## Testy v tomto prostředí

- K dispozici je Python, Node a Playwright. Nejdřív `npm ci` (esbuild, ESLint, Prettier, jsdom; web sám balíčky
  nepotřebuje). **Po každé úpravě skriptu `npm run format && npm run kontrola`** (~10 s): formát, zdvojená a neznámá jména,
  čárka jako operátor, jádro volající líné díly – chyby ukáže v souboru a řádku.
- **Rychlé testy výpočtů: `npm test`** (~6 s, `testy/jednotky/*.test.mjs`): skript stránky v jsdom (bez prohlížeče), volá
  funkce přímo – pravidla postavy, útok (`bojUtokPriprav`), Artikule, kouzla (`kSpUcinek`), katalog vybavení, zápis útoku
  vypravěče, generátor (tajemství, zmínky). Kostky: `S.kostky([[číslo, stěn], …])`; `const` skriptu se čtou přes `V("výraz")`.
  Nová pravidla a výpočty testuj tady (rychlé, spolehlivé); `prohlizec_*.py` jen na tok obrazovek. Bez databáze: `MM_BEZ_DB=1 bash testy/spustit.sh`
  (sestavení, kontrola tajemství, prohlídka statické verze, bestiář).
- S databází: nejdřív `eval "$(bash testy/priprav-prostredi.sh)"` (spustí PostgreSQL, stáhne PostgREST přes curl –
  `gh release download` tu nefunguje), pak rychle jen dotčené testy: `MM_TESTY="boj karta" bash testy/spustit.sh`
  (sestavení, schéma, práva a vybrané `prohlizec_*.py`, bez prohlídek všech stránek; pár minut).
  Jednotlivé `prohlizec_*.py` potřebují proměnné ze `spustit.sh`, pouštěj je přes něj.
- Logy GitHub Actions se odsud stáhnout nedají (`--log-failed` selže). Chyby jsou v anotacích:
  `gh run view <id>` → ANNOTATIONS (řádky FAIL a konec chyby Pythonu; při chybě i poslední zelený commit a změny od něj).
  CI má rychlou kontrolu (~3 min, neruší se) a čtyři souběžné části v prohlížeči (`MM_TESTY` + `MM_PROHLIDKY` v matrixu).
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
  SRD, ale **bez textu**: obsah mimo SRD (`zdroj/mimo-srd/`, kouzla a magické předměty s `x: 1`) má jen vlastní stručná shrnutí
  (rys/feat max. 350 znaků, kouzlo 1 000 – Vojtovo rozhodnutí 2026-10-20) a na webu upozornění, že nejde o oficiální text.
- Na kartě se rys mimo SRD pozná podle názvu z PDF (`mimoNajdi`); počty použití, kostky a trvalé bonusy (`ef`)
  počítá `kMimoZdroje` / `kMimoEf`. Rysy, které pravidla už počítají jménem (Tough, Speedy, Lucky…), jsou v `MIMOSKIP`.
- Nesmí se: texty z PHB/DMG/MM 2024 mimo SRD, vytěžování D&D Beyond, jiná zmínka o Wizards of the Coast
  než povinné uvedení zdroje SRD (smí se „5E compatible“).
