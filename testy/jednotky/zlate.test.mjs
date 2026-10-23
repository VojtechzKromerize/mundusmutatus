// Zlaté snímky karet (2026-10-23): spočítaná karta každé zkušební a vzorové postavy (AC, HP, záchrany, dovednosti, kouzla,
// sloty, zdroje, útoky, přídavky, Výdrž) se porovná s uloženým snímkem v testy/data/zlate/<id>.json. Chrání před tím, že
// změna v jedné relaci tiše změní výpočet karty, který testuje jen prohlížeč.
//   Karty: zdroj/obsah/karty/*.json (Balduin) + testy/data/karty/*.json (vzory podtříd družiny; další karta = další soubor).
//   Varianty se stavem: VARIANTY níže (účinky na kartě, přepínače) – hlídají i sčítání účinků z 10u.
//   Snímek se mění vědomě:  MM_ZLATE=obnov node --test testy/jednotky/zlate.test.mjs  → zkontroluj git diff a commitni s důvodem.
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {stranka} from "./stranka.mjs";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ZLATE = path.join(KOREN, "testy", "data", "zlate");
const OBNOV = process.env.MM_ZLATE === "obnov";
const karty = [path.join(KOREN, "zdroj", "obsah", "karty"), path.join(KOREN, "testy", "data", "karty")].flatMap(d =>
  fs.existsSync(d)
    ? fs
        .readdirSync(d)
        .filter(f => f.endsWith(".json"))
        .sort()
        .map(f => JSON.parse(fs.readFileSync(path.join(d, f), "utf8")))
    : [],
);
/* varianty se stavem karty: jméno → změna stavu (kartaStav) */
const VARIANTY = {
  "vzor-mistr-boje": {
    "Haste, Longstrider a Bless (vlastní účinky)": {
      uc: [
        {n: "Haste", h: 1},
        {n: "Longstrider", h: 1},
        {n: "Bless", h: 0.1},
      ],
    },
  },
  "vzor-vestec": {"Mage Armor (bez zbroje)": {uc: [{n: "Mage Armor", h: 8}]}},
  "vzor-horlivec": {"v zuřivosti": {pri: ["Rage"]}},
};

/* co se ze spočítané karty ukládá – čísla a krátké řádky, aby rozdíl ve snímku byl čitelný */
const SNIMEK = `K => {
  const H = (t, a) => kHodn(K, t, a).v;
  return {
    uroven: kLv(K),
    zdatnost: kPB(K),
    ac: kAC(K),
    hp: kHPmax(K),
    iniciativa: H("ini"),
    rychlost: kRychN(K),
    odolnosti: kOdol(K),
    zachrany: Object.fromEntries(BAB.map(a => [a, H("zach", a)])),
    dovednosti: Object.fromEntries(Object.keys(KDOVAB).map(d => [d, H("dov", d)])),
    kouzla: kSpAb(K) ? {so: kSpDC(K), utok: H("sput")} : null,
    sloty: kSloty(K).map(q => q.st + (q.pakt ? "p" : "") + "×" + q.max),
    zdroje: kZdroje(K).map(q => q.n + " " + q.max),
    utoky: kUtoky(K).map(a => [a.n + ":", bsg(+a.b || 0), a.z || "", a.t || "", a.pocet > 1 ? "×" + a.pocet : ""].filter(Boolean).join(" ")),
    pridavky: kEfekty(K).map(e => e.n + (e.zr ? " " + e.zr : "")),
    kostkyKHodum: [...kKostkyNaSobe(K)],
    vydrz: kVydMax(K),
  };
}`;

let S;
before(async () => {
  S = await stranka();
  await S.ev("Promise.all([vybNacti(), kSpNacti(), mimoNacti(), typeof predNacti === 'function' ? predNacti() : null])");
  if (OBNOV) fs.mkdirSync(ZLATE, {recursive: true});
});
after(() => S && S.zavri());

async function snimek(K, stav) {
  return JSON.parse(
    await S.ev(`(async () => {
      const K = ${JSON.stringify(K)};
      KARTBY[K.id] = K;
      const st0 = KST[K.id];
      KST[K.id] = Object.assign({}, ${JSON.stringify(stav || {})});
      try { return JSON.stringify((${SNIMEK})(K)); } finally { if (st0 === undefined) delete KST[K.id]; else KST[K.id] = st0; }
    })()`),
  );
}

for (const K of karty)
  test(`zlatý snímek karty: ${K.n || K.id}`, async () => {
    const r = {karta: await snimek(K), varianty: {}};
    for (const [jm, st] of Object.entries(VARIANTY[K.id] || {})) r.varianty[jm] = await snimek(K, st);
    const p = path.join(ZLATE, K.id + ".json");
    if (OBNOV || !fs.existsSync(p)) {
      fs.writeFileSync(p, JSON.stringify(r, null, 2) + "\n");
      if (!OBNOV) assert.fail(`chyběl snímek ${path.relative(KOREN, p)} – vytvořen, zkontroluj ho a commitni`);
      return;
    }
    assert.deepEqual(
      r,
      JSON.parse(fs.readFileSync(p, "utf8")),
      `spočítaná karta ${K.id} se liší od snímku – je-li změna záměrná: MM_ZLATE=obnov node --test testy/jednotky/zlate.test.mjs`,
    );
  });
