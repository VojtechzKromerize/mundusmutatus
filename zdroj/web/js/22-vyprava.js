/* ===== VÝPRAVA: cesta družiny podle pravidel Uncharted Journeys (stránka jen pro vypravěče) =====
   Mapy (Známý svět, Země Koruny, Praha) se při otevření stránky přestěhují sem a trasu měří jejich vlastní nástroj
   „Měřit cestu“; výchozí místo je vždy poloha družiny. Délka cesty se měří v hodinách na cestě.
   Počasí počítá vyPocasi() podle data a místa – stejný den a místo dají vždy stejné počasí, vypravěč ho může přehodit.
   Stav výpravy se ukládá do databáze (mm_vyprava_uloz, čte jen vypravěč), bez ní do prohlížeče. */
const VY_ZP = [
  ["pesky", "Pěšky", 30, 4],
  ["kun", "Na koni", 45, 7],
  ["vuz", "S vozem", 20, 3],
  ["posel", "Posel se střídáním koní", 90, 9],
  ["drak", "Na drakovi", 250, 0],
];
const VY_ODCH = [
  [0.75, "o čtvrtinu rychleji"],
  [1, "podle odhadu"],
  [1.25, "o čtvrtinu déle"],
  [1.5, "o polovinu déle"],
  [2, "dvakrát déle"],
];
const VY_TEMPO = {normal: ["Běžné tempo", 1], spech: ["Spěch", 0.85], opatrne: ["Opatrně", 1.15]};
const VY_DELKA = [
  [0, "Krátká cesta bez pravidel", 0],
  [1, "Krátká výprava", 1],
  [2, "Střední výprava", 2],
  [3, "Dlouhá výprava", 3],
  [4, "Velmi dlouhá výprava", 4],
];
const VY_KRAJ = {
  pole: ["Polnosti a vsi", "P"],
  les: ["Hvozdy", "L"],
  hory: ["Hory", "H"],
  mesto: ["Město", "M"],
  voda: ["Řeky a moře", "V"],
  stezky: ["Pohraničí a stezky", "K"],
  valka: ["Válkou zpustlý kraj", "W"],
  zavoj: ["Místa Závoje", "Z"],
};
const VY_ROLE = {
  vudce: {
    n: "Vůdce",
    sch: "<b>Povzbuzení.</b> Reakcí dovolí druhovi přehodit neúspěšné ověření nebo záchranu – u každého člena družiny jednou za výpravu.",
    hod: [
      "Charisma (Přesvědčování) – dodat druhům odvahy",
      "Moudrost (Vhled) – sebrat se před cestou",
      "Charisma (Vystupování) nebo hudební nástroj – píseň na cestu",
    ],
  },
  zved: {
    n: "Zvěd",
    sch: "<b>Najdi cestu.</b> Jednou za výpravu hodí na typ setkání také; vypravěč řekne oba typy a zvěd vybere, které nastane.",
    hod: ["Moudrost (Přežití) – prošlapat cestu", "Inteligence (Příroda) – poznat zvěř a byliny kraje", "Kartografické nástroje – nakreslit trasu"],
  },
  zasob: {
    n: "Zásobovač",
    sch: "<b>Zásoby.</b> Na začátku cesty dostane tolik kostek d6, kolik je jeho bonus zdatnosti. Reakcí přidá kostku k ověření druha (i po hodu, před vyhlášením výsledku).",
    hod: [
      "Síla nebo Odolnost (Atletika) – ponést část nákladu",
      "Kovářské nebo sedlářské nářadí – spravit výstroj",
      "Kuchařské náčiní nebo pivovarnické potřeby – teplé jídlo na cestu",
    ],
  },
  hlidka: {
    n: "Hlídka",
    sch: "<b>Bdělost.</b> Na začátku cesty dostane tolik kostek d6, kolik je její bonus zdatnosti. Reakcí přidá kostku k záchraně druha, nebo k jeho iniciativě na začátku boje.",
    hod: ["Moudrost (Vnímání) – první hlídka", "Obratnost (Nenápadnost) – zahladit stopy", "Převlek – nevypadat jako kořist"],
  },
};
/* přípravy (SO 13); o = obtížnost cesty při úspěchu, f = při neúspěchu, o5 = při úspěchu o 5 a víc */
const VY_PRIP = [
  {k: "pomoc", n: "Pomoc druhovi", h: "–", u: "Jiná postava hází svou přípravu s výhodou."},
  {
    k: "lektvar",
    n: "Lektvary a tinktury",
    h: "Inteligence (bylinkářská souprava, alchymie)",
    u: "Výhoda na ověření a záchrany Odolnosti, dokud v nich postava poprvé neselže.",
  },
  {
    k: "krcma",
    n: "Večer v krčmě",
    h: "Odolnost (Atletika, Vystupování, hra)",
    u: "Výhoda na ověření v 1. setkání; o 5 a víc navíc obtížnost −2.",
    o5: -2,
    f5t: "Neúspěch: nevýhoda v 1. setkání; o 5 a víc navíc bez odpočinku a nejvýš polovina kostek životů.",
  },
  {k: "trasa", n: "Rozvrhnout trasu", h: "Inteligence nebo Obratnost (kartografické nástroje)", u: "Obtížnost −5; neúspěch +2.", o: -5, f: 2},
  {
    k: "znameni",
    n: "Požehnání a znamení",
    h: "Inteligence nebo Moudrost (Náboženství, Arkána)",
    u: "Každý smí jednou za výpravu přehodit neúspěšnou záchranu.",
  },
  {
    k: "pruvodce",
    n: "Najmout průvodce",
    h: "– (platí se)",
    u: "Najatý pomocník obsadí volnou roli i s její schopností a má +3 na její hody. Cena podle délky: 10 / 35 / 90 / 200 zl.; za nebezpečí si může říct o obtížnost × 10 stříbrných.",
  },
  {k: "balit", n: "Sbalit náklad", h: "Síla nebo Odolnost (Atletika)", u: "Obtížnost −2.", o: -2},
  {k: "hostina", n: "Hostina na rozloučenou", h: "Moudrost nebo Charisma (kuchařské náčiní)", u: "Kdo by poprvé získal vyčerpání, nezíská ho."},
  {k: "soumar", n: "Soumaři", h: "Charisma (Pátrání) koupí, Síla nebo Moudrost (Zvládání zvířat) odchytem", u: "Obtížnost −2.", o: -2},
  {
    k: "kone",
    n: "Koně a jízdní zvířata",
    h: "Charisma (Pátrání) koupí, Obratnost (Nenápadnost) krádeží",
    u: "Každý má jízdní zvíře: obratné (Zvládání zvířat místo Obratnosti), otužilé (místo Odolnosti) nebo silné (místo Síly). Nezapomeň přepnout způsob cesty na koni.",
  },
  {
    k: "zasoby",
    n: "Opatřit zásoby",
    h: "Charisma (Pátrání), Moudrost (Přežití), nebo krádeží Obratnost",
    u: "Kostky zásob Zásobovače jsou d8 místo d6.",
  },
  {
    k: "povzbudit",
    n: "Povzbudit družinu",
    h: "Charisma (Vystupování)",
    u: "Vyber: inspirace pro všechny · +1 k ověřením · výhoda v 1. setkání · dočasné životy 2× bonus zdatnosti · +1 k záchranám.",
  },
  {k: "listiny", n: "Bádání v listinách a mapách", h: "Inteligence (Historie)", u: "Každý smí jednou za výpravu přehodit neúspěšné ověření."},
  {
    k: "rada",
    n: "Vyptat se místních",
    h: "Moudrost (Vhled) nebo Charisma (Přesvědčování)",
    u: "Výhoda na ověření a záchrany Moudrosti, dokud v nich postava poprvé neselže.",
  },
  {k: "pocasi", n: "Odhadnout počasí", h: "Inteligence nebo Moudrost (Příroda)", u: "Obtížnost −2.", o: -2},
];
const VY_TYPY = [
  {
    n: "Setkání na cestě",
    r: "Vůdce",
    jak: "Vůdce hodí Moudrost (Vhled): úspěch sníží SO skupinového hodu o 2, neúspěch zvýší o 2. Pak všichni Charisma (Přesvědčování) nebo Moudrost (Vhled); kdo lže, Charisma (Klam).",
    v: [
      "Dobrý dojem: poutníci prozradí něco cenného. Hoď k6 a nahraď příští setkání: 1–3 Div přírody, 4 Staré vzpomínky, 5 Místo k odpočinku, 6 Skryté zásoby.",
      "Rozejdou se v dobrém a vymění si zprávy: každý má výhodu na příští ověření.",
      "Cizinci jsou zdrženliví a spěchají dál. Bez účinku.",
      "Družina je urazí; schválně ji pošlou špatnou cestou: přidej setkání (nebo rovnou Nesnáz na cestě, Hrozí nebezpečí či Krutý boj).",
    ],
  },
  {
    n: "Skryté zásoby",
    r: "Zásobovač",
    jak: "Všichni hodí Inteligence (Pátrání), Obratnost (Čachry) nebo Moudrost (Přežití). Zásobovač smí jednou nahradit cizí výsledek svým.",
    v: [
      "Bohatý úlovek: každý získá inspiraci nebo se zbaví úrovně vyčerpání; Zásobovač získá zpět 1 kostku zásob.",
      "Úleva: každý se zbaví jedné úrovně vyčerpání.",
      "Našli jen málo, právě tolik, kolik je hledání stálo. Bez účinku.",
      "Vyčerpávající marné hledání: každý získá úroveň vyčerpání.",
    ],
  },
  {
    n: "Nesnáz na cestě",
    r: "Zvěd",
    jak: "Zvěd hodí ověření podle záznamu: o 5 a víc = ostatní mají na záchranu výhodu, úspěch = normálně, neúspěch = nevýhoda. Pak každý sám záchranu Odolnosti.",
    v: [
      "(záchrany se vyhodnocují každému zvlášť) Kdo uspěl, prošel bez následků.",
      "Kdo uspěl, prošel bez následků.",
      "Kdo neuspěl, získá úroveň vyčerpání.",
      "Kdo neuspěl, získá úroveň vyčerpání.",
    ],
  },
  {
    n: "Prosba o pomoc",
    r: "Zásobovač",
    jak: "Všichni hodí ověření podle záznamu; Zásobovač smí jednou nahradit cizí výsledek. Družina smí pomoc odmítnout – pak si vypravěč ty lidi zapíše na později.",
    v: [
      "Zachránili je před neštěstím: Zásobovač získá kostku zásob, nebo je zavedou, kam družina míří (přidej setkání, typ si družina vybere), nebo slíbí pomoc a odměnu.",
      "Pomohli a každý jde dál: každý získá inspiraci.",
      "Snaha byla marná: každý ztratí inspiraci.",
      "Úplný nezdar, možná i horší než předtím: vyčerpání, ztráta kostky zásob, ztráta inspirace, nebo družina těm lidem ublíží – vyber, co sedí.",
    ],
  },
  {
    n: "Hrozí nebezpečí",
    r: "Hlídka",
    jak: "Všichni hodí Moudrost (Vhled), Moudrost (Vnímání) nebo Obratnost (Nenápadnost); Hlídka smí jednou nahradit cizí výsledek.",
    v: [
      "Nebezpečí odhalí včas: když dojde na boj, nepřítel je zaskočen.",
      "Bystřejší varují ostatní: nikdo není zaskočen.",
      "Nepřítel některé zaskočí: kdo neuspěl, je na začátku boje zaskočen.",
      "Vpadnou do pasti: celá družina je zaskočena a hází iniciativu s nevýhodou.",
    ],
  },
  {
    n: "Div přírody",
    r: "Vůdce",
    jak: "Všichni hodí záchranu Moudrosti; Vůdce smí jednou nahradit cizí výsledek.",
    v: [
      "Chvíle úžasu: každý získá inspiraci; vypravěč může přidat odměnu (výhoda na orientaci v kraji, kostka životů z průzračného pramene…).",
      "Krása dodá sil: každý má výhodu na příští ověření nebo záchranu.",
      "Jen další výhled na dlouhé cestě. Bez účinku.",
      "Družina si připadá malá a ztracená: každý ztratí inspiraci a má nevýhodu na příští ověření nebo záchranu.",
    ],
  },
  {
    n: "Lov na netvora",
    r: "Zvěd / Hlídka",
    jak: "Družina se rozhodne: stopovat (Moudrost (Přežití) nebo Inteligence (Příroda), Zvěd smí nahradit výsledek), nebo se vyhnout (Obratnost (Nenápadnost) nebo Moudrost (Vnímání), Hlídka smí nahradit výsledek).",
    v: [
      "Stopování: zastihnou tvora nepřipraveného – je zaskočen. Vyhýbání: proklouznou bez povšimnutí.",
      "Stopování: zastihnou tvora nepřipraveného – je zaskočen. Vyhýbání: proklouznou bez povšimnutí.",
      "Stopování: najdou doupě, ale tvor o nich ví – boj hned začíná. Vyhýbání: vlezou mu do doupěte, nebo je sám lovil – boj, družina je zaskočena.",
      "Stopování: najdou doupě, ale tvor o nich ví – boj hned začíná. Vyhýbání: vlezou mu do doupěte, nebo je sám lovil – boj, družina je zaskočena.",
    ],
  },
  {
    n: "Místo k odpočinku",
    r: "Zásobovač",
    jak: "Zásobovač hodí Moudrost (Přežití): o 5 a víc = skupinový hod s výhodou, úspěch = normálně, neúspěch = s nevýhodou. Pak všichni Odolnost (Vnímání) – vydržet na hlídce.",
    v: [
      "Klidná noc: výhody dlouhého odpočinku.",
      "Slušný spánek: výhody krátkého odpočinku.",
      "Neklidná noc bez užitku.",
      "Strašná noc (něco tu už bydlí, nebo se družina pohádá): každý získá úroveň vyčerpání – až po případném boji.",
    ],
  },
  {
    n: "Staré vzpomínky",
    r: "Vůdce",
    jak: "Všichni hodí Inteligence (Historie), kde se hodí Náboženství nebo Arkána; Vůdce smí jednou nahradit cizí výsledek.",
    v: [
      "Dějiny místa družinu nadchnou: v příštím setkání si každý přičítá k4 k ověřením, záchranám i útokům.",
      "Místo si zapíší do map a jdou dál. Bez účinku.",
      "Tíživé myšlenky na marnost minulých věků: nevýhoda na příští ověření.",
      "Zdrcení pomíjivostí všeho: každý ztratí inspiraci a v příštím setkání si odečítá k4 od ověření, záchran i útoků.",
    ],
  },
  {
    n: "Temné místo",
    r: "Zvěd, Vůdce",
    jak: "Zvěd hodí Moudrost (Přežití): o 5 a víc = záchrany s výhodou, úspěch = normálně, neúspěch = s nevýhodou. Pak všichni záchranu Moudrosti; Vůdce smí jednou nahradit cizí výsledek.",
    v: [
      "Najdou v sobě vzdor: každý získá zpět kostku životů.",
      "Hlavy skloněné, projdou bez úhony.",
      "Hrůza podlomí morálku: každý ztratí kostku životů.",
      "Děs, který je drží ještě dny: každý ztratí kostku životů a získá úroveň vyčerpání.",
    ],
  },
  {
    n: "Krutý boj",
    r: "Hlídka",
    jak: "Hlídka hodí Moudrost (Vnímání). Neúspěch: přepadení, družina je zaskočena. Úspěch: všichni hodí Obratnost (Nenápadnost) nebo Charisma (Klam) – připravit léčku.",
    v: [
      "Léčka vyjde: nepřítel je zaskočen a vypravěč může přidat účinek nástrah (sražení, zranění navíc).",
      "Družina je připravena: nepřítel je zaskočen.",
      "Promarněná příležitost: nikdo není zaskočen.",
      "Příprava trvala moc dlouho: boj začíná hned a družina je zaskočena.",
    ],
  },
  {
    n: "Řízení osudu",
    r: "Hlídka",
    jak: "Všichni hodí Charisma (Přesvědčování), Inteligence (Pátrání) nebo Moudrost (Vhled); Hlídka smí jednou nahradit cizí výsledek. Když dojde k boji, cizinec obvykle uteče a vrátí se jindy.",
    v: [
      "Družina vyzví tajemství, které cizinec skrývá.",
      "Družina vyzví tajemství, které cizinec skrývá.",
      "Pravé úmysly cizince zůstanou skryté.",
      "Pravé úmysly cizince zůstanou skryté.",
    ],
  },
];
/* záznamy setkání: r = kraje, kde se hodí (P pole, L les, H hory, M město, V voda, K pohraničí a stezky, W válkou zpustlý kraj, Z místa Závoje, * kdekoli), k = ověření */
/* záznamy setkání jsou v zdroj/obsah/vyprava-setkani.json – data má jen vypravěč (hráči dostanou prázdný seznam);
   r = kraje, kde se hodí (P pole, L les, H hory, M město, V voda, K pohraničí a stezky, W válkou zpustlý kraj, Z místa Závoje, * kdekoli),
   k = ověření, b = boj: id hotového setkání, nebo nepřátelé „6 houf-zoldneru; rotmistr-zoldneru“ */
const VYZAZ = /*@VYZAZ@*/ [];
const VY_ZAZ = (() => {
  const a = [];
  VYZAZ.forEach(x => {
    a[x.i] = x.z;
  });
  return a;
})();
const VY_PRIJ = [
  [2, "Nečekané nebezpečí", "Družina vejde do nebezpečí, o kterém neví (léčka, město v moru). Nepřátelé o ní vědí a mají aspoň kolo na přípravu."],
  [5, "Bezprostřední nebezpečí", "Družina dorazí doprostřed nebezpečí (požár, boj). Nikdo není zaskočen, ale nikdo se nestihne připravit."],
  [7, "Hrozící nebezpečí", "Nebezpečí právě začíná (poprava spojence, blížící se bouře). Družina má aspoň kolo na přípravu, než si jí kdo všimne."],
  [9, "Nebezpečno", "Hned nic nehrozí, ale hrozba je blízko (vojsko na pochodu). Odpočinek tu nejde, čas na přípravu ano."],
  [11, "Relativní bezpečí", "Nebezpečí je opodál (drak v kraji, upír po setmění). Krátký odpočinek ano, dlouhý ne."],
  [12, "Bezpečí", "Bezpečné místo daleko od nebezpečí. Krátký i dlouhý odpočinek bez rizika."],
];
const VY_ZAVOJ = [
  "Déšť má nazelenalý třpyt; kde dopadne na kámen, vyraší mech.",
  "Na hodinu ustane vítr i ptačí zpěv a vzduch voní železem.",
  "Za soumraku jsou na nebi dvě slunce – jedno z nich je jen odraz.",
  "Padá sníh, který netaje, ač je teplo.",
  "Bouře bez deště: blesky tančí po kostelních věžích.",
  "Na trávě leží krvavá rosa.",
  "Mlha, v níž jsou slyšet hlasy lidí, kteří tu nejsou.",
];

/* ---------- počasí ---------- */
const vyH = (...a) => {
  let h = 2166136261 >>> 0;
  const s = a.join("|");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};
const vyJG = (y, m, d) => {
  const a = Math.floor((14 - m) / 12),
    Y = y + 4800 - a,
    M = m + 12 * a - 3;
  return d + Math.floor((153 * M + 2) / 5) + 365 * Y + Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
};
const vyGreg = j => {
  const a = j + 32044,
    b = Math.floor((4 * a + 3) / 146097),
    c = a - Math.floor((146097 * b) / 4),
    d = Math.floor((4 * c + 3) / 1461),
    e = c - Math.floor((1461 * d) / 4),
    m = Math.floor((5 * e + 2) / 153);
  return [100 * b + d - 4800 + Math.floor(m / 10), m + 3 - 12 * Math.floor(m / 10), e - Math.floor((153 * m + 2) / 5) + 1];
};
/* den v roce podle skutečného (gregoriánského) kalendáře – juliánský 3. březen 1458 je klimaticky 12. březen */
const vyDoy = j => {
  const g = vyGreg(j);
  return j - vyJG(g[0], 1, 1) + 1;
};
const vySez = j => {
  const m = vyGreg(j)[1];
  return m === 12 || m < 3 ? 0 : m < 6 ? 1 : m < 9 ? 2 : 3;
};
/* průměry kolem 300 m n. m., o stupeň chladnější než dnes (počátek malé doby ledové) */
const VY_TMAX = [0, 2, 7, 12, 17, 21, 23, 22, 18, 12, 5, 1],
  VY_TMIN = [-6, -5, -2, 2, 7, 10, 12, 12, 8, 4, 0, -4];
const vyKlima = (A, doy) => {
  const x = (doy - 15.5) / 30.44,
    i = Math.floor(x),
    f = x - i,
    a = A[((i % 12) + 12) % 12],
    b = A[(((i + 1) % 12) + 12) % 12];
  return a + (b - a) * f;
};
const VY_REZ = {
  vyso: {n: "tlaková výše", w: [3, 2.5, 3, 3.5], ta: [-3, 0, 3, 0], p: 0.05, v: 0},
  zap: {n: "západní proudění", w: [3, 2.5, 2.5, 3], ta: [3, 0, -2, 1], p: 0.45, v: 2, typ: "prehanky"},
  fro: {n: "přechod fronty", w: [2, 2, 2, 2], ta: [1, 0, -1, 0], p: 0.85, v: 3, typ: "trvaly"},
  sev: {n: "severní vpád", w: [1.5, 2, 0.8, 1], ta: [-4, -4, -4, -4], p: 0.4, v: 2, typ: "prehanky"},
  jih: {n: "teplo od jihu", w: [0.8, 1, 1.5, 0.8], ta: [4, 4, 3, 4], p: 0.3, v: 1, typ: "bourky"},
  vych: {n: "mrazivá výše od východu", w: [1.5, 1, 0.7, 0.8], ta: [-7, -2, 2, -2], p: 0.05, v: 2},
  stre: {n: "níže od Jadranu", w: [0.3, 0.5, 0.6, 0.4], ta: [1, 0, -3, 0], p: 0.95, v: 1, typ: "vytrvaly"},
};
function vyRezPick(x, sez) {
  const ws = Object.entries(VY_REZ),
    tot = ws.reduce((a, [, r]) => a + r.w[sez], 0);
  let y = x * tot;
  for (const [k, r] of ws) {
    if ((y -= r.w[sez]) < 0) return k;
  }
  return "vyso";
}
/* počasí trvá několik dní: dny se dělí na epizody (v průměru asi 3 dny), každá má jednu povětrnostní situaci */
function vyRezim(j) {
  let s = j;
  for (let k = 0; k < 10 && vyH("ep", s) >= 0.32; k++) s--;
  let r = vyRezPick(vyH("rz", s), vySez(s));
  if (r === "fro" && j - s >= 1) r = vyH("pf", j) < 0.5 ? "zap" : "sev";
  if (r === "stre" && j - s >= 3) r = "zap";
  return r;
}
const VY_NIZ = [
  [14.2, 49.95, 15.9, 50.45],
  [16.2, 48.6, 17.6, 49.2],
  [16.9, 49.25, 17.6, 49.7],
  [15.8, 50.7, 18.2, 51.4],
  [13.8, 51, 15.2, 51.5],
  [12.9, 50.15, 13.6, 50.45],
];
function vyMisto(ll) {
  /* kor: dřívější obdélník Koruny (výchozí výška a nížiny beze změny); hory se od 2026-10-27 poznají v celém světě mapy (Alpy, Dinárské hory) */
  const [lo, la] = ll,
    kor = lo > 11.8 && lo < 19 && la > 48.5 && la < 51.3,
    svet = lo > 9.5 && lo < 23 && la > 44.4 && la < 55.4;
  let el = kor ? 380 : 250,
    hory = false,
    niz = false;
  if (svet && nearMountain(lo, la)) {
    el = 950;
    hory = true;
  } else if (kor && VY_NIZ.some(b => lo >= b[0] && lo <= b[2] && la >= b[1] && la <= b[3])) {
    el = 200;
    niz = true;
  }
  return {
    el,
    hory,
    niz,
    stin: lo > 13.3 && lo < 14.3 && la > 50.15 && la < 50.55,
    la,
    jih: la < 44.5,
    cell: Math.round(lo * 2) + ":" + Math.round(la * 2),
  };
}
const vyDat = j => {
  const [y, m, d] = fromJdn(j);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};
function vyZaklad(j, ll, more) {
  const o = ((VY && VY.pocasi) || (HRA && HRA.pocasiR) || {})[vyDat(j)] || {},
    salt = o.salt || 0,
    doy = vyDoy(j),
    sez = vySez(j),
    M = vyMisto(ll),
    gm = vyGreg(j)[1];
  const rz = salt ? vyRezPick(vyH("rz2", j, salt), sez) : vyRezim(j),
    r = VY_REZ[rz];
  const nT = (vyH("t", j, salt) - 0.5) * 5,
    adj = (M.el - 300) * 0.0065 + (M.la - 50) * 0.6;
  let tx = vyKlima(VY_TMAX, doy) + r.ta[sez] + nT - adj,
    tn = vyKlima(VY_TMIN, doy) + r.ta[sez] * 0.8 + nT * 0.6 - adj,
    mlha = false;
  const zp = gm >= 10 || gm <= 3;
  if ((rz === "vyso" || rz === "vych") && zp) {
    if (M.hory) {
      tx += 4;
      tn += 3;
    } else if (vyH("m", j, M.cell, salt) < (M.niz ? 0.7 : 0.4)) {
      mlha = true;
      tx -= 2;
    }
  }
  const pp = r.p * (M.hory ? 1.35 : 1) * (M.stin ? 0.65 : 1) * (M.niz ? 0.9 : 1) * (M.jih && sez === 2 ? 0.3 : 1),
    srz = vyH("p", j, M.cell, salt) < pp;
  let typ = null,
    int = 0,
    kroupy = false;
  if (srz) {
    const x = vyH("i", j, salt);
    int = r.typ === "vytrvaly" ? 3 : r.typ === "trvaly" ? (x < 0.4 ? 2 : 3) : x < 0.6 ? 1 : 2;
    typ = tx <= 1 ? "snih" : tx <= 3 ? "plucha" : (r.typ === "bourky" && tx >= 12) || (sez === 2 && tx >= 22 && x > 0.5) ? "bourka" : "dest";
    if (typ === "bourka") {
      int = Math.max(int, 2);
      kroupy = vyH("k", j, M.cell, salt) < 0.12;
    }
  }
  let v = r.v + (M.hory ? 1 : 0) + (more ? 1 : 0);
  if (rz === "fro" && sez !== 2 && vyH("w", j, salt) < 0.25) v = 4;
  if (typ === "bourka") v = Math.max(v, 3);
  v = Math.max(0, Math.min(4, v));
  return {j, rz, tx, tn, typ, int, kroupy, v, mlha, M, salt, o};
}
function vyPocasi(j, ll, more) {
  const P = vyZaklad(j, ll, more),
    pred = [1, 2, 3, 4, 5].map(d => vyZaklad(j - d, ll, more));
  /* sněhová pokrývka: sníh posledních dní, pokud mezitím neroztál */
  let snih = 0;
  if (P.tx < 3) {
    if (P.typ === "snih") snih += P.int;
    for (const q of pred) {
      if (q.tx >= 4) break;
      if (q.typ === "snih") snih += q.int;
    }
  }
  const mokro = [P, ...pred.slice(0, 2)].filter(q => q.typ && q.typ !== "snih").length,
    tani = P.tx > 3 && pred.slice(0, 3).some(q => q.typ === "snih" && q.tx < 2);
  const gm = vyGreg(j)[1];
  let blato = 0;
  if (P.tx > 0) {
    if (mokro >= 3 || tani || (P.int === 3 && P.typ === "dest")) blato = 2;
    else if (mokro >= 2 || (mokro && [3, 4, 11].includes(gm))) blato = 1;
  }
  const povoden = (P.rz === "stre" && pred[0].rz === "stre") || (tani && P.typ === "dest" && P.int >= 2);
  let w = 1;
  if (P.typ) {
    w += P.typ === "bourka" ? 3 : P.int;
    if (P.typ === "snih") w += 1;
  }
  if (P.kroupy) w += 1;
  if (P.v === 3) w += 1;
  if (P.v === 4) w += 3;
  if (P.mlha) w += 2;
  if (P.tx >= 30) w += 3;
  else if (P.tx >= 27) w += 2;
  if (P.tn <= -12) w += 3;
  else if (P.tn <= -6) w += 2;
  else if (P.tx < 0) w += 1;
  if (snih >= 5) w += 2;
  else if (snih >= 3) w += 1;
  w = Math.max(1, Math.min(10, w));
  const zav = vyH("zav", j, P.M.cell, P.salt) < 0.02 ? VY_ZAVOJ[Math.floor(vyH("zt", j) * VY_ZAVOJ.length)] : "";
  const R = Object.assign(P, {snih, blato, povoden, w, zav, rucne: P.o.v != null});
  if (P.o.v != null) {
    R.w = +P.o.v;
  }
  R.text = P.o.t || vyPopis(R);
  R.drak = vyDrak(R);
  return R;
}
const VY_VITR = ["bezvětří", "slabý vítr", "čerstvý vítr", "silný vítr", "vichřice"];
function vyPopis(P) {
  const sez = vySez(P.j),
    T = P.tx;
  const tep =
    T <= -8
      ? "krutý mráz"
      : T <= -1
        ? "mráz"
        : T <= 4
          ? "chladno"
          : T <= 10
            ? "chladno a vlhko"
            : T <= 17
              ? "svěže"
              : T <= 23
                ? "příjemně teplo"
                : T <= 28
                  ? "teplo"
                  : "úmorné vedro";
  let nebe;
  if (P.typ) {
    const I = Math.max(0, P.int - 1);
    nebe = {
      dest: ["mrholí", "prší", "leje jako z konve"][I],
      snih: ["poletuje sníh", "sněží", "husté sněžení"][I],
      plucha: "padá plucha, déšť se sněhem",
      bourka: P.kroupy ? "odpoledne bouřka s krupobitím" : "odpoledne se přižene bouřka",
    }[P.typ];
    if (P.rz === "zap" && P.typ !== "bourka") nebe = "přeháňky – " + nebe;
  } else
    nebe =
      {
        vyso: sez === 2 ? "jasno" : "jasno, slunce nízko",
        zap: "oblačno, slunce se střídá s mraky",
        fro: "zataženo",
        sev: "jasno, od severu táhnou mraky",
        jih: sez === 2 ? "jasno a dusno" : "jasno a nezvykle teplo",
        vych: "jasno a ostrý mráz",
        stre: "zataženo, těžká obloha",
      }[P.rz] || "oblačno";
  const v = P.v >= 2 ? ", " + VY_VITR[P.v] : P.v === 0 && !P.typ ? ", bezvětří" : "";
  const s = [`${nebe[0].toUpperCase() + nebe.slice(1)}, ${tep}${v}.`];
  if (P.mlha) s.push("Ráno hustá mlha v údolích, rozpouští se až k poledni.");
  if (P.snih >= 5) s.push("Leží hluboký sníh, bez sněžnic se jde těžko.");
  else if (P.snih >= 3) s.push("Leží sníh.");
  else if (P.snih > 0) s.push("Poprašek sněhu.");
  if (P.blato === 2) s.push("Cesty jsou rozbahněné, vozy zapadají.");
  else if (P.blato === 1) s.push("Na cestách bláto.");
  if (P.povoden) s.push("Řeky se vylévají, brody jsou neprůchodné.");
  return s.join(" ");
}
function vyDrak(P) {
  const a = [];
  if (P.typ === "bourka" || P.v === 4) a.push("let nebezpečný – vichřice a blesky");
  else {
    if (P.typ && P.typ !== "snih") a.push("mokré blány: let pomalejší a dlouhý let vyčerpává");
    if (P.typ === "snih" || (P.tx <= 0 && P.typ)) a.push("ve výšce namrzá led");
    if (P.tn <= -6) a.push("mráz draky vyčerpává");
    if (P.v === 0) a.push("bezvětří: dlouhokřídlí těžko vzlétají");
    if (P.mlha) a.push("v mlze se letí naslepo");
  }
  return a.join("; ");
}
/* rychlost postupu v daný den (1 = podle odhadu) */
function vyRychl(P, zp, more) {
  if (more) return P.v === 4 ? 0.6 : 1;
  if (zp === "drak") return P.typ === "bourka" || P.v === 4 ? 0 : P.typ ? 0.8 : P.mlha ? 0.7 : 1;
  const vuz = zp === "vuz";
  let f = 1;
  if (P.blato === 1) f *= vuz ? 0.7 : 0.85;
  if (P.blato === 2) f *= vuz ? 0.5 : 0.7;
  if (P.snih >= 5) f *= vuz ? 0.4 : 0.6;
  else if (P.snih >= 3) f *= vuz ? 0.6 : 0.75;
  if (P.v === 4) f *= 0.8;
  if (P.povoden) f *= 0.85;
  return f;
}
/* délka dne: východ a západ slunce (místní čas podle slunce) */
function vyDen(j, la) {
  const d = (-23.44 * Math.cos(((2 * Math.PI) / 365) * (vyDoy(j) + 10)) * Math.PI) / 180,
    x = -Math.tan((la * Math.PI) / 180) * Math.tan(d),
    w = (Math.acos(Math.max(-1, Math.min(1, x))) * 180) / Math.PI / 15;
  return [12 - w, 12 + w];
}
const vyHod = h => {
  const H = Math.floor(h),
    m = Math.round((h - H) * 60);
  return m ? `${H}:${String(m).padStart(2, "0")}` : `${H}:00`;
};

/* ---------- stav výpravy ---------- */
let VY = null,
  VYT = null,
  VYS = null,
  VY_NACTENO = false,
  VY_LOK = false;
const VY_NOVA = () => ({
  v: 1,
  mapa: "koruna",
  z: null,
  do: null,
  zp: "pesky",
  odch: 1,
  zdrz: 0,
  start: null,
  teren: null,
  pocasiV: null,
  nepritel: 0,
  nepritelS: false,
  tempo: "normal",
  rychle: false,
  rychleK: null,
  hratKratkou: false,
  druzina: null,
  setk: [],
  navic: 0,
  odp: false,
  gc: null,
  kostky: null,
  vudce: {},
  najdi: false,
  konec: {vys: "", prij: null, mou: 1, pozn: ""},
  hotovo: false,
  pocasi: {},
  tab: {},
  tabT: 0,
  noc: {},
  stul: false,
  pocHraci: false,
  revir: false,
});
const vyId = () => Math.random().toString(36).slice(2, 9);
function vyDruzina() {
  if (!VY.druzina || !VY.druzina.length) {
    const n = PARTY.length ? PARTY.map(p => p.n.replace(/^✦\s*/, "")) : ["", "", "", ""];
    VY.druzina = n.map((x, i) => ({
      id: vyId(),
      n: x,
      role: "",
      role2: "",
      bz: 2,
      prip: "",
      pv: "",
      gc: "",
      hod: 0,
      vira: (PARTY[i] && PARTY[i].faith) || "",
    }));
  }
  return VY.druzina;
}
let vyTm = 0;
function vyUloz() {
  clearTimeout(vyTm);
  vyTm = setTimeout(vyUlozHned, 700);
}
async function vyUlozHned() {
  clearTimeout(vyTm);
  if (!VY) return;
  if (window.MMDB && !VY_LOK) {
    try {
      await MMDB.gm("mm_vyprava_uloz", {p_stav: VY});
      return;
    } catch (e) {
      if (e.status === 404 || /mm_vyprava|function|schema cache/i.test(e.message)) {
        VY_LOK = true;
        mmHlasG(
          "Databáze zatím neumí ukládat výpravu – spusť v Supabase aktuální supabase/schema.sql. Do té doby se výprava ukládá jen v tomto prohlížeči.",
          9000,
        );
      } else {
        mmHlasG("Výpravu se nepodařilo uložit: " + e.message, 6000);
        return;
      }
    }
  }
  try {
    localStorage.setItem("mm-vyprava", JSON.stringify(VY));
  } catch (e) {}
}
async function vyNacti() {
  if (VY_NACTENO) return;
  let s = null;
  if (window.MMDB) {
    try {
      s = await MMDB.gm("mm_vyprava_nacti");
    } catch (e) {
      VY_LOK = true;
    }
  }
  if (!s) {
    try {
      s = JSON.parse(mmDex(localStorage.getItem("mm-vyprava")) || "null");
    } catch (e) {}
  }
  VY = Object.assign(VY_NOVA(), s || {});
  VY.konec = Object.assign(VY_NOVA().konec, VY.konec || {});
  VY_NACTENO = true;
}

/* ---------- návrat cest a času (2026-10-18): před každou změnou času, místa nebo cesty se uloží předchozí stav
   (posledních 20, ve stavu výpravy jen pro vypravěče); Zpět ho vrátí i s časem, Vynulovat smaže stopu cest na mapách ---------- */
const HRAKL = ["datum", "hodina", "misto", "praha", "cesta", "poloha", "putovani", "stopaOd", "nikde"];
async function hraZpetZapis(popis) {
  if (!GMV || !window.MMDB || !HRA) return;
  try {
    await vyNacti();
  } catch (e) {}
  if (!VY) return;
  const o = {cas: Date.now(), popis: String(popis || "").slice(0, 80)};
  HRAKL.forEach(k => {
    o[k] = HRA[k] !== undefined ? JSON.parse(JSON.stringify(HRA[k])) : null;
  });
  const L = VY.zpet || [],
    p = L[L.length - 1];
  if (p && HRAKL.every(k => JSON.stringify(p[k]) === JSON.stringify(o[k]))) return;
  VY.zpet = [...L, o].slice(-20);
  await vyUlozHned();
}
const hraZpetTxt = o => {
  let d = "";
  try {
    const [y, m, dd] = String(o.datum || "")
      .split("-")
      .map(Number);
    d = y ? `${dd}. ${MES[m - 1]} ${y}` : "";
  } catch (e) {}
  return `${d}${o.hodina != null ? `, ${o.hodina}:00` : ""}${o.cesta ? ` · na cestě ${o.cesta.z} → ${o.cesta.do}` : o.misto ? ` · ${o.misto}` : ""}`;
};
async function hraZpet(i) {
  if (!GMV) return;
  if (!window.MMDB) {
    mmHlasG("Herní stav lze vracet jen na webu napojeném na databázi.");
    return;
  }
  try {
    await vyNacti();
  } catch (e) {}
  const L = (VY && VY.zpet) || [];
  if (!L.length) {
    mmHlasG("Není co vracet – zatím se neuložila žádná změna času ani cesty.", 4000);
    return;
  }
  const k = i == null ? L.length - 1 : +i,
    o = L[k];
  if (!o) return;
  if (!confirm(`Vrátit družinu do stavu před „${o.popis}“?\n${hraZpetTxt(o)}\n(Čas, místo, probíhající cesta i stopa cest na mapách.)`)) return;
  const h = {};
  HRAKL.forEach(x => {
    h[x] = o[x] === undefined ? null : o[x];
  });
  document.documentElement.classList.add("gmbusy");
  try {
    HRA = await MMDB.nastavHru(h);
    __D.HRA = HRA;
    VY.zpet = L.slice(0, k);
    await vyUlozHned();
    hraPo();
    if (curView === "vyprava") renderVyprava();
    mmHlasG(`Vráceno: ${hraZpetTxt(HRA)}.`, 5000);
  } catch (err) {
    mmHlasG("Nepodařilo se vrátit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
}
async function hraCestyVynuluj() {
  if (!GMV || !window.MMDB || !HRA) return;
  const c = HRA.cesta && HRA.cesta.track ? HRA.cesta : null;
  if (
    !confirm(
      `Vymazat stopu cest družiny na mapách?${c ? `\nProbíhající cesta ${c.z} → ${c.do} se zruší a družina zůstane v ${c.z}.` : ""}\nČas se nemění. Jde to vrátit tlačítkem Zpět.`,
    )
  )
    return;
  await hraZpetZapis("vynulování cest");
  const h = {putovani: null, cesta: null};
  if (c) Object.assign(h, {misto: c.z, poloha: null, praha: null});
  document.documentElement.classList.add("gmbusy");
  try {
    HRA = await MMDB.nastavHru(h);
    __D.HRA = HRA;
    hraPo();
    if (curView === "vyprava") renderVyprava();
    mmHlasG("Stopa cest na mapách vymazána.", 4000);
  } catch (err) {
    mmHlasG("Nepodařilo se uložit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
}
/* družina zatím nikde (2026-10-28, Vojta: zkušební cesty pryč, tažení ještě nezačalo): smaže místo, polohu, cesty i stopu;
   mapy ji ukážou, až dostane místo nebo vyrazí (hraUloz zruší značku nikde). Zápisy Kroniky zůstávají; vrátit jde Zpět. */
async function hraDruzinaNikde() {
  if (!GMV || !window.MMDB) {
    mmHlasG("Družinu lze přesunout jen na webu napojeném na databázi.");
    return;
  }
  if (
    !confirm(
      "Družina zatím nikde?\nSmaže se její místo, poloha v Praze, probíhající cesta i stopa cest na mapách.\nČas a zápisy Kroniky zůstanou. Jde to vrátit tlačítkem Zpět.",
    )
  )
    return;
  await hraZpetZapis("družina zatím nikde");
  document.documentElement.classList.add("gmbusy");
  try {
    HRA = await MMDB.nastavHru({misto: null, poloha: null, praha: null, cesta: null, putovani: null, stopaOd: null, nikde: true});
    __D.HRA = HRA;
    hraPo();
    if (curView === "vyprava") renderVyprava();
    mmHlasG("Družina zatím na mapách není – ukáže se, až dostane místo nebo vyrazí.", 5000);
  } catch (err) {
    mmHlasG("Nepodařilo se uložit: " + err.message, 7000);
  } finally {
    document.documentElement.classList.remove("gmbusy");
  }
}
function hraZpetHtml() {
  const L = ((VY && VY.zpet) || []).slice().reverse();
  return `<details class="bjapd vyzpet"><summary>Cesty a čas družiny – vrátit nebo vynulovat${L.length ? ` <small>(${L.length})</small>` : ""}</summary>
    <p class="rsmall">Před každou změnou času, místa nebo cesty se uloží předchozí stav (posledních 20). Vrácení vrátí i herní čas.</p>
    ${
      L.length
        ? `<ul class="khist">${L.map(
            (o, j) =>
              `<li><small>${(() => {
                try {
                  return new Date(o.cas).toLocaleString("cs-CZ", {day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit"});
                } catch (e) {
                  return "";
                }
              })()}</small> <span>před: <b>${besc(o.popis)}</b> → ${besc(hraZpetTxt(o))}</span> <button type="button" class="gbtn ghost" data-vyzpet="${L.length - 1 - j}">Vrátit sem</button></li>`,
          ).join("")}</ul>`
        : `<p class="rsmall">Zatím nic k vrácení.</p>`
    }
    <p><button type="button" class="gbtn ghost" data-vyzpet="">↶ Zpět o krok</button> <button type="button" class="gbtn ghost" data-vynuluj>Vynulovat stopu cest na mapách</button> <button type="button" class="gbtn ghost" data-vynikde>Družina zatím nikde</button></p></details>`;
}
document.addEventListener("click", e => {
  const t = e.target.closest && e.target.closest("[data-vyzpet],[data-vynuluj],[data-vynikde]");
  if (!t || !GMV) return;
  if (t.matches("[data-vynikde]")) {
    hraDruzinaNikde();
    return;
  }
  if (t.matches("[data-vynuluj]")) {
    hraCestyVynuluj();
    return;
  }
  hraZpet(t.dataset.vyzpet === "" ? null : +t.dataset.vyzpet);
});
