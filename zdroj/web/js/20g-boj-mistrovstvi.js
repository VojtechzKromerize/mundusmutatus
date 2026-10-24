/* ===== Boj: vlastnosti a mistrovství zbraní (Weapon Traits a Weapon Masteries, 2026-10-24, Vojta) =====
   Pravidla a výpočty jsou v čistém 10w-zbrane.js; tady je napojení na boj (stejně jako perky z Artikulí v 20e):
   - před hodem (list útoku): Obouruč (Versatile), Za běžným dostřelem (Range – nevýhoda), Útok navíc z Light (bonusová akce,
     s mistrovstvím Nick v rámci akce Útok) a z Cleave (jednou za tah) – oba bez kladného modifikátoru ke zranění; Heavy pod 13
     dá nevýhodu sama (bojAdvHrac);
   - po zásahu nabídne mistrovství s volbou (Topple, Push, Slow); Sap, Vex a Graze se pošlou samy;
   - útok nese `wm`: {n: mistrovství, dc: SO Topple, x: zranění Graze}; vypravěč ho při zápisu vyhodnotí: záchrana proti Topple
     (Sražen), Sap (oslaben – nevýhoda na příští útok), Slow (zpomalen), Vex (výhoda útočníka proti cíli), Graze (zranění při minutí);
   - účinky Sap, Slow a Vex končí podle tahu útočníka (`okdy` u účinku na nepříteli, bojWmTahVlastnika z 12). */
const BWMVOL = {Topple: 1, Push: 1, Slow: 1};
const BWMIK = {
  Cleave: "plosny-zasah",
  Graze: "rana",
  Nick: "rozptyleni",
  Push: "pohyb",
  Sap: "nevyhoda",
  Slow: "slow",
  Topple: "srazen",
  Vex: "vyhoda",
};
/* zbraň postavy (útok z karty nebo zbraň v boji: n, b, dal) → vlastnosti, mistrovství (jen když ho postava používá), modifikátor, SO */
function bojWTr(K, w) {
  if (!K || !w || /beze zbraně|unarmed|eldritch|kouzl/i.test(w.n || "")) return null;
  const a = kUtoky(K).find(x => x.n === w.n),
    inf = kZbranInfo(w.n),
    druh = inf ? inf[1] : null,
    R = zbrRozbor(a ? a.vl : w.vl, inf ? inf[4] : "", druh ? ZBRMA[druh] : null),
    rysy = [...(K.rysy2 || []), ...(kDopl(K).rysy || [])].map(r => r.n),
    pb = kPB(K),
    mod = zbrMod(w.b != null && w.b !== "" ? w.b : a && a.b, pb, w.n);
  if (R.vl.Versatile === true) R.vl.Versatile = zbrVersKost(w.z || (a && a.z)) || true;
  return {vl: R.vl, ma0: R.ma, ma: zbrMaMa(R.ma, rysy, druh) ? R.ma : null, mod, dc: 8 + mod + pb, druh};
}
const bojWmJm = t => (ZBRMS[t] ? `${t} (${ZBRMS[t][0]})` : t);
const bojWvlTip = k => (ZBRVL[k] ? `${k} (${ZBRVL[k][0]}): ${ZBRVL[k][1]}` : k);
/* útok navíc (Light / Nick / Cleave) podle voleb před hodem: {g, n, ba} nebo null */
function bojWmNavic(K, w, T) {
  const R = T && bojWTr(K, w);
  if (!R) return null;
  if (T.nl && R.vl.Light) return R.ma === "Nick" ? {g: "nl", n: "Nick", ba: 0} : {g: "nl", n: "Light", ba: 1};
  if (T.cl && R.ma === "Cleave" && !w.dal) return {g: "cl", n: "Cleave", ba: 0};
  return null;
}
/* zbraň pro hod: Versatile obouruč (větší kostka) a útok navíc bez kladného modifikátoru (s Two-Weapon Fighting u Light s ním) */
function bojWUprav(K, w, T) {
  const R = T && bojWTr(K, w);
  if (!R) return w;
  let z = w.z;
  if (T.ob && !w.dal && typeof R.vl.Versatile === "string") z = zbrObour(z, R.vl.Versatile);
  const NV = bojWmNavic(K, w, T);
  if (NV && !(NV.g === "nl" && kMaRys(K, /^two-weapon fighting$/i))) z = zbrBezMod(z, R.mod);
  return z === w.z ? w : Object.assign({}, w, {z});
}
/* důvody výhody a nevýhody ze zbraně (Heavy pod 13, za běžným dostřelem) – doplní bojAdvHrac */
function bojWAdv(me, w, plus, minus) {
  const K = me && bojKartaH(me),
    R = K && bojWTr(K, w);
  if (!R) return;
  if (zbrTezkaNev(R.vl, !!w.dal, kVl(K, "STR") || 10, kVl(K, "DEX") || 10)) minus.push(w.dal ? "Heavy: DEX pod 13" : "Heavy: STR pod 13");
  const O = GMV ? BGMU[me.id] || {} : BJU,
    T = bojZvVolby(O, w);
  if (T.dd && R.vl.Range) minus.push("za běžným dostřelem");
}
/* volby před hodem v listu útoku (přepínače sdílí uložení s perky: O.zvt[zbraň], tlačítka data-bzvt v 20e) */
function bojWmVolbyHtml(K, w, h, gm) {
  const R = bojWTr(K, w);
  if (!R) return "";
  const O = gm ? BGMU[h.id] || {} : BJU,
    T = bojZvVolby(O, w),
    U = tahObnov(Object.assign({}, O.ridT), tahKlic(BOJ.s || {})),
    L = [];
  if (!w.dal && typeof R.vl.Versatile === "string")
    L.push(["ob", `Obouruč ${R.vl.Versatile}`, `Versatile (Univerzální): v obou rukou zranění ${R.vl.Versatile}`]);
  if (R.vl.Range)
    L.push(["dd", "Za dostřelem", `Range (Dostřel ${typeof R.vl.Range === "string" ? R.vl.Range : ""}): cíl za běžným dostřelem – nevýhoda`]);
  if (R.vl.Light && (tahJednouVolne(U, "nl") || T.nl))
    L.push([
      "nl",
      R.ma === "Nick" ? "Útok navíc · v akci" : "Útok navíc · bonusová akce",
      `${bojWvlTip("Light")}${R.ma === "Nick" ? ` · ${bojWmJm("Nick")}: v rámci akce Útok, jednou za tah` : ""}${kMaRys(K, /^two-weapon fighting$/i) ? " · Two-Weapon Fighting: modifikátor se přičte" : ""}`,
    ]);
  if (R.ma === "Cleave" && !w.dal && (tahJednouVolne(U, "cl") || T.cl))
    L.push(["cl", "Cleave – další cíl", `${bojWmJm("Cleave")}: ${ZBRMS.Cleave[1]}`]);
  const ma = R.ma
    ? `<span class="bphwm" ${btip(`${bojWmJm(R.ma)}: ${ZBRMS[R.ma][1]}${BWMVOL[R.ma] ? " – po zásahu ho přidáš" : R.ma === "Nick" || R.ma === "Cleave" ? "" : " – uplatní se samo"}`)}>${bi(BWMIK[R.ma] || "boj")}<span>${besc(R.ma)}</span></span>`
    : "";
  if (!L.length && !ma) return "";
  return `<div class="bphr"><span class="bphl" ${btip("Vlastnosti a mistrovství zbraně (Pravidla › Výbava)")}>${L.length ? "Vlastnosti" : "Mistrovství"}</span><span class="bphc">${L.map(([k, n, t]) => `<button type="button" class="bphtyp" data-bzvt="${besc(h.id)}|${besc(w.n)}|${k}" aria-pressed="${!!T[k]}" ${btip(t)}><span>${besc(n)}</span></button>`).join("")}${ma}</span></div>`;
}
/* nabídka po zásahu: mistrovství s volbou (Topple, Push, Slow) */
function bojWmRidery(K, me, w, q) {
  const R = bojWTr(K, w);
  if (!R || !R.ma || !BWMVOL[R.ma] || !q) return [];
  const t = R.ma;
  return [
    {
      k: "wm:" + t,
      g: "wm",
      n: t,
      zr: "",
      cim: t === "Topple" ? `Topple (CON SO ${R.dc})` : t,
      pozn: `${bojWmJm(t)}: ${ZBRMS[t][1]}${t === "Topple" ? ` – SO ${R.dc}` : ""}`,
    },
  ];
}
/* co útok nese vypravěči: Sap, Vex a Graze vždy (rozhodne zásah / minutí), Topple, Push a Slow jen zvolené po zásahu */
function bojWmPayload(K, w, x) {
  const R = bojWTr(K, w);
  if (!R || !R.ma) return null;
  const t = R.ma;
  if (t === "Sap" || t === "Vex") return {n: t};
  if (t === "Graze") return R.mod > 0 ? {n: t, x: Math.min(10, R.mod)} : null;
  if (BWMVOL[t] && x && (x.rid || []).some(r => r.g === "wm")) return t === "Topple" ? {n: t, dc: Math.max(1, Math.min(40, R.dc))} : {n: t};
  return null;
}
/* ----- vypravěč: vyhodnocení při zápisu útoku hráče ----- */
/* Graze při minutí: zranění ve výši modifikátoru (Resistance platí); o = řádek vyhodnocení cíle, doplní zranění */
function bojWmMinuti(o, u, n, E) {
  const W = u && u.wm;
  if (!W || W.n !== "Graze" || !(+W.x > 0)) return "";
  const x = +W.x;
  if (n.druh === "houf") {
    const Hz = bojHoufZasah(n, x);
    Object.assign(o, {pad: Hz.pad, hz: Hz.hz, hz0: Hz.hz0, graze: x});
    return ` · ${bojWmJm("Graze")}: ${x}${Hz.pad ? `, padl pacholek` : ""}`;
  }
  const z = E && E.hp.length ? bojZasah(E, x, u.t, {drt: u.drt, pru: u.pru, st: n.stav}) : {x, pozn: []};
  Object.assign(o, {x: z.x, pozn: z.pozn, graze: x});
  return ` · ${bojWmJm("Graze")}: ${x}${z.pozn.length ? ` → ${z.x} (${z.pozn.join(", ")})` : ""}`;
}
/* po zásahu: záchrana proti Topple, Sap, Slow a Vex (Slow a Vex jen se zraněním), Push jako připomínka */
function bojWmVyhodnot(u, h, n, E, o) {
  const W = u && u.wm;
  if (!W) return [];
  const t = W.n,
    hn = h ? h.n : "útočník",
    zr = +o.x > 0;
  if (t === "Topple") {
    const dc = +W.dc || 10,
      Z = bojNpcZach(n, E, "CON", dc);
    return [{t, k: Z.ok ? "" : "srz", txt: `${bojWmJm(t)}: CON ${Z.txt} proti SO ${dc} – ${Z.ok ? "ustál to" : "sražen (Prone)"}`}];
  }
  if (t === "Sap") return [{t, k: "sap", txt: `${bojWmJm(t)}: nevýhoda na příští útok do začátku tahu ${hn}`}];
  if (t === "Slow")
    return [zr ? {t, k: "slow", txt: `${bojWmJm(t)}: rychlost −10 stop do začátku tahu ${hn}`} : {t, txt: `${bojWmJm(t)}: bez zranění se neuplatní`}];
  if (t === "Vex")
    return [
      zr
        ? {t, k: "vex", txt: `${bojWmJm(t)}: ${hn} má výhodu na příští útok proti cíli (do konce svého příštího tahu)`}
        : {t, txt: `${bojWmJm(t)}: bez zranění se neuplatní`},
    ];
  if (t === "Push") return [{t, txt: `${bojWmJm(t)}: ${hn} smí cíl (Velký a menší) odstrčit o 10 stop – posuň figurku`}];
  return [];
}
/* zápis účinků při potvrzení útoku (uvnitř bojZmen); Vex se spotřebuje dalším útokem téže postavy proti cíli */
function bojWmProved(z, u, V) {
  if (!u || !u.h) return;
  const kolo = z.kolo || 1,
    tah = z.tah || 0,
    utok = !u.plos && !bojUtEf(u);
  V.r.forEach(o => {
    const n = (z.npc || []).find(x => x.id === o.ci);
    if (!n) return;
    if (utok) (n.ef || []).filter(e => e.n === "Vex" && e.od === u.h).forEach(e => bojEfDel(n, e));
    (o.wme || []).forEach(e => {
      if (e.k === "srz") {
        if (!(n.stav || []).includes("sražen")) n.stav = [...(n.stav || []), "sražen"];
      } else if (e.k) {
        const nm = {sap: "Sap", slow: "Slow", vex: "Vex"}[e.k],
          st = {sap: "oslaben", slow: "zpomalen"}[e.k];
        (n.ef || []).filter(x => x.n === nm && (e.k !== "vex" || x.od === u.h)).forEach(x => bojEfDel(n, x));
        const ef = {n: nm, od: u.h, okdy: e.k === "vex" ? "konec" : "zacatek", kolo, tah};
        if (st) {
          ef.st = st;
          if (!(n.stav || []).includes(st)) n.stav = [...(n.stav || []), st];
        }
        (n.ef = n.ef || []).push(ef);
      }
      if (e.txt) bojMsg(n.id, e.txt);
    });
  });
}
/* konec účinků podle tahu útočníka (volá 12 na začátku a konci tahu účastníka id): Sap a Slow do začátku jeho příštího tahu,
   Vex do konce jeho příštího tahu */
function bojWmTahVlastnika(s, id, kdy) {
  const kolo = s.kolo || 1,
    tah = s.tah || 0;
  (s.npc || []).forEach(n =>
    (n.ef || []).slice().forEach(e => {
      if (!e.okdy || e.od !== id) return;
      if (kdy === "zac" && e.okdy === "zacatek" && !(e.kolo === kolo && e.tah === tah)) {
        bojEfDel(n, e);
        bojMsg(n.id, `Skončilo: ${e.n}.`);
      } else if (kdy === "zac" && e.okdy === "konec") e.ozac = 1;
      else if (kdy === "kon" && e.okdy === "konec" && e.ozac) {
        bojEfDel(n, e);
        bojMsg(n.id, `Skončilo: ${e.n}.`);
      }
    }),
  );
}
/* Sap: oslabený nepřítel zaútočil – nevýhoda se spotřebovala */
function bojWmSapPouzit(id) {
  bojZmen(z => {
    const n = (z.npc || []).find(x => x.id === id);
    if (n) (n.ef || []).filter(e => e.n === "Sap").forEach(e => bojEfDel(n, e));
  });
}
/* karta: vlastnosti a mistrovství u rozbalené zbraně (česky s nápovědou) */
function bojWPopisHtml(K, a) {
  const R = bojWTr(K, a);
  if (!R) return "";
  const vl = Object.keys(R.vl).filter(k => k !== "Range" || !R.vl.Thrown);
  const tx = vl.map(k => `<span ${btip(bojWvlTip(k))}>${besc(ZBRVL[k][0])}${typeof R.vl[k] === "string" ? ` <i>${besc(R.vl[k])}</i>` : ""}</span>`);
  const t = R.ma0;
  const ma = t
    ? `<span class="bdmwm${R.ma ? " on" : ""}" ${btip(`${bojWmJm(t)}: ${ZBRMS[t][1]}${R.ma ? "" : " – postava toto mistrovství nepoužívá"}`)}>${bi(BWMIK[t] || "boj")}${besc(ZBRMS[t][0])}</span>`
    : "";
  return tx.length || ma ? `<span class="bdmwvl">${tx.join("")}${ma}</span>` : "";
}
