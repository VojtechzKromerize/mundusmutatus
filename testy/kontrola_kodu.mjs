// Kontrola kódu webu za pár sekund (bez prohlížeče):  node testy/kontrola_kodu.mjs
// 1. Složí skript stránky tak, jak ho vidí prohlížeč (kostra zdroj/koruna.html + řádky /*@vloz web/js/…*/), a projde ho ESLintem:
//    zdvojená jména (zdvojená const shodí celý web, zdvojená function se tiše přepíše), neznámá jména (překlep = chyba až při kliknutí),
//    zdvojené klíče objektů, nedosažitelný kód. Chyby ukazuje v původním souboru a řádku.
// 2. Hlídá pravidlo z CLAUDE.md: jádro (01–09, 26) se stahuje samo a nesmí hned při načtení (na nejvyšší úrovni souboru)
//    volat funkce z dílů 10–25, které se stahují líně.
// 3. Vazby mezi soubory jako u modulů: zápis do cizí proměnné / přepsání cizí funkce jen u vědomě sdílených jmen (SDILENE,
//    OBALENE), žádné nepoužité definice, žádné čtení const/let před definicí při načtení.
// Orientace: --kde JMÉNO (kde je definované, kdo ho čte a zapisuje), --soubor NN (co soubor poskytuje a co používá odjinud).
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
/* ---- vazby mezi soubory („moduly bez přepisu“, 2026-10-21) ----
   Skript je jeden sdílený prostor; kontrola hlídá vazby jako moduly: zápis do proměnné jiného souboru a přepsání funkce
   jiného souboru jen u jmen níže (vědomě sdílený stav a obalené funkce), žádné nepoužité definice, žádné čtení const/let
   před jejich definicí při načtení. Mapa vazeb: --kde JMÉNO, --soubor NN (viz konec souboru). */
// sdílený stav: proměnné, do kterých zapisuje i jiný soubor než ten, který je definuje (nové přidávej s rozmyslem)
const SDILENE = new Set(
  "PG SG HRA BHLED bojHlasen BKON BODP BPLOS BKDO BPRAV BZAPT HODY KLOAD KADV KIMP KPOOLM BZAS BRIP KZFL KPRIP BTAB VY VYT VYS".split(" "),
);
// obalené funkce: jiný soubor je přepíše vlastní verzí (vypravěčské doplňky 09/21, líné části 22b, odkazy 08)
const OBALENE = new Set(
  "drawMap renderDetail updateRoute renderTravel pickPlace pDraw pmRender sDraw smRender renderDraco renderDruzina renderKronika renderRodArticle renderPersonArticle".split(
    " ",
  ),
);
const MAPA = new Map(); // jméno → {f, r, druh, ctou: Set, pisou: Set}
const mm = {
  rules: {
    vazby: {
      meta: {type: "problem", schema: []},
      create(ctx) {
        return {
          "Program:exit"(p) {
            const g = ctx.sourceCode.getScope(p);
            for (const v of g.variables) {
              if (!v.defs.length) continue;
              const d = v.defs[0],
                f = soubor(d.name.loc.start.line),
                druh = d.type === "Variable" ? d.parent.kind : d.type === "FunctionName" ? "function" : d.type;
              const o = {f, r: d.name.loc.start.line, druh, ctou: new Set(), pisou: new Set()};
              MAPA.set(v.name, o);
              for (const r of v.references) {
                const rf = soubor(r.identifier.loc.start.line);
                if (r.isRead()) o.ctou.add(rf);
                if (r.isWrite() && !r.init) {
                  o.pisou.add(rf);
                  if (rf !== f && !(druh === "function" ? OBALENE : SDILENE).has(v.name))
                    ctx.report({
                      node: r.identifier,
                      message:
                        druh === "function"
                          ? `přepisuje funkci ${v.name} ze souboru ${f} – pokud je to záměr (obalení), přidej ji do OBALENE v testy/kontrola_kodu.mjs`
                          : `zapisuje do proměnné ${v.name} ze souboru ${f} – zapiš přes funkci toho souboru, nebo ji vědomě přidej do SDILENE v testy/kontrola_kodu.mjs`,
                    });
                }
              }
              if (!v.references.some(r => r.isRead()) && f.startsWith("zdroj/web/js/"))
                ctx.report({node: d.name, message: `${v.name} se nikde nepoužívá – smaž ho (mrtvý kód)`});
            }
          },
        };
      },
    },
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
  "mm/vazby": "error",
  /* čtení const/let/class při načtení dřív, než je definované (i z dřívějšího souboru) = ReferenceError a prázdná stránka */
  "no-use-before-define": ["error", {functions: false, classes: false, variables: false}],
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

/* ---- mapa vazeb pro orientaci: node testy/kontrola_kodu.mjs --kde bojUtokPriprav | --soubor 20 ---- */
const kratce = f => f.replace("zdroj/web/js/", "").replace(/\.js$/, "");
const arg = (n, i = process.argv.indexOf(n)) => (i > 0 ? process.argv[i + 1] || "" : null);
if (arg("--kde") != null) {
  for (const jm of arg("--kde").split(",")) {
    const o = MAPA.get(jm);
    if (!o) {
      console.log(`${jm}: není definované na nejvyšší úrovni skriptu`);
      continue;
    }
    const jine = s => [...s].filter(x => x !== o.f).map(kratce);
    console.log(`${jm} (${o.druh})  ${kde(o.r)}`);
    console.log(`  čtou: ${jine(o.ctou).join(", ") || "jen vlastní soubor"}`);
    if (jine(o.pisou).length) console.log(`  zapisují: ${jine(o.pisou).join(", ")}`);
  }
  process.exit(0);
}
if (arg("--soubor") != null) {
  const q = arg("--soubor");
  const f = [...new Set(mapa.map(m => m[0]))].find(x => kratce(x).startsWith(q) || x === q);
  if (!f) {
    console.log(`soubor ${q} nenalezen`);
    process.exit(1);
  }
  const vlastni = [...MAPA].filter(([, o]) => o.f === f);
  const poskytuje = vlastni.filter(([, o]) => [...o.ctou].some(x => x !== f));
  console.log(`${kratce(f)}: ${vlastni.length} definic, z toho ${poskytuje.length} používají jiné soubory`);
  console.log(`  poskytuje: ${poskytuje.map(([n]) => n).join(" ")}`);
  const pouziva = new Map();
  for (const [n, o] of MAPA) if (o.f !== f && o.ctou.has(f)) pouziva.set(kratce(o.f), [...(pouziva.get(kratce(o.f)) || []), n]);
  console.log("  používá:");
  for (const [z, L] of [...pouziva].sort()) console.log(`    ${z}: ${L.join(" ")}`);
  process.exit(0);
}

/* ---- docs/MAPA.md a docs/SLOVNIK.md: npm run mapa (orientace pro další relace; generované, neupravovat ručně) ---- */
if (process.argv.includes("--mapa")) {
  const DOCS = path.join(KOREN, "docs");
  fs.mkdirSync(DOCS, {recursive: true});
  const soubory = [...new Set(mapa.map(m => m[0]))].filter(f => f.startsWith("zdroj/web/js/"));
  const zdroje = new Map(soubory.map(f => [f, fs.readFileSync(path.join(KOREN, f), "utf8").split("\n")]));
  const cisti = s =>
    s
      .replace(/^\s*\/\*+\s*[=-]*\s*/, "")
      .replace(/\s*[=-]*\s*\*+\/\s*$/, "")
      .replace(/\s*[=-]{3,}\s*$/, "")
      .replace(/^\s*\/\/\s*/, "")
      .trim();
  const hlavicka = f => {
    const r = zdroje.get(f)[0] || "";
    return /^\s*\/[/*]/.test(r) ? cisti(r) : "(bez hlavičky – doplň komentář na 1. řádek)";
  };
  const oddily = f =>
    zdroje
      .get(f)
      .map((r, i) => [r, i + 1])
      .filter(([r], i) => i > 0 && /^\/\* ?[=-]{3,}/.test(r) && !/^\/\*@/.test(r))
      .map(([r, i]) => [cisti(r).slice(0, 110), i]);
  const popisy = (() => {
    try {
      return JSON.parse(fs.readFileSync(path.join(DOCS, "slovnik.json"), "utf8"));
    } catch {
      return {};
    }
  })();

  /* mapa souborů */
  const M = [
    "# Mapa souborů skriptu",
    "",
    "Generuje `npm run mapa` (testy/kontrola_kodu.mjs --mapa) – **neupravuj ručně**, po větší změně obnov. Pořadí souborů = pořadí ve",
    "skriptu; jádro 01–09 + 26 se stahuje hned, díly 10–25 líně, části `02b 04b 05b 21 22b` až na své stránce (viz CLAUDE.md).",
    "Podrobnosti k jednomu jménu nebo souboru: `node testy/kontrola_kodu.mjs --kde JMÉNO` / `--soubor NN`.",
    "",
  ];
  const vsechDef = [...MAPA].filter(([, o]) => o.f.startsWith("zdroj/web/js/"));
  for (const f of soubory) {
    const vlastni = vsechDef.filter(([, o]) => o.f === f);
    const posk = vlastni.filter(([, o]) => [...o.ctou].some(x => x !== f));
    const pocetCtenaru = n => MAPA.get(n).ctou.size;
    const poskJm = posk.map(([n]) => n).sort((a, b) => pocetCtenaru(b) - pocetCtenaru(a) || a.localeCompare(b));
    const pouziva = new Map();
    for (const [n, o] of vsechDef) if (o.f !== f && o.ctou.has(f)) pouziva.set(kratce(o.f), (pouziva.get(kratce(o.f)) || 0) + 1);
    const pouzivaji = new Map();
    for (const [, o] of vlastni)
      for (const x of o.ctou) if (x !== f && x.startsWith("zdroj/web/js/")) pouzivaji.set(kratce(x), (pouzivaji.get(kratce(x)) || 0) + 1);
    const seznam = m =>
      [...m]
        .sort()
        .map(([k, v]) => `${k} (${v})`)
        .join(", ") || "–";
    M.push(`## ${kratce(f)}`, "", hlavicka(f), "");
    M.push(`- ${zdroje.get(f).length} řádků, ${vlastni.length} definic na nejvyšší úrovni, z toho ${posk.length} používají jiné soubory`);
    M.push(`- používá z: ${seznam(pouziva)}`);
    M.push(`- používají ho: ${seznam(pouzivaji)}`);
    M.push(`- poskytuje: ${poskJm.slice(0, 40).join(" ")}${poskJm.length > 40 ? ` … (+${poskJm.length - 40})` : ""}`);
    const od = oddily(f);
    if (od.length) M.push("- oddíly:", ...od.map(([t, i]) => `  - ř. ${i}: ${t}`));
    M.push("");
  }
  fs.writeFileSync(path.join(DOCS, "MAPA.md"), M.join("\n"));

  /* slovník zkratek a konstant */
  const S = [
    "# Slovník zkratek a globálních konstant",
    "",
    "Generuje `npm run mapa` – **neupravuj ručně**. Významy ručně psané jsou v `docs/slovnik.json` (jméno → význam; doplň, když něco",
    "rozluštíš); ostatní popisy bere skript z komentáře u definice (ⓐ) nebo z jejího začátku (ⓘ). Jen jména VELKÝMI písmeny;",
    "funkce a běžné proměnné najdeš `node testy/kontrola_kodu.mjs --kde JMÉNO` nebo grepem.",
    "",
    "| jméno | kde | druh | význam |",
    "|---|---|---|---|",
  ];
  const komentar = r => {
    const m = r.match(/\/\/\s*(.+?)\s*$/) || r.match(/\/\*\s*(?!@)(.+?)\s*\*\/\s*;?\s*$/);
    return m ? m[1] : "";
  };
  const popis = (n, o) => {
    if (popisy[n]) return popisy[n];
    const L = zdroje.get(o.f),
      i = (mapa[o.r - 1] || [0, 1])[1],
      r = L[i - 1] || "",
      pred = L[i - 2] || "";
    let k = komentar(r.replace(/^.*?\b(const|let|var|function|class)\s+\w+/, ""));
    if (!k && /^\s*(\/\/|\/\*)/.test(pred) && !/^\s*\/\*\s*[=-]{3,}/.test(pred) && !/^\s*\/\*@/.test(pred) && cisti(pred).length < 160)
      k = cisti(pred);
    if (k) return "ⓐ " + (k.length > 140 ? k.slice(0, 140) + "…" : k).replace(/\|/g, "\\|");
    const z = ((r.match(new RegExp("\\b" + n + "\\s*=\\s*(.*)")) || [])[1] || r).replace(/\/\*@\w+@\*\/\s*/, "").trim();
    return "ⓘ `" + z.slice(0, 70).replace(/\|/g, "\\|").replace(/`/g, "'") + (z.length > 70 ? "…" : "") + "`";
  };
  const velka = vsechDef.filter(([n]) => /^[A-Z][A-Z0-9_]+$/.test(n)).sort(([a], [b]) => a.localeCompare(b));
  for (const [n, o] of velka) S.push(`| \`${n}\` | ${kratce(o.f)}:${(mapa[o.r - 1] || [0, "?"])[1]} | ${o.druh} | ${popis(n, o)} |`);
  const chybi = velka.filter(([n]) => !popisy[n] && !popis(n, MAPA.get(n)).startsWith("ⓐ")).length;
  fs.writeFileSync(path.join(DOCS, "SLOVNIK.md"), S.join("\n") + "\n");
  console.log(`docs/MAPA.md (${soubory.length} souborů) a docs/SLOVNIK.md (${velka.length} jmen, ${chybi} bez komentáře i ručního významu)`);
  process.exit(0);
}

if (chyb) {
  console.log(`\nKontrola kódu: ${chyb} ${chyb === 1 ? "chyba" : chyb < 5 ? "chyby" : "chyb"}`);
  process.exit(1);
}
console.log(`Kontrola kódu: bez chyb (${mapa.length} řádků skriptu)`);
