// Rychlé testy ikon účinků (2026-10-23, 17b + 15): jméno účinku → ikona, ikony na žetonu postavy (zapnutá Rage, podoba, předzvěst)
// a v seznamu Účinky na kartě; každá ikona z KZIK existuje jako soubor v obou velikostech.
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

test("ikona účinku podle jména: přesně, se stupněm, s upřesněním za dvojtečkou a kostka Bardic", () => {
  assert.equal(V(`kzIk("Guidance")`), "vedeni");
  assert.equal(V(`kzIk("Heroism (2. st.)")`), "hrdinstvi");
  assert.equal(V(`kzIk("Účinek: Sanctuary")`), "utociste");
  assert.equal(V(`kzIk("Hexblade's Curse: Damaging Hex")`), "hexblade");
  assert.equal(V(`kzIk("Bardic d8")`), "bardska");
  assert.equal(V(`kzIk("Neznámé kouzlo")`), null);
});

test("každá ikona z KZIK má soubor 48 i 96 px", () => {
  const F = V(`[...new Set(Object.values(KZIK))]`);
  const chybi = F.filter(f => !existsSync(`art/img/boj/${f}-48.webp`) || !existsSync(`art/img/boj/${f}-96.webp`));
  assert.deepEqual(chybi, []);
});

test("žeton postavy: zapnutá Rage, podoba a předzvěst Věštce jsou mezi účinky; seznam Účinky na kartě má ikonu", () => {
  const K0 = S.ev(`JSON.stringify(KST.balduin || null)`);
  S.ev(
    `KST.balduin = Object.assign({}, KST.balduin || {}, {pri: ["Rage", "Bardic d8"], forma: {typ: "ws", n: "Vlk"}, port: [17, 4], uc: [{n: "Mirror Image", h: 0.02}]})`,
  );
  try {
    const s = {aktivni: true, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: []};
    const L = V(`bojKzEf(${JSON.stringify(s)}, "h1")`);
    const jm = L.map(e => e.n);
    for (const n of ["Rage", "Bardic Inspiration", "Wild Shape", "Portent"]) assert.ok(jm.includes(n), `${n} chybí v ${jm}`);
    assert.equal(L.find(e => e.n === "Portent").pozn, "předzvěst 17, 4");
    assert.match(V(`bojKzIkHtml(${JSON.stringify(s)}, "h1")`), /zurivost-48\.webp/);
    assert.match(V(`kUcHtml(KARTBY.balduin)`), /class="kucik" src="art\/img\/boj\/zrcadla-48\.webp"/);
  } finally {
    S.ev(`KST.balduin = ${K0} || undefined`);
  }
});
