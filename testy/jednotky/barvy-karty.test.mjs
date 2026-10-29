// Barvy hráčské karty (2026-10-29, Vojta): vínová výchozí + Noc, Les, Uhel, Purpur (html[data-kb] → --kbt-*). Každá paleta má všechny
// tokeny a text, ztlumený text, zlato, akcent a nadpisy mají na všech panelech karty kontrast aspoň 4,5:1 (WCAG AA).
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const css = readFileSync(new URL("../../zdroj/web/styly.css", import.meta.url), "utf8");
const js = readFileSync(new URL("../../zdroj/web/js/01-zaklad.js", import.meta.url), "utf8");
const lum = h => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const kontrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/* výchozí vínová = hodnoty v záložních částech var(--kbt-X, …) základního bloku */
const zakl = {};
for (const m of css.matchAll(/--kb-([\w-]+):var\(--kbt-[\w-]+,(#[0-9a-f]{6}|rgba\([^)]*\))\)/g)) zakl[m[1]] = m[2];
const palety = {vino: zakl};
for (const m of css.matchAll(/html\[data-kb="(\w+)"\]\{([^}]*)\}/g)) {
  const P = {};
  for (const t of m[2].split(/;(?![^(]*\))/)) {
    const k = t.match(/^--kbt-([\w-]+):(.*)$/);
    if (k) P[k[1]] = k[2];
  }
  palety[m[1]] = P;
}
const PANELY = ["bg", "pan", "pan2", "pan3", "hd1", "hd2", "port", "in", "bar", "btn", "off"];

test("barvy karty: nabídka v JS, bloky v CSS a seznam v kostře stránky se shodují", () => {
  const vJs = [...js.match(/const MMKB = \{([^}]*)\}/)[1].matchAll(/(\w+): "/g)].map(m => m[1]).sort();
  assert.deepEqual(vJs, Object.keys(palety).sort());
  const html = readFileSync(new URL("../../zdroj/koruna.html", import.meta.url), "utf8");
  const vKostre = html.match(/\["noc"[^\]]*\]\.includes\(k\)/)[0];
  for (const k of Object.keys(palety).filter(k => k !== "vino")) assert.ok(vKostre.includes(`"${k}"`), `${k} v kostře`);
});

test("každá paleta má všechny tokeny", () => {
  const klice = Object.keys(zakl).sort();
  assert.ok(klice.length >= 25, "základní blok má tokeny");
  for (const [n, P] of Object.entries(palety)) assert.deepEqual(Object.keys(P).sort(), klice, `${n}: stejné tokeny jako výchozí`);
});

for (const [n, P] of Object.entries(palety)) {
  test(`kontrast textu na panelech karty ≥ 4,5:1: ${n}`, () => {
    for (const t of ["tx", "mu", "gold", "ac-tx", "hl", "hb", "ok"])
      for (const p of PANELY) assert.ok(kontrast(P[t], P[p]) >= 4.5, `${n}: ${t} na ${p} = ${kontrast(P[t], P[p]).toFixed(2)}`);
  });
}
