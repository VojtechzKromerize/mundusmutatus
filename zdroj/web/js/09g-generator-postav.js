/* @čisté – Generátor postav doby (2026-10-28, Vojta: „rychlý generátor postav do Při hře“): dobové jméno podle země, stav, věk,
   vyznání, řeč, povaha, vzhled a co postava chce. Náhodu dostává argumentem (r() → 0–1), takže je testovatelný; stránka (09, Při hře)
   jen volá genPostava. Jména jsou běžná jména 15. století – ne skutečné rody (přídomky jsou obecná místní jména). ===== */
const GENJM = {
  cs: {
    m: "Jan Jiří Václav Mikuláš Petr Pavel Martin Ondřej Matěj Jakub Šimon Bohuslav Zdeněk Jaroslav Hynek Vilém Jindřich Prokop Kunrát Mareš Vít Vavřinec Havel Bartoš Blažej Duchek Jíra Linhart Řehoř Štěpán Tomáš Beneš Bušek Diviš Hanuš Jakeš Klimeš Matouš Mikeš".split(
      " ",
    ),
    z: "Kateřina Anna Markéta Dorota Ludmila Barbora Mandalena Johanka Eliška Kunhuta Anežka Machna Ofka Ženka Bětka Marta Apolena Voršila Hedvika Kristina".split(
      " ",
    ),
    p: "Kovář Švec Krejčí Mlynář Řezník Pekař Koželuh Bednář Tesař Hrnčíř Rybář Sládek Pšenička Novák Dvořák Svoboda Černý Malý Veliký Kulhavý Hlava Kohout Vrabec Liška Zajíc Holub Kos Vlk Beránek Bílý".split(
      " ",
    ),
    d: "z Lhoty|z Újezda|z Chlumu|z Hrádku|z Doubravice|z Bukoviny|z Březí|z Radostova|z Petrovic|z Vlkova|z Kněžic|ze Smrkova|z Bystřice|z Kamenice|ze Stránčic|z Olešné".split(
      "|",
    ),
    mesta: "z Kouřimi|z Čáslavi|z Hradce|z Klatov|z Litomyšle|z Žatce|z Domažlic|z Písku|z Kutné Hory|z Chrudimi|z Mělníka|z Prahy".split("|"),
  },
  de: {
    m: "Hans Peter Niklas Kunz Heinz Ulrich Jakob Michel Lorenz Jörg Wolfgang Sigmund Fritz Martin Oswald Erhart Wenzel Paul Matthes Konrad".split(
      " ",
    ),
    z: "Anna Grete Kathrein Barbara Else Dorothea Agnes Ursula Magdalena Ottilie Kunigunde Margarethe".split(" "),
    p: "Schmied Müller Becker Fleischer Schneider Weber Bauer Fischer Wagner Zimmermann Gerber Kremer Vogt Lang Klein Schwarz Weiß Hofmann Krause Richter Sachs Hübner Seidel".split(
      " ",
    ),
    d: "von Steinbach|von Lichtenau|von Rosenthal|von Falkenau|von Waldau|von Eichberg|von Hohenfels|von Birkenfeld|von Lindenau|von Schönau".split(
      "|",
    ),
  },
  hu: {
    m: "János György László Péter Miklós István Mihály Pál Benedek Antal Balázs Gergely Imre Tamás Ferenc Simon".split(" "),
    z: "Katalin Erzsébet Anna Ilona Margit Borbála Dorottya Orsolya Zsófia Magdolna".split(" "),
    p: "Kovács Szabó Nagy Kis Tóth Horváth Németh Fekete Fehér Molnár Varga Takács Juhász Halász Bíró Szűcs".split(" "),
    d: "Vásárhelyi Somlyai Diósi Nagyfalvi Hegyesi Pataki Dobi Berényi Tarkői Szentmártoni".split(" "),
  },
  pl: {
    m: "Jan Mikołaj Piotr Stanisław Jakub Wojciech Maciej Andrzej Paweł Marcin Zbigniew Jarosław Dobiesław Spytek Sędziwój Klemens".split(" "),
    z: "Katarzyna Anna Małgorzata Dorota Jadwiga Elżbieta Agnieszka Barbara Zofia Helena".split(" "),
    p: "Kowal Szewc Krawiec Młynarz Piekarz Rzeźnik Mały Czarny Wilk Wróbel Kozieł Biały Rybak Bednarz".split(" "),
    d: "z Dąbrowy|z Woli|z Brzezia|z Lipnicy|z Bystrzycy|z Rudy|z Kamienia|z Górki|z Łąki|z Olszyny".split("|"),
  },
};
/* země: [název, podíly jazyků na venkově, podíly ve městech, podíly vyznání [kališník, katolík, kolísající]] */
const GENZEME = {
  cechy: ["Čechy", {cs: 1}, {cs: 0.7, de: 0.3}, [0.55, 0.35, 0.1]],
  morava: ["Morava", {cs: 0.9, de: 0.1}, {cs: 0.5, de: 0.5}, [0.35, 0.55, 0.1]],
  slezsko: ["Slezsko a Lužice", {de: 0.5, pl: 0.3, cs: 0.2}, {de: 0.85, cs: 0.15}, [0.05, 0.9, 0.05]],
  nemecko: ["Německé země", {de: 1}, {de: 1}, [0, 1, 0]],
  uhry: ["Uhry", {hu: 0.75, cs: 0.25}, {hu: 0.5, de: 0.5}, [0.03, 0.95, 0.02]],
  polsko: ["Polsko", {pl: 1}, {pl: 0.8, de: 0.2}, [0, 1, 0]],
};
/* stavy: [mužský název, ženský název, statblok SRD (Do scény), mesto (město, ne venkov), d (šlechta), k (duchovní), věk od–do] */
const GENSTAV = {
  sedlak: ["sedlák", "selka", "srd-commoner", 0, 0, 0, 16, 65],
  celed: ["čeledín", "děvečka", "srd-commoner", 0, 0, 0, 13, 40],
  remeslnik: ["řemeslník", "řemeslnice", "srd-commoner", 1, 0, 0, 16, 60],
  mestan: ["měšťan", "měšťka", "srd-commoner", 1, 0, 0, 22, 70],
  kupec: ["kupec", "kupcová", "srd-commoner", 1, 0, 0, 20, 60],
  krcmar: ["krčmář", "krčmářka", "srd-commoner", 0, 0, 0, 20, 65],
  zoldner: ["žoldnéř", "markytánka", "srd-warrior-infantry", 0, 0, 0, 17, 50],
  lapka: ["lapka", "lapkyně", "srd-bandit", 0, 0, 0, 16, 45],
  bric: ["biřic", "strážná", "srd-guard", 1, 0, 0, 18, 55],
  zeman: ["zeman", "zemanka", "srd-knight", 0, 1, 0, 16, 65],
  pan: ["pán", "paní", "srd-noble", 0, 1, 0, 18, 70],
  knez: ["kněz", "jeptiška", "srd-priest-acolyte", 0, 0, 1, 24, 75],
  poutnik: ["poutník", "poutnice", "srd-commoner", 0, 0, 0, 16, 75],
  posel: ["posel", "poselkyně", "srd-scout", 0, 0, 0, 16, 45],
  kejklir: ["kejklíř", "kejklířka", "srd-commoner", 0, 0, 0, 14, 55],
};
const GENREMESLO = {
  cs: "kovář švec krejčí pekař řezník koželuh bednář tesař hrnčíř sládek tkadlec zámečník".split(" "),
  z: "přadlena pradlena švadlena pekařka perníkářka tkadlena".split(" "),
};
/* povaha, vzhled a přání: {mužský|ženský} tvar podle pohlaví postavy (genRod) */
const GENPOVAHA = [
  "podezírav{ý|á} k cizincům, ptá se, odkud kdo jde",
  "upovídan{ý|á}, rád{|a} pomlouvá sousedy",
  "zbožn{ý|á}, každou druhou větu proloží modlitbou",
  "lakom{ý|á}, smlouvá o každý groš",
  "dobrosrdečn{ý|á}, ale prost{ý|á}",
  "chvástav{ý|á}, všechno prý zažil{|a} dřív a lépe",
  "ustrašen{ý|á}, všude vidí znamení Závoje",
  "nedůvěřuje kněžím ani pánům",
  "pije víc, než snese, a pak zpívá",
  "dychtí po novinkách z Prahy a od dvora",
  "zahořkl{ý|á}, válka {mu|jí} vzala blízké",
  "vtipkuje i v nesnázích",
  "zdvoři{lý|lá} až úlisn{ý|á}",
  "hrd{ý|á} na svůj rod a rád{|a} to připomene",
  "krátkozrak{ý|á}, mžourá na každého",
  "koktá, když se rozčílí",
  "netrpěliv{ý|á}, skáče do řeči",
  "mlčenliv{ý|á}, odpovídá jedním slovem",
  "pověrčiv{ý|á}, nosí amulet proti uhranutí",
  "zvědav{ý|á}, strká nos do cizích věcí",
  "poctiv{ý|á} až k vlastní škodě",
  "zbabě{lý|lá}, ale ochotně radí ostatním",
  "pyšn{ý|á} na své řemeslo či postavení",
  "uražen{ý|á} celým světem, pořád si stěžuje",
];
const GENVZHLED = [
  "zjizvená tvář",
  "chybějí {mu|jí} dva prsty na levé ruce",
  "rusé vlasy a pihy",
  "předčasně šedivé vlasy",
  "kulhá na jednu nohu",
  "nápadně vysok{ý|á} a huben{ý|á}",
  "zavalit{ý|á}, s rudými tvářemi",
  "šilhá",
  "opálen{ý|á} do bronzova od práce venku",
  "nosí {odřený kabátec po otci|odřené šaty po matce}",
  "páchne kouřem a koňmi",
  "na krku cínový křížek",
  "bezzubý úsměv",
  "jemné ruce, které nikdy nepracovaly",
  "jizva po spálenině na předloktí",
  "pečlivě učesan{ý|á}, šat o číslo větší",
  "zablácené boty až po kolena",
  "hluboký hlas, který nese daleko",
];
const GENCHCE = [
  "splatit dluh u lichváře, který už hrozí soudem",
  "najít zmizelého bratra, jenž odešel k bratříkům",
  "dostat se do Prahy, až bude Jiří korunován",
  "zbavit se nevítaného hosta, který se usadil v domě",
  "prodat koně za dobrou cenu a nedat se ošidit",
  "získat přímluvu u pána v dlouhém sporu o mez",
  "pomstít vypálený dvůr na lapkách z hradu",
  "ochránit dceru před žoldnéři, kteří táboří za vsí",
  "dozvědět se, co se děje u dvora, a výhodně to prodat",
  "odčinit starý hřích, o kterém nikdo neví",
  "najít léčitele pro nemocné dítě",
  "uniknout věřitelům, kteří už slídí po okolí",
  "dostat se do cechu, který cizí nerad přijímá",
  "zbavit se prokletí, o kterém věří, že přišlo se Závojem",
  "dopravit zapečetěný list, jehož obsahu se bojí",
  "vrátit ukradenou věc, než si krádeže někdo všimne",
  "najít ženicha či nevěstu, kterou rodina schválí",
  "zjistit, kdo v noci obchází kolem stavení",
];
const genRod = (t, zena) => t.replace(/\{([^|}]*)\|([^}]*)\}/g, (_, m, z) => (zena ? z : m));
const GENVIRA = ["kališník", "katolík", "kolísá mezi oběma stranami"];
const GENJAZ = {cs: "česky", de: "německy", hu: "uhersky", pl: "polsky"};

const genVyber = (L, r) => L[Math.floor(r() * L.length) % L.length];
function genVazeny(o, r) {
  let x = r() * Object.values(o).reduce((a, b) => a + b, 0);
  for (const [k, v] of Object.entries(o)) {
    x -= v;
    if (x < 0) return k;
  }
  return Object.keys(o)[0];
}
/* příjmení ženy podle mužského: Kovář → Kovářová, Černý → Černá, Vrabec → Vrabcová, Sládek → Sládková; německy Schmiedin, polsky Kowalowa */
function genZenske(p, jaz) {
  if (jaz === "de") return p + "in";
  if (jaz === "pl") return /y$/.test(p) ? p.replace(/y$/, "a") : p + "owa";
  if (jaz === "hu") return p;
  if (/ý$/.test(p)) return p.replace(/ý$/, "á");
  if (/í$/.test(p)) return p.replace(/í$/, "ová");
  if (/ec$/.test(p)) return p.replace(/ec$/, "cová");
  if (/ek$/.test(p)) return p.replace(/ek$/, "ková");
  if (/a$/.test(p)) return p.replace(/a$/, "ová");
  return p + "ová";
}
/* jedna postava: o = {zeme, stav, pohl} (prázdné = náhodně), r = generátor náhody 0–1 */
function genPostava(o, r = Math.random) {
  o = o || {};
  const zk = GENZEME[o.zeme] ? o.zeme : genVyber(Object.keys(GENZEME), r),
    sk = GENSTAV[o.stav] ? o.stav : genVyber(Object.keys(GENSTAV), r),
    Z = GENZEME[zk],
    S = GENSTAV[sk],
    zena = o.pohl === "z" ? true : o.pohl === "m" ? false : r() < 0.4,
    /* duchovní bývá česky či latinsky vzdělaný muž; jeptiška je u žen místo kněze */
    jaz = genVazeny(S[3] || S[4] ? Z[2] : Z[1], r),
    J = GENJM[jaz],
    krestni = genVyber(zena ? J.z : J.m, r);
  let jmeno;
  if (S[4]) jmeno = jaz === "hu" ? `${genVyber(J.d, r)} ${krestni}` : `${krestni} ${genVyber(J.d, r)}`;
  else if (S[5])
    jmeno = zena
      ? `sestra ${krestni}`
      : `${r() < 0.5 ? "kněz" : "bratr"} ${krestni}${jaz === "cs" && r() < 0.5 ? " " + genVyber(GENJM.cs.mesta, r) : ""}`;
  else {
    const p = genVyber(J.p, r);
    jmeno = jaz === "hu" ? `${p} ${krestni}` : `${krestni} ${zena ? genZenske(p, jaz) : p}`;
  }
  let stav = zena ? S[1] : S[0];
  if (sk === "remeslnik") stav = zena ? genVyber(GENREMESLO.z, r) : genVyber(GENREMESLO.cs, r);
  const vek = S[6] + Math.floor(r() * (S[7] - S[6] + 1)),
    vira = GENVIRA[["kal", "kat", "mix"].indexOf(genVazeny({kal: Z[3][0], kat: Z[3][1], mix: Z[3][2]}, r))],
    reci = [GENJAZ[jaz]];
  if (jaz !== "cs" && (zk === "cechy" || zk === "morava")) reci.push("česky lámaně");
  if (S[5] || S[4] || sk === "kupec") reci.push("latinsky");
  if (sk === "kupec" && jaz !== "de") reci.push("německy");
  return {
    jmeno,
    zena,
    stav,
    stavId: sk,
    zeme: Z[0],
    vek,
    vira: S[5] && vira === "kolísá mezi oběma stranami" ? "katolík" : vira,
    reci: [...new Set(reci)].join(", "),
    povaha: genRod(genVyber(GENPOVAHA, r), zena),
    vzhled: genRod(genVyber(GENVZHLED, r), zena),
    chce: genVyber(GENCHCE, r),
    b: S[2],
  };
}
