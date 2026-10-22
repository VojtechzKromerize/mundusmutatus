"""Rozřeže arch malovaných ikon z ChatGPT (mřížka sloupce × řádky) na jednotlivé ikony art/img/boj/<nazev>-48/-96.webp.

ChatGPT často vrátí místo průhlednosti „šachovnici“ vpečenou do obrázku (RGB). Pozadí se proto pozná podle barvy:
šedobílé až namodralé, světlé pixely (okraj samolepky je krémový, tedy teplejší) – a jen souvislé plochy, ve kterých se
střídají dva odstíny šachovnice, aby se nesmazaly bílé části ikon (pírko, šátek, mrak).

  python3 podklady/ikony_z_archu.py arch.png 3x2 uhyb vzdal prah-smrti stabilizovan zajat zmizeni
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

def maska_pozadi(a):
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    mn = np.minimum(np.minimum(r, g), b)
    svetle = mn > 180
    neutr = (np.abs(r - g) <= 10) & (b - r >= -3) & (b - r <= 18)
    kand = svetle & neutr
    lab, n = ndimage.label(kand)
    jas = (r + g + b) / 3
    tmavy = jas < 240
    H, W = kand.shape
    okraj = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    out = np.zeros(kand.shape, bool)
    for i in okraj:
        out |= lab == i
    # perioda šachovnice z pozadí u okraje: posun, při kterém se světlé a tmavé pole nejvíc střídají
    def strid(m, p):
        v = m[:, :-p] & m[:, p:]
        return (tmavy[:, :-p][v] != tmavy[:, p:][v]).mean() if v.sum() > 500 else 0
    per = max(range(4, 40), key=lambda p: strid(out, p)) if out.any() else 12
    # uzavřené plochy (mezi listy věnce, uvnitř kompasu…) jen tehdy, když opravdu mají pravidelnou šachovnici –
    # bílá mlha, pírko nebo šátek mají nepravidelnou texturu a zůstanou
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        if i in okraj:
            continue
        m = lab == i
        if m[sl].sum() < 40:
            continue
        if strid(m, per) > 0.72 and strid(m, 2 * per) < 0.35:
            out |= m
    return out

def rez(arch, mrizka, jmena, cil):
    im = Image.open(arch).convert("RGB")
    a = np.array(im)
    bg = maska_pozadi(a)
    bg = ndimage.binary_dilation(bg, iterations=1) & ~ndimage.binary_erosion(~bg, iterations=2)  # lem šachovnice pryč
    alfa = (~bg).astype(np.uint8) * 255
    alfa = ndimage.binary_opening(alfa > 0, iterations=1)
    lab, n = ndimage.label(alfa)
    vel = ndimage.sum(alfa, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, v in enumerate(vel) if v > 300])
    rgba = np.dstack([a, (keep * 255).astype(np.uint8)])
    sl, rd = map(int, mrizka.lower().split("x"))
    H, W = keep.shape
    cw, ch = W / sl, H / rd
    lab2, n2 = ndimage.label(keep)
    cent = ndimage.center_of_mass(keep, lab2, range(1, n2 + 1))
    for k, jm in enumerate(jmena):
        if jm in ("-", ""):
            continue
        cx, cy = k % sl, k // sl
        # součásti ikony = komponenty, jejichž těžiště leží v buňce
        ids = [i + 1 for i, (y, x) in enumerate(cent) if cx * cw <= x < (cx + 1) * cw and cy * ch <= y < (cy + 1) * ch]
        m = np.isin(lab2, ids)
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        kus = rgba[y0:y1, x0:x1].copy()
        kus[..., 3] = np.where(m[y0:y1, x0:x1], kus[..., 3], 0)
        h, w = kus.shape[:2]
        s = int(max(h, w) * 1.06)
        ctv = np.zeros((s, s, 4), np.uint8)
        oy, ox = (s - h) // 2, (s - w) // 2
        ctv[oy:oy + h, ox:ox + w] = kus
        obr = Image.fromarray(ctv, "RGBA")
        for px in (96, 48):
            obr.resize((px, px), Image.LANCZOS).save(os.path.join(cil, f"{jm}-{px}.webp"), "WEBP", quality=90, method=6)
        print("ok", jm, w, "×", h)

if __name__ == "__main__":
    arch, mrizka, *jmena = sys.argv[1:]
    rez(arch, mrizka, jmena, os.environ.get("CIL", "art/img/boj"))
