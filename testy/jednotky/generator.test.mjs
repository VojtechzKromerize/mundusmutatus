// Rychlé testy generátoru obsahu (zdroj/generator.js): tajemství vypravěče a zmínky podle odhalení.
import {test} from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";

const G = createRequire(import.meta.url)("../../zdroj/generator.js");

test("tajemství: ⟦tajné⟧ zmizí, ⟦tajné¦pro hráče⟧ ukáže hráčům náhradu", () => {
  const [t, pryc] = G.stripSecrets("Rod ⟦spolčen s drakem⟧ drží hrad ⟦Bezděz¦na severu⟧.");
  assert.equal(t, "Rod  drží hrad na severu.");
  assert.deepEqual(pryc, ["spolčen s drakem", "Bezděz"]);
  assert.ok(!/[⟦⟧]/.test(t));
});

test("tajemství: vypravěč vidí skutečný text", () => {
  assert.equal(G.showSecrets("hrad ⟦Bezděz¦na severu⟧, ⟦drak⟧"), "hrad Bezděz, drak");
});

test("zmínky: odkaz jen na to, co družina zná", () => {
  const st = {jiri: 2, zdenek: 1, var: 0};
  assert.equal(G.zminky("[[jiri|Jiří]]", st), "[[jiri|Jiří]]");
  assert.equal(G.zminky("[[var|Vartenberk]]", st), "Vartenberk", "neznámé: jen text bez odkazu");
  assert.equal(G.zminky("[[var|Vartenberk|jistý pán]]", st), "jistý pán", "neznámé s náhradou");
  assert.equal(G.zminky("[[?zdenek|Zdeněk]]", st), "Zdeněk", "? – text, když slyšeli");
  assert.equal(G.zminky("[[?var|Vartenberk|někdo]]", st), "někdo");
  assert.equal(G.zminky("[[!zdenek|Zdeněk ze Šternberka|pán z Konopiště]]", st), "pán z Konopiště", "! – jen když potkali");
  assert.equal(G.zminky("[[!jiri|král Jiří|král]]", st), "král Jiří");
});

test("traktáty: načtou se ze složky traktaty, pořadí podle souboru, odhalení a tajemství pro hráče", () => {
  const soubory = {
    "vazby.md": "",
    "traktaty/_vzor.md": "---\nid: vzor\ntitle: Vzor\n---\nVzor se ignoruje.\n",
    "traktaty/020-druhy.md": "---\nid: druhy\ntitle: Druhý traktát\n---\nSkrytý ⟦úplně⟧.\n",
    "traktaty/010-prvni.md":
      "---\nid: prvni\ntitle: První traktát\nstav: potkali\n---\n*Podtitul.*\n\n## Oddíl\n\nVeřejný text ⟦tajemství vypravěče¦zvěsti⟧ a konec.\n",
    "traktaty/015-zvest.md": "---\nid: zvest\ntitle: Zvěst\nstav: slyseli\n---\nText jen pro ty, kdo traktát četli.\n",
  };
  const g = G.generuj(soubory, {});
  assert.deepEqual(
    g.odh.TRAKTATY.map(t => t.id),
    ["prvni", "zvest", "druhy"],
  );
  assert.deepEqual(g.seed, {prvni: 2, zvest: 1, druhy: 0}, "stav z hlavičky, bez něj skryté");
  const gm = G.proGM(g.odh).TRAKTATY;
  assert.ok(gm[0].h.includes("<h3>Oddíl</h3>") && gm[0].h.includes("tajemství vypravěče"), "vypravěč vidí vše");
  assert.equal(gm.length, 3);
  const h = G.proHrace(g.odh);
  assert.ok(h.odstranene.includes("tajemství vypravěče"));
  const hrac = G.rozbal(h.hrac, g.seed).TRAKTATY;
  assert.deepEqual(
    hrac.map(t => [t.id, t.sl]),
    [
      ["prvni", false],
      ["zvest", true],
    ],
    "skrytý traktát hráč nedostane",
  );
  assert.ok(hrac[0].h.includes("Veřejný text zvěsti a konec") && !/tajemství|[⟦⟧]/.test(hrac[0].h));
  assert.equal(hrac[1].h, "", "slyšeli: jen název bez textu");
  assert.throws(() => G.generuj({"vazby.md": "", "traktaty/010-x.md": "---\ntitle: Bez id\n---\nText\n"}, {}), /traktaty\/010-x\.md: chybí 'id'/);
});

test("traktáty: první traktát (Krátké dějiny země) je platný, viditelný hráčům a bez tajemství", async () => {
  const fs = await import("node:fs");
  const txt = fs.readFileSync(new URL("../../zdroj/obsah/traktaty/010-kratke-dejiny.md", import.meta.url), "utf8");
  const g = G.generuj({"vazby.md": "", "traktaty/010-kratke-dejiny.md": txt}, {});
  assert.equal(g.seed["kratke-dejiny"], 2);
  assert.ok(!/[⟦⟧]/.test(txt));
  assert.ok(!/14(59|[6-9]\d)/.test(txt), "nic po roce 1458");
});
