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
| `vazby.md` | krev, spojenectví a spory mezi rody (jeden řádek = jedna vazba) | návod v hlavičce souboru |
| `praha/` | očíslovaná místa na plánu Prahy | `praha/_vzor.md` |
| `praha-ulice.md` | názvy ulic, trhů a bran na plánu Prahy | návod v hlavičce souboru |
| `kronika/` | zápisy ze sezení | `kronika/_vzor.md` |
| `druzina/` | postavy hráčů | `druzina/_vzor.md` |
| `mista/` | místa objevená družinou na mapě zemí | `mista/_vzor.md` |
| `svet/` | mocnosti na mapě Známý svět (vládce, víra, `spor:` červeně, `spojenec:` modře) | `svet/_vzor.md` |
| `svet-mesta.md` | města na mapě Známý svět | návod v hlavičce souboru |
| `svet-drzavy.md` | zámořské a vzdálené državy (tečka v barvě mateřské země) | návod v hlavičce souboru |
| `svet-cesty.md` | obchodní a poutní cesty a trasy lodí; po nich vede měření cesty | návod v hlavičce souboru |
| `svet-zpravy.md` | zprávy ze světa (události s datem) | návod v hlavičce souboru |
| `svet-draci.md` | draci a Závoj: sbory, stanice, hnízdiště, pověsti | návod v hlavičce souboru |

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
