// Načte čisté soubory pravidel (zdroj/web/js s „@čisté“ na 1. řádku) do prázdného kontextu Node – bez prohlížeče, bez jsdom,
// bez sestavení webu: za pár milisekund. Čisté soubory smí používat jen jazyk JS a jména jiných čistých souborů (hlídá
// npm run kontrola), takže tu běží stejně jako na stránce. Pořadí podle kostry zdroj/koruna.html.
//   import {ciste} from "./ciste.mjs";  const C = ciste();  C.ev("ucSecti([...])")  nebo  C.ev("ucSecti")(data)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function cisteSoubory() {
  const kostra = fs.readFileSync(path.join(KOREN, "zdroj", "koruna.html"), "utf8");
  return [...kostra.matchAll(/^\/\*@vloz (web\/js\/[^*]+\.js)\*\/$/gm)]
    .map(m => path.join(KOREN, "zdroj", m[1]))
    .filter(f => /@čisté/.test(fs.readFileSync(f, "utf8").split("\n")[0]));
}

export function ciste() {
  const ctx = vm.createContext({});
  for (const f of cisteSoubory()) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, {filename: path.relative(KOREN, f)});
  /* ev: výraz v kontextu čistých souborů (const/let nejsou vlastnosti kontextu, jen ve výrazu); hodnota se vrací přímo */
  /* V: totéž přes JSON – pole a objekty z jiného kontextu by deepStrictEqual neuznal (jiný Array.prototype) */
  const ev = s => vm.runInContext(s, ctx);
  return {ev, V: s => JSON.parse(JSON.stringify(ev(s)) ?? "null"), ctx};
}
