/* ---------- Známý svět: mapa Evropy a Středomoří k 3. 3. 1458 ---------- */
const SVET = /*@SVET@*/ [];
const SVETMESTA = /*@SVETMESTA@*/ [];
const SVETDRZ = /*@SVETDRZ@*/ [];
const SVETCESTY = /*@SVETCESTY@*/ [];
const SRCOL = {hanza: "#8b5a2b", benatky: "#b0302a", janov: "#2f5d9e", poutlod: "#7a4a9a", reka: "#3d7f8f", pout: "#7a4a9a", obchod: "#6b5a3a"};
const SRNAME = {
  hanza: "lodě Hanzy",
  benatky: "benátské galéry",
  janov: "janovské lodě",
  poutlod: "poutní galéra",
  reka: "říční plavba",
  pout: "poutní cesty",
  obchod: "obchodní cesty po souši",
};
const SRSEA = new Set(["hanza", "benatky", "janov", "poutlod", "reka"]);
/* kurfiřtská knížectví – přibližné obrysy (zeměpisné souřadnice); sedmým kurfiřtem je český král */
const SKURF = [
  [
    "Mohuč",
    [
      [7.9, 50.2],
      [8.3, 50.15],
      [9.0, 50.15],
      [9.6, 50.0],
      [9.5, 49.7],
      [8.9, 49.7],
      [8.3, 49.85],
      [7.9, 49.95],
    ],
  ],
  [
    "Trevír",
    [
      [6.4, 49.6],
      [6.9, 49.95],
      [7.4, 50.3],
      [7.7, 50.45],
      [7.8, 50.25],
      [7.3, 49.9],
      [6.9, 49.6],
      [6.5, 49.4],
    ],
  ],
  [
    "Kolín",
    [
      [6.6, 51.5],
      [7.0, 51.6],
      [8.0, 51.6],
      [8.6, 51.4],
      [8.4, 51.1],
      [7.5, 51.1],
      [7.2, 50.7],
      [7.0, 50.6],
      [6.8, 50.8],
      [6.6, 51.1],
    ],
  ],
  [
    "Falc",
    [
      [7.6, 49.7],
      [8.4, 49.65],
      [9.0, 49.5],
      [8.9, 49.2],
      [8.3, 49.1],
      [7.8, 49.2],
      [7.6, 49.4],
    ],
  ],
  [
    "Horní Falc",
    [
      [11.4, 49.8],
      [12.4, 49.8],
      [12.6, 49.3],
      [11.9, 49.0],
      [11.4, 49.2],
    ],
  ],
  [
    "Sasko",
    [
      [11.4, 51.9],
      [12.6, 52.0],
      [13.4, 51.9],
      [13.8, 51.6],
      [14.0, 51.2],
      [13.9, 50.85],
      [13.2, 50.5],
      [12.2, 50.3],
      [11.4, 50.4],
      [10.2, 50.6],
      [10.0, 51.0],
      [10.6, 51.3],
      [11.2, 51.5],
    ],
  ],
  [
    "Braniborsko",
    [
      [11.0, 52.8],
      [11.3, 53.0],
      [12.3, 53.3],
      [13.5, 53.5],
      [14.3, 53.3],
      [15.5, 53.0],
      [16.0, 52.8],
      [15.3, 52.3],
      [14.6, 52.0],
      [13.7, 51.9],
      [12.4, 52.0],
      [11.6, 52.4],
    ],
  ],
];
const SVB = {};
SVET.forEach(s => (SVB[s.id] = s));
/* ---- ilustrace mapy světa: rozměry obrázků (šířka, výška[, složka]) ---- */
const SMA = "art/svet/";
const SIMG = {
  "mesto-velke": [283, 200],
  "mesto-hradby": [308, 200],
  "mesto-pristav": [390, 200],
  "mesto-vychod": [329, 200],
  "mesto-kupole": [281, 200],
  "mesto-hrad": [205, 200],
  "mesto-kralovske": [211, 200],
  gryf: [370, 360],
  fenix: [336, 360],
  drak: [400, 360],
  "m-praha": [221, 220],
  "m-viden": [196, 220],
  "m-budin": [258, 220],
  "m-krakov": [269, 220],
  "m-moskva": [319, 220],
  "m-novgorod": [281, 220],
  "m-rim": [321, 220],
  "m-benatky": [210, 220],
  "m-pariz": [237, 220],
  "m-londyn": [244, 220],
  "m-lisabon": [269, 220],
  "m-granada": [315, 220],
  "m-konstantinopol": [233, 220],
  "m-jeruzalem": [337, 220],
  "m-kahira": [244, 220],
  "m-janov": [285, 220],
  "m-tabriz": [311, 220],
  ruzice: [434, 440],
  "lod-koga": [211, 220],
  "lod-galera": [240, 220],
  "lod-karavela": [228, 220],
  "lod-rybarska": [256, 220],
  "obluda-velryba": [358, 220],
  "obluda-had": [264, 220],
};
/* města jako obrázky: [obrázek, velikost]; ostatní hlavní města dostanou opevněné město */
const SCITY = {
  Praha: ["m-praha", 2],
  Vídeň: ["m-viden", 1.2],
  Budín: ["m-budin", 1.2],
  Krakov: ["m-krakov", 1.2],
  Moskva: ["m-moskva", 1.2],
  Novgorod: ["m-novgorod", 1.1],
  Řím: ["m-rim", 1.25],
  Benátky: ["m-benatky", 1.2],
  Paříž: ["m-pariz", 1.2],
  Londýn: ["m-londyn", 1.2],
  Lisabon: ["m-lisabon", 1.15],
  Granada: ["m-granada", 1.1],
  Konstantinopol: ["m-konstantinopol", 1.4],
  Jeruzalém: ["m-jeruzalem", 1.25],
  Káhira: ["m-kahira", 1.3],
  Janov: ["m-janov", 1.1],
  Tabríz: ["m-tabriz", 1.25],
  Florencie: ["mesto-kupole", 1],
  Edinburgh: ["mesto-kralovske", 1],
  Kodaň: ["mesto-kralovske", 1],
  Neapol: ["mesto-kralovske", 1.05],
  Barcelona: ["mesto-pristav", 1],
  Trapezunt: ["mesto-pristav", 1],
  Brusel: ["mesto-velke", 1],
  Milán: ["mesto-velke", 1],
  Královec: ["mesto-hrad", 1],
  Vilno: ["mesto-hradby", 1],
  Tunis: ["mesto-vychod", 1],
  Fès: ["mesto-vychod", 1],
  Lübeck: ["mesto-pristav", 0.9],
  Bruggy: ["mesto-pristav", 0.9],
  Alexandrie: ["mesto-pristav", 0.9],
  Kaffa: ["mesto-pristav", 0.85],
};
/* hory jen v pásmech skutečných pohoří; zasněžené vrcholy v Alpách a na Kavkaze */
/* v celkovém pohledu jen tato města; ostatní po přiblížení */
const SRIVHL = new Set(["Dunaj", "Rýn", "Labe", "Visla", "Dněpr", "Volha"]);
/* lodě a obludy [obrázek, délka, šířka, šířka obrázku, zrcadlit], růžice portulánu [délka, šířka, velká] */
const SLODE = [
  ["lod-koga", 3.6, 55.4, 30],
  ["lod-koga", 17.6, 55.9, 26, 1],
  ["lod-galera", 12.4, 39.4, 30],
  ["lod-galera", 27.2, 34.4, 28, 1],
  ["lod-karavela", -12.6, 37.6, 30],
  ["lod-rybarska", 2.5, 64.3, 24, 1],
];
const SOBLUDY = [
  ["obluda-velryba", -21.5, 51.6, 50],
  ["obluda-had", -17.5, 31.5, 36, 1],
];
const SPORT = [
  [-17, 42.6, 1],
  [5, 38.5],
  [19.5, 35.5],
  [28.5, 33.8],
  [34, 43.3],
];
/* hlavní obchodní trasy: složené z úseků cest v svet-cesty.md [název, směr, odkud, kam] */
const SHCOL = {hanza: "#8b5a2b", benatky: "#b0302a", janov: "#2f5d9e", souse: "#a07a22"};
const SHNAME = {hanza: "Hanza", benatky: "benátské galéry", janov: "janovské lodě", souse: "hlavní cesty po souši"};
const SHLAVNI = [
  {
    k: "hanza",
    n: "Hanza: Londýn – Bruggy – Lübeck – Novgorod",
    r: [
      ["Hanza: Bruggy – Londýn", -1],
      ["Hanza: Cuxhaven – Bruggy", -1],
      ["Hanza: Hamburk – Cuxhaven po Labi", -1],
      ["Hanza: Lübeck – Hamburk po souši", -1],
      ["Hanza: Lübeck – Gotland – Reval – Novgorod", 1],
      ["Hanza: Něva – Ladoga – Volchov – Novgorod", 1],
    ],
  },
  {k: "hanza", n: "Hanza: Lübeck – Bergen", r: [["Hanza: Lübeck – Bergen", 1]]},
  {
    k: "benatky",
    n: "Benátky – Konstantinopol – Kaffa – Tana",
    r: [
      ["Benátské galéry do Romanie a Černého moře", 1],
      ["Benátské galéry: Kaffa – Tana", 1],
    ],
  },
  {
    k: "benatky",
    n: "Benátky – Kandie – Alexandrie",
    r: [
      ["Benátské galéry do Romanie a Černého moře", 1, "Benátky", "Modon"],
      ["Benátské galéry do Alexandrie a Bejrútu", 1, "Modon", "Kandie"],
      ["Benátské galéry: Kandie – Alexandrie", 1],
    ],
  },
  {k: "benatky", n: "Benátské flanderské galéry", r: [["Benátské flanderské galéry", 1]]},
  {k: "janov", n: "Janov – Chios – Konstantinopol – Kaffa", r: [["Janovské lodě na Východ", 1]]},
  {k: "janov", n: "Janov – Lisabon – Bruggy", r: [["Janovské lodě do Bruggy", 1]]},
  {
    k: "souse",
    n: "Bruggy – Kolín – Norimberk – Praha – Vídeň – Budín – Konstantinopol – Tabríz",
    r: [
      ["Norimberk – Frankfurt – Kolín – Bruggy", -1],
      ["Zlatá cesta Praha – Norimberk", -1],
      ["Praha – Vídeň", 1],
      ["Dunajská cesta Řezno – Vídeň – Budín", 1, "Vídeň"],
      ["Budín – Bělehrad", 1],
      ["Carihradská cesta (Via militaris)", 1],
      ["Přes Marmaru do Bursy", 1],
      ["Hedvábná cesta Bursa – Tabríz", 1],
    ],
  },
  {k: "souse", n: "Benátky – Brenner – Augsburg", r: [["Brennerská cesta Augsburg – Benátky", -1]]},
  {k: "souse", n: "Via Regia: Frankfurt – Lipsko – Vratislav – Krakov", r: [["Královská cesta (Via Regia)", 1]]},
];
let SHL = null;
function sHlavni() {
  if (SHL) return SHL;
  SHL = SHLAVNI.map(h => {
    const pts = [];
    h.r.forEach(([n, dir, od, kam]) => {
      const r = SVETCESTY.find(x => x.n === n);
      if (!r) return;
      let p = r.p.slice();
      if (dir < 0) p.reverse();
      if (od) {
        const i = p.findIndex(q => q[0] === od);
        if (i > 0) p = p.slice(i);
      }
      if (kam) {
        const i = p.findIndex(q => q[0] === kam);
        if (i >= 0) p = p.slice(0, i + 1);
      }
      if (
        pts.length &&
        p.length &&
        ((p[0][0] && p[0][0] === pts[pts.length - 1][0]) || (p[0][1] === pts[pts.length - 1][1] && p[0][2] === pts[pts.length - 1][2]))
      )
        p = p.slice(1);
      pts.push(...p);
    });
    return {...h, pts};
  }).filter(h => h.pts.length > 1);
  return SHL;
}
const SVIRA = {kat: "katolíci", pra: "pravoslavní", isl: "islám", mix: "smíšené vyznání", kal: "kališníci"};
const SVIRAC = {kat: "var(--kat)", pra: "var(--spra)", isl: "var(--sisl)", mix: "var(--mix)", kal: "var(--kal)"};
let SG = null;
const sst = {vb: null, sel: null, hre: true, faith: false, cities: true, riv: true, conf: "all", routes: false, party: false, draci: false};
const SM = {on: false, a: null, b: null, path: null};
const sDark = () => {
  const t = document.documentElement.dataset.theme;
  return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
};
const sConfOk = S => sst.conf === "all" || (S && (S.c === sst.conf || (sst.conf === "mix" && S.c === "kal")));
function SPinv(x, y) {
  const p = SG.proj,
    X = x / p.S + p.X0,
    Y = p.Y1 - y / p.S,
    dy = p.rho0 - Y,
    rho = Math.sign(p.n) * Math.hypot(X, dy),
    th = Math.atan2(X, dy);
  return [p.lon0 + ((th / p.n) * 180) / Math.PI, ((2 * Math.atan(Math.pow(p.F / rho, 1 / p.n)) - Math.PI / 2) * 180) / Math.PI];
}
const SVB0 = [0, 0, 1024, 790],
  SVMOB = [340, 230, 360, 278];
let SNET = null;
function sInLand(x, y) {
  if (!SNET.lb)
    SNET.lb = SG.land.map(pl => {
      let a = 1e9,
        b = 1e9,
        c = -1e9,
        d = -1e9;
      pl[0].forEach(([x, y]) => {
        if (x < a) a = x;
        if (y < b) b = y;
        if (x > c) c = x;
        if (y > d) d = y;
      });
      return [a, b, c, d];
    });
  const pip = r => {
    let ins = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i],
        [xj, yj] = r[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };
  for (let i = 0; i < SG.land.length; i++) {
    const b = SNET.lb[i];
    if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
    const pl = SG.land[i];
    if (pip(pl[0]) && !pl.slice(1).some(pip)) return true;
  }
  return false;
}
function sLandLine(a, b) {
  const A = SP(...a),
    B = SP(...b),
    n = Math.max(4, Math.ceil(Math.hypot(B[0] - A[0], B[1] - A[1]) / 4));
  let ok = 0;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (sInLand(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t)) ok++;
  }
  return ok / (n - 1) >= 0.9;
}
function sNetBuild() {
  const N = (SNET = {n: [], adj: [], by: {}});
  const node = (name, ll) => {
    if (name && N.by[name] != null) return N.by[name];
    const i = N.n.length;
    N.n.push({name, ll});
    N.adj.push([]);
    if (name) N.by[name] = i;
    return i;
  };
  const link = (a, b, km, sea, k) => {
    N.adj[a].push({to: b, km, sea, k});
    N.adj[b].push({to: a, km, sea, k});
  };
  SVETCESTY.forEach(r => {
    const sea = SRSEA.has(r.k);
    let prev = null;
    r.p.forEach(([nm, lo, la]) => {
      const i = node(nm, [lo, la]);
      if (prev != null) link(prev, i, haversine(N.n[prev].ll, N.n[i].ll) * (sea ? 1.05 : 1.15), sea, r.k);
      prev = i;
    });
  });
  SVETMESTA.forEach(([n, lo, la]) => node(n, [lo, la]));
  const named = N.n.map((x, i) => i).filter(i => N.n[i].name);
  for (let a = 0; a < named.length; a++)
    for (let b = a + 1; b < named.length; b++) {
      const i = named[a],
        j = named[b],
        d = haversine(N.n[i].ll, N.n[j].ll);
      if (d < 260 && !N.adj[i].some(e => e.to === j) && sLandLine(N.n[i].ll, N.n[j].ll)) link(i, j, d * 1.3, false, "");
    }
}
/* nejrychlejší cesta po známých trasách; vl, vs = km za den po souši a po moři */
function sRoute(A, B, vl, vs) {
  if (!SNET) sNetBuild();
  const N = SNET,
    base = N.n.length,
    extra = [[], []];
  const att = (q, slot) => {
    if (q.key && N.by[q.key] != null) return N.by[q.key];
    const onL = sInLand(...SP(...q.ll)),
      near = N.n.map((x, i) => [i, haversine(q.ll, x.ll)]);
    near
      .filter(([i]) => N.n[i].name)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 8)
      .forEach(([i, d]) => {
        if (d > 650) return;
        if (!onL || sLandLine(q.ll, N.n[i].ll)) extra[slot].push({to: i, km: onL ? d * 1.3 : d * 1.05, sea: !onL});
      });
    if (!onL) near.filter(([i, d]) => !N.n[i].name && d < 250).forEach(([i, d]) => extra[slot].push({to: i, km: d * 1.05, sea: true}));
    return base + slot;
  };
  const ia = att(A, 0),
    ib = att(B, 1),
    direct = haversine(A.ll, B.ll),
    dOk = direct < 700 && sLandLine(A.ll, B.ll);
  const adj = i => {
    const out = i < base ? N.adj[i].slice() : extra[i - base].slice();
    for (let q = 0; q < 2; q++)
      extra[q].forEach(e => {
        if (e.to === i) out.push({to: base + q, km: e.km, sea: e.sea});
      });
    if (i === ia && dOk) out.push({to: ib, km: direct * 1.3, sea: false});
    return out;
  };
  const dist = new Map([[ia, 0]]),
    prev = new Map(),
    done = new Set(),
    pq = [[0, ia]];
  while (pq.length) {
    let m = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[m][0]) m = i;
    const [d, u] = pq.splice(m, 1)[0];
    if (done.has(u)) continue;
    done.add(u);
    if (u === ib) break;
    for (const e of adj(u)) {
      const nd = d + e.km / (e.sea ? vs : vl);
      if (nd < (dist.has(e.to) ? dist.get(e.to) : 1e18)) {
        dist.set(e.to, nd);
        prev.set(e.to, [u, e]);
        pq.push([nd, e.to]);
      }
    }
  }
  if (ia !== ib && !prev.has(ib)) return null;
  const llOf = i => (i === base ? A.ll : i === base + 1 ? B.ll : N.n[i].ll),
    path = [];
  let land = 0,
    sea = 0,
    u = ib;
  while (u !== ia) {
    const [p, e] = prev.get(u);
    path.unshift({ll: llOf(u), sea: e.sea});
    if (e.sea) sea += e.km;
    else land += e.km;
    u = p;
  }
  path.unshift({ll: llOf(ia), sea: false});
  return {path, land: Math.round(land), sea: Math.round(sea)};
}
const sTip = (e, h) => {
  const t = document.getElementById("stip");
  if (!t) return;
  if (!h || e.pointerType !== "mouse") {
    t.hidden = true;
    return;
  }
  const b = t.parentElement.getBoundingClientRect();
  t.innerHTML = h;
  t.hidden = false;
  t.style.left = Math.min(e.clientX - b.left + 14, b.width - t.offsetWidth - 6) + "px";
  t.style.top = e.clientY - b.top + 16 + "px";
};
/* ručně umístěné popisky velkých mocností (zeměpisná délka, šířka) */
const SLABPOS = {
  hre: [11.5, 52.0],
  ott: [33.8, 38.5],
  boh: [16.2, 50.25],
  hun: [21.3, 46.6],
  pol: [19.6, 52.4],
  fra: [2.2, 46.6],
  kas: [-3.4, 39.4],
  por: [-8.4, 41.1],
  mam: [30.0, 28.6],
  ven: [12.2, 45.85],
  pap: [12.6, 42.9],
  nap: [15.6, 41.0],
  mos: [42.0, 57.6],
  nov: [37.5, 63.5],
  kal: [14.5, 63.3],
  lit: [27.5, 53.0],
  hor: [44.5, 50.5],
  eng: [-1.6, 52.6],
  bur: [4.2, 50.4],
  ara: [-0.3, 41.0],
  qqq: [43.6, 35.0],
};
/* moře, hory: zeměpisné souřadnice */
const SSEAS = [
  ["Atlantský oceán", -15, 47, 0, 15],
  ["Severní moře", 3.5, 56.3, 0, 11],
  ["Baltské moře", 19.2, 57.2, -62, 10],
  ["Norské moře", 1, 66, 0, 12],
  ["Bílé moře", 38.5, 65.6, 0, 8.5],
  ["Středozemní moře", 17.5, 34.6, 0, 14],
  ["Tyrhénské moře", 11.8, 40, 0, 9],
  ["Jaderské moře", 15.3, 43.1, -42, 8.5],
  ["Egejské moře", 25.2, 38.9, -70, 8.5],
  ["Černé moře", 34.5, 43.3, 0, 12],
  ["Azovské moře", 36.7, 46.1, 0, 7.5],
  ["Kaspické moře", 50.5, 43, -75, 10],
  ["Biskajský záliv", -5, 45.4, 0, 9],
  ["Iónské moře", 18.5, 37.8, 0, 8.5],
];
function SP(lon, lat) {
  const p = SG.proj,
    r = p.F / Math.pow(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360), p.n),
    t = (p.n * (lon - p.lon0) * Math.PI) / 180;
  return [(r * Math.sin(t) - p.X0) * p.S, (p.Y1 - (p.rho0 - r * Math.cos(t))) * p.S];
}
/* svet.json je zhuštěný: souřadnice jsou celá čísla (desetiny bodu) zapsaná jako rozdíly od předchozího bodu */
function svRozbal(d) {
  if (!d._z) return d;
  const dz = a => {
      const o = [];
      let x = 0,
        y = 0;
      for (let i = 0; i < a.length; i += 2) {
        x += a[i];
        y += a[i + 1];
        o.push([x / 10, y / 10]);
      }
      return o;
    },
    P = v => (v || []).map(p => p.map(dz));
  for (const k in d.states) d.states[k] = P(d.states[k]);
  d.land = P(d.land);
  d.hre = P(d.hre);
  d.lakes = P(d.lakes);
  (d.rivers || []).forEach(r => (r.p = dz(r.p)));
  return d;
}
