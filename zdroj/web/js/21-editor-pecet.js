/* ===== Vypravěč: úpravy textů a obrázků přímo na webu =====
   Texty leží v databázi (tabulka zaznamy) ve stejné podobě jako soubory v zdroj/obsah. Po uložení
   prohlížeč vypravěče znovu vygeneruje obsah webu (zdroj/generator.js) a nahraje ho; hráčům se změna
   ukáže do půl minuty. Každá verze se pamatuje v historii. */
/*@cast editor{*/
const ED = {z: null, idx: null};
const EDDRUH = {
  osoba: {dir: "osoby", kl: "id", n: "Osoba", tpl: id => `---\nid: ${id}\njmeno: \nrod: \nrole: \nsidlo: \nstatblok: \n---\nKrátký popis osoby.\n`},
  rod: {
    dir: "rody",
    kl: "id",
    n: "Rod",
    tpl: id =>
      `---\nid: ${id}\nzeme: Čechy\nnazev: \nkratce: \nvyznani: kat\nhlava: \npostoj: \npostaveni: \nhistorie: \nsidla:\n  - Název | 14.42 | 50.09\n---\nZápis kronikáře o rodu.\n`,
  },
  zapis: {
    dir: "kronika",
    kl: "id",
    n: "Zápis Kroniky",
    tpl: id =>
      `---\nid: ${id}\nn: \ndatum: ${(HRA && HRA.datum) || "1458-03-03"}\ndate: ${partyDate()}\nhodina: ${HRA && HRA.hodina != null ? HRA.hodina : ""}\nplace: ${partyPlace() || "Praha"}\nroute: ${partyPlace() || "Praha"}\npraha: \ndruzina: \ntitle: \n---\nText zápisu. Odstavce odděluj prázdným řádkem.\n`,
  },
  drak: {
    dir: "draconomicon/plemena",
    kl: "id",
    n: "Dračí plemeno",
    tpl: id =>
      `---\nid: ${id}\nnazev: \njinak: \nlatin: \ntrida: S\nvzacnost: \nrod: \npridomek: \nmapa: \nkridla: \nocas: \nstavba: \nlet: \nschopnost: \n---\nPopis plemene.\n`,
  },
  kapitola: {dir: "draconomicon/kapitoly", kl: "id", n: "Kapitola Draconomiconu", tpl: id => `---\nid: ${id}\ntitle: \n---\nText kapitoly.\n`},
  misto: {dir: "mista", kl: "id", n: "Objevené místo", tpl: id => `---\nid: ${id}\nname: \nlo: 14.42\nla: 50.09\nnote: \nzapis: \n---\n`},
  praha: {
    dir: "praha",
    kl: "cislo",
    n: "Místo v Praze",
    tpl: id => `---\ncislo: ${id}\ndruh: dvur\nmesto: stare\nnazev: \npoloha: 500, 500\nvyznani: \nrod: \nosoba: \n---\nPopis místa.\n`,
  },
  protivnik: {
    dir: "protivnici",
    kl: "id",
    n: "Protivník",
    tpl: id =>
      `---\nid: ${id}\nnazev: \nuroven: sok\npocet: \nvyzva: \nac: \nhp: \nutok: \nbonus: \npozehnani: \npokuseni: \nkomplikace: \nnerest: \n---\n*„Citát z Kroniky.“*\n\nKrátký popis.\n\n**AC** · **HP** · **Rychlost** 30 stop\n\n| STR | AGI | CON | INT | WIS | CHA |\n|:-:|:-:|:-:|:-:|:-:|:-:|\n| 10 (+0) | 10 (+0) | 10 (+0) | 10 (+0) | 10 (+0) | 10 (+0) |\n\n## Akce (jedna v každém slotu)\n\n- **Útok.** Popis.\n`,
  },
  privlastek: {
    dir: "privlastky",
    kl: "id",
    n: "Přívlastek protivníka",
    tpl: id =>
      `---\nid: ${id}\nnazev: \npro: sok, zhoubce\nac: \nhp: \nutok: \nzraneni: \nxp: \nzdroje: \nstitky: \n---\n- **Nová vlastnost.** Co přívlastek přidá.\n`,
  },
  setkani: {
    dir: "setkani",
    kl: "id",
    n: "Hotové setkání",
    tpl: id => `---\nid: ${id}\nnazev: \nstitky: \nnepratele:\n  - 6 houf-zoldneru\n---\nSituace a taktika.\n`,
  },
  postava: {
    dir: "druzina",
    kl: "id",
    n: "Postava družiny",
    tpl: id => `---\nid: ${id}\nn: \nepi: \ncls: \nfaith: kal\norigin: \nimg: \nsv: 5\nctnosti: \nneresti: \nvazby: \n---\nPříběh postavy.\n`,
  },
};
const EDPOLE = {
  id: "Id (nelze měnit)",
  jmeno: "Jméno",
  rod: "Rod (id)",
  role: "Postavení",
  sidlo: "Sídlo",
  nazev: "Název",
  kratce: "Krátký název",
  zeme: "Země",
  vyznani: "Vyznání",
  hlava: "Hlava rodu",
  postoj: "Postoj",
  postaveni: "Postavení rodu (na vrcholu moci / v plné síle / na vzestupu / stabilní / v nesnázích / v úpadku)",
  historie: "Historie rodu (krátký odstavec)",
  mesto: "Město (ano / ne)",
  soused: "Sousední rod (ano / ne)",
  nemapovat: "Nezobrazovat na mapě (ano / ne)",
  sidla: "Sídla – „název | délka | šířka“, každé na nový řádek",
  erb: "Erb (název souboru)",
  n: "Označení",
  title: "Nadpis",
  datum: "Datum ve hře (RRRR-MM-DD)",
  date: "Datum slovy",
  hodina: "Hodina (0–23)",
  place: "Kde zápis končí",
  route: "Trasa (místa oddělená čárkou)",
  praha: "Místa v Praze (čísla, čárkami)",
  druzina: "Družina na plánu Prahy (číslo místa)",
  jinak: "Jinak zvaný",
  latin: "Latinsky",
  trida: "Třída (L / S / T)",
  vzacnost: "Vzácnost",
  pridomek: "Přídomek",
  kridla: "Křídla",
  ocas: "Ocas",
  stavba: "Stavba",
  let: "Let",
  schopnost: "Schopnost",
  obrazek: "Obrázek (název souboru)",
  mapa: "Výskyt na mapě světa – „délka, šířka“, více míst odděl středníkem",
  name: "Název",
  lo: "Zeměpisná délka",
  la: "Zeměpisná šířka",
  note: "Poznámka",
  zapis: "Zápis Kroniky (id)",
  cislo: "Číslo na plánu (nelze měnit)",
  druh: "Druh (dvur / urad / cirkev / hospoda / anomalie)",
  mesto_p: "Město",
  poloha: "Poloha na plánu (x, y)",
  osoba: "Osoba (id)",
  epi: "Přídomek",
  cls: "Povolání a úroveň",
  faith: "Vyznání (kal / kat / old)",
  origin: "Původ",
  img: "Portrét (adresa obrázku)",
  sv: "Svědomí (0–10)",
  ctnosti: "Ctnosti (čárkami)",
  neresti: "Neřesti (čárkami)",
  nerresti: "Neřesti (čárkami)",
  vazby: "Vazby na rody (rod: popis, …)",
  uroven: "Úroveň (houf / pacholek / sok / zhoubce)",
  pocet: "Počet v houfu (1–12)",
  vyzva: "Výzva",
  ac: "AC",
  hp: "HP (např. 75, nebo jezdec 45, dráček 68)",
  utok: "Útok – krátce (u přívlastku přídavek k útoku, např. +1)",
  bonus: "Útočný bonus houfu (základ)",
  pozehnani: "Závoj: Požehnání",
  pokuseni: "Závoj: Pokušení",
  komplikace: "Komplikace pro útočníka (houfy)",
  nerest: "Neřest / slabina",
  zakon: "Zákon relikta (krátce; u relikta dej do štítků „relikt“)",
  utoky: "Útoky na kliknutí – „Název | +6 | 1d8+3 Slashing | poznámka“, u houfu „| 3 za pacholka …“, záchrana „| AGI DC 15 | 2d8 Fire“",
  zdroje: "Zdroje k odškrtávání (Výdrž 2, Náboje 3, …)",
  stitky: "Štítky pro hledání (kraj, frakce, prostředí – čárkami)",
  kriticka: "Kritická zranění (drak = dračí tabulka)",
  pro: "Pro (houf, sok, zhoubce)",
  zraneni: "Zranění (+2)",
  xp: "XP (+30%)",
  nepratele: "Nepřátelé – řádek „[Jméno = ][počet ]id [+ přívlastek]“",
  statblok: "Statblock v boji (id protivníka [+ přívlastek], jen vypravěč)",
};
const EDDLOUHE = new Set(["hlava", "postoj", "historie", "note", "schopnost", "role", "utok", "pozehnani", "pokuseni", "komplikace", "nerest"]);
const edEsc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
function edRozloz(md) {
  const m = String(md)
    .replace(/\r\n/g, "\n")
    .match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? {head: m[1].split("\n"), body: m[2]} : null;
}
function edPole(lines) {
  const out = [];
  let cur = null;
  lines.forEach((line, i) => {
    const ls = line.replace(/^\s+/, "");
    if (!line.trim() || ls.startsWith("#")) return;
    if (ls.startsWith("- ") && cur) {
      if (!Array.isArray(cur.v)) cur.v = [];
      cur.v.push(ls.slice(2).trim());
      cur.end = i;
      return;
    }
    const j = line.indexOf(":");
    if (j < 0) return;
    cur = {k: line.slice(0, j).trim(), v: line.slice(j + 1).trim(), i, end: i};
    out.push(cur);
  });
  return out;
}
function edSloz(orig, vals, body) {
  const p = edRozloz(orig) || {head: [], body: ""},
    lines = p.head.slice(),
    pole = edPole(lines),
    done = new Set();
  const rad = (k, v) => (Array.isArray(v) ? [`${k}:`, ...v.map(x => `  - ${x}`)] : [`${k}: ${v}`]);
  [...pole].reverse().forEach(f => {
    if (!(f.k in vals)) return;
    done.add(f.k);
    lines.splice(f.i, f.end - f.i + 1, ...rad(f.k, vals[f.k]));
  });
  for (const k in vals) {
    if (done.has(k)) continue;
    const v = vals[k];
    if (Array.isArray(v) ? !v.length : v === "") continue;
    lines.push(...rad(k, v));
  }
  return `---\n${lines.join("\n")}\n---\n${String(body).replace(/\s+$/, "")}\n`;
}
function edGen() {
  return window.mmGen
    ? Promise.resolve()
    : new Promise((ok, ko) => {
        const s = document.createElement("script");
        s.src = `v/generator-${MMDB.cfg.gen}.js`;
        s.onload = ok;
        s.onerror = () => ko(new Error("Nepodařilo se načíst generátor obsahu."));
        document.head.appendChild(s);
      });
}
async function edNacti() {
  if (!ED.z) {
    ED.z = (await MMDB.zaznamy()) || {};
    ED.idx = null;
  }
  return ED.z;
}
function edIndex() {
  if (ED.idx) return ED.idx;
  const idx = {};
  for (const [soub, md] of Object.entries(ED.z || {}))
    for (const [druh, d] of Object.entries(EDDRUH)) {
      if (!soub.startsWith(d.dir + "/") || soub.slice(d.dir.length + 1).includes("/")) continue;
      const p = edRozloz(md);
      if (!p) continue;
      const f = edPole(p.head).find(x => x.k === d.kl);
      let id = f && !Array.isArray(f.v) ? f.v : "";
      if (druh === "misto" && !id) id = "m-" + soub.split("/").pop().slice(0, -3).replace(/^\d+-/, "");
      if (id) idx[druh + ":" + id] = soub;
    }
  return (ED.idx = idx);
}
const edManifest = () => __D.MANIFEST || {erby: {}, portrety: {}, draci: {}, bestiar: {}};
function edGeneruj(z, man) {
  let g;
  try {
    g = mmGen.generuj(z, man || edManifest());
  } catch (e) {
    throw new Error(e.message);
  }
  const h = mmGen.proHrace(g.odh);
  if (/[\u27E6\u27E7]/.test(JSON.stringify(h.hrac)))
    throw new Error("Neuzavřená značka tajemství \u27E6 \u27E7 – zkontrolujte, že každé \u27E6 má svoje \u27E7.");
  return {g, h};
}
async function edPublikuj(r, man) {
  const gm = Object.assign({}, window.__GMRAW || {}, mmGen.proGM(r.g.odh), {MANIFEST: man || edManifest()});
  const vetve = [MMDB.vetev];
  try {
    ((await MMDB.obsahVetve()) || []).forEach(x => {
      if (x.gen && x.gen === MMDB.cfg.gen && !vetve.includes(x.vetev)) vetve.push(x.vetev);
    });
  } catch (e) {}
  for (const v of vetve) await MMDB.ulozObsah(v, r.h.hrac, gm, r.g.seed);
}
function edObnov(t) {
  try {
    sessionStorage.setItem("mm-obnova", JSON.stringify({h: location.hash, y: scrollY, t}));
  } catch (e) {}
  location.reload();
}
async function edUloz(soubor, md, puvodni, zprava) {
  await edGen();
  await edNacti();
  const z = Object.assign({}, ED.z, {[soubor]: md}),
    r = edGeneruj(z);
  await MMDB.ulozZaznam(soubor, md, puvodni);
  ED.z = z;
  ED.idx = null;
  await edPublikuj(r);
  edObnov(zprava || "Uloženo. Hráči změnu uvidí do půl minuty.");
}
async function edSmaz(soubor) {
  await edGen();
  await edNacti();
  const z = Object.assign({}, ED.z);
  delete z[soubor];
  const r = edGeneruj(z);
  await MMDB.smazZaznam(soubor);
  ED.z = z;
  ED.idx = null;
  await edPublikuj(r);
  edObnov("Smazáno. Předchozí verze zůstává v historii.");
}

/* --- okno editoru --- */
let edLast = null;
document.addEventListener("focusin", e => {
  if (e.target.closest && e.target.closest(".edbox") && e.target.matches("input[type=text],input:not([type]),textarea")) edLast = e.target;
});
function edZavri() {
  const o = document.getElementById("edov");
  if (o) o.remove();
  document.body.classList.remove("edopen");
}
function edOkno(titul, obsah) {
  edZavri();
  const o = document.createElement("div");
  o.id = "edov";
  o.className = "edov";
  o.innerHTML = `<div class="edbox" role="dialog" aria-modal="true" aria-label="${edEsc(titul)}"><div class="edhd"><b>${edEsc(titul)}</b><button type="button" class="edx" data-edzavri aria-label="Zavřít">×</button></div>${obsah}</div>`;
  document.body.appendChild(o);
  document.body.classList.add("edopen");
  o.addEventListener("click", e => {
    if (e.target === o || e.target.closest("[data-edzavri]")) edZavri();
  });
  o.addEventListener("keydown", e => {
    if (e.key === "Escape") edZavri();
  });
  const f = o.querySelector("input:not([readonly]),textarea");
  if (f) f.focus();
  return o;
}
const edChyba = (o, t) => {
  const e = o.querySelector(".ederr");
  if (e) e.textContent = t;
  else mmHlasG(t, 8000);
};
const edBusy = (o, b) => {
  o.querySelectorAll("button").forEach(x => (x.disabled = b));
  document.documentElement.classList.toggle("gmbusy", b);
};
async function edOtevri(druh, id, novy) {
  if (!window.MMDB) {
    mmHlasG("Upravovat lze jen na webu napojeném na databázi.");
    return;
  }
  try {
    await edNacti();
  } catch (e) {
    mmHlasG("Texty se nepodařilo načíst: " + e.message, 7000);
    return;
  }
  const d = EDDRUH[druh];
  let soubor = novy ? null : edIndex()[druh + ":" + id],
    md;
  if (novy) {
    const ex = Object.keys(ED.z).filter(k => k.startsWith(d.dir + "/")),
      nums = ex.map(k => parseInt(k.split("/").pop(), 10)).filter(n => !isNaN(n)),
      w = ex.length ? (ex[0].split("/").pop().match(/^\d+/) || ["000"])[0].length : 3;
    soubor = `${d.dir}/${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(Math.max(2, w), "0")}-${id}.md`;
    md = d.tpl(id);
  } else {
    if (!soubor) {
      mmHlasG("Text tohoto záznamu v databázi chybí. Zkontrolujte, že proběhlo sestavení s databází.", 8000);
      return;
    }
    md = ED.z[soubor];
  }
  const p = edRozloz(md);
  if (!p) {
    edRaw(soubor, "Úprava: " + soubor);
    return;
  }
  const pole = edPole(p.head).filter(f => f.k !== "stav"),
    klid = d.kl;
  const fld = f => {
    const lab = EDPOLE[druh === "praha" && f.k === "mesto" ? "mesto_p" : f.k] || f.k,
      ro = f.k === klid && !novy;
    if (Array.isArray(f.v) || f.k === "sidla")
      return `<label class="edf edfull">${edEsc(lab)}<textarea name="f_${f.k}" rows="${Math.max(2, (Array.isArray(f.v) ? f.v.length : 1) + 1)}" data-seznam>${edEsc(Array.isArray(f.v) ? f.v.join("\n") : f.v)}</textarea></label>`;
    if (EDDLOUHE.has(f.k) || f.v.length > 70)
      return `<label class="edf edfull">${edEsc(lab)}<textarea name="f_${f.k}" rows="2">${edEsc(f.v)}</textarea></label>`;
    return `<label class="edf">${edEsc(lab)}<input name="f_${f.k}" value="${edEsc(f.v)}"${ro ? " readonly" : ""}></label>`;
  };
  const obr = {
    osoba: ["portrety", "Nahrát portrét"],
    rod: ["erby", "Nahrát erb"],
    drak: ["draci", "Nahrát obrázek"],
    postava: ["postava", "Nahrát portrét"],
  }[druh];
  const o = edOkno(
    `${novy ? "Nový záznam" : "Úprava"}: ${d.n}${id ? " · " + id : ""}`,
    `
    <div class="edtools"><button type="button" class="gbtn ghost" data-edtaj title="Označený text zabalí do \u27E6 \u27E7 – hráči ho neuvidí">\u27E6 \u27E7 Tajné</button>
      ${obr ? `<label class="gbtn ghost edup">${obr[1]}<input type="file" accept="image/*" data-edobr="${obr[0]}" hidden></label>` : ""}
      ${novy ? "" : `<button type="button" class="gbtn ghost" data-edhist>Historie</button><button type="button" class="gbtn ghost" data-edraw>Upravit jako text</button><button type="button" class="gbtn ghost edsmaz" data-edsmaz>Smazat</button>`}</div>
    <form class="edform"><div class="edgrid">${pole.map(fld).join("")}</div>
      <label class="edf edfull">Text <small>(odstavce prázdným řádkem, **tučně**, *kurzíva*, \u27E6tajné\u27E7, zmínka [[id|jméno]])</small><textarea name="f__body" rows="12">${edEsc(p.body.replace(/\s+$/, ""))}</textarea></label>
      <p class="rsmall">Soubor: ${edEsc(soubor)}${novy ? " · nový záznam je pro hráče skrytý, dokud ho neodhalíš" : ""}</p>
      <p class="ederr" role="alert"></p>
      <div class="edbtns"><button type="submit" class="gbtn">Uložit</button><button type="button" class="gbtn ghost" data-edzavri>Zrušit</button></div></form>`,
  );
  o.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    const F = e.target,
      vals = {};
    pole.forEach(f => {
      const el = F.elements["f_" + f.k];
      if (!el) return;
      vals[f.k] = el.hasAttribute("data-seznam")
        ? el.value
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean)
        : el.value.replace(/\s*\n\s*/g, " ").trim();
    });
    const nmd = edSloz(md, vals, F.elements.f__body.value);
    if (nmd === md && !novy) {
      edZavri();
      return;
    }
    edBusy(o, true);
    if (druh === "zapis")
      try {
        await zapisDoHry(vals);
      } catch (err) {}
    try {
      await edUloz(soubor, nmd, novy ? null : md);
    } catch (err) {
      edBusy(o, false);
      edChyba(o, err.message);
    }
  });
  o.querySelector("[data-edtaj]").addEventListener("click", () => {
    const t = edLast && o.contains(edLast) ? edLast : o.querySelector("textarea[name=f__body]");
    const a = t.selectionStart ?? t.value.length,
      b = t.selectionEnd ?? a;
    t.value = t.value.slice(0, a) + "\u27E6" + t.value.slice(a, b) + "\u27E7" + t.value.slice(b);
    t.focus();
    t.setSelectionRange(a + 1, b + 1);
  });
  const hb = o.querySelector("[data-edhist]");
  if (hb) hb.addEventListener("click", () => edHistorie(soubor));
  const rb = o.querySelector("[data-edraw]");
  if (rb) rb.addEventListener("click", () => edRaw(soubor, "Úprava jako text: " + soubor));
  const sb = o.querySelector("[data-edsmaz]");
  if (sb)
    sb.addEventListener("click", async () => {
      if (!confirm("Opravdu smazat tento záznam? Předchozí verze zůstane v historii.")) return;
      edBusy(o, true);
      try {
        await edSmaz(soubor);
      } catch (err) {
        edBusy(o, false);
        edChyba(o, err.message);
      }
    });
  const up = o.querySelector("[data-edobr]");
  if (up)
    up.addEventListener("change", async () => {
      const file = up.files[0];
      if (!file) return;
      edBusy(o, true);
      try {
        const url = await edNahrajObrazek(up.dataset.edobr, id, file);
        if (up.dataset.edobr === "postava") {
          const i = o.querySelector("[name=f_img]");
          if (i) i.value = url;
          edBusy(o, false);
          mmHlasG("Portrét nahrán – nezapomeň uložit.");
        }
      } catch (err) {
        edBusy(o, false);
        edChyba(o, err.message);
      }
    });
}
function edRaw(soubor, titul, uprav) {
  const md = ED.z[soubor] ?? "";
  const o = edOkno(
    titul,
    `<form class="edform"><label class="edf edfull">Celý text souboru<textarea name="raw" rows="22" spellcheck="false" class="edmono">${edEsc(uprav ? uprav.zobraz : md)}</textarea></label>
    <p class="ederr" role="alert"></p><div class="edbtns"><button type="submit" class="gbtn">Uložit</button>${uprav ? "" : `<button type="button" class="gbtn ghost" data-edhist>Historie</button>`}<button type="button" class="gbtn ghost" data-edzavri>Zrušit</button>${!uprav && soubor.endsWith(".md") && soubor !== "vazby.md" ? `<button type="button" class="gbtn ghost edsmaz" data-edsmazraw>Smazat soubor</button>` : ""}</div></form>`,
  );
  const sr = o.querySelector("[data-edsmazraw]");
  if (sr)
    sr.addEventListener("click", async () => {
      if (!confirm("Smazat celý soubor? Předchozí verze zůstane v historii.")) return;
      edBusy(o, true);
      try {
        await edSmaz(soubor);
      } catch (err) {
        edBusy(o, false);
        edChyba(o, err.message);
      }
    });
  o.querySelector("form").addEventListener("submit", async e => {
    e.preventDefault();
    let t = e.target.elements.raw.value;
    try {
      if (uprav) t = uprav.sloz(t);
      else if (soubor.endsWith(".md") && !t.endsWith("\n")) t += "\n";
    } catch (err) {
      edChyba(o, err.message);
      return;
    }
    if (t === md) {
      edZavri();
      return;
    }
    edBusy(o, true);
    try {
      await edUloz(soubor, t, md);
    } catch (err) {
      edBusy(o, false);
      edChyba(o, err.message);
    }
  });
  const hb = o.querySelector("[data-edhist]");
  if (hb) hb.addEventListener("click", () => edHistorie(soubor));
}
async function edStrom(rid) {
  await edNacti();
  const soubor = "rodokmeny.json";
  let T = {};
  try {
    T = JSON.parse(ED.z[soubor] || "{}");
  } catch (e) {}
  const t = T[rid] || {root: {n: "", note: ""}, main: {n: "", d: "", sp: [{n: "", note: ""}]}, kids: [{n: "", d: ""}]};
  edRaw(soubor, `Rodokmen: ${(byId[rid] || {}).name || rid}`, {
    zobraz: JSON.stringify(t, null, 2),
    sloz: txt => {
      let n;
      try {
        n = JSON.parse(txt);
      } catch (e) {
        throw new Error("Chybný zápis JSON: " + e.message);
      }
      const X = JSON.parse(ED.z[soubor] || "{}");
      X[rid] = n;
      return (
        "{\n" +
        Object.keys(X)
          .map(k => " " + JSON.stringify(k) + ": " + JSON.stringify(X[k]))
          .join(",\n") +
        "\n}\n"
      );
    },
  });
  const o = document.getElementById("edov");
  if (o)
    o.querySelector("form").insertAdjacentHTML(
      "afterbegin",
      `<p class="rsmall">Rodokmen ve formátu JSON. root = předek, main = hlava rodu (sp = manželky), kids = děti. p = id osoby, r/rl = id rodu, pl = id manžela/manželky, d = data, m = z kterého manželství, note = poznámka.</p>`,
    );
}
async function edHistorie(soubor) {
  let h;
  try {
    h = (await MMDB.historie(soubor)) || [];
  } catch (e) {
    mmHlasG("Historii se nepodařilo načíst: " + e.message, 7000);
    return;
  }
  const o = edOkno(
    "Historie: " + soubor,
    `<ol class="edhist">${
      h
        .map(
          (x, i) => `<li><div class="edhr"><b>${new Date(x.kdy).toLocaleString("cs-CZ")}</b><span>${edEsc(x.akce)}</span>
      <button type="button" class="gbtn ghost" data-hv="${i}">Zobrazit</button>${x.md != null && x.md !== ED.z[soubor] ? `<button type="button" class="gbtn ghost" data-ho="${i}">Obnovit tuto verzi</button>` : ""}</div><pre class="edpre" hidden>${edEsc(x.md ?? "")}</pre></li>`,
        )
        .join("") || "<li>Zatím žádné verze.</li>"
    }</ol><p class="ederr" role="alert"></p>`,
  );
  o.addEventListener("click", async e => {
    const v = e.target.closest("[data-hv]");
    if (v) {
      const pre = v.closest("li").querySelector("pre");
      pre.hidden = !pre.hidden;
      return;
    }
    const r = e.target.closest("[data-ho]");
    if (r) {
      if (!confirm("Obnovit tuto verzi? Současný text zůstane v historii.")) return;
      edBusy(o, true);
      try {
        await edNacti();
        await edUloz(soubor, h[+r.dataset.ho].md, ED.z[soubor] ?? null, "Obnovena starší verze.");
      } catch (err) {
        edBusy(o, false);
        edChyba(o, err.message);
      }
    }
  });
}
/* --- obrázky: zmenšení v prohlížeči a nahrání do úložiště --- */
function edKresli(file, W, H, rez) {
  return new Promise((ok, ko) => {
    const img = new Image(),
      u = URL.createObjectURL(file);
    img.onload = () => {
      const w = img.naturalWidth,
        h = img.naturalHeight;
      let sx = 0,
        sy = 0,
        sw = w,
        sh = h,
        dw = W,
        dh = H,
        dx = 0,
        dy = 0;
      if (rez === "sirka") {
        dw = Math.min(W, w);
        dh = Math.round((h * dw) / w);
      } else if (rez === "ctverec") {
        const s = Math.min(w, h);
        sw = sh = s;
        sx = (w - s) / 2;
        sy = h > w ? Math.min(h * 0.04, h - s) : (h - s) / 2;
      } else if (rez === "pokryt") {
        const k = Math.max(W / w, H / h);
        sw = W / k;
        sh = H / k;
        sx = (w - sw) / 2;
        sy = (h - sh) / 2;
      } else {
        const k = Math.min(W / w, H / h);
        dw = w * k;
        dh = h * k;
        dx = (W - dw) / 2;
        dy = (H - dh) / 2;
      }
      const c = document.createElement("canvas");
      c.width = rez === "sirka" ? dw : W;
      c.height = rez === "sirka" ? dh : H;
      c.getContext("2d").drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      URL.revokeObjectURL(u);
      c.toBlob(b => (b ? ok(b) : ko(new Error("Obrázek se nepodařilo zpracovat."))), "image/webp", 0.86);
    };
    img.onerror = () => {
      URL.revokeObjectURL(u);
      ko(new Error("Vybraný soubor není obrázek."));
    };
    img.src = u;
  });
}
const edNahodne = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 24);
async function edNahrajObrazek(typ, id, file) {
  const r = edNahodne(),
    ext = b => (b.type === "image/webp" ? "webp" : "jpg"),
    up = async (sfx, b) => MMDB.nahrajObrazek(`${typ[0]}/${r}${sfx}.${ext(b)}`, b);
  if (typ === "postava") return up("", await edKresli(file, 600, 1500, "sirka"));
  let hod;
  if (typ === "portrety")
    hod = {f: await up("", await edKresli(file, 600, 1500, "sirka")), m: await up("-m", await edKresli(file, 240, 240, "ctverec"))};
  else if (typ === "erby")
    hod = {s: await up("", await edKresli(file, 240, 240, "vejit")), v: await up("-v", await edKresli(file, 480, 480, "vejit"))};
  else {
    const klic = (edPole((edRozloz(ED.z[edIndex()["drak:" + id]] || "") || {head: []}).head).find(f => f.k === "obrazek") || {}).v || id;
    hod = {
      f: await up("", await edKresli(file, 1200, 800, "pokryt")),
      h: await up("-h", await edKresli(file, 480, 320, "pokryt")),
      m: await up("-m", await edKresli(file, 480, 320, "pokryt")),
    };
    id = klic;
  }
  const klic =
    typ === "erby" ? (edPole((edRozloz(ED.z[edIndex()["rod:" + id]] || "") || {head: []}).head).find(f => f.k === "erb") || {}).v || id : id;
  const vse = await MMDB.nastavObrazek(typ, klic, hod);
  const man = edManifest();
  man[typ] = Object.assign({}, man[typ] || {}, (vse || {})[typ] || {[klic]: hod});
  await edGen();
  await edNacti();
  await edPublikuj(edGeneruj(ED.z, man), man);
  edObnov("Obrázek nahrán.");
}
/* --- tlačítka na stránkách --- */
if (GMV && window.MMDB) {
  const tl = (druh, id, extra) =>
    `<span class="edbar eddole"><button type="button" class="gbtn ghost" data-ed="${druh}:${id}">Upravit text</button>${extra || ""}</span>`;
  const vlož = (sel, html) => {
    const c = document.querySelector(sel);
    if (c && !c.parentNode.querySelector(".edbar")) c.parentNode.insertAdjacentHTML("beforeend", html);
  };
  const _e1 = renderRodArticle,
    _e2 = renderPersonArticle,
    _e3 = renderKronika,
    _e4 = renderDraco,
    _e5 = renderDruzina;
  renderRodArticle = function (id) {
    _e1(id);
    vlož(
      "#article .gmbar",
      tl(
        "rod",
        id,
        `<button type="button" class="gbtn ghost" data-edstrom="${id}">Rodokmen</button><button type="button" class="gbtn ghost" data-edsoubor="vazby.md">Vazby</button>`,
      ),
    );
  };
  renderPersonArticle = function (id) {
    _e2(id);
    vlož("#article .gmbar", tl("osoba", id));
  };
  renderKronika = function (b) {
    _e3(b);
    if (ZBY[b]) vlož("#kzapisy .gmbar", tl("zapis", b));
  };
  renderDraco = function (b) {
    _e4(b);
    if (gmPl(b)) vlož("#drmain .gmbar", tl("drak", b));
    else if ((DRBY[b] && DRBY[b].k === "kap") || (!DRBY[b] && b !== "plemena")) {
      const k = DRBY[b] ? b : (DRACI.kap[0] || {}).id;
      if (k) {
        const h = document.querySelector("#drmain h2");
        if (h && !document.querySelector("#drmain .edbar"))
          h.parentNode.closest("#drmain,#druzinadet").insertAdjacentHTML("beforeend", tl("kapitola", k));
      }
    }
  };
  renderDruzina = function (b) {
    _e5(b);
    if (PARTY.find(x => x.id === b)) {
      const h = document.querySelector("#druzinadet h2");
      if (h && !document.querySelector("#druzinadet .edbar"))
        h.parentNode.closest("#drmain,#druzinadet").insertAdjacentHTML("beforeend", tl("postava", b));
    }
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-ed],[data-edstrom],[data-edsoubor]");
    if (!b || b.closest(".edbox")) return;
    if (b.dataset.ed) {
      const i = b.dataset.ed.indexOf(":");
      edOtevri(b.dataset.ed.slice(0, i), b.dataset.ed.slice(i + 1));
    } else if (b.dataset.edstrom) edStrom(b.dataset.edstrom);
    else
      edNacti()
        .then(() => edRaw(b.dataset.edsoubor, "Úprava: " + b.dataset.edsoubor))
        .catch(err => mmHlasG(err.message, 7000));
  });
}
/* nový záznam (vypravěčský přehled) */
function edNovyBox() {
  if (!window.MMDB) return "";
  return `<div class="gmrod"><div class="gmrow"><b>Nový záznam</b><small>Vznikne skrytý; hráčům ho odhalíš přepínačem.</small></div>
    <form class="gmhraf" id="ednovy"><label>Druh<select name="druh">${Object.entries(EDDRUH)
      .map(([k, d]) => `<option value="${k}">${d.n}</option>`)
      .join("")}</select></label>
    <label>Id (malá písmena bez mezer, u Prahy číslo)<input name="nid" required placeholder="např. jan-z-rabi"></label>
    <div class="gmhrab"><button type="submit" class="gbtn">Vytvořit</button><button type="button" class="gbtn ghost" data-edsoubor="vazby.md">Upravit vazby</button><button type="button" class="gbtn ghost" data-edkontrola>Zkontrolovat texty</button></div></form><p class="ederr" id="edkontrola" role="status"></p></div>`;
}
document.addEventListener("click", async e => {
  if (!e.target.closest("[data-edkontrola]")) return;
  const out = document.getElementById("edkontrola");
  out.textContent = "Kontroluji…";
  try {
    await edGen();
    ED.z = null;
    await edNacti();
    edGeneruj(ED.z);
    out.textContent = "Všechny texty jsou v pořádku.";
  } catch (err) {
    const m = String(err.message),
      f = (m.match(/^([a-z_/-]+\/[0-9A-Za-z_.-]+\.md|vazby\.md|rodokmeny\.json)/) || [])[1];
    out.innerHTML =
      edEsc(m) + (f && ED.z && f in ED.z ? ` <button type="button" class="gbtn ghost" data-edsoubor="${edEsc(f)}">Opravit ${edEsc(f)}</button>` : "");
  }
});
document.addEventListener("submit", e => {
  if (e.target.getAttribute("id") !== "ednovy") return;
  e.preventDefault();
  const f = e.target.elements,
    id = f.nid.value.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(id)) {
    mmHlasG("Id smí obsahovat jen malá písmena bez diakritiky, číslice a pomlčky.");
    return;
  }
  edNacti()
    .then(() => {
      const d = EDDRUH[f.druh.value];
      if (edIndex()[f.druh.value + ":" + id]) {
        mmHlasG(`${d.n} s id „${id}“ už existuje.`);
        return;
      }
      edOtevri(f.druh.value, id, true);
    })
    .catch(err => mmHlasG(err.message, 7000));
});
/*@cast}*/
