// Okno reakce (10r-reakce.js): kdo může reagovat, nabídka podle spouštěče a výsledek – v čistém Node; napojení na kartu ve stránce.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const {V} = ciste();
const F = o => JSON.stringify(Object.assign({kouzla: [], rysy: [], man: [], str: 3, agi: 2, pb: 3}, o));
const ok = (f, e, sp) => V(`reakceOkno(${F(f)}, ${JSON.stringify(e)}, "${sp}")`);
const ZAS = {hod: 17, ac: 15, d: 12, ph: 9, t: "Slashing", ai: "n1"};

test("reakce jednou za kolo, ne ve stavu, který ji bere, a ne na 0 HP – pro všechny reakce stejně", () => {
  const f = {kouzla: [{n: "Shield", i: 0, st: 1}], rysy: ["uncanny dodge"]};
  assert.deepEqual(
    ok(f, ZAS, "zasah").o.map(r => r.k),
    ["shield", "ud"],
  );
  assert.equal(ok({...f, rk: true}, ZAS, "zasah").proc, "Reakci jsi už v tomto kole použil.");
  assert.equal(ok({...f, nemuze: "omráčen"}, ZAS, "zasah").proc, "Nemůžeš reagovat (omráčen).");
  assert.deepEqual(ok({...f, ds: true}, ZAS, "zasah").o, []);
  assert.equal(V(`reakceMa(${F({kouzla: [{n: "Counterspell", i: 3, st: 3}], nemuze: "paralyzovaný"})}, null, "kouzlo", "counterspell")`), false);
  assert.equal(V(`reakceMa(${F({kouzla: [{n: "Counterspell", i: 3, st: 3}]})}, null, "kouzlo", "counterspell")`), true);
});

test("nabídka podle spouštěče: Shield na zásah, Riposte a Odvetná na minutí, Counterspell na kouzlo", () => {
  const f = {
    kouzla: [
      {n: "Shield", i: 0, st: 1},
      {n: "Counterspell", i: 1, st: 3},
      {n: "Feather Fall", i: 2, st: 1},
    ],
    man: ["Riposte", "Parry"],
    sd: {k: "d8", zb: 2},
    odv: true,
  };
  assert.deepEqual(
    ok(f, ZAS, "zasah").o.map(r => r.k),
    ["shield", "kz", "parry"],
  );
  assert.equal(ok(f, ZAS, "zasah").o[0].n, "Shield – útok mine");
  assert.deepEqual(
    ok(f, {v: "vedle (9)", ai: "n1", zv: "pok"}, "vedle").o.map(r => r.k),
    ["riposte", "odv"],
  );
  /* Odvetná jen s Pokušením, obě jen proti útoku zblízka */
  assert.deepEqual(
    ok(f, {ai: "n1", zv: "poz"}, "vedle").o.map(r => r.k),
    ["riposte"],
  );
  assert.deepEqual(ok(f, {ai: "n1", zv: "pok", dal: 1}, "vedle").o, []);
  assert.deepEqual(
    ok(f, {}, "kouzlo").o.map(r => r.k),
    ["counterspell"],
  );
  /* Parry jen zblízka a bez kostek převahy nic */
  assert.ok(!ok(f, {...ZAS, dal: 1}, "zasah").o.some(r => r.k === "parry"));
  assert.ok(!ok({...f, sd: {k: "d8", zb: 0}}, ZAS, "zasah").o.some(r => r.k === "parry"));
});

test("výsledek: kolik HP reakce vrátí", () => {
  const R = (k, e, f, x) => V(`reakceVysledek("${k}", ${JSON.stringify(e)}, ${F(f || {})}, ${JSON.stringify(x || {})})`);
  assert.deepEqual(R("shield", ZAS), {n: 9, proc: "Shield – útok minul"});
  assert.equal(R("shield", {...ZAS, hod: 21}).n, 0);
  assert.equal(R("shield", {...ZAS, kr: 1}).n, 0);
  assert.equal(R("absorb", {...ZAS, t: "Fire"}).n, 5);
  assert.equal(R("absorb", ZAS).n, 0);
  assert.equal(R("ud", ZAS).n, 5);
  assert.deepEqual(R("da", ZAS, {mnich: 5}, {d: 1}), {n: 8, proc: "Deflect Attacks (8)"});
  assert.deepEqual(R("parry", ZAS, {}, {d: 3}), {n: 6, proc: "Parry (3+3)"});
  /* Cutting Words: odečte od útoku – když mine, vrátí vše; jinak sníží zranění */
  assert.equal(R("cw", ZAS, {}, {d: 3}).n, 9);
  assert.deepEqual(R("cw", ZAS, {}, {d: 1}), {n: 1, proc: "Cutting Words (−1 ze zranění)"});
  /* Silvery Barbs: útočník přehodí d20 a platí nižší */
  assert.equal(R("barbs", ZAS, {}, {d20: 4}).n, 9);
  assert.equal(R("barbs", ZAS, {}, {d20: 15}).n, 0);
  assert.equal(R("kz", ZAS), null);
});

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
});
after(() => S && S.zavri());

test("stránka: nabídka na zásah bere fakta z karty; použitá reakce ukáže důvod, obětování zbroje zůstane", () => {
  const r = S.ev(`(() => {
    const K = KARTBY.balduin, h = {id: "h1", k: K.id, n: K.n}, e = {hod: 17, ac: 18, d: 12, ph: 9, kr: 1, t: "Slashing", ai: "n1"};
    const f = kReakceFakta(K, h, {reak: {}}, e);
    const a = kReakceNaZasah(K, h, {reak: {}}, e), b = kReakceNaZasah(K, h, {reak: {h1: 1}}, e);
    return JSON.stringify({rysy: Array.isArray(f.rysy), pb: f.pb, a: a.rk, bProc: b.proc, bObet: b.o.filter(x => x.k !== "obet").length});
  })()`);
  const o = JSON.parse(r);
  assert.equal(o.rysy, true);
  assert.ok(o.pb >= 2);
  assert.equal(o.a, false);
  assert.equal(o.bProc, "Reakci jsi už v tomto kole použil.");
  assert.equal(o.bObet, 0, "s použitou reakcí jen obětování zbroje (není to reakce)");
});
