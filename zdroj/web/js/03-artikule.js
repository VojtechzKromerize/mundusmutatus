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
    d: "K6 házená ke každému testu dovednosti a hodu na útok. 1–2 Pokušení, 3–4 nic, 5–6 Požehnání. Výsledek d20 nemění, jen něco přidává.",
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
    d: "Půlnoc, poledne, doba po večerním klekání a slunovraty. Závoj je nejtenčí a Pokušení padá už na 1–3.",
  },
  {
    id: "svatek",
    t: "Svátek",
    ch: "zavoj",
    f: [],
    d: "Den svátku podle vyznání postavy: svátky světců pro všechny křesťany (katolíky i kališníky), Mistr Jan Hus navíc pro kališníky, svátky starých bohů (např. vynášení Morany) pro všechny starověrce. Požehnání padá už na 4–6.",
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
    d: "Každá postava má jednu Ctnost (v čem je silná) a jednu Neřest (kde ji ďábel nejsnáze svede). Jednání podle nich přináší body hříchu či dobrých skutků i Heroic Inspiration.",
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
    d: "Hodnota 0–10 (začíná na 5) a čtyři stavy: Zatracený, Na scestí, Na vážkách, V milosti. Každý stav má výhody i nevýhody.",
  },
  {
    id: "zpytovani",
    t: "Zpytování svědomí",
    ch: "svedomi",
    f: ["Zpytování svědomí", "Zpytování Svědomí"],
    d: "Na konci sezení hod k10: body hříchu ≥ hod → Svědomí −1; dobré skutky ≥ hod → +1. Obojí může platit zároveň.",
  },
  {
    id: "feat",
    t: "Feat víry",
    ch: "vyznani",
    f: ["Feat víry", "feat víry", "featu víry", "Featu víry"],
    d: "Schopnosti vyznání o třech stupních. Ve stavu Zatracený přestávají fungovat.",
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
    d: "Při kritickém zásahu smí postava obětovat zbroj nebo štít a crit se změní v běžný zásah. Vycpávaná zbroj a štít vydrží 1×, kroužková 2×, plátová a komplexní 3×.",
  },
  {
    id: "kriticke",
    t: "Kritické zranění",
    ch: "kriticka",
    f: ["kritické zranění", "kritická zranění", "Kritické zranění", "Kritická zranění", "kritického zranění"],
    d: "S každým critem se hází na závažnost (k10) a zasaženou část těla (kostka Závoje). Následky sahají od zvonění v hlavě po useknutou paži.",
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
  zraneni: "Zranění a smrt",
  kriticka: "Kritická zranění",
};
const ARTB = [
  {id: "vira", t: "Kniha první", n: "Víra", d: "Ctnosti a hříchy, Závoj, Svědomí a Vyznání – co se děje s duší postavy."},
  {id: "boj", t: "Kniha druhá", n: "Boj", d: "Iniciativa a protivníci, zbroj a zbraně, šerm a zápas, featy."},
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
  ${note("Heroic Inspiration.", "Následování Ctnosti či podlehnutí Neřesti je pro postavu přirozené a odpovídá jejímu světonázoru. Pokud postava jedná v souladu se svou Ctností, nebo podlehne své Neřesti, získává Heroic Inspiration.")}`,
      },
    ],
  },
  {
    id: "zavoj",
    book: "vira",
    t: "Závoj",
    img: "zavoj.webp",
    sum: "Kostka Závoje k d20: Pokušení, nebo Požehnání. Hodiny Závoje a svátky.",
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
  <p>Ke každému testu dovednosti i hodu na útok se vedle d20 hází i <b>kostka Závoje (d6)</b>. Hod se vyhodnocuje standardně, Závoj k němu pouze přidává něco navíc:</p>
  ${tb(
    ["d6", "Závoj", "Následek"],
    [
      ["1–2", Z.P, "Pokud hráč Pokušení nepřijme, nastává dodatečná komplikace. Pokud ho přijme, získává bod hříchu."],
      ["3–4", "Bez efektu", "—"],
      ["5–6", Z.B, "Dodatečný pozitivní efekt."],
    ],
    "",
    "dice",
  )}
  <p>Požehnání ani Pokušení neruší základní výsledek hodu d20 (úspěch či neúspěch).</p>
  ${note("Příklad.", "Při neúspěšném Perception checku s Požehnáním postava sice nenajde to, co hledá, ale boží prozřetelnost ji přivede k něčemu jinému užitečnému. Naopak útok, který zasáhne s Pokušením (a postava ho odmítne), vede k tomu, že se zbraň zasekne v těle nepřítele a vytrhnout ji vyžaduje bonusovou akci.")}`,
      },
      {
        id: "hodiny",
        t: "Hodiny Závoje",
        h: `
  <p>O <b>půlnoci</b>, v <b>poledne</b>, po <b>večerním klekání</b> a o <b>slunovratech</b> je Závoj nejtenčí. Bytosti z cizích sfér mají snazší průnik na náš svět a ${Z.P} padá již při hodu <b>1–3</b>.</p>
  <figure class="rfig rbig"><a href="${AIMG}hodiny.webp" target="_blank" rel="noopener" title="Otevřít v plné velikosti"><img src="${AIMG}hodiny.webp" srcset="${AIMG}hodiny-s.webp 800w, ${AIMG}hodiny.webp 1200w" sizes="(max-width:800px) 100vw, 760px" alt="Kolo hodin Závoje: poledne, klekání, půlnoc a slunovraty" loading="lazy" width="1200" height="1200"></a><figcaption>Kolo hodin Závoje: poledne, večerní klekání, půlnoc a slunovraty</figcaption></figure>`,
      },
      {
        id: "svatky",
        t: "Svátky",
        h: `
  <figure class="rfig rwide"><img src="${AIMG}svatky.webp" srcset="${AIMG}svatky-s.webp 800w, ${AIMG}svatky.webp 1385w" sizes="(max-width:820px) 100vw, 1000px" alt="Svátek ve městě: procesí, trh a mše" loading="lazy" width="1100" height="365"></figure>
  <p>Na den, na který připadá svátek podle vyznání postavy, padá postavě ${Z.B} již při hodu <b>4–6</b>. Svátky platí pro celé vyznání: <b>křesťanům</b> – katolíkům i kališníkům – svátky všech světců (<i>např. sv. Václav, sv. Jiří</i>), <b>kališníkům</b> navíc 6. července Mistr Jan Hus a <b>starověrcům</b> všechny jejich svátky (<i>např. jarní vynášení Morany</i>).</p>
  <p>Světci a dovednosti, k nimž se váží (viz též ${xl("vyznani", "vyznani-volba", "Přímluva patrona")}):</p>
  ${tb(
    ["Světec", "Dovednosti"],
    [
      ["sv. Jiří", "Acrobatics, Athletics"],
      ["sv. Václav", "Attack Roll, Persuasion"],
      ["sv. Ludmila", "Insight, Medicine"],
      ["sv. Vojtěch", "Religion, Perception"],
      ["sv. Kryštof", "Survival, Animal Handling"],
    ],
    "",
    "narrow",
  )}`,
      },
      {
        id: "hodina-pravdy",
        t: "Hodina Pravdy",
        h: `
  <p>Kombinace Hodin Závoje a svátků může vést k okamžikům, kterým se přezdívá <b>Hodina Pravdy</b>: bytosti Závoje jsou obzvlášť aktivní a neutrální výsledky přestávají existovat – na kostce Závoje padá vždy buď Pokušení (1–3), nebo Požehnání (4–6).</p>`,
      },
    ],
  },
  {
    id: "svedomi",
    book: "vira",
    t: "Svědomí",
    img: "svedomi.webp",
    sum: "Stupnice 0–10, Zpytování svědomí na konci sezení a čtyři stavy duše.",
    q: ["Svědomí je jako zrcadlo: když je čisté, odráží Boží světlo; když je špinavé, nevidíme v něm pravdu.", "Sv. Jan Zlatoústý"],
    intro: `<p>Svědomí má hodnotu <b>0–10</b>. Každá postava začíná na <b>5</b> (<i>nedohodne-li se hráč s GM jinak</i>). Podle něj je ve čtyřech stavech Svědomí. Každý stav poskytuje určité výhody i nevýhody, protože ďábel je svůdce: hřích se vyplácí, a právě proto se z něj špatně dostává ven.</p>`,
    secs: [
      {
        id: "zpytovani",
        t: "Zpytování svědomí",
        h: `
  <p>Na konci každého sezení nadchází fáze Zpytování svědomí, která posune Svědomí podle nasbíraných bodů ${xl("ctnosti", "hrichy", "hříchu či dobrých skutků")}. Každý hráč hodí <b>d10</b> a porovná:</p>
  <ul class="rl"><li><b>Hříchy ≥ hod</b> → Svědomí −1;</li><li><b>Dobré skutky ≥ hod</b> → Svědomí +1.</li></ul>
  <p>Obojí může platit současně, takže rozervaná duše přešlapuje na místě. Bez bodů se nic neděje – Svědomí samo od sebe neroste ani neklesá.</p>`,
      },
      {
        id: "stavy",
        t: "Stavy svědomí",
        h: `
  ${tb(
    ["Svědomí", "Stav", "Bonus", "Malus"],
    [
      [
        "0",
        '<span class="st st0">Zatracený</span>',
        "Výhoda na Intimidation.<br><b><i>Smlouva s ďáblem</i></b> – jednou za Long Rest můžeš změnit výsledek hodu Závoje na Požehnání. Petr zapřel třikrát, co by se mohlo stát?",
        "Feat víry přestává fungovat. Postava získává Feat: Zatracený.",
      ],
      [
        "1–3",
        '<span class="st st1">Na scestí</span>',
        "Výhoda na Deception.",
        "<b><i>Neklidné sny</i></b> – v rámci obnovy HP při Long Restu si můžeš obnovit jen polovinu HP.",
      ],
      ["4–7", '<span class="st st2">Na vážkách</span>', "—", "—"],
      ["8–10", '<span class="st st3">V milosti</span>', "Imunita vůči Frightened. Výhoda na Insight.", "Nevýhoda na Deception."],
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
    intro: `<p>Během tvorby postavy si každý hráč volí <b>Vyznání</b>. Každé přináší feat víry o třech stupních.</p>`,
    secs: [
      {
        id: "vyznani-volba",
        t: "Tři vyznání",
        h: `<div class="faiths">
  <article class="fcard fc-kal"><img src="${AIMG}kalich.webp" alt="" loading="lazy" width="220" height="220"><h4>Kališník</h4><ol>
   <li><b>Přijímání podobojí</b> 1× za Long Rest umožňuje přijmout krev Boží a obnovit spellslot až do úrovně dle proficiency, nebo Výdrž až do poloviny proficiency.</li>
   <li><b>Pravda Páně</b> Jako akci může postava 1× za Long Rest identifikovat, zda je cíl ovlivněn Závojem (anděl, démon či Proměněnec).</li>
   <li><b>Ktož sú Boží bojovníci!</b> Jako akci zapěje bojový chorál: spojenci v doslechu získají bonus d4 ke všem útokům i saves (1× za Long Rest).</li></ol></article>
  <article class="fcard fc-kat"><img src="${AIMG}klice.webp" alt="" loading="lazy" width="220" height="220"><h4>Katolík</h4><ol>
   <li><b>Přímluva patrona</b> 3× za Long Rest se postava může přimluvit a získat výhodu podle příslušného ${xl("zavoj", "svatky", "světce")}.</li>
   <li><b>Oroduj za nás</b> Jako reakci můžeš 1× za Long Rest sobě nebo spojenci v dosahu 30 stop přehodit save, který selhal.</li>
   <li><b>Ve jménu Páně!</b> Jako akci pozvedne kříž a požádá Boha o pomoc proti démonům a nemrtvým – nižší démony vyhostí, vyšší hází WIS save, při neúspěchu jsou Frightened (1× za Long Rest).</li></ol></article>
  <article class="fcard fc-old"><img src="${AIMG}strom.webp" alt="" loading="lazy" width="220" height="220"><h4>Starověrec</h4><ol>
   <li><b>Zřídlo místa</b> Získává cantrip Druidcraft. Na místě s přítomností Starých bohů umožňuje urychlenou regeneraci – 1× za Long Rest získá okamžitě benefity Short Restu.</li>
   <li><b>Obětina</b> Postava může jednou za Long Rest obětovat něco cenného některému ze Starých bohů a získat možnost seslat kouzlo (dle volby GM).</li>
   <li><b>Vtělení</b> Jako akci na sebe vezme podobu podle vyznávaného Starého boha (Wild Shape). Např. Morana – bílá vlčice z jinovatky.</li></ol></article>
  </div>
  <p class="rsmall">Čísla 1–3 označují stupně featu víry. Ve stavu Zatracený (${xl("svedomi", "stavy", "Svědomí 0")}) feat víry přestává fungovat.</p>`,
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
  <p>Na začátku boje každý hráč hodí <b>d20 + Obratnost</b>. DM hodí za nepřítele s nejlepší iniciativou. Počítá se vždy nejlepší výsledek, který předurčuje <b>sloty</b> pro hráče a pro DM.</p>
  <p>V každém kole se hráči sami domluví, kdo slot obsadí. Nepřátelé jednají ve svých slotech. Obecně platí, že v rámci kola může každý hráč obsadit jen jeden slot.</p>
  <p>Toto pravidlo ale neplatí pro DM, který může v rámci kola využít slot za konkrétní NPC i vícekrát, v závislosti na jeho postavení: <b>pacholek</b> 1×, <b>sok</b> až 2×, <b>zhoubce</b> až 3× za kolo.</p>
  <p><b>Počet slotů:</b> strana, které je víc, má o jeden slot víc než ta menší. Družinu tvoří postavy a jejich spojenci, nepřátele každý houf, sok či zhoubce. Počty se určí na začátku boje a znovu na začátku každého kola.</p>`,
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
   <li><b>Ďáblovo štěstí:</b> když padne na 0 HP a nejde o jistou smrt, hází na Závoj. Při Pokušení přežije a unikne, protože něco za Závojem ho ještě potřebuje…</li></ul></article>
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
    intro: `<p>V D&amp;D je zbraň jen kostka poškození a zbroj jen AC. V Mundus Mutatus mají fyzické postavy možnost učit se šermířské a zápasové techniky, zbraně odrážejí středověkou bojovou realitu a zbroj je skutečně účinná a život zachraňující.</p>`,
    secs: [
      {
        id: "zbroj",
        t: "Zbroj",
        h: `
  <p>Každá zbroj poskytuje kromě AC i <b>Resistance</b> vůči určitým typům zranění. Ta se určuje i podle toho, jak se zbroj běžně nosila, aniž bychom komplikovali pravidla vrstvením zbroje:</p>
  ${tb(
    ["Druh zbroje", "Příklady", "Resistance", "Vydrží critů"],
    [
      [`${bikZb("Vycpávaná")}Vycpávaná`, "Padded, Leather, Studded Leather, Hide", `${bikZr("Bludgeoning")}Bludgeoning`, "1×"],
      [
        `${bikZb("Kroužková")}Kroužková`,
        "Chain Shirt, Scale Mail, Ring Mail, Chainmail",
        `${bikZr("Bludgeoning")}Bludgeoning, ${bikZr("Slashing")}Slashing`,
        "2×",
      ],
      [`${bikZb("Plátová")}Plátová`, "Breastplate, Half-plate, Splint", `${bikZr("Slashing")}Slashing, ${bikZr("Piercing")}Piercing`, "3×"],
      [
        `${bikZb("Komplexní")}Komplexní`,
        "Plate",
        `${bikZr("Bludgeoning")}Bludgeoning, ${bikZr("Slashing")}Slashing, ${bikZr("Piercing")}Piercing`,
        "3×",
      ],
      [`${bikZb("Štít")}Štít`, "—", "—", "1×"],
    ],
  )}
  <h4 class="rh4">Obětování zbroje</h4>
  <p>Zbroj se v boji poškozuje. Při kritickém zásahu může postava <b>obětovat zbroj nebo štít</b> a kritický zásah se změní v běžný. Po vyčerpání počtu v tabulce zbroj či štít přestane poskytovat AC bonus a je nutné je opravit. Opravu obstará kovář, nebo postava s kovářským nářadím během dlouhého odpočinku.</p>
  <h4 class="rh4">Tíha zbroje</h4>
  <ul class="rl">
   <li>V Plátové a Komplexní zbroji postavu únava dožene dvakrát rychleji (Exhaustion z aktivit se zdvojnásobuje).</li>
   <li>Spánek v Kroužkové a těžší zbroji neodstraní úroveň Exhaustion.</li>
   <li>Navléknout Plátovou a Komplexní zbroj trvá 20 minut (s panošem 10).</li></ul>`,
      },
      {
        id: "zbrane",
        t: "Zbraně",
        h: `
  <p>Weapon Mastery z D&amp;D 2024 funguje beze změny. Každá dobře vyrobená zbraň má ale navíc fyzické perky, které platí pro každého, kdo ji používá a má příslušnou zdatnost (proficiency). <b>Pasivní</b> perky platí vždy; <b>aktivní</b> perky se projeví jen podle kostky Závoje – ${Z.B} dává výhodu, odmítnuté ${Z.P} Komplikaci. Žádná zbraň nemá víc než jeden pasivní a jeden aktivní perk; výjimkou jsou meče, halapartna a hákovnice jako zbraně na všechno (u hákovnice si střelec při Požehnání vybere Ničivou, nebo dým – obojí naráz ne).</p>
  ${tb(
    ["Perk", "Zbraně", "Efekt"],
    [
      [
        `${bikZv("Krvežíznivá")}Krvežíznivá`,
        "Sickle, Scimitar, Glaive, Longbow, Shortbow",
        `${Z.B} – cíl bez Resistance vůči typu zranění zbraně krvácí d4 do ošetření.<br>${Z.P} – čepel uvízne v ráně, vytrhnout ji stojí bonusovou akci.`,
      ],
      [`${bikZv("Drtivá")}Drtivá`, "Maul, Mace, Flail, Warhammer", "Ignoruje Resistance zbroje proti Bludgeoning."],
      [
        `${bikZv("Omračující")}Omračující`,
        "Club, Greatclub, Mace, Flail, Morningstar, Maul, Sling",
        `${Z.B} – cíl hází CON save (SO 8 + proficiency bonus útočníka + STR), jinak je do konce svého příštího tahu bez Reakce a má nevýhodu na útoky.<br>${Z.P} – rána sklouzne po zbroji a do svého příštího tahu jsi bez Reakce ty.`,
      ],
      [
        `${bikZv("Ratiště")}Ratiště`,
        "Halberd, Pike, Glaive, Spear",
        "Když nepřítel vstoupí do dosahu zbraně (10 stop), můžeš udělat Opportunity Attack. V kontaktním boji (5 stop) máš ale na útoky nevýhodu.<br>Bonusovou akcí můžeš zbraň zapřít o zem: dokud se nepohneš, Opportunity Attack proti útoku s Vpřed! je automatický kritický zásah a Vpřed! se neuplatní.",
      ],
      [
        `${bikZv("Ničivá")}Ničivá`,
        "Warhammer, War Pick, Heavy Crossbow, Musket (hákovnice)",
        `${Z.B} – zbroj cíle ztrácí jedno obětování.<br>${Z.P} – zbraň se poškodila a praská: ztrácí Ničivou až do opravy.`,
      ],
      [
        `${bikZv("Průrazná")}Průrazná`,
        "Handgun (píšťala), Musket (hákovnice), Heavy Crossbow, Lance, Halberd, War Pick",
        "Ignoruje Resistance zbroje proti Piercing.",
      ],
      [
        `${bikZv("Odvetná")}Odvetná`,
        "Shortsword, Longsword, Rapier, Greatsword",
        `${Z.B} – vazba: cíl na tebe do konce svého příštího tahu nemůže použít Reakci. Navíc: když tě nepřítel mine útokem na blízko s Pokušením, můžeš Reakcí provést protiútok.<br>${Z.P} – čepele se zaklesnou: ztrácíš Reakci.`,
      ],
      [`${bikZv("Šikovná")}Šikovná`, "Shortsword, Longsword, Greatsword, Halberd", "Před hodem na útok umožňuje zvolit typ poškození podle zbraně."],
      [
        `${bikZv("Přibodnutí")}Přibodnutí`,
        "Spear, Pike",
        `${Z.B} – cíl je hrotem přidržen: do začátku tvého příštího tahu má rychlost 0, ty se ale nesmíš pohnout.<br>${Z.P} – hrot uvízne ve zbroji: cíl ti může Reakcí vytrhnout zbraň (STR save, SO 12).`,
      ],
      [`${bikZv("Ostrá")}Ostrá`, "Shortsword, Longsword, Greatsword, Scimitar, Battleaxe", "Při Slashing proti cíli bez Resistance critne na 19–20."],
      [
        `${bikZv("Půlmeč")}Půlmeč`,
        "Longsword, Greatsword",
        "Bonusovou akcí provedeš přehmat zbraně: Piercing útoky získávají perk Průrazná, ale kostka poškození klesá o stupeň (<i>tj. d8 na d6</i>).",
      ],
      [
        `${bikZv("Do slabin!")}Do slabin!`,
        "Dagger",
        `${Z.B} – pokud je cíl Restrained nebo Prone, jde o automatický kritický zásah.<br>${Z.P} – dýka sklouzne po plátu, další útok proti tobě má výhodu.`,
      ],
      [
        `${bikZv("Strhující")}Strhující`,
        "Halberd",
        `${Z.B} – umožňuje strhnout cíl k zemi (cíl hází CON save, zda bude Prone).<br>${Z.P} – hák se zasekne v postroji: cíl tě strhne o 5 stop k sobě a může Reakcí zaútočit.`,
      ],
      [`${bikZv("Vpřed!")}Vpřed!`, "Lance", "Po jízdě aspoň 15 stop rovně se zdvojnásobuje poškození na kostkách (crit 4×)."],
      [
        `${bikZv("Štěpící")}Štěpící`,
        "Greataxe, Handaxe, Battleaxe",
        `${Z.B} – zničí štít nepřítele, má-li štít.<br>${Z.P} – sekera uvízne ve štítu: cíl ji může Reakcí vytrhnout (STR save, SO 12).`,
      ],
      [`${bikZv("Nepřímá")}Nepřímá`, "Longbow, Shortbow, Sling", "Projektil je možné vystřelit obloukem: ignoruje bonus polovičního krytu."],
      [
        `${bikZv("Hrom a kouř!")}Hrom a kouř!`,
        "Handgun (píšťala), Musket (hákovnice)",
        `${Z.B} – zahalí střelce v dýmu a dá mu na 1 kolo výhodu proti útokům zblízka.<br>${Z.P} – zbraň selže a před dalším výstřelem ji musíš vyčistit (bonusová akce); pokud jsi minul a u cíle stojí spojenec, zasáhneš spojence; při 1 na d20 a 1 na Závoji zbraň vybuchne a způsobí střelci 2d8 Fire.`,
      ],
    ],
  )}`,
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
  <p>Podobně jako mágové sesílají kouzla za spellsloty, válečníci využívají pro techniky a chvaty <b>Výdrž (V)</b>. Fighter má Výdrž rovnou svému proficiency bonusu, ostatní uvedená povolání polovině proficiency bonusu. Výdrž se obnovuje Long Restem. Feat Martial Adept přidává 1 Výdrž (i postavě bez Výdrže z povolání).</p>
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
        "Provedeš sek s vazbou soupeřovy čepele. Získáváš výhodu na následující útok proti tomuto cíli a on má proti tobě nevýhodu.",
      ],
      [
        "Křížný sek <i>(Zwerchhau)</i>",
        "1V + reakce",
        "Pokud tě zasáhne útok na blízko, můžeš si přidat +2 AC a současně provést okamžitý protiútok.",
      ],
      [
        "Křivý sek <i>(Krumphau)</i>",
        "1V + reakce + Pokušení nepřítele",
        "Pokud na tebe nepřítel zaútočí s Pokušením, udeříš ho sekem do rukou dřív, než rána může dopadnout. Cíl hází STR save: při neúspěchu upustí zbraň a jeho útok se vůbec neuskuteční; při úspěchu dostaneš pouze poloviční poškození.",
      ],
      [
        "Šilhavý sek <i>(Schielhau)</i>",
        "1V + Požehnání",
        "Dobře načasovaným sekem zlomíš nepřítelův sek – do konce svého příštího tahu má nevýhodu na útoky.",
      ],
      [
        "Dělný sek <i>(Scheitelhau)</i>",
        "1V + reakce",
        "Když nepřítel vstoupí do tvého dosahu, zaútočíš dřív, než dokončí svůj úder, a defenzivně ustoupíš: proveď útok a získáváš efekt, jako bys udělal Dodge.",
      ],
      [
        "Vražedný úder <i>(Mordschlag)</i>",
        "1V + bonusová akce",
        "Chytíš meč za čepel a udeříš nepřítele záštitou. Do konce tahu má zbraň Bludgeoning s perkem Drtivá.",
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
        "Po zásahu zbraní jdeš nepříteli do těla. Cíl hází STR/DEX save: při neúspěchu je Restrained nebo Prone podle tvé volby.",
      ],
      ["Hod přes bok", "1V + Požehnání", "Po zásahu Unarmed útokem hází cíl STR/DEX save: při neúspěchu je Restrained a Prone."],
      [
        "Mordstösse",
        "1V + Požehnání",
        "Unarmed úder do hrdla nebo spánku: do konce svého příštího tahu cíl nemůže mluvit (nemůže kouzlit verbálně) a přichází o reakci.",
      ],
      ["Zůstaň!", "1V + Požehnání", "Pokud je cíl Prone nebo Restrained, hází DEX save: při neúspěchu je znehybněn do konce tvého příštího tahu."],
      [
        "Zlom <i>(Bruch)</i>",
        "1V + reakce",
        "Když se tě soupeř snaží povalit, chytit nebo tě už drží, vyvolá to Contested Roll, v němž máš výhodu. Při úspěchu se situace obrací (nejsi Restrained, ale soupeř je).",
      ],
      [
        "Lámání paže",
        "1V + reakce + Pokušení nepřítele",
        `Když tě Restrained soupeř napadne, hází CON save s nevýhodou: při neúspěchu má zlomenou paži (${xl("kriticka", "fyzicka", "kritické zranění")}).`,
      ],
      [
        "Zápas o zbraň",
        "1V + reakce",
        "Když na tebe někdo útočí lehkou zbraní (dýka), hází STR/DEX save: při neúspěchu útok mine a zbraň máš ve svých rukou.",
      ],
      [
        "Zápas ve zbroji <i>(Ringen im Harnisch)</i>",
        "1V + bonusová akce",
        "Proti Restrained nebo Prone soupeři ignorují tvé útoky dýkou do konce tahu jakoukoli Resistance zbroje.",
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
    <li><b>Zrušený krit nic nespouští.</b> Kritický zásah, který cíl obětováním zbroje či štítu změnil v běžný, nespouští přínosy navázané na kritický zásah (Crusher, Piercer, Slasher, Lords' Alliance Agent…).</li>
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
        "Výměnu iniciativy nahrazuje <b>Pohotovost</b>: jednou za boj uskutečníš svůj tah před tahem libovolného nepřítele; nepřítel jedná až po tobě.",
      ],
      [
        "Heavy Armor Master",
        "Těžká zbroj snese o 1 obětování víc, únava se ti v ní nezdvojnásobuje a obléknout ji zvládneš za polovinu času (10 minut, s panošem 5).",
      ],
      [
        "Delicious Pain",
        "<b>Zocelené tělo</b>: jednou za krátký či dlouhý odpočinek změníš kritický zásah v běžný, aniž bys obětoval zbroj nebo štít.",
      ],
      ["Polearm Master", "U zbraní s perkem Ratiště místo Pohotového úderu: bez nevýhody v kontaktním boji a zapření proti Vpřed! reakcí."],
      ["Charger", "Bonus 1k8 se perkem Vpřed! nezdvojnásobuje."],
      [
        "Gunner",
        "Zdatnost s píšťalou a hákovnicí; Nabíjecí tě neomezuje, ale každé nabití stojí bonusovou akci; čištění po Pokušení u Hrom a kouř! tě nestojí akci.",
      ],
      [
        "Healer (Felčar)",
        "Počítáš se jako felčar (výhoda na CON záchranu po Těžkém kritickém zranění), krvácení zastavíš akcí Použití; postavu na 0 HP jen stabilizuješ.",
      ],
      ["Durable", "Výhoda i na CON záchranu proti vyčerpání po Těžkém či horším kritickém zranění."],
      ["Martial Adept", "Místo manévrů dvě šermířské techniky nebo zápasnické chvaty (bez hledání mistra) a +1 Výdrž, i bez Výdrže z povolání."],
      ["Boon of Irresistible Offense", "Ignoruje i Resistance zbroje."],
    ],
  )}
  ${note("Vyřazeno.", "Revenant Blade (jméno patří featu Revenant pro Navrácené) a Fighting Initiate (bojové styly jsou v D&amp;D 2024 samy featy).")}`,
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
  <p>Pád na 0 HP znamená <b>bezvědomí</b>, death saves, hod na ${xl("kriticka", "", "kritické zranění")} a <b>jednu úroveň vyčerpání</b>.</p>
  <p>Léčení postavu jen stabilizuje, nevrací ji automaticky do boje – postava je mimo boj až do jeho konce, ledaže je vrácena do hry kouzlem Lesser či Greater Restoration.</p>
  <p>Po boji s Těžkým nebo horším kritickým zraněním hází postava <b>CON save</b> (s felčarem s výhodou). Při neúspěchu získává jednu úroveň vyčerpání denně, dokud neuspěje.</p>`,
      },
      {
        id: "zavaznost",
        t: "Závažnost kritických zranění",
        h: `
  <p>Kritické zásahy jsou mnohem horší než v klasickém D&amp;D 2024. S každým critem hází postava na kritické zranění a jeho následky. Jak vážné bude, rozhodne <b>d10</b>:</p>
  <ul class="rl"><li>+1 za každé kritické zranění, které nebylo vyléčeno;</li><li>+1 za každých 5 HP pod hodnotu 0 HP.</li></ul>
  ${tb(
    ["d10", "Závažnost"],
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
        h: `<p>Zahojená Vážná nebo Smrtelná rána zanechává <b>jizvu</b>, která dává výhodu na Intimidation a nevýhodu na Persuasion v souvislosti se sváděním.</p>`,
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
    ["d6", "Zasažená část"],
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
   <li><b>Těžká</b> trvají až do vyléčení (Medicine check).</li>
   <li><b>Vážná</b> jsou trvalá, nejsou-li včas vyléčena zkušeným mágem či prvotřídním felčarem.</li>
   <li><b>Smrtelná</b> znamenají bezvědomí a 2 neúspěšné death saves; přežije-li postava, následek je trvalý.</li>
   <li><b>Krvácení</b> pokračuje každé kolo až do ošetření.</li></ul>
  <p class="rsmall">Zranění typu Force a Thunder mají efekty jako fyzická kritická zranění.</p>`,
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
        "<b>Otřes mozku</b> – Exhaustion, nevýhoda na INT skillchecky",
        "<b>Znetvoření</b> – nevýhoda na Perception + krvácení d8",
        "<b>Rozpoltěná lebka</b>",
      ],
      [
        "Trup",
        "<b>Vyražený dech</b> – poloviční pohyb",
        "<b>Krvácivá rána</b> – krvácení d6",
        "<b>Polámaná žebra</b> – nevýhoda na CON saves + krvácení d8",
        "<b>Proklaté útroby</b>",
      ],
      [
        "Paže",
        "<b>Rána přes prsty</b> – upustíš, co držíš",
        "<b>Zlomenina</b> – nevýhoda na STR/DEX skillchecky",
        "<b>Rozdrcené předloktí</b> – nevýhoda na útoky + krvácení d8",
        "<b>Useknutá paže</b>",
      ],
      [
        "Nohy",
        "<b>Podražení</b> – Prone",
        "<b>Zlomená noha</b> – poloviční pohyb",
        "<b>Přeťatá tepna</b> – pohyb 10 stop + krvácení d8",
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
        "<b>Vzplanutí</b> – hoříš d4",
        "<b>Popáleniny</b> – Exhaustion",
        "<b>Vypálené oči</b> – nevýhoda na Perception a útoky na dálku",
        "<b>Uhoření zaživa</b>",
      ],
      [
        "Mráz",
        "<b>Ztuhlé údy</b> – poloviční pohyb",
        "<b>Zkřehlé údy</b> – nevýhoda na DEX saves",
        "<b>Prsty z ledu</b> – nevýhoda na attack rolls",
        "<b>Zamrzlé srdce</b>",
      ],
      [
        "Kyselina / Jed",
        "<b>Dávení</b> – bez reakce a bonusové akce",
        "<b>Žíravina</b> – nevýhoda na CON saves",
        "<b>Černá krev</b> – Poisoned",
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
        "<b>Pomatení</b> – nevýhoda na WIS saves",
        "<b>Hlasy v hlavě</b> – nevýhoda na INT/WIS skillchecky a Concentration",
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
   <a class="qk" href="#artikule/zavoj/kostka"><b>Kostka Závoje · d6</b><span>1–2 ${Z.P}</span><span>3–4 bez efektu</span><span>5–6 ${Z.B}</span></a>
   <a class="qk" href="#artikule/svedomi/stavy"><b>Svědomí · 0–10</b><span>0 Zatracený</span><span>1–3 Na scestí</span><span>4–7 Na vážkách</span><span>8–10 V milosti</span></a>
   <a class="qk" href="#artikule/zraneni/zavaznost"><b>Kritické zranění · d10</b><span>1–5 Lehká · 6–9 Těžká</span><span>10–12 Vážná · 13+ Smrtelná</span><span>Část těla: kostka Závoje</span></a></div>`;
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
