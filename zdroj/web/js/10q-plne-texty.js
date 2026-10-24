/* ===== Plné znění kouzel a předmětů (Vojtovy tabulky, 2026-10-24) – jen pro přihlášené, z databáze =====
   Texty nejsou v repozitáři ani v art/: převodník zdroj/mimo-srd/kouzla_predmety_plne.py z nich udělá JSON (sjednocené pojmy
   a rámečky Artikulí) a vypravěč je nahraje na stránce Pravidla › Kouzla a předměty (mm_pravidla_texty_uloz). Čte se po jedné
   položce (mm_pravidla_text, data jsou ~2 MB) a seznam bez textů (mm_pravidla_seznam). plneTag() je rozbalovací „Plné znění“
   u kouzla či předmětu kdekoli na webu – text se načte až při rozbalení. Stránka #pravidla/plne/kouzla | predmety (renderPlne). */
const PLNEKL = {kouzla: "Kouzla", predmety: "Kouzelné předměty"};
const PLNES = {},
  PLNESP = {},
  PLNET = {};
const PLNEF = {kouzla: {q: "", l: ""}, predmety: {q: "", l: ""}};
const plneId = en =>
  String(en || "")
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .trim();
const plneSeznam = k =>
  (PLNESP[k] =
    PLNESP[k] ||
    MMDB.pravidlaSeznam(k)
      .then(j => (PLNES[k] = Array.isArray(j) ? j : []))
      .catch(() => {
        PLNESP[k] = null;
        return null;
      }));
const plneText = (k, id) => {
  const kl = k + "|" + plneId(id);
  if (kl in PLNET) return Promise.resolve(PLNET[kl]);
  return MMDB.pravidlaText(k, plneId(id)).then(x => (PLNET[kl] = x || null));
};
/* první věta odstavce „Použití pozice kouzla vyššího stupně. …“ / „Vylepšení triku. …“ tučně */
const plneVyssi = v => {
  const m = String(v || "").match(/^([^.]{3,60}\.)\s*([\s\S]*)$/);
  return m ? `<p><b>${kzIn(m[1])}</b> ${kzIn(m[2])}</p>` : `<p>${kzIn(v)}</p>`;
};
function plneMeta(k, x) {
  if (k === "kouzla")
    return [x.l ? `Kouzlo ${x.l}. stupně` : "Trik", x.s + (x.ri ? " (rituál)" : ""), x.ct, x.r, x.k, x.d].filter(Boolean).map(besc).join(" · ");
  return [x.typ, x.vz, x.sl, x.zr, x.vl, x.ma ? `Mistrovství: ${x.ma}` : "", x.w].filter(Boolean).map(besc).join(" · ");
}
const plneTelo = (k, x) =>
  x
    ? `<p class="rsmall"><i>${plneMeta(k, x)}</i></p>${featyMd(x.t)}${x.v ? plneVyssi(x.v) : ""}`
    : `<p class="rsmall">Ve vypravěčově překladu tahle položka není.</p>`;
/* rozbalovací „Plné znění“ u kouzla / předmětu (jen přihlášeným); text se načte při rozbalení */
const plneTag = (k, en) =>
  en && featyMuze()
    ? `<details class="bjapd plne" data-plne="${k}" data-plnen="${besc(plneId(en))}"><summary>Plné znění <small>(vypravěčův překlad)</small></summary><p class="rsmall">Načítám…</p></details>`
    : "";
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.open || !d.dataset.plne || d.dataset.plneOk) return;
    d.dataset.plneOk = "1";
    plneText(d.dataset.plne, d.dataset.plnen)
      .then(x => d.insertAdjacentHTML("beforeend", plneTelo(d.dataset.plne, x)))
      .catch(() => d.insertAdjacentHTML("beforeend", `<p class="rsmall">Plné znění se nepodařilo načíst.</p>`))
      .finally(() => {
        const n = d.querySelector(":scope > p.rsmall");
        if (n && n.textContent === "Načítám…") n.remove();
      });
  },
  true,
);
/* filtr seznamu: hledá v anglickém i českém názvu; kouzla podle stupně, předměty podle vzácnosti */
function plneFiltr(k, L) {
  const f = PLNEF[k],
    q = f.q.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const nrm = s =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  return L.filter(
    x => (!q || nrm(x.en + " " + x.cz + " " + (x.en2 || "")).includes(q)) && (f.l === "" || (k === "kouzla" ? String(x.l) === f.l : x.vz === f.l)),
  ).sort((a, b) => (k === "kouzla" ? a.l - b.l : 0) || a.en.localeCompare(b.en));
}
const PLNEMAX = 120;
function plneSeznamHtml(k) {
  const L = plneFiltr(k, PLNES[k] || []);
  return `<p class="rsmall">${L.length} z ${(PLNES[k] || []).length}${L.length > PLNEMAX ? ` – ukazuji prvních ${PLNEMAX}, zpřesni hledání` : ""}</p>${L.slice(
    0,
    PLNEMAX,
  )
    .map(
      x =>
        `<details class="bjapd plne" data-plne="${k}" data-plnen="${besc(x.id)}"><summary><b>${besc(x.cz || x.en)}</b> <small lang="en">${besc(x.en)}</small> <small>· ${besc(k === "kouzla" ? (x.l ? x.l + ". st." : "trik") : x.vz || "")}</small></summary><p class="rsmall">Načítám…</p></details>`,
    )
    .join("")}`;
}
function plneFiltrHtml(k) {
  const f = PLNEF[k],
    vol =
      k === "kouzla"
        ? [["", "všechny stupně"], ["0", "triky"], ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => [String(i), `${i}. stupeň`])]
        : [
            ["", "všechny vzácnosti"],
            ...["běžná", "neobvyklá", "vzácná", "velmi vzácná", "legendární", "artefakt", "žádná", "různá"].map(v => [v, v]),
          ];
  return `<div class="plnef"><input type="search" data-plneq="${k}" value="${besc(f.q)}" placeholder="Hledat název (anglicky i česky)" aria-label="Hledat"> <select data-plnel="${k}" aria-label="Filtr">${vol
    .map(([v, n]) => `<option value="${v}"${f.l === v ? " selected" : ""}>${n}</option>`)
    .join("")}</select></div>`;
}
function plneNahratHtml() {
  return MMDB.prihlasen && MMDB.prihlasen()
    ? `<details class="bjapd"><summary>Nahrát plné texty (vypravěč)</summary><p class="rsmall">Soubory <b>kouzla.json</b> a <b>predmety.json</b> z převodníku (zdroj/mimo-srd/kouzla_predmety_plne.py) – nahradí texty v této databázi.</p>
      <p><label>Kouzla <input type="file" accept=".json" data-plneup="kouzla"></label></p><p><label>Předměty <input type="file" accept=".json" data-plneup="predmety"></label></p><p class="rsmall" id="plneupst"></p></details>`
    : "";
}
function renderPlne(main, c) {
  const k = PLNEKL[c] ? c : "kouzla";
  const hlava = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>Kouzla a předměty</b></nav><h2 class="arttitle">Kouzla a předměty – plné znění</h2>
  <p class="intro">Vypravěčův překlad všech kouzel a kouzelných předmětů D&amp;D se sjednocenými pojmy. Rámečky <b>Artikule</b> jsou domácí úpravy a mají přednost; obecné zásady jsou v <a href="#artikule">Artikulích</a> › Kouzla a předměty.</p>
  <p class="rsmall">${Object.keys(PLNEKL)
    .map(x => (x === k ? `<b>${PLNEKL[x]}</b>` : `<a href="#pravidla/plne/${x}">${PLNEKL[x]}</a>`))
    .join(" · ")}</p>`;
  if (!featyMuze()) {
    main.innerHTML = hlava + `<p class="rsmall">Plné znění uvidíš po přihlášení (Úvod nebo Hra).</p>`;
    return;
  }
  if (!PLNES[k]) {
    main.innerHTML = hlava + plneNahratHtml() + `<p class="rsmall">Načítám…</p>`;
    plneSeznam(k).then(j => {
      if (curView === "pravidla" && (location.hash || "").startsWith("#pravidla/plne")) {
        if (j) renderPlne(main, c);
        else main.innerHTML = hlava + plneNahratHtml() + `<p class="rsmall">Plné znění se nepodařilo načíst.</p>`;
      }
    });
    return;
  }
  main.innerHTML =
    hlava +
    plneNahratHtml() +
    (PLNES[k].length
      ? `${plneFiltrHtml(k)}<div id="plneseznam">${plneSeznamHtml(k)}</div>`
      : `<p class="rsmall">V databázi zatím plné znění není – vypravěč ho nahraje výše.</p>`);
}
document.addEventListener("input", e => {
  const t = e.target,
    k = t.dataset && (t.dataset.plneq || t.dataset.plnel);
  if (!k || !PLNEF[k]) return;
  if (t.dataset.plneq) PLNEF[k].q = t.value;
  else PLNEF[k].l = t.value;
  const s = document.getElementById("plneseznam");
  if (s) s.innerHTML = plneSeznamHtml(k);
});
document.addEventListener("change", e => {
  const t = e.target,
    k = t.dataset && t.dataset.plneup;
  if (!k || !t.files || !t.files[0]) return;
  const st = document.getElementById("plneupst");
  if (st) st.textContent = "Nahrávám…";
  t.files[0]
    .text()
    .then(s => MMDB.pravidlaUloz(k, JSON.parse(s)))
    .then(n => {
      if (st) st.textContent = `Nahráno: ${PLNEKL[k]} – ${n} položek.`;
      delete PLNES[k];
      delete PLNESP[k];
      Object.keys(PLNET)
        .filter(x => x.startsWith(k + "|"))
        .forEach(x => delete PLNET[x]);
    })
    .catch(err => {
      if (st) st.textContent = "Nahrání se nepovedlo: " + (err && err.message ? err.message : err);
    });
});
