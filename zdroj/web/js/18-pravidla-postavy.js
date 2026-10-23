/* ===== Pravidla postavy (2026-10-17): karta počítá podle pravidel D&D 2024 (SRD 5.2.1), PDF z D&D Beyond je jen výchozí podklad.
   Model postavy: povolání a úrovně (lze zvyšovat přímo na kartě), skóre vlastností (lze přepsat), zdatnosti, druh, rysy a featy,
   vybavení (co má na sobě, co je připoutané). Z něj se počítá: bonus zdatnosti, maximum životů, kostky životů, sloty kouzel,
   SO a útok kouzel, útoky zbraní (i nově získaných), AC, záchrany, dovednosti, iniciativa, pasivní smysly, rychlost, nosnost
   a počty použití schopností. Co v PDF pravidla nevysvětlí (hody na životy, předmět mimo databázi…), se ukáže jako
   samostatná úprava „z D&D Beyond“, kterou lze odebrat; hráč může přidat i vlastní úpravy. ===== */
const KTR = {
  Barbarian: {hd: 12, cz: "Barbar"},
  Bard: {hd: 8, cz: "Bard", c: 1, ab: "CHA"},
  Cleric: {hd: 8, cz: "Klerik", c: 1, ab: "WIS"},
  Druid: {hd: 8, cz: "Druid", c: 1, ab: "WIS"},
  Fighter: {hd: 10, cz: "Bojovník"},
  Monk: {hd: 8, cz: "Mnich"},
  Paladin: {hd: 10, cz: "Paladin", c: 0.5, ab: "CHA"},
  Ranger: {hd: 10, cz: "Hraničář", c: 0.5, ab: "WIS"},
  Rogue: {hd: 8, cz: "Tulák"},
  Sorcerer: {hd: 6, cz: "Čaroděj", c: 1, ab: "CHA"},
  Warlock: {hd: 8, cz: "Černokněžník", pakt: 1, ab: "CHA"},
  Wizard: {hd: 6, cz: "Kouzelník", c: 1, ab: "INT"},
};
const KMARC = /Barbarian|Fighter|Paladin|Ranger/;
/* sloty podle úrovně sesilatele (SRD: Multiclassing) a sloty paktu černokněžníka */
const KSLT = [
  [],
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];
const kPakt = u => (u < 1 ? null : {max: u >= 17 ? 4 : u >= 11 ? 3 : u >= 2 ? 2 : 1, st: u >= 9 ? 5 : Math.ceil(u / 2)});
/* druhy (SRD 5.2.1): rychlost a velikost; trpaslík +1 HP za úroveň */
const KDRUH = [
  [/goliath/i, 35],
  [/dwarf|trpasl/i, 30, 1],
  [/halfling|hobit|půlčík/i, 30],
  [/gnome|gnóm/i, 30],
  [/elf/i, 30],
  [/orc|ork/i, 30],
  [/dragonborn|drakoroz/i, 30],
  [/tiefling/i, 30],
  [/human|člověk/i, 30],
];
/* zbraně SRD 5.2.1: [vzor, název, kostka, typ, vlastnosti, S/M (jednoduchá/válečná), dálková] */
const KZBRAN = [
  [/\bclub\b|kyj/i, "Club", "1d4", "Bludgeoning", "Light", "S"],
  [/dagger|dýk|tesák/i, "Dagger", "1d4", "Piercing", "Finesse, Light, Thrown", "S"],
  [/greatclub/i, "Greatclub", "1d8", "Bludgeoning", "Two-Handed", "S"],
  [/handaxe|sekerk/i, "Handaxe", "1d6", "Slashing", "Light, Thrown", "S"],
  [/javelin|oštěp/i, "Javelin", "1d6", "Piercing", "Thrown", "S"],
  [/light hammer/i, "Light Hammer", "1d4", "Bludgeoning", "Light, Thrown", "S"],
  [/\bmace\b|palcát/i, "Mace", "1d6", "Bludgeoning", "", "S"],
  [/quarterstaff|bojová hůl/i, "Quarterstaff", "1d6", "Bludgeoning", "Versatile (1d8)", "S"],
  [/sickle|srp/i, "Sickle", "1d4", "Slashing", "Light", "S"],
  [/\bspear\b|kopí/i, "Spear", "1d6", "Piercing", "Thrown, Versatile (1d8)", "S"],
  [/\bdart\b|šipk/i, "Dart", "1d4", "Piercing", "Finesse, Thrown", "S", 1],
  [/light crossbow|lehká kuše/i, "Light Crossbow", "1d8", "Piercing", "Ammunition, Loading, Two-Handed", "S", 1],
  [/shortbow|krátký luk/i, "Shortbow", "1d6", "Piercing", "Ammunition, Two-Handed", "S", 1],
  [/\bsling\b|prak/i, "Sling", "1d4", "Bludgeoning", "Ammunition", "S", 1],
  [/battleaxe|bojová sekera/i, "Battleaxe", "1d8", "Slashing", "Versatile (1d10)", "M"],
  [/\bflail\b|řemdih|cep/i, "Flail", "1d8", "Bludgeoning", "", "M"],
  [/glaive|sudlic/i, "Glaive", "1d10", "Slashing", "Heavy, Reach, Two-Handed", "M"],
  [/greataxe|velká sekera/i, "Greataxe", "1d12", "Slashing", "Heavy, Two-Handed", "M"],
  [/greatsword|obouruční meč|montán/i, "Greatsword", "2d6", "Slashing", "Heavy, Two-Handed", "M"],
  [/halberd|halapartn/i, "Halberd", "1d10", "Slashing", "Heavy, Reach, Two-Handed", "M"],
  [/\blance\b/i, "Lance", "1d10", "Piercing", "Heavy, Reach", "M"],
  [/longsword|dlouhý meč|^meč/i, "Longsword", "1d8", "Slashing", "Versatile (1d10)", "M"],
  [/\bmaul\b|perlík/i, "Maul", "2d6", "Bludgeoning", "Heavy, Two-Handed", "M"],
  [/morningstar|ježek/i, "Morningstar", "1d8", "Piercing", "", "M"],
  [/\bpike\b|píka/i, "Pike", "1d10", "Piercing", "Heavy, Reach, Two-Handed", "M"],
  [/rapier|rapír|kord/i, "Rapier", "1d8", "Piercing", "Finesse", "M"],
  [/scimitar|šavl/i, "Scimitar", "1d6", "Slashing", "Finesse, Light", "M"],
  [/shortsword|krátký meč/i, "Shortsword", "1d6", "Piercing", "Finesse, Light", "M"],
  [/trident|trojzub/i, "Trident", "1d8", "Piercing", "Thrown, Versatile (1d10)", "M"],
  [/warhammer|válečné kladivo/i, "Warhammer", "1d8", "Bludgeoning", "Versatile (1d10)", "M"],
  [/war pick|čakan/i, "War Pick", "1d8", "Piercing", "Versatile (1d10)", "M"],
  [/\bwhip\b|bič/i, "Whip", "1d4", "Slashing", "Finesse, Reach", "M"],
  [/hand crossbow|ruční kuše/i, "Hand Crossbow", "1d6", "Piercing", "Ammunition, Light, Loading", "M", 1],
  [/heavy crossbow|těžká kuše|^kuše/i, "Heavy Crossbow", "1d10", "Piercing", "Ammunition, Heavy, Loading, Two-Handed", "M", 1],
  [/longbow|dlouhý luk|\bluk\b/i, "Longbow", "1d8", "Piercing", "Ammunition, Heavy, Two-Handed", "M", 1],
  [/musket|mušket/i, "Musket", "1d12", "Piercing", "Ammunition, Loading, Two-Handed", "M", 1],
  [/pistol|píšťal/i, "Pistol", "1d10", "Piercing", "Ammunition, Loading", "M", 1],
  [/blowgun|foukačk/i, "Blowgun", "1", "Piercing", "Ammunition, Loading", "M", 1],
];
const kZbranInfo = n => {
  n = String(n || "");
  if (/ammunition|arrows?\b|bolts?\b|šíp|šipky do|munice|sheath|pochv|quiver|toulec/i.test(n)) return null;
  return KZBRAN.find(r => r[0].test(n)) || null;
};
/* předměty, které pravidla znají jménem (doplňují databázi SRD předmětů): nastavené skóre, bonus ke kouzlům a další */
const KPREDX = [
  [/amulet of health/i, {vl: {CON: 19}}],
  [/gauntlets of ogre power/i, {vl: {STR: 19}}],
  [/headband of intellect/i, {vl: {INT: 19}}],
  [/belt of hill giant/i, {vl: {STR: 21}}],
  [/belt of (stone|frost) giant/i, {vl: {STR: 23}}],
  [/belt of fire giant/i, {vl: {STR: 25}}],
  [/belt of cloud giant/i, {vl: {STR: 27}}],
  [/belt of storm giant/i, {vl: {STR: 29}}],
  [/wand of the war mage,?\s*\+?(\d)/i, m => ({sput: +m[1]})],
  [/rod of the pact keeper,?\s*\+?(\d)/i, m => ({sput: +m[1], spdc: +m[1]})],
  [/amulet of the devout,?\s*\+?(\d)/i, m => ({sput: +m[1], spdc: +m[1]})],
  [/staff of power/i, {ac: 2, zach: 2, sput: 2}],
  [/robe of the archmagi/i, {spdc: 2, sput: 2, acz: 15}],
  [/stone of good luck|luckstone/i, {zach: 1, ov: 1}],
  [/ioun stone.*protection/i, {ac: 1}],
  [/bracers of archery/i, {zrd: 2}],
  [/cloak of protection/i, {ac: 1, zach: 1}],
  [/ring of protection/i, {ac: 1, zach: 1}],
];
/* ---- povolání a úrovně ---- */
const kTrN = n =>
  Object.keys(KTR).find(
    k =>
      k.toLowerCase() ===
        String(n || "")
          .trim()
          .toLowerCase() ||
      KTR[k].cz.toLowerCase() ===
        String(n || "")
          .trim()
          .toLowerCase(),
  ) || String(n || "").trim();
function kTridyPdf(K) {
  const o = [];
  String(K.povolani || "").replace(/([A-Za-zÁ-ž][A-Za-zÁ-ž' ]*?)\s+(\d+)/g, (m, n, u) => {
    o.push({n: kTrN(n), u: +u});
    return m;
  });
  if (!o.length && K.uroven) o.push({n: "?", u: +K.uroven});
  return o;
}
const kTridy = K => kartaStav(K.id).tridy || kTridyPdf(K);
/* ---- kontext: vstupy modelu (aktuální stav, nebo stav PDF pro porovnání) ---- */
const KCX = new WeakMap(),
  KCX0 = new WeakMap();
function kCtx(K, pdf) {
  const S = pdf ? {} : kartaStav(K.id),
    C = pdf ? KCX0 : KCX,
    key = pdf ? (K.vybaveni ? K : KST[K.id] || K) : KST[K.id] || K,
    c0 = C.get(key);
  if (c0 && c0.K === K && c0.pred === !!PRED && c0.mimo === !!MIMO) return c0;
  if (!MIMO && !MIMOP)
    mimoNacti().then(j => {
      if (j) kartyPrekresli();
    });
  const tr = pdf ? kTridyPdf(K) : kTridy(K),
    lv = tr.reduce((a, t) => a + t.u, 0) || +K.uroven || 1,
    pb = 2 + Math.floor((lv - 1) / 4);
  const inv = (pdf ? (K.vybaveni || kartaStav(K.id).inv || []).map(x => Object.assign({}, x, {obl: undefined})) : S.inv || K.vybaveni || []).filter(
    x => !(x.q != null && +x.q <= 0),
  );
  const ry = new Set([...(K.rysy2 || []).map(r => r.n), ...(K.rysy || [])].map(x => String(x).toLowerCase().replace(/[’']/g, "'")));
  const maRys = re => [...ry].some(x => re.test(x));
  /* efekty předmětů: z databáze SRD (ef) a podle jména; předmět s připoutáním působí jen připoutaný */
  const E = [],
    vlSet = {};
  inv.forEach(x => {
    const p = kPred(x),
      nm = String(x.n || "");
    if (p && p.pr && !x.pripoutano) return;
    const ef = Object.assign({}, (p && p.ef) || {});
    KPREDX.forEach(([re, f]) => {
      const m = nm.match(re);
      if (m) Object.assign(ef, typeof f === "function" ? f(m) : f);
    });
    if (kZbrInfo(x) || kZbranInfo(nm)) return; /* zbroj, štít a zbraně počítá AC a útok */
    Object.entries(ef).forEach(([k, v]) => {
      if (k === "vl")
        Object.entries(v).forEach(([a, s]) => {
          vlSet[a] = Math.max(vlSet[a] || 0, s);
          E.push({c: "vl:" + a, v: s, n: nm, set: 1});
        });
      else if (/^(ac|zach|sput|spdc|ov|zrd|acz)$/.test(k)) E.push({c: k, v: +v, n: nm});
    });
  });
  const vl = {};
  BAB.forEach(a => {
    const o = (S.vlU || {})[a];
    let v = o != null ? +o : kVl0(K, a);
    if (v == null) v = 10;
    if (vlSet[a] && vlSet[a] > v) v = vlSet[a];
    vl[a] = v;
  });
  const c = {pred: !!PRED, K, S, pdf, tr, lv, pb, inv, ry, maRys, E, vl, md: a => kMod(vl[a]), N: kNoseno(inv), druh: String(K.druh || "")};
  if (!pdf) kZbrUziti(c, S);
  c.mimo = !!MIMO;
  kMimoEf(c);
  (S.upr || []).forEach(u => E.push({c: u.c, v: +u.v, n: u.n || "vlastní úprava", vl: 1}));
  C.set(key, c);
  return c;
}
const kEf = (c, k) => c.E.filter(e => e.c === k).reduce((a, e) => a + e.v, 0);
const kEfL = (c, k) => c.E.filter(e => e.c === k && e.v).map(e => [e.n, e.v]);
const kJoat = c => kTrU(c, "Bard") >= 2 || c.maRys(/jack of all trades/);
/* ---- jednotlivé hodnoty: [součet, rozpis] ---- */
const KR = {
  pb: c => [c.pb, [[`${c.lv}. úroveň`, c.pb]]],
  zach: (c, a) => {
    const p = (c.K.zachProf || []).includes(a),
      L = [[`${a}`, c.md(a)]];
    if (p) L.push(["zdatnost", c.pb]);
    if (kTrU(c, "Paladin") >= 6) L.push(["Aura of Protection", Math.max(1, c.md("CHA"))]);
    L.push(...kEfL(c, "zach"), ...kEfL(c, "zach:" + a));
    return L;
  },
  dov: (c, n) => {
    const ab = KDOVAB[n] || "STR",
      p = (c.K.dovProf || {})[n],
      L = [[ab, c.md(ab)]];
    if (p === "E") L.push(["Expertise", 2 * c.pb]);
    else if (p && p !== "H") L.push(["zdatnost", c.pb]);
    else if (p === "H" || kJoat(c)) L.push(["Jack of All Trades", Math.floor(c.pb / 2)]);
    L.push(...kEfL(c, "ov"), ...kEfL(c, "ov:" + ab), ...kEfL(c, "dov"), ...kEfL(c, "dov:" + n));
    return L;
  },
  ov: (c, a) => {
    const L = [[a, c.md(a)]];
    if (kJoat(c)) L.push(["Jack of All Trades", Math.floor(c.pb / 2)]);
    L.push(...kEfL(c, "ov"), ...kEfL(c, "ov:" + a));
    return L;
  },
  ini: c => {
    const L = [["AGI", c.md("AGI")]];
    if (c.maRys(/^alert$/)) L.push(["Alert", c.pb]);
    if (kJoat(c)) L.push(["Jack of All Trades", Math.floor(c.pb / 2)]);
    L.push(...kEfL(c, "ov"), ...kEfL(c, "ini"));
    return L;
  },
  pas: (c, k) => {
    const n = KPASD[k];
    return [["základ", 10], [n, kSum(KR.dov(c, n)) + (c.pdf ? kDeltaRaw(c.K, "dov", n) : kDelta(c.K, "dov", n))], ...kEfL(c, "pas:" + k)];
  },
  spab: c => {
    const t = c.tr.map(x => KTR[x.n]).filter(x => x && x.ab);
    return kSpAbPdf(c.K) || (t[0] || {}).ab || (c.maRys(/eldritch knight|arcane trickster/) ? "INT" : null) || kMimoSpab(c);
  },
  spdc: c => {
    const a = KR.spab(c);
    return a ? [["základ", 8], ["zdatnost", c.pb], [a, c.md(a)], ...kEfL(c, "spdc")] : [];
  },
  sput: c => {
    const a = KR.spab(c);
    return a ? [["zdatnost", c.pb], [a, c.md(a)], ...kEfL(c, "sput")] : [];
  },
  hp: c => {
    if (!c.tr.length || c.tr.some(t => !KTR[t.n])) return [["z D&D Beyond", +c.K.hp || 1]];
    const L = [],
      t0 = c.tr[0];
    c.tr.forEach((t, i) => {
      const d = KTR[t.n].hd,
        n = i === 0 ? t.u - 1 : t.u;
      if (i === 0) L.push([`${KTR[t.n].cz} 1. úroveň (d${d} max.)`, d]);
      if (n > 0) L.push([`${KTR[t.n].cz} ${n}× průměr d${d}`, n * (d / 2 + 1)]);
    });
    L.push([`CON ${bsg(c.md("CON"))} × ${c.lv}`, c.md("CON") * c.lv]);
    if ((KDRUH.find(d => d[0].test(c.druh)) || [])[2]) L.push(["Dwarven Toughness", c.lv]);
    if (c.maRys(/^tough$/)) L.push(["Tough", 2 * c.lv]);
    if (c.maRys(/draconic resilience/)) L.push(["Draconic Resilience", kTrU(c, "Sorcerer")]);
    L.push(...kEfL(c, "hp"));
    return L;
  },
  rych: c => {
    const d = KDRUH.find(x => x[0].test(c.druh)),
      L = [[d ? c.K.druh : "druh", d ? d[1] : 30]],
      hv = c.N.z && c.N.z.max == null,
      mk = kTrU(c, "Monk"),
      bb = kTrU(c, "Barbarian");
    if (mk >= 2 && !c.N.z && !c.N.s) L.push(["Unarmored Movement", mk >= 18 ? 30 : mk >= 14 ? 25 : mk >= 10 ? 20 : mk >= 6 ? 15 : 10]);
    if (bb >= 5 && !hv) L.push(["Fast Movement", 10]);
    if (kTrU(c, "Ranger") >= 6 && c.maRys(/roving/)) L.push(["Roving", 10]);
    if (c.maRys(/^speedy$|^mobile$/)) L.push(["Speedy", 10]);
    const sr = hv ? {16: 13, 17: 15, 18: 15}[c.N.z.ac - c.N.z.m] || 0 : 0;
    if (sr && c.vl.STR < sr) L.push([`${c.N.z.n}: Síla pod ${sr}`, -10]);
    L.push(...kEfL(c, "rych"));
    return L;
  },
};
/* PDF → co pravidla nevysvětlí; hráč to může odebrat (S.pdfx) */
const KPDFV = {
  zach: (K, a) => (K.zach || {})[a],
  dov: (K, n) => (K.dov || {})[n],
  ini: K => K.ini,
  pas: (K, k) => (K.pasiv || {})[k],
  spdc: K => (K.kouzla || {}).dc,
  sput: K => (K.kouzla || {}).utok,
  hp: K => K.hp,
  rych: K => {
    const m = String(K.rychlost || "").match(/\d+/);
    return m ? +m[0] : null;
  },
};
const KDLT = new WeakMap();
function kDeltaRaw(K, t, a) {
  const kk = K.vybaveni ? K : KST[K.id] || K;
  let M = KDLT.get(kk);
  if (!M || M.$p !== !!PRED || M.$m !== !!MIMO) {
    M = {$p: !!PRED, $m: !!MIMO};
    KDLT.set(kk, M);
  }
  const key = t + (a != null ? ":" + a : "");
  if (!(key in M)) {
    const p = KPDFV[t] ? KPDFV[t](K, a) : null;
    M[key] = p == null || p === "" ? 0 : +p - kSum(KR[t](kCtx(K, true), a));
  }
  return M[key];
}
function kDelta(K, t, a) {
  const key = t + (a != null ? ":" + a : "");
  return (kartaStav(K.id).pdfx || []).includes(key) ? 0 : kDeltaRaw(K, t, a);
}
function kHodn(K, t, a) {
  const c = kCtx(K),
    L = KR[t](c, a).filter(x => x[1]),
    d = kDelta(K, t, a);
  if (d) L.push(["z D&D Beyond", d]);
  if (!c.pdf && (t === "zach" || t === "hp" || t === "rych" || t === "dov" || t === "ov") && typeof kBufHodn === "function")
    L.push(...kBufHodn(K, t, a, L));
  return {v: kSum(L), L};
}
const kRozpis = L => L.map(([l, v]) => `${l} ${bsg(v)}`).join(" · ");
/* ---- veřejné funkce karty (stejná jména jako dřív) ---- */
const kLv = K => kCtx(K).lv;
const kPB = K => kCtx(K).pb;
const kVl0 = (K, a) => {
  const v = (K.vl || {})[a];
  return v == null || v === "" ? null : +v;
};
const kVl = (K, a) => kCtx(K).vl[a];
const kMd = (K, a) => kCtx(K).md(a);
const kZach = (K, a) => kHodn(K, "zach", a).v;
const kDov = (K, n) => kHodn(K, "dov", n).v;
const kOvB = (K, a) => kHodn(K, "ov", a).v;
const kIni = K => kHodn(K, "ini").v;
const KPASD = {vnimani: "Perception", vhled: "Insight", patrani: "Investigation"};
const kPas = (K, k) => kHodn(K, "pas", k).v;
const kSpAbPdf = K => {
  const v = String((K.kouzla || {}).vl || "");
  return !v
    ? null
    : /cha/i.test(v)
      ? "CHA"
      : /wis|mou/i.test(v)
        ? "WIS"
        : /int/i.test(v)
          ? "INT"
          : /con|odo/i.test(v)
            ? "CON"
            : /dex|agi|obr/i.test(v)
              ? "AGI"
              : /str|síl/i.test(v)
                ? "STR"
                : null;
};
const kSpAb = K => KR.spab(kCtx(K));
const kSpDC = (K, x) => (x && x.pz && x.pz.dc ? x.pz.dc : kSpAb(K) ? kHodn(K, "spdc").v : null);
const kSpUt = K => (kSpAb(K) ? kHodn(K, "sput").v : 0);
const kSpU1 = (K, x) => (x && x.pz && x.pz.ut != null ? x.pz.ut : kSpUt(K));
const kHPmax = K => Math.max(1, kHodn(K, "hp").v);
const kRychN = K => {
  const c = kCtx(K),
    S = c.S;
  let v = kHodn(K, "rych").v;
  const vy = +S.vycerp || 0;
  if (vy) v -= 5 * vy;
  const st = kStavy(K);
  if (st.some(x => /chycen|zadržen|ochromen|omráčen|zkamen|bezvědomí/.test(x))) v = 0;
  return Math.max(0, v);
};
const kRychTxt = K => {
  const t = String(K.rychlost || ""),
    n = kRychN(K);
  return /\d+/.test(t) ? t.replace(/\d+/, n) : n + " stop";
};
const kHDtxt = K => {
  const c = kCtx(K),
    g = {};
  c.tr.forEach(t => {
    const d = (KTR[t.n] || {}).hd || 8;
    g[d] = (g[d] || 0) + t.u;
  });
  const s = Object.keys(g)
    .sort((a, b) => b - a)
    .map(d => `${g[d]}d${d}`)
    .join(" + ");
  return s || K.kz || "";
};
function kKostkyPool(K) {
  const o = [];
  kHDtxt(K).replace(/(\d+)d(\d+)/g, (m, n, s) => {
    for (let i = 0; i < +n; i++) o.push(+s);
    return m;
  });
  return o.sort((a, b) => b - a);
}
/* sloty: podle povolání; když PDF obsahuje sloty, které pravidla neodvodí (podtřída mimo SRD), zůstanou sloty z PDF */
function kSlotyMax(K, pdf) {
  const c = kCtx(K, pdf),
    cs = c.tr.filter(t => KTR[t.n] && KTR[t.n].c),
    jed = c.tr.length === 1;
  let cl = 0;
  cs.forEach(t => {
    const f = KTR[t.n].c;
    cl += f === 1 ? t.u : Math.ceil(t.u / 2);
  });
  if (c.maRys(/eldritch knight/)) cl += jed ? Math.ceil(kTrU(c, "Fighter") / 3) : Math.floor(kTrU(c, "Fighter") / 3);
  if (c.maRys(/arcane trickster/)) cl += jed ? Math.ceil(kTrU(c, "Rogue") / 3) : Math.floor(kTrU(c, "Rogue") / 3);
  if (cs.length === 1 && KTR[cs[0].n].c === 0.5 && jed) cl = Math.ceil(cs[0].u / 2);
  const o = (KSLT[Math.min(20, cl)] || []).map((m, i) => ({st: i + 1, max: m, pakt: false})),
    p = kPakt(kTrU(c, "Warlock"));
  if (p) o.push({st: p.st, max: p.max, pakt: true});
  return o;
}
function kSlotyDef(K) {
  const pdf = ((K.kouzla || {}).sloty || [])
      .map(q => q.st + (q.pakt ? "p" : "") + q.max)
      .sort()
      .join(),
    r0 = kSlotyMax(K, true)
      .map(q => q.st + (q.pakt ? "p" : "") + q.max)
      .sort()
      .join();
  return pdf && pdf !== r0 ? K.kouzla.sloty || [] : kSlotyMax(K);
}
function kSloty(K) {
  const S = kartaStav(K.id),
    U = S.zdr || {};
  return kSlotyDef(K).map(q => {
    const k = "slot" + q.st + (q.pakt ? "p" : "");
    return {k, st: q.st, max: q.max, pakt: !!q.pakt, u: Math.min(q.max, U[k] || 0)};
  });
}
/* počty použití schopností podle pravidel (SRD 5.2.1); ostatní z PDF */
const KZDRP = [
  [
    /^rage$/i,
    c => {
      const u = kTrU(c, "Barbarian");
      return u ? (u >= 17 ? 6 : u >= 12 ? 5 : u >= 6 ? 4 : u >= 3 ? 3 : 2) : 0;
    },
    "dlouhý odpočinek (1 se vrátí krátkým)",
    "Rage",
  ],
  [
    /bardic inspiration/i,
    c => (kTrU(c, "Bard") ? Math.max(1, c.md("CHA")) : 0),
    c => (kTrU(c, "Bard") >= 5 ? "krátký odpočinek" : "dlouhý odpočinek"),
    "Bardic Inspiration",
  ],
  [
    /channel divinity/i,
    c => {
      const k = kTrU(c, "Cleric"),
        p = kTrU(c, "Paladin");
      return Math.max(k >= 18 ? 4 : k >= 6 ? 3 : k >= 2 ? 2 : 0, p >= 11 ? 3 : p >= 3 ? 2 : 0);
    },
    "dlouhý odpočinek (1 se vrátí krátkým)",
    "Channel Divinity",
  ],
  [
    /wild shape/i,
    c => {
      const u = kTrU(c, "Druid");
      return u >= 17 ? 4 : u >= 6 ? 3 : u >= 2 ? 2 : 0;
    },
    "dlouhý odpočinek (1 se vrátí krátkým)",
    "Wild Shape",
  ],
  [
    /second wind/i,
    c => {
      const u = kTrU(c, "Fighter");
      return u >= 10 ? 4 : u >= 4 ? 3 : u ? 2 : 0;
    },
    "dlouhý odpočinek (1 se vrátí krátkým)",
    "Second Wind",
  ],
  [
    /action surge/i,
    c => {
      const u = kTrU(c, "Fighter");
      return u >= 17 ? 2 : u >= 2 ? 1 : 0;
    },
    "krátký odpočinek",
    "Action Surge",
  ],
  [
    /indomitable/i,
    c => {
      const u = kTrU(c, "Fighter");
      return u >= 17 ? 3 : u >= 13 ? 2 : u >= 9 ? 1 : 0;
    },
    "dlouhý odpočinek",
    "Indomitable",
  ],
  [
    /^(focus points?|ki|monk's focus)$/i,
    c => {
      const u = kTrU(c, "Monk");
      return u >= 2 ? u : 0;
    },
    "krátký odpočinek",
    "Focus Points",
  ],
  [
    /sorcery points|font of magic/i,
    c => {
      const u = kTrU(c, "Sorcerer");
      return u >= 2 ? u : 0;
    },
    "dlouhý odpočinek",
    "Sorcery Points",
  ],
  [/arcane recovery/i, c => (kTrU(c, "Wizard") ? 1 : 0), "dlouhý odpočinek", "Arcane Recovery"],
  [/magical cunning/i, c => (kTrU(c, "Warlock") >= 2 ? 1 : 0), "dlouhý odpočinek", "Magical Cunning"],
  [/^lucky$/i, c => c.pb, "dlouhý odpočinek"],
  [/breath weapon/i, c => c.pb, "dlouhý odpočinek"],
  [/stone's endurance|large form/i, c => c.pb, "dlouhý odpočinek"],
  [/relentless endurance/i, c => 1, "dlouhý odpočinek"],
  [/divine intervention/i, c => (kTrU(c, "Cleric") >= 10 ? 1 : 0), "dlouhý odpočinek"],
  [/tireless/i, c => (kTrU(c, "Ranger") >= 10 ? c.pb : 0), "dlouhý odpočinek"],
  [
    /favored enemy/i,
    c => {
      const u = kTrU(c, "Ranger");
      return u >= 17 ? 6 : u >= 13 ? 5 : u >= 9 ? 4 : u >= 5 ? 3 : u ? 2 : 0;
    },
    "dlouhý odpočinek",
  ],
];
function kZdroje(K) {
  const c = kCtx(K),
    fit = n => KZDRP.find(x => x[0].test(String(n).replace(/[’']/g, "'"))),
    ob = (r, q) => (typeof r[2] === "function" ? r[2](c) : r[2] || q.obn);
  const o = (K.zdroje || []).map(q => {
    const r = fit(q.n);
    if (!r) return q;
    const m = r[1](c);
    return m > 0 ? Object.assign({}, q, {max: m, obn: ob(r, q), kr1: /1 se vrátí/.test(ob(r, q)) || undefined, pr: 1}) : q;
  });
  KZDRP.filter(r => r[3] && !o.some(q => r[0].test(String(q.n).replace(/[’']/g, "'")))).forEach(r => {
    const m = r[1](c);
    if (m > 0) o.push({n: r[3], max: m, obn: ob(r, {}), kr1: /1 se vrátí/.test(ob(r, {})) || undefined, pr: 1});
  });
  return kMimoZdroje(c, o);
}
/* omezená použití postavy jedním seznamem pro puntíky a čipy {k, n, max, obn}: sloty kouzel (pakt zvlášť), zdroje povolání
   a Výdrž z Artikulí; o.obnSlotu = i u slotů ukázat obnovu, o.jenSloty = bez zdrojů a Výdrže */
function kOmezena(K, o = {}) {
  const sl = kSloty(K).map(q =>
    o.obnSlotu
      ? {k: q.k, n: `${q.pakt ? "Pakt" : "Sloty"} ${q.st}. st.`, max: q.max, obn: q.pakt ? "krátký odpočinek" : "dlouhý odpočinek"}
      : {k: q.k, n: `${q.pakt ? "Pakt" : "Sloty"} ${q.st}. st.`, max: q.max},
  );
  if (o.jenSloty) return sl;
  const vmx = kVydMax(K);
  return [
    ...sl,
    ...kZdroje(K).map(q => ({k: q.n, n: q.n, max: q.max, obn: q.obn})),
    ...(vmx ? [{k: "Výdrž", n: "Výdrž", max: vmx, obn: "dlouhý odpočinek"}] : []),
  ];
}
/* ---- zbroj, štít, AC ---- */
/* ---- obsah D&D 2024 mimo SRD (art/mimo-srd.json): podtřídy, featy, zázemí, Aasimar – vlastní stručné shrnutí mechaniky.
   Postava má rys, když je jeho název mezi rysy z PDF; počty použití a trvalé bonusy (ef) se pak počítají samy. ---- */
let MIMO = null,
  MIMOP = null,
  MIMOR = {};
const mimoN = s =>
  String(s || "")
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/^[^:]{2,40}:\s*/, "")
    .trim();
const mimoNacti = () =>
  MIMO
    ? Promise.resolve(MIMO)
    : (MIMOP =
        MIMOP ||
        fetch("art/mimo-srd.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(j => {
            const R = {},
              add = (n, v) => {
                const k = mimoN(n);
                (R[k] = R[k] || []).push(v);
              };
            (j.podtridy || []).forEach(p => {
              add(p.en, {typ: "pod", o: p, r: null});
              (p.al || []).forEach(a => add(a, {typ: "pod", o: p, r: null}));
              (p.rysy || []).forEach(r => add(r.en, {typ: "rys", o: p, r}));
            });
            (j.featy || []).forEach(f => add(f.en, {typ: "feat", o: f, r: f}));
            (j.zazemi || []).forEach(z => add(z.en, {typ: "zaz", o: z, r: z}));
            (j.druhy || []).forEach(d => {
              add(d.en, {typ: "druh", o: d, r: null});
              (d.rysy || []).forEach(r => add(r.en, {typ: "druh", o: d, r}));
            });
            MIMOR = R;
            MIMO = j;
            return j;
          })
          .catch(() => {
            MIMOP = null;
            return null;
          }));
/* nejlepší shoda: rys podtřídy povolání, které postava má, a nejvíc rysů téže podtřídy na listu */
function mimoNajdi(c, n) {
  const L = MIMOR[mimoN(n)];
  if (!L || !L.length) return null;
  if (L.length === 1 || !c) return L[0];
  const sk = x => (x.typ === "rys" || x.typ === "pod" ? (kTrU(c, x.o.tr) ? 10 : 0) + (x.o.rysy || []).filter(r => c.ry.has(mimoN(r.en))).length : 1);
  return L.slice().sort((a, b) => sk(b) - sk(a))[0];
}
const mimoMa = c => {
  const o = [];
  c.ry.forEach(n => {
    const m = mimoNajdi(c, n);
    if (m && m.r && !(m.typ === "rys" && m.r.u && kTrU(c, m.o.tr) && kTrU(c, m.o.tr) < m.r.u)) o.push(m);
  });
  return o;
};
function mimoPocet(c, m) {
  const p = m.r.pocet;
  if (p == null) return 0;
  if (typeof p === "number") return p;
  if (p === "PB") return c.pb;
  if (/^(STR|AGI|DEX|CON|INT|WIS|CHA)$/.test(p)) return Math.max(1, c.md(p === "DEX" ? "AGI" : p));
  if (Array.isArray(p)) {
    const u = m.typ === "rys" ? kTrU(c, m.o.tr) : c.lv;
    let v = 0;
    p.forEach(([od, n]) => {
      if (u >= od) v = n;
    });
    return v;
  }
  return 0;
}
const mimoKostka = (c, m) => {
  const k = m.r.kostka;
  if (!k) return "";
  if (typeof k === "string") return k;
  const u = m.typ === "rys" ? kTrU(c, m.o.tr) : c.lv;
  let v = "";
  k.forEach(([od, d]) => {
    if (u >= od) v = d;
  });
  return v;
};
/* rysy, které pravidla už počítají jménem (Tough, Speedy, Lucky…), tu nesčítat podruhé */
const MIMOSKIP = /^(tough|speedy|mobile|lucky|alert)$/;
function kMimoEf(c) {
  if (!MIMO) return;
  mimoMa(c).forEach(m => {
    const ef = m.r.ef;
    if (!ef || MIMOSKIP.test(mimoN(m.r.en))) return;
    const nm = m.r.en;
    if (ef.ac) c.E.push({c: "ac", v: +ef.ac, n: nm});
    if (ef.rych) c.E.push({c: "rych", v: +ef.rych, n: nm});
    if (ef.ini)
      c.E.push({c: "ini", v: ef.ini === "PB" ? c.pb : /^[A-Z]{3}$/.test(ef.ini) ? c.md(ef.ini === "DEX" ? "AGI" : ef.ini) : +ef.ini, n: nm});
    if (ef.hpU && m.typ === "rys") c.E.push({c: "hp", v: ef.hpU * kTrU(c, m.o.tr), n: nm});
    if (ef.hpL) c.E.push({c: "hp", v: ef.hpL * c.lv, n: nm});
    /* ov: ["CHA", "WIS"] – k ověřením jedné vlastnosti přičti modifikátor jiné (min. 1), např. Otherworldly Glamour */
    if (Array.isArray(ef.ov) && ef.ov.length === 2)
      c.E.push({
        c: "ov:" + (ef.ov[0] === "DEX" ? "AGI" : ef.ov[0]),
        v: Math.max(1, ef.ov[1] === "PB" ? c.pb : c.md(ef.ov[1] === "DEX" ? "AGI" : ef.ov[1])),
        n: nm,
      });
  });
}
function kMimoSpab(c) {
  if (!MIMO) return null;
  const m = mimoMa(c).find(m => m.r.ef && m.r.ef.spab);
  return m ? m.r.ef.spab : null;
}
function kMimoZdroje(c, o) {
  if (!MIMO) return o;
  mimoMa(c).forEach(m => {
    if (m.r.zdroj || m.r.pocet == null || KZDRP.some(r => r[0].test(m.r.en))) return;
    const max = mimoPocet(c, m);
    if (!(max > 0)) return;
    const obn = m.r.obn || "dlouhý odpočinek",
      k = mimoKostka(c, m),
      i = o.findIndex(q => mimoN(q.n) === mimoN(m.r.en));
    const q = {n: m.r.en, max, obn: k ? `${obn} · kostka ${k}` : obn, kr1: /1 se vrátí/.test(obn) || undefined, pr: 1};
    if (i >= 0) {
      if (!o[i].pr) o[i] = Object.assign({}, o[i], q);
    } else o.push(q);
  });
  return o;
}
const MIMOCAS = {A: "Akce", BA: "Bonusová akce", R: "Reakce"};
function mimoMeta(m, c) {
  const r = m.r,
    L = [];
  if (r.u) L.push(`${r.u}. úroveň`);
  if (r.cas) L.push(MIMOCAS[r.cas] || r.cas);
  if (r.pocet != null)
    L.push(
      `použití: ${c ? mimoPocet(c, m) + "× " : ""}${typeof r.pocet === "number" ? "" : Array.isArray(r.pocet) ? "podle úrovně" : r.pocet === "PB" ? "bonus zdatnosti" : r.pocet + " (min. 1)"}`.replace(
        /\s+$/,
        "",
      ),
    );
  if (r.obn) L.push(`obnova: ${r.obn}`);
  if (r.kostka) L.push(`kostka ${c ? mimoKostka(c, m) : Array.isArray(r.kostka) ? r.kostka.map(x => x[1]).join("/") : r.kostka}`);
  if (r.zdroj) L.push(`spotřebuje: ${r.zdroj}`);
  if (r.kouzla) L.push(`vždy připravená kouzla: ${r.kouzla.map(([u, k]) => `${u}. ${k.join(", ")}`).join(" · ")}`);
  return L.join(" · ");
}
const MIMOPOZN =
  "Shrnutí mechaniky vlastními slovy pro tažení Mundus Mutatus – nejde o oficiální text pravidel. Obsah mimo SRD 5.2.1; plné znění najdeš ve své příručce nebo na listu postavy z D&D Beyond.";
function mimoRysHtml(m, c) {
  if (!m || !m.r) return "";
  const r = m.r,
    kde =
      m.typ === "rys"
        ? `${m.o.cz || m.o.en} (${(KTR[m.o.tr] || {}).cz || m.o.tr})`
        : m.typ === "feat"
          ? "feat"
          : m.typ === "druh"
            ? m.o.cz || m.o.en
            : "zázemí";
  const meta = mimoMeta(m, c);
  return `<div class="kmimo"><p><b>${besc(r.cz || r.en)}</b> <small>· ${besc(kde)}</small></p><p>${kzIn(r.t || "")}</p>${meta ? `<p class="rsmall">${besc(meta)}</p>` : ""}<p class="rsmall srdattr">${besc(MIMOPOZN)}</p></div>`;
}
/* [jméno, AC, nejvýš AGI, druh podle Artikulí, nevýhoda na Stealth (SRD, stejně jako katalog vybavení `plizeni`)] */
const KZBRT = [
  [/padded|prošívan|vycpávan|gambeson/i, 11, 9, "Vycpávaná", 1],
  [/studded|pobíjen/i, 12, 9, "Vycpávaná", 0],
  [/leather armou?r|kožená zbroj|kožený kabátec/i, 11, 9, "Vycpávaná", 0],
  [/hide armou?r|kožešinov/i, 12, 2, "Vycpávaná", 0],
  [/chain shirt|kroužková košile|drátěná košile|elven chain/i, 13, 2, "Kroužková", 0],
  [/scale mail|šupinov|dragon scale/i, 14, 2, "Kroužková", 1],
  [/breastplate|kyrys|brigantin/i, 14, 2, "Plátová", 0],
  [/half.?plate|půlplát|poloplát/i, 15, 2, "Plátová", 1],
  [/ring mail|kroužkovan/i, 14, null, "Kroužková", 1],
  [/chain ?mail|kroužková zbroj|drátěná zbroj|drátěnk/i, 16, null, "Kroužková", 1],
  [/splint|dlahov|šínov/i, 17, null, "Plátová", 1],
  [/plate armou?r|^plate\b|plátová zbroj|plná zbroj|dwarven plate|demon armor/i, 18, null, "Komplexní", 1],
];
function kZbrInfo(x) {
  const n = String((x && x.n) || "");
  if (
    !n ||
    (x.q != null && +x.q <= 0) ||
    /gauntlet|gloves|boots|helm|rukavic|bot[ay]|přilb|scroll|potion|book|wand|staff|amulet|svit|lektvar|knih|hůl|\bof shield|shielding|ring of|prsten/i.test(
      n,
    )
  )
    return null;
  const p = kPred(x),
    pe = +((p && p.ef && p.ef.ac) || 0),
    m = +(n.match(/\+\s*([1-3])\b/) || [])[1] || pe;
  if (/\bshield\b|štít|pavéz/i.test(n)) return {k: "s", ac: 2 + m, m};
  const t = KZBRT.find(r => r[0].test(n));
  /* mithrilová zbroj nevýhodu na Stealth nemá (SRD, Mithral Armor) */
  return t ? {k: "z", ac: t[1] + m, max: t[2], dr: t[3], m, pl: t[4] && !/mithral|mithril/i.test(n) ? 1 : 0} : null;
}
function kNoseno(inv) {
  const o = {z: null, s: null};
  (inv || []).forEach((x, i) => {
    const r = kZbrInfo(x);
    if (!r || x.obl === false) return;
    const c = Object.assign({i, n: x.n, ex: x.obl === true}, r),
      p = o[r.k];
    if (!p || (c.ex && !p.ex) || (c.ex === p.ex && c.ac > p.ac)) o[r.k] = c;
  });
  return o;
}
KR.ac = c => {
  const N = c.N,
    dx = c.md("AGI"),
    L = [];
  if (N.z) {
    const b = N.z.max == null ? 0 : Math.min(dx, N.z.max);
    L.push([N.z.n, N.z.ac]);
    if (N.z.max != null) L.push([N.z.max < 9 ? `AGI (nejvýš +${N.z.max})` : "AGI", b]);
    if (c.maRys(/^defense$|fighting style: defense/)) L.push(["Defense", 1]);
  } else {
    const az = c.E.filter(e => e.c === "acz").reduce((a, e) => Math.max(a, e.v), 0),
      U = [[10 + dx, "bez zbroje 10 + AGI"]];
    if (kTrU(c, "Barbarian")) U.push([10 + dx + c.md("CON"), "Unarmored Defense (10 + AGI + CON)"]);
    if (kTrU(c, "Monk") && !N.s) U.push([10 + dx + c.md("WIS"), "Unarmored Defense (10 + AGI + WIS)"]);
    if (c.maRys(/draconic resilience/)) U.push([10 + dx + c.md("CHA"), "Draconic Resilience (10 + AGI + CHA)"]);
    if (az) U.push([az + dx, "Robe of the Archmagi (15 + AGI)"]);
    U.sort((a, b) => b[0] - a[0]);
    L.push([U[0][1], U[0][0]]);
    c.inv.forEach(x => {
      if (/bracers of defense/i.test(x.n) && !N.s && x.pripoutano) L.push([x.n, 2]);
    });
  }
  if (N.s) L.push([N.s.n, N.s.ac]);
  L.push(...kEfL(c, "ac").filter(([n]) => !/bracers of defense/i.test(n)));
  return L;
};
KPDFV.ac = K => K.ac;
function kACR(K) {
  const S = kartaStav(K.id),
    H = kHodn(K, "ac"),
    N = kCtx(K).N,
    L = H.L.slice();
  let ac = H.v;
  if (S.forma && S.forma.ac) return {ac: +S.forma.ac, txt: `podoba ${S.forma.n} (AC zvířete)`, N};
  if (S.bezstit && N.s) {
    ac -= N.s.ac;
    L.push(["bez štítu", -N.s.ac]);
  } else if (S.bezstit) {
    ac -= 2;
    L.push(["bez štítu", -2]);
  }
  let min = 0;
  (S.uc || []).forEach(x => {
    if (x.ac) {
      ac += +x.ac;
      L.push([x.n, +x.ac]);
    }
    if (x.acmin) min = Math.max(min, +x.acmin);
  });
  if (
    typeof kBufy === "function" &&
    !(S.uc || []).some(x => x.ac && /^Shield of Faith$/.test(x.n)) &&
    kBufy(K).some(b => b.n === "Shield of Faith")
  ) {
    ac += 2;
    L.push(["Shield of Faith", 2]);
  }
  if (typeof kBufAC === "function") {
    const B = kBufAC(K, N);
    ac += B.ac;
    L.push(...B.L);
    if (B.min > min) min = B.min;
  }
  const txt = L.map(([l, v], i) => (i ? `${l} ${bsg(v)}` : `${l} ${v}`)).join(" · ") + (min > ac ? ` · aspoň ${min} (kouzlo)` : "");
  return {ac: Math.max(ac, min), txt, N};
}
const kAC = K => kACR(K).ac;
/* Resistance: z karty (D&D Beyond) + ze zbroje, kterou postava nosí (Artikule, Zbroj) */
const kOdol = K => {
  const N = kCtx(K).N,
    r = [...(K.odol || []), ...(typeof kBufRes === "function" ? kBufRes(K).filter(t => !(K.odol || []).includes(t)) : [])];
  if (kPri(K).includes("Rage"))
    ["Bludgeoning", "Piercing", "Slashing"].forEach(t => {
      if (!r.includes(t)) r.push(t);
    });
  if (N.z && BZBR[N.z.dr])
    BZBR[N.z.dr][0].split(/,\s*/).forEach(t => {
      if (t !== "—" && !r.includes(t)) r.push(t);
    });
  return r;
};
const kOdolZ = K => {
  const N = kCtx(K).N;
  return N.z && BZBR[N.z.dr] ? N.z.dr : "";
};
/* ---- útoky: vlastnost, magický bonus a bonus ke zranění se z PDF zjistí jednou, pak se vše počítá ---- */
const KUTI = new WeakMap();
function kUtInf(K, a) {
  let M = KUTI.get(K);
  if (!M) {
    M = new Map();
    KUTI.set(K, M);
  }
  if (M.has(a)) return M.get(a);
  const c = kCtx(K, true),
    pb = c.pb,
    vl = (a.vl || []).join(" "),
    sp = ((K.kouzla || {}).seznam || []).some(s => String(s.n).toLowerCase() === String(a.n).toLowerCase());
  const zm0 = (String(a.z || "").match(/[+-]\d+$/) || [])[0],
    zm = zm0 == null ? null : +zm0;
  let o;
  if (sp) {
    const ab = KR.spab(c) || "CHA";
    o = {sp: 1, ab, m: +a.b - kSum(KR.sput(c)), dm: zm == null ? null : zm - c.md(ab)};
  } else {
    const w = kZbranInfo(a.n) || kZbranInfo(vl),
      fin = /finesse|jemn/i.test(vl + " " + (w ? w[4] : "")),
      dal = a.dal && !/thrown|vrh/i.test(vl + " " + (w ? w[4] : "")),
      rule = dal ? "AGI" : fin ? (c.md("AGI") >= c.md("STR") ? "AGI" : "STR") : "STR",
      arch = dal && c.maRys(/^archery$/) ? 2 : 0;
    const C = [rule, "STR", "AGI", "CHA", "WIS", "INT", "CON"]
      .map((x, i) => ({x, i, m: +a.b - pb - arch - c.md(x)}))
      .filter(q => q.m >= 0 && q.m <= 3 && (zm == null || (zm - c.md(q.x) >= q.m && zm - c.md(q.x) <= q.m + 4)))
      .sort((p, q) => p.m - q.m || p.i - q.i);
    const ab = C.length ? C[0].x : rule,
      m = C.length ? C[0].m : +a.b - pb - arch - c.md(ab);
    o = {ab, fin: fin && /STR|AGI/.test(ab), m, arch: !!arch, dm: zm == null ? null : zm - c.md(ab), w, dal};
  }
  M.set(a, o);
  return o;
}
const kUtMd = (c, i) => (i.fin ? Math.max(c.md("STR"), c.md("AGI")) : c.md(i.ab));
function kUtAdj(K, a) {
  if (a.b == null || a.b === "" || a.vlastni) return a;
  const c = kCtx(K),
    i = kUtInf(K, a),
    o = Object.assign({}, a);
  if (i.sp) {
    o.b = kSpUt(K) + i.m;
    if (i.dm != null && a.z) o.z = String(a.z).replace(/[+-]\d+$/, "") + (x => (x ? (x > 0 ? "+" : "") + x : ""))(c.md(i.ab) + i.dm);
    if (/eldritch blast/i.test(a.n)) o.pocet = c.lv >= 17 ? 4 : c.lv >= 11 ? 3 : c.lv >= 5 ? 2 : 1;
    o.rozpis = `útok kouzlem ${bsg(kSpUt(K))}${i.m ? ` · předmět ${bsg(i.m)}` : ""}`;
    return o;
  }
  const md = kUtMd(c, i);
  o.b = md + c.pb + i.m + (i.arch ? 2 : 0);
  if (i.dm != null) o.z = String(a.z).replace(/[+-]\d+$/, "") + (x => (x ? (x > 0 ? "+" : "") + x : ""))(md + i.dm);
  if (a.vl)
    o.vl = a.vl.map(v =>
      String(v).replace(/(\d+d\d+)([+-]\d+)?\)/, (q, k) => {
        const x = md + (i.dm || 0);
        return k + (x ? (x > 0 ? "+" : "") + x : "") + ")";
      }),
    );
  if ((a.pocet || 1) > 1 || kPocet(c, true) > 1) o.pocet = kPocet(c, true);
  o.rozpis = `${i.fin ? "STR/AGI" : i.ab} ${bsg(md)} · zdatnost ${bsg(c.pb)}${i.m ? ` · magie ${bsg(i.m)}` : ""}${i.arch ? " · Archery +2" : ""}`;
  return o;
}
/* zbraně z vybavení, které v PDF nejsou (koupené, nalezené), a úder beze zbraně */
function kUtZInv(K) {
  const c = kCtx(K),
    pdfU = K.utoky || [],
    o = [],
    prof = t => {
      const z = kZdSez(K, "zbrane").join(" ");
      return t === "S" ? true : /martial/i.test(z) || c.tr.some(x => KMARC.test(x.n));
    };
  c.inv.forEach(x => {
    const w = kZbranInfo(x.n);
    if (!w) return;
    const mg = !!x.mag || /\+\s*[1-3]\b/.test(x.n);
    if (
      [...pdfU, ...(kDopl(K).utoky || [])].some(
        a => String(a.n).toLowerCase() === String(x.n).toLowerCase() || (!mg && (kZbranInfo(a.n) || [])[1] === w[1]),
      )
    )
      return;
    if (o.some(q => q.n === x.n)) return;
    const p = kPred(x),
      m = +(String(x.n).match(/\+\s*([1-3])\b/) || [])[1] || +((p && p.ef && p.ef.utok) || 0),
      fin = /Finesse/.test(w[4]),
      dal = !!w[6],
      ab0 = dal ? "AGI" : fin ? (c.md("AGI") >= c.md("STR") ? "AGI" : "STR") : "STR",
      chx = !dal && !/Two-Handed/.test(w[4]) && c.maRys(/^hex warrior$|^pact of the blade$/) && c.md("CHA") > c.md(ab0),
      ab = chx ? "CHA" : ab0,
      md = c.md(ab),
      arch = dal && c.maRys(/^archery$/) ? 2 : 0,
      zr = md + m + (dal ? kEf(c, "zrd") : 0);
    o.push({
      n: x.n,
      b: md + (prof(w[5]) ? c.pb : 0) + m + arch,
      z: w[2] + (zr ? (zr > 0 ? "+" : "") + zr : ""),
      t: w[3],
      dal: dal || undefined,
      vl: w[4] ? w[4].split(/,\s*/) : [],
      pocet: kPocet(c) > 1 ? kPocet(c) : undefined,
      cas: "A",
      zInv: 1,
      rozpis: `z vybavení · ${ab} ${bsg(md)}${chx ? " (Hex Warrior / Pact of the Blade)" : ""}${prof(w[5]) ? ` · zdatnost ${bsg(c.pb)}` : " · bez zdatnosti"}${m ? ` · magie ${bsg(m)}` : ""}`,
    });
  });
  if (![...pdfU, ...(kDopl(K).utoky || [])].some(a => /unarmed|beze zbraně/i.test(a.n))) {
    const mk = kTrU(c, "Monk"),
      ab = mk && c.md("AGI") > c.md("STR") ? "AGI" : "STR",
      md = c.md(ab),
      dd = mk ? (mk >= 17 ? "1d12" : mk >= 11 ? "1d10" : mk >= 5 ? "1d8" : "1d6") : "";
    o.push({
      n: "Úder beze zbraně",
      pocet: kPocet(c) > 1 ? kPocet(c) : undefined,
      b: md + c.pb,
      z: dd ? dd + (md ? (md > 0 ? "+" : "") + md : "") : String(Math.max(1, 1 + md)),
      t: "Bludgeoning",
      vl: mk ? ["Martial Arts"] : [],
      cas: "A",
      zInv: 1,
      rozpis: `${ab} ${bsg(md)} · zdatnost ${bsg(c.pb)}${mk ? " · Martial Arts" : " · zranění 1 + " + ab}`,
    });
  }
  return o;
}
/* zbraň z PDF, kterou postava už nemá (prodaná, ztracená), se mezi útoky neukáže */
const kUtMa = (K, a) => {
  if (a.vlastni || kUtInf(K, a).sp) return true;
  const nm = String(a.n).toLowerCase(),
    v0 = (K.vybaveni || []).some(x => String(x.n).toLowerCase() === nm);
  if (!v0) return true;
  return kCtx(K).inv.some(x => String(x.n).toLowerCase() === nm);
};
const kUtoky = K => [
  ...(K.utoky || []).filter(a => kUtMa(K, a)).map(a => kUtAdj(K, Object.assign({cas: "A"}, a))),
  ...kUtZInv(K),
  ...(kDopl(K).utoky || []).map(a => Object.assign({cas: "A", vlastni: 1}, a)),
];
/* ---- panel Úpravy postavy: povolání a úrovně, skóre, výpočty a úpravy ---- */
const KUPRC = [
  ["ac", "AC"],
  ["zach", "všechny záchrany"],
  ...BAB.map(a => ["zach:" + a, "záchrana " + a]),
  ["ini", "iniciativa"],
  ["hp", "maximum životů"],
  ["rych", "rychlost"],
  ["ov", "všechna ověření"],
  ["spdc", "SO kouzel"],
  ["sput", "útok kouzlem"],
  ["pas:vnimani", "pasivní Vnímání"],
];
const KUPRN = Object.fromEntries([
  ...KUPRC,
  ["dov", "všechny dovednosti"],
  ["pas:vhled", "pasivní Vhled"],
  ["pas:patrani", "pasivní Pátrání"],
  ["zrd", "zranění na dálku"],
]);
function kUprHtml(K) {
  const c = kCtx(K),
    S = c.S,
    ro = !kMuze(K),
    pdfx = S.pdfx || [];
  const tr = `<div class="kuprtr">${c.tr.map((t, i) => `<span class="kuprt"><b>${besc(KTR[t.n] ? KTR[t.n].cz : t.n)}</b> <small>${besc(t.n)}</small><button type="button" class="kdbmini" data-ktr="${i}" data-d="-1" aria-label="Snížit úroveň">−</button><b>${t.u}</b><button type="button" class="kdbmini" data-ktr="${i}" data-d="1" aria-label="Zvýšit úroveň">+</button></span>`).join("")}
    <select data-ktrn aria-label="Přidat povolání"><option value="">+ další povolání…</option>${Object.keys(KTR)
      .filter(n => !c.tr.some(t => t.n === n))
      .map(n => `<option value="${n}">${KTR[n].cz} (${n})</option>`)
      .join(
        "",
      )}</select>${S.tridy ? `<button type="button" class="kdbmini" data-ktrx ${btip("Vrátit povolání a úrovně podle PDF")}>podle PDF</button>` : ""}</div>
    <p class="kdbnote">${c.lv}. úroveň · bonus zdatnosti ${bsg(c.pb)} · kostky životů ${besc(kHDtxt(K))} · maximum životů ${kHPmax(K)} <small>(${besc(kRozpis(kHodn(K, "hp").L))})</small>. Nové rysy povolání a jejich texty přinese nové PDF z D&amp;D Beyond; čísla se přepočítají hned.</p>`;
  const dl = [
    ["ac"],
    ["hp"],
    ["ini"],
    ["rych"],
    ["spdc"],
    ["sput"],
    ...BAB.map(a => ["zach", a]),
    ...Object.keys(K.dov || {}).map(n => ["dov", n]),
    ...Object.keys(KPASD).map(k => ["pas", k]),
  ]
    .map(([t, a]) => {
      const key = t + (a != null ? ":" + a : "");
      let d = 0;
      try {
        d = kDeltaRaw(K, t, a);
      } catch (e) {}
      return d ? [key, d, t, a] : null;
    })
    .filter(Boolean);
  const lab = (t, a) => (t === "dov" ? a : t === "zach" ? "záchrana " + a : KUPRN[t + (a ? ":" + a : "")] || KUPRN[t] || t);
  const ef = c.E.filter(e => !e.vl && e.v && !/^vl:/.test(e.c));
  return `<details class="kdbp kdbupr" data-kupr${KUPROTV.has(K.id) ? " open" : ""}><summary>Úpravy postavy <small>povolání a úrovně · výpočty · předměty · vlastní úpravy</small></summary>
    <h4 class="kdbsh">Povolání a úrovně</h4>${tr}
    <h4 class="kdbsh">Automaticky z předmětů a rysů</h4>${ef.length ? `<ul class="kdbli">${ef.map(e => `<li>${besc(e.n)} <small>${besc(KUPRN[e.c] || e.c)} ${bsg(e.v)}</small></li>`).join("")}</ul>` : `<p class="kdbnote">Žádné předměty s bonusem (Ring of Protection, Cloak of Protection, Amulet of Health… – působí, jen když jsou připoutané).</p>`}
    <h4 class="kdbsh">Z D&amp;D Beyond, co pravidla nevysvětlí</h4>${dl.length ? `<ul class="kdbli">${dl.map(([key, d, t, a]) => `<li class="${pdfx.includes(key) ? "kuprx" : ""}">${besc(lab(t, a))} <b>${bsg(d)}</b> <button type="button" class="kdbmini" data-kpdfx="${besc(key)}">${pdfx.includes(key) ? "vrátit" : "odebrat"}</button></li>`).join("")}</ul><p class="kdbnote">Rozdíl mezi listem z D&amp;D Beyond a výpočtem podle pravidel (hody na životy, předmět nebo rys mimo SRD). Odebráním platí jen pravidla.</p>` : `<p class="kdbnote">List z D&amp;D Beyond odpovídá pravidlům beze zbytku.</p>`}
    <h4 class="kdbsh">Vlastní úpravy</h4>${(S.upr || []).length ? `<ul class="kdbli">${S.upr.map((u, i) => `<li>${besc(u.n || "úprava")} <small>${besc(KUPRN[u.c] || u.c)} ${bsg(+u.v)}</small> <button type="button" class="kdbmini" data-kuprx="${i}" aria-label="Odebrat úpravu">×</button></li>`).join("")}</ul>` : ""}
    <form class="kvlh" data-kuprf><select name="c" aria-label="Co upravit">${KUPRC.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select><input name="v" type="number" min="-20" max="20" value="1" aria-label="O kolik" style="width:4.5em"><input name="n" maxlength="40" placeholder="proč (např. Bless, kletba)"><button class="gbtn ghost"${ro ? " disabled" : ""}>Přidat</button></form></details>`;
}
const KUPROTV = new Set();
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("[data-kupr]")) return;
    const K = kvK(d);
    if (!K) return;
    if (d.open) KUPROTV.add(K.id);
    else KUPROTV.delete(K.id);
  },
  true,
);
/* změna úrovně: o kolik vzroste maximum životů, o tolik i současné (jako v D&D Beyond) */
async function kTridyZmen(K, tr, msg) {
  const S = kartaStav(K.id),
    mx0 = kHPmax(K),
    ch = {tridy: tr};
  KST[K.id] = Object.assign({}, S, {tridy: tr});
  const mx1 = kHPmax(K);
  KST[K.id] = S;
  if (S.hp != null) ch.hp = Math.max(0, Math.min(mx1, +S.hp + (mx1 - mx0)));
  await kartaStavZmen(K.id, ch, `${K.n}: ${msg} – maximum životů ${mx0} → ${mx1}, úroveň ${(tr || kTridyPdf(K)).reduce((a, t) => a + t.u, 0)}.`);
}
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const b = T("[data-ktr],[data-ktrx],[data-kpdfx],[data-kuprx]");
  if (!b) return;
  const K = kvK(b);
  if (!K || !kMuze(K)) return;
  const S = kartaStav(K.id);
  if (b.matches("[data-ktr]")) {
    const tr = kTridy(K).map(t => Object.assign({}, t)),
      i = +b.dataset.ktr,
      d = +b.dataset.d;
    if (!tr[i]) return;
    const lv = tr.reduce((a, t) => a + t.u, 0);
    if (d > 0 && lv >= 20) return;
    tr[i].u += d;
    if (tr[i].u <= 0) {
      if (tr.length === 1) return;
      if (!confirm(`Odebrat povolání ${tr[i].n}?`)) return;
      tr.splice(i, 1);
    }
    await kTridyZmen(K, tr, `${tr[i] ? tr[i].n : "povolání"} ${d > 0 ? "+1 úroveň" : "−1 úroveň"}`);
    return;
  }
  if (b.matches("[data-ktrx]")) {
    await kTridyZmen(K, null, "povolání podle PDF");
    return;
  }
  if (b.matches("[data-kpdfx]")) {
    const k = b.dataset.kpdfx,
      L = new Set(S.pdfx || []);
    L.has(k) ? L.delete(k) : L.add(k);
    await kartaStavZmen(K.id, {pdfx: L.size ? [...L] : null});
    return;
  }
  if (b.matches("[data-kuprx]")) {
    const L = [...(S.upr || [])];
    L.splice(+b.dataset.kuprx, 1);
    await kartaStavZmen(K.id, {upr: L.length ? L : null});
    return;
  }
});
document.addEventListener("change", async e => {
  const t = e.target;
  if (!t.matches || !t.matches("[data-ktrn]") || !t.value) return;
  const K = kvK(t);
  if (!K || !kMuze(K)) return;
  const tr = kTridy(K).map(x => Object.assign({}, x));
  if (tr.reduce((a, x) => a + x.u, 0) >= 20) return;
  tr.push({n: t.value, u: 1});
  await kTridyZmen(K, tr, `nové povolání ${t.value}`);
});
document.addEventListener("submit", async e => {
  const f = e.target;
  if (!f.matches || !f.matches("[data-kuprf]")) return;
  e.preventDefault();
  const K = kvK(f);
  if (!K || !kMuze(K)) return;
  const E = f.elements,
    v = Math.round(+E.v.value || 0);
  if (!v) return;
  const L = [...(kartaStav(K.id).upr || []), {c: E.c.value, v, n: E.n.value.trim().slice(0, 40) || "vlastní úprava"}];
  await kartaStavZmen(K.id, {upr: L}, `${K.n}: ${KUPRN[E.c.value] || E.c.value} ${bsg(v)}.`);
});

/* ---- střelivo ---- */
const kMunNm = a =>
  /crossbow|kuš/i.test(a.n)
    ? /bolt|šipk/i
    : /bow|luk/i.test(a.n)
      ? /arrow|šíp/i
      : /sling|prak/i.test(a.n)
        ? /bullet|kulk|olov/i
        : /musket|pistol|handgun|píšťal|hákovnic/i.test(a.n)
          ? /bullet|kulk|náboj/i
          : null;
function kMunice(K, a) {
  if (!(a.vl || []).some(v => /ammunition|munice/i.test(v)) && !kMunNm(a)) return null;
  const re = kMunNm(a);
  if (!re) return null;
  const inv = kartaStav(K.id).inv || K.vybaveni || [],
    i = inv.findIndex(x => re.test(x.n));
  return i >= 0 ? {i, x: inv[i]} : {i: -1, x: null};
}
const kMunTxt = (K, a) => {
  const m = kMunice(K, a);
  return m ? ` <small class="${m.x && m.x.q > 0 ? "" : "bhrich"}">${m.x ? `${besc(m.x.n)}: ${m.x.q}` : "bez střeliva ve vybavení"}</small>` : "";
};
async function kMunOdecti(K, a, n) {
  const m = kMunice(K, a);
  if (!m || !m.x) return;
  const inv = [...(kartaStav(K.id).inv || K.vybaveni || [])].map(y => Object.assign({}, y));
  inv[m.i].q = Math.max(0, (+inv[m.i].q || 0) - (n || 1));
  await kartaStavZmen(K.id, {inv});
  if (!inv[m.i].q) mmHlasG(`${K.n}: došlo střelivo (${inv[m.i].n}).`, 4500);
}
/* ---- příprava kouzel ze seznamu povolání ---- */
const KPOVCZ = {
  Wizard: "Kouzelník",
  Sorcerer: "Čaroděj",
  Bard: "Bard",
  Druid: "Druid",
  Cleric: "Klerik",
  Warlock: "Černokněžník",
  Ranger: "Hraničář",
  Paladin: "Paladin",
};
let KPRIP = null;
function kPripHtml(K) {
  if (!KSPD) return `<p class="rsmall">Načítám seznam kouzel…</p>`;
  const pov = Object.entries(KPOVCZ)
    .filter(([en]) => new RegExp("\\b" + en + "\\b", "i").test(K.povolani || ""))
    .map(x => x[1]);
  const max = Math.max(0, ...kSloty(K).map(q => q.st)),
    mam = new Set(kSeznam(K).map(x => x.n.toLowerCase())),
    q = _nrm(KPRIP || "");
  const L = Object.values(KSPD)
    .filter(x => x.p.some(p => pov.includes(p)) && x.l <= max && !mam.has(x.en.toLowerCase()) && (!q || _nrm(`${x.en} ${x.cz}`).includes(q)))
    .sort((a, b) => a.l - b.l || a.en.localeCompare(b.en));
  return `<p class="rsmall">Kouzla povolání ${besc(pov.join(", ") || "–")} do ${max}. stupně. Připravená kouzla se po dlouhém odpočinku mění – přidej nebo odeber, PDF není potřeba.</p>
    <input type="search" data-kpripq value="${besc(KPRIP || "")}" placeholder="Hledat kouzlo" aria-label="Hledat kouzlo"><ul class="kprip">${L.slice(
      0,
      60,
    )
      .map(
        x =>
          `<li><button type="button" class="gbtn ghost" data-kpn="${besc(x.en)}">+</button> <b>${besc(x.en)}</b> <small>${besc(x.cz || "")} · ${kzUr(x.l)}</small></li>`,
      )
      .join("")}</ul>`;
}
/* ---- společníci: familiár, Divoká podoba, oř, dračí posádka ---- */
const kSpol = K => kartaStav(K.id).spol || [];
async function kSpolUloz(K, L) {
  await kartaStavZmen(K.id, {spol: L.length ? L : null});
}
/* společník v boji (2026-10-19): hráč ho pošle do běžícího boje jako spojence (mm_boj_hrac 'spol'), útočí za něj z telefonu,
   životy jsou sdílené s vypravěčem (hpc v boji); „Z boje“ zapíše životy zpět na kartu */
const kSpolId = (K, i) => `s${String(K.id).replace(/[^A-Za-z0-9_-]/g, "")}-${i}`.slice(0, 41);
const KSPOLC = {};
function kSpolBoj(K) {
  const s = BOJ.s;
  if (!s || !s.aktivni || !window.MMDB || !bojDB || !bojDB.hrac || !kMuze(K)) return null;
  const me = (s.hraci || []).find(h => bojKartaH(h) === K);
  return me ? {s, me} : null;
}
function kSpolHtml(K) {
  const L = kSpol(K),
    B = kSpolBoj(K);
  const cile = B
    ? (B.s.npc || []).filter(
        o => !bojSpoj(o) && !(o.stav || []).some(t => t === "poražen" || t === "prchá" || t === "vzdal se") && (o.druh !== "houf" || o.pocet > 0),
      )
    : [];
  return `<h3 class="uvh2">Společníci</h3><p class="rsmall">Familiár, Divoká podoba, oř, vyvolaný tvor nebo drak posádky – vlastní životy a útoky.${B ? " Během boje ho pošli do boje: vypravěč ho uvidí jako spojence a útočíš za něj odsud." : ""}</p>
    ${L.map((s, i) => {
      const sid = kSpolId(K, i),
        vb = B ? (B.s.npc || []).find(o => o.id === sid) : null,
        hp = vb ? +vb.hpc || 0 : +s.hp || 0,
        max = vb ? +vb.hpm || 1 : +s.max || 0,
        pr = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, max)) * 100)));
      const bojH = B
        ? vb
          ? `<p class="kspolboj"><span class="kchip on">⚔ v boji${(vb.stav || []).length ? " · " + vb.stav.join(", ") : ""}</span> <label>Cíl <select data-kspolcil="${i}"><option value="">— vyber —</option>${cile.map(o => `<option value="${o.id}"${KSPOLC[sid] === o.id ? " selected" : ""}>${besc(o.n)}</option>`).join("")}</select></label>
          ${(s.ut || []).map((a, j) => `<button type="button" class="gbtn" data-kspolut="${i}:${j}" ${btip(`${a.n}: d20 ${bsg(+a.b || 0)}, zranění ${a.z || "–"} ${BZRT[a.t] || a.t || ""} – útok se pošle vypravěči k potvrzení`)}>⚔ ${besc(a.n)} ${bsg(+a.b || 0)}</button>`).join(" ")}
          <button type="button" class="gbtn ghost" data-kspolz="${i}" ${btip("Odebere ho z boje a zapíše životy zpět na kartu")}>Z boje</button></p>`
          : `<p class="kspolboj"><button type="button" class="gbtn ghost" data-kspolboj="${i}" ${btip("Přidá ho do běžícího boje jako spojence družiny")}>⚔ Do boje</button></p>`
        : "";
      return `<div class="kspol${vb ? " kspolvb" : ""}"><div class="kspolh"><b>${besc(s.n)}</b> <small>${besc(s.druh || "")}</small> <button type="button" class="kx" data-kspolx="${i}" aria-label="Odebrat">×</button></div>
      <div class="kstat"><span class="kbox"><small>AC</small><b>${besc(s.ac ?? "–")}</b></span><span class="kbox khp${hp <= max / 2 ? " bhp2" : ""}"><small>Životy${vb ? " (v boji)" : ""}</small><b>${hp}</b><span>/${max}</span><i class="bkhpb" style="--p:${pr}%"></i></span>
        <span class="kbox kzrb"><input type="number" min="0" max="999" data-kspolv="${i}" inputmode="numeric" placeholder="HP" aria-label="Kolik HP"><button type="button" class="gbtn ghost" data-kspolh="${i}" data-d="-1">−</button><button type="button" class="gbtn ghost" data-kspolh="${i}" data-d="1">+</button></span></div>
      ${bojH}${(s.ut || []).length && !vb ? `<p>${s.ut.map((a, j) => `<button type="button" class="gbtn ghost" data-kspolu="${i}:${j}">${besc(a.n)} ${a.b != null ? bsg(+a.b) : ""} · ${besc(a.z || "")} ${besc(BZRT[a.t] || a.t || "")}</button>`).join(" ")}</p>` : ""}
      ${s.src && PROTBY[s.src] ? `<details class="bjapd"><summary>Statistiky</summary><div class="bsb srdtext">${PROTBY[s.src].h}</div></details>` : ""}${s.pozn ? `<p class="rsmall">${besc(s.pozn)}</p>` : ""}</div>`;
    }).join("")}
    <details class="bjapd"><summary>+ Přidat společníka</summary><form class="kvlh" data-kspolf><input name="n" placeholder="jméno (např. Havran Nevermore)" maxlength="60" required>
      <input name="srd" list="kspoll" placeholder="statistiky ze SRD (Owl, Riding Horse, Wolf…)" aria-label="Statistiky ze SRD"><input name="hp" type="number" min="1" max="999" placeholder="HP"><input name="ac" type="number" min="1" max="40" placeholder="AC">
      <input name="druh" placeholder="familiár / Divoká podoba / oř / drak" maxlength="40"><button class="gbtn ghost">Přidat</button></form><datalist id="kspoll">${(NETV || []).map(x => `<option value="${besc(x.n)}">${besc(x.cz || "")}</option>`).join("")}</datalist>
      <p class="rsmall">Se statistikami ze SRD se doplní životy, AC a útoky samy.</p></details>`;
}
