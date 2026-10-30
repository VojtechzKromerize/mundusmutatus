/* ===== Obchody, losovací tabulky a pověst – záložka Nástroje řídicího pultu (2026-10-30, Vojta) =====
   Obchody: data v nastavení „obchody“ (mm_obchody / mm_obchody_uloz), druhy a sortiment v čistém 10o-obchody.js, ceny z katalogu
   vybavení (VYB, 14d). Hráč vidí otevřené obchody v listu Peníze na kartě a nákup posílá návrhem (typ „nakup“, 23), vypravěč ho
   schválí – peníze se odečtou, věc přibude do vybavení a ručně vystavenému kusu ubude počet. Vypravěč může prodat i sám z pultu.
   Tabulky: nápady u Pokušení a Požehnání v herním záznamu (24) a v Nástrojích; data a výběr v čistém 10j-tabulky.js.
   Pověst: 07p (jádro); tady jen přehled a rychlé nastavení v Nástrojích. ===== */
let OBCH = null;
let OBCHOTV = ""; /* obchod rozbalený v Nástrojích */
const obchGr = hal => slzCena((+hal || 0) / 10);
async function obchNacti() {
  if (!window.MMDB || !MMDB.obchody) {
    OBCH = OBCH || [];
    return false;
  }
  try {
    const p = await MMDB.obchody();
    const L = (p && p.L) || [];
    const z = JSON.stringify(L) !== JSON.stringify(OBCH);
    OBCH = L;
    return z;
  } catch (e) {
    OBCH = OBCH || [];
    return false;
  }
}
async function obchUloz(L, hlas) {
  try {
    const p = await MMDB.obchodyUloz({L});
    OBCH = (p && p.L) || L;
    if (hlas) mmHlasG(hlas, 3000);
  } catch (e) {
    mmHlasG("Obchody se nepodařilo uložit: " + (e.message || e), 6000);
  }
  if (curView === "boj") renderBoj();
}
const obchById = id => (OBCH || []).find(o => o.id === id) || null;
/* ---- nákup: vypravěč (schválený návrh hráče nebo prodej z pultu) ---- */
async function obchProdej(K, oid, pid, q, cenaNavrh) {
  if (!K) throw new Error("postava neexistuje");
  await obchNacti();
  await vybNacti();
  const o = obchById(oid);
  if (!o) throw new Error("obchod už neexistuje");
  const r = obchZbozi(o, VYB, VYBBY).find(x => x.id === pid);
  q = Math.max(1, Math.min(999, Math.round(+q || 1)));
  if (!r) throw new Error("zboží už v obchodě není");
  if (!obchLzeProdat(r, q)) throw new Error(`na skladě je jen ${r.q} ks`);
  if (cenaNavrh && Math.round(+cenaNavrh) < r.hal) throw new Error(`cena se mezitím zvýšila na ${obchGr(r.hal)} za kus`);
  const cel = r.hal * q,
    pen = kPenKarta(K),
    P = kPenZapl(pen, "CP", cel);
  if (!P) throw new Error(`${K.n} nemá ${obchGr(cel)} (má ${kPenTxt(pen)})`);
  await kartaStavZmen(K.id, {pen: Object.keys(P).length ? P : null}, null, {bezZpet: true});
  if (r.x) await kVybPridej(K, vybPoolVstup(r.x), q);
  else await kVybPridej(K, {k: "pl", n: r.n, w: 0}, q);
  if (r.ruc && r.q != null) await obchUloz((OBCH || []).map(x => (x.id === oid ? obchProdano(x, pid, q) : x)));
  kHodZapis({k: K.id, kdo: K.n, co: "Nákup", txt: `${q}× ${r.n} za ${obchGr(cel)} – ${o.n} → ${kPenTxt(P)}`});
  return `${K.n} koupil ${q}× ${r.n} za ${obchGr(cel)}`;
}
/* ---- hráč: obchody v listu Peníze a okno obchodu ---- */
function obchHracHtml(K) {
  const L = (OBCH || []).filter(o => o.otevr);
  if (OBCH === null) obchNacti().then(z => z && kartyPrekresli());
  if (!L.length) return "";
  return `<details class="bdmbez obchk" open><summary>Obchody</summary><ul class="obchl">${L.map(
    o =>
      `<li><button type="button" class="gbtn ghost" data-obchotv="${besc(o.id)}" data-obchk="${besc(K.id)}"><b>${besc(o.n)}</b><small>${besc((OBCHTYP[o.typ] || {}).n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}</small></button></li>`,
  ).join("")}</ul><p class="rsmall">Nákup schvaluje vypravěč: peníze se odečtou a věc přibude, až ho potvrdí.</p></details>`;
}
async function obchOkno(oid, kid) {
  await vybNacti();
  const o = obchById(oid),
    K = KARTBY[kid];
  if (!o) return;
  const Z = obchZbozi(o, VYB, VYBBY),
    T = OBCHTYP[o.typ] || {},
    muzeKoupit = !!K && kMuze(K),
    pen = K ? kPenKarta(K) : {};
  const sk = {};
  Z.forEach(r => {
    const k = r.mag ? "magicke" : (r.x && r.x.sk) || "jine";
    (sk[k] = sk[k] || []).push(r);
  });
  const nad = k => (k === "magicke" ? "Vzácnosti" : VYBSKN[k] || "Ostatní");
  mmPop(`<h3>${besc(o.n)}</h3><p class="rsmall">${besc(T.n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}${o.prir ? ` · ceny ${o.prir > 0 ? "+" : ""}${o.prir} %` : ""}</p><p class="rsmall">${besc(T.p || "")}</p>
   ${K ? `<p class="rsmall">${besc(K.n)} má: ${kPenHtml(pen)}</p>` : ""}
   ${
     Z.length
       ? Object.keys(sk)
           .map(
             k =>
               `<h4 class="obchh">${besc(nad(k))}</h4><ul class="obchz">${sk[k]
                 .map(
                   r =>
                     `<li${r.mag ? ' class="obchmag"' : ""}><span class="obchn">${r.x ? `<button type="button" class="obchinfo" data-obchinf="${besc(r.id)}">${besc(r.n)}</button>` : besc(r.n)}${r.q != null ? ` <small>${r.q} ks</small>` : ""}</span><b>${besc(obchGr(r.hal))}</b>${
                       muzeKoupit
                         ? `<span class="obchkup"><input type="number" min="1" max="${r.q != null ? r.q : 99}" value="1" aria-label="Počet" data-obchq="${besc(r.id)}"><button type="button" class="gbtn" data-obchkup="${besc(o.id)}|${besc(r.id)}|${besc(K.id)}">${GMV ? "Prodat" : "Koupit"}</button></span>`
                         : ""
                     }</li>`,
                 )
                 .join("")}</ul>`,
           )
           .join("")
       : `<p class="rsmall">Krám je dnes prázdný.</p>`
   }`);
}
async function obchKup(oid, pid, kid, q) {
  const K = KARTBY[kid],
    o = obchById(oid);
  if (!K || !o) return;
  const r = obchZbozi(o, VYB, VYBBY).find(x => x.id === pid);
  if (!r) return;
  q = Math.max(1, Math.round(+q || 1));
  if (!obchLzeProdat(r, q)) {
    mmHlasG(`Na skladě je jen ${r.q} ks.`, 3000);
    return;
  }
  if (GMV) {
    try {
      mmHlasG((await obchProdej(K, oid, pid, q)) + ".", 5000);
    } catch (e) {
      mmHlasG("Prodej se nepovedl: " + (e.message || e), 6000);
    }
    mmPopX();
    kartyPrekresli();
    return;
  }
  if (!kPenZapl(kPenKarta(K), "CP", r.hal * q)) {
    mmHlasG(`Na ${obchGr(r.hal * q)} nemáš dost peněz.`, 4000);
    return;
  }
  const ok = await navrhPosli(K, {
    typ: "nakup",
    cil: K.id,
    obch: o.id,
    pol: r.id,
    q,
    cena: r.hal,
    popis: `Nákup: ${q}× ${r.n} za ${obchGr(r.hal * q)} (${o.n})`.slice(0, 160),
  });
  if (ok) mmPopX();
}
document.addEventListener("click", e => {
  const T = s => e.target.closest && e.target.closest(s);
  const a = T("[data-obchotv]");
  if (a) {
    obchOkno(a.dataset.obchotv, a.dataset.obchk);
    return;
  }
  const k = T("[data-obchkup]");
  if (k) {
    const [oid, pid, kid] = k.dataset.obchkup.split("|"),
      inp = document.querySelector(`[data-obchq="${CSS.escape(pid)}"]`);
    obchKup(oid, pid, kid, inp ? inp.value : 1);
    return;
  }
  const i = T("[data-obchinf]");
  if (i && VYBBY[i.dataset.obchinf]) {
    const x = VYBBY[i.dataset.obchinf];
    const box = i.closest("li");
    if (box && !box.querySelector(".vybk")) box.insertAdjacentHTML("beforeend", vybKarta(x, false));
    else if (box) box.querySelector(".vybk").remove();
    return;
  }
  const t = T("[data-tabnap]");
  if (t) {
    const [druh, sit] = t.dataset.tabnap.split(":");
    tabOkno(druh, sit);
  }
});

/* ---- losovací tabulky: okno s nápady (záznam boje) a výsledky v Nástrojích ---- */
function tabNapadyHtml(druh, sit) {
  const N = tabNapady(druh, sit, 3);
  return `<ol class="tabn">${N.map(t => `<li>${besc(t)}</li>`).join("")}</ol>${druh === "pok" ? `<p class="tabsep"><b>Šepot:</b> ${besc(tabLos(TABSEPOT, 1)[0])}</p>` : ""}`;
}
function tabOkno(druh, sit) {
  mmPop(`<h3>${druh === "pok" ? "Pokušení – komplikace, odmítne-li ho" : "Požehnání – co přidat"}</h3>
    <p class="rsmall">Situace: <select data-tabsit="${druh}" aria-label="Situace hodu">${Object.entries(TABSIT)
      .map(([k, n]) => `<option value="${k}"${k === sit ? " selected" : ""}>${n}</option>`)
      .join("")}</select> <button type="button" class="gbtn ghost" data-tabznovu="${druh}">Další nápady</button></p>
    <div id="tabpopv">${tabNapadyHtml(druh, sit)}</div>
    <p class="rsmall">Výsledek hodu platí; nápad jen něco přidá. Vyber, uprav nebo vymysli vlastní (Artikule › Závoj).</p>`);
}
document.addEventListener("change", e => {
  const s = e.target.closest && e.target.closest("[data-tabsit]");
  if (s) {
    const v = document.getElementById("tabpopv");
    if (v) v.innerHTML = tabNapadyHtml(s.dataset.tabsit, s.value);
  }
});
document.addEventListener("click", e => {
  const z = e.target.closest && e.target.closest("[data-tabznovu]");
  if (z) {
    const s = document.querySelector(`[data-tabsit="${z.dataset.tabznovu}"]`),
      v = document.getElementById("tabpopv");
    if (v) v.innerHTML = tabNapadyHtml(z.dataset.tabznovu, s ? s.value : "mysl");
    return;
  }
  const n = e.target.closest && e.target.closest("[data-tablos]");
  if (n && GMV) {
    const sit = (document.querySelector("[data-tabsitn]") || {}).value || "mysl",
      k = n.dataset.tablos,
      v = document.getElementById("tabvys");
    if (!v) return;
    v.innerHTML =
      k === "zvesti"
        ? `<ol class="tabn">${tabLos(TABZVESTI, 3)
            .map(t => `<li>${besc(t)}</li>`)
            .join("")}</ol>`
        : k === "sepot"
          ? `<ol class="tabn">${tabLos(TABSEPOT, 3)
              .map(t => `<li>${besc(t)}</li>`)
              .join("")}</ol>`
          : tabNapadyHtml(k, sit);
  }
});

/* ---- záložka Nástroje řídicího pultu ---- */
function obchSelectHtml(name, val) {
  return `<select name="${name}" aria-label="Druh obchodu">${Object.entries(OBCHTYP)
    .map(([k, t]) => `<option value="${k}"${k === val ? " selected" : ""}>${besc(t.n)}</option>`)
    .join("")}</select>`;
}
function obchDetailHtml(o) {
  const Z = obchZbozi(o, VYB, VYBBY),
    vyr = (o.ven || []).map(id => VYBBY[id]).filter(Boolean),
    T = OBCHTYP[o.typ] || {};
  return `<div class="obchdet">
    <form class="kvlh obchf" data-obchf="${besc(o.id)}"><label>Název <input name="n" value="${besc(o.n)}" maxlength="60" required></label><label>Druh ${obchSelectHtml("typ", o.typ)}</label><label>Místo <input name="misto" value="${besc(o.misto || "")}" maxlength="60" placeholder="např. Praha, Staré Město"></label><label>Přirážka <input name="prir" type="number" min="-50" max="500" value="${+o.prir || 0}" style="width:4.5em"> %</label><label class="obchpozn">Poznámka jen pro tebe <input name="pozn" value="${besc(o.pozn || "")}" maxlength="200"></label><button class="gbtn ghost">Uložit</button></form>
    <p class="rsmall">${besc(T.p || "")}</p>
    <form class="kvlh obchvf" data-obchvf="${besc(o.id)}"><label>Vystavit kus <input name="x" list="obchdl" placeholder="hledej v katalogu (i kouzelné předměty)" required style="min-width:16em"></label><label>Kusů <input name="q" type="number" min="1" max="999" placeholder="—" style="width:4em"></label><label>Cena za kus <input name="c" type="number" min="0" max="999999" step="0.5" placeholder="z katalogu" style="width:6em"> gr.</label><button class="gbtn ghost">Vystavit</button></form>
    <p class="rsmall">Kouzelné předměty jsou extrémně vzácné: nikdy se do obchodu nedostanou samy, vystavíš jen jednotlivý kus (bez počtu = 1) a cenu určíš sám.</p>
    <ul class="obchz obchgm">${Z.map(
      r =>
        `<li${r.mag ? ' class="obchmag"' : ""}><span class="obchn">${besc(r.n)}${r.ruc ? ` <small>${r.q != null ? `${r.q} ks` : "bez omezení"} · vystaveno</small>` : ""}</span><b>${besc(obchGr(r.hal))}</b><button type="button" class="gbtn ghost" data-obchven="${besc(o.id)}|${besc(r.id)}" ${btip(r.ruc ? "Odebrat z obchodu" : "Tohle tu neprodávají")}>×</button></li>`,
    ).join("")}</ul>
    ${vyr.length ? `<p class="rsmall">Vyřazeno: ${vyr.map(x => `<button type="button" class="gbtn ghost" data-obchzpet="${besc(o.id)}|${besc(x.id)}">${besc(x.cz || x.en)} ↺</button>`).join(" ")}</p>` : ""}
  </div>`;
}
function obchGmHtml() {
  if (OBCH === null) {
    OBCH = [];
    obchNacti().then(() => curView === "boj" && renderBoj());
  }
  if (!VYB) vybNacti().then(() => curView === "boj" && renderBoj());
  const dl = VYB
    ? `<datalist id="obchdl">${VYBSK.flatMap(([sk]) => (VYB[sk] || []).map(x => `<option value="${besc(x.en)}">${besc((x.cz || "") + (sk === "magicke" ? " · kouzelný" : ""))}</option>`)).join("")}</datalist>`
    : "";
  return `<section class="obchsec"><h3 class="uvh2">Obchody</h3>
    <form class="kvlh" data-obchnovy><label>Nový obchod ${obchSelectHtml("typ", "kramar")}</label><input name="n" placeholder="název (např. U Zlatého kohouta)" maxlength="60"><input name="misto" placeholder="místo" maxlength="60"><button class="gbtn">Založit</button></form>
    ${
      (OBCH || []).length
        ? `<ul class="obchl obchlgm">${OBCH.map(
            o =>
              `<li class="${o.id === OBCHOTV ? "on" : ""}"><div class="obchr"><button type="button" class="obchnz" data-obchrozb="${besc(o.id)}"><b>${besc(o.n)}</b><small>${besc((OBCHTYP[o.typ] || {}).n || "")}${o.misto ? ` · ${besc(o.misto)}` : ""}${o.prir ? ` · ${o.prir > 0 ? "+" : ""}${o.prir} %` : ""}</small></button>
              <label class="obchot" ${btip("Otevřený obchod vidí hráči v listu Peníze a mohou v něm nakupovat")}><input type="checkbox" data-obchotevr="${besc(o.id)}"${o.otevr ? " checked" : ""}> otevřeno</label>
              ${KARTY.length ? `<button type="button" class="gbtn ghost" data-obchprod="${besc(o.id)}" ${btip("Okno obchodu: prodáš rovnou zvolené postavě")}>Prodat…</button>` : ""}
              <button type="button" class="gbtn ghost" data-obchsmaz="${besc(o.id)}" aria-label="Smazat obchod">Smazat</button></div>
              ${o.id === OBCHOTV && VYB ? obchDetailHtml(o) : ""}</li>`,
          ).join("")}</ul>`
        : `<p class="rsmall">Zatím žádný obchod. Založ ho, uprav sortiment a otevři – hráči ho pak uvidí v listu Peníze na kartě.</p>`
    }${dl}</section>`;
}
function pultNastrojeHtml() {
  return `<section class="tabsec"><h3 class="uvh2">Losovací tabulky</h3>
      <p class="kvlh"><label>Situace <select data-tabsitn aria-label="Situace hodu">${Object.entries(TABSIT)
        .map(([k, n]) => `<option value="${k}">${n}</option>`)
        .join(
          "",
        )}</select></label><button type="button" class="gbtn ghost" data-tablos="pok">Pokušení – komplikace</button><button type="button" class="gbtn ghost" data-tablos="poz">Požehnání – účinek</button><button type="button" class="gbtn ghost" data-tablos="sepot">Šepot Pokušení</button><button type="button" class="gbtn ghost" data-tablos="zvesti">Zvěsti v krčmě</button></p>
      <div id="tabvys" class="tabvys"><p class="rsmall">Tři nápady jedním klepnutím. U každého Pokušení a Požehnání v herním záznamu je také tlačítko 💡. Jména a povahy postav losuje generátor v panelu Při hře.</p></div></section>
    ${obchGmHtml()}
    <section class="povsec"><h3 class="uvh2">Pověst družiny</h3>${povSeznamHtml(false)}
      <form class="kvlh" data-povf><label>Rod <select name="r" aria-label="Rod">${Object.values(byId)
        .filter(f => f && f.id && f.name)
        .sort((a, b) => String(a.name).localeCompare(b.name, "cs"))
        .map(f => `<option value="${besc(f.id)}">${besc(f.name)}</option>`)
        .join("")}</select></label><label>Pověst <select name="u" aria-label="Pověst">${[3, 2, 1, 0, -1, -2, -3]
        .map(u => `<option value="${u}"${u === 0 ? " selected" : ""}>${POVL[u]}</option>`)
        .join(
          "",
        )}</select></label><input name="pz" maxlength="200" placeholder="důvod (uvidí i hráči)"><button class="gbtn ghost">Nastavit</button></form>
      <p class="rsmall">Hráči vidí pověst na stránce rodu a v Družině; u rodů, které družina nezná, ji databáze nepošle.</p></section>`;
}
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !GMV) return;
  if (f.matches("[data-povf]")) {
    e.preventDefault();
    await povUloz(f.elements.r.value, +f.elements.u.value, f.elements.pz.value.trim());
    return;
  }
  if (f.matches("[data-obchnovy]")) {
    e.preventDefault();
    const o = obchNovy(f.elements.typ.value, f.elements.n.value.trim(), f.elements.misto.value.trim());
    OBCHOTV = o.id;
    await obchUloz([...(OBCH || []), o], `Obchod založen: ${o.n} (zatím zavřený).`);
    return;
  }
  if (f.matches("[data-obchf]")) {
    e.preventDefault();
    const E = f.elements,
      id = f.dataset.obchf;
    await obchUloz(
      (OBCH || []).map(o =>
        o.id === id
          ? Object.assign({}, o, {
              n: E.n.value.trim().slice(0, 60) || o.n,
              typ: OBCHTYP[E.typ.value] ? E.typ.value : o.typ,
              misto: E.misto.value.trim().slice(0, 60),
              prir: Math.max(-50, Math.min(500, Math.round(+E.prir.value || 0))),
              pozn: E.pozn.value.trim().slice(0, 200),
            })
          : o,
      ),
      "Obchod uložen.",
    );
    return;
  }
  if (f.matches("[data-obchvf]")) {
    e.preventDefault();
    await vybNacti();
    const id = f.dataset.obchvf,
      t = f.elements.x.value.trim(),
      x = vybNajdi(t) || Object.values(VYBBY).find(v => vybKl(v.en) === vybKl(t) || vybKl(v.cz || "") === vybKl(t));
    if (!x) {
      mmHlasG(`„${t}“ v katalogu není.`, 3500);
      return;
    }
    const gr = +f.elements.c.value,
      q = f.elements.q.value;
    await obchUloz(
      (OBCH || []).map(o => (o.id === id ? obchVystav(o, Object.assign({sk: x.sk}, x), q, gr > 0 ? gr * 10 : 0) : o)),
      `Vystaveno: ${x.cz || x.en}${obchMag(x) ? " (unikát)" : ""}.`,
    );
  }
});
document.addEventListener("click", async e => {
  if (!GMV) return;
  const T = s => e.target.closest && e.target.closest(s);
  const r = T("[data-obchrozb]");
  if (r) {
    OBCHOTV = OBCHOTV === r.dataset.obchrozb ? "" : r.dataset.obchrozb;
    if (!VYB) await vybNacti();
    renderBoj();
    return;
  }
  const s = T("[data-obchsmaz]");
  if (s) {
    const o = obchById(s.dataset.obchsmaz);
    if (o && confirm(`Smazat obchod ${o.n}?`))
      await obchUloz(
        (OBCH || []).filter(x => x.id !== o.id),
        "Obchod smazán.",
      );
    return;
  }
  const v = T("[data-obchven]");
  if (v) {
    const [oid, pid] = v.dataset.obchven.split("|");
    await obchUloz(
      (OBCH || []).map(o =>
        o.id !== oid
          ? o
          : (o.pol || []).some(p => p.id === pid)
            ? Object.assign({}, o, {pol: o.pol.filter(p => p.id !== pid)})
            : Object.assign({}, o, {ven: [...new Set([...(o.ven || []), pid])]}),
      ),
    );
    return;
  }
  const z = T("[data-obchzpet]");
  if (z) {
    const [oid, pid] = z.dataset.obchzpet.split("|");
    await obchUloz((OBCH || []).map(o => (o.id === oid ? Object.assign({}, o, {ven: (o.ven || []).filter(x => x !== pid)}) : o)));
    return;
  }
  const p = T("[data-obchprod]");
  if (p) {
    const kid = prompt(`Komu prodáváš? (${KARTY.map(k => k.n).join(", ")})`, (KARTY[0] || {}).n || "");
    const K = kid && KARTY.find(k => k.n.toLowerCase() === kid.trim().toLowerCase());
    if (kid && !K) mmHlasG("Taková postava není.", 3000);
    if (K) obchOkno(p.dataset.obchprod, K.id);
  }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!GMV || !t.matches || !t.matches("[data-obchotevr]")) return;
  const id = t.dataset.obchotevr;
  await obchUloz(
    (OBCH || []).map(o => (o.id === id ? Object.assign({}, o, {otevr: t.checked}) : o)),
    t.checked ? "Obchod je otevřený – hráči ho vidí v listu Peníze." : "Obchod zavřen.",
  );
});
