/* ===== Praha: kreslený plán města, hledání, měření – samostatná část „praha“, načte se až na stránce Praha (2026-10-19) ===== */
/*@cast praha{*/
/* ručně kreslené čáry plánu: obrysy bloků, hradeb a toků se jednou při načtení jemně rozvlní (místo filtru,
   který by se při posouvání stránky musel stále přepočítávat); sousední tvary se posunou stejně, takže nevzniknou mezery */
function pRuka(d) {
  const nz = (x, y) => [
    Math.sin(x * 0.21 + y * 0.07) * 0.5 + Math.sin(x * 0.037 - y * 0.11 + 1.7) * 0.45,
    Math.cos(y * 0.19 - x * 0.06) * 0.5 + Math.cos(y * 0.041 + x * 0.09 + 0.4) * 0.45,
  ];
  const pt = ([x, y]) => {
    const [a, b] = nz(x, y);
    return [+(x + a * 0.75).toFixed(1), +(y + b * 0.75).toFixed(1)];
  };
  const line = (r, closed) => {
    const o = [];
    const n = r.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = r[i],
        b = r[(i + 1) % n],
        L = Math.hypot(b[0] - a[0], b[1] - a[1]),
        k = Math.max(1, Math.round(L / 5));
      for (let j = 0; j < k; j++) o.push(pt([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]));
    }
    if (!closed) o.push(pt(r[n - 1]));
    return o;
  };
  const polys = v => v.map(p => p.map(r => line(r, true)));
  ["sm", "nm", "ms", "hc", "w_sm", "w_nm", "w_hc", "w_ms", "w_hrad", "sm_in", "nm_in", "ms_in", "hc_in", "garden", "island"].forEach(k => {
    if (d[k]) d[k] = k === "island" ? d[k].map(r => line(r, true)) : polys(d[k]);
  });
  ["hladova", "botic", "certovka"].forEach(k => {
    if (d[k]) d[k] = line(d[k], false);
  });
  if (d.vys) d.vys = line(d.vys, true);
  return d;
}
function praInit() {
  if (PG) {
    pDraw();
    return;
  }
  document.getElementById("pmap").innerHTML = '<text x="500" y="480" text-anchor="middle" class="rivlbl" font-size="20">Plán se načítá…</text>';
  fetch("art/praha.json")
    .then(r => r.json())
    .then(d => {
      PG = pRuka(d);
      pDraw();
      pList();
    })
    .catch(() => {
      document.getElementById("pmap").innerHTML =
        '<text x="500" y="480" text-anchor="middle" class="rivlbl" font-size="20">Plán se nepodařilo načíst.</text>';
    });
}
/* ilustrace plánu: šířky piktogramů (výška 170 px), stavby [druh, x, pata, výška], stuhy, Židovské Město */
const PBW = {
  kostel: 106,
  katedrala: 118,
  hrad: 157,
  brana: 124,
  radnice: 113,
  klaster: 176,
  kaple: 136,
  mlyn: 219,
  zricenina: 165,
  domy: 229,
  ves: 279,
  "ik-kostel": (135 * 170) / 170,
  "ik-klaster": 191,
  "ik-dum": 140,
  "ik-urad": 145,
  "ik-palac": 183,
  "ik-pivo": 176,
  "ik-lazen": 170,
  "ik-anomalie": 152,
  "pr-betlem": 221 * 0.85,
  "pr-emauzy": 248 * 0.85,
  "pr-hrad": 245 * 0.85,
  "pr-jiri": 264 * 0.85,
  "pr-karlov": 203 * 0.85,
  "pr-karolinum": 170 * 0.85,
  "pr-kraluv-dvur": (374 * 170) / 240,
  "pr-martin": 231 * 0.85,
  "vez-juditina": (41 * 170) / 150,
  "vez-staromestska": (54 * 170) / 200,
  "pr-novomestska-radnice": 210 * 0.85,
  "pr-staromestska-radnice": 140 * 0.85,
  "pr-tyn": 149 * 0.85,
  "pr-vitkov": 225 * 0.85,
  "pr-vysehrad": 275 * 0.85,
};
/* krajina a stavby mimo očíslovaná místa: [druh, x, pata, výška, zrcadlit, jen v celkovém pohledu] */
const PBLD = [
  ["pr-hrad", 284, 214, 62, 0, 1],
  ["pr-vysehrad", 632, 1012, 56, 0, 1],
  ["vez-juditina", 398, 297, 19],
  ["vez-staromestska", 523, 318, 31],
  ["kostel", 733, 783, 22],
  ["ves", 392, 622, 26],
  ["domy", 318, 532, 16],
  ["domy", 585, 901, 12],
  ["ves", 600, 64, 20],
  ["ves", 904, 58, 18],
];
/* ikony míst: vlastní kresba [soubor, výška], jinak obecná podle druhu */
const PICO = {
  1: ["ik-palac", 24],
  2: ["katedrala", 40],
  3: ["pr-jiri", 28],
  7: ["klaster", 30],
  16: ["pr-kraluv-dvur", 34],
  17: ["pr-tyn", 42],
  20: ["pr-staromestska-radnice", 38],
  21: ["pr-karolinum", 30],
  29: ["pr-betlem", 28],
  32: ["ik-dum", 22],
  28: ["ik-dum", 22],
  33: ["kostel", 32],
  34: ["pr-emauzy", 32],
  40: ["pr-martin", 26],
  53: ["zricenina", 28],
  54: ["kaple", 18],
  55: ["ik-dum", 20],
  56: ["pr-vitkov", 46],
  57: ["pr-novomestska-radnice", 34],
  58: ["pr-karlov", 30],
};
const pIco = p =>
  PICO[p.n]
    ? [...PICO[p.n], 1]
    : p.k === "cirkev"
      ? [/[Kk]lášter|Křižovníci|Johanité/.test(p.name) ? "ik-klaster" : "ik-kostel", 26, 1]
      : p.k === "hospoda"
        ? [/[Ll]áze/.test(p.name) ? "ik-lazen" : "ik-pivo", 20, 0]
        : p.k === "anomalie"
          ? ["ik-anomalie", 24, 1]
          : [p.k === "urad" ? "ik-urad" : "ik-dum", 22, 0];
const PRIBT = {kratka: [520, 135, 0.62], stredni: [560, 118, 0.59], dlouha: [600, 129, 0.54]};
const PRIB = {
  hrad: [288, 90, "Pražský hrad", "stredni", 150, 17],
  hc: [118, 302, "Hradčany", "kratka", 124, 15],
  ms: [300, 378, "Malá Strana", "stredni", 150, 17],
  sm: [680, 82, "Staré Město", "stredni", 168, 19],
  zid: [622, 146, "Židovské Město", "kratka", 112, 10],
  nm: [792, 668, "Nové Město", "dlouha", 200, 22],
  vys: [792, 955, "Vyšehrad", "kratka", 124, 16],
};
const PZID = [
  [574, 178],
  [588, 152],
  [611, 130],
  [644, 119],
  [668, 127],
  [673, 160],
  [668, 196],
  [641, 210],
  [606, 206],
  [583, 196],
];
function pPole(g) {
  /* lány na Smíchově a pod Petřínem: jednoduchá deterministická mozaika políček */
  const rnd = i => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const bank = y => {
    const r = PG.river[0][0];
    let best = 1e9;
    for (let a = 0, b = r.length - 1; a < r.length; b = a++) {
      const [x1, y1] = r[b],
        [x2, y2] = r[a];
      if (y1 > y !== y2 > y) {
        const x = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
        if (x < best) best = x;
      }
    }
    return best;
  };
  const P = {a: "", b: "", v: "", m: "", e: ""};
  let i = 0;
  for (let y = 504, row = 0; y < 1240; row++) {
    const rh = 30 + rnd(row * 7.3) * 34,
      tilt = (rnd(row * 3.1) - 0.5) * 16;
    for (let x = -40; x < 480;) {
      i++;
      const w = 34 + rnd(i * 1.7) * 80,
        j = rnd(i),
        yy = y + (tilt * (x + 40)) / 520,
        bx = bank(yy + rh / 2) - 8;
      if (x > bx) {
        break;
      }
      const x2 = Math.min(x + w, bx),
        t = (tilt * w) / 520,
        q = [
          [x, yy],
          [x2, yy + t],
          [x2, yy + t + rh],
          [x, yy + rh],
        ].map(([a, b], n) => [a + (rnd(i * 5 + n) - 0.5) * 3, b + (rnd(i * 9 + n) - 0.5) * 3]);
      x += w;
      if (x2 - q[0][0] < 16) continue;
      const d = "M" + q.map(p => p.map(n => n.toFixed(1)).join(",")).join("L") + "Z";
      const slope = (q[0][0] < 80 && yy < 820) || (yy < 570 && q[0][0] < 250);
      const k = slope ? (j < 0.7 ? "v" : "m") : j < 0.34 ? "a" : j < 0.62 ? "b" : j < 0.8 ? "m" : "e";
      P[k] += d;
    }
    y += rh;
  }
  const S = {stroke: "var(--ink)", "stroke-width": ".45", "stroke-opacity": ".28", "stroke-linejoin": "round"};
  g.appendChild(el("path", {d: P.a, fill: "url(#pfurrow)", ...S}));
  g.appendChild(el("path", {d: P.a, fill: "var(--land2)", "fill-opacity": ".45"}));
  g.appendChild(el("path", {d: P.b, fill: "url(#pfurrow2)", ...S}));
  g.appendChild(el("path", {d: P.b, fill: "var(--hill)", "fill-opacity": ".22"}));
  g.appendChild(el("path", {d: P.v, fill: "var(--tree)", "fill-opacity": ".16", ...S}));
  g.appendChild(el("path", {d: P.v, fill: "url(#pvine)"}));
  g.appendChild(el("path", {d: P.m, fill: "var(--tree)", "fill-opacity": ".1", ...S}));
  g.appendChild(el("path", {d: P.m, fill: "url(#pmeadow)"}));
  g.appendChild(el("path", {d: P.e, fill: "none", ...S}));
  /* stráně za Smíchovem a hájky */
  let d = "",
    h = "",
    t = "";
  const mound = (x, y, w, ht) => {
    d += `M${x - w},${y}Q${x - w * 0.35},${y - ht} ${x},${y - ht}Q${x + w * 0.35},${y - ht} ${x + w},${y}`;
    for (let i = 1; i <= 3; i++) h += `M${(x + (w * i) / 4.2).toFixed(1)},${(y - ht * (1 - i / 4) * 0.92).toFixed(1)}l1.4,${(ht * 0.38).toFixed(1)}`;
  };
  [
    [-12, 600],
    [18, 592],
    [-4, 700],
    [26, 712],
    [-14, 800],
    [16, 790],
  ].forEach(([x, y]) => mound(x, y, 15, 11));
  g.appendChild(el("path", {d, fill: "var(--land)", "fill-opacity": ".6", stroke: "var(--ink)", "stroke-width": ".85", "stroke-opacity": ".75"}));
  g.appendChild(el("path", {d: h, fill: "none", stroke: "var(--ink)", "stroke-width": ".7", "stroke-opacity": ".55"}));
  [
    [150, 700],
    [164, 708],
    [156, 690],
    [250, 770],
    [262, 778],
    [96, 860],
    [110, 866],
    [330, 690],
  ].forEach(([x, y]) => {
    t += `M${x},${y}m-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0M${x},${y + 4}v3`;
  });
  g.appendChild(el("path", {d: t, fill: "var(--tree)", "fill-opacity": ".45", stroke: "var(--ink)", "stroke-width": ".55", "stroke-opacity": ".7"}));
  /* vory u Podskalí */
  let v = "";
  [
    [514, 872, -4],
    [526, 930, 6],
  ].forEach(([x, y, a]) => {
    v += `M${x - 9},${y - 3}h18v6h-18ZM${x - 9},${y - 1}h18M${x - 9},${y + 1}h18`;
  });
  g.appendChild(el("path", {d: v, fill: "var(--road)", "fill-opacity": ".7", stroke: "var(--ink)", "stroke-width": ".5"}));
}
function pOzdoby(g) {
  const IMG = (f, x, y, w, h, fl) => {
    const gi = el("g", {class: "porn"});
    gi.appendChild(
      el("image", {href: PMA + f + ".webp", x, y, width: w, height: h, ...(fl ? {transform: `translate(${2 * x + w} 0) scale(-1 1)`} : {})}),
    );
    g.appendChild(gi);
    return gi;
  };
  const T = (x, y, t, fs, a, cls, st) =>
    g.appendChild(el("text", {x, y, class: cls || "pmer", "font-size": fs, "text-anchor": a || "middle", ...(st ? {style: st} : {})}, t));
  /* kartuš: andělé drží erb Prahy, na pásce jméno města */
  {
    const X = 2,
      Y = 986,
      S = 340 / 820,
      gk = el("g", {class: "porn"});
    const gi = el("g", {transform: `translate(${X} ${Y}) scale(${S.toFixed(4)})`});
    gk.appendChild(gi);
    g.appendChild(gk);
    gi.appendChild(el("image", {href: PMA + "kartus.webp", x: 0, y: 0, width: 820, height: 508}));
    if (CARMS && CARMS["Praha"])
      gi.appendChild(el("image", {href: CARMS["Praha"], x: 348, y: 90, width: 122, height: 150, preserveAspectRatio: "xMidYMid meet"}));
    gi.appendChild(el("text", {x: 410, y: 352, class: "pkart", "font-size": 66, "text-anchor": "middle"}, "Praha"));
    gi.appendChild(el("text", {x: 410, y: 390, class: "pkart2", "font-size": 23, "text-anchor": "middle"}, "čtyři města pražská · 1458"));
  }
  /* měřítko s kružidlem: dílek = 200 pražských loktů (loket ≈ 0,5914 m, jednotka plánu ≈ 4,045 m) */
  {
    const u = (200 * 0.5914) / 4.045,
      Wm = (u * 900) / 70,
      Hm = (Wm * 293) / 900,
      X = 676,
      Y = 1068,
      px = Wm / 900;
    IMG("meritko", X, Y, Wm, Hm);
    const x0 = X + 170 * px,
      yb = Y + 238 * px;
    [0, 2, 4, 6, 8].forEach(i => T(x0 + i * u, yb + 12, String(i * 200), 10.5, "middle", "pmer"));
    T(X + Wm / 2, yb + 25, "loktů pražských", 10.5, "middle", "pmer", "font-style:italic");
  }
}
function pRam(g, vb, s, o) {
  o = o || {};
  const [X, Y, Wv, Hv] = vb,
    C = (o.C || 96) * s,
    m = 3 * s,
    Ch = (C * 306) / 300,
    x0 = X + m,
    y0 = Y + m,
    x1 = X + Wv - m,
    y1 = Y + Hv - m,
    ox = 0.29 * C,
    oy = 0.25 * Ch;
  const lx0 = x0 + ox,
    lx1 = x1 - ox,
    ly0 = y0 + oy,
    ly1 = y1 - oy;
  /* okraj listu za rámem */
  g.appendChild(
    el("path", {
      d: `M${X - 5},${Y - 5}h${Wv + 10}v${Hv + 10}h${-Wv - 10}ZM${lx0},${ly0}V${ly1}H${lx1}V${ly0}Z`,
      fill: "var(--paper)",
      "fill-rule": "evenodd",
      opacity: ".92",
    }),
  );
  const d = `M${lx0 + 0.5 * C},${ly0}H${lx1 - 0.5 * C}M${lx0 + 0.5 * C},${ly1}H${lx1 - 0.5 * C}M${lx0},${ly0 + 0.5 * C}V${ly1 - 0.5 * C}M${lx1},${ly0 + 0.5 * C}V${ly1 - 0.5 * C}`;
  g.appendChild(el("path", {d, fill: "none", stroke: "#3a2614", "stroke-width": (0.052 * C).toFixed(2)}));
  g.appendChild(el("path", {d, fill: "none", stroke: "#d9ab45", "stroke-width": (0.026 * C).toFixed(2)}));
  const i2 = 0.11 * C,
    d2 = `M${lx0 + i2},${ly0 + i2}H${lx1 - i2}V${ly1 - i2}H${lx0 + i2}Z`;
  g.appendChild(el("path", {d: d2, fill: "none", stroke: "var(--kal)", "stroke-width": (0.013 * C).toFixed(2), opacity: ".85"}));
  const gc = el("g", {class: o.cls || "pornf"});
  g.appendChild(gc);
  [
    ["roh-lh", x0, y0],
    ["roh-ph", x1 - C, y0],
    ["roh-ld", x0, y1 - Ch],
    ["roh-pd", x1 - C, y1 - Ch],
  ].forEach(([f, x, y]) => gc.appendChild(el("image", {href: PMA + f + ".webp", x, y, width: C, height: Ch})));
}
function pDraw() {
  const svg = document.getElementById("pmap"),
    vb = pst.vb || PVB0,
    SW0 = svg.getBoundingClientRect().width || 700;
  svg.setAttribute("viewBox", vb.join(" "));
  const s = vb[2] / PVB0[2];
  svg.innerHTML = "";
  const k = Math.max(s, 0.5);
  const R = {x: -200, y: -200, width: 1440, height: 1600};
  const defs = el("defs", {});
  const mkF = (id, freq, scale, oct, seed, extra) => {
    const f = el("filter", {id, filterUnits: "userSpaceOnUse", ...R});
    f.appendChild(el("feTurbulence", {type: "fractalNoise", baseFrequency: freq, numOctaves: oct, seed, result: "n"}));
    f.appendChild(el("feDisplacementMap", {in: "SourceGraphic", in2: "n", scale, xChannelSelector: "R", yChannelSelector: "G", result: "d"}));
    if (extra) extra(f);
    defs.appendChild(f);
  };
  /* ručně kreslené chvění čar: oblast filtru jen kolem kresby skupiny (ne celý list), jinak se plán při posouvání stránky kouše */
  {
    const f = el("filter", {id: "pwob", x: "-2%", y: "-2%", width: "104%", height: "104%"});
    f.appendChild(el("feTurbulence", {type: "fractalNoise", baseFrequency: 0.05, numOctaves: 2, seed: 3, result: "n"}));
    f.appendChild(el("feDisplacementMap", {in: "SourceGraphic", in2: "n", scale: 1.6, xChannelSelector: "R", yChannelSelector: "G"}));
    defs.appendChild(f);
  }
  mkF("pwash", 0.03, 6, 3, 5, f => {
    f.appendChild(el("feGaussianBlur", {in: "d", stdDeviation: 1.4, result: "b"}));
    f.appendChild(el("feTurbulence", {type: "fractalNoise", baseFrequency: 0.08, numOctaves: 2, seed: 11, result: "m"}));
    f.appendChild(el("feColorMatrix", {in: "m", type: "matrix", values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35", result: "ma"}));
    f.appendChild(el("feComposite", {in: "b", in2: "ma", operator: "in"}));
  });
  {
    const f = el("filter", {id: "ppaper", filterUnits: "userSpaceOnUse", ...R});
    f.appendChild(el("feTurbulence", {type: "fractalNoise", baseFrequency: 0.5, numOctaves: 3, seed: 2, result: "n"}));
    f.appendChild(el("feColorMatrix", {in: "n", type: "matrix", values: "0 0 0 0 0.24  0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 -2.2 1.25"}));
    defs.appendChild(f);
    const f2 = el("filter", {id: "pstain", filterUnits: "userSpaceOnUse", ...R});
    f2.appendChild(el("feTurbulence", {type: "fractalNoise", baseFrequency: 0.008, numOctaves: 3, seed: 21, result: "n"}));
    f2.appendChild(el("feColorMatrix", {in: "n", type: "matrix", values: "0 0 0 0 0.45  0 0 0 0 0.33  0 0 0 0 0.16  0 0 0 -3 1.6"}));
    defs.appendChild(f2);
  }
  const rg = el("radialGradient", {id: "pvig", cx: "50%", cy: "50%", r: "72%"});
  rg.appendChild(el("stop", {offset: "58%", "stop-color": "var(--rule)", "stop-opacity": "0"}));
  rg.appendChild(el("stop", {offset: "100%", "stop-color": "var(--hill)", "stop-opacity": ".7"}));
  defs.appendChild(rg);
  /* vinice: řádky krátkých kolíčků */
  {
    const pt = el("pattern", {id: "pvine", patternUnits: "userSpaceOnUse", width: 16, height: 14});
    pt.appendChild(el("path", {d: "M3,2v5M11,9v5", stroke: "var(--tree)", "stroke-width": "1.1", "stroke-linecap": "round", opacity: ".75"}));
    defs.appendChild(pt);
  }
  /* tmavý režim: ozdoby dostanou pod sebe pergamenovou záplatu podle svého obrysu */
  [
    ["pglow", 2.4, 3],
    ["pglowf", 2.4 * s, 3 * s],
  ].forEach(([id, rd, bl]) => {
    const f = el("filter", {id, x: "-20%", y: "-20%", width: "140%", height: "140%"});
    f.appendChild(el("feMorphology", {in: "SourceAlpha", operator: "dilate", radius: rd.toFixed(2), result: "d"}));
    f.appendChild(el("feGaussianBlur", {in: "d", stdDeviation: bl.toFixed(2), result: "b"}));
    f.appendChild(el("feFlood", {"flood-color": "#e9dcb8", "flood-opacity": ".62"}));
    f.appendChild(el("feComposite", {in2: "b", operator: "in", result: "g"}));
    const mg = el("feMerge", {});
    mg.appendChild(el("feMergeNode", {in: "g"}));
    mg.appendChild(el("feMergeNode", {in: "SourceGraphic"}));
    f.appendChild(mg);
    defs.appendChild(f);
  });
  /* pole: úzké lány s brázdami */
  {
    const pt = el("pattern", {id: "pfurrow", patternUnits: "userSpaceOnUse", width: 5, height: 5, patternTransform: "rotate(0)"});
    pt.appendChild(el("path", {d: "M0,2.5h5", stroke: "var(--road)", "stroke-width": ".55", opacity: ".55"}));
    defs.appendChild(pt);
    const pt2 = el("pattern", {id: "pfurrow2", patternUnits: "userSpaceOnUse", width: 5, height: 5, patternTransform: "rotate(90)"});
    pt2.appendChild(el("path", {d: "M0,2.5h5", stroke: "var(--road)", "stroke-width": ".55", opacity: ".55"}));
    defs.appendChild(pt2);
    const pt3 = el("pattern", {id: "pmeadow", patternUnits: "userSpaceOnUse", width: 18, height: 14});
    pt3.appendChild(el("path", {d: "M3,9l1.2,-3l1.2,3M11,4l1.2,-3l1.2,3", fill: "none", stroke: "var(--tree)", "stroke-width": ".7", opacity: ".6"}));
    defs.appendChild(pt3);
  }
  svg.appendChild(defs);
  const G = a => svgG(svg, a && a.filter === "url(#pwob)" ? (({filter, ...b}) => b)(a) : a);
  const path = svPath;
  const ring = r => svLine(r) + "Z";
  svg.appendChild(el("rect", {...R, fill: "var(--land)"}));
  /* zahrady, vinice a stráně */
  {
    const gg = G({filter: "url(#pwash)"}),
      gv = G({filter: "url(#pwob)"});
    PG.garden.forEach(p => {
      gg.appendChild(el("path", {d: path(p), fill: "var(--tree)", "fill-opacity": ".24", "fill-rule": "evenodd"}));
      gv.appendChild(
        el("path", {d: path(p), fill: "url(#pvine)", "fill-rule": "evenodd", stroke: "var(--tree)", "stroke-width": ".7", "stroke-opacity": ".45"}),
      );
    });
  }
  /* Smíchov, Újezd a Podskalí: lány, vinice a louky */
  pPole(G({filter: "url(#pwob)"}));
  /* Vltava */
  {
    const gr = G({filter: "url(#pwash)"});
    PG.river.forEach(p => gr.appendChild(el("path", {d: path(p), fill: "var(--water)", "fill-opacity": ".55"})));
    const gl = G({filter: "url(#pwob)"});
    PG.river.forEach(p => gl.appendChild(el("path", {d: path(p), fill: "none", stroke: "var(--water)", "stroke-width": "1.6"})));
    const q = PG.river[0][0];
    let d = "";
    for (let i = 0; i < 64; i++) {
      const y = 30 + i * 14.5;
      const xs = [];
      for (let a = 0, b = q.length - 1; a < q.length; b = a++) {
        const [x1, y1] = q[b],
          [x2, y2] = q[a];
        if (y1 > y !== y2 > y) xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
      xs.sort((m, n) => m - n);
      for (let j = 0; j + 1 < xs.length; j += 2) {
        const w = xs[j + 1] - xs[j];
        if (w < 26) continue;
        const xm = xs[j] + w * (0.22 + ((i * 53) % 56) / 100);
        d += `M${(xm - 7).toFixed(1)},${y}q3.5,-2.4 7,0t7,0`;
      }
    }
    gl.appendChild(el("path", {d, fill: "none", stroke: "var(--water)", "stroke-width": ".8", opacity: ".7"}));
    if (PG.island) {
      gl.appendChild(el("path", {d: path(PG.island), fill: "var(--land)", stroke: "var(--water)", "stroke-width": "1.2"}));
      gl.appendChild(el("path", {d: path(PG.island), fill: "var(--tree)", "fill-opacity": ".3"}));
    }
  }
  /* cesty z bran */
  {
    const g = G({filter: "url(#pwob)"});
    (PG.roads || []).forEach(rd =>
      g.appendChild(
        el("path", {
          d: "M" + rd.p.map(q => q.join(",")).join("L"),
          fill: "none",
          stroke: "var(--road)",
          "stroke-width": (1.7 * k).toFixed(2),
          "stroke-dasharray": `${7 * k} ${3.5 * k}`,
          "stroke-linecap": "round",
          opacity: ".85",
        }),
      ),
    );
  }
  /* kopce: pahorky jako na starých mapách */
  {
    const g = G({filter: "url(#pwob)"});
    let d = "",
      h = "";
    const mound = (x, y, w, ht) => {
      d += `M${x - w},${y}Q${x - w * 0.35},${y - ht} ${x},${y - ht}Q${x + w * 0.35},${y - ht} ${x + w},${y}`;
      for (let i = 1; i <= 3; i++)
        h += `M${(x + (w * i) / 4.2).toFixed(1)},${(y - ht * (1 - i / 4) * 0.92).toFixed(1)}l1.4,${(ht * 0.38).toFixed(1)}`;
    };
    const H = PG.hills || {};
    (H.letna || []).forEach(([x, y]) => mound(x, y, 14, 10));
    (H.petrin || []).forEach(([x, y]) => mound(x, y, 13, 10));
    (H.vitkov || []).forEach(([x, y]) => mound(x, y, 16, 12));
    g.appendChild(el("path", {d, fill: "var(--land)", "fill-opacity": ".55", stroke: "var(--ink)", "stroke-width": ".85", "stroke-opacity": ".8"}));
    g.appendChild(el("path", {d: h, fill: "none", stroke: "var(--ink)", "stroke-width": ".7", "stroke-opacity": ".6"}));
    if (PG.vys) {
      let c = "";
      for (let y = 916; y <= 1006; y += 7) c += `M${563 - (y > 990 ? 4 : 0)},${y}l-7,3`;
      g.appendChild(el("path", {d: c, stroke: "var(--ink)", "stroke-width": ".8", "stroke-opacity": ".7"}));
    }
  }
  /* Vítkov: Protržení Závoje za palisádou */
  if (PG.vitkov) {
    const V = PG.vitkov,
      [cx, cy] = V.c,
      g = G({filter: "url(#pwob)"});
    {
      const rgV = el("radialGradient", {id: "pvitglow"});
      rgV.appendChild(el("stop", {offset: "0%", "stop-color": "var(--anom)", "stop-opacity": ".55"}));
      rgV.appendChild(el("stop", {offset: "60%", "stop-color": "var(--anom)", "stop-opacity": ".18"}));
      rgV.appendChild(el("stop", {offset: "100%", "stop-color": "var(--anom)", "stop-opacity": "0"}));
      defs.appendChild(rgV);
    }
    g.parentNode.insertBefore(el("ellipse", {cx, cy, rx: V.rx * 1.7, ry: V.ry * 1.9, fill: "url(#pvitglow)", "pointer-events": "none"}), g);
    /* trhlina */
    g.appendChild(
      el("path", {
        d: `M${cx - 22},${cy + 4}L${cx - 12},${cy - 3}L${cx - 6},${cy + 3}L${cx + 2},${cy - 6}L${cx + 8},${cy + 1}L${cx + 16},${cy - 4}L${cx + 24},${cy + 2}`,
        fill: "none",
        stroke: "var(--anom)",
        "stroke-width": "4.5",
        "stroke-linejoin": "round",
        opacity: ".45",
      }),
    );
    g.appendChild(
      el("path", {
        d: `M${cx - 22},${cy + 4}L${cx - 12},${cy - 3}L${cx - 6},${cy + 3}L${cx + 2},${cy - 6}L${cx + 8},${cy + 1}L${cx + 16},${cy - 4}L${cx + 24},${cy + 2}`,
        fill: "none",
        stroke: "var(--paper)",
        "stroke-width": "1.2",
        "stroke-linejoin": "round",
      }),
    );
    /* palisáda: kůly po obvodu */
    let pd = "",
      rl = "";
    const n = Math.round((2 * Math.PI * Math.sqrt((V.rx * V.rx + V.ry * V.ry) / 2)) / 4.2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI,
        x = cx + V.rx * Math.cos(a),
        y = cy + V.ry * Math.sin(a);
      if (Math.hypot(x - V.gate[0], y - V.gate[1]) < 7) continue;
      pd += `M${(x - 1.1).toFixed(1)},${(y + 2).toFixed(1)}v-5l1.1,-2l1.1,2v5Z`;
    }
    g.appendChild(
      el("ellipse", {cx, cy: cy + 1, rx: V.rx, ry: V.ry, fill: "none", stroke: "var(--ink)", "stroke-width": ".7", "stroke-dasharray": "3 1.2"}),
    );
    g.appendChild(el("path", {d: pd, fill: "var(--road)", stroke: "var(--ink)", "stroke-width": ".45"}));
    /* strážnice u vstupu */
    const [gx, gy] = V.gate;
    g.appendChild(el("path", {d: `M${gx - 4},${gy + 4}v-9h8v9Z`, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": ".8"}));
    g.appendChild(
      el("path", {d: `M${gx - 5},${gy - 5}L${gx},${gy - 10}L${gx + 5},${gy - 5}Z`, fill: "var(--proof)", stroke: "var(--ink)", "stroke-width": ".8"}),
    );
    g.appendChild(el("path", {d: `M${gx},${gy - 10}v-6l5,1.5l-5,1.5`, fill: "var(--kal)", stroke: "var(--ink)", "stroke-width": ".5"}));
    /* jiskry anomálií a artefaktů */
    let sp = "";
    [
      [cx - 34, cy - 14],
      [cx + 30, cy - 18],
      [cx - 14, cy + 18],
      [cx + 20, cy + 16],
      [cx + 44, cy + 4],
      [cx - 46, cy + 6],
      [cx - 70, cy - 30],
      [cx + 64, cy + 40],
      [cx - 40, cy + 50],
    ].forEach(([x, y]) => {
      sp += `M${x},${y - 3.2}L${x + 0.9},${y - 0.9}L${x + 3.2},${y}L${x + 0.9},${y + 0.9}L${x},${y + 3.2}L${x - 0.9},${y + 0.9}L${x - 3.2},${y}L${x - 0.9},${y - 0.9}Z`;
    });
    g.appendChild(el("path", {d: sp, fill: "var(--anom)", opacity: ".85"}));
  }
  /* města: ulice jako pergamen uvnitř hradeb, bloky domů v barvě města */
  const TW = [
    ["w_hc", "hc", "var(--phrad)"],
    ["w_hrad", "hc", "var(--phrad)"],
    ["w_ms", "ms", "var(--pmala)"],
    ["w_nm", "nm", "var(--pnove)"],
    ["w_sm", "sm", "var(--pstare)"],
  ];
  {
    const gs = G({filter: "url(#pwob)"});
    TW.forEach(([w]) => (PG[w] || []).forEach(p => gs.appendChild(el("path", {d: ring(p[0]), fill: "var(--paper)"}))));
    const gb = G({filter: "url(#pwob)"});
    const TB = TW.filter(t => t[0] !== "w_hrad");
    TB.forEach(([, b, c]) =>
      gb.appendChild(
        el("path", {
          d: PG[b].map(path).join(""),
          fill: c,
          stroke: "var(--ink)",
          "stroke-width": ".6",
          "stroke-opacity": ".7",
          "stroke-linejoin": "round",
        }),
      ),
    );
    if (PG.w_hrad) {
      const cp = el("clipPath", {id: "phradclip"});
      cp.appendChild(el("path", {d: ring(PG.w_hrad[0][0])}));
      defs.appendChild(cp);
      gb.appendChild(
        el("path", {
          d: PG.hc.map(path).join(""),
          fill: "var(--pphrad)",
          stroke: "var(--ink)",
          "stroke-width": ".6",
          "stroke-opacity": ".7",
          "clip-path": "url(#phradclip)",
        }),
      );
    }
    /* dvory a zahrady uvnitř bloků */
    const ci = TB.map(([, b]) => (PG[b + "_in"] || []).map(path).join("")).join("");
    gb.appendChild(
      el("path", {d: ci, fill: "var(--paper)", "fill-opacity": ".5", stroke: "var(--ink)", "stroke-width": ".3", "stroke-opacity": ".35"}),
    );
    gb.appendChild(el("path", {d: ci, fill: "var(--tree)", "fill-opacity": ".12"}));
    /* domy: příčky po obvodu bloku */
    let td = "";
    TB.forEach(([, b]) =>
      PG[b].forEach(p => {
        const r = p[0];
        let A = 0;
        for (let i = 0, j = r.length - 1; i < r.length; j = i++) A += r[j][0] * r[i][1] - r[i][0] * r[j][1];
        const sg = A > 0 ? 1 : -1;
        for (let i = 0; i < r.length; i++) {
          const a = r[i],
            q = r[(i + 1) % r.length],
            dx = q[0] - a[0],
            dy = q[1] - a[1],
            L = Math.hypot(dx, dy);
          const m = Math.floor(L / 5.2);
          if (m < 1) continue;
          const nx = (-dy / L) * sg,
            ny = (dx / L) * sg;
          for (let t = 1; t <= m; t++) {
            const u = t / (m + 1),
              x = a[0] + dx * u,
              y = a[1] + dy * u;
            td += `M${x.toFixed(1)},${y.toFixed(1)}l${(nx * 3.2).toFixed(1)},${(ny * 3.2).toFixed(1)}`;
          }
        }
      }),
    );
    gb.appendChild(el("path", {d: td, fill: "none", stroke: "var(--ink)", "stroke-width": ".35", "stroke-opacity": ".5"}));
  }
  /* hradby s věžemi */
  {
    const gwl = G({filter: "url(#pwob)"});
    TW.forEach(([w]) =>
      (PG[w] || []).forEach(p => {
        const r = p[0],
          d = ring(r);
        gwl.appendChild(el("path", {d, fill: "none", stroke: "var(--ink)", "stroke-width": (2.8 * k).toFixed(2), "stroke-linejoin": "round"}));
        gwl.appendChild(
          el("path", {
            d,
            fill: "none",
            stroke: "var(--paper)",
            "stroke-width": (1 * k).toFixed(2),
            "stroke-dasharray": `${2 * k} ${2.4 * k}`,
            "stroke-linejoin": "round",
          }),
        );
        let acc = 0,
          td = "";
        for (let i = 1; i <= r.length; i++) {
          const a = r[i - 1],
            b = r[i % r.length];
          acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
          if (acc > 58) {
            acc = 0;
            const z = 2.8 * k;
            td += `M${(b[0] - z).toFixed(1)},${(b[1] - z).toFixed(1)}h${2 * z}v${2 * z}h${-2 * z}Z`;
          }
        }
        gwl.appendChild(el("path", {d: td, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": (1.1 * k).toFixed(2)}));
      }),
    );
  }
  /* Čertovka, jezy a mlýny */
  {
    const g = G({filter: "url(#pwob)"});
    if (PG.certovka)
      g.appendChild(
        el("path", {
          d: "M" + PG.certovka.map(q => q.join(",")).join("L"),
          fill: "none",
          stroke: "var(--water)",
          "stroke-width": "2.6",
          "stroke-linecap": "round",
          opacity: ".85",
        }),
      );
    (PG.weirs || []).forEach(([a, b]) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]),
        n = Math.floor(L / 4);
      let d = `M${a[0]},${a[1]}`;
      for (let i = 1; i <= n; i++) {
        const t = i / n,
          x = a[0] + (b[0] - a[0]) * t,
          y = a[1] + (b[1] - a[1]) * t;
        d += `L${(x + (i % 2 ? 1.6 : -1.6) * (-(b[1] - a[1]) / L)).toFixed(1)},${(y + (i % 2 ? 1.6 : -1.6) * ((b[0] - a[0]) / L)).toFixed(1)}`;
      }
      g.appendChild(el("path", {d, fill: "none", stroke: "var(--ink)", "stroke-width": ".9", opacity: ".75"}));
    });
    (PG.mills || []).forEach(([x, y]) => {
      g.appendChild(el("rect", {x: x - 5, y: y - 3.5, width: 10, height: 7, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": ".8"}));
      g.appendChild(el("circle", {cx: x + 6.5, cy: y, r: 3.2, fill: "none", stroke: "var(--ink)", "stroke-width": ".8"}));
      g.appendChild(el("path", {d: `M${x + 6.5},${y - 3.2}v6.4M${x + 3.3},${y}h6.4`, stroke: "var(--ink)", "stroke-width": ".5"}));
    });
  }
  /* Botič */
  if (PG.botic) {
    const g = G({filter: "url(#pwob)"}),
      d = "M" + PG.botic.map(q => q.join(",")).join("L");
    g.appendChild(
      el("path", {
        d,
        fill: "none",
        stroke: "var(--water)",
        "stroke-width": "3.4",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        opacity: ".8",
      }),
    );
  }
  /* Vyšehrad v troskách */
  if (PG.vys) {
    const g = G({filter: "url(#pwob)"}),
      d = ring(PG.vys);
    g.appendChild(el("path", {d, fill: "var(--phrad)", "fill-opacity": ".5"}));
    g.appendChild(
      el("path", {
        d,
        fill: "none",
        stroke: "var(--ink)",
        "stroke-width": (2.6 * k).toFixed(2),
        "stroke-dasharray": `${16 * k} ${6 * k} ${7 * k} ${9 * k}`,
        "stroke-linejoin": "round",
      }),
    );
    let rb = "";
    [
      [612, 985],
      [630, 975],
      [650, 940],
      [676, 960],
      [590, 990],
      [685, 975],
      [640, 1005],
      [606, 915],
    ].forEach(([x, y], i) => {
      rb += `M${x},${y}l2.5,-1.5l2,2l-1,2.2l-3,.3Z`;
    });
    g.appendChild(el("path", {d: rb, fill: "var(--ink)", opacity: ".55"}));
  }
  /* Hladová zeď a hradby Strahova */
  if (PG.hladova) {
    const g = G({filter: "url(#pwob)"}),
      r = PG.hladova,
      d = "M" + r.map(q => q.join(",")).join("L");
    g.appendChild(el("path", {d, fill: "none", stroke: "var(--ink)", "stroke-width": (2.4 * k).toFixed(2), "stroke-linejoin": "round"}));
    g.appendChild(
      el("path", {d, fill: "none", stroke: "var(--paper)", "stroke-width": (0.9 * k).toFixed(2), "stroke-dasharray": `${2 * k} ${2.4 * k}`}),
    );
    let acc = 0,
      td = "";
    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1],
        b = r[i];
      acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (acc > 38) {
        acc = 0;
        const z = 2.5 * k;
        td += `M${(b[0] - z).toFixed(1)},${(b[1] - z).toFixed(1)}h${2 * z}v${2 * z}h${-2 * z}Z`;
      }
    }
    g.appendChild(el("path", {d: td, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": (1 * k).toFixed(2)}));
  }
  /* Kamenný most: kresba podél linie mostu – pod mostovkou (k jihu) řada oblouků jako při pohledu z boku, na protější straně ledolamy u pilířů */
  {
    const [a, b] = PG.bridge,
      L = Math.hypot(b[0] - a[0], b[1] - a[1]),
      ux = (b[0] - a[0]) / L,
      uy = (b[1] - a[1]) / L;
    /* místní souřadnice: x podél mostu od malostranského konce, y kolmo k jihu */
    const g = G({filter: "url(#pwob)"}),
      m = el("g", {transform: `matrix(${ux.toFixed(5)},${uy.toFixed(5)},${(-uy).toFixed(5)},${ux.toFixed(5)},${a[0]},${a[1]})`});
    g.appendChild(m);
    const hw = 3.5,
      N = 16,
      sp = L / N,
      pw = 1.3,
      fh = 4.6;
    let ice = "",
      face = `M0,${hw}H${L.toFixed(1)}V${hw + fh}H0Z`,
      arch = "",
      pier = "";
    for (let i = 1; i < N; i++) {
      const x = i * sp;
      ice += `M${(x - pw).toFixed(2)},${-hw}L${x.toFixed(2)},${-hw - 2.5}L${(x + pw).toFixed(2)},${-hw}Z`;
    }
    /* oblouk nad vodou má pod sebou vodu, nad břehem zem */
    const inR = (x, y) => {
      let ins = false;
      PG.river.forEach(p =>
        p.forEach(r => {
          for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
            const [xi, yi] = r[i],
              [xj, yj] = r[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
          }
        }),
      );
      return ins;
    };
    let archL = "";
    for (let i = 0; i < N; i++) {
      const x0 = i * sp + (i ? pw : 0),
        x1 = (i + 1) * sp - (i < N - 1 ? pw : 0),
        r = (x1 - x0) / 2,
        xm = (x0 + x1) / 2,
        yy = hw + fh * 0.7;
      const pth = `M${x0.toFixed(2)},${hw + fh}V${(hw + fh - 0.6).toFixed(2)}A${r.toFixed(2)},${(fh - 1.1).toFixed(2)} 0 0 1 ${x1.toFixed(2)},${(hw + fh - 0.6).toFixed(2)}V${hw + fh}Z`;
      if (inR(a[0] + ux * xm - uy * yy, a[1] + uy * xm + ux * yy)) arch += pth;
      else archL += pth;
    }
    m.appendChild(el("path", {d: ice, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": ".6", "stroke-linejoin": "round"}));
    m.appendChild(el("path", {d: face, fill: "var(--paper)", stroke: "var(--ink)", "stroke-width": ".7"}));
    m.appendChild(el("path", {d: arch, fill: "var(--water)", "fill-opacity": ".7", stroke: "var(--ink)", "stroke-width": ".45"}));
    m.appendChild(el("path", {d: archL, fill: "var(--land)", stroke: "var(--ink)", "stroke-width": ".45"}));
    m.appendChild(el("rect", {x: 0, y: -hw, width: L.toFixed(1), height: 2 * hw, fill: "var(--ink)"}));
    m.appendChild(el("rect", {x: 0, y: -hw + 1.4, width: L.toFixed(1), height: 2 * hw - 2.8, fill: "var(--paper)"}));
    let d = "";
    for (let i = 1; i < 12; i++) {
      const x = (L * i) / 12;
      d += `M${x.toFixed(1)},${-hw + 0.1}V${hw - 0.1}`;
    }
    m.appendChild(el("path", {d, stroke: "var(--ink)", "stroke-width": ".7"}));
  }
  /* stavby: iluminované piktogramy kostelů, klášterů, radnic, bran a mlýnů */
  {
    const g = G({class: "porn", "pointer-events": "none"});
    const B = (t, x, b, h, fl) => {
      const w = (h * PBW[t]) / 170;
      g.appendChild(
        el("image", {
          href: PMA + t + ".webp",
          x: (x - w / 2).toFixed(1),
          y: (b - h).toFixed(1),
          width: w.toFixed(1),
          height: h,
          ...(fl ? {transform: `translate(${2 * x} 0) scale(-1 1)`} : {}),
        }),
      );
    };
    (PG.mills || []).forEach(([x, y]) => B("mlyn", x + 2, y + 6, 15));
    const full = s >= 0.62;
    PBLD.forEach(([t, x, b, h, fl, jen]) => {
      if (!jen || full) B(t, x, b, h, fl);
    });
    /* ikony očíslovaných míst: významné vždy, domy, úřady a hospody až po přiblížení; hrad a Vyšehrad v celku kreslí jejich veduta */
    PRAHA_PLACES.forEach(p => {
      const [t, h, vzdy] = pIco(p);
      if (!PBW[t] || (!vzdy && full)) return;
      if (full && ((p.t === "hrad" && p.n <= 6) || p.t === "vys")) return;
      B(t, p.pos[0], p.pos[1] + 6, h);
    });
    (PG.gates || []).forEach(([n, x, y]) => B("brana", x, y + 7, 20));
  }
  /* popisky */
  const L = (x, y, t, cls, fs, rot, st) =>
    svg.appendChild(
      el(
        "text",
        {
          x,
          y,
          class: cls,
          "font-size": (fs * k).toFixed(1),
          "text-anchor": "middle",
          "stroke-width": (3 * k).toFixed(2),
          ...(rot ? {transform: `rotate(${rot} ${x} ${y})`} : {}),
          ...(st ? {style: st} : {}),
        },
        t,
      ),
    );
  L(548, 150, "Vltava", "rivlbl", 19, -52);
  L(476, 720, "Vltava", "rivlbl", 22, -86);
  L(250, 48, "Letná", "rivlbl", 15);
  L(215, 438, "Petřín", "rivlbl", 17);
  L(300, 445, "vinice", "rivlbl", 11);
  const sq = "fill:var(--ink);font-style:italic";
  L(748, 398, "Koňský trh", "rivlbl", 11, 51, sq);
  L(648, 676, "Dobytčí trh", "rivlbl", 11, -88, sq);
  L(PRIB.vys[0], PRIB.vys[1] + 24 * k, "v troskách od roku 1420", "rivlbl", 10, 0, sq);
  L(118, 428, "Hladová zeď", "rivlbl", 11, 24, sq);
  L(70, 352, "Strahov", "rivlbl", 12);
  L(612, 872, "Botič", "rivlbl", 10, -12);
  L(1048, 258, "Vítkov", "maplbl", 15);
  L(1048, 271, "Protržení Závoje · vstup jen s glejtem", "rivlbl", 8.5, 0, "fill:var(--anom);font-style:italic");
  L(640, 50, "Bubny", "rivlbl", 12, 0, sq);
  L(904, 72, "Libeň", "rivlbl", 12, 0, sq);
  L(392, 640, "Smíchov", "rivlbl", 12, 0, sq);
  L(300, 548, "Újezd", "rivlbl", 11, 0, sq);
  L(604, 914, "Podskalí", "rivlbl", 10, 0, sq);
  (PG.roads || []).forEach(rd => {
    if (rd.t && rd.l) L(rd.l[0], rd.l[1], rd.t, "rivlbl", 10, rd.l[2], sq);
  });
  /* Židovské Město: tečkovaná hranice čtvrti */
  {
    const g = G({filter: "url(#pwob)", "pointer-events": "none"});
    g.appendChild(
      el("path", {
        d: "M" + PZID.map(q => q.join(",")).join("L") + "Z",
        fill: "var(--gold)",
        "fill-opacity": ".1",
        stroke: "var(--kal)",
        "stroke-width": (1.3 * k).toFixed(2),
        "stroke-dasharray": `${1.2 * k} ${3 * k}`,
        "stroke-linecap": "round",
      }),
    );
  }
  /* jména měst a čtvrtí na stuhách */
  {
    const g = G({"pointer-events": "none"});
    Object.values(PRIB).forEach(([x, y, t, typ, w, fs]) => {
      w *= k;
      const [iw, ih, cy] = PRIBT[typ],
        h = (w * ih) / iw;
      const gi = el("g", {class: "porn"});
      gi.appendChild(
        el("image", {
          href: PMA + "stuha-" + typ + ".webp",
          x: (x - w / 2).toFixed(1),
          y: (y - h * cy).toFixed(1),
          width: w.toFixed(1),
          height: h.toFixed(1),
        }),
      );
      g.appendChild(gi);
      g.appendChild(el("text", {x, y: (y + fs * k * 0.34).toFixed(1), class: "prib", "font-size": (fs * k).toFixed(1), "text-anchor": "middle"}, t));
    });
  }
  /* ulice a brány – jen při přiblížení */
  if (s < 0.66) {
    PSTREETS.forEach(([t, x, y, r]) => L(x, y, t, "rivlbl", 10.5, r, "fill:var(--ink);font-style:italic;opacity:.85"));
    (PG.gates || []).forEach(([n, x, y]) => L(x, y + 15 * k, n, "rivlbl", 10, 0, "fill:var(--kal);font-style:italic"));
  }
  /* ozdoby plánu: kartuš s erbem a měřítko s kružidlem */
  pOzdoby(G({"pointer-events": "none"}));
  /* měřená cesta */
  if (PM.on && (PM.a || PM.path)) {
    const g = G({});
    if (PM.path) {
      const d = "M" + PM.path.pts.map(q => q[0].toFixed(1) + "," + q[1].toFixed(1)).join("L");
      g.appendChild(
        el("path", {
          d,
          fill: "none",
          stroke: "var(--paper)",
          "stroke-width": (5 * k).toFixed(2),
          "stroke-linejoin": "round",
          "stroke-linecap": "round",
          opacity: ".8",
        }),
      );
      g.appendChild(
        el("path", {
          d,
          fill: "none",
          stroke: "var(--kal)",
          "stroke-width": (2.6 * k).toFixed(2),
          "stroke-dasharray": `${7 * k} ${3.5 * k}`,
          "stroke-linejoin": "round",
          "stroke-linecap": "round",
        }),
      );
    }
    [
      [PM.a, "A"],
      [PM.b, "B"],
    ].forEach(([q, t]) => {
      if (!q) return;
      const [x, y] = q.pt;
      g.appendChild(el("circle", {cx: x, cy: y, r: 7 * k, fill: "var(--kal)", stroke: "var(--paper)", "stroke-width": 1.4 * k}));
      g.appendChild(
        el("text", {x, y: y + 3 * k, "text-anchor": "middle", "font-size": (9 * k).toFixed(1), class: "pmkn", style: "fill:var(--paper)"}, t),
      );
    });
  }
  /* místa: ikony vyznání; v celkovém pohledu se blízká místa slučují do shluků, po přiblížení se odsunou s vodicí čarou */
  const sw0 = SW0,
    pxu = sw0 / vb[2],
    pf = Math.min(1, Math.max(0.74, sw0 / 700)),
    RR = px => (px * pf) / pxu;
  const zoomed = s < 0.62,
    gm = G({}),
    hov = el("g", {"pointer-events": "none"});
  const vis = PRAHA_PLACES.filter(pVis).map(p => {
    const on = pst.sel === p.n,
      r = RR(on ? 13 : zoomed ? 11 : 8.5);
    return {p, on, r, x: p.pos[0], y: p.pos[1], ox: p.pos[0], oy: p.pos[1]};
  });
  let shl = [];
  if (zoomed) {
    for (let it = 0; it < 70; it++) {
      for (let i = 0; i < vis.length; i++)
        for (let j = i + 1; j < vis.length; j++) {
          const a = vis[i],
            b = vis[j];
          let dx = b.x - a.x,
            dy = b.y - a.y,
            dd = Math.hypot(dx, dy);
          const m = a.r + b.r + RR(2);
          if (dd < m) {
            if (dd < 0.01) {
              dx = 1;
              dy = 0.3;
              dd = 1.04;
            }
            const f = (m - dd) / 2 / dd;
            a.x -= dx * f;
            a.y -= dy * f;
            b.x += dx * f;
            b.y += dy * f;
          }
        }
      vis.forEach(v => {
        v.x += (v.ox - v.x) * 0.05;
        v.y += (v.oy - v.y) * 0.05;
      });
    }
  } else {
    const D = RR(25),
      C = [],
      ctr = c => {
        c.x = c.m.reduce((a, v) => a + v.ox, 0) / c.m.length;
        c.y = c.m.reduce((a, v) => a + v.oy, 0) / c.m.length;
      };
    vis.forEach(v => {
      if (v.on) return;
      let c = C.find(c => Math.hypot(c.x - v.ox, c.y - v.oy) < D);
      if (!c) {
        c = {m: []};
        C.push(c);
      }
      c.m.push(v);
      ctr(c);
    });
    for (let ch = true; ch;) {
      ch = false;
      for (let i = 0; i < C.length && !ch; i++)
        for (let j = i + 1; j < C.length; j++)
          if (Math.hypot(C[i].x - C[j].x, C[i].y - C[j].y) < D) {
            C[i].m.push(...C[j].m);
            C.splice(j, 1);
            ctr(C[i]);
            ch = true;
            break;
          }
    }
    shl = C.filter(c => c.m.length > 1);
    shl.forEach(c =>
      c.m.forEach(v => {
        v.cl = c;
        v.x = c.x;
        v.y = c.y;
        v.r = RR(11);
      }),
    );
  }
  const PCH = "#f6eedb";
  const showHov = (x, y, r, t) => {
    hov.innerHTML = "";
    hov.appendChild(
      el(
        "text",
        {x, y: y - r - RR(6), "text-anchor": "middle", class: "plbl", "font-size": RR(13).toFixed(2), "stroke-width": RR(3.4).toFixed(2)},
        t,
      ),
    );
  };
  const hovOn = (g, f) => {
    g.addEventListener("pointerenter", f);
    g.addEventListener("focus", f);
    const off = () => {
      hov.innerHTML = "";
    };
    g.addEventListener("pointerleave", off);
    g.addEventListener("blur", off);
  };
  vis.forEach(v => {
    if (v.cl) return;
    const {p, on, r, x, y} = v,
      col = pcolP(p),
      big = zoomed || on,
      sw = RR(big ? 2 : 1.7);
    const g = el("g", {class: "pmk", tabindex: 0, role: "button", "aria-label": `${p.n}. ${p.name}`});
    if (Math.hypot(x - v.ox, y - v.oy) > r * 0.55) {
      g.appendChild(el("path", {d: `M${v.ox},${v.oy}L${x},${y}`, stroke: col, "stroke-width": RR(1.1)}));
      g.appendChild(el("circle", {cx: v.ox, cy: v.oy, r: RR(2), fill: col}));
    }
    if (on) g.appendChild(el("circle", {cx: x, cy: y, r: r + RR(4), fill: "none", stroke: "var(--gold)", "stroke-width": RR(2.6)}));
    if (p.k === "cirkev")
      g.appendChild(
        el("path", {
          d: `M${x},${y - r}v${-RR(big ? 7 : 5.5)}M${x - RR(2.8)},${y - r - RR(big ? 4.6 : 3.6)}h${RR(5.6)}`,
          stroke: col,
          "stroke-width": RR(1.7),
          "stroke-linecap": "round",
        }),
      );
    if (p.k === "hospoda")
      g.appendChild(el("rect", {x: x - r, y: y - r, width: 2 * r, height: 2 * r, rx: r * 0.3, fill: PCH, stroke: col, "stroke-width": sw}));
    else if (p.k === "anomalie")
      g.appendChild(
        el("path", {
          d: `M${x},${y - r * 1.3}L${x + r * 1.3},${y}L${x},${y + r * 1.3}L${x - r * 1.3},${y}Z`,
          fill: PCH,
          stroke: col,
          "stroke-width": sw,
        }),
      );
    else g.appendChild(el("circle", {cx: x, cy: y, r, fill: PCH, stroke: col, "stroke-width": sw}));
    const ic = FICON[p.c];
    if (ic) {
      const z = r * 1.5;
      g.appendChild(el("image", {href: ic, x: x - z / 2, y: y - z / 2, width: z, height: z}));
      if (big) {
        const br = RR(6.6),
          bx = x + r * 0.82,
          by = y + r * 0.72;
        g.appendChild(el("circle", {cx: bx, cy: by, r: br, fill: col, stroke: PCH, "stroke-width": RR(1.1)}));
        g.appendChild(
          el(
            "text",
            {
              x: bx,
              y: by + br * 0.4,
              "text-anchor": "middle",
              "font-size": (br * (p.n > 9 ? 1.12 : 1.3)).toFixed(2),
              class: "pmkn",
              style: "fill:#fff8ea",
            },
            String(p.n),
          ),
        );
      }
    } else if (p.k === "anomalie")
      g.appendChild(
        el("path", {
          d: (() => {
            const q = r * 0.62;
            return `M${x},${y - q}L${x + q * 0.28},${y - q * 0.28}L${x + q},${y}L${x + q * 0.28},${y + q * 0.28}L${x},${y + q}L${x - q * 0.28},${y + q * 0.28}L${x - q},${y}L${x - q * 0.28},${y - q * 0.28}Z`;
          })(),
          fill: col,
        }),
      );
    else if (big)
      g.appendChild(
        el(
          "text",
          {x, y: y + r * 0.42, "text-anchor": "middle", "font-size": (r * (p.n > 9 ? 1.02 : 1.15)).toFixed(2), class: "pmkn", style: `fill:${col}`},
          String(p.n),
        ),
      );
    else g.appendChild(el("circle", {cx: x, cy: y, r: RR(2.2), fill: col}));
    const go = e => {
      e.stopPropagation();
      if (pDrag.moved) return;
      if (PM.on) pmPick(p.pos, `${p.n}. ${p.name}`, "p:" + p.n);
      else pSel(p.n);
    };
    g.addEventListener("click", go);
    g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(e);
      }
    });
    hovOn(g, () => showHov(x, y, r + (p.k === "cirkev" ? RR(6) : 0), `${p.n}. ${p.name}`));
    gm.appendChild(g);
  });
  /* shluky: kolečko s počtem míst, klepnutím se plán přiblíží */
  shl.forEach(c => {
    const r = RR(11),
      n = c.m.length,
      g = el("g", {class: "pmk pshl", tabindex: 0, role: "button", "aria-label": `${n} míst: ${c.m.map(v => v.p.name).join(", ")}. Přiblížit.`});
    const fs = [...new Set(c.m.map(v => v.p.c).filter(f => FICON[f]))];
    fs.slice(0, 3).forEach((f, i, a) => {
      const ang = ((-90 + (i - (a.length - 1) / 2) * 48) * Math.PI) / 180,
        z = RR(10.5),
        cx = c.x + Math.cos(ang) * r * 1.05,
        cy = c.y + Math.sin(ang) * r * 1.05;
      g.appendChild(el("circle", {cx, cy, r: z * 0.56, fill: PCH, stroke: "#2b2117", "stroke-width": RR(0.9)}));
      g.appendChild(el("image", {href: FICON[f], x: cx - z / 2, y: cy - z / 2, width: z, height: z}));
    });
    g.appendChild(el("circle", {cx: c.x, cy: c.y, r: r + RR(2.4), fill: "none", stroke: "var(--gold)", "stroke-width": RR(1.6)}));
    g.appendChild(el("circle", {cx: c.x, cy: c.y, r, fill: PCH, stroke: "#2b2117", "stroke-width": RR(1.4)}));
    g.appendChild(el("text", {x: c.x, y: c.y + r * 0.36, "text-anchor": "middle", "font-size": (r * 1.12).toFixed(2), class: "pshn"}, String(n)));
    const go = e => {
      e.stopPropagation();
      if (pDrag.moved) return;
      const xs = c.m.map(v => v.ox),
        ys = c.m.map(v => v.oy),
        cx = (Math.min(...xs) + Math.max(...xs)) / 2,
        cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const w = Math.min(560, Math.max(300, (Math.max(...xs) - Math.min(...xs)) * 3.2, ((Math.max(...ys) - Math.min(...ys)) * 3.2) / PAR));
      pst.vb = [cx - w / 2, cy - (w * PAR) / 2, w, w * PAR];
      pDraw();
    };
    g.addEventListener("click", go);
    g.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(e);
      }
    });
    hovOn(g, () => showHov(c.x, c.y, r + RR(10), `${n} míst · klepnutím přiblížit`));
    gm.appendChild(g);
  });
  /* praporec družiny */
  {
    const zd = pst.party && pParty();
    if (zd) {
      const q = PRB[zd.druzina],
        v = vis.find(w => w.p === q) || {x: q.pos[0], y: q.pos[1], r: 5 * k},
        m = 1.15 * k,
        x = v.x + v.r + 3 * k,
        y = v.y + 2 * k;
      const g = el("g", {class: "partymk", tabindex: 0, role: "link", "aria-label": `Družina: ${q.name}. Otevřít zápis.`});
      g.appendChild(el("title", {}, `Družina · ${q.name} · ${zd.date}`));
      g.appendChild(el("rect", {x: x - 4 * m, y: y - 30 * m, width: 24 * m, height: 33 * m, fill: "transparent"}));
      g.appendChild(
        el("path", {d: `M${x},${y}V${y - 26 * m}`, stroke: "var(--ink)", "stroke-width": (1.6 * k).toFixed(2), "stroke-linecap": "round"}),
      );
      g.appendChild(
        el("path", {
          d: `M${x},${y - 26 * m}Q${x + 9 * m},${y - 24 * m} ${x + 18 * m},${y - 21 * m}L${x + 12 * m},${y - 18.5 * m}L${x + 18 * m},${y - 16 * m}Q${x + 9 * m},${y - 17 * m} ${x},${y - 15 * m}Z`,
          fill: "var(--kal)",
          stroke: "var(--paper)",
          "stroke-width": (1 * k).toFixed(2),
          "stroke-linejoin": "round",
        }),
      );
      g.appendChild(el("circle", {cx: x, cy: y - 27.5 * m, r: 1.8 * m, fill: "var(--gold)"}));
      const go = e => {
        e.stopPropagation();
        if (pDrag.moved) return;
        location.hash = "#kronika/" + zd.id;
      };
      g.addEventListener("click", go);
      g.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") go(e);
      });
      gm.appendChild(g);
    }
  }
  svg.appendChild(el("rect", {...R, filter: "url(#pstain)", opacity: ".2", "pointer-events": "none"}));
  svg.appendChild(el("rect", {...R, filter: "url(#ppaper)", opacity: ".22", "pointer-events": "none"}));
  svg.appendChild(el("rect", {x: vb[0], y: vb[1], width: vb[2], height: vb[3], fill: "url(#pvig)", "pointer-events": "none"}));
  pRam(G({"pointer-events": "none"}), vb, s);
  svg.appendChild(hov);
}
function pParty() {
  if (HRA && (HRA.misto || HRA.praha)) {
    if (!HRA.praha || !PRB[HRA.praha] || (HRA.misto && HRA.misto !== "Praha")) return null;
    const L = ZAPISY[ZAPISY.length - 1];
    return Object.assign({id: "", n: "", title: ""}, L || {}, {druzina: HRA.praha});
  }
  return [...ZAPISY].reverse().find(z => z.druzina && PRB[z.druzina]);
}
function pDetail() {
  const d = document.getElementById("pdetail"),
    p = PRB[pst.sel];
  if (!p) {
    d.classList.add("empty");
    d.innerHTML = `<span class="lbl">Čtyři města pražská</span><p>Vyberte číslo na plánu nebo místo ze seznamu pod ním.</p>${PRAHA_TOWNS.map(t => `<p><b>${t.n}.</b> ${t.d}</p>`).join("")}`;
    autolink(d, "");
    return;
  }
  d.classList.remove("empty");
  const t = PRAHA_TOWNS.find(x => x.id === p.t),
    f = p.r && byId[p.r];
  d.innerHTML = `<span class="lbl">${t.n} · ${PKIND[p.k]} · č. ${p.n}</span>
   <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><h3 style="font-size:1.35rem">${p.name}</h3>${p.c && FICON[p.c] ? faith(p.c) : ""}</div>
   <img class="ppik" src="${PMA + pIco(p)[0]}.webp" alt="" loading="lazy">
   <p>${p.d}</p>
   ${(() => {
     const zd = pParty();
     return zd && zd.druzina === p.n
       ? `<p class="pparty"><b style="color:var(--kal)">⚑</b> Zde se právě nachází družina${zd.id ? ` – <a href="#kronika/${zd.id}">${zd.n}: ${zd.title}</a>` : ""}.</p>`
       : "";
   })()}
   ${f || p.p ? `<dl class="kv">${f ? `<dt>Rod</dt><dd><a href="#rod/${f.id}">${ARMS[f.id] ? armsImg(f, "armsmall") : ""}${f.name}</a></dd>` : ""}${p.p && PBY[p.p] ? `<dt>Osoba</dt><dd><a href="#osoba/${p.p}">${PBY[p.p].n.replace(/^✦\s*/, "")}</a></dd>` : ""}</dl>` : ""}
   ${
     ZAPISY.some(z => (z.praha || []).includes(p.n))
       ? `<span class="lbl">V kronice</span><p>${ZAPISY.filter(z => (z.praha || []).includes(p.n))
           .map(z => `<a href="#kronika/${z.id}">${z.n}: ${z.title}</a>`)
           .join(", ")}</p>`
       : ""
   }
   <button type="button" class="backbtn" id="pclear">Zpět na přehled</button>`;
  autolink(d.querySelector("p"), f ? "#rod/" + f.id : "");
  document.getElementById("pclear").addEventListener("click", () => pSel(null));
}
function pFilt() {
  document.querySelectorAll("#plist .plist button[data-pn]").forEach(b => {
    const p = PRB[+b.dataset.pn];
    b.parentNode.hidden = !p || !pVis(p);
  });
  document.querySelectorAll("#plist .pgrp").forEach(g => (g.hidden = ![...g.querySelectorAll("li")].some(l => !l.hidden)));
}
document.querySelectorAll("[data-pconf]").forEach(b =>
  b.addEventListener("click", () => {
    pst.conf = b.dataset.pconf;
    document.querySelectorAll("[data-pconf]").forEach(x => x.setAttribute("aria-pressed", x === b));
    if (PG) {
      pDraw();
      pFilt();
    }
  }),
);
document.getElementById("pParty").addEventListener("click", e => {
  pst.party = !pst.party;
  e.currentTarget.setAttribute("aria-pressed", pst.party);
  if (PG) pDraw();
});
document.querySelectorAll("[data-pkind]").forEach(b =>
  b.addEventListener("click", () => {
    pst.kind = b.dataset.pkind;
    document.querySelectorAll("[data-pkind]").forEach(x => x.setAttribute("aria-pressed", x === b));
    if (PG) {
      pDraw();
      pFilt();
    }
  }),
);
function pSel(n, center) {
  pst.sel = n;
  if (n && center) {
    const [x, y] = PRB[n].pos;
    const w = 420,
      h = w * PAR;
    pst.vb = [Math.max(-100, Math.min(1100 - w, x - w / 2)), Math.max(-60, Math.min(1240 - h, y - h / 2)), w, h];
  }
  pDraw();
  pDetail();
  document.querySelectorAll(".plist button").forEach(b => b.classList.toggle("on", +b.dataset.pn === n));
}
function pList() {
  document.getElementById("plist").innerHTML = PRAHA_TOWNS.map(
    t =>
      `<section class="pgrp"><h3 class="landh">${t.n.toUpperCase()}</h3><ol class="plist">${PRAHA_PLACES.filter(p => p.t === t.id)
        .map(
          p =>
            `<li><button type="button" data-pn="${p.n}"><span class="pnum${p.k === "hospoda" ? " sq" : p.k === "anomalie" ? " dia" : ""}" style="border-color:${pcolP(p)};color:${pcolP(p)}">${p.k === "anomalie" ? `<i>${p.n}</i>` : p.n}</span>${p.k === "cirkev" ? `<span class="pcross" style="color:${pcol(p.c)}">✝</span>` : ""}${p.name}${FICON[p.c] ? `<img class="pfico" src="${FICON[p.c]}" alt="${CONFN[p.c] || ""}" title="${CONFN[p.c] || ""}">` : ""}</button></li>`,
        )
        .join("")}</ol></section>`,
  ).join("");
  pFilt();
  document.querySelectorAll(".plist button").forEach(b =>
    b.addEventListener("click", () => {
      pSel(+b.dataset.pn, true);
      document.getElementById("pmapbox").scrollIntoView({block: "start", behavior: "smooth"});
    }),
  );
  pDetail();
}
/* ---------- Praha: měření cesty pěšky po ulicích ----------
   Plán se převede na mřížku (1 jednotka ≈ 4 m): domy, řeka a hradby jsou nepropustné,
   brány, most a průchody propustné; cesta se hledá algoritmem A*. */
const PM = {on: false, a: null, b: null, path: null, grid: null};
const PMU = 4.045; /* metrů na jednotku plánu (podle délky Kamenného mostu) */
function pmGrid() {
  if (PM.grid) return PM.grid;
  const X0 = PVB0[0],
    Y0 = PVB0[1],
    W = PVB0[2],
    H = PVB0[3],
    c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.fillRect(0, 0, W, H);
  g.translate(-X0, -Y0);
  const poly = rs => {
    g.beginPath();
    rs.forEach(r => {
      r.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      g.closePath();
    });
  };
  const line = pts => {
    g.beginPath();
    pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  };
  g.fillStyle = "#000";
  g.strokeStyle = "#000";
  PG.river.forEach(p => {
    poly(p);
    g.fill("evenodd");
  });
  ["sm", "nm", "ms", "hc"].forEach(k =>
    PG[k].forEach(p => {
      poly([p[0]]);
      g.fill();
    }),
  );
  g.lineWidth = 2.6;
  ["w_sm", "w_nm", "w_ms", "w_hc", "w_hrad"].forEach(k =>
    (PG[k] || []).forEach(p => {
      poly([p[0]]);
      g.stroke();
    }),
  );
  if (PG.hladova) {
    line(PG.hladova);
    g.stroke();
  }
  if (PG.vitkov) {
    const V = PG.vitkov;
    g.beginPath();
    g.ellipse(V.c[0], V.c[1] + 1, V.rx, V.ry, 0, 0, 7);
    g.stroke();
  }
  g.fillStyle = "#fff";
  g.strokeStyle = "#fff";
  g.lineWidth = 6;
  line(PG.bridge);
  g.stroke();
  [...(PG.gates || []).map(q => [q[1], q[2]]), ...(PG.openings || []), ...(PG.vitkov ? [PG.vitkov.gate] : [])].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 6, 0, 7);
    g.fill();
  });
  g.lineWidth = 3;
  (PG.lanes || []).forEach(l => {
    line(l);
    g.stroke();
  });
  const d = g.getImageData(0, 0, W, H).data,
    m = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) m[i] = d[i * 4] > 127 ? 1 : 0;
  return (PM.grid = {m, W, H, X0, Y0});
}
function pmRoute(A, B) {
  const {m, W, H, X0, Y0} = pmGrid();
  const snap = ([x, y]) => {
    const cx = Math.round(x - X0),
      cy = Math.round(y - Y0);
    for (let r = 0; r < 60; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const X = cx + dx,
            Y = cy + dy;
          if (X >= 0 && Y >= 0 && X < W && Y < H && m[Y * W + X]) return Y * W + X;
        }
    return -1;
  };
  const s = snap(A),
    t = snap(B);
  if (s < 0 || t < 0) return null;
  const tx = t % W,
    ty = (t / W) | 0,
    N = W * H,
    gS = new Float32Array(N).fill(Infinity),
    prev = new Int32Array(N).fill(-1),
    closed = new Uint8Array(N);
  const hx = i => {
    const dx = Math.abs((i % W) - tx),
      dy = Math.abs(((i / W) | 0) - ty);
    return Math.max(dx, dy) + 0.4142 * Math.min(dx, dy);
  };
  let hi = [],
    hf = [];
  const push = (i, f) => {
    hi.push(i);
    hf.push(f);
    let c = hi.length - 1;
    while (c > 0) {
      const p = (c - 1) >> 1;
      if (hf[p] <= hf[c]) break;
      [hi[p], hi[c]] = [hi[c], hi[p]];
      [hf[p], hf[c]] = [hf[c], hf[p]];
      c = p;
    }
  };
  const pop = () => {
    const r = hi[0],
      li = hi.pop(),
      lf = hf.pop();
    if (hi.length) {
      hi[0] = li;
      hf[0] = lf;
      let c = 0;
      for (;;) {
        const a = 2 * c + 1,
          b = a + 1;
        let mi = c;
        if (a < hi.length && hf[a] < hf[mi]) mi = a;
        if (b < hi.length && hf[b] < hf[mi]) mi = b;
        if (mi === c) break;
        [hi[mi], hi[c]] = [hi[c], hi[mi]];
        [hf[mi], hf[c]] = [hf[c], hf[mi]];
        c = mi;
      }
    }
    return r;
  };
  const D = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, 1.4142],
    [1, -1, 1.4142],
    [-1, 1, 1.4142],
    [-1, -1, 1.4142],
  ];
  gS[s] = 0;
  push(s, hx(s));
  let found = false;
  while (hi.length) {
    const u = pop();
    if (closed[u]) continue;
    closed[u] = 1;
    if (u === t) {
      found = true;
      break;
    }
    const ux = u % W,
      uy = (u / W) | 0;
    for (const [dx, dy, c] of D) {
      const X = ux + dx,
        Y = uy + dy;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const v = Y * W + X;
      if (!m[v] || closed[v]) continue;
      if (dx && dy && (!m[uy * W + X] || !m[Y * W + ux])) continue;
      const ng = gS[u] + c;
      if (ng < gS[v]) {
        gS[v] = ng;
        prev[v] = u;
        push(v, ng + hx(v));
      }
    }
  }
  if (!found) return null;
  const pts = [];
  for (let u = t; u >= 0; u = prev[u]) pts.push([(u % W) + X0, ((u / W) | 0) + Y0]);
  pts.reverse();
  const rdp = (P, e) => {
    if (P.length < 3) return P;
    const [a, b] = [P[0], P[P.length - 1]];
    let md = 0,
      mi = 0;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    for (let i = 1; i < P.length - 1; i++) {
      const d = Math.abs((b[0] - a[0]) * (a[1] - P[i][1]) - (a[0] - P[i][0]) * (b[1] - a[1])) / L;
      if (d > md) {
        md = d;
        mi = i;
      }
    }
    return md > e ? [...rdp(P.slice(0, mi + 1), e).slice(0, -1), ...rdp(P.slice(mi), e)] : [a, b];
  };
  return {pts: [A, ...rdp(pts, 1.2), B], len: gS[t]};
}
const pmMin = (m, kmh) => {
  const t = m / ((kmh * 1000) / 60);
  if (t < 1) return "necelá minuta";
  if (t < 60) {
    const n = Math.round(t);
    return `asi ${n} ${n === 1 ? "minuta" : n < 5 ? "minuty" : "minut"}`;
  }
  const h = Math.floor(t / 60),
    mm = Math.round(t % 60);
  return `asi ${h} h${mm ? ` ${mm} min` : ""}`;
};
function pmRender() {
  const r = document.getElementById("ptres"),
    F = document.getElementById("pfrom"),
    T = document.getElementById("pto");
  F.value = PM.a ? PM.a.key : "";
  T.value = PM.b ? PM.b.key : "";
  if (!PM.a || !PM.b) {
    r.innerHTML = `<p>${PM.a ? `Odkud: <b>${PM.a.name}</b>. Vyberte cíl.` : "Klikněte na plánu na dvě místa (číslo nebo libovolný bod), nebo je vyberte v nabídce."}</p>`;
    return;
  }
  const P = PM.path,
    straight = Math.hypot(PM.a.pt[0] - PM.b.pt[0], PM.a.pt[1] - PM.b.pt[1]);
  const m = P ? P.len * PMU : straight * 1.3 * PMU,
    lok = Math.round(m / 0.5914 / 10) * 10,
    mr = m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;
  r.innerHTML = `<p><b>${PM.a.name}</b> → <b>${PM.b.name}</b>: <span class="km">asi ${mr}</span> <span class="lbl">(${lok.toLocaleString("cs")} loktů${P ? ", ulicemi a branami" : ", odhad – cesta se nenašla"})</span></p>
   <div class="tgrid"><div><b>Pěšky</b>${pmMin(m, 4)}</div><div><b>Spěchem</b>${pmMin(m, 6)}</div><div><b>Na koni</b>${pmMin(m, 7)}</div><div><b>Běžící posel</b>${pmMin(m, 9)}</div></div>
   <p class="lbl">Počítá se cesta ulicemi, přes brány a Kamenný most. Tlačenice na trzích, zavřené brány po klekání ani stráže odhad nezná.</p>`;
}
function pmPick(pt, name, key) {
  if (!PM.a || PM.b) {
    PM.a = {pt, name, key: key || ""};
    PM.b = null;
    PM.path = null;
  } else {
    PM.b = {pt, name, key: key || ""};
    PM.path = pmRoute(PM.a.pt, PM.b.pt);
  }
  pmRender();
  pDraw();
}
{
  const sel = [...PRAHA_PLACES.map(p => [`p:${p.n}`, `${p.n}. ${p.name}`]), ["", ""]];
  const opts = `<option value="">— bod na plánu —</option>` + PRAHA_PLACES.map(p => `<option value="p:${p.n}">${p.n}. ${p.name}</option>`).join("");
  ["pfrom", "pto"].forEach((id, i) => {
    const e = document.getElementById(id);
    e.innerHTML = opts;
    e.addEventListener("change", () => {
      const p = PRB[+e.value.slice(2)];
      if (!p || !PG) return;
      const q = {pt: p.pos, name: `${p.n}. ${p.name}`, key: e.value};
      if (i === 0) {
        PM.a = q;
      } else {
        PM.b = q;
      }
      if (PM.a && PM.b) PM.path = pmRoute(PM.a.pt, PM.b.pt);
      pmRender();
      pDraw();
    });
  });
  const btn = document.getElementById("pmeasure");
  btn.addEventListener("click", () => {
    PM.on = !PM.on;
    btn.setAttribute("aria-pressed", PM.on);
    document.getElementById("pmap").classList.toggle("measuring", PM.on);
    document.getElementById("ptravel").hidden = !PM.on;
    if (!PM.on) {
      PM.a = PM.b = PM.path = null;
    }
    pmRender();
    if (PG) pDraw();
  });
  document.getElementById("pmap").addEventListener("click", e => {
    if (!PM.on || !PG || e.altKey || pDrag.moved || e.target.closest(".pmk,.partymk")) return;
    const sv = e.currentTarget,
      p = sv.createSVGPoint();
    p.x = e.clientX;
    p.y = e.clientY;
    const q = p.matrixTransform(sv.getScreenCTM().inverse());
    pmPick([q.x, q.y], "bod na plánu", "");
  });
}
const pDrag = {moved: false};
(function () {
  const svg = document.getElementById("pmap");
  const cur = () => pst.vb || PVB0;
  const clamp = v => {
    const w = Math.max(160, Math.min(1240, v[2])),
      h = w * PAR;
    return [Math.max(-150, Math.min(1190 - w, v[0])), Math.max(-120, Math.min(1300 - h, v[1])), w, h];
  };
  const toSvg = (cx, cy) => {
    const r = svg.getBoundingClientRect(),
      v = cur();
    return [v[0] + ((cx - r.left) / r.width) * v[2], v[1] + ((cy - r.top) / r.height) * v[3]];
  };
  let raf = 0;
  const redraw = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      svg.setAttribute("viewBox", cur().join(" "));
      clearTimeout(pDrag.t);
      pDrag.t = setTimeout(pDraw, 120);
    });
  };
  window.pZoom = (f, cx, cy) => {
    const v = cur();
    const [px, py] = cx == null ? [v[0] + v[2] / 2, v[1] + v[3] / 2] : toSvg(cx, cy);
    const w = v[2] * f,
      h = w * PAR;
    pst.vb = clamp([px - ((px - v[0]) * w) / v[2], py - ((py - v[1]) * h) / v[3], w, h]);
    redraw();
  };
  svg.addEventListener(
    "wheel",
    e => {
      if (!PG) return;
      e.preventDefault();
      pZoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    },
    {passive: false},
  );
  const pts = new Map();
  let last = null,
    start = null;
  svg.addEventListener("pointerdown", e => {
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    start = [e.clientX, e.clientY];
    pDrag.moved = false;
    last = null;
  });
  svg.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pts.size === 1) {
      if (Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 5) {
        pDrag.moved = true;
        if (!svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId);
      }
      if (!pDrag.moved) return;
      const r = svg.getBoundingClientRect(),
        v = cur();
      pst.vb = clamp([v[0] - ((e.clientX - prev[0]) / r.width) * v[2], v[1] - ((e.clientY - prev[1]) / r.height) * v[3], v[2], v[3]]);
      redraw();
    } else if (pts.size === 2) {
      pDrag.moved = true;
      const [a, b] = [...pts.values()],
        d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (last) pZoom(last / d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      last = d;
    }
  });
  const end = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) last = null;
    setTimeout(() => {
      if (!pts.size) pDrag.moved = false;
    }, 0);
  };
  svg.addEventListener("pointerup", end);
  svg.addEventListener("pointercancel", end);
  document.getElementById("pzin").addEventListener("click", () => pZoom(1 / 1.4));
  document.getElementById("pzout").addEventListener("click", () => pZoom(1.4));
  document.getElementById("preset").addEventListener("click", () => {
    pst.vb = null;
    pDraw();
  });
  svg.addEventListener("click", e => {
    if (!PM.on && !pDrag.moved && !e.target.closest(".pmk") && pst.sel) pSel(null);
  });
})();
/*@cast}*/
