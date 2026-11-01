/* Relikty podle Vaesenu: každý relikt s polem Strach má i Nálady, Rozplynutí a obě verze Zažehnání. */
import {test} from "node:test";
import assert from "node:assert/strict";
import {readdirSync, readFileSync} from "node:fs";

const DIR = new URL("../../zdroj/obsah/protivnici/", import.meta.url);
const SLOZENE = ["upir", "strigoj", "vlkodlak", "hlineny-strazce", "famul", "dhampir", "varkolak", "drekavac"];

test("relikty podle Vaesenu mají všechna pole", () => {
  const nalezeno = new Set();
  for (const f of readdirSync(DIR).filter(x => x.endsWith(".md") && !x.startsWith("_"))) {
    const s = readFileSync(new URL(f, DIR), "utf8");
    const id = (s.match(/^id: (.+)$/m) || [])[1];
    if (!SLOZENE.includes(id)) continue;
    nalezeno.add(id);
    assert.match(s, /^stitky: .*\brelikt\b/m, `${id}: štítek relikt`);
    assert.match(s, /^zakon: \S/m, `${id}: zakon`);
    for (const pole of ["Zrodil ho", "Strach", "Nálady", "Rozplynutí", "Zažehnání – lidová verze", "Zažehnání – úplný obřad"])
      assert.ok(s.includes(`- **${pole}.**`), `${id}: chybí ${pole}`);
  }
  assert.equal(nalezeno.size, SLOZENE.length);
});
