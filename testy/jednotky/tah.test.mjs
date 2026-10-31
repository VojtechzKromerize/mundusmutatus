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

test("pohyb: zbývá z rychlosti, Sprint přidá rychlost, víc než zbývá se neujde (2026-10-25)", () => {
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); const a = tahPohni(u, 20, 30); const b = tahPohni(u, 20, 30); const p1 = tahMa(u, "P");
      const sp = tahSprint(u, "A"); const c = tahPohyb(u, 30); const d = tahPohni(u, -5, 30); return [a.zbyva, b.zbyva, p1, sp, c.max, c.zbyva, d.zbyva, tahMa(u, "A")]; })()`),
    [10, 0, true, true, 60, 30, 35, true],
  );
  /* Sprint bonusovou akcí (Cunning Action) nechá akci volnou; druhý Sprint toutéž akcí nejde */
  assert.deepEqual(C.V(`(() => { const u = tahObnov({}, "1:1"); return [tahSprint(u, "BA"), tahSprint(u, "BA"), u.d, tahMa(u, "A")]; })()`), [
    true,
    false,
    1,
    false,
  ]);
  assert.deepEqual(C.V(`(() => { const u = tahObnov({}, "1:1"); tahPohni(u, 15, 30); tahObnov(u, "1:2"); return [u.m, u.d]; })()`), [0, 0]);
});

test("ruční přepínače: pohyb označený rukou = nic nezbývá, Sprint pak přidá celou rychlost; po Action Surge má druhá akce vlastní přepínač", () => {
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); tahPrepni(u, "P"); const a = tahPohyb(u, 30).zbyva; tahSprint(u, "A", 30); const b = tahPohyb(u, 30);
      const c = tahPohni(u, -10, 30).zbyva; return [a, b.zbyva, b.max, c]; })()`),
    [0, 30, 60, 40],
  );
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); tahSurge(u); tahPrepni(u, "a"); const a = [u.a, u.a2, tahMa(u, "A")]; tahPrepni(u, "A2"); const b = [u.a, u.a2];
      tahPrepni(u, "a"); tahPrepni(u, "a2"); return [a, b, [u.a, u.a2]]; })()`),
    [
      [1, 0, false],
      [1, 1],
      [0, 0],
    ],
  );
});

test("Action Surge: druhá akce, akce je vyčerpaná až po obou; Haste dává vlastní akci (2026-10-25)", () => {
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); tahOznac(u, "A"); const a = tahMa(u, "A"); const s1 = tahSurge(u), s2 = tahSurge(u);
      const b = tahMa(u, "A"); const o = tahOznac(u, "A"); return [a, s1, s2, b, o, u.a2, tahMa(u, "A"), tahOznac(u, "A")]; })()`),
    [true, true, false, false, true, 1, true, false],
  );
  assert.deepEqual(
    C.V(`(() => { const u = tahObnov({}, "1:1"); tahOznac(u, "A"); return [tahSprint(u, "AH"), tahMa(u, "AH"), u.d, tahSprint(u, "AH")]; })()`),
    [true, true, 1, false],
  );
});

test("jednou za tah: zápis bez zdvojení, staré uložené tvary se obnoví", () => {
  assert.deepEqual(C.V(`tahJednouZapis(tahObnov({}, "1:1"), ["sa", "sa", "ds"]).jt`), ["sa", "ds"]);
  /* BJU.ridT z dřívější verze ({tk, u}) se při prvním použití vynuluje do nového tvaru */
  assert.deepEqual(C.V(`tahObnov({tk: 101, u: ["sa"]}, "1:1").jt`), []);
});

test("jeden slot kouzla za tah (D&D 2024): zápis platí jen v tomto tahu", () => {
  assert.deepEqual(
    C.V(`(() => { const u = {}; tahObnov(u, "2:1"); const a = tahSlotPouzit(u); tahSlotZapis(u); const b = tahSlotPouzit(u);
      tahObnov(u, "2:2"); return [a, b, tahSlotPouzit(u)]; })()`),
    [false, true, false],
  );
});

test("účet tahu pro vypravěče: do boje jen nenulová pole, souhrn jen pro běžící tah", () => {
  const D = C.V(`(() => { const u = {}; tahObnov(u, "3:4"); tahOznac(u, "A"); tahPohni(u, 15, 30); tahSlotZapis(u); return tahDB(u); })()`);
  assert.deepEqual(D, {k: "3:4", a: 1, m: 15, sl: 1});
  const S = C.V(`tahSouhrn(${JSON.stringify(D)}, "3:4", 30)`);
  assert.deepEqual(
    S.L.map(x => [x[0], x[2]]),
    [
      ["A", true],
      ["BA", false],
      ["S", true],
    ],
  );
  assert.equal(S.pohyb, "15/30");
  assert.equal(C.V(`tahSouhrn(${JSON.stringify(D)}, "3:5", 30)`), null, "jiný tah – nic");
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

test("stránka: Sprint, Action Surge a akce z Haste podle karty; pás tahu ukáže zbývající pohyb (2026-10-25)", () => {
  const r = S.ev(`(() => {
    const K = {id: "t_bojovnik", n: "Zkouška", povolani: "Fighter 5", uroven: 5, rychlost: "30 ft.", vl: {STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 10}};
    const R = {id: "t_lupic", n: "Lupič", povolani: "Rogue 3", uroven: 3, rychlost: "30 ft.", vl: {STR: 10, DEX: 16, CON: 12, INT: 10, WIS: 10, CHA: 10}};
    try {
      const P = tahObnov({}, "1:1");
      const a = bojTahMoz(K, P);
      KST[K.id] = {uc: [{n: "Haste", kon: true}]};
      const b = bojTahMoz(K, P);
      tahPohni(P, 10, kRychN(K));
      const h = bdmTahPas(K, P);
      const c = bojTahMoz(R, tahObnov({}, "1:1"));
      return JSON.stringify([a.sp.map(x => x[0]), !!a.as, a.ha, b.sp.map(x => x[0]), b.ha, kRychN(K), /<b>50<\\/b><i>\\/60/.test(h), /data-btas/.test(h), /data-btp="ah"/.test(h), c.sp.map(x => x[0])]);
    } finally { delete KST[K.id]; }
  })()`);
  assert.deepEqual(JSON.parse(r), [["A"], true, false, ["A", "AH"], true, 60, true, true, true, ["A", "BA"]]);
});

test("stránka: Battle Master v pásu tahu – Evasive Footwork s kostkou převahy, Know Your Enemy za bonusovou akci (2026-10-25)", async () => {
  const r = await S.ev(`(async () => {
    const K = {id: "t_bm", n: "Mistr", povolani: "Fighter 7", uroven: 7, rychlost: "30 ft.", vl: {STR: 16, DEX: 12, CON: 14, INT: 10, WIS: 10, CHA: 10},
      rysy: ["Combat Superiority", "Evasive Footwork", "Know Your Enemy", "Trip Attack"], vybaveni: []};
    KARTY.push(K); KARTBY[K.id] = K;
    try {
      const P = tahObnov({}, "1:1");
      const sd = kSD(K), h1 = bdmManTahHtml(K, P), ac0 = kAC(K);
      tahOznac(P, "BA");
      const h2 = bdmManTahHtml(K, P);
      await kartaStavZmen(K.id, {uc: [{n: "Evasive Footwork", ac: 5}]});
      const ac = kAC(K) - ac0 === 5;
      await bojEvasiveKonec(K);
      return JSON.stringify([!!sd, /data-btef/.test(h1), /data-btkye/.test(h1), /data-btkye/.test(h2), ac, kUc(K).length]);
    } finally { KARTY.pop(); delete KARTBY[K.id]; delete KST[K.id]; }
  })()`);
  assert.deepEqual(JSON.parse(r), [true, true, true, false, true, 0]);
});

test("stránka: pohyb po políčkách (5 stop) – 30 stop = 6 políček, Sprint přidá další, klepnutí na poslední ušlé ho vrátí", () => {
  const r = S.ev(`(() => {
    const K = {id: "t_pol", n: "Zkouška", povolani: "Fighter 1", uroven: 1, rychlost: "30 ft.", vl: {STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10}};
    const P = tahObnov({}, "1:1"), pocet = h => (h.match(/class="bdmpol[ "]/g) || []).length;
    tahPohni(P, 10, kRychN(K));
    const h1 = bdmTahPas(K, P);
    tahSprint(P, "A", kRychN(K));
    const h2 = bdmTahPas(K, P);
    const n = kRychN(K) / 5;
    return JSON.stringify([pocet(h1) === n, (h1.match(/bdmpol on/g) || []).length, /data-btpq="1"[^>]*aria-label="10 stop/.test(h1), pocet(h2) === 2 * n, (h2.match(/bdmpol sp/g) || []).length === n]);
  })()`);
  assert.deepEqual(JSON.parse(r), [true, 2, true, true, true]);
});

test("stránka: vypravěč vidí u postavy účet tahu z boje (A ✓, pohyb 15/30, slot), jen pro běžící tah", () => {
  const h =
    S.ev(`(() => { const s = {aktivni: true, kolo: 2, tah: 3, hraci: [{id: "h1", n: "Balduin"}], npc: [], tahy: {h1: {k: "2:3", a: 1, m: 15, sl: 1}}};
    return [bojTahGmHtml(s, s.hraci[0], null), bojTahGmHtml(Object.assign({}, s, {tah: 4}), s.hraci[0], null)]; })()`);
  assert.match(h[0], /<b class="on"[^>]*>A<\/b>/);
  assert.match(h[0], /<b class=""[^>]*>BA<\/b>/);
  assert.match(h[0], />S<\/b>/);
  assert.equal(h[1], "", "jiný tah – nic");
});
