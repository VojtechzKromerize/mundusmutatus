# Jak upravovat obsah webu

Všechno v této složce jsou obyčejné textové soubory. Dají se upravovat přímo na GitHubu
(otevřít soubor → tužka ✎ → upravit → *Commit changes* do větve `dev`).
Po uložení Netlify web sám sestaví; náhled je na https://dev--mundusmutatus.netlify.app.
Když je v souboru chyba (chybí povinné pole, neexistující rod…), sestavení skončí
s česky popsanou chybou v přehledu nasazení na Netlify a web zůstane ve stavu před úpravou.

| Složka / soubor | Co obsahuje | Vzor |
|---|---|---|
| `rody/` | panské rody, církevní vrchnosti, města, sousedé | `rody/_vzor.md` |
| `osoby/` | osoby v Zemských deskách | `osoby/_vzor.md` |
| `rodokmeny.json` | rodokmeny rodů (jeden řádek = jeden rod; `p` = id osoby, `r`/`rl` = id rodu, `pl` = id manžela/manželky) | stávající řádky |
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
Na webu napojeném na databázi vidí hráči jen to, co vypravěč odhalil. Rody, osoby a objevená místa mají tři stavy:

| Stav | Co uvidí hráči |
|---|---|
| **Skryté** | nic – záznam se jim vůbec nepošle (ani do zdrojového kódu stránky) |
| **Slyšeli** | jméno a základní údaje; osoba bez textu a se siluetou, rod bez postoje, zápisu kronikáře a rodokmenu |
| **Potkali** | vše kromě ⟦tajemství⟧ |

- Stav se přepíná na webu: odkaz **Vypravěč** v patičce → přihlášení → přehled všech rodů, osob a míst,
  případně lišta „Co o osobě ví družina“ přímo na stránce osoby či rodu. Hráčům se změna ukáže do půl minuty.
- Osoba je hráčům vidět, jen když je vidět i její rod. Ve vypravěčském pohledu jsou skryté odkazy
  orámované čárkovaně, „slyšeli“ tečkovaně.
- **Výchozí stav** nového záznamu lze dát do hlavičky: `stav: skryta`, `stav: slyseli` nebo `stav: potkali`
  (bez pole = potkali). Platí jen při prvním nahrání – potom rozhoduje přepínač na webu a nasazení ho nepřepíše.
- **Zmínky v textech** podle stavu: `[[jindrich4|Jindřich z Hradce]]` je odkaz, když družina osobu zná,
  jinak jen text; `[[jindrich4|Jindřich z Hradce|jakýsi pán]]` ukáže skrytou osobu jako „jakýsi pán“;
  `[[?var|celá věta…]]` se ukáže, jen když družina o rodu aspoň slyšela; `[[!var|věta…]]` jen když ho potkali.
  Funguje v textech osob, rodů, vazeb, Prahy, Kroniky i Družiny.
- Vazba mezi rody se hráčům ukáže, jen když znají všechny rody ve vazbě.
