# Jak upravovat obsah webu

## Úpravy přímo na webu (doporučeno)
Rody, osoby, vazby, rodokmeny, místa v Praze, objevená místa, Kronika, Družina a Draconomicon jsou
uložené v databázi a vypravěč je upravuje **přímo na webu**: přihlásit se (ikona klíče v nabídce) →
na stránce osoby, rodu, zápisu, plemene či postavy **Upravit text**, u rodu také **Rodokmen** a **Vazby**.
Nové záznamy (osoba, rod, zápis Kroniky, plemeno, místo…) vznikají ve vypravěčském přehledu v části
**Nový záznam** – jsou skryté, dokud je neodhalíš. Hráči změnu uvidí do půl minuty, bez nasazování.

- Každá verze se pamatuje: **Historie** u záznamu ukáže předchozí verze a dovolí je obnovit.
- Chybu (neexistující rod, neuzavřené ⟦ …) web ohlásí a nic neuloží. **Zkontrolovat texty**
  ve vypravěčském přehledu projde všechno najednou.
- Portrét, erb nebo obrázek plemene nahraješ tlačítkem v editoru – web ho sám zmenší a uloží.
- Pole **mapa** u dračího plemene určuje, kde se plemeno ukáže ve vrstvě Draci na mapě světa
  („délka, šířka“, více míst odděl středníkem). Hráči ho vidí, až o plemeni družina aspoň uslyší.
- **Záloha:** jednou denně se texty upravené na webu uloží do souborů v této složce (větev `dev`,
  GitHub Actions „Záloha textů z webu“; spustit jde i ručně).

## Protivníci (bestiář pro Boj)
Statblocky protivníků jsou ve složce `protivnici/` (vzor `_vzor.md`) a vidí je **jen vypravěč** – hráči nedostanou
ani jejich seznam. Hlavička nese rychlé údaje pro tracker iniciativy (úroveň houf / pacholek / sok / zhoubce, počet v houfu,
AC, HP, útok, základní útočný bonus houfu, Požehnání, Pokušení, komplikace, Neřest), text pod ní je celý statblock.
Na stránce **Boj** je vybereš ze seznamu u jména nepřítele nebo vyhledáním v bestiáři a tlačítkem **+ do boje**; nového založíš
v **Nový záznam** jako druh Protivník. Životy soků a zhoubců se během boje ukládají jen ve tvém prohlížeči.

## Úpravy v souborech (GitHub, Claude)
Soubory v této složce jsou zálohou databáze. Když se soubor změní ve větvi `dev`, sestavení změnu
do databáze přenese – **ledaže byl tentýž záznam mezitím upravený na webu**: pak vyhraje web
a sestavení vypíše „KONFLIKT“ (soubor se přenese až po další záloze a nové úpravě).
Před úpravou souborů je proto dobré spustit zálohu, aby soubory odpovídaly webu.

Všechno v této složce jsou obyčejné textové soubory. Dají se upravovat přímo na GitHubu
(otevřít soubor → tužka ✎ → upravit → *Commit changes* do větve `dev`).
Po uložení Netlify web sám sestaví; náhled je na https://dev--mundusmutatus.netlify.app.
Když je v souboru chyba (chybí povinné pole, neexistující rod…), sestavení skončí
s česky popsanou chybou v přehledu nasazení na Netlify a web zůstane ve stavu před úpravou.

| Složka / soubor | Co obsahuje | Vzor |
|---|---|---|
| `rody/` | panské rody, církevní vrchnosti, města, sousedé | `rody/_vzor.md` |
| `osoby/` | osoby v Zemských deskách | `osoby/_vzor.md` |
| `rodokmeny.json` | rodokmeny rodů (jeden řádek = jeden rod; `p` = id osoby, `r`/`rl` = id rodu, `pl` = id manžela/manželky, `m` = z kterého manželství je dítě, `dedic` = dědic (1, 2… pořadí), `narok` = text nároku; úmrtí se píše do `d`, např. `1442–5. 3. 1458`). Osoby se stejným `p` se v rodokmenech propojí (procházení rodin, „Jak jsou příbuzní?“). Děti a manželé, které družina ještě nezná, vidí hráči jako „syn (neznámý)“ apod. Budoucí sňatek nepatří do `pl` (prozradil by se přes propojení) | stávající řádky |
| `postavy-1458.json` | rešerše osob (klíč = id osoby): `narozeni` (RRRR-MM-DD nebo RRRR), `narozeniRok`, `narozeniOdhad` → věk k hernímu datu; `shrnuti` → „Dosavadní život“ (hráči ho vidí, až osobu družina potká). Objekt `gm` (`poBreznu1458`, `umrti`) a pole `jistota`, `rozporSWebem`, `zakladOdhadu`, `zdroje` vidí jen vypravěč (sekce „Po březnu 1458“); do hráčské verze se nedostanou, sestavení to hlídá stejně jako ⟦tajemství⟧ | stávající záznamy |
| `vazby.md` | krev, spojenectví a spory mezi rody (jeden řádek = jedna vazba) | návod v hlavičce souboru |
| `praha/` | očíslovaná místa na plánu Prahy | `praha/_vzor.md` |
| `praha-ulice.md` | názvy ulic, trhů a bran na plánu Prahy | návod v hlavičce souboru |
| `kronika/` | zápisy ze sezení | `kronika/_vzor.md` |
| `druzina/` | postavy hráčů | `druzina/_vzor.md` |
| `mista/` | místa objevená družinou na mapě zemí | `mista/_vzor.md` |
| `svet/` | mocnosti na mapě Známý svět (vládce, víra, `spor:` červeně, `napeti:` oranžově, `spojenec:` modře) | `svet/_vzor.md` |
| `svet-mesta.md` | města na mapě Známý svět | návod v hlavičce souboru |
| `svet-drzavy.md` | zámořské a vzdálené državy (tečka v barvě mateřské země) | návod v hlavičce souboru |
| `svet-cesty.md` | obchodní a poutní cesty a trasy lodí; po nich vede měření cesty | návod v hlavičce souboru |

## Pravidla
- Soubor má nahoře hlavičku mezi dvěma řádky `---` (pole `klíč: hodnota`), pod ní text.
- Soubory začínající `_` (vzory) web ignoruje. Řádky hlavičky začínající `#` jsou poznámky.
- Číslo na začátku názvu souboru (`010-pod.md`) určuje pořadí; nové soubory vkládejte mezi (`015-…`).
- **Tajemství** pište do `⟦tajný text⟧`, případně `⟦tajný text¦co uvidí hráči⟧`. Hráčská verze je
  vynechá a sestavení selže, kdyby tajný text někde zůstal. Celou vazbu skryjete slovem `tajné`.
- `✦` před jménem označuje postavu doplněnou pro kampaň (hráči značku nevidí).
- Souřadnice: ve vypravěčské verzi stačí **Alt + klik** do mapy zemí nebo do plánu Prahy –
  souřadnice se ukážou a zkopírují do schránky ve tvaru, který patří do souboru.
- Erby (`art/erby/<id>.webp`, velké `art/erby/velke/<id>.webp`) a portréty
  (`art/portrety/<id>.webp` + `<id>-m.webp`) se podle jména souboru najdou samy.

## Odhalování (co družina zná)
Na webu napojeném na databázi vidí hráči jen to, co vypravěč odhalil. Rody, osoby, dračí plemena a objevená místa mají tři stavy:

| Stav | Co uvidí hráči |
|---|---|
| **Skryté** | nic – záznam se jim vůbec nepošle (ani do zdrojového kódu stránky) |
| **Slyšeli** | jméno a základní údaje; osoba bez textu a se siluetou, rod s historií, ale bez postoje, zápisu kronikáře a rodokmenu, dračí plemeno bez obrázku a popisu |
| **Potkali** | vše kromě ⟦tajemství⟧ |

- Stav se přepíná na webu: ikona klíče **Vypravěč** vpravo v hlavní nabídce (nebo odkaz v patičce) → přihlášení → přehled všech rodů, osob a míst,
  případně lišta „Co o … ví družina“ přímo na stránce osoby, rodu či dračího plemene. Hráčům se změna ukáže do půl minuty.
- Osoba je hráčům vidět, jen když je vidět i její rod. Ve vypravěčském pohledu jsou skryté odkazy
  orámované čárkovaně, „slyšeli“ tečkovaně.
- **Výchozí stav** nového záznamu lze dát do hlavičky: `stav: skryta`, `stav: slyseli` nebo `stav: potkali`
  (bez pole = **skryté**, družina zpočátku nezná nic). Platí jen při prvním nahrání – potom rozhoduje přepínač na webu a nasazení ho nepřepíše.
- **Zmínky v textech** podle stavu: `[[jindrich4|Jindřich z Hradce]]` je odkaz, když družina osobu zná,
  jinak jen text; `[[jindrich4|Jindřich z Hradce|jakýsi pán]]` ukáže skrytou osobu jako „jakýsi pán“;
  `[[?var|celá věta…]]` se ukáže, jen když družina o rodu aspoň slyšela; `[[!var|věta…]]` jen když ho potkali.
  Funguje v textech osob, rodů, vazeb, Prahy, Kroniky, Družiny i Draconomiconu (id plemene např. `plivnik`).
- Vazba mezi rody se hráčům ukáže, jen když znají všechny rody ve vazbě.
