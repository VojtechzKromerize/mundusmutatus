/* @čisté – Import listu postavy z PDF D&D Beyond (2026-10-23): pole formuláře PDF → karta (kartaZPdf) =====
   ČISTÝ SOUBOR (viz 10u): přesunuté beze změny z 12 a 16; vstup = pole PDF (pdf.js je čte na stránce, 13 kartaImport),
   výstup = objekt karty. Test v čistém Node s polemi skutečného PDF (testy/karta-pdf-pole.json): testy/jednotky/pdf.test.mjs. ===== */

/* z 12-boj-tah-postavy */
/* celá karta ke čtení (vlastnosti, dovednosti, smysly, rysy, kouzla) */
/* list postavy z PDF D&D Beyond → karta postavy. F = pole formuláře z pdf.js (getAnnotations): {f:název, v:hodnota, p:strana, r:[x1,y1,x2,y2]} */
function kartaZPdf(F) {
  const N = s =>
    String(s || "")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  const P = F.filter(q => q && q.f && q.v != null && String(q.v).trim() !== "" && String(q.v).trim() !== "--").map(q => ({
    f: N(q.f),
    v: String(q.v).replace(/\r/g, "").trim(),
    p: q.p || 1,
    r: q.r || [0, 0, 0, 0],
  }));
  const g = (...n) => {
    for (const k of n) {
      const x = P.find(q => q.f === k);
      if (x) return x.v;
    }
    return "";
  };
  const num = t => {
    const m = String(t || "")
      .replace(/[−–]/g, "-")
      .replace(/,/g, "")
      .match(/[+-]?\d+/);
    return m ? +m[0] : null;
  };
  const ft = t =>
    N(t)
      .replace(/(\d+)\s*ft\.?/g, "$1 stop")
      .replace(/\(Walking\)/g, "")
      .replace(/\(Climbing\)/g, "šplhání")
      .replace(/\(Swimming\)/g, "plavání")
      .replace(/\(Flying\)/g, "let")
      .replace(/\s+,/g, ",")
      .replace(/(\d+ stop)\s*šplhání/g, "šplhání $1")
      .replace(/(\d+ stop)\s*plavání/g, "plavání $1")
      .replace(/(\d+ stop)\s*let/g, "let $1")
      .trim();
  const slug = t =>
    N(t)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "postava";
  const n = g("CharacterName", "CharacterName2");
  if (!n) throw new Error("V PDF chybí jméno postavy – je to list postavy z D&D Beyond?");
  const povolani = g("CLASS LEVEL", "CLASS LEVEL2");
  const K = {
    id: slug(n),
    n,
    hrac: g("PLAYER NAME"),
    druh: g("RACE"),
    povolani,
    uroven: (povolani.match(/\d+/g) || []).reduce((a, b) => a + +b, 0) || null,
    pozadi: g("BACKGROUND"),
    xp: num(g("EXPERIENCE POINTS")),
    zdroj: "PDF z D&D Beyond",
    importovano: new Date().toISOString().slice(0, 10),
  };
  const AB = [
    ["STR", "STR", "Strength"],
    ["DEX", "DEX", "Dexterity"],
    ["CON", "CON", "Constitution"],
    ["INT", "INT", "Intelligence"],
    ["WIS", "WIS", "Wisdom"],
    ["CHA", "CHA", "Charisma"],
  ];
  K.vl = {};
  K.zach = {};
  K.zachProf = [];
  AB.forEach(([k, f, l]) => {
    const v = num(g(f));
    if (v != null) K.vl[k] = v;
    const z = num(g("ST " + l));
    if (z != null) K.zach[k] = z;
    if (g(l.slice(0, 3) + "Prof", l.slice(0, 3).toUpperCase() + "Prof", l.slice(0, 2) + "Prof")) K.zachProf.push(k);
  });
  const sm = g("SaveModifiers");
  K.zachPozn = sm ? sm.split(/\n+/).map(N).filter(Boolean).map(kZachPoznCz) : [];
  const def = g("Defenses"),
    TY = ["Bludgeoning", "Piercing", "Slashing", "Fire", "Cold", "Lightning", "Thunder", "Acid", "Poison", "Necrotic", "Radiant", "Psychic", "Force"],
    typy = t => TY.filter(x => new RegExp("\\b" + x + "\\b", "i").test(t || ""));
  K.odol = typy((def.match(/Resistances?\s*[-–:]\s*([^\n]*)/i) || [])[1]);
  K.imu = typy((def.match(/Immunit(?:y|ies)\s*[-–:]\s*([^\n]*)/i) || [])[1]);
  K.zra = typy((def.match(/Vulnerabilit(?:y|ies)\s*[-–:]\s*([^\n]*)/i) || [])[1]);
  if (def) K.obrana = N(def);
  K.ac = num(g("AC"));
  K.hp = num(g("MaxHP"));
  K.kz = N(g("Total"));
  K.ini = num(g("Init")) || 0;
  K.zdatnost = num(g("ProfBonus"));
  K.rychlost = ft(g("Speed"));
  const sen = g("AdditionalSenses");
  K.smysly = ft(sen);
  K.vidiTma = /darkvision|devil|truesight|blindsight/i.test(sen);
  K.pasiv = {vnimani: num(g("Passive1")), vhled: num(g("Passive2")), patrani: num(g("Passive3"))};
  const DOV = [
    ["Acrobatics", "Acrobatics"],
    ["Animal Handling", "Animal"],
    ["Arcana", "Arcana"],
    ["Athletics", "Athletics"],
    ["Deception", "Deception"],
    ["History", "History"],
    ["Insight", "Insight"],
    ["Intimidation", "Intimidation"],
    ["Investigation", "Investigation"],
    ["Medicine", "Medicine"],
    ["Nature", "Nature"],
    ["Perception", "Perception"],
    ["Performance", "Performance"],
    ["Persuasion", "Persuasion"],
    ["Religion", "Religion"],
    ["Sleight of Hand", "SleightofHand"],
    ["Stealth", "Stealth"],
    ["Survival", "Survival"],
  ];
  K.dov = {};
  K.dovProf = {};
  DOV.forEach(([l, f]) => {
    const v = num(g(f));
    if (v != null) K.dov[l] = v;
    const pr = g(f + "Prof");
    if (pr) K.dovProf[l] = pr;
  });
  /* kouzla: úroveň podle nadpisu nad kouzlem ve stejném sloupci; sloty z „2 Pact OO“ / „4 Slots OOOO“ */
  const hd = P.filter(q => /^spellHeader\d+$/.test(q.f)).map(q => ({
    i: +q.f.match(/\d+$/)[0],
    p: q.p,
    x: q.r[0],
    y: q.r[1],
    l: /cantrip/i.test(q.v) ? 0 : num(q.v),
  }));
  const lvl = q => {
    const h = hd
      .filter(x => x.p < q.p || (x.p === q.p && Math.abs(x.x - q.r[0]) < 60 && x.y > q.r[1]))
      .sort((a, b) => a.p - b.p || b.y - a.y)
      .pop();
    return h ? h.l : 0;
  };
  const kz = {
    vl: g("spellCastingAbility0"),
    dc: num(g("spellSaveDC0")),
    utok: num(g("spellAtkBonus0")),
    trida: g("spellCastingClass0"),
    sloty: [],
    seznam: [],
  };
  P.filter(q => /^spellSlotHeader\d+$/.test(q.f)).forEach(q => {
    const i = +q.f.match(/\d+$/)[0],
      h = hd.find(x => x.i === i),
      m = q.v.match(/(\d+)\s*(Pact|Slots?)/i);
    if (h && h.l && m) kz.sloty.push({st: h.l, max: +m[1], pakt: /pact/i.test(m[2])});
  });
  P.filter(q => /^spellName\d+$/.test(q.f)).forEach(q => {
    const i = q.f.match(/\d+$/)[0],
      x = k => g(k + i);
    const sh = x("spellSaveHit"),
      dur = x("spellDuration");
    const o = {
      n: q.v,
      st: lvl(q),
      zdroj: x("spellSource"),
      cas: x("spellCastingTime"),
      dosah: ft(x("spellRange")),
      slozky: x("spellComponents"),
      trvani: dur,
      kon: /concentration/i.test(dur),
    };
    if (/^[+-]\d+$/.test(sh)) o.utok = num(sh);
    else if (/[A-Z]{3}\s*\d+/.test(sh)) o.zach = sh;
    if (x("spellPrepared") === "P") o.vzdy = true;
    const nt = x("spellNotes");
    if (nt) o.pozn = nt;
    kz.seznam.push(o);
  });
  if (kz.seznam.length || kz.dc) K.kouzla = kz;
  /* útoky: „Wpn Name“, „Wpn Name 2“… */
  const spellBy = Object.fromEntries(kz.seznam.map(s => [s.n.toLowerCase(), s]));
  K.utoky = [];
  P.filter(q => /^Wpn Name ?\d*$/.test(q.f)).forEach(q => {
    const i = (q.f.match(/(\d+)$/) || [0, "1"])[1],
      b = num(g(`Wpn${i} AtkBonus`)),
      dm = g(`Wpn${i} Damage`),
      nt = g(`Wpn Notes ${i}`);
    const z = (dm.replace(/\s/g, "").match(/^\d*d\d+(?:[+-]\d+)?/i) || [""])[0].toLowerCase(),
      t = typy(dm)[0] || "",
      sp = spellBy[q.v.toLowerCase()],
      cnt = (nt.match(/Count:\s*(\d+)/i) || [])[1];
    const vl = nt
      .split(/,\s*/)
      .map(N)
      .filter(x => x && !/^count:/i.test(x) && !/^[VSM](\/[VSM])*$/.test(x));
    const a = {n: q.v, b, z, t};
    if (cnt && +cnt > 1) a.pocet = +cnt;
    if (/range|thrown|ammunition|loading/i.test(nt) || (sp && /\d{2,}\s*stop/.test(sp.dosah || "") && !/self|touch|sebe/i.test(sp.dosah || "")))
      a.dal = true;
    if (vl.length) a.vl = vl;
    if (dm && !z) a.pozn = dm;
    if (b != null || z) K.utoky.push(a);
  });
  /* zdroje a rysy z textů schopností: „Název • 4 / Long Rest“, „| 2 / Long Rest • 1 Bonus Action“ pod názvem */
  const txt = P.filter(q => /^(FeaturesTraits|Actions)\d+$/.test(q.f) || /^Additional ?Features/i.test(q.f))
    .sort((a, b) => a.p - b.p || b.r[1] - a.r[1])
    .map(q => q.v)
    .join("\n");
  const rysy = [],
    zdr = [];
  let tit = "";
  txt
    .split(/\n/)
    .map(N)
    .forEach(l => {
      const mt = l.match(/^[*|]\s*([^•|]+?)\s*(?:•.*)?$/);
      const mr = l.match(/(\d+)\s*\/\s*(Long|Short) Rest/i);
      if (mt && !/^\d+\s*\//.test(mt[1])) {
        tit = mt[1].replace(/\s*(PHB|XGtE|TCoE|SCAG|EE|br)-?\d*.*$/, "").trim();
        if (l[0] === "*" && tit && !rysy.includes(tit)) rysy.push(tit);
      }
      if (mr) {
        const nm = (l.match(/^([^•|*]+?)\s*•\s*\d+\s*\//) || [])[1] || tit;
        if (nm && !zdr.some(z => z.n === N(nm)))
          zdr.push({n: N(nm).replace(/^[*|]\s*/, ""), max: +mr[1], obn: /short/i.test(mr[2]) ? "krátký odpočinek" : "dlouhý odpočinek"});
      }
    });
  K.zdroje = zdr;
  K.rysy = rysy;
  /* více útoků za akci (Extra Attack, Thirsting Blade) u zbraní, ne u kouzel; Hexblade's Curse a Hex jako přepínače */
  if (/Extra Attack|Thirsting Blade/i.test(txt))
    K.utoky.forEach(a => {
      if (!spellBy[a.n.toLowerCase()] && !(a.pocet > 1)) a.pocet = 2;
    });
  K.efekty = [];
  if (/Hexblade.s Curse/i.test(txt))
    K.efekty.push(
      {n: "Hexblade's Curse: Damaging Hex", zr: K.zdatnost || 2, pozn: "+zdatnost ke zranění proti prokletému cíli"},
      {n: "Hexblade's Curse: Striking Hex", krit: 19, pozn: "kritický zásah na 19–20 proti prokletému cíli"},
    );
  if (spellBy.hex) K.efekty.push({n: "Hex", zr: "1d6", t: "Necrotic", pozn: "+1d6 Necrotic proti očarovanému cíli"});
  /* vybavení a peníze */
  const att = new Set(P.filter(q => /^Attuned Name\d+$/.test(q.f)).map(q => q.v));
  /* D&D Beyond tiskne vlastní předměty ještě jednou na další stránce (stejná pole Eq Name) – ty se nepočítají dvakrát */
  {
    const vid = new Map();
    K.vybaveni = [];
    P.filter(q => /^Eq Name\d+$/.test(q.f)).forEach(q => {
      const i = q.f.match(/\d+$/)[0],
        w = g("Eq Weight" + i),
        qq = num(g("Eq Qty" + i)) || 1,
        key = N(q.v).toLowerCase() + "|" + qq + "|" + w;
      if (vid.has(key) && vid.get(key) !== q.p) return;
      vid.set(key, q.p);
      K.vybaveni.push(Object.assign({n: N(q.v), q: qq}, w && w !== "--" ? {w} : {}, att.has(q.v) ? {pripoutano: true} : {}));
    });
  }
  K.penize = {};
  ["CP", "SP", "EP", "GP", "PP"].forEach(k => {
    const v = num(g(k));
    if (v) K.penize[k] = v;
  });
  /* popis postavy (vlastní text hráče) */
  const pp = {
    pohlavi: "GENDER",
    vek: "AGE",
    velikost: "SIZE",
    vyska: "HEIGHT",
    vaha: "WEIGHT",
    presvedceni: "ALIGNMENT",
    vira: "FAITH",
    pokozka: "SKIN",
    oci: "EYES",
    vlasy: "HAIR",
    povaha: "PersonalityTraits",
    idealy: "Ideals",
    pouta: "Bonds",
    vady: "Flaws",
    spojenci: "AlliesOrganizations",
    pribeh: "Backstory",
    poznamky: "AdditionalNotes1",
  };
  K.popis = {};
  Object.entries(pp).forEach(([k, f]) => {
    const v = g(f);
    if (v) K.popis[k] = v;
  });
  K.konVyhoda = /advantage on con\w* saving throws that you make to maintain/i.test(sm) || rysy.some(r => /war caster/i.test(r));
  {
    const RY = kRysyZPdf(F);
    if (RY.rysy.length) K.rysy2 = RY.rysy;
    K.akce = RY.akce;
    if (Object.keys(RY.zd).length) K.zd = RY.zd;
    if (Object.keys(RY.texty).length) K.texty = RY.texty;
    RY.rysy.filter(r => r.max && !K.zdroje.some(z => z.n === r.n)).forEach(r => K.zdroje.push({n: r.n, max: r.max, obn: r.obn}));
  }
  if (!(K.ac > 0) || !(K.hp > 0)) throw new Error("V PDF chybí AC nebo maximum životů.");
  return K;
}

/* z 16-srd-ukazky-sezeni-hrac */
/* rysy a akce z PDF D&D Beyond: názvy, čas aktivace (akce / bonusová akce / reakce), počty použití a texty.
   Texty jsou texty příruček – ukládají se zvlášť a vidí je jen vlastník postavy a vypravěč. */
function kRysyZPdf(F) {
  const pole = re =>
    F.filter(q => q && q.f && re.test(String(q.f).trim()))
      .map(q => ({n: +(String(q.f).match(/(\d+)\s*$/) || [0, 0])[1], v: String(q.v || "").replace(/\r/g, "")}))
      .sort((a, b) => a.n - b.n);
  const spoj = L => L.map(x => x.v).join("\n");
  const cas = t => (/\bBonus Action\b/i.test(t) ? "BA" : /\bReaction\b/i.test(t) ? "R" : /\b\d*\s*Action\b/i.test(t) ? "A" : "");
  const cist = t =>
    String(t || "")
      .replace(/[’‘]/g, "'")
      .replace(/\s*•\s*\d+\s*\/\s*(Long|Short)\s*Rest.*$/i, "")
      .replace(/\s*•\s*(PHB|XGtE|TCoE|SCAG|EE|br|MotM|FToD|BGG|TBoMT|DMG|BMT|EGtW|VGtM|MToF|ERLW|GGtR|SRD|Basic)[^•]*$/i, "")
      .replace(/\s*•\s*$/, "")
      .trim();
  const rysy = [],
    texty = {},
    akce = {A: [], BA: [], R: []};
  let sek = "",
    cur = null;
  const pridej = (n, o) => {
    n = cist(n);
    if (!n) return null;
    let r = rysy.find(x => x.n === n);
    if (!r) {
      r = Object.assign({n, s: sek}, o || {});
      rysy.push(r);
    }
    return r;
  };
  spoj(pole(/^FeaturesTraits\d+$/i))
    .split("\n")
    .forEach(raw => {
      const l = raw.replace(/\s+$/, ""),
        t = l.trim();
      if (!t) return;
      const ms = t.match(/^===\s*(.+?)\s*===$/);
      if (ms) {
        sek = ms[1];
        cur = null;
        return;
      }
      const mf = t.match(/^\*\s*(.+)$/);
      if (mf) {
        cur = pridej(mf[1]);
        return;
      }
      const mu = t.match(/^\|\s*(.+)$/);
      if (mu) {
        const x = mu[1];
        const use = x.match(/^(\d+)\s*\/\s*(Long|Short)\s*Rest(?:\s*•\s*(.*))?$/i),
          jen = x.match(/^(\d+\s+)?(Action|Bonus Action|Reaction)$/i),
          pojm = x.match(/^(.+?):\s*(\d+\s+)?(Action|Bonus Action|Reaction)$/i);
        if (use && cur) {
          cur.max = +use[1];
          cur.obn = /short/i.test(use[2]) ? "krátký odpočinek" : "dlouhý odpočinek";
          if (use[3]) cur.cas = cas(use[3]);
          return;
        }
        if (jen && cur) {
          cur.cas = cas(x);
          return;
        }
        if (pojm) {
          const r = pridej(pojm[1], {sub: 1});
          if (r) r.cas = cas(pojm[3]);
          return;
        }
        cur = pridej(x, {sub: 1});
        return;
      }
      if (cur) {
        texty[cur.n] = (texty[cur.n] ? texty[cur.n] + "\n" : "") + t;
      }
    });
  /* pole Actions: === ACTIONS === / === BONUS ACTIONS === / === REACTIONS === a položky s textem odsazeným pod nimi */
  let ak = "",
    ca = null;
  const L = spoj(pole(/^Actions\d+$/i)).split("\n");
  L.forEach((raw, i) => {
    const t = raw.trim();
    if (!t) return;
    const ms = t.match(/^===\s*(.+?)\s*===$/);
    if (ms) {
      ak = /BONUS/i.test(ms[1]) ? "BA" : /REACTION/i.test(ms[1]) ? "R" : /^ACTIONS?$/i.test(ms[1]) ? "A" : "";
      ca = null;
      return;
    }
    const dal = L[i + 1] || "",
      polozka = !/^\s/.test(raw) && (/•/.test(t) || (/^\s{5,}\S/.test(dal) && t.length < 70 && !/[.:]$/.test(t)));
    if (polozka) {
      const n = cist(t);
      if (/^Standard Actions$/i.test(n)) {
        ca = null;
        return;
      }
      ca = n;
      if (ak && !akce[ak].includes(n)) akce[ak].push(n);
      const r = rysy.find(x => x.n === n);
      if (r && ak && !r.cas) r.cas = ak;
      const mu = t.match(/(\d+)\s*\/\s*(Long|Short)\s*Rest/i);
      if (mu) {
        const q = r || pridej(n);
        if (q && !q.max) {
          q.max = +mu[1];
          q.obn = /short/i.test(mu[2]) ? "krátký odpočinek" : "dlouhý odpočinek";
        }
      }
      return;
    }
    if (ca && !texty[ca]) texty[ca] = t;
    else if (ca && texty[ca].length < 6000 && !rysy.some(x => x.n === ca && texty[ca].includes(t))) texty[ca] += "\n" + t;
  });
  /* zdatnosti a jazyky */
  const pl = String((F.find(q => q && /^ProficienciesLang$/i.test(String(q.f).trim())) || {}).v || ""),
    zd = {};
  let s2 = "";
  pl.replace(/\r/g, "")
    .split("\n")
    .forEach(l => {
      const t = l.trim();
      if (!t) return;
      const m = t.match(/^===\s*(.+?)\s*===$/);
      if (m) {
        s2 = /ARMOR/i.test(m[1])
          ? "zbroj"
          : /WEAPON/i.test(m[1])
            ? "zbrane"
            : /TOOL/i.test(m[1])
              ? "nastroje"
              : /LANG/i.test(m[1])
                ? "jazyky"
                : "jine";
        return;
      }
      if (s2)
        zd[s2] = [
          ...(zd[s2] || []),
          ...t
            .split(/,\s*/)
            .map(x => x.trim())
            .filter(Boolean),
        ];
    });
  return {rysy: rysy.filter(x => !KRYSSUM.test(x.n)), texty, akce, zd};
}

/* z 16-srd-ukazky-sezeni-hrac */
/* nadpisy a souhrny z D&D Beyond, které nejsou samostatné rysy (velikost, rychlost, jazyky, volba vlastnosti…) */
const KRYSSUM =
  /^(core \w+ traits|size|speed|languages|creature type|ability score (increases?|improvements?)|increase .*scores?.*|special|expanded spell list|\w+ subclass|[\w' ]+ spells|strength|dexterity|constitution|intelligence|wisdom|charisma)$/i;

/* z 16-srd-ukazky-sezeni-hrac */
/* poznámky k záchranám z D&D Beyond česky */
function kZachPoznCz(t) {
  let m;
  if ((m = t.match(/^\+(\d+) Bonus on saves$/i))) return `+${m[1]} ke všem záchranám (předmět nebo rys, už započteno)`;
  if (/^Advantage on CON saving throws (that )?you make to maintain/i.test(t)) return "výhoda na CON záchrany pro udržení soustředění (War Caster)";
  if ((m = t.match(/^Advantage on saving throws against (.+?)\.?$/i))) return `výhoda na záchrany proti: ${m[1]}`;
  if ((m = t.match(/^Advantage on (STR|DEX|CON|INT|WIS|CHA) saving throws( against (.+?))?\.?$/i)))
    return `výhoda na ${m[1].toUpperCase()} záchrany${m[3] ? " proti: " + m[3] : ""}`;
  return t;
}
