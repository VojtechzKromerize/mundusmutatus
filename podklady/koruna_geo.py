#!/usr/bin/env python3
"""Podklad mapy Zemí Koruny české v rozšířeném rozsahu – od Baltu k Jadranu (2026-10-27, Vojta).

Z Natural Earth (public domain, 1:10 m) spočítá moře a pobřeží, prodloužení řek, jezera a k tomu hranice zemí k jaru 1458
(ručně zadané lomené čáry níže, přibližné, ale podle rešerše) a zapíše je do skriptu mapy:

  02b-mapa-kresba.js  NBRS (sousední země až k pobřeží), DUCHY_POLY (nové země a prodloužené staré), MORE (moře),
                      MORE_LBL, JEZERA_V, TRIBS (prodloužení a nové přítoky), RIVLBL (nové popisky), NLBL (jména zemí)
  02-mapa.js          DUCHY (nové země s poznámkami pro hráče), RIVERS (prodloužení a nové velké řeky)
  02e-krajina.js      VODA_CESTA (hrubé moře a velká jezera pro výpočet cest – trasa nevede přes vodu)

Spuštění z kořene repozitáře:  python3 podklady/koruna_geo.py [--ne SLOŽKA] [--zapis] [--od COMMIT] [--obrazek soubor.png]
  bez --zapis jen spočítá a vypíše počty bodů; --zapis přepíše vygenerované části (staré ručně kreslené hodnoty uvnitř
  dřívějšího rozsahu mapy zůstanou – nové plochy se k nim jen přidají) a soubory naformátuje Prettierem.
  Po úpravě obrysů níže spouštěj s --od 1e22cb1 (stav před rozšířením): skript nejdřív vrátí původní NBRS, prodlužované
  země DUCHY_POLY a řeky z toho commitu a teprve k nim přidá nové kusy. Bloky mezi značkami /* koruna_geo.py {…} */ přepíše vždy.
  Chybějící soubory Natural Earth stáhne z github.com/nvkelso/natural-earth-vector do složky --ne (výchozí /tmp/ne).
"""
import json
import math
import os
import re
import subprocess
import sys
import urllib.request

from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon, box, shape
from shapely.ops import linemerge, polylabel, substring, unary_union

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(KOREN, "zdroj", "web", "js")
F02, F02B, F02E = (os.path.join(JS, f) for f in ("02-mapa.js", "02b-mapa-kresba.js", "02e-krajina.js"))
ARG = sys.argv[1:]
NE = ARG[ARG.index("--ne") + 1] if "--ne" in ARG else "/tmp/ne"
ZAPIS = "--zapis" in ARG
OBR = ARG[ARG.index("--obrazek") + 1] if "--obrazek" in ARG else None
OD = ARG[ARG.index("--od") + 1] if "--od" in ARG else None

# svět mapy (MAPWB v 02): lon 9.5–23.0, lat 44.4–55.4; data sahají o kus dál, aby okraj světa nikde nebyl vidět
SVET = box(9.25, 44.15, 23.25, 55.65)
P = lambda lo, la: ((lo - 10.9) * 72, (52.7 - la) * 112)  # projekce mapy (02)
NE_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/"


def ne(jmeno):
    cesta = os.path.join(NE, jmeno + ".geojson")
    if not os.path.exists(cesta):
        os.makedirs(NE, exist_ok=True)
        print("stahuji", jmeno)
        urllib.request.urlretrieve(NE_URL + jmeno + ".geojson", cesta)
    return json.load(open(cesta))["features"]


def mnohouhelniky(g):
    return [p for p in getattr(g, "geoms", [g]) if p.geom_type == "Polygon" and not p.is_empty]


R3 = lambda v: round(v + 0.0, 3)
R2 = lambda v: round(v + 0.0, 2)


def kruh(c, r=R3):
    """souřadnice prstence bez zdvojeného posledního bodu, zaokrouhlené, bez opakování"""
    out = []
    for x, y in list(c)[:-1] if list(c)[0] == list(c)[-1] else c:
        q = [r(x), r(y)]
        if not out or out[-1] != q:
            out.append(q)
    return out


# ---------------------------------------------------------------- souš a moře
def souse():
    L = unary_union([shape(f["geometry"]).intersection(SVET) for f in ne("ne_10m_land") if shape(f["geometry"]).intersects(SVET)])
    # Viselský záliv je v Natural Earth jezero – moře je to ale stejně jako Kuršský a Štětínský záliv
    lag = unary_union([shape(f["geometry"]) for f in ne("ne_10m_lakes") if f["properties"].get("name") in ("Kaliningradskiy Zaliv", "Zalew Wislany")])
    L = L.difference(lag)
    # delta Pádu roku 1458: dnešní výběžek delty (Porto Viro) vznikl až po roce 1600 – pobřeží vedlo zhruba od Chioggie k Comacchiu
    L = L.difference(Polygon([(12.33, 45.16), (12.8, 45.16), (12.8, 44.75), (12.3, 44.75), (12.27, 44.82), (12.33, 44.9), (12.37, 45.0),
                              (12.34, 45.1)]))
    return L.buffer(0)


# ---------------------------------------------------------------- země k jaru 1458 (lon, lat); hranice přibližné
# Pořadí určuje přednost: kde se dva obrysy překrývají, plochu dostane dřívější. Ploché okraje v moři nevadí – moře se kreslí
# přes ně. Klíč = id v DUCHY_POLY / DUCHY (u prodloužení staré země se nový kus jen přidá ke starému obrysu).
MECK_JIH = [(11.25, 53.12), (11.5, 53.2), (11.75, 53.25), (12.0, 53.3), (12.2, 53.33), (12.35, 53.28), (12.55, 53.27), (12.85, 53.22),
            (13.1, 53.14), (13.25, 53.18), (13.4, 53.27), (13.55, 53.38), (13.68, 53.45)]
MECK_VYCH = [(13.68, 53.45), (13.65, 53.58), (13.5, 53.68), (13.3, 53.72), (13.15, 53.78), (13.0, 53.85), (12.9, 53.95), (12.75, 54.0),
             (12.6, 54.1), (12.47, 54.2), (12.43, 54.27)]
PEENE = [(13.0, 53.85), (13.2, 53.88), (13.45, 53.86), (13.69, 53.85), (13.8, 53.86), (13.95, 53.82), (14.15, 53.83), (14.22, 53.86), (14.27, 53.93)]
NMARKA_SEVER = [(14.4, 53.15), (14.6, 53.1), (14.85, 53.08), (15.1, 53.12), (15.35, 53.25), (15.48, 53.4), (15.6, 53.55), (15.62, 53.72),
                (15.72, 53.82), (15.9, 53.8), (16.05, 53.65), (16.12, 53.5)]
UCKERMARK = [(13.68, 53.45), (13.85, 53.42), (14.1, 53.38), (14.3, 53.25), (14.4, 53.15)]
POMOR_VYCH = [(16.95, 53.72), (17.0, 53.92), (17.2, 54.05), (17.35, 54.2), (17.45, 54.35), (17.5, 54.5), (17.55, 54.62), (17.58, 54.8)]
POMERELIE_JIH = [(16.95, 53.72), (17.2, 53.62), (17.45, 53.58), (17.65, 53.5), (17.85, 53.45), (18.05, 53.35), (18.26, 53.24)]
# Visla podle Natural Earth: od Toruně na západ k ohbí u Fordonu, pak na sever ke Gdaňsku
VISLA_TORUN = [(18.6, 53.02), (18.4, 53.05), (18.14, 53.11), (18.26, 53.24)]
VISLA_DOLNI = [(18.26, 53.24), (18.37, 53.35), (18.74, 53.48), (18.75, 53.65), (18.86, 53.74), (18.84, 53.83), (18.89, 53.9), (18.82, 54.04),
               (18.83, 54.12), (18.9, 54.25), (18.95, 54.3), (19.2, 54.35)]
PRUSY_JIH = [(18.6, 53.02), (18.75, 53.02), (19.05, 53.08), (19.4, 53.2), (19.85, 53.25), (20.1, 53.2), (20.25, 53.15), (20.45, 53.22),
             (20.7, 53.27), (20.95, 53.32), (21.3, 53.42), (21.6, 53.45), (21.95, 53.48), (22.2, 53.6), (22.4, 53.75), (22.55, 53.9)]
LITVA_ZAP = [(22.55, 53.9), (22.7, 54.1), (22.8, 54.35), (22.7, 54.6), (22.85, 54.9), (22.85, 55.05), (22.5, 55.1), (22.1, 55.2), (21.85, 55.45),
             (21.6, 55.75)]
MAZ_LIT = [(22.55, 53.9), (22.6, 53.65), (22.55, 53.4), (22.6, 53.2), (22.5, 53.0), (22.5, 52.8), (22.4, 52.6), (22.3, 52.45), (22.15, 52.3)]
LIT_JIH = [(22.15, 52.3), (22.45, 52.15), (22.75, 52.0), (23.1, 51.9), (23.3, 51.85)]
MAZ_MPL = [(20.7, 51.55), (21.1, 51.62), (21.5, 51.72), (21.75, 51.85), (21.95, 52.05), (22.15, 52.3)]
RUS_ZAP = [(21.5, 49.42), (21.6, 49.6), (21.75, 49.85), (21.85, 50.05), (21.9, 50.25), (22.05, 50.45), (22.2, 50.5), (22.6, 50.6),
           (22.9, 50.8), (23.05, 51.05), (23.3, 51.25)]
KARPATY = [(20.6, 49.45), (21.0, 49.42), (21.3, 49.43), (21.5, 49.42), (21.8, 49.35), (22.0, 49.2), (22.3, 49.1), (22.6, 49.05), (22.9, 49.0),
           (23.3, 48.9)]
# Dunaj, Sáva a Drina podle Natural Earth (hranice po řece)
DUNAJ_SRB = [(20.5, 44.83), (20.64, 44.85), (20.63, 44.77), (20.83, 44.66), (21.36, 44.83), (21.58, 44.78), (21.66, 44.69), (21.99, 44.66),
             (22.15, 44.5), (22.3, 44.68), (22.47, 44.73), (22.76, 44.58), (22.7, 44.54), (22.58, 44.57), (22.55, 44.51), (22.48, 44.5),
             (22.52, 44.38), (22.68, 44.31), (22.69, 44.23), (22.85, 44.15)]
MACVA = [(20.5, 44.83), (20.4, 44.75), (20.2, 44.55), (19.8, 44.45), (19.4, 44.5), (19.13, 44.52)]
SAVA = [(16.92, 45.26), (17.19, 45.15), (17.27, 45.19), (17.5, 45.14), (17.68, 45.16), (17.84, 45.06), (18.0, 45.15), (18.15, 45.1), (18.24, 45.16),
        (18.52, 45.06), (18.68, 45.09), (18.79, 45.0), (18.78, 44.91), (18.89, 44.86), (19.19, 44.93), (19.36, 44.89)]
DRINA_DOLNI = [(19.36, 44.89), (19.32, 44.72), (19.13, 44.52)]
DRINA_HORNI = [(19.13, 44.52), (19.11, 44.38), (19.16, 44.29), (19.31, 44.27), (19.37, 44.18), (19.37, 44.15)]
UNA = [(16.15, 44.15), (16.15, 44.4), (16.13, 44.49), (16.0, 44.65), (16.1, 44.85), (16.15, 44.9), (16.19, 44.98), (16.36, 45.03), (16.52, 45.23),
       (16.82, 45.2), (16.92, 45.26)]
KUPA = [(16.37, 45.47), (16.0, 45.5), (15.75, 45.5), (15.55, 45.49)]
SLAV_HUN = [(17.27, 45.19), (17.3, 45.6), (17.35, 45.95), (17.1, 46.1), (16.85, 46.3), (16.4, 46.32), (16.3, 46.38)]
STYR_JIH = [(15.67, 45.85), (15.65, 46.05), (15.7, 46.2), (16.0, 46.3), (16.3, 46.38)]
STYR_HUN = [(16.3, 46.38), (16.25, 46.5), (16.08, 46.62), (15.98, 46.68), (16.1, 46.85), (16.3, 47.05)]
KRANJ_SAVA = [(14.75, 46.35), (14.85, 46.25), (14.95, 46.12), (15.17, 46.07), (15.4, 46.0), (15.6, 45.88), (15.67, 45.85)]
KARAVANKY = [(13.72, 46.52), (14.0, 46.5), (14.3, 46.43), (14.55, 46.38), (14.75, 46.35)]
KORUTANY_V = [(14.75, 46.35), (14.95, 46.48), (15.0, 46.6), (15.05, 46.75), (14.85, 46.95), (14.85, 47.05)]
KRAS = [(13.95, 45.65), (13.97, 45.8), (14.02, 45.95), (14.05, 46.05)]
JULSKE = [(14.05, 46.05), (13.95, 46.2), (13.85, 46.32), (13.72, 46.47), (13.72, 46.52)]
FRANK_SEV = [(14.46, 45.3), (14.48, 45.37), (14.6, 45.5), (14.85, 45.48), (15.25, 45.46), (15.47, 45.6), (15.55, 45.49)]
FRANK_JIH = [(15.55, 45.49), (15.6, 45.35), (15.5, 45.1), (15.35, 44.85), (15.1, 44.75), (14.9, 44.72)]
VELEBIT = [(14.9, 44.72), (14.95, 44.62), (15.15, 44.45), (15.35, 44.25), (15.45, 44.15)]
KVARNER = [(14.9, 44.72), (14.75, 44.88), (14.6, 44.93), (14.5, 45.02), (14.42, 45.15), (14.4, 45.27)]
CRES_ISTRIE = [(14.27, 45.2), (14.2, 45.1), (14.15, 44.9), (14.0, 44.6), (14.0, 44.15)]
PAZIN = [(13.82, 45.3), (13.95, 45.33), (14.1, 45.38), (14.2, 45.3), (14.15, 45.18), (14.05, 45.08), (13.95, 45.05), (13.85, 45.12), (13.8, 45.2)]
FURL_ZAP = [(12.85, 45.6), (12.65, 45.75), (12.55, 45.85), (12.45, 45.95), (12.42, 46.1), (12.35, 46.25), (12.45, 46.4), (12.6, 46.55)]
KARNSKE = [(12.45, 46.65), (12.6, 46.55), (12.85, 46.62), (13.0, 46.6), (13.3, 46.55), (13.35, 46.48), (13.55, 46.42), (13.72, 46.47)]
GORICE = [(14.05, 46.05), (13.9, 46.02), (13.75, 46.05), (13.62, 46.08), (13.5, 46.05), (13.4, 45.95), (13.45, 45.85), (13.55, 45.8)]
BENATKY_SEV = [(9.45, 45.8), (9.5, 45.95), (9.6, 46.05), (9.9, 46.05), (10.15, 46.15), (10.4, 46.3), (10.6, 46.25), (10.5, 46.2), (10.45, 46.05),
               (10.45, 45.95), (10.5, 45.8), (10.6, 45.85), (10.75, 45.85), (10.82, 45.92), (10.88, 45.92), (11.0, 45.97), (11.1, 45.95),
               (11.25, 45.85), (11.45, 45.95), (11.6, 45.95), (11.7, 46.1), (11.8, 46.25), (11.9, 46.4), (12.0, 46.55), (12.15, 46.62),
               (12.3, 46.62), (12.45, 46.65)]
ADIZE_DOLNI = [(12.45, 45.12), (12.3, 45.15), (12.0, 45.17), (11.7, 45.18), (11.45, 45.17), (11.3, 45.19)]
BEN_JIH = [(11.3, 45.19), (11.15, 45.22), (10.95, 45.28), (10.8, 45.3), (10.7, 45.35), (10.6, 45.3), (10.45, 45.22), (10.3, 45.25),
           (10.1, 45.27), (9.95, 45.38), (9.85, 45.55), (9.6, 45.55), (9.5, 45.6), (9.45, 45.8)]
PAD_MAN = [(11.3, 45.19), (11.3, 45.05), (11.2, 45.0), (10.95, 44.92), (10.7, 44.88), (10.45, 44.85), (10.42, 44.95), (10.35, 45.1), (10.3, 45.25)]
TRIDENT = [(10.62, 46.4), (10.85, 46.47), (11.05, 46.5), (11.2, 46.3), (11.35, 46.3), (11.55, 46.35), (11.75, 46.35)]

L = lambda *useky: [b for u in useky for b in u]
REV = lambda u: list(reversed(u))

KRAJE_NOVE = [
    # ---- sever
    ("hmb", [[(9.84, 53.5), (10.18, 53.47), (10.2, 53.6), (9.95, 53.66), (9.82, 53.6)]]),
    ("lub", [[(10.58, 53.8), (10.8, 53.78), (10.92, 53.9), (10.97, 54.0), (10.85, 54.02), (10.72, 53.95), (10.6, 53.9)]]),
    ("lau", [[(10.3, 53.42), (10.45, 53.4), (10.6, 53.36), (10.72, 53.38), (10.85, 53.47), (10.95, 53.6), (10.9, 53.7), (10.82, 53.78),
              (10.62, 53.8), (10.5, 53.7), (10.35, 53.6), (10.22, 53.5)]]),
    ("dan", [[(9.25, 55.45), (9.68, 55.45), (9.72, 55.35), (9.78, 55.2), (9.92, 55.1), (10.05, 55.03), (10.3, 55.0), (10.55, 54.97), (10.62, 54.88),
              (10.65, 54.75), (10.75, 54.65), (11.0, 54.6), (11.35, 54.58), (11.6, 54.55), (11.95, 54.5), (12.4, 54.62), (12.9, 54.82), (12.95, 55.25),
              (14.6, 55.25), (14.6, 55.75), (9.25, 55.75)],
             [(14.5, 54.9), (15.35, 54.9), (15.35, 55.4), (14.5, 55.4)]]),
    ("sle", [[(9.25, 54.3), (9.67, 54.3), (9.8, 54.33), (9.95, 54.37), (10.15, 54.42), (10.25, 54.5), (10.6, 54.62), (10.65, 54.75), (10.62, 54.88),
              (10.55, 54.97), (10.3, 55.0), (10.05, 55.03), (9.92, 55.1), (9.78, 55.2), (9.72, 55.35), (9.68, 55.45), (9.25, 55.45)],
             [(10.98, 54.395), (11.4, 54.395), (11.4, 54.57), (10.98, 54.57)]]),
    ("hol", [[(9.25, 53.86), (9.42, 53.77), (9.6, 53.62), (9.75, 53.56), (9.85, 53.53), (10.2, 53.47), (10.3, 53.55), (10.42, 53.65), (10.55, 53.75),
              (10.65, 53.85), (10.85, 54.0), (10.97, 54.0), (11.2, 54.15), (11.4, 54.3), (11.4, 54.395), (10.9, 54.45), (10.6, 54.62), (10.25, 54.5),
              (10.15, 54.42), (9.95, 54.37), (9.8, 54.33), (9.67, 54.3), (9.25, 54.3)]]),
    ("bre", [[(9.25, 53.3), (9.7, 53.35), (9.8, 53.48), (9.75, 53.56), (9.6, 53.62), (9.42, 53.77), (9.25, 53.86)]]),
    ("lnb", [[(9.25, 52.2), (9.55, 52.1), (9.85, 52.0), (10.2, 51.95), (10.45, 52.05), (10.6, 52.12), (10.75, 52.3), (10.85, 52.45), (10.95, 52.6),
              (10.9, 52.75), (11.0, 52.88), (11.2, 52.95), (11.3, 53.05), (11.25, 53.12), (11.0, 53.2),
              (10.72, 53.33), (10.57, 53.37), (10.3, 53.42), (10.0, 53.47), (9.8, 53.48), (9.7, 53.35), (9.25, 53.3)]]),
    ("mek", [L([(10.97, 54.0), (11.0, 53.9), (10.97, 53.75), (10.95, 53.6), (10.85, 53.47), (10.72, 53.38), (10.9, 53.33), (11.1, 53.2)], MECK_JIH,
               MECK_VYCH, [(12.45, 54.45), (11.9, 54.45), (11.4, 54.3), (11.2, 54.15)])]),
    ("pwo", [L(REV(MECK_VYCH)[:6], PEENE[1:], [(14.32, 54.1), (13.9, 54.5), (13.6, 54.78), (13.2, 54.78), (12.9, 54.62), (12.45, 54.45)])]),
    ("brb", [L([(10.9, 52.75), (11.0, 52.88), (11.2, 52.95), (11.3, 53.05)], MECK_JIH, UCKERMARK[1:], [(14.3, 53.0), (14.2, 52.8)])]),
    ("nmk", [L(NMARKA_SEVER, [(16.15, 53.3), (16.05, 53.1), (15.95, 52.95), (15.85, 52.85), (14.2, 52.85)])]),
    ("pst", [L(PEENE, [(14.32, 54.1), (14.6, 54.2), (15.2, 54.25), (15.25, 54.12), (15.28, 53.95), (15.42, 53.78), (15.62, 53.62)],
               REV(NMARKA_SEVER[:7]), REV(UCKERMARK)[1:], MECK_VYCH[1:5])]),
    ("gpo", [L(REV(POMOR_VYCH), POMERELIE_JIH[1:], VISLA_DOLNI[1:], [(19.3, 54.55), (18.9, 54.9), (17.6, 54.95)])]),
    ("psl", [L([(15.25, 54.12), (15.28, 53.95), (15.42, 53.78), (15.62, 53.62), (15.75, 53.45), (16.2, 53.45), (16.55, 53.55), (16.8, 53.62)],
               POMOR_VYCH, [(17.5, 54.95), (16.5, 54.75), (15.6, 54.4), (15.2, 54.25)])]),
    ("war", [[(19.6, 54.45), (19.95, 54.45), (20.15, 54.38), (20.4, 54.25), (20.65, 54.2), (20.95, 54.15), (21.2, 54.12), (21.25, 54.0),
              (21.1, 53.85), (20.85, 53.75), (20.45, 53.68), (20.25, 53.72), (20.2, 53.85), (20.1, 53.97), (19.95, 54.05), (19.8, 54.15),
              (19.7, 54.25), (19.62, 54.33)]]),
    ("kpr", [L([(18.75, 53.6)], REV(VISLA_DOLNI[:3]), REV(VISLA_TORUN)[1:], PRUSY_JIH[1:5], [(19.75, 53.45), (19.5, 53.48), (19.25, 53.55),
                                                                                          (19.0, 53.58)]),
             L(VISLA_DOLNI[5:], [(19.3, 54.38), (19.62, 54.33), (19.6, 54.15), (19.5, 54.0), (19.42, 53.9), (19.2, 53.85), (19.0, 53.8)])]),
    ("rad", [L(PRUSY_JIH[4:], LITVA_ZAP, [(21.0, 55.75), (20.5, 55.2), (19.9, 54.95), (19.3, 54.55), (19.3, 54.38), (19.62, 54.33), (19.6, 54.15),
                                         (19.5, 54.0), (19.42, 53.9), (19.2, 53.85), (19.0, 53.8), (18.84, 53.83), (18.86, 53.74), (18.75, 53.65), (18.75, 53.6), (19.0, 53.58),
                                         (19.25, 53.55), (19.5, 53.48), (19.75, 53.45)])]),
    ("lit", [L(LITVA_ZAP, [(23.3, 55.75), (23.3, 51.85)], REV(LIT_JIH), REV(MAZ_LIT)[1:])]),
    ("kuj", [[(17.7, 52.95), (17.85, 53.25), (18.05, 53.35), (18.26, 53.24), (18.14, 53.11), (18.4, 53.05), (18.6, 53.02), (18.75, 53.02), (19.05, 53.08), (19.4, 53.2),
              (19.75, 53.18), (19.85, 52.95)]]),
    ("vlp", [[(15.85, 52.85), (16.12, 53.0), (16.15, 53.3), (16.12, 53.5), (16.2, 53.45), (16.55, 53.55), (16.8, 53.62), (16.95, 53.72), (17.2, 53.62),
              (17.45, 53.58), (17.65, 53.5), (17.85, 53.45), (17.9, 53.2), (17.75, 52.9)]]),
    ("maz", [L([(19.6, 52.95), (19.75, 53.18)], PRUSY_JIH[5:], MAZ_LIT[1:], REV(MAZ_MPL)[1:], [(20.6, 51.5)])]),
    ("mpl", [L(KARPATY[:4], RUS_ZAP[1:], [(23.3, 51.85)], REV(LIT_JIH)[1:], REV(MAZ_MPL)[1:], [(20.6, 51.3), (20.6, 49.45)])]),
    ("rus", [L(RUS_ZAP, REV(KARPATY[4:]))]),
    # ---- jih
    ("tst", [[(13.66, 45.72), (13.75, 45.75), (13.86, 45.68), (13.88, 45.6), (13.8, 45.61), (13.77, 45.63), (13.7, 45.66)]]),
    ("paz", [PAZIN]),
    ("frk", [L(FRANK_SEV, FRANK_JIH[1:], KVARNER[1:])]),
    ("dal", [L(KVARNER, CRES_ISTRIE, REV(VELEBIT)[:-1])]),
    ("ist", [L([(13.45, 45.62), (13.65, 45.62), (13.76, 45.61), (13.82, 45.58), (13.9, 45.58), (13.95, 45.55), (14.0, 45.48), (14.1, 45.4),
                (14.2, 45.3), (14.22, 45.18)], CRES_ISTRIE[:-1], [(13.7, 44.6), (13.4, 45.0), (13.35, 45.4)])]),
    ("chr", [L(REV(KUPA), [(16.65, 45.38)], REV(UNA), [(15.45, 44.15)], REV(VELEBIT)[1:], REV(FRANK_JIH)[1:-1])]),
    ("sla", [L([(15.47, 45.6), (15.55, 45.75)], STYR_JIH, REV(SLAV_HUN)[1:], [(17.19, 45.15), (16.92, 45.26), (16.65, 45.38)], KUPA)]),
    ("bos", [L(UNA, SAVA[1:], DRINA_DOLNI[1:], DRINA_HORNI[1:])]),
    ("srb", [L(REV(DRINA_HORNI), REV(MACVA)[1:], DUNAJ_SRB[1:])]),
    ("hun", [L(KARPATY, [(23.3, 44.15)], REV(DUNAJ_SRB), MACVA[1:], REV(DRINA_DOLNI)[1:], REV(SAVA)[1:-2], SLAV_HUN[1:], STYR_HUN[1:],
               [(20.6, 47.05)])]),
    ("gor", [L(KRAS, GORICE[1:], [(13.6, 45.77), (13.75, 45.75), (13.86, 45.68)]),
             [(12.2, 46.72), (12.2, 46.95), (12.4, 47.1), (12.75, 47.1), (12.95, 46.98), (13.0, 46.75), (12.85, 46.62), (12.45, 46.65)]]),
    ("fur", [L(FURL_ZAP, KARNSKE[2:], REV(JULSKE)[2:], GORICE[1:], [(13.55, 45.7), (13.1, 45.6), (12.85, 45.55)])]),
    ("kra", [L(KRAS, JULSKE[1:], KARAVANKY[1:], KRANJ_SAVA[1:], [(15.55, 45.75)], FRANK_SEV[::-1][1:], [(14.27, 45.2), (14.22, 45.18), (14.2, 45.3),
                                                                                                         (14.1, 45.4), (14.0, 45.48), (13.95, 45.55)])]),
    ("cel", [[(14.95, 46.3), (15.05, 46.42), (15.2, 46.45), (15.45, 46.4), (15.55, 46.3), (15.5, 46.15), (15.4, 46.0), (15.17, 46.07),
              (14.95, 46.12), (14.9, 46.2)]]),
    ("sty", [L(REV(KORUTANY_V), KRANJ_SAVA[1:], STYR_JIH[1:], STYR_HUN[1:])]),
    ("kor", [L([(13.0, 46.75), (12.95, 46.98), (13.2, 47.05), (13.55, 47.1), (13.8, 47.0), (14.0, 47.0), (14.3, 47.1), (14.5, 47.05), (14.7, 47.05)],
               REV(KORUTANY_V), REV(KARAVANKY)[1:], REV(KARNSKE)[:-2])]),
    ("brx", [[(11.45, 46.6), (11.6, 46.8), (11.75, 46.85), (12.0, 46.85), (12.1, 46.75), (12.05, 46.55), (11.95, 46.45), (11.7, 46.5), (11.55, 46.55)]]),
    ("trn", [L([(10.6, 46.25)], TRIDENT, [(11.8, 46.25)], REV(BENATKY_SEV[7:21]))]),
    ("tyr", [[(9.55, 47.55), (9.75, 47.55), (10.0, 47.4), (10.25, 47.38), (10.45, 47.4), (10.62, 47.5), (10.7, 47.1), (12.25, 47.1), (12.2, 46.95),
              (12.2, 46.72), (12.1, 46.62), (11.95, 46.45), (11.75, 46.35), (11.55, 46.35), (11.35, 46.3), (11.2, 46.3), (11.05, 46.5), (10.85, 46.47),
              (10.62, 46.4), (10.5, 46.35), (10.45, 46.55), (10.5, 46.7), (10.45, 46.85), (10.1, 46.85), (9.85, 47.0), (9.6, 47.05), (9.55, 47.25)]]),
    ("ven", [L(BENATKY_SEV, REV(FURL_ZAP), [(12.85, 45.45)], ADIZE_DOLNI, BEN_JIH[1:]),
             [(9.6, 45.3), (9.75, 45.3), (9.8, 45.42), (9.65, 45.47), (9.55, 45.42)],
             [(12.02, 44.32), (12.4, 44.3), (12.42, 44.55), (12.2, 44.57), (12.02, 44.45)]]),
    ("man", [L(REV(PAD_MAN), BEN_JIH[1:8])]),
    ("fer", [L(ADIZE_DOLNI, PAD_MAN[1:6], [(10.42, 44.7), (10.4, 44.4), (10.4, 44.15), (11.05, 44.15), (11.05, 44.4), (11.1, 44.6), (11.2, 44.75),
                                          (11.4, 44.65), (11.6, 44.6), (11.85, 44.55), (12.0, 44.57), (12.2, 44.57), (12.42, 44.55), (12.45, 44.7)])]),
    ("pap", [[(11.05, 44.15), (12.05, 44.15), (12.02, 44.32), (12.02, 44.45), (12.0, 44.57), (11.85, 44.55), (11.6, 44.6), (11.4, 44.65),
              (11.2, 44.75), (11.1, 44.6), (11.05, 44.4)]]),
    ("mil", [L([(9.25, 44.15), (10.4, 44.15), (10.4, 44.4), (10.42, 44.7)], PAD_MAN[6:], BEN_JIH[8:], BENATKY_SEV[1:6],
               [(10.5, 46.35), (10.45, 46.55), (10.3, 46.6), (10.15, 46.4), (10.05, 46.3), (9.85, 46.35), (9.55, 46.3), (9.35, 46.5), (9.25, 46.5)])]),
]
# kraje bez vlastní země v DUCHY – jen barva sousední země (NBRS): Tři spolky (Graubünden) a švýcarské Porýní
JEN_BARVA = {
    "nsw": [[(9.25, 46.5), (9.35, 46.5), (9.55, 46.3), (9.85, 46.35), (10.05, 46.3), (10.15, 46.4), (10.3, 46.6), (10.45, 46.55), (10.5, 46.7),
             (10.45, 46.85), (10.1, 46.85), (9.85, 47.0), (9.6, 47.05), (9.55, 47.25), (9.6, 47.5), (9.55, 47.62), (9.25, 47.62)]],
    # západní okraj (Hesensko, Würzburg, Švábsko): dřívější barvy sousedů jen dotažené k okraji světa
    "nsa": [[(9.25, 50.4), (10.2, 50.4), (10.2, 52.3), (9.25, 52.3)]],
    "nfr": [[(9.25, 48.98), (10.2, 48.98), (10.2, 50.4), (9.25, 50.4)]],
    "nba": [[(9.25, 47.45), (10.2, 47.45), (10.2, 48.98), (9.25, 48.98)]],
}
# barvy sousedních zemí (NBRS): která země patří ke které barvě
BARVA = {
    "nda": ["dan"], "nho": ["sle", "hol", "hmb", "lub", "lau", "lnb", "bre"], "nme": ["mek"], "npm": ["pwo", "pst", "psl"],
    "nrd": ["gpo", "kpr", "war", "rad"], "nlt": ["lit"], "npl": ["maz", "mpl", "rus", "kuj", "vlp"], "nbr2": ["brb", "nmk"],
    "nhu": ["hun", "sla", "chr", "frk"], "nbs": ["bos"], "nsr": ["srb"],
    "nat": ["kor", "kra", "sty", "cel", "gor", "tst", "paz", "tyr", "trn", "brx"], "nve": ["ven", "fur", "ist", "dal"], "nit": ["mil", "man", "fer", "pap"],
}


# ---------------------------------------------------------------- čtení a zápis skriptu mapy
NODE_CTI = r"""
const fs = require("fs");
const soubory = process.argv.slice(1, 4).map(f => fs.readFileSync(f, "utf8"));
const out = {};
for (const jmeno of process.argv.slice(4)) {
  for (const t of soubory) {
    const m = t.match(new RegExp("^const " + jmeno + " = ", "m"));
    if (!m) continue;
    let i = m.index + m[0].length, d = 0, j = i, s = null;
    for (; j < t.length; j++) {
      const c = t[j];
      if (s) { if (c === "\\") j++; else if (c === s) s = null; continue; }
      if (c === "/" && t[j + 1] === "*") { j = t.indexOf("*/", j) + 1; continue; }
      if (c === '"' || c === "'" || c === "`") s = c;
      else if ("[{(".includes(c)) d++;
      else if ("]})".includes(c) && !--d) break;
    }
    globalThis[jmeno] = out[jmeno] = eval("(" + t.slice(i, j + 1) + ")");
    break;
  }
}
process.stdout.write(JSON.stringify(out));
"""


def cti_js(*jmena):
    r = subprocess.run(["node", "-e", NODE_CTI, F02, F02B, F02E, *jmena], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def najdi_konec(t, i):
    """index uzavírající závorky k závorce na pozici i (přeskočí řetězce a komentáře)"""
    d, s, j = 0, None, i
    while j < len(t):
        c = t[j]
        if s:
            if c == "\\":
                j += 1
            elif c == s:
                s = None
        elif c == "/" and t[j + 1] == "*":
            j = t.index("*/", j) + 1
        elif c in "\"'`":
            s = c
        elif c in "[{(":
            d += 1
        elif c in "]})":
            d -= 1
            if not d:
                return j
        j += 1
    raise ValueError("neuzavřená závorka")


def js(v):
    return json.dumps(v, ensure_ascii=False, separators=(", ", ": "))


ZN_Z, ZN_K = "/* koruna_geo.py {%s} */", "/* koruna_geo.py {/%s} */"


def blok(t, nazev, obsah, kotva_konst=None):
    """vloží nebo nahradí vygenerovaný blok mezi značkami; poprvé ho vloží před konec pole/objektu kotva_konst"""
    z, k = ZN_Z % nazev, ZN_K % nazev
    if z in t:
        i, j = t.index(z), t.index(k) + len(k)
        return t[:i] + z + "\n" + obsah + "\n" + k + t[j:]
    m = re.search(r"^const " + kotva_konst + r" = ", t, re.M)
    a = m.end()
    e = najdi_konec(t, a)
    pred = t[:e].rstrip()
    if not pred.endswith((",", "[", "{")):
        pred += ","
    return pred + "\n" + z + "\n" + obsah + "\n" + k + "\n" + t[e:]


def nahrad_konst(t, jmeno, text):
    m = re.search(r"^const " + jmeno + r" = ", t, re.M)
    e = najdi_konec(t, m.end())
    return t[: m.end()] + text + t[e + 1 :]


def nahrad_klic(t, konst, klic, text):
    """nahradí hodnotu klíče v objektu konst (DUCHY_POLY)"""
    m = re.search(r"^const " + konst + r" = ", t, re.M)
    k = re.compile(r"^  " + klic + r": ", re.M).search(t, m.end())
    e = najdi_konec(t, k.end())
    return t[: k.end()] + text + t[e + 1 :]


def pripoj_k_prvku(t, konst, idx, body):
    """připojí body na konec idx-tého prvku pole konst (starý text prvku zůstane, jak je)"""
    return nahrad_prvek(t, konst, idx, None, body)


def nahrad_prvek(t, konst, idx, text, pripoj=None):
    """nahradí idx-tý prvek pole konst (nebo k němu připojí body)"""
    m = re.search(r"^const " + konst + r" = ", t, re.M)
    i = m.end() + 1
    n = -1
    while True:
        while t[i] in " \n\t,":
            i += 1
        if t[i] == "/":
            i = t.index("*/", i) + 2
            continue
        n += 1
        e = najdi_konec(t, i)
        if n == idx:
            if pripoj is not None:
                return t[:e].rstrip().rstrip(",") + ", " + ", ".join(js(q) for q in pripoj) + t[e:]
            return t[:i] + text + t[e + 1 :]
        i = e + 1


# ---------------------------------------------------------------- země
def poly(kruhy):
    """prstence sudo-liše (jako kresba v 02b): prstenec uvnitř jiného je díra (enkláva)"""
    g = Polygon()
    for k in kruhy:
        g = g.symmetric_difference(Polygon(k).buffer(0))
    return g.buffer(0)


# nová země, která má přednost i před starým obrysem: rovný okraj staré země u dřívějšího okraje mapy (Braniborsko do 10,6° v. d.)
PREDNOST = {"lnb": {"brb"}}


def zeme(stare):
    """nové a prodloužené země: {id: geometrie}; staré obrysy mají přednost, mezi novými rozhoduje pořadí"""
    stare_g = {k: poly(v) for k, v in stare.items()}
    vse_stare = unary_union(list(stare_g.values()))
    hotove, zabrane = {}, vse_stare
    for kid, kruhy in KRAJE_NOVE:
        uber = PREDNOST.get(kid, set())
        g = poly(kruhy).intersection(SVET).difference(zabrane.difference(unary_union([stare_g[k] for k in uber]) if uber else Polygon()))
        for k in uber:
            stare_g[k] = stare_g[k].difference(g)
        if g.area < 1e-4 and kid not in stare_g:
            print("prázdná země", kid, g.area)
        if kid in stare_g:
            g = g.union(stare_g[kid])
        hotove[kid] = g.buffer(0)
        zabrane = zabrane.union(g)
    return hotove


def kruhy_out(g, tol=0.004, min_plocha=0.0004):
    out = []
    for p in mnohouhelniky(g.simplify(tol)):
        if p.area < min_plocha:
            continue
        out.append(kruh(p.exterior.coords))
        out += [kruh(i.coords) for i in p.interiors if Polygon(i).area >= min_plocha]
    return out


def stitek(g, souse_g):
    """místo popisku a šířka (vodorovná tětiva v jednotkách mapy jako `w` u starých zemí)"""
    s = g.intersection(souse_g)
    p = max(mnohouhelniky(s), key=lambda q: q.area) if not s.is_empty else max(mnohouhelniky(g), key=lambda q: q.area)
    c = polylabel(p, 0.005)
    tet = LineString([(c.x - 30, c.y), (c.x + 30, c.y)]).intersection(p)
    w = 0
    for u in getattr(tet, "geoms", [tet]):
        if u.distance(c) < 1e-9:
            w = u.length * 72
    return [R3(c.x), R3(c.y)], round(w, 1)


# ---------------------------------------------------------------- poznámky k zemím (čtou je hráči: jen stav k 3. 3. 1458)
# id: (jméno, krátké jméno na mapě, rod z desk nebo None, poznámka)
META = {
    "dan": ("Království dánské", "Dánsko", None, "Král Kristián I. Oldenburský nosí korunu dánskou, norskou a od roku 1457 i švédskou. Kdo pluje z Baltu na západ, platí mu clo v Sundu."),
    "sle": ("Vévodství šlesvické", "Šlesvicko", None, "Léno dánské koruny, které drží starý vévoda Adolf, zároveň hrabě holštýnský. Je bezdětný a na dědictví už myslí jeho synovec, dánský král Kristián."),
    "hol": ("Hrabství holštýnské", "Holštýnsko", None, "Říšské hrabství schauenburského vévody Adolfa. Mezi Labem a Eiderou leží úrodné marše a zalesněné vrchy Vagrie."),
    "hmb": ("Hamburk", "Hamburk", None, "Hanzovní město na dolním Labi, brána Hanzy k Severnímu moři. Holštýnským hrabatům se klaní jen slovy, vládne si samo radou."),
    "lub": ("Svobodné říšské město Lübeck", "Lübeck", None, "Královna Hanzy: v její radnici se scházejí hanzovní sněmy a lübecké právo platí v desítkách měst od Holštýnska po Livonsko."),
    "lau": ("Vévodství sasko-lauenburské", "Lauenbursko", None, "Malé vévodství askánských vévodů na Labi s Ratzeburkem. Vede jím solná stezka z Lüneburku do Lübecku."),
    "lnb": ("Vévodství brunšvicko-lüneburské", "Lüneburk a Brunšvik", None, "Země Welfů rozdělená mezi několik větví. Lüneburk bohatne na solivaru, Brunšvik je mocné hanzovní město s pěti radami."),
    "bre": ("Arcibiskupství brémské", "Brémy", None, "Světské panství brémských arcibiskupů na levém břehu dolního Labe s městem Stade."),
    "mek": ("Meklenburská vévodství", "Meklenbursko", None, "Vládnou dvě linie meklenburských vévodů, ve Schwerinu a ve Stargardu. Hanzovní Rostock s vysokým učením a Wismar si drží vlastní práva."),
    "pwo": ("Pomořansko-volgastské vévodství", "Volgast", None, "Přední Pomořany s Rujánou; po smrti vévody Vartislava loni vládnou jeho synové. Hanzovní Stralsund a Greifswald si vládnou samy."),
    "pst": ("Pomořansko-štětínské vévodství", "Štětín", None, "Země na dolní Odře se Štětínem, kde vládne mladý vévoda Ota. S Braniborskem se Pomořané přou o pomezí v Uckermarce."),
    "psl": ("Pomořansko-slupské vévodství", "Słupsk", None, "Zadní Pomořany se Słupskem a Darłowem, kde dožívá někdejší král tří severských říší Erik Pomořanský. Kolobřeh a Koszalin patří kamínským biskupům."),
    "gpo": ("Gdaňské Pomoří", "Pomoří", None, "Bývalá země Řádu, od roku 1454 přivtělená k Polsku. Gdaňsk stojí při králi Kazimírovi a vypravuje kaperské lodi, ale Chojnice, Tczew a Gniew dosud drží žoldnéři Řádu."),
    "kpr": ("Prusy přidané k Polsku", "Polské Prusy", "jag", "Chełmińská země s Toruní, Elbląg a Malbork, které Pruský svaz roku 1454 poddal polskému králi. Hrad Malbork Poláci loni koupili od žoldnéřů Řádu, město však pro Řád znovu dobyl Šumborský."),
    "war": ("Biskupství varmijské", "Varmie", None, "Země varmijských biskupů mezi oběma válčícími stranami. Papež ji loni svěřil kardinálu Eneáši Silviovi, ten se jí však neujal."),
    "rad": ("Prusy Řádu německých rytířů", "Prusy Řádu", None, "Co Řádu zbylo po vzpouře pruských stavů: Sambie, Natangie a jezerní kraje na jihu. Velmistr Ludvík z Erlichshausenu sídlí od ztráty Malborku v Královci a dluží žoldnéřům obrovské sumy."),
    "lit": ("Velkoknížectví litevské", "Litva", "jag", "Velkým knížetem je král Kazimír. Do války v Prusích se Litva nevměšuje, jen zavřela žmuďskou hranici poslům a posilám z Livonska."),
    "rus": ("Ruské vojvodství", "Červená Rus", "jag", "Přemyšlská a sanocká země polské koruny, s hlavním městem Lvovem dále na východě. Vedle katolíků tu žije mnoho Rusínů řeckého vyznání."),
    "bos": ("Království bosenské", "Bosna", None, "Král Štěpán Tomáš se přiklonil k Římu a vypověděl Turkům válku, ale prý kolísá. Mnoho jeho poddaných drží vlastní bosenskou církev."),
    "srb": ("Srbský despotát", "Srbsko", None, "Despota Lazar zemřel letos v lednu a o dědictví se přou jeho vdova Helena, slepý bratr Řehoř s tureckou pomocí i Kantakuzina, vdova po Oldřichu Celjském. Smederevo a Golubac zahrazují Turkům cestu k Dunaji."),
    "sla": ("Slavonie", "Slavonie", "hun", "Země svaté uherské koruny mezi Drávou a Sávou se Záhřebem. Bánem je český hejtman Jan Vitovec, který po zavraždění hraběte Celjského ovládl většinu celjských hradů v zemi."),
    "chr": ("Království chorvatské", "Chorvatsko", "hun", "Země uherské koruny pod Velebitem a v Lice; pobřežní města drží Benátky, vnitrozemí chorvatští páni. Turci sem už podnikají nájezdy."),
    "frk": ("Země Frankopanů", "Frankopani", None, "Hrabata Frankopani, páni Krku, Senje a Modruše, se roku 1449 rozdělila na několik větví. Senj je jejich přístav, Krk jejich kolébka."),
    "kor": ("Vévodství korutanské", "Korutany", "hab", "Dědičná země císaře Fridricha III. Vévodu tu podle starého obyčeje uvádí na knížecí kámen u Krnského hradu sedlák, který se ho vyptává slovansky."),
    "kra": ("Vévodství kraňské", "Kraňsko", "hab", "Dědičná země císaře Fridricha III. s Lublaní, jejíž obránci roku 1442 odrazili Celjského a vévodu Albrechta. Suchým Krasem vedou cesty k moři."),
    "cel": ("Hrabství celjské", "Celjsko", None, "Po zavraždění posledního hraběte Oldřicha roku 1456 se o celjské dědictví hlásí dvacet čtyři uchazečů. Celji drží císař, ale hejtman Vitovec ho tam nedávno v noci málem zajal."),
    "gor": ("Hrabství gorické", "Gorice", None, "Hrabata gorická drží Gorici nad Sočou a Lienz na Drávě. Při nastolování korutanského vévody mají od starodávna svůj úřad."),
    "tst": ("Terst", "Terst", "hab", "Přístavní město, které se roku 1382 poddalo rakouským vévodům, aby se ubránilo Benátkám."),
    "paz": ("Pazinské hrabství", "Pazin", "hab", "Vnitrozemí Istrie kolem hradu Pazinu patří rakouskému domu; pobřeží drží Benátčané."),
    "ist": ("Benátská Istrie", "Istrie", None, "Pobřežní města Koper, Piran, Poreč a Pula poslouchají Benátky a mluví italsky i slovansky. O hranice s Rakušany se tu vedou spory."),
    "dal": ("Benátská Dalmácie a ostrovy", "Kvarner", None, "Ostrovy Cres, Lošinj, Rab a Pag i Zadar na pevnině patří od roku 1409 Benátkám, které je koupily od krále Ladislava Neapolského."),
    "fur": ("Furlánsko", "Furlánsko", None, "Země akvilejského patriarchy, kterou roku 1420 dobyli Benátčané; patriarchovi zůstala jen Akvileja a několik městeček. Pordenone v ní patří rakouskému domu."),
    "ven": ("Benátská pevnina", "Benátsko", None, "Panství Nejjasnější republiky na pevnině od Bergama po Treviso. Dóžetem je od loňského podzimu Pasquale Malipiero, po sesazeném starém Foscarim."),
    "mil": ("Vévodství milánské", "Milánsko", None, "Vévodou je od roku 1450 kondotiér Francesco Sforza, zeť posledního Viscontiho."),
    "man": ("Markrabství mantovské", "Mantova", None, "Malý, ale skvělý dvůr markraběte Ludvíka Gonzagy uprostřed jezer a bažin na řece Mincio."),
    "fer": ("Ferrarsko a Modena", "Ferrara", None, "Panství rodu d'Este: Borso je markrabětem ferrarským a od roku 1452 z císařovy milosti vévodou modenským a reggijským."),
    "pap": ("Papežský stát", "Bologna", "pap", "Severní výspa papežských zemí. Bologni vládne pod papežskou svrchovaností rod Bentivogliů."),
    "trn": ("Biskupství tridentské", "Trident", None, "Světské panství tridentských biskupů, nad nímž drží ochrannou ruku hrabata tyrolská."),
    "brx": ("Biskupství brixenské", "Brixen", None, "Biskupem je kardinál Mikuláš Kusánský, učený reformátor, který se tvrdě pře s vévodou Zikmundem Tyrolským o práva svého kostela."),
}
# města na ostrovech v laguně, která musí zůstat souší i v hrubé vodě pro cesty (Benátky, Chioggia, Grado)
OSTROVNI_MESTA = [(12.335, 45.437), (12.28, 45.22), (13.385, 45.678)]
PRODLOUZENE = {"brb", "nmk", "vlp", "kuj", "maz", "mpl", "hun", "sty", "tyr"}
PALETA = ["dpr", "dol", "dvr", "dmi", "dre", "dkr", "dpa", "dx1", "dx2", "dx3"]

# ---------------------------------------------------------------- řeky: (cíl, jméno v Natural Earth nebo None, od, do, body ručně, popisek)
# „+N“ v cíli = prodloužení N-tého prvku pole (body se připojí na konec); jinak nová řeka. Popisek: jméno nebo None.
REKY = [
    ("RIVERS+0", "Elbe", (11.7, 52.1), (10.05, 53.47), [(9.95, 53.54), (9.8, 53.56), (9.62, 53.62), (9.45, 53.72), (9.3, 53.84)], "Labe"),
    ("RIVERS+2", "Oder", (14.4, 52.65), (14.6, 53.62), None, "Odra"),
    ("RIVERS+5", "Danube", (19.0, 47.3), (22.95, 44.15), None, "Dunaj"),
    ("RIVERS+6", "Vistula", (20.4, 50.18), (18.84, 54.12), [(18.82, 54.22), (18.75, 54.33), (18.67, 54.41)], "Visla"),
    ("RIVERS", "Donau", (9.25, 48.12), (11.0, 48.75), None, "Dunaj"),
    ("RIVERS", "Drau", (12.77, 46.84), (16.88, 46.31), {"pred": [(12.3, 46.73), (12.5, 46.76)], "po": [(17.1, 46.1), (17.45, 45.95), (17.8, 45.8),
                                                                                           (18.15, 45.75), (18.4, 45.73), (18.69, 45.56), (18.92, 45.55)]}, "Dráva"),
    ("RIVERS", "Sava", (14.64, 46.08), (20.45, 44.82), {"pred": [(13.85, 46.48), (14.05, 46.38), (14.2, 46.3), (14.35, 46.22), (14.5, 46.12)]}, "Sáva"),
    ("RIVERS", "Tisa", (20.18, 46.26), (20.3, 45.2), {"pred": [(23.25, 48.0), (22.85, 48.1), (22.4, 48.25), (22.1, 48.38), (21.85, 48.37),
                                                              (21.65, 48.25), (21.42, 48.13), (21.1, 47.95), (20.75, 47.6), (20.55, 47.45),
                                                              (20.35, 47.25), (20.2, 47.17), (20.1, 46.95), (20.15, 46.7), (20.18, 46.4)]}, "Tisa"),
    ("RIVERS", "Po", (9.25, 45.1), (12.32, 44.95), None, "Pád"),
    ("RIVERS", "Adige", (10.45, 46.85), (12.32, 45.15), None, "Adiže"),
    ("TRIBS+31", "Warta", (15.5, 52.75), (14.65, 52.59), None, "Varta"),
    ("TRIBS", "Noteć", (18.35, 52.6), (15.4, 52.73), None, "Noteć"),
    ("TRIBS", "Drwęca", (20.0, 53.65), (18.73, 53.03), None, "Drwęca"),
    ("TRIBS", None, None, None, [(18.92, 53.92), (19.03, 54.04), (19.15, 54.1), (19.28, 54.2), (19.35, 54.25)], "Nogat"),
    ("TRIBS", None, None, None, [(21.8, 54.63), (21.5, 54.62), (21.22, 54.61), (20.95, 54.67), (20.7, 54.7), (20.51, 54.71), (20.35, 54.68)], "Pregola"),
    ("TRIBS", "Łyna", (20.48, 53.65), (21.22, 54.61), None, "Łyna"),
    ("TRIBS", None, None, None, [(20.35, 53.75), (20.25, 53.95), (20.12, 54.12), (20.05, 54.28), (19.9, 54.38), (19.8, 54.43)], "Pasłęka"),
    ("TRIBS", "Neman", (23.25, 54.95), (21.3, 55.3), None, "Němen"),
    ("TRIBS", "Narew", (23.25, 53.0), (21.08, 52.53), [(20.9, 52.45), (20.7, 52.44)], "Narev"),
    ("TRIBS", "Bug", (23.25, 52.25), (21.05, 52.5), None, "Bug"),
    ("TRIBS", "San", (22.8, 49.55), (21.85, 50.73), None, "San"),
    ("TRIBS", "Gwda", (16.75, 53.75), (16.75, 53.05), None, None),
    ("TRIBS", None, None, None, [(16.0, 53.7), (15.85, 53.5), (15.95, 53.25), (16.0, 53.0), (15.85, 52.88)], None),
    ("TRIBS", None, None, None, [(13.05, 53.25), (13.2, 52.95), (13.2, 52.6), (13.18, 52.53), (13.1, 52.42), (12.9, 52.4), (12.55, 52.41),
                                 (12.35, 52.55), (12.33, 52.65), (12.25, 52.8), (12.05, 52.88)], "Havola"),
    ("TRIBS", None, None, None, [(12.75, 53.75), (12.95, 53.85), (13.05, 53.9), (13.3, 53.87), (13.55, 53.86), (13.69, 53.86), (13.8, 53.87)], "Peene"),
    ("TRIBS", None, None, None, [(11.7, 53.6), (11.9, 53.75), (12.0, 53.85), (12.05, 54.0), (12.1, 54.1), (12.08, 54.18)], "Warnow"),
    ("TRIBS", None, None, None, [(10.4, 53.95), (10.55, 53.88), (10.69, 53.87), (10.8, 53.93), (10.88, 53.96)], "Trave"),
    ("TRIBS", None, None, None, [(10.05, 54.2), (9.85, 54.25), (9.67, 54.3), (9.45, 54.27), (9.25, 54.28)], "Eidera"),
    ("TRIBS", None, None, None, [(15.6, 53.6), (15.45, 53.75), (15.3, 53.95), (15.27, 54.08), (15.2, 54.15)], "Rega"),
    ("TRIBS", None, None, None, [(16.3, 53.8), (16.0, 53.95), (15.75, 54.05), (15.58, 54.18)], "Parsęta"),
    ("TRIBS", None, None, None, [(17.2, 54.1), (17.1, 54.3), (17.03, 54.46), (16.9, 54.58)], "Słupia"),
    ("TRIBS", "Inn", (9.85, 46.5), (12.2, 47.85), None, "Inn"),
    ("TRIBS", "Salzach", (12.2, 47.25), (12.88, 48.2), None, "Salice"),
    ("TRIBS", "Enns", (13.45, 47.38), (14.4, 47.7), None, "Enže"),
    ("TRIBS", None, None, None, [(10.7, 47.4), (10.75, 47.65), (10.85, 47.9), (10.88, 48.2), (10.9, 48.37), (10.92, 48.55), (10.95, 48.72)], "Lech"),
    ("TRIBS", "Main", (11.58, 49.94), (9.25, 49.75), None, "Mohan"),
    ("TRIBS", "Mur", (13.4, 47.12), (16.88, 46.3), None, "Mura"),
    ("TRIBS", None, None, None, [(14.75, 45.9), (14.95, 45.83), (15.17, 45.8), (15.35, 45.85), (15.6, 45.9)], "Krka"),
    ("TRIBS", None, None, None, [(14.62, 45.5), (14.85, 45.47), (15.1, 45.48), (15.28, 45.46), (15.4, 45.55), (15.47, 45.6), (15.55, 45.49),
                                 (15.75, 45.5), (16.0, 45.5), (16.2, 45.48), (16.37, 45.47)], "Kupa"),
    ("TRIBS", "Una", (16.15, 44.4), (16.92, 45.26), None, "Una"),
    ("TRIBS", "Vrbas", (17.2, 44.4), (17.45, 45.1), None, None),
    ("TRIBS", "Bosna", (18.05, 44.4), (18.4, 45.06), None, None),
    ("TRIBS", "Drina", (19.35, 44.15), (19.35, 44.88), None, "Drina"),
    ("TRIBS", "Mures", (23.25, 46.0), (20.2, 46.15), None, "Maroš"),
    ("TRIBS", None, None, None, [(13.55, 46.38), (13.58, 46.25), (13.73, 46.18), (13.64, 46.08), (13.62, 45.94), (13.52, 45.85), (13.55, 45.72)], "Soča"),
    ("TRIBS", None, None, None, [(12.6, 46.43), (12.85, 46.42), (13.0, 46.4), (13.14, 46.33), (13.0, 46.15), (12.95, 45.95), (13.0, 45.78),
                                 (13.1, 45.64)], "Tagliamento"),
    ("TRIBS", "Piave", (12.6, 46.6), (12.6, 45.52), None, "Piava"),
    ("TRIBS", None, None, None, [(11.3, 46.0), (11.5, 46.05), (11.65, 45.95), (11.73, 45.77), (11.8, 45.6), (11.95, 45.42), (12.15, 45.4), (12.25, 45.42)], "Brenta"),
    ("TRIBS", "Mincio", (10.7, 45.43), (11.03, 45.05), None, None),
    ("TRIBS", "Oglio", (10.35, 46.25), (10.45, 45.05), None, None),
    ("TRIBS", "Adda", (9.9, 46.45), (9.85, 45.1), None, None),
]

# jezera: (jméno, zdroj, popisek ano/ne); zdroj = ("ne", jméno v NE), ("box", lon0, lat0, lon1, lat1) – nejmenší jezero v obdélníku, nebo body
JEZ = [
    ("Balaton", ("ne", "Lake Balaton"), True), ("Gardské jezero", ("ne", "Lago di Garda"), True),
    ("Bodamské jezero", ("ne", "Bodensee"), True), ("Müritz", ("ne", "Müritz"), True), ("Schwerinské jezero", ("ne", "Schweriner See"), True),
    ("Chiemské jezero", ("ne", "CHIEMSEE"), True), ("Starnberské jezero", ("ne", "Starnberger See"), False), ("Ammerské jezero", ("ne", "Ammersee"), False),
    ("Attersee", ("ne", "Attersee"), False), ("Traunské jezero", ("ne", "Traunsee"), False), ("Vrbské jezero", ("ne", "Wörthersee"), True),
    ("Iseo", ("ne", "Lago d' Iseo"), False), ("Plauer See", ("ne", "Plauer See"), False), ("Kummerower See", ("ne", "Kummerower See"), False),
    ("Kölpinsee", ("ne", "Kölpinsee"), False), ("Schaalsee", ("ne", "Lassahner See"), False), ("Selenter See", ("ne", "Selenter See"), False),
    ("Łebsko", ("ne", "Jezioro Łebsko"), False), ("Gardno", ("ne", "Jezioro Gardno"), False), ("Drawsko", ("ne", "Drawsko"), False),
    ("Miedwie", ("ne", "Miedwie"), False), ("Dąbie", ("ne", "Jezioro Dąbie"), False), ("Gopło", ("ne", "Gopło"), True),
    ("Plönské jezero", ("box", 10.3, 54.05, 10.5, 54.2), False), ("Śniardwy", ("box", 21.5, 53.65, 21.9, 53.82), True),
    ("Mamry", ("box", 21.55, 54.0, 21.85, 54.25), True), ("Niegocin", ("box", 21.45, 53.78, 21.6, 53.95), False),
    ("Roś", ("box", 21.78, 53.62, 22.0, 53.7), False), ("Jezioro Tałty", ("box", 21.6, 53.85, 21.85, 54.05), False),
    ("Jeziorak", ("box", 19.5, 53.58, 19.7, 53.82), False), ("Wigry", ("box", 23.0, 54.0, 23.15, 54.1), False),
    ("Comacchijské laguny", ("box", 12.05, 44.5, 12.3, 44.75), False), ("Jasmundský bodden", ("box", 13.45, 54.4, 13.6, 54.5), False),
    ("Havola u Braniborska", ("box", 12.35, 52.33, 12.55, 52.43), False), ("Schwielowsee", ("box", 12.85, 52.33, 13.0, 52.45), False),
    ("Templiner See", ("box", 12.9, 52.3, 13.0, 52.37), False), ("Havolská jezera", ("box", 13.05, 52.4, 13.25, 52.55), False),
    ("Müggelsee", ("box", 13.6, 52.4, 13.7, 52.47), False), ("Schwielochsee", ("box", 14.15, 52.0, 14.27, 52.13), False),
    ("Milštatské jezero", [(13.5, 46.79), (13.58, 46.795), (13.66, 46.802), (13.66, 46.812), (13.58, 46.808), (13.5, 46.803)], False),
    ("Osojské jezero", [(13.9, 46.655), (13.96, 46.67), (14.02, 46.695), (14.015, 46.705), (13.955, 46.68), (13.895, 46.665)], False),
    ("Bledské jezero", [(14.08, 46.362), (14.1, 46.358), (14.112, 46.365), (14.105, 46.372), (14.085, 46.372)], True),
    ("Bohinjské jezero", [(13.84, 46.283), (13.87, 46.278), (13.9, 46.282), (13.895, 46.29), (13.865, 46.29), (13.84, 46.29)], False),
    ("Cerknické jezero", [(14.33, 45.765), (14.38, 45.75), (14.42, 45.735), (14.425, 45.745), (14.39, 45.765), (14.35, 45.78)], True),
]


# ---------------------------------------------------------------- výpočet
def rekove_linie():
    lin = {}
    for fn in ("ne_10m_rivers_lake_centerlines", "ne_10m_rivers_europe"):
        for f in ne(fn):
            n = f["properties"].get("name")
            g = shape(f["geometry"])
            if n and g.intersects(SVET.buffer(1)):
                lin.setdefault(n, []).extend(getattr(g, "geoms", [g]))
    return lin


def usek_reky(linie, a, b):
    """část řeky z Natural Earth mezi body a a b (po proudu), zjednodušená"""
    m = linemerge(MultiLineString(linie))
    casti = list(getattr(m, "geoms", [m]))
    # nejbližší souvislá linie k oběma bodům
    L = min(casti, key=lambda c: c.distance(Point(a)) + c.distance(Point(b)))
    da, db = L.project(Point(a)), L.project(Point(b))
    u = substring(L, min(da, db), max(da, db))
    pts = list(u.simplify(0.012).coords)
    if da > db:
        pts.reverse()
    out = []
    for x, y in pts:
        q = [R2(x), R2(y)]
        if not out or out[-1] != q:
            out.append(q)
    return out


def uhel(body, f=0.5):
    """místo a otočení popisku řeky v poměru f délky (otočení v obrazovkových stupních jako RIVLBL)"""
    L = LineString(body)
    p = L.interpolate(f, normalized=True)
    q1, q2 = L.interpolate(max(0, f - 0.06), normalized=True), L.interpolate(min(1, f + 0.06), normalized=True)
    (x1, y1), (x2, y2) = P(q1.x, q1.y), P(q2.x, q2.y)
    a = math.degrees(math.atan2(y2 - y1, x2 - x1))
    if a > 90:
        a -= 180
    if a < -90:
        a += 180
    return [R2(p.x), R2(p.y), round(a)]


def jezera():
    vse = [shape(f["geometry"]) for fn in ("ne_10m_lakes", "ne_10m_lakes_europe") for f in ne(fn)]
    jm = {f["properties"].get("name"): shape(f["geometry"]) for fn in ("ne_10m_lakes", "ne_10m_lakes_europe") for f in ne(fn)}
    out, plochy = [], []
    for nazev, zdroj, lbl in JEZ:
        if isinstance(zdroj, list):
            g = Polygon(zdroj)
        elif zdroj[0] == "ne":
            g = jm[zdroj[1]]
        else:
            b = box(*zdroj[1:])
            kand = [x for x in vse if b.contains(x.representative_point()) and x.area < 0.05]
            g = max(kand, key=lambda x: x.area)
        g = g.intersection(SVET)
        p = max(mnohouhelniky(g), key=lambda x: x.area)
        s = p.simplify(0.006) if not isinstance(zdroj, list) else p
        k = kruh(s.exterior.coords)
        c = polylabel(p, 0.002)
        out.append([nazev, k, [R2(c.x), R2(c.y), 0] if lbl else None])
        plochy.append((nazev, p))
    return out, plochy


def spocti():
    data = cti_js("NBRS", "DUCHY_POLY", "DUCHY", "RIVERS", "TRIBS", "LANDS")
    puvodni_nove = set(META)
    stare = {k: v for k, v in data["DUCHY_POLY"].items() if k not in puvodni_nove}
    S = souse()
    Z = zeme(stare)
    stare_g = {k: poly(v) for k, v in stare.items()}
    # jen nové kusy (bez starých obrysů) – podle nich se přebarví a prodlouží sousední země
    nove_kusy = {k: (g.difference(stare_g[k]) if k in stare_g else g) for k, g in Z.items()}
    kraj_barvy = {kid: c for c, ids in BARVA.items() for kid in ids}
    plochy = {}
    for kid, g in nove_kusy.items():
        plochy.setdefault(kraj_barvy[kid], []).append(g)
    stare_nbrs = unary_union([poly(rs) for c, rs in data["NBRS"]])
    for c, kk in JEN_BARVA.items():
        plochy.setdefault(c, []).append(poly(kk).difference(unary_union(list(Z.values()))).difference(stare_nbrs))
    plochy = {c: unary_union(v) for c, v in plochy.items()}
    # mezery mezi zeměmi (souš bez barvy a mimo Korunu) dostane soused s nejdelší společnou hranicí
    koruna = unary_union([poly(rs) for f, rs in data["LANDS"]])
    pokryto = unary_union([stare_nbrs, koruna, *plochy.values()])
    for d in mnohouhelniky(S.difference(pokryto).buffer(0)):
        if d.area < 1e-5 or d.distance(koruna) < 0.02:
            continue  # drobné nepřesnosti starých hranic u Koruny nechat, jak jsou
        styk = {c: g.intersection(d.buffer(0.01)).area for c, g in plochy.items()}
        styk.update({c: poly(rs).intersection(d.buffer(0.01)).area + styk.get(c, 0) for c, rs in data["NBRS"]})
        c = max(styk, key=styk.get)
        plochy[c] = unary_union([plochy.get(c, Polygon()), d.simplify(0.002)])
    # NBRS: staré obrysy + nové kusy, bez nových kusů jiných zemí
    nbrs = []
    hotove = set()
    for c, rs in data["NBRS"]:
        g = poly(rs).union(plochy.get(c, Polygon()))
        g = g.difference(unary_union([v for k, v in plochy.items() if k != c])).buffer(0)
        nbrs.append([c, kruhy_out(g, tol=0, min_plocha=0.002)])
        hotove.add(c)
    for c, g in plochy.items():
        if c in hotove:
            continue
        nbrs.append([c, kruhy_out(g.difference(unary_union([v for k, v in plochy.items() if k != c])).buffer(0), tol=0, min_plocha=0.002)])
    # DUCHY_POLY a DUCHY
    duchy_poly = {k: kruhy_out(g, tol=0, min_plocha=0.0005) for k, g in Z.items()}
    barvy = {u["id"]: u["c"] for u in data["DUCHY"]}
    sous = {k: poly(v) for k, v in data["DUCHY_POLY"].items() if k not in puvodni_nove}
    sous.update(Z)
    duchy = []
    for kid, _ in KRAJE_NOVE:
        if kid not in META:
            continue
        g = Z[kid]
        zabrane = {barvy[o] for o, h in sous.items() if o != kid and o in barvy and h.buffer(0.02).intersects(g)}
        barva = next(c for c in PALETA if c not in zabrane)
        barvy[kid] = barva
        lab, w = stitek(g, S)
        jm, s, h, note = META[kid]
        duchy.append({"id": kid, "name": jm, "s": s, "h": h, "dom": 0, "note": note, "c": barva, "lab": lab, "w": w})
    # moře
    more = SVET.difference(S).simplify(0.008)
    more_kruhy = []
    for p in mnohouhelniky(more):
        if p.area < 0.002:
            continue
        more_kruhy.append(kruh(p.exterior.coords))
        for i in p.interiors:
            if Polygon(i).area >= 0.00015:
                more_kruhy.append(kruh(i.coords))
    # jezera
    jez, jez_plochy = jezera()
    # voda pro výpočet cest: moře a velká jezera, zúžené dovnitř (pobřežní místa nikdy neleží „ve vodě“)
    hrube = SVET.difference(S).buffer(-0.03).simplify(0.04).difference(unary_union([Point(q).buffer(0.04) for q in OSTROVNI_MESTA]))
    velka = [p.buffer(-0.005).simplify(0.01) for n, p in jez_plochy if p.area > 0.005]
    voda = []
    for p in mnohouhelniky(hrube) + [q for v in velka for q in mnohouhelniky(v)]:
        if p.area < 0.004:
            continue
        voda.append(kruh(p.exterior.coords, R2))
        for i in p.interiors:
            if Polygon(i).area >= 0.02:
                voda.append(kruh(Polygon(i).simplify(0.04).exterior.coords, R2))
    # řeky
    lin = rekove_linie()
    reky = {"RIVERS": [], "TRIBS": [], "RIVERS+": {}, "TRIBS+": {}, "RIVLBL": []}
    for cil, jm, a, b, ruka, lbl in REKY:
        body = usek_reky(lin[jm], a, b) if jm else []
        if jm and (math.dist(body[0], a) > 0.15 or math.dist(body[-1], b) > 0.15):
            print("pozor, řeka", jm, "začíná", body[0], "místo", a, "a končí", body[-1], "místo", b)
        if isinstance(ruka, dict):
            body = [[R2(x), R2(y)] for x, y in ruka.get("pred", [])] + body + [[R2(x), R2(y)] for x, y in ruka.get("po", [])]
        elif ruka:
            body += [[R2(x), R2(y)] for x, y in ruka]
        if "+" in cil:
            pole, idx = cil.split("+")
            stary = data[pole][int(idx)]
            if stary[-1] == body[-1]:  # už prodlouženo – jen popisek
                if lbl:
                    reky["RIVLBL"].append([lbl, *uhel(body)])
                continue
            body = [q for q in body if q != stary[-1]]
            # začátek prodloužení navazuje na starý konec
            while len(body) > 1 and math.dist(body[0], stary[-1]) > math.dist(body[1], stary[-1]):
                body.pop(0)
            reky[pole + "+"][int(idx)] = body
            if lbl:
                reky["RIVLBL"].append([lbl, *uhel(body)])
        else:
            reky[cil].append(body)
            if lbl:
                reky["RIVLBL"].append([lbl, *uhel(body)])
    return {"S": S, "Z": Z, "nbrs": nbrs, "duchy_poly": duchy_poly, "duchy": duchy, "more": more_kruhy, "jezera": jez, "voda": voda,
            "reky": reky, "rivnames": [lbl for cil, jm, a, b, ruka, lbl in REKY if cil == "RIVERS"]}


def pocet(v):
    return sum(pocet(x) for x in v) if isinstance(v, list) and v and isinstance(v[0], list) else 1


def zapis(V):
    t = open(F02B).read()
    t = nahrad_konst(t, "NBRS", js(V["nbrs"]))
    nove = []
    for k, rs in V["duchy_poly"].items():
        if k in META:
            nove.append(f"  {k}: {js(rs)},")
        else:
            t = nahrad_klic(t, "DUCHY_POLY", k, js(rs))
    t = blok(t, "zeme", "\n".join(nove), "DUCHY_POLY")
    t = nahrad_konst(t, "MORE", js(V["more"]))
    t = nahrad_konst(t, "JEZERA_V", js(V["jezera"]))
    R = V["reky"]
    for idx, body in R["TRIBS+"].items():
        t = pripoj_k_prvku(t, "TRIBS", idx, body)
    if R["TRIBS"]:
        t = blok(t, "reky", "\n".join(js(b) + "," for b in R["TRIBS"]), "TRIBS")
    if R["RIVLBL"]:
        t = blok(t, "popisky", "\n".join(js(b) + "," for b in R["RIVLBL"]), "RIVLBL")
    open(F02B, "w").write(t)
    t = open(F02).read()
    t = blok(t, "zeme", "\n".join(js(u) + "," for u in V["duchy"]), "DUCHY")
    for idx, body in R["RIVERS+"].items():
        t = pripoj_k_prvku(t, "RIVERS", idx, body)
    if R["RIVERS"]:
        t = blok(t, "reky", "\n".join(js(b) + "," for b in R["RIVERS"]), "RIVERS")
    open(F02, "w").write(t)
    t = open(F02E).read()
    t = nahrad_konst(t, "VODA_CESTA", js(V["voda"]))
    open(F02E, "w").write(t)
    subprocess.run(["npx", "prettier", "--write", "--log-level", "warn", F02, F02B, F02E], cwd=KOREN, check=True)


def obrazek(V, cesta):
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig = plt.figure(figsize=(16, 16 * 11.5 * 112 / (14 * 72)))
    ax = fig.add_axes([0.02, 0.02, 0.96, 0.96])
    ax.set_xlim(9.25, 23.25)
    ax.set_ylim(44.15, 55.65)
    ax.set_aspect(112 / 72)
    for c, rs in V["nbrs"]:
        for r in rs:
            xs, ys = zip(*r)
            ax.fill(xs, ys, alpha=0.3, lw=0.6, ec="k")
    for r in V["more"]:
        xs, ys = zip(*r)
        ax.plot(xs, ys, color="#36c", lw=0.5)
    for r in V["voda"]:
        xs, ys = zip(*r)
        ax.plot(xs, ys, color="r", lw=0.4)
    for n, r, l in V["jezera"]:
        xs, ys = zip(*r)
        ax.fill(xs, ys, color="#36c")
    for b in V["reky"]["RIVERS"] + V["reky"]["TRIBS"] + list(V["reky"]["RIVERS+"].values()) + list(V["reky"]["TRIBS+"].values()):
        xs, ys = zip(*b)
        ax.plot(xs, ys, color="#06f", lw=1)
    for t, x, y, r in V["reky"]["RIVLBL"]:
        ax.text(x, y, t, fontsize=7, color="#036", rotation=-r)
    for u in V["duchy"]:
        ax.text(*u["lab"], u["s"], fontsize=7, ha="center")
    fig.savefig(cesta, dpi=80)


def obnov(commit):
    """vrátí do skriptu mapy původní data, ke kterým se přidávají nové kusy (stav z commitu před rozšířením)"""

    def puvodni(f):
        return subprocess.run(["git", "-C", KOREN, "show", f"{commit}:zdroj/web/js/{f}"], capture_output=True, text=True, check=True).stdout

    def hodnota(t, m):
        return t[m.end() : najdi_konec(t, m.end()) + 1]

    def prvek(t, konst, idx):
        m = re.search(r"^const " + konst + r" = ", t, re.M)
        i, n = m.end() + 1, -1
        while True:
            while t[i] in " \n\t,":
                i += 1
            if t[i] == "/":
                i = t.index("*/", i) + 2
                continue
            n += 1
            e = najdi_konec(t, i)
            if n == idx:
                return t[i : e + 1]
            i = e + 1

    b02, b02b = puvodni("02-mapa.js"), puvodni("02b-mapa-kresba.js")
    t = open(F02B).read()
    t = nahrad_konst(t, "NBRS", hodnota(b02b, re.search(r"^const NBRS = ", b02b, re.M)))
    for k in PRODLOUZENE:
        m = re.search(r"^const DUCHY_POLY = ", b02b, re.M)
        t = nahrad_klic(t, "DUCHY_POLY", k, hodnota(b02b, re.compile(r"^  " + k + r": ", re.M).search(b02b, m.end())))
    for pole, idx in [(c.split("+")[0], int(c.split("+")[1])) for c, *_ in REKY if "+" in c]:
        if pole == "TRIBS":
            t = nahrad_prvek(t, "TRIBS", idx, prvek(b02b, "TRIBS", idx))
    open(F02B, "w").write(t)
    t = open(F02).read()
    for pole, idx in [(c.split("+")[0], int(c.split("+")[1])) for c, *_ in REKY if "+" in c]:
        if pole == "RIVERS":
            t = nahrad_prvek(t, "RIVERS", idx, prvek(b02, "RIVERS", idx))
    open(F02, "w").write(t)


if __name__ == "__main__":
    if OD and ZAPIS:
        obnov(OD)
    V = spocti()
    print("NBRS bodů:", pocet(V["nbrs"]), "| země nové:", len(V["duchy"]), "bodů DUCHY_POLY:", pocet(list(V["duchy_poly"].values())))
    print("moře: prstenců", len(V["more"]), "bodů", pocet(V["more"]), "| voda pro cesty: prstenců", len(V["voda"]), "bodů", pocet(V["voda"]))
    print("jezera:", len(V["jezera"]), "bodů", pocet([j[1] for j in V["jezera"]]))
    R = V["reky"]
    print("řeky nové:", len(R["RIVERS"]), "+", len(R["TRIBS"]), "prodloužené:", sorted(R["RIVERS+"]), sorted(R["TRIBS+"]),
          "bodů", pocet(R["RIVERS"] + R["TRIBS"]), "| RIVNAMES +", V["rivnames"])
    if OBR:
        obrazek(V, OBR)
    if ZAPIS:
        zapis(V)
        print("zapsáno")
