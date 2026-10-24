/* ===== Nebeské bojiště (2026-10-25): vzdušný boj draků na sdílené obrazovce vypravěče – samostatná část „nebe“, načte se až na stránce #nebe ===== */
/*@cast nebe{*/
/* Pravidla počítá čistý soubor 10n-nebe.js; tady je jen stav kola, kresba desky a ovládání. První verze: jedna obrazovka
   (vypravěčův počítač u televize), bez databáze – stav drží prohlížeč (localStorage, pohodlí jednoho zařízení).
   Kolo: Uzamčení manévrů nepřátel → Porada družiny nad hodinami (náhled dráhy) → Odhalení (Závoj, Noční oči) → současný
   pohyb → Konec kola (překryv, Napětí, útoky draků a posádka z konečných pozic). */
const NB_LS = "mm-nebe";
const NB_FAZE = {
  priprava: "Příprava",
  rozkazy: "Uzamčení manévrů nepřátel",
  porada: "Porada družiny",
  odhaleni: "Odhalení",
  pohyb: "Pohyb",
  konec: "Konec kola",
};
let NB = null;
let NBANIM = null;

function nbVychozi() {
  return {
    kolo: 1,
    faze: "priprava",
    noc: false,
    porada: 60,
    draci: [
      {id: "s", pl: "soumracnik", jm: "Soumračník", strana: "d", x: 450, y: 760, u: 0, h: 2, nap: 0, zr: {}},
      {id: "l", pl: "korutansky_lindwurm", jm: "Korutanský lindwurm", strana: "n", x: 450, y: 140, u: 180, h: 2, nap: 0, zr: {}},
    ],
    vyber: "s",
    log: [],
  };
}
function nbNacti() {
  try {
    NB = JSON.parse(localStorage.getItem(NB_LS) || "null");
  } catch (e) {
    NB = null;
  }
  if (!NB || !Array.isArray(NB.draci)) NB = nbVychozi();
  /* rozehraný pohyb po obnovení stránky (dráhy se neukládají): vrátit draky před pohyb a znovu k odhalení */
  if (NB.faze === "pohyb" && NB.pred) {
    for (const p of NB.pred) Object.assign(nbDrak(p.id) || {}, p);
    NB.faze = "odhaleni";
  }
}
function nbUloz() {
  try {
    localStorage.setItem(NB_LS, JSON.stringify({...NB, tik: undefined, drahy: undefined}));
  } catch (e) {}
}
const nbDrak = id => NB.draci.find(d => d.id === id);
const nbK = d => nebeKarta(d.pl, {h: d.h, zr: d.zr});
const nbZr = d => ({...d.zr, hlava: d.zr.hlava === NB.kolo});
const nbLog = t => NB.log.unshift(`Kolo ${NB.kolo}: ${t}`);
function nbRozkazText(r) {
  if (!r) return "—";
  if (r.m === "nalet") return `Nálet o ${r.p || 1} hl. (rovně ${(r.p || 1) + 1})`;
  const smer = r.s ? (r.s === "L" ? " vlevo" : " vpravo") : "",
    rych = r.m === "viseni" ? "" : " " + r.r,
    vys = r.m === "stoupani" ? " (+2 hl.)" : r.v === 1 ? ", stoupá o 1" : r.v === -1 ? ", klesá o 1" : "";
  return `${NEBE_MANEVRY[r.m].n}${smer}${rych}${vys}`;
}
const nbBarvaJm = {z: "zelený", b: "bílý", c: "červený"};

/* ---- deska ---- */
function nbDrakSvg(d, P, cls) {
  const K = nbK(d),
    b = K.zaklad,
    R = b / 2 + NEBE_PASMO,
    h = Math.round(P.h),
    st = 8 + h * 9,
    oznac = NB.vyber === d.id ? " nbsel" : "";
  return `<g class="nbstin" transform="translate(${P.x + st},${P.y + st})" opacity="${0.45 - h * 0.07}"><rect x="${-b / 2}" y="${-b / 2}" width="${b}" height="${b}" rx="6" transform="rotate(${P.u})"/></g>
    <g class="nbdrak nb${d.strana}${oznac}${cls || ""}" data-nbdrak="${d.id}" transform="translate(${P.x},${P.y}) rotate(${P.u})">
      <path class="nboblouk" d="M0 0 L${-R * 0.7071} ${-R * 0.7071} A${R} ${R} 0 0 1 ${R * 0.7071} ${-R * 0.7071} Z"/>
      <rect x="${-b / 2}" y="${-b / 2}" width="${b}" height="${b}" rx="6"/>
      <path class="nbnos" d="M${-b / 4} ${-b / 2 + 4} L0 ${-b / 2 - 10} L${b / 4} ${-b / 2 + 4} Z"/>
      <line x1="${-b / 2}" y1="${-b / 2}" x2="${-b / 2 - 8}" y2="${-b / 2 - 8}"/><line x1="${b / 2}" y1="${-b / 2}" x2="${b / 2 + 8}" y2="${-b / 2 - 8}"/>
    </g>
    <g class="nbstitek" transform="translate(${P.x},${P.y + b / 2 + 20})"><text text-anchor="middle">${d.jm}</text>
      <text text-anchor="middle" y="17" class="nbhl">${NEBE_HLADINY[h]}${d.nap ? " · " + "●".repeat(d.nap) : ""}</text></g>`;
}
function nbNahled(d, r) {
  if (!r) return "";
  const K = nbK(d),
    H = nebeDraha(d, r, K),
    body = [];
  for (let k = 0; k <= 24; k++) {
    const p = H.bod(k / 24);
    body.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  const e = H.konec,
    b = K.zaklad,
    bv = nebeBarva(K, r) || "b";
  return `<polyline class="nbdraha nbv${bv}" points="${body.join(" ")}"/><g class="nbduch nbv${bv}" transform="translate(${e.x},${e.y}) rotate(${e.u})"><rect x="${-b / 2}" y="${-b / 2}" width="${b}" height="${b}" rx="6"/><path d="M${-b / 4} ${-b / 2 + 4} L0 ${-b / 2 - 10} L${b / 4} ${-b / 2 + 4} Z"/></g>`;
}
function nbDeska() {
  const W = NEBE_DESKA,
    mriz = [];
  for (let i = 100; i < W; i += 100) mriz.push(`<line x1="${i}" y1="0" x2="${i}" y2="${W}"/><line x1="0" y1="${i}" x2="${W}" y2="${i}"/>`);
  const tik = NB.tik,
    poz = d => (tik ? tik[d.id] : d),
    sel = nbDrak(NB.vyber),
    pasma =
      sel && !tik
        ? [1, 2, 3].map(p => `<circle class="nbpasmo" cx="${sel.x}" cy="${sel.y}" r="${nbK(sel).zaklad / 2 + p * NEBE_PASMO}"/>`).join("")
        : "";
  let nahled = "";
  /* náhled dráhy jen při poradě družiny – manévr nepřátel se na sdílené obrazovce nekreslí */
  if (NB.faze === "porada") for (const d of NB.draci) if (d.strana === "d") nahled += nbNahled(d, d.rozkaz);
  if (NB.faze === "odhaleni") for (const d of NB.draci) nahled += nbNahled(d, nbKonecny(d).r);
  return `<svg class="nbsvg${NB.noc ? " nbnoc" : ""}" viewBox="0 0 ${W} ${W}" role="img" aria-label="Nebeské bojiště">
    <rect class="nbnebe" width="${W}" height="${W}"/><g class="nbmriz">${mriz.join("")}</g>${pasma}${nahled}
    ${NB.draci.map(d => nbDrakSvg(d, poz(d))).join("")}</svg>`;
}

/* ---- číselník ---- */
function nbCiselnik(d, aktivni) {
  const K = nbK(d),
    st = {nap: d.nap, h: d.h},
    r0 = d.rozkaz;
  const bunka = r => {
    const lz = nebeLzeZvolit(K, r, st),
      b = nebeBarva(K, r),
      zn = r.s ? (r.s === "L" ? "↰" : "↱") : r.m === "nalet" ? `−${r.p}` : {zvrat: "⟲", stoupani: "⤴", viseni: "◦"}[r.m] || "↑",
      zvol = r0 && nebeKlic(r0) === nebeKlic(r) && (r0.s || "") === (r.s || "");
    return `<button type="button" class="nbbtn nbv${b}${zvol ? " on" : ""}" data-nb="rozkaz" data-nbr='${JSON.stringify(r)}'${aktivni && lz.ok ? "" : " disabled"} title="${lz.ok ? nbBarvaJm[b] : lz.proc}">${zn}</button>`;
  };
  const radky = Object.keys(NEBE_MANEVRY).map(m => {
    const M = NEBE_MANEVRY[m];
    /* Nálet o p hladin letí rovně p + 1 – tlačítko stojí ve sloupci té délky */
    const sl = [0, 1, 2, 3, 4].map(r => {
      if (m === "nalet") return K.d[`nalet:${r - 1}`] ? `<td>${bunka({m, p: r - 1})}</td>` : "<td></td>";
      if (!M.r.includes(r) || !K.d[`${m}:${r}`]) return "<td></td>";
      return `<td>${M.uhel ? bunka({m, r, s: "L"}) + bunka({m, r, s: "P"}) : bunka({m, r})}</td>`;
    });
    return sl.some(x => x !== "<td></td>") ? `<tr><th>${M.n}</th>${sl.join("")}</tr>` : "";
  });
  return `<table class="nbcis"><thead><tr><th></th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead><tbody>${radky.join("")}</tbody></table>`;
}
/* výška u jednoduchého manévru (Rovně, Mírná zatáčka): klesnout / držet / stoupat o 1 */
function nbVyska(d) {
  const r = d.rozkaz,
    K = nbK(d),
    jde = r && NEBE_MANEVRY[r.m].vyska;
  const tl = [
    [-1, "↓ klesnout"],
    [0, "držet"],
    [1, "↑ stoupat"],
  ].map(([v, t]) => {
    const x = jde && {...r, v},
      lz = x && nebeLzeZvolit(K, x, {nap: d.nap, h: d.h}),
      b = x && nebeBarva(K, x);
    return `<button type="button" class="nbbtn nbvys nbv${b || "b"}${jde && (r.v || 0) === v ? " on" : ""}" data-nb="vyska" data-nbo="${v}"${lz && lz.ok ? "" : " disabled"} title="${lz ? (lz.ok ? nbBarvaJm[b] : lz.proc) : "výšku mění jen Rovně a Mírná zatáčka"}">${t}</button>`;
  });
  return `<div class="nbovl"><span class="lbl">Výška</span>${tl.join("")}</div>`;
}

/* ---- konečný rozkaz po Závoji a Nočních očích ---- */
function nbKonecny(d) {
  const K = nbK(d),
    r = d.oci || d.rozkaz;
  return nebeZavoj(K, r, d.zavoj);
}

/* ---- panel ---- */
function nbKartaDraka(d) {
  const K = nbK(d),
    P = NEBE_PLEMENA[d.pl],
    vl = K.vl.map(v => `<li>${NEBE_VLASTNOSTI[v]}</li>`).join(""),
    po = K.podpis ? `<li><b>${NEBE_PODPISY[K.podpis].n}:</b> ${NEBE_PODPISY[K.podpis].t}</li>` : "",
    zr = Object.keys(NEBE_ZRANENI)
      .map(
        z =>
          `<button type="button" class="gbtn ghost nbzr${d.zr[z] ? " on" : ""}" data-nb="zr" data-nbz="${z}" data-nbd="${d.id}" title="${NEBE_ZRANENI[z].t} (k6: ${NEBE_ZRANENI[z].k.join(", ")})">${NEBE_ZRANENI[z].n}</button>`,
      )
      .join("");
  const prip =
    NB.faze === "priprava"
      ? `<div class="nbovl"><button type="button" class="gbtn ghost" data-nb="toc" data-nbd="${d.id}" data-nbo="-45">⟲ 45°</button><button type="button" class="gbtn ghost" data-nb="toc" data-nbd="${d.id}" data-nbo="-15">⟲ 15°</button><button type="button" class="gbtn ghost" data-nb="toc" data-nbd="${d.id}" data-nbo="15">15° ⟳</button><button type="button" class="gbtn ghost" data-nb="toc" data-nbd="${d.id}" data-nbo="45">45° ⟳</button>
        <button type="button" class="gbtn ghost" data-nb="hl" data-nbd="${d.id}" data-nbo="-1">Níž</button><button type="button" class="gbtn ghost" data-nb="hl" data-nbd="${d.id}" data-nbo="1">Výš</button>
        <button type="button" class="gbtn ghost" data-nb="nap" data-nbd="${d.id}" data-nbo="-1">Napětí −</button><button type="button" class="gbtn ghost" data-nb="nap" data-nbd="${d.id}" data-nbo="1">Napětí +</button></div>`
      : "";
  return `<details class="nbkarta nb${d.strana}"${NB.vyber === d.id ? " open" : ""} data-nbkarta="${d.id}"><summary><b>${d.jm}</b> <span class="lbl">${d.strana === "d" ? "družina" : "nepřítel"} · ${NEBE_HLADINY[Math.round(d.h)]} · Napětí ${d.nap}/${K.maxNap}</span></summary>
    <p class="nbpopis">${P.n} · třída ${{L: "lehký", S: "střední", T: "těžký"}[K.tr]} · křídla ${NEBE_KRIDLA[P.kr].n} · ocas ${NEBE_OCASY[P.oc].n}</p>
    ${vl || po ? `<ul class="nbvl">${vl}${po}</ul>` : ""}
    ${d.nap >= K.maxNap ? `<p class="nbvar">Plné Napětí – drak musí přistát.</p>` : ""}
    ${nbCiselnik(d, false)}
    <p class="lbl">Zranění (místo podle kostky Závoje)</p><div class="nbovl">${zr}</div>${prip}</details>`;
}

const nbUtokText = (co, u) =>
  u.muze
    ? `${co} <span class="nbano">ano</span>${u.bonus ? ` +${u.bonus}k6` : ""}${u.vyhoda ? " s výhodou" : ""} (${u.proc})`
    : `${co} ne (${u.proc})`;
function nbUtoky(P, zaklad) {
  const radky = [];
  NB.draci.forEach((a, i) =>
    NB.draci.forEach((b, j) => {
      if (i === j || a.strana === b.strana) return;
      const Ka = nbK(a),
        Kb = nbK(b),
        pa = {...P[a.id], h0: a.h0 ?? a.h},
        pb = P[b.id],
        U = nebeUtokDraka(pa, pb, Ka, Kb, (NB.kon && NB.kon[a.id] ? NB.kon[a.id] : nbKonecny(a)).r, nbZr(a)),
        pas = nebePasmo(pa, pb, Ka, Kb),
        obl = nebeOblouk(pa, pb),
        poz = pas === 0 ? "mimo dosah" : obl === "zadni" ? "za ocasem vlastního draka – nelze" : `pásmo ${pas}`,
        noc = NB.noc && Kb.podpis === "nocni_oci" && pas > 1 ? " · nelze Zaměřit (noc)" : "";
      radky.push(
        `<li><b>${a.jm} → ${b.jm}</b>: ${nbUtokText("kousnutí a drápy", U.kousnuti)}${U.ocas ? "; " + nbUtokText("ocas", U.ocas) : ""}; posádka: ${poz}${noc}</li>`,
      );
    }),
  );
  return `<div class="nbutoky"><h3>${zaklad}</h3><ul>${radky.join("")}</ul><p class="lbl">Kostky se hází u stolu. Útoky draků jsou současné.</p></div>`;
}

function nbPanel() {
  const F = NB.faze,
    bez = NB.draci.filter(d => d.strana === "n" && !d.zamceno),
    druz = NB.draci.find(d => d.strana === "d");
  let hlavni = "";
  if (F === "priprava")
    hlavni = `<p>Rozestavte draky (táhnutím), natočte je a nastavte hladiny. Vybraný drak má kolem sebe pásma 1–3.</p>
      <button type="button" class="gbtn" data-nb="start">Začít kolo</button>`;
  else if (F === "rozkazy") {
    const d = bez[0];
    hlavni = d
      ? `<p><b>${d.jm}</b>: vypravěč zvolí manévr (hráči se nedívají) a uzamkne ho.</p>${nbCiselnik(d, true)}${nbVyska(d)}
        <p class="nbzvol">${nbRozkazText(d.rozkaz)}</p><button type="button" class="gbtn" data-nb="zamkni" data-nbd="${d.id}"${d.rozkaz ? "" : " disabled"}>Uzamknout</button>`
      : "";
  } else if (F === "porada") {
    hlavni = `<div class="nbhodiny" id="nbhodiny" aria-live="polite"></div>
      <p><b>${druz.jm}</b>: družina se radí, manévr zadává kapitán. Dráha se kreslí na desku jako náhled.</p>${nbCiselnik(druz, true)}${nbVyska(druz)}
      <p class="nbzvol">${nbRozkazText(druz.rozkaz)}</p><button type="button" class="gbtn" data-nb="potvrd"${druz.rozkaz ? "" : " disabled"}>Potvrdit manévr</button>`;
  } else if (F === "odhaleni") {
    const ri = NB.draci
      .map(d => {
        const K = nbK(d),
          b = nebeBarva(K, d.oci || d.rozkaz),
          kon = nbKonecny(d),
          zav =
            b === "c"
              ? `<div class="nbovl">Závoj jezdce: ${[
                  [1, "Pokušení (1–2)"],
                  [3, "nic (3–4)"],
                  [5, "Požehnání (5–6)"],
                ]
                  .map(
                    ([k, t]) =>
                      `<button type="button" class="gbtn ghost${d.zavoj && (k === 1 ? d.zavoj <= 2 : k === 3 ? d.zavoj > 2 && d.zavoj < 5 : d.zavoj >= 5) ? " on" : ""}" data-nb="zavoj" data-nbd="${d.id}" data-nbo="${k}">${t}</button>`,
                  )
                  .join("")}</div>`
              : "",
          oci = d.strana === "d" ? nebeNocniOci(K, d.rozkaz, {noc: NB.noc, nap: d.nap, h: d.h}) : [],
          ociH = oci.length
            ? `<div class="nbovl">Noční oči: ${[d.rozkaz, ...oci]
                .map(
                  r =>
                    `<button type="button" class="gbtn ghost${nebeKlic(r) === nebeKlic(d.oci || d.rozkaz) && r.m === (d.oci || d.rozkaz).m ? " on" : ""}" data-nb="oci" data-nbd="${d.id}" data-nbr='${JSON.stringify(r)}'>${nbRozkazText(r)}</button>`,
                )
                .join("")}</div>`
            : "";
        return `<li><b>${d.jm}</b>: ${nbRozkazText(d.oci || d.rozkaz)} <span class="nbtag nbv${b}">${nbBarvaJm[b]}</span>${kon.t ? ` → <i>${kon.t}</i>` : ""}${zav}${ociH}</li>`;
      })
      .join("");
    const ceka = NB.draci.some(d => nebeBarva(nbK(d), d.oci || d.rozkaz) === "c" && !d.zavoj);
    hlavni = `<ul class="nbodh">${ri}</ul><button type="button" class="gbtn" data-nb="let"${ceka ? " disabled title='Nejdřív Závoj u červeného manévru'" : ""}>Letět!</button>`;
  } else if (F === "pohyb") hlavni = `<p>Draci letí…</p>`;
  else if (F === "konec")
    hlavni = `${nbUtoky(Object.fromEntries(NB.draci.map(d => [d.id, d])), "Útoky draků a posádka z konečných pozic")}
      <button type="button" class="gbtn" data-nb="dalsi">Další kolo</button>`;
  return `<div class="nbfaze"><span class="lbl">Kolo ${NB.kolo}</span><h3>${NB_FAZE[F]}</h3></div>${hlavni}
    <div class="nbkarty">${NB.draci.map(nbKartaDraka).join("")}</div>
    ${
      NB.log.length
        ? `<details class="nblog"><summary class="lbl">Záznam</summary><ul>${NB.log
            .slice(0, 30)
            .map(t => `<li>${t}</li>`)
            .join("")}</ul></details>`
        : ""
    }`;
}

function renderNebe() {
  const box = document.getElementById("nbview");
  if (!box) return;
  if (!GMV) {
    box.innerHTML = `<h2 class="arttitle">Nebeské bojiště</h2><p class="intro">Tato stránka je zatím jen pro vypravěče.</p>`;
    return;
  }
  if (!NB) nbNacti();
  box.innerHTML = `<div class="bojhead"><div class="bojtit"><h2 class="arttitle">Nebeské bojiště</h2><p class="bojlead">Vzdušný boj draků · manévry jako v X-Wingu, pohyb naráz.</p></div>
    <div class="bojbtn"><button type="button" class="gbtn ghost" data-nb="noc" aria-pressed="${NB.noc}">${NB.noc ? "Noc" : "Den"}</button>
    <label class="nbpor lbl">Porada <select data-nb="porada">${[30, 60, 90]
      .map(s => `<option value="${s}"${NB.porada === s ? " selected" : ""}>${s} s</option>`)
      .join("")}</select></label><button type="button" class="gbtn ghost" data-nb="znovu">Nový boj</button></div></div>
    <div class="nbgrid"><div class="nbdeska" id="nbdeska">${nbDeska()}</div><aside class="nbpanel" id="nbpanel">${nbPanel()}</aside></div>`;
  nbHodiny();
}
const nbPrekresli = () => {
  nbUloz();
  if (curView === "nebe") renderNebe();
};
const nbJenDeska = () => {
  const el = document.getElementById("nbdeska");
  if (el) el.innerHTML = nbDeska();
};

/* ---- hodiny porady: když doběhnou, rozhodne drak sám (rovně 2, nebo nejbližší, co umí) ---- */
let NBHOD = 0;
function nbHodiny() {
  clearInterval(NBHOD);
  if (NB.faze !== "porada") return;
  if (!NB.poradaDo) NB.poradaDo = Date.now() + NB.porada * 1000;
  const tik = () => {
    const el = document.getElementById("nbhodiny"),
      z = Math.max(0, Math.ceil((NB.poradaDo - Date.now()) / 1000));
    if (el) {
      el.textContent = `${z} s`;
      el.classList.toggle("nbmalo", z <= 10);
    }
    if (z > 0) return;
    clearInterval(NBHOD);
    const d = NB.draci.find(x => x.strana === "d");
    if (!d.rozkaz) {
      const K = nbK(d),
        r = [2, 1, 3, 4].map(x => ({m: "rovne", r: x, v: 0})).find(x => nebeLzeZvolit(K, x, {nap: d.nap, h: d.h}).ok) || {m: "rovne", r: 2};
      d.rozkaz = r;
      nbLog(`porada nestihla – ${d.jm} se rozhodl sám: ${nbRozkazText(r)}`);
    }
    nbOdhal();
  };
  tik();
  NBHOD = setInterval(tik, 250);
}
function nbOdhal() {
  NB.faze = "odhaleni";
  NB.poradaDo = 0;
  nbPrekresli();
}

/* ---- pohyb: všichni naráz, útoky až z konečných pozic ---- */
function nbLet() {
  NB.pred = NB.draci.map(d => ({id: d.id, x: d.x, y: d.y, u: d.u, h: d.h, nap: d.nap}));
  const D = NB.draci.map(d => ({...d, K: nbK(d)}));
  NB.kon = {};
  const H = D.map(d => {
    const k = nbKonecny(d);
    NB.kon[d.id] = k;
    d.h0 = d.h;
    nbDrak(d.id).h0 = d.h;
    return nebeDraha(d, k.r, d.K);
  });
  NB.draci.forEach((d, i) => {
    const k = NB.kon[d.id];
    d.nap = nebeNapeti(d.nap, k.barva, D[i].K, H[i].konec.h);
    nbLog(`${d.jm}: ${nbRozkazText(k.r)} (${nbBarvaJm[k.barva] || "bílý"})${k.t ? " – " + k.t : ""}`);
  });
  NB.drahy = H;
  nbAnimuj(nbDokonci);
}
function nbAnimuj(hotovo) {
  NB.faze = "pohyb";
  const H = NB.drahy,
    start = performance.now(),
    ms = 1400;
  const krok = ted => {
    const q = Math.min(1, (ted - start) / ms),
      t = q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
    NB.tik = Object.fromEntries(NB.draci.map((d, i) => [d.id, H[i].bod(t)]));
    nbJenDeska();
    if (q < 1) NBANIM = requestAnimationFrame(krok);
    else hotovo();
  };
  const p = document.getElementById("nbpanel");
  if (p) p.innerHTML = nbPanel();
  cancelAnimationFrame(NBANIM);
  NBANIM = requestAnimationFrame(krok);
}
function nbDokonci() {
  NB.draci.forEach((d, i) => {
    const e = NB.drahy[i].konec;
    Object.assign(d, {x: e.x, y: e.y, u: e.u, h: Math.max(0, Math.min(4, Math.round(e.h)))});
    if (e.x < 0 || e.y < 0 || e.x > NEBE_DESKA || e.y > NEBE_DESKA) nbLog(`${d.jm} vyletěl z bojiště`);
  });
  for (let i = 0; i < NB.draci.length; i++)
    for (let j = i + 1; j < NB.draci.length; j++) {
      const a = NB.draci[i],
        b = NB.draci[j],
        p = nebePrekryv(a, b, nbK(a), nbK(b));
      if (!p) continue;
      Object.assign(a, {x: p.a.x, y: p.a.y});
      Object.assign(b, {x: p.b.x, y: p.b.y});
      a.nap += 1;
      b.nap += 1;
      nbLog(`překryv: ${a.jm} a ${b.jm} se rozestoupili, oba +1 Napětí`);
    }
  NB.tik = null;
  NB.faze = "konec";
  nbPrekresli();
}

/* ---- ovládání ---- */
document.addEventListener("click", e => {
  const el = e.target.closest && e.target.closest("#nbview [data-nb]");
  if (!el || !NB || el.tagName === "SELECT") return;
  const k = el.dataset.nb,
    d = el.dataset.nbd && nbDrak(el.dataset.nbd),
    o = +el.dataset.nbo || 0;
  if (k === "noc") NB.noc = !NB.noc;
  else if (k === "znovu") {
    if (!confirm("Začít nový boj? Rozestavení a Napětí se smažou.")) return;
    NB = nbVychozi();
  } else if (k === "toc") d.u = (((d.u + o) % 360) + 360) % 360;
  else if (k === "hl") d.h = Math.max(0, Math.min(4, d.h + o));
  else if (k === "nap") d.nap = Math.max(0, d.nap + o);
  else if (k === "zr") {
    const z = el.dataset.nbz;
    d.zr = {...d.zr};
    if (d.zr[z]) delete d.zr[z];
    else {
      d.zr[z] = z === "hlava" ? NB.kolo + 1 : true;
      nbLog(`${d.jm}: zranění – ${NEBE_ZRANENI[z].n} (${NEBE_ZRANENI[z].t})`);
    }
  } else if (k === "start") {
    NB.faze = "rozkazy";
    NB.draci.forEach(x => Object.assign(x, {rozkaz: null, zamceno: false, zavoj: 0, oci: null}));
  } else if (k === "rozkaz") {
    const r = JSON.parse(el.dataset.nbr),
      cil = NB.faze === "rozkazy" ? NB.draci.find(x => x.strana === "n" && !x.zamceno) : NB.draci.find(x => x.strana === "d");
    if (!cil) return;
    /* zvolená výška zůstane, pokud ji nový manévr dovolí */
    const v = (cil.rozkaz && cil.rozkaz.v) || 0;
    if (NEBE_MANEVRY[r.m].vyska && v && nebeLzeZvolit(nbK(cil), {...r, v}, {nap: cil.nap, h: cil.h}).ok) r.v = v;
    cil.rozkaz = r;
    NB.vyber = cil.id;
    nbUloz();
    nbJenDeska();
    const p = document.getElementById("nbpanel");
    if (p) p.innerHTML = nbPanel();
    if (NB.faze === "porada") nbHodiny();
    return;
  } else if (k === "zamkni") {
    d.zamceno = true;
    if (!NB.draci.some(x => x.strana === "n" && !x.zamceno)) {
      NB.faze = "porada";
      NB.poradaDo = 0;
      NB.vyber = NB.draci.find(x => x.strana === "d").id;
    }
  } else if (k === "potvrd") {
    clearInterval(NBHOD);
    nbOdhal();
    return;
  } else if (k === "zavoj") d.zavoj = o;
  else if (k === "oci") {
    const r = JSON.parse(el.dataset.nbr);
    d.oci = nebeKlic(r) === nebeKlic(d.rozkaz) && r.m === d.rozkaz.m ? null : r;
    d.zavoj = 0;
  } else if (k === "let") {
    nbLet();
    return;
  } else if (k === "vyska") {
    const cil = NB.faze === "rozkazy" ? NB.draci.find(x => x.strana === "n" && !x.zamceno) : NB.draci.find(x => x.strana === "d");
    if (!cil || !cil.rozkaz) return;
    cil.rozkaz = {...cil.rozkaz, v: o};
    nbUloz();
    nbJenDeska();
    const p = document.getElementById("nbpanel");
    if (p) p.innerHTML = nbPanel();
    if (NB.faze === "porada") nbHodiny();
    return;
  } else if (k === "dalsi") {
    NB.draci.forEach(x => {
      Object.assign(x, {rozkaz: null, zamceno: false, zavoj: 0, oci: null, h0: undefined});
      if (x.zr.hlava && x.zr.hlava < NB.kolo + 1) {
        x.zr = {...x.zr};
        delete x.zr.hlava;
      }
    });
    NB.kolo += 1;
    NB.kon = null;
    NB.faze = "rozkazy";
  }
  nbPrekresli();
});
document.addEventListener("change", e => {
  const el = e.target.closest && e.target.closest('#nbview select[data-nb="porada"]');
  if (!el || !NB) return;
  NB.porada = +el.value;
  nbUloz();
});
document.addEventListener(
  "toggle",
  e => {
    const el = e.target.closest && e.target.closest("#nbview [data-nbkarta]");
    if (el && el.open && NB) {
      NB.vyber = el.dataset.nbkarta;
      nbUloz();
      nbJenDeska();
    }
  },
  true,
);

/* tažení draka po desce v přípravě */
document.addEventListener("pointerdown", e => {
  const g = e.target.closest && e.target.closest("#nbview [data-nbdrak]");
  if (!g || !NB) return;
  const d = nbDrak(g.dataset.nbdrak),
    svg = g.ownerSVGElement;
  NB.vyber = d.id;
  if (NB.faze !== "priprava") {
    nbPrekresli();
    return;
  }
  e.preventDefault();
  const m = svg.getScreenCTM().inverse(),
    bod = ev => {
      const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(m);
      return [Math.max(0, Math.min(NEBE_DESKA, p.x)), Math.max(0, Math.min(NEBE_DESKA, p.y))];
    };
  const pohyb = ev => {
    [d.x, d.y] = bod(ev);
    nbJenDeska();
  };
  const pust = () => {
    removeEventListener("pointermove", pohyb);
    removeEventListener("pointerup", pust);
    nbPrekresli();
  };
  addEventListener("pointermove", pohyb);
  addEventListener("pointerup", pust);
});
/*@cast}*/
