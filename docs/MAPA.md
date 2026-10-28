# Mapa souborů skriptu

Generuje `npm run mapa` (testy/kontrola_kodu.mjs --mapa) – **neupravuj ručně**, po větší změně obnov. Pořadí souborů = pořadí ve
skriptu; jádro 01–09 + 26 se stahuje hned, díly 10–25 líně, části `02b 04b 05b 21 22b` až na své stránce (viz CLAUDE.md).
Podrobnosti k jednomu jménu nebo souboru: `node testy/kontrola_kodu.mjs --kde JMÉNO` / `--soubor NN`.

## 01-zaklad

Základ: data z buildu (rody, vazby, zeměpis, erby), víry a ikony, odkazy mezi stránkami (mmLina), odložené překreslení (mmPozdeji)

- 252 řádků, 35 definic na nejvyšší úrovni, z toho 27 používají jiné soubory
- používá z: 02-mapa (1)
- používají ho: 02-mapa (20), 02b-mapa-kresba (7), 03-artikule (1), 04b-praha-plan (7), 05b-svet-mapa (2), 06-draconomicon-rodokmeny (2), 07-druzina-kronika (7), 08-navigace-pravidla (13), 09-vypravec-herni-cas (3), 10-kouzla (3), 10q-plne-texty (1), 11-boj (3), 12-boj-tah-postavy (1), 13-karty (4), 14-karty-bojova-karta (1), 14b-vybaveni (1), 14c-boj-reakce (1), 14d-vybaveni-katalog (1), 15-karty-artikule (2), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (2), 17b-kouzla-ucinky (1), 18-pravidla-postavy (1), 19-karty-beyond (1), 19b-automatika (1), 20-boj-hraci (2), 20b-boj-vypravec (1), 20c-boj-ridery (1), 20d-boj-render (2), 20e-boj-vlastnosti (1), 20f-scena (1), 20g-boj-mistrovstvi (1), 21-editor-pecet (2), 22-vyprava (2), 22b-vyprava (4), 23-potvrzovani (1), 24-boj-zaznam (1), 26-start (3)
- poskytuje: besc byId FAM mmDex armsImg FICON mmLina ARMS CONFN mileTxt CARMS faith shield0 CASTLEICO mmPozdeji mmZrus relGroups rIco TOWNICO TOWNSEATS ZEMEPIS mmLinyHotove mmLinyPro REL SFICON shield townImg
- oddíly:
  - ř. 184: Samostatné části skriptu (2026-10-19): kresba map, plán Prahy, mapa světa, Výprava a editor textů se stahují,

## 02-mapa

map geometry

- 7605 řádků, 170 definic na nejvyšší úrovni, z toho 91 používají jiné soubory
- používá z: 01-zaklad (20), 02b-mapa-kresba (1), 02c-zbroj (1), 02e-krajina (17), 02f-mapa-cela (1), 02g-mista (1), 04-praha (3), 05-svet (1), 07-druzina-kronika (2), 08-navigace-pravidla (2)
- používají ho: 01-zaklad (1), 02b-mapa-kresba (49), 02f-mapa-cela (2), 03-artikule (4), 04b-praha-plan (5), 05-svet (1), 05b-svet-mapa (7), 06-draconomicon-rodokmeny (3), 07-druzina-kronika (15), 08-navigace-pravidla (18), 09-vypravec-herni-cas (18), 10-kouzla (5), 11-boj (10), 12-boj-tah-postavy (6), 13-karty (1), 14-karty-bojova-karta (6), 14b-vybaveni (4), 14c-boj-reakce (2), 14d-vybaveni-katalog (5), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (1), 17b-kouzla-ucinky (1), 18-pravidla-postavy (2), 19-karty-beyond (1), 20-boj-hraci (3), 20b-boj-vypravec (3), 20c-boj-ridery (1), 20e-boj-vlastnosti (1), 22-vyprava (1), 22b-vyprava (13), 24-boj-zaznam (1), 26-start (2)
- poskytuje: BZRT bikZv bikZr PBY PEOPLE st _nrm bikZb BVLZ drawMap el bikZrTxt haversine P SHORT placeBy BAZINY computeRoute DIO DUCHY FORESTS inPoly mapDrag NAMEPTS nearMountain norm peopleOf relsFor renderDetail renderTravel show showMisto svg svgG TOWNS updateRoute bikZbTip BZVK days drawGraph … (+51)

## 02b-mapa-kresba

Mapa zemí: kresba (geometrie zemí, diecézí, panství, lesů a hor a funkce drawMap) – samostatná část „mapa“, načte se až na stránce Mapa či Výprava (2026-10-19)

- 16871 řádků, 44 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: 01-zaklad (7), 02-mapa (49), 02e-krajina (9), 02g-mista (1), 07-druzina-kronika (1), 08-navigace-pravidla (1)
- používají ho: 02-mapa (1)
- poskytuje: drawMapK
- oddíly:
  - ř. 11737: Moře a pobřeží (2026-10-27, Vojta): Baltské moře se zálivy a Jadran z Natural Earth (public domain; podklady/k

## 02c-zbroj

@čisté – Druhy zbroje podle Artikulí (2026-10-23): Resistance a výdrž zbroje, druh zbroje z popisu AC

- 27 řádků, 2 definic na nejvyšší úrovni, z toho 2 používají jiné soubory
- používá z: –
- používají ho: 02-mapa (1), 10p-pravidla (2), 11-boj (2), 12-boj-tah-postavy (2), 14-karty-bojova-karta (1), 14d-vybaveni-katalog (1), 18-pravidla-postavy (1), 20e-boj-vlastnosti (1)
- poskytuje: BZBR bikZbDruhy

## 02d-pojmy

@čisté – Pojmy pro zobrazení česky (Vojta 2026-10-24): typy zranění, odolnost / imunita / zranitelnost, dovednosti a Univerzální.

- 109 řádků, 12 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: –
- používají ho: 26-start (1)
- poskytuje: pojmyCz

## 02e-krajina

@čisté – Krajina roku 1458 na mapě zemí (2026-10-26, Vojta): přechody (průsmyky, mosty, brody, přívozy), hospodářství (doly, sůl,

- 2822 řádků, 24 definic na nejvyšší úrovni, z toho 18 používají jiné soubory
- používá z: –
- používají ho: 02-mapa (17), 02b-mapa-kresba (9), 09-vypravec-herni-cas (1), 22b-vyprava (5)
- poskytuje: PRECHODY ZPUSTLE HOSP_BODY HOSP_OBL naVode POUTE POUTE_DRUH POUTE_ZN PRECH_DRUH prechodStav prechodyNaTrase VERNOST_SKUP vernostMista HOSP_DRUH konfliktyKoruny POUTE_STAV presUzinu zpustlyKraj
- oddíly:
  - ř. 1261: Voda pro výpočet cest (2026-10-27, Vojta): moře, zálivy a velká jezera hrubě a zúženě o 2–3 km od břehu (podkl
  - ř. 1727: SEVER (mapa 2026-10-27): úžiny užší, než aby je pokryla VODA_CESTA (zúžená od břehu) – Strelasund, Fehmarnsund
  - ř. 1838: Věrnost králi k 3. 3. 1458 (vrstva mapy, 2026-10-27, Vojta)
  - ř. 2085: Poutě, kláštery a pověsti (vrstva mapy, 2026-10-27, Vojta)
  - ř. 2754: Konflikty na mapě (2026-10-28, Vojta): vrstva „Konflikty“

## 02f-mapa-cela

Mapy přes celou obrazovku (2026-10-27, Vojta)

- 159 řádků, 11 definic na nejvyšší úrovni, z toho 2 používají jiné soubory
- používá z: 02-mapa (2), 04-praha (2), 04b-praha-plan (1), 05-svet (2), 05b-svet-mapa (1)
- používají ho: 02-mapa (1), 04b-praha-plan (2), 05b-svet-mapa (2)
- poskytuje: celaPomer celaVyrez

## 02g-mista

Shrnutí míst mapy (CITYINFO) – samostatná část „mista“ (2026-10-28): stovky míst od Baltu po Jadran už jádro webu nenese;

- 2643 řádků, 1 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: –
- používají ho: 02-mapa (1), 02b-mapa-kresba (1), 07-druzina-kronika (1)
- poskytuje: CITYINFO

## 03-artikule

Artikule: pravidla tažení, rozdělená do knih a kapitol

- 1112 řádků, 17 definic na nejvyšší úrovni, z toho 5 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (4), 07-druzina-kronika (1), 15-karty-artikule (1)
- používají ho: 07-druzina-kronika (3), 08-navigace-pravidla (3)
- poskytuje: ARTK ARTB GLOSS strip renderArtikule
- oddíly:
  - ř. 17: Slovníček pojmů

## 04-praha

Praha: plán města

- 39 řádků, 15 definic na nejvyšší úrovni, z toho 15 používají jiné soubory
- používá z: –
- používají ho: 02-mapa (3), 02f-mapa-cela (2), 04b-praha-plan (13), 05b-svet-mapa (1), 06-draconomicon-rodokmeny (1), 07-druzina-kronika (5), 08-navigace-pravidla (5), 09-vypravec-herni-cas (1), 10-kouzla (2), 10q-plne-texty (1), 11-boj (1), 12-boj-tah-postavy (1), 13-karty (1), 14-karty-bojova-karta (1), 14b-vybaveni (1), 14c-boj-reakce (1), 14d-vybaveni-katalog (1), 15-karty-artikule (1), 16-srd-ukazky-sezeni-hrac (1), 17-karty-ii (1), 17b-kouzla-ucinky (1), 19-karty-beyond (1), 19b-automatika (1), 20-boj-hraci (1), 20b-boj-vypravec (1), 20c-boj-ridery (1), 20d-boj-render (1), 20e-boj-vlastnosti (1), 20f-scena (1), 20g-boj-mistrovstvi (1), 21-editor-pecet (1), 22-vyprava (1), 22b-vyprava (4), 23-potvrzovani (1), 24-boj-zaznam (1), 25-puls (1), 26-start (1)
- poskytuje: GMV PRAHA_PLACES PRB PG prLinks pst pcol PMA PRAHA_TOWNS PVB0 PAR pcolP PKIND PSTREETS pVis

## 04b-praha-plan

Praha: kreslený plán města, hledání, měření – samostatná část „praha“, načte se až na stránce Praha (2026-10-19)

- 1760 řádků, 28 definic na nejvyšší úrovni, z toho 8 používají jiné soubory
- používá z: 01-zaklad (7), 02-mapa (5), 02f-mapa-cela (2), 04-praha (13), 07-druzina-kronika (4)
- používají ho: 02f-mapa-cela (1), 05b-svet-mapa (1), 08-navigace-pravidla (2), 22b-vyprava (6)
- poskytuje: pDraw PM pmRender pmRoute PMU praInit pRam pSel
- oddíly:
  - ř. 1386: Praha: měření cesty pěšky po ulicích

## 05-svet

Známý svět: mapa Evropy a Středomoří k 3. 3. 1458

- 541 řádků, 39 definic na nejvyšší úrovni, z toho 33 používají jiné soubory
- používá z: 02-mapa (1)
- používají ho: 02-mapa (1), 02f-mapa-cela (2), 05b-svet-mapa (33), 07-druzina-kronika (2), 08-navigace-pravidla (4), 09-vypravec-herni-cas (4), 10-kouzla (1), 22b-vyprava (5)
- poskytuje: SG SVETMESTA SVET SM SP sRoute sst SVB SRSEA SVETCESTY SCITY sConfOk sDark SHCOL sHlavni SIMG SKURF SLABPOS SLODE SMA SOBLUDY SPinv SPORT SRCOL SRIVHL SSEAS sTip SVB0 SVETDRZ SVIRA SVIRAC SVMOB svRozbal
- oddíly:
  - ř. 111: ilustrace mapy světa: rozměry obrázků (šířka, výška[, složka])

## 05b-svet-mapa

Známý svět: kresba mapy Evropy, detail, výběr – samostatná část „svet“, načte se až na stránce Známý svět (2026-10-19)

- 1271 řádků, 11 definic na nejvyšší úrovni, z toho 4 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (7), 02f-mapa-cela (2), 04-praha (1), 04b-praha-plan (1), 05-svet (33), 06-draconomicon-rodokmeny (2), 07-druzina-kronika (7), 08-navigace-pravidla (1), 09-vypravec-herni-cas (1)
- používají ho: 02f-mapa-cela (1), 07-druzina-kronika (1), 08-navigace-pravidla (3), 09-vypravec-herni-cas (3), 22b-vyprava (3)
- poskytuje: sDraw smRender svInit sSel

## 06-draconomicon-rodokmeny

Draconomicon

- 569 řádků, 17 definic na nejvyšší úrovni, z toho 7 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (3), 04-praha (1), 07-druzina-kronika (4), 08-navigace-pravidla (2), 09-vypravec-herni-cas (1), 21-editor-pecet (4)
- používají ho: 05b-svet-mapa (2), 07-druzina-kronika (3), 08-navigace-pravidla (4), 09-vypravec-herni-cas (3), 10-kouzla (1), 21-editor-pecet (3), 22b-vyprava (1), 26-start (2)
- poskytuje: DRACI DRBY drU renderDraco treeHTML TREES TREEALIAS
- oddíly:
  - ř. 81: Rodokmeny klíčových rodů (stav k 3. 3. 1458)
  - ř. 106: rodokmen jako jeden propojený graf: osoby ze všech rodokmenů, spojené přes id osob (p, pl)

## 07-druzina-kronika

Družina · Kronika tažení · automatické odkazy · hledání

- 1710 řádků, 83 definic na nejvyšší úrovni, z toho 36 používají jiné soubory
- používá z: 01-zaklad (7), 02-mapa (15), 02g-mista (1), 03-artikule (3), 04-praha (5), 05-svet (2), 05b-svet-mapa (1), 06-draconomicon-rodokmeny (3), 07s-stopa (7), 08-navigace-pravidla (3), 09-vypravec-herni-cas (13), 22-vyprava (1)
- používají ho: 02-mapa (2), 02b-mapa-kresba (1), 03-artikule (1), 04b-praha-plan (4), 05b-svet-mapa (7), 06-draconomicon-rodokmeny (4), 08-navigace-pravidla (7), 09-vypravec-herni-cas (22), 10-kouzla (8), 11-boj (3), 12-boj-tah-postavy (2), 13-karty (1), 14-karty-bojova-karta (1), 14b-vybaveni (1), 14c-boj-reakce (1), 14d-vybaveni-katalog (1), 15-karty-artikule (7), 16-srd-ukazky-sezeni-hrac (7), 17-karty-ii (1), 17b-kouzla-ucinky (1), 19-karty-beyond (1), 19b-automatika (1), 20b-boj-vypravec (2), 20d-boj-render (2), 21-editor-pecet (8), 22-vyprava (4), 22b-vyprava (8), 23-potvrzovani (1), 25-puls (2), 26-start (2)
- poskytuje: HRA KARTY PARTY partyDate partyPlace autolink MES ZAPISY fromJdn druzinaNikde herniDen jdn renderKal renderKronika SVST ZBY DISC feasts renderDruzina TRAKTATY TRBY dialCtx dialPoc DNY hraUkolyHtml kronikaPrekresli pFaith renderNovinky stopaTed stopaUiHtml svMeter tvarLet vekPostavy drawParty kalHero stopaHtml
- oddíly:
  - ř. 3: DRUŽINA
  - ř. 77: KRONIKA TAŽENÍ
  - ř. 194: Stopa družiny na mapě (2026-10-28, Vojta): úseky po cestách se šipkami, starší slábnou, zastávky s datem, „Dru
  - ř. 575: Kalendář tažení (juliánský kalendář)
  - ř. 967: prstenec počasí kolem kola: dnešní počasí z generátoru Výpravy (stejné místo a den = stejné počasí)
  - ř. 1049: dráček na Úvodu ukazuje stav hry: bdí / spí / svátek / neklid (Hodina Závoje) / Hodina Pravdy; rámeček podle r
  - ř. 1237: NOVINKY: co družina nově zná (z deníku odhalení)
  - ř. 1260: AUTOMATICKÉ ODKAZY
  - ř. 1397: Náhledové kartičky: po najetí na odkaz (nebo prvním ťuknutí) osoba, rod, pojem či plemeno
  - ř. 1522: HLEDÁNÍ NA CELÉM WEBU

## 07s-stopa

@čisté – Stopa družiny na mapě (2026-10-28, Vojta): které zápisy Kroniky a zastávky se kreslí podle počátku stopy (vypravěč

- 114 řádků, 8 definic na nejvyšší úrovni, z toho 7 používají jiné soubory
- používá z: –
- používají ho: 07-druzina-kronika (7)
- poskytuje: STOPA_POHLEDY stopaDatumKr stopaPutovani stopaRozsah stopaSila stopaSipka stopaUseky

## 08-navigace-pravidla

site navigation: views, house and person articles

- 1132 řádků, 57 definic na nejvyšší úrovni, z toho 19 používají jiné soubory
- používá z: 01-zaklad (13), 02-mapa (18), 03-artikule (3), 04-praha (5), 04b-praha-plan (2), 05-svet (4), 05b-svet-mapa (3), 06-draconomicon-rodokmeny (4), 07-druzina-kronika (7), 09-vypravec-herni-cas (1), 10-kouzla (4), 10q-plne-texty (1), 11-boj (3), 13-karty (2), 14d-vybaveni-katalog (1), 15-karty-artikule (4), 16-srd-ukazky-sezeni-hrac (5), 17-karty-ii (1), 18-pravidla-postavy (5), 20d-boj-render (2), 22b-vyprava (2)
- používají ho: 02-mapa (2), 02b-mapa-kresba (1), 05b-svet-mapa (1), 06-draconomicon-rodokmeny (2), 07-druzina-kronika (3), 09-vypravec-herni-cas (4), 10-kouzla (2), 10q-plne-texty (3), 11-boj (4), 13-karty (3), 14-karty-bojova-karta (3), 14b-vybaveni (1), 14c-boj-reakce (1), 14d-vybaveni-katalog (1), 15-karty-artikule (1), 16-srd-ukazky-sezeni-hrac (8), 17-karty-ii (7), 17b-kouzla-ucinky (1), 19-karty-beyond (2), 19b-automatika (1), 20-boj-hraci (1), 20b-boj-vypravec (2), 20d-boj-render (4), 21-editor-pecet (2), 22-vyprava (1), 22b-vyprava (1), 23-potvrzovani (2), 25-puls (2), 26-start (2)
- poskytuje: curView mmNaHre navTo featyMuze route PULTTAB featyMd mmCela PORTR portU renderPersonArticle renderRodArticle FEATY featyNacti MMCELA_WEB pThumb SRDP ucetBoxHtml ucetMuze
- oddíly:
  - ř. 349: Pravidla: český překlad SRD 5.2.1 s poznámkami Artikulí (art/pravidla.json, načte se až při otevření)
  - ř. 1011: Iluminované iniciály: první písmeno zápisu, oddílu Artikulí, kapitoly Draconomiconu a zápisu kronikáře o rodu
  - ř. 1045: Účet hráče s heslem (2026-10-20): založení a přihlášení na Úvodu i na stránce Hra; vedle Discordu

## 09-vypravec-herni-cas

Vypravěč: stavy odhalení (Skryté / Slyšeli / Potkali), přihlášení a přehled

- 1095 řádků, 49 definic na nejvyšší úrovni, z toho 34 používají jiné soubory
- používá z: 01-zaklad (3), 02-mapa (18), 02e-krajina (1), 04-praha (1), 05-svet (4), 05b-svet-mapa (3), 06-draconomicon-rodokmeny (3), 07-druzina-kronika (22), 08-navigace-pravidla (4), 09g-generator-postav (3), 11-boj (4), 20b-boj-vypravec (1), 20d-boj-render (1), 21-editor-pecet (5), 22-vyprava (4), 22b-vyprava (1)
- používají ho: 05b-svet-mapa (1), 06-draconomicon-rodokmeny (1), 07-druzina-kronika (13), 08-navigace-pravidla (1), 10-kouzla (20), 11-boj (3), 12-boj-tah-postavy (1), 13-karty (1), 14-karty-bojova-karta (2), 14b-vybaveni (1), 14c-boj-reakce (1), 15-karty-artikule (5), 16-srd-ukazky-sezeni-hrac (4), 17-karty-ii (1), 17b-kouzla-ucinky (1), 18-pravidla-postavy (1), 19-karty-beyond (1), 20b-boj-vypravec (4), 20c-boj-ridery (1), 20d-boj-render (2), 20e-boj-vlastnosti (1), 20f-scena (1), 21-editor-pecet (3), 22-vyprava (2), 22b-vyprava (7), 23-potvrzovani (3), 25-puls (2)
- poskytuje: mmHlasG hraUloz cT cTxt gmSeg hraPo hraPosun partyPos zavojInfo cestaAktivni cestaMisto cestaPlan cestaPoz gmLv gmPl zavojBan cDat cDokonciG CESTA_ZP cKde cNejbliz cZaznamG gmMark gmRefresh gmSum gmUloz HRA_PO pozehnaniDnes STAV STLBL zapisNovy CESTA_ODCH pozBadge zapisDoHry
- oddíly:
  - ř. 138: Při hře: plovoucí panel vypravěče – rychlé hledání a Skryté/Slyšeli/Potkali odkudkoli (Ctrl+K)
  - ř. 592: Herní čas: jedno místo pro uložení a posun (Při hře, přehled vypravěče, mapy)
  - ř. 820: Kronika z herního stavu: nový zápis s datem, hodinou, místem, trasou a podklady (putování, boj, počasí); ulože
  - ř. 928: Mapa jako paměť tažení: posuvník po zápisech Kroniky
  - ř. 971: Měření a cesta z místa kliknutí na místo kliknutí (mapa zemí Koruny)

## 09g-generator-postav

@čisté – Generátor postav doby (2026-10-28, Vojta: „rychlý generátor postav do Při hře“): dobové jméno podle země, stav, věk,

- 213 řádků, 14 definic na nejvyšší úrovni, z toho 3 používají jiné soubory
- používá z: –
- používají ho: 09-vypravec-herni-cas (3)
- poskytuje: GENSTAV GENZEME genPostava

## 10-kouzla

Kouzla: SRD 5.2.1 česky (art/kouzla.json, načítá se až při potřebě) – jen pro vypravěče

- 795 řádků, 31 definic na nejvyšší úrovni, z toho 12 používají jiné soubory
- používá z: 01-zaklad (3), 02-mapa (5), 04-praha (2), 05-svet (1), 06-draconomicon-rodokmeny (1), 07-druzina-kronika (8), 08-navigace-pravidla (2), 09-vypravec-herni-cas (20), 10q-plne-texty (1), 15-karty-artikule (1), 21-editor-pecet (1)
- používají ho: 08-navigace-pravidla (4), 10q-plne-texty (1), 11-boj (1), 12-boj-tah-postavy (4), 14b-vybaveni (1), 14d-vybaveni-katalog (1), 15-karty-artikule (5), 16-srd-ukazky-sezeni-hrac (2), 18-pravidla-postavy (2)
- poskytuje: kzIn kzMd kzUr kouzlaTxt KZ KZBY kzKarta kzNacti KZRE renderKouzla kouzlaTxtKarta renderGM

## 10k-import-pdf

@čisté – Import listu postavy z PDF D&D Beyond (2026-10-23): pole formuláře PDF → karta (kartaZPdf)

- 472 řádků, 4 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: –
- používají ho: 13-karty (1)
- poskytuje: kartaZPdf

## 10p-pravidla

@čisté – Pravidla boje a Artikulí bez stránky (2026-10-23): hody, záchrany, smrt, soustředění, zbroj, houfy, sloty iniciativy

- 441 řádků, 39 definic na nejvyšší úrovni, z toho 37 používají jiné soubory
- používá z: 02c-zbroj (2)
- používají ho: 11-boj (18), 12-boj-tah-postavy (20), 13-karty (5), 14-karty-bojova-karta (6), 14b-vybaveni (4), 14c-boj-reakce (7), 15-karty-artikule (3), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (4), 17b-kouzla-ucinky (3), 18-pravidla-postavy (5), 19-karty-beyond (4), 20-boj-hraci (3), 20b-boj-vypravec (17), 20c-boj-ridery (2), 20d-boj-render (6), 20e-boj-vlastnosti (1), 20g-boj-mistrovstvi (4), 24-boj-zaznam (1)
- poskytuje: bojSpoj kMod bojNeschopny SRDST bojKonDC kTrU bojAbil bojSloty bojZasah BDRUH BLIM bojDs bojKritDruh bojNorm bojSaveB bojUzito BPACH_HP srdNejedna zavVys BMIMO bojConB bojHoufZasah bojIniB bojOdolnosti bojPocty bojPres bojRecharge bojTxt kAdvSum kSum MANZ svetloDruh bojDmgBezKritu bojRegen kPocet manVysledek SVPALIVO
- oddíly:
  - ř. 408: manévry Battle Mastera se záchranou cíle (2026-10-25, Vojta): co se stane při neúspěchu; vyhodnotí vypravěč př

## 10q-plne-texty

Plné znění kouzel a předmětů (Vojtovy tabulky, 2026-10-24) – jen pro přihlášené, z databáze

- 249 řádků, 24 definic na nejvyšší úrovni, z toho 5 používají jiné soubory
- používá z: 01-zaklad (1), 04-praha (1), 08-navigace-pravidla (3), 10-kouzla (1), 11-boj (1), 13-karty (1), 14b-vybaveni (1), 14d-vybaveni-katalog (1)
- používají ho: 08-navigace-pravidla (1), 10-kouzla (1), 14b-vybaveni (4), 14d-vybaveni-katalog (1), 15-karty-artikule (1), 16-srd-ukazky-sezeni-hrac (1)
- poskytuje: plneInl PLNES plneSeznam renderPlne plneVec

## 10r-reakce

@čisté – Okno reakce (2026-10-23): kdo může reagovat, na co a s jakým výsledkem – jedna tabulka pro všechny reakce

- 270 řádků, 10 definic na nejvyšší úrovni, z toho 3 používají jiné soubory
- používá z: –
- používají ho: 14c-boj-reakce (3), 17b-kouzla-ucinky (1), 20e-boj-vlastnosti (1)
- poskytuje: reakceMa reakceOkno reakceVysledek

## 10t-tah

@čisté – Účet tahu (2026-10-23): akce, bonusová akce, pohyb a „jednou za tah“ na jednom místě

- 94 řádků, 13 definic na nejvyšší úrovni, z toho 12 používají jiné soubory
- používá z: –
- používají ho: 13-karty (2), 14-karty-bojova-karta (11), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (3), 20c-boj-ridery (4), 20g-boj-mistrovstvi (4)
- poskytuje: tahJednouVolne tahKlic tahObnov tahJednouZapis tahNastav tahOznac tahPohni tahPohyb tahMa tahPrepni tahSprint tahSurge
- oddíly:
  - ř. 62: pohyb a Sprint (2026-10-25)

## 10u-ucinky

@čisté – Účinky v jednom formátu (2026-10-23): posílení z kouzel a rysů, kostky k hodům d20 a jejich sčítání podle D&D 2024

- 289 řádků, 12 definic na nejvyšší úrovni, z toho 11 používají jiné soubory
- používá z: –
- používají ho: 14-karty-bojova-karta (2), 15-karty-artikule (1), 17-karty-ii (6), 17b-kouzla-ucinky (9), 19b-automatika (2), 20c-boj-ridery (1)
- poskytuje: kzJm UCINKY KPRID kzSt ucAC ucAdv ucHodn ucKostky ucRes ucSecti ucTyp
- oddíly:
  - ř. 209: sčítání: instance účinků na postavě ({n, l, od, …}) → jen ty, které platí; každá dostane definici e

## 10v-veci

@čisté – Vlastní předměty z Dílny vypravěče (2026-10-28)

- 155 řádků, 15 definic na nejvyšší úrovni, z toho 9 používají jiné soubory
- používá z: –
- používají ho: 14b-vybaveni (7), 18-pravidla-postavy (3)
- poskytuje: vecZbroj VECDR VECVZ VECZT vecDefNorm vecEf vecPerkyVaruj vecSouhrn vecZbrRow

## 10w-zbrane

@čisté – Vlastnosti a mistrovství zbraní (Weapon Traits a Weapon Masteries, 2026-10-24)

- 153 řádků, 14 definic na nejvyšší úrovni, z toho 12 používají jiné soubory
- používá z: –
- používají ho: 14-karty-bojova-karta (2), 14b-vybaveni (2), 18-pravidla-postavy (1), 20g-boj-mistrovstvi (11)
- poskytuje: ZBRMS ZBRVL zbrBezMod ZBRMA zbrMaMa zbrMod zbrObour zbrPomala zbrRozbor zbrTezkaNev zbrVersKost zbrZalic

## 10x-strelec

@čisté – Střelec (Gunslinger, doplněk mimo SRD; Vojtův překlad 2026-10-28): kostky Štěstěny, kritický zásah na dálku a kousky

- 35 řádků, 9 definic na nejvyšší úrovni, z toho 9 používají jiné soubory
- používá z: –
- používají ho: 13-karty (1), 14-karty-bojova-karta (4), 14c-boj-reakce (1), 17-karty-ii (4), 18-pravidla-postavy (1)
- poskytuje: STRKOUSKY strRD strZdarma strHazard strKousek strKrit strSram strSvehlavost strZuby

## 11-boj

BOJ: tracker slotové iniciativy (Artikule › Iniciativa a protivníci)

- 3158 řádků, 206 definic na nejvyšší úrovni, z toho 131 používají jiné soubory
- používá z: 01-zaklad (3), 02-mapa (10), 02c-zbroj (2), 04-praha (1), 07-druzina-kronika (3), 08-navigace-pravidla (4), 09-vypravec-herni-cas (3), 10-kouzla (1), 10p-pravidla (18), 12-boj-tah-postavy (29), 13-karty (2), 14-karty-bojova-karta (1), 14c-boj-reakce (2), 15-karty-artikule (3), 17-karty-ii (2), 17b-kouzla-ucinky (4), 18-pravidla-postavy (3), 20b-boj-vypravec (6), 20d-boj-render (1), 20e-boj-vlastnosti (1), 20g-boj-mistrovstvi (1), 25-puls (1)
- používají ho: 08-navigace-pravidla (3), 09-vypravec-herni-cas (4), 10q-plne-texty (1), 12-boj-tah-postavy (42), 13-karty (13), 14-karty-bojova-karta (21), 14b-vybaveni (6), 14c-boj-reakce (8), 14d-vybaveni-katalog (1), 15-karty-artikule (9), 16-srd-ukazky-sezeni-hrac (15), 17-karty-ii (12), 17b-kouzla-ucinky (15), 18-pravidla-postavy (5), 19-karty-beyond (9), 20-boj-hraci (17), 20b-boj-vypravec (80), 20c-boj-ridery (10), 20d-boj-render (37), 20e-boj-vlastnosti (7), 20f-scena (11), 20g-boj-mistrovstvi (4), 23-potvrzovani (4), 24-boj-zaznam (12), 25-puls (12)
- poskytuje: btip BOJ bojZmen bsg bojDB bi bK bojKostky bojNacti bojBezi bojJa bojJm bojLog bojMedN PROTBY bojPrekresli BOTV JA BLOGG bojEff bojMedH BSTI BKS bojDsAkt bojHp bojObt bojZdr kNeschopny PROTIVNICI zavTxt BCIL BHIST BODP bojBest bojCilO bojMaRes bojNav bojOsoba bojOtevr bojOtv … (+91)
- oddíly:
  - ř. 7: Boj: ikonky, medailony a popisky při najetí myší (2026-10-16)
  - ř. 686: Bestiář v Boji – vše jen pro vypravěče; hráči dostanou prázdné seznamy
  - ř. 747: účinný statblock: základ + přívlastky
  - ř. 810: kostky
  - ř. 961: Momentum (Artikule, 2026-10-19): poměr sil podle životů. Družina = postavy hráčů (průměr % HP), nepřátelé = pr
  - ř. 1257: Celá akce nepřítele (2026-10-19): Multiattack ze statblocku jako sled útoků po jednom s předvybraným cílem
  - ř. 1562: karta nepřítele: rychlý přehled pro boj
  - ř. 1905: hledání v bestiáři: protivníci, osoby se statblokem, hotová setkání; i podle štítků
  - ř. 1978: řádek setkání „Jméno = 6 houf-zoldneru + zkuseny“ → nepřátelé do boje
  - ř. 2038: odhad obtížnosti (D&D 2024: rozpočet XP na postavu; nízká / střední / vysoká)
  - ř. 2132: kritická zranění na kliknutí (Artikule › Rány)
  - ř. 2265: přidání nepřátel do boje odjinud (osoba, Výprava): rovnou do běžícího boje, jinak do rozestavení
  - ř. 2307: fronta zápisů hráče bez signálu (2026-10-20): útok, změna postavy v boji, obsazení slotu, odpověď na výzvu
  - ř. 2618: Scéna (2026-10-23): Hra je pořád scéna, boj je jen její režim. Scéna je stav boje s `scena: true` a `aktivni: 

## 12-boj-tah-postavy

automatizace tahu: iniciativa, návrh, začátek a konec tahu, účinky s trváním, záchrany, plošný zásah

- 1920 řádků, 94 definic na nejvyšší úrovni, z toho 69 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (6), 02c-zbroj (2), 04-praha (1), 07-druzina-kronika (2), 09-vypravec-herni-cas (1), 10-kouzla (4), 10p-pravidla (20), 11-boj (42), 13-karty (4), 14-karty-bojova-karta (2), 14c-boj-reakce (1), 15-karty-artikule (6), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (4), 17b-kouzla-ucinky (7), 18-pravidla-postavy (11), 20-boj-hraci (2), 20b-boj-vypravec (6), 20d-boj-render (1), 20f-scena (1), 20g-boj-mistrovstvi (1)
- používají ho: 11-boj (29), 13-karty (8), 14-karty-bojova-karta (12), 14b-vybaveni (3), 14c-boj-reakce (11), 14d-vybaveni-katalog (1), 15-karty-artikule (4), 16-srd-ukazky-sezeni-hrac (6), 17-karty-ii (6), 17b-kouzla-ucinky (9), 18-pravidla-postavy (2), 19-karty-beyond (2), 19b-automatika (2), 20-boj-hraci (5), 20b-boj-vypravec (44), 20c-boj-ridery (5), 20d-boj-render (14), 20e-boj-vlastnosti (6), 20g-boj-mistrovstvi (4), 23-potvrzovani (2)
- poskytuje: bojKartaH KARTBY BAB bojHracAkce bojKritPC bojEfDel bojZbrVse bojZranPC bojMsg bojLecPC bojNpcZach BAKCE bojDsPip bojHpPC bojSpStav bojZbrStav BKONC BKORX BKPAD BKRLOG bojHpZmena bojStavDej BRCH BTMSG BZTL BCIM BDMG BKDO bojAkceStav bojDsZapis bojHracPanel bojJeKouzlo bojKorist bojLegN bojLegZb bojNavrh bojNpcKzLvl bojNpcSes bojPcNaplnit bojPcOdvod … (+29)
- oddíly:
  - ř. 841: Kouzlo NPC jedním klikem (2026-10-20)
  - ř. 1347: postavy v boji: stavy, kryt, připravená akce a hody proti smrti – hráč z telefonu, vypravěč v seznamu družiny
  - ř. 1648: karta postavy v boji (zatím zkušební karty v zdroj/obsah/karty, později import z PDF D&D Beyond)
  - ř. 1654: stavy a hody proti smrti postavy s kartou žijí jen na kartě (2026-10-22)

## 13-karty

Karty postav: import listu z PDF D&D Beyond, trvalý stav, hody se Závojem, odpočinky, herní záznam (2026-10-16)

- 1569 řádků, 62 definic na nejvyšší úrovni, z toho 40 používají jiné soubory
- používá z: 01-zaklad (4), 02-mapa (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (3), 09-vypravec-herni-cas (1), 10k-import-pdf (1), 10p-pravidla (5), 10t-tah (2), 10x-strelec (1), 11-boj (13), 12-boj-tah-postavy (8), 14-karty-bojova-karta (5), 14b-vybaveni (1), 14d-vybaveni-katalog (3), 15-karty-artikule (22), 16-srd-ukazky-sezeni-hrac (12), 17-karty-ii (28), 17b-kouzla-ucinky (3), 18-pravidla-postavy (19), 19-karty-beyond (4), 20-boj-hraci (4), 20c-boj-ridery (1), 20d-boj-render (2), 20f-scena (1), 25-puls (1)
- používají ho: 08-navigace-pravidla (2), 10q-plne-texty (1), 11-boj (2), 12-boj-tah-postavy (4), 14-karty-bojova-karta (18), 14b-vybaveni (8), 14c-boj-reakce (7), 15-karty-artikule (14), 16-srd-ukazky-sezeni-hrac (17), 17-karty-ii (13), 17b-kouzla-ucinky (7), 18-pravidla-postavy (5), 19-karty-beyond (14), 19b-automatika (1), 20-boj-hraci (4), 20b-boj-vypravec (7), 20c-boj-ridery (4), 20d-boj-render (2), 20e-boj-vlastnosti (1), 20f-scena (2), 23-potvrzovani (5), 24-boj-zaznam (1), 25-puls (3)
- poskytuje: kartaStav kartaStavZmen kHodZapis kartyPrekresli bojPCZmena kartyNacti KDOVAB hodyNacti kartaSeslat KSK kVycerp kartaHod KST KDB KHRAC HODY KADV kartaOdpocinek KIMP kPipyMapa renderKarty bojJaUprHtml kartaImport kartaPriprav kartyNastav KDBVL KIMPINV kImpNahled KLOAD KPENDT KSTAT KUPRO kartaZatez kartyStart kdbPips kDenikHtml kHodyHtml kPoslBox kTxtKostky kZpetBtn
- oddíly:
  - ř. 497: stránka Karty postav
  - ř. 608: části karty sdílené s bojovou kartou (14): české názvy vlastností, puntíky omezených použití, deník.
  - ř. 1102: Karta: úprava posledního hodu, kostky v textech schopností, Zpět, spodní lišta na telefonu (2026-10-17)
  - ř. 1103: úprava hodu d20 po hodu: Bless / Guidance +1d4, Bane −1d4, Bardic Inspiration, přehození za hrdinskou inspirac
  - ř. 1243: kostky v textech schopností: „1d6“, „2d8 + your Strength modifier“, „1d10 + your Fighter level“
  - ř. 1311: Zpět: poslední změny životů, slotů, zdrojů, kostek životů, inspirace, účinků a vybavení na tomto zařízení
  - ř. 1394: boj: úprava hodu na útok před odesláním vypravěči

## 14-karty-bojova-karta

Karta: vybavení z nabídky (2026-10-17) – zbraně a zbroj SRD 5.2.1, výstroj, magické předměty SRD.

- 2561 řádků, 108 definic na nejvyšší úrovni, z toho 36 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (6), 02c-zbroj (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (3), 09-vypravec-herni-cas (2), 10p-pravidla (6), 10t-tah (11), 10u-ucinky (2), 10w-zbrane (2), 10x-strelec (4), 11-boj (21), 12-boj-tah-postavy (12), 13-karty (18), 14b-vybaveni (6), 14c-boj-reakce (7), 14d-vybaveni-katalog (5), 15-karty-artikule (20), 16-srd-ukazky-sezeni-hrac (8), 17-karty-ii (25), 17b-kouzla-ucinky (5), 18-pravidla-postavy (38), 19-karty-beyond (14), 20-boj-hraci (12), 20b-boj-vypravec (2), 20c-boj-ridery (5), 20d-boj-render (2), 20e-boj-vlastnosti (4), 20g-boj-mistrovstvi (6), 23-potvrzovani (4), 24-boj-zaznam (1)
- používají ho: 11-boj (1), 12-boj-tah-postavy (2), 13-karty (5), 14b-vybaveni (6), 14c-boj-reakce (2), 14d-vybaveni-katalog (1), 16-srd-ukazky-sezeni-hrac (5), 17-karty-ii (1), 17b-kouzla-ucinky (1), 18-pravidla-postavy (1), 19-karty-beyond (1), 20-boj-hraci (15), 20b-boj-vypravec (4), 20c-boj-ridery (1), 20d-boj-render (4), 20e-boj-vlastnosti (1), 20g-boj-mistrovstvi (2), 23-potvrzovani (1)
- poskytuje: BDM BGMU bdmPrekresli bojBptOznac bdmZvl bojBpt kLbTxt kVybPridej KZBRV bdmIc bdmLepky BDMZV bdmZvlAuto bojCileL bojCilMoz bojPapCil bojPcHrac bojRidNavic bojSikTypy bojTrikZvol bojUtTyp bRucN BTABH BUTYP kartaJednaHtml kJeZbran KKOSTTAJ kStavyTab kZbrU kZbrvUloz bojEvasiveKonec bojHracKarta bRucPrevezmi kKostAdv kPoolDopl kZbrUziti
- oddíly:
  - ř. 156: Boj: karta postavy hráče ve formátu karty NPC (2026-10-17) – hlavička (AC, životy, R), rozbalená část
  - ř. 1382: Boj: bojová karta postavy v rozvržení D&D Beyond na telefonu (2026-10-17) – úsporná: hlavička (AC s obětováním

## 14b-vybaveni

Vybavení (2026-10-19): jeden seznam ve skupinách, věc na klepnutí (list zespodu s akcemi), sloučení stejných věcí,

- 1413 řádků, 71 definic na nejvyšší úrovni, z toho 17 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (4), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (1), 09-vypravec-herni-cas (1), 10-kouzla (1), 10p-pravidla (4), 10q-plne-texty (4), 10v-veci (7), 10w-zbrane (2), 11-boj (6), 12-boj-tah-postavy (3), 13-karty (8), 14-karty-bojova-karta (6), 14d-vybaveni-katalog (12), 16-srd-ukazky-sezeni-hrac (9), 17-karty-ii (3), 18-pravidla-postavy (9), 19-karty-beyond (6), 20e-boj-vlastnosti (1), 23-potvrzovani (1)
- používají ho: 10q-plne-texty (1), 13-karty (1), 14-karty-bojova-karta (6), 14d-vybaveni-katalog (2), 16-srd-ukazky-sezeni-hrac (4), 19-karty-beyond (7)
- poskytuje: kPenKarta KMINCE kMinceIk kMinceNab KMINCJM KMINCZK kPenHtml kPenTxt kSlozky kVecPlnePridej bdmInvList bdmPenList bdmPriList bdmVecList bdmVyb kInvPouzHtml poklVeciHtml
- oddíly:
  - ř. 159: oddíl Vybavení v kartě (2026-10-23, Vojta: podle D&D Beyond, kompaktněji)
  - ř. 411: list věci zespodu
  - ř. 461: list Spravovat inventář (2026-10-23): přidat z databáze předmětů, vlastní předmět, složky
  - ř. 618: Dílna vypravěče (2026-10-28): vlastní předmět ze základu z katalogu (zbraň, zbroj, štít, nebo bez základu) – v
  - ř. 1081: list Peníze
  - ř. 1105: použití spotřebních věcí v oddílu Útok
  - ř. 1131: obsluha

## 14c-boj-reakce

Boj: zásahy rovnou do karty, reakce na telefonu, plošné zásahy a iniciativa výzvou, začátek tahu,

- 746 řádků, 30 definic na nejvyšší úrovni, z toho 20 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (2), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (1), 09-vypravec-herni-cas (1), 10p-pravidla (7), 10r-reakce (3), 10x-strelec (1), 11-boj (8), 12-boj-tah-postavy (11), 13-karty (7), 14-karty-bojova-karta (2), 15-karty-artikule (2), 16-srd-ukazky-sezeni-hrac (6), 17-karty-ii (17), 18-pravidla-postavy (7), 19-karty-beyond (2), 20-boj-hraci (1), 20b-boj-vypravec (1), 20d-boj-render (1), 20e-boj-vlastnosti (1), 23-potvrzovani (1)
- používají ho: 11-boj (2), 12-boj-tah-postavy (1), 14-karty-bojova-karta (7), 16-srd-ukazky-sezeni-hrac (1), 17b-kouzla-ucinky (4), 20-boj-hraci (7), 20b-boj-vypravec (2), 20c-boj-ridery (1), 20e-boj-vlastnosti (1)
- poskytuje: bojPcAuto bojPcZasah BPLV BZAS kReakceFakta bojRipoPre BRIP kHpOf kZasahReakce bojMinNovy bojOdpVyzva bojPoutoNovy bojPrilezNovy bojRipoJeRiposte bojVyzZpracuj bojZasahNovy kPoutoHtml kPrilezHtml kRipHtml kZasahHtml

## 14d-vybaveni-katalog

Vybavení: katalog (2026-10-20) – art/vybaveni.json z Vojtova Přehledu vybavení (zdroj/vybaveni) s pravidly Artikulí.

- 296 řádků, 24 definic na nejvyšší úrovni, z toho 15 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (5), 02c-zbroj (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (1), 10-kouzla (1), 10q-plne-texty (1), 11-boj (1), 12-boj-tah-postavy (1), 14-karty-bojova-karta (1), 14b-vybaveni (2), 15-karty-artikule (1), 16-srd-ukazky-sezeni-hrac (5), 18-pravidla-postavy (1)
- používají ho: 08-navigace-pravidla (1), 10q-plne-texty (1), 13-karty (3), 14-karty-bojova-karta (5), 14b-vybaveni (12), 19b-automatika (3), 23-potvrzovani (4)
- poskytuje: VYB vybNacti VYBBY vybKl VYBN vybNajdi vybPoolVstup renderVybaveni vybArtikule vybCil VYBP vybParam VYBSK VYBSKN vybVl
- oddíly:
  - ř. 118: přidání do vybavení postavy (stránka Vybavení i nabídka na kartě)
  - ř. 157: stránka Pravidla › Vybavení

## 15-karty-artikule

Karta postavy podle Artikulí: duše (Svědomí, Ctnosti a Neřesti, vyznání, feat víry), Výdrž a techniky,

- 1313 řádků, 80 definic na nejvyšší úrovni, z toho 52 používají jiné soubory
- používá z: 01-zaklad (2), 04-praha (1), 07-druzina-kronika (7), 08-navigace-pravidla (1), 09-vypravec-herni-cas (5), 10-kouzla (5), 10p-pravidla (3), 10q-plne-texty (1), 10u-ucinky (1), 11-boj (9), 12-boj-tah-postavy (4), 13-karty (14), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (2), 17b-kouzla-ucinky (3), 18-pravidla-postavy (9), 19-karty-beyond (2), 20d-boj-render (1)
- používají ho: 03-artikule (1), 08-navigace-pravidla (4), 10-kouzla (1), 11-boj (3), 12-boj-tah-postavy (6), 13-karty (22), 14-karty-bojova-karta (20), 14c-boj-reakce (2), 14d-vybaveni-katalog (1), 16-srd-ukazky-sezeni-hrac (28), 17-karty-ii (11), 17b-kouzla-ucinky (7), 18-pravidla-postavy (2), 19-karty-beyond (8), 19b-automatika (4), 20-boj-hraci (9), 20b-boj-vypravec (5), 20c-boj-ridery (1), 20d-boj-render (3), 24-boj-zaznam (2)
- poskytuje: kSp KSPD kUc kVyraz mmPop kSpNacti pojZnac kDuse mmPopX kTrv KZAV kSpA kUcPridej kZavoj KFR kFrontaOdesli kSitChyba kSvAdv kTech kTed kVydMax STBY kFrontaNaStav kFrontaPridej kHodForm kParty kPrehledHtml KPS kRany kSpPopis kSpTexty kSvKl kTechMozne kUcVyprsi kVlastniHod kVydU kZaznamHtml kZpyt KCACHE kDuseAkce … (+12)
- oddíly:
  - ř. 231: herní čas a účinky s trváním
  - ř. 350: popisy kouzel z art/kouzla.json (pro hráče jen kouzla jejich postavy)
  - ř. 419: vlastní hod: 2d6+3, 4d6kh3, 2d20kl1, d%, s kostkou Závoje
  - ř. 493: duše na kartě
  - ř. 724: Výdrž a techniky na kartě
  - ř. 771: rány
  - ř. 817: rozdíl po novém PDF (úroveň, životy, kouzla, útoky, předměty)
  - ř. 857: offline: fronta zápisů karty a hodů, když chybí připojení
  - ř. 1021: přehled družiny pro vypravěče
  - ř. 1150: jeden záznam: hody z karet + veřejný záznam boje
  - ř. 1168: popisky pravidel (glosář SRD) v textu: najetí nebo klepnutí na pojem
  - ř. 1284: vyskakovací okno (popis kouzla, předmětu)

## 16-srd-ukazky-sezeni-hrac

SRD 5.2.1: magické předměty (všichni) a nestvůry (vypravěč) – art/predmety.json, art/netvori.json

- 1913 řádků, 105 definic na nejvyšší úrovni, z toho 38 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (2), 04-praha (1), 07-druzina-kronika (7), 08-navigace-pravidla (8), 09-vypravec-herni-cas (4), 10-kouzla (2), 10p-pravidla (2), 10q-plne-texty (1), 10t-tah (3), 11-boj (15), 12-boj-tah-postavy (6), 13-karty (17), 14-karty-bojova-karta (5), 14b-vybaveni (4), 14c-boj-reakce (1), 15-karty-artikule (28), 17-karty-ii (9), 17b-kouzla-ucinky (3), 18-pravidla-postavy (10), 19-karty-beyond (8), 19b-automatika (1), 20d-boj-render (1), 23-potvrzovani (8), 25-puls (1)
- používají ho: 08-navigace-pravidla (5), 12-boj-tah-postavy (3), 13-karty (12), 14-karty-bojova-karta (8), 14b-vybaveni (9), 14c-boj-reakce (6), 14d-vybaveni-katalog (5), 15-karty-artikule (2), 17-karty-ii (4), 17b-kouzla-ucinky (3), 18-pravidla-postavy (5), 19-karty-beyond (8), 19b-automatika (3), 20-boj-hraci (2), 20b-boj-vypravec (2), 20d-boj-render (4), 20e-boj-vlastnosti (2), 23-potvrzovani (3), 25-puls (3)
- poskytuje: kMuze kvK PRED predNacti hraPrekresli jaK kPred KZAM VYZVY vyzvyNacti hraPoll NETV PREDBY kLb mmNotif netvNacti renderHra BPT hraHracHtml PRVZ pultVykresli renderNetvori renderPredmety renderSezeni UKDB ukNacti ukSeznam vyzvyGmHtml bojKorDelHtml bojPruvodce hraStart hraUcetHtml hraVypravBtn hraVypravList kZatez postupBanner pultObal ukStart
- oddíly:
  - ř. 236: Ukázat hráčům: obrázek, dopis nebo mapka vyskočí na telefonech (tabulka ukazky)
  - ř. 416: Příprava sezení (vypravěč): scény, poznámky, setkání, osoby, ukázky
  - ř. 631: Kořist: rozdělení do vybavení postav a peněz, Štědrost a Lakomství
  - ř. 990: Hráč: přihlášení za postavu, stránka Hra, výzvy k hodu, tajné zprávy, upozornění, úkoly družiny, postup na úro
  - ř. 1060: upozornění na pozadí (když je stránka otevřená, ale skrytá)
  - ř. 1080: výzvy k hodu
  - ř. 1307: tajné zprávy
  - ř. 1370: pravidelné načítání pro hráče i vypravěče
  - ř. 1460: úkoly družiny a postup na úroveň (v herním stavu, který čtou všichni)
  - ř. 1472: stránka Hra
  - ř. 1492: hráčská stránka Hra (2026-10-22): jen karta; iniciativa a boj se na ní objeví, až vypravěč boj připraví
  - ř. 1526: nová místa oddílů dřívější hráčské Hry (2026-10-22): listy na vlastní kartě
  - ř. 1564: řídicí pult vypravěče (2026-10-22): Hra = Boj + záložky Družina a Sezení (dřívější stránka Hra vypravěče)
  - ř. 1794: Průvodce tahem hráče v Boji

## 17-karty-ii

Karta postavy II (2026-10-16): Discord, texty rysů jen pro vlastníka, kouzla se sloty a zraněním, akce podle času,

- 1465 řádků, 116 definic na nejvyšší úrovni, z toho 80 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (7), 09-vypravec-herni-cas (1), 10p-pravidla (4), 10t-tah (3), 10u-ucinky (6), 10x-strelec (4), 11-boj (12), 12-boj-tah-postavy (6), 13-karty (13), 14-karty-bojova-karta (1), 15-karty-artikule (11), 16-srd-ukazky-sezeni-hrac (4), 17b-kouzla-ucinky (9), 18-pravidla-postavy (19), 19-karty-beyond (5), 20-boj-hraci (4), 20b-boj-vypravec (3), 20d-boj-render (1), 23-potvrzovani (3)
- používají ho: 08-navigace-pravidla (1), 11-boj (2), 12-boj-tah-postavy (4), 13-karty (28), 14-karty-bojova-karta (25), 14b-vybaveni (3), 14c-boj-reakce (17), 15-karty-artikule (2), 16-srd-ukazky-sezeni-hrac (9), 17b-kouzla-ucinky (9), 18-pravidla-postavy (7), 19-karty-beyond (25), 19b-automatika (5), 20-boj-hraci (16), 20b-boj-vypravec (6), 20c-boj-ridery (11), 20g-boj-mistrovstvi (3), 23-potvrzovani (2)
- poskytuje: kSeznam kPri kKonZtrata kKonDrzi kMaRys kBufy kSlX kDopl kEfekty KKON kKonNazev kLecKarta kSD kCasKouzla kManMa kRD kStavy kStrU DCU kCilM kEfUt kKarb kMaSl kNab kRDKousek kSesCil kSpMod kSpUcD kSpUcinek jaDiscordInit jaOdhlasTxt kAkceG KAUTOR kAutoZnac KBUF KCIL kCilMax kCilUp kEfAkt kEfPouzij … (+40)
- oddíly:
  - ř. 3: Discord: přihlášený účet a jeho postava
  - ř. 55: texty rysů (soukromé) a rejstřík rysů SRD
  - ř. 164: čas aktivace a seznamy akcí
  - ř. 232: útoky a doplňky hráče
  - ř. 240: kouzla: seznam (PDF + připravená − odebraná), sesílání se zvoleným slotem, zranění a léčení se škálováním
  - ř. 252: kouzla z předmětů (2026-10-17): hůlky a hole SRD 5.2.1. Seslání spotřebuje náboje předmětu (inv[].nab), ne slo
  - ř. 579: kouzla na spojence a léčení víc cílů (2026-10-17)
  - ř. 676: Seslat na koho (2026-10-17 b): kouzlo s dosahem (ne „Sebe“) se před sesláním zeptá na cíle – postavy družiny
  - ř. 954: přídavky (2026-10-17): přídavky ke zranění z povolání a kouzel (Sneak Attack, Rage, Hunter's Mark, Hex, Divine
  - ř. 1179: rysy z karty pro automatiku boje (2026-10-20): featy a manévry podle názvu z PDF, kostky převahy, Bardic Inspi
  - ř. 1271: náboje magických předmětů (2026-10-17): počet z popisu SRD, utracené v poli inv[].nab, obnova za úsvitu dlouhý
  - ř. 1412: stavy mimo boj (ovlivňují hody z karty)

## 17b-kouzla-ucinky

Kouzla: účinky na cílech, dočasné HP, trvání v kolech, rituály, opakované útoky, oblasti, Counterspell (2026-10-20)

- 1268 řádků, 51 definic na nejvyšší úrovni, z toho 37 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (1), 09-vypravec-herni-cas (1), 10p-pravidla (3), 10r-reakce (1), 10u-ucinky (9), 11-boj (15), 12-boj-tah-postavy (9), 13-karty (7), 14-karty-bojova-karta (1), 14c-boj-reakce (4), 15-karty-artikule (7), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (9), 18-pravidla-postavy (8), 19-karty-beyond (2), 20-boj-hraci (3), 20b-boj-vypravec (3), 20d-boj-render (2)
- používají ho: 11-boj (4), 12-boj-tah-postavy (7), 13-karty (3), 14-karty-bojova-karta (5), 15-karty-artikule (3), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (9), 18-pravidla-postavy (3), 19b-automatika (4), 20-boj-hraci (1), 20d-boj-render (3), 24-boj-zaznam (1)
- poskytuje: bojKzIkHtml kOpakAkt kzIk KZIK KZOBL KZOPAK bojOblNova kBufAll kBufEf kBufHtml kSumKonec KZLEC kzStPrip KZSUM bojBufKonecTahu bojBufZacTahu bojOblHtml bojOblSync bojOblTah bojOpakHtml bojProtiHtml bojProtiNabidni bojProtiZpracuj bojUcKola kartaRitual kBufAC kBufAdv kBufHodn kBufRes kBufUtMinus kEfKouzla kRitOk kSesPo kSesPoCile kSesSpec vyzvaProti vyzvaProtiOdpoved
- oddíly:
  - ř. 66: seslání: dočasné HP na sebe (False Life, Armor of Agathys), maximum HP cílům (Aid)
  - ř. 120: trvání v kolech: krátké účinky (do 10 minut) na kartách postav v boji odpočítává vypravěčovo zařízení koly boj
  - ř. 199: rituál: kouzlo s příznakem rituálu jde seslat bez slotu, sesílání trvá o 10 minut déle (2024: každý sesilatel,
  - ř. 221: opakované útoky bez slotu (bod 5)
  - ř. 359: oblasti s opakovaným zraněním (bod 6)
  - ř. 559: Counterspell (bod 7): když vypravěč sešle kouzlo NPC, hráčům, kteří mají Counterspell, slot 3. st. a volnou re
  - ř. 680: Další kouzla (2026-10-20 b): léčení a obnova, zbraňová kouzla, obrana a reakce, vyvolaní tvorové
  - ř. 708: léčení a obnova (seslání s cíli z družiny)
  - ř. 850: zbraňová kouzla jako přídavky k útoku zbraní (kEfekty): Magic Weapon a Elemental Weapon samy, dokud trvají;
  - ř. 950: vyvolaní tvorové: seslání vytvoří společníka na kartě (AC, HP a útoky podle stupně, útok = tvůj útok kouzlem),
  - ř. 1127: posílení a ochrany (2026-10-22, inventura kouzel): co kouzlo dělá na kartě, dokud trvá; mechanika, kde ji kart
  - ř. 1139: Kouzla na účastnících boje (2026-10-20 c): ikony pod slotem iniciativy, v kartě NPC a v seznamech

## 18-pravidla-postavy

Pravidla postavy (2026-10-17): karta počítá podle pravidel D&D 2024 (SRD 5.2.1), PDF z D&D Beyond je jen výchozí podklad.

- 1349 řádků, 106 definic na nejvyšší úrovni, z toho 62 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (2), 02c-zbroj (1), 09-vypravec-herni-cas (1), 10-kouzla (2), 10p-pravidla (5), 10v-veci (3), 10w-zbrane (1), 10x-strelec (1), 11-boj (5), 12-boj-tah-postavy (2), 13-karty (5), 14-karty-bojova-karta (1), 15-karty-artikule (2), 16-srd-ukazky-sezeni-hrac (5), 17-karty-ii (7), 17b-kouzla-ucinky (3)
- používají ho: 08-navigace-pravidla (5), 11-boj (3), 12-boj-tah-postavy (11), 13-karty (19), 14-karty-bojova-karta (38), 14b-vybaveni (9), 14c-boj-reakce (7), 14d-vybaveni-katalog (1), 15-karty-artikule (9), 16-srd-ukazky-sezeni-hrac (10), 17-karty-ii (19), 17b-kouzla-ucinky (8), 19-karty-beyond (20), 19b-automatika (17), 20-boj-hraci (4), 20b-boj-vypravec (4), 20c-boj-ridery (3), 20d-boj-render (3), 20e-boj-vlastnosti (3), 20g-boj-mistrovstvi (6), 23-potvrzovani (1)
- poskytuje: kHPmax kSloty kUtoky kVl kCtx kLv kPB kAC kIni kZach kZdroje kSpDC kTridy kZbrInfo kACR kDov kOdol kRychN kSpolId kSpU1 kSpUt kZbranInfo MIMO kHodn kKostkyPool kMd kNoseno kOvB KPREDX kSpol kSpolBoj KSPOLC KTR kVecDefN kVl0 kZbrA kZdrJm mimoNacti mimoNajdi kHDtxt … (+22)
- oddíly:
  - ř. 128: povolání a úrovně
  - ř. 151: kontext: vstupy modelu (aktuální stav, nebo stav PDF pro porovnání)
  - ř. 226: jednotlivé hodnoty: [součet, rozpis]
  - ř. 352: veřejné funkce karty (stejná jména jako dřív)
  - ř. 619: zbroj, štít, AC
  - ř. 620: obsah D&D 2024 mimo SRD (art/mimo-srd.json): podtřídy, featy, zázemí, Aasimar – vlastní stručné shrnutí mechan
  - ř. 922: útoky: vlastnost, magický bonus a bonus ke zranění se z PDF zjistí jednou, pak se vše počítá
  - ř. 1081: panel Úpravy postavy: povolání a úrovně, skóre, výpočty a úpravy
  - ř. 1231: střelivo
  - ř. 1267: příprava kouzel ze seznamu povolání
  - ř. 1301: společníci: familiár, Divoká podoba, oř, dračí posádka

## 19-karty-beyond

karta jako D&D Beyond (2026-10-17 b): portrét, batohy a směna mincí, historie karty, postup na úroveň, podoba

- 1578 řádků, 62 definic na nejvyšší úrovni, z toho 26 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (2), 09-vypravec-herni-cas (1), 10p-pravidla (4), 11-boj (9), 12-boj-tah-postavy (2), 13-karty (14), 14-karty-bojova-karta (1), 14b-vybaveni (7), 15-karty-artikule (8), 16-srd-ukazky-sezeni-hrac (8), 17-karty-ii (25), 18-pravidla-postavy (20), 20-boj-hraci (1), 20b-boj-vypravec (1), 23-potvrzovani (3)
- používají ho: 13-karty (4), 14-karty-bojova-karta (14), 14b-vybaveni (6), 14c-boj-reakce (2), 15-karty-artikule (2), 16-srd-ukazky-sezeni-hrac (8), 17-karty-ii (5), 17b-kouzla-ucinky (2), 20c-boj-ridery (1)
- poskytuje: kZdrUtrat kKonI kZdrN kForma KMINC KSLV POKL poklHtml kartaUlozImport kImg KKONTM kPenSloz KRIM kRit kRitI kSpSt kSpZn poklNacti PUSHST aplikaceHtml kFormaHtml kLvupHtml kModsSync kPenSmenHtml kRysyHtml kSchopHtml
- oddíly:
  - ř. 4: portrét: obrázek z telefonu se zmenší na 192 px (JPEG) a uloží do stavu karty
  - ř. 46: batohy: předmět může ležet v batohu, vaku nebo truhle; obsah magických vaků (Bag of Holding…) se do zátěže nep
  - ř. 94: historie karty: předchozí stavy z databáze (snímek nejvýš jednou za 10 minut), obnovení
  - ř. 158: postup na úroveň: životy (průměr nebo hod), nové rysy povolání ze SRD, zvýšení vlastností nebo feat, kouzla
  - ř. 372: podoba: Wild Shape (druid; dočasné HP = úroveň druida, AC a útoky zvířete) a Polymorph (dočasné HP = životy zv
  - ř. 500: schopnosti povolání: Bardic Inspiration spojenci, Lay on Hands, Channel Divinity, Arcane Recovery
  - ř. 854: bonusy pro hody z Discordu: prohlížeč hráče zapíše spočítané bonusy karty (jen když se změní)
  - ř. 885: upozornění v telefonu (Web Push) a instalace webu jako aplikace
  - ř. 1032: pokladna družiny
  - ř. 1081: tisk a export

## 19b-automatika

Automatika podle karet družiny (2026-10-27, Vojta): u nahraných postav vypíše kouzla, rysy a featy a předměty, které web

- 193 řádků, 13 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: 01-zaklad (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (1), 10u-ucinky (2), 12-boj-tah-postavy (2), 13-karty (1), 14d-vybaveni-katalog (3), 15-karty-artikule (4), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (5), 17b-kouzla-ucinky (4), 18-pravidla-postavy (17), 20d-boj-render (1)
- používají ho: 16-srd-ukazky-sezeni-hrac (1)
- poskytuje: kAutoHtml

## 20-boj-hraci

Boj: hráč na telefonu (2026-10-20 rozděleno z 20-boj-hraci.js) – formulář útoku (BJU) a jeho obnova po načtení,

- 964 řádků, 34 definic na nejvyšší úrovni, z toho 25 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (3), 04-praha (1), 08-navigace-pravidla (1), 10p-pravidla (3), 11-boj (17), 12-boj-tah-postavy (5), 13-karty (4), 14-karty-bojova-karta (15), 14c-boj-reakce (7), 15-karty-artikule (9), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (16), 17b-kouzla-ucinky (1), 18-pravidla-postavy (4), 20b-boj-vypravec (2), 20c-boj-ridery (1), 20d-boj-render (3), 20e-boj-vlastnosti (4), 20g-boj-mistrovstvi (6), 23-potvrzovani (1)
- používají ho: 12-boj-tah-postavy (2), 13-karty (4), 14-karty-bojova-karta (12), 14c-boj-reakce (1), 17-karty-ii (4), 17b-kouzla-ucinky (3), 19-karty-beyond (1), 20b-boj-vypravec (7), 20c-boj-ridery (3), 20d-boj-render (7), 20e-boj-vlastnosti (1), 20g-boj-mistrovstvi (1), 25-puls (1)
- poskytuje: BJU bojAdvHrac bojJaZas bojJaHod bojJaZvolKouzlo kSpBoj BJK bojEfZnacene bojForm bojFormZbr bojJaCilMax bojJaObnov bojJaSp bojJaSpDmg bojJaUloz bojJaUtokHtml bojKonHtml bojUtokPriprav bojWake BZNADV bojJaNeprihl bojJaPosli bojUpozorni bojZazHlidej bojZbraneHtml
- oddíly:
  - ř. 410: Jeden hod na útok pro hráče z telefonu i vypravěče za hráče (2026-10-20)
  - ř. 817: Paměť telefonu v boji (2026-10-20): co už hráč viděl a co má rozehrané

## 20b-boj-vypravec

Boj: vypravěč – vyhodnocení a potvrzení útoků hráčů, veřejný záznam, pruh „co teď“, panely, statistika,

- 2974 řádků, 52 definic na nejvyšší úrovni, z toho 24 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (3), 04-praha (1), 07-druzina-kronika (2), 08-navigace-pravidla (2), 09-vypravec-herni-cas (4), 10p-pravidla (17), 11-boj (80), 12-boj-tah-postavy (44), 13-karty (7), 14-karty-bojova-karta (4), 14c-boj-reakce (2), 15-karty-artikule (5), 16-srd-ukazky-sezeni-hrac (2), 17-karty-ii (6), 18-pravidla-postavy (4), 20-boj-hraci (7), 20c-boj-ridery (1), 20d-boj-render (1), 20e-boj-vlastnosti (5), 20g-boj-mistrovstvi (4), 21-editor-pecet (2), 23-potvrzovani (6)
- používají ho: 09-vypravec-herni-cas (1), 11-boj (6), 12-boj-tah-postavy (6), 14-karty-bojova-karta (2), 14c-boj-reakce (1), 17-karty-ii (3), 17b-kouzla-ucinky (3), 19-karty-beyond (1), 20-boj-hraci (2), 20c-boj-ridery (2), 20d-boj-render (6), 20f-scena (1), 20g-boj-mistrovstvi (1), 23-potvrzovani (1), 24-boj-zaznam (2)
- poskytuje: bojZaz BZTYPY bojEfZnac bojPridejNpc BUEF BLF bojHoufZachrany bojSikVolba bojStat bojUtEf bojUtokKlik bojUtokPotvrd bojUtokProved bojUtokyNove bojZbrH bojZrCz bojNastHtml bojPoBojiMun bojPoBojiRany bojStatHtml2 bojTedHtml bojUtokyPanel bojVerej bojVyzPanel
- oddíly:
  - ř. 3: útoky postav z telefonu, zbraně postav, veřejný záznam pro hráče, statistika, filtr a Zpět v záznamu (2026-10-
  - ř. 512: Pruh „co teď“ (2026-10-19, jen vypravěč): kdo je na tahu a co mu zbývá, co čeká na vypravěče, kdo se soustředí
  - ř. 2918: průvodce koncem boje (2026-10-27, Vojta): rány a stav družiny, sebrání střeliva – kroky mezi osudy nepřátel a 

## 20c-boj-ridery

Boj: volby po zásahu, přesun Hexu, Riposte, Sharpshooter (2026-10-20)

- 373 řádků, 14 definic na nejvyšší úrovni, z toho 6 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (1), 04-praha (1), 09-vypravec-herni-cas (1), 10p-pravidla (2), 10t-tah (4), 10u-ucinky (1), 11-boj (10), 12-boj-tah-postavy (5), 13-karty (4), 14-karty-bojova-karta (1), 14c-boj-reakce (1), 15-karty-artikule (1), 17-karty-ii (11), 18-pravidla-postavy (3), 19-karty-beyond (1), 20-boj-hraci (3), 20b-boj-vypravec (2), 20d-boj-render (2), 20e-boj-vlastnosti (2), 20g-boj-mistrovstvi (2), 23-potvrzovani (2)
- používají ho: 13-karty (1), 14-karty-bojova-karta (5), 20-boj-hraci (1), 20b-boj-vypravec (1)
- poskytuje: bojJaRidPo bojCilAC bojSS bojJaHexHtml bojJaRidHtml bojJaSmityPo
- oddíly:
  - ř. 2: Volby po zásahu, přesun Hexu, odveta (2026-10-20)
  - ř. 236: Smity po potvrzeném zásahu (2026-10-24, Vojta)

## 20d-boj-render

Boj: vykreslení – stavy na žetonech, aktivní boj, cíle boje, kostra stránky, záložky, renderBoj (2026-10-20 rozděleno z 20-boj-hraci.js)

- 800 řádků, 31 definic na nejvyšší úrovni, z toho 5 používají jiné soubory
- používá z: 01-zaklad (2), 04-praha (1), 07-druzina-kronika (2), 08-navigace-pravidla (4), 09-vypravec-herni-cas (2), 10p-pravidla (6), 11-boj (37), 12-boj-tah-postavy (14), 13-karty (2), 14-karty-bojova-karta (4), 15-karty-artikule (3), 16-srd-ukazky-sezeni-hrac (4), 17b-kouzla-ucinky (3), 18-pravidla-postavy (3), 20-boj-hraci (7), 20b-boj-vypravec (6), 20f-scena (1), 23-potvrzovani (1), 24-boj-zaznam (1), 25-puls (1)
- používají ho: 08-navigace-pravidla (2), 09-vypravec-herni-cas (1), 11-boj (1), 12-boj-tah-postavy (1), 13-karty (2), 14-karty-bojova-karta (2), 14c-boj-reakce (1), 15-karty-artikule (1), 16-srd-ukazky-sezeni-hrac (1), 17-karty-ii (1), 17b-kouzla-ucinky (2), 19b-automatika (1), 20-boj-hraci (3), 20b-boj-vypravec (1), 20c-boj-ridery (2), 20e-boj-vlastnosti (2), 23-potvrzovani (1)
- poskytuje: renderBoj bojListPrekresli bojOut BTAB bojStart

## 20e-boj-vlastnosti

Boj: vlastnosti zbraní z Artikulí v boji (2026-10-20)

- 403 řádků, 22 definic na nejvyšší úrovni, z toho 16 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (1), 02c-zbroj (1), 04-praha (1), 09-vypravec-herni-cas (1), 10p-pravidla (1), 10r-reakce (1), 11-boj (7), 12-boj-tah-postavy (6), 13-karty (1), 14-karty-bojova-karta (1), 14c-boj-reakce (1), 16-srd-ukazky-sezeni-hrac (2), 18-pravidla-postavy (3), 20-boj-hraci (1), 20d-boj-render (2)
- používají ho: 11-boj (1), 14-karty-bojova-karta (4), 14b-vybaveni (1), 14c-boj-reakce (1), 20-boj-hraci (4), 20b-boj-vypravec (5), 20c-boj-ridery (2), 20g-boj-mistrovstvi (1), 24-boj-zaznam (1)
- poskytuje: bojZvVolby bojZvJm bojZvPayload BZVAKT bojOdvNovy bojZvKomHtml bojZvKostkaNiz bojZvMa bojZvNpcHtml bojZvProved bojZvRidery bojZvVolbyHtml bojZvVyhodnot bojZvVyzvy bojZvZbrKostky kOdvHtml
- oddíly:
  - ř. 97: vypravěč: vyhodnocení při zápisu útoku hráče
  - ř. 251: Odvetná na telefonu: nepřítel mě minul útokem zblízka s Pokušením → protiútok reakcí
  - ř. 291: nepřítel: vlastnosti jeho zbraně ze statbloku proti postavě (plaketa vypravěče)

## 20f-scena

Scéna mimo boj: NPC ve scéně (statistiky, víra, cíle), jednání hráčů s NPC a protihody vypravěče (2026-10-23)

- 240 řádků, 18 definic na nejvyšší úrovni, z toho 4 používají jiné soubory
- používá z: 01-zaklad (1), 04-praha (1), 09-vypravec-herni-cas (1), 11-boj (11), 13-karty (2), 20b-boj-vypravec (1)
- používají ho: 12-boj-tah-postavy (1), 13-karty (1), 20d-boj-render (1), 24-boj-zaznam (1)
- poskytuje: bojScCo bojScJednHtml bojScNpcHtml bzScPorovnej
- oddíly:
  - ř. 84: vypravěč: panel NPC ve scéně (v otevřené kartě NPC místo statbloku; statblok zůstává pod ním)
  - ř. 189: vypravěč: hod hráče proti NPC v záznamu – porovnání s DC a pasivními hodnotami, tlačítko protihodu
  - ř. 209: hráč: s kým jedná (cíl ověření a dovedností ve scéně)

## 20g-boj-mistrovstvi

Boj: vlastnosti a mistrovství zbraní (Weapon Traits a Weapon Masteries, 2026-10-24, Vojta)

- 261 řádků, 20 definic na nejvyšší úrovni, z toho 16 používají jiné soubory
- používá z: 01-zaklad (1), 04-praha (1), 10p-pravidla (4), 10t-tah (4), 10w-zbrane (11), 11-boj (4), 12-boj-tah-postavy (4), 14-karty-bojova-karta (2), 17-karty-ii (3), 18-pravidla-postavy (6), 20-boj-hraci (1), 20b-boj-vypravec (1), 20e-boj-vlastnosti (1)
- používají ho: 11-boj (1), 12-boj-tah-postavy (1), 14-karty-bojova-karta (6), 20-boj-hraci (6), 20b-boj-vypravec (4), 20c-boj-ridery (2)
- poskytuje: bojWmNavic bojManPayload bojWmPayload bojWUprav BWMIK bojManVyhodnot bojWAdv bojWmMinuti bojWmProved bojWmRidery bojWmSapPouzit bojWmTahVlastnika bojWmVolbyHtml bojWmVyhodnot bojWPopisHtml bojWZalicPohyb
- oddíly:
  - ř. 128: vypravěč: vyhodnocení při zápisu útoku hráče

## 21-editor-pecet

Vypravěč: úpravy textů a obrázků přímo na webu

- 790 řádků, 29 definic na nejvyšší úrovni, z toho 8 používají jiné soubory
- používá z: 01-zaklad (2), 04-praha (1), 06-draconomicon-rodokmeny (3), 07-druzina-kronika (8), 08-navigace-pravidla (2), 09-vypravec-herni-cas (3)
- používají ho: 06-draconomicon-rodokmeny (4), 09-vypravec-herni-cas (5), 10-kouzla (1), 20b-boj-vypravec (2), 22b-vyprava (2), 26-start (1)
- poskytuje: EDDRUH edOtevri ED edNacti edGen edIndex edNovyBox edUloz
- oddíly:
  - ř. 302: okno editoru
  - ř. 594: obrázky: zmenšení v prohlížeči a nahrání do úložiště
  - ř. 676: tlačítka na stránkách

## 22-vyprava

VÝPRAVA: cesta družiny podle pravidel Uncharted Journeys (stránka jen pro vypravěče)

- 846 řádků, 53 definic na nejvyšší úrovni, z toho 30 používají jiné soubory
- používá z: 01-zaklad (2), 02-mapa (1), 04-praha (1), 07-druzina-kronika (4), 08-navigace-pravidla (1), 09-vypravec-herni-cas (2), 22b-vyprava (1)
- používají ho: 07-druzina-kronika (1), 09-vypravec-herni-cas (4), 22b-vyprava (29)
- poskytuje: hraZpetZapis VY hraZpet VY_NACTENO VY_NOVA VY_REZ VY_TYPY vyDat vyGreg vyId vyNacti vyPocasi vyUlozHned hraZpetHtml VY_DELKA VY_KRAJ VY_ODCH VY_PRIJ VY_PRIP VY_ROLE VY_TEMPO VY_ZAZ VY_ZP vyDen vyDruzina vyHod vyRychl VYS VYT vyUloz
- oddíly:
  - ř. 292: počasí
  - ř. 586: stav výpravy
  - ř. 695: návrat cest a času (2026-10-18): před každou změnou času, místa nebo cesty se uloží předchozí stav

## 22b-vyprava

Výprava: stránka vypravěče (trasa, setkání, počasí na cestě, mapy) – samostatná část „vyprava“, načte se až na stránce Výprava (2026-10-19)

- 1899 řádků, 59 definic na nejvyšší úrovni, z toho 3 používají jiné soubory
- používá z: 01-zaklad (4), 02-mapa (13), 02e-krajina (5), 04-praha (4), 04b-praha-plan (6), 05-svet (5), 05b-svet-mapa (3), 06-draconomicon-rodokmeny (1), 07-druzina-kronika (8), 08-navigace-pravidla (1), 09-vypravec-herni-cas (7), 21-editor-pecet (2), 22-vyprava (29)
- používají ho: 08-navigace-pravidla (2), 09-vypravec-herni-cas (1), 22-vyprava (1)
- poskytuje: renderVyprava vyZazT vyVrat
- oddíly:
  - ř. 3: výchozí místo a cíl na jednotlivých mapách
  - ř. 232: trasa, časový průběh, obtížnost, setkání
  - ř. 582: vykreslení
  - ř. 918: ovládání
  - ř. 1507: Výprava 2: okolí trasy, draci, vlastní tabulky, noclehy, lidé na cestě, počasí pro hráče, režim u stolu

## 23-potvrzovani

Potvrzování akcí hráčů a časová osa sezení (2026-10-18)

- 520 řádků, 37 definic na nejvyšší úrovni, z toho 15 používají jiné soubory
- používá z: 01-zaklad (1), 04-praha (1), 07-druzina-kronika (1), 08-navigace-pravidla (2), 09-vypravec-herni-cas (3), 11-boj (4), 12-boj-tah-postavy (2), 13-karty (5), 14-karty-bojova-karta (1), 14d-vybaveni-katalog (4), 16-srd-ukazky-sezeni-hrac (3), 17-karty-ii (2), 18-pravidla-postavy (1), 20b-boj-vypravec (1), 20d-boj-render (1)
- používají ho: 14-karty-bojova-karta (4), 14b-vybaveni (1), 14c-boj-reakce (1), 16-srd-ukazky-sezeni-hrac (8), 17-karty-ii (3), 19-karty-beyond (3), 20-boj-hraci (1), 20b-boj-vypravec (6), 20c-boj-ridery (2), 20d-boj-render (1)
- poskytuje: kOdklad potvrz bojKonecBtn navrhPosli navrhyCeka navrhPotreba navrhyGmHtml navrhyNacti potvrzHtml zmenyNacti bojDalOk bojUtokVratSlot navrhyMojeHtml potvrzNacti zmenyHtml
- oddíly:
  - ř. 64: 1) lhůta na rozmyšlení
  - ř. 124: 2) návrhy hráčů ke schválení (léčení a Bardic spojenců)
  - ř. 263: 3) časová osa sezení: změny karet, boje a herního času s vrácením

## 24-boj-zaznam

Boj: herní záznam ve třetím sloupci (2026-10-18) – KDO · CO · KOMU, hozené kostky s výsledky a kostka Závoje

- 417 řádků, 22 definic na nejvyšší úrovni, z toho 1 používají jiné soubory
- používá z: 01-zaklad (1), 02-mapa (1), 04-praha (1), 10p-pravidla (1), 11-boj (12), 13-karty (1), 15-karty-artikule (2), 17b-kouzla-ucinky (1), 20b-boj-vypravec (2), 20e-boj-vlastnosti (1), 20f-scena (1)
- používají ho: 14-karty-bojova-karta (1), 20d-boj-render (1)
- poskytuje: bojZaznamSloupec
- oddíly:
  - ř. 131: záznam vypravěče (BLOGG) → řádek
  - ř. 216: hod z karty (HODY) → řádek; „Útok – Dlouhý meč → Rotmistr“: cíl za šipkou
  - ř. 252: veřejný záznam boje (s.zaz) → řádek; hráč u nepřátel vidí jen výsledek
  - ř. 267: sestavení záznamu: zdroje, spojení útoku hráče s vyhodnocením, volba u Pokušení, kola

## 25-puls

Puls: jeden dotaz „co se změnilo“ místo samostatných dotazů (2026-10-19)

- 172 řádků, 10 definic na nejvyšší úrovni, z toho 2 používají jiné soubory
- používá z: 04-praha (1), 07-druzina-kronika (2), 08-navigace-pravidla (2), 09-vypravec-herni-cas (2), 11-boj (12), 13-karty (3), 16-srd-ukazky-sezeni-hrac (3), 20-boj-hraci (1)
- používají ho: 11-boj (1), 13-karty (1), 16-srd-ukazky-sezeni-hrac (1), 20d-boj-render (1)
- poskytuje: pulsStart pulsKrok

## 26-start

Pečeť: co družina nově pozná, se při prvním zobrazení „rozpečetí“; o čem jen slyšela, je zapečetěné

- 171 řádků, 6 definic na nejvyšší úrovni, z toho 0 používají jiné soubory
- používá z: 01-zaklad (3), 02-mapa (2), 02d-pojmy (1), 04-praha (1), 06-draconomicon-rodokmeny (2), 07-druzina-kronika (2), 08-navigace-pravidla (2), 21-editor-pecet (1)
- používají ho: –
- poskytuje: 
- oddíly:
  - ř. 101: Start: pečeť nových poznatků a první vykreslení stránky (dřív na konci 22-vyprava.js)
