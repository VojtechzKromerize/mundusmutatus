// Herní čas jako motor (2026-10-27, Vojta): světla z inventáře hoří v herním čase, účinky vyprší po posunu času samy,
// vypravěč dá dlouhý odpočinek celé družině jedním klepnutím.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof kSvetloZapal === "function" || mmLina("hra")`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("světla: pochodeň a svíčka hodinu, lucerny šest hodin na olej", () => {
  assert.deepEqual(
    V(`["Torch", "Pochodeň", "Candle", "Lantern, Hooded", "Lantern, Bullseye", "Lamp", "Rope"].map(n => (svetloDruh(n) || {}).n || null)`),
    ["Pochodeň", "Pochodeň", "Svíčka", "Lucerna", "Lucerna s clonou", "Lampa", null],
  );
  assert.deepEqual(V(`[svetloDruh("Torch").h, svetloDruh("Lantern").h, !!svetloDruh("Lantern").palivo]`), [1, 6, true]);
});

test("zapálená pochodeň se spotřebuje a po posunu herního času o 2 hodiny dohoří sama", async () => {
  const puv = V(`[HRA, kartaStav("balduin").inv || null, kartaStav("balduin").uc || null]`);
  try {
    S.ev(`HRA = Object.assign({}, HRA || {}, {datum: "1458-03-10", hodina: 20}); __D.HRA = HRA`);
    await S.ev(`kartaStavZmen("balduin", {inv: [{n: "Torch", q: 2}, {n: "Lantern, Hooded"}], uc: null})`);
    await S.ev(`kSvetloZapal(KARTBY.balduin, 0)`);
    assert.equal(V(`kartaStav("balduin").inv[0].q`), 1, "pochodeň ubyla");
    assert.deepEqual(V(`kUc(KARTBY.balduin).map(u => [u.n, u.h])`), [["Světlo: Pochodeň", 1]]);
    await S.ev(`kSvetloZapal(KARTBY.balduin, 1)`);
    assert.deepEqual(V(`kUc(KARTBY.balduin).map(u => u.n)`), ["Světlo: Pochodeň"], "lucerna bez oleje nezačne hořet");
    S.ev(`HRA = Object.assign({}, HRA, {hodina: 22}); __D.HRA = HRA; hraPo()`);
    await new Promise(r => setTimeout(r, 20));
    assert.deepEqual(V(`kUc(KARTBY.balduin)`), [], "po dvou hodinách pochodeň dohořela");
  } finally {
    S.ev(`HRA = ${JSON.stringify(puv[0])}; __D.HRA = HRA`);
    await S.ev(`kartaStavZmen("balduin", {inv: ${JSON.stringify(puv[1])}, uc: ${JSON.stringify(puv[2])}})`);
  }
});

test("dlouhý odpočinek všem: životy zpět a herní čas o 8 hodin dál", async () => {
  const puv = V(`[HRA, kartaStav("balduin").hp ?? null]`);
  try {
    S.ev(`HRA = Object.assign({}, HRA || {}, {datum: "1458-03-10", hodina: 20}); __D.HRA = HRA; window.confirm = () => true`);
    await S.ev(`kartaStavZmen("balduin", {hp: 5})`);
    await S.ev(`hraOdpocinekDruziny()`);
    assert.equal(V(`kartaStav("balduin").hp ?? null`), null, "životy obnoveny (plné)");
    assert.deepEqual(V(`[HRA.datum, HRA.hodina]`), ["1458-03-11", 4]);
  } finally {
    S.ev(`HRA = ${JSON.stringify(puv[0])}; __D.HRA = HRA`);
    await S.ev(`kartaStavZmen("balduin", {hp: ${JSON.stringify(puv[1])}})`);
  }
});

test("nemoc v herním čase: denní záchrany, neúspěch přidá vyčerpání, tři úspěchy vyléčí; jed s otrávením vyprchá (2026-10-31)", async () => {
  const puv = V(`[HRA, kartaStav("balduin").ned || null, kartaStav("balduin").vycerp || null, kartaStav("balduin").stavy || null]`);
  try {
    S.ev(`HRA = Object.assign({}, HRA || {}, {datum: "1458-03-10", hodina: 8}); __D.HRA = HRA`);
    await S.ev(`kartaStavZmen("balduin", {ned: null, vycerp: null, stavy: null})`);
    await S.ev(`kNedPridej(KARTBY.balduin, 0, 11)`);
    await S.ev(`kNedPridej(KARTBY.balduin, 4, 11)`);
    assert.deepEqual(V(`kartaStav("balduin").stavy`), ["otráven"]);
    assert.match(V(`kNedHtml(KARTBY.balduin)`), /Bahenní zimnice[\s\S]*SO 11 každých 24 h/);
    /* tři dny: neúspěch (1), úspěch (20), úspěch (20); jed za 8 h vyprchá po neúspěších */
    S.kostky(
      [...Array(8)]
        .map(() => [1, 20])
        .concat([
          [1, 20],
          [20, 20],
          [20, 20],
        ]),
    );
    S.ev(`HRA = Object.assign({}, HRA, {datum: "1458-03-13", hodina: 8}); __D.HRA = HRA`);
    await S.ev(`kNedMotor(KARTBY.balduin)`);
    const st = V(`kartaStav("balduin")`);
    assert.ok(!(st.ned || []).some(e => e.typ === "jed"), "jed vyprchal");
    assert.ok(!(st.stavy || []).includes("otráven"), "otrávení skončilo");
    const z = (st.ned || []).find(e => e.n === "Bahenní zimnice");
    assert.ok(z, "zimnice trvá (2 ze 3 úspěchů)");
    assert.equal(z.ok + z.nok, 3);
    assert.ok(st.vycerp >= 1, "neúspěch nemoci přidal vyčerpání");
  } finally {
    S.ev(`HRA = ${JSON.stringify(puv[0])}; __D.HRA = HRA`);
    await S.ev(`kartaStavZmen("balduin", {ned: ${JSON.stringify(puv[1])}, vycerp: ${JSON.stringify(puv[2])}, stavy: ${JSON.stringify(puv[3])}})`);
  }
});
