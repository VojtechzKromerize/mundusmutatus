/* @čisté – Obchody (2026-10-30, Vojta): druhy obchodů se sortimentem z katalogu vybavení (art/vybaveni.json), dobové ceny v haléřích
   (pole hal, z ceny-dobove.json; 1 GP z pravidel = 10 grošů) a přirážka obchodu. Kouzelné předměty jsou extrémně vzácné: do sortimentu
   se nikdy nedostanou samy – vypravěč přidá jednotlivý kus (unikát, počet 1) ručně a cenu určí sám. Nevhodné věci (vzducholodě,
   exotická zvířata, výbava z jiných světů) se nenabízejí.
   ČISTÝ SOUBOR: data přicházejí argumentem (katalog V = art/vybaveni.json, obchod o z nastavení „obchody“). Stránka: 16o-obchody-tabulky.js. ===== */

/* druhy obchodů: n název, p popis, s sortiment = [kategorie katalogu, seznam anglických jmen | "*" (vše dovolené v kategorii)] */
const OBCHTYP = {
  kramar: {
    n: "Kramář",
    p: "Smíšené zboží pro cestu i domácnost: lana, světla, batohy, nádobí, šípy a střely do praku.",
    s: [
      [
        "vybava",
        "Backpack Barrel Basket Bedroll Bell Blanket Bottle,_Glass Bucket Candle Case,_Map_or_Scroll Chain Chest Clothes,_Traveler's Costume Flask Jug Ladder Lamp Lantern,_Hooded Oil Pole Pot,_Iron Pouch Rations Robe Rope Sack Shovel String Tent Tinderbox Torch Vial Waterskin Explorer's_Pack Hunting_Trap Signal_Whistle Grappling_Hook",
      ],
      ["strelivo", "Arrows Bullets,_Sling"],
      ["naradi", "Dice Playing_Cards"],
    ],
  },
  kupec: {
    n: "Kupec (dálkový obchod)",
    p: "Drahé a dovážené zboží: sukno a šaty, papír a pergamen, knihy, mapy, zrcadla a hudební nástroje.",
    prir: 20,
    s: [
      [
        "vybava",
        "Book Clothes,_Fine Ink Ink_Pen Lantern,_Bullseye Lock Magnifying_Glass Map Mirror Paper Parchment Perfume Spyglass Case,_Map_or_Scroll Diplomat's_Pack Scholar's_Pack Entertainer's_Pack",
      ],
      [
        "naradi",
        "Calligrapher's_Supplies Cartographer's_Tools Navigator's_Tools Painter's_Supplies Bagpipes Drum Dulcimer Flute Horn Lute Lyre Pan_Flute Shawm Viol",
      ],
    ],
  },
  kovar: {
    n: "Kovář a zámečník",
    p: "Železo pro hospodářství i boj: řetězy, zámky, pouta, hřeby a prosté zbraně.",
    s: [
      [
        "vybava",
        "Ball_Bearings Caltrops Chain Crowbar Grappling_Hook Hunting_Trap Lock Manacles Pot,_Iron Shovel Spikes,_Iron Bucket Ram,_Portable Block_and_Tackle Climber's_Kit",
      ],
      ["zbrane", "Dagger Handaxe Light_Hammer Mace Sickle Spear Javelin Warhammer War_Pick Flail Morningstar"],
      ["naradi", "Smith's_Tools Tinker's_Tools"],
    ],
  },
  mecir: {
    n: "Mečíř a nožíř",
    p: "Zbraně na blízko: meče, dýky, sekery, palcáty a zbraně na ratišti.",
    s: [
      [
        "zbrane",
        "Dagger Shortsword Longsword Greatsword Rapier Scimitar Battleaxe Greataxe Handaxe Mace Flail Morningstar Maul Warhammer War_Pick Glaive Halberd Pike Spear Lance Quarterstaff Club Greatclub Light_Hammer Sickle Trident Whip",
      ],
    ],
  },
  zbrojir: {
    n: "Zbrojíř a platnéř",
    p: "Zbroj od prošívanice po plátovou zbroj a štíty; dílna zbroj i opraví.",
    s: [["zbroj", "*"]],
  },
  lucist: {
    n: "Lučištník a samostřelník",
    p: "Luky, kuše, toulce a střelivo.",
    s: [
      ["zbrane", "Shortbow Longbow Light_Crossbow Heavy_Crossbow Hand_Crossbow Sling Dart"],
      ["strelivo", "Arrows Bolts Bullets,_Sling"],
      ["vybava", "Quiver Case,_Crossbow_Bolt"],
    ],
  },
  puskar: {
    n: "Puškař",
    p: "Palné zbraně a kule – vzácné a drahé zboží z měst s dílnami.",
    prir: 30,
    s: [
      ["zbrane", "Pistol Musket"],
      ["strelivo", "Bullets,_Firearm"],
    ],
  },
  sedlar: {
    n: "Koňský handlíř a sedlář",
    p: "Koně, mezci a psi, sedla, vozy a ustájení.",
    s: [
      ["zvirata", "Horse,_Draft Horse,_Riding Warhorse Mule Pony Mastiff Sled_Dog"],
      ["sedla", "Military Riding"],
      ["vozy", "Cart Wagon Covered_Wagon Carriage Sled Feed_per_day Stabling_per_day"],
    ],
  },
  apatyka: {
    n: "Apatykář a bylinkář",
    p: "Masti, obvazy, protijedy a byliny; lahvičky a parfémy.",
    s: [
      ["vybava", "Antitoxin Healer's_Kit Perfume Vial Bottle,_Glass"],
      ["naradi", "Herbalism_Kit"],
    ],
  },
  alchymista: {
    n: "Alchymista",
    p: "Kyseliny, řecký oheň, destilační náčiní a podivné sklo.",
    prir: 20,
    s: [
      ["vybava", "Acid Alchemist's_Fire Vial Bottle,_Glass Oil"],
      ["naradi", "Alchemist's_Supplies Glassblower's_Tools"],
    ],
  },
  remesla: {
    n: "Řemeslnický cech",
    p: "Nářadí řemesel: tesaři, ševci, koželuzi, kameníci, hrnčíři, tkalci, kuchaři a pivovarníci.",
    s: [
      [
        "naradi",
        "Brewer's_Supplies Carpenter's_Tools Cobbler's_Tools Cook's_Utensils Glassblower's_Tools Jeweler's_Tools Leatherworker's_Tools Mason's_Tools Potter's_Tools Smith's_Tools Tinker's_Tools Weaver's_Tools Woodcarver's_Tools",
      ],
    ],
  },
  kostel: {
    n: "Kostelník a poutní krám",
    p: "Svaté symboly, svíce, svěcená voda a kněžská výbava.",
    s: [["vybava", "Holy_Symbol Holy_Water Candle Book Priest's_Pack Robe Ink Parchment"]],
  },
  pokout: {
    n: "Pokoutník a překupník",
    p: "Zboží, o kterém se nemluví nahlas: zlodějské náčiní, převleky, padělky a jedy.",
    prir: 50,
    s: [
      ["naradi", "Thieves'_Tools Disguise_Kit Forgery_Kit Poisoner's_Kit"],
      ["vybava", "Burglar's_Pack Poison,_Basic Caltrops Ball_Bearings Manacles Lock"],
      ["jedy", "*"],
    ],
  },
  lodar: {
    n: "Loďař",
    p: "Čluny a lodě pro řeky a moře.",
    s: [["plavidla", "Rowboat Keelboat Sailing_Ship Galley Longship Warship"]],
  },
  vzacnosti: {
    n: "Kabinet vzácností",
    p: "Žádné běžné zboží: jen kusy, které tu vypravěč vystaví – relikvie, starožitnosti, výjimečně i kouzelné předměty.",
    s: [],
  },
};
/* nikdy se nenabízí samo: kouzelné předměty a lektvary či svitky, věci jiných světů (vzducholodě, houbové oděvy, exotická zvířata) */
const OBCHNIKDY =
  /^(Potion of|Spell Scroll|Airship|Strider Airship|Lyrandar|Bright Fungal|Warm Fungal|Garb of Light|Genie Robe|Locking Spellbook|Monster Camouflage|Axe Beak|Elephant|Flying Snake|Dragonchess|Three-dragon)/i;
/* položka je kouzelná (unikát): z kategorie magických předmětů, nebo lektvar či svitek */
const obchMag = x => !!x && (x.sk === "magicke" || /^(Potion of|Spell Scroll)/i.test(x.en || ""));
const obchJmena = t =>
  t === "*"
    ? null
    : String(t || "")
        .split(/\s+/)
        .filter(Boolean)
        .map(s => s.replace(/_/g, " "));
/* sortiment druhu obchodu z katalogu: položky v pořadí kategorií a seznamu */
function obchSortiment(typ, V) {
  const T = OBCHTYP[typ];
  if (!T || !V) return [];
  const R = [],
    vid = new Set();
  for (const [sk, jm] of T.s) {
    const L = (V[sk] || []).filter(x => x && x.en && !OBCHNIKDY.test(x.en) && !obchMag(Object.assign({sk}, x)));
    const J = obchJmena(jm);
    const vyber = J ? J.map(n => L.find(x => x.en === n)).filter(Boolean) : L;
    vyber.forEach(x => {
      if (vid.has(x.id)) return;
      vid.add(x.id);
      R.push(Object.assign({sk}, x));
    });
  }
  return R;
}
/* cena s přirážkou obchodu (procenta, i záporná = sleva), v haléřích, nejméně 1 */
const obchCena = (hal, prir) => (hal > 0 ? Math.max(1, Math.round((+hal * (100 + (+prir || 0))) / 100)) : 0);
/* nový obchod (výchozí přirážka podle druhu) */
function obchNovy(typ, n, misto, id) {
  const T = OBCHTYP[typ] || OBCHTYP.kramar;
  return {
    id: id || "o" + Math.random().toString(36).slice(2, 8),
    n: String(n || T.n).slice(0, 60),
    typ: OBCHTYP[typ] ? typ : "kramar",
    misto: String(misto || "").slice(0, 60),
    prir: T.prir || 0,
    otevr: false,
    ven: [],
    pol: [],
  };
}
/* zboží obchodu: sortiment druhu bez vyřazených (ven) + ručně vystavené kusy (pol: {id, q, cena, n}); každý řádek
   {id, x (položka katalogu), n, hal (cena za kus), q (null = dost), ruc (ručně vystavené), mag (kouzelný unikát)}.
   c (nepovinné): prir = přirážka celkem (obchUprava – pověst, zpustlý kraj), den = herní den (obchDen) pro zásoby */
function obchZbozi(o, V, BY, c) {
  if (!o) return [];
  c = c || {};
  const prir = c.prir != null ? c.prir : o.prir,
    ven = new Set(o.ven || []),
    ruc = new Map((o.pol || []).map(p => [p.id, p])),
    prod = obchProdejeDnes(o, c.den),
    R = [];
  obchSortiment(o.typ, V).forEach(x => {
    if (ven.has(x.id) || ruc.has(x.id) || !(x.hal > 0)) return;
    const q = o.zas ? Math.max(0, obchZasoba(x.hal, o.zpust) - (+prod[x.id] || 0)) : null;
    R.push({id: x.id, x, n: x.cz || x.en, hal: obchCena(x.hal, prir), q, ruc: false, mag: false});
  });
  (o.pol || []).forEach(p => {
    const x = (BY && BY[p.id]) || null;
    if (p.q != null && !(+p.q > 0)) return;
    const mag = obchMag(x) || !!p.mag;
    const hal = +p.cena > 0 ? Math.round(+p.cena) : x && x.hal ? obchCena(x.hal, prir) : 0;
    if (!(hal > 0)) return;
    R.push({id: p.id, x, n: p.n || (x && (x.cz || x.en)) || p.id, hal, q: p.q != null ? +p.q : mag ? 1 : null, ruc: true, mag});
  });
  return R;
}
/* ručně vystavený kus: kouzelný předmět je vždy jen jeden kus (unikát), pokud vypravěč neurčí jinak */
function obchVystav(o, x, q, cena) {
  const P = (o.pol || []).filter(p => p.id !== x.id);
  const mag = obchMag(x);
  P.push(
    Object.assign(
      {id: x.id, q: q != null && q !== "" ? Math.max(1, Math.round(+q)) : mag ? 1 : null},
      +cena > 0 ? {cena: Math.round(+cena)} : {},
      mag ? {mag: 1} : {},
    ),
  );
  return Object.assign({}, o, {pol: P, ven: (o.ven || []).filter(v => v !== x.id)});
}
/* po prodeji: ručně vystavenému kusu ubude počet (nula = zmizí); u sortimentu druhu se se zásobami (o.zas) prodej
   zapíše do o.prod a za týden herního času (OBCHTYDEN dní od o.dopl) se sklad doplní */
function obchProdano(o, id, q, den) {
  q = Math.max(1, +q || 1);
  const jeRuc = (o.pol || []).some(p => p.id === id);
  const P = (o.pol || []).map(p => (p.id === id && p.q != null ? Object.assign({}, p, {q: +p.q - q}) : p)).filter(p => p.q == null || p.q > 0);
  const out = Object.assign({}, o, {pol: P});
  if (!jeRuc && o.zas) {
    const prod = Object.assign({}, obchProdejeDnes(o, den));
    prod[id] = (+prod[id] || 0) + q;
    out.prod = prod;
    if (!(+o.dopl > 0) || Object.keys(obchProdejeDnes(o, den)).length === 0) out.dopl = den > 0 ? den : +o.dopl || 0;
  }
  return out;
}
/* lze prodat q kusů? (dost na skladě) */
const obchLzeProdat = (r, q) => !!r && (r.q == null || r.q >= Math.max(1, +q || 1));

/* ===== Obchody II (2026-10-30, Vojta: „líbí se mi všechno“): pověst, zásoby, výkup, smlouvání, zakázky, místo ===== */
/* vlastnosti druhů: dc = SO smlouvání, vyk = podíl z ceny při výkupu (0 = nevykupuje), zak = přijímá zakázky, gen = stav obchodníka
   pro generátor postav (09g) */
const OBCHVL = {
  kramar: {dc: 12, vyk: 0.5, gen: "mestan"},
  kupec: {dc: 15, vyk: 0.5, gen: "kupec"},
  kovar: {dc: 12, vyk: 0.4, zak: 1, gen: "remeslnik"},
  mecir: {dc: 14, vyk: 0.5, zak: 1, gen: "remeslnik"},
  zbrojir: {dc: 14, vyk: 0.5, zak: 1, gen: "remeslnik"},
  lucist: {dc: 12, vyk: 0.5, zak: 1, gen: "remeslnik"},
  puskar: {dc: 15, vyk: 0.4, zak: 1, gen: "remeslnik"},
  sedlar: {dc: 12, vyk: 0.4, zak: 1, gen: "remeslnik"},
  apatyka: {dc: 13, vyk: 0.4, gen: "mestan"},
  alchymista: {dc: 15, vyk: 0.4, gen: "mestan"},
  remesla: {dc: 12, vyk: 0.4, zak: 1, gen: "remeslnik"},
  kostel: {dc: 16, vyk: 0, gen: "knez"},
  pokout: {dc: 13, vyk: 0.3, gen: "lapka"},
  lodar: {dc: 13, vyk: 0.4, zak: 1, gen: "remeslnik"},
  vzacnosti: {dc: 16, vyk: 0, gen: "kupec"},
};
const obchVl = o => OBCHVL[(o && o.typ) || ""] || OBCHVL.kramar;
const obchDc = o => (o && +o.dc > 0 ? +o.dc : obchVl(o).dc);
/* pověst u rodu obchodu → přirážka v procentech; null = s družinou neobchoduje (Nepřízeň a horší) */
const OBCHPOV = {3: -20, 2: -10, 1: -5, 0: 0, "-1": 10, "-2": null, "-3": null};
const obchPovPrir = u => {
  const v = OBCHPOV[Math.max(-3, Math.min(3, Math.round(+u || 0)))];
  return v === undefined ? 0 : v;
};
/* zpustlý kraj: zboží o polovinu dražší a zásoby poloviční */
const OBCHZPUST = 50;
/* celková přirážka obchodu (druh + pověst + zpustlý kraj); null = neobchoduje */
function obchUprava(o, u) {
  const pv = obchPovPrir(u);
  if (pv === null) return null;
  return (+o.prir || 0) + pv + (o.zpust ? OBCHZPUST : 0);
}
/* herní den z data „YYYY-MM-DD“ (juliánský kalendář tažení – stačí rozdíly dní) */
function obchDen(datum) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(datum || ""));
  if (!m) return 0;
  const y = +m[1],
    mo = +m[2],
    d = +m[3],
    a = Math.floor((14 - mo) / 12),
    Y = y + 4800 - a,
    M = mo + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - 32083;
}
const obchDenTxt = (den, MES) => {
  if (!(den > 0)) return "";
  const c = den + 32082,
    d = Math.floor((4 * c + 3) / 1461),
    e = c - Math.floor((1461 * d) / 4),
    m = Math.floor((5 * e + 2) / 153);
  const D = e - Math.floor((153 * m + 2) / 5) + 1,
    Mo = m + 3 - 12 * Math.floor(m / 10),
    Y = d - 4800 + Math.floor(m / 10);
  return `${D}. ${MES ? MES[Mo - 1] : Mo + "."} ${Y}`;
};
/* zásoby běžného zboží (o.zas): levné věci po dvaceti kusech, drahé po jednom; doplní se po týdnu */
const OBCHTYDEN = 7;
function obchZasoba(hal, zpust) {
  const z = hal <= 20 ? 20 : hal <= 100 ? 8 : hal <= 500 ? 4 : hal <= 2000 ? 2 : 1;
  return zpust ? Math.max(1, Math.floor(z / 2)) : z;
}
function obchProdejeDnes(o, den) {
  if (!o || !o.prod) return {};
  if (den > 0 && +o.dopl > 0 && den >= +o.dopl + OBCHTYDEN) return {};
  return o.prod;
}
/* je družina v místě obchodu? místo obchodu „Praha, Staré Město“ odpovídá poloze „Praha“ (první část před čárkou) */
const obchKl = t =>
  String(t || "")
    .split(",")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
function obchTady(o, kde) {
  if (!o || !o.vaz || !o.misto) return true;
  return !!kde && obchKl(o.misto) === obchKl(kde);
}
/* vidí hráč obchod? otevřený a (bez vazby na místo, nebo je tam družina) */
const obchViditelny = (o, kde) => !!o && !!o.otevr && obchTady(o, kde);
/* smlouvání: hod Přesvědčování (či Klamání, Zastrašování) proti SO obchodníka → změna ceny v procentech */
function obchSmlouvani(tot, dc) {
  tot = +tot || 0;
  if (tot >= dc + 5) return -20;
  if (tot >= dc) return -10;
  if (tot <= dc - 5) return 10;
  return 0;
}
const obchSeSmlouvou = (hal, pct) => Math.max(1, Math.round((hal * (100 + (+pct || 0))) / 100));
/* výkup od družiny: druh vykupuje věci ze svých kategorií (pokoutník vše běžné), kouzelné předměty jen dohodou s vypravěčem */
function obchVykupuje(o, x) {
  const vl = obchVl(o);
  if (!vl.vyk || !x) return false;
  if (obchMag(x)) return false;
  if (o.typ === "pokout") return true;
  const T = OBCHTYP[o.typ];
  return !!T && T.s.some(([sk]) => sk === x.sk);
}
/* výkupní cena za kus (haléře): podíl druhu z dobové ceny, pověst ji zlepší nebo zhorší (opačně než u prodeje) */
function obchVykupCena(o, x, u) {
  if (!obchVykupuje(o, x) || !(x.hal > 0)) return 0;
  const pv = obchPovPrir(u);
  if (pv === null) return 0;
  return Math.max(1, Math.round((x.hal * obchVl(o).vyk * (100 - pv)) / 100));
}
/* zakázky: řemeslník zhotoví cokoli ze svých kategorií katalogu (ne kouzelné ani nevhodné věci); dny práce podle ceny */
function obchZakazkyNab(typ, V) {
  const T = OBCHTYP[typ];
  if (!T || !V || !(OBCHVL[typ] || {}).zak) return [];
  const vid = new Set(),
    R = [];
  for (const [sk] of T.s)
    (V[sk] || []).forEach(x => {
      if (!x || !x.en || vid.has(x.id) || !(x.hal > 0) || OBCHNIKDY.test(x.en) || obchMag(Object.assign({sk}, x))) return;
      vid.add(x.id);
      R.push(Object.assign({sk}, x));
    });
  return R;
}
const obchDnyPrace = hal => Math.max(1, Math.min(60, Math.ceil((+hal || 0) / 250)));
/* přijatá zakázka: {id, k (karta), kn (jméno postavy), pol (id z katalogu, prázdné = vlastní), n, q, hot (herní den hotovo), cena} */
function obchZakazkaPridej(o, z) {
  return Object.assign({}, o, {zak: [...(o.zak || []), z].slice(-40)});
}
/* platba z peněz (karta či pokladna) jako rozdíl mincí pro mm_pokladna: {GP: −1, SP: +30} */
function obchRozdil(pred, po) {
  const R = {};
  new Set([...Object.keys(pred || {}), ...Object.keys(po || {})]).forEach(k => {
    const d = (+(po || {})[k] || 0) - (+(pred || {})[k] || 0);
    if (d) R[k] = d;
  });
  return R;
}
