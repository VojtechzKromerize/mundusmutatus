/* ===== Mapy přes celou obrazovku (2026-10-27, Vojta) ===== */
/* Tlačítko v rohu mapy (data-mapcela) přepne mapu Zemí Koruny, Známý svět a plán Prahy – i ve Výpravě, kam se obal mapy
   přesouvá – přes celou obrazovku. Kořen je obal mapy i s panelem místa (.mapgrid), ve Výpravě jen obal mapy (.mapbox).
   Fullscreen API skryje i lišty prohlížeče; kde ho prohlížeč na prvcích nemá (iPhone), stačí třída: .mapcela kořen roztáhne
   position: fixed přes celé okno (100dvh) a html.mmmapcela zamkne posun stránky. Třídu .mapcela má kořen v obou případech –
   styly i výřez map se řídí jen jí (mapWide a mapAsp v 02, celaPomer zde pro svět a Prahu). Zavře ji totéž tlačítko, Esc,
   odchod ze stránky nebo konec fullscreenu v prohlížeči. Návrat vrátí posun stránky; když se na mapě v celé obrazovce nic
   nepohnulo, i původní výřez, jinak výřez se stejným středem v poměru stran stránky. */
const MAPCELA = {koren: null, box: null, api: false, posun: 0, vb: null, dotek: false, t: 0};
/* výřez a překreslení každé mapy (obal .mapbox podle id); kresba světa a Prahy je v líných částech – volá se jen, je-li načtená */
const MAPCELA_MAPY = {
  kmapbox: {
    vb: () => st.vb,
    nastav: v => {
      st.vb = v;
    },
    kresli: () => mapNaVelikost(),
  },
  smapbox: {
    vb: () => sst.vb,
    nastav: v => {
      sst.vb = v;
    },
    kresli: () => {
      if (SG && typeof sDraw === "function") sDraw();
    },
  },
  pmapbox: {
    vb: () => pst.vb,
    nastav: v => {
      pst.vb = v;
    },
    kresli: () => {
      if (PG && typeof pDraw === "function") pDraw();
    },
  },
};
/* poměr stran (výška / šířka) okna mapy v celé obrazovce; mimo ni null (mapa má svůj pevný poměr) */
function celaPomer(e) {
  if (!e || !e.closest(".mapcela")) return null;
  const r = e.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? Math.max(0.25, Math.min(4, r.height / r.width)) : null;
}
/* výřez v poměru stran A se stejným středem a šířkou, v mezích m = [x0, y0, x1, y1, nejmenší šířka, největší šířka]:
   šířka se zmenší, aby se výška vešla do mezí (na vysokém telefonu je vidět celá výška a strany se posouvají) */
function celaVyrez(v, A, m) {
  const [x0, y0, x1, y1, wMin, wMax] = m;
  const w = Math.max(wMin, Math.min(wMax, x1 - x0, (y1 - y0) / A, v[2])),
    h = w * A,
    cx = v[0] + v[2] / 2,
    cy = v[1] + v[3] / 2;
  return [Math.max(x0, Math.min(x1 - w, cx - w / 2)), Math.max(y0, Math.min(y1 - h, cy - h / 2)), w, h];
}
const mapCelaFs = () => document.fullscreenElement || document.webkitFullscreenElement || null;
/* překreslit až po ustálení rozměru (přechod do fullscreenu a otočení telefonu pošlou několik změn velikosti) – jednou */
function mapCelaPrekresli(box) {
  clearTimeout(MAPCELA.t);
  MAPCELA.t = setTimeout(() => {
    const M = MAPCELA_MAPY[box.id];
    if (M) M.kresli();
  }, 60);
}
function mapCelaTlacitka(box, on) {
  box.querySelectorAll("[data-mapcela]").forEach(b => {
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.setAttribute("aria-label", on ? "Zavřít celou obrazovku" : "Mapa přes celou obrazovku");
    b.setAttribute("data-tip", on ? "Zpět na stránku (Esc)" : "Mapa přes celou obrazovku");
  });
}
function mapCelaOtevri(box) {
  if (MAPCELA.koren) mapCelaZavri();
  const koren = box.closest(".mapgrid") || box,
    M = MAPCELA_MAPY[box.id];
  Object.assign(MAPCELA, {koren, box, api: false, posun: scrollY, vb: M ? M.vb() : null, dotek: false});
  koren.classList.add("mapcela");
  document.documentElement.classList.add("mmmapcela");
  mapCelaTlacitka(box, true);
  const rq = koren.requestFullscreen || koren.webkitRequestFullscreen;
  if (rq && !mapCelaFs())
    try {
      const p = rq.call(koren, {navigationUI: "hide"});
      MAPCELA.api = true;
      if (p && p.catch)
        p.catch(() => {
          MAPCELA.api = false;
        });
    } catch {
      MAPCELA.api = false;
    }
  mapCelaPrekresli(box);
}
function mapCelaZavri() {
  const {koren, box} = MAPCELA;
  if (!koren) return;
  const M = MAPCELA_MAPY[box.id];
  MAPCELA.koren = MAPCELA.box = null;
  if (mapCelaFs() === koren) {
    const ex = document.exitFullscreen || document.webkitExitFullscreen;
    try {
      const p = ex && ex.call(document);
      if (p && p.catch) p.catch(() => {});
    } catch {
      /* prohlížeč už fullscreen ukončil sám */
    }
  }
  /* střed výřezu v celé obrazovce, než se okno mapy zmenší (mapa Koruny drží výřez jako levý horní roh) */
  const v = M && M.vb(),
    stred = v && box.id === "kmapbox" ? [v[0] + v[2] / 2, v[1] + v[3] / 2, v[2]] : null;
  koren.classList.remove("mapcela");
  document.documentElement.classList.remove("mmmapcela");
  mapCelaTlacitka(box, false);
  if (M) {
    if (!MAPCELA.dotek) M.nastav(MAPCELA.vb);
    else if (stred) {
      const A = mapAsp();
      M.nastav([stred[0] - stred[2] / 2, stred[1] - (stred[2] * A) / 2, stred[2], stred[2] * A]);
    }
  }
  scrollTo(0, MAPCELA.posun);
  mapCelaPrekresli(box);
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-mapcela]");
  if (!b) return;
  const box = b.closest(".mapbox");
  if (MAPCELA.koren && MAPCELA.box === box) mapCelaZavri();
  else if (box) mapCelaOtevri(box);
});
/* posun nebo přiblížení mapy v celé obrazovce: při návratu se výřez nevrátí, jen převede na poměr stran stránky */
const mapCelaDotek = e => {
  const t = e.target;
  if (MAPCELA.koren && t.closest && !t.closest("[data-mapcela]") && t.closest("svg, .mapbar button") && MAPCELA.koren.contains(t))
    MAPCELA.dotek = true;
};
document.addEventListener("pointerdown", mapCelaDotek, true);
document.addEventListener("wheel", mapCelaDotek, {capture: true, passive: true});
/* Esc: bez Fullscreen API zavře celou obrazovku sám (s ním ji ukončí prohlížeč a ozve se fullscreenchange; dojde-li Esc
   i sem, zavření proběhne jen jednou); otevřené Vrstvy zavře nejdřív 08 */
document.addEventListener("keydown", e => {
  if (e.key !== "Escape" || !MAPCELA.koren) return;
  if (MAPCELA.koren.querySelector(".lyrpanel:not([hidden])")) return;
  mapCelaZavri();
});
const mapCelaFsZmena = () => {
  if (MAPCELA.koren && MAPCELA.api && mapCelaFs() !== MAPCELA.koren) mapCelaZavri();
};
document.addEventListener("fullscreenchange", mapCelaFsZmena);
document.addEventListener("webkitfullscreenchange", mapCelaFsZmena);
addEventListener("resize", () => {
  if (MAPCELA.koren) mapCelaPrekresli(MAPCELA.box);
});
/* odchod ze stránky (odkaz z panelu místa, menu): stránka mapy se skryje – celá obrazovka se zavře */
addEventListener("hashchange", () =>
  setTimeout(() => {
    const k = MAPCELA.koren;
    if (k && (!k.isConnected || k.closest(".view[hidden]"))) mapCelaZavri();
  }, 0),
);
