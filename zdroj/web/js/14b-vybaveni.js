/* ===== Vybavení (2026-10-19): jeden seznam ve skupinách, věc na klepnutí (list zespodu s akcemi), sloučení stejných věcí,
   přejmenování a poznámka, použití spotřebních věcí (i v boji), dar spolubojovníkovi a pokladna družiny, peníze jedním řádkem,
   hledání. Data: stav karty `inv` [{n, q, w, mag, obl, pripoutano, nab, v (v batohu), pozn}], `pen`. ===== */
const KINVSK = [
  ["pri", "Připoutané"],
  ["boj", "Zbraně a zbroj"],
  ["spo", "Spotřební"],
  ["mag", "Magické předměty"],
  ["cen", "Cennosti"],
  ["vys", "Výstroj"],
];
const KINVSPO =
  /potion|lektvar|elixír|elixir|scroll|svit|holy water|svěcen|\boil\b|olej|\bacid\b|kyselin|alchemist|bomb|caltrop|ball bearing|antitoxin|ration|dávk|healer'?s kit|torch|pochodn|arrows?\b|bolts?\b|šíp|šipk|bullets?\b|needles?\b|ammunition|munice/i;
const KINVCEN =
  /\bgems?\b|diamond|ruby|rubín|emerald|smaragd|sapphire|safír|\bpearl\b(?! of power)|perl[aiy]\b|jewel|šperk|statuette|soška|\bidol\b|art object|cennost|\bjade\b|nefrit|\bonyx\b|\bopal\b|\bamber\b|jantar|zlat[ýá] (prsten|řetěz)|šupin/i;
/* vrhací spotřební věci podle SRD 5.2.1 (výstroj): místo jednoho útoku akce Útok; cíl do 20 stop, záchrana AGI SO 8 + AGI + zdatnost */
const KINVHOD = [
  [/holy water|svěcen/i, {z: "2d8", t: "Radiant", p: "jen proti Fiend a Undead"}],
  [/\bacid\b|kyselin/i, {z: "2d6", t: "Acid"}],
  [/alchemist|alchymist/i, {z: "1d4", t: "Fire", p: "cíl hoří (Burning)"}],
];
const kInvHod = x => {
  const r = KINVHOD.find(([re]) => re.test(String((x && x.n) || "")));
  return r ? r[1] : null;
};
const kInv = K => kartaStav(K.id).inv || K.vybaveni || [];
const kInvKlic = x =>
  `${String(x.n || "")
    .toLowerCase()
    .replace(/\s*\(\d+\)\s*$/, "")
    .trim()}|${x.mag || ""}|${x.v || ""}`;
function kInvSkup(x, i, NOS) {
  const n = String(x.n || ""),
    p = kPred(x);
  if (x.pripoutano) return "pri";
  if (KINVSPO.test(n) || (p && p.ef && (p.ef.lecit || p.ef.dhp)) || kInvHod(x)) return "spo";
  if (kZbrInfo(x) || kZbranInfo(n)) return "boj";
  if (p || x.mag) return "mag";
  if (KINVCEN.test(n)) return "cen";
  return "vys";
}
const kInvDupl = inv => {
  const M = {};
  inv.forEach(x => {
    const k = kInvKlic(x);
    M[k] = (M[k] || 0) + 1;
  });
  return Object.values(M).filter(n => n > 1).length;
};
function kInvSlouc(inv) {
  const R = [],
    M = {};
  inv.forEach(x => {
    const k = kInvKlic(x),
      o = M[k];
    if (!o) {
      const y = Object.assign({}, x);
      M[k] = y;
      R.push(y);
      return;
    }
    o.q = (+o.q || 0) + (+x.q || 0);
    if (x.obl) o.obl = true;
    if (x.pripoutano) o.pripoutano = true;
    if (!o.w && x.w) o.w = x.w;
    if (!o.pozn && x.pozn) o.pozn = x.pozn;
    if (+x.nab > +(o.nab || 0)) o.nab = x.nab;
  });
  return R;
}
/* kouzlo ze svitku: index v seznamu kouzel karty (kSeznam), aby šlo seslat stejně jako z oddílu Kouzla */
const kInvSvitekI = (K, i) => (typeof kSeznam === "function" ? kSeznam(K).findIndex(s => s.pz && s.pz.sv && s.pz.i === i) : -1);
const kPenTxt = pen =>
  ["PP", "GP", "EP", "SP", "CP"]
    .filter(k => +pen[k])
    .map(k => `${pen[k]} ${k}`)
    .join(" · ") || "bez peněz";
/* zaplatit v mincích k: nejdřív stejnými, pak menšími, nakonec se rozmění větší mince (drobné zpět v GP, SP, CP) */
function kPenZapl(pen, k, v) {
  const P = Object.assign({}, pen);
  let need = Math.round(v) * KMINC[k];
  const cel = Object.entries(P).reduce((a, [c, n]) => a + (KMINC[c] ? (+n || 0) * KMINC[c] : 0), 0);
  if (!(need > 0) || cel < need) return null;
  const use = c => {
    const n = Math.min(+P[c] || 0, Math.floor(need / KMINC[c]));
    P[c] = (+P[c] || 0) - n;
    need -= n * KMINC[c];
  };
  use(k);
  ["PP", "GP", "EP", "SP", "CP"].forEach(c => {
    if (KMINC[c] < KMINC[k]) use(c);
  });
  for (const c of ["CP", "SP", "EP", "GP", "PP"]) {
    while (need > 0 && (+P[c] || 0) > 0) {
      P[c]--;
      const za = Math.min(need, KMINC[c]);
      need -= za;
      let ch = KMINC[c] - za;
      ["GP", "SP", "CP"].forEach(d => {
        if (KMINC[d] >= KMINC[c]) return;
        const m = Math.floor(ch / KMINC[d]);
        if (m) {
          P[d] = (+P[d] || 0) + m;
          ch -= m * KMINC[d];
        }
      });
    }
  }
  Object.keys(P).forEach(c => {
    if (!+P[c]) delete P[c];
  });
  return need > 0 ? null : P;
}
const kBojJa = K => {
  const s = BOJ.s;
  if (!s || !s.aktivni) return null;
  const me = (s.hraci || []).find(h => bojKartaH(h) === K);
  return me ? {s, me} : null;
};
const kInvCile = s =>
  (s.npc || []).filter(
    o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
  );
const KINVC = {}; // vybraný cíl vrhu podle karty

/* --- oddíl Vybavení v kartě --- */
function bdmVyb(K) {
  kartaPriprav(K);
  const zat = kartaZatez(K),
    S = kartaStav(K.id),
    inv = kInv(K),
    pen = S.pen || K.penize || {},
    NOS = kNoseno(inv),
    ro = !kMuze(K),
    key = K.id;
  const pri = inv.filter(x => x.pripoutano).length,
    du = ro ? 0 : kInvDupl(inv),
    q = (BDM.invq || {})[key] || "";
  const G = {};
  inv.forEach((x, i) => {
    if (!(x.q > 0) && x.q != null) return;
    (G[kInvSkup(x, i, NOS)] = G[kInvSkup(x, i, NOS)] || []).push([x, i]);
  });
  const row = ([x, i]) => {
    const p = kPred(x),
      r = kZbrInfo(x),
      on = r && ((NOS.z && NOS.z.i === i) || (NOS.s && NOS.s.i === i)),
      N = kNab(x),
      sv = kInvSvitekI(K, i),
      hd = kInvHod(x);
    const tg = [
      on ? `<em class="kvtg kvon">na sobě</em>` : "",
      x.pripoutano
        ? `<em class="kvtg kvpri" ${btip("Připoutaný (Attunement)")}>◆</em>`
        : p && p.pr
          ? `<em class="kvtg" ${btip("Vyžaduje připoutání (Attunement)")}>◇</em>`
          : "",
      x.v ? `<em class="kvtg kvbat" ${btip("V batohu")}>${besc(x.v)}</em>` : "",
      x.pozn ? `<em class="kvtg" ${btip(x.pozn)}>✎</em>` : "",
    ].join("");
    const rychle = ro
      ? ""
      : p && p.ef && (p.ef.lecit || p.ef.dhp)
        ? `<button type="button" class="bdmmini" data-kinvpij="${i}">vypít</button>`
        : sv >= 0
          ? `<button type="button" class="bdmmini" data-kses="${sv}" ${btip("Seslat kouzlo ze svitku")}>přečíst</button>`
          : hd
            ? `<button type="button" class="bdmmini" data-bdmsh="vec" data-i="${i}" ${btip(`Hodit: ${hd.z} ${BZRT[hd.t] || hd.t}`)}>hodit</button>`
            : "";
    return `<li class="kvr" data-kvn="${besc(String(x.n || "").toLowerCase())}"><button type="button" class="kvrb" data-bdmsh="vec" data-i="${i}" aria-label="${besc(x.n)} – podrobnosti a akce"><span class="kvrn">${besc(x.n)}</span>${x.q > 1 ? `<b class="kvq">×${x.q}</b>` : ""}${tg}</button>${N ? kNabHtml(x, i) : ""}${rychle}${x.q > 1 && !ro ? `<span class="kq"><button type="button" class="bdmmini" data-kinv="${i}" data-d="-1" aria-label="Ubrat">−</button><button type="button" class="bdmmini" data-kinv="${i}" data-d="1" aria-label="Přidat">+</button></span>` : ""}</li>`;
  };
  const sk = KINVSK.filter(([k]) => (G[k] || []).length)
    .map(([k, l]) => {
      const otv = (BDM.invg = BDM.invg || {})[key + ":" + k] ?? (k !== "vys" || !!q);
      return `<details class="kvsk kvsk-${k}" data-kvsk="${k}"${otv ? " open" : ""}><summary><b>${l}</b> <small>${G[k].length}${k === "pri" ? ` · ${pri}/3` : ""}</small></summary><ul class="kvseznam">${G[k].map(row).join("")}</ul></details>`;
    })
    .join("");
  const W = zat.w ? String(Math.round(zat.w * 10) / 10).replace(".", ",") : "0";
  return `<div class="bdmvyh kvhl"><span ${btip(zat.pret ? "Přetížen: rychlost −10 stop, nevýhoda na ověření, útoky a záchrany STR, AGI, CON" : "Nesená váha")}><small>Neseno</small> <b>${W} lb</b>${zat.pret ? ` <b class="bhrich">přetížen</b>` : ""}</span>
      <span ${btip("Připoutané magické předměty (Attunement), nejvýš 3")}><small>Připoutáno</small> <b>${pri}/3</b></span>
      <button type="button" class="kvpenb" data-bdmsh="pen" ${btip("Peníze: zaplatit, přijmout, pokladna družiny, směna")}><small>Peníze</small> <b>${besc(kPenTxt(pen))}</b></button></div>
    ${inv.length > 8 ? `<p class="kvhl2"><input type="search" class="kvhq" data-kvq value="${besc(q)}" placeholder="Hledat ve vybavení" aria-label="Hledat ve vybavení">${du ? `<button type="button" class="bdmmini" data-kvslouc ${btip("Sloučí stejné věci (stejné jméno, ne v jiném batohu) do jednoho řádku s počtem")}>Sloučit stejné (${du})</button>` : ""}</p>` : du ? `<p class="kvhl2"><button type="button" class="bdmmini" data-kvslouc>Sloučit stejné (${du})</button></p>` : ""}
    <div class="kvsks" data-kvseznam>${sk || `<p class="bdmnote">Vybavení je prázdné.</p>`}</div>
    ${ro ? "" : `<details class="bdmbez kvadd"${BOTV.has("vyb-" + K.id) ? " open" : ""} data-otv="vyb-${besc(K.id)}"><summary>+ Přidat věc</summary>${kPoolHtml(K)}<form class="kinvf" data-kinvf><input name="n" placeholder="vlastní předmět (např. Klíč od kaple)" required maxlength="80"><input name="q" type="number" min="1" max="9999" value="1" aria-label="Počet"><button class="gbtn ghost">Přidat</button></form></details>`}`;
}

/* --- list věci zespodu --- */
function bdmVecList(K, i) {
  const inv = kInv(K),
    x = inv[i];
  if (!x) return ["Věc", `<p class="bdmnote">Věc už ve vybavení není.</p>`];
  const ro = !kMuze(K),
    p = kPred(x),
    v = typeof vybNajdi === "function" ? vybNajdi(x) : null,
    vH = v && (!p || v.sk !== "magicke") ? `<details class="bdmbez"><summary>Popis (katalog vybavení)</summary>${vybKarta(v, false)}</details>` : "",
    r = kZbrInfo(x),
    NOS = kNoseno(inv),
    on = r && ((NOS.z && NOS.z.i === i) || (NOS.s && NOS.s.i === i)),
    sv = kInvSvitekI(K, i),
    hd = kInvHod(x),
    B = kBojJa(K);
  const pri = inv.filter(y => y.pripoutano).length,
    kont = kKont(inv).filter(([, j]) => j !== i),
    komu = KARTY.filter(k => k.id !== K.id && !k.test);
  const info = `${kNab(x) ? `<p class="bdmnote">Náboje ${kNabHtml(x, i)}</p>` : ""}<p class="bdmnote">${x.q > 1 ? `<b>${x.q} ks</b> · ` : ""}${x.w ? `${besc(x.w)} · ` : ""}${besc((KINVSK.find(s => s[0] === kInvSkup(x, i, NOS)) || [])[1] || "")}${x.v ? ` · v batohu ${besc(x.v)}` : ""}</p>`;
  if (ro) return [x.n, `${info}${x.pozn ? `<p class="kvpozn">${besc(x.pozn)}</p>` : ""}${p ? predKarta(p) : ""}${vH}`];
  const akce = [
    r ? `<button type="button" class="bdmbtn" data-kobl="${i}">${on ? "Sundat" : "Obléct"}</button>` : "",
    p && (p.pr || x.pripoutano)
      ? `<button type="button" class="bdmbtn" data-kpri="${i}" ${!x.pripoutano && pri >= 3 ? `disabled ${btip("Připoutané smíš mít nejvýš 3 předměty")}` : ""}>${x.pripoutano ? "Zrušit připoutání" : "Připoutat"}</button>`
      : "",
    p && p.ef && (p.ef.lecit || p.ef.dhp) ? `<button type="button" class="bdmbtn" data-kinvpij="${i}">Vypít</button>` : "",
    sv >= 0 ? `<button type="button" class="bdmbtn" data-kses="${sv}">Přečíst svitek (seslat)</button>` : "",
  ]
    .filter(Boolean)
    .join("");
  const cile = B ? kInvCile(B.s) : [];
  const hodH = hd
    ? `<div class="kvsek"><h4 class="bdmgh">Hodit</h4><p class="bdmnote">Místo jednoho útoku akce Útok, cíl do 20 stop: záchrana AGI SO ${8 + kMod(kVl(K, "AGI") || 10) + kPB(K)}, jinak ${hd.z} ${besc(BZRT[hd.t] || hd.t)}${hd.p ? ` (${besc(hd.p)})` : ""}.</p>
    <p class="bdmrow">${B ? `<select data-kvcil aria-label="Cíl"><option value="">— cíl —</option>${cile.map(o => `<option value="${o.id}"${KINVC[K.id] === o.id ? " selected" : ""}>${besc(o.n)}</option>`).join("")}</select>` : ""}<button type="button" class="bdmbtn" data-kvhod="${i}">🎲 Hodit${B ? " – poslat vypravěči" : ""}</button></p></div>`
    : "";
  const darOk = window.MMDB && (komu.length || GMV || KZAM.has(K.id));
  const darH = !darOk
    ? ""
    : `<div class="kvsek"><h4 class="bdmgh">Předat</h4><p class="bdmrow">${x.q > 1 ? `<input type="number" data-kvpq min="1" max="${x.q}" value="1" inputmode="numeric" aria-label="Kolik kusů" style="width:4.2em">` : ""}
      ${komu.length && window.MMDB ? `<select data-kvkomu aria-label="Komu"><option value="">— komu —</option>${komu.map(k => `<option value="${besc(k.id)}">${besc(k.n)}</option>`).join("")}</select><button type="button" class="bdmbtn" data-kvdar="${i}">Dát</button>` : ""}
      ${window.MMDB && (GMV || KZAM.has(K.id)) ? `<button type="button" class="bdmbtn ghost" data-kvpokl="${i}" ${btip("Uloží věc do pokladny družiny – vezme si ji kdokoli z družiny na stránce Hra")}>Do pokladny družiny</button>` : ""}</p></div>`;
  const upr = `<div class="kvsek"><h4 class="bdmgh">Upravit</h4>
    <label class="kvlab">Název <input data-kvnaz="${i}" value="${besc(x.n)}" maxlength="80"></label>
    <label class="kvlab">Poznámka <textarea data-kvpozn="${i}" rows="2" maxlength="300" placeholder="odkud je, co dělá, komu patří…">${besc(x.pozn || "")}</textarea></label>
    <p class="bdmrow"><span class="kq"><button type="button" class="bdmmini" data-kinv="${i}" data-d="-1" aria-label="Ubrat">−</button><b>${x.q ?? 1}</b><button type="button" class="bdmmini" data-kinv="${i}" data-d="1" aria-label="Přidat">+</button></span>
      ${kont.length ? `<label class="kvlab kvlabr">V batohu <select data-kinvv="${i}"><option value="">— volně —</option>${kont.map(([c]) => `<option${x.v === c.n ? " selected" : ""}>${besc(c.n)}</option>`).join("")}</select></label>` : ""}
      <button type="button" class="bdmmini kvx" data-kvx="${i}">Zahodit</button></p></div>`;
  return [
    x.n,
    `${info}${akce ? `<div class="bdmrow kvakce">${akce}</div>` : ""}${hodH}${darH}${upr}${p ? `<details class="bdmbez"><summary>Popis (SRD)</summary>${predKarta(p)}</details>` : ""}${vH}`,
  ];
}

/* --- list Peníze --- */
function bdmPenList(K) {
  const S = kartaStav(K.id),
    pen = S.pen || K.penize || {},
    ro = !kMuze(K);
  if (ro) return ["Peníze", `<p class="kvpen">${besc(kPenTxt(pen))}</p>`];
  return [
    "Peníze",
    `<p class="kvpen">${besc(kPenTxt(pen))}</p>
    <form class="bdmrow kvpenf" data-kvpenf><input name="v" type="number" min="1" max="9999999" inputmode="numeric" placeholder="částka" required aria-label="Částka" style="width:6em"><select name="k" aria-label="Mince">${["GP", "SP", "CP", "PP", "EP"].map(k => `<option>${k}</option>`).join("")}</select>
      <button class="bdmbtn" name="a" value="z" ${btip("Odečte částku; když nemáš přesné mince, rozmění větší")}>Zaplatit</button><button class="bdmbtn" name="a" value="p">Přijmout</button>
      ${window.MMDB && MMDB.pokladna && (GMV || KZAM.has(K.id)) ? `<button class="bdmbtn ghost" name="a" value="dp" ${btip("Vloží částku do pokladny družiny")}>Do pokladny</button><button class="bdmbtn ghost" name="a" value="zp" ${btip("Vybere částku z pokladny družiny")}>Z pokladny</button>` : ""}</form>
    <details class="bdmbez"><summary>Mince jednotlivě a směna</summary><div class="kpen">${["PP", "GP", "EP", "SP", "CP"].map(k => `<label>${k} <input type="number" min="0" max="9999999" data-kpen="${k}" value="${+pen[k] || 0}"></label>`).join("")}</div>${kPenSmenHtml()}<p class="rsmall">1 PP = 10 GP = 20 EP = 100 SP = 1000 CP.</p></details>${!GMV && window.MMDB && KZAM.has(K.id) ? poklHtml() : ""}`,
  ];
}

/* --- použití spotřebních věcí v oddílu Útok --- */
function kInvPouzHtml(K) {
  if (!kMuze(K)) return "";
  const inv = kInv(K),
    L = [];
  inv.forEach((x, i) => {
    if (x.q != null && !(x.q > 0)) return;
    const p = kPred(x),
      sv = kInvSvitekI(K, i),
      hd = kInvHod(x),
      pij = p && p.ef && (p.ef.lecit || p.ef.dhp);
    if (!pij && sv < 0 && !hd) return;
    L.push(
      `<span class="kvpz"><button type="button" class="kspn" data-bdmsh="vec" data-i="${i}">${besc(x.n)}${x.q > 1 ? ` ×${x.q}` : ""}</button>${pij ? `<button type="button" class="bdmmini" data-kinvpij="${i}">vypít</button>` : sv >= 0 ? `<button type="button" class="bdmmini" data-kses="${sv}">přečíst</button>` : `<button type="button" class="bdmmini" data-bdmsh="vec" data-i="${i}">hodit</button>`}</span>`,
    );
  });
  return L.length ? `<section class="bdmgrp kvpouz"><h4 class="bdmgh">Použít předmět</h4><div class="kvpzw">${L.join("")}</div></section>` : "";
}

/* --- obsluha --- */
const kInvUloz = async (K, inv, msg) => {
  await kartaStavZmen(K.id, {inv}, msg);
};
/* výchozí vybavení z PDF (karty z obsahu webu ho v databázi nemají): pro server, než vybavení poprvé změní */
const kInvZakl = k => {
  const K = KARTBY[k];
  if (!K || kartaStav(k).inv) return null;
  return (K.vybaveni || []).slice(0, 300).map(x => Object.assign({}, x));
};
const kInvPriprav = async K => {
  if (!kartaStav(K.id).inv) await kartaStavZmen(K.id, {inv: kInv(K).map(x => Object.assign({}, x))}, null, {bezZpet: true});
};
document.addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kvq]")) return;
  const root = t.closest(".bdm");
  if (!root) return;
  const q = t.value.trim().toLowerCase();
  (BDM.invq = BDM.invq || {})[root.dataset.kid] = q;
  root.querySelectorAll("[data-kvseznam] .kvsk").forEach(d => {
    let n = 0;
    d.querySelectorAll(".kvr").forEach(li => {
      const ok = !q || li.dataset.kvn.includes(q);
      li.hidden = !ok;
      if (ok) n++;
    });
    d.hidden = !n;
    if (q && n) d.open = true;
  });
});
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-kvsk]")) return;
    const root = d.closest(".bdm");
    if (!root) return;
    (BDM.invg = BDM.invg || {})[root.dataset.kid + ":" + d.dataset.kvsk] = d.open;
  },
  true,
);
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches) return;
  const root = t.closest(".bdm"),
    K = root && KARTBY[root.dataset.kid];
  if (!K) return;
  if (t.matches("[data-kvcil]")) {
    KINVC[K.id] = t.value;
    return;
  }
  if (!kMuze(K)) return;
  if (t.matches("[data-kvnaz],[data-kvpozn]")) {
    const i = +(t.dataset.kvnaz ?? t.dataset.kvpozn),
      inv = kInv(K).map(x => Object.assign({}, x)),
      x = inv[i];
    if (!x) return;
    if (t.dataset.kvnaz != null) {
      const n = t.value.trim().slice(0, 80);
      if (!n || n === x.n) {
        t.value = x.n;
        return;
      }
      x.n = n;
    } else {
      const p = t.value.trim().slice(0, 300);
      if (p) x.pozn = p;
      else delete x.pozn;
    }
    await kInvUloz(K, inv, t.dataset.kvnaz != null ? `Přejmenováno: ${x.n}.` : "Poznámka uložena.");
  }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-kvpenf]")) return;
  e.preventDefault();
  const root = f.closest(".bdm"),
    K = root && KARTBY[root.dataset.kid];
  if (!K || !kMuze(K)) return;
  const a = (e.submitter && e.submitter.value) || "z",
    v = Math.round(+f.elements.v.value || 0),
    k = f.elements.k.value,
    S = kartaStav(K.id),
    pen = S.pen || K.penize || {};
  if (!(v > 0)) return;
  if (a === "p" || a === "zp") {
    if (a === "zp") {
      try {
        await MMDB.pokladna({[k]: -v}, `vybral ${K.n}`, K.id);
        await poklNacti();
      } catch (err) {
        mmHlasG(err.message || String(err), 5000);
        return;
      }
    }
    const P = Object.assign({}, pen);
    P[k] = (+P[k] || 0) + v;
    await kartaStavZmen(K.id, {pen: P}, `${K.n}: +${v} ${k}${a === "zp" ? " z pokladny družiny" : ""}.`);
    kHodZapis({k: K.id, kdo: K.n, co: a === "zp" ? "Z pokladny" : "Peníze", txt: `+${v} ${k} → ${kPenTxt(P)}`});
    f.reset();
    return;
  }
  const P = kPenZapl(pen, k, v);
  if (!P) {
    mmHlasG(`Na ${v} ${k} nemáš dost peněz (${kPenTxt(pen)}).`, 4000);
    return;
  }
  if (a === "dp") {
    try {
      await MMDB.pokladna({[k]: v}, `vložil ${K.n}`, K.id);
      await poklNacti();
    } catch (err) {
      mmHlasG(err.message || String(err), 5000);
      return;
    }
  }
  await kartaStavZmen(
    K.id,
    {pen: Object.keys(P).length ? P : null},
    `${K.n}: −${v} ${k}${a === "dp" ? " do pokladny družiny" : ""} → ${kPenTxt(P)}.`,
  );
  kHodZapis({k: K.id, kdo: K.n, co: a === "dp" ? "Do pokladny" : "Zaplatil", txt: `−${v} ${k} → ${kPenTxt(P)}`});
  f.reset();
});
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s),
    root = T(".bdm");
  if (!root) return;
  const K = KARTBY[root.dataset.kid];
  if (!K || !kMuze(K)) return;
  const zav = () => {
    BDM.sheet = null;
    bdmPrekresli();
  };
  if (T("[data-kvslouc]")) {
    const inv = kInv(K),
      R = kInvSlouc(inv);
    if (R.length === inv.length) return;
    await kInvUloz(K, R, `Sloučeno: ${inv.length - R.length} ${inv.length - R.length === 1 ? "řádek" : "řádky"} méně.`);
    return;
  }
  const vx = T("[data-kvx]");
  if (vx) {
    const i = +vx.dataset.kvx,
      inv = kInv(K).map(x => Object.assign({}, x)),
      x = inv[i];
    if (!x || !confirm(`Zahodit ${x.n}${x.q > 1 ? ` (všech ${x.q} ks)` : ""}?`)) return;
    inv.splice(i, 1);
    kHodZapis({k: K.id, kdo: K.n, co: "Zahodil", txt: `${x.n}${x.q > 1 ? " ×" + x.q : ""}`});
    zav();
    await kInvUloz(K, inv);
    return;
  }
  const kh = T("[data-kvhod]");
  if (kh) {
    const i = +kh.dataset.kvhod,
      inv = kInv(K).map(x => Object.assign({}, x)),
      x = inv[i],
      H = kInvHod(x);
    if (!x || !H) return;
    const B = kBojJa(K),
      dc = 8 + kMod(kVl(K, "AGI") || 10) + kPB(K),
      z = bojKostky(H.z, false) || {t: 0, x: H.z};
    let c = null;
    if (B) {
      c = kInvCile(B.s).find(o => o.id === KINVC[K.id]);
      if (!c) {
        mmHlasG("Vyber cíl.", 2500);
        return;
      }
      const nes = bojNeschopny(B.me.stav) || kNeschopny(K);
      if (nes) {
        mmHlasG(`Nemůžeš jednat – ${nes}.`, 3500);
        return;
      }
    }
    if (c) {
      try {
        await bojDB.utok(B.me.id, {
          ci: [c.id],
          cim: String(x.n).slice(0, 60),
          dmg: Math.max(0, Math.min(300, z.t)),
          t: H.t,
          plos: {ab: "AGI", dc, pol: false},
        });
      } catch (err) {
        mmHlasG("Nepodařilo se poslat: " + (err.message || err), 5000);
        return;
      }
    }
    x.q = Math.max(0, (+x.q || 1) - 1);
    if (!x.q) {
      inv.splice(i, 1);
      BDM.sheet = null;
    }
    kHodZapis({
      k: K.id,
      kdo: K.n,
      co: `Hod – ${x.n}${c ? " → " + c.n : ""}`,
      tot: z.t,
      txt: `${z.x} ${BZRT[H.t] || H.t} · záchrana AGI SO ${dc}${H.p ? " · " + H.p : ""}`,
    });
    await kInvUloz(K, inv, `${K.n}: ${x.n}${c ? ` → ${c.n} – čeká na vypravěče` : ""} (zranění ${z.t}, záchrana AGI SO ${dc}).`);
    if (B) {
      BOJ.v = -2;
      await bojNacti();
    }
    return;
  }
  const kd = T("[data-kvdar],[data-kvpokl]");
  if (kd) {
    const i = +(kd.dataset.kvdar ?? kd.dataset.kvpokl),
      x = kInv(K)[i];
    if (!x) return;
    const L = kd.closest("[data-bdmlist]") || root,
      q = Math.max(1, Math.min(+x.q || 1, Math.round(+((L.querySelector("[data-kvpq]") || {}).value || 1))));
    try {
      if (kd.dataset.kvdar != null) {
        const komu = (L.querySelector("[data-kvkomu]") || {}).value;
        if (!komu) {
          mmHlasG("Vyber, komu věc dáš.", 2500);
          return;
        }
        const kn = (KARTBY[komu] || {}).n || komu;
        if (!confirm(`Dát ${x.n}${q > 1 ? ` ×${q}` : ""} postavě ${kn}?`)) return;
        await kInvPriprav(K);
        await MMDB.kartaDar(K.id, komu, x.n, q, kInvZakl(komu));
        mmHlasG(`${x.n}${q > 1 ? ` ×${q}` : ""} → ${kn}.`, 3500);
      } else {
        await kInvPriprav(K);
        await MMDB.pokladnaVec({n: x.n, q}, 1, K.id);
        await poklNacti();
        mmHlasG(`${x.n}${q > 1 ? ` ×${q}` : ""} je v pokladně družiny.`, 3500);
      }
      BDM.sheet = null;
      await kartyNacti(true);
      await hodyNacti();
      kartyPrekresli();
    } catch (err) {
      mmHlasG("Nepodařilo se: " + (err.message || err), 5000);
    }
    return;
  }
});
/* pokladna družiny: věci (vezme si hráč za svou postavu, vypravěč komukoli), vypravěč přidá kořist */
function poklVeciHtml() {
  const V = (POKL && POKL.veci) || [],
    K = jaK(),
    muze = window.MMDB && MMDB.pokladnaVec && (GMV || (K && KZAM.has(K.id)));
  if (!V.length && !GMV) return "";
  return `<div class="kpokv"><h4 class="kdbsh">Věci</h4>${V.length ? `<ul class="kfeat">${V.map((v, i) => `<li><b>${besc(v.n)}</b>${v.q > 1 ? ` ×${v.q}` : ""}${v.pozn ? ` <small>${besc(v.pozn)}</small>` : ""}${muze ? ` <button type="button" class="gbtn ghost" data-poklvez="${i}">vzít${v.q > 1 ? " 1" : ""}</button>${v.q > 1 ? `<button type="button" class="gbtn ghost" data-poklvez="${i}" data-vse="1">vzít vše</button>` : ""}` : ""}</li>`).join("")}</ul>` : `<p class="rsmall">Žádné věci.</p>`}
    ${GMV && muze ? `<p class="kvlh"><label>Komu <select data-poklkomu>${KARTY.map(k => `<option value="${besc(k.id)}">${besc(k.n)}</option>`).join("")}</select></label></p><form class="kvlh" data-poklvf><input name="n" placeholder="kořist do pokladny (např. Stříbrný kalich)" maxlength="80" required><input name="q" type="number" min="1" max="9999" value="1" aria-label="Počet" style="width:4.5em"><button class="gbtn ghost">Přidat</button></form>` : ""}</div>`;
}
document.addEventListener("click", async e => {
  const b = e.target.closest && e.target.closest("[data-poklvez]");
  if (!b) return;
  const V = (POKL && POKL.veci) || [],
    v = V[+b.dataset.poklvez];
  if (!v) return;
  const k = GMV ? (document.querySelector("[data-poklkomu]") || {}).value || "" : (jaK() || {}).id || "";
  if (!k) {
    mmHlasG("Nejdřív se přihlas za svou postavu.", 3000);
    return;
  }
  try {
    await MMDB.pokladnaVec({n: v.n, q: b.dataset.vse ? v.q : 1}, -1, k, kInvZakl(k));
    await poklNacti();
    await kartyNacti(true);
    mmHlasG(`${v.n} → ${(KARTBY[k] || {}).n || k}.`, 3000);
    kartyPrekresli();
    if (typeof hraPrekresli === "function") hraPrekresli();
  } catch (err) {
    mmHlasG(err.message || String(err), 5000);
  }
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-poklvf]")) return;
  e.preventDefault();
  const n = f.elements.n.value.trim().slice(0, 80),
    q = Math.max(1, Math.round(+f.elements.q.value || 1));
  if (!n) return;
  try {
    await MMDB.pokladnaVec({n, q}, 1, null);
    await poklNacti();
    f.reset();
    kartyPrekresli();
    if (typeof hraPrekresli === "function") hraPrekresli();
  } catch (err) {
    mmHlasG(err.message || String(err), 5000);
  }
});
