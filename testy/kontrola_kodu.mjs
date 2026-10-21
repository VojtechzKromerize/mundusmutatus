// Kontrola kódu webu za pár sekund (bez prohlížeče):  node testy/kontrola_kodu.mjs
// 1. Složí skript stránky tak, jak ho vidí prohlížeč (kostra zdroj/koruna.html + řádky /*@vloz web/js/…*/), a projde ho ESLintem:
//    zdvojená jména (zdvojená const shodí celý web, zdvojená function se tiše přepíše), neznámá jména (překlep = chyba až při kliknutí),
//    zdvojené klíče objektů, nedosažitelný kód. Chyby ukazuje v původním souboru a řádku.
// 2. Hlídá pravidlo z CLAUDE.md: jádro (01–09, 26) se stahuje samo a nesmí hned při načtení (na nejvyšší úrovni souboru)
//    volat funkce z dílů 10–25, které se stahují líně.
// Potřebuje balíčky z package.json (npm ci). Výstup: řádky „soubor:řádek  pravidlo  zpráva“, návratový kód 1 při chybě.
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {Linter} from "eslint";
import globals from "globals";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZDROJ = path.join(KOREN, "zdroj");

/* ---- složení skriptu s mapou řádků zpět na zdrojové soubory ---- */
function slozSkript() {
  const kostra = fs.readFileSync(path.join(ZDROJ, "koruna.html"), "utf8").split("\n");
  const radky = [],
    mapa = []; // mapa[i] = [soubor, řádek v souboru]
  let vSkriptu = false;
  kostra.forEach((r, i) => {
    if (!vSkriptu) {
      const m = r.match(/<script(\s[^>]*)?>/);
      if (m && !/\bsrc=|type="application\/(ld\+)?json"/.test(m[0])) {
        vSkriptu = true;
        const zb = r.slice(r.indexOf(m[0]) + m[0].length);
        if (zb.trim()) {
          radky.push(zb);
          mapa.push(["zdroj/koruna.html", i + 1]);
        }
      }
      return;
    }
    if (/<\/script>/.test(r)) {
      vSkriptu = false;
      radky.push(";");
      mapa.push(["zdroj/koruna.html", i + 1]);
      return;
    }
    const v = r.match(/^\s*\/\*@vloz (web\/js\/[^*]+\.js)\*\/\s*$/);
    if (v) {
      const rel = "zdroj/" + v[1];
      fs.readFileSync(path.join(KOREN, rel), "utf8")
        .split("\n")
        .forEach((x, j) => {
          radky.push(x);
          mapa.push([rel, j + 1]);
        });
      return;
    }
    radky.push(r);
    mapa.push(["zdroj/koruna.html", i + 1]);
  });
  return {text: radky.join("\n"), mapa};
}

/* jména, která skript zakládá jako vlastnosti window (window.X=…) nebo která dodá build či jiný soubor stránky */
function jmenaWindow(text) {
  const s = new Set();
  for (const m of text.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)) s.add(m[1]);
  return s;
}
const DALSI = ["mmGen"]; // zdroj/generator.js – u vypravěče se načte zvlášť (koren.mmGen = API)

const {text, mapa} = slozSkript();
const glob = {...globals.browser};
for (const n of [...jmenaWindow(text), ...DALSI]) glob[n] = "writable";

const kde = r => {
  const m = mapa[r - 1] || ["?", r];
  return `${m[0]}:${m[1]}`;
};
const soubor = r => (mapa[r - 1] || ["?"])[0];

/* jádro (01–09, 26, kostra) se stahuje samo; díly 10–25 líně. Volání funkce z dílu, které jádro provede hned při načtení
   (na nejvyšší úrovni, mimo funkci), shodí stránku, než se díl stáhne. Uvnitř funkcí to statická kontrola rozhodnout neumí. */
const JADRO = /^zdroj\/(koruna\.html|web\/js\/(0\d[a-z]?|26)-)/;
const DIL = /^zdroj\/web\/js\/(1\d|2[0-5])[a-z]?-/;
const mm = {
  rules: {
    "jadro-vola-dil": {
      meta: {type: "problem", schema: []},
      create(ctx) {
        const dil = new Map(),
          volani = [];
        const fn = a => a.type === "FunctionDeclaration" || a.type === "FunctionExpression" || a.type === "ArrowFunctionExpression";
        return {
          Program(p) {
            for (const st of p.body) {
              const f = soubor(st.loc.start.line);
              if (!DIL.test(f)) continue;
              if (st.type === "FunctionDeclaration" && st.id) dil.set(st.id.name, f);
              if (st.type === "VariableDeclaration") for (const d of st.declarations) if (d.id.type === "Identifier") dil.set(d.id.name, f);
              if (st.type === "ClassDeclaration" && st.id) dil.set(st.id.name, f);
            }
          },
          CallExpression(n) {
            if (n.callee.type !== "Identifier" || !JADRO.test(soubor(n.loc.start.line))) return;
            if (ctx.sourceCode.getAncestors(n).some(fn)) return;
            volani.push(n);
          },
          "Program:exit"() {
            for (const n of volani)
              if (dil.has(n.callee.name))
                ctx.report({
                  node: n,
                  message: `${n.callee.name}() z ${dil.get(n.callee.name)} se volá hned při načtení jádra, ale díl se stahuje líně – přesuň volání do dílu nebo použij typeof … === "function"`,
                });
          },
        };
      },
    },
  },
};

const linter = new Linter({configType: "flat"});
const pravidla = {
  "no-redeclare": ["error", {builtinGlobals: false}],
  "no-undef": "error",
  "no-dupe-keys": "error",
  "no-unreachable": "error",
  "no-dupe-args": "error",
  "no-dupe-else-if": "error",
  "no-duplicate-case": "error",
  "no-const-assign": "error",
  "no-self-assign": "error",
  "use-isnan": "error",
  "valid-typeof": "error",
  "mm/jadro-vola-dil": "error",
  /* čárka jako operátor: ({…},(…)) vrátí jen poslední výraz – tak se 2026-10-20 ztratil celý zápis útoku vypravěče za hráče */
  "no-sequences": ["error", {allowInParentheses: false}],
  /* no-func-assign záměrně ne: render…/draw… se v 08, 09, 21, 22b obalují přiřazením (vypravěčské doplňky, líné části) */
};
const zpravy = linter.verify(
  text,
  [{plugins: {mm}, languageOptions: {ecmaVersion: "latest", sourceType: "script", globals: glob}, rules: pravidla}],
  {filename: "stranka.js"},
);

let chyb = 0;
for (const z of zpravy) {
  chyb++;
  console.log(`${kde(z.line)}  ${(z.ruleId || "syntaxe").replace(/^mm\//, "")}  ${z.message}`);
}

/* samostatné skripty: generátor obsahu (Node i prohlížeč vypravěče) a service worker */
const zakl = Object.fromEntries(Object.entries(pravidla).filter(([k]) => !k.startsWith("mm/")));
for (const [rel, gl] of [
  ["zdroj/generator.js", {...globals.node, ...globals.browser}],
  ["zdroj/sw.js", globals.serviceworker],
]) {
  for (const z of linter.verify(
    fs.readFileSync(path.join(KOREN, rel), "utf8"),
    [{languageOptions: {ecmaVersion: "latest", sourceType: "script", globals: gl}, rules: zakl}],
    {filename: rel},
  )) {
    chyb++;
    console.log(`${rel}:${z.line}  ${z.ruleId || "syntaxe"}  ${z.message}`);
  }
}

if (chyb) {
  console.log(`\nKontrola kódu: ${chyb} ${chyb === 1 ? "chyba" : chyb < 5 ? "chyby" : "chyb"}`);
  process.exit(1);
}
console.log(`Kontrola kódu: bez chyb (${mapa.length} řádků skriptu)`);
