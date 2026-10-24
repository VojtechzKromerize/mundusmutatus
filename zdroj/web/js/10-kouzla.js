/* ===== Kouzla: SRD 5.2.1 česky (art/kouzla.json, načítá se až při potřebě) – jen pro vypravěče ===== */
/* anglické názvy kouzel, které jsou zároveň běžné herní pojmy – neprolinkovávat */
const KZSTOP = new Set(["Resistance"]);
let KZ = null,
  KZP = null,
  KZRE = null,
  KZSRD = [],
  KZVL = [],
  KZ_LOK = false;
const KZBY = {};
/* vlastní kouzla vypravěče: v databázi jen pro vypravěče (mm_kouzla_*), bez databáze v tomto prohlížeči – nikdy ve veřejných souborech */
function kzIndex() {
  const vl = [...KZVL].sort((a, b) => a.l - b.l || (a.cz || a.en).localeCompare(b.cz || b.en, "cs"));
  KZ = [...KZSRD, ...vl];
  for (const k in KZBY) delete KZBY[k];
  KZ.forEach(x => {
    KZBY[x.i] = x;
    KZBY["en:" + x.en] = x;
    if (x.cz) KZBY["cz:" + x.cz.toLowerCase()] = x;
  });
  const n = KZ.map(x => x.en)
    .filter(t => t && !KZSTOP.has(t))
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  KZRE = new RegExp(`(?<![\\w-])(${n.join("|")})(?![\\w-])`, "g");
  const I = window._phIDX;
  if (I) {
    for (let j = I.length - 1; j >= 0; j--) if (I[j].k === "Kouzlo") I.splice(j, 1);
    KZ.forEach(x =>
      I.push({
        id: "kz:" + x.i,
        n: x.cz || x.en,
        s: `${x.en} · ${kzUr(x.l)}${x.vl ? " · vlastní" : ""}`,
        h: "#kouzla/" + x.i,
        k: "Kouzlo",
        t: _nrm(`${x.cz} ${x.en}`),
      }),
    );
  }
}
async function kzVlNacti() {
  let s = null,
    loc = [];
  try {
    loc = JSON.parse(mmDex(localStorage.getItem("mm-kouzla")) || "[]") || [];
  } catch (e) {}
  if (window.MMDB && MMDB.prihlasen()) {
    try {
      s = await MMDB.gm("mm_kouzla_nacti");
    } catch (e) {
      KZ_LOK = true;
    }
  } else KZ_LOK = true;
  if (!Array.isArray(s)) s = loc;
  else if (!s.length && loc.length) {
    s = loc;
    KZVL = s;
    kzVlUloz().catch(() => {});
  }
  return s.filter(x => x && x.i && x.en).map(x => Object.assign({}, x, {vl: 1}));
}
async function kzVlUloz() {
  const d = KZVL.map(({vl, ...x}) => x);
  if (window.MMDB && !KZ_LOK) {
    try {
      await MMDB.gm("mm_kouzla_uloz", {p_kouzla: d});
      try {
        localStorage.removeItem("mm-kouzla");
      } catch (e) {}
      return true;
    } catch (e) {
      if (e.status === 404 || /mm_kouzla|function|schema cache/i.test(e.message)) {
        KZ_LOK = true;
        mmHlasG(
          "Databáze zatím neumí ukládat vlastní kouzla – spusť v Supabase aktuální supabase/schema.sql. Do té doby se ukládají jen v tomto prohlížeči.",
          9000,
        );
      } else {
        mmHlasG("Kouzlo se nepodařilo uložit: " + e.message, 6000);
        return false;
      }
    }
  }
  try {
    localStorage.setItem("mm-kouzla", JSON.stringify(d));
  } catch (e) {
    mmHlasG("Kouzlo se nepodařilo uložit ani v prohlížeči.", 6000);
    return false;
  }
  return true;
}
/* art/kouzla.json se stáhne jednou (sdílí ho seznam kouzel vypravěče i karty postav); každý si ho přečte zvlášť */
let KZTXTP = null;
const kouzlaTxt = () =>
  (KZTXTP =
    KZTXTP ||
    fetch("art/kouzla.json")
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .catch(e => {
        KZTXTP = null;
        throw e;
      }));
/* hráč stahuje lehčí art/kouzla-karta.json (bez popisů tam, kde automatika čte starší text); vypravěč plný soubor */
let KZTXTKP = null;
const kouzlaTxtKarta = () =>
  GMV
    ? kouzlaTxt()
    : (KZTXTKP =
        KZTXTKP ||
        fetch("art/kouzla-karta.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.text();
          })
          .catch(e => {
            KZTXTKP = null;
            return kouzlaTxt();
          }));
function kzNacti() {
  if (KZ) return Promise.resolve(KZ);
  if (!KZP)
    KZP = Promise.all([kouzlaTxt().then(t => JSON.parse(t)), kzVlNacti().catch(() => [])])
      .then(([d, v]) => {
        KZSRD = d;
        KZVL = v;
        kzIndex();
        return KZ;
      })
      .catch(e => {
        KZP = null;
        throw e;
      });
  return KZP;
}
const kzUr = l => (l ? `${l}. stupeň` : "trik");
const kzE = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
const kzIn = t =>
  kzE(t)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>");
const kzMd = t =>
  String(t || "")
    .replace(/\r/g, "")
    .split(/\n\s*\n|\n(?=\s*-\s)|\n\s{2,}/)
    .map(b => b.trim())
    .filter(Boolean)
    .reduce((a, b) => {
      if (/^-\s/.test(b)) {
        const li = b
          .split(/\n/)
          .map(x => x.replace(/^-\s*/, ""))
          .map(x => `<li>${kzIn(x)}</li>`)
          .join("");
        if (a.length && a[a.length - 1].startsWith("<ul>")) a[a.length - 1] = a[a.length - 1].replace(/<\/ul>$/, li + "</ul>");
        else a.push(`<ul>${li}</ul>`);
      } else a.push(`<p>${kzIn(b).replace(/\n/g, "<br>")}</p>`);
      return a;
    }, [])
    .join("");
const KZSK = ["Ochranná magie", "Vyvolávání", "Věštění", "Očarování", "Zaklínání", "Iluze", "Nekromancie", "Transmutace"],
  KZPOV = ["Bard", "Klerik", "Druid", "Paladin", "Hraničář", "Čaroděj", "Černokněžník", "Kouzelník"];
function kzKarta(x, pop) {
  return `<article class="kzkarta">${pop ? `<button type="button" class="kzx" data-kzzavri aria-label="Zavřít">×</button>` : ""}
  <h3>${kzE(x.cz || x.en)} <small lang="en">${kzE(x.en)}</small></h3>
  <p class="kzmeta">${x.l ? kzUr(x.l) : "Trik"} · ${kzE(x.s)}${x.ri ? " · rituál" : ""}${x.ko ? " · Concentration" : ""}</p>
  <dl class="kzkv"><dt>Sesílání</dt><dd>${kzE(x.ct)}${x.ri ? ", nebo jako rituál" : ""}</dd><dt>Dosah</dt><dd>${kzE(x.r)}</dd>
    <dt>Složky</dt><dd>${kzE((x.k || []).join(", "))}${x.m ? ` (${kzE(x.m)})` : ""}</dd><dt>Trvání</dt><dd>${kzE(x.d)}</dd>${x.p && x.p.length ? `<dt>Povolání</dt><dd>${kzE(x.p.join(", "))}</dd>` : ""}</dl>
  <div class="kztext">${x.dop && !x.t ? `<p class="rsmall">${featyMuze() ? "Popis je v plném znění níže." : "Popis kouzla uvidíš po přihlášení (plné znění)."}</p>` : kzMd(x.t)}${x.v ? `<p><b>Na vyšším stupni.</b> ${kzIn(x.v)}</p>` : ""}</div>${x.vl ? "" : plneTag("kouzla", x.en)}
  ${
    x.vl
      ? `<p class="kzsrc">Vlastní kouzlo vypravěče – vidíš ho jen ty.${pop ? ` <a href="#kouzla/${x.i}">v seznamu kouzel</a>` : ` <span class="kzakce"><button type="button" class="gbtn" data-kzuprav="${kzE(x.i)}">Upravit</button> <button type="button" class="gbtn kzalt" data-kzsmaz="${kzE(x.i)}">Smazat</button></span>`}</p></article>`
      : /* bez původu a překladu textu (Vojta 2026-10-23) – licence SRD a upozornění na vlastní shrnutí jsou v patičce webu */
        `${pop && GMV ? `<p class="kzsrc"><a href="#kouzla/${x.i}">v seznamu kouzel</a></p>` : ""}</article>`
  }`;
}
const KZK = ["V", "S", "M"];
function kzForm(x) {
  const n = !x;
  x = x || {en: "", cz: "", l: 1, s: "Zaklínání", p: [], ct: "Akce", r: "", k: ["V", "S"], m: "", d: "Okamžité", ko: 0, ri: 0, t: "", v: ""};
  const inp = (k, l, ph) =>
    `<label class="kzfl"><span>${l}</span><input name="${k}" value="${kzE(x[k])}"${ph ? ` placeholder="${ph}"` : ""}></label>`;
  return `<form class="kzkarta kzform" data-kzid="${n ? "" : kzE(x.i)}"><h3>${n ? "Nové vlastní kouzlo" : "Upravit kouzlo"}</h3>
  <p class="kzsrc">Uloží se jen pro vypravěče – v databázi (nebo v tomto prohlížeči), nikdy do veřejných souborů webu.</p>
  <div class="kzfg">${inp("en", "Anglický název *", "např. Hunger of Hadar")}${inp("cz", "Český název")}
    <label class="kzfl"><span>Úroveň</span><select name="l">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<option value="${l}"${+x.l === l ? " selected" : ""}>${l ? l + ". úroveň" : "Trik"}</option>`).join("")}</select></label>
    <label class="kzfl"><span>Škola</span><select name="s">${KZSK.map(v => `<option${x.s === v ? " selected" : ""}>${v}</option>`).join("")}</select></label>
    ${inp("ct", "Sesílání", "Akce, Bonusová akce, Reakce…")}${inp("r", "Dosah", "60 stop, Dotyk, Sebe…")}${inp("d", "Trvání", "Okamžité, až 1 minutu…")}${inp("m", "Materiální složka")}</div>
  <fieldset class="kzfs"><legend>Složky</legend>${KZK.map(v => `<label class="kzchk"><input type="checkbox" name="k" value="${v}"${(x.k || []).includes(v) ? " checked" : ""}> ${v}</label>`).join("")}
    <label class="kzchk"><input type="checkbox" name="ko"${x.ko ? " checked" : ""}> Concentration</label><label class="kzchk"><input type="checkbox" name="ri"${x.ri ? " checked" : ""}> rituál</label></fieldset>
  <fieldset class="kzfs"><legend>Povolání</legend>${KZPOV.map(v => `<label class="kzchk"><input type="checkbox" name="p" value="${v}"${(x.p || []).includes(v) ? " checked" : ""}> ${v}</label>`).join("")}</fieldset>
  <label class="kzfl kzfw"><span>Text</span><textarea name="t" rows="9" placeholder="Odstavce odděl prázdným řádkem, **tučně**, *kurzívou*, odrážky „- “.">${kzE(x.t)}</textarea></label>
  <label class="kzfl kzfw"><span>Na vyšší úrovni</span><textarea name="v" rows="3">${kzE(x.v)}</textarea></label>
  <p class="kzakce"><button type="submit" class="gbtn">Uložit</button> <button type="button" class="gbtn kzalt" data-kzzrus>Zrušit</button></p></form>`;
}
async function kzFormUloz(f) {
  const g = k => (f.elements[k].value || "").trim(),
    ch = k => [...f.querySelectorAll(`input[name="${k}"]:checked`)].map(e => e.value);
  const en = g("en").replace(/\s+/g, " ");
  if (!en) {
    alert("Vyplň anglický název kouzla.");
    f.elements.en.focus();
    return;
  }
  const id0 = f.dataset.kzid,
    srd = KZSRD.find(x => x.en.toLowerCase() === en.toLowerCase());
  if (srd) {
    alert(`„${en}“ už je v SRD jako ${srd.cz || srd.en}.`);
    return;
  }
  const dup = KZVL.find(x => x.en.toLowerCase() === en.toLowerCase() && x.i !== id0);
  if (dup) {
    alert(`Vlastní kouzlo „${en}“ už existuje.`);
    return;
  }
  let i = id0;
  if (!i) {
    const b =
      "v-" +
      (_nrm(en)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "kouzlo");
    i = b;
    let n = 2;
    while (KZBY[i]) i = b + "-" + n++;
  }
  const x = {
    i,
    en,
    cz: g("cz"),
    l: +g("l"),
    s: g("s"),
    p: ch("p"),
    ct: g("ct"),
    r: g("r"),
    k: ch("k"),
    m: g("m"),
    d: g("d"),
    ko: f.elements.ko.checked ? 1 : 0,
    ri: f.elements.ri.checked ? 1 : 0,
    t: f.elements.t.value.trim(),
    v: f.elements.v.value.trim(),
    cs: 1,
    vl: 1,
  };
  const old = KZVL;
  KZVL = [...KZVL.filter(y => y.i !== i), x];
  kzIndex();
  if (!(await kzVlUloz())) {
    KZVL = old;
    kzIndex();
    return;
  }
  mmHlasG("Kouzlo uloženo.", 2500);
  if (location.hash === "#kouzla/" + i) renderKouzla(i);
  else location.hash = "#kouzla/" + i;
}
async function kzSmaz(i) {
  const x = KZBY[i];
  if (!x || !x.vl || !confirm(`Smazat vlastní kouzlo „${x.cz || x.en}“?`)) return;
  const old = KZVL;
  KZVL = KZVL.filter(y => y.i !== i);
  kzIndex();
  if (!(await kzVlUloz())) {
    KZVL = old;
    kzIndex();
    return;
  }
  location.hash = "#kouzla";
}
const KZF = {q: "", l: "", s: "", p: "", ko: false, ri: false, vl: false};
function kzFiltr() {
  const box = document.getElementById("kzview");
  if (!box || !KZ) return;
  const q = _nrm(KZF.q.trim()),
    cur = decodeURIComponent(location.hash.split("/")[1] || "");
  let L = KZ.filter(
    x =>
      (KZF.l === "" || x.l === +KZF.l) &&
      (!KZF.s || x.s === KZF.s) &&
      (!KZF.p || x.p.includes(KZF.p)) &&
      (!KZF.ko || x.ko) &&
      (!KZF.ri || x.ri) &&
      (!KZF.vl || x.vl),
  );
  if (q) {
    const jm = x => _nrm(x.cz + " " + x.en),
      w = q.split(/\s+/);
    const A = L.filter(x => w.every(t => jm(x).includes(t))),
      B = q.length >= 3 ? L.filter(x => !A.includes(x) && w.every(t => _nrm(x.t + " " + x.v).includes(t))) : [];
    A.sort((a, b) => (_nrm(b.cz).startsWith(q) || _nrm(b.en).startsWith(q)) - (_nrm(a.cz).startsWith(q) || _nrm(a.en).startsWith(q)));
    L = [...A, ...B];
  }
  const ul = box.querySelector(".kzlist");
  box.querySelector(".kzpoc").textContent = `${L.length} z ${KZ.length}`;
  ul.innerHTML = L.length
    ? L.slice(0, 400)
        .map(
          x =>
            `<li><a href="#kouzla/${x.i}" class="${x.i === cur ? "on" : ""}"><b>${kzE(x.cz || x.en)}</b><small><span lang="en">${kzE(x.en)}</span> · ${kzUr(x.l)} · ${kzE(x.s)}${x.ko ? ' · <abbr title="Concentration">K</abbr>' : ""}${x.ri ? ' · <abbr title="rituál">R</abbr>' : ""}${x.vl ? ' · <span class="kzvl">vlastní</span>' : ""}</small></a></li>`,
        )
        .join("")
    : `<li class="kzmiss">${KZF.vl && !KZVL.length ? "Zatím nemáš žádné vlastní kouzlo." : "Nic takového tu není."} <button type="button" class="gbtn" data-kznove="${kzE(KZF.q.trim())}">Zapsat jako vlastní kouzlo</button>${
        KZF.q.trim()
          ? ` <a href="https://www.aidedd.org/spell/${encodeURIComponent(
              _nrm(KZF.q.trim())
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
            )}" target="_blank" rel="noopener">Zkusit „${kzE(KZF.q.trim())}“ na aidedd.org</a> (anglický název kouzla z Player's Handbooku).`
          : ""
      }</li>`;
}
function renderKouzla(b) {
  const box = document.getElementById("kzview");
  if (!box || !GMV) return;
  if (!box.dataset.hotovo) {
    box.dataset.hotovo = 1;
    box.innerHTML = `<div class="kzhlav"><h2 class="arttitle">Kouzla</h2><p class="intro">Kouzla D&amp;D 2024 pro rychlé dohledání u stolu – česky, s anglickým názvem: ze SRD 5.2.1 a z dalších příruček (u kouzel mimo SRD jen vlastní shrnutí mechaniky). Jen pro vypravěče. Kouzlo, které tu chybí, si můžeš zapsat jako vlastní – uloží se jen pro vypravěče.</p>
      <p><button type="button" class="gbtn" data-kznove="">+ Vlastní kouzlo</button></p></div>
      <div class="kzfil"><input type="search" class="kzq" placeholder="Hledat česky nebo anglicky, i v textu…" aria-label="Hledat kouzlo">
        <div class="kzur controls" role="group" aria-label="Úroveň"><button type="button" data-kzl="" aria-pressed="true">Vše</button>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => `<button type="button" data-kzl="${l}" aria-pressed="false">${l ? l : "Trik"}</button>`).join("")}</div>
        <select class="kzs" aria-label="Škola"><option value="">Všechny školy</option>${KZSK.map(x => `<option>${x}</option>`).join("")}</select>
        <select class="kzp" aria-label="Povolání"><option value="">Všechna povolání</option>${KZPOV.map(x => `<option>${x}</option>`).join("")}</select>
        <label class="kzchk"><input type="checkbox" class="kzko"> Concentration</label><label class="kzchk"><input type="checkbox" class="kzri"> rituál</label><label class="kzchk"><input type="checkbox" class="kzvlf"> jen vlastní</label><span class="kzpoc lbl"></span></div>
      <div class="kzgrid"><ol class="kzlist"><li>Načítám kouzla…</li></ol><div class="kzdet"></div></div>
      <p class="kzlic">Obsahuje materiál ze <i>System Reference Document 5.2.1</i> („SRD 5.2.1“) společnosti Wizards of the Coast LLC, dostupného na <a href="https://www.dndbeyond.com/srd" target="_blank" rel="noopener">dndbeyond.com/srd</a>. SRD 5.2.1 je licencováno pod <a href="https://creativecommons.org/licenses/by/4.0/legalcode" target="_blank" rel="noopener">Creative Commons Attribution 4.0 International</a>. Texty jsou přeložené do češtiny a terminologicky upravené pro Mundus Mutatus. Anglická data z projektů 5e-bits/5e-database a foundryvtt/dnd5e (SRD 5.2.1).</p>`;
    const f = box.querySelector(".kzfil");
    f.querySelector(".kzq").addEventListener("input", e => {
      KZF.q = e.target.value;
      kzFiltr();
    });
    f.addEventListener("click", e => {
      const t = e.target.closest("[data-kzl]");
      if (!t) return;
      KZF.l = t.dataset.kzl;
      f.querySelectorAll("[data-kzl]").forEach(x => x.setAttribute("aria-pressed", x === t));
      kzFiltr();
    });
    f.addEventListener("change", e => {
      if (e.target.matches(".kzs")) KZF.s = e.target.value;
      else if (e.target.matches(".kzp")) KZF.p = e.target.value;
      else if (e.target.matches(".kzko")) KZF.ko = e.target.checked;
      else if (e.target.matches(".kzri")) KZF.ri = e.target.checked;
      else if (e.target.matches(".kzvlf")) KZF.vl = e.target.checked;
      else return;
      kzFiltr();
    });
    box.addEventListener("click", e => {
      const t = e.target;
      let b;
      const det = box.querySelector(".kzdet");
      if ((b = t.closest("[data-kznove]"))) {
        kzNacti().then(() => {
          det.innerHTML = kzForm();
          const f = det.querySelector("form");
          if (b.dataset.kznove)
            f.elements.en.value = b.dataset.kznove
              .split(/\s+/)
              .map((w, j) =>
                j && /^(of|the|and|or|to|a|an|in|on|from|with|for)$/i.test(w) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1),
              )
              .join(" ");
          f.elements[b.dataset.kznove ? "cz" : "en"].focus();
          if (matchMedia("(max-width:760px)").matches) det.scrollIntoView({block: "start"});
        });
      } else if ((b = t.closest("[data-kzuprav]"))) {
        const x = KZBY[b.dataset.kzuprav];
        if (x) {
          det.innerHTML = kzForm(x);
          det.querySelector("form").elements.en.focus();
        }
      } else if ((b = t.closest("[data-kzsmaz]"))) kzSmaz(b.dataset.kzsmaz);
      else if (t.closest("[data-kzzrus]")) {
        const id = decodeURIComponent(location.hash.split("/")[1] || ""),
          x = KZBY[id];
        det.innerHTML = x ? kzKarta(x) : `<p class="kzprazdne">Vyber kouzlo vlevo.</p>`;
      }
    });
    box.addEventListener("submit", e => {
      const f = e.target.closest(".kzform");
      if (!f) return;
      e.preventDefault();
      kzFormUloz(f);
    });
  }
  kzNacti()
    .then(() => {
      kzFiltr();
      const d = box.querySelector(".kzdet"),
        x = b && KZBY[b];
      d.innerHTML = x ? kzKarta(x) : `<p class="kzprazdne">Vyber kouzlo vlevo.</p>`;
      pojZnac(d);
      if (x && matchMedia("(max-width:760px)").matches) d.scrollIntoView({block: "start"});
    })
    .catch(() => {
      box.querySelector(".kzlist").innerHTML = `<li>Kouzla se nepodařilo načíst.</li>`;
    });
}
/* odkazy na kouzla v Boji, Výpravě a Artikulích (anglické názvy ze statbloků) a karta kouzla přes stránku */
function kzOdkazy(root) {
  if (!KZRE || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n =>
      n.parentElement &&
      !n.parentElement.closest("a,button,input,textarea,select,script,style,.kzkarta,.kzpop,label,summary,option,.kzx") &&
      /[A-Z]/.test(n.nodeValue)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const ns = [];
  while (w.nextNode()) ns.push(w.currentNode);
  ns.forEach(n => {
    KZRE.lastIndex = 0;
    if (!KZRE.test(n.nodeValue)) return;
    KZRE.lastIndex = 0;
    const f = document.createDocumentFragment();
    let i = 0,
      m;
    const t = n.nodeValue;
    while ((m = KZRE.exec(t))) {
      f.appendChild(document.createTextNode(t.slice(i, m.index)));
      const a = document.createElement("a");
      const x = KZBY["en:" + m[1]];
      a.href = "#kouzla/" + x.i;
      a.className = "kzodk";
      a.textContent = m[1];
      a.title = (x.cz || x.en) + " – " + kzUr(x.l);
      f.appendChild(a);
      i = m.index + m[1].length;
    }
    f.appendChild(document.createTextNode(t.slice(i)));
    n.replaceWith(f);
  });
}
if (GMV) {
  const pop = document.createElement("div");
  pop.className = "kzpop";
  pop.hidden = true;
  pop.setAttribute("role", "dialog");
  pop.setAttribute("aria-label", "Kouzlo");
  document.body.appendChild(pop);
  document.addEventListener(
    "click",
    e => {
      if (e.target.closest("[data-kzzavri]")) {
        pop.hidden = true;
        return;
      }
      const a = e.target.closest('a[href^="#kouzla/"]');
      if (!a || a.closest("#kzview") || (a.closest(".kzpop") && !a.classList.contains("kzodk"))) return;
      if (curView === "kouzla") return;
      e.preventDefault();
      e.stopPropagation();
      const id = decodeURIComponent(a.getAttribute("href").split("/")[1]);
      kzNacti().then(() => {
        const x = KZBY[id];
        if (!x) return;
        pop.innerHTML = kzKarta(x, true);
        pop.hidden = false;
        pop.scrollTop = 0;
      });
    },
    true,
  );
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !pop.hidden) pop.hidden = true;
  });
  window.kzUkaz = id =>
    kzNacti().then(() => {
      const x = KZBY[id];
      if (!x) return;
      pop.innerHTML = kzKarta(x, true);
      pop.hidden = false;
      pop.scrollTop = 0;
    });
  const KZV = {boj: "bojview", vyprava: "vyview", artikule: "artikule"};
  let kzT = 0;
  const kzSken = () => {
    const id = KZV[curView];
    if (!id) return;
    const el = document.getElementById(id) || document.querySelector(`.view[data-view="${curView}"]`);
    if (!el) return;
    const go = () => {
      mo.disconnect();
      try {
        kzOdkazy(el);
      } finally {
        mo.observe(document.querySelector("main") || document.body, {childList: true, subtree: true});
      }
    };
    if (KZRE) go();
    else kzNacti().then(go, () => {});
  };
  const mo = new MutationObserver(() => {
    clearTimeout(kzT);
    kzT = setTimeout(kzSken, 250);
  });
  mo.observe(document.querySelector("main") || document.body, {childList: true, subtree: true});
  addEventListener("hashchange", () => {
    clearTimeout(kzT);
    kzT = setTimeout(kzSken, 300);
  });
  const nl = document.getElementById("navartl");
  if (nl) nl.insertAdjacentHTML("beforeend", `<span class="svsep" aria-hidden="true">Pro vypravěče</span><a href="#kouzla">Kouzla</a>`);
  if (document.querySelector(".phpanel")) kzNacti().catch(() => {});
}
function renderGM() {
  const box = document.getElementById("gmview");
  if (!GMV) {
    if (!window.MMDB) {
      box.innerHTML = `<h2 class="arttitle">Vypravěč</h2><p class="intro">Odhalování postav, rodů a míst funguje jen na webu napojeném na databázi.</p>`;
      return;
    }
    box.innerHTML = `<h2 class="arttitle">Vypravěč</h2><p class="intro">Přihlášení pro vypravěče. Hráči se přihlašovat nemusí – co družina zná, vidí každý.</p>
      ${window.MMINFO ? `<p class="gmwarn">${window.MMINFO}</p>` : ""}
      <form class="gmform" id="gmlogin"><label>E‑mail<input type="email" name="e" autocomplete="username" required></label>
      <label>Heslo<input type="password" name="h" autocomplete="current-password" required></label>
      <button class="gbtn" type="submit">Přihlásit</button><p class="gmerr" role="alert"></p></form>`;
    box.querySelector("form").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.target,
        err = f.querySelector(".gmerr"),
        btn = f.querySelector("button");
      err.textContent = "";
      btn.disabled = true;
      try {
        await MMDB.prihlas(f.elements.e.value.trim(), f.elements.h.value);
        location.reload();
      } catch (x) {
        err.textContent = x.status === 400 || x.status === 401 ? "Nesprávný e‑mail nebo heslo." : "Přihlášení se nepodařilo: " + x.message;
        btn.disabled = false;
      }
    });
    return;
  }
  if (box.dataset.done) {
    gmRefresh();
    if (window._cAkt) window._cAkt();
    return;
  }
  box.dataset.done = 1;
  const ord = Object.fromEntries(["Čechy", "Morava", "Slezsko", "Lužice", "Královská města", "Duchovenstvo"].map((l, i) => [l, i]));
  const rody = [...FAM].sort(
    (a, b) =>
      !!a.nbr - !!b.nbr || (ord[a.land] ?? 9) - (ord[b.land] ?? 9) || a.land.localeCompare(b.land, "cs") || a.name.localeCompare(b.name, "cs"),
  );
  const hra = HRA || {},
    plc = [...new Set([...PLACES.map(p => p.name), ...SVETMESTA.map(c => c[0]), ...TOWNS.map(t => t[0])])].sort((a, b) => a.localeCompare(b, "cs"));
  const hraBox = `<div class="gmrod gmhra"><div class="gmrow"><b>Herní stav</b><small>Datum a hodina na Úvodu (Hodiny Závoje) a praporec družiny na mapách</small></div>
    <form class="gmhraf" id="gmhra">
      <label>Datum<input type="date" name="datum" value="${hra.datum || (ZAPISY.length && ZAPISY[ZAPISY.length - 1].datum) || "1458-03-03"}" min="1400-01-01" max="1500-12-31" required></label>
      <label>Hodina<select name="hodina">${Array.from({length: 24}, (_, h) => `<option value="${h}"${(hra.hodina != null ? +hra.hodina : 10) === h ? " selected" : ""}>${h}:00</option>`).join("")}</select></label>
      <label>Kde je družina<input name="misto" list="gmplc" value="${partyPlace() || ""}" placeholder="např. Kutná Hora"></label>
      <label>Místo v Praze<select name="praha"><option value="">—</option>${PRAHA_PLACES.map(q => `<option value="${q.n}"${+hra.praha === q.n ? " selected" : ""}>${q.n} · ${q.name}</option>`).join("")}</select></label>
      <datalist id="gmplc">${plc.map(n => `<option value="${n}">`).join("")}</datalist>
      <div class="gmhrab"><button type="submit" class="gbtn">Uložit</button><button type="button" class="gbtn ghost" data-hra="+1">+1 hodina</button><button type="button" class="gbtn ghost" data-hra="den">Další den, ráno</button></div>
      <fieldset class="gmcesta"><legend>Cesta družiny</legend>
        <p class="gmcpoz" style="flex-basis:100%;margin:0">Pravidla cestování (počasí, setkání, obtížnost) jsou na stránce <a href="#vyprava">Výprava</a>.</p>
        <div class="gmcakt" hidden></div>
        <label>Kam<input name="cil" list="gmplc" placeholder="např. Kutná Hora" autocomplete="off"></label>
        <label>Jak<select name="zpusob">${CESTA_ZP.map(([k, n, v]) => `<option value="${k}">${n} (asi ${v} km za den)</option>`).join("")}</select></label>
        <label>Oproti odhadu<select name="odch">${CESTA_ODCH.map(([v, n]) => `<option value="${v}"${v === 1 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
        <label>Zdržení (hodiny)<input name="zdrz" type="number" step="1" min="-48" max="240" value="0" title="Kladné číslo cestu prodlouží, záporné zkrátí"></label>
        <label class="gmcsez"><span><input type="checkbox" name="sez" checked> počítat s roční dobou</span></label>
        <div class="gmcodh" aria-live="polite"></div>
        <div class="gmhrab"><button type="button" class="gbtn" data-cesta="vyrazit" disabled title="Družina vyrazí teď; s každou hodinou se posune po trase">Vyrazit</button><button type="button" class="gbtn ghost" data-cesta="dorazit" disabled title="Přeskočí cestu a posune čas rovnou na příjezd">Rovnou dorazit</button></div>
      </fieldset>
    </form></div>`;
  const row = (id, cls, href, name, sub) =>
    `<div class="gmrow ${cls}" data-gmid="${id}"><a href="${href}">${name}</a><small>${sub}</small>${gmSeg(id)}</div>`;
  box.innerHTML = `<h2 class="arttitle">Vypravěč</h2>
    <div class="gmhead"><span class="lbl">${window.MMDB ? `Přihlášen: ${MMDB.email() || "vypravěč"}` : "Statická vypravěčská verze – stavy jen ke čtení"}</span>${window.MMDB ? `<button type="button" class="gbtn" id="gmout">Odhlásit</button>` : ""}</div>
    <p class="intro">Hráči vidí jen to, co je odhalené. <b>Slyšeli</b>: jméno a základní údaje, u osob silueta místo portrétu. <b>Potkali</b>: vše kromě tajemství vypravěče (u dračích plemen „Slyšeli“ = jméno bez obrázku a popisu). Osoba je hráčům vidět, jen když je vidět i její rod. Změna se hráčům projeví do půl minuty, bez nového nasazení webu.</p>
    <div class="gmtools"><input type="search" id="gmq" placeholder="Hledat rod, osobu nebo místo…" aria-label="Hledat">
      <select id="gmf" aria-label="Filtr stavu"><option value="">Všechny stavy</option><option value="0">Jen skryté</option><option value="1">Jen slyšeli</option><option value="2">Jen potkali</option></select>
      <span class="gmsum" id="gmsum"></span></div>
    <div class="gmlist">${hraBox}${typeof edNovyBox === "function" ? edNovyBox() : ""}
    ${ZAPISY.length ? `<div class="gmrod" data-rn="kronika zapisy"><div class="gmrow"><b>Kronika – zápisy</b><small>Koncept hráči nevidí; zveřejněním se zápis objeví v Kronice i v Novinkách.</small></div>${ZAPISY.map(z => row(z.id, "gmp", "#kronika/" + z.id, z.title, [z.n, z.date].filter(Boolean).join(" · "))).join("")}</div>` : ""}
    ${rody
      .map(
        f => `<div class="gmrod" data-rn="${_nrm(f.name + " " + (SHORT[f.id] || "")).replace(/"/g, "")}">
      ${row(f.id, "gmr", "#rod/" + f.id, f.name, f.land + (f.nbr ? " · soused" : ""))}
      ${peopleOf(f.id).length ? `<div class="gmrow gmp gmbk"><small>Všechny osoby rodu:</small><select class="gmbulk" data-gmbulk="${f.id}" aria-label="Nastavit všechny osoby rodu ${f.name}"><option value="">nastavit…</option>${STLBL.map((l, i) => `<option value="${i}">${l}</option>`).join("")}</select></div>` : ""}
      ${peopleOf(f.id)
        .map(p => row(p.id, "gmp", "#osoba/" + p.id, p.n, p.role))
        .join("")}</div>`,
      )
      .join("")}
    ${DRACI.pl.length ? `<div class="gmrod" data-rn="draconomicon draci plemena"><div class="gmrow"><b>Draconomicon – dračí plemena</b></div>${DRACI.pl.map(d => row(d.id, "gmp", "#draconomicon/" + d.id, d.n, [d.la, d.pd].filter(Boolean).join(" · ") || "plemeno")).join("")}</div>` : ""}
    ${DISC.length ? `<div class="gmrod" data-rn="objevena mista"><div class="gmrow"><b>Objevená místa</b></div>${DISC.map(d => row(d.id, "gmp", "#mapa", d.name, "místo na mapě").replace(/<\/div>$/, window.MMDB ? `<button type="button" class="gbtn ghost" data-ed="misto:${d.id}">upravit</button></div>` : "</div>")).join("")}</div>` : ""}
    ${window.MMDB && PRAHA_PLACES.length ? `<div class="gmrod" data-rn="praha mista"><details class="gmprl"><summary><b>Místa v Praze</b> <small>(${PRAHA_PLACES.length}) – úprava textů</small></summary>${PRAHA_PLACES.map(q => `<div class="gmrow gmp"><a href="#praha/${q.n}">${q.n} · ${q.name}</a><button type="button" class="gbtn ghost" data-ed="praha:${q.n}">upravit</button></div>`).join("")}</details></div>` : ""}</div>`;
  gmSum();
  gmMark(box);
  const flt = () => {
    const q = _nrm(box.querySelector("#gmq").value.trim()),
      f = box.querySelector("#gmf").value;
    box.querySelectorAll(".gmrod").forEach(r => {
      if (!r.dataset.rn) {
        r.hidden = !!(q || f);
        return;
      }
      const rh = !q || r.dataset.rn.includes(q);
      let any = false;
      r.querySelectorAll(".gmrow[data-gmid]").forEach(x => {
        const ok = (!f || gmLv(x.dataset.gmid) === +f) && (rh || _nrm(x.textContent).includes(q));
        x.hidden = !ok;
        if (ok) any = true;
      });
      r.querySelectorAll(".gmbk").forEach(x => (x.hidden = !!(q || f)));
      r.hidden = !any;
    });
  };
  box.querySelector("#gmq").addEventListener("input", flt);
  box.querySelector("#gmf").addEventListener("change", flt);
  box.addEventListener("change", e => {
    const s = e.target.closest("[data-gmbulk]");
    if (!s || s.value === "") return;
    const v = +s.value;
    s.value = "";
    const z = {};
    peopleOf(s.dataset.gmbulk).forEach(p => {
      if (gmLv(p.id) !== v) z[p.id] = v;
    });
    if (Object.keys(z).length) gmUloz(z);
  });
  const o = box.querySelector("#gmout");
  if (o)
    o.addEventListener("click", async () => {
      await MMDB.odhlas();
      location.reload();
    });
  const hf = box.querySelector("#gmhra");
  let ulozHru = h =>
    hraUloz(h).then(() => {
      if (HRA) {
        hf.elements.datum.value = HRA.datum || "";
        hf.elements.hodina.value = HRA.hodina ?? "";
        if (HRA.misto) hf.elements.misto.value = HRA.misto;
      }
    });
  hf.addEventListener("submit", e => {
    e.preventDefault();
    const f = hf.elements;
    ulozHru({datum: f.datum.value, hodina: +f.hodina.value, misto: f.misto.value.trim() || null, praha: f.praha.value ? +f.praha.value : null});
  });
  /* cesta družiny: plán, putování po hodinách, zastavení a deník putování */
  const cVstup = () => {
    const f = hf.elements;
    return {
      z: f.misto.value.trim(),
      do: f.cil.value.trim(),
      zp: f.zpusob.value,
      odch: +f.odch.value,
      zdrz: +f.zdrz.value || 0,
      sez: f.sez.checked,
      datum: f.datum.value,
      hodina: +f.hodina.value,
    };
  };
  const cHtml = P => {
    const ds = j => {
      const [, M, D] = fromJdn(j);
      return `${D}. ${MES[M - 1]}`;
    };
    return `<p>${P.z} → <b>${P.do}</b>: asi ${P.km} km${P.seaKm ? ` (z toho ${P.seaKm} km po moři)` : ""}, ${P.zpn.toLowerCase()} odhadem ${P.odhad} h cesty${P.hod !== P.odhad ? `, po úpravách ${P.hod} h` : ""}. Příjezd <b>${cTxt(P.t1)}</b>.</p>
      ${P.sezona ? `<p class="gmcpoz">Roční doba: ${P.sezona} – započteno do odhadu.</p>` : ""}
      ${P.noci.length ? `<p class="lbl">Noclehy</p><ol class="gmclist">${P.noci.map(n => `<li>${ds(n.j)} večer: ${n.kde}</li>`).join("")}</ol>` : ""}
      ${P.sv.length ? `<p class="lbl">Kalendář na cestě</p><ul class="gmclist">${P.sv.map(v => `<li${v.hp ? ' class="gmchp"' : ""}>${ds(v.j)}: <b>${v.n}</b>${v.hp ? " – Hodina Pravdy" : v.w ? ` – Požehnání 4–6: ${v.w}` : ""}${v.kde ? ` · ${v.kde}` : ""}</li>`).join("")}</ul>` : ""}
      ${P.reky.length || P.myta.length ? `<p class="lbl">Po cestě</p><ul class="gmclist">${P.reky.map(r => `<li>${r.r}: ${r.most ? `kamenný most v ${r.most}` : `brod nebo přívoz (${r.kde}) – odhad s ním nepočítá`}</li>`).join("")}${P.myta.map(m => `<li>${m.n}: ${m.t}</li>`).join("")}</ul>` : ""}`;
  };
  let cPlan = null;
  const cestaOdhad = () => {
    const o = hf.querySelector(".gmcodh"),
      bs = hf.querySelectorAll("[data-cesta]");
    bs.forEach(b => (b.disabled = true));
    cPlan = null;
    const v = cVstup();
    if (!v.do) {
      o.innerHTML = "";
      return null;
    }
    const P = cestaPlan(v);
    if (P.chyba) {
      o.innerHTML = `<p>${P.chyba}</p>`;
      if (P.cekej) setTimeout(cestaOdhad, 900);
      return null;
    }
    o.innerHTML = cHtml(P);
    bs.forEach(b => (b.disabled = false));
    cPlan = P;
    return P;
  };
  const cAkt = () => {
    const box = hf.querySelector(".gmcakt"),
      c = HRA && HRA.cesta;
    if (!c || !c.track) {
      box.hidden = true;
      return;
    }
    const now = cT(HRA),
      t1 = c.track[c.track.length - 1][0],
      q = cestaPoz(c.track, now);
    box.hidden = false;
    box.innerHTML = `<p><b>Družina je na cestě</b>: ${c.z} → <b>${c.do}</b>. Vyrazila ${cTxt(c.track[0][0])}, příjezd ${cTxt(t1)}${now >= t1 ? " – už dorazila (uloží se s dalším posunem času)" : ""}. Teď: ${q ? cKde(...q) : "?"}.</p>
      <div class="gmhrab"><button type="button" class="gbtn" data-cesta="zastavit">Zastavit cestu tady</button><button type="button" class="gbtn ghost" data-cesta="dojet">Rovnou dorazit</button><button type="button" class="gbtn ghost" data-cesta="zrusit">Zrušit cestu</button></div>`;
  };
  const cZaznam = cZaznamG,
    cDokonci = cDokonciG;
  const _uloz = ulozHru;
  ulozHru = h =>
    _uloz(cDokonci(h)).then(() => {
      cAkt();
      cestaOdhad();
    });
  ["input", "change"].forEach(t =>
    hf.addEventListener(t, e => {
      if (e.target.closest(".gmcesta") || ["misto", "datum", "hodina"].includes(e.target.name)) cestaOdhad();
    }),
  );
  hf.addEventListener(
    "click",
    e => {
      const b = e.target.closest("[data-cesta]");
      if (!b) return;
      e.stopImmediatePropagation();
      const k = b.dataset.cesta,
        c = HRA && HRA.cesta;
      if (k === "vyrazit" || k === "dorazit") {
        const P = cestaOdhad();
        if (!P) return;
        const cesta = {z: P.z, do: P.do, km: P.km, zpusob: P.zp, track: P.track};
        if (k === "vyrazit")
          ulozHru({cesta, poloha: null, praha: null}).then(() => {
            hf.elements.cil.value = "";
            cestaOdhad();
          });
        else
          ulozHru(Object.assign({cesta, poloha: null, praha: null}, cDat(P.t1))).then(() => {
            hf.elements.misto.value = (HRA && HRA.misto) || P.do;
            hf.elements.cil.value = "";
            cestaOdhad();
          });
        return;
      }
      if (!c) return;
      if (k === "dojet") {
        ulozHru(cDat(c.track[c.track.length - 1][0])).then(() => {
          hf.elements.misto.value = (HRA && HRA.misto) || c.do;
        });
      } else if (k === "zrusit") {
        if (confirm("Zrušit cestu? Družina zůstane, kde vyrazila.")) ulozHru({cesta: null});
      } else if (k === "zastavit") {
        const now = cT(HRA),
          q = cestaPoz(c.track, now),
          n = cNejbliz(...q),
          misto = n.d < 5 ? n.n : `na cestě ${c.z} → ${c.do}`;
        ulozHru({
          cesta: null,
          misto,
          poloha: n.d < 5 ? null : [Math.round(q[0] * 1000) / 1000, Math.round(q[1] * 1000) / 1000],
          putovani: cZaznam(c, now, q),
        }).then(() => {
          hf.elements.misto.value = misto;
        });
      }
    },
    true,
  );
  cAkt();
  window._cAkt = () => {
    cAkt();
    cestaOdhad();
  };
  hf.addEventListener("click", e => {
    const b = e.target.closest("[data-hra]");
    if (!b) return;
    const f = hf.elements;
    let [y, m, d] = f.datum.value.split("-").map(Number),
      h = +f.hodina.value;
    if (b.dataset.hra === "+1") {
      h++;
      if (h > 23) {
        h = 0;
        [y, m, d] = fromJdn(jdn(y, m, d) + 1);
      }
    } else {
      [y, m, d] = fromJdn(jdn(y, m, d) + 1);
      h = 6;
    }
    ulozHru({datum: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, hodina: h});
  });
}
