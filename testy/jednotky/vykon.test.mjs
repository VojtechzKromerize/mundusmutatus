// Výkon webu (2026-10-25): co se kvůli rychlosti počítá líně nebo skládá jinak, musí dát stejný výsledek jako dřív.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("síť cest se spočítá až při prvním měření trasy a trasy vycházejí jako dřív", () => {
  assert.equal(V(`RSIT`), false, "start webu síť nepočítá");
  const r = V(
    `[["Praha", "Kutná Hora"], ["Plzeň", "Brno"], ["Cheb", "Olomouc"]].map(([x, y]) => computeRoute(PLACES.find(p => p.name === x), PLACES.find(p => p.name === y)).km)`,
  );
  /* Plzeň–Brno 366 → 349 km od 2026-10-26: nové lesy a bažiny změnily terén, trasa vede jinudy */
  assert.deepEqual(r, [76, 349, 453]);
  assert.equal(V(`RSIT`), true);
});

test("místa jsou seřazená česky (Intl.Collator)", () => {
  const n = V(`PLACES.map(p => p.name)`);
  assert.deepEqual(
    n,
    [...n].sort((a, b) => a.localeCompare(b, "cs")),
  );
  const H = n.filter(x => /^H/.test(x)).pop();
  if (H && n.includes("Cheb")) assert.ok(n.indexOf("Cheb") > n.indexOf(H), "Ch až za H podle češtiny");
});

test("rejstřík hledání se sestaví až při prvním hledání", () => {
  assert.equal(V(`GIDX.length`), 0);
  S.ev(`gq.value = "Poděbrad"; gSearch()`);
  assert.ok(V(`GIDX.length`) > 100);
  assert.equal(V(`gres.hidden`), false, "výsledky se ukážou");
});

test("kapitola Pravidel: oddíly podle h3 (beze ztráty obsahu), Glosář a krátký text se nedělí", () => {
  const h = `<p>úvod</p>` + Array.from({length: 12}, (_, i) => `<h3 id="h${i}">N${i}</h3><p>a${i}</p><p>b${i}</p>`).join("");
  const r = V(`(() => { const F = srdOddily(${JSON.stringify(h)}, true), d = document.createElement("div"); d.appendChild(F);
    return [d.querySelectorAll(":scope > section.srdsek").length, d.querySelectorAll(":scope > :not(section)").length, d.textContent, d.querySelector("#h5").parentElement.firstElementChild.id]; })()`);
  assert.equal(r[0], 13, "úvod + 12 oddílů");
  assert.equal(r[1], 0, "vše je v oddílech");
  assert.equal(r[2], "úvod" + Array.from({length: 12}, (_, i) => `N${i}a${i}b${i}`).join(""));
  assert.equal(r[3], "h5", "oddíl začíná nadpisem");
  assert.equal(
    V(
      `(() => { const d = document.createElement("div"); d.appendChild(srdOddily(${JSON.stringify(h)}, false)); return d.querySelectorAll("section").length; })()`,
    ),
    0,
  );
  assert.equal(
    V(
      `(() => { const d = document.createElement("div"); d.appendChild(srdOddily("<h3>a</h3><p>b</p>", true)); return d.querySelectorAll("section").length; })()`,
    ),
    0,
  );
});

test("graf vazeb se rozloží až při prvním kreslení, skrytá mapa se nekreslí", () => {
  assert.equal(V(`GROZ`), false, "start webu graf nerozkládá");
  S.ev(`drawGraph()`);
  assert.equal(V(`GROZ`), true);
  assert.ok(V(`Object.values(GN).every(n => n.x >= 20 && n.y >= 18)`), "uzly jsou v ploše grafu");
  const v0 = V(`curView`);
  S.ev(`window.__dm = 0; window.__dk = typeof drawMapK === "function" ? drawMapK : null; if (window.__dk) drawMapK = () => window.__dm++`);
  try {
    S.ev(`curView = "uvod"; drawMap()`);
    assert.equal(V(`window.__dm`), 0, "mimo Mapu a Výpravu se mapa nekreslí");
    if (V(`!!window.__dk`)) {
      S.ev(`curView = "mapa"; drawMap()`);
      assert.equal(V(`window.__dm`), 1, "na Mapě ano");
    }
  } finally {
    S.ev(`curView = ${JSON.stringify(v0)}; if (window.__dk) drawMapK = window.__dk`);
  }
});
