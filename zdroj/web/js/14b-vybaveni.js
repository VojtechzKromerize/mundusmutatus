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
/* vrhací spotřební věci podle SRD 5.2.1 (výstroj): místo jednoho útoku akce Útok; cíl do 20 stop, záchrana DEX SO 8 + DEX + zdatnost */
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
  if (kZbrInfo(x) || kVecZbr(x)) return "boj";
  if (p || x.mag || (x.def && (x.def.ef || x.def.pr))) return "mag";
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
    .map(k => `${pen[k]} ${KMINCZK[k]}`)
    .join(" · ") || "bez peněz";
/* mince tažení: jen GP, SP, CP (Vojta 2026-10-23) – uherský zlatý, pražský groš, haléř (kurz 1 : 40 : 400, Vojta 2026-10-27); PP a EP z PDF D&D Beyond se ukážou,
   ale nenabízejí se a „Rozměnit na nejvyšší“ je převede. Ikony `art/img/boj/mince-*`, `mesec`, `pokladna` (prompty v projektu
   `grafika/mince-prompty.md`) */
const KMINCE = ["GP", "SP", "CP"],
  KMINCJM = {GP: "uherský zlatý", SP: "pražský groš", CP: "haléř"},
  KMINCZK = {GP: "zl.", SP: "gr.", CP: "hal.", EP: "EP", PP: "PP"};
/* peníze z PDF D&D Beyond (K.penize) jsou v mincích pravidel: 1 GP z pravidel = 10 grošů, PP = 100, EP = 5 (Vojta 2026-10-27);
   stav karty S.pen už je v mincích tažení. S.pen === null = postava peníze utratila (nevrací se k PDF). */
function kPenDnd(p) {
  const P = {},
    gr = (+(p || {}).GP || 0) * 10 + (+(p || {}).PP || 0) * 100 + (+(p || {}).EP || 0) * 5 + (+(p || {}).SP || 0);
  if (gr) P.SP = gr;
  if (+(p || {}).CP) P.CP = +p.CP;
  return P;
}
const kPenKarta = K => {
  const S = kartaStav(K.id);
  return S.pen ? S.pen : S.pen === null ? {} : kPenDnd(K.penize);
};
const kMinceIk = (f, t) =>
  `<img class="kminik" src="art/img/boj/${f}-48.webp" width="18" height="18" alt="${besc(t || "")}"${t ? "" : ` aria-hidden="true"`} decoding="async" loading="lazy">`;
/* částka s ikonami mincí (HTML); kPenTxt zůstává pro záznam a hlášky */
const kPenHtml = pen =>
  ["PP", "GP", "EP", "SP", "CP"]
    .filter(k => +(pen || {})[k])
    .map(k =>
      KMINCJM[k]
        ? `<span class="kpenm" aria-label="${besc(`${pen[k]} ${KMINCZK[k]} (${KMINCJM[k]})`)}" ${btip(KMINCJM[k])}>${kMinceIk("mince-" + k.toLowerCase())}${besc(String(pen[k]))}</span>`
        : `<span class="kpenm">${besc(String(pen[k]))} <small>${k}</small></span>`,
    )
    .join(" ") || "bez peněz";
/* mince do nabídek: GP, SP, CP a navíc PP či EP, jen když je postava má */
const kMinceNab = pen => KMINCE.concat(["PP", "EP"].filter(k => +(pen || {})[k]));
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

/* --- oddíl Vybavení v kartě (2026-10-23, Vojta: podle D&D Beyond, kompaktněji) ---
   nahoře Moje výbava / Výbava družiny, nosnost (současná / limit), připoutání a peníze; hledání podle jména a přepínače druhu;
   věci ve složkách (Na sobě, Batoh, vlastní – `slozky` na kartě, věc má složku v `v`); každá věc ukazuje váhu a počet, cenu ne.
   Spravovat inventář (list „inv“): přidat z databáze předmětů (hráč s potvrzením vypravěče), vlastní předmět, složky. */
const KSLOZ0 = [{n: "Batoh"}];
const kSlozky = K => {
  const L = kartaStav(K.id).slozky;
  return Array.isArray(L) ? L : KSLOZ0;
};
/* složky k zobrazení: Na sobě (bez složky), uložené složky a starší batohy z inventáře (x.v bez složky) */
function kSlozkyVse(K, inv) {
  const L = [{n: "", jm: "Na sobě"}, ...kSlozky(K).map(x => ({n: x.n, jm: x.n, nen: !!x.nen}))];
  (inv || []).forEach(x => {
    if (x.v && !L.some(f => f.n === x.v)) L.push({n: x.v, jm: x.v, mag: KKONTM.test(x.v)});
  });
  return L;
}
/* druhy věcí pro přepínače nad seznamem (věc může mít víc: připoutaný magický prsten = Připoutané i Magické) */
const KINVF = [
  ["", "Vše"],
  ["boj", "Zbraně a zbroj"],
  ["mag", "Magické"],
  ["spo", "Spotřební"],
  ["vys", "Výstroj"],
  ["cen", "Cennosti"],
  ["pri", "Připoutané"],
];
const kInvDruhy = (x, i, NOS) => {
  const g = new Set([x.typ && KINVSK.some(k => k[0] === x.typ) ? x.typ : kInvSkup(x, i, NOS)]);
  if (x.pripoutano) {
    g.add("pri");
    g.add("mag");
  }
  if (kPred(x) || x.mag) g.add("mag");
  if (g.has("pri") && !kPred(x) && !x.mag) g.delete("mag");
  return [...g];
};
/* krátký popisek pod jménem: zranění zbraně, AC zbroje, druh a vzácnost magického předmětu, druh z katalogu */
function kInvPodtitul(x) {
  if (x.def) {
    const s = vecSouhrn(x.def, kDilN()).split(" · ")[0];
    return x.def.d === "vec" ? `vlastní předmět${x.def.vz ? `, ${x.def.vz}` : ""}` : x.def.d === "zbroj" ? `vlastní zbroj, ${s}` : s;
  }
  const p = kPred(x),
    v = typeof vybNajdi === "function" ? vybNajdi(x) : null;
  if (v && v.sk === "zbrane")
    return `${v.z} ${BZRT[v.zt] || v.zt}${(v.vl || []).length ? " · " + v.vl.map(q => (typeof vybVl === "function" ? vybVl(q) : q)).join(", ") : ""}`;
  if (v && v.sk === "zbroj") return v.typ === "štít" ? `štít, AC +${v.ac}` : `${v.typ} zbroj, AC ${v.ac}`;
  if (p) return `${p.druh || ""}${p.vzt || p.vz ? `, ${p.vzt || p.vz}` : ""}`;
  if (v) return (typeof VYBSKN !== "undefined" && VYBSKN[v.sk]) || "";
  if (x.typ) return (KINVSK.find(k => k[0] === x.typ) || [])[1] || "";
  return "";
}
/* vzácnost magického předmětu → třída barvy jména (2026-10-23): běžný, neobvyklý zelená, vzácný modrá, velmi vzácný fialová,
   legendární oranžová, artefakt červená; u „proměnlivé“ podle +1/+2/+3 v názvu */
function kInvVz(x) {
  const p = kPred(x),
    v = typeof vybNajdi === "function" ? vybNajdi(x) : null,
    z = String((x.def ? x.def.vz : "") || (p && p.vz) || (v && v.sk === "magicke" && v.vz) || "");
  if (x.def && !z) return "";
  if (!z) return "";
  if (/artefakt/i.test(z)) return "kvz-art";
  if (/legend/i.test(z)) return "kvz-leg";
  if (/velmi/i.test(z)) return "kvz-vvz";
  if (/vzácn/i.test(z)) return "kvz-vz";
  if (/neobvykl/i.test(z)) return "kvz-neo";
  if (/proměnl/i.test(z)) {
    const m = String(x.n || "").match(/\+([123])\b/);
    return m ? ["", "kvz-neo", "kvz-vz", "kvz-vvz"][+m[1]] : "";
  }
  return "kvz-bez";
}
/* ikony vlevo od jména: připoutání (◆ připoutáno / ◇ vyžaduje připoutání) a oblečená zbroj nebo štít v ruce – klepnutím se přepnou */
const KINVIK = {
  obl: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M5 2.5 3 4v4.5c0 2.6 2.2 4.4 5 5.5 2.8-1.1 5-2.9 5-5.5V4l-2-1.5L8 4z"/><path d="M8 4v9.5"/></svg>',
};
function kInvIkona(K, x, i, on) {
  const p = kPred(x),
    ro = !kMuze(K);
  if (x.pripoutano || (x.def ? x.def.pr : p && p.pr)) {
    const tip = x.pripoutano ? "Připoutaný (Attunement) – klepni pro zrušení" : "Vyžaduje připoutání (Attunement) – klepni pro připoutání";
    return `<button type="button" class="kvik kvikpri${x.pripoutano ? " on" : ""}" ${ro ? "disabled" : `data-kpri="${i}"`} aria-pressed="${!!x.pripoutano}" aria-label="${besc(tip)}" ${btip(tip)}>${x.pripoutano ? "◆" : "◇"}</button>`;
  }
  if (kZbrInfo(x)) {
    const tip = on ? "Na sobě – klepni pro sundání" : "Neneseno na těle – klepni pro obléknutí";
    return `<button type="button" class="kvik kvikobl${on ? " on" : ""}" ${ro ? "disabled" : `data-kobl="${i}"`} aria-pressed="${!!on}" aria-label="${besc(tip)}" ${btip(tip)}>${KINVIK.obl}</button>`;
  }
  return `<span class="kvik kvik0" aria-hidden="true"></span>`;
}
/* list Připoutání: připoutané předměty a ty, které připoutání vyžadují, ale připoutané nejsou */
function bdmPriList(K) {
  const inv = kInv(K),
    ro = !kMuze(K),
    P = inv.map((x, i) => [x, i]).filter(([x]) => x.pripoutano),
    N = inv.map((x, i) => [x, i]).filter(([x]) => !x.pripoutano && (x.def ? x.def.pr : (kPred(x) || {}).pr)),
    li = ([x, i], on) =>
      `<li><b class="${kInvVz(x)}">${besc(x.n)}</b>${(kPred(x) || {}).pr && typeof kPred(x).pr === "string" ? ` <small>${besc(kPred(x).pr)}</small>` : ""}${ro ? "" : `<button type="button" class="bdmbtn ghost" data-kpri="${i}"${!on && P.length >= 3 ? ` disabled ${btip("Připoutané smíš mít nejvýš 3 předměty")}` : ""}>${on ? "Zrušit připoutání" : "Připoutat"}</button>`}</li>`;
  return [
    `Připoutání · ${P.length}/3`,
    `<p class="bdmnote">Připoutat se dá nejvýš ke třem magickým předmětům; připoutání trvá krátký odpočinek.</p>
    <h4 class="bdmgh">Připoutané</h4>${P.length ? `<ul class="kvprl">${P.map(r => li(r, true)).join("")}</ul>` : `<p class="bdmnote">Žádný předmět.</p>`}
    <h4 class="bdmgh">Vyžadují připoutání</h4>${N.length ? `<ul class="kvprl">${N.map(r => li(r, false)).join("")}</ul>` : `<p class="bdmnote">Nic dalšího v inventáři připoutání nevyžaduje.</p>`}`,
  ];
}
const kLbF = w => (w > 0 ? `${String(Math.round(w * 10) / 10).replace(".", ",")} lb` : "–");
function bdmVyb(K) {
  kartaPriprav(K);
  const key = K.id,
    tab = (BDM.invt || {})[key] || "ja";
  const tabs = `<div class="kvtabs" role="tablist" aria-label="Výbava">${[
    ["ja", "Moje výbava"],
    ["dr", "Výbava družiny"],
  ]
    .map(([k, l]) => `<button type="button" role="tab" data-kvtab="${k}" aria-selected="${tab === k}">${l}</button>`)
    .join("")}</div>`;
  /* popisky řádků (zranění, AC, druh) bere z katalogu vybavení – po jeho načtení se oddíl překreslí */
  if (typeof VYB !== "undefined" && !VYB && typeof vybNacti === "function")
    vybNacti()
      .then(() => bdmPrekresli())
      .catch(() => {});
  if (tab === "dr")
    return `${tabs}<div class="kvdr">${typeof poklHtml === "function" && window.MMDB ? poklHtml() : `<p class="bdmnote">Výbava družiny je jen na webu s databází.</p>`}</div>`;
  const zat = kartaZatez(K),
    S = kartaStav(K.id),
    inv = kInv(K),
    pen = kPenKarta(K),
    NOS = kNoseno(inv),
    ro = !kMuze(K);
  const pri = inv.filter(x => x.pripoutano).length,
    du = ro ? 0 : kInvDupl(inv),
    q = (BDM.invq || {})[key] || "",
    f = (BDM.invf || {})[key] || "";
  const row = ([x, i]) => {
    const p = kPred(x),
      r = kZbrInfo(x),
      on = r && ((NOS.z && NOS.z.i === i) || (NOS.s && NOS.s.i === i)),
      N = kNab(x),
      sv = kInvSvitekI(K, i),
      hd = kInvHod(x),
      dr = kInvDruhy(x, i, NOS),
      pt = kInvPodtitul(x);
    const tg = x.pozn ? `<em class="kvtg" ${btip(x.pozn)}>✎</em>` : "";
    const rychle = ro
      ? ""
      : p && p.ef && (p.ef.lecit || p.ef.dhp)
        ? `<button type="button" class="bdmmini" data-kinvpij="${i}">vypít</button>`
        : sv >= 0
          ? `<button type="button" class="bdmmini" data-kses="${sv}" ${btip("Seslat kouzlo ze svitku")}>seslat</button>`
          : hd
            ? `<button type="button" class="bdmmini" data-bdmsh="vec" data-i="${i}" ${btip(`Hodit: ${hd.z} ${BZRT[hd.t] || hd.t}`)}>hodit</button>`
            : "";
    return `<li class="kvr" data-kvn="${besc(String(x.n || "").toLowerCase() + " " + pt.toLowerCase())}" data-kvt="${dr.join(" ")}">${kInvIkona(K, x, i, on)}<button type="button" class="kvrb" data-bdmsh="vec" data-i="${i}" aria-label="${besc(x.n)} – podrobnosti a akce"><span class="kvrn ${kInvVz(x)}">${besc(x.n)}${tg}</span>${pt ? `<small class="kvrs">${besc(pt)}</small>` : ""}</button>${N ? kNabHtml(x, i) : ""}${rychle}<span class="kvw">${kLbF(kLb(x.w))}</span><span class="kvqq">${x.q ?? 1}</span></li>`;
  };
  const FS = kSlozkyVse(K, inv),
    G = {};
  inv.forEach((x, i) => {
    if (!(x.q > 0) && x.q != null) return;
    const k = FS.some(fl => fl.n === (x.v || "")) ? x.v || "" : "";
    (G[k] = G[k] || []).push([x, i]);
  });
  const sk = FS.filter(fl => (G[fl.n] || []).length || fl.n === "")
    .map(fl => {
      const L = G[fl.n] || [],
        w = L.reduce((a, [x]) => a + kLb(x.w), 0),
        otv = (BDM.invg = BDM.invg || {})[key + ":s:" + fl.n] ?? true;
      return `<details class="kvsk kvsl" data-kvsk="s:${besc(fl.n)}"${otv ? " open" : ""}><summary><b>${besc(fl.jm)}</b> <small>${L.length}</small>${fl.nen ? ` <em class="kvtg" ${btip("Tuhle složku postava nenese (kůň, vůz, úschovna) – nepočítá se do nosnosti")}>nenese</em>` : fl.mag ? ` <em class="kvtg" ${btip("Magický vak: obsah se nepočítá do nosnosti")}>✦</em>` : ""}<span class="kvslw">${kLbF(w)}</span></summary>${L.length ? `<ul class="kvseznam">${L.map(row).join("")}</ul>` : `<p class="bdmnote">Prázdné.</p>`}</details>`;
    })
    .join("");
  const proc = zat.max ? Math.min(100, Math.round((zat.w / zat.max) * 100)) : 0;
  return `${tabs}<div class="kvhlava">
      <div class="kvzat${zat.pret ? " kvpret" : ""}" ${btip(zat.pret ? "Přetížen: nad nosností (Síla × 15 lb) je rychlost nejvýš 5 stop" : "Nesená váha a nosnost (Síla × 15 lb); složky, které postava nenese, a magické vaky se nepočítají")}><small>Neseno</small><b>${kLbF(zat.w)} <i>/ ${zat.max} lb</i></b><span class="kvbar"><i style="width:${proc}%"></i></span><small>${zat.pret ? "přetížen – rychlost nejvýš 5 stop" : "nezatížen"}</small></div>
      <button type="button" class="kvatt" data-bdmsh="pri" ${btip("Připoutané magické předměty (Attunement), nejvýš 3 – klepni pro přehled")}><small>Připoutáno</small><b>${pri}/3</b></button>
      <button type="button" class="kvpenb" data-bdmsh="pen" ${btip("Peníze: zaplatit, přijmout, pokladna družiny, směna")}><small>${kMinceIk("mesec")}Peníze</small><b>${kPenHtml(pen)}</b></button></div>
    <div class="kvfil"><input type="search" class="kvhq" data-kvq value="${besc(q)}" placeholder="Hledat podle jména nebo druhu" aria-label="Hledat ve vybavení">${ro ? "" : `<button type="button" class="bdmbtn kvspr" data-bdmsh="inv">Spravovat inventář</button>`}</div>
    <div class="kvtyp" role="group" aria-label="Druh">${KINVF.map(([k, l]) => `<button type="button" data-kvf="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}</div>
    ${du ? `<p class="kvhl2"><button type="button" class="bdmmini" data-kvslouc ${btip("Sloučí stejné věci (stejné jméno i složka) do jednoho řádku s počtem")}>Sloučit stejné (${du})</button></p>` : ""}
    <div class="kvthead" aria-hidden="true"><span></span><span>Předmět</span><span>Váha</span><span>Počet</span></div>
    <div class="kvsks" data-kvseznam>${sk}</div>`;
}
/* filtr seznamu podle hledání a druhu – bez překreslení (rozepsané hledání zůstane) */
function kInvFiltr(root) {
  const id = root.dataset.kid,
    q = ((BDM.invq || {})[id] || "").toLowerCase(),
    f = (BDM.invf || {})[id] || "";
  root.querySelectorAll("[data-kvseznam] .kvsk").forEach(d => {
    let n = 0;
    d.querySelectorAll(".kvr").forEach(li => {
      const ok = (!q || li.dataset.kvn.includes(q)) && (!f || li.dataset.kvt.split(" ").includes(f));
      li.hidden = !ok;
      if (ok) n++;
    });
    d.hidden = !n && !!(q || f);
    if ((q || f) && n) d.open = true;
  });
}
document.addEventListener("click", e => {
  const T = q => e.target.closest && e.target.closest(q),
    root = T(".bdm");
  if (!root) return;
  const t = T("[data-kvtab]");
  if (t) {
    (BDM.invt = BDM.invt || {})[root.dataset.kid] = t.dataset.kvtab;
    if (t.dataset.kvtab === "dr" && typeof poklNacti === "function" && window.MMDB) poklNacti().then(() => bdmPrekresli());
    bdmPrekresli();
    return;
  }
  const f = T("[data-kvf]");
  if (f) {
    (BDM.invf = BDM.invf || {})[root.dataset.kid] = f.dataset.kvf;
    root.querySelectorAll("[data-kvf]").forEach(b => b.setAttribute("aria-pressed", String(b === f)));
    kInvFiltr(root);
  }
});
/* popis věci nahoře v listu (2026-10-23): rozbalený, klikem se sbalí; bez původu textu a překladu (licence je v patičce webu).
   Přednost má text z katalogu vybavení (Vojtovy popisy), jinak popis magického předmětu; cena se neukazuje – určuje ji vypravěč */
const KVPOPZ = new Set();
function kVecPopis(x, p, v) {
  const sk = v && typeof VYBSKN !== "undefined" ? VYBSKN[v.sk] || "" : "",
    druh = p
      ? `${p.druh || ""}${p.upr ? ` (${p.upr})` : ""}${p.vzt || p.vz ? `, ${p.vzt || p.vz}` : ""}${p.pr ? `, vyžaduje připoutání${typeof p.pr === "string" ? " (" + p.pr + ")" : ""}` : ""}`
      : sk,
    par = v && !(p && v.sk === "magicke") && typeof vybParam === "function" ? vybParam(v) : "",
    txt = v && v.t ? `<p>${besc(v.t)}</p>` : p && p.t ? kzMd(p.t) : "",
    tab =
      v && v.tab
        ? v.tab
            .map(
              T =>
                `<table class="rtab vybtab"><thead><tr>${(T.h || []).map(h => `<th>${besc(h)}</th>`).join("")}</tr></thead><tbody>${(T.r || []).map(r => `<tr>${r.map(c => `<td>${besc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`,
            )
            .join("")
        : "",
    art = v && typeof vybArtikule === "function" ? vybArtikule(v) : "",
    /* věc, kterou zná jen plné znění (Vojtova tabulka předmětů): druh a vzácnost ze seznamu, text po rozbalení */
    pl = (p && p.en) || (v && v.sk === "magicke") ? null : plneVec(x.n),
    druh2 = druh || (pl ? [pl.typ, pl.vz, pl.sl].filter(Boolean).join(", ") : ""),
    cele =
      (v && v.t && p && p.t ? `<details class="kvcele"><summary>Celé znění</summary>${kzMd(p.t)}</details>` : "") +
      ((p && p.en) || (v && v.sk === "magicke") ? plneTag("predmety", (p && p.en) || v.en) : pl ? plneTag("predmety", pl.id) : "");
  if (!druh2 && !par && !txt && !tab && !art) return "";
  const k = String(x.n || "").toLowerCase();
  return `<details class="kvpop" data-kvpop="${besc(k)}"${KVPOPZ.has(k) ? "" : " open"}><summary>Popis</summary>${druh2 || par ? `<p class="kvpar"><i>${besc(druh2)}</i>${druh2 && par ? " · " : ""}${par}</p>` : ""}${txt}${tab}${art}${cele}</details>`;
}
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-kvpop]")) return;
    if (d.open) KVPOPZ.delete(d.dataset.kvpop);
    else KVPOPZ.add(d.dataset.kvpop);
  },
  true,
);
/* --- list věci zespodu --- */
function bdmVecList(K, i) {
  const inv = kInv(K),
    x = inv[i];
  if (!x) return ["Věc", `<p class="bdmnote">Věc už ve vybavení není.</p>`];
  const ro = !kMuze(K),
    p = kPred(x),
    v = typeof vybNajdi === "function" ? vybNajdi(x) : null,
    vH = x.def ? kDilPopis(x) : kVecPopis(x, p, v),
    r = kZbrInfo(x),
    NOS = kNoseno(inv),
    on = r && ((NOS.z && NOS.z.i === i) || (NOS.s && NOS.s.i === i)),
    sv = kInvSvitekI(K, i),
    hd = kInvHod(x),
    B = kBojJa(K);
  const pri = inv.filter(y => y.pripoutano).length,
    sl = kSlozkyVse(K, inv).filter(fl => fl.n !== x.n),
    komu = KARTY.filter(k => k.id !== K.id && !k.test);
  const info = `${kNab(x) ? `<p class="bdmnote">Náboje ${kNabHtml(x, i)}</p>` : ""}<p class="bdmnote">${x.q > 1 ? `<b>${x.q} ks</b> · ` : ""}${x.w ? `${besc(x.w)} · ` : ""}${besc((KINVSK.find(s => s[0] === kInvSkup(x, i, NOS)) || [])[1] || "")}${x.v ? ` · ${besc(x.v)}` : ""}</p>`;
  if (ro) return [x.n, `${vH}${info}${x.pozn ? `<p class="kvpozn">${besc(x.pozn)}</p>` : ""}`];
  const akce = [
    r ? `<button type="button" class="bdmbtn" data-kobl="${i}">${on ? "Sundat" : "Obléct"}</button>` : "",
    (x.def ? x.def.pr : p && p.pr) || x.pripoutano
      ? `<button type="button" class="bdmbtn" data-kpri="${i}" ${!x.pripoutano && pri >= 3 ? `disabled ${btip("Připoutané smíš mít nejvýš 3 předměty")}` : ""}>${x.pripoutano ? "Zrušit připoutání" : "Připoutat"}</button>`
      : "",
    p && p.ef && (p.ef.lecit || p.ef.dhp) ? `<button type="button" class="bdmbtn" data-kinvpij="${i}">Vypít</button>` : "",
    sv >= 0 ? `<button type="button" class="bdmbtn" data-kses="${sv}">Seslat ze svitku</button>` : "",
  ]
    .filter(Boolean)
    .join("");
  const cile = B ? kInvCile(B.s) : [];
  const hodH = hd
    ? `<div class="kvsek"><h4 class="bdmgh">Hodit</h4><p class="bdmnote">Místo jednoho útoku akce Útok, cíl do 20 stop: záchrana DEX SO ${8 + kMod(kVl(K, "DEX") || 10) + kPB(K)}, jinak ${hd.z} ${besc(BZRT[hd.t] || hd.t)}${hd.p ? ` (${besc(hd.p)})` : ""}.</p>
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
      <label class="kvlab kvlabr">Složka <select data-kinvv="${i}">${sl.map(fl => `<option value="${besc(fl.n)}"${(x.v || "") === fl.n ? " selected" : ""}>${besc(fl.jm)}</option>`).join("")}</select></label>
      <button type="button" class="bdmmini kvx" data-kvx="${i}">Zahodit</button></p>${GMV || !window.MMDB ? `<p class="bdmrow"><button type="button" class="bdmbtn ghost" data-bdmsh="inv" data-kved="${i}" ${btip("Dílna vypravěče: základ, vlastnosti a mistrovství, perky, magický bonus, zranění navíc, trvalé bonusy")}>⚒ Upravit vlastnosti</button></p>` : ""}</div>`;
  return [x.n, `${vH}${info}${akce ? `<div class="bdmrow kvakce">${akce}</div>` : ""}${hodH}${darH}${upr}`];
}

/* --- list Spravovat inventář (2026-10-23): přidat z databáze předmětů, vlastní předmět, složky --- */
const KINVDB = [
  /* Zbroj a Zbraně zahrnou i magické kusy (Dwarven Plate, Flame Tongue…) – Vojta hledal trpasličí zbroj pod Zbrojí, 2026-10-25 */
  ["zbroj", "Zbroj", x => x.sk === "zbroj" || (x.sk === "magicke" && /zbroj|štít/i.test(x.druh || ""))],
  ["zbrane", "Zbraně", x => x.sk === "zbrane" || (x.sk === "magicke" && /zbraň/i.test(x.druh || ""))],
  ["strelivo", "Střelivo", x => x.sk === "strelivo"],
  ["vybava", "Výstroj", x => x.sk === "vybava"],
  ["naradi", "Nářadí", x => x.sk === "naradi"],
  ["lektvar", "Lektvary", x => x.sk === "magicke" && /lektvar/i.test(x.druh || "")],
  ["prsten", "Prsteny", x => x.sk === "magicke" && /prsten/i.test(x.druh || "")],
  ["hul", "Hůlky, hole, žezla", x => x.sk === "magicke" && /hůl|žezl/i.test(x.druh || "")],
  ["svitek", "Svitky", x => x.sk === "magicke" && /svit/i.test(x.druh || "")],
  ["magzb", "Magické zbraně a zbroj", x => x.sk === "magicke" && /zbraň|zbroj/i.test(x.druh || "")],
  ["div", "Divotvorné předměty", x => x.sk === "magicke" && /divotvor/i.test(x.druh || "")],
  ["jedy", "Jedy", x => x.sk === "jedy"],
  ["dopr", "Zvířata a doprava", x => /^(zvirata|sedla|vozy|plavidla)$/.test(x.sk)],
];
const KINVDBN = 40;
function kInvDbHtml(K) {
  if (typeof VYB === "undefined" || !VYB) {
    if (typeof vybNacti === "function")
      vybNacti()
        .then(() => {
          document.querySelectorAll("[data-kvdvys]").forEach(el => (el.innerHTML = kInvDbHtml(K)));
        })
        .catch(() => {});
    return `<p class="bdmnote">Načítám databázi předmětů…</p>`;
  }
  /* základ magické zbraně a zbroje (Armor of Gleaming → Chain Mail…) zná až popis magických předmětů */
  if (typeof PRED !== "undefined" && !PRED && typeof predNacti === "function")
    predNacti()
      .then(() => {
        document.querySelectorAll("[data-kvdvys]").forEach(el => (el.innerHTML = kInvDbHtml(K)));
      })
      .catch(() => {});
  const D = BDM.invd || {},
    q = _nrm(String(D.q || "").trim()),
    F = KINVDB.find(r => r[0] === D.f);
  if (!q && !F) return `<p class="bdmnote">Začni psát název (česky i anglicky) nebo vyber druh.</p>`;
  const L = [],
    vid = new Set();
  VYBSK.forEach(([sk]) =>
    (VYB[sk] || []).forEach(x => {
      if (F && !F[2](x)) return;
      if (q && !_nrm(`${x.en} ${x.cz || ""} ${x.druh || ""}`).includes(q)) return;
      /* stejná věc v katalogu dvakrát (Potion of Healing ve výbavě i mezi magickými) – jen jednou */
      const k = String(x.en).toLowerCase();
      if (vid.has(k)) return;
      vid.add(k);
      L.push(x);
    }),
  );
  const gm = GMV || !window.MMDB;
  /* předměty z Vojtovy tabulky (plné znění v databázi, jen přihlášeným), které katalog vybavení nezná – 2026-10-24 */
  const PL = kInvPlne(K, q, D.f, vid),
    nPl = Math.max(0, KINVDBN - L.length);
  return `${L.slice(0, KINVDBN)
    .map(x => {
      const e = vybPoolVstup(x);
      if (e.mag && typeof PREDBY !== "undefined" && PREDBY[e.mag]) e.upr = PREDBY[e.mag].upr || "";
      const dopl = typeof kPoolDopl === "function" ? kPoolDopl(e) : "";
      const pod =
        x.sk === "magicke"
          ? `${x.druh || ""}${x.vz ? ", " + x.vz : ""}${x.pr ? ", připoutání" : ""}`
          : (typeof VYBSKN !== "undefined" && VYBSKN[x.sk]) || "";
      return `<li class="kvdr"><span class="kvdn"><b>${besc(x.en)}</b>${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` <small>${besc(x.cz)}</small>` : ""}<small class="kvrs">${besc(pod)}${x.w ? ` · ${kLbF(x.w)}` : ""}</small></span>
        <form class="kvdf" data-kvdadd="${besc(x.id)}">${dopl}<input name="q" type="number" min="1" max="999" value="1" inputmode="numeric" aria-label="Počet"><button class="bdmbtn" ${btip(gm ? "Přidat do vybavení" : "Pošle vypravěči ke schválení – po potvrzení se věc objeví ve vybavení")}>${gm ? "Přidat" : "Požádat"}</button></form></li>`;
    })
    .join("")}${PL.slice(0, nPl)
    .map(
      x => `<li class="kvdr"><span class="kvdn"><b>${besc(x.en)}</b>${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` <small>${besc(x.cz)}</small>` : ""}<small class="kvrs">${besc([x.typ, x.vz].filter(Boolean).join(", "))}${x.w ? ` · ${besc(x.w)}` : ""}</small></span>
        <form class="kvdf" data-kvdpl="${besc(x.id)}"><input name="q" type="number" min="1" max="999" value="1" inputmode="numeric" aria-label="Počet"><button class="bdmbtn" ${btip(gm ? "Přidat do vybavení" : "Pošle vypravěči ke schválení – po potvrzení se věc objeví ve vybavení")}>${gm ? "Přidat" : "Požádat"}</button></form></li>`,
    )
    .join(
      "",
    )}${L.length + PL.length > KINVDBN ? `<li class="bdmnote">… a dalších ${L.length + PL.length - KINVDBN} – upřesni hledání.</li>` : L.length + PL.length ? "" : `<li class="bdmnote">Nic nenalezeno.</li>`}`;
}
/* předměty z plného znění (Pravidla › Předměty), které katalog nezná: hledání jako v katalogu, druh podle typu z tabulky;
   seznam se načte z databáze při prvním hledání (jen přihlášení) */
const KINVPL = {
  zbroj: /zbroj|štít/i,
  zbrane: /zbraň/i,
  strelivo: /střelivo/i,
  vybava: /výbava|výstroj/i,
  naradi: /nářadí|nástroj/i,
  lektvar: /lektvar/i,
  prsten: /prsten/i,
  hul: /hůl|hůlka|žezl/i,
  svitek: /svit/i,
  magzb: /zbraň|zbroj|štít/i,
  div: /divotvor/i,
  jedy: /\bjed/i,
  dopr: /zvíře|vozidl|plavidl|sedl/i,
};
function kInvPlne(K, q, f, vid) {
  if (typeof PLNES === "undefined" || !featyMuze()) return [];
  if (!PLNES.predmety) {
    plneSeznam("predmety").then(j => {
      if (j) document.querySelectorAll("[data-kvdvys]").forEach(el => (el.innerHTML = kInvDbHtml(K)));
    });
    return [];
  }
  const re = f ? KINVPL[f] : null;
  return PLNES.predmety.filter(
    x =>
      !vid.has(String(x.en).toLowerCase()) &&
      (!f || (re && re.test(x.typ || ""))) &&
      (!q || _nrm(`${x.en} ${x.cz || ""} ${x.typ || ""}`).includes(q)),
  );
}
/* váha z tabulky („2 lb.“, „1/2 lb.“, „—“) na číslo liber za kus */
const kLbPlne = s => {
  const m = String(s || "")
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?/);
  return m ? +m[1] / (+m[2] || 1) : 0;
};
/* předmět z plného znění do vybavení: vypravěč rovnou, hráč pošle návrh (typ „vec“ s polem pl) */
async function kVecPlnePridej(K, id, q) {
  const x = ((typeof PLNES !== "undefined" && PLNES.predmety) || []).find(y => y.id === id);
  if (!x || !K) return;
  q = Math.max(1, Math.min(999, Math.round(+q || 1)));
  const e = {k: "pl", n: String(x.en).slice(0, 80), w: kLbPlne(x.w)};
  if (GMV || !window.MMDB) {
    await kVybPridej(K, e, q);
    return;
  }
  await navrhPosli(K, {typ: "vec", cil: K.id, pl: x.id, n: e.n, w: e.w, q, popis: `${x.en}${q > 1 ? ` ×${q}` : ""} do vybavení`});
}
function bdmInvList(K) {
  const inv = kInv(K),
    D = BDM.invd || {},
    FS = kSlozkyVse(K, inv),
    gm = GMV || !window.MMDB;
  const db = `<section class="kvsek kvdb"><h4 class="bdmgh">Přidat z databáze předmětů</h4>${gm ? "" : `<p class="bdmnote">Přidání z databáze potvrdí vypravěč.</p>`}
    <input type="search" data-kvdq value="${besc(D.q || "")}" placeholder="Hledat: Longsword, lektvar, Bag of Holding…" aria-label="Hledat v databázi předmětů">
    <div class="kvtyp" role="group" aria-label="Druh předmětu">${KINVDB.map(([k, l]) => `<button type="button" data-kvdf="${k}" aria-pressed="${D.f === k}">${l}</button>`).join("")}</div>
    <ul class="kvdlist" data-kvdvys>${kInvDbHtml(K)}</ul></section>`;
  const vl = `<details class="kvsek kvvl"><summary class="bdmgh">Vlastní předmět</summary>
    <form class="kvvlf" data-kvvlf><label>Název <input name="n" required maxlength="80" placeholder="např. Klíč od kaple"></label>
      <label>Počet <input name="q" type="number" min="1" max="9999" value="1" inputmode="numeric"></label>
      <label>Váha za kus (lb) <input name="w" type="number" min="0" max="2000" step="0.1" inputmode="decimal" placeholder="0"></label>
      <label>Druh <select name="typ">${KINVSK.filter(k => k[0] !== "pri")
        .map(([k, l]) => `<option value="${k}"${k === "vys" ? " selected" : ""}>${l}</option>`)
        .join("")}</select></label>
      <label>Složka <select name="v">${FS.map(fl => `<option value="${besc(fl.n)}">${besc(fl.jm)}</option>`).join("")}</select></label>
      <label class="kvvlp">Popis <textarea name="pozn" rows="2" maxlength="300" placeholder="co dělá, odkud je…"></textarea></label>
      <button class="bdmbtn">Přidat</button></form></details>`;
  const sl = `<details class="kvsek kvslz" open><summary class="bdmgh">Složky</summary><ul class="kvsllist">${FS.map(fl => {
    const L = inv.filter(x => (x.v || "") === fl.n),
      w = L.reduce((a, x) => a + kLb(x.w), 0),
      vl = kSlozky(K).some(x => x.n === fl.n);
    return `<li><b>${besc(fl.jm)}</b> <small>${L.length} · ${kLbF(w)}</small>${vl ? `<label class="kvslnen" ${btip("Složku postava nenese (kůň, vůz, úschovna) – nepočítá se do nosnosti")}><input type="checkbox" data-kvslnen="${besc(fl.n)}"${fl.nen ? " checked" : ""}> nenese</label><button type="button" class="bdmmini" data-kvslx="${besc(fl.n)}" aria-label="Smazat složku ${besc(fl.n)}" ${btip("Smaže složku, věci z ní budou Na sobě")}>×</button>` : ""}</li>`;
  }).join("")}</ul>
    <form class="bdmrow" data-kvslf><input name="n" required maxlength="40" placeholder="nová složka (Váček, Kůň, Vůz…)" aria-label="Název nové složky"><button class="bdmbtn ghost">Přidat složku</button></form></details>`;
  return ["Spravovat inventář", `${db}${vl}${gm ? kDilObal(K) : ""}${sl}`];
}
/* --- Dílna vypravěče (2026-10-28): vlastní předmět ze základu z katalogu (zbraň, zbroj, štít, nebo bez základu) – vlastnosti
   a mistrovství SRD, perky z Artikulí, magický bonus, zranění navíc, trvalé bonusy, připoutání. Mechanika je v def u věci (10v),
   vytváří a upravuje jen vypravěč. Rozpracovaný předmět drží BDM.dil, aby ho překreslení listu nesmazalo; tlačítko „Upravit
   vlastnosti“ v listu věci otevře Dílnu s touto věcí (i s věcí z katalogu – uloží ji pak jako vlastní předmět). --- */
const kDilP = () => ({vl: Object.keys(ZBRVL), ma: Object.keys(ZBRMS), pk: Object.keys(BDMZV), ef: [...KUPRC.map(r => r[0]), "zrd"]});
const kDilN = () => ({ma: Object.fromEntries(Object.keys(ZBRMS).map(k => [k, ZBRMS[k][0]])), ef: KUPRN});
const kDilEfL = () => [...KUPRC, ["zrd", "zranění na dálku"], ...BAB.map(a => ["vl:" + a, `${a} nastavená na`])];
const kDilAkt = () => (typeof BZVAKT !== "undefined" ? Object.keys(BZVAKT) : []);
/* základ z katalogu vybavení → def (zbraň, zbroj, štít; jinak věc bez základu) */
function kDilZaklad(x) {
  if (x && x.sk === "zbrane")
    return {
      d: "zbr",
      z: x.id,
      zn: x.en,
      k: x.z,
      t: x.zt,
      vl: [...(x.vl || [])],
      ma: x.ma || "",
      s: /^jednoduch/.test(x.kat || "") ? "S" : "M",
      dal: /na dálku/.test(x.kat || "") ? 1 : 0,
      dos: x.dostrel || "",
      pk: [...(x.art || [])],
    };
  if (x && x.sk === "zbroj")
    return x.typ === "štít"
      ? {d: "stit", z: x.id, zn: x.en, ac: x.ac || 2}
      : {
          d: "zbroj",
          z: x.id,
          zn: x.en,
          ac: x.ac,
          max: x.typ === "těžká" ? null : x.typ === "lehká" ? 9 : (x.agi ?? 2),
          dr: x.art || "Vycpávaná",
          pl: x.plizeni ? 1 : 0,
          str: x.str || "",
        };
  return {d: "vec"};
}
/* rozpracovaný předmět z věci ve vybavení: vlastní předmět beze změny, jinak základ podle jména, bonus „+1“, perky nastavené
   na kartě, účinky a připoutání magického předmětu SRD */
function kDilZVeci(K, x) {
  const q = Math.max(1, +x.q || 1),
    o = {n: x.n, q, w: kLb(x.w) ? Math.round((kLb(x.w) / q) * 100) / 100 : "", v: x.v || "", pozn: x.pozn || ""};
  if (x.def) return Object.assign(o, {def: JSON.parse(JSON.stringify(x.def))});
  const v = typeof vybNajdi === "function" ? vybNajdi(x) : null,
    p = kPred(x),
    w = kZbranInfo(x.n),
    r = kZbrInfo(x);
  let d = v && (v.sk === "zbrane" || v.sk === "zbroj") ? kDilZaklad(v) : null;
  if (!d && w && VYBN[vybKl(w[1])]) d = kDilZaklad(VYBN[vybKl(w[1])]);
  if (!d && r) d = r.k === "s" ? {d: "stit", zn: "Shield", ac: r.ac - r.m} : {d: "zbroj", zn: x.n, ac: r.ac - r.m, max: r.max, dr: r.dr, pl: r.pl};
  d = d || {d: "vec"};
  const ef = Object.assign({}, (p && p.ef) || {});
  KPREDX.forEach(([re, f]) => {
    const m = String(x.n).match(re);
    if (m) Object.assign(ef, typeof f === "function" ? f(m) : f);
  });
  const m = +(String(x.n).match(/\+\s*([1-3])\b/) || [])[1] || +ef.utok || (r ? r.m : 0) || 0;
  if (m && d.d !== "vec") d.b = m;
  const zv = (kartaStav(K.id).zbrVl || {})[x.n];
  if (d.d === "zbr" && zv && Array.isArray(zv.vl)) d.pk = [...zv.vl];
  d.ef = [
    ...Object.entries(ef)
      .filter(([k]) => /^(zach|sput|spdc|ov|zrd)$/.test(k) || (k === "ac" && d.d === "vec"))
      .map(([c, v]) => ({c, v})),
    ...Object.entries(ef.vl || {}).map(([a, v]) => ({c: "vl:" + a, v})),
  ];
  if (p && p.pr) d.pr = 1;
  if (p && VECVZ.includes(p.vz)) d.vz = p.vz;
  return Object.assign(o, {def: d});
}
const kDilOpt = (L, cur) =>
  L.map(([k, l]) => `<option value="${besc(k)}"${String(cur ?? "") === String(k) ? " selected" : ""}>${besc(l)}</option>`).join("");
/* náhled mechaniky pod formulářem: souhrn a upozornění na perky nad rámec Artikulí */
function kDilNahled(D) {
  const d = vecDefNorm(D.def, kDilP()),
    s = vecSouhrn(d, kDilN()),
    va = vecPerkyVaruj(d, kDilAkt());
  return `${s ? `<b>Na kartě:</b> ${besc(s)}` : "Vyber základ nebo doplň bonusy."}${va ? `<br><span class="kdilvar">${besc(va)}</span>` : ""}`;
}
function kDilForm(K) {
  const D = BDM.dil || (BDM.dil = {n: "", q: 1, def: {d: "vec"}}),
    d = D.def || {d: "vec"},
    FS = kSlozkyVse(K, kInv(K)),
    zakl = d.z ? `${d.d}:${d.z}` : "",
    ZT = VECZT.map(t => [t, BZRT[t] || t]),
    chk = (n, v, on, l, tip) =>
      `<label class="kdilchk"${tip ? " " + btip(tip) : ""}><input type="checkbox" name="${n}" value="${besc(v)}"${on ? " checked" : ""}> ${l}</label>`;
  if (!VYB && typeof vybNacti === "function")
    vybNacti()
      .then(() => kDilObnov(K))
      .catch(() => {});
  const zs = `<label class="kdilw">Základ <select name="zakl" data-kdilz><option value="">— bez základu (divotvorný předmět, jiná věc) —</option>
    <optgroup label="Zbraně">${((VYB && VYB.zbrane) || []).map(x => `<option value="zbr:${besc(x.id)}"${zakl === "zbr:" + x.id ? " selected" : ""}>${besc(x.en)}${x.cz ? ` – ${besc(x.cz)}` : ""}</option>`).join("")}</optgroup>
    <optgroup label="Zbroj a štít">${((VYB && VYB.zbroj) || [])
      .map(x => {
        const k = `${x.typ === "štít" ? "stit" : "zbroj"}:${x.id}`;
        return `<option value="${besc(k)}"${zakl === k ? " selected" : ""}>${besc(x.en)}${x.cz ? ` – ${besc(x.cz)}` : ""}</option>`;
      })
      .join("")}</optgroup></select></label>`;
  let mech = "";
  if (d.d === "zbr") {
    const VL = new Map(
      (d.vl || []).map(s => {
        const m = String(s).match(/^([^(]*?)\s*(?:\(([^)]*)\))?$/);
        return [m[1], m[2] || ""];
      }),
    );
    mech = `<fieldset class="kdilfs"><legend>Zbraň</legend>
      <label>Kostka <input name="k" value="${besc(d.k || "")}" maxlength="6" placeholder="1d8"></label>
      <label>Typ zranění <select name="t">${kDilOpt(ZT, d.t)}</select></label>
      <label>Druh <select name="s">${kDilOpt(
        [
          ["S", "jednoduchá"],
          ["M", "válečná"],
        ],
        d.s || "M",
      )}</select></label>
      <label>Dostřel <input name="dos" value="${besc(d.dos || "")}" maxlength="9" placeholder="80/320"></label>
      ${chk("dal", "1", d.dal, "na dálku")}
      <div class="kdilg"><span>Vlastnosti</span>${Object.keys(ZBRVL)
        .filter(k => k !== "Range")
        .map(
          k =>
            `${chk("vl", k, VL.has(k), besc(ZBRVL[k][0]), ZBRVL[k][1])}${k === "Versatile" ? `<input name="vers" class="kdilmal" value="${besc(VL.get("Versatile") || "")}" maxlength="5" placeholder="1d10" aria-label="Kostka obouruč">` : ""}`,
        )
        .join("")}</div>
      <label>Mistrovství <select name="ma"><option value="">— žádné —</option>${kDilOpt(
        Object.keys(ZBRMS).map(k => [k, `${ZBRMS[k][0]} (${k})`]),
        d.ma,
      )}</select></label>
      <div class="kdilg"><span>Perky (Artikule)</span>${Object.keys(BDMZV)
        .map(k => chk("pk", k, (d.pk || []).includes(k), `${bikZv(k)}${besc(k)}`, `${k}: ${BVLZ[k] || ""}`))
        .join("")}</div>
      <div class="kdilg"><span>Zranění navíc při zásahu</span>${[0, 1]
        .map(j => {
          const z = (d.zr || [])[j] || {};
          return `<span class="kdilr"><input name="zrk${j}" class="kdilmal" value="${besc(z.k || "")}" maxlength="5" placeholder="1d6" aria-label="Kostka"><select name="zrt${j}" aria-label="Typ zranění">${kDilOpt([["", "—"], ...ZT], z.t)}</select></span>`;
        })
        .join("")}</div></fieldset>`;
  } else if (d.d === "zbroj")
    mech = `<fieldset class="kdilfs"><legend>Zbroj</legend>
      <label>AC <input name="ac" type="number" min="10" max="25" value="${besc(d.ac ?? 11)}" inputmode="numeric"></label>
      <label>DEX <select name="max">${kDilOpt(
        [
          ["9", "celá DEX (lehká)"],
          ["2", "nejvýš +2 (střední)"],
          ["", "bez DEX (těžká)"],
        ],
        d.max == null || d.max === "" ? "" : +d.max >= 9 ? "9" : String(d.max),
      )}</select></label>
      <label>Druh podle Artikulí <select name="dr">${kDilOpt(
        VECDR.map(x => [x, x]),
        d.dr,
      )}</select></label>
      <label>Potřebná STR <input name="str" type="number" min="0" max="20" value="${besc(d.str || "")}" placeholder="—" inputmode="numeric"></label>
      ${chk("pl", "1", d.pl, "nevýhoda na plížení")}</fieldset>`;
  else if (d.d === "stit")
    mech = `<fieldset class="kdilfs"><legend>Štít</legend><label>AC <input name="ac" type="number" min="1" max="5" value="${besc(d.ac ?? 2)}" inputmode="numeric"></label></fieldset>`;
  const mag = `<fieldset class="kdilfs"><legend>Magie</legend>
    ${
      d.d !== "vec"
        ? `<label>Magický bonus <select name="b">${kDilOpt(
            [
              ["0", "žádný"],
              ["1", "+1"],
              ["2", "+2"],
              ["3", "+3"],
            ],
            d.b || 0,
          )}</select></label>`
        : ""
    }
    <div class="kdilg"><span>Trvalé bonusy</span>${[0, 1, 2, 3]
      .map(j => {
        const e = (d.ef || [])[j] || {};
        return `<span class="kdilr"><select name="efc${j}" aria-label="Bonus ${j + 1}"><option value="">—</option>${kDilOpt(kDilEfL(), e.c)}</select><input name="efv${j}" class="kdilmal" type="number" min="-10" max="30" value="${besc(e.v ?? "")}" aria-label="Hodnota" inputmode="numeric"></span>`;
      })
      .join("")}</div>
    ${chk("pr", "1", d.pr, "vyžaduje připoutání")}
    <label>Vzácnost <select name="vz"><option value="">—</option>${kDilOpt(
      VECVZ.map(x => [x, x]),
      d.vz,
    )}</select></label></fieldset>`;
  return `<form class="kvdilf" data-kdilf>
    <label class="kdilw">Název <input name="n" required maxlength="80" value="${besc(D.n || "")}" placeholder="např. Rožmberský meč"></label>
    ${zs}
    <label>Počet <input name="q" type="number" min="1" max="9999" value="${besc(D.q || 1)}" inputmode="numeric"></label>
    <label>Váha za kus (lb) <input name="w" type="number" min="0" max="2000" step="0.1" value="${besc(D.w ?? "")}" inputmode="decimal" placeholder="0"></label>
    <label>Složka <select name="v">${FS.map(fl => `<option value="${besc(fl.n)}"${(D.v || "") === fl.n ? " selected" : ""}>${besc(fl.jm)}</option>`).join("")}</select></label>
    ${mech}${mag}
    <label class="kdilw">Popis <textarea name="pozn" rows="2" maxlength="300" placeholder="odkud je, kdo ji ukoval, co se o ní vypráví…">${besc(D.pozn || "")}</textarea></label>
    <p class="kdilnah kdilw" data-kdilnah>${kDilNahled(D)}</p>
    <p class="bdmrow kdilw"><button class="bdmbtn">${D.i != null ? "Uložit změny" : "Vytvořit"}</button>${D.i != null || D.n ? `<button type="button" class="bdmbtn ghost" data-kdilzrus>${D.i != null ? "Zrušit úpravu" : "Vyčistit"}</button>` : ""}</p></form>`;
}
const kDilObal = K => {
  const D = BDM.dil;
  return `<details class="kvsek kvdil" data-kdilw${D && (D.open || D.i != null) ? " open" : ""}><summary class="bdmgh">${D && D.i != null ? `Upravit předmět: ${besc(D.n || "")}` : "Vytvořit předmět"}</summary><div data-kdilbox>${kDilForm(K)}</div></details>`;
};
const kDilObnov = K => {
  document.querySelectorAll(`.bdm[data-kid="${K.id}"] [data-kdilbox]`).forEach(el => (el.innerHTML = kDilForm(K)));
};
/* formulář → rozpracovaný předmět (hodnoty jak je vypravěč napsal; vecDefNorm je očistí při náhledu a uložení) */
function kDilCti(F) {
  const E = F.elements,
    D = BDM.dil || {},
    d0 = D.def || {d: "vec"},
    g = n => (E[n] ? E[n].value : ""),
    on = n => !!(E[n] && E[n].checked),
    vse = n => [...F.querySelectorAll(`[name="${n}"]:checked`)].map(x => x.value),
    d = {d: d0.d};
  if (d0.z) d.z = d0.z;
  if (d0.zn) d.zn = d0.zn;
  if (d.d === "zbr")
    Object.assign(d, {
      k: g("k"),
      t: g("t"),
      s: g("s"),
      dal: on("dal") ? 1 : 0,
      dos: g("dos"),
      ma: g("ma"),
      pk: vse("pk"),
      vl: vse("vl").map(k => (k === "Versatile" && g("vers").trim() ? `Versatile (${g("vers").trim()})` : k)),
      zr: [0, 1].map(j => ({k: g("zrk" + j), t: g("zrt" + j)})),
    });
  if (d.d === "zbroj") Object.assign(d, {ac: g("ac"), max: g("max") === "" ? null : +g("max"), dr: g("dr"), pl: on("pl") ? 1 : 0, str: g("str")});
  if (d.d === "stit") d.ac = g("ac");
  if (E.b) d.b = g("b");
  d.ef = [0, 1, 2, 3].map(j => ({c: g("efc" + j), v: g("efv" + j)})).filter(e => e.c);
  d.pr = on("pr") ? 1 : 0;
  d.vz = g("vz");
  return Object.assign({}, D, {n: g("n"), q: g("q"), w: g("w"), v: g("v"), pozn: g("pozn"), def: d});
}
const kDilK = el => {
  const root = el && el.closest && el.closest(".bdm");
  return root ? KARTBY[root.dataset.kid] : null;
};
document.addEventListener("input", e => {
  const F = e.target.closest && e.target.closest("[data-kdilf]");
  if (!F || e.target.matches("[data-kdilz]")) return;
  BDM.dil = kDilCti(F);
  const nh = F.querySelector("[data-kdilnah]");
  if (nh) nh.innerHTML = kDilNahled(BDM.dil);
});
/* jiný základ: zbraň, zbroj nebo štít převezme hodnoty ze základu; název, popis a magie zůstanou */
document.addEventListener("change", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kdilz]")) return;
  const K = kDilK(t),
    F = t.closest("[data-kdilf]");
  if (!K || !F) return;
  const D = kDilCti(F),
    x = VYBBY[String(t.value).split(":")[1]],
    d = kDilZaklad(t.value ? x : null),
    stare = D.def || {};
  ["ef", "pr", "vz"].forEach(k => {
    if (stare[k] != null) d[k] = stare[k];
  });
  if (stare.b && d.d !== "vec") d.b = stare.b;
  const w0 = (stare.z && VYBBY[stare.z] && VYBBY[stare.z].w) || "";
  BDM.dil = Object.assign(D, {def: d, w: x && (!D.w || String(D.w) === String(w0)) ? x.w || "" : D.w});
  kDilObnov(K);
});
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-kdilw]")) return;
    BDM.dil = Object.assign(BDM.dil || {n: "", q: 1, def: {d: "vec"}}, {open: d.open});
  },
  true,
);
/* Upravit vlastnosti (list věci): Dílna s touto věcí – dřív, než tlačítko otevře list Spravovat inventář */
document.addEventListener(
  "click",
  e => {
    const b = e.target.closest && e.target.closest("[data-kved]");
    if (!b) return;
    const K = kDilK(b),
      x = K && kInv(K)[+b.dataset.kved];
    if (!x) return;
    BDM.dil = Object.assign(kDilZVeci(K, x), {i: +b.dataset.kved, open: true});
    setTimeout(() => {
      const el = document.querySelector(`.bdm[data-kid="${K.id}"] [data-kdilw]`);
      if (el && el.scrollIntoView) el.scrollIntoView({block: "start", behavior: "smooth"});
    }, 60);
  },
  true,
);
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-kdilzrus]");
  if (!b) return;
  const K = kDilK(b);
  BDM.dil = null;
  if (K) bdmPrekresli();
});
async function kDilUloz(K, F) {
  const D = kDilCti(F),
    d = vecDefNorm(D.def, kDilP()),
    n = (String(D.n || "").trim() || d.zn || "").slice(0, 80);
  if (!n) {
    mmHlas("Zadej název předmětu.", 2500);
    return;
  }
  const q = Math.max(1, Math.min(9999, Math.round(+D.q || 1))),
    w = Math.max(0, +String(D.w || "").replace(",", ".") || 0),
    inv = kInv(K).map(y => Object.assign({}, y)),
    upr = D.i != null && inv[D.i],
    it = upr ? inv[D.i] : {},
    pz = String(D.pozn || "")
      .trim()
      .slice(0, 300);
  Object.assign(it, {n, q, def: d});
  if (w) it.w = kLbTxt(w * q);
  else delete it.w;
  if (D.v) it.v = D.v;
  else delete it.v;
  if (pz) it.pozn = pz;
  else delete it.pozn;
  delete it.typ;
  if (!upr) {
    const r = vecZbroj(d);
    if (r) {
      inv.forEach(y => {
        const z = kZbrInfo(y);
        if (z && z.k === r.k) y.obl = false;
      });
      it.obl = true;
    }
    inv.push(it);
  }
  const s = vecSouhrn(d, kDilN()),
    i = upr ? D.i : inv.length - 1;
  await kInvUloz(K, inv, `${K.n}: ${n} ${upr ? "upraven" : "ve vybavení"}${s ? ` – ${s}` : ""}.`);
  kHodZapis({k: K.id, kdo: K.n, co: upr ? "Úprava předmětu" : "Nový předmět", txt: `${n}${s ? `: ${s}` : ""}`});
  BDM.dil = null;
  if (BDM.sheet) BDM.sheet = {k: BDM.sheet.k, t: "vec", i};
  bdmPrekresli();
}
document.addEventListener("submit", async e => {
  const F = e.target;
  if (!F.matches || !F.matches("[data-kdilf]")) return;
  e.preventDefault();
  const K = kDilK(F);
  if (!K || !(GMV || !window.MMDB)) return;
  await kDilUloz(K, F);
});
/* popis vlastního předmětu v listu věci: souhrn mechaniky, perky s pravidly Artikulí, upozornění */
function kDilPopis(x) {
  const d = x.def,
    k = String(x.n || "").toLowerCase(),
    s = vecSouhrn(d, kDilN()),
    va = vecPerkyVaruj(d, kDilAkt()),
    art = d.d === "zbr" && (d.pk || []).length && typeof vybArtikule === "function" ? vybArtikule({sk: "zbrane", art: d.pk}) : "";
  return `<details class="kvpop" data-kvpop="${besc(k)}"${KVPOPZ.has(k) ? "" : " open"}><summary>Popis</summary><p class="kvpar"><i>Vlastní předmět${d.zn ? ` · základ ${besc(d.zn)}` : ""}</i></p>${s ? `<p>${besc(s)}</p>` : ""}${art}${va ? `<p class="bdmnote kdilvar">${besc(va)}</p>` : ""}</details>`;
}
const kInvDbObnov = root => {
  const K = root && KARTBY[root.dataset.kid];
  if (!K) return;
  root.querySelectorAll("[data-kvdvys]").forEach(el => (el.innerHTML = kInvDbHtml(K)));
};
document.addEventListener("input", e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kvdq]")) return;
  BDM.invd = Object.assign({}, BDM.invd, {q: t.value});
  kInvDbObnov(t.closest(".bdm"));
});
/* přidání z databáze: vypravěč (a web bez databáze) rovnou, hráč pošle návrh vypravěči (typ „vec“) */
async function kInvDbPridej(K, F) {
  const x = VYBBY[F.dataset.kvdadd];
  if (!x) return;
  const E = F.elements,
    q = Math.max(1, Math.min(999, Math.round(+E.q.value || 1))),
    zakl = E.zakl ? E.zakl.value : "",
    bon = E.bon ? +E.bon.value : 0;
  if (GMV || !window.MMDB) {
    const e = vybPoolVstup(x);
    await kVybPridej(K, e, q, {zakl, bon});
    return;
  }
  const d = {
    typ: "vec",
    cil: K.id,
    kat: x.id,
    q,
    popis: `${x.en}${zakl ? ` (${zakl})` : ""}${bon ? ` +${bon}` : ""}${q > 1 ? ` ×${q}` : ""} do vybavení`,
  };
  if (zakl) d.zakl = zakl;
  if (bon) d.bon = bon;
  await navrhPosli(K, d);
}
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-kvdadd],[data-kvdpl],[data-kvvlf],[data-kvslf]")) return;
  e.preventDefault();
  const root = f.closest(".bdm"),
    K = root && KARTBY[root.dataset.kid];
  if (!K || !kMuze(K)) return;
  if (f.matches("[data-kvdadd]")) {
    await kInvDbPridej(K, f);
    return;
  }
  if (f.matches("[data-kvdpl]")) {
    await kVecPlnePridej(K, f.dataset.kvdpl, f.elements.q.value);
    return;
  }
  const E = f.elements;
  if (f.matches("[data-kvslf]")) {
    const n = E.n.value.trim().slice(0, 40),
      L = kSlozky(K);
    if (!n || /^na sobě$/i.test(n) || L.some(x => x.n.toLowerCase() === n.toLowerCase())) {
      f.reset();
      return;
    }
    await kartaStavZmen(K.id, {slozky: [...L, {n}].slice(0, 20)}, `${K.n}: nová složka ${n}.`);
    return;
  }
  const n = E.n.value.trim().slice(0, 80),
    q = Math.max(1, Math.min(9999, Math.round(+E.q.value || 1))),
    w = Math.max(0, +E.w.value || 0);
  if (!n) return;
  const it = {n, q};
  if (w) it.w = kLbTxt(w * q);
  if (E.typ.value && E.typ.value !== "vys") it.typ = E.typ.value;
  if (E.v.value) it.v = E.v.value;
  if (E.pozn.value.trim()) it.pozn = E.pozn.value.trim().slice(0, 300);
  await kInvUloz(K, [...kInv(K).map(y => Object.assign({}, y)), it], `${K.n}: ${n}${q > 1 ? ` ×${q}` : ""} ve vybavení.`);
  kHodZapis({k: K.id, kdo: K.n, co: "Vlastní předmět", txt: `${n}${q > 1 ? " ×" + q : ""}`});
});
document.addEventListener("click", async e => {
  const T = q => e.target.closest && e.target.closest(q),
    root = T(".bdm"),
    K = root && KARTBY[root.dataset.kid];
  if (!K) return;
  const df = T("[data-kvdf]");
  if (df) {
    BDM.invd = Object.assign({}, BDM.invd, {f: (BDM.invd || {}).f === df.dataset.kvdf ? "" : df.dataset.kvdf});
    root.querySelectorAll("[data-kvdf]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.kvdf === BDM.invd.f)));
    kInvDbObnov(root);
    return;
  }
  const sx = T("[data-kvslx]");
  if (sx && kMuze(K)) {
    const n = sx.dataset.kvslx,
      inv = kInv(K).map(y => Object.assign({}, y)),
      L = inv.filter(y => y.v === n);
    if (L.length && !confirm(`Smazat složku ${n}? ${L.length} ${L.length === 1 ? "věc bude" : "věci budou"} Na sobě.`)) return;
    L.forEach(y => delete y.v);
    await kartaStavZmen(K.id, Object.assign({slozky: kSlozky(K).filter(x => x.n !== n)}, L.length ? {inv} : {}), `${K.n}: složka ${n} smazána.`);
  }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-kvslnen]")) return;
  const root = t.closest(".bdm"),
    K = root && KARTBY[root.dataset.kid];
  if (!K || !kMuze(K)) return;
  await kartaStavZmen(K.id, {
    slozky: kSlozky(K).map(x => (x.n === t.dataset.kvslnen ? Object.assign({n: x.n}, t.checked ? {nen: true} : {}) : x)),
  });
});

/* --- list Peníze --- */
function bdmPenList(K) {
  const pen = kPenKarta(K),
    ro = !kMuze(K);
  if (ro) return ["Peníze", `<p class="kvpen">${kPenHtml(pen)}</p>`];
  return [
    "Peníze",
    `<p class="kvpen">${kPenHtml(pen)}</p>
    <form class="bdmrow kvpenf" data-kvpenf><input name="v" type="number" min="1" max="9999999" inputmode="numeric" placeholder="částka" required aria-label="Částka" style="width:6em"><select name="k" aria-label="Mince">${kMinceNab(
      pen,
    )
      .map(k => `<option value="${k}">${KMINCZK[k]}</option>`)
      .join("")}</select>
      <button class="bdmbtn" name="a" value="z" ${btip("Odečte částku; když nemáš přesné mince, rozmění větší")}>Zaplatit</button><button class="bdmbtn" name="a" value="p">Přijmout</button>
      ${window.MMDB && MMDB.pokladna && (GMV || KZAM.has(K.id)) ? `<button class="bdmbtn ghost" name="a" value="dp" ${btip("Vloží částku do pokladny družiny")}>Do pokladny</button><button class="bdmbtn ghost" name="a" value="zp" ${btip("Vybere částku z pokladny družiny")}>Z pokladny</button>` : ""}</form>
    <details class="bdmbez"><summary>Mince jednotlivě a směna</summary><div class="kpen">${kMinceNab(pen)
      .map(
        k =>
          `<label>${KMINCJM[k] ? kMinceIk("mince-" + k.toLowerCase()) : ""}${KMINCZK[k]} <input type="number" min="0" max="9999999" data-kpen="${k}" value="${+pen[k] || 0}"></label>`,
      )
      .join("")}</div>${kPenSmenHtml()}</details>${!GMV && window.MMDB && KZAM.has(K.id) ? poklHtml() : ""}`,
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
      pij = p && p.ef && (p.ef.lecit || p.ef.dhp),
      svt = svetloDruh(x.n);
    if (svt) {
      L.push(
        `<span class="kvpz"><button type="button" class="kspn" data-bdmsh="vec" data-i="${i}">${besc(x.n)}${x.q > 1 ? ` ×${x.q}` : ""}</button><button type="button" class="bdmmini" data-kinvsvet="${i}" ${btip(`${svt.n}: ${svt.sv}, hoří ${svt.h} h herního času${svt.palivo ? " na lahvičku oleje" : ""}`)}>zapálit</button></span>`,
      );
      return;
    }
    if (!pij && sv < 0 && !hd) return;
    L.push(
      `<span class="kvpz"><button type="button" class="kspn" data-bdmsh="vec" data-i="${i}">${besc(x.n)}${x.q > 1 ? ` ×${x.q}` : ""}</button>${pij ? `<button type="button" class="bdmmini" data-kinvpij="${i}">vypít</button>` : sv >= 0 ? `<button type="button" class="bdmmini" data-kses="${sv}">seslat</button>` : `<button type="button" class="bdmmini" data-bdmsh="vec" data-i="${i}">hodit</button>`}</span>`,
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
  (BDM.invq = BDM.invq || {})[root.dataset.kid] = t.value.trim().toLowerCase();
  kInvFiltr(root);
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
    pen = kPenKarta(K);
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
    await kartaStavZmen(K.id, {pen: P}, `${K.n}: +${v} ${KMINCZK[k]}${a === "zp" ? " z pokladny družiny" : ""}.`);
    kHodZapis({k: K.id, kdo: K.n, co: a === "zp" ? "Z pokladny" : "Peníze", txt: `+${v} ${KMINCZK[k]} → ${kPenTxt(P)}`});
    f.reset();
    return;
  }
  const P = kPenZapl(pen, k, v);
  if (!P) {
    mmHlasG(`Na ${v} ${KMINCZK[k]} nemáš dost peněz (${kPenTxt(pen)}).`, 4000);
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
    `${K.n}: −${v} ${KMINCZK[k]}${a === "dp" ? " do pokladny družiny" : ""} → ${kPenTxt(P)}.`,
  );
  kHodZapis({k: K.id, kdo: K.n, co: a === "dp" ? "Do pokladny" : "Zaplatil", txt: `−${v} ${KMINCZK[k]} → ${kPenTxt(P)}`});
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
      dc = 8 + kMod(kVl(K, "DEX") || 10) + kPB(K),
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
          plos: {ab: "DEX", dc, pol: false},
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
      txt: `${z.x} ${BZRT[H.t] || H.t} · záchrana DEX SO ${dc}${H.p ? " · " + H.p : ""}`,
    });
    await kInvUloz(K, inv, `${K.n}: ${x.n}${c ? ` → ${c.n} – čeká na vypravěče` : ""} (zranění ${z.t}, záchrana DEX SO ${dc}).`);
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
