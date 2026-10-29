/* ======== Družina · Kronika tažení · automatické odkazy · hledání ======== */

/* --- DRUŽINA ---
   Vzor záznamu postavy (zkopíruj, vyplň a vlož do pole PARTY):
   {id:"jan", n:"Jan z Kroměříže", epi:"zchudlý panoš", cls:"Fighter · 1. úroveň",
    faith:"kal",            // kal = kališník, kat = katolík, old = starověrec
    origin:"Praha",          // název místa z mapy
    img:"art/druzina/jan.webp",   // portrét (nepovinné)
    ctn:["Odvaha","Štědrost"], ner:["Hněv","Pýcha"],
    sv:5,                    // Svědomí 0–10 (nepovinné)
    ties:[["ste","slouží u Zdeňka ze Šternberka"]],   // [id rodu, popis]
    x:"<p>Krátký příběh postavy.</p>"}
*/
var PARTY = /*@PARTY@*/ [];
var KARTY = /*@KARTY@*/ [];
const PARTY_SLOTS = 5;
const PFAITH = {kal: "kališník", kat: "katolík", old: "starověrec"};
const pFaith = c =>
  c === "old"
    ? `<span class="faith f-old"><img src="art/strom.webp" alt="" aria-hidden="true">starověrec</span>`
    : FICON[c]
      ? `<span class="faith f-${c}"><img src="${FICON[c]}" alt="" aria-hidden="true">${PFAITH[c]}</span>`
      : "";
const SVST = v => (v <= 0 ? "Zatracený" : v <= 3 ? "Na scestí" : v <= 7 ? "Na vážkách" : "V milosti");
const svMeter = v =>
  `<div class="svm" role="img" aria-label="Svědomí ${v} z 10, ${SVST(v)}">${Array.from({length: 11}, (_, i) => `<span class="${i <= 0 ? "z0" : i <= 3 ? "z1" : i <= 7 ? "z2" : "z3"}${i === v ? " on" : ""}"></span>`).join("")}</div><small class="svl">Svědomí ${v} · ${SVST(v)}</small>`;
const pPort = (p, cls) =>
  p.img
    ? `<img class="pport${cls ? " " + cls : ""}" src="${p.img}" alt="" loading="lazy">`
    : `<span class="pport${cls ? " " + cls : ""} ini" aria-hidden="true">${p.n.trim()[0]}</span>`;
function placeLink(name) {
  for (const f of FAM) {
    if (f.nomap) continue;
    const sd = f.seats.find(x => x[0] === name);
    if (sd) return `<button type="button" class="maplink" data-id="${f.id}" data-place="${name}">${name}</button>`;
  }
  return name;
}
function renderDruzina(b) {
  const L = document.getElementById("druzinalist"),
    D = document.getElementById("druzinadet"),
    p = PARTY.find(x => x.id === b);
  L.hidden = !!p;
  D.hidden = !p;
  if (!p) {
    const slots = Math.max(0, PARTY_SLOTS - PARTY.length);
    L.innerHTML = `<p class="intro">Družina, která 3. března léta Páně 1458 vyráží z Prahy. Postavy se teprve chystají na cestu – jakmile budou hotové, objeví se tu jejich portréty, vyznání, Ctnosti a Neřesti, stav Svědomí, původ a vazby na rody Koruny.</p>
     <div class="party">${PARTY.map(p => `<a class="pchar" href="#druzina/${p.id}">${pPort(p)}<b>${p.n}</b><span>${p.epi || ""}</span><small>${p.cls || ""}</small>${pFaith(p.faith)}${pozBadge(p)}${p.sv != null ? `<span class="psv psv${p.sv <= 0 ? 0 : p.sv <= 3 ? 1 : p.sv <= 7 ? 2 : 3}">${SVST(p.sv)} · ${p.sv}</span>` : ""}${(p.ctn || []).length || (p.ner || []).length ? `<span class="pcn">${(p.ctn || []).map(c => `<i class="ctn">${c}</i>`).join("")}${(p.ner || []).map(c => `<i class="ner">${c}</i>`).join("")}</span>` : ""}${p.hrac ? `<small class="phr">hraje ${p.hrac}</small>` : ""}</a>`).join("")}${Array.from(
       {length: slots},
       () =>
         `<div class="pchar pslot"><span class="pport ini" aria-hidden="true">?</span><b>Volné místo</b><span>Postava se teprve chystá na cestu.</span></div>`,
     ).join("")}</div>`;
    return;
  }
  D.innerHTML = `<nav class="crumbs"><a href="#druzina">Družina</a> › <b>${p.n}</b></nav>
   <div class="artgrid"><div class="artmain">
     <h2 class="arttitle">${p.n}</h2>
     <p class="artlead">${[p.epi, p.cls].filter(Boolean).join(" · ")}</p>${pozBadge(p)}
     ${p.cil ? `<p class="pcil"><span class="lbl">Co ho žene</span>${p.cil}</p>` : ""}
     ${p.x ? `<div class="kron">${p.x}</div>` : ""}
     ${(p.ctn || []).length || (p.ner || []).length ? `<h3>Ctnosti a Neřesti <a class="pmore" href="#artikule/ctnosti">pravidla →</a></h3><p class="chips">${(p.ctn || []).map(c => `<span class="chip ctn">${c}</span>`).join("")}${(p.ner || []).map(c => `<span class="chip ner">${c}</span>`).join("")}</p>` : ""}
     ${(p.ties || []).length ? `<h3>Vazby</h3><ul class="ptie">${p.ties.map(([r, t]) => `<li>${byId[r] ? `<a href="#rod/${r}">${byId[r].name}</a> – ` : ""}${t}</li>`).join("")}</ul>` : ""}
   </div>
   <aside class="infobox">
     ${p.img ? `<div class="ibshield">${pPort(p, "big")}</div>` : ""}
     <dl class="kv">${p.faith ? `<dt>Vyznání</dt><dd>${pFaith(p.faith)}</dd>` : ""}
     ${p.origin ? `<dt>Původ</dt><dd>${placeLink(p.origin)}</dd>` : ""}
     ${p.cls ? `<dt>Povolání</dt><dd>${p.cls}</dd>` : ""}
     ${p.vek ? `<dt>Věk</dt><dd>${p.vek} let</dd>` : ""}
     ${p.hrac ? `<dt>Hraje</dt><dd>${p.hrac}</dd>` : ""}</dl>
     ${p.sv != null ? `${svMeter(p.sv)}<a class="pmore" href="#artikule/svedomi">Co znamená stav Svědomí →</a>` : ""}
     ${p.faith ? `<a class="pmore" href="#artikule/vyznani">Feat víry a vyznání →</a>` : ""}
   </aside></div>`;
  autolink(D.querySelector(".artmain"), "#druzina/" + p.id);
}

/* --- KRONIKA TAŽENÍ ---
   Každé sezení = jeden zápis. route = místa, kudy družina prošla (v pořadí), place = kde zápis končí.
   Poslední zápis určuje, kde na mapě stojí praporec družiny. */
var ZAPISY = /*@ZAPISY@*/ [];
/* Objevená místa (zobrazí se na mapě ve vrstvě Družina):
   {name:"Zbořená kaple u Berouna", lo:14.07, la:49.96, note:"…", z:"prolog"} */
var DISC = /*@MISTA@*/ [];
var ZBY = Object.fromEntries(ZAPISY.map(z => [z.id, z]));
/* Traktáty (zdroj/obsah/traktaty): články o světě. Hráč dostane jen odhalené; „slyšeli“ = jen název (sl), „potkali“ = i text h */
const TRAKTATY = /*@TRAKTATY@*/ [];
const TRBY = Object.fromEntries(TRAKTATY.map(t => [t.id, t]));
/* Herní stav nastavený vypravěčem (datum, hodina, kde je družina); bez něj platí poslední zápis Kroniky */
var HRA = __D.HRA || null;
/* „Družina zatím nikde“ (2026-10-28, Vojta): vypravěč smazal místo i cesty – mapy ji neukážou, dokud nedostane nové místo nebo cestu */
const druzinaNikde = () => !!(HRA && HRA.nikde && !HRA.misto && !(HRA.cesta && HRA.cesta.track));
function partyPlace() {
  if (druzinaNikde()) return null;
  return HRA && HRA.misto ? HRA.misto : ZAPISY.length ? ZAPISY[ZAPISY.length - 1].place : null;
}
function partyDate() {
  if (HRA && /^\d{4}-\d{2}-\d{2}$/.test(HRA.datum || "")) {
    const [y, m, d] = HRA.datum.split("-").map(Number);
    return `${d}. ${MES[m - 1]} ${y}`;
  }
  return ZAPISY.length ? ZAPISY[ZAPISY.length - 1].date : "";
}
/* úkoly družiny (herní stav; vypravěč je upravuje – obsluha v 16): na Kronice, od 2026-10-22 i pro hráče */
function hraUkolyHtml() {
  const uk = (HRA && HRA.ukoly) || [];
  return `<section><h3 class="uvh2">Úkoly družiny</h3>${uk.length ? `<ul class="hrauk">${uk.map((u, i) => `<li class="${u.hot ? "hot" : ""}">${GMV ? `<label><input type="checkbox" data-hruk="${i}"${u.hot ? " checked" : ""}> ${besc(u.t)}</label> <button type="button" class="kx" data-hrukx="${i}" aria-label="Smazat úkol">×</button>` : `${u.hot ? "✓" : "☐"} ${besc(u.t)}`}</li>`).join("")}</ul>` : `<p class="rsmall">Zatím žádné.</p>`}
    ${GMV ? `<form class="kvlh" data-hrukf><input name="t" maxlength="160" placeholder="nový úkol, např. Doručit dopis do Kutné Hory" required><button class="gbtn ghost">Přidat</button></form>` : ""}</section>`;
}
const kronikaPrekresli = () => {
  if (!location.hash.split("/")[1]) renderKronika("");
};
/* Traktáty: seznam (#kronika/clanky) a článek (#kronika/clanky/<id>). První odstavec celý kurzívou = podtitul pod nadpisem. */
function trRozdel(h) {
  const m = String(h || "").match(/^<p><i>([\s\S]*?)<\/i><\/p>\n?/);
  return m ? {pod: m[1], h: h.slice(m[0].length)} : {pod: "", h: h || ""};
}
/* postranní obsah traktátů jako u Artikulí (Vojta 2026-10-29): všechny traktáty, u otevřeného jeho oddíly */
function trSide(t, hs) {
  return `<button type="button" class="atoggle" aria-expanded="false">☰ Obsah traktátů</button><nav class="atoc" aria-label="Traktáty"><a class="atop${t ? "" : " on"}" href="#kronika/clanky">Všechny traktáty</a><p class="abook">Traktáty</p><ol>${TRAKTATY.map(
    x =>
      `<li><a href="#kronika/clanky/${x.id}"${t === x ? ' class="on" aria-current="page"' : ""}>${x.t}</a>${
        t === x && hs.length > 1
          ? `<ol class="asecs">${hs.map((h, j) => `<li><a href="#kronika/clanky/${x.id}" data-trsek="${j}">${h}</a></li>`).join("")}</ol>`
          : ""
      }</li>`,
  ).join("")}</ol></nav>`;
}
function renderTraktaty(c) {
  const box = document.getElementById("kclanky"),
    t = TRBY[c];
  if (!t) {
    box.innerHTML = `<div class="alay"><aside class="aside" id="kclside">${trSide(null, [])}</aside><article class="amain"><p class="intro">Traktáty o světě po protržení Závoje: o zemích, řádech, pověstech a tajemstvích, jak je sepsal kronikář Vojtěch z Kroměříže.</p>
      ${
        TRAKTATY.length
          ? `<ol class="trlist">${TRAKTATY.map(x => {
              const r = trRozdel(x.h),
                n = (r.h.match(/<h3>/g) || []).length;
              return `<li><a class="trcard" href="#kronika/clanky/${x.id}"><small>${x.sl ? "Družina o něm zatím jen slyšela" : n ? `Traktát · ${n} ${n === 1 ? "oddíl" : n < 5 ? "oddíly" : "oddílů"}` : "Traktát"}</small><b>${x.t}</b>${
                x.sl
                  ? ""
                  : `<span>${strip(r.pod || r.h)
                      .replace(/\s+/g, " ")
                      .trim()
                      .slice(0, 160)}…</span>`
              }</a></li>`;
            }).join("")}</ol>`
          : `<div class="placeholder"><p>Traktáty budou doplněny.</p></div>`
      }</article></div>`;
    return;
  }
  const i = TRAKTATY.indexOf(t),
    pv = TRAKTATY[i - 1],
    nx = TRAKTATY[i + 1],
    r = trRozdel(t.h),
    hs = t.sl ? [] : [...r.h.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].map(m => m[1]);
  box.innerHTML = `<div class="alay"><aside class="aside" id="kclside">${trSide(t, hs)}</aside><article class="amain"><nav class="crumbs"><a href="#kronika/clanky">Traktáty</a> › <b>${t.t}</b></nav>
    <h2 class="arttitle">${t.t}</h2>
    ${r.pod ? `<p class="drlatin">${r.pod}</p>` : ""}
    ${t.sl ? `<p class="intro">O tomto traktátu družina zatím jen slyšela; jeho text nezná.</p>` : `<div class="drtext trtext">${r.h}</div>`}
    <nav class="apn">${pv ? `<a href="#kronika/clanky/${pv.id}" rel="prev"><small>Předchozí</small>${pv.t}</a>` : "<span></span>"}${nx ? `<a href="#kronika/clanky/${nx.id}" rel="next"><small>Další</small>${nx.t}</a>` : "<span></span>"}</nav></article></div>`;
  const tx = box.querySelector(".trtext");
  if (tx) autolink(tx, "");
}
/* rozbalení postranního obsahu na telefonu (Pravidla, Traktáty – kreslí se znovu, proto přes delegaci) */
document.addEventListener("click", e => {
  const tg = e.target.closest && e.target.closest("#srdside .atoggle, #kclside .atoggle");
  if (!tg) return;
  const side = tg.closest(".aside"),
    o = side.classList.toggle("open");
  tg.setAttribute("aria-expanded", o);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-trsek]");
  if (!b) return;
  e.preventDefault();
  const h = document.querySelectorAll("#kclanky .trtext>h3")[+b.dataset.trsek];
  if (h) h.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "start"});
});
function renderKronika(b, c) {
  const sub = b === "clanky" ? "clanky" : b === "letopis" ? "letopis" : "zapisy";
  ["kzapisy", "kclanky", "letopis"].forEach(k => {
    document.getElementById(k).hidden = k !== (sub === "zapisy" ? "kzapisy" : sub === "clanky" ? "kclanky" : "letopis");
  });
  document.querySelectorAll("[data-ksub]").forEach(n => n.classList.toggle("on", n.dataset.ksub === sub));
  if (sub === "clanky") renderTraktaty(c);
  if (sub !== "zapisy") return;
  const box = document.getElementById("kzapisy"),
    z = ZBY[b];
  if (!z) {
    box.innerHTML = `<p class="intro">Zápisy z cest družiny, sezení po sezení. Praporec na mapě (vrstva <b>Družina</b>) ukazuje, kde družina právě je, a tečkovaná čára se šipkami, kudy prošla; starší cesty slábnou a pod mapou si zvolíte, zda vidět jen poslední cestu, stopu od jejího počátku, nebo celé tažení.</p>
     <ol class="zlist">${ZAPISY.map(z => `<li><a class="zcard" href="#kronika/${z.id}"><small>${z.n} · ${z.date} · ${z.place}</small><b>${z.title}</b><span>${strip(z.text).replace(/\s+/g, " ").slice(0, 150)}…</span></a></li>`).join("")}</ol>
     <p class="rsmall">Další zápisy přibudou po každém sezení.</p>${(HRA && (HRA.ukoly || []).length) || GMV ? hraUkolyHtml() : ""}`;
    return;
  }
  const i = ZAPISY.indexOf(z),
    pv = ZAPISY[i - 1],
    nx = ZAPISY[i + 1];
  box.innerHTML = `<nav class="crumbs"><a href="#kronika">Zápisy tažení</a> › <b>${z.n}</b></nav>
   <h2 class="arttitle">${z.title}</h2>
   <p class="zmeta"><span>${z.n}</span><span>${z.date}</span><span>${placeLink(z.place)}</span></p>
   ${(z.praha || []).some(n => PRB[n]) ? `<p class="zpraha"><b>Na plánu Prahy:</b> ${prLinks(z.praha.map(n => PRB[n]).filter(Boolean))}</p>` : ""}
   <div class="ztext">${z.text}</div>
   ${zPodpis(z)}
   <button type="button" class="gbtn" data-partymap="${z.id}">Ukázat cestu na mapě</button>${z.place === "Praha" || (z.praha || []).length ? ` <a class="gbtn ghost" href="#praha${(z.praha || []).length ? "/" + z.praha[0] : ""}">Plán Prahy</a>` : ""}
   ${stopaOd() && stopaOd().z === z.id ? `<p class="rsmall">Odtud začíná stopa družiny na mapě.</p>` : ""}${GMV ? `<p class="stopagm"><button type="button" class="gbtn ghost" data-stopaod="${z.id}" title="Na mapě se stopa začne kreslit od místa, kde tento zápis končí; starší zápisy v Kronice zůstanou">Začít stopu na mapě tímto zápisem</button></p>` : ""}
   <nav class="apn">${pv ? `<a href="#kronika/${pv.id}" rel="prev"><small>Předchozí</small>${pv.title}</a>` : "<span></span>"}${nx ? `<a href="#kronika/${nx.id}" rel="next"><small>Další</small>${nx.title}</a>` : "<span></span>"}</nav>`;
  autolink(box.querySelector(".ztext"), "");
}
/* ===== Stopa družiny na mapě (2026-10-28, Vojta): úseky po cestách se šipkami, starší slábnou, zastávky s datem, „Družina je tady“;
   počátek stopy (HRA.stopaOd) nastavuje vypravěč, kolik stopy ukázat si volí každý divák (výpočet v 07s-stopa.js) ===== */
let STOPAP = null;
function stopaPohled() {
  if (STOPAP) return STOPAP;
  let v = null;
  try {
    v = localStorage.getItem("mm-stopa-pohled");
  } catch (e) {}
  STOPAP = STOPA_POHLEDY.some(p => p[0] === v) ? v : "pocatek";
  return STOPAP;
}
const stopaOd = () => (HRA && HRA.stopaOd) || null;
const stopaTed = (lim, zna) => stopaRozsah(ZAPISY, {od: stopaOd(), pohled: stopaPohled(), lim, zna: zna || (n => !!placeBy(n))});
const datumDlouhe = d => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
  return m ? `${+m[3]}. ${MES[+m[2] - 1]} ${m[1]}` : "";
};
/* úsek mezi dvěma místy po síti cest (computeRoute v 02); bez cesty po souši (ostrov) nebo neznámé místo → rovná čára */
const STOPAG = new Map();
function stopaGeo(a, b) {
  const k = a + "|" + b;
  if (STOPAG.has(k)) return STOPAG.get(k);
  const A = placeBy(a),
    B = placeBy(b);
  let g = null;
  if (A && B) {
    let r = null;
    try {
      r = computeRoute(A, B);
    } catch (e) {}
    g =
      r && r.coords.length > 1
        ? r.coords.map(q => [q[0], q[1]])
        : [
            [A.lo, A.la],
            [B.lo, B.la],
          ];
  }
  STOPAG.set(k, g);
  return g;
}
/* popis počátku pro panel a ovládání: „od 5. března 1458 (Sezení 3)“ */
function stopaPopis() {
  const od = stopaOd(),
    p = stopaPohled();
  if (p === "cele") return "Ukazuje se celé tažení.";
  if (p === "posledni") return "Ukazuje se jen poslední cesta.";
  if (!od) return "Stopa ukazuje celé tažení – vypravěč zatím nezačal novou.";
  const z = od.z && ZBY[od.z],
    d = datumDlouhe(od.datum) || (z && z.date) || "";
  return `Stopa začíná ${d ? d + " " : ""}${z ? `v místě ${z.place} (${z.n || z.title})` : ""}.`.replace(/ \./, ".");
}
/* tlačítka vypravěče: začít stopu zápisem, smazat stopu (počátek = teď), vrátit celou */
function stopaGmHtml(zid) {
  if (!GMV) return "";
  const od = stopaOd();
  return `<p class="stopagm">${zid ? `<button type="button" class="gbtn ghost" data-stopaod="${zid}" title="Na mapě se stopa začne kreslit od místa, kde tento zápis končí; starší zápisy v Kronice zůstanou">Začít stopu tímto zápisem</button>` : ""}<button type="button" class="gbtn ghost" data-stopasmaz title="Stopa začne od dnešního místa družiny; zápisy Kroniky ani cesty se nemažou">Smazat stopu</button>${od ? `<button type="button" class="gbtn ghost" data-stopacela title="Zrušit počátek – stopa zase od začátku tažení">Vrátit celou stopu</button>` : ""}<button type="button" class="gbtn ghost" data-vynuluj title="Smazat cesty z Výpravy a zrušit probíhající cestu; místo družiny zůstane">Vynulovat cesty</button><button type="button" class="gbtn ghost" data-vynikde title="Smazat místo, cesty i polohu v Praze – družina zatím na mapách nebude">Družina zatím nikde</button></p>`;
}
/* volba diváka (pamatuje si ji prohlížeč) a stav stopy u posuvníku „Kde jsme byli kdy“ (plní 09) */
function stopaUiHtml() {
  const p = stopaPohled();
  return `<div class="controls stopapohl" role="group" aria-label="Kolik stopy družiny ukázat">${STOPA_POHLEDY.map(
    ([k, t]) => `<button type="button" data-stopapohl="${k}" aria-pressed="${k === p}">${t}</button>`,
  ).join("")}</div><p class="stopapop">${besc(stopaPopis())}</p>${stopaGmHtml(st.cas != null && ZAPISY[st.cas] ? ZAPISY[st.cas].id : "")}`;
}
/* panel na mapě: zastávka (zápisy, které tu končí) nebo „Družina je tady“ */
function stopaHtml(o) {
  const zl = i => {
    const z = ZAPISY[i];
    return z
      ? `<li><a href="#kronika/${z.id}"><b>${besc(z.title)}</b></a><small>${besc([z.n || "Zápis " + (i + 1), z.date, z.hodina != null ? z.hodina + ":00" : ""].filter(Boolean).join(" · "))}</small>${GMV ? `<button type="button" class="gbtn ghost" data-stopaod="${z.id}">Začít stopu tímto zápisem</button>` : ""}</li>`
      : "";
  };
  if (o.tady) {
    const pp = partyPos(),
      L = ZAPISY[ZAPISY.length - 1];
    return `<span class="lbl">Družina je tady</span><h3 style="font-size:1.35rem">${besc((pp && pp.name) || partyPlace() || "")}</h3><p>${besc(partyDate())}${HRA && HRA.hodina != null ? `, ${HRA.hodina}:00` : ""}</p>${L ? `<p class="rsmall">Poslední zápis Kroniky:</p><ul class="stopazl">${zl(ZAPISY.length - 1)}</ul>` : ""}<p class="rsmall">${besc(stopaPopis())}</p>${stopaGmHtml("")}`;
  }
  return `<span class="lbl">Zastávka družiny</span><h3 style="font-size:1.35rem">${besc(o.n)}</h3><ul class="stopazl">${(o.z || [])
    .slice()
    .reverse()
    .map(zl)
    .join("")}</ul><p class="rsmall">${besc(stopaPopis())}</p>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-stopapohl],[data-stopaod],[data-stopasmaz],[data-stopacela]");
  if (!b) return;
  if (b.dataset.stopapohl) {
    STOPAP = b.dataset.stopapohl;
    try {
      localStorage.setItem("mm-stopa-pohled", STOPAP);
    } catch (e) {}
    stopaObnov();
    return;
  }
  if (!GMV) return;
  let od = null;
  if (b.dataset.stopaod) {
    const z = ZBY[b.dataset.stopaod];
    if (!z) return;
    od = {z: z.id, datum: z.datum || "", hodina: z.hodina == null ? null : z.hodina};
  } else if (b.hasAttribute("data-stopasmaz")) {
    const L = ZAPISY[ZAPISY.length - 1];
    od = {
      z: L ? L.id : "",
      datum: (HRA && HRA.datum) || (L && L.datum) || "",
      hodina: HRA && HRA.hodina != null ? HRA.hodina : L && L.hodina != null ? L.hodina : null,
    };
  }
  Promise.resolve(hraUloz({stopaOd: od})).then(() => {
    if (curView === "kronika") renderKronika(decodeURIComponent(location.hash.split("/")[1] || ""));
    stopaObnov();
    mmHlasG(od ? "Stopa na mapě začíná znovu – starší zápisy zůstaly v Kronice." : "Na mapě je zase celá stopa tažení.", 4000);
  });
});
/* překreslení po změně volby nebo počátku (mapa Koruny, mapa světa, panel a ovládání) */
function stopaObnov() {
  if (curView === "mapa") {
    drawMap();
    if (st.misto && st.misto.k === "st") renderDetail();
  }
  if (SG) {
    if (curView === "svet" && typeof sDraw === "function") sDraw();
    else window._sDirty = 1;
  }
  const u = document.getElementById("mapstopa");
  if (u) u.innerHTML = stopaUiHtml();
}
function drawParty(svg, s, k) {
  if (!st.party || (!ZAPISY.length && !HRA)) return;
  const lim = st.cas != null && ZAPISY[st.cas] ? st.cas : null;
  if (lim == null && druzinaNikde()) return;
  const LZ = lim != null ? ZAPISY[lim] : null,
    tz = LZ ? cT({datum: LZ.datum, hodina: LZ.hodina ?? 23}) : null;
  const R = stopaTed(lim),
    tOd = R.odT ? cT(R.odT) : null,
    put = stopaPutovani((HRA && HRA.putovani) || [], tOd, tz),
    zast = R.zast.slice();
  /* dnešní místo družiny, když se pohnula bez zápisu (a cestu nekreslí deník putování) */
  if (lim == null) {
    const q = placeBy(partyPlace() || ""),
      pz = put[put.length - 1];
    if (q && (!zast.length || zast[zast.length - 1].n !== q.name) && !(pz && pz.do === q.name)) zast.push({n: q.name, i: R.i1 + 1, z: []});
  }
  const XY = q => P(q[0], q[1]),
    G = el("g", {class: "stopa", "pointer-events": "none"});
  svg.appendChild(G);
  /* úsek: podklad v barvě papíru, tečkovaná čára v barvě kalicha, šipka směru v polovině */
  const usek = (body, op, nej, plna, title) => {
    if (!body || body.length < 2) return;
    const xy = body.map(XY),
      rp = xy.map(q => q.map(v => v.toFixed(1)).join(",")).join(" "),
      w = (nej ? 2.8 : 2.1) * s;
    G.appendChild(
      el("polyline", {
        points: rp,
        fill: "none",
        stroke: "var(--paper)",
        "stroke-width": (w + 2.4 * s).toFixed(2),
        opacity: (0.75 * op).toFixed(2),
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      }),
    );
    const pl = el("polyline", {
      points: rp,
      fill: "none",
      stroke: "var(--kal)",
      "stroke-width": w.toFixed(2),
      opacity: op,
      "stroke-dasharray": plna ? "none" : nej ? `${3.2 * s} ${2.6 * s}` : `${0.5 * s} ${4 * s}`,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    if (title) pl.appendChild(el("title", {}, title));
    G.appendChild(pl);
    const a = stopaSipka(xy, 16 * s);
    if (a) {
      const m = s * (nej ? 1.5 : 1.2);
      G.appendChild(
        el("path", {
          d: `M${-3.2 * m},${-3.4 * m}L${2.6 * m},0L${-3.2 * m},${3.4 * m}`,
          transform: `translate(${a.x.toFixed(1)},${a.y.toFixed(1)}) rotate(${a.a.toFixed(0)})`,
          fill: "none",
          stroke: "var(--kal)",
          "stroke-width": (1.7 * s).toFixed(2),
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          opacity: op,
          class: "stopasip",
        }),
      );
    }
  };
  const useky = stopaUseky(zast, R.i1);
  useky.forEach(u => usek(stopaGeo(u.a, u.b), stopaSila(u.vek), u.vek === 0, false));
  /* průchozí místa (trasa zápisu bez vlastního zápisu): malé kroužky */
  zast.forEach((q, j) => {
    if (q.z.length || j === zast.length - 1) return;
    const p = placeBy(q.n);
    if (!p) return;
    const [x, y] = P(p.lo, p.la);
    G.appendChild(
      el("circle", {
        cx: x,
        cy: y,
        r: (2.1 * s).toFixed(2),
        fill: "var(--paper)",
        stroke: "var(--kal)",
        "stroke-width": (1.2 * s).toFixed(2),
        opacity: stopaSila(Math.max(0, R.i1 - q.i)),
      }),
    );
  });
  DISC.forEach(d => {
    const [x, y] = P(d.lo, d.la),
      m = s * 1.2,
      g = el("g", {class: "discmk"});
    g.appendChild(el("title", {}, d.name + (d.note ? " – " + d.note : "")));
    g.appendChild(
      el("path", {
        d: `M${x},${y - 6 * m}L${x + 5 * m},${y}L${x},${y + 6 * m}L${x - 5 * m},${y}Z`,
        fill: "var(--gold)",
        stroke: "var(--ink)",
        "stroke-width": (1 * s).toFixed(2),
      }),
    );
    g.appendChild(
      el("text", {x: x + 8 * m, y: y + 4 * m, class: "seatlbl", "font-size": (10.5 * k).toFixed(1), "stroke-width": (3 * s).toFixed(2)}, d.name),
    );
    if (d.z)
      g.addEventListener("click", e => {
        e.stopPropagation();
        navTo("#kronika/" + d.z);
      });
    svg.appendChild(g);
  });
  /* deník putování (cesty z Výpravy) a právě probíhající cesta */
  {
    const n = put.length;
    put.forEach((c, j) => usek(c.b || [], stopaSila(n - 1 - j), j === n - 1, true, `${c.z} → ${c.do} · ${c.od} – ${c.pr}`));
    const c = lim == null && HRA && HRA.cesta;
    if (c && c.track) {
      const now = cT(HRA),
        done = c.track.filter(q => q[0] <= now).map(q => [q[1], q[2]]),
        qq = cestaPoz(c.track, now);
      if (qq) done.push(qq);
      usek(done, 1, true, true, `${c.z} → ${c.do}`);
      const zb = [qq || [c.track[0][1], c.track[0][2]], ...c.track.filter(q => q[0] > now).map(q => [q[1], q[2]])];
      if (zb.length > 1) {
        const pl = el("polyline", {
          points: zb.map(q => XY(q).join(",")).join(" "),
          fill: "none",
          stroke: "var(--kal)",
          "stroke-width": (1.8 * s).toFixed(2),
          opacity: ".45",
          "stroke-dasharray": `${3 * s} ${3 * s}`,
          "stroke-linecap": "round",
        });
        pl.appendChild(el("title", {}, `plán: ${c.z} → ${c.do}`));
        G.appendChild(pl);
      }
    }
  }
  /* zastávky: pečeti zápisů Kroniky s datem v místech, kde zápis končí (jen ve viditelné stopě) */
  {
    const by = new Map();
    zast.forEach(q => {
      if (!q.z.length) return;
      const p = placeBy(q.n);
      if (!p) return;
      if (!by.has(p.name)) by.set(p.name, {p, z: []});
      by.get(p.name).z.push(...q.z);
    });
    by.forEach(({p, z}) => {
      const [x, y] = P(p.lo, p.la),
        m = s * 1.15,
        i0 = z[z.length - 1],
        zl = ZAPISY[i0],
        g = el("g", {class: "zapmk", tabindex: 0, role: "button", "aria-label": `Zastávka družiny: ${p.name}, ${zl.date || ""} – ${zl.title}`});
      g.appendChild(el("title", {}, z.map(i => `${ZAPISY[i].n || "Zápis " + (i + 1)} · ${ZAPISY[i].date || ""} · ${ZAPISY[i].title}`).join("\n")));
      g.style.opacity = stopaSila(Math.max(0, R.i1 - i0));
      g.appendChild(
        el("circle", {cx: x - 9 * m, cy: y + 9 * m, r: 6.4 * m, fill: "#a3232b", stroke: "var(--paper)", "stroke-width": (1.4 * s).toFixed(2)}),
      );
      g.appendChild(
        el(
          "text",
          {
            x: x - 9 * m,
            y: y + 9 * m,
            "text-anchor": "middle",
            "dominant-baseline": "central",
            "font-size": (z.length > 1 ? 7.5 : 8.5) * m,
            fill: "#fbefc9",
            style: "font-family:var(--f-disp);pointer-events:none",
          },
          z.length > 1 ? `${z.length}×` : String(i0 + 1),
        ),
      );
      const dk = stopaDatumKr(zl.datum);
      if (dk)
        g.appendChild(
          el(
            "text",
            {
              x: x - 9 * m,
              y: y + 19.5 * m,
              "text-anchor": "middle",
              class: "seatlbl stopadat",
              "font-size": (8 * k).toFixed(1),
              "stroke-width": (2.6 * s).toFixed(2),
            },
            dk,
          ),
        );
      const go = e => {
        e.stopPropagation();
        showMisto({k: "st", n: p.name, z});
      };
      g.addEventListener("click", go);
      g.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") go(e);
      });
      svg.appendChild(g);
    });
  }
  const cur = lim != null ? placeBy(LZ.place) : partyPos();
  if (!cur) return;
  const [x0, y] = P(cur.lo, cur.la),
    m = s * 1.3,
    x = x0 + 7 * m,
    nap = lim != null ? `Družina tehdy (${LZ.date || ""})` : "Družina je tady";
  const g = el("g", {
    class: "partymk",
    tabindex: 0,
    role: "button",
    "aria-label": `${nap}: ${cur.name}, ${lim != null ? LZ.date || "" : partyDate()}.`,
  });
  g.appendChild(el("title", {}, `${nap} · ${cur.name} · ${lim != null ? LZ.date || "" : partyDate()}`));
  g.appendChild(el("rect", {x: x - 5 * m, y: y - 30 * m, width: 25 * m, height: 34 * m, fill: "transparent"}));
  g.appendChild(
    el("path", {d: `M${x},${y + 2 * m}V${y - 26 * m}`, stroke: "var(--ink)", "stroke-width": (1.8 * s).toFixed(2), "stroke-linecap": "round"}),
  );
  g.appendChild(
    el("path", {
      d: `M${x},${y - 26 * m}Q${x + 9 * m},${y - 24 * m} ${x + 18 * m},${y - 21 * m}L${x + 12 * m},${y - 18.5 * m}L${x + 18 * m},${y - 16 * m}Q${x + 9 * m},${y - 17 * m} ${x},${y - 15 * m}Z`,
      fill: "var(--kal)",
      stroke: "var(--paper)",
      "stroke-width": (1.1 * s).toFixed(2),
      "stroke-linejoin": "round",
    }),
  );
  g.appendChild(el("circle", {cx: x, cy: y - 27.5 * m, r: 1.8 * m, fill: "var(--gold)"}));
  g.appendChild(
    el(
      "text",
      {
        x: x + 6 * m,
        y: y - 31.5 * m,
        "text-anchor": "middle",
        class: "seatlbl stopatady",
        "font-size": (9.5 * k).toFixed(1),
        "stroke-width": (3 * s).toFixed(2),
      },
      nap,
    ),
  );
  const go = e => {
    e.stopPropagation();
    if (lim != null) showMisto({k: "st", n: LZ.place, z: [lim]});
    else showMisto({k: "st", tady: 1});
  };
  g.addEventListener("click", go);
  g.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") go(e);
  });
  svg.appendChild(g);
}

/* ---------- Kalendář tažení (juliánský kalendář) ---------- */
const MES = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];
const DNY = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];
const jdn = (y, m, d) => {
  const a = Math.floor((14 - m) / 12),
    Y = y + 4800 - a,
    M = m + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - 32083;
};
const fromJdn = j => {
  const c = j + 32082,
    d = Math.floor((4 * c + 3) / 1461),
    e = c - Math.floor((1461 * d) / 4),
    m = Math.floor((5 * e + 2) / 153);
  return [d - 4800 + Math.floor(m / 10), m + 3 - 12 * Math.floor(m / 10), e - Math.floor((153 * m + 2) / 5) + 1];
};
function easter(y) {
  const a = y % 4,
    b = y % 7,
    c = y % 19,
    d = (19 * c + 15) % 30,
    e = (2 * a + 4 * b - d + 34) % 7,
    s = d + e + 114;
  return jdn(y, Math.floor(s / 31), (s % 31) + 1);
}
function feasts(y) {
  const E = easter(y);
  return [
    {j: jdn(y, 4, 23), n: "sv. Vojtěch", w: "křesťané", p: 1},
    {j: jdn(y, 4, 24), n: "sv. Jiří", w: "křesťané", p: 1},
    {j: jdn(y, 7, 25), n: "sv. Kryštof", w: "křesťané", p: 1},
    {j: jdn(y, 9, 16), n: "sv. Ludmila", w: "křesťané", p: 1},
    {j: jdn(y, 9, 28), n: "sv. Václav", w: "křesťané", p: 1},
    {j: jdn(y, 7, 6), n: "Mistr Jan Hus", w: "kališníci", p: 1},
    {j: E - 14, n: "Smrtná neděle – vynášení Morany", w: "starověrci", p: 1},
    {j: jdn(y, 4, 30), n: "Filipojakubská noc", w: "všichni", hp: 1},
    {j: jdn(y, 6, 23), n: "Svatojánská noc", w: "všichni", hp: 1},
    {j: jdn(y, 12, 24), n: "Půlnoční na Štědrý den", w: "všichni", hp: 1},
    {j: E, n: "Boží hod velikonoční", w: "", info: 1},
    {j: jdn(y, 12, 25), n: "Boží hod vánoční", w: "", info: 1},
  ];
}

/* datování po středověku: svátek dne a neděle církevního roku (juliánský kalendář, Velikonoce podle starého výpočtu) */
const SVATKYD = {
  "1-1": "Obřezání Páně",
  "1-6": "Tří králů",
  "1-25": "Obrácení sv. Pavla",
  "2-2": "Očišťování Panny Marie",
  "2-22": "Stolce sv. Petra",
  "2-24": "sv. Matěje",
  "3-3": "sv. Kunhuty",
  "3-12": "sv. Řehoře",
  "3-21": "sv. Benedikta",
  "3-25": "Zvěstování Panny Marie",
  "4-23": "sv. Vojtěcha",
  "4-24": "sv. Jiří",
  "4-25": "sv. Marka",
  "5-1": "sv. Filipa a Jakuba",
  "5-3": "Nalezení sv. Kříže",
  "5-12": "sv. Pankráce",
  "5-25": "sv. Urbana",
  "6-15": "sv. Víta",
  "6-24": "sv. Jana Křtitele",
  "6-29": "sv. Petra a Pavla",
  "7-2": "Navštívení Panny Marie",
  "7-6": "Mistra Jana Husa",
  "7-13": "sv. Markéty",
  "7-22": "sv. Máří Magdalény",
  "7-25": "sv. Jakuba",
  "7-26": "sv. Anny",
  "8-1": "sv. Petra v okovech",
  "8-10": "sv. Vavřince",
  "8-15": "Nanebevzetí Panny Marie",
  "8-24": "sv. Bartoloměje",
  "8-29": "Stětí sv. Jana Křtitele",
  "9-8": "Narození Panny Marie",
  "9-14": "Povýšení sv. Kříže",
  "9-16": "sv. Ludmily",
  "9-21": "sv. Matouše",
  "9-28": "sv. Václava",
  "9-29": "sv. Michala",
  "10-16": "sv. Havla",
  "10-18": "sv. Lukáše",
  "10-28": "sv. Šimona a Judy",
  "11-1": "Všech svatých",
  "11-2": "Dušiček",
  "11-11": "sv. Martina",
  "11-25": "sv. Kateřiny",
  "11-30": "sv. Ondřeje",
  "12-6": "sv. Mikuláše",
  "12-8": "Početí Panny Marie",
  "12-21": "sv. Tomáše",
  "12-25": "Božího narození",
  "12-26": "sv. Štěpána",
  "12-28": "Mláďátek",
};
const NEDELE = [
  [-63, "Devítník"],
  [-56, "Sexagesima"],
  [-49, "Esto mihi"],
  [-42, "Invocavit"],
  [-35, "Reminiscere"],
  [-28, "Oculi"],
  [-21, "Laetare"],
  [-14, "Judica"],
  [-7, "", "na Květnou neděli", "po Květné neděli"],
  [0, "", "na Boží hod velikonoční", "po Velikonocích"],
  [7, "Quasimodo"],
  [14, "Misericordia"],
  [21, "Jubilate"],
  [28, "Cantate"],
  [35, "Rogate"],
  [42, "Exaudi"],
  [49, "", "na Boží hod svatodušní", "po Letnicích"],
  [56, "", "v neděli Nejsvětější Trojice", "po neděli Nejsvětější Trojice"],
];
const DNYV = ["v neděli", "v pondělí", "v úterý", "ve středu", "ve čtvrtek", "v pátek", "v sobotu"];
function dataceStara(datum) {
  const m = String(datum || "").match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return "";
  const [y, M, D] = [+m[1], +m[2], +m[3]],
    j = jdn(y, M, D),
    E = easter(y),
    dw = (j + 1) % 7,
    od = j - E,
    pohybl = {[-46]: "Popeleční středu", [-3]: "na Zelený čtvrtek", [-2]: "na Velký pátek", [39]: "na Nanebevstoupení Páně", [60]: "na Boží tělo"};
  const ned = NEDELE.find(([o]) => o === od - dw),
    cast = [];
  if (pohybl[od]) cast.push(pohybl[od].startsWith("na ") ? pohybl[od] : "na " + pohybl[od]);
  else if (ned && dw === 0) cast.push(ned[2] || `v neděli ${ned[1]}`);
  else if (ned) cast.push(`${DNYV[dw]} ${ned[3] || "po neděli " + ned[1]}`);
  else cast.push(DNYV[dw]);
  const sv = SVATKYD[M + "-" + D];
  if (sv) cast.push(`v den ${sv}`);
  return `${cast.join(", ")}, ${D}. ${MES[M - 1]} léta Páně ${y}`;
}
const LOKATIV = {
  Praha: "v Praze",
  "Kutná Hora": "v Kutné Hoře",
  Kolín: "v Kolíně",
  Brno: "v Brně",
  Olomouc: "v Olomouci",
  Vídeň: "ve Vídni",
  Plzeň: "v Plzni",
  Tábor: "v Táboře",
  Vratislav: "ve Vratislavi",
  "Hradec Králové": "v Hradci Králové",
  Poděbrady: "v Poděbradech",
  Kroměříž: "v Kroměříži",
  "Český Krumlov": "v Českém Krumlově",
  Jihlava: "v Jihlavě",
  Znojmo: "ve Znojmě",
  Cheb: "v Chebu",
  Žatec: "v Žatci",
  Louny: "v Lounech",
  Litoměřice: "v Litoměřicích",
  Budín: "v Budíně",
  Krakov: "v Krakově",
  Řím: "v Římě",
};
function zPodpis(z) {
  const d = dataceStara(z.datum);
  if (!d) return "";
  const kde = LOKATIV[z.place];
  return `<footer class="zpodpis"><p>Psáno${kde ? " " + kde : ""} ${d}.<b>Vojtěch z Kroměříže</b>kronikář tažení</p><img src="art/img/pecet.webp" alt="Pečeť kronikáře" width="64" height="64" loading="lazy"></footer>`;
}

/* hodiny Závoje na úvodu: 24 hodin (pravý sluneční čas Prahy), poledne nahoře, půlnoc dole */
const DEG = Math.PI / 180;
function sunFor(jd) {
  /* deklinace Slunce, východ a západ (h), výška Slunce v hodině h */
  const n = jd - 2451545,
    L = (280.46 + 0.9856474 * n) % 360,
    g = ((357.528 + 0.9856003 * n) % 360) * DEG,
    lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG,
    eps = (23.439 - 4e-7 * n) * DEG;
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam)),
    phi = 50.09 * DEG;
  const c = (Math.sin(-0.833 * DEG) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)),
    H0 = Math.acos(Math.max(-1, Math.min(1, c))) / DEG / 15;
  return {
    dec: dec / DEG,
    rise: 12 - H0,
    set: 12 + H0,
    alt: h => Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(15 * (h - 12) * DEG)) / DEG,
  };
}
function moonFor(jd) {
  const p = ((((jd - 2451550.1) / 29.530588853) % 1) + 1) % 1;
  const nm =
    p < 0.03 || p > 0.97
      ? "nov"
      : p < 0.22
        ? "dorůstající srpek"
        : p < 0.28
          ? "první čtvrť"
          : p < 0.47
            ? "měsíc dorůstá"
            : p < 0.53
              ? "úplněk"
              : p < 0.72
                ? "měsíc couvá"
                : p < 0.78
                  ? "poslední čtvrť"
                  : "ubývající srpek";
  return {p, nm, lit: Math.round(((1 - Math.cos(2 * Math.PI * p)) / 2) * 100)};
}
const hourWord = h =>
  h === 0
    ? "půlnoc"
    : h < 5
      ? "v noci"
      : h < 9
        ? "ráno"
        : h < 12
          ? "dopoledne"
          : h === 12
            ? "poledne"
            : h < 18
              ? "odpoledne"
              : h < 21
                ? "večer"
                : "v noci";
function dialCtx(Y, M, D, today, H, Hprev) {
  const jd = today - 0.5 + (H ?? 12) / 24,
    sun = sunFor(today),
    moon = moonFor(jd),
    th = (sun.set - sun.rise) / 12;
  const kl = Math.round(sun.set) % 24,
    Z = {12: "poledne", 0: "půlnoc"};
  Z[kl] = "večerní klekání";
  const canon = [
    ["matutinum", 2],
    ["laudy", sun.rise - 0.75],
    ["prima", sun.rise],
    ["tercie", sun.rise + 3 * th],
    ["sexta", 12],
    ["nona", sun.rise + 9 * th],
    ["nešpory", sun.set - 0.5],
    ["kompletář", sun.set + 1.5],
  ];
  /* slunovrat (Vojta 2026-10-29): Hodina Závoje po celý den slunovratu (den, kdy je Slunce nejvýš či nejníž), ne svátek */
  const fe = feasts(Y)
      .filter(f => f.j === today)
      .map(f => f.n),
    dA = Math.abs(sun.dec),
    sol =
      dA > 23 && dA >= Math.abs(sunFor(today - 1).dec) && dA > Math.abs(sunFor(today + 1).dec)
        ? sun.dec > 0
          ? "letní slunovrat"
          : "zimní slunovrat"
        : "";
  if (sol) for (let h = 0; h < 24; h++) Z[h] = Z[h] ? `${Z[h]} o slunovratu` : sol;
  const cz = h => ((Math.round(h - sun.set) % 24) + 24) % 24 || 24;
  return {Y, M, D, H, Hprev, sun, moon, Z, canon, fe, cz};
}
/* hodiny 2 × 12 („půl orloj“, jako římské číslice pražského orloje), unciálními kapitálami; čtyřka IIII jako na ciferníku */
const RIMV = ["", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
function dialSVG(X) {
  const {H, Hprev, sun, moon, Z, canon, fe, cz} = X,
    C = 200,
    P = (r, h) => {
      const a = ((h - 12) * Math.PI) / 12;
      return [C + r * Math.sin(a), C - r * Math.cos(a)];
    },
    F = v => v.toFixed(1);
  /* podíl dne 0–1 podle výšky Slunce: noc pod −12°, plný den nad 8°, mezi tím soumrak a svítání */
  const den = h => {
    const t = Math.max(0, Math.min(1, (sun.alt(h) + 12) / 20));
    return t * t * (3 - 2 * t);
  };
  const pravda = H != null && fe.length && Z[H % 24] != null,
    R1 = 196,
    R0 = 150,
    RC = 128,
    IMG = "art/img/",
    INK = "#2a1a0e";
  const kruh = r => `M${C - r},${C}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
  const vysec = (r1, r0, h0, h1) => {
    const [a, b] = P(r1, h0),
      [c2, d2] = P(r1, h1),
      [e, f] = P(r0, h1),
      [g, i] = P(r0, h0);
    return `M${F(a)},${F(b)}A${r1},${r1} 0 0 1 ${F(c2)},${F(d2)}L${F(e)},${F(f)}A${r0},${r0} 0 0 0 ${F(g)},${F(i)}Z`;
  };
  const usek = (r0, r1, h) => {
    const [a, b] = P(r0, h),
      [c2, d2] = P(r1, h);
    return `M${F(a)},${F(b)}L${F(c2)},${F(d2)}`;
  };
  let mask = "";
  for (let k = 0; k < 96; k++) {
    const v = Math.round(den(k / 4 + 0.125) * 255);
    mask += `<path d="${vysec(236, 116, k / 4, (k + 1) / 4)}" fill="rgb(${v},${v},${v})" stroke="rgb(${v},${v},${v})" stroke-width=".8"/>`;
  }
  let o = `<svg class="dialsvg" viewBox="-62 -62 524 524" role="img" aria-label="Hodiny Závoje"><defs>
<linearGradient id="dkzl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset=".3" stop-color="#d2a23c"/><stop offset=".55" stop-color="#f4d985"/><stop offset=".8" stop-color="#b8862a"/><stop offset="1" stop-color="#e9c66a"/></linearGradient>
<filter id="dkruka" filterUnits="userSpaceOnUse" x="-76" y="-76" width="552" height="552"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="1" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="dkmlha" filterUnits="userSpaceOnUse" x="-40" y="-40" width="480" height="480"><feGaussianBlur stdDeviation="3.5" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="3" result="n"/><feDisplacementMap in="b" in2="n" scale="14" xChannelSelector="R" yChannelSelector="B"/></filter>
<mask id="dkden" maskUnits="userSpaceOnUse" x="-34" y="-34" width="468" height="468"><g filter="url(#dkmlha)">${mask}</g></mask>
<clipPath id="dkpr"><path d="${kruh(R1)}${kruh(R0)}" clip-rule="evenodd"/></clipPath>
<clipPath id="dkvn"><circle cx="${C}" cy="${C}" r="${R0 - 1}"/></clipPath>
<clipPath id="dkmed" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".485"/></clipPath>
<radialGradient id="dkpocst" gradientUnits="userSpaceOnUse" cx="200" cy="200" r="255"><stop offset=".9" stop-color="#7a5a20" stop-opacity=".18"/><stop offset=".95" stop-color="#7a5a20" stop-opacity="0"/><stop offset="1" stop-color="#7a5a20" stop-opacity=".22"/></radialGradient><radialGradient id="dksm" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="#ef7652"/><stop offset=".5" stop-color="#c0381f"/><stop offset="1" stop-color="#6a1410"/></radialGradient>
</defs>`;
  o += dialPocSVG(X.poc, P, F, C, INK, IMG);
  if (fe.length) o += `<circle cx="${C}" cy="${C}" r="203" fill="none" stroke="#f0d68a" stroke-width="9" class="dialfest"/>`;
  /* vnější prstenec: hvězdná klenba, přes ni zlato dne v masce podle Slunce; do zlata vyryté hodinové linky */
  let ryt = "";
  for (let h = 0; h < 24; h++)
    [
      [R0 + 1, 159],
      [187, R1 - 1],
    ].forEach(([r0, r1]) => {
      ryt += `<path d="${usek(r0, r1, h)}" stroke="#6a4610" stroke-width="1.7" opacity=".95"/><path d="${usek(r0, r1, h + 0.024)}" stroke="#fff4cc" stroke-width=".8" opacity=".95"/>`;
    });
  o += `<g clip-path="url(#dkpr)"><image href="${IMG}kolo-noc.webp" x="${C - R1}" y="${C - R1}" width="${2 * R1}" height="${2 * R1}"/><g mask="url(#dkden)"><image href="${IMG}kolo-den.webp" x="${C - R1}" y="${C - R1}" width="${2 * R1}" height="${2 * R1}"/><g filter="url(#dkruka)" stroke-linecap="round">${ryt}</g></g></g>`;
  /* medailony: slunce v poledne, měsíc o půlnoci */
  const med = (h, src, t) => {
    const [x, y] = P(173, h),
      r = 21;
    return `<g>${t ? `<title>${t}</title>` : ""}<circle cx="${F(x)}" cy="${F(y)}" r="${r + 1.3}" fill="${INK}"/><image href="${IMG}${src}" x="${F(x - r)}" y="${F(y - r)}" width="${2 * r}" height="${2 * r}" clip-path="url(#dkmed)"/></g>`;
  };
  o += med(12, "kolo-slunce.webp", "Poledne") + med(0, "kolo-mesic.webp", `Měsíc: ${moon.nm} (osvětleno ${moon.lit} %)`);
  /* stín skutečné fáze Měsíce přes medailon */
  {
    const [x, y] = P(173, 0),
      r = 20.5,
      p = moon.p,
      k = Math.abs(Math.cos(2 * Math.PI * p)) * r,
      wax = p < 0.5,
      ts = wax ? (p < 0.25 ? 0 : 1) : p < 0.75 ? 0 : 1;
    if (moon.lit < 99)
      o += `<mask id="dkfaze" maskUnits="userSpaceOnUse" x="${F(x - r - 2)}" y="${F(y - r - 2)}" width="${2 * r + 4}" height="${2 * r + 4}"><circle cx="${F(x)}" cy="${F(y)}" r="${r}" fill="#fff"/>${moon.lit > 1 ? `<path d="M${F(x)},${F(y - r)}A${r},${r} 0 0 ${wax ? 1 : 0} ${F(x)},${F(y + r)}A${F(k)},${r} 0 0 ${ts} ${F(x)},${F(y - r)}Z" fill="#000"/>` : ""}</mask><circle cx="${F(x)}" cy="${F(y)}" r="${r}" fill="#070b1f" opacity=".58" mask="url(#dkfaze)" pointer-events="none"/>`;
  }
  /* kanonické hodinky vně kruhu */
  o += `<g filter="url(#dkruka)" stroke-linecap="round">${canon.map(([, h]) => `<path d="${usek(R1 + 2, R1 + 9, h)}" stroke="${INK}" stroke-width="3.4"/><path d="${usek(R1 + 2, R1 + 9, h)}" stroke="url(#dkzl)" stroke-width="1.8"/>`).join("")}</g>`;
  canon.forEach(([n, h]) => {
    const [x, y] = P(213, h);
    let rot = (h - 12) * 15;
    if (Math.cos(rot * DEG) < 0) rot += 180;
    o += `<g class="dialcan"><title>${n} – kolem ${Math.floor(((h % 24) + 24) % 24)}. hodiny; zvon k modlitbě</title><text x="${F(x)}" y="${F(y)}" transform="rotate(${F(rot)} ${F(x)} ${F(y)})" text-anchor="middle" dominant-baseline="central" class="dialcantx">${n}</text></g>`;
  });
  /* vnitřní kruh z tmavého dřeva; jeho střed se otáčí se západem slunce (orloj) */
  o += `<g clip-path="url(#dkvn)"><image href="${IMG}kolo-drevo.webp" x="${C - R0}" y="${C - R0}" width="${2 * R0}" height="${2 * R0}" transform="rotate(${F((sun.set - 18) * 15)} ${C} ${C})"/><path d="${kruh(R0)}${kruh(R0 - 15)}" fill-rule="evenodd" fill="#140a04" opacity=".38"/></g>`;
  let t96 = "";
  for (let k = 0; k < 96; k++)
    t96 += `<path d="${usek(R0 - 1, k % 4 ? R0 - 8 : R0 - 12, k / 4)}" stroke="#d6aa4a" stroke-width="${k % 4 ? 0.8 : 1.6}"/>`;
  o += `<g filter="url(#dkruka)">${t96}</g>`;
  /* staročeský čas (orloj): hodiny od západu slunce */
  for (let n = 1; n <= 24; n++) {
    const h = sun.set + n,
      [x, y] = P(RC, h);
    o += `<text x="${F(x)}" y="${F(y)}" transform="rotate(${F((h - 12) * 15)} ${F(x)} ${F(y)})" text-anchor="middle" dominant-baseline="central" class="dialcz">${n}<title>${n}. hodina na orloji (počítáno od západu slunce)</title></text>`;
  }
  o += `<circle cx="${C}" cy="${C}" r="${RC - 9}" fill="var(--paper)"/>`;
  /* zlacené okraje prstenců s inkoustovým obrysem */
  o += `<g fill="none" filter="url(#dkruka)">${[
    [R1, 3.4],
    [R0, 2.6],
    [R0 - 15, 1.8],
    [RC - 9, 2.4],
  ]
    .map(
      ([r, w]) =>
        `<circle cx="${C}" cy="${C}" r="${r}" stroke="${INK}" stroke-width="${w + 2}"/><circle cx="${C}" cy="${C}" r="${r}" stroke="url(#dkzl)" stroke-width="${w}"/>`,
    )
    .join("")}</g>`;
  /* číslice hodin s popisky */
  for (let h = 1; h <= 24; h++) {
    const hh = h % 24,
      [x, y] = P(173, h),
      noc = den(h) < 0.5,
      a = (h - 12) * 15,
      cur = H != null && H % 24 === hh,
      zv = Z[hh] != null,
      rub = hh === 0 || hh === 12;
    const can = canon
      .filter(([n, t]) => Math.round(((t % 24) + 24) % 24) === hh)
      .map(q => q[0])
      .join(", ");
    o += `<g class="dialhr"><title>${h}. hodina · ${hourWord(hh)} · na orloji ${cz(hh)}.${can ? " · " + can : ""}${zv ? " · Hodina Závoje (" + Z[hh] + ")" : ""}</title>`;
    if (zv && !cur && !rub)
      o += `<circle cx="${F(x)}" cy="${F(y)}" r="14.5" fill="none" stroke="${noc ? "#f0d68a" : "#8e2416"}" stroke-width="1.3"/>`;
    if (cur)
      o += `<circle cx="${F(x)}" cy="${F(y)}" r="15.8" fill="${INK}"/><circle cx="${F(x)}" cy="${F(y)}" r="14" fill="url(#dksm)" stroke="url(#dkzl)" stroke-width="2.4" class="dialcur${pravda ? " pravda" : ""}"/><ellipse cx="${F(x - 4.5)}" cy="${F(y - 5.5)}" rx="4.5" ry="2.6" fill="#fff" opacity=".28" transform="rotate(-35 ${F(x - 4.5)} ${F(y - 5.5)})"/>`;
    o += `<circle cx="${F(x)}" cy="${F(y)}" r="14" fill="transparent"/><text x="${F(x)}" y="${F(y)}" transform="rotate(${a} ${F(x)} ${F(y)})" text-anchor="middle" dominant-baseline="central" class="dialnum ${cur ? "dnc" : rub ? "dnr" : noc ? "dnn" : "dnd"}" style="font-size:${[0, 21, 21, 20, 18.5][RIMV[((h - 1) % 12) + 1].length]}px">${RIMV[((h - 1) % 12) + 1]}</text></g>`;
  }
  /* ručička: při načtení přejede od hodiny minulého zápisu */
  if (H != null) {
    const a1 = (H - 12) * 15;
    let a0 = Hprev != null ? (Hprev - 12) * 15 : a1;
    if (a0 > a1) a0 -= 360;
    /* ručička: zlacený hrot s inkoustovým obrysem od středového štítu až k terčíku hodiny */
    o += `<g class="dialneedle${a0 !== a1 ? " anim" : ""}" style="--a0:${a0}deg;--a1:${a1}deg;transform:rotate(${a1}deg)"><g filter="url(#dkruka)"><path d="M200,41L210.5,58.5L205,61L205.8,74L200,82L194.2,74L195,61L189.5,58.5Z" fill="url(#dkzl)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M200,45L200,57" stroke="#6a4610" stroke-width="1.2"/><circle cx="200" cy="78" r="6.5" fill="url(#dkzl)" stroke="${INK}" stroke-width="1.5"/></g><circle cx="200" cy="78" r="3" fill="#b8321f"/><path d="M200,62l3.4,5l-3.4,5l-3.4,-5z" fill="#b8321f" stroke="${INK}" stroke-width=".6"/></g>`;
  }
  return o + `</svg>`;
}
/* ===== prstenec počasí kolem kola: dnešní počasí z generátoru Výpravy (stejné místo a den = stejné počasí) ===== */
let dialPocZnovu = 0;
function dialPoc(j) {
  try {
    const pp = typeof partyPos === "function" ? partyPos() : null,
      ll = pp && pp.lo != null ? [pp.lo, pp.la] : (c => (c ? [c.lo, c.la] : [14.42, 50.088]))(cestaMisto(partyPlace() || ""));
    return vyPocasi(j, ll);
  } catch (e) {
    if (!dialPocZnovu) {
      dialPocZnovu = 1;
      setTimeout(() => {
        try {
          renderKal();
        } catch (e) {}
      }, 0);
    }
    return null;
  }
}
const pocDruh = P => {
  if (P.typ === "bourka") return "bourka";
  if (P.typ === "snih") return "snih";
  if (P.typ === "plucha") return "plucha";
  if (P.typ === "dest") return P.int <= 1 ? "mrholi" : "dest";
  if (P.mlha) return "mlha";
  if (P.rz === "fro" || P.rz === "stre") return "zatazeno";
  if (P.rz === "zap" || P.rz === "sev") return "oblacno";
  return "jasno";
};
const POC_N = {
  jasno: "jasno",
  oblacno: "polojasno",
  zatazeno: "zataženo",
  mlha: "mlha",
  mrholi: "mrholení",
  dest: "déšť",
  snih: "sněžení",
  plucha: "plucha",
  bourka: "bouřka",
  vitr: "vítr",
  mraz: "mráz",
  vedro: "vedro",
  snihl: "leží sníh",
  zavoj: "znamení Závoje",
};
/* malované medailony počasí (art/img/pocasi-*.webp); jasno a vedro ukazuje slunce z kola */
const pocObr = k => (k === "jasno" || k === "vedro" ? "kolo-slunce.webp" : `pocasi-${k === "mraz" ? "mraz" : k}.webp`);
function dialPocSVG(P, Pt, F, C, INK, IMG) {
  const RA = 223,
    RB = 247,
    RM = 235,
    kruh = r => `M${C - r},${C}a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 ${-2 * r},0Z`;
  let o = `<g class="dialpoc"><path d="${kruh(RA)}${kruh(196)}" fill-rule="evenodd" fill="var(--paper)"/><clipPath id="dkpocc"><path d="${kruh(RB)}${kruh(RA)}" clip-rule="evenodd"/></clipPath><g clip-path="url(#dkpocc)"><image href="${IMG}kolo-noc.webp" x="${C - RB - 60}" y="${C - RB - 60}" width="${2 * RB + 120}" height="${2 * RB + 120}" transform="rotate(37 ${C} ${C})"/><path d="${kruh(RB)}${kruh(RA)}" fill-rule="evenodd" fill="#0a1230" opacity=".35"/></g>`;
  o += `<g fill="none" filter="url(#dkruka)">${[RA, RB].map(r => `<circle cx="${C}" cy="${C}" r="${r}" stroke="${INK}" stroke-width="3.6"/><circle cx="${C}" cy="${C}" r="${r}" stroke="url(#dkzl)" stroke-width="1.8"/>`).join("")}</g>`;
  if (!P) return o + `</g>`;
  const k = pocDruh(P),
    extra = [];
  if (P.v >= 3) extra.push("vitr");
  if (P.tn <= -6) extra.push("mraz");
  if (P.tx >= 27 && k !== "jasno") extra.push("vedro");
  if (P.mlha && k !== "mlha") extra.push("mlha");
  if (P.snih >= 3 && k !== "snih") extra.push("snihl");
  if (P.zav) extra.push("zavoj");
  const med = (h, r, kind, tt) => {
    const [x, y] = Pt(h === 12 ? RM + 3 : RM, h);
    return `<g class="dialpocm"><title>${tt}</title><circle cx="${F(x)}" cy="${F(y)}" r="${r + 1.4}" fill="${INK}"/><image href="${IMG}${pocObr(kind)}" x="${F(x - r)}" y="${F(y - r)}" width="${2 * r}" height="${2 * r}" clip-path="url(#dkmed)"/></g>`;
  };
  const popis = besc(P.text) + (P.zav ? " " + besc(P.zav) : "");
  o += med(12, 20, k, `Dnešní počasí: ${popis}`);
  /* vedlejší jevy (vítr, mráz, mlha, sníh na zemi, znamení Závoje) drobně po stranách hlavního symbolu */
  [9.7, 14.3, 8, 16].forEach((h, i) => {
    const kind = extra[i];
    if (kind) o += med(h, 14.5, kind, (POC_N[kind] || "") + (kind === "zavoj" ? ": " + besc(P.zav) : ""));
  });
  /* popis dne po spodním oblouku */
  let t = P.text.split(". ")[0].replace(/\.$/, "");
  if (t.length > 78) t = t.slice(0, 76).replace(/[ ,–-]+\S*$/, "") + "…";
  const [x0, y0] = Pt(RM, 6.4),
    [x1, y1] = Pt(RM, 17.6);
  o += `<path id="dkpocp" d="M${F(x0)},${F(y0)}A${RM},${RM} 0 1 0 ${F(x1)},${F(y1)}" fill="none"/><text class="dialpoct" dominant-baseline="central"><title>${popis}</title><textPath href="#dkpocp" startOffset="50%" text-anchor="middle">${besc(t)}</textPath></text>`;
  return o + `</g>`;
}
/* ===== dráček na Úvodu ukazuje stav hry: bdí / spí / svátek / neklid (Hodina Závoje) / Hodina Pravdy; rámeček podle ročního období ===== */
const DRAK_T = {
  bdi: "Dráček bdí – je den.",
  spi: "Dráček spí – je noc.",
  svatek: "Dráček slaví – dnes je svátek",
  neklid: "Dráček je neklidný – Hodina Závoje",
  pravda: "Dráček řve – Hodina Pravdy",
};
const drakSrc = k => [420, 640, 840].map(w => `art/img/drak-${k}-${w}.webp ${w}w`).join(", ");
function drakVrstva(box, cls, k) {
  /* nová vrstva se prolne přes starou (asi 1,5 s); stejný stav se nepřekresluje */
  const old = [...box.querySelectorAll("img." + cls)],
    cur = old.find(i => i.classList.contains("on") && !i.dataset.pryc);
  if ((cur ? cur.dataset.k : "") === (k || "")) return;
  const prvni = !box.dataset.hotovo,
    pryc = () =>
      old.forEach(i => {
        i.dataset.pryc = 1;
        i.classList.remove("on");
        setTimeout(() => i.remove(), 1700);
      });
  if (!k) {
    pryc();
    return;
  }
  const im = document.createElement("img");
  im.className = "drl " + cls;
  im.dataset.k = k;
  im.alt = "";
  im.width = im.height = 560;
  im.sizes = "(max-width:700px) min(210px,58vw), min(400px,80vw)";
  im.srcset = drakSrc(k);
  im.src = `art/img/drak-${k}-640.webp`;
  if (prvni) im.classList.add("bez");
  box.appendChild(im);
  const ukaz = () => {
    requestAnimationFrame(() => {
      im.classList.add("on");
      if (prvni) {
        old.forEach(i => i.remove());
        requestAnimationFrame(() => im.classList.remove("bez"));
      } else pryc();
    });
  };
  (im.decode ? im.decode() : Promise.resolve()).then(ukaz, ukaz);
}
function drakStav(X) {
  const box = document.querySelector(".drstav");
  if (!box) return;
  const {H, sun, Z} = X,
    today = X.today,
    fe = feasts(X.Y)
      .filter(f => f.j === today)
      .map(f => f.n),
    h = H == null ? null : H % 24;
  const zav = h != null && Z[h] != null,
    noc = h != null && sun.alt(h) < -2;
  const k = fe.length && zav ? "pravda" : zav ? "neklid" : fe.length ? "svatek" : noc ? "spi" : "bdi";
  const gm = fromJdn(today + 9)[1],
    sez =
      gm >= 3 && gm <= 5
        ? "jaro"
        : gm >= 6 && gm <= 8
          ? ""
          : gm >= 9 && gm <= 11
            ? "podzim"
            : "zima"; /* roční doba podle skutečného (gregoriánského) data */
  let t = DRAK_T[k];
  if (k === "svatek") t += `: ${fe.join(", ")}.`;
  else if (k === "neklid") t += ` (${Z[h]}).`;
  else if (k === "pravda") t += `: ${fe.join(", ")} a ${Z[h]}.`;
  t += " " + {jaro: "Jaro.", podzim: "Podzim.", zima: "Zima.", "": "Léto."}[sez];
  box.title = t;
  box.setAttribute("aria-label", "Iluminace: bílý dráček ve zlatém kalichu plném vína pod hvězdnou oblohou. " + t);
  drakVrstva(box, "drz", k);
  drakVrstva(box, "drs", sez);
  box.dataset.hotovo = 1;
}
function dialHour(X) {
  const {H, moon, Z, fe, cz} = X,
    h = H % 24,
    z = Z[h],
    pravda = fe.length && z;
  return (
    `<p class="dialh">${h === 0 || h === 12 ? hourWord(h) : `${h}. hodina · ${hourWord(h)}`}<span>${cz(h)}. hodina na orloji · ${moon.nm}</span></p>` +
    (fe.length ? `<p class="dialfe">Dnes: ${fe.join(", ")}</p>` : "") +
    (pravda
      ? `<p class="dialz"><a href="#artikule/zavoj/hodina-pravdy">Hodina Pravdy</a> – svátek a ${z}: kostka Závoje nezná neutrální výsledek</p>`
      : z
        ? `<p class="dialz"><a href="#artikule/zavoj/hodiny">Hodina Závoje</a> – ${z}; Pokušení padá již na 1–3</p>`
        : "")
  );
}
/* aktuální herní datum (stejné jako „Dnes je…“ na Úvodu): nastavené vypravěčem, jinak datum posledního zápisu Kroniky */
function herniDen() {
  const last = [...ZAPISY].reverse().find(z => /^\d{4}-\d{2}-\d{2}$/.test(z.datum || ""));
  const hd = HRA && /^\d{4}-\d{2}-\d{2}$/.test(HRA.datum || "") ? HRA.datum : null;
  return (hd || (last ? last.datum : "1458-03-03")).split("-").map(Number);
}
/* věk postavy k hernímu datu: přesné datum → přesný věk (mění se v den narozenin), jen rok → „asi“, odhad → „odhadem“ */
const tvarLet = n => (n === 1 ? "rok" : n >= 2 && n <= 4 ? "roky" : "let");
function vekPostavy(nar) {
  if (!nar || !isFinite(nar.r)) return "";
  const [Y, M, D] = herniDen();
  let n = Y - nar.r;
  if (nar.d && !nar.o) {
    const [, bm, bd] = nar.d.split("-").map(Number);
    if (M < bm || (M === bm && D < bd)) n--;
    return n < 0 ? "" : `${n} ${tvarLet(n)}`;
  }
  if (n < 0) return "";
  return `${nar.o ? "odhadem" : "asi"} ${n} ${tvarLet(n)}`;
}
let kalHero = 1;
function renderKal() {
  const [Y, M, D] = herniDen(),
    today = jdn(Y, M, D);
  const up = [...feasts(Y), ...feasts(Y + 1)]
    .filter(f => f.j >= today)
    .sort((a, b) => a.j - b.j)
    .slice(0, 8);
  const rel = j => {
    const n = j - today;
    return n === 0 ? "dnes" : n === 1 ? "zítra" : `za ${n} ${n < 5 ? "dny" : "dní"}`;
  };
  if (curView !== "uvod") kalHero = 1; /* ciferník a dráček (~0,5 MB obrázků) jen na Úvodu; jinde se překreslí až při návratu */
  else {
    kalHero = 0;
    const hzs = [...ZAPISY].reverse().filter(z => z.hodina != null),
      hh = HRA && HRA.hodina != null,
      H = hh ? +HRA.hodina : hzs[0] ? hzs[0].hodina : null,
      X = dialCtx(Y, M, D, today, H, hh ? (HRA.hodinaPred != null ? +HRA.hodinaPred : null) : hzs[1] ? hzs[1].hodina : null);
    X.poc = dialPoc(today);
    X.today = today;
    const pp = partyPlace(),
      fz = pp && FAM.find(f => !f.nomap && f.seats.some(sd => sd[0] === pp)),
      LZ = ZAPISY[ZAPISY.length - 1];
    {
      const he = document.getElementById("hero"),
        hh2 = `<div class="dial">${dialSVG(X)}<div class="dialtxt"><p class="lbl">Dnes je</p><p class="herod">${DNY[(today + 1) % 7]} ${D}. ${MES[M - 1]}<span>léta Páně ${Y}</span></p>${H != null ? dialHour(X) : ""}</div></div>${cestaAktivni() ? `<p class="herop">Družina je na cestě: ${HRA.cesta.z} → <b>${HRA.cesta.do}</b> · příjezd asi ${cTxt(HRA.cesta.track[HRA.cesta.track.length - 1][0]).replace(/ \d{4},/, ",")}${LZ ? ` · poslední zápis: <a href="#kronika/${LZ.id}">${LZ.title}</a>` : ""}</p>` : pp ? `<p class="herop">Družina: ${fz ? `<button type="button" class="maplink" data-id="${fz.id}" data-place="${pp}">${pp}</button>` : pp}${LZ ? ` · poslední zápis: <a href="#kronika/${LZ.id}">${LZ.title}</a>` : ""}</p>` : ""}`;
      if (he._h !== hh2) {
        he.innerHTML = hh2;
        he._h = hh2;
      }
    }
    try {
      drakStav(X);
    } catch (e) {
      console.warn(e);
    }
  }
  renderNovinky();
  const zs = [...ZAPISY].reverse().slice(0, 3);
  document.getElementById("uvzap").innerHTML =
    `<ol class="zlist">${zs.map(z => `<li><a class="zcard" href="#kronika/${z.id}"><small>${z.n} · ${z.date} · ${z.place}</small><b>${z.title}</b><span>${strip(z.text).replace(/\s+/g, " ").slice(0, 180)}…</span></a></li>`).join("")}</ol>`;
  const L = [...document.querySelectorAll("#letopis dt")].slice(-3).reverse();
  document.getElementById("uvlet").innerHTML = L.map(dt => `<dt>${dt.textContent}</dt><dd>${dt.nextElementSibling.innerHTML}</dd>`).join("");
  autolink(document.getElementById("uvlet"), "");
  const html = `<div class="kalhead"><span class="kalt">Kalendárium</span><span class="lbl">svátky a Hodiny Pravdy</span></div>
   <ul class="kallist">${up.map(f => `<li class="${f.hp ? "hp" : f.info ? "inf" : ""}"><span class="kd">${(([y, m, d]) => `${d}<small>${MES[m - 1].slice(0, 3)}</small>`)(fromJdn(f.j))}</span><span class="kn">${f.n}</span><span class="kw">${f.hp ? `<a href="#artikule/pojmy/p-hodina-pravdy">Hodina Pravdy</a>` : f.info ? "" : `Požehnání 4–6: ${f.w}`}</span><span class="kr">${rel(f.j)}</span></li>`).join("")}</ul>`;
  document.querySelectorAll(".kal").forEach(k => (k.innerHTML = html));
  /* až před vykreslením snímku – rozložení stránky se pak počítá jednou, ne uprostřed startu (2026-10-25) */
  requestAnimationFrame(kalFit);
}
/* svátky, které se do rámečku kalendáře nevejdou, se skryjí – od prvního přesahujícího dál (seznam je podle data);
   nejdřív se všechny změří, pak skryjí, aby se stránka nerozkládala znovu po každém skrytém řádku */
function kalFit() {
  const k = document.getElementById("kal1");
  if (!k) return;
  const lis = [...k.querySelectorAll(".kallist li")];
  lis.forEach(l => (l.style.display = ""));
  if (!matchMedia("(min-width:861px)").matches || !k.offsetHeight) return;
  const dol = k.getBoundingClientRect().bottom - parseFloat(getComputedStyle(k).paddingBottom);
  const prvni = lis.findIndex(
    l =>
      [l, ...l.children]
        .map(x => x.getBoundingClientRect())
        .filter(r => r.height)
        .reduce((m, r) => Math.max(m, r.bottom), 0) >
      dol + 1,
  );
  if (prvni >= 0) lis.slice(prvni).forEach(l => (l.style.display = "none"));
}
if ("ResizeObserver" in window) {
  const u = document.querySelector(".uvev");
  if (u) new ResizeObserver(() => kalFit()).observe(u);
}
addEventListener("resize", () => kalFit());
/* --- NOVINKY: co družina nově zná (z deníku odhalení) --- */
function renderNovinky() {
  /* Nedávné kontakty: osoby, které družina naposledy potkala (z deníku odhalení, nejnovější první) */
  const w = document.getElementById("uvnovw");
  if (!w) return;
  const vid = new Set(),
    ps = [];
  (__D.NOVINKY || []).forEach(n => {
    const p = PBY[n.id];
    if (!p || n.stav < 2 || vid.has(n.id) || !byId[p.r]) return;
    vid.add(n.id);
    ps.push(p);
  });
  const sel = ps.slice(0, 10);
  w.hidden = !sel.length;
  if (!sel.length) return;
  document.getElementById("uvnov").innerHTML = sel
    .map(
      p =>
        `<a class="kontakt" href="#osoba/${p.id}" title="${p.n.replace(/^✦\s*/, "")} – ${p.role}">${pThumb(p, "kmed")}<b>${p.n.replace(/^✦\s*/, "")}</b><small>${byId[p.r].name}</small></a>`,
    )
    .join("");
}
/* --- AUTOMATICKÉ ODKAZY --- */
const AL = (() => {
  const terms = new Map(),
    esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const add = (t, v) => {
    t = t.replace(/^✦\s*/, "").trim();
    if (t.length < 4 || terms.has(t)) return;
    terms.set(t, v);
  };
  const PAL = {
    "Jiří z Poděbrad": ["Jiřího z Poděbrad", "Jiřímu z Poděbrad", "Jiřím z Poděbrad", "krále Jiřího", "král Jiří", "králi Jiřímu"],
    "Jan Rokycana": ["Jana Rokycanu", "Janem Rokycanou", "Rokycana", "Rokycanou", "Rokycanovi"],
    "Matyáš Korvín": ["Matyáše Korvína", "Matyášem Korvínem", "Matyáši Korvínovi"],
    "Jan Jiskra z Brandýsa": ["Jana Jiskru z Brandýsa", "Jiskra z Brandýsa"],
    "Oldřich II. z Rožmberka": ["Oldřicha II. z Rožmberka", "Oldřich II.", "Oldřicha II."],
    "Zdeněk Konopišťský ze Šternberka": ["Zdeněk ze Šternberka", "Zdeňka ze Šternberka", "Zdeňkem ze Šternberka"],
    "Fridrich III. Habsburský": ["Fridrich III.", "Fridricha III.", "císař Fridrich", "císaře Fridricha"],
    "Albrecht VI. Habsburský": ["Albrecht VI.", "Albrechta VI."],
    "Kazimír IV. Jagellonský": ["Kazimír IV.", "Kazimíra IV."],
    "Eneáš Silvius Piccolomini": ["Piccolomini", "Piccolominiho"],
    "Tas z Boskovic": ["Tase z Boskovic", "Tasem z Boskovic"],
  };
  PEOPLE.forEach(p => {
    const n = p.n.replace(/^✦\s*/, "");
    add(n, {h: "#osoba/" + p.id});
    (PAL[n] || []).forEach(a => add(a, {h: "#osoba/" + p.id}));
  });
  const hForms = s =>
    /ové$/.test(s)
      ? [s, s.slice(0, -3) + "ů", s.slice(0, -3) + "ům", s.slice(0, -3) + "y"]
      : /ští$/.test(s)
        ? [s, s.slice(0, -3) + "ských", s.slice(0, -3) + "ským"]
        : /čtí$/.test(s)
          ? [s, s.slice(0, -3) + "ckých", s.slice(0, -3) + "ckým"]
          : /onci$/.test(s)
            ? [s, s.slice(0, -2) + "ců", s.slice(0, -2) + "cům"]
            : [];
  FAM.forEach(f => {
    add(f.name, {h: "#rod/" + f.id});
    hForms(SHORT[f.id] || "").forEach(x => add(x, {h: "#rod/" + f.id}));
  });
  const CAL = {
    Praha: ["Prahy", "Praze", "Prahu", "Prahou"],
    Plzeň: ["Plzně", "Plzni"],
    "Kutná Hora": ["Kutné Hory", "Kutné Hoře", "Kutnou Horu"],
    Vratislav: ["Vratislavi"],
    Tábor: ["Tábora", "Táboře", "Táborem"],
    Olomouc: ["Olomouce", "Olomouci"],
    Jihlava: ["Jihlavy", "Jihlavě", "Jihlavu"],
    Cheb: ["Chebu", "Chebem"],
    Vídeň: ["Vídně", "Vídni"],
    Krakov: ["Krakova", "Krakově"],
    Budín: ["Budína", "Budíně"],
    Brno: ["Brna", "Brně", "Brnem"],
    Opava: ["Opavy", "Opavě", "Opavu"],
    Kladsko: ["Kladska", "Kladsku"],
    "Hradec Králové": ["Hradce Králové", "Hradci Králové"],
    "České Budějovice": ["Českých Budějovic", "Českých Budějovicích"],
    Poděbrady: ["Poděbrad", "Poděbradech"],
    Znojmo: ["Znojma", "Znojmě"],
    Zhořelec: ["Zhořelce", "Zhořelci"],
    Budyšín: ["Budyšína", "Budyšíně"],
    Lipsko: ["Lipska", "Lipsku"],
    Norimberk: ["Norimberka", "Norimberku"],
    Řezno: ["Řezna", "Řezně"],
    Pasov: ["Pasova", "Pasově"],
    Linec: ["Lince", "Linci"],
    Drážďany: ["Drážďan", "Drážďanech"],
    Poznaň: ["Poznaně", "Poznani"],
    "Český Krumlov": ["Českého Krumlova", "Českém Krumlově"],
    Lehnice: ["Lehnici"],
    Svídnice: ["Svídnici"],
    Litice: ["Liticích"],
    Kunvald: ["Kunvaldu"],
  };
  FAM.forEach(f => {
    if (f.nomap) return;
    f.seats.forEach(sd => {
      const base = sd[0].replace(/\s*\(.*\)$/, "");
      const v = {p: sd[0], f: f.id};
      add(base, v);
      (CAL[base] || []).forEach(a => add(a, v));
    });
  });
  GLOSS.forEach(g =>
    g.f.forEach(x => {
      if (!terms.has(x)) terms.set(x, {h: "#artikule/pojmy/p-" + g.id, g: g.ch});
    }),
  );
  const keys = [...terms.keys()].sort((a, b) => b.length - a.length).map(esc);
  return {terms, re: new RegExp(`(?<![\\p{L}\\p{N}])(${keys.join("|")})(?![\\p{L}\\p{N}])`, "gu")};
})();
const AL_SKIP = ".tnm,.trl,a,button,h1,h2,h3,h4,.crumbs,dt,label,.faith,.svm,.noal,input,select,summary";
function autolink(root, self, filter) {
  if (!root) return;
  const used = new Set();
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (!n.nodeValue.trim() || n.parentElement.closest(AL_SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  let n;
  while ((n = tw.nextNode())) nodes.push(n);
  for (const node of nodes) {
    const s = node.nodeValue;
    AL.re.lastIndex = 0;
    let m,
      last = 0;
    const frag = document.createDocumentFragment();
    while ((m = AL.re.exec(s))) {
      const v = AL.terms.get(m[1]),
        key = v && (v.h || v.p);
      if (!v || v.h === self || used.has(key) || (filter && !filter(v))) continue;
      used.add(key);
      frag.append(s.slice(last, m.index));
      let e;
      if (v.h) {
        e = document.createElement("a");
        e.href = v.h;
        e.className = "al";
      } else {
        e = document.createElement("button");
        e.type = "button";
        e.className = "maplink al";
        e.dataset.id = v.f;
        e.dataset.place = v.p;
      }
      e.textContent = m[1];
      frag.append(e);
      last = m.index + m[1].length;
    }
    if (last) {
      frag.append(s.slice(last));
      node.replaceWith(frag);
    }
  }
}

/* ===== Náhledové kartičky: po najetí na odkaz (nebo prvním ťuknutí) osoba, rod, pojem či plemeno ===== */
{
  const PV = document.createElement("div");
  PV.className = "pvcard";
  PV.hidden = true;
  PV.setAttribute("role", "tooltip");
  document.body.appendChild(PV);
  const SEL = 'a[href^="#osoba/"],a[href^="#rod/"],a[href^="#artikule/pojmy/p-"],a[href^="#draconomicon/"]';
  const SKIP = ".sitenav,.subnav,.aside,.crumbs,.gres,.pvcard,.apn,.gmrow,.gmbar,.tree";
  const kr = (t, n) => {
    t = strip(String(t || ""))
      .replace(/\s+/g, " ")
      .trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
  };
  const obsah = h => {
    const [a, b, c] = decodeURIComponent(h.slice(1)).split("/");
    if (a === "osoba" && PBY[b]) {
      const p = PBY[b],
        f = byId[p.r];
      return `<div class="pvhl">${pThumb(p, "pvimg")}<div><b>${p.n.replace(/^✦\s*/, "")}</b><small>${p.role || ""}</small>${f ? `<small class="pvrod">${f.name}</small>` : ""}</div></div>${p.x ? `<p>${kr(p.x, 170)}</p>` : ""}`;
    }
    if (a === "rod" && byId[b]) {
      const f = byId[b];
      return `<div class="pvhl">${armsImg(f, "pvimg pverb")}<div><b>${f.name}</b><small>${f.land || ""}${f.conf && CONFN[f.conf] ? " · " + CONFN[f.conf] : ""}</small></div></div>${f.head ? `<p>${kr(f.head, 170)}</p>` : ""}`;
    }
    if (a === "artikule" && c && c.startsWith("p-")) {
      const g = GLOSS.find(x => "p-" + x.id === c);
      if (g) return `<div class="pvhl"><div><b>${g.t}</b><small>Slovníček pojmů</small></div></div><p>${kr(g.d, 220)}</p>`;
    }
    if (a === "draconomicon" && DRBY[b] && DRBY[b].k === "pl") {
      const o = DRBY[b].o,
        im = drU(o.img, "-h");
      return `<div class="pvhl">${im ? `<img class="pvimg pvdrak" src="${im}" alt="" loading="lazy">` : ""}<div><b>${o.n}</b><small>${[o.la, o.pd].filter(Boolean).join(" · ")}</small></div></div>`;
    }
    return "";
  };
  /* vypravěč: Skryté / Slyšeli / Potkali přímo v náhledu */
  const gmPas = h => {
    if (!(GMV && STAV) || typeof gmSeg !== "function") return "";
    const [a, b] = decodeURIComponent(h.slice(1)).split("/");
    if (!((a === "osoba" && PBY[b]) || (a === "rod" && byId[b]) || (a === "draconomicon" && gmPl(b)))) return "";
    const w = a === "osoba" && gmLv(PBY[b].r) === 0 ? `<small class="pvwarn">Rod je skrytý – hráči osobu neuvidí.</small>` : "";
    return `<div class="gmrow pvgm" data-gmid="${b}"><span class="lbl">Družina</span>${gmSeg(b)}</div>${w}`;
  };
  let cur = null,
    tm = 0;
  const ukaz = a => {
    const html = obsah(a.getAttribute("href"));
    if (!html) {
      skryj();
      return;
    }
    cur = a;
    const gp = gmPas(a.getAttribute("href"));
    PV.innerHTML = html + gp + (matchMedia("(hover: none)").matches ? `<a class="pvgo" href="${a.getAttribute("href")}">Otevřít →</a>` : "");
    PV.classList.toggle("pvgmon", !!gp);
    PV.hidden = false;
    const r = a.getBoundingClientRect(),
      W = document.documentElement.clientWidth,
      H = innerHeight,
      w = PV.offsetWidth,
      h = PV.offsetHeight;
    let x = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), W - w - 8),
      y = r.bottom + 8;
    if (y + h > H - 8 && r.top - h - 8 > 8) y = r.top - h - 8;
    PV.style.left = x + "px";
    PV.style.top = y + "px";
  };
  const skryj = () => {
    clearTimeout(tm);
    PV.hidden = true;
    cur = null;
  };
  const vhodny = a => a && a.closest(".view") && !a.closest(SKIP) && !a.querySelector("img");
  document.addEventListener("mouseover", e => {
    if (matchMedia("(hover: none)").matches) return;
    const a = e.target.closest(SEL);
    if (!vhodny(a)) {
      if (e.target.closest(".pvcard")) {
        clearTimeout(tm);
        return;
      }
      if (cur) {
        if (PV.classList.contains("pvgmon")) {
          clearTimeout(tm);
          tm = setTimeout(skryj, 400);
        } else skryj();
      }
      return;
    }
    if (a === cur) return;
    clearTimeout(tm);
    tm = setTimeout(() => ukaz(a), 220);
  });
  document.addEventListener(
    "click",
    e => {
      const a = e.target.closest(SEL);
      if (matchMedia("(hover: none)").matches && vhodny(a) && a !== cur && obsah(a.getAttribute("href"))) {
        e.preventDefault();
        e.stopPropagation();
        ukaz(a);
        return;
      }
      if (!e.target.closest(".pvcard")) skryj();
    },
    true,
  );
  addEventListener("hashchange", skryj);
  addEventListener(
    "scroll",
    () => {
      if (cur) skryj();
    },
    {passive: true},
  );
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") skryj();
  });
  document.addEventListener("focusin", e => {
    const a = e.target.closest && e.target.closest(SEL);
    if (vhodny(a) && !matchMedia("(hover: none)").matches) ukaz(a);
  });
}
/* --- HLEDÁNÍ NA CELÉM WEBU --- */
/* rejstřík se sestaví až při prvním hledání (2026-10-25): normalizace textů celého webu stála start stránky ~20 ms na telefonu */
const GIDX = [];
let GIDXH = false;
function gIndex() {
  if (GIDXH) return;
  GIDXH = true;
  /* shrnutí míst (CITYINFO) je v části „mista“ (02g): bez ní se hledá jen ve jménech míst, část se stáhne a rejstřík se sestaví znovu */
  const mista = typeof CITYINFO !== "undefined";
  if (!mista)
    mmLina("mista").then(
      () => {
        if (typeof CITYINFO === "undefined") return;
        GIDX.length = 0;
        GIDXH = false;
        if (!gres.hidden) gSearch();
      },
      () => {},
    );
  FAM.forEach(f =>
    GIDX.push({
      k: "Rod",
      n: f.name,
      s: f.land,
      h: "#rod/" + f.id,
      t: norm(f.name + " " + (SHORT[f.id] || "") + " " + f.head),
      b: norm(f.note + " " + f.stance + " " + (f.hist || "")),
    }),
  );
  PEOPLE.forEach(p =>
    GIDX.push({k: "Osoba", n: p.n.replace(/^✦\s*/, ""), s: p.role, h: "#osoba/" + p.id, t: norm(p.n + " " + p.role), b: norm(p.x)}),
  );
  const seen = new Set();
  FAM.forEach(f => {
    if (f.nomap) return;
    f.seats.forEach(sd => {
      if (seen.has(sd[0])) return;
      seen.add(sd[0]);
      const ci = mista ? mistoInfo(sd[0]) : {};
      GIDX.push({k: f.city ? "Město" : f.castle ? "Hrad" : "Sídlo", n: sd[0], s: f.name, place: [f.id, sd[0]], t: norm(sd[0]), b: norm(ci.n || "")});
    });
  });
  DUCHY.forEach(u => GIDX.push({k: "Země", n: u.name, s: u.s, duchy: u.id, t: norm(u.name + " " + u.s), b: norm(u.note)}));
  DIO.forEach(d => GIDX.push({k: "Diecéze", n: d.name, s: "církevní správa", dio: d.id, t: norm(d.name), b: norm(d.note)}));
  ARTK.forEach(k =>
    k.secs.forEach(s => GIDX.push({k: "Artikule", n: s.t, s: k.t, h: `#artikule/${k.id}/${s.id}`, t: norm(s.t + " " + k.t), b: norm(strip(s.h))})),
  );
  (DRACI.kap || []).forEach(k =>
    GIDX.push({k: "Draconomicon", n: k.t, s: "Draconomicon", h: "#draconomicon", t: norm(k.t), b: norm(k.h.replace(/<[^>]+>/g, " "))}),
  );
  (DRACI.pl || []).forEach(p =>
    GIDX.push({
      k: "Draconomicon",
      n: p.n,
      s: [p.la, p.pd].filter(Boolean).join(" · "),
      h: "#draconomicon/" + p.id,
      t: norm(p.n + " " + p.j + " " + p.la),
      b: norm(p.h.replace(/<[^>]+>/g, " ")),
    }),
  );
  SVET.forEach(s => GIDX.push({k: "Svět", n: s.n, s: s.v, h: "#svet/" + s.id, t: norm(s.n + " " + s.k), b: norm(s.x + " " + s.v + " " + s.s)}));
  PRAHA_PLACES.forEach(p =>
    GIDX.push({k: "Praha", n: p.name, s: PRAHA_TOWNS.find(x => x.id === p.t).n, h: "#praha/" + p.n, t: norm(p.name), b: norm(p.d)}),
  );
  GLOSS.forEach(g =>
    GIDX.push({
      k: "Pojem",
      n: g.t,
      s: g.d.replace(/<[^>]+>/g, "").slice(0, 70) + "…",
      h: "#artikule/pojmy/p-" + g.id,
      t: norm(g.t + " " + g.f.join(" ")),
      b: norm(g.d),
    }),
  );
  ZAPISY.forEach(z =>
    GIDX.push({k: "Kronika", n: z.title, s: z.n + " · " + z.date, h: "#kronika/" + z.id, t: norm(z.title + " " + z.place), b: norm(strip(z.text))}),
  );
  TRAKTATY.forEach(t =>
    GIDX.push({k: "Traktát", n: t.t, s: "Kronika · traktáty", h: "#kronika/clanky/" + t.id, t: norm(t.t), b: norm(strip(t.h || ""))}),
  );
  PARTY.forEach(p =>
    GIDX.push({k: "Družina", n: p.n, s: p.epi || "", h: "#druzina/" + p.id, t: norm(p.n + " " + (p.epi || "")), b: norm(strip(p.x || ""))}),
  );
  document.querySelectorAll("#letopis dt").forEach(dt => {
    const dd = dt.nextElementSibling;
    GIDX.push({
      k: "Letopis",
      n: dt.textContent,
      s: dd.textContent.slice(0, 70) + "…",
      h: "#kronika/letopis",
      t: norm(dt.textContent),
      b: norm(dd.textContent),
    });
  });
}
const gq = document.getElementById("gq"),
  gres = document.getElementById("gres");
function gSearch() {
  const q = norm(gq.value.trim());
  if (q.length < 2) {
    gres.hidden = true;
    gres.innerHTML = "";
    return;
  }
  gIndex();
  const ws = q.split(/\s+/);
  const hits = GIDX.map(r => {
    const inT = ws.every(w => r.t.includes(w)),
      inA = inT || ws.every(w => (r.t + " " + r.b).includes(w));
    return inA ? {r, sc: (inT ? 4 : 1) + (norm(r.n).startsWith(q) ? 3 : 0) + (norm(r.n).includes(q) ? 1 : 0)} : null;
  })
    .filter(Boolean)
    .sort((a, b) => b.sc - a.sc)
    .slice(0, 14);
  /* pravidla (SRD, stavy, kouzla, předměty, vybavení) z rejstříku 10h – až je načtená část hry; jinak se doplní po načtení */
  const pr = typeof hlGlobal === "function" ? hlGlobal(gq.value, gSearch) : "";
  gres.innerHTML =
    hits.length || pr
      ? hits
          .map(({r}) => {
            const inner = `<span class="gk">${r.k}</span><b>${r.n}</b><small>${r.s}</small>`;
            return `<li>${r.h ? `<a href="${r.h}">${inner}</a>` : r.place ? `<button type="button" class="maplink" data-id="${r.place[0]}" data-place="${r.place[1]}">${inner}</button>` : r.duchy ? `<button type="button" data-gduchy="${r.duchy}">${inner}</button>` : `<button type="button" data-gdio="${r.dio}">${inner}</button>`}</li>`;
          })
          .join("") + pr
      : `<li class="none">Nic nenalezeno.</li>`;
  gres.hidden = false;
}
/* hledání v pravidlech potřebuje část hry: načte se, jakmile se do pole klikne */
gq.addEventListener("focus", () => {
  mmLina("hra")
    .then(() => {
      if (typeof hlIndex === "function") return hlIndex();
    })
    .then(() => {
      if (gq.value.trim().length >= 2 && document.activeElement === gq) gSearch();
    })
    .catch(() => {});
});
/* klávesa / skočí do hledání (mimo psaní do pole) */
document.addEventListener("keydown", e => {
  if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
  const a = document.activeElement;
  if (a && (a.isContentEditable || /^(input|textarea|select)$/i.test(a.tagName))) return;
  if (!gq.offsetParent) return;
  e.preventDefault();
  gq.focus();
});
gq.addEventListener("input", gSearch);
gq.addEventListener("keydown", e => {
  const f = gres.querySelector("a,button");
  if (e.key === "Enter" && f) {
    e.preventDefault();
    f.click();
  }
  if (e.key === "ArrowDown" && f) {
    e.preventDefault();
    f.focus();
  }
  if (e.key === "Escape") {
    gres.hidden = true;
  }
});
gres.addEventListener("keydown", e => {
  const bs = [...gres.querySelectorAll("a,button")],
    i = bs.indexOf(document.activeElement);
  if (e.key === "ArrowDown" && i < bs.length - 1) {
    e.preventDefault();
    bs[i + 1].focus();
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    (i > 0 ? bs[i - 1] : gq).focus();
  }
  if (e.key === "Escape") {
    gres.hidden = true;
    gq.focus();
  }
});
gres.addEventListener("click", e => {
  const hl = e.target.closest("[data-ghl]");
  if (hl && typeof hlOkno === "function") hlOkno(+hl.dataset.ghl);
  const d = e.target.closest("[data-gduchy],[data-gdio]");
  if (d) {
    const isD = !!d.dataset.gduchy;
    navTo("#mapa");
    const want = isD ? "duchy" : "dio",
      other = isD ? "dio" : "duchy";
    if (!st[want]) document.getElementById(isD ? "lyDuchy" : "lyDio").click();
    const u = isD ? DUCHY.find(x => x.id === d.dataset.gduchy) : DIO.find(x => x.id === d.dataset.gdio);
    const [x, y] = P(...(isD ? u.lab : u.seat));
    mapCenter(x, y, isD && u.dom ? 260 : 420);
    document.getElementById("mapa").scrollIntoView({block: "start"});
  }
  setTimeout(() => {
    gres.hidden = true;
    gq.value = "";
  }, 0);
});
document.addEventListener("click", e => {
  if (!e.target.closest(".gsearch")) gres.hidden = true;
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-partymap]");
  if (!b) return;
  navTo("#mapa");
  if (!st.party) document.getElementById("lyParty").click();
  const z = ZBY[b.dataset.partymap],
    p = z && placeBy(z.place);
  if (p) {
    const [x, y] = P(p.lo, p.la);
    mapCenter(x, y, 300);
  }
});
