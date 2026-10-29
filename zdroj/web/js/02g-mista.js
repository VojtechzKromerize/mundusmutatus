/* ===== Shrnutí míst mapy (CITYINFO) – samostatná část „mista“ (2026-10-28): stovky míst od Baltu po Jadran už jádro webu nenese;
   stáhne se s mapou Koruny či Výpravou (MMLINY_V v 01) a při prvním hledání v liště (gIndex v 07). Jádro sahá jen přes mistoInfo (02). ===== */
/*@cast mista{*/
const CITYINFO = {
  /* shrnutí míst mapy v dobové mluvě, stav k březnu 1458 (Vojta 2026-10-26: bez anachronismů) */
  Praha: {
    n: "Praha jest sídlem královým a srdcem kalicha. Na radnici Staroměstské byl 2. dne března zvolen pan Jiří z Poděbrad a v chrámu Týnském káže mistr Jan Rokycana. Král sídlí v Králově dvoře na Starém Městě; Hrad a chrám svatého Víta drží kapitula strany římské a Malá Strana posud leží zpustlá od bouří husitských.",
  },
  "Kutná Hora": {
    n: "Hora Kutná, někdy nejbohatší horní město království, jest sídlem královské mincovny ve Vlašském dvoře, odkud pražský groš pochází. Když za bouří husitských odešli havíři němečtí, doly z větší části zatopila voda a od léta Páně 1423 se groš nerazí; v zemi obíhá stará mince a chatrný drobný peníz. Město se drží kalicha a mincmistrem jest Jan Čabelický ze Soutic.",
  },
  Tábor: {
    n: "Tábor, čili Hradiště hory Tábor nad Lužnicí, býval hlavou bratrstev husitských a od léta Páně 1436 jest městem královským. Prvního dne září léta 1452 vzdal se bez boje panu Jiřímu a táborští kněží Mikuláš z Pelhřimova a Václav Koranda dáni jsou do žaláře na Poděbradech. Horlivci táborští jsou zlomeni, ale paměť jejich jest posud živá.",
  },
  "Hradec Králové": {
    t: "Věnné město královny",
    n: "Hradec jest bohaté město na Labi a baštou kališníků východočeských. Za bouří husitských býval středem orebitů a sirotků a císaři Zikmundovi vzdoroval do konce; v letech 1438–1448 zde sídlil mistr Jan Rokycana. Sídlí zde purkrabí kraje hradeckého.",
  },
  Žatec: {n: "Žatec jest bohaté město pod obojí, chmelnicemi obklopené, a drží věrný spolek s Louny."},
  Plzeň: {
    n: "Plzeň jest baštou strany římské na západě. Za bouří husitských odolala obležení a podnes stojí v čele landfrýdu plzeňského, jenž pod jednou přijímá. Když pan Jiří léta Páně 1448 vzal Prahu, utekli sem kanovníci pražští i hejtman Hanuš z Kolovrat; norimberští kupci zde mají svou oporu.",
  },
  "České Budějovice": {
    n: "Budějovice jsou město strany římské, z větší části německé a králi věrné, s chválenou školou městskou. Leží uprostřed zboží pánů z Rožmberka, kteří je chrání, ač se s nimi měšťané často přou; jest branou k Linci.",
  },
  Cheb: {
    t: "Říšské město zastavené Koruně",
    n: "Cheb jest město strany římské a německé, jež se samo široce spravuje. Ve věcech duchovních náleží biskupu řezenskému, nikoli Praze. Ač katolický, s panem Jiřím drží dobrou vůli: Chebák Jošt z Einsiedlu jest jeho důvěrníkem a prvního dne března jel pro korunní listiny na Karlštejn.",
  },
  Brno: {
    n: "Brno jest s Olomoucí předním městem markrabství moravského, strany římské a německé, s hradem Špilberkem nad sebou. Léta Páně 1454 vyhnal odsud král Ladislav na žádost měšťanů Židy. S Olomoucí, Jihlavou a Znojmem drží Brno jednotu měst moravských a na pána kališníka hledí ostražitě.",
  },
  Olomouc: {
    n: "Olomouc jest královské město strany římské a sídlo kapituly biskupské; s Brnem, Jihlavou a Znojmem drží jednotu měst moravských. Léta Páně 1452 nedali zde vyvěsiti mandáty papežské proti odbojným Rakušanům a léta 1454 vyhnal král Ladislav z města Židy, čímž se dlužníci olomoučtí zbavili dluhů.",
  },
  Jihlava: {
    n: "Jihlava jest bohaté německé město strany římské, proslulé horním právem a suknem. Léta Páně 1436 zde byla vyhlášena kompaktáta a přijat císař Zikmund. S Brnem, Olomoucí a Znojmem drží jednotu měst moravských; mezi radou patricijskou a obecným lidem však roste nesvár, jejž živí kazatelé ze želivského kláštera.",
  },
  Znojmo: {
    n: "Znojmo jest královské město strany římské nad Dyjí, nedaleko pomezí rakouského. Zde léta Páně 1437 dal císař Zikmund zatknouti choť svou Barboru a týž rok tu zemřel; léta 1454 vyhnal král Ladislav ze Znojma Židy.",
  },
  Litoměřice: {n: "Litoměřice jsou město pod obojí na Labi, kteréž živí se kupectvím s vínem, obilím a solí."},
  Louny: {n: "Louny jsou město pod obojí na Ohři a se Žatcem činí svazek husitských měst na severozápadě země."},
  Slaný: {n: "Slaný jest město pod obojí na stezce Chebské."},
  Kolín: {
    n: "Kolín jest město pod obojí na Labi a pevnost téměř nedobytná, odkudž se rozbíhají cesty na Moravu a do Kladska. Po bitvě u Lipan sem utekli ti, kdo z bratrstev přežili, a město drží posud kněz Bedřich ze Strážnice, někdy hejtman bratrstev.",
  },
  Čáslav: {n: "Čáslav jest město pod obojí. Léta Páně 1421 sešel se zde slavný sněm, kterýž Zikmunda trůnu zbavil."},
  Nymburk: {n: "Nymburk jest město pod obojí nad Labem, mocnými hradbami ohrazené."},
  Chrudim: {t: "Věnné město královny", n: "Chrudim jest město pod obojí na stezce Trstenické."},
  "Vysoké Mýto": {t: "Věnné město královny", n: "Mýto Vysoké jest město pod obojí na stezce Trstenické."},
  Polička: {t: "Věnné město královny", n: "Polička jest město pod obojí, střežící pomezí moravské."},
  "Dvůr Králové": {t: "Věnné město královny", n: "Dvůr Králové jest město pod obojí na horním Labi."},
  Jaroměř: {t: "Věnné město královny", n: "Jaroměř jest město pod obojí při brodu labském na stezce Kladské."},
  Mělník: {t: "Věnné město královny", n: "Mělník jest město vinic na soutoku Labe s Vltavou."},
  Písek: {n: "Písek jest město pod obojí u kamenného mostu přes Otavu, v níž se zlato rýžuje."},
  Klatovy: {n: "Klatovy jsou město pod obojí, strážce cest do Bavor."},
  Domažlice: {n: "Domažlice jsou město pod obojí a Chodů, kteříž hranici střehou. Léta Páně 1431 zde husité rozprášili výpravu křižáckou."},
  Sušice: {n: "Sušice jest město pod obojí na Otavě, kamž míří kašperskohorská větev Prachatické stezky."},
  Beroun: {n: "Beroun jest město pod obojí na stezce Norimberské."},
  Rakovník: {n: "Rakovník jest město pod obojí při královských lesích křivoklátských."},
  Most: {
    n: "Most jest německé město strany římské pod Krušnými horami s mocným hradem. Léta Páně 1421 utrpěli zde husité krvavý nezdar. Město drželi v zástavě vévodové saští a za nich zde pobýval i kazatel Kapistrán; léta 1456 dobyl pan Jiří hradu rychlým útokem, Sasové se však svých práv posud nevzdali.",
  },
  Kadaň: {n: "Kadaň jest královské město strany římské na Ohři."},
  "Ústí nad Labem": {n: "Léta Páně 1426 porazili husité u Ústí Sasy a město vypálili; ponenáhlu se z popela zvedá."},
  "Uherské Hradiště": {n: "Hradiště jest město strany římské, strážce pomezí uherského, kteréž husitům nikdy nepodlehlo."},
  Uničov: {
    n: "Uničov jest královské město strany římské, od starodávna hornické. Léta Páně 1452 zde zasedal sněm moravský a léta 1454 odsud král Ladislav na žádost měšťanů vyhnal Židy.",
  },
  "Uherský Brod": {n: "Brod Uherský jest město strany římské na stezce Uherské."},
  Vratislav: {
    n: "Vratislav jest po Praze největším a nejbohatším kupeckým městem Koruny, strany římské a spolku hanzovního; knížete nemá a vládne jí rada patricijů. Léta Páně 1453 zde po kázáních Kapistránových upálili čtyřicet jeden Židů. Kazatelé vratislavští proti panu Jiřímu lid burcují a po ulicích se zpívají posměšné písně o „Girsikovi“.",
  },
  Svídnice: {
    n: "Svídnice jest hlavním městem knížectví svídnického a javorského, jež Koruně přímo náleží, a po Vratislavi nejpřednějším městem slezským; bohatne suknem a pivem.",
  },
  Olava: {n: "Olava jest město knížat z rodu Piastovců lehnických na Odře mezi Vratislaví a Břehem."},
  Zhořelec: {
    n: "Zhořelec jest nejbohatším ze Šestiměstí na Vysoké cestě a kupčí suknem i barvou z borůvek. Poslové jeho byli spolu s budyšínskými na volebním sněmu v Praze.",
  },
  Budyšín: {
    n: "Budyšín jest hlavním městem Horní Lužice. Na hradě Ortenburku sídlívá zemský fojt, nyní uprázdněný, a u chrámu svatého Petra kapitula. Jen poslové Budyšína a Zhořelce přijeli z vedlejších zemí na volební sněm do Prahy, odjeli však ještě před volbou.",
  },
  Žitava: {
    n: "Žitava jest město Království českého, ne země lužické, a teprve spolkem z léta 1346 přistoupila k šesti městům. Odolala husitům a živí se suknem a kupectvím s Čechami cestou přes průsmyk lückendorfský, kdež císař Karel dal vystavět hrad Karlsfried k vybírání cla. Za bouří husitských zde v exilu sídlila kapitula pražská a s ní mnozí vyhnanci strany římské.",
  },
  Lubáň: {
    n: "Lubáň leží na levém břehu řeky Kvisy, jež dělí zemi budyšínskou od Slezska, a na Vysoké cestě. Husité ji vypálili v máji léta 1427 a znovu v březnu 1431; paměť na to je mezi lidmi živá.",
  },
  Kamenec: {n: "Kamenec jest město ze Šestiměstí na západním kraji Horní Lužice."},
  Lobava: {n: "Lobava jest město ze Šestiměstí mezi Budyšínem a Zhořelcem."},
  Norimberk: {n: "Norimberk jest největším kupeckým městem v jižních Němcích a Praha i Plzeň s ním nejvíce kupčí."},
  Řezno: {n: "Řezno jest přístavem na Dunaji, sídlem biskupským a starobylým městem říšským."},
  Erfurt: {t: "Město mohučského arcibiskupa", n: "Erfurt jest bohaté a přední město durynské s učením obecným, kteréž se samo spravuje."},
  Prešpurk: {
    n: "Prešpurk jest uherské pomezní město naproti Rakousům, na Dunaji, druhé největší v celém království; leží na staré cestě, která vede přes Vídeň do Řezna, a výsady má již od léta Páně 1291. Dovoz tu převládá nad vývozem, zvláště sukna a nože z Rakous. Hrad prešpurský držel pan Jiří Rozgonyi, než jej po míru z léta 1450 musel vydat Hunyadimu. Sem má být podle smlouvy strážnické do roka dopravena Kateřina, dcera pana Jiřího, zasnoubená králi Matyáši.",
  },
  Trnava: {
    n: "Trnava, kterou založil král Béla léta Páně 1238, jest hlavní město na cestě z Prahy a z Brna do Uher, kupecké i vinařské. Husité ji obsadili léta 1432, ale po Lipanech ji král zase získal. Po míru z léta 1450 musel pan Jiří Rozgonyi vydat Trnavu Hunyadimu, a léta 1456 ji Hunyadi odevzdal králi. Město samo drží čtyři vsi.",
  },
  "Banská Štiavnica": {n: "Štiavnica má nejbohatší stříbrné doly v celých Uhřích."},
  "Banská Bystrica": {n: "Bystrica jest město měděných dolů, z nichž měď jde až do Benátek."},
  Lipsko: {n: "Lipsko jest město trhů na rozcestí Vysoké a Říšské cesty."},
  Freiberk: {n: "Freiberk má nejbohatší stříbrné doly v zemích saských."},
  Halle: {t: "Město magdeburského arcibiskupa", n: "Halle bohatne na solných pramenech."},
  "Věličky (Wieliczka)": {t: "Královské solné doly", n: "Sůl z Věliček jest jedním z největších důchodů koruny polské."},
  Kouřim: {n: "Kouřim jest královské město pod obojí a středem kraje Kouřimského. Léta Páně 1421 ji dobyli husité pražští."},
  Stříbro: {n: "Stříbro jest královské horní město na Mži. Léta Páně 1427 je oblehla výprava křižácká, než v hrůze utekla k Tachovu."},
  Tachov: {n: "Tachov jest královské město při pomezí bavorském. Léta Páně 1427 zde Prokop Holý rozprášil výpravu křižáckou a město dobyl."},
  Trutnov: {t: "Věnné město královny", n: "Trutnov jest město z větší části německé pod Krkonošemi, na cestě do Slezska."},
  Prachatice: {
    n: "Prachatice jsou město Prachatické stezky, kudy se z Pasova sůl vozí. Léta Páně 1420 je Žižka dobyl a krutě potrestal; potom náležely k svazu táborskému. Od léta 1444 je drželi páni z Rožmberka a léta 1457 postoupili zástavu Prachatic a Volar pánům Prokopovi a Janovi z Rabštejna.",
  },
  Litovel: {n: "Litovel jest malé královské město strany římské na rozvětvené řece Moravě nedaleko Olomouce."},
  Augšpurk: {
    t: "Svobodné říšské město",
    n: "Augšpurk jest bohaté město švábské, plné kupců a tkalců barchetu. Sídlí zde biskup augšpurský, kardinál Petr ze Schaumbergu, ale město se spravuje samo.",
  },
  Košice: {
    t: "Svobodné královské město",
    n: "Košice jsou přední z pěti měst hornouherských (s Levočí, Bardejovem, Prešovem a Sabinovem), třetí největší město království, ležící na rozcestí, kde se sbíhají cesty z Levoče a z Prešova k Budínu. Právo skladu skutečně užívají jen Budín a Košice; městu patří mincovna a sedmnáct vsí a králi platí ročně dva tisíce zlatých. Léta Páně 1440 svěřila královna Alžběta jejich obranu Janu Jiskrovi z Brandýsa a od těch dob jsou oporou jeho; mír z léta 1452 mu ponechal vše, co tehdy držel.",
  },
  Levoča: {
    t: "Svobodné královské město",
    n: "Levoča jest hlavní město spišských Sasů a člen svazu pěti měst hornouherských. Spiš, v němž leží, poslouchá od léta Páně 1445 Jana Jiskru z Brandýsa.",
  },
  Bardejov: {
    t: "Svobodné královské město",
    n: "Bardejov jest šarišské kupecké město na cestě do Polska, jež založil král Ludvík, a člen svazu pěti měst hornouherských. Šariš poslouchá Jana Jiskru z Brandýsa od léta Páně 1442.",
  },
  Prešov: {
    t: "Svobodné královské město",
    n: "Prešov jest šarišské město ve svazu pěti měst hornouherských. Kraj okolní trpí nájezdy bratříků, žoldnéřů z vojsk Jiskrových.",
  },
  Skalica: {
    t: "Svobodné královské město",
    n: "Skalica jest pomezní město při hranici moravské. Husité se v ní usadili již na počátku léta Páně 1428 a odtud plenili okolí, dokud ji po Lipanech král zase nezískal. Za císaře Zikmunda přešla do panských rukou a po míru z léta 1450 musel pan Jiří Rozgonyi vydat ji Hunyadimu.",
  },
  Pešť: {
    t: "Svobodné královské město",
    n: "Pešť jest kupecké město naproti Budínu. Na sněmu pešťském byl v lednu léta Páně 1458 provolán králem Matyáš Korvín, tehdy ještě zajatec pana Jiřího v Praze.",
  },
  "Lubin (Lübben)": {
    n: "Lubin jest dolnolužické město, v němž stojí farní kostel spojený s úřadem arcijáhna míšeňského; arcijáhen sám bydlí v Míšni a církevní soud tu drží skrze svého oficiála. Zemi, kterou od léta Páně 1448 drží v zástavě kurfiřt braniborský Fridrich II., spravuje fojt bez stálého sídla.",
  },
  Guben: {n: "Guben jest město Dolní Lužice na Nise. Dolní Lužici, zemi Koruny české, drží od léta Páně 1448 kurfiřt braniborský Fridrich II."},
  Luckau: {n: "Luckau jest jedno z předních měst Dolní Lužice. Tu zemi Koruny české drží od léta Páně 1448 kurfiřt braniborský Fridrich II."},
  Linec: {
    t: "Zeměpanské město",
    n: "Linec jest trhové město Rakous nad Enží, na jehož jarmarky se sjíždějí kupci z cizích zemí. O zemi nad Enží se po smrti krále Ladislava uchází arcivévoda Albrecht VI., bratr císařův.",
  },
  Kremže: {t: "Zeměpanské město", n: "Kremže se Steinem činí dvojměstí na Dunaji, bohaté kupectvím a vínem; razí se zde fenik kremžský."},
  Štýr: {
    t: "Zeměpanské město",
    n: "Štýr jest město železa na Enži: od léta Páně 1287 má právo skladu železa a dříví a vládne kupectví se železem z dolů štýrských.",
  },
  "Štýrský Hradec": {
    t: "Sídelní město",
    n: "Hradec jest sídlem císaře Fridricha III., kterýž zde od léta Páně 1438 nový hrad staví, a hlavním městem Štýrska i habsburských Vnitřních Rakous.",
  },
  Cáhlov: {
    t: "Zeměpanské město",
    n: "Cáhlov, Němcům Freistadt, jest pomezní město Rakous nad Enží na cestě z Lince do Budějovic. Na sever jde sůl a železo, z Čech ryby; od léta Páně 1277 má právo skladu.",
  },
  Mělk: {
    n: "Mělk jest městečko pod klášterem benediktinským na Dunaji, odkudž od léta Páně 1418 vychází přísná mělcká oprava klášterů v Rakousích i v Bavořích.",
  },
  Straubing: {
    t: "Zeměpanské město",
    n: "Straubing jest dunajské město vévody mnichovského Albrechta III. Léta Páně 1435 zde dal vévoda Arnošt utopiti v Dunaji Anežku Bernauerovou, milou syna svého.",
  },
  Ingolstadt: {
    t: "Zeměpanské město",
    n: "Ingolstadt býval sídlem vévod ingolstadtských; když rod jejich léta Páně 1447 vymřel, připadl Wittelsbachům landshutským a nyní náleží vévodovi Ludvíkovi Bohatému.",
  },
  Amberg: {
    t: "Zeměpanské město",
    n: "Jest středem Horní Falce, bohaté železnou rudou a kupectvím se železem. Léta Páně 1452–1454 vzepřelo se falckraběti Fridrichovi, kterýž to povstání krvavě potlačil.",
  },
  Bamberk: {
    t: "Biskupské město",
    n: "Sídlo pana biskupa bamberského Antonína z Rotenhanu, jenž jest spolu knížetem; v dómu odpočívají císař Jindřich II. a Kunhuta.",
  },
  Burghausen: {
    t: "Zeměpanské město",
    n: "Město na Salzachu pod nejdelším hradem v Bavořích, jenž jest druhým sídlem vévod landshutských a kdež se ukládá jejich poklad.",
  },
  Zwickau: {t: "Zeměpanské město", n: "Bývalé město říšské, jež jest od léta Páně 1323 v moci markrabí míšeňských, nyní Wettinů saských."},
  "Saská Kamenice": {t: "Zeměpanské město", n: "Wettinské město plátna: od léta Páně 1357 má výsadní právo bělidla pro všecko Míšeňsko."},
  Wittenberg: {
    t: "Zeměpanské město",
    n: "Někdejší sídlo vévod z rodu askánského. Když léta Páně 1422 vymřeli, přešla hodnost kurfiřtská na Wettiny a nyní ji drží kurfiřt Fridrich II. Saský.",
  },
  Pirna: {
    t: "Zeměpanské město",
    n: "Město nad Labem, kteréž až do léta Páně 1405 náleželo ke Království českému; potom je získali markrabí míšeňští.",
  },
  "Frankfurt nad Odrou": {
    t: "Hanzovní město",
    n: "Město braniborské, od léta Páně 1430 v Hanze, vládne kupectví na Odře mezi Vratislaví a Štětínem; léta 1432 zasáhla je spanilá jízda husitská.",
  },
  "Braniborsko nad Havolou": {
    t: "Biskupské město",
    n: "Starobylé dvojměstí na Havole, sídlo biskupa braniborského a dávný střed Braniborska, kterémuž vládne kurfiřt Fridrich II. Železný.",
  },
  Magdeburk: {
    t: "Hanzovní město",
    n: "Sídlo arcibiskupa Fridricha z Beichlingenu, avšak město samo sobě vládne. Právem magdeburským spravují se města od Sas až po Polsko.",
  },
  Poznaň: {
    n: "Hlavní město Velkopolska a sídlo biskupa poznaňského, kupecký uzel na cestě z Polska do Říše. Království polské vede s Řádem válku o Prusy.",
  },
  Kališ: {
    n: "Jedno z nejstarších měst polských, střed vojvodství kališského. Proslulo statutem léta Páně 1264, jímž kníže Boleslav vzal Židy pod svou ochranu.",
  },
  Čenstochová: {
    n: "Město pod klášterem paulínů na Jasné Hoře, kdež chovají obraz Černé Madony. Léta Páně 1430 klášter vyloupili lupiči, mezi nimiž byli i Čechové, a obraz poškodili.",
  },
  Bochnia: {
    t: "Královské solné doly",
    n: "Nejstarší solné doly polské, dobývané od léta Páně 1248; spolu s Věličkami jsou královskými solivary krakovskými.",
  },
  "Nowy Sącz": {t: "Královské město", n: "Královské město na cestě z Krakova do Uher, kteréž léta Páně 1292 založil český král Václav II."},
  Ráb: {t: "Biskupské město", n: "Sídlo biskupa rábského na soutoku Ráby s Dunajem, strážce cesty z Rakous do Budína."},
  Nitra: {t: "Biskupské město", n: "Sídlo biskupa nitranského na hradě nad řekou Nitrou, jenž jest jedním z nejstarších křesťanských míst v Uhřích."},
  Trenčín: {
    t: "Svobodné královské město",
    n: "Město pod královským hradem na Váhu, svobodné od léta Páně 1412. Léta 1431 dobyli je a vypálili husité; od léta 1454 má právo meče.",
  },
  Žilina: {
    n: "Město na Váhu, jemuž privilegium léta Páně 1381 dává Slovanům v radě táž místa jako Němcům. Husité je léta 1431 vypálili a v letech 1433–1434 drželi.",
  },
  Visegrád: {
    t: "Královský hrad",
    n: "Hrad a palác králů uherských nad Dunajem. Odtud léta Páně 1440 komorná Helena Kottannerová odnesla korunu svatého Štěpána, kterouž nyní drží císař Fridrich III.",
  },
  Prostějov: {t: "Panské město", n: "Poddanské město na úrodné Hané, za bouří husitských opora kalicha na Moravě."},
  Hlivice: {
    n: "Hornoslezské město, v němž za bouří husitských leželo vojsko Zikmunda Korybutoviče, dokud je léta Páně 1431 nočním přepadem nevypudil kníže Konrád Bílý.",
  },
  Bytom: {n: "Hlavní město Bytomska, kteréž jest rozděleno napůl mezi knížete olešnického Konráda IX. Černého a knížete těšínského Václava I."},
  Javor: {
    n: "Druhé hlavní město knížectví svídnicko-javorského, jež náleží přímo Koruně; místo krále tu vládne zemský hejtman. Hejtmanem knížectví slezských jest od léta Páně 1457 pan Jan z Rožmberka.",
  },
  Lehnice: {
    n: "Hlavní město knížectví lehnického mladého Fridricha I., za něhož vládne matka jeho Hedvika. Po létě Páně 1449 vzepřeli se tu Piastovcům a hledali oporu přímo u Koruny.",
  },
  Břeh: {n: "Hlavní město knížectví břežského na Odře. Od léta Páně 1450 drží je v zástavě kníže opolský Mikuláš I."},
  Hlohov: {
    n: "Město na Odře rozdělené mezi dva knížata: polovici drží Jindřich IX. Starší z větve žaháňské, polovici Vladislav z Piastovců těšínských.",
  },
  Opolí: {n: "Sídlo knížete opolského Mikuláše I., jenž od léta Páně 1439 vládne všemu Opolsku a drží v zástavě i Břeh."},
  Nisa: {
    t: "Biskupské město",
    n: "Sídlo biskupů vratislavských a jejich knížectví. Od léta Páně 1456 jest biskupem Jošt z Rožmberka, převor johanitů, kterýž se vůči Jiřímu opatrně drží stranou.",
  },
  Opava: {
    n: "Hlavní město rozdrobeného Opavska: dvě třetiny koupil po létě Páně 1454 kníže opolský Bolek V., řečený Husita, třetinu drží kníže hlubčický Jan II. z Přemyslovců opavských.",
  },
  Krnov: {n: "Sídlo Přemyslovců krnovských. Za nezletilé bratry Jana IV. a Václava III. vládne poručnice, jejich macecha Barbora."},
  Hlubčice: {n: "Sídlo knížete hlubčického Jana II. z Přemyslovců opavských, jenž drží i třetinu Opavska."},
  Ratiboř: {
    n: "Sídlo Přemyslovců ratibořských. Po smrti knížete Václava léta Páně 1456 dědí zemi nezletilý syn jeho Jan; matka Markéta pochází z polských Šamotulských.",
  },
  Těšín: {n: "Sídlo knížete těšínského Václava I. z rodu Piastovců, jenž drží i díl Bytomska."},
  Kozlí: {n: "Město na Odře, kteréž spolu s Olešnicí a polovicí Bytomska drží kníže olešnický Konrád IX. Černý."},
  Olešnice: {n: "Sídlo knížete olešnického Konráda IX. Černého, jenž drží i Kozlí a polovici Bytomska."},
  Žaháň: {
    n: "Sídlo knížete žaháňského Baltazara. Bratr jeho Jan (II.) prohlásil se tu za Baltazarovy nepřítomnosti správcem země; mezi bratry panuje nevraživost.",
  },
  Lubin: {n: "Město Piastovců lehnicko-břežských, od léta Páně 1446 v zástavě u knížete hlohovského Jindřicha IX. Staršího."},
  Střelín: {n: "Město mladého knížete Fridricha I. Lehnického, za něhož vládne matka jeho Hedvika."},
  Frankenštejn: {n: "Město, kteréž léta Páně 1454 spolu s Kladskem získal v zástavě pan Jiří z Poděbrad od syna Hynka Krušiny z Lichtenburka."},
  Střehom: {
    n: "Město knížectví svídnicko-javorského, jež náleží přímo Koruně, proslulé suknem, plátnem a pivem; nad ním se vypíná veliký chrám johanitů.",
  },
  Bolkov: {
    n: "Město pod hradem knížete Bolka I. v knížectví svídnicko-javorském, jež náleží Koruně. Husité město zkazili, hradu však nedobyli; dlouho v něm ležel knížecí poklad.",
  },
  "Jelení Hora": {
    n: "Město knížectví svídnicko-javorského pod Krkonošemi, živé tkalcovstvím a kupectvím s Čechami; léta Páně 1426 a 1427 poplenili je husité.",
  },
  "Svatý Hypolit": {
    t: "Biskupské město",
    n: "Město v Rakousích pod Enží, jež nenáleží vévodovi, nýbrž biskupovi pasovskému. Leží na cestě z Vídně do Lince.",
  },
  Tulln: {
    t: "Zeměpanské město",
    n: "Staré město na Dunaji nad Vídní, opěvované již v Písni o Nibelunzích. Obec kupecká a soudní, městské právo má od léta Páně 1270.",
  },
  Korneuburg: {
    t: "Zeměpanské město",
    n: "Město na levém břehu Dunaje naproti Klosterneuburgu. Po zhoubném požáru léta Páně 1450 vystavěno znovu jako zeměpanská pevnost, jež kryje Vídeň od severu.",
  },
  Hainburg: {
    t: "Pohraniční město",
    n: "Hrazené město v Uherské bráně, poslední rakouská bašta na Dunaji před Prešpurkem, s hradbami o patnácti věžích a mohutnou branou Vídeňskou.",
  },
  "Laa an der Thaya": {
    t: "Pohraniční město",
    n: "Hrazené město z časů Babenberků na Dyji při moravské hranici. Léta Páně 1407 poplenil je markrabě Jošt, léta 1426 husité; od léta 1454 smí vařit pivo.",
  },
  Enže: {
    t: "Zeměpanské město",
    n: "Nejstarší město rakouské s právem od léta Páně 1212, na místě římského Lauriaka. Řeka Enže dělí Rakousy pod Enží a nad Enží, o něž se přou Fridrich III. a Albrecht VI.",
  },
  Wels: {
    t: "Zeměpanské město",
    n: "Trhové město na Tauně v Rakousích nad Enží, s právem od léta Páně 1222, na místě římské Ovilavy. Na tu zemi si dělá nárok Albrecht VI.",
  },
  Gmunden: {t: "Solné město", n: "Město na Traunském jezeře, odkud se rozváží sůl z Hallstattu a Ischlu, plavená po Tauně."},
  Leoben: {
    t: "Zeměpanské město",
    n: "Štýrské město Fridricha III. na Muře. Od léta Páně 1314 má výsadu kupectví se železem z Vordernbergu pod Erzbergem, jež jde na jihovýchod a přes Benátky až do zámoří na Východ.",
  },
  Salcburk: {
    t: "Arcibiskupské město",
    n: "Sídlo arcibiskupa Zikmunda z Volkersdorfu, jenž od léta Páně 1452 vládne vlastní zemi mezi Bavory a Rakousy.",
  },
  Freising: {
    t: "Biskupské město",
    n: "Sídlo biskupa freisinského Jana Tulbecka (od léta Páně 1453) na vrchu nad Isarou. Malé knížecí biskupství uprostřed vévodských Horních Bavor, nedaleko Mnichova.",
  },
  Landsberg: {
    t: "Zeměpanské město",
    n: "Město vévod mnichovských na Lechu, kudy vede Solná stezka přes most do Švábska. Zbohatlo na clu a soli a střeží hranici s biskupstvím augšpurským.",
  },
  Wasserburg: {
    t: "Zeměpanské město",
    n: "Město v ohbí Innu, od léta Páně 1447 landshutské, tedy Ludvíka IX. Bohatého. Od léta 1439 vybírá clo ze soli, jež tudy jde do Mnichova; vládnou mu bohaté rody měšťanské.",
  },
  Braunau: {
    t: "Zeměpanské město",
    n: "Hrazené město bavorské na Innu s právem od léta Páně 1260. Živí se kupectvím se solí a plavbou po Innu; staví se tu kostel sv. Štěpána s vysokou věží.",
  },
  Reichenhall: {
    t: "Solné město",
    n: "Prastaré solné prameny a vařírny soli pod Alpami. Sůl reichenhallská jde přes Pasov a Prachatickou stezku až do Čech.",
  },
  Neuburg: {
    t: "Zeměpanské město",
    n: "Město na Dunaji, kteréž s dědictvím vymřelé větve ingolstadtské připadlo léta Páně 1447 vévodám landshutským; nyní náleží Ludvíkovi IX. Bohatému.",
  },
  Donauwörth: {
    t: "Svobodné říšské město",
    n: "Říšské město na Dunaji, svobodné od léta Páně 1308. Činí si na ně nárok vévoda bavorský Ludvík IX. Bohatý, což ho staví proti markraběti Albrechtu Achillovi.",
  },
  Mühldorf: {
    t: "Arcibiskupské město",
    n: "Salcburský ostrůvek na Innu uprostřed zemí bavorských. Od léta Páně 1287 náleží arcibiskupům salcburským.",
  },
  Bayreuth: {
    t: "Zeměpanské město",
    n: "Město Hohenzollernů, léta Páně 1430 vypálené husity. Jan Alchymista tu vystavěl zámek a léta 1457 vzdal se vlády; obě franská markrabství nyní drží Albrecht Achilles.",
  },
  Hof: {
    t: "Zeměpanské město",
    n: "Město na Sále, kteréž léta Páně 1373 koupili od fojtů z Weidy purkrabí z rodu Hohenzollernů. Léta 1430 zpustošili je husité; bohatne na suknu z domácí vlny.",
  },
  Eichstätt: {
    t: "Biskupské město",
    n: "Sídlo knížete-biskupa Jana z Eychu, jenž od léta Páně 1445 sedí v údolí Altmühlu, napravuje církev a přátelí se s muži učenými.",
  },
  Weißenburg: {t: "Svobodné říšské město", n: "Malé říšské město ve Francích, svobodné od léta Páně 1296, obehnané pevnými hradbami."},
  Forchheim: {t: "Biskupské město", n: "Město biskupů bamberských na řece Regnitz. Jejich zdejší hrad jest po Bamberku nejpřednějším jejich sídlem."},
  Kronach: {
    t: "Biskupské město",
    n: "Pevné město biskupů bamberských u Franského lesa. Léta Páně 1430 odolalo obléhání husitskému, jen kus města zapálili sami měšťané.",
  },
  Kouba: {
    t: "Pohraniční město",
    n: "Cham, pohraniční město na Řezné (Regen) u cesty z Čech přes Všerubský průsmyk, kterouž kdysi střežil říšský hrad. Bouře husitské město těžce postihly.",
  },
  Altenburg: {
    t: "Rezidenční město",
    n: "Sídelní město s hradem kurfiřta Fridricha II. Dobrotivého. V noci ze 7. na 8. července léta Páně 1455 odtud Kunc z Kaufungen unesl oba kurfiřtovy syny; byl dopaden a ve Freiberku sťat.",
  },
  Torgava: {t: "Zeměpanské město", n: "Wettinské město u brodu přes Labe, kdež se kříží dálné kupecké cesty."},
  Merseburk: {
    t: "Biskupské město",
    n: "Sídlo biskupa merseburského Jana z Bose, jenž sedí na stolci od léta Páně 1431. Wettinové usilují biskupství sobě podrobit a upírají mu, že by podléhalo jen říši.",
  },
  Naumburk: {t: "Biskupské město", n: "Město s dómem a kapitulou biskupství naumburského na Sále. Biskupové sídlí v nedalekém Zeitzu."},
  Jena: {
    t: "Zeměpanské město",
    n: "Durynské město na Sále v zemi lantkraběte Viléma III., bratra kurfiřtova. Léta Páně 1429 koupilo si od pánů soudy i clo.",
  },
  Gotha: {t: "Zeměpanské město", n: "Jedno z pěti měst durynských, jež bohatnou na barvířském boryti. Náleží k Durynsku lantkraběte Viléma III."},
  Nordhausen: {t: "Svobodné říšské město", n: "Říšské město pod Harcem, svobodné od léta Páně 1220. V letech 1430–1432 bylo nakrátko údem Hanzy."},
  Tangermünde: {
    t: "Rezidenční město",
    n: "Hanzovní město na Labi s falcí Karla IV. Od léta Páně 1415 tu sídlí kurfiřti z rodu Hohenzollernů a město kvete nádhernými stavbami z pálených cihel.",
  },
  Stendal: {
    t: "Hanzovní město",
    n: "Bohaté město Staré marky, v Hanze od léta Páně 1358. Léta 1447 vysvětilo dvouvěžový kostel Panny Marie a léta 1456 tu kurfiřt Fridrich II. založil klášter augustiniánů.",
  },
  Havelberg: {
    t: "Biskupské město",
    n: "Dóm a kapitula biskupa havelberského Konráda z Lintorfu, jenž sedí na stolci od léta Páně 1427; město samo však náleží markrabím a biskupové raději sídlí ve Wittstocku.",
  },
  Wilsnack: {
    t: "Poutní místo",
    n: "Poutní místo Svaté krve: léta Páně 1383 nalezli tu ve vypáleném kostele tři krvácející hostie. Jan Hus ten zázrak odsoudil, biskup havelberský s přízní kurfiřtovou pouť hájí.",
  },
  Fürstenwalde: {
    t: "Biskupské město",
    n: "Městečko na Sprévě, kamž biskupové lubušští léta Páně 1385 přenesli sídlo. Biskupové, od léta 1455 Fridrich Sesselmann, drží s markrabími braniborskými.",
  },
  "Landsberg an der Warthe": {
    t: "Zeměpanské město",
    n: "Město Nové marky na řece Wartě. Lucemburkové je zastavili Řádu německých rytířů; léta Páně 1454 je vykoupil markrabě Fridrich II. Železný a právě zde přijal hold stavů.",
  },
  "Königsberg in der Neumark": {
    t: "Zeměpanské město",
    n: "Někdejší hlavní město Nové marky, jež bohatne na obilí plaveném po Odře. Léta Páně 1433 odolalo husitům; s celou Novou markou jest od let 1454–1455 opět braniborské.",
  },
  Varšava: {
    t: "Rezidenční město",
    n: "Sídlo knížat mazovských od léta Páně 1413. Za nezletilého Konráda III. a bratří jeho vládne kněžna Barbora spolu s biskupem plockým Pavlem Giżyckým.",
  },
  Plock: {
    t: "Biskupské město",
    n: "Město biskupské i knížecí na Visle. Vládnou zde nezletilí Piastovci mazovští Zemovít VI. a Vladislav II. pod poručenstvím matky své Anny a biskupa Pavla.",
  },
  Piotrków: {t: "Královské město", n: "Město královské, kdež se již od léta Páně 1354 schází šlechta polská k zemským sjezdům a sněmům."},
  Olkusz: {t: "Hornické město", n: "Město královské v Malopolsku, jež zbohatlo na dolech olověných a stříbrných."},
  Sieradz: {t: "Královské město", n: "Hlavní město vojvodství sieradzského na Wartě, ležící mezi Velkopolskem a Slezskem."},
  Łęczyca: {t: "Královské město", n: "Hlavní město vojvodství łęczyckého uprostřed zemí polských."},
  Włocławek: {t: "Biskupské město", n: "Sídlo biskupa kujavského na Visle, nedaleko Pomoří, kdež Polsko vede válku s Řádem německých rytířů."},
  Wschowa: {
    t: "Královské město",
    n: "Pohraniční pevné město naproti Slezsku hlohovskému, polské od léta Páně 1343. Nyní kvete: má soukenictví, mincovnu i školu a kupčí s Lipskem i s Rusí.",
  },
  Biecz: {
    t: "Královské město",
    n: "Jedno z největších měst polských a celnice na cestě do Uher, kudy se veze víno uherské. Sedí zde soud práva magdeburského.",
  },
  Wieluń: {
    t: "Královské město",
    n: "Středisko kupectví i správy země wieluńské, od léta Páně 1395 opět polské. V létech čtyřicátých a padesátých tohoto věku je opětovně plení nájezdy ze Slezska.",
  },
  Šoproň: {
    t: "Svobodné královské město",
    n: "Město uherské na rakouském pomezí, jež královna Alžběta léta Páně 1441 zastavila Fridrichovi III. Císař je posavad drží, týmž obyčejem jako korunu svatoštěpánskou.",
  },
  Komárno: {
    t: "Královské město",
    n: "Město a hrad na soutoku Váhu s Dunajem, s výsadami od léta Páně 1265. Léta 1440 se zde narodil král Ladislav Pohrobek.",
  },
  Vacov: {t: "Biskupské město", n: "Vacov v ohbí Dunaje, sídlo jednoho z nejstarších biskupství uherských. Biskup jest spolu i pánem města."},
  Jáger: {t: "Biskupské město", n: "Sídlo biskupa od léta Páně 1009, s chrámem na hradním vrchu, okolo něhož vyrostlo město."},
  "Spišská Nová Ves": {
    t: "Zastavené město",
    n: "Jedno z třinácti saských měst spišských, jež král Zikmund léta Páně 1412 zastavil polskému králi Vladislavovi za sto tisíc zlatých, totiž za třicet sedm tisíc kop grošů pražských, které si od něho vypůjčil na válku s Benátkami. Spolu s nimi vzal Polák do zástavy panství Ľubovňu a města Podolínec a Hniezdne. Spravuje je polský starosta, jenž sedí na Staré Ľubovni.",
  },
  Kežmarok: {n: "Spišské město pod Tatrami, od léta Páně 1440 sídlo hraběte spišského. Léta 1433 je těžce poplenil nájezd husitský."},
  Rožňava: {
    t: "Hornické město",
    n: "Hornické město v Gemeru, jež bohatne na zlatě, stříbře a železe; svobodným městem královským jest od léta Páně 1410.",
  },
  Karlštejn: {
    t: "Královský hrad",
    n: "Královský hrad, schránka korunovačních klenotů, jež jsou zde opět od léta Páně 1436, a od léta 1437 i archivu korunního v kapli svatého Kříže; bez nich nelze krále platně korunovati. Za bouří husitských nedobytá pevnost strany římské; spravuje jej nejvyšší purkrabí. Prvního dne března jela sem družina přes třicet jezdců pro listiny o právu ke Koruně a za tmy je přivezla na sněm do Prahy.",
  },
  Křivoklát: {
    t: "Královský hrad",
    n: "Královský hrad uprostřed hlubokých hvozdů. Král Ladislav Pohrobek jej vyplatil ze zástavy pana Aleše Holického ze Šternberka, i jest opět v rukou koruny.",
  },
  Bezděz: {
    t: "Královský hrad v zástavě",
    n: "Za bouří husitských opora strany římské na severu země, kamž byly převezeny desky zemské. Zástavu drží pan Jindřich z Michalovic.",
  },
  Zvíkov: {
    t: "Královský hrad v rožmberské zástavě",
    n: "Hrad na soutoku Vltavy s Otavou, jejž husité léta Páně 1429 marně čtyři měsíce obléhali. Drží jej páni z Rožmberka, jimž král Ladislav léta 1457 slíbil, že jim jej nevyplatí.",
  },
  Orlík: {
    t: "Hrad Zmrzlíků ze Svojšína",
    n: "Hrad nad Vltavou, od léta Páně 1407 v rukou Zmrzlíků ze Svojšína. Léta 1457 jej zdědil pan Jaroslav Zmrzlík, stoupenec krále Jiřího.",
  },
  Kost: {
    t: "Hrad Zajíců z Házmburka",
    n: "Hrad v pískovcových skalách u Sobotky. Drží jej pan Mikuláš Zajíc z Házmburka, přísný muž strany římské a odpůrce kalicha, jejž král Zikmund učinil nejvyšším sudím.",
  },
  Trosky: {
    t: "Hrad Zajíců z Házmburka",
    n: "Dvě věže na vrcholech dvou skal, za bouří husitských bašta strany římské. Léta Páně 1455 je koupil pan Jan Zajíc z Házmburka a připojil ke Kosti.",
  },
  Lipnice: {
    t: "Hrad Trčků z Lípy",
    n: "Mohutný hrad nad Sázavou, jejž léta Páně 1436 koupil husitský hejtman Mikuláš Trčka z Lípy. Rod jeho stojí při králi Jiřím.",
  },
  Rabí: {
    t: "Hrad Švihovských z Rýzmberka",
    n: "Rozlehlý hrad nad Otavou. Žižka jej dobyl dvakrát a při druhém obléhání léta Páně 1421 přišel o oko, jež mu ještě zbývalo. Od léta 1450 jej drží pan Vilém Švihovský z Rýzmberka.",
  },
  Kašperk: {
    t: "Královský hrad v zástavě",
    n: "Strážní hrad císaře Karla nad Vintířovou stezkou z Pasova, kdež se často půtkuje s Bavory. Léta Páně 1454 jej pan Petr Zmrzlík prodal panu Zdeňkovi ze Šternberka.",
  },
  Točník: {
    t: "Královský hrad v zástavě",
    n: "Nádherný hrad krále Václava nad Žebrákem, léta Páně 1424 marně obléhaný husity. Zástavu drží páni z Kolovrat, kteříž léta 1430 přistoupili k přijímání pod obojí.",
  },
  "Kunětická hora": {
    t: "Husitský hrad",
    n: "Hrad na osamělé hoře u Pardubic, jejž přestavěl husitský hejtman Diviš Bořek z Miletínka; léta Páně 1437 zde u něho nalezl útočiště mistr Jan Rokycana. Drží jej syn jeho, pan Soběslav Mrzák z Miletínka.",
  },
  Lichnice: {
    t: "Královský hrad",
    n: "Hrad na hraně Železných hor, za bouří husitských v rukou sirotků. Drží jej husitský hejtman Jan Hertvík z Rušinova, od něhož jej král Jiří hodlá vykoupiti.",
  },
  Střekov: {
    t: "Panský hrad nad Labem",
    n: "Skalní hrad nad Labem u Ústí, za bouří husitských na straně krále Zikmunda; v čas bitvy u Ústí léta Páně 1426 seděla v něm posádka míšeňská. Drží jej potomci Jetřicha z Kladna.",
  },
  Homole: {
    t: "Hrad Poděbradů",
    n: "Pohraniční hrad v Kladsku u Dušník. Léta Páně 1427 jej dobyli táborité, potom sloužil loupeživým pánům; nyní jej drží pan Jiří a má jej určen synům svým Bočkovi a Viktorinovi.",
  },
  Helfštýn: {t: "Panský hrad", n: "Rozlehlý hrad nad Bečvou u Lipníka. Drží jej pan Vok ze Sovince."},
  Bouzov: {
    t: "Hrad Kostků z Postupic",
    n: "Hrad na pomezí Hané, jejž pan Jiří z Poděbrad ještě před létem Páně 1442 předal věrnému svému Zdeňkovi Kostkovi z Postupic.",
  },
  Buchlov: {
    t: "Zeměpanský hrad v zástavě",
    n: "Zeměpanský hrad v Chřibech nad Pomoravím, mnohokrát zastavený; léta Páně 1437 jej v zástavě dostal pan Čeněk z Mošnova.",
  },
  Brumov: {
    t: "Pohraniční hrad",
    n: "Strážce cesty do Uher nad Vlárkou. Zástavu drží páni z Cimburka; pan Bernard z Cimburka odtud táhl na výpravy do Uher.",
  },
  Veveří: {
    t: "Zeměpanský hrad",
    n: "Hrad nad Svratkou u Brna, za bouří husitských opora strany Zikmundovy s rakouskou posádkou. Král Jiří jej míní svěřiti Přemkovi, knížeti těšínskému.",
  },
  Książ: {
    t: "Hrad svídnického knížectví",
    n: "Hlavní hrad korunního knížectví svídnického, léta Páně 1428–1429 obsazený husity. Pan Jiří z Poděbrad jej získal od dědiců Janka z Chotěmic a správu svěřil Birkovi z Násile.",
  },
  Chojnik: {
    t: "Rytířský hrad",
    n: "Hrad na skále nad Jelení Horou pod Krkonošemi. Koupil jej rytíř Gotsche Schoff od vdovy po knížeti Bolkovi II. a rod jeho jej drží.",
  },
  Ojvín: {
    t: "Hrad a klášter celestinů",
    n: "Skalní hrad u Žitavy, kdež císař Karel léta Páně 1369 založil klášter celestinů; na stavbě chrámu se podílel mistr Petr Parléř.",
  },
  Senftenberg: {
    t: "Hrad v saských rukou",
    n: "Hrad a panství v Dolní Lužici. Synové Hanse z Polenz prodali je léta Páně 1446 kurfiřtu saskému Fridrichu, jenž pro nedostatek peněz převzal je až v listopadu 1448, když hrozilo, že je obsadí Braniborský. Tím se odtrhlo od Lužice české, jako před tím, od léta 1425, Finsterwalde.",
  },
  Königstein: {
    t: "Pohraniční hrad (sporný)",
    n: "Skalní pevnost nad Labem, kterouž markrabí míšeňští léta Páně 1408 vzali pánům z Donína. Po právu náleží Koruně české, ač ji drží Míšeňští.",
  },
  Hohnstein: {
    t: "Hrad saských kurfiřtů (české léno)",
    n: "Skalní hrad v pískovcových horách nad Labem, až do léta Páně 1443 v rukou Berků z Dubé. Potom jej směnou a koupí získali kurfiřti saští, hrad však zůstal lénem české koruny.",
  },
  Coburg: {
    t: "Hrad Wettinů",
    n: "Mohutná pevnost nad městem Coburgem, wettinská od léta Páně 1353. Pro strach z husitů zde léta 1430 rozšířili opevnění.",
  },
  Cadolzburg: {
    t: "Hrad frankských Hohenzollernů",
    n: "Sídlo markrabí Albrechta Achilla, bratra kurfiřta braniborského. Léta Páně 1449–1450 vedl válku s Norimberkem, od léta 1457 vládne oběma markrabstvím franským.",
  },
  Kufstein: {
    t: "Pohraniční pevnost",
    n: "Bavorská pevnost nad Innem na pomezí Tyrolska. Po vymření větve ingolstadtské připadla bohatým vévodům landshutským; léta Páně 1415 ji mocně opevnil Ludvík Bradatý.",
  },
  Vitoraz: {t: "Pohraniční hrad", n: "Zeměpanské panství na pomezí českém, často zastavované mocným rodům; léta Páně 1426 je obléhali husité."},
  Falkenstein: {t: "Zeměpanský hrad", n: "Hrad v Rakousích pod Enží blízko moravské hranice, od léta Páně 1106 v rukou rakouských zeměpánů."},
  Devín: {t: "Pohraniční hrad", n: "Skála nad soutokem Moravy s Dunajem, brána do Uher. Od léta Páně 1414 jej drží mocný rod Garaiů."},
  "Spišský hrad": {t: "Hrad uherské koruny", n: "Rozlehlý hrad královský nad Spiší; v jeho ohradě stojí opevněné sídlo pana Jana Jiskry z Brandýsa."},
  "Šarišský hrad": {
    t: "Hrad uherské koruny (v moci Jiskry)",
    n: "Hrad nad Prešovem, jejž léta Páně 1441 osadil pan Jan Jiskra z Brandýsa a posavad jej drží.",
  },
  Ľubovňa: {
    t: "Hrad zastavený Polsku",
    n: "Hrad na severu Spiše, léta Páně 1412 zastavený Polsku spolu se třinácti městy spišskými; spravují jej polští hejtmané.",
  },
  Beckov: {
    t: "Hrad Bánffyů",
    n: "Skalní hrad nad Váhem, jejž kdysi král prodal panu Ctiborovi ze Ctiboric. Když rod jeho léta Páně 1434 vymřel, připadl Bánffyům.",
  },
  Čachtice: {
    t: "Hrad Országhů",
    n: "Hrad v Pováží, jejž léta Páně 1436 král Zikmund daroval svému stoupenci Michalovi Országhovi; rod jeho jej drží.",
  },
  Strečno: {t: "Hrad nad Váhem", n: "Hrad nad soutěskou Váhu u Žiliny. V údolí Váhu pustošili husité již léta Páně 1431."},
  Bojnice: {t: "Panský hrad", n: "Hrad na horní Nitře, od léta Páně 1430 sídlo potomků Onufria Bardy, kteříž jej ubránili proti husitům."},
  Likava: {
    t: "Hrad v Liptově",
    n: "Hrad v Liptově. Župu liptovskou zastavil král Zikmund léta Páně 1430 své choti Barboře Celské a léta 1445 zasedl pan Pongrác z Liptova mezi sedmi hejtmany království. Kdo hrad drží nyní, je sporné.",
  },
  Olsztyn: {
    t: "Královský hrad",
    n: "Pohraniční hrad u Čenstochové, jenž chrání Polsko proti Slezsku a Čechám. Starostenství drží potomci Jana ze Szczekocin, od léta Páně 1432 pan Piotr Woda.",
  },
  Będzin: {t: "Královský hrad", n: "Kamenný hrad krále Kazimíra Velikého, vojenská hláska na jihozápadním pomezí Polska proti Slezsku."},
  Czorsztyn: {t: "Královský hrad", n: "Strážce pomezí polského a uherského nad Dunajcem, naproti uherské Nedeci; spravují jej starostové královští."},
  Ziesar: {t: "Biskupský hrad", n: "Sídlo biskupů braniborských a středisko správy biskupství již od léta Páně 1327."},
  Poděbrady: {
    t: "Hrad pánů z Poděbrad",
    n: "Vodní hrad a město na Labi při brodu na cestě z Prahy do Hradce, dědičné sídlo pánů z Kunštátu a z Poděbrad. Praví se, že se zde léta Páně 1420 narodil Jiří, jenž nyní zvolen jest králem. Do hradního žaláře dal léta 1452 vsaditi táborské kněze Mikuláše z Pelhřimova a Václava Korandu.",
  },
  Litice: {
    t: "Hrad pánů z Poděbrad",
    n: "Hrad na skále nad Divokou Orlicí v podhůří Orlických hor, jejž pan Jiří dal zesíliti. K panství litickému náleží i odlehlá ves Kunvald.",
  },
  Náchod: {
    t: "Hrad pánů z Poděbrad",
    n: "Hrad a město na Kladské stezce u zemské hranice. Jiří je zdědil léta Páně 1427, ale od léta 1437 tu vládl husitský hejtman Jan Kolda ze Žampachu; Jiří jej dobyl až léta 1456.",
  },
  Kladsko: {
    t: "Město a hrad pánů z Poděbrad",
    n: "Hlavní město země kladské s hradem nad Nisou, na cestě z Čech do Slezska; země ta jest jako pevnost horami obehnaná. Pan Jiří ji získal léta Páně 1454 a spravuje ji jeho hejtman Hanuš z Varnsdorfu, Němec a katolík, pánovi svému však bezvýhradně oddaný.",
  },
  Minsterberk: {
    t: "Slezské knížecí město",
    n: "Sídlo knížectví minsterberského ve Slezsku, jež pan Jiří získal léta Páně 1456; jako v Kladsku vládne zde za něho hejtman Hanuš z Varnsdorfu.",
  },
  "Kunštát (Morava)": {
    t: "Hrad pánů z Poděbrad",
    n: "Rodový hrad pánů z Kunštátu na západní Moravě, podle něhož se rod píše. Po smrti pana Viktorina Bočka jej držela poručnická správa a Albrecht Rakouský; pan Jiří jej má od sklonku let čtyřicátých.",
  },
  "Český Krumlov": {
    t: "Sídelní město Rožmberků",
    n: "Hlavní sídlo pánů z Rožmberka: mohutný hrad nad zákruty Vltavy, v letech čtyřicátých nově přestavěný, a město pod ním se školou slovutnou až v Rakousích. Odtud vedl pan Oldřich za bouří husitských boj proti Táboru a léta Páně 1451 zde Kapistrán odmítl rozmluvu s Rokycanou. Vládu panství drží od léta 1457 nejmladší syn Oldřichův, pan Jan.",
  },
  Rožmberk: {
    t: "Hrad pánů z Rožmberka",
    n: "Starobylý hrad nad Vltavou, podle něhož se rod píše; hlavním sídlem jest nyní Krumlov, ale jméno i růže vzešly odtud. Léta Páně 1456 jej pan Jan vykoupil od pánů z Wallsee a sídlí zde vdova po panu Jindřichovi, paní Anežka ze Schaunberka.",
  },
  Třeboň: {
    t: "Rožmberské město",
    n: "Ohrazené město pánů z Rožmberka v rovině mezi rybníky a mokřinami, s klášterem augustiniánů, jejž rod založil léta Páně 1367. Panství zde spravuje panna Anežka, neprovdaná dcera pana Oldřicha, jež nebydlí na hradě, nýbrž v domě měšťanském.",
  },
  "Nové Hrady": {
    t: "Hrad pánů z Rožmberka",
    n: "Pomezní hrad Rožmberků u rakouské hranice, v jejich rukou od léta Páně 1359; střeží cestu z jižních Čech do Rakous.",
  },
  Konopiště: {
    t: "Hrad pánů ze Šternberka",
    n: "Hrad u Benešova, jejž Šternberkové drží od léta Páně 1327. Sedí zde pan Zdeněk Konopišťský ze Šternberka, nejvyšší purkrabí a nejmocnější muž strany římské u dvora.",
  },
  "Český Šternberk": {
    t: "Hrad pánů ze Šternberka",
    n: "Rodový hrad Šternberků na skalním ostrohu nad Sázavou, založený léta Páně 1241. Odtud se píše rod s hvězdou o osmi cípech.",
  },
  "Zelená Hora": {
    t: "Hrad pánů ze Švamberka",
    n: "Hrad na vrchu nad Nepomukem. Když husité léta Páně 1420 vypálili cisterciácký klášter Pomuk, stal se hrad střediskem zdejšího panství. Od těch let jej drží páni ze Švamberka.",
  },
  "Lukov (Morava)": {
    t: "Hrad pánů ze Šternberka",
    n: "Lesní hrad na ostrohu nad Zlínskem, jenž Šternberkům náleží již od čtrnáctého věku. Drží jej moravská větev rodu, pan Matouš ze Šternberka.",
  },
  "Holešov (Morava)": {
    t: "Panské město Šternberků",
    n: "Město na Hané se šternberskou tvrzí, jež nahradila starší hrad. Spolu s Lukovem je drží moravská větev rodu.",
  },
  "Jindřichův Hradec": {
    t: "Sídelní město pánů z Hradce",
    n: "Hrad a jedno z největších měst jižních Čech, kmenové sídlo pánů z Hradce se zlatou růží. Panství nyní spravují poručníci za nezletilé dědice.",
  },
  "Telč (Morava)": {
    t: "Panské město pánů z Hradce",
    n: "Hrad a město mezi rybníky na moravském pomezí, v rukou pánů z Hradce od léta Páně 1339. Odtud pocházejí nezletilí dědicové rodu, Jindřich a Heřman.",
  },
  Blatná: {
    t: "Hrad Lvů z Rožmitálu",
    n: "Vodní hrad mezi rybníky v Pootaví, kdež sídlí Lvové z Rožmitálu. Rod ten, z něhož pochází královna Johana, roste v moci spolu s chotěm jejím.",
  },
  Rožmitál: {
    t: "Hrad Lvů z Rožmitálu",
    n: "Hrad a městečko pod Třemšínem v Brdech, po nichž se Lvové z Rožmitálu píší. Drží je bratří královny Johany.",
  },
  "Rabštejn nad Střelou": {
    t: "Hrad mladších pánů z Rabštejna",
    n: "Hrad na skalním ostrohu nad řekou Střelou v kraji plzeňském, pod nímž leží malé městečko hrazené. Po něm se píší mladší páni z Rabštejna, rod pana kancléře Prokopa.",
  },
  Litomyšl: {
    t: "Zástavní město Kostků z Postupic",
    n: "Někdy sídlo biskupa litomyšlského, jehož biskupství v bouřích husitských zaniklo. Od léta Páně 1436 drží město zástavou Kostkové z Postupic, věrní kalicha.",
  },
  Postupice: {
    t: "Rodová tvrz Kostků z Postupic",
    n: "Ves s tvrzí u Benešova, rodové sídlo rytířů Kostků z Postupic. Rod ten nyní stoupá spolu s králem svým.",
  },
  Smiřice: {
    t: "Rodová tvrz Smiřických",
    n: "Tvrz a městečko na Labi u Hradce Králové, po nichž se Smiřičtí píší. Od popravy pana Jana léta Páně 1453 je spravují poručníci synů jeho.",
  },
  Houska: {
    t: "Hrad Smiřických",
    n: "Osamělý hrad na pískovcové skále v lesích kokořínských, jenž Smiřickým náleží od léta Páně 1432. Pověst praví, že pod ním zeje díra do pekel.",
  },
  Libštejn: {
    t: "Hrad pánů z Kolovrat",
    n: "Hrad pánů z Kolovrat na ostrohu nad Berounkou. Léta Páně 1425 jej husité sedm neděl obléhali, avšak nedobyli, i učinili s nimi Kolovratové posléze mír.",
  },
  "Švamberk (Krasikov)": {
    t: "Hrad pánů ze Švamberka",
    n: "Rodový hrad Švamberků na vrchu u Tachova. Léta Páně 1421 zde husité zajali pana Bohuslava ze Švamberka, kterýž potom k nim přistoupil a Tábor vedl.",
  },
  Bor: {
    t: "Hrad a městečko Švamberků",
    n: "Hrad a městečko u Tachova, jež Švamberkové drží od počátku patnáctého věku. Léta Páně 1430 je husité marně obléhali.",
  },
  Hazmburk: {
    t: "Hrad Zajíců z Hazmburka",
    n: "Hrad o dvou věžích, Bílé a Černé, na vrchu Klapý pod Řípem. Po něm se píše rod Zajíců; drží jej pan Zbyněk Zajíc, nejvyšší sudí zemský.",
  },
  Budyně: {t: "Hrad Zajíců z Hazmburka", n: "Vodní hrad a městečko nad Ohří pod Řípem, kteréž léta Páně 1451 koupil pan Zbyněk Zajíc z Hazmburka."},
  Hasištejn: {
    t: "Hrad Hasištejnských z Lobkovic",
    n: "Hrad na úbočí Krušných hor nad Kadaní, od léta Páně 1418 v rukou Lobkoviců, kteříž se po něm píší Hasištejnští.",
  },
  Děčín: {
    t: "Hrad pánů z Vartenberka",
    n: "Hrad na skále nad Labem při hranici míšeňské, kdež se vybírá clo labské. Sídlí zde pan Jan z Vartenberka a často sem táhnou nájezdy lužického Šestiměstí.",
  },
  Ralsko: {
    t: "Hrad pánů z Vartenberka",
    n: "Hrad na temeni osamělé hory Ralsko, viditelný široko daleko. Sídlí zde pan Heník z Vartenberka, jenž přepadá kupce lužické.",
  },
  Tolštejn: {
    t: "Hrad Berků z Dubé",
    n: "Hrad v horách lužických nad Jiřetínem. Pan Hynek Berka z Dubé živ jest z výpalného, které béře od kupců žitavských.",
  },
  Jestřebí: {
    t: "Hrad Smiřických",
    n: "Hrad na pískovcové skále u Doks, někdy Berků z Dubé. Léta Páně 1445 jej koupil pan Jan Smiřický, i zůstal po jeho popravě synům jeho.",
  },
  Dubá: {
    t: "Rodové sídlo Berků z Dubé",
    n: "Městečko s hradem u Kokořína, po němž se píší Berkové z Dubé, větev Ronovců se zkříženými ostrvemi v erbu.",
  },
  Velhartice: {
    t: "Hrad Švihovských z Rýzmberka",
    n: "Hrad v Pošumaví, proslulý kamenným mostem na pilířích, jenž spojuje palác s věží. Pan Děpolt Švihovský jej koupil od pánů z Hradce.",
  },
  Loket: {
    t: "Královský hrad zastavený Šlikům",
    n: "Královský hrad nad zákrutem Ohře, střed kraje loketského. Od léta Páně 1434 jej drží zástavou páni Šlikové.",
  },
  Pernštejn: {
    t: "Hrad pánů z Pernštejna",
    n: "Rodový hrad pánů z Pernštejna na skále nad Nedvědicí na pomezí českomoravském, sídlo pana Jana II., opory královy na Moravě.",
  },
  Tovačov: {
    t: "Hrad pánů z Cimburka",
    n: "Hrad a městečko na Hané, sídlo pana Jana Tovačovského z Cimburka, hejtmana zemského moravského a přední opory kalicha na Moravě.",
  },
  Cimburk: {
    t: "Hrad pánů z Cimburka",
    n: "Hrad v Chřibech nad Koryčany, jejž v první polovici čtrnáctého věku založil Bernart z Cimburka; podle něho se píší páni z Cimburka, jichž rod nyní vede pan Jan Tovačovský.",
  },
  Kroměříž: {
    t: "Biskupské město",
    n: "Město na Hané se sídlem biskupů olomouckých, nejvyšší vrchnosti duchovní na Moravě; biskupem jest od léta Páně 1457 Protas, řečený Tas, z Boskovic, posud nevysvěcený. Měšťané však drží s kalichem: léta 1452 zajali zdejší kališníci čtyřicet poutníků, kteří šli na kázání Kapistránovo. Biskupské zboží v okolí jest od bouří husitských z větší části zastaveno.",
  },
  Vyškov: {
    t: "Biskupské město",
    n: "Město s hradem biskupů olomouckých na cestě z Brna na Hanou. Sídlí zde zvolený biskup Tas z Boskovic, neboť Kroměříž jest v zástavě.",
  },
  Hukvaldy: {
    t: "Biskupský hrad v cizích rukou",
    n: "Hrad biskupů olomouckých v podhůří Beskyd, v bouřích husitských ztracený. Drží jej Jan Talafús z Ostrova, zeť žoldnéřského hejtmana Jana Čapka ze Sán.",
  },
  "Černá Hora": {
    t: "Hrad pánů z Boskovic",
    n: "Hrad nad městečkem u Blanska, sídlo černohorské větve pánů z Boskovic. Sedí zde pan Vaněk, nejvyšší komorník soudu zemského moravského.",
  },
  "Moravský Krumlov": {
    t: "Hrad pánů z Lipé",
    n: "Hrad a město na jihu Moravy, kteréž páni z Lipé drží od léta Páně 1447. Jest moravským sídlem nejvyššího maršálka pana Jindřicha z Lipé.",
  },
  "Velké Meziříčí": {
    t: "Hrad pánů z Lomnice",
    n: "Hrad a město nad řekou Oslavou na pomezí českomoravském, od čtyřicátých let sídlo pana Václava Meziříčského z Lomnice, muže dvoru habsburského.",
  },
  "Mikulov (Morava)": {
    t: "Hrad pánů z Lichtenštejna",
    n: "Hrad na skále nad městem vinařským při hranici rakouské, jenž Lichtenštejnům náleží od třináctého věku. Sídlí zde zadlužený pan Jan z Lichtenštejna s chotí svou Perchtou z Rožmberka.",
  },
  Valtice: {
    t: "Rakouské panství Lichtenštejnů",
    n: "Hrad a městečko hned za hranicí moravskou, náležející k Rakousům pod Enží. Lichtenštejnové tu stojí jednou nohou v Rakousích.",
  },
  Otmuchov: {
    t: "Biskupský hrad",
    n: "Hrad a město biskupů vratislavských v knížectví niském ve Slezsku. Spolu s Nisou náleží biskupu Joštovi z Rožmberka.",
  },
  "Horní Hlohov": {t: "Knížecí město", n: "Přední sídlo knížete Bolka V. Opolského, jediného knížete slezského, kterýž přeje kalichu."},
  Frýdlant: {
    t: "Hrad pánů z Bibrštejna",
    n: "Hrad na čedičové skále na severu Čech, jenž Bibrštejnům náleží od třináctého věku. Za bouří husitských byl kraj vydrancován, i drží se od té doby páni Šestiměstí.",
  },
  Žary: {t: "Lužické město Bibrštejnů", n: "Město v Dolní Lužici, jež vedle Frýdlantu náleží Bibrštejnům. Na Žary má zálusk Braniborsko."},
  Beeskow: {
    t: "Lužické město Bibrštejnů",
    n: "Městečko na Sprévě v Dolní Lužici při hranici braniborské. Tuto nejsevernější državu pánů z Bibrštejna ohrožují nároky braniborské.",
  },
  Landštejn: {
    t: "Hrad Krajířů z Krajku",
    n: "Pomezní hrad na cestě z Rakous do Čech. Krajířové zde za válek zbohatli na mýtě, kteréž vybírali ode všech stran.",
  },
  "Berlín-Cölln": {
    t: "Rezidence braniborských kurfiřtů",
    n: "Dvojměstí na Sprévě, jehož vzdor kurfiřt Fridrich II. zlomil. V Cöllnu dal sobě postaviti hrad a od léta Páně 1451 v něm sídlí.",
  },
  Chotěbuz: {
    t: "Braniborské město v Dolní Lužici",
    n: "Město na Sprévě. Polovici jeho koupil kurfiřt Fridrich II. léta Páně 1445 od pana Reinharda z Chotěbuzi za pět tisíc pět set kop grošů, druhá připadla mu léta 1455, když umřel bez dědiců pan Luther. Páni ze Šternberka však mají od krále Ladislava list na odúmrť i na vyplacení, a protož Koruna česká má kurfiřtovu koupi toliko za zástavu.",
  },
  Picnov: {
    t: "Braniborský hrad v Dolní Lužici",
    n: "Hrad a městečko nedaleko Chotěbuze. Kurfiřt Fridrich II. jej léta Páně 1442 vyplatil ze zástavy a drží jej jako oporu svou v Lužici.",
  },
  Krakov: {
    t: "Hlavní město Polského království",
    n: "Sídelní město krále Kazimíra IV. pod Wawelem, bohaté obchodem na Visle a měšťanstvem německým. Má slovutné učení, obnovené léta Páně 1400.",
  },
  Osvětim: {
    t: "Hrad a město Osvětimského knížectví",
    n: "Hrad a město na Sole nedaleko Visly. Knížectví toto, někdy léno Koruny české, koupil léta Páně 1457 polský král Kazimír IV.",
  },
  Budín: {
    t: "Královské sídlo Uher",
    n: "Královský hrad a město na vrchu nad Dunajem, naproti Pešti. V únoru léta Páně 1458 sem přijel nově zvolený král Matyáš Korvín.",
  },
  Zvolen: {
    t: "Hrad Jana Jiskry",
    n: "Královský hrad nad soutokem Hronu a Slatiny, jejž dal vystavěti Ludvík Veliký. Jest předním sídlem hejtmana Jiskry v Horních Uhrách.",
  },
  Kremnice: {
    t: "Královské horní město",
    n: "Zlaté a stříbrné doly s mincovnou, kde se razí uherské dukáty zlaté a kde se ražením zlata platí vojska pánů. Zdejší žíla je neobyčejně mocná; těžba však trpí neklidem v zemi, neboť horní města v okolí drží žoldnéři Jiskrovi.",
  },
  "Vídeňské Nové Město": {
    t: "Rezidence císaře Fridricha III.",
    n: "Opevněné město na poledne od Vídně, milé sídlo císaře Fridricha III. Na hradě jeho jest kaple svatého Jiří se stěnou erbů.",
  },
  Vídeň: {
    t: "Hlavní město Rakous",
    n: "Největší město rakouské s učením a chrámem svatého Štěpána, v duchovních věcech pod Pasovem. Po smrti krále Ladislava nemá jistého pána: přou se o ni císař Fridrich III. a arcivévoda Albrecht VI. a stavové odpovídají, že učiní, co káže právo, až se bratři dohodnou.",
  },
  Landshut: {
    t: "Sídelní město Ludvíka Bohatého",
    n: "Město na Isaře s hradem Trausnitz, sídlo vévody Ludvíka IX. Bohatého, nejbohatšího z bavorských Wittelsbachů.",
  },
  Mnichov: {
    t: "Sídelní město vévody Albrechta III.",
    n: "Město na Isaře a sídlo mnichovské linie bavorských Wittelsbachů, kdež vládne vévoda Albrecht III.",
  },
  Neumarkt: {t: "Sídlo falckraběte Oty I.", n: "Město v Horní Falci, od léta Páně 1448 sídlo falckrabího Oty I. Mosbašského z rodu Wittelsbachů."},
  Míšeň: {
    t: "Hradní a biskupské město Wettinů",
    n: "Kolébka Wettinů: na hradním vrchu nad Labem stojí hrad markrabí míšeňských a stolní chrám biskupství míšeňského.",
  },
  Drážďany: {
    t: "Rezidence saských Wettinů",
    n: "Město s hradem na Labi, od třináctého věku jedno ze sídel wettinských. Přes řeku vede most kamenný.",
  },
  Výmar: {
    t: "Sídlo vévody Viléma III.",
    n: "Město durynské, kdež sídlí vévoda Vilém III., bratr kurfiřta saského, s nímž vedl válku bratrovražednou.",
  },
  Plavno: {t: "Sídlo pánů z Plavna", n: "Přední město Fojtska na Bílém Halštrovu, sídlo pánů z Plavna, kteříž je drží v léno od Koruny české."},
  Glauchau: {t: "Hrad pánů ze Šumburka", n: "Město s hradem na Muldě, sídlo pánů ze Šumburka, kteříž je drží v léno od Koruny české."},
  Waldenburg: {
    t: "Hrad pánů ze Šumburka",
    n: "Hrad a město na Muldě, od léta Páně 1378 v rukou pánů ze Šumburka a léno Koruny české. Proslulo hrnčíři, kteří mají cech od léta Páně 1388.",
  },
  Plassenburg: {
    t: "Hrad frankských Hohenzollernů",
    n: "Mohutný hrad nad Kulmbachem na horním Mohanu, přední pevnost frankských Hohenzollernů, od léta Páně 1457 v rukou markrabího Albrechta Achilla.",
  },
  Ansbach: {
    t: "Sídelní město Albrechta Achilla",
    n: "Město franské, milé sídlo markrabího Albrechta Achilla, odkudž vládne panství svému u Norimberka.",
  },
  Zátor: {
    t: "Sídlo knížat zátorských",
    n: "Malé město na Skavě u Visly, sídlo chudého knížectví zátorského, jež se léta Páně 1445 oddělilo od Osvětimska.",
  },
  "Krakov (Wawel)": {
    t: "Biskupský chrám a královský hrad",
    n: "Hrad na vrchu nad Vislou se stolním chrámem, v němž se polští králové korunují a pohřbívají. Sídlí zde biskup krakovský s kapitulou.",
  },
  Tęczyn: {t: "Hrad Tęczyńských", n: "Rodový hrad Tęczyńských na zalesněném návrší na západ od Krakova, po němž se rod píše."},
  Rabsztyn: {
    t: "Královský hrad",
    n: "Královský hrad na skále u Olkuše, kdež se dobývá stříbro a olovo. Spravuje jej jako starosta pan Ondřej z Tęczyna.",
  },
  Šamotuly: {t: "Sídlo Šamotulských", n: "Město velkopolské na severozápad od Poznaně, rodové sídlo pánů ze Šamotul."},
  Hnězdno: {
    t: "Arcibiskupské město",
    n: "Nejstarší sídlo církve v Polsku, stolice arcibiskupa a primase. Ve chrámu odpočívají ostatky svatého Vojtěcha.",
  },
  Ostřihom: {
    t: "Arcibiskupské město",
    n: "Hrad a stolní chrám na vrchu nad Dunajem, sídlo arcibiskupa a primase uherského, jemuž přísluší korunovati krále uherské.",
  },
  "Oravský hrad": {
    t: "Hrad Petra Komorovského",
    n: "Královský hrad na vysoké skále nad řekou Oravou, jenž střeží cestu z Uher do Polska. Drží jej pan Petr Komorovský.",
  },
  Pezinok: {t: "Sídlo hrabat svatojiřských", n: "Město s hradem pod Malými Karpaty, obklopené vinicemi, sídlo hrabat ze Svatého Jura a Pezinku."},
  "Svätý Jur": {
    t: "Sídlo hrabat svatojiřských",
    n: "Vinařské město pod Malými Karpaty, po němž se hrabata svatojiřská píší. Nad městem stojí jejich hrad Biely Kameň.",
  },
  Schrattenthal: {
    t: "Hrad Oldřicha Eicingera",
    n: "Městečko s vodním hradem v kraji vinařském u Retzu, nedaleko hranice moravské. Pan Oldřich Eicinger je drží od léta Páně 1448 jako vlastní zboží.",
  },
  Heidenreichstein: {t: "Hrad Puchheimů", n: "Vodní hrad v lesích na severu Rakous pod Enží, nedaleko hranice české. Sídlí zde páni z Puchheimu."},
  Hardegg: {
    t: "Hrad hrabat z Hardeggu",
    n: "Hrad na skále nad Dyjí s městečkem pod ním, přímo na hranici moravské a rakouské. Sídlo hrabat z Hardeggu.",
  },
  Eferding: {
    t: "Sídelní město hrabat ze Schaunberku",
    n: "Město u Dunaje v Rakousích nad Enží, střed hrabství Schaunberků nedaleko hradu jejich Schaunberg.",
  },
  Pasov: {
    t: "Biskupské město",
    n: "Město na soutoku Dunaje, Innu a Ilzu s hradem biskupským nad řekou. Odtud vede Prachatická stezka se solí do Prachatic.",
  },
  Leuchtenberg: {t: "Hrad lankrabat z Leuchtenberka", n: "Rodový hrad lankrabí na vrchu v Horní Falci, nedaleko hranice kraje tachovského."},
  Pfreimd: {
    t: "Sídlo lankrabat z Leuchtenberka",
    n: "Městečko s vodním hradem v Horní Falci, sídlo lankrabí z Leuchtenberka a místo jejich rodové hrobky.",
  },
  Stolpen: {t: "Hrad biskupa míšeňského", n: "Hrad na čedičovém vrchu na východ od Drážďan, sídlo biskupů míšeňských."},
  Gera: {
    t: "Sídlo pánů z Gery",
    n: "Město na Bílém Halštrovu, sídlo pánů z Gery na hradě Osterštejně. Léta Páně 1450 bylo téměř zničeno v saské válce bratrovražedné.",
  },
  Greiz: {t: "Sídlo Reussů", n: "Město na Bílém Halštrovu s hradem na vrchu nad řekou, sídlo Reussů z Greizu."},
  Strážnice: {
    t: "Panské město pánů z Kravař",
    n: "Město na řece Moravě při pomezí uherském, sídlo pana Jiřího z Kravař a ze Strážnice. Šestého dne února léta Páně 1458 zde pan Jiří z Poděbrad předal Uhrům mladého Matyáše, jejž přebírala matka jeho Alžběta, a devátého dne zpečetěna smlouva o Matyášově sňatku s Kateřinou, dcerou páně Jiřího.",
  },
  Hodonín: {
    t: "Zastavené zeměpanské město",
    n: "Město s hradem na řece Moravě při pomezí uherském. Kolem léta Páně 1451 se ho zmocnil drsný vladyka Václav Sudlice z Nespečova, služebník Hunyadiho, a odtud plenil zboží biskupa olomouckého i pánů moravských. Teprve za rakouské peníze odtáhl a král Ladislav léta 1453 zastavil Hodonín rakouskému dvornímu maršálkovi Zikmundovi Fritzesdorferovi.",
  },
  Cornštejn: {
    t: "Hrad Bítovských z Lichtenburka",
    n: "Hrad na skalním ostrohu nad Dyjí blízko pomezí rakouského, sídlo pana Hynka Bítovského z Lichtenburka. Rod jeho, odedávna nepřítel Kunštátů, kryje lapky, kteří plení Moravu i Rakousy. Na posledním soudu krále Ladislava v listopadu léta Páně 1457 se pan Hynek přel s panem Prockem z Kunštátu o olomoucké komornictví, až jeden druhého vyzýval na souboj.",
  },
  Mejdštejn: {
    t: "Hrad pánů z Rožmberka",
    n: "Mejdštejn, čili Dívčí Kámen, hrad na ostrohu nad soutokem Vltavy s Křemžským potokem, na dohled od Krumlova i Zlaté Koruny. Od léta Páně 1457 tu na výměnku sedí starý pan Oldřich z Rožmberka, kulhavý a nesmířený, když vládu panství předal synu Janovi. Pan Jiří drží jeho úpis na šestnáct tisíc zlatých.",
  },
  Helfenburk: {
    t: "Hrad pánů z Rožmberka",
    n: "Hrad v lesích nad Bavorovem, západní výspa panství rožmberského. Úředníci odsud posílají zprávy na Krumlov, sjednávají se tu příměří a doručují opovědi pánům z Rožmberka; ve věžích jeho za bouří husitských zemřeli kněží zajatí léta Páně 1420. Pod hradem stojí krčma s noclehem.",
  },
  Želiv: {
    t: "Zpustlý klášter premonstrátů",
    n: "Klášter premonstrátů nad řekou Želivkou na pomezí českomoravském, odkud vyšel kněz Jan Želivský, kazatel pražské chudiny. Za bouří husitských klášter zpustl a řeholníci se rozešli; kazatelé želivského původu posud burcují obecný lid v Jihlavě.",
  },
  Pohansko: {
    t: "Opuštěné hradisko",
    n: "Veliký val zarostlý lužním lesem na soutoku Moravy s Dyjí u Břeclavi, kde v dávných časech stával hrad u brodu přes Moravu. Uvnitř leží trosky kamenného kostela; po staletí tu nikdo nebydlí a rozvodněné řeky val rok co rok podmílají. Lid mu říká Pohansko.",
  },
  Bítov: {
    t: "Hrad Bítovských z Lichtenburka",
    n: "Starý hrad nad Dyjí na pomezí moravsko-rakouském, po němž se páni Bítovští z Lichtenburka píší. Rod ten jest svárlivý a s pány z Kunštátu žije v odvěkém nepřátelství.",
  },
  Siklós: {
    t: "Hrad pánů z Gary",
    n: "Hrad v jižních Uhrách pod vinohrady, sídlo mocných pánů z Gary. Palatin Ladislav z Gary chtěl mladému Matyášovi dáti za ženu svou dceru, ale volba se mu vymkla z rukou a nyní hledí na nového krále s nevolí.",
  },
  Ilok: {
    t: "Hrad pánů z Újlaku",
    n: "Hrad nad Dunajem v kraji sremském, sídlo Mikuláše z Újlaku, po Garaiovi nejmocnějšího velmože uherského. Oba páni sami snili o koruně a jeden druhého drží v šachu.",
  },
  /* ---- SEVER (mapa 2026-10-27) ---- */
  Gdaňsk: {
    t: "Hanzovní město, hlava Pruského svazu",
    n: "Gdaňsk jest největším a nejbohatším městem Prus, přístavem při ústí Visly, kudy jde obilí, dřevo a popel z Polska do Flander a Anglie. Léta Páně 1454 vypověděl Řádu poslušnost a za to dostal od krále Kazimíra veliká privilegia i vlastní území. Platí žold stovkám žoldnéřů a vypravuje kaperské lodi proti Řádu i Dánům; nad Motlavou stojí nová brána s jeřábem, jímž se nakládají lodi. Ve městě žije ve vyhnanství sesazený král švédský Karel Knutsson.",
  },
  Toruň: {
    t: "Hanzovní město Pruského svazu",
    n: "Toruň jest starým městem na Visle, kde se převáží z Kujav do Prus a kde kupci mají právo skladu. Ve Starém Městě zasedá tajná rada Pruského svazu; měšťané v únoru léta Páně 1454 dobyli hrad Řádu a rozbořili jej, aby jim už nikdy nevládl. Loni tu obec povstala proti daním na válku a rada ji tvrdě zkrotila.",
  },
  Elbląg: {
    t: "Hanzovní město Pruského svazu",
    n: "Elbląg leží při Viselském zálivu a jest po Gdaňsku druhým přístavem Prus. V Elblągu se léta Páně 1440 sešli páni a města, aby se spolčili proti Řádu, a za války měšťané strhli hrad Řádu. S Gdaňskem staví kaperské lodi, jimiž přepadají koráby Řádu na zálivu.",
  },
  Chełmno: {
    t: "Město Pruského svazu",
    n: "Chełmno na vysokém břehu Visly dalo jméno právu chełmińskému, podle něhož se řídí skoro všechna města v Prusích. Jest hlavou Chełmińské země, kterou Svaz poddal králi polskému, a lid i šlechta stojí při Svazu.",
  },
  Grudziądz: {
    t: "Město Pruského svazu",
    n: "Město s hradem na pravém břehu Visly mezi Toruní a Malborkem. Se Svazem vypovědělo Řádu poslušnost a leží na cestě, kudy táhnou vojska krále polského do Prus.",
  },
  Tczew: {
    t: "Pomezní město na Visle",
    n: "Město nad Vislou, kde se převáží na cestě z Gdaňska do Malborku a do Prus. Za války přechází z ruky do ruky: Řád ji zastavil svým žoldnéřům za dlužný žold a ti o ni smlouvají s Poláky stejně jako o Malbork.",
  },
  Královec: {
    t: "Sídlo velmistra Řádu, hanzovní město",
    n: "Královec na Pregole jsou tři města – Staré Město, Löbenicht a Kneiphof na ostrově s chrámem biskupa sambijského – pod mocným hradem Řádu. Za vzpoury stavů léta Páně 1455 se dvě města vrátila k Řádu a Kneiphof se po obležení vzdal. Od ztráty Malborku sídlí na hradě velmistr Ludvík z Erlichshausenu a odtud vede válku.",
  },
  Chojnice: {
    t: "Pevnost Řádu",
    n: "Město s hradem na pomezí Pomoří, za bažinatým potokem. Pod ním porazili 18. dne září léta Páně 1454 žoldnéři Řádu ve vozové hradbě polskou šlechtickou hotovost, Poláci ztratili tisíce mužů i královskou korouhev a pečeť. Řád Chojnice drží dál, neboť tudy vede jeho spojení s Novou markou a Říší, odkud přicházejí žoldnéři.",
  },
  Gniew: {
    t: "Hrad Řádu na Visle",
    n: "Cihlový hrad Řádu na vysokém levém břehu Visly. Spolu s Chojnicemi drží Řádu cestu z Říše na dolní Vislu; posádku tvoří žoldnéři.",
  },
  Puck: {
    t: "Přístav na Pomoří",
    n: "Městečko s hradem při Puckém zálivu na severu Pomoří. Rybářský úřad a okolí zastavil král roku 1454 a 1455 Gdaňsku a ten je roku 1457 dal do zástavy za 15 000 marek vyhnanému švédskému králi Karlu Knutssonovi; kdo drží samotný hrad, je na jaře 1458 nejisté.",
  },
  Tapiawa: {
    t: "Hrad Řádu",
    n: "Hrad Řádu na Pregole východně od Královce, na cestě k Litvě.",
  },
  Ragneta: {
    t: "Pomezní hrad Řádu",
    n: "Mohutný cihlový hrad Řádu nad Němenem, odkud se kdysi táhlo na pohanskou Žmuď a Litvu. Dnes hlídá pomezí litevské, za nímž leží Žmuď, kde dosud žijí lidé ani pohanští, ani opravdu křesťanští.",
  },
  Malbork: {
    t: "Hrad krále polského, město Řádu",
    n: "Malbork, největší cihlový hrad křesťanstva, byl na půldruhého sta let sídlem velmistrů Řádu. Šestého dne června léta Páně 1457 jej neplacení žoldnéři, vedení Čechem Oldřichem Červenkou, prodali králi polskému a velmistr odešel se slzami v očích. Moravský hejtman Bernard Šumborský, který prodej odmítl, pak pro Řád znovu dobyl město pod hradem; na hradě leží Poláci, ve městě Řád, a Češi stojí na obou stranách hradeb.",
  },
  Lidzbark: {
    t: "Hrad biskupů varmijských",
    n: "Čtyřkřídlý cihlový hrad na soutoku Łyny a Symsarny, sídlo biskupů varmijských. Biskupský stolec jest uprázdněn a sporný a hrad sevřen válkou mezi Řádem a Svazem.",
  },
  Frombork: {
    t: "Sídlo kapituly varmijské",
    n: "Městečko na pahorku nad Viselským zálivem s opevněným chrámem, při němž sídlí kanovníci varmijští. Z kopce je vidět přes záliv až k Viselské kose.",
  },
  "Olsztyn (Allenstein)": {
    t: "Hrad kapituly varmijské",
    n: "Hrad a město kapituly varmijské na řece Łyně v jižní Varmii. Léta Páně 1455 je vzal Řád, který odtud ohrožuje kraj kolem.",
  },
  Iława: {
    t: "Pomezní hrad v Prusích",
    n: "Hrad a město mezi jezery v jižních Prusích. Řád je léta Páně 1454 zastavil žoldnéřům spolu s Malborkem a Tczewem a ti je loni prodali králi polskému.",
  },
  Kwidzyn: {
    t: "Sídlo biskupa pomezanského",
    n: "Hrad a chrám kapituly pomezanské nad údolím Visly, mezi Toruní a Malborkem. Zde léta Páně 1440 šlechta a města zpečetili Pruský svaz, neboť Řád tu neměl hrad ani posádku. V chrámu leží zbožná poustevnice Dorota z Mątów, kterou lid ctí jako svatou a k níž se putuje z celých Prus.",
  },
  Volgast: {
    t: "Sídlo vévodů pomořansko-volgastských",
    n: "Vévodský hrad na ostrůvku v úžině Peene naproti ostrovu Usedomu, sídlo bratří Erika a Vartislava. Odtud se vládne Předním Pomořanům i ostrovu Rujáně.",
  },
  Štětín: {
    t: "Hanzovní město, sídlo vévodů štětínských",
    n: "Štětín jest největším městem Pomořan, na vysokém břehu Odry nad Štětínským zálivem, s vévodským hradem a hanzovním přístavem. Po Odře sem plují lodi s obilím a dřevem z Braniborska a Slezska a zpět jdou sledě a sůl. Vládne tu mladý vévoda Ota a kurfiřt braniborský by tu rád vládl po něm.",
  },
  Ueckermünde: {
    t: "Hrad vévodů pomořanských",
    n: "Vévodský hrad a městečko při ústí řeky Uecker do Štětínského zálivu, obklopené lesy a vřesovišti, kde vévodové rádi loví.",
  },
  Darłowo: {
    t: "Sídlo krále Erika Pomořanského",
    n: "Hrad a město při ústí Wieprzy nedaleko moře. Sídlí tu starý Erik Pomořanský, někdy král Dánska, Norska a Švédska, kterého poddaní sesadili; z Gotlandu, kde léta žil, si prý přivezl poklad. Odtud vládne zemi słupské.",
  },
  Słupsk: {
    t: "Hanzovní město Zadních Pomořan",
    n: "Město na Słupi, hlavní místo země słupské, kterou drží starý král Erik. Náleží k Hanze a obchoduje s Gdaňskem i s Lübeckem.",
  },
  Kamín: {
    t: "Sídlo biskupství kamínského",
    n: "Chrám a kapitula biskupství kamínského nad zálivem u ústí Odry. Biskupství podléhá přímo papeži a diecéze jeho jest prý veliká jako mohučská.",
  },
  Koszalin: {
    t: "Město biskupů kamínských",
    n: "Město pod horou Chełmskou s mariánskou poutní kaplí, nedaleko moře. Náleží biskupům kamínským a k Hanze.",
  },
  Anklam: {
    t: "Hanzovní město",
    n: "Hanzovní město na řece Peene, odkud se lodi dostanou do Štětínského zálivu i k moři. Kupci obchodují s obilím a sladem.",
  },
  Pasewalk: {
    t: "Pomořanské město",
    n: "Město na řece Uecker na pomezí Pomořan a Ukerské marky, o něž se vévodové pomořanští dlouho přeli s Braniborem.",
  },
  Stargard: {
    t: "Hanzovní město",
    n: "Stargard na řece Ině jest po Štětínu nejbohatším městem vévodství štětínského; kupci jeho chtějí plout po Ině a Odře volně k moři, a proto se ustavičně svářejí se Štětínem.",
  },
  Kolobřeh: {
    t: "Hanzovní město, solivar",
    n: "Přístav při ústí Parsęty, kde se odedávna vaří sůl ze solných pramenů a vozí se do Pomořan i do Velkopolska. Město náleží biskupům kamínským, ale vládne si samo a s biskupy se přou.",
  },
  Lübeck: {
    t: "Svobodné říšské město, hlava Hanzy",
    n: "Lübeck, královna Hanzy, jest městem nad Travou s věžemi kostela Panny Marie, kde se scházejí sjezdy hanzovních měst. Rada dvanácti konšelů vládne doživotně a lid se vlády neúčastní, ale nikdo ho neutiskuje. Odtud jde lübecké právo do desítek měst a sem se sváží sůl z Lüneburku a sledě ze Skåne.",
  },
  Hamburk: {
    t: "Hanzovní město",
    n: "Hamburk na dolním Labi jest branou Hanzy k Severnímu moři a Flandrám. Vaří se tu pivo, jež se vozí lodí až do Nizozemí, a rada si vládne sama, hrabatům holštýnským se klaní jen slovy. Léta Páně 1401 tu na Grasbrooku sťali piráta Klause Störtebekera a jeho druhy.",
  },
  Lüneburk: {
    t: "Hanzovní město, solivar",
    n: "Lüneburk bohatne na solivaru, z něhož se sůl vozí po solné stezce a průplavem do Lübecku a odtud po celém Baltu. Podíly v solných pánvích drží i kláštery a preláti; spor o jejich důchody zmítá městem již léta a došel až k papeži i k císaři.",
  },
  Wismar: {
    t: "Hanzovní město",
    n: "Hanzovní přístav v zátoce mezi Lübeckem a Rostockem, jehož pánem jest vévoda meklenburský; město si však vládne samo a s Lübeckem a Rostockem drží spolek.",
  },
  Rostock: {
    t: "Hanzovní město s vysokým učením",
    n: "Rostock na řece Warnow jest největším městem Meklenburska. Od léta Páně 1419 má vysoké učení, které musilo pro papežskou klatbu na město léta 1437 až 1443 přesídlit do Greifswaldu. Rada si vládne sama a s vévodou se přou o práva.",
  },
  Stralsund: {
    t: "Hanzovní město",
    n: "Stralsund leží naproti ostrovu Rujáně za úzkým průlivem, přes nějž jezdí přívoz. Zde léta Páně 1370 Hanza vnutila králi dánskému mír, po němž vládne Baltu. Město jest bohaté a vládne si samo.",
  },
  Greifswald: {
    t: "Hanzovní město s vysokým učením",
    n: "Hanzovní město na řece Rycku při moři. Léta Páně 1456 tu purkmistr Jindřich Rubenow s vévodou Vartislavem založil vysoké učení. Opodál leží cisterciácký klášter Eldena.",
  },
  Schwerin: {
    t: "Sídlo vévodů a biskupů meklenburských",
    n: "Město na Svěřínském jezeře s vévodským hradem na ostrově a chrámem biskupů svěřínských. Sídlí tu vévoda Jindřich Tlustý.",
  },
  Güstrow: {
    t: "Hrad vévodů meklenburských",
    n: "Někdejší sídlo pánů z Werle, jejichž větev léta Páně 1436 vymřela; nyní hrad a město vévodů meklenburských.",
  },
  "Burg Stargard": {
    t: "Hrad vévodů stargardských",
    n: "Hrad na vrchu na jihovýchodě Meklenburska, po němž se píše stargardská větev vévodů meklenburských; pod ním leží město Neubrandenburg.",
  },
  "Šlesvik (Gottorf)": {
    t: "Sídlo vévody šlesvického",
    n: "Starobylé město na zátoce Schlei s biskupským chrámem a nedaleký hrad Gottorf, kde rád sídlí starý vévoda Adolf. Kolem leží vévodství šlesvické, léno koruny dánské.",
  },
  Segeberg: {
    t: "Hrad hrabat holštýnských",
    n: "Hrad na sádrovcovém vrchu nad městečkem, nejpevnější místo Holštýnska.",
  },
  Rendsburg: {
    t: "Hrad na Eideře",
    n: "Hrad a město na řece Eideře, která dělí Holštýnsko od Šlesvicka a Říši od Dánska. Vede tudy Volská stezka z Jutska do Hamburku.",
  },
  Plön: {
    t: "Hrad hrabat holštýnských",
    n: "Hrad mezi jezery ve východním Holštýnsku, jedno ze sídel hrabat holštýnských.",
  },
  Lauenburg: {
    t: "Hrad vévodů sasko-lauenburských",
    n: "Hrad na vysokém břehu Labe, kde začíná průplav do Lübecku. Vévodové tu vybírají clo ze soli a zboží, jež jde po řece.",
  },
  Ratzeburg: {
    t: "Sídlo biskupů ratzeburských",
    n: "Město na ostrově v jezeře s cihlovým chrámem, který dal postavit vévoda Jindřich Lev, a sídlo biskupů ratzeburských.",
  },
  Kiel: {
    t: "Hanzovní město v Holštýnsku",
    n: "Přístav na dlouhé zátoce Baltu. Každého roku po Třech králích se tu schází šlechta holštýnská na velký trh, kde se půjčují a splácejí peníze.",
  },
  Itzehoe: {
    t: "Město v Holštýnsku",
    n: "Město s lubeckým právem na řece Stör v západním Holštýnsku, s ženským klášterem cisterciaček.",
  },
  Mölln: {
    t: "Město v zástavě Lübecku",
    n: "Město mezi jezery na solné stezce, které vévodové lauenburští zastavili Lübecku; jde jím průplav, po němž plují lodi se solí z Lüneburku.",
  },
  Eutin: {
    t: "Sídlo biskupů lubeckých",
    n: "Městečko mezi jezery ve východním Holštýnsku, kde biskupové lubečtí sídlí raději než v Lübecku, s jehož měšťany nejsou zadobře.",
  },
  Vordingborg: {
    t: "Hrad krále dánského",
    n: "Královský hrad na jihu Sjællandu při úžině, odkud se vyplouvá na jižní ostrovy a do Pomořan. Na vysoké věži hradu nechal kdysi král Valdemar posadit zlatou husu na posměch Hanze a tu také zemřel.",
  },
  Nykøbing: {
    t: "Hrad krále dánského",
    n: "Královský hrad a městečko na ostrově Falsteru při úžině Guldborgsund, výspa dánská proti pobřeží meklenburskému.",
  },
  Hammershus: {
    t: "Hrad arcibiskupů lundských",
    n: "Mohutný hrad na skalách nad mořem na severu ostrova Bornholmu, který drží arcibiskupové lundští. Z pevniny se sem dostane jen lodí.",
  },
  Ciechanów: {
    t: "Hrad knížat mazovských",
    n: "Zděný hrad knížat mazovských na severu Mazovska, nedaleko pomezí pruského.",
  },
  Wizna: {
    t: "Pomezní hrad Mazovska",
    n: "Hrad na Narvi u soutoku s Biebrzou, na pomezí Mazovska, Litvy a Prus, uprostřed bažin a lesů.",
  },
  Kruszwica: {
    t: "Královský hrad na Kujavách",
    n: "Hrad na břehu jezera Gopła s osmibokou cihlovou věží. Podle starých kronik tu kdysi sídlil zlý kníže Popel, kterého prý sežraly myši.",
  },
  Bydhošť: {
    t: "Královské město",
    n: "Město s královským hradem na řece Brdě nedaleko jejího ústí do Visly, sídlo starosty. Jest oporou krále polského ve válce v Prusích a tudy se jde do Pomoří.",
  },
  Inowrocław: {
    t: "Královské město, hlava Kujav",
    n: "Město uprostřed úrodných Kujav, kde se vaří sůl ze solanky. Leží na cestě z Hnězdna do Toruně.",
  },
  Nakło: {
    t: "Královské město",
    n: "Město s hradem na řece Noteci, kdysi pevnost proti Pomořanům, dnes na cestě z Velkopolska do Pomoří.",
  },
  Wałcz: {
    t: "Pomezní královské město",
    n: "Město mezi jezery na pomezí Velkopolska a Nové marky, od léta Páně 1368 polské. Tudy vede cesta z Poznaně k moři do Kolobřehu.",
  },
  Łomża: {
    t: "Mazovské město",
    n: "Dřevěné město na vysokém břehu Narve v severovýchodním Mazovsku, na cestě z Varšavy k Litvě.",
  },
  Pułtusk: {
    t: "Sídlo biskupů płockých",
    n: "Město na Narvi s hradem biskupů płockých, kteří tu rádi pobývají. Kolem leží kraj lesů a bažin.",
  },
  Ostrołęka: {
    t: "Mazovské město",
    n: "Pomezní město na Narvi při Zelené pušči, kde žijí brtníci a lovci.",
  },
  Prenzlau: {
    t: "Hlavní město Ukerské marky",
    n: "Bohaté město na Ukerském jezeře, hlava Ukerské marky. O ni a o celou marku se kurfiřt dlouho přel s vévody pomořanskými, až léta Páně 1448 zůstala Braniborsku.",
  },
  Angermünde: {
    t: "Město Ukerské marky",
    n: "Město mezi jezery na cestě z Berlína do Štětína, za válek s Pomořany často dobývané.",
  },
  Templin: {
    t: "Město Ukerské marky",
    n: "Město uprostřed jezer a lesů na jihu Ukerské marky, obehnané kamennou hradbou.",
  },
  Perleberg: {
    t: "Hanzovní město v Přignicku",
    n: "Hlavní město Přignicka na řece Stepenici, na cestě z Berlína k Hamburku. Náleží k Hanze.",
  },
  Pritzwalk: {
    t: "Město v Přignicku",
    n: "Soukenické město v Přignicku, nedaleko poutního Wilsnacku.",
  },
  Kyritz: {
    t: "Město v Přignicku",
    n: "Malé město mezi jezírky v Přignicku, na cestě z Berlína k Labi.",
  },
  Neuruppin: {
    t: "Sídlo hrabat z Lindowa a Ruppinu",
    n: "Město na Ruppinském jezeře, kde vládnou hrabata z Lindowa a Ruppinu, nejmocnější páni v marce po kurfiřtovi. Stojí tu i klášter dominikánů.",
  },
  Salzwedel: {
    t: "Hanzovní město Staré marky",
    n: "Hanzovní město na řece Jeetze ve Staré marce, na cestě z Magdeburku do Lüneburku a k Hamburku.",
  },
  Choszczno: {
    t: "Město Nové marky",
    n: "Město mezi jezery v Nové marce, které léta Páně 1455 přešlo s celou markou od Řádu na kurfiřta braniborského.",
  },
  Myślibórz: {
    t: "Město Nové marky",
    n: "Někdejší hlavní město Nové marky. Od léta Páně 1455 jest s celou markou kurfiřtovo.",
  },
  Drawsko: {
    t: "Město Nové marky",
    n: "Město na řece Drawě na severu Nové marky, při pomezí Pomořan; kolem leží rozsáhlé bory.",
  },
  Świdwin: {
    t: "Město Nové marky",
    n: "Město s hradem na severním okraji Nové marky, vklíněné do země pomořanské; Řád je kdysi koupil a s markou prodal kurfiřtovi.",
  },
  Drezdenko: {
    t: "Pomezní hrad Nové marky",
    n: "Hrad v bažinách na řece Noteci, kde se střetávají Nová marka, Velkopolsko a Pomořany. Kdo jej drží, zavírá cestu po řece.",
  },
  Wittstock: {
    t: "Sídlo biskupů havelberských",
    n: "Hrad a město na řece Dosse v Přignicku, kde raději než v Havelbergu sídlí biskupové havelberští.",
  },
  Drohičin: {
    t: "Hrad velkoknížete litevského",
    n: "Starý ruský hrad na vysokém břehu Bugu, hlava Podlasí. Kníže Daniel Haličský tu léta Páně 1253 přijal korunu od papeže. Od léta 1444 jest hrad litevský a žijí tu katolíci i Rusové řeckého vyznání.",
  },
  Tykocin: {
    t: "Hrad pánů Goštautů",
    n: "Hrad na Narvi na pomezí Mazovska a Litvy, který velkokníže léta Páně 1433 dal mocnému litevskému pánu Goštautovi. Jonas Goštautas, vojvoda vilenský, patří mezi ty, kdo by chtěli Litvě vlastního velkoknížete.",
  },
  Brańsk: {
    t: "Hrad velkoknížete litevského",
    n: "Hrad a město na řece Nurci v Podlasí, na pomezí Mazovska a Litvy.",
  },
  /* ---- JIH (mapa 2026-10-27) ---- */
  Benátky: {
    t: "Republika na laguně",
    n: "Benátky jsou královnou moře a nejlidnatějším městem v těchto končinách, postaveným na ostrovech laguny. Vládne jim dóže Pasquale Malipiero, zvolený na podzim léta Páně 1457, když starého Francesca Foscariho sesadili; moc však drží Velká rada a Rada desíti. U mostu Rialto stojí dům německých kupců (Fondaco dei Tedeschi), kam jezdí i kupci z Norimberka a Vratislavi, a v Arzenálu se stavějí galéry.",
  },
  Chioggia: {
    t: "Benátské město v laguně",
    n: "Rybářské a solné město na jižním konci laguny. Léta Páně 1379 je dobyli Janované a Benátky je o rok později vybojovaly zpět ve válce, jež rozhodla o vládě nad mořem.",
  },
  Padova: {
    t: "Benátské město s učením",
    n: "Starobylé město s věhlasným učením práv a lékařství, kde studují i Němci a Čechové. V bazilice svatého Antonína odpočívá světec, k jehož hrobu putují poutníci, a před ní stojí od nedávna bronzový jezdec, socha kondotiéra Gattamelaty. Benátkám poslouchá od léta Páně 1405, kdy padl rod Carrarů.",
  },
  Vicenza: {
    t: "Benátské město",
    n: "Město pod Berickými vrchy, které se léta Páně 1404 samo poddalo Benátkám. Živí se suknem a obchodem.",
  },
  Verona: {
    t: "Benátské město",
    n: "Mocné město na Adiži s římskou arénou a kamenným mostem; vládli mu páni della Scala. Od léta Páně 1405 je benátské. Tudy jde cesta z Benátek přes Trident a Brenner do Němec.",
  },
  Treviso: {
    t: "Benátské město",
    n: "Nejstarší pevninské državy Benátek (od léta Páně 1339), město kanálů a brána k Furlánsku a k horám. Odtud vycházejí cesty do Korutan i do Němec.",
  },
  Belluno: {
    t: "Benátské město",
    n: "Horské město nad Piavou, benátské od léta Páně 1404. Po Piavě se odtud plaví do laguny dříví z hor, z něhož Benátky stavějí lodě i domy.",
  },
  Brescia: {
    t: "Benátské město",
    n: "Bohaté město zbrojířů pod Alpami, benátské od léta Páně 1426. V letech 1438 až 1440 odolalo dlouhému obléhání vojska milánského. Z údolí nad městem sem jde železo a kováři zde kují zbroj a čepele.",
  },
  Bergamo: {
    t: "Benátské město",
    n: "Nejzápadnější město Benátek, na kopci nad lombardskou rovinou; benátské od léta Páně 1428. Od míru v Lodi léta 1454 dělí Benátky od Milána řeka Adda.",
  },
  Rovereto: {
    t: "Benátská pevnost",
    n: "Hrad a městečko na Adiži pod Tridentem, které Benátčané drží od léta Páně 1416; hlídá cestu z Němec k Veroně a hranici s biskupstvím tridentským.",
  },
  Udine: {
    t: "Hlavní město Furlánska",
    n: "Hlavní město Furlánska pod hradním vrchem, kde stával palác patriarchů akvilejských. Od léta Páně 1420 je v moci Benátek, jež sem posílají svého místodržícího; zasedá tu i furlánský sněm.",
  },
  Cividale: {
    t: "Furlánské město",
    n: "Starobylé město nad říčkou Natisone, kde kdysi sídlili langobardští vévodové furlánští; zbyl po nich chrámek a mnohé památky. Od léta Páně 1420 je benátské a na východ od něho žijí v horách Slované.",
  },
  Gemona: {
    t: "Furlánské městečko",
    n: "Městečko pod horami na Kanálské cestě, jež má právo skladu: kupci, kteří jdou z Němec do Benátek, tu musí zboží složit a nabídnout.",
  },
  Venzone: {
    t: "Furlánské městečko",
    n: "Opevněné městečko v soutěsce Tagliamenta, kudy jde cesta z Korutan do Furlánska; vybírá se tu clo z každého soumaru.",
  },
  Portogruaro: {
    t: "Přístav biskupů z Concordie",
    n: "Říční přístav na Lemene, odkud se zboží z Němec plaví do laguny. Městečko patří biskupům z Concordie a s nimi poslouchá Benátky.",
  },
  Grado: {
    t: "Benátské městečko v laguně",
    n: "Ostrovní městečko v laguně, starý stolec patriarchů gradských. Léta Páně 1451 přenesl papež jejich hodnost do Benátek a Grado zůstalo městečkem rybářů.",
  },
  Akvileja: {
    t: "Město patriarchy",
    n: "Kdysi mocné římské město, jež léta 452 vyvrátil Attila, král Hunů. U velkolepé baziliky sídlí kapitula; Benátčané po dobytí Furlánska ponechali patriarchovi Akvileju, San Vito a San Daniele a roční plat. Okolí je bažinaté a nezdravé.",
  },
  "San Vito": {
    t: "Městečko patriarchy",
    n: "Městečko u Tagliamenta, jedno ze tří, která Benátky léta Páně 1445 ponechaly patriarchovi akvilejskému.",
  },
  "San Daniele": {
    t: "Městečko patriarchy",
    n: "Městečko na pahorku nad Tagliamentem, odkud je vidět Furlánsko až k moři; patří patriarchovi akvilejskému.",
  },
  Koper: {
    t: "Hlavní město benátské Istrie",
    n: "Město na skalnatém ostrově spojeném s pevninou hrází, sídlo benátského podesty a kapitána celé Istrie. Ze solných polí kolem něho jde sůl soumary po stezce přes Kras do Kraňska.",
  },
  Piran: {
    t: "Benátské město",
    n: "Město solných polí na výběžku Istrie, benátské od léta Páně 1283. Piranská sůl jde po moři do Benátek i soumary do Kraňska; měšťané mluví italsky a s Benátkami se o sůl ustavičně přou.",
  },
  Poreč: {
    t: "Biskupské město",
    n: "Biskupské město na pobřeží Istrie s bazilikou biskupa Eufrasia, jejíž zlaté mozaiky jsou starší nežli tisíc let. Benátské od léta Páně 1267.",
  },
  Rovinj: {
    t: "Benátské město",
    n: "Rybářské město na ostrůvku těsně u břehu Istrie, benátské od léta Páně 1283; z okolních lomů se vozí kámen do Benátek.",
  },
  Pula: {
    t: "Benátské město",
    n: "Starobylé římské město s obrovskou arénou a vítězným obloukem, dnes zchudlé a zpustlé morem a válkami. Benátkám poslouchá od léta Páně 1331.",
  },
  Motovun: {
    t: "Benátské městečko",
    n: "Opevněné městečko na kopci uprostřed Istrie, benátské; pod ním se v údolí Mirny táhne hustý dubový hvozd. Na dohled leží rakouské Pazinsko.",
  },
  Cres: {
    t: "Benátské městečko na ostrově",
    n: "Hlavní městečko ostrova Cresu, benátské od léta Páně 1409. Ostrované chovají ovce a loví ryby; v horách ostrova hnízdí supi.",
  },
  Rab: {
    t: "Benátské město na ostrově",
    n: "Ostrovní město se čtyřmi zvonicemi, benátské od léta Páně 1409, kdy Benátky koupily Dalmácii od krále Ladislava Neapolského.",
  },
  Pag: {
    t: "Benátské město solných polí",
    n: "Ostrov solných polí, o něž se Pažané dlouho přeli se Zadarem. Od léta Páně 1443 se staví nové město Pag podle benátského rozvrhu, neboť staré bylo zpustlé.",
  },
  Mantova: {
    t: "Sídlo markraběte",
    n: "Sídlo markraběte Ludovica Gonzagy uprostřed jezer, jež tvoří řeka Mincio. Dvůr je skvělý a učený; markraběte kdysi vychovával slavný učitel Vittorino da Feltre.",
  },
  Ferrara: {
    t: "Sídlo vévody",
    n: "Sídlo Borsa d'Este, markraběte ferrarského, jejž císař Fridrich léta Páně 1452 učinil vévodou modenským a reggijským. Ferraru drží v léno od papeže a dvůr jeho je pověstný nádherou, malíři a turnaji.",
  },
  Modena: {
    t: "Město vévody",
    n: "Město na Emiliánské cestě, říšské léno rodu d'Este, od léta Páně 1452 vévodství Borsovo.",
  },
  Bologna: {
    t: "Papežské město",
    n: "Velké město s učením práv, nejstarším v křesťanstvu, a s mnoha věžemi. Patří papeži, ale vládne v něm rod Bentivogliů v čele se Santem Bentivogliem.",
  },
  Cremona: {
    t: "Milánské město",
    n: "Město na Pádu, věno Bianky Marie Viscontiové, jež se zde léta Páně 1441 vdala za kondotiéra Francesca Sforzu; ten je nyní vévodou milánským.",
  },
  Parma: {
    t: "Milánské město",
    n: "Město Emilie, jež se po smrti posledního Viscontiho krátce spravovalo samo a léta Páně 1449 se poddalo Francescu Sforzovi.",
  },
  Piacenza: {
    t: "Milánské město",
    n: "Město na Pádu, které léta Páně 1447 dobyl a vyplenil Francesco Sforza, když ještě sloužil Milánské republice.",
  },
  Innsbruck: {
    t: "Sídelní město vévody",
    n: "Sídlo vévody Zikmunda Tyrolského při mostě přes Inn, od něhož má město jméno. Vévodové se sem přestěhovali ze starého hradu Tirolu u Meranu; tudy jde cesta z Bavor přes Brenner do Itálie.",
  },
  Hall: {
    t: "Solné město",
    n: "Solné město na Innu; solivar v Hallu vaří sůl z hor údolí Halltal a z ní plyne vévodovi největší důchod. Odtud se po Innu plaví sůl a zboží až k Dunaji.",
  },
  Švác: {
    t: "Horní městečko",
    n: "Horní městečko na Innu, kde se v posledních letech kope stříbro a měď v hojnosti nebývalé. Sem se stahují havíři z celých Alp a kupci z Augšpurku jim půjčují na rudu.",
  },
  Sterzing: {
    t: "Tyrolské městečko",
    n: "Městečko pod Brennerem, kde kupci zastavují před výstupem do průsmyku. V horách nad ním se kope stříbro a olovo.",
  },
  Bolzano: {
    t: "Tyrolské trhové město",
    n: "Trhové město na soutoku Eisacku a Talferu, kde se konají slavné jarmarky; na nich se setkávají kupci vlašští s německými. Kolem města rostou vinice, jejichž víno se vozí do Bavor a Švábska.",
  },
  Meran: {
    t: "Tyrolské město",
    n: "Staré hlavní město hrabství pod hradem Tirolem, od něhož má země jméno. Vévodové se odtud přestěhovali do Innsbrucku, ale mincovna a stará sláva zůstaly.",
  },
  Brixen: {
    t: "Biskupské město",
    n: "Biskupské město v údolí Eisacku. Biskupem je kardinál Mikuláš Kusánský, učenec, jehož papež dosadil proti vůli kapituly; s vévodou Zikmundem se ustavičně přou o práva kostela a o kláštery, jež chce kardinál reformovat.",
  },
  Bruneck: {
    t: "Městečko biskupů brixenských",
    n: "Městečko biskupů brixenských v Pusterském údolí s biskupským hradem; tudy jde cesta z Brixenu na Drávu do Korutan.",
  },
  Buchenstein: {
    t: "Hrad biskupů brixenských",
    n: "Hrádek biskupů brixenských v horách nad údolím Cordevole, nedaleko železných dolů. Kardinál Kusánský se sem loni v létě uchýlil, když se v Brixenu necítil bezpečen.",
  },
  Trident: {
    t: "Biskupské město",
    n: "Biskupské město na Adiži, na rozhraní vlašské a německé řeči. Biskup Jiří Hack vládne knížectví, nad nímž drží ochrannou ruku hrabata tyrolská; obec se proti biskupům nejednou bouřila.",
  },
  Bled: {
    t: "Hrad biskupů brixenských",
    n: "Hrad na skále nad jezerem v Horním Kraňsku, který od časů císaře Jindřicha Svatého patří biskupům brixenským. Na ostrůvku uprostřed jezera stojí kostel Panny Marie.",
  },
  Friesach: {
    t: "Město arcibiskupů salcburských",
    n: "Nejstarší město Korutan, sevřené hradbami a vodním příkopem; na hradním vrchu sídlí vicedom arcibiskupů salcburských, kteří odtud spravují své korutanské statky.",
  },
  Gmünd: {
    t: "Městečko arcibiskupů salcburských",
    n: "Městečko pod Katschberským sedlem na cestě ze Salcburku přes Taury do Korutan; patří arcibiskupům salcburským.",
  },
  Ptuj: {
    t: "Město arcibiskupů salcburských",
    n: "Prastaré město na Drávě (římská Poetovio), jež patří arcibiskupům salcburským. Páni z Ptuje, kteří sídlili na hradě nad městem, vymřeli před dvaceti lety. Kolem rostou vinice a přes Drávu se tu převáží.",
  },
  Villach: {
    t: "Město biskupů bamberských",
    n: "Město biskupů bamberských na Drávě, kde se Kanálská cesta k Benátkám sbíhá s cestami do Salcburku a Kraňska. Kupci tu skládají železo, víno a koření.",
  },
  Wolfsberg: {
    t: "Město biskupů bamberských",
    n: "Hlavní městečko bamberských statků v údolí Lavantu s biskupským hradem; v okolních horách se kope železo.",
  },
  Gurk: {
    t: "Sídlo kapituly gurské",
    n: "Tichá trhová ves s mohutným románským dómem, v němž odpočívá svatá Hema, zakladatelka biskupství. Biskup gurský sídlí na blízkém hradě Strassburgu.",
  },
  Lublaň: {
    t: "Hlavní město Kraňska",
    n: "Hlavní město Kraňska pod hradem nad Lublanicí. Léta Páně 1442 ji marně obléhali hrabě Oldřich Celjský s vévodou Albrechtem; obránci je odrazili a vzali jim tábor. Venkov mluví slovansky, v radě sedí Němci.",
  },
  Kranj: {
    t: "Kraňské město",
    n: "Starobylé město na ostrohu nad soutokem Sávy a Kokry, střed Horního Kraňska a trh pro horské vsi.",
  },
  Kamnik: {
    t: "Kraňské město",
    n: "Městečko pod Kamnickými Alpami, kdysi sídlo pánů z Andechsu, markrabat kraňských. Leží na cestě z Lublaně do Štýrska.",
  },
  "Škofja Loka": {
    t: "Město biskupů frisinských",
    n: "Městečko a hrad biskupů frisinských, kteří tu od starodávna drží rozsáhlé panství. V údolí Selce se taví železo a kovají hřebíky.",
  },
  "Novo Mesto": {
    t: "Kraňské město",
    n: "Město na Krce, jež založil vévoda Rudolf Rakouský léta Páně 1365 a nazval je po sobě. Odtud vede cesta k chorvatskému pomezí a k Záhřebu.",
  },
  Metlika: {
    t: "Pomezní městečko",
    n: "Pomezní městečko Bílé Krajiny nad Kupou. Za řekou je Chorvatsko, kam vpadají turečtí nájezdníci, a měšťané proto hledí na brody s obavou.",
  },
  Klagenfurt: {
    t: "Korutanské město",
    n: "Mladé město v blatech u Vrbského jezera; na jeho pečeti je saň s věží. Podezřelého zloděje tu nejprve oběsí a teprve třetí den soudí: je-li vinen, visí, dokud neshnije, je-li nevinen, pohřbí ho obec poctivě a se zádušní mší.",
  },
  "Svatý Vít": {
    t: "Hlavní město Korutan",
    n: "Hlavní město Korutan na řece Glan, sídlo vévodské správy. Nedaleko leží Gospa Sveta a pole s knížecím kamenem, na němž sedlák slovanskou otázkou nastoluje vévodu.",
  },
  Maribor: {
    t: "Štýrské město",
    n: "Štýrské město s hradem na Drávě, kudy jde cesta ze Štýrského Hradce k Celji a do Kraňska. Na pahorcích kolem rostou vinice.",
  },
  Radkersburg: {
    t: "Pohraniční město",
    n: "Pohraniční město na ostrově na Muře, kde se Štýrsko stýká s Uhrami; trhuje se tu vínem a dobytkem hnaným z Uher.",
  },
  Judenburg: {
    t: "Štýrské kupecké město",
    n: "Kupecké město na horní Muře, jehož kupci obchodují se štýrským železem a vozí je do Benátek; leží na Benátské cestě.",
  },
  "Bruck nad Murou": {
    t: "Štýrské město",
    n: "Město na soutoku Mury a Mürzy, kudy jde Benátská cesta z Vídně; léta Páně 1452 se tu štýrští páni radili s císařem, jak čelit povstání Rakušanů.",
  },
  Celje: {
    t: "Město celjského dědictví",
    n: "Starobylé město na Savinji (římská Celeia), sídlo hrabat celjských, jejichž rod vyhasl předloni, když v Bělehradě zavraždili hraběte Oldřicha. O dědictví se hlásí dvacet čtyři uchazeči; stavové svěřili zemi císaři, který město drží.",
  },
  Pordenone: {
    t: "Rakouská enkláva",
    n: "Město, jež patří rodu rakouskému od starodávna, uprostřed benátského Furlánska; Benátky je obklopily ze všech stran, ale nedobyly.",
  },
  Terst: {
    t: "Přístavní město rodu rakouského",
    n: "Přístavní město, jež se léta Páně 1382 poddalo vévodům rakouským, aby uniklo Benátkám. Biskupem tu býval Eneáš Silvius, nyní kardinál sienský. S Benátkami se Terst ustavičně přou o obchod se solí a vínem a o cesty do Kraňska.",
  },
  Rijeka: {
    t: "Přístavní městečko pánů z Walsee",
    n: "Přístavní městečko u ústí Rječiny, jemuž Němci říkají Svatý Vít na Rječině; drží je páni z Walsee. Kupci odtud vozí kůže, dříví a obilí přes moře do Itálie.",
  },
  "Horní hrad celjský": {
    t: "Hrad celjského dědictví",
    n: "Hrad nad Savinjou, pro polohu i lidský um nedobytný. Tu noc, kdy Vitovec s osmi sty jezdci vjel do Celje, přespal v něm císař Fridrich proti svému zvyku, a tak unikl zajetí.",
  },
  Postojna: {
    t: "Zeměpanský hrad",
    n: "Hrad rodu rakouského nad branou mezi Lublaní a mořem. Pod ním se otvírá veliká jeskyně, do níž lidé odpradávna vcházejí s pochodněmi a píší na stěny svá jména.",
  },
  Predjama: {
    t: "Hrad v jeskyni",
    n: "Hrad vestavěný do ústí jeskyně v příkré skále nad propastí. Drží jej rytíři, kteří se po něm píší, a tajnými chodbami prý lze vyjít daleko v lese.",
  },
  Duino: {
    t: "Hrad pánů z Walsee",
    n: "Hrad na útesu nad mořem u ústí Timavy, kterou staří zvali matkou moře. Drží jej páni z Walsee.",
  },
  Pazin: {
    t: "Hrad rakouského hrabství",
    n: "Hrad nad propastí, do níž se vlévá říčka a mizí pod zemí; střed rakouského hrabství v Istrii, obklopeného benátským pobřežím.",
  },
  Gorice: {
    t: "Sídlo hrabat gorických",
    n: "Hrad a město nad Sočou, sídlo hrabat gorických. Vládne hrabě Jan s bratrem Linhartem; rod je zadlužený a podle staré smlouvy se hlásí k dědictví hrabat celjských.",
  },
  Lienz: {
    t: "Město hrabat gorických",
    n: "Městečko na Drávě pod hradem Bruck, druhé sídlo hrabat gorických, jimž patří i Pusterské údolí až k Tyrolsku.",
  },
  Krk: {
    t: "Ostrovní město Frankopanů",
    n: "Ostrovní město, kolébka hrabat krčských, jež se nyní píší Frankopani. Ostrov drží hrabě Jan z krčské větve rodu; kněží tu slouží mši slovansky a píší hlaholicí.",
  },
  Senj: {
    t: "Přístav Frankopanů",
    n: "Přístav pod Velebitem, sídlo biskupa a střed frankopanských držav na moři. Ze Senje vede cesta přes hory k Modruši a do Záhřebu; v zimě sem z hor duje prudký vítr bura.",
  },
  Modruš: {
    t: "Sídlo Frankopanů",
    n: "Hrad Tržan nad městečkem Modruší, hlavní sídlo hraběte Štěpána Frankopana Modrušského.",
  },
  Ozalj: {
    t: "Hrad Frankopanů",
    n: "Hrad na skále nad Kupou, frankopanský, na cestě ze Záhřebu k moři.",
  },
  Trsat: {
    t: "Hrad Frankopanů",
    n: "Hrad nad Rijekou na hranici frankopanských a walseeských držav. Pod ním založil hrabě Martin Frankopan léta Páně 1453 klášter františkánů u poutního kostela Panny Marie.",
  },
  Brinje: {
    t: "Hrad Frankopanů",
    n: "Hrad Sokolac v Brinji, frankopanský, s pěknou kaplí; hlídá cestu ze Senje do vnitrozemí a k Modruši.",
  },
  Záhřeb: {
    t: "Svobodné královské město a biskupské sídlo",
    n: "Dvě města na dvou pahorcích: svobodné královské město Gradec se zlatou bulou krále Bély a biskupský Kaptol s chrámem. Obě obce se o hranice a mlýny ustavičně přou, nejednou i zbraní.",
  },
  Varaždín: {
    t: "Svobodné královské město",
    n: "Svobodné královské město na Drávě (od léta Páně 1209). Hrad nad městem drželi hrabata celjská a nyní patří k jejich sporné pozůstalosti.",
  },
  Křižovce: {
    t: "Svobodné královské město",
    n: "Město, kde se nejednou schází slavonský sněm. Léta Páně 1397 tu na „krvavém sněmu“ zavraždili bána Štěpána Lackoviće a jeho druhy.",
  },
  Koprivnica: {
    t: "Svobodné královské město",
    n: "Svobodné královské město v Podrávině, trh na cestě z Uher do Záhřebu.",
  },
  Požega: {
    t: "Slavonské město",
    n: "Město ve Slavonii s hradem a kapitulou, která je hodnověrným místem: sepisují a ověřují se tu listiny pro celý kraj.",
  },
  Bihać: {
    t: "Svobodné královské město",
    n: "Město na ostrově řeky Uny, na samém pomezí Chorvatska a Bosny, svobodné od časů krále Bély. Turecké nájezdy sem dolehnou dříve než jinam.",
  },
  Bělehrad: {
    t: "Pevnost uherské koruny",
    n: "Pevnost na soutoku Sávy s Dunajem, klíč Uher. Léta Páně 1456 ji Jan Hunyadi a křižáci kazatele Kapistrána ubránili proti sultánu Mehmedovi; oba hrdinové téhož léta zemřeli na mor. V listopadu téhož roku zde Uhři zavraždili hraběte Oldřicha Celjského.",
  },
  Smederevo: {
    t: "Pevnost despotů srbských",
    n: "Mocná pevnost srbských despotů na Dunaji s mnoha věžemi. Despota Lazar zemřel letos v lednu a o dědictví se přou jeho vdova Helena, slepý bratr Řehoř s tureckou pomocí i Kantakuzina, vdova po Celjském.",
  },
  Temešvár: {
    t: "Hrad uherské koruny",
    n: "Hrad a město v Banátu, kde kdysi rád pobýval král Karel Robert. Z Temešváru vedl Jan Hunyadi jako hrabě temešský boje s Turky a hrad dosud hlídá Banát před jejich nájezdy.",
  },
  Medvedgrad: {
    t: "Hrad nad Záhřebem",
    n: "Hrad na zalesněné hoře nad Záhřebem, který postavili záhřebští biskupové po vpádu Tatarů; z jeho hradeb je vidět celé údolí Sávy.",
  },
  Čakovec: {
    t: "Hrad celjského dědictví",
    n: "Hrad v Mezimuří mezi Murou a Drávou. S celým Mezimuřím jej drželi hrabata celjská a nyní patří k jejich dědictví, o něž se přou císař, Uhři i bán Vitovec.",
  },
  Krapina: {
    t: "Hrad celjského dědictví",
    n: "Hrad nad městečkem v chorvatském Záhoří, střed celjských statků v kraji. Po smrti hraběte Oldřicha jej s většinou celjských hradů ve Slavonii ovládl bán Jan Vitovec.",
  },
  "Stoličný Bělehrad": {
    t: "Korunovační město",
    n: "Královské město s bazilikou Panny Marie, kde se korunují a pohřbívají uherští králové a odpočívá svatý Štěpán. Matyáš zatím korunován není, neboť svatoštěpánskou korunu drží císař Fridrich.",
  },
  Vesprém: {
    t: "Biskupské město",
    n: "Město královen uherských na skalnatém návrší; biskup vesprémský má právo korunovat královnu.",
  },
  Pětikostelí: {
    t: "Biskupské město",
    n: "Biskupské město na úpatí Mečeku. Král Ludvík Veliký tu založil první učení v Uhrách, jež však zaniklo. Léta Páně 1408 zde král Zikmund s královnou Barborou Celjskou a dvaadvaceti barony založil Dračí řád.",
  },
  Kaloča: {
    t: "Arcibiskupské město",
    n: "Sídlo arcibiskupa kaločského, druhého metropolity Uher, uprostřed mokřin u Dunaje.",
  },
  Segedín: {
    t: "Tržní město",
    n: "Velké tržní město na Tise, kam se po Moruši plaví sůl ze Sedmihradska a kde se prodávají ryby a dobytek. Léta Páně 1444 zde král Vladislav přísahal mír s Turky, jejž pak před Varnou zrušil.",
  },
  Kysek: {
    t: "Pohraniční město",
    n: "Pohraniční město s hradem na západě Uher, které drží císař Fridrich; v okolí trestal léta Páně 1445 lupiče, kterých dal osmdesát pověsit.",
  },
  Kaniže: {
    t: "Sídlo pánů Kanižských",
    n: "Hrad a městečko v bažinách Zaly, sídlo mocných pánů Kanižských, kteří zde hlídají cesty k Drávě.",
  },
  Osijek: {
    t: "Panské město",
    n: "Město na Drávě nedaleko jejího ústí do Dunaje, kde se převáží přes řeku na cestě z Budína do Bělehradu.",
  },
  /* ---- MÍSTA: Slezsko a Lužice (2026-10-28) ---- */
  Namyslav: {
    t: "Korunní město",
    n: "Město knížectví vratislavského, jež náleží přímo Koruně, na cestě z Vratislavi do Polska. Léta Páně 1348 zde císař Karel učinil mír s králem polským Kazimírem.",
  },
  "Środa Śląska": {
    t: "Korunní město",
    n: "Staré město knížectví vratislavského na Vysoké cestě mezi Vratislaví a Lehnicí. Jeho právo, řečené středské, přijala za své mnohá města slezská i polská.",
  },
  "Lwówek Śląski": {
    t: "Korunní město",
    n: "Město knížectví javorského nad Bobrem, jež náleží přímo Koruně. Právo německé dostalo léta Páně 1217 mezi prvními ve Slezsku; v okolí se dobývalo zlato i železo.",
  },
  Bolesławiec: {
    t: "Korunní město",
    n: "Město knížectví javorského na Bobru, jež náleží přímo Koruně, při Vysoké cestě ze Zhořelce do Lehnice a Vratislavi.",
  },
  Złotoryja: {
    t: "Horní město",
    n: "Nejstarší město slezské s právem německým, jež mu dal kníže Jindřich Bradatý léta Páně 1211, aby sem přilákal havíře k dolům na zlato; podle zlata má i jméno. Náleží knížectví lehnickému.",
  },
  Chojnov: {
    t: "Knížecí město",
    n: "Město knížectví lehnického na Vysoké cestě mezi Lehnicí a Bolesławcem. Náleží mladému knížeti Fridrichovi, za něhož vládne matka jeho Hedvika.",
  },
  Rychbach: {t: "Korunní město", n: "Město knížectví svídnického pod Sovími horami, jež náleží přímo Koruně, na cestě ze Svídnice ke Kladsku."},
  Němčí: {
    t: "Knížecí město",
    n: "Prastaré hradiště nad Slezou, jež léta Páně 1017 odolalo obležení císaře Jindřicha II. Nyní náleží mladému knížeti Fridrichovi Lehnickému.",
  },
  Stínava: {
    t: "Rozdělené město",
    n: "Město s přechodem přes Odru mezi Hlohovem a Vratislaví. Jest rozděleno napůl: jednu polovici drží kníže olešnický Konrád X. Bílý, druhou kníže Vladislav z Těšínských.",
  },
  Wołów: {t: "Knížecí město", n: "Město knížat olešnických v rovině nedaleko Odry, na sever od Vratislavi."},
  Milicz: {t: "Hrad a město", n: "Hrad a město knížat olešnických v kraji rybníků při řece Baryči, na pomezí Velkopolska."},
  Syców: {t: "Knížecí město", n: "Pomezní město knížectví olešnického na cestě do Velkopolska."},
  "Krosno nad Odrou": {
    t: "Knížecí město",
    n: "Hrad a město při ústí Bobru do Odry, odkud vedou cesty do Braniborska a Nové marky. Drží je kníže Jindřich IX. Starší z Piastovců hlohovsko-žaháňských.",
  },
  Kožuchov: {
    t: "Knížecí sídlo",
    n: "Sídlo knížete Jindřicha IX. Staršího, hlavy Piastovců hlohovsko-žaháňských, jenž drží i polovici Hlohova a Krosno. Dcera jeho Anna jest chotí pana Jana z Rožmberka.",
  },
  Převoz: {
    t: "Knížecí městečko",
    n: "Městečko na Nise na pomezí Lužice, jež drží kníže Jan II., bratr knížete Baltazara Žaháňského, s nímž se přou o Žaháň.",
  },
  "Zielona Góra": {t: "Knížecí město", n: "Město knížectví hlohovského obklopené vinicemi, živé soukenictvím a vínem."},
  Szprotawa: {t: "Knížecí město", n: "Město knížectví hlohovského na soutoku Bobru a Sprotavy, mezi Žahání a Kožuchovem."},
  Świebodzin: {t: "Pomezní město", n: "Pomezní město knížectví hlohovského proti Braniborsku a Velkopolsku."},
  Střelce: {t: "Knížecí město", n: "Hrad a město, jež od léta Páně 1450 drží kníže Bolek V. Opolský."},
  Prudník: {t: "Knížecí město", n: "Město knížete Bolka V. Opolského na pomezí moravském, nedaleko jeho sídla v Horním Hlohově."},
  Němodlín: {t: "Knížecí město", n: "Hrad a město mezi Nisou a Opolím, jež od léta Páně 1450 drží kníže Bolek V. Opolský."},
  Olesno: {t: "Knížecí město", n: "Pomezní město proti Polsku, jež od léta Páně 1455 drží kníže Bolek V. Opolský."},
  Kluczbork: {
    t: "Knížecí město",
    n: "Město, jež založili křižovníci s červenou hvězdou, odkud má německé jméno Křížový hrad. Od léta Páně 1451 je drží kníže opolský Mikuláš I.",
  },
  Rybník: {
    t: "Knížecí město",
    n: "Město Přemyslovců krnovských; za nezletilé bratry Jana IV. a Václava III. vládne poručnice jejich, macecha Barbora.",
  },
  Žory: {t: "Knížecí město", n: "Malé pomezní město obehnané zdí, jež spolu s Rybníkem náleží nezletilým Přemyslovcům krnovským."},
  Pština: {
    t: "Vdovský úděl",
    n: "Hrad a město mezi lesy na polském pomezí, jež drží jako vdovský úděl kněžna Barbora Rokemberková, macecha a poručnice mladých knížat krnovských.",
  },
  Bílsko: {t: "Knížecí sídlo", n: "Sídlo knížete Václava I., jenž nese titul knížete těšínského, pod Beskydami na pomezí polském."},
  Fryštát: {t: "Knížecí město", n: "Město knížectví těšínského na Olši, na cestě z Těšína k Ratiboři."},
  Frýdek: {t: "Knížecí město", n: "Město knížectví těšínského nad Ostravicí, jež tu dělí Slezsko od Moravy."},
  Jablunkov: {t: "Pomezní městečko", n: "Městečko knížectví těšínského pod průsmykem, jímž vede cesta z Těšína přes hory do Uher."},
  Bruntál: {
    t: "Horní město",
    n: "Horní město v horách, jemuž již léta Páně 1213 dáno právo německé, aby sem přilákalo havíře. Náleží nezletilým Přemyslovcům krnovským.",
  },
  "Zlaté Hory": {t: "Horní město", n: "Horní městečko v horách na pomezí knížectví niského, kde se odedávna rýžuje a kope zlato."},
  Frývaldov: {t: "Biskupské městečko", n: "Horské městečko biskupů vratislavských na cestě přes hory k Moravě."},
  Grodków: {
    t: "Biskupské město",
    n: "Město, jež léta Páně 1344 koupil biskup vratislavský Přeclav z Pohořelé od knížete břežského; od té doby náleží s Nisou biskupům.",
  },
  Paczków: {t: "Biskupské město", n: "Pevné město biskupů vratislavských na pomezí kladském, obehnané mocnou zdí s mnoha věžemi."},
  "Bystřice Kladská": {t: "Město pana Jiřího", n: "Město hrabství kladského nad Nisou Kladskou, jež náleží panu Jiřímu z Poděbrad."},
  "Nowa Ruda": {t: "Panské městečko", n: "Městečko v severním cípu hrabství kladského pod Sovími horami, jež náleží ke Kladsku pana Jiřího."},
  "Zlatý Stok": {
    t: "Horní město",
    n: "Horní městečko na pomezí Kladska a Minsterberska, kde se odedávna dobývá zlato. Horní právo zdejší náleží ke knížectví minsterberskému, jež drží pan Jiří.",
  },
  Gryf: {t: "Rytířský hrad", n: "Hrad na vrchu nad Kvisou na pomezí Lužice, jejž drží rytíři Schoffové, páni na Chojniku."},
  Kamieniec: {t: "Klášter cisterciáků", n: "Bohaté opatství cisterciáků nad Nisou Kladskou, nedaleko Frankenštejna."},
  Henryków: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků, jež nese jméno knížete Jindřicha Bradatého, za něhož bylo založeno; mniši vůkol klučili hraniční les a osazovali jej vsemi.",
  },
  Rudy: {t: "Klášter cisterciáků", n: "Opatství cisterciáků v lesích knížectví ratibořského."},
  Marienthal: {
    t: "Klášter cisterciaček",
    n: "Klášter panen cisterciaček na Nise mezi Žitavou a Zhořelcem, jejž založila královna Kunhuta, choť krále Václava I. Jest velikým hospodářem v kraji.",
  },
  Marienstern: {
    t: "Klášter cisterciaček",
    n: "Klášter panen cisterciaček mezi Budyšínem a Kamencem, jejž založili páni z Kamence; okolní vsi lužických Srbů mu poddány.",
  },
  Neuzelle: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků nad Odrou, založené léta 1268 markrabětem Jindřichem Jasným u vsi Starzedel a okolo léta 1290 přenesené na dnešní místo. Léta 1411 muselo pro tíseň a chudobu prodat město Fürstenberg. Praví se, že husité léta 1429 pobili celý konvent; opat Mikuláš z Bohmsdorfu, který klášter řídí od roku asi 1431, dostavuje poničená křídla. Opat sedá na sněmu dolnolužickém v čele stavu duchovního.",
  },
  Dobrilugk: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků, nejstarší v Lužici, založené okolo léta Páně 1165 markrabětem Dietrichem z Landsbergu za hrobku rodu; první mniši přišli z durynského kláštera Volkenrodu. Leží na západním pomezí Dolní Lužice proti Sasku; po smlouvě zerbstské se opat podrobil kurfiřtovi braniborskému. Sedá s opatem z Neuzelle na sněmu dolnolužickém.",
  },
  Hoyerswerda: {
    t: "Pevný hrad",
    n: "Hrad a městečko na Černém Halštrově na severním pomezí Horní Lužice, jeden z nejpevnějších hradů v zemi.",
  },
  Mužakov: {t: "Panský hrad", n: "Hrad a městečko na Nise v kraji borů a vřesovišť na pomezí Horní a Dolní Lužice."},
  Forst: {t: "Město pánů z Bibrštejna", n: "Město na Nise v Dolní Lužici, jež náleží pánům z Bibrštejna, pánům na Žarech."},
  Calau: {
    t: "Dolnolužické město",
    n: "Malé město Dolní Lužice. Tu zemi Koruny české drží od léta Páně 1448 v zástavě kurfiřt braniborský Fridrich II.",
  },
  Spremberg: {
    t: "Dolnolužické město",
    n: "Hrad a město na Sprévě na jižním pomezí Dolní Lužice, nedaleko Chotěbuze, kterou drží kurfiřt braniborský.",
  },
  Sommerfeld: {
    t: "Dolnolužické město",
    n: "Město na východě Dolní Lužice mezi Gubenem a Žarami. Tu zemi Koruny české drží od léta Páně 1448 v zástavě kurfiřt braniborský.",
  },
  /* ---- MÍSTA: Čechy a Morava (2026-10-28) ---- */
  Soběslav: {
    t: "Město pánů z Rožmberka",
    n: "Město s hradem nad Lužnicí, jež náleží pánům z Rožmberka. Na cestě z Krumlova do Prahy se páni zastavují na zdejším hradě. Soukeníci soběslavští za válek zbohatli a město roste.",
  },
  "Lomnice nad Lužnicí": {
    t: "Město pánů z Rožmberka",
    n: "Městečko s hradem nad Lužnicí v bažinatém kraji. V září léta Páně 1420 je dobyl Žižka a velel v něm pan Jan Roháč z Dubé; páni z Rožmberka je léta 1435 marně obléhali a získali je teprve asi o deset let později.",
  },
  "Trhové Sviny": {
    t: "Městečko pánů z Rožmberka",
    n: "Neohrazené tržní městečko pod hrádkem, na rušné cestě jihovýchodně od Budějovic. Náleží pánům z Rožmberka.",
  },
  Velešín: {
    t: "Hrad pánů z Rožmberka",
    n: "Hrad na ostrohu nad Malší, jejž kdysi založil král; má starou kapli a okrouhlou věž. Náleží pánům z Rožmberka a v létech čtyřicátých na něm dožila vdova paní Perchta z Kravař.",
  },
  Sedlčany: {
    t: "Městečko pánů z Rožmberka",
    n: "Městečko na cestě z jižních Čech do Prahy, kde mají páni z Rožmberka dům a nocují, když jedou ke dvoru.",
  },
  Choustník: {
    t: "Hrad pánů z Rožmberka",
    n: "Hrad na zalesněném vrchu na východ od Tábora. Za válek s tábority patřil k pevným hradům pana Oldřicha z Rožmberka.",
  },
  Příběnice: {
    t: "Pobořený hrad Rožmberků",
    n: "Hrad na skále nad Lužnicí nedaleko Tábora, jejž páni z Rožmberka měli za nedobytný. V listopadu léta Páně 1420 jej táboři i se sousedními Příběničkami dobyli a biskupa Heřmana, jenž se sem uchýlil, utopili v Lužnici. Páni z Rožmberka jej dostali zpět pobořený s tím, že jej nesmějí obnoviti.",
  },
  Roudnice: {
    t: "Hrad pánů ze Šternberka",
    n: "Mocný hrad a město nad Labem, někdy sídlo arcibiskupů pražských. Biskup Jan z Dražic tu dal postaviti kamenný most a klášter kanovníků augustiniánů; arcibiskup Konrád z Vechty, jenž přistoupil ke kalichu, zde sídlil a světil kněze pod obojí. Za slabosti strany římské nabyli hrad levně z arcibiskupského zboží páni ze Šternberka.",
  },
  Chvatěruby: {
    t: "Hrad pánů z Hazmburka",
    n: "Hrad na skále nad Vltavou severně od Prahy, jejž drží pan Oldřich Zajíc z Hazmburka. Za veliké povodně léta Páně 1432 viděli odtud plouti po řece pražské dříví, mlýny, seno i voly.",
  },
  Hostinné: {
    t: "Městečko pánů z Hazmburka",
    n: "Městečko nad Labem v podhůří Krkonoš. Drží je pan Oldřich Zajíc z Hazmburka, jenž je koupil od své manželky paní Anny z Častolovic a jejích sester.",
  },
  Krašov: {
    t: "Hrad pánů z Kolovrat",
    n: "Hrad nad Berounkou na Plzeňsku, jejž drží páni z Kolovrat. Pan Hanuš z Kolovrat, otec nynějšího pána, tu v letech 1426 a 1427 věznil norimberského kupce Hanse Imhoffa pro podezření, že obchoduje s kacíři, přes přímluvy Norimberka i krále Zikmunda.",
  },
  Drnholec: {t: "Hrad pánů z Lichtenštejna", n: "Hrad a městečko nad Dyjí jižně od Brna, kteréž drží páni z Lichtenštejna."},
  Hostěradice: {
    t: "Městečko pánů z Lipé",
    n: "Ohrazené tržní městečko na jihu Moravy. Léta Páně 1447 je dostala věnem paní Eliška z Cimburka, manželka maršálka Pertolda z Lipé, a léta 1455 se vrátilo k panu Jindřichovi z Lipé.",
  },
  Templštejn: {
    t: "Hrad pánů z Lipé",
    n: "Hrad na ostrohu nad řekou Jihlavou, o němž se praví, že jej založili rytíři templáři. Páni z Lipé tu od léta Páně 1379 po půl století drželi svůj manský soud; od té doby, co mají Moravský Krumlov, ustupuje hrad do pozadí.",
  },
  Jemnice: {
    t: "Zastavené královské město",
    n: "Královské město na západní Moravě, jež drží v zástavě bratři z Lichtenburka a na Cornštejně; král Ladislav jim zástavu léta Páně 1457 potvrdil. Měšťané si léta 1453 draze koupili potvrzení svobod a doufali, že budou vyplaceni, a pan Jiří se o to přičiňoval – odtud zlá krev mezi ním a Cornštejnskými.",
  },
  Malenovice: {
    t: "Hrad pánů z Lichtenburka",
    n: "Hrad u Zlína, jejž drží bratři z Lichtenburka a na Cornštejně po své matce paní Anně ze Šumvaldu. Před léty jej oblehl a dobyl Smil z Moravan, po smlouvě jej však vrátil.",
  },
  Svojanov: {
    t: "Zastavený královský hrad",
    n: "Královský hrad nad údolím Křetínky na pomezí českomoravském, kterýž od léta Páně 1420 drží v zástavě páni z Boskovic. Císař Zikmund jej léta 1437 připsal věnem císařovně Barboře a nařídil držitele vyplatit, ale nestalo se tak. Sedí tu pan Ješek Svojanovský z Boskovic, kališník a přítel pana Jiřího, muž neklidný a prudký, jenž léta 1449 přepadl klášter v Rajhradě.",
  },
  "Vítkův Kámen": {
    t: "Rožmberský hrad v zástavě",
    n: "Osamělá obytná věž na nejvyšším návrší nad Vltavou při rakouské hranici, spíše znamení panství nežli pevnost. Páni z Rožmberka ji léta Páně 1427 zastavili pánům z Wallsee a dosud ji nevyplatili.",
  },
  Zvířetice: {
    t: "Hrad pánů ze Zvířetic",
    n: "Hrad nad Jizerou u Bakova, rodové sídlo pánů ze Zvířetic, mladší větve pánů z Lemberka. Drží jej pan Heřman ze Zvířetic.",
  },
  Valečov: {
    t: "Skalní hrad",
    n: "Hrad vytesaný ve skalách v lesích nad Kněžmostem u Hradiště nad Jizerou. Nedaleko leží Kněžmost, po němž se píše pan Vaněk Valečovský, podkomoří královský a věrný muž pana Jiřího.",
  },
  Zlenice: {
    t: "Hrad nad Sázavou",
    n: "Hrad na ostrohu při soutoku Sázavy s Hrusickým potokem. Psal se po něm pan Ondřej z Dubé, nejvyšší sudí krále Karla, jenž z mnohaleté praxe sepsal výklad na právo země české.",
  },
  Přimda: {
    t: "Pohraniční hrad",
    n: "Starobylý kamenný hrad nad cestou z Plzně přes les do Falce a k Norimberku, jeden z nejstarších kamenných hradů v zemi. Před bouřemi husitskými tu purkrabí Bohuš ze Štědré, řečený Tista, vedl tlupu lapků, kterou podkomoří Jan z Lestkova o masopustu léta Páně 1416 pochytal.",
  },
  Vranov: {
    t: "Pohraniční hrad",
    n: "Hrad na skále nad Dyjí při rakouském pomezí. Za válek husitských jej dostali v zástavu páni Bítovští z Lichtenburka a jako Bítov býval základnou bojových družin, které plenily kraj na obou stranách hranice.",
  },
  Boskovice: {
    t: "Hrad pána z Kunštátu",
    n: "Hrad nad městečkem Boskovicemi, odkud pochází rod pánů z Boskovic. Nyní jej drží pan Procek z Kunštátu na Opatovicích, příbuzný a straník pana Jiřího, a podle něho se píše.",
  },
  Kvasice: {
    t: "Tvrz rytířská",
    n: "Tvrz nad Moravou u Kroměříže, kterouž drží pan Jan Kužel ze Žeravic, nejpřednější muž moravského rytířstva; v landfrýdu léta Páně 1456 stál v čele rytířů. Kvasice získal léta 1437 od sirotka, jemuž byl poručníkem jeho pán z Kravař. Syn jeho Jiří má za manželku Kunku ze Šternberka.",
  },
  Úsov: {t: "Panský hrad", n: "Hrad na severu Hané mezi Litovlí a Mohelnicí, kterýž drží bratři Karel a Václav z Vlašimi, lidé spíše strany římské."},
  Konice: {
    t: "Rytířský hrad",
    n: "Hrad a městečko na západním okraji Hané. Drží je Zdeněk a Václav ze Švábenic, jejichž rod zbohatl za válek husitských a přijal jméno i erb vymřelých pánů ze Švábenic.",
  },
  Potštát: {
    t: "Rytířský hrad",
    n: "Hrad v Oderských vrších, jejž od léta Páně 1408 drží rytíři Potštátští z Prusinovic, rod zámožný, jenž se do věcí zemských mnoho neplete.",
  },
  "Nový Světlov": {
    t: "Rytířský hrad",
    n: "Hrad v horách nad Bojkovicemi při uherském pomezí, kterýž léta Páně 1449 koupili Burian z Vlčnova a Zich z Lipiny. Pan Burian se tím zadlužil.",
  },
  Kolštejn: {
    t: "Biskupské léno",
    n: "Hrad v Jeseníkách při cestě do Kladska, jejž léta Páně 1448 získal Markvart ze Zvole. Páni ze Zvole jsou leníky biskupství olomouckého a z jejich rodu byl biskup Bohuš, jenž zemřel loni.",
  },
  Rosice: {t: "Panský hrad", n: "Hrad a městečko západně od Brna, které zdědila panna Magdalena z Rosic, katolička."},
  "Nový Hrad (Morava)": {
    t: "Panský hrad",
    n: "Hrad v lesích nad údolím Svitavy severně od Brna, kterýž drží pan Bernard z Cimburka, katolík. Na tomto hradě strávil dětství pan Ješek Svojanovský z Boskovic.",
  },
  Blansko: {t: "Panské městečko", n: "Městečko s tvrzí nad Svitavou severně od Brna, které drží Vilém z Miličína, katolík."},
  Polná: {t: "Panské město", n: "Městečko s hradem na cestě z Čáslavska k Jihlavě, hned při pomezí moravském."},
  "Český Brod": {
    t: "Město pod obojí",
    n: "Město na cestě z Prahy ke Kolínu a Kutné Hoře, kdysi zboží arcibiskupů pražských. Nedaleko odtud u Lipan léta Páně 1434 porazili páni a Pražané vojska táborů a sirotků; padl tu kněz Prokop Holý.",
  },
  Říčany: {
    t: "Hrad a městečko",
    n: "Hrad a městečko jihovýchodně od Prahy. Sem byl v lednu léta Páně 1449 propuštěn z vězení poděbradského nejvyšší purkrabí pan Menhart z Hradce a za několik dní zemřel; hned se mluvilo o jedu.",
  },
  "Mladá Vožice": {
    t: "Hrad a městečko",
    n: "Hrad a městečko pět hodin cesty od Tábora. Na Velký pátek léta Páně 1420 tu Žižka před svítáním přepadl spící královské jezdce mincmistra Mikuláše Divůčka a z ukořistěných koní počal stavěti jízdu táborskou.",
  },
  Přibyslav: {
    t: "Panské městečko",
    n: "Městečko nad Sázavou na pomezí českomoravském. Při jeho obléhání zemřel 11. dne října léta Páně 1424 slepý vojevůdce Jan Žižka z Trocnova a město potom padlo do rukou jeho vojska.",
  },
  Chomutov: {
    t: "Město pod Krušnými horami",
    n: "Město na cestě do Míšně, kdysi zboží řádu německých rytířů; jeho kupci obchodují se Saskem. 16. dne března léta Páně 1421 je dobyli Pražané se Žižkou a měšťany krutě pobili; kraj kolem leží posud zpustlý.",
  },
  Vodňany: {
    t: "Město",
    n: "Město na cestě od Písku k Prachaticím. Léta Páně 1420 přísahalo věrnost panu Oldřichovi z Rožmberka, ale v srpnu je vzal Žižka a táborští kněží tu dali zabíjeti. Léta 1450 si pan Oldřich stěžoval, že Vodňanští berou na lidech z Protivína nová mýta proti starému obyčeji.",
  },
  Ivančice: {
    t: "Královské město",
    n: "Malé královské město na soutoku Jihlavy s Oslavou a Rokytnou jihozápadně od Brna. Léta Páně 1440 pečetilo landfrýd spolu s městy královskými.",
  },
  Třebíč: {
    t: "Město pod klášterem",
    n: "Jedno z nejbohatších měst moravských, nad řekou Jihlavou pod starým klášterem benediktinů, jenž stojí nad městem jako pevnost místo hradu.",
  },
  "Veselí nad Moravou": {
    t: "Panské město",
    n: "Město s hradem na řece Moravě při cestě k uherskému pomezí, velké panství rytíře Mikuláše Veselského z Vojslavic. Pan Mikuláš pochází z Pelhřimovska a býval služebníkem pánů z Hradce; za válek přešel na Moravu a drží se strany římské.",
  },
  Strakonice: {
    t: "Sídlo velkopřevora johanitů",
    n: "Hrad nad soutokem Otavy a Volyňky, sídlo velkopřevora řádu rytířů svatého Jana v Čechách, jemuž jej odkázali páni Bavorové ze Strakonic. Léta Páně 1449 se zde páni a rytíři strany římské spolčili proti panu Jiřímu v jednotu strakonickou. Velkopřevorem býval i pan Jošt z Rožmberka, nyní biskup vratislavský.",
  },
  Osek: {
    t: "Klášter cisterciáků",
    n: "Klášter cisterciáků pod Krušnými horami a nad ním hrad Osek, jenž s Mostem a Duchcovem drží v zástavě vévodové míšenští. Tudy jezdí poselstva ze Saska do Prahy; v těchto dnech poslal pan Jiří k hradu své služebníky naproti saským poslům.",
  },
  Žďár: {
    t: "Klášter cisterciáků",
    n: "Klášter cisterciáků na pomezí českomoravském, rodový klášter pánů z Kunštátu, za válek zle poničený. Kolem léta Páně 1450 dal pan Jiří v jeho chrámu vymalovati své předky jako rytíře Kristovy.",
  },
  Vilémov: {t: "Zpustlý klášter benediktinů", n: "Starý klášter benediktinů na úpatí Železných hor, za bouří husitských zpustlý."},
  Rajhrad: {
    t: "Klášter benediktinů",
    n: "Nejstarší klášter na Moravě, probošství benediktinů na řece Svratce jižně od Brna. Léta Páně 1449, kdy jej v ochraně měli maršálek Pertold z Lipé a měšťané brněnští, jej přepadl a obsadil pan Ješek Svojanovský z Boskovic a zajal představené; když jej oblehli, utekl a lidi své nechal napospas.",
  },
  Borovany: {
    t: "Ves s budoucím klášterem",
    n: "Ves s farním kostelem na Budějovicku, kde léta Páně 1455 obdržel Petr z Lindy, zbohatlý měšťan budějovický rodem z Lince, povolení založit klášter kanovníků řádu svatého Augustina pod ochranou pánů z Rožmberka. Řeholníci zatím nepřišli.",
  },
  Kunvald: {
    t: "Ves na litickém panství",
    n: "Odlehlá ves v podhůří Orlických hor na panství litickém, které drží pan Jiří.",
  },
  /* ---- MÍSTA: Sasko, Bavory s Falcí a Franky, Rakousy (2026-10-28) ---- */
  Grimma: {
    t: "Zeměpanské město",
    n: "Wettinské město na Muldě mezi Lipskem a Míšní. Od léta Páně 1357 má latinskou školu, jednu z nejstarších v zemích míšeňských.",
  },
  Oschatz: {
    t: "Zeměpanské město",
    n: "Starobylé trhové město markrabí míšeňských mezi Labem a Muldou; latinskou školu má od léta Páně 1367.",
  },
  Leisnig: {
    t: "Zeměpanské město",
    n: "Město pod hradem Mildenštejnem nad Muldou. Purkrabí, kteří tu dříve vládli, vyhnali markrabí míšeňští léta Páně 1365 mocí; latinská škola je zde od léta 1397.",
  },
  Großenhain: {
    t: "Zeměpanské město",
    n: "Město soukeníků na Vysoké silnici, po níž jezdí kupci z Lipska do Budyšína a dále do Slezska.",
  },
  Rochlitz: {
    t: "Zeměpanský hrad a město",
    n: "Město pod mohutným hradem Wettinů na Muldě. Na vrchu nad městem se láme červený kámen, jímž se zdobí kostely široko daleko.",
  },
  Dippoldiswalde: {
    t: "Horní městečko",
    n: "Horní městečko na stezce z Drážďan přes Krušné hory do Čech, kde se od starých časů dobývá stříbro.",
  },
  Oelsnitz: {
    t: "Zeměpanské město",
    n: "Městečko na Bílém Halštrovu pod hradem Voigtsbergem v Fojtsku, které již před sto lety přešlo od fojtů k Wettinům.",
  },
  Pegau: {
    t: "Město s klášterem",
    n: "Město na Bílém Halštrovu s opatstvím benediktinů, jež léta Páně 1091 založil hrabě Wiprecht z Groitzsche.",
  },
  Zeitz: {
    t: "Sídlo biskupa naumburského",
    n: "Starobylé město na Bílém Halštrovu. Biskupství bylo založeno zde léta Páně 968 a teprve později přeneseno do Naumburku; biskupové však na hradě v Zeitzu rádi sídlí a odtud spravují své panství.",
  },
  Herzberg: {
    t: "Zeměpanské město",
    n: "Město na Černém Halštrovu v Saském vévodství okolo Vitenberka, které od vymření Askánců léta Páně 1422 drží kurfiřti z rodu Wettinů.",
  },
  Wurzen: {
    t: "Město biskupa míšeňského",
    n: "Město na Muldě s kapitulou při chrámu Panny Marie, střed světského panství biskupů míšeňských mezi Lipskem a Míšní.",
  },
  Schleiz: {
    t: "Sídlo pánů z Gery",
    n: "Městečko s hradem na horním Fojtsku, kteréž drží páni z Gery, větev starého rodu fojtů.",
  },
  Eisenach: {
    t: "Zeměpanské město",
    n: "Město lantkrabí durynských pod hradem Wartburkem, kde žila svatá Alžběta Uherská a kde se, jak se vypravuje, kdysi pěvci přeli o přednost. Nyní je drží vévoda Vilém.",
  },
  Langensalza: {
    t: "Zeměpanské město",
    n: "Durynské město vévody Viléma uprostřed úrodné krajiny, kde se pěstuje boryt na modré barvivo pro soukeníky.",
  },
  Saalfeld: {
    t: "Zeměpanské město",
    n: "Město na Sále pod Durynským lesem s opatstvím benediktinů; v okolních horách se dobývá stříbro a měď. Náleží vévodovi Vilémovi.",
  },
  Arnstadt: {
    t: "Město hrabat ze Schwarzburku",
    n: "Starobylé město pod Durynským lesem, sídlo hrabat ze Schwarzburku; obchoduje borytem jako Erfurt.",
  },
  Sondershausen: {
    t: "Město hrabat ze Schwarzburku",
    n: "Městečko s hradem na řece Wipperu na severu Durynska, jež drží hrabata ze Schwarzburku.",
  },
  Mühlhausen: {
    t: "Svobodné říšské město",
    n: "Bohaté říšské město v Durynsku, které se s Erfurtem a Nordhausenem spolčuje na ochranu silnic a svých svobod.",
  },
  Altzella: {
    t: "Klášter cisterciáků",
    n: "Cisterciácké opatství u Nossenu, založené léta Páně 1162; v jeho chrámu leží starší markrabí míšeňští, dokud se jejich hrobkou nestal dóm v Míšni.",
  },
  Reinhardsbrunn: {
    t: "Klášter benediktinů",
    n: "Opatství benediktinů pod Durynským lesem, které léta Páně 1085 založil lantkrabě Ludvík Skokan; je pohřebištěm starých lantkrabí durynských.",
  },
  Purschenstein: {
    t: "Hrad pánů ze Schönbergu",
    n: "Hrad nad řekou Flöhou na hřebeni Krušných hor, kousek od hranice české. Drží jej páni ze Schönbergu, z jejichž rodu pochází biskup míšeňský.",
  },
  Mansfeld: {
    t: "Hrad hrabat z Mansfeldu",
    n: "Hrad a městečko na východním úpatí Harcu, sídlo hrabat z Mansfeldu, která bohatnou z měděných dolů v okolí.",
  },
  Schleusingen: {
    t: "Hrad hrabat z Hennebergu",
    n: "Hrad a město na jižním svahu Durynského lesa, sídlo hrabat z Hennebergu, sousedů Wettinů i biskupů würzburských.",
  },
  Deggendorf: {
    t: "Bavorské město",
    n: "Město na Dunaji pod Bavorským lesem, kde se nakládá zboží na lodi a odkud vede stezka přes hory k Čechám.",
  },
  Vilshofen: {
    t: "Bavorské město",
    n: "Městečko vévodů bavorských při ústí Vilsu do Dunaje mezi Deggendorfem a Pasovem.",
  },
  Kelheim: {
    t: "Bavorské město",
    n: "Město při ústí Altmühlu do Dunaje, kdysi sídlo prvních vévodů z rodu Wittelsbachů; na mostě zde léta Páně 1231 zavraždili vévodu Ludvíka.",
  },
  Schärding: {
    t: "Bavorské pohraniční město",
    n: "Město s hradem na Innu, na hranici proti Rakousům; náleží vévodovi Ludvíkovi Landshutskému.",
  },
  Rosenheim: {
    t: "Bavorský trh",
    n: "Trh u mostu přes Inn na cestě z Mnichova do Salcburku, kde se překládá sůl a zboží plavené po řece.",
  },
  Dachau: {
    t: "Bavorský trh a hrad",
    n: "Trh s hradem vévodů mnichovských na řece Ampeře, nedaleko Mnichova.",
  },
  Tölz: {
    t: "Bavorský trh",
    n: "Trh na Isaře pod Alpami, odkud voraři plaví dříví a zboží po řece až k Mnichovu.",
  },
  Rattenberg: {
    t: "Bavorské pohraniční město",
    n: "Městečko s hradem v úzkém údolí Innu, nejzazší výspa vévodů landshutských proti Tyrolsku.",
  },
  Kitzbühel: {
    t: "Bavorské město",
    n: "Horské městečko v údolí pod Alpami, jež náleží vévodům landshutským spolu s Kufsteinem a Rattenberkem.",
  },
  Zwiesel: {
    t: "Bavorský trh",
    n: "Trh v hlubokém Bavorském lese na řece Řezné, odkud vede stezka k Železné Rudě a do Čech.",
  },
  Waldkirchen: {
    t: "Trh biskupa pasovského",
    n: "Trh na Prachatické stezce, po níž soumaři vozí sůl z Pasova do Prachatic a zpět obilí a zboží z Čech.",
  },
  "Brod nad Lesy": {
    t: "Pohraniční městečko",
    n: "Městečko pod hvozdem na Bavorské cestě z Domažlic do Řezna. Nejkratší stezka z Čech vede právě sem a přechod přes hranici se střeží.",
  },
  Sulzbach: {
    t: "Hornofalcké město",
    n: "Město s hradem na Norimberské cestě od Přimdy, mezi železnými doly a hamry. Léta Páně 1428 zde stráž u hranic nepustila dál pět zbrojí norimberských kupců, aby nepadly do rukou kacířů.",
  },
  Weiden: {
    t: "Hornofalcké město",
    n: "Město na Naabě v Horní Falci, nedaleko stezky, po níž se jede oklikou z Tachova do Norimberka.",
  },
  Tirschenreuth: {
    t: "Město kláštera waldsasského",
    n: "Městečko obklopené rybníky, střed panství cisterciáků z Waldsassen na pomezí chebském.",
  },
  Wunsiedel: {
    t: "Město markrabí Albrechta",
    n: "Přední ze šesti úřadů ve Smrčinách, jež drží Hohenzollernové; v okolních horách se rýžuje a kope cín.",
  },
  Erlangen: {
    t: "Město markrabí Albrechta",
    n: "Městečko na Regnici, které koupil císař Karel IV. ke koruně české; král Václav je léta Páně 1402 prodal purkrabím norimberským.",
  },
  Schwabach: {
    t: "Město markrabí Albrechta",
    n: "Město markrabství ansbašského na jih od Norimberka, kudy vede cesta do Švábska a k Dunaji.",
  },
  "Neustadt an der Aisch": {
    t: "Město markrabí Albrechta",
    n: "Město na řece Aischi v západních Francích, jež drží markrabí z rodu Hohenzollernů.",
  },
  Würzburg: {
    t: "Biskupské město",
    n: "Sídlo biskupa würzburského, jenž se píše vévodou ve Francích, s pevným hradem na Mariánském vrchu nad Mohanem. Biskupem je od léta Páně 1455 Jan z Grumbachu.",
  },
  Rothenburg: {
    t: "Svobodné říšské město",
    n: "Říšské město na skále nad Tauberou ve Francích. Za purkmistra Jindřicha Toplera v minulém věku nabylo rozsáhlého venkova a stalo se mocnou obcí.",
  },
  Schweinfurt: {
    t: "Svobodné říšské město",
    n: "Říšské město na Mohanu, obklopené zemí biskupů würzburských, které hlídá přechod přes řeku.",
  },
  Windsheim: {
    t: "Svobodné říšské město",
    n: "Malé říšské město ve Francích na cestě z Norimberka k Würzburku.",
  },
  Pottenstein: {
    t: "Hrad biskupa bamberského",
    n: "Hrad na skále nad údolím v hornatém kraji mezi Bamberkem a Bayreuthem, kde léta Páně 1228 pobývala svatá Alžběta Durynská.",
  },
  Lauf: {
    t: "Bavorský hrad Karla IV.",
    n: "Hrad na ostrově v Pegnici, který dal postavit císař Karel IV., když kraj náležel k Novým Čechám; v jeho sále jsou na zdech erby českých pánů, rytířů a měst. Od léta Páně 1373 patří Bavorům. V únoru 1452 se zde sjela německá knížata a strana pana Jiřího jim psala na obranu kalicha.",
  },
  Ortenburg: {
    t: "Hrad hrabat z Ortenburku",
    n: "Hrad na návrší mezi Vilshofenem a Pasovem, sídlo starého rodu hrabat z Ortenburku, kteří se drží za bezprostřední many říše a brání se svrchovanosti vévodů bavorských.",
  },
  Abensberg: {
    t: "Město a hrad pánů z Abensberku",
    n: "Městečko s hradem nad říčkou Abens nedaleko Kelheimu, sídlo starobylého bavorského rodu pánů z Abensberku.",
  },
  Waldsassen: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků založené léta Páně 1133, mocný klášter na pomezí chebském; náleží mu Tirschenreuth i všechen kraj okolo, jemuž se říká Stiftland.",
  },
  Niederaltaich: {
    t: "Klášter benediktinů",
    n: "Prastaré opatství benediktinů na Dunaji, založené vévodou Odilem bavorským léta Páně 741; jeho mniši klučili Bavorský les až k hranici české.",
  },
  Tegernsee: {
    t: "Klášter benediktinů",
    n: "Opatství benediktinů u jezera pod Alpami, středisko obnovy řádového života. Kardinál Mikuláš Kusánský si se zdejšími mnichy dopisuje o patření na Boha a léta Páně 1453 jim věnoval knihu O vidění Boha.",
  },
  Andechs: {
    t: "Klášter benediktinů",
    n: "Svatá hora nad jezerem Ammersee, kam putují poutníci k ostatkům a ke třem svatým hostiím. Vévoda Albrecht III. zde léta Páně 1455 založil klášter benediktinů.",
  },
  Ettal: {
    t: "Klášter benediktinů",
    n: "Opatství v horském údolí na cestě z Mnichova k Innsbrucku, které léta Páně 1330 založil císař Ludvík Bavor; chová sošku Panny Marie, kterou císař přivezl z Itálie.",
  },
  Scheyern: {
    t: "Klášter benediktinů",
    n: "Opatství na místě, kde stával hrad hrabat ze Scheyernu, předků rodu Wittelsbachů; vévodové bavorští tu mají starou rodovou hrobku.",
  },
  Heilsbronn: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků mezi Norimberkem a Ansbachem, kde jsou pohřbíváni purkrabí norimberští a markrabí z rodu Hohenzollernů.",
  },
  Vierzehnheiligen: {
    t: "Nové poutní místo",
    n: "Pole nad Mohanem, kde se léta Páně 1445 pastýři kláštera langheimského zjevilo plačící dítě a později v kruhu čtrnácti svatých pomocníků. Cisterciáci tu postavili kapli a poutníků přibývá.",
  },
  Berchtesgaden: {
    t: "Proboštství augustiniánů",
    n: "Proboštství kanovníků svatého Augustina v horském kotli pod Alpami; žije ze solných pramenů a o prodej soli se přou se Salcburkem i s vévody bavorskými.",
  },
  Retz: {
    t: "Vinařské město",
    n: "Město s hradbami na moravském pomezí, pod nímž jsou ve skále vyhloubeny sklepy na víno. Léta Páně 1425 je dobyli a vypálili husité.",
  },
  Marchegg: {
    t: "Pohraniční město",
    n: "Město na řece Moravě proti Uhrám, které léta Páně 1268 založil král Přemysl Otakar II. jako pevnost na hranici; jeho hradby objímají mnohem víc místa, než kolik je v nich domů.",
  },
  "Bruck an der Leitha": {
    t: "Pohraniční město",
    n: "Město na Litavě, hraniční řece mezi Rakousy a Uhrami, na cestě z Vídně do Uher.",
  },
  "Waidhofen an der Ybbs": {
    t: "Město biskupa freisinského",
    n: "Město v železářském kraji na řece Ybbs, které náleží biskupům freisinským; kováři zde zpracují štýrské železo na kosy, srpy a nože.",
  },
  Hallstatt: {
    t: "Solné doly",
    n: "Městečko na úzkém břehu jezera pod horami, kde se v hoře kope sůl; po Tauně ji plaví přes Gmunden k Dunaji a vozí i do jižních Čech.",
  },
  Perchtoldsdorf: {
    t: "Zeměpanský hrad a trh",
    n: "Trh s hradem na úpatí Vídeňského lesa nedaleko Vídně. Léta Páně 1452 sem přivezli mladého krále Ladislava, když jej císař vydal Rakušanům; hrad pak držel hrabě Oldřich Celjský a chovával zde svou milenku.",
  },
  Orth: {
    t: "Zeměpanský hrad",
    n: "Vodní hrad na Moravském poli u Dunaje, dědičný hrad rodu rakouského. Léta Páně 1452 jej Rakušané Mailberského spolku dobyli na císařově posádce, která se osm dní bránila dělům.",
  },
  Lengbach: {
    t: "Hrad ve Vídeňském lese",
    n: "Hrad Konráda Hölzlera, někdejšího správce zeměpanských důchodů v Rakousích, kde jeho purkrabí věznil mladého Matyáše Hunyadiho. Když Hölzler upadl v nemilost, dal král Ladislav vězně převézt do Prahy; přibyl tam v den králova skonu, 23. listopadu léta Páně 1457.",
  },
  Forchtenstein: {
    t: "Hrad císařův v Uhrách",
    n: "Hrad na skále v župě šoproňské nedaleko Nového Města, jeden z uherských hradů, které rod rakouský drží od léta Páně 1445. Arcikníže Albrecht jej slíbil Oldřichu Eicingerovi a pak prodal císaři; ta křivda hnala Eicingera do odboje.",
  },
  Gars: {
    t: "Hrad za Dunajem",
    n: "Hrad nad řekou Kamp v Rakousích za Dunajem. Léta Páně 1452 zde i ve Vídeňském Novém Městě dal císař vyhlásit papežské listy proti odbojným Rakušanům.",
  },
  Aggstein: {
    t: "Hrad nad Dunajem",
    n: "Hrad na strmé skále nad Dunajem pod Mělkem. Jiří Scheck z Waldu jej znovu vystavěl a vybírá zde mýto od lodí; lid mu pro jeho kruté způsoby říká Schreckenwald.",
  },
  Raabs: {
    t: "Pohraniční hrad",
    n: "Hrad na skále nad soutokem obou Dyjí na hranici moravské. Podle něho, jak se praví, nazvali Čechové celou zemi Rakousy.",
  },
  Wallsee: {
    t: "Sídlo pánů z Wallsee",
    n: "Hrad nad Dunajem na pomezí Rakous pod a nad Enží, sídlo mocného rodu pánů z Wallsee. Pan Wolfgang z Wallsee jednal léta Páně 1452 s císařem za rakouské stavy.",
  },
  Mailberg: {
    t: "Komenda johanitů",
    n: "Komenda rytířů svatého Jana na hranici Rakous a Moravy. Léta Páně 1451 se zde pod záminkou sporu o hranice spikli rakouští páni proti císaři; Mailberský spolek si pak vynutil vydání krále Ladislava.",
  },
  Zwettl: {
    t: "Klášter cisterciáků",
    n: "Městečko a opatství cisterciáků v lesích na severu Rakous, které léta Páně 1138 založil Hadmar z Kuenringu. U Zwettlu porazili husité léta 1427 vojsko rakouské.",
  },
  Heiligenkreuz: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků ve Vídeňském lese, které léta Páně 1133 založil markrabě Leopold; je pohřebištěm vévodů z rodu Babenberků.",
  },
  Klosterneuburg: {
    t: "Klášter kanovníků",
    n: "Klášter kanovníků svatého Augustina nad Dunajem nedaleko Vídně, který založil markrabě Leopold z rodu Babenberků; jeho hrob zde lid uctívá jako hrob světce. Chová slavný oltář zdobený zlatem a smaltem.",
  },
  Kremsmünster: {
    t: "Klášter benediktinů",
    n: "Prastaré opatství benediktinů, které léta Páně 777 založil vévoda Tasilo bavorský; chová pozlacený kalich, jejž prý daroval sám zakladatel.",
  },
  Lambach: {
    t: "Klášter benediktinů",
    n: "Opatství benediktinů na Tauně, po níž se plaví sůl, založené léta Páně 1056 biskupem würzburským Adalberonem z rodu hrabat z Lambachu.",
  },
  "Svatý Florián": {
    t: "Klášter kanovníků",
    n: "Klášter kanovníků svatého Augustina nad hrobem svatého Floriána, římského vojáka, kterého pro víru utopili v Enži; nedaleko města Enže.",
  },
  Gaming: {
    t: "Kartouza",
    n: "Kartuziánský klášter Trůn Mariin v předhůří Alp, který založil vévoda Albrecht II. Chromý; v jeho chrámu je vévoda pohřben.",
  },
  Eilenburg: {
    t: "Zeměpanské město",
    n: "Město pod starým hradem na Muldě mezi Lipskem a Torgavou; odtud prý pochází i rod pánů z Ilburka, známý v Čechách.",
  },
  Döbeln: {
    t: "Zeměpanské město",
    n: "Jedno z nejstarších měst markrabí míšeňských, na ostrově ve Freiberské Muldě mezi Míšní a Lipskem.",
  },
  Weida: {
    t: "Zeměpanské město",
    n: "Město pod hradem Osterburgem, kolébka fojtů z Weidy, od nichž má Fojtsko jméno; léta Páně 1427 je koupili Wettinové.",
  },
  Sangerhausen: {
    t: "Zeměpanské město",
    n: "Durynské město vévody Viléma na jižním úpatí Harcu, v kraji, kde se dobývá měď.",
  },
  Pöchlarn: {
    t: "Město biskupa řezenského",
    n: "Městečko na Dunaji pod Mělkem, které náleží biskupům řezenským. Zpěváci o Nibelunzích je jmenují Bechelaren a praví, že tu sídlil šlechetný markrabě Rüdiger.",
  },
  Lilienfeld: {
    t: "Klášter cisterciáků",
    n: "Opatství cisterciáků v údolí pod Alpami, které léta Páně 1202 založil vévoda Leopold VI. z rodu Babenberků a v němž je pohřben; leží tu i Cimburgis Mazovská, matka císaře Fridricha.",
  },
  Geras: {
    t: "Klášter premonstrátů",
    n: "Klášter premonstrátů v lesnatém kraji na severu Rakous, nedaleko hranice moravské.",
  },
  Schlägl: {
    t: "Klášter premonstrátů",
    n: "Klášter premonstrátů v hornatém kraji pod Šumavou, při hranici české, nedaleko panství pánů z Rožmberka.",
  },
  /* ---- MÍSTA: Polsko a severní Uhry (2026-10-28) ---- */
  Sandoměř: {
    t: "Královské město",
    n: "Staré královské město na vysokém břehu Visly, hlava země sandoměřské, s hradem a kolegiátním kostelem. Po Visle se odtud plaví obilí a dříví ke Gdaňsku. Léta Páně 1452 zde král Kazimír na sjezdu nevpustil do rady pana Jana z Oleśnice.",
  },
  Lublin: {
    t: "Královské město",
    n: "Hlavní město země lublinské s hradem nad Bystřicí, na cestě z Krakova do Litvy a na Rus. Na trhy sem jezdí kupci z Rusi a z Litvy a páni polští zde s Litevci jednávají o unii.",
  },
  Radom: {
    t: "Královské město",
    n: "Královské město s hradem v zemi sandoměřské, kde se král cestou z Krakova do Litvy rád zastavuje. Léta Páně 1401 zde páni polští stvrdili smlouvu s velkoknížetem Vitoldem.",
  },
  Tarnów: {t: "Panské město", n: "Město pánů z Tarnova erbu Leliwa s hradem na vrchu nad městem, na cestě z Krakova na Rus."},
  Opatów: {
    t: "Biskupské město",
    n: "Tržní město biskupů lubušských v zemi sandoměřské s kolegiátním kostelem svatého Martina, na cestě ze Sandoměře ke Krakovu.",
  },
  Szydłów: {
    t: "Královské město",
    n: "Královské městečko obehnané kamennou hradbou, kterou mu dal postaviti Kazimír Veliký; hrad hlídá cestu ze Sandoměře ke Krakovu.",
  },
  "Kazimierz Dolny": {
    t: "Královské město",
    n: "Městečko pod královským hradem na Visle, kde se nakládá zboží na lodě; jméno má prý po králi Kazimírovi Velikém.",
  },
  Krosno: {
    t: "Královské město",
    n: "Královské město na úpatí hor, odkud vede cesta přes průsmyk do Uher; měšťané obchodují s Uhry suknem a vínem.",
  },
  Jasło: {t: "Královské město", n: "Královské městečko nad Wisłokou na cestě z Biecze ke Krosnu a do Uher."},
  Myślenice: {t: "Městečko", n: "Městečko na Rabě na cestě z Krakova k horám a k uherské hranici."},
  Přemyšl: {
    t: "Biskupské město",
    n: "Staré město nad Sanem, hlava země přemyšlské. Sídlí zde biskup katolický i vladyka řeckého vyznání a žije tu mnoho Rusínů a Židů.",
  },
  Sanok: {
    t: "Královské město",
    n: "Královský hrad a město nad Sanem, hlava země sanocké na pomezí k Uhrám; v kraji žijí Rusíni a horalé pastevci. Zde léta Páně 1417 pojal král Vladislav Jagello svou třetí choť Alžbětu z Pilice.",
  },
  Jarosław: {t: "Tržní město", n: "Tržní město nad Sanem na cestě ze Lvova ke Krakovu, kam se sjíždějí kupci z Rusi i z Polska."},
  Parczew: {
    t: "Královské město",
    n: "Malé královské město v zemi lublinské, kde páni polští a litevští sněmují o unii; léta 1451 tu prý kardinál Oleśnicki všechny umořil dlouhou řečí o dějinách unie.",
  },
  Łuków: {t: "Královské město", n: "Královské město na východě Malopolska, mezi lesy a bažinami k pomezí litevskému."},
  Kościan: {t: "Královské město", n: "Královské město s hradem nad Obrou v jižním Velkopolsku, na cestě z Poznaně do Slezska."},
  Pyzdry: {t: "Královské město", n: "Královské město s hradem nad Vartou v zemi kališské."},
  Środa: {
    t: "Sněmovní město",
    n: "Velkopolské město, kde se schází sněmík šlechty poznaňské a kališské. Podle výsad z Nešavy nesmí král bez sjezdu šlechty vydávat nová ustanovení ani svolávat hotovost.",
  },
  Koło: {
    t: "Sněmovní město",
    n: "Město nad Vartou, kde se schází sněmík velkopolský; daně na válku pruskou tu musí šlechta od léta Páně 1456 králi povolit.",
  },
  Konin: {
    t: "Královské město",
    n: "Královské město nad Vartou na staré cestě z Kališe do Kujav; u kostela stojí kamenný sloup, jenž měří polovici cesty z Kališe do Kruszwice.",
  },
  "Brześć Kujawski": {
    t: "Hlavní město vojvodství",
    n: "Hlava vojvodství brzeského v Kujavsku s hradem. Vojvoda Mikuláš Szarlejski, prostředník mezi pruským Svazem a dvorem, padl léta 1454 u Chojnic do zajetí.",
  },
  Radziejów: {t: "Sněmovní město", n: "Kujavské město, kde se schází sněmík šlechty kujavské."},
  Dobrzyń: {
    t: "Hrad a město",
    n: "Hrad a městečko na vysokém břehu Visly, hlava země dobřiňské, o kterou se Polsko po léta přelo s Řádem německých rytířů.",
  },
  Radomsko: {
    t: "Královské město",
    n: "Královské město na cestě z Piotrkowa ke Krakovu; léta Páně 1382 se zde sjeli páni polští, aby rozhodli o nástupnictví po králi Ludvíkovi.",
  },
  Niepołomice: {
    t: "Královský hrad",
    n: "Lovecký hrad králů polských nad Niepołomickou pustou, který dal vystavěti Kazimír Veliký. Král Kazimír, vášnivý lovec, sem rád zajíždí.",
  },
  Lanckorona: {t: "Královský hrad", n: "Královský hrad na vrchu nad cestou z Krakova k pomezí osvětimskému a do Uher."},
  Chęciny: {
    t: "Královský hrad",
    n: "Královský hrad na skalnatém hřebeni nad městem; chovávají se v něm poklady a vězňové, i rytíři řádoví zajatí u Grunwaldu.",
  },
  Melsztyn: {
    t: "Hrad pánů z Melštýna",
    n: "Hrad nad Dunajcem, sídlo pánů z Melštýna. Pan Spytek z Melštýna, jenž přál kalichu a vedl konfederaci proti kardinálu Oleśnickému, padl léta Páně 1439 u Grotnik.",
  },
  Tyniec: {t: "Benediktinské opatství", n: "Prastaré opatství benediktinů na skále nad Vislou pod Krakovem, nejstarší klášter v zemi."},
  "Łysa Góra": {
    t: "Benediktinské opatství a pouť",
    n: "Opatství benediktinů na Lysé hoře, kde se chová kus Svatého Kříže; putují sem poutníci z celého Polska. Na vrcholu hory prý stávala svatyně pohanská.",
  },
  Wąchock: {t: "Cisterciácké opatství", n: "Klášter cisterciáků v lesích nad Kamennou; mniši tu dobývají a taví železnou rudu."},
  Sulejów: {t: "Cisterciácké opatství", n: "Cisterciácké opatství nad Pilicí, které založil kníže Kazimír Spravedlivý."},
  Jędrzejów: {
    t: "Cisterciácké opatství",
    n: "Nejstarší klášter cisterciáků v Polsku, kde dožil a je pohřben kronikář biskup Vincenc Kadłubek.",
  },
  Trzemeszno: {
    t: "Klášter kanovníků řeholních",
    n: "Opatství kanovníků řeholních nedaleko Hnězdna; podle podání se tu zastavil svatý Vojtěch na cestě k Prusům.",
  },
  Wągrowiec: {t: "Cisterciácké opatství", n: "Cisterciácký klášter v severním Velkopolsku, kam se mniši přestěhovali z Łekna."},
  Czerwińsk: {
    t: "Klášter kanovníků řeholních",
    n: "Klášter kanovníků řeholních nad Vislou v Mazovsku. Zde léta Páně 1410 přešlo vojsko krále Vladislava po mostě z lodí přes Vislu na cestě ke Grunwaldu.",
  },
  Lubiń: {t: "Benediktinské opatství", n: "Opatství benediktinů v jižním Velkopolsku, jedno z nejstarších v zemi."},
  Pińczów: {
    t: "Sídlo pánů z Oleśnice",
    n: "Hrad a město pana Jana Głowacze z Oleśnice, bratra zemřelého kardinála a jednoho z nejbohatších pánů malopolských.",
  },
  Rytwiany: {t: "Sídlo pánů z Rytwian", n: "Hrad pana Dziersława z Rytwian, vojvody sandoměřského a věrného muže krále Kazimíra."},
  Koniecpol: {
    t: "Sídlo pánů z Koniecpola",
    n: "Sídlo pánů z Koniecpola nad Pilicí; z rodu toho byl kancléř Jan, jenž zemřel léta 1455, a pan Přeboř jest kastelánem sandoměřským.",
  },
  Pilica: {
    t: "Sídlo pánů z Pilice",
    n: "Hrad a městečko nad řekou Pilicí; drží je pan Jan Pilecki, syn královny Alžběty z prvního manželství a nevlastní bratr krále Kazimíra.",
  },
  Kórnik: {t: "Sídlo pánů z Górky", n: "Hrad na jezeře nedaleko Poznaně, který drží páni z Górky."},
  Kielce: {
    t: "Biskupské město",
    n: "Město biskupů krakovských v lesích pod Lysou horou, s biskupským dvorem a kolegiátním kostelem.",
  },
  Iłża: {t: "Biskupský hrad", n: "Hrad a městečko biskupů krakovských na cestě ze Sandoměře do Radomi."},
  Łowicz: {
    t: "Arcibiskupské město",
    n: "Hlavní sídlo arcibiskupů hnězdenských, jejichž panství zde leží jako ostrov uprostřed Mazovska.",
  },
  Uniejów: {t: "Arcibiskupský hrad", n: "Hrad arcibiskupů hnězdenských nad Vartou."},
  Żnin: {t: "Arcibiskupské město", n: "Město arcibiskupů hnězdenských v severním Velkopolsku."},
  Czersk: {
    t: "Knížecí hrad",
    n: "Starý hrad knížat mazovských na vysokém břehu nad Vislou, odkud se vládlo Mazovsku, než knížata přesídlila do Varšavy.",
  },
  Rawa: {t: "Knížecí hrad", n: "Hrad a město knížat mazovských, hlava země ravské na pomezí s Lenčickem."},
  Sochaczew: {t: "Knížecí hrad", n: "Hrad a město knížat mazovských nad Bzurou."},
  Gostynin: {t: "Knížecí hrad", n: "Hrad a městečko knížat mazovských na pomezí ke Kujavám."},
  Płońsk: {t: "Knížecí město", n: "Město knížat mazovských na cestě z Płocka do Ciechanowa."},
  Liw: {t: "Knížecí hrad", n: "Hrad knížat mazovských nad Liwcem, na pomezí k Podlasí a k Litvě."},
  Krupina: {
    t: "Královské město",
    n: "Staré královské město německých měšťanů, jehož právo převzala i jiná města; živí je vinice a pole víc než doly.",
  },
  "Nová Baňa": {
    t: "Horní město",
    n: "Malé horní město nad Hronem, jedno ze svobodných horních měst pod královskou komorou; kope se tu zlato a stříbro.",
  },
  Ľubietová: {
    t: "Horní město",
    n: "Horní město, kde se odedávna dobývá měď; bývalo hlavou měděných dolů uherských, ale nyní je předstihuje Banská Bystrica.",
  },
  Gelnica: {t: "Horní město", n: "Horní město na Hnilci, kde se kope měď a stříbro; vedle Ľubietové bylo dlouho hlavou měděných dolů uherských."},
  Smolník: {t: "Horní město", n: "Horní město v horách nad Hnilcem, kde se od starých časů dobývá zlato a měď."},
  Lučenec: {
    t: "Městečko",
    n: "Tržní městečko; nedaleko stojí opevněný klášter, který léta Páně 1451 obléhal Hunyadi. Pan Jiskra přispěchal obleženým na pomoc a porazil jeho vojsko tak těžce, že padlo několik baronů uherských.",
  },
  Varadín: {
    t: "Biskupské město",
    n: "Bohaté tržní město bez hradeb pod biskupským hradem. V chrámu je hrob svatého krále Ladislava, k němuž putují poutníci a u něhož se skládají přísahy. Biskupem jest Jan Vitéz, vychovatel krále Matyáše a muž velmi učený, jenž sbírá knihy.",
  },
  Tata: {
    t: "Královský hrad",
    n: "Hrad na jezeře, který si císař Zikmund vystavěl pro lovy a kde hostíval knížata; léta Páně 1426 zde smluvil s despotou Štěpánem budoucnost Srbska.",
  },
  Diósgyőr: {
    t: "Královský hrad",
    n: "Skvělý hrad krále Ludvíka o čtyřech nárožních věžích, podle něhož si páni uherští stavějí svá sídla; býval věnem královen uherských.",
  },
  Güssing: {
    t: "Hrad",
    n: "Hrad na osamělém sopečném vrchu při západní hranici Uher, odkud kdysi mocní hrabata z Güssingu vzdorovali králům.",
  },
  Eisenstadt: {
    t: "Hrad v rukou císařových",
    n: "Hrad a městečko na úpatí Litavských hor; od léta Páně 1445 je drží císař Fridrich spolu s dalšími hrady západních Uher a se Šoproní.",
  },
  Pannonhalma: {
    t: "Benediktinské arciopatství",
    n: "Prastaré opatství benediktinů na hoře svatého Martina nad rovinou rábskou, založené za časů knížete Gejzy a svatého Štěpána.",
  },
  Jasov: {t: "Premonstrátský klášter", n: "Klášter premonstrátů v údolí pod skalami u Košic; po léta 1453 jej vyplenili bratříci."},
  Sárospatak: {
    t: "Sídlo pánů Pálócziů",
    n: "Hrad a město nad Bodrogem, které léta Páně 1429 dal císař Zikmund pánům Pálócziům; pan Ladislav Pálóczi jest dvorským sudím.",
  },
  Šintava: {
    t: "Hrad Rozgonyiů",
    n: "Hrad u brodu přes Váh, který císař Zikmund zastavoval za veliké sumy; nakonec jej dal pánům Rozgonyiům za půjčku.",
  },
  Užhorod: {
    t: "Sídlo Drugethů",
    n: "Hrad a město nad Uhem, sídlo hrabat Drugethů, kteří přišli do Uher s králi z rodu Anjou a vládnou župě užské.",
  },
  Humenné: {t: "Sídlo Drugethů", n: "Sídlo Drugethů v Zemplíně pod Vihorlatem, na cestě z Uher přes hory do Polska."},
  Debrecín: {
    t: "Tržní město Hunyadiů",
    n: "Veliké tržní město bez hradeb uprostřed roviny. Léta Páně 1444 je dal despota Jiří Branković Janu Hunyadimu a nyní náleží matce královské Alžbětě Silágyiové; na zdejší trhy se hnává dobytek z veliké roviny.",
  },
  Mukačevo: {
    t: "Hrad Hunyadiů",
    n: "Hrad na skále nad Latoricí, který léta 1444 přešel s Debrecínem na Hunyadiho. Kdysi zde vládl litevský kníže Fedor Koriatovič, jenž založil klášter řeckého vyznání.",
  },
  Satmár: {t: "Město Hunyadiů", n: "Město na Samoši, jeden ze statků, které léta Páně 1444 dostal Jan Hunyadi od despoty srbského."},
  Plaveč: {
    t: "Hrad bratříků",
    n: "Hrad nad Popradem, kde sídlí Petr Aksamit, vůdce bratříků; od rozchodu s Jiskrou odtud a z polních táborů vládne velkému dílu Spiše.",
  },
  "Tábor u Hrabušic": {
    t: "Tábor bratříků",
    n: "Polní tábor bratříků na Zelené hoře nad Hrabušicemi, opevněný srubem a valem. Petr Aksamit se v listech píše, že sídlí zde a na Plavči.",
  },
  Pápa: {t: "Sídlo Garaiů", n: "Město a pohodlné panské sídlo, které si zde vystavěli Garaiové, rod palatinů."},
  /* ---- MÍSTA: doplnění z rešerše hospodářství a Pruska (2026-10-28) ---- */
  Sztum: {
    t: "Hrad Řádu",
    n: "Cihlový hrad jižně od Malborku. Když Svaz dobyl velká města a zbořil jejich hrady, zbyly velmistrovi vedle Malborku a Chojnic právě tyto zdi nad jezerem.",
  },
  Świecie: {
    t: "Hrad na Visle",
    n: "Hrad a městečko na vysokém břehu Visly. Léta Páně 1433 jím táhli husité od Chojnic po vodě k Gdaňsku; komu zdi nyní náležejí, mění se s válkou.",
  },
  Pelplin: {
    t: "Klášter cisterciáků",
    n: "Bohatý klášter v Pomoří, který husité léta 1433 vypálili. Mniši si dodnes pamatují, co Češi v kraji činili, a každou zvěst o nich poslouchají s úzkostí.",
  },
  Oliwa: {
    t: "Klášter u Gdaňska",
    n: "Cisterciácké opatství v lesích nad mořem nedaleko Gdaňska, které husité léta 1433 vypálili. Mniši mají v zemi velkou váhu a jejich opat sedí v radě Pomoří.",
  },
  Bydgoszcz: {
    t: "Město s pivovary Řádu",
    n: "Městečko na Brdě při Visle. Pivo, které zde vaří Řád, má v zemi nejlepší pověst a prodává se i do Gdaňska.",
  },
  Freiberg: {
    t: "Horní město stříbrné",
    n: "Nejstarší velké stříbrné město saské, kde se stříbro dobývá od dávných časů. Doly dlouho churaly; nyní se po odvodňovacích štolách a novém dělení stříbra od mědi opět otvírají.",
  },
  Goslar: {
    t: "Říšské město a doly",
    n: "Staré město pod Rammelsbergem, jehož stříbro a olovo kdysi živilo půl Říše. Doly upadly; jeden sesuv zahubil podle starých zpráv v jediný den na čtyři sta mužů.",
  },
  Schwaz: {
    t: "Důl Falkenstein",
    n: "Městečko v údolí Innu, kde se po nálezu nových žil počíná horní štěstí. Tyrolský vévoda Zikmund si od augsburských kupců půjčuje peníze na budoucí příjem z dolů.",
  },
  Augsburg: {
    t: "Obchodní město kupců",
    n: "Říšské město švábské, kde se tkají barchety a kde sídlí kupecké domy, jež financují doly a obchodují mědí a stříbrem. Cesty odtud vedou přes Alpy do Itálie i přes Bavory k českým hranicím.",
  },
  Příbram: {
    t: "Horní městečko",
    n: "Městečko pod Brdy, kde se těží olovnatá ruda s malou příměsí stříbra. Bohatství Kutné Hory z ní nikdy nebylo a po válkách těžba zchátrala.",
  },
  "Německý Brod": {
    t: "Horní město",
    n: "Královské město, které vzniklo z horníků a německých osadníků na pomezí českomoravském; léta Páně 1422 zde husitský Žižka porazil vojsko krále Zikmunda.",
  },
  Sedlec: {
    t: "Cisterciácké opatství",
    n: "Opatství, na jehož půdě začalo dobývání stříbra, dříve než vznikla Kutná Hora. Opat se kdysi přel s Čáslaví a Kolínem o horní zemi; klášter byl za válek zpustošen.",
  },
  Velehrad: {
    t: "Klášter cisterciáků",
    n: "Cisterciácké opatství na Moravě, kde sloužili němečtí mniši od roku 1201. Podle pověsti stálo opatství poblíž hrobu svatého Metoděje.",
  },
};
/*@cast}*/
