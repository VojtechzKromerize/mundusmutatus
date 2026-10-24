// Editor textů (21): pojistka proti smazání obsahu webu – když databáze vrátí prázdné záznamy, editor nic neuloží (údržba 2026-10-24).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("editor: prázdné nebo chybějící záznamy z databáze jsou chyba, ne prázdný obsah", async () => {
  const zkus = vysledek =>
    S.ev(`(async () => {
      const M0 = window.MMDB, Z0 = ED.z;
      window.MMDB = Object.assign({}, M0, {zaznamy: async () => ${vysledek}});
      ED.z = null;
      try { return "ok:" + Object.keys(await edNacti()).length; } catch (e) { return "chyba"; } finally { window.MMDB = M0; ED.z = Z0; }
    })()`);
  assert.equal(await zkus("null"), "chyba");
  assert.equal(await zkus("({})"), "chyba");
  assert.equal(await zkus(`({"osoby/a.md": "x", "osoby/b.md": "y"})`), "ok:2");
});
