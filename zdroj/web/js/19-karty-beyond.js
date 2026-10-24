/* ===== karta jako D&D Beyond (2026-10-17 b): portrét, batohy a směna mincí, historie karty, postup na úroveň, podoba
   (Wild Shape, Polymorph), schopnosti povolání (Bardic Inspiration, Lay on Hands, Channel Divinity, Arcane Recovery),
   upozornění v telefonu a instalace webu jako aplikace ===== */
/* ---- portrét: obrázek z telefonu se zmenší na 192 px (JPEG) a uloží do stavu karty ---- */
const kImg = K => kartaStav(K.id).img || (kParty(K) || {}).img || "";
function kImgZmensi(f) {
  return new Promise((ok, ko) => {
    const u = URL.createObjectURL(f),
      im = new Image();
    im.onload = () => {
      const s = 192,
        c = document.createElement("canvas");
      c.width = c.height = s;
      const x = c.getContext("2d"),
        m = Math.min(im.width, im.height);
      x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, s, s);
      URL.revokeObjectURL(u);
      let q = 0.85,
        d = c.toDataURL("image/jpeg", q);
      while (d.length > 58000 && q > 0.3) {
        q -= 0.1;
        d = c.toDataURL("image/jpeg", q);
      }
      ok(d);
    };
    im.onerror = () => {
      URL.revokeObjectURL(u);
      ko(new Error("Obrázek nejde načíst."));
    };
    im.src = u;
  });
}
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kimg]")) return;
  const K = kvK(t),
    f = t.files && t.files[0];
  if (!K || !f || !kMuze(K)) return;
  try {
    const d = await kImgZmensi(f);
    await kartaStavZmen(K.id, {img: d}, `${K.n}: nový portrét.`);
  } catch (err) {
    mmHlasG(err.message || String(err), 4000);
  }
});
/* ---- batohy: předmět může ležet v batohu, vaku nebo truhle; obsah magických vaků (Bag of Holding…) se do zátěže nepočítá ---- */
const KKONTM = /bag of holding|handy haversack|portable hole|heward/i;
/* směna mincí: 1 PP = 10 GP = 20 EP = 100 SP = 1000 CP */
const KMINC = {CP: 1, SP: 10, EP: 50, GP: 100, PP: 1000};
function kPenSmen(pen, z, na, q) {
  const P = Object.assign({}, pen),
    mam = +P[z] || 0;
  q = Math.min(mam, Math.max(0, Math.round(q)));
  const cu = q * KMINC[z],
    dost = Math.floor(cu / KMINC[na]);
  if (!dost) return null;
  const zb = cu - dost * KMINC[na];
  P[z] = mam - q;
  P[na] = (+P[na] || 0) + dost;
  let r = zb;
  ["GP", "SP", "CP"].forEach(k => {
    if (KMINC[k] >= KMINC[z]) return;
    const n = Math.floor(r / KMINC[k]);
    if (n) {
      P[k] = (+P[k] || 0) + n;
      r -= n * KMINC[k];
    }
  });
  Object.keys(P).forEach(k => {
    if (!P[k]) delete P[k];
  });
  return P;
}
function kPenSloz(pen) {
  let cu = 0;
  Object.entries(pen || {}).forEach(([k, v]) => {
    if (KMINC[k]) cu += (+v || 0) * KMINC[k];
  });
  /* jen mince tažení: PP i EP se rozmění na zlaté a groše (2026-10-23) */
  const P = {};
  KMINCE.forEach(k => {
    const n = Math.floor(cu / KMINC[k]);
    if (n) {
      P[k] = n;
      cu -= n * KMINC[k];
    }
  });
  return P;
}
const kPenSmenHtml = () =>
  `<details class="bjapd kpens"><summary>Směnit mince</summary><form class="kvlh" data-kpenf><input name="q" type="number" min="1" max="9999999" value="10" aria-label="Kolik"><select name="z" aria-label="Z mincí">${["CP", "SP", "GP"].map(k => `<option${k === "SP" ? " selected" : ""}>${k}</option>`).join("")}</select> → <select name="na" aria-label="Na mince">${["CP", "SP", "GP"].map(k => `<option${k === "GP" ? " selected" : ""}>${k}</option>`).join("")}</select><button class="gbtn ghost">Směnit</button><button type="button" class="gbtn ghost" data-kpensloz ${btip("Drobné rozmění na co nejméně mincí: zlaté, groše, haléře")}>Rozměnit na nejvyšší</button></form><p class="rsmall">1 GP (uherský zlatý) = 10 SP (pražských grošů) = 100 CP (haléřů).</p></details>`;
/* ---- historie karty: předchozí stavy z databáze (snímek nejvýš jednou za 10 minut), obnovení ---- */
const kHistShrn = s => {
  const L = [];
  if (s.hp != null) L.push(`životy ${s.hp}`);
  else L.push("plné životy");
  if (s.thp) L.push(`+${s.thp} dočasné`);
  const z = Object.values(s.zdr || {}).reduce((a, v) => a + (+v || 0), 0);
  if (z) L.push(`utraceno ${z}× zdroje/sloty`);
  if ((s.inv || []).length) L.push(`${s.inv.length} předmětů`);
  const p = s.pen || {};
  if (Object.keys(p).length)
    L.push(
      Object.entries(p)
        .map(([k, v]) => `${v} ${k}`)
        .join(" "),
    );
  if ((s.tridy || []).length) L.push(s.tridy.map(t => t.n + " " + t.u).join("/"));
  if (s.forma) L.push("podoba " + s.forma.n);
  return L.join(" · ");
};
async function kHistorie(K) {
  if (!window.MMDB || !MMDB.kartaHistorie) {
    mmHlasG("Historie je jen ve verzi s databází.", 3500);
    return;
  }
  try {
    const L = (await MMDB.kartaHistorie(K.id)) || [];
    mmPop(`<h3>Historie karty – ${besc(K.n)}</h3><p class="rsmall">Snímek stavu se ukládá nejvýš jednou za 10 minut (posledních 40). Obnovení vrátí životy, zdroje, vybavení, peníze i úpravy postavy do tehdejšího stavu; současný stav se uloží do historie.</p>
    ${
      L.length
        ? `<ul class="khist">${L.map(
            h =>
              `<li><small>${(() => {
                try {
                  return new Date(h.cas).toLocaleString("cs-CZ", {day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"});
                } catch (e) {
                  return "";
                }
              })()}</small> <span>${besc(kHistShrn(h.stav || {}))}</span> ${kMuze(K) ? `<button type="button" class="gbtn ghost" data-khist="${+h.n}" data-khistk="${besc(K.id)}">Obnovit</button>` : ""}</li>`,
          ).join("")}</ul>`
        : `<p>Zatím žádný starší stav.</p>`
    }`);
  } catch (err) {
    mmHlasG("Historii se nepodařilo načíst: " + (err.message || err), 5000);
  }
}
document.addEventListener("click", async e => {
  const b = e.target.closest && e.target.closest("[data-khist]");
  if (!b) return;
  const K = KARTBY[b.dataset.khistk];
  if (!K || !kMuze(K)) return;
  if (!confirm(`Vrátit kartu ${K.n} do stavu ze ${b.parentNode.querySelector("small").textContent}?`)) return;
  try {
    await MMDB.kartaObnov(K.id, +b.dataset.khist);
    mmPopX();
    KPENDT[K.id] = 0;
    await kartyNacti(true);
    kartyPrekresli();
    mmHlasG(`${K.n}: karta obnovena.`, 4000);
    kHodZapis({k: K.id, kdo: K.n, co: "Karta obnovena", txt: "z historie"});
  } catch (err) {
    mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
  }
});
/* ---- postup na úroveň: životy (průměr nebo hod), nové rysy povolání ze SRD, zvýšení vlastností nebo feat, kouzla ---- */
let SRDUR = null,
  SRDURP = null;
const srdUrovne = () =>
  SRDUR
    ? Promise.resolve(SRDUR)
    : (SRDURP =
        SRDURP ||
        fetch("art/srd-urovne.json")
          .then(r => r.json())
          .then(d => (SRDUR = d))
          .catch(() => (SRDUR = {})));
const KLVUP = {};
function kLvupHtml(K) {
  const o = KLVUP[K.id];
  if (!o) return "";
  if (!SRDUR) {
    srdUrovne().then(() => kartyPrekresli());
    return `<div class="klvup"><p>Načítám tabulky povolání…</p></div>`;
  }
  const tr = kTridy(K),
    lv = tr.reduce((a, t) => a + t.u, 0);
  if (lv >= 20)
    return `<div class="klvup"><p>${besc(K.n)} má 20. úroveň – výš to nejde.</p><button type="button" class="gbtn ghost" data-klvx>Zavřít</button></div>`;
  const cls = o.tr || (tr[0] && tr[0].n) || "Fighter",
    t0 = tr.find(t => t.n === cls),
    nu = (t0 ? t0.u : 0) + 1,
    T = SRDUR[cls],
    row = T && T.r[nu - 1],
    prev = T && nu > 1 ? T.r[nu - 2] : null,
    hd = (KTR[cls] || {}).hd || 8,
    avg = hd / 2 + 1,
    con = kMd(K, "CON");
  const rysy = row ? row[2] : "",
    asi = /Ability Score Improvement/.test(rysy),
    epic = /Epic Boon/.test(rysy),
    zmeny = T && row ? T.h.map((h, i) => (i > 2 && prev && row[i] !== prev[i] && row[i] !== "—" ? `${h} ${row[i]}` : "")).filter(Boolean) : [];
  const rysL = rysy
    .split(/,\s*/)
    .filter(x => x && x !== "—")
    .map(n => {
      const s = kRysSrd(n);
      return s ? `<button type="button" class="kspn" data-krys="${besc(n)}">${besc(n)}</button>` : besc(n);
    })
    .join(", ");
  const featL = Object.entries(SRDRY || {})
    .filter(([, v]) => v[0] === "puvod")
    .map(([n]) => n);
  return `<div class="klvup"><h4 class="kdbsh">⬆ Postup na ${lv + 1}. úroveň</h4>
    <p><label>Povolání <select data-klvtr aria-label="Povolání">${[...new Set([...tr.map(t => t.n), ...Object.keys(KTR)])].map(n => `<option value="${besc(n)}"${n === cls ? " selected" : ""}>${besc((KTR[n] || {}).cz || n)}${tr.find(t => t.n === n) ? ` (teď ${tr.find(t => t.n === n).u})` : " – nové"}</option>`).join("")}</select></label> → ${besc((KTR[cls] || {}).cz || cls)} ${nu}</p>
    <p><b>Životy:</b> <label><input type="radio" name="klvhp" data-klvhp="p"${o.hp !== "h" ? " checked" : ""}> průměr ${avg} ${bsg(con)} CON = <b>${Math.max(1, avg + con)}</b></label> <label><input type="radio" name="klvhp" data-klvhp="h"${o.hp === "h" ? " checked" : ""}> hodit d${hd}${o.hod ? ` – padlo <b>${o.hod}</b> ${bsg(con)} = <b>${Math.max(1, o.hod + con)}</b>` : ""}</label></p>
    ${row ? `<p><b>Nové rysy:</b> ${rysL || "–"}${zmeny.length ? `<br><small>${besc(zmeny.join(" · "))}</small>` : ""}</p>` : `<p class="rsmall">Pro toto povolání není tabulka SRD – rysy doplň z D&amp;D Beyond.</p>`}
    ${/Subclass|podtříd/i.test(rysy) ? `<p class="rsmall">Podtřída: vyber ji podle pravidel (SRD má u každého povolání jednu; ostatní jsou v Rysech jako shrnutí mimo SRD). Rysy podtřídy přidej v Rysech → Doplnit.</p>` : ""}
    ${
      asi || epic
        ? `<p><b>${epic ? "Epic Boon nebo zvýšení vlastností" : "Ability Score Improvement"}:</b> <label><input type="radio" name="klvasi" data-klvasi="a"${o.asi !== "f" ? " checked" : ""}> vlastnosti</label> <label><input type="radio" name="klvasi" data-klvasi="f"${o.asi === "f" ? " checked" : ""}> feat</label></p>
      ${
        o.asi === "f"
          ? `<p><input data-klvfeat list="klvfl" maxlength="60" placeholder="název featu (např. Alert, Tough)" value="${besc(o.feat || "")}" aria-label="Feat"><datalist id="klvfl">${featL.map(n => `<option value="${besc(n)}">`).join("")}</datalist></p><p class="rsmall">Feat se přidá do Rysů; jeho bonusy (Tough, Alert…) karta spočítá podle názvu. Zvýšení vlastnosti z featu zapiš v Úpravách.</p>`
          : `<p class="klvab">${BAB.map(a => {
              const v = kVl(K, a) || 10,
                p = (o.ab || {})[a] || 0;
              return `<span><small>${a} ${v}${p ? `→${v + p}` : ""}</small><button type="button" class="gbtn ghost" data-klvab="${a}" data-d="-1" aria-label="${a} méně"${p ? "" : " disabled"}>−</button><b>${p ? "+" + p : "0"}</b><button type="button" class="gbtn ghost" data-klvab="${a}" data-d="1" aria-label="${a} více"${Object.values(o.ab || {}).reduce((x, y) => x + y, 0) >= 2 || v + p >= 20 ? " disabled" : ""}>+</button></span>`;
            }).join("")}</p><p class="rsmall">Rozděl 2 body (+2 jedné nebo +1 dvěma), nejvýš na 20.</p>`
      }`
        : ""
    }
    ${KTR[cls] && KTR[cls].c ? `<p class="rsmall">Kouzla: ${zmeny.some(z => /Připravená|Triky|Sloty|úr\./.test(z)) ? "přibyla kouzla nebo sloty – " : ""}po potvrzení vyber nová kouzla v záložce Kouzla → Připravit nebo vyměnit kouzla.</p>` : ""}
    <p><button type="button" class="gbtn" data-klvok>Potvrdit postup</button> <button type="button" class="gbtn ghost" data-klvx>Zrušit</button></p></div>`;
}
async function kLvupPotvrd(K) {
  const o = KLVUP[K.id];
  if (!o) return;
  const S = kartaStav(K.id),
    tr = kTridy(K).map(t => Object.assign({}, t)),
    cls = o.tr || tr[0].n;
  let t0 = tr.find(t => t.n === cls);
  if (!t0) {
    t0 = {n: cls, u: 0};
    tr.push(t0);
  }
  if (tr.length > 6) return;
  t0.u++;
  const T = (SRDUR || {})[cls],
    rysy = T ? T.r[t0.u - 1][2] : "",
    hd = (KTR[cls] || {}).hd || 8,
    avg = hd / 2 + 1,
    ch = {tridy: tr},
    msg = [`${(KTR[cls] || {}).cz || cls} ${t0.u}`];
  if (o.hp === "h") {
    if (!o.hod) {
      mmHlasG("Nejdřív hoď na životy.", 3000);
      return;
    }
    const d = o.hod - avg;
    if (d) {
      const U = [...(S.upr || [])],
        i = U.findIndex(x => x.c === "hp" && x.n === "hody na životy");
      const v = Math.max(-20, Math.min(20, (i >= 0 ? +U[i].v : 0) + d));
      if (i >= 0) U[i] = {c: "hp", v, n: "hody na životy"};
      else U.push({c: "hp", v, n: "hody na životy"});
      ch.upr = U.slice(0, 30);
    }
    msg.push(`životy hodem d${hd} ${o.hod}`);
  }
  if (/Ability Score Improvement|Epic Boon/.test(rysy)) {
    if (o.asi === "f") {
      const n = (o.feat || "").trim();
      if (!n) {
        mmHlasG("Napiš název featu.", 3000);
        return;
      }
      const D = JSON.parse(JSON.stringify(kDopl(K)));
      D.rysy = [...(D.rysy || []), {n: n.slice(0, 60), t: `Feat z ${t0.u}. úrovně (${cls})`}].slice(0, 40);
      ch.dopl = D;
      msg.push("feat " + n);
    } else {
      const A = o.ab || {},
        sum = Object.values(A).reduce((a, b) => a + b, 0);
      if (sum !== 2) {
        mmHlasG("Rozděl 2 body vlastností.", 3000);
        return;
      }
      const V = Object.assign({}, S.vlU || {});
      Object.entries(A).forEach(([a, p]) => {
        if (p) V[a] = Math.min(20, (kVl(K, a) || 10) + p);
      });
      ch.vlU = V;
      msg.push(
        Object.entries(A)
          .filter(([, p]) => p)
          .map(([a, p]) => `${a} +${p}`)
          .join(", "),
      );
    }
  }
  const mx0 = kHPmax(K);
  KST[K.id] = Object.assign({}, S, ch);
  const mx1 = kHPmax(K);
  KST[K.id] = S;
  if (S.hp != null) ch.hp = Math.max(0, Math.min(mx1, +S.hp + (mx1 - mx0)));
  delete KLVUP[K.id];
  await kartaStavZmen(K.id, ch, `${K.n}: ${kLv(K) + 1}. úroveň – ${msg.join(", ")}; maximum životů ${mx0} → ${mx1}.`);
  kHodZapis({
    k: K.id,
    kdo: K.n,
    co: "Postup na úroveň",
    txt: `${kLv(K)}. úroveň · ${msg.join(", ")}${rysy && rysy !== "—" ? " · nové rysy: " + rysy : ""}`,
  });
}
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const b = T("[data-klvup],[data-klvx],[data-klvok],[data-klvab],[data-klvhp],[data-klvasi]");
  if (!b) return;
  const K = kvK(b);
  if (!K || !kMuze(K)) return;
  if (b.matches("[data-klvup]")) {
    document.querySelectorAll(".kdbmenu[open]").forEach(d => (d.open = false));
    KLVUP[K.id] = KLVUP[K.id] || {};
    srdUrovne().then(() => kartyPrekresli());
    if (!SRDRY) srdRysy().then(() => kartyPrekresli());
    kartyPrekresli();
    return;
  }
  const o = KLVUP[K.id];
  if (!o) return;
  if (b.matches("[data-klvx]")) {
    delete KLVUP[K.id];
    kartyPrekresli();
    return;
  }
  if (b.matches("[data-klvok]")) {
    kLvupPotvrd(K);
    return;
  }
  if (b.matches("[data-klvab]")) {
    const a = b.dataset.klvab,
      A = Object.assign({}, o.ab || {});
    A[a] = Math.max(0, Math.min(2, (A[a] || 0) + +b.dataset.d));
    o.ab = A;
    kartyPrekresli();
    return;
  }
  if (b.matches("[data-klvhp]")) {
    o.hp = b.dataset.klvhp;
    if (o.hp === "h" && !o.hod) {
      const hd = (KTR[o.tr || (kTridy(K)[0] || {}).n] || {}).hd || 8;
      o.hod = bK(hd);
    }
    kartyPrekresli();
    return;
  }
  if (b.matches("[data-klvasi]")) {
    o.asi = b.dataset.klvasi;
    kartyPrekresli();
    return;
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (!t.matches) return;
  const K = kvK(t);
  if (!K || !KLVUP[K.id]) return;
  if (t.matches("[data-klvtr]")) {
    Object.assign(KLVUP[K.id], {tr: t.value, hod: 0, ab: {}});
    kartyPrekresli();
  }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-klvfeat]")) return;
  const K = kvK(t);
  if (K && KLVUP[K.id]) KLVUP[K.id].feat = t.value;
});
/* ---- podoba: Wild Shape (druid; dočasné HP = úroveň druida, AC a útoky zvířete) a Polymorph (dočasné HP = životy zvířete) ---- */
const kForma = K => kartaStav(K.id).forma || null;
const kFormaCR = cr => {
  const m = String(cr || "").match(/^(\d+)(?:\/(\d+))?/);
  return m ? (m[2] ? +m[1] / +m[2] : +m[1]) : 99;
};
const kFormaLet = p => /létání|fly/i.test((p.h || "").replace(/<[^>]+>/g, " ").match(/Rychlost[^·<]*/)?.[0] || "");
function kFormaMax(K) {
  const u = kTrU(kCtx(K), "Druid");
  return u >= 8 ? {cr: 1, let: true} : u >= 4 ? {cr: 0.5, let: false} : u >= 2 ? {cr: 0.25, let: false} : null;
}
const kFormaZ = p => {
  const t = (p.h || "").replace(/<[^>]+>/g, " "),
    r = (t.match(/Rychlost\s*([^·]+?)\s*·/) || [])[1] || "",
    tb = (p.h || "").match(/<tbody><tr>(.*?)<\/tr>/),
    vl = {};
  if (tb) {
    const c = [...tb[1].matchAll(/<td[^>]*>\s*(\d+)/g)].map(x => +x[1]);
    ["STR", "AGI", "CON"].forEach((a, i) => {
      if (c[i]) vl[a] = c[i];
    });
  }
  return {
    n: p.n,
    src: p.id,
    ac: parseInt(p.ac) || 10,
    hp: (p.hp && p.hp[0] && p.hp[0].max) || 1,
    rych: r.slice(0, 60),
    vl,
    ut: (p.at || [])
      .filter(a => a.b != null)
      .slice(0, 6)
      .map(a => ({n: String(a.n).slice(0, 40), b: +a.b, z: String(a.z || "").slice(0, 20), t: String(a.zt || "").slice(0, 20)})),
  };
};
function kFormaHtml(K) {
  const F = kForma(K),
    ws = kZdroje(K).find(q => /wild shape/i.test(q.n)),
    poly = kSeznam(K).some(x => /^(true )?polymorph$/i.test(x.n)),
    M = kFormaMax(K);
  if (!F && !ws && !poly) return "";
  if (!NETV && !F) {
    netvNacti()
      .then(() => kartyPrekresli())
      .catch(() => {});
    return `<p class="rsmall">Načítám zvířata ze SRD…</p>`;
  }
  if (F)
    return `<section class="kforma"><h4 class="kdbsh">Podoba: ${besc(F.n)} <small>${F.typ === "ws" ? "Wild Shape" : "Polymorph"}</small></h4><p>AC <b>${+F.ac || "–"}</b>${F.rych ? ` · rychlost ${besc(F.rych)}` : ""}${
      Object.keys(F.vl || {}).length
        ? ` · ${Object.entries(F.vl)
            .map(([a, v]) => `${a} ${v} (${bsg(kMod(v))})`)
            .join(" · ")}`
        : ""
    }</p>
    ${(F.ut || []).length ? `<p>${F.ut.map((a, j) => `<button type="button" class="gbtn ghost" data-kforu="${j}">${besc(a.n)} ${bsg(+a.b || 0)} · ${besc(a.z)} ${besc(BZRT[a.t] || a.t || "")}</button>`).join(" ")}</p>` : ""}
    <p class="rsmall">${F.typ === "ws" ? "Ponecháváš si životy, INT, WIS, CHA, rysy povolání a featy; STR, AGI a CON, AC, rychlost a útoky má zvíře. Dočasné HP = úroveň druida. Kouzla sesílat nejde (kromě rysů, které to dovolují)." : "Statistiky nahrazuje zvíře; podoba skončí, když dojdou dočasné HP (= životy zvířete), nebo po hodině (Concentration)."}</p>
    <button type="button" class="gbtn" data-kforx>Ukončit podobu</button>${PROTBY[F.src] ? `<details class="bjapd"><summary>Statistiky zvířete</summary><div class="bsb srdtext">${PROTBY[F.src].h}</div></details>` : ""}</section>`;
  const zb = ws ? ws.max - Math.min(ws.max, (kartaStav(K.id).zdr || {})[ws.n] || 0) : 0,
    L = (NETV || [])
      .filter(p => p.typ === "Beast")
      .filter(p => poly || (M && kFormaCR(p.cr) <= M.cr && (M.let || !kFormaLet(p))))
      .sort((a, b) => kFormaCR(a.cr) - kFormaCR(b.cr) || a.n.localeCompare(b.n));
  return `<section class="kforma"><h4 class="kdbsh">Podoba zvířete</h4><form class="kvlh" data-kformf><input name="z" list="kformal" placeholder="zvíře (Wolf, Brown Bear…)" required aria-label="Zvíře"><datalist id="kformal">${L.map(p => `<option value="${besc(p.n)}">${besc((p.cz || "") + " · CR " + p.cr)}</option>`).join("")}</datalist>
    ${ws ? `<button class="gbtn" name="typ" value="ws"${zb ? "" : " disabled"}>Wild Shape (${zb}/${ws.max})</button>` : ""}${poly ? `<button class="gbtn ghost" name="typ" value="poly">Polymorph</button>` : ""}</form>
    <p class="rsmall">${M ? `Wild Shape: zvíře do CR ${M.cr === 0.25 ? "1/4" : M.cr === 0.5 ? "1/2" : M.cr}${M.let ? "" : ", bez létání"}. ` : ""}${poly ? "Polymorph: zvíře s CR nejvýš úroveň cíle (tady sebe). " : ""}Útoky zvířete pak budou tady.</p></section>`;
}
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-kformf]")) return;
  e.preventDefault();
  const K = kvK(f);
  if (!K || !kMuze(K)) return;
  const typ = (e.submitter && e.submitter.value) || "ws",
    n = f.elements.z.value.trim().toLowerCase(),
    p = (NETV || []).find(x => x.n.toLowerCase() === n || (x.cz || "").toLowerCase() === n);
  if (!p) {
    mmHlasG("Vyber zvíře ze seznamu.", 3000);
    return;
  }
  const F = Object.assign(kFormaZ(p), {typ}),
    S = kartaStav(K.id),
    ch = {forma: F};
  if (typ === "ws") {
    const q = kZdroje(K).find(x => /wild shape/i.test(x.n)),
      U = Object.assign({}, S.zdr || {});
    if (q) {
      if ((U[q.n] || 0) >= q.max) {
        mmHlasG("Wild Shape už nezbývá.", 3000);
        return;
      }
      U[q.n] = (U[q.n] || 0) + 1;
      ch.zdr = U;
    }
    ch.thp = Math.max(+S.thp || 0, kTrU(kCtx(K), "Druid"));
  } else ch.thp = Math.max(+S.thp || 0, F.hp);
  await kartaStavZmen(K.id, ch, `${K.n}: podoba ${F.n} – AC ${F.ac}, dočasné HP ${ch.thp}.`);
  kHodZapis({k: K.id, kdo: K.n, co: typ === "ws" ? "Wild Shape" : "Polymorph", txt: `${F.n}: AC ${F.ac}, dočasné HP ${ch.thp}`});
});
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const b = T("[data-kforx],[data-kforu]");
  if (!b) return;
  const K = kvK(b);
  if (!K) return;
  const F = kForma(K);
  if (!F) return;
  if (b.matches("[data-kforx]")) {
    if (!kMuze(K)) return;
    await kartaStavZmen(K.id, Object.assign({forma: null}, F.typ === "poly" ? {thp: null} : {}), `${K.n}: zpět ve vlastní podobě.`);
    kHodZapis({k: K.id, kdo: K.n, co: "Konec podoby", txt: F.n});
    return;
  }
  const a = (F.ut || [])[+b.dataset.kforu];
  if (!a) return;
  const r = await kartaHod(K, `Útok ${a.n} (${F.n})`.slice(0, 80), +a.b || 0);
  if (r && !r.mis && a.z) {
    const z = kVyraz(r.krit ? a.z.replace(/(\d+)d/g, (q, n) => `${2 * n}d`) : a.z);
    if (z)
      kHodZapis({
        k: K.id,
        kdo: K.n,
        co: `Zranění ${a.n}`.slice(0, 80),
        tot: z.tot,
        txt: `${z.txt} ${BZRT[a.t] || a.t || ""}${r.krit ? " · kritický zásah" : ""}`,
      });
  }
});
/* ---- schopnosti povolání: Bardic Inspiration spojenci, Lay on Hands, Channel Divinity, Arcane Recovery ---- */
const kZdrN = (K, re) => {
  const q = kZdroje(K).find(x => re.test(String(x.n).replace(/[’']/g, "'")));
  if (!q) return null;
  const u = Math.min(q.max, (kartaStav(K.id).zdr || {})[q.n] || 0);
  return {q, u, zb: q.max - u};
};
async function kZdrUtrat(K, z, n = 1) {
  const U = Object.assign({}, kartaStav(K.id).zdr || {});
  U[z.q.n] = Math.min(z.q.max, (U[z.q.n] || 0) + n);
  await kartaStavZmen(K.id, {zdr: U});
}
const kSpojenci = K => (KARTY || []).filter(k => k.id !== K.id && !k.test);
const kSpojSel = (K, attr, sebe) =>
  `<select ${attr} aria-label="Komu">${sebe ? `<option value="${besc(K.id)}">sebe</option>` : ""}${kSpojenci(K)
    .map(k => `<option value="${besc(k.id)}">${besc(k.n)}</option>`)
    .join("")}</select>`;
const kBardK = K => {
  const u = kTrU(kCtx(K), "Bard");
  return u >= 15 ? 12 : u >= 10 ? 10 : u >= 5 ? 8 : 6;
};
const kLohMax = K => 5 * kTrU(kCtx(K), "Paladin");
const kSparkK = K => {
  const u = kTrU(kCtx(K), "Cleric");
  return u >= 18 ? 4 : u >= 13 ? 3 : u >= 7 ? 2 : 1;
};
function kSchopHtml(K) {
  const c = kCtx(K),
    L = [],
    dc = 8 + kPB(K) + kMd(K, "WIS");
  const bi_ = kZdrN(K, /bardic inspiration/i);
  if (bi_ && kTrU(c, "Bard"))
    L.push(
      `<div class="kschop"><b>Bardic Inspiration</b> <small>d${kBardK(K)} · zbývá ${bi_.zb}/${bi_.q.max}</small><span>${kSpojSel(K, "data-kbardk")}<button type="button" class="gbtn ghost" data-kbardd${bi_.zb ? "" : " disabled"} ${btip("Bonusová akce: spojenec do 60 stop dostane kostku – přičte ji k jednomu hodu d20 do hodiny")}>Dát kostku</button></span></div>`,
    );
  const lm = kLohMax(K);
  if (lm) {
    const u = Math.min(lm, (kartaStav(K.id).zdr || {})["Lay on Hands"] || 0),
      zb = lm - u;
    L.push(
      `<div class="kschop"><b>Lay on Hands</b> <small>zásoba ${zb}/${lm} HP · bonusová akce</small><span><input type="number" min="1" max="${zb || 1}" value="${Math.min(zb, 5) || 1}" data-klohv inputmode="numeric" aria-label="Kolik HP" style="width:4.5em">${kSpojSel(K, "data-klohk", true)}<button type="button" class="gbtn ghost" data-kloh${zb ? "" : " disabled"}>Léčit</button><button type="button" class="gbtn ghost" data-klohp${zb >= 5 ? "" : " disabled"} ${btip("Za 5 bodů ze zásoby ukončí stav Otrávený (Poisoned)")}>Otrava −5</button>${u ? `<button type="button" class="kzdv" data-klohr aria-label="Vrátit 1 bod" ${btip("Vrátit 1 bod do zásoby")}>↺</button>` : ""}</span></div>`,
    );
  }
  const cd = kZdrN(K, /channel divinity/i);
  if (cd) {
    const kl = kTrU(c, "Cleric"),
      pa = kTrU(c, "Paladin"),
      o = [];
    if (kl) {
      o.push(
        `<button type="button" class="gbtn ghost" data-kcd="spark-l">Divine Spark: léčení ${kSparkK(K)}d8${bsg(kMd(K, "WIS"))}</button>${kSpojSel(K, "data-kcdk", true)}`,
      );
      o.push(
        `<button type="button" class="gbtn ghost" data-kcd="spark-z" ${btip(`Cíl do 30 stop: CON záchrana SO ${dc}, úspěch = polovina`)}>Divine Spark: zranění ${kSparkK(K)}d8${bsg(kMd(K, "WIS"))} Radiant/Necrotic</button>`,
      );
      o.push(
        `<button type="button" class="gbtn ghost" data-kcd="turn" ${btip(`Nemrtví do 30 stop: WIS záchrana SO ${dc}, při neúspěchu Vyděšený (Frightened) a Neschopný (Incapacitated) na minutu`)}>Turn Undead · WIS SO ${dc}</button>`,
      );
      /* Doména míru – Balm of Peace (2026-10-22): jedno použití léčí každého tvora, kolem kterého projdeš; další tvory téhož použití do 2 minut bez utracení */
      if (kMaRys(K, /^balm of peace$/i))
        o.push(
          `<button type="button" class="gbtn ghost" data-kcd="balm" ${btip(`Akce: pohyb o rychlost bez příležitostných útoků, každý tvor do 5 stop cestou +2d6${bsg(kMd(K, "WIS"))} HP (vybraný výše; další tvory téhož použití přidáš do 2 minut bez utracení)`)}>Balm of Peace: léčení 2d6${bsg(kMd(K, "WIS"))}${KBALM[K.id] && Date.now() - KBALM[K.id] < 120e3 ? " (další tvor)" : ""}</button>`,
        );
    }
    if (pa) {
      o.push(
        `<button type="button" class="gbtn ghost" data-kcd="sense" ${btip("Bonusová akce: 10 minut víš o Celestial, Fiend a Undead do 60 stop")}>Divine Sense</button>`,
      );
      if (kSeznam(K).some(x => /sacred weapon/i.test(x.n)) || (K.rysy || []).some(r => /sacred weapon/i.test(r)))
        o.push(
          `<button type="button" class="gbtn ghost" data-kcd="sacred" ${btip(`Zbraň: + ${kMd(K, "CHA")} CHA k útoku na 10 minut, září`)}>Sacred Weapon</button>`,
        );
    }
    L.push(`<div class="kschop"><b>Channel Divinity</b> <small>zbývá ${cd.zb}/${cd.q.max}</small><span>${o.join("")}</span></div>`);
  }
  const ar = kZdrN(K, /arcane recovery/i);
  if (ar && kTrU(c, "Wizard")) {
    const lim = Math.ceil(kTrU(c, "Wizard") / 2),
      pou = kSloty(K).filter(q => !q.pakt && q.st <= 5 && q.u > 0);
    L.push(
      `<div class="kschop"><b>Arcane Recovery</b> <small>po krátkém odpočinku · sloty do součtu ${lim}, nejvýš 5. stupně${ar.zb ? "" : " · už použito"}</small><span>${pou.length && ar.zb ? pou.map(q => `<label class="bst"><input type="number" min="0" max="${q.u}" value="0" data-karv="${q.k}" data-st="${q.st}" style="width:3.2em" aria-label="Kolik slotů ${q.st}. st."> ${q.st}. st. <small>(${q.u} použito)</small></label>`).join("") + `<button type="button" class="gbtn ghost" data-kar>Obnovit sloty</button>` : `<small>${ar.zb ? "žádný použitý slot" : ""}</small>`}</span></div>`,
    );
  }
  /* Doména míru – Emboldening Bond (2026-10-22): utratí použití, sobě zapne kostku 1d4; spojenci si ji zapnou sami (jako Bless) */
  const eb = kZdrN(K, /^emboldening bond$/i);
  if (eb && kTrU(c, "Cleric"))
    L.push(
      `<div class="kschop"><b>Emboldening Bond</b> <small>akce · až ${kPB(K)} tvorů do 30 stop na 10 minut · zbývá ${eb.zb}/${eb.q.max}</small><span><button type="button" class="gbtn ghost" data-kemb${eb.zb ? "" : " disabled"} ${btip("Spojení tvoři si k jednomu hodu za tah přičtou 1d4; tobě se kostka zapne, spojenci si zapnou „Emboldening Bond“ v kostkách k hodům na své kartě")}>Vytvořit pouto</button></span></div>`,
    );
  /* Cesta horlivce – Warrior of the Gods (2026-10-22): zásoba d12 na vlastní léčení, bonusová akce */
  const wg = kZdrN(K, /^warrior of the gods$/i);
  if (wg && kTrU(c, "Barbarian"))
    L.push(
      `<div class="kschop"><b>Warrior of the Gods</b> <small>bonusová akce · léčivé d12 · zbývá ${wg.zb}/${wg.q.max}</small><span><input type="number" min="1" max="${wg.zb || 1}" value="1" data-kwgv inputmode="numeric" aria-label="Kolik kostek" style="width:3.5em"><button type="button" class="gbtn ghost" data-kwg${wg.zb ? "" : " disabled"} ${btip("Hodíš zvoleným počtem d12 a tolik HP si vyléčíš")}>Léčit se</button></span></div>`,
    );
  /* Věštec – Portent (2026-10-22): hody d20 z dlouhého odpočinku; „použít“ hod zapíše do záznamu a odebere */
  if (kMaRys(K, /^portent$/i)) {
    const P = kartaStav(K.id).port || [],
      n = kMaRys(K, /^greater portent$/i) ? 3 : 2;
    L.push(
      `<div class="kschop"><b>Portent</b> <small>${n}d20 po dlouhém odpočinku · před hodem nahradí d20 tobě nebo tvoru, kterého vidíš (jednou za tah)</small><span>${P.map((v, i) => `<button type="button" class="gbtn ghost" data-kport="${i}" ${btip(`Použít předzvěst ${v} místo hodu d20 – zapíše se do záznamu`)}>Použít ${v}</button>`).join("")}${P.length ? "" : `<small>žádná předzvěst</small> <button type="button" class="gbtn ghost" data-kportn ${btip(`Hodit ${n}d20 (po dlouhém odpočinku se hází samy)`)}>Hodit ${n}d20</button>`}</span></div>`,
    );
  }
  return L.length ? `<section class="kdbsec kschopy" data-kac="X"><h4 class="kdbsh">Schopnosti povolání</h4>${L.join("")}</section>` : "";
}
const KBALM = {};
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const b = T("[data-kbardd],[data-kloh],[data-klohp],[data-klohr],[data-kcd],[data-kar],[data-kemb],[data-kwg],[data-kport],[data-kportn]");
  if (!b) return;
  const K = kvK(b);
  if (!K || !kMuze(K)) return;
  const box = b.closest(".kschop") || document,
    S = kartaStav(K.id);
  if (b.matches("[data-kemb]")) {
    const z = kZdrN(K, /^emboldening bond$/i);
    if (!z || !z.zb) return;
    await kZdrUtrat(K, z);
    const P = kPri(K).filter(n => n !== "Emboldening Bond");
    await kartaStavZmen(K.id, {pri: [...P, "Emboldening Bond"]}, null, {bezZpet: true});
    await kUcPridej(K, "Emboldening Bond", 1 / 6, false);
    kHodZapis({
      k: K.id,
      kdo: K.n,
      co: "Emboldening Bond",
      txt: `pouto na 10 minut pro až ${kPB(K)} tvorů – spojenci si zapnou kostku Emboldening Bond na své kartě (zbývá ${z.zb - 1}/${z.q.max})`,
    });
    mmHlasG(`${K.n}: Emboldening Bond – spojenci si zapnou kostku na své kartě.`, 5000);
    return;
  }
  if (b.matches("[data-kwg]")) {
    const z = kZdrN(K, /^warrior of the gods$/i);
    if (!z || !z.zb) return;
    const n = Math.max(1, Math.min(z.zb, Math.round(+(box.querySelector("[data-kwgv]") || {}).value || 1))),
      r = kVyraz(`${n}d12`);
    if (!r) return;
    await kZdrUtrat(K, z, n);
    await kLecKarta(K, r.tot, K, "Warrior of the Gods");
    kHodZapis({k: K.id, kdo: K.n, co: "Warrior of the Gods", tot: r.tot, txt: `${r.txt} → +${r.tot} HP (zbývá ${z.zb - n}/${z.q.max} d12)`});
    return;
  }
  if (b.matches("[data-kport],[data-kportn]")) {
    const P = [...(S.port || [])];
    if (b.matches("[data-kportn]")) {
      if (P.length) return;
      const n = kMaRys(K, /^greater portent$/i) ? 3 : 2,
        N = [...Array(n)].map(() => bK(20));
      await kartaStavZmen(K.id, {port: N}, `${K.n}: Předzvěst ${N.join(", ")}.`);
      kHodZapis({k: K.id, kdo: K.n, co: "Portent", txt: `předzvěst: ${N.join(", ")}`});
      return;
    }
    const i = +b.dataset.kport,
      v = P[i];
    if (v == null) return;
    P.splice(i, 1);
    await kartaStavZmen(K.id, {port: P.length ? P : null}, `${K.n}: Předzvěst ${v} použita.`);
    kHodZapis({
      k: K.id,
      kdo: K.n,
      co: "Portent – použití",
      tot: v,
      txt: `d20 nahrazena předzvěstí ${v}${P.length ? ` (zbývá ${P.join(", ")})` : " (poslední)"}`,
    });
    return;
  }
  if (b.matches("[data-kbardd]")) {
    const z = kZdrN(K, /bardic inspiration/i),
      id = (box.querySelector("[data-kbardk]") || {}).value,
      K2 = KARTBY[id],
      kk = kBardK(K);
    if (!z || !z.zb || !K2) return;
    if ((await kOdklad(`Bardic Inspiration d${kk} → ${K2.n}`, () => true)) === false) return;
    if (navrhPotreba()) {
      await kZdrUtrat(K, z);
      await navrhPosli(K, {typ: "bardic", cil: K2.id, k: kk, popis: `Bardic Inspiration d${kk} → ${K2.n}`, vratit: {k: z.q.n, n: 1}});
      return;
    }
    try {
      if (kMuze(K2)) {
        const P = kPri(K2).filter(n => !/^Bardic /.test(n));
        await kartaStavZmen(K2.id, {pri: [...P, "Bardic d" + kk]}, null, {bezZpet: true});
      } else if (window.MMDB && MMDB.kartaBardic) {
        await MMDB.kartaBardic(K2.id, kk, K.id);
        await kartyNacti();
      } else {
        mmHlasG(`${K2.n}: kostku zapiš na jeho kartě.`, 4000);
      }
      await kZdrUtrat(K, z);
      kHodZapis({k: K.id, kdo: K.n, co: "Bardic Inspiration", txt: `${K2.n} dostává d${kk} – přičte ji k dalšímu hodu d20`});
      mmHlasG(`${K2.n}: Bardic Inspiration d${kk}.`, 4000);
    } catch (err) {
      mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
    }
    return;
  }
  if (b.matches("[data-kloh],[data-klohp],[data-klohr]")) {
    const lm = kLohMax(K),
      U = Object.assign({}, S.zdr || {}),
      u = Math.min(lm, U["Lay on Hands"] || 0),
      zb = lm - u;
    if (b.matches("[data-klohr]")) {
      U["Lay on Hands"] = Math.max(0, u - 1);
      if (!U["Lay on Hands"]) delete U["Lay on Hands"];
      await kartaStavZmen(K.id, {zdr: Object.keys(U).length ? U : null});
      return;
    }
    if (b.matches("[data-klohp]")) {
      if (zb < 5) return;
      const K2 = KARTBY[(box.querySelector("[data-klohk]") || {}).value] || K;
      U["Lay on Hands"] = u + 5;
      await kartaStavZmen(K.id, {zdr: U});
      if (K2 === K) {
        const st = (S.stavy || []).filter(x => x !== "otrávený");
        await kartaStavZmen(K.id, {stavy: st.length ? st : null}, null, {bezZpet: true});
      }
      kHodZapis({k: K.id, kdo: K.n, co: "Lay on Hands", txt: `${K2.n}: konec otravy (−5 ze zásoby)`});
      return;
    }
    const v = Math.max(1, Math.min(zb, Math.round(+(box.querySelector("[data-klohv]") || {}).value || 0))),
      K2 = KARTBY[(box.querySelector("[data-klohk]") || {}).value] || K;
    if (!zb) return;
    if (K2 !== K && (await kOdklad(`Lay on Hands → ${K2.n} +${v} HP`, () => true)) === false) return;
    U["Lay on Hands"] = u + v;
    await kartaStavZmen(K.id, {zdr: U});
    await kLecKarta(K2, v, K, "Lay on Hands", {k: "Lay on Hands", n: v});
    kHodZapis({k: K.id, kdo: K.n, co: "Lay on Hands", tot: v, txt: `${K2.n}: +${v} HP (zásoba ${zb - v}/${lm})`});
    return;
  }
  if (b.matches("[data-kcd]")) {
    const z = kZdrN(K, /channel divinity/i);
    if (!z) return;
    if (!z.zb) {
      mmHlasG("Channel Divinity už nezbývá.", 3000);
      return;
    }
    const t = b.dataset.kcd,
      dc = 8 + kPB(K) + kMd(K, "WIS"),
      n = kSparkK(K),
      w = kMd(K, "WIS");
    if (t === "balm") {
      const dal = KBALM[K.id] && Date.now() - KBALM[K.id] < 120e3,
        K2 = KARTBY[(box.querySelector("[data-kcdk]") || {}).value] || K,
        r = kVyraz(`2d6${w ? (w > 0 ? "+" : "") + w : ""}`),
        hp = Math.max(1, r ? r.tot : 1);
      if (!dal) await kZdrUtrat(K, z);
      KBALM[K.id] = Date.now();
      await kLecKarta(K2, hp, K, "Balm of Peace");
      kHodZapis({k: K.id, kdo: K.n, co: "Balm of Peace", tot: hp, txt: `${K2.n}: ${r ? r.txt : "1"} → +${hp} HP${dal ? " (totéž použití)" : ""}`});
      mmHlasG(`Balm of Peace: ${K2.n} +${hp} HP${dal ? "" : " – další tvory téhož použití přidej do 2 minut"}.`, 5000);
      kartyPrekresli();
      return;
    }
    await kZdrUtrat(K, z);
    if (t === "spark-l" || t === "spark-z") {
      const r = kVyraz(`${n}d8${w ? (w > 0 ? "+" : "") + w : ""}`);
      if (!r) return;
      if (t === "spark-l") {
        const K2 = KARTBY[(box.querySelector("[data-kcdk]") || {}).value] || K;
        await kLecKarta(K2, r.tot, K, "Divine Spark");
        kHodZapis({k: K.id, kdo: K.n, co: "Divine Spark – léčení", tot: r.tot, txt: `${K2.n}: ${r.txt}`});
      } else
        kHodZapis({
          k: K.id,
          kdo: K.n,
          co: "Divine Spark – zranění",
          tot: r.tot,
          txt: `${r.txt} Radiant nebo Necrotic · CON záchrana SO ${dc}, úspěch = ${Math.floor(r.tot / 2)}`,
        });
      mmHlasG(`Divine Spark: ${r.tot}`, 4000);
      return;
    }
    const tx = {
      turn: `nemrtví do 30 stop: WIS záchrana SO ${dc}; neúspěch = Vyděšený (Frightened) a Neschopný (Incapacitated) 1 minutu nebo do zranění`,
      sense: "10 minut cítí Celestial, Fiend a Undead do 60 stop",
      sacred: `zbraň září, +${kMd(K, "CHA")} k útokům na 10 minut`,
    }[t];
    kHodZapis({k: K.id, kdo: K.n, co: {turn: "Turn Undead", sense: "Divine Sense", sacred: "Sacred Weapon"}[t], txt: tx});
    if (t === "sacred") {
      const L = kUc(K).filter(x => x.n !== "Sacred Weapon"),
        tt = kTed();
      L.push(Object.assign({n: "Sacred Weapon", h: 1 / 6}, tt != null ? {do: Math.round((tt + 1 / 6) * 1000) / 1000} : {}));
      await kartaStavZmen(K.id, {uc: L.slice(-30)}, null, {bezZpet: true});
    }
    return;
  }
  if (b.matches("[data-kar]")) {
    const z = kZdrN(K, /arcane recovery/i);
    if (!z || !z.zb) return;
    const lim = Math.ceil(kTrU(kCtx(K), "Wizard") / 2),
      U = Object.assign({}, S.zdr || {});
    let sum = 0;
    const co = [];
    box.querySelectorAll("[data-karv]").forEach(i => {
      const n = Math.max(0, Math.min(+i.max, Math.round(+i.value || 0)));
      if (!n) return;
      sum += n * +i.dataset.st;
      U[i.dataset.karv] = Math.max(0, (U[i.dataset.karv] || 0) - n);
      if (!U[i.dataset.karv]) delete U[i.dataset.karv];
      co.push(`${n}× ${i.dataset.st}. st.`);
    });
    if (!sum) {
      mmHlasG("Vyber sloty k obnovení.", 3000);
      return;
    }
    if (sum > lim) {
      mmHlasG(`Součet stupňů ${sum} je víc než ${lim}.`, 4000);
      return;
    }
    U[z.q.n] = (U[z.q.n] || 0) + 1;
    await kartaStavZmen(K.id, {zdr: U}, `${K.n}: Arcane Recovery – ${co.join(", ")}.`);
    kHodZapis({k: K.id, kdo: K.n, co: "Arcane Recovery", txt: co.join(", ")});
    return;
  }
});
/* ---- bonusy pro hody z Discordu: prohlížeč hráče zapíše spočítané bonusy karty (jen když se změní) ---- */
const KMODSP = {};
function kModsSync(K) {
  if (!window.MMDB || !kMuze(K) || K.test) return;
  let m;
  try {
    m = {n: K.n, in: kIni(K), ov: {}, za: {}, dv: {}};
    BAB.forEach(a => {
      m.ov[a] = kOvB(K, a);
      m.za[a] = kZach(K, a);
    });
    Object.keys(KDOVAB).forEach(n => {
      m.dv[n] = kDov(K, n);
    });
  } catch (e) {
    return;
  }
  const j = JSON.stringify(m);
  if (KMODSP[K.id] === j || JSON.stringify(kartaStav(K.id).mods || null) === j) return;
  KMODSP[K.id] = j;
  clearTimeout(KMODSP["t" + K.id]);
  KMODSP["t" + K.id] = setTimeout(() => {
    MMDB.kartaStav(K.id, "mods", m)
      .then(() => {
        KST[K.id] = Object.assign({}, kartaStav(K.id), {mods: m});
      })
      .catch(() => {
        delete KMODSP[K.id];
      });
  }, 4000);
}
/* ---- upozornění v telefonu (Web Push) a instalace webu jako aplikace ---- */
const VAPID_PUB = "BDxrqAYvVnuc6ZjBR_QsO4jNXbE9vCqZoLGyUtheNCRNRVtVBvtO6IYWzpkGl87UbgB-yCImJmb3tMaTYkn4Ibg";
const pushUmi = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!window.MMDB;
const pushIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(navigator.standalone || matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches);
let PUSHST = null;
async function pushStav() {
  if (!pushUmi()) return null;
  try {
    const r = await navigator.serviceWorker.getRegistration();
    const s = r && (await r.pushManager.getSubscription());
    PUSHST = s ? "on" : "off";
  } catch (e) {
    PUSHST = "off";
  }
  return PUSHST;
}
async function pushZapni(karta) {
  if (!pushUmi()) {
    mmHlasG(
      pushIOS() ? "Na iPhonu nejdřív přidej web na plochu (Sdílet → Přidat na plochu) a otevři ho odtud." : "Tento prohlížeč upozornění neumí.",
      6000,
    );
    return;
  }
  try {
    const p = await Notification.requestPermission();
    if (p !== "granted") {
      mmHlasG("Upozornění jsou v prohlížeči zakázaná – povol je v nastavení webu.", 5000);
      return;
    }
    const r = await navigator.serviceWorker.ready,
      k = Uint8Array.from(atob(VAPID_PUB.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const s = (await r.pushManager.getSubscription()) || (await r.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: k}));
    await MMDB.pushPrihlas(s.toJSON(), karta || null);
    PUSHST = "on";
    mmHlasG("Upozornění zapnuta: výzvy k hodu, tah v boji a tajné zprávy přijdou i se zavřeným webem.", 5000);
    kartyPrekresli();
    if (typeof renderHra === "function" && mmNaHre()) renderHra();
  } catch (err) {
    mmHlasG("Upozornění se nepodařilo zapnout: " + (err.message || err), 6000);
  }
}
async function pushVypni() {
  try {
    const r = await navigator.serviceWorker.getRegistration(),
      s = r && (await r.pushManager.getSubscription());
    if (s) {
      await MMDB.pushOdhlas(s.endpoint).catch(() => {});
      await s.unsubscribe();
    }
    PUSHST = "off";
    mmHlasG("Upozornění vypnuta.", 3000);
    if (typeof renderHra === "function" && mmNaHre()) renderHra();
  } catch (err) {
    mmHlasG(err.message || String(err), 4000);
  }
}
let INSTP = null;
addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  INSTP = e;
});
const jeAplikace = () => matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || navigator.standalone === true;
function aplikaceHtml(karta) {
  if (!window.MMDB) return "";
  if (PUSHST == null && pushUmi())
    pushStav().then(s => {
      if (s && typeof renderHra === "function" && mmNaHre()) renderHra();
    });
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<section class="kapl"><h3 class="uvh2">Telefon</h3>
    ${jeAplikace() ? "" : INSTP ? `<p><button type="button" class="gbtn" data-instal>Nainstalovat jako aplikaci</button> <small>ikona na ploše, celá obrazovka, rychlé spuštění</small></p>` : ios ? `<p class="rsmall">Na iPhonu: v Safari klepni na <b>Sdílet</b> → <b>Přidat na plochu</b>. Upozornění pak fungují z ikony na ploše (iOS 16.4+). Přihlášení přes Discord udělej až v aplikaci z plochy – Safari a aplikace si ho navzájem nepředají.</p>` : `<p class="rsmall">Web jde přidat na plochu: v menu prohlížeče zvol <b>Nainstalovat aplikaci</b> nebo <b>Přidat na plochu</b>.</p>`}
    ${pushUmi() ? (PUSHST === "on" ? `<p>🔔 Upozornění zapnuta <button type="button" class="gbtn ghost" data-pushoff>Vypnout</button></p>` : `<p><button type="button" class="gbtn ghost" data-pushon="${besc(karta || "")}">🔔 Zapnout upozornění</button> <small>výzva k hodu, tah v boji, tajná zpráva – i se zavřeným webem</small></p>`) : ios ? "" : `<p class="rsmall">Tento prohlížeč upozornění neumí.</p>`}</section>`;
}
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  if (T("[data-instal]") && INSTP) {
    INSTP.prompt();
    try {
      await INSTP.userChoice;
    } catch (x) {}
    INSTP = null;
    if (typeof renderHra === "function") renderHra();
    return;
  }
  const on = T("[data-pushon]");
  if (on) {
    pushZapni(on.dataset.pushon || (GMV ? null : (JA.get() || {}).k));
    return;
  }
  if (T("[data-pushoff]")) {
    pushVypni();
    return;
  }
  if (T("[data-kimgx]")) {
    const K = kvK(e.target);
    if (K && kMuze(K) && confirm("Odebrat portrét?")) kartaStavZmen(K.id, {img: null});
    return;
  }
  if (T("[data-khistb]")) {
    const K = kvK(e.target);
    if (K) {
      document.querySelectorAll(".kdbmenu[open]").forEach(d => (d.open = false));
      kHistorie(K);
    }
    return;
  }
  if (T("[data-kpensloz]")) {
    const K = kvK(e.target);
    if (!K || !kMuze(K)) return;
    const S = kartaStav(K.id),
      P = kPenSloz(S.pen || K.penize || {});
    await kartaStavZmen(K.id, {pen: Object.keys(P).length ? P : null}, `${K.n}: mince rozměněny.`);
    return;
  }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kinvv]")) return;
  const K = kvK(t);
  if (!K || !kMuze(K)) return;
  const S = kartaStav(K.id),
    inv = JSON.parse(JSON.stringify(S.inv || K.vybaveni || [])),
    x = inv[+t.dataset.kinvv];
  if (!x) return;
  if (t.value) x.v = t.value.slice(0, 80);
  else delete x.v;
  await kartaStavZmen(K.id, {inv});
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-kpenf]")) return;
  e.preventDefault();
  const K = kvK(f);
  if (!K || !kMuze(K)) return;
  const E = f.elements,
    S = kartaStav(K.id),
    pen = S.pen || K.penize || {};
  if (E.z.value === E.na.value) return;
  const P = kPenSmen(pen, E.z.value, E.na.value, +E.q.value);
  if (!P) {
    mmHlasG(`Na 1 ${E.na.value} to nestačí (nebo tolik ${E.z.value} nemáš).`, 3500);
    return;
  }
  await kartaStavZmen(K.id, {pen: Object.keys(P).length ? P : null}, `${K.n}: směněno ${E.z.value} → ${E.na.value}.`);
});
/* ---- pokladna družiny ---- */
let POKL = null;
async function poklNacti() {
  if (!window.MMDB || !MMDB.pokladna) return;
  try {
    POKL = (await MMDB.pokladnaNacti()) || {};
  } catch (e) {}
}
function poklHtml() {
  const P = (POKL && POKL.pen) || {},
    K = jaK(),
    muze = GMV || (K && KZAM.has(K.id));
  return `<section><h3 class="uvh2">${kMinceIk("pokladna")}Pokladna družiny</h3><p class="kpok">${
    ["PP", "GP", "EP", "SP", "CP"].some(k => +P[k]) ? kPenHtml(P) : "prázdná"
  }</p>
    ${
      muze && window.MMDB
        ? `<form class="kvlh" data-poklf><select name="k" aria-label="Mince">${kMinceNab(P)
            .map(k => `<option>${k}</option>`)
            .join(
              "",
            )}</select><input name="v" type="number" min="1" max="1000000" placeholder="kolik" required><input name="p" placeholder="za co (nepovinné)" maxlength="100"><button class="gbtn ghost" data-pokl="1" name="smer" value="1">Vložit</button><button class="gbtn ghost" data-pokl="-1" name="smer" value="-1">Vybrat</button></form>`
        : ""
    }
    ${typeof poklVeciHtml === "function" ? poklVeciHtml() : ""}
    ${
      ((POKL && POKL.log) || []).length
        ? `<details class="bjapd"><summary>Pohyby</summary><ul class="kfeat">${POKL.log
            .slice(0, 20)
            .map(
              l =>
                `<li><small>${(() => {
                  try {
                    return new Date(l.cas).toLocaleString("cs-CZ", {day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"});
                  } catch (e) {
                    return "";
                  }
                })()}</small> ${besc(l.kdo)}: ${
                  l.vec
                    ? besc(l.vec)
                    : Object.entries(l.z || {})
                        .map(([k, v]) => `${v > 0 ? "+" : ""}${v} ${k}`)
                        .join(", ")
                } ${besc(l.p || "")}</li>`,
            )
            .join("")}</ul></details>`
        : ""
    }</section>`;
}
/* ---- tisk a export ---- */
function kExport(K) {
  const b = new Blob([JSON.stringify({karta: K, stav: kartaStav(K.id)}, null, 1)], {type: "application/json"}),
    a = document.createElement("a");
  a.href = URL.createObjectURL(b);
  a.download = `${K.id}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}
/* uložení importované karty: texty schopností zvlášť (soukromě); hráč přepisuje jen svou kartu */
async function kartaUlozImport(K0) {
  const K = Object.assign({}, K0),
    tx = K.texty;
  delete K.texty;
  const j = JA.get();
  if (!GMV && j && j.k) K.id = j.k;
  const i = await KDB.uloz(K);
  kartyNastav([{id: i, karta: K, stav: kartaStav(i)}]);
  if (tx) await kTextyUloz(i, tx);
  if (KIMPINV && kartaStav(i).inv) await kartaStavZmen(i, {inv: null}, null, {bezZpet: true});
  return i;
}
const KSLV = {};
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kslvb]");
  if (!b) return;
  const K = kvK(b);
  if (!K) return;
  KSLV[K.id + ":" + b.dataset.kslvb] = b.dataset.k;
  if (typeof bdmPrekresli === "function" && b.closest(".bdm")) bdmPrekresli();
  else kartyPrekresli();
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches) return;
  if (t.matches("[data-kcil]")) {
    const K = kvK(t);
    if (K) KCIL[K.id + ":" + t.dataset.kcil] = t.value;
    return;
  }
  if (t.matches("[data-kimphra]") && t.files[0]) {
    try {
      KIMP = await kartaImport(t.files[0]);
      renderHra();
    } catch (err) {
      mmHlasG("Import se nepodařil: " + (err.message || err), 7000);
    }
    return;
  }
});
document.addEventListener("input", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-kpripq]")) {
    KPRIP = t.value;
    const K = kvK(t),
      box = t.closest(".kpripw");
    if (K && box) {
      const nn = document.createElement("div");
      nn.innerHTML = kPripHtml(K);
      box.querySelector(".kprip").replaceWith(nn.querySelector(".kprip"));
    }
  }
});
document.addEventListener("click", async e => {
  const T = s => e.target.closest(s);
  if (T("[data-discprik]") && GMV) {
    try {
      await MMDB.discordPrikazy();
      mmHlasG("Příkaz /hod je na Discordu zaregistrovaný (může trvat pár minut, než se ukáže).", 6000);
    } catch (err) {
      mmHlasG(err.message || String(err), 7000);
    }
    return;
  }
  if (T("[data-discordx]")) {
    await MMDB.discordOdhlas();
    JA.set(null);
    DCU.ok = false;
    DCU.typ = "";
    route();
    return;
  }
  const jz = T("[data-jazvol]");
  if (jz) {
    jaZvol(jz.dataset.jazvol);
    return;
  }
  if (T("[data-kimpja]") && KIMP) {
    try {
      const K = Object.assign({}, KIMP),
        i = await kartaUlozImport(K);
      await MMDB.jaKarta(i, DCU.jmeno);
      KIMP = null;
      JA.set({k: i, n: K.n, d: 1});
      KZAM.add(i);
      await kartyNacti();
      mmHlasG(`Karta uložena – hraješ za ${K.n}.`, 4000);
      hraPoll(true);
      renderHra();
    } catch (err) {
      mmHlasG(err.message || String(err), 6000);
    }
    return;
  }
  const K = kvK(e.target);
  const ry = T("[data-krys]");
  if (ry && K) {
    if (!SRDRY) await srdRysy();
    if (!SRDRYT && kRysSrd(ry.dataset.krys)) await srdRysyTexty();
    mmPop(kRysPopis(K, ry.dataset.krys));
    return;
  }
  if (!K) return;
  const sz = T("[data-kspz]");
  if (sz) {
    const i = +sz.dataset.kspz,
      x = kSeznam(K)[i];
    if (!x) return;
    const q = kSlX(K, x).find(z => z.k === KSLV[K.id + ":" + i]) || kSlX(K, x)[0];
    kSpZraneni(K, x, q && (x.st > 0 || x.pz) ? q.st : x.st, false, KMASS[x.n] ? {mass: kCile(K, i)} : KCIL[K.id + ":" + i]);
    if (KMASS[x.n]) kCilM(K, i).clear();
    return;
  }
  const ks = T("[data-kstav]");
  if (ks) {
    const L = [...(kartaStav(K.id).stavy || [])],
      k = ks.dataset.kstav,
      on = L.includes(k);
    let N = on ? L.filter(x => x !== k) : [...L, k];
    if (k === "soustředí" && kKonDrzi(K)) {
      await kKonZtrata(K, "ukončeno");
      return;
    }
    if (!on && SRDST[k] && SRDST[k].nej && kKonDrzi(K)) {
      N = N.filter(x => x !== "soustředí");
      await kartaStavZmen(K.id, {stavy: N.length ? N : null});
      await kKonZtrata(K, `${k} – soustředění končí`);
      kHodZapis({k: K.id, kdo: K.n, co: "Stav", txt: k});
      return;
    }
    if (!on && k === "vyděšený" && kDuse(K).sv >= 8) {
      mmHlasG(`${K.n} je V milosti – imunní vůči Frightened.`, 4000);
      return;
    }
    await kartaStavZmen(K.id, {stavy: N.length ? N : null});
    kHodZapis({k: K.id, kdo: K.n, co: on ? "Stav skončil" : "Stav", txt: k});
    return;
  }
  const pn = T("[data-kpn]");
  if (pn) {
    const S = kartaStav(K.id),
      n = pn.dataset.kpn;
    await kartaStavZmen(K.id, {
      kpn: [...new Set([...(S.kpn || []), n])].slice(0, 80),
      kpx: (S.kpx || []).filter(x => x !== n).length ? (S.kpx || []).filter(x => x !== n) : null,
    });
    kHodZapis({k: K.id, kdo: K.n, co: "Připravil kouzlo", txt: n});
    return;
  }
  const sx = T("[data-kspolx]");
  if (sx) {
    if (!confirm("Odebrat společníka?")) return;
    const L = [...kSpol(K)];
    L.splice(+sx.dataset.kspolx, 1);
    kSpolUloz(K, L);
    return;
  }
  /* společník v boji: do boje, z boje, útok z telefonu */
  const sb = T("[data-kspolboj],[data-kspolz],[data-kspolut]");
  if (sb) {
    const B = kSpolBoj(K);
    if (!B) {
      mmHlasG("Boj neběží, nebo nejsi v něm se svou postavou.", 3500);
      return;
    }
    const i = +(sb.dataset.kspolboj ?? sb.dataset.kspolz ?? String(sb.dataset.kspolut).split(":")[0]),
      s0 = kSpol(K)[i];
    if (!s0) return;
    const sid = kSpolId(K, i),
      vb = (B.s.npc || []).find(o => o.id === sid);
    try {
      if (sb.dataset.kspolboj != null) {
        const o = {
          id: sid,
          n: s0.n.slice(0, 60),
          ac: Math.max(0, Math.min(40, Math.round(+s0.ac || 10))),
          hpc: Math.max(0, Math.min(999, Math.round(+s0.hp || 0))),
          hpm: Math.max(1, Math.min(999, Math.round(+s0.max || 1))),
          ut: (s0.ut || [])
            .slice(0, 8)
            .map(a =>
              Object.assign(
                {n: String(a.n).slice(0, 40), b: Math.max(-5, Math.min(30, Math.round(+a.b || 0)))},
                a.z && /^[0-9]{0,2}d[0-9]{1,3}([+-][0-9]{1,2})?$/.test(a.z) ? {z: a.z} : {},
                a.t && BZTYPY.includes(a.t) ? {t: a.t} : {},
              ),
            ),
        };
        if (s0.src && PROTBY[s0.src]) o.src = s0.src;
        await bojDB.hrac(B.me.id, "spol", o);
        kHodZapis({k: K.id, kdo: K.n, co: "Společník do boje", txt: s0.n});
        mmHlasG(`${s0.n} je v boji jako spojenec.`, 3500);
      } else if (sb.dataset.kspolz != null) {
        if (vb) {
          const L = kSpol(K).map(x => Object.assign({}, x));
          L[i].hp = Math.max(0, +vb.hpc || 0);
          await kSpolUloz(K, L);
        }
        await bojDB.hrac(B.me.id, "spol", {id: sid, x: true});
        mmHlasG(`${s0.n} odešel z boje.`, 3000);
      } else {
        const [, j] = sb.dataset.kspolut.split(":").map(Number),
          a = (s0.ut || [])[j];
        if (!a || !vb) return;
        const cil = KSPOLC[sid],
          c = (B.s.npc || []).find(o => o.id === cil);
        if (!c) {
          mmHlasG("Vyber cíl.", 2500);
          return;
        }
        if (bojNeschopny(vb.stav)) {
          mmHlasG(`${s0.n} nemůže jednat – ${bojNeschopny(vb.stav)}.`, 3500);
          return;
        }
        const nv = bojAdvHrac(B.s, {stav: vb.stav || []}, c, false),
          adv = nv.v,
          d1 = bK(20),
          d2 = adv ? bK(20) : null,
          d = adv > 0 ? Math.max(d1, d2) : adv < 0 ? Math.min(d1, d2) : d1,
          hod = d + (+a.b || 0),
          krit = d === 20,
          z = a.z ? bojKostky(a.z, krit) : null,
          dmg = z ? z.t : 0;
        const u = {
          ci: [c.id],
          cim: String(a.n).slice(0, 60),
          hod: Math.max(-10, Math.min(60, hod)),
          d,
          adv,
          dmg: Math.max(0, Math.min(300, dmg)),
          sid,
        };
        if (a.t && BZTYPY.includes(a.t)) u.t = a.t;
        if ((await kOdklad(`${s0.n}: ${a.n} → ${c.n}`, () => true)) === false) return;
        await bojDB.utok(B.me.id, u);
        kHodZapis({
          k: K.id,
          kdo: `${s0.n} (${K.n})`,
          co: `Útok – ${a.n} → ${c.n}`,
          tot: hod,
          d,
          krit,
          mis: d === 1,
          adv,
          txt: `d20 ${d1}${d2 != null ? ` / ${d2} (${adv > 0 ? "výhoda" : "nevýhoda"})` : ""} ${bsg(+a.b || 0)} = ${hod}${krit ? " · kritický zásah" : d === 1 ? " · minutí" : ""}${z ? ` · zranění ${z.t} (${z.x}) ${BZRT[a.t] || a.t || ""}` : ""}${nv.why.length ? " · " + nv.why.join(", ") : ""}`,
        });
        mmHlasG(`${s0.n}: ${a.n} ${hod}${z ? `, zranění ${z.t}` : ""} – čeká na vypravěče.`, 4500);
      }
      BOJ.v = -2;
      await bojNacti();
      kartyPrekresli();
    } catch (err) {
      mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
    }
    return;
  }
  const sh = T("[data-kspolh]");
  if (sh) {
    const i = +sh.dataset.kspolh,
      inp = document.querySelector(`[data-kspolv="${i}"]`),
      v = Math.round(+(inp && inp.value) || 0);
    if (!(v > 0)) {
      mmHlasG("Zadej počet HP.", 2000);
      return;
    }
    {
      const B = kSpolBoj(K),
        sid = kSpolId(K, i),
        vb = B && (B.s.npc || []).find(o => o.id === sid);
      if (vb) {
        const hpc = Math.max(0, Math.min(+vb.hpm || 999, (+vb.hpc || 0) + v * +sh.dataset.d));
        try {
          await bojDB.hrac(B.me.id, "spol", {
            id: sid,
            n: vb.n,
            ac: +vb.ac || 10,
            hpc,
            hpm: +vb.hpm || 1,
            ut: vb.ut || [],
            ...(vb.b && vb.b !== sid ? {src: vb.b} : {}),
          });
          BOJ.v = -2;
          await bojNacti();
          kartyPrekresli();
        } catch (err) {
          mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
        }
        return;
      }
    }
    const L = kSpol(K).map(x => Object.assign({}, x)),
      s0 = L[i];
    if (!s0) return;
    s0.hp = Math.max(0, Math.min(+s0.max || 999, (+s0.hp || 0) + v * +sh.dataset.d));
    await kSpolUloz(K, L);
    kHodZapis({k: K.id, kdo: K.n, co: `${s0.n}: ${+sh.dataset.d < 0 ? "zranění" : "léčení"}`, txt: `${v} → ${s0.hp}/${s0.max}`});
    if (!s0.hp) mmHlasG(`${s0.n} padl na 0 HP.`, 4000);
    return;
  }
  const su = T("[data-kspolu]");
  if (su) {
    const [i, j] = su.dataset.kspolu.split(":").map(Number),
      s0 = kSpol(K)[i],
      a = s0 && (s0.ut || [])[j];
    if (!a) return;
    const d = bK(20),
      tot = d + (+a.b || 0),
      z = a.z ? kVyraz(d === 20 ? a.z.replace(/(\d+)d/g, (q, n) => `${2 * n}d`) : a.z) : null;
    kHodZapis({
      k: K.id,
      kdo: K.n,
      co: `${s0.n} – ${a.n}`.slice(0, 80),
      tot,
      d,
      txt: `d20 ${d} ${bsg(+a.b || 0)} = ${tot}${d === 20 ? " · kritický zásah" : d === 1 ? " · minutí" : ""}${z ? ` · zranění ${z.tot} (${z.txt}) ${BZRT[a.t] || a.t || ""}` : ""}`,
    });
    mmHlasG(`${s0.n}: ${a.n} ${tot}${z ? `, zranění ${z.tot}` : ""}`, 5000);
    return;
  }
  if (T("[data-ktisk]")) {
    document.querySelectorAll(".kcard .ktab").forEach(x => (x.dataset.pred = x.hidden ? "1" : ""));
    document.querySelectorAll(".kcard .ktab").forEach(x => (x.hidden = false));
    print();
    setTimeout(
      () =>
        document.querySelectorAll(".kcard .ktab").forEach(x => {
          x.hidden = x.dataset.pred === "1";
        }),
      500,
    );
    return;
  }
  if (T("[data-kexport]")) {
    kExport(K);
    return;
  }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches) return;
  if (f.matches("[data-poklf]")) {
    e.preventDefault();
    const E = f.elements,
      sm = +((e.submitter && e.submitter.value) || 1),
      v = Math.round(+E.v.value || 0);
    if (!(v > 0)) return;
    const K = jaK();
    try {
      POKL = await MMDB.pokladna({[E.k.value]: sm * v}, E.p.value.trim(), GMV ? null : K && K.id);
      mmHlasG("Pokladna upravena.", 2500);
      if (mmNaHre()) renderHra();
      else kartyPrekresli();
    } catch (err) {
      mmHlasG(err.message || String(err), 5000);
    }
    return;
  }
  if (f.matches("[data-discordf]") && GMV) {
    e.preventDefault();
    try {
      await MMDB.discordNastav(f.elements.u.value.trim());
      mmHlasG(f.elements.u.value.trim() ? "Webhook uložen – hody půjdou do Discordu." : "Webhook zrušen.", 4000);
      f.elements.u.value = "";
    } catch (err) {
      mmHlasG(err.message || String(err), 6000);
    }
    return;
  }
  const K = kvK(f);
  if (!K) return;
  if (f.matches("[data-kspolf]")) {
    e.preventDefault();
    const E = f.elements,
      n = E.n.value.trim();
    if (!n) return;
    const src = (NETV || []).find(x => x.n.toLowerCase() === E.srd.value.trim().toLowerCase());
    const o = {n: n.slice(0, 60), druh: E.druh.value.trim().slice(0, 40)};
    if (src) {
      o.src = src.id;
      o.max = o.hp = src.hp[0].max;
      o.ac = String(src.ac).replace(/\s*\(.*\)/, "");
      o.ut = (src.at || [])
        .filter(a => a.b != null)
        .slice(0, 6)
        .map(a => ({n: a.n, b: a.b, z: a.z || "", t: a.zt || ""}));
    }
    if (+E.hp.value) {
      o.max = o.hp = Math.round(+E.hp.value);
    }
    if (+E.ac.value) o.ac = Math.round(+E.ac.value);
    if (!o.max) {
      mmHlasG("Zadej životy, nebo vyber statistiky ze SRD.", 4000);
      return;
    }
    await kSpolUloz(K, [...kSpol(K), o].slice(0, 8));
    kHodZapis({k: K.id, kdo: K.n, co: "Společník", txt: `${o.n}${o.druh ? " (" + o.druh + ")" : ""}`});
    return;
  }
  if (f.matches("[data-kdoplf]")) {
    e.preventDefault();
    const E = f.elements,
      typ = f.dataset.kdoplf,
      D = JSON.parse(JSON.stringify(kDopl(K)));
    D[typ] = D[typ] || [];
    if (typ === "utoky") {
      const n = E.n.value.trim();
      if (!n) return;
      D.utoky.push({n: n.slice(0, 60), b: Math.round(+E.b.value || 0), z: E.z.value.replace(/\s/g, "").slice(0, 20), t: E.t.value, cas: E.cas.value});
    } else if (typ === "rysy") {
      const n = E.n.value.trim();
      if (!n) return;
      const r = {n: n.slice(0, 60), cas: E.cas.value || undefined, t: E.t.value.trim().slice(0, 1500)};
      if (+E.max.value) r.max = Math.round(+E.max.value);
      D.rysy.push(r);
    } else {
      const v = E.v.value.trim().slice(0, 60);
      if (!v) return;
      if (D[typ].some(x => x.toLowerCase() === v.toLowerCase())) {
        f.reset();
        return;
      }
      D[typ].push(v);
    }
    await kartaStavZmen(K.id, {dopl: D});
    f.reset();
    return;
  }
});
document.addEventListener("click", async e => {
  const x = e.target.closest("[data-kdoplx],[data-kzdbez],[data-kzdvrat]");
  if (!x) return;
  const K = kvK(x);
  if (!K) return;
  const D = JSON.parse(JSON.stringify(kDopl(K)));
  if (x.dataset.kdoplx) {
    const [typ, i] = x.dataset.kdoplx.split(":");
    (D[typ] || []).splice(+i, 1);
    if (!(D[typ] || []).length) delete D[typ];
  } else {
    /* zdatnost nebo jazyk z PDF skrýt / vrátit (2026-10-21): `dopl.bez` = ["jazyky:Elvish", …] */
    const k = x.dataset.kzdbez || x.dataset.kzdvrat,
      bez = new Set(D.bez || []);
    if (x.dataset.kzdbez) bez.add(k);
    else bez.delete(k);
    if (bez.size) D.bez = [...bez];
    else delete D.bez;
  }
  await kartaStavZmen(K.id, {dopl: Object.keys(D).length ? D : null});
});
/* rysy z PDF s texty a odkazy na SRD */
function kRysyHtml(K) {
  const L = K.rysy2 || [];
  if (!L.length) return (K.rysy || []).length ? `<p class="rsmall krysy">${K.rysy.map(besc).join(" · ")}</p>` : "";
  if (KTX[K.id] === undefined) kTexty(K);
  if (!SRDRY) srdRysy().then(() => kartyPrekresli());
  const sk = [...new Set(L.map(r => r.s))];
  return `<h3 class="uvh2">Rysy a schopnosti</h3>${sk
    .map(
      x =>
        `<h4 class="bsph">${besc(x.replace(/ FEATURES| TRAITS| SPECIES/g, "").toLowerCase())}</h4><p class="krysy2">${L.filter(r => r.s === x)
          .map(
            r =>
              `<button type="button" class="kspn${r.sub ? " ksub" : ""}" data-krys="${besc(r.n)}">${besc(r.n)}</button>${r.cas ? `<small class="kcas">${{A: "akce", BA: "bon.", R: "reakce"}[r.cas]}</small>` : ""}${kRysSrd(r.n) ? `<small class="ksrd" ${btip("Je v pravidlech SRD česky")}>SRD</small>` : ""}`,
          )
          .join(" · ")}</p>`,
    )
    .join("")}`;
}
/* ikonky kouzel: stupeň římskou číslicí v kolečku, trik hvězdičkou, soustředění a rituál (2026-10-17) */
const KRIM = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const kSpSt = (l, t) =>
  l
    ? `<span class="kspi kspv${l}" role="img" aria-label="${l}. stupeň" ${btip(t || `${l}. stupeň`)}>${KRIM[l] || l}</span>`
    : `<span class="kspi kspt" role="img" aria-label="Trik" ${btip(t || "Trik (Cantrip) – bez slotu")}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6l1.5 4.9 4.9 1.5-4.9 1.5L8 14.4 6.5 9.5 1.6 8l4.9-1.5z" fill="currentColor"/></svg></span>`;
const KICON = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8" cy="8" r="1.7" fill="currentColor"/></svg>`;
const KIRIT = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.4c1.5 1.7 1.7 3.1 0 4.3-1.7-1.2-1.5-2.6 0-4.3z" fill="currentColor"/><rect x="6.4" y="6.4" width="3.2" height="6.4" rx=".6" fill="currentColor"/><path d="M3.6 13.6h8.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const kKonI = () =>
  `<span class="kspi kspk" role="img" aria-label="Soustředění" ${btip("Soustředění (Concentration) – drží jen jedno kouzlo; zranění = CON záchrana")}>${KICON}</span>`;
const kRit = x =>
  !!x && (x.rit || /ritual|rituál/i.test(String(x.n || "") + " " + (x.cas || "")) || (typeof kSp === "function" && (kSp(x.n) || {}).ri === 1));
const kRitI = () =>
  `<span class="kspi kspr" role="img" aria-label="Rituál" ${btip("Rituál (Ritual) – lze seslat o 10 minut déle bez slotu")}>${KIRIT}</span>`;
const kSpZn = x => `${x.kon ? kKonI() : ""}${kRit(x) ? kRitI() : ""}`;
