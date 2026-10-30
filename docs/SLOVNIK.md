# Slovník zkratek a globálních konstant

Generuje `npm run mapa` – **neupravuj ručně**. Významy ručně psané jsou v `docs/slovnik.json` (jméno → význam; doplň, když něco
rozluštíš); ostatní popisy bere skript z komentáře u definice (ⓐ) nebo z jejího začátku (ⓘ). Jen jména VELKÝMI písmeny;
funkce a běžné proměnné najdeš `node testy/kontrola_kodu.mjs --kde JMÉNO` nebo grepem.

| jméno | kde | druh | význam |
|---|---|---|---|
| `AIMG` | 03-artikule:2 | const | Artikule: cesta ke složce obrázků ("art/") pro ilustrace kapitol |
| `AK` | 03-artikule:1014 | const | Artikule: kapitoly podle id (z ARTK) – rychlé hledání kapitoly |
| `AL` | 07-druzina-kronika:1286 | const | automatické odkazy (autolink): slovník pojmů → cíl a společný regulární výraz pro prolinkování textů |
| `AL_SKIP` | 07-druzina-kronika:1377 | const | autolink: CSS selektory prvků, v nichž se odkazy nevkládají (nadpisy, tlačítka, formuláře…) |
| `ARMS` | 01-zaklad:307 | const | erby rodů podle id rodu (z buildu, značka @ARMS@) – cesty k obrázkům erbů |
| `ARTB` | 03-artikule:215 | const | Artikule: seznam knih (Víra, Boj, Rány, Rejstřík) s názvem a popisem |
| `ARTK` | 03-artikule:221 | const | Artikule: seznam kapitol (id, kniha, název, obrázek, shrnutí, citát, text) |
| `BAB` | 12-boj-tah-postavy:2 | const | Boj: pořadí šesti vlastností STR AGI CON INT WIS CHA (záchrany, ověření, panely karty) |
| `BACRE` | 11-boj:524 | const | Boj: regulární výraz „číslo (text)“ ve statblocku – doplňování popisků k hodnotám v závorce |
| `BADV` | 11-boj:1145 | const | Boj: volba výhody/nevýhody útoku nepřítele podle id (chybí = auto podle stavů) |
| `BAKCE` | 12-boj-tah-postavy:1115 | const | ⓐ akce v boji (SRD 5.2.1, česky zkráceně) a doplnění z Artikulí |
| `BAZINY` | 02-mapa:5634 | const | ⓘ `[` |
| `BBARVY` | 11-boj:421 | const | ⓐ medailony: družina kruhové (portrét z karty postavy), NPC čtvercové v barvě skupiny (portrét osoby, jinak monogram) |
| `BCIL` | 11-boj:1143 | const | Boj: zvolený cíl útoku nepřítele podle id nepřítele – pamatuje se mezi překresleními |
| `BCILL` | 11-boj:1144 | const | ⓘ `{},` |
| `BCIM` | 12-boj-tah-postavy:773 | const | Boj: „čím“ – poslední zapsaná zbraň/kouzlo útoku podle jména útočníka (předvyplnění pole „čím“ u nepřítele) |
| `BCIMZ` | 12-boj-tah-postavy:775 | const | Boj: seznam běžných zbraní (Dlouhý meč, Tesák, Kuše…) pro datalist pole „čím“ u útoku na nepřítele |
| `BDM` | 14-karty-bojova-karta:1434 | const | Bojová karta (bdm): stav rozložení – otevřené sekce (sec, localStorage), list útoku (sheet), rozbalené hlavičky (hlo), filtry akcí/kouzel (af, kf), fokus, rozbalené útoky (utx) |
| `BDMAF` | 14-karty-bojova-karta:1637 | const | Bojová karta: pod-karty oddílu Akce – [klíč, popisek]: A Akce, BA Bonusová, R Reakce, omez Omezené |
| `BDMG` | 12-boj-tah-postavy:89 | const | Boj: poslední zranění nepřítele podle id – {k: kolo, t: [typy zranění]}; brání regeneraci po Fire/Radiant |
| `BDMI` | 14-karty-bojova-karta:1400 | const | Bojová karta: SVG cesty linkových ikonek (Společníci, dopis, oheň, kolo, slunce, d20, svitek, meč, šíp) podle klíče; ostatní záložky mají malované štíty (BDMSTITY) |
| `BDMS` | 14-karty-bojova-karta:1423 | const | ⓐ oddíly (2026-10-22): Info i Duše jsou pryč – smysly a zdatnosti ve Statistikách, duše, rány a účinky v listu Svědomí; Záznam = hody hráče |
| `BDMSTIT` | 14-karty-bojova-karta:1797 | const | ⓘ `'<svg viewBox="0 0 24 26" aria-hidden="true"><path d="M12 1.5l9 3.2v6.…` |
| `BDMSTITY` | 14-karty-bojova-karta:1417 | const | ⓘ `new Set(["vl", "akce", "kouzla", "vyb", "rysy", "denik", "zaznam", "pr…` |
| `BDMSW` | 14-karty-bojova-karta:2502 | const | ⓐ přejetí prstem: po těle karty další / předchozí záložka, po hlavě listu dolů zavře list |
| `BDMVLZ` | 14-karty-bojova-karta:1796 | const | ⓘ `{STR: "STR", DEX: "DEX", CON: "CON", INT: "INT", WIS: "WIS", CHA: "CHA…` |
| `BDMZV` | 14-karty-bojova-karta:1563 | const | ⓐ vlastnosti zbraní podle Artikulí (Zbraně) – podle druhu zbraně v názvu útoku |
| `BDOS` | 11-boj:736 | const | Boj: kolik pacholků houfu dosáhne na cíl podle id houfu (ovlivňuje zranění) |
| `BDRIC` | 11-boj:459 | const | Boj: druh nepřítele (houf, pacholek, sok, zhoubce) → název jeho ikony |
| `BDRUH` | 10p-pravidla:88 | const | Boj: druh nepřítele → český popisek (Houf pacholků, Pacholek, Sok, Zhoubce) |
| `BDRUZ` | 20d-boj-render:337 | const | Boj render: HTML kostra strany Družina (hráči, cíle, spojenci, přidání) pro hráčské rozvržení |
| `BDRUZ_G` | 20d-boj-render:340 | const | Boj render: varianta BDRUZ pro vypravěče – bez cílů boje, s přidáváním nepřátel dole |
| `BFR` | 11-boj:2340 | const | Boj: fronta zápisů hráče bez signálu v localStorage (klíč, čtení, zápis, odeslání až online) |
| `BFV` | 20d-boj-render:530 | const | ⓘ `new Map();` |
| `BFVKLIK` | 20d-boj-render:531 | let | ⓘ `0;` |
| `BGLP` | 20d-boj-render:346 | let | ⓐ záznam se u hráče i vypravěče obnovuje: hody z karet (i hody hráčů z telefonu) každé 4 s, dokud je Boj otevřený |
| `BGMU` | 14-karty-bojova-karta:159 | const | Boj: formuláře útoku, které vypravěč vyplňuje za hráče, podle id hráče (hráč má totéž v BJU) |
| `BHIST` | 11-boj:1081 | const | Boj: historie snímků stavu boje s časem (vypravěč) – „Zpět“ u řádku záznamu |
| `BHLED` | 11-boj:1918 | let | Boj: aktuální hledaný text v bestiáři (jméno, zbraň, štítek) |
| `BHP0` | 20b-boj-vypravec:1083 | let | Boj (vypravěč): hodnota pole životů před editací – {hp: snímek životů, v: původní číslo} pro Zpět a rozdíl |
| `BHPT` | 14-karty-bojova-karta:163 | const | Bojová karta: zvolený typ zranění (Slashing, Fire…) pro pole životů v hlavičce podle id hráče – započtou se odolnosti |
| `BHRAH` | 20d-boj-render:523 | const | ⓐ hráčská Hra mimo boj: poslední vykreslené HTML karty a jeho prvek – stejné HTML se znovu nevkládá |
| `BHROTV` | 11-boj:2534 | const | Boj: id hráčů s rozbaleným řádkem v seznamu účastníků (vypravěč) – přežije překreslení |
| `BHSEEN` | 11-boj:1082 | const | Boj: čas prvního zobrazení řádku záznamu podle id (vypravěč) – značka pro herní záznam |
| `BIC` | 11-boj:9 | const | Boj: vektorové ikony stavů a značek (název → SVG path) kreslené v kódu |
| `BICW` | 11-boj:169 | const | Boj: paměť „chvějících se“ verzí ikon BIC (název → převzorkované SVG), aby se nepočítaly znovu |
| `BIMG` | 11-boj:99 | const | ⓐ malované ikony (art/img/boj, 48/96 px) – ostatní klíče zůstávají vektorové s ručně kresleným chvěním (filtr #bwob) |
| `BINIV` | 14c-boj-reakce:478 | let | Boj: id výzev k iniciativě vyslaných hráčům, jejichž odpovědi vypravěčovo zařízení zpracuje a zapíše do slotů |
| `BJENBOJ` | 12-boj-tah-postavy:1778 | const | ⓐ stavy, které platí jen v boji: s koncem boje z karty zmizí (i stavy z účinků boje) |
| `BJK` | 20-boj-hraci:817 | const | Boj hráč: soustředění – d = utržené zranění předvyplněné do záchrany na soustředění (CON), vymaže se po hodu |
| `BJR` | 11-boj:1146 | const | Boj: příznak „další útok nepřítele je reakce“ podle id nepřítele (příležitostný útok, Křížný sek) |
| `BJSPN` | 20-boj-hraci:302 | let | Boj hráč: příznak, že už bylo zahájeno načítání popisů kouzel (KSPD) – aby se nespouštělo opakovaně |
| `BJU` | 20-boj-hraci:4 | const | ⓐ hráč: formulář útoku (stav formuláře přežije překreslení) |
| `BJUK` | 20-boj-hraci:31 | const | Boj hráč: klíč localStorage „mm-bju“ pro uložení rozehraného formuláře útoku (BJU) v telefonu |
| `BKART` | 11-boj:1880 | const | Boj: ruční výběr rozbalené karty účastníka podle id (true vybere, false u toho na tahu = nic) |
| `BKARTK` | 11-boj:1881 | let | Boj: klíč „kolo:tah“, pro který platí ruční výběr karty BKART – při změně tahu se výběr smaže |
| `BKBT` | 20b-boj-vypravec:1143 | let | Boj (vypravěč): timeout hlášení klávesové zkratky „číslice + Enter = zranění vybraného nepřítele“ |
| `BKBUF` | 20b-boj-vypravec:1142 | let | Boj (vypravěč): buffer číslic napsaných klávesnicí (zranění vybraného nepřítele), Enter potvrdí, Esc zruší |
| `BKDO` | 12-boj-tah-postavy:774 | let | Boj: „kdo“ – poslední zvolený útočník ve formuláři útoku na nepřítele (select kdo útočí) |
| `BKON` | 11-boj:2532 | let | Boj: zobrazuje se shrnutí po skončení boje (vypravěč) – přepíná se tlačítkem Konec |
| `BKONC` | 12-boj-tah-postavy:769 | const | ⓐ Concentration: zranění soustředěné bytosti vyžaduje CON záchranu, DC 10 nebo polovina zranění (nejvýš 30) |
| `BKONV` | 14c-boj-reakce:69 | const | ⓐ soustředění postavy po zásahu (2026-10-18): hráči vyskočí výzva k CON záchraně, hodí si ji sám; neúspěch ukončí soustředění |
| `BKONZ` | 11-boj:2838 | const | Boj: id karet, u nichž právě probíhá ztráta soustředění (Concentration) – ochrana před dvojím hlášením |
| `BKORK` | 16-srd-ukazky-sezeni-hrac:632 | const | Kořist: komu z družiny připadne položka kořisti (klíč položky → id karty), rozdělení do vybavení |
| `BKORX` | 12-boj-tah-postavy:1265 | const | Boj: klíče položek kořisti odškrtnutých vypravěčem (nepřidávat do podkladů zápisu ani k rozdělení) |
| `BKOSTRA` | 20d-boj-render:341 | const | Boj render: HTML kostra celého Boje pro vypravěče (hlavička, osa, plošný zásah, sloupce Karta/Nepřátelé/Družina/Záznam) |
| `BKOSTRA_H` | 20d-boj-render:356 | const | Boj render: HTML kostra Boje pro hráče – Moje karta, Nepřátelé, Družina, Herní záznam |
| `BKPAD` | 12-boj-tah-postavy:770 | const | Boj: padlí nepřátelé podle id – {pod: HP pod nulou, druh: druh zbraně} pro hod na kritické zranění v kartě |
| `BKRIT` | 11-boj:2154 | const | Boj: tabulky kritických zranění podle druhu (fyz, …): místa zásahu d6 a následky podle závažnosti |
| `BKRLOG` | 12-boj-tah-postavy:1317 | const | ⓐ návrh zápisu do Kroniky z průběhu boje (skryté cíle vynechá) |
| `BKRO` | 12-boj-tah-postavy:1152 | let | ⓘ `false;` |
| `BKS` | 11-boj:2241 | const | Boj: stav formuláře kritického zranění (druh, počet ran, podíl HP, výsledek, komu) |
| `BKZ` | 11-boj:2147 | const | Boj: stupně kritického zranění (Lehká, Těžká, Vážná, Smrtelná) |
| `BKZAB` | 12-boj-tah-postavy:870 | const | Boj: kouzlo NPC – mapování českých skloňovaných názvů vlastností (inteligenci, moudrost, charismu) na INT/WIS/CHA |
| `BKZT` | 11-boj:2148 | const | Boj: trvání kritického zranění pro každý stupeň BKZ (do konce tahu … trvalé) |
| `BKZW` | 12-boj-tah-postavy:864 | let | Boj: příznak, že se už načítá databáze kouzel KZ (kzNacti) pro kouzla NPC – jen jednou |
| `BLF` | 20b-boj-vypravec:767 | let | ⓐ filtr záznamu a Zpět ze záznamu |
| `BLIM` | 10p-pravidla:87 | const | Boj: kolikrát za kolo smí nepřítel daného druhu jednat (houf 1, pacholek 1, sok 2, zhoubce 3) |
| `BLOG` | 11-boj:737 | const | ⓐ rozbalené části, počet v dosahu houfu, záznam hodů – přežijí překreslení |
| `BLOGG` | 11-boj:1056 | const | ⓐ záznam hodů: u karty poslední hod jako plaketa, celý průběh v záznamu boje pod družinou |
| `BMAN` | 17-karty-ii:1292 | const | ⓐ manévry, které se přidávají k zásahu: [název, česky, záchrana cíle, následek při neúspěchu] |
| `BMCIS` | 11-boj:1271 | const | Boj: česká číslovka v textu Multiattack („dvakrát“, „tři“) → číslo útoků |
| `BMIMO` | 10p-pravidla:133 | const | ⓘ `["poražen", "prchá", "vzdal se", "rozplynul se"];` |
| `BMQ` | 11-boj:1270 | const | Boj: rozehraný Multiattack podle id nepřítele (pořadí útoků, index, klíč tahu) |
| `BMSTOP` | 11-boj:426 | const | Boj: regulární výraz předložek a členů, které se vynechají při tvorbě monogramu účastníka |
| `BNEPR` | 20d-boj-render:336 | const | Boj render: HTML kostra strany Nepřátelé (obtížnost, seznam NPC, sbalení poražení/prchající) pro hráče |
| `BNEPR_G` | 20d-boj-render:339 | const | ⓐ vypravěč (2026-10-21): cíle boje nahoře u plošného zásahu, přidávání nepřátel až pod družinou (po zahájení boje se používá málo) |
| `BNESCH` | 10p-pravidla:120 | const | ⓐ stavy, které berou akce (2026-10-19): Incapacitated a vše, co ho obsahuje – žádná akce, bonusová akce ani reakce |
| `BNP` | 11-boj:1883 | const | ⓐ karta nepřítele: otevřený panel (ac = obrana, hp = životy, st = stavy) |
| `BNUT` | 11-boj:1266 | const | Boj: čítač útoků v jedné akci („útok 2 z 3“) podle id nepřítele a indexu útoku, s klíčem tahu |
| `BODP` | 11-boj:2533 | let | Boj: družina si po skončeném boji už hodinu odpočinula (posun herního času jen jednou) |
| `BODV` | 20e-boj-vlastnosti:255 | let | Boj hráč: čekající Odvetná – nepřítel minul s Pokušením, {e: záznam, kid, hid, cas}; telefon nabídne protiútok reakcí |
| `BOJ` | 11-boj:2335 | const | Boj: hlavní stav v prohlížeči – s = stav boje z databáze, v = verze, poll = časovač dotazů |
| `BOJPC_MQ` | 14-karty-bojova-karta:2155 | const | ⓘ `matchMedia("(min-width:1280px)");` |
| `BOPV` | 12-boj-tah-postavy:274 | const | ⓐ postava: na konci tahu opakovaná záchrana stavu (výzva na telefon; bez karty připomínka), na začátku tahu odpočet kol |
| `BOSUD` | 12-boj-tah-postavy:1187 | const | ⓐ shrnutí po boji: padlí, zajatí a jejich osud, výkupné, kořist, XP a návrh zápisu do Kroniky |
| `BOSUDP` | 12-boj-tah-postavy:1195 | const | Boj shrnutí: poznámky k osudu zajatce (vykupne, propusten, popraven) – výkupné, Laskavost, smrtelný hřích |
| `BOTV` | 11-boj:735 | const | Boj: klíče rozbalených <details> (statblock, ruční zadání, přidat věc) – přežijí překreslení |
| `BPACH_HP` | 10p-pravidla:170 | const | ⓐ pacholek má 5 HP (Vojta 2026-10-22); zranění přetéká na dalšího – houf si pamatuje zranění předního pacholka (n.hz) |
| `BPCZ` | 12-boj-tah-postavy:1686 | const | Boj: časové značky (o.t) zranění postav už zapsaných z plakety vypravěče – tlačítko „Zapsat zranění“ se neukáže znovu |
| `BPLOS` | 12-boj-tah-postavy:90 | let | Boj (vypravěč): rozpracovaný plošný zásah – {dc, cile, zranění…} před hodem záchran a odesláním výzvy |
| `BPLV` | 14c-boj-reakce:477 | const | ⓐ plošný zásah a iniciativa výzvou: odpovědi hráčů zpracuje vypravěčovo zařízení samo |
| `BPORT` | 14-karty-bojova-karta:700 | const | ⓐ Věštec – Portent (2026-10-22): předzvěst místo d20 se zvolí před hodem; chip ji vyplní jako ruční d20, hod ji pak z karty odebere |
| `BPOU` | 14c-boj-reakce:266 | let | ⓘ `null;` |
| `BPRAV` | 12-boj-tah-postavy:1151 | let | ⓘ `false,` |
| `BPRI` | 14c-boj-reakce:207 | let | ⓘ `null;` |
| `BPROT` | 17b-kouzla-ucinky:563 | const | Boj: čekající Counterspell – podle id výzvy {nid NPC, xi index kouzla, zn, dal, map karta→hráč, n, sp} než hráči odpoví |
| `BPT` | 16-srd-ukazky-sezeni-hrac:1859 | const | Boj hráč: Průvodce tahem – k = klíč kolo:tah, p/a/b = pohyb/akce/bonusová odškrtnuty, dle id checkboxu |
| `BRC` | 20d-boj-render:331 | const | ⓐ kostra aktivního boje: bloky se klíčem, překreslí se jen ty, jejichž obsah se změnil |
| `BRCH` | 12-boj-tah-postavy:87 | const | Boj: Recharge schopnosti NPC podle id – {název: 1} = použitá, na začátku tahu se hází k6 na dobití |
| `BRIDBEZ` | 20c-boj-ridery:134 | const | ⓐ přídavky bez kostek (perk, mistrovství, útok navíc): u zvoleného jen ✓ |
| `BRIP` | 14c-boj-reakce:164 | let | ⓐ Riposte (Battle Master): nepřítel tě minul útokem na blízko → nabídka odvety; viděná minutí si telefon pamatuje (2026-10-20) |
| `BRT` | 11-boj:3078 | const | Boj: stav Realtime spojení se Supabase (ok, websocket, čas dalšího pokusu) |
| `BRUC` | 14-karty-bojova-karta:674 | const | ⓐ hráč: „Zadat ručně“ – kostky hozené u stolu (d20, d6 Závoje, kostky zranění); prázdné pole hodí web |
| `BSCJ` | 20f-scena:210 | const | ⓘ `(() => {` |
| `BSEL` | 20b-boj-vypravec:1141 | let | ⓐ klávesy v Boji (vypravěč): mezerník další tah, Shift+mezerník zpět o slot, číslice + Enter zranění vybraného nepřítele, Ctrl+Z zpět |
| `BSIKALT` | 14-karty-bojova-karta:760 | const | Bojová karta: Šikovná zbraň – náhradní typ zranění (Slashing↔Piercing, Bludgeoning→Piercing) |
| `BSK` | 11-boj:614 | const | ⓐ uložené skupiny nepřátel (jen v prohlížeči vypravěče) a hotová setkání z databáze |
| `BSMPO` | 20c-boj-ridery:240 | const | ⓘ `{};` |
| `BSNAPC` | 11-boj:1078 | let | Boj: snímek stavu před posledním klikem vypravěče (čas + snap) – „před“ pro řádek záznamu |
| `BSPSTCZ` | 12-boj-tah-postavy:160 | const | ⓘ `[` |
| `BSTAV` | 11-boj:267 | const | ⓐ stavy nepřátel: ikonka a popisek |
| `BSTAVD` | 11-boj:479 | const | Boj: anglický stav (Prone, Restrained…) → český popis účinků pro popisek při najetí |
| `BSTAVH` | 11-boj:294 | const | ⓐ stavy postav, které si hráč nastaví z telefonu (nebo vypravěč v seznamu družiny) – počítá s nimi návrh výhody |
| `BSTC` | 11-boj:1863 | const | ⓐ statblock s vysvětlivkami se počítá až při prvním otevření a pamatuje se |
| `BSTHP` | 12-boj-tah-postavy:1384 | const | Boj: popisky stavů pro hráče (krvácí k6, sražen, omráčen…) → věta s pravidlem v popisku; doplní se ze SRDST a BSTI |
| `BSTI` | 11-boj:314 | const | Boj: české stavy účastníků (zraněn, krvácí, sražen…) → [ikona, popisek] |
| `BTAB` | 20d-boj-render:361 | let | ⓐ záložky na mobilu: Karta / Účastníci / Záznam (na širší obrazovce jsou sloupce vedle sebe a záložky schované) |
| `BTABH` | 14-karty-bojova-karta:162 | const | Bojová karta: zvolená záložka (utok, kouzla…) na kartě hráče v Boji podle id hráče |
| `BTEC` | 11-boj:461 | const | ⓐ vlastnosti zbraní a zbrojí, techniky, chvaty a stavy: vysvětlení při najetí myší (Artikule › Výzbroj, Šerm a zápas) |
| `BTHZ` | 12-boj-tah-postavy:95 | const | ⓘ `new Map();` |
| `BTICHO` | 12-boj-tah-postavy:94 | let | ⓘ `false;` |
| `BTIP` | 11-boj:497 | const | Boj: slovník pojmů pro popisky (vlastnosti zbraní BVLZ, techniky BTEC, stavy BSTAVD) → text |
| `BTIPRE` | 11-boj:503 | const | Boj: regulární výraz všech klíčů BTIP (nejdelší první) – hledá pojmy v textu statblocku |
| `BTMSG` | 12-boj-tah-postavy:88 | const | Boj: hlášení ke začátku tahu nepřítele podle id (nejvýš 6 řádků) – dobití, konec účinků, regenerace |
| `BTT` | 11-boj:554 | const | ⓐ plovoucí popisek: myš, dotyk (na chvíli) i klávesnice |
| `BUEF` | 20b-boj-vypravec:102 | const | Boj: prefix „Účinek: “ v poli čím – hráč posílá účinek kouzla bez hodu (Hex, Hunter's Mark) jako útok, vypravěč potvrdí |
| `BUNDO` | 11-boj:2756 | const | ⓐ zpět: poslední změny boje (stav i životy), nejvýš 40 kroků |
| `BUTT` | 11-boj:1142 | const | ⓐ BCILL (2026-10-28, Vojta): víc cílů najednou – seznam cílů v režimu „víc cílů“; BCIL drží první z nich (zbytek kódu čte jen BCIL) |
| `BUTYP` | 14-karty-bojova-karta:672 | const | ⓐ před hodem na útok (2026-10-17): cíl, výhoda/nevýhoda a u zbraní s vlastností Šikovná typ zranění |
| `BUTZP` | 20b-boj-vypravec:340 | const | Boj (vypravěč): id útoků hráčů právě zpracovávaných potvrzením – proti dvojímu potvrzení |
| `BUVC` | 20b-boj-vypravec:158 | const | Boj (vypravěč): cache vyhodnocení útoku hráče podle id+cíle – náhled i zápis používají tytéž kostky (max 200) |
| `BVID` | 20-boj-hraci:829 | const | Boj hráč: „viděno“ – nejvyšší timestamp řádku záznamu, který telefon už hlásil (localStorage mm-boj-videno), společné všem hlídačům |
| `BVLZ` | 02-mapa:7493 | const | Boj: vlastnost zbraně podle Artikulí (Krvežíznivá, Drtivá…) → popis Požehnání/Pokušení |
| `BWL` | 20-boj-hraci:915 | const | ⓐ hráč: během boje drž obrazovku telefonu rozsvícenou |
| `BWMIK` | 20g-boj-mistrovstvi:11 | const | ⓘ `{` |
| `BWMVOL` | 20g-boj-mistrovstvi:10 | const | ⓘ `{Topple: 1, Push: 1, Slow: 1};` |
| `BX` | 11-boj:3161 | const | ⓐ řádek nepřítele či spojence ve formuláři; skrytá pole nesou statblock, přívlastky a osobu |
| `BXPT` | 11-boj:2053 | const | Boj: rozpočet XP na postavu podle úrovně 1–20 (nízká/střední/vysoká obtížnost, D&D 2024) |
| `BZ` | 11-boj:2792 | const | Boj: fronta změn boje k uložení (q funkce, cek čekající promisy, t časovač, beh běží) |
| `BZ_OKNO` | 24-boj-zaznam:6 | const | Boj záznam: okno 10 minut (ms) pro spárování hodu z karty s vyhodnocením vypravěče do jednoho řádku |
| `BZAPT` | 12-boj-tah-postavy:1266 | let | Boj: text návrhu zápisu do Kroniky upravený vypravěčem (null = vygenerovat znovu z bojZapisNavrh) |
| `BZAS` | 14c-boj-reakce:88 | let | ⓐ hráč: nový zásah na mou postavu ve veřejném záznamu boje → hlášení, vibrace, soustředění, nabídka reakcí |
| `BZAZQ` | 20b-boj-vypravec:45 | const | ⓐ veřejný záznam: kdo, komu, čím, výsledek; zranění jen u zásahů postav a spojenců, nikdy životy a AC nepřátel |
| `BZBK` | 02-mapa:7556 | const | Boj: název zbroje (Vycpávaná, Kroužková…) → klíč ikony zbroje (zb-…) |
| `BZBR` | 02c-zbroj:6 | const | Boj: druh zbroje → [typy zranění s Resistance, kolikrát lze zbroj obětovat při kritickém zásahu] |
| `BZBRN` | 12-boj-tah-postavy:1226 | const | ⓐ kořist: zbroj z AC, zbraně z útoků (ne drápy a kouzla), u houfu krát padlí a zajatí; poškozená obětováním zbroj k opravě |
| `BZBRRE` | 11-boj:510 | const | Boj: regulární výraz názvů zbrojí v textu (vycpávan-, kroužkov-…) – doplnění popisku zbroje |
| `BZDC` | 12-boj-tah-postavy:772 | const | Boj: poslední zadané SO záchrany nepřítele podle id (pole data-bzdc u hodu záchrany) |
| `BZMAP` | 24-boj-zaznam:11 | const | ⓘ `new Map();` |
| `BZNAC` | 20-boj-hraci:398 | const | ⓐ Hex a Hunter's Mark: přídavek se přičte sám proti nepříteli se značkou od této postavy (a jen proti němu, když postava nějakou značku má) |
| `BZNACP` | 20c-boj-ridery:310 | const | ⓐ Hex / Hunter's Mark: když označený cíl padne (nebo zmizí z boje), karta nabídne přenést značku bonusovou akcí na jiného nepřítele |
| `BZNADV` | 20-boj-hraci:304 | const | ⓐ značky kouzel na nepříteli, které dávají výhodu na útoky proti němu (2026-10-22); Guiding Bolt se uloží zásahem (20b) |
| `BZRPOD` | 12-boj-tah-postavy:1840 | var | Boj: HP pod nulou po posledním zranění postavy (bojZranPC) – čte se pro hod na kritické zranění |
| `BZRRE` | 11-boj:522 | const | Boj: regulární výraz typů zranění (Bludgeoning, Fire…) a Svaté/Prokleté v textu – ikony a popisky |
| `BZRSL` | 11-boj:2806 | const | Boj: zdraví soka slovy pro hráče podle stupně 0–3 ([text, CSS třída]) – čísla HP hráč nevidí |
| `BZRT` | 02-mapa:7541 | const | Boj: anglický typ zranění → český název (Bludgeoning → Drtivé) |
| `BZRWB` | 12-boj-tah-postavy:1843 | let | ⓘ `0;` |
| `BZTL` | 12-boj-tah-postavy:771 | const | Boj: typ posledního zranění nepřítele podle id – {t: typ, drt: Drtivá, pru: Průrazná} pro druh kritického zranění |
| `BZTYPY` | 20b-boj-vypravec:4 | const | Boj: seznam anglických typů zranění (Slashing, Piercing, Fire…) pro selecty typu zranění |
| `BZUND` | 11-boj:1083 | const | Boj: časové rozsahy řádků záznamu vrácených „Zpět“ – v záznamu se zašedí |
| `BZUPRV` | 24-boj-zaznam:70 | const | ⓘ `{zasah: ["zásah", "bzhit"], krit: ["kritický zásah", "bzkr"], vedle: […` |
| `BZVAKT` | 20e-boj-vlastnosti:8 | const | Boj: vlastnosti zbraní z Artikulí (Krvežíznivá, Omračující, Ničivá, Odvetná, Přibodnutí…) – poz = Požehnání, kom = komplikace Pokušení |
| `BZVK` | 02-mapa:7522 | const | ⓐ malované ikony vlastností zbraní (zv-), typů zranění (zr-) a zbrojí (zb-) – art/img/boj, zadání vyvoj/ikony-boj.md |
| `BZVL` | 12-boj-tah-postavy:1228 | const | Boj: regex názvů vlastností zbraní (Ostrá, Drtivá, Šikovná, Lehká, Těžká…) – poznání zbraně NPC v kořisti |
| `BZVST` | 11-boj:356 | const | ⓐ stavy z vlastností zbraní (Artikule › Zbraně, 2026-10-20): ikona = štítek vlastnosti; ut/cil jako u SRD stavů (cil "dym" = nevýhoda jen zblí… |
| `BZVV` | 20e-boj-vlastnosti:295 | const | Boj: čekající výzvy záchrany proti vlastnosti zbraně nepřítele podle id výzvy – {hid, kid, dc, p vlastnost, nid} |
| `BZVYS` | 24-boj-zaznam:272 | const | ⓐ výsledek útoku jako ikonka: hvězda = zásah, X = vedle, v prstenci = přirozená 20 / 1; text zůstává v popisku |
| `BZZBR` | 24-boj-zaznam:276 | const | Boj záznam: [ikona, regex názvu] – zbraň/kouzlo podle názvu útoku → ikonka (kuse, luk, mec, drap…) |
| `CARMS` | 01-zaklad:308 | const | erby měst (Brno, Kutná Hora, Plzeň, Praha, Vratislav) → cesta k obrázku |
| `CASTLEICO` | 01-zaklad:181 | const | mapa: cesta k ikoně hradu pro sídla rodů, která nejsou městy |
| `CESTA_ODCH` | 09-vypravec-herni-cas:314 | const | Výprava/herní čas: odchylky délky cesty od odhadu ([násobek, popis]) pro formulář cesty |
| `CESTA_ZP` | 09-vypravec-herni-cas:308 | const | Výprava/herní čas: způsoby cestování ([id, název, km za den]: pěšky, na koni, s vozem, posel) |
| `CHYBY` | 16-srd-ukazky-sezeni-hrac:1632 | let | ⓐ chyby webu z prohlížečů hráčů i vypravěče (mm_chyba, 01) – načtou se při prvním otevření záložky Sezení |
| `CITYINFO` | 02g-mista:4 | const | mapa: popisy měst podle názvu (n = text, t = typ) pro detail města |
| `CMOSTY` | 09-vypravec-herni-cas:333 | const | Výprava: stálé mosty roku 1458 ([město, lon, lat, řeka]) – přechod řeky bez brodu |
| `CMYTA` | 09-vypravec-herni-cas:340 | const | Výprava: známá mýtná místa ([název, lon, lat, popis]) na cestě družiny |
| `CONFN` | 01-zaklad:171 | const | vyznání (kat, kal, mix, isl) → český název (katolíci, kališníci…) |
| `CTYPE` | 02-mapa:2504 | const | mapa: id rodu-města → typ města (Královské město, Zeměpanské město…) pro detail |
| `DCU` | 17-karty-ii:4 | const | ⓐ typ: "discord" nebo "email" (účet s heslem) |
| `DEG` | 07-druzina-kronika:762 | const | ⓐ hodiny Závoje na úvodu: 24 hodin (pravý sluneční čas Prahy), poledne nahoře, půlnoc dole |
| `DF` | 02-mapa:6351 | const | ⓐ desky: filters + list view |
| `DIO` | 02-mapa:2709 | const | mapa: diecéze (id, barva, název, sídlo, poznámka) pro vrstvu církevní správy |
| `DIO_ORDER` | 02-mapa:3182 | const | mapa: pořadí kreslení polygonů diecézí (od vnějších k vnitřním) |
| `DIO_POLY` | 02b-mapa-kresba:2328 | const | kresba mapy: polygony diecézí podle id (souřadnice lon/lat) |
| `DISC` | 07-druzina-kronika:86 | var | Družina: objevená místa z buildu (@MISTA@) – vrstva Družina na mapě, odhalení vypravěče |
| `DNY` | 07-druzina-kronika:595 | const | kalendář: názvy dnů v týdnu (neděle…sobota) podle indexu 0–6 |
| `DNYV` | 07-druzina-kronika:710 | const | kalendář: dny v týdnu s předložkou („v neděli“, „ve středu“) pro starou dataci zápisů |
| `DOMAIN` | 02-mapa:4434 | const | mapa: panství rodů (id rodu, barva „odstín:varianta“ nebo city, poloha popisku, šířka) pro vrstvu držav |
| `DOMAIN_POLY` | 02b-mapa-kresba:4845 | const | kresba mapy: polygony držav rodů podle id rodu |
| `DRACI` | 06-draconomicon-rodokmeny:2 | const | Draconomicon: data z buildu (@DRACI@) – kapitoly (kap) a dračí plemena (pl) |
| `DRAK_T` | 07-druzina-kronika:1075 | const | Úvod: stav dráčka (bdí, spí, svátek, neklid, pravda) → popisek pro obrázek |
| `DRBY` | 06-draconomicon-rodokmeny:15 | const | Draconomicon: id → {k: kap|pl, o: objekt} – hledání kapitoly nebo plemene podle hashe |
| `DUCH_NOLBL` | 02-mapa:4485 | const | kresba mapy: id zemí (kcz, mor, hun…), u nichž se nekreslí popisek vrstvy zemí |
| `DUCHY` | 02-mapa:3274 | const | mapa: země Koruny a sousedé (id, název, zkratka, hlava, poznámka, barva, poloha popisku) |
| `DUCHY_POLY` | 02b-mapa-kresba:7888 | const | kresba mapy: polygony zemí podle id (kcz, mor…) |
| `ECOL` | 02-mapa:6604 | const | graf vazeb: typ vazby (rod, spoj, spor) → barva hrany (CSS proměnná) |
| `ED` | 21-editor-pecet:6 | const | Editor (Pečeť): stav – z = načtené zdrojové soubory (obsah md), idx = index souborů podle druh:id |
| `EDDLOUHE` | 21-editor-pecet:155 | const | Editor: klíče frontmatteru editované jako víceřádkový textarea (hlava, postoj, historie, note, utok…) |
| `EDDRUH` | 21-editor-pecet:7 | const | Editor: druhy záznamů (osoba, rod, zapis, setkani…) – {dir adresář, kl klíč, n název, tpl šablona md} |
| `EDGES` | 02-mapa:6502 | const | graf vazeb: hrany mezi rody ({a, b, t typ, ri index vazby}) odvozené z REL |
| `EDPOLE` | 21-editor-pecet:72 | const | Editor: české popisky polí frontmatteru (id, jmeno, rod, sidlo, vyznani…) ve formuláři |
| `EMPTY` | 02-mapa:6078 | const | Zemské desky: HTML prázdného detailu („Vyberte rod na mapě…“), když není nic vybráno |
| `FAM` | 01-zaklad:2 | const | rody z buildu (@FAM@) – základní data rodů (id, název, sídla, vyznání, texty) |
| `FEATY` | 08-navigace-pravidla:372 | let | ⓘ `null,` |
| `FEATYKAT` | 08-navigace-pravidla:392 | const | ⓘ `{` |
| `FEATYP` | 08-navigace-pravidla:373 | let | ⓘ `null;` |
| `FICON` | 01-zaklad:172 | const | vyznání (kat, kal, mix, isl) → cesta k ikoně víry |
| `FORESTS` | 02-mapa:5013 | const | mapa: polygony lesů (lon/lat) pro vrstvu lesů |
| `FORLBL` | 02b-mapa-kresba:13983 | const | kresba mapy: popisky lesů a pohoří ([název, lon, lat, natočení]) |
| `GCH` | 03-artikule:202 | const | Artikule: id kapitoly → název pro odkazy ze slovníčku pojmů (GLOSS) |
| `GENCHCE` | 09g-generator-postav:123 | const | ⓘ `[` |
| `GENJAZ` | 09g-generator-postav:145 | const | ⓘ `{cs: "česky", de: "německy", hu: "uhersky", pl: "polsky"};` |
| `GENJM` | 09g-generator-postav:4 | const | ⓘ `{` |
| `GENPOVAHA` | 09g-generator-postav:77 | const | ⓐ povaha, vzhled a přání: {mužský\|ženský} tvar podle pohlaví postavy (genRod) |
| `GENREMESLO` | 09g-generator-postav:72 | const | ⓘ `{` |
| `GENSTAV` | 09g-generator-postav:55 | const | ⓐ stavy: [mužský název, ženský název, statblok SRD (Do scény), mesto (město, ne venkov), d (šlechta), k (duchovní), věk od–do] |
| `GENVIRA` | 09g-generator-postav:144 | const | ⓘ `["kališník", "katolík", "kolísá mezi oběma stranami"];` |
| `GENVZHLED` | 09g-generator-postav:103 | const | ⓘ `[` |
| `GENZEME` | 09g-generator-postav:46 | const | ⓐ země: [název, podíly jazyků na venkově, podíly ve městech, podíly vyznání [kališník, katolík, kolísající]] |
| `GH` | 02-mapa:6508 | const | graf vazeb: výška kreslicí plochy SVG (640) |
| `GIDS` | 02-mapa:6506 | const | graf vazeb: id rodů, které mají aspoň jednu vazbu a existují v FAM – uzly grafu |
| `GIDX` | 07-druzina-kronika:1549 | const | hledání na celém webu: rejstřík položek (druh, název, popis, odkaz, normalizovaný text) |
| `GIDXH` | 07-druzina-kronika:1550 | let | ⓘ `false;` |
| `GINFO0` | 02-mapa:6665 | const | graf vazeb: původní HTML panelu #ginfo – obnoví se po zrušení výběru rodu |
| `GLOSS` | 03-artikule:18 | const | Artikule: slovníček pojmů (id, název, kapitola, tvary slova, definice) – i pro autolink |
| `GMV` | 04-praha:32 | const | vypravěčská verze webu (build přepne @GM@ na true) – větvení kódu jen pro vypravěče |
| `GN` | 02-mapa:6509 | const | graf vazeb: uzly podle id rodu (kotva ax/ay, poloha x/y, počet hran deg) pro rozložení |
| `GROZ` | 02-mapa:6512 | let | ⓘ `false;` |
| `GW` | 02-mapa:6507 | const | graf vazeb: šířka kreslicí plochy SVG (900) |
| `HIST` | 02-mapa:6255 | const | Zemské desky: historie vybraných rodů/měst (do 30) pro tlačítko „Zpět“ |
| `HISTH` | 02-mapa:6254 | const | Zemské desky: nadpis oddílu historie podle rodu (Historie města / Historie / Historie rodu) |
| `HLALIAS` | 10h-hledani:322 | const | ⓐ stavy z boje, které nejsou stavy SRD, mají pravidlo pod jiným jménem |
| `HLI` | 10h-hledani:5 | let | ⓘ `null,` |
| `HLIP` | 10h-hledani:6 | let | ⓘ `null;` |
| `HLS` | 10h-hledani:227 | const | ⓘ `{q: "", d: -1};` |
| `HLSKUP` | 10g-hledej:7 | const | ⓐ skupiny výsledků v pořadí, v jakém se ukazují při stejné shodě; Artikule mají přednost před SRD |
| `HLVAHA` | 10g-hledej:20 | const | ⓘ `{` |
| `HODY` | 13-karty:62 | let | Karty: seznam hodů z karet (nejnovější první) – načtené z databáze, lokální s příznakem skryty |
| `HOSP_BODY` | 02e-krajina:427 | const | ⓘ `[` |
| `HOSP_DRUH` | 02e-krajina:1231 | const | ⓘ `{` |
| `HOSP_OBL` | 02e-krajina:714 | const | ⓘ `[` |
| `HRA` | 07-druzina-kronika:92 | var | ⓐ Herní stav nastavený vypravěčem (datum, hodina, kde je družina); bez něj platí poslední zápis Kroniky |
| `HRA_PO` | 09-vypravec-herni-cas:693 | const | herní čas: funkce volané po změně herního stavu (překreslení plánu Prahy, synchronizace…) |
| `HRACI` | 02-mapa:4513 | const | ⓘ `[` |
| `HRACI_GEO` | 02b-mapa-kresba:6380 | const | ⓐ obrysy mocností vrstvy Hlavní hráči a místo erbu (počítá podklady/hranice_doplnit.py z HRACI v 02) |
| `HRAKL` | 22-vyprava:701 | const | Výprava: klíče stavu hry ukládané do kroků Zpět (datum, hodina, misto, praha, cesta, poloha, putovani) |
| `HRAP` | 16-srd-ukazky-sezeni-hrac:1380 | let | Hra: příznak spuštěného pravidelného načítání (hraPoll) výzev, zpráv, potvrzení – jen jednou |
| `HRKOR` | 02b-mapa-kresba:15120 | let | ⓐ vnější úseky hranice Koruny (úsek, který leží jen v jedné zemi Koruny) a jejich druh podle krajiny; spočítá se jednou |
| `ILSEL` | 08-navigace-pravidla:1042 | const | iluminované iniciály: CSS selektory odstavců, které dostanou zdobené první písmeno |
| `INSTP` | 19-karty-beyond:966 | let | PWA: uložená událost beforeinstallprompt – tlačítko „Nainstalovat jako aplikaci“ ji vyvolá |
| `JA` | 11-boj:2496 | const | ⓐ přihlášený hráč (stránka Hra): {k: karta, t: token relace, n: jméno} |
| `JEZERA` | 02-mapa:5867 | const | ⓐ jezera (bez přehrad – ty roku 1458 nejsou): Neziderské jezero na pomezí Rakous a Uher |
| `JEZERA_V` | 02b-mapa-kresba:13220 | const | ⓐ jezera nového rozsahu mapy (stejný formát jako JEZERA v 02; podklady/koruna_geo.py, bez dnešních přehrad) |
| `KADV` | 13-karty:186 | let | ⓐ hod d20 z karty; ověření a útoky hází i kostku Závoje a rovnou ji vyhodnotí, záchrany ne (Artikule › Kostka Závoje) |
| `KARTBY` | 12-boj-tah-postavy:1687 | const | Karty: index karet postav podle id (KARTY → objekt), bojKartaH z něj hledá kartu hráče |
| `KARTY` | 07-druzina-kronika:15 | var | karty postav z buildu (@KARTY@) – data postav hráčů pro Karty, Boj a Družinu |
| `KAUTO_EFK` | 19b-automatika:6 | const | ⓘ `new Set([` |
| `KAUTO_NIC` | 19b-automatika:21 | const | ⓐ rysy z PDF, které nejsou pravidlem pro boj ani hody (záhlaví listu, zdatnosti, popis) |
| `KAUTO_ZNA` | 19b-automatika:24 | const | ⓐ rysy, které automatika zná jinak než dotazem na jméno rysu (import PDF: War Caster → výhoda na soustředění) |
| `KAUTOOTV` | 19b-automatika:156 | let | ⓘ `false;` |
| `KAUTOR` | 17-karty-ii:1247 | const | ⓘ `new Map();` |
| `KAUTOSRC` | 19b-automatika:66 | let | ⓘ `null;` |
| `KBALM` | 19-karty-beyond:645 | const | ⓘ `{};` |
| `KBUF` | 17-karty-ii:637 | const | Kouzla: posílení seslaná na spolubojovníky (Bless max 3 cíle +1d4, Guidance, Shield of Faith) – soustředěný účinek u sesilatele |
| `KCACHE` | 15-karty-artikule:1030 | const | Karty: offline kopie karet, stavů a hodů v localStorage „mm-karty-kopie“ a IndexedDB – uloz/nacti/nactiIDB/predkesuj |
| `KCAS` | 17-karty-ii:183 | const | Karty: popisky časů aktivace pro skupiny akcí – A Akce, BA Bonusové akce, R Reakce, X Ostatní |
| `KCIL` | 17-karty-ii:961 | const | ⓐ léčení na kartu (2026-10-17): svou kartu (a kartu bez hesla) mění přímo, cizí přes mm_karta_lecit, který v boji stabilizuje umírajícího |
| `KCILM` | 17-karty-ii:639 | const | Kouzla: vybrané cíle hromadného kouzla podle karta:index kouzla → Set id karet (přes kCilM) |
| `KCIZI` | 13-karty:189 | const | ⓘ `"[data-khod],[data-kzr],[data-kses],[data-kds],[data-ks],[data-bppap],…` |
| `KCTN` | 15-karty-artikule:3 | const | Artikule: sedm Ctností pro křesťany (kr: Pokora, Štědrost…) a starověrce (old: Pohostinství, Odvaha…) |
| `KCX` | 18-pravidla-postavy:152 | const | Pravidla postavy: WeakMap cache kontextu kCtx (vstupy modelu) podle stavu karty – aktuální stav |
| `KCX0` | 18-pravidla-postavy:153 | const | Pravidla postavy: WeakMap cache kontextu kCtx pro stav podle PDF (porovnání s D&D Beyond) |
| `KDB` | 13-karty:4 | const | Karty: přístup k databázi karet – MMDB (nacti, uloz, stav, smaz, hody, hod) nebo náhrada v prohlížeči bez databáze |
| `KDBVL` | 13-karty:622 | const | Karta: české názvy vlastností STR Síla, AGI Obratnost, CON Odolnost, INT, WIS Moudrost, CHA (duplikát KSK) |
| `KDLT` | 18-pravidla-postavy:323 | const | Pravidla postavy: WeakMap cache rozdílů „z D&D Beyond“ (PDF hodnota − spočtená) podle karty, klíč typ:vlastnost |
| `KDOVAB` | 13-karty:511 | const | Karta: dovednost (Acrobatics, Athletics…) → vlastnost (AGI, STR…), pro ověření a bonusy |
| `KDRUH` | 18-pravidla-postavy:48 | const | ⓐ druhy (SRD 5.2.1): rychlost a velikost; trpaslík +1 HP za úroveň |
| `KDUL` | 15-karty-artikule:605 | const | Duše: poslední změna bodů hříchu/dobrých skutků podle id karty – [pole, stará hodnota] pro tlačítko Oprava |
| `KEF` | 13-karty:531 | const | Karta: indexy zaškrtnutých volitelných účinků (Divine Smite se slotem…) k dalšímu hodu podle id karty |
| `KEMBC` | 19-karty-beyond:607 | const | ⓐ Emboldening Bond: výběr postav (sebe + spojenci, nejvýš PB) a pouto „Emboldening Bond ⇒ Jméno“ u sesilatele; nové pouto staré nahradí |
| `KFEAT` | 15-karty-artikule:64 | const | ⓐ feat víry (Artikule, Vyznání): [název, použití za dlouhý odpočinek (0 = bez počítadla), stupeň, popis] |
| `KFR` | 15-karty-artikule:930 | const | Karty offline: fronta zápisů karty a hodů v localStorage „mm-fronta“ (get/set), odešle se po připojení |
| `KHRAC` | 13-karty:65 | const | Karty: jméno hráče přihlášeného ke kartě podle id karty (z databáze, pro výzvy a přehled) |
| `KHUKOL` | 14-karty-bojova-karta:230 | const | ⓐ rozdělení hlášek na úkoly (mají tlačítko s rozhodnutím) a informace |
| `KICON` | 19-karty-beyond:1591 | const | Kouzla: SVG ikonka soustředění (Concentration) u kouzla v seznamu |
| `KIMP` | 13-karty:532 | let | Karty: naimportovaná karta z PDF D&D Beyond čekající na potvrzení (náhled a rozdíl) |
| `KIMPINV` | 13-karty:691 | let | Karty import: zaškrtnutí „Převzít vybavení z nového PDF“ (přepsat inventář ze stavu) |
| `KINVC` | 14b-vybaveni:157 | const | ⓐ vybraný cíl vrhu podle karty |
| `KINVCEN` | 14b-vybaveni:14 | const | Vybavení: regex cenností (gems, rubín, šperk, soška…) → skupina „cen“ v inventáři |
| `KINVDB` | 14b-vybaveni:462 | const | ⓘ `[` |
| `KINVDBN` | 14b-vybaveni:478 | const | ⓘ `40;` |
| `KINVF` | 14b-vybaveni:178 | const | ⓐ druhy věcí pro přepínače nad seznamem (věc může mít víc: připoutaný magický prsten = Připoutané i Magické) |
| `KINVHOD` | 14b-vybaveni:17 | const | ⓐ vrhací spotřební věci podle SRD 5.2.1 (výstroj): místo jednoho útoku akce Útok; cíl do 20 stop, záchrana DEX SO 8 + DEX + zdatnost |
| `KINVIK` | 14b-vybaveni:232 | const | ⓐ ikony vlevo od jména: připoutání (◆ připoutáno / ◇ vyžaduje připoutání) a oblečená zbroj nebo štít v ruce – klepnutím se přepnou |
| `KINVPL` | 14b-vybaveni:540 | const | ⓘ `{` |
| `KINVSK` | 14b-vybaveni:4 | const | Vybavení: skupiny inventáře [klíč, název] – pri Připoutané, boj Zbraně a zbroj, spo Spotřební, mag, cen, vys Výstroj |
| `KINVSPO` | 14b-vybaveni:12 | const | Vybavení: regex spotřebních věcí (potion, scroll, svěcená voda, olej, ration, torch, šípy…) → skupina „spo“ |
| `KIRIT` | 19-karty-beyond:1592 | const | Kouzla: SVG ikonka rituálu (Ritual) u kouzla v seznamu |
| `KKON` | 17-karty-ii:1383 | const | ⓐ soustředění (2026-10-17): CON záchrana na kliknutí (War Caster výhoda, stavy, Závoj); neúspěch ukončí soustředění i soustředěné účinky |
| `KKONTM` | 19-karty-beyond:47 | const | Vybavení: regex magických vaků (bag of holding, handy haversack, portable hole) – obsah se nepočítá do zátěže |
| `KKOSTI` | 14-karty-bojova-karta:2431 | const | ⓘ `["d20", "d12", "d100", "d10", "d8", "d6", "d4"];` |
| `KKOSTSVG` | 14-karty-bojova-karta:2432 | const | ⓘ `{` |
| `KKOSTTAJ` | 14-karty-bojova-karta:2441 | let | ⓘ `false;` |
| `KLOAD` | 13-karty:63 | let | Karty: čas posledního načtení karet z databáze (0 = nenačteno, 1 = bez databáze) |
| `KLVUP` | 19-karty-beyond:170 | const | Postup na úroveň: rozpracovaný postup podle id karty – {tr povolání, hod životů, ab zvýšení vlastností…} |
| `KMARC` | 18-pravidla-postavy:21 | const | Pravidla postavy: regex bojových povolání (Barbarian, Fighter, Paladin, Ranger) – zdatnost s válečnými zbraněmi |
| `KMASS` | 17-karty-ii:638 | const | Kouzla: hromadné léčení → nejvyšší počet cílů (Mass Healing Word 6, Mass Cure Wounds 6, Prayer of Healing 5) |
| `KMAST` | 17-karty-ii:190 | const | ⓐ mistrovství zbraní (Vex, Nick…) nejsou akce – patří k vlastnostem zbraně |
| `KMINC` | 19-karty-beyond:50 | const | ⓘ `{CP: 1, SP: 10, EP: 50, GP: 400, PP: 1000};` |
| `KMINCE` | 14b-vybaveni:81 | const | ⓘ `["GP", "SP", "CP"],` |
| `KMINCJM` | 14b-vybaveni:82 | const | ⓘ `{GP: "uherský zlatý", SP: "pražský groš", CP: "haléř"},` |
| `KMINCZK` | 14b-vybaveni:83 | const | ⓘ `{GP: "zl.", SP: "gr.", CP: "hal.", EP: "EP", PP: "PP"};` |
| `KMODSP` | 19-karty-beyond:861 | const | Discord hody: poslední odeslaný JSON bonusů karty (ověření, záchrany, dovednosti) podle id karty + timeouty „t“+id |
| `KNABC` | 17-karty-ii:1337 | const | Vybavení: cache nábojů magického předmětu podle id – {max, obn obnova} z popisu SRD, null = bez nábojů |
| `KNER` | 15-karty-artikule:7 | const | Artikule: sedm Neřestí pro křesťany (kr: Pýcha, Lakomství…) a starověrce (old: Zrada hosta, Zbabělost…) |
| `KODK` | 23-potvrzovani:65 | var | Potvrzování: seznam odložených akcí hráče s lhůtou na rozmyšlení – {id, popis, konec, res, t timeout} |
| `KODKI` | 23-potvrzovani:66 | var | Potvrzování: čítač id odložených akcí (KODK) |
| `KODKT` | 23-potvrzovani:97 | var | Potvrzování: interval překreslování lišty odložených akcí (odpočet), 0 = neběží |
| `KONF_C` | 02-mapa:6170 | let | ⓐ konflikty pro vrstvu Konflikty: skládají se jednou, data (vazby, státy) se za běhu nemění |
| `KONF_KOT` | 02e-krajina:2758 | const | ⓘ `{` |
| `KPASD` | 18-pravidla-postavy:365 | const | Pravidla postavy: pasivní dovednosti – vnimani Perception, vhled Insight, patrani Investigation |
| `KPDFV` | 18-pravidla-postavy:310 | const | ⓐ PDF → co pravidla nevysvětlí; hráč to může odebrat (S.pdfx) |
| `KPEND` | 13-karty:67 | const | ⓐ rozepsané změny: načtení z databáze nesmí přepsat změnu, která se právě ukládá (nebo se uložila až po začátku načítání) |
| `KPENDT` | 13-karty:68 | const | Karty: čas poslední rozepsané změny stavu karty podle id – načtení z databáze ji nesmí přepsat |
| `KPENVYKL` | 14b-vybaveni:1083 | const | ⓐ krátký výklad peněz tažení a dobových cen (Vojta 2026-10-29); ceny jako v katalogu Vybavení (zdroj/vybaveni/ceny-dobove.json) |
| `KPOLL` | 13-karty:1109 | let | ⓐ karty a herní záznam se obnovují, když je stránka otevřená (nepřekreslí se, když hráč zrovna píše) |
| `KPOSL` | 13-karty:1118 | const | Karta: poslední hod d20 podle id karty – {co, d1, d2, v, b…} pro úpravu po hodu (Bless, Bane, přehození, Lucky) |
| `KPOVCZ` | 18-pravidla-postavy:1277 | const | Příprava kouzel: anglické → české názvy sesilatelských povolání (Wizard Kouzelník, Cleric Klerik…) |
| `KPOZT` | 16-srd-ukazky-sezeni-hrac:1961 | let | Karta: timeout odloženého uložení poznámky (data-kpozn) do stavu karty |
| `KPREDX` | 18-pravidla-postavy:108 | const | ⓐ předměty, které pravidla znají jménem (doplňují databázi SRD předmětů): nastavené skóre, bonus ke kouzlům a další |
| `KPRID` | 10u-ucinky:205 | const | Kostky k hodům d20 odvozené z UCINKY (10u): [název, kostka, druhy ut/za/ov/in, nápověda, po hodu, jednou za tah, bez přepínače] – přepínače na kartě |
| `KPRIP` | 18-pravidla-postavy:1287 | let | Příprava kouzel: hledaný text v seznamu kouzel povolání (data-kpripq) |
| `KPS` | 15-karty-artikule:1094 | const | Přehled družiny (vypravěč): formulář hromadného hodu – ab vlastnost záchrany, dc SO, dov dovednost, vys výsledky |
| `KPZK` | 17-karty-ii:310 | const | Kouzla z předmětů: hůlky a podobné → {dc pevné SO, k: [[kouzlo, cena nábojů, max nábojů, stupeň]]} |
| `KR` | 18-pravidla-postavy:227 | const | Pravidla postavy: výpočty hodnot karty (pb, zach, dov, spab…) → [součet, rozpis položek] s rysy a účinky |
| `KRAJE` | 02-mapa:2670 | const | ⓘ `[` |
| `KRAJEB` | 02b-mapa-kresba:15180 | let | ⓘ `null;` |
| `KRIM` | 19-karty-beyond:1586 | const | ⓐ ikonky kouzel: stupeň římskou číslicí v kolečku, trik hvězdičkou, soustředění a rituál (2026-10-17) |
| `KRVL` | 17-karty-ii:194 | const | ⓘ `/\s*\((str\|dex)\.?\)\s*$/i;` |
| `KRYSPOUZ` | 17-karty-ii:213 | const | ⓐ schopnosti s tlačítkem Použít (Vojta 2026-10-29): použití se odečte, výsledek uplatní a v boji se odškrtne čas (bonusová akce) |
| `KRYSSUM` | 10k-import-pdf:458 | const | ⓐ nadpisy a souhrny z D&D Beyond, které nejsou samostatné rysy (velikost, rychlost, jazyky, volba vlastnosti…) |
| `KSDLG` | 17-karty-ii:735 | let | Kouzla: otevřený dialog seslání – {K karta, x kouzlo, i index, c Set cílů} nebo null |
| `KSK` | 13-karty:510 | const | Karta: české názvy vlastností (STR Síla… CHA Charisma) pro popisky záchran a ověření |
| `KSLOZ0` | 14b-vybaveni:164 | const | ⓐ výchozí složky (Vojta 2026-10-29: na sobě, batoh, brašna, kapsy); vlastní přidá Spravovat inventář |
| `KSLT` | 18-pravidla-postavy:23 | const | ⓐ sloty podle úrovně sesilatele (SRD: Multiclassing) a sloty paktu černokněžníka |
| `KSLV` | 19-karty-beyond:1129 | const | Kouzla: zvolený stupeň slotu k seslání podle karta:index kouzla (klíč slotu) |
| `KSPD` | 15-karty-artikule:352 | let | Kouzla: popisy kouzel z art/kouzla.json podle klíče názvu (null = nenačteno), kSp(n) z nich čte |
| `KSPDP` | 15-karty-artikule:362 | let | Kouzla: probíhající Promise načítání KSPD (kSpNacti) – aby se nenačítalo dvakrát |
| `KSPOLC` | 18-pravidla-postavy:1318 | const | Společníci: zvolený cíl útoku společníka v boji podle id společníka (kSpolId) |
| `KSPTP` | 15-karty-artikule:394 | let | ⓐ popisy, které v lehkém souboru nejsou (t chybí, automatika má ta): dotáhnout z plného souboru a překreslit |
| `KST` | 13-karty:60 | const | Karty: stav postav podle id karty (životy, sloty, zdroje, vyčerpání, vybavení, stavy…), kartaStav(id) |
| `KSTAT` | 13-karty:61 | const | Karty: id karet vložených do stránky generátorem (statické) – do offline kopie se neukládají |
| `KSTP` | 14-karty-bojova-karta:161 | const | ⓐ sdílené části karty i bojové karty: čipy stavů s výběrem, čipy zdrojů, pruh hlášení |
| `KSTV` | 17-karty-ii:1478 | const | Karta: seznam stavů mimo boj (krvácí k6/k8, otrávený, vyděšený, sražen…) pro čipy stavů |
| `KSVIT` | 17-karty-ii:416 | const | ⓐ svitky (Spell Scroll): SO a útok podle stupně kouzla; kouzlo musí být na seznamu povolání; vyšší stupeň, než postava sesílá = ověření SO 10 … |
| `KTAHJ` | 17-karty-ii:1037 | const | Účet tahu podle karty (17): kostky „jednou za tah“ (Emboldening Bond) použité v běžícím tahu, id karty → {k, jt} |
| `KTR` | 18-pravidla-postavy:7 | const | Pravidla postavy: povolání → {hd kostka životů, cz český název, c podíl sesilatele (1, 0.5), ab vlastnost kouzel} |
| `KTRCZ` | 17-karty-ii:428 | const | Kouzla: anglické → české názvy sesilatelských povolání (pro popisek přípravy; duplikát KPOVCZ) |
| `KTX` | 17-karty-ii:68 | const | Karta rysy: soukromé texty rysů podle id karty (načtené z databáze, {} = bez textů) |
| `KTXAB` | 13-karty:1258 | const | Karta kostky v textu: anglický název/zkratka vlastnosti (strength, dex…) → STR/AGI/CON/INT/WIS/CHA |
| `KTXP` | 17-karty-ii:69 | const | Karta rysy: probíhající Promise načítání textů rysů KTX podle id karty |
| `KTXRE` | 13-karty:1302 | const | Karta: regex kostek v textech schopností („1d6“, „2d8 + your Strength modifier“) → klikací hod |
| `KUCTRV` | 14-karty-bojova-karta:1437 | const | ⓘ `[` |
| `KUCX` | 15-karty-artikule:268 | const | Karta účinky: klíče už ohlášených vypršení účinků (karta:názvy) – hlášení jen jednou |
| `KUPRC` | 18-pravidla-postavy:1088 | const | Úpravy postavy: [klíč, popisek] co lze upravit vlastní úpravou – ac, zach, ini, hp, rych, ov, spdc, sput, pas:vnimani |
| `KUPRN` | 18-pravidla-postavy:1100 | const | Úpravy postavy: popisky všech klíčů úprav (KUPRC + dov, pas:vhled, pas:patrani, zrd) pro výpis |
| `KUPRO` | 13-karty:634 | const | Karta: id karet s otevřeným panelem Úpravy postavy (tlačítko ⚙) |
| `KUPROTV` | 18-pravidla-postavy:1149 | const | Karta: id karet s rozbaleným details „Úpravy postavy“ (data-kupr) |
| `KUTI` | 18-pravidla-postavy:929 | const | Pravidla postavy: WeakMap cache informací o útocích z PDF (vlastnost, magický bonus, bonus zranění) podle karty |
| `KVPOPZ` | 14b-vybaveni:374 | const | ⓘ `new Set();` |
| `KVYDP` | 15-karty-artikule:102 | const | ⓐ Výdrž (Artikule, Šerm a zápas): Fighter = bonus zdatnosti, Barbarian, Paladin, Ranger, Rogue, Monk polovina |
| `KVZN` | 15-karty-artikule:11 | const | Artikule: zkratky vyznání → název (kal kališník, kat katolík, old starověrec) |
| `KWARDRE` | 17-karty-ii:680 | const | ⓘ `/^Warding Bond\b.* ⇒ (.+)$/;` |
| `KZ` | 10-kouzla:4 | let | Kouzla: načtený seznam všech kouzel (SRD + vlastní), null do načtení |
| `KZ_LOK` | 10-kouzla:9 | let | Kouzla: vlastní kouzla vypravěče jsou jen v tomto prohlížeči (bez databáze) |
| `KZACHRE` | 17-karty-ii:578 | const | ⓐ záchrana cíle v textu kouzla; „výhoda na DEX záchranné hody“ (Haste, Beacon of Hope, Conjure Animals pro sesilatele) jí není |
| `KZAM` | 16-srd-ukazky-sezeni-hrac:991 | const | Karty: id karet zamčených heslem hráče (upravit smí jen hráč a vypravěč), kMuze |
| `KZAV` | 15-karty-artikule:62 | const | Karta: poslední kostka Závoje podle id karty – {co hod, d d6, r pok/poz, hod} pro volbu Pokušení/Požehnání |
| `KZBRAN` | 18-pravidla-postavy:60 | const | ⓐ zbraně SRD 5.2.1: [vzor, název, kostka, typ, vlastnosti, S/M (jednoduchá/válečná), dálková] |
| `KZBRL` | 14-karty-bojova-karta:3 | const | Vybavení nabídka: zbroje SRD [název, váha lb, kategorie lehká/střední/těžká] |
| `KZBRT` | 18-pravidla-postavy:794 | const | Pravidla postavy: zbroj podle názvu [regex, základ AC, max bonus AGI, druh Vycpávaná/Kroužková/Plátová] pro výpočet AC |
| `KZBRTRIK` | 14-karty-bojova-karta:789 | const | ⓘ `/^(True Strike\|Booming Blade\|Green-Flame Blade\|Shillelagh)$/;` |
| `KZBRV` | 14-karty-bojova-karta:58 | const | Karta: zvolená zbraň k útoku podle id karty (localStorage „mm-zbrv“), karta i Boj |
| `KZBRW` | 14-karty-bojova-karta:17 | const | Vybavení nabídka: váhy zbraní SRD (Club 2, Dagger 1, Mace 4…) v lb |
| `KZBY` | 10-kouzla:10 | const | Kouzla: kouzlo podle id, „en:název“ a „cz:název“ – rychlé hledání |
| `KZDRP` | 18-pravidla-postavy:464 | const | ⓐ počty použití schopností podle pravidel (SRD 5.2.1); ostatní z PDF |
| `KZDSKR` | 14-karty-bojova-karta:1852 | const | ⓘ `new Set();` |
| `KZDSRD` | 14-karty-bojova-karta:1822 | const | ⓘ `{` |
| `KZF` | 10-kouzla:272 | const | Kouzla: stav filtru stránky (hledaný text, úroveň, škola, povolání, Concentration, rituál, vlastní) |
| `KZFL` | 15-karty-artikule:1223 | let | ⓐ null = ještě nevybráno (hráči se napoprvé ukáže jeho postava), "" = vše |
| `KZIK` | 17b-kouzla-ucinky:1141 | const | Kouzla v boji: název kouzla → ikonka značky (bless, bane, posileni, ochrana…) pod iniciativou a v kartě NPC |
| `KZK` | 10-kouzla:178 | const | Kouzla: složky kouzla (V verbální, S somatická, M materiální) pro formulář |
| `KZLEC` | 17b-kouzla-ucinky:709 | const | Kouzla léčení a obnovy: Heal, Mass Heal, Revivify, Lesser/Greater Restoration… → {hp, st stavy, stab, ozivit, vyber} |
| `KZOBL` | 17b-kouzla-ucinky:361 | const | Kouzla s oblastí opakovaného zranění (Spirit Guardians, Moonbeam, Wall of Fire…) → {ab záchrana, z kostky, up, t typ, kdy zac/kon} |
| `KZOPAK` | 17b-kouzla-ucinky:222 | const | Kouzla, která se po seslání opakují bez slotu (Spiritual Weapon, Witch Bolt, Call Lightning…) → {typ ut/auto/zach, z, t, cas} |
| `KZP` | 10-kouzla:5 | let | Kouzla: probíhající promise načítání kouzel (art/kouzla.json + vlastní) – jedno načtení |
| `KZPET` | 13-karty:1326 | const | Karta Zpět: zásobník posledních změn stavu (životy, sloty, zdroje, účinky, vybavení) podle id karty na tomto zařízení |
| `KZPF` | 13-karty:1327 | const | Karta Zpět: popisky polí stavu (hp životy, thp dočasné HP, zdr sloty a zdroje, kz, insp, uc, vycerp, mun, stavy) |
| `KZPOV` | 10-kouzla:163 | const | Kouzla: seznam povolání sesilatelů česky (Bard, Klerik…) pro filtr a formulář |
| `KZPROT` | 17b-kouzla-ucinky:562 | const | Boj Counterspell: prefix poznámky výzvy „Counterspell: “ – podle něj se pozná výzva protikouzla |
| `KZPYTV` | 16-srd-ukazky-sezeni-hrac:1137 | const | ⓐ Zpytování svědomí jako výzva: typ „hod“ s touto poznámkou (bez změny databáze); hráč hodí d10 na své kartě (kZpyt) |
| `KZRE` | 10-kouzla:6 | let | Kouzla: regulární výraz anglických názvů kouzel – prolinkování v textech karet a Boje |
| `KZSK` | 10-kouzla:162 | const | Kouzla: školy magie česky (Abjurace, Vyvolávání…) pro filtr a formulář |
| `KZSRD` | 10-kouzla:7 | let | Kouzla: kouzla z SRD načtená z art/kouzla.json |
| `KZSTOP` | 10-kouzla:3 | const | ⓐ anglické názvy kouzel, které jsou zároveň běžné herní pojmy – neprolinkovávat |
| `KZSUM` | 17b-kouzla-ucinky:952 | const | Kouzla vyvolání (Summon Beast, Summon Fey…) → společník na kartě: {min stupeň, v varianty, ac, hp, ut útoky} podle stupně |
| `KZTXTKP` | 10-kouzla:107 | let | ⓐ hráč stahuje lehčí art/kouzla-karta.json (bez popisů tam, kde automatika čte starší text); vypravěč plný soubor |
| `KZTXTP` | 10-kouzla:93 | let | ⓐ art/kouzla.json se stáhne jednou (sdílí ho seznam kouzel vypravěče i karty postav); každý si ho přečte zvlášť |
| `KZVL` | 10-kouzla:8 | let | Kouzla: vlastní kouzla vypravěče (z databáze mm_kouzla_* nebo prohlížeče) |
| `LANDFR` | 02-mapa:2688 | const | ⓘ `{` |
| `LANDS` | 02b-mapa-kresba:3 | const | kresba mapy: země Koruny ([výplň, prstence polygonů]) – základní tvar mapy |
| `LES_DRUH` | 02b-mapa-kresba:15112 | const | ⓘ `const LES_DRUH =` |
| `LES_JEHL` | 02b-mapa-kresba:15118 | const | ⓘ `{s: 0.45, j: 0.85, l: 0.1};` |
| `LLBL` | 02b-mapa-kresba:676 | const | kresba mapy: popisky zemí Koruny ([NÁZEV, lon, lat, velikost]) |
| `LOKATIV` | 07-druzina-kronika:730 | const | Kronika: název místa → tvar „v Praze“, „v Kutné Hoře“ pro věty datace |
| `MAJOR_PLACES` | 02-mapa:2570 | const | mapa: názvy hlavních měst (Praha, Vratislav, Vídeň…), které se ukazují i při oddálení |
| `MAJOR_ROADS` | 02-mapa:2522 | const | mapa: názvy hlavních stezek (Prachatická stezka…), které se kreslí zvýrazněně |
| `MANZ` | 10p-pravidla:411 | const | ⓘ `{` |
| `MAPCELA` | 02f-mapa-cela:9 | const | ⓘ `{koren: null, box: null, api: false, posun: 0, vb: null, dotek: false,…` |
| `MAPCELA_MAPY` | 02f-mapa-cela:11 | const | ⓐ výřez a překreslení každé mapy (obal .mapbox podle id); kresba světa a Prahy je v líných částech – volá se jen, je-li načtená |
| `MAPM` | 02-mapa:764 | const | ⓘ `0.4;` |
| `MAPNAMETY` | 02-mapa:705 | const | náměty vypravěče k bodům vrstvy Poutě (zdroj/obsah/mapa-namety.md, build je zabalí do ⟦⟧) – hráč dostane {} |
| `MAPW_MQ` | 02-mapa:717 | const | ⓘ `matchMedia("(min-width:1100px)");` |
| `MAPW_PRESET` | 02-mapa:719 | const | ⓘ `890;` |
| `MAPWB` | 02-mapa:718 | const | ⓘ `[-101, -302, 972, 1232];` |
| `MES` | 07-druzina-kronika:594 | const | kalendář: názvy měsíců v 2. pádě (ledna, února…) pro datace |
| `METRO` | 02-mapa:2651 | const | ⓘ `new Set([` |
| `MIKB` | 02b-mapa-kresba:15244 | let | ⓐ barvy motivu pro jedno vykreslení (drawMapK je na začátku vynuluje) – čtení stylu je drahé, ikon jsou stovky |
| `MIKC` | 02b-mapa-kresba:15243 | const | ⓐ hotové ikony: klíč → data URL; barvy jsou součástí klíče |
| `MIKP` | 02b-mapa-kresba:15241 | const | ⓐ okraj kolem ikony pro lem, v pixelech kresby |
| `MIKR` | 02b-mapa-kresba:15240 | const | ⓐ pixelů plátna na jeden pixel kresby: stačí pro displej 3× i širokou mapu |
| `MIKZ` | 02b-mapa-kresba:15242 | const | ⓐ zdrojové obrázky: adresa → načtený Image \| false (načítá se) \| null (nejde) |
| `MILE_KM` | 01-zaklad:11 | const | ⓐ vzdálenost v českých mílích, kilometry v závorce (Vojta 2026-10-26): česká míle ≈ 11,24 km; pod 10 mil na půl míle |
| `MIMO` | 18-pravidla-postavy:623 | let | Obsah D&D 2024 mimo SRD (art/mimo-srd.json): podtřídy, featy, zázemí – načtená data nebo null |
| `MIMOCAS` | 18-pravidla-postavy:758 | const | Mimo SRD: popisky času aktivace rysu – A Akce, BA Bonusová akce, R Reakce |
| `MIMOKAT` | 08-navigace-pravidla:494 | const | ⓐ Doplňky mimo SRD: podtřídy podle povolání, featy podle druhu, zázemí, druhy a kouzla (vlastní shrnutí mechaniky) |
| `MIMOP` | 18-pravidla-postavy:624 | let | Mimo SRD: probíhající Promise načítání MIMO (mimoNacti) |
| `MIMOPOZN` | 18-pravidla-postavy:777 | const | Mimo SRD: text upozornění, že jde o vlastní shrnutí mechaniky, ne oficiální text pravidel |
| `MIMOR` | 18-pravidla-postavy:625 | let | Mimo SRD: rejstřík rysů podle normalizovaného názvu (mimoN) → záznam s mechanikou (počty použití, ef) |
| `MIMOSKIP` | 18-pravidla-postavy:712 | const | ⓐ rysy, které pravidla už počítají jménem (Tough, Speedy, Lucky…), tu nesčítat podruhé |
| `MMCELA_MQ` | 08-navigace-pravidla:734 | const | navigace: media query šířky ≤ 700 px – hráčova Hra na telefonu přes celou obrazovku |
| `MMCELA_WEB` | 08-navigace-pravidla:735 | let | navigace: hráč na telefonu kliknul ☰ a chce vidět web s menu (vypne celoobrazovkovou Hru) |
| `MMCHSUM` | 01-zaklad:33 | const | ⓘ `const MMCHSUM =` |
| `MMCHYBY` | 01-zaklad:32 | const | ⓘ `{n: 0, b: new Set()};` |
| `MMIDB` | 15-karty-artikule:992 | const | Karty: obal IndexedDB „mm“ (store kv) – get/set – druhá offline kopie karet vedle localStorage |
| `MMK` | 11-boj:826 | const | Mundus Mutatus kostky: stav 3D animace hodů (fronta, časovač, dice-box, prvek, index zvýraznění) |
| `MMKB` | 01-zaklad:114 | const | ⓘ `{` |
| `MMLINY` | 01-zaklad:325 | const | líné části skriptu: název části → promise jejího načtení (mmLina), aby se stáhla jen jednou |
| `MMLINY_V` | 01-zaklad:379 | const | ⓐ „hra“ (boj, karty, hra, puls…) potřebují stránky s kartou, bojem a pravidly; ostatní stránky se ukážou bez ní |
| `MMMOTIV` | 01-zaklad:96 | const | ⓐ denní / noční vzhled (Vojta 2026-10-29): podle zařízení → denní → noční; volba v prohlížeči (mm-motiv), styly čtou :root[data-theme] |
| `MMPREK` | 01-zaklad:9 | const | odložené překreslení (mmPozdeji): klíč → funkce, spustí se jednou po doběhnutí obsluhy |
| `MMRUC` | 11b-rucni-kostky:6 | const | ⓘ `{q: null, t: 0};` |
| `MORE` | 02b-mapa-kresba:11740 | const | ⓘ `[` |
| `MORE_LBL` | 02b-mapa-kresba:13208 | const | ⓐ popisky moří a zálivů: [jméno, délka, šířka, otočení, velikost] |
| `MOUNTAINS` | 02-mapa:4664 | const | mapa: linie horských hřebenů (lon/lat) pro kresbu hor a zpomalení cest |
| `MSEG` | 02-mapa:6933 | const | mapa: úseky hřebenů z MOUNTAINS v souřadnicích mapy – test „blízko hor“ při měření cest |
| `MTZ` | 02-mapa:2665 | const | ⓘ `[21, 17, 14, 12];` |
| `NAMEPTS` | 02-mapa:6918 | const | mapa: body se jménem (sídla z PLACES + města TOWNS) – pojmenování nejbližšího místa |
| `NAVMOJE` | 23-potvrzovani:126 | var | Potvrzování: id návrhů odeslaných tímto hráčem – po rozhodnutí vypravěče se mu ohlásí výsledek |
| `NAVNAME` | 08-navigace-pravidla:691 | const | navigace: id stránky → název v menu (Hra, Úvod, Artikule…) |
| `NAVOD` | 16-srd-ukazky-sezeni-hrac:1062 | const | Hra: HTML návod pro hráče „Jak hrát na webu“ (nahrát PDF, přihlásit, kostka Závoje, Svědomí, boj) |
| `NAVRHY` | 23-potvrzovani:125 | var | Potvrzování: návrhy hráčů ke schválení vypravěčem (léčení, Bardic spojenců) načtené z databáze |
| `NBR_LANDS` | 02-mapa:6424 | const | Zemské desky: názvy sousedních zemí (Braniborsko, Polsko…) pro záložky cizích rodů |
| `NBRS` | 02b-mapa-kresba:714 | const | kresba mapy: polygony sousedních zemí ([id, prstence]) kolem Koruny |
| `NEDELE` | 07-druzina-kronika:690 | const | kalendář: neděle liturgického roku ([dny od Velikonoc, název, tvary]) pro starou dataci |
| `NETV` | 16-srd-ukazky-sezeni-hrac:112 | let | ⓐ nestvůry: připojí se k protivníkům (bestiář v Boji, přidání do boje) |
| `NETVP` | 16-srd-ukazky-sezeni-hrac:113 | let | Nestvůry: probíhající Promise načítání art/netvori.json (NETV) |
| `NLBL` | 02b-mapa-kresba:684 | const | kresba mapy: popisky sousedních zemí ([NÁZEV, lon, lat]) |
| `NS` | 02-mapa:805 | const | ⓐ www.w3.org/2000/svg"; |
| `NVF` | 16-srd-ukazky-sezeni-hrac:139 | let | Nestvůry (vypravěč): filtr seznamu – q hledaný text, typ typ nestvůry |
| `OBALKY` | 02b-mapa-kresba:14947 | const | ⓘ `new WeakMap();` |
| `OBCH` | 16o-obchody-tabulky:9 | let | ⓘ `null;` |
| `OBCHDOR` | 16o-obchody-tabulky:147 | let | ⓐ předání hotových zakázek (vypravěč; po načtení obchodů a po změně herního času) |
| `OBCHDOV` | 16o-obchody-tabulky:197 | const | ⓘ `[` |
| `OBCHNIKDY` | 10o-obchody:144 | const | ⓐ nikdy se nenabízí samo: kouzelné předměty a lektvary či svitky, věci jiných světů (vzducholodě, houbové oděvy, exotická zvířata) |
| `OBCHOTV` | 16o-obchody-tabulky:10 | let | ⓐ obchod rozbalený v Nástrojích |
| `OBCHPOV` | 10o-obchody:269 | const | ⓐ pověst u rodu obchodu → přirážka v procentech; null = s družinou neobchoduje (Nepřízeň a horší) |
| `OBCHSM` | 16o-obchody-tabulky:14 | let | ⓐ smlouvání: jeden pokus na postavu, obchod a herní den (v tomto prohlížeči) |
| `OBCHTYDEN` | 10o-obchody:306 | const | ⓐ zásoby běžného zboží (o.zas): levné věci po dvaceti kusech, drahé po jednom; doplní se po týdnu |
| `OBCHTYP` | 10o-obchody:8 | const | ⓐ druhy obchodů: n název, p popis, s sortiment = [kategorie katalogu, seznam anglických jmen \| "*" (vše dovolené v kategorii)] |
| `OBCHVL` | 10o-obchody:249 | const | ⓘ `{` |
| `OBCHZPUST` | 10o-obchody:275 | const | ⓐ zpustlý kraj: zboží o polovinu dražší a zásoby poloviční |
| `OFF` | 02-mapa:6972 | const | ⓐ without a road even open country is slower |
| `OSPROT` | 11-boj:696 | const | Boj/bestiář: osoby ze Zemských desek se statblokem podle id (z PROTOSOBY) |
| `PAR` | 04-praha:34 | const | plán Prahy: poměr stran výchozího výřezu (výška/šířka PVB0) pro přiblížení |
| `PARTY` | 07-druzina-kronika:14 | var | Družina: postavy z buildu (@PARTY@) – jména, portréty, vyznání, příběh |
| `PARTY_SLOTS` | 07-druzina-kronika:16 | const | Družina: počet míst pro postavy hráčů (5) |
| `PBLD` | 04b-praha-plan:96 | const | ⓐ krajina a stavby mimo očíslovaná místa: [druh, x, pata, výška, zrcadlit, jen v celkovém pohledu] |
| `PBW` | 04b-praha-plan:59 | const | ⓐ ilustrace plánu: šířky piktogramů (výška 170 px), stavby [druh, x, pata, výška], stuhy, Židovské Město |
| `PBY` | 02-mapa:6696 | const | osoby Zemských desek podle id (z PEOPLE) – rychlé hledání osoby |
| `PEC` | 26-start:2 | const | Pečeť: co družina nově pozná, se „rozpečetí“ – lv(id) úroveň znalosti, nove(id), videl(id); viděné v localStorage mm-videno |
| `PEOPLE` | 02-mapa:6695 | const | osoby Zemských desek z buildu (@PEOPLE@) – jméno, role, rod, text |
| `PFAITH` | 07-druzina-kronika:17 | const | Družina: vyznání postavy (kal, kat, old) → název (kališník, katolík, starověrec) |
| `PG` | 04-praha:27 | let | plán Prahy: načtená geometrie plánu (art/praha.json po pRuka) – řeka, domy, zahrady; null do načtení |
| `PICO` | 04b-praha-plan:109 | const | ⓐ ikony míst: vlastní kresba [soubor, výška], jinak obecná podle druhu |
| `PKIND` | 04-praha:29 | const | Praha: druh objektu (dvur, urad, cirkev, hospoda, anomalie) → název kategorie |
| `PLACES` | 02-mapa:4643 | const | mapa: sídla rodů ({name, lo, la, fam}) bez duplicit – body a výběr pro měření cest |
| `PLNEF` | 10q-plne-texty:12 | const | ⓘ `{kouzla: {q: "", l: ""}, predmety: {q: "", l: ""}};` |
| `PLNEKL` | 10q-plne-texty:6 | const | ⓘ `{kouzla: "Kouzla", predmety: "Kouzelné předměty"};` |
| `PLNEMAX` | 10q-plne-texty:135 | const | ⓘ `120;` |
| `PLNES` | 10q-plne-texty:9 | const | ⓘ `{},` |
| `PLNESP` | 10q-plne-texty:10 | const | ⓘ `{},` |
| `PLNESTR` | 10q-plne-texty:175 | const | ⓐ stránky Pravidla › Kouzla (#pravidla/kouzla) a Pravidla › Předměty (#pravidla/predmety-plne) |
| `PLNET` | 10q-plne-texty:11 | const | ⓘ `{};` |
| `PLNEUP` | 10q-plne-texty:8 | const | ⓐ co jde nahrát (featy se ukazují v Pravidlech › Featy, 08; nahrávají se tady u kouzel) – data: kouzla a předměty objekt, featy seznam |
| `PLNEVZ` | 10q-plne-texty:33 | let | ⓐ předmět z plného znění podle jména věci v inventáři (seznam se načte jednou, pak se karta překreslí) |
| `PM` | 04b-praha-plan:1389 | const | plán Prahy: stav měření cesty (zapnuto, body a/b, nalezená cesta, mřížka pro A*) |
| `PMA` | 04-praha:35 | const | plán Prahy: cesta ke složce obrázků plánu ("art/mapa/") |
| `PMEZE` | 04b-praha-plan:38 | const | ⓐ výřez plánu v mezích [x0, y0, x1, y1, nejmenší a největší šířka]; v celé obrazovce (02f) v poměru stran okna, jinak PAR |
| `PMU` | 04b-praha-plan:1390 | const | ⓐ metrů na jednotku plánu (podle délky Kamenného mostu) |
| `POC_N` | 07-druzina-kronika:1021 | const | počasí: klíč (jasno, dest, snih…) → český název pro ikonu na Úvodu |
| `POJ` | 15-karty-artikule:1241 | let | Glosář SRD: pojmy z art/pojmy.json podle tvaru slova → {id, en, cz, d} pro popisky v textu (null = nenačteno) |
| `POJDOV` | 02d-pojmy:21 | const | ⓘ `{` |
| `POJKOST` | 02d-pojmy:46 | const | ⓘ `/(\d+\s*(?:[dk]\d+)?(?:\s*[+−-]\s*\d+)?\)?\|\d+\s*\(\d+[dk]\d+(?:\s*[+−…` |
| `POJOBR` | 02d-pojmy:47 | const | ⓘ `POJOBR =` |
| `POJP` | 15-karty-artikule:1242 | let | Glosář SRD: probíhající Promise načítání pojmů (pojNacti) |
| `POJRE` | 15-karty-artikule:1243 | let | Glosář SRD: regex všech tvarů pojmů pro označení v textových uzlech (pojZnac) |
| `POJSEP` | 02d-pojmy:44 | const | ⓘ `"(?:\\s*,\\s*(?:(?:a\|nebo\|či\|and\|or)\\s+)?\|\\s*/\\s*\|\\s+(?:a\|nebo\|či\|…` |
| `POJSKIP` | 15-karty-artikule:1273 | const | Glosář SRD: názvy HTML značek (A, BUTTON, INPUT, H1–H4, CODE…), v nichž se pojmy neoznačují |
| `POJT` | 15-karty-artikule:1311 | let | Glosář SRD: právě zobrazený popisek pojmu (div.pojtip) nebo null |
| `POJTYPY` | 02d-pojmy:43 | const | ⓘ `Object.keys(POJZR).join("\|"),` |
| `POJVELKE` | 02d-pojmy:49 | const | ⓘ `/(^\|[.!?\|])\s*(\*\*)?\s*$/u;` |
| `POJZR` | 02d-pojmy:6 | const | ⓘ `{` |
| `POJZRRE` | 02d-pojmy:45 | const | ⓘ `new RegExp('(?<![\\p{L}'’-])(?:${POJTYPY})(?:${POJSEP}(?:${POJTYPY}))*…` |
| `POKL` | 19-karty-beyond:1055 | let | Pokladna družiny: data z databáze – {pen peníze, veci, log pohyby} nebo null |
| `PORTR` | 08-navigace-pravidla:106 | const | množina id osob, které mají portrét (klíče PORTRH) |
| `PORTRH` | 08-navigace-pravidla:105 | const | portréty osob z buildu (@PORTR@): id osoby → soubor nebo {f, m} s cestami |
| `POSL` | 02-mapa:6253 | const | pomocná funkce: první písmeno řetězce velké |
| `POTVRZDB` | 23-potvrzovani:8 | var | ⓐ nastavení z databáze (nastaveni.potvrz) – hráči ho průběžně načítají, změna nepřenačte stránky jako změna herního stavu |
| `POUTE` | 02e-krajina:2099 | const | mapa, vrstva Poutě, kláštery a pověsti: body {n, d pout|klaster|povest, lo, la, t, r řád, s stav c|p|z, v vyznání, ref místo mapy, o odsazení} |
| `POUTE_DRUH` | 02e-krajina:2090 | const | ⓘ `{pout: "Poutní místo", klaster: "Klášter", povest: "Místo pověstí"};` |
| `POUTE_STAV` | 02e-krajina:2091 | const | ⓘ `{c: "činný", p: "za válek poničený, bratří živoří", z: "zpustlý"};` |
| `POUTE_ZN` | 02e-krajina:2094 | const | mapa, vrstva Poutě: tvary značek (kříž v kruhu, kostelík, hvězda) v rámečku −5…5 |
| `POV` | 07p-povest:23 | let | ⓘ `{};` |
| `POVL` | 07p-povest:5 | const | ⓘ `{` |
| `POVOL` | 08-navigace-pravidla:438 | let | ⓐ Plné znění povolání mimo SRD (Střelec / Gunslinger, Vojtův překlad 2026-10-28) – jako featy jen pro přihlášené (klíč „povolani“) |
| `POVOLP` | 08-navigace-pravidla:439 | let | ⓘ `null;` |
| `POVOLSHR` | 08-navigace-pravidla:456 | const | ⓘ `[` |
| `POVP` | 07p-povest:14 | const | ⓘ `{` |
| `PRAHA_PLACES` | 04-praha:23 | const | ⓐ n = číslo na plánu, k = druh (dvur/urad/cirkev/hospoda), t = město, c = vyznání (kat/kal/mix/""), r = rod, p = osoba |
| `PRAHA_TOWNS` | 04-praha:2 | const | Praha: čtyři města pražská (id, název, popis) pro plán a seznam |
| `PRB` | 04-praha:24 | const | Praha: objekt plánu podle čísla na plánu (z PRAHA_PLACES) |
| `PRECH_DRUH` | 02e-krajina:1230 | const | ⓘ `{prusmyk: "Průsmyk", most: "Most", brod: "Brod", privoz: "Přívoz"};` |
| `PRECHODY` | 02e-krajina:7 | const | ⓘ `[` |
| `PRED` | 16-srd-ukazky-sezeni-hrac:2 | let | Magické předměty SRD z art/predmety.json – seznam nebo null (nenačteno) |
| `PREDBY` | 16-srd-ukazky-sezeni-hrac:4 | const | Magické předměty: index podle id předmětu |
| `PREDBYN` | 16-srd-ukazky-sezeni-hrac:5 | const | Magické předměty: index podle malého anglického i českého názvu (vyhledání z inventáře) |
| `PREDP` | 16-srd-ukazky-sezeni-hrac:3 | let | Magické předměty: probíhající Promise načítání PRED (predNacti) |
| `PRF` | 16-srd-ukazky-sezeni-hrac:43 | let | Magické předměty: filtr stránky – q hledaný text, druh, vz vzácnost |
| `PRIB` | 04b-praha-plan:142 | const | plán Prahy: nápisové pásky čtvrtí (id → [x, y, název, typ pásky, šířka, písmo]) |
| `PRIBT` | 04b-praha-plan:141 | const | plán Prahy: typ pásky (kratka, stredni, dlouha) → rozměry obrázku a svislý střed textu |
| `PRIVBY` | 11-boj:694 | const | Boj/bestiář: přívlastky (úpravy statblocku) podle id (z PRIVLASTKY) |
| `PRIVLASTKY` | 11-boj:690 | const | Boj/bestiář: přívlastky protivníků z buildu (@PRIVLASTKY@) – jen vypravěč |
| `PROTBY` | 11-boj:693 | const | Boj/bestiář: protivníci (statblocky) podle id (z PROTIVNICI) |
| `PROTIVNICI` | 11-boj:689 | const | Boj/bestiář: statblocky protivníků z buildu (@PROTIVNICI@) – hráč dostane prázdné |
| `PROTOSOBY` | 11-boj:692 | const | Boj/bestiář: osoby ze Zemských desek se statblokem z buildu (@PROTOSOBY@) |
| `PRVZ` | 16-srd-ukazky-sezeni-hrac:39 | const | Magické předměty: pořadí vzácností (běžný, neobvyklý, vzácný, velmi vzácný, legendární, artefakt, proměnlivá) |
| `PSTREETS` | 04-praha:37 | const | ⓐ názvy ulic, trhů a bran: [název, x, y, natočení] |
| `PULS` | 25-puls:7 | var | Puls: stav pravidelného dotazu na změny v databázi – z poslední verze, beh běží, znovu, t, obnov, start, stary (databáze bez pulsu) |
| `PULS_HRA` | 25-puls:8 | const | Puls: druhy změn pro stránku Hra (vyzvy, zpravy, navrhy, potvrz, pokladna) – spustí hraPoll |
| `PULTTAB` | 08-navigace-pravidla:753 | let | ⓐ záložka řídicího pultu vypravěče: boj \| druzina \| sezeni (nastaví route podle adresy) |
| `PUSHST` | 19-karty-beyond:897 | let | Web Push: stav odběru upozornění – „on“, „off“ nebo null (nezjištěno) |
| `PVB0` | 04-praha:33 | const | plán Prahy: výchozí viewBox SVG [x, y, šířka, výška] |
| `PZID` | 04b-praha-plan:151 | const | plán Prahy: body obrysu Židovského Města (tečkovaná hranice čtvrti) |
| `RADJ` | 02-mapa:6971 | const | mapa/cesty: sousednost uzlů cestní sítě (index → [{to, km, eff, road}]) pro hledání trasy |
| `RANASO` | 10p-pravidla:445 | const | ⓘ `12;` |
| `REAKCE` | 10r-reakce:30 | const | ⓐ REAKCE: [klíč, spouštěč, nabídka(f, e) → null \| {n, t, i?}] – pořadí = pořadí tlačítek |
| `REL` | 01-zaklad:3 | const | vazby mezi rody z buildu (@REL@) – ids, typ (rod/spoj/spor), text |
| `RESBY` | 02-mapa:6699 | const | rešerše postav podle id (z RESERS) – jen vypravěč |
| `RESERS` | 02-mapa:6698 | const | ⓐ osudy postav po březnu 1458: jen ve vypravěčských datech (hráčům přijde prázdná) |
| `RGL` | 01-zaklad:298 | const | typ vazby (rod, spoj, spor) → nadpis skupiny (Krev, Spojenectví, Spory) |
| `RGRAF` | 06-draconomicon-rodokmeny:107 | let | rodokmeny: propojený graf osob všech rodokmenů (lazy, vytvoří rodGraf) |
| `RGVZ` | 06-draconomicon-rodokmeny:238 | const | rodokmeny: kód vztahu (P, C, S, PC…) → [mužský, ženský] název (otec/matka, syn/dcera…) |
| `RICON` | 01-zaklad:296 | const | typ vazby (rod, spoj, spor) → cesta k ikoně vazby |
| `RIMV` | 07-druzina-kronika:851 | const | ⓐ hodiny 2 × 12 („půl orloj“, jako římské číslice pražského orloje), unciálními kapitálami; čtyřka IIII jako na ciferníku |
| `RIVERS` | 02-mapa:13 | const | mapa: linie řek (lon/lat) pro kresbu a přechody řek |
| `RIVLBL` | 02b-mapa-kresba:14976 | const | kresba mapy: popisky řek ([název, lon, lat, natočení]) |
| `RIVNAMES` | 09-vypravec-herni-cas:332 | const | ⓐ řeky z mapy (pořadí jako RIVERS), stálé mosty roku 1458 a známá mýtná místa |
| `RKELEM` | 10r-reakce:15 | const | Okno reakce (10r): typy zranění, proti kterým pomáhá Absorb Elements |
| `RN` | 02-mapa:6970 | const | mapa/cesty: uzly cestní sítě (souřadnice) pro hledání nejkratší trasy |
| `ROADS` | 02-mapa:852 | const | mapa: stezky ([název, body, váha]) pro kresbu a cestní síť |
| `RORD` | 02-mapa:6070 | const | typ vazby (rod, spoj, spor) → pořadí řazení ve výpisu vazeb |
| `RSIT` | 02-mapa:6986 | let | ⓘ `false;` |
| `RZENA` | 06-draconomicon-rodokmeny:100 | const | rodokmeny: odhad, zda je jméno ženské (končí na -a/-e/-ě, výjimky Protiva, Ota) |
| `SCAB` | 20f-scena:4 | const | ⓘ `["STR", "DEX", "CON", "INT", "WIS", "CHA"];` |
| `SCITY` | 05-svet:150 | const | ⓐ města jako obrázky: [obrázek, velikost]; ostatní hlavní města dostanou opevněné město |
| `SCPOST` | 20f-scena:5 | const | ⓘ `[` |
| `SCPROTI` | 20f-scena:11 | const | ⓐ protihod NPC k dovednosti hráče: na přesvědčování, klam a zastrašování Vhled, na plížení a kapsářství Vnímání |
| `SETBY` | 11-boj:695 | const | Boj/bestiář: hotová setkání podle id (z SETKANI) |
| `SETKANI` | 11-boj:691 | const | Boj/bestiář: hotová setkání z buildu (@SETKANI@) – jen vypravěč |
| `SEZ` | 16-srd-ukazky-sezeni-hrac:417 | const | Příprava sezení (vypravěč): stav – d data (scény), cur aktuální scéna, t timeout uložení, lok = jen lokálně bez databáze |
| `SFICON` | 01-zaklad:173 | const | Známý svět: vyznání (kat, kal, pra, isl, mix) → ikona víry (navíc pravoslaví) |
| `SG` | 05-svet:293 | let | Známý svět: načtená geometrie mapy světa (art/svet.json po svRozbal: proj, land…); null do načtení |
| `SHCOL` | 05-svet:209 | const | ⓐ hlavní obchodní trasy: složené z úseků cest v svet-cesty.md [název, směr, odkud, kam] |
| `SHL` | 05-svet:261 | let | Známý svět: hlavní obchodní trasy složené do bodů (lazy z SHLAVNI, vytvoří sHlavni) |
| `SHLAVNI` | 05-svet:210 | const | Známý svět: hlavní obchodní trasy (klíč, název, úseky cest se směrem) – Hanza, Benátky, Janov… |
| `SHORT` | 02-mapa:6500 | const | ⓐ relationship graph |
| `SIMG` | 05-svet:113 | const | mapa světa: ilustrace (město, gryf, fénix…) → [šířka, výška, složka] |
| `SKURF` | 05-svet:9 | const | ⓐ kurfiřtská knížectví – přibližné obrysy (zeměpisné souřadnice); sedmým kurfiřtem je český král |
| `SLABPOS` | 05-svet:473 | const | ⓐ ručně umístěné popisky velkých mocností (zeměpisná délka, šířka) |
| `SLODE` | 05-svet:189 | const | ⓐ lodě a obludy [obrázek, délka, šířka, šířka obrázku, zrcadlit], růžice portulánu [délka, šířka, velká] |
| `SLZ_NOC` | 10y-sluzby:9 | const | ⓐ noclehy na výpravě: os = cena na osobu a noc, kun = píce a stáj za koně, dar = dar v klášteře (jednou za družinu), vše v groších |
| `SLZ_PRACDNY` | 10y-sluzby:7 | const | ⓐ pracovních dnů v roce (mzdy se platí za den, svátky měsíčně asi tři) |
| `SM` | 05-svet:295 | const | mapa světa: stav měření cesty (zapnuto, body a/b, nalezená cesta) |
| `SMA` | 05-svet:112 | const | mapa světa: cesta ke složce ilustrací ("art/svet/") |
| `SMEZE` | 05b-svet-mapa:4 | const | ⓐ výřez mapy světa v mezích [x0, y0, x1, y1, nejmenší a největší šířka]; v celé obrazovce (02f) v poměru stran okna, jinak 1024 : 790 |
| `SNET` | 05-svet:312 | let | mapa světa: síť cest pro hledání trasy (uzly, sousednost, podle názvu, obálky pevnin) |
| `SOBLUDY` | 05-svet:197 | const | mapa světa: mořské obludy ([soubor, lon, lat, šířka, zrcadlit]) v Atlantiku |
| `SP` | 05-svet:513 | function | mapa světa: projekce lon/lat → souřadnice SVG (kónická podle SG.proj) |
| `SPORT` | 05-svet:201 | const | mapa světa: středy portulánových růžic ([lon, lat, velká]) pro síť větrů |
| `SRCOL` | 05-svet:6 | const | mapa světa: druh cesty (hanza, benatky, janov, reka, pout…) → barva |
| `SRDIC` | 11-boj:334 | const | Boj: český stav SRD (oslepen, okouzlen…) → název ikony (bez diakritiky) |
| `SRDP` | 08-navigace-pravidla:352 | let | Pravidla: načtený překlad SRD (art/pravidla.json), null do načtení |
| `SRDPP` | 08-navigace-pravidla:353 | let | Pravidla: probíhající promise načítání art/pravidla.json – jedno načtení |
| `SRDRY` | 17-karty-ii:70 | let | SRD rysy: rejstřík rysů povolání a featů z art/srd-rysy.json (null = nenačteno) |
| `SRDRYP` | 17-karty-ii:71 | let | SRD rysy: probíhající Promise načítání SRDRY (srdRysy) |
| `SRDRYT` | 17-karty-ii:124 | let | ⓐ české texty rysů SRD (art/srd-rysy-texty.json): načtou se až s prvním oknem rysu |
| `SRDRYTP` | 17-karty-ii:125 | let | ⓘ `null;` |
| `SRDST` | 10p-pravidla:10 | const | Boj: stavy SRD česky → {en název, ut útok, cil, zach, nej, k5, res, t popis} pro automatiku |
| `SRDUR` | 19-karty-beyond:159 | let | SRD úrovně: tabulky povolání podle úrovně z art/srd-urovne.json pro postup na úroveň (null = nenačteno) |
| `SRDURP` | 19-karty-beyond:160 | let | SRD úrovně: probíhající Promise načítání SRDUR (srdUrovne) |
| `SRIVHL` | 05-svet:187 | const | ⓐ v celkovém pohledu jen tato města; ostatní po přiblížení |
| `SRSEA` | 05-svet:7 | const | mapa světa: druhy cest po moři/řece (hanza, benatky, janov, poutlod, reka) – jiná kresba |
| `SSEAS` | 05-svet:497 | const | ⓐ moře, hory: zeměpisné souřadnice |
| `STAV` | 09-vypravec-herni-cas:2 | const | vypravěč: stavy odhalení podle id (0 skryté, 1 slyšeli, 2 potkali) z __D.STAV |
| `STBY` | 15-karty-artikule:218 | const | Šerm: index technik a chvatů STECH podle id (zornhau…) → {n název, cena, poz, účinek} |
| `STECH` | 15-karty-artikule:123 | const | ⓐ techniky a chvaty: id, název, cena, Požehnání (1) / reakce (r) / bonusová akce (b), účinek |
| `STLBL` | 09-vypravec-herni-cas:3 | const | vypravěč: popisky stupňů odhalení (Skryté, Slyšeli, Potkali) |
| `STOPA_POHLEDY` | 07s-stopa:5 | const | ⓘ `[` |
| `STOPAG` | 07-druzina-kronika:231 | const | ⓐ úsek mezi dvěma místy po síti cest (computeRoute v 02); bez cesty po souši (ostrov) nebo neznámé místo → rovná čára |
| `STOPAP` | 07-druzina-kronika:214 | let | ⓘ `null;` |
| `STRKOUSKY` | 10x-strelec:23 | const | ⓐ kousky: [klíč, anglicky, česky, čas (BA bonusová akce, R reakce, 0 bez akce), od úrovně, krátký popis]; lhar jen Karbaník |
| `SUBT` | 08-navigace-pravidla:21 | const | navigace: id stránky → podtitul hlavičky („Koruna česká k 3. březnu…“) |
| `SVATKYD` | 07-druzina-kronika:637 | const | ⓐ datování po středověku: svátek dne a neděle církevního roku (juliánský kalendář, Velikonoce podle starého výpočtu) |
| `SVB` | 05-svet:109 | const | Známý svět: mocnosti podle id (z SVET) – rychlé hledání |
| `SVB0` | 05-svet:310 | const | mapa světa: výchozí viewBox SVG [0, 0, 1024, 790] |
| `SVET` | 05-svet:2 | const | Známý svět: mocnosti z buildu (@SVET@) – id, název, vyznání, spojenci, nepřátelé |
| `SVETCESTY` | 05-svet:5 | const | Známý svět: cesty z buildu (@SVETCESTY@) – název, druh, body |
| `SVETDRZ` | 05-svet:4 | const | Známý svět: državy mocností z buildu (@SVETDRZ@) – polygony |
| `SVETLA` | 10p-pravidla:429 | const | ⓘ `[` |
| `SVETMESTA` | 05-svet:3 | const | Známý svět: města z buildu (@SVETMESTA@) – název, poloha, mocnost |
| `SVIRA` | 05-svet:291 | const | Známý svět: vyznání (kat, pra, isl, mix, kal) → název (katolíci, pravoslavní…) |
| `SVIRAC` | 05-svet:292 | const | Známý svět: vyznání → barva (CSS proměnná) pro odznak a mapu |
| `SVMOB` | 05-svet:311 | const | mapa světa: výchozí viewBox na telefonu (přiblíženo na střední Evropu) |
| `SVPALIVO` | 10p-pravidla:436 | const | ⓘ `/^(oil\|olej)\b/i;` |
| `SVPC` | 02-mapa:814 | const | ⓘ `new WeakMap();` |
| `SVST` | 07-druzina-kronika:24 | const | Svědomí: hodnota 0–10 → stupeň (Zatracený, Na scestí, Na vážkách, V milosti) |
| `SZDB` | 16-srd-ukazky-sezeni-hrac:418 | const | Příprava sezení: přístup k uložení – nacti/uloz přes MMDB.gm (mm_sezeni_*), bez databáze lokálně (SEZ.lok) |
| `TABDOV` | 10j-tabulky:16 | const | ⓐ dovednost či název hodu → situace (anglicky i česky, jak je píše karta a záznam) |
| `TABPOK` | 10j-tabulky:32 | const | ⓐ Pokušení odmítnuto → komplikace (výsledek hodu platí, jen se něco přidá) |
| `TABPOZ` | 10j-tabulky:110 | const | ⓐ Požehnání → dodatečný příznivý účinek (výsledek hodu platí, jen se něco přidá) |
| `TABSEPOT` | 10j-tabulky:188 | const | ⓐ šepot Pokušení: co hlas za Závojem nabízí, když hráč váhá, zda Pokušení přijmout (přijetí = bod hříchu) |
| `TABSIT` | 10j-tabulky:7 | const | ⓐ situace hodu: klíč → název; podle ní se vybírá tabulka |
| `TABZVESTI` | 10j-tabulky:204 | const | ⓐ zvěsti v krčmě: háčky pro vypravěče (obecné, bez skutečných osob – jména a rody doplní vypravěč) |
| `TAHDRUH` | 10t-tah:15 | const | ⓐ druhy akcí: A akce, BA (i B) bonusová akce, P pohyb, A2 druhá akce (Action Surge), AH akce z Haste; přijímá i jména polí |
| `TITL` | 08-navigace-pravidla:36 | const | navigace: id stránky → titulek okna (document.title) |
| `TOWNICO` | 01-zaklad:294 | const | mapa: cesta k ikoně města pro sídla rodů, která jsou městy |
| `TOWNS` | 02-mapa:6716 | const | ⓐ routing: roads become a graph; off-road legs and forest/mountain terrain cost more time |
| `TOWNSEATS` | 01-zaklad:182 | const | mapa: názvy sídel rodů, která jsou města (ne hrady) – kreslí se ikonou města |
| `TRAKTATY` | 07-druzina-kronika:89 | const | Kronika › Traktáty: články o světě z buildu (@TRAKTATY@) – id, t název, h text; sl = družina jen slyšela (bez textu) |
| `TRBY` | 07-druzina-kronika:90 | const | Kronika › Traktáty: traktát podle id (z TRAKTATY) |
| `TREEALIAS` | 06-draconomicon-rodokmeny:84 | const | rodokmeny: id rodu → id rodu, jehož rodokmen sdílí (fra → bra) |
| `TREES` | 06-draconomicon-rodokmeny:83 | const | ⓐ p = osoba v zemských deskách, r = rod, d = data, m = z kterého manželství, note = poznámka |
| `TRIBS` | 02b-mapa-kresba:14043 | const | kresba mapy: linie přítoků (menší řeky, lon/lat) kreslené tenčí čárou |
| `TSTAV` | 06-draconomicon-rodokmeny:271 | const | ⓐ stav rodokmenů: zaostřená osoba, vybrané manželství, historie procházení |
| `UCETR` | 08-navigace-pravidla:1076 | let | ⓐ otevřený formulář: "" (jen tlačítka), "novy", "prihlas" |
| `UCINKY` | 10u-ucinky:18 | const | Účinky v jednom formátu (10u, čisté): jméno → posílení (ac, rych, zach, res, hpmax…) a kostky k hodům (kostka, na, jednou, poHodu); dřív KZEF + KPRID |
| `UCTYPY` | 10u-ucinky:266 | const | Účinky (10u): všech 13 typů zranění pro Resistance „vse“ (Warding Bond, Feign Death…) |
| `UKAZKY` | 16-srd-ukazky-sezeni-hrac:238 | let | Ukázky od vypravěče (obrázek, dopis, mapka) načtené z databáze, nejnovější první |
| `UKDB` | 16-srd-ukazky-sezeni-hrac:237 | const | Ukázky: přístup k databázi – nacti/uloz/smaz přes MMDB.ukazky*, null bez databáze |
| `UKPOLL` | 16-srd-ukazky-sezeni-hrac:239 | let | Ukázky: příznak spuštěného pravidelného načítání ukázek (jen jednou) |
| `UZINY` | 02e-krajina:1730 | const | ⓘ `[` |
| `VAPID_PUB` | 19-karty-beyond:892 | const | Web Push: veřejný VAPID klíč serveru pro přihlášení k odběru upozornění (applicationServerKey) |
| `VB` | 02-mapa:665 | const | mapa: viewBoxy přiblížení podle klíče (all, koruna, cechy, morava, slezsko, luzice) |
| `VBW` | 02-mapa:723 | const | ⓐ výchozí výřezy široké mapy: „Se sousedy“ od Lužice po Budín a od Bavor po Košice |
| `VECAB` | 10v-veci:34 | const | ⓘ `["STR", "DEX", "CON", "INT", "WIS", "CHA"];` |
| `VECDR` | 10v-veci:32 | const | ⓘ `["Vycpávaná", "Kroužková", "Plátová", "Komplexní"];` |
| `VECPKX` | 10v-veci:36 | const | ⓐ výjimky z pravidla perků (Artikule › Zbraně): meče, halapartna a hákovnice smí mít víc než jeden pasivní a jeden aktivní perk |
| `VECVZ` | 10v-veci:33 | const | ⓘ `["běžný", "neobvyklý", "vzácný", "velmi vzácný", "legendární", "artefa…` |
| `VECZT` | 10v-veci:17 | const | ⓘ `[` |
| `VERNOST_MIST` | 02e-krajina:1849 | const | mapa, vrstva Věrnost králi: věrnost měst podle jména [skupina, dobová věta]; rody mají věrnost v poli vernost (f.vern, jen u rodů, které družina potkala) |
| `VERNOST_SKUP` | 02e-krajina:1843 | const | mapa, vrstva Věrnost králi: skupiny postoje k Jiřímu k 3. 3. 1458 (věrní, váhají, odpůrci, cizí nárok) → popisek, barva lemu, čárkování |
| `VIEWS` | 08-navigace-pravidla:2 | const | navigace: seznam id stránek (hra, uvod, svet, mapa…) pro router route() |
| `VODA_CESTA` | 02e-krajina:1264 | const | ⓘ `[` |
| `VRCHOVINY` | 02-mapa:5883 | const | ⓘ `[` |
| `VY` | 22-vyprava:591 | let | Výprava: stav výpravy – mapa, z/do, zp způsob, odch, zdrz, tempo, start, teren, setkání, konec… (ukládá se do databáze) |
| `VY_BOXY` | 22b-vyprava:203 | const | Výprava: id boxů s mapou podle mapy (svet smapbox, koruna kmapbox, praha pmapbox) |
| `VY_CHCE` | 22b-vyprava:1738 | const | Výprava lidé na cestě: náhodná přání pocestného („dostat se domů dřív než bouře“…) |
| `VY_DELKA` | 22-vyprava:25 | const | Výprava: délky výpravy [stupeň, název, základ obtížnosti] – Krátká cesta bez pravidel… Velmi dlouhá výprava |
| `VY_JM` | 22b-vyprava:1629 | const | ⓐ lidé na cestě |
| `VY_KRAJ` | 22-vyprava:32 | const | Výprava: kraje → [název, písmeno pro tabulky setkání] – pole P, les L, hory H, mesto M, voda V, stezky K, valka W, zavoj Z |
| `VY_LOK` | 22-vyprava:595 | let | Výprava: příznak, že stav běží jen lokálně (bez databáze nebo načtení selhalo) |
| `VY_NACTENO` | 22-vyprava:594 | let | Výprava: příznak, že stav výpravy byl načten z databáze |
| `VY_NIZ` | 22-vyprava:371 | const | Výprava: obdélníky [lo1, la1, lo2, la2] nížin Koruny české – určení typu místa (vyMisto) |
| `VY_NOC` | 22b-vyprava:1600 | const | ⓘ `{` |
| `VY_NOVA` | 22-vyprava:596 | const | Výprava: továrna na výchozí stav výpravy (v 1, mapa koruna, zp pesky, odch 1, konec…) |
| `VY_ODCH` | 22-vyprava:17 | const | Výprava: odchylka od odhadu času [násobek, popisek] – o čtvrtinu rychleji… dvakrát déle |
| `VY_POV` | 22b-vyprava:1720 | const | Výprava lidé na cestě: náhodné povahy pocestného (podezíravý, upovídaný, zbožný…) |
| `VY_PRIJ` | 22-vyprava:278 | const | Výprava: tabulka příjezdu [horní mez hodu, název, popis] – Nečekané nebezpečí… Bezpečí (odpočinek) |
| `VY_PRIP` | 22-vyprava:73 | const | ⓐ přípravy (SO 13); o = obtížnost cesty při úspěchu, f = při neúspěchu, o5 = při úspěchu o 5 a víc |
| `VY_PRIZ` | 22b-vyprava:1685 | const | Výprava lidé na cestě: náhodné přízviska (Černý, Malý, Bezzubý, Kulhavý…) |
| `VY_REZ` | 22-vyprava:344 | const | Výprava počasí: povětrnostní režimy (tlaková výše, západní proudění, fronta…) → {n, w váhy podle sezóny, ta teplota, p déšť, v vítr, typ} |
| `VY_ROLE` | 22-vyprava:42 | const | Výprava: role v družině (vudce, zved, zasob, hlidka) → {n název, sch schopnost, hod ověření} |
| `VY_STAV` | 22b-vyprava:1702 | const | Výprava lidé na cestě: stavy pocestných [stav, váha, příjmení|] – sedlák, měšťan, řemeslník, kupec, zeman… |
| `VY_TAJ` | 22b-vyprava:1756 | const | Výprava lidé na cestě: náhodná tajemství pocestného („je ve skutečnosti Proměněnec“…) |
| `VY_TEMPO` | 22-vyprava:24 | const | Výprava: tempo cesty → [název, násobek času] – normal 1, spech 0.85, opatrne 1.15 |
| `VY_TMAX` | 22-vyprava:334 | const | ⓐ průměry kolem 300 m n. m., o stupeň chladnější než dnes (počátek malé doby ledové) |
| `VY_TMIN` | 22-vyprava:335 | const | Výprava počasí: průměrné měsíční noční minima °C (leden–prosinec), chladnější než dnes |
| `VY_TYPY` | 22-vyprava:132 | const | Výprava: typy setkání na cestě (Setkání na cestě, Nesnáz…) → {n, r role, jak postup, v výsledky} |
| `VY_VIRA` | 22b-vyprava:1510 | const | Výprava: vyznání panství → název (kal kališníci, kat katolíci, mix smíšené, isl muslimové, old starověrci) |
| `VY_VITR` | 22-vyprava:499 | const | Výprava počasí: popisky síly větru podle stupně (bezvětří… vichřice) |
| `VY_ZAVOJ` | 22-vyprava:286 | const | Výprava počasí: vzácné úkazy Závoje v popisu počasí („Déšť má nazelenalý třpyt“…) |
| `VY_ZAZ` | 22-vyprava:271 | const | Výprava: tabulky záznamů setkání podle indexu typu (z VYZAZ) – [{r kraje, n, t, k ověření, b boj}] |
| `VY_ZP` | 22-vyprava:10 | const | Výprava: způsoby cesty [klíč, název, km/den, km/h v Praze] – pesky, kun, vuz, posel, drak |
| `VYB` | 14d-vybaveni-katalog:4 | let | Vybavení katalog: data z art/vybaveni.json podle skupiny (zbroj, zbrane…, vlastnosti) nebo null |
| `VYBBY` | 14d-vybaveni-katalog:6 | const | Vybavení katalog: index položek podle id |
| `VYBF` | 14d-vybaveni-katalog:183 | let | Vybavení katalog: filtr stránky Pravidla › Vybavení – q hledaný text, sk skupina, vz vzácnost (t timeout) |
| `VYBK` | 14d-vybaveni-katalog:131 | let | ⓐ postava, do které se na stránce Vybavení přidává: hráč svou, vypravěč vybranou |
| `VYBMINC` | 14d-vybaveni-katalog:148 | const | ⓘ `{"Gold Piece": "GP", "Silver Piece": "SP", "Copper Piece": "CP"},` |
| `VYBMKURZ` | 14d-vybaveni-katalog:149 | const | ⓘ `{GP: "40 grošů", SP: "10 haléřů", CP: "nejmenší mince"};` |
| `VYBN` | 14d-vybaveni-katalog:7 | const | Vybavení katalog: index položek podle normalizovaného anglického i českého názvu (vybNajdi) |
| `VYBP` | 14d-vybaveni-katalog:5 | let | Vybavení katalog: probíhající Promise načítání VYB (vybNacti) |
| `VYBSK` | 14d-vybaveni-katalog:8 | const | Vybavení katalog: skupiny [klíč, název] – zbroj, zbrane, strelivo, vybava, naradi, zvirata, sedla, vozy, plavidla, magicke… |
| `VYBSKN` | 14d-vybaveni-katalog:21 | const | Vybavení katalog: názvy skupin podle klíče (objekt z VYBSK) |
| `VYS` | 22-vyprava:593 | let | Výprava: spočtený průběh – {H hodiny, dl délka, gc, dny, prij příjezd, W počasí, T terén, dr družina role, reviry…} nebo null |
| `VYT` | 22-vyprava:592 | let | Výprava: spočtená trasa (vyTrasa) – {m mapa, z, do, h hodiny, plan, p body…} nebo null |
| `VYZ_ZIVOT` | 16-srd-ukazky-sezeni-hrac:1110 | const | ⓐ jak dlouho čeká výzva na hráče: starší (vypravěč ji zapomněl uzavřít, sezení skončilo) se už neukáže a vypravěč ji uzavře |
| `VYZAZ` | 22-vyprava:270 | const | Výprava: záznamy setkání vložené generátorem (/*@VYZAZ@*/, jen vypravěč) – [{i index typu, z záznamy}] |
| `VYZODP` | 16-srd-ukazky-sezeni-hrac:1090 | let | Výzvy k hodu (vypravěč): poslední známý počet odpovědí hráčů – při nárůstu překreslí Boj |
| `VYZUKL` | 16-srd-ukazky-sezeni-hrac:1210 | const | ⓐ vypravěč: zapomenuté výzvy uzavře sám – starší než VYZ_ZIVOT a iniciativu, když příprava boje skončila (boj začal nebo se zrušil) |
| `VYZVY` | 16-srd-ukazky-sezeni-hrac:1089 | let | Výzvy k hodu načtené z databáze (hod, záchrana, iniciativa) s odpověďmi hráčů |
| `ZAPISY` | 07-druzina-kronika:83 | var | Kronika: zápisy ze sezení z buildu (@ZAPISY@) – trasa, místo, text; poslední určuje polohu družiny |
| `ZBRMA` | 10w-zbrane:30 | const | ⓐ mistrovství zbraní SRD 5.2.1 (tabulka Zbraně v Pravidlech › Výbava) |
| `ZBRMS` | 10w-zbrane:19 | const | ⓘ `{` |
| `ZBRPOMALE` | 10w-zbrane:143 | const | ⓘ `["Heavy Crossbow", "Musket", "Pistol"];` |
| `ZBRVL` | 10w-zbrane:7 | const | ⓘ `{` |
| `ZBY` | 07-druzina-kronika:87 | var | Kronika: zápis podle id (z ZAPISY) – rychlé hledání zápisu |
| `ZEMEPIS` | 01-zaklad:5 | const | ⓐ zeměpis: královská města a sídla církevních vrchností jsou na mapě vždy, i když družina rod nezná |
| `ZMENY` | 23-potvrzovani:271 | var | Časová osa sezení (vypravěč): změny karet, boje a herního času z databáze (MMDB.zmeny) k vrácení |
| `ZMFLT` | 23-potvrzovani:273 | var | Časová osa: filtr druhu změn („vse“ nebo druh) |
| `ZMOD` | 23-potvrzovani:272 | var | Časová osa: rozsah zpětně (1h, 6h, 24h, 7d) |
| `ZMPOLE` | 23-potvrzovani:274 | var | Časová osa: popisky změněných polí karty (hp životy, thp, kz, vycerp, insp, zdr, inv vybavení, pen, pozn…) |
| `ZPR` | 16-srd-ukazky-sezeni-hrac:1316 | let | Tajné zprávy (hráč): zprávy mezi vypravěčem a přihlášenou postavou |
| `ZPRG` | 16-srd-ukazky-sezeni-hrac:1317 | let | Tajné zprávy (vypravěč): všechny zprávy všech postav (MMDB.zpravyGm) |
| `ZPRK` | 16-srd-ukazky-sezeni-hrac:1318 | let | Tajné zprávy (vypravěč): id karty vybrané v pultu družiny pro vlákno zpráv |
| `ZPUSTLE` | 02e-krajina:992 | const | ⓘ `[` |
