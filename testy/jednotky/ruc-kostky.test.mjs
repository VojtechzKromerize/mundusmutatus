// Ruční kostky (2026-10-29, Vojta): režim „Házím vlastními kostkami“ – zadané číslo místo hodu, prázdné pole hodí web,
// špatná hodnota okno nezavře, zrušení nic nehodí a nespotřebovaná fronta se po obsluze zruší.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof kartaHod === "function" || mmLina("hra")`);
  /* jsdom nezná showModal */
  S.w.eval(
    `if (!HTMLDialogElement.prototype.showModal) { HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); }; HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); }; }`,
  );
  S.ev(`window.__hod = KDB.hod; KDB.hod = () => Promise.resolve(1)`);
});
after(() => {
  if (S) {
    S.ev(`KDB.hod = window.__hod; localStorage.removeItem("mm-ruc")`);
    S.zavri();
  }
});
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));
const dlg = () => S.w.document.querySelector("dialog.mmruc");
const pole = () => [...dlg().querySelectorAll("input")];
const odesli = () =>
  dlg()
    .querySelector("form")
    .dispatchEvent(new S.w.Event("submit", {cancelable: true, bubbles: true}));
const flush = () => new Promise(r => setTimeout(r, 5));

test("bK bere zadané kostky z fronty, prázdné (null) hodí web a fronta se vyprázdní", () => {
  S.ev(`MMRUC.q = {20: [14, null], 6: [3]}`);
  assert.equal(V(`bK(20)`), 14);
  const d = V(`bK(20)`);
  assert.ok(d >= 1 && d <= 20, "prázdné pole hodí web");
  assert.equal(V(`bK(6)`), 3);
  const e = V(`bK(6)`);
  assert.ok(e >= 1 && e <= 6, "po vyčerpání fronty hází web");
  S.ev(`MMRUC.q = null`);
});

test("vypnutý režim: kartaHod nehází okno", async () => {
  S.ev(`localStorage.removeItem("mm-ruc")`);
  const r = await S.ev(`kartaHod(KARTBY.balduin, "Percepce", 3)`);
  assert.equal(dlg(), null);
  assert.ok(r && r.d >= 1 && r.d <= 20);
});

test("zapnutý režim: okno vezme d20 a d6 Závoje, špatná hodnota okno nezavře", async () => {
  S.ev(`localStorage.setItem("mm-ruc", "1"); KADV = 0`);
  S.w.eval(`window.__p = kartaHod(KARTBY.balduin, "Percepce", 3)`);
  await flush();
  assert.ok(dlg(), "okno je otevřené");
  const p = pole();
  assert.deepEqual(
    p.map(x => x.dataset.mmrucs),
    ["20", "6"],
  );
  p[0].value = "25";
  odesli();
  assert.ok(dlg(), "špatná hodnota okno nezavřela");
  assert.ok(!dlg().querySelector(".mmruce").hidden);
  p[0].value = "17";
  p[1].value = "4";
  odesli();
  const r = await S.ev(`window.__p`);
  assert.equal(dlg(), null);
  assert.equal(r.d, 17);
  assert.equal(r.tot, 17 + V(`3`));
  assert.equal(V(`KPOSL.balduin.d1`), 17);
  assert.equal(V(`KZAV.balduin.d`), 4);
});

test("záchrana nemá kostku Závoje, výhoda ukáže dvě d20; zrušení nic nehodí", async () => {
  S.ev(`KADV = 1`);
  const pred = V(`KPOSL.balduin.cas`);
  S.w.eval(`window.__p = kartaHod(KARTBY.balduin, "Záchrana STR", 1)`);
  await flush();
  assert.deepEqual(
    pole().map(x => x.dataset.mmrucs),
    ["20", "20"],
  );
  dlg().querySelector("[data-mmrucz]").click();
  const r = await S.ev(`window.__p`);
  assert.equal(r, undefined);
  assert.equal(V(`KPOSL.balduin.cas`), pred, "zrušený hod se nezapsal");
  S.ev(`KADV = 0`);
});

test("výhoda: jen druhá kostka zadaná, první hodí web", async () => {
  S.ev(`KADV = 1`);
  S.w.eval(`window.__p = kartaHod(KARTBY.balduin, "Záchrana STR", 1)`);
  await flush();
  const p = pole();
  p[1].value = "20";
  odesli();
  const r = await S.ev(`window.__p`);
  assert.equal(r.d, 20, "vyšší z (web, 20) je 20");
  assert.equal(V(`KPOSL.balduin.d2`), 20);
  S.ev(`KADV = 0`);
});
