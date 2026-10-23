// Účet tahu (10t-tah.js) v čistém Node a jeho napojení na kartu (průvodce tahem, kostky jednou za tah) ve stránce.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();

test("účet tahu: nový tah vynuluje akce i „jednou za tah“, starý zůstane", () => {
  assert.deepEqual(
    C.V(`(() => { const u = {}; tahObnov(u, "1:2"); tahOznac(u, "A"); tahJednouZapis(u, "sa"); const r1 = [u.a, u.b, u.jt.length];
      tahObnov(u, "1:2"); const r2 = [u.a, u.jt.length]; tahObnov(u, "1:3"); return [r1, r2, [u.a, u.b, u.p, u.jt.length, u.k]]; })()`),
    [
      [1, 0, 1],
      [1, 1],
      [0, 0, 0, 0, "1:3"],
    ],
  );
});

test("akce: druhé použití téže akce vrátí false; B = BA (Smite, přesun Hexu); ruční přepnutí", () => {
  assert.deepEqual(C.V(`(() => { const u = tahObnov({}, "1:1"); return [tahOznac(u, "BA"), tahOznac(u, "B"), u.b, tahOznac(u, "X")]; })()`), [
    true,
    false,
    1,
    false,
  ]);
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); tahPrepni(u, "p"); const a = tahMa(u, "P"); tahPrepni(u, "P"); return [a, tahMa(u, "P")]; })()`),
    [true, false],
  );
  assert.equal(C.V(`tahKlic({kolo: 3, tah: 5})`), "3:5");
});

test("jednou za tah: zápis bez zdvojení, staré uložené tvary se obnoví", () => {
  assert.deepEqual(C.V(`tahJednouZapis(tahObnov({}, "1:1"), ["sa", "sa", "ds"]).jt`), ["sa", "ds"]);
  /* BJU.ridT z dřívější verze ({tk, u}) se při prvním použití vynuluje do nového tvaru */
  assert.deepEqual(C.V(`tahObnov({tk: 101, u: ["sa"]}, "1:1").jt`), []);
});

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti()])");
});
after(() => S && S.zavri());

test("stránka: bojBptOznac('B') odškrtne bonusovou akci (dřív tiše nic)", () => {
  const r = S.ev(`(() => { const s0 = BOJ.s; BOJ.s = {aktivni: true, kolo: 2, tah: 4, hraci: [], npc: []};
    try { bojBptOznac("B"); bojBptOznac("A"); return JSON.stringify([BPT.b, BPT.a, BPT.k]); } finally { BOJ.s = s0; } })()`);
  assert.deepEqual(JSON.parse(r), [1, 1, "2:4"]);
});

test("stránka: Emboldening Bond se přičte k prvnímu hodu v tahu, druhý hod téhož tahu ho nemá, další tah znovu; Bless vždy", () => {
  const r = S.ev(`(() => {
    const s0 = BOJ.s, K = {id: "t_eb", n: "Zkouška"};
    KST[K.id] = {pri: ["Bless", "Emboldening Bond"]};
    BOJ.s = {aktivni: true, kolo: 1, tah: 1, hraci: [], npc: []};
    try {
      const a = kPriHod(K, "Útok").n, b = kPriHod(K, "Záchrana WIS").n;
      BOJ.s.tah = 2;
      const c = kPriHod(K, "Záchrana WIS").n;
      BOJ.s = {aktivni: true, scena: true};
      const d = kPriHod(K, "Útok").n, e = kPriHod(K, "Útok").n;
      return JSON.stringify([a, b, c, d, e]);
    } finally { BOJ.s = s0; delete KST[K.id]; delete KTAHJ[K.id]; }
  })()`);
  assert.deepEqual(JSON.parse(r), [
    ["Bless", "Emboldening Bond"],
    ["Bless"],
    ["Bless", "Emboldening Bond"],
    ["Bless", "Emboldening Bond"],
    ["Bless", "Emboldening Bond"],
  ]);
});
