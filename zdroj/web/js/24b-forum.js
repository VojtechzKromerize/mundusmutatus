/* ===== Fórum (2026-10-31): pomalá hra mezi sezeními – Obsah fóra, seznam témat, téma s příspěvky =====
   Stránka #forum (index), #forum/f/<fórum> (témata), #forum/n/<fórum> (nové téma), #forum/t/<téma> (příspěvky).
   Čte a píše vypravěč nebo hráč přihlášený za postavu (MMDB.forum*, databáze 24b v schema.sql); změny přijdou pulsem (druh „forum“). */
const FORUM = {strom: null, temata: null, tema: null, fid: null, tid: null, chyba: ""};
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
/* text příspěvku: odstavce, zalomení, *kurzíva* a **tučně** – nic dalšího (žádné HTML) */
function fText(t) {
  return besc(t)
    .split(/\n{2,}/)
    .map(
      p =>
        `<p>${p
          .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
          .replace(/\*([^*\n]+)\*/g, "<i>$1</i>")
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}
const fJmeno = id => (id === "gm" ? "Vypravěč" : (KARTBY[id] || {}).n || id);
function forumUvod(h) {
  return `<nav class="fonav subnav" aria-label="Fórum"><a href="#forum">Obsah fóra</a>${mmJenHra() ? `<a href="#hra">Zpět do Hry</a>` : ""}${h || ""}</nav>`;
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
  const rezim = b === "f" || b === "n" || b === "t" ? b : "";
  FORUM.rezim = rezim;
  FORUM.fid = rezim === "f" || rezim === "n" ? c : null;
  FORUM.tid = rezim === "t" ? +c || null : null;
  FORUM.chyba = "";
  await forumNacti();
}
async function forumNacti() {
  const box = document.getElementById("forumview");
  if (!box || curView !== "forum") return;
  const k = forumKarta();
  try {
    FORUM.strom = await MMDB.forumStrom(k);
    if (FORUM.rezim === "f") FORUM.temata = await MMDB.forumTemata(FORUM.fid, k);
    if (FORUM.rezim === "t") {
      const stare = FORUM.tema && FORUM.tema.tema.id === FORUM.tid ? FORUM.tema : null,
        n = await MMDB.forumTema(FORUM.tid, null, k);
      /* starší příspěvky, které si čtenář už rozbalil, zůstanou */
      if (stare && stare.prispevky.length > n.prispevky.length) {
        const mn = n.prispevky.length ? n.prispevky[0].id : Infinity;
        n.prispevky = stare.prispevky.filter(p => p.id < mn).concat(n.prispevky);
        n.starsi = stare.starsi;
      }
      n.cteno0 = stare ? stare.cteno0 : n.cteno;
      FORUM.tema = n;
    }
  } catch (e) {
    FORUM.chyba = String((e && e.message) || e);
    FORUM.strom = FORUM.strom || [];
  }
  forumVykresli();
  if (FORUM.rezim === "t" && FORUM.tema && FORUM.tema.tema.posledni_id && FORUM.tema.cteno < FORUM.tema.tema.posledni_id) {
    const t = FORUM.tema;
    MMDB.forumPrecteno(t.tema.id, t.tema.posledni_id, k)
      .then(() => {
        t.cteno = t.tema.posledni_id;
      })
      .catch(() => {});
  }
}
function forumPuls() {
  if (curView !== "forum" || !forumMuze()) return;
  const ae = document.activeElement,
    box = document.getElementById("forumview");
  /* nepřekreslovat, když čtenář píše (formulář je mimo obnovovanou část, ale pro jistotu) */
  if (FORUM.rezim === "n" || (ae && box && box.contains(ae) && ae.matches("input,textarea,select") && (FORUM.rezim !== "t" || ae.value))) return;
  forumNacti();
}
function forumVykresli() {
  const box = document.getElementById("forumview");
  if (!box) return;
  const hlava = FORUM.chyba ? `<p class="fochyba" role="alert">${besc(FORUM.chyba)}</p>` : "";
  if (FORUM.rezim === "t") return forumTemaVykresli(box, hlava);
  if (FORUM.rezim === "n") return forumNoveVykresli(box, hlava);
  if (FORUM.rezim === "f") return forumSeznamVykresli(box, hlava);
  forumIndexVykresli(box, hlava);
}
/* ----- Obsah fóra ----- */
function forumIndexVykresli(box, hlava) {
  const S = FORUM.strom || [],
    kat = S.filter(f => f.druh === "kategorie"),
    ceka = S.reduce((a, f) => a + (f.ceka || 0), 0),
    nove = S.reduce((a, f) => a + (f.nove || 0), 0);
  const fora = rodic => S.filter(f => f.rodic === rodic && f.druh === "forum");
  const radek = (f, hl) => {
    const pod = fora(f.id);
    const chips = `${f.ceka ? `<span class="fochip fotvuj">Čeká se na tebe · ${f.ceka}</span>` : ""}${f.nove ? `<span class="fochip fonove">nové · ${f.nove}</span>` : ""}${f.soukrome ? `<span class="fochip">soukromé</span>` : ""}${f.zamceno ? `<span class="fochip">jen pro čtení</span>` : ""}`;
    const pos = f.posledni
      ? `<a href="#forum/t/${f.posledni.tema}">${besc(f.posledni.nazev)}</a><small>${besc(f.posledni.jmeno)} · ${fCas(f.posledni.cas)}</small>`
      : `<small>zatím nic</small>`;
    return `<div class="forad${hl ? " fosub" : ""}"><div class="fojm"><a class="fonaz" href="#forum/f/${besc(f.id)}">${besc(f.nazev)}</a>${chips}${f.popis ? `<p>${besc(f.popis)}</p>` : ""}${
      pod.length ? `<p class="fopod">Podfóra: ${pod.map(p => `<a href="#forum/f/${besc(p.id)}">${besc(p.nazev)}</a>`).join(" · ")}</p>` : ""
    }</div><div class="fonum" title="Témata"><b>${f.temat}</b><small>témat</small></div><div class="fonum" title="Příspěvky"><b>${f.prispevku}</b><small>příspěvků</small></div><div class="fopos">${pos}</div></div>`;
  };
  box.innerHTML = `${forumUvod()}<h2 class="arttitle">Fórum</h2>${hlava}
    <p class="fosouhrn">${ceka ? `<span class="fochip fotvuj">Čekají na tebe: ${ceka}</span>` : `<span class="fochip">Nic na tebe nečeká</span>`}${nove ? ` <span class="fochip fonove">Nepřečtená témata: ${nove}</span>` : ""}</p>
    ${kat
      .map(
        k =>
          `<section class="fokat"><h3>${besc(k.nazev)}</h3>${k.popis ? `<p class="fopopis">${besc(k.popis)}</p>` : ""}${
            fora(k.id)
              .map(f => radek(f))
              .join("") || '<p class="rsmall">Zatím bez fór.</p>'
          }</section>`,
      )
      .join("")}
    ${S.length ? "" : '<p class="rsmall">Fórum se načítá…</p>'}`;
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
  }`;
}
function forumNovePravo(f) {
  return GMV || (!f.vede_gm && !f.zamceno);
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
    <div class="fotem">${
      T.length
        ? T.map(
            t =>
              `<a class="fotr${t.nove ? " fonovy" : ""}" href="#forum/t/${t.id}"><span class="fotn">${t.nove ? '<i class="fotecka" aria-label="nové"></i>' : ""}${besc(t.nazev)}</span><span class="fotstav">${forumStav(t)}</span><span class="fotmeta">${t.herni_datum ? `${besc(t.herni_datum)} · ` : ""}${besc(t.zalozil)} · ${t.pocet} př.${t.posledni_cas ? ` · poslední ${besc(t.posledni_jmeno)}, ${fCas(t.posledni_cas)}` : ""}</span></a>`,
          ).join("")
        : '<p class="rsmall">Zatím tu není žádné téma.</p>'
    }</div>`;
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
      <label>Herní datum <small>(volitelné)</small> <input name="datum" maxlength="40" placeholder="14. března 1458"></label>
      ${GMV || f.soukrome ? forumUcastniciHtml("Účastníci", me ? [me] : []) + `<p class="rsmall">${f.soukrome ? "Soukromé téma vidí jen účastníci a vypravěč." : "Bez zaškrtnutí vidí téma každý."}</p>` : ""}
      ${GMV ? forumUcastniciHtml("Čeká se na") : ""}
      <label>První příspěvek <textarea name="t" rows="8" maxlength="8000" required></textarea></label>
      <p class="rsmall">*kurzíva*, **tučně**, prázdný řádek dělí odstavce.</p>
      <p><button class="gbtn">Založit téma</button> <a class="gbtn ghost" href="#forum/f/${besc(f.id)}">Zrušit</a></p>
    </form>`;
}
/* ----- Téma ----- */
function forumPrispevekHtml(p, T) {
  const gm = GMV,
    jenGm = p.skryto && !gm;
  const pan = `<div class="fopan"><b>${besc(p.jmeno)}</b>${p.karta ? "" : "<small>vypravěč</small>"}</div>`;
  const hod = p.hod
    ? `<p class="fohod">🎲 ${besc(p.hod.t || p.hod.n || "hod")}${p.hod.vysl != null ? ` = <b>${besc(p.hod.vysl)}</b>` : ""}${p.hod.taj ? " <small>(tajně)</small>" : ""}</p>`
    : "";
  const muzeUpravit = p.moje && T.tema.stav === "otevrene" && p.id === T.tema.posledni_id;
  const akce =
    (muzeUpravit || gm ? `${muzeUpravit || gm ? `<button type="button" class="fobtn" data-foupr="${p.id}">Upravit</button>` : ""}` : "") +
    (gm ? `<button type="button" class="fobtn" data-foskryj="${p.id}" data-s="${p.skryto ? 0 : 1}">${p.skryto ? "Zobrazit" : "Skrýt"}</button>` : "");
  return `<article class="fopris${p.ooc ? " foooc" : ""}${p.skryto ? " foskryto" : ""}" id="fop${p.id}" data-foid="${p.id}">${pan}<div class="foobs"><header><small>${fCas(p.cas)}${p.upraveno ? ` · upraveno ${fCas(p.upraveno)}` : ""}${p.ooc ? " · mimo hru" : ""}</small></header>${
    jenGm
      ? '<p class="rsmall"><i>Příspěvek skryl vypravěč.</i></p>'
      : `${p.skryto ? '<p class="rsmall"><i>Skryté před hráči.</i></p>' : ""}<div class="fotxt">${fText(p.t)}</div>${hod}`
  }<footer>${akce}</footer></div></article>`;
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
  const hrane = T.prispevky;
  let predel = false;
  const html = hrane
    .map(p => {
      const novy = !predel && T.cteno0 > 0 && p.id > T.cteno0 && !p.moje;
      if (novy) predel = true;
      return `${novy ? '<p class="fopredel"><span>Nové od tvé poslední návštěvy</span></p>' : ""}${forumPrispevekHtml(p, T)}`;
    })
    .join("");
  const muzePsat = t.stav === "otevrene" ? !t.zamceno || GMV : GMV;
  const obs = box.querySelector(".foformpsani"),
    rozepsane = obs ? obs.querySelector("textarea") : null,
    ulozeno = rozepsane ? rozepsane.value : "";
  box.innerHTML = `${forumUvod(f ? forumCesta(f) : "")}<h2 class="arttitle">${besc(t.nazev)}</h2>${hlava}
    <p class="fotstav">${t.herni_datum ? `<span class="fochip">${besc(t.herni_datum)}</span>` : ""}${forumStav(t)}${t.ucastnici.length ? `<span class="fochip">Účastníci: ${besc(t.ucastnici.map(fJmeno).join(", "))}</span>` : ""}</p>
    ${GMV ? forumGmNastroje(t) : ""}
    ${T.starsi ? '<p class="fostarsi"><button type="button" class="gbtn ghost" data-fostarsi>Načíst starší příspěvky</button></p>' : ""}
    <div class="foprisp">${html}</div>
    ${
      muzePsat
        ? `<form class="foform foformpsani" data-foodp="${t.id}"><h3>Odpovědět</h3>
        ${GMV ? '<label>Jako <small>(jméno postavy nebo NPC, volitelné)</small> <input name="jako" maxlength="60" placeholder="Vypravěč"></label>' : ""}
        <textarea name="t" rows="6" maxlength="8000" required aria-label="Příspěvek"></textarea>
        <label class="fochk"><input type="checkbox" name="ooc"> Mimo hru (nemění, na koho se čeká)</label>
        ${GMV ? forumUcastniciHtml("Čeká se na", t.ceka_na) : ""}
        <p><button class="gbtn">Odeslat</button></p></form>`
        : `<p class="rsmall">${t.stav === "uzavrene" ? "Téma je uzavřené." : "Do tohoto fóra píše jen vypravěč."}</p>`
    }`;
  const nov = box.querySelector(".foformpsani textarea");
  if (nov && ulozeno) nov.value = ulozeno;
}
function forumGmNastroje(t) {
  return `<details class="foGm"><summary>Nastavení tématu (vypravěč)</summary><div class="fonastr">
    <p><button type="button" class="gbtn ghost" data-fonast='${JSON.stringify({stav: t.stav === "otevrene" ? "uzavrene" : "otevrene"})}'>${t.stav === "otevrene" ? "Uzavřít téma" : "Otevřít téma"}</button>
    <button type="button" class="gbtn ghost" data-fonast='${JSON.stringify({prilepene: !t.prilepene})}'>${t.prilepene ? "Odlepit" : "Přilepit nahoru"}</button></p>
    <form data-fonast-f><label>Název <input name="nazev" value="${besc(t.nazev)}" maxlength="120"></label>
    <label>Herní datum <input name="herni_datum" value="${besc(t.herni_datum || "")}" maxlength="40"></label>
    ${forumUcastniciHtml("Účastníci", t.ucastnici)}<p class="rsmall">Bez zaškrtnutí vidí téma každý.</p>
    ${forumUcastniciHtml("Čeká se na", t.ceka_na)}
    <p><button class="gbtn ghost">Uložit nastavení</button></p></form></div></details>`;
}
/* ----- obsluha ----- */
async function forumAkce(fn, ok) {
  try {
    await fn();
    if (ok) ok();
  } catch (e) {
    FORUM.chyba = String((e && e.message) || e).replace(/^.*?:\s*/, "");
    forumVykresli();
    mmHlasG(FORUM.chyba, 6000);
  }
}
const fZaskrtnute = (f, jm) => [...f.querySelectorAll(`input[name="${jm}"]:checked`)].map(x => x.value);
document.addEventListener("submit", e => {
  const f = e.target;
  if (!f.closest || !f.closest("#forumview")) return;
  const k = forumKarta();
  if (f.dataset.fonove !== undefined) {
    e.preventDefault();
    const d = new FormData(f);
    const btn = f.querySelector("button");
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
    }, null).finally(() => {
      btn.disabled = false;
    });
  } else if (f.dataset.foodp !== undefined) {
    e.preventDefault();
    const d = new FormData(f),
      btn = f.querySelector("button");
    btn.disabled = true;
    const o = {p_tema: +f.dataset.foodp, p_t: d.get("t"), p_ooc: !!d.get("ooc"), p_jako: d.get("jako") || null};
    if (GMV) o.p_ceka = fZaskrtnute(f, "ceka");
    forumAkce(async () => {
      await MMDB.forumPrispevek(o, k);
      f.querySelector("textarea").value = "";
      await forumNacti();
      const p = document.querySelector("#forumview .foprisp .fopris:last-child");
      if (p) p.scrollIntoView({block: "nearest"});
    }, null).finally(() => {
      btn.disabled = false;
    });
  } else if (f.dataset.fonastF !== undefined) {
    e.preventDefault();
    const d = new FormData(f);
    const [uc, ceka] = ["uc", "ceka"].map(n => fZaskrtnute(f, n));
    forumAkce(
      () => MMDB.forumTemaNastav(FORUM.tid, {nazev: d.get("nazev"), herni_datum: d.get("herni_datum"), ucastnici: uc, ceka_na: ceka}),
      forumNacti,
    );
  } else if (f.dataset.foupf !== undefined) {
    e.preventDefault();
    const t = new FormData(f).get("t");
    forumAkce(() => MMDB.forumUprav(+f.dataset.foupf, t, k), forumNacti);
  }
});
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("#forumview button");
  if (!b) return;
  const k = forumKarta();
  if (b.dataset.fostarsi !== undefined) {
    const T = FORUM.tema;
    if (!T || !T.prispevky.length) return;
    b.disabled = true;
    forumAkce(async () => {
      const s = await MMDB.forumTema(T.tema.id, T.prispevky[0].id, k);
      T.prispevky = s.prispevky.concat(T.prispevky);
      T.starsi = s.starsi;
      forumVykresli();
    }, null);
  } else if (b.dataset.foskryj !== undefined) {
    forumAkce(() => MMDB.forumSkryj(+b.dataset.foskryj, b.dataset.s === "1"), forumNacti);
  } else if (b.dataset.fonast !== undefined) {
    forumAkce(() => MMDB.forumTemaNastav(FORUM.tid, JSON.parse(b.dataset.fonast)), forumNacti);
  } else if (b.dataset.foupr !== undefined) {
    const a = b.closest(".fopris"),
      p = ((FORUM.tema || {}).prispevky || []).find(x => x.id === +b.dataset.foupr);
    if (!a || !p) return;
    a.querySelector(".fotxt").outerHTML =
      `<form class="foform" data-foupf="${p.id}"><textarea name="t" rows="6" maxlength="8000" required>${besc(p.t)}</textarea><p><button class="gbtn">Uložit</button> <button type="button" class="gbtn ghost" data-fozrus>Zrušit</button></p></form>`;
    a.querySelector("footer").hidden = true;
  } else if (b.dataset.fozrus !== undefined) {
    forumVykresli();
  }
});
