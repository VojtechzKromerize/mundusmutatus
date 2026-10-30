"""Sjednocení pojmů ve Vojtových textech pravidel (kouzla, předměty, featy) – rozhodnutí Vojty 2026-10-24.

Texty samy nejsou v repozitáři (jen v databázi pro přihlášené); tady jsou jen pravidla převodu:
  AC místo OČ · vypravěč místo PJ / Pána jeskyně · „pozice kouzla 3. stupně“, „kouzlo 3. stupně“ (úroveň zůstává postavě)
  · vyčerpání místo únavy (Exhaustion) · školy magie: Ochranná magie, Zaklínání, Transmutace…
  · vlastnosti a mistrovství zbraní podle Pravidel › Výbava (Lehkoruká, Univerzální, Dlouhý dosah, Nabíjení; Rozmáchnutí,
    Škrábnutí, Rychlé seknutí, Odstrčení, Oslabení, Zpomalení, Sražení, Vyvedení z rovnováhy)
  · typy zranění jako na webu (mrazivé, prokleté, svaté) · Kapsářství, Umění
  · platina a elektrum v tažení nejsou (stříbro).
Použití: from pojmy_textu import pojmy;  python3 pojmy_textu.py  spustí vlastní kontrolu.
"""
import re

# --- pozice a stupně kouzel ----------------------------------------------------------------------
_STUP = {"úroveň": "stupeň", "úrovně": "stupně", "úrovni": "stupni", "úrovní": "stupněm", "úrovních": "stupních", "úrovním": "stupňům"}
_UROV = "úroveň|úrovně|úrovni|úrovní|úrovních|úrovním"


def _pozice(t):
    # „kouzelnická pozice“ → „pozice kouzla“ (množné číslo „pozic kouzel“)
    jedn = {"á": "pozice", "é": "pozice", "ou": "pozici", "ý": "pozice"}

    def kp(m):
        kon, pad = m.group(1), m.group(2)
        mn = kon in ("ých", "ými", "ým", "ách")
        return f"pozic{pad} kouzel" if mn else f"pozic{pad} kouzla"

    t = re.sub(r"kouzelnick(á|é|ou|ých|ými|ým|ách) pozic(e|i|í|emi|ích|ím|)\b", kp, t)
    t = re.sub(r"Kouzelnick(á|é|ou) pozic(e|i|í)\b", lambda m: "Pozic" + m.group(2) + " kouzla", t)
    t = t.replace("Použití pozice kouzla vyšší úrovně", "Použití pozice kouzla vyššího stupně")
    t = t.replace("Použití pozice kouzla vyššího stupně.", "Použití pozice kouzla vyššího stupně.")
    t = re.sub(r"\bNa vyšších úrovních\.", "Použití pozice kouzla vyššího stupně.", t)
    # „pozice kouzla 3. (či vyšší) úrovně“, „kouzlo 3. úrovně“, „trik … úrovně“ – jen ve spojení s kouzlem či pozicí
    vaz = r"((?:pozic\w*(?: kouzl\w*| kouzel)?|kouzl\w*|kouzel)(?: \w+)?\s+\d\.(?:\s*(?:či|nebo|až)\s*(?:vyšší|nižší|vyššího|nižšího|\d\.))?\s+)(" + _UROV + r")\b"
    t = re.sub(vaz, lambda m: m.group(1) + _STUP[m.group(2)], t)
    t = re.sub(r"(\d\.(?:\s*(?:či|nebo|až)\s*(?:vyšší|nižší|\d\.))?\s+)(" + _UROV + r")(\s+(?:pozic|kouzl|kouzel))", lambda m: m.group(1) + _STUP[m.group(2)] + m.group(3), t)
    t = re.sub(r"\b(vyšší|nižší) (úrovně|úrovni)( pozic| kouzl)", lambda m: {"vyšší": "vyššího", "nižší": "nižšího"}[m.group(1)] + " " + _STUP[m.group(2)] + m.group(3), t)
    t = re.sub(r"každou úroveň (pozic\w*|kouzl\w*)", r"každý stupeň \1", t)
    t = re.sub(r"(za|o) každou úroveň nad", r"\1 každý stupeň nad", t)
    t = re.sub(r"(úrov\w+) (pozice kouzla|kouzla|pozice)(?= (?:nad|vyšš|niž))", lambda m: (_STUP.get(m.group(1), m.group(1))) + " " + m.group(2), t)
    t = re.sub(r"\bpozic(e|i|í|emi|ích) (\d\.)", r"pozic\1 kouzla \2", t)
    t = re.sub(r"\b(úroveň|úrovně|úrovni|úrovní|úrovních|úrovním) (pozic\w* kouzl\w*|pozic\w* kouzel|pozic\w*|kouzla|kouzel)\b", lambda m: _STUP[m.group(1)] + " " + m.group(2), t)
    t = re.sub(r"\b(vyšší|nižší) stupně\b", lambda m: {"vyšší": "vyššího", "nižší": "nižšího"}[m.group(1)] + " stupně", t)
    t = re.sub(r"\b(vyšší|nižší) stupni\b", lambda m: {"vyšší": "vyššímu", "nižší": "nižšímu"}[m.group(1)] + " stupni", t)
    t = t.replace("pozice kouzla kouzla", "pozice kouzla").replace("pozici kouzla kouzla", "pozici kouzla")
    return t


# --- vypravěč místo PJ -------------------------------------------------------------------------------
_PJ_GEN = r"(volby|uvážení|rozhodnutí|určení|pokynu|souhlasu|úsudku|pokynů|vůle|výběru|svolení|uvážení|od|u|do|bez|podle|dle|kromě|pozornosti|rozhodnutím)"


def _vypravec(t):
    t = re.sub(r"\b[Pp]ánovi jeskyně\b", "vypravěči", t)
    t = re.sub(r"\b[Pp]ánem jeskyně\b", "vypravěčem", t)
    t = re.sub(r"\b[Pp]ána jeskyně\b", "vypravěče", t)
    t = re.sub(r"\b[Pp]án jeskyně\b", "vypravěč", t)
    t = re.sub(_PJ_GEN + r" PJ\b", r"\1 vypravěče", t)
    t = re.sub(r"\b(k|ke) PJ\b", r"\1 vypravěči", t)
    t = re.sub(r"\b(s) PJ\b", r"\1 vypravěčem", t)
    t = re.sub(r"\bPJ\b", "vypravěč", t)
    # velké písmeno na začátku věty
    t = re.sub(r"(^|[.!?]\s+|\n\s*|\|\s*)vypravěč", lambda m: m.group(1) + "Vypravěč", t)
    return t


# --- vyčerpání (Exhaustion) --------------------------------------------------------------------------
def _vycerpani(t):
    m = {"stupeň": "úroveň", "stupně": "úrovně", "stupni": "úrovni", "stupňů": "úrovní", "stupních": "úrovních", "stupněm": "úrovní", "stupňům": "úrovním"}
    t = re.sub(r"\b(stupeň|stupně|stupni|stupňů|stupních|stupněm|stupňům) (únavy|vyčerpání)\b", lambda x: m[x.group(1)] + " vyčerpání", t)
    t = re.sub(r"\bstav(u|em|)? únava\b", lambda x: "stav" + (x.group(1) or "") + " vyčerpání", t)
    t = re.sub(r"\bvůči únavě\b", "vůči vyčerpání", t)
    t = re.sub(r"\b(úrove\w+|úrovn\w+) únavy\b", r"\1 vyčerpání", t)
    return t


# --- školy magie ---------------------------------------------------------------------------------------
def _skoly(t):
    t = re.sub(r"\bškol(y|a|e|u|ou) vymítání\b", r"škol\1 ochranné magie", t)
    t = re.sub(r"\bvymítání či věštění\b", "ochranné magie či věštění", t)
    t = re.sub(r"\b(kouzl\w+) vymítání\b", r"\1 ochranné magie", t)
    t = re.sub(r"\bškol(y|a|e|u|ou) (?:evokace|abjurace|přeměny)\b", lambda m: "škol" + m.group(1) + {"evokace": " zaklínání", "abjurace": " ochranné magie", "přeměny": " transmutace"}[m.group(0).split()[-1]], t)
    return t


# --- vlastnosti a mistrovství zbraní (Pravidla › Výbava) -------------------------------------------------
_VL = [
    (r"\b[Vv]ytříben(á|é|ou|ých|ými|ý|ým)\b", lambda m: ("O" if m.group(0)[0] == "V" else "o") + "bratn" + m.group(1)),
    (r"Versatile \((?:Všestranná|Obouruční použití)\)", "Versatile (Univerzální)"),
    (r"\b(?:[Vv]šestrann(?:á|é|ou)|[Oo]bouruční použití)(?= \(\d|\)| \d|;)", "Univerzální"),
    (r"\b([Vv])šestrann(ou|á|é) zbra", lambda m: ("U" if m.group(1) == "V" else "u") + "niverzální zbra"),
    (r"Reach \((?:Dosah|dosah)\)", "Reach (Dlouhý dosah)"),
    (r"reach \(dosah\)", "reach (dlouhý dosah)"),
    (r"\b[Nn]abíjecí\b", lambda m: ("N" if m.group(0)[0] == "N" else "n") + "abíjení"),
    (r"Loading \(Nabíjení\)", "Loading (Nabíjení)"),
]
_MA = {"Cleave": "Rozmáchnutí", "Graze": "Škrábnutí", "Nick": "Rychlé seknutí", "Push": "Odstrčení", "Sap": "Oslabení",
       "Slow": "Zpomalení", "Topple": "Sražení", "Vex": "Vyvedení z rovnováhy"}
_MAVAR = {"Rozetnutí": "Rozmáchnutí", "Rozseknutí": "Rozmáchnutí", "Říznutí": "Rychlé seknutí", "Rozrušení": "Vyvedení z rovnováhy",
          "Rozptýlení": "Vyvedení z rovnováhy", "Obtěžování": "Vyvedení z rovnováhy"}


def mistrovstvi(s):
    """sloupec Weapon Mastery → „Topple (Sražení)“ (jednotný tvar)"""
    if not s:
        return s
    m = re.search(r"\b(Cleave|Graze|Nick|Push|Sap|Slow|Topple|Vex)\b", s)
    return f"{m.group(1)} ({_MA[m.group(1)]})" if m else s


def _zbrane(t):
    for r, n in _VL:
        t = re.sub(r, n, t)
    t = re.sub(r"\b(Cleave|Graze|Nick|Push|Sap|Slow|Topple|Vex) \(([^)]+)\)", lambda m: f"{m.group(1)} ({_MA[m.group(1)]})", t)
    t = re.sub(r"Mistrovství: (\w+) \((\w+)\)", lambda m: f"Mistrovství: {m.group(1)} ({_MA.get(m.group(1), _MAVAR.get(m.group(2), m.group(2)))})", t)
    return t


# --- typy zranění jako na webu (Vojta 2026-10-24: mrazivé, prokleté, svaté) ----------------------------------
_ZR = {"chladn": "mraziv", "nekrotick": "proklet", "zářiv": "svat"}
_ZRADJ = r"(?:kyselinov|drtiv|chladn|mraziv|ohniv|silov|bleskov|nekrotick|proklet|bodn|jedov|psychick|zářiv|svat|sečn|hromov)(?:é|ého|ému|ým|ými|ých)"
_ZRRUN = re.compile(r"(?<![\w])(" + _ZRADJ + r"(?:(?:,\s*|\s+(?:a|nebo|či)\s+|,\s*(?:a|nebo|či)\s+)" + _ZRADJ + r")*)(?=\s+(?:zranění|zraněním)\b|\s*\)|\s+(?:zraněn))")
_ZRSAM = re.compile(r"(?<=vůči )((?:chladn|nekrotick|zářiv)(?:ému|ým))(?=\s+(?:a|i|nebo)\s|\s*[,.;])")


def _zraneni(t):
    def prevod(s):
        return re.sub(r"(chladn|nekrotick|zářiv)(é|ého|ému|ým|ými|ých)", lambda m: _ZR[m.group(1)] + m.group(2), s)

    t = _ZRRUN.sub(lambda m: prevod(m.group(1)), t)
    # výčty typů (aspoň dva za sebou) a „zranění je zářivé…“, „… odolnosti“
    t = re.sub(_ZRADJ + r"(?:(?:,\s*|\s+(?:a|nebo|či)\s+|,\s*(?:a|nebo|či)\s+)" + _ZRADJ + r")+", lambda m: prevod(m.group(0)), t)
    t = re.sub(r"(zranění (?:je|bude|může být) )((?:chladn|nekrotick|zářiv)é)", lambda m: m.group(1) + prevod(m.group(2)), t)
    t = re.sub(r"\b((?:chladn|nekrotick|zářiv)(?:é|ou)) (odolnost\w*)", lambda m: prevod(m.group(1)) + " " + m.group(2), t)
    t = re.sub(r"(\d+k\d+(?:\s*\+\s*\d+)?\s+)((?:chladn|nekrotick|zářiv)(?:é|ého))\b", lambda m: m.group(1) + prevod(m.group(2)), t)
    t = re.sub(r"(\bvůči\s+)((?:chladn|nekrotick|zářiv)ému)\b(?!\s+(?:světlu|záření))", lambda m: m.group(1) + prevod(m.group(2)), t)
    return t


# --- ostatní --------------------------------------------------------------------------------------------
def _ostatni(t):
    t = re.sub(r"\bOČ\b", "AC", t)
    t = t.replace("(Čachry)", "(Kapsářství)").replace("– Čachry", "– Kapsářství").replace("(Vystupování)", "(Umění)")
    t = re.sub(r"\s*\[−\]", "", t)
    t = re.sub(r"\s*\(uveden\w* v této knize\)", "", t)
    t = re.sub(r"\s*Podle SRD jde o [^.]*, ačkoli to není správně\.", "", t)
    t = re.sub(r"\bplatinov(ý|á|é|ou|ých|ými|ým|ého|ému)\b", r"stříbrn\1", t)
    t = re.sub(r"\bplatinou\b", "stříbrem", t)
    t = re.sub(r"\belektrumov(ý|á|é|ou)\b", r"stříbrn\1", t)
    t = t.replace("Mince z elektra", "Stříbrná mince").replace("stříbra, elektra a oceli", "stříbra, zlata a oceli")
    t = t.replace("Kališitský paša", "Calimšanský paša").replace("kališitský paša", "calimšanský paša")
    return t


# --- stavy (Vojta 2026-10-24) -----------------------------------------------------------------------------
# Názvy na webu: Oslepen, Okouzlen, Ohlušen, Vyděšen, Chycen, Neschopný, Neviditelný, Paralyzovaný (Paralyzed), Zkamenělý,
# Otráven, Sražen (Prone), Spoután (Restrained), Omráčen (Stunned), V bezvědomí, Vyčerpání.
_DLOUHE = ("ého", "ému", "ými", "ých", "ým", "ou", "ý", "á", "é", "í")


def _pricesti(t, kmen, kratky, dlouhy, stitek=None):
    """příčestí stavu v kterémkoli tvaru: kmen „[Zz]adrž“ + en… → spoután / spoutaný / spoutání…;
    stitek = tvar pro název stavu s velkým písmenem bez koncovky („Ochromen“ → „Paralyzovaný“)"""

    def f(m):
        vel, e = m.group(1)[0].isupper(), m.group(2) or ""
        pred = t[max(0, m.start() - 12):m.start()]
        if e == "í" and not re.search(r"(jsou|byli|budou|jsou ledem)\s+$", pred):
            w = kratky + "í"  # podstatné jméno: zadržení → spoutání
        else:
            w = (dlouhy if e in _DLOUHE else kratky) + e
        if vel and not e and stitek:
            w = stitek
        return w[0].upper() + w[1:] if vel else w

    return re.sub(rf"\b({kmen})en(ého|ému|ými|ých|ým|ou|ý|á|é|í|a|o|i|y)?\b(?! dechu| upírů)", f, t)


def _predpona(t, stary, novy):
    """stav, který se liší jen začátkem slova (vystrašený → vyděšený), v obou velikostech písmen"""
    t = re.sub(rf"\b{stary}", novy, t)
    return re.sub(rf"\b{stary[0].upper() + stary[1:]}", novy[0].upper() + novy[1:], t)


def stavy_srd(t):
    """český překlad SRD na webu: Ochromen (= Paralyzed) → Paralyzovaný, Zadržen (Restrained) → Spoután"""
    t = _pricesti(t, "[Oo]chrom", "paralyzován", "paralyzovan", "Paralyzovaný")
    t = _pricesti(t, "[Zz]adrž", "spoután", "spoutan")
    return _predpona(t, "vystrašen", "vyděšen")


def _stavy(t):
    """Vojtovy texty: ochromený (= Stunned) → omráčený, zadržený → spoutaný, uchvácený → chycený, vystrašený → vyděšený,
    zmámený → okouzlený, stav ležící → sražený; paralyzovaný (Paralyzed) zůstává"""
    for a, b in (("ochromen", "omráčen"), ("uchvácen", "chycen"), ("vystrašen", "vyděšen"), ("zmámen", "okouzlen")):
        t = _predpona(t, a, b)
    t = _pricesti(t, "[Zz]adrž", "spoután", "spoutan")
    t = re.sub(r"\b(stav|stavu|stavy|stavem|[Jj]e|[Jj]si|[Jj]sem|je tvor|tvor|zůstane|zůstává|zůstaneš|byl|byla|bude|budeš)( ležící)\b", r"\1 sražený", t)
    t = re.sub(r"\b(jsou|byli|budou)( ležící)\b", r"\1 sražení", t)
    t = re.sub(r"\b(je cíl|dopadne|padne|zůstane) ležící\b", r"\1 sražený", t)
    t = re.sub(r"\bstane ležícím\b", "stane sraženým", t)
    t = t.replace("do ležícího stavu", "do stavu sražený").replace("do ležící polohy", "k zemi")
    return t


def pojmy(t):
    """celý převod jednoho textu"""
    if not t:
        return t
    t = str(t)
    for f in (_ostatni, _pozice, _vypravec, _vycerpani, _skoly, _zbrane, _zraneni, _stavy):
        t = f(t)
    return t


if __name__ == "__main__":
    Z = [
        ("Při seslání s použitím kouzelnické pozice 3. či vyšší úrovně", "Při seslání s použitím pozice kouzla 3. či vyššího stupně"),
        ("za každou úroveň kouzelnické pozice nad 1", "za každý stupeň pozice kouzla nad 1"),
        ("Použití kouzelnické pozice vyšší úrovně. Léčení", "Použití pozice kouzla vyššího stupně. Léčení"),
        ("Na vyšších úrovních. Když", "Použití pozice kouzla vyššího stupně. Když"),
        ("napodobit kterékoli jiné kouzlo 8. či nižší úrovně", "napodobit kterékoli jiné kouzlo 8. či nižšího stupně"),
        ("Zranění se zvýší, když dosáhneš 5. úrovně", "Zranění se zvýší, když dosáhneš 5. úrovně"),
        ("které zvolí PJ nebo určí hodem. PJ hodí 1k100.", "které zvolí vypravěč nebo určí hodem. Vypravěč hodí 1k100."),
        ("podle uvážení PJ", "podle uvážení vypravěče"),
        ("bonus +1 k OČ", "bonus +1 k AC"),
        ("získá 1 stupeň únavy", "získá 1 úroveň vyčerpání"),
        ("imunní vůči stavu únava", "imunní vůči stavu vyčerpání"),
        ("utrpí nekrotické zranění 12k8", "utrpí prokleté zranění 12k8"),
        ("1k10 nekrotického zranění", "1k10 prokletého zranění"),
        ("odolný vůči chladnému a nekrotickému zranění", "odolný vůči mrazivému a prokletému zranění"),
        ("zvol kyselinové, chladné, ohnivé nebo bleskové zranění", "zvol kyselinové, mrazivé, ohnivé nebo bleskové zranění"),
        ("vyzařuje zářivé světlo", "vyzařuje zářivé světlo"),
        ("ze školy vymítání či věštění", "ze školy ochranné magie či věštění"),
        ("zbraň s vlastností Vytříbená", "zbraň s vlastností Lehkoruká"),
        ("Versatile (Všestranná) (1k10)", "Versatile (Univerzální) (1k10)"),
        ("Mistrovství: Nick (Škrábnutí)", "Mistrovství: Nick (Rychlé seknutí)"),
        ("ověření DEX (Čachry)", "ověření DEX (Kapsářství)"),
        ("platinový amulet", "stříbrný amulet"),
        ("cíl je ochromený do konce tvého tahu", "cíl je omráčený do konce tvého tahu"),
        ("je paralyzovaný. Zadržený tvor může", "je paralyzovaný. Spoutaný tvor může"),
        ("Při neúspěchu je zadržen a uchvácen", "Při neúspěchu je spoután a chycen"),
        ("jinak je vystrašený, nebo zmámený", "jinak je vyděšený, nebo okouzlený"),
        ("upadne do stavu ležící. Pokud je tvor ležící, může", "upadne do stavu sražený. Pokud je tvor sražený, může"),
        ("předmět ležící na zemi", "předmět ležící na zemi"),
        ("| 7–8 | Jsi ležící a", "| 7–8 | Jsi sražený a"),
        ("je sražen do ležící polohy, je cíl ležící", "je sražen k zemi, je cíl sražený"),
        ("STR proti zadržení. Zadržení dechu nepomůže.", "STR proti spoutání. Zadržení dechu nepomůže."),
        ("Ochromující úder", "Ochromující úder"),
    ]
    S = [
        ("cíl má stav Ochromen (Paralyzed) a je ochromen", "cíl má stav Paralyzovaný (Paralyzed) a je paralyzován"),
        ("stav Zadržen (Restrained). Zadržený tvor; Zadrženého tvora", "stav Spoután (Restrained). Spoutaný tvor; Spoutaného tvora"),
        ("jsou ledem zadrženi; jsou zadržení", "jsou ledem spoutáni; jsou spoutaní"),
        ("Zadržení dechu proti jedům", "Zadržení dechu proti jedům"),
    ]
    chyby = 0
    for fn, L in ((pojmy, Z), (stavy_srd, S)):
        for a, b in L:
            if fn(a) != b:
                chyby += 1
                print("CHYBA:", fn.__name__, repr(a), "→", repr(fn(a)), "čekáno", repr(b))
    print("pojmy_textu: v pořádku" if not chyby else f"pojmy_textu: {chyby} chyb")
    raise SystemExit(1 if chyby else 0)
