// Vlastní předmět z Dílny vypravěče na kartě (def u věci ve vybavení): útok, perky, mistrovství, zranění navíc, AC, účinky.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
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
const sVybavenim = (inv, f) => {
  const K0 = S.ev(`JSON.stringify(KST.balduin || null)`);
  S.ev(`KST.balduin = Object.assign({}, KST.balduin || {}, {inv: ${JSON.stringify(inv)}})`);
  try {
    return f();
  } finally {
    S.ev(`KST.balduin = ${K0} || undefined`);
  }
};
const MEC = {
  n: "Rožmberský meč",
  q: 1,
  def: {
    d: "zbr",
    z: "longsword",
    zn: "Longsword",
    k: "1d8",
    t: "Slashing",
    vl: ["Versatile (1d10)", "Finesse"],
    ma: "Vex",
    s: "M",
    pk: ["Odvetná", "Krvežíznivá"],
    zr: [{k: "1d6", t: "Fire"}],
    b: 2,
  },
};

test("vlastní zbraň: útok podle def – kostka, magický bonus, Finesse, perky, zranění navíc", () => {
  sVybavenim([MEC], () => {
    const a = V(`kUtoky(KARTBY.balduin).find(a => a.n === "Rožmberský meč")`);
    assert.ok(a, "útok z vybavení se jménem věci");
    /* stejná čísla jako obyčejný dlouhý meč +2 (Balduin útočí přes CHA – Hex Warrior) */
    const L = sVybavenim([{n: "Longsword +2", q: 1}], () => V(`kUtoky(KARTBY.balduin).find(a => a.n === "Longsword +2")`));
    assert.equal(a.z, L.z, "zranění = kostka + modifikátor + bonus");
    assert.equal(a.b, L.b, "útok = modifikátor + zdatnost + bonus");
    assert.deepEqual(a.vl, ["Versatile (1d10)", "Finesse"]);
    assert.match(a.rozpis, /magie \+2/);
    assert.match(a.rozpis, /\+1d6 Fire při zásahu/);
    assert.deepEqual(V(`bdmZvl({n: "Rožmberský meč"}, KARTBY.balduin)`), ["Odvetná", "Krvežíznivá"], "perky z def, ne podle jména");
    const e = V(`kEfAkt(KARTBY.balduin, [], {n: "Rožmberský meč"}).filter(e => /Rožmberský/.test(e.n)).map(e => [e.zr, e.t])`);
    assert.deepEqual(e, [["1d6", "Fire"]], "zranění navíc se k útoku touto zbraní přidá samo");
    assert.deepEqual(V(`kEfAkt(KARTBY.balduin, [], {n: "Dagger"}).filter(e => /Rožmberský/.test(e.n))`), [], "jiná zbraň ho nemá");
  });
});

test("vlastní zbraň v boji: mistrovství z def, magický bonus se do SO nepočítá", () => {
  sVybavenim([MEC], () => {
    const a = V(`kUtoky(KARTBY.balduin).find(a => a.n === "Rožmberský meč")`),
      T = V(`bojWTr(KARTBY.balduin, {n: "Rožmberský meč", b: ${a.b}})`),
      pb = V(`kPB(KARTBY.balduin)`);
    assert.equal(T.ma0, "Vex", "mistrovství z def, ne Sap dlouhého meče");
    assert.equal(T.druh, "Longsword");
    assert.ok(T.vl.Finesse && T.vl.Versatile);
    assert.ok([a.b - 2, a.b - 2 - pb].includes(T.mod), "modifikátor bez magického bonusu");
  });
});

test("vlastní zbroj a štít: AC z def s bonusem, druh zbroje podle Artikulí", () => {
  const ac0 = V(`kAC(KARTBY.balduin)`);
  sVybavenim(
    [
      {n: "Kyrys mistra Hanuše", q: 1, obl: true, def: {d: "zbroj", zn: "Breastplate", ac: 14, max: 2, dr: "Plátová", b: 1}},
      {n: "Pavéza sv. Jiří", q: 1, obl: true, def: {d: "stit", ac: 2, b: 1}},
    ],
    () => {
      const N = V(`kNoseno(kCtx(KARTBY.balduin).inv)`);
      assert.equal(N.z.n, "Kyrys mistra Hanuše");
      assert.equal(N.z.ac, 15);
      assert.equal(N.z.dr, "Plátová");
      assert.equal(N.s.ac, 3);
      const dx = V(`kCtx(KARTBY.balduin).md("DEX")`);
      assert.ok(V(`kAC(KARTBY.balduin)`) >= 15 + Math.min(dx, 2) + 3, `AC z vlastní zbroje (dřív ${ac0})`);
    },
  );
});

test("vlastní divotvorný předmět: účinky z def, s připoutáním jen připoutaný", () => {
  const ef = inv => sVybavenim(inv, () => V(`kCtx(KARTBY.balduin).E.filter(e => e.n === "Plášť z Karlštejna").map(e => [e.c, e.v])`));
  const P = {
    n: "Plášť z Karlštejna",
    q: 1,
    def: {
      d: "vec",
      ef: [
        {c: "zach", v: 1},
        {c: "vl:CON", v: 19},
      ],
      pr: 1,
    },
  };
  assert.deepEqual(ef([P]), [], "nepřipoutaný nepůsobí");
  assert.deepEqual(ef([Object.assign({pripoutano: true}, P)]), [
    ["zach", 1],
    ["vl:CON", 19],
  ]);
  sVybavenim([Object.assign({pripoutano: true}, P)], () => {
    assert.ok(V(`kCtx(KARTBY.balduin).vl.CON`) >= 19, "nastavená vlastnost");
    assert.equal(V(`kUtoky(KARTBY.balduin).some(a => a.n === "Plášť z Karlštejna")`), false, "není útok");
  });
});

test("Dílna: Upravit vlastnosti u Longsword +1 převezme základ, bonus a perky; uložení zapíše def", async () => {
  const pred = V(`kartaStav("balduin").inv || KARTBY.balduin.vybaveni || []`);
  try {
    await S.ev(`vybNacti()`);
    await S.ev(`kartaStavZmen("balduin", {inv: [{n: "Longsword +1", q: 1, w: "3 lb."}]}, null)`);
    const D = V(`kDilZVeci(KARTBY.balduin, kInv(KARTBY.balduin)[0])`);
    assert.equal(D.def.d, "zbr");
    assert.equal(D.def.zn, "Longsword");
    assert.equal(D.def.b, 1);
    assert.equal(D.def.ma, "Sap");
    assert.deepEqual(D.def.pk, ["Odvetná", "Šikovná", "Ostrá", "Půlmeč"]);
    assert.equal(D.w, 3);
    /* formulář v listu Spravovat inventář (vypravěč): Dílna s rozpracovanou věcí */
    S.ev(`BDM.dil = Object.assign(kDilZVeci(KARTBY.balduin, kInv(KARTBY.balduin)[0]), {i: 0, open: true})`);
    const h = V(`bdmInvList(KARTBY.balduin)[1]`);
    assert.match(h, /data-kdilf/);
    assert.match(h, /Upravit předmět: Longsword \+1/);
    assert.match(h, /<option value="zbr:longsword" selected>/);
    assert.match(h, /name="pk" value="Odvetná" checked/);
    assert.match(h, /name="vl" value="Versatile" checked/);
    /* vypravěč změní jméno, mistrovství, perky a přidá ohnivé zranění */
    S.ev(`(() => {
      const box = document.createElement("div");
      box.className = "bdm";
      box.dataset.kid = "balduin";
      box.innerHTML = kDilForm(KARTBY.balduin);
      document.body.appendChild(box);
      const F = box.querySelector("[data-kdilf]"), E = F.elements;
      E.n.value = "Plamenný meč";
      E.ma.value = "Vex";
      F.querySelectorAll('[name="pk"]').forEach(c => (c.checked = ["Odvetná", "Ostrá"].includes(c.value)));
      E.zrk0.value = "1d6";
      E.zrt0.value = "Fire";
      window.__F = F;
    })()`);
    await S.ev(`kDilUloz(KARTBY.balduin, window.__F)`);
    const x = V(`kInv(KARTBY.balduin)[0]`);
    assert.equal(x.n, "Plamenný meč");
    assert.deepEqual(
      {ma: x.def.ma, pk: x.def.pk, zr: x.def.zr, b: x.def.b, zn: x.def.zn},
      {ma: "Vex", pk: ["Odvetná", "Ostrá"], zr: [{k: "1d6", t: "Fire"}], b: 1, zn: "Longsword"},
    );
    assert.equal(x.w, "3 lb.");
    assert.equal(V(`BDM.dil`), null, "rozpracovaný předmět je pryč");
    assert.ok(V(`kUtoky(KARTBY.balduin).some(a => a.n === "Plamenný meč")`), "útok s novým jménem");
    assert.match(V(`bdmVecList(KARTBY.balduin, 0)[1]`), /Vlastní předmět · základ Longsword/);
    assert.match(V(`bdmVecList(KARTBY.balduin, 0)[1]`), /data-kved="0"/, "vypravěč má Upravit vlastnosti");
  } finally {
    S.ev(`document.querySelectorAll(".bdm[data-kid=balduin]").forEach(e => e.remove()); BDM.dil = null`);
    await S.ev(`kartaStavZmen("balduin", {inv: ${JSON.stringify(pred)}}, null)`);
  }
});

test("Dílna: nový štít bez jména základu, oblékne se a zvedne AC", async () => {
  const pred = V(`kartaStav("balduin").inv || KARTBY.balduin.vybaveni || []`);
  try {
    await S.ev(`vybNacti()`);
    const ac0 = V(`kAC(KARTBY.balduin)`),
      maStit = V(`!!kNoseno(kInv(KARTBY.balduin)).s`);
    S.ev(`BDM.dil = {n: "Pavéza sv. Jiří", q: 1, def: kDilZaklad(VYBBY.shield)}`);
    S.ev(`(() => {
      const box = document.createElement("div");
      box.className = "bdm";
      box.dataset.kid = "balduin";
      box.innerHTML = kDilForm(KARTBY.balduin);
      document.body.appendChild(box);
      const F = box.querySelector("[data-kdilf]");
      F.elements.b.value = "2";
      window.__F = F;
    })()`);
    await S.ev(`kDilUloz(KARTBY.balduin, window.__F)`);
    const x = V(`kInv(KARTBY.balduin).find(y => y.n === "Pavéza sv. Jiří")`);
    assert.deepEqual(x.def, {d: "stit", z: "shield", zn: "Shield", ac: 2, b: 2});
    assert.equal(x.obl, true);
    assert.equal(V(`kNoseno(kInv(KARTBY.balduin)).s.n`), "Pavéza sv. Jiří");
    if (!maStit) assert.equal(V(`kAC(KARTBY.balduin)`), ac0 + 4, "štít +2 a magie +2");
  } finally {
    S.ev(`document.querySelectorAll(".bdm[data-kid=balduin]").forEach(e => e.remove()); BDM.dil = null`);
    await S.ev(`kartaStavZmen("balduin", {inv: ${JSON.stringify(pred)}}, null)`);
  }
});
