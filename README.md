# Mundus Mutatus – web tažení

Hráčský web: https://mundusmutatus.netlify.app (větev `main`), náhled: https://dev--mundusmutatus.netlify.app (větev `dev`).

## Jak to funguje
- `zdroj/koruna.html` – celý web včetně **tajemství vypravěče**. Tajné pasáže jsou ve značkách `⟦tajné⟧` nebo `⟦tajné¦text pro hráče⟧`.
- `zdroj/obsah/` – veškerý obsah jako textové soubory: rody, osoby, vazby, místa v Praze, Kronika, Družina,
  objevená místa. **Návod: [`zdroj/obsah/NÁVOD.md`](zdroj/obsah/NÁVOD.md).**
- `art/` – obrázky (erby, portréty, ilustrace).
- `zdroj/build.py` – sestaví hráčskou verzi do `public/`; tajemství odstraní a zkontroluje, že žádné nezůstalo.
  Netlify ho spouští sám (viz `netlify.toml`) a publikuje **jen** `public/`.
- `supabase/schema.sql` – databáze odhalování (Supabase). Když má Netlify proměnnou `SUPABASE_SECRET`, build
  nahraje rody, osoby, vazby, rodokmeny, místa a Kroniku do databáze a do `public/` nedá nic z nich. Hráčská
  stránka si pak stáhne jen výřez toho, co družina zná; vypravěč se přihlásí odkazem **Vypravěč** v patičce
  a stavy (Skryté / Slyšeli / Potkali) přepíná živě, bez nového nasazení. Portréty mají v `public/` nečitelné názvy.
  Bez tajného klíče se web sestaví staticky jako dřív.
- Texty (rody, osoby, vazby, rodokmeny, Praha, místa, Kronika, Družina, Draconomicon) jsou v databázi a vypravěč
  je upravuje přímo na webu. Data webu z nich vyrábí `zdroj/generator.js` – stejný kód běží při sestavení
  (Node.js) i v prohlížeči vypravěče. Soubory v `zdroj/obsah/` jsou záloha: GitHub Actions je jednou denně
  aktualizuje z databáze (`zdroj/zaloha.py`, potřebuje tajemství `SUPABASE_SECRET` v nastavení repozitáře)
  a změny souborů ve větvi `dev` se při sestavení přenesou do databáze (pokud záznam mezitím nikdo neupravil na webu).
- Herní stav (datum, hodina, poloha družiny), Novinky a tracker iniciativy (`#boj`) jsou také v databázi.
  Tracker má bestiář jen pro vypravěče (`protivnici/`, `privlastky/`, `setkani/`, pole `statblok` u osob): hledání,
  hotová setkání, odhad obtížnosti, karty nepřátel s útoky a Závojem na kliknutí, zdroji, přívlastky a vazbou sok–houf,
  spojenci, kritická zranění, rychlá pravidla a shrnutí po boji do Kroniky. Tabulky setkání Výpravy jsou v
  `vyprava-setkani.json` (jen pro vypravěče). Část protivníků je převedena z D&D 2024; herní mechaniky podle
  System Reference Document 5.2 od Wizards of the Coast LLC, licence CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/).
- **Výprava** (`#vyprava`, jen vypravěč): cesta družiny podle pravidel Uncharted Journeys na všech třech mapách (Známý svět,
  Země Koruny, Praha) – trasa a doba v hodinách, generátor počasí podle data a místa, obtížnost, role a přípravy, setkání
  s vlastními tabulkami pro Čechy 1458, příjezd a tlačítko Odcestovat. Stav se ukládá do databáze (`mm_vyprava_uloz`,
  čte jen vypravěč); bez aktuálního `supabase/schema.sql` se ukládá jen v prohlížeči.
- Rychlost: hráčská verze má hlavní styl a skript v `public/v/` pod jmény s otiskem obsahu (prohlížeč si je uloží
  natrvalo, viz hlavičky v `netlify.toml`), písma leží v `art/pisma` (licence SIL OFL) a `zdroj/sw.js` zajišťuje
  offline režim (bez připojení se ukáže naposledy uložený stav desek). Portréty mají kromě plné verze i `-s`
  (300 px) a `-m` (náhled); velké ilustrace Artikulí `-s`, náhledy kapitol `-t`. `art/svet.json` je zhuštěný
  (souřadnice jako rozdíly), rozbalí ho `svRozbal` v prohlížeči.

- `testy/` – automatické testy (sestavení, tajemství, práva v databázi, odhalování, editor, prohlídka všech stránek).
  Běží na GitHubu při každém nahrání (akce „Kontrola webu“); popis v [`testy/README.md`](testy/README.md).

## Úpravy
Zápis ze sezení: na GitHubu otevři `zdroj/obsah/kronika/`, *Add file → Create new file*, zkopíruj obsah `_vzor.md` a uprav.
Ulož do větve `dev`, zkontroluj náhled, pak sluč do `main`.

Místně: `python3 zdroj/build.py` (hráčská verze) nebo `python3 zdroj/build.py --vypravec` (verze s tajemstvími, nepublikovat).
