// Kouzla v boji podle Vojtovy zpětné vazby (2026-10-24): Haste na spojence, Booming Blade a spol. jako trik k útoku zbraní,
// paprsky Eldritch Blast na různé cíle s vlastním hodem a zraněním, smity nabídnuté až po potvrzeném zásahu.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev("kSpNacti()");
});
after(() => S && S.zavri());
const V = vyraz => {
  const r = S.ev(`JSON.stringify(${vyraz})`);
  return r === undefined ? undefined : JSON.parse(r);
};
const BOJ0 = `{aktivni: true, kolo: 1, tah: 1, obsazeni: {1: "h1"}, hraci: [{id: "h1", n: "Balduin", k: "balduin"}], npc: [{id: "n1", n: "Vlk"}, {id: "n2", n: "Bandita"}], utoky: []}`;
const sBojem = f => {
  const B0 = S.ev(`JSON.stringify(BOJ.s || null)`),
    J0 = S.ev(`JSON.stringify(BJU)`);
  S.ev(`BOJ.s = ${BOJ0}`);
  try {
    return f();
  } finally {
    S.ev(`BOJ.s = ${B0}; Object.keys(BJU).forEach(k => delete BJU[k]); Object.assign(BJU, ${J0})`);
  }
};

test("Haste, Beacon of Hope: výhoda na záchrany není záchrana cíle – kouzlo jde na spojence", () => {
  assert.equal(V(`kSpBoj(KARTBY.balduin, {n: "Haste", st: 3}, 3)`), null);
  assert.equal(V(`kSpBoj(KARTBY.balduin, {n: "Beacon of Hope", st: 3}, 3)`), null);
  assert.equal(V(`kSpBoj(KARTBY.balduin, {n: "Hold Person", st: 2}, 2).zach`), "WIS", "skutečná záchrana cíle zůstává");
});

test("Booming Blade: trik k útoku zbraní – zvolený se pošle v „čím“, Kouzla otevřou útok zbraní", () => {
  const T = V(`bojTrikIdx(KARTBY.balduin).map(([e, i]) => [e.n, i])`);
  const bb = T.find(x => x[0] === "Booming Blade");
  assert.ok(bb, "Balduin zná Booming Blade");
  assert.equal(V(`bojTrikZvol(KARTBY.balduin, {ef: [${bb[1]}]}, {n: "Nevermore"})`), "Booming Blade");
  assert.equal(V(`bojTrikZvol(KARTBY.balduin, {ef: [${bb[1]}]}, {n: "Hand Crossbow", dal: true})`), null, "Booming Blade jen zblízka");
  assert.deepEqual(V(`bojRidNavic(null, "Booming Blade").map(r => r.cim)`), ["Booming Blade"]);
  sBojem(() => {
    const h = V(`bdmKouzla(BOJ.s, BOJ.s.hraci[0], KARTBY.balduin, false, {boj: true})`);
    assert.match(h, new RegExp(`data-bdmsh="utok" data-j="\\d+" data-bpef="${bb[1]}"`), "Seslat u Booming Blade otevře útok zbraní s trikem");
  });
});

test("Eldritch Blast: každý paprsek na svůj cíl, vlastní hod i zranění", () => {
  sBojem(() => {
    const i = V(`kSeznam(KARTBY.balduin).findIndex(x => x.n === "Eldritch Blast")`);
    assert.ok(i >= 0);
    S.ev(`bojJa.set("Balduin"); Object.assign(BJU, {ks: ${i}, sl: "", adv: "0", pap: ["n1", "n2"], cil: "n1", ef: []})`);
    S.kostky([
      [15, 20],
      [6, 10],
      [3, 20],
      [2, 10],
      [4, 6],
    ]);
    S.ev(`bojJaHodKouzlo(BOJ.s, BOJ.s.hraci[0], bojJaSp(BOJ.s, BOJ.s.hraci[0]))`);
    const ser = V(`BJU.serie.map(x => [x.ci, x.d, x.dmg > 0])`);
    assert.deepEqual(
      ser.map(x => x.slice(0, 2)),
      [
        ["n1", 15],
        ["n2", 3],
      ],
      "1. paprsek na Vlka, 2. na Banditu",
    );
    assert.match(V(`BJU.info`), /Vlk: d20 15.*Bandita: d20 3/);
  });
});

test("smity: po potvrzeném zásahu zbraní karta nabídne Eldritch Smite; před potvrzením ne, po minutí ne", () => {
  sBojem(() => {
    S.ev(`window.__r = KARTBY.balduin.rysy; KARTBY.balduin.rysy = [...(KARTBY.balduin.rysy || []), "Eldritch Smite"]`);
    try {
      const u = o => JSON.stringify(Object.assign({id: "u1", h: "h1", ci: ["n1"], cim: "Nevermore", hod: 18, d: 12, dmg: 9, t: "Force", k: 1}, o));
      S.ev(`BOJ.s.utoky = [${u({stav: "ceka"})}]`);
      assert.equal(V(`bojJaSmitNabidka(BOJ.s, BOJ.s.hraci[0], true)`), null, "čeká na vypravěče – zatím nic");
      S.ev(`BOJ.s.utoky = [${u({stav: "hotovo", vys: "vedle"})}]`);
      assert.equal(V(`bojJaSmitNabidka(BOJ.s, BOJ.s.hraci[0], true)`), null, "minul – nic");
      S.ev(`BOJ.s.utoky = [${u({stav: "hotovo", vys: "kritický zásah"})}]`);
      const N = V(`(N => N && {krit: N.krit, R: N.R.map(r => r.n)})(bojJaSmitNabidka(BOJ.s, BOJ.s.hraci[0], true))`);
      assert.equal(N.krit, true);
      assert.ok(N.R.includes("Eldritch Smite"), "po kritickém zásahu Eldritch Smite (kostky dvakrát)");
    } finally {
      S.ev(`KARTBY.balduin.rysy = window.__r`);
    }
  });
});
