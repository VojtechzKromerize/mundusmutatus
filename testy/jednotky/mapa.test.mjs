// Mapa Zemí Koruny české (2026-10-24): města doby na mapě, význam míst (velikost značky a od kdy se ukáže jméno).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import {stranka} from "./stranka.mjs";

let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const V = vyraz => JSON.parse(S.ev(`JSON.stringify(${vyraz})`));

test("mapa: doplněná města doby jsou mezi místy mapy", () => {
  const n = new Set(V(`PLACES.map(p => p.name)`));
  for (const m of [
    "Kouřim",
    "Stříbro",
    "Tachov",
    "Trutnov",
    "Prachatice",
    "Litovel",
    "Prostějov",
    "Košice",
    "Štýrský Hradec",
    "Augšpurk",
    "Wittenberg",
    "Čenstochová",
  ])
    assert.ok(n.has(m), m);
});

test("mapa: význam místa – metropole a hlavní města mají jméno vždy, města od přiblížení Koruny, hrady až zblízka", () => {
  assert.deepEqual(V(`["Praha", "Plzeň", "Kouřim", "Pernštejn"].map((n, i) => mistoTier(n, i < 3))`), [0, 1, 2, 3]);
  assert.deepEqual(V(`[mistoPopisek(1, 1), mistoPopisek(2, 1), mistoPopisek(2, 0.8), mistoPopisek(3, 0.8), mistoPopisek(3, 0.5)]`), [
    true,
    false,
    true,
    false,
    true,
  ]);
});

test("mapa: kraje Čech a landfrídy – každý kraj má svou oblast uvnitř Čech, landfrídy odkazují na existující kraje", async () => {
  assert.equal(V(`KRAJE.length`), 16);
  assert.deepEqual(V(`KRAJE.filter(q => q.lf && !LANDFR[q.lf]).map(q => q.n)`), []);
  assert.deepEqual(V(`KRAJE.filter(q => q.lf === "vych").map(q => q.n)`), ["Kouřimský", "Čáslavský", "Chrudimský", "Hradecký"]);
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof krajeBunky`) === "function") {
    const B = V(`krajeBunky().map(c => c.reduce((a, p) => a + p.length, 0))`);
    assert.ok(
      B.every(n => n >= 3),
      "každý kraj má oblast: " + B,
    );
    assert.ok(
      V(
        `(() => { const [x, y] = P(14.95, 50.0); return krajeBunky()[11].some(p => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; }); })()`,
      ),
      "Kouřim leží v Kouřimském kraji",
    );
  }
});

test("mapa: podklad (#mapz) se při výběru rodu nekreslí znovu, při změně vrstvy podkladu ano", async () => {
  await S.ev(`typeof drawMapK === "function" || mmLina("mapa")`);
  if (V(`typeof drawMapK`) !== "function") return;
  S.ev(`drawMapK()`);
  const prvni = () => S.ev(`document.getElementById("mapz").firstElementChild`);
  const z0 = prvni();
  assert.ok(z0, "podklad je nakreslený");
  assert.ok(V(`document.querySelectorAll("#map .seat").length`) > 50, "sídla jsou v horní vrstvě");
  assert.equal(V(`document.querySelectorAll("#mapz .seat").length`), 0);
  S.ev(`setSel(FAM.find(f => !f.nbr && f.seats.length).id, false)`);
  assert.equal(prvni(), z0, "výběr rodu podklad nepřekreslí");
  S.ev(`st.duchy = true; drawMapK()`);
  assert.notEqual(prvni(), z0, "vrstva Země a knížectví je v podkladu");
  S.ev(`st.duchy = false; setSel(null, false)`);
});
