// Hlídač anachronismů (2026-10-27, Vojta: „v textech se objevují pořád anachronismy“): hráčský text obsahu nesmí zmínit rok po
// březnu 1458 – budoucnost patří do tajného ⟦…⟧ pro vypravěče. Kontroluje soubory, které build posílá hráčům (rody, osoby,
// Praha, Kronika, traktáty, Družina, Draconomicon, vazby, svět, rodokmeny a shrnutí v rešerši postav). Setkání, protivníci
// a náměty k mapě jsou jen pro vypravěče a nekontrolují se. Výjimka (proroctví, pověst o budoucnosti) = řádek v POVOLENO.
import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const OBSAH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "zdroj", "obsah");
const SLOZKY = ["rody", "osoby", "kronika", "druzina", "mista", "praha", "traktaty", "draconomicon/kapitoly", "draconomicon/plemena"];
const SOUBORY = ["vazby.md", "praha-ulice.md", "svet-cesty.md", "svet-drzavy.md", "svet-mesta.md"];
/* [soubor, úryvek kolem roku] – vědomé výjimky */
const POVOLENO = [];
/* rok po březnu 1458 (1459–1999), ne část delšího čísla */
const ROK = /(?<![\d.,])(1459|14[6-9]\d|1[5-9]\d\d)(?!\d)/g;
/* hráčská část: tajné ⟦…⟧ pryč, z ⟦tajné¦pro hráče⟧ zůstane část pro hráče */
const hracsky = t => t.replace(/⟦[^⟧¦]*¦([^⟧]*)⟧/g, "$1").replace(/⟦[^⟧]*⟧/g, "");

function nalezy(soubor, text) {
  const out = [];
  for (const m of hracsky(text).matchAll(ROK)) {
    const ctx = hracsky(text)
      .slice(Math.max(0, m.index - 50), m.index + 25)
      .replace(/\s+/g, " ");
    if (!POVOLENO.some(([s, u]) => s === soubor && ctx.includes(u))) out.push(`${soubor}: „…${ctx}…“`);
  }
  return out;
}

test("hráčské texty obsahu nezmiňují roky po březnu 1458", () => {
  const L = [];
  for (const d of SLOZKY) {
    const dir = path.join(OBSAH, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".md") && !f.startsWith("_")))
      L.push(...nalezy(`${d}/${f}`, fs.readFileSync(path.join(dir, f), "utf8")));
  }
  /* řádky „- tajné …“ (vazby) jsou celé jen pro vypravěče */
  for (const f of SOUBORY)
    if (fs.existsSync(path.join(OBSAH, f)))
      L.push(
        ...nalezy(
          f,
          fs
            .readFileSync(path.join(OBSAH, f), "utf8")
            .split("\n")
            .filter(r => !/^-\s*tajn/.test(r))
            .join("\n"),
        ),
      );
  /* rodokmeny: jména, roky a poznámky (bez tajných částí) */
  const R = JSON.parse(fs.readFileSync(path.join(OBSAH, "rodokmeny.json"), "utf8"));
  /* záznam s "$gm": true (osoba či sňatek, který hráči nevidí) se vynechá celý */
  L.push(
    ...nalezy(
      "rodokmeny.json",
      JSON.stringify(R, (k, v) => (v && typeof v === "object" && !Array.isArray(v) && v.$gm ? undefined : v)),
    ),
  );
  /* rešerše postav: hráči vidí jen shrnutí */
  const P = JSON.parse(fs.readFileSync(path.join(OBSAH, "postavy-1458.json"), "utf8"));
  for (const [id, o] of Object.entries(P)) if (o && o.shrnuti) L.push(...nalezy(`postavy-1458.json ${id}`, String(o.shrnuti)));
  assert.deepEqual(L, [], "budoucnost patří do ⟦…⟧ (jen pro vypravěče):\n" + L.join("\n"));
});
