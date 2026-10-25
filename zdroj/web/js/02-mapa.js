/* --- map geometry --- */
const P = (lo, la) => [(lo - 10.9) * 72, (52.7 - la) * 112];
const pts = a =>
  a
    .map(([lo, la]) =>
      P(lo, la)
        .map(v => v.toFixed(1))
        .join(","),
    )
    .join(" ");
/* Lands of the Crown in 1458, derived from Natural Earth country borders with historical corrections
   (Kladsko to Bohemia, Valticko and Vitorazsko to Austria, Czech Silesia and Jesenicko to Silesia, Krosno to Silesia). Each entry: [fill, [rings]] */
const RIVERS = [
  [
    [15.54, 50.77],
    [15.75, 50.55],
    [15.92, 50.36],
    [15.83, 50.21],
    [15.78, 50.04],
    [15.2, 50.03],
    [15.12, 50.14],
    [15.04, 50.19],
    [14.47, 50.35],
    [14.13, 50.53],
    [14.04, 50.66],
    [14.21, 50.78],
    [14.25, 50.9],
    [13.74, 51.05],
    [13.4, 51.15],
    [12.9, 51.5],
    [12.3, 51.85],
    [11.7, 52.1],
  ],
  [
    [13.55, 48.97],
    [14.1, 48.66],
    [14.31, 48.62],
    [14.32, 48.81],
    [14.47, 48.97],
    [14.42, 49.22],
    [14.19, 49.44],
    [14.35, 49.75],
    [14.42, 50.09],
    [14.47, 50.35],
  ],
  [
    [17.6, 49.62],
    [18.3, 49.85],
    [18.22, 50.09],
    [18.3, 50.35],
    [17.93, 50.67],
    [17.47, 50.86],
    [17.03, 51.11],
    [16.4, 51.3],
    [16.08, 51.66],
    [15.6, 51.95],
    [15.1, 52.05],
    [14.55, 52.35],
    [14.4, 52.65],
  ],
  [
    [16.85, 50.18],
    [16.95, 49.9],
    [17.25, 49.59],
    [17.39, 49.3],
    [17.46, 49.07],
    [17.13, 48.86],
    [16.95, 48.62],
    [16.97, 48.15],
  ],
  [
    [15.15, 50.75],
    [15.05, 50.77],
    [14.81, 50.9],
    [14.99, 51.15],
    [14.75, 51.6],
    [14.72, 51.95],
    [14.65, 52.1],
  ],
  [
    [11.0, 48.75],
    [12.1, 49.02],
    [12.9, 48.8],
    [13.46, 48.57],
    [14.29, 48.31],
    [15.0, 48.22],
    [15.6, 48.41],
    [16.37, 48.21],
    [17.11, 48.15],
    [17.63, 47.69],
    [18.12, 47.76],
    [18.74, 47.79],
    [19.13, 47.78],
    [19.04, 47.5],
    [19.0, 47.3],
  ],
  [
    [18.97, 49.62],
    [18.95, 49.85],
    [19.23, 50.04],
    [19.6, 50.0],
    [19.94, 50.06],
    [20.4, 50.18],
  ],
];
const VB = {
  all: [0, 0, 680, 605],
  koruna: [60, 35, 560, 445],
  cechy: [70, 165, 375, 312],
  morava: [288, 250, 285, 225],
  slezsko: [280, 50, 345, 330],
  luzice: [145, 30, 205, 190],
};
let st = {
  zoom: "all",
  conf: "all",
  sel: null,
  city: null,
  focus: null,
  vb: null,
  roads: false,
  rings: false,
  holds: true,
  cities: true,
  dio: false,
  duchy: false,
  dom: false,
  party: false,
  measure: false,
  ta: null,
  tb: null,
};
const svg = document.getElementById("map");
/* podklad mapy pod #map (krajina, hranice, papír – drahé filtry); kreslí ho mapPodklad v 02b, jen když se změní výřez */
const svgZ = document.getElementById("mapz");
/* obaly vrstev (podklad #mapvz, sídla #mapvrstvy): při posunu se posouvají a zvětšují jen ony (mapPosun); mezi nimi je pevný
   rám #mapr (rám a ztmavené rohy u okraje okna) a vše drží .mapplatno (rozměr okna mapy, ořez) */
const mapVrstvy = document.getElementById("mapvrstvy");
const mapVrstvyZ = document.getElementById("mapvz");
const svgR = document.getElementById("mapr");
const mapPlatno = document.getElementById("mapplatno");
/* mapa přes celou šířku na počítači (2026-10-24, Vojta): v Mapě od 1100 px má svg výšku podle okna a výřez se roztáhne do šířky
   (mapFit); na telefonu a ve Výpravě zůstává pevný poměr 680 : 605. Svět mapy sahá od Bavor po Košice (MAPWB: x, y, šířka, výška). */
const MAPW_MQ = matchMedia("(min-width:1100px)");
const MAPWB = [-80, -40, 890, 705];
const mapWide = () => MAPW_MQ.matches && !!svg.closest("#mapa");
/* výchozí výřezy široké mapy: „Se sousedy“ od Lužice po Budín a od Bavor po Košice */
const VBW = {all: [-80, 40, 890, 560]};
const mapPreset = () => (mapWide() && VBW[st.zoom]) || VB[st.zoom];
const mapAsp = () => {
  if (!mapWide()) return 605 / 680;
  /* obal mapy: jeho rozměr se při gestu nemění (svg samo je posunuté a zvětšené transformací) */
  const r = mapPlatno.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? Math.max(0.42, Math.min(0.95, r.height / r.width)) : 605 / 680;
};
/* výřez v poměru stran okna mapy: přidá šířku (nebo výšku) kolem středu a udrží ho ve světě mapy */
function mapFit(v) {
  const A = mapAsp();
  let [x, y, w, h] = v;
  if (h / w > A) {
    const w2 = h / A;
    x -= (w2 - w) / 2;
    w = w2;
  } else {
    const h2 = w * A;
    y -= (h2 - h) / 2;
    h = h2;
  }
  if (w > MAPWB[2]) {
    x += (w - MAPWB[2]) / 2;
    w = MAPWB[2];
    const h2 = w * A;
    y += (h - h2) / 2;
    h = h2;
  }
  x = Math.max(MAPWB[0], Math.min(MAPWB[0] + MAPWB[2] - w, x));
  y = h >= MAPWB[3] ? MAPWB[1] + (MAPWB[3] - h) / 2 : Math.max(MAPWB[1], Math.min(MAPWB[1] + MAPWB[3] - h, y));
  return [x, y, w, h];
}
/* posouvání bez překreslování (2026-10-24, Vojta): mapa se kreslí s okrajem MAPM (podíl výřezu na každé straně – odpovídá CSS
   .mapvrstvy: left/top −40 %, šířka a výška 180 %, transform-origin v rohu okna). Posun, který zůstane v nakreslené oblasti
   (mapKresba.d) a nezmění měřítko, jen posune hotový obraz (mapPosun); znovu se kreslí až při přiblížení nebo dalekém posunu. */
const MAPM = 0.4;
const mapKresba = {d: null, vd: null, s: 0};
const mapVidim = () => st.vb || (mapWide() ? mapFit(mapPreset()) : VB[st.zoom]);
const mapOkraj = v => [v[0] - MAPM * v[2], v[1] - MAPM * v[3], v[2] * (1 + 2 * MAPM), v[3] * (1 + 2 * MAPM)];
/* měřítko kresby: na široké mapě podle skutečné šířky okna v pixelech, aby značky a písmo měly stejnou velikost jako dřív */
const mapMeritko = v => (mapWide() ? (v[2] / Math.max(300, mapPlatno.getBoundingClientRect().width)) * (880 / 680) : v[2] / 680);
/* stačí výřez v jen posunout? (stejná velikost a měřítko, celý uvnitř nakreslené oblasti) */
function mapLzePosunout(v, s) {
  const K = mapKresba,
    D = K.d,
    e = 1e-6 * v[2];
  return (
    !!D &&
    Math.abs(K.s - s) < 1e-9 &&
    Math.abs(K.vd[2] - v[2]) < e &&
    Math.abs(K.vd[3] - v[3]) < e &&
    v[0] >= D[0] - e &&
    v[1] >= D[1] - e &&
    v[0] + v[2] <= D[0] + D[2] + e &&
    v[1] + v[3] <= D[1] + D[3] + e
  );
}
/* posun a zvětšení obou vrstev z nakresleného výřezu na výřez v – jen CSS transformace obalů, prohlížeč nic nepřekresluje */
function mapPosun(v) {
  const a = mapKresba.vd,
    r = mapPlatno.getBoundingClientRect();
  let t = "";
  if (a && r.width > 0 && (a[0] !== v[0] || a[1] !== v[1] || a[2] !== v[2] || a[3] !== v[3])) {
    const kx = a[2] / v[2],
      ky = a[3] / v[3],
      tx = ((a[0] - v[0]) / v[2]) * r.width,
      ty = ((a[1] - v[1]) / v[3]) * r.height;
    t = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${kx.toFixed(4)},${ky.toFixed(4)})`;
  }
  mapVrstvy.style.transform = mapVrstvyZ.style.transform = t;
}
const NS = "http://www.w3.org/2000/svg";
const el = (n, a, txt) => {
  const e = document.createElementNS(NS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  if (txt != null) e.textContent = txt;
  return e;
};
/* řetězce cest pro tvary map se sestaví jen jednou; při přiblížení se jen znovu použijí. Kreslí s nimi mapa světa (05b)
   i plán Prahy (04b) – plán se načítá bez mapy světa, proto jsou tady v jádru (2026-10-22, dřív „svPath is not defined“) */
const SVPC = new WeakMap();
const svPath = p => {
  let v = SVPC.get(p);
  if (v === undefined) {
    v = p.map(r => "M" + r.map(q => q.join(",")).join("L") + "Z").join("");
    SVPC.set(p, v);
  }
  return v;
};
const svLine = r => {
  let v = SVPC.get(r);
  if (v === undefined) {
    v = "M" + r.map(q => q.join(",")).join("L");
    SVPC.set(r, v);
  }
  return v;
};
/* skupiny se stejným filtrem jdoucí po sobě sdílí jeden filtrovaný obal: filtr se pak počítá jednou, ne pro každou vrstvu zvlášť */
const svgG = (svg, a) => {
  a = a || {};
  const f = a.filter;
  if (!f) {
    const g = el("g", a);
    svg.appendChild(g);
    return g;
  }
  let w = svg.lastElementChild;
  if (!w || w.getAttribute("data-fw") !== f) {
    w = el("g", {filter: f, "data-fw": f});
    svg.appendChild(w);
  }
  const b = {...a};
  delete b.filter;
  const g = el("g", b);
  w.appendChild(g);
  return g;
};

const ROADS = [
  [
    "Zlatá stezka",
    [
      [13.46, 48.57],
      [13.6, 48.73],
      [13.8, 48.9],
      [14.0, 49.01],
    ],
    1,
  ],
  [
    "Vimperská větev",
    [
      [13.6, 48.73],
      [13.78, 49.05],
    ],
    0,
  ],
  [
    "Kašperskohorská větev",
    [
      [13.46, 48.57],
      [13.5, 48.85],
      [13.56, 49.14],
      [13.52, 49.23],
    ],
    0,
  ],
  [
    "Vysoká cesta",
    [
      [11.03, 50.98],
      [12.37, 51.34],
      [13.47, 51.16],
      [14.42, 51.18],
      [14.99, 51.15],
      [15.29, 51.12],
      [16.16, 51.21],
      [17.03, 51.11],
      [17.47, 50.86],
      [17.93, 50.67],
      [18.85, 50.32],
      [19.94, 50.06],
    ],
    3,
  ],
  [
    "Norimberská stezka",
    [
      [14.42, 50.09],
      [14.07, 49.96],
      [13.6, 49.74],
      [13.38, 49.75],
      [13.0, 49.75],
      [12.78, 49.71],
      [12.49, 49.64],
      [11.86, 49.44],
      [11.08, 49.45],
    ],
    5,
  ],
  [
    "Řezenská stezka",
    [
      [13.38, 49.75],
      [13.07, 49.55],
      [12.93, 49.44],
      [12.84, 49.31],
      [12.66, 49.22],
      [12.1, 49.02],
    ],
    3,
  ],
  [
    "Chebská stezka",
    [
      [14.42, 50.09],
      [14.09, 50.23],
      [13.8, 50.36],
      [13.55, 50.33],
      [13.27, 50.38],
      [12.94, 50.31],
      [12.75, 50.19],
      [12.37, 50.08],
    ],
    4,
  ],
  [
    "Srbská stezka",
    [
      [13.8, 50.36],
      [13.64, 50.5],
      [13.44, 50.62],
      [13.34, 50.92],
      [12.9, 51.15],
      [12.37, 51.34],
    ],
    2,
  ],
  [
    "Chlumecká stezka",
    [
      [14.42, 50.09],
      [14.13, 50.4],
      [14.05, 50.52],
      [14.04, 50.66],
      [13.94, 50.7],
      [13.98, 50.73],
      [13.74, 51.05],
      [13.47, 51.16],
    ],
    4,
  ],
  [
    "Lužická stezka",
    [
      [14.42, 50.09],
      [14.47, 50.35],
      [14.54, 50.54],
      [14.54, 50.69],
      [14.55, 50.95],
      [14.42, 51.18],
    ],
    3,
  ],
  [
    "Žitavská stezka",
    [
      [14.42, 50.09],
      [14.9, 50.41],
      [15.16, 50.59],
      [14.81, 50.9],
      [14.99, 51.15],
    ],
    2,
  ],
  [
    "Kladská stezka",
    [
      [14.42, 50.09],
      [15.2, 50.03],
      [15.83, 50.21],
      [16.16, 50.42],
      [16.65, 50.44],
      [16.49, 50.84],
      [17.03, 51.11],
    ],
    3,
  ],
  [
    "Trstenická stezka",
    [
      [15.2, 50.03],
      [15.27, 49.95],
      [15.8, 49.95],
      [16.16, 49.95],
      [16.31, 49.87],
      [16.3, 49.76],
      [16.47, 49.76],
      [16.57, 49.55],
      [16.61, 49.2],
    ],
    7,
  ],
  [
    "Trstenická větev k Olomouci",
    [
      [16.47, 49.76],
      [16.66, 49.76],
      [16.83, 49.7],
      [17.25, 49.59],
    ],
    0,
  ],
  [
    "Haberská stezka",
    [
      [14.42, 50.09],
      [15.2, 50.03],
      [15.38, 49.91],
      [15.49, 49.75],
      [15.58, 49.61],
      [15.59, 49.4],
      [16.05, 48.86],
      [16.37, 48.21],
    ],
    4,
  ],
  [
    "Vitorazská stezka",
    [
      [14.66, 49.41],
      [14.72, 49.26],
      [15.0, 49.14],
      [14.89, 48.7],
      [15.17, 48.6],
      [15.6, 48.41],
      [16.37, 48.21],
    ],
    3,
  ],
  [
    "Linecká stezka",
    [
      [14.42, 50.09],
      [14.7, 49.78],
      [14.66, 49.41],
      [14.47, 48.97],
      [14.5, 48.74],
      [14.5, 48.51],
      [14.29, 48.31],
    ],
    2,
  ],
  [
    "Brněnská cesta",
    [
      [15.59, 49.4],
      [15.88, 49.21],
      [16.61, 49.2],
    ],
    0,
  ],
  [
    "Cesta Moravskou branou",
    [
      [16.37, 48.21],
      [16.64, 48.81],
      [16.61, 49.2],
      [17.0, 49.28],
      [17.25, 49.59],
      [17.73, 49.55],
      [17.9, 49.94],
      [18.22, 50.09],
      [18.85, 50.32],
    ],
    3,
  ],
  [
    "Uherská stezka",
    [
      [17.25, 49.59],
      [17.39, 49.3],
      [17.46, 49.07],
      [17.65, 49.03],
      [17.95, 49.03],
      [18.04, 48.89],
    ],
    3,
  ],
  [
    "Opavská cesta do Vratislavi",
    [
      [17.9, 49.94],
      [17.7, 50.09],
      [17.82, 50.2],
      [17.33, 50.47],
      [17.47, 50.86],
    ],
    3,
  ],
  [
    "Podunajská cesta",
    [
      [16.37, 48.21],
      [17.11, 48.15],
      [17.63, 47.69],
      [18.12, 47.76],
      [18.74, 47.79],
      [19.04, 47.5],
    ],
    2,
  ],
  [
    "Dunajská cesta",
    [
      [12.1, 49.02],
      [12.6, 48.85],
      [13.46, 48.57],
      [14.29, 48.31],
      [15.0, 48.22],
      [15.6, 48.41],
      [16.37, 48.21],
    ],
    3,
  ],
  [
    "Norimberk–Řezno",
    [
      [11.08, 49.45],
      [11.6, 49.2],
      [12.1, 49.02],
    ],
    1,
  ],
  [
    "Říšská cesta",
    [
      [11.08, 49.45],
      [11.6, 49.95],
      [11.92, 50.31],
      [12.14, 50.5],
      [12.5, 50.72],
      [12.37, 51.34],
    ],
    2,
  ],
  [
    "Cesta do Berlína",
    [
      [12.37, 51.34],
      [12.65, 51.87],
      [13.0, 52.2],
      [13.4, 52.52],
    ],
    2,
  ],
  [
    "Lipsko–Magdeburk",
    [
      [12.37, 51.34],
      [11.97, 51.48],
      [11.63, 52.13],
    ],
    2,
  ],
  [
    "Poznaňská cesta",
    [
      [13.4, 52.52],
      [14.55, 52.35],
      [15.5, 52.4],
      [16.93, 52.41],
    ],
    2,
  ],
  [
    "Vratislav–Poznaň",
    [
      [17.03, 51.11],
      [17.05, 51.31],
      [16.85, 51.85],
      [16.93, 52.41],
    ],
    2,
  ],
  [
    "Jantarová stezka",
    [
      [17.03, 51.11],
      [17.5, 51.45],
      [18.09, 51.76],
      [18.4, 52.25],
      [18.6, 52.75],
    ],
    2,
  ],
  [
    "Cesta do Uher přes Nový Targ",
    [
      [19.94, 50.06],
      [19.94, 49.83],
      [20.03, 49.48],
      [20.3, 49.25],
    ],
    2,
  ],
  [
    "Cesta k horním městům",
    [
      [19.04, 47.5],
      [19.13, 47.78],
      [19.25, 48.15],
      [19.13, 48.58],
      [19.15, 48.74],
      [18.92, 48.7],
    ],
    2,
  ],
  [
    "Štiavnická větev",
    [
      [19.13, 48.58],
      [18.9, 48.45],
    ],
    0,
  ],
  [
    "Jablunkovská cesta",
    [
      [18.04, 48.89],
      [18.74, 49.22],
      [18.76, 49.58],
      [18.63, 49.75],
    ],
    2,
  ],
  [
    "Považská cesta",
    [
      [17.11, 48.15],
      [17.59, 48.38],
      [17.8, 48.6],
      [18.04, 48.89],
    ],
    2,
  ],
  [
    "Cesta k Benátkám",
    [
      [16.37, 48.21],
      [16.25, 47.81],
      [15.9, 47.6],
      [15.7, 47.25],
    ],
    2,
  ],
  [
    "Cesta do Salcburku",
    [
      [14.29, 48.31],
      [13.8, 48.15],
      [13.4, 47.95],
      [13.05, 47.8],
    ],
    2,
  ],
  [
    "Cesta do Mnichova",
    [
      [12.1, 49.02],
      [12.15, 48.54],
      [11.58, 48.14],
    ],
    1,
  ],
  [
    "Pasov–Landshut",
    [
      [13.46, 48.57],
      [12.8, 48.6],
      [12.15, 48.54],
    ],
    0,
  ],
  [
    "Ponitranská cesta",
    [
      [18.04, 48.89],
      [18.62, 48.77],
      [18.92, 48.7],
    ],
    1,
  ],
  [
    "Turčianska cesta",
    [
      [18.74, 49.22],
      [18.92, 49.07],
      [19.15, 48.74],
    ],
    1,
  ],
  [
    "Odranská cesta",
    [
      [17.03, 51.11],
      [16.16, 51.21],
      [16.08, 51.66],
      [15.1, 52.05],
      [14.55, 52.35],
    ],
    3,
  ],
  [
    "Cheb–Plavno",
    [
      [12.37, 50.08],
      [12.26, 50.32],
      [12.14, 50.5],
    ],
    1,
  ],
];
const CTYPE = {
  mes: "Královské město",
  ses: "Město lužického Šestiměstí",
  vra: "Královské město",
  mdl: "Zemské město Dolní Lužice",
  rmi: "Svobodné říšské město",
  umi: "Svobodné královské město",
  cat: "Zeměpanské město",
  cba: "Zeměpanské město",
  csa: "Zeměpanské město",
  cbr: "Hanzovní město",
  cpl: "Královské město",
  chu: "Město",
};
const CITYINFO = {
  Praha: {n: "Sídlo krále a srdce kalicha. Na Staroměstské radnici byl 2. března zvolen Jiří z Poděbrad; v Týnském chrámu káže Jan Rokycana."},
  "Kutná Hora": {
    n: "Stříbrné doly a královská mincovna, odkud pochází pražský groš. Kališnická, ale s živou vzpomínkou na krvavé spory s Němci z husitských let.",
  },
  Tábor: {n: "Někdejší město husitských bratrstev, které Jiří roku 1452 podrobil. Radikálové jsou zlomení, vzpomínky živé."},
  "Hradec Králové": {t: "Věnné město královny", n: "Bašta východočeských kališníků a orebitů, bohaté město na Labi."},
  Žatec: {n: "Bohaté kališnické město s chmelnicemi, spojenec Loun."},
  Plzeň: {n: "Katolická bašta západu. Za husitských válek odolala obležení a dodnes vede katolický plzeňský landfrýd."},
  "České Budějovice": {n: "Katolické, převážně německé město věrné králi, obklopené rožmberskými državami; brána k Linci."},
  Cheb: {t: "Říšské město zastavené Koruně", n: "Katolické a německé, se širokou samosprávou. Spadá pod řezenského biskupa, ne pod Prahu."},
  Brno: {n: "Hlavní město Moravy, katolické a německé, opatrné vůči kališnickému králi."},
  Olomouc: {n: "Katolické královské město a sídlo biskupské kapituly."},
  Jihlava: {n: "Bohaté stříbrné a soukenické město, nejzarytější katolický odpůrce Jiřího na Moravě."},
  Znojmo: {n: "Katolické královské město nad Dyjí, kousek od rakouské hranice."},
  Litoměřice: {n: "Kališnické město na Labi, žije z obchodu s vínem, obilím a solí."},
  Louny: {n: "Kališnické město na Ohři; se Žatcem tvoří svazek severozápadních husitských měst."},
  Slaný: {n: "Kališnické město na Chebské stezce."},
  Kolín: {n: "Kališnické město na Labi, kde se rozbíhají cesty na Moravu a do Kladska."},
  Čáslav: {n: "Kališnické město; roku 1421 se zde sešel slavný sněm, který sesadil Zikmunda."},
  Nymburk: {n: "Kališnické labské město s mohutnými hradbami."},
  Chrudim: {t: "Věnné město královny", n: "Kališnické město na Trstenické stezce."},
  "Vysoké Mýto": {t: "Věnné město královny", n: "Kališnické město na Trstenické stezce."},
  Polička: {t: "Věnné město královny", n: "Kališnické pohraniční město na moravském pomezí."},
  "Dvůr Králové": {t: "Věnné město královny", n: "Kališnické město na horním Labi."},
  Jaroměř: {t: "Věnné město královny", n: "Kališnické město u labského brodu na Kladské stezce."},
  Mělník: {t: "Věnné město královny", n: "Vinařské město na soutoku Labe a Vltavy."},
  Písek: {n: "Kališnické město u kamenného mostu přes Otavu, kde se rýžuje zlato."},
  Klatovy: {n: "Kališnické město, strážce cest do Bavor."},
  Domažlice: {n: "Kališnické město Chodů, kteří hlídají hranici. Roku 1431 tu husité rozprášili křížovou výpravu."},
  Sušice: {n: "Kališnické město na Otavě, kam míří kašperskohorská větev Zlaté stezky."},
  Beroun: {n: "Kališnické město na Norimberské stezce."},
  Rakovník: {n: "Kališnické město při královských lesích Křivoklátska."},
  Most: {n: "Katolické německé město pod Krušnými horami; roku 1421 se u něj husité krvavě nezdařili."},
  Kadaň: {n: "Katolické královské město na Ohři."},
  "Ústí nad Labem": {n: "Roku 1426 u něj husité porazili Sasy a město vypálili; pomalu se zvedá z popela."},
  "Uherské Hradiště": {n: "Katolické město, strážce uherské hranice, které husitům nikdy nepodlehlo."},
  Uničov: {n: "Katolické královské město s hornickou tradicí."},
  "Uherský Brod": {n: "Katolické město na Uherské stezce."},
  Vratislav: {n: "Největší město Koruny po Praze, katolické a hanzovní. Krále-kacíře odmítá a jeho kazatelé proti Jiřímu burcují."},
  Svídnice: {n: "Hlavní město korunního knížectví svídnicko-javorského, po Vratislavi nejpřednější město Slezska; bohatne na suknu a pivu."},
  Olava: {n: "Město lehnických Piastovců na Odře mezi Vratislaví a Břehem."},
  Zhořelec: {n: "Nejbohatší město Šestiměstí na Vysoké cestě, obchoduje se suknem a borůvkovým barvivem."},
  Budyšín: {n: "Hlavní město Horní Lužice se sídlem kapituly a zemského fojta."},
  Žitava: {n: "Odolala husitům a žije z obchodu s Čechami přes Lužické hory."},
  Lubáň: {n: "Nejmenší z měst Šestiměstí, na hranici se Slezskem."},
  Kamenec: {n: "Město Šestiměstí na západním okraji Horní Lužice."},
  Lobava: {n: "Město Šestiměstí mezi Budyšínem a Zhořelcem."},
  Norimberk: {n: "Největší obchodní město jižního Německa a hlavní obchodní partner Prahy a Plzně."},
  Řezno: {n: "Dunajský přístav, sídlo biskupa a stará říšská metropole."},
  Erfurt: {t: "Město mohučského arcibiskupa", n: "Bohatá durynská metropole s univerzitou, která si vládne sama."},
  Prešpurk: {n: "Pohraniční uherské město naproti Rakousům, na Dunaji i Považské cestě."},
  Trnava: {n: "Bohaté obchodní město na Považské cestě."},
  "Banská Štiavnica": {n: "Nejbohatší stříbrné doly Uher."},
  "Banská Bystrica": {n: "Měděné doly, jejichž měď jde až do Benátek."},
  Lipsko: {n: "Trhy na křižovatce Vysoké a Říšské cesty."},
  Freiberk: {n: "Nejbohatší stříbrné doly Saska."},
  Halle: {t: "Město magdeburského arcibiskupa", n: "Bohatne na solných pramenech."},
  "Věličky (Wieliczka)": {t: "Královské solné doly", n: "Sůl z Věliček je jedním z největších příjmů polské koruny."},
  /* doplněno 2026-10-25 (Vojta): vlastní shrnutí měst Moravy, Slezska a sousedů, města sousedních zemí a klíčové hrady */
  Kouřim: {n: "Kališnické královské město, středisko Kouřimského kraje. Roku 1421 ho dobyli pražští husité."},
  Stříbro: {n: "Královské horní město na Mži. Roku 1427 ho obléhala křížová výprava, než v panice utekla k Tachovu."},
  Tachov: {n: "Pohraniční královské město u bavorské hranice. Roku 1427 tu Prokop Holý rozprášil křížovou výpravu a město dobyl."},
  Trutnov: {t: "Věnné město královny", n: "Převážně německé město pod Krkonošemi na cestě do Slezska."},
  Prachatice: {n: "Město Zlaté stezky, kudy se z Pasova vozí sůl. Roku 1420 ho Žižka dobyl a krutě potrestal; pak patřilo k táborskému svazu."},
  Litovel: {n: "Malé katolické královské město na rozvětvené řece Moravě nedaleko Olomouce."},
  Augšpurk: {
    t: "Svobodné říšské město",
    n: "Bohaté švábské město kupců a tkalců barchetu. Sídlí tu augsburský biskup, kardinál Petr ze Schaumbergu, ale město si vládne samo.",
  },
  Košice: {
    t: "Svobodné královské město",
    n: "Přední z pětice hornouherských měst (s Levočí, Bardejovem, Prešovem a Sabinovem). Ve 40. letech oporou Jana Jiskry z Brandýsa, roku 1452 mu bylo odňato.",
  },
  Levoča: {
    t: "Svobodné královské město",
    n: "Hlavní město spišských Sasů s právem skladu, člen svazu pěti hornouherských měst. Ještě roku 1450 v moci Jana Jiskry z Brandýsa.",
  },
  Bardejov: {
    t: "Svobodné královské město",
    n: "Šarišské obchodní město na cestě do Polska, člen svazu pěti hornouherských měst. Ještě roku 1450 v moci Jana Jiskry z Brandýsa.",
  },
  Prešov: {
    t: "Svobodné královské město",
    n: "Šarišské město ve svazu pěti hornouherských měst. Kraj kolem trpí nájezdy bratříků, žoldnéřů z Jiskrových vojsk.",
  },
  Skalica: {
    t: "Svobodné královské město",
    n: "Pohraniční město na moravské hranici. Roku 1432 ho dobyli husité a dva roky odtud plenili okolí; roku 1450 ho převzal Jan Hunyadi.",
  },
  Pešť: {
    t: "Svobodné královské město",
    n: "Kupecké město naproti Budínu. Na sněmu v Pešti byl v lednu 1458 provolán králem Matyáš Korvín, tehdy ještě zajatec Jiřího v Praze.",
  },
  "Lubin (Lübben)": {
    n: "Sídlo zemského fojta Dolní Lužice. Zemi České koruny od roku 1448 drží braniborský kurfiřt Fridrich II. a vládne jí odsud přes svého fojta.",
  },
  Guben: {n: "Město Dolní Lužice na Nise. Dolní Lužici, zemi České koruny, od roku 1448 drží braniborský kurfiřt Fridrich II."},
  Luckau: {n: "Jedno z předních měst Dolní Lužice. Zemi České koruny od roku 1448 drží braniborský kurfiřt Fridrich II."},
  Linec: {
    t: "Zeměpanské město",
    n: "Trhové město Rakous nad Enží s mezinárodními jarmarky. O zemi nad Enží se po Ladislavově smrti uchází arcivévoda Albrecht VI., bratr císaře.",
  },
  Kremže: {t: "Zeměpanské město", n: "Dvojměstí Kremže a Steinu na Dunaji, bohaté obchodem a vínem; razí se tu kremžský fenik."},
  Štýr: {t: "Zeměpanské město", n: "Město železa na Enži: od roku 1287 má právo skladu železa a dřeva a ovládá obchod se železem ze štýrských dolů."},
  "Štýrský Hradec": {
    t: "Sídelní město",
    n: "Sídlo císaře Fridricha III., který tu od roku 1438 staví nový hrad; hlavní město Štýrska a habsburských vnitřních Rakous.",
  },
  Cáhlov: {
    t: "Zeměpanské město",
    n: "Freistadt v Rakousích nad Enží, hraniční město na cestě z Lince do Budějovic. Na sever jde sůl a železo, z Čech ryby; od roku 1277 má právo skladu.",
  },
  Mělk: {n: "Městečko pod benediktinským klášterem na Dunaji, odkud od roku 1418 vychází přísná mělcká reforma klášterů v Rakousích a Bavorsku."},
  Straubing: {
    t: "Zeměpanské město",
    n: "Dunajské město mnichovského vévody Albrechta III. Roku 1435 tu dal vévoda Arnošt utopit v Dunaji Anežku Bernauerovou, synovu milou.",
  },
  Ingolstadt: {
    t: "Zeměpanské město",
    n: "Bývalé sídlo ingolstadtských vévodů; po vymření jejich rodu roku 1447 připadlo landshutským Wittelsbachům, dnes vévodovi Ludvíkovi Bohatému.",
  },
  Amberg: {
    t: "Zeměpanské město",
    n: "Středisko Horní Falce, bohaté na železnou rudu a obchod se železem. V letech 1452–1454 se vzepřelo falckraběti Fridrichovi, který povstání krvavě potlačil.",
  },
  Bamberk: {t: "Biskupské město", n: "Sídlo bamberského knížete-biskupa Antonína z Rotenhanu; v dómu leží císař Jindřich II. a Kunhuta."},
  Burghausen: {
    t: "Zeměpanské město",
    n: "Město na Salzachu pod nejdelším hradem Bavor, druhým sídlem landshutských vévodů, kde se ukládá jejich poklad.",
  },
  Zwickau: {t: "Zeměpanské město", n: "Bývalé říšské město, od roku 1323 v moci míšeňských markrabat, dnes saských Wettinů."},
  "Saská Kamenice": {t: "Zeměpanské město", n: "Wettinské město plátna: od roku 1357 má výsadní právo bělidla pro celé Míšeňsko."},
  Wittenberg: {
    t: "Zeměpanské město",
    n: "Někdejší sídlo askánských vévodů. Po jejich vymření roku 1422 přešel kurfiřtský titul na Wettiny, dnes na kurfiřta Fridricha II. Saského.",
  },
  Pirna: {t: "Zeměpanské město", n: "Labské město, které až do roku 1405 patřilo Českému království; pak ho získala míšeňská markrabata."},
  "Frankfurt nad Odrou": {
    t: "Hanzovní město",
    n: "Braniborské město v Hanze od roku 1430, ovládá obchod na Odře mezi Vratislaví a Štětínem; roku 1432 ho zasáhla husitská spanilá jízda.",
  },
  "Braniborsko nad Havolou": {
    t: "Biskupské město",
    n: "Starobylé dvojměstí na Havole, sídlo braniborského biskupa a dávný střed Braniborska, kterému vládne kurfiřt Fridrich II. Železný.",
  },
  Magdeburk: {
    t: "Hanzovní město",
    n: "Sídlo arcibiskupa Fridricha z Beichlingenu, ale město si vládne samo. Magdeburské městské právo užívají města od Saska po Polsko.",
  },
  Poznaň: {n: "Hlavní město Velkopolska a sídlo poznaňského biskupa, obchodní uzel na cestě z Polska do Říše. Polsko vede s Řádem válku o Prusko."},
  Kališ: {n: "Jedno z nejstarších měst Polska, střed Kališského vojvodství. Proslul statutem z roku 1264, jímž kníže Boleslav dal ochranu Židům."},
  Čenstochová: {
    n: "Město pod klášterem paulínů na Jasné Hoře s ikonou Černé Madony. Roku 1430 klášter vyloupili lupiči, mezi nimi Češi, a obraz poškodili.",
  },
  Bochnia: {t: "Královské solné doly", n: "Nejstarší solné doly Polska (od roku 1248); spolu s Věličkami tvoří královské krakovské solivary."},
  "Nowy Sącz": {t: "Královské město", n: "Královské město na cestě z Krakova do Uher, které roku 1292 založil český král Václav II."},
  Ráb: {t: "Biskupské město", n: "Sídlo rábského biskupa na soutoku Ráby s Dunajem, strážce cesty z Rakous do Budína."},
  Nitra: {t: "Biskupské město", n: "Sídlo nitranského biskupa na hradě nad řekou Nitrou, jednom z nejstarších křesťanských míst Uher."},
  Trenčín: {
    t: "Svobodné královské město",
    n: "Město pod královským hradem na Váhu, svobodné od roku 1412. Roku 1431 ho dobyli a vypálili husité; od roku 1454 má právo meče.",
  },
  Žilina: {
    n: "Považské město s privilegiem z roku 1381, které dává Slovákům v radě stejná místa jako Němcům. Husité ho roku 1431 vypálili a v letech 1433–1434 drželi.",
  },
  Visegrád: {
    t: "Královský hrad",
    n: "Hrad a palác uherských králů nad Dunajem. Odtud roku 1440 komorná Helena Kottannerová odnesla svatoštěpánskou korunu; tu nyní drží císař Fridrich III.",
  },
  Prostějov: {t: "Panské město", n: "Poddanské město na úrodné Hané, za husitských válek opora kalicha na Moravě."},
  Hlivice: {
    n: "Hornoslezské město, ve kterém za husitských válek sídlilo husitské vojsko Zikmunda Korybutoviče, dokud ho roku 1431 nevypudil nočním přepadem kníže Konrád Bílý.",
  },
  Bytom: {n: "Hlavní město Bytomska, rozděleného napůl mezi olešnického knížete Konráda IX. Černého a těšínského knížete Václava I."},
  Javor: {
    n: "Druhé hlavní město korunního knížectví svídnicko-javorského, kde vládne místo krále zemský hejtman; ten sídlí na bývalém piastovském hradě.",
  },
  Lehnice: {
    n: "Hlavní město lehnického knížectví mladého Fridricha I., za kterého vládne matka Hedvika. Po roce 1449 se tu Piastovcům vzepřeli a hledali oporu přímo u koruny.",
  },
  Břeh: {n: "Hlavní město břežského knížectví na Odře. Od roku 1450 ho má v zástavě opolský kníže Mikuláš I."},
  Hlohov: {
    n: "Město na Odře rozdělené mezi dva knížata: polovinu drží Jindřich IX. Starší ze žaháňské větve, polovinu Vladislav z těšínských Piastovců.",
  },
  Opolí: {n: "Sídlo opolského knížete Mikuláše I., který vládne celému Opolsku od roku 1439 a drží v zástavě i Břeh."},
  Nisa: {
    t: "Biskupské město",
    n: "Sídlo vratislavských biskupů a jejich knížectví. Od roku 1456 je biskupem Jošt z Rožmberka, převor johanitů, který se vůči Jiřímu drží opatrně stranou.",
  },
  Opava: {
    n: "Hlavní město rozdrobeného Opavska: dvě třetiny po roce 1454 koupil opolský kníže Bolek V. zvaný Husita, třetinu drží hlubčický kníže Jan II. z opavských Přemyslovců.",
  },
  Krnov: {n: "Sídlo krnovských Přemyslovců. Za nezletilé bratry Jana IV. a Václava III. vládne poručnice, jejich macecha Barbora."},
  Hlubčice: {n: "Sídlo hlubčického knížete Jana II. z opavských Přemyslovců, který drží i třetinu Opavska."},
  Ratiboř: {
    n: "Sídlo ratibořských Přemyslovců. Po smrti knížete Václava (1456) dědí zemi jeho nezletilý syn Jan; matka Markéta pochází z polských Šamotulských.",
  },
  Těšín: {n: "Sídlo těšínského knížete Václava I. z rodu Piastovců, který drží i část Bytomska."},
  Kozlí: {n: "Město na Odře, které spolu s Olešnicí a polovinou Bytomska drží olešnický kníže Konrád IX. Černý."},
  Olešnice: {n: "Sídlo olešnického knížete Konráda IX. Černého, který drží i Kozlí a polovinu Bytomska."},
  Žaháň: {
    n: "Sídlo žaháňského knížete Baltazara. Jeho bratr Jan (II.) se tu za Baltazarovy nepřítomnosti prohlásil správcem země; mezi bratry panuje nevraživost.",
  },
  Lubin: {n: "Město lehnicko-břežských Piastovců, od roku 1446 v zástavě u hlohovského knížete Jindřicha IX. Staršího."},
  Střelín: {n: "Město mladého knížete Fridricha I. Lehnického, za kterého vládne matka Hedvika."},
  Frankenštejn: {n: "Město, které roku 1454 získal v zástavě spolu s Kladskem Jiří z Poděbrad od syna Hynka Krušiny z Lichtenburka."},
  Střehom: {n: "Město korunního knížectví svídnicko-javorského, proslulé suknem, plátnem a pivem; dominuje mu gotická bazilika johanitů."},
  Bolkov: {
    n: "Město pod hradem knížete Bolka I. v korunním knížectví svídnicko-javorském. Husité město zničili, hrad nedobyli; dlouho v něm ležel knížecí poklad.",
  },
  "Jelení Hora": {
    n: "Město korunního knížectví svídnicko-javorského pod Krkonošemi, žije z tkalcovství a obchodu s Čechami; roku 1426 a 1427 ho poplenili husité.",
  },
  "Svatý Hypolit": {
    t: "Biskupské město",
    n: "Dolnorakouské město, které nepatří vévodovi, ale pasovskému biskupovi. Leží na cestě z Vídně do Lince.",
  },
  Tulln: {
    t: "Zeměpanské město",
    n: "Staré dunajské město nad Vídní, opěvované už v Písni o Nibelunzích. Kupecká a soudní obec, městské právo má od roku 1270.",
  },
  Korneuburg: {
    t: "Zeměpanské město",
    n: "Město na levém břehu Dunaje naproti Klosterneuburgu. Po zhoubném požáru roku 1450 je znovu postavené jako zeměpanská pevnost, která kryje Vídeň od severu.",
  },
  Hainburg: {
    t: "Pohraniční město",
    n: "Hrazené město v Uherské bráně, poslední rakouská bašta na Dunaji před Prešpurkem. Hradby s patnácti věžemi a mohutnou Vídeňskou branou.",
  },
  "Laa an der Thaya": {
    t: "Pohraniční město",
    n: "Babenberské hrazené město na Dyji při moravské hranici. Roku 1407 ho poplenil markrabě Jošt a roku 1426 husité; od roku 1454 smí vařit pivo.",
  },
  Enže: {
    t: "Zeměpanské město",
    n: "Nejstarší rakouské město s právem od roku 1212, na místě římského Lauriaca. Řeka Enže dělí Rakousy pod Enží a nad Enží, o něž se přou Fridrich III. a Albrecht VI.",
  },
  Wels: {
    t: "Zeměpanské město",
    n: "Hornorakouské trhové město na Tauně s právem od roku 1222, na místě římské Ovilavy. Leží v Rakousích nad Enží, kam si dělá nárok Albrecht VI.",
  },
  Gmunden: {t: "Solné město", n: "Město na Traunském jezeře, odkud se rozváží sůl z Hallstattu a Ischlu plavená po Tauně."},
  Leoben: {
    t: "Zeměpanské město",
    n: "Štýrské město Fridricha III. na Muře. Od roku 1314 má výsadu obchodu s železem z Vordernbergu pod Erzbergem, které jde na jihovýchod a přes Benátky do Levanty.",
  },
  Salcburk: {t: "Arcibiskupské město", n: "Sídlo arcibiskupa Zikmunda z Volkersdorfu (1452–1461), který vládne vlastní zemi mezi Bavory a Rakousy."},
  Freising: {
    t: "Biskupské město",
    n: "Sídlo freisinského biskupa Jana Tulbecka (od 1453) na vrchu nad Isarou. Malé knížecí biskupství uprostřed vévodských Horních Bavor, nedaleko Mnichova.",
  },
  Landsberg: {
    t: "Zeměpanské město",
    n: "Město mnichovských vévodů na Lechu, kudy vede Solná stezka přes most do Švábska. Na clu a soli zbohatlo; střeží hranici s augsburským biskupstvím.",
  },
  Wasserburg: {
    t: "Zeměpanské město",
    n: "Město v ohbí Innu, od roku 1447 landshutské, tedy Ludvíka IX. Bohatého. Od roku 1439 vybírá clo ze soli, která tudy jde do Mnichova; vládne mu bohatý patriciát.",
  },
  Braunau: {
    t: "Zeměpanské město",
    n: "Bavorské hrazené město na Innu s právem od roku 1260. Žije z obchodu se solí a lodní dopravy po Innu; staví se tu kostel sv. Štěpána s vysokou věží.",
  },
  Reichenhall: {
    t: "Solné město",
    n: "Prastaré solné prameny a vařírny soli pod Alpami. Reichenhallská sůl jde přes Pasov a Zlatou stezku až do Čech.",
  },
  Neuburg: {
    t: "Zeměpanské město",
    n: "Dunajské město, které s dědictvím vymřelé ingolstadtské větve připadlo roku 1447 landshutským vévodům; dnes patří Ludvíkovi IX. Bohatému.",
  },
  Donauwörth: {
    t: "Svobodné říšské město",
    n: "Říšské město na Dunaji, svobodné od roku 1308. Dělá si na ně nárok bavorský vévoda Ludvík IX. Bohatý, což ho staví proti markraběti Albrechtu Achillovi.",
  },
  Mühldorf: {t: "Arcibiskupské město", n: "Salcburský ostrůvek na Innu uprostřed bavorských zemí. Od roku 1287 patří salcburským arcibiskupům."},
  Bayreuth: {
    t: "Zeměpanské město",
    n: "Hohenzollernské město, roku 1430 vypálené husity. Jan Alchymista zde postavil zámek a roku 1457 se vzdal vlády; obě franská markrabství teď drží Albrecht Achilles.",
  },
  Hof: {
    t: "Zeměpanské město",
    n: "Město na Sále, které roku 1373 koupili od fojtů z Weidy hohenzollernští purkrabí. Roku 1430 ho zpustošili husité; bohatne na suknu z místní vlny.",
  },
  Eichstätt: {t: "Biskupské město", n: "Sídlo knížete-biskupa Jana z Eychu (1445–1464), reformátora církve a přítele humanistů, v údolí Altmühlu."},
  Weißenburg: {t: "Svobodné říšské město", n: "Malé říšské město ve Francích, svobodné od roku 1296, se zachovalými hradbami."},
  Forchheim: {t: "Biskupské město", n: "Město bamberských biskupů na Regnitz. Jejich zdejší hrad je po Bamberku jejich nejpřednějším sídlem."},
  Kronach: {
    t: "Biskupské město",
    n: "Pevné město bamberských biskupů u Franského lesa. Roku 1430 odolalo husitskému obléhání, jen kus města měšťané sami zapálili.",
  },
  Kouba: {
    t: "Pohraniční město",
    n: "Cham, pohraniční město na Řezné (Regen) u cesty z Čech přes Všerubský průsmyk, kterou dřív střežil říšský hrad. Husitské války mu daly těžce zabrat.",
  },
  Altenburg: {
    t: "Rezidenční město",
    n: "Rezidenční město s hradem kurfiřta Fridricha II. Dobrotivého. V noci 7. na 8. července 1455 odtud Kunc z Kaufungen unesl oba kurfiřtovy syny; byl dopaden a sťat ve Freiberku.",
  },
  Torgava: {t: "Zeměpanské město", n: "Wettinské město u brodu přes Labe, kde se kříží dálkové obchodní cesty."},
  Merseburk: {
    t: "Biskupské město",
    n: "Sídlo merseburského biskupa Jana z Bose (1431–1463). Wettinové se snaží biskupství podřídit a upírají mu říšskou bezprostřednost.",
  },
  Naumburk: {t: "Biskupské město", n: "Město s dómem a kapitulou naumburského biskupství na Sále. Biskupové sídlí v nedalekém Zeitzu."},
  Jena: {
    t: "Zeměpanské město",
    n: "Durynské město na Sále v zemi lantkraběte Viléma III., bratra kurfiřta. Roku 1429 si od pánů koupilo soudy i clo.",
  },
  Gotha: {t: "Zeměpanské město", n: "Jedno z pěti durynských měst, která bohatnou na barvířském boryti. Patří k Durynsku lantkraběte Viléma III."},
  Nordhausen: {t: "Svobodné říšské město", n: "Říšské město pod Harcem, svobodné od roku 1220. V letech 1430–1432 bylo krátce členem Hanzy."},
  Tangermünde: {
    t: "Rezidenční město",
    n: "Hanzovní město na Labi s falcí Karla IV. Od roku 1415 tu sídlí hohenzollernští kurfiřti; zažívá zlatý věk cihlové gotiky.",
  },
  Stendal: {
    t: "Hanzovní město",
    n: "Bohaté město Staré marky, v Hanze od roku 1358. Roku 1447 vysvětilo dvouvěžový kostel P. Marie a roku 1456 tu kurfiřt Fridrich II. založil augustiniánský klášter.",
  },
  Havelberg: {
    t: "Biskupské město",
    n: "Dóm a kapitula havelberského biskupa Konráda z Lintorfu (1427–1460); samo město ale patří markrabatům a biskupové sídlí raději ve Wittstocku.",
  },
  Wilsnack: {
    t: "Poutní místo",
    n: "Poutní místo Svaté krve: roku 1383 tu ve vypáleném kostele našli tři krvácející hostie. Jan Hus zázrak odsoudil, havelberský biskup s podporou kurfiřta pouť hájí.",
  },
  Fürstenwalde: {
    t: "Biskupské město",
    n: "Městečko na Sprévě, kam lubušští biskupové přenesli sídlo (1385). Biskupové, od roku 1455 Fridrich Sesselmann, drží s braniborskými markrabaty.",
  },
  "Landsberg an der Warthe": {
    t: "Zeměpanské město",
    n: "Město Nové marky na Wartě. Lucemburkové ji zastavili Řádu německých rytířů; roku 1454 ji vykoupil Fridrich II. Železný a právě zde přijal hold stavů.",
  },
  "Königsberg in der Neumark": {
    t: "Zeměpanské město",
    n: "Dávné hlavní město Nové marky, bohatnoucí na obilí po Odře. Roku 1433 odolalo husitům; s celou Novou markou je od let 1454–1455 opět braniborské.",
  },
  Varšava: {
    t: "Rezidenční město",
    n: "Sídlo mazovských knížat od roku 1413. Za nezletilého Konráda III. a jeho bratrů vládne kněžna Barbora s plockým biskupem Pavlem Giżyckým.",
  },
  Plock: {
    t: "Biskupské město",
    n: "Biskupské a knížecí město na Visle. Vládnou tu nezletilí mazovští Piastovci Zemovít VI. a Vladislav II. pod poručnictvím matky Anny a biskupa Pavla.",
  },
  Piotrków: {t: "Královské město", n: "Královské město, kde se už od roku 1354 schází polská šlechta k zemským sjezdům a sněmům."},
  Olkusz: {t: "Hornické město", n: "Královské město v Malopolsku, které zbohatlo na olověných a stříbrných dolech."},
  Sieradz: {t: "Královské město", n: "Hlavní město sieradzského vojvodství na Wartě, mezi Velkopolskem a Slezskem."},
  Łęczyca: {t: "Královské město", n: "Hlavní město łęczyckého vojvodství uprostřed polských zemí."},
  Włocławek: {
    t: "Biskupské město",
    n: "Sídlo kujavského biskupa na Visle, nedaleko Pomoří, kde Polsko vede Třináctiletou válku s Řádem německých rytířů.",
  },
  Wschowa: {
    t: "Královské město",
    n: "Pohraniční pevné město naproti hlohovskému Slezsku, polské od roku 1343. Prožívá zlatý věk: soukenictví, mincovna, škola a obchod s Lipskem i Rusí.",
  },
  Biecz: {
    t: "Královské město",
    n: "Jedno z největších polských měst a celní stanice na cestě do Uher, kudy jde uherské víno. Sídlo soudu magdeburského práva.",
  },
  Wieluń: {
    t: "Královské město",
    n: "Obchodní a správní středisko Wieluńské země, od roku 1395 opět polské. Ve 40. a 50. letech ho opakovaně pustoší nájezdy ze Slezska.",
  },
  Šoproň: {
    t: "Svobodné královské město",
    n: "Uherské město na rakouské hranici, které královna Alžběta roku 1441 zastavila Fridrichu III. Císař ho stále drží, stejně jako svatoštěpánskou korunu.",
  },
  Komárno: {
    t: "Královské město",
    n: "Město a hrad na soutoku Váhu s Dunajem, s výsadami od roku 1265. Roku 1440 se tu narodil král Ladislav Pohrobek.",
  },
  Vacov: {t: "Biskupské město", n: "Vác v Dunajském ohbí, jedno z nejstarších uherských biskupství. Biskup je zároveň pánem města."},
  Jáger: {t: "Biskupské město", n: "Eger, sídlo biskupa od roku 1009, s katedrálou na hradním vrchu, kolem níž vyrostlo město."},
  "Spišská Nová Ves": {
    t: "Zastavené město",
    n: "Nejpřednější ze třinácti spišských měst, která Zikmund roku 1412 zastavil Polsku. Spravuje je polský starosta ze Staré Ľubovně.",
  },
  Kežmarok: {n: "Spišské město pod Tatrami, od roku 1440 sídlo spišského hraběte. Roku 1433 ho těžce poničil husitský nájezd."},
  Rožňava: {
    t: "Hornické město",
    n: "Gemerské hornické město, které bohatne na zlatě, stříbře a železe; svobodným královským městem je od roku 1410.",
  },
  Karlštejn: {
    t: "Královský hrad",
    n: "Strážce korunovačních klenotů, které jsou tu znovu od roku 1436, i zemského archivu; za husitských válek nedobytá katolická pevnost. Purkrabím je Jindřich Berka z Dubé.",
  },
  Křivoklát: {
    t: "Královský hrad",
    n: "Královský hrad uprostřed hlubokých lesů. Ladislav Pohrobek ho vyplatil ze zástavy Aleše Holického ze Šternberka, takže je opět v rukou koruny.",
  },
  Bezděz: {
    t: "Královský hrad v zástavě",
    n: "Za husitů opora katolíků na severu, kam byly převezeny zemské desky. Zástavu drží Jindřich z Michalovic.",
  },
  Zvíkov: {
    t: "Královský hrad v rožmberské zástavě",
    n: "Hrad na soutoku Vltavy a Otavy, který husité roku 1429 marně čtyři měsíce obléhali. Drží ho Rožmberkové; Ladislav jim roku 1457 slíbil, že jim ho nevyplatí.",
  },
  Orlík: {
    t: "Hrad Zmrzlíků ze Svojšína",
    n: "Hrad nad Vltavou, od roku 1407 v rukou Zmrzlíků ze Svojšína. Roku 1457 ho zdědil Jaroslav Zmrzlík, stoupenec krále Jiřího.",
  },
  Kost: {
    t: "Hrad Zajíců z Házmburka",
    n: "Hrad v pískovcových skalách u Sobotky. Drží ho Mikuláš Zajíc z Házmburka, přísný katolík a odpůrce kalicha, kterého Zikmund jmenoval nejvyšším sudím.",
  },
  Trosky: {
    t: "Hrad Zajíců z Házmburka",
    n: "Dvě věže na sopečných vrcholech, za husitských válek katolická bašta. Roku 1455 ho koupil Jan Zajíc z Házmburka a připojil ke Kosti.",
  },
  Lipnice: {
    t: "Hrad Trčků z Lípy",
    n: "Mohutný hrad nad Sázavou, který roku 1436 koupil husitský hejtman Mikuláš Trčka z Lípy. Jeho rod stojí při králi Jiřím.",
  },
  Rabí: {
    t: "Hrad Švihovských z Rýzmberka",
    n: "Rozlehlý hrad nad Otavou. Žižka ho dobyl dvakrát a při druhém obléhání roku 1421 přišel o zbývající oko. Od roku 1450 ho drží Vilém Švihovský z Rýzmberka.",
  },
  Kašperk: {
    t: "Královský hrad v zástavě",
    n: "Strážní hrad Karla IV. nad Vintířovou stezkou z Pasova, dějiště pohraničních půtek s Bavory. Roku 1454 ho Petr Zmrzlík prodal Zdeňku ze Šternberka.",
  },
  Točník: {
    t: "Královský hrad v zástavě",
    n: "Honosný hrad Václava IV. nad Žebrákem, roku 1424 marně obléhaný husity. Zástavu drží Kolovratové, kteří roku 1430 přešli pod obojí.",
  },
  "Kunětická hora": {
    t: "Husitský hrad",
    n: "Hrad na osamělém kopci u Pardubic, který přestavěl husitský hejtman Diviš Bořek z Miletínka. Drží ho jeho syn Soběslav Mrzák z Miletínka.",
  },
  Lichnice: {
    t: "Královský hrad",
    n: "Hrad na hraně Železných hor, za husitů v rukou sirotků. Drží ho husitský hejtman Jan Hertvík z Rušinova, od něhož ho král Jiří roku 1458 vykupuje.",
  },
  Střekov: {
    t: "Panský hrad nad Labem",
    n: "Skalní hrad nad Labem u Ústí, za husitů na straně krále Zikmunda; v době bitvy u Ústí (1426) v něm byla míšeňská posádka. Drží ho potomci Jetřicha z Kladna.",
  },
  Homole: {
    t: "Hrad Poděbradů",
    n: "Pohraniční hrad v Kladsku u Dušník. Roku 1427 ho dobyli táborité, potom sloužil loupeživým pánům; roku 1458 ho král Jiří převedl na syny Bočka a Viktorína.",
  },
  Helfštýn: {t: "Panský hrad", n: "Rozlehlý hrad nad Bečvou u Lipníka. Drží ho Vok ze Sovince."},
  Bouzov: {
    t: "Hrad Kostků z Postupic",
    n: "Hrad na pomezí Hané, který Jiří z Poděbrad před rokem 1442 předal svému věrnému Zdeňku Kostkovi z Postupic.",
  },
  Buchlov: {
    t: "Zeměpanský hrad v zástavě",
    n: "Zeměpanský hrad v Chřibech nad Pomoravím, opakovaně zastavovaný; roku 1437 ho v zástavě získal Čeněk z Mošnova.",
  },
  Brumov: {t: "Pohraniční hrad", n: "Strážce cesty do Uher na Vlárce. Zástavu drží Cimburkové; Bernard z Cimburka z něj podnikal výpravy do Uher."},
  Veveří: {
    t: "Zeměpanský hrad",
    n: "Hrad nad Svratkou u Brna, za husitů opora Zikmundovy strany s rakouskou posádkou. Král Jiří ho roku 1458 svěřuje Přemkovi, knížeti těšínskému.",
  },
  Książ: {
    t: "Hrad svídnického knížectví",
    n: "Hlavní hrad korunního knížectví svídnického, v letech 1428–1429 obsazený husity. Jiří z Poděbrad ho získal od dědiců Janka z Chotěmic a správu svěřil Birkovi z Násile.",
  },
  Chojnik: {
    t: "Rytířský hrad",
    n: "Hrad na skále nad Jelení Horou pod Krkonošemi. Koupil ho rytíř Gotsche Schoff od vdovy po vévodovi Bolkovi II. a drží ho jeho rod.",
  },
  Ojvín: {
    t: "Hrad a klášter celestinů",
    n: "Skalní hrad u Žitavy, kde Karel IV. roku 1369 založil klášter celestinů; na stavbě kostela se podílel Petr Parléř.",
  },
  Senftenberg: {
    t: "Hrad v saských rukou",
    n: "Dolnolužický hrad a panství, které roku 1448 získal saský kurfiřt Fridrich; tím se odtrhlo od české Lužice.",
  },
  Königstein: {
    t: "Pohraniční hrad (sporný)",
    n: "Skalní pevnost nad Labem, kterou míšeňští markrabí roku 1408 vzali Donínům. Formálně je česká; Sasku ji definitivně přizná až mír v Chebu (1459).",
  },
  Hohnstein: {
    t: "Hrad saských kurfiřtů (české léno)",
    n: "Skalní hrad v Saském Švýcarsku, do roku 1443 v rukou Berků z Dubé. Pak ho směnou a koupí získalo Sasko, hrad však zůstal českým lénem.",
  },
  Coburg: {t: "Hrad Wettinů", n: "Mohutná pevnost nad Coburgem, wettinská od roku 1353. Kvůli husitským válkám tu roku 1430 rozšířili opevnění."},
  Cadolzburg: {
    t: "Hrad frankských Hohenzollernů",
    n: "Sídlo markraběte Albrechta Achilla, bratra braniborského kurfiřta. V letech 1449–1450 vedl válku s Norimberkem, od roku 1457 vládne oběma frankským markrabstvím.",
  },
  Kufstein: {
    t: "Pohraniční pevnost",
    n: "Bavorská pevnost nad Innem na hranici s Tyrolskem. Po vymření ingolstadtské větve připadla bohatým vévodům landshutským; roku 1415 ji silně opevnil Ludvík Bradatý.",
  },
  Vitoraz: {t: "Pohraniční hrad", n: "Zeměpanské panství na české hranici, často zastavované mocným rodům; roku 1426 ho obléhali husité."},
  Falkenstein: {t: "Zeměpanský hrad", n: "Hrad ve Weinviertelu blízko moravské hranice, od roku 1106 v rukou rakouských panovníků."},
  Devín: {t: "Pohraniční hrad", n: "Skála nad soutokem Moravy a Dunaje, brána do Uher. Od roku 1414 ho drží mocný rod Garaiů."},
  "Spišský hrad": {t: "Hrad uherské koruny", n: "Rozlehlý královský hrad nad Spiší; s jeho areálem se pojí opevněné sídlo Jana Jiskry z Brandýsa."},
  "Šarišský hrad": {t: "Hrad uherské koruny (v moci Jiskry)", n: "Hrad nad Prešovem, který roku 1441 obsadil Jan Jiskra z Brandýsa a stále ho drží."},
  Ľubovňa: {
    t: "Hrad zastavený Polsku",
    n: "Hrad na severu Spiše, roku 1412 zastavený Polsku spolu se šestnácti spišskými městy; spravují ho polští hejtmani.",
  },
  Beckov: {
    t: "Hrad Bánffyů",
    n: "Skalní hrad nad Váhem, který kdysi král prodal Ctiborovi ze Ctiboric. Po vymření jeho rodu (1434) připadl Bánffyům.",
  },
  Čachtice: {t: "Hrad Országhů", n: "Hrad na Považí, který roku 1436 Zikmund daroval svému stoupenci Michalu Országhovi; drží ho jeho rod."},
  Strečno: {t: "Hrad Pongráců", n: "Hrad nad soutěskou Váhu u Žiliny, od roku 1444 v rukou Pongráců z Liptovského Mikuláše."},
  Bojnice: {t: "Panský hrad", n: "Hrad na horní Nitře, od roku 1430 sídlo potomků Onufria Bardy, kteří ho uhájili proti husitům."},
  Likava: {t: "Hrad Hunyadiů", n: "Hrad v Liptově, v letech 1431–1434 husitská pevnost. Od roku 1434 patří Hunyadiům, rodu krále Matyáše."},
  Olsztyn: {
    t: "Královský hrad",
    n: "Pohraniční hrad u Čenstochové, který chrání Polsko proti Slezsku a Čechám. Starostenství drží potomci Jana ze Szczekocin, od roku 1432 Piotr Woda.",
  },
  Będzin: {t: "Královský hrad", n: "Kamenný hrad Kazimíra Velikého, vojenská hláska na jihozápadní hranici Polska proti Slezsku."},
  Czorsztyn: {t: "Královský hrad", n: "Strážce polsko-uherské hranice nad Dunajcem, naproti uherské Nedeci; spravují ho královští starostové."},
  Ziesar: {t: "Biskupský hrad", n: "Sídlo braniborských biskupů a správní středisko biskupství už od roku 1327."},
};
const MAJOR_ROADS = new Set([
  "Zlatá stezka",
  "Vysoká cesta",
  "Norimberská stezka",
  "Řezenská stezka",
  "Chebská stezka",
  "Srbská stezka",
  "Chlumecká stezka",
  "Lužická stezka",
  "Žitavská stezka",
  "Kladská stezka",
  "Trstenická stezka",
  "Haberská stezka",
  "Vitorazská stezka",
  "Linecká stezka",
  "Cesta Moravskou branou",
  "Uherská stezka",
  "Podunajská cesta",
  "Dunajská cesta",
  "Říšská cesta",
  "Jantarová stezka",
  "Odranská cesta",
  "Poznaňská cesta",
  "Jablunkovská cesta",
  "Považská cesta",
  "Cesta k horním městům",
]);
const MAJOR_PLACES = new Set([
  "Praha",
  "Vratislav",
  "Vídeň",
  "Krakov",
  "Budín",
  "Brno",
  "Olomouc",
  "Plzeň",
  "Kutná Hora",
  "Norimberk",
  "Řezno",
  "Lipsko",
  "Drážďany",
  "Berlín-Cölln",
  "Pasov",
  "Linec",
  "Poznaň",
  "Zhořelec",
  "Budyšín",
  "Opava",
  "Svídnice",
  "Lehnice",
  "Nisa",
  "Tábor",
  "České Budějovice",
  "Cheb",
  "Hradec Králové",
  "Prešpurk",
  "Magdeburk",
  "Erfurt",
  "Mnichov",
  "Košice",
]);
/* význam místa na mapě (2026-10-24, Vojta): 0 metropole, 1 hlavní město (MAJOR_PLACES), 2 ostatní město, 3 hrad a sídlo rodu.
   Podle toho velikost značky (MTZ, násobek měřítka) a od jakého přiblížení se ukáže jméno (mistoPopisek: s = šířka výřezu / 680) */
const METRO = new Set(["Praha", "Vídeň", "Vratislav", "Krakov", "Budín", "Norimberk"]);
const mistoTier = (n, mesto) => (METRO.has(n) ? 0 : MAJOR_PLACES.has(n) ? 1 : mesto ? 2 : 3);
const MTZ = [21, 17, 14, 12];
const mistoPopisek = (tier, s) => tier <= 1 || (tier === 2 && s < 0.9) || s < 0.62;
/* kraje Čech v 15. století a landfrídy kolem roku 1450 (2026-10-24, Vojta): kraj = oblast kolem svého středu (lo, la) ořezaná hranicí
   Čech (kresba v 02b, krajeBunky) – hranice jsou schematické. Landfrídy vznikly po smrti krále Albrechta (1439–1440); od roku 1452
   je Jiří jako zemský správce sjednocoval. lf: id landfrídu (LANDFR), bez něj kraj vlastní landfríd neměl nebo není doložen. */
const KRAJE = [
  {n: "Litoměřický", lo: 14.3, la: 50.62},
  {n: "Žatecký", lo: 13.55, la: 50.35, lf: "zat"},
  {n: "Loketsko", lo: 12.8, la: 50.25},
  {n: "Chebsko", lo: 12.4, la: 50.07},
  {n: "Slánský", lo: 14.15, la: 50.28},
  {n: "Rakovnický", lo: 13.7, la: 50.05},
  {n: "Plzeňský", lo: 13.2, la: 49.7, lf: "plz"},
  {n: "Podbrdský", lo: 14.05, la: 49.85},
  {n: "Prácheňský", lo: 13.9, la: 49.15, lf: "pra"},
  {n: "Bechyňský", lo: 14.6, la: 49.1},
  {n: "Vltavský", lo: 14.8, la: 49.62},
  {n: "Kouřimský", lo: 14.95, la: 50.0, lf: "vych"},
  {n: "Čáslavský", lo: 15.45, la: 49.68, lf: "vych"},
  {n: "Chrudimský", lo: 16.05, la: 49.85, lf: "vych"},
  {n: "Hradecký", lo: 15.9, la: 50.4, lf: "vych"},
  {n: "Boleslavský", lo: 14.95, la: 50.6, lf: "bol"},
];
const LANDFR = {
  vych: {
    n: "Východočeské landfrídy",
    c: "kal",
    lab: [15.62, 49.55],
    t: "Spojené landfrídy kouřimský, čáslavský, hradecký a chrudimský – kališnické. Do své smrti (1444) je vedl Hynek Ptáček z Pirkštejna, po něm Jiří z Poděbrad, jehož roku 1448 zvolily správcem.",
  },
  bol: {n: "Boleslavský landfríd", c: "mix", t: "Jedním z hejtmanů byl Jiří z Poděbrad; v kraji se drželi páni obojí víry."},
  zat: {n: "Žatecký landfríd", c: "kal", t: "Kališnická města Žatec a Louny s okolní šlechtou."},
  plz: {
    n: "Plzeňský landfríd",
    c: "kat",
    t: "Katolický: Plzeň, Švamberkové, Kolovratové, Rýzmberkové a nižší šlechta – nejstarší z landfrídů (od roku 1420).",
  },
  pra: {
    n: "Prácheňský landfríd",
    c: "kat",
    lab: [13.78, 49.38],
    t: "Katolický, v dosahu Rožmberků; roku 1449 se katolíci jihu spojili ve Strakonicích proti Jiřímu.",
  },
};
const DIO = [
  {
    id: "dpr",
    c: "dpr",
    dom: 1,
    name: "Arcidiecéze pražská",
    seat: [14.42, 50.09],
    note: "Čechy a Kladsko. Arcibiskupský stolec je prázdný; kališníci uznávají zvoleného Jana Rokycanu, katolíky spravuje svatovítská kapitula.",
  },
  {
    id: "dol",
    c: "dol",
    dom: 1,
    name: "Diecéze olomoucká",
    seat: [17.25, 49.59],
    note: "Morava a Opavsko. Spadá pod Prahu; zvolený biskup Tas z Boskovic.",
  },
  {
    id: "dvr",
    c: "dvr",
    dom: 1,
    name: "Diecéze vratislavská",
    seat: [17.03, 51.11],
    note: "Většina Slezska. Spadá pod polské Hnězdno, nikoli pod Prahu; biskup Jošt II. z Rožmberka.",
  },
  {
    id: "dmi",
    c: "dmi",
    dom: 1,
    name: "Diecéze míšeňská",
    seat: [13.47, 51.16],
    note: "Obě Lužice a saské Míšeňsko. Podléhá přímo papeži; biskup Kašpar ze Schönbergu.",
  },
  {
    id: "dre",
    c: "dre",
    dom: 1,
    name: "Diecéze řezenská",
    seat: [12.1, 49.02],
    note: "Horní Falc, část Dolního Bavorska a české Chebsko. Spadá pod Salcburk; biskup Ruprecht Falcký.",
  },
  {
    id: "dkr",
    c: "dkr",
    dom: 1,
    name: "Diecéze krakovská",
    seat: [19.94, 50.06],
    note: "Malopolsko a východní okraj Horního Slezska (Bytomsko, Pštinsko). Biskup Tomasz Strzępiński.",
  },
  {
    id: "dpa",
    c: "dpa",
    name: "Diecéze pasovská",
    seat: [13.46, 48.57],
    note: "Rakousy nad i pod Enží až k Litavě a východ Dolního Bavorska. Vídeň vlastního biskupa nemá a podléhá Pasovu. Spadá pod Salcburk; biskup Oldřich z Nussdorfu.",
  },
  {
    id: "dsa",
    c: "dx3",
    a: "start",
    name: "Arcidiecéze salcburská",
    seat: [13.05, 47.8],
    note: "Salcbursko, jihovýchod Bavorska a alpské země. Metropole pro Pasov, Řezno a Freising.",
  },
  {id: "dfs", c: "dx1", name: "Diecéze freisinská", seat: [11.75, 48.4], note: "Horní Bavorsko s Mnichovem."},
  {
    id: "dba",
    c: "dol",
    name: "Diecéze bamberská",
    seat: [10.98, 49.89],
    note: "Franky včetně hohenzollernského Kulmbachu a Plassenburgu. Podléhá přímo papeži.",
  },
  {
    id: "dmz",
    c: "dkr",
    name: "Arcidiecéze mohučská",
    seat: [11.03, 50.98],
    note: "Západní Durynsko s Erfurtem; sídlo arcibiskupa leží daleko na Rýně. Mohučský arcibiskup je kurfiřt a arcikancléř Říše.",
  },
  {
    id: "dna",
    c: "dvr",
    name: "Diecéze naumburská",
    seat: [11.81, 51.15],
    note: "Východní Durynsko a Fojtsko: Plavno, Gera a Greiz. Spadá pod Magdeburk.",
  },
  {id: "dmr", c: "dpr", name: "Diecéze merseburská", seat: [11.99, 51.36], note: "Lipsko a okolí. Spadá pod Magdeburk."},
  {
    id: "dmg",
    c: "dx2",
    name: "Arcidiecéze magdeburská",
    seat: [11.63, 52.13],
    note: "Magdebursko a Halle. Metropole pro Naumburk, Merseburk a Braniborsko.",
  },
  {id: "dbb", c: "dx1", name: "Diecéze braniborská", seat: [12.55, 52.41], note: "Jádro Braniborska s Berlínem a Cöllnem. Spadá pod Magdeburk."},
  {
    id: "dle",
    c: "dpr",
    name: "Diecéze lubušská",
    seat: [14.07, 52.36],
    note: "Poodří kolem Frankfurtu; braniborská diecéze, která však spadá pod polské Hnězdno.",
  },
  {id: "dpo", c: "dol", name: "Diecéze poznaňská", seat: [16.93, 52.41], note: "Západní Velkopolsko. Spadá pod Hnězdno."},
  {
    id: "dgn",
    c: "dx1",
    name: "Arcidiecéze hnězdenská",
    seat: [17.6, 52.53],
    note: "Střední Polsko. Primas Polska a metropole i pro Vratislav a Krakov; arcibiskup Jan Sprowski.",
  },
  {
    id: "des",
    c: "dvr",
    name: "Arcidiecéze ostřihomská",
    seat: [18.74, 47.79],
    note: "Primas Uher; západní a střední Slovensko a okolí Ostřihomi. Arcibiskup Dionýz Széchy, který má korunovat uherské krále.",
  },
  {
    id: "dnt",
    c: "dmi",
    name: "Diecéze nitranská",
    seat: [18.08, 48.31],
    note: "Severozápad Uher: Nitransko, Trenčansko a Pováží. Sousedí s Moravou.",
  },
  {id: "drb", c: "dre", name: "Diecéze rábská", seat: [17.63, 47.69], note: "Západ Uher jižně od Dunaje až k Litavě."},
  {id: "deg", c: "dpr", name: "Diecéze jágerská", seat: [20.22, 47.95], note: "Severovýchod Uher a východní Slovensko."},
];
const DIO_ORDER = [
  "dsa",
  "dfs",
  "dba",
  "dmz",
  "dmg",
  "dbb",
  "dle",
  "dpo",
  "dgn",
  "dna",
  "dmr",
  "dpa",
  "drb",
  "deg",
  "des",
  "dnt",
  "dre",
  "dkr",
  "dvr",
  "dmi",
  "dol",
  "dpr",
];
const DUCHY = [
  {
    id: "kcz",
    name: "Království české",
    s: "Čechy",
    h: "pod",
    dom: 1,
    note: "Jádro Koruny. Den před začátkem tažení, 2. března 1458, zvolili stavové na Staroměstské radnici králem Jiřího z Poděbrad.",
    c: "dpr",
    lab: [14.236, 49.815],
    w: 278.0,
  },
  {
    id: "cheb",
    name: "Chebsko",
    s: "Chebsko",
    h: null,
    dom: 1,
    note: "Říšská zástava v držení české koruny od roku 1322. Město Cheb si úzkostlivě střeží vlastní práva a s českými stavy jedná jako rovný s rovným.",
    c: "dol",
    lab: [12.44, 50.096],
    w: 44.0,
  },
  {
    id: "kla",
    name: "Hrabství kladské",
    s: "Kladsko",
    h: "pod",
    dom: 1,
    note: "Hrabství patří k českému království. Drží je Jiří z Poděbrad.",
    c: "dol",
    lab: [16.611, 50.429],
    w: 59.4,
  },
  {
    id: "mor",
    name: "Markrabství moravské",
    s: "Morava",
    h: null,
    dom: 1,
    note: "Markrabětem je český král. Země má vlastní sněm a zemského hejtmana a nového krále uznává opatrněji než Čechy.",
    c: "dvr",
    lab: [17.163, 49.376],
    w: 180.0,
  },
  {
    id: "hlu",
    name: "Markrabství Horní Lužice",
    s: "Horní Lužice",
    h: null,
    dom: 1,
    note: "Země Šestiměstí a mocné šlechty. Úřad zemského fojta je uprázdněn a města spravují věci sama.",
    c: "dol",
    lab: [14.76, 51.218],
    w: 84.0,
  },
  {
    id: "dlu",
    name: "Markrabství Dolní Lužice",
    s: "Dolní Lužice",
    h: "bra",
    dom: 1,
    note: "Od roku 1448 v zástavě braniborského kurfiřta Fridricha II., ačkoli ji česká koruna stále považuje za svou.",
    c: "dpr",
    lab: [14.174, 51.82],
    w: 99.7,
  },
  {
    id: "vrs",
    name: "Knížectví vratislavské",
    s: "Vratislavsko",
    h: "vra",
    dom: 1,
    note: "Korunní knížectví, jehož pánem je přímo český král. Ve skutečnosti vládne městská rada Vratislavi.",
    c: "dpr",
    lab: [16.804, 51.063],
    w: 49.9,
  },
  {
    id: "svj",
    name: "Knížectví svídnicko-javorské",
    s: "Svídnicko-javorsko",
    h: "svi",
    dom: 1,
    note: "Korunní knížectví, spravované královským hejtmanem.",
    c: "dvr",
    lab: [16.266, 50.877],
    w: 91.6,
  },
  {
    id: "mns",
    name: "Knížectví minsterberské",
    s: "Minsterbersko",
    h: "pod",
    dom: 1,
    note: "Malé knížectví pod Rychlebskými horami, které získal Jiří z Poděbrad.",
    c: "dpr",
    lab: [16.966, 50.625],
    w: 26.9,
  },
  {
    id: "lgn",
    name: "Knížectví lehnické",
    s: "Lehnicko",
    h: "leg",
    dom: 1,
    note: "Dědictví lehnicko-břežských Piastovců; o Lehnici se vedou spory mezi knížaty, městem a korunou.",
    c: "dol",
    lab: [15.966, 51.246],
    w: 57.8,
  },
  {
    id: "brz",
    name: "Knížectví břežské",
    s: "Břežsko",
    h: "leg",
    dom: 1,
    note: "Břeh, Olava a Strzelín v rukou lehnicko-břežských Piastovců.",
    c: "dol",
    lab: [17.302, 50.936],
    w: 48.4,
  },
  {
    id: "ole",
    name: "Knížectví olešnické",
    s: "Olešnicko",
    h: "ole",
    dom: 1,
    note: "Knížectví olešnických Piastovců, k němuž patří Trebnice a Volov.",
    c: "dvr",
    lab: [17.266, 51.416],
    w: 75.9,
  },
  {
    id: "hlg",
    name: "Knížectví hlohovské",
    s: "Hlohovsko",
    h: "hlo",
    dom: 1,
    note: "Rozdělené dědictví hlohovsko-žaháňských Piastovců na dolní Odře.",
    c: "dmi",
    lab: [15.652, 52.027],
    w: 120.5,
  },
  {
    id: "zag",
    name: "Knížectví zaháňské",
    s: "Zaháňsko",
    h: "hlo",
    dom: 1,
    note: "Zaháň a Převoz, sídlo zaháňské větve Piastovců.",
    c: "dvr",
    lab: [15.303, 51.8],
    w: 28.9,
  },
  {
    id: "nis",
    name: "Niské knížectví",
    s: "Nisko",
    h: "bvr",
    dom: 1,
    note: "Světské panství vratislavských biskupů: Nisa, Otmuchov a Frývaldov.",
    c: "dmi",
    lab: [17.235, 50.274],
    w: 57.4,
  },
  {
    id: "opl",
    name: "Knížectví opolské",
    s: "Opolsko",
    h: "opo",
    dom: 1,
    note: "Hornoslezské knížectví opolských Piastovců.",
    c: "dvr",
    lab: [18.416, 50.644],
    w: 87.4,
  },
  {
    id: "koz",
    name: "Kozelsko a Bytomsko",
    s: "Kozelsko-Bytomsko",
    h: "ole",
    dom: 1,
    note: "Kozlí drží olešničtí Piastovci, Bytomsko si dělí s těšínskými.",
    c: "dpr",
    lab: [18.911, 50.331],
    w: 48.4,
  },
  {
    id: "rat",
    name: "Knížectví ratibořské",
    s: "Ratibořsko",
    h: "opa",
    dom: 1,
    note: "Ratibořská větev opavských Přemyslovců.",
    c: "dol",
    lab: [18.493, 50.074],
    w: 36.9,
  },
  {
    id: "opv",
    name: "Knížectví opavské",
    s: "Opavsko",
    h: "opa",
    dom: 1,
    note: "Rozdrobené dědictví opavských Přemyslovců. Opavsko se hlásí k Moravě i ke Slezsku.",
    c: "dmi",
    lab: [18.007, 49.984],
    w: 51.1,
  },
  {
    id: "krn",
    name: "Knížectví krnovské",
    s: "Krnovsko",
    h: "opa",
    dom: 1,
    note: "Krnov a Bruntálsko v rukou opavských Přemyslovců.",
    c: "dpr",
    lab: [17.555, 50.061],
    w: 45.9,
  },
  {
    id: "tsn",
    name: "Knížectví těšínské",
    s: "Těšínsko",
    h: "tes",
    dom: 1,
    note: "Knížectví těšínských Piastovců mezi Ostravicí a Bělou, s Pštinou.",
    c: "dre",
    lab: [18.656, 49.711],
    w: 66.4,
  },
  {
    id: "osz",
    name: "Osvětimsko a Zátorsko",
    s: "Osvětim a Zátor",
    h: "zat",
    dom: 0,
    note: "Osvětimsko prodal jeho kníže roku 1457 polské koruně; Zátor drží zátorští Piastovci.",
    c: "dol",
    lab: [19.425, 49.835],
    w: 75.1,
  },
  {
    id: "mpl",
    name: "Malopolsko",
    s: "Malopolsko",
    h: "jag",
    dom: 0,
    note: "Krakovská a sandoměřská země, srdce jagellonského království.",
    c: "dmi",
    lab: [20.08, 50.391],
    w: 151.5,
  },
  {
    id: "vlp",
    name: "Velkopolsko",
    s: "Velkopolsko",
    h: "jag",
    dom: 0,
    note: "Poznaňská a kališská země na západě Polska.",
    c: "dpr",
    lab: [17.017, 52.307],
    w: 208.1,
  },
  {
    id: "sie",
    name: "Sieradzko a Lenčicko",
    s: "Sieradzko",
    h: "jag",
    dom: 0,
    note: "Země mezi Velkopolskem a Malopolskem.",
    c: "dre",
    lab: [19.125, 51.563],
    w: 165.4,
  },
  {
    id: "kuj",
    name: "Kujavsko",
    s: "Kujavsko",
    h: "jag",
    dom: 0,
    note: "Kujavská a dobřiňská země na dolní Visle.",
    c: "dol",
    lab: [18.826, 52.687],
    w: 82.3,
  },
  {
    id: "maz",
    name: "Mazovské vévodství",
    s: "Mazovsko",
    h: null,
    dom: 0,
    note: "Vévodství mazovských Piastovců, lenníků polské koruny.",
    c: "dpr",
    lab: [20.082, 52.461],
    w: 119.4,
  },
  {
    id: "nmk",
    name: "Nová marka",
    s: "Nová marka",
    h: "bra",
    dom: 0,
    note: "Země za Odrou, kterou braniborský kurfiřt Fridrich II. vykoupil roku 1455 od Řádu německých rytířů.",
    c: "dol",
    lab: [16.122, 52.932],
    w: 26.1,
  },
  {
    id: "hun",
    name: "Království uherské",
    s: "Uhry",
    h: "hun",
    dom: 0,
    note: "Na trůn byl v lednu zvolen mladý Matyáš Hunyadi. Severní stolice drží Jan Jiskra z Brandýsa a jeho bratříci.",
    c: "dpr",
    lab: [18.982, 48.098],
    w: 291.5,
  },
  {
    id: "brb",
    name: "Markrabství braniborské",
    s: "Braniborsko",
    h: "bra",
    dom: 0,
    note: "Kurfiřtství Hohenzollernů s Berlínem a Cöllnem.",
    c: "dvr",
    lab: [13.124, 52.468],
    w: 134.4,
  },
  {
    id: "sxw",
    name: "Saské vévodství (Vitenbersko)",
    s: "Vitenbersko",
    h: "wet",
    dom: 0,
    note: "Kurfiřtská země, k níž se váže hodnost saského kurfiřta.",
    c: "dmi",
    lab: [12.698, 51.818],
    w: 70.1,
  },
  {
    id: "mis",
    name: "Markrabství míšeňské",
    s: "Míšeňsko",
    h: "wet",
    dom: 0,
    note: "Jádro wettinské moci; vládne kurfiřt Fridrich II. Dobrotivý.",
    c: "dvr",
    lab: [13.011, 51.045],
    w: 144.4,
  },
  {
    id: "thu",
    name: "Lantkrabství durynské",
    s: "Durynsko",
    h: "wet",
    dom: 0,
    note: "Vládne Vilém III., bratr saského kurfiřta.",
    c: "dpr",
    lab: [11.191, 51.005],
    w: 93.6,
  },
  {
    id: "vog",
    name: "Fojtsko",
    s: "Fojtsko",
    h: "reu",
    dom: 0,
    note: "Panství fojtů z Plavna, Gery a Greizu pod saskou vrchností.",
    c: "dmi",
    lab: [12.016, 50.613],
    w: 84.6,
  },
  {
    id: "mag",
    name: "Arcibiskupství magdeburské",
    s: "Magdebursko",
    h: null,
    dom: 0,
    note: "Světské panství magdeburských arcibiskupů s Halle.",
    c: "dol",
    lab: [11.093, 52.102],
    w: 54.1,
  },
  {
    id: "anh",
    name: "Knížectví anhaltská",
    s: "Anhaltsko",
    h: null,
    dom: 0,
    note: "Drobná knížectví askánských knížat.",
    c: "dre",
    lab: [12.186, 51.788],
    w: 67.8,
  },
  {
    id: "kul",
    name: "Kulmbašsko (purkrabství norimberské)",
    s: "Kulmbašsko",
    h: "fra",
    dom: 0,
    note: "Franské državy Hohenzollernů nad Mohanem, s Plassenburgem.",
    c: "dpr",
    lab: [11.834, 50.115],
    w: 74.9,
  },
  {
    id: "bam",
    name: "Biskupství bamberské",
    s: "Bambersko",
    h: null,
    dom: 0,
    note: "Světské panství bamberských biskupů.",
    c: "dol",
    lab: [10.922, 50.147],
    w: 74.2,
  },
  {
    id: "nur",
    name: "Norimberk",
    s: "Norimberk",
    h: "rmi",
    dom: 0,
    note: "Svobodné říšské město a jeho venkovské državy.",
    c: "dvr",
    lab: [10.935, 49.285],
    w: 63.2,
  },
  {
    id: "bla",
    name: "Bavorsko-Landshut",
    s: "Bavorsko-Landshut",
    h: "wit",
    dom: 0,
    note: "Nejbohatší z bavorských vévodství; vládne Ludvík IX. Bohatý.",
    c: "dol",
    lab: [12.553, 48.325],
    w: 187.8,
  },
  {
    id: "bmu",
    name: "Bavorsko-Mnichov",
    s: "Bavorsko-Mnichov",
    h: "wit",
    dom: 0,
    note: "Vévodství Albrechta III. s Mnichovem a Straubingem.",
    c: "dpr",
    lab: [11.25, 48.131],
    w: 139.9,
  },
  {
    id: "hfa",
    name: "Horní Falc",
    s: "Horní Falc",
    h: "wit",
    dom: 0,
    note: "Země falckých Wittelsbachů na české hranici, s Amberkem.",
    c: "dre",
    lab: [11.953, 49.435],
    w: 116.4,
  },
  {
    id: "pss",
    name: "Biskupství pasovské",
    s: "Pasovsko",
    h: "pas",
    dom: 0,
    note: "Světské panství pasovských biskupů na soutoku Dunaje a Innu.",
    c: "dvr",
    lab: [13.51, 48.695],
    w: 57.3,
  },
  {
    id: "rpe",
    name: "Rakousy pod Enží",
    s: "Rakousy pod Enží",
    h: "hab",
    dom: 0,
    note: "Po smrti Ladislava Pohrobka se o dědictví přou císař Fridrich III. a jeho bratr Albrecht VI.; stavové jednají ve Vídni.",
    c: "dol",
    lab: [16.139, 48.292],
    w: 170.5,
  },
  {
    id: "rne",
    name: "Rakousy nad Enží",
    s: "Rakousy nad Enží",
    h: "hab",
    dom: 0,
    note: "Země s Lincem, o niž se rovněž vede habsburský spor.",
    c: "dmi",
    lab: [14.109, 48.073],
    w: 115.0,
  },
  {
    id: "sty",
    name: "Vévodství štýrské",
    s: "Štýrsko",
    h: "hab",
    dom: 0,
    note: "Dědičná země císaře Fridricha III.",
    c: "dvr",
    lab: [15.2, 47.427],
    w: 116.8,
  },
  {
    id: "slz",
    name: "Arcibiskupství salcburské",
    s: "Salcbursko",
    h: null,
    dom: 0,
    note: "Světské panství salcburských arcibiskupů, metropolitů Pasova a Řezna.",
    c: "dpr",
    lab: [13.431, 47.311],
    w: 110.3,
  },
  {
    id: "tyr",
    name: "Hrabství tyrolské",
    s: "Tyrolsko",
    h: "hab",
    dom: 0,
    note: "Vládne Zikmund Habsburský z tyrolské linie.",
    c: "dvr",
    lab: [11.79, 47.29],
    w: 81.9,
  },
];
const DOMAIN = [
  {id: "mes", c: "city", lab: [13.67, 50.389], w: 35.0},
  {id: "pod", c: "0:0", lab: [16.49, 50.363], w: 97.0},
  {id: "ste", c: "180:2", lab: [14.516, 49.782], w: 50.9},
  {id: "opa", c: "9:1", lab: [17.894, 50.012], w: 75.7},
  {id: "hlo", c: "36:1", lab: [15.915, 51.65], w: 62.3},
  {id: "bib", c: "225:0", lab: [14.978, 51.605], w: 39.0},
  {id: "leg", c: "189:0", lab: [16.219, 51.288], w: 39.3},
  {id: "svi", c: "66:1", lab: [16.423, 50.865], w: 61.6},
  {id: "opo", c: "99:1", lab: [17.989, 50.644], w: 58.1},
  {id: "roz", c: "126:1", lab: [14.252, 48.753], w: 72.2},
  {id: "bis", c: "270:1", lab: [18.178, 49.6], w: 46.4},
  {id: "sva", c: "27:0", lab: [12.819, 49.77], w: 62.5},
  {id: "hra", c: "351:1", lab: [15.112, 49.238], w: 48.0},
  {id: "bra", c: "306:2", lab: [14.353, 51.703], w: 55.0},
  {id: "tes", c: "141:2", lab: [18.719, 49.77], w: 54.1},
  {id: "ole", c: "324:1", lab: [17.488, 51.239], w: 50.9},
  {id: "rzm", c: "18:2", lab: [13.947, 49.602], w: 49.0},
  {id: "bvr", c: "279:2", lab: [17.326, 50.426], w: 46.9},
  {id: "cim", c: "84:0", lab: [17.081, 49.028], w: 36.3},
  {id: "sli", c: "297:1", lab: [12.794, 50.199], w: 47.1},
  {id: "var", c: "342:0", lab: [14.922, 50.641], w: 36.5},
  {id: "kos", c: "108:2", lab: [16.566, 49.865], w: 26.1},
  {id: "ber", c: "45:2", lab: [14.528, 50.894], w: 33.4},
  {id: "lom", c: "261:0", lab: [15.997, 49.303], w: 36.6},
  {id: "ses", c: "city", lab: [14.667, 51.1], w: 24.9},
  {id: "lie", c: "333:2", lab: [16.728, 48.886], w: 44.1},
  {id: "lip", c: "171:1", lab: [16.25, 49.089], w: 43.8},
  {id: "rab", c: "198:1", lab: [13.281, 50.069], w: 36.5},
  {id: "smi", c: "117:0", lab: [14.753, 50.448], w: 27.0},
  {id: "kol", c: "288:0", lab: [13.677, 49.919], w: 31.5},
  {id: "per", c: "54:0", lab: [16.29, 49.446], w: 28.5},
  {id: "mdl", c: "city", lab: [13.901, 51.941], w: 26.1},
  {id: "mai", c: "75:2", lab: [15.796, 48.966], w: 30.3},
  {id: "bos", c: "315:0", lab: [16.683, 49.4], w: 27.9},
  {id: "haz", c: "234:1", lab: [14.182, 50.388], w: 28.1},
  {id: "ryz", c: "252:2", lab: [13.277, 49.205], w: 33.0},
  {id: "lob", c: "150:0", lab: [13.332, 50.491], w: 29.6},
  {id: "kra", c: "213:2", lab: [15.236, 49.043], w: 24.3},
  {id: "vra", c: "city", lab: [17.03, 51.11], w: 16.0},
];
const domCol = (c, a) => {
  const [h, v] = c.split(":"),
    T = [
      [62, -8],
      [48, 2],
      [70, 12],
    ][+v];
  return `hsl(${h} ${T[0]}% calc(var(--domL) + ${T[1]}%)${a ? " / " + a : ""})`;
};
const DUCH_NOLBL = new Set(["kcz", "mor", "hun", "kla", "hlu", "dlu", "brb", "hfa"]);
const haversine = (a, b) => {
  const R = 6371,
    toR = Math.PI / 180,
    dLa = (b[1] - a[1]) * toR,
    dLo = (b[0] - a[0]) * toR;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const PLACES = [];
(function () {
  const seen = new Set();
  for (const f of FAM) {
    if (f.nomap) continue;
    for (const sd of f.seats) {
      if (seen.has(sd[0])) continue;
      seen.add(sd[0]);
      PLACES.push({name: sd[0], lo: sd[1], la: sd[2], fam: f.name});
    }
  }
  for (const z of ZEMEPIS) {
    if (seen.has(z[0])) continue;
    seen.add(z[0]);
    PLACES.push({name: z[0], lo: z[1], la: z[2], fam: ""});
  }
  /* Intl.Collator je při řazení stovek jmen mnohonásobně rychlejší než localeCompare (start webu) */
  const cmp = new Intl.Collator("cs").compare;
  PLACES.sort((a, b) => cmp(a.name, b.name));
})();
const rpts = poly => pts(poly);
const MOUNTAINS = [
  [
    [12.35, 50.33],
    [12.8, 50.43],
    [13.3, 50.56],
    [13.8, 50.72],
  ],
  [
    [12.85, 49.36],
    [12.68, 49.55],
    [12.52, 49.75],
    [12.45, 49.95],
  ],
  [
    [14.35, 50.83],
    [14.6, 50.85],
    [14.85, 50.82],
  ],
  [
    [11.8, 50.12],
    [12.05, 50.03],
  ],
  [
    [12.62, 50.1],
    [12.82, 50.05],
  ],
  [
    [13.0, 50.3],
    [13.15, 50.25],
  ],
  [
    [14.6, 48.68],
    [14.85, 48.62],
  ],
  [
    [16.35, 50.7],
    [16.6, 50.6],
  ],
  [
    [12.95, 49.28],
    [13.2, 49.13],
    [13.6, 48.95],
    [14.0, 48.76],
    [14.25, 48.65],
  ],
  [
    [15.05, 50.84],
    [15.5, 50.76],
    [15.95, 50.67],
  ],
  [
    [16.38, 50.32],
    [16.6, 50.16],
  ],
  [
    [16.98, 50.21],
    [17.25, 50.12],
    [17.42, 50.04],
  ],
  [
    [17.95, 49.47],
    [18.4, 49.5],
    [18.9, 49.56],
    [19.4, 49.6],
  ],
  [
    [19.75, 49.22],
    [20.15, 49.2],
  ],
  [
    [17.15, 48.22],
    [17.35, 48.45],
    [17.55, 48.66],
  ],
  [
    [17.62, 48.86],
    [17.95, 49.04],
    [18.2, 49.2],
  ],
  [
    [10.9, 47.58],
    [11.6, 47.64],
    [12.3, 47.69],
    [13.0, 47.73],
    [13.6, 47.82],
    [14.2, 47.88],
    [14.8, 47.92],
    [15.4, 47.93],
    [15.85, 47.83],
  ],
  [
    [10.95, 47.42],
    [11.8, 47.47],
    [12.8, 47.52],
    [13.8, 47.6],
    [14.8, 47.68],
    [15.5, 47.7],
    [15.9, 47.6],
    [16.1, 47.47],
  ],
  [
    [11.1, 47.3],
    [12.4, 47.33],
    [13.6, 47.38],
    [14.9, 47.44],
    [15.7, 47.42],
  ],
  [
    [16.85, 50.24],
    [16.95, 50.18],
  ],
  [
    [16.95, 50.3],
    [17.15, 50.37],
  ],
  [
    [13.8, 49.62],
    [13.95, 49.76],
  ],
  [
    [17.6, 49.35],
    [17.85, 49.42],
  ],
  [
    [19.9, 49.62],
    [20.35, 49.58],
  ],
  [
    [19.6, 47.92],
    [20.1, 47.95],
    [20.45, 48.05],
  ],
  [
    [18.85, 47.95],
    [19.05, 47.9],
  ],
  [
    [17.6, 47.25],
    [18.0, 47.35],
  ],
  [
    [10.95, 50.72],
    [11.25, 50.6],
    [11.5, 50.45],
  ],
  [
    [18.85, 49.25],
    [19.15, 49.15],
  ],
  [
    [18.95, 48.95],
    [19.15, 48.8],
  ],
  [
    [19.35, 48.92],
    [19.75, 48.92],
    [20.1, 48.88],
  ],
  [
    [19.6, 48.72],
    [20.1, 48.75],
    [20.5, 48.72],
  ],
  [
    [18.75, 48.5],
    [18.95, 48.38],
  ],
  [
    [18.2, 49.02],
    [18.5, 48.88],
  ],
  [
    [17.9, 48.75],
    [18.0, 48.55],
  ],
  [
    [18.8, 47.75],
    [19.05, 47.65],
  ],
];
const FORESTS = [
  [
    [12.7, 49.45],
    [13.2, 49.3],
    [13.7, 49.1],
    [14.1, 48.85],
    [14.2, 48.65],
    [13.8, 48.62],
    [13.4, 48.78],
    [13.0, 48.95],
    [12.6, 49.15],
    [12.5, 49.35],
  ],
  [
    [12.35, 49.95],
    [12.65, 49.85],
    [12.75, 49.55],
    [12.55, 49.45],
    [12.3, 49.6],
  ],
  [
    [12.6, 50.12],
    [12.88, 50.1],
    [12.88, 49.97],
    [12.6, 49.97],
  ],
  [
    [12.2, 50.42],
    [12.8, 50.53],
    [13.4, 50.67],
    [13.92, 50.8],
    [13.97, 50.7],
    [13.4, 50.56],
    [12.8, 50.39],
    [12.3, 50.3],
  ],
  [
    [14.0, 50.97],
    [14.6, 50.96],
    [14.9, 50.86],
    [14.7, 50.72],
    [14.3, 50.72],
    [14.05, 50.8],
  ],
  [
    [15.0, 50.9],
    [15.5, 50.86],
    [16.0, 50.73],
    [15.95, 50.6],
    [15.5, 50.66],
    [15.05, 50.76],
  ],
  [
    [16.15, 50.6],
    [16.45, 50.55],
    [16.65, 50.25],
    [16.45, 50.15],
    [16.25, 50.35],
  ],
  [
    [16.95, 50.35],
    [17.3, 50.3],
    [17.55, 50.1],
    [17.85, 49.95],
    [17.7, 49.75],
    [17.35, 49.78],
    [17.1, 49.95],
    [16.95, 50.1],
  ],
  [
    [15.1, 49.75],
    [15.6, 49.8],
    [16.2, 49.7],
    [16.4, 49.45],
    [16.1, 49.2],
    [15.6, 49.12],
    [15.2, 49.3],
    [15.0, 49.5],
  ],
  [
    [13.72, 49.86],
    [14.05, 49.9],
    [14.2, 49.75],
    [14.05, 49.55],
    [13.8, 49.55],
    [13.68, 49.7],
  ],
  [
    [14.5, 48.82],
    [14.95, 48.84],
    [14.98, 48.62],
    [14.5, 48.6],
  ],
  [
    [16.6, 49.55],
    [16.95, 49.62],
    [17.0, 49.3],
    [16.75, 49.25],
    [16.6, 49.35],
  ],
  [
    [17.3, 49.15],
    [17.55, 49.27],
    [17.9, 49.47],
    [18.4, 49.62],
    [19.0, 49.72],
    [19.5, 49.7],
    [19.6, 49.45],
    [19.0, 49.35],
    [18.4, 49.2],
    [18.05, 49.0],
    [17.7, 48.8],
    [17.4, 48.9],
  ],
  [
    [14.8, 51.35],
    [15.3, 51.3],
    [15.7, 51.35],
    [15.6, 51.6],
    [15.1, 51.62],
    [14.75, 51.55],
  ],
  [
    [13.9, 51.45],
    [14.6, 51.45],
    [14.7, 51.65],
    [14.3, 51.7],
    [13.9, 51.6],
  ],
  [
    [13.8, 51.85],
    [14.15, 51.82],
    [14.2, 51.95],
    [13.85, 51.98],
  ],
  [
    [17.4, 51.0],
    [18.0, 50.9],
    [18.3, 50.75],
    [18.0, 50.65],
    [17.5, 50.75],
  ],
  [
    [18.4, 50.85],
    [18.9, 50.75],
    [19.1, 50.42],
    [18.7, 50.35],
    [18.4, 50.55],
  ],
  [
    [15.9, 50.86],
    [16.5, 50.78],
    [16.6, 50.62],
    [16.1, 50.7],
  ],
  [
    [11.0, 50.62],
    [11.8, 50.52],
    [12.2, 50.36],
    [11.6, 50.28],
    [11.0, 50.4],
  ],
  [
    [14.7, 48.78],
    [15.3, 48.86],
    [15.6, 48.62],
    [15.2, 48.45],
    [14.8, 48.45],
  ],
  [
    [19.3, 49.42],
    [20.2, 49.38],
    [20.2, 49.1],
    [19.3, 49.1],
  ],
  [
    [18.6, 49.2],
    [19.4, 48.98],
    [19.6, 48.6],
    [19.0, 48.55],
    [18.6, 48.8],
  ],
  [
    [14.5, 50.56],
    [14.78, 50.56],
    [14.78, 50.42],
    [14.5, 50.42],
  ],
  [
    [11.2, 49.75],
    [11.9, 49.7],
    [12.1, 49.3],
    [11.6, 49.15],
    [11.2, 49.35],
  ],
  [
    [15.85, 48.3],
    [16.25, 48.32],
    [16.2, 48.08],
    [15.9, 48.05],
  ],
  [
    [13.9, 48.62],
    [14.6, 48.68],
    [14.9, 48.55],
    [14.6, 48.38],
    [14.0, 48.42],
  ],
  [
    [20.1, 50.15],
    [20.3, 50.15],
    [20.3, 50.0],
    [20.1, 50.0],
  ],
  [
    [19.3, 48.98],
    [20.25, 48.95],
    [20.3, 48.6],
    [19.5, 48.55],
  ],
  [
    [17.85, 49.05],
    [18.55, 49.05],
    [18.6, 48.7],
    [18.0, 48.5],
    [17.85, 48.7],
  ],
  [
    [18.75, 47.82],
    [19.1, 47.78],
    [19.1, 47.6],
    [18.8, 47.62],
  ],
  [
    [10.95, 50.85],
    [11.5, 50.65],
    [11.6, 50.4],
    [10.95, 50.55],
  ],
  [
    [13.6, 50.18],
    [13.95, 50.17],
    [14.1, 50.02],
    [13.95, 49.94],
    [13.62, 49.96],
    [13.52, 50.06],
  ],
  [
    [14.62, 50.72],
    [14.92, 50.7],
    [14.95, 50.56],
    [14.7, 50.52],
    [14.55, 50.6],
  ],
  [
    [14.6, 49.2],
    [14.95, 49.18],
    [15.0, 48.95],
    [14.75, 48.92],
    [14.6, 49.02],
  ],
  [
    [14.05, 48.95],
    [14.3, 48.98],
    [14.35, 48.86],
    [14.1, 48.84],
  ],
  [
    [14.7, 49.75],
    [15.15, 49.72],
    [15.1, 49.52],
    [14.8, 49.5],
    [14.65, 49.6],
  ],
  [
    [13.05, 50.05],
    [13.4, 50.1],
    [13.45, 49.95],
    [13.1, 49.9],
  ],
  [
    [16.85, 48.82],
    [17.1, 48.78],
    [17.0, 48.6],
    [16.85, 48.62],
  ],
  [
    [16.95, 48.85],
    [17.3, 48.75],
    [17.25, 48.4],
    [17.0, 48.45],
  ],
  [
    [17.1, 48.55],
    [17.4, 48.62],
    [17.35, 48.25],
    [17.15, 48.25],
  ],
  [
    [17.0, 51.62],
    [17.7, 51.62],
    [17.75, 51.38],
    [17.1, 51.38],
  ],
  [
    [17.55, 50.95],
    [18.05, 51.05],
    [18.25, 50.85],
    [17.75, 50.8],
  ],
  [
    [15.9, 51.1],
    [16.25, 51.08],
    [16.2, 50.95],
    [15.9, 50.95],
  ],
  [
    [15.55, 52.8],
    [16.6, 52.8],
    [16.7, 52.55],
    [15.8, 52.5],
  ],
  [
    [17.7, 51.55],
    [18.3, 51.55],
    [18.35, 51.25],
    [17.75, 51.25],
  ],
  [
    [19.2, 51.25],
    [20.4, 51.25],
    [20.4, 50.65],
    [19.5, 50.7],
    [19.2, 51.0],
  ],
  [
    [19.2, 50.85],
    [19.65, 50.7],
    [19.8, 50.3],
    [19.5, 50.25],
    [19.25, 50.5],
  ],
  [
    [19.75, 49.78],
    [20.4, 49.78],
    [20.4, 49.5],
    [19.85, 49.5],
  ],
  [
    [11.0, 49.58],
    [11.4, 49.55],
    [11.4, 49.32],
    [11.0, 49.32],
  ],
  [
    [11.75, 50.18],
    [12.12, 50.15],
    [12.12, 49.95],
    [11.8, 49.95],
  ],
  [
    [12.35, 51.75],
    [12.85, 51.75],
    [12.8, 51.55],
    [12.4, 51.55],
  ],
  [
    [12.3, 52.05],
    [13.3, 52.05],
    [13.3, 51.85],
    [12.4, 51.85],
  ],
  [
    [13.5, 52.4],
    [14.1, 52.42],
    [14.1, 52.15],
    [13.55, 52.12],
  ],
  [
    [13.7, 51.15],
    [13.98, 51.15],
    [13.98, 51.03],
    [13.72, 51.03],
  ],
  [
    [12.9, 47.62],
    [14.0, 47.72],
    [15.0, 47.75],
    [15.9, 47.85],
    [16.1, 47.55],
    [15.0, 47.35],
    [13.5, 47.3],
    [12.9, 47.35],
  ],
  [
    [17.5, 47.4],
    [18.2, 47.4],
    [18.2, 47.2],
    [17.5, 47.2],
  ],
  [
    [18.85, 48.05],
    [19.35, 48.05],
    [20.1, 47.95],
    [20.2, 47.8],
    [19.4, 47.78],
    [18.9, 47.85],
  ],
  [
    [18.35, 48.75],
    [18.75, 48.75],
    [18.75, 48.45],
    [18.35, 48.5],
  ],
];
function inPoly(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i],
      [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function mmHlasZem(n) {
  if (window.mmHlas) mmHlas(`${n} – víc o tomto místě se družina dozví, až ho navštíví.`, 4500);
}
/* kresba mapy je v samostatné části (02b-mapa-kresba.js): než se načte, nic se nekreslí – stránka Mapa si ji načte sama */
function drawMap() {
  /* skrytou mapu nekreslit (2026-10-25): výběr rodu na startu webu nebo ze Zemských desek ji jinak kreslil naprázdno (vypravěč
     má kresbu načtenou hned, ~40 ms na PC); otevření Mapy nebo Výpravy ji nakreslí přes route() */
  if (curView !== "mapa" && curView !== "vyprava") return;
  if (typeof drawMapK === "function") return drawMapK();
  mmLina("mapa")
    .then(() => {
      if (typeof drawMapK === "function") drawMapK();
    })
    .catch(() => {});
}
const RORD = {rod: 0, spoj: 1, spor: 2};
const relsFor = id => REL.filter(r => r.ids.includes(id)).sort((a, b) => RORD[a.t] - RORD[b.t]);
const flink = id =>
  `<button type="button" class="flink" data-id="${id}" title="${byId[id].nomap ? "Ukázat v grafu vazeb" : "Ukázat državy na mapě"}">${byId[id].name}</button>`;
function relText(r, self) {
  const others = r.ids.filter(i => i !== self && byId[i]);
  return (others.length ? `${others.map(flink).join(", ")} — ` : "") + r.x;
}
const EMPTY = `<span class="lbl">Rod a jeho vazby</span><p>Vyberte rod na mapě, v nabídce nebo v rejstříku níže. Zobrazí se hlava rodu, državy, postoj ke králi a všechna příbuzenství, spojenectví a spory.</p>`;
function renderDetail() {
  const d = document.getElementById("detail");
  if (!st.sel) {
    d.classList.add("empty");
    const pv = HIST[HIST.length - 1];
    d.innerHTML = (pv ? `<button type="button" class="backbtn" id="backbtn">← Zpět: ${histName(pv)}</button>` : "") + EMPTY;
    const bb = document.getElementById("backbtn");
    if (bb) bb.addEventListener("click", goBack);
    return;
  }
  const f = byId[st.sel];
  d.classList.remove("empty");
  const rels = relsFor(f.id);
  const prev = HIST[HIST.length - 1];
  /* na široké mapě je panel vysouvací okno přes mapu – × ho zavře (zruší výběr) */
  const back = `<button type="button" class="detx" data-detx aria-label="Zavřít panel" title="Zavřít">×</button>${prev ? `<button type="button" class="backbtn" id="backbtn">← Zpět: ${histName(prev)}</button>` : ""}`;
  if (st.city) {
    const sd = f.seats.find(x => x[0] === st.city) || f.seats[0],
      conf = sd[3] || f.conf,
      info = CITYINFO[st.city] || {};
    const typ = info.t || CTYPE[f.id] || (f.castle ? "Hrad" : "Město");
    /* jen shrnutí tohoto místa (CITYINFO) – poznámka celé skupiny měst mluví o jiných městech (Litovel ukazovala Tábor, 2026-10-25) */
    d.innerHTML = `${back}<span class="lbl">${typ} · ${f.nbr ? f.land : "země Koruny"}</span>
     <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3 style="font-size:1.35rem">${f.castle ? `<img class="townico big t-${conf}" src="${CASTLEICO}" alt="" aria-hidden="true">` : townImg(conf, "townico big")}${st.city}</h3>${faith(conf)}</div>
     ${CARMS[st.city] ? `<img class="carms" src="${CARMS[st.city]}" alt="Erb města ${st.city}">` : ""}${info.n ? `<p>${info.n}</p>` : ""}
     ${st.city === "Praha" ? `<a class="gbtn ghost" href="#praha">Plán Prahy</a>` : ""}<dl class="kv" style="clear:both"><dt>Patří k</dt><dd>${flink(f.id)}</dd></dl>`;
    const bb = document.getElementById("backbtn");
    if (bb) bb.addEventListener("click", goBack);
    return;
  }
  d.innerHTML = `${back}<span class="lbl">${f.nbr ? "Soused · " : ""}${f.land}</span>
   <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3 style="font-size:1.35rem">${shield(f)}${f.name}</h3>${faith(f.conf)}</div>
   <dl class="kv"><dt>V čele</dt><dd>${f.head}</dd>
   ${f.seats.length ? `<dt>Državy</dt><dd>${f.seats.map(sd => `<button type="button" class="plink${st.focus === sd[0] ? " on" : ""}" data-place="${sd[0]}" title="Ukázat na mapě">${sd[0]}</button>`).join(", ")}</dd>` : ""}
   <dt>${f.nbr ? "Ke Koruně" : "K Jiřímu"}</dt><dd>${f.stance}</dd>
   ${f.pos ? `<dt>Postavení</dt><dd>${POSL(f.pos)}</dd>` : ""}
   ${PRAHA_PLACES.some(q => q.r === f.id) ? `<dt>V Praze</dt><dd>${prLinks(PRAHA_PLACES.filter(q => q.r === f.id))}</dd>` : ""}</dl>
   <p>${f.note}</p>
   ${peopleOf(f.id).length ? `<span class="lbl">Osoby</span><p>${peopleOf(f.id).map(plinkP).join(", ")}</p>` : ""}
   ${rels.length ? `<span class="lbl">Vazby</span>${relGroups(rels, f.id)}` : ""}
   <a class="gbtn ghost" href="#rod/${f.id}">Otevřít v zemských deskách</a>`;
  const bb = document.getElementById("backbtn");
  if (bb) bb.addEventListener("click", goBack);
}
const POSL = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");
const HISTH = f => (f.city ? "Historie města" : /^(Biskupství|Arcibiskupství|Papežská|Duchovenstvo)/.test(f.name) ? "Historie" : "Historie rodu");
const HIST = [];
function setSel(id, push = true, city = null) {
  if (push && st.sel && (st.sel !== id || st.city !== city)) {
    HIST.push({id: st.sel, city: st.city});
    if (HIST.length > 30) HIST.shift();
  }
  st.sel = id;
  st.city = id ? city : null;
  st.focus = null;
  document.getElementById("famsel").value = st.sel || "";
  if (st.sel && byId[st.sel].nbr && typeof setTab === "function") setTab(byId[st.sel].land);
  document.getElementById("ringlegend").hidden = !st.rings || !st.sel || !relsFor(st.sel).length;
  drawMap();
  renderDetail();
}
function select(id) {
  setSel(st.sel === id && !st.city ? null : id);
}
function show(id) {
  setSel(id);
}
function showCity(id, name) {
  setSel(id, true, name);
}
document.addEventListener("click", e => {
  if (e.target.closest && e.target.closest("[data-detx]")) setSel(null, false);
});
function goBack() {
  const h = HIST.pop();
  if (h) setSel(h.id, false, h.city);
}
const histName = h => h.city || byId[h.id].name;

/* cards */
const fs = document.getElementById("famsel");
const _nrm = s =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function buildCards(container, lands, nbr) {
  if (!FAM.some(f => !!f.nbr === nbr)) {
    container.innerHTML = `<div class="placeholder"><p>Družina zatím nezná žádný ${nbr ? "sousední " : ""}rod. Přibudou, jak o nich uslyší nebo je potká.</p></div>`;
    return;
  }
  for (const L of lands) {
    const fams = FAM.filter(f => f.land === L && !!f.nbr === nbr);
    if (!fams.length) continue;
    const sec = document.createElement("div");
    sec.className = "land-sec";
    sec.dataset.land = L;
    sec.innerHTML = `<h3 class="landh">${L.toUpperCase()}</h3>`;
    const grid = document.createElement("div");
    grid.className = "cards";
    const og = document.createElement("optgroup");
    og.label = nbr ? `Soused: ${L}` : L;
    for (const f of fams) {
      const c = document.createElement("article");
      c.className = "card";
      c.dataset.id = f.id;
      c.dataset.fc = f.conf;
      c.dataset.fl = f.land;
      c.dataset.txt = _nrm(f.name + " " + f.head + " " + f.seats.map(s => s[0]).join(" ") + " " + f.stance);
      c.innerHTML = `<span class="cseal f-${f.conf}" title="${CONFN[f.conf]}"><img src="${FICON[f.conf]}" alt="${CONFN[f.conf]}"></span><div class="cimg">${ARMS[f.id] ? armsImg(f, "armcard") : shield0(f).replace('class="shield"', 'class="cshield"')}</div>
        <div class="cbody"><h3>${f.name}</h3>
        <p class="head">${f.head}</p>
        ${f.seats.length ? `<p class="seats">${f.seats.map(s => s[0]).join(" · ")}</p>` : ""}</div>`;
      c.tabIndex = 0;
      c.setAttribute("role", "link");
      c.setAttribute("aria-label", f.name);
      {
        const go = () => navTo("#rod/" + f.id);
        c.addEventListener("click", go);
        c.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        });
      }
      if (!f.nomap) {
        const o = document.createElement("option");
        o.value = f.id;
        o.textContent = f.name;
        og.appendChild(o);
      }
      grid.appendChild(c);
    }
    sec.appendChild(grid);
    container.appendChild(sec);
    if (og.children.length) fs.appendChild(og);
  }
}
buildCards(document.getElementById("cardlands"), ["Čechy", "Morava", "Slezsko", "Lužice", "Královská města", "Duchovenstvo"], false);
/* desky: filters + list view */
const DF = {conf: "all", land: "all", q: "", view: "cards"};
try {
  const v = localStorage.getItem("mm-dview");
  if (v === "list" || v === "cards") DF.view = v;
} catch (e) {}
function deskList() {
  const box = document.getElementById("desklist");
  if (box.dataset.done) return;
  box.dataset.done = 1;
  const LANDS_K = ["Čechy", "Morava", "Slezsko", "Lužice", "Královská města", "Duchovenstvo"];
  const rows = FAM.filter(f => !f.nbr).sort((a, b) => LANDS_K.indexOf(a.land) - LANDS_K.indexOf(b.land));
  box.innerHTML = `<div class="rtw"><table class="rtab dlist"><thead><tr><th scope="col">Rod</th><th scope="col">Země</th><th scope="col">V čele</th><th scope="col">Vyznání</th><th scope="col">Postavení</th><th scope="col">K Jiřímu</th></tr></thead><tbody>${rows
    .map(
      f =>
        `<tr data-id="${f.id}" data-fc="${f.conf}" data-fl="${f.land}" data-txt="${_nrm(f.name + " " + (SHORT[f.id] || "") + " " + f.head + " " + f.seats.map(s => s[0]).join(" ") + " " + f.stance + " " + (f.pos || "")).replace(/"/g, "")}"><th scope="row" data-l="Rod"><a href="#rod/${f.id}">${ARMS[f.id] ? armsImg(f, "armlist") : shield0(f)}<span>${f.name}</span></a></th><td data-l="Země">${f.land}</td><td data-l="V čele">${f.head}</td><td data-l="Vyznání">${faith(f.conf)}</td><td data-l="Postavení">${POSL(f.pos)}</td><td data-l="K Jiřímu">${f.stance}</td></tr>`,
    )
    .join("")}</tbody></table></div>`;
  box.querySelectorAll("tbody tr").forEach(r =>
    r.addEventListener("click", e => {
      if (!e.target.closest("a")) navTo("#rod/" + r.dataset.id);
    }),
  );
}
function deskApply() {
  const ok = el =>
    (DF.conf === "all" || el.dataset.fc === DF.conf) &&
    (DF.land === "all" || el.dataset.fl === DF.land) &&
    (!DF.q || DF.q.split(/\s+/).every(w => el.dataset.txt.includes(w)));
  const list = DF.view === "list";
  if (list) deskList();
  document.getElementById("cardlands").hidden = list;
  document.getElementById("desklist").hidden = !list;
  let n = 0,
    tot = 0;
  document.querySelectorAll("#cardlands .card").forEach(c => {
    const v = ok(c);
    c.hidden = !v;
    tot++;
    if (v) n++;
  });
  document.querySelectorAll("#cardlands .land-sec").forEach(s => {
    s.hidden = !s.querySelector(".card:not([hidden])");
  });
  document.querySelectorAll("#desklist tbody tr").forEach(r => {
    r.hidden = !ok(r);
  });
  document.getElementById("dcount").textContent = n === tot ? `${tot} záznamů` : `Zobrazeno ${n} z ${tot}`;
  document.querySelectorAll("[data-fconf]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fconf === DF.conf));
  document.querySelectorAll("[data-fland]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fland === DF.land));
  document.querySelectorAll("[data-dview]").forEach(b => b.setAttribute("aria-pressed", b.dataset.dview === DF.view));
}
document.querySelectorAll("[data-fconf]").forEach(b =>
  b.addEventListener("click", () => {
    DF.conf = b.dataset.fconf;
    deskApply();
  }),
);
document.querySelectorAll("[data-fland]").forEach(b =>
  b.addEventListener("click", () => {
    DF.land = b.dataset.fland;
    deskApply();
  }),
);
document.querySelectorAll("[data-dview]").forEach(b =>
  b.addEventListener("click", () => {
    DF.view = b.dataset.dview;
    try {
      localStorage.setItem("mm-dview", DF.view);
    } catch (e) {}
    deskApply();
  }),
);
deskApply();
const NBR_LANDS = ["Braniborsko", "Polsko", "Uhry", "Rakousy", "Bavory", "Sasko", "Říšská města", "Řím", "Osmanská říše"];
buildCards(document.getElementById("nbrlands"), NBR_LANDS, true);
const tabsEl = document.getElementById("nbrtabs");
function setTab(L) {
  document.querySelectorAll("#nbrlands .land-sec").forEach(s => {
    s.hidden = s.dataset.land !== L;
  });
  tabsEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.land === L));
}
for (const L of NBR_LANDS) {
  const n = FAM.filter(f => f.nbr && f.land === L).length;
  if (!n) continue;
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.land = L;
  b.textContent = `${L} (${n})`;
  b.addEventListener("click", () => setTab(L));
  tabsEl.appendChild(b);
}
setTab(NBR_LANDS[0]);
fs.addEventListener("change", () => {
  if (fs.value) show(fs.value);
  else setSel(null);
});

/* relations */
function renderRels(container, list) {
  for (const [t, title, color] of [
    ["rod", "Krev a sňatky", "var(--gold)"],
    ["spoj", "Spojenectví", "var(--kat)"],
    ["spor", "Spory a křivdy", "var(--kal)"],
  ]) {
    const col = document.createElement("div");
    col.className = "relcol";
    col.innerHTML = `<h3 style="color:${color}">${rIco(t)}${title.toUpperCase()}</h3><ul>${list
      .filter(r => r.t === t)
      .map(r => `<li>${r.ids.map(flink).join(" × ")}<br>${r.x}</li>`)
      .join("")}</ul>`;
    container.appendChild(col);
  }
}
const isForeign = r => r.ids.some(i => byId[i].nbr);
renderRels(
  document.getElementById("relcols"),
  REL.filter(r => !isForeign(r)),
);
renderRels(document.getElementById("relcols2"), REL.filter(isForeign));

/* search */
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const CIDX = [];
FAM.forEach(f => {
  if (f.city || f.castle)
    f.seats.forEach(sd => CIDX.push({f, name: sd[0], conf: sd[3] || f.conf, txt: norm(sd[0] + " " + ((CITYINFO[sd[0]] || {}).n || ""))}));
});
/* hledání na mapě nahradilo jediné hledání v liště */

/* relationship graph */
const SHORT = /*@SHORT@*/ {};
const gsvg = document.getElementById("graph");
const EDGES = [];
REL.forEach((r, ri) => {
  for (let i = 1; i < r.ids.length; i++) EDGES.push({a: r.ids[0], b: r.ids[i], t: r.t, ri});
});
const GIDS = [...new Set(EDGES.flatMap(e => [e.a, e.b]))].filter(id => byId[id]);
const GW = 900,
  GH = 640;
const GN = {};
/* rozložení grafu vazeb (iterační simulace) se spočítá až při prvním kreslení grafu (Zemské desky › Vazby), ne na startu webu –
   se všemi vazbami vypravěče stálo ~0,14 s na PC (2026-10-25) */
let GROZ = false;
function grafRozloz() {
  if (GROZ) return;
  GROZ = true;
  const anc = {};
  for (const id of GIDS) {
    const f = byId[id];
    anc[id] = f.seats.length ? [f.seats[0][1], f.seats[0][2]] : [11.3, 47.6];
  }
  const lons = Object.values(anc).map(a => a[0]),
    lats = Object.values(anc).map(a => a[1]);
  const lo0 = Math.min(...lons),
    lo1 = Math.max(...lons),
    la0 = Math.min(...lats),
    la1 = Math.max(...lats);
  for (const id of GIDS) {
    const [lo, la] = anc[id];
    const ax = 70 + ((lo - lo0) / (lo1 - lo0)) * (GW - 170),
      ay = 40 + ((la1 - la) / (la1 - la0)) * (GH - 80);
    GN[id] = {id, ax, ay, x: ax, y: ay, deg: 0};
  }
  EDGES.forEach(e => {
    GN[e.a].deg++;
    GN[e.b].deg++;
  });
  const nodes = Object.values(GN);
  for (let it = 0; it < 500; it++) {
    const cool = 1 - it / 500;
    for (let i = 0; i < nodes.length; i++)
      for (let j = i + 1; j < nodes.length; j++) {
        const p = nodes[i],
          q = nodes[j];
        let dx = p.x - q.x,
          dy = p.y - q.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = i % 2 ? 1 : -1;
          dy = 1;
          d2 = 2;
        }
        if (d2 > 90000) continue;
        const f = Math.min(5200 / d2, 10) * (0.3 + cool),
          d = Math.sqrt(d2);
        p.x += (dx / d) * f;
        p.y += (dy / d) * f;
        q.x -= (dx / d) * f;
        q.y -= (dy / d) * f;
      }
    for (const e of EDGES) {
      const p = GN[e.a],
        q = GN[e.b];
      const dx = q.x - p.x,
        dy = q.y - p.y,
        d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 110) * 0.004 * cool;
      p.x += (dx / d) * f;
      p.y += (dy / d) * f;
      q.x -= (dx / d) * f;
      q.y -= (dy / d) * f;
    }
    for (const n of nodes) {
      n.x += (n.ax - n.x) * 0.008;
      n.y += (n.ay - n.y) * 0.008;
    }
    /* keep labels (drawn to the right of each node) from overlapping */
    for (let i = 0; i < nodes.length; i++)
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const p = nodes[i],
          q = nodes[j];
        const w = (SHORT[p.id] || "").length * 7 + 22;
        const dx = q.x - p.x,
          dy = q.y - p.y;
        if (dx > -14 && dx < w && Math.abs(dy) < 17) {
          const push = (17 - Math.abs(dy)) * 0.25;
          const s = dy >= 0 ? 1 : -1;
          q.y += s * push;
          p.y -= s * push;
        }
      }
    for (const n of nodes) {
      n.x = Math.max(20, Math.min(GW - 150, n.x));
      n.y = Math.max(18, Math.min(GH - 18, n.y));
    }
  }
}
let gst = {sel: null, type: "all", koruna: false};
function gVisibleEdge(e) {
  if (gst.type !== "all" && e.t !== gst.type) return false;
  if (gst.koruna && (byId[e.a].nbr || byId[e.b].nbr)) return false;
  return true;
}
const ECOL = {rod: "var(--gold)", spoj: "var(--kat)", spor: "var(--kal)"};
function drawGraph() {
  grafRozloz();
  gsvg.innerHTML = "";
  const vis = EDGES.filter(gVisibleEdge);
  const nbrSet = new Set();
  if (gst.sel)
    vis.forEach(e => {
      if (e.a === gst.sel) nbrSet.add(e.b);
      if (e.b === gst.sel) nbrSet.add(e.a);
    });
  const shown = new Set(vis.flatMap(e => [e.a, e.b]));
  if (gst.sel) shown.add(gst.sel);
  for (const e of vis) {
    const p = GN[e.a],
      q = GN[e.b];
    const on = !gst.sel || e.a === gst.sel || e.b === gst.sel;
    gsvg.appendChild(
      el("line", {
        x1: p.x,
        y1: p.y,
        x2: q.x,
        y2: q.y,
        class: "gedge",
        stroke: ECOL[e.t],
        "stroke-width": on && gst.sel ? 2.6 : 1.5,
        "stroke-dasharray": e.t === "rod" ? "5 3" : "none",
        opacity: on ? (gst.sel ? 0.95 : 0.5) : 0.07,
      }),
    );
  }
  for (const id of GIDS) {
    if (!shown.has(id)) continue;
    const n = GN[id],
      f = byId[id];
    const on = !gst.sel || id === gst.sel || nbrSet.has(id);
    const g = el("g", {class: "gnode", opacity: on ? 1 : 0.18, tabindex: "0", role: "button", "aria-label": f.name});
    const r = Math.min(5 + n.deg * 0.7, 12) + (id === gst.sel ? 2 : 0);
    g.appendChild(el("circle", {cx: n.x, cy: n.y, r: r + 6, fill: "transparent"}));
    g.appendChild(
      el("circle", {
        cx: n.x,
        cy: n.y,
        r,
        fill: `var(--${f.conf})`,
        stroke: f.nbr ? "var(--muted)" : "var(--paper)",
        "stroke-width": f.nbr ? 1.6 : 1.4,
        "stroke-dasharray": f.nbr ? "3 2" : "none",
      }),
    );
    g.appendChild(el("text", {x: n.x + r + 4, y: n.y + 4, class: "glbl"}, SHORT[id] || f.name));
    g.addEventListener("click", () => gSelect(id));
    g.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        gSelect(id);
      }
    });
    gsvg.appendChild(g);
  }
}
const GINFO0 = document.getElementById("ginfo").innerHTML;
function gSelect(id) {
  gst.sel = gst.sel === id ? null : id;
  const box = document.getElementById("ginfo");
  if (!gst.sel) {
    box.innerHTML = GINFO0;
    drawGraph();
    return;
  }
  const f = byId[id],
    rels = relsFor(id);
  box.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3>${f.name}</h3>${faith(f.conf)}</div>
    <p class="lbl">${f.nbr ? "Soused · " : ""}${f.land} · ${f.head}</p>
    ${relGroups(rels, id)}
    <div class="btnrow">${f.nomap ? "" : `<button type="button" class="gbtn" data-showmap="${id}">Ukázat na mapě</button>`}<a class="gbtn ghost" href="#rod/${id}">Zemské desky</a></div>`;
  drawGraph();
}
document.querySelectorAll("[data-gt]").forEach(b =>
  b.addEventListener("click", () => {
    gst.type = b.dataset.gt;
    document.querySelectorAll("[data-gt]").forEach(x => x.setAttribute("aria-pressed", x === b));
    drawGraph();
  }),
);
document.querySelector("[data-gs]").addEventListener("click", e => {
  gst.koruna = !gst.koruna;
  e.currentTarget.setAttribute("aria-pressed", gst.koruna);
  drawGraph();
});

const PEOPLE = /*@PEOPLE@*/ [];
const PBY = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
/* rešerše postav: jen ve vypravěčských datech (hráčům přijde prázdná) */
const RESERS = /*@RESERS@*/ [];
const RESBY = Object.fromEntries(RESERS.map(r => [r.id, r]));
const peopleOf = id => PEOPLE.filter(p => p.r === id);
const plinkP = p => `<a class="plinkp" href="#osoba/${p.id}">${p.n}</a>`;
/* layers, dioceses legend, travel measuring */
const tFrom = document.getElementById("tfrom"),
  tTo = document.getElementById("tto");
for (const sel of [tFrom, tTo]) {
  sel.innerHTML = `<option value="">— vyberte —</option>` + PLACES.map(p => `<option value="${p.name}">${p.name}</option>`).join("");
}
const placeBy = n => PLACES.find(p => p.name === n) || null;
function days(km, perDay) {
  const d = Math.max(0.5, Math.ceil((km / perDay) * 2) / 2);
  const t = String(d).replace(".", ",");
  const w = d < 1 ? "dne" : d === 1 ? "den" : d < 5 && Number.isInteger(d) ? "dny" : "dní";
  return d === 0.5 ? "půl dne" : `${t} ${Number.isInteger(d) ? w : "dne"}`;
}
/* routing: roads become a graph; off-road legs and forest/mountain terrain cost more time */
const TOWNS = [
  ["Beroun", 14.07, 49.96],
  ["Rokycany", 13.6, 49.74],
  ["Stříbro", 13.0, 49.75],
  ["Waidhaus", 12.49, 49.64],
  ["Amberg", 11.86, 49.44],
  ["Norimberk", 11.08, 49.45],
  ["Lovosice", 14.05, 50.52],
  ["Ústí", 14.04, 50.66],
  ["Chlumec", 13.94, 50.7],
  ["Nakléřov", 13.98, 50.73],
  ["Mladá Boleslav", 14.9, 50.41],
  ["Turnov", 15.16, 50.59],
  ["Kolín", 15.2, 50.03],
  ["Čáslav", 15.38, 49.91],
  ["Habry", 15.49, 49.75],
  ["Německý Brod", 15.58, 49.61],
  ["Benešov", 14.69, 49.78],
  ["Kaplice", 14.5, 48.74],
  ["Cáhlov", 14.5, 48.51],
  ["Linec", 14.29, 48.31],
  ["Hranice", 17.73, 49.55],
  ["Erfurt", 11.03, 50.98],
  ["Lipsko", 12.37, 51.34],
  ["Bytom", 18.85, 50.32],
  ["Waldkirchen", 13.6, 48.73],
  ["Prachatice", 14.0, 49.01],
  ["Vimperk", 13.78, 49.05],
  ["Kašperské Hory", 13.56, 49.14],
  ["Sušice", 13.52, 49.23],
  ["Prešpurk", 17.11, 48.15],
  ["Ráb", 17.63, 47.69],
  ["Komárno", 18.12, 47.76],
  ["Staňkov", 13.07, 49.55],
  ["Domažlice", 12.93, 49.44],
  ["Brod nad Lesy", 12.84, 49.31],
  ["Cham", 12.66, 49.22],
  ["Slaný", 14.09, 50.23],
  ["Louny", 13.8, 50.36],
  ["Kadaň", 13.27, 50.38],
  ["Ostrov", 12.94, 50.31],
  ["Most", 13.64, 50.5],
  ["Freiberk", 13.34, 50.92],
  ["Mělník", 14.47, 50.35],
  ["Česká Lípa", 14.54, 50.69],
  ["Chrudim", 15.8, 49.95],
  ["Vysoké Mýto", 16.16, 49.95],
  ["Trstenice", 16.3, 49.76],
  ["Svitavy", 16.47, 49.76],
  ["Letovice", 16.57, 49.55],
  ["Moravská Třebová", 16.66, 49.76],
  ["Uherské Hradiště", 17.46, 49.07],
  ["Uherský Brod", 17.65, 49.03],
  ["Vlárský průsmyk", 17.95, 49.03],
  ["Trenčín", 18.04, 48.89],
  ["Soběslav", 14.72, 49.26],
  ["Vitoraz", 14.89, 48.7],
  ["Zwettl", 15.17, 48.6],
  ["Kremže", 15.6, 48.41],
  ["Třebíč", 15.88, 49.21],
  ["Hof", 11.92, 50.31],
  ["Zwickau", 12.5, 50.72],
  ["Wittenberg", 12.65, 51.87],
  ["Halle", 11.97, 51.48],
  ["Magdeburk", 11.63, 52.13],
  ["Frankfurt nad Odrou", 14.55, 52.35],
  ["Poznaň", 16.93, 52.41],
  ["Trzebnica", 17.05, 51.31],
  ["Kališ", 18.09, 51.76],
  ["Myślenice", 19.94, 49.83],
  ["Nový Targ", 20.03, 49.48],
  ["Vác", 19.13, 47.78],
  ["Banská Bystrica", 19.15, 48.74],
  ["Banská Štiavnica", 18.9, 48.45],
  ["Žilina", 18.74, 49.22],
  ["Jablunkov", 18.76, 49.58],
  ["Trnava", 17.59, 48.38],
  ["Salcburk", 13.05, 47.8],
  ["Řezno", 12.1, 49.02],
  ["Landshut", 12.15, 48.54],
  ["Mnichov", 11.58, 48.14],
  ["Pasov", 13.46, 48.57],
  ["Hnězdno", 17.6, 52.53],
  ["Prievidza", 18.62, 48.77],
  ["Martin", 18.92, 49.07],
  ["Krosno", 15.1, 52.05],
  ["Adorf", 12.26, 50.32],
  ["Vídeňské Nové Město", 16.25, 47.81],
];
const NAMEPTS = [...PLACES.map(p => [p.name, p.lo, p.la]), ...TOWNS];
function nameOf(c) {
  let best = null,
    bd = 9;
  for (const [n, lo, la] of NAMEPTS) {
    const d = haversine(c, [lo, la]);
    if (d < bd) {
      bd = d;
      best = n;
    }
  }
  return best;
}
const KXc = 71.5,
  KYc = 111.2;
const MSEG = [];
MOUNTAINS.forEach(ch => {
  for (let i = 0; i < ch.length - 1; i++) MSEG.push([ch[i][0] * KXc, ch[i][1] * KYc, ch[i + 1][0] * KXc, ch[i + 1][1] * KYc]);
});
function nearMountain(lo, la) {
  const x = lo * KXc,
    y = la * KYc;
  for (const [x1, y1, x2, y2] of MSEG) {
    const dx = x2 - x1,
      dy = y2 - y1,
      L = dx * dx + dy * dy;
    let t = L ? ((x - x1) * dx + (y - y1) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    if (Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) < 11) return true;
  }
  return false;
}
function terrain(a, b) {
  const km = haversine(a, b),
    n = Math.max(2, Math.ceil(km / 5));
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const lo = a[0] + ((b[0] - a[0]) * i) / n,
      la = a[1] + ((b[1] - a[1]) * i) / n;
    let f = 1;
    if (nearMountain(lo, la)) f = 2.0;
    else if (FORESTS.some(poly => inPoly(lo, la, poly))) f = 1.7;
    sum += f;
  }
  return sum / (n + 1);
}
const RN = [],
  RADJ = [],
  OFF = 1.4; /* without a road even open country is slower */
function rNode(c) {
  for (let i = 0; i < RN.length; i++) if (haversine(RN[i], c) < 4) return i;
  RN.push(c);
  RADJ.push([]);
  return RN.length - 1;
}
function rLink(i, j, km, eff, road) {
  RADJ[i].push({to: j, km, eff, road});
  RADJ[j].push({to: i, km, eff, road});
}
/* síť cest pro měření trasy se spočítá až při prvním měření (2026-10-25): odhad terénu každého úseku je na startu webu
   nejdražší výpočet jádra (~0,1 s na telefonu) a většina návštěv mapu neměří */
let RSIT = false;
function cestySit() {
  if (RSIT) return;
  RSIT = true;
  for (const [, line] of ROADS)
    for (let i = 0; i < line.length - 1; i++) {
      const a = rNode(line[i]),
        b = rNode(line[i + 1]);
      if (a === b) continue;
      const km = haversine(RN[a], RN[b]) * 1.15,
        t = terrain(RN[a], RN[b]);
      rLink(a, b, km, km * (1 + (t - 1) * 0.35), true);
    }
  for (let i = 0; i < RN.length; i++)
    for (let j = i + 1; j < RN.length; j++) {
      const d = haversine(RN[i], RN[j]);
      if (d < 30 && !RADJ[i].some(e => e.to === j)) {
        const km = d * 1.3;
        rLink(i, j, km, km * terrain(RN[i], RN[j]) * OFF, false);
      }
    }
}
function computeRoute(A, B) {
  cestySit();
  const a = [A.lo, A.la],
    b = [B.lo, B.la],
    N = RN.length,
    ia = N,
    ib = N + 1;
  const coords = [...RN, a, b],
    adj = RADJ.map(l => l.slice());
  adj.push([], []);
  const link = (i, j, km, eff, road) => {
    adj[i].push({to: j, km, eff, road});
    adj[j].push({to: i, km, eff, road});
  };
  for (const [idx, pt] of [
    [ia, a],
    [ib, b],
  ]) {
    RN.map((c, i) => [i, haversine(c, pt)])
      .sort((x, y) => x[1] - y[1])
      .slice(0, 4)
      .forEach(([i, d]) => {
        const km = d * 1.3;
        link(idx, i, km, km * terrain(pt, RN[i]) * OFF, false);
      });
  }
  {
    const d = haversine(a, b),
      km = d * 1.3;
    link(ia, ib, km, km * terrain(a, b) * OFF, false);
  }
  const dist = Array(N + 2).fill(Infinity),
    prev = Array(N + 2).fill(null),
    done = Array(N + 2).fill(false);
  dist[ia] = 0;
  for (;;) {
    let u = -1,
      bd = Infinity;
    for (let i = 0; i < N + 2; i++)
      if (!done[i] && dist[i] < bd) {
        bd = dist[i];
        u = i;
      }
    if (u < 0 || u === ib) break;
    done[u] = true;
    for (const e of adj[u]) {
      const nd = dist[u] + e.eff;
      if (nd < dist[e.to]) {
        dist[e.to] = nd;
        prev[e.to] = {from: u, e};
      }
    }
  }
  const path = [ib],
    legs = [];
  let roadKm = 0,
    offKm = 0;
  let cur = ib;
  while (prev[cur]) {
    const {from, e} = prev[cur];
    if (e.road) roadKm += e.km;
    else offKm += e.km;
    legs.unshift({p0: coords[from], p1: coords[cur], km: e.km, eff: e.eff, road: e.road});
    path.push(from);
    cur = from;
  }
  path.reverse();
  const names = [];
  for (const i of path) {
    const n = i === ia ? A.name : i === ib ? B.name : nameOf(coords[i]);
    if (n && names[names.length - 1] !== n) names.push(n);
  }
  return {
    coords: path.map(i => coords[i]),
    km: Math.round(roadKm + offKm),
    roadKm: Math.round(roadKm),
    offKm: Math.round(offKm),
    eff: dist[ib],
    names,
    legs,
  };
}
function updateRoute() {
  st.route = st.ta && st.tb ? computeRoute(st.ta, st.tb) : null;
}
function renderTravel() {
  const r = document.getElementById("tres");
  tFrom.value = st.ta ? st.ta.name : "";
  tTo.value = st.tb ? st.tb.name : "";
  if (!st.ta || !st.tb || !st.route) {
    r.innerHTML = `<p>${st.ta ? `Odkud: <b>${st.ta.name}</b>. Vyberte cíl.` : "Vyberte dvě sídla na mapě nebo v nabídce."}</p>`;
    return;
  }
  const R = st.route,
    e = R.eff;
  const split =
    R.offKm < 5 ? "celou cestu po stezkách" : R.roadKm < 5 ? "bez stezek, napříč krajinou" : `${R.roadKm} km po stezkách, ${R.offKm} km mimo ně`;
  r.innerHTML = `<p><b>${st.ta.name}</b> → <b>${st.tb.name}</b>: <span class="km">asi ${R.km} km</span> <span class="lbl">(${split})</span></p>
   <p><span class="lbl">Trasa:</span> ${R.names.join(" – ")}</p>
   <div class="tgrid"><div><b>Pěšky</b>${days(e, 30)}</div><div><b>Na koni</b>${days(e, 45)}</div><div><b>S vozem</b>${days(e, 20)}</div><div><b>Posel se střídáním koní</b>${days(e, 90)}</div></div>
   <p class="lbl">${R.roadKm >= 5 ? "Trasa využívá hlavní stezky. " : ""}Úseky mimo cesty, lesem a přes hory se počítají pomaleji; brody, počasí a stav cest odhad nezná.</p>`;
}
function pickPlace(name) {
  const p = placeBy(name);
  if (!p) return;
  if (!st.ta || st.tb) {
    st.ta = p;
    st.tb = null;
  } else if (p.name !== st.ta.name) {
    st.tb = p;
  }
  updateRoute();
  renderTravel();
  drawMap();
}
tFrom.addEventListener("change", () => {
  st.ta = placeBy(tFrom.value);
  updateRoute();
  renderTravel();
  drawMap();
});
tTo.addEventListener("change", () => {
  st.tb = placeBy(tTo.value);
  updateRoute();
  renderTravel();
  drawMap();
});
const dioLeg = document.getElementById("diolegend");
const dioItem = d =>
  `<li><span class="dsw" style="border-color:var(--${d.c});background:var(--${d.c});opacity:.7"></span><b>${d.name}</b> — ${d.note}</li>`;
dioLeg.innerHTML = `<span class="lbl">Církevní správa v zemích Koruny</span><ul>${DIO.filter(d => d.dom)
  .map(dioItem)
  .join("")}</ul><span class="lbl">V sousedních zemích</span><ul>${DIO.filter(d => !d.dom)
  .map(dioItem)
  .join("")}</ul>`;
function toggleBtn(id, key, after) {
  const b = document.getElementById(id);
  b.addEventListener("click", () => {
    st[key] = !st[key];
    b.setAttribute("aria-pressed", st[key]);
    if (after) after();
    drawMap();
  });
}
toggleBtn("lyHolds", "holds");
toggleBtn("lyCities", "cities");
toggleBtn("lyRoads", "roads");
const duchLeg = document.getElementById("duchlegend");
const duchItem = u =>
  `<li><span class="dsw" style="border-color:var(--${u.c});background:var(--${u.c});opacity:.7"></span><b>${u.name}</b>${u.h && byId[u.h] ? ` · <a href="#rod/${u.h}">${byId[u.h].name}</a>` : ""} — ${u.note}</li>`;
duchLeg.innerHTML = `<span class="lbl">Země Koruny české</span><ul>${DUCHY.filter(u => u.dom)
  .map(duchItem)
  .join("")}</ul><span class="lbl">Sousední země a knížectví</span><ul>${DUCHY.filter(u => !u.dom)
  .map(duchItem)
  .join("")}</ul><p class="lbl">Hranice knížectví jsou schematické; drobné enklávy a zástavy nejsou zakresleny.</p>`;
function layerOff(key, btn, leg) {
  if (st[key]) {
    st[key] = false;
    document.getElementById(btn).setAttribute("aria-pressed", false);
    leg.hidden = true;
  }
}
const domLeg = document.getElementById("domlegend");
toggleBtn("lyDio", "dio", () => {
  if (st.dio) {
    layerOff("duchy", "lyDuchy", duchLeg);
    layerOff("dom", "lyDom", domLeg);
    layerOff("kraje", "lyKraje", krajLeg);
  }
  dioLeg.hidden = !st.dio;
});
toggleBtn("lyDuchy", "duchy", () => {
  if (st.duchy) {
    layerOff("dio", "lyDio", dioLeg);
    layerOff("dom", "lyDom", domLeg);
    layerOff("kraje", "lyKraje", krajLeg);
  }
  duchLeg.hidden = !st.duchy;
});
toggleBtn("lyDom", "dom", () => {
  if (st.dom) {
    layerOff("dio", "lyDio", dioLeg);
    layerOff("duchy", "lyDuchy", duchLeg);
    layerOff("kraje", "lyKraje", krajLeg);
  }
  domLeg.hidden = !st.dom;
});
const krajLeg = document.getElementById("krajlegend");
krajLeg.innerHTML = `<span class="lbl">Landfrídy kolem roku 1450</span><ul>${Object.values(LANDFR)
  .map(
    l =>
      `<li><span class="dsw" style="border-color:var(--${l.c});background:var(--${l.c});opacity:.7"></span><b>${l.n}</b> (${KRAJE.filter(
        k => LANDFR[k.lf] === l,
      )
        .map(k => k.n)
        .join(", ")}) — ${l.t}</li>`,
  )
  .join(
    "",
  )}</ul><p class="lbl">Kraje bez barvy vlastní landfríd neměly, nebo není doložen. Hranice krajů jsou schematické – kreslené kolem jejich středů.</p>`;
toggleBtn("lyKraje", "kraje", () => {
  if (st.kraje) {
    layerOff("dio", "lyDio", dioLeg);
    layerOff("duchy", "lyDuchy", duchLeg);
    layerOff("dom", "lyDom", domLeg);
  }
  krajLeg.hidden = !st.kraje;
});
toggleBtn("lyParty", "party");
toggleBtn("lyRings", "rings", () => {
  document.getElementById("ringlegend").hidden = !st.rings || !st.sel || !relsFor(st.sel).length;
});
toggleBtn("lyMeasure", "measure", () => {
  document.getElementById("travel").hidden = !st.measure;
  if (!st.measure) {
    st.ta = null;
    st.tb = null;
    st.route = null;
  }
  renderTravel();
});

/* clicking a holding in the detail panel centres the map on it */
document.addEventListener("click", e => {
  const b = e.target.closest(".plink");
  if (!b) return;
  const f = byId[st.sel];
  if (!f) return;
  const sd = f.seats.find(x => x[0] === b.dataset.place);
  if (!sd) return;
  st.focus = sd[0];
  const [x, y] = P(sd[1], sd[2]);
  mapCenter(x, y, 230);
  renderDetail();
  const m = document.getElementById("map").getBoundingClientRect();
  if (m.bottom < 0 || m.top > innerHeight * 0.6)
    document
      .getElementById("map")
      .scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth", block: "center"});
});

/* clicking a house name anywhere shows its holdings on the map */
document.addEventListener("click", e => {
  const b = e.target.closest(".flink");
  if (!b) return;
  const id = b.dataset.id,
    f = byId[id];
  if (b.closest("#detail") && !f.nomap) {
    show(id);
    return;
  }
  navTo("#rod/" + id);
});

if (matchMedia("(max-width:700px)").matches)
  document.querySelectorAll("details.fold").forEach(d => {
    d.open = false;
  });

/* zoom & pan: wheel, mouse drag, two-finger pinch; full redraw after the gesture settles.
   Během gesta se mapa nekreslí znovu: obaly vrstev (#mapz, #map) se jen posunou a zvětší CSS transformací – prohlížeč
   tak jen přesouvá hotový obraz a nepočítá znovu filtry papíru a inkoustu; drawMapK transformaci zruší a vykreslí nový výřez. */
const mapDrag = {moved: false};
(function () {
  const pts = new Map();
  let last = null,
    drawT = null;
  /* rozměr mapy bez transformace gesta (obal .mapplatno se nehýbe) */
  const mapRect = () => mapPlatno.getBoundingClientRect();
  const curVB = mapVidim;
  /* široká mapa: při změně velikosti okna se výřez přepočítá na nový poměr stran */
  let rsT = null;
  const naVelikost = () => {
    if (curView !== "mapa") return;
    clearTimeout(rsT);
    rsT = setTimeout(() => {
      if (st.vb) st.vb = clampVB(st.vb);
      drawMap();
    }, 150);
  };
  MAPW_MQ.addEventListener("change", naVelikost);
  addEventListener("resize", () => {
    if (mapWide()) naVelikost();
  });
  const clampVB = v => {
    let [x, y, w, h] = v;
    if (mapWide()) return mapFit([x, y, Math.min(MAPWB[2], Math.max(80, w)), Math.max(60, h)]);
    w = Math.min(680, Math.max(80, w));
    h = (w * 605) / 680;
    x = Math.max(-40, Math.min(720 - w, x));
    y = Math.max(-40, Math.min(645 - h, y));
    return [x, y, w, h];
  };
  function setVB(v) {
    st.vb = clampVB(v);
    if (mapKresba.d) mapPosun(st.vb);
    else drawMap();
    clearTimeout(drawT);
    /* s prstem nebo tlačítkem na mapě se překreslí až po delší pauze, po puštění hned (end) */
    drawT = setTimeout(mapDokresli, pts.size ? 450 : 200);
  }
  /* po gestu: posun v nakreslené oblasti zůstane jen posunem, jinak se mapa nakreslí znovu */
  function mapDokresli() {
    clearTimeout(drawT);
    drawT = null;
    const v = mapVidim();
    if (mapLzePosunout(v, mapMeritko(v))) mapPosun(v);
    else drawMap();
  }
  function toUser(cx, cy) {
    const r = mapRect(),
      v = curVB();
    return [v[0] + ((cx - r.left) / r.width) * v[2], v[1] + ((cy - r.top) / r.height) * v[3]];
  }
  function zoomAt(f, ux, uy) {
    const v = curVB(),
      w = v[2] * f,
      h = w * mapAsp();
    setVB([ux - ((ux - v[0]) * w) / v[2], uy - ((uy - v[1]) * h) / v[3], w, h]);
  }
  window.mapZoom = f => {
    const v = curVB();
    zoomAt(f, v[0] + v[2] / 2, v[1] + v[3] / 2);
  };
  window.mapCenter = (x, y, maxW) => {
    const v = curVB(),
      w = Math.min(v[2], maxW),
      h = w * mapAsp();
    st.vb = clampVB([x - w / 2, y - h / 2, w, h]);
    mapDokresli();
  };
  svg.addEventListener(
    "wheel",
    e => {
      e.preventDefault();
      const [ux, uy] = toUser(e.clientX, e.clientY);
      zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, ux, uy);
    },
    {passive: false},
  );
  svg.addEventListener("pointerdown", e => {
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    mapDrag.moved = false;
    last = null;
  });
  svg.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    const r = mapRect(),
      v = curVB();
    if (pts.size === 1 && e.pointerType === "mouse" && e.buttons === 1) {
      const dx = ((e.clientX - prev[0]) / r.width) * v[2],
        dy = ((e.clientY - prev[1]) / r.height) * v[3];
      if (Math.abs(e.clientX - prev[0]) + Math.abs(e.clientY - prev[1]) > 0) {
        mapDrag.moved = mapDrag.moved || Math.hypot(e.clientX - prev[0], e.clientY - prev[1]) > 2;
        if (mapDrag.moved) {
          svg.setPointerCapture(e.pointerId);
          setVB([v[0] - dx, v[1] - dy, v[2], v[3]]);
        }
      }
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()],
        d = Math.hypot(a[0] - b[0], a[1] - b[1]),
        mx = (a[0] + b[0]) / 2,
        my = (a[1] + b[1]) / 2;
      if (last) {
        const [ux, uy] = toUser(mx, my);
        const f = last.d / d;
        const pv = curVB();
        const panx = ((last.mx - mx) / r.width) * pv[2],
          pany = ((last.my - my) / r.height) * pv[3];
        zoomAt(f, ux, uy);
        const nv = curVB();
        setVB([nv[0] + panx, nv[1] + pany, nv[2], nv[3]]);
        mapDrag.moved = true;
      }
      last = {d, mx, my};
    }
  });
  const end = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) last = null;
    if (!pts.size && drawT) {
      clearTimeout(drawT);
      drawT = setTimeout(mapDokresli, 30);
    }
    setTimeout(() => {
      if (!pts.size) mapDrag.moved = false;
    }, 0);
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
})();
document.getElementById("zin").addEventListener("click", () => mapZoom(1 / 1.4));
document.getElementById("zout").addEventListener("click", () => mapZoom(1.4));

const BVLZ = {
  Krvežíznivá:
    "Požehnání: cíl bez Resistance vůči typu zranění zbraně krvácí d4 do ošetření. Pokušení: čepel uvízne v ráně, vytrhnout ji stojí bonusovou akci.",
  Drtivá: "Ignoruje Resistance zbroje proti Bludgeoning.",
  Omračující:
    "Požehnání: cíl hází CON save (SO 8 + proficiency bonus útočníka + STR), jinak je do konce svého příštího tahu bez Reakce a má nevýhodu na útoky. Pokušení: rána sklouzne po zbroji a do svého příštího tahu jsi bez Reakce ty.",
  Ratiště:
    "Když nepřítel vstoupí do dosahu zbraně (10 stop), smí udělat Opportunity Attack. V kontaktu (5 stop) má na útoky nevýhodu. Bonusovou akcí lze zbraň zapřít o zem: dokud se nepohne, Opportunity Attack proti útoku s Vpřed! je automatický kritický zásah a Vpřed! se neuplatní.",
  Ničivá: "Požehnání: zbroj cíle ztrácí jedno obětování. Pokušení: zbraň praská a ztrácí Ničivou až do opravy.",
  Průrazná: "Ignoruje Resistance zbroje proti Piercing.",
  Odvetná:
    "Požehnání: vazba – cíl na tebe do konce svého příštího tahu nemůže použít Reakci; mine-li tě nepřítel útokem na blízko s Pokušením, můžeš Reakcí provést protiútok. Pokušení: čepele se zaklesnou, ztrácíš Reakci.",
  Šikovná: "Před hodem na útok si útočník zvolí typ zranění podle zbraně.",
  Přibodnutí:
    "Požehnání: cíl je hrotem přidržen – do začátku tvého příštího tahu má rychlost 0, ty se nesmíš pohnout. Pokušení: hrot uvízne ve zbroji, cíl ti může Reakcí vytrhnout zbraň (STR save, SO 12).",
  Ostrá: "Při Slashing proti cíli bez Resistance je kritický zásah už na 19–20.",
  Půlmeč: "Bonusovou akcí přehmat zbraně: Piercing útoky získají perk Průrazná, kostka zranění klesne o stupeň (d8 na d6).",
  "Do slabin!":
    "Požehnání: proti Restrained nebo Prone cíli jde o automatický kritický zásah. Pokušení: dýka sklouzne po plátu, další útok proti tobě má výhodu.",
  Strhující:
    "Požehnání: umožňuje strhnout cíl k zemi (cíl hází CON save, zda bude Prone). Pokušení: hák se zasekne v postroji, cíl tě strhne o 5 stop k sobě a může Reakcí zaútočit.",
  "Vpřed!": "Po jízdě aspoň 15 stop rovně se zdvojnásobí kostky zranění (kritický zásah 4×).",
  Štěpící: "Požehnání: zničí štít nepřítele, má-li štít. Pokušení: sekera uvízne ve štítu, cíl ji může Reakcí vytrhnout (STR save, SO 12).",
  Nepřímá: "Projektil letí obloukem: ignoruje bonus polovičního krytu.",
  "Hrom a kouř!":
    "Požehnání: střelce zahalí dým a má na 1 kolo výhodu proti útokům zblízka. Pokušení: zbraň selže a před dalším výstřelem ji musíš vyčistit (bonusová akce); minul-li jsi a u cíle stojí spojenec, zasáhneš spojence; při 1 na d20 a 1 na Závoji zbraň vybuchne (2d8 Fire střelci).",
};
/* malované ikony vlastností zbraní (zv-), typů zranění (zr-) a zbrojí (zb-) – art/img/boj, zadání vyvoj/ikony-boj.md */
const BZVK = {
  Krvežíznivá: "krvezizniva",
  Omračující: "omracujici",
  Ničivá: "niciva",
  Odvetná: "odvetna",
  Přibodnutí: "pribodnuti",
  Nepřímá: "neprima",
  Drtivá: "drtiva",
  Průrazná: "prurazna",
  Šikovná: "sikovna",
  Ostrá: "ostra",
  Půlmeč: "pulmec",
  "Do slabin!": "do-slabin",
  Ratiště: "ratiste",
  Strhující: "strhujici",
  "Vpřed!": "vpred",
  Štěpící: "stepici",
  "Hrom a kouř!": "hrom-a-kour",
};
const BZRT = {
  Bludgeoning: "Drtivé",
  Piercing: "Bodné",
  Slashing: "Sečné",
  Fire: "Ohnivé",
  Cold: "Mrazivé",
  Lightning: "Bleskové",
  Thunder: "Hromové",
  Acid: "Kyselinové",
  Poison: "Jedové",
  Necrotic: "Prokleté",
  Radiant: "Svaté",
  Psychic: "Psychické",
  Force: "Silové",
};
const BZBK = {Vycpávaná: "vycpavana", Kroužková: "krouzkova", Plátová: "platova", Komplexní: "komplexni", Štít: "stit"};
const bik = (f, tip, c) =>
  `<img class="bi bimg bik${c ? " " + c : ""}" src="art/img/boj/${f}-48.webp" srcset="art/img/boj/${f}-48.webp 48w, art/img/boj/${f}-96.webp 96w" sizes="24px" width="24" height="24" alt="${besc(tip)}" aria-label="${besc(tip)}" data-tip="${besc(tip)}" loading="lazy" decoding="async" loading="lazy">`;
const bikZvTip = k => `${k} (perk zbraně): ${BVLZ[k]}`;
const bikZv = k => (BZVK[k] ? bik("zv-" + BZVK[k], `${k} (perk zbraně): ${BVLZ[k]}`, "bik-zv") : "");
const bikZrTip = t =>
  t === "magicke"
    ? "Magické zranění – Resistance a Immunity vůči nemagickým útokům na ně neplatí"
    : t === "stribrne"
      ? "Stříbrné zranění (silvered) – překoná ochranu, kterou má jen obyčejná zbraň"
      : `${BZRT[t]} (${t})`;
const bikZr = t =>
  BZRT[t]
    ? bik("zr-" + t.toLowerCase(), bikZrTip(t), "bik-zr")
    : t === "magicke" || t === "stribrne"
      ? bik("zr-" + t, bikZrTip(t), "bik-zr bik-zr2")
      : "";
const bikZbTip = k => {
  const z = BZBR[k];
  return k === "Štít"
    ? "Štít · bez Resistance · vydrží 1× (obětování při kritickém zásahu)"
    : `${k} zbroj · Resistance ${z[0]} · vydrží ${z[1]} (obětování při kritickém zásahu)`;
};
const bikZb = k => (BZBK[k] ? bik("zb-" + BZBK[k], bikZbTip(k), "bik-zb") : "");
/* zbroj i s medailonky typů zranění, proti kterým dává Resistance */
const bikZbR = k =>
  !BZBK[k] ? "" : `<span class="bikzb">${bikZb(k)}${BZBR[k][0] === "—" ? "" : BZBR[k][0].split(/,\s*/).map(bikZr).join("")}</span>`;
/* typy zranění v textu („Slashing nebo Piercing“, „Svaté (Radiant)“) jako řada medailonků */
const bikZrTxt = t => {
  const r = [],
    x = String(t || "");
  x.replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g, (m, a) => {
    if (!r.includes(a)) r.push(a);
    return m;
  });
  if (!/\b(Necrotic)\b/.test(x) && /prokleté/i.test(x)) r.push("Necrotic");
  if (!/\bRadiant\b/.test(x) && /(^|\s)svaté/i.test(x)) r.push("Radiant");
  const o = r.map(bikZr);
  if (/stříbrn|silvered/i.test(x)) o.push(bikZr("stribrne"));
  if (/magick|magical/i.test(x)) o.push(bikZr("magicke"));
  return o.join("");
};
/* vlastnosti zbraní v textu („dosah 10 stop, Průrazná“) */
const bikZvTxt = t =>
  Object.keys(BZVK)
    .filter(k => new RegExp(`(?<![\\p{L}])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "u").test(String(t || "")))
    .map(bikZv)
    .join("");
