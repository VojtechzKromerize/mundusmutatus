# Stav vývoje

Živý stav vývoje – aktualizuj při každé větší změně; datované snímky v projektu claude.ai (`vyvoj/*.md`, audity, zadání)
jsou jen historie. Zdroj pravdy je kód (`zdroj/web/js/NN-*.js`, `supabase/schema.sql`); orientace v něm: `docs/MAPA.md`,
`docs/SLOVNIK.md`, `node testy/kontrola_kodu.mjs --kde JMÉNO`. Poslední revize: 2026-10-22 (dev `707bdaf`, main `5ec89a1`).

## Platná rozhodnutí

- 2026-10-09 Hraje se podle **D&D 2024**; pravidla = SRD 5.2.1 česky, přepsaná Artikulemi (Artikule mají přednost).
- 2026-10-09 **Weapon Mastery zůstává**; domácí vlastnosti zbraní jsou fyzika zbraně a platí každému, kdo ji drží (vedle mastery).
- 2026-10-09 **Zbroj půlí zranění** (Resistance podle druhu), žádné pevné snížení; obětování zbroje ruší krit (vycpávaná a štít 1×, kroužková 2×, plátová/komplexní 3×).
- 2026-10-09 **Kostka Závoje k6** vedle k20: 1–2 Pokušení, 5–6 Požehnání, přirozená 20 + 6 Boží prst, přirozená 1 + 1 Ďáblovo dílo. Svědomí 0–10 se čtyřmi stavy (Zatracený · Na scestí · Na vážkách · V milosti).
- 2026-10-09 Šermířské techniky a zápas za **Výdrž** (bojovník = bonus zdatnosti, ostatní martial polovina nahoru; v Artikulích se zdroj jmenuje Výdrž, dřívější „Dech“ je jen pracovní název).
- 2026-10-10 **Tři vyznání** (Kališník, Katolík, Starověrec) a feat víry o **třech stupních**; čtvrté vyznání Pravoslavný (pro Kirila) je zatím jen záměr, v kódu není.
- 2026-10-14 Postavy mají **jednu Ctnost a jednu Neřest** (starší „dvě“ neplatí).
- 2026-10-16 **Nebude bojová mapa** (figurky) ani **tvorba postavy** (import PDF z D&D Beyond); obsah mimo SRD jen jako vlastní shrnutí mechaniky (rys ≤ 350 znaků, kouzlo ≤ 1 000 – 2026-10-20).
- 2026-10-17 Přihlášení hráčů: Discord (PKCE) nebo účet s heslem; odhalení platí pro celou družinu, ne pro jednotlivce.
- 2026-10-18 **Jediná karta postavy** = bojová karta v rozvržení D&D Beyond pro mobil, stejná všude; vzhled vínová kůže, drobné ikony linkové SVG, malované ikony jen pro stavy, zranění a ovládání boje.
- 2026-10-20 **Vlastnosti zbraní podle Battle Brothers**: aktivní vlastnost dává účinek při Požehnání a Komplikaci při odmítnutém Pokušení; každá zbraň max. 1 pasivní + 1 aktivní (výjimky meče, halapartna, hákovnice); vlastnost popisuje zbraň, ne dovednost (žádná „Mířená“); útok navíc je příliš silný. Rapier = Kord, Musket = Hákovnice, přibývá Okovaný cep.
- 2026-10-21 Dvě databáze: ostrá (`main`) a vývojová (`dev` a náhledy); na ostré jen číst, schéma tam jde jen na pokyn „nasaď“. Kód je formátovaný Prettierem, vazby mezi soubory hlídá `kontrola_kodu.mjs`.
- 2026-10-22 **Hra hráče = karta a boj na jedné stránce**; hráč vidí jen svou kartu (karty ostatních na Hře nejsou). Vypravěčova Hra = řídicí pult (Boj · Družina · Sezení).
- 2026-10-22 **Protivníci**: pacholek 5 HP s přetékáním zranění, „Tuhý pacholek“ zrušen; sok smí mít zbroj a obětovat ji při kritu, bez obětování ho krit poráží; početnější strana má o slot iniciativy víc.
- 2026-10-22 Stavy a hody proti smrti postavy s kartou žijí jen na kartě (boj nese jen obraz); hodnocení houfů: skupinoví netvoři jako houf, ne jako jednotliví sokové.

## Hotovo

- 10-16 Přihlášení hráčů (Discord PKCE 10-20, heslo 10-20), stránka Hra, výzvy k hodu (`#mmvyz`), potvrzování akcí a časová osa (23, 10-18) – 08, 16, 23, schema `mm_ja*`, `hraci_ucty`.
- 10-16 Import PDF D&D Beyond, karta podle pravidel D&D 2024 (PDF jen podklad, úpravy „z D&D Beyond“) – 13, 18, 19; překlad SRD 5.2.1 (všech 8 kapitol: hraní, tvorba, povolání, původ a featy, výbava, kouzlení, glosář, nástroje) – `zdroj/pravidla/*.md` → `art/pravidla.json`; nestvůry, předměty, 339 kouzel + Vojtův katalog kouzel – `art/*.json`.
- 10-17 Doplňky mimo SRD (36 podtříd, 58 featů, 12 zázemí, Aasimar, 95 kouzel) jako vlastní shrnutí – `zdroj/mimo-srd/`, stránka Pravidla › Doplňky, `kMimoZdroje`/`kMimoEf` (18).
- 10-17 Automatizace z auditu Beyond-parita: kouzla v boji z telefonu (paprsky, záchrany, škálování), léčení spojence, soustředění, přídavky (Sneak Attack, Rage, Hex, Smite…), kostky k d20 (Bless, Bane, Guidance, Bardic), náboje předmětů, hůlky a hole, stavy z kouzel se záchranou, střelivo se odečítá (`kMunice`, 18) – 17, 17b, 20.
- 10-17 Rozdělení `koruna.html` na kostru + `zdroj/web/` (`rozdel.py`); CI anotace chyb, `priprav-prostredi.sh`, `MM_TESTY`.
- 10-18 Artikule v boji: obětování zbroje, Drtivá/Průrazná proti zbroji, Ostrá, krvácení, kritická zranění s ránami na kartě (vyléčení z karty 10-21); Závoj ke každému útoku; herní záznam s „Zpět“ u každého řádku (24).
- 10-19 Puls místo šesti dotazů, Realtime (`mm_puls`, publikace `boj` v schématu) – 25; líně načítané díly skriptu a samostatné části map/Výpravy/editoru (build); společníci hráčů v boji; nepřítel „hráči zatím nevidí“ (`mm_boj_cti`); Multiattack po jednom.
- 10-20 Vlastnosti zbraní z Artikulí 20. 10. (17 vlastností) v Artikulích (03), katalogu vybavení (`ARTZV` → `art/vybaveni.json`, 14d) a v boji – `20e-boj-vlastnosti.js` (Krvežíznivá… Hrom a kouř!, Odvetná jako reakce, Komplikace tlačítkem vypravěče); 17 štítků `zv-*` v `art/img/boj`.
- 10-20 Boj na telefonu: útok jedním tlačítkem, odpověď vypravěče v listu, rozehraný útok přežije obnovení, fronta bez signálu (`BFR`), Wake Lock (`BWL`, 20), pruh „Čeká na tebe“; vypravěč za hráče s volbami po zásahu, přesun Hexu, Riposte (20b, 20c).
- 10-20 Telefon jako aplikace: manifest s zkratkami, spouštěcí obrazovky iPhone, Badging, vibrace, lišta „Obnovit“, portréty družiny v SW; relativní zápis HP („−12“), proužek životů, stavy s trváním v kolech, statblock až po rozbalení, chvění ikon zapečené (`bojWob`, bez filtru `#bwob`), portréty `-m`, 96px žetony bestiáře (vše z plánu boj-vykon).
- 10-20 Bestiář: 58 nových protivníků D&D 2024 jako houfy/sokové/zhoubci, 26 setkání, žetony archů 10–17 (`zdroj/obsah/protivnici`, `art/bestiar`).
- 10-21 Malované ikony místo emoji v Boji: stavy a kouzla (10-20), prostředí, ovládání (nastavení, zpět, plošný zásah, hromadný hod, připravit, hod, boj, přejmenovat, vidí/nevidí, trvání, rána, hotovo) – `BIMG` (11), `art/img/boj`; medailonky typů zranění `zr-*` a zbroje `zb-*`.
- 10-21 Boj vypravěče na širokém monitoru: tři sloupce (účastníci · karta · záznam), barvy stran, karta nepřítele jako karta hráče, bez pruhu „co teď“ a tlačítka Závoj; herní záznam sbalený s ikonami výsledků (24).
- 10-21 Dvě databáze + workflow Databáze/Texty do ostré/Budíček (`netlify.toml`, `.github/workflows`); Prettier, `npm run kontrola`, rychlé jednotkové testy `npm test` (`testy/jednotky`); `bojPrekresli`/`kartyPrekresli`.
- 10-22 Přestavba Hry: hráč `#hra` = karta + boj (`hraHracHtml`, `mmNaHre`, 16/08), listy ✉ Od vypravěče, Peníze, Postava; tichá příprava boje (`s.ticha`); řídicí pult (`pultObal`, `PULTTAB`, `#hra/druzina`, `#hra/sezeni`); aplikace ukáže jen Hru (`mmJenHra`); na telefonu karta přes celou obrazovku (`mmCela`); `#boj` → `#hra`.
- 10-22 Hráčská karta: kompaktní hlavička, Statistiky, pod-karty Akce, Záznam za Poznámkami, bez Duše (v listu Svědomí), vínová kůže se zlatým kováním, linkové ikonky se středověkými motivy, rysy s počtem použití (14).
- 10-22 Protivníci podle rozhodnutí 22. 10.: `BPACH_HP = 5` s přetékáním (11), `sokKrit` (20b), slot navíc pro početnější stranu (`bojSloty`, 11), text Artikulí (03) a bestiář.
- 10-22 Rešerše postav 1458 na webu: věk k hernímu datu (`07`), „Dosavadní život“ a GM sekce „Po březnu 1458“ (08, generator) – zadání `resers/zadani-pro-dev.md` splněno.
- 10-22 Orientace: `docs/MAPA.md`, `docs/SLOVNIK.md` (`npm run mapa`), pravidla souběhu v `CLAUDE.md`.
- 10-22 Aplikace po nasazení nabídne „Obnovit“ (díly skriptu `v/…` proti serveru při návratu do ní a po 10 min – `kontrolaKodu` v kostře); dřív otevřená aplikace jela se starým kódem.

## Otevřené

- **Čtvrté vyznání Pravoslavný** (Kiril): v Artikulích (03 `vyznani`), `KVZN`/`KFEAT` (15) ani svátcích Závoje není; chybí i text featu víry.
- **Střelné zbraně podle Vojtova návrhu 19. 10.** (píšťala 2d8 9/27 m, hákovnice 2d12 18/54 m, bez bonusu Lukostřelby, krit vyžaduje dvojí obětování, duše padlých jako nabíječi, školy Puškařská/Vozová): kód má SRD Pistol 1d10 / Musket 1d12 a jen vlastnosti Průrazná + Hrom a kouř!; katalog (`art/vybaveni.json`) říká „pistole/mušketa“, ne píšťala/hákovnice. Není rozhodnuto, zda návrh platí.
- **Vlastní povolání píšťalník/hákovník (Gunslinger)** pro Mikuláše: nikde v kódu ani v `zdroj/mimo-srd/`.
- **Kord a Okovaný cep**: Artikule 03 i katalog používají Rapier/„rapír“ a Flail/„řemdih“; Okovaný cep jako samostatná zbraň v katalogu není.
- **Vlastnosti zbraní – ruční zbytky** (dle 20e): rozjezd pro Vpřed! a zapřené ratiště volí hráč/vypravěč sám; zásah spojence při selhání Hromu a kouře se nevyhodnotí.
- **Kouzla – stále ručně** (beyond-parita): Bless/Bane na spojence si zapíná každý sám a nekončí se soustředěním sesilatele; Magic Missile jen na jeden cíl; stav z kouzla na nepřítele dává vypravěč ručně (záchranu vidí); kouzlo z hůlky = náboj a kouzlo zvlášť; posbírání střeliva po boji.
- **Draci posádek / vedlejší karty** (společníci existují jen jako tvor z karty „Do boje“): karta draka s vlastními útoky a HP chybí.
- **Mobil** (`vyvoj/mobil.md`): neověřeno na skutečném iPhonu (návrat z Discordu do aplikace, tečka na ikoně, spouštěcí obrazovka); `screenshots` v manifestu a hlubší odkaz z pushe do listu útoku (`mm_push_tah`) záměrně neudělány; dělení kouzel po třídách zamítnuto jako nevýnosné.
- **Hráčská karta – návrhy z 22. 10. nehotové**: plovoucí kostka překrývá obsah (přesun do lišty záložek), boj na telefonu nevyužívá celou obrazovku (nadpis, Prostředí, vysoká lišta iniciativy), pořadí stavů (nejčastější nahoru), silueta místo iniciály u postav bez portrétu, „=== Organizations ===“ z PDF se nefiltruje; hotové z téhož seznamu: řádek War Caster jako chipy, rysy s počtem použití, Duše pryč, kostka pod obsahem.
- **Hra vypravěče**: samostatná stránka `#sezeni` (Příprava sezení) a `#karty` zůstávají vedle pultu – pult na ně jen odkazuje; není rozhodnuto, zda je sloučit.
- **Výkon boje**: `renderBoj` překresluje po blocích (`bojBlok`, `bojSeznam`), ne celý `#bojview`; úplné klíčované vykreslování karet protivníků z plánu boj-vykon není a zatím není potřeba.
- **Dokumenty v projektu claude.ai**: po sloučení do tohoto souboru lze smazat `vyvoj/hra-prestavba.md`, `vyvoj/architektura-2026-10-21.md`, `vyvoj/boj-vykon.md`, `vyvoj/ikony-boj.md`, `vyvoj/ikony-ovladani.md`, `vyvoj/ikony-stavy-a-kouzla.md`, `vyvoj/ikony-vlastnosti-zbrani.md`, `vyvoj/vlastnosti-zbrani-boj.md`, `vyvoj/bojova-karta.md`, `vyvoj/srd-preklad.md`, `resers/zadani-pro-dev.md` (vše implementováno nebo nahrazeno); `vyvoj/beyond-parita.md` a `vyvoj/mobil.md` jen do doby, než se jejich otevřené body přenesou sem (přeneseny výše).

## Artikule

- **Aktuální znění** = `pravidla/artikule-2026-10-14.md` jako celek **+ `pravidla/artikule-zbrane-2026-10-20.md`**, které nahrazuje jen oddíl Výzbroj › Zbraně (17 vlastností, Kord, Hákovnice, Okovaný cep). Dokument z 20. 10. je výsek, ne úplná verze – sám nestačí.
- `pravidla/artikule-vojta-2026-10-11.md` je starší verze plně nahrazená zněním z 14. 10. (stále mluví o dvou Ctnostech/Neřestech a čtyřech stupních featu víry).
- Oproti textu 14. 10. platí novější rozhodnutí zapsaná jen v kódu a `rozhodnuti.md`: protivníci z 22. 10. (pacholek 5 HP, sok obětuje zbroj, slot navíc), jedna Ctnost a jedna Neřest, tři stupně featu víry. Web (`03-artikule.js`) je s těmito změnami v souladu; `pravidla/protivnici.md` a `pravidla/featy-viry.md` (čtyři stupně) jsou v těchto bodech zastaralé.
- Nerozhodnuté návrhy k Artikulím (střelné zbraně 19. 10., čtvrté vyznání, Gunslinger) viz Otevřené; do Artikulí patří až po Vojtově „platí“.
