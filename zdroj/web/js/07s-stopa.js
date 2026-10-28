/* @čisté – Stopa družiny na mapě (2026-10-28, Vojta): které zápisy Kroniky a zastávky se kreslí podle počátku stopy (vypravěč
   ho ukládá do herního stavu jako HRA.stopaOd = {z: id zápisu, datum, hodina}) a podle volby diváka (poslední cesta / od počátku
   stopy / celé tažení), síla úseků podle stáří a šipka směru. Jen výpočty bez stránky: kresba je v 07 (drawParty), ovládání u
   posuvníku „Kde jsme byli kdy“ v 09, mapa světa v 05b. Nic se nemaže – starší zápisy jen nejsou na mapě. */
const STOPA_POHLEDY = [
  ["posledni", "Poslední cesta"],
  ["pocatek", "Od počátku stopy"],
  ["cele", "Celé tažení"],
];
/* okamžik zápisu nebo počátku jako řetězec k porovnání: "1458-03-05T14"; bez data prázdný */
function stopaKlic(t) {
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(t.datum || "")) return "";
  return t.datum + "T" + String(t.hodina == null ? 0 : t.hodina).padStart(2, "0");
}
/* krátké datum ke značce zastávky: "1458-03-05" → "5. 3." */
function stopaDatumKr(datum) {
  const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(datum || "");
  return m ? `${+m[2]}. ${+m[1]}.` : "";
}
/* Zastávky stopy. zapisy = [{id, place, route, datum, hodina}] v pořadí Kroniky (hráč má jen odhalené),
   o = {od: HRA.stopaOd, pohled: "posledni" | "pocatek" | "cele", lim: index zápisu z posuvníku nebo null,
   zna: jméno → zná ho mapa? (neznámá místa trasy se přeskočí, aby se stopa nepřerušila)}.
   Vrací {i0, i1, zast: [{n: jméno místa, i: zápis, při kterém sem družina došla, z: [zápisy, které tu končí]}], odT: {datum, hodina}
   – od kdy kreslit cesty z Výpravy (null = všechny)}.
   Počátek = zápis X: stopa začíná v místě, kde X končí (jeho cesta už se nekreslí). Poslední cesta = cesta k poslednímu zápisu
   (z místa předchozího). Počátek v zápisu, který divák nezná (skrytý), se hledá podle data: první známý zápis od té doby. */
function stopaRozsah(zapisy, o) {
  o = o || {};
  const n = zapisy.length,
    lim = o.lim != null && o.lim >= 0 && o.lim < n ? o.lim : null,
    i1 = lim != null ? lim : n - 1,
    od = o.od && (o.od.z || o.od.datum) ? o.od : null,
    pohled = o.pohled === "posledni" || o.pohled === "cele" ? o.pohled : "pocatek";
  let i0 = 0,
    trasa0 = true,
    predch = false,
    odT = null;
  if (pohled === "posledni") {
    i0 = Math.max(0, i1);
    predch = true;
    const p = zapisy[i0 - 1];
    odT = p ? {datum: p.datum || "", hodina: p.hodina == null ? null : p.hodina} : null;
  } else if (pohled === "pocatek" && od) {
    const j = od.z ? zapisy.findIndex(z => z.id === od.z) : -1;
    if (j >= 0) {
      i0 = j;
      trasa0 = false;
    } else {
      const k = stopaKlic(od),
        q = k ? zapisy.findIndex(z => stopaKlic(z) >= k) : -1;
      i0 = q >= 0 ? q : n;
    }
    odT = stopaKlic(od) ? {datum: od.datum, hodina: od.hodina == null ? null : od.hodina} : null;
    /* posuvník před počátkem stopy: ukáže se cesta k tomu zápisu, jako by počátek nebyl */
    if (lim != null && i0 > i1) {
      i0 = i1;
      trasa0 = true;
      predch = true;
      odT = null;
    }
  }
  const zast = [];
  const pridej = (jm, i, kon) => {
    if (!jm || (o.zna && !o.zna(jm))) return;
    const p = zast[zast.length - 1];
    if (p && p.n === jm) {
      if (kon) p.z.push(i);
      return;
    }
    zast.push({n: jm, i, z: kon ? [i] : []});
  };
  for (let i = i0; i <= i1 && i < n; i++) {
    const z = zapisy[i];
    if (i === i0 && predch && i > 0) pridej(zapisy[i - 1].place, i - 1, false);
    if (i > i0 || trasa0) (z.route && z.route.length ? z.route : [z.place]).forEach(jm => pridej(jm, i, false));
    pridej(z.place, i, true);
  }
  return {i0, i1, zast, odT};
}
/* úseky mezi zastávkami se stářím: vek 0 = cesta k poslednímu zápisu (nebo dál, k dnešnímu místu družiny) */
function stopaUseky(zast, i1) {
  const u = [];
  for (let k = 1; k < zast.length; k++) u.push({a: zast[k - 1].n, b: zast[k].n, i: zast[k].i, vek: Math.max(0, i1 - zast[k].i)});
  return u;
}
/* cesty z Výpravy (HRA.putovani) ve stopě: od = herní okamžik počátku (cT), lim = okamžik zápisu z posuvníku; bez konce (t1)
   jen v celém tažení */
function stopaPutovani(put, od, lim) {
  return (put || []).filter(c => (lim == null || (c.t1 != null && c.t1 <= lim)) && (od == null || (c.t1 != null && c.t1 > od)));
}
/* síla (krytí) úseku podle stáří: nejnovější plná, každý starší zápis slabší, nejvýš do čtvrtiny */
function stopaSila(vek) {
  return Math.round(Math.max(0.28, 1 - 0.18 * Math.max(0, vek)) * 100) / 100;
}
/* šipka směru v polovině délky lomené čáry [[x, y], …]: bod a úhel ve stupních; kratší než min → null */
function stopaSipka(body, min) {
  if (!body || body.length < 2) return null;
  let L = 0;
  for (let i = 1; i < body.length; i++) L += Math.hypot(body[i][0] - body[i - 1][0], body[i][1] - body[i - 1][1]);
  if (!(L > (min || 0))) return null;
  let zb = L / 2;
  for (let i = 1; i < body.length; i++) {
    const [x0, y0] = body[i - 1],
      [x1, y1] = body[i],
      d = Math.hypot(x1 - x0, y1 - y0);
    if (d > 0 && zb <= d) {
      const t = zb / d;
      return {x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, a: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI};
    }
    zb -= d;
  }
  return null;
}
