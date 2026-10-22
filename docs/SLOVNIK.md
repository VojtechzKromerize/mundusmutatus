# Slovník zkratek a globálních konstant

Generuje `npm run mapa` – **neupravuj ručně**. Významy ručně psané jsou v `docs/slovnik.json` (jméno → význam; doplň, když něco
rozluštíš); ostatní popisy bere skript z komentáře u definice (ⓐ) nebo z jejího začátku (ⓘ). Jen jména VELKÝMI písmeny;
funkce a běžné proměnné najdeš `node testy/kontrola_kodu.mjs --kde JMÉNO` nebo grepem.

| jméno | kde | druh | význam |
|---|---|---|---|
| `AIMG` | 03-artikule:2 | const | ⓘ `"art/";` |
| `AK` | 03-artikule:884 | const | ⓘ `Object.fromEntries(ARTK.map(k => [k.id, k]));` |
| `AL` | 07-druzina-kronika:1008 | const | ⓘ `(() => {` |
| `AL_SKIP` | 07-druzina-kronika:1099 | const | ⓘ `".tnm,.trl,a,button,h1,h2,h3,h4,.crumbs,dt,label,.faith,.svm,.noal,inp…` |
| `ARMS` | 01-zaklad:108 | const | ⓘ `{};` |
| `ARTB` | 03-artikule:213 | const | ⓘ `[` |
| `ARTK` | 03-artikule:219 | const | ⓘ `[` |
| `BAB` | 12-boj-tah-postavy:2 | const | ⓘ `["STR", "AGI", "CON", "INT", "WIS", "CHA"];` |
| `BACRE` | 11-boj:597 | const | ⓘ `/(\d+\s*)\(([^()]{2,60})\)/g;` |
| `BADV` | 11-boj:1247 | const | ⓘ `{},` |
| `BAKCE` | 12-boj-tah-postavy:1183 | const | ⓐ akce v boji (SRD 5.2.1, česky zkráceně) a doplnění z Artikulí |
| `BBARVY` | 11-boj:494 | const | ⓐ medailony: družina kruhové (portrét z karty postavy), NPC čtvercové v barvě skupiny (portrét osoby, jinak monogram) |
| `BCIL` | 11-boj:1246 | const | ⓘ `{},` |
| `BCIM` | 12-boj-tah-postavy:761 | const | ⓘ `{};` |
| `BCIMZ` | 12-boj-tah-postavy:763 | const | ⓘ `[` |
| `BDM` | 14-karty-bojova-karta:1325 | const | ⓘ `{sec: {}, sheet: null, hlo: new Set(), af: {}, kf: {}, fokus: null, ut…` |
| `BDMAF` | 14-karty-bojova-karta:1474 | const | ⓘ `[` |
| `BDMG` | 12-boj-tah-postavy:130 | const | ⓘ `{};` |
| `BDMI` | 14-karty-bojova-karta:1289 | const | ⓘ `{` |
| `BDMS` | 14-karty-bojova-karta:1315 | const | ⓐ oddíly (2026-10-22): Info i Duše jsou pryč – smysly a zdatnosti ve Statistikách, duše, rány a účinky v listu Svědomí; Záznam = hody hráče |
| `BDMSW` | 14-karty-bojova-karta:2094 | const | ⓐ přejetí prstem: po těle karty další / předchozí záložka, po hlavě listu dolů zavře list |
| `BDMVLZ` | 14-karty-bojova-karta:1626 | const | ⓐ vlastnost v bojové kartě (2026-10-17): zkratka \| skóre \| nahoře modifikátor (ověření), dole záchrana – úsporný řádek |
| `BDMZV` | 14-karty-bojova-karta:1411 | const | ⓐ vlastnosti zbraní podle Artikulí (Zbraně) – podle druhu zbraně v názvu útoku |
| `BDOS` | 11-boj:833 | const | ⓘ `{},` |
| `BDRIC` | 11-boj:532 | const | ⓘ `{houf: "houf", pacholek: "pacholek", sok: "sok", zhoubce: "zhoubce"};` |
| `BDRUH` | 11-boj:781 | const | ⓘ `{houf: "Houf pacholků", pacholek: "Pacholek", sok: "Sok", zhoubce: "Zh…` |
| `BDRUZ` | 20d-boj-render:277 | const | ⓘ `'<div class="bstrana bsh"><div data-bk="hr"></div><div data-bk="cile">…` |
| `BDRUZ_G` | 20d-boj-render:280 | const | ⓘ `BDRUZ.replace('<div data-bk="cile"></div>', "").replace(/<\/div>$/, '<…` |
| `BFR` | 11-boj:2457 | const | ⓘ `{` |
| `BGLP` | 20d-boj-render:286 | let | ⓐ záznam se u hráče i vypravěče obnovuje: hody z karet (i hody hráčů z telefonu) každé 4 s, dokud je Boj otevřený |
| `BGMU` | 14-karty-bojova-karta:329 | const | ⓘ `{};` |
| `BHIST` | 11-boj:1186 | const | ⓘ `[],` |
| `BHLED` | 11-boj:2052 | let | ⓘ `"";` |
| `BHP0` | 20b-boj-vypravec:974 | let | ⓘ `null;` |
| `BHPT` | 14-karty-bojova-karta:333 | const | ⓘ `{};` |
| `BHROTV` | 11-boj:2651 | const | ⓘ `new Set();` |
| `BHSEEN` | 11-boj:1187 | const | ⓘ `{},` |
| `BIC` | 11-boj:9 | const | ⓘ `{` |
| `BICW` | 11-boj:169 | const | ⓘ `{};` |
| `BIMG` | 11-boj:99 | const | ⓐ malované ikony (art/img/boj, 48/96 px) – ostatní klíče zůstávají vektorové s ručně kresleným chvěním (filtr #bwob) |
| `BINIV` | 14c-boj-reakce:400 | let | ⓘ `new Set();` |
| `BJENBOJ` | 12-boj-tah-postavy:1868 | const | ⓐ stavy, které platí jen v boji: s koncem boje z karty zmizí (i stavy z účinků boje) |
| `BJK` | 20-boj-hraci:766 | const | ⓘ `{d: ""};` |
| `BJR` | 11-boj:1248 | const | ⓘ `{};` |
| `BJSPN` | 20-boj-hraci:267 | let | ⓘ `0;` |
| `BJU` | 20-boj-hraci:4 | const | ⓐ hráč: formulář útoku (stav formuláře přežije překreslení) |
| `BJUK` | 20-boj-hraci:31 | const | ⓘ `"mm-bju";` |
| `BKART` | 11-boj:2014 | const | ⓘ `{};` |
| `BKARTK` | 11-boj:2015 | let | ⓘ `"";` |
| `BKBT` | 20b-boj-vypravec:1034 | let | ⓘ `0;` |
| `BKBUF` | 20b-boj-vypravec:1033 | let | ⓘ `"",` |
| `BKDO` | 12-boj-tah-postavy:762 | let | ⓘ `"";` |
| `BKON` | 11-boj:2649 | let | ⓘ `false,` |
| `BKONC` | 12-boj-tah-postavy:757 | const | ⓐ Concentration: zranění soustředěné bytosti vyžaduje CON záchranu, DC 10 nebo polovina zranění (nejvýš 30) |
| `BKONV` | 14c-boj-reakce:67 | const | ⓐ soustředění postavy po zásahu (2026-10-18): hráči vyskočí výzva k CON záchraně, hodí si ji sám; neúspěch ukončí soustředění |
| `BKONZ` | 11-boj:2949 | const | ⓘ `new Set();` |
| `BKORK` | 16-srd-ukazky-sezeni-hrac:632 | const | ⓘ `{};` |
| `BKORX` | 12-boj-tah-postavy:1328 | const | ⓘ `new Set();` |
| `BKOSTRA` | 20d-boj-render:281 | const | ⓘ `'<div class="bojakt bojgm"><div data-bk="hor"></div><div data-bk="ja">…` |
| `BKOSTRA_H` | 20d-boj-render:296 | const | ⓘ `'<div class="bojakt bojhrac"><div data-bk="hor"></div><div data-bk="he…` |
| `BKPAD` | 12-boj-tah-postavy:758 | const | ⓘ `{},` |
| `BKRIT` | 11-boj:2286 | const | ⓘ `{` |
| `BKRLOG` | 12-boj-tah-postavy:1380 | const | ⓐ návrh zápisu do Kroniky z průběhu boje (skryté cíle vynechá) |
| `BKS` | 11-boj:2370 | const | ⓘ `{druh: "fyz", rany: 0, pod: 0, vys: "", kdo: ""};` |
| `BKZ` | 11-boj:2279 | const | ⓘ `["Lehká", "Těžká", "Vážná", "Smrtelná"],` |
| `BKZAB` | 12-boj-tah-postavy:944 | const | ⓘ `{` |
| `BKZT` | 11-boj:2280 | const | ⓘ `[` |
| `BKZW` | 12-boj-tah-postavy:938 | let | ⓘ `0;` |
| `BLF` | 20b-boj-vypravec:661 | let | ⓐ filtr záznamu a Zpět ze záznamu |
| `BLIM` | 11-boj:780 | const | ⓘ `{houf: 1, pacholek: 1, sok: 2, zhoubce: 3},` |
| `BLOG` | 11-boj:834 | const | ⓐ rozbalené části, počet v dosahu houfu, záznam hodů – přežijí překreslení |
| `BLOGG` | 11-boj:1167 | const | ⓐ záznam hodů: u karty poslední hod jako plaketa, celý průběh v záznamu boje pod družinou |
| `BMAN` | 17-karty-ii:1001 | const | ⓐ manévry, které se přidávají k zásahu: [název, česky, záchrana cíle, následek při neúspěchu] |
| `BMCIS` | 11-boj:1414 | const | ⓘ `{jeden: 1, jednu: 1, jednou: 1, dva: 2, dvě: 2, dvakrát: 2, tři: 3, tř…` |
| `BMQ` | 11-boj:1413 | const | ⓘ `{};` |
| `BMSTOP` | 11-boj:499 | const | ⓘ `/^(a\|i\|v\|ve\|z\|ze\|s\|se\|o\|od\|do\|na\|pod\|pro\|u\|k\|ke\|za\|z\|von\|de\|of\|der\|die…` |
| `BNEPR` | 20d-boj-render:276 | const | ⓘ `'<div class="bstrana bsn"><div data-bk="obt"></div><div data-bkl="npc"…` |
| `BNEPR_G` | 20d-boj-render:279 | const | ⓐ vypravěč (2026-10-21): cíle boje nahoře u plošného zásahu, přidávání nepřátel až pod družinou (po zahájení boje se používá málo) |
| `BNESCH` | 11-boj:1286 | const | ⓐ stavy, které berou akce (2026-10-19): Incapacitated a vše, co ho obsahuje – žádná akce, bonusová akce ani reakce |
| `BNP` | 11-boj:2017 | const | ⓐ karta nepřítele: otevřený panel (ac = obrana, hp = životy, st = stavy) |
| `BNUT` | 11-boj:1409 | const | ⓘ `{};` |
| `BODP` | 11-boj:2650 | let | ⓘ `false;` |
| `BODV` | 20e-boj-vlastnosti:252 | let | ⓘ `null;` |
| `BOJ` | 11-boj:2452 | const | ⓘ `{s: null, v: -1, poll: null};` |
| `BOPV` | 12-boj-tah-postavy:268 | const | ⓐ postava: na konci tahu opakovaná záchrana stavu (výzva na telefon; bez karty připomínka), na začátku tahu odpočet kol |
| `BOSUD` | 12-boj-tah-postavy:1250 | const | ⓐ shrnutí po boji: padlí, zajatí a jejich osud, výkupné, kořist, XP a návrh zápisu do Kroniky |
| `BOSUDP` | 12-boj-tah-postavy:1258 | const | ⓘ `{` |
| `BOTV` | 11-boj:832 | const | ⓘ `new Set(),` |
| `BPCZ` | 12-boj-tah-postavy:1776 | const | ⓘ `new Set();` |
| `BPLOS` | 12-boj-tah-postavy:131 | let | ⓘ `null;` |
| `BPLV` | 14c-boj-reakce:399 | const | ⓐ plošný zásah a iniciativa výzvou: odpovědi hráčů zpracuje vypravěčovo zařízení samo |
| `BPRAV` | 12-boj-tah-postavy:1218 | let | ⓐ rychlá pravidla v šuplíku: kritická zranění, vlastnosti zbraní, zbroj |
| `BPROS` | 11-boj:1252 | const | ⓐ prostředí boje: [ikona, název, místo pro zápis, popis] – tma, mlha, vítr a úzký průchod mění návrh výhody a přesilu houfu |
| `BPROT` | 17b-kouzla-ucinky:613 | const | ⓘ `{};` |
| `BPT` | 16-srd-ukazky-sezeni-hrac:1715 | const | ⓘ `{k: null};` |
| `BRC` | 20d-boj-render:271 | const | ⓐ kostra aktivního boje: bloky se klíčem, překreslí se jen ty, jejichž obsah se změnil |
| `BRCH` | 12-boj-tah-postavy:128 | const | ⓘ `{},` |
| `BRIP` | 14c-boj-reakce:218 | let | ⓐ Riposte (Battle Master): nepřítel tě minul útokem na blízko → nabídka odvety; viděná minutí si telefon pamatuje (2026-10-20) |
| `BRT` | 11-boj:3162 | const | ⓘ `{ok: false, ws: null, zkus: 0};` |
| `BRUC` | 14-karty-bojova-karta:691 | const | ⓐ hráč: „Zadat ručně“ – kostky hozené u stolu (d20, d6 Závoje, kostky zranění); prázdné pole hodí web |
| `BSEL` | 20b-boj-vypravec:1032 | let | ⓐ klávesy v Boji (vypravěč): mezerník další tah, Shift+mezerník zpět o slot, číslice + Enter zranění vybraného nepřítele, Ctrl+Z zpět |
| `BSIKALT` | 14-karty-bojova-karta:718 | const | ⓘ `{Slashing: "Piercing", Piercing: "Slashing", Bludgeoning: "Piercing"};` |
| `BSK` | 11-boj:687 | const | ⓐ uložené skupiny nepřátel (jen v prohlížeči vypravěče) a hotová setkání z databáze |
| `BSNAPC` | 11-boj:1183 | let | ⓘ `null;` |
| `BSTAV` | 11-boj:267 | const | ⓐ stavy nepřátel: ikonka a popisek |
| `BSTAVD` | 11-boj:552 | const | ⓘ `{` |
| `BSTAVH` | 11-boj:294 | const | ⓐ stavy postav, které si hráč nastaví z telefonu (nebo vypravěč v seznamu družiny) – počítá s nimi návrh výhody |
| `BSTC` | 11-boj:1997 | const | ⓐ statblock s vysvětlivkami se počítá až při prvním otevření a pamatuje se |
| `BSTHP` | 12-boj-tah-postavy:1481 | const | ⓘ `{` |
| `BSTI` | 11-boj:314 | const | ⓘ `{` |
| `BTAB` | 20d-boj-render:301 | let | ⓐ záložky na mobilu: Karta / Účastníci / Záznam (na širší obrazovce jsou sloupce vedle sebe a záložky schované) |
| `BTABH` | 14-karty-bojova-karta:332 | const | ⓘ `{},` |
| `BTEC` | 11-boj:534 | const | ⓐ vlastnosti zbraní a zbrojí, techniky, chvaty a stavy: vysvětlení při najetí myší (Artikule › Výzbroj, Šerm a zápas) |
| `BTIP` | 11-boj:570 | const | ⓘ `Object.assign(` |
| `BTIPRE` | 11-boj:576 | const | ⓘ `new RegExp(` |
| `BTMSG` | 12-boj-tah-postavy:129 | const | ⓘ `{},` |
| `BTT` | 11-boj:627 | const | ⓐ plovoucí popisek: myš, dotyk (na chvíli) i klávesnice |
| `BUEF` | 20b-boj-vypravec:99 | const | ⓘ `"Účinek: ",` |
| `BUNDO` | 11-boj:2873 | const | ⓐ zpět: poslední změny boje (stav i životy), nejvýš 40 kroků |
| `BUTT` | 11-boj:1245 | const | ⓐ zbraň s více typy zranění (Šikovná, „Slashing nebo Piercing“) a Půlmeč: volba se pamatuje u útoku |
| `BUTYP` | 14-karty-bojova-karta:689 | const | ⓐ před hodem na útok (2026-10-17): cíl, výhoda/nevýhoda a u zbraní s vlastností Šikovná typ zranění |
| `BUTZP` | 20b-boj-vypravec:257 | const | ⓘ `new Set();` |
| `BUVC` | 20b-boj-vypravec:148 | const | ⓘ `new Map();` |
| `BVID` | 20-boj-hraci:778 | const | ⓘ `{` |
| `BVLZ` | 02-mapa:3143 | const | ⓘ `{` |
| `BWL` | 20-boj-hraci:847 | const | ⓐ hráč: během boje drž obrazovku telefonu rozsvícenou |
| `BX` | 11-boj:3228 | const | ⓐ řádek nepřítele či spojence ve formuláři; skrytá pole nesou statblock, přívlastky a osobu |
| `BXPT` | 11-boj:2185 | const | ⓘ `[` |
| `BZ` | 11-boj:2903 | const | ⓘ `{q: [], cek: [], t: 0, beh: false};` |
| `BZ_OKNO` | 24-boj-zaznam:6 | const | ⓘ `10 * 60 * 1000;` |
| `BZAPT` | 12-boj-tah-postavy:1329 | let | ⓘ `null;` |
| `BZAS` | 14c-boj-reakce:86 | let | ⓐ hráč: nový zásah na mou postavu ve veřejném záznamu boje → hlášení, vibrace, soustředění, nabídka reakcí |
| `BZAZQ` | 20b-boj-vypravec:46 | const | ⓐ veřejný záznam: kdo, komu, čím, výsledek; zranění jen u zásahů postav a spojenců, nikdy životy a AC nepřátel |
| `BZBK` | 02-mapa:3212 | const | ⓘ `{Vycpávaná: "vycpavana", Kroužková: "krouzkova", Plátová: "platova", K…` |
| `BZBR` | 02-mapa:3170 | const | ⓘ `{` |
| `BZBRN` | 12-boj-tah-postavy:1289 | const | ⓐ kořist: zbroj z AC, zbraně z útoků (ne drápy a kouzla), u houfu krát padlí a zajatí; poškozená obětováním zbroj k opravě |
| `BZBRRE` | 11-boj:583 | const | ⓘ `/(?<![\p{L}])(vycpávan\|kroužkov\|plátov\|komplexn)(\p{L}*)/giu;` |
| `BZDC` | 12-boj-tah-postavy:760 | const | ⓘ `{},` |
| `BZNAC` | 20-boj-hraci:360 | const | ⓐ Hex a Hunter's Mark: přídavek se přičte sám proti nepříteli se značkou od této postavy (a jen proti němu, když postava nějakou značku má) |
| `BZNACP` | 20c-boj-ridery:181 | const | ⓐ Hex / Hunter's Mark: když označený cíl padne (nebo zmizí z boje), karta nabídne přenést značku bonusovou akcí na jiného nepřítele |
| `BZOPEN` | 24-boj-zaznam:9 | const | ⓘ `new Set();` |
| `BZRPOD` | 12-boj-tah-postavy:1930 | var | ⓘ `0;` |
| `BZRRE` | 11-boj:595 | const | ⓘ `const BZRRE =` |
| `BZRSL` | 11-boj:2917 | const | ⓘ `[` |
| `BZRT` | 02-mapa:3197 | const | ⓘ `{` |
| `BZTL` | 12-boj-tah-postavy:759 | const | ⓘ `{},` |
| `BZTYPY` | 20b-boj-vypravec:4 | const | ⓘ `[` |
| `BZUND` | 11-boj:1188 | const | ⓘ `[];` |
| `BZVAKT` | 20e-boj-vlastnosti:8 | const | ⓘ `{` |
| `BZVK` | 02-mapa:3178 | const | ⓐ malované ikony vlastností zbraní (zv-), typů zranění (zr-) a zbrojí (zb-) – art/img/boj, zadání vyvoj/ikony-boj.md |
| `BZVL` | 12-boj-tah-postavy:1291 | const | ⓘ `const BZVL =` |
| `BZVST` | 11-boj:431 | const | ⓐ stavy z vlastností zbraní (Artikule › Zbraně, 2026-10-20): ikona = štítek vlastnosti; ut/cil jako u SRD stavů (cil "dym" = nevýhoda jen zblí… |
| `BZVV` | 20e-boj-vlastnosti:294 | const | ⓘ `{};` |
| `BZVYS` | 24-boj-zaznam:16 | const | ⓐ výsledek útoku jako ikonka: hvězda = zásah, X = vedle, v prstenci = přirozená 20 / 1; text zůstává v popisku |
| `BZZBR` | 24-boj-zaznam:20 | const | ⓘ `[` |
| `CARMS` | 01-zaklad:109 | const | ⓘ `{` |
| `CASTLEICO` | 01-zaklad:30 | const | ⓘ `"art/img/hrad.webp";` |
| `CESTA_ODCH` | 09-vypravec-herni-cas:243 | const | ⓘ `[` |
| `CESTA_ZP` | 09-vypravec-herni-cas:237 | const | ⓘ `[` |
| `CIDX` | 02-mapa:2420 | const | ⓘ `[];` |
| `CITYINFO` | 02-mapa:661 | const | ⓘ `{` |
| `CMOSTY` | 09-vypravec-herni-cas:262 | const | ⓘ `[` |
| `CMYTA` | 09-vypravec-herni-cas:269 | const | ⓘ `[["Landštejn", 15.23, 48.97, "mýto pánů Krajířů z Krajku na cestě z Ra…` |
| `CONFN` | 01-zaklad:20 | const | ⓘ `{kat: "katolíci", kal: "kališníci", mix: "smíšení", isl: "islám"};` |
| `CTYPE` | 02-mapa:647 | const | ⓘ `{` |
| `DCU` | 17-karty-ii:4 | const | ⓐ typ: "discord" nebo "email" (účet s heslem) |
| `DEG` | 07-druzina-kronika:496 | const | ⓐ hodiny Závoje na úvodu: 24 hodin (pravý sluneční čas Prahy), poledne nahoře, půlnoc dole |
| `DF` | 02-mapa:2297 | const | ⓐ desky: filters + list view |
| `DIO` | 02-mapa:776 | const | ⓘ `[` |
| `DIO_ORDER` | 02-mapa:903 | const | ⓘ `[` |
| `DIO_POLY` | 02b-mapa-kresba:1422 | const | ⓘ `{` |
| `DISC` | 07-druzina-kronika:83 | var | ⓘ `[];` |
| `DNY` | 07-druzina-kronika:329 | const | ⓘ `["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"]…` |
| `DNYV` | 07-druzina-kronika:444 | const | ⓘ `["v neděli", "v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pát…` |
| `DOMAIN` | 02-mapa:1457 | const | ⓘ `[` |
| `DOMAIN_POLY` | 02b-mapa-kresba:1797 | const | ⓘ `{` |
| `DRACI` | 06-draconomicon-rodokmeny:2 | const | ⓘ `{};` |
| `DRAK_T` | 07-druzina-kronika:802 | const | ⓘ `{` |
| `DRBY` | 06-draconomicon-rodokmeny:15 | const | ⓘ `{};` |
| `DUCH_NOLBL` | 02-mapa:1507 | const | ⓘ `new Set(["kcz", "mor", "hun", "kla", "hlu", "dlu", "brb", "hfa"]);` |
| `DUCHY` | 02-mapa:927 | const | ⓘ `[` |
| `DUCHY_POLY` | 02b-mapa-kresba:3331 | const | ⓘ `{` |
| `ECOL` | 02-mapa:2526 | const | ⓘ `{rod: "var(--gold)", spoj: "var(--kat)", spor: "var(--kal)"};` |
| `ED` | 21-editor-pecet:6 | const | ⓘ `{z: null, idx: null};` |
| `EDDLOUHE` | 21-editor-pecet:147 | const | ⓘ `new Set(["hlava", "postoj", "historie", "note", "schopnost", "role", "…` |
| `EDDRUH` | 21-editor-pecet:7 | const | ⓘ `{` |
| `EDGES` | 02-mapa:2429 | const | ⓘ `[];` |
| `EDPOLE` | 21-editor-pecet:65 | const | ⓘ `{` |
| `EMPTY` | 02-mapa:2160 | const | ⓘ `'<span class="lbl">Rod a jeho vazby</span><p>Vyberte rod na mapě, v na…` |
| `FAM` | 01-zaklad:2 | const | ⓘ `[];` |
| `FICON` | 01-zaklad:21 | const | ⓘ `{kat: "art/img/vira-kat.webp", kal: "art/img/vira-kal.webp", mix: "art…` |
| `FORESTS` | 02-mapa:1715 | const | ⓘ `[` |
| `FORLBL` | 02b-mapa-kresba:5222 | const | ⓘ `[` |
| `GCH` | 03-artikule:202 | const | ⓘ `{` |
| `GH` | 02-mapa:2435 | const | ⓘ `640;` |
| `GIDS` | 02-mapa:2433 | const | ⓘ `[...new Set(EDGES.flatMap(e => [e.a, e.b]))].filter(id => byId[id]);` |
| `GIDX` | 07-druzina-kronika:1270 | const | ⓘ `[];` |
| `GINFO0` | 02-mapa:2586 | const | ⓘ `document.getElementById("ginfo").innerHTML;` |
| `GLOSS` | 03-artikule:18 | const | ⓘ `[` |
| `GMV` | 04-praha:32 | const | ⓘ `false;` |
| `GN` | 02-mapa:2436 | const | ⓘ `{};` |
| `GW` | 02-mapa:2434 | const | ⓘ `900,` |
| `HIGHLAND_FOREST` | 02b-mapa-kresba:5560 | const | ⓘ `new Set([0, 1, 2, 3, 4, 5, 6, 7, 12, 18, 19, 21, 22, 26, 28, 31, 35, 4…` |
| `HIST` | 02-mapa:2205 | const | ⓘ `[];` |
| `HISTH` | 02-mapa:2204 | const | ⓘ `f => (f.city ? "Historie města" : /^(Biskupství\|Arcibiskupství\|Papežsk…` |
| `HODY` | 13-karty:62 | let | ⓘ `[],` |
| `HRA` | 07-druzina-kronika:86 | var | ⓐ Herní stav nastavený vypravěčem (datum, hodina, kde je družina); bez něj platí poslední zápis Kroniky |
| `HRA_PO` | 09-vypravec-herni-cas:619 | const | ⓘ `[];` |
| `HRAKL` | 22-vyprava:696 | const | ⓘ `["datum", "hodina", "misto", "praha", "cesta", "poloha", "putovani"];` |
| `HRAP` | 16-srd-ukazky-sezeni-hrac:1309 | let | ⓘ `null;` |
| `ILSEL` | 08-navigace-pravidla:842 | const | ⓘ `".lead,.ztext>p:first-child,.artmain .kron,.asec>.ash+p,.drtext>p:firs…` |
| `INSTP` | 19-karty-beyond:815 | let | ⓘ `null;` |
| `JA` | 11-boj:2613 | const | ⓐ přihlášený hráč (stránka Hra): {k: karta, t: token relace, n: jméno} |
| `KADV` | 13-karty:183 | let | ⓐ hod d20 z karty; ověření a útoky hází i kostku Závoje a rovnou ji vyhodnotí, záchrany ne (Artikule › Kostka Závoje) |
| `KARTBY` | 12-boj-tah-postavy:1777 | const | ⓘ `Object.fromEntries((KARTY \|\| []).map(k => [k.id, k]));` |
| `KARTY` | 07-druzina-kronika:15 | var | ⓘ `[];` |
| `KBUF` | 17-karty-ii:509 | const | ⓘ `{Bless: {max: 3, plus: 1}, Guidance: {max: 1}, "Shield of Faith": {max…` |
| `KCACHE` | 15-karty-artikule:879 | const | ⓘ `{` |
| `KCAS` | 17-karty-ii:119 | const | ⓘ `{A: "Akce", BA: "Bonusové akce", R: "Reakce", X: "Ostatní"};` |
| `KCIL` | 17-karty-ii:779 | const | ⓐ léčení na kartu (2026-10-17): svou kartu (a kartu bez hesla) mění přímo, cizí přes mm_karta_lecit, který v boji stabilizuje umírajícího |
| `KCILM` | 17-karty-ii:511 | const | ⓘ `{};` |
| `KCTN` | 15-karty-artikule:3 | const | ⓘ `{` |
| `KCX` | 18-pravidla-postavy:151 | const | ⓘ `new WeakMap(),` |
| `KCX0` | 18-pravidla-postavy:152 | const | ⓘ `new WeakMap();` |
| `KDB` | 13-karty:4 | const | ⓘ `window.MMDB` |
| `KDBFLT` | 13-karty:716 | const | ⓘ `{a: "all", q: ""};` |
| `KDBVL` | 13-karty:717 | const | ⓘ `{STR: "Síla", AGI: "Obratnost", CON: "Odolnost", INT: "Inteligence", W…` |
| `KDLT` | 18-pravidla-postavy:310 | const | ⓘ `new WeakMap();` |
| `KDOVAB` | 13-karty:451 | const | ⓘ `{` |
| `KDRUH` | 18-pravidla-postavy:48 | const | ⓐ druhy (SRD 5.2.1): rychlost a velikost; trpaslík +1 HP za úroveň |
| `KDUL` | 15-karty-artikule:525 | const | ⓘ `{};` |
| `KEF` | 13-karty:471 | const | ⓘ `{};` |
| `KFEAT` | 15-karty-artikule:66 | const | ⓐ feat víry (Artikule, Vyznání): [název, použití za dlouhý odpočinek (0 = bez počítadla), stupeň, popis] |
| `KFR` | 15-karty-artikule:779 | const | ⓘ `{` |
| `KHRAC` | 13-karty:65 | const | ⓘ `{};` |
| `KHUKOL` | 14-karty-bojova-karta:400 | const | ⓐ rozdělení hlášek na úkoly (mají tlačítko s rozhodnutím) a informace |
| `KICON` | 19-karty-beyond:1485 | const | ⓘ `'<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="…` |
| `KIMP` | 13-karty:472 | let | ⓘ `null;` |
| `KIMPINV` | 13-karty:1106 | let | ⓘ `true;` |
| `KINVC` | 14b-vybaveni:124 | const | ⓐ vybraný cíl vrhu podle karty |
| `KINVCEN` | 14b-vybaveni:14 | const | ⓘ `const KINVCEN =` |
| `KINVHOD` | 14b-vybaveni:17 | const | ⓐ vrhací spotřební věci podle SRD 5.2.1 (výstroj): místo jednoho útoku akce Útok; cíl do 20 stop, záchrana AGI SO 8 + AGI + zdatnost |
| `KINVR` | 19-karty-beyond:49 | let | ⓘ `false;` |
| `KINVSK` | 14b-vybaveni:4 | const | ⓘ `[` |
| `KINVSPO` | 14b-vybaveni:12 | const | ⓘ `const KINVSPO =` |
| `KIRIT` | 19-karty-beyond:1486 | const | ⓘ `'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.4c1.5 1.7 1…` |
| `KKON` | 17-karty-ii:1092 | const | ⓐ soustředění (2026-10-17): CON záchrana na kliknutí (War Caster výhoda, stavy, Závoj); neúspěch ukončí soustředění i soustředěné účinky |
| `KKONT` | 19-karty-beyond:47 | const | ⓘ `/backpack\|bag\|sack\|pouch\|chest\|haversack\|portable hole\|quiver\|case\|cra…` |
| `KKONTM` | 19-karty-beyond:48 | const | ⓘ `/bag of holding\|handy haversack\|portable hole\|heward/i;` |
| `KLOAD` | 13-karty:63 | let | ⓘ `0;` |
| `KLVUP` | 19-karty-beyond:173 | const | ⓘ `{};` |
| `KMARC` | 18-pravidla-postavy:21 | const | ⓘ `/Barbarian\|Fighter\|Paladin\|Ranger/;` |
| `KMASS` | 17-karty-ii:510 | const | ⓘ `{"Mass Healing Word": 6, "Mass Cure Wounds": 6, "Prayer of Healing": 5…` |
| `KMAST` | 17-karty-ii:126 | const | ⓐ mistrovství zbraní (Vex, Nick…) nejsou akce – patří k vlastnostem zbraně |
| `KMINC` | 19-karty-beyond:52 | const | ⓐ směna mincí: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP |
| `KMODSP` | 19-karty-beyond:728 | const | ⓘ `{};` |
| `KNABC` | 17-karty-ii:1046 | const | ⓘ `{};` |
| `KNER` | 15-karty-artikule:7 | const | ⓘ `{` |
| `KODK` | 23-potvrzovani:65 | var | ⓘ `[],` |
| `KODKI` | 23-potvrzovani:66 | var | ⓘ `0;` |
| `KODKT` | 23-potvrzovani:97 | var | ⓘ `0;` |
| `KPASD` | 18-pravidla-postavy:351 | const | ⓘ `{vnimani: "Perception", vhled: "Insight", patrani: "Investigation"};` |
| `KPDFV` | 18-pravidla-postavy:297 | const | ⓐ PDF → co pravidla nevysvětlí; hráč to může odebrat (S.pdfx) |
| `KPEND` | 13-karty:67 | const | ⓐ rozepsané změny: načtení z databáze nesmí přepsat změnu, která se právě ukládá (nebo se uložila až po začátku načítání) |
| `KPENDT` | 13-karty:68 | const | ⓘ `{};` |
| `KPOLL` | 13-karty:1564 | let | ⓐ karty a herní záznam se obnovují, když je stránka otevřená (nepřekreslí se, když hráč zrovna píše) |
| `KPOOLM` | 14-karty-bojova-karta:115 | let | ⓘ `null,` |
| `KPOOLO` | 14-karty-bojova-karta:116 | let | ⓘ `false;` |
| `KPOSL` | 13-karty:1573 | const | ⓘ `{};` |
| `KPOVCZ` | 18-pravidla-postavy:1180 | const | ⓘ `{` |
| `KPOZT` | 16-srd-ukazky-sezeni-hrac:1845 | let | ⓘ `null;` |
| `KPREDX` | 18-pravidla-postavy:106 | const | ⓐ předměty, které pravidla znají jménem (doplňují databázi SRD předmětů): nastavené skóre, bonus ke kouzlům a další |
| `KPRID` | 17-karty-ii:830 | const | ⓘ `[` |
| `KPRIP` | 18-pravidla-postavy:1190 | let | ⓘ `null;` |
| `KPS` | 15-karty-artikule:942 | const | ⓘ `{ab: "WIS", dc: "", dov: "Perception", vys: null};` |
| `KPZK` | 17-karty-ii:187 | const | ⓘ `{` |
| `KR` | 18-pravidla-postavy:213 | const | ⓘ `{` |
| `KRIM` | 19-karty-beyond:1480 | const | ⓐ ikonky kouzel: stupeň římskou číslicí v kolečku, trik hvězdičkou, soustředění a rituál (2026-10-17) |
| `KRYSSUM` | 16-srd-ukazky-sezeni-hrac:2009 | const | ⓐ nadpisy a souhrny z D&D Beyond, které nejsou samostatné rysy (velikost, rychlost, jazyky, volba vlastnosti…) |
| `KSDLG` | 17-karty-ii:553 | let | ⓘ `null;` |
| `KSK` | 13-karty:450 | const | ⓘ `{STR: "Síla", AGI: "Obratnost", CON: "Odolnost", INT: "Inteligence", W…` |
| `KSLT` | 18-pravidla-postavy:23 | const | ⓐ sloty podle úrovně sesilatele (SRD: Multiclassing) a sloty paktu černokněžníka |
| `KSLV` | 19-karty-beyond:979 | const | ⓘ `{};` |
| `KSPD` | 15-karty-artikule:305 | let | ⓘ `null;` |
| `KSPDP` | 15-karty-artikule:315 | let | ⓘ `null;` |
| `KSPOLC` | 18-pravidla-postavy:1221 | const | ⓘ `{};` |
| `KSPTP` | 15-karty-artikule:347 | let | ⓐ popisy, které v lehkém souboru nejsou (t chybí, automatika má ta): dotáhnout z plného souboru a překreslit |
| `KST` | 13-karty:60 | const | ⓘ `{},` |
| `KSTAT` | 13-karty:61 | const | ⓘ `new Set((KARTY \|\| []).map(k => k.id));` |
| `KSTP` | 14-karty-bojova-karta:331 | const | ⓐ sdílené části karty i bojové karty: čipy stavů s výběrem, čipy zdrojů, pruh hlášení |
| `KSTV` | 17-karty-ii:1187 | const | ⓘ `[` |
| `KSVIT` | 17-karty-ii:293 | const | ⓐ svitky (Spell Scroll): SO a útok podle stupně kouzla; kouzlo musí být na seznamu povolání; vyšší stupeň, než postava sesílá = ověření SO 10 … |
| `KTAB` | 16-srd-ukazky-sezeni-hrac:1784 | const | ⓐ karta: záložky, poznámky, zátěž, připoutání |
| `KTR` | 18-pravidla-postavy:7 | const | ⓘ `{` |
| `KTRCZ` | 17-karty-ii:305 | const | ⓘ `{` |
| `KTX` | 17-karty-ii:55 | const | ⓘ `{},` |
| `KTXAB` | 13-karty:1699 | const | ⓘ `{` |
| `KTXP` | 17-karty-ii:56 | const | ⓘ `{};` |
| `KTXRE` | 13-karty:1743 | const | ⓘ `const KTXRE =` |
| `KUCX` | 15-karty-artikule:268 | const | ⓘ `new Set();` |
| `KUPRC` | 18-pravidla-postavy:999 | const | ⓘ `[` |
| `KUPRN` | 18-pravidla-postavy:1011 | const | ⓘ `Object.fromEntries([` |
| `KUPRO` | 13-karty:1022 | const | ⓘ `new Set();` |
| `KUPROTV` | 18-pravidla-postavy:1060 | const | ⓘ `new Set();` |
| `KUTI` | 18-pravidla-postavy:854 | const | ⓘ `new WeakMap();` |
| `KVLIK` | 13-karty:531 | const | ⓘ `{` |
| `KVYBS` | 14-karty-bojova-karta:58 | const | ⓘ `[` |
| `KVYDP` | 15-karty-artikule:104 | const | ⓐ Výdrž (Artikule, Šerm a zápas): Fighter = bonus zdatnosti, Barbarian, Paladin, Ranger, Rogue, Monk polovina |
| `KVZN` | 15-karty-artikule:11 | const | ⓘ `{kal: "kališník", kat: "katolík", old: "starověrec"};` |
| `KZ` | 10-kouzla:4 | let | ⓘ `null,` |
| `KZ_LOK` | 10-kouzla:9 | let | ⓘ `false;` |
| `KZAM` | 16-srd-ukazky-sezeni-hrac:990 | const | ⓘ `new Set();` |
| `KZAV` | 15-karty-artikule:64 | const | ⓘ `{};` |
| `KZBRAN` | 18-pravidla-postavy:60 | const | ⓐ zbraně SRD 5.2.1: [vzor, název, kostka, typ, vlastnosti, S/M (jednoduchá/válečná), dálková] |
| `KZBRL` | 14-karty-bojova-karta:3 | const | ⓘ `[` |
| `KZBRT` | 18-pravidla-postavy:726 | const | ⓘ `[` |
| `KZBRV` | 14-karty-bojova-karta:103 | const | ⓘ `(() => {` |
| `KZBRW` | 14-karty-bojova-karta:17 | const | ⓘ `{` |
| `KZBY` | 10-kouzla:10 | const | ⓘ `{};` |
| `KZDRP` | 18-pravidla-postavy:450 | const | ⓐ počty použití schopností podle pravidel (SRD 5.2.1); ostatní z PDF |
| `KZEF` | 17b-kouzla-ucinky:7 | const | ⓘ `{` |
| `KZF` | 10-kouzla:272 | const | ⓘ `{q: "", l: "", s: "", p: "", ko: false, ri: false, vl: false};` |
| `KZFL` | 15-karty-artikule:1071 | let | ⓐ null = ještě nevybráno (hráči se napoprvé ukáže jeho postava), "" = vše |
| `KZIK` | 17b-kouzla-ucinky:1168 | const | ⓘ `{` |
| `KZK` | 10-kouzla:178 | const | ⓘ `["V", "S", "M"];` |
| `KZLEC` | 17b-kouzla-ucinky:761 | const | ⓘ `{` |
| `KZOBL` | 17b-kouzla-ucinky:411 | const | ⓘ `{` |
| `KZOPAK` | 17b-kouzla-ucinky:273 | const | ⓘ `{` |
| `KZP` | 10-kouzla:5 | let | ⓘ `null,` |
| `KZPET` | 13-karty:1767 | const | ⓘ `{},` |
| `KZPF` | 13-karty:1768 | const | ⓘ `{` |
| `KZPOV` | 10-kouzla:164 | const | ⓘ `["Bard", "Klerik", "Druid", "Paladin", "Hraničář", "Čaroděj", "Černokn…` |
| `KZPROT` | 17b-kouzla-ucinky:612 | const | ⓘ `"Counterspell: ";` |
| `KZPYTV` | 16-srd-ukazky-sezeni-hrac:1093 | const | ⓐ Zpytování svědomí jako výzva: typ „hod“ s touto poznámkou (bez změny databáze); hráč hodí d10 na své kartě (kZpyt) |
| `KZRE` | 10-kouzla:6 | let | ⓘ `null,` |
| `KZSK` | 10-kouzla:163 | const | ⓘ `["Abjurace", "Vyvolávání", "Věštění", "Očarování", "Evokace", "Iluze",…` |
| `KZSRD` | 10-kouzla:7 | let | ⓘ `[],` |
| `KZSTOP` | 10-kouzla:3 | const | ⓐ anglické názvy kouzel, které jsou zároveň běžné herní pojmy – neprolinkovávat |
| `KZSUM` | 17b-kouzla-ucinky:971 | const | ⓘ `{` |
| `KZTXTKP` | 10-kouzla:107 | let | ⓐ hráč stahuje lehčí art/kouzla-karta.json (bez popisů tam, kde automatika čte starší text); vypravěč plný soubor |
| `KZTXTP` | 10-kouzla:93 | let | ⓐ art/kouzla.json se stáhne jednou (sdílí ho seznam kouzel vypravěče i karty postav); každý si ho přečte zvlášť |
| `KZVL` | 10-kouzla:8 | let | ⓘ `[],` |
| `LANDS` | 02b-mapa-kresba:3 | const | ⓘ `[` |
| `LLBL` | 02b-mapa-kresba:676 | const | ⓘ `[` |
| `LOKATIV` | 07-druzina-kronika:464 | const | ⓘ `{` |
| `MAJOR_PLACES` | 02-mapa:746 | const | ⓘ `new Set([` |
| `MAJOR_ROADS` | 02-mapa:719 | const | ⓘ `new Set([` |
| `MES` | 07-druzina-kronika:328 | const | ⓘ `["ledna", "února", "března", "dubna", "května", "června", "července", …` |
| `MIMO` | 18-pravidla-postavy:566 | let | ⓘ `null,` |
| `MIMOCAS` | 18-pravidla-postavy:691 | const | ⓘ `{A: "Akce", BA: "Bonusová akce", R: "Reakce"};` |
| `MIMOKAT` | 08-navigace-pravidla:350 | const | ⓐ Doplňky mimo SRD: podtřídy podle povolání, featy podle druhu, zázemí, druhy a kouzla (vlastní shrnutí mechaniky) |
| `MIMOP` | 18-pravidla-postavy:567 | let | ⓘ `null,` |
| `MIMOPOZN` | 18-pravidla-postavy:710 | const | ⓘ `const MIMOPOZN =` |
| `MIMOR` | 18-pravidla-postavy:568 | let | ⓘ `{};` |
| `MIMOSKIP` | 18-pravidla-postavy:655 | const | ⓐ rysy, které pravidla už počítají jménem (Tough, Speedy, Lucky…), tu nesčítat podruhé |
| `MMCELA_MQ` | 08-navigace-pravidla:538 | const | ⓘ `matchMedia("(max-width:700px)");` |
| `MMCELA_WEB` | 08-navigace-pravidla:539 | let | ⓘ `false;` |
| `MMIDB` | 15-karty-artikule:841 | const | ⓘ `{` |
| `MMK` | 11-boj:920 | const | ⓘ `{q: [], t: 0, box: null, load: null, run: 0, el: null, zi: -1, ci: 0, …` |
| `MMLINY` | 01-zaklad:126 | const | ⓘ `{};` |
| `MMLINY_V` | 01-zaklad:174 | const | ⓐ „hra“ (boj, karty, hra, puls…) potřebují stránky s kartou, bojem a pravidly; ostatní stránky se ukážou bez ní |
| `MMPREK` | 01-zaklad:9 | const | ⓘ `new Map();` |
| `MOUNTAINS` | 02-mapa:1535 | const | ⓘ `[` |
| `MSEG` | 02-mapa:2742 | const | ⓘ `[];` |
| `NAMEPTS` | 02-mapa:2727 | const | ⓘ `[...PLACES.map(p => [p.name, p.lo, p.la]), ...TOWNS];` |
| `NAVMOJE` | 23-potvrzovani:126 | var | ⓘ `new Set();` |
| `NAVNAME` | 08-navigace-pravidla:495 | const | ⓘ `{` |
| `NAVOD` | 16-srd-ukazky-sezeni-hrac:1053 | const | ⓘ `'<ol class="navod"><li><b>Nahraj svou postavu.</b> V D&amp;D Beyond ot…` |
| `NAVRHY` | 23-potvrzovani:125 | var | ⓘ `[],` |
| `NBR_LANDS` | 02-mapa:2370 | const | ⓘ `["Braniborsko", "Polsko", "Uhry", "Rakousy", "Bavory", "Sasko", "Říšsk…` |
| `NBRS` | 02b-mapa-kresba:694 | const | ⓘ `[` |
| `NEDELE` | 07-druzina-kronika:424 | const | ⓘ `[` |
| `NETV` | 16-srd-ukazky-sezeni-hrac:112 | let | ⓐ nestvůry: připojí se k protivníkům (bestiář v Boji, přidání do boje) |
| `NETVP` | 16-srd-ukazky-sezeni-hrac:113 | let | ⓘ `null;` |
| `NLBL` | 02b-mapa-kresba:684 | const | ⓘ `[` |
| `NS` | 02-mapa:134 | const | ⓐ www.w3.org/2000/svg"; |
| `NVF` | 16-srd-ukazky-sezeni-hrac:139 | let | ⓘ `{q: "", typ: ""};` |
| `OFF` | 02-mapa:2775 | const | ⓐ without a road even open country is slower |
| `OSPROT` | 11-boj:792 | const | ⓘ `Object.fromEntries(PROTOSOBY.map(p => [p.id, p]));` |
| `PAR` | 04-praha:34 | const | ⓘ `PVB0[3] / PVB0[2],` |
| `PARTY` | 07-druzina-kronika:14 | var | ⓘ `[];` |
| `PARTY_SLOTS` | 07-druzina-kronika:16 | const | ⓘ `5;` |
| `PBLD` | 04b-praha-plan:93 | const | ⓐ krajina a stavby mimo očíslovaná místa: [druh, x, pata, výška, zrcadlit, jen v celkovém pohledu] |
| `PBW` | 04b-praha-plan:56 | const | ⓐ ilustrace plánu: šířky piktogramů (výška 170 px), stavby [druh, x, pata, výška], stuhy, Židovské Město |
| `PBY` | 02-mapa:2618 | const | ⓘ `Object.fromEntries(PEOPLE.map(p => [p.id, p]));` |
| `PEC` | 26-start:2 | const | ⓘ `(() => {` |
| `PEOPLE` | 02-mapa:2617 | const | ⓘ `[];` |
| `PFAITH` | 07-druzina-kronika:17 | const | ⓘ `{kal: "kališník", kat: "katolík", old: "starověrec"};` |
| `PG` | 04-praha:27 | let | ⓘ `null,` |
| `PICO` | 04b-praha-plan:106 | const | ⓐ ikony míst: vlastní kresba [soubor, výška], jinak obecná podle druhu |
| `PKIND` | 04-praha:29 | const | ⓘ `{dvur: "Dvory a domy", urad: "Obec a úřady", cirkev: "Církevní stavby"…` |
| `PLACES` | 02-mapa:1516 | const | ⓘ `[];` |
| `PM` | 04b-praha-plan:1385 | const | ⓘ `{on: false, a: null, b: null, path: null, grid: null};` |
| `PMA` | 04-praha:35 | const | ⓘ `"art/mapa/";` |
| `PMU` | 04b-praha-plan:1386 | const | ⓐ metrů na jednotku plánu (podle délky Kamenného mostu) |
| `POC_N` | 07-druzina-kronika:748 | const | ⓘ `{` |
| `POJ` | 15-karty-artikule:1089 | let | ⓘ `null,` |
| `POJP` | 15-karty-artikule:1090 | let | ⓘ `null,` |
| `POJRE` | 15-karty-artikule:1091 | let | ⓘ `null;` |
| `POJSKIP` | 15-karty-artikule:1121 | const | ⓘ `"A,BUTTON,ABBR,INPUT,SELECT,TEXTAREA,OPTION,H1,H2,H3,H4,LABEL,SUMMARY,…` |
| `POJT` | 15-karty-artikule:1159 | let | ⓘ `null;` |
| `POKL` | 19-karty-beyond:910 | let | ⓘ `null;` |
| `PORTR` | 08-navigace-pravidla:105 | const | ⓘ `new Set(Object.keys(PORTRH));` |
| `PORTRH` | 08-navigace-pravidla:104 | const | ⓘ `{};` |
| `POSL` | 02-mapa:2203 | const | ⓘ `t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");` |
| `POTVRZDB` | 23-potvrzovani:8 | var | ⓐ nastavení z databáze (nastaveni.potvrz) – hráči ho průběžně načítají, změna nepřenačte stránky jako změna herního stavu |
| `PRAHA_PLACES` | 04-praha:23 | const | ⓐ n = číslo na plánu, k = druh (dvur/urad/cirkev/hospoda), t = město, c = vyznání (kat/kal/mix/""), r = rod, p = osoba |
| `PRAHA_TOWNS` | 04-praha:2 | const | ⓘ `[` |
| `PRB` | 04-praha:24 | const | ⓘ `{};` |
| `PRED` | 16-srd-ukazky-sezeni-hrac:2 | let | ⓘ `null,` |
| `PREDBY` | 16-srd-ukazky-sezeni-hrac:4 | const | ⓘ `{},` |
| `PREDBYN` | 16-srd-ukazky-sezeni-hrac:5 | const | ⓘ `{};` |
| `PREDP` | 16-srd-ukazky-sezeni-hrac:3 | let | ⓘ `null;` |
| `PRF` | 16-srd-ukazky-sezeni-hrac:43 | let | ⓘ `{q: "", druh: "", vz: ""};` |
| `PRIB` | 04b-praha-plan:139 | const | ⓘ `{` |
| `PRIBT` | 04b-praha-plan:138 | const | ⓘ `{kratka: [520, 135, 0.62], stredni: [560, 118, 0.59], dlouha: [600, 12…` |
| `PRIVBY` | 11-boj:790 | const | ⓘ `Object.fromEntries(PRIVLASTKY.map(p => [p.id, p])),` |
| `PRIVLASTKY` | 11-boj:786 | const | ⓘ `[],` |
| `PROTBY` | 11-boj:789 | const | ⓘ `Object.fromEntries(PROTIVNICI.map(p => [p.id, p])),` |
| `PROTIVNICI` | 11-boj:785 | const | ⓘ `[],` |
| `PROTOSOBY` | 11-boj:788 | const | ⓘ `[];` |
| `PRVZ` | 16-srd-ukazky-sezeni-hrac:39 | const | ⓘ `["běžný", "neobvyklý", "vzácný", "velmi vzácný", "legendární", "artefa…` |
| `PSTREETS` | 04-praha:37 | const | ⓐ názvy ulic, trhů a bran: [název, x, y, natočení] |
| `PULS` | 25-puls:7 | var | ⓘ `{z: null, beh: false, znovu: false, t: 0, tm: 0, obnov: false, start: …` |
| `PULS_HRA` | 25-puls:8 | const | ⓘ `["vyzvy", "zpravy", "navrhy", "potvrz", "pokladna"];` |
| `PULTTAB` | 08-navigace-pravidla:555 | let | ⓐ záložka řídicího pultu vypravěče: boj \| druzina \| sezeni (nastaví route podle adresy) |
| `PUSHST` | 19-karty-beyond:762 | let | ⓘ `null;` |
| `PVB0` | 04-praha:33 | const | ⓘ `[-40, 20, 1160, 1220],` |
| `PZID` | 04b-praha-plan:148 | const | ⓘ `[` |
| `RADJ` | 02-mapa:2774 | const | ⓘ `[],` |
| `REL` | 01-zaklad:3 | const | ⓘ `[];` |
| `RESBY` | 02-mapa:2621 | const | ⓘ `Object.fromEntries(RESERS.map(r => [r.id, r]));` |
| `RESERS` | 02-mapa:2620 | const | ⓐ rešerše postav: jen ve vypravěčských datech (hráčům přijde prázdná) |
| `RGL` | 01-zaklad:99 | const | ⓘ `{rod: "Krev", spoj: "Spojenectví", spor: "Spory"};` |
| `RGRAF` | 06-draconomicon-rodokmeny:107 | let | ⓘ `null;` |
| `RGVZ` | 06-draconomicon-rodokmeny:238 | const | ⓘ `{` |
| `RICON` | 01-zaklad:97 | const | ⓘ `{rod: "art/img/vazba-rod.webp", spoj: "art/img/vazba-spoj.webp", spor:…` |
| `RIMV` | 07-druzina-kronika:578 | const | ⓐ hodiny 2 × 12 („půl orloj“, jako římské číslice pražského orloje), unciálními kapitálami; čtyřka IIII jako na ciferníku |
| `RIVERS` | 02-mapa:13 | const | ⓘ `[` |
| `RIVLBL` | 02b-mapa-kresba:5488 | const | ⓘ `[` |
| `RIVNAMES` | 09-vypravec-herni-cas:261 | const | ⓐ řeky z mapy (pořadí jako RIVERS), stálé mosty roku 1458 a známá mýtná místa |
| `RN` | 02-mapa:2773 | const | ⓘ `[],` |
| `ROADS` | 02-mapa:162 | const | ⓘ `[` |
| `RORD` | 02-mapa:2152 | const | ⓘ `{rod: 0, spoj: 1, spor: 2};` |
| `RZENA` | 06-draconomicon-rodokmeny:100 | const | ⓘ `n => {` |
| `SCITY` | 05-svet:150 | const | ⓐ města jako obrázky: [obrázek, velikost]; ostatní hlavní města dostanou opevněné město |
| `SETBY` | 11-boj:791 | const | ⓘ `Object.fromEntries(SETKANI.map(p => [p.id, p])),` |
| `SETKANI` | 11-boj:787 | const | ⓘ `[],` |
| `SEZ` | 16-srd-ukazky-sezeni-hrac:417 | const | ⓘ `{d: null, cur: null, t: null, lok: false};` |
| `SFICON` | 01-zaklad:22 | const | ⓘ `{` |
| `SG` | 05-svet:293 | let | ⓘ `null;` |
| `SHCOL` | 05-svet:209 | const | ⓐ hlavní obchodní trasy: složené z úseků cest v svet-cesty.md [název, směr, odkud, kam] |
| `SHL` | 05-svet:261 | let | ⓘ `null;` |
| `SHLAVNI` | 05-svet:210 | const | ⓘ `[` |
| `SHORT` | 02-mapa:2427 | const | ⓐ relationship graph |
| `SIMG` | 05-svet:113 | const | ⓘ `{` |
| `SKURF` | 05-svet:9 | const | ⓐ kurfiřtská knížectví – přibližné obrysy (zeměpisné souřadnice); sedmým kurfiřtem je český král |
| `SLABPOS` | 05-svet:473 | const | ⓐ ručně umístěné popisky velkých mocností (zeměpisná délka, šířka) |
| `SLODE` | 05-svet:189 | const | ⓐ lodě a obludy [obrázek, délka, šířka, šířka obrázku, zrcadlit], růžice portulánu [délka, šířka, velká] |
| `SM` | 05-svet:295 | const | ⓘ `{on: false, a: null, b: null, path: null};` |
| `SMA` | 05-svet:112 | const | ⓘ `"art/svet/";` |
| `SNET` | 05-svet:312 | let | ⓘ `null;` |
| `SOBLUDY` | 05-svet:197 | const | ⓘ `[` |
| `SP` | 05-svet:513 | function | ⓘ `function SP(lon, lat) {` |
| `SPORT` | 05-svet:201 | const | ⓘ `[` |
| `SRCOL` | 05-svet:6 | const | ⓘ `{hanza: "#8b5a2b", benatky: "#b0302a", janov: "#2f5d9e", poutlod: "#7a…` |
| `SRDIC` | 11-boj:409 | const | ⓘ `{` |
| `SRDKAP` | 08-navigace-pravidla:194 | const | ⓘ `[` |
| `SRDP` | 08-navigace-pravidla:332 | let | ⓘ `null,` |
| `SRDPP` | 08-navigace-pravidla:333 | let | ⓘ `null;` |
| `SRDRY` | 17-karty-ii:57 | let | ⓘ `null;` |
| `SRDRYP` | 17-karty-ii:58 | let | ⓘ `null;` |
| `SRDST` | 11-boj:337 | const | ⓘ `{` |
| `SRDUR` | 19-karty-beyond:162 | let | ⓘ `null,` |
| `SRDURP` | 19-karty-beyond:163 | let | ⓘ `null;` |
| `SRIVHL` | 05-svet:187 | const | ⓐ v celkovém pohledu jen tato města; ostatní po přiblížení |
| `SRSEA` | 05-svet:7 | const | ⓘ `new Set(["hanza", "benatky", "janov", "poutlod", "reka"]);` |
| `SSEAS` | 05-svet:497 | const | ⓐ moře, hory: zeměpisné souřadnice |
| `STAV` | 09-vypravec-herni-cas:2 | const | ⓘ `__D.STAV \|\| null;` |
| `STBY` | 15-karty-artikule:218 | const | ⓘ `Object.fromEntries(STECH.map(t => [t.id, t]));` |
| `STECH` | 15-karty-artikule:123 | const | ⓐ techniky a chvaty: id, název, cena, Požehnání (1) / reakce (r) / bonusová akce (b), účinek |
| `STLBL` | 09-vypravec-herni-cas:3 | const | ⓘ `["Skryté", "Slyšeli", "Potkali"];` |
| `SUBT` | 08-navigace-pravidla:21 | const | ⓘ `{` |
| `SVATKYD` | 07-druzina-kronika:371 | const | ⓐ datování po středověku: svátek dne a neděle církevního roku (juliánský kalendář, Velikonoce podle starého výpočtu) |
| `SVB` | 05-svet:109 | const | ⓘ `{};` |
| `SVB0` | 05-svet:310 | const | ⓘ `[0, 0, 1024, 790],` |
| `SVET` | 05-svet:2 | const | ⓘ `[];` |
| `SVETCESTY` | 05-svet:5 | const | ⓘ `[];` |
| `SVETDRZ` | 05-svet:4 | const | ⓘ `[];` |
| `SVETMESTA` | 05-svet:3 | const | ⓘ `[];` |
| `SVIRA` | 05-svet:291 | const | ⓘ `{kat: "katolíci", pra: "pravoslavní", isl: "islám", mix: "smíšené vyzn…` |
| `SVIRAC` | 05-svet:292 | const | ⓘ `{kat: "var(--kat)", pra: "var(--spra)", isl: "var(--sisl)", mix: "var(…` |
| `SVMOB` | 05-svet:311 | const | ⓘ `[340, 230, 360, 278];` |
| `SVPC` | 05b-svet-mapa:24 | const | ⓐ řetězce cest pro tvary mapy se sestaví jen jednou; při přiblížení se jen znovu použijí |
| `SVST` | 07-druzina-kronika:24 | const | ⓘ `v => (v <= 0 ? "Zatracený" : v <= 3 ? "Na scestí" : v <= 7 ? "Na vážká…` |
| `SZDB` | 16-srd-ukazky-sezeni-hrac:418 | const | ⓘ `{` |
| `TITL` | 08-navigace-pravidla:36 | const | ⓘ `{` |
| `TOWNICO` | 01-zaklad:95 | const | ⓘ `"art/img/mesto.webp";` |
| `TOWNS` | 02-mapa:2638 | const | ⓐ routing: roads become a graph; off-road legs and forest/mountain terrain cost more time |
| `TOWNSEATS` | 01-zaklad:31 | const | ⓘ `new Set([` |
| `TREEALIAS` | 06-draconomicon-rodokmeny:84 | const | ⓘ `{fra: "bra"};` |
| `TREES` | 06-draconomicon-rodokmeny:83 | const | ⓐ p = osoba v zemských deskách, r = rod, d = data, m = z kterého manželství, note = poznámka |
| `TRIBS` | 02b-mapa-kresba:5246 | const | ⓘ `[` |
| `TSTAV` | 06-draconomicon-rodokmeny:271 | const | ⓐ stav rodokmenů: zaostřená osoba, vybrané manželství, historie procházení |
| `UCETR` | 08-navigace-pravidla:876 | let | ⓐ otevřený formulář: "" (jen tlačítka), "novy", "prihlas" |
| `UKAZKY` | 16-srd-ukazky-sezeni-hrac:238 | let | ⓘ `[],` |
| `UKDB` | 16-srd-ukazky-sezeni-hrac:237 | const | ⓘ `window.MMDB && MMDB.ukazkyNacti ? {nacti: () => MMDB.ukazkyNacti(), ul…` |
| `UKPOLL` | 16-srd-ukazky-sezeni-hrac:239 | let | ⓘ `null;` |
| `VAPID_PUB` | 19-karty-beyond:759 | const | ⓘ `"BDxrqAYvVnuc6ZjBR_QsO4jNXbE9vCqZoLGyUtheNCRNRVtVBvtO6IYWzpkGl87UbgB-y…` |
| `VB` | 02-mapa:106 | const | ⓘ `{` |
| `VIEWS` | 08-navigace-pravidla:2 | const | ⓘ `[` |
| `VY` | 22-vyprava:585 | let | ⓘ `null,` |
| `VY_BOXY` | 22b-vyprava:201 | const | ⓘ `{svet: "smapbox", koruna: "kmapbox", praha: "pmapbox"};` |
| `VY_CHCE` | 22b-vyprava:1672 | const | ⓘ `[` |
| `VY_DELKA` | 22-vyprava:21 | const | ⓘ `[` |
| `VY_JM` | 22b-vyprava:1563 | const | ⓐ lidé na cestě |
| `VY_KRAJ` | 22-vyprava:28 | const | ⓘ `{` |
| `VY_LOK` | 22-vyprava:589 | let | ⓘ `false;` |
| `VY_NACTENO` | 22-vyprava:588 | let | ⓘ `false,` |
| `VY_NIZ` | 22-vyprava:367 | const | ⓘ `[` |
| `VY_NOC` | 22b-vyprava:1535 | const | ⓐ noclehy |
| `VY_NOVA` | 22-vyprava:590 | const | ⓘ `() => ({` |
| `VY_ODCH` | 22-vyprava:13 | const | ⓘ `[` |
| `VY_POV` | 22b-vyprava:1654 | const | ⓘ `[` |
| `VY_PRIJ` | 22-vyprava:274 | const | ⓘ `[` |
| `VY_PRIP` | 22-vyprava:69 | const | ⓐ přípravy (SO 13); o = obtížnost cesty při úspěchu, f = při neúspěchu, o5 = při úspěchu o 5 a víc |
| `VY_PRIZ` | 22b-vyprava:1619 | const | ⓘ `[` |
| `VY_REZ` | 22-vyprava:340 | const | ⓘ `{` |
| `VY_ROLE` | 22-vyprava:38 | const | ⓘ `{` |
| `VY_STAV` | 22b-vyprava:1636 | const | ⓘ `[` |
| `VY_TAJ` | 22b-vyprava:1690 | const | ⓘ `[` |
| `VY_TEMPO` | 22-vyprava:20 | const | ⓘ `{normal: ["Běžné tempo", 1], spech: ["Spěch", 0.85], opatrne: ["Opatrn…` |
| `VY_TMAX` | 22-vyprava:330 | const | ⓐ průměry kolem 300 m n. m., o stupeň chladnější než dnes (počátek malé doby ledové) |
| `VY_TMIN` | 22-vyprava:331 | const | ⓘ `[-6, -5, -2, 2, 7, 10, 12, 12, 8, 4, 0, -4];` |
| `VY_TYPY` | 22-vyprava:128 | const | ⓘ `[` |
| `VY_VIRA` | 22b-vyprava:1447 | const | ⓘ `{kal: "kališníci", kat: "katolíci", mix: "smíšené vyznání", isl: "musl…` |
| `VY_VITR` | 22-vyprava:493 | const | ⓘ `["bezvětří", "slabý vítr", "čerstvý vítr", "silný vítr", "vichřice"];` |
| `VY_ZAVOJ` | 22-vyprava:282 | const | ⓘ `[` |
| `VY_ZAZ` | 22-vyprava:267 | const | ⓘ `(() => {` |
| `VY_ZP` | 22-vyprava:6 | const | ⓘ `[` |
| `VYB` | 14d-vybaveni-katalog:4 | let | ⓘ `null,` |
| `VYBBY` | 14d-vybaveni-katalog:6 | const | ⓘ `{},` |
| `VYBF` | 14d-vybaveni-katalog:149 | let | ⓘ `{q: "", sk: "", vz: ""};` |
| `VYBK` | 14d-vybaveni-katalog:134 | let | ⓐ postava, do které se na stránce Vybavení přidává: hráč svou, vypravěč vybranou |
| `VYBN` | 14d-vybaveni-katalog:7 | const | ⓘ `{};` |
| `VYBP` | 14d-vybaveni-katalog:5 | let | ⓘ `null;` |
| `VYBSK` | 14d-vybaveni-katalog:8 | const | ⓘ `[` |
| `VYBSKN` | 14d-vybaveni-katalog:21 | const | ⓘ `Object.fromEntries(VYBSK);` |
| `VYS` | 22-vyprava:587 | let | ⓘ `null,` |
| `VYT` | 22-vyprava:586 | let | ⓘ `null,` |
| `VYZAZ` | 22-vyprava:266 | const | ⓘ `[];` |
| `VYZODP` | 16-srd-ukazky-sezeni-hrac:1079 | let | ⓘ `0;` |
| `VYZVID` | 16-srd-ukazky-sezeni-hrac:1078 | let | ⓘ `0,` |
| `VYZVY` | 16-srd-ukazky-sezeni-hrac:1077 | let | ⓘ `[],` |
| `ZAPISY` | 07-druzina-kronika:80 | var | ⓘ `[];` |
| `ZBY` | 07-druzina-kronika:84 | var | ⓘ `Object.fromEntries(ZAPISY.map(z => [z.id, z]));` |
| `ZEMEPIS` | 01-zaklad:5 | const | ⓐ zeměpis: královská města a sídla církevních vrchností jsou na mapě vždy, i když družina rod nezná |
| `ZMENY` | 23-potvrzovani:252 | var | ⓘ `[],` |
| `ZMFLT` | 23-potvrzovani:254 | var | ⓘ `"vse";` |
| `ZMOD` | 23-potvrzovani:253 | var | ⓘ `"6h",` |
| `ZMPOLE` | 23-potvrzovani:255 | var | ⓘ `{` |
| `ZPR` | 16-srd-ukazky-sezeni-hrac:1246 | let | ⓘ `[],` |
| `ZPRG` | 16-srd-ukazky-sezeni-hrac:1247 | let | ⓘ `[],` |
| `ZPRK` | 16-srd-ukazky-sezeni-hrac:1248 | let | ⓘ `"";` |
