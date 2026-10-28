// Herní záznam: vypravěč opraví řádek (2026-10-28, Vojta) – cíl, hod, výsledek, zranění a typ zranění; hráči uvidí opravený
// veřejný řádek, životy cíle se srovnají o rozdíl zranění (při změně cíle se vrátí starému a dají novému).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

/* dva nepřátelé ze statbloků (sok s životy) a jeden zapsaný útok hráče: BLOGG vypravěče + veřejný řádek */
const PRIPRAV = `(() => {
  const b = Object.keys(PROTBY).find(k => PROTBY[k].u === "sok" && (PROTBY[k].hp || []).length);
  window.__B0 = JSON.stringify(BOJ.s || null);
  window.__HP0 = JSON.stringify(bojHp.get() || {});
  BLOGG.splice(0);
  const t = Date.now() - 5000;
  BOJ.s = {aktivni: true, kolo: 2, tah: 1, hraci: [{id: "h1", n: "Balduin", k: "balduin"}],
    npc: [{id: "n1", n: "Rotmistr", b, druh: "sok"}, {id: "n2", n: "Žoldnéř", b, druh: "sok"}],
    zaz: [{a: "Balduin", ai: "h1", c: "Rotmistr", ci: "n1", cim: "Longsword", v: "zásah", z: 9, t: "Slashing", ts: t + 3, k: 2}]};
  const mx = bojEff(BOJ.s.npc[0]).hp[0].max;
  bojHp.set({n1: [mx - 9]});
  BLOGG.unshift({id: "n1", kdo: "Rotmistr", o: {n: "Longsword", ai: "h1", an: "Balduin", ci: "n1", res: "zasah", zr: {t: 9, x: "z 9", zt: "Slashing"},
    uh: {hod: 17, d: 12, cim: "Longsword"}, t, k: 2}});
  return mx;
})()`;
const KONEC = `(() => { BOJ.s = JSON.parse(window.__B0); bojHp.set(JSON.parse(window.__HP0)); BLOGG.splice(0); })()`;
/* řádek záznamu vypravěče: vykreslí se (BZMAP), vrátí klíč a řádek */
const RADEK = `(() => { const L = bzZaznam(BOJ.s, true), e = L.find(x => x.src === "g" && x.co === "Longsword"); bzRadek(e, true); return {kl: bzKlic(e), C: e.C && e.C.n, vys: e.vys, zr: e.zr, hod: bzUprHod0(e)}; })()`;

test("úprava řádku: menší zranění a jiný typ – řádek, veřejný řádek pro hráče i životy cíle", () => {
  const mx = V(PRIPRAV);
  try {
    const r = V(RADEK);
    assert.equal(r.C, "Rotmistr");
    assert.equal(r.hod, 17);
    assert.deepEqual(r.zr, {t: 9, zt: "Slashing"});
    const u = V(`bzUprUloz(${JSON.stringify(r.kl)}, {ci: "n1", hod: "17", vys: "zasah", zr: "5", zt: "Fire", pozn: "špatná zbraň", hp: "1"})`);
    assert.deepEqual(u.U, {zr: 5, zt: "Fire", pozn: "špatná zbraň"});
    assert.equal(V(`bojHp.get().n1[0]`), mx - 5, "vráceny 4 HP");
    const e = V(`bzZaznam(BOJ.s, true).find(x => x.src === "g" && x.co === "Longsword")`);
    assert.deepEqual(e.zr, {t: 5, zt: "Fire", lec: false});
    assert.ok(e.pozn.includes("upraveno vypravěčem: špatná zbraň"));
    /* veřejný řádek (bojZmen bez databáze nic nezapíše – zápis se ověří přímo) */
    S.ev(
      `bzUprZapis(BOJ.s, {src: "g", t: BLOGG.find(x => x.o.n === "Longsword").o.t, aid: "h1", an: "Balduin", cid: "n1", cn: "Rotmistr"}, ${JSON.stringify(u.U)})`,
    );
    assert.deepEqual(V(`BOJ.s.zaz[0].upr`), u.U);
    const h = V(`bzZaznam(BOJ.s, false).find(x => x.src === "z")`);
    assert.equal(h.zr.t, 5, "hráč vidí opravené zranění");
    assert.equal(h.zr.zt, "Fire");
  } finally {
    S.ev(KONEC);
  }
});

test("úprava řádku: jiný cíl a vedle místo zásahu – starému cíli se zranění vrátí, nový nic", () => {
  const mx = V(PRIPRAV);
  try {
    const r = V(RADEK);
    const u = V(`bzUprUloz(${JSON.stringify(r.kl)}, {ci: "n2", hod: "11", vys: "vedle", zr: "9", zt: "Slashing", hp: "1"})`);
    assert.deepEqual(u.U, {ci: "n2", c: "Žoldnéř", hod: 11, vys: "vedle"});
    assert.equal(V(`bojHp.get().n1[0]`), mx, "Rotmistrovi vráceno 9 HP");
    assert.equal(V(`(bojHp.get().n2 || [])[0] ?? null`), null, "Žoldnéř bez zranění");
    const e = V(`bzZaznam(BOJ.s, true).find(x => x.src === "g" && x.co === "Longsword")`);
    assert.equal(e.C.n, "Žoldnéř");
    assert.deepEqual(e.vys, ["vedle", "bzmis"]);
    assert.match(e.rows.find(q => q.l === "útok").h, /<b class="bztot">11<\/b>/);
    /* bez zaškrtnutí životů se nic nemění; vlastní výsledek textem */
    const r2 = V(RADEK);
    V(`bzUprUloz(${JSON.stringify(r2.kl)}, {ci: "n2", hod: "11", vys: "jine", vyst: "škrábnutí", zr: "2", zt: "Slashing"})`);
    assert.equal(V(`bojHp.get().n1[0]`), mx);
    const e2 = V(`bzZaznam(BOJ.s, true).find(x => x.src === "g" && x.co === "Longsword")`);
    assert.deepEqual(e2.vys, ["škrábnutí", ""]);
    assert.equal(e2.zr.t, 2);
  } finally {
    S.ev(KONEC);
  }
});

test("úprava řádku: hod z karty se opraví přes s.hupr, beze změny se nic nezapíše; formulář jen pro vypravěče", () => {
  V(PRIPRAV);
  try {
    const r = V(RADEK);
    assert.deepEqual(V(`bzUprUloz(${JSON.stringify(r.kl)}, {ci: "n1", hod: "17", vys: "zasah", zr: "9", zt: "Slashing", hp: "1"})`), {nic: 1});
    const f = S.ev(`bzUprHtml(${JSON.stringify(r.kl)}, BZMAP.get(${JSON.stringify(r.kl)}).e, BOJ.s)`);
    assert.match(f, /<option value="n1" selected>Rotmistr<\/option>/);
    assert.match(f, /name="hod"[^>]*value="17"/);
    assert.match(f, /name="hp" value="1" checked/);
    assert.match(S.ev(`bzDetailHtml(BZMAP.get(${JSON.stringify(r.kl)}).e, true, ${JSON.stringify(r.kl)})`), /data-bzupr=/);
    assert.doesNotMatch(
      S.ev(`bzDetailHtml(BZMAP.get(${JSON.stringify(r.kl)}).e, false, ${JSON.stringify(r.kl)})`),
      /data-bzupr=/,
      "hráč tlačítko nemá",
    );
    S.ev(`bzUprZapis(BOJ.s, {src: "h", hid: 42}, {hod: 15, vys: "zasah"})`);
    assert.deepEqual(V(`BOJ.s.hupr`), {42: {hod: 15, vys: "zasah"}});
    const e = V(`bzUprAplikuj({rows: [{l: "hod", h: "d20 9 +3 = 12"}], pozn: [], vys: ["12", "bztotv"]}, {hod: 15}, BOJ.s, false)`);
    assert.deepEqual(e.vys, ["15", "bztotv"]);
  } finally {
    S.ev(KONEC);
  }
});
