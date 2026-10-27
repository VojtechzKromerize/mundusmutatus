/* ===== Vypravěč: stavy odhalení (Skryté / Slyšeli / Potkali), přihlášení a přehled ===== */
const STAV = __D.STAV || null;
const STLBL = ["Skryté", "Slyšeli", "Potkali"];
if (GMV) {
  const nv = document.getElementById("navvy");
  if (nv) nv.hidden = false;
  document.documentElement.classList.add("gmv");
  const nm = document.getElementById("navgm");
  if (nm) {
    nm.querySelector("img").src = "art/img/pecet-zlomena.webp";
    nm.title = "Vypravěč – přihlášen";
    nm.setAttribute("aria-label", "Vypravěč – přihlášen");
    nm.querySelector(".navgmt").textContent = "Vypravěč (přihlášen)";
  }
}
const gmLv = id => (STAV ? (STAV[id] ?? 0) : 2);
const gmEff = id => (PBY[id] ? Math.min(gmLv(id), gmLv(PBY[id].r)) : gmLv(id));
const gmPl = id => DRBY[id] && DRBY[id].k === "pl";
const gmSeg2 = id =>
  `<span class="gmseg">${[
    [0, "Koncept", "Hráči zápis nevidí"],
    [2, "Zveřejněno", "Zápis je v Kronice"],
  ]
    .map(
      ([i, l, t]) =>
        `<button type="button" class="gmst gs${i}" data-gmset="${i}" aria-pressed="${(gmLv(id) >= 1 ? 2 : 0) === i}" title="${t}">${l}</button>`,
    )
    .join("")}</span>`;
const gmSeg = id =>
  ZBY[id]
    ? gmSeg2(id)
    : `<span class="gmseg">${[0, 1, 2].map(i => `<button type="button" class="gmst gs${i}" data-gmset="${i}" aria-pressed="${gmLv(id) === i}" title="${["Hráči o tom nevědí", "Hráči znají jméno a základní údaje", "Hráči znají vše kromě tajemství"][i]}">${STLBL[i]}</button>`).join("")}</span>`;
function gmBar(id, kind) {
  if (!GMV || !STAV) return "";
  const warn =
    kind === "osoba" && PBY[id] && gmLv(PBY[id].r) === 0
      ? `<span class="gmwarn">Rod je skrytý – hráči osobu neuvidí, dokud neodhalíte rod.</span>`
      : "";
  return `<div class="gmbar noal" data-gmid="${id}" data-gmkind="${kind}"><span class="gmlbl">${kind === "zapis" ? "Zápis Kroniky" : `Co o ${kind === "rod" ? "rodu" : kind === "misto" ? "místu" : kind === "drak" ? "plemeni" : kind === "traktat" ? "traktátu" : "osobě"} ví družina`}</span>${gmSeg(id)}${warn}${window.MMDB ? "" : `<span class="gmwarn">Měnit lze jen na webu napojeném na databázi.</span>`}</div>`;
}
function gmMark(root) {
  if (!STAV) return;
  (root || document).querySelectorAll('a[href^="#osoba/"],a[href^="#rod/"],a[href^="#draconomicon/"],a[href^="#kronika/"]').forEach(a => {
    const h = a.getAttribute("href"),
      id = h.startsWith("#kronika/clanky/") ? h.split("/")[2] : h.split("/")[1];
    if (h.startsWith("#draconomicon/") && !gmPl(id)) return;
    if (h.startsWith("#kronika/") && !ZBY[id] && !TRBY[id]) return;
    const v = gmEff(id);
    a.classList.toggle("gm0", v === 0);
    a.classList.toggle("gm1", v === 1);
  });
}
function gmRefresh() {
  document.querySelectorAll(".gmbar[data-gmid]").forEach(b => {
    b.outerHTML = gmBar(b.dataset.gmid, b.dataset.gmkind);
  });
  document.querySelectorAll(".gmrow[data-gmid]").forEach(r =>
    r.querySelectorAll("[data-gmset]").forEach(x => {
      const v = gmLv(r.dataset.gmid);
      x.setAttribute("aria-pressed", +x.dataset.gmset === (ZBY[r.dataset.gmid] ? (v >= 1 ? 2 : 0) : v));
    }),
  );
  gmMark();
  if (curView === "gm") gmSum();
}
async function gmUloz(z) {
  if (!window.MMDB) {
    mmHlasG("Stavy lze měnit jen na webu napojeném na databázi.");
    return;
  }
  document.documentElement.classList.add("gmbusy");
  try {
    const n = await MMDB.nastav(z);
    Object.keys(STAV).forEach(k => delete STAV[k]);
    Object.assign(STAV, n || {});
    gmRefresh();
    __D.NOVINKY = [...Object.entries(z).map(([id, v]) => ({id, stav: +v})), ...(__D.NOVINKY || [])];
    try {
      renderNovinky();
    } catch (e) {}
    mmHlasG("Uloženo – hráči to uvidí do půl minuty.");
  } catch (err) {
    mmHlasG("Nepodařilo se uložit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
}
const mmHlasG = (t, ms) => (window.mmHlas ? mmHlas(t, ms) : alert(t));
if (GMV && STAV) {
  const _r1 = renderRodArticle,
    _r2 = renderPersonArticle;
  renderRodArticle = function (id) {
    _r1(id);
    const c = document.querySelector("#article .crumbs");
    if (c) c.insertAdjacentHTML("afterend", gmBar(id, "rod"));
  };
  renderPersonArticle = function (id) {
    _r2(id);
    const c = document.querySelector("#article .crumbs");
    if (c) c.insertAdjacentHTML("afterend", gmBar(id, "osoba"));
  };
  const _r3 = renderDraco;
  renderDraco = function (b) {
    _r3(b);
    if (gmPl(b)) {
      const c = document.querySelector("#drmain .crumbs");
      if (c) c.insertAdjacentHTML("afterend", gmBar(b, "drak"));
    }
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-gmset]");
    if (!b) return;
    const box = b.closest("[data-gmid]");
    const cur = gmLv(box.dataset.gmid);
    if (+b.dataset.gmset === (ZBY[box.dataset.gmid] ? (cur >= 1 ? 2 : 0) : cur)) return;
    gmUloz({[box.dataset.gmid]: +b.dataset.gmset});
  });
  const _r4 = renderKronika;
  renderKronika = function (b, c) {
    _r4(b, c);
    if (ZBY[b]) {
      const cr = document.querySelector("#kzapisy .crumbs");
      if (cr) cr.insertAdjacentHTML("afterend", gmBar(b, "zapis"));
    } else if (b === "clanky" && TRBY[c]) {
      const cr = document.querySelector("#kclanky .crumbs");
      if (cr) cr.insertAdjacentHTML("afterend", gmBar(c, "traktat"));
    }
  };
  let mq = 0;
  new MutationObserver(() => {
    if (!mq)
      mq = requestAnimationFrame(() => {
        mq = 0;
        gmMark();
      });
  }).observe(document.body, {childList: true, subtree: true});
}
/* ===== Při hře: plovoucí panel vypravěče – rychlé hledání a Skryté/Slyšeli/Potkali odkudkoli (Ctrl+K) ===== */
if (GMV && STAV) {
  const IDX = [
    ...PEOPLE.map(p => ({
      id: p.id,
      n: p.n.replace(/^✦\s*/, ""),
      s: [p.role, byId[p.r] && byId[p.r].name].filter(Boolean).join(" · "),
      h: "#osoba/" + p.id,
      k: "Osoba",
    })),
    ...FAM.map(f => ({id: f.id, n: f.name, s: f.land, h: "#rod/" + f.id, k: "Rod"})),
    ...(DRACI.pl || []).map(d => ({id: d.id, n: d.n, s: d.la || "plemeno", h: "#draconomicon/" + d.id, k: "Drak"})),
    ...ZAPISY.map(z => ({id: z.id, n: z.title, s: [z.n, z.date].filter(Boolean).join(" · "), h: "#kronika/" + z.id, k: "Zápis"})),
    ...TRAKTATY.map(t => ({id: t.id, n: t.t, s: "traktát", h: "#kronika/clanky/" + t.id, k: "Traktát"})),
    ...DISC.map(d => ({id: d.id, n: d.name, s: "objevené místo", h: "#mapa", k: "Místo"})),
  ].map(x => Object.assign(x, {t: _nrm(x.n + " " + x.s)}));
  const RK = "mm-pri-hre",
    nedavne = () => {
      try {
        return JSON.parse(localStorage.getItem(RK) || "[]");
      } catch (e) {
        return [];
      }
    },
    zapamatuj = id => {
      try {
        localStorage.setItem(RK, JSON.stringify([id, ...nedavne().filter(x => x !== id)].slice(0, 10)));
      } catch (e) {}
    };
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "phbtn";
  btn.innerHTML = `<span aria-hidden="true">⚑</span> Při hře`;
  btn.title = "Při hře – rychlé odhalování (Ctrl+K)";
  const P = document.createElement("aside");
  P.className = "phpanel";
  P.hidden = true;
  P.setAttribute("aria-label", "Při hře");
  P.innerHTML = `<div class="phhead"><b>Při hře</b><button type="button" class="phx" aria-label="Zavřít">×</button></div>
    <input type="search" class="phq" placeholder="Koho družina potkala nebo o kom slyší…" aria-label="Hledat osobu, rod, plemeno, zápis">
    <div class="phres"></div><p class="phfoot">${window.MMDB ? "Změna se hráčům ukáže do půl minuty." : "Statická verze – stavy jen ke čtení."} <a href="#gm">Celý přehled →</a></p>`;
  document.body.append(btn, P);
  const q = P.querySelector(".phq"),
    res = P.querySelector(".phres");
  const radek = x =>
    `<div class="gmrow gmp" data-gmid="${x.id}"><a href="${x.h}">${x.n}</a><small>${x.k} · ${x.s}</small>${x.k === "Kouzlo" ? "" : gmSeg(x.id)}</div>`;
  window._phIDX = IDX;
  const vykresli = () => {
    const v = _nrm(q.value.trim());
    let L, nad;
    if (v.length < 2) {
      L = nedavne()
        .map(id => IDX.find(x => x.id === id))
        .filter(Boolean);
      nad = L.length ? "Naposledy měněné" : "";
    } else {
      const w = v.split(/\s+/);
      L = IDX.filter(x => w.every(t => x.t.includes(t)))
        .sort((a, b) => _nrm(b.n).startsWith(v) - _nrm(a.n).startsWith(v))
        .slice(0, 14);
      nad = L.length ? "" : "Nic nenalezeno.";
    }
    res.innerHTML = (nad ? `<p class="phnad">${nad}</p>` : "") + L.map(radek).join("");
    gmMark(res);
  };
  const otevri = o => {
    P.hidden = !o;
    btn.setAttribute("aria-expanded", o);
    if (o) {
      vykresli();
      q.focus();
      q.select();
    }
  };
  btn.addEventListener("click", () => otevri(P.hidden));
  P.querySelector(".phx").addEventListener("click", () => otevri(false));
  q.addEventListener("input", vykresli);
  P.addEventListener("click", e => {
    const b = e.target.closest("[data-gmset]");
    if (b) {
      const r = b.closest("[data-gmid]");
      if (r) zapamatuj(r.dataset.gmid);
    }
  });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      otevri(true);
    } else if (e.key === "Escape" && !P.hidden) {
      otevri(false);
      btn.focus();
    }
  });
}
function gmSum() {
  const el = document.getElementById("gmsum");
  if (!el) return;
  const c = (arr, f) => arr.filter(x => f(x) >= 1).length;
  el.textContent =
    `Zveřejněno ${c(ZAPISY, z => gmLv(z.id))} z ${ZAPISY.length} zápisů Kroniky. Družina zná ${c(FAM, f => gmLv(f.id))} z ${FAM.length} rodů, ${c(PEOPLE, p => gmEff(p.id))} z ${PEOPLE.length} osob` +
    `, ${c(DRACI.pl, d => gmLv(d.id))} z ${DRACI.pl.length} dračích plemen` +
    (DISC.length ? ` a ${c(DISC, d => gmLv(d.id))} z ${DISC.length} míst.` : ".");
}
const CESTA_ZP = [
    ["pesky", "Pěšky", 30],
    ["kun", "Na koni", 45],
    ["vuz", "S vozem", 20],
    ["posel", "Posel se střídáním koní", 90],
  ],
  CESTA_ODCH = [
    [0.5, "o polovinu rychleji"],
    [0.75, "o čtvrtinu rychleji"],
    [1, "podle odhadu"],
    [1.25, "o čtvrtinu déle"],
    [1.5, "o polovinu déle"],
    [2, "dvakrát déle"],
  ];
const cestaMisto = n => {
  if (!n) return null;
  if (typeof n === "object") return n.lo != null ? n : n.ll ? {name: n.name, lo: n.ll[0], la: n.ll[1]} : null;
  if (HRA && HRA.poloha && n === HRA.misto) return {name: n, lo: HRA.poloha[0], la: HRA.poloha[1]};
  const p = placeBy(n);
  if (p) return p;
  const t = TOWNS.find(x => x[0] === n);
  return t ? {name: t[0], lo: t[1], la: t[2]} : null;
};
/* řeky z mapy (pořadí jako RIVERS), stálé mosty roku 1458 a známá mýtná místa */
const RIVNAMES = ["Labe", "Vltava", "Odra", "Morava", "Nisa", "Dunaj", "Visla", "Dunaj", "Dráva", "Sáva", "Tisa", "Pád", "Adiže"];
const CMOSTY = [
  ["Praha", 14.414, 50.086, "Vltava"],
  ["Drážďany", 13.741, 51.054, "Labe"],
  ["Vratislav", 17.04, 51.11, "Odra"],
  ["Řezno", 12.097, 49.022, "Dunaj"],
  ["Vídeň", 16.37, 48.21, "Dunaj"],
];
const CMYTA = [["Landštejn", 15.23, 48.97, "mýto pánů Krajířů z Krajku na cestě z Rakous do Čech"]];
/* putuje se jen za světla; okno a obtíže podle ročního období */
const cestaOkno = m => (m === 12 || m === 1 ? [8, 16] : m === 11 || m === 2 ? [7, 17] : m >= 5 && m <= 8 ? [6, 20] : [7, 19]);
const cestaSezona = m =>
  m === 12 || m <= 2
    ? [1.25, "zima – krátký den, sníh a mráz"]
    : m === 11
      ? [1.15, "pozdní podzim – krátký den a bláto"]
      : m === 3 || m === 4
        ? [1.25, "jarní tání – cesty rozbahněné"]
        : [1, ""];
const cDat = t => {
  const [Y, M, D] = fromJdn(Math.floor(t / 24));
  return {datum: `${Y}-${String(M).padStart(2, "0")}-${String(D).padStart(2, "0")}`, hodina: Math.round(t - Math.floor(t / 24) * 24)};
};
const cTxt = t => {
  const [Y, M, D] = fromJdn(Math.floor(t / 24));
  return `${D}. ${MES[M - 1]} ${Y}, ${Math.round(t % 24)}:00`;
};
const cT = h => {
  if (!h || !/^\d{4}-\d{2}-\d{2}$/.test(h.datum || "")) return null;
  const [y, m, d] = h.datum.split("-").map(Number);
  return jdn(y, m, d) * 24 + (+h.hodina || 0);
};
const cNejbliz = (lo, la) => {
  let b = null,
    bd = 1e9;
  for (const [n, x, y] of [...NAMEPTS, ...SVETMESTA])
    if (n) {
      const d = haversine([x, y], [lo, la]);
      if (d < bd) {
        bd = d;
        b = n;
      }
    }
  return {n: b, d: Math.round(bd)};
};
const cKde = (lo, la) => {
  const q = cNejbliz(lo, la);
  return q.d < 5 ? q.n : `v krajině, nejblíž ${q.n} (asi ${q.d} km)`;
};
const cSeg = (a, b, c, d) => {
  const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
  if (!den) return null;
  const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den,
    u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] : null;
};
function cestaPoz(track, t) {
  if (!track || !track.length) return null;
  if (t <= track[0][0]) return track[0].slice(1);
  for (let i = 1; i < track.length; i++)
    if (t <= track[i][0]) {
      const [t0, x0, y0] = track[i - 1],
        [t1, x1, y1] = track[i],
        f = t1 > t0 ? (t - t0) / (t1 - t0) : 1;
      return [x0 + (x1 - x0) * f, y0 + (y1 - y0) * f];
    }
  return track[track.length - 1].slice(1);
}
/* plán cesty: trasa, hodiny na cestě, noclehy, svátky, řeky, mýta a stopa s časy pro polohu družiny */
function cestaPlan(o) {
  const zp = CESTA_ZP.find(z => z[0] === o.zp) || CESTA_ZP[0],
    sw = n => {
      const c = SVETMESTA.find(x => x[0] === n);
      return c ? {name: c[0], ll: [c[1], c[2]], key: c[0]} : null;
    };
  const A = o.svet ? null : o.zP && o.zP.lo != null ? o.zP : cestaMisto(o.z),
    B = o.svet ? null : o.doP && o.doP.lo != null ? o.doP : cestaMisto(o.do);
  let legs,
    km,
    svet = false,
    seaKm = 0;
  if (A && B) {
    if (A.name === B.name) return {chyba: "Družina už na místě je."};
    const R = computeRoute(A, B);
    if (!R) return {chyba: "Cestu se nepodařilo spočítat."};
    legs = R.legs.map(l => ({p0: l.p0, p1: l.p1, km: l.km, eff: l.eff, sea: !!l.lod}));
    km = R.km;
  } else {
    const bod = q => (q ? {name: q.name, ll: q.ll || [q.lo, q.la], key: q.key || ""} : null),
      a = A ? {name: A.name, ll: [A.lo, A.la], key: ""} : bod(o.zP) || sw(o.z),
      b = B ? {name: B.name, ll: [B.lo, B.la], key: ""} : bod(o.doP) || sw(o.do);
    if (!a) return {chyba: "Výchozí místo („Kde je družina“) na mapách neznám – vyber ho z nabídky."};
    if (!b) return {chyba: "Cíl na mapách neznám – vyber ho z nabídky."};
    if (a.name === b.name) return {chyba: "Družina už na místě je."};
    if (!SG) {
      svInit();
      return {chyba: "Načítám mapu Známého světa…", cekej: true};
    }
    const r = typeof sRoute === "function" ? sRoute(a, b, zp[2], 110) : null;
    if (!r) return {chyba: "Cestu se nepodařilo spočítat."};
    svet = true;
    legs = [];
    for (let i = 1; i < r.path.length; i++) {
      const p0 = r.path[i - 1].ll,
        p1 = r.path[i].ll,
        sea = r.path[i].sea,
        k = haversine(p0, p1) * (sea ? 1.05 : 1.3);
      legs.push({p0, p1, km: k, eff: k, sea});
    }
    km = r.land + r.sea;
    seaKm = r.sea;
  }
  const t0 = cT(o),
    [, M] = fromJdn(Math.floor(t0 / 24)),
    okno = o.sez ? cestaOkno(M) : [7, 19],
    den = okno[1] - okno[0],
    [sf, sn] = o.sez ? cestaSezona(M) : [1, ""];
  legs.forEach(l => (l.h = l.sea ? (l.km / 110) * 24 : (l.eff / zp[2]) * den * sf * (+o.odch || 1)));
  const odhad = legs.reduce((s, l) => s + (l.sea ? (l.km / 110) * 24 : (l.eff / zp[2]) * den), 0),
    souH = legs.filter(l => !l.sea).reduce((s, l) => s + l.h, 0),
    zd = +o.zdrz || 0;
  if (zd) {
    if (souH > 0)
      legs.forEach(l => {
        if (!l.sea) l.h = Math.max(0.1, l.h + (zd * l.h) / souH);
      });
    else legs[legs.length - 1].h = Math.max(0.1, legs[legs.length - 1].h + zd);
  }
  let t = t0;
  const track = [[t, ...legs[0].p0]],
    noci = [],
    pos = () => track[track.length - 1].slice(1);
  for (const l of legs) {
    let rem = l.h;
    while (rem > 1e-6) {
      if (l.sea) {
        t += rem;
        rem = 0;
        track.push([t, ...l.p1]);
        break;
      }
      const hod = t - Math.floor(t / 24) * 24,
        dn = Math.floor(t / 24);
      if (hod < okno[0] - 1e-6) {
        t = dn * 24 + okno[0];
        track.push([t, ...pos()]);
        continue;
      }
      if (hod >= okno[1] - 1e-6) {
        noci.push({j: dn, p: pos()});
        t = (dn + 1) * 24 + okno[0];
        track.push([t, ...pos()]);
        continue;
      }
      const k = Math.min(okno[1] - hod, rem),
        f = (l.h - rem + k) / l.h;
      t += k;
      rem -= k;
      track.push([t, l.p0[0] + (l.p1[0] - l.p0[0]) * f, l.p0[1] + (l.p1[1] - l.p0[1]) * f]);
    }
  }
  t = Math.ceil(t - 1e-6);
  track[track.length - 1][0] = t;
  const r3 = v => Math.round(v * 1000) / 1000,
    trk = track
      .filter((q, i) => i === 0 || q[0] !== track[i - 1][0] || q[1] !== track[i - 1][1])
      .map(q => [Math.round(q[0] * 10) / 10, r3(q[1]), r3(q[2])]);
  /* svátky a Hodiny Pravdy během cesty */
  const d0 = Math.floor(t0 / 24),
    d1 = Math.floor(t / 24),
    [Y0] = fromJdn(d0),
    sv = [];
  [...feasts(Y0), ...feasts(Y0 + 1)].forEach(f => {
    if (f.j >= d0 && f.j <= d1 && !f.info) {
      const q = cestaPoz(trk, f.j * 24 + (f.hp ? 22 : 12));
      sv.push({j: f.j, n: f.n, hp: !!f.hp, w: f.w, kde: q ? cKde(...q) : ""});
    }
  });
  sv.sort((a, b) => a.j - b.j);
  /* řeky, mosty a mýta */
  const reky = [],
    myta = [];
  legs
    .filter(l => !l.sea)
    .forEach(l => {
      RIVERS.forEach((rv, ri) => {
        if (!RIVNAMES[ri]) return;
        for (let i = 1; i < rv.length; i++) {
          const x = cSeg(l.p0, l.p1, rv[i - 1], rv[i]);
          if (x) {
            const most = CMOSTY.find(m => m[3] === RIVNAMES[ri] && haversine([m[1], m[2]], x) < 6);
            const kraj = [legs[0].p0, legs[legs.length - 1].p1].some(q => haversine(q, x) < 4);
            /* známý brod, přívoz či most z krajiny mapy (02e) do 8 km od místa, kde trasa řeku protne */
            const pr = PRECHODY.find(q => q[1] !== "prusmyk" && haversine([q[2], q[3]], x) < 8);
            if (!kraj && !reky.some(r => r.r === RIVNAMES[ri]))
              reky.push({r: RIVNAMES[ri], most: most ? most[0] : null, kde: cKde(...x), pr: pr ? pr[0] : null});
            break;
          }
        }
      });
      CMYTA.forEach(m => {
        if (myta.some(x => x.n === m[0])) return;
        for (let f = 0; f <= 1; f += 0.1) {
          if (haversine([m[1], m[2]], [l.p0[0] + (l.p1[0] - l.p0[0]) * f, l.p0[1] + (l.p1[1] - l.p0[1]) * f]) < 6) {
            myta.push({n: m[0], t: m[3]});
            break;
          }
        }
      });
    });
  return {
    z: A ? A.name : o.zP ? o.zP.name : o.z,
    do: B ? B.name : o.doP ? o.doP.name : o.do,
    km: Math.round(km),
    seaKm: Math.round(seaKm),
    zp: zp[0],
    zpn: zp[1],
    odhad: Math.round(odhad),
    hod: Math.round(legs.reduce((s, l) => s + l.h, 0)),
    t0,
    t1: t,
    track: trk,
    noci: noci.map(n => ({j: n.j, kde: cKde(...n.p)})),
    sv,
    reky,
    myta,
    sezona: sn,
    svet,
  };
}
/* kde je družina právě teď (na cestě, zastavená v krajině, nebo v sídle) */
function cestaAktivni() {
  const c = HRA && HRA.cesta;
  if (!c || !c.track) return null;
  const now = cT(HRA),
    t1 = c.track[c.track.length - 1][0];
  return now != null && now < t1 ? c : null;
}
function partyPos() {
  const c = HRA && HRA.cesta;
  if (c && c.track) {
    const now = cT(HRA),
      t1 = c.track[c.track.length - 1][0];
    if (now != null && now < t1) {
      const q = cestaPoz(c.track, now);
      return {name: `na cestě: ${c.z} → ${c.do}`, lo: q[0], la: q[1], cesta: true};
    }
    const b = cestaMisto(c.do);
    if (b) return b;
    const w = SVETMESTA.find(x => x[0] === c.do);
    if (w) return {name: w[0], lo: w[1], la: w[2]};
  }
  if (HRA && HRA.poloha && HRA.misto) return {name: HRA.misto, lo: HRA.poloha[0], la: HRA.poloha[1]};
  const n = partyPlace();
  if (!n) return null;
  const p = cestaMisto(n);
  if (p) return p;
  const w = SVETMESTA.find(x => x[0] === n);
  return w ? {name: w[0], lo: w[1], la: w[2]} : null;
}
/* ===== Herní čas: jedno místo pro uložení a posun (Při hře, přehled vypravěče, mapy) ===== */
const p2 = n => String(n).padStart(2, "0");
/* aktuální herní okamžik: den, hodina, Slunce, svátky a hodiny Závoje (stejně jako kolo času) */
function hraX() {
  const [Y, M, D] = herniDen(),
    today = jdn(Y, M, D),
    hzs = [...ZAPISY].reverse().filter(z => z.hodina != null),
    H = HRA && HRA.hodina != null ? +HRA.hodina : hzs[0] ? hzs[0].hodina : null;
  const X = dialCtx(Y, M, D, today, H, null);
  X.today = today;
  return X;
}
function zavojInfo() {
  const X = hraX(),
    h = X.H == null ? null : X.H % 24,
    z = h != null ? X.Z[h] : null;
  return {z, pravda: !!(z && X.fe.length), fe: X.fe, X};
}
function zavojBan() {
  const I = zavojInfo();
  if (!I.z) return "";
  return I.pravda
    ? `<div class="zavban pravda" role="status"><b>Hodina Pravdy</b> – ${I.fe.join(", ")} a ${I.z}: kostka Závoje nezná neutrální výsledek. <a href="#artikule/zavoj/hodina-pravdy">Pravidlo →</a></div>`
    : `<div class="zavban" role="status"><b>Hodina Závoje</b> – ${I.z}: Pokušení padá již na 1–3. <a href="#artikule/zavoj/hodiny">Pravidlo →</a></div>`;
}
/* Požehnání 4–6 o svátcích podle vyznání postavy (křesťané = katolíci i kališníci) */
function pozehnaniDnes(faith) {
  if (!faith) return [];
  const X = hraX();
  return feasts(X.Y).filter(
    f =>
      f.j === X.today &&
      f.p &&
      (f.w === "křesťané"
        ? ["kat", "kal", "mix"].includes(faith)
        : f.w === "kališníci"
          ? faith === "kal"
          : f.w === "starověrci"
            ? faith === "old"
            : false),
  );
}
const pozBadge = p => {
  const f = pozehnaniDnes(p.faith).map(x => x.n);
  return f.length
    ? `<span class="ppoz" title="Dnes je ${f.join(", ")} – postava má Požehnání 4–6">✦ Dnes Požehnání 4–6 · ${f.join(", ")}</span>`
    : "";
};
/* deník putování a dokončení cesty, když čas došel na příjezd */
const cZaznamG = (c, t1, konec) => {
  const st = c.track.filter(q => q[0] <= t1),
    pts = st.map(q => [q[1], q[2]]);
  if (konec) pts.push(konec);
  const zjed = pts.filter((q, i) => i === 0 || i === pts.length - 1 || i % 3 === 0);
  return [...((HRA && HRA.putovani) || []), {z: c.z, do: c.do, od: cTxt(c.track[0][0]), pr: cTxt(t1), t0: c.track[0][0], t1, b: zjed}].slice(-80);
};
const cDokonciG = h => {
  const c = h.cesta !== undefined ? h.cesta : HRA && HRA.cesta;
  if (!c || !c.track) return h;
  const now = cT(Object.assign({}, HRA, h)),
    t1 = c.track[c.track.length - 1][0];
  if (now == null || now < t1) return h;
  const e = c.track[c.track.length - 1],
    znam = cestaMisto(c.do) && !(HRA && HRA.poloha && c.do === HRA.misto);
  return Object.assign(h, {cesta: null, misto: c.do, poloha: znam ? null : [e[1], e[2]], praha: null, putovani: cZaznamG(c, t1, [e[1], e[2]])});
};
async function hraUloz(h) {
  h = cDokonciG(Object.assign({}, h));
  if (h.hodina != null && HRA && HRA.hodina != null && h.hodinaPred === undefined && (h.datum == null || h.datum === HRA.datum))
    h.hodinaPred = +HRA.hodina;
  if (!window.MMDB) {
    HRA = Object.assign({}, HRA || {}, h);
    __D.HRA = HRA;
    hraPo();
    mmHlasG("Statická verze – změna platí jen v tomto okně, neukládá se.", 5000);
    return HRA;
  }
  if (!h.$bezZpet) {
    try {
      await hraZpetZapis(
        h.datum != null || h.hodina != null
          ? `čas ${h.datum && HRA && h.datum !== HRA.datum ? h.datum.split("-").reverse().map(Number).join(". ") + " " : ""}${h.hodina != null ? h.hodina + ":00" : ""}`.trim()
          : "herní stav",
      );
    } catch (e) {}
  }
  delete h.$bezZpet;
  document.documentElement.classList.add("gmbusy");
  try {
    HRA = await MMDB.nastavHru(h);
    __D.HRA = HRA;
    hraPo();
    mmHlasG(`Uloženo: ${partyDate()}, ${HRA.hodina}:00${HRA.misto ? ", " + HRA.misto : ""}.`);
  } catch (err) {
    mmHlasG("Nepodařilo se uložit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
  return HRA;
}
const HRA_PO = [];
function hraPo() {
  try {
    renderKal();
  } catch (e) {}
  try {
    if (curView === "mapa") drawMap();
  } catch (e) {}
  try {
    if (SG) {
      if (curView === "svet") sDraw();
      else window._sDirty = 1;
    }
  } catch (e) {}
  if (curView === "boj")
    try {
      renderBoj();
    } catch (e) {}
  if (curView === "druzina")
    try {
      renderDruzina(decodeURIComponent(location.hash.split("/")[1] || ""));
    } catch (e) {}
  HRA_PO.forEach(f => {
    try {
      f();
    } catch (e) {}
  });
}
/* posun herního času: +h, do večera (západ slunce), další ráno */
function hraPosun(k) {
  const X = hraX();
  let j = X.today,
    h = X.H == null ? 10 : X.H;
  if (k === "rano") {
    j++;
    h = 6;
  } else if (k === "vecer") {
    const v = Math.round(X.sun.set);
    if (h >= v) {
      mmHlasG("Slunce už zapadlo – použij Další ráno.");
      return Promise.resolve();
    }
    h = v;
  } else {
    h += +k;
    while (h > 23) {
      h -= 24;
      j++;
    }
    while (h < 0) {
      h += 24;
      j--;
    }
  }
  const [y, m, d] = fromJdn(j);
  return hraUloz({datum: `${y}-${p2(m)}-${p2(d)}`, hodina: h});
}
/* Při hře: počasí s dopadem na hru (pravidla D&D 2024) – 2026-10-23 přesunuto z horní části Boje do panelu Při hře */
function phPocasi() {
  let X, P;
  try {
    X = hraX();
    P = dialPoc(X.today);
  } catch (e) {
    return "";
  }
  if (!P) return "";
  const h = X.H == null ? 12 : X.H % 24,
    noc = X.sun.alt(h) < -6,
    d = [];
  if (P.mlha && h < 12) d.push("ranní mlha: v dálce silně zastřeno");
  if (P.typ === "bourka" || (P.typ && P.int >= 3))
    d.push(
      `${P.typ === "snih" ? "husté sněžení" : "silný déšť"}: lehce zastřeno, nevýhoda na Moudrost (Vnímání), otevřený oheň ${P.typ === "snih" ? "se špatně udržuje" : "zhasíná"}`,
    );
  if (P.v >= 3) d.push("silný vítr: nevýhoda na útoky zbraní na dálku, otevřený oheň zhasíná, rozhání mlhu");
  if (P.snih >= 3) d.push("hluboký sníh: obtížný terén");
  if (noc) d.push("noc: bez světla silně zastřeno");
  return `<div class="bojpoc"><span class="lbl">Počasí</span> ${besc(P.text)}${d.length ? `<ul>${d.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}</div>`;
}
/* Boj: nepřátelé předaní z Výpravy (setkání) */
/* Při hře: herní čas, posun hodin a upozornění na Hodinu Závoje */
if (GMV && STAV) {
  const P = document.querySelector(".phpanel"),
    B = document.querySelector(".phbtn");
  if (P) {
    P.querySelector(".phhead").insertAdjacentHTML(
      "afterend",
      `<div class="phcas"><div class="phted"></div><div class="phcasb" role="group" aria-label="Posun herního času">
    <button type="button" class="gbtn ghost" data-cas="-1" title="O hodinu zpět">−1 h</button><button type="button" class="gbtn ghost" data-cas="1">+1 h</button><button type="button" class="gbtn ghost" data-cas="3">+3 h</button>
    <button type="button" class="gbtn ghost" data-cas="vecer" title="Do západu slunce">Do večera</button><button type="button" class="gbtn ghost" data-cas="rano" title="Další den v 6 hodin">Další ráno</button>
    <button type="button" class="gbtn ghost" data-cas="zapis" title="Nový zápis Kroniky s datem, hodinou, místem a deníkem putování">Nový zápis</button><button type="button" class="gbtn ghost" data-cas="zpet" title="Vrátit poslední změnu času, místa nebo cesty družiny">↶ Zpět</button></div><div class="phzav"></div><div class="phpoc"></div></div>`,
    );
    const kresli = () => {
      const X = hraX(),
        pp = partyPos(),
        c = cestaAktivni();
      P.querySelector(".phted").innerHTML =
        `<b>${DNY[(X.today + 1) % 7]} ${X.D}. ${MES[X.M - 1]} ${X.Y}${X.H != null ? `, ${X.H}:00` : ""}</b><small>${c ? `na cestě ${besc(c.z)} → ${besc(c.do)}${pp ? " · " + besc(cKde(pp.lo, pp.la)) : ""}` : pp ? besc(pp.name) : ""}</small>`;
      P.querySelector(".phzav").innerHTML = zavojBan();
      P.querySelector(".phpoc").innerHTML = phPocasi();
      if (B) {
        const I = zavojInfo();
        B.classList.toggle("phzv", !!I.z);
        B.classList.toggle("phpr", !!I.pravda);
        B.title = I.z ? (I.pravda ? "Hodina Pravdy! " : "Hodina Závoje! ") + "Při hře (Ctrl+K)" : "Při hře – čas, rychlé odhalování (Ctrl+K)";
      }
    };
    P.addEventListener("click", e => {
      const b = e.target.closest("[data-cas]");
      if (!b) return;
      const k = b.dataset.cas;
      if (k === "zapis") {
        zapisNovy();
        return;
      }
      if (k === "zpet") {
        hraZpet();
        return;
      }
      hraPosun(k);
    });
    HRA_PO.push(kresli);
    if (B) B.addEventListener("click", kresli);
    kresli();
  }
}
/* ===== Kronika z herního stavu: nový zápis s datem, hodinou, místem, trasou a podklady (putování, boj, počasí); uložení posune herní čas ===== */
function zapisMd(id, n) {
  const X = hraX(),
    L = ZAPISY[ZAPISY.length - 1],
    tz = L ? cT({datum: L.datum, hodina: L.hodina ?? 0}) : null,
    pp = partyPos();
  const dat = `${X.Y}-${p2(X.M)}-${p2(X.D)}`,
    misto = (HRA && HRA.misto) || partyPlace() || "Praha";
  const put = ((HRA && HRA.putovani) || []).filter(c => c.t1 != null && (tz == null || c.t1 > tz)),
    c = cestaAktivni();
  const route = [
    ...new Set([L ? L.place : null, ...put.flatMap(q => [q.z, q.do]), c ? c.z : null, misto].filter(x => x && cestaMisto(x) && !/^na cestě/.test(x))),
  ];
  const pod = [];
  put.forEach(q => pod.push(`putování ${q.z} → ${q.do} (${q.od} – ${q.pr})`));
  if (c) pod.push(`právě na cestě ${c.z} → ${c.do}, teď ${pp ? cKde(pp.lo, pp.la) : "?"}`);
  if (window.BOJ_SHRN) {
    pod.push(window.BOJ_SHRN);
    window.BOJ_SHRN = "";
  } else if (BOJ.s && BOJ.s.npc && BOJ.s.npc.length)
    pod.push(
      `boj (kolo ${BOJ.s.kolo || 1}): ` +
        BOJ.s.npc
          .map(q => q.n + (q.druh === "houf" ? ` ${q.pocet} z ${q.max}` : "") + ((q.stav || []).length ? ` – ${q.stav.join(", ")}` : ""))
          .join("; "),
    );
  try {
    const P = dialPoc(X.today);
    if (P) pod.push("počasí: " + P.text.replace(/\.$/, ""));
  } catch (e) {}
  if (X.fe.length) pod.push("svátek: " + X.fe.join(", "));
  return `---\nid: ${id}\nn: Sezení ${n}\ndatum: ${dat}\ndate: ${partyDate()}\nhodina: ${X.H ?? ""}\nplace: ${misto}\nroute: ${route.join(", ") || misto}\npraha: \ndruzina: ${HRA && HRA.praha != null ? HRA.praha : ""}\ntitle: \n---\n${(() => {
    const t = window.BOJ_TEXT;
    window.BOJ_TEXT = "";
    return t ? String(t).trim() : "Text zápisu. Odstavce odděluj prázdným řádkem.";
  })()}\n${pod.length ? `\n\u27E6Podklady (hráči je neuvidí, před zveřejněním smaž): ${pod.join(" · ")}\u27E7\n` : ""}`;
}
async function zapisNovy() {
  if (!window.MMDB || typeof edOtevri !== "function") {
    const md = zapisMd(`sezeni-${ZAPISY.length + 1}`, ZAPISY.length + 1);
    try {
      await navigator.clipboard.writeText(md);
      mmHlasG("Koncept zápisu je ve schránce – vlož ho do nového souboru v zdroj/obsah/kronika/.", 6000);
    } catch (e) {
      prompt("Koncept zápisu:", md);
    }
    return;
  }
  try {
    await edNacti();
  } catch (e) {
    mmHlasG("Texty se nepodařilo načíst: " + e.message, 7000);
    return;
  }
  let n = Object.keys(ED.z).filter(k => k.startsWith("kronika/") && !k.includes("_vzor")).length;
  let id;
  do {
    n++;
    id = `sezeni-${n}`;
  } while (edIndex()["zapis:" + id]);
  const md = zapisMd(id, n),
    tpl = EDDRUH.zapis.tpl;
  EDDRUH.zapis.tpl = () => md;
  try {
    await edOtevri("zapis", id, true);
  } finally {
    EDDRUH.zapis.tpl = tpl;
  }
}
async function zapisDoHry(v) {
  const t = cT({datum: v.datum, hodina: v.hodina || 0}),
    now = cT(HRA);
  if (t == null || (now != null && t <= now)) return;
  const h = {datum: v.datum, hodina: +v.hodina || 0};
  if (v.place && cestaMisto(v.place) && !cestaAktivni()) Object.assign(h, {misto: v.place, poloha: null});
  await hraUloz(h);
}
/* Výprava → Boj: setkání se přenese mezi nepřátele v Boji */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-vyboj]");
  if (!b || typeof VY === "undefined" || !VY) return;
  const s = VY.setk[+b.dataset.vyboj];
  if (!s) return;
  const T = s.typ != null ? VY_TYPY[s.typ] : null,
    Z = s.typ != null && s.zaz != null ? vyZazT(s.typ)[s.zaz] : null,
    n = (Z && Z.n) || (T && T.n) || "Nepřítel";
  if (Z && Z.b && typeof bojZBest === "function") {
    const R = bojZBest(Z.b);
    if (R.np.length) {
      bojPridejZvenku(R.np, `Setkání ${+b.dataset.vyboj + 1} na cestě: ${n}${s._kde ? " – " + s._kde : ""}.${R.z ? " " + R.z : ""}`);
      return;
    }
  }
  try {
    sessionStorage.setItem(
      "mm-boj-pred",
      JSON.stringify({
        npc: [{n, druh: T && T.n === "Krutý boj" ? "houf" : "sok", pocet: 4}],
        z: `Setkání ${+b.dataset.vyboj + 1} na cestě: ${n}${s._kde ? " – " + s._kde : ""}. Uprav nepřátele a vytrub do boje.`,
      }),
    );
  } catch (x) {}
  if (BOJ.s && BOJ.s.aktivni && typeof bojPridejZvenku === "function") {
    bojPridejZvenku([{n, druh: T && T.n === "Krutý boj" ? "houf" : "sok", pocet: 4, pr: []}], "");
    return;
  }
  navTo("#hra");
});
/* ===== Mapa jako paměť tažení: posuvník po zápisech Kroniky ===== */
{
  const box = document.getElementById("mapcas"),
    r = document.getElementById("mapcasr"),
    o = document.getElementById("mapcaso");
  const popis = () => {
    const n = ZAPISY.length,
      v = +r.value;
    if (v >= n) {
      o.textContent = `teď · ${partyDate()}${partyPos() ? " · " + partyPos().name : ""}`;
      return;
    }
    const z = ZAPISY[v];
    o.textContent = `${z.n || "Zápis " + (v + 1)} · ${z.date || ""}${z.hodina != null ? `, ${z.hodina}:00` : ""} · ${z.place || ""} – ${z.title}`;
  };
  const sync = () => {
    const n = ZAPISY.length;
    box.hidden = !(st.party && n);
    r.max = n;
    if (st.cas == null) r.value = n;
    popis();
  };
  r.addEventListener("input", () => {
    const v = +r.value;
    st.cas = v >= ZAPISY.length ? null : v;
    popis();
    drawMap();
  });
  const lb = document.getElementById("lyParty");
  if (lb)
    lb.addEventListener("click", () =>
      setTimeout(() => {
        if (!st.party) {
          st.cas = null;
        }
        sync();
      }, 0),
    );
  HRA_PO.push(sync);
  sync();
}
/* ===== Měření a cesta z místa kliknutí na místo kliknutí (mapa zemí Koruny) ===== */
{
  const _pp = pickPlace;
  pickPlace = function (n) {
    st._pk = Date.now();
    return _pp(n);
  };
  svg.addEventListener("click", e => {
    if (!st.measure || mapDrag.moved || Date.now() - (st._pk || 0) < 120 || e.target.closest(".partymk,.discmk,.zapmk")) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse()),
      lo = q.x / 72 + 10.9,
      la = 52.7 - q.y / 112,
      n = cNejbliz(lo, la);
    const b = {name: n.d < 2 ? n.n : `bod u: ${n.n} (${n.d} km)`, lo: Math.round(lo * 1000) / 1000, la: Math.round(la * 1000) / 1000, bod: true};
    if (!st.ta || st.tb) {
      st.ta = b;
      st.tb = null;
    } else st.tb = b;
    updateRoute();
    renderTravel();
    drawMap();
  });
  const _rt = renderTravel;
  renderTravel = function () {
    [
      [tFrom, st.ta],
      [tTo, st.tb],
    ].forEach(([sel, q]) => {
      if (q && ![...sel.options].some(o => o.value === q.name)) {
        const op = document.createElement("option");
        op.value = op.textContent = q.name;
        sel.appendChild(op);
      }
    });
    _rt.apply(this, arguments);
    const r = document.getElementById("tres");
    if (r && !st.tb) {
      const p0 = r.querySelector("p");
      if (p0 && !st.ta) p0.textContent = "Klikněte do mapy na dvě místa – sídlo, město nebo kterýkoli bod v krajině –, nebo je vyberte v nabídce.";
    }
    if (GMV && STAV && st.ta && st.tb && st.route && r) r.insertAdjacentHTML("beforeend", cestaMapHtml("k"));
  };
}
/* společné ovládání „Družina vyrazí“ pod měřenou trasou (Koruna i Známý svět) */
function cestaMapHtml(m) {
  return `<div class="trcest" data-trm="${m}"><span class="lbl">Družina</span><select data-trzp aria-label="Jak družina cestuje">${CESTA_ZP.map(([k, n, v]) => `<option value="${k}">${n} (asi ${v} km za den)</option>`).join("")}</select>
  <button type="button" class="gbtn" data-trc="vyrazit" title="Družina vyrazí z výchozího místa teď; s herním časem se posouvá po trase">Vyrazit odsud tam</button><button type="button" class="gbtn ghost" data-trc="dorazit" title="Posune herní čas rovnou na příjezd">Rovnou dorazit</button><span class="trodh"></span></div>`;
}
document.addEventListener("change", e => {
  const s = e.target.closest("[data-trzp]");
  if (s) {
    const b = s.closest(".trcest"),
      P = cestaMapPlan(b);
    b.querySelector(".trodh").textContent = P && !P.chyba ? `odhadem ${P.hod} h, příjezd ${cTxt(P.t1)}` : "";
  }
});
function cestaMapPlan(b) {
  const m = b.dataset.trm,
    A = m === "k" ? st.ta : SM.a,
    B = m === "k" ? st.tb : SM.b;
  if (!A || !B) return null;
  const X = hraX(),
    zp = b.querySelector("[data-trzp]").value;
  return cestaPlan({zP: A, doP: B, svet: m === "s", zp, odch: 1, zdrz: 0, sez: true, datum: `${X.Y}-${p2(X.M)}-${p2(X.D)}`, hodina: X.H ?? 10});
}
document.addEventListener("click", e => {
  const t = e.target.closest("[data-trc]");
  if (!t) return;
  const b = t.closest(".trcest"),
    P = cestaMapPlan(b);
  if (!P) {
    return;
  }
  if (P.chyba) {
    mmHlasG(P.chyba);
    return;
  }
  const m = b.dataset.trm,
    A = m === "k" ? st.ta : SM.a,
    B = m === "k" ? st.tb : SM.b,
    pa = q => (q.bod || !cestaMisto(q.name) ? [+(q.lo ?? q.ll[0]), +(q.la ?? q.ll[1])] : null);
  const cesta = {z: P.z, do: P.do, km: P.km, zpusob: P.zp, track: P.track};
  if (t.dataset.trc === "vyrazit") {
    if (!confirm(`Družina vyrazí: ${P.z} → ${P.do}. Teď je na místě „${P.z}“; dorazí ${cTxt(P.t1)}.`)) return;
    hraUloz({cesta, misto: P.z, poloha: pa(A), praha: null});
  } else {
    if (!confirm(`Rovnou dorazit: ${P.do}? Herní čas se posune na ${cTxt(P.t1)}.`)) return;
    const e2 = P.track[P.track.length - 1];
    hraUloz(
      Object.assign(
        {
          cesta: null,
          misto: P.do,
          poloha: pa(B),
          praha: null,
          putovani: [
            ...((HRA && HRA.putovani) || []),
            {
              z: P.z,
              do: P.do,
              od: cTxt(P.t0),
              pr: cTxt(P.t1),
              t0: P.t0,
              t1: P.t1,
              b: P.track.map(q => [q[1], q[2]]).filter((q, i, a) => i === 0 || i === a.length - 1 || i % 3 === 0),
            },
          ].slice(-80),
        },
        cDat(P.t1),
      ),
    );
  }
});
if (typeof smRender === "function") {
  const _sm = smRender;
  smRender = function () {
    _sm.apply(this, arguments);
    const r = document.getElementById("stres");
    if (GMV && STAV && SM.a && SM.b && r) r.insertAdjacentHTML("beforeend", cestaMapHtml("s"));
  };
}
