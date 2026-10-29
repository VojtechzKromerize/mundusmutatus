// Hledání v pravidlech (2026-10-29): čisté porovnávání (10g) a rejstřík celé stránky (10h) – šuplík Pravidla na Hře a list Pravidla na kartě.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();

test("hledání: bez diakritiky, oddíly kapitoly SRD po nadpisech h3/h4, název má přednost před textem", () => {
  assert.equal(C.ev(`hlNorm("Sražen (Prone) – Útok")`), "srazen prone utok");
  const o = C.V(`hlOddily('<p>úvod</p><h3 id="a">Boj</h3><p>x</p><h4 id="b">Útok</h4><p>y</p><h3 id="c">Konec</h3><p>z</p>')`);
  assert.deepEqual(
    o.map(x => [x.id, x.l, x.p]),
    [
      ["a", 3, ""],
      ["b", 4, "Boj"],
      ["c", 3, ""],
    ],
  );
  assert.match(o[0].html, /Útok/, "h3 obsahuje i své h4");
  assert.doesNotMatch(o[1].html, /Konec/);
  const R = C.V(`hlHledej([
    hlZaznam({g: "Pravidla SRD", n: "Boj", txt: "kdo je sražen, má nevýhodu"}),
    hlZaznam({g: "Stav", n: "Sražen", en: "Prone", txt: "leží na zemi"}),
    hlZaznam({g: "Kouzlo", n: "Ohnivá koule", en: "Fireball", txt: "výbuch"}),
  ], "srazen").map(e => e.n)`);
  assert.deepEqual(R, ["Sražen", "Boj"]);
  assert.deepEqual(C.V(`hlHledej([hlZaznam({g: "Kouzlo", n: "Ohnivá koule", en: "Fireball"})], "fireball").map(e => e.n)`), ["Ohnivá koule"]);
  assert.deepEqual(C.V(`hlHledej([hlZaznam({g: "Stav", n: "X"})], "x")`), [], "dotaz kratší než 2 znaky nic nehledá");
});

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());

test("rejstřík stránky: stav, Artikule, pravidla SRD, kouzlo, předmět a vybavení; výsledek i detail v poli hledání", async () => {
  await S.ev("hlIndex()");
  const g = q => JSON.parse(S.ev(`JSON.stringify(hlHledej(HLI, ${JSON.stringify(q)}).slice(0, 3).map(e => [e.g, e.n]))`));
  assert.deepEqual(g("sražen")[0], ["Stav", "Sražen"]);
  assert.deepEqual(g("grappled")[0], ["Stav", "Chycen"]);
  assert.equal(g("fireball")[0][0], "Kouzlo");
  assert.ok(g("bag of holding").some(([k]) => k === "Magický předmět"));
  assert.ok(g("longsword").some(([k]) => k === "Vybavení"));
  assert.ok(g("příležitostný útok").some(([k]) => k === "Pravidla SRD"));
  assert.ok(JSON.parse(S.ev(`JSON.stringify([...new Set(HLI.map(e => e.g))])`)).includes("Artikule"));
  const h = S.ev(`(() => { HLS.q = "sražen"; HLS.d = -1; return hlBoxHtml("t"); })()`);
  assert.match(h, /class="hlbox t hlon"/);
  assert.match(h, /data-hli="\d+"/);
  const d = S.ev(`(() => { HLS.d = hlHledej(HLI, "sražen")[0] && HLI.indexOf(hlHledej(HLI, "sražen")[0]); return hlBoxHtml("t"); })()`);
  assert.match(d, /data-hlzpet/);
  assert.match(d, /Prone/);
  S.ev(`HLS.q = ""; HLS.d = -1; 0`);
});
