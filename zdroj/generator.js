/* Mundus Mutatus · generátor obsahu
   Z textových souborů (rody, osoby, vazby, Praha, místa, rodokmeny, Kronika, Družina, Draconomicon)
   vyrobí data webu. Stejný kód běží při sestavení (node, volá ho zdroj/build.py) i v prohlížeči
   vypravěče, když upraví text přímo na webu – proto existuje jen jednou.

   Hráčská data nesou „brány“ ({"$g": id, …}), podle nichž databáze (supabase/schema.sql, mm_orez)
   vyřízne, co družina nezná. Tajemství ⟦…⟧ se pro hráče odstraní, vypravěč je vidí. */
(function (koren) {
"use strict";

class ChybaObsahu extends Error {}
const fail = msg => { throw new ChybaObsahu(msg); };

/* ---------- Markdown s hlavičkou ---------- */
const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inline(t) {
  t = esc(t);
  t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  t = t.replace(/\*(.+?)\*/g, "<i>$1</i>");
  t = t.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return t;
}
const stripPipes = s => s.trim().replace(/^\|+/, "").replace(/\|+$/, "");
function md(body) {
  const out = [];
  for (const block of body.trim().split(/\n\s*\n/)) {
    const lines = block.trim().split("\n");
    if (lines.every(l => l.trim().startsWith("|"))) {
      const rows = lines.map(l => stripPipes(l).split("|").map(c => c.trim()));
      const sep = rows.length > 1 && rows[1].every(c => /^[-: ]*$/.test(c));
      const head = sep ? rows[0] : null, b = sep ? rows.slice(2) : rows;
      let t = '<div class="rtw"><table class="rtab">';
      if (head) t += "<thead><tr>" + head.map(c => `<th scope="col">${inline(c)}</th>`).join("") + "</tr></thead>";
      t += "<tbody>" + b.map(r => "<tr>" + r.map(c => `<td>${inline(c)}</td>`).join("") + "</tr>").join("") + "</tbody></table></div>";
      out.push(t);
    } else if (lines.every(l => /^\s*[-*] /.test(l))) {
      out.push("<ul>" + lines.map(l => "<li>" + inline(l.replace(/^\s+/, "").slice(2)) + "</li>").join("") + "</ul>");
    } else if (lines[0].startsWith("## ")) {
      out.push("<h3>" + inline(lines[0].slice(3)) + "</h3>" + (lines.length > 1 ? "<p>" + inline(lines.slice(1).join(" ")) + "</p>" : ""));
    } else {
      out.push("<p>" + inline(lines.map(l => l.trim()).join(" ")) + "</p>");
    }
  }
  return out.join("\n");
}
function parseHead(text, where) {
  const meta = {};
  let key = null;
  for (const line of text.split("\n")) {
    const ls = line.replace(/^\s+/, "");
    if (!line.trim() || ls.startsWith("#")) continue;
    if (ls.startsWith("- ") && key) {
      if (!Array.isArray(meta[key])) meta[key] = [];
      meta[key].push(ls.slice(2).trim());
      continue;
    }
    const i = line.indexOf(":");
    if (i < 0) fail(`${where}: nesrozumitelný řádek hlavičky: ${line.trim()}`);
    key = line.slice(0, i).trim();
    meta[key] = line.slice(i + 1).trim();
  }
  return meta;
}
const text = body => body.trim().replace(/\s*\n\s*/g, " ");
const lst = v => Array.isArray(v) ? v.map(x => x.trim()).filter(Boolean) : v ? v.split(",").map(x => x.trim()).filter(Boolean) : [];
const ANO = v => ["ano", "true", "1", "yes"].includes(String(v ?? "").trim().toLowerCase());
function num(v, where) {
  const s = String(v).replace(/,/g, ".").trim(), n = Number(s);
  if (s === "" || !isFinite(n)) fail(`${where}: „${v}“ není číslo`);
  return n;
}
const isDigit = s => /^\d+$/.test(String(s ?? "").trim());

/* ---------- výchozí stavy odhalení ---------- */
const UROVNE = { skryta: 0, "skrytá": 0, skryty: 0, "skrytý": 0, skryte: 0, "skryté": 0, "0": 0,
  slyseli: 1, "slyšeli": 1, "1": 1, potkali: 2, znaji: 2, "znají": 2, "2": 2 };

function generuj(soubory, manifest) {
  manifest = manifest || {};
  const SEED = {}, odstranene = [];
  const seed = (eid, meta, where) => {
    const v = String(meta.stav || "skryta").trim().toLowerCase();
    if (!(v in UROVNE)) fail(`${where}: stav musí být skryta / slyseli / potkali (je „${v}“)`);
    if (eid in SEED) fail(`${where}: id „${eid}“ už používá jiný rod, osoba nebo místo`);
    SEED[eid] = UROVNE[v];
  };
  const readDir = name => {
    const pre = name + "/", items = [];
    for (const path of Object.keys(soubory).filter(p => p.startsWith(pre) && !p.slice(pre.length).includes("/")).sort()) {
      const fn = path.slice(pre.length);
      if (!fn.endsWith(".md") || fn.startsWith("_")) continue;
      const raw = soubory[path].replace(/\r\n/g, "\n");
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!m) fail(`${name}/${fn}: chybí hlavička --- … ---`);
      const meta = parseHead(m[1], `${name}/${fn}`);
      meta._body = m[2]; meta._file = fn;
      items.push(meta);
    }
    return items;
  };
  const linesFile = name => {
    if (!(name in soubory)) fail(`chybí soubor ${name}`);
    const out = [];
    soubory[name].split("\n").forEach((line, i) => { if (line.trim().startsWith("- ")) out.push([i + 1, line.trim().slice(2).trim()]); });
    return out;
  };

  /* rody */
  const fam = [], short = {}, arms = {};
  for (const r of readDir("rody")) {
    const w = "rody/" + r._file;
    for (const k of ["id", "zeme", "nazev", "vyznani"]) if (!r[k]) fail(`${w}: chybí '${k}'`);
    const seats = [];
    for (const sd of (Array.isArray(r.sidla) ? r.sidla : [])) {
      const parts = sd.split("|").map(x => x.trim());
      if (parts.length < 3) fail(`${w}: sídlo „${sd}“ má mít tvar  název | délka | šířka`);
      const seat = [parts[0], num(parts[1], w), num(parts[2], w)];
      if (parts.length > 3 && parts[3]) seat.push(parts[3]);
      seats.push(seat);
    }
    const o = { id: r.id, land: r.zeme, name: r.nazev, conf: r.vyznani, head: r.hlava || "", seats, stance: r.postoj || "", pos: r.postaveni || "", hist: r.historie || "", note: text(r._body) };
    if (ANO(r.mesto)) o.city = true;
    if (ANO(r.soused)) o.nbr = true;
    if (ANO(r.nemapovat)) o.nomap = true;
    if (fam.some(f => f.id === o.id)) fail(`${w}: id „${o.id}“ už má jiný rod`);
    fam.push(o);
    seed(o.id, r, w);
    if (r.kratce) short[o.id] = r.kratce;
    const e = r.erb || o.id;
    if ((manifest.erby || {})[e]) arms[o.id] = manifest.erby[e];
  }
  const ids = new Set(fam.map(f => f.id));

  /* osoby */
  const people = [], osStat = [];
  for (const p of readDir("osoby")) {
    const w = "osoby/" + p._file;
    for (const k of ["id", "jmeno", "rod", "role"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    if (!ids.has(p.rod)) fail(`${w}: rod „${p.rod}“ neexistuje`);
    const o = { id: p.id, n: p.jmeno, r: p.rod, role: p.role };
    if (p.sidlo) o.seat = p.sidlo;
    o.x = text(p._body);
    if (people.some(q => q.id === o.id)) fail(`${w}: id „${o.id}“ už má jiná osoba`);
    seed(o.id, p, w);
    people.push(o);
    if (String(p.statblok || "").trim()) osStat.push({ id: o.id, n: o.n, r: o.r, s: String(p.statblok).trim(), w });
  }
  const pids = new Set(people.map(p => p.id)), prod = Object.fromEntries(people.map(p => [p.id, p.r]));

  /* rešerše postav (postavy-1458.json): narození a dosavadní život pro hráče, zbytek jen pro vypravěče */
  let resers = {};
  if ("postavy-1458.json" in soubory) {
    try { resers = JSON.parse(soubory["postavy-1458.json"]); } catch (e) { fail("postavy-1458.json: chybný zápis JSON – " + e.message); }
  }
  const RES = [];
  for (const [pid, r] of Object.entries(resers)) {
    const w = `postavy-1458.json, ${pid}`;
    if (!pids.has(pid)) fail(`${w}: osoba „${pid}“ neexistuje`);
    if (r.narozeni != null && !/^\d{4}(-\d{2}-\d{2})?$/.test(String(r.narozeni))) fail(`${w}: narozeni má tvar RRRR-MM-DD nebo RRRR`);
    const rok = r.narozeniRok != null ? parseInt(r.narozeniRok, 10) : (r.narozeni ? parseInt(String(r.narozeni).slice(0, 4), 10) : NaN);
    const o = people.find(q => q.id === pid);
    if (isFinite(rok)) o.nar = { d: /^\d{4}-\d{2}-\d{2}$/.test(String(r.narozeni || "")) ? String(r.narozeni) : "", r: rok, o: !!r.narozeniOdhad };
    if (r.shrnuti) o.sh = String(r.shrnuti);
    const g = r.gm || {}, t = { id: pid, po: g.poBreznu1458 || "", um: g.umrti || "", jis: r.jistota || "", roz: r.rozporSWebem || "", zak: r.zakladOdhadu || "",
      zdr: Array.isArray(r.zdroje) ? r.zdroje.filter(Boolean).map(String) : [] };
    for (const k of ["po", "roz", "zak"]) if (t[k]) odstranene.push(t[k]);
    RES.push({ $gm: true, ...t });
  }

  /* protivníci (bestiář pro tracker iniciativy) – celé jen pro vypravěče, hráči nedostanou nic.
     h = celý statblock (bestiář), b = verze pro boj: bez citátu, popisu (odstavce, které nezačínají tučným slovem)
     a bez výkupného a kořisti */
  const BEZ_BOJ = /^\*\*(Výkupné|Kořist)/;
  const mdBoj = body => md(body.trim().split(/\n\s*\n/).filter(bl => {
    const t = bl.trim();
    if (/^[|#]|^[-*] /.test(t)) return true;
    return t.startsWith("**") && !BEZ_BOJ.test(t);
  }).join("\n\n"));
  const PROT = [], UROVNE_P = ["houf", "pacholek", "sok", "zhoubce"];
  /* „Výdrž 2, Náboje 3“ → [{n, max}] */
  const zdroje = (v, w) => lst(v).map(x => {
    const m = x.match(/^(.*?)\s*(\d+)(\s*\/\s*den)?$/);
    if (!m || !m[1].trim()) fail(`${w}: zdroj „${x}“ má mít tvar  Název počet  (např. Výdrž 2)`);
    return { n: m[1].trim(), max: parseInt(m[2], 10) };
  });
  /* útok: „Název | +6 | 1d8+3 | poznámka“, „Název | AGI DC 15 | 2d8 Svaté“, u houfu „Název | +4 | 3 za pacholka | …“ */
  const utoky = (v, w) => (Array.isArray(v) ? v : v ? [v] : []).map(x => {
    const a = x.split("|").map(y => y.trim());
    if (a.length < 2 || !a[0]) fail(`${w}: útok „${x}“ má mít tvar  Název | +6 | 1d8+3 | poznámka`);
    const o = { n: a[0] }, b = a[1] || "", z = a[2] || "";
    const mb = b.match(/^([+-]\s*\d+)$/);
    if (mb) o.b = parseInt(mb[1].replace(/\s/g, ""), 10); else if (b) o.dc = b;
    const mz = z.match(/^(\d+)\s+za\s+(pacholka|každého|kus)/i);
    if (mz) { o.zp = parseInt(mz[1], 10); o.zt = z.slice(mz[0].length).trim(); }
    else { const md2 = z.match(/^(\d*d\d+(?:\s*[+-]\s*\d+)?)(.*)$/i); if (md2) { o.z = md2[1].replace(/\s/g, ""); o.zt = md2[2].trim(); } else if (z) o.zt = z; }
    if (a[3]) o.p = a.slice(3).join(" | ");
    return o;
  });
  const xpZ = v => { const m = String(v || "").replace(/\s/g, "").match(/(\d+)XP/i); return m ? parseInt(m[1], 10) : 0; };
  /* odstavec „**Výkupné a kořist.** …“ z textu – pro shrnutí po boji */
  const vykupne = body => { const bl = body.split(/\n\s*\n/).map(x => x.trim()).find(x => /^\*\*(Výkupné|Kořist)/.test(x)); return bl ? bl.replace(/^\*\*[^*]+\*\*\s*/, "").replace(/\s*\n\s*/g, " ") : ""; };
  for (const p of readDir("protivnici")) {
    const w = "protivnici/" + p._file;
    for (const k of ["id", "nazev", "uroven"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    const u = String(p.uroven).trim().toLowerCase();
    if (!UROVNE_P.includes(u)) fail(`${w}: uroven musí být houf / pacholek / sok / zhoubce (je „${p.uroven}“)`);
    if (PROT.some(q => q.id === p.id)) fail(`${w}: id „${p.id}“ už má jiný protivník`);
    /* hp: „75“ nebo „jezdec 45, dráček 68“ → [{n, max}] */
    const hp = String(p.hp || "").split(",").map(x => x.trim()).filter(Boolean).map(x => {
      const m = x.match(/^(.*?)(\d+)/);
      if (!m) fail(`${w}: hp „${x}“ má mít tvar  75  nebo  jezdec 45, dráček 68`);
      return { n: m[1].trim(), max: parseInt(m[2], 10) };
    });
    const o = { $gm: true, id: p.id, n: p.nazev, u, ac: p.ac || "", hp, ut: p.utok || "", poz: p.pozehnani || "", pok: p.pokuseni || "",
      kom: p.komplikace || "", ner: p.nerest || "", zak: p.zakon || "", vy: p.vyzva || "", h: md(p._body), b: mdBoj(p._body),
      at: utoky(p.utoky, w), zd: zdroje(p.zdroje, w), st: lst(p.stitky), xp: xpZ(p.vyzva), vk: vykupne(p._body) };
    if (/za\s+pacholka|za\s+kus/i.test(String(p.vyzva || ""))) o.xpp = 1;
    if (o.st.some(x => x.toLowerCase() === "relikt")) o.rel = 1; /* relikt: starší než Protržení, zažehnává se (bestiar/relikty.md) */
    { const im = (manifest.bestiar || {})[p.obrazek || p.id]; if (im) o.img = "art/bestiar/" + im + ".webp"; }
    if (p.vyznani) { if (!["kat", "kal", "old"].includes(p.vyznani)) fail(`${w}: vyznani je kat / kal / old`); o.vz = p.vyznani; }
    if (String(p.kriticka || "").trim().toLowerCase() === "drak") o.kd = 1;
    if (String(p.pocet || "").trim()) {
      o.poc = Math.round(num(p.pocet, w));
      if (o.poc < 1 || o.poc > 12) fail(`${w}: pocet má být 1 až 12`);
    }
    if (String(p.bonus || "").trim()) o.bon = Math.round(num(p.bonus, w));
    for (const k of ["ut", "poz", "pok", "kom", "ner", "h"]) if (o[k]) odstranene.push(o[k]);
    PROT.push(o);
  }
  const protIds = new Set(PROT.map(q => q.id));

  /* přívlastky: úpravy statblocku (Zkušený, Ve zbroji, Proměněnec…) – jen pro vypravěče */
  const PRIV = [];
  const plus = (v, w, k) => { const t = String(v || "").trim(); if (!t) return null; const m = t.match(/^([+-]?\d+)\s*(%?)$/); if (!m) fail(`${w}: ${k} má mít tvar  +2  nebo  +25%`); return { v: parseInt(m[1], 10), pr: !!m[2] }; };
  for (const p of readDir("privlastky")) {
    const w = "privlastky/" + p._file;
    for (const k of ["id", "nazev"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    if (PRIV.some(q => q.id === p.id)) fail(`${w}: id „${p.id}“ už má jiný přívlastek`);
    const pro = lst(p.pro).map(x => x.toLowerCase());
    for (const x of pro) if (!UROVNE_P.includes(x)) fail(`${w}: pro „${x}“ – možnosti jsou houf / pacholek / sok / zhoubce`);
    const o = { $gm: true, id: p.id, n: p.nazev, pro, ac: plus(p.ac, w, "ac"), hp: plus(p.hp, w, "hp"), ut: plus(p.utok, w, "utok"),
      zr: plus(p.zraneni, w, "zraneni"), xp: plus(p.xp, w, "xp"), zd: zdroje(p.zdroje, w), st: lst(p.stitky), h: md(p._body) };
    if (o.h) odstranene.push(o.h);
    PRIV.push(o);
  }
  const privIds = new Set(PRIV.map(q => q.id));
  /* „Jméno = 6 houf-zoldneru + zkuseny“ → {n, k, id, pr, os} (id je protivník, nebo osoba se statblokem) */
  const osById = Object.fromEntries(osStat.map(x => [x.id, x]));
  const radek = (x, w) => {
    let t = String(x).trim(), n = "";
    const i = t.indexOf("=");
    if (i > 0) { n = t.slice(0, i).trim(); t = t.slice(i + 1).trim(); }
    const parts = t.split("+").map(y => y.trim()).filter(Boolean);
    let hl = parts.shift() || "", k = 0;
    const mk = hl.match(/^(\d+)\s*[×x]?\s+(.+)$/);
    if (mk) { k = parseInt(mk[1], 10); hl = mk[2].trim(); }
    for (const pr of parts) if (!privIds.has(pr)) fail(`${w}: přívlastek „${pr}“ neexistuje`);
    if (protIds.has(hl)) return { n, k, id: hl, pr: parts };
    if (osById[hl]) return { n, k, os: hl, pr: parts };
    fail(`${w}: „${hl}“ není protivník ani osoba se statblokem`);
  };
  /* osoby se statblokem (pole statblok: v souboru osoby) – jen pro vypravěče */
  const PROTOS = osStat.map(x => {
    const r = radek(x.s, x.w);
    if (!r.id) fail(`${x.w}: statblok „${x.s}“ musí začínat id protivníka z bestiáře`);
    return { $gm: true, id: x.id, n: x.n, r: x.r, b: r.id, pr: r.pr };
  });
  /* hotová setkání (zdroj/obsah/setkani) – jen pro vypravěče */
  const SETK = [];
  for (const p of readDir("setkani")) {
    const w = "setkani/" + p._file;
    for (const k of ["id", "nazev"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    if (SETK.some(q => q.id === p.id)) fail(`${w}: id „${p.id}“ už má jiné setkání`);
    const np = (Array.isArray(p.nepratele) ? p.nepratele : lst(p.nepratele)).map(x => radek(x, w));
    if (!np.length) fail(`${w}: chybí nepratele (seznam řádků  - 6 houf-zoldneru)`);
    const o = { $gm: true, id: p.id, n: p.nazev, st: lst(p.stitky), np, h: md(p._body), x: text(p._body) };
    if (o.x) odstranene.push(o.x);
    SETK.push(o);
  }
  const setkIds = new Set(SETK.map(q => q.id));

  /* tabulky setkání Výpravy (vyprava-setkani.json) – jen pro vypravěče; sloupec b = setkání nebo seznam nepřátel */
  let VYZAZ = [];
  if ("vyprava-setkani.json" in soubory) {
    let t;
    try { t = JSON.parse(soubory["vyprava-setkani.json"]); } catch (e) { fail("vyprava-setkani.json: chybný zápis JSON – " + e.message); }
    if (!Array.isArray(t)) fail("vyprava-setkani.json: má to být seznam tabulek");
    VYZAZ = t.map((tab, i) => {
      if (!Array.isArray(tab)) fail(`vyprava-setkani.json: tabulka ${i + 1} má být seznam`);
      tab.forEach((z, j) => {
        const w = `vyprava-setkani.json, tabulka ${i + 1}, řádek ${j + 1}`;
        if (!z || !z.n) fail(`${w}: chybí n (název)`);
        if (z.b && !setkIds.has(z.b)) z.b.split(";").forEach(x => radek(x, w));
        odstranene.push(String(z.t || ""));
      });
      return { $gm: true, i, z: tab };
    });
  }

  /* Draconomicon */
  const kap = [];
  for (const k of readDir("draconomicon/kapitoly")) {
    if (!k.id || !k.title) fail(`draconomicon/kapitoly/${k._file}: chybí 'id' nebo 'title'`);
    kap.push({ id: k.id, t: k.title, h: md(k._body) });
  }
  const pl = [];
  for (const p of readDir("draconomicon/plemena")) {
    const w = "draconomicon/plemena/" + p._file;
    for (const k of ["id", "nazev", "trida"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    if (!["L", "S", "T"].includes(p.trida)) fail(`${w}: třída musí být L, S nebo T`);
    const img = (manifest.draci || {})[p.obrazek || p.id] || "";
    seed(p.id, p, w);
    pl.push({ id: p.id, n: p.nazev, j: p.jinak || "", la: p.latin || "", tr: p.trida, vz: p.vzacnost || "",
      rod: p.rod || "", pd: p.pridomek || "", mp: String(p.mapa || "").split(";").map(q => q.split(",").map(v => parseFloat(v))).filter(q => q.length === 2 && q.every(v => isFinite(v))), img, prof: ["kridla", "ocas", "stavba", "let", "schopnost"].map(k => p[k] || ""), h: md(p._body) });
  }
  { const dids = [...kap, ...pl].map(x => x.id).concat(["plemena"]);
    if (new Set(dids).size !== dids.length) fail("draconomicon: kapitoly a plemena musí mít různá id"); }

  /* vazby */
  const rel = [];
  for (const [i, line] of linesFile("vazby.md")) {
    const a = line.split("|"), parts = a.length > 3 ? [a[0], a[1], a.slice(2).join("|")].map(x => x.trim()) : a.map(x => x.trim());
    if (parts.length < 3) fail(`vazby.md, řádek ${i}: má mít tvar  - druh | rod, rod | text`);
    const kind = parts[0].split(/\s+/).filter(Boolean), secret = ["tajné", "tajne"].includes(kind[0]), t = kind[kind.length - 1];
    if (!["rod", "spoj", "spor"].includes(t)) fail(`vazby.md, řádek ${i}: neznámý druh „${t}“ (rod / spoj / spor)`);
    const rids = parts[1].split(",").map(x => x.trim()).filter(Boolean);
    for (const x of rids) if (!ids.has(x)) fail(`vazby.md, řádek ${i}: rod „${x}“ neexistuje`);
    const o = { t, ids: rids, x: parts[2] };
    if (secret) { odstranene.push(parts[2]); o.$gm = true; }
    rel.push(o);
  }

  /* Praha */
  const praha = [];
  for (const p of readDir("praha")) {
    const w = "praha/" + p._file;
    for (const k of ["cislo", "druh", "mesto", "nazev", "poloha"]) if (!p[k]) fail(`${w}: chybí '${k}'`);
    if (!["dvur", "urad", "cirkev", "hospoda", "anomalie"].includes(p.druh)) fail(`${w}: druh musí být dvur / urad / cirkev / hospoda / anomalie`);
    if (!["hrad", "mala", "stare", "nove", "vys", "okoli"].includes(p.mesto)) fail(`${w}: město musí být hrad / mala / stare / nove / vys / okoli`);
    const xy = p.poloha.split(",").map(v => num(v, w));
    const o = { n: parseInt(p.cislo, 10), k: p.druh, t: p.mesto, name: p.nazev, c: p.vyznani || "" };
    if (!isDigit(p.cislo)) fail(`${w}: „${p.cislo}“ není číslo`);
    if (p.rod) { if (!ids.has(p.rod)) fail(`${w}: rod „${p.rod}“ neexistuje`); o.r = p.rod; }
    if (p.osoba) { if (!pids.has(p.osoba)) fail(`${w}: osoba „${p.osoba}“ neexistuje`); o.p = p.osoba; }
    o.d = text(p._body);
    o.pos = xy;
    if (praha.some(q => q.n === o.n)) fail(`${w}: číslo ${o.n} už má jiné místo`);
    praha.push(o);
  }
  praha.sort((a, b) => a.n - b.n);

  /* objevená místa */
  const mista = [];
  for (const p of readDir("mista")) {
    const w = "mista/" + p._file;
    if (!p.name || p.lo == null || p.la == null || !isFinite(Number(p.lo)) || !isFinite(Number(p.la)) || String(p.lo).trim() === "" || String(p.la).trim() === "") fail(`${w}: potřebuje name, lo, la`);
    const o = { name: p.name, lo: Number(p.lo), la: Number(p.la), note: p.note || "", z: p.zapis || "" };
    o.id = p.id || "m-" + p._file.slice(0, -3).replace(/^\d+-/, "");
    seed(o.id, p, w);
    mista.push(o);
  }

  /* Kronika */
  const zapisy = [];
  for (const z of readDir("kronika")) {
    for (const k of ["id", "title", "date", "place"]) if (!z[k]) fail(`kronika/${z._file}: chybí '${k}'`);
    seed(z.id, z, "kronika/" + z._file);
    const hod = String(z.hodina ?? "").trim().split(":")[0];
    zapisy.push({ id: z.id, n: z.n || "", date: z.date, datum: z.datum || "", place: z.place,
      route: lst(z.route).length ? lst(z.route) : [z.place], title: z.title, text: md(z._body),
      praha: lst(z.praha).filter(isDigit).map(Number),
      druzina: isDigit(z.druzina) ? parseInt(String(z.druzina).trim(), 10) : null,
      hodina: isDigit(hod) ? parseInt(hod, 10) % 24 : null });
  }

  /* Družina */
  const party = [];
  for (const p of readDir("druzina")) {
    if (!p.id || !p.n) fail(`druzina/${p._file}: chybí 'id' nebo 'n'`);
    const o = { id: p.id, n: p.n };
    for (const k of ["epi", "cls", "faith", "origin", "img", "hrac", "vek", "cil"]) if (p[k]) o[k] = p[k];
    if (p.sv) o.sv = parseInt(p.sv, 10);
    o.ctn = lst(p.ctnosti); o.ner = lst(p.nerresti || p.neresti);
    o.ties = lst(p.vazby).filter(t => t.includes(":")).map(t => { const i = t.indexOf(":"); return [t.slice(0, i).trim(), t.slice(i + 1).trim()]; });
    o.x = md(p._body);
    party.push(o);
  }

  /* rodokmeny */
  let trees = {};
  if ("rodokmeny.json" in soubory) {
    try { trees = JSON.parse(soubory["rodokmeny.json"]); } catch (e) { fail("rodokmeny.json: chybný zápis JSON – " + e.message); }
  }

  /* ---------- brány ---------- */
  const pref = pid => ({ $g: [pid, prod[pid]], $x: pid });
  const rref = rid => ({ $g: rid, $x: rid });
  const F = fam.map(f => {
    /* „Slyšeli“: jméno, základní údaje a veřejně známá historie rodu; postoj ke králi a zápis kronikáře až „Potkali“ */
    const base = {}; for (const k in f) if (k !== "stance" && k !== "note") base[k] = f[k];
    Object.assign(base, { stance: "", note: "", sl: true });
    return { $g: f.id, ...base, $plne: { stance: f.stance, note: f.note, sl: false } };
  });
  const P = people.map(p => {
    const base = { id: p.id, n: p.n, r: p.r, role: p.role, x: "", sl: true }, plne = { x: p.x, sl: false };
    if (p.seat) plne.seat = p.seat;
    if (p.nar) plne.nar = p.nar;
    if (p.sh) plne.sh = p.sh;
    return { $g: p.r, $x: { $g: p.id, ...base, $plne: plne } };
  });
  const REL = rel.map(r => ({ $g: [...r.ids], ...r }));
  const PR = praha.map(q => { q = { ...q }; if ("r" in q) q.r = rref(q.r); if ("p" in q) q.p = pref(q.p); return q; });
  const MI = mista.map(m => ({ $g: m.id, id: m.id, name: m.name, lo: m.lo, la: m.la, note: "", z: "", $plne: { note: m.note, z: m.z } }));
  const tnode = (n, prvek, where) => {
    n = { ...n };
    for (const k of ["p", "pl"]) if (k in n && !pids.has(n[k])) fail(`rodokmeny.json, ${where}: osoba „${n[k]}“ neexistuje`);
    for (const k of ["r", "rl"]) if (k in n && !ids.has(n[k])) fail(`rodokmeny.json, ${where}: rod „${n[k]}“ neexistuje`);
    if ("pl" in n) n.pl = pref(n.pl);
    if ("r" in n) n.r = rref(n.r);
    if ("rl" in n) n.rl = rref(n.rl);
    for (const k of ["kids", "sp"]) if (k in n) n[k] = prvky(n[k], where);
    if ("p" in n) { if (prvek) n = { $g: [n.p, prod[n.p]], ...n }; else n.p = pref(n.p); }
    return n;
  };
  /* děti a manželé v rodokmenu: _i = pořadí v souboru (pro úpravy vypravěče); u osob ze Zemských desek
     navíc anonymní zástupce (duch) – hráč tak vidí, že tam někdo je, i když osobu ještě nezná */
  let slot = 0;
  const zena = n => { const w = String(n || "").replace(/^✦\s*/, "").split(/[\s(]/)[0]; return /[aeě]$/i.test(w) && !/^(Protiva|Ota)$/i.test(w); };
  const prvky = (arr, where) => arr.flatMap((c, i) => {
    const t = tnode(c, true, where); t._i = i;
    if (!c.p) return [t];
    const g = { duch: 1, slot: ++slot, _i: i, z: zena(c.n) ? 1 : 0 };
    if (c.m) g.m = c.m;
    t.slot = g.slot;
    return [g, t];
  });
  const T = {};
  for (const [rid, t0] of Object.entries(trees)) {
    if (!ids.has(rid)) fail(`rodokmeny.json: rod „${rid}“ neexistuje`);
    const t = { ...t0 };
    for (const k of ["root", "main"]) if (k in t) t[k] = tnode(t[k], false, rid);
    if ("kids" in t) t.kids = prvky(t.kids, rid);
    T[rid] = { $g: rid, $u: 2, $x: t };
  }
  const PL = pl.map(d => {
    const base = {}; for (const k in d) if (!["img", "prof", "h"].includes(k)) base[k] = d[k];
    Object.assign(base, { img: "", prof: ["", "", "", "", ""], h: "", sl: true });
    return { $g: d.id, ...base, $plne: { img: d.img, prof: d.prof, h: d.h, sl: false } };
  });
  const PORTR = {};
  for (const [pid, stem] of Object.entries(manifest.portrety || {})) if (pids.has(pid)) PORTR[pid] = { $g: prod[pid], $x: { $g: pid, $u: 2, $x: stem } };
  /* zeměpis: královská města a sídla církevních vrchností (bez brány – jsou na mapě vždy) */
  const ZEM = [];
  for (const f of fam) if (!f.nomap && (f.city || f.land === "Duchovenstvo"))
    for (const sd of f.seats) ZEM.push([sd[0], sd[1], sd[2], sd[3] || f.conf, f.city ? "mesto" : "cirkev"]);
  const odh = { DRACI: { kap, pl: PL }, ZEMEPIS: ZEM, FAM: F, PEOPLE: P, REL, PRAHA_PLACES: PR, MISTA: MI, TREES: T,
    SHORT: Object.fromEntries(Object.entries(short).map(([k, v]) => [k, { $g: k, $x: v }])),
    ARMS: Object.fromEntries(Object.entries(arms).map(([k, v]) => [k, { $g: k, $x: v }])),
    PORTR, ZAPISY: zapisy.map(z => ({ $g: z.id, ...z })), PARTY: party, RESERS: RES, PROTIVNICI: PROT,
    PRIVLASTKY: PRIV, SETKANI: SETK, PROTOSOBY: PROTOS, VYZAZ };
  return { odh, seed: SEED, odstranene };
}

/* ---------- tajemství, výřez ---------- */
const SECRET = /⟦([\s\S]*?)⟧/g;
function stripSecrets(s) {
  const removed = [];
  const t = s.replace(SECRET, (m, g) => { const i = g.indexOf("¦"); removed.push(i < 0 ? g : g.slice(0, i)); return i < 0 ? "" : g.slice(i + 1); });
  return [t, removed];
}
const showSecrets = s => s.replace(SECRET, (m, g) => { const i = g.indexOf("¦"); return i < 0 ? g : g.slice(0, i); });
function bezTajnych(j, gm) {
  if (Array.isArray(j)) return j.filter(v => gm || !(v && typeof v === "object" && !Array.isArray(v) && v.$gm)).map(v => bezTajnych(v, gm));
  if (j && typeof j === "object") { const o = {}; for (const k in j) if (k !== "$gm") o[k] = bezTajnych(j[k], gm); return o; }
  return j;
}
const ZMINKA = /(\[\[([?!]?)([A-Za-z0-9_-]+)\|([^\]|]*)(\|([^\]]*))?\]\])/g;
function zminky(t, st) {
  return t.replace(ZMINKA, (m, all, flag, eid, txt, g5, alt) => {
    const lv = st[eid] || 0;
    if (flag === "") return lv >= 1 ? `[[${eid}|${txt}]]` : (g5 !== undefined ? alt : txt);
    if (flag === "?") return lv >= 1 ? txt : (alt || "");
    return lv >= 2 ? txt : (alt || "");
  });
}
const VYNECH = Symbol("vynech");
function uroven(st, g) {
  if (st == null) return 2;
  const ids = Array.isArray(g) ? g : [g];
  return ids.length ? Math.min(...ids.map(i => st[i] || 0)) : 2;
}
function rozbal(j, st, texty = true) {
  const r = (v) => {
    if (Array.isArray(v)) { const out = []; for (const x of v) { const y = r(x); if (y !== VYNECH) out.push(y); } return out; }
    if (v && typeof v === "object") {
      if ("$g" in v) {
        const lv = uroven(st, v.$g);
        if (lv < parseInt(v.$u ?? 1, 10)) return VYNECH;
        if ("$x" in v) return r(v.$x);
        const plne = v.$plne; const o = {};
        for (const k in v) if (k !== "$g" && k !== "$u" && k !== "$plne") o[k] = v[k];
        if (plne && typeof plne === "object" && !Array.isArray(plne) && lv >= 2) Object.assign(o, plne);
        v = o;
      }
      const out = {}; for (const k in v) { const y = r(v[k]); if (y !== VYNECH) out[k] = y; } return out;
    }
    if (typeof v === "string" && texty && st != null && v.includes("[[")) return zminky(v, st);
    return v;
  };
  return r(j);
}
/* hráčská data s branami (pro databázi) a úplná data vypravěče */
function proHrace(odh) {
  const removed = [];
  const walk = v => {
    if (typeof v === "string") {
      if (!/[⟦⟧✦]/.test(v)) return v;
      const [t, r] = stripSecrets(v);
      removed.push(...r);
      const i = t.search(/[⟦⟧]/);
      if (i >= 0) fail(`neuzavřená značka tajemství ⟦ ⟧ v textu: „…${t.slice(Math.max(0, i - 50), i + 50)}…“`);
      return t.split("✦ ").join("").split("✦").join("");
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = walk(v[k]); return o; }
    return v;
  };
  return { hrac: bezTajnych(walk(odh), false), odstranene: removed };
}
const proGM = odh => rozbal(bezTajnych(JSON.parse(showSecrets(JSON.stringify(odh))), true), null, false);

const API = { generuj, proHrace, proGM, rozbal, zminky, md, parseHead, stripSecrets, showSecrets, ChybaObsahu };
if (typeof module !== "undefined" && module.exports) module.exports = API; else koren.mmGen = API;

/* příkazová řádka: node zdroj/generator.js < {"soubory":{…},"manifest":{…}}  →  {"hrac","gm","seed","odstranene"} */
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  let vstup = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", d => vstup += d);
  process.stdin.on("end", () => {
    try {
      const { soubory, manifest } = JSON.parse(vstup);
      const g = generuj(soubory, manifest), h = proHrace(g.odh);
      process.stdout.write(JSON.stringify({ hrac: h.hrac, gm: proGM(g.odh), seed: g.seed, odstranene: h.odstranene.concat(g.odstranene) }));
    } catch (e) {
      process.stderr.write(e instanceof ChybaObsahu ? e.message : (e.stack || String(e)));
      process.exit(e instanceof ChybaObsahu ? 2 : 1);
    }
  });
}
})(typeof globalThis !== "undefined" ? globalThis : this);
