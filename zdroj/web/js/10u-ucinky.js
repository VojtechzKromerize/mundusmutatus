/* @čisté – Účinky v jednom formátu (2026-10-23): posílení z kouzel a rysů, kostky k hodům d20 a jejich sčítání podle D&D 2024 =====
   ČISTÝ SOUBOR: jen výpočty nad daty, žádná stránka, úložiště ani jména z jiných souborů (hlídá npm run kontrola, testy běží
   v čistém Node bez prohlížeče – testy/jednotky/ciste.mjs). Data přicházejí jako argumenty; co je na kartě, sbírá 17b (kBufAll).

   UCINKY[jméno] – jeden záznam na účinek (kouzlo, rys, kostka). Všechna pole jsou nepovinná:
     p        popis na kartě (co účinek dělá, dokud trvá)
     hodnoty karty: ac (+AC) · acmin (AC nejméně) · acz (bez zbroje AC = acz + DEX) · rych (+stop) · rychX (násobek rychlosti)
              zach (+ ke všem záchranám) · adv [vlastnosti] výhoda na záchrany · res [typy] | "vse" Resistance
              hpmax l => + maximum HP podle stupně · thp l => dočasné HP při seslání ({x: výraz} | {n: číslo}) · thpTah dočasné HP
              na začátku tahu · dov {dovednost: bonus} · ov + ke všem ověřením · utMinus útoky proti tobě −1d4 · blink d6 na konci tahu
     kostky k hodům d20: kostka "1d4" | "-1d4" · na "ut za ov in" (útok, záchrana, ověření, iniciativa) · tip nápověda přepínače
              poHodu přičte se až po hodu a spotřebuje se (Bardic) · jednou "tah" jen jednou za tah · skryt bez přepínače na kartě
     scit     stejnojmenné instance se sčítají (výjimka z pravidla níže; zatím ji nic nepotřebuje)

   Sčítání (D&D 2024, Combining Game Effects): RŮZNÉ účinky se sčítají – Bless + Emboldening Bond + Guidance, Haste + Shield of
   Faith…; STEJNOJMENNÉ ne – platí nejsilnější instance (nejvyšší stupeň), např. Bless od dvou kleriků = jednou 1d4, Aid
   2. a 4. stupně = jen Aid 4. stupně. Stupeň nese název účinku („Aid (4. st.)“, kzSt). ===== */
const UCINKY = {
  Haste: {
    ac: 2,
    rychX: 2,
    adv: ["DEX"],
    p: "+2 AC, dvojnásobná rychlost, výhoda na záchrany DEX, v každém tahu akce navíc (Útok jedním útokem, Sprint, Odpoutání, Skrytí nebo Použití předmětu)",
  },
  "Mage Armor": {acz: 13, p: "bez zbroje: AC 13 + DEX"},
  Barkskin: {acmin: 17, p: "AC nejméně 17"},
  "Warding Bond": {ac: 1, zach: 1, res: "vse", p: "+1 AC a k záchranám, Resistance vůči všemu zranění; sesilatel utrpí stejné zranění"},
  Longstrider: {rych: 10, p: "rychlost +10 stop"},
  Stoneskin: {res: ["Bludgeoning", "Piercing", "Slashing"], p: "Resistance vůči Bludgeoning, Piercing a Slashing"},
  Heroism: {thpTah: 1, p: "imunní vůči stavu Vyděšen (Frightened); na začátku tahu dočasné HP = modifikátor sesílací vlastnosti sesilatele"},
  Aid: {hpmax: l => 5 * Math.max(1, l - 1), p: "maximum i aktuální HP +5 (+5 za každou úroveň slotu nad 2)"},
  "Beacon of Hope": {adv: ["WIS"], p: "výhoda na záchrany WIS a záchrany proti smrti; léčení vždy maximum"},
  "Protection from Evil and Good": {
    p: "aberace, nebešťané, elementálové, víly, běsi a nemrtví mají nevýhodu na útoky proti tobě a nemohou tě okouzlit, vyděsit ani posednout",
  },
  Blur: {p: "útoky proti tobě mají nevýhodu (ledaže útočník vidí skrz iluze)"},
  "Death Ward": {p: "první pokles na 0 HP: zůstaneš na 1 HP a kouzlo skončí"},
  "Freedom of Movement": {p: "obtížný terén ani kouzla tě nezpomalí, magie tě nemůže ochromit ani zadržet"},
  "Enlarge/Reduce": {p: "zvětšení: výhoda na ověření a záchrany STR, zbraně +1d4 zranění · zmenšení: nevýhoda STR, zbraně −1d4"},
  Fly: {p: "rychlost letu 60 stop"},
  "Spider Climb": {p: "lezení po stěnách i stropě, rychlost lezení = rychlost chůze"},
  "Greater Invisibility": {p: "neviditelný (Invisible) i při útoku a sesílání"},
  Invisibility: {p: "neviditelný (Invisible), dokud nezaútočíš nebo nesešleš kouzlo"},
  "Mirror Image": {p: "tři iluzorní dvojníci: zásah může zasáhnout dvojníka"},
  "Holy Aura": {adv: ["STR", "DEX", "CON", "INT", "WIS", "CHA"], p: "výhoda na všechny záchrany, útoky proti tobě s nevýhodou"},
  "Protection from Energy": {p: "Resistance vůči zvolenému typu zranění (Acid, Cold, Fire, Lightning nebo Thunder)"},
  "False Life": {thp: l => ({x: "2d4+4" + (l > 1 ? `+${5 * (l - 1)}` : "")}), p: "dočasné HP 2d4 + 4 (+5 za každou úroveň slotu nad 1)"},
  "Armor of Agathys": {
    thp: l => ({n: 5 * Math.max(1, l)}),
    p: "dočasné HP 5 za úroveň slotu; dokud je máš, útočník zblízka utrpí Cold zranění 5 za úroveň slotu",
  },
  /* ---- obranná kouzla: Blade Ward (útoky proti postavě −1d4), Blink (na konci tahu d6) ---- */
  "Blade Ward": {utMinus: 1, p: "útoky proti tobě −1d4"},
  Blink: {blink: 1, p: "na konci každého tvého tahu d6: 4–6 odejdeš do Éteru do začátku dalšího tahu"},
  "Enhance Ability": {p: "výhoda na ověření zvolené vlastnosti"},
  Resistance: {p: "zranění zvoleného typu −1d4, jednou za tah"},
  "Magic Weapon": {p: "zbraň +1 k útoku a zranění (+2 ze slotu 3.–5., +3 ze slotu 6+)"},
  "Elemental Weapon": {p: "zbraň +1 k útoku a +1d4 zvoleného typu (vyšší sloty víc)"},
  Shillelagh: {p: "kyj nebo hůl: sesílací vlastnost, větší kostka zranění"},
  /* ---- posílení a ochrany (2026-10-22, inventura kouzel): mechanika, kde ji karta umí, jinak jen popis p ---- */
  "Absorb Elements": {p: "do začátku tvého dalšího tahu Resistance vůči typu utrpěného zranění; první zásah zblízka v tomto tahu +1d6 téhož typu"},
  "Expeditious Retreat": {p: "při seslání a každý další tah bonusovou akcí Dash"},
  Jump: {p: "jednou za tah skok až 30 stop za 10 stop pohybu"},
  "Feather Fall": {p: "padáš 60 stop za kolo, bez zranění pádem"},
  Sanctuary: {
    p: "kdo na tebe chce zaútočit nebo tě zacílit, hází WIS záchranu proti tvému SO kouzel; při neúspěchu musí zvolit jiný cíl; končí tvým útokem nebo škodlivým kouzlem",
  },
  Goodberry: {p: "10 bobulí na 24 hodin: bonusová akce sněz = +1 HP a jídlo na den"},
  "Zephyr Strike": {
    p: "pohyb nevyvolává příležitostné útoky; jednou před koncem kouzla: výhoda na útok zbraní, při zásahu +1d8 Force a +30 stop rychlosti do konce tahu",
  },
  "Compelled Duel": {p: "cíl má nevýhodu na útoky proti jiným než tobě a nesmí se dobrovolně vzdálit víc než 30 stop; končí tvým útokem na jiného"},
  "Faerie Fire": {p: "cíle světélkují: útoky proti nim s výhodou, neviditelnost jim nepomůže"},
  "Silvery Barbs": {p: "reakce: přehození úspěšného hodu d20 nepřítele (nižší platí); jiná bytost dostane výhodu na příští hod d20 do minuty"},
  Darkvision: {p: "vidění ve tmě 150 stop"},
  "Pass without Trace": {dov: {Stealth: 10}, p: "+10 k ověřením DEX (Stealth), nezanecháváš stopy"},
  "Protection from Poison": {res: ["Poison"], p: "Resistance vůči Poison, výhoda na záchrany proti otravě; otrava ukončena"},
  "See Invisibility": {p: "vidíš neviditelné bytosti a předměty"},
  Silence: {p: "v kouli ticho: hluchý, Immunity vůči Thunder, kouzla s verbální složkou nejdou seslat"},
  Levitate: {p: "vznášíš se až 20 stop nad zemí, pohyb jen odrazem od pevných předmětů"},
  "Alter Self": {p: "změna vzhledu, vodní dech, nebo přirozené zbraně 1d6 + sesílací vlastnost k útoku"},
  "Kinetic Jaunt": {rych: 10, p: "rychlost +10 stop, pohyb nevyvolává příležitostné útoky, projdeš prostorem jiných"},
  "Borrowed Knowledge": {p: "zdatnost v jedné zvolené dovednosti"},
  "Air Bubble": {p: "zásoba vzduchu kolem hlavy na 24 hodin"},
  "Fortune's Favor": {p: "jednou: hoď druhou d20 k útoku, ověření či záchraně (nebo proti příchozímu útoku) a vyber výsledek"},
  "Ray of Enfeeblement": {p: "cíl po neúspěšné záchraně: nevýhoda na testy STR a −1d8 ze zranění útoky se STR"},
  "Shadow Blade": {p: "čepel ze stínu: útok na blízko Finesse, 2d8 Psychic (vyšší sloty víc), vrh 20/60 stop, výhoda v šeru a tmě"},
  "Aura of Vitality": {p: "bonusovou akcí vyléčíš tvora v auře (30 stop) o 2d6 HP"},
  "Intellect Fortress": {res: ["Psychic"], adv: ["INT", "WIS", "CHA"], p: "Resistance vůči Psychic, výhoda na záchrany INT, WIS a CHA"},
  "Gaseous Form": {
    res: ["Bludgeoning", "Piercing", "Slashing"],
    p: "mlha: Resistance vůči Bludgeoning, Piercing a Slashing, výhoda na záchrany STR, DEX a CON, let 10 stop, bez útoků a kouzel",
  },
  Catnap: {p: "spíš 10 minut; po nich jako po krátkém odpočinku"},
  "Feign Death": {res: "vse", p: "zdánlivě mrtvý: Resistance vůči všemu kromě Psychic, Oslepen a Neschopný, rychlost 0"},
  Daylight: {p: "jasné světlo 60 stop a šero dalších 60 stop; ruší magickou tmu nižšího stupně"},
  Tongues: {p: "rozumíš každému jazyku a každý rozumí tobě"},
  "Water Breathing": {p: "dýcháš pod vodou"},
  "Water Walk": {p: "chůze po vodě, kyselině, lávě i sněhu"},
  Nondetection: {p: "skrytý před věšteckou magií a magickým pozorováním"},
  "Magic Circle": {p: "válec 10 stop: zvolený druh tvorů nemůže dovnitř (ven ano) a má nevýhodu na útoky na cíle uvnitř"},
  "Crusader's Mantle": {p: "aura 30 stop: útoky zbraní spojenců +1d4 Radiant (tvoje se přičtou samy)"},
  "Spirit Shroud": {p: "útoky na cíle do 10 stop +1d8 Radiant/Necrotic/Cold (přičte se sám); cíle se nehojí a mají o 10 stop nižší rychlost"},
  "Flame Arrows": {p: "střely z toulce: zásah +1d6 Fire (přičte se sám u útoků na dálku)"},
  "Motivational Speech": {adv: ["WIS"], p: "dočasné HP 5 (zapiš si), výhoda na záchrany WIS, nelze vyděsit; po zásahu kouzlo končí"},
  "Tiny Hut": {p: "kupole 10 stop: dovnitř nic neprojde, uvnitř klid a stálá teplota"},
  "Fire Shield": {p: "teplý (Resistance Cold) nebo chladný (Resistance Fire) štít: útočník zblízka utrpí 2d8 Fire/Cold; světlo 10 stop"},
  "Aura of Life": {
    res: ["Necrotic"],
    p: "aura 30 stop: spojenci Resistance vůči Necrotic, maximum HP nejde snížit, kdo začne tah s 0 HP, získá 1 HP",
  },
  "Aura of Purity": {
    res: ["Poison"],
    p: "aura 30 stop: spojenci Resistance vůči Poison, nemohou být Otráveni, výhoda na záchrany proti stavům (ne Vyčerpání)",
  },
  "Resilient Sphere": {p: "koule síly: nic dovnitř ani ven, Immunity vůči všemu zranění; ven jen Disintegrate"},
  "Elemental Bane": {p: "cíl po neúspěšné záchraně ztrácí Resistance vůči zvolenému typu a první zásah v tahu tím typem +2d6"},
  Slow: {p: "zpomalení: rychlost poloviční, −2 AC a k záchranám DEX, bez reakcí, jen akce nebo bonusová akce, kouzlo s akcí se seslá až příští tah"},
  "Swift Quiver": {p: "každou bonusovou akci dva útoky zbraní na dálku ze střel z toulce"},
  "Skill Empowerment": {p: "Expertise v jedné dovednosti, ve které máš zdatnost"},
  "Far Step": {p: "při seslání a každou další bonusovou akci teleport až 60 stop"},
  Mislead: {p: "jsi neviditelný a tvůj iluzorní dvojník jde dál; vidíš jeho očima"},
  "Antilife Shell": {p: "bariéra 10 stop: živé bytosti neprojdou ani skrz ni nezaútočí zblízka"},
  "Circle of Power": {
    adv: ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
    p: "aura 30 stop: spojenci výhoda na záchrany proti kouzlům, při úspěchu žádné zranění místo poloviny",
  },
  "Holy Weapon": {p: "zbraň +2d8 Radiant (přičte se sám), září 30 stop; ukončením výbuch 4d8 Radiant, Oslepen při neúspěchu CON"},
  "Dispel Evil and Good": {
    p: "nebešťané, elementálové, víly, běsi a nemrtví mají nevýhodu na útoky proti tobě; dotykem ukončíš okouzlení, vyděšení či posednutí nebo tvora vyženeš",
  },
  "Telepathic Bond": {p: "telepatie mezi spojenými na hodinu, bez omezení vzdálenosti na téže sféře"},
  "Tree Stride": {p: "každý tah 5 stop pohybu na průchod stromem k jinému stromu stejného druhu do 500 stop"},
  "Globe of Invulnerability": {p: "koule 10 stop: kouzla 5. a nižšího stupně zvenčí dovnitř nepůsobí"},
  "Heroes' Feast": {
    hpmax: () => 10,
    adv: ["WIS"],
    p: "hostina: maximum HP +2d10 (karta počítá 10), výhoda na záchrany WIS, nelze otrávit ani vyděsit, Immunity vůči Poison – do dalšího dlouhého odpočinku",
  },
  "True Seeing": {p: "pravé vidění 120 stop: vidíš skrz iluze, neviditelné, do Éteru"},
  "Wind Walk": {
    p: "oblak: let 300 stop, Resistance vůči Bludgeoning, Piercing a Slashing; proměna zpět trvá minutu",
    res: ["Bludgeoning", "Piercing", "Slashing"],
  },
  "Primordial Ward": {
    res: ["Acid", "Cold", "Fire", "Lightning", "Thunder"],
    p: "Resistance vůči Acid, Cold, Fire, Lightning a Thunder; jednou můžeš mít místo toho Immunity do konce tahu, pak kouzlo končí",
  },
  "Fizban's Platinum Shield": {
    ac: 2,
    res: ["Acid", "Cold", "Fire", "Lightning", "Poison"],
    p: "+2 AC, Resistance vůči Acid, Cold, Fire, Lightning a Poison, při úspěšné záchraně DEX žádné zranění místo poloviny",
  },
  "Tasha's Otherworldly Guise": {
    ac: 2,
    p: "+2 AC, let 40 stop, Immunity podle sféry (Fire a Poison, nebo Radiant a Necrotic), dva útoky akcí Útok se sesílací vlastností",
  },
  Regenerate: {p: "vyléčeno 4d8 + 15 HP a na začátku každého tahu +1 HP po hodinu; chybějící části těla dorostou"},
  "Power Word Fortify": {p: "120 dočasných HP rozdělených mezi cíle (zapiš si svůj díl)"},
  "Mind Blank": {res: ["Psychic"], p: "Immunity vůči Psychic, čtení myšlenek, věštění a stavu Okouzlen"},
  "Antimagic Field": {p: "koule 10 stop bez magie: kouzla a magické předměty uvnitř nepůsobí"},
  Foresight: {
    adv: ["STR", "DEX", "CON", "INT", "WIS", "CHA"],
    p: "výhoda na útoky, ověření a záchrany; útoky proti tobě s nevýhodou; nelze tě překvapit",
  },
  Invulnerability: {res: "vse", p: "Immunity vůči všemu zranění (karta počítá Resistance – zranění zapisuj jako 0)"},
  /* ---- kostky k hodům d20 (dřív tabulka KPRID v 17): Bless, Bane, Guidance přičte karta sama; Bardic až po hodu ---- */
  Bless: {kostka: "1d4", na: "ut za", tip: "+1d4 k útokům a záchranám", p: "+1d4 k útokům a záchranám"},
  Bane: {kostka: "-1d4", na: "ut za", tip: "−1d4 k útokům a záchranám", p: "−1d4 k útokům a záchranám"},
  Guidance: {kostka: "1d4", na: "ov", tip: "+1d4 k ověřením (zvolená dovednost)", p: "+1d4 k ověřením (zvolená dovednost)"},
  "Emboldening Bond": {
    kostka: "1d4",
    na: "ut za ov",
    jednou: "tah",
    tip: "Emboldening Bond (Doména míru): +1d4 k útoku, záchraně nebo ověření, jednou za tah, dokud jsi do 30 stop od jiného spojeného",
    p: "+1d4 k útoku, záchraně nebo ověření, jednou za tah",
  },
  "Gift of Alacrity": {
    kostka: "1d8",
    na: "in",
    skryt: 1,
    tip: "Gift of Alacrity: +1d8 k iniciativě",
    p: "+1d8 k hodům na iniciativu (přičte se sám)",
  },
  "Bardic d6": {
    kostka: "1d6",
    na: "ut za ov",
    poHodu: 1,
    tip: "kostka Bardic Inspiration – přičte se k dalšímu hodu d20 a spotřebuje",
    p: "kostka Bardic Inspiration k dalšímu hodu d20",
  },
  "Bardic d8": {kostka: "1d8", na: "ut za ov", poHodu: 1, p: "kostka Bardic Inspiration k dalšímu hodu d20"},
  "Bardic d10": {kostka: "1d10", na: "ut za ov", poHodu: 1, p: "kostka Bardic Inspiration k dalšímu hodu d20"},
  "Bardic d12": {kostka: "1d12", na: "ut za ov", poHodu: 1, p: "kostka Bardic Inspiration k dalšímu hodu d20"},
};

/* kouzlo bez přípony stupně: „Aid (3. st.)“ → Aid; stupeň z přípony */
const kzJm = n =>
  String(n || "")
    .replace(/\s*\(\d+\. st\.\)\s*$/, "")
    .trim();
const kzSt = n => +(String(n || "").match(/\((\d+)\. st\.\)\s*$/) || [])[1] || 0;
/* řádky kostek ve starém tvaru [název, kostka, druhy, nápověda, po hodu, jednou za tah, bez přepínače] – pro přepínače karty */
const KPRID = Object.entries(UCINKY)
  .filter(([, e]) => e.kostka)
  .map(([n, e]) => [n, e.kostka, e.na, e.tip || "", e.poHodu ? 1 : 0, e.jednou === "tah" ? 1 : 0, e.skryt ? 1 : 0]);

/* ---- sčítání: instance účinků na postavě ({n, l, od, …}) → jen ty, které platí; každá dostane definici e ---- */
function ucSecti(L) {
  const R = [],
    M = new Map();
  for (const b of L || []) {
    const n = kzJm(b.n),
      e = UCINKY[n];
    if (!e) continue;
    const o = Object.assign({}, b, {n, l: b.l != null ? b.l : kzSt(b.n), e});
    if (e.scit) {
      R.push(o);
      continue;
    }
    const j = M.get(n);
    if (j == null) {
      M.set(n, R.length);
      R.push(o);
    } else if ((o.l || 0) > (R[j].l || 0)) R[j] = o;
  }
  return R;
}
/* AC z platných účinků: součet bonusů, nejnižší AC (Barkskin), základ bez zbroje (Mage Armor) */
function ucAC(B, sZbroji, agi) {
  const r = {ac: 0, min: 0, L: []};
  for (const b of B) {
    const e = b.e;
    if (e.ac) {
      r.ac += e.ac;
      r.L.push([b.n, e.ac]);
    }
    if (e.acmin) r.min = Math.max(r.min, e.acmin);
    if (e.acz && !sZbroji) r.min = Math.max(r.min, e.acz + (+agi || 0));
  }
  return r;
}
/* příspěvky do hodnot karty: t = zach | hp | rych | dov | ov, a = dovednost; zaklad = dosavadní součet (násobek rychlosti) */
function ucHodn(B, t, a, zaklad) {
  const R = [];
  for (const b of B) {
    const e = b.e;
    if (t === "zach" && e.zach) R.push([b.n, e.zach]);
    if (t === "hp" && e.hpmax) R.push([b.n, e.hpmax(b.l || 2)]);
    if (t === "rych" && e.rych) R.push([b.n, e.rych]);
    if (t === "dov" && e.dov && e.dov[a]) R.push([b.n, e.dov[a]]);
    if ((t === "dov" || t === "ov") && e.ov) R.push([b.n, e.ov]);
  }
  if (t === "rych") {
    const x = B.reduce((m, b) => Math.max(m, +b.e.rychX || 1), 1);
    if (x > 1) {
      const s = (+zaklad || 0) + R.reduce((q, [, v]) => q + v, 0),
        b = B.find(q => +q.e.rychX === x);
      R.push([`${b.n} ×${x}`, s * (x - 1)]);
    }
  }
  return R;
}
const UCTYPY = "Acid Bludgeoning Cold Fire Force Lightning Necrotic Piercing Poison Psychic Radiant Slashing Thunder".split(" ");
/* Resistance z platných účinků */
function ucRes(B) {
  const R = new Set();
  for (const b of B) {
    const r = b.e.res;
    (r === "vse" ? UCTYPY : r || []).forEach(t => R.add(t));
  }
  return [...R];
}
/* výhoda na záchrany vlastnosti ab: jména účinků, které ji dávají */
const ucAdv = (B, ab) => B.filter(b => (b.e.adv || []).includes(ab)).map(b => b.n);
/* druh hodu z popisu („Útok…“, „Záchrana…“, „Iniciativa“, jinak ověření) */
const ucTyp = co => (/^Útok/.test(co) ? "ut" : /^Záchrana/.test(co) ? "za" : /^Iniciativa/.test(co) ? "in" : "ov");
/* kostky, které se k hodu přičtou samy: N = jména účinků na postavě, typ = ut | za | ov | in, uzTah = jména kostek „jednou za tah“
   už použitých v tomto tahu (Set, pole nebo true = všechny). Různé kostky se sčítají, stejnojmenná jen jednou (N je množina jmen). */
function ucKostky(N, typ, uzTah) {
  const M = new Set([...(N || [])].map(kzJm)),
    uz = uzTah === true ? null : new Set(uzTah || []);
  return Object.entries(UCINKY)
    .filter(([n, e]) => e.kostka && !e.poHodu && M.has(n) && String(e.na).split(" ").includes(typ))
    .filter(([n, e]) => !(e.jednou === "tah" && (uz === null || uz.has(n))))
    .map(([n, e]) => ({n, x: e.kostka.replace(/^-/, ""), neg: e.kostka[0] === "-", jednou: e.jednou || ""}));
}
