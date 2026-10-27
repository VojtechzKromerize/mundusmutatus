/* ===== Výprava: stránka vypravěče (trasa, setkání, počasí na cestě, mapy) – samostatná část „vyprava“, načte se až na stránce Výprava (2026-10-19) ===== */
/*@cast vyprava{*/
/* ---------- výchozí místo a cíl na jednotlivých mapách ---------- */
const vyHraStart = () => {
  const [y, m, d] = herniDen();
  return {datum: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, hodina: HRA && HRA.hodina != null ? +HRA.hodina : 8};
};
function vyPuvod(m) {
  const n = partyPlace() || "",
    pp = typeof partyPos === "function" && typeof cestaAktivni === "function" && cestaAktivni() ? partyPos() : null;
  if (pp && m === "koruna") return {name: pp.name, lo: pp.lo, la: pp.la};
  if (pp && m === "svet") return {name: pp.name, ll: [pp.lo, pp.la], key: ""};
  if (m === "koruna") {
    const p = cestaMisto(n);
    return p ? {name: p.name, lo: p.lo, la: p.la} : null;
  }
  if (m === "svet") {
    const p = cestaMisto(n);
    if (p) return {name: p.name, ll: [p.lo, p.la], key: SVETMESTA.some(c => c[0] === p.name) ? p.name : ""};
    const c = SVETMESTA.find(x => x[0] === n);
    return c ? {name: c[0], ll: [c[1], c[2]], key: c[0]} : null;
  }
  if (m === "praha") {
    const q = HRA && HRA.praha && PRB[HRA.praha];
    return q ? {pt: q.pos, name: `${q.n}. ${q.name}`, key: `p:${q.n}`} : null;
  }
}
function vyOprav(m) {
  if (curView !== "vyprava" || !VY || VY.mapa !== m) return;
  const z = VY.z;
  if (m === "koruna") {
    if (!z && st.ta) VY.z = {name: st.ta.name, lo: st.ta.lo, la: st.ta.la};
    else if (z && (!st.ta || st.ta.name !== z.name)) {
      if (st.ta && !st.tb) st.tb = st.ta;
      st.ta = {name: z.name, lo: z.lo, la: z.la};
      updateRoute();
    }
    VY.do = st.tb ? {name: st.tb.name, lo: st.tb.lo, la: st.tb.la} : null;
  }
  if (m === "svet") {
    if (!z && SM.a) VY.z = SM.a;
    else if (z && (!SM.a || SM.a.name !== z.name || SM.a.ll + "" !== z.ll + "")) {
      if (SM.a && !SM.b) SM.b = SM.a;
      SM.a = z;
    }
    VY.do = SM.b || null;
  }
  if (m === "praha") {
    if (!z && PM.a) VY.z = PM.a;
    else if (z && (!PM.a || PM.a.pt + "" !== z.pt + "")) {
      if (PM.a && !PM.b) PM.b = PM.a;
      PM.a = z;
      PM.path = PM.b && PG ? pmRoute(PM.a.pt, PM.b.pt) : null;
    }
    VY.do = PM.b || null;
  }
}
/* let na drakovi: na mapě i ve výpočtu vzdušnou čarou */
const vyDrakem = () => curView === "vyprava" && VY && VY.zp === "drak";
{
  const _ur = updateRoute;
  updateRoute = function () {
    _ur.apply(this, arguments);
    if (vyDrakem() && st.route && st.ta && st.tb) {
      const a = [st.ta.lo, st.ta.la],
        b = [st.tb.lo, st.tb.la],
        air = Math.round(haversine(a, b));
      st.route = Object.assign({}, st.route, {
        coords: [a, b],
        km: air,
        roadKm: 0,
        offKm: air,
        eff: air,
        names: [st.ta.name, st.tb.name],
        _drak: true,
      });
    }
  };
}
{
  const _sr = smRender;
  smRender = function () {
    _sr.apply(this, arguments);
    if (vyDrakem() && SM.a && SM.b) {
      SM.path = [
        {ll: SM.a.ll, sea: false},
        {ll: SM.b.ll, sea: false},
      ];
      SM._drak = true;
    } else SM._drak = false;
  };
}
{
  const _rt = renderTravel;
  renderTravel = function () {
    vyOprav("koruna");
    _rt.apply(this, arguments);
    vyPoTrase("koruna");
  };
  const _sm = smRender;
  smRender = function () {
    vyOprav("svet");
    _sm.apply(this, arguments);
    vyPoTrase("svet");
  };
  const _pm = pmRender;
  pmRender = function () {
    vyOprav("praha");
    _pm.apply(this, arguments);
    vyPoTrase("praha");
  };
  const _dm = drawMap;
  drawMap = function () {
    _dm.apply(this, arguments);
    vyZnacky("koruna");
  };
  const _sd = sDraw;
  sDraw = function () {
    _sd.apply(this, arguments);
    vyZnacky("svet");
  };
  const _pd = pDraw;
  pDraw = function () {
    _pd.apply(this, arguments);
    vyZnacky("praha");
  };
}
let vyPoTm = 0;
function vyPoTrase(m) {
  if (curView !== "vyprava" || !VY || VY.mapa !== m) return;
  clearTimeout(vyPoTm);
  vyPoTm = setTimeout(() => {
    vyZmena();
  }, 30);
}
/* zapne měření na zvolené mapě a nastaví výchozí místo a cíl z uloženého stavu */
function vyMapaZapni() {
  const m = VY.mapa;
  if (m === "koruna") {
    st.measure = true;
    const b = document.getElementById("lyMeasure");
    if (b) b.setAttribute("aria-pressed", "true");
    document.getElementById("travel").hidden = false;
    if (!VY.z) VY.z = vyPuvod("koruna");
    if (VY.z) {
      st.ta = {...VY.z};
      st.tb = VY.do ? {...VY.do} : null;
      updateRoute();
    }
    renderTravel();
    drawMap();
    return;
  }
  if (m === "svet") {
    svInit();
    const go = () => {
      if (curView !== "vyprava" || !VY || VY.mapa !== m) return; // mezitím odešel z Výpravy (čekání na data mapy, 2026-10-22)
      if (!SG) {
        setTimeout(go, 120);
        return;
      }
      SM.on = true;
      const b = document.getElementById("smeasure");
      b.setAttribute("aria-pressed", "true");
      document.getElementById("smap").classList.add("measuring");
      document.getElementById("stravel").hidden = false;
      if (!VY.z) VY.z = vyPuvod("svet");
      if (VY.z) {
        SM.a = VY.z;
        SM.b = VY.do || null;
      }
      smRender();
      sDraw();
    };
    go();
    return;
  }
  if (m === "praha") {
    praInit();
    const go = () => {
      if (curView !== "vyprava" || !VY || VY.mapa !== m) return; // mezitím odešel z Výpravy (čekání na data mapy, 2026-10-22)
      if (!PG) {
        setTimeout(go, 120);
        return;
      }
      PM.on = true;
      const b = document.getElementById("pmeasure");
      b.setAttribute("aria-pressed", "true");
      document.getElementById("pmap").classList.add("measuring");
      document.getElementById("ptravel").hidden = false;
      if (!VY.z) VY.z = vyPuvod("praha");
      if (VY.z) {
        PM.a = VY.z;
        PM.b = VY.do || null;
        PM.path = PM.b ? pmRoute(PM.a.pt, PM.b.pt) : null;
      }
      pmRender();
      pDraw();
    };
    go();
  }
}
const VY_BOXY = {svet: "smapbox", koruna: "kmapbox", praha: "pmapbox"};
function vyVrat(view) {
  if (view === "vyprava") return;
  if (st.route && st.route._drak) {
    updateRoute();
    renderTravel();
  }
  if (SM._drak && SG) smRender();
  Object.values(VY_BOXY).forEach(id => {
    const b = document.getElementById(id),
      h = document.getElementById(id + "-domov");
    if (b && h && b.previousElementSibling !== h) h.after(b);
  });
}
function vyVlozMapu() {
  const slot = document.getElementById("vyslot");
  if (!slot) return;
  const id = VY_BOXY[VY.mapa];
  Object.entries(VY_BOXY).forEach(([m, bid]) => {
    if (m !== VY.mapa) {
      const b = document.getElementById(bid),
        h = document.getElementById(bid + "-domov");
      if (b && h && b.previousElementSibling !== h) h.after(b);
    }
  });
  const b = document.getElementById(id);
  if (b && b.parentNode !== slot) slot.appendChild(b);
}

/* ---------- trasa, časový průběh, obtížnost, setkání ---------- */
function vyTrasa() {
  const m = VY.mapa,
    zp = VY_ZP.find(z => z[0] === VY.zp) || VY_ZP[0],
    drak = zp[0] === "drak";
  if (m === "koruna") {
    if (!st.ta || !st.tb || !st.route) return null;
    const R = st.route,
      a = [st.ta.lo, st.ta.la],
      b = [st.tb.lo, st.tb.la],
      air = haversine(a, b);
    return {
      m,
      z: st.ta.name,
      do: st.tb.name,
      km: drak ? Math.round(air) : R.km,
      h: ((drak ? air : R.eff) / zp[2]) * 12,
      pts: drak ? [a, b] : R.coords,
      mor: null,
      ratio: R.eff / Math.max(1, R.km),
      silnice: R.roadKm,
      mimo: R.offKm,
      names: drak ? [st.ta.name, st.tb.name] : R.names,
    };
  }
  if (m === "svet") {
    if (!SM.a || !SM.b || !SG) return null;
    const air = haversine(SM.a.ll, SM.b.ll),
      nm = q => q.key || q.name;
    if (drak)
      return {
        m,
        z: nm(SM.a),
        do: nm(SM.b),
        km: Math.round(air),
        h: (air / zp[2]) * 12,
        pts: [SM.a.ll, SM.b.ll],
        mor: [false, false],
        more: 0,
        names: [nm(SM.a), nm(SM.b)],
      };
    const R = sRoute(SM.a, SM.b, zp[2], 110);
    if (!R) {
      const L = air * 1.3;
      return {
        m,
        z: nm(SM.a),
        do: nm(SM.b),
        km: Math.round(L),
        h: (L / zp[2]) * 12,
        pts: [SM.a.ll, SM.b.ll],
        mor: [false, false],
        more: 0,
        names: [nm(SM.a), nm(SM.b)],
      };
    }
    return {
      m,
      z: nm(SM.a),
      do: nm(SM.b),
      km: R.land + R.sea,
      h: (R.land / zp[2] + R.sea / 110) * 12,
      pts: R.path.map(q => q.ll),
      mor: R.path.map(q => q.sea),
      more: R.sea / Math.max(1, R.land + R.sea),
      names: [nm(SM.a), nm(SM.b)],
    };
  }
  if (m === "praha") {
    if (!PM.a || !PM.b || !PG) return null;
    const P = PM.path,
      st0 = Math.hypot(PM.a.pt[0] - PM.b.pt[0], PM.a.pt[1] - PM.b.pt[1]),
      mm = P ? P.len * PMU : st0 * 1.3 * PMU;
    return {
      m,
      z: PM.a.name,
      do: PM.b.name,
      km: mm / 1000,
      metry: mm,
      h: mm / 1000 / (zp[3] || 4),
      pts: P ? P.pts : [PM.a.pt, PM.b.pt],
      plan: true,
      names: [PM.a.name, PM.b.name],
    };
  }
  return null;
}
/* bod na trase v poměru p (0–1) */
function vyBod(T, p) {
  const pts = T.pts,
    d = T.plan ? (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) : haversine;
  let L = 0;
  const seg = [];
  for (let i = 1; i < pts.length; i++) {
    const x = d(pts[i - 1], pts[i]);
    seg.push(x);
    L += x;
  }
  let t = p * L;
  for (let i = 0; i < seg.length; i++) {
    if (t <= seg[i] || i === seg.length - 1) {
      const f = seg[i] ? Math.min(1, t / seg[i]) : 0,
        a = pts[i],
        b = pts[i + 1];
      return {xy: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], more: !!(T.mor && T.mor[i + 1])};
    }
    t -= seg[i];
  }
  return {xy: pts[0], more: false};
}
const vyLL = (T, q) => (T.plan ? [14.42, 50.088] : q.xy);
function vyKrajBodu(T, q) {
  if (T.plan) return "mesto";
  if (q.more) return "voda";
  const [lo, la] = q.xy;
  /* drak letí i nad mořem a zálivy (2026-10-27) */
  if (naVode(lo, la)) return "voda";
  /* kraje zpustlé válkou (2026-10-26): kde zle (míra 2), vždy „válka“; kde místy, jen v otevřené krajině */
  const zp = zpustlyKraj(lo, la);
  if (zp && zp[1] > 1) return "valka";
  if (lo > 11.8 && lo < 19 && la > 48.5 && la < 51.3) {
    if (nearMountain(lo, la)) return "hory";
    /* bažiny (2026-10-26): setkání jako u řek – brody, rybáři, blátivé cesty */
    if (BAZINY.some(([, p]) => inPoly(lo, la, p))) return "voda";
    if (FORESTS.some(p => inPoly(lo, la, p))) return "les";
  }
  return zp ? "valka" : "pole";
}
/* přechody na trase (2026-10-26): průsmyky, mosty, brody a přívozy do 5 km od cesty; zdržení podle počasí v den přechodu */
function vyPrechody(H0) {
  if (VYT.m !== "koruna" || VY.zp === "drak") return [];
  const s = VY.start || vyHraStart(),
    j0 = jdn(...s.datum.split("-").map(Number));
  return prechodyNaTrase(VYT.pts).map(x => {
    const j = j0 + Math.floor((x.p * H0) / 12);
    return Object.assign(x, {j, st: prechodStav(x.druh, x.sez, vyGreg(j)[1], vyPocasi(j, [x.lo, x.la]))});
  });
}
function vyPrepocti() {
  VYT = vyTrasa();
  VYS = null;
  if (!VYT) return;
  const zp = VY.zp,
    tempo = (VY_TEMPO[VY.tempo] || VY_TEMPO.normal)[1],
    H0 = VYT.h * (+VY.odch || 1) * tempo;
  const praha = VYT.plan,
    meze = praha ? [0.6, 2.4, 7.2, 16.8] : [6, 24, 72, 168];
  let dl = H0 < meze[0] ? 0 : H0 < meze[1] ? 1 : H0 < meze[2] ? 2 : H0 < meze[3] ? 3 : 4;
  const delka = dl;
  if (!dl && VY.hratKratkou) dl = 1;
  /* setkání */
  const dr = vyDruzina().filter(x => x.n.trim()),
    hody = dr.map(x => x.gc).filter(Boolean),
    ok = hody.filter(x => x === "ok").length;
  let gc = null;
  if (dr.length && hody.length === dr.length) {
    gc = ok === dr.length ? -1 : ok > dr.length / 2 ? 0 : ok === 0 ? 2 : 1;
  }
  let n = dl ? dl + (gc || 0) : 0;
  if (dl && gc === -1) n = Math.max(1, n);
  if (dl) {
    if (VY.nepritelS) n++;
    if (VY.tempo === "spech") n = Math.max(1, n - 1);
    if (VY.tempo === "opatrne") n++;
    n += (+VY.navic || 0) + (VY.odp ? 1 : 0) + (VY.revir && VY.zp === "drak" ? 1 : 0);
  }
  /* setkání navíc prodlužují cestu (každé o desetinu, nejméně 2 h; v Praze o čtvrthodinu) */
  const zakl = dl ? Math.max(1, dl + (gc || 0)) : 0,
    navic = Math.max(0, n - zakl),
    zdrzSetk = navic * (praha ? 0.25 : Math.max(2, H0 * 0.1));
  const prech = vyPrechody(H0),
    zdrzPrech = prech.reduce((a, x) => a + (x.st ? x.st.h : 0), 0);
  const H = Math.max(praha ? 0.05 : 1, H0 + (+VY.zdrz || 0) + zdrzSetk + zdrzPrech);
  /* časový průběh po dnech: putuje se od východu slunce, nejvýš 12 hodin denně */
  const s = VY.start || vyHraStart();
  let [y, m, d] = s.datum.split("-").map(Number),
    j = jdn(y, m, d),
    h = +s.hodina || 0,
    p = 0;
  const dny = [];
  if (praha) {
    const P = vyPocasi(j, [14.42, 50.088]),
      f = vyRychl(P, zp) || 1,
      t = H / f;
    dny.push({j, od: h, do: h + t, p0: 0, p1: 1, P, f, q: vyBod(VYT, 0.5)});
    h += t;
    while (h >= 24) {
      h -= 24;
      j++;
    }
  } else
    for (let g = 0; g < 500 && p < 1 - 1e-9; g++) {
      const q = vyBod(VYT, Math.min(p + 0.02, 1)),
        ll = vyLL(VYT, q),
        P = vyPocasi(j, ll, q.more),
        [sr, ss] = vyDen(j, ll[1]),
        od = Math.ceil(sr),
        ko = od + Math.min(zp === "drak" ? 8 : 12, Math.floor(ss) - od);
      if (h < od) h = od;
      if (h >= ko) {
        j++;
        h = 0;
        continue;
      }
      const f = vyRychl(P, zp, q.more);
      if (f <= 0) {
        dny.push({j, od: h, do: h, p0: p, p1: p, P, f, q, stuj: true});
        j++;
        h = 0;
        continue;
      }
      const t = Math.min(ko - h, ((1 - p) * H) / f),
        p1 = Math.min(1, p + (t * f) / H);
      dny.push({j, od: h, do: h + t, p0: p, p1, P, f, q});
      h += t;
      p = p1;
      if (p >= 1 - 1e-9) break;
      j++;
      h = 0;
    }
  const prijH = Math.ceil(h - 1e-6);
  if (prijH >= 24) {
    j++;
  }
  /* počasí a terén pro obtížnost */
  const tot = dny.reduce((a, x) => a + Math.max(0.5, x.do - x.od), 0) || 1,
    Wa = dny.reduce((a, x) => a + x.P.w * Math.max(0.5, x.do - x.od), 0) / tot;
  const W = VY.pocasiV != null ? +VY.pocasiV : Math.round(Wa);
  let Ta = 1;
  if (VYT.m === "koruna") Ta = Math.max(1, Math.min(10, Math.round(2 + (VYT.ratio - 1) * 4)));
  else if (VYT.m === "svet") Ta = Math.round(3 * (1 - (VYT.more || 0)) + 2 * (VYT.more || 0));
  if (zp === "drak") Ta = 1;
  const bl =
    zp === "drak" || praha
      ? 0
      : Math.round(dny.reduce((a, x) => a + (x.P.blato + (x.P.snih >= 5 ? 2 : x.P.snih >= 3 ? 1 : 0)) * Math.max(0.5, x.do - x.od), 0) / tot);
  const T = VY.teren != null ? +VY.teren : Math.min(10, Ta + bl);
  let prip = 0;
  const pr = [];
  if (VY.rychle) {
    prip = VY.rychleK != null ? VY.rychleK : dr.length;
    pr.push(`bez příprav −${prip}`);
  } else
    dr.forEach(x => {
      const P = VY_PRIP.find(q => q.k === x.prip);
      if (!P || !x.pv) return;
      let o = 0;
      if (x.pv === "ok" || x.pv === "ok5") o = (P.o || 0) + (x.pv === "ok5" && P.o5 ? P.o5 : 0);
      if (x.pv === "fail" || x.pv === "fail5") o = P.f || 0;
      if (o) {
        prip -= o;
        pr.push(`${P.n} ${o > 0 ? "+" : "−"}${Math.abs(o)}`);
      }
    });
  let D = Math.max(10, 10 + W + T + (+VY.nepritel || 0) - prip);
  if (VY.tempo === "spech") D += 5;
  if (VY.tempo === "opatrne") D = Math.max(10, D - 3);
  /* setkání: rozložená rovnoměrně po trase */
  const S = VY.setk || (VY.setk = []);
  while (S.length < n) S.push({id: vyId(), kraj: "", typ: null, typ2: null, zaz: null, vys: "", pozn: "", hotovo: false, navic: S.length >= zakl});
  if (S.length > n) {
    const prazdne = S.filter(x => x.typ == null && !x.pozn && !x.hotovo);
    while (S.length > n && prazdne.length) {
      S.splice(S.indexOf(prazdne.pop()), 1);
    }
    if (S.length > n) S.length = n;
  }
  S.forEach((x, i) => {
    const pe = (i + 0.5) / n,
      q = vyBod(VYT, pe),
      dd = dny.find(z => pe <= z.p1 + 1e-9 && !z.stuj) || dny[dny.length - 1];
    x._p = pe;
    x._q = q;
    x._kraj = vyKrajBodu(VYT, q);
    x._j = dd ? dd.j : j;
    x._h = dd ? dd.od + (dd.p1 > dd.p0 ? (pe - dd.p0) / (dd.p1 - dd.p0) : 0) * (dd.do - dd.od) : 0;
    x._kde = VYT.m === "koruna" ? vyBlizko(q.xy) : VYT.m === "svet" ? (q.more ? "na moři" : vyNejblizsiMesto(q.xy)) : "Praha";
  });
  VYS = {
    H0,
    H,
    dl,
    delka,
    gc,
    n,
    zakl,
    navic,
    zdrzSetk,
    prech,
    zdrzPrech,
    dny,
    prij: {j, h: prijH % 24},
    W,
    Wa,
    T,
    Ta,
    bl,
    prip,
    pr,
    D,
    dr,
    reviry: vyReviry(VYT),
  };
}
function vyBlizko(ll) {
  let b = null,
    bd = 1e9;
  for (const [n, lo, la] of NAMEPTS) {
    const d = haversine(ll, [lo, la]);
    if (d < bd) {
      bd = d;
      b = n;
    }
  }
  return !b ? "cestou" : bd < 4 ? b : bd < 30 ? "nedaleko: " + b : "cestou";
}
function vyNejblizsiMesto(ll) {
  let b = null,
    bd = 1e9;
  SVETMESTA.forEach(c => {
    const d = haversine(ll, [c[1], c[2]]);
    if (d < bd) {
      bd = d;
      b = c[0];
    }
  });
  return bd < 120 ? "u města " + b : "cestou";
}
const vyDatum = j => {
  const [y, m, d] = fromJdn(j);
  return `${d}. ${MES[m - 1]} ${y}`;
};
const vyDobaDne = h => (h < 9 ? "ráno" : h < 12 ? "dopoledne" : h < 14 ? "v poledne" : h < 17 ? "odpoledne" : h < 20 ? "k večeru" : "v noci");
const vyTrvani = h => {
  if (h < 1) {
    const m = Math.max(1, Math.round(h * 60));
    return `${m} min`;
  }
  const d = Math.floor(h / 12),
    r = Math.round(h - d * 12);
  return h < 12 ? `${Math.round(h)} h` : `${Math.round(h)} h (${d} ${d === 1 ? "den" : d < 5 ? "dny" : "dní"}${r ? ` a ${r} h` : ""} pochodu)`;
};

/* ---------- vykreslení ---------- */
function renderVyprava() {
  const box = document.getElementById("vyview");
  if (!box) return;
  if (!GMV) {
    box.innerHTML = `<h2 class="arttitle">Výprava</h2><p class="intro">Tato stránka je jen pro vypravěče.</p>`;
    return;
  }
  if (!VY_NACTENO) {
    box.innerHTML = `<h2 class="arttitle">Výprava</h2><p class="intro">Načítám…</p>`;
    vyNacti().then(() => {
      /* mezitím odešel jinam, nebo Výpravu otevřel dvakrát během načítání a první volání už ji vykreslilo: v boxu je přesunutá
         mapa a smazání boxu by ji zničilo („Cannot set properties of null“ v CI, 2026-10-22) */
      if (curView !== "vyprava" || box.querySelector("#vyslot")) return;
      box.innerHTML = "";
      renderVyprava();
      vyZverejniPocasi();
    });
    return;
  }
  if (!box.querySelector("#vyslot")) {
    box.innerHTML = `<div class="bojhead vyhead"><div class="bojtit"><h2 class="arttitle">Výprava</h2><p class="bojlead">Cesta družiny podle pravidel Uncharted Journeys.</p></div>
      <div class="bojbtn"><button type="button" class="gbtn ghost" data-vy="zhry" title="Výchozí místo, datum a hodinu vezme z herního stavu">Převzít polohu a čas družiny</button><button type="button" class="gbtn ghost" data-vy="stul" aria-pressed="false" title="Zjednodušené zobrazení na tablet: počasí dne, kostky a aktuální setkání">U stolu</button><button type="button" class="gbtn ghost" data-vy="nova">Nová výprava</button></div></div>
      <div class="controls vytabs" role="group" aria-label="Mapa">${[
        ["svet", "Známý svět"],
        ["koruna", "Země Koruny"],
        ["praha", "Praha"],
      ]
        .map(([k, n]) => `<button type="button" data-vymapa="${k}" aria-pressed="${VY.mapa === k}">${n}</button>`)
        .join("")}</div>
      <div id="vyzpet"></div>
      <div class="vygrid"><div class="vyslot" id="vyslot"></div><aside class="vyside" id="vyside"></aside></div>
      <div id="vypanely" class="vypanely"></div>`;
  }
  box.querySelectorAll("[data-vymapa]").forEach(b => b.setAttribute("aria-pressed", b.dataset.vymapa === VY.mapa));
  vyVlozMapu();
  vyMapaZapni();
  vyPrepocti();
  vyPanely();
}
function vyPanely() {
  const side = document.getElementById("vyside"),
    pan = document.getElementById("vypanely");
  if (!side || !pan) return;
  const f =
    document.activeElement && pan.contains(document.activeElement) && document.activeElement.matches("input,select,textarea")
      ? document.activeElement.getAttribute("data-vyf") || document.activeElement.name
      : null;
  document.getElementById("vyview").classList.toggle("vystul", !!VY.stul);
  {
    const z = document.getElementById("vyzpet");
    if (z) {
      const o = !!(z.querySelector("details") || {}).open;
      z.innerHTML = hraZpetHtml();
      if (o) z.querySelector("details").open = true;
    }
  }
  side.innerHTML = vyHtmlTrasa();
  pan.innerHTML = VYT ? (VY.stul ? vyHtmlStul() : vyHtmlPanely()) : "";
  const sb = document.querySelector('[data-vy="stul"]');
  if (sb) sb.setAttribute("aria-pressed", !!VY.stul);
  if (f) {
    const e = pan.querySelector(`[data-vyf="${f}"]`) || pan.querySelector(`[name="${f}"]`);
    if (e) e.focus();
  }
}
function vyHtmlTrasa() {
  const S = VY.start || vyHraStart(),
    zp = VY_ZP.filter(z => VY.mapa !== "praha" || z[0] !== "drak");
  const kde = VY.z ? VY.z.name : "–",
    cil = VY.do ? VY.do.name : "";
  let out = `<section class="vycard"><h3 class="uvh2">Trasa</h3>
    <dl class="kv vykv"><dt>Odkud</dt><dd>${besc(kde)}${VY.z ? "" : " <small>(klikni na mapu – první bod je výchozí)</small>"}</dd><dt>Kam</dt><dd>${cil ? `<b>${besc(cil)}</b>` : "<small>vyber cíl kliknutím do mapy</small>"}</dd>
    <dt>Vyráží</dt><dd>${vyDatum(jdn(...S.datum.split("-").map(Number)))}, ${S.hodina}:00</dd></dl>
    <form class="gmhraf vyform" onsubmit="return false">
      <label>Jak<select data-vyf="zp">${zp.map(([k, n, v, kmh]) => `<option value="${k}"${VY.zp === k ? " selected" : ""}>${n}${VY.mapa === "praha" ? ` · ${kmh} km/h` : ` · ${mileTxt(v)}/den`}</option>`).join("")}</select></label>
      <label>Tempo<select data-vyf="tempo">${Object.entries(VY_TEMPO)
        .map(([k, [n]]) => `<option value="${k}"${VY.tempo === k ? " selected" : ""}>${n}</option>`)
        .join("")}</select></label>
      <label>Oproti odhadu<select data-vyf="odch">${VY_ODCH.map(([v, n]) => `<option value="${v}"${+VY.odch === v ? " selected" : ""}>${n}</option>`).join("")}</select></label>
      <label>Zdržení (h)<input data-vyf="zdrz" type="number" step="1" min="-48" max="240" value="${+VY.zdrz || 0}"></label>
      <label>Odjezd<input data-vyf="datum" type="date" value="${S.datum}" min="1400-01-01" max="1500-12-31"></label>
      <label>Hodina<select data-vyf="hodina">${Array.from({length: 24}, (_, h) => `<option value="${h}"${+S.hodina === h ? " selected" : ""}>${h}:00</option>`).join("")}</select></label>
    </form>`;
  if (!VYT) {
    return (
      out +
      `<p class="rsmall">${VY.z ? "Klikni na mapě na cíl cesty." : "Výchozí místo družiny na této mapě neznám. Klikni na mapu na výchozí místo, pak na cíl."}</p></section>`
    );
  }
  const X = VYS,
    dl = VY_DELKA[X.dl];
  out += `<div class="tgrid vytg"><div><b>Vzdálenost</b>${VYT.plan ? (VYT.metry < 1000 ? `${Math.round(VYT.metry / 10) * 10} m` : `${VYT.km.toFixed(1).replace(".", ",")} km`) : `asi ${mileTxt(VYT.km)}`}</div>
      <div><b>Na cestě</b>${vyTrvani(X.H)}</div><div><b>Příjezd</b>${vyDatum(X.prij.j)}, ${X.prij.h}:00</div><div><b>Délka</b>${dl[1]}</div><div><b>Obtížnost</b>SO ${X.D}${X.dl ? ` · ${X.n} ${X.n === 1 ? "setkání" : "setkání"}` : ""}</div></div>
    ${VYT.m === "koruna" && VY.zp !== "drak" ? `<p class="lbl">${VYT.silnice >= 5 ? `${mileTxt(VYT.silnice)} po stezkách` : "bez stezek"}${VYT.mimo >= 5 ? `, ${mileTxt(VYT.mimo)} mimo ně` : ""} · ${VYT.names.join(" – ")}</p>` : ""}
    ${VYT.m === "svet" && VYT.more ? `<p class="lbl">Z toho asi ${mileTxt(VYT.km * VYT.more)} lodí.</p>` : ""}
    ${X.zdrzSetk ? `<p class="lbl">Setkání navíc prodlužují cestu o ${vyTrvani(X.zdrzSetk)}.</p>` : ""}
    ${X.prech.length ? `<p class="lbl">Přechody na cestě</p><ul class="gmclist vyprech">${X.prech.map(x => `<li><b>${besc(x.n)}</b> <small>${PRECH_DRUH[x.druh].toLowerCase()}</small>${x.st ? ` – ${vyDatum(x.j)}: ${x.st.t} (o ${vyTrvani(x.st.h)} déle)` : ""}</li>`).join("")}</ul>` : ""}
    ${!X.delka ? `<p class="vypozn">Pod ${VYT.plan ? "40 minut" : "6 hodin"} cesty stačí vyprávění. <label class="vychk"><input type="checkbox" data-vyf="hratKratkou"${VY.hratKratkou ? " checked" : ""}> přesto hrát jako krátkou výpravu</label></p>` : ""}
    ${X.reviry && X.reviry.length ? `<p class="vypozn"><b>Dračí revíry na trase:</b> ${X.reviry.map(r => `<a href="#draconomicon/${r.d.id}">${besc(r.d.n)}</a> (${besc(r.kde)})`).join(", ")}. Divocí draci brání revír i proti drakům s jezdcem. <label class="vychk"><input type="checkbox" data-vyf="revir"${VY.revir ? " checked" : ""}> přidat setkání za přelet revíru</label></p>` : ""}
    ${VY.zp === "drak" ? `<p class="rsmall">Drak letí nejvýš 8 hodin denně; v bouři a vichřici nevzlétne.</p>` : ""}
    ${vyPoCeste()}
    <div class="gmhrab">${VYT.plan ? "" : `<button type="button" class="gbtn" data-vy="vyrazit-cas"${VY.do ? "" : " disabled"} title="Družina vyrazí teď a s každou hodinou herního času se posune po trase">Vyrazit</button>`}<button type="button" class="gbtn${VYT.plan ? "" : " ghost"}" data-vy="odcestovat"${VY.do ? "" : " disabled"} title="Posune herní čas rovnou na příjezd a praporec do cíle">Rovnou dorazit</button></div></section>`;
  return out;
}
function vyPocasiRadek(x, i) {
  const P = x.P,
    dat = vyDat(x.j);
  return `<li class="vyden${P.rucne ? " vyruc" : ""}"><div class="vydh"><b>${vyDatum(x.j)}</b><span class="vyw" title="Hodnota počasí pro obtížnost (1–10)">${P.w}</span>
      <small>${VYT.plan ? "Praha" : besc(VYT.m === "koruna" ? vyBlizko(x.q.xy) : x.q.more ? "na moři" : vyNejblizsiMesto(x.q.xy))} · ${x.stuj ? "stojí se" : `${vyHod(x.od)}–${vyHod(x.do)}`}</small>
      <span class="vydb"><button type="button" class="gbtn ghost" data-vypoc="jine" data-dat="${dat}" title="Hodit jiné počasí pro tento den">Jiné počasí</button><button type="button" class="gbtn ghost" data-vypoc="rucne" data-dat="${dat}">Upravit</button>${P.rucne || P.salt ? `<button type="button" class="gbtn ghost" data-vypoc="zpet" data-dat="${dat}">Původní</button>` : ""}</span></div>
    <p>${besc(P.text)}</p>
    <p class="rsmall">Přes den kolem ${Math.round(P.tx)} °C, v noci ${Math.round(P.tn)} °C · ${VY_REZ[P.rz].n}${x.f < 1 && !x.stuj ? ` · postup ${Math.round(x.f * 100)} %` : ""}${P.drak ? ` · draci: ${besc(P.drak)}` : ""}</p>
    ${P.zav ? `<p class="vyzav">Závoj: ${besc(P.zav)}</p>` : ""}</li>`;
}
function vyHtmlPanely() {
  const X = VYS,
    dr = vyDruzina();
  /* počasí */
  const sr = vyDen(
    X.dny.length ? X.dny[0].j : jdn(...(VY.start || vyHraStart()).datum.split("-").map(Number)),
    VYT.plan ? 50.09 : vyLL(VYT, vyBod(VYT, 0))[1],
  );
  const S = {};
  S.pocasi = `<section class="vycard vypoc"><h3 class="uvh2">Počasí <small>slunce vychází v ${vyHod(Math.round(sr[0] * 4) / 4)}, zapadá v ${vyHod(Math.round(sr[1] * 4) / 4)}</small></h3>
    <p class="rsmall">Počasí dne podle polohy družiny vidí hráči na Úvodu; ruční úpravy se jim přenesou.</p>
    <ol class="vydny">${X.dny.slice(0, 21).map(vyPocasiRadek).join("")}</ol>${X.dny.length > 21 ? `<p class="rsmall">…a dalších ${X.dny.length - 21} dní.</p>` : ""}</section>`;
  S.noci = vyHtmlNoci();
  /* obtížnost */
  S.obt = `<section class="vycard"><h3 class="uvh2">Obtížnost <span class="vydc">SO ${X.D}</span></h3>
    <table class="vytab"><tr><td>Základ</td><td>10</td><td></td></tr>
    <tr><td>Počasí <small>(průměr ${X.Wa.toFixed(1).replace(".", ",")})</small></td><td>+${X.W}</td><td><input data-vyf="pocasiV" type="number" min="1" max="10" placeholder="auto" value="${VY.pocasiV ?? ""}" aria-label="Počasí ručně"></td></tr>
    <tr><td>Terén <small>(${VYT.m === "koruna" && VY.zp !== "drak" ? `trasa ${X.Ta}${X.bl ? `, bláto a sníh +${X.bl}` : ""}` : `odhad ${X.Ta}`})</small></td><td>+${X.T}</td><td><input data-vyf="teren" type="number" min="1" max="10" placeholder="auto" value="${VY.teren ?? ""}" aria-label="Terén ručně"></td></tr>
    <tr><td>Nepřítel škodí družině</td><td>+${+VY.nepritel || 0}</td><td><input data-vyf="nepritel" type="number" min="0" max="10" value="${+VY.nepritel || 0}" aria-label="Nepřítel"></td></tr>
    <tr><td>Přípravy${X.pr.length ? ` <small>(${X.pr.join(", ")})</small>` : ""}</td><td>${X.prip ? `−${X.prip}` : "0"}</td><td></td></tr>
    ${VY.tempo === "spech" ? `<tr><td>Spěch</td><td>+5</td><td></td></tr>` : VY.tempo === "opatrne" ? `<tr><td>Opatrně</td><td>−3</td><td></td></tr>` : ""}</table>
    <label class="vychk"><input type="checkbox" data-vyf="nepritelS"${VY.nepritelS ? " checked" : ""}> nepřítel přidá vlastní setkání</label>
    <p class="rsmall">Přípravy nesníží obtížnost pod 10. ${VY.tempo === "spech" ? "Spěch: o setkání méně, všechny záchrany s nevýhodou." : VY.tempo === "opatrne" ? "Opatrně: o setkání víc, pomalejší postup." : ""}</p></section>`;
  /* družina */
  const role = Object.entries(VY_ROLE),
    poc = {};
  dr.forEach(x => {
    if (x.role) poc[x.role] = (poc[x.role] || 0) + 1;
  });
  const vars = [];
  const nn = dr.filter(x => x.n.trim()).length;
  if (nn && nn < 4 && role.some(([k]) => !poc[k]) && !dr.some(x => x.role2))
    vars.push("Méně než čtyři postavy: někdo vezme druhou roli (hází za ni s nevýhodou, ale má její schopnost).");
  Object.entries(poc).forEach(([k, c]) => {
    if (c > 2) vars.push(`${VY_ROLE[k].n}: nejvýš dvě postavy.`);
    else if (c === 2) vars.push(`${VY_ROLE[k].n}: dvě postavy – hází jen jedna (střídají se) s výhodou, schopnost role použije jen jedna.`);
    else if (c > 1 && nn <= 4) vars.push(`${VY_ROLE[k].n} je dvakrát – každá role má mít jinou postavu.`);
  });
  S.dr = `<section class="vycard vydr"><h3 class="uvh2">Družina a příprava ${VY.rychle ? "" : `<small>přípravy SO 13</small>`}</h3>
    <div class="vytabw"><table class="vytab vytabd"><thead><tr><th>Postava</th><th>Víra</th><th>Role</th><th title="Bonus zdatnosti">BZ</th>${VY.rychle ? "" : "<th>Příprava</th><th>Výsledek</th>"}<th>Hod na cestu (SO ${X.D})</th><th></th></tr></thead><tbody>
    ${dr
      .map((x, i) => {
        const R = VY_ROLE[x.role];
        return `<tr data-vyi="${i}"><td><input data-vyf="d${i}n" data-vyd="n" value="${besc(x.n)}" placeholder="Jméno" aria-label="Jméno postavy"></td>
      <td><select data-vyf="d${i}f" data-vyd="vira" aria-label="Víra"><option value="">—</option>${[
        ["kal", "kališník"],
        ["kat", "katolík"],
        ["old", "starověrec"],
      ]
        .map(([k, n]) => `<option value="${k}"${x.vira === k ? " selected" : ""}>${n}</option>`)
        .join("")}</select></td>
      <td><select data-vyf="d${i}r" data-vyd="role" aria-label="Role"><option value="">—</option>${role.map(([k, r]) => `<option value="${k}"${x.role === k ? " selected" : ""}>${r.n}</option>`).join("")}</select>
        ${nn < 4 || x.role2 ? `<select data-vyf="d${i}r2" data-vyd="role2" aria-label="Druhá role" class="vyr2"><option value="">+ druhá role</option>${role.map(([k, r]) => `<option value="${k}"${x.role2 === k ? " selected" : ""}>${r.n}</option>`).join("")}</select>` : ""}</td>
      <td><input data-vyf="d${i}b" data-vyd="bz" type="number" min="2" max="6" value="${x.bz || 2}" class="vynum" aria-label="Bonus zdatnosti"></td>
      ${
        VY.rychle
          ? ""
          : `<td><select data-vyf="d${i}p" data-vyd="prip" aria-label="Příprava"><option value="">—</option>${VY_PRIP.map(p => `<option value="${p.k}"${x.prip === p.k ? " selected" : ""}>${p.n}</option>`).join("")}</select></td>
      <td><select data-vyf="d${i}v" data-vyd="pv" aria-label="Výsledek přípravy"><option value="">—</option><option value="ok"${x.pv === "ok" ? " selected" : ""}>úspěch</option><option value="ok5"${x.pv === "ok5" ? " selected" : ""}>úspěch o 5+</option><option value="fail"${x.pv === "fail" ? " selected" : ""}>neúspěch</option><option value="fail5"${x.pv === "fail5" ? " selected" : ""}>neúspěch o 5+</option></select></td>`
      }
      <td>${R ? `<select data-vyf="d${i}h" data-vyd="hod" aria-label="Co hází">${R.hod.map((t, k) => `<option value="${k}"${+x.hod === k ? " selected" : ""}>${besc(t)}</option>`).join("")}</select>` : `<small>vyber roli</small>`}
        <span class="vygc" role="group" aria-label="Výsledek hodu na cestu"><button type="button" data-vygc="${i}" data-v="ok" aria-pressed="${x.gc === "ok"}" title="uspěl">✓</button><button type="button" data-vygc="${i}" data-v="fail" aria-pressed="${x.gc === "fail"}" title="neuspěl">✗</button></span></td>
      <td><button type="button" class="bx" data-vydel="${i}" aria-label="Odebrat">×</button></td></tr>`;
      })
      .join("")}</tbody></table></div>
    <div class="vyrow"><button type="button" class="badd" data-vy="pridat">+ Přidat postavu</button>
      <label class="vychk"><input type="checkbox" data-vyf="rychle"${VY.rychle ? " checked" : ""}> bez příprav: obtížnost −1 za každou postavu</label>
      ${VY.rychle ? `<button type="button" class="gbtn ghost" data-vy="rychlek8" title="Místo −1 za postavu hodit k8">${VY.rychleK != null && VY.rychleK !== X.dr.length ? `hodit k8 (padlo ${VY.rychleK})` : "místo toho hodit k8"}</button>` : ""}</div>
    ${vars.length ? `<p class="vypozn">${vars.join(" ")}</p>` : ""}
    <details class="vyjak"><summary>Role a přípravy</summary><dl class="vyroles">${role.map(([k, r]) => `<dt>${r.n}</dt><dd>${r.sch}</dd>`).join("")}</dl>
      <dl class="vyroles">${VY_PRIP.map(p => `<dt>${p.n}</dt><dd><i>${besc(p.h)}</i> · ${besc(p.u)}${p.f5t ? " " + besc(p.f5t) : ""}</dd>`).join("")}</dl>
      <p class="rsmall">Přípravu lze zkusit jednou za výpravu; druhá příprava stojí odpočinek a úroveň vyčerpání. Kdo před cestou neodpočívá dlouhým odpočinkem, získá vyčerpání, ale může zkusit přípravu navíc.</p></details></section>`;
  /* cesta a setkání */
  const gcT =
    X.gc == null
      ? "Zapiš u každé postavy, zda v hodu na cestu uspěla."
      : X.gc === -1
        ? "Uspěli všichni: o setkání méně (nejméně jedno)."
        : X.gc === 0
          ? "Uspěla víc než polovina: počet setkání podle délky."
          : X.gc === 1
            ? "Polovina nebo víc neuspěla: setkání navíc."
            : "Neuspěl nikdo: dvě setkání navíc.";
  const zasob = dr.find(x => x.role === "zasob" || x.role2 === "zasob"),
    hlid = dr.find(x => x.role === "hlidka" || x.role2 === "hlidka"),
    zasD = dr.some(x => x.prip === "zasoby" && (x.pv === "ok" || x.pv === "ok5")) ? 8 : 6;
  const K = VY.kostky;
  S.cesta = `<section class="vycard vycesta"><h3 class="uvh2">Cesta <small>${X.dl ? `${X.n} ${X.n === 1 ? "setkání" : X.n < 5 ? "setkání" : "setkání"}` : "bez setkání"}</small></h3>
    ${X.dl ? `<p class="rsmall">${VY_DELKA[X.dl][1]}: základ ${X.dl}. ${gcT}${VY.nepritelS ? " Nepřítel +1." : ""}${VY.tempo === "spech" ? " Spěch −1." : VY.tempo === "opatrne" ? " Opatrně +1." : ""}${VY.odp ? " Krátký odpočinek +1." : ""}${VY.navic ? ` Navíc ${VY.navic}.` : ""}</p>` : ""}
    <div class="vytrack">
      <div><b>Zásoby</b>${zasob ? `<span class="vykst">${K ? `<button type="button" class="gbtn ghost" data-vyk="zas" data-d="-1" aria-label="Utratit kostku">−</button><span>${K.zas} × d${K.zasD}</span><button type="button" class="gbtn ghost" data-vyk="zas" data-d="1" aria-label="Přidat kostku">+</button>` : `<small>${zasob.bz || 2} × d${zasD} po vyražení</small>`}</span>` : `<small>chybí Zásobovač</small>`}</div>
      <div><b>Bdělost</b>${hlid ? `<span class="vykst">${K ? `<button type="button" class="gbtn ghost" data-vyk="bdel" data-d="-1" aria-label="Utratit kostku">−</button><span>${K.bdel} × d6</span><button type="button" class="gbtn ghost" data-vyk="bdel" data-d="1" aria-label="Přidat kostku">+</button>` : `<small>${hlid.bz || 2} × d6 po vyražení</small>`}</span>` : `<small>chybí Hlídka</small>`}</div>
      <div><b>Povzbuzení Vůdce</b>${
        dr.some(x => x.role === "vudce" || x.role2 === "vudce")
          ? `<span class="vypov">${dr
              .filter(x => x.n.trim())
              .map(x => `<label><input type="checkbox" data-vypov="${x.id}"${VY.vudce[x.id] ? " checked" : ""}> ${besc(x.n)}</label>`)
              .join("")}</span>`
          : `<small>chybí Vůdce</small>`
      }</div>
      <div><b>Najdi cestu</b>${dr.some(x => x.role === "zved" || x.role2 === "zved") ? `<label class="vychk"><input type="checkbox" data-vyf="najdi"${VY.najdi ? " checked" : ""}> už použito</label>` : `<small>chybí Zvěd</small>`}</div>
      <div><b>Krátký odpočinek</b><label class="vychk"><input type="checkbox" data-vyf="odp"${VY.odp ? " checked" : ""}> jednou za výpravu, přidá setkání</label></div></div>
    ${K ? "" : `<button type="button" class="gbtn" data-vy="vyrazit"${X.dl ? "" : " disabled"}>Vyrazit – rozdat kostky zásob a bdělosti</button>`}
    <ol class="vysetk">${VY.setk.map((s, i) => vyHtmlSetk(s, i)).join("")}</ol>
    ${X.dl ? `<button type="button" class="badd" data-vy="setkplus">+ Setkání navíc (bloudění, výsledek jiného setkání…)</button>${VY.navic > 0 ? ` <button type="button" class="badd" data-vy="setkminus">− ubrat přidané setkání</button>` : ""}` : ""}
    <div class="vyrow"><button type="button" class="gbtn ghost" data-vy="clovek">Člověk na cestě</button><span class="rsmall" id="vyclovek">${besc(VY.clovek || "")}</span></div>
    ${vyHtmlTabulky()}
    <details class="vyjak"><summary>Odpočinek a schopnosti na cestě</summary><p>Na cestě se dlouhý odpočinek nedá vzít, leda to dovolí setkání (Místo k odpočinku). Krátký jednou za výpravu, za cenu setkání navíc.</p>
      <p>Mezi setkáními (ne během nich) lze za kostky životů obnovit schopnosti povolání: co se obnovuje krátkým odpočinkem, stojí 1 kostku; co dlouhým, 2 kostky; pozice kouzla stojí tolik kostek, kolikátá je její úroveň (černokněžník podle úrovně svých pozic).</p>
      <p class="rsmall">Naše domácí pravidla: featy víry „1× za dlouhý odpočinek“ by šly obnovit za 2 kostky životů – rozhodni na nultém sezení. Pozor na únavu v těžké zbroji (neúspěšná záchrana proti vyčerpání = 2 úrovně) a na Horečku z ran.</p></details></section>`;
  /* konec cesty */
  const kc = VY.konec,
    pr = kc.prij != null ? VY_PRIJ.find(r => kc.prij <= r[0]) : null;
  S.konec = `<section class="vycard"><h3 class="uvh2">Konec cesty</h3>
    <div class="controls" role="group" aria-label="Jak cesta skončila">${[
      ["dorazili", "Dorazili"],
      ["opustili", "Opustili cestu"],
      ["katastrofa", "Katastrofa"],
    ]
      .map(([k, n]) => `<button type="button" data-vykon="${k}" aria-pressed="${kc.vys === k}">${n}</button>`)
      .join("")}</div>
    ${kc.vys === "dorazili" ? `<p>Každý hodí záchranu Odolnosti (SO ${X.D}) a přičte ${zasob ? `modifikátor Síly nebo Inteligence Zásobovače (${besc(zasob.n)})` : "modifikátor Síly nebo Inteligence Zásobovače"}. Úspěch: dočasné životy rovné úrovni. Neúspěch: úroveň vyčerpání. Uspějí-li všichni, každý získá inspiraci; neuspějí-li všichni, každý ji ztratí.</p>` : ""}
    ${kc.vys === "opustili" ? `<p>Každý hodí záchranu Odolnosti (SO ${X.D}) s modifikátorem Síly nebo Inteligence Zásobovače. Neúspěch: úroveň vyčerpání; neuspějí-li všichni, ztratí i zbylé kostky životů. Družina skončí, kde určí vypravěč – někde mezi výchozím místem a cílem, klidně v pustině.</p>` : ""}
    ${kc.vys === "katastrofa" ? `<p>Výprava se rozpadla: někdo se ztratil, padl do zajetí, je zmrzačen nebo mrtev. Kdo zbyl, získá úroveň vyčerpání a další následky podle vypravěče.</p>` : ""}
    <div class="vyrow"><label class="vychk">Moudrost Hlídky${hlid ? ` (${besc(hlid.n)})` : ""} <input data-vyf="mou" type="number" min="1" max="6" value="${kc.mou || 1}" class="vynum"></label>
      <button type="button" class="gbtn ghost" data-vy="prijezd">Hod na příjezd (${Math.max(1, kc.mou || 1)}k12, nejvyšší)</button>${kc.prij != null ? ` <b class="vyprij">${kc.prij}</b>` : ""}</div>
    ${pr ? `<p><b>${pr[1]}.</b> ${pr[2]}</p>` : ""}
    <label class="edf edfull vypozn2">Poznámky k cestě (odměny, změny postav…)<textarea data-vyf="pozn" rows="2">${besc(kc.pozn || "")}</textarea></label>
    <div class="gmhrab">${VYT && !VYT.plan ? `<button type="button" class="gbtn" data-vy="vyrazit-cas"${VY.do ? "" : " disabled"}>Vyrazit</button>` : ""}<button type="button" class="gbtn${VYT && !VYT.plan ? " ghost" : ""}" data-vy="odcestovat"${VY.do ? "" : " disabled"}>Rovnou dorazit</button><button type="button" class="gbtn ghost" data-vy="kronika"${VYT || VY.posledniMd ? "" : " disabled"}>Koncept zápisu do Kroniky</button></div>
    <details class="vyjak"><summary>Odměny za cestu</summary><p><b>Příběhové:</b> věhlas (cesta, kterou nikdo nezvládl), spojenci a nepřátelé z cesty, proměna postavy (jizva, nový pohled na svět, nová vada nebo ctnost). <b>Krátkodobé:</b> inspirace, výhoda nebo bonusová kostka při další cestě stejným krajem, dočasná zdatnost s nástroji. Nebo zkušenosti podle počtu a obtížnosti setkání.</p></details></section>`;
  const dne = X.dny.length;
  const T = [
    ["dr", "Družina", `${nn} ${nn === 1 ? "postava" : nn < 5 && nn ? "postavy" : "postav"}`],
    ["pocasi", "Počasí", `${dne} ${dne === 1 ? "den" : dne < 5 ? "dny" : "dní"}`],
    ["obt", "Obtížnost", `SO ${X.D}`],
    ["cesta", "Cesta", X.dl ? `${VY.setk.filter(x => x.hotovo).length}/${X.n} setkání` : "bez setkání"],
    ...(S.noci ? [["noci", "Noclehy", `${vyNoci().length}`]] : []),
    ["konec", "Konec cesty", VY.konec.vys ? "✓" : ""],
  ];
  let k = VY.panel && S[VY.panel] ? VY.panel : VY.kostky ? "cesta" : "dr";
  return `<div class="controls vyzal" role="tablist" aria-label="Části výpravy">${T.map(([id, n, x]) => `<button type="button" role="tab" data-vypan="${id}" aria-pressed="${k === id}" aria-selected="${k === id}">${n}${x ? `<small>${x}</small>` : ""}</button>`).join("")}</div>${S[k]}`;
}
function vyHtmlSetk(s, i) {
  const kr = s.kraj || s._kraj,
    T = s.typ != null ? VY_TYPY[s.typ] : null,
    Z = s.typ != null && s.zaz != null ? vyZazT(s.typ)[s.zaz] : null;
  const vys = ["cela", "vice", "mene", "nikdo"],
    vn = ["uspěli všichni", "víc než polovina", "polovina a méně", "nikdo"],
    vi = vys.indexOf(s.vys);
  return `<li class="vys${s.hotovo ? " vyhot" : ""}" data-vys="${i}"><div class="vysh"><span class="vysn">${i + 1}</span><div class="vyskde"><b>${besc(s._kde)}</b><small>${vyDatum(s._j)}, ${vyDobaDne(s._h)}${s.navic ? " · navíc" : ""}</small></div>
      <select data-vyf="s${i}k" data-vys2="kraj" aria-label="Kraj">${Object.entries(VY_KRAJ)
        .map(([k, [n]]) => `<option value="${k}"${kr === k ? " selected" : ""}>${n}${k === s._kraj && !s.kraj ? " (z mapy)" : ""}</option>`)
        .join("")}</select>
      <label class="vychk"><input type="checkbox" data-vyhot="${i}"${s.hotovo ? " checked" : ""}> vyřešeno</label></div>
    ${s.hotovo ? `<details class="vyhotd"><summary>${T ? besc(T.n) : "bez typu"}${Z ? ` – ${besc(Z.n)}` : ""}${vi >= 0 ? ` · ${vn[vi]}` : ""}</summary>` : ""}<div class="vysb">
      <div class="vyrow"><button type="button" class="gbtn ghost" data-vysh="typ" data-i="${i}">${T ? "Hodit znovu" : "Hodit typ (k12)"}</button><button type="button" class="gbtn ghost" data-vyboj="${i}" title="Otevře Boj s tímto setkáním mezi nepřáteli">⚔ Do boje</button>
        ${!VY.najdi && VYS.dr.some(x => x.role === "zved" || x.role2 === "zved") ? `<button type="button" class="gbtn ghost" data-vysh="najdi" data-i="${i}" title="Zvěd hodí také a vybere">Najdi cestu (2× k12)</button>` : ""}
        <select data-vyf="s${i}t" data-vys2="typ" aria-label="Typ setkání"><option value="">— typ —</option>${VY_TYPY.map((t, k) => `<option value="${k}"${s.typ === k ? " selected" : ""}>${k + 1}. ${t.n}</option>`).join("")}</select>
        ${s.typ2 != null ? `<span class="vynajdi">Zvěd vybírá: <button type="button" class="gbtn ghost" data-vysvol="${i}" data-t="${s.typ}">${VY_TYPY[s.typ].n}</button> nebo <button type="button" class="gbtn ghost" data-vysvol="${i}" data-t="${s.typ2}">${VY_TYPY[s.typ2].n}</button></span>` : ""}</div>
      ${
        T
          ? `<p class="vyjakt"><b>${T.n}</b> · klíčová role: ${T.r}. ${T.jak}</p>
        <div class="vyrow"><button type="button" class="gbtn ghost" data-vysh="zaz" data-i="${i}">${Z ? "Jiný záznam" : "Hodit záznam"}</button>
          <select data-vyf="s${i}z" data-vys2="zaz" aria-label="Záznam"><option value="">— záznam —</option>${vyZazT(s.typ)
            .map((z, k) => `<option value="${k}"${s.zaz === k ? " selected" : ""}>${besc(z.n)}${vyHodiSe(z, kr) ? "" : " (jiný kraj)"}</option>`)
            .join("")}</select></div>
        ${Z ? `<p class="vyzaz"><b>${besc(Z.n)}.</b> ${besc(Z.t)}${Z.k ? ` <i>Ověření: ${besc(Z.k)}.</i>` : ""}</p>` : ""}
        <div class="controls vyvys" role="group" aria-label="Výsledek skupinového hodu">${vys.map((v, k) => `<button type="button" data-vysv="${i}" data-v="${v}" aria-pressed="${s.vys === v}">${vn[k]}</button>`).join("")}</div>
        ${vi >= 0 ? `<p class="vyvt">${T.v[vi]}</p>` : ""}`
          : ""
      }
      ${T ? vyHtmlOkoli(s) : ""}
      ${
        T || s.pozn
          ? `<textarea data-vyf="s${i}p" data-vys2="pozn" rows="${Math.min(6, Math.max(1, (s.pozn || "").split("\n").length))}" placeholder="Poznámky k setkání" aria-label="Poznámky">${besc(s.pozn || "")}</textarea>
      <div class="vyrow"><button type="button" class="badd" data-vyclov="${i}">+ člověk na cestě do poznámek</button></div>`
          : ""
      }</div>${s.hotovo ? "</details>" : ""}</li>`;
}
const vyHodiSe = (z, kr) => z.r.includes("*") || z.r.includes((VY_KRAJ[kr] || ["", "P"])[1]);
const vyK = n => 1 + Math.floor(Math.random() * n);
function vyZnacky(m) {
  if (curView !== "vyprava" || !VY || VY.mapa !== m || !VYT || !VYS || VYT.m !== m) return;
  const svg = document.getElementById(m === "koruna" ? "map" : m === "svet" ? "smap" : "pmap");
  if (!svg) return;
  const vb = (svg.getAttribute("viewBox") || "0 0 680 605").split(/\s+/).map(Number);
  /* mapa Koruny je nakreslená s okrajem pro posouvání (viewBox je větší než výřez): měřítko si drawMapK ukládá do data-s */
  const s = m === "koruna" ? +svg.dataset.s || vb[2] / 680 : m === "svet" ? (vb[2] / 1024) * 1.3 : (vb[2] / 1160) * 1.6,
    g = el("g", {class: "vyzn", "pointer-events": "none"});
  VY.setk.forEach((x, i) => {
    if (!x._q) return;
    const [px, py] = m === "koruna" ? P(...x._q.xy) : m === "svet" ? SP(...x._q.xy) : x._q.xy;
    g.appendChild(
      el("circle", {
        cx: px,
        cy: py,
        r: (8 * s).toFixed(2),
        fill: x.hotovo ? "var(--muted)" : "var(--paper)",
        stroke: "var(--kal)",
        "stroke-width": (2 * s).toFixed(2),
      }),
    );
    g.appendChild(
      el(
        "text",
        {
          x: px,
          y: py + 3.6 * s,
          "text-anchor": "middle",
          "font-size": (10.5 * s).toFixed(2),
          fill: x.hotovo ? "var(--paper)" : "var(--kal)",
          "font-weight": "700",
          class: "vyznt",
        },
        String(i + 1),
      ),
    );
  });
  svg.appendChild(g);
}

/* ---------- ovládání ---------- */
function vyZmena() {
  vyPrepocti();
  vyPanely();
  vyUloz();
  try {
    if (VY.mapa === "koruna") drawMap();
    else if (VY.mapa === "svet" && SG) sDraw();
    else if (PG) pDraw();
  } catch (e) {}
}
document.addEventListener("change", e => {
  const t = e.target;
  if (curView !== "vyprava" || !VY || !t.closest("#vyview")) return;
  const f = t.getAttribute("data-vyf");
  if (!f) return;
  const v = t.type === "checkbox" ? t.checked : t.value;
  if (t.dataset.vyd) {
    const i = +t.closest("[data-vyi]").dataset.vyi,
      x = VY.druzina[i];
    x[t.dataset.vyd] = t.dataset.vyd === "bz" || t.dataset.vyd === "hod" ? +v : v;
    if (t.dataset.vyd === "role" && x.role === x.role2) x.role2 = "";
    vyZmena();
    return;
  }
  if (t.dataset.vys2) {
    const i = +t.closest("[data-vys]").dataset.vys,
      s = VY.setk[i],
      k = t.dataset.vys2;
    if (k === "typ") {
      s.typ = v === "" ? null : +v;
      s.typ2 = null;
      s.zaz = null;
      s.vys = "";
    } else if (k === "zaz") s.zaz = v === "" ? null : +v;
    else s[k] = v;
    vyZmena();
    return;
  }
  if (f === "datum" || f === "hodina") {
    VY.start = Object.assign(VY.start || vyHraStart(), {[f]: f === "hodina" ? +v : v});
    vyZmena();
    return;
  }
  if (f === "mou") {
    VY.konec.mou = Math.max(1, +v || 1);
    vyZmena();
    return;
  }
  if (f === "pozn") {
    VY.konec.pozn = v;
    vyUloz();
    return;
  }
  if (["pocasiV", "teren"].includes(f)) {
    VY[f] = v === "" ? null : Math.max(1, Math.min(10, +v));
    vyZmena();
    return;
  }
  if (["nepritel", "zdrz", "odch"].includes(f)) {
    VY[f] = +v || 0;
    if (f === "odch" && !VY[f]) VY[f] = 1;
    vyZmena();
    return;
  }
  if (f === "rychle") {
    VY.rychle = v;
    VY.rychleK = null;
  } else VY[f] = v;
  if (f === "zp") {
    if (VY.mapa === "koruna") {
      updateRoute();
      renderTravel();
      drawMap();
    } else if (VY.mapa === "svet" && SG) {
      smRender();
      sDraw();
    }
  }
  vyZmena();
});
document.addEventListener("input", e => {
  const t = e.target;
  if (curView !== "vyprava" || !VY || !t.closest("#vyview")) return;
  if (t.dataset.vyd === "n") {
    VY.druzina[+t.closest("[data-vyi]").dataset.vyi].n = t.value;
    vyUloz();
  } else if (t.dataset.vys2 === "pozn") {
    VY.setk[+t.closest("[data-vys]").dataset.vys].pozn = t.value;
    vyUloz();
  } else if (t.getAttribute("data-vyf") === "pozn") {
    VY.konec.pozn = t.value;
    vyUloz();
  }
});
document.addEventListener("click", async e => {
  if (curView !== "vyprava" || !VY) return;
  const t = e.target.closest("button,[data-vymapa]");
  if (!t || !t.closest("#vyview")) return;
  if (t.dataset.vymapa) {
    if (VY.mapa !== t.dataset.vymapa) {
      VY.mapa = t.dataset.vymapa;
      VY.z = null;
      VY.do = null;
      VY.setk = [];
      VYT = null;
      if (VY.mapa === "praha" && VY.zp === "drak") VY.zp = "pesky";
      renderVyprava();
      vyUloz();
    }
    return;
  }
  const a = t.dataset.vy;
  if (a === "nova") {
    if (!confirm("Začít novou výpravu? Trasa, přípravy, hody a setkání se smažou (družina a ručně upravené počasí zůstanou).")) return;
    const keep = {
      druzina: (VY.druzina || []).map(x => ({...x, prip: "", pv: "", gc: ""})),
      pocasi: VY.pocasi,
      mapa: VY.mapa,
      zp: VY.zp,
      zpet: VY.zpet,
    };
    VY = Object.assign(VY_NOVA(), keep);
    VY.start = vyHraStart();
    st.tb = null;
    SM.b = null;
    PM.b = null;
    PM.path = null;
    renderVyprava();
    vyUloz();
    return;
  }
  if (a === "zhry") {
    VY.start = vyHraStart();
    VY.z = vyPuvod(VY.mapa);
    if (!VY.z) mmHlasG("Polohu družiny na této mapě neznám – klikni na mapu na výchozí místo.");
    if (VY.mapa === "koruna") {
      st.ta = VY.z ? {...VY.z} : null;
      updateRoute();
      renderTravel();
      drawMap();
    } else if (VY.mapa === "svet") {
      SM.a = VY.z;
      smRender();
      if (SG) sDraw();
    } else {
      PM.a = VY.z;
      PM.path = PM.a && PM.b && PG ? pmRoute(PM.a.pt, PM.b.pt) : null;
      pmRender();
      if (PG) pDraw();
    }
    vyZmena();
    return;
  }
  if (a === "pridat") {
    VY.druzina.push({id: vyId(), n: "", role: "", role2: "", bz: 2, prip: "", pv: "", gc: "", hod: 0});
    vyZmena();
    return;
  }
  if (t.dataset.vydel != null) {
    VY.druzina.splice(+t.dataset.vydel, 1);
    vyZmena();
    return;
  }
  if (t.dataset.vygc != null) {
    const x = VY.druzina[+t.dataset.vygc];
    x.gc = x.gc === t.dataset.v ? "" : t.dataset.v;
    vyZmena();
    return;
  }
  if (a === "rychlek8") {
    VY.rychleK = vyK(8);
    vyZmena();
    return;
  }
  if (a === "vyrazit") {
    const dr = VYS.dr,
      z = dr.find(x => x.role === "zasob" || x.role2 === "zasob"),
      h = dr.find(x => x.role === "hlidka" || x.role2 === "hlidka");
    VY.kostky = {
      zas: z ? +z.bz || 2 : 0,
      zasD: dr.some(x => x.prip === "zasoby" && (x.pv === "ok" || x.pv === "ok5")) ? 8 : 6,
      bdel: h ? +h.bz || 2 : 0,
    };
    vyZmena();
    return;
  }
  if (t.dataset.vyk) {
    VY.kostky[t.dataset.vyk] = Math.max(0, (VY.kostky[t.dataset.vyk] || 0) + +t.dataset.d);
    vyZmena();
    return;
  }
  if (a === "setkplus") {
    VY.navic = (+VY.navic || 0) + 1;
    vyZmena();
    return;
  }
  if (a === "setkminus") {
    VY.navic = Math.max(0, (+VY.navic || 0) - 1);
    vyZmena();
    return;
  }
  if (t.dataset.vysh) {
    const s = VY.setk[+t.dataset.i];
    if (t.dataset.vysh === "typ") {
      s.typ = vyK(12) - 1;
      s.typ2 = null;
      s.zaz = null;
      s.vys = "";
    }
    if (t.dataset.vysh === "najdi") {
      s.typ = vyK(12) - 1;
      s.typ2 = vyK(12) - 1;
      s.zaz = null;
      s.vys = "";
      VY.najdi = true;
      if (s.typ2 === s.typ) s.typ2 = null;
    }
    if (t.dataset.vysh === "zaz") {
      const kr = s.kraj || s._kraj,
        L = vyZazT(s.typ)
          .map((z, k) => [z, k])
          .filter(([z]) => vyHodiSe(z, kr)),
        M = L.length ? L : vyZazT(s.typ).map((z, k) => [z, k]);
      let k = M[vyK(M.length) - 1][1];
      if (M.length > 1 && k === s.zaz) k = M[(M.findIndex(x => x[1] === k) + 1) % M.length][1];
      s.zaz = k;
    }
    vyZmena();
    return;
  }
  if (t.dataset.vysvol != null) {
    const s = VY.setk[+t.dataset.vysvol];
    s.typ = +t.dataset.t;
    s.typ2 = null;
    s.zaz = null;
    vyZmena();
    return;
  }
  if (t.dataset.vysv != null) {
    const s = VY.setk[+t.dataset.vysv];
    s.vys = s.vys === t.dataset.v ? "" : t.dataset.v;
    vyZmena();
    return;
  }
  if (t.dataset.vykon) {
    VY.konec.vys = VY.konec.vys === t.dataset.vykon ? "" : t.dataset.vykon;
    vyZmena();
    return;
  }
  if (a === "prijezd") {
    const n = Math.max(1, +VY.konec.mou || 1);
    VY.konec.prij = Math.max(...Array.from({length: n}, () => vyK(12)));
    vyZmena();
    return;
  }
  if (t.dataset.vypoc) {
    const d = t.dataset.dat,
      o = VY.pocasi || (VY.pocasi = {});
    if (t.dataset.vypoc === "jine") {
      o[d] = {salt: ((o[d] && o[d].salt) || 0) + 1};
    } else if (t.dataset.vypoc === "zpet") {
      delete o[d];
    } else {
      const x = VYS.dny.find(q => vyDat(q.j) === d),
        P = x && x.P;
      const txt = prompt("Popis počasí pro " + vyDatum(x.j) + ":", P ? P.text : "");
      if (txt === null) return;
      const val = prompt("Hodnota počasí pro obtížnost (1–10):", P ? P.w : 3);
      if (val === null) return;
      o[d] = Object.assign({}, o[d] || {}, {t: txt.trim() || undefined, v: Math.max(1, Math.min(10, +val || 1))});
    }
    vyZmena();
    vyZverejniPocasi();
    return;
  }
  if (t.dataset.vypan) {
    VY.panel = t.dataset.vypan;
    vyPanely();
    vyUloz();
    return;
  }
  if (a === "stul") {
    VY.stul = !VY.stul;
    vyZmena();
    return;
  }
  if (a === "clovek") {
    const q = VYT && VY.setk.find(x => !x.hotovo && x._q);
    VY.clovek = vyClovek(q && !VYT.plan ? q._q.xy : VYT && !VYT.plan ? vyBod(VYT, 0).xy : null);
    vyPanely();
    vyUloz();
    return;
  }
  if (t.dataset.vyclov != null) {
    const s = VY.setk[+t.dataset.vyclov];
    s.pozn = (s.pozn ? s.pozn.trim() + "\n" : "") + vyClovek(s._q && !VYT.plan ? s._q.xy : null);
    vyZmena();
    return;
  }
  if (t.dataset.vyhod) {
    const n = +t.dataset.vyhod,
      r = vyK(n),
      o = document.getElementById("vyhodv");
    if (o) {
      o.textContent = `k${n}: ${r}`;
      o.classList.remove("vyblik");
      void o.offsetWidth;
      o.classList.add("vyblik");
    }
    return;
  }
  if (a === "tabuloz") {
    const ta = document.querySelector("[data-vytab]"),
      k = +ta.dataset.vytab,
      txt = ta.value.trim();
    (VY.tab || (VY.tab = {}))[k] = txt && txt !== vyZazText(k) ? txt : undefined;
    if (!VY.tab[k]) delete VY.tab[k];
    VY.setk.forEach(x => {
      if (x.typ === k && x.zaz != null && x.zaz >= vyZazT(k).length) x.zaz = null;
    });
    VY.tabOpen = true;
    vyZmena();
    mmHlasG("Tabulka uložena.");
    return;
  }
  if (a === "tabzpet") {
    const k = VY.tabT || 0;
    if (VY.tab) delete VY.tab[k];
    VY.tabOpen = true;
    vyZmena();
    return;
  }
  if (a === "odcestovat") {
    await vyOdcestuj(false);
    return;
  }
  if (a === "vyrazit-cas") {
    await vyOdcestuj(true);
    return;
  }
  if (a === "kronika") {
    vyKronika();
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (curView !== "vyprava" || !VY || !t.closest("#vyview")) return;
  if (t.dataset.vypov) {
    VY.vudce[t.dataset.vypov] = t.checked;
    vyUloz();
  }
  if (t.dataset.vynoc) {
    (VY.noc || (VY.noc = {}))[t.dataset.vynoc] = t.value;
    vyZmena();
  }
  if (t.hasAttribute("data-vytabt")) {
    VY.tabT = +t.value;
    VY.tabOpen = true;
    vyPanely();
  }
  if (t.dataset.vyhot != null) {
    VY.setk[+t.dataset.vyhot].hotovo = t.checked;
    vyZmena();
  }
});
/* stopa pro putování po hodinách (stejný tvar jako HRA.cesta.track: [hodina od počátku letopočtu, délka, šířka]) */
function vyStopa() {
  if (!VYT || VYT.plan || !VYS) return null;
  const pts = VYT.pts,
    d = haversine;
  let L = 0;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    L += d(pts[i - 1], pts[i]);
    cum.push(L);
  }
  const r3 = v => Math.round(v * 1000) / 1000,
    tr = [];
  VYS.dny.forEach(x => {
    if (x.stuj || x.p1 <= x.p0) return;
    const tt = p => x.j * 24 + x.od + ((p - x.p0) / (x.p1 - x.p0)) * (x.do - x.od),
      add = (t, q) => tr.push([Math.round(t * 10) / 10, r3(q[0]), r3(q[1])]);
    add(tt(x.p0), vyBod(VYT, x.p0).xy);
    cum.forEach((c, i) => {
      const p = L ? c / L : 0;
      if (p > x.p0 + 1e-9 && p < x.p1 - 1e-9) add(tt(p), pts[i]);
    });
    add(tt(x.p1), vyBod(VYT, x.p1).xy);
  });
  if (tr.length) {
    tr[tr.length - 1][0] = VYS.prij.j * 24 + VYS.prij.h;
  }
  return tr.filter((q, i) => i === 0 || q[0] !== tr[i - 1][0] || q[1] !== tr[i - 1][1]);
}
/* svátky, Hodiny Pravdy, řeky a mýta na cestě (řeky a mýta z plánu cesty ve Vypravěči) */
function vyPoCeste() {
  if (!VYT || !VYS || VYT.plan) return "";
  const d0 = VYS.dny.length ? VYS.dny[0].j : VYS.prij.j,
    d1 = VYS.prij.j,
    [Y0] = fromJdn(d0);
  let sv = [],
    rk = [],
    my = [];
  try {
    sv = [...feasts(Y0), ...feasts(Y0 + 1)].filter(f => f.j >= d0 && f.j <= d1 && !f.info).sort((a, b) => a.j - b.j);
  } catch (e) {}
  try {
    if (typeof cestaPlan === "function") {
      const S = VY.start || vyHraStart(),
        P = cestaPlan({z: VYT.z, do: VYT.do, zp: VY.zp === "drak" ? "pesky" : VY.zp, odch: 1, zdrz: 0, sez: true, datum: S.datum, hodina: S.hodina});
      if (P && !P.chyba) {
        /* řeky, jejichž přechod už je mezi „Přechody na cestě“, se neopakují */
        rk = VY.zp === "drak" ? [] : (P.reky || []).filter(r => !r.pr || !(VYS.prech || []).some(x => x.n === r.pr));
        my = VY.zp === "drak" ? [] : P.myta || [];
      }
    }
  } catch (e) {}
  if (!sv.length && !rk.length && !my.length) return "";
  const ds = j => {
    const [, M, D] = fromJdn(j);
    return `${D}. ${MES[M - 1]}`;
  };
  return `<p class="lbl">Po cestě</p><ul class="gmclist">${sv.map(f => `<li${f.hp ? ' class="gmchp"' : ""}>${ds(f.j)}: <b>${f.n}</b>${f.hp ? " – Hodina Pravdy" : f.w ? ` – Požehnání 4–6: ${f.w}` : ""}</li>`).join("")}${rk.map(r => `<li>${r.r}: ${r.pr || (r.most ? `kamenný most (${r.most})` : `brod nebo přívoz (${r.kde})`)}</li>`).join("")}${my.map(m => `<li>${m.n}: ${m.t}</li>`).join("")}</ul>`;
}
async function vyOdcestuj(putovat) {
  if (!VYT || !VYS) {
    mmHlasG("Nejdřív vyber cíl cesty.");
    return;
  }
  const p = VYS.prij,
    [y, m, d] = fromJdn(p.j),
    dat = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  let misto = VYT.do,
    praha = null;
  if (VYT.m === "svet" && VY.do && !VY.do.key) {
    misto = vyNejblizsiMesto(VY.do.ll).replace(/^u města /, "");
    if (misto === "cestou") misto = VY.do.name;
  }
  if (VYT.m === "praha") {
    misto = "Praha";
    const k = (VY.do && VY.do.key) || "";
    praha = k.startsWith("p:") ? +k.slice(2) : null;
    if (praha == null && VY.do) {
      let b = null,
        bd = 1e9;
      PRAHA_PLACES.forEach(q => {
        const dd = Math.hypot(q.pos[0] - VY.do.pt[0], q.pos[1] - VY.do.pt[1]);
        if (dd < bd) {
          bd = dd;
          b = q.n;
        }
      });
      praha = b;
    }
  }
  const tr = vyStopa();
  if (putovat && (!tr || tr.length < 2)) {
    mmHlasG("Pro tuto cestu nejde spočítat stopu – použij Rovnou dorazit.");
    return;
  }
  if (
    !confirm(
      putovat
        ? `Družina vyrazí do: ${misto}. Herní čas zůstane, s každou hodinou se posune po trase; dorazí ${vyDatum(p.j)}, ${p.h}:00.`
        : `Rovnou dorazit do: ${misto}${praha ? ` (místo č. ${praha})` : ""}?\nHerní čas se posune na ${vyDatum(p.j)}, ${p.h}:00.`,
    )
  )
    return;
  if (!window.MMDB) {
    mmHlasG("Herní stav lze měnit jen na webu napojeném na databázi.");
    return;
  }
  const S = VY.start || vyHraStart(),
    zm = {km: Math.round(VYT.km), zpusob: VY.zp === "drak" ? "pesky" : VY.zp};
  let h;
  if (putovat) {
    const c = {z: VYT.z, do: misto, ...zm, track: tr};
    h = {datum: S.datum, hodina: +S.hodina, misto: VYT.z, cesta: c, poloha: null, praha: null};
  } else {
    h = {datum: dat, hodina: p.h, misto, praha: VYT.m === "praha" ? praha : null, cesta: null, poloha: null};
    if (tr && tr.length > 1 && typeof cTxt === "function") {
      const b = tr.map(q => [q[1], q[2]]).filter((q, i, a) => i === 0 || i === a.length - 1 || i % 3 === 0);
      h.putovani = [...((HRA && HRA.putovani) || []), {z: VYT.z, do: misto, od: cTxt(tr[0][0]), pr: cTxt(tr[tr.length - 1][0]), b}].slice(-80);
    }
  }
  await hraZpetZapis(`${putovat ? "vyrazit" : "dorazit"} do: ${misto}`);
  document.documentElement.classList.add("gmbusy");
  try {
    HRA = await MMDB.nastavHru(h);
    __D.HRA = HRA;
    renderKal();
    VY.posledniMd = vyKronikaMd();
    VY = Object.assign(VY_NOVA(), {
      druzina: (VY.druzina || []).map(x => ({...x, prip: "", pv: "", gc: ""})),
      pocasi: VY.pocasi,
      mapa: VY.mapa,
      zp: VY.zp,
      posledniMd: VY.posledniMd,
      z: putovat ? null : VY.do,
      start: null,
      zpet: VY.zpet,
    });
    if (VYT.m === "koruna") {
      st.ta = st.tb;
      st.tb = null;
      updateRoute();
    } else if (VYT.m === "svet") {
      SM.a = SM.b;
      SM.b = null;
    } else {
      PM.a = PM.b;
      PM.b = null;
      PM.path = null;
    }
    mmHlasG(
      putovat
        ? `Družina vyrazila do: ${misto}. Polohu na cestě posouvá herní čas (Vypravěč › +1 hodina / Další den).`
        : `Družina dorazila: ${misto}, ${vyDatum(p.j)}, ${p.h}:00.`,
      7000,
    );
    await vyUlozHned();
    renderVyprava();
  } catch (err) {
    mmHlasG("Nepodařilo se uložit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
}
function vyKronika() {
  const md = VYT && VYS ? vyKronikaMd() : VY.posledniMd;
  if (!md) {
    mmHlasG("Nejdřív vyber cíl cesty.");
    return;
  }
  const id = (md.match(/^id: (.+)$/m) || [])[1] || "cesta";
  if (window.MMDB && typeof edOtevri === "function") {
    const tpl = EDDRUH.zapis.tpl;
    EDDRUH.zapis.tpl = () => md;
    Promise.resolve(edOtevri("zapis", id, true)).finally(() => {
      EDDRUH.zapis.tpl = tpl;
    });
  } else {
    try {
      navigator.clipboard.writeText(md);
      mmHlasG("Koncept zápisu je ve schránce – vlož ho do nového souboru v zdroj/obsah/kronika/.", 6000);
    } catch (e) {
      prompt("Koncept zápisu:", md);
    }
  }
}
function vyKronikaMd() {
  const p = VYS.prij,
    [y, m, d] = fromJdn(p.j),
    dat = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    S = VY.start || vyHraStart();
  const misto = VYT.m === "praha" ? "Praha" : VYT.do,
    slug =
      (VYT.do || "cesta")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "cesta";
  const id = `cesta-${dat}-${slug}`,
    route = VYT.m === "koruna" ? VYT.names.join(", ") : `${VYT.z}, ${misto}`;
  const tx = [
    `Družina vyrazila ${vyDatum(jdn(...S.datum.split("-").map(Number)))} z místa ${VYT.z} (${VY_ZP.find(z => z[0] === VY.zp)[1].toLowerCase()}) a dorazila ${vyDatum(p.j)} k ${p.h}. hodině.`,
  ];
  if (VYS.dny.length) tx.push("Počasí: " + [...new Set(VYS.dny.map(x => x.P.text.split(".")[0]))].slice(0, 4).join("; ") + ".");
  VY.setk.forEach((s, i) => {
    if (s.typ == null) return;
    const Z = s.zaz != null ? vyZazT(s.typ)[s.zaz] : null;
    tx.push(`${i + 1}. ${s._kde}, ${vyDatum(s._j)}: ${VY_TYPY[s.typ].n}${Z ? ` – ${Z.n}` : ""}.${s.pozn ? " " + s.pozn : ""}`);
  });
  if (VY.konec.prij != null) {
    const r = VY_PRIJ.find(q => VY.konec.prij <= q[0]);
    tx.push(`Příjezd: ${r[1].toLowerCase()}.`);
  }
  if (VY.konec.pozn) tx.push(VY.konec.pozn);
  const md = `---\nid: ${id}\nn: Cesta\ndatum: ${dat}\ndate: ${vyDatum(p.j)}\nhodina: ${p.h}\nplace: ${misto}\nroute: ${route}\n${VYT.m === "praha" && VY.do && VY.do.key && VY.do.key.startsWith("p:") ? `druzina: ${VY.do.key.slice(2)}\n` : ""}title: Cesta: ${misto}\n---\n${tx.join("\n\n")}\n`;
  return md;
}

/* ---------- Výprava 2: okolí trasy, draci, vlastní tabulky, noclehy, lidé na cestě, počasí pro hráče, režim u stolu ---------- */
const VY_VIRA = {kal: "kališníci", kat: "katolíci", mix: "smíšené vyznání", isl: "muslimové", old: "starověrci"};
/* panství kolem bodu: nejbližší sídla rodů (do 25 km), u Prahy místa na plánu s rodem */
function vyOkoli(T, q) {
  if (!T || !q) return [];
  if (T.plan) {
    const pt = q.xy,
      o = [];
    PRAHA_PLACES.forEach(p => {
      if (!p.r || !byId[p.r]) return;
      const d = (Math.hypot(p.pos[0] - pt[0], p.pos[1] - pt[1]) * PMU) / 1000;
      if (d < 0.6) o.push({f: byId[p.r], sd: [`${p.n}. ${p.name}`], d});
    });
    o.sort((a, b) => a.d - b.d);
    const s = new Set();
    return o.filter(x => !s.has(x.f.id) && s.add(x.f.id)).slice(0, 3);
  }
  const ll = q.xy,
    o = [];
  FAM.forEach(f => {
    if (f.nomap) return;
    (f.seats || []).forEach(sd => {
      const d = haversine(ll, [sd[1], sd[2]]);
      if (d < 25) o.push({f, sd, d});
    });
  });
  o.sort((a, b) => a.d - b.d);
  const s = new Set();
  return o.filter(x => !s.has(x.f.id) && s.add(x.f.id)).slice(0, 3);
}
function vyOsobyOkoli(ok) {
  const ids = new Set(ok.map(x => x.f.id)),
    seats = new Set(ok.map(x => x.sd[0]));
  return PEOPLE.filter(p => ids.has(p.r))
    .sort((a, b) => seats.has(b.seat) - seats.has(a.seat))
    .slice(0, 5);
}
/* vyznání družiny: většina podle sloupce víra */
function vyViraDruziny() {
  const c = {};
  vyDruzina().forEach(x => {
    if (x.n.trim() && x.vira) c[x.vira] = (c[x.vira] || 0) + 1;
  });
  const e = Object.entries(c).sort((a, b) => b[1] - a[1]);
  return e.length ? e[0][0] : "";
}
function vyRozpor(f) {
  const v = vyViraDruziny();
  if (!v || !f) return "";
  if (f.conf === "mix" || v === "old") return f.conf === "mix" ? "" : `Pán okolí (${VY_VIRA[f.conf] || f.conf}) nemá starověrce v lásce.`;
  if ((v === "kal" && f.conf === "kat") || (v === "kat" && f.conf === "kal"))
    return `Pán okolí je ${f.conf === "kat" ? "katolík" : "kališník"}, družina ${v === "kat" ? "katolická" : "kališnická"}: u setkání s místními (Setkání na cestě, Prosba o pomoc, Místo k odpočinku) navrhuji SO +2.`;
  return "";
}
/* draci: plemena, jejichž místa výskytu (mp) jsou do 50 km */
function vyDraciU(ll) {
  if (!ll || !DRACI || !DRACI.pl) return [];
  return DRACI.pl.filter(d => (d.mp || []).some(m => haversine(ll, m) < 50));
}
function vyReviry(T) {
  if (!T || T.plan || VY.zp !== "drak") return [];
  const o = new Map();
  for (let p = 0; p <= 1; p += 0.05) {
    const q = vyBod(T, p);
    DRACI.pl.forEach(d => {
      (d.mp || []).forEach(m => {
        if (haversine(q.xy, m) < 35 && !o.has(d.id)) o.set(d.id, {d, kde: vyBlizko(q.xy)});
      });
    });
  }
  return [...o.values()];
}
/* vlastní tabulky setkání (uložené ve výpravě) */
function vyZazT(t) {
  const tx = VY && VY.tab && VY.tab[t];
  if (!tx) return VY_ZAZ[t] || [];
  const L = tx
    .split("\n")
    .map(r => r.trim())
    .filter(r => r && !r.startsWith("#"))
    .map(r => {
      const a = r.split("|").map(x => x.trim());
      return {r: a[0] || "*", n: a[1] || "?", t: a[2] || "", k: a[3] || "", b: a[4] || ""};
    });
  return L.length ? L : VY_ZAZ[t] || [];
}
const vyZazText = t =>
  (VY_ZAZ[t] || []).map(z => `${z.r} | ${z.n} | ${z.t}${z.k || z.b ? ` | ${z.k || ""}` : ""}${z.b ? ` | ${z.b}` : ""}`).join("\n");
/* noclehy */
const VY_NOC = {
  krcma: ["V krčmě", 2, "Odpočinek bez obtíží. Za koně píce 1 groš."],
  klaster: ["V klášteře nebo na faře", 0, "Zdarma, čeká se dar (1 groš). Kněz se zeptá na vyznání."],
  tvrz: ["Na tvrzi nebo dvoře", 0, "Pohostinnost pána – a závazek, novinky, otázky."],
  sirak: ["Pod širákem", 0, "Žádné náklady. Za mrazu záchrana Odolnosti, jinak úroveň vyčerpání."],
};
function vyNoci() {
  if (!VYT || !VYS || VYT.plan) return [];
  const out = [];
  VYS.dny.forEach((x, i) => {
    if (i === VYS.dny.length - 1) return;
    const q = vyBod(VYT, x.p1),
      kde = vyBlizko(q.xy),
      sidlo = !/^(nedaleko|cestou)/.test(kde);
    const k = vyDat(x.j),
      v = (VY.noc && VY.noc[k]) || (sidlo ? "krcma" : "sirak"),
      tn = x.P.tn;
    let pozn = "";
    if (v === "sirak") {
      if (tn <= -8) pozn = `Krutá zima (${Math.round(tn)} °C): záchrana Odolnosti SO 15, jinak úroveň vyčerpání.`;
      else if (tn <= 0) pozn = `Mráz (${Math.round(tn)} °C): záchrana Odolnosti SO 10, jinak úroveň vyčerpání.`;
      else if (x.P.typ && x.P.typ !== "snih") pozn = "Prší: bez přístřeší jen polovina kostek životů.";
    }
    out.push({k, j: x.j, kde, v, pozn, sidlo});
  });
  return out;
}
/* lidé na cestě */
const VY_JM = {
  m: [
    "Jan",
    "Petr",
    "Václav",
    "Mikuláš",
    "Jakub",
    "Matěj",
    "Ondřej",
    "Jiří",
    "Martin",
    "Prokop",
    "Havel",
    "Bohuslav",
    "Zdeněk",
    "Vilém",
    "Hynek",
    "Ctibor",
    "Bušek",
    "Mareš",
    "Šimon",
    "Vít",
    "Jíra",
    "Duchek",
    "Mach",
    "Pešek",
    "Vaněk",
    "Zikmund",
    "Beneš",
    "Štěpán",
    "Linhart",
    "Mates",
  ],
  z: [
    "Anna",
    "Kateřina",
    "Markéta",
    "Dorota",
    "Ludmila",
    "Johana",
    "Barbora",
    "Machna",
    "Dobruška",
    "Eliška",
    "Ofka",
    "Zdeňka",
    "Anežka",
    "Magdaléna",
    "Hedvika",
    "Kunka",
    "Bětka",
    "Voršila",
    "Jitka",
    "Běta",
  ],
};
const VY_PRIZ = [
  "Černý",
  "Malý",
  "Bezzubý",
  "Šilhavý",
  "Kulhavý",
  "Ryšavý",
  "Holý",
  "Dlouhý",
  "Mladý",
  "Starý",
  "Vousatý",
  "Kos",
  "Vrána",
  "Liška",
  "Zajíc",
];
const VY_STAV = [
  ["sedlák", 5, "Novák|Dvořák|Svoboda|Procházka|z Lhoty"],
  ["měšťan", 3, "od Zlatého lva|od Tří kaprů|z Rynku|Bohatý"],
  ["řemeslník", 4, "Kovář|Švec|Krejčí|Pekař|Sladovník|Kožešník|Hrnčíř|Tesař"],
  ["kupec", 2, "z Norimberka|z Vratislavi|z Kolína|Solař"],
  ["kněz pod obojí", 1, ""],
  ["katolický mnich", 1, ""],
  ["zeman", 1, "z Lomnice|ze Lhoty|z Dubé|z Chlumu"],
  ["panoš", 1, ""],
  ["žoldnéř", 2, ""],
  ["poutník", 2, ""],
  ["žebrák", 1, ""],
  ["havíř", 1, ""],
  ["vorař", 1, ""],
  ["kramář", 1, ""],
  ["bylinkářka", 1, ""],
  ["dračí letec", 0.5, ""],
];
const VY_POV = [
  "podezíravý",
  "upovídaný",
  "zbožný až horlivý",
  "vychytralý",
  "dobrosrdečný",
  "ustrašený",
  "hrdý na svůj stav",
  "opilý",
  "zachmuřený",
  "zvědavý",
  "úlisný",
  "prostořeký",
  "unavený k smrti",
  "výbušný",
  "pověrčivý",
  "vděčný za každé slovo",
];
const VY_CHCE = [
  "dostat se domů dřív než bouře",
  "prodat, co nese, za dobrou cenu",
  "najít ztraceného syna",
  "doručit list, který nesmí otevřít",
  "utéct před dluhy",
  "vyprosit si ochranu na cestu",
  "pomstít křivdu na pánovi",
  "dozvědět se novinky z Prahy",
  "sehnat felčara",
  "zjistit, kdo je družina",
  "najít Proměněnce, který mu ukradl ženu",
  "dojít na pouť",
  "zbavit se prokletí",
  "najít práci na zimu",
  "přechytračit mýtníka",
  "vidět draka zblízka",
];
const VY_TAJ = [
  "je ve skutečnosti Proměněnec a skrývá to",
  "pracuje pro rod, se kterým má družina spor",
  "nese ukradené stříbro z Kutné Hory",
  "viděl něco, co neměl, u místa Závoje",
  "je kališník mezi katolíky (nebo naopak)",
  "dluží peníze nebezpečným lidem",
  "zná zkratku přes hvozd",
  "je hledaný pro vraždu, kterou nespáchal",
  "nosí relikvii, o které neví, že je pravá",
  "je zvěd jednoho z pánů",
  "utíká z kláštera",
  "má u sebe dračí vejce",
];
function vyClovek(ll) {
  const pick = a => a[Math.floor(Math.random() * a.length)],
    wp = a => {
      const t = a.reduce((s, x) => s + x[1], 0);
      let r = Math.random() * t;
      for (const x of a) {
        if ((r -= x[1]) < 0) return x;
      }
      return a[0];
    };
  const S = wp(VY_STAV),
    zena = S[0] === "bylinkářka" || (!/mnich|kněz|žoldnéř|panoš|havíř|vorař|letec/.test(S[0]) && Math.random() < 0.4),
    jm = pick(zena ? VY_JM.z : VY_JM.m),
    pr = S[2] && Math.random() < 0.7 ? pick(S[2].split("|")) : pick(VY_PRIZ),
    rs = /měšťan|řemeslník|kupec|kramář/.test(S[0]) ? 0.25 : 0.07,
    rasa = Math.random() < rs ? pick(["elf", "trpaslík", "půlčík", "gnóm", "napůl proměněný"]) : "člověk";
  const ok = ll ? vyOkoli({}, {xy: ll}) : [],
    pan = ok[0] && ok[0].f;
  let vira = Math.random();
  vira =
    S[0] === "katolický mnich"
      ? "katolík"
      : S[0] === "kněz pod obojí"
        ? "kališník"
        : vira < 0.08
          ? "starověrec"
          : vira < 0.12
            ? "bratr z Jednoty"
            : (pan && pan.conf === "kat" ? vira < 0.7 : pan && pan.conf === "kal" ? vira < 0.3 : vira < 0.45)
              ? "katolík"
              : "kališník";
  const st =
    S[0] === "sedlák" && zena
      ? "selka"
      : S[0] === "měšťan" && zena
        ? "měšťka"
        : S[0] === "řemeslník" && zena
          ? "řemeslnice"
          : S[0] === "kupec" && zena
            ? "kupcová"
            : S[0] === "poutník" && zena
              ? "poutnice"
              : S[0] === "žebrák" && zena
                ? "žebračka"
                : S[0] === "kramář" && zena
                  ? "kramářka"
                  : S[0] === "zeman" && zena
                    ? "zemanka"
                    : S[0];
  return `${jm} ${pr} – ${st}${rasa !== "člověk" ? `, ${rasa}` : ""}, ${vira}; ${pick(VY_POV)}. Chce ${pick(VY_CHCE)}. Tajemství: ${pick(VY_TAJ)}.`;
}
/* počasí na Úvodu pro hráče (vypravěč ho zapíná ve Výpravě) */
/* symbol počasí (iluminace: zlato, rumělka, modř; tučné obrysy, aby byl čitelný i malý) */
/* počasí na Úvodu ukazuje jen prstenec kola času; pod iluminací s dráčkem zůstává původní heslo */
async function vyZverejniPocasi() {
  if (!window.MMDB || !GMV || !VY) return;
  const o = VY.pocasi || {};
  if (JSON.stringify((HRA && HRA.pocasiR) || {}) === JSON.stringify(o)) {
    renderKal();
    return;
  }
  try {
    HRA = await MMDB.nastavHru({pocasiR: o});
    __D.HRA = HRA;
    renderKal();
  } catch (e) {
    mmHlasG("Počasí pro hráče se nepodařilo uložit: " + e.message, 6000);
  }
}
/* HTML: okolí u setkání, noclehy, lidé, tabulky, stůl */
function vyHtmlOkoli(s) {
  if (!s._q) return "";
  const ok = vyOkoli(VYT, s._q),
    os = vyOsobyOkoli(ok),
    dr = VYT.plan ? [] : vyDraciU(s._q.xy);
  if (!ok.length && !dr.length) return "";
  const roz = ok[0] ? vyRozpor(ok[0].f) : "",
    ukaz = [0, 3, 7, 11].includes(s.typ),
    draci = [6, 10].includes(s.typ);
  return `<div class="vyok">${ok.length ? `<p><span class="lbl">Okolí</span> ${ok.map(x => `<a href="#rod/${x.f.id}">${besc(x.f.name)}</a> <small>(${VY_VIRA[x.f.conf] || x.f.conf} · ${besc(x.sd[0])}${x.d >= 0.5 && !VYT.plan ? `, ${Math.round(x.d)} km` : ""})</small>`).join(" · ")}</p>` : ""}
    ${roz ? `<p class="vypozn">${roz}</p>` : ""}
    ${ukaz && os.length ? `<details class="vyos"><summary>Osoby z okolí (${os.length})</summary>${os.map(p => `<div class="gmrow gmp vyosr" data-gmid="${p.id}"><a href="#osoba/${p.id}">${besc(p.n.replace(/^✦\s*/, ""))}</a><small>${besc(p.role || "")}</small>${typeof gmSeg === "function" ? gmSeg(p.id) : ""}</div>`).join("")}</details>` : ""}
    ${draci && dr.length ? `<p><span class="lbl">Draci v kraji</span> ${dr.map(d => `<a href="#draconomicon/${d.id}">${besc(d.n)}</a>`).join(", ")}</p>` : ""}</div>`;
}
function vyHtmlNoci() {
  const N = vyNoci();
  if (!N.length) return "";
  const lid = Math.max(1, VYS.dr.length),
    kone = ["kun", "vuz", "posel"].includes(VY.zp);
  let sum = 0;
  N.forEach(n => {
    const c = VY_NOC[n.v][1];
    sum += c * lid + (n.v === "krcma" && kone ? lid : 0) + (n.v === "klaster" ? 1 : 0);
  });
  return `<section class="vycard"><h3 class="uvh2">Noclehy <small>${N.length} ${N.length === 1 ? "noc" : N.length < 5 ? "noci" : "nocí"} · asi ${sum} grošů za družinu (${lid} ${lid === 1 ? "osoba" : lid < 5 ? "osoby" : "osob"})</small></h3>
    <ol class="vynoci">${N.map(
      n => `<li><b>${vyDatum(n.j)}</b> <small>${besc(n.kde)}</small> <select data-vynoc="${n.k}" aria-label="Kde se nocuje">${Object.entries(VY_NOC)
        .map(([k, [t]]) => `<option value="${k}"${n.v === k ? " selected" : ""}>${t}</option>`)
        .join("")}</select>
      <span class="rsmall">${VY_NOC[n.v][2]}</span>${n.pozn ? `<span class="vypozn vypoznm">${n.pozn}</span>` : ""}</li>`,
    ).join("")}</ol>
    <p class="rsmall">Ceny jsou orientační: nocleh s jídlem v krčmě asi 2 groše na osobu.</p></section>`;
}
function vyHtmlTabulky() {
  const t = VY.tabT || 0;
  return `<details class="vyjak vytabedit"${VY.tabOpen ? " open" : ""}><summary>Upravit tabulky setkání</summary>
  <p class="rsmall">Každý řádek je jeden záznam: <code>kraje | název | text | ověření | boj</code>. Sloupec boj je nepovinný: id hotového setkání (např. <code>rota-bez-pana</code>), nebo nepřátelé z bestiáře oddělení středníkem (<code>6 houf-zoldneru; rotmistr-zoldneru + zkuseny</code>); tlačítko do boje je pak přenese i se statblocky. Kraje jsou písmena P pole, L hvozdy, H hory, M město, V voda, K pohraničí, W válkou zpustlý kraj, Z místa Závoje, * kdekoli. Řádky začínající # se přeskočí.</p>
  <div class="vyrow"><select data-vytabt aria-label="Typ setkání">${VY_TYPY.map((x, k) => `<option value="${k}"${t === k ? " selected" : ""}>${k + 1}. ${x.n}${VY.tab && VY.tab[k] ? " (upraveno)" : ""}</option>`).join("")}</select>
    <button type="button" class="gbtn ghost" data-vy="tabzpet"${VY.tab && VY.tab[t] ? "" : " disabled"}>Vrátit výchozí</button></div>
  <textarea data-vytab="${t}" rows="10" class="vytabta" spellcheck="false">${besc(VY.tab && VY.tab[t] ? VY.tab[t] : vyZazText(t))}</textarea>
  <div class="vyrow"><button type="button" class="gbtn" data-vy="tabuloz">Uložit tabulku</button></div></details>`;
}
function vyHtmlStul() {
  const X = VYS,
    dr = X.dr,
    K = VY.kostky,
    akt = VY.setk.findIndex(s => !s.hotovo),
    [Y, M, D] = herniDen(),
    jd = jdn(Y, M, D),
    den = X.dny.find(x => x.j === jd) || X.dny[0];
  const zasob = dr.find(x => x.role === "zasob" || x.role2 === "zasob"),
    hlid = dr.find(x => x.role === "hlidka" || x.role2 === "hlidka");
  return `<section class="vycard vystulc"><h3 class="uvh2">U stolu <small>SO ${X.D}</small></h3>
    ${den ? `<div class="vystulp"><span class="vyw">${den.P.w}</span><div><b>${vyDatum(den.j)}</b><p>${besc(den.P.text)}</p>${den.P.drak ? `<p class="rsmall">Draci: ${besc(den.P.drak)}</p>` : ""}</div></div>` : ""}
    <div class="vytrack vytrackb">
      <div><b>Zásoby</b>${K && zasob ? `<span class="vykst"><button type="button" class="gbtn ghost" data-vyk="zas" data-d="-1">−</button><span>${K.zas} × d${K.zasD}</span><button type="button" class="gbtn ghost" data-vyk="zas" data-d="1">+</button></span>` : "<small>–</small>"}</div>
      <div><b>Bdělost</b>${K && hlid ? `<span class="vykst"><button type="button" class="gbtn ghost" data-vyk="bdel" data-d="-1">−</button><span>${K.bdel} × d6</span><button type="button" class="gbtn ghost" data-vyk="bdel" data-d="1">+</button></span>` : "<small>–</small>"}</div>
      <div><b>Kostky</b><span class="vykst">${[4, 6, 8, 10, 12, 20].map(n => `<button type="button" class="gbtn ghost" data-vyhod="${n}">k${n}</button>`).join("")}</span><span class="vyhodv" id="vyhodv"></span></div></div>
    ${K ? "" : `<button type="button" class="gbtn" data-vy="vyrazit"${X.dl ? "" : " disabled"}>Vyrazit – rozdat kostky zásob a bdělosti</button>`}
    ${akt >= 0 ? `<h4 class="vysub">Setkání ${akt + 1} z ${VY.setk.length}</h4><ol class="vysetk vysetkb">${vyHtmlSetk(VY.setk[akt], akt)}</ol>` : VY.setk.length ? `<p>Všechna setkání jsou vyřešená – zbývá Konec cesty.</p>` : `<p>Tato cesta nemá žádná setkání.</p>`}
    <div class="vyrow"><button type="button" class="gbtn ghost" data-vy="clovek">Člověk na cestě</button><span class="rsmall" id="vyclovek">${besc(VY.clovek || "")}</span></div>
    <p class="rsmall">${VY.setk.map((s, i) => `<span class="vystulm${s.hotovo ? " on" : ""}${i === akt ? " akt" : ""}">${i + 1}${s.typ != null ? ` ${VY_TYPY[s.typ].n}` : ""}</span>`).join(" · ")}</p></section>`;
}
/*@cast}*/
