# Převede Vojtův katalog kouzel (Word) do zdroj/kouzla/katalog.json, ze kterého sestav.py bere texty kouzel.
#   python3 zdroj/kouzla/katalog.py Katalog_Kouzel.docx      (potřebuje pandoc)
# Texty jsou Vojtova vlastní shrnutí; převod jen sjednotí výrazy s webem (1k6 → 1d6, typy zranění anglicky,
# odolnost → Resistance, oprava → modifikátor, pozice → slot), aby na ně navázala automatika karty a Boje.
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))

# kouzla, která SRD vede bez vlastních jmen (D&D Beyond je píše s nimi) – jméno v katalogu → jméno v SRD
SRDJM = {"evard's black tentacles": "Black Tentacles", "melf's acid arrow": "Acid Arrow", "mordenkainen's sword": "Arcane Sword",
         "bigby's hand": "Arcane Hand", "tasha's hideous laughter": "Hideous Laughter", "otto's irresistible dance": "Irresistible Dance",
         "leomund's tiny hut": "Tiny Hut", "otiluke's resilient sphere": "Resilient Sphere", "mordenkainen's private sanctum": "Private Sanctum",
         "nystul's magic aura": "Arcanist's Magic Aura", "rary's telepathic bond": "Telepathic Bond", "drawmij's instant summons": "Instant Summons",
         "mordenkainen's faithful hound": "Faithful Hound", "leomund's secret chest": "Secret Chest", "tenser's floating disk": "Floating Disk",
         "otiluke's freezing sphere": "Freezing Sphere", "mordenkainen's magnificent mansion": "Magnificent Mansion"}
OPRAVJM = {"Spray Of Cards": "Spray of Cards", "Shadow Of Moil": "Shadow of Moil", "Spirit Of Death": "Spirit of Death",
           "Commune With Nature": "Commune with Nature", "Maximillian's Earthen Grasp": "Maximilian's Earthen Grasp"}

# české názvy kouzel, která web dosud neznal
CZ = {"Absorb Elements": "Pohlcení živlů", "Ceremony": "Obřad", "Snare": "Léčka", "Gate Seal": "Pečeť brány", "Druid Grove": "Druidský háj",
 "Fizban's Platinum Shield": "Fizbanův platinový štít", "Primordial Ward": "Prapůvodní ochrana", "Create Bonfire": "Vatra", "Infestation": "Zamoření",
 "Sword Burst": "Výbuch mečů", "Air Bubble": "Vzduchová bublina", "Dust Devil": "Prašný vír", "Healing Spirit": "Léčivý duch",
 "Spray of Cards": "Sprška karet", "Wristpocket": "Kapsa v zápěstí", "Galder's Tower": "Galderova věž", "Summon Shadowspawn": "Vyvolání stínozplozence",
 "Find Greater Steed": "Nalezení vznešeného oře", "Galder's Speedy Courier": "Galderův rychlý posel", "Summon Greater Demon": "Vyvolání vyššího démona",
 "Conjure Volley": "Vyčarovaná salva", "Far Step": "Daleký krok", "Summon Fiend": "Vyvolání běsa", "Dream of the Blue Veil": "Sen o Modrém závoji",
 "Temple of the Gods": "Chrám bohů", "Mighty Fortress": "Mocná pevnost", "Reality Break": "Zlom skutečnosti", "Beast Bond": "Pouto se zvířetem",
 "Gift of Alacrity": "Dar čilosti", "Borrowed Knowledge": "Vypůjčené vědění", "Fortune's Favor": "Přízeň štěstěny", "Warp Sense": "Vnímání průchodů",
 "Encode Thoughts": "Zakódování myšlenek", "Silvery Barbs": "Stříbrné šlehy", "Gift of Gab": "Dar výmluvnosti", "Jim's Glowing Coin": "Jimův zářící groš",
 "Tasha's Mind Whip": "Tašin bič mysli", "Antagonize": "Popuzení", "Incite Greed": "Podnícení chamtivosti",
 "Raulothim's Psychic Lance": "Raulothimovo psychické kopí", "Staggering Smite": "Ohromující úder", "Power Word Pain": "Slovo moci: bolest",
 "Booming Blade": "Hřmící čepel", "Frostbite": "Omrzlina", "Green-Flame Blade": "Čepel zeleného plamene", "Lightning Lure": "Blesková návnada",
 "Word of Radiance": "Slovo záře", "Chaos Bolt": "Střela chaosu", "Earth Tremor": "Otřes země", "Frost Fingers": "Mrazivé prsty",
 "Jim's Magic Missile": "Jimova magická střela", "Tasha's Caustic Brew": "Tašin leptavý odvar", "Aganazzar's Scorcher": "Aganazzarův sežeh",
 "Rime's Binding Ice": "Rimeův poutající led", "Snilloc's Snowball Swarm": "Snillocův roj sněhových koulí", "Warding Wind": "Ochranný vítr",
 "Blinding Smite": "Oslepující úder", "Crusader's Mantle": "Křižácký plášť", "Melf's Minute Meteors": "Melfovy drobné meteory",
 "Pulse Wave": "Pulzní vlna", "Gravity Sinkhole": "Gravitační propad", "Immolation": "Upálení", "Gravity Fissure": "Gravitační trhlina",
 "Dark Star": "Temná hvězda", "Ravenous Void": "Hladová prázdnota", "Distort Value": "Zkreslení ceny", "Sapping Sting": "Vysávající bodnutí",
 "Cause Fear": "Nahnání strachu", "Spirit Shroud": "Duchovní rubáš", "Summon Undead": "Vyvolání nemrtvého", "Shadow of Moil": "Stín zmaru",
 "Spirit of Death": "Duch smrti", "Danse Macabre": "Tanec smrti", "Enervation": "Vysílení", "Tether Essence": "Spoutání podstat",
 "Time Ravage": "Zhouba času", "Control Flames": "Vláda nad plameny", "Gust": "Poryv", "Magic Stone": "Kouzelný kámen", "Mold Earth": "Tvarování země",
 "Primal Savagery": "Prvotní divokost", "Shape Water": "Tvarování vody", "Catapult": "Katapult", "Magnify Gravity": "Zesílení tíže",
 "Zephyr Strike": "Úder vánku", "Kinetic Jaunt": "Kinetický skok", "Maximilian's Earthen Grasp": "Maximilianův zemní stisk",
 "Pyrotechnics": "Ohňostroj", "Ashardalon's Stride": "Ashardalonův krok", "Flame Arrows": "Plamenné šípy", "Lightning Arrow": "Bleskový šíp",
 "Guardian of Nature": "Strážce přírody", "Create Spelljamming Helm": "Vytvoření lodního kormidla", "Temporal Shunt": "Časový posun",
 "Transmute Rock": "Přeměna skály", "Create Homunculus": "Stvoření homunkula", "Tasha's Otherworldly Guise": "Tašina jinosvětská podoba",
 "Create Magen": "Stvoření magena", "Draconic Transformation": "Dračí proměna"}
# povolání u kouzel, která web dosud neznal (katalog je neuvádí; doplněno podle příruček, kde kouzlo vyšlo)
B, K_, Dr, Pa, H, C, Ce, Ko = "Bard", "Klerik", "Druid", "Paladin", "Hraničář", "Čaroděj", "Černokněžník", "Kouzelník"
POV = {"Absorb Elements": [Dr, H, C, Ko], "Ceremony": [K_, Pa], "Snare": [Dr, H, Ko], "Gate Seal": [C, Ce, Ko], "Druid Grove": [Dr],
 "Fizban's Platinum Shield": [C, Ko], "Primordial Ward": [Dr], "Create Bonfire": [Dr, C, Ce, Ko], "Infestation": [Dr, C, Ce, Ko],
 "Sword Burst": [C, Ce, Ko], "Air Bubble": [Dr, H, C, Ko], "Dust Devil": [Dr, C, Ko], "Healing Spirit": [Dr, H], "Spray of Cards": [B, C, Ce, Ko],
 "Wristpocket": [C, Ko], "Galder's Tower": [Ko], "Summon Shadowspawn": [Ce, Ko], "Find Greater Steed": [Pa], "Galder's Speedy Courier": [Ce, Ko],
 "Summon Greater Demon": [Ce, Ko], "Conjure Volley": [H], "Far Step": [C, Ce, Ko], "Summon Fiend": [Ce, Ko], "Dream of the Blue Veil": [B, C, Ce, Ko],
 "Temple of the Gods": [K_], "Mighty Fortress": [Ko], "Reality Break": [Ko], "Beast Bond": [Dr, H], "Gift of Alacrity": [Ko],
 "Borrowed Knowledge": [B, K_, Ce, Ko], "Fortune's Favor": [Ko], "Warp Sense": [C, Ce, Ko], "Encode Thoughts": [Ko], "Silvery Barbs": [B, C, Ko],
 "Gift of Gab": [B, Ce, Ko], "Jim's Glowing Coin": [B, C, Ce, Ko], "Tasha's Mind Whip": [C, Ko], "Antagonize": [B, C, Ce, Ko],
 "Incite Greed": [K_, Ce, Ko], "Raulothim's Psychic Lance": [B, C, Ce, Ko], "Staggering Smite": [Pa], "Power Word Pain": [C, Ce, Ko],
 "Booming Blade": [C, Ce, Ko], "Frostbite": [Dr, C, Ce, Ko], "Green-Flame Blade": [C, Ce, Ko], "Lightning Lure": [C, Ce, Ko], "Word of Radiance": [K_],
 "Chaos Bolt": [C], "Earth Tremor": [B, Dr, C, Ko], "Frost Fingers": [Ko], "Jim's Magic Missile": [Ko], "Tasha's Caustic Brew": [C, Ko],
 "Aganazzar's Scorcher": [C, Ko], "Rime's Binding Ice": [C, Ko], "Snilloc's Snowball Swarm": [C, Ko], "Warding Wind": [B, Dr, C, Ko],
 "Blinding Smite": [Pa], "Crusader's Mantle": [Pa], "Melf's Minute Meteors": [C, Ko], "Pulse Wave": [Ko], "Gravity Sinkhole": [Ko],
 "Immolation": [C, Ko], "Gravity Fissure": [Ko], "Dark Star": [Ko], "Ravenous Void": [Ko], "Distort Value": [B, Ce, Ko], "Sapping Sting": [Ko],
 "Cause Fear": [Ce, Ko], "Spirit Shroud": [K_, Pa, Ce, Ko], "Summon Undead": [Ce, Ko], "Shadow of Moil": [Ce], "Spirit of Death": [C, Ce, Ko],
 "Danse Macabre": [Ce, Ko], "Enervation": [C, Ce, Ko], "Tether Essence": [Ko], "Time Ravage": [Ko], "Control Flames": [Dr, C, Ko], "Gust": [Dr, C, Ko],
 "Magic Stone": [Dr, Ce], "Mold Earth": [Dr, C, Ko], "Primal Savagery": [Dr], "Shape Water": [Dr, C, Ko], "Catapult": [C, Ko], "Magnify Gravity": [Ko],
 "Zephyr Strike": [H], "Kinetic Jaunt": [B, C, Ko], "Maximilian's Earthen Grasp": [C, Ko], "Pyrotechnics": [B, C, Ko],
 "Ashardalon's Stride": [H, C, Ko], "Flame Arrows": [Dr, H, C, Ko], "Lightning Arrow": [H], "Guardian of Nature": [Dr, H],
 "Create Spelljamming Helm": [Ko], "Temporal Shunt": [Ko], "Transmute Rock": [Dr, Ko], "Create Homunculus": [Ko],
 "Tasha's Otherworldly Guise": [C, Ce, Ko], "Create Magen": [Ko], "Draconic Transformation": [Dr, C, Ko]}

SKOLY = {"Abjuration": "Abjurace", "Conjuration": "Vyvolávání", "Divination": "Věštění", "Enchantment": "Očarování",
         "Evocation": "Evokace", "Illusion": "Iluze", "Necromancy": "Nekromancie", "Transmutation": "Přeměna"}

# ---- sjednocení výrazů s webem ----
TYPY = [("kyselinov", "Acid"), ("chladn", "Cold"), ("ohniv", "Fire"), ("silov", "Force"), ("bleskov", "Lightning"), ("nekrotick", "Necrotic"),
        ("jedov", "Poison"), ("psychick", "Psychic"), ("zářiv", "Radiant"), ("hromov", "Thunder"), ("sečn", "Slashing"), ("bodn", "Piercing"),
        ("drtiv", "Bludgeoning")]
ADJ = r"(?:" + "|".join(s for s, _ in TYPY) + r")\w*"
def typ_en(slovo):
    for s, e in TYPY:
        if slovo.lower().startswith(s): return e
    return slovo
NOUN = [(r"kyselin\w*", "Acid"), (r"chlad\w*", "Cold"), (r"oh(?:eň|ně|ni|něm)", "Fire"), (r"blesk\w*", "Lightning"), (r"jed(?:u|em)?", "Poison"),
        (r"psychick\w*", "Psychic"), (r"silov\w*", "Force"), (r"hrom(?:u|em)?", "Thunder"), (r"nekrotick\w*", "Necrotic"), (r"zářiv\w*", "Radiant")]
TOK = r"(?:" + "|".join(p for p, _ in NOUN) + r"|Acid|Cold|Fire|Force|Lightning|Necrotic|Poison|Psychic|Radiant|Thunder)"
def noun_en(w):
    for p, e in NOUN:
        if re.fullmatch(p, w, flags=re.I): return e
    return w
def typy_listy(t):
    # „kyseliny/chladu/ohně“, „imunita jed/psychické“, „1 kyselina, 2 chlad, …“, „1d6 chladu“
    t = re.sub(rf"\b{TOK}(?:/{TOK})+\b", lambda m: "/".join(noun_en(w) for w in m.group(0).split("/")), t, flags=re.I)
    t = re.sub(rf"\b([1-8]) ({TOK})\b(?=,|\.)", lambda m: m.group(1) + " " + noun_en(m.group(2)), t)
    t = re.sub(r"\b(\d+d\d+|\d+) (chladu|ohně|kyseliny|blesku|jedu|hromu)\b", lambda m: m.group(1) + " " + noun_en(m.group(2)), t)
    t = re.sub(rf"\b(Resistance|Vulnerability|[Ii]munit[auy]) (vůči )?({TOK})\b", lambda m: m.group(1) + " vůči " + noun_en(m.group(3)), t)
    t = re.sub(r"\b[Ii]munit[auy]\b(?= (?:vůči )?(?:Acid|Cold|Fire|Force|Lightning|Necrotic|Poison|Psychic|Radiant|Thunder))", "Immunity", t)
    return t
def typy(t):
    # „8k6 ohnivého zranění“, „kyselinové, chladné nebo ohnivé zranění“ → „Fire zranění“, „Acid, Cold nebo Fire zranění“
    def rep(m):
        return re.sub(ADJ, lambda q: typ_en(q.group(0)), m.group(0))
    t = re.sub(rf"\b{ADJ}(?:(?:,\s*|\s+(?:a|nebo|či)\s+|/){ADJ})*\s+zranění", rep, t, flags=re.I)
    # „imunita nekrotické/jed“ apod. v krátkých statistikách vyvolaných bytostí
    t = re.sub(rf"\b{ADJ}(?=/)", lambda q: typ_en(q.group(0)), t, flags=re.I)
    return t
OPR = [(r"\btvá oprava sesílací vlastnosti", "tvůj modifikátor sesílací vlastnosti"), (r"\btvou opravu sesílací vlastnosti", "tvůj modifikátor sesílací vlastnosti"),
       (r"\btvé opravy sesílací vlastnosti", "tvého modifikátoru sesílací vlastnosti"), (r"\boprava sesílací vlastnosti", "modifikátor sesílací vlastnosti"),
       (r"\bopravu sesílací vlastnosti", "modifikátor sesílací vlastnosti"), (r"\bopravy sesílací vlastnosti", "modifikátoru sesílací vlastnosti"),
       (r"\bopravě sesílací vlastnosti", "modifikátoru sesílací vlastnosti"), (r"\bopravou sesílací vlastnosti", "modifikátorem sesílací vlastnosti"),
       (r"\btvou opravou\b", "tvým modifikátorem sesílací vlastnosti"), (r"\bopravu tvé (STR|DEX|CON|INT|WIS|CHA)\b", r"modifikátor tvé \1"),
       (r"\boprava útoku kouzlem\b", "bonus k útoku kouzlem"), (r"\bopravy se přičtou\b", "modifikátory se přičtou"),
       (r"\btvé sesílací opravě\b", "tvému modifikátoru sesílací vlastnosti"), (r"\btvou sesílací opravu\b", "tvůj modifikátor sesílací vlastnosti"),
       (r"\btvou útočnou opravou\b", "tvým bonusem k útoku kouzlem"), (r"\bběžná oprava vlastnosti\b", "běžný modifikátor vlastnosti"),
       (r"\boprava (STR|DEX|CON|INT|WIS|CHA)\b", r"modifikátor \1"), (r"\+oprava (STR|DEX|CON|INT|WIS|CHA)\b", r"+modifikátor \1"),
       (r"\+oprava\b", "+modifikátor sesílací vlastnosti"), (r"\btvá oprava\b", "tvůj bonus k útoku kouzlem")]
def sjednot(t):
    if not t: return t
    t = t.replace("\\'", "'").replace("’", "'").replace("\\\n", "\n").replace("--", "–")
    t = re.sub(r"\b(\d*)k(4|6|8|10|12|20|100)\b", r"\1d\2", t)              # 1k6 → 1d6, k20 → d20
    t = re.sub(r"\bOČ(?=\b|\d)", "AC", t)
    # záchranný hod na DEX → DEX záchranný hod (tak ho čte automatika i zbytek webu)
    # (u „výhoda na záchranné hody na CON“ pořadí zůstane – nejde o záchranu proti kouzlu)
    t = re.sub(r"(\b(?:ne)?výhod\w*\s+(?:na|při|k|ke|ve)\s+)?\b(záchrann\w*\s+hod\w*)\s+na\s+(STR|DEX|CON|INT|WIS|CHA)\b",
               lambda m: m.group(0) if m.group(1) else f"{m.group(3)} {m.group(2)}", t)
    t = re.sub(r"\b(záchrann\w*)\s+na\s+(STR|DEX|CON|INT|WIS|CHA)\b", r"\2 \1", t)
    t = typy(t)
    t = re.sub(r"\bodolnost(i?)\b", r"Resistance", t)
    t = re.sub(r"\bzranitelnost(i?)\b", "Vulnerability", t)
    t = typy_listy(t)
    t = re.sub(r"\bimunit[auy]\b(?=\s+(?:vůči\s+)?(?:Acid|Cold|Fire|Force|Lightning|Necrotic|Poison|Psychic|Radiant|Thunder|Slashing|Piercing|Bludgeoning|veškerému))", "Immunity", t)
    for a, b in OPR: t = re.sub(a, b, t)
    # léčení a životy: web všude píše HP
    t = re.sub(r"\bživoty v počtu\b", "HP ve výši", t)
    t = re.sub(r"\b(dočasn\w+\s+)?život(y|ů|ům|a|ech|em)?\b(?!\s+(?:postavy|sesilatele)\b)", lambda m: (m.group(1) or "") + "HP", t)
    t = re.sub(r"\bza HP\b", "za život", t)                                    # „jednou za život“
    t = re.sub(r"\b[Pp]ři úspěchu (?:utrpí )?(?:jen |pouze )?polovinu(?: zranění)?", "při úspěchu poloviční zranění", t)
    t = re.sub(r"\b[Úú]spěch (?:znamená )?(?:jen |pouze )?polovin[au](?: zranění)?", "Při úspěchu poloviční zranění", t)
    t = re.sub(r"\. při úspěchu poloviční", ". Při úspěchu poloviční", t)
    # pozice (= slot kouzla)
    t = re.sub(r"za každou úroveň pozice nad (\d)\.? ?(?:úrovní|úroveň)?", r"za každou úroveň slotu kouzla nad \1", t)
    t = re.sub(r"za (?:každou )?pozici nad (\d)\.?", r"za každou úroveň slotu kouzla nad \1", t)
    t = re.sub(r"za každou úroveň pozice\b", "za každou úroveň slotu kouzla", t)
    t = re.sub(r"\+1 paprsek za\b", "o jeden paprsek navíc za", t)
    t = re.sub(r"\+1 (?:bytost|cíl) za\b", "můžeš zacílit jednoho dalšího tvora za", t)
    t = re.sub(r"\+(\d+) (?:bytosti|bytostí|cíle|cílů) za\b", r"můžeš zacílit o \1 tvory navíc za", t)
    t = re.sub(r"\bKouzelnická pozice použitá\b", "Slot kouzla použitý", t)
    t = re.sub(r"\b[Kk]ouzelnick(á|é|ou) pozic(e|i)\b", lambda m: "slot kouzla" if m.group(2) == "i" or m.group(1) == "á" else "sloty kouzel", t)
    t = re.sub(r"\b(\d)\.–(\d)\.\s*pozice\b", r"sloty \1.–\2. úrovně", t)
    t = re.sub(r"\b(\d)\.\s*pozice\b", r"slot \1. úrovně", t)
    t = re.sub(r"\+1 střela za\b", "o jednu střelu navíc za", t)
    t = re.sub(r"\b[Pp]ozice (\d)\+", r"slot \1. úrovně a vyšší", t)
    t = re.sub(r"\bpoužit(á|é) pozice\b", lambda m: "použitý slot" if m.group(1) == "á" else "použitého slotu", t)
    t = re.sub(r"\bNa (\d)\. pozici\b", r"Ze slotu \1. úrovně", t)
    t = re.sub(r"\bkolik je použitá pozice\b", "kolik je úroveň použitého slotu", t)
    t = re.sub(r"\búroveň pozice L\b", "úroveň slotu L", t)
    t = re.sub(r"\bobě pozice\b", "oba sloty", t)
    t = re.sub(r"\b[Pp]ozice\b", "slot", t)
    t = re.sub(r"\bpozici\b", "slot", t)
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()

RUST = {  # „Růst triku“ s chybnou šablonou v katalogu – opraveno ručně
 "Booming Blade": "Zranění při zásahu se zvýší o 1d8 Thunder na 5. úrovni postavy, o 2d8 na 11. a o 3d8 na 17.; zranění za pohyb bude 2d8, 3d8 a 4d8 Thunder.",
 "Eldritch Blast": "Počet paprsků se zvýší na 2 na 5. úrovni postavy, na 3 na 11. a na 4 na 17. úrovni.",
 "Toll the Dead": "Kostky zranění se zvýší na 2 na 5. úrovni postavy, na 3 na 11. a na 4 na 17. úrovni (stále d8, resp. d12).",
}
def rust(n, t):
    if n in RUST: return RUST[n]
    if re.search(r"nezvyšuje", t): return ""
    m = re.search(r"na 17\. úrovni na 4k(\d+)", t)
    if m and re.search(r"se hodnota zvýší na 2(?:k\d+)?, na 11\. úrovni na 3", t):
        s = m.group(1)
        return f"Zranění se zvýší na 2d{s} na 5. úrovni postavy, na 3d{s} na 11. a na 4d{s} na 17. úrovni."
    return sjednot(t)

def cas(t):
    t = t.strip(); low = t.lower()
    return {"1 akce": "Akce", "1 bonusová akce": "Bonusová akce", "1 reakce": "Reakce"}.get(low) or (t[0].upper() + t[1:])
def dosah(t):
    t = t.strip().replace("1,000", "1 000").replace("1 mile", "1 míle")
    t = re.sub(r"^[Ss]esilatel", "Sebe", t)
    return t[0].upper() + t[1:]
def trvani(t):
    t = t.strip(); ko = t.lower().startswith("soustředění")
    if ko:
        z = re.sub(r"^soustředění,?\s*", "", t, flags=re.I)
        z = z.replace("až 1 minuta", "až 1 minutu").replace("až 1 hodina", "až 1 hodinu").replace("2 hodin", "2 hodiny")
        return "Concentration, " + z, 1
    t = t.replace("10 Days", "10 dní")
    if t.lower().startswith("až "): t = "až " + t[3:].replace("1 minuta", "1 minutu").replace("1 hodina", "1 hodinu")
    return t[0].upper() + t[1:], 0

def nacti(docx):
    md = subprocess.run(["pandoc", docx, "-t", "markdown", "--wrap=none"], capture_output=True, text=True, check=True).stdout
    out, skola, lvl, cur = [], None, None, None
    def konec():
        if cur: out.append(cur)
    for l in md.split("\n"):
        if l.startswith("# "):
            konec(); cur = None; m = re.search(r"\((\w+)\)|--- (\w+)", l); skola = SKOLY.get(m.group(1) or m.group(2)) if m else None; continue
        if l.startswith("## "):
            konec(); cur = None; lvl = 0 if l[3:].startswith("Triky") else (int(re.search(r"(\d)\.", l).group(1)) if re.search(r"(\d)\.", l) else lvl); continue
        if l.startswith("### "):
            konec(); cur = {"jm": l[4:].strip(), "s": skola, "l": lvl, "b": []}; continue
        if cur is not None: cur["b"].append(l)
    konec()
    return out

def zpracuj(x):
    jm = x["jm"].replace("\\'", "'"); ozn = (re.findall(r"\s+·\s+(.*)$", jm) or [""])[0]; jm = re.sub(r"\s+·\s+.*$", "", jm)
    driv = re.findall(r"\(dříve ([^)]*)\)", jm); jm = re.sub(r"\s*\(dříve [^)]*\)", "", jm).strip(); jm = re.sub(r"(?<=\s)(Of|With|The|And|Or|To|From|In|On)\b", lambda q: q.group(1).lower(), jm); jm = OPRAVJM.get(jm, jm)
    b = "\n".join(x["b"]).strip()
    hl = {}
    for k in ("Seslání", "Dosah", "Trvání", "Složky", "Materiál", "Vyšší pozice", "Růst triku"):
        m = re.search(rf"\*\*{k}:\*\*\s*(.*?)(?=\s*•\s*\*\*|\n\n|$)", b, re.S)
        if m: hl[k] = re.sub(r"\s+", " ", m.group(1)).strip()
    # tělo: odstavce mezi hlavičkou a „Vyšší pozice“ / „Růst triku“
    odst = [p for p in re.split(r"\n\s*\n", b) if p.strip()]
    telo = [p for p in odst if not re.match(r"\s*\*\*(Seslání|Složky|Vyšší pozice|Růst triku):", p)]
    t = "\n\n".join(re.sub(r"[ \t]*\n[ \t]*", " ", p.replace("\\\n", " ")).replace(" ", "\n").strip() for p in telo)
    t = sjednot(t)
    v = hl.get("Vyšší pozice", "")
    if re.search(r"nezesiluje|nejsou k dispozici", v): v = ""
    v = sjednot(v)
    if v: v = v[0].upper() + v[1:]
    if x["l"] == 0 and hl.get("Růst triku"):
        r = rust(jm, hl["Růst triku"])
        if r: t += "\n\n**Zesílení triku.** " + r
        v = ""
    ct = cas(hl.get("Seslání", "Akce")); r = dosah(hl.get("Dosah", "")); d, ko = trvani(hl.get("Trvání", ""))
    k = [s.strip() for s in hl.get("Složky", "").split(",") if s.strip()]
    m = sjednot(re.sub(r"(?<!\b(?:zl|st|md))\.$", "", hl.get("Materiál", "")))
    o = {"en": jm, "l": x["l"], "s": x["s"], "ct": ct, "r": r, "d": d, "ko": ko, "ri": 1 if "rituál" in ozn else 0, "k": k, "m": m, "t": t, "v": v}
    a = list(driv)
    if jm.lower() in SRDJM: a.append(jm); o["en"] = SRDJM[jm.lower()]
    if x["jm"].replace("\\'", "'").startswith("Maximillian"): a.append("Maximillian's Earthen Grasp")
    if a: o["a"] = a
    zn = [z.strip() for z in ozn.split(",") if z.strip() and z.strip() != "rituál"]
    if zn: o["zn"] = zn
    if o["en"] in CZ: o["cz"] = CZ[o["en"]]
    if o["en"] in POV: o["p"] = POV[o["en"]]
    return o

if __name__ == "__main__":
    if len(sys.argv) < 2: raise SystemExit("použití: python3 zdroj/kouzla/katalog.py Katalog_Kouzel.docx")
    K = [zpracuj(x) for x in nacti(sys.argv[1])]
    K.sort(key=lambda q: (q["l"], q["en"]))
    json.dump(K, open(os.path.join(D, "katalog.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"zdroj/kouzla/katalog.json: {len(K)} kouzel")
