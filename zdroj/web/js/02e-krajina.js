/* @čisté – Krajina roku 1458 na mapě zemí (2026-10-26, Vojta): přechody (průsmyky, mosty, brody, přívozy), hospodářství (doly, sůl,
   železo; vinice, obilnice, chmelnice, rybníky) a kraje zpustlé válkami. Jen data a výpočty bez stránky: kresba je v 02b, panel
   místa v 02 (krajHtml), Výprava (22b) z nich bere zdržení na přechodech podle počasí (prechodStav) a kraj „válka“ (zpustlyKraj).
   PRECHODY [jméno, druh prusmyk|most|brod|privoz, délka, šířka, sezóna "z" (zima: sníh v sedle) | "j" (jaro: velká voda) | "", pozn]
   HOSP_BODY [jméno, druh dul|sul|hut|jine, co se dobývá, délka, šířka, pozn] · HOSP_OBL [jméno, druh vinice|obili|chmel|rybniky,
   obrys, pozn] · ZPUSTLE [jméno, míra 1 (místy) | 2 (zle), obrys, pozn]. Texty jsou dobovou mluvou, nic po březnu 1458. ===== */
const PRECHODY = [
  [
    "Všerubský průsmyk",
    "prusmyk",
    12.98,
    49.34,
    "",
    "Nízké sedlo mezi Šumavou a Českým lesem, jímž se jde z Kdyně do Bavor. Odedávna brána, kudy do Čech táhla vojska cizí.",
  ],
  [
    "Domažlický průsmyk",
    "prusmyk",
    12.85,
    49.36,
    "",
    "Tudy vede stezka z Prahy přes Plzeň a Domažlice na Řezno. Hraniční stráž chodských sedláků jej střeží od starodávna.",
  ],
  ["Rozvadovský přechod", "prusmyk", 12.52, 49.65, "", "Na této cestě, kterou dal Karel IV. upraviti, jezdí kupci z Prahy přes Tachov na Norimberk."],
  [
    "Zlatá stezka – prachatická větev",
    "prusmyk",
    13.74,
    48.86,
    "z",
    "Hlavní cesta Zlaté stezky z Pasova přes Volary do Prachatic. Soumaři nesou do Čech sůl, z Čech vezou obilí a sukno; v zimě sníh hluboký.",
  ],
  [
    "Zlatá stezka – vimperská větev (u Kunžvartu)",
    "prusmyk",
    13.63,
    48.9,
    "z",
    "Větev Zlaté stezky z Pasova k Vimperku, již střeží hrad Kunžvart. Soumarské stezce v zimě vévodí sníh a vlci.",
  ],
  [
    "Zlatá stezka – kašperskohorská větev (Kvilda)",
    "prusmyk",
    13.5,
    48.96,
    "z",
    "Nejvýše položená větev Zlaté stezky, přes Kvildu ke Kašperským Horám. Pustá hvozdová končina, kde sníh leží dlouho do jara.",
  ],
  [
    "Nakléřovský průsmyk",
    "prusmyk",
    13.98,
    50.73,
    "z",
    "Sedlo Krušných hor nad Chlumcem, kudy vede cesta z Míšně do Čech. Zde roku 1126 kníže Soběslav porazil krále Lothara.",
  ],
  [
    "Saydská stezka",
    "prusmyk",
    13.43,
    50.66,
    "z",
    "Hřebenem Krušných hor vede stezka z Mostu na Freiberk a do Míšně, po níž se vozí sůl a stříbro. V zimě bývá zavátá.",
  ],
  ["Jitravské sedlo", "prusmyk", 14.83, 50.8, "", "Sedlo pod Lužickými horami, kudy jde cesta z Prahy přes Jablonné na Žitavu a do Lužic."],
  [
    "Libavské sedlo",
    "prusmyk",
    15.99,
    50.7,
    "",
    "Nízká brána mezi Krkonošemi a Vraními horami, kudy jde cesta z Trutnova na Lubavu a Svídnici do Slezska.",
  ],
  [
    "Náchodský průsmyk",
    "prusmyk",
    16.2,
    50.43,
    "",
    "Brána z Čech do Kladska, kterou střeží hrad Náchod. Vede tudy stezka Polská z Prahy přes Kladsko do Vratislavi.",
  ],
  ["Bardská soutěska", "prusmyk", 16.74, 50.51, "", "Úzké údolí, jímž Kladská Nisa prorazila hory; tudy se jde z Kladska na Vratislav."],
  [
    "Moravská brána",
    "prusmyk",
    17.8,
    49.59,
    "",
    "Široká brána mezi Beskydy a Jeseníky, kudy jde cesta z Olomouce do Slezska a Polska. Hor tu není, sníh cestu nezavře.",
  ],
  [
    "Jablunkovský průsmyk",
    "prusmyk",
    18.75,
    49.52,
    "",
    "Sedlo v Beskydech, kudy se jde z Těšínska do Uher, k Žilině a Váhu. Hustý hvozd, v zimě cesta tvrdá.",
  ],
  [
    "Vlárský průsmyk",
    "prusmyk",
    18.07,
    49.02,
    "",
    "Brána v Bílých Karpatech, kudy jde cesta z Uherského Brodu k Trenčínu. Tudy táhnou kupci i vojska z Moravy do Uher.",
  ],
  [
    "Semmering",
    "prusmyk",
    15.83,
    47.63,
    "z",
    "Horské sedlo mezi Rakousy a Štýrskem, kudy jdou kupci z Vídně k Benátkám. Špitál pod sedlem chrání pocestné; v zimě sníh hluboký.",
  ],
  [
    "Kamenný most v Praze",
    "most",
    14.41,
    50.09,
    "",
    "Kamenný most Karla IV. přes Vltavu spojuje Staré Město s Malou Stranou. Staroměstská mostecká věž, dílo Parléřovo, střeží jeho vstup.",
  ],
  [
    "Kamenný most v Písku",
    "most",
    14.14,
    49.31,
    "",
    "Kamenný most přes Otavu, nejstarší v Čechách, stojí od třináctého věku. Vede po něm cesta z Prahy k Prachaticím.",
  ],
  [
    "Kamenný most v Roudnici",
    "most",
    14.26,
    50.43,
    "",
    "Most přes Labe, jejž dal stavěti biskup Jan z Dražic. Povodně jej nejednou pobořily, avšak stojí a táhla po něm i vojska husitská.",
  ],
  [
    "Kamenný most v Drážďanech",
    "most",
    13.74,
    51.05,
    "",
    "Kamenný most přes Labe o mnoha obloucích, z nejdelších v Němcích. Vede po něm cesta z Míšně do Čech.",
  ],
  [
    "Kamenný most v Řezně",
    "most",
    12.1,
    49.02,
    "",
    "Kamenný most přes Dunaj stojí od dvanáctého věku a slove divem Němec. Po něm jdou kupci z Čech dále do Říše.",
  ],
  [
    "Kamenný most v Kladsku",
    "most",
    16.65,
    50.44,
    "",
    "Gotický kamenný most přes Mlýnskou strouhu Nisy pod hradem kladským, z konce čtrnáctého věku.",
  ],
  [
    "Dunajské mosty ve Vídni",
    "most",
    16.39,
    48.23,
    "",
    "Roku 1439 přepjali Vídeňští všecka ramena Dunaje mosty dřevěnými, aby nebylo třeba převážeti.",
  ],
  [
    "Odranské mosty ve Vratislavi",
    "most",
    17.05,
    51.11,
    "",
    "Mosty dřevěné spojují Vratislav s Tumským ostrovem a s druhým břehem Odry. Za mostné se platí clo.",
  ],
  [
    "Most přes Nisu ve Zhořelci",
    "most",
    14.99,
    51.16,
    "",
    "Most přes Nisu stojí tu od roku 1298, kudy vede královská cesta z Lipska do Vratislavi. Jest dřevěný a často obnovovaný.",
  ],
  [
    "Brod u Brandýsa",
    "brod",
    14.66,
    50.19,
    "j",
    "Brod přes Labe, jejž střeží hrad Brandýs, na cestě z Prahy do Boleslavi a Lužic. Na jaře se Labe rozlévá a brod nelze přejíti.",
  ],
  ["Brod u Poděbrad", "brod", 15.12, 50.14, "j", "Brod přes Labe na cestě z Prahy ke Kladsku, střežený hradem poděbradským, dědictvím krále Jiřího."],
  ["Vyšší Brod", "brod", 14.31, 48.62, "j", "Brod přes Vltavu na cestě z Linců do Krumlova, nad nímž stojí klášter cisterciáků, fundace Rožmberků."],
  [
    "Německý Brod",
    "brod",
    15.58,
    49.61,
    "j",
    "Horní město při brodu přes Sázavu na Haberské stezce z Moravy do Čech. Za válek husitských jej dobyl Žižka.",
  ],
  ["Uherský Brod", "brod", 17.65, 49.03, "j", "Město při brodu přes Olšavu na cestě z Moravy do Uher přes Vlárský průsmyk."],
  [
    "Brod u Hodonína",
    "brod",
    17.13,
    48.85,
    "j",
    "Přechod přes řeku Moravu z Moravy do Uher, k Holíči a Skalici. Široká niva se na jaře mění v jezero.",
  ],
  [
    "Přívoz v Prešpurku",
    "privoz",
    17.11,
    48.14,
    "j",
    "Pod hradem prešpurským se převáží přes Dunaj; mostu tu není. Na jaře nesou vody led a převoz stojí.",
  ],
  ["Přívoz v Komárně", "privoz", 18.13, 47.75, "j", "Při soutoku Váhu s Dunajem stojí hrad Komárno; převoz přes Dunaj vede do Zadunají."],
  ["Přívoz v Ostřihomi", "privoz", 18.74, 47.79, "j", "Pod sídlem arcibiskupa ostřihomského se převáží přes Dunaj."],
  ["Přívoz v Kremži", "privoz", 15.59, 48.4, "j", "Mezi Kremží a Mauternem se převáží přes Dunaj; mostu tu není."],
  ["Přívoz v Linci", "privoz", 14.29, 48.31, "j", "V Linci se převáží přes Dunaj; tudy jde sůl z hor solných k Cáhlovu a do Čech."],
  [
    "Přívoz v Trenčíně",
    "privoz",
    18.04,
    48.89,
    "j",
    "Pod hradem trenčínským se převáží přes Váh na cestě z Moravy do Horních Uher. Váh na jaře divoce stoupá.",
  ],
];
const HOSP_BODY = [
  [
    "Kutná Hora",
    "dul",
    "stříbro",
    15.27,
    49.95,
    "Nejbohatší horní město království; po vypálení za válek husitských se doly opět probouzejí. Ve Vlašském dvoře sídlí královská mincovna.",
  ],
  [
    "Jihlava",
    "dul",
    "stříbro",
    15.59,
    49.4,
    "Jihlavské doly stříbrné, kdysi slavné, jsou z valné části vyčerpány; horní právo jihlavské však platí po všech horách.",
  ],
  ["Stříbro", "dul", "stříbro a olovo", 12.99, 49.75, "Město nad Mží, jež jméno má po stříbře; dolují tu stříbro a olovo."],
  ["Šťávnice (Banská Štiavnica)", "dul", "stříbro", 18.9, 48.45, "Horní město v Uhrách, z nejbohatších dolů stříbrných v celém křesťanstvu."],
  ["Kremnice", "dul", "zlato", 18.92, 48.7, "Kremnice dobývá zlato a v mincovně razí zlaté uherské, po všech zemích vážené."],
  ["Bystřice (Banská Bystrica)", "dul", "měď", 19.15, 48.74, "Horní město v Uhrách, jež dobývá měď a stříbro."],
  ["Gelnice", "dul", "stříbro a měď", 20.94, 48.86, "Horní město na Spiši, kde se dobývá stříbro a měď."],
  ["Jílové", "dul", "zlato", 14.49, 49.9, "Jílové u Prahy, kdysi zlatem bohaté; za válek husitských doly upadly a vydávají jen skrovně."],
  [
    "Kašperské Hory",
    "dul",
    "zlato",
    13.56,
    49.14,
    "Horní město v Šumavě, střežené hradem Kašperkem, dobývá zlato; po Zlaté stezce sem přichází sůl.",
  ],
  [
    "Cukmantl (Zlaté Hory)",
    "dul",
    "zlato",
    17.4,
    50.26,
    "Horní město v Jesenických horách, náležející biskupství vratislavskému, kde se rýžuje a dobývá zlato.",
  ],
  ["Rychleby (Złoty Stok)", "dul", "zlato", 16.87, 50.44, "Horní místo v Rychlebských horách na pomezí Kladska, kde se dobývá zlato."],
  ["Krupka", "dul", "cín", 13.86, 50.68, "Horní město pod Krušnými horami, kde se dobývá cín, jenž se rozváží po mnohých zemích."],
  ["Slavkov", "dul", "cín", 12.81, 50.14, "Horní Slavkov ve Slavkovském lese dobývá cín."],
  ["Freiberk", "dul", "stříbro", 13.34, 50.92, "Nejbohatší horní město Míšně, kde se od dvanáctého věku dobývá stříbro; markrabí zde mají mincovnu."],
  ["Olkuš (Olkusz)", "dul", "olovo a stříbro", 19.57, 50.28, "Horní město v zemi krakovské, kde se dobývá olovo a stříbro."],
  ["Mansfeld", "dul", "měď", 11.45, 51.59, "Hrabství mansfeldské v podhůří Harcu, kde se z břidlice taví měď; hutí je tu mnoho."],
  [
    "Věličky (Wieliczka)",
    "sul",
    "sůl kamenná",
    20.06,
    49.99,
    "Solné doly krále polského u Krakova; z hlubin se tu láme sůl kamenná a vozí do Slezska i dál.",
  ],
  ["Bochně (Bochnia)", "sul", "sůl kamenná", 20.43, 49.97, "Druhé královské solné doly v zemi krakovské, starší nežli Věličky."],
  ["Hallstatt", "sul", "sůl", 13.65, 47.56, "Solné hory v Rakousích nad jezerem; sůl odtud jde přes Linec a Cáhlov do Budějovic a do Čech."],
  ["Hallein", "sul", "sůl", 13.1, 47.68, "Solné doly arcibiskupa solnohradského; sůl plyne po vodě k Pasovu a po Zlaté stezce do Čech."],
  ["Reichenhall", "sul", "sůl", 12.88, 47.72, "Solivary vévodů bavorských; sůl odtud jde přes Pasov do Čech."],
  ["Halle", "sul", "sůl", 11.97, 51.48, "Město solivarů na Sále, arcibiskupství magdeburského; sůl odtud se vozí do Míšně a Lužic."],
  [
    "Železná hora (Erzberg)",
    "hut",
    "železo",
    14.9,
    47.52,
    "Hora ve Štýrsku, z níž se láme železná ruda; štýrské železo se vozí přes Steyr a Cáhlov do Čech.",
  ],
  ["Amberk", "hut", "železo", 11.86, 49.44, "Hlavní město Horní Falce, kde se dobývá a taví železo; hamrů je v té zemi nesčíslně."],
  [
    "Cáhlov (Freistadt)",
    "jine",
    "sůl a železo",
    14.5,
    48.51,
    "Rakouské město na Linecké stezce s právem skladu; kupci tu skládají sůl a železo, jež jdou do Čech.",
  ],
];
const HOSP_OBL = [
  [
    "Mělnické vinice",
    "vinice",
    [
      [14.4, 50.32],
      [14.52, 50.39],
      [14.58, 50.34],
      [14.52, 50.28],
      [14.42, 50.28],
    ],
    "Vinice nad soutokem Vltavy s Labem, kam Karel IV. dal přivézti révu burgundskou. Mělnické víno se pije i na dvoře královském.",
  ],
  [
    "Litoměřické vinice",
    "vinice",
    [
      [14.05, 50.52],
      [14.18, 50.57],
      [14.26, 50.54],
      [14.2, 50.49],
      [14.08, 50.48],
    ],
    "Vinice na stráních Středohoří při Labi, u Litoměřic a Žernosek.",
  ],
  [
    "Pražské vinice",
    "vinice",
    [
      [14.36, 50.12],
      [14.48, 50.13],
      [14.53, 50.07],
      [14.46, 50.03],
      [14.38, 50.05],
    ],
    "Vinice kolem Prahy, jež dal Karel IV. roku 1358 zakládati na stráních do tří mil od města.",
  ],
  [
    "Znojemské vinice",
    "vinice",
    [
      [15.9, 48.9],
      [16.1, 48.95],
      [16.3, 48.9],
      [16.25, 48.78],
      [16.0, 48.76],
    ],
    "Vinice nad Dyjí u Znojma; víno znojemské se vozí do Čech i na Moravu.",
  ],
  [
    "Mikulovské vinice",
    "vinice",
    [
      [16.45, 48.88],
      [16.7, 48.9],
      [16.85, 48.78],
      [16.7, 48.72],
      [16.5, 48.75],
    ],
    "Vinice pod Pavlovskými vrchy u Mikulova, na pomezí Moravy a Rakous.",
  ],
  [
    "Vachov (Wachau)",
    "vinice",
    [
      [15.3, 48.22],
      [15.4, 48.3],
      [15.62, 48.43],
      [15.68, 48.4],
      [15.45, 48.26],
      [15.33, 48.19],
    ],
    "Vinice v údolí Dunaje mezi Melkem a Kremží, kde klášterové pěstují víno po stráních.",
  ],
  [
    "Polabí",
    "obili",
    [
      [14.6, 50.25],
      [15.1, 50.27],
      [15.8, 50.25],
      [15.85, 50.05],
      [15.3, 49.98],
      [14.7, 50.05],
    ],
    "Úrodná rovina při Labi od Mělníka po Hradec; obilí odtud živí Prahu i horní města.",
  ],
  [
    "Haná",
    "obili",
    [
      [16.95, 49.75],
      [17.35, 49.7],
      [17.5, 49.45],
      [17.35, 49.25],
      [17.05, 49.35],
      [16.95, 49.55],
    ],
    "Úrodná rovina kolem Olomouce a Kroměříže, nejbohatší obilnice Moravy.",
  ],
  [
    "Žatecko a Lounsko",
    "chmel",
    [
      [13.35, 50.3],
      [13.55, 50.42],
      [13.85, 50.4],
      [13.9, 50.3],
      [13.6, 50.22],
      [13.4, 50.22],
    ],
    "Kraj nad Ohří, kde se pěstuje chmel dávno slavný a obilí hojné.",
  ],
  [
    "Třeboňské rybníky",
    "rybniky",
    [
      [14.65, 49.1],
      [14.9, 49.12],
      [14.95, 48.95],
      [14.85, 48.85],
      [14.7, 48.9],
    ],
    "Bažinatý kraj kolem Třeboně, kde páni z Rožmberka a augustiniáni třeboňští zakládají rybníky, dosud však menší.",
  ],
  [
    "Milické rybníky (Barycz)",
    "rybniky",
    [
      [17.05, 51.48],
      [17.25, 51.6],
      [17.55, 51.58],
      [17.6, 51.48],
      [17.3, 51.45],
    ],
    "Rybníky při řece Baryči u Milíče ve Slezsku, jež zakládali cisterciáci z Lubuše již před dvěma věky.",
  ],
];
const ZPUSTLE = [
  [
    "Zpustlé Plzeňsko a Tachovsko",
    2,
    [
      [12.45, 49.95],
      [13.15, 50.0],
      [13.65, 49.85],
      [13.6, 49.55],
      [13.1, 49.35],
      [12.7, 49.38],
      [12.45, 49.6],
    ],
    "Tudy táhly křížové výpravy, jež husité porazili u Tachova (1427) a u Domažlic (1431). Polní vojska pak Plzeň oblehla od léta 1433 do jara 1434 a okolní kraj vyjedla a vypálila.",
  ],
  [
    "Zpustlé Ústecko a Chomutovsko",
    1,
    [
      [13.3, 50.55],
      [13.7, 50.7],
      [14.15, 50.75],
      [14.3, 50.6],
      [14.0, 50.45],
      [13.6, 50.38],
      [13.3, 50.42],
    ],
    "Chomutov vybili husité roku 1421. U Ústí roku 1426 porazili vojsko míšeňské a město samo vyvrátili, takže léta stálo pusté.",
  ],
  [
    "Zpustlé pomezí táborské a rožmberské",
    1,
    [
      [13.85, 49.3],
      [14.4, 49.55],
      [14.95, 49.45],
      [15.1, 49.1],
      [14.75, 48.75],
      [14.2, 48.7],
      [13.85, 48.95],
    ],
    "Mezi Táborem a panstvím rožmberským se za válek léta pálilo a loupilo. Po roce 1449 tu jednota strakonická vedla boj s Jiřím z Poděbrad, až se mu roku 1452 Tábor poddal.",
  ],
  [
    "Zpustlé Znojemsko",
    1,
    [
      [15.5, 49.05],
      [16.1, 49.1],
      [16.8, 48.95],
      [16.95, 48.75],
      [16.4, 48.72],
      [15.9, 48.75],
      [15.5, 48.85],
    ],
    "Moravské pomezí s Rakousy plenila od roku 1420 vojska vévody Albrechta i husitské houfy, jež táhly do Rakous; mnohá ves u Znojma tehdy zpustla.",
  ],
  [
    "Zpustlé Rakousy nad Dunajem",
    2,
    [
      [14.75, 48.75],
      [15.3, 48.95],
      [15.95, 48.8],
      [16.9, 48.7],
      [16.6, 48.3],
      [15.7, 48.38],
      [14.9, 48.3],
    ],
    "Kraje na sever od Dunaje plenili husité v letech 1425–1431, mezi jinými Retz, Zwettl a Altenburk. Po smrti krále Ladislava (1457) se o Rakousy přou Habsburkové.",
  ],
  [
    "Zpustlé Nisko a Kladsko",
    2,
    [
      [16.4, 50.6],
      [16.9, 50.9],
      [17.6, 50.95],
      [18.1, 50.6],
      [17.8, 50.25],
      [17.0, 50.2],
      [16.5, 50.25],
    ],
    "Od roku 1428 vpadali husité spanilými jízdami do Slezska a pálili kolem Nisy a Kladska. Do roku 1435 drželi ve slezských knížectvích posádky a z nich plenili okolí.",
  ],
  [
    "Zpustlá Horní Lužice",
    2,
    [
      [14.0, 51.35],
      [14.6, 51.4],
      [15.2, 51.35],
      [15.45, 51.1],
      [15.1, 50.85],
      [14.6, 50.85],
      [14.05, 51.1],
    ],
    "Šestiměstí stálo při Zikmundovi, i navštěvovali je husité ohněm: Lubáň vyvrátili roku 1427 i 1431, Kamenec vypálili roku 1429 a Budyšín téhož léta marně obléhali.",
  ],
  [
    "Zpustlé Fojtsko a východní Durynsko",
    2,
    [
      [11.75, 51.1],
      [12.5, 51.15],
      [13.0, 50.95],
      [12.9, 50.6],
      [12.4, 50.35],
      [11.9, 50.4],
      [11.7, 50.75],
    ],
    "Roku 1430 vypálili husité Plavno. V bratrovražedné válce saských knížat (1446–1451) vedl vévoda Vilém české žoldnéře a Gera roku 1450 lehla popelem; mír naumburský 1451 válku skončil.",
  ],
  [
    "Zpustlé Lubušsko",
    1,
    [
      [13.55, 52.7],
      [14.0, 52.7],
      [14.65, 52.7],
      [14.7, 52.3],
      [14.3, 52.25],
      [13.8, 52.4],
      [13.55, 52.55],
    ],
    "Na jaře 1432 vtrhli husité podle Odry do Braniborska. Frankfurt odolal, ale Lubuš, Münchberg a Strausberk lehly popelem, než je markrabě Fridrich porazil u Bernova.",
  ],
  [
    "Zpustlý Spiš a Šariš",
    2,
    [
      [20.1, 49.35],
      [20.6, 49.45],
      [21.3, 49.4],
      [21.5, 49.25],
      [21.5, 48.75],
      [20.9, 48.6],
      [20.3, 48.85],
    ],
    "Z hradů a polních táborů tu loupí bratříci, kdysi vojáci Jiskry z Brandýsa. Přepadali kupce na cestě do Polska, vyplenili Červený Kláštor i Jasov a Talafús drží Richnavu.",
  ],
  [
    "Zpustlý Novohrad a Gemer",
    1,
    [
      [19.2, 48.5],
      [19.8, 48.7],
      [20.5, 48.75],
      [20.6, 48.45],
      [20.1, 48.2],
      [19.5, 48.1],
      [19.1, 48.25],
    ],
    "Roku 1451 rozprášili bratříci u Lučence mnohem větší vojsko Huňadyho. Od roku 1453 je vede hejtman Petr Aksamit a z opevněných táborů drží velkou část Horních Uher.",
  ],
];
const PRECH_DRUH = {prusmyk: "Průsmyk", most: "Most", brod: "Brod", privoz: "Přívoz"};
const HOSP_DRUH = {
  dul: "Doly",
  sul: "Sůl",
  hut: "Železo",
  jine: "Sklad",
  vinice: "Vinice",
  obili: "Obilnice",
  chmel: "Chmelnice",
  rybniky: "Rybníky",
};
/* vzdálenost v km: rovinný odhad, na pár desítek km stačí */
function krajKm(a, b) {
  const kx = 111.32 * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180);
  return Math.hypot((a[0] - b[0]) * kx, (a[1] - b[1]) * 110.57);
}
function krajVPoly(lo, la, poly) {
  let uvnitr = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i],
      [xj, yj] = poly[j];
    if (yi > la !== yj > la && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) uvnitr = !uvnitr;
  }
  return uvnitr;
}
/* kraj zpustlý válkou, v němž bod leží (nebo null) */
function zpustlyKraj(lo, la) {
  return ZPUSTLE.find(z => krajVPoly(lo, la, z[2])) || null;
}
/* přechody blízko trasy (lomená čára [[délka, šířka] …]): {i, n, druh, sez, lo, la, p (0–1 podél trasy), km od trasy}, podle pořadí */
function prechodyNaTrase(pts, dosah) {
  const D = dosah || 5;
  if (!pts || pts.length < 2) return [];
  const delky = [0];
  for (let i = 1; i < pts.length; i++) delky.push(delky[i - 1] + krajKm(pts[i - 1], pts[i]));
  const celkem = delky[delky.length - 1] || 1,
    vysl = [];
  PRECHODY.forEach((q, i) => {
    const b = [q[2], q[3]];
    let nej = null;
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1],
        c = pts[k],
        L = krajKm(a, c);
      let t = 0;
      if (L > 0) {
        const kx = Math.cos((((a[1] + c[1]) / 2) * Math.PI) / 180),
          dx = (c[0] - a[0]) * kx,
          dy = c[1] - a[1];
        t = Math.max(0, Math.min(1, ((b[0] - a[0]) * kx * dx + (b[1] - a[1]) * dy) / (dx * dx + dy * dy)));
      }
      const m = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t],
        d = krajKm(m, b);
      if (!nej || d < nej.km) nej = {km: d, p: (delky[k - 1] + t * L) / celkem};
    }
    if (nej && nej.km <= D) vysl.push({i, n: q[0], druh: q[1], lo: q[2], la: q[3], sez: q[4], p: nej.p, km: Math.round(nej.km * 10) / 10});
  });
  return vysl.sort((a, b) => a.p - b.p);
}
/* stav přechodu v měsíci mes (1–12) a za počasí P (z Výpravy: snih = sněhová pokrývka, povoden, blato, tx; bez P jen podle měsíce):
   null = projde se bez potíží, jinak {k: "zdrz" | "stuj", h: hodin cesty navíc, t: popis}. Most a přechod bez sezóny počasí nezdrží. */
function prechodStav(druh, sez, mes, P) {
  if (druh === "prusmyk" && sez === "z") {
    if (P) {
      if (P.snih >= 5) return {k: "stuj", h: 12, t: "sedlo zavál sníh – den čekání, než se prošlape, nebo jiná cesta"};
      if (P.snih >= 2) return {k: "zdrz", h: 4, t: "sníh v sedle – výstup trvá déle"};
      return null;
    }
    if (mes === 12 || mes <= 2) return {k: "zdrz", h: 6, t: "v zimě bývá sedlo zavaté sněhem"};
    if (mes === 11 || mes === 3 || mes === 4) return {k: "zdrz", h: 2, t: "v sedle může ležet sníh"};
    return null;
  }
  if ((druh === "brod" || druh === "privoz") && sez === "j") {
    if (P && P.povoden) return {k: "stuj", h: 12, t: "voda se rozlila – přes řeku se nedostanou, čeká se den"};
    if (P && druh === "privoz" && P.tx <= -8) return {k: "stuj", h: 12, t: "řeka nese led – převoz stojí"};
    if (mes >= 3 && mes <= 5 && (!P || P.blato >= 1))
      return {k: "zdrz", h: 3, t: druh === "brod" ? "jarní voda – brod je hluboký" : "jarní voda – převoz čeká na klidnější proud"};
    return null;
  }
  return null;
}
