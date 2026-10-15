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

## Úpravy
Zápis ze sezení: na GitHubu otevři `zdroj/obsah/kronika/`, *Add file → Create new file*, zkopíruj obsah `_vzor.md` a uprav.
Ulož do větve `dev`, zkontroluj náhled, pak sluč do `main`.

Místně: `python3 zdroj/build.py` (hráčská verze) nebo `python3 zdroj/build.py --vypravec` (verze s tajemstvími, nepublikovat).
