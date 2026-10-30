/* @čisté – Losovací tabulky vypravěče (2026-10-30, Vojta): nápady na komplikaci při odmítnutém Pokušení a na dodatečný účinek
   Požehnání podle situace hodu, šepot Pokušení (co hlas za Závojem nabízí) a zvěsti v krčmě. Vlastní texty (ne SRD).
   ČISTÝ SOUBOR: jen data a výběr; náhodu dostává argumentem (r() → 0–1). Stránka (16o) je ukazuje v záznamu u Závoje
   a v záložce Nástroje řídicího pultu. Jména postav losuje generátor postav (09g). ===== */

/* situace hodu: klíč → název; podle ní se vybírá tabulka */
const TABSIT = {
  utok: "Útok zbraní",
  kouzlo: "Kouzlo",
  telo: "Tělo a obratnost",
  mysl: "Smysly a vědění",
  spol: "Řeč a jednání",
  divocina: "Divočina a zvířata",
};
/* dovednost či název hodu → situace (anglicky i česky, jak je píše karta a záznam) */
const TABDOV = [
  [/Athletics|Acrobatics|Stealth|Sleight of Hand|Atletik|Akrobaci|Nenápadn|Kapsář|STR|DEX/i, "telo"],
  [/Perception|Investigation|Arcana|History|Nature|Religion|Medicine|Vnímán|Pátrán|Mystik|Histori|Přírod|Náboženst|Lékař|INT/i, "mysl"],
  [/Persuasion|Deception|Intimidation|Insight|Performance|Přesvědč|Klamán|Zastraš|Vhled|Umění|CHA/i, "spol"],
  [/Survival|Animal Handling|Přežit|Ovládání zvířat|WIS/i, "divocina"],
];
/* situace podle textu hodu; útok kouzlem a útok zbraní mají přednost před dovedností */
function tabSituace(co, utok, kouzlo) {
  if (kouzlo) return "kouzlo";
  if (utok) return "utok";
  const s = String(co || "");
  for (const [re, k] of TABDOV) if (re.test(s)) return k;
  return "mysl";
}

/* Pokušení odmítnuto → komplikace (výsledek hodu platí, jen se něco přidá) */
const TABPOK = {
  utok: [
    "Čepel uvízne ve štítu či v trámu – vytrhnout ji stojí bonusovou akci.",
    "Řemínek zbroje povolí: do konce boje je o 1 AC méně, dokud ho někdo za akci neutáhne.",
    "Uklouzneš v krvi a blátě – po útoku zůstaneš Sražen (Prone).",
    "Rána odletí bokem a škrábne spojence vedle tebe (1k4 zranění typu zbraně).",
    "Tětiva praskne nebo se kuše zasekne – další výstřel až po akci na opravu.",
    "Nepřítel ti při výpadu vyrazí dech: do konce příštího tahu máš poloviční rychlost.",
    "Ztratíš rovnováhu a otevřeš kryt: příští útok proti tobě má výhodu.",
    "Rukojeť ti vyklouzne z mokré dlaně – zbraň leží u tvých nohou.",
    "Výkřik bolesti či zvonění zbraní přiláká další protivníky – do konce kola dorazí posila.",
    "Zbraň se ohne nebo vyštípne: až do opravy má −1 k hodům na zranění.",
    "Strhneš se příliš daleko a ocitneš se mezi dvěma nepřáteli.",
    "Krev ti vystříkne do očí – do konce příštího tahu máš nevýhodu na Vnímání.",
  ],
  kouzlo: [
    "Kouzlo zanechá ve vzduchu sirný pach a mráz – každý v okolí ví, odkud přišlo.",
    "Moc se vrátí do těla: utrpíš 1k4 psychického zranění.",
    "Plamínek svíce zhasne v okruhu 30 stop, zvířata se splaší.",
    "Na kůži ti naskočí rudý cejch, který vydrží do západu slunce – kněz ho pozná.",
    "Ozvěna kouzla zaskřípe Závojem: u příštího hodu padá Pokušení na 1–3.",
    "Soustředění se zachvěje – musíš hned hodit záchranu na CON se SO 10, jinak ho ztratíš.",
    "Ruka zmrtví: do konce příštího tahu nemůžeš provádět pohybové složky kouzel.",
    "Kouzlo zasáhne o kus vedle – rozbije něco cenného nebo posvátného.",
    "Hlas za Závojem si zapamatuje tvé jméno; někdo z druhé strany se o tebe začne zajímat.",
    "Krev z nosu a závrať: do konce příštího tahu máš nevýhodu na ověření INT.",
  ],
  telo: [
    "Prkno praskne a zvuk se nese daleko – stráž zbystří.",
    "Odřeš si dlaně do krve: do konce scény máš nevýhodu na Kapsářství a šplhání.",
    "Něco ti vypadne z brašny – drobná věc zůstane ležet na místě činu.",
    "Natrhneš si šlachu: do příštího krátkého odpočinku máš rychlost o 5 stop menší.",
    "Uspěješ, ale ušpiníš se tak, že tě každý pozná jako toho, kdo lezl kanálem.",
    "Pes se rozštěká, kohout zakokrhá, někdo rozsvítí v okně.",
    "Roztrhneš si oděv – prozradí tě kus látky na hřebíku.",
    "Pád tě stojí 1k6 drtivého zranění a chvíli nemůžeš popadnout dech.",
    "Svědek tě zahlédne jen na okamžik, ale dost na to, aby tě později poznal.",
    "Nástroj či lano se poškodí – při příštím použití selže, nebudeš-li ho spravovat.",
  ],
  mysl: [
    "Najdeš, co hledáš, ale někdo tě při tom pozoruje.",
    "Stopa vede i jinam – a ta druhá cesta tě láká víc, než by měla.",
    "Zapomeneš na jinou drobnost, kterou jsi měl na paměti (vypravěč ji připomene později).",
    "Zjištění tě vyděsí: do konce scény máš nevýhodu na záchrany proti strachu.",
    "Zaneseš do knihy či listiny skvrnu – majitel to pozná.",
    "Odpověď je pravdivá, ale neúplná; chybějící kus bude bolet.",
    "Při zkoumání se dotkneš něčeho, co se dotýkat nemělo – zbude po tom stopa na kůži.",
    "Hlava tě rozbolí tak, že do příštího odpočinku nemůžeš číst ani psát.",
    "Upoutáš pozornost někoho, kdo se o tom místě nechce nechat vyptávat.",
    "Uvidíš za Závojem víc, než jsi chtěl – v noci tě budí sny.",
  ],
  spol: [
    "Souhlasí, ale za protislužbu, kterou si řekne až později.",
    "Slova padnou, jenže je slyšel i ten, kdo je slyšet neměl.",
    "Urazíš někoho přítomného – nového nepřítele u stolu.",
    "Dotyčný ti uvěří, ale vypráví to dál po svém a přikrášlí to.",
    "Slib, který jsi musel dát, tě bude svazovat – porušit ho je křivá přísaha.",
    "Pověst o tobě dorazí dřív než ty: v příštím městě už tě znají.",
    "Dostaneš, co chceš, ale druhá strana od té chvíle čeká zradu.",
    "Svou lež musíš rozvést dál – příště ji bude těžší udržet.",
    "Zastrašený ustoupí, ale přivede bratry, švagry nebo cech.",
    "Výmluvnost tě strhne a prozradíš o sobě nebo o družině víc, než bylo moudré.",
  ],
  divocina: [
    "Najdeš cestu, ale zabere o polovinu víc času.",
    "Zvíře poslechne, ale kousne, kopne nebo uteče s kusem výbavy.",
    "Stopa je čerstvá – a stopař si tě všiml také.",
    "Voda, kterou najdeš, je kalná: kdo ji pije bez převaření, hází záchranu na CON se SO 10.",
    "Počasí se zhorší dřív, než čekáš; noc bude chladná a mokrá.",
    "Zavedeš družinu k posvátnému háji – Staří bohové si nepřejí rušení.",
    "Ulovíš zvěř na panském – hajný či lesník je na stopě.",
    "Kůň ztratí podkovu nebo začne kulhat.",
    "Tábořiště vybereš dobře, jen mravenci, komáři či vlci mají jiný názor.",
    "Upoutáš pozornost něčeho velkého, co v lese žije déle než lidé.",
  ],
};

/* Požehnání → dodatečný příznivý účinek (výsledek hodu platí, jen se něco přidá) */
const TABPOZ = {
  utok: [
    "Rána protivníka rozhodí: do konce jeho příštího tahu nemůže použít reakci.",
    "Vytlačíš ho o 5 stop dozadu a zaujmeš jeho místo.",
    "Zasáhneš přezku či řemen – štít nebo helma nepříteli spadne.",
    "Spojenec vedle tebe se povzbudí: jeho příští hod na útok má výhodu.",
    "Nepřítel zakolísá – příští útok kohokoli proti němu má výhodu.",
    "Ve chvíli rány uvidíš skulinu v sevření nepřátel; kdo z družiny chce, smí se hned pohnout o 5 stop bez příležitostného útoku.",
    "Houf zakolísá: pacholci vedle zasaženého hází na morálku, jako by padla polovina.",
    "Zbraň v ruce lehne jako peříčko – do konce kola máš +1 k AC.",
    "Vítr stočí šíp, slunce oslepí protivníka – míříš o krok přesněji: +1k4 ke zranění.",
    "Ozve se zvon nebo roh odněkud z dálky; nepřátelé zaváhají a ztratí odvahu.",
    "Krev nepřítele vystříkne na ostatní – ten nejbližší má do konce tahu nevýhodu na útoky.",
    "Zahlédneš slabinu: příští tvůj útok na tento cíl je kritický už na 19–20.",
  ],
  kouzlo: [
    "Kouzlo dozní tiše a čistě – nikdo nepozná, kdo ho seslal.",
    "Moc se vrátí jako teplo: získáš dočasné životy 1k6.",
    "Zář kouzla na okamžik ukáže i něco skrytého v okolí.",
    "Soustředění drží pevně: příští záchrana na udržení soustředění má výhodu.",
    "Kouzlo se šíří dál: můžeš zvolit jeden další cíl do 5 stop od původního (jen polovina účinku).",
    "Na rtech ti zůstane chuť medu a kadidla – do konce scény máš výhodu na Náboženství a Mystiku.",
    "Svíce okolo vzplanou jasněji; spojenci do 30 stop mají do konce kola výhodu na záchrany proti strachu.",
    "Kouzlo nechá po sobě znamení, které ti příště napoví (vypravěč řekne co).",
    "Závoj se na chvíli ztiší: příští hod se Závojem nemůže skončit Pokušením.",
    "Sesílání tě nestojí ani dech – v tomto tahu ti zbude bonusová akce, i když ji kouzlo spotřebovalo.",
  ],
  telo: [
    "Projdeš tak hladce, že za sebou můžeš provést i druha – stačí mu běžný hod.",
    "Cestou najdeš úkryt, průlez nebo zkratku, která se bude hodit.",
    "Při tom sebereš i něco navíc – drobnou cennost nebo listinu.",
    "Nikdo si nevšimne vůbec ničeho; stopy po tobě zmizí s deštěm.",
    "Dopadneš přesně tam, odkud vidíš na celé nádvoří.",
    "Tělo se rozehřeje: do konce scény máš výhodu na Atletiku.",
    "Zaslechneš rozhovor za stěnou – kus pravdy, který se hodí.",
    "Pohyb ti dá náskok: v příštím boji jdeš o slot dřív (Předstih).",
    "Najdeš zbraň či nástroj, který tu někdo zapomněl.",
    "Zvíře nebo dítě, které tě vidělo, se rozhodne tě neprozradit.",
  ],
  mysl: [
    "Kromě hledaného najdeš i druhou stopu, která vede k důležitější věci.",
    "Pochopíš, kdo za tím stojí – nebo aspoň, z kterého rodu pochází.",
    "Vzpomeneš si na verš, kázání či zápis, který tu věc vysvětlí.",
    "Všimneš si nebezpečí dřív, než nastane: družina se nedá zaskočit.",
    "Uvidíš za Závojem: poznáš, zda se tu něco Proměnilo.",
    "Zjištění ti dá jistotu: příští ověření na totéž téma má výhodu.",
    "Najdeš cenný předmět, který ostatní přehlédli (vypravěč určí, jak cenný).",
    "Spojíš dvě věci dohromady a vypravěč ti prozradí jednu pravdivou souvislost.",
    "Zjistíš, kdo tu byl před tebou a kdy.",
    "Svatý patron se ti připomene klidem v duši – zbavíš se jednoho strachu či zmatku.",
  ],
  spol: [
    "Získáš víc, než jsi žádal – drobný dar, doporučení nebo průvodce.",
    "Dotyčný ti prozradí i něco, na co ses neptal.",
    "Ostatní přítomní si tě zapamatují v dobrém; pověst družiny u jejich pána o stupeň stoupne, pokud to vypravěč uzná.",
    "Najdeš společnou řeč: ukáže se, že máte známého, příbuzného nebo patrona.",
    "Lež je tak přesvědčivá, že ji začne šířit i sám oklamaný.",
    "Zastrašený nejen ustoupí, ale prozradí, kdo ho poslal.",
    "Někdo z přihlížejících se k vám připojí – nadšenec, posel nebo zběhlý pacholek.",
    "Dostaneš zprávu, kterou by jinak družina čekala dny.",
    "Slib, který ti dají, má váhu přísahy – porušit ho je pro ně hřích.",
    "Získáš pozvání tam, kam se obvykle nedostaneš (dvůr, cech, klášter).",
  ],
  divocina: [
    "Najdeš zkratku: cesta zabere o čtvrtinu méně času.",
    "Ulovíš či nasbíráš víc, než stačí – jídlo na den pro celou družinu.",
    "Zvíře si k tobě vytvoří pouto a přijde, když ho zavoláš.",
    "Všimneš si stop dřív než ostatní: víte, kolik jich je, kdy tu byli a kam šli.",
    "Najdeš bezpečné tábořiště – noc bez nepříjemných setkání.",
    "Počasí se umoudří na celý den.",
    "Najdeš byliny, které uleví od ran: jedno ošetření Těžké rány bez hodu.",
    "Vítr ti přinese vůni kouře, zvěře nebo koní – víš, kdo se blíží.",
    "Staří bohové jsou ti nakloněni; pramen či háj tu nabídne krátké požehnání.",
    "Koně a mezci se zklidní; do konce dne máš výhodu na Ovládání zvířat.",
  ],
};

/* šepot Pokušení: co hlas za Závojem nabízí, když hráč váhá, zda Pokušení přijmout (přijetí = bod hříchu) */
const TABSEPOT = [
  "„Nech ho padnout. Nikdo se nedozví, žes mohl pomoci.“",
  "„Vezmi si víc, než ti patří. Zasloužil sis to.“",
  "„Lež. Pravda tu nikomu nepomůže, a tobě nejméně.“",
  "„Jen jednou se ohlédni zpátky – a uvidíš, co by mohlo být tvoje.“",
  "„Nech hněv vést tvou ruku. Je silnější než ty.“",
  "„Slib jim cokoli. Sliby se dají zapomenout.“",
  "„Ten, kdo tě urazil, si zaslouží víc než odpuštění.“",
  "„Napij se ještě. Strach odejde s vínem.“",
  "„Ukaž jim, kdo jsi a z jakého rodu. Ať se kloní.“",
  "„Udeř zezadu. Čest je pro ty, kdo si ji mohou dovolit.“",
  "„Nechej to být na zítra. Kdo by se staral.“",
  "„Ona se dívá. Proč ne? Kdo by to věděl?“",
];

/* zvěsti v krčmě: háčky pro vypravěče (obecné, bez skutečných osob – jména a rody doplní vypravěč) */
const TABZVESTI = [
  "Na blízké tvrzi prý svítí o půlnoci v kapli, ačkoli tam kněz léta nebyl.",
  "Kupci z Norimberka platí dvojnásob za každou šupinu, kterou kdo přinese.",
  "Mlynář u brodu viděl ve vodě ženu se zelenými vlasy – a od té doby mele jen v noci.",
  "Žoldnéři od Jiskry se vracejí z Uher a hledají nového pána; berou kohokoli, kdo platí.",
  "Z kláštera zmizela relikvie a opat obviňuje kališníky z vedlejší vsi.",
  "Na hradě se chystá svatba, ale nevěsta prý utekla s potulným pěvcem.",
  "Pocestní mluví o draku, který v horách nežere dobytek, ale krade zvony.",
  "Král prý svolá sněm a kdo nepřijede, přijde o léno.",
  "V lese za městem chodí mrtví lapkové a vybírají mýto jako za živa.",
  "Písař na radnici prodává opisy listin, které by neměl mít – a jedna z nich se týká vaší družiny.",
  "Kovář z podhradí ková meče, které prý samy hledají krev.",
  "Na tržišti se objevil muž, který věští z kostí – a zatím se mu všechno splnilo.",
  "Po bouři zbyl v poli kruh spálené trávy a v něm rytířská ostruha.",
  "Biskupovi posli se ptají na mladou bylinkářku z okraje vsi.",
  "Cech soukeníků tají, že jim zmizely tři vozy sukna na cestě do Vratislavi.",
  "Někdo vykopal hrob na starém pohřebišti a nechal v něm minci s neznámým králem.",
  "Na brodu se topí jen ti, kdo nepozdraví vodníka – starci to vědí, mladí se smějí.",
  "Zeman ze sousedství shání lidi na noc, kdy prý ‚přijde pro dlužné‘ – víc neřekne.",
  "Kališnický kazatel káže proti Proměněncům a lidé ho poslouchají až příliš ochotně.",
  "V horách se našla žíla stříbra; kdo ji drží, toho prý hlídá Permoník.",
];

/* n různých položek ze seznamu (bez opakování, je-li jich dost) */
function tabLos(L, n, r = Math.random) {
  const A = (L || []).slice(),
    o = [];
  const k = Math.min(Math.max(1, +n || 1), A.length);
  while (o.length < k) o.push(A.splice(Math.floor(r() * A.length) % A.length, 1)[0]);
  return o;
}
/* nápady pro Závoj: druh "pok" | "poz", situace z TABSIT */
function tabNapady(druh, sit, n = 3, r = Math.random) {
  const T = druh === "pok" ? TABPOK : TABPOZ;
  return tabLos(T[sit] || T.mysl, n, r);
}
