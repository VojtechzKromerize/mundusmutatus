/* @čisté – Pravidla boje a Artikulí bez stránky (2026-10-23): hody, záchrany, smrt, soustředění, zbroj, houfy, sloty iniciativy =====
   ČISTÝ SOUBOR (viz 10u): přesunuté beze změny z 11, 12, 13, 15, 18 a 20b (druhy zbroje jsou v jádru, 02c) (npm run kontrola: --ciste-kandidati ukáže další
   definice, které jdou přesunout; --ciste-uzaver A,B co by musely vzít s sebou). Nesahá na stránku ani na stav boje – stav
   a karta přicházejí argumentem; testy v čistém Node (testy/jednotky/pravidla-ciste.test.mjs). ===== */

/* z 11-boj */
/* stavy podle SRD 5.2.1 (Rules Glossary): ut = vliv na útoky tvora (−1 nevýhoda, 1 výhoda), cil = útoky na něj
   (1 výhoda, −1 nevýhoda, "blizko" zblízka výhoda a z dálky nevýhoda), zach = záchrany (f automaticky neúspěch, d nevýhoda,
   a výhoda), nej = nemůže jednat (Incapacitated), k5 = zásah zblízka do 5 stop je kritický, res = Resistance vůči všemu */
const SRDST = {
  oslepen: {en: "Blinded", ut: -1, cil: 1, t: "nevidí, ověření vyžadující zrak automaticky selžou; útoky na něj s výhodou, jeho útoky s nevýhodou"},
  okouzlen: {
    en: "Charmed",
    t: "nesmí zaútočit na toho, kdo ho okouzlil, ani ho zasáhnout škodlivou schopností; okouzlující má výhodu na společenská ověření vůči němu",
  },
  ohlušen: {en: "Deafened", t: "neslyší, ověření vyžadující sluch automaticky selžou"},
  vyděšen: {en: "Frightened", ut: -1, t: "nevýhoda na ověření a útoky, dokud vidí zdroj strachu; nesmí se k němu dobrovolně přiblížit"},
  chycen: {en: "Grappled", ut: -1, t: "rychlost 0; nevýhoda na útoky proti komukoli jinému než tomu, kdo ho drží; ten ho smí táhnout s sebou"},
  neschopný: {
    en: "Incapacitated",
    nej: 1,
    t: "nesmí provést akci, bonusovou akci ani reakci, nemluví, soustředění končí; při hodu iniciativy nevýhoda",
  },
  neviditelný: {
    en: "Invisible",
    ut: 1,
    cil: -1,
    t: "útoky na něj s nevýhodou, jeho útoky s výhodou (ne proti tomu, kdo ho vidí); výhoda na iniciativu",
  },
  paralyzovaný: {
    en: "Paralyzed",
    cil: 1,
    nej: 1,
    zach: {STR: "f", DEX: "f"},
    k5: 1,
    t: "Incapacitated, rychlost 0, záchrany STR a DEX automaticky selžou; útoky na něj s výhodou a zásah zblízka do 5 stop je kritický",
  },
  zkamenělý: {
    en: "Petrified",
    cil: 1,
    nej: 1,
    zach: {STR: "f", DEX: "f"},
    res: 1,
    t: "proměněn v kámen: Incapacitated, rychlost 0, záchrany STR a DEX automaticky selžou, útoky na něj s výhodou, Resistance vůči všemu zranění, Immunity vůči otravě",
  },
  otráven: {en: "Poisoned", ut: -1, t: "nevýhoda na útoky a ověření"},
  sražen: {
    en: "Prone",
    ut: -1,
    cil: "blizko",
    t: "jen se plazí, vstát stojí polovinu rychlosti; jeho útoky s nevýhodou; útok na něj do 5 stop s výhodou, jinak s nevýhodou",
  },
  spoután: {
    en: "Restrained",
    ut: -1,
    cil: 1,
    zach: {DEX: "d"},
    t: "rychlost 0; útoky na něj s výhodou, jeho útoky s nevýhodou; nevýhoda na záchrany DEX",
  },
  omráčen: {
    en: "Stunned",
    cil: 1,
    nej: 1,
    zach: {STR: "f", DEX: "f"},
    t: "Incapacitated, záchrany STR a DEX automaticky selžou, útoky na něj s výhodou",
  },
  "v bezvědomí": {
    en: "Unconscious",
    cil: 1,
    nej: 1,
    zach: {STR: "f", DEX: "f"},
    k5: 1,
    t: "Incapacitated a sražen, upustí, co drží; rychlost 0; záchrany STR a DEX automaticky selžou; útoky na něj s výhodou a zásah zblízka do 5 stop je kritický",
  },
  úhyb: {
    en: "Dodge",
    cil: -1,
    zach: {DEX: "a"},
    t: "akce Úhyb do začátku jeho příštího tahu: útoky na něj s nevýhodou (vidí-li útočníka), výhoda na záchrany DEX",
  },
};

/* z 11-boj */
const srdNejedna = st => (st || []).some(k => SRDST[k] && SRDST[k].nej);

/* z 11-boj */
const BLIM = {houf: 1, pacholek: 1, sok: 2, zhoubce: 3},
  BDRUH = {houf: "Houf pacholků", pacholek: "Pacholek", sok: "Sok", zhoubce: "Zhoubce"};

/* z 11-boj */
const bojNorm = t =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/* z 11-boj */
/* výsledek kostky Závoje slovy; Závoj se hází k ověřením (i iniciativě) a útokům, ne k záchranám (Artikule › Kostka Závoje) */
const zavVys = r => (r === "pok" ? "Pokušení" : r === "poz" ? "Požehnání" : "bez vlivu Závoje");

/* z 11-boj */
/* typ zranění → druh kritického zranění */
const bojKritDruh = t => {
  t = bojNorm(t);
  return /fire|lightning|ohen|blesk/.test(t)
    ? "ohen"
    : /cold|mraz/.test(t)
      ? "mraz"
      : /acid|poison|kyselin|jed/.test(t)
        ? "jed"
        : /necrotic|radiant|prokl|svat/.test(t)
          ? "svata"
          : /psychic|psych/.test(t)
            ? "psych"
            : "fyz";
};

/* z 11-boj */
/* stavy, které berou akce (2026-10-19): Incapacitated a vše, co ho obsahuje – žádná akce, bonusová akce ani reakce */
const BNESCH = ["neschopný", "paralyzovaný", "zkamenělý", "omráčen", "v bezvědomí"];

/* z 11-boj */
const bojNeschopny = st => (st || []).find(t => BNESCH.includes(t)) || "";

/* z 11-boj */
/* přesila houfu: +1 za každého dalšího pacholka, nejvýš +5 */
const bojPres = (s, n) => Math.min(Math.max((n.pocet || 0) - 1, 0), 5);

/* z 11-boj */
/* počty slotů (Vojta 2026-10-22): početnější strana má o slot víc než menší. Družina = postavy + spojenci a společníci,
   nepřátelé = každý houf, sok či zhoubce za jednoho (bez poražených, prchajících a vzdaných). Určí se na začátku boje
   a každého kola (s.pocty), aby se sloty uprostřed kola neposouvaly, když někdo padne. */
const BMIMO = ["poražen", "prchá", "vzdal se", "rozplynul se"];

/* z 11-boj */
function bojPocty(s) {
  const npc = (s.npc || []).filter(n => !BMIMO.some(t => (n.stav || []).includes(t)) && !(n.druh === "houf" && !(+n.pocet > 0))),
    h = Math.max(1, (s.hraci || []).length + npc.filter(bojSpoj).length),
    e = npc.filter(n => !bojSpoj(n)).length;
  return {h, n: Math.max(1, e > h ? h + 1 : e < h ? h - 1 : h)};
}

/* z 11-boj */
function bojSloty(s) {
  /* sloty se střídají mezi družinou a vypravěčem; začíná strana s nejlepším hodem (při shodě družina); slot navíc je na konci */
  if (s.scena) return []; /* scéna mimo boj: žádná iniciativa */
  const P = s.pocty || bojPocty(s),
    dm = +s.dm || 0,
    hod = s.hod != null ? +s.hod : Math.max(-99, ...(s.hraci || []).map(x => +x.hod || 0)),
    a = [],
    prvni = hod >= dm ? "h" : "n";
  let zh = P.h,
    zn = P.n,
    t = prvni;
  while (zh > 0 || zn > 0) {
    if (t === "h" ? zh > 0 : zn <= 0) {
      a.push({t: "h", hod});
      zh--;
    } else {
      a.push({t: "n", hod: dm});
      zn--;
    }
    t = t === "h" ? "n" : "h";
  }
  return a;
}

/* z 11-boj */
/* pacholek má 5 HP (Vojta 2026-10-22); zranění přetéká na dalšího – houf si pamatuje zranění předního pacholka (n.hz) */
const BPACH_HP = 5;

/* z 11-boj */
function bojHoufZasah(n, x) {
  const poc = +n.pocet || 0,
    hz0 = +n.hz || 0,
    c = hz0 + Math.max(0, +x || 0),
    pad = Math.min(poc, Math.floor(c / BPACH_HP));
  return {pad, hz: pad >= poc ? 0 : c - pad * BPACH_HP, hz0};
}

/* z 11-boj */
/* zranění, jako by zásah nebyl kritický: z každé zdvojené skupiny kostek v rozpisu („2d8(3+5)+3“) se počítá jen první polovina */
function bojDmgBezKritu(u) {
  let x = +u.dmg || 0;
  String(u.zx || "").replace(/\d*d\d+\(([^)]*)\)/g, (m, g) => {
    const v = g
      .split("+")
      .map(Number)
      .filter(q => !isNaN(q));
    x -= v.slice(Math.ceil(v.length / 2)).reduce((a, b) => a + b, 0);
    return m;
  });
  return Math.max(0, x);
}

/* z 11-boj */
const bojUzito = (s, id) => Object.values(s.obsazeni || {}).filter(x => x === id).length;

/* z 11-boj */
const bojSpoj = o => o.str === "h";

/* z 12-boj-tah-postavy */
const bojTxt = p =>
  String((p && (p.b || p.h)) || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/−/g, "-")
    .replace(/\s+/g, " ");

/* z 12-boj-tah-postavy */
const bojIniB = p => {
  const m = bojTxt(p).match(/Iniciativa\s*([+-]\d+)/);
  if (m) return +m[1];
  const a = bojAbil(p, "DEX");
  return a != null ? a : 0;
};

/* z 12-boj-tah-postavy */
/* záchrana: řádek Záchrany (i „ostatní +0“), jinak modifikátor vlastnosti */
const bojSaveB = (p, ab) => {
  const t = bojTxt(p),
    z = t.match(/Záchrany[^:]*?:?\s*([^·]*)/);
  if (z) {
    const m = z[1].match(new RegExp("\\b" + ab + "\\s*([+-]\\d+)"));
    if (m) return +m[1];
    const o = z[1].match(/ostatní\s*([+-]\d+)/);
    if (o) return +o[1];
  }
  const a = bojAbil(p, ab);
  return a != null ? a : 0;
};

/* z 12-boj-tah-postavy */
/* schopnosti s dobíjením („dobíjí se na 5–6“) */
const bojRecharge = p => {
  const t = bojTxt(p),
    o = [];
  for (const m of t.matchAll(/([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][^.()·;|]{2,40}?)\s*\(dobíjí se na (\d)/g))
    if (!o.some(x => x.n === m[1].trim())) o.push({n: m[1].trim(), min: +m[2]});
  for (const a of (p && p.at) || []) {
    const m = String(a.p || "").match(/dobíjí se na (\d)/);
    if (m && !o.some(x => x.n === a.n)) o.push({n: a.n, min: +m[1]});
  }
  return o;
};

/* z 12-boj-tah-postavy */
const bojRegen = p => {
  const t = bojTxt(p);
  const m = t.match(/Regenerace\.?\s*[^.]*?(\d+)\s*HP/i) || t.match(/regenerace\s*(\d+)\s*HP/i);
  return m ? +m[1] : 0;
};

/* z 12-boj-tah-postavy */
/* modifikátor vlastnosti z tabulky statblocku (STR … CHA) */
const bojAbil = (p, ab) => {
  const h = String((p && (p.b || p.h)) || "").replace(/−/g, "-");
  for (const tb of h.match(/<table[\s\S]*?<\/table>/g) || []) {
    const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim()),
      td = [...tb.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
    const i = th.indexOf(ab);
    if (i >= 0 && td[i]) {
      const m = td[i].match(/\(([+-]\d+)\)/);
      if (m) return +m[1];
    }
  }
  return null;
};

/* z 12-boj-tah-postavy */
/* odolnosti: Resistance (zvlášť ta ze zbroje), Immunity a Vulnerability ze zbroje a statblocku */
function bojOdolnosti(E) {
  const r = {res: new Set(), resZ: new Set(), imu: new Set(), zra: new Set()};
  if (!E) return r;
  bikZbDruhy((String(E.ac || "").match(/\(([^)]*)\)/) || [])[1]).forEach(k => {
    const z = BZBR[k];
    if (z && z[0] !== "—") z[0].split(/,\s*/).forEach(t => r.resZ.add(t));
  });
  const t = String(E.p.b || E.p.h || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ");
  const typy = x => {
    const o = [];
    x.replace(/\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g, (m, a) => {
      o.push(a);
      return m;
    });
    if (/svat/i.test(x) && !o.includes("Radiant")) o.push("Radiant");
    if (/proklet/i.test(x) && !o.includes("Necrotic")) o.push("Necrotic");
    return o;
  };
  for (const m of t.matchAll(/(Resistance|Imunit\p{L}*|Immunit\p{L}*|Zranitelnost\p{L}*|Vulnerabilit\p{L}*)\s*(\([^)]*\))?([^·;.]*)/gu)) {
    const seg = m[3].split(/\b(?:Imunit|Immunit|Zranitel|Vulnerab|Resistance|Nehmotn)/)[0],
      k = /^Resist/.test(m[1]) ? (/zbroj/i.test(m[2] || "") ? "resZ" : "res") : /^(Imun|Immun)/.test(m[1]) ? "imu" : "zra";
    typy(seg).forEach(x => r[k].add(x));
  }
  return r;
}

/* z 12-boj-tah-postavy */
/* zásah: Immunity → 0, Resistance → polovina (Drtivá / Průrazná ignorují Resistance zbroje proti Bludgeoning / Piercing), pak Vulnerability ×2 */
function bojZasah(E, v, typ, o) {
  const R = bojOdolnosti(E),
    pozn = [];
  let x = v;
  if (o && (o.st || []).includes("zkamenělý") && !R.imu.has(typ)) {
    return {x: Math.floor(v / 2), pozn: ["zkamenělý: Resistance"]};
  }
  if (R.imu.has(typ)) {
    x = 0;
    pozn.push("Immunity");
  } else {
    const ign = (o.drt && typ === "Bludgeoning") || (o.pru && typ === "Piercing"),
      zb = R.resZ.has(typ) && !ign;
    if (R.res.has(typ) || zb) {
      x = Math.floor(x / 2);
      pozn.push(R.res.has(typ) ? "Resistance" : "Resistance zbroje");
    } else if (R.resZ.has(typ) && ign) pozn.push(`${o.drt && typ === "Bludgeoning" ? "Drtivá" : "Průrazná"} ignoruje zbroj`);
    if (R.zra.has(typ)) {
      x *= 2;
      pozn.push("Vulnerability");
    }
  }
  return {x, pozn};
}

/* z 12-boj-tah-postavy */
const bojConB = p => {
  const h = String((p && (p.b || p.h)) || "").replace(/−/g, "-");
  for (const tb of h.match(/<table[\s\S]*?<\/table>/g) || []) {
    const th = [...tb.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim()),
      td = [...tb.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]+>/g, "").trim());
    const i = th.indexOf("CON");
    if (i >= 0 && td[i]) {
      const m = td[i].match(/\(([+-]\d+)\)/);
      if (m) {
        const z = h.replace(/<[^>]+>/g, " ").match(/Záchran[^:]*:?[^.·]*?\bCON\s*([+-]\d+)/i);
        return z ? +z[1] : +m[1];
      }
    }
  }
  const t = h.replace(/<[^>]+>/g, " ");
  const m = t.match(/Záchran[^:]*:?[^.]*?\bCON\s*([+-]\d+)/i) || t.match(/\bCON\b[^\d+-]{0,6}\d+\s*\(([+-]\d+)\)/) || t.match(/\bCON\s*([+-]\d+)/);
  return m ? +m[1] : 0;
};

/* z 12-boj-tah-postavy */
/* hody proti smrti (D&D 2024): 10+ úspěch, méně neúspěch, 1 = dva neúspěchy, 20 = probere se s 1 HP; tři úspěchy stabilizace, tři neúspěchy smrt */
function bojDs(ds, act, d) {
  ds = Object.assign({u: 0, n: 0}, ds || {});
  delete ds.st;
  let m = "";
  if (act === "hod") {
    if (d === 20) return {ds: null, m: "20 – probírá se s 1 HP"};
    if (d === 1) {
      ds.n += 2;
      m = "1 – dva neúspěchy";
    } else if (d >= 10) {
      ds.u++;
      m = `${d} – úspěch`;
    } else {
      ds.n++;
      m = `${d} – neúspěch`;
    }
  } else if (act === "u") ds.u++;
  else if (act === "n") ds.n += +d || 1;
  ds.u = Math.min(3, ds.u);
  ds.n = Math.min(3, ds.n);
  if (ds.n >= 3) {
    ds.st = "mrtev";
    m += (m ? " → " : "") + "třetí neúspěch: umírá";
  } else if (ds.u >= 3) {
    ds.st = "stab";
    m += (m ? " → " : "") + "třetí úspěch: stabilizován, do konce boje mimo hru";
  }
  return {ds, m};
}

/* z 13-karty */
const kMod = v => Math.floor((+v - 10) / 2);

/* z 15-karty-artikule */
const kAdvSum = (base, r) => {
  const a = [base, ...r.map(x => x[0])],
    p = a.some(x => x > 0),
    m = a.some(x => x < 0);
  return p && m ? 0 : p ? 1 : m ? -1 : 0;
};

/* z 18-pravidla-postavy */
const kTrU = (c, n) => (c.tr.find(t => t.n === n) || {}).u || 0;

/* z 18-pravidla-postavy */
const kSum = L => L.reduce((a, x) => a + (+x[1] || 0), 0);

/* z 18-pravidla-postavy */
const kPocet = (c, pakt) => {
  const f = kTrU(c, "Fighter");
  let n = f >= 20 ? 4 : f >= 11 ? 3 : f >= 5 ? 2 : 1;
  if (["Barbarian", "Monk", "Paladin", "Ranger", "Gunslinger"].some(t => kTrU(c, t) >= 5)) n = Math.max(n, 2);
  if (pakt && kTrU(c, "Warlock") >= 5 && c.maRys(/thirsting blade/)) n = Math.max(n, 2);
  return n;
};

/* z 20b-boj-vypravec */
const bojKonDC = d => Math.min(30, Math.max(10, Math.floor((+d || 0) / 2)));

/* ---- manévry Battle Mastera se záchranou cíle (2026-10-25, Vojta): co se stane při neúspěchu; vyhodnotí vypravěč při potvrzení
   zásahu (20g). st = stav cíle, ef = značka účinku, okdy "konec" = skončí na konci příštího tahu útočníka (jako Vex), vel = jen
   na tvora Velkého a menšího ---- */
const MANZ = {
  "Trip Attack": {ab: "STR", st: "sražen", vel: true, txt: "sražen (Prone)"},
  "Menacing Attack": {ab: "WIS", st: "vyděšen", okdy: "konec", txt: "vyděšen (Frightened) do konce příštího tahu útočníka"},
  "Pushing Attack": {ab: "STR", vel: true, txt: "odstrčen až o 15 stop – posuň figurku"},
  "Disarming Attack": {ab: "STR", txt: "upustí jeden předmět, který drží (vybere útočník)"},
  "Goading Attack": {ab: "WIS", ef: 1, okdy: "konec", txt: "do konce příštího tahu útočníka nevýhoda na útoky proti jiným"},
};
/* výsledek manévru: n = název, ok = cíl uspěl v záchraně, velky = cíl je Obrovský a větší */
function manVysledek(n, ok, velky) {
  const M = MANZ[n];
  if (!M) return null;
  if (M.vel && velky) return {n, txt: `${n}: na tak velkého tvora nepůsobí`};
  if (ok) return {n, txt: `${n}: záchrana ${M.ab} uspěla`};
  return {n, st: M.st || "", ef: !!M.ef, okdy: M.okdy || "", txt: `${n}: ${M.txt}`};
}
/* světlo (SRD 5.2.1, 2026-10-27): pochodeň a svíčka hoří hodinu a spotřebují se, lampa a lucerny 6 hodin na lahvičku oleje.
   Zapálené světlo je účinek na kartě „Světlo: …“ s herním časem – vyprší samo s posunem času (kUcVyprsi). Pořadí: lucerna
   s clonou dřív než lucerna. [vzor názvu, {n, h hodin, spotr = spotřebuje se samo, palivo = spotřebuje olej, sv = dosah}] */
const SVETLA = [
  [/^(torch|pochodeň|louč)/i, {n: "Pochodeň", h: 1, spotr: true, sv: "jasné světlo 20 stop, šero dalších 20"}],
  [/^(candle|svíčka|svíce)/i, {n: "Svíčka", h: 1, spotr: true, sv: "jasné světlo 5 stop, šero dalších 5"}],
  [/^(lamp|lampa)\b/i, {n: "Lampa", h: 6, palivo: true, sv: "jasné světlo 15 stop, šero dalších 30"}],
  [/(bullseye|s clonou)/i, {n: "Lucerna s clonou", h: 6, palivo: true, sv: "jasné světlo 60 stop v kuželu, šero dalších 60"}],
  [/^(hooded )?(lantern|lucerna)/i, {n: "Lucerna", h: 6, palivo: true, sv: "jasné světlo 30 stop, šero dalších 30"}],
];
const SVPALIVO = /^(oil|olej)\b/i;
const svetloDruh = n => {
  const r = SVETLA.find(([re]) => re.test(String(n || "").trim()));
  return r ? r[1] : null;
};
/* léčení kritického zranění (Artikule › Rány, 2026-10-28): co ránu vyléčí podle závažnosti z textu „Těžká (Trup): …“.
   Lehká pomine sama (konec boje, krátký odpočinek); Těžká ošetřením – kdokoli, Lékařství SO 12 a +2 za každé další neléčené kritické
   zranění (Vojta 2026-10-29) – nebo Lesser Restoration; Vážná Greater Restoration nebo felčar (rozhodne vypravěč); Smrtelná je trvalá
   (odškrtne jen vypravěč). Greater léčí i lehčí. dalsi = počet ostatních neléčených ran postavy. */
const RANASO = 12;
function ranaLecba(t, dalsi = 0) {
  const s = String(t || ""),
    st = /^Lehk/i.test(s) ? 0 : /^Těžk/i.test(s) ? 1 : /^Vážn/i.test(s) ? 2 : /^Smrteln/i.test(s) ? 3 : 1;
  return {st, pomine: st === 0, lek: st === 1 ? RANASO + 2 * Math.max(0, +dalsi || 0) : null, lesser: st <= 1, greater: st <= 2, gm: st >= 2};
}
