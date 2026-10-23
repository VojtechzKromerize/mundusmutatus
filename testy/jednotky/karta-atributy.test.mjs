// Rychlý test vlastností na kartě (2026-10-23): mince se zkratkou, skóre, modifikátor a záchrana ve štítku v tomto pořadí;
// zdatnost v záchraně = plný štítek (třída kprof), mince existují v art/img/atributy ve velikostech 48 a 96 px.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};

test("vlastnost: mince, skóre, modifikátor a záchrana ve štítku v tomto pořadí; zdatnost plní štítek", () => {
  const BAB = V(`BAB`);
  assert.equal(BAB.length, 6);
  const pf = V(`KARTBY.balduin.zachProf || []`);
  for (const a of BAB) {
    const h = V(`bdmVlRadek(KARTBY.balduin, ${JSON.stringify(a)}, "", true)`);
    const ik = `art/img/atributy/${a.toLowerCase()}`;
    assert.ok(h.includes(`src="${ik}-48.webp"`), `${a}: mince`);
    for (const s of [48, 96]) assert.ok(existsSync(new URL(`../../${ik}-${s}.webp`, import.meta.url)), `${a}: soubor mince ${s} px`);
    const iS = h.indexOf('class="bdmvls"'),
      iM = h.indexOf('class="bdmvlm"'),
      iZ = h.indexOf('class="bdmvlzh"');
    assert.ok(iS > 0 && iS < iM && iM < iZ, `${a}: pořadí skóre → modifikátor → záchrana`);
    const zs = V(`bsg(kZach(KARTBY.balduin, ${JSON.stringify(a)}))`),
      md = V(`bsg(kMod(kVl(KARTBY.balduin, ${JSON.stringify(a)})))`);
    assert.ok(h.includes(`<b>${zs}</b></button></div>`), `${a}: číslo záchrany ve štítku`);
    assert.ok(h.includes(`>${md}</button>`), `${a}: modifikátor`);
    assert.equal(h.includes(" kprof"), pf.includes(a), `${a}: plný štítek jen při zdatnosti`);
    assert.ok(!h.includes("kdbdot"), `${a}: bez dřívější tečky`);
  }
});
