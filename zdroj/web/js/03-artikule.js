/* ---------- Artikule: pravidla tažení, rozdělená do knih a kapitol ---------- */
const AIMG = "art/";
const strip = s => String(s).replace(/<[^>]+>/g, "");
function tb(head, rows, cap, cls) {
  return `<div class="rtw"><table class="rtab${cls ? " " + cls : ""}">${cap ? `<caption>${cap}</caption>` : ""}<thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map(
      r =>
        `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row" data-l="${strip(head[0])}">${c}</th>` : `<td data-l="${strip(head[i])}">${c}</td>`)).join("")}</tr>`,
    )
    .join("")}</tbody></table></div>`;
}
const rq = (t, c) => `<blockquote class="rq"><p>„${t}“</p><cite>${c}</cite></blockquote>`;
const note = (t, h) => `<div class="rnote"><b>${t}</b> ${h}</div>`;
const xl = (ch, sec, t) => `<a href="#artikule/${ch}${sec ? "/" + sec : ""}">${t}</a>`;
const Z = {P: `<b class="zv zp">Pokušení</b>`, B: `<b class="zv zb">Požehnání</b>`};

/* ---------- Slovníček pojmů ---------- */
const GLOSS = [
  {
    id: "zavoj",
    t: "Závoj",
    ch: "zavoj",
    f: ["Závoj", "Závoje", "Závojem", "Závoji"],
    d: "Hranice mezi naším světem a světem jiným. Od Noci Proměny je protržený a každý čin smrtelníků váží bytosti za ním – křesťan řekne Bůh a ďábel, starověrec duchové míst a předků.",
  },
  {
    id: "noc",
    t: "Noc Proměny",
    ch: "zavoj",
    f: ["Noc Proměny", "Noci Proměny"],
    d: "Noc roku 1420 v době bitvy na Vítkově, kdy se roztrhl Závoj. Svět odhalil svou pravou podobu: probudila se magie, Staří bohové i draci a někteří lidé se proměnili.",
  },
  {
    id: "promenenci",
    t: "Proměněnci",
    ch: "vyznani",
    f: ["Proměněnci", "Proměněnec", "Proměněnců", "Proměněncem", "Proměněncům"],
    d: "Lidé, jejichž podobu změnila Noc Proměny. Kališnický feat víry <i>Pravda Páně</i> dokáže rozpoznat, zda je někdo ovlivněn Závojem.",
  },
  {
    id: "starobozi",
    t: "Staří bohové",
    ch: "vyznani",
    f: ["Staří bohové", "Starých bohů", "Starých Bohů", "Starým bohům", "Starého boha", "Starými bohy"],
    d: "Pohanská božstva Slovanů, Bójů a Markomanů, která Noc Proměny znovu probudila. Uctívají je starověrci; jejich přítomnost je cítit na posvátných místech – v hájích, u pramenů a mohyl.",
  },
  {
    id: "vyznani",
    t: "Vyznání",
    ch: "vyznani",
    f: [],
    d: "Víra postavy: <b>kališník</b>, <b>katolík</b>, nebo <b>starověrec</b>. Určuje Ctnosti a Neřesti, svátky i feat víry.",
  },
  {
    id: "kostka",
    t: "Kostka Závoje",
    ch: "zavoj",
    f: ["kostka Závoje", "kostku Závoje", "kostce Závoje", "kostky Závoje", "Kostka Závoje", "Kostku Závoje"],
    d: "k6 házená ke každému ověření (i k iniciativě) a hodu na útok, ne k záchranným hodům. 1–2 Pokušení, 3–4 nic, 5–6 Požehnání. Výsledek k20 nemění, jen něco přidává.",
  },
  {
    id: "pokuseni",
    t: "Pokušení",
    ch: "zavoj",
    f: ["Pokušení"],
    d: "Výsledek 1–2 na kostce Závoje. Kdo ho přijme, získá bod hříchu; kdo odmítne, čelí komplikaci.",
  },
  {
    id: "pozehnani",
    t: "Požehnání",
    ch: "zavoj",
    f: ["Požehnání"],
    d: "Výsledek 5–6 na kostce Závoje: dodatečný příznivý účinek. Na Požehnání se váží i některé šermířské techniky a perky zbraní.",
  },
  {
    id: "hodiny",
    t: "Hodiny Závoje",
    ch: "zavoj",
    f: ["Hodiny Závoje", "Hodinách Závoje", "Hodin Závoje"],
    d: "Půlnoc, poledne a hodina po večerním klekání (vždy jednu hodinu), slunovrat celý den. Závoj je nejtenčí a Pokušení padá už na 1–3.",
  },
  {
    id: "svatek",
    t: "Svátek",
    ch: "zavoj",
    f: [],
    d: "Den svátku podle vyznání postavy: svátky světců pro všechny křesťany (katolíky i kališníky), Mistr Jan Hus navíc pro kališníky, svátky starých bohů (např. vynášení Morany) pro všechny starověrce. Požehnání padá na všech hodech už na 4–6.",
  },
  {
    id: "hodina-pravdy",
    t: "Hodina Pravdy",
    ch: "zavoj",
    f: ["Hodina Pravdy", "Hodině Pravdy", "Hodinu Pravdy", "Hodiny Pravdy"],
    d: "Souběh Hodiny Závoje a svátku: Pokušení na 1–3, Požehnání na 4–6, nic neutrálního. Trvá vždy jen hodinu; přirozeně nastává o Filipojakubské a Svatojánské noci a o Půlnoční na Štědrý den.",
  },
  {
    id: "ctnosti",
    t: "Ctnosti a Neřesti",
    ch: "ctnosti",
    f: ["Ctnosti a Neřesti", "Ctnost", "Ctnosti", "Neřest", "Neřesti"],
    d: "Každá postava má jednu Ctnost (v čem je silná) a jednu Neřest (kde ji ďábel nejsnáze svede). Jednání podle nich přináší body hříchu či dobrých skutků i Hrdinskou inspiraci.",
  },
  {
    id: "hrich",
    t: "Všední a smrtelný hřích",
    ch: "ctnosti",
    f: ["Všední hřích", "všední hřích", "Smrtelný hřích", "smrtelný hřích", "bod hříchu", "body hříchu"],
    d: "Všední hřích dává 1 bod hříchu (proti vlastní Ctnosti 2). Smrtelný hřích – vražda bezbranného, zrada, mučení, křivá přísaha – sníží Svědomí okamžitě o 1 (proti Ctnosti o 2).",
  },
  {
    id: "skutek",
    t: "Dobré skutky",
    ch: "ctnosti",
    f: ["dobrých skutků", "Dobré skutky", "velký skutek", "Velký skutek"],
    d: "Jednání podle Ctnosti, které něco stojí, dává bod dobrých skutků. Skutečná oběť nebo riziko života je velký skutek: Svědomí +1 hned.",
  },
  {
    id: "svedomi",
    t: "Svědomí",
    ch: "svedomi",
    f: ["Svědomí"],
    d: "Hodnota 0–10 (začíná na 5) a čtyři stupně: Zatracený, Na scestí, Na vážkách, V milosti. Každý stupeň má výhody i nevýhody.",
  },
  {
    id: "zpytovani",
    t: "Zpytování svědomí",
    ch: "svedomi",
    f: ["Zpytování svědomí", "Zpytování Svědomí"],
    d: "Na konci sezení hod k10: body hříchu ≥ hod → Svědomí −1; dobré skutky ≥ hod → +1. Obojí může platit zároveň. Potom se body smažou a sbírají se znovu.",
  },
  {
    id: "feat",
    t: "Feat víry",
    ch: "vyznani",
    f: ["Feat víry", "feat víry", "featu víry", "Featu víry"],
    d: "Schopnosti vyznání o třech stupních; další stupeň postava získá příběhově. Zatracené postavě (Svědomí 0) přestávají fungovat.",
  },
  {
    id: "vydrz",
    t: "Výdrž",
    ch: "serm",
    f: ["Výdrž", "Výdrže", "Výdrží"],
    d: "Zdroj válečníků pro šermířské techniky a zápasnické chvaty, obnovuje se dlouhým odpočinkem. Fighter má Výdrž rovnou bonusu zdatnosti, ostatní bojová povolání polovinu.",
  },
  {
    id: "techniky",
    t: "Šermířské techniky a chvaty",
    ch: "serm",
    f: ["šermířské techniky", "šermířských technik", "zápasnické chvaty", "zápasnických chvatů"],
    d: "Bojové umění, které učí jen šermířští mistři – každý svou školu a jen toho, koho přijme. Stojí Výdrž a často i Požehnání.",
  },
  {
    id: "obetovani",
    t: "Obětování zbroje",
    ch: "vyzbroj",
    f: ["obětovat zbroj", "Obětování zbroje"],
    d: "Při kritickém zásahu smí postava obětovat zbroj nebo štít a kritický zásah se změní v běžný. Vycpávaná zbroj a štít vydrží 1×, kroužková 2×, plátová a komplexní 3×.",
  },
  {
    id: "kriticke",
    t: "Kritické zranění",
    ch: "kriticka",
    f: ["kritické zranění", "kritická zranění", "Kritické zranění", "Kritická zranění", "kritického zranění"],
    d: "S každým kritickým zásahem se hází na závažnost (k10) a zasaženou část těla (kostka Závoje). Následky sahají od zvonění v hlavě po useknutou paži.",
  },
  {
    id: "znameni",
    t: "Znamení návratu",
    ch: "zraneni",
    f: ["Znamení návratu", "Znamení Návratu"],
    d: "Stopa, kterou zanechá každé vzkříšení – neutuchající chlad, opožděný stín, jiná barva očí. Další vzkříšení běžným kouzlem už není možné.",
  },
  {
    id: "revenant",
    t: "Revenant",
    ch: "zraneni",
    f: ["Revenant"],
    d: "Zvláštní feat Navrácených, kteří se vrátili ze smrti. Zatím zahalen tajemstvím.",
  },
  {
    id: "pacholci",
    t: "Pacholci a houf",
    ch: "iniciativa",
    f: ["Pacholci", "pacholci", "pacholků", "houf", "houfu", "Houf"],
    d: "Nejslabší protivníci: 5 HP, zranění navíc přejde na dalšího pacholka; nehází Závoj. Bojují v houfech s jediným tahem a jediným hodem na útok; když padne polovina nebo velitel, prchají.",
  },
  {
    id: "sok",
    t: "Sok",
    ch: "iniciativa",
    f: ["Sok"],
    d: "Protivník s běžnými statistikami, hází Závoj a může znát techniky. Při kritickém zásahu obětuje zbroj; když nemá co obětovat, je poražen. Smí poslat pacholka do rány místo sebe.",
  },
  {
    id: "zhoubce",
    t: "Zhoubce",
    ch: "iniciativa",
    f: ["Zhoubce", "Zhoubci"],
    d: "Úhlavní protivník, který hraje podle stejných pravidel jako hráči. Díky Ďáblovu štěstí často unikne smrti.",
  },
];
const GCH = {
  ctnosti: "Ctnosti a hříchy",
  zavoj: "Závoj",
  svedomi: "Svědomí",
  vyznani: "Vyznání",
  iniciativa: "Iniciativa a protivníci",
  vyzbroj: "Výzbroj",
  serm: "Šerm a zápas",
  featy: "Featy",
  kouzla: "Kouzla a předměty",
  zraneni: "Zranění a smrt",
  kriticka: "Kritická zranění",
};
const ARTB = [
  {id: "vira", t: "Kniha první", n: "Víra", d: "Ctnosti a hříchy, Závoj, Svědomí a Vyznání – co se děje s duší postavy."},
  {id: "boj", t: "Kniha druhá", n: "Boj", d: "Iniciativa a protivníci, zbroj a zbraně, šerm a zápas, featy, kouzla a předměty."},
  {id: "rany", t: "Kniha třetí", n: "Rány", d: "Zranění, smrt, návrat a kritická zranění."},
  {id: "rejstrik", t: "Dodatek", n: "Rejstřík", d: "Slovníček pojmů, které Artikule používají."},
];
const ARTK = [
  /* ======== KNIHA I · VÍRA ======== */
  {
    id: "ctnosti",
    book: "vira",
    t: "Ctnosti a hříchy",
    img: "vira.webp",
    wide: 1,
    sum: "Jedna Ctnost a jedna Neřest, body hříchu a dobrých skutků.",
    q: ["Království Boží je ve Vás!", "Evangelium dle Lukáše (17, 21)"],
    intro: `<p>Království Boží je královstvím svědomí. Po Noci Proměny není víra pouhou kulisou, ale rozhodnutím, které bude vaši postavu provázet po celé dobrodružství. Určuje, co pro postavu představuje ctnost a co hřích, jak se od hříchu může očistit, a nakonec i to, zda hříchu podlehne, nebo se naopak v očích souvěrců stane světcem. Mistr Jan Hus kvůli svědomí odmítl odvolat své učení.</p>`,
    secs: [
      {
        id: "ctnosti-a-nerest",
        t: "Ctnosti a Neřesti",
        h: `
  <p>Každá postava si volí <b>jednu Ctnost a jednu Neřest</b>. Ctnost vyjadřuje, v čem je postava silná a na jakých hodnotách jí záleží. Neřest je její slabinou, kde ji ďábel nejsnáze svede na scestí. Jednání v souladu či rozporu s Ctností nebo Neřestí vede k zisku bodů hříchu či dobrých skutků.</p>
  ${tb(
    ["Ctnost", "Příklady", "Neřest", "Příklady"],
    [
      ["Pokora", "Přiznání chyby, služba Bohu", "<b>Pýcha</b>", "Neodpuštěná urážka cti, vychloubání se rodem, bohatstvím"],
      ["Štědrost", "Spravedlivá dělba kořisti, vykoupení zajatců, almužny chudým", "<b>Lakomství</b>", "Ponechání si kořisti, hrabivost, úplatky"],
      ["Laskavost", "Pomoc nepříteli či rodovému sokovi", "<b>Závist</b>", "Snaha škodit ostatním, zejména úspěšnějším"],
      ["Trpělivost", "Schopnost snést urážku, odpuštění prohřešků", "<b>Hněv</b>", "Výbuch hněvu, msta"],
      ["Cudnost", "Odolání fyzickým pokušením, schopnost ovládnout se", "<b>Chtíč</b>", "Podlehnutí touze po moci či rozkoši"],
      ["Střídmost", "Půst, střízlivost v nebezpečí", "<b>Obžerství</b>", "Nezřízená konzumace nápojů či jídla"],
      ["Píle", "Bdělost na stráži, dosažení úkolů a cílů", "<b>Lenost</b>", "Zanedbání povinností"],
    ],
    `<img src="${AIMG}klice.webp" alt="" loading="lazy">Křesťané <small>(kališníci i katolíci)</small>`,
    "pairs",
  )}
  ${tb(
    ["Ctnost", "Příklady", "Neřest", "Příklady"],
    [
      ["Pohostinství", "Povinnost chránit hosta jako vlastní rodinu", "<b>Zrada hosta</b>", "Ošizení hosta, ublížení hostu či hostiteli"],
      ["Pravdomluvnost", "Dostání slovu, i pokud to vede ke ztrátě", "<b>Křivopřísežnictví</b>", "Porušení přísahy"],
      ["Odvaha", "Postavení se silnějšímu soupeři", "<b>Zbabělost</b>", "Útěk a zanechání spojenců na holičkách"],
      ["Úcta k předkům", "Ctění hrobů a vzpomínky na předky", "<b>Nevděk</b>", "Hanobení hrobů, zlá slova o předcích"],
      ["Respekt", "Brát si od přírody jen tolik, kolik je třeba", "<b>Hamižnost</b>", "Plenění lesa, zbytečný lov"],
      ["Věrnost rodu", "Oplacení služby, ochrana rodu, pomsta křivd", "<b>Zrada rodu</b>", "Zapření krve, přidání se na stranu rodového protivníka"],
      [
        "Čest",
        "Boj tváří v tvář, přiznání se k prohřeškům, činy hodné písní",
        "<b>Intrikaření</b>",
        "Zabití potají, útok na bezbranného, pomluva za zády",
      ],
    ],
    `<img src="${AIMG}strom.webp" alt="" loading="lazy">Starověrci`,
    "pairs",
  )}`,
      },
      {
        id: "hrichy",
        t: "Hříchy a dobré skutky",
        h: `
  <p>Hříchy mají dvě podoby:</p>
  <ul class="rl">
   <li><b>Všední hřích</b> – drobné selhání: postava podlehne své Neřesti, dopustí se menšího prohřešku proti své víře nebo přijme ${Z.P} na kostce Závoje. Za každý takový hřích získá <b>1 bod hříchu</b>. Pokud tím jde proti vlastní Ctnosti, získá <b>2 body hříchu</b>.</li>
   <li><b>Smrtelný hřích</b> – čin, který duši poznamená okamžitě, například vražda bezbranného, zrada, mučení nebo křivá přísaha. Ve chvíli, kdy se stane, sníží <b>Svědomí o 1</b>. Pokud jde o smrtelný hřích proti vlastní Ctnosti, Svědomí klesne rovnou <b>o 2</b>.</li>
  </ul>
  <p>Podobně to funguje i u dobrých skutků. Když postava jedná podle své Ctnosti a něco ji to stojí, získá <b>bod dobrých skutků</b>. Když pro svou Ctnost podstoupí skutečnou oběť nebo riskuje život, je to <b>velký skutek</b> a Svědomí jí okamžitě vzroste o 1 stupeň.</p>
  <p>Drobná selhání tak duši nahlodávají pomalu a s trochou štěstí je lze přečkat bez úhony. Velká rozhodnutí ji ale mění hned a nevratně, ať už k lepšímu, nebo k horšímu. Body se zúčtují při ${xl("svedomi", "zpytovani", "Zpytování svědomí")}.</p>
  ${note("Hrdinská inspirace.", "Následování Ctnosti či podlehnutí Neřesti je pro postavu přirozené a odpovídá jejímu světonázoru. Pokud postava jedná v souladu se svou Ctností, nebo podlehne své Neřesti, získává Hrdinskou inspiraci (Heroic Inspiration).")}`,
      },
    ],
  },
  {
    id: "zavoj",
    book: "vira",
    t: "Závoj",
    img: "zavoj.webp",
    sum: "Kostka Závoje k hodu k20: Pokušení, nebo Požehnání. Hodiny Závoje a svátky.",
    q: [
      "Od protržení Závoje není mezi naším světem a peklem zeď, nýbrž plátno. Plátno plné děr. Každý náš čin nyní doprovází hlas. Nabízí požehnání – šíp, jenž vítr stočí, slovo, které samo přijde na jazyk. Jindy prokletí, které doprovází šepot příslibu spásy. Mnoho rytířů mi tvrdilo, že v bitvě cítili ruku na rameni. Ale čí byla?",
      "Spisy Vojtěcha z Kroměříže",
    ],
    intro: `<p>Závoj představuje hranici mezi naším světem a světem jiným. Po protržení Závoje je každý čin smrtelníků vážen Závojem, tedy bytostmi za Závojem. Kdo jsou tyto bytosti? Záleží, koho se zeptáte: křesťan řekne, že Bůh a ďábel, starověrec, že duchové míst a předků.</p>`,
    secs: [
      {
        id: "kostka",
        t: "Kostka Závoje",
        h: `
  <p>Ke každému ověření (i k iniciativě) a hodu na útok se vedle k20 hází i <b>kostka Závoje (k6)</b>; k záchranným hodům ne. Hod se vyhodnocuje standardně, Závoj k němu pouze přidává něco navíc:</p>
  ${tb(
    ["k6", "Závoj", "Následek"],
    [
      ["1–2", Z.P, "Pokud hráč Pokušení nepřijme, nastává dodatečná komplikace. Pokud ho přijme, získává bod hříchu."],
      ["3–4", "Bez efektu", "—"],
      ["5–6", Z.B, "Dodatečný pozitivní efekt."],
    ],
    "",
    "dice",
  )}
  <p>Požehnání ani Pokušení neruší základní výsledek hodu k20 (úspěch či neúspěch).</p>
  ${note("Příklad.", "Při neúspěšném ověření Vnímání s Požehnáním postava sice nenajde to, co hledá, ale boží prozřetelnost ji přivede k něčemu jinému užitečnému. Naopak útok, který zasáhne s Pokušením (a postava ho odmítne), vede k tomu, že se zbraň zasekne v těle nepřítele a vytrhnout ji vyžaduje bonusovou akci.")}`,
      },
      {
        id: "hodiny",
        t: "Hodiny Závoje",
        h: `
  <p>O <b>půlnoci</b>, v <b>poledne</b>, po <b>večerním klekání</b> a o <b>slunovratech</b> je Závoj nejtenčí. Bytosti z cizích sfér mají snazší průnik na náš svět a ${Z.P} padá již při hodu <b>1–3</b>. Hodina Závoje trvá vždy jednu hodinu (půlnoc, poledne a hodina po večerním klekání), slunovrat celý den.</p>
  <figure class="rfig rbig"><a href="${AIMG}hodiny.webp" target="_blank" rel="noopener" title="Otevřít v plné velikosti"><img src="${AIMG}hodiny.webp" srcset="${AIMG}hodiny-s.webp 800w, ${AIMG}hodiny.webp 1200w" sizes="(max-width:800px) 100vw, 760px" alt="Kolo hodin Závoje: poledne, klekání, půlnoc a slunovraty" loading="lazy" width="1200" height="1200"></a><figcaption>Kolo hodin Závoje: poledne, večerní klekání, půlnoc a slunovraty</figcaption></figure>`,
      },
      {
        id: "svatky",
        t: "Svátky",
        h: `
  <figure class="rfig rwide"><img src="${AIMG}svatky.webp" srcset="${AIMG}svatky-s.webp 800w, ${AIMG}svatky.webp 1385w" sizes="(max-width:820px) 100vw, 1000px" alt="Svátek ve městě: procesí, trh a mše" loading="lazy" width="1100" height="365"></figure>
  <p>Na den, na který připadá svátek podle vyznání postavy, padá postavě ${Z.B} na všech hodech již při <b>4–6</b>. Svátky platí pro celé vyznání: <b>křesťanům</b> – katolíkům i kališníkům – svátky všech světců (<i>např. sv. Václav, sv. Jiří</i>), <b>kališníkům</b> navíc 6. července Mistr Jan Hus a <b>starověrcům</b> všechny jejich svátky (<i>např. jarní vynášení Morany</i>).</p>
  <p>Světci a hody, k nimž se váže katolická ${xl("vyznani", "vyznani-volba", "Přímluva patrona")}:</p>
  ${tb(
    ["Světec", "Hody"],
    [
      ["sv. Jiří", "Akrobacie, Atletika"],
      ["sv. Václav", "hody na útok, Přesvědčování"],
      ["sv. Ludmila", "Vhled, Lékařství"],
      ["sv. Vojtěch", "Náboženství, Vnímání"],
      ["sv. Kryštof", "Přežití, Ovládání zvířat"],
    ],
    "",
    "narrow",
  )}`,
      },
      {
        id: "hodina-pravdy",
        t: "Hodina Pravdy",
        h: `
  <p>Kombinace Hodin Závoje a svátků může vést k okamžikům, kterým se přezdívá <b>Hodina Pravdy</b>: bytosti Závoje jsou obzvlášť aktivní a neutrální výsledky přestávají existovat – na kostce Závoje padá vždy buď Pokušení (1–3), nebo Požehnání (4–6). Hodina Pravdy trvá vždy jen hodinu.</p>`,
      },
    ],
  },
  {
    id: "svedomi",
    book: "vira",
    t: "Svědomí",
    img: "svedomi.webp",
    sum: "Stupnice 0–10, Zpytování svědomí na konci sezení a čtyři stupně duše.",
    q: ["Svědomí je jako zrcadlo: když je čisté, odráží Boží světlo; když je špinavé, nevidíme v něm pravdu.", "Sv. Jan Zlatoústý"],
    intro: `<p>Svědomí má hodnotu <b>0–10</b>. Každá postava začíná na <b>5</b> (<i>nedohodne-li se hráč s vypravěčem jinak</i>). Podle hodnoty má postava jeden ze čtyř stupňů Svědomí. Každý stupeň poskytuje určité výhody i nevýhody, protože ďábel je svůdce: hřích se vyplácí, a právě proto se z něj špatně dostává ven.</p>`,
    secs: [
      {
        id: "zpytovani",
        t: "Zpytování svědomí",
        h: `
  <p>Na konci každého sezení nadchází fáze Zpytování svědomí, která posune Svědomí podle nasbíraných bodů ${xl("ctnosti", "hrichy", "hříchu či dobrých skutků")}. Každý hráč hodí <b>k10</b> a porovná:</p>
  <ul class="rl"><li><b>Hříchy ≥ hod</b> → Svědomí −1;</li><li><b>Dobré skutky ≥ hod</b> → Svědomí +1.</li></ul>
  <p>Obojí může platit současně, takže rozervaná duše přešlapuje na místě. Bez bodů se nic neděje – Svědomí samo od sebe neroste ani neklesá.</p>
  <p>Po Zpytování se body hříchu i dobrých skutků <b>smažou</b> a sbírají se znovu.</p>`,
      },
      {
        id: "stavy",
        t: "Stupně svědomí",
        h: `
  ${tb(
    ["Svědomí", "Stupeň", "Bonus", "Malus"],
    [
      [
        "0",
        '<span class="st st0">Zatracený</span>',
        "Výhoda na Zastrašování.<br><b><i>Smlouva s ďáblem</i></b> – 1× za dlouhý odpočinek můžeš změnit výsledek kostky Závoje na Požehnání. Petr zapřel třikrát, co by se mohlo stát?",
        "Feat víry přestává fungovat. Postava získává Feat: Zatracený.",
      ],
      [
        "1–3",
        '<span class="st st1">Na scestí</span>',
        "Výhoda na Klamání.",
        "<b><i>Neklidné sny</i></b> – při dlouhém odpočinku si obnovíš jen polovinu HP.",
      ],
      ["4–7", '<span class="st st2">Na vážkách</span>', "—", "—"],
      ["8–10", '<span class="st st3">V milosti</span>', "Imunita vůči stavu Vyděšen (Frightened). Výhoda na Vhled.", "Nevýhoda na Klamání."],
    ],
    "",
    "states",
  )}`,
      },
    ],
  },
  {
    id: "vyznani",
    book: "vira",
    t: "Vyznání",
    img: "vyznani.webp",
    sum: "Kališník, katolík, nebo starověrec – a tři stupně featu víry.",
    q: [
      "Vyznání není k užitku Bohu, který ví vše, ale člověku, který skrze něj odkládá břemeno své viny a otevírá se uzdravení.",
      "Sv. Tomáš Akvinský",
    ],
    intro: `<p>Během tvorby postavy si každý hráč volí <b>Vyznání</b>. Každé přináší feat víry o třech stupních; další stupeň postava získá příběhově, když si ho svým příběhem zaslouží (rozhoduje vypravěč).</p>`,
    secs: [
      {
        id: "vyznani-volba",
        t: "Tři vyznání",
        h: `<div class="faiths">
  <article class="fcard fc-kal"><img src="${AIMG}kalich.webp" alt="" loading="lazy" width="220" height="220"><h4>Kališník</h4><ol>
   <li><b>Přijímání podobojí</b> 1× za dlouhý odpočinek můžeš přijmout krev Boží a obnovit jednu pozici kouzla nejvýš do stupně rovného bonusu zdatnosti, nebo tolik Výdrže, kolik je polovina bonusu zdatnosti (aspoň 1).</li>
   <li><b>Pravda Páně</b> Jako akci může postava 1× za dlouhý odpočinek poznat, zda je cíl ovlivněn Závojem (anděl, démon či Proměněnec).</li>
   <li><b>Ktož sú Boží bojovníci!</b> Jako akci zapěje bojový chorál: spojenci v doslechu získají na 3 kola bonus k4 ke všem hodům na útok i záchranným hodům (1× za dlouhý odpočinek).</li></ol></article>
  <article class="fcard fc-kat"><img src="${AIMG}klice.webp" alt="" loading="lazy" width="220" height="220"><h4>Katolík</h4><ol>
   <li><b>Přímluva patrona</b> 3× za dlouhý odpočinek se postava může přimluvit a získat výhodu podle příslušného ${xl("zavoj", "svatky", "světce")}.</li>
   <li><b>Oroduj za nás</b> Jako reakci můžeš 1× za dlouhý odpočinek sobě nebo spojenci v dosahu 30 stop přehodit záchranný hod, který selhal.</li>
   <li><b>Ve jménu Páně!</b> Jako akci pozvedne kříž a požádá Boha o pomoc proti démonům a nemrtvým – nižší démony vyhostí, vyšší hází záchranu na WIS se SO 12, při neúspěchu jsou Vyděšení (Frightened) (1× za dlouhý odpočinek).</li></ol></article>
  <article class="fcard fc-old"><img src="${AIMG}strom.webp" alt="" loading="lazy" width="220" height="220"><h4>Starověrec</h4><ol>
   <li><b>Zřídlo místa</b> Získává trik Druidcraft. Na místě s přítomností Starých bohů umožňuje urychlenou regeneraci – 1× za dlouhý odpočinek získá okamžitě přínosy krátkého odpočinku.</li>
   <li><b>Obětina</b> Postava může 1× za dlouhý odpočinek obětovat něco cenného některému ze Starých bohů a získat možnost seslat kouzlo (podle volby vypravěče).</li>
   <li><b>Vtělení</b> Jako akci na sebe vezme podobu podle vyznávaného Starého boha (Wild Shape). Např. Morana – bílá vlčice z jinovatky.</li></ol></article>
  </div>
  <p class="rsmall">Čísla 1–3 označují stupně featu víry. Zatracené postavě (${xl("svedomi", "stavy", "Svědomí 0")}) feat víry přestává fungovat.</p>`,
      },
    ],
  },
  /* ======== KNIHA II · BOJ ======== */
  {
    id: "iniciativa",
    book: "boj",
    t: "Iniciativa a protivníci",
    img: "iniciativa.webp",
    sum: "Sloty iniciativy a tři druhy protivníků: pacholci, sokové, zhoubci.",
    intro: "",
    secs: [
      {
        id: "sloty",
        t: "Iniciativa",
        h: `
  <p>Na začátku boje každý hráč hodí <b>k20 + DEX</b>. Vypravěč hodí za nepřítele s nejlepší iniciativou. Počítá se vždy nejlepší výsledek každé strany a ten předurčuje <b>sloty</b> pro hráče a pro vypravěče.</p>
  <p>V každém kole se hráči sami domluví, kdo slot obsadí. Nepřátelé jednají ve svých slotech. Obecně platí, že v rámci kola může každý hráč obsadit jen jeden slot.</p>
  <p>Toto pravidlo ale neplatí pro vypravěče, který může v rámci kola využít slot za konkrétní NPC i vícekrát, v závislosti na jeho postavení: <b>pacholek</b> 1×, <b>sok</b> až 2×, <b>zhoubce</b> až 3× za kolo.</p>
  <p><b>Počet slotů:</b> družina má tolik slotů, kolik má členů (postavy i jejich spojenci). Vypravěč má o jeden slot víc, je-li nepřátel víc než členů družiny, o jeden méně, je-li jich méně, a stejně, je-li jich stejně – vždy aspoň jeden. Nepřítelem se počítá každý houf, sok či zhoubce. Sloty obou stran se střídají, začíná strana s lepším hodem (při shodě družina) a slot navíc je na konci kola. Počty se určí na začátku boje a znovu na začátku každého kola.</p>
  ${note("Příklad.", "Čtyři postavy proti samotnému zhoubci: družina má 4 sloty, vypravěč 3 – a zhoubce smí jednat až třikrát za kolo. Čtyři postavy proti šesti sokům: vypravěč má 5 slotů.")}`,
      },
      {
        id: "protivnici",
        t: "Protivníci",
        h: `<div class="foes">
  <article class="foe"><h4>Pacholci</h4><ul>
   <li>Pacholek má <b>5 HP</b>. Zranění, které ho skolí, přejde na dalšího pacholka (zásah za 12 skolí dva a třetího raní za 2). Plošné kouzlo zraní každého pacholka v oblasti zvlášť. Pacholci neházejí Závoj, nemají kritická zranění a neobětují zbroj.</li>
   <li>Pacholci bojují v <b>houfech</b> po 3 až 12. Houf má jeden tah v iniciativě a útočí jedním hodem s bonusem +1 za každého dalšího pacholka (nejvýš +5).</li>
   <li><b>Morálka:</b> když padne polovina houfu nebo jeho velitel, houf prchá, pokud ho v boji nedrží sok.</li></ul></article>
  <article class="foe"><h4>Sok</h4><ul>
   <li>Má běžné statistiky, hází <b>Závoj</b> a může znát ${xl("serm", "", "šermířské a zápasnické techniky")}.</li>
   <li>Sok může mít zbroj a při kritickém zásahu ji <b>obětovat</b> – kritický zásah se změní v běžný. Když už nemá co obětovat, kritický zásah ho automaticky porazí. Poražený sok umírá, vzdá se, uteče, nebo je zajat pro výkupné.</li>
   <li><b>„Za pána!“</b> Sok může jako reakci poslat do rány blízkého pacholka – zásah místo něj schytá pacholek ze sousedního pole.</li></ul></article>
  <article class="foe"><h4>Zhoubce</h4><ul>
   <li>Hraje podle <b>stejných pravidel jako hráči</b>. Může mít legendární akce a odolnosti.</li>
   <li><b>Ďáblovo štěstí:</b> když padne na 0 HP a nejde o jistou smrt, hodí kostkou Závoje. Při Pokušení přežije a unikne, protože něco za Závojem ho ještě potřebuje…</li></ul></article>
  </div>`,
      },
    ],
  },
  {
    id: "vyzbroj",
    book: "boj",
    t: "Výzbroj",
    img: "vyzbroj.webp",
    sum: "Zbroj dává odolnost a láme se místo kritických zásahů; perky zbraní.",
    q: ["Žádný voják by neměl jít do bitvy bez zbroje, a žádný člověk by neměl čelit životu bez naděje.", "Svatý Jeroným"],
    intro: `<p>V D&amp;D je zbraň jen kostka poškození a zbroj jen AC. V Mundus Mutatus mají fyzické postavy možnost učit se šermířské techniky a zápasnické chvaty, zbraně odrážejí středověkou bojovou realitu a zbroj je skutečně účinná a život zachraňující.</p>`,
    secs: [
      {
        id: "zbroj",
        t: "Zbroj",
        h: `
  <p>Každá zbroj poskytuje kromě AC i <b>odolnost</b> vůči určitým typům zranění. Ta se určuje i podle toho, jak se zbroj běžně nosila, aniž bychom komplikovali pravidla vrstvením zbroje:</p>
  ${tb(
    ["Druh zbroje", "Příklady", "Odolnost", "Vydrží kritických zásahů"],
    [
      [`${bikZb("Vycpávaná")}Vycpávaná`, "Padded, Leather, Studded Leather, Hide", `${bikZr("Bludgeoning")}drtivé`, "1×"],
      [
        `${bikZb("Kroužková")}Kroužková`,
        "Chain Shirt, Scale Mail, Ring Mail, Chainmail",
        `${bikZr("Bludgeoning")}drtivé, ${bikZr("Slashing")}sečné`,
        "2×",
      ],
      [`${bikZb("Plátová")}Plátová`, "Breastplate, Half-plate, Splint", `${bikZr("Slashing")}sečné, ${bikZr("Piercing")}bodné`, "3×"],
      [`${bikZb("Komplexní")}Komplexní`, "Plate", `${bikZr("Bludgeoning")}drtivé, ${bikZr("Slashing")}sečné, ${bikZr("Piercing")}bodné`, "3×"],
      [`${bikZb("Štít")}Štít`, "—", "—", "1×"],
    ],
  )}
  <h4 class="rh4">Obětování zbroje</h4>
  <p>Zbroj se v boji poškozuje. Při kritickém zásahu může postava <b>obětovat zbroj nebo štít</b> a kritický zásah se změní v běžný. Po vyčerpání počtu v tabulce zbroj či štít přestane poskytovat AC bonus a je nutné je opravit. Opravu obstará kovář, nebo postava s kovářským nářadím během dlouhého odpočinku.</p>
  <h4 class="rh4">Tíha zbroje</h4>
  <ul class="rl">
   <li>V Plátové a Komplexní zbroji postavu únava dožene dvakrát rychleji (vyčerpání z aktivit se zdvojnásobuje). Platí to i pro Breastplate a Half Plate, které jsou v SRD střední zbrojí.</li>
   <li>Spánek v Kroužkové a těžší zbroji neodstraní úroveň vyčerpání.</li>
   <li>Navléknout Plátovou a Komplexní zbroj trvá 20 minut (s panošem 10).</li></ul>`,
      },
      {
        id: "zbrane",
        t: "Zbraně",
        h: `
  <p>Mistrovství zbraní (Weapon Mastery) z D&amp;D 2024 funguje beze změny. Každá dobře vyrobená zbraň má ale navíc fyzické perky, které platí pro každého, kdo ji používá a má s ní zdatnost. <b>Pasivní</b> perky platí vždy; <b>aktivní</b> perky se projeví jen podle kostky Závoje – ${Z.B} dává výhodu, odmítnuté ${Z.P} komplikaci. Žádná zbraň nemá víc než jeden pasivní a jeden aktivní perk; výjimkou jsou meče, halapartna a hákovnice jako zbraně na všechno (u hákovnice si střelec při Požehnání vybere Ničivou, nebo dým – obojí naráz ne). Záchranný hod proti perku má <b>SO 8 + bonus zdatnosti + STR</b> toho, kdo zbraní útočí.</p>
  ${tb(
    ["Perk", "Zbraně", "Efekt"],
    [
      [
        `${bikZv("Krvežíznivá")}Krvežíznivá`,
        "Sickle, Scimitar, Glaive, Longbow, Shortbow",
        `${Z.B} – cíl bez odolnosti vůči typu zranění zbraně krvácí k4 do ošetření.<br>${Z.P} – čepel uvízne v ráně, vytrhnout ji stojí bonusovou akci (u luku se šíp vzpříčí: další výstřel až po bonusové akci).`,
      ],
      [`${bikZv("Drtivá")}Drtivá`, "Maul, Mace, Flail, Warhammer", "Ignoruje odolnost zbroje vůči drtivému zranění."],
      [
        `${bikZv("Omračující")}Omračující`,
        "Club, Greatclub, Mace, Flail, Morningstar, Maul, Sling",
        `${Z.B} – cíl hází záchranu na CON, jinak je do konce svého příštího tahu bez reakce a má nevýhodu na hody na útok.<br>${Z.P} – rána sklouzne po zbroji a do svého příštího tahu jsi bez reakce ty.`,
      ],
      [
        `${bikZv("Ratiště")}Ratiště`,
        "Halberd, Pike, Glaive, Spear",
        "Když nepřítel vstoupí do dosahu zbraně (10 stop), můžeš provést příležitostný útok. V kontaktním boji (5 stop) máš ale na hody na útok nevýhodu.<br>Bonusovou akcí můžeš zbraň zapřít o zem: dokud se nepohneš, příležitostný útok proti útoku s Vpřed! je automatický kritický zásah a Vpřed! se neuplatní.",
      ],
      [
        `${bikZv("Ničivá")}Ničivá`,
        "Warhammer, War Pick, Heavy Crossbow, Musket (hákovnice)",
        `${Z.B} – zbroj cíle ztrácí jedno obětování.<br>${Z.P} – zbraň se poškodila a praská: ztrácí Ničivou až do opravy.`,
      ],
      [
        `${bikZv("Průrazná")}Průrazná`,
        "Pistol (píšťala), Musket (hákovnice), Heavy Crossbow, Lance, Halberd, War Pick",
        "Ignoruje odolnost zbroje vůči bodnému zranění.",
      ],
      [
        `${bikZv("Odvetná")}Odvetná`,
        "Shortsword, Longsword, Rapier, Greatsword",
        `${Z.B} – vazba: cíl na tebe do konce svého příštího tahu nemůže použít reakci. Navíc: když tě nepřítel mine útokem na blízko s Pokušením, můžeš reakcí provést protiútok.<br>${Z.P} – čepele se zaklesnou: ztrácíš reakci.`,
      ],
      [`${bikZv("Šikovná")}Šikovná`, "Shortsword, Longsword, Greatsword, Halberd", "Před hodem na útok umožňuje zvolit typ poškození podle zbraně."],
      [
        `${bikZv("Přibodnutí")}Přibodnutí`,
        "Spear, Pike",
        `${Z.B} – cíl je hrotem přidržen: do začátku tvého příštího tahu má rychlost 0, ty se ale nesmíš pohnout.<br>${Z.P} – hrot uvízne ve zbroji: cíl se ti může reakcí pokusit vytrhnout zbraň – hodí záchranu na STR proti SO perku a při úspěchu ti ji vytrhne.`,
      ],
      [
        `${bikZv("Ostrá")}Ostrá`,
        "Shortsword, Longsword, Greatsword, Scimitar, Battleaxe",
        "Při sečném zranění proti cíli bez odolnosti je kritický zásah už na 19–20.",
      ],
      [
        `${bikZv("Půlmeč")}Půlmeč`,
        "Longsword, Greatsword",
        "Bonusovou akcí provedeš přehmat zbraně: útoky s bodným zraněním získávají perk Průrazná, ale kostka zranění klesá o stupeň (<i>tj. k8 na k6</i>).",
      ],
      [
        `${bikZv("Do slabin!")}Do slabin!`,
        "Dagger",
        `${Z.B} – pokud je cíl Spoután (Restrained) nebo Sražen (Prone), jde o automatický kritický zásah.<br>${Z.P} – dýka sklouzne po zbroji, další útok proti tobě má výhodu.`,
      ],
      [
        `${bikZv("Strhující")}Strhující`,
        "Halberd",
        `${Z.B} – umožňuje strhnout cíl k zemi: cíl hází záchranu na CON, jinak je Sražen (Prone).<br>${Z.P} – hák se zasekne v postroji: cíl tě strhne o 5 stop k sobě a může reakcí zaútočit.`,
      ],
      [`${bikZv("Vpřed!")}Vpřed!`, "Lance", "Po jízdě aspoň 15 stop rovně se zdvojnásobují kostky zranění (při kritickém zásahu 4×)."],
      [
        `${bikZv("Štěpící")}Štěpící`,
        "Greataxe, Handaxe, Battleaxe",
        `${Z.B} – zničí štít nepřítele, má-li štít.<br>${Z.P} – sekera uvízne ve štítu: cíl se ti ji může reakcí pokusit vytrhnout – hodí záchranu na STR proti SO perku a při úspěchu ti ji vytrhne.`,
      ],
      [`${bikZv("Nepřímá")}Nepřímá`, "Longbow, Shortbow, Sling", "Projektil je možné vystřelit obloukem: ignoruje bonus polovičního krytu."],
      [
        `${bikZv("Hrom a kouř!")}Hrom a kouř!`,
        "Pistol (píšťala), Musket (hákovnice)",
        `${Z.B} – zahalí střelce v dýmu a dá mu na 1 kolo výhodu proti útokům zblízka.<br>${Z.P} – zbraň selže a před dalším výstřelem ji musíš vyčistit (bonusová akce); pokud jsi minul a u cíle stojí spojenec, zasáhneš spojence; při 1 na k20 a 1 na Závoji zbraň vybuchne a způsobí střelci 2k8 ohnivého zranění.`,
      ],
    ],
  )}
  <p><b>Pomalá, ale těžká rána.</b> Těžká kuše, píšťala a hákovnice vystřelí jednou za akci Útok, i když máš víc útoků. Za každý útok navíc, který by ti akce dala (Extra Attack), přidáš k zásahu jednu kostku zbraně; modifikátor přičteš jen jednou a při kritickém zásahu se zdvojí všechny kostky (těžká kuše s Extra Attack: 2k10 + DEX). Lehká a ruční kuše se napínají rychle kozí nohou a střílí podle Extra Attack normálně. Kdo Nabíjení ignoruje (Crossbow Expert u kuší, Gunner za bonusovou akci na každé nabití), smí místo jedné těžké rány střílet vícekrát s běžnými kostkami.</p>
  <p><b>Zalícení.</b> S těžkou kuší můžeš před výstřelem utratit polovinu své rychlosti a zamířit: útok má výhodu.</p>`,
      },
    ],
  },
  {
    id: "serm",
    book: "boj",
    t: "Šerm a zápas",
    img: "serm.webp",
    sum: "Výdrž, šermířské techniky a zápasnické chvaty od mistrů.",
    q: ["I dobrý šermíř na hovno, když nepřátel nerovno.", "Šermířské rčení"],
    intro: `<p>Fighter, Barbarian, Paladin, Ranger, Rogue a Monk se mohou od šermířských mistrů učit bojové techniky a zápasnické chvaty.</p>`,
    secs: [
      {
        id: "vydrz",
        t: "Výdrž a učení",
        h: `
  <p>Podobně jako mágové sesílají kouzla za pozice kouzel, válečníci využívají pro techniky a chvaty <b>Výdrž (V)</b>. Fighter má Výdrž rovnou svému bonusu zdatnosti, ostatní uvedená povolání polovině bonusu zdatnosti (zaokrouhleno nahoru). Výdrž se obnovuje dlouhým odpočinkem. Feat Martial Adept přidává 1 Výdrž (i postavě bez Výdrže z povolání).</p>
  <p>Učení techniky nebo chvatu vyžaduje nalezení šermířského mistra a úhradu poplatku. Každý mistr učí jen svou školu a jen toho, koho přijme.</p>
  ${note("Cena.", "„1V + Požehnání“ znamená, že techniku smíš použít, když na kostce Závoje padne Požehnání, a zaplatíš 1 bod Výdrže. „Pokušení nepřítele“ znamená, že Pokušení padlo soupeři.")}`,
      },
      {
        id: "techniky",
        t: "Šermířské techniky",
        h: `
  ${tb(
    ["Technika", "Cena", "Efekt"],
    [
      [
        "Sek hněvu <i>(Zornhau)</i>",
        "1V + Požehnání",
        "Provedeš sek s vazbou soupeřovy čepele. Na svůj další hod na útok proti tomuto cíli máš výhodu a on má na svůj další hod na útok proti tobě nevýhodu.",
      ],
      [
        "Křížný sek <i>(Zwerchhau)</i>",
        "1V + reakce",
        "Pokud tě zasáhne útok na blízko, přidáš si proti němu +2 AC (zásah se tak může změnit v minutí) a současně provedeš okamžitý protiútok.",
      ],
      [
        "Křivý sek <i>(Krumphau)</i>",
        "1V + reakce + Pokušení nepřítele",
        "Pokud na tebe nepřítel zaútočí s Pokušením, udeříš ho sekem do rukou dřív, než rána může dopadnout. Cíl hází záchranu na STR: při neúspěchu upustí zbraň a jeho útok se vůbec neuskuteční; při úspěchu dostaneš pouze poloviční poškození.",
      ],
      [
        "Šilhavý sek <i>(Schielhau)</i>",
        "1V + Požehnání",
        "Dobře načasovaným sekem zlomíš nepřítelův sek – do konce svého příštího tahu má nevýhodu na hody na útok.",
      ],
      [
        "Dělný sek <i>(Scheitelhau)</i>",
        "1V + reakce",
        "Když nepřítel vstoupí do tvého dosahu, zaútočíš dřív, než dokončí svůj úder, a defenzivně ustoupíš: proveď útok a získáváš účinek, jako bys provedl akci Úhyb.",
      ],
      [
        "Vražedný úder <i>(Mordschlag)</i>",
        "1V + bonusová akce",
        "Chytíš meč za čepel a udeříš nepřítele záštitou. Do konce tahu způsobuje zbraň drtivé zranění s perkem Drtivá.",
      ],
    ],
  )}`,
      },
      {
        id: "chvaty",
        t: "Zápasnické chvaty",
        h: `
  ${tb(
    ["Chvat", "Cena", "Efekt"],
    [
      [
        "Zápas s mečem <i>(Ringen am Schwert)</i>",
        "1V + Požehnání",
        "Po zásahu zbraní jdeš nepříteli do těla. Cíl hází záchranu na STR nebo DEX: při neúspěchu je podle tvé volby Spoután (Restrained), nebo Sražen (Prone).",
      ],
      [
        "Hod přes bok",
        "1V + Požehnání",
        "Po zásahu útokem beze zbraně hází cíl záchranu na STR nebo DEX: při neúspěchu je Chycen (Grappled) a Sražen (Prone).",
      ],
      [
        "Mordstösse",
        "1V + Požehnání",
        "Úder beze zbraně do hrdla nebo spánku: do konce svého příštího tahu cíl nemůže mluvit (ani sesílat kouzla s verbální složkou) a přichází o reakci.",
      ],
      [
        "Zůstaň!",
        "1V + Požehnání",
        "Pokud je cíl Sražen (Prone) nebo Chycen (Grappled), hází záchranu na DEX: při neúspěchu je do konce tvého příštího tahu Spoután (Restrained).",
      ],
      [
        "Zlom <i>(Bruch)</i>",
        "1V + reakce",
        "Když se tě soupeř snaží srazit nebo chytit, nebo tě už drží, hodíš s výhodou záchranu proti SO jeho chvatu. Při úspěchu se situace obrací: sražen či chycen (Grappled) je soupeř, ne ty.",
      ],
      [
        "Lámání paže",
        "1V + reakce + Pokušení nepřítele",
        `Když tě napadne soupeř, kterého držíš Spoutaného (Restrained), hází záchranu na CON s nevýhodou: při neúspěchu utrží Těžké ${xl("kriticka", "fyzicka", "kritické zranění")} paže – Zlomeninu.`,
      ],
      [
        "Zápas o zbraň",
        "1V + reakce",
        "Když na tebe někdo útočí lehkou zbraní (dýka), hází útočník záchranu na STR nebo DEX: při neúspěchu útok mine a zbraň máš ve svých rukou.",
      ],
      [
        "Zápas ve zbroji <i>(Ringen im Harnisch)</i>",
        "1V + bonusová akce",
        "Proti soupeři, který je Spoután (Restrained) nebo Sražen (Prone), ignorují tvé útoky dýkou do konce tahu jakoukoli odolnost zbroje.",
      ],
    ],
  )}
  <figure class="rfig rwide"><img src="${AIMG}sermiri.webp" srcset="${AIMG}sermiri-s.webp 800w, ${AIMG}sermiri.webp 1385w" sizes="(max-width:820px) 100vw, 1000px" alt="Šermíři z fechtbuchu: vazba, zápas s mečem a hod" loading="lazy" width="1100" height="365"></figure>`,
      },
    ],
  },
  /* ======== KNIHA III · RÁNY ======== */
  {
    id: "featy",
    book: "boj",
    t: "Featy",
    sum: "Úpravy featů z D&D 2024 a dalších příruček pro tažení.",
    intro: `<p>Featy platí tak, jak jsou psané, s úpravami níže. Plné znění všech featů (i s těmito úpravami v rámečcích) najdeš po přihlášení v Pravidlech › <a href="#pravidla/mimo/mimo-featy">Doplňky › Featy</a>.</p>`,
    secs: [
      {
        id: "featy-zasady",
        t: "Obecné zásady",
        h: `
  <ul>
    <li><b>Přehoz k20 nepřehazuje Závoj.</b> Když feat dovolí hod k20 opakovat (Lucky, Bountiful Luck, Second Chance, Survivor, Boon of Fortune's Favor, Elven Accuracy…), kostka Závoje zůstává z prvního hodu.</li>
    <li><b>Zrušený kritický zásah nic nespouští.</b> Kritický zásah, který cíl obětováním zbroje či štítu změnil v běžný, nespouští přínosy navázané na kritický zásah (Crusher, Piercer, Slasher, Lords' Alliance Agent…).</li>
    <li><b>Temné dary a Pokušení.</b> Když máš kvůli jedničce na k20 házet záchranný hod temného daru, smíš místo něj přijmout ${Z.P}: získáš bod hříchu a účinek nenastane.</li>
  </ul>`,
      },
      {
        id: "featy-upravy",
        t: "Upravené featy",
        h: `
  ${tb(
    ["Feat", "Úprava"],
    [
      [
        "Alert",
        "Výměnu iniciativy nahrazuje <b>Předstih</b>: jednou za boj uskutečníš svůj tah před tahem libovolného nepřítele; nepřítel jedná až po tobě.",
      ],
      [
        "Heavy Armor Master",
        "Plátová a komplexní zbroj snese o 1 obětování víc, únava se ti v ní nezdvojnásobuje a obléknout ji zvládneš za polovinu času (10 minut, s panošem 5).",
      ],
      [
        "Delicious Pain",
        "<b>Zocelené tělo</b>: jednou za krátký či dlouhý odpočinek změníš kritický zásah v běžný, aniž bys obětoval zbroj nebo štít.",
      ],
      ["Polearm Master", "U zbraní s perkem Ratiště místo Pohotového úderu: bez nevýhody v kontaktním boji a zapření proti Vpřed! reakcí."],
      ["Charger", "Bonus 1k8 se perkem Vpřed! nezdvojnásobuje."],
      [
        "Gunner",
        "Zdatnost s píšťalou a hákovnicí; Nabíjení tě neomezuje, ale každé nabití stojí bonusovou akci; čištění po Pokušení u Hrom a kouř! tě nestojí akci.",
      ],
      [
        "Healer (Felčar)",
        "Počítáš se jako felčar (výhoda na záchranu na CON po Těžkém kritickém zranění), krvácení zastavíš akcí Použití; postavu na 0 HP jen stabilizuješ.",
      ],
      ["Durable", "Výhoda i na záchranu na CON proti vyčerpání po Těžkém či horším kritickém zranění."],
      ["Martial Adept", "Místo manévrů dvě šermířské techniky nebo zápasnické chvaty (bez hledání mistra) a +1 Výdrž, i bez Výdrže z povolání."],
      ["Boon of Irresistible Offense", "Ignoruje i odolnost zbroje."],
    ],
  )}
  ${note("Vyřazeno.", "Revenant Blade (jméno patří featu Revenant pro Navrácené) a Fighting Initiate (bojové styly jsou v D&amp;D 2024 samy featy).")}`,
      },
    ],
  },
  {
    id: "kouzla",
    book: "boj",
    t: "Kouzla a předměty",
    sum: "Jak kouzla a kouzelné předměty z D&D sedí na Artikule.",
    intro: `<p>Kouzla a kouzelné předměty platí tak, jak jsou psané, se zásadami a úpravami níže. Plné znění všech kouzel a předmětů (i s těmito úpravami v rámečcích) najdeš po přihlášení v Pravidlech › <a href="#pravidla/kouzla">Kouzla</a> a <a href="#pravidla/predmety-plne">Předměty</a>.</p>`,
    secs: [
      {
        id: "kouzla-zasady",
        t: "Obecné zásady",
        h: `
  <ul>
    <li><b>Léčení na 0 HP jen stabilizuje.</b> Platí pro všechna kouzla, lektvary i předměty (Healing Word, Potion of Healing…). Do boje vrací jen Lesser a Greater Restoration a kouzla 9. stupně, která to výslovně dělají (Power Word Heal, Mass Heal, Wish).</li>
    <li><b>Každý návrat z mrtvých je vzkříšení.</b> Smí se jen jednou a zanechá Znamení návratu – i Revivify, Reincarnate, Clone, Wish a předměty jako Rod of Resurrection. Oživený Revivify je do konce boje mimo hru. Ani True Resurrection nepřekoná druhé vzkříšení ani Rozervanou duši; to umí jen zázrak.</li>
    <li><b>Pohlcená či zničená duše je Rozervaná duše.</b> Koho pohltí Blackrazor, Soul Coin či podobný předmět, toho běžná kouzla nevzkřísí.</li>
    <li><b>Okamžitá smrt nezabíjí postavy ani soky.</b> Power Word Kill, Vorpal Sword, Snicker-Snack a podobné: místo smrti Smrtelné kritické zranění. Pacholek umírá.</li>
    <li><b>Zabránění pádu na 0 HP</b> (Death Ward, Lifewell Tattoo…): zůstaneš na 1 HP a při vědomí, ale hod na kritické zranění a úroveň vyčerpání platí.</li>
    <li><b>Zrušený kritický zásah nic nespouští.</b> Účinky kritického zásahu či přirozené 20 nenastanou, když cíl kritický zásah obětováním zbroje či štítu změní v běžný. Rozšířený rozsah kritického zásahu se s perkem Ostrá nesčítá (nejvýš 19–20); nastavená 20 není přirozená 20.</li>
    <li><b>Kritická zranění a magie.</b> Lesser Restoration vyléčí Těžké zranění, Greater Restoration a Heal Vážné, Regenerate obnoví ztracenou končetinu. Raise Dead trvalé následky nehojí, Resurrection ano. Protézy vyrobí a nasadí jen mistr.</li>
    <li><b>Odolnost a zbroj.</b> Odolnost vůči drtivému, bodnému a sečnému zranění z kouzla či předmětu (Stoneskin, Armor of Invulnerability…) se se zbrojí nesčítá; kdo ji už má ze zbroje, získá místo ní toto: na jeho odolnost nepůsobí perky Drtivá a Průrazná. Zbraně, které ignorují odolnost vůči sečnému zranění, prorazí i zbroj. Magické typy zranění zbroj nepůlí.</li>
    <li><b>AC bez zbroje</b> (Mage Armor, Barkskin, Bracers of Defense…) dává jen AC – žádnou odolnost a nic, co by šlo obětovat.</li>
    <li><b>Iniciativa.</b> Výhoda či bonus k iniciativě z předmětů a kouzel je <b>Předstih</b> jako u Alertu: jednou za boj uskutečníš svůj tah před tahem libovolného nepřítele. Přivolaní tvorové jednají ve slotu svého pána hned po něm; vymknou-li se, ve slotech vypravěče.</li>
    <li><b>Kostka Závoje.</b> Přehoz či úprava hodu k20 (Silvery Barbs, Luck Blade, „považuj za 10“…) Závoj nemění – platí výsledek z původního hodu.</li>
    <li><b>Vyčerpání.</b> Imunita vůči vyčerpání z předmětu chrání jen před vyčerpáním z námahy a ze zbroje, ne ze zranění a z pádu na 0 HP.</li>
    <li><b>Houfy.</b> Tři a víc stejných přivolaných či oživených tvorů (Animate Dead, Summon Lesser Demons…) jedná jako houf pacholků; kouzlo na víc cílů (Mass Suggestion) bere houf jako jeden cíl.</li>
    <li><b>Kosmologie.</b> Sféry jsou místa za Závojem: Horní sféry jsou Nebe; Devět pekel, Propast a Avernus jsou Peklo; Vílí divočina a Stínopád jsou říše víl a mrtvých. Na Commune, Divination či Planar Ally odpovídá ten, ke komu se postava modlí podle vyznání. Vyvolat ďábla či démona je všední hřích. Bohové jiných světů jsou Staří bohové starověrců; přínosy podmíněné zbožností dostane postava se Svědomím V milosti.</li>
    <li><b>Draci</b> jsou plemena podle živlu, ne barvy: oheň (červený, zlatý, mosazný) plivník či etnský drak, kyselina (černý, měděný) bojištník, jed (zelený) ostnatka či lindwurm, blesk (modrý, bronzový) hromová saň, mráz (bílý, stříbrný) firnový drak.</li>
    <li><b>Doba 1458.</b> Pistol je píšťala, Musket hákovnice; jiné palné zbraně, lodě do vesmíru, vzducholodě a moderní technika v tažení nejsou. Střelný prach je obyčejná nemagická věc. Platina a elektrum nejsou ani v cenách, ani ve složkách kouzel.</li>
  </ul>`,
      },
      {
        id: "kouzla-upravy",
        t: "Upravená kouzla a předměty",
        h: `
  ${tb(
    ["Kouzlo či předmět", "Úprava"],
    [
      ["Adamantine Armor, Mizzium Armor", "Místo změny každého kritického zásahu snese zbroj o 2 obětování víc."],
      [
        "Guardian Emblem",
        "1× za dlouhý odpočinek reakcí změníš kritický zásah proti sobě či spojenci do 30 stop v běžný zásah bez obětování zbroje.",
      ],
      [
        "Mithral Armor, Elven Chain, Vanrak's Mithral Shirt",
        "Ruší i postihy plátové a komplexní zbroje z Artikulí (dvojité vyčerpání, spánek ve zbroji, dlouhé oblékání); odolnost a obětování zůstávají.",
      ],
      ["Spiked Armor", "Kroužková zbroj: odolnost vůči drtivému a sečnému zranění, obětování 2×."],
      ["Mending", "Obětovanou zbroj ani štít neopraví – jen kovář."],
      ["Gift of Alacrity", "Místo +1k8 k iniciativě Předstih (jednou za dobu trvání)."],
      ["Shield of the Tortoise", "Kletba: prokletý hraje vždy v posledním slotu kola."],
      ["Periapt of Wound Closure", "Hod proti smrti 9 a nižší smíš změnit na 10 jen 1× za dlouhý odpočinek."],
      ["Blade of Disaster", "Kritický zásah na 18–20 je výjimka kouzla 9. stupně."],
      ["Charlatan's Die", "Nelze ji použít jako kostku Závoje."],
      ["Repeating Shot, Sniper's Bracelet", "Píšťala a hákovnice se nabíjejí podle Artikulí i s kouzelným střelivem."],
    ],
  )}
  ${note("Vyřazeno.", "Lodě do vesmíru a jejich kormidla (Spelljammer), vzducholodě, vysílačka Fargab, granáty s granátometem a platina jako zboží; ze seznamů základních zbraní pušky, revolvery, brokovnice a laserové zbraně.")}`,
      },
    ],
  },
  {
    id: "zraneni",
    book: "rany",
    t: "Zranění a smrt",
    img: "zraneni.webp",
    sum: "Pád na 0 HP, závažnost kritických zranění, jizvy a Znamení návratu.",
    q: ["Jen povrchové zranění…", "Neznámý padlý"],
    intro: "",
    secs: [
      {
        id: "nula",
        t: "Pád na 0 HP",
        h: `
  <p>Pád na 0 HP znamená <b>bezvědomí</b>, hody proti smrti, hod na ${xl("kriticka", "", "kritické zranění")} a <b>jednu úroveň vyčerpání</b>.</p>
  <p><b>Životy pod nulou.</b> HP mohou klesnout pod 0: zranění, které přesáhne zbývající životy, se odečítá dál do záporu – i zásahy postavy v bezvědomí. Čím hlouběji pod nulou, tím horší je kritické zranění. Léčení postavu pod nulou vrací od 0.</p>
  <p>Léčení postavu jen stabilizuje, nevrací ji automaticky do boje – postava je mimo boj až do jeho konce, ledaže je vrácena do hry kouzlem Lesser či Greater Restoration.</p>
  <p>Po boji s Těžkým nebo horším kritickým zraněním hází postava <b>záchranu na CON se SO 12</b> (s felčarem s výhodou). Při neúspěchu získává jednu úroveň vyčerpání denně, dokud neuspěje.</p>`,
      },
      {
        id: "zavaznost",
        t: "Závažnost kritických zranění",
        h: `
  <p>Kritické zásahy jsou mnohem horší než v klasickém D&amp;D 2024. S každým kritickým zásahem hází postava na kritické zranění a jeho následky. Jak vážné bude, rozhodne <b>k10</b>:</p>
  <ul class="rl"><li>+1 za každé kritické zranění, které nebylo vyléčeno;</li><li>+1 za každých 5 HP pod nulou.</li></ul>
  ${tb(
    ["k10", "Závažnost"],
    [
      ["1–5", "Lehká"],
      ["6–9", "Těžká"],
      ["10–12", "Vážná"],
      ["13+", "Smrtelná"],
    ],
    "",
    "narrow sev",
  )}
  <p>Kterou část těla zranění zasáhne a co způsobí, popisuje kapitola ${xl("kriticka", "", "Kritická zranění")}.</p>`,
      },
      {
        id: "jizvy",
        t: "Jizvy",
        h: `<p>Zahojená Vážná nebo Smrtelná rána zanechává <b>jizvu</b>, která dává výhodu na Zastrašování a nevýhodu na Přesvědčování při svádění.</p>`,
      },
      {
        id: "smrt",
        t: "Smrt a Znamení návratu",
        h: `
  <p>Mrtvé lze s pomocí Boží vzkřísit, ale každé vzkříšení zanechá <b>Znamení návratu</b> – ať už je to neutuchající chlad, opožděný stín, nebo změněná barva očí… Další vzkříšení běžným kouzlem již není možné.</p>
  <p>Navrácení získávají speciální <b>Feat: Revenant</b> (zatím zůstává zahalen tajemstvím)!</p>`,
      },
    ],
  },
  {
    id: "kriticka",
    book: "rany",
    t: "Kritická zranění",
    img: "kriticka.webp",
    noini: 1,
    sum: "Zasažená část těla podle kostky Závoje, tabulky fyzických a magických zranění.",
    intro: "",
    secs: [
      {
        id: "zasah",
        t: "Zasažená část těla",
        pair: 1,
        h: `
  <p>Kritická zranění se liší podle zasažené části těla. Kterou část zásah zasáhne, určuje <b>kostka Závoje</b>:</p>
  ${tb(
    ["k6", "Zasažená část"],
    [
      ["6", "Hlava"],
      ["3–5", "Trup"],
      ["2", "Paže"],
      ["1", "Nohy"],
    ],
    "",
    "narrow",
  )}`,
      },
      {
        id: "trvani",
        t: "Trvání následků",
        h: `
  <p>Pro všechna kritická zranění, ať už způsobená fyzickou zbraní, či magií, platí (není-li uvedeno jinak):</p>
  <ul class="rl">
   <li><b>Lehká</b> trvají do konce příštího tahu.</li>
   <li><b>Těžká</b> trvají až do ošetření: ošetřit je může kdokoli ověřením Lékařství se SO 12, za každé další neléčené kritické zranění +2.</li>
   <li><b>Vážná</b> jsou trvalá, nejsou-li včas vyléčena zkušeným mágem či prvotřídním felčarem.</li>
   <li><b>Smrtelná</b> znamenají bezvědomí a 2 neúspěšné hody proti smrti; přežije-li postava, následek je trvalý.</li>
   <li><b>Krvácení</b> pokračuje každé kolo až do ošetření.</li></ul>
  <p class="rsmall">Silové a hromové zranění má účinky jako fyzická kritická zranění.</p>`,
      },
      {
        id: "fyzicka",
        t: "Fyzická kritická zranění",
        h: `
  ${tb(
    ["Část", "Lehká", "Těžká", "Vážná", "Smrtelná"],
    [
      [
        "Hlava",
        "<b>Zvonění v hlavě</b> – bez reakce, nevýhoda na příští hod",
        "<b>Otřes mozku</b> – 1 úroveň vyčerpání, nevýhoda na ověření INT",
        "<b>Znetvoření</b> – nevýhoda na Vnímání + krvácení k8",
        "<b>Rozpoltěná lebka</b>",
      ],
      [
        "Trup",
        "<b>Vyražený dech</b> – poloviční pohyb",
        "<b>Krvácivá rána</b> – krvácení k6",
        "<b>Polámaná žebra</b> – nevýhoda na záchrany na CON + krvácení k8",
        "<b>Prokláté útroby</b>",
      ],
      [
        "Paže",
        "<b>Rána přes prsty</b> – upustíš, co držíš",
        "<b>Zlomenina</b> – nevýhoda na ověření STR a DEX",
        "<b>Rozdrcené předloktí</b> – nevýhoda na hody na útok + krvácení k8",
        "<b>Useknutá paže</b>",
      ],
      [
        "Nohy",
        "<b>Podražení</b> – Sražen (Prone)",
        "<b>Zlomená noha</b> – poloviční pohyb",
        "<b>Přeťatá tepna</b> – pohyb 10 stop + krvácení k8",
        "<b>Useknutá noha</b>",
      ],
    ],
    "",
    "crit",
  )}`,
      },
      {
        id: "magicka",
        t: "Magická kritická zranění",
        h: `
  ${tb(
    ["Typ magie", "Lehká", "Těžká", "Vážná", "Smrtelná"],
    [
      [
        "Oheň / Blesk",
        "<b>Vzplanutí</b> – hoříš k4",
        "<b>Popáleniny</b> – 1 úroveň vyčerpání",
        "<b>Vypálené oči</b> – nevýhoda na Vnímání a hody na útok na dálku",
        "<b>Uhoření zaživa</b>",
      ],
      [
        "Mráz",
        "<b>Ztuhlé údy</b> – poloviční pohyb",
        "<b>Zkřehlé údy</b> – nevýhoda na záchrany na DEX",
        "<b>Prsty z ledu</b> – nevýhoda na hody na útok",
        "<b>Zamrzlé srdce</b>",
      ],
      [
        "Kyselina / Jed",
        "<b>Dávení</b> – bez reakce a bonusové akce",
        "<b>Žíravina</b> – nevýhoda na záchrany na CON",
        "<b>Černá krev</b> – Otráven (Poisoned)",
        "<b>Selhání těla</b>",
      ],
      [
        "Svatá / Prokletá",
        "<b>Předzvěst Závoje</b> – Pokušení padá na 1–4 při příštím hodu",
        "<b>Předtucha smrti</b> – max. HP −10",
        "<b>Cejch Závoje</b> – Pokušení ti padá na 1–3",
        "<b>Rozervaná duše</b> <i>(nelze vzkřísit běžnými kouzly)</i>",
      ],
      [
        "Psychická",
        "<b>Zmatení</b> – příští útok míří na náhodný cíl",
        "<b>Pomatení</b> – nevýhoda na záchrany na WIS",
        "<b>Hlasy v hlavě</b> – nevýhoda na ověření INT a WIS a na soustředění",
        "<b>Šílenství</b>",
      ],
    ],
    "",
    "crit",
  )}`,
      },
    ],
  },
  {
    id: "pojmy",
    book: "rejstrik",
    t: "Slovníček pojmů",
    sum: "Závoj, Svědomí, Výdrž, Proměněnci a další pojmy na jednom místě.",
    intro: "",
    secs: [
      {
        id: "pojmy-vse",
        t: "Pojmy od A do Ž",
        h: `<dl class="gloss">${GLOSS.slice()
          .sort((a, b) => a.t.localeCompare(b.t, "cs"))
          .map(g => `<dt id="as-p-${g.id}">${g.t}</dt><dd>${g.d} <a class="gref" href="#artikule/${g.ch}">→ ${GCH[g.ch]}</a></dd>`)
          .join("")}</dl>`,
      },
    ],
  },
];
const AK = Object.fromEntries(ARTK.map(k => [k.id, k]));
/* fulltext index over sections */

function artToc(cur) {
  return `<button type="button" class="atoggle" aria-expanded="false">Obsah artikulí ▾</button>
   <nav class="atoc" aria-label="Obsah artikulí"><a class="atop${cur ? "" : " on"}" href="#artikule">Úvod</a>${ARTB.map(
     b =>
       `<p class="abook">${b.t} · ${b.n}</p><ol>${ARTK.filter(k => k.book === b.id)
         .map(
           k =>
             `<li><a href="#artikule/${k.id}"${k.id === cur ? ' class="on" aria-current="page"' : ""}>${k.t}</a>${k.id === cur && k.secs.length > 1 ? `<ol class="asecs">${k.secs.map(s => `<li><a href="#artikule/${k.id}/${s.id}">${s.t}</a></li>`).join("")}</ol>` : ""}</li>`,
         )
         .join("")}</ol>`,
   ).join("")}</nav>`;
}
function artLanding() {
  const quick = `<div class="aquick">
   <a class="qk" href="#artikule/zavoj/kostka"><b>Kostka Závoje · k6</b><span>1–2 ${Z.P}</span><span>3–4 bez efektu</span><span>5–6 ${Z.B}</span></a>
   <a class="qk" href="#artikule/svedomi/stavy"><b>Svědomí · 0–10</b><span>0 Zatracený</span><span>1–3 Na scestí</span><span>4–7 Na vážkách</span><span>8–10 V milosti</span></a>
   <a class="qk" href="#artikule/zraneni/zavaznost"><b>Kritické zranění · k10</b><span>1–5 Lehká · 6–9 Těžká</span><span>10–12 Vážná · 13+ Smrtelná</span><span>Část těla: kostka Závoje</span></a></div>`;
  /* obrázek art/artikule/banner.webp (draci nad krajinou) je odložený pro budoucí sekci o světě (lore) */
  return `<div class="rart wide"><img src="${AIMG}titul.webp" srcset="${AIMG}titul-s.webp 620w, ${AIMG}titul.webp 1000w" sizes="(max-width:820px) 80vw, 420px" alt="" width="620" height="269"></div>
   <h2 class="vh">Artikule</h2>
   ${rq("Zde jsou sepsány Artikule, jimiž se řídí tato Kronika i ti, o nichž vypráví. Stanoví, co komu přísluší, co se smí a nesmí, co stojí za to riskovati a co se již nevyplácí. Kdož je zná, nebude zaskočen, kdož je nezná, budiž zatracen.", "Vojtěch z Kroměříže, rytíř ve službách biskupa olomouckého")}
   <p class="alead">K přečtení jsou zde pravidla a mechaniky pro kampaň <i>Mundus Mutatus: Sub Utraque Sunt Dracones</i>. Základ vychází z pravidel D&amp;D 2024, je však upraven a doplněn tak, aby vytvořil temný a nebezpečný středověký svět, v němž o duše postav svádějí souboj Bůh a ďábel.</p>
   <img class="orn drak" src="${AIMG}drak.webp" srcset="${AIMG}drak-450.webp 450w, ${AIMG}drak-600.webp 600w, ${AIMG}drak.webp 900w" sizes="min(420px,80vw)" width="900" height="300" alt="" aria-hidden="true">
   <h3 class="abh">Ve zkratce</h3>${quick}
`;
}
function artChapter(k) {
  const i = ARTK.indexOf(k),
    pv = ARTK[i - 1],
    nx = ARTK[i + 1],
    b = ARTB.find(x => x.id === k.book);
  return `<nav class="crumbs"><a href="#artikule">Artikule</a> › ${b.t} · ${b.n} › <b>${k.t}</b></nav>
   ${k.img ? `<div class="rart${k.wide ? " wide" : ""}"><img src="${AIMG}${k.img}" alt="" width="${k.wide ? 560 : 300}" height="${k.wide ? 314 : 300}"></div>` : ""}
   <h2 class="vh">${k.t}</h2>
   ${k.q ? rq(k.q[0], k.q[1]) : ""}
   ${k.intro ? `<div class="alead">${k.intro}</div>` : ""}
   ${(() => {
     const sec = s =>
       `<section class="asec${k.noini ? " noini" : ""}" id="as-${s.id}"><h3 class="ash"><a href="#artikule/${k.id}/${s.id}">${s.t}</a></h3>${s.h}</section>`;
     let o = "";
     for (let j = 0; j < k.secs.length; j++) {
       const s = k.secs[j];
       if (s.pair && k.secs[j + 1]) {
         o += `<div class="apair">${sec(s)}${sec(k.secs[j + 1])}</div>`;
         j++;
       } else o += sec(s);
     }
     return o;
   })()}
   <nav class="apn">${pv ? `<a href="#artikule/${pv.id}" rel="prev"><small>Předchozí</small>${pv.t}</a>` : "<span></span>"}${nx ? `<a href="#artikule/${nx.id}" rel="next"><small>Další</small>${nx.t}</a>` : "<span></span>"}</nav>`;
}
function hiliteIn(el, q) {
  if (!q) return;
  const w = norm(q);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n,
    hits = [];
  while ((n = tw.nextNode())) {
    const i = norm(n.nodeValue).indexOf(w);
    if (i >= 0 && !n.parentElement.closest("mark")) hits.push([n, i]);
  }
  hits.forEach(([n, i]) => {
    const r = document.createRange();
    r.setStart(n, i);
    r.setEnd(n, i + q.length);
    const m = document.createElement("mark");
    try {
      r.surroundContents(m);
    } catch (e) {}
  });
}
function renderArtikule(b, c) {
  const k = AK[b],
    main = document.getElementById("amain"),
    side = document.getElementById("artside");
  side.innerHTML = artToc(k ? k.id : null);
  main.innerHTML = k ? artChapter(k) : artLanding();
  document.title = "Mundus Mutatus · Artikule" + (k ? " · " + k.t : "");
  const tg = side.querySelector(".atoggle");
  tg.addEventListener("click", () => {
    const o = side.classList.toggle("open");
    tg.setAttribute("aria-expanded", o);
  });
  if (k && k.id !== "pojmy") autolink(main, "", v => v.g && v.g !== k.id);
  /* značky pojmů (pojZnac) jsou v dílu „hra“, který se hráči stahuje až na pozadí – Artikule jsou v jádru, tak na něj počkají
     (2026-10-22, dřív při rychlém otevření kapitoly „pojZnac is not defined“) */
  if (k)
    mmLina("hra").then(
      () => pojZnac(main),
      () => {},
    );
  if (k && c) {
    const el = document.getElementById("as-" + c);
    if (el) {
      if (el.tagName === "DT") {
        el.classList.add("flash");
        setTimeout(() => el.classList.remove("flash"), 2200);
      }
      if (window._artHi) {
        hiliteIn(el, window._artHi);
        window._artHi = null;
      }
      requestAnimationFrame(() => el.scrollIntoView({block: "start"}));
      return true;
    }
  }
  return false;
}
