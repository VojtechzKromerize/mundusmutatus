/* ===== SRD 5.2.1: magické předměty (všichni) a nestvůry (vypravěč) – art/predmety.json, art/netvori.json ===== */
let PRED = null,
  PREDP = null;
const PREDBY = {},
  PREDBYN = {};
const predNacti = () =>
  PRED
    ? Promise.resolve(PRED)
    : (PREDP =
        PREDP ||
        fetch("art/predmety.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(d => {
            PRED = d;
            d.forEach(x => {
              PREDBY[x.id] = x;
              PREDBYN[x.en.toLowerCase()] = x;
              if (x.cz) PREDBYN[x.cz.toLowerCase()] = x;
            });
            return d;
          })
          .catch(e => {
            PREDP = null;
            throw e;
          }));
const kPred = x =>
  (x &&
    (PREDBY[x.mag] ||
      PREDBYN[
        String(x.n || "")
          .toLowerCase()
          .replace(/\s*\(\d+\)\s*$/, "")
          .trim()
      ])) ||
  null;
const PRVZ = ["běžný", "neobvyklý", "vzácný", "velmi vzácný", "legendární", "artefakt", "proměnlivá"];
function predKarta(x) {
  return `<article class="kzkarta"><h3>${besc(x.en)}${x.cz ? ` <small>${besc(x.cz)}</small>` : ""}</h3><p class="rsmall"><i>${besc(x.druh)}${x.upr ? ` (${besc(x.upr)})` : ""}, ${besc(x.vzt || x.vz)}${x.pr ? `, vyžaduje připoutání${typeof x.pr === "string" ? " (" + besc(x.pr) + ")" : ""}` : ""}</i></p>${kzMd(x.t)}<p class="rsmall">SRD 5.2.1, s. ${x.str || ""}</p></article>`;
}
let PRF = {q: "", druh: "", vz: ""};
function renderPredmety(main) {
  if (!PRED) {
    main.innerHTML = `<p class="rsmall">Načítám magické předměty…</p>`;
    predNacti().then(
      () => {
        if (curView === "pravidla") renderPredmety(main);
      },
      () => {
        main.innerHTML = `<p class="intro">Předměty se nepodařilo načíst.</p>`;
      },
    );
    return;
  }
  const dr = [...new Set(PRED.map(x => x.druh))].sort((a, b) => a.localeCompare(b, "cs"));
  main.innerHTML = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>Magické předměty</b></nav><h2 class="arttitle">Magické předměty</h2>
    <p class="intro">Magické předměty ze SRD 5.2.1 s českým popisem. Předmět jde přidat do vybavení postavy; lektvary léčení se pak dají na kartě rovnou vypít.</p>
    <div class="prfil"><input type="search" data-prq value="${besc(PRF.q)}" placeholder="Hledat – Bag of Holding, lektvar, prsten…" aria-label="Hledat předmět"><select data-prdruh aria-label="Druh"><option value="">všechny druhy</option>${dr.map(d => `<option${PRF.druh === d ? " selected" : ""}>${besc(d)}</option>`).join("")}</select><select data-prvz aria-label="Vzácnost"><option value="">každá vzácnost</option>${PRVZ.map(d => `<option${PRF.vz === d ? " selected" : ""}>${d}</option>`).join("")}</select></div>
    <ul class="prlist" data-prlist></ul><p class="rsmall srdattr">${besc(SRDP ? SRDP.attr : "")}</p>`;
  predFiltr(main);
}
function predFiltr(main) {
  const L = main.querySelector("[data-prlist]");
  if (!L) return;
  const q = _nrm(PRF.q.trim());
  const R = PRED.filter(
    x =>
      (!PRF.druh || x.druh === PRF.druh) &&
      (!PRF.vz || x.vz === PRF.vz || (x.vzt || "").includes(PRF.vz)) &&
      (!q || _nrm(`${x.en} ${x.cz || ""} ${x.druh} ${x.upr || ""}`).includes(q)),
  );
  L.innerHTML =
    R.slice(0, 150)
      .map(
        x =>
          `<li><details data-pred="${x.id}"><summary><b>${besc(x.en)}</b>${x.cz ? ` <small>${besc(x.cz)}</small>` : ""} <span class="prmeta">${besc(x.druh)} · ${besc(x.vz)}${x.pr ? " · připoutání" : ""}</span></summary><div class="prbody"></div></details></li>`,
      )
      .join("") +
    (R.length > 150 ? `<li class="rsmall">… a dalších ${R.length - 150}, upřesni hledání.</li>` : "") +
    (R.length ? "" : `<li class="rsmall">Nic takového.</li>`);
}
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("details[data-pred]") || !d.open) return;
    const x = PREDBY[d.dataset.pred],
      b = d.querySelector(".prbody");
    if (!x || !b || b.innerHTML) return;
    b.innerHTML =
      predKarta(x) +
      (KARTY.length
        ? `<p class="kvlh"><label>Přidat k postavě <select data-predkomu>${KARTY.map(k => `<option value="${besc(k.id)}">${besc(k.n)}</option>`).join("")}</select></label><button type="button" class="gbtn ghost" data-predadd="${x.id}">Do vybavení</button></p>`
        : "");
    pojZnac(b);
  },
  true,
);
async function predDoVybaveni(kid, x, q) {
  const K = KARTBY[kid];
  if (!K || !x) return;
  await kartyNacti();
  const inv = [...(kartaStav(K.id).inv || K.vybaveni || [])].map(y => Object.assign({}, y));
  const i = inv.findIndex(y => y.mag === x.id || y.n === x.en);
  if (i >= 0) inv[i].q = Math.min(9999, (+inv[i].q || 0) + (q || 1));
  else inv.push({n: x.en.slice(0, 80), q: q || 1, mag: x.id});
  await kartaStavZmen(K.id, {inv}, `${K.n}: ${x.en} ve vybavení.`);
}
/* nestvůry: připojí se k protivníkům (bestiář v Boji, přidání do boje) */
let NETV = null,
  NETVP = null;
const netvNacti = () =>
  NETV
    ? Promise.resolve(NETV)
    : (NETVP =
        NETVP ||
        fetch("art/netvori.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(d => {
            NETV = d;
            d.forEach(p => {
              if (PROTBY[p.id]) return;
              p.$srd = 1;
              p.b = p.h;
              PROTIVNICI.push(p);
              PROTBY[p.id] = p;
            });
            return d;
          })
          .catch(e => {
            NETVP = null;
            throw e;
          }));
let NVF = {q: "", typ: ""};
function renderNetvori(main) {
  if (!GMV) {
    main.innerHTML = `<p class="intro">Nestvůry má vypravěč.</p>`;
    return;
  }
  if (!NETV) {
    main.innerHTML = `<p class="rsmall">Načítám nestvůry…</p>`;
    netvNacti().then(() => {
      if (curView === "pravidla") renderNetvori(main);
    });
    return;
  }
  const ty = [...new Set(NETV.map(x => x.st[1]).filter(Boolean))].sort();
  main.innerHTML = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>Nestvůry a zvířata</b></nav><h2 class="arttitle">Nestvůry a zvířata (SRD 5.2.1)</h2>
    <p class="intro">Statistiky nestvůr a zvířat ze SRD 5.2.1 s českými texty. Jsou i v bestiáři boje (Hra › Boj) – tlačítkem <b>+ do boje</b> je přidáš do přípravy nebo běžícího boje (nestvůra s legendárními akcemi jako zhoubce, ostatní jako sok).</p>
    <div class="prfil"><input type="search" data-nvq value="${besc(NVF.q)}" placeholder="Hledat – goblin, dragon, vlk, CR 5…" aria-label="Hledat nestvůru"><select data-nvtyp aria-label="Typ"><option value="">všechny typy</option>${ty.map(d => `<option${NVF.typ === d ? " selected" : ""}>${besc(d)}</option>`).join("")}</select></div>
    <ul class="prlist" data-nvlist></ul><p class="rsmall srdattr">${besc(SRDP ? SRDP.attr : "")}</p>`;
  netvFiltr(main);
}
function netvFiltr(main) {
  const L = main.querySelector("[data-nvlist]");
  if (!L) return;
  const q = _nrm(NVF.q.trim()),
    cr = q.match(/^cr\s*([\d/]+)$/);
  const R = NETV.filter(x => (!NVF.typ || x.st[1] === NVF.typ) && (!q || (cr ? x.cr === cr[1] : _nrm(`${x.n} ${x.cz || ""} ${x.typ}`).includes(q))));
  L.innerHTML =
    R.slice(0, 120)
      .map(
        x =>
          `<li><details data-netv="${x.id}"><summary><b>${besc(x.n)}</b>${x.cz ? ` <small>${besc(x.cz)}</small>` : ""} <span class="prmeta">${besc(x.typ)} · CR ${besc(x.cr)}${x.u === "zhoubce" ? " · zhoubce" : ""}</span> <button type="button" class="badd" data-netvadd="${x.id}">+ do boje</button></summary><div class="prbody"></div></details></li>`,
      )
      .join("") + (R.length > 120 ? `<li class="rsmall">… a dalších ${R.length - 120}.</li>` : "");
}
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("details[data-netv]") || !d.open) return;
    const x = PROTBY[d.dataset.netv],
      b = d.querySelector(".prbody");
    if (x && b && !b.innerHTML) {
      b.innerHTML = `<div class="bsb srdtext">${x.h}</div>`;
      pojZnac(b);
    }
  },
  true,
);
document.addEventListener("input", e => {
  const t = e.target,
    m = document.getElementById("srdmain");
  if (!m || !m.contains(t)) return;
  if (t.matches("[data-prq]")) {
    PRF.q = t.value;
    predFiltr(m);
  }
  if (t.matches("[data-nvq]")) {
    NVF.q = t.value;
    netvFiltr(m);
  }
});
document.addEventListener("change", e => {
  const t = e.target,
    m = document.getElementById("srdmain");
  if (!m || !m.contains(t)) return;
  if (t.matches("[data-prdruh]")) {
    PRF.druh = t.value;
    predFiltr(m);
  }
  if (t.matches("[data-prvz]")) {
    PRF.vz = t.value;
    predFiltr(m);
  }
  if (t.matches("[data-nvtyp]")) {
    NVF.typ = t.value;
    netvFiltr(m);
  }
});
document.addEventListener("click", e => {
  const a = e.target.closest("[data-predadd]");
  if (a) {
    const s = a.parentElement.querySelector("[data-predkomu]");
    if (s) predDoVybaveni(s.value, PREDBY[a.dataset.predadd]);
    return;
  }
  const n = e.target.closest("[data-netvadd]");
  if (n && GMV) {
    e.preventDefault();
    e.stopPropagation();
    const rows = bojRozvin([{id: n.dataset.netvadd, pr: []}]);
    if (rows.length) {
      bojPridejZvenku(rows, null);
      if (!(BOJ.s && (BOJ.s.aktivni || BOJ.s.priprava))) mmHlasG(`${rows[0].n} – připraveno pro další boj (Hra › Boj).`, 4500);
    }
  }
});

/* ===== Ukázat hráčům: obrázek, dopis nebo mapka vyskočí na telefonech (tabulka ukazky) ===== */
const UKDB = window.MMDB && MMDB.ukazkyNacti ? {nacti: () => MMDB.ukazkyNacti(), uloz: o => MMDB.ukaz(o), smaz: i => MMDB.ukazSmaz(i)} : null;
let UKAZKY = [],
  UKPOLL = null;
const ukVideno = {
  get() {
    try {
      return +localStorage.getItem("mm-ukaz-videno") || 0;
    } catch (e) {
      return 0;
    }
  },
  set(v) {
    try {
      localStorage.setItem("mm-ukaz-videno", String(v));
    } catch (e) {}
  },
};
/* hráč si ukázku uloží nebo pošle dál (Sdílet v telefonu – obrázek jako soubor do Fotek, text jako text) */
const ukHtml = u =>
  `<article class="ukazka"><p class="rsmall">Vypravěč ukazuje</p>${u.n ? `<h2 class="arttitle">${besc(u.n)}</h2>` : ""}${u.img ? `<img src="${besc(u.img)}" alt="${besc(u.n || "Ukázka")}">` : ""}${u.t ? `<div class="kron">${kzMd(u.t)}</div>` : ""}${!GMV && navigator.share ? `<p><button type="button" class="gbtn ghost" data-uksdil="${u.id}">Sdílet / uložit</button></p>` : ""}</article>`;
async function ukSdilej(u) {
  const d = {title: u.n || "Mundus Mutatus", text: [u.n, u.t].filter(Boolean).join("\n\n")};
  try {
    if (u.img) {
      try {
        const b = await (await fetch(u.img)).blob(),
          f = new File([b], (u.n || "ukazka").replace(/[^\w.-]+/g, "_") + "." + (b.type.split("/")[1] || "webp").replace("jpeg", "jpg"), {
            type: b.type,
          });
        if (navigator.canShare && navigator.canShare({files: [f]})) {
          await navigator.share(Object.assign({files: [f]}, d));
          return;
        }
      } catch (e) {}
      d.url = new URL(u.img, location.href).href;
    }
    await navigator.share(d);
  } catch (e) {
    if (e && e.name !== "AbortError") mmHlasG("Sdílení se nepovedlo: " + (e.message || e), 4000);
  }
}
async function ukNacti(prvni) {
  if (!UKDB) return;
  try {
    const r = await UKDB.nacti();
    UKAZKY = (r || []).map(x => Object.assign({id: x.id, cas: x.cas}, x.data || {}));
  } catch (e) {
    return;
  }
  const top = UKAZKY[0];
  if (!top) return;
  const v = ukVideno.get();
  if (!v && prvni) {
    ukVideno.set(Date.now() - new Date(top.cas).getTime() < 10 * 60000 ? top.id - 1 : top.id);
  }
  const nove = UKAZKY.filter(u => u.id > ukVideno.get());
  if (nove.length) {
    ukVideno.set(top.id);
    if (!GMV) {
      mmPop(ukHtml(nove[0]));
      mmNotif("Vypravěč ukazuje", nove[0].n || "");
    }
  }
  if (curView === "karty" && !decodeURIComponent(location.hash.split("/")[1] || "")) renderKarty("");
}
function ukStart() {
  if (!UKDB || UKPOLL) return;
  ukNacti(true);
  UKPOLL = true;
}
async function ukUkaz(o) {
  o = {n: String(o.n || "").slice(0, 120), t: String(o.t || "").slice(0, 4000), img: String(o.img || "").slice(0, 500)};
  Object.keys(o).forEach(k => {
    if (!o[k]) delete o[k];
  });
  if (!o.n && !o.t && !o.img) {
    mmHlasG("Ukázka je prázdná.", 3000);
    return;
  }
  if (!UKDB) {
    mmPop(ukHtml(o));
    mmHlasG("Bez databáze se ukázka zobrazí jen tady.", 4000);
    return;
  }
  try {
    const id = await UKDB.uloz(o);
    ukVideno.set(id);
    mmHlasG("Ukázáno hráčům – vyskočí jim na telefonech.", 4000);
    ukNacti();
  } catch (e) {
    mmHlasG("Nepodařilo se: " + (e.message || e), 6000);
  }
}
async function ukObrazek(file) {
  if (!window.MMDB || !MMDB.nahrajObrazek) throw new Error("Obrázky jde nahrávat jen s databází.");
  const ext = (file.name.match(/\.(\w+)$/) || [0, "webp"])[1].toLowerCase(),
    c = `ukazky/${Date.now()}-${(
      file.name
        .replace(/\.\w+$/, "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") || "obrazek"
    ).slice(0, 40)}.${ext}`;
  return MMDB.nahrajObrazek(c, file);
}
const ukForm = (
  o = {},
) => `<form class="ukf" data-ukf><input name="n" placeholder="Nadpis (např. Dopis od purkmistra)" maxlength="120" value="${besc(o.n || "")}"><textarea name="t" rows="4" maxlength="4000" placeholder="Text, který hráči uvidí">${besc(o.t || "")}</textarea>
  <label>Obrázek <input name="img" placeholder="adresa obrázku (art/… nebo https://…)" maxlength="500" value="${besc(o.img || "")}"></label>${window.MMDB ? `<label class="gbtn ghost"><input type="file" accept="image/*" data-ukfile hidden>Nahrát obrázek…</label>` : ""}<button class="gbtn">Ukázat hráčům</button></form>`;
const ukSeznam = () =>
  UKAZKY.length
    ? `<ul class="uklist">${UKAZKY.slice(0, 12)
        .map(
          u =>
            `<li><button type="button" class="gbtn ghost" data-ukotevri="${u.id}">${besc(u.n || (u.t || "").slice(0, 40) || "obrázek")}</button> <small>${(() => {
              try {
                return new Date(u.cas).toLocaleString("cs-CZ", {day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"});
              } catch (e) {
                return "";
              }
            })()}</small>${GMV ? ` <button type="button" class="kx" data-ukx="${u.id}" aria-label="Smazat ukázku">×</button>` : ""}</li>`,
        )
        .join("")}</ul>`
    : `<p class="rsmall">Zatím nic.</p>`;
document.addEventListener("submit", async e => {
  if (!e.target.matches || !e.target.matches("[data-ukf]")) return;
  e.preventDefault();
  const f = e.target.elements;
  await ukUkaz({n: f.n.value, t: f.t.value, img: f.img.value});
});
document.addEventListener("change", async e => {
  if (!e.target.matches || !e.target.matches("[data-ukfile]") || !e.target.files[0]) return;
  const f = e.target.closest("form");
  try {
    mmHlasG("Nahrávám obrázek…", 2500);
    const u = await ukObrazek(e.target.files[0]);
    f.elements.img.value = u;
    f.elements.img.dispatchEvent(new Event("input", {bubbles: true}));
    mmHlasG("Obrázek nahrán.", 2500);
  } catch (err) {
    mmHlasG(err.message || String(err), 6000);
  }
});
document.addEventListener("click", async e => {
  const o = e.target.closest("[data-ukotevri]");
  if (o) {
    const u = UKAZKY.find(x => x.id == o.dataset.ukotevri);
    if (u) mmPop(ukHtml(u));
    return;
  }
  const sd = e.target.closest("[data-uksdil]");
  if (sd) {
    const u = UKAZKY.find(x => x.id == sd.dataset.uksdil);
    if (u) ukSdilej(u);
    return;
  }
  const x = e.target.closest("[data-ukx]");
  if (x && GMV && UKDB) {
    if (!confirm("Smazat ukázku?")) return;
    try {
      await UKDB.smaz(+x.dataset.ukx);
      await ukNacti();
    } catch (err) {
      mmHlasG(err.message, 5000);
    }
    if (curView === "sezeni") renderSezeni();
    return;
  }
  const k = e.target.closest("[data-ukazat]");
  if (k && GMV) {
    const s = SEZ.d.s.find(q => q.id === SEZ.cur),
      sc = s && s.sc[+k.dataset.sc],
      u = sc && (sc.uk || [])[+k.dataset.ukazat];
    if (u) ukUkaz(u);
    return;
  }
});

/* ===== Příprava sezení (vypravěč): scény, poznámky, setkání, osoby, ukázky ===== */
const SEZ = {d: null, cur: null, t: null, lok: false};
const SZDB = {
  async nacti() {
    if (window.MMDB && MMDB.prihlasen()) {
      try {
        return await MMDB.gm("mm_sezeni_nacti");
      } catch (e) {
        SEZ.lok = true;
      }
    } else SEZ.lok = true;
    try {
      return JSON.parse(localStorage.getItem("mm-sezeni") || "null");
    } catch (e) {
      return null;
    }
  },
  async uloz(d) {
    if (window.MMDB && !SEZ.lok) {
      try {
        await MMDB.gm("mm_sezeni_uloz", {p_sezeni: d});
        return;
      } catch (e) {
        if (e.status === 404 || /mm_sezeni|function|schema cache/i.test(e.message)) {
          SEZ.lok = true;
          mmHlasG(
            "Databáze zatím neumí ukládat přípravu sezení – spusť aktuální supabase/schema.sql. Do té doby se ukládá jen v tomto prohlížeči.",
            8000,
          );
        } else {
          mmHlasG("Nepodařilo se uložit: " + e.message, 5000);
          return;
        }
      }
    }
    try {
      localStorage.setItem("mm-sezeni", JSON.stringify(d));
    } catch (e) {}
  },
};
const szUloz = () => {
  clearTimeout(SEZ.t);
  SEZ.t = setTimeout(() => SZDB.uloz(SEZ.d), 700);
};
const szId = () => Date.now().toString(36);
function renderSezeni() {
  const box = document.getElementById("szview");
  if (!box) return;
  if (!GMV) {
    box.innerHTML = `<p class="intro">Přípravu sezení vidí jen vypravěč.</p>`;
    return;
  }
  if (!SEZ.d) {
    box.innerHTML = `<p class="rsmall">Načítám…</p>`;
    SZDB.nacti().then(d => {
      SEZ.d = d && Array.isArray(d.s) ? d : {s: []};
      renderSezeni();
    });
    return;
  }
  const id = decodeURIComponent(location.hash.split("/")[1] || ""),
    S = SEZ.d.s.find(x => x.id === id);
  SEZ.cur = S ? S.id : null;
  if (!S) {
    box.innerHTML = `<div class="bojtit"><h2 class="arttitle">Příprava sezení</h2><p class="bojlead">Scény, poznámky, připravená setkání, osoby a ukázky pro hráče na jednom místě. Během hry odsud spustíš boj nebo ukážeš dopis.</p></div>
      <ol class="zlist">${SEZ.d.s.map(x => `<li><a class="zcard" href="#sezeni/${x.id}"><small>${besc(x.dat || "")}${x.hot ? " · odehráno" : ""}</small><b>${besc(x.n || "Sezení")}</b><span>${(x.sc || []).length} scén · ${besc((x.pozn || "").slice(0, 120))}</span></a></li>`).join("")}</ol>
      <button type="button" class="gbtn" data-sznove>Nové sezení</button>
      <section><h3 class="uvh2">Ukázat hráčům hned</h3>${ukForm()}<h4 class="bsph">Naposledy ukázané</h4>${ukSeznam()}</section>`;
    return;
  }
  const os = n => {
    const p = PEOPLE.find(q => q.n === n || q.id === n);
    return p ? `<a href="#osoba/${p.id}">${besc(p.n)}</a>` : besc(n);
  };
  box.innerHTML = `<nav class="crumbs"><a href="#sezeni">Příprava sezení</a> › <b>${besc(S.n || "Sezení")}</b></nav>
    <div class="szhl"><input class="szn" data-sz="n" value="${besc(S.n || "")}" placeholder="Název sezení" aria-label="Název sezení"><input data-sz="dat" value="${besc(S.dat || "")}" placeholder="kdy (např. pátek 23. 10.)" aria-label="Kdy"><label><input type="checkbox" data-sz="hot"${S.hot ? " checked" : ""}> odehráno</label></div>
    <label class="szpl">Poznámky k sezení<textarea data-sz="pozn" rows="4" placeholder="Co se má stát, otevřené nitky, co si připomenout">${besc(S.pozn || "")}</textarea></label>
    <ol class="szsc">${(S.sc || [])
      .map(
        (
          c,
          i,
        ) => `<li class="${c.hot ? "szhot" : ""}"><div class="szhl"><input data-szc="n" data-i="${i}" value="${besc(c.n || "")}" placeholder="Scéna ${i + 1}" aria-label="Název scény"><label><input type="checkbox" data-szc="hot" data-i="${i}"${c.hot ? " checked" : ""}> hotovo</label><button type="button" class="kx" data-szcx="${i}" aria-label="Smazat scénu">×</button></div>
      <textarea data-szc="t" data-i="${i}" rows="3" placeholder="Popis scény, co postavy uvidí, tajemství">${besc(c.t || "")}</textarea>
      <p class="szrow"><b>Setkání</b> ${(c.setk || []).map((x, j) => `<span class="chip">${besc((SETBY[x] || {}).n || x)} <button type="button" class="gbtn ghost" data-szboj="${besc(x)}">do boje</button> <button type="button" class="kx" data-szdel="setk" data-i="${i}" data-j="${j}" aria-label="Odebrat">×</button></span>`).join(" ")}
        <select data-szadd="setk" data-i="${i}" aria-label="Přidat setkání"><option value="">+ setkání…</option>${SETKANI.map(x => `<option value="${besc(x.id)}">${besc(x.n)}</option>`).join("")}</select></p>
      <p class="szrow"><b>Osoby</b> ${(c.os || []).map((x, j) => `<span class="chip">${os(x)} <button type="button" class="kx" data-szdel="os" data-i="${i}" data-j="${j}" aria-label="Odebrat">×</button></span>`).join(" ")}
        <input data-szadd="os" data-i="${i}" list="szosl" placeholder="+ osoba" aria-label="Přidat osobu"></p>
      <div class="szrow"><b>Ukázky pro hráče</b> ${(c.uk || []).map((u, j) => `<span class="chip">${besc(u.n || "ukázka")} <button type="button" class="gbtn ghost" data-ukazat="${j}" data-sc="${i}">ukázat</button> <button type="button" class="kx" data-szdel="uk" data-i="${i}" data-j="${j}" aria-label="Odebrat">×</button></span>`).join(" ")}
        <details class="bjapd"><summary>+ připravit ukázku</summary><form data-szuk="${i}" class="ukf"><input name="n" placeholder="Nadpis" maxlength="120"><textarea name="t" rows="3" maxlength="4000" placeholder="Text"></textarea><input name="img" placeholder="adresa obrázku" maxlength="500">${window.MMDB ? `<label class="gbtn ghost"><input type="file" accept="image/*" data-ukfile hidden>Nahrát obrázek…</label>` : ""}<button class="gbtn ghost">Přidat ke scéně</button></form></details></div></li>`,
      )
      .join("")}</ol>
    <datalist id="szosl">${PEOPLE.slice(0, 800)
      .map(p => `<option value="${besc(p.n)}">`)
      .join("")}</datalist>
    <p class="bojbtn"><button type="button" class="gbtn" data-szscena>Přidat scénu</button><button type="button" class="gbtn ghost" data-szsmaz>Smazat sezení</button></p>`;
}
document.addEventListener("input", e => {
  const box = document.getElementById("szview");
  if (!box || !box.contains(e.target) || !SEZ.d) return;
  const S = SEZ.d.s.find(x => x.id === SEZ.cur);
  if (!S) return;
  const t = e.target;
  if (t.dataset.sz && t.type !== "checkbox") {
    S[t.dataset.sz] = t.value.slice(0, 8000);
    szUloz();
  }
  if (t.dataset.szc && t.type !== "checkbox") {
    const c = S.sc[+t.dataset.i];
    if (c) {
      c[t.dataset.szc] = t.value.slice(0, 8000);
      szUloz();
    }
  }
});
document.addEventListener("change", e => {
  const box = document.getElementById("szview");
  if (!box || !box.contains(e.target) || !SEZ.d) return;
  const S = SEZ.d.s.find(x => x.id === SEZ.cur);
  if (!S) return;
  const t = e.target;
  if (t.dataset.sz && t.type === "checkbox") {
    S[t.dataset.sz] = t.checked;
    szUloz();
  }
  if (t.dataset.szc && t.type === "checkbox") {
    const c = S.sc[+t.dataset.i];
    if (c) {
      c.hot = t.checked;
      szUloz();
      t.closest("li").classList.toggle("szhot", t.checked);
    }
  }
  if (t.dataset.szadd && t.value.trim()) {
    const c = S.sc[+t.dataset.i],
      k = t.dataset.szadd;
    if (!c) return;
    let v = t.value.trim();
    if (k === "os") {
      const p = PEOPLE.find(q => q.n === v);
      if (p) v = p.id;
    }
    c[k] = [...new Set([...(c[k] || []), v])];
    szUloz();
    renderSezeni();
  }
});
document.addEventListener("submit", e => {
  if (!e.target.matches || !e.target.matches("[data-szuk]")) return;
  e.preventDefault();
  const S = SEZ.d && SEZ.d.s.find(x => x.id === SEZ.cur),
    c = S && S.sc[+e.target.dataset.szuk];
  if (!c) return;
  const f = e.target.elements;
  const u = {n: f.n.value.trim().slice(0, 120), t: f.t.value.trim().slice(0, 4000), img: f.img.value.trim().slice(0, 500)};
  if (!u.n && !u.t && !u.img) return;
  c.uk = [...(c.uk || []), u];
  szUloz();
  renderSezeni();
});
document.addEventListener("click", e => {
  const box = document.getElementById("szview");
  if (!box || !box.contains(e.target) || !SEZ.d) return;
  const T = s => e.target.closest(s),
    S = SEZ.d.s.find(x => x.id === SEZ.cur);
  if (T("[data-sznove]")) {
    const n = {id: szId(), n: `Sezení ${SEZ.d.s.length + 1}`, dat: "", pozn: "", sc: [{n: "", t: ""}]};
    SEZ.d.s.unshift(n);
    szUloz();
    navTo("#sezeni/" + n.id);
    return;
  }
  if (!S) return;
  if (T("[data-szscena]")) {
    S.sc = [...(S.sc || []), {n: "", t: ""}];
    szUloz();
    renderSezeni();
    return;
  }
  if (T("[data-szsmaz]")) {
    if (!confirm(`Smazat ${S.n || "sezení"}?`)) return;
    SEZ.d.s = SEZ.d.s.filter(x => x !== S);
    szUloz();
    navTo("#sezeni");
    return;
  }
  const cx = T("[data-szcx]");
  if (cx) {
    if (!confirm("Smazat scénu?")) return;
    S.sc.splice(+cx.dataset.szcx, 1);
    szUloz();
    renderSezeni();
    return;
  }
  const d = T("[data-szdel]");
  if (d) {
    const c = S.sc[+d.dataset.i];
    if (c && c[d.dataset.szdel]) {
      c[d.dataset.szdel].splice(+d.dataset.j, 1);
      szUloz();
      renderSezeni();
    }
    return;
  }
  const b = T("[data-szboj]");
  if (b) {
    const x = SETBY[b.dataset.szboj];
    if (!x) return;
    const rows = bojRozvin(x.np);
    bojPridejZvenku(rows, x.n + ". " + (x.x || ""));
    navTo("#hra");
    return;
  }
});

/* ===== Kořist: rozdělení do vybavení postav a peněz, Štědrost a Lakomství ===== */
const BKORK = {};
function bojKorDelHtml(kor) {
  if (!GMV || !KARTY.length) return "";
  const op = sel => KARTY.map(k => `<option value="${besc(k.id)}"${sel === k.id ? " selected" : ""}>${besc(k.n)}</option>`).join("");
  return `<details class="bjapd bkordel" data-otv="kordel"${BOTV.has("kordel") ? " open" : ""}><summary>Rozdělit kořist do vybavení postav</summary>
    ${kor.length ? `<ul class="bkor">${kor.map(x => `<li>${besc(x.t)} <select data-bkorkomu="${besc(x.k)}" aria-label="Komu"><option value="">— nikomu —</option>${op(BKORK[x.k])}</select></li>`).join("")}</ul>` : ""}
    <p class="kvlh"><label>Peníze GP <input type="number" min="0" max="99999" data-bkorgp value="0"></label><label>SP <input type="number" min="0" max="99999" data-bkorsp value="0"></label> rovným dílem mezi: ${KARTY.map(k => `<label><input type="checkbox" data-bkorpen="${besc(k.id)}" checked> ${besc(k.n)}</label>`).join(" ")}</p>
    <button type="button" class="gbtn" data-bkordel>Rozdělit</button>
    <p class="rsmall">Kdo dělil spravedlivě, jedná podle Štědrosti (bod dobrých skutků); kdo si kořist ponechal, podlehl Lakomství (bod hříchu, proti Ctnosti Štědrost dva). Obojí dává Heroic Inspiration:
      ${KARTY.map(k => `<span class="kvlh"><b>${besc(k.n)}</b> <button type="button" class="gbtn ghost" data-bkorctn="${besc(k.id)}">Štědrost</button><button type="button" class="gbtn ghost bhrich" data-bkorner="${besc(k.id)}">Lakomství</button></span>`).join(" ")}</p></details>`;
}
async function bojKorDel(box, kor) {
  let n = 0;
  await kartyNacti();
  for (const x of kor) {
    const kid = BKORK[x.k],
      K = kid && KARTBY[kid];
    if (!K) continue;
    const m = x.t.match(/^(\d+)×\s*(.*)$/),
      q = m ? +m[1] : 1,
      nm = (m ? m[2] : x.t).replace(/\s+–.*$/, "").slice(0, 80);
    const inv = [...(kartaStav(K.id).inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
      i = inv.findIndex(y => y.n === nm);
    if (i >= 0) inv[i].q = Math.min(9999, inv[i].q + q);
    else inv.push({n: nm, q});
    await kartaStavZmen(K.id, {inv});
    kHodZapis({k: K.id, kdo: K.n, co: "Kořist", txt: `${q}× ${nm} (${x.z})`});
    n++;
    delete BKORK[x.k];
  }
  const gp = Math.max(0, Math.round(+(box.querySelector("[data-bkorgp]") || {}).value || 0)),
    sp = Math.max(0, Math.round(+(box.querySelector("[data-bkorsp]") || {}).value || 0)),
    komu = [...box.querySelectorAll("[data-bkorpen]:checked")].map(c => KARTBY[c.dataset.bkorpen]).filter(Boolean);
  if ((gp || sp) && komu.length) {
    const cp = gp * 100 + sp * 10,
      dil = Math.floor(cp / komu.length),
      zb = cp - dil * komu.length;
    for (const K of komu) {
      const pen = Object.assign({}, kartaStav(K.id).pen || K.penize || {});
      let r = dil;
      pen.GP = (+pen.GP || 0) + Math.floor(r / 100);
      r %= 100;
      pen.SP = (+pen.SP || 0) + Math.floor(r / 10);
      r %= 10;
      if (r) pen.CP = (+pen.CP || 0) + r;
      await kartaStavZmen(K.id, {pen});
      kHodZapis({k: K.id, kdo: K.n, co: "Podíl z kořisti", txt: `${Math.floor(dil / 100)} GP ${Math.floor((dil % 100) / 10)} SP ${dil % 10} CP`});
    }
    if (zb) mmHlasG(`Nedělitelný zbytek: ${zb} CP – ať o něj rozhodne družina.`, 6000);
    n++;
  }
  mmHlasG(n ? "Kořist rozdělena do karet postav." : "Nic k rozdělení – vyber, komu co připadne.", 4000);
}
async function bojKorCtnost(kid, ner) {
  const K = KARTBY[kid];
  if (!K) return;
  const D = kDuse(K);
  if (ner) {
    const b = D.ctn.includes("Štědrost") ? 2 : 1;
    await kartaStavZmen(K.id, {hr: Math.min(99, D.hr + b), insp: true});
    kHodZapis({k: K.id, kdo: K.n, co: "Lakomství", txt: `ponechal si kořist: +${b} bod${b > 1 ? "y" : ""} hříchu, Heroic Inspiration`});
  } else {
    await kartaStavZmen(K.id, {sk: Math.min(99, D.sk + 1), insp: true});
    kHodZapis({k: K.id, kdo: K.n, co: "Štědrost", txt: "spravedlivá dělba kořisti: +1 bod dobrých skutků, Heroic Inspiration"});
  }
  mmHlasG(`${K.n}: ${ner ? "Lakomství" : "Štědrost"} zapsána.`, 3500);
}
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-bkorkomu]")) {
    if (t.value) BKORK[t.dataset.bkorkomu] = t.value;
    else delete BKORK[t.dataset.bkorkomu];
  }
});
document.addEventListener("click", e => {
  const T = s => e.target.closest(s);
  if (!GMV) return;
  const d = T("[data-bkordel]");
  if (d && BOJ.s) {
    bojKorDel(d.closest(".bkordel"), bojKorist(BOJ.s));
    return;
  }
  const c = T("[data-bkorctn]");
  if (c) {
    bojKorCtnost(c.dataset.bkorctn, false);
    return;
  }
  const n = T("[data-bkorner]");
  if (n) {
    bojKorCtnost(n.dataset.bkorner, true);
    return;
  }
});
/* ovládání nových částí karty a přehledu družiny */
const kvK = el => {
  const d = el && el.closest && el.closest("[data-kid]");
  if (d && KARTBY[d.dataset.kid]) return KARTBY[d.dataset.kid];
  if (curView === "hra") return jaK();
  return KARTBY[decodeURIComponent(location.hash.split("/")[1] || "")];
};
document.addEventListener("click", async e => {
  const v = e.target.closest && e.target.closest("#kartyview,#bojpult,[data-kid]");
  if (!v) return;
  const T = s => e.target.closest(s),
    K = kvK(e.target);
  const pz = T("[data-kpzp]");
  if (pz && GMV) {
    if (!confirm("Zpytování svědomí pro všechny postavy?")) return;
    const r = [];
    for (const k of KARTY) r.push(`${k.n}: ${await kZpyt(k, true)}`);
    KPS.vys = {co: "Zpytování svědomí", r: r.map(t => ({n: "", tot: "", txt: t}))};
    kartyPrekresli();
    return;
  }
  const pv = T("[data-kpzv]");
  if (pv && GMV) {
    if (!window.MMDB) {
      mmHlasG("Výzvy fungují jen na webu s databází.", 3500);
      return;
    }
    const komu = KARTY.filter(k => !k.test || KHRAC[k.id])
      .map(k => k.id)
      .slice(0, 12);
    try {
      await MMDB.vyzva({typ: "hod", pozn: KZPYTV, komu});
      await vyzvyNacti();
      mmHlasG("Zpytování svědomí: hráčům vyskočila výzva, každý hodí d10 na své kartě.", 5000);
      kartyPrekresli();
    } catch (err) {
      mmHlasG(err.message || String(err), 5000);
    }
    return;
  }
  const po = T("[data-kpodp]");
  if (po && GMV) {
    kPrehledOdp(po.dataset.kpodp === "d");
    return;
  }
  const pc = T("[data-kpcas]");
  if (pc && GMV) {
    await hraPosun(+pc.dataset.kpcas);
    kartyPrekresli();
    return;
  }
  const uo = T("[data-ukotevri]");
  if (uo) return;
  if (!K) return;
  const du = T("[data-kdu]");
  if (du) {
    kDuseAkce(K, du.dataset.kdu);
    return;
  }
  const fe = T("[data-kfeat]");
  if (fe) {
    kFeat(K, fe.dataset.kfeat);
    return;
  }
  const pk = T("[data-kpok]");
  if (pk) {
    kPok(K, pk.dataset.kpok);
    return;
  }
  if (T("[data-kzavx]")) {
    delete KZAV[K.id];
    kartyPrekresli();
    return;
  }
  const kn = T("[data-knab]");
  if (kn) {
    const S = kartaStav(K.id),
      inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
      it = inv[+kn.dataset.knab],
      N = it && kNab(it);
    if (!N) return;
    const d = +kn.dataset.d,
      u = Math.max(0, Math.min(N.max, (+it.nab || 0) + d));
    if (u) it.nab = u;
    else delete it.nab;
    await kartaStavZmen(K.id, {inv});
    if (d > 0) kHodZapis({k: K.id, kdo: K.n, co: `Náboj – ${it.n}`.slice(0, 80), txt: `zbývá ${N.max - u} z ${N.max}`});
    return;
  }
  const kp = T("[data-kdice]");
  if (kp) {
    kPriTog(K, kp.dataset.kdice);
    return;
  }
  if (T("[data-kkonh]")) {
    if (KKON[K.id]) kKonHod(K, KKON[K.id]);
    return;
  }
  if (T("[data-kkonx]")) {
    delete KKON[K.id];
    kartyPrekresli();
    return;
  }
  const tx = T("[data-ktechx]");
  if (tx) {
    if (!confirm("Odebrat techniku z karty?")) return;
    kartaStavZmen(K.id, {tech: kTech(K).filter(i => i !== tx.dataset.ktechx)});
    return;
  }
  const te = T("[data-ktech]");
  if (te) {
    kTechPouzij(K, te.dataset.ktech);
    return;
  }
  const ux = T("[data-kucx]");
  if (ux) {
    const L = [...kUc(K)],
      x = L.splice(+ux.dataset.kucx, 1)[0];
    await kartaStavZmen(K.id, {uc: L.length ? L : null});
    if (x) kHodZapis({k: K.id, kdo: K.n, co: "Účinek skončil", txt: x.n});
    return;
  }
  const sp = T("[data-kspd]");
  if (sp) {
    const x = kSeznam(K)[+sp.dataset.kspd];
    if (!x) return;
    await kSpNacti().catch(() => {});
    let d = kSp(x.n);
    if (d && d.t == null && typeof kSpTexty === "function") {
      mmPop(`<h3>${besc(x.n)}</h3><p class="rsmall">Načítám popis…</p>`);
      await kSpTexty();
      d = kSp(x.n);
      if (d && d.t == null) {
        mmPop(`<h3>${besc(x.n)}</h3><p class="rsmall">Popis se nepodařilo načíst.</p>`);
        return;
      }
    }
    mmPop(d ? kzKarta(d, false) : `<h3>${besc(x.n)}</h3>${kSpPopis(x)}`);
    return;
  }
  const pj = T("[data-kinvpij]");
  if (pj) {
    const S = kartaStav(K.id),
      inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
      it = inv[+pj.dataset.kinvpij],
      x = kPred(it);
    if (!it || !x || !x.ef) return;
    const ef = x.ef,
      r = ef.lecit ? kVyraz(ef.lecit) : null,
      dh = ef.dhp ? kVyraz(String(ef.dhp)) : null;
    it.q = Math.max(0, (+it.q || 1) - 1);
    if (!it.q) inv.splice(+pj.dataset.kinvpij, 1);
    const ch = {inv},
      o = {hp: S.hp, thp: S.thp};
    let m = `${x.en}`;
    if (r) {
      const h0 = ((BOJ.s && BOJ.s.aktivni && BOJ.s.hraci) || []).find(q => bojKartaH(q) === K);
      if (h0) {
        bojPCZmena(h0.id, q => bojLecPC(q, K, r.tot), true);
        m += `: +${r.tot} HP (${r.txt})`;
      } else {
        m += ": " + bojLecPC(o, K, r.tot) + ` (${r.txt})`;
        ch.hp = o.hp != null && o.hp < kHPmax(K) ? o.hp : null;
      }
    }
    if (dh) {
      ch.thp = Math.max(+S.thp || 0, dh.tot);
      m += ` · dočasné HP ${ch.thp}`;
    }
    await kartaStavZmen(K.id, ch);
    kHodZapis({k: K.id, kdo: K.n, co: `Vypil ${x.en}`, tot: r ? r.tot : undefined, txt: m.slice(0, 290)});
    mmHlasG(`${K.n}: ${m}.`, 6000);
    return;
  }
});
document.addEventListener("change", async e => {
  const v = e.target.closest && e.target.closest("#kartyview,#bojpult,.bdm");
  if (!v) return;
  const t = e.target,
    K = kvK(t);
  if (t.matches("[data-kzf]")) {
    KZFL = t.value;
    kartyPrekresli();
    return;
  }
  if (t.matches("[data-kspolcil]")) {
    const K = typeof jaK === "function" ? jaK() : null,
      el = t.closest("[data-kid]"),
      K2 = el ? KARTBY[el.dataset.kid] : K;
    if (K2) KSPOLC[kSpolId(K2, +t.dataset.kspolcil)] = t.value;
    return;
  }
  if (!K) return;
  if (t.matches("[data-ktechadd]") && t.value) {
    kartaStavZmen(K.id, {tech: [...new Set([...kTech(K), t.value])].slice(0, 30)});
    kHodZapis({k: K.id, kdo: K.n, co: "Naučil se", txt: (STBY[t.value] || {}).n || t.value});
    return;
  }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.closest("#kartyview,#bojpult,.bdm")) return;
  const K = kvK(f),
    E = f.elements;
  if (f.matches("[data-kvlh]")) {
    e.preventDefault();
    const kid = f.dataset.k || (E.kdo && E.kdo.value) || "",
      KK = kid && KARTBY[kid];
    await kVlastniHod(KK ? KK.n : "Vypravěč", kid, E.v.value, E.co.value.trim() || E.v.value, E.zav.checked);
    return;
  }
  if (f.matches("[data-kpzach]")) {
    e.preventDefault();
    const ab = E.ab.value,
      dc = +E.dc.value || 0;
    KPS.ab = ab;
    KPS.dc = E.dc.value;
    await kPrehledHod(`Záchrana ${ab}`, k => [kZach(k, ab), 0, ""], dc);
    return;
  }
  if (f.matches("[data-kpdov]")) {
    e.preventDefault();
    const d = E.dov.value,
      dc = +E.dc.value || 0;
    KPS.dov = d;
    KPS.dc = E.dc.value;
    await kPrehledHod(
      d,
      k => {
        const r = kSvAdv(k, d);
        return [kDov(k, d), kAdvSum(0, r), r.map(x => x[1]).join(", ")];
      },
      dc,
    );
    return;
  }
  if (!K) return;
  if (f.matches("[data-kdusf]")) {
    e.preventDefault();
    const ctn = [E.c1.value].filter(Boolean),
      ner = [E.n1.value].filter(Boolean),
      duse = {};
    if (E.dr.value) duse.dr = E.dr.value;
    if (E.vz.value) duse.vz = E.vz.value;
    if (+E.fs.value > 1) duse.fs = +E.fs.value;
    if (ctn.length) duse.ctn = ctn;
    if (ner.length) duse.ner = ner;
    const sv = Math.max(0, Math.min(10, Math.round(+E.sv.value)));
    const D = kDuse(K);
    await kartaStavZmen(K.id, {duse: Object.keys(duse).length ? duse : null, sv}, `${K.n}: duše uložena.`);
    if (sv !== D.sv) kHodZapis({k: K.id, kdo: K.n, co: "Svědomí upraveno", txt: `${D.sv} → ${sv} (${SVST(sv)})`});
    return;
  }
});
/* ===== Hráč: přihlášení za postavu, stránka Hra, výzvy k hodu, tajné zprávy, upozornění, úkoly družiny, postup na úroveň (2026-10-16) ===== */
const KZAM = new Set();
const jaK = () => {
  const j = JA.get();
  return j && j.k && KARTBY[j.k] ? KARTBY[j.k] : null;
};
const kMuze = K => GMV || !window.MMDB || (JA.get() || {}).k === K.id || !KZAM.has(K.id);
async function jaPrihlas(kid, heslo) {
  const K = KARTBY[kid];
  if (!K) return false;
  if (!window.MMDB) {
    JA.set({k: kid, n: K.n});
    bojJa.set(K.n);
    mmHlasG(`Hraješ za ${K.n} (pamatuje si to tento prohlížeč).`, 4000);
    return true;
  }
  try {
    let t;
    if (!KZAM.has(kid)) t = await MMDB.hracHeslo(kid, heslo);
    else {
      t = await MMDB.hracPrihlas(kid, heslo);
      if (!t) {
        mmHlasG("Špatné heslo.", 4000);
        return false;
      }
    }
    JA.set({k: kid, t, n: K.n});
    KZAM.add(kid);
    bojJa.set(K.n);
    mmHlasG(`Přihlášen jako ${K.n}.`, 3500);
    hraPoll(true);
    return true;
  } catch (e) {
    mmHlasG(e.message || String(e), 6000);
    return false;
  }
}
async function jaOdhlas() {
  const j = JA.get();
  if (j && j.t && window.MMDB)
    try {
      await MMDB.hracOdhlas(j.t);
    } catch (e) {}
  JA.set(null);
  bojJa.set("");
  ZPR = [];
  route();
}
async function jaOver() {
  const j = JA.get();
  if (!j || !j.t || !window.MMDB) return;
  try {
    const k = await MMDB.hracKdo(j.t);
    if (!k) {
      JA.set(null);
      mmHlasG("Přihlášení hráče vypršelo – přihlas se znovu na stránce Hra.", 6000);
    }
  } catch (e) {}
}
function jaForm() {
  if (!KARTY.length) return `<p class="rsmall">Zatím tu není žádná karta postavy. Založ si účet a nahraj list z D&amp;D Beyond.</p>`;
  return `<form class="jaf" data-jaf><label>Hraji za <select name="k">${KARTY.map(k => `<option value="${besc(k.id)}">${besc(k.n)}${window.MMDB && !KZAM.has(k.id) ? " – zatím bez hesla" : ""}</option>`).join("")}</select></label>${window.MMDB ? `<label>Heslo <input name="h" type="password" minlength="4" maxlength="100" autocomplete="current-password" required></label>` : ""}<button class="gbtn">Hrát za tuto postavu</button></form>
    ${window.MMDB ? `<p class="rsmall">Kdo se ke kartě přihlásí jako první, zvolí si tím heslo – pak ji může měnit jen on a vypravěč. Zapomenuté heslo zruší vypravěč.</p>` : ""}`;
}
const NAVOD = `<ol class="navod"><li><b>Nahraj svou postavu.</b> V D&amp;D Beyond otevři postavu → <i>Export to PDF</i> a PDF nahraj tady na stránce <a href="#hra">Hra</a>, až se přihlásíš.</li>
  <li><b>Přihlas se</b> účtem (jméno a heslo, nebo Discord). Telefon si tě zapamatuje.</li>
  <li><b>Během sezení měj otevřenou stránku Hra.</b> Je na ní tvoje karta; vyskočí na ní, když máš házet, a když vypravěč připraví boj, objeví se na ní iniciativa a celý boj. Hody z karty se zapisují do společného záznamu.</li></ol>
  <ul class="navod2"><li>Ke každému hodu d20 web hodí i <b>kostku Závoje</b> (d6): 1–2 <b>Pokušení</b> – přijmeš bod hříchu, nebo nastane komplikace; 5–6 <b>Požehnání</b> – něco navíc (a šermířské techniky).</li>
  <li><b>Svědomí</b> (0–10) se mění na konci sezení při Zpytování podle bodů hříchu a dobrých skutků; jeho stav dává výhody i postihy.</li>
  <li><b>V boji</b> si na stránce Hra obsadíš volný slot družiny. Až budeš na tahu, telefon zavibruje a web připomene pohyb, akci, bonusovou akci a reakci.</li></ul>`;
/* ---- upozornění na pozadí (když je stránka otevřená, ale skrytá) ---- */
function mmNotif(t, b) {
  if (!document.hidden) return;
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      const n = new Notification(t, {body: b || "", icon: "art/img/kostka-180.png", tag: "mm-" + t});
      n.onclick = () => {
        focus();
        n.close();
      };
    }
  } catch (e) {}
}
const notifBtn = () =>
  "Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied"
    ? `<button type="button" class="gbtn ghost" data-notif>Povolit upozornění na telefonu</button>`
    : "";
/* ---- výzvy k hodu ---- */
let VYZVY = [],
  VYZVID = 0,
  VYZODP = 0;
async function vyzvyNacti() {
  if (!window.MMDB || !MMDB.vyzvyNacti) return false;
  try {
    const r = await MMDB.vyzvyNacti();
    const p = JSON.stringify(VYZVY);
    VYZVY = r || [];
    return p !== JSON.stringify(VYZVY);
  } catch (e) {
    return false;
  }
}
const vyzvaPro = (v, kid) => !v.zavrena && (!((v.data || {}).komu || []).length || v.data.komu.includes(kid));
/* Zpytování svědomí jako výzva: typ „hod“ s touto poznámkou (bez změny databáze); hráč hodí d10 na své kartě (kZpyt) */
const KZPYTV = "Zpytování svědomí";
const vyzvaTxt = d =>
  typeof vyzvaProti === "function" && vyzvaProti(d)
    ? d.pozn + " – použiješ Counterspell?"
    : d.typ === "hod" && d.pozn === KZPYTV
      ? "Zpytování svědomí (d10)"
      : d.typ === "zach"
        ? `záchrana ${d.ab}`
        : d.typ === "over"
          ? d.dov || `ověření ${KSK[d.ab] || d.ab}`
          : d.typ === "ini"
            ? "iniciativa"
            : d.typ === "odp"
              ? "krátký odpočinek"
              : `hod ${d.pozn || "d20"}`;
const vyzvyMoje = () => {
  const K = jaK();
  return K ? VYZVY.filter(v => vyzvaPro(v, K.id) && !(v.odpovedi || {})[K.id]) : [];
};
async function vyzvaHod(id, ne) {
  const v = VYZVY.find(x => x.id === id),
    K = jaK();
  if (!v || !K) return;
  const d = v.data;
  let r;
  if (typeof vyzvaProti === "function" && vyzvaProti(d)) {
    r = await vyzvaProtiOdpoved(v, K, !ne);
    if (!r) return;
  } else if (d.typ === "odp") {
    await kartaOdpocinek(K, false);
    r = {tot: 0, txt: "odpočinul"};
  } else if (d.typ === "hod" && d.pozn === KZPYTV) {
    const t = await kZpyt(K);
    r = {tot: +(String(t).match(/^d10 (\d+)/) || [])[1] || 0, txt: String(t).slice(0, 200)};
  } else if (d.typ === "hod") {
    const x = await kVlastniHod(K.n, K.id, d.pozn || "d20", `Výzva: ${d.pozn || "d20"}`, false);
    if (!x) return;
    r = {tot: Math.max(-50, Math.min(999, x.tot)), txt: x.txt.slice(0, 200)};
  } else {
    let b = 0,
      co = "",
      why = [];
    if (d.typ === "zach") {
      b = (K.zach || {})[d.ab] || 0;
      co = `Záchrana ${d.ab}`;
    } else if (d.typ === "ini") {
      b = kIni(K);
      co = "Iniciativa";
    } else if (d.dov && KDOVAB[d.dov]) {
      b = kDov(K, d.dov);
      co = d.dov;
      why = kSvAdv(K, d.dov);
    } else {
      b = kMod((K.vl || {})[d.ab] || 10);
      co = `Ověření ${KSK[d.ab] || d.ab}`;
    }
    const adv = kAdvSum(+d.adv || 0, why),
      h = await kartaHod(K, co + (d.dc && !d.skryt ? ` (SO ${d.dc})` : ""), b, {adv, why: why.map(x => x[1]).join(", ")});
    r = {tot: h.tot, d: h.d, zav: h.zav, txt: h.txt.slice(0, 200)};
    if (adv) r.adv = adv;
  }
  r.n = K.n.slice(0, 60);
  try {
    if (window.MMDB) await MMDB.vyzvaOdpoved(id, K.id, r);
    v.odpovedi = Object.assign({}, v.odpovedi, {[K.id]: r});
    hraPrekresli();
    vyzBar();
  } catch (e) {
    mmHlasG("Odpověď se nepodařilo poslat: " + (e.message || e), 5000);
  }
}
/* lišta s výzvou na kterékoli stránce */
function vyzBar() {
  let b = document.getElementById("mmvyz");
  const L = GMV || curView === "hra" ? [] : vyzvyMoje();
  if (!L.length) {
    if (b) b.remove();
    return;
  }
  if (!b) {
    b = document.createElement("div");
    b.id = "mmvyz";
    b.className = "mmvyz";
    document.body.appendChild(b);
  }
  /* všechny čekající výzvy (na hráčské Hře je lišta jediné místo, kde je hráč vidí – 2026-10-22) */
  b.innerHTML = L.slice(0, 4)
    .map(
      v =>
        `<div class="vyzk"><span>Vypravěč žádá: <b>${besc(vyzvaTxt(v.data))}</b>${v.data.dc && !v.data.skryt ? ` · SO ${v.data.dc}` : ""}${v.data.adv ? (v.data.adv > 0 ? " · s výhodou" : " · s nevýhodou") : ""}${v.data.pozn && v.data.typ !== "hod" ? ` · ${besc(v.data.pozn)}` : ""}</span>${typeof vyzvaProti === "function" && vyzvaProti(v.data) ? `<button type="button" class="gbtn" data-vyzhod="${v.id}">Použít Counterspell</button><button type="button" class="gbtn ghost" data-vyzne="${v.id}">Nechat být</button>` : `<button type="button" class="gbtn" data-vyzhod="${v.id}">🎲 ${v.data.typ === "odp" ? "Odpočinout" : v.data.pozn === KZPYTV ? "Zpytovat" : "Hodit"}</button>`}</div>`,
    )
    .join("");
}
const vyzvaForm =
  () => `<p class="vyzrych"><span class="bkzlh">Všichni hned:</span>${["Perception", "Insight", "Investigation", "Stealth", "Survival", "Athletics"].map(d => `<button type="button" class="kchip" data-vyzrychle="${d}" ${btip(`Všem postavám vyskočí ověření ${d}`)}>${d}</button>`).join("")}${BAB.map(a => `<button type="button" class="kchip" data-vyzrychle="${a}" ${btip(`Všem postavám vyskočí záchrana ${a}`)}>záchr. ${a}</button>`).join("")}</p><form class="kvlh vyzf" data-vyzf><label>Vyzvat k <select name="typ"><option value="zach">záchraně</option><option value="over">ověření</option><option value="ini">iniciativě</option><option value="odp">krátkému odpočinku</option><option value="hod">hodu výrazem</option></select></label>
  <select name="ab" aria-label="Vlastnost">${BAB.map(a => `<option${a === "WIS" ? " selected" : ""}>${a}</option>`).join("")}</select><select name="dov" aria-label="Dovednost"><option value="">— dovednost —</option>${Object.keys(
    KDOVAB,
  )
    .map(d => `<option>${d}</option>`)
    .join("")}</select>
  <input name="pozn" placeholder="výraz nebo poznámka" maxlength="60" aria-label="Výraz nebo poznámka"><label>SO <input name="dc" type="number" min="1" max="40" aria-label="Stupeň obtížnosti"></label><label><input type="checkbox" name="skryt"> SO jen pro mě</label>
  <select name="adv" aria-label="Výhoda"><option value="0">normálně</option><option value="1">s výhodou</option><option value="-1">s nevýhodou</option></select>
  <span class="vyzkomu">${KARTY.map(k => `<label><input type="checkbox" name="komu" value="${besc(k.id)}" checked> ${besc(k.n)}</label>`).join(" ")}</span><button class="gbtn">Vyzvat hráče</button></form>`;
async function vyzvaPosli(f) {
  const E = f.elements,
    o = {typ: E.typ.value};
  if (o.typ === "zach" || o.typ === "over") o.ab = E.ab.value;
  if (o.typ === "over" && E.dov.value) o.dov = E.dov.value;
  if (E.pozn.value.trim()) o.pozn = E.pozn.value.trim().slice(0, 60);
  if (+E.dc.value) o.dc = Math.max(1, Math.min(40, Math.round(+E.dc.value)));
  if (E.skryt.checked) o.skryt = true;
  if (+E.adv.value) o.adv = +E.adv.value;
  o.komu = [...f.querySelectorAll("[name=komu]:checked")].map(x => x.value);
  if (!o.komu.length) {
    mmHlasG("Vyber, koho vyzvat.", 3000);
    return;
  }
  if (!window.MMDB) {
    mmHlasG("Výzvy k hodu fungují jen na webu s databází.", 4000);
    return;
  }
  try {
    await MMDB.vyzva(o);
    await vyzvyNacti();
    mmHlasG("Výzva odeslána – hráčům vyskočí na telefonu.", 3500);
    hraPrekresli();
  } catch (e) {
    mmHlasG(e.message || String(e), 5000);
  }
}
function vyzvyGmHtml() {
  const L = VYZVY.filter(v => !v.zavrena).slice(0, 6);
  if (!L.length) return `<p class="rsmall">Žádná otevřená výzva.</p>`;
  return L.map(v => {
    const d = v.data,
      ids = d.komu && d.komu.length ? d.komu : KARTY.map(k => k.id);
    return `<div class="vyzgm"><b>${besc(vyzvaTxt(d))}</b>${d.dc ? ` · SO ${d.dc}` : ""}${d.adv ? (d.adv > 0 ? " · výhoda" : " · nevýhoda") : ""} <button type="button" class="gbtn ghost" data-vyzx="${v.id}">uzavřít</button>
    <ul>${ids
      .slice()
      .sort((a, b) => {
        const A = (v.odpovedi || {})[a],
          B = (v.odpovedi || {})[b];
        return (B ? B.tot : -99) - (A ? A.tot : -99);
      })
      .map(kid => {
        const o = (v.odpovedi || {})[kid],
          k = KARTBY[kid];
        return `<li>${besc(k ? k.n : kid)}: ${o ? `<b class="${d.dc ? (o.tot >= d.dc ? "bkr" : "bmis") : ""}">${o.tot}</b> <small>${besc(o.txt || "")}</small>${o.zav ? ` <span class="bzv ${o.zav <= 2 ? "zp" : o.zav >= 5 ? "zb" : ""}">${o.zav <= 2 ? "Pokušení" : o.zav >= 5 ? "Požehnání" : "Závoj"} ${o.zav}</span>` : ""}${d.dc && d.typ !== "odp" ? (o.tot >= d.dc ? " ✓" : " ✗") : ""}` : `<i>čeká…</i>`}</li>`;
      })
      .join("")}</ul></div>`;
  }).join("");
}
/* ---- tajné zprávy ---- */
let ZPR = [],
  ZPRG = [],
  ZPRK = "";
const zprVideno = {
  get() {
    try {
      return +localStorage.getItem("mm-zpr-videno") || 0;
    } catch (e) {
      return 0;
    }
  },
  set(v) {
    try {
      localStorage.setItem("mm-zpr-videno", String(v));
    } catch (e) {}
  },
};
async function zpravyNacti() {
  if (!window.MMDB || !MMDB.zpravy) return false;
  try {
    if (GMV) {
      const r = (await MMDB.zpravyGm()) || [];
      const ch = JSON.stringify(r) !== JSON.stringify(ZPRG);
      ZPRG = r;
      return ch;
    }
    const K = jaK();
    if (!K || !KZAM.has(K.id) || !(JA.get() || {}).t) return false;
    const r = (await MMDB.zpravy(K.id)) || [];
    const ch = JSON.stringify(r) !== JSON.stringify(ZPR);
    ZPR = r;
    return ch;
  } catch (e) {
    return false;
  }
}
const zprHtml = L =>
  L.length
    ? `<ol class="zprl">${L.slice(-30)
        .map(
          z =>
            `<li class="${z.gm ? "zgm" : "zja"}"><small>${z.gm ? "Vypravěč" : "Ty"} · ${(() => {
              try {
                return new Date(z.cas).toLocaleString("cs-CZ", {day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"});
              } catch (e) {
                return "";
              }
            })()}</small>${besc(z.t).replace(/\n/g, "<br>")}</li>`,
        )
        .join("")}</ol>`
    : `<p class="rsmall">Zatím žádné zprávy.</p>`;
async function zpravaPosli(kid, t) {
  t = String(t || "").trim();
  if (!t) return;
  try {
    await MMDB.zprava(kid, t.slice(0, 2000));
    await zpravyNacti();
    hraPrekresli();
  } catch (e) {
    mmHlasG(e.message || String(e), 5000);
  }
}
/* ---- pravidelné načítání pro hráče i vypravěče ---- */
let HRAP = null;
/* co: množina druhů z pulsu (25-puls.js) – načte se jen to, co se změnilo; bez ní vše */
async function hraPoll(hned, co) {
  if (!window.MMDB) return;
  const chci = k => !co || co.has(k);
  const a = chci("vyzvy") ? await vyzvyNacti() : false,
    b = chci("zpravy") ? await zpravyNacti() : false;
  if (co ? co.has("potvrz") : hned || !hraPoll.pt || Date.now() - hraPoll.pt > 15000) {
    hraPoll.pt = Date.now();
    await potvrzNacti();
  }
  if (chci("navrhy")) {
    const n0 = navrhyCeka().length,
      zm = await navrhyNacti(),
      n1 = navrhyCeka().length;
    if (zm) {
      if (GMV && n1 > n0 && !hned) mmHlasG(`Hráč žádá o schválení: ${navrhyCeka()[0].data.popis || "návrh"}.`, 5000);
      if (curView === "boj") renderBoj();
      if (curView === "karty" || mmNaHre()) kartyPrekresli();
    }
  }
  if ((mmNaHre() || curView === "karty") && chci("pokladna")) {
    const p0 = JSON.stringify(POKL);
    await poklNacti();
    if (p0 !== JSON.stringify(POKL)) hraPrekresli();
  }
  if (!GMV) {
    const m = vyzvyMoje(),
      top = Math.max(0, ...m.map(v => v.id));
    if (top > VYZVID) {
      VYZVID = top;
      try {
        navigator.vibrate && navigator.vibrate([120, 60, 120]);
      } catch (e) {}
      mmNotif("Vypravěč žádá hod", vyzvaTxt(m[0].data));
      mmHlasG(`Vypravěč žádá: ${vyzvaTxt(m[0].data)}`, 5000);
    }
    const nz = ZPR.filter(z => z.gm && z.id > zprVideno.get());
    if (nz.length) {
      zprVideno.set(nz[nz.length - 1].id);
      mmNotif("Zpráva od vypravěče", nz[nz.length - 1].t);
      mmHlasG("Zpráva od vypravěče: " + nz[nz.length - 1].t.slice(0, 140), 7000);
    }
  } else {
    try {
      bojVyzZpracuj();
    } catch (e) {
      console.error(e);
    }
    try {
      if (typeof bojProtiZpracuj === "function") bojProtiZpracuj();
    } catch (e) {
      console.error(e);
    }
    const n = VYZVY.filter(v => !v.zavrena).reduce((a, v) => a + Object.keys(v.odpovedi || {}).length, 0);
    if (n > VYZODP && !hned) {
      const v = VYZVY.find(x => !x.zavrena && Object.keys(x.odpovedi || {}).length);
      if (v && curView === "boj") renderBoj();
      else if (v && curView !== "hra") mmHlasG(`Hráči odpovídají na výzvu (${vyzvaTxt(v.data)}) – výsledky v Hře › Družina.`, 4500);
    } else if (a && curView === "boj") renderBoj();
    VYZODP = n;
    const nz = ZPRG.filter(z => !z.gm && z.id > zprVideno.get());
    if (nz.length) {
      zprVideno.set(nz[nz.length - 1].id);
      if (!hned) mmHlasG(`Zpráva od ${(KARTBY[nz[nz.length - 1].k] || {}).n || "hráče"}: ${nz[nz.length - 1].t.slice(0, 120)}`, 7000);
    }
  }
  if (a || b || hned) hraPrekresli();
  vyzBar();
}
function hraStart() {
  if (HRAP || !window.MMDB) return;
  jaOver();
  jaDiscordInit();
  poklNacti();
  hraPoll(true);
  HRAP = true;
  pulsStart();
  /* skrytá záložka nedotazuje (upozornění v telefonu chodí i tak); po návratu hned načíst */
  /* po návratu do záložky se puls zeptá hned (25-puls.js) */
}
function hraPrekresli() {
  if (!GMV) {
    hraHracPrekresli();
    return;
  }
  renderHra();
}
/* ---- úkoly družiny a postup na úroveň (v herním stavu, který čtou všichni) ---- */
async function ukolyUloz(L) {
  await hraUloz({ukoly: L});
  hraPrekresli();
  if (curView === "kronika") kronikaPrekresli();
}
function postupBanner(K) {
  const n = +((HRA && HRA.postup) || 0);
  return n && kLv(K) < n
    ? `<p class="kpostup">Družina postupuje na <b>${n}. úroveň</b>. Úroveň přidej v <b>Úpravách postavy</b> (povolání +1) – životy, kostky životů, zdatnost, sloty a počty použití se přepočítají hned. Nové rysy a jejich texty přinese nové PDF z D&amp;D Beyond (Level Up), stav postavy zůstane.</p>`
    : "";
}
/* ---- stránka Hra ---- */
function hraStavHtml() {
  const s = BOJ.s;
  let zb = "";
  try {
    zb = zavojBan();
  } catch (e) {}
  return `<div class="hrastav"><p><b>${besc(partyDate())}</b>${HRA && HRA.hodina != null ? `, ${HRA.hodina}:00` : ""}${partyPlace() ? ` · ${besc(partyPlace())}` : ""}</p>${zb}
    ${bojBezi(s) ? `<p class="hraboj"><b>Probíhá boj</b> – ${s.kolo || 1}. kolo. <a class="gbtn" href="#hra">Do boje ⚔</a></p>` : s && s.priprava ? `<p class="hraboj"><b>Chystá se boj</b> – v záložce Boj hoď iniciativu. <a class="gbtn" href="#hra">Do boje ⚔</a></p>` : ""}</div>`;
}
/* změny od posledního sezení: poprvé se načtou na pozadí a stránka se překreslí */
function hraZmenyHtml() {
  if (!renderHra.zm) {
    renderHra.zm = 1;
    zmenyNacti().then(() => {
      if (mmNaHre()) renderHra();
    });
  }
  return zmenyHtml();
}
/* ===== hráčská stránka Hra (2026-10-22): jen karta; iniciativa a boj se na ní objeví, až vypravěč boj připraví =====
   Uvnitř je to stránka Boj (route: hráč #hra → renderBoj v 20d); mimo boj ukáže renderBoj tohle. */
function hraPrihlasHtml() {
  return `<section class="hrapri"><h2 class="arttitle">Hra</h2>${
    typeof ucetMuze === "function" && ucetMuze()
      ? `<p class="rsmall">Jednou si založíš účet (jméno a heslo, nebo Discord), nahraješ list postavy z D&amp;D Beyond a postava zůstane tvoje.</p><div data-ucetbox="hra">${ucetBoxHtml("hra")}</div><details class="bjapd"><summary>Starší způsob – heslo přímo ke kartě</summary>${jaForm()}</details>`
      : jaForm()
  }<details class="bjapd"><summary>Jak hrát na webu</summary>${NAVOD}</details></section>`;
}
/* hráč vidí na Hře jen svou kartu (karty ostatních hráčů na Hře nejsou – rozhodnutí 2026-10-22) */
function hraHracHtml() {
  const K = jaK();
  if (!K && DCU.ok) return `<section class="hrapri"><h2 class="arttitle">Hra</h2>${jaBezKartyHtml()}</section>`;
  if (!K) return hraPrihlasHtml();
  return `<section class="hraja">${kartaJednaHtml(K)}</section>`;
}
/* obnova na pozadí (výzvy, zprávy, pokladna…): nepřekreslí, když hráč zrovna píše – dokreslí se, až pole opustí */
function hraHracPrekresli() {
  if (curView !== "boj") return;
  const v = document.getElementById("bojview"),
    ae = document.activeElement;
  if (v && ae && v.contains(ae) && ae.matches("input:not([type=checkbox]):not([type=radio]),textarea,select")) {
    hraHracPrekresli.cek = 1;
    return;
  }
  bojPrekresli();
}
document.addEventListener("focusout", () =>
  setTimeout(() => {
    if (!hraHracPrekresli.cek) return;
    hraHracPrekresli.cek = 0;
    hraHracPrekresli();
  }, 0),
);
/* ===== nová místa oddílů dřívější hráčské Hry (2026-10-22): listy na vlastní kartě =====
   ✉ Od vypravěče (tajné zprávy, ukázky) v hlavičce karty, pokladna družiny v listu Peníze, telefon a účet v listu Postava */
const zprCteno = {
  get() {
    try {
      return +localStorage.getItem("mm-zpr-cteno") || 0;
    } catch (e) {
      return 0;
    }
  },
  set(v) {
    try {
      localStorage.setItem("mm-zpr-cteno", String(v));
    } catch (e) {}
  },
};
/* vlastní karta přihlášeného hráče (ne vypravěč, ne cizí karta ke čtení) */
const hraMoje = K => !GMV && !!K && (JA.get() || {}).k === K.id;
function hraVypravBtn(K, shOpen) {
  if (!hraMoje(K) || !window.MMDB) return "";
  const n = ZPR.filter(z => z.gm && z.id > zprCteno.get()).length;
  return `<button type="button" class="bdmsq bdmvypr" data-bdmsh="vyprav" aria-expanded="${shOpen === "vyprav"}" aria-label="Od vypravěče: tajné zprávy a ukázky${n ? ` – nové: ${n}` : ""}" ${btip("Od vypravěče: tajné zprávy a ukázky")}>${bdmIc("dopis")}${n ? `<b class="bdmvyprn">${n}</b>` : ""}</button>`;
}
function hraVypravList(K) {
  const z = ZPR.filter(x => x.gm);
  if (z.length) zprCteno.set(Math.max(zprCteno.get(), ...z.map(x => x.id)));
  const u = UKAZKY[0];
  return [
    "Od vypravěče",
    `<p class="bdmnote"><b>Tajně vypravěči</b> – vidí jen vypravěč.</p>${zprHtml(ZPR)}<form class="zprf" data-zprf="${besc(K.id)}"><textarea name="t" rows="2" maxlength="2000" placeholder="Co má vědět jen vypravěč" required></textarea><button class="gbtn ghost">Poslat</button></form>
    <p class="bdmnote"><b>Ukázky</b> – co vypravěč ukázal družině.</p>${u ? `<p class="bdmrow"><button type="button" class="bdmbtn" data-ukotevri="${u.id}">${besc(u.n || "Ukázka")}</button></p>${UKAZKY.length > 1 ? `<details class="bjapd"><summary>Starší ukázky</summary>${ukSeznam()}</details>` : ""}` : `<p class="bdmnote">Zatím žádné.</p>`}`,
  ];
}
function hraUcetHtml(K) {
  if (!hraMoje(K)) return "";
  const ja = JA.get() || {};
  return `${aplikaceHtml(K.id)}<p class="bojbtn">${notifBtn()}${window.MMDB && !(ja.d && DCU.typ !== "email") ? `<button type="button" class="gbtn ghost" data-jaheslo>Změnit heslo</button>` : ""}${ja.d ? `<button type="button" class="gbtn ghost" data-discordx>${jaOdhlasTxt()} (${besc(K.n)})</button>` : `<button type="button" class="gbtn ghost" data-jaodhlas>Odhlásit (${besc(K.n)})</button>`}</p>`;
}
/* ===== řídicí pult vypravěče (2026-10-22): Hra = Boj + záložky Družina a Sezení (dřívější stránka Hra vypravěče) =====
   renderBoj (20d) obalí #bojview navigací (pultObal); v záložce Družina/Sezení vykreslí pultVykresli místo boje. */
function pultNavHtml() {
  const n = typeof navrhyCeka === "function" ? navrhyCeka().length : 0,
    s = BOJ.s || {},
    t = [
      [
        "boj",
        "#hra",
        s.scena && s.aktivni ? "Scéna" : `⚔ Boj${s.aktivni ? ` <small>${s.kolo || 1}. kolo</small>` : s.priprava ? " <small>příprava</small>" : ""}`,
      ],
      ["druzina", "#hra/druzina", `Družina${n ? ` <b class="pultn">${n}</b>` : ""}`],
      ["sezeni", "#hra/sezeni", "Sezení"],
    ];
  return t
    .map(([k, h, x]) => `<a href="${h}" class="pultt${PULTTAB === k ? " on" : ""}"${PULTTAB === k ? ' aria-current="page"' : ""}>${x}</a>`)
    .join("");
}
function pultObal(outer) {
  let inner = outer.querySelector(":scope > #bojpult");
  if (!inner) {
    outer.innerHTML = `<nav class="pultnav subnav" aria-label="Řídicí pult"></nav><div id="bojpult"></div>`;
    inner = outer.querySelector(":scope > #bojpult");
  }
  const nav = outer.querySelector(":scope > .pultnav"),
    h = pultNavHtml();
  if (nav.innerHTML !== h) nav.innerHTML = h;
  return inner;
}
function pultDruzinaHtml() {
  const zk = ZPRK || (KARTY[0] || {}).id || "",
    zL = ZPRG.filter(z => z.k === zk);
  return `${hraStavHtml()}
      <section><h3 class="uvh2">Výzva k hodu</h3>${vyzvaForm()}${vyzvyGmHtml()}</section>
      <section><h3 class="uvh2">Akce hráčů</h3><p class="kvlh">${potvrzHtml("hra")}</p>${navrhyGmHtml() || `<p class="rsmall">Nic nečeká na schválení. Útoky hráčů k potvrzení jsou v záložce Boj.</p>`}</section>
      ${kPrehledHtml()}
      <section><h3 class="uvh2">Tajné zprávy</h3>${
        KARTY.length
          ? `<p class="kvlh"><label>Postava <select data-zprk>${KARTY.map(k => {
              const n = ZPRG.filter(z => z.k === k.id && !z.gm).length;
              return `<option value="${besc(k.id)}"${k.id === zk ? " selected" : ""}>${besc(k.n)}${n ? ` (${n})` : ""}</option>`;
            }).join("")}</select></label></p>${zprHtml(zL.map(z => Object.assign({}, z, {gm: z.gm})))}
        <form class="zprf" data-zprf="${besc(zk)}"><textarea name="t" rows="2" maxlength="2000" placeholder="Zpráva jen pro tuto postavu" required></textarea><button class="gbtn ghost">Poslat</button></form>`
          : `<p class="rsmall">Bez karet postav.</p>`
      }</section>
      ${hraUkolyHtml()}
      <section><h3 class="uvh2">Postup na úroveň</h3><form class="kvlh" data-hrpost><label>Družina má mít úroveň <input name="u" type="number" min="1" max="20" value="${+((HRA && HRA.postup) || 0) || ""}" aria-label="Úroveň"></label><button class="gbtn ghost">Oznámit postup</button></form><p class="rsmall">Hráčům s nižší úrovní se na kartě ukáže výzva nahrát nové PDF.</p></section>`;
}
function pultSezeniHtml() {
  return `${hraZmenyHtml()}
      <section><h3 class="uvh2">Ukázat hráčům</h3>${ukForm()}<p class="rsmall"><a href="#sezeni">Příprava sezení →</a></p></section>
      ${poklHtml()}
      <section><h3 class="uvh2">Hráči a postavy</h3><ul class="kfeat">${KARTY.map(k => `<li><b>${besc(k.n)}</b> ${KZAM.has(k.id) ? `– hraje ${besc(KHRAC[k.id] || "hráč s heslem")} <button type="button" class="gbtn ghost" data-hrzrus="${besc(k.id)}" ${btip("Uvolní postavu: zruší vazbu na Discord účet i heslo. Hráč si pak zvolí znovu.")}>uvolnit</button>` : "– volná (zabere ji první, kdo si ji zvolí)"}</li>`).join("")}</ul></section>
      <section><h3 class="uvh2">Hody do Discordu</h3><form class="kvlh" data-discordf><input name="u" placeholder="https://discord.com/api/webhooks/…" style="flex:1" aria-label="Webhook kanálu"><button class="gbtn ghost">Uložit</button></form><p class="rsmall">Na Discordu: nastavení kanálu → Integrace → Webhooky → Nový webhook → Kopírovat URL. Každý hod z karet pak přijde do kanálu (skryté hody vypravěče ne). Prázdné pole webhook zruší.</p></section>
      <section><h3 class="uvh2">Příkaz /hod na Discordu</h3><p class="rsmall">Hráči házejí přímo z Discordu (<code>/hod Stealth</code>, <code>/hod záchrana CON</code>, <code>/hod 2d6+3</code>); hod se zapíše sem do záznamu za jejich postavu – podle účtu Discord, kterým se na webu přihlásili. Jednorázové nastavení: v Discord Developer Portal u aplikace vlož do <b>Interactions Endpoint URL</b> adresu <code>${besc(((window.MMDB && MMDB.cfg) || {}).url || "https://…supabase.co")}/functions/v1/mm-discord</code>; v Supabase (Edge Functions → Secrets) ulož <code>DISCORD_PUBLIC_KEY</code>, <code>DISCORD_APP_ID</code> a <code>DISCORD_TOKEN</code> (token bota nikomu neposílej). Pak klikni:</p><p><button type="button" class="gbtn ghost" data-discprik>Zaregistrovat příkaz /hod</button></p></section>
      ${aplikaceHtml(null)}
      <section><h3 class="uvh2">Jak hrát na webu (pro hráče)</h3>${NAVOD}</section>`;
}
/* záložka Družina / Sezení; nepřekreslí, když vypravěč zrovna píše – dokreslí se po opuštění pole */
function pultVykresli(box) {
  const ae = document.activeElement;
  if (box.firstElementChild && ae && box.contains(ae) && ae.matches("input:not([type=checkbox]):not([type=radio]),textarea,select")) {
    pultVykresli.cek = 1;
    return;
  }
  pultVykresli.cek = 0;
  if (!KLOAD) {
    KLOAD = 1;
    Promise.all([kartyNacti(), hodyNacti()]).then(() => {
      if (curView === "boj") renderBoj();
    });
  }
  box.innerHTML = PULTTAB === "druzina" ? pultDruzinaHtml() : pultSezeniHtml();
  pojZnac(box.querySelector(".kprehled"));
}
document.addEventListener("focusout", () =>
  setTimeout(() => {
    if (pultVykresli.cek && curView === "boj" && PULTTAB !== "boj") renderBoj();
  }, 0),
);
function renderHra() {
  if (!GMV) {
    hraHracPrekresli();
    return;
  }
  if (curView === "boj" && PULTTAB !== "boj") renderBoj();
}
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches) return;
  if (f.matches("[data-jaf]")) {
    e.preventDefault();
    const E = f.elements;
    if (await jaPrihlas(E.k.value, E.h ? E.h.value : "")) route();
    return;
  }
  if (f.matches("[data-vyzf]")) {
    e.preventDefault();
    if (GMV) vyzvaPosli(f);
    return;
  }
  if (f.matches("[data-zprf]")) {
    e.preventDefault();
    await zpravaPosli(f.dataset.zprf, f.elements.t.value);
    return;
  }
  if (f.matches("[data-hrukf]") && GMV) {
    e.preventDefault();
    const t = f.elements.t.value.trim().slice(0, 160);
    if (t) ukolyUloz([...((HRA && HRA.ukoly) || []), {t}]);
    return;
  }
  if (f.matches("[data-hrpost]") && GMV) {
    e.preventDefault();
    const n = Math.round(+f.elements.u.value) || null;
    await hraUloz({postup: n});
    hraPrekresli();
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-zprk]")) {
    ZPRK = t.value;
    hraPrekresli();
    return;
  }
  if (t.matches && t.matches("[data-hruk]") && GMV) {
    const L = [...((HRA && HRA.ukoly) || [])].map(x => Object.assign({}, x)),
      u = L[+t.dataset.hruk];
    if (u) {
      u.hot = t.checked;
      if (!u.hot) delete u.hot;
      ukolyUloz(L);
    }
  }
});
document.addEventListener("click", async e => {
  const T = s => e.target.closest(s);
  const vh = T("[data-vyzhod]");
  if (vh) {
    vyzvaHod(+vh.dataset.vyzhod);
    return;
  }
  const vn = T("[data-vyzne]");
  if (vn) {
    vyzvaHod(+vn.dataset.vyzne, true);
    return;
  }
  const vx = T("[data-vyzx]");
  if (vx && GMV) {
    try {
      await MMDB.vyzvaZavri(+vx.dataset.vyzx);
      await vyzvyNacti();
      hraPrekresli();
    } catch (err) {
      mmHlasG(err.message, 4000);
    }
    return;
  }
  if (T("[data-notif]")) {
    try {
      await Notification.requestPermission();
    } catch (err) {}
    hraPrekresli();
    return;
  }
  if (T("[data-jaodhlas]")) {
    jaOdhlas();
    return;
  }
  if (T("[data-jaheslo]") && (JA.get() || {}).d && DCU.typ === "email") {
    const h = prompt("Nové heslo k účtu (aspoň 6 znaků):");
    if (!h) return;
    try {
      await MMDB.ucetHeslo(h);
      mmHlasG("Heslo změněno.", 3000);
    } catch (err) {
      mmHlasG(err.message, 5000);
    }
    return;
  }
  if (T("[data-jaheslo]")) {
    const K = jaK(),
      h = prompt("Nové heslo (aspoň 4 znaky):");
    if (!K || !h) return;
    try {
      const t = await MMDB.hracHeslo(K.id, h);
      JA.set({k: K.id, t, n: K.n});
      mmHlasG("Heslo změněno.", 3000);
    } catch (err) {
      mmHlasG(err.message, 5000);
    }
    return;
  }
  const ux = T("[data-hrukx]");
  if (ux && GMV) {
    const L = [...((HRA && HRA.ukoly) || [])];
    L.splice(+ux.dataset.hrukx, 1);
    ukolyUloz(L);
    return;
  }
  const zr = T("[data-hrzrus]");
  if (zr && GMV) {
    if (!confirm("Uvolnit postavu? Zruší se vazba na hráčův Discord účet i heslo; postavu si pak může zvolit kdokoli.")) return;
    try {
      await MMDB.hracZrus(zr.dataset.hrzrus);
      await MMDB.jaUvolni(zr.dataset.hrzrus);
      KZAM.delete(zr.dataset.hrzrus);
      await kartyNacti();
      hraPrekresli();
    } catch (err) {
      mmHlasG(err.message, 5000);
    }
    return;
  }
});
/* ===== Průvodce tahem hráče v Boji ===== */
const BPT = {k: null};
function bojPruvodce(s, me) {
  const K = bojKartaH(me),
    k = `${s.kolo}:${s.tah}`;
  if (BPT.k !== k) {
    BPT.k = k;
    BPT.p = BPT.a = BPT.b = 0;
  }
  if (K && !KSPD)
    kSpNacti()
      .then(() => {
        if (curView === "boj") renderBoj();
      })
      .catch(() => {});
  const sl = K ? kSloty(K).filter(q => q.u < q.max) : [],
    kz = K ? ((K.kouzla || {}).seznam || []).filter(x => x.st === 0 || sl.some(q => q.st >= x.st)) : [];
  const ct = x => {
      const d = kSp(x.n);
      return d ? d.ct || "" : "";
    },
    sp = re => kz.filter(x => re.test(ct(x))).map(x => x.n);
  const tech = K ? kTechMozne(K, false) : [],
    U = K ? kartaStav(K.id).zdr || {} : {};
  const zd = K ? (K.zdroje || []).filter(q => (U[q.n] || 0) < q.max).map(q => `${q.n} (${q.max - (U[q.n] || 0)})`) : [];
  const rk = !(s.reak || {})[me.id];
  const ch = (id, l, sub) =>
    `<label class="bptk${BPT[id] ? " on" : ""}"><input type="checkbox" data-bpt="${id}"${BPT[id] ? " checked" : ""}> <b>${l}</b>${sub ? ` <small>${sub}</small>` : ""}</label>`;
  const chips = (L, tip) => (L.length ? L.map(n => `<span class="chip" ${tip ? btip(tip) : ""}>${besc(n)}</span>`).join(" ") : "<small>–</small>");
  return `<section class="bpruv" aria-label="Průvodce tahem"><h4 class="bsph">Tvůj tah</h4>
    <div class="bptks">${ch("p", "Pohyb", K ? besc(kRychTxt(K)) : "rychlost")}${ch("a", "Akce", "")}${ch("b", "Bonusová akce", "")}<span class="bptk ${rk ? "" : "on"}"><b>Reakce</b> <small>${rk ? "k dispozici" : "použita"}</small></span></div>
    <dl class="bptl"><dt>Akce</dt><dd>${
      K
        ? chips(
            (K.utoky || []).map(a => `${a.n} ${bsg(+a.b || 0)}${a.pocet > 1 ? ` ${a.pocet}×` : ""}`),
            "Útok: formulář Útok nahoře",
          )
        : ""
    } ${chips(sp(/^Akce/))} ${BAKCE.filter(a => a[0] !== "Útok")
      .map(a => `<span class="chip" ${btip(`${a[1]}: ${a[2]}`)}>${a[0]}</span>`)
      .join(" ")}</dd>
      <dt>Bonusová akce</dt><dd>${chips(sp(/^Bonusov/))} ${chips(tech.filter(t => /bonusov/.test(t.c)).map(t => t.n))}</dd>
      <dt>Reakce</dt><dd><span class="chip" ${btip("Opportunity Attack: když nepřítel opouští tvůj dosah")}>Příležitostný útok</span> ${chips(sp(/^Reakce/))} ${chips(tech.filter(t => /reakce/.test(t.c)).map(t => t.n))}</dd>
      ${zd.length ? `<dt>Schopnosti</dt><dd>${chips(zd)}</dd>` : ""}</dl>
    ${bojKonecBtn(me.id)}</section>`;
}
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-bpt]")) {
    BPT[t.dataset.bpt] = t.checked ? 1 : 0;
    t.closest("label").classList.toggle("on", t.checked);
  }
});
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-bkonec]");
  if (!b) return;
  const s = BOJ.s;
  if (!s || !bojDB || !bojDB.hrac) return;
  try {
    await bojDB.hrac(b.dataset.bkonec, "hotovo", (s.kolo || 1) * 100 + (s.tah || 0));
    mmHlasG("Tah ukončen – vypravěč pokračuje.", 3500);
    BPT.k = null;
    try {
      navigator.vibrate && navigator.vibrate(40);
    } catch (err) {}
  } catch (err) {
    mmHlasG(err.message || String(err), 5000);
  }
});
/* karta: poznámky, zátěž, připoutání */
const kLb = w => {
  const m = String(w || "")
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?/);
  return m ? (m[2] ? +m[1] / +m[2] : +m[1]) : 0;
};
function kZatez(K, inv, pen) {
  const mg = new Set((inv || []).filter(x => KKONTM.test(x.n)).map(x => x.n)),
    w =
      (inv || []).filter(x => !(x.v && mg.has(x.v))).reduce((a, x) => a + kLb(x.w), 0) +
      Object.values(pen || {}).reduce((a, v) => a + (+v || 0), 0) / 50,
    max = 15 * kVl(K, "STR") * (/goliath/i.test(K.druh || "") || (K.rysy2 || []).some(r => /powerful build/i.test(r.n)) ? 2 : 1);
  return {w, max, pret: w > max};
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-kpri]");
  if (!b) return;
  const K = kvK(b);
  if (!K) return;
  const S = kartaStav(K.id),
    inv = [...(S.inv || K.vybaveni || [])].map(y => Object.assign({}, y)),
    it = inv[+b.dataset.kpri];
  if (!it) return;
  if (!it.pripoutano && inv.filter(x => x.pripoutano).length >= 3) {
    mmHlasG("Připoutaný smíš mít nejvýš 3 magické předměty (Attunement).", 4500);
    return;
  }
  if (it.pripoutano) delete it.pripoutano;
  else it.pripoutano = true;
  await kartaStavZmen(K.id, {inv});
  kHodZapis({k: K.id, kdo: K.n, co: it.pripoutano ? "Připoutal předmět" : "Zrušil připoutání", txt: it.n});
});
let KPOZT = null;
document.addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kpozn]")) return;
  const K = kvK(t);
  if (!K) return;
  clearTimeout(KPOZT);
  KPOZT = setTimeout(() => {
    const v = t.value.slice(0, 4000);
    KST[K.id] = Object.assign({}, kartaStav(K.id), {pozn: v || undefined});
    KDB.stav(K.id, "pozn", v || null).catch(err => {
      if (kSitChyba(err)) kFrontaPridej({t: "s", id: K.id, k: "pozn", v: v || null});
      else mmHlasG("Poznámky se nepodařilo uložit: " + err.message, 5000);
    });
  }, 900);
});
/* rysy a akce z PDF D&D Beyond: názvy, čas aktivace (akce / bonusová akce / reakce), počty použití a texty.
   Texty jsou texty příruček – ukládají se zvlášť a vidí je jen vlastník postavy a vypravěč. */
function kRysyZPdf(F) {
  const pole = re =>
    F.filter(q => q && q.f && re.test(String(q.f).trim()))
      .map(q => ({n: +(String(q.f).match(/(\d+)\s*$/) || [0, 0])[1], v: String(q.v || "").replace(/\r/g, "")}))
      .sort((a, b) => a.n - b.n);
  const spoj = L => L.map(x => x.v).join("\n");
  const cas = t => (/\bBonus Action\b/i.test(t) ? "BA" : /\bReaction\b/i.test(t) ? "R" : /\b\d*\s*Action\b/i.test(t) ? "A" : "");
  const cist = t =>
    String(t || "")
      .replace(/[’‘]/g, "'")
      .replace(/\s*•\s*\d+\s*\/\s*(Long|Short)\s*Rest.*$/i, "")
      .replace(/\s*•\s*(PHB|XGtE|TCoE|SCAG|EE|br|MotM|FToD|BGG|TBoMT|DMG|BMT|EGtW|VGtM|MToF|ERLW|GGtR|SRD|Basic)[^•]*$/i, "")
      .replace(/\s*•\s*$/, "")
      .trim();
  const rysy = [],
    texty = {},
    akce = {A: [], BA: [], R: []};
  let sek = "",
    cur = null;
  const pridej = (n, o) => {
    n = cist(n);
    if (!n) return null;
    let r = rysy.find(x => x.n === n);
    if (!r) {
      r = Object.assign({n, s: sek}, o || {});
      rysy.push(r);
    }
    return r;
  };
  spoj(pole(/^FeaturesTraits\d+$/i))
    .split("\n")
    .forEach(raw => {
      const l = raw.replace(/\s+$/, ""),
        t = l.trim();
      if (!t) return;
      const ms = t.match(/^===\s*(.+?)\s*===$/);
      if (ms) {
        sek = ms[1];
        cur = null;
        return;
      }
      const mf = t.match(/^\*\s*(.+)$/);
      if (mf) {
        cur = pridej(mf[1]);
        return;
      }
      const mu = t.match(/^\|\s*(.+)$/);
      if (mu) {
        const x = mu[1];
        const use = x.match(/^(\d+)\s*\/\s*(Long|Short)\s*Rest(?:\s*•\s*(.*))?$/i),
          jen = x.match(/^(\d+\s+)?(Action|Bonus Action|Reaction)$/i),
          pojm = x.match(/^(.+?):\s*(\d+\s+)?(Action|Bonus Action|Reaction)$/i);
        if (use && cur) {
          cur.max = +use[1];
          cur.obn = /short/i.test(use[2]) ? "krátký odpočinek" : "dlouhý odpočinek";
          if (use[3]) cur.cas = cas(use[3]);
          return;
        }
        if (jen && cur) {
          cur.cas = cas(x);
          return;
        }
        if (pojm) {
          const r = pridej(pojm[1], {sub: 1});
          if (r) r.cas = cas(pojm[3]);
          return;
        }
        cur = pridej(x, {sub: 1});
        return;
      }
      if (cur) {
        texty[cur.n] = (texty[cur.n] ? texty[cur.n] + "\n" : "") + t;
      }
    });
  /* pole Actions: === ACTIONS === / === BONUS ACTIONS === / === REACTIONS === a položky s textem odsazeným pod nimi */
  let ak = "",
    ca = null;
  const L = spoj(pole(/^Actions\d+$/i)).split("\n");
  L.forEach((raw, i) => {
    const t = raw.trim();
    if (!t) return;
    const ms = t.match(/^===\s*(.+?)\s*===$/);
    if (ms) {
      ak = /BONUS/i.test(ms[1]) ? "BA" : /REACTION/i.test(ms[1]) ? "R" : /^ACTIONS?$/i.test(ms[1]) ? "A" : "";
      ca = null;
      return;
    }
    const dal = L[i + 1] || "",
      polozka = !/^\s/.test(raw) && (/•/.test(t) || (/^\s{5,}\S/.test(dal) && t.length < 70 && !/[.:]$/.test(t)));
    if (polozka) {
      const n = cist(t);
      if (/^Standard Actions$/i.test(n)) {
        ca = null;
        return;
      }
      ca = n;
      if (ak && !akce[ak].includes(n)) akce[ak].push(n);
      const r = rysy.find(x => x.n === n);
      if (r && ak && !r.cas) r.cas = ak;
      const mu = t.match(/(\d+)\s*\/\s*(Long|Short)\s*Rest/i);
      if (mu) {
        const q = r || pridej(n);
        if (q && !q.max) {
          q.max = +mu[1];
          q.obn = /short/i.test(mu[2]) ? "krátký odpočinek" : "dlouhý odpočinek";
        }
      }
      return;
    }
    if (ca && !texty[ca]) texty[ca] = t;
    else if (ca && texty[ca].length < 6000 && !rysy.some(x => x.n === ca && texty[ca].includes(t))) texty[ca] += "\n" + t;
  });
  /* zdatnosti a jazyky */
  const pl = String((F.find(q => q && /^ProficienciesLang$/i.test(String(q.f).trim())) || {}).v || ""),
    zd = {};
  let s2 = "";
  pl.replace(/\r/g, "")
    .split("\n")
    .forEach(l => {
      const t = l.trim();
      if (!t) return;
      const m = t.match(/^===\s*(.+?)\s*===$/);
      if (m) {
        s2 = /ARMOR/i.test(m[1])
          ? "zbroj"
          : /WEAPON/i.test(m[1])
            ? "zbrane"
            : /TOOL/i.test(m[1])
              ? "nastroje"
              : /LANG/i.test(m[1])
                ? "jazyky"
                : "jine";
        return;
      }
      if (s2)
        zd[s2] = [
          ...(zd[s2] || []),
          ...t
            .split(/,\s*/)
            .map(x => x.trim())
            .filter(Boolean),
        ];
    });
  return {rysy: rysy.filter(x => !KRYSSUM.test(x.n)), texty, akce, zd};
}
/* nadpisy a souhrny z D&D Beyond, které nejsou samostatné rysy (velikost, rychlost, jazyky, volba vlastnosti…) */
const KRYSSUM =
  /^(core \w+ traits|size|speed|languages|creature type|ability score (increases?|improvements?)|increase .*scores?.*|special|expanded spell list|\w+ subclass|[\w' ]+ spells|strength|dexterity|constitution|intelligence|wisdom|charisma)$/i;
/* poznámky k záchranám z D&D Beyond česky */
function kZachPoznCz(t) {
  let m;
  if ((m = t.match(/^\+(\d+) Bonus on saves$/i))) return `+${m[1]} ke všem záchranám (předmět nebo rys, už započteno)`;
  if (/^Advantage on CON saving throws (that )?you make to maintain/i.test(t)) return "výhoda na CON záchrany pro udržení soustředění (War Caster)";
  if ((m = t.match(/^Advantage on saving throws against (.+?)\.?$/i))) return `výhoda na záchrany proti: ${m[1]}`;
  if ((m = t.match(/^Advantage on (STR|DEX|CON|INT|WIS|CHA) saving throws( against (.+?))?\.?$/i)))
    return `výhoda na ${m[1].toUpperCase() === "DEX" ? "AGI" : m[1].toUpperCase()} záchrany${m[3] ? " proti: " + m[3] : ""}`;
  return t;
}
