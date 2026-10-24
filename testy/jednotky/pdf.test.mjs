// Import listu postavy z PDF D&D Beyond (čistý 10k-import-pdf.js) v čistém Node: pole skutečného PDF Balduina
// (testy/karta-pdf-pole.json) → karta. Dřív jen v prohlížeči (prohlizec_boj2.py).
import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ciste} from "./ciste.mjs";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const {ev, V} = ciste();
const pole = JSON.parse(fs.readFileSync(path.join(KOREN, "testy", "karta-pdf-pole.json"), "utf8"));
const K = JSON.parse(JSON.stringify(ev("kartaZPdf")(pole)));

test("import PDF: jméno, AC, HP, útoky, kouzla, sloty paktu, Resistance a přídavky", () => {
  assert.deepEqual(
    [K.n, K.ac, K.hp, K.utoky.length, K.kouzla.seznam.length, K.kouzla.sloty[0].max, K.odol.join(), K.efekty.length],
    ["Balduin", 18, 62, 2, 20, 2, "Cold", 3],
  );
});

test("import PDF: povolání, vlastnosti, záchrany, zdatnost a kouzelná vlastnost", () => {
  assert.equal(K.povolani, "Warlock 6 / Fighter 1");
  assert.equal(K.uroven, 7);
  assert.deepEqual(K.vl, {STR: 9, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 18});
  assert.deepEqual(K.zachProf, ["WIS", "CHA"]);
  assert.equal(K.zdatnost, 3);
  assert.equal(K.kouzla.vl, "CHA");
  assert.equal(K.kouzla.dc, 15);
  assert.ok(K.kouzla.sloty[0].pakt, "sloty černokněžníka jsou pakt");
});

test("import PDF: útok Nevermore (bonus, zranění, typ, počet útoků) a Eldritch Blast na dálku", () => {
  const nv = K.utoky.find(a => a.n === "Nevermore"),
    eb = K.utoky.find(a => a.n === "Eldritch Blast");
  assert.deepEqual([nv.b, nv.z, nv.t], [8, "1d8+5", "Force"]);
  assert.ok(eb && eb.dal, "Eldritch Blast je útok na dálku");
});

test("import PDF běží bez stránky (kontrola čistoty) a je opakovatelný", () => {
  assert.deepEqual(V(`kartaZPdf(${JSON.stringify(pole)}).n`), "Balduin");
});
