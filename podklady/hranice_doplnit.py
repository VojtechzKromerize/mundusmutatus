#!/usr/bin/env python3
"""Hranice zemí a diecézí na celé mapě Koruny (2026-10-28, Vojta: „useknuté hranice, chybí země v Uhrách“).

Mapa se 2026-10-27 rozšířila od Baltu k Jadranu (podklady/koruna_geo.py), ale obrysy zemí (DUCHY_POLY) a diecézí
(DIO_POLY) dřívějšího rozsahu končily rovnou čarou u starého okraje (10,6° a 10,9° v. d., 20,4° v. d., 52,8–53° a 47° s. š.)
a kusy jedné diecéze se nesloučily. Skript nad současnými daty:

  1. sloučí kusy každé země a diecéze v jeden obrys (zmizí švy u starého okraje),
  2. provede operace níže – PRIRAD (kraj patří zemi, bere jen zemím v seznamu „ber“ a prázdné ploše) a VYPLN (jen prázdná plocha),
  3. drobné mezery na souši (do 0,3 čtverečního stupně) přidá sousedovi s nejdelší společnou hranicí,
  4. barvy sousedních zemí na podkladu (NBRS) poskládá ze zemí, aby jejich hranice nešly po dřívějším okraji mapy,
  5. sloučí země mocností vrstvy Hlavní hráči (HRACI v 02) do obrysů HRACI_GEO s místem erbu,
  6. zapíše změněné obrysy do 02b (NBRS, DUCHY_POLY, DIO_POLY, HRACI_GEO), nové země a diecéze do 02 (DUCHY, DIO, DIO_ORDER) mezi značky
     /* hranice_doplnit.py {…} */ a soubory naformátuje Prettierem.

Hranice jsou přibližné (rešerše: Engel o Uhrách, dobové mapy říše); moře se kreslí přes ně, obrysy smějí do moře přesahovat.
Spouštěj z kořene repozitáře AŽ PO koruna_geo.py (ten přepisuje část DUCHY_POLY):
  python3 podklady/hranice_doplnit.py [--ne SLOŽKA] [--zapis] [--obrazek soubor.png]
Bez --zapis jen vypíše, co by změnil, a zbylé mezery. Opakované spuštění nic nezmění.
"""
import math
import os
import re
import subprocess
import sys

from shapely.geometry import Point, Polygon
from shapely.ops import nearest_points, unary_union

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import koruna_geo as KG  # noqa: E402

ARG = sys.argv[1:]
if "--ne" in ARG:
    KG.NE = ARG[ARG.index("--ne") + 1]
ZAPIS = "--zapis" in ARG
OBR = ARG[ARG.index("--obrazek") + 1] if "--obrazek" in ARG else None
SVET = KG.SVET
PALETA = KG.PALETA

# ================================================================ ZEMĚ A KNÍŽECTVÍ (lon, lat)
# Neumark s Toruňskou zemí (Sternberg) leží za Odrou; Braniborsko ji dřív kreslilo jako svou
NMARKA = [(14.4, 53.15), (14.6, 53.1), (14.85, 53.08), (15.1, 53.12), (15.35, 53.25), (15.48, 53.4), (15.6, 53.55), (15.62, 53.72), (15.72, 53.82),
          (15.9, 53.8), (16.05, 53.65), (16.12, 53.5), (16.15, 53.3), (16.05, 53.1), (15.95, 52.95), (15.85, 52.85), (15.75, 52.6), (15.6, 52.4),
          (15.4, 52.28), (15.05, 52.2), (14.75, 52.25), (14.6, 52.36), (14.63, 52.55), (14.55, 52.75), (14.38, 52.95)]
# Krajna (Nakło, Więcbork) patří k Velkopolsku, Bydhošť a Inowrocław ke Kujavsku
KRAJNA = [(17.18, 52.85), (17.3, 53.5), (17.85, 53.5), (17.8, 53.3), (17.72, 53.1), (17.75, 52.95), (17.85, 52.8), (17.6, 52.75)]
# hřeben Alp mezi Salcburskem a Štýrskem na severu a Korutany s Gorickem na jihu (dřív rovná čára po 47° s. š.)
ALPY = [(12.2, 47.1), (12.45, 47.08), (12.75, 47.1), (12.95, 47.02), (13.15, 47.06), (13.35, 47.1), (13.6, 47.02), (13.8, 46.97), (14.0, 46.98),
        (14.2, 47.05), (14.45, 47.02), (14.7, 47.06), (14.85, 47.05)]
# Lech: hranice Bavor a Augšpurska
LECH = [(10.7, 47.5), (10.75, 47.65), (10.85, 47.85), (10.88, 48.1), (10.9, 48.37), (10.92, 48.55), (10.95, 48.72)]
# Sáva od ústí Driny k Bělehradu (Mačva leží jižně od ní)
SAVA_V = [(19.36, 44.89), (19.6, 44.8), (19.75, 44.77), (19.95, 44.78), (20.15, 44.85), (20.3, 44.83), (20.46, 44.82)]

L = KG.L
REV = KG.REV

# (operace, id, [prstence], ber) – PRIRAD bere zemím v „ber“, VYPLN jen prázdné ploše; pořadí rozhoduje
ZEME_OPS = [
    ("PRIRAD", "nmk", [NMARKA], ["brb"]),
    ("PRIRAD", "vlp", [KRAJNA], ["kuj"]),
    ("PRIRAD", "kor", [L(ALPY[4:], [(14.85, 46.8), (13.15, 46.8)])], ["slz", "sty"]),
    ("PRIRAD", "slz", [L(ALPY[1:9], [(14.0, 47.3), (12.45, 47.3)])], ["kor", "gor"]),
    ("PRIRAD", "sty", [L(ALPY[8:], [(14.85, 47.3), (14.0, 47.3)])], ["kor"]),
    # ---- západ: od Hesenska po Rétii (dřív prázdný pruh 9,25–10,6° v. d.)
    ("PRIRAD", "hen", [[(10.05, 50.55), (10.15, 50.75), (10.35, 50.78), (10.55, 50.72), (10.8, 50.66), (10.95, 50.55), (10.9, 50.4), (10.7, 50.3),
                        (10.45, 50.28), (10.2, 50.35)]], ["thu"]),
    ("VYPLN", "thu", [[(10.6, 51.35), (10.45, 51.33), (10.3, 51.26), (10.18, 51.18), (10.22, 51.05), (10.12, 50.95), (10.1, 50.8), (10.35, 50.78),
                       (10.6, 50.72)]], []),
    ("VYPLN", "eic", [[(9.95, 51.62), (10.35, 51.62), (10.6, 51.5), (10.6, 51.33), (10.45, 51.33), (10.3, 51.26), (10.15, 51.2), (9.95, 51.3),
                       (9.9, 51.45)]], []),
    ("PRIRAD", "hil", [[(9.75, 52.25), (10.1, 52.3), (10.35, 52.15), (10.35, 51.95), (10.15, 51.85), (9.95, 51.85), (9.75, 52.0)]], ["lnb"]),
    ("VYPLN", "lnb", [[(9.25, 52.25), (9.85, 52.0), (10.2, 51.95), (10.45, 52.05), (10.6, 52.12), (10.6, 51.5), (10.35, 51.62), (9.95, 51.62),
                       (9.9, 51.45), (9.6, 51.4), (9.5, 51.55), (9.25, 51.7)]], []),
    ("VYPLN", "hes", [[(9.25, 51.7), (9.5, 51.55), (9.6, 51.4), (9.9, 51.45), (9.95, 51.3), (10.15, 51.2), (10.18, 51.18), (10.22, 51.05),
                       (10.12, 50.95), (10.1, 50.8), (9.95, 50.75), (9.7, 50.85), (9.5, 50.9), (9.25, 50.85)]], []),
    ("VYPLN", "ful", [[(9.25, 50.85), (9.5, 50.9), (9.7, 50.85), (9.95, 50.75), (10.1, 50.8), (10.05, 50.55), (10.0, 50.4), (9.75, 50.3),
                       (9.45, 50.35), (9.25, 50.4)]], []),
    ("PRIRAD", "ans", [[(10.6, 49.6), (10.25, 49.55), (10.0, 49.4), (9.95, 49.15), (10.15, 48.95), (10.5, 48.92), (10.8, 48.98), (10.98, 49.12),
                        (10.98, 49.32), (10.85, 49.45)]], ["nur"]),
    ("VYPLN", "wur", [[(9.25, 50.4), (9.45, 50.35), (9.75, 50.3), (10.0, 50.4), (10.05, 50.55), (10.2, 50.35), (10.45, 50.28), (10.6, 50.2),
                       (10.6, 49.6), (10.25, 49.55), (10.0, 49.4), (9.6, 49.4), (9.25, 49.5)]], []),
    ("VYPLN", "wue", [[(9.25, 49.5), (9.6, 49.4), (10.0, 49.4), (9.95, 49.15), (10.15, 48.95), (10.05, 48.7), (9.85, 48.5), (9.6, 48.35),
                       (9.25, 48.3)]], []),
    ("PRIRAD", "aug", [L([(10.5, 48.92), (10.8, 48.98)], REV(LECH), [(10.45, 47.45), (10.3, 47.6), (10.35, 48.0), (10.3, 48.4), (10.4, 48.7)])],
     ["bmu"]),
    ("VYPLN", "sva", [[(9.25, 48.3), (9.6, 48.35), (9.85, 48.5), (10.05, 48.7), (10.15, 48.95), (10.5, 48.92), (10.4, 48.7), (10.3, 48.4),
                       (10.35, 48.0), (10.3, 47.6), (10.45, 47.45), (10.2, 47.38), (10.0, 47.4), (9.75, 47.55), (9.55, 47.55), (9.25, 47.62)]], []),
    ("VYPLN", "shv", [[(9.25, 47.62), (9.55, 47.55), (9.6, 47.5), (9.55, 47.25), (9.6, 47.05), (9.25, 47.05)]], []),
    ("VYPLN", "rae", [[(9.25, 47.05), (9.6, 47.05), (9.85, 47.0), (10.1, 46.85), (10.45, 46.85), (10.5, 46.7), (10.45, 46.55), (10.3, 46.6),
                       (10.15, 46.4), (10.05, 46.3), (9.85, 46.35), (9.55, 46.3), (9.35, 46.5), (9.25, 46.5)]], []),
    # ---- Uhry: země a úřady svatoštěpánské koruny k březnu 1458
    ("PRIRAD", "jis", [[(18.75, 48.45), (18.85, 48.75), (18.95, 48.95), (19.35, 48.98), (19.65, 48.92), (20.05, 49.02), (20.3, 49.2), (20.6, 49.5),
                        (21.0, 49.5), (21.3, 49.5), (21.5, 49.5), (21.85, 49.4), (21.75, 48.95), (21.65, 48.55), (21.3, 48.4), (20.9, 48.35),
                        (20.3, 48.28), (19.65, 48.25), (19.1, 48.2), (18.85, 48.3)]], ["hun"]),
    ("PRIRAD", "spz", [[(20.25, 49.1), (20.4, 48.98), (20.65, 48.92), (20.85, 48.95), (20.8, 49.1), (20.72, 49.2), (20.85, 49.45), (20.6, 49.5),
                        (20.5, 49.3), (20.35, 49.2)]], ["hun", "jis"]),
    ("PRIRAD", "zfr", [[(16.15, 47.2), (16.3, 47.45), (16.35, 47.65), (16.4, 47.85), (16.6, 47.95), (16.75, 47.85), (16.75, 47.6), (16.65, 47.35),
                        (16.5, 47.25)]], ["hun"]),
    ("PRIRAD", "mac", [L([(19.13, 44.52), (19.32, 44.72)], SAVA_V, [(20.5, 44.83), (20.6, 44.7), (20.5, 44.35), (19.0, 44.35)])], ["hun"]),
    ("PRIRAD", "tem", [[(20.15, 46.18), (20.5, 46.17), (20.9, 46.2), (21.3, 46.15), (21.7, 46.08), (22.1, 46.0), (22.35, 45.85), (22.4, 45.55),
                        (22.2, 45.2), (22.0, 44.95), (21.6, 44.75), (21.0, 44.7), (20.55, 44.8), (20.35, 45.1), (20.3, 45.4), (20.1, 45.8)]], ["hun"]),
    ("PRIRAD", "sev", [[(22.2, 45.2), (22.4, 45.55), (22.6, 45.6), (23.3, 45.5), (23.3, 44.1), (22.85, 44.1), (22.6, 44.55), (22.15, 44.5),
                        (22.0, 44.95)]], ["hun"]),
    ("PRIRAD", "sed", [[(22.6, 45.6), (22.35, 45.85), (22.6, 46.1), (22.75, 46.4), (22.65, 46.8), (22.75, 47.1), (22.9, 47.3), (23.3, 47.3),
                        (23.3, 45.5)]], ["hun"]),
    # ---- dřívější okraj mapy: rovné hranice po 10,6° v. d. zvlnit
    ("VLNA", "x", (10.6, 47.4, 52.35), []),
    ("VLNA", "y", (47.0, 12.2, 13.0), []),
]

# nové země: id → (jméno, krátké jméno, rod z desk nebo None, poznámka pro hráče k březnu 1458)
ZEME_META = {
    "hes": ("Lantkrabství hesenské", "Hesensko", None,
            "Lantkrabě Ludvík Pokojný zemřel letos v lednu; jeho synové Ludvík a Jindřich si zemi dělí na dolní Hesensko s Kasselem a horní s Marburkem."),
    "ful": ("Opatství fuldské", "Fulda", None,
            "Světské panství knížecího opata fuldského v Rhönu, při Frankfurtské cestě z Durynska k Mohanu."),
    "hen": ("Hrabství hennebergské", "Henneberk", None,
            "Hrabata z Henneberku sídlí ve Schleusingenu a Römhildu na jižní straně Durynského lesa; drží se saských vévodů i biskupů würzburských."),
    "eic": ("Eichsfeld", "Eichsfeld", None,
            "Kopcovitý kraj s Heiligenstadtem a Duderstadtem, který patří arcibiskupům mohučským; spravuje jej arcibiskupův místodržící."),
    "hil": ("Biskupství hildesheimské", "Hildesheim", None,
            "Světské panství hildesheimských biskupů, sevřené welfskými vévodstvími; o hrady a zástavy se s nimi věčně přou."),
    "ans": ("Ansbašsko (purkrabství norimberské)", "Ansbašsko", "fra",
            "Franské državy Hohenzollernů pod horami, kde v Ansbachu sídlí markrabě Albrecht Achilles, bratr braniborského kurfiřta. S Norimberkem i s Ludvíkem Bohatým se přou o moc zemského soudu."),
    "wur": ("Biskupství würzburské", "Würzburk", None,
            "Biskup würzburský se píše vévodou franským a sídlí na hradě nad Mohanem; říšská města Schweinfurt a Rothenburk si vládnou sama."),
    "wue": ("Hrabství virtemberské", "Virtembersko", None,
            "Země je rozdělena mezi dvě linie: hrabě Oldřich vládne ve Stuttgartu, mladý Eberhard v Urachu."),
    "aug": ("Augšpursko", "Augšpurk", None,
            "Bohaté říšské město Augšpurk mezi Lechem a Dunajem a kolem něho světské panství biskupů augšpurských s Dillingenem a Füssenem."),
    "sva": ("Horní Švábsko", "Švábsko", None,
            "Pestrá změť říšských měst, opatství a hrabství: Ulm vládne rozsáhlému venkovu, Memmingen, Kempten a Lindava se spolčují proti knížatům."),
    "shv": ("Svatý Havel a Appenzell", "Svatý Havel", None,
            "Mocné opatství svatohavelské a jeho horalové z Appenzellu, kteří se spojili se Švýcary a před půl stoletím porazili opata i rakouské rytíře."),
    "rae": ("Tři spolky (Rétie)", "Tři spolky", None,
            "Horské obce Rétie se spolčily ve spolky Boží dům, Šedý a Deseti soudů a samy si spravují údolí Rýna a Innu; biskup churský je jim pánem už jen podle jména."),
    "jis": ("Horní Uhry Jana Jiskry", "Jiskrovy Horní Uhry", None,
            "Kraj od horních měst kolem Kremnice po Košice a Šariš drží jako generální kapitán zesnulého krále Ladislava Jan Jiskra z Brandýsa. Má nejbohatší doly a mincovny země a české žoldnéře na hradech i v dřevěných pevnůstkách; nového krále Matyáše dosud neuznal."),
    "spz": ("Spišská zástava", "Spišská zástava", "jag",
            "Třináct spišských měst s hradem Ľubovňou a Podolíncem drží od roku 1412 v zástavě polská koruna; spravuje je polský starosta na Ľubovni."),
    "zfr": ("Zástavy rakouského domu v západních Uhrách", "Šoproň a zástavy", "hab",
            "Šoproň, Kysek, Forchtenštejn a další hrady na západní hranici Uher drží od roku 1445 císař Fridrich a nevydá je, dokud se s Uhry nesmíří."),
    "mac": ("Banát mačevský a Bělehrad", "Mačva", "hun",
            "Pohraniční banát jižně od Sávy s pevností Bělehradem, kterou roku 1456 ubránil Jan Hunyadi proti sultánu Mehmedovi."),
    "tem": ("Temešsko", "Temešsko", "hun",
            "Úrodná rovina mezi Morušem, Tisou a Dunajem s Temešvárem. Hrabě temešský velí pevnostem na Dunaji a vojsku dolních částí proti Turkům."),
    "sev": ("Banát severinský", "Severin", "hun",
            "Hornatý pohraniční banát u Železných vrat, kde Dunaj prořezává hory; stráží brody proti Turkům i cestu do Valašska."),
    "sed": ("Vojvodství sedmihradské", "Sedmihradsko", "hun",
            "Země za lesy pod vlastním vojvodou: žijí tu uherští zemané, Sikulové, Sasové s bohatými městy a Rumuni. Na západě jí patří jen horské průsmyky."),
}

# ================================================================ DIECÉZE
DIO_OPS = [
    # ---- západ
    ("VYPLN", "dmz", [[(9.25, 50.45), (9.6, 50.55), (9.9, 50.7), (10.25, 50.85), (10.6, 50.75), (10.9, 50.6), (10.9, 51.6), (10.6, 51.65),
                       (10.2, 51.62), (9.9, 51.65), (9.6, 51.55), (9.25, 51.45)]], []),
    ("VYPLN", "dwu", [[(9.25, 49.3), (9.25, 50.45), (9.6, 50.55), (9.9, 50.7), (10.25, 50.85), (10.6, 50.75), (10.9, 50.6), (10.9, 49.6),
                       (10.7, 49.35), (10.4, 49.15), (10.0, 49.05), (9.6, 49.15)]], []),
    ("PRIRAD", "dhb", [[(10.55, 52.05), (10.65, 51.85), (10.6, 51.65), (11.0, 51.6), (11.3, 51.7), (11.45, 51.85), (11.5, 52.05), (11.4, 52.25),
                        (11.15, 52.4), (10.6, 52.35)]], ["dmg", "dbb", "dmz"]),
    ("VYPLN", "dhi", [[(9.25, 51.45), (9.6, 51.55), (9.9, 51.65), (10.2, 51.62), (10.6, 51.65), (10.65, 51.85), (10.55, 52.05), (10.6, 52.35),
                       (10.3, 52.5), (9.95, 52.4), (9.6, 52.35), (9.25, 52.3)]], []),
    ("VYPLN", "dmd", [[(9.25, 52.3), (9.6, 52.35), (9.95, 52.4), (10.05, 52.6), (9.7, 52.75), (9.25, 52.7)]], []),
    ("VYPLN", "dvd", [[(9.25, 52.7), (9.7, 52.75), (10.05, 52.6), (10.3, 52.5), (10.6, 52.35), (10.9, 52.5), (11.3, 52.9), (11.3, 53.1),
                       (10.9, 53.3), (10.6, 53.4), (10.3, 53.42), (10.0, 53.47), (9.8, 53.48), (9.7, 53.4), (9.25, 53.35)]], []),
    ("VYPLN", "dau", [[(10.0, 49.0), (10.5, 49.05), (10.9, 48.9), (10.9, 47.55), (10.6, 47.45), (10.3, 47.45), (10.05, 47.55), (10.0, 47.9),
                       (10.05, 48.4), (9.95, 48.7)]], []),
    ("VYPLN", "dko", [[(9.25, 47.25), (9.6, 47.25), (9.75, 47.5), (10.05, 47.55), (10.0, 47.9), (10.05, 48.4), (9.95, 48.7), (10.0, 49.05),
                       (9.6, 49.15), (9.25, 49.3)]], []),
    ("VYPLN", "dcu", [[(9.25, 46.45), (9.25, 47.25), (9.6, 47.25), (9.85, 47.0), (10.1, 46.85), (10.45, 46.85), (10.9, 46.8), (11.1, 46.7),
                       (10.95, 46.55), (10.5, 46.6), (10.3, 46.6), (10.15, 46.4), (9.85, 46.35), (9.55, 46.3)]], []),
    # ---- Lombardie a Emilie
    ("VYPLN", "dco", [[(9.25, 45.75), (9.25, 46.45), (9.55, 46.3), (9.85, 46.35), (10.15, 46.4), (10.3, 46.3), (10.1, 46.15), (9.6, 46.05),
                       (9.45, 45.8)]], []),
    ("VYPLN", "dbg", [[(9.45, 45.8), (9.6, 46.05), (10.1, 46.15), (10.05, 45.75), (9.9, 45.5), (9.55, 45.45)]], []),
    ("VYPLN", "dbs", [[(10.05, 45.75), (10.1, 46.15), (10.3, 46.3), (10.6, 46.3), (10.75, 45.75), (10.6, 45.45), (10.45, 45.25), (10.0, 45.3),
                       (9.9, 45.5)]], []),
    ("VYPLN", "dml", [[(9.25, 45.0), (9.25, 45.75), (9.45, 45.8), (9.55, 45.45), (9.6, 45.2), (9.5, 45.0)]], []),
    ("VYPLN", "dcr", [[(9.6, 45.2), (9.55, 45.45), (9.9, 45.5), (10.0, 45.3), (10.45, 45.25), (10.5, 45.0), (10.0, 44.95), (9.6, 45.0)]], []),
    ("VYPLN", "dmn", [[(10.45, 45.25), (10.6, 45.45), (10.95, 45.35), (11.3, 45.15), (11.2, 44.95), (10.5, 45.0)]], []),
    ("VYPLN", "dem", [[(9.25, 44.15), (9.25, 45.0), (9.6, 45.0), (10.0, 44.95), (10.5, 45.0), (11.2, 44.95), (11.05, 44.4), (11.05, 44.15)]], []),
    ("VYPLN", "dbl", [[(11.05, 44.15), (11.05, 44.4), (11.2, 44.95), (11.3, 45.15), (11.7, 45.18), (12.3, 45.15), (12.3, 44.85), (12.0, 44.6),
                       (11.7, 44.15)]], []),
    ("VYPLN", "drv", [[(11.7, 44.15), (12.0, 44.6), (12.3, 44.85), (12.5, 44.8), (12.5, 44.15)]], []),
    # ---- Uhry
    ("VYPLN", "deg", [[(20.4, 47.2), (20.4, 49.45), (21.0, 49.45), (21.8, 49.38), (22.3, 49.1), (22.9, 49.0), (23.3, 48.9), (23.3, 47.6),
                       (22.6, 47.7), (22.0, 47.6), (21.4, 47.4), (20.9, 47.2)]], []),
    ("VYPLN", "dvv", [[(20.6, 46.6), (20.9, 47.2), (21.4, 47.4), (22.0, 47.6), (22.6, 47.7), (23.3, 47.6), (23.3, 47.45), (22.8, 47.2), (22.65, 46.8),
                       (22.6, 46.35), (22.0, 46.2), (21.3, 46.2), (20.9, 46.3)]], []),
    ("VYPLN", "dsd", [[(22.35, 45.85), (22.6, 46.35), (22.65, 46.8), (22.8, 47.2), (23.3, 47.45), (23.3, 45.6), (22.6, 45.6)]], []),
    ("VYPLN", "dcs", [[(22.0, 44.95), (22.2, 45.2), (22.4, 45.55), (22.6, 45.6), (23.3, 45.6), (23.3, 44.1), (22.85, 44.1), (22.6, 44.55)]], []),
    ("VYPLN", "dva", [[(18.85, 47.2), (18.85, 47.85), (19.6, 47.9), (20.4, 47.6), (20.6, 47.2), (20.6, 46.6), (20.2, 46.6), (19.3, 46.9)]], []),
    ("VYPLN", "dsr", [[(18.9, 45.3), (19.4, 45.25), (19.9, 45.2), (20.3, 45.15), (20.45, 44.85), (19.95, 44.8), (19.36, 44.89), (18.9, 44.95)],
                      L([(19.13, 44.52), (19.32, 44.72)], SAVA_V, [(20.5, 44.83), (20.4, 44.75), (20.2, 44.55), (19.8, 44.45), (19.4, 44.5)])], []),
    # ---- Polsko a Litva
    ("VYPLN", "dvr", [[(17.8, 50.3), (18.75, 50.3), (18.75, 50.95), (17.8, 50.95)]], []),
    ("VYPLN", "dgn", [[(17.8, 50.95), (19.3, 50.95), (19.3, 51.4), (17.8, 51.4)]], []),
    ("VYPLN", "dkr", [[(20.4, 49.4), (20.4, 51.3), (21.0, 51.6), (21.6, 51.75), (22.2, 51.95), (22.6, 51.85), (22.9, 51.5), (22.9, 51.0), (22.6, 50.6),
                       (22.2, 50.5), (21.9, 50.25), (21.85, 50.05), (21.6, 49.6), (21.5, 49.42), (21.0, 49.42)]], []),
    ("VYPLN", "dpm", [[(21.5, 49.42), (21.6, 49.6), (21.85, 50.05), (21.9, 50.25), (22.2, 50.5), (22.6, 50.6), (23.3, 50.6), (23.3, 48.9),
                       (22.6, 49.05), (22.0, 49.2), (21.8, 49.35)]], []),
    ("VYPLN", "dhm", [[(22.6, 50.6), (22.9, 51.0), (22.9, 51.5), (23.3, 51.5), (23.3, 50.6)]], []),
    ("VYPLN", "dpo", [[(20.4, 51.65), (20.4, 52.45), (20.9, 52.55), (21.4, 52.55), (21.7, 52.3), (21.6, 51.85), (21.0, 51.6)]], []),
    ("VYPLN", "dpl", [[(20.4, 52.45), (20.9, 52.55), (21.4, 52.55), (21.9, 52.75), (22.4, 53.05), (22.6, 53.45), (22.9, 53.45), (22.9, 52.8),
                       (20.4, 52.8)]], []),
    ("VYPLN", "dlc", [[(21.6, 51.75), (21.7, 52.3), (22.0, 52.6), (22.6, 52.9), (23.3, 53.0), (23.3, 51.5), (22.9, 51.5), (22.6, 51.85),
                       (22.2, 51.95)]], []),
    ("VYPLN", "dvl", [[(22.4, 53.05), (22.6, 53.45), (22.55, 53.9), (22.7, 54.1), (22.8, 54.35), (22.7, 54.6), (22.85, 54.9), (22.85, 55.05),
                       (23.3, 55.1), (23.3, 53.0)]], []),
    ("VYPLN", "dzm", [[(22.85, 55.05), (22.5, 55.1), (22.1, 55.2), (21.85, 55.45), (21.6, 55.75), (23.3, 55.75), (23.3, 55.1)]], []),
    # ---- Dánsko a Šlesvicko
    ("VYPLN", "dod", [[(9.85, 55.7), (11.0, 55.7), (11.0, 54.7), (10.1, 54.78), (9.7, 54.85), (9.65, 55.0), (9.72, 55.2), (9.9, 55.45)],
                      [(10.95, 54.5), (12.15, 54.5), (12.15, 54.75), (12.0, 55.0), (11.85, 55.06), (11.5, 54.98), (10.95, 54.97)]], []),
    ("VYPLN", "drs", [[(11.0, 55.7), (11.0, 55.08), (11.85, 55.06), (12.15, 54.95), (12.15, 54.8), (12.7, 54.8), (12.85, 55.3), (12.75, 55.7)],
                      [(13.1, 54.25), (13.8, 54.25), (13.8, 54.72), (13.1, 54.72)]], []),
    ("VYPLN", "dld", [[(12.85, 55.3), (14.6, 55.3), (14.6, 55.7), (12.75, 55.7)], [(14.6, 54.9), (15.25, 54.9), (15.25, 55.35), (14.6, 55.35)]], []),
    ("VYPLN", "dbm", [[(9.25, 53.3), (9.85, 53.5), (9.6, 54.3), (9.25, 54.3)]], []),
    ("VYPLN", "dsl", [[(9.25, 54.3), (10.0, 54.3), (10.1, 54.5), (9.9, 55.35), (9.25, 55.35)]], []),
    ("VYPLN", "drp", [[(9.25, 55.35), (9.9, 55.35), (9.85, 55.7), (9.25, 55.7)]], []),
    # ---- doplňky: severní Tyrolsko a Vorarlbersko, jižní Prusy (Varmie a Sambie), Komárno a Tata, Bosna a Lika
    ("VYPLN", "dcu", [[(9.6, 47.25), (9.75, 47.5), (10.05, 47.55), (10.2, 47.35), (10.15, 47.0), (9.85, 47.0)]], []),
    ("VYPLN", "dbx", [[(10.15, 47.0), (10.2, 47.35), (10.6, 47.45), (10.9, 47.55), (11.5, 47.6), (11.5, 46.9), (10.9, 46.8), (10.45, 46.85)]], []),
    ("VYPLN", "dwr", [[(20.2, 53.2), (21.0, 53.2), (21.0, 53.9), (20.2, 53.9)]], []),
    ("VYPLN", "dsb", [[(21.0, 53.2), (22.6, 53.2), (22.6, 53.9), (21.0, 53.9)]], []),
    ("VYPLN", "drb", [[(17.1, 47.2), (17.9, 47.2), (17.9, 48.05), (17.1, 48.05)]], []),
    ("VYPLN", "des", [[(17.9, 47.6), (18.9, 47.6), (18.9, 48.05), (17.9, 48.05)]], []),
    ("VYPLN", "dvp", [[(17.9, 47.2), (18.9, 47.2), (18.9, 47.6), (17.9, 47.6)]], []),
    ("VYPLN", "dbo", "@bos", []),
    ("VYPLN", "dkv", "@chr", []),
    ("VYPLN", "dcs", "@hun", []),
    ("VYPLN", "dcs", "@sev", []),
    ("VYPLN", "dpl", "@maz", []),
    # ---- dřívější okraj mapy: rovné hranice diecézí zvlnit
    ("VLNA", "x", (10.9, 46.8, 52.85), []),
    ("VLNA", "y", (52.8, 10.9, 20.5), []),
    ("VLNA", "y", (47.2, 10.9, 21.0), []),
    ("VLNA", "x", (20.4, 47.2, 52.8), []),
]

# nové diecéze: id → (jméno, sídlo [lon, lat], poznámka)
DIO_META = {
    "dwu": ("Diecéze würzburská", [9.93, 49.79], "Mohanské Franky od Spessartu po Durynský les. Spadá pod Mohuč; biskup se píše vévodou franským."),
    "dhb": ("Diecéze halberstadtská", [11.05, 51.9], "Severní podhůří Harcu s Halberstadtem a Quedlinburkem. Spadá pod Mohuč."),
    "dhi": ("Diecéze hildesheimská", [9.95, 52.15], "Kraj mezi Leinou a Okerem s Hildesheimem a západní polovinou Brunšviku. Spadá pod Mohuč."),
    "dmd": ("Diecéze mindenská", [8.92, 52.29], "Kraj na Vezeře a Leině s Hannoverem; biskup sídlí v Mindenu za západním okrajem mapy. Spadá pod Kolín."),
    "dvd": ("Diecéze verdenská", [9.23, 52.92], "Lüneburské vřesoviště s Lüneburkem a západ Staré marky. Spadá pod Mohuč; biskupové sídlí v Rotenburku."),
    "dau": ("Diecéze augšpurská", [10.9, 48.37], "Švábsko mezi Illerem a Lechem až k Alpám. Spadá pod Mohuč; s městem Augšpurkem se biskupové nesnášejí a pobývají raději v Dillingenu."),
    "dko": ("Diecéze kostnická", [9.18, 47.66], "Největší diecéze říše: Švábsko, Virtembersko a východ Švýcar kolem Bodamského jezera. Spadá pod Mohuč."),
    "dcu": ("Diecéze churská", [9.53, 46.85], "Rétie a horní Vinšgavsko. Spadá pod Mohuč; biskup je pánem Božího domu jen podle jména."),
    "dco": ("Diecéze komská", [9.08, 45.81], "Jezero Como a Valtellina. Spadá pod Akvileju."),
    "dbg": ("Diecéze bergamská", [9.67, 45.7], "Bergamo a jeho údolí pod Alpami, benátská pevnina. Spadá pod Milán."),
    "dbs": ("Diecéze brescijská", [10.22, 45.54], "Brescia, Val Camonica a západní břeh Gardy. Spadá pod Milán."),
    "dml": ("Arcidiecéze milánská", [9.19, 45.46], "Milán a jeho venkov s Lodi; arcibiskup je metropolitou Lombardie."),
    "dcr": ("Diecéze cremonská", [10.02, 45.13], "Cremona a nížina mezi Ogliem a Pádem. Spadá pod Milán."),
    "dmn": ("Diecéze mantovská", [10.79, 45.16], "Mantova uprostřed jezer na Minciu. Podléhá přímo papeži."),
    "dem": ("Biskupství Emilie", [10.33, 44.8], "Piacenza, Parma, Reggio a Modena – biskupství staré Emilijské cesty pod Apeninami."),
    "dbl": ("Biskupství boloňské a ferrarské", [11.34, 44.49], "Bologna pod Ravennou a Ferrara, která podléhá přímo papeži."),
    "drv": ("Arcidiecéze ravennská", [12.2, 44.42], "Ravenna, nyní benátská, s Comacchiem a Cervií; starobylá metropole Romagne."),
    "dva": ("Diecéze vacovská", [19.13, 47.78], "Kraj mezi Dunajem a Tisou s Peští. Spadá pod Ostřihom."),
    "dvv": ("Diecéze varadínská", [21.92, 47.06], "Bihár, Békés a Zaránd s Velkým Varadínem, kde leží král Ladislav Svatý. Spadá pod Kaloču."),
    "dsd": ("Diecéze sedmihradská", [23.57, 46.07], "Sedmihradsko; biskup sídlí v Bělehradu Sedmihradském za východním okrajem mapy. Spadá pod Kaloču."),
    "dsr": ("Diecéze sremská", [19.6, 45.15], "Srem mezi Sávou a Dunajem a pohraničí u Bělehradu. Spadá pod Kaloču."),
    "dpm": ("Diecéze přemyšlská", [22.77, 49.78], "Přemyšlská a sanocká země. Spadá pod Halič (Lvov); vedle ní má Přemyšl i biskupa řeckého vyznání."),
    "dhm": ("Diecéze chełmská", [23.47, 51.13], "Chełmská země nad Bugem. Spadá pod Halič (Lvov)."),
    "dlc": ("Diecéze lucká", [25.33, 50.75], "Podlesí s Drohičinem a Brestem; biskup sídlí v Lucku na Volyni."),
    "dvl": ("Diecéze vilenská", [25.28, 54.68], "Litva; biskup sídlí ve Vilně. Spadá pod Hnězdno."),
    "dzm": ("Diecéze žmuďská", [22.53, 55.37], "Žmuď, poslední pohanská země Evropy, pokřtěná teprve před čtyřiceti lety; biskupové sídlí v Medininkai."),
    "dod": ("Diecéze odenská", [10.39, 55.4], "Fyn, Langeland, Als a Lolland s Falsterem. Spadá pod Lund."),
    "drs": ("Diecéze roskildská", [12.08, 55.64], "Sjælland, Møn a ostrov Rujána. Spadá pod Lund."),
    "dld": ("Arcidiecéze lundská", [13.19, 55.7], "Skåne a Bornholm. Arcibiskup lundský je metropolitou celého Dánska."),
    "drp": ("Diecéze ripenská", [8.76, 55.33], "Jižní Jutsko; biskup sídlí v Ribe za západním okrajem mapy. Spadá pod Lund."),
}

FIX_DIO = {"dpr", "dol", "dvr", "dmi"}  # obrysy ze zemí Koruny (LANDS) – text se nemění, nové kusy se jen připojí
MIN_MEZERA = 0.3  # mezera menší než tolik čtverečních stupňů připadne sousedovi
ZMENA = 0.0015  # menší rozdíl obrysu (u velkých zemí úměrně víc) je jen zaokrouhlení – opakované spuštění obrys nepřepíše


# ================================================================ výpočet
def geom_duchy(rs):
    return KG.poly(rs)  # sudo-liše jako kresba


def geom_dio(rs):
    return unary_union([Polygon(r).buffer(0) for r in rs if len(r) > 2]).buffer(0)


def vlna(G, osa, hodnota, od, do, chranene):
    """rovnou hranici po poledníku (osa „x“) nebo rovnoběžce („y“) mezi dvěma zeměmi zvlní: střídavě vybouleným obloukem
    dostane kus plochy soused z druhé strany (dřívější okraj mapy už není vidět jako pravítkem tažená čára)"""
    from shapely.geometry import Point

    def bod(t, o):
        return (hodnota + o, t) if osa == "x" else (t, hodnota + o)

    def vlastnik(b):
        p = Point(*b)
        for k, g in G.items():
            if g.contains(p):
                return k
        return None

    def oblouk(t, krok, amp):
        """jeden oblouk; když se po délce úseku mění sousedé, rozdělí se na dva menší"""
        dvojice = {(vlastnik(bod(t + krok * f, amp * 0.3)), vlastnik(bod(t + krok * f, -amp * 0.3))) for f in (0.2, 0.5, 0.8)}
        if len(dvojice) > 1:
            if krok > 0.1:
                oblouk(t, krok / 2, amp)
                oblouk(t + krok / 2, krok / 2, -amp)
            return
        tady, tam = dvojice.pop()
        if tady and tam and tady != tam and tady not in chranene and tam not in chranene:
            R = Polygon([bod(t + krok * j / 8, amp * math.sin(math.pi * j / 8)) for j in range(9)]).buffer(0).intersection(G[tady])
            G[tady] = G[tady].difference(R).buffer(0)
            G[tam] = G[tam].union(R).buffer(0)

    t, i = od, 0
    while t < do - 0.05:
        h = (i * 7919 + int(hodnota * 1000)) % 97 / 97  # pevná náhoda: stejný výsledek při každém spuštění
        krok = min(0.22 + 0.25 * h, do - t)
        oblouk(t, krok, (0.04 + 0.05 * ((i * 31 + 7) % 11) / 11) * (1 if i % 2 else -1))
        t += krok
        i += 1


def proved(G, ops, chranene=(), odkaz=None):
    """G: {id: geometrie}; kruhy „@id“ = obrys země z odkaz (diecéze podle zemí). Vrátí změněné G."""
    for op, kid, kruhy, ber in ops:
        if op == "VLNA":
            vlna(G, kid, *kruhy, chranene)
            continue
        if isinstance(kruhy, str):
            P = odkaz[kruhy[1:]]
        else:
            P = unary_union([Polygon(k).buffer(0) for k in kruhy]).intersection(SVET).buffer(0)
        ostatni = unary_union([g for k, g in G.items() if k != kid and k not in ber]) if G else Polygon()
        if op == "PRIRAD":
            for k in ber:
                if k in G and k not in chranene:
                    G[k] = G[k].difference(P).buffer(0)
            nove = P.difference(ostatni)
        else:
            nove = P.difference(unary_union([g for k, g in G.items() if k != kid]))
        G[kid] = (G.get(kid, Polygon()).union(nove)).buffer(0)
    return G


def mezery(G, souse_g, chranene, pocet_iteraci=3):
    """drobné mezery na souši přidá sousedovi s nejdelší společnou hranicí; vrátí zbylé větší mezery"""
    for _ in range(pocet_iteraci):
        U = unary_union(list(G.values()))
        gap = souse_g.difference(U)
        kusy = [p for p in KG.mnohouhelniky(gap) if p.area > 1e-5]
        zmena = False
        for p in kusy:
            if p.area >= MIN_MEZERA:
                continue
            hr = p.buffer(0.01)
            best, bl = None, 0
            for k, g in G.items():
                if k in chranene or g.is_empty:
                    continue
                d = g.intersection(hr).area
                if d > bl:
                    best, bl = k, d
            if best:
                G[best] = G[best].union(p.buffer(0.002)).buffer(0)
                zmena = True
        if not zmena:
            break
    gap = souse_g.difference(unary_union(list(G.values())))
    return [p for p in KG.mnohouhelniky(gap) if p.area >= 0.01]


def barvy(G, nove, meta_c):
    """nové země a diecéze dostanou barvu z palety, jakou nemá žádný soused"""
    out = {}
    for k in nove:
        sous = {meta_c.get(j) or out.get(j) for j, g in G.items() if j != k and not g.is_empty and g.distance(G[k]) < 0.03}
        volne = [c for c in PALETA if c not in sous]
        i = sum(map(ord, k)) % len(volne or PALETA)
        out[k] = (volne or PALETA)[i]
    return out


def jina(g, p):
    """liší se obrys víc než zaokrouhlením a zjednodušením?"""
    return g.symmetric_difference(p).area > max(ZMENA, 0.0004 * p.area)


def kruhy_dio(g):
    """diecéze se kreslí po mnohoúhelnících bez děr (02b): jen vnější prstence"""
    return [KG.kruh(p.exterior.coords) for p in KG.mnohouhelniky(g.simplify(0.004)) if p.area >= 0.0004]


def lezi_v(bod, g):
    from shapely.geometry import Point

    return g.buffer(0.01).contains(Point(*bod))


ZAKLAD = "159b63f"  # stav před touto opravou: počítá se vždy od něj, takže opakované spuštění dá totéž


def cti_zaklad(*jmena):
    """konstanty skriptu mapy ve stavu ZAKLAD (git show), ne v pracovní kopii"""
    import tempfile

    tmp = tempfile.mkdtemp()
    stare = (KG.F02, KG.F02B, KG.F02E)
    nove = []
    for f in stare:
        cesta = os.path.join(tmp, os.path.basename(f))
        rel = os.path.relpath(f, KG.KOREN)
        open(cesta, "w").write(subprocess.run(["git", "show", f"{ZAKLAD}:{rel}"], cwd=KG.KOREN, capture_output=True, text=True, check=True).stdout)
        nove.append(cesta)
    KG.F02, KG.F02B, KG.F02E = nove
    try:
        return KG.cti_js(*jmena)
    finally:
        KG.F02, KG.F02B, KG.F02E = stare


def spocti():
    J = cti_zaklad("LANDS", "NBRS", "DUCHY_POLY", "DUCHY", "DIO_POLY", "DIO", "DIO_ORDER")
    souse_g = KG.souse()
    vys = {}
    # ---- země
    puv = {k: geom_duchy(v) for k, v in J["DUCHY_POLY"].items()}
    chran = {u["id"] for u in J["DUCHY"] if u.get("dom")}
    G = proved(dict(puv), [o for o in ZEME_OPS if o[0] != "VLNA"], chran)
    zbyle_z = mezery(G, souse_g, chran)
    G = proved(G, [o for o in ZEME_OPS if o[0] == "VLNA"], chran)  # vlny až po zaplnění mezer: obě strany hranice už mají pána
    meta_c = {u["id"]: u["c"] for u in J["DUCHY"]}
    nove = list(ZEME_META)
    for k in nove:
        if k not in G or G[k].is_empty:
            print("prázdná země", k)
    bz = barvy(G, nove, meta_c)
    # obrysy: změněné spočítané, ostatní beze změny ze základu (zápis pak přepíše jen to, co se v souboru liší)
    vys["duchy_poly"] = {k: KG.kruhy_out(g) if jina(g, puv[k]) else J["DUCHY_POLY"][k] for k, g in G.items() if k in puv}
    vys["duchy_nove_poly"] = {k: KG.kruhy_out(G[k]) for k in nove}
    vys["duchy_nove"] = []
    for k in nove:
        jm, s, h, note = ZEME_META[k]
        lab, w = KG.stitek(G[k], souse_g)
        u = {"id": k, "name": jm, "s": s}
        if h:
            u["h"] = h
        u.update({"dom": 0, "note": note, "c": bz[k], "lab": lab, "w": w})
        vys["duchy_nove"].append(u)
    # popisky změněných zemí, které vypadly z obrysu
    vys["duchy_popisky"] = {}
    for u in J["DUCHY"]:
        k = u["id"]
        if jina(G[k], puv[k]) and not lezi_v(u["lab"], G[k]):
            vys["duchy_popisky"][k] = KG.stitek(G[k], souse_g)
    # ---- barvy sousedních zemí na podkladu (NBRS) poskládané ze zemí: hranice barev jdou po hranicích zemí, ne po dřívějším okraji mapy
    nb_puv = [(c, KG.poly(rs)) for c, rs in J["NBRS"]]
    pod_korunou = unary_union([G[k] for k in chran if k in G])
    prirazeni = {}
    for k, g in G.items():
        if k in chran or g.is_empty:
            continue
        c, plocha = max(((c, g.intersection(n).area) for c, n in nb_puv), key=lambda q: q[1])
        if plocha > 0:
            prirazeni.setdefault(c, []).append(k)
    vys["nbrs"] = []
    for (c, n), (_, rs) in zip(nb_puv, J["NBRS"]):
        g = unary_union([G[k] for k in prirazeni.get(c, [])] + [n.intersection(pod_korunou)]).buffer(0)
        vys["nbrs"].append([c, KG.kruhy_out(g) if jina(g, n) else rs])
    # ---- diecéze
    puv_d = {k: geom_dio(v) for k, v in J["DIO_POLY"].items()}
    D = proved(dict(puv_d), [o for o in DIO_OPS if o[0] != "VLNA"], FIX_DIO, G)
    zbyle_d = mezery(D, souse_g, FIX_DIO)
    D = proved(D, [o for o in DIO_OPS if o[0] == "VLNA"], FIX_DIO)
    meta_dc = {d["id"]: d["c"] for d in J["DIO"]}
    nove_d = list(DIO_META)
    bd = barvy(D, nove_d, meta_dc)
    vys["dio_poly"] = {}
    for k, g in D.items():
        if k not in puv_d:
            continue
        if k in FIX_DIO:
            vys["dio_poly"][k] = ("pripoj", kruhy_dio(g.difference(puv_d[k])) if jina(g, puv_d[k]) else [])
        else:
            vys["dio_poly"][k] = ("cele", kruhy_dio(g) if jina(g, puv_d[k]) else J["DIO_POLY"][k])
    vys["dio_nove_poly"] = {k: kruhy_dio(D[k]) for k in nove_d}
    vys["dio_nove"] = []
    for k in nove_d:
        d = {"id": k, "c": bd[k], "name": DIO_META[k][0], "seat": DIO_META[k][1], "note": DIO_META[k][2]}
        if not SVET.buffer(-0.1).contains(Point(*d["seat"])):
            # biskup sídlí za okrajem mapy: popisek bez značky stolce na kraji diecéze směrem k sídlu
            jadro = D[k].buffer(-0.12).intersection(souse_g)
            d["seat"] = [KG.R3(c) for c in nearest_points(jadro if not jadro.is_empty else D[k], Point(*d["seat"]))[0].coords[0]]
            d["mimo"] = 1
        vys["dio_nove"].append(d)
    # ---- hlavní hráči (HRACI v 02): mocnost = sloučené země; obrys a místo erbu
    vys["hraci"] = {}
    for h in KG.cti_js("DUCHY", "HRACI")["HRACI"]:
        g = unary_union([G[k] for k in h["z"] if k in G]).buffer(0.003).buffer(-0.003)
        lab, _ = KG.stitek(g, souse_g)
        vys["hraci"][h["id"]] = {"lab": lab, "rs": KG.kruhy_out(g, tol=0.006)}
    vys["zbyle"] = (zbyle_z, zbyle_d)
    vys["G"], vys["D"] = G, D
    vys["zmenene"] = sorted(k for k in puv if jina(G[k], puv[k])), sorted(k for k in puv_d if jina(D[k], puv_d[k]))
    return vys


def text_klice(t, konst, klic):
    """(začátek, konec) textu hodnoty klíče v objektu konst"""
    m = re.search(r"^const " + konst + r" = ", t, re.M)
    k = re.compile(r"^  " + klic + r": ", re.M).search(t, m.end())
    return k.end(), KG.najdi_konec(t, k.end()) + 1


def zapis(V):
    ted = KG.cti_js("LANDS", "NBRS", "DUCHY_POLY", "DIO_POLY")
    zaklad_b = subprocess.run(["git", "show", f"{ZAKLAD}:" + os.path.relpath(KG.F02B, KG.KOREN)], cwd=KG.KOREN, capture_output=True, text=True,
                              check=True).stdout
    stejne = lambda a, b: KG.js(a) == KG.js(b)  # noqa: E731
    t = open(KG.F02B).read()
    if not stejne(ted["NBRS"], V["nbrs"]):
        t = KG.nahrad_konst(t, "NBRS", KG.js(V["nbrs"]))
    for k, rs in V["duchy_poly"].items():
        if not stejne(ted["DUCHY_POLY"].get(k), rs):
            t = KG.nahrad_klic(t, "DUCHY_POLY", k, KG.js(rs))
    t = blok(t, "zeme", "\n".join(f"  {k}: {KG.js(rs)}," for k, rs in V["duchy_nove_poly"].items()), "DUCHY_POLY")
    for k, (jak, rs) in V["dio_poly"].items():
        if jak == "cele":
            if not stejne(ted["DIO_POLY"].get(k), rs):
                t = KG.nahrad_klic(t, "DIO_POLY", k, KG.js(rs))
            continue
        # obrys ze zemí Koruny (…LANDS[i][1]) zůstane, jak je v základu; nové kusy se připojí na konec
        a, b = text_klice(zaklad_b, "DIO_POLY", k)
        text = zaklad_b[a:b]
        if rs:
            text = text[:-1].rstrip().rstrip(",") + ", /* hranice_doplnit.py */ ..." + KG.js(rs) + "]"
        a, b = text_klice(t, "DIO_POLY", k)
        if re.sub(r"\s", "", t[a:b]) != re.sub(r"\s", "", text):
            t = t[:a] + text + t[b:]
    t = blok(t, "diecéze", "\n".join(f"  {k}: {KG.js(rs)}," for k, rs in V["dio_nove_poly"].items()), "DIO_POLY")
    if "const HRACI_GEO = " not in t:
        t = t.replace("const DUCHY_POLY = {", "/* obrysy mocností vrstvy Hlavní hráči a místo erbu (počítá podklady/hranice_doplnit.py z HRACI v 02) */\nconst HRACI_GEO = {};\nconst DUCHY_POLY = {", 1)
    t = blok(t, "hraci", "\n".join(f"  {k}: {KG.js(v)}," for k, v in V["hraci"].items()), "HRACI_GEO")
    open(KG.F02B, "w").write(t)
    t = open(KG.F02).read()
    t = blok(t, "zeme", "\n".join(KG.js(u) + "," for u in V["duchy_nove"]), "DUCHY")
    for k, (lab, w) in V["duchy_popisky"].items():
        m = re.compile(r'id: "' + k + r'",[\s\S]*?lab: \[[^\]]*\],\s*w: [\d.]+').search(t)
        if m:
            s = re.sub(r"lab: \[[^\]]*\],(\s*)w: [\d.]+", f"lab: {KG.js(lab)},\\1w: {w}", m.group(0))
            t = t[: m.start()] + s + t[m.end():]
    t = blok(t, "diecéze", "\n".join(KG.js(d) + "," for d in V["dio_nove"]), "DIO")
    t = blok(t, "poradi", "\n".join(KG.js(k) + "," for k in DIO_META), "DIO_ORDER")
    open(KG.F02, "w").write(t)
    subprocess.run(["npx", "prettier", "--write", "--log-level", "warn", KG.F02, KG.F02B], cwd=KG.KOREN, check=True)


ZN_Z, ZN_K = "/* hranice_doplnit.py {%s} */", "/* hranice_doplnit.py {/%s} */"


def blok(t, nazev, obsah, kotva):
    """jako KG.blok, ale se značkami tohoto skriptu"""
    z, k = ZN_Z % nazev, ZN_K % nazev
    if z in t:
        i, j = t.index(z), t.index(k) + len(k)
        return t[:i] + z + "\n" + obsah + "\n" + k + t[j:]
    m = re.search(r"^const " + kotva + r" = ", t, re.M)
    e = KG.najdi_konec(t, m.end())
    pred = t[:e].rstrip()
    bez_kom = re.sub(r"/\*[^*]*\*/$", "", pred).rstrip()
    if not bez_kom.endswith((",", "[", "{")):
        pred = bez_kom + "," + pred[len(bez_kom):]
    return pred + "\n" + z + "\n" + obsah + "\n" + k + "\n" + t[e:]


def obrazek(V, cesta):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, axs = plt.subplots(1, 2, figsize=(30, 22))
    for ax, G, nazev in ((axs[0], V["G"], "země"), (axs[1], V["D"], "diecéze")):
        ax.set_title(nazev)
        ax.set_xlim(9.2, 23.3)
        ax.set_ylim(44.1, 55.7)
        ax.set_aspect(112 / 72)
        for i, (k, g) in enumerate(sorted(G.items())):
            for p in KG.mnohouhelniky(g):
                xs, ys = p.exterior.xy
                ax.fill(xs, ys, alpha=0.35, color=plt.cm.tab20(i % 20), lw=0)
                ax.plot(xs, ys, color="k", lw=0.5)
            if not g.is_empty:
                c = g.representative_point()
                ax.text(c.x, c.y, k, fontsize=7, ha="center")
    fig.savefig(cesta, dpi=60, bbox_inches="tight")


if __name__ == "__main__":
    V = spocti()
    print("změněné země:", V["zmenene"][0])
    print("nové země:", [u["id"] + " " + u["c"] for u in V["duchy_nove"]])
    print("posunuté popisky:", sorted(V["duchy_popisky"]))
    print("změněné diecéze:", V["zmenene"][1])
    print("nové diecéze:", [d["id"] + " " + d["c"] for d in V["dio_nove"]])
    for nazev, Z in zip(("země", "diecéze"), V["zbyle"]):
        for p in sorted(Z, key=lambda q: -q.area):
            b = p.bounds
            print(f"zbylá mezera ({nazev}) {p.area:.3f}  {b[0]:.2f},{b[1]:.2f} – {b[2]:.2f},{b[3]:.2f}")
    if OBR:
        obrazek(V, OBR)
    if ZAPIS:
        zapis(V)
        print("zapsáno")
