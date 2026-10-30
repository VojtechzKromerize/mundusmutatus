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
   {id, x (položka katalogu), n, hal (cena za kus), q (null = dost), ruc (ručně vystavené), mag (kouzelný unikát)} */
function obchZbozi(o, V, BY) {
  if (!o) return [];
  const ven = new Set(o.ven || []),
    ruc = new Map((o.pol || []).map(p => [p.id, p])),
    R = [];
  obchSortiment(o.typ, V).forEach(x => {
    if (ven.has(x.id) || ruc.has(x.id) || !(x.hal > 0)) return;
    R.push({id: x.id, x, n: x.cz || x.en, hal: obchCena(x.hal, o.prir), q: null, ruc: false, mag: false});
  });
  (o.pol || []).forEach(p => {
    const x = (BY && BY[p.id]) || null;
    if (p.q != null && !(+p.q > 0)) return;
    const mag = obchMag(x) || !!p.mag;
    const hal = +p.cena > 0 ? Math.round(+p.cena) : x && x.hal ? obchCena(x.hal, o.prir) : 0;
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
/* po prodeji: ručně vystavenému kusu ubude počet (nula = zmizí), sortiment druhu je bez omezení */
function obchProdano(o, id, q) {
  const P = (o.pol || [])
    .map(p => (p.id === id && p.q != null ? Object.assign({}, p, {q: +p.q - Math.max(1, +q || 1)}) : p))
    .filter(p => p.q == null || p.q > 0);
  return Object.assign({}, o, {pol: P});
}
/* lze prodat q kusů? (dost na skladě) */
const obchLzeProdat = (r, q) => !!r && (r.q == null || r.q >= Math.max(1, +q || 1));
