# Mundus Mutatus – web tažení

Hráčský web: https://mundusmutatus.netlify.app (větev `main`), náhled: https://dev--mundusmutatus.netlify.app (větev `dev`).

## Jak to funguje
- `zdroj/koruna.html` – celý web včetně **tajemství vypravěče**. Tajné pasáže jsou ve značkách `⟦tajné⟧` nebo `⟦tajné¦text pro hráče⟧`.
- `zdroj/obsah/` – veškerý obsah jako textové soubory: rody, osoby, vazby, místa v Praze, Kronika, Družina,
  objevená místa. **Návod: [`zdroj/obsah/NÁVOD.md`](zdroj/obsah/NÁVOD.md).**
- `art/` – obrázky (erby, portréty, ilustrace).
- `zdroj/build.py` – sestaví hráčskou verzi do `public/`; tajemství odstraní a zkontroluje, že žádné nezůstalo.
  Netlify ho spouští sám (viz `netlify.toml`) a publikuje **jen** `public/`.

## Úpravy
Zápis ze sezení: na GitHubu otevři `zdroj/obsah/kronika/`, *Add file → Create new file*, zkopíruj obsah `_vzor.md` a uprav.
Ulož do větve `dev`, zkontroluj náhled, pak sluč do `main`.

Místně: `python3 zdroj/build.py` (hráčská verze) nebo `python3 zdroj/build.py --vypravec` (verze s tajemstvími, nepublikovat).
