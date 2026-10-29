// Každá osoba v zemských deskách má vlastní statblok (protivnici/NNN-os-<id>.md) – jen pro vypravěče.
import {test} from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import fs from "node:fs";
import path from "node:path";

const G = createRequire(import.meta.url)("../../zdroj/generator.js");
const KOREN = path.resolve(import.meta.dirname, "../../zdroj/obsah");

function nacti(dir, out = {}, pre = "") {
  for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) nacti(p, out, pre + f.name + "/");
    else if (/\.(md|json)$/.test(f.name)) out[pre + f.name] = fs.readFileSync(p, "utf8");
  }
  return out;
}

const soubory = nacti(KOREN);
const osobySoubory = Object.keys(soubory).filter(k => k.startsWith("osoby/") && !k.endsWith("_vzor.md"));

test("osoby: každá má statblok os-<id> a ten existuje mezi protivníky", () => {
  assert.ok(osobySoubory.length > 100);
  const bestiar = new Set(
    Object.entries(soubory)
      .filter(([k]) => k.startsWith("protivnici/"))
      .map(([, t]) => (t.match(/^id:\s*(\S+)/m) || [])[1]),
  );
  for (const k of osobySoubory) {
    const id = (soubory[k].match(/^id:\s*(\S+)/m) || [])[1];
    const sb = (soubory[k].match(/^statblok:\s*(\S+)/m) || [])[1];
    assert.equal(sb, "os-" + id, `${k}: statblok má být os-${id}`);
    assert.ok(bestiar.has(sb), `${k}: chybí protivnici/…-${sb}.md`);
  }
});

test("osoby: statbloky se sestaví, mají štítek osoba, jen pro vypravěče a nejsou v hráčských datech", () => {
  const g = G.generuj(soubory, {});
  const gm = G.proGM(g.odh);
  const hrac = JSON.stringify(G.proHrace(g.odh).hrac);
  const os = (gm.PROTIVNICI || []).filter(p => p.id.startsWith("os-"));
  assert.equal(os.length, osobySoubory.length);
  for (const p of os) {
    assert.ok((p.st || []).includes("osoba"), `${p.id}: chybí štítek osoba`);
    assert.ok(["sok", "zhoubce"].includes(p.u), `${p.id}: úroveň sok/zhoubce`);
    assert.ok(p.hp && +(p.hp[0] ? p.hp[0].max : p.hp) > 0, `${p.id}: HP`);
    assert.ok(!hrac.includes(`"${p.id}"`), `${p.id}: statblok osoby se nesmí dostat k hráčům`);
  }
});
