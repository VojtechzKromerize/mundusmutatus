// Služby a mzdy (2026-10-30): čistý 10y-sluzby.js (zápis cen, mzdy, dny práce, noclehy na výpravě) a data zdroj/vybaveni/sluzby-mzdy.json
// (rozsahy, orientační řádky, žádné jméno autora ani rok po březnu 1458 v textu pro hráče).
import {test, before, after} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {ciste} from "./ciste.mjs";
import {stranka} from "./stranka.mjs";

const C = ciste();
const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA = JSON.parse(fs.readFileSync(path.join(KOREN, "zdroj", "vybaveni", "sluzby-mzdy.json"), "utf8"));

test("zápis cen: groše, haléře, kopy a zlaté jako v katalogu", () => {
  assert.deepEqual(C.V(`[0, 0.1, 0.5, 1, 1.5, 2.5, 59.9].map(slzCena)`), ["zdarma", "1 hal.", "½ gr.", "1 gr.", "1½ gr.", "2½ gr.", "59 gr. 9 hal."]);
  assert.deepEqual(C.V(`[60, 150, 180, 300].map(slzCena)`), ["1 kopa", "2 kopy 30 gr.", "3 kopy", "5 kop"]);
  /* od deseti kop zaokrouhleně v kopách a zlatých */
  assert.equal(C.ev(`slzCena(1800)`), "30 kop (≈ 45 zl.)");
  assert.equal(C.ev(`slzCena(18000)`), "300 kop (≈ 450 zl.)");
  assert.equal(C.ev(`slzCena(5400).replace(/\\u00a0/g, " ")`), "90 kop (≈ 135 zl.)");
});

test("rozsah: stejné meze jsou jedna hodnota", () => {
  assert.equal(C.ev(`slzRozsah(1.5, 3)`), "1½ gr. – 3 gr.");
  assert.equal(C.ev(`slzRozsah(2, 2)`), "2 gr.");
});

test("mzda mistra 2 gr. denně: týden, měsíc, rok", () => {
  assert.deepEqual(C.V(`slzMzda(2)`), {den: 2, tyden: 10, mesic: 42, rok: 500});
  assert.deepEqual(C.V(`slzMzda(1.5)`), {den: 1.5, tyden: 7.5, mesic: 31.5, rok: 375});
});

test("cena ve dnech práce: kůň 2½ kopy ≈ 75 dní mistra, nejméně 1 den", () => {
  assert.equal(C.ev(`slzDnu(150)`), 75);
  assert.equal(C.ev(`slzDnu(150, 1.5)`), 100);
  assert.equal(C.ev(`slzDnu(0.1)`), 1);
});

test("noclehy výpravy: krčma 2 gr. na osobu + 1 gr. za koně, komůrka o půl groše víc, klášter dar 1 gr., tvrz a širák zdarma", () => {
  assert.equal(C.ev(`slzNoci(["krcma"], 4, 0)`), 8);
  assert.equal(C.ev(`slzNoci(["krcma"], 4, 4)`), 12);
  assert.equal(C.ev(`slzNoci(["komurka"], 2, 2)`), 7);
  assert.equal(C.ev(`slzNoci(["klaster", "tvrz", "sirak"], 5, 5)`), 1);
  assert.equal(C.ev(`slzNoci(["krcma", "krcma", "klaster"], 3, 3)`), 2 * 9 + 1);
  assert.equal(C.ev(`slzNoci([], 3, 3)`), 0);
});

test("řádek tabulky: dny práce jen u jednorázových věcí od 10 gr., přepočet jen u mezd", () => {
  const dum = C.V(`slzRadek({s: 720, od: 240, do: 1200, j: "kupní cena"})`);
  assert.equal(dum.dnu, 360);
  assert.equal(dum.rozsah, "4 kopy – 20 kop (≈ 30 zl.)");
  const mzda = C.V(`slzRadek({s: 2, od: 2, do: 3, j: "za den", mzda: 1})`);
  assert.equal(mzda.dnu, 0);
  assert.equal(mzda.mzda.rok, 500);
  assert.equal(C.V(`slzRadek({s: 5, od: 5, do: 5, j: "za zakázku"})`).dnu, 0);
});

test("data: každý řádek má rozsah od ≤ běžná ≤ do, jednotku a zdroj slovy; skupiny mají jedinečné id", () => {
  const ids = DATA.skupiny.map(g => g.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["nocleh", "doprava", "mzdy", "zakazky", "pravo", "domy", "zbozi"]) assert.ok(ids.includes(id), id);
  for (const g of DATA.skupiny)
    for (const r of g.radky) {
      const kde = `${g.id}: ${r.n}`;
      assert.ok(r.od <= r.s + 1e-9 && r.s <= r.do + 1e-9, `${kde}: od ≤ běžná ≤ do`);
      assert.ok(r.j && r.z, `${kde}: jednotka a zdroj`);
      if (r.h) assert.ok(r.o, `${kde}: herní měřítko je vždy orientační`);
    }
});

test("data: konzistence s katalogem (jídlo na den, stáj) a s noclehy výpravy", () => {
  const radek = n => DATA.skupiny.flatMap(g => g.radky).find(r => r.n.startsWith(n));
  assert.equal(radek("Jídlo na den").s, 1);
  assert.equal(radek("Stáj a píce").s, 1);
  assert.equal(radek("Nocleh s večeří a snídaní v krčmě").s, C.ev(`SLZ_NOC.krcma.os`));
  assert.equal(radek("Mistr řemeslník").s, 2);
  assert.equal(radek("Tovaryš").s, 1.5);
  const kat = JSON.parse(fs.readFileSync(path.join(KOREN, "zdroj", "vybaveni", "ceny-dobove.json"), "utf8"));
  assert.equal(kat.vozy["Stabling per day"], radek("Stáj a píce").s);
  assert.equal(kat.vybava.Rations, radek("Jídlo na den").s);
});

test("data: text pro hráče bez jmen autorů a bez roku po březnu 1458; art/vybaveni.json je sestaven z dat", () => {
  const retezce = [];
  JSON.stringify(DATA, (k, v) => (typeof v === "string" && retezce.push(v), v));
  const text = retezce.join("\n");
  assert.ok(!/(Bale|Howell|Goliński|Šandera|Engel|Arnold|Klassen|Nowakowski|Spufford|Gies|Allmand)/.test(text), "jméno autora v textu");
  assert.ok(!/(?<![\d.,])(1459|14[6-9]\d|1[5-9]\d\d)(?!\d)/.test(text), "rok po březnu 1458");
  const art = JSON.parse(fs.readFileSync(path.join(KOREN, "art", "vybaveni.json"), "utf8"));
  assert.deepEqual(art.sluzby, DATA);
});

/* stránka Pravidla › Vybavení: tabulka Služby a mzdy se vykreslí z art/vybaveni.json */
let S;
before(async () => {
  S = await stranka();
});
after(() => S && S.zavri());
const VA = async vyraz => {
  const r = await S.ev(`(async()=>JSON.stringify(await (${vyraz})))()`);
  return r === undefined ? undefined : JSON.parse(r);
};

test("stránka Vybavení: Služby a mzdy mají všechny skupiny, běžné ceny, rozsahy a přepočet mzdy", async () => {
  const h = await VA(`(async()=>{ await vybNacti(); return vybSluzbyHtml(""); })()`);
  for (const g of DATA.skupiny) assert.ok(h.includes(g.n), g.n);
  assert.ok(h.includes('id="vyb-sluzby"'));
  assert.ok(h.includes("Nocleh s večeří a snídaní v krčmě") && h.includes("2 gr."));
  assert.ok(h.includes("týdně 10 gr. · měsíčně 42 gr. · ročně 8 kop 20 gr."));
  assert.ok(h.includes("orientačně") && h.includes("doloženo"));
});

test("stránka Vybavení: hledání ve Službách a mzdách a odkaz z peněz", async () => {
  const h = await VA(`(async()=>{ await vybNacti(); return vybSluzbyHtml(vybKl("stáj")); })()`);
  assert.ok(h.includes("Stáj a píce") && !h.includes("Kanovník"));
  assert.equal(await VA(`vybSluzbyHtml(vybKl("zzzzneexistuje"))`), "");
});
