/* ===== Fórum (2026-10-31): pomalá hra mezi sezeními – Obsah fóra, seznam témat, téma s příspěvky =====
   Stránka #forum (index), #forum/f/<fórum> (témata), #forum/n/<fórum> (nové téma), #forum/t/<téma> (příspěvky),
   #forum/m[/ceka] (moje témata, čekají na mě), #forum/h/<hledání>. Čte a píše vypravěč nebo hráč přihlášený za postavu
   (MMDB.forum*, databáze na konci schema.sql); změny přijdou pulsem (druh „forum“). Správa struktury fóra: vypravěč, tlačítko „Upravit strukturu“. */
const FORUM = {
  strom: null,
  temata: null,
  seznam: null,
  tema: null,
  souseda: null,
  fid: null,
  tid: null,
  rezim: "",
  filtr: "",
  q: "",
  chyba: "",
  uprav: false,
  edit: null,
  odp: null,
  hod: null,
  pocet: undefined,
  pocetBeh: false,
  skok: null,
  klic: "",
};
const forumKarta = () => (GMV ? null : (jaK() || {}).id || null);
const forumMuze = () => GMV || !!forumKarta();
const fCas = c => {
  const d = new Date(c);
  if (isNaN(d)) return "";
  const dnes = new Date();
  const hm = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  if (d.toDateString() === dnes.toDateString()) return `dnes ${hm}`;
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear() === dnes.getFullYear() ? "" : d.getFullYear() + " "}${hm}`;
};
const fDny = n => `${n} ${n === 1 ? "den" : n >= 2 && n <= 4 ? "dny" : "dní"}`;
const fBez = t =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
/* herní datum (stejné jako „Dnes je…“ na Úvodu) – předvyplní se do nového tématu */
function forumHerniDatum() {
  try {
    const [Y, M, D] = herniDen();
    return `${D}. ${MES[M - 1]} ${Y}`;
  } catch (e) {
    return "";
  }
}
/* text příspěvku: odstavce, zalomení, *kurzíva*, **tučně** a odkazy na stránky webu [text](#osoba/jan) – nic dalšího (žádné HTML) */
function fText(t) {
  return besc(t)
    .split(/\n{2,}/)
    .map(
      p =>
        `<p>${p
          .replace(/\[([^\]\n]+)\]\((#[A-Za-z0-9/_-]+)\)/g, '<a href="$2">$1</a>')
          .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
          .replace(/\*([^*\n]+)\*/g, "<i>$1</i>")
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}
const fJmeno = id => (id === "gm" ? "Vypravěč" : (KARTBY[id] || {}).n || id);
function forumUvod(h) {
  return `<nav class="fonav subnav" aria-label="Fórum"><a href="#forum">Obsah fóra</a><a href="#forum/m/ceka">Čekají na mě${forumOdznakHtml()}</a><a href="#forum/m">Moje témata</a>${mmJenHra() ? `<a href="#hra">Zpět do Hry</a>` : ""}${h || ""}</nav>`;
}
/* odznak „na kolika tématech se čeká na mě“ u odkazů na Fórum (načte se jednou a pak se obnovuje pulsem) */
function forumOdznakHtml() {
  if (FORUM.pocet === undefined && forumMuze()) forumPocetNacti();
  return FORUM.pocet && FORUM.pocet.ceka ? `<b class="pultn" title="Čeká se na tebe">${FORUM.pocet.ceka}</b>` : "";
}
function forumPocetNacti() {
  if (!window.MMDB || FORUM.pocetBeh) return;
  FORUM.pocetBeh = true;
  if (FORUM.pocet === undefined) FORUM.pocet = null;
  MMDB.forumPocet(forumKarta())
    .then(p => {
      const zm = !FORUM.pocet || FORUM.pocet.ceka !== p.ceka || FORUM.pocet.nove !== p.nove;
      FORUM.pocet = p;
      if (zm && curView === "boj") bojPrekresli();
    })
    .catch(() => {})
    .finally(() => {
      FORUM.pocetBeh = false;
    });
}
function forumBez() {
  return `${forumUvod()}<h2 class="arttitle">Fórum</h2><p class="rsmall">Fórum čtou a píšou jen hráči přihlášení za svou postavu a vypravěč. Přihlas se ve <a href="#hra">Hře</a>.</p>`;
}
async function renderForum(b, c) {
  const box = document.getElementById("forumview");
  if (!box) return;
  if (!window.MMDB) {
    box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum</h2><p class="rsmall">Fórum potřebuje připojení k databázi.</p>`;
    return;
  }
  if (!forumMuze()) {
    box.innerHTML = forumBez();
    return;
  }
  const rezim = ["f", "n", "t", "m", "h"].includes(b) ? b : "";
  const novy = rezim + "|" + (c || "");
  if (FORUM.klic !== novy) {
    FORUM.klic = novy;
    FORUM.edit = null;
    FORUM.odp = null;
    FORUM.hod = null;
    if (rezim !== "t") FORUM.tema = null;
  }
  FORUM.rezim = rezim;
  FORUM.fid = rezim === "f" || rezim === "n" ? c : null;
  FORUM.tid = rezim === "t" ? +c || null : null;
  FORUM.filtr = rezim === "m" && c === "ceka" ? "ceka" : "";
  FORUM.q = rezim === "h" ? String(c || "") : "";
  FORUM.chyba = "";
  await forumNacti();
}
let fSeq = 0;
async function forumNacti() {
  const box = document.getElementById("forumview");
  if (!box || curView !== "forum") return;
  const k = forumKarta(),
    moje = ++fSeq,
    rez = FORUM.rezim;
  let strom, temata, seznam, tema;
  try {
    strom = await MMDB.forumStrom(k);
    if (rez === "f") temata = await MMDB.forumTemata(FORUM.fid, k);
    if (rez === "m") seznam = await MMDB.forumMoje(k);
    if (rez === "h") seznam = FORUM.q.length >= 2 ? await MMDB.forumHledej(FORUM.q, k) : [];
    if (rez === "t") tema = await forumTemaNacti(k);
  } catch (e) {
    if (moje !== fSeq) return;
    FORUM.chyba = String((e && e.message) || e);
    FORUM.strom = FORUM.strom || [];
    forumVykresli();
    return;
  }
  /* mezitím začalo novější načtení (puls, odeslaný příspěvek) – tohle už je zastaralé */
  if (moje !== fSeq || rez !== FORUM.rezim) return;
  FORUM.strom = strom;
  FORUM.pocet = {
    ceka: strom.reduce((a, f) => a + (f.ceka || 0), 0),
    nove: strom.reduce((a, f) => a + (f.nove || 0), 0),
  };
  if (temata) FORUM.temata = temata;
  if (seznam) FORUM.seznam = seznam;
  if (tema) {
    FORUM.tema = tema.n;
    FORUM.souseda = tema.souseda;
  }
  forumVykresli();
  if (rez === "t" && FORUM.tema && FORUM.tema.tema.posledni_id && FORUM.tema.cteno < FORUM.tema.tema.posledni_id) {
    const t = FORUM.tema;
    MMDB.forumPrecteno(t.tema.id, t.tema.posledni_id, k)
      .then(() => {
        t.cteno = t.tema.posledni_id;
      })
      .catch(() => {});
  }
  if (rez === "t" && FORUM.skok !== FORUM.tid) {
    FORUM.skok = FORUM.tid;
    const p = box.querySelector(".fopredel");
    if (p) p.scrollIntoView({block: "start"});
  }
}
async function forumTemaNacti(k) {
  const stare = FORUM.tema && FORUM.tema.tema.id === FORUM.tid ? FORUM.tema : null,
    n = await MMDB.forumTema(FORUM.tid, null, k);
  n.cteno0 = stare ? stare.cteno0 : n.cteno;
  if (stare && stare.prispevky.length > n.prispevky.length) {
    /* starší příspěvky, které si čtenář už rozbalil, zůstanou */
    const mn = n.prispevky.length ? n.prispevky[0].id : Infinity;
    n.prispevky = stare.prispevky.filter(p => p.id < mn).concat(n.prispevky);
    n.starsi = stare.starsi;
  } else if (!stare) {
    /* první otevření: načíst tolik starších, aby byl vidět první nepřečtený příspěvek */
    for (let i = 0; i < 8 && n.starsi && n.cteno0 > 0 && n.prispevky.length && n.prispevky[0].id > n.cteno0; i++) {
      const s = await MMDB.forumTema(FORUM.tid, n.prispevky[0].id, k);
      n.prispevky = s.prispevky.concat(n.prispevky);
      n.starsi = s.starsi;
    }
  }
  return {n, souseda: GMV ? await MMDB.forumTemata(n.tema.forum, null) : null};
}
function forumPuls() {
  if (!forumMuze()) return;
  if (curView !== "forum") {
    forumPocetNacti();
    return;
  }
  const ae = document.activeElement,
    box = document.getElementById("forumview");
  /* nepřekreslovat, když čtenář píše */
  if (FORUM.rezim === "n" || (ae && box && box.contains(ae) && ae.matches("input,textarea,select") && ae.value)) return;
  if (FORUM.rezim === "t" && box && box.querySelector(".foformpsani textarea") && box.querySelector(".foformpsani textarea").value) {
    return;
  }
  forumNacti();
}
function forumVykresli() {
  const box = document.getElementById("forumview");
  if (!box) return;
  const hlava = FORUM.chyba ? `<p class="fochyba" role="alert">${besc(FORUM.chyba)}</p>` : "";
  if (FORUM.rezim === "t") return forumTemaVykresli(box, hlava);
  if (FORUM.rezim === "n") return forumNoveVykresli(box, hlava);
  if (FORUM.rezim === "f") return forumSeznamVykresli(box, hlava);
  if (FORUM.rezim === "m" || FORUM.rezim === "h") return forumSeznamyVykresli(box, hlava);
  forumIndexVykresli(box, hlava);
}
/* ----- Obsah fóra ----- */
function forumHledaniHtml() {
  return `<form class="fohled" data-fohled role="search"><input type="search" name="q" value="${besc(FORUM.q)}" maxlength="80" placeholder="Hledat ve fóru…" aria-label="Hledat ve fóru"><button class="gbtn">Hledat</button></form>`;
}
function forumIndexVykresli(box, hlava) {
  const S = FORUM.strom || [],
    kat = S.filter(f => f.druh === "kategorie"),
    ceka = S.reduce((a, f) => a + (f.ceka || 0), 0),
    nove = S.reduce((a, f) => a + (f.nove || 0), 0);
  const fora = rodic => S.filter(f => f.rodic === rodic && f.druh === "forum");
  const radek = f => {
    const pod = fora(f.id);
    const chips = `${f.ceka ? `<span class="fochip fotvuj">Čeká se na tebe · ${f.ceka}</span>` : ""}${f.nove ? `<span class="fochip fonove">nové · ${f.nove}</span>` : ""}${f.soukrome ? `<span class="fochip">soukromé</span>` : ""}${f.zamceno ? `<span class="fochip">jen pro čtení</span>` : ""}`;
    const pos = f.posledni
      ? `<a href="#forum/t/${f.posledni.tema}">${besc(f.posledni.nazev)}</a><small>${besc(f.posledni.jmeno)} · ${fCas(f.posledni.cas)}</small>`
      : `<small>zatím nic</small>`;
    return `<div class="forad"><div class="fojm"><a class="fonaz" href="#forum/f/${besc(f.id)}">${besc(f.nazev)}</a>${chips}${f.popis ? `<p>${besc(f.popis)}</p>` : ""}${
      pod.length ? `<p class="fopod">Podfóra: ${pod.map(p => `<a href="#forum/f/${besc(p.id)}">${besc(p.nazev)}</a>`).join(" · ")}</p>` : ""
    }</div><div class="fonum" title="Témata"><b>${f.temat}</b><small>témat</small></div><div class="fonum" title="Příspěvky"><b>${f.prispevku}</b><small>příspěvků</small></div><div class="fopos">${pos}</div></div>`;
  };
  if (GMV && FORUM.uprav) return forumStrukturaVykresli(box, hlava);
  box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum</h2>${hlava}
    <p class="fodatum">Herní datum: <b>${besc(forumHerniDatum())}</b></p>
    ${forumHledaniHtml()}
    <p class="fosouhrn">${ceka ? `<span class="fochip fotvuj">Čekají na tebe: ${ceka}</span>` : `<span class="fochip">Nic na tebe nečeká</span>`}${nove ? ` <span class="fochip fonove">Nepřečtená témata: ${nove}</span>` : ""}${GMV ? ` <button type="button" class="gbtn ghost" data-fouprav>Upravit strukturu</button>` : ""}</p>
    ${kat
      .map(
        k =>
          `<section class="fokat"><h3>${besc(k.nazev)}</h3>${k.popis ? `<p class="fopopis">${besc(k.popis)}</p>` : ""}${fora(k.id).map(radek).join("") || '<p class="rsmall fopraz">Zatím bez fór.</p>'}</section>`,
      )
      .join("")}
    ${S.length ? "" : '<p class="rsmall">Fórum se načítá…</p>'}`;
}
/* ----- Správa struktury (vypravěč) ----- */
const fSlug = n =>
  fBez(n)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 34) || "forum";
function fSoucasti(S, rodic, druh) {
  return S.filter(f => (f.rodic || null) === (rodic || null) && f.druh === druh).sort(
    (a, b) => a.poradi - b.poradi || a.nazev.localeCompare(b.nazev, "cs"),
  );
}
function forumFormHtml(f, rodic, druh) {
  const novy = !f;
  const S = FORUM.strom || [],
    moznosti = S.filter(x => x.druh === "kategorie" || (x.druh === "forum" && (!f || x.id !== f.id)));
  const x = f || {nazev: "", popis: "", vede_gm: false, soukrome: false, zamceno: false, rodic: rodic || null, druh};
  return `<form class="foform foedit" data-fofo="${besc(novy ? "" : f.id)}" data-druh="${besc(x.druh)}">
    <label>Název <input name="nazev" value="${besc(x.nazev)}" maxlength="80" required></label>
    <label>Popis <input name="popis" value="${besc(x.popis)}" maxlength="300"></label>
    ${
      x.druh === "forum"
        ? `<label>Nadřazené <select name="rodic">${moznosti.map(m => `<option value="${besc(m.id)}"${m.id === x.rodic ? " selected" : ""}>${m.druh === "forum" ? "↳ " : ""}${besc(m.nazev)}</option>`).join("")}</select></label>
    <label class="fochk"><input type="checkbox" name="vede_gm"${x.vede_gm ? " checked" : ""}> Témata zakládá jen vypravěč (quest)</label>
    <label class="fochk"><input type="checkbox" name="soukrome"${x.soukrome ? " checked" : ""}> Soukromé (téma musí mít účastníky)</label>
    <label class="fochk"><input type="checkbox" name="zamceno"${x.zamceno ? " checked" : ""}> Jen pro čtení (píše jen vypravěč)</label>`
        : ""
    }
    <p><button class="gbtn">${novy ? "Přidat" : "Uložit"}</button> <button type="button" class="gbtn ghost" data-foeditx>Zrušit</button></p></form>`;
}
function forumStrukturaVykresli(box, hlava) {
  const S = FORUM.strom || [];
  const ovl = f =>
    `<span class="fostrbtn"><button type="button" class="fobtn" data-foposun="${besc(f.id)}" data-s="-1" aria-label="Posunout výš">↑</button><button type="button" class="fobtn" data-foposun="${besc(f.id)}" data-s="1" aria-label="Posunout níž">↓</button><button type="button" class="fobtn" data-foedit="${besc(f.id)}">Upravit</button><button type="button" class="fobtn" data-fosmaz="${besc(f.id)}">Smazat</button></span>`;
  const strom = (rodic, hl) =>
    fSoucasti(S, rodic, "forum")
      .map(
        f =>
          `<div class="fostrom" style="--hl:${hl}"><div class="fostrr"><span><b>${besc(f.nazev)}</b> <small>${f.temat} témat${f.vede_gm ? " · quest" : ""}${f.soukrome ? " · soukromé" : ""}${f.zamceno ? " · jen čtení" : ""}</small></span>${ovl(f)}</div>${FORUM.edit === f.id ? forumFormHtml(f) : ""}${strom(f.id, hl + 1)}</div>`,
      )
      .join("");
  box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum · struktura</h2>${hlava}
    <p class="fosouhrn"><button type="button" class="gbtn" data-fouprav>Hotovo</button></p>
    <p class="rsmall">Kategorie sdružují fóra; fórum může mít podfóra. Smazat jde jen fórum bez témat (témata nejdřív přesuň).</p>
    ${fSoucasti(S, null, "kategorie")
      .map(
        k =>
          `<section class="fokat"><h3>${besc(k.nazev)} ${ovl(k)}</h3>${FORUM.edit === k.id ? forumFormHtml(k) : ""}${strom(k.id, 0)}
          ${FORUM.edit === "+" + k.id ? forumFormHtml(null, k.id, "forum") : `<p class="fostradd"><button type="button" class="gbtn ghost" data-foedit="+${besc(k.id)}">Přidat fórum do „${besc(k.nazev)}“</button></p>`}</section>`,
      )
      .join("")}
    ${FORUM.edit === "+kat" ? forumFormHtml(null, null, "kategorie") : `<p><button type="button" class="gbtn ghost" data-foedit="+kat">Přidat kategorii</button></p>`}`;
}
/* ----- Seznam témat ----- */
function forumCesta(f) {
  const S = FORUM.strom || [],
    cesta = [];
  let x = f;
  while (x) {
    cesta.unshift(x);
    x = S.find(y => y.id === x.rodic);
  }
  return cesta
    .map(x => (x.druh === "kategorie" ? `<span>${besc(x.nazev)}</span>` : `<a href="#forum/f/${besc(x.id)}">${besc(x.nazev)}</a>`))
    .join("");
}
function forumStav(t) {
  return `${t.prilepene ? `<span class="fochip">📌 přilepené</span>` : ""}${t.stav === "uzavrene" ? `<span class="fochip">uzavřené</span>` : ""}${
    t.ceka_me
      ? `<span class="fochip fotvuj">Čeká se na tebe</span>`
      : t.ceka_jmena && t.ceka_jmena.length && t.stav === "otevrene"
        ? `<span class="fochip">Čeká se na ${besc(t.ceka_jmena.join(", "))}</span>`
        : ""
  }${t.stoji_dni >= 1 && (GMV || t.ceka_me) ? `<span class="fochip fostoji">stojí ${fDny(t.stoji_dni)}</span>` : ""}`;
}
function forumNovePravo(f) {
  return GMV || (!f.vede_gm && !f.zamceno);
}
function forumTemaRadek(t, forumNazev) {
  return `<a class="fotr${t.nove ? " fonovy" : ""}" href="#forum/t/${t.id}"><span class="fotn">${t.nove ? '<i class="fotecka" aria-label="nové"></i>' : ""}${besc(t.nazev)}${forumNazev ? ` <small>· ${besc(t.forum_nazev)}</small>` : ""}</span><span class="fotstav">${forumStav(t)}</span><span class="fotmeta">${t.herni_datum ? `${besc(t.herni_datum)} · ` : ""}${besc(t.zalozil)} · ${t.pocet} př.${t.posledni_cas ? ` · poslední ${besc(t.posledni_jmeno)}, ${fCas(t.posledni_cas)}` : ""}</span></a>`;
}
function forumSeznamVykresli(box, hlava) {
  const f = (FORUM.strom || []).find(x => x.id === FORUM.fid);
  if (!f) {
    box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum</h2>${hlava || '<p class="rsmall">Takové fórum není.</p>'}`;
    return;
  }
  const pod = (FORUM.strom || []).filter(x => x.rodic === f.id && x.druh === "forum");
  const T = FORUM.temata || [];
  box.innerHTML = `${forumUvod(forumCesta(f))}<h2 class="arttitle">${besc(f.nazev)}</h2>${hlava}
    ${f.popis ? `<p class="fopopis">${besc(f.popis)}</p>` : ""}
    ${pod.length ? `<p class="fopod">Podfóra: ${pod.map(p => `<a href="#forum/f/${besc(p.id)}">${besc(p.nazev)}</a>`).join(" · ")}</p>` : ""}
    <p class="fonastroje">${forumNovePravo(f) ? `<a class="gbtn" href="#forum/n/${besc(f.id)}">Nové téma</a>` : `<span class="rsmall">${f.zamceno ? "Jen pro čtení." : "Nová témata zakládá vypravěč."}</span>`}</p>
    <div class="fotem">${T.length ? T.map(t => forumTemaRadek(t)).join("") : '<p class="rsmall">Zatím tu není žádné téma.</p>'}</div>`;
}
/* ----- Moje témata, čekají na mě, hledání ----- */
function forumSeznamyVykresli(box, hlava) {
  const L = FORUM.seznam || [];
  if (FORUM.rezim === "h") {
    box.innerHTML = `${forumUvod()}<h2 class="arttitle">Hledání ve fóru</h2>${hlava}${forumHledaniHtml()}
      <div class="fotem">${
        FORUM.q.length < 2
          ? '<p class="rsmall">Napiš aspoň dvě písmena.</p>'
          : L.length
            ? L.map(
                r =>
                  `<a class="fotr" href="#forum/t/${r.tema}"><span class="fotn">${besc(r.nazev)}</span><span class="fotmeta">${besc(r.jmeno)} · ${fCas(r.cas)}</span><span class="fohled-t">${besc(r.t)}</span></a>`,
              ).join("")
            : '<p class="rsmall">Nic nenalezeno.</p>'
      }</div>`;
    return;
  }
  const T = FORUM.filtr === "ceka" ? L.filter(t => t.ceka_me && t.stav === "otevrene") : L;
  box.innerHTML = `${forumUvod()}<h2 class="arttitle">${FORUM.filtr === "ceka" ? "Čekají na mě" : "Moje témata"}</h2>${hlava}
    <div class="fotem">${T.length ? T.map(t => forumTemaRadek(t, true)).join("") : `<p class="rsmall">${FORUM.filtr === "ceka" ? "Nic na tebe nečeká." : "Zatím nemáš žádná témata."}</p>`}</div>`;
}
/* ----- Nové téma ----- */
function forumUcastniciHtml(nazev, vybrane) {
  return `<fieldset class="foucast"><legend>${nazev}</legend>${KARTY.map(
    k =>
      `<label><input type="checkbox" name="${nazev === "Účastníci" ? "uc" : "ceka"}" value="${besc(k.id)}"${(vybrane || []).includes(k.id) ? " checked" : ""}> ${besc(k.n)}</label>`,
  ).join("")}</fieldset>`;
}
function forumNoveVykresli(box, hlava) {
  const f = (FORUM.strom || []).find(x => x.id === FORUM.fid);
  if (!f || f.druh !== "forum" || !forumNovePravo(f)) {
    box.innerHTML = `${forumUvod()}<h2 class="arttitle">Nové téma</h2>${hlava}<p class="rsmall">Tady nové téma založit nejde.</p>`;
    return;
  }
  const me = forumKarta();
  box.innerHTML = `${forumUvod(forumCesta(f))}<h2 class="arttitle">Nové téma · ${besc(f.nazev)}</h2>${hlava}
    <form class="foform" data-fonove="${besc(f.id)}">
      <label>Název <input name="nazev" maxlength="120" required placeholder="Např. Cesta do Kutné Hory"></label>
      <label>Herní datum <small>(volitelné)</small> <input name="datum" maxlength="40" value="${besc(forumHerniDatum())}" placeholder="14. března 1458"></label>
      ${GMV || f.soukrome ? forumUcastniciHtml("Účastníci", me ? [me] : []) + `<p class="rsmall">${f.soukrome ? "Soukromé téma vidí jen účastníci a vypravěč." : "Bez zaškrtnutí vidí téma každý."}</p>` : ""}
      ${GMV ? forumUcastniciHtml("Čeká se na") : ""}
      <label>První příspěvek <textarea name="t" rows="8" maxlength="8000" required></textarea></label>
      ${forumNapovedaHtml()}
      <p><button class="gbtn">Založit téma</button> <a class="gbtn ghost" href="#forum/f/${besc(f.id)}">Zrušit</a></p>
    </form>`;
}
/* ----- Kostky ----- */
function fKostka(n) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return (a[0] % n) + 1;
}
/* hod z textu „2k6+3“ / „1d20“: výhoda a nevýhoda jen u jedné k20; kostka Závoje k6 (1–2 Pokušení, 5–6 Požehnání, přirozená 20 + 6 Boží prst,
   přirozená 1 + 1 Ďáblovo dílo); vrací objekt pro pole hod příspěvku nebo řetězec s chybou */
function fHodit(text, popis, vyhoda, zavoj, taj) {
  const m = /^\s*(\d{0,2})\s*[dk]\s*(\d{1,3})\s*(?:([+-])\s*(\d{1,3}))?\s*$/i.exec(text || "");
  if (!m) return "Kostky napiš třeba jako 1k20+5 nebo 2k6.";
  const n = +m[1] || 1,
    st = +m[2],
    mod = m[3] ? (m[3] === "-" ? -1 : 1) * +m[4] : 0;
  if (st < 2 || n < 1 || n > 20) return "Kostek může být 1 až 20 a mít aspoň 2 stěny.";
  let d = Array.from({length: n}, () => fKostka(st)),
    vh = "";
  if (vyhoda && n === 1 && st === 20) {
    const dva = [fKostka(20), fKostka(20)];
    vh = vyhoda === "v" ? "výhoda" : "nevýhoda";
    d = [vyhoda === "v" ? Math.max(...dva) : Math.min(...dva)];
    d.dva = dva;
  }
  const soucet = d.reduce((a, b) => a + b, 0) + mod,
    norm = `${n}k${st}${mod ? (mod > 0 ? "+" : "") + mod : ""}`;
  const h = {t: `${popis ? popis + " " : ""}${norm}${vh ? " (" + vh + ")" : ""}`, f: norm, d, vysl: soucet};
  if (d.dva) h.dva = d.dva;
  if (zavoj) {
    const z = fKostka(6),
      pr = n === 1 && st === 20 ? d[0] : 0;
    const slovo =
      pr === 20 && z === 6 ? "Boží prst" : pr === 1 && z === 1 ? "Ďáblovo dílo" : z <= 2 ? "Pokušení" : z >= 5 ? "Požehnání" : "bez účinku";
    h.zavoj = {k6: z, t: slovo};
  }
  if (taj) h.taj = true;
  return h;
}
function fHodHtml(h) {
  if (!h) return "";
  const kost = h.txt ? String(h.txt).replace(/ = -?\d+/, "") : h.dva ? `${h.dva.join(", ")} → ${h.d[0]}` : (h.d || []).join(" + ");
  return `🎲 ${besc(h.t || "hod")} = <b>${besc(h.vysl)}</b>${kost ? ` <small>(${besc(kost)})</small>` : ""}${h.zavoj ? ` · Závoj k6: ${h.zavoj.k6} – <b>${besc(h.zavoj.t)}</b>` : ""}${h.karta ? " <small>(z karty)</small>" : ""}${h.taj ? " <small>(tajně)</small>" : ""}`;
}
/* hod z karty postavy (2026-11-01, Vojta): stejný výpočet jako tlačítko na kartě (kartaHod v 13 – bonusy podle pravidel postavy, stavy,
   vyčerpání, posílení z účinků, kostka Závoje, ruční kostky); hod se zapíše i do herního záznamu, takže ho vypravěč vidí i tam.
   Útoky zatím ne: na kartě s nimi souvisí střelivo a účinky (Hex, Bless…), které se mají odečíst jen v boji. */
function forumKartaHodyHtml(K) {
  const sg = v => (v >= 0 ? "+" : "") + v,
    sk = (lbl, L) => `<optgroup label="${lbl}">${L.join("")}</optgroup>`;
  let ops = "";
  try {
    ops =
      sk(
        "Dovednosti",
        Object.keys(KDOVAB)
          .map(d => [d, pojmyCz(d)])
          .sort((x, y) => x[1].localeCompare(y[1], "cs"))
          .map(([d, n]) => `<option value="dv:${besc(d)}">${besc(n)} ${sg(kDov(K, d))}</option>`),
      ) +
      sk(
        "Ověření vlastnosti",
        Object.keys(KSK).map(a => `<option value="ov:${a}">${KSK[a]} ${sg(kOvB(K, a))}</option>`),
      ) +
      sk(
        "Záchrany",
        Object.keys(KSK).map(a => `<option value="za:${a}">Záchrana – ${KSK[a]} ${sg(kZach(K, a))}</option>`),
      ) +
      sk("Ostatní", [`<option value="in:">Iniciativa ${sg(kIni(K))}</option>`]);
  } catch (e) {
    return "";
  }
  return `<p class="fokdo">Z karty postavy <small>(bonusy, stavy a Závoj jako na Hře)</small></p><div class="fokrow"><select data-fokh aria-label="Hod z karty">${ops}</select><select data-fokhv aria-label="Výhoda u hodu z karty"><option value="">bez výhody</option><option value="1">výhoda</option><option value="-1">nevýhoda</option></select><button type="button" class="gbtn" data-fokhod>Hodit z karty</button></div>`;
}
async function forumKartaHod(K, volba, adv) {
  const [k, a] = volba.split(/:(.*)/s),
    o = {adv: +adv || 0};
  let co, b;
  if (k === "ov") {
    co = `Ověření ${KSK[a] || a}`;
    b = kOvB(K, a);
  } else if (k === "za") {
    co = `Záchrana ${a}`;
    b = kZach(K, a);
  } else if (k === "dv") {
    co = a;
    b = kDov(K, a);
    const r = kSvAdv(K, a);
    if (r.length) {
      o.adv = kAdvSum(o.adv, r);
      o.why = r.map(x => x[1]).join(", ");
    }
  } else if (k === "in") {
    co = "Iniciativa";
    b = kIni(K);
  } else return null;
  const r = await kartaHod(K, co, b, o);
  if (!r) return null;
  const h = {t: co, vysl: r.tot, txt: String(r.txt || "").slice(0, 300), karta: K.id};
  if (r.zav != null) h.zavoj = {k6: r.zav, t: zavVys(r.zr)};
  return h;
}
/* ----- Pomůcky pro psaní: nápověda, zmínky, odkazy na osoby a rody, koncepty ----- */
function forumNapovedaHtml() {
  return `<p class="rsmall">*kurzíva*, **tučně**, prázdný řádek dělí odstavce. <code>@Jméno</code> přidá postavu mezi ty, na které se čeká.</p>`;
}
function forumVlozitHtml() {
  const osoby = PEOPLE.map(p => [p.id, p.n.replace(/^✦\s*/, "")])
    .sort((a, b) => a[1].localeCompare(b[1], "cs"))
    .slice(0, 400);
  const rody = FAM.map(f => [f.id, f.name]).sort((a, b) => a[1].localeCompare(b[1], "cs"));
  return `<div class="fovloz"><select data-fovloz="zm" aria-label="Zmínit postavu"><option value="">@ Zmínit postavu…</option>${KARTY.map(k => `<option value="${besc(k.n.split(/\s+/)[0])}">${besc(k.n)}</option>`).join("")}</select>
    <select data-fovloz="osoba" aria-label="Odkaz na osobu"><option value="">Odkaz na osobu…</option>${osoby.map(([i, n]) => `<option value="${besc(i)}|${besc(n)}">${besc(n)}</option>`).join("")}</select>
    <select data-fovloz="rod" aria-label="Odkaz na rod"><option value="">Odkaz na rod…</option>${rody.map(([i, n]) => `<option value="${besc(i)}|${besc(n)}">${besc(n)}</option>`).join("")}</select></div>`;
}
/* postavy zmíněné v textu jako @Jméno (první slovo jména, bez ohledu na háčky a velikost) */
function fZminky(t) {
  const vse = new Set();
  for (const m of String(t).matchAll(/@([\p{L}]{2,})/gu)) {
    const x = fBez(m[1]),
      k = KARTY.find(k => fBez(k.n.split(/\s+/)[0]) === x);
    if (k) vse.add(k.id);
  }
  return [...vse];
}
const fKonceptKlic = id => "mm-forum-koncept-" + id;
function fKoncept(id, v) {
  try {
    if (v === undefined) return localStorage.getItem(fKonceptKlic(id)) || "";
    if (v) localStorage.setItem(fKonceptKlic(id), v);
    else localStorage.removeItem(fKonceptKlic(id));
  } catch (e) {}
  return "";
}
/* ----- Téma ----- */
function forumPrispevekHtml(p, T) {
  const gm = GMV,
    jenGm = p.skryto && !gm;
  const img = p.karta ? (kartaStav(p.karta) || {}).img : "";
  const av =
    typeof img === "string" && /^(data:image\/|https?:|art\/)/.test(img) ? `<img class="foav" src="${besc(img)}" alt="" loading="lazy">` : "";
  const pan = `<div class="fopan">${av}<span><b>${besc(p.jmeno)}</b>${p.karta ? "" : "<small>vypravěč</small>"}</span></div>`;
  const hod = p.hod ? `<p class="fohod">${fHodHtml(p.hod)}</p>` : "";
  const cit = p.citace
    ? `<blockquote class="focitace"><a href="#forum/t/${T.tema.id}" data-focitskok="${p.citace.id}"><b>${besc(p.citace.jmeno)}</b></a>: ${besc(String(p.citace.t).replace(/[*]/g, ""))}</blockquote>`
    : "";
  const muzeUpravit = p.moje && T.tema.stav === "otevrene" && p.id === T.tema.posledni_id;
  const akce =
    (T.tema.stav === "otevrene" || gm ? `<button type="button" class="fobtn" data-focit="${p.id}">Citovat</button>` : "") +
    (muzeUpravit || gm ? `<button type="button" class="fobtn" data-foupr="${p.id}">Upravit</button>` : "") +
    (gm ? `<button type="button" class="fobtn" data-foskryj="${p.id}" data-s="${p.skryto ? 0 : 1}">${p.skryto ? "Zobrazit" : "Skrýt"}</button>` : "");
  return `<article class="fopris${p.ooc ? " foooc" : ""}${p.skryto ? " foskryto" : ""}" id="fop${p.id}" data-foid="${p.id}">${pan}<div class="foobs"><header><small>${fCas(p.cas)}${p.upraveno ? ` · upraveno ${fCas(p.upraveno)}` : ""}${p.ooc ? " · mimo hru" : ""}</small></header>${
    jenGm
      ? '<p class="rsmall"><i>Příspěvek skryl vypravěč.</i></p>'
      : `${p.skryto ? '<p class="rsmall"><i>Skryté před hráči.</i></p>' : ""}${cit}<div class="fotxt">${fText(p.t)}</div>${hod}`
  }<footer>${jenGm ? "" : akce}</footer></div></article>`;
}
function forumTemaVykresli(box, hlava) {
  const T = FORUM.tema;
  if (!T) {
    box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum</h2>${hlava || '<p class="rsmall">Téma se načítá…</p>'}`;
    return;
  }
  const t = T.tema,
    S = FORUM.strom || [],
    f = S.find(x => x.id === t.forum);
  let predel = false;
  const html = T.prispevky
    .map(p => {
      const novy = !predel && T.cteno0 > 0 && p.id > T.cteno0 && !p.moje;
      if (novy) predel = true;
      return `${novy ? '<p class="fopredel"><span>Nové od tvé poslední návštěvy</span></p>' : ""}${forumPrispevekHtml(p, T)}`;
    })
    .join("");
  const muzePsat = t.stav === "otevrene" ? !t.zamceno || GMV : GMV;
  const ta0 = box.querySelector(".foformpsani textarea"),
    ulozeno = ta0 ? ta0.value : fKoncept(t.id);
  const odp = FORUM.odp;
  box.innerHTML = `${forumUvod(f ? forumCesta(f) : "")}<h2 class="arttitle">${besc(t.nazev)}</h2>${hlava}
    <p class="fotstav">${t.herni_datum ? `<span class="fochip">${besc(t.herni_datum)}</span>` : ""}${forumStav(t)}${t.ucastnici.length ? `<span class="fochip">Účastníci: ${besc(t.ucastnici.map(fJmeno).join(", "))}</span>` : ""}</p>
    ${GMV ? forumGmNastroje(t) : ""}
    ${T.starsi ? '<p class="fostarsi"><button type="button" class="gbtn ghost" data-fostarsi>Načíst starší příspěvky</button></p>' : ""}
    <div class="foprisp">${html}</div>
    ${
      muzePsat
        ? `<form class="foform foformpsani" data-foodp="${t.id}"><h3>Odpovědět</h3>
        ${odp ? `<p class="focitbanner">Odpověď na <b>${besc(odp.jmeno)}</b>: „${besc(odp.t)}“ <button type="button" class="fobtn" data-focitx>✕</button></p>` : ""}
        ${GMV ? '<label>Jako <small>(jméno postavy nebo NPC, volitelné)</small> <input name="jako" maxlength="60" placeholder="Vypravěč"></label>' : ""}
        <textarea name="t" rows="6" maxlength="8000" required aria-label="Příspěvek"></textarea>
        ${forumVlozitHtml()}${forumNapovedaHtml()}
        <details class="fokostky"${FORUM.hod ? " open" : ""}><summary>🎲 Hodit kostkou</summary>${!GMV && jaK() ? forumKartaHodyHtml(jaK()) + '<p class="fokdo">Jiná kostka</p>' : ""}<div class="fokrow">
          <input data-fohf value="1k20" size="8" aria-label="Kostky, např. 1k20+5"><input data-fohl placeholder="Popisek (např. Přesvědčování)" aria-label="Popisek hodu">
          <select data-fohv aria-label="Výhoda"><option value="">bez výhody</option><option value="v">výhoda</option><option value="n">nevýhoda</option></select>
          <label class="fochk"><input type="checkbox" data-fohz> Závoj k6</label><label class="fochk"><input type="checkbox" data-fohtaj> tajně</label>
          <button type="button" class="gbtn ghost" data-fohod>Hodit</button></div>
          ${FORUM.hod ? `<p class="fohodchip">${fHodHtml(FORUM.hod)} <button type="button" class="fobtn" data-fohodx>✕</button></p>` : ""}</details>
        <label class="fochk"><input type="checkbox" name="ooc"> Mimo hru (nemění, na koho se čeká)</label>
        ${GMV ? forumUcastniciHtml("Čeká se na", t.ceka_na) : ""}
        <p><button class="gbtn">Odeslat</button></p></form>`
        : `<p class="rsmall">${t.stav === "uzavrene" ? "Téma je uzavřené." : "Do tohoto fóra píše jen vypravěč."}</p>`
    }`;
  const nov = box.querySelector(".foformpsani textarea");
  if (nov && ulozeno) nov.value = ulozeno;
}
function forumGmNastroje(t) {
  const S = FORUM.strom || [];
  const jine = (FORUM.souseda || []).filter(x => x.id !== t.id);
  const fora = S.filter(f => f.druh === "forum" && f.id !== t.forum);
  return `<details class="foGm"><summary>Nastavení tématu (vypravěč)</summary><div class="fonastr">
    <p><button type="button" class="gbtn ghost" data-fonast='${JSON.stringify({stav: t.stav === "otevrene" ? "uzavrene" : "otevrene"})}'>${t.stav === "otevrene" ? "Uzavřít téma" : "Otevřít téma"}</button>
    <button type="button" class="gbtn ghost" data-fonast='${JSON.stringify({prilepene: !t.prilepene})}'>${t.prilepene ? "Odlepit" : "Přilepit nahoru"}</button>
    ${t.forum !== "dokoncene-questy" && S.some(f => f.id === "dokoncene-questy") ? `<button type="button" class="gbtn ghost" data-fonast='${JSON.stringify({forum: "dokoncene-questy", stav: "uzavrene", ceka_na: []})}'>Archivovat do Dokončených questů</button>` : ""}</p>
    ${t.ceka_na.length ? `<p>${t.ceka_na.map(k => `<button type="button" class="gbtn ghost" data-fopreskoc="${besc(k)}">Přeskočit ${besc(fJmeno(k))}</button>`).join(" ")}</p>` : ""}
    <form data-fopresun class="fosloupec"><label>Přesunout do fóra <select name="forum">${fora.map(f => `<option value="${besc(f.id)}">${besc(f.nazev)}</option>`).join("")}</select></label><button class="gbtn ghost">Přesunout</button></form>
    ${jine.length ? `<form data-fosloucit class="fosloupec"><label>Sloučit s tématem <select name="do">${jine.map(x => `<option value="${x.id}">${besc(x.nazev)}</option>`).join("")}</select></label><button class="gbtn ghost">Sloučit (toto téma zanikne)</button></form>` : ""}
    <form data-fonast-f><label>Název <input name="nazev" value="${besc(t.nazev)}" maxlength="120"></label>
    <label>Herní datum <input name="herni_datum" value="${besc(t.herni_datum || "")}" maxlength="40"></label>
    <label>Připomenout, když se čeká déle než (dnů, výchozí 3) <input name="pripomenout" type="number" min="1" max="60" value="${t.pripomenout_dni || ""}"></label>
    ${forumUcastniciHtml("Účastníci", t.ucastnici)}<p class="rsmall">Bez zaškrtnutí vidí téma každý.</p>
    ${forumUcastniciHtml("Čeká se na", t.ceka_na)}
    <p><button class="gbtn ghost">Uložit nastavení</button></p></form></div></details>`;
}
/* ----- obsluha ----- */
async function forumAkce(fn, ok) {
  try {
    await fn();
    if (ok) await ok();
  } catch (e) {
    FORUM.chyba = String((e && e.message) || e).replace(/^.*?:\s*/, "");
    forumVykresli();
    mmHlasG(FORUM.chyba, 6000);
  }
}
const fZaskrtnute = (f, jm) => [...f.querySelectorAll(`input[name="${jm}"]:checked`)].map(x => x.value);
function fFormObj(f, S, id) {
  const d = new FormData(f),
    druh = f.dataset.druh,
    puv = id ? S.find(x => x.id === id) : null;
  const sib = fSoucasti(S, d.get("rodic") || null, druh);
  let nid = id;
  if (!nid) {
    const zaklad = fSlug(d.get("nazev"));
    nid = zaklad;
    for (let i = 2; S.some(x => x.id === nid); i++) nid = `${zaklad}-${i}`;
  }
  return {
    id: nid,
    druh,
    rodic: druh === "forum" ? d.get("rodic") : null,
    nazev: String(d.get("nazev") || "").trim(),
    popis: String(d.get("popis") || ""),
    poradi: puv ? puv.poradi : (sib.length ? sib[sib.length - 1].poradi : 0) + 10,
    vede_gm: !!d.get("vede_gm"),
    soukrome: !!d.get("soukrome"),
    zamceno: !!d.get("zamceno"),
  };
}
document.addEventListener("submit", e => {
  const f = e.target;
  if (!f.closest || !f.closest("#forumview")) return;
  const k = forumKarta();
  if (f.dataset.fonove !== undefined) {
    e.preventDefault();
    const d = new FormData(f),
      btn = f.querySelector("button");
    btn.disabled = true;
    forumAkce(async () => {
      const id = await MMDB.forumTemaZaloz(
        {
          p_forum: f.dataset.fonove,
          p_nazev: d.get("nazev"),
          p_t: d.get("t"),
          p_ucastnici: fZaskrtnute(f, "uc"),
          p_ceka_na: fZaskrtnute(f, "ceka"),
          p_herni_datum: d.get("datum") || null,
        },
        k,
      );
      FORUM.tema = null;
      navTo(`#forum/t/${id}`);
    }).finally(() => {
      btn.disabled = false;
    });
  } else if (f.dataset.foodp !== undefined) {
    e.preventDefault();
    const d = new FormData(f),
      btn = f.querySelector("button"),
      ooc = !!d.get("ooc"),
      text = String(d.get("t") || "");
    btn.disabled = true;
    const o = {p_tema: +f.dataset.foodp, p_t: text, p_ooc: ooc, p_jako: d.get("jako") || null};
    if (FORUM.odp) o.p_odpoved = FORUM.odp.id;
    if (FORUM.hod) o.p_hod = FORUM.hod;
    if (!ooc) o.p_zminky = fZminky(text);
    if (GMV) o.p_ceka = fZaskrtnute(f, "ceka");
    forumAkce(async () => {
      await MMDB.forumPrispevek(o, k);
      fKoncept(o.p_tema, "");
      FORUM.odp = null;
      FORUM.hod = null;
      f.querySelector("textarea").value = "";
      await forumNacti();
      const p = document.querySelector("#forumview .foprisp .fopris:last-child");
      if (p) p.scrollIntoView({block: "nearest"});
    }).finally(() => {
      btn.disabled = false;
    });
  } else if (f.dataset.fonastF !== undefined) {
    e.preventDefault();
    const d = new FormData(f),
      [uc, ceka] = ["uc", "ceka"].map(n => fZaskrtnute(f, n));
    forumAkce(
      () =>
        MMDB.forumTemaNastav(FORUM.tid, {
          nazev: d.get("nazev"),
          herni_datum: d.get("herni_datum"),
          ucastnici: uc,
          ceka_na: ceka,
          pripomenout_dni: d.get("pripomenout") || "",
        }),
      forumNacti,
    );
  } else if (f.dataset.foupf !== undefined) {
    e.preventDefault();
    const t = new FormData(f).get("t");
    forumAkce(() => MMDB.forumUprav(+f.dataset.foupf, t, k), forumNacti);
  } else if (f.dataset.fohled !== undefined) {
    e.preventDefault();
    const q = String(new FormData(f).get("q") || "")
      .replace(/[/#?]+/g, " ")
      .trim();
    navTo(q ? `#forum/h/${encodeURIComponent(q)}` : "#forum");
  } else if (f.dataset.fopresun !== undefined) {
    e.preventDefault();
    forumAkce(() => MMDB.forumTemaNastav(FORUM.tid, {forum: new FormData(f).get("forum")}), forumNacti);
  } else if (f.dataset.fosloucit !== undefined) {
    e.preventDefault();
    const cil = +new FormData(f).get("do");
    forumAkce(
      () => MMDB.forumSlouc(FORUM.tid, cil),
      () => navTo(`#forum/t/${cil}`),
    );
  } else if (f.dataset.fofo !== undefined) {
    e.preventDefault();
    const S = FORUM.strom || [],
      o = fFormObj(f, S, f.dataset.fofo || null);
    forumAkce(
      () => MMDB.forumFoUloz(o),
      () => {
        FORUM.edit = null;
        return forumNacti();
      },
    );
  }
});
document.addEventListener("input", e => {
  const ta = e.target;
  if (ta.matches && ta.matches("#forumview .foformpsani textarea") && FORUM.tid) fKoncept(FORUM.tid, ta.value);
});
document.addEventListener("change", e => {
  const s = e.target;
  if (!s.matches || !s.matches("#forumview [data-fovloz]") || !s.value) return;
  const ta = document.querySelector("#forumview textarea");
  if (!ta) return;
  const druh = s.dataset.fovloz,
    [i, n] = s.value.split("|");
  const vlozit = druh === "zm" ? `@${s.value} ` : druh === "osoba" ? `[${n}](#osoba/${i})` : `[${n}](#rod/${i})`;
  const a = ta.selectionStart ?? ta.value.length;
  ta.value = ta.value.slice(0, a) + vlozit + ta.value.slice(ta.selectionEnd ?? a);
  ta.focus();
  ta.selectionStart = ta.selectionEnd = a + vlozit.length;
  s.value = "";
  if (FORUM.tid) fKoncept(FORUM.tid, ta.value);
});
async function fPosun(id, smer) {
  const S = FORUM.strom || [],
    f = S.find(x => x.id === id);
  if (!f) return;
  const sib = fSoucasti(S, f.rodic, f.druh),
    i = sib.findIndex(x => x.id === id),
    j = i + smer;
  if (j < 0 || j >= sib.length) return;
  [sib[i], sib[j]] = [sib[j], sib[i]];
  for (let n = 0; n < sib.length; n++) {
    const x = sib[n];
    if (x.poradi !== (n + 1) * 10)
      await MMDB.forumFoUloz({
        id: x.id,
        druh: x.druh,
        rodic: x.rodic,
        nazev: x.nazev,
        popis: x.popis,
        poradi: (n + 1) * 10,
        vede_gm: x.vede_gm,
        soukrome: x.soukrome,
        zamceno: x.zamceno,
      });
  }
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("#forumview button");
  if (!b) return;
  const k = forumKarta(),
    d = b.dataset;
  if (d.fostarsi !== undefined) {
    const T = FORUM.tema;
    if (!T || !T.prispevky.length) return;
    b.disabled = true;
    forumAkce(async () => {
      const s = await MMDB.forumTema(T.tema.id, T.prispevky[0].id, k);
      T.prispevky = s.prispevky.concat(T.prispevky);
      T.starsi = s.starsi;
      forumVykresli();
    });
  } else if (d.foskryj !== undefined) {
    forumAkce(() => MMDB.forumSkryj(+d.foskryj, d.s === "1"), forumNacti);
  } else if (d.fonast !== undefined) {
    forumAkce(() => MMDB.forumTemaNastav(FORUM.tid, JSON.parse(d.fonast)), forumNacti);
  } else if (d.fopreskoc !== undefined) {
    forumAkce(() => MMDB.forumPreskoc(FORUM.tid, d.fopreskoc), forumNacti);
  } else if (d.foupr !== undefined) {
    const a = b.closest(".fopris"),
      p = ((FORUM.tema || {}).prispevky || []).find(x => x.id === +d.foupr);
    if (!a || !p) return;
    a.querySelector(".fotxt").outerHTML =
      `<form class="foform" data-foupf="${p.id}"><textarea name="t" rows="6" maxlength="8000" required>${besc(p.t)}</textarea><p><button class="gbtn">Uložit</button> <button type="button" class="gbtn ghost" data-fozrus>Zrušit</button></p></form>`;
    a.querySelector("footer").hidden = true;
  } else if (d.fozrus !== undefined) {
    forumVykresli();
  } else if (d.focit !== undefined) {
    const p = ((FORUM.tema || {}).prispevky || []).find(x => x.id === +d.focit);
    if (!p) return;
    const ta = document.querySelector("#forumview .foformpsani textarea");
    if (ta && FORUM.tid) fKoncept(FORUM.tid, ta.value);
    FORUM.odp = {
      id: p.id,
      jmeno: p.jmeno,
      t: String(p.t || "")
        .replace(/[*]/g, "")
        .slice(0, 120),
    };
    forumVykresli();
    const t2 = document.querySelector("#forumview .foformpsani textarea");
    if (t2) {
      t2.focus();
      t2.scrollIntoView({block: "center"});
    }
  } else if (d.focitx !== undefined) {
    FORUM.odp = null;
    forumVykresli();
  } else if (d.fohod !== undefined) {
    const f = b.closest("form"),
      v = fHodit(
        f.querySelector("[data-fohf]").value,
        f.querySelector("[data-fohl]").value.trim(),
        f.querySelector("[data-fohv]").value,
        f.querySelector("[data-fohz]").checked,
        f.querySelector("[data-fohtaj]").checked,
      );
    if (typeof v === "string") {
      mmHlasG(v, 4000);
      return;
    }
    const ta = f.querySelector("textarea");
    if (ta && FORUM.tid) fKoncept(FORUM.tid, ta.value);
    FORUM.hod = v;
    forumVykresli();
  } else if (d.fokhod !== undefined) {
    const f = b.closest("form"),
      K = jaK();
    if (!K) return;
    const ta = f.querySelector("textarea");
    if (ta && FORUM.tid) fKoncept(FORUM.tid, ta.value);
    b.disabled = true;
    forumKartaHod(K, f.querySelector("[data-fokh]").value, f.querySelector("[data-fokhv]").value)
      .then(h => {
        if (!h) return;
        FORUM.hod = h;
        forumVykresli();
      })
      .catch(err => mmHlasG(String((err && err.message) || err), 5000))
      .finally(() => {
        b.disabled = false;
      });
  } else if (d.fohodx !== undefined) {
    FORUM.hod = null;
    const ta = document.querySelector("#forumview .foformpsani textarea");
    if (ta && FORUM.tid) fKoncept(FORUM.tid, ta.value);
    forumVykresli();
  } else if (d.fouprav !== undefined) {
    FORUM.uprav = !FORUM.uprav;
    FORUM.edit = null;
    forumVykresli();
  } else if (d.foedit !== undefined) {
    FORUM.edit = d.foedit;
    forumVykresli();
  } else if (d.foeditx !== undefined) {
    FORUM.edit = null;
    forumVykresli();
  } else if (d.foposun !== undefined) {
    forumAkce(() => fPosun(d.foposun, +d.s), forumNacti);
  } else if (d.fosmaz !== undefined) {
    const f = (FORUM.strom || []).find(x => x.id === d.fosmaz);
    if (f && confirm(`Smazat ${f.druh === "kategorie" ? "kategorii" : "fórum"} „${f.nazev}“?`))
      forumAkce(() => MMDB.forumFoSmaz(d.fosmaz), forumNacti);
  }
});
/* citace: klepnutí na jméno v citaci skočí na původní příspěvek, pokud je načtený */
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest("[data-focitskok]");
  if (!a) return;
  const p = document.getElementById("fop" + a.dataset.focitskok);
  if (p) {
    e.preventDefault();
    p.scrollIntoView({block: "center"});
  }
});
/* zápis z Kroniky do fóra (tlačítko u zápisu pro vypravěče, 07): téma v Dokončených questech s textem zápisu */
async function forumZapis(zid) {
  const z = ZBY[zid];
  if (!z) throw new Error("Zápis nenalezen.");
  const d = document.createElement("div");
  d.innerHTML = String(z.text)
    .replace(/<\/(p|div|h\d|li)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n");
  let text = d.textContent
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const pata = `\n\n[Celý zápis v Kronice](#kronika/${z.id})`;
  if (text.length > 7900 - pata.length) text = text.slice(0, 7900 - pata.length).replace(/\s+\S*$/, "") + "…";
  const id = await MMDB.forumTemaZaloz(
    {
      p_forum: "dokoncene-questy",
      p_nazev: String(z.title).slice(0, 120),
      p_t: text + pata,
      p_ucastnici: [],
      p_ceka_na: [],
      p_herni_datum: String(z.date || "").slice(0, 40) || null,
    },
    null,
  );
  navTo(`#forum/t/${id}`);
}
