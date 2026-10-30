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
  const gl = S.ev(`hlGlobal("chycen")`);
  assert.match(gl, /data-ghl="\d+"/, "hledání v záhlaví dostane pravidla");
  assert.doesNotMatch(gl, /<span class="gk">Artikule</, "Artikule a pojmy má záhlaví ve vlastním rejstříku");
  S.ev(`HLS.q = ""; HLS.d = -1; 0`);
});

test("klepnutí na pojem: stav, vlastnost a mistrovství zbraně, akce – okno s pravidlem", async () => {
  await S.ev("hlIndex()");
  const n = (q, g) => S.ev(`(x => x && x.n)(hlNajdi(${JSON.stringify(q)}, ${JSON.stringify(g)}))`);
  assert.equal(n("Finesse", "Pravidla SRD"), "Lehkoruká");
  assert.equal(n("Topple", "Pravidla SRD"), "Sražení");
  assert.equal(n("sražen", "Stav"), "Sražen");
  assert.match(n("soustředí", "Stav"), /Concentration/);
  assert.match(n("Dash", "Pravidla SRD"), /Dash/);
  S.ev(
    `(() => { const s = document.createElement("span"); s.dataset.hlp = "Finesse"; s.dataset.hlg = "Pravidla SRD"; s.id = "thlp"; document.body.appendChild(s); s.click(); })()`,
  );
  await new Promise(r => setTimeout(r, 50));
  assert.match(S.ev(`(document.querySelector(".mmpop") || {}).textContent || ""`), /Lehkoruká/);
  S.ev(`mmPopX(); document.getElementById("thlp").remove(); 0`);
});

test("vypravěč: hledání najde vlastní bestiář a statbloky osob s tlačítkem do boje", async () => {
  await S.ev("hlIndex()");
  const g = JSON.parse(S.ev(`JSON.stringify([...new Set(HLI.map(e => e.g))])`));
  assert.ok(g.includes("Protivník"), "vlastní bestiář");
  assert.ok(g.includes("Osoba"), "statbloky osob");
  const os = S.ev(`(e => e && HLI.indexOf(e))(hlHledej(HLI, "Viktorin").find(e => e.g === "Osoba"))`);
  assert.ok(os >= 0, "Viktorin z Poděbrad jako osoba se statblokem");
  assert.match(S.ev(`hlDetailHtml(HLI[${os}], false)`), /data-hlboj="o:viktorin"/);
});
