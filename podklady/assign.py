# Přiřazení správních oblastí (Natural Earth admin-1, public domain) mocnostem k 3. 3. 1458
L=lambda s:set(x.strip() for x in s.split('|'))
DEF={'PRT':'por','ESP':'kas','FRA':'fra','DNK':'kal','NOR':'kal','SWE':'kal','FIN':'kal','ISL':'kal','FRO':'kal','ALD':'kal',
 'DEU':'hre','AUT':'hab','CHE':'hre','NLD':'hre','BEL':'bur','LUX':'bur','CZE':'boh','POL':'pol','LTU':'lit','BLR':'lit','LVA':'liv','EST':'liv',
 'HUN':'hun','SVK':'hun','SVN':'hab','HRV':'hun','BIH':'bos','SRB':'ott','KOS':'ott','MNE':'zet','ALB':'ott','MKD':'ott','BGR':'ott','GRC':'ott',
 'ROU':'hun','MDA':'mol','UKR':'lit','RUS':'mos','TUR':'ott','CYP':'cyp','CYN':'cyp','ESB':'cyp','WSB':'cyp','SYR':'mam','LBN':'mam','ISR':'mam','PSX':'mam','JOR':'mam',
 'EGY':'mam','LBY':None,'TUN':'haf','DZA':None,'MAR':None,'SAH':None,'MRT':None,'IRQ':'qqq','IRN':'qqq','ARM':'qqq','AZE':'shi','GEO':'geo','KAZ':'hor','SAU':None,'KWT':None,
 'IRL':'irl','AND':'fra','MCO':'gen','LIE':'hre','VAT':'pap','SMR':'pap','MLT':'ara','GIB':'gra','IMN':'eng','JEY':'eng','GGY':'eng','ITA':None}
R={
 'ara':{'ESP':L('Barcelona|Gerona|Lérida|Tarragona|Huesca|Zaragoza|Teruel|Castellón|Valencia|Alicante|Baleares'),
        'ITA':L('Cagliari|Carbonia-Iglesias|Medio Campidano|Nuoro|Ogliastra|Olbia-Tempio|Oristrano|Sassari|Agrigento|Caltanissetta|Catania|Enna|Messina|Palermo|Ragusa|Siracusa|Trapani'),
        'FRA':L('Pyrénées-Orientales')},
 'nav':{'ESP':L('Navarra')},'gra':{'ESP':L('Granada|Almería|Málaga')},'por':{'ESP':L('Ceuta')},'mar':{'ESP':L('Melilla'),
        'MAR':L('Tanger - Tétouan|Fès - Boulemane|Taza - Al Hoceima - Taounate|Oriental|Gharb - Chrarda - Béni Hssen|Rabat - Salé - Zemmour - Zaer|Meknès - Tafilalet|Grand Casablanca|Chaouia - Ouardigha|Doukkala - Abda|Marrakech - Tensift - Al Haouz|Tadla - Azilal')},
 'bre':{'FRA':L('Finistère|Côtes-d\'Armor|Morbihan|Ille-et-Vilaine|Loire-Atlantique')},
 'bur':{'FRA':L('Somme|Nord|Pas-de-Calais|Côte-d\'Or|Saône-et-Loire|Yonne|Doubs|Jura|Haute-Saône'),'NLD':L('Noord-Holland|Zuid-Holland|Zeeland|Noord-Brabant|Utrecht|Flevoland')},
 'hre':{'BEL':L('Liege'),'FRA':L('Bas-Rhin|Moselle|Meurthe-et-Moselle|Vosges|Meuse'),'ITA':L('Gorizia'),'POL':L('West Pomeranian'),'AUT':L('Salzburg')},
 'pro':{'FRA':L('Bouches-du-Rhône|Var|Alpes-de-Haute-Provence')},'pap':{'FRA':L('Vaucluse'),
        'ITA':L('Roma|Latina|Frosinone|Viterbo|Rieti|Terni|Perugia|Ancona|Macerata|Fermo|Ascoli Piceno|Pesaro e Urbino|Rimini|Forlì-Cesena|Ravenna|Bologna')},
 'sav':{'FRA':L('Savoie|Haute-Savoie|Ain|Alpes-Maritimes'),'CHE':L('Vaud|Genève|Fribourg'),'ITA':L('Aoste|Turin|Cuneo|Vercelli|Biella')},
 'fra':{'ITA':L('Asti')},
 'gen':{'ITA':L('Genova|Savona|Imperia|La Spezia'),'FRA':L('Corse-du-Sud|Haute-Corse')},
 'mil':{'ITA':L('Milano|Monza e Brianza|Lodi|Pavia|Como|Lecco|Varese|Sondrio|Novara|Verbano-Cusio-Ossola|Alessandria|Cremona|Parma|Piacenza'),'CHE':L('Ticino')},
 'ven':{'ITA':L('Venezia|Padova|Treviso|Vicenza|Verona|Belluno|Udine|Pordenone|Bergamo|Brescia'),
        'HRV':L('Istarska|Zadarska|Šibensko-Kninska|Splitsko-Dalmatinska'),'GRC':L('Kriti|Ionioi Nisoi|Notio Aigaio'),'ALB':L('Durrës|Shkodër|Lezhë'),
        'MNE':L('Kotor|Tivat|Budva|Bar|Ulcinj')},
 'hab':{'ITA':L('Bozen|Trento|Trieste'),'CHE':L('Thurgau'),'FRA':L('Haute-Rhin|Territoire de Belfort')},
 'swi':{'CHE':L('Zürich|Bern|Lucerne|Uri|Schwyz|Obwalden|Nidwalden|Glarus|Zug|Aargau|Sankt Gallen|Appenzell Ausserrhoden|Appenzell Innerrhoden')},
 'flo':{'ITA':L('Firenze|Prato|Pistoia|Pisa|Livorno|Arezzo|Massa-Carrara')},'sie':{'ITA':L('Siena|Grosseto')},'luc':{'ITA':L('Lucca')},
 'est':{'ITA':L('Ferrara|Modena|Reggio Emilia|Rovigo')},'man':{'ITA':L('Mantova')},
 'nap':{'ITA':L('Napoli|Caserta|Avellino|Benevento|Salerno|L\'Aquila|Teramo|Pescara|Chieti|Campobasso|Isernia|Foggia|Bari|Barletta-Andria Trani|Brindisi|Lecce|Taranto|Matera|Potenza|Cosenza|Catanzaro|Crotene|Vibo Valentia|Reggio Calabria')},
 'boh':{'POL':L('Lower Silesian|Opole|Silesian|Lubusz')},
 'teu':{'POL':L('Warmian-Masurian'),'RUS':L('Kaliningrad'),'LTU':L('Klaipedos')},
 'lit':{'POL':L('Podlachian'),'RUS':L('Smolensk|Bryansk|Orel|Kursk'),'UKR':L('Volyn|Rivne|Zhytomyr|Kiev|Kiev City|Chernihiv|Cherkasy|Sumy|Poltava|Vinnytsya|Kirovohrad|Mykolayiv|Odessa'),
        'MDA':L('Stîngă Nistrului|Transnistria|Camenca|Grigoriopol')},
 'pol':{'UKR':L('L\'viv|Ternopil\'|Ivano-Frankivs\'k|Khmel\'nyts\'kyy')},
 'mol':{'UKR':L('Chernivtsi'),'ROU':L('Bacau|Botosani|Galati|Iasi|Neamt|Suceava|Vaslui|Vrancea')},
 'hun':{'UKR':L('Transcarpathia'),'AUT':L('Burgenland'),'SRB':L('Južno-Backi|Severno-Backi|Zapadno-Backi|Južno-Banatski|Severno-Banatski|Srednje-Banatski|Sremski|Grad Beograd|Macvanski')},
 'wal':{'ROU':L('Arges|Bucharest|Calarasi|Dâmbovita|Dolj|Giurgiu|Gorj|Ialomita|Ilfov|Mehedinti|Olt|Prahova|Teleorman|Vâlcea|Buzau|Braila')},
 'ott':{'ROU':L('Tulcea|Constanta')},
 'cri':{'UKR':L('Kherson'),'RUS':L('Crimea|Sevastopol')},
 'hor':{'UKR':L('Dnipropetrovs\'k|Zaporizhzhya|Donets\'k|Luhans\'k|Kharkiv'),'RUS':L('Voronezh|Belgorod|Saratov|Volgograd|Rostov|Astrakhan\'|Kalmyk|Stavropol\'|Orenburg')},
 'ser':{'SRB':L('Šumadijski|Podunavski|Branicevski|Pomoravski|Kolubarski|Moravicki|Zlatiborski|Raški|Borski')},
 'rag':{'HRV':L('Dubrovacko-Neretvanska')},
 'her':{'BIH':L('Herzegovina-Neretva|West Herzegovina|Trebinje|Foča'),'MNE':L('Herceg Novi|Pljevlja|Plužine|Nikšic|Šavnik|Žabljak')},
 'alb':{'ALB':L('Dibër|Tiranë|Elbasan|Kukës')},
 'mor':{'GRC':L('Peloponnisos')},
 'gen2':{'GRC':L('Voreio Aigaio')},
 'nov':{'RUS':L('Novgorod|Leningrad|City of St. Petersburg|Karelia|Murmansk|Arkhangel\'sk|Komi|Nenets|Perm\'')},
 'psk':{'RUS':L('Pskov')},'tve':{'RUS':L('Tver\'')},'rya':{'RUS':L('Ryazan\'|Lipetsk|Tambov')},
 'kaz':{'RUS':L('Tatarstan|Chuvash|Mariy-El|Udmurt|Mordovia|Penza|Ul\'yanovsk|Samara')},
 'cir':{'RUS':L('Krasnodar|Adygey|Karachay-Cherkess|Kabardin-Balkar|North Ossetia|Ingush|Chechnya|Dagestan')},
 'isf':{'TUR':L('Kastamonu|Sinop|Çankiri|Bartın|Karabük')},
 'kar':{'TUR':L('Konya|Karaman|Aksaray|Nigde|Nevsehir|Kayseri|Mersin')},
 'tre':{'TUR':L('Trabzon|Rize|Giresun|Gümüshane')},
 'mam':{'TUR':L('Adana|Osmaniye|Hatay|Gaziantep|Kilis|K. Maras|Malatya|Adiyaman|Sanliurfa'),'SAU':L('Tabuk|Al Madinah'),
        'LBY':L('Al Butnan|Al Jabal al Akhdar|Al Marj|Benghazi|Al Qubbah|Ajdabiya')},
 'aqq':{'TUR':L('Diyarbakir|Batman|Mardin|Siirt|Elazig|Tunceli|Bingöl|Erzincan|Sirnak|Bayburt|Mus|Bitlis'),'SYR':L('Hasaka (Al Haksa)')},
 'qqq':{'TUR':L('Van|Hakkari|Agri|Iğdir|Kars|Erzurum')},
 'geo':{'TUR':L('Artvin|Ardahan')},
 'haf':{'DZA':L('Annaba|El Tarf|Souk Ahras|Guelma|Constantine|Mila|Skikda|Jijel|Béjaïa|Sétif|Batna|Khenchela|Oum el Bouaghi|Tébessa|Bordj Bou Arréridj|Biskra|Tizi Ouzou|Bouira|Boumerdès'),
        'LBY':L('Al Jifarah|Tajura\' wa an Nawahi al Arba|Az Zawiyah|Al Marqab|An Nuqat al Khams|Misratah')},
 'zay':{'DZA':L('Tlemcen|Aïn Témouchent|Oran|Sidi Bel Abbès|Mascara|Mostaganem|Relizane|Chlef|Aïn Defla|Tiaret|Tissemsilt|Saïda|Médéa|Blida|Alger|Tipaza')},
}
GBR={'England':'eng','Wales':'eng','Scotland':'sco','Northern Ireland':'irl'}
GBR_N={'Orkney':'kal','Shetland Islands':'kal'}
def assign(a3,name,geonunit):
    if a3=='GBR': return GBR_N.get(name) or GBR.get(geonunit,'eng')
    for st,m in R.items():
        if a3 in m and name in m[a3]: return 'gen' if st=='gen2' else st
    return DEF.get(a3)
# ruční úpravy v zeměpisných souřadnicích (lon, lat): stát, polygon – mají přednost
OVR=[
 ('eng',[(1.55,50.72),(2.15,50.72),(2.15,51.02),(1.55,51.02)]),                                    # Calais a okolí (Pale of Calais)
 ('boh',[(13.65,51.60),(15.15,51.62),(15.10,51.0),(14.55,50.85),(14.05,50.95),(13.65,51.2)]),      # Horní Lužice (část v Sasku)
 ('boh',[(13.55,52.10),(14.75,52.10),(14.75,51.62),(13.55,51.62)]),                                # Dolní Lužice
 ('hre',[(14.3,52.25),(15.9,52.25),(15.9,53.2),(14.3,53.2)]),                                       # Nová Marka (Braniborsko) – sever Lubušska
 ('mol',[(28.1,46.65),(30.0,46.55),(30.25,46.35),(30.8,46.0),(29.7,45.2),(28.1,45.2)]),             # Budžak
 ('kal',[(27.5,60.25),(29.6,60.25),(29.9,61.3),(27.5,61.3)]),                                       # Vyborg a západní Karélie
 ('kal',[(8.0,54.38),(11.5,54.38),(11.5,55.2),(8.0,55.2)]),                                         # Šlesvicko
 ('kar',[(31.75,36.0),(33.5,36.0),(33.5,37.4),(31.75,37.4)]),                                       # Alanya (Karaman)
 ('nap',[(13.0,40.8),(14.3,40.8),(14.3,41.42),(13.0,41.42)]),                                       # jih Latina (Fondi, Gaeta)
 ('mor',[(20.8,37.4),(22.5,37.4),(22.5,38.33),(20.8,38.33)]),                                       # Achaia a Élida (Patras)
 ('rho',[(26.55,35.3),(28.3,35.3),(28.3,37.55),(26.55,37.55)]),                                     # Dodekanés – johanité
 ('lit',[(33.5,53.9),(35.6,53.9),(35.6,54.9),(33.5,54.9)]),                                         # západ Kalužska
]
