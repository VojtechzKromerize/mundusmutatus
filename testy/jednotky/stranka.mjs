// Načte vypravěčskou statickou verzi webu (vypravec/index.html) do jsdom, aby šly volat funkce skriptu přímo z Node –
// bez prohlížeče, za pár sekund. Data z art/*.json čte fetch přímo z disku. Kostky jdou nastavit (kostky([…])).
// Sestaví vypravěčskou verzi, když chybí nebo je starší než zdroj (MM_VYPRAVEC=adresář přeskočí sestavení).
import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {JSDOM, VirtualConsole} from "jsdom";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function nejnovejsi(adr) {
  let t = 0;
  for (const f of fs.readdirSync(adr, {withFileTypes: true})) {
    const p = path.join(adr, f.name);
    t = Math.max(t, f.isDirectory() ? nejnovejsi(p) : fs.statSync(p).mtimeMs);
  }
  return t;
}

function vypravec() {
  if (process.env.MM_VYPRAVEC) return process.env.MM_VYPRAVEC;
  const adr = path.join(KOREN, "vypravec"),
    idx = path.join(adr, "index.html");
  const stary =
    !fs.existsSync(idx) ||
    fs.statSync(idx).mtimeMs < Math.max(nejnovejsi(path.join(KOREN, "zdroj", "web")), fs.statSync(path.join(KOREN, "zdroj", "koruna.html")).mtimeMs);
  if (stary) execFileSync("python3", [path.join(KOREN, "zdroj", "build.py"), "--vypravec", "--staticky"], {stdio: "ignore"});
  return adr;
}

/* jedna stránka pro všechny testy v souboru (načtení ~5 s) */
export async function stranka() {
  const adr = vypravec();
  const chyby = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", e => chyby.push(String((e && e.message) || e)));
  const dom = new JSDOM(fs.readFileSync(path.join(adr, "index.html"), "utf8"), {
    url: "http://localhost/#pravidla",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(w) {
      w.fetch = async u => {
        const rel = decodeURIComponent(
          String(u)
            .replace(/^https?:\/\/localhost\//, "")
            .split("?")[0],
        );
        const p = [path.join(adr, rel), path.join(KOREN, rel)].find(x => fs.existsSync(x) && fs.statSync(x).isFile());
        if (!p) return {ok: false, status: 404, json: async () => Promise.reject(new Error("404 " + rel)), text: async () => ""};
        const b = fs.readFileSync(p);
        return {ok: true, status: 200, json: async () => JSON.parse(b.toString("utf8")), text: async () => b.toString("utf8")};
      };
      w.matchMedia = () => ({matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}});
      w.scrollTo = () => {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
    },
  });
  await new Promise(r => setTimeout(r, 300));
  const w = dom.window;
  /* kostky: další hody padnou podle fronty – kostky([[20, 20], [3, 8]]) = na d20 padne 20, pak na d8 padne 3; pak zase náhodně.
     bK(s) = 1 + floor(random * s), takže pro číslo v na kostce s stačí random = (v - 0.5) / s */
  w.eval(`(()=>{const R=Math.random;window.__fronta=[];Math.random=()=>window.__fronta.length?window.__fronta.shift():R()})()`);
  const kostky = seznam => {
    w.__fronta = seznam.map(([v, s]) => (v - 0.5) / s);
  };
  return {w, chyby, kostky, ev: s => w.eval(s), zavri: () => w.close()};
}
