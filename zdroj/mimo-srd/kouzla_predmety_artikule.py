"""Úpravy kouzel a předmětů z Artikulí (Vojta 2026-10-24) – rámečky, které převodník kouzla_predmety_plne.py připojí k plnému znění.

ZASADY = obecné zásady (kód → (název rámečku, text)); stejné znění je v Artikulích › Kouzla a předměty (03-artikule.js).
PRIRAZENI = které kouzlo či předmět dostane který rámeček; klíč je anglický název z Vojtovy tabulky, „*“ na konci = všechny
varianty začínající tímto názvem (+1/+2/+3, barvy, stupně). VLASTNI = rámečky jen pro jednu položku (název, text).
VYRADIT = položky, které do tažení nepatří (lodě do vesmíru, vzducholodě, moderní technika).
"""

ZASADY = {
    "LEC": ("Léčení na 0 HP", "Postavu na 0 HP během boje léčení jen stabilizuje; do boje ji vrátí jen Lesser či Greater Restoration."),
    "NAVRAT": ("Návrat do boje", "Postavu na 0 HP, kterou léčení jen stabilizovalo, vrátí do boje."),
    "VZK": ("Vzkříšení", "Je to vzkříšení: smí se jen jednou a zanechá Znamení návratu. Rozervanou duši nevzkřísí."),
    "DUSE": ("Rozervaná duše", "Tvora, jehož duši či tělo tento účinek pohltil nebo zničil, běžná kouzla nevzkřísí – jako Rozervanou duši."),
    "SMRT": ("Okamžitá smrt", "Postavu hráče ani soka nezabije na místě: místo smrti utrží Smrtelné kritické zranění. Pacholek umírá."),
    "NULA": ("Pád na 0 HP", "Zůstaneš na 1 HP a při vědomí, ale hod na kritické zranění a úroveň vyčerpání platí, jako bys padl."),
    "KRIT": ("Kritický zásah", "Nespustí se, když cíl kritický zásah obětováním zbroje či štítu změní v běžný."),
    "KRIT19": ("Rozsah kritu", "Nesčítá se s perkem Ostrá: kritický zásah nejvýš na 19–20."),
    "BPS": ("Odolnost a zbroj", "Odolnost vůči drtivému, bodnému a sečnému zranění se se zbrojí nesčítá. Kdo ji už má ze zbroje, získá místo ní toto: na jeho odolnost nepůsobí perky Drtivá a Průrazná."),
    "PRORAZ": ("Odolnost zbroje", "Prorazí i odolnost zbroje vůči sečnému zranění, jako perky Drtivá a Průrazná."),
    "ACBEZ": ("AC bez zbroje", "Dává jen AC: žádnou odolnost zbroje a nic, co by šlo obětovat při kritickém zásahu."),
    "INI": ("Pohotovost", "Místo výhody či bonusu k iniciativě: jednou za boj uskutečníš svůj tah před tahem libovolného nepřítele."),
    "SLOT": ("Iniciativa ve slotech", "Přivolaný tvor jedná ve slotu svého pána hned po něm a vlastní slot nezabírá; vymkne-li se, jedná ve slotech vypravěče."),
    "K20": ("Kostka Závoje", "Přehoz nebo úprava hodu k20 Kostku Závoje nemění – platí výsledek Závoje z původního hodu. Nastavená 20 není přirozená 20."),
    "VYC": ("Vyčerpání", "Chrání jen před vyčerpáním z námahy a ze zbroje, ne před vyčerpáním ze zranění a z pádu na 0 HP."),
    "HOUF": ("Houf", "Tři a víc stejných přivolaných či oživených tvorů jedná jako houf pacholků (5 HP každý, jeden hod za houf)."),
    "HOUFCIL": ("Houf jako cíl", "Houf pacholků je pro toto kouzlo jeden cíl s jedním záchranným hodem."),
    "SFERY": ("Sféry za Závojem", "Sféry jsou místa za Závojem: Horní sféry jsou Nebe; Devět pekel, Propast a Avernus jsou Peklo; Vílí divočina a Stínopád jsou říše víl a mrtvých."),
    "BOZ": ("Víra", "Odpovídá a pomáhá ten, ke komu se postava modlí podle svého vyznání: Bůh skrze světce a anděly, u starověrců Staří bohové a předkové – nebo ďábel."),
    "DABEL": ("Vyvolání ďábla", "Vyvolat ďábla nebo démona je všední hřích (1 bod hříchu)."),
    "BOHOVE": ("Bohové", "Bohové jiných světů jsou v tažení Staří bohové starověrců; přínosy podmíněné zbožností dostane postava se Svědomím V milosti (8–10)."),
    "DRACI": ("Draci", "Barvy draků jsou v tažení plemena podle živlu: oheň (červený, zlatý, mosazný) plivník či etnský drak, kyselina (černý, měděný) bojištník, jed (zelený) ostnatka či lindwurm, blesk (modrý, bronzový) hromová saň, mráz (bílý, stříbrný) firnový drak."),
    "PALNE": ("Palné zbraně", "Pistol je píšťala, Musket hákovnice: nepřesné, ničivé, prorážejí zbroj (perky Průrazná a Hrom a kouř!). Jiné palné zbraně v tažení nejsou."),
}

_HEAL = ["Cure Wounds", "Healing Word", "Mass Cure Wounds", "Mass Healing Word", "Healing Spirit", "Aura of Vitality", "Life Transference",
         "Conjure Celestial", "Alustriel's Mooncloak", "Prayer of Healing", "Potion of Healing*", "Keoghtom's Ointment", "Longbow of the Healing Hearth",
         "Mariner's Armor*", "Staff of Healing", "Starshot Crossbow", "+1 Fate Dealer's Deck*", "+2 Fate Dealer's Deck*", "+3 Fate Dealer's Deck*",
         "Devotee's Censer", "Wakened Dragon Vessel", "Wither and Bloom", "Necklace of Prayer Beads", "Dawnbringer", "Breastplate of Balance",
         "Queen Ehlissa's Marvelous Nightingale", "Beacon of Hope", "Goodberry"]
_VZK = ["Clone", "Reincarnate", "Cauldron of Rebirth", "Deck of Many More Things", "Deck of Many Things", "Reincarnation Dust", "Ring of Temporal Salvation",
        "Rod of Resurrection", "Steel", "Teeth of Dahlver-Nar", "Universal Pantograph", "White Ghost Orchid Seed"]
_DUSE = ["Blackrazor", "Book of Vile Darkness*", "Hellfire Weapon*", "Rakdos Riteknife", "Soul Cage", "Soul Coin", "Spirit-Binding Censer",
         "Talisman of Pure Good", "Talisman of Ultimate Evil", "Topaz Annihilator", "Voidwalker Armor", "Eye of Vecna", "Sphere of Annihilation",
         "Ruinstone", "Disintegrate", "Ravenous Void", "Baleful Talon"]
_SMRT = ["Power Word Kill", "Vorpal Sword", "Snicker-Snack", "Nine Lives Stealer*", "Life-Sapping Blade*", "Blade of Avernus", "Tearulai", "Orcsplitter",
         "Hammer of Thunderbolts*", "Silver Sword", "Greater Silver Sword"]
_NULA = ["Death Ward", "Deck of Wonder", "Dreamlily", "Ingot of the Skold Rune", "Lifewell Tattoo", "Sanctum Amulet", "Thayan Sword*", "Dueling Ground",
         "Orb of Dragonkind"]
_KRIT = ["Ascendant Dragon's Wrath Weapon*", "Stirring Dragon's Wrath Weapon*", "Slumbering Dragon's Wrath Weapon*", "Wakened Dragon's Wrath Weapon*",
         "Axe of the Dwarvish Lords", "Dyrrn's Tentacle Whip", "Fane-Eater", "Greater Silver Sword", "Silver Sword", "Hammer of Thunderbolts*",
         "Lash of Immolation", "Mace of Smiting*", "Reaper's Scream", "Stonemaker War Pick", "Sword of Life Stealing*", "Sword of Sharpness*",
         "Vicious Weapon*", "Vicious +1 Weapon", "Wave", "Silvered Weapon*", "Staff of the Ivory Claw", "Orcsplitter", "Nine Lives Stealer*",
         "Vorpal Sword", "Snicker-Snack", "Blade of Avernus", "Tearulai", "Baleful Talon", "Namer's Needle", "Ring of Amity", "Jim's Magic Missile",
         "Adamantine Weapon*", "Shatterspike"]
_KRIT19 = ["Butcher's Bib", "Ephixis, Bow of Nylea", "Fate Cutter Shears", "Moonblade", "Sword of Kas", "Baleful Talon"]
_BPS = ["Armor of Invulnerability", "Stonebreaker's Breastplate", "Stoneskin", "Investiture of Stone", "Ghost Step Tattoo", "Glimmering Moonbow",
        "Nimbus Coronet", "Gaseous Form", "Wind Walk", "Potion of Aqueous Form", "Armor of Vulnerability*", "Iron Body", "Warding Bond",
        "Potion of Invulnerability", "Hallow", "Moon Card"]
_PRORAZ = ["Vorpal Sword", "Snicker-Snack", "Blade of Avernus", "Sword of Answering"]
_ACBEZ = ["Mage Armor", "Barkskin", "Bracers of Defense", "Robe of the Archmagi*", "Black Dragon Mask", "Blue Dragon Mask", "Green Dragon Mask",
          "Red Dragon Mask", "White Dragon Mask", "Barrier Tattoo*", "Pride Silk Outfit"]
_INI = ["All-Seeing Blade of the Guardian", "Resistant Blade of the Guardian", "Studious Blade of the Guardian", "Blade of the Guardian",
        "Ascendant Dragon-Touched Focus*", "Slumbering Dragon-Touched Focus*", "Stirring Dragon-Touched Focus*", "Wakened Dragon-Touched Focus*",
        "Helm of Awareness", "Ioun Stone, Awareness", "Peregrine Mask", "Rod of Alertness", "Scorpion Armor", "Sentinel Shield",
        "Shield of the Silver Dragon", "Sword of Kas", "Wave", "Weapon of Warning*", "Eye and Hand of Vecna", "Deck of Wonder"]
_SLOT = ["Animate Objects", "Bag of Tricks*", "Battle Familiar", "Bowl of Commanding Water Elementals", "Brazier of Commanding Fire Elementals",
         "Censer of Controlling Air Elementals", "Stone of Controlling Earth Elementals", "Elemental Gem*", "Find Familiar", "Find Steed",
         "Find Greater Steed", "Magen Handbell", "Mechanical Wonder*", "Plate of Knight's Fellowship", "Staff of Ruling", "Staff of the Python",
         "Weird Tank", "Summon *", "Spirit of Death", "Infernal Calling", "Giant Insect", "Homunculus Servant", "Tiny Servant"]
_K20 = ["Alustriel's Mooncloak", "Blue Dragon Mask", "Chronolometer", "Clockwork Amulet", "Clockwork Armor", "Crystal Ball of Ominous Portent",
        "Deck of Oracles", "Dream Weaver", "Fortune's Favor", "Glibness", "Green Dragon Mask", "Harp of Gilded Plenty", "Jester's Mask",
        "Jewel of Three Prayers*", "Luck Blade*", "Lucky Foot", "Luxon Beacon", "Many Keyholes Dagger", "Mind Sharpener", "Moment of Prescience",
        "Potion of Possibility", "Reweave Fate", "Ruinstone", "Scholar's Anchoring Bangle", "Silvery Barbs", "Spindle of Fate",
        "Staff of Dunamancy", "Wheel of Stars", "White Dragon Mask", "Zone of Amicability", "Stone of Good Luck*"]
_VYC = ["Book of Vile Darkness*", "Akmon, Hammer of Purphoros"]
_HOUF = ["Animate Dead", "Create Undead", "Danse Macabre", "Summon Lesser Demons", "Horn of the Endless Maze", "Horn of Valhalla*", "Wand of Orcus",
         "Crown of Horns", "Crook of Rao", "Pipes of the Sewers", "Teeth of Dahlver-Nar", "Tiny Servant"]
_HOUFCIL = ["Mass Suggestion", "Mass Polymorph", "Rod of Rulership"]
_SFERY = ["Amulet of the Planes", "Plane Shift", "Gate", "Banishment", "Dispel Evil and Good", "Cubic Gate", "Candle of Invocation", "Well of Many Worlds",
          "Sword of the Planes", "Lesser Hammock of Worlds", "Staff of the Magi", "Astral Projection", "Dream of the Blue Veil", "Etherealness",
          "Wish", "Demonomicon of Iggwilv", "Book of Exalted Deeds", "Helm of Devil Command", "Shield of the Hidden Lord", "Sword of Zariel",
          "Tasha's Otherworldly Guise", "Crook of Rao", "Iron Flask", "Wand of Orcus"]
_BOZ = ["Commune", "Divination", "Augury", "Planar Ally", "Contact Other Plane", "Spirit Board", "Summon Celestial", "Ceremony", "Temple of the Gods",
        "Spirit Guardians", "Guardian of Faith", "Divine Word"]
_DABEL = ["Summon Fiend", "Summon Greater Demon", "Summon Lesser Demons", "Infernal Calling", "Mace of the Black Crown*", "Flames Card", "Planar Binding"]
_BOHOVE = ["Khrusor, Spear of Heliod", "Mastix, Whip of Erebos", "Akmon, Hammer of Purphoros", "Ephixis, Bow of Nylea", "Dekella, Bident of Thassa",
           "Helm of the Gods", "Jewel of Three Prayers*", "Crown of Horns", "Holy Star of Mystra"]
_DRACI = ["Dragon Scale Mail", "Black Dragon Scale Mail", "Blue Dragon Scale Mail", "Brass Dragon Scale Mail", "Bronze Dragon Scale Mail",
          "Copper Dragon Scale Mail", "Gold Dragon Scale Mail", "Green Dragon Scale Mail", "Red Dragon Scale Mail", "Silver Dragon Scale Mail",
          "White Dragon Scale Mail", "Black Dragon Mask", "Blue Dragon Mask", "Green Dragon Mask", "Red Dragon Mask", "White Dragon Mask",
          "Ascendant Dragon-Touched Focus*", "Slumbering Dragon-Touched Focus*", "Stirring Dragon-Touched Focus*", "Wakened Dragon-Touched Focus*",
          "Ascendant Dragon's Wrath Weapon*", "Slumbering Dragon's Wrath Weapon*", "Stirring Dragon's Wrath Weapon*", "Wakened Dragon's Wrath Weapon*",
          "Ascendant Dragon Vessel", "Slumbering Dragon Vessel", "Stirring Dragon Vessel", "Wakened Dragon Vessel", "Draakhorn", "Dragon Wing Bow",
          "Flail of Tiamat", "Gold Canary Figurine of Wondrous Power", "Mask of the Dragon Queen", "Orb of Damara", "Orb of Dragonkind",
          "Potion of Dragon's Majesty", "Summon Dragon", "Wyrmskull Throne", "Will of the Talon*", "Shield of the Silver Dragon", "White Dragon Cape",
          "Dragon's Breath", "Potion of Dragon's Breath", "Draconic Transformation", "Fizban's Platinum Shield"]
_PALNE = ["Pistol", "Musket", "Firearm Bullet*", "Topaz Annihilator", "Bloodseeker Ammunition", "Dispelling Ammunition", "Dried Leech",
          "Goading Ammunition", "Walloping Ammunition", "Tinker's Tools"]

PRIRAZENI = {}
for kod, L in (("LEC", _HEAL), ("VZK", _VZK), ("DUSE", _DUSE), ("SMRT", _SMRT), ("NULA", _NULA), ("KRIT", _KRIT), ("KRIT19", _KRIT19), ("BPS", _BPS),
               ("PRORAZ", _PRORAZ), ("ACBEZ", _ACBEZ), ("INI", _INI), ("SLOT", _SLOT), ("K20", _K20), ("VYC", _VYC), ("HOUF", _HOUF),
               ("HOUFCIL", _HOUFCIL), ("SFERY", _SFERY), ("BOZ", _BOZ), ("DABEL", _DABEL), ("BOHOVE", _BOHOVE), ("DRACI", _DRACI), ("PALNE", _PALNE)):
    for n in L:
        PRIRAZENI.setdefault(n, [])
        if kod not in PRIRAZENI[n]:
            PRIRAZENI[n].append(kod)

_MITHRIL = ("Mitril", "Ruší i postihy těžké zbroje z Artikulí (dvojité vyčerpání, spánek ve zbroji, dlouhé oblékání). Odolnost podle druhu zbroje a obětování zůstávají.")
VLASTNI = {
    "Lesser Restoration": [("Návrat do boje", "Postavu na 0 HP, kterou léčení jen stabilizovalo, vrátí do boje. Navíc vyléčí jedno Těžké kritické zranění.")],
    "Greater Restoration": [("Návrat do boje", "Postavu na 0 HP, kterou léčení jen stabilizovalo, vrátí do boje. Navíc vyléčí jedno Vážné kritické zranění.")],
    "Heal": [("Léčení na 0 HP", "Postavu na 0 HP jen stabilizuje, do boje ji nevrátí. Vyléčí ale jedno Vážné kritické zranění.")],
    "Power Word Heal": [("Návrat do boje", "Vrací postavu na 0 HP do boje jako Greater Restoration.")],
    "Mass Heal": [("Návrat do boje", "Vrací postavy na 0 HP do boje jako Greater Restoration.")],
    "Aura of Life": [("Léčení na 0 HP", "Spojence na 0 HP jen stabilizuje (obnoví 1 HP, ale do boje se nevrací).")],
    "Regenerate": [("Kritická zranění", "Obnoví ztracenou končetinu či jinou část těla (trvalý následek Smrtelného zranění); postavu na 0 HP jen stabilizuje.")],
    "Ring of Regeneration": [("Kritická zranění", "Dorůstající končetina vyléčí trvalý následek Smrtelného zranění.")],
    "Raise Dead": [("Vzkříšení", "Je to vzkříšení: smí se jen jednou a zanechá Znamení návratu; Rozervanou duši nevzkřísí. Trvalé následky kritických zranění nehojí.")],
    "Resurrection": [("Vzkříšení", "Je to vzkříšení: smí se jen jednou a zanechá Znamení návratu; Rozervanou duši nevzkřísí. Obnoví i ztracené části těla.")],
    "True Resurrection": [("Vzkříšení", "Je to vzkříšení: smí se jen jednou a zanechá Znamení návratu. Ani toto kouzlo nepřekoná druhé vzkříšení ani Rozervanou duši – to umí jen zázrak.")],
    "Revivify": [("Vzkříšení", "Je to vzkříšení: smí se jen jednou a zanechá Znamení návratu; Rozervanou duši nevzkřísí. Oživená postava je do konce boje mimo hru.")],
    "Wish": [("Přání", "Napodobené vzkříšení podléhá Znamení návratu jako běžné kouzlo. Okamžité zdraví vrací postavy na 0 HP do boje jako Greater Restoration. Opakování hodu nemění Kostku Závoje.")],
    "Gift of Alacrity": [("Pohotovost", "Místo +1k8 k iniciativě: jednou za dobu trvání uskutečníš svůj tah před tahem libovolného nepřítele.")],
    "Blade of Disaster": [("Rozsah kritu", "Kritický zásah na 18–20 je výjimka kouzla 9. stupně; krit změněný obětováním zbroje nic nespouští.")],
    "Adamantine Armor": [("Adamantin", "Místo změny každého kritického zásahu: zbroj snese o 2 obětování víc.")],
    "Mizzium Armor": [("Mizzium", "Místo změny každého kritického zásahu: zbroj snese o 2 obětování víc.")],
    "Guardian Emblem": [("Ochranný znak", "Jednou denně reakcí změníš kritický zásah proti sobě či spojenci do 30 stop v běžný, aniž by se obětovala zbroj.")],
    "Mithral Armor": [_MITHRIL], "Elven Chain": [_MITHRIL], "Vanrak's Mithral Shirt": [_MITHRIL],
    "Spiked Armor": [("Druh zbroje", "Ostnatá zbroj je kroužková: odolnost vůči drtivému a sečnému zranění, obětování 2×.")],
    "Mending": [("Oprava zbroje", "Obětovanou zbroj ani štít neopraví – to umí jen kovář (nebo postava s kovářským nářadím o dlouhém odpočinku).")],
    "Periapt of Wound Closure": [("Hody proti smrti", "Hod proti smrti 9 a nižší smíš změnit na 10 jen jednou denně.")],
    "Charlatan's Die": [("Kostka Závoje", "Nelze ji použít jako Kostku Závoje.")],
    "Shield of the Tortoise": [("Kletba", "Místo hodu iniciativy 1: prokletý hraje vždy v posledním slotu kola a nesmí si slot vyměnit.")],
    "Prosthetic Limb": [("Kritická zranění", "Protézu vyrobí a nasadí jen mistr; nahradí končetinu ztracenou Smrtelným zraněním.")],
    "Ersatz Eye": [("Kritická zranění", "Náhradní oko vyrobí a nasadí jen mistr; nahradí oko ztracené kritickým zraněním.")],
    "Arcane Propulsion Arm": [("Kritická zranění", "Protézu vyrobí a nasadí jen mistr; nahradí paži ztracenou Smrtelným zraněním.")],
    "Repeating Shot": [("Palné zbraně", "Varianta pro píšťalu a hákovnici neruší nabíjení: kouzelné střelivo ano, nabití dál stojí akci podle Artikulí.")],
    "Sniper's Bracelet": [("Palné zbraně", "Píšťala a hákovnice se nabíjejí podle Artikulí i s kouzelným střelivem.")],
    "Smokepowder": [("Střelný prach", "V roce 1458 je střelný prach obyčejná nemagická věc pro píšťaly a hákovnice; magie ho nerozptýlí.")],
    "Gunpowder (keg)": [("Střelný prach", "Prach pro píšťaly a hákovnice; výbuch soudku platí.")],
    "Gunpowder (powder horn)": [("Střelný prach", "Prach pro píšťaly a hákovnice; výbuch prachovnice platí.")],
    "Battle Standard of Infernal Power": [("Odolnost zbroje", "„Magické útoky“ neprorážejí odolnost zbroje.")],
    "Eldritch Claw Tattoo": [("Odolnost zbroje", "„Magické útoky“ neprorážejí odolnost zbroje.")],
}

# položky, které do tažení nepatří (Vojta 2026-10-24: lodě do vesmíru, vzducholodě, vysílačka, granáty s granátometem); typ „Vozidlo (vesmírné)“ celý
VYRADIT = {"Spelljamming Helm", "Create Spelljamming Helm", "Helm of the Scavenger", "Telescopic Transporter", "Wildspace Orrery", "Airship", "Skyship",
           "Fargab", "Concussion Grenade", "Sleep Grenade", "Smoke Grenade", "Platinum"}
VYRADIT_TYP = {"Vozidlo (vesmírné)"}
# řádky v seznamech „Základní předměty“, které do roku 1458 nepatří (anglický název v závorce)
MODERNI = r"\b(Antimatter|Laser|Automatic Rifle|Hunting Rifle|Semiautomatic|Revolver|Shotgun|Energy Cell)\b"
