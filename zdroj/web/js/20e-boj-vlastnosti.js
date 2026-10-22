/* ===== Boj: vlastnosti zbraní z Artikulí v boji (2026-10-20) =====
   Pasivní vlastnosti (Drtivá, Průrazná, Ostrá, Šikovná) už web počítá; tady je zbytek: Nepřímá (kryt), Do slabin! (kritický zásah
   proti ležícímu), Vpřed! a Půlmeč (volby před hodem), aktivní vlastnosti při Požehnání (hráč si ji přidá k zásahu jako Divine Smite,
   vypravěč ji při zápisu vyhodnotí: záchrana nepřítele, stav, zbroj, štít) a Komplikace při odmítnutém Pokušení (tlačítko vypravěče
   v záznamu). Hráč posílá v útoku `zv`: {z, r: kostka Závoje, v: zvolené vlastnosti, a: aktivní vlastnosti zbraně, vp, pm, dc}.
   Odvetná: nepřítel mine postavu s Pokušením → telefon nabídne protiútok reakcí (jako Riposte, bez kostky převahy).
   Nepřítel: útok ze statbloku s vlastností a Požehnáním → tlačítka u plakety (stav postavě, CON záchrana výzvou). */
const BZVAKT = {
  Krvežíznivá: {poz: "cíl bez Resistance vůči typu zranění krvácí d4 do ošetření", kom: "čepel uvízla v ráně – vytrhnout ji stojí bonusovou akci"},
  Omračující: {
    poz: "cíl hází CON záchranu, jinak je do konce svého příštího tahu bez Reakce a má nevýhodu na útoky",
    kom: "rána sklouzla po zbroji – do svého příštího tahu jsi bez Reakce",
  },
  Ničivá: {poz: "zbroj cíle ztrácí jedno obětování", kom: "zbraň praská – ztrácí Ničivou až do opravy"},
  Odvetná: {poz: "vazba – cíl na tebe do konce svého příštího tahu nemůže použít Reakci", kom: "čepele se zaklesly – ztrácíš Reakci"},
  Přibodnutí: {
    poz: "cíl je přidržen hrotem (rychlost 0 do začátku tvého příštího tahu), ty se nesmíš pohnout",
    kom: "hrot uvízl ve zbroji – cíl ti může Reakcí vytrhnout zbraň (STR záchrana SO 12)",
  },
  "Do slabin!": {poz: "proti ležícímu nebo zadrženému cíli je zásah kritický", kom: "dýka sklouzla po plátu – další útok na tebe má výhodu"},
  Strhující: {poz: "cíl hází CON záchranu, jinak je sražen k zemi", kom: "hák se zasekl – cíl tě strhne o 5 stop k sobě a může Reakcí zaútočit"},
  Štěpící: {poz: "štít cíle je zničen", kom: "sekera uvízla ve štítu – cíl ji může Reakcí vytrhnout (STR záchrana SO 12)"},
  "Hrom a kouř!": {
    poz: "dým tě zahalí – útoky zblízka na tebe mají 1 kolo nevýhodu",
    kom: "zbraň selhala – před dalším výstřelem ji musíš vyčistit (bonusová akce)",
  },
};
const bojZvAkt = vl => (vl || []).filter(v => BZVAKT[v]);
const bojZvMa = (u, p) => !!(u && u.zv && (u.zv.v || []).includes(p));
const bojZvJm = u =>
  String((u && u.cim) || "")
    .replace(/^(Riposte|Odveta): /, "")
    .split(" + ")[0];
/* kostky zranění zbraně postavy (bez bonusu) – pro přihození při kritickém zásahu z vlastnosti */
function bojZvZbrKostky(h, u) {
  const K = h && bojKartaH(h),
    nm = bojZvJm(u),
    a = K && kUtoky(K).find(x => x.n === nm),
    m = a && String(a.z || "").match(/^(\d*)d(\d+)/);
  if (!m) return null;
  return bojKostky(`${m[1] || 1}d${m[2]}`, false);
}
/* Půlmeč: kostka o stupeň níž (d8 → d6, 2d6 → 2d4) */
const bojZvKostkaNiz = z => String(z || "").replace(/(\d*)d(\d+)/, (m, n, d) => `${n}d${{12: 10, 10: 8, 8: 6, 6: 4, 4: 4}[+d] || d}`);
/* volby před hodem (Vpřed! po rozjezdu, Půlmeč přehmat) – podle zbraně, v BJU / BGMU[hid].zvt */
const bojZvVolby = (O, w) => (O && O.zvt && w && O.zvt[w.n]) || {};
function bojZvVolbyHtml(K, w, h, gm) {
  if (!w || !(w.vl || []).length) return "";
  const O = gm ? BGMU[h.id] || {} : BJU,
    T = bojZvVolby(O, w),
    L = [];
  if (w.vl.includes("Vpřed!")) L.push(["vp", "Vpřed!", "Vpřed! – po rozjezdu aspoň 15 stop rovně: zdvojnásobí kostky zranění (kritický zásah 4×)"]);
  if (w.vl.includes("Půlmeč")) L.push(["pm", "Půlmeč", "Půlmeč – přehmat (bonusová akce): Piercing s Průraznou, kostka zranění o stupeň níž"]);
  const ik = `<span class="bphc bphzv">${w.vl.map(v => bikZv(v)).join("")}</span>`;
  if (!L.length) return `<div class="bphr"><span class="bphl">Zbraň</span>${ik}</div>`;
  return `<div class="bphr"><span class="bphl">Zbraň</span><span class="bphc">${L.map(([k, n, t]) => `<button type="button" class="bphtyp" data-bzvt="${besc(h.id)}|${besc(w.n)}|${k}" aria-pressed="${!!T[k]}" ${btip(t)}>${bikZv(n)}<span>${n}${k === "vp" ? " po rozjezdu" : " přehmat"}</span></button>`).join("")}${w.vl
    .filter(v => v !== "Vpřed!" && v !== "Půlmeč")
    .map(v => bikZv(v))
    .join("")}</span></div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bzvt]");
  if (!b) return;
  const [hid, wn, k] = b.dataset.bzvt.split("|"),
    O = GMV ? (BGMU[hid] = BGMU[hid] || {}) : BJU;
  O.zvt = O.zvt || {};
  const T = (O.zvt[wn] = O.zvt[wn] || {});
  T[k] = !T[k];
  if (!T[k]) delete T[k];
  if (typeof bojListPrekresli === "function") bojListPrekresli();
  else renderBoj();
});
/* co hráč posílá vypravěči k útoku (a vypravěč zapisuje za hráče) */
function bojZvPayload(K, w, x, ZV, T) {
  if (!w || !(w.vl || []).length) return null;
  const v = [
    ...((x && x.rid) || []).filter(r => r.g === "zv").map(r => r.n),
    ...(w.vl.includes("Nepřímá") ? ["Nepřímá"] : []),
    ...(w.vl.includes("Do slabin!") ? ["Do slabin!"] : []),
  ];
  const o = {z: ZV ? +ZV.d || 0 : 0, r: ZV ? ZV.r || "" : "", v: [...new Set(v)], a: bojZvAkt(w.vl)};
  if (T && T.vp) o.vp = true;
  if (T && T.pm) o.pm = true;
  if (K && (o.a.includes("Omračující") || o.a.includes("Strhující"))) o.dc = 8 + kPB(K) + kMod(kVl(K, "STR") || 10);
  return o;
}
/* nabídka k zásahu při Požehnání: aktivní vlastnost zbraně (jedna na zásah) */
function bojZvRidery(K, me, w, q, s, O) {
  const ZV = O.zav;
  if (!ZV || ZV.r !== "poz" || !w || !(w.vl || []).length) return [];
  const c = (s.npc || []).find(o => o.id === q.ci);
  return bojZvAkt(w.vl)
    .filter(p => p !== "Hrom a kouř!" && p !== "Do slabin!")
    .filter(p => p !== "Štěpící" || !c || c.druh !== "houf")
    .map(p => ({k: "zv:" + p, g: "zv", n: p, zr: "", cim: p, pozn: `${p} – Požehnání: ${BZVAKT[p].poz}`}));
}
/* ----- vypravěč: vyhodnocení při zápisu útoku hráče ----- */
function bojZvVyhodnot(s, u, h, n, E, ZS, hit, krit) {
  const R = [];
  if (!u || !u.zv) return R;
  const zv = u.zv,
    A = zv.a || [],
    V = zv.v || [],
    dc = +zv.dc || 12,
    hn = h ? h.n : "útočník";
  if (hit)
    for (const p of V) {
      if (!BZVAKT[p] || p === "Do slabin!") continue;
      const o = {p};
      if (p === "Krvežíznivá") {
        if (bojMaRes(n, u.t)) {
          o.txt = `Krvežíznivá: cíl má Resistance, nekrvácí`;
        } else if ((n.stav || []).some(t => /^krvácí k[68]$/.test(t))) {
          o.txt = "Krvežíznivá: už krvácí silněji";
        } else {
          o.k = "krv";
          o.txt = "Krvežíznivá: cíl krvácí k4";
        }
      } else if (p === "Omračující" || p === "Strhující") {
        const Z = bojNpcZach(n, E, "CON", dc);
        o.ok = Z.ok;
        o.txt = `${p}: CON ${Z.txt} proti SO ${dc} – ${Z.ok ? "uspěl" : p === "Omračující" ? "zaskočen (bez Reakce, nevýhoda na útoky)" : "sražen"}`;
        if (!Z.ok) o.k = p === "Omračující" ? "zask" : "srz";
      } else if (p === "Ničivá") {
        const tel = ZS && ZS.d.find(x => x.k !== "Štít");
        if (tel && tel.u < tel.max) {
          o.k = "nic";
          o.kz = tel.k;
          o.txt = `Ničivá: ${tel.k.toLowerCase()} zbroj ztrácí obětování (${tel.u + 1}/${tel.max})`;
        } else o.txt = tel ? "Ničivá: zbroj už je vyčerpaná" : "Ničivá: cíl nemá zbroj";
      } else if (p === "Štěpící") {
        const st = ZS && ZS.d.find(x => x.k === "Štít");
        if (st && st.u < st.max) {
          o.k = "stit";
          o.txt = "Štěpící: štít zničen (AC −2)";
        } else o.txt = st ? "Štěpící: štít už je rozštípnutý" : "Štěpící: cíl nemá štít";
      } else if (p === "Odvetná") {
        o.k = "vaz";
        o.txt = `Odvetná: ve vazbě – bez Reakce proti ${hn} do konce svého příštího tahu`;
      } else if (p === "Přibodnutí") {
        o.k = "prib";
        o.txt = `Přibodnutí: přibodnut (rychlost 0); ${hn} se nesmí pohnout`;
      }
      R.push(o);
    }
  if (zv.r === "poz" && A.includes("Hrom a kouř!"))
    R.push({p: "Hrom a kouř!", k: "dym", txt: `Hrom a kouř!: dým zahalí ${hn} (útoky zblízka s nevýhodou, 1 kolo)`});
  if (u.d === 1 && +zv.z === 1 && A.includes("Hrom a kouř!"))
    R.push({p: "Hrom a kouř!", k: "vyb", txt: `Hrom a kouř!: 1 na d20 a 1 na Závoji – zbraň vybuchla, ${hn} utrpí 2d8 Fire`});
  return R;
}
/* zápis účinků při potvrzení útoku (uvnitř bojZmen) */
function bojZvProved(z, u, V) {
  if (!u || !u.zv) return;
  const h = (z.hraci || []).find(x => x.id === u.h),
    kolo = z.kolo || 1,
    tah = z.tah || 0;
  const efH = (n, kdy, st) => {
    if (!h) return;
    (h.ef || []).filter(e => e.n === n).forEach(e => bojEfDel(h, e));
    (h.ef = h.ef || []).push({n, kdy, kolo, tah, st});
    if (!(h.stav || []).includes(st)) h.stav = [...(h.stav || []), st];
  };
  V.r.forEach(o => {
    const n = (z.npc || []).find(x => x.id === o.ci);
    if (!n) return;
    (o.zve || []).forEach(e => {
      if (!e.k) return;
      if (e.k === "krv" && !(n.stav || []).includes("krvácí k4")) n.stav = [...(n.stav || []), "krvácí k4"];
      else if (e.k === "zask" || e.k === "vaz") {
        const st = e.k === "zask" ? "zaskočen" : "ve vazbě";
        (n.ef || []).filter(x => x.st === st).forEach(x => bojEfDel(n, x));
        (n.ef = n.ef || []).push({n: e.p, kdy: "konec", kolo, tah, st, zac: 0});
        if (!(n.stav || []).includes(st)) n.stav = [...(n.stav || []), st];
      } else if (e.k === "srz") {
        if (!(n.stav || []).includes("sražen")) n.stav = [...(n.stav || []), "sražen"];
      } else if (e.k === "nic") {
        n.zbrU = n.zbrU || {};
        n.zbrU[e.kz] = (n.zbrU[e.kz] || 0) + 1;
      } else if (e.k === "stit") {
        n.zbrU = n.zbrU || {};
        n.zbrU["Štít"] = parseInt(BZBR["Štít"][1], 10) || 1;
      } else if (e.k === "prib") {
        (n.ef || []).filter(x => x.st === "přibodnut").forEach(x => bojEfDel(n, x));
        (n.ef = n.ef || []).push({n: "Přibodnutí", kdy: "zacatek", kolo, tah, st: "přibodnut"});
        if (!(n.stav || []).includes("přibodnut")) n.stav = [...(n.stav || []), "přibodnut"];
        efH("Přibodnutí", "zacatek", "nehybný");
      } else if (e.k === "dym") efH("Hrom a kouř!", "zacatek", "v dýmu");
      else if (e.k === "vyb" && h) {
        const K = bojKartaH(h),
          d = bojKostky("2d8", false),
          x = d ? d.t : 9;
        setTimeout(() => {
          const m = K ? bojPCZmena(h.id, q => bojZranPC(q, K, x, "Fire", false), false) : bojZranPC(h, null, x, "Fire", false);
          bojLog(h.id, {n: "Hrom a kouř! – výbuch", ci: h.id, zt: `${d ? d.x + " = " : ""}${x} Fire → ${m || ""}`}, h.n);
          mmHlasG(`${h.n}: zbraň vybuchla – ${x} Fire.`, 6000);
        }, 0);
      }
      if (e.txt) bojMsg(n.id, e.txt);
    });
  });
}
/* Komplikace odmítnutého Pokušení – tlačítka vypravěče v záznamu (BLOGG[i].zvk) */
function bojZvKomHtml(i, k) {
  if (!k || k.ok) return "";
  return `<span class="bzvkom">Komplikace odmítnutého Pokušení (${besc(k.w || "zbraň")}): ${(k.a || []).map(p => `<button type="button" class="gbtn ghost bzvkb" data-bzvk="${i}|${besc(p)}" ${btip(BZVAKT[p] ? BZVAKT[p].kom : p)}>${bikZv(p)}${besc(p)}</button>`).join("")}<button type="button" class="gbtn ghost bzvkb" data-bzvk="${i}|-" ${btip("Pokušení přijato nebo komplikace vyřešena jinak")}>bez komplikace</button></span>`;
}
function bojZvKomplikace(i, p) {
  const x = BLOGG[i],
    k = x && x.o && x.o.zvk;
  if (!k) return;
  const s = BOJ.s || {},
    h = (s.hraci || []).find(q => q.id === k.h),
    n = (s.npc || []).find(q => q.id === k.ci);
  k.ok = p;
  if (p === "-") {
    renderBoj();
    return;
  }
  const kolo = s.kolo || 1,
    tah = s.tah || 0,
    t = BZVAKT[p] ? BZVAKT[p].kom : "";
  bojZmen(z => {
    const hh = (z.hraci || []).find(q => q.id === k.h);
    if (!hh) return;
    const st = v => {
      if (!(hh.stav || []).includes(v)) hh.stav = [...(hh.stav || []), v];
    };
    if (p === "Krvežíznivá" || p === "Štěpící") st("zbraň uvízla");
    else if (p === "Ničivá") st("zbraň praská");
    else if (p === "Hrom a kouř!") st("zbraň selhala");
    else if (p === "Omračující" || p === "Odvetná") {
      (z.reak = z.reak || {})[hh.id] = 1;
    } else if (p === "Do slabin!") {
      (hh.ef || []).filter(e => e.st === "odkrytý").forEach(e => bojEfDel(hh, e));
      (hh.ef = hh.ef || []).push({n: "Do slabin! – komplikace", kdy: "zacatek", kolo, tah, st: "odkrytý"});
      st("odkrytý");
    }
  });
  if (h) bojLog(h.id, {n: `${p} – komplikace`, ci: h.id, zt: t}, h.n);
  if (n && (p === "Přibodnutí" || p === "Strhující" || p === "Štěpící")) bojMsg(n.id, `${p} (komplikace ${h ? h.n : ""}): ${t}`);
  mmHlasG(`${h ? h.n + ": " : ""}${p} – ${t}`, 6000);
  renderBoj();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bzvk]");
  if (!b || !GMV) return;
  const [i, p] = b.dataset.bzvk.split("|");
  bojZvKomplikace(+i, p);
});
/* ----- Odvetná na telefonu: nepřítel mě minul útokem zblízka s Pokušením → protiútok reakcí ----- */
let BODV = null;
function bojOdvNovy(s, me, N) {
  const K = bojKartaH(me);
  if (!K || (s.reak || {})[me.id]) return;
  const zb = bojZbrVse(s, me);
  if (!zb.some(w => !w.dal && w.z && (w.vl || []).includes("Odvetná"))) return;
  const L = N.filter(e => /^vedle/.test(e.v || "") && !e.dal && e.ai && e.zv === "pok");
  if (!L.length) return;
  BODV = {e: L[0], kid: K.id, hid: me.id, cas: Date.now()};
  mmHlas(`${L[0].a || "Nepřítel"} tě minul s Pokušením – Odvetná: můžeš reakcí oplatit.`, 6000);
  renderBoj();
}
function kOdvHtml(K, h, s) {
  if (!BODV || BODV.kid !== K.id || Date.now() - BODV.cas > 5 * 60e3 || (s.reak || {})[h.id] || !(s.npc || []).some(o => o.id === BODV.e.ai))
    return "";
  const e = BODV.e,
    zb = bojZbrVse(s, h),
    j = zb.findIndex(w => !w.dal && w.z && (w.vl || []).includes("Odvetná"));
  if (j < 0) return "";
  return `<div class="khl kzas">${bikZv("Odvetná")}<b>${besc(e.a || "Nepřítel")}</b> tě minul s Pokušením${e.cim ? ` · ${besc(e.cim)}` : ""}. <button type="button" class="gbtn" data-bdmsh="utok" data-j="${j}" data-bodv="${besc(e.ai)}" ${btip(`Odvetná: protiútok reakcí (${zb[j].n})`)}>Odveta – oplatit</button><button type="button" class="gbtn ghost" data-bodvx>Nechat být</button></div>`;
}
document.addEventListener("click", e => {
  const T = q => e.target.closest && e.target.closest(q);
  if (T("[data-bodvx]")) {
    BODV = null;
    renderBoj();
    return;
  }
  const r = T("[data-bodv]");
  if (r && BODV) {
    const s = BOJ.s || {},
      tk = (s.kolo || 1) * 100 + (s.tah || 0);
    BJU.ripo = {ai: r.dataset.bodv, tk, odv: 1};
    BJU.cilL = [r.dataset.bodv];
    BJU.cil = r.dataset.bodv;
    BJU.serie = null;
    BJU.info = "Odveta: protiútok reakcí – hoď a pošli.";
    BODV = null;
    setTimeout(renderBoj, 0);
  }
});
/* ----- nepřítel: vlastnosti jeho zbraně ze statbloku proti postavě (plaketa vypravěče) ----- */
const BZVV = {};
const bojZvNpcProps = p => Object.keys(BZVAKT).filter(k => new RegExp(k.replace(/[!]/g, "").replace(/\s+/g, "\\s*"), "i").test(String(p || "")));
function bojZvNpcHtml(o) {
  if (!GMV || !o || !o.zav || o.zav.r !== "poz" || !o.pcId || !o.pcHit || o.zvnOk) return "";
  const P = bojZvNpcProps(o.p).filter(p => p !== "Hrom a kouř!" && p !== "Do slabin!" && p !== "Ničivá" && p !== "Štěpící");
  if (!P.length) return "";
  return P.map(
    p =>
      `<button type="button" class="badd" data-bzvn="${besc(o.t)}|${besc(p)}" ${btip(BZVAKT[p].poz)}>${bikZv(p)}${besc(p)} → ${besc(o.cil || "")}</button>`,
  ).join("");
}
function bojZvNpcEfekt(t, p) {
  const x = BLOGG.find(q => q.o && q.o.t === +t),
    o = x && x.o;
  if (!o || !o.pcId) return;
  const s = BOJ.s || {},
    h = (s.hraci || []).find(q => q.id === o.pcId),
    n = (s.npc || []).find(q => q.id === x.id);
  if (!h) return;
  const K = bojKartaH(h),
    kolo = s.kolo || 1,
    tah = s.tah || 0;
  o.zvnOk = p;
  const efH = (z, hh, nm, kdy, st) => {
    (hh.ef || []).filter(e => e.n === nm).forEach(e => bojEfDel(hh, e));
    (hh.ef = hh.ef || []).push({n: nm, kdy, kolo, tah, st});
    if (!(hh.stav || []).includes(st)) hh.stav = [...(hh.stav || []), st];
  };
  if (p === "Omračující" || p === "Strhující") {
    const dc = 8 + (o.hod ? +o.hod.b - (o.hod.pres || 0) : 2);
    if (K && window.MMDB && MMDB.vyzva) {
      MMDB.vyzva({
        typ: "zach",
        ab: "CON",
        dc,
        komu: [K.id],
        pozn: `${p} (${n ? n.n : "nepřítel"}): při neúspěchu ${p === "Omračující" ? "zaskočen – bez Reakce a nevýhoda na útoky" : "sražen k zemi"}`.slice(
          0,
          200,
        ),
      })
        .then(v => {
          BZVV[+v] = {hid: h.id, kid: K.id, dc, p, nid: n ? n.id : ""};
          vyzvyNacti();
        })
        .catch(() => {});
      mmHlasG(`${h.n}: výzva – CON záchrana SO ${dc} (${p}).`, 4000);
    } else {
      bojZmen(z => {
        const hh = (z.hraci || []).find(q => q.id === h.id);
        if (hh) {
          if (p === "Omračující") efH(z, hh, "Omračující", "konec", "zaskočen");
          else if (!(hh.stav || []).includes("sražen")) hh.stav = [...(hh.stav || []), "sražen"];
        }
      });
      mmHlasG(`${h.n}: ${p} – bez karty se záchrana nehází, stav zapsán.`, 4000);
    }
    renderBoj();
    return;
  }
  bojZmen(z => {
    const hh = (z.hraci || []).find(q => q.id === h.id);
    if (!hh) return;
    if (p === "Krvežíznivá") {
      if (!(hh.stav || []).some(v => /^krvácí/.test(v))) hh.stav = [...(hh.stav || []), "krvácí k4"];
    } else if (p === "Odvetná") efH(z, hh, "Odvetná", "konec", "ve vazbě");
    else if (p === "Přibodnutí") efH(z, hh, "Přibodnutí", "zacatek", "přibodnut");
  });
  bojLog(h.id, {n: p, ai: n ? n.id : null, ci: h.id, zt: BZVAKT[p].poz}, n ? n.n : "");
  mmHlasG(`${h.n}: ${p} – ${BZVAKT[p].poz}.`, 5000);
  renderBoj();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bzvn]");
  if (!b || !GMV) return;
  const [t, p] = b.dataset.bzvn.split("|");
  bojZvNpcEfekt(t, p);
});
/* odpovědi na výzvy CON záchrany (volá bojVyzZpracuj) */
function bojZvVyzvy(s) {
  Object.keys(BZVV).forEach(id => {
    const P = BZVV[id],
      v = VYZVY.find(x => x.id === +id);
    if (!v) return;
    const o = (v.odpovedi || {})[P.kid];
    if (!o) return;
    delete BZVV[id];
    MMDB.vyzvaZavri(+id).catch(() => {});
    const ok = o.tot >= P.dc,
      h = (s.hraci || []).find(x => x.id === P.hid);
    if (!h) return;
    const kolo = s.kolo || 1,
      tah = s.tah || 0;
    if (!ok)
      bojZmen(z => {
        const hh = (z.hraci || []).find(x => x.id === P.hid);
        if (!hh) return;
        if (P.p === "Omračující") {
          (hh.ef || []).filter(e => e.st === "zaskočen").forEach(e => bojEfDel(hh, e));
          (hh.ef = hh.ef || []).push({n: "Omračující", kdy: "konec", kolo, tah, st: "zaskočen"});
          if (!(hh.stav || []).includes("zaskočen")) hh.stav = [...(hh.stav || []), "zaskočen"];
        } else if (!(hh.stav || []).includes("sražen")) hh.stav = [...(hh.stav || []), "sražen"];
      });
    bojLog(
      P.hid,
      {n: P.p, ai: P.nid || null, ci: P.hid, zt: `CON ${o.tot} proti SO ${P.dc} – ${ok ? "uspěl" : P.p === "Omračující" ? "zaskočen" : "sražen"}`},
      h.n,
    );
    mmHlasG(`${h.n}: ${P.p} – CON ${o.tot} ${ok ? "uspěl" : "neuspěl"}.`, 5000);
  });
}
