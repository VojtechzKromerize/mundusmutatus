/* @čisté – Služby a mzdy tažení (2026-10-30): zápis cen v groších, přepočet mezd, ceny v dnech práce a noclehy na výpravě =====
   ČISTÝ SOUBOR (viz 10u): jen čísla a text; tabulku Služby a mzdy (zdroj/vybaveni/sluzby-mzdy.json, art/vybaveni.json › sluzby)
   kreslí stránka Pravidla › Vybavení (14d), noclehy počítá Výprava (22b). Ceny jsou v pražských groších (desetiny = haléře),
   kurz tažení: 1 kopa = 60 grošů (jen počet), 1 uherský zlatý = 40 grošů, 1 groš = 10 haléřů. ===== */

/* pracovních dnů v roce (mzdy se platí za den, svátky měsíčně asi tři) */
const SLZ_PRACDNY = 250;
/* noclehy na výpravě: os = cena na osobu a noc, kun = píce a stáj za koně, dar = dar v klášteře (jednou za družinu), vše v groších */
const SLZ_NOC = {
  krcma: {os: 2, kun: 1, dar: 0},
  komurka: {os: 2.5, kun: 1, dar: 0},
  klaster: {os: 0, kun: 0, dar: 1},
  tvrz: {os: 0, kun: 0, dar: 0},
  sirak: {os: 0, kun: 0, dar: 0},
};
const slzTis = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
/* částka v groších → „2 kopy 30 gr.“, „2½ gr.“, „5 hal.“; od deseti kop zaokrouhleně „N kop (≈ M zl.)“ */
function slzCena(gr) {
  const h = Math.round((+gr || 0) * 10);
  if (h <= 0) return "zdarma";
  if (h >= 6000) return `${slzTis(Math.round(h / 600))} kop (≈ ${slzTis(Math.round(h / 400))} zl.)`;
  const kop = Math.floor(h / 600),
    r = h % 600,
    g = Math.floor(r / 10),
    hal = r % 10,
    a = [];
  if (kop) a.push(`${kop} ${kop === 1 ? "kopa" : kop < 5 ? "kopy" : "kop"}`);
  if (g || hal) {
    if (hal === 5) a.push(`${g || ""}½ gr.`);
    else {
      if (g) a.push(`${g} gr.`);
      if (hal) a.push(`${hal} hal.`);
    }
  }
  return a.join(" ");
}
/* rozsah od–do; stejné meze dají jen jednu hodnotu */
const slzRozsah = (od, d) => (+od === +d ? slzCena(od) : `${slzCena(od)} – ${slzCena(d)}`);
/* denní mzda → týdně (5 dní), měsíčně (21 dní), ročně (250 dní), vše v groších */
function slzMzda(den) {
  const d = +den || 0;
  return {den: d, tyden: Math.round(d * 50) / 10, mesic: Math.round(d * 21 * 10) / 10, rok: Math.round(d * SLZ_PRACDNY * 10) / 10};
}
/* cena v dnech práce při dané denní mzdě (výchozí mistr řemeslník 2 gr.), zaokrouhleno na celé dny, nejméně 1 */
const slzDnu = (gr, mzda) => Math.max(1, Math.round((+gr || 0) / (+mzda || 2)));
/* noclehy: typy = pole klíčů SLZ_NOC (jeden za noc), osob = počet lidí, kone = počet koní; vrací groše za celou družinu */
function slzNoci(typy, osob, kone) {
  const o = Math.max(1, +osob || 1),
    k = Math.max(0, +kone || 0);
  return (typy || []).reduce((s, t) => {
    const n = SLZ_NOC[t] || SLZ_NOC.sirak;
    return s + n.os * o + (n.os > 0 ? n.kun * k : 0) + n.dar;
  }, 0);
}
/* řádek tabulky Služby a mzdy → hotové texty: cena (běžná), rozsah, dny práce u jednorázových věcí, přepočet mzdy */
function slzRadek(r) {
  const jednor = /^(kupní cena|za kus|za balík|poplatek|celkem|za zakázku|za osobu|za skupinu|za koně)$/.test(r.j || "");
  return {
    cena: slzCena(r.s),
    rozsah: r.od === r.do ? "" : slzRozsah(r.od, r.do),
    dnu: jednor && r.s >= 10 ? slzDnu(r.s) : 0,
    mzda: r.mzda ? slzMzda(r.s) : null,
  };
}
