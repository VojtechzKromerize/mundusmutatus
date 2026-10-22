/* ---------- site navigation: views, house and person articles ---------- */
const VIEWS = [
  "hra",
  "uvod",
  "svet",
  "mapa",
  "praha",
  "desky",
  "druzina",
  "artikule",
  "draconomicon",
  "kronika",
  "gm",
  "boj",
  "vyprava",
  "kouzla",
  "karty",
  "pravidla",
  "sezeni",
];
const SUBT = {
  hra: "Hra · sezení",
  svet: "Známý svět · mocnosti léta Páně 1458",
  praha: "Praha · čtyři města pražská",
  uvod: "Úvodem",
  mapa: "Koruna česká k 3. březnu léta Páně 1458",
  desky: "Rody a panstvo",
  artikule: "Pravidla",
  druzina: "Hrdinové",
  draconomicon: "O dracích",
  kronika: "Kronika Vojtěcha z Kroměříže",
  gm: "Vypravěč · odhalování",
  boj: "Boj · sloty iniciativy",
  vyprava: "Výprava · cesta družiny",
};
const TITL = {
  hra: "Hra",
  sezeni: "Příprava sezení",
  karty: "Karty postav",
  pravidla: "Pravidla (SRD 5.2.1 česky)",
  svet: "Známý svět",
  praha: "Praha",
  mapa: "Koruna česká k 3. březnu léta Páně 1458",
  desky: "Zemské desky",
  artikule: "Artikule tažení",
  druzina: "Družina",
  draconomicon: "Draconomicon",
  kronika: "Kronika Vojtěcha z Kroměříže",
  gm: "Vypravěč",
  boj: "Boj",
  vyprava: "Výprava",
};
let curView = null;
function navTo(h) {
  if (location.hash !== h) history.pushState(null, "", h);
  route();
}
function maplinkBtn(f, sd) {
  if (f.nomap) {
    const c = SVETMESTA.find(x => x[0] === sd[0]),
      w = c && SVET.find(z => z.s && z.s.includes(sd[0]));
    return w ? `<a href="#svet/${w.id}">${sd[0]}</a>` : sd[0];
  }
  return `<button type="button" class="maplink" data-id="${f.id}" data-place="${sd[0]}">${f.city && CARMS[sd[0]] ? `<img class="cmini" src="${CARMS[sd[0]]}" alt="">` : ""}${sd[0]}</button>`;
}
function renderRodArticle(id) {
  const f = byId[id],
    rels = relsFor(id),
    ppl = peopleOf(id),
    art = document.getElementById("article");
  art.innerHTML = `<nav class="crumbs"><a href="#desky">Zemské desky</a> › ${f.nbr ? `<a href="#desky/sousede">Zahraniční rody</a> › ${f.land}` : f.land} › <b>${f.name}</b></nav>
   <div class="artgrid"><div class="artmain">
     <h2 class="arttitle">${f.name}</h2>
     <p class="artlead">${f.head}</p>
     ${
       f.sl
         ? `${f.hist ? `<h3>${HISTH(f)}</h3><p>${f.hist}</p>` : ""}<p class="slnote">O tomto rodu družina zatím jen slyšela. Víc se dozví, až se s ním setká.</p>`
         : `<h3>${f.nbr ? "Postoj ke Koruně" : "Postoj k Jiřímu"}</h3><p>${f.stance}</p>
     ${f.hist ? `<h3>${HISTH(f)}</h3><p>${f.hist}</p>` : ""}
     <h3>Zápis kronikáře</h3><p class="kron">${f.note}</p>`
     }
     ${rels.length ? `<h3 class="hcent">Vazby</h3><div class="relcol3">${relGroups(rels, id, false)}</div>` : ""}
     ${TREES[id] || TREES[TREEALIAS[id]] ? `<h3 class="hcent">Rodokmen</h3>${treeHTML(TREES[id] ? id : TREEALIAS[id])}` : ""}
   </div>
   <aside class="infobox">
     <div class="ibshield">${ARMS[f.id] ? armsImg(f, "armbig") : shield0(f).replace('class="shield"', 'class="bigshield"')}</div>
     <dl class="kv"><dt>Vyznání</dt><dd>${faith(f.conf)}</dd>
     ${f.pos ? `<dt>Postavení</dt><dd>${POSL(f.pos)}</dd>` : ""}
     <dt>Země</dt><dd>${f.land}</dd>
     ${f.seats.length ? `<dt>${f.city ? "Města" : "Državy"}</dt><dd>${f.seats.map(sd => maplinkBtn(f, sd)).join(", ")}</dd>` : ""}
     ${ppl.length ? `<dt>Osoby</dt><dd>${ppl.map(plinkP).join(", ")}</dd>` : ""}
     ${PRAHA_PLACES.some(q => q.r === id) ? `<dt>V Praze</dt><dd>${prLinks(PRAHA_PLACES.filter(q => q.r === id))}</dd>` : ""}</dl>
     ${
       ppl.some(p => PORTR.has(p.id))
         ? `<div class="rodppl">${ppl
             .filter(p => PORTR.has(p.id))
             .map(p => `<a href="#osoba/${p.id}">${pThumb(p)}<span>${p.n.replace(/^✦\s*/, "")}</span></a>`)
             .join("")}</div>`
         : ""
     }
     ${f.nomap ? "" : `<button type="button" class="gbtn" data-showmap="${id}">Ukázat na mapě</button>`}
   </aside></div>`;
}
const PORTRH = /*@PORTR@*/ {};
const PORTR = new Set(Object.keys(PORTRH));
const portU = (id, m) => {
  const v = PORTRH[id];
  return v && typeof v === "object" ? (m && m !== "s" ? v.m : v.f) || v.f || v.m : "art/portrety/" + v + (m === "s" ? "-s" : m ? "-m" : "") + ".webp";
};
/* portrét v článku: menší verze pro běžné obrazovky, plná pro husté displeje (nahrané obrázky mají jen jednu velikost) */
const portSet = id =>
  typeof PORTRH[id] === "string" ? ` srcset="${portU(id, "s")} 300w, ${portU(id)} 600w" sizes="(max-width:820px) min(280px,70vw), 270px"` : "";
const silKind = p => {
  const r = p.role || "",
    f = byId[p.r] || {};
  if (/biskup|arcibiskup|kněz|kanovník|probošt|opat|kazatel|administrátor|papež|kardinál|mnich|řeholník|farář|děkan|teolog/i.test(r)) return "cirkev";
  if (/manželka|dcera|vdova|sestra|matka|paní |kněžna|abatyše|choť|vévodkyně|královna|hraběnka|chotí/i.test(r)) return "pani";
  if (f.city || /měšťan|purkmistr|konšel|primas|rychtář|kupec|myslitel|spisovatel|písař|mistr univerzity/i.test(r)) return "mestan";
  if (/rytíř|hejtman|vojevůdce|žoldnéř|bratřík|kapitán|purkrabí|vladyka|zeman|velitel/i.test(r)) return "rytir";
  return "pan";
};
const pThumb = (p, cls) =>
  PORTR.has(p.id)
    ? `<img class="${cls || "pthumb"}" src="${portU(p.id, 1)}" alt="" loading="lazy">`
    : `<img class="${cls || "pthumb"} psil" src="art/img/silueta-${silKind(p)}.webp" alt="" loading="lazy">`;
function renderPersonArticle(pid) {
  const p = PBY[pid],
    f = byId[p.r],
    art = document.getElementById("article");
  const sd = p.seat && f.seats.find(x => x[0] === p.seat);
  const kin = peopleOf(p.r).filter(q => q.id !== pid);
  art.innerHTML = `<nav class="crumbs"><a href="#desky">Zemské desky</a> › <a href="#desky/osoby">Matriky</a> › <b>${p.n}</b></nav>
   <div class="artgrid pgrid"><div class="artmain">
     <h2 class="arttitle">${p.n}</h2>
     <p class="artlead">${p.role}</p>
     ${p.sl ? `<p class="slnote">O této osobě družina zatím jen slyšela.</p>` : `<p class="kron">${p.x}</p>`}
     ${!p.sl && p.sh ? `<h3>Dosavadní život</h3><p class="psh">${p.sh}</p>` : ""}
     ${GMV && RESBY[pid] ? resersGM(RESBY[pid]) : ""}
     ${GMV && typeof OSPROT !== "undefined" && OSPROT[pid] ? bojOsobaGM(pid) : ""}
     ${kin.length ? `<h3>Z téhož rodu či dvora</h3><p>${kin.map(plinkP).join(", ")}</p>` : ""}
   </div>
   <aside class="infobox">
     ${PORTR.has(pid) ? `<a class="portr" href="${portU(pid)}" target="_blank" rel="noopener" title="Otevřít portrét v plné velikosti"><img src="${portU(pid)}"${portSet(pid)} alt="Portrét: ${p.n}" width="600" height="1500"></a>` : `<img class="psilbig" src="art/img/silueta-${silKind(p)}.webp" alt="" width="160" height="160">`}
     <dl class="kv"><dt>Rod</dt><dd><a href="#rod/${f.id}">${f.name}</a></dd>
     <dt>Postavení</dt><dd>${p.role}</dd>
     ${vekPostavy(p.nar) ? `<dt>Věk</dt><dd class="pvek">${vekPostavy(p.nar)}</dd>` : ""}
     ${sd ? `<dt>Sídlo</dt><dd>${maplinkBtn(f, sd)}</dd>` : ""}
     ${PRAHA_PLACES.some(q => q.p === pid) ? `<dt>V Praze</dt><dd>${prLinks(PRAHA_PLACES.filter(q => q.p === pid))}</dd>` : ""}
     <dt>Vyznání rodu</dt><dd>${faith(f.conf)}</dd></dl>
   </aside></div>`;
}
/* vypravěčská sekce rešerše: osud po březnu 1458 a podklady (jistota, rozpory, zdroje) */
function resersGM(r) {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[c]);
  const um = r.um ? (/^\d{4}-\d{2}-\d{2}$/.test(r.um) ? (([y, m, d]) => `${+d}. ${MES[+m - 1]} ${y}`)(r.um.split("-")) : r.um) : "";
  const zdr =
    r.zdr && r.zdr.length
      ? r.zdr
          .map(u => {
            let h = u;
            try {
              h = new URL(u).hostname.replace(/^www\./i, "");
            } catch (e) {}
            return `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(h)}</a>`;
          })
          .join(", ")
      : "";
  return `<details class="gmres"><summary>Po březnu 1458 <span>jen pro vypravěče</span></summary>
    ${r.po ? `<p>${esc(r.po)}</p>` : `<p class="gmresnic">O dalších osudech rešerše nic nezjistila.</p>`}
    ${um ? `<p class="gmresum">Úmrtí: ${um}</p>` : ""}
    <dl class="gmresmeta">${r.jis ? `<dt>Jistota</dt><dd>${esc(r.jis)}</dd>` : ""}${r.zak ? `<dt>Základ odhadu</dt><dd>${esc(r.zak)}</dd>` : ""}${r.roz ? `<dt>Rozpor s webem</dt><dd>${esc(r.roz)}</dd>` : ""}${zdr ? `<dt>Zdroje</dt><dd>${zdr}</dd>` : ""}</dl></details>`;
}
function renderOsoby() {
  const box = document.getElementById("osobylist");
  if (box.dataset.done) return;
  box.dataset.done = 1;
  const groups = [
    ["Čechy", f => !f.nbr && (f.land === "Čechy" || f.land === "Královská města")],
    ["Morava", f => !f.nbr && f.land === "Morava"],
    ["Slezsko", f => !f.nbr && f.land === "Slezsko"],
    ["Lužice", f => !f.nbr && f.land === "Lužice"],
    ["Duchovenstvo", f => !f.nbr && f.land === "Duchovenstvo"],
    ...NBR_LANDS.map(L => [L, f => f.nbr && f.land === L]),
  ];
  box.innerHTML =
    groups
      .map(([L, fn]) => {
        const ps = PEOPLE.filter(p => fn(byId[p.r])).sort((a, b) => PORTR.has(b.id) - PORTR.has(a.id));
        if (!ps.length) return "";
        return `<div class="land-sec"><h3 class="landh">${L.toUpperCase()}</h3><div class="pcards">${ps.map(p => `<a class="pcard hasp${PORTR.has(p.id) ? "" : " nop"}" href="#osoba/${p.id}">${pThumb(p)}<span class="pct"><b>${p.n}</b><span>${p.role}</span><small>${byId[p.r].name}</small></span></a>`).join("")}</div></div>`;
      })
      .join("") || `<div class="placeholder"><p>Družina zatím nikoho z panstva nepotkala ani o nikom neslyšela.</p></div>`;
}
const SRDKAP = [
  ["hrani", "Hraní hry"],
  ["tvorba", "Tvorba postavy"],
  ["povolani", "Povolání"],
  ["puvod", "Původ a featy"],
  ["vybava", "Výbava"],
  ["kouzleni", "Sesílání kouzel"],
  ["glosar", "Glosář pravidel"],
  ["nastroje", "Nástroje vypravěče"],
  ["predmety", "Magické předměty"],
];
{
  const l = document.getElementById("navartl");
  if (l)
    l.innerHTML =
      ARTB.filter(b => b.id !== "rejstrik")
        .map(
          b =>
            `<span class="svsep" aria-hidden="true">${b.n}</span>` +
            ARTK.filter(k => k.book === b.id)
              .map(k => `<a href="#artikule/${k.id}">${k.t}</a>`)
              .join(""),
        )
        .join("") +
      `<span class="svsep" aria-hidden="true">Pravidla SRD 5.2.1 česky</span>` +
      SRDKAP.map(([id, n]) => `<a href="#pravidla/${id}">${n}</a>`).join("");
}
document.querySelectorAll(".navdd").forEach(dd => {
  const top = dd.querySelector(".ddtop");
  top.addEventListener("click", e => {
    if (matchMedia("(hover: none)").matches && !matchMedia("(max-width:640px)").matches && !dd.classList.contains("open")) {
      e.preventDefault();
      document.querySelectorAll(".navdd.open").forEach(o => {
        o.classList.remove("open");
        o.querySelector(".ddtop").setAttribute("aria-expanded", "false");
      });
      dd.classList.add("open");
      top.setAttribute("aria-expanded", "true");
    }
  });
  document.addEventListener("click", e => {
    if (!dd.contains(e.target)) {
      dd.classList.remove("open");
      top.setAttribute("aria-expanded", "false");
    }
  });
  dd.addEventListener("mouseenter", () => top.setAttribute("aria-expanded", "true"));
  dd.addEventListener("mouseleave", () => top.setAttribute("aria-expanded", "false"));
  /* nabídka nesmí přetéct přes okraj okna: před otevřením ji případně posuneme do strany */
  const sv = dd.querySelector(".svitek"),
    dosad = () => {
      if (matchMedia("(max-width:640px)").matches) {
        sv.style.left = "";
        return;
      }
      sv.style.left = "";
      const r = sv.getBoundingClientRect(),
        W = document.documentElement.clientWidth;
      let dx = 0;
      if (r.right > W - 6) dx = W - 6 - r.right;
      if (r.left + dx < 6) dx = 6 - r.left;
      if (dx) sv.style.left = `calc(50% + ${Math.round(dx)}px)`;
    };
  ["mouseenter", "focusin", "touchstart"].forEach(t => dd.addEventListener(t, dosad, {passive: true}));
});
/* podnabídky Zemských desek a Kroniky se ukazují i na mapách a u Družiny */
{
  const dn = document.querySelector('[data-view="desky"] .deskhead .subnav');
  document.querySelectorAll(".dhkopie").forEach(x => x.appendChild(dn.cloneNode(true)));
  const kn = document.querySelector('[data-view="kronika"]>.subnav');
  document.querySelectorAll(".khkopie").forEach(x => x.replaceWith(kn.cloneNode(true)));
}
/* zvýraznění položek v rozbalovacích nabídkách podle aktivní podnabídky */
function navSync() {
  const on = new Set(
    [...document.querySelectorAll(".view:not([hidden]) .subnav a.on, .view:not([hidden]) #artside a.on")].map(a => a.getAttribute("href")),
  );
  document.querySelectorAll(".svlist a").forEach(a => a.classList.toggle("on", on.has(a.getAttribute("href"))));
  document.querySelectorAll(".view:not([hidden]) .subnav").forEach(n => {
    const o = n.querySelector("a.on");
    if (o && n.scrollWidth > n.clientWidth) n.scrollLeft = Math.max(0, o.offsetLeft - n.offsetLeft - 16);
  });
}
/* panely Vrstvy na mapách */
document.querySelectorAll(".lyrbtn").forEach(b => {
  const p = document.getElementById(b.getAttribute("aria-controls"));
  const set = o => {
    p.hidden = !o;
    b.setAttribute("aria-expanded", o);
  };
  b.addEventListener("click", e => {
    e.stopPropagation();
    set(p.hidden);
  });
  document.addEventListener("pointerdown", e => {
    if (!p.hidden && !p.contains(e.target) && e.target !== b) set(false);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !p.hidden) {
      set(false);
      b.focus();
    }
  });
  const def = [...p.querySelectorAll("button[aria-pressed]")].map(x => x.getAttribute("aria-pressed"));
  const sel = p.querySelector("select");
  const chk = () =>
    b.classList.toggle(
      "dirty",
      [...p.querySelectorAll("button[aria-pressed]")].some((x, i) => x.getAttribute("aria-pressed") !== def[i]) || !!(sel && sel.value),
    );
  new MutationObserver(chk).observe(p, {attributes: true, subtree: true, attributeFilter: ["aria-pressed"]});
  if (sel) sel.addEventListener("change", chk);
});
{
  const nav = document.getElementById("sitenav"),
    tg = document.getElementById("navtoggle"),
    logo = document.querySelector("header.site .logo");
  tg.addEventListener("click", () => {
    const o = nav.classList.toggle("open");
    tg.setAttribute("aria-expanded", o);
  });
  document.addEventListener("click", e => {
    if (!nav.contains(e.target) && nav.classList.contains("open")) {
      nav.classList.remove("open");
      tg.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      tg.setAttribute("aria-expanded", "false");
      tg.focus();
    }
  });
  if ("IntersectionObserver" in window)
    new IntersectionObserver(([en]) => nav.classList.toggle("stuck", !en.isIntersecting), {threshold: 0}).observe(logo);
}
/* ===== Pravidla: český překlad SRD 5.2.1 s poznámkami Artikulí (art/pravidla.json, načte se až při otevření) ===== */
let SRDP = null,
  SRDPP = null;
const srdNacti = () =>
  SRDP
    ? Promise.resolve(SRDP)
    : (SRDPP =
        SRDPP ||
        fetch("art/pravidla.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(j => (SRDP = j))
          .catch(e => {
            SRDPP = null;
            throw e;
          }));
/* Doplňky mimo SRD: podtřídy podle povolání, featy podle druhu, zázemí, druhy a kouzla (vlastní shrnutí mechaniky) */
const MIMOKAT = {origin: "Featy původu", general: "Obecné featy", fightStyle: "Bojové styly", epic: "Epická požehnání"};
function renderMimo(main, c) {
  if (!MIMO) {
    main.innerHTML = `<p class="rsmall">Načítám…</p>`;
    Promise.all([mimoNacti(), kSpNacti().catch(() => {})]).then(j => {
      if (curView === "pravidla") renderMimo(main, c);
    });
    return;
  }
  if (!KSPD) {
    kSpNacti()
      .then(() => {
        if (curView === "pravidla") renderMimo(main, c);
      })
      .catch(() => {});
  }
  const rys = (r, m) =>
    `<li id="mimo-${besc(slugMimo(r.en))}"><b>${besc(r.cz || r.en)}</b> <small lang="en">${besc(r.en)}</small>${(() => {
      const t = mimoMeta({r, typ: m, o: {}}, null);
      return t ? ` <small>· ${besc(t)}</small>` : "";
    })()}<br>${kzIn(r.t || "")}</li>`;
  const tr = {};
  (MIMO.podtridy || []).forEach(p => (tr[p.tr] = tr[p.tr] || []).push(p));
  const kat = {};
  (MIMO.featy || []).forEach(f => (kat[f.kat] = kat[f.kat] || []).push(f));
  const sp = KSPD
    ? Object.values(KSPD)
        .filter(x => x.x)
        .sort((a, b) => a.l - b.l || a.en.localeCompare(b.en))
    : [];
  const toc = [
    ["podtridy", "Podtřídy"],
    ["featy", "Featy"],
    ["zazemi", "Zázemí"],
    ["druhy", "Druhy"],
    ["kouzla", "Kouzla"],
  ];
  main.innerHTML = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>Doplňky mimo SRD</b></nav><h2 class="arttitle">Doplňky mimo SRD</h2>
  <p class="intro">Podtřídy, featy, zázemí, druh a kouzla z D&amp;D 2024, které nejsou v SRD 5.2.1. Každá položka je stručné shrnutí mechaniky vlastními slovy – stačí pro hru a pro výpočty na kartě, plné znění je v příručce nebo na listu postavy z D&amp;D Beyond. Artikule platí přednostně i tady.</p>
  <p class="rsmall">${toc.map(([id, n]) => `<a href="#pravidla/mimo/mimo-${id}">${n}</a>`).join(" · ")}</p>
  <h3 class="uvh2" id="mimo-podtridy">Podtřídy</h3>${Object.keys(KTR)
    .filter(k => tr[k])
    .map(
      k =>
        `<h4>${besc(KTR[k].cz)}</h4>${tr[k].map(p => `<details class="bjapd" id="mimo-${besc(p.id)}"><summary><b>${besc(p.cz || p.en)}</b> <small lang="en">${besc(p.en)}</small></summary><p>${besc(p.t || "")}</p><ul class="kfeat">${(p.rysy || []).map(r => rys(r, "rys")).join("")}</ul></details>`).join("")}`,
    )
    .join("")}
  <h3 class="uvh2" id="mimo-featy">Featy</h3>${Object.keys(MIMOKAT)
    .filter(k => kat[k])
    .map(
      k =>
        `<h4>${MIMOKAT[k]}</h4><ul class="kfeat">${kat[k]
          .map(
            f =>
              `<li id="mimo-${besc(slugMimo(f.en))}"><b>${besc(f.cz || f.en)}</b> <small lang="en">${besc(f.en)}</small>${f.pred ? ` <small>· předpoklad: ${besc(f.pred)}</small>` : ""}${f.vl && f.vl.length ? ` <small>· +1 ${besc(f.vl.join("/"))}</small>` : ""}${(() => {
                const t = mimoMeta({r: f, typ: "feat", o: {}}, null);
                return t ? ` <small>· ${besc(t)}</small>` : "";
              })()}<br>${kzIn(f.t || "")}</li>`,
          )
          .join("")}</ul>`,
    )
    .join("")}
  <h3 class="uvh2" id="mimo-zazemi">Zázemí</h3><ul class="kfeat">${(MIMO.zazemi || []).map(z => `<li><b>${besc(z.cz || z.en)}</b> <small lang="en">${besc(z.en)}</small><br>${z.t ? besc(z.t) + "<br>" : ""}<small>Vlastnosti ${besc((z.vl || []).join(", "))} · feat ${besc(z.feat || "")} · dovednosti ${besc((z.dov || []).join(", "))}${z.nastroj ? ` · nástroj: ${besc(z.nastroj)}` : ""}${z.vybava ? ` · výbava: ${besc(z.vybava)}` : ""}</small></li>`).join("")}</ul>
  <h3 class="uvh2" id="mimo-druhy">Druhy</h3>${(MIMO.druhy || []).map(d => `<h4>${besc(d.cz || d.en)}</h4><p>${besc(d.t || "")} <small>Rychlost ${d.rych} stop · velikost ${besc(d.vel || "")}</small></p><ul class="kfeat">${(d.rysy || []).map(r => rys(r, "druh")).join("")}</ul>`).join("")}
  <h3 class="uvh2" id="mimo-kouzla">Kouzla</h3>${sp.length ? `<ul class="kfeat">${sp.map(x => `<li><details><summary><b>${besc(x.cz || x.en)}</b> <small lang="en">${besc(x.en)}</small> <small>· ${kzUr(x.l)} · ${besc((x.p || []).join(", "))}</small></summary>${kSpPopis({n: x.en})}</details></li>`).join("")}</ul>` : `<p class="rsmall">Načítám kouzla…</p>`}
  <p class="rsmall srdattr">${besc(MIMOPOZN)}</p>`;
  const el = c && document.getElementById(c);
  if (el) {
    if (el.tagName === "DETAILS") el.open = true;
    el.scrollIntoView({block: "start"});
  } else window.scrollTo(0, 0);
}
const slugMimo = s =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
function renderPravidla(b, c) {
  const side = document.getElementById("srdside"),
    main = document.getElementById("srdmain");
  if (!side || !main) return;
  if (!SRDP) {
    main.innerHTML = `<p class="rsmall">Načítám pravidla…</p>`;
    srdNacti().then(
      () => {
        if (curView === "pravidla") renderPravidla(b, c);
      },
      () => {
        main.innerHTML = `<p class="intro">Pravidla se nepodařilo načíst.</p>`;
      },
    );
    return;
  }
  const K = SRDP.kap.find(k => k.id === b);
  side.innerHTML = `<nav class="atoc srdtoc" aria-label="Obsah pravidel"><a class="atop${K || b === "predmety" || b === "netvori" || b === "mimo" || b === "vybaveni" ? "" : " on"}" href="#pravidla">Úvod</a>${SRDP.kap
    .map(
      k =>
        `<p class="abook"><a href="#pravidla/${k.id}"${K && K.id === k.id ? ' class="on"' : ""}>${k.n}</a></p>${
          K && K.id === k.id
            ? `<ol>${k.toc
                .filter(t => t.l <= (k.id === "glosar" ? 2 : 1))
                .map(t => `<li class="srdl${t.l}"><a href="#pravidla/${k.id}/${t.id}">${besc(t.n)}</a></li>`)
                .join("")}</ol>`
            : ""
        }`,
    )
    .join(
      "",
    )}<p class="abook"><a href="#pravidla/predmety"${b === "predmety" ? ' class="on"' : ""}>Magické předměty</a></p><p class="abook"><a href="#pravidla/vybaveni"${b === "vybaveni" ? ' class="on"' : ""}>Vybavení</a></p><p class="abook"><a href="#pravidla/mimo"${b === "mimo" ? ' class="on"' : ""}>Doplňky mimo SRD</a></p>${GMV ? `<p class="abook"><a href="#pravidla/netvori"${b === "netvori" ? ' class="on"' : ""}>Nestvůry a zvířata</a></p>` : ""}</nav>`;
  if (b === "mimo") {
    renderMimo(main, c);
    return;
  }
  if (b === "vybaveni") {
    if (typeof renderVybaveni === "function") renderVybaveni(main, c);
    else main.innerHTML = `<p class="rsmall">Načítám…</p>`;
    return;
  }
  if (b === "predmety") {
    renderPredmety(main);
    window.scrollTo(0, 0);
    return;
  }
  if (b === "netvori") {
    renderNetvori(main);
    window.scrollTo(0, 0);
    return;
  }
  if (!K) {
    main.innerHTML = `<h2 class="arttitle">Pravidla</h2><p class="intro">Základní pravidla D&amp;D 2024 podle System Reference Document 5.2.1, přeložená do češtiny. Kde Mundus Mutatus hraje jinak, stojí u pravidla rámeček <b>Artikule</b> – ten platí přednostně. Celá domácí pravidla jsou v <a href="#artikule">Artikulích</a>.</p>
    <ul class="srdkap">${SRDP.kap.map(k => `<li><a href="#pravidla/${k.id}"><b>${k.n}</b><small>${besc(k.p)}</small></a></li>`).join("")}<li><a href="#pravidla/predmety"><b>Magické předměty</b><small>lektvary, prsteny, zbraně a divotvorné předměty s českým popisem</small></a></li><li><a href="#pravidla/vybaveni"><b>Vybavení</b><small>zbroj, zbraně, výbava, nářadí, zvířata, doprava, jedy a magické předměty s cenami – i do vybavení postavy</small></a></li><li><a href="#pravidla/mimo"><b>Doplňky mimo SRD</b><small>další podtřídy, featy, zázemí, Aasimar a kouzla – stručně vlastními slovy</small></a></li>${GMV ? `<li><a href="#pravidla/netvori"><b>Nestvůry a zvířata</b><small>statistiky SRD pro bestiář a Boj (jen vypravěč)</small></a></li>` : ""}</ul>
    <p class="rsmall">Kouzla SRD česky má vypravěč v části Kouzla; hráči je vidí u kouzel na své kartě.</p>
    <p class="rsmall srdattr">${besc(SRDP.attr)} Překlad do češtiny a doplnění pravidly Artikulí: Mundus Mutatus. Kompatibilní s 5. edicí (5E compatible).</p>
    <p class="rsmall srdattr" lang="en">${besc(SRDP.attr_en)}</p>`;
    window.scrollTo(0, 0);
    return;
  }
  main.innerHTML = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>${K.n}</b></nav><h2 class="arttitle">${K.n}</h2><div class="srdtext">${K.h}</div><p class="rsmall srdattr">${besc(SRDP.attr)}</p>`;
  if (K.id !== "glosar") pojZnac(main.querySelector(".srdtext"));
  const el = c && document.getElementById(c);
  if (el) el.scrollIntoView({block: "start"});
  else window.scrollTo(0, 0);
}
const NAVNAME = {
  hra: "Hra",
  sezeni: "Příprava sezení",
  kouzla: "Kouzla",
  uvod: "Úvod",
  artikule: "Artikule",
  draconomicon: "Draconomicon",
  druzina: "Družina",
  karty: "Karty postav",
  pravidla: "Pravidla SRD",
  kronika: "Kronika",
  mapa: "Mapa zemí",
  praha: "Praha",
  svet: "Známý svět",
  desky: "Zemské desky",
  gm: "Vypravěč",
  boj: "Boj",
  vyprava: "Výprava",
};
/* nainstalovaná aplikace na telefonu ukáže hráči jen Hru (2026-10-22); odkaz ven otevře web v prohlížeči s ?web=1 */
const mmJenHra = () => !GMV && document.documentElement.classList.contains("mmapp") && !/[?&]web=1/.test(location.search);
document.addEventListener(
  "click",
  e => {
    if (!mmJenHra() || e.defaultPrevented) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    /* odkaz, který obsluhuje skript na místě (data-…, např. odznak rány → Duše), zůstává v aplikaci */
    if (!a || [...a.attributes].some(x => x.name.startsWith("data-") && x.name !== "data-tip")) return;
    const h = a.getAttribute("href"),
      v = h.slice(1).split("/")[0];
    if (!v || v === "hra" || v === "boj") return;
    e.preventDefault();
    e.stopPropagation();
    window.open(location.origin + location.pathname + "?web=1" + h, "_blank", "noopener");
  },
  true,
);
/* je otevřená stránka Hra? (hráč ji má od 2026-10-22 uvnitř jako stránku Boj) */
function mmNaHre() {
  return curView === "hra" || (!GMV && curView === "boj");
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1)) || "uvod";
  const [a, b, c] = h.split("/");
  let view = a === "rod" || a === "osoba" ? "desky" : a;
  if (!VIEWS.includes(view) || ((view === "kouzla" || view === "sezeni") && !GMV)) view = "uvod";
  document.documentElement.classList.toggle("mmjenhra", mmJenHra());
  if (mmJenHra() && view !== "hra" && view !== "boj") {
    history.replaceState(null, "", "#hra");
    view = "hra";
  }
  /* hráč (2026-10-22): Hra = jeho karta a boj na jedné stránce – uvnitř je to stránka Boj (#bojview, renderBoj),
     v menu a v adrese Hra; starší odkazy a upozornění na #boj vedou na Hru */
  if (!GMV && view === "boj") {
    history.replaceState(null, "", "#hra");
    view = "hra";
  }
  const navV = view;
  if (!GMV && view === "hra") view = "boj";
  /* stránka s vlastní částí skriptu (mapy, Výprava): nejdřív ji stáhnout, pak vykreslit */
  if (!mmLinyHotove(view)) {
    document.querySelectorAll(".view").forEach(v => {
      v.hidden = v.dataset.view !== view;
    });
    document.documentElement.classList.add("mmlina");
    const h0 = location.hash;
    mmLinyPro(view).then(
      () => {
        document.documentElement.classList.remove("mmlina");
        if (location.hash === h0) route();
      },
      e => {
        document.documentElement.classList.remove("mmlina");
        mmHlasG(e.message, 7000);
      },
    );
    return;
  }
  const changed = view !== curView;
  curView = view;
  document.body.classList.toggle("home", view === "uvod");
  document.getElementById("navcur").textContent = NAVNAME[navV] || "";
  {
    const nav = document.getElementById("sitenav");
    nav.classList.remove("open");
    document.getElementById("navtoggle").setAttribute("aria-expanded", "false");
  }
  document.querySelectorAll(".view").forEach(v => {
    v.hidden = v.dataset.view !== view;
  });
  if (view === "uvod" && kalHero)
    try {
      renderKal();
    } catch (e) {
      console.warn(e);
    }
  if (view === "uvod")
    try {
      renderUvodUcet();
    } catch (e) {
      console.warn(e);
    }
  if (typeof vyVrat === "function") vyVrat(view);
  document.querySelectorAll("[data-nav]").forEach(n => n.classList.toggle("on", n.dataset.nav === navV));
  document.querySelectorAll("[data-navgrp]").forEach(n => n.classList.toggle("on", n.dataset.navgrp.split(" ").includes(navV)));
  document.querySelectorAll(".navdd").forEach(dd => {
    dd.classList.remove("open");
    dd.querySelector(".ddtop").setAttribute("aria-expanded", "false");
  });
  if (["mapa", "svet", "praha"].includes(view))
    document.querySelectorAll("[data-sub]").forEach(n => n.classList.toggle("on", n.dataset.sub === view));
  if (view === "druzina" || view === "karty")
    document.querySelectorAll("[data-ksub]").forEach(n => n.classList.toggle("on", n.dataset.ksub === view));
  queueMicrotask(navSync);
  document.title = view === "uvod" ? "Mundus Mutatus" : "Mundus Mutatus · " + (TITL[navV] || SUBT[navV]);
  if (view === "desky") {
    const art = document.getElementById("article"),
      subs = ["rody", "osoby", "sousede", "vazby"];
    let sub = null;
    if (a === "rod" && byId[b]) {
      renderRodArticle(b);
      art.hidden = false;
    } else if (a === "osoba" && PBY[b]) {
      renderPersonArticle(b);
      art.hidden = false;
    } else {
      art.hidden = true;
      sub = subs.includes(b) ? b : "rody";
      if (sub === "osoby") renderOsoby();
    }
    subs.forEach(k => {
      document.getElementById(k).hidden = k !== sub;
    });
    document
      .querySelectorAll("[data-sub]")
      .forEach(n =>
        n.classList.toggle(
          "on",
          n.dataset.sub === ((sub === "vazby" ? "rody" : sub) || (a === "osoba" ? "osoby" : a === "rod" && byId[b]?.nbr ? "sousede" : "rody")),
        ),
      );
    window.scrollTo(0, 0);
  } else if (view === "mapa") {
    if (b && byId[b] && st.sel !== b) show(b);
    else {
      drawMap();
      if (!document.getElementById("detail").innerHTML) renderDetail();
    }
    if (changed) window.scrollTo(0, 0);
  } else if (view === "draconomicon") {
    renderDraco(b);
    window.scrollTo(0, 0);
  } else if (view === "svet") {
    svInit();
    if (SG && window._sDirty) {
      window._sDirty = 0;
      sDraw();
    }
    if (b && SVB[b]) {
      const go = () => {
        if (SG) sSel(b);
        else setTimeout(go, 120);
      };
      go();
    } else if (changed) window.scrollTo(0, 0);
  } else if (view === "praha") {
    praInit();
    if (b && PRB[+b]) {
      const go = () => {
        if (PG) pSel(+b, true);
        else setTimeout(go, 120);
      };
      go();
    } else if (changed) window.scrollTo(0, 0);
  } else if (view === "druzina") {
    renderDruzina(b);
    window.scrollTo(0, 0);
  } else if (view === "kronika") {
    renderKronika(b);
    window.scrollTo(0, 0);
  } else if (view === "pravidla") {
    renderPravidla(b || "", c || "");
  } else if (view === "karty") {
    renderKarty(b || "");
    kartyStart();
    window.scrollTo(0, 0);
  } else if (view === "boj") {
    bojNacti().then(() => renderBoj());
    renderBoj();
    bojStart();
    if (GMV && !NETV)
      netvNacti()
        .then(() => {
          if (curView === "boj") renderBoj();
        })
        .catch(() => {});
    if (changed) window.scrollTo(0, 0);
  } else if (view === "vyprava") {
    renderVyprava();
    if (changed) window.scrollTo(0, 0);
  } else if (view === "kouzla") {
    renderKouzla(b);
    if (changed) window.scrollTo(0, 0);
  } else if (view === "hra") {
    renderHra();
    if (changed) window.scrollTo(0, 0);
  } else if (view === "sezeni") {
    renderSezeni();
    window.scrollTo(0, 0);
  } else if (view === "gm") {
    renderGM();
    if (changed) window.scrollTo(0, 0);
  } else if (view === "artikule") {
    if (!renderArtikule(b, c)) window.scrollTo(0, 0);
  } else if (changed) window.scrollTo(0, 0);
}
window.addEventListener("popstate", route);
/* links from articles back to the map */
document.addEventListener("click", e => {
  const m = e.target.closest(".maplink");
  if (m) {
    const f = byId[m.dataset.id];
    navTo("#mapa");
    if (f.city) showCity(f.id, m.dataset.place);
    else {
      show(f.id);
      const sd = f.seats.find(x => x[0] === m.dataset.place);
      if (sd) {
        st.focus = sd[0];
        const [x, y] = P(sd[1], sd[2]);
        mapCenter(x, y, 230);
        renderDetail();
      }
    }
    return;
  }
  const g = e.target.closest("[data-showmap]");
  if (g) {
    navTo("#mapa");
    show(g.dataset.showmap);
  }
});

document
  .querySelectorAll("[data-fico]")
  .forEach(e => e.insertAdjacentHTML("afterbegin", `<img class="rico" src="${FICON[e.dataset.fico]}" alt="" aria-hidden="true">`));
document.querySelectorAll("[data-rico]").forEach(e => e.insertAdjacentHTML("afterbegin", rIco(e.dataset.rico)));
/* controls */
document.querySelectorAll("[data-zoom]").forEach(b =>
  b.addEventListener("click", () => {
    st.zoom = b.dataset.zoom;
    st.vb = null;
    document.querySelectorAll("[data-zoom]").forEach(x => x.setAttribute("aria-pressed", x === b));
    drawMap();
  }),
);
document.querySelectorAll("[data-conf]").forEach(b =>
  b.addEventListener("click", () => {
    st.conf = b.dataset.conf;
    document.querySelectorAll("[data-conf]").forEach(x => x.setAttribute("aria-pressed", x === b));
    drawMap();
  }),
);
{
  const _rra = renderRodArticle,
    _rpa = renderPersonArticle;
  renderRodArticle = function (id) {
    _rra(id);
    autolink(document.querySelector("#article .artmain"), "#rod/" + id);
  };
  renderPersonArticle = function (id) {
    _rpa(id);
    autolink(document.querySelector("#article .artmain"), "#osoba/" + id);
  };
}
autolink(document.querySelector("#letopis dl"), "");
renderKal();
{
  const _rd = renderDetail;
  renderDetail = function () {
    _rd.apply(this, arguments);
    const d = document.getElementById("detail");
    if (st.sel && !d.classList.contains("empty")) autolink(d, st.city ? "" : "#rod/" + st.sel);
  };
}
if (FAM.length) select(byId.pod ? "pod" : FAM[0].id);
/* vypravěč: Alt + klik do mapy ukáže a zkopíruje souřadnice pro soubory v zdroj/obsah */
if (GMV) {
  const toast = document.createElement("div");
  toast.className = "gmtoast";
  toast.setAttribute("role", "status");
  document.body.appendChild(toast);
  const pick = (sv, fmt) =>
    sv &&
    sv.addEventListener(
      "click",
      e => {
        if (!e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        const pt = sv.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const q = pt.matrixTransform(sv.getScreenCTM().inverse());
        const t = fmt(q.x, q.y);
        toast.textContent = t;
        toast.classList.add("on");
        try {
          navigator.clipboard.writeText(t).then(
            () => {
              toast.textContent = t + "  · zkopírováno";
            },
            () => {},
          );
        } catch (_) {}
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove("on"), 4000);
      },
      true,
    );
  pick(document.getElementById("map"), (x, y) => `${(x / 72 + 10.9).toFixed(2)} | ${(52.7 - y / 112).toFixed(2)}`);
  pick(document.getElementById("pmap"), (x, y) => `${Math.round(x)}, ${Math.round(y)}`);
}
/* ===== Iluminované iniciály: první písmeno zápisu, oddílu Artikulí, kapitoly Draconomiconu a zápisu kronikáře o rodu ===== */
const ILSEL = ".lead,.ztext>p:first-child,.artmain .kron,.asec>.ash+p,.drtext>p:first-of-type,.drtext>h3+p";
function ilum(root) {
  (root || document).querySelectorAll(ILSEL).forEach(p => {
    if (p.classList.contains("ilp") || p.querySelector(".inic") || p.closest(".noini")) return;
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode()) && !n.nodeValue.trim());
    if (!n) return;
    const m = n.nodeValue.match(/^(\s*)(\p{L})/u);
    if (!m) return;
    const sp = document.createElement("span"),
      ch = m[2];
    sp.className = "inic i" + (ch.toUpperCase().charCodeAt(0) % 3);
    sp.setAttribute("aria-hidden", "true");
    sp.innerHTML = `<b>${ch.toUpperCase()}</b>`;
    const rest = n.splitText(m[1].length);
    rest.nodeValue = rest.nodeValue.slice(1);
    p.insertBefore(sp, p.firstChild); /* na začátek odstavce: první slovo může být odkaz-tlačítko */
    const sr = document.createElement("span");
    sr.className = "vh";
    sr.textContent = ch;
    rest.parentNode.insertBefore(sr, rest);
    p.classList.add("ilp");
  });
}
{
  let t = 0;
  new MutationObserver(() => {
    cancelAnimationFrame(t);
    t = requestAnimationFrame(() => ilum());
  }).observe(document.querySelector("main") || document.body, {childList: true, subtree: true});
  ilum();
}
/* ===== Účet hráče s heslem (2026-10-20): založení a přihlášení na Úvodu i na stránce Hra; vedle Discordu ===== */
let UCETR = ""; /* otevřený formulář: "" (jen tlačítka), "novy", "prihlas" */
const ucetMuze = () => !!(window.MMDB && MMDB.ucetZaloz);
const ucetPrihlasen = () => {
  if (window.MMDB && MMDB.hracPrihlasen && MMDB.hracPrihlasen()) return true;
  try {
    return !!(JSON.parse(localStorage.getItem("mm-hrac") || "null") || {}).k;
  } catch (e) {
    return false;
  }
};
function ucetFormHtml(rez) {
  const novy = rez === "novy";
  return `<form class="ucetf" data-ucetf="${novy ? "novy" : "prihlas"}" autocomplete="on">
    <label>Jméno hráče <input name="j" autocomplete="username" maxlength="60" required placeholder="${novy ? "např. Jan Žižka" : ""}" autocapitalize="none" spellcheck="false"></label>
    <label>Heslo <input name="h" type="password" autocomplete="${novy ? "new-password" : "current-password"}" minlength="6" maxlength="72" required></label>
    ${novy ? `<label>Heslo znovu <input name="h2" type="password" autocomplete="new-password" minlength="6" maxlength="72" required></label>` : ""}
    <p class="ucetakce"><button type="submit" class="gbtn">${novy ? "Vytvořit účet" : "Přihlásit"}</button><button type="button" class="gbtn ghost" data-ucetr="${novy ? "prihlas" : "novy"}">${novy ? "Už mám účet" : "Nemám účet – vytvořit"}</button></p>
    <p class="ucetmsg" role="alert"></p>
    ${novy ? `<p class="rsmall">Jméno a heslo si zapamatuj – e-mail nepotřebuješ, a proto ani heslo nejde poslat znovu (zapomenuté heslo vyřeší vypravěč). Heslo má aspoň 6 znaků.</p>` : ""}</form>`;
}
/* tlačítka a případně rozbalený formulář; kde = "uvod" | "hra" */
function ucetBoxHtml(kde) {
  const disc = window.MMDB && MMDB.discordLogin ? `<button type="button" class="gbtn ghost ddisc" data-ucetdisc>Přihlásit přes Discord</button>` : "";
  return `${UCETR ? ucetFormHtml(UCETR) : `<p class="ucetakce"><button type="button" class="gbtn" data-ucetr="novy">Vytvořit účet</button><button type="button" class="gbtn ghost" data-ucetr="prihlas">Přihlásit se</button>${disc}</p>`}
    ${UCETR && disc ? `<p class="ucetakce ucetdisc"><span class="rsmall">nebo</span> ${disc}</p>` : ""}`;
}
function renderUvodUcet() {
  const b = document.getElementById("uvucet");
  if (!b) return;
  const ok = !GMV && ucetMuze() && !ucetPrihlasen();
  b.hidden = !ok;
  b.innerHTML = ok
    ? `<h2 class="uvh">Hrát za postavu</h2><p>Hráči si tu založí účet (jméno a heslo, nebo Discord), nahrají list postavy z D&amp;D Beyond a pak na stránce <a href="#hra">Hra</a> házejí, sledují boj a vedou kartu.</p><div data-ucetbox="uvod">${ucetBoxHtml("uvod")}</div>`
    : "";
}
function ucetPrekresli() {
  document.querySelectorAll("[data-ucetbox]").forEach(b => {
    b.innerHTML = ucetBoxHtml(b.dataset.ucetbox);
    const i = b.querySelector("input[name=j]");
    if (i) i.focus();
  });
}
document.addEventListener("click", e => {
  const T = s => e.target.closest(s);
  const r = T("[data-ucetr]");
  if (r) {
    UCETR = r.dataset.ucetr;
    ucetPrekresli();
    return;
  }
  if (T("[data-ucetdisc]") && window.MMDB && MMDB.discordLogin) {
    MMDB.discordLogin();
    return;
  }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-ucetf]")) return;
  e.preventDefault();
  if (!ucetMuze()) return;
  const E = f.elements,
    novy = f.dataset.ucetf === "novy",
    msg = f.querySelector(".ucetmsg"),
    btn = f.querySelector("button[type=submit]"),
    j = E.j.value.trim(),
    h = E.h.value;
  msg.textContent = "";
  if (novy && h !== E.h2.value) {
    msg.textContent = "Hesla se neshodují.";
    E.h2.focus();
    return;
  }
  btn.disabled = true;
  try {
    await (novy ? MMDB.ucetZaloz(j, h) : MMDB.ucetPrihlas(j, h));
    UCETR = "";
    if (typeof mmHlasG === "function") mmHlasG(novy ? "Účet vytvořen – teď si nahraj nebo zvol postavu." : "Přihlášeno.", 4000);
    if (typeof jaDiscordInit === "function") await jaDiscordInit();
    if (location.hash.replace(/^#/, "").split("/")[0] === "hra") route();
    else location.hash = "#hra";
  } catch (err) {
    msg.textContent = err.message || String(err);
  } finally {
    btn.disabled = false;
  }
});
