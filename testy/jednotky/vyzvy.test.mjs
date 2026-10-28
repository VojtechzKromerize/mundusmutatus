// Výzvy k hodu (2026-10-26, Vojta: „hráčům se zobrazují upozornění na věci, co již odklikli“): výzva, na kterou hráč už
// zareagoval jinak než odpovědí (iniciativa zapsaná do slotu, zavřená ×, boj začal), nebo zapomenutá stará výzva se neukáže
// a vypravěč ji uzavře sám; co hráč viděl, si pamatuje prohlížeč.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
  await S.ev(`typeof vyzvaVyrizena === "function" || mmLina("hra")`);
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));
const ted = () => new Date().toISOString();

test("stará výzva (vypravěč ji neuzavřel) i výzva zavřená na telefonu se hráči neukáže", () => {
  const stara = new Date(Date.now() - 4 * 3600e3).toISOString();
  S.ev(`localStorage.removeItem("mm-vyz-skryte")`);
  assert.equal(V(`vyzvaVyrizena({id: 1, cas: "${stara}", data: {typ: "zach"}}, null)`), true);
  assert.equal(V(`vyzvaVyrizena({id: 2, cas: "${ted()}", data: {typ: "zach"}}, null)`), false);
  S.ev(`vyzSkryte.set([2])`);
  assert.equal(V(`vyzvaVyrizena({id: 2, cas: "${ted()}", data: {typ: "zach"}}, null)`), true);
  S.ev(`localStorage.removeItem("mm-vyz-skryte")`);
});

test("iniciativa: platí jen v přípravě boje a jen dokud ji hráč nezapsal do slotu sám", () => {
  const K = V(`KARTY.length ? KARTY[0].id : null`);
  if (!K) return;
  const v = `{id: 3, cas: "${ted()}", data: {typ: "ini"}}`;
  S.ev(`BOJ.s = {priprava: true, aktivni: false, hraci: [{id: "h1", k: ${JSON.stringify(K)}, n: KARTY[0].n, hod: null}]}`);
  assert.equal(V(`vyzvaVyrizena(${v}, KARTY[0])`), false, "příprava, ještě nehodil");
  S.ev(`BOJ.s.hraci[0].hod = 14`);
  assert.equal(V(`vyzvaVyrizena(${v}, KARTY[0])`), true, "zapsal do slotu");
  S.ev(`BOJ.s.hraci[0].hod = null; delete BOJ.s.priprava; BOJ.s.aktivni = true`);
  assert.equal(V(`vyzvaVyrizena(${v}, KARTY[0])`), true, "boj už běží");
  S.ev(`BOJ.s = null`);
});

test("vypravěč zapomenuté výzvy uzavře sám (stará, iniciativa po přípravě), čerstvé nechá", () => {
  const stara = new Date(Date.now() - 5 * 3600e3).toISOString();
  const zav = V(`(() => {
    const z = [], puv = MMDB && MMDB.vyzvaZavri;
    window.MMDB = window.MMDB || {};
    MMDB.vyzvaZavri = id => (z.push(id), Promise.resolve());
    BOJ.s = {scena: true, aktivni: true};
    VYZVY = [{id: 11, cas: "${stara}", data: {typ: "zach"}}, {id: 12, cas: "${ted()}", data: {typ: "ini"}}, {id: 13, cas: "${ted()}", data: {typ: "over"}}, {id: 14, cas: "${stara}", zavrena: true, data: {}}];
    vyzvyUklid();
    vyzvyUklid();
    if (puv) MMDB.vyzvaZavri = puv;
    BOJ.s = null;
    VYZVY = [];
    return z;
  })()`);
  assert.deepEqual(zav, [11, 12]);
});
