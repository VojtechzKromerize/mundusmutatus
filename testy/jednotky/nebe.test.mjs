// Vzdušný boj draků (10n-nebe.js, čistý soubor): karta draka z profilu plemene, šablony manévrů, současný pohyb, střet,
// překryv, oblouky, pásma, Napětí, Závoj, Noční oči a zranění – návrh pravidla/vzdusny-boj-navrh.md v projektu claude.ai.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {V} = ciste();
const blizko = (a, b, m = 0.01) => assert.ok(Math.abs(a - b) < m, `${a} ≠ ${b}`);

test("karta soumračníka: široká zaoblená křídla + vějíř z peří, bez rychlosti 4, Tichý let a Noční oči", () => {
  const K = V(`nebeKarta("soumracnik", {h: 2})`);
  assert.equal(K.d["ostra:1"], "z", "ostrá zatáčka 1 zelená (křídla)");
  assert.equal(K.d["mirna:3"], "z", "mírné zatáčky zelené");
  assert.equal(K.d["rovne:1"], "z", "vějíř: rychlost 1 zelená");
  assert.equal(K.d["stoupani:1"], "z");
  assert.equal(K.d["rovne:2"], "b");
  assert.equal(K.d["zvrat:3"], "c", "Zvrat červený");
  assert.equal(K.d["rovne:4"], undefined, "bez rychlosti 4");
  assert.equal(K.d["viseni:0"], undefined, "vějíř není Visení");
  assert.equal(K.zaklad, 60);
  assert.equal(K.maxNap, 3);
  assert.equal(K.tichy, true);
  assert.equal(K.podpis, "nocni_oci");
});

test("karta korutanského lindwurmu: široká prstnatá křídla, zelené rovně 2–3, červené ostré zatáčky, vytrvalý let", () => {
  const K = V(`nebeKarta("korutansky_lindwurm", {h: 2})`);
  assert.equal(K.d["rovne:2"], "z");
  assert.equal(K.d["rovne:3"], "z");
  assert.equal(K.d["ostra:1"], "c");
  assert.equal(K.d["zvrat:3"], "c");
  assert.equal(K.d["mirna:1"], "b");
  assert.equal(K.d["rovne:4"], undefined);
  assert.equal(K.maxNap, 4, "vytrvalý let přistává až při 4 Napětí");
  assert.equal(K.ponor, true, "veslo: ponor nad vodou");
});

test("zranění draka škrtá manévry: křídlo bez ostrých zatáček, ocas bez Zvratu, trup červené Stoupání", () => {
  const K = V(`nebeKarta("soumracnik", {h: 2, zr: {kridlo: true, ocas: true, trup: true}})`);
  assert.equal(K.d["ostra:1"], undefined);
  assert.equal(K.d["zvrat:3"], undefined);
  assert.equal(K.d["stoupani:1"], "c");
  assert.equal(K.d["mirna:1"], "z", "ostatní beze změny");
});

test("volba manévru: s Napětím ne červený, Nálet jen do výše a nejvýš o 2 hladiny, ne výš než Výšiny", () => {
  const L = V(`(() => { const K = nebeKarta("korutansky_lindwurm", {h: 2}); return [
    nebeLzeZvolit(K, {m: "ostra", r: 1, s: "L"}, {nap: 0, h: 2}).ok,
    nebeLzeZvolit(K, {m: "ostra", r: 1, s: "L"}, {nap: 1, h: 2}).ok,
    nebeLzeZvolit(K, {m: "nalet", r: 3, p: 2}, {nap: 0, h: 2}).ok,
    nebeLzeZvolit(K, {m: "nalet", r: 3, p: 3}, {nap: 0, h: 4}).ok,
    nebeLzeZvolit(K, {m: "nalet", r: 3, p: 2}, {nap: 0, h: 1}).ok,
    nebeLzeZvolit(K, {m: "stoupani", r: 1}, {nap: 0, h: 4}).ok,
    nebeLzeZvolit(K, {m: "rovne", r: 4}, {nap: 0, h: 2}).ok,
  ]; })()`);
  assert.deepEqual(L, [true, false, true, false, false, false, false]);
});

test("šablony: rovně 3 posune střed o podstavec + 120, ostrá zatáčka doprava otočí o 90°", () => {
  const r = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "rovne", r: 3}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(r.x, 450);
  blizko(r.y, 600 - 60 - 120);
  assert.equal(r.u, 0);
  const o = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "ostra", r: 1, s: "P"}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(o.u, 90);
  /* střed: 30 dopředu, oblouk o poloměru 35 doprava (+35 x, −35 y), 30 doprava */
  blizko(o.x, 450 + 35 + 30);
  blizko(o.y, 600 - 30 - 35);
  const l = V(`nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "mirna", r: 2, s: "L"}, nebeKarta("soumracnik", {h: 2})).konec`);
  blizko(l.u, 315);
  assert.ok(l.x < 450, "mírná doleva jde doleva");
});

test("Zvrat otočí draka o 180° až na konci, Nálet a Stoupání mění hladinu plynule", () => {
  const z = V(
    `(() => { const H = nebeDraha({x: 450, y: 600, u: 0, h: 2}, {m: "zvrat", r: 3}, nebeKarta("korutansky_lindwurm", {h: 2})); return [H.bod(0.5).u, H.konec.u]; })()`,
  );
  assert.deepEqual(z, [0, 180]);
  const n = V(
    `(() => { const H = nebeDraha({x: 450, y: 600, u: 0, h: 3}, {m: "nalet", r: 3, p: 2}, nebeKarta("soumracnik", {h: 3})); return [H.bod(0.5).h, H.konec.h]; })()`,
  );
  assert.deepEqual(n, [2, 1]);
});

test("střet: čelní průlet se zastaví v okamžiku přiblížení, i když konečné pozice jsou daleko od sebe", () => {
  const S = V(`(() => {
    const Ks = nebeKarta("soumracnik", {h: 2}), Kl = nebeKarta("korutansky_lindwurm", {h: 2});
    const D = [{strana: "d", K: Ks}, {strana: "n", K: Kl}];
    const H = [nebeDraha({x: 440, y: 650, u: 0, h: 2}, {m: "rovne", r: 3}, Ks), nebeDraha({x: 460, y: 250, u: 180, h: 2}, {m: "rovne", r: 3}, Kl)];
    const s = nebeStret(D, H);
    return {s, konec: nebeOkraje(H[0].konec, H[1].konec, Ks, Kl)};
  })()`);
  assert.ok(S.s, "střet nastal");
  assert.ok(S.s.t > 0 && S.s.t < 1, "uprostřed pohybu");
  assert.equal(S.s.a, 0);
  assert.equal(S.s.b, 1);
  assert.ok(S.konec <= 100, "konečné pozice: v tomto případě blízko");
  const daleko = V(`(() => {
    const Ks = nebeKarta("soumracnik", {h: 2}), Kl = nebeKarta("korutansky_lindwurm", {h: 2});
    const D = [{strana: "d", K: Ks}, {strana: "n", K: Kl}];
    return nebeStret(D, [nebeDraha({x: 300, y: 700, u: 0, h: 2}, {m: "rovne", r: 1}, Ks), nebeDraha({x: 600, y: 200, u: 180, h: 2}, {m: "rovne", r: 1}, Kl)]);
  })()`);
  assert.equal(daleko, null, "daleko od sebe – bez střetu");
  const vyska = V(`(() => {
    const Ks = nebeKarta("soumracnik", {h: 0}), Kl = nebeKarta("korutansky_lindwurm", {h: 4});
    const D = [{strana: "d", K: Ks}, {strana: "n", K: Kl}];
    return nebeStret(D, [nebeDraha({x: 440, y: 650, u: 0, h: 0}, {m: "rovne", r: 3}, Ks), nebeDraha({x: 460, y: 250, u: 180, h: 4}, {m: "rovne", r: 3}, Kl)]);
  })()`);
  assert.equal(vyska, null, "rozdíl dvou a víc hladin – minou se");
});

test("překryv na stejné hladině rozestoupí draky, na jiné hladině ne", () => {
  const p = V(
    `(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePrekryv({x: 400, y: 400, u: 0, h: 2}, {x: 420, y: 400, u: 90, h: 2}, K, K); })()`,
  );
  blizko(Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y), 60);
  blizko((p.a.x + p.b.x) / 2, 410);
  assert.equal(
    V(
      `(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePrekryv({x: 400, y: 400, u: 0, h: 2}, {x: 420, y: 400, u: 0, h: 3}, K, K); })()`,
    ),
    null,
  );
});

test("oblouky a pásma: vpředu, za ocasem, na boku; rozdíl dvou hladin = o pásmo dál", () => {
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 0}, {x: 10, y: -100})`), "predni");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 0}, {x: 0, y: 100})`), "zadni");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 90}, {x: 0, y: -100})`), "bok");
  assert.equal(V(`nebeOblouk({x: 0, y: 0, u: 90}, {x: 100, y: 5})`), "predni");
  const P = s => V(`(() => { const K = nebeKarta("soumracnik", {h: 2}); return nebePasmo(${s}, K, K); })()`);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 150, h: 2}`), 1);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 250, h: 2}`), 2);
  assert.equal(P(`{x: 0, y: 0, h: 1}, {x: 0, y: 250, h: 3}`), 3);
  assert.equal(P(`{x: 0, y: 0, h: 2}, {x: 0, y: 450, h: 2}`), 0);
});

test("útok draka: přední oblouk a stejná hladina; Nálet na nižší cíl dá +1k6 za hladinu, Tichý let výhodu; hlava neútočí", () => {
  const U = s =>
    V(`(() => { const Ks = nebeKarta("soumracnik", {h: 2}), Kl = nebeKarta("korutansky_lindwurm", {h: 2}); return nebeUtokDraka(${s}); })()`);
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}`).muze, true);
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 1}, Ks, Kl, {m: "rovne", r: 2}`).muze, false);
  const n = U(`{x: 0, y: 0, u: 0, h: 1, h0: 3}, {x: 0, y: -100, u: 180, h: 1}, Ks, Kl, {m: "nalet", r: 3, p: 2}`);
  assert.equal(n.muze, true);
  assert.equal(n.bonus, 2);
  assert.equal(n.vyhoda, true, "soumračník: Tichý let");
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: 100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}`).muze, false, "za zády");
  assert.equal(U(`{x: 0, y: 0, u: 0, h: 2}, {x: 0, y: -100, u: 180, h: 2}, Ks, Kl, {m: "rovne", r: 2}, {hlava: true}`).muze, false);
});

test("Napětí: zelená −1, červená +1, Výšiny bez Výškového letu +1, nikdy pod nulu", () => {
  const K = `nebeKarta("soumracnik", {h: 2})`;
  assert.equal(V(`nebeNapeti(1, "z", ${K}, 2)`), 0);
  assert.equal(V(`nebeNapeti(0, "z", ${K}, 2)`), 0);
  assert.equal(V(`nebeNapeti(0, "c", ${K}, 2)`), 1);
  assert.equal(V(`nebeNapeti(0, "b", ${K}, 4)`), 1);
});

test("Závoj u červeného manévru: Pokušení = drak letí rovně, Požehnání = bez Napětí, bílý manévr se nehází", () => {
  const Z = s => V(`(() => { const K = nebeKarta("korutansky_lindwurm", {h: 2}); return nebeZavoj(K, ${s}); })()`);
  const p = Z(`{m: "ostra", r: 2, s: "L"}, 1`);
  assert.deepEqual(p.r, {m: "rovne", r: 2});
  assert.equal(p.barva, "z", "rovně 2 je u lindwurmu zelené");
  assert.equal(Z(`{m: "ostra", r: 2, s: "L"}, 6`).barva, "b");
  assert.equal(Z(`{m: "ostra", r: 2, s: "L"}, 3`).barva, "c");
  assert.equal(Z(`{m: "mirna", r: 2, s: "L"}, 1`).t, "", "bílý manévr – Závoj se neuplatní");
});

test("Noční oči: jen v noci a jen u soumračníka; rychlost ±1 nebo mírná ↔ ostrá podle číselníku", () => {
  const N = (pl, r, noc) =>
    V(`(() => { const K = nebeKarta("${pl}", {h: 2}); return nebeNocniOci(K, ${r}, {noc: ${noc}, nap: 0, h: 2}).map(nebeKlic).sort(); })()`);
  assert.deepEqual(N("soumracnik", `{m: "mirna", r: 2, s: "L"}`, true), ["mirna:1", "mirna:3", "ostra:2"]);
  assert.deepEqual(N("soumracnik", `{m: "mirna", r: 2, s: "L"}`, false), []);
  assert.deepEqual(N("korutansky_lindwurm", `{m: "mirna", r: 2, s: "L"}`, true), []);
  assert.deepEqual(N("soumracnik", `{m: "rovne", r: 3}`, true), ["rovne:2"], "rychlost 4 soumračník nemá");
});
