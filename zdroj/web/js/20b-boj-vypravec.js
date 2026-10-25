/* ===== Boj: vypravěč – vyhodnocení a potvrzení útoků hráčů, veřejný záznam, pruh „co teď“, panely, statistika,
   formuláře přípravy, klávesy, uložení setkání, hlavní obsluha klepnutí, Zpět v záznamu (2026-10-20 rozděleno z 20-boj-hraci.js) ===== */
/* ===== útoky postav z telefonu, zbraně postav, veřejný záznam pro hráče, statistika, filtr a Zpět v záznamu (2026-10-16) ===== */
const BZTYPY = [
  "Slashing",
  "Piercing",
  "Bludgeoning",
  "Fire",
  "Cold",
  "Lightning",
  "Thunder",
  "Acid",
  "Poison",
  "Necrotic",
  "Radiant",
  "Psychic",
  "Force",
];
const bojZrCz = t =>
  String(t || "").replace(
    /\b(Bludgeoning|Piercing|Slashing|Fire|Cold|Lightning|Thunder|Acid|Poison|Necrotic|Radiant|Psychic|Force)\b/g,
    m => BZRT[m] || m,
  );
/* útoky hráčů: vypravěč je nechá zapsat rovnou (výchozí), nebo každý potvrdí */
const bojAuto = {
  get() {
    return typeof potvrz === "function" ? potvrz().rezim === "nic" : true;
  },
  _get() {
    try {
      return localStorage.getItem("mm-boj-auto") !== "0";
    } catch (e) {
      return true;
    }
  },
  set(v) {
    try {
      localStorage.setItem("mm-boj-auto", v ? "1" : "0");
    } catch (e) {}
  },
};
/* zbraně postavy (ukládají se k jménu postavy a přežijí do dalšího boje) */
const bojZbrH = (s, h) => ((s && s.zbrane) || {})[h && h.n] || [];
/* veřejný záznam: kdo, komu, čím, výsledek; zranění jen u zásahů postav a spojenců, nikdy životy a AC nepřátel */
const BZAZQ = [];
function bojZaz(e) {
  if (!GMV || !bojDB || !(BOJ.s && BOJ.s.aktivni)) return;
  e.k = bojBezi(BOJ.s) ? BOJ.s.kolo || 1 : null;
  e.ts = Date.now();
  BZAZQ.push(e);
  clearTimeout(bojZaz.t);
  bojZaz.t = setTimeout(() => {
    const q = BZAZQ.splice(0);
    if (q.length)
      bojZmen(z => {
        z.zaz = [...q.reverse(), ...(z.zaz || [])].slice(0, 40);
      }, true);
  }, 120);
}
const bojVerej = (s, id) => {
  const c = bojCilO(s, id);
  return !!c && (!c.druh || bojSpoj(c));
};
/* životy nepřítele (místní paměť vypravěče): odečte a vrátí podklad pro Zpět */
function bojHpUber(id, k, x) {
  const n = ((BOJ.s && BOJ.s.npc) || []).find(q => q.id === id),
    E = n && bojEff(n);
  if (!E || !E.hp.length) return null;
  const hp = bojHp.get(),
    a = hp[id] || [],
    old = a[k] != null ? a[k] : E.hp[k].max;
  a[k] = old - x;
  hp[id] = a;
  bojHp.set(hp);
  bojHpZmena(id, k, old, old - x);
  return {id, k, old, nov: old - x};
}
/* záchrany houfu po jednom pacholkovi: každý svůj hod a celé zranění (při záchraně polovinu); padne, komu dojde 5 HP
   (Vojta 2026-10-22). První v oblasti je raněný přední pacholek (n.hz); zranění ostatních, kteří přežijí, se nepamatuje. */
function bojHoufZachrany(n, E, dmg, t, ab, dc, pol, kolik, kouzlo) {
  const b = bojSaveB(E && E.p, ab),
    v = Math.max(0, Math.min(n.pocet || 0, kolik == null ? n.pocet || 0 : kolik)),
    h = [];
  let pad = 0,
    hz = +n.hz || 0;
  for (let i = 0; i < v; i++) {
    const Z = bojNpcZach(n, E, ab, dc, kouzlo),
      ok = Z.ok,
      base = ok ? (pol ? Math.floor(dmg / 2) : 0) : dmg,
      x = (E ? bojZasah(E, base, t, {}).x : base) + (i === 0 ? +n.hz || 0 : 0);
    if (x >= BPACH_HP) {
      pad++;
      if (i === 0) hz = 0;
    } else if (i === 0) hz = x;
    h.push(Z.fail ? "✗" : `${Z.t}${ok ? "✓" : "✗"}`);
  }
  return {pad, v, hz: pad >= (n.pocet || 0) ? 0 : hz, hz0: +n.hz || 0, txt: `${ab} ${bsg(b)}: ${h.join(" ")}`};
}
/* vyhodnocení útoku hráče proti nepřátelům (u vypravěče – zná AC a odolnosti) */
/* účinek kouzla bez hodu (Hex, Hunter's Mark…) posílá hráč jako „útok“ s názvem „Účinek: …“ – vypravěč ho potvrdí a nepřítel dostane značku
   (ne ✦ – ten build z hráčské verze odstraňuje) */
const BUEF = "Účinek: ",
  bojUtEf = u => (String((u && u.cim) || "").startsWith(BUEF) ? u.cim.slice(BUEF.length).trim() : null);
/* značka účinku kouzla na nepříteli (trvání z kouzla v kolech; soustředěné kouzlo drží sesilatel) */
/* název kouzla z „čím“ útoku: bez přídavků a stupně („Guiding Bolt (2. st.) + Hex“ → Guiding Bolt) */
const bojSpJm = cim =>
  String(cim || "")
    .split(" + ")[0]
    .replace(/^(Riposte|Odveta): /, "")
    .replace(/\s*\(\d+\. st\.\)\s*$/, "")
    .trim();
function bojEfZnac(z, n, sp, u) {
  const nm = String(sp || "")
    .replace(/\s*\(\d+\. st\.\)\s*$/, "")
    .trim();
  /* Dispel Magic: kouzla na cíli končí (účinky se zdrojem nebo pojmenované kouzlem) */
  /* přesun Hexu / Hunter's Marku na nový cíl (2026-10-20): zbývající trvání i soustředění zůstanou */
  if (/ \(přesun\)$/.test(nm)) {
    const base = nm.replace(/ \(přesun\)$/, "");
    let star = null;
    (z.npc || []).forEach(o =>
      (o.ef || [])
        .filter(e => e.n === base && (!u.h || e.od === u.h))
        .forEach(e => {
          star = star || e;
          bojEfDel(o, e);
        }),
    );
    const ef = star ? Object.assign({}, star) : {n: base, kdy: "kola", k: 600, kolo: z.kolo || 1, tah: z.tah || 0};
    if (u.h) ef.od = u.h;
    (n.ef || []).filter(e => e.n === base).forEach(e => bojEfDel(n, e));
    (n.ef = n.ef || []).push(ef);
    bojMsg(n.id, `${base} přenesen na ${n.n}.`);
    return true;
  }
  if (nm === "Dispel Magic") {
    const L = (n.ef || []).filter(e => e.src || (typeof kSp === "function" && KSPD && kSp(String(e.n).replace(/^Účinek:\s*/, ""))));
    L.forEach(e => bojEfDel(n, e));
    bojMsg(n.id, L.length ? `Dispel Magic: končí ${[...new Set(L.map(e => e.n))].join(", ")}.` : "Dispel Magic: na cíli není žádné kouzlo.");
    return true;
  }
  return bojEfZnac0(z, n, sp, u, nm);
}
function bojEfZnac0(z, n, sp, u, nm) {
  const d = typeof kSp === "function" && KSPD ? kSp(nm) : null,
    hh = d ? kTrv(d.d) : null;
  if (!hh) return false;
  const h = (z.hraci || []).find(x => x.id === u.h),
    ef = {n: d.en || nm, kdy: "kola", k: Math.max(1, Math.round(hh * 600)), kolo: z.kolo || 1, tah: z.tah || 0};
  if (u.h) ef.od = u.h;
  if (d.ko && h && (h.stav || []).includes("soustředí")) ef.src = u.h;
  (n.ef || []).filter(e => e.n === ef.n && !e.st).forEach(e => bojEfDel(n, e));
  (n.ef = n.ef || []).push(ef);
  return true;
}
/* vyhodnocení útoku hráče se hází jen jednou (2026-10-19): náhled v panelu „k potvrzení“ i zápis používají tytéž kostky
   (záchrany nepřátel, Ostrá, záchrany houfu) – dřív se při zápisu házelo znovu a výsledek se lišil od náhledu */
const BUVC = new Map();
function bojUtokVyhodnot(s, u) {
  if (!u || !u.id) return bojUtokVyhodnot0(s, u);
  const k = u.id + "|" + (u.ci || []).join(",");
  if (BUVC.has(k)) return BUVC.get(k);
  const V = bojUtokVyhodnot0(s, u);
  BUVC.set(k, V);
  if (BUVC.size > 200) BUVC.delete(BUVC.keys().next().value);
  return V;
}
function bojUtokVyhodnot0(s, u) {
  const h = (s.hraci || []).find(x => x.id === u.h),
    sp = u.sid ? (s.npc || []).find(x => x.id === u.sid) : null,
    an = sp ? `${sp.n} (${h ? h.n : "?"})` : h ? h.n : "?",
    r = [],
    ef = bojUtEf(u);
  (u.ci || []).forEach(ci => {
    const n = (s.npc || []).find(x => x.id === ci);
    if (!n) return;
    const E = bojEff(n),
      houf = n.druh === "houf",
      o = {ci, n: n.n, houf};
    if (ef) {
      Object.assign(o, {ef, gm: `${n.n}: ${ef} (účinek kouzla)`, vys: ef});
      r.push(o);
      return;
    }
    if (u.plos) {
      const P = u.plos;
      const kz = !!u.sl || bojJeKouzlo(u.cim);
      if (houf) {
        const H = bojHoufZachrany(n, E, u.dmg, u.t, P.ab, P.dc, P.pol, null, kz);
        Object.assign(o, {
          pad: H.pad,
          hz: H.hz,
          hz0: H.hz0,
          gm: `${n.n}: záchrany ${H.txt} → padlo ${H.pad} z ${H.v}`,
          vys: H.pad ? `padlo ${H.pad}` : "všichni odolali",
        });
        r.push(o);
        return;
      }
      const Z = bojNpcZach(n, E, P.ab, P.dc, kz),
        t = Z.t,
        ok = Z.ok,
        base = ok ? (P.pol ? Math.floor(u.dmg / 2) : 0) : u.dmg,
        z = E ? bojZasah(E, base, u.t, {}) : {x: base, pozn: []};
      const SS = !ok ? bojSpStav(u.cim) : null;
      if (SS) o.spst = SS;
      if (!ok) o.fail = 1;
      if (!ok && !Z.fail && bojLegZb(n, E)) o.leg = bojLegZb(n, E);
      o.zch = {ab: P.ab, pol: P.pol, dmg: u.dmg, t: u.t};
      Object.assign(o, {
        x: z.x,
        gm: `${n.n}: ${Z.txt} ${ok ? "úspěch" : "neúspěch"} → ${z.x}${z.pozn.length ? " (" + z.pozn.join(", ") + ")" : ""}${SS ? ` · ${SS.st.join(", ")}${SS.op ? " (záchrana na konci každého tahu)" : ""}` : ""}`,
        vys: ok ? (z.x ? "záchrana, poloviční zranění" : "záchrana uspěla") : SS ? SS.st.join(", ") : "zasažen",
        sav: `${P.ab} ${t || ""} ${ok ? "úspěch" : "neúspěch"}`.replace("  ", " "),
      });
      r.push(o);
      return;
    }
    const ZS = E ? bojZbrStav(n, E) : null,
      kr = (+n.kryt || 0) && !(h && bojSS(s, h, u)) && !(+n.kryt === 2 && bojZvMa(u, "Nepřímá")) ? +n.kryt : 0,
      AC = ZS ? ZS.ac + kr : null;
    let krit = u.d != null && u.d >= Math.min(20, +u.kmin || 20);
    const mis = u.d === 1;
    if (+n.kryt === 2 && bojZvMa(u, "Nepřímá")) o.neprima = 1;
    /* Ostrá (Artikule): 19 je kritický zásah, když zbraň seká (Slashing) cíl bez Resistance proti Slashing – web přihodí kostky zranění */
    if (!krit && +u.d === 19 && u.t === "Slashing" && !bojMaRes(n, "Slashing")) {
      const K = bojKartaH(h),
        a = K && kUtoky(K).find(x => x.n === bojZvJm(u)),
        m = a && String(a.z || "").match(/^(\d*)d(\d+)/);
      if (a && m && bdmZvl(a, K).includes("Ostrá")) {
        const q = bojKostky(`${m[1] || 1}d${m[2]}`, false);
        krit = true;
        u = Object.assign({}, u, {dmg: (+u.dmg || 0) + (q ? q.t : 0)});
        o.ostra = q ? q.x : "";
        r.ostra = 1;
      }
    }
    /* Do slabin! (Artikule): dýka proti sraženému nebo spoutanému cíli s Požehnáním = kritický zásah – web přihodí kostky zranění */
    if (!krit && !mis && bojZvMa(u, "Do slabin!") && u.zv && u.zv.r === "poz" && (n.stav || []).some(t => t === "sražen" || t === "spoután")) {
      const q = bojZvZbrKostky(h, u);
      krit = true;
      if (q) u = Object.assign({}, u, {dmg: (+u.dmg || 0) + q.t});
      o.slabin = q ? q.x : "";
    }
    const hit = !mis && (krit || AC == null || u.hod >= AC);
    Object.assign(o, {hit, krit, AC, acT: AC != null ? `AC ${AC}${kr ? ` s krytem +${kr}` : ""}` : "AC neznámé"});
    if (!hit) {
      o.zve = bojZvVyhodnot(s, u, h, n, E, ZS, false, false);
      /* Graze (mistrovství, 20g): při minutí zranění ve výši modifikátoru */
      const gr = typeof bojWmMinuti === "function" ? bojWmMinuti(o, u, n, E) : "";
      o.gm = `${n.n}: ${u.hod}${mis ? " (přirozená 1)" : ""} proti ${o.acT}${o.neprima ? " (Nepřímá: poloviční kryt neplatí)" : ""} → vedle${gr}${o.zve.map(e => " · " + e.txt).join("")}`;
      o.vys = gr ? `vedle, škrábnutí ${o.graze}` : "vedle";
      r.push(o);
      return;
    }
    if (houf) {
      const z = E ? bojZasah(E, u.dmg, u.t, {drt: u.drt, pru: u.pru}) : {x: u.dmg, pozn: []},
        Hz = bojHoufZasah(n, z.x);
      o.pad = Hz.pad;
      o.hz = Hz.hz;
      o.hz0 = Hz.hz0;
      const pdT = o.pad === 1 ? "padl pacholek" : `padli ${o.pad} pacholci`;
      o.gm = `${n.n}: ${u.hod} proti ${o.acT} → zásah ${z.x}${o.pad ? `, ${pdT}` : ""}${o.hz ? `, další pacholek raněn ${o.hz}/${BPACH_HP}` : ""}${!o.pad && !z.x ? " bez účinku" : ""}${z.pozn.length ? " (" + z.pozn.join(", ") + ")" : ""}`;
      o.vys = o.pad ? `${krit ? "kritický zásah, " : ""}${pdT}` : z.x ? `pacholek raněn (${o.hz}/${BPACH_HP})` : "zásah bez účinku";
      r.push(o);
      return;
    }
    const z = E && E.hp.length ? bojZasah(E, u.dmg, u.t, {drt: u.drt, pru: u.pru, st: n.stav}) : {x: u.dmg, pozn: []};
    o.x = z.x;
    o.pozn = z.pozn;
    o.sokKrit = krit && n.druh === "sok";
    /* sok se zbrojí (Vojta 2026-10-22): kritický zásah sám obětuje zbroj či štít a mění se v běžný zásah; kdo nemá co obětovat, je poražen */
    const zb = o.sokKrit && ZS && ZS.d.find(q => q.u < q.max);
    if (zb) {
      const z1 = E && E.hp.length ? bojZasah(E, bojDmgBezKritu(u), u.t, {drt: u.drt, pru: u.pru, st: n.stav}) : {x: bojDmgBezKritu(u), pozn: []};
      o.sokKrit = false;
      o.obet = zb.k;
      o.x = z1.x;
      o.pozn = [...z1.pozn, `${zb.k === "Štít" ? "štít" : zb.k.toLowerCase() + " zbroj"} obětována – krit jako běžný zásah`];
    }
    o.zve = bojZvVyhodnot(s, u, h, n, E, ZS, true, krit);
    /* mistrovství zbraně (20g): Topple, Sap, Slow, Vex, Push – přidá se k vyhodnocení perků */
    if (typeof bojWmVyhodnot === "function") o.wme = bojWmVyhodnot(u, h, n, E, o);
    if (u.man && typeof bojManVyhodnot === "function") o.mne = bojManVyhodnot(u, n, E);
    o.gm = `${n.n}: ${u.hod} proti ${o.acT} → ${krit ? "kritický zásah" : "zásah"}${o.ostra != null ? ` (Ostrá: 19 seká cíl bez Resistance, přihozeno ${o.ostra})` : ""}${o.slabin != null ? ` (Do slabin!: ležící cíl, přihozeno ${o.slabin})` : ""}, ${u.dmg}${z.pozn.length ? " → " + z.x + " (" + z.pozn.join(", ") + ")" : ""}${o.sokKrit ? " · sok je kritickým zásahem poražen (Artikule) – ledaže pošle do rány pacholka („Za pána!“)" : ""}${krit && n.druh === "zhoubce" ? " · zhoubce smí obětovat zbroj" : ""}${o.zve.map(e => " · " + e.txt).join("")}`;
    o.vys = o.sokKrit
      ? "kritický zásah – poražen"
      : o.obet
        ? `kritický zásah – ${o.obet === "Štít" ? "štít" : "zbroj"} obětována`
        : krit
          ? "kritický zásah"
          : "zásah";
    if (o.obet) o.gm += ` · ${o.obet} obětována, zranění bez kritu ${o.x}`;
    if ((o.wme || []).length) o.gm += o.wme.map(e => " · " + e.txt).join("");
    if (o.mne) o.gm += " · " + o.mne.txt;
    r.push(o);
  });
  return {an, h, r};
}
const BUTZP = new Set();
/* potvrzení útoku hráče: životy, houfy, záznam, veřejný výsledek */
function bojUtokPotvrd(id, zamitni) {
  const s = BOJ.s;
  const u = s && (s.utoky || []).find(x => x.id === id);
  if (!u || u.stav !== "ceka" || BUTZP.has(id)) return;
  BUTZP.add(id);
  if (zamitni) {
    bojZmen(z => {
      const q = (z.utoky || []).find(x => x.id === id);
      if (q) {
        q.stav = "zamitnuto";
        q.vys = "vypravěč útok nezapsal";
      }
    });
    bojUtokVratSlot(u);
    return;
  }
  bojUtokProved(s, u, id);
}
/* zápis vyhodnoceného útoku (i útoku, který vypravěč sešle za hráče rovnou z okna „na koho“ – bez id) */
/* Legendární odolnost u záchrany proti kouzlu hráče: vypravěč ji zvolí v panelu k potvrzení – neúspěch se změní v úspěch */
function bojUtokLeg(uid, ci) {
  const s = BOJ.s,
    u = s && (s.utoky || []).find(x => x.id === +uid || x.id === uid);
  if (!u) return;
  const V = bojUtokVyhodnot(s, u),
    o = V.r.find(x => x.ci === ci);
  if (!o || !o.leg || !o.zch) return;
  const n = (s.npc || []).find(x => x.id === ci),
    E = n && bojEff(n),
    Z = o.zch,
    base = Z.pol ? Math.floor(Z.dmg / 2) : 0,
    z = E ? bojZasah(E, base, Z.t, {}) : {x: base, pozn: []};
  delete o.leg;
  delete o.fail;
  delete o.spst;
  o.legU = 1;
  o.x = z.x;
  o.gm += ` → Legendární odolnost: úspěch → ${z.x}`;
  o.vys = z.x ? "Legendární odolnost, poloviční zranění" : "Legendární odolnost – záchrana uspěla";
  o.sav = `${Z.ab} úspěch (Leg. odolnost)`;
  renderBoj();
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-bulr]");
  if (b) bojUtokLeg(b.dataset.bulr, b.dataset.ci);
});
function bojUtokProved(s, u, id) {
  const V = bojUtokVyhodnot(s, u),
    houfy = [],
    mrtvi = [];
  V.r.forEach(o => {
    if (!o.legU) return;
    const n = (s.npc || []).find(x => x.id === o.ci),
      E = n && bojEff(n);
    if (!E) return;
    const zn = bojLegN(E),
      z = bojZdr.get(),
      q = (z[o.ci] = z[o.ci] || {});
    q[zn] = (q[zn] || 0) + 1;
    bojZdr.set(z);
  });
  V.r.forEach(o => {
    const L = {
      n: o.ef || u.cim || (u.plos ? "Plošný útok" : "útok"),
      ai: u.h,
      an: V.an,
      ci: o.ci,
      uh: {hod: u.hod, d: u.d, adv: u.adv, dmg: u.dmg, cim: u.cim || "", t: u.t, det: u.det || null},
      zt: o.ef
        ? "účinek kouzla"
        : u.plos
          ? o.sav || ""
          : `útok ${u.hod}${u.adv ? (u.adv > 0 ? " (výh.)" : " (nev.)") : ""} – ${o.hit ? (o.krit ? "kritický zásah" : "zásah") : "vedle"}`,
    };
    if (o.ef) {
    } else if (o.houf) {
      if (o.pad || o.hz !== o.hz0) {
        houfy.push([o.ci, o.pad, o.hz]);
        L.und = {id: o.ci, poc: o.pad, hz0: o.hz0};
      }
      L.zt += (o.pad ? ` · padlo ${o.pad}` : "") + (o.hz ? ` · raněn ${o.hz}/${BPACH_HP}` : "");
      if (o.hit === false) L.res = "vedle";
      else {
        L.res = o.krit ? "krit" : "zasah";
      }
    } else if (o.x != null) {
      let x = o.x;
      if (o.sokKrit) {
        const hv = (bojHp.get()[o.ci] || [])[0],
          E = bojEff((s.npc || []).find(q => q.id === o.ci)),
          cur = hv != null ? hv : E && E.hp.length ? E.hp[0].max : x;
        x = Math.max(x, cur);
      }
      const U = bojHpUber(o.ci, 0, x);
      if (U) {
        L.und = U;
        L.zr = {
          t: x,
          x: `z ${u.dmg}${(o.pozn || []).length ? " → " + o.pozn.join(", ") : ""}${o.sokKrit ? " · kritický zásah soka porazí (nemá co obětovat)" : ""}`,
          zt: u.t,
        };
        L.ap = 1;
        if (U.nov <= 0) mrtvi.push(o.n);
      }
      L.res = o.hit === false ? "vedle" : o.krit ? "krit" : "zasah";
      if (o.graze) L.zt += ` · Graze ${o.graze}`;
    } else L.res = "vedle";
    if (u.zv && u.zv.r === "pok" && (u.zv.a || []).length && !o.houf) L.zvk = {h: u.h, ci: o.ci, a: u.zv.a.slice(), w: bojZvJm(u)};
    bojLog(o.ci, L, o.n);
  });
  const vys = V.r.length === 1 ? V.r[0].vys : V.r.map(o => `${o.n}: ${o.vys}`).join(" · ");
  bojZmen(z => {
    const q = id != null && (z.utoky || []).find(x => x.id === id);
    if (q) {
      q.stav = "hotovo";
      q.vys = vys;
    }
    V.r.forEach(o => {
      const n = (z.npc || []).find(x => x.id === o.ci);
      if (!n) return;
      if (o.ef) bojEfZnac(z, n, o.ef, u);
      else if (o.spst && u.plos) bojSpStavDej(z, n, o.spst, u);
      else if (o.fail && u.plos && !o.houf) bojEfZnac(z, n, u.cim, u);
      else if (!u.plos && !o.houf && o.vys && o.vys !== "vedle" && BZNADV[bojSpJm(u.cim)]) bojEfZnac(z, n, bojSpJm(u.cim), u);
    });
    houfy.forEach(([ci, pad, hz]) => {
      const o = (z.npc || []).find(x => x.id === ci);
      if (!o) return;
      o.pocet = Math.max(0, (o.pocet || 0) - pad);
      if (hz != null) o.hz = o.pocet > 0 ? hz : 0;
      if (!o.hz) delete o.hz;
    });
    V.r.forEach(o => {
      const n = o.obet && (z.npc || []).find(x => x.id === o.ci);
      if (!n) return;
      n.zbrU = n.zbrU || {};
      n.zbrU[o.obet] = (n.zbrU[o.obet] || 0) + 1;
    });
    try {
      bojZvProved(z, u, V);
    } catch (e) {
      console.error(e);
    }
    try {
      if (typeof bojWmProved === "function") bojWmProved(z, u, V);
    } catch (e) {
      console.error(e);
    }
    z.zaz = [
      ...V.r
        .slice()
        .reverse()
        .map(o => ({
          k: z.kolo || 1,
          ts: Date.now(),
          a: V.an,
          ai: u.h,
          c: o.n,
          ci: o.ci,
          cim: u.cim || "",
          v: o.vys + (mrtvi.includes(o.n) ? ", padl" : ""),
          ...(u.hod != null && !u.plos ? {hu: u.hod} : {}),
        })),
      ...(z.zaz || []),
    ].slice(0, 40);
  });
  mmHlasG(`${V.an} → ${vys}`, 5000);
}
/* nové útoky hráčů po načtení boje: rovnou zapsat, nebo upozornit */
function bojUtokyNove() {
  if (!GMV || !BOJ.s || !BOJ.s.aktivni) return;
  const P = (BOJ.s.utoky || []).filter(u => u.stav === "ceka" && !BUTZP.has(u.id));
  if (!P.length) return;
  if (bojAuto.get()) P.forEach(u => bojUtokPotvrd(u.id));
  else {
    renderBoj();
    mmHlasG(`${P.length === 1 ? "Útok hráče čeká" : "Útoky hráčů čekají"} na potvrzení.`, 3500);
  }
}
/* vypravěč: čekající útoky hráčů s náhledem výsledku */
/* ===== Pruh „co teď“ (2026-10-19, jen vypravěč): kdo je na tahu a co mu zbývá, co čeká na vypravěče, kdo se soustředí,
   kdo krvácí, koho čeká záchrana na konci tahu, kdo je na prahu smrti. Klepnutí na účastníka otevře jeho kartu. ===== */
function bojTedHtml(s) {
  if (!GMV || !bojBezi(s)) return "";
  const tah = s.tah || 0,
    kolo = s.kolo || 1,
    sl = bojSloty(s),
    cur = sl[tah],
    kdoT = (s.obsazeni || {})[tah];
  const vsichni = [...(s.hraci || []), ...(s.npc || [])],
    jm = id => besc(bojJm(s, id) || id),
    uc = id => vsichni.find(x => x.id === id),
    R = [];
  const ch = (cls, ic, txt, id, tip) =>
    `<${id ? 'button type="button" data-bted="' + besc(id) + '"' : "span"} class="btedch ${cls}" ${btip(tip || "")}>${ic ? bi(ic, "btedi") : ""}${txt}</${id ? "button" : "span"}>`;
  /* na tahu */
  if (cur && !(tah >= sl.length)) {
    const o = kdoT ? uc(kdoT) : null;
    if (o) {
      const rk = !!(s.reak || {})[o.id],
        rd = (s.ready || {})[o.id],
        hot = (s.hotovo || {})[o.id] === kolo * 100 + tah,
        nes = bojNeschopny(o.stav),
        lim = o.druh ? BLIM[o.druh] || 1 : 0,
        u = o.druh ? bojUzito(s, o.id) : 0;
      R.push(
        ch(
          "btedtah",
          o.druh ? "tah" : "tah",
          `<b>${jm(o.id)}</b> na tahu${hot ? ` · ${bi("hotovo")} dohráno` : ""}${nes ? ` · <em>${nes} – nejedná</em>` : ""}${rk ? " · reakce použita" : " · reakce volná"}${lim > 1 ? ` · ${u}/${lim} tahů v kole` : ""}${rd ? ` · ⏳ ${besc(rd)}` : ""}`,
          o.id,
          "Karta toho, kdo je na tahu",
        ),
      );
    } else
      R.push(
        ch(
          "btedtah",
          "tah",
          `<b>volný slot</b> · ${cur.t === "h" ? "družina" : "nepřátelé"}${(() => {
            const nv = cur.t !== "h" ? bojNavrh(s) : null;
            return nv ? ` · navrhuji ${besc(nv.n)}` : "";
          })()}`,
          null,
        ),
      );
  }
  /* čeká na vypravěče */
  {
    const ut = (s.utoky || []).filter(u => u.stav === "ceka").length,
      nv = typeof navrhyCeka === "function" ? navrhyCeka().length : 0,
      vz = (typeof VYZVY !== "undefined" ? VYZVY : []).filter(
        v => !v.zavrena && (v.data && v.data.komu && v.data.komu.length ? v.data.komu : KARTY.map(k => k.id)).some(k => !(v.odpovedi || {})[k]),
      ).length;
    if (ut)
      R.push(
        ch(
          "btedceka",
          "kostka",
          `${ut} ${ut === 1 ? "útok" : ut < 5 ? "útoky" : "útoků"} k potvrzení`,
          null,
          "Útoky hráčů z telefonu čekají na tvé potvrzení (panel pod pruhem)",
        ),
      );
    if (nv)
      R.push(
        ch(
          "btedceka",
          "zdroj",
          `${nv} ${nv === 1 ? "návrh" : nv < 5 ? "návrhy" : "návrhů"} ke schválení`,
          null,
          "Léčení spojence, Bardic… – schválit v Hra › Družina",
        ),
      );
    if (vz)
      R.push(
        ch(
          "btedceka",
          "kostka",
          `${vz} ${vz === 1 ? "výzva" : vz < 5 ? "výzvy" : "výzev"} bez odpovědi`,
          null,
          "Hráči ještě nehodili (záchrana, iniciativa, opakovaná záchrana)",
        ),
      );
  }
  /* soustředění */
  vsichni
    .filter(o => (o.stav || []).includes("soustředí"))
    .forEach(o => {
      const K = !o.druh ? bojKartaH(o) : null,
        n = K ? kKonNazev(K) : "";
      R.push(
        ch(
          "btedkon",
          "soustredi",
          `${jm(o.id)}${n ? `: <i>${besc(n)}</i>` : ""}`,
          o.id,
          `${bojJm(s, o.id)} se soustředí${n ? " na " + n : ""} – při zranění CON záchrana`,
        ),
      );
    });
  /* krvácení */
  vsichni
    .filter(o => (o.stav || []).some(t => /^krvácí/.test(t)))
    .forEach(o =>
      R.push(
        ch(
          "btedkrv",
          "krvaci",
          `${jm(o.id)} krvácí ${(o.stav.find(t => /^krvácí/.test(t)) || "").replace("krvácí ", "")}`,
          o.id,
          "Na začátku tahu ztratí životy, dokud ho někdo neošetří (Medicine)",
        ),
      ),
    );
  /* opakované záchrany na konci tahu */
  vsichni.forEach(o =>
    (o.ef || [])
      .filter(e => e.op)
      .forEach(e =>
        R.push(
          ch(
            "btedzach",
            "kostka",
            `${jm(o.id)}: ${besc(e.n)} <small>${besc(e.op.ab)} SO ${besc(String(e.op.dc))}</small>`,
            o.id,
            `Na konci tahu ${bojJm(s, o.id)} opakuje záchranu – úspěch ukončí ${e.st || "účinek"}`,
          ),
        ),
      ),
  );
  /* na prahu smrti */
  (s.hraci || [])
    .filter(h => h.ds && !h.ds.st)
    .forEach(h => R.push(ch("btedsmrt", "prah-smrti", `${jm(h.id)} ${bojDsPip(h)}`, h.id, "Na prahu smrti – na začátku tahu hod proti smrti")));
  (s.hraci || [])
    .filter(h => h.ds && h.ds.st === "mrtev")
    .forEach(h => R.push(ch("btedsmrt", "mrtev", `${jm(h.id)} umírá`, h.id, "Tři neúspěchy hodu proti smrti")));
  if (!R.length) return "";
  return `<div class="bted" role="status" aria-label="Co teď">${R.join("")}</div>`;
}
/* hromadný hod v Boji (2026-10-19): celá družina hodí ověření nebo záchranu (dech draka, past, skrytí…) jedním klepnutím;
   výsledky přijdou sem, do stejného panelu (výzvy jako v pultu › Družina) */
function bojVyzPanel(s) {
  if (!GMV || !window.MMDB || !MMDB.vyzva) return "";
  const L = (typeof VYZVY !== "undefined" ? VYZVY : []).filter(v => !v.zavrena);
  return `<details class="bpridej bvyzp" data-otv="vyzvy"${bojOtv("vyzvy")}><summary>${bi("hromadny-hod")} Hromadný hod družiny${L.length ? ` <b>(${L.length})</b>` : ""}</summary>
    <p class="vyzrych"><span class="bkzlh">Ověření:</span>${["Perception", "Stealth", "Insight", "Investigation", "Athletics", "Acrobatics", "Survival"].map(d => `<button type="button" class="kchip" data-vyzrychle="${d}" ${btip(`Všem postavám vyskočí ověření ${d}`)}>${d}</button>`).join("")}</p>
    <p class="vyzrych"><span class="bkzlh">Záchrana:</span>${BAB.map(a => `<button type="button" class="kchip" data-vyzrychle="${a}" ${btip(`Všem postavám vyskočí záchrana ${a} (dech, past, kouzlo)`)}>${a}</button>`).join("")}</p>
    <p class="kvlh"><label>SO <input type="number" min="1" max="40" data-bvyzdc inputmode="numeric" placeholder="–" aria-label="Stupeň obtížnosti"></label><label><input type="checkbox" data-bvyzskr> SO jen pro mě</label><input data-bvyzpozn maxlength="60" placeholder="za co (dech draka, past…)" aria-label="Poznámka"><small class="rsmall">Vyber SO a klepni na dovednost nebo vlastnost. Zranění se záchranou řeší Plošný zásah.</small></p>
    ${L.length ? vyzvyGmHtml() : ""}</details>`;
}
/* nastavení boje (2026-10-21): potvrzování akcí hráčů, lhůta a automatické odečítání zásahů jsou za ozubeným kolečkem
   v hlavičce Boje – nastavují se jednou na začátku boje, nemusí zabírat řádek na stránce */
function bojNastHtml() {
  if (!GMV) return "";
  return `<details class="bpridej bnast" data-otv="nast"${bojOtv("nast")}><summary ${btip("Nastavení boje: potvrzování akcí hráčů, lhůta, odečítání zásahů")}>${bi("nastaveni")}<span class="vh">Nastavení boje</span></summary><div class="bnastp">${potvrzHtml("boj")}<label class="bauto" ${btip("Zásah nepřítele odečte postavě s kartou životy hned (s odolnostmi a dočasnými HP); hráč může reagovat (Shield…) a zranění se vrátí.")}><input type="checkbox" data-bpcauto${bojPcAuto.get() ? " checked" : ""}> zásahy nepřátel odečítat postavám rovnou</label></div></details>`;
}
function bojUtokyPanel(s) {
  const P = (s.utoky || []).filter(u => u.stav === "ceka");
  if (!P.length) return navrhyGmHtml();
  return `${navrhyGmHtml()}<section class="butkp bmor bkonc"><b>Útoky hráčů k potvrzení</b><ul>${P.map(u => {
    const V = bojUtokVyhodnot(s, u);
    return `<li><b>${besc(V.an)}</b> · ${besc(u.cim || "útok")}${bojUtEf(u) ? " · účinek kouzla bez hodu" : `${u.plos ? ` · plošně ${u.plos.ab} SO ${u.plos.dc}` : ` · útok ${u.hod}${u.d ? ` (d20 ${u.d})` : ""}`} · zranění ${u.dmg} ${besc(bojZrCz(u.t))}`}<br><small>${V.r.map(o => besc(o.gm) + (o.leg ? ` <button type="button" class="badd" data-bulr="${u.id}" data-ci="${o.ci}" ${btip("Nepřítel místo neúspěchu uspěje – spotřebuje jedno použití Legendární odolnosti")}>Legendární odolnost (${o.leg})</button>` : "")).join("<br>")}</small> <button type="button" class="gbtn" data-bupot="${u.id}">Zapsat</button><button type="button" class="gbtn ghost" data-buzam="${u.id}">Zamítnout</button></li>`;
  }).join("")}</ul></section>`;
}
/* statistika boje ze záznamu vypravěče */
function bojStat(s) {
  const D = {},
    T = {},
    K = {};
  let kr = 0,
    mi = 0,
    ut = 0;
  const jm = id => {
    const c = bojCilO(s, id);
    return c ? c.n : "";
  };
  BLOGG.forEach(({id, kdo, o}) => {
    const a = o.ai !== undefined ? jm(o.ai) || o.an || "" : jm(id) || kdo,
      c = o.ci ? jm(o.ci) || o.cn || "" : "";
    const isUt = !!(o.hod && o.hod.tot != null && !o.sav) || !!o.res;
    if (!isUt) return;
    ut++;
    const krit = (o.hod && o.hod.krit) || o.res === "krit",
      mis = (o.hod && o.hod.mis) || o.res === "vedle";
    if (krit) {
      kr++;
      if (a) K[a] = (K[a] || 0) + 1;
    }
    if (mis) mi++;
    if (o.zr && !mis && o.zr.t > 0) {
      if (a) D[a] = (D[a] || 0) + o.zr.t;
      if (c) T[c] = (T[c] || 0) + o.zr.t;
    }
  });
  const top = O => Object.entries(O).sort((x, y) => y[1] - x[1]);
  const d = top(D),
    t = top(T);
  return {
    ut,
    kr,
    mi,
    d,
    t,
    K,
    txt: [
      d[0] ? `Nejvíc zranění rozdal ${d[0][0]} (${d[0][1]})` : "",
      t[0] ? `nejvíc schytal ${t[0][0]} (${t[0][1]})` : "",
      ut ? `útoků ${ut}, kritických zásahů ${kr}, minutí ${mi}` : "",
    ]
      .filter(Boolean)
      .join(", "),
  };
}
function bojStatHtml2(s) {
  const S = bojStat(s);
  if (!S.ut) return "";
  return `<h4 class="bsph">Statistika</h4><div class="bstat2"><div><small>rozdal zranění</small><ol>${
    S.d
      .slice(0, 5)
      .map(([n, v]) => `<li>${besc(n)} <b>${v}</b></li>`)
      .join("") || "<li>—</li>"
  }</ol></div><div><small>schytal</small><ol>${
    S.t
      .slice(0, 5)
      .map(([n, v]) => `<li>${besc(n)} <b>${v}</b></li>`)
      .join("") || "<li>—</li>"
  }</ol></div>
    <div><small>útoky</small><p>${S.ut} · kritické zásahy <b>${S.kr}</b>${
      Object.keys(S.K).length
        ? ` (${Object.entries(S.K)
            .map(([n, v]) => `${besc(n)} ${v}`)
            .join(", ")})`
        : ""
    } · minutí <b>${S.mi}</b></p></div></div><p class="rsmall">U útoků nepřátel na postavy se počítá hozené zranění (AC postav tracker nezná).</p>`;
}
/* filtr záznamu a Zpět ze záznamu */
let BLF = "";
function bojLogZpet(i) {
  const x = BLOGG[i];
  if (!x || !x.o.und || x.o.undone) return;
  const U = x.o.und;
  x.o.undone = 1;
  if (U.poc || U.hz0 != null) {
    bojZmen(z => {
      const o = (z.npc || []).find(q => q.id === U.id);
      if (!o) return;
      o.pocet = Math.min(o.max || 99, (o.pocet || 0) + (U.poc || 0));
      if (U.hz0) o.hz = U.hz0;
      else delete o.hz;
    });
    mmHlasG(U.poc ? `Vráceno: ${U.poc} ${U.poc === 1 ? "pacholek" : "pacholci"} zpět v houfu.` : "Vráceno zranění pacholka.", 3000);
    return;
  }
  const hp = bojHp.get(),
    a = hp[U.id] || [];
  a[U.k] = U.old;
  hp[U.id] = a;
  bojHp.set(hp);
  if (U.old > 0) delete BKPAD[U.id];
  const n = ((BOJ.s && BOJ.s.npc) || []).find(q => q.id === U.id);
  bojLog(U.id, {n: "Vráceno", ai: null, ci: U.id, zt: `životy ${U.nov} → ${U.old}`}, n ? n.n : "");
  mmHlasG(`Vráceno: ${n ? n.n : ""} má zase ${U.old} HP.`, 3000);
  renderBoj();
}
const bojPridejNpc = (s, rows, str) => {
  s.npc = s.npc || [];
  rows.forEach(x => {
    s.nid = (s.nid || s.npc.length) + 1;
    s.npc.push(bojNpc(x, "n" + s.nid, str));
  });
};
document.addEventListener("change", e => {
  const t = e.target;
  if (!t.matches || !t.matches('#bojview .bzrf [name="krit"]')) return;
  const f = t.closest("form"),
    b = f.querySelector(".bzrobet"),
    card = t.closest("[data-bnpc]");
  if (!t.checked || !card) {
    b.hidden = true;
    b.innerHTML = "";
    return;
  }
  const n = (BOJ.s.npc || []).find(x => x.id === card.dataset.bnpc),
    E = n && bojEff(n),
    ZS = E && bojZbrStav(n, E);
  if (!ZS) return;
  b.innerHTML = `<span>Obětovat zbroj? Kritický zásah se změní v běžný.</span>${ZS.d
    .filter(z => z.u < z.max)
    .map(z => `<button type="button" class="gbtn ghost" data-bobet="${besc(z.k)}">${bikZb(z.k)}${z.k} <small>zbývá ${z.max - z.u}×</small></button>`)
    .join("")}<button type="button" class="gbtn ghost" data-bobetne>Ne</button>`;
  b.hidden = false;
});
document.addEventListener("submit", e => {
  if (e.target.matches && e.target.matches("#bojview .bzbf")) {
    e.preventDefault();
    const f = e.target.elements,
      pan = e.target.closest("[data-bhpan]");
    if (!pan) return;
    const n = f.n.value.trim().slice(0, 40);
    if (!n) return;
    const z = f.z.value.trim().replace(/\s+/g, "").toLowerCase();
    if (z && !/^\d{0,2}d\d{1,3}([+-]\d{1,2})?$/.test(z)) {
      (GMV ? mmHlasG : mmHlas)("Kostka zranění ve tvaru 1d8+3.", 3000);
      return;
    }
    const w = {n, t: f.t.value};
    if (f.b.value !== "") w.b = Math.max(-5, Math.min(30, Math.round(+f.b.value)));
    if (z) w.z = z;
    if (f.drt.checked) w.drt = true;
    if (f.pru.checked) w.pru = true;
    if (f.dal.checked) w.dal = true;
    bojHracAkce(
      pan.dataset.bhpan,
      (h, zz) => {
        zz.zbrane = zz.zbrane || {};
        zz.zbrane[h.n] = [...(zz.zbrane[h.n] || []), w].slice(-12);
      },
      `Zbraň uložena: ${n}.`,
    );
    return;
  }
  if (e.target.matches && e.target.matches("#bojview .bclf")) {
    e.preventDefault();
    const f = e.target.elements,
      n = f.n.value.trim();
    if (!n) return;
    bojZmen(z => {
      const c = {id: "c" + Date.now().toString(36), n, stav: 0, ver: f.ver.checked};
      if (+f.cil.value > 0) c.cil = +f.cil.value;
      if (+f.kolo.value > 0) c.kolo = +f.kolo.value;
      (z.cile = z.cile || []).push(c);
    });
    return;
  }
  if (e.target.matches && e.target.matches("#bojview .beff")) {
    e.preventDefault();
    const f = e.target,
      card = f.closest("[data-bnpc]");
    if (!card) return;
    const id = card.dataset.bnpc,
      g = k => f.elements[k].value.trim();
    const st = g("st"),
      nm = g("n") || (st ? (BSTI[st] || [0, st])[1].split(/ [–(]/)[0] : ""),
      kdy = g("kdy");
    if (!nm) {
      mmHlasG("Zadej název účinku.", 2000);
      return;
    }
    bojZmen(s => {
      const o = (s.npc || []).find(x => x.id === id);
      if (!o) return;
      const ef = {n: nm, kdy: kdy[0] === "k" ? "kola" : kdy, kolo: s.kolo || 1, tah: s.tah || 0};
      if (kdy[0] === "k") ef.k = +kdy.slice(1);
      if (st) ef.st = st;
      if (g("z")) {
        ef.z = g("z");
        ef.t = g("t") || "Fire";
      }
      if (ef.st && !(o.stav || []).includes(ef.st)) o.stav = [...(o.stav || []), ef.st];
      if (ef.kdy === "konec" && (s.obsazeni || {})[s.tah || 0] !== id) ef.zac = 0;
      (o.ef = o.ef || []).push(ef);
    });
    return;
  }
  if (e.target.matches && e.target.matches("#bojview .bzrf")) {
    e.preventDefault();
    const f = e.target,
      card = f.closest("[data-bnpc]");
    if (!card) return;
    const id = card.dataset.bnpc,
      n = (BOJ.s.npc || []).find(x => x.id === id),
      E = n && bojEff(n);
    if (!E) return;
    const v = +f.elements.z.value || 0,
      typ = f.elements.t.value,
      o = {drt: f.elements.drt.checked, pru: f.elements.pru.checked},
      k = f.elements.k ? +f.elements.k.value : 0;
    const kdo = f.elements.kdo ? f.elements.kdo.value : "",
      uS = f.elements.u.value.trim(),
      u = uS === "" ? null : +uS,
      ZS = bojZbrStav(n, E),
      kr = +n.kryt || 0,
      AC = ZS.ac + kr,
      ACt = `AC ${AC}${kr ? ` s krytem +${kr}` : ""}`,
      kpre = kdo ? kdo + " → " : "";
    BKDO = kdo;
    const cim = f.elements.cim ? f.elements.cim.value.trim() : "";
    if (kdo) BCIM[kdo] = cim;
    const S = BOJ.s || {},
      kq = (S.hraci || []).find(h => h.n === kdo) || (S.npc || []).find(x => x.n === kdo),
      L0 = {n: cim || "útok", ai: kq ? kq.id : null, an: kdo, ci: id};
    BZTL[id] = {t: typ, drt: o.drt, pru: o.pru};
    if (v > 0 && !(u != null && u < AC)) {
      const D = BDMG[id];
      BDMG[id] = {k: BOJ.s.kolo || 1, t: [...(D && D.k === (BOJ.s.kolo || 1) ? D.t : []), typ]};
    }
    if (u != null && u < AC) {
      bojLog(id, Object.assign({}, L0, {res: "vedle", zt: `útok ${u} proti ${ACt} – vedle`}), n.n);
      bojZaz({a: kdo, ai: L0.ai, c: n.n, ci: id, cim, v: "vedle"});
      renderBoj();
      mmHlasG(`${kpre}${n.n}: útok ${u} proti ${ACt} – vedle.`, 3000);
      return;
    }
    if (v <= 0) {
      if (u != null) {
        bojLog(id, Object.assign({}, L0, {res: "zasah", zt: `útok ${u} proti ${ACt} – zásah, zranění nezadáno`}), n.n);
        renderBoj();
        mmHlasG(`${kpre}${n.n}: útok ${u} proti ${ACt} – zásah. Zadej zranění.`, 3500);
        const z = document.querySelector(`#bojview [data-bnpc="${id}"] .bzrf [name="z"]`);
        if (z) z.focus();
      } else mmHlasG("Zadej zranění.", 2000);
      return;
    }
    o.st = n.stav;
    const r = bojZasah(E, v, typ, o);
    if ((n.stav || []).includes("vzdal se"))
      mmHlasG(`Ozývá se svědomí: ${n.n} se vzdal. Zabít bezbranného je smrtelný hřích (Svědomí −1, proti vlastní Ctnosti −2).`, 7000);
    const hp = bojHp.get(),
      a = hp[id] || [],
      old = a[k] != null ? a[k] : E.hp[k].max;
    bojUndoPush({hp: JSON.parse(JSON.stringify(hp))});
    a[k] = old - r.x;
    hp[id] = a;
    bojHp.set(hp);
    bojLog(
      id,
      Object.assign({}, L0, {
        res: "zasah",
        ap: 1,
        und: {id, k, old, nov: old - r.x},
        zt: u != null ? `útok ${u}` : "",
        zr: {t: r.x, x: `z ${v}${r.pozn.length ? " → " + r.pozn.join(", ") : ""}`, zt: typ},
      }),
      n.n,
    );
    bojZaz({a: kdo, ai: L0.ai, c: n.n, ci: id, cim, v: old - r.x <= 0 ? "zásah, padl" : "zásah"});
    bojHpZmena(id, k, old, old - r.x);
    renderBoj();
    mmHlasG(`${kpre}${n.n}: −${r.x} HP (${BZRT[typ]}${r.pozn.length ? ", " + r.pozn.join(", ") : ""}) → ${old - r.x}/${E.hp[k].max}`, 3500);
    return;
  }
  if (e.target.id === "bojform") {
    e.preventDefault();
    const f = e.target;
    const hraci = [...f.querySelectorAll('[name="hn"]')]
      .map(x => x.value.trim())
      .filter(Boolean)
      .map((n, i) => ({id: "h" + (i + 1), n}));
    if (!hraci.length) {
      mmHlasG("Zadej aspoň jednoho hráče.");
      return;
    }
    const nep = bojRadky(document.getElementById("bfn")),
      sp = bojRadky(document.getElementById("bfs"));
    bojKonecLS();
    BKON = false;
    bojZmen(s => {
      Object.keys(s).forEach(k => delete s[k]);
      Object.assign(s, {
        aktivni: true,
        kolo: 1,
        tah: 0,
        hraci,
        hod: +f.elements.hod.value,
        dm: +f.elements.dm.value,
        npc: [],
        obsazeni: {},
        kostka: null,
        nid: 0,
      });
      bojPridejNpc(s, nep);
      bojPridejNpc(s, sp, "h");
    });
    return;
  }
  if (e.target.id === "bnadd" || e.target.id === "bnadds") {
    e.preventDefault();
    const f = e.target,
      rows = bojRadky({querySelectorAll: () => [f]});
    if (!rows.length) return;
    bojZmen(s => bojPridejNpc(s, rows, f.id === "bnadds" ? "h" : ""));
  }
});
/* bestiář: vyhledávání, výběr jména ze seznamu, životy, počet v dosahu, úroveň družiny, kritické zranění */
document.addEventListener("input", e => {
  const v = document.getElementById("bojview");
  if (!v || !v.contains(e.target)) return;
  const t = e.target;
  if (t.matches("[data-bhledej]")) {
    BHLED = t.value;
    const u = t.parentElement.querySelector("[data-bvysl]");
    if (u) u.innerHTML = bojVysl(BHLED);
    return;
  }
  if (t.matches('[name="nn"]')) {
    const row = t.closest(".bsr,.bnadd");
    if (row) {
      const os = bojOsoba(t.value),
        p = os ? PROTBY[os.b] : bojBest(t.value);
      if (p) bojNapoj(row, p, os);
      else if (!t.value.trim()) bojNapoj(row, null);
    }
  }
  if (t.matches("[data-bhp]")) return; /* životy se zapisují až po Enter / opuštění pole (relativní zápis −12 / +5) */
  if (t.matches("[data-bdos]")) {
    const card = t.closest("[data-bnpc]");
    if (card && t.value !== "") BDOS[card.dataset.bnpc] = +t.value;
    return;
  }
  if (t.matches("[data-bur]")) {
    if (t.value) {
      bojUr.set(Math.max(1, Math.min(20, +t.value)));
      bojObtForm();
      const el = v.querySelector(".bojgrid2 .bobt");
      if (el && BOJ.s) {
        el.innerHTML = bojObt(
          (BOJ.s.npc || []).filter(o => !bojSpoj(o)),
          (BOJ.s.hraci || []).length,
          true,
        ).html;
      }
    }
    return;
  }
  if (t.matches("[data-bkr]")) {
    BKS.rany = +t.value || 0;
    return;
  }
  if (t.matches("[data-bzapt]")) {
    BZAPT = t.value;
    return;
  }
  if (t.matches("input[data-ju]")) {
    BJU[t.dataset.ju] = t.value;
    if (/^(hod|d|dmg)$/.test(t.dataset.ju)) {
      BJU.serie = null;
      BJU.kmin = null;
    }
    return;
  }
  if (t.matches("[data-jukon]")) {
    BJK.d = t.value;
    const el = t.closest(".bjkon");
    if (el && +t.value > 0 && !el.querySelector("[data-jukonx]")) renderBoj();
    return;
  }
  if (t.matches("[data-bkp]")) {
    BKS.pod = +t.value || 0;
    return;
  }
  if (t.closest("#bojform")) bojObtForm();
});
let BHP0 = null;
document.addEventListener("focusin", e => {
  if (e.target.matches && e.target.matches("#bojview [data-bhp]")) {
    BHP0 = {hp: JSON.parse(JSON.stringify(bojHp.get())), v: e.target.value === "" ? +e.target.dataset.max : +e.target.value};
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && e.target.matches && e.target.matches("#bojview [data-bhp]")) {
    e.preventDefault();
    e.target.blur();
  }
});
/* zápis životů: číslo nastaví, „−12“ / „-12“ odečte, „+5“ přičte; jde přes Zpět, záznam boje i Concentration */
function bojHpZapis(t) {
  const card = t.closest("[data-bnpc]");
  if (!card || !BHP0) return;
  const id = card.dataset.bnpc,
    k = +t.dataset.bhp,
    mx = +t.dataset.max || 1,
    old = BHP0.v,
    v = String(t.value).trim().replace(/−|–/g, "-");
  let nv;
  const r = v.match(/^([+-])\s*(\d+)$/),
    a = v.match(/^(\d+)$/);
  if (r) nv = old + (r[1] === "-" ? -1 : 1) * +r[2];
  else if (a) nv = +a[1];
  else if (v === "") nv = mx;
  else {
    t.value = old;
    return;
  }
  t.value = nv;
  if (nv === old) return;
  const o = bojHp.get(),
    arr = o[id] || [];
  bojUndoPush({hp: BHP0.hp});
  const n = ((BOJ.s && BOJ.s.npc) || []).find(x => x.id === id);
  if (n && n.spol)
    bojZmen(z => {
      const q = (z.npc || []).find(x => x.id === id);
      if (q) q.hpc = nv;
    }); // společník hráče: životy sdílené s jeho kartou
  else {
    arr[k] = nv;
    o[id] = arr;
    bojHp.set(o);
  }
  if (n) bojLog(id, {n: "Životy", ai: null, ci: id, zt: `${old} → ${nv} (${nv - old > 0 ? "+" : "−"}${Math.abs(nv - old)})`}, n.n);
  bojHpZmena(id, k, old, nv);
  BHP0 = {hp: JSON.parse(JSON.stringify(o)), v: nv};
  if (!(n && n.spol)) bojZmen(() => {}, true);
  renderBoj();
}
document.addEventListener("change", e => {
  const t = e.target;
  if (t.matches && t.matches("#bojview [data-bhp]")) bojHpZapis(t);
});
/* klávesy v Boji (vypravěč): mezerník další tah, Shift+mezerník zpět o slot, číslice + Enter zranění vybraného nepřítele, Ctrl+Z zpět */
let BSEL = null,
  BKBUF = "",
  BKBT = 0;
function bojVybrany() {
  const s = BOJ.s || {},
    npc = s.npc || [];
  if (BSEL && npc.some(x => x.id === BSEL)) return npc.find(x => x.id === BSEL);
  const ob = s.obsazeni || {},
    k = ob[s.tah];
  return npc.find(x => x.id === k) || null;
}
function bojKlZraneni(v) {
  const n = bojVybrany();
  if (!n) {
    mmHlasG("Nejdřív klikni na kartu nepřítele.", 2500);
    return;
  }
  if (n.druh === "houf") {
    bojZmen(s => {
      const o = (s.npc || []).find(x => x.id === n.id);
      if (o) o.pocet = Math.max(0, (o.pocet || 0) - v);
    });
    mmHlasG(`${n.n}: padlo ${v}.`, 2200);
    return;
  }
  const E = bojEff(n);
  if (!E || !E.hp.length) {
    mmHlasG(`${n.n} nemá statblock se životy.`, 2500);
    return;
  }
  const o = bojHp.get(),
    a = o[n.id] || [],
    old = a[0] != null ? a[0] : E.hp[0].max;
  bojUndoPush({hp: JSON.parse(JSON.stringify(o))});
  a[0] = old - v;
  o[n.id] = a;
  bojHp.set(o);
  bojHpZmena(n.id, 0, old, old - v);
  renderBoj();
  mmHlasG(`${n.n}: −${v} HP (${old - v}/${E.hp[0].max}).`, 2200);
}
document.addEventListener("keydown", e => {
  if (curView !== "boj" || PULTTAB !== "boj" || !GMV || !bojDB || !bojBezi(BOJ.s)) return;
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
    e.preventDefault();
    bojZpet();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === " " && !e.shiftKey) {
    const nv = document.querySelector("#bojview [data-bnavrh]");
    if (nv) {
      e.preventDefault();
      nv.click();
      return;
    }
  }
  if (e.key === " ") {
    e.preventDefault();
    const b = document.querySelector(`#bojview [data-bact="${e.shiftKey ? "zpet" : "dalsi"}"]`);
    if (b && !b.disabled) b.click();
    return;
  }
  if (/^\d$/.test(e.key)) {
    BKBUF = (BKBUF + e.key).slice(0, 3);
    clearTimeout(BKBT);
    BKBT = setTimeout(() => {
      BKBUF = "";
    }, 4000);
    const n = bojVybrany();
    mmHlasG(`${n ? n.n : "Vyber nepřítele"}: ${n && n.druh === "houf" ? "padlo" : "zranění"} ${BKBUF} – Enter potvrdí, Esc zruší`, 4000);
    return;
  }
  if (e.key === "Enter" && BKBUF) {
    e.preventDefault();
    const v = +BKBUF;
    BKBUF = "";
    if (v > 0) bojKlZraneni(v);
    return;
  }
  if (e.key === "Escape" && BKBUF) {
    BKBUF = "";
    mmHlasG("Zrušeno.", 1200);
    return;
  }
  if (e.key === "Backspace" && BKBUF) {
    BKBUF = BKBUF.slice(0, -1);
    return;
  }
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && BPRAV && curView === "boj") {
    const b = document.querySelector("#bojview .bprx");
    if (b) b.click();
  }
});
document.addEventListener("keydown", e => {
  if (e.key !== "Enter" || !e.target.matches || !e.target.matches("[data-bhledej]")) return;
  e.preventDefault();
  const b = e.target.parentElement.querySelector("[data-bbadd]");
  if (b) b.click();
});
document.addEventListener(
  "toggle",
  e => {
    const d = e.target;
    if (!d.matches || !d.matches("details[data-otv]")) return;
    if (d.open) BOTV.add(d.dataset.otv);
    else BOTV.delete(d.dataset.otv);
  },
  true,
);
document.addEventListener("change", async e => {
  const v = document.getElementById("bojview");
  if (!v || !v.contains(e.target)) return;
  const s1 = e.target.closest("[data-bskup]");
  if (s1 && s1.value) {
    const R = bojSkupRadky(s1.value);
    s1.value = "";
    if (!R) return;
    const box = document.getElementById("bfn");
    if (!box) return;
    box.innerHTML = "";
    R.rows.forEach(x => {
      box.insertAdjacentHTML("beforeend", bojNrow());
      bojPlnRadek(box.lastElementChild, x);
    });
    if (!R.rows.length) box.insertAdjacentHTML("beforeend", bojNrow());
    if (R.z || R.n) {
      const l = v.querySelector(".bojlead");
      if (l) l.textContent = (R.n ? R.n + ". " : "") + (R.z || "");
    }
    bojObtForm();
    return;
  }
  const s2 = e.target.closest("[data-bskupadd]");
  if (s2 && s2.value) {
    const R = bojSkupRadky(s2.value);
    s2.value = "";
    if (R && (R.rows.length || (R.cile || []).length)) {
      bojZmen(s => bojSetkPouzij(s, R));
      const x = [
        R.rows.length ? `${R.rows.length} ${R.rows.length === 1 ? "nepřítel" : R.rows.length < 5 ? "nepřátelé" : "nepřátel"}` : "",
        (R.cile || []).length ? `cíle ${R.cile.length}` : "",
        R.prekv && BOJ.s && BOJ.s.priprava ? "přepadení" : "",
      ].filter(Boolean);
      mmHlasG(`Načteno: ${x.join(", ")}.`, 3500);
    }
    return;
  }
  if (e.target.matches("[data-bhdsv]")) {
    const pan = e.target.closest("[data-bhpan]"),
      d = +e.target.value;
    if (!pan || !(d >= 1 && d <= 20)) {
      mmHlas("Zadej hod d20 (1–20).", 2500);
      return;
    }
    const id = pan.dataset.bhpan,
      h0 = (BOJ.s.hraci || []).find(x => x.id === id);
    if (!bojDsAkt(h0)) return;
    const r = bojDs(h0.ds, "hod", d);
    /* přirozená 20: probere se s 1 HP (jako hod tlačítkem) */
    bojDsZapis(id, h0, r, true, `${h0.n}: hod proti smrti ${r.m}.`);
    return;
  }
  const sl = e.target.closest("[data-bslot]");
  if (sl) {
    const i = sl.dataset.bslot,
      val = sl.value;
    bojZmen(s => {
      s.obsazeni = s.obsazeni || {};
      if (val) s.obsazeni[i] = val;
      else delete s.obsazeni[i];
    });
    return;
  }
  const n = e.target.closest("[data-bnpc]"),
    upd = fn =>
      bojZmen(s => {
        const o = (s.npc || []).find(x => x.id === n.dataset.bnpc);
        if (o) fn(o);
      });
  if (n && e.target.matches("[data-bvel]")) {
    upd(o => {
      o.velitel = e.target.checked;
    });
    return;
  }
  if (n && e.target.matches("[data-bvelsok]")) {
    const val = e.target.value;
    upd(o => {
      if (val) o.vel = val;
      else delete o.vel;
    });
    return;
  }
  if (n && e.target.matches("[data-bpradd]")) {
    const val = e.target.value;
    if (val)
      upd(o => {
        o.pr = [...new Set([...(o.pr || []), val])];
      });
    return;
  }
  if (e.target.matches("[data-bkd]")) {
    BKS.druh = e.target.value;
    BKS.vys = "";
    return;
  }
  if (e.target.matches("[data-bkkomu]")) {
    BKS.komu = e.target.value;
    BKS.vys = "";
    if (BKS.komu) BKS.rany = (bojKritPC()[BKS.komu] || []).length;
    renderBoj();
    return;
  }
  if (e.target.matches("[data-juplos]")) {
    BJU.plos = e.target.checked;
    renderBoj();
    return;
  }
  if (e.target.matches("[data-jupol]")) {
    BJU.pol = e.target.checked;
    return;
  }
  if (e.target.matches("[data-kprib]") && !e.target.closest("[data-kid]")) {
    const K = bojKartaH((BOJ.s.hraci || []).find(h => h.n === bojJa.get()));
    if (K) {
      const P = kPri(K).filter(x => !/^Bardic /.test(x));
      kartaStavZmen(K.id, {pri: [...P, "Bardic " + e.target.value]}).then(() => renderBoj());
    }
    return;
  }
  if (e.target.matches("[data-juef][data-pri]")) {
    const K = bojKartaH((BOJ.s.hraci || []).find(h => h.n === bojJa.get()));
    if (K) kPriTog(K, e.target.dataset.pri).then(() => renderBoj());
    return;
  }
  if (e.target.matches("[data-juef]")) {
    const i = +e.target.dataset.juef;
    BJU.ef = e.target.checked ? [...new Set([...BJU.ef, i])] : BJU.ef.filter(x => x !== i);
    return;
  }
  if (e.target.matches("[data-jucile]")) {
    const id = e.target.dataset.jucile,
      mx = bojJaCilMax();
    if (e.target.checked && mx && BJU.cile.length >= mx && !BJU.cile.includes(id)) {
      e.target.checked = false;
      mmHlas(`Na tomto stupni nejvýš ${mx} ${mx === 1 ? "cíl" : mx < 5 ? "cíle" : "cílů"}.`, 3000);
      return;
    }
    BJU.cile = e.target.checked ? [...new Set([...BJU.cile, id])] : BJU.cile.filter(x => x !== id);
    return;
  }
  if (e.target.matches("select[data-jusl]")) {
    BJU.sl = e.target.value;
    BJU.serie = null;
    BJU.hod = BJU.d = BJU.dmg = "";
    BJU.info = "";
    renderBoj();
    return;
  }
  if (e.target.matches("select[data-ju]")) {
    const k = e.target.dataset.ju;
    if (k === "zi" && /^k\d+$/.test(e.target.value)) {
      bojJaZvolKouzlo(+e.target.value.slice(1));
      return;
    }
    if (k === "zi") BJU.ks = null;
    BJU[k] = e.target.value;
    if (k === "zi") {
      const me = (BOJ.s.hraci || []).find(h => h.n === bojJa.get()),
        w = bojZbrVse(BOJ.s, me)[+BJU.zi];
      if (w && BJU.zi !== "") {
        BJU.t = w.t || BJU.t;
        BJU.drt = !!w.drt;
        BJU.pru = !!w.pru;
        BJU.dal = !!w.dal;
        const K0 = w.karta && bojKartaH(me);
        if (K0 && kJeZbran(K0, w.n)) {
          KZBRV[K0.id] = w.n;
          BJU.zvAuto = w.n;
          kZbrvUloz();
        }
      } else {
        BJU.drt = BJU.pru = BJU.dal = false;
      }
    }
    BJU.info = "";
    renderBoj();
    return;
  }
  if (e.target.matches('.bzrf [name="cim"]')) {
    const f = e.target.form,
      kdo = f.elements.kdo ? f.elements.kdo.value : "",
      h = ((BOJ.s || {}).hraci || []).find(x => x.n === kdo),
      w = bojZbrVse(BOJ.s, h).find(x => x.n === e.target.value.trim());
    if (w) {
      if (w.t) f.elements.t.value = w.t;
      f.elements.drt.checked = !!w.drt;
      f.elements.pru.checked = !!w.pru;
    }
    return;
  }
  if (e.target.matches('.bzrf [name="kdo"]')) {
    BKDO = e.target.value;
    const c = e.target.form && e.target.form.elements.cim;
    if (c) c.value = BCIM[BKDO] || "";
    return;
  }
  if (e.target.matches("[data-bosud]")) {
    const o = bojZaj.get();
    o[e.target.dataset.bosud] = e.target.value || 1;
    bojZaj.set(o);
    BZAPT = null;
    renderBoj();
    return;
  }
  if (e.target.matches("[data-bkor]")) {
    const k = e.target.dataset.bkor;
    if (e.target.checked) BKORX.delete(k);
    else BKORX.add(k);
    BZAPT = null;
    renderBoj();
    return;
  }
  if (e.target.matches("[data-bzaj]")) {
    BZAPT = null;
    const o = bojZaj.get();
    if (e.target.checked) o[e.target.dataset.bzaj] = 1;
    else delete o[e.target.dataset.bzaj];
    bojZaj.set(o);
    renderBoj();
    return;
  }
  if (e.target.matches("#bojview [data-bjr]")) {
    const c = e.target.closest("[data-bnpc]");
    if (c) {
      if (e.target.checked) BJR[c.dataset.bnpc] = 1;
      else delete BJR[c.dataset.bnpc];
    }
    return;
  }
  if (e.target.matches("[data-bclh]")) {
    const id = e.target.dataset.bclh,
      v = e.target.checked ? 1 : 0;
    bojZmen(z => {
      const c = (z.cile || []).find(x => x.id === id);
      if (c) c.stav = v;
    });
    return;
  }
  if (e.target.matches("[data-bprekv]")) {
    const v = e.target.value;
    bojZmen(z => {
      if (v) z.prekv = v;
      else delete z.prekv;
    });
    return;
  }
  if (e.target.matches("[data-bhn]")) {
    const id = e.target.dataset.bhn,
      v = e.target.value.trim();
    bojZmen(z => {
      const h = (z.hraci || []).find(x => x.id === id);
      if (h) h.n = v;
    });
    return;
  }
  if (e.target.matches("[data-bhhod]") && GMV) {
    const id = e.target.dataset.bhhod,
      v = e.target.value === "" ? null : +e.target.value;
    bojZmen(z => {
      const h = (z.hraci || []).find(x => x.id === id);
      if (h) h.hod = v;
    });
    return;
  }
  if (e.target.matches("[data-bdm]")) {
    const v = e.target.value === "" ? null : +e.target.value;
    bojZmen(z => {
      z.dm = v;
    });
    return;
  }
  if (e.target.matches("[data-bjahod]")) {
    const id = e.target.dataset.bjahod,
      v = +e.target.value;
    if (e.target.value === "" || !bojDB || !bojDB.hod) return;
    try {
      await bojDB.hod(id, v);
      await bojNacti();
      renderBoj();
      mmHlas("Hod iniciativy zapsán.");
    } catch (err) {
      mmHlas("Nepodařilo se zapsat: " + (err.message || err), 5000);
    }
    return;
  }
  const cl = e.target.closest("[data-bclaimsel]");
  if (cl && cl.value) {
    const hn = ((BOJ.s.hraci || []).find(h => h.id === cl.value) || {}).n;
    if (hn && !bojJa.get()) bojJa.set(hn);
    try {
      await bojDB.obsad(+cl.dataset.bclaimsel, cl.value);
      await bojNacti();
      renderBoj();
      mmHlas("Slot je tvůj.");
    } catch (err) {
      mmHlas("Nepodařilo se: " + err.message, 6000);
      await bojNacti();
      renderBoj();
    }
  }
});
/* uložit rozestavené nepřátele jako hotové setkání (databáze) nebo skupinu (jen tento prohlížeč) */
/* co se k setkání uloží kromě nepřátel: cíle (bez stavu), prostředí, přepadení, úvod */
const bojSetkExtra = () => {
  const s = BOJ.s || {};
  return {
    cile: (s.cile || []).map(c => {
      const o = {n: c.n, ver: c.ver !== false};
      if (c.cil) o.cil = c.cil;
      if (c.kolo) o.kolo = c.kolo;
      return o;
    }),
    prekv: s.prekv || "",
    lead: String(s.lead || "").trim(),
  };
};
async function bojUlozSetkani() {
  const rows = document.getElementById("bfn")
    ? bojRadky(document.getElementById("bfn"))
    : ((BOJ.s && BOJ.s.npc) || [])
        .filter(o => !bojSpoj(o))
        .map(o => ({n: o.n, druh: o.druh, pocet: o.max || o.pocet || 1, b: o.b || "", pr: o.pr || [], os: o.os || ""}));
  if (!rows.length) {
    mmHlasG("Nejdřív vyplň nepřátele.");
    return;
  }
  const jm = (prompt("Název setkání (např. Lapkové z Křivoklátska):") || "").trim();
  if (!jm) return;
  if (window.MMDB && typeof edOtevri === "function" && rows.every(x => x.b)) {
    const id =
      bojNorm(jm)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "setkani";
    const lin = rows.map(x => {
      const p = PROTBY[x.b],
        base = x.os || x.b,
        nm = x.os ? (OSPROT[x.os] || {}).n : p.n;
      return `  - ${x.n && x.n !== nm ? x.n + " = " : ""}${p.u === "houf" ? x.pocet + " " : ""}${base}${(x.pr || [])
        .filter(i => !(x.os && (OSPROT[x.os].pr || []).includes(i)))
        .map(i => " + " + i)
        .join("")}`;
    });
    const ex = bojSetkExtra();
    const md = `---\nid: ${id}\nnazev: ${jm}\nstitky: \n${ex.prekv ? `prekvapeni: ${ex.prekv === "h" ? "družina" : "nepřátelé"}\n` : ""}nepratele:\n${lin.join("\n")}\n${ex.cile.length ? `cile:\n${ex.cile.map(c => "  - " + bojCilTxt(c)).join("\n")}\n` : ""}---\n${ex.lead || "Situace a taktika."}\n`,
      tpl = EDDRUH.setkani.tpl;
    EDDRUH.setkani.tpl = () => md;
    try {
      await edOtevri("setkani", id, true);
    } finally {
      EDDRUH.setkani.tpl = tpl;
    }
    return;
  }
  const ex = bojSetkExtra(),
    g = bojSkup();
  g[jm] = ex.cile.length || ex.prekv || ex.lead ? {np: rows, cile: ex.cile, prekv: ex.prekv, lead: ex.lead} : rows;
  bojSkupUloz(g);
  const sel = document.querySelector("[data-bskup]");
  const box = document.querySelector("#bojform .bskup");
  if (box)
    box.innerHTML = `${bojSkupSel("data-bskup", "Načíst setkání nebo skupinu…")}<button type="button" class="badd" data-bskupuloz>Uložit jako setkání</button><button type="button" class="badd" data-bskupdel>Smazat skupinu z prohlížeče…</button>`;
  mmHlasG(
    `Skupina „${jm}“ uložena v tomto prohlížeči${rows.some(x => !x.b) ? " (do databáze jde jen setkání, kde má každý nepřítel statblock)" : ""}.`,
    6000,
  );
}
/* otevře rámeček Kritická zranění v pravidlech boje a posune na něj; s fokus i kurzor do první volby */
function bojKritUkaz(v, fokus) {
  BPRAV = true;
  renderBoj();
  const k = v.querySelector(".bkrit");
  if (!k) return;
  k.scrollIntoView({block: "center", behavior: "smooth"});
  const i = fokus && k.querySelector("[data-bkr]");
  if (i) i.focus();
}
document.addEventListener("click", async e => {
  const v = document.getElementById("bojview");
  if (!v || !v.contains(e.target)) return;
  const T = sel => e.target.closest(sel);
  const dr = T("[data-bdelrow]");
  if (dr) {
    const li = dr.closest(".bsr"),
      ol = li.parentElement;
    if (ol.children.length > 1 || ol.id === "bfs") li.remove();
    else
      li.querySelectorAll("input").forEach(i => {
        if (i.name !== "np") i.value = "";
      });
    bojObtForm();
    return;
  }
  const a = T("[data-bact]");
  if (a) {
    const t = a.dataset.bact;
    if ((t === "dalsi" || t === "kolo") && !bojDalOk()) return;
    if (t === "dalsi")
      bojZmen(s => {
        const n = (s.sloty || bojSloty(s)).length;
        s.tah = (s.tah || 0) + 1;
        if (s.tah >= n) {
          s.tah = n;
          mmHlasG("Konec kola – klikni na Nové kolo.");
        }
      });
    if (t === "zpet")
      bojZmen(s => {
        s.tah = Math.max(0, (s.tah || 0) - 1);
      });
    if (t === "kolo")
      bojZmen(s => {
        s.kolo = (s.kolo || 1) + 1;
        s.obsazeni = {};
        s.tah = 0;
        s.pocty = bojPocty(s);
        (s.cile || []).forEach(c => {
          const hot = c.cil ? c.stav >= c.cil : !!c.stav;
          if (c.kolo && !hot) {
            if (s.kolo === c.kolo) mmHlasG(`Poslední kolo pro cíl: ${c.n}.`, 5000);
            else if (s.kolo === c.kolo + 1) mmHlasG(`Cíl nesplněn včas: ${c.n}.`, 5000);
          }
        });
      });
    if (t === "konec") {
      if (PROTIVNICI.length) {
        BKON = true;
        renderBoj();
        const k = v.querySelector(".bkonsh");
        if (k) k.scrollIntoView({block: "start", behavior: "smooth"});
      } else if (confirm("Ukončit boj? Hra se vrátí do scény: sloty se smažou, postavy, NPC, kteří zůstali, a záznam zůstanou."))
        bojZmen(s => {
          bojPcKonecBoje(s);
          bojNaScenu(s);
        });
    }
    return;
  }
  if (T("[data-bundo]")) {
    bojZpet();
    return;
  }
  const nv = T("[data-bnavrh]");
  if (nv) {
    const nid = nv.dataset.bnavrh;
    bojZmen(s => {
      s.obsazeni = s.obsazeni || {};
      s.obsazeni[s.tah || 0] = nid;
    });
    return;
  }
  if (T("[data-bplosnew]")) {
    const s = BOJ.s;
    BPLOS =
      BPLOS && !BPLOS.src
        ? null
        : {src: "", z: "", t: "Fire", ab: "DEX", dc: "", pol: true, cile: (s.npc || []).filter(x => !bojSpoj(x)).map(x => x.id), vys: ""};
    renderBoj();
    return;
  }
  if (T("[data-bploszav]")) {
    BPLOS = null;
    renderBoj();
    return;
  }
  {
    const lg = T("[data-bplleg]");
    if (lg && BPLOS) {
      bojPlosLeg(lg.dataset.bplleg);
      return;
    }
  }
  if (T("[data-bploshod]") && BPLOS) {
    const f = v.querySelector(".bplos");
    if (f) {
      BPLOS.z = f.querySelector('[name="pz"]').value.trim();
      BPLOS.t = f.querySelector('[name="pt"]').value;
      BPLOS.ab = f.querySelector('[name="pa"]').value;
      BPLOS.dc = +f.querySelector('[name="pdc"]').value || "";
      BPLOS.pol = f.querySelector('[name="ppol"]').checked;
      BPLOS.st = [f.querySelector('[name="pst"]').value].filter(Boolean);
      BPLOS.op = f.querySelector('[name="pop"]').checked;
      BPLOS.cile = [...f.querySelectorAll("[data-bplc]:checked")].map(x => x.dataset.bplc);
      BPLOS.dos = {};
      f.querySelectorAll("[data-bpld]").forEach(x => (BPLOS.dos[x.dataset.bpld] = +x.value || 0));
    }
    bojPlosHod();
    return;
  }
  if (T("[data-bdmhod]")) {
    bojZmen(z => bojDmHod(z));
    return;
  }
  const clp = T("[data-bclp]") || T("[data-bclm]");
  if (clp) {
    const id = clp.dataset.bclp || clp.dataset.bclm,
      d = clp.dataset.bclp ? 1 : -1;
    bojZmen(z => {
      const c = (z.cile || []).find(x => x.id === id);
      if (c) {
        c.stav = Math.max(0, Math.min(c.cil || 99, (c.stav || 0) + d));
        if (c.cil && c.stav >= c.cil) mmHlasG(`Cíl splněn: ${c.n}.`, 3500);
      }
    });
    return;
  }
  const cld = T("[data-bcldel]");
  if (cld) {
    bojZmen(z => {
      z.cile = (z.cile || []).filter(x => x.id !== cld.dataset.bcldel);
      if (!z.cile.length) delete z.cile;
    });
    return;
  }
  /* scéna (2026-10-23): Boj = příprava boje, kterou hráči vidí hned (hodí iniciativu); Nová scéna vyprázdní záznam a NPC */
  if (T("[data-bscboj]")) {
    bojZmen(z => {
      const zach = {npc: z.npc || [], nid: z.nid || 0, zaz: z.zaz, zac: z.zac},
        hr = (z.hraci || []).map(h => Object.assign({}, h, {hod: null}));
      bojNovaPriprava(z);
      delete z.ticha;
      Object.assign(z, {npc: zach.npc, nid: zach.nid, zacSc: zach.zac});
      if (zach.zaz) z.zaz = zach.zaz;
      if (hr.length) z.hraci = hr;
    });
    mmHlasG("Příprava boje: hráči teď mohou hodit iniciativu.", 3500);
    return;
  }
  if (T("[data-bscutok]")) {
    bojZmen(z => {
      z.utOk = Date.now();
    });
    return;
  }
  if (T("[data-bscnova]")) {
    if (!confirm("Začít novou scénu? Záznam scény a NPC v ní se smažou, družina zůstane.")) return;
    bojZmen(z => bojNovaScena(z));
    return;
  }
  if (T("[data-bukaz]")) {
    bojZmen(z => {
      delete z.ticha;
    });
    mmHlasG("Hráči teď vidí přípravu boje na stránce Hra.", 3500);
    return;
  }
  if (T("[data-bstart]")) {
    const s = BOJ.s || {},
      bh = bojBestHod(s),
      hr = (s.hraci || []).filter(h => String(h.n || "").trim());
    if (!hr.length) {
      mmHlasG("Zadej aspoň jednu postavu.", 3000);
      return;
    }
    if (bh == null) {
      mmHlasG("Chybí hod iniciativy družiny – zapiš aspoň jeden.", 3500);
      return;
    }
    if (s.dm == null || s.dm === "") {
      mmHlasG("Chybí hod nepřátel – zapiš ho, nebo klikni na Hodit za nepřátele.", 3500);
      return;
    }
    /* boj ze scény navazuje: záznam vypravěče a životy NPC ze scény zůstávají */
    if (!s.zacSc) bojKonecLS();
    BKON = false;
    bojZmen(z => {
      z.hraci = (z.hraci || []).filter(h => String(h.n || "").trim());
      z.hod = bojBestHod(z);
      z.aktivni = true;
      delete z.priprava;
      delete z.ticha;
      delete z.lead;
      Object.assign(z, {kolo: 1, tah: 0, obsazeni: {}, zac: z.zacSc || Date.now()});
      delete z.zacSc;
      z.pocty = bojPocty(z);
    });
    return;
  }
  if (T("[data-bhadd]")) {
    bojZmen(z => {
      const ids = (z.hraci || []).map(h => +String(h.id).slice(1) || 0);
      (z.hraci = z.hraci || []).push({id: "h" + (Math.max(0, ...ids) + 1), n: "", hod: null});
    });
    return;
  }
  const hd = T("[data-bhdel]");
  if (hd) {
    bojZmen(z => {
      z.hraci = (z.hraci || []).filter(h => h.id !== hd.dataset.bhdel);
    });
    return;
  }
  if (T("[data-bhdruz]")) {
    bojZmen(z => {
      z.hraci = PARTY.map((p, i) => ({id: "h" + (i + 1), n: p.n.replace(/^✦\s*/, ""), hod: null}));
    });
    return;
  }
  const rkb = T("[data-break]");
  if (rkb && !rkb.disabled) {
    const id = rkb.dataset.break;
    e.stopPropagation();
    bojZmen(z => {
      z.reak = z.reak || {};
      if (z.reak[id]) delete z.reak[id];
      else z.reak[id] = 1;
      if (!Object.keys(z.reak).length) delete z.reak;
    });
    return;
  }
  if (T("[data-bzapn]")) {
    BZAPT = null;
    renderBoj();
    return;
  }
  if (T("[data-bodp]") && !BODP) {
    BODP = true;
    BZAPT = null;
    if (typeof hraPosun === "function") hraPosun(1);
    bojOdpVyzva();
    mmHlasG("Krátký odpočinek: herní čas +1 h, hráčům vyskočila výzva k odpočinku (kostky životů, zdroje).", 5000);
    renderBoj();
    return;
  }
  const kon = T("[data-bkon]");
  if (kon) {
    const k = kon.dataset.bkon;
    if (k === "zpet") {
      BKON = false;
      renderBoj();
      return;
    }
    const S0 = BOJ.s || {},
      zap = BZAPT ?? bojZapisNavrh(S0),
      txt =
        bojShrn(S0).txt +
        `; trval ${S0.kolo || 1} ${(S0.kolo || 1) === 1 ? "kolo" : "kol"}` +
        ((S0.cile || []).length
          ? "; cíle: " + S0.cile.map(c => `${c.n} ${(c.cil ? c.stav >= c.cil : c.stav) ? "splněn" : "nesplněn"}`).join(", ")
          : "") +
        (BODP ? "; poté krátký odpočinek (1 h)" : "");
    BODP = false;
    BKON = false;
    await bojZmen(s => {
      bojPcKonecBoje(s);
      bojNaScenu(s);
    });
    bojKonecLS();
    if (k === "kron") {
      window.BOJ_SHRN = txt;
      window.BOJ_TEXT = zap;
      if (typeof zapisNovy === "function") zapisNovy();
    }
    return;
  }
  if (T("[data-bskupuloz]")) {
    bojUlozSetkani();
    return;
  }
  if (T("[data-bskupdel]")) {
    const g = bojSkup(),
      k = Object.keys(g);
    if (!k.length) return;
    const jm = (prompt("Kterou skupinu smazat?\n" + k.join("\n")) || "").trim();
    if (!g[jm]) return;
    delete g[jm];
    bojSkupUloz(g);
    mmHlasG("Skupina smazána.");
    const sel = document.querySelector("[data-bskup]");
    if (sel) sel.outerHTML = bojSkupSel("data-bskup", "Načíst setkání nebo skupinu…");
    return;
  }
  const ed = T("[data-bedit]");
  if (ed) {
    e.preventDefault();
    if (typeof edOtevri === "function") edOtevri(ed.dataset.bedruh || "protivnik", ed.dataset.bedit);
    return;
  }
  const stt = T("[data-bstitek]");
  if (stt) {
    e.preventDefault();
    const i = v.querySelector("[data-bhledej]");
    if (i) {
      i.value = BHLED = stt.dataset.bstitek;
      const u = i.parentElement.querySelector("[data-bvysl]");
      if (u) u.innerHTML = bojVysl(BHLED);
      i.focus();
    }
    return;
  }
  const ba = T("[data-bbadd]");
  if (ba) {
    e.preventDefault();
    e.stopPropagation();
    const [k, id] = ba.dataset.bbadd.split(/:(.*)/s);
    const rows =
      k === "s"
        ? SETBY[id]
          ? bojRozvin(SETBY[id].np)
          : []
        : k === "o"
          ? bojRozvin([{os: id, pr: []}])
          : PROTBY[id]
            ? bojRozvin([{id, pr: []}])
            : [];
    if (!rows.length) return;
    BHLED = "";
    const hl = v.querySelector("[data-bhledej]");
    if (hl) {
      hl.value = "";
      const u = hl.parentElement.querySelector("[data-bvysl]");
      if (u) u.innerHTML = "";
      hl.focus();
    }
    const fn = document.getElementById("bfn");
    if (fn) {
      rows.forEach(x => {
        let r = [...fn.querySelectorAll(".bsr")].find(q => !q.querySelector('[name="nn"]').value.trim());
        if (!r) {
          fn.insertAdjacentHTML("beforeend", bojNrow());
          r = fn.lastElementChild;
        }
        bojPlnRadek(r, x);
      });
      if (k === "s" && SETBY[id]) {
        const l = v.querySelector(".bojlead");
        if (l) l.textContent = SETBY[id].n + ". " + SETBY[id].x;
      }
      bojObtForm();
      mmHlasG(`${rows.length > 1 ? rows.length + " nepřátel" : rows[0].n} – přidáno mezi nepřátele.`);
      return;
    }
    if (BOJ.s && (BOJ.s.aktivni || BOJ.s.priprava)) bojZmen(s => bojPridejNpc(s, rows));
    return;
  }
  const kh = T("[data-bkhod]");
  if (kh) {
    const p = kh.closest(".bkrit");
    if (p) {
      BKS.druh = p.querySelector("[data-bkd]").value;
      BKS.rany = +p.querySelector("[data-bkr]").value || 0;
      BKS.pod = +p.querySelector("[data-bkp]").value || 0;
    }
    bojKritHod();
    renderBoj();
    if (BKS.komu && BKS.last) {
      if (BOJ.s && BOJ.s.aktivni) {
        BKRLOG.push({komu: BKS.komu, t: BKS.last.t});
        const hq = (BOJ.s.hraci || []).find(h => h.n === BKS.komu);
        bojLog(hq ? hq.id : "x", {n: "Kritické zranění", ai: null, ci: hq ? hq.id : null, cn: BKS.komu, zt: BKS.last.t}, BKS.komu);
      }
      const K = Object.assign({}, bojKritPC());
      K[BKS.komu] = [...(K[BKS.komu] || []), BKS.last];
      hraUloz({krit: K}).then(() => {
        BKS.rany = K[BKS.komu].length;
        renderBoj();
      });
    }
    return;
  }
  const kh2 = T("[data-bkheal]");
  if (kh2 && BKS.komu) {
    const j = +kh2.dataset.bkheal,
      K = Object.assign({}, bojKritPC());
    K[BKS.komu] = (K[BKS.komu] || []).filter((_, i) => i !== j);
    if (!K[BKS.komu].length) delete K[BKS.komu];
    hraUloz({krit: K}).then(() => {
      BKS.rany = (K[BKS.komu] || []).length;
      renderBoj();
    });
    return;
  }
  const kz = T("[data-bkritz]");
  if (kz) {
    BKS.druh = kz.dataset.bkritz;
    BKS.vys = "";
    const card = kz.closest("[data-bnpc]");
    {
      const L = card && (BLOG[card.dataset.bnpc] || [])[0];
      if (L && L.cilPC) {
        BKS.komu = L.cilPC;
        BKS.rany = (bojKritPC()[L.cilPC] || []).length;
      }
    }
    BKS.kdo = card ? "zásah od: " + (card.querySelector(".bnn b") || {}).textContent : "";
    bojKritUkaz(v, true);
    return;
  }
  if (T("[data-bprav]")) {
    BPRAV = !BPRAV;
    v.querySelectorAll(".bpravidla").forEach(a => a.classList.toggle("open", BPRAV));
    v.querySelectorAll(".bprtg").forEach(b => b.setAttribute("aria-expanded", BPRAV));
    if (BPRAV) {
      const x = v.querySelector(".bprx");
      if (x) x.focus({preventScroll: true});
    }
    return;
  }
  const bpo = T("[data-bupot]");
  if (bpo) {
    bojUtokPotvrd(bpo.dataset.bupot);
    return;
  }
  const bza = T("[data-buzam]");
  if (bza) {
    bojUtokPotvrd(bza.dataset.buzam, true);
    return;
  }
  const blf = T("[data-blf]");
  if (blf) {
    BLF = BLF === blf.dataset.blf ? "" : blf.dataset.blf;
    renderBoj();
    return;
  }
  if (T("[data-blfx]")) {
    BLF = "";
    renderBoj();
    return;
  }
  const blz = T("[data-blzpet]");
  if (blz) {
    bojLogZpetSem(+blz.dataset.blzpet);
    return;
  }
  const bzv = T("[data-bzvrat]");
  if (bzv) {
    bojVratCas(+bzv.dataset.bzvrat, bzv.dataset.p);
    return;
  }
  const blu = T("[data-blund]");
  if (blu) {
    bojLogZpet(+blu.dataset.blund);
    return;
  }
  const jad = T("[data-juadv]");
  if (jad) {
    BJU.adv = jad.dataset.juadv;
    renderBoj();
    return;
  }
  const jkp = T("[data-kdice]");
  if (jkp && !jkp.closest("[data-kid]")) {
    const K = bojKartaH(((BOJ.s || {}).hraci || []).find(h => h.n === bojJa.get()));
    if (K) kPriTog(K, jkp.dataset.kdice).then(() => renderBoj());
    return;
  }
  if (T("[data-juhod]")) {
    bojJaHod();
    return;
  }
  if (T("[data-juposl]")) {
    bojJaPosli();
    return;
  }
  const zbd = T("[data-bzbdel]");
  if (zbd) {
    const pan = zbd.closest("[data-bhpan]");
    if (pan) {
      const j = +zbd.dataset.bzbdel;
      bojHracAkce(pan.dataset.bhpan, (h, z) => {
        const a = ((z.zbrane || {})[h.n] || []).filter((_, i) => i !== j);
        z.zbrane = z.zbrane || {};
        if (a.length) z.zbrane[h.n] = a;
        else delete z.zbrane[h.n];
      });
    }
    return;
  }
  if (T("[data-jukonh]")) {
    const s = BOJ.s || {},
      me = (s.hraci || []).find(h => h.n === bojJa.get()),
      K = bojKartaH(me),
      dc = BJK.d ? bojKonDC(BJK.d) : null;
    if (K && dc) {
      BJK.d = "";
      kKonHod(K, dc).then(() => renderBoj());
    }
    return;
  }
  const jkx = T("[data-jukonx]");
  if (jkx) {
    const pan = jkx.closest("[data-bhpan]"),
      ne = jkx.dataset.jukonx === "ne";
    BJK.d = "";
    if (ne && pan)
      bojHracAkce(
        pan.dataset.bhpan,
        h => {
          h.stav = (h.stav || []).filter(x => x !== "soustředí");
          if (!h.stav.length) delete h.stav;
        },
        "Soustředění ztraceno.",
      );
    else renderBoj();
    return;
  }
  const kzr = T("[data-bkzr]");
  if (kzr) {
    const pan = kzr.closest("[data-bhpan]"),
      id = pan && pan.dataset.bhpan,
      S = BOJ.s || {},
      h0 = (S.hraci || []).find(x => x.id === id),
      K = bojKartaH(h0);
    if (!K) return;
    const v = Math.round(+((pan.querySelector("[data-bkzrv]") || {}).value || 0)),
      typ = (pan.querySelector("[data-bkzrt]") || {}).value || "Slashing",
      k = kzr.dataset.bkzr;
    if (!(v > 0)) {
      (GMV ? mmHlasG : mmHlas)("Zadej počet HP.", 2000);
      return;
    }
    if (k === "z") {
      bojPCZmena(id, o => bojZranPC(o, K, v, typ, false));
      return;
    }
    const ks = kartaStav(K.id),
      o = {hp: ks.hp, thp: ks.thp, ds: h0.ds ? JSON.parse(JSON.stringify(h0.ds)) : undefined};
    if (k === "l") {
      const m = bojLecPC(o, K, v);
      kartaStavZmen(K.id, {hp: o.hp != null && o.hp < kHPmax(K) ? o.hp : null}, `${h0.n}: ${m}.`);
      if (JSON.stringify(o.ds ?? null) !== JSON.stringify(h0.ds ?? null))
        bojHracAkce(id, h => {
          if (o.ds) h.ds = o.ds;
          else delete h.ds;
        });
      if (GMV) bojLog(id, {n: "Léčení", ai: null, ci: id, zt: m}, h0.n);
    } else {
      const t = Math.max(+ks.thp || 0, v);
      kartaStavZmen(K.id, {thp: t}, `${h0.n}: dočasné HP ${t}.`);
    }
    return;
  }
  const kzh = T("[data-bkzh]");
  if (kzh) {
    const pan = kzh.closest("[data-bhpan]"),
      id = pan && pan.dataset.bhpan,
      S = BOJ.s || {},
      h0 = (S.hraci || []).find(x => x.id === id),
      K = bojKartaH(h0);
    if (!K) return;
    /* hráč (2026-10-23): záchrana z karty se zapíše do hodů jako každý jiný hod (vypravěč ji vidí v záznamu, i ve scéně);
       soustředění se vyhodnotí z výsledku */
    if (!GMV) {
      const ab = kzh.dataset.bkzh,
        adv = !!kzh.dataset.adv;
      kartaHod(K, `Záchrana ${ab}`, kZach(K, ab), adv ? {adv: 1, why: "soustředění s výhodou"} : {}).then(r => {
        if (!adv || !BJK.d || !r) return;
        const dc = bojKonDC(BJK.d),
          ok = r.tot >= dc;
        BJK.d = "";
        mmHlas(`${h0.n}: záchrana ${ab} ${r.tot} → SO ${dc}: ${ok ? "soustředění udrženo" : "soustředění ztraceno"}`, 7000);
        if (!ok)
          bojHracAkce(id, h => {
            h.stav = (h.stav || []).filter(x => x !== "soustředí");
            if (!h.stav.length) delete h.stav;
          });
        else renderBoj();
      });
      return;
    }
    const ab = kzh.dataset.bkzh,
      adv = !!kzh.dataset.adv,
      b = kZach(K, ab) - 2 * kVycerp(K),
      d1 = bK(20),
      d2 = adv ? bK(20) : null,
      d = adv ? Math.max(d1, d2) : d1,
      t = d + b;
    const txt = `${h0.n}: záchrana ${ab} ${t} (d20 ${d1}${d2 != null ? ` / ${d2}, výhoda` : ""} ${bsg(b)})`;
    bojLog(id, {n: `Záchrana ${ab}`, ai: id, zt: txt.replace(/^[^:]*:\s*/, "")}, h0.n);
    renderBoj();
    mmHlasG(txt, 7000);
    return;
  }
  const kzd = T("[data-bkzd]");
  if (kzd) {
    const pan = kzd.closest("[data-bhpan]"),
      id = pan && pan.dataset.bhpan,
      S = BOJ.s || {},
      K = bojKartaH((S.hraci || []).find(x => x.id === id));
    if (!K) return;
    kartaStavZmen(K.id, {zdr: kPipyMapa(kartaStav(K.id).zdr, kzd.dataset.bkzd, +kzd.dataset.j)});
    return;
  }
  const pcz = T("[data-bpcz]");
  if (pcz) {
    const id = pcz.dataset.bpcz,
      S = BOJ.s || {},
      h0 = (S.hraci || []).find(x => x.id === id),
      K = bojKartaH(h0);
    if (!h0 || !K) return;
    const v = +pcz.dataset.z,
      typ = pcz.dataset.t || "Slashing",
      kr = !!pcz.dataset.k;
    pcz.disabled = true;
    if (pcz.dataset.bpczt) BPCZ.add(+pcz.dataset.bpczt);
    const msg = bojPCZmena(id, o => bojZranPC(o, K, v, typ, kr, {drt: !!pcz.dataset.drt, pru: !!pcz.dataset.pru}));
    bojZaz({a: "", c: h0.n, ci: id, cim: "", v: String(msg || "").replace(/\s*\(\d+\/\d+\)/, "")});
    return;
  }
  const hk = T("[data-bhkarta]");
  if (hk) {
    const K = KARTBY[hk.dataset.bhkarta];
    if (!K) return;
    bojZmen(z => {
      const a = (z.hraci = z.hraci || []);
      const ex = a.find(h => h.n === K.n || !h.n);
      if (ex) {
        ex.n = K.n;
        ex.k = K.id;
      } else {
        const ids = a.map(h => +String(h.id).slice(1) || 0);
        a.push({id: "h" + (Math.max(0, ...ids) + 1), n: K.n, k: K.id, hod: null});
      }
    });
    return;
  }
  const hin = T("[data-bhini]");
  if (hin) {
    const id = hin.dataset.bhini,
      S = BOJ.s || {},
      h0 = (S.hraci || []).find(x => x.id === id),
      K = bojKartaH(h0);
    if (!K) return;
    const d = bK(20),
      v = d + kIni(K);
    if (GMV)
      bojZmen(z => {
        const h = (z.hraci || []).find(x => x.id === id);
        if (h) h.hod = v;
      });
    else if (bojDB && bojDB.hod) {
      try {
        await bojDB.hod(id, v);
        await bojNacti();
        renderBoj();
      } catch (err) {
        mmHlas("Nepodařilo se zapsat: " + (err.message || err), 4000);
        return;
      }
    }
    (GMV ? mmHlasG : mmHlas)(`${h0.n}: iniciativa d20 ${d} ${bsg(kIni(K))} = ${v}`, 4000);
    return;
  }
  if (bojHracKlik(T)) return;
  if (T("[data-bted]")) {
    const id2 = T("[data-bted]").dataset.bted;
    bojVyber(id2);
    BTAB = "k";
    renderBoj();
    setTimeout(() => {
      const c = document.querySelector(`[data-bhcard="${CSS.escape(id2)}"],[data-bnpc="${CSS.escape(id2)}"]`);
      if (c) c.scrollIntoView({block: "start", behavior: "smooth"});
    }, 60);
    return;
  }
  const hrz = T("[data-bhrozb]");
  if (hrz) {
    const id = hrz.dataset.bhrozb,
      c = hrz.closest("[data-bhcard]");
    if (c) {
      bojVyber(c.classList.contains("bopen") ? null : id);
      if (!c.classList.contains("bopen")) BTAB = "k";
    } else if (BHROTV.has(id)) BHROTV.delete(id);
    else BHROTV.add(id);
    renderBoj();
    return;
  }
  const dsf = T("[data-bdsf]");
  if (dsf) {
    const id = dsf.dataset.bdsf,
      k = +dsf.dataset.k || 1,
      h0 = ((BOJ.s || {}).hraci || []).find(x => x.id === id);
    if (!h0 || !bojDsAkt(h0)) {
      mmHlasG("Postava už není na prahu smrti.", 2500);
      return;
    }
    const r = bojDs(h0.ds, "n", k);
    dsf.disabled = true;
    bojHracAkce(
      id,
      h => {
        h.ds = r.ds;
      },
      `${h0.n}: zásah v bezvědomí – ${k === 1 ? "neúspěch" : "dva neúspěchy"} hodu proti smrti${r.m ? " → " + r.m : ""}.`,
    );
    return;
  }
  const n = T("[data-bnpc]");
  if (!n) {
    const c = T("[data-bclaim]");
    if (c) {
      const s = BOJ.s,
        jed = new Set(Object.values(s.obsazeni || {})),
        free = (s.hraci || []).filter(h => !jed.has(h.id));
      if (!free.length) {
        mmHlas("Všechny postavy už v tomto kole jednaly.");
        return;
      }
      c.outerHTML = `<select data-bclaimsel="${c.dataset.bclaim}" aria-label="Kdo bere slot"><option value="">Kdo bere slot?</option>${free.map(h => `<option value="${h.id}">${besc(h.n)}</option>`).join("")}</select>`;
      const sel = v.querySelector(`[data-bclaimsel="${c.dataset.bclaim}"]`);
      if (sel) sel.focus();
    }
    return;
  }
  const id = n.dataset.bnpc,
    upd = fn =>
      bojZmen(s => {
        const o = (s.npc || []).find(x => x.id === id);
        if (o) fn(o, s);
      }),
    o0 = (BOJ.s.npc || []).find(x => x.id === id);
  BSEL = id;
  if (T("[data-brozb]")) {
    bojVyber(n.classList.contains("bopen") ? null : id);
    if (!n.classList.contains("bopen")) BTAB = "k";
    renderBoj();
    return;
  }
  if (T("[data-bstav]")) {
    const t = T("[data-bstav]").dataset.bstav;
    upd(o => {
      o.stav = o.stav || [];
      if (t === "prchá" && o.stav.includes(t) && o.druh === "houf") o.morOk = o.pocet || 1;
      o.stav = o.stav.includes(t) ? o.stav.filter(x => x !== t) : [...o.stav, t];
    });
    return;
  }
  if (T("[data-btmsgx]")) {
    delete BTMSG[id];
    renderBoj();
    return;
  }
  const efd = T("[data-befdel]");
  if (efd) {
    const j = +efd.dataset.befdel;
    upd(o => {
      const e = (o.ef || [])[j];
      if (e) bojEfDel(o, e);
    });
    return;
  }
  const rch = T("[data-brch]");
  if (rch) {
    const R = (BRCH[id] = BRCH[id] || {}),
      k = rch.dataset.brch;
    if (R[k]) delete R[k];
    else R[k] = 1;
    renderBoj();
    return;
  }
  const bnp = T("[data-bnp]");
  if (bnp && o0) {
    const k = bnp.dataset.bnp;
    BNP[id] = BNP[id] === k ? "" : k;
    renderBoj();
    return;
  }
  const bcb = T("[data-bcilb]");
  if (bcb && o0) {
    const c = bcb.dataset.bcilb;
    if (BCIL[id] === c) delete BCIL[id];
    else BCIL[id] = c;
    renderBoj();
    return;
  }
  const bov = T("[data-bover]");
  if (bov && o0) {
    const ab = bov.dataset.bover,
      E = bojEff(o0),
      p = E && E.p,
      b = bojAbil(p, ab) || 0;
    const ef = (o0.stav || []).some(k => SRDST[k] && /nevýhod/i.test(SRDST[k].t || "") && /ověřen/i.test(SRDST[k].t || "")),
      d1 = bK(20),
      d2 = ef ? bK(20) : null,
      d = ef ? Math.min(d1, d2) : d1,
      t = d + b;
    const o = {
      n: `Ověření ${ab}`,
      hod: {tot: t, d, b, pres: 0, krit: false, mis: false, adv: ef ? -1 : 0, dd: d2 != null ? [d1, d2] : null, advWhy: ef ? "stav" : ""},
      sav: "ověření",
    };
    if (o0.druh !== "houf") {
      const z = bojZavoj(Object.assign({}, p, {str: bojSpoj(o0) ? "h" : "n"}));
      o.zav = bojZavObj(p, z);
    }
    bojLog(id, o, o0.n);
    renderBoj();
    return;
  }
  const zch = T("[data-bzach]");
  if (zch && o0) {
    const ab = zch.dataset.bzach,
      E = bojEff(o0),
      p = E && E.p,
      b = bojSaveB(p, ab),
      inp = n.querySelector("[data-bzdc]"),
      dc = (inp && +inp.value) || 0;
    if (dc) BZDC[id] = dc;
    const ef = (o0.stav || []).map(k => (SRDST[k] && SRDST[k].zach && SRDST[k].zach[ab] ? [k, SRDST[k].zach[ab]] : null)).filter(Boolean),
      fail = ef.find(x => x[1] === "f"),
      va = ef.some(x => x[1] === "a") - ef.some(x => x[1] === "d");
    const d1 = bK(20),
      d2 = va ? bK(20) : null,
      d = va > 0 ? Math.max(d1, d2) : va < 0 ? Math.min(d1, d2) : d1,
      t = d + b;
    const ok = fail ? false : dc ? t >= dc : null,
      o = {
        n: `Záchrana ${ab}${dc ? ` DC ${dc}` : ""}`,
        hod: {tot: t, d, b, pres: 0, krit: false, mis: false, adv: va, dd: d2 != null ? [d1, d2] : null, advWhy: ef.map(x => x[0]).join(", ")},
        sav: fail ? `automaticky neúspěch (${fail[0]})` : ok == null ? "záchrana" : ok ? "úspěch" : "neúspěch",
      };
    if (ok === false && bojLegZb(o0, E)) o.leg = bojLegZb(o0, E);
    bojLog(id, o, o0.n);
    renderBoj();
    return;
  }
  if (T("[data-blegod]") && o0) {
    const E = bojEff(o0),
      zn = bojLegN(E),
      z = bojZdr.get(),
      u = (z[id] = z[id] || {});
    u[zn] = (u[zn] || 0) + 1;
    bojZdr.set(z);
    const L = (BLOG[id] || [])[0];
    if (L) {
      L.sav = "úspěch (Leg. odolnost)";
      delete L.leg;
    }
    mmHlasG(`${o0.n}: Legendární odolnost – záchrana se mění v úspěch (zbývá ${bojLegZb(o0, E)}).`, 4000);
    renderBoj();
    return;
  }
  const pls = T("[data-bplos]");
  if (pls && o0) {
    const E = bojEff(o0),
      a = E && E.at[+pls.dataset.bplos];
    if (!a) return;
    const av = bojUtokV(o0, +pls.dataset.bplos, a),
      m = String(av.dc || "").match(/(STR|DEX|CON|INT|WIS|CHA)\D*(\d+)/),
      ty = bojTypy(av);
    const s = BOJ.s,
      sp = bojSpoj(o0);
    const AS = bojAkceStav(a.n, [a.p, av.p, av.zt].filter(Boolean).join(" "));
    BPLOS = {
      src: `${o0.n}: ${a.n}`,
      srcId: id,
      z: av.z || "",
      t: ty[0] || "Fire",
      ab: m ? m[1] : "DEX",
      dc: m ? +m[2] : "",
      pol: !!av.z && (/polovin/i.test((av.p || "") + (av.zt || "")) || !!av.dc),
      st: AS ? AS.st : [],
      op: !!(AS && AS.op),
      k: AS ? AS.k : 10,
      cile: [...(sp ? [] : (s.hraci || []).map(h => h.id)), ...(s.npc || []).filter(x => x.id !== id && bojSpoj(x) !== sp).map(x => x.id)],
      vys: "",
    };
    renderBoj();
    const el = document.querySelector("#bojview .bplos");
    if (el) el.scrollIntoView({block: "center", behavior: "smooth"});
    return;
  }
  const zbu = T("[data-bzbu]");
  if (zbu) {
    const k = zbu.dataset.bzbu,
      j = +zbu.dataset.bzbj;
    upd(o => {
      o.zbrU = kPipyMapa(o.zbrU, k, j) || {};
    });
    return;
  }
  const ob = T("[data-bobet]");
  if (ob) {
    const k = ob.dataset.bobet;
    upd(o => {
      o.zbrU = o.zbrU || {};
      o.zbrU[k] = (o.zbrU[k] || 0) + 1;
    });
    mmHlasG(
      `${o0 ? o0.n : ""}: ${k.toLowerCase()} ${k === "Štít" ? "" : "zbroj "}obětována – kritický zásah se mění v běžný, hoď běžné zranění.`,
      5000,
    );
    return;
  }
  if (T("[data-bobetne]")) {
    const f = T("[data-bobetne]").closest("form"),
      b = f && f.querySelector(".bzrobet");
    if (b) {
      b.hidden = true;
      b.innerHTML = "";
    }
    return;
  }
  if (T("[data-bkritpadx]")) {
    delete BKPAD[id];
    renderBoj();
    return;
  }
  if (T("[data-bkritpad]")) {
    const pd = BKPAD[id];
    if (!pd) return;
    BKS.druh = pd.druh || "fyz";
    BKS.pod = pd.pod;
    BKS.vys = "";
    BKS.kdo = o0 ? o0.n + " padl" : "";
    bojKritUkaz(v, true);
    return;
  }
  {
    const kzi = T("[data-bkzi]");
    if (kzi) {
      if (window.kzUkaz) window.kzUkaz(kzi.dataset.bkzi);
      return;
    }
  }
  const kzb = T("[data-bkz]");
  if (kzb && o0) {
    bojNpcKouzlo(o0, kzb.dataset.bkz, kzb.dataset.bkzz || null);
    return;
  }
  if (T("[data-bodch]") && o0) {
    bojOdchodDlg(o0);
    return;
  }
  if (T("[data-bkryt]")) {
    upd(o => {
      const k = +o.kryt || 0;
      o.kryt = k === 0 ? 2 : k === 2 ? 5 : 0;
      if (!o.kryt) delete o.kryt;
    });
    return;
  }
  if (T("[data-bvzdat]")) {
    upd(o => {
      o.stav = [...(o.stav || []).filter(x => x !== "prchá"), "vzdal se"];
    });
    mmHlasG(`${o0 ? o0.n : ""}: skládají zbraně. Po boji rozhodnete, co se zajatci.`, 4000);
    return;
  }
  if (T("[data-bmorok]")) {
    upd(o => {
      o.morOk = o.pocet || 1;
      o.stav = (o.stav || []).filter(x => x !== "prchá");
    });
    return;
  }
  if (T("[data-bkoncx]")) {
    delete BKONC[id];
    renderBoj();
    return;
  }
  if (T("[data-bkonch]") && o0) {
    const k = BKONC[id];
    if (!k) return;
    const b = bojConB(PROTBY[o0.b]),
      d = bK(20),
      t = d + b,
      ok = t >= k.dc;
    k.v = {d, b, t, ok};
    if (!ok)
      upd(o => {
        o.stav = (o.stav || []).filter(x => x !== "soustředí");
      });
    else renderBoj();
    return;
  }
  if (T("[data-bpoc]")) {
    const d = +T("[data-bpoc]").dataset.bpoc;
    upd(o => {
      o.pocet = Math.max(0, Math.min(o.max, (o.pocet || 0) + d));
      if (BDOS[id] != null) BDOS[id] = Math.min(BDOS[id], o.pocet);
    });
    return;
  }
  if (T("[data-bnren]") && o0) {
    const nn = (prompt(`Nové jméno pro ${o0.n}:`, o0.n) || "").trim().slice(0, 60);
    if (!nn || nn === o0.n) return;
    const st = o0.n;
    bojZmen(s => {
      const o = (s.npc || []).find(x => x.id === id);
      if (o) o.n = nn;
    });
    mmHlasG(`${st} → ${nn}.`, 2500);
    return;
  }
  if (T("[data-bskryt]") && o0) {
    bojZmen(s => {
      const o = (s.npc || []).find(x => x.id === id);
      if (!o) return;
      if (o.skryt) delete o.skryt;
      else o.skryt = true;
    });
    mmHlasG(o0.skryt ? `${o0.n}: hráči ho teď vidí.` : `${o0.n}: hráči ho zatím nevidí.`, 3000);
    return;
  }
  if (T("[data-bdel]")) {
    if (confirm(`Odebrat ${o0 ? o0.n : "NPC"} z boje?`))
      bojZmen(s => {
        s.npc = s.npc.filter(x => x.id !== id);
        (s.npc || []).forEach(x => {
          if (x.vel === id) delete x.vel;
        });
        Object.keys(s.obsazeni || {}).forEach(k => {
          if (s.obsazeni[k] === id) delete s.obsazeni[k];
        });
      });
    return;
  }
  if (T("[data-bprdel]")) {
    const pr = T("[data-bprdel]").dataset.bprdel;
    upd(o => {
      o.pr = (o.pr || []).filter(x => x !== pr);
      if (!o.pr.length) delete o.pr;
    });
    return;
  }
  const btt = T("[data-butt]");
  if (btt) {
    const k = id + ":" + btt.dataset.butt,
      v = BUTT[k] || {};
    BUTT[k] = v.t === btt.dataset.t && !v.pul ? {} : {t: btt.dataset.t};
    renderBoj();
    return;
  }
  const btp = T("[data-butpul]");
  if (btp) {
    const k = id + ":" + btp.dataset.butpul,
      v = BUTT[k] || {};
    BUTT[k] = v.pul ? {} : {pul: 1};
    renderBoj();
    return;
  }
  if (T("[data-bkritpc]")) {
    bojKritUkaz(v, false);
    return;
  }
  if (T("[data-bzrpo]") && o0) {
    bojUtokZrPo(id);
    return;
  }
  if (T("[data-but]") && o0) {
    const ai = +T("[data-but]").dataset.but,
      E0 = bojEff(o0),
      a0 = E0 && E0.at[ai];
    if (a0 && /šikov/i.test(a0.p || "") && bojTypy(a0).length > 1) {
      bojSikVolba(o0, ai, a0);
      return;
    }
    bojUtokKlik(o0, ai);
    return;
  }
  if (T("[data-bmulti]") && o0) {
    const E0 = bojEff(o0),
      MU = bojMulti(o0, E0);
    if (!MU) return;
    if (!BCIL[id] && !confirm(`${o0.n}: celá akce bez vybraného cíle? (cíl jde vybrat nahoře „Na koho“)`)) return;
    BMQ[id] = {seq: MU.seq, i: 0, tk: bojMultiTk()};
    bojMultiDalsi(o0);
    return;
  }
  if (T("[data-bmdal]") && o0) {
    bojMultiDalsi(o0);
    return;
  }
  if (T("[data-bmx]")) {
    delete BMQ[id];
    renderBoj();
    return;
  }
  const adv = T("[data-badv]");
  if (adv) {
    const k = adv.dataset.badv,
      cur = BADV[id] == null ? "auto" : String(BADV[id]);
    if (k === "auto") delete BADV[id];
    else if (cur === k) BADV[id] = 0;
    else if (cur === "auto" && adv.getAttribute("aria-pressed") === "true") BADV[id] = 0;
    else BADV[id] = +k;
    renderBoj();
    return;
  }
  if (T("[data-brdyadd]") && o0) {
    const t = (prompt(`Připravená akce – ${o0.n}: co a kdy udělá?`, "zaútočí, až se někdo přiblíží") || "").trim();
    if (!t) return;
    bojZmen(z => {
      (z.ready = z.ready || {})[id] = t;
    });
    return;
  }
  if (T("[data-brdyx]")) {
    bojZmen(z => {
      if (z.ready) {
        delete z.ready[id];
        if (!Object.keys(z.ready).length) delete z.ready;
      }
    });
    return;
  }
  if (T("[data-brdygo]") && o0) {
    const t = (BOJ.s.ready || {})[id];
    if ((BOJ.s.reak || {})[id]) {
      mmHlasG(`${o0.n}: reakce už byla v tomto kole použita – připravenou akci nejde spustit.`, 4000);
      return;
    }
    bojLog(id, {n: "Připravená akce", zt: t || ""}, o0.n);
    bojZmen(z => {
      (z.reak = z.reak || {})[id] = 1;
      if (z.ready) {
        delete z.ready[id];
        if (!Object.keys(z.ready).length) delete z.ready;
      }
    });
    return;
  }
  if (T("[data-bbes]")) {
    bojZmen(s => {
      let h = (s.npc || []).find(x => x.b === "houf-besu" && !bojSpoj(x));
      if (h) {
        h.pocet = (h.pocet || 0) + 1;
        h.max = Math.max(h.max || 0, h.pocet);
      } else bojPridejNpc(s, [{n: "Běsi", druh: "houf", pocet: 1, b: PROTBY["houf-besu"] ? "houf-besu" : "", pr: []}]);
    });
    mmHlasG("Ze Závoje se zhmotnil běs.");
    return;
  }
  const zi = T("[data-bzdi]");
  if (zi) {
    const zd = zi.closest("[data-bzd]"),
      nm = zd.dataset.bzd,
      j = +zi.dataset.bzdi,
      o = bojZdr.get(),
      u = (o[id] = o[id] || {});
    u[nm] = (u[nm] || 0) > j ? j : j + 1;
    bojZdr.set(o);
    renderBoj();
    return;
  }
});
if (bojDB) {
  bojNacti().then(() => bojNav());
}

/* útok nepřítele z karty (i po volbě typu zranění u Šikovné zbraně) */
function bojUtokKlik(o0, ai) {
  const id = o0.id;
  if (BJR[id]) {
    if (((BOJ.s || {}).reak || {})[id]) mmHlasG(`${o0.n}: reakce už byla v tomto kole použita.`, 3500);
    else
      bojZmen(z => {
        (z.reak = z.reak || {})[id] = 1;
      });
    delete BJR[id];
  }
  bojUtok(o0, ai);
  renderBoj();
}
/* Šikovná zbraň: před hodem se zvolí typ zranění */
function bojSikVolba(o0, ai, a0) {
  const ty = bojTypy(a0),
    v = BUTT[o0.id + ":" + ai] || {};
  mmPop(
    `<h3 class="uvh2">${besc(o0.n)}: ${besc(a0.n)}</h3><p class="rsmall">Šikovná zbraň – vyber typ zranění pro tento útok.</p><div class="bsikv">${ty.map(t => `<button type="button" class="gbtn${v.t === t ? "" : " ghost"}" data-butsik="${t}" data-n="${besc(o0.id)}" data-ai="${ai}">${bikZr(t)} ${besc(BZRT[t] || t)}</button>`).join("")}</div>`,
  );
}
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-butsik]");
  if (!b) return;
  const o0 = ((BOJ.s || {}).npc || []).find(x => x.id === b.dataset.n);
  if (!o0) return;
  const ai = +b.dataset.ai;
  BUTT[o0.id + ":" + ai] = Object.assign({}, BUTT[o0.id + ":" + ai] || {}, {t: b.dataset.butsik, pul: false});
  mmPopX();
  bojUtokKlik(o0, ai);
});

/* herní záznam: vrátit boj do stavu před vybraným krokem (i všechny pozdější kroky) */
async function bojLogZpetSem(i) {
  const x = BLOGG[i];
  if (!x || !x.o.pre || x.o.undone) return;
  const P = x.o.pre,
    n = BLOGG.slice(0, i).filter(y => !y.o.undone).length;
  if (
    !confirm(
      `Vrátit boj do stavu před: ${x.kdo ? x.kdo + " – " : ""}${x.o.n || "krok"}?${n ? `\nVrátí se i ${n} ${n === 1 ? "pozdější krok" : n < 5 ? "pozdější kroky" : "pozdějších kroků"}.` : ""}`,
    )
  )
    return;
  await bojObnovSnap(P);
  BZUND.push([x.o.t || 0, Date.now()]);
  BLOGG.slice(0, i + 1).forEach(y => {
    y.o.undone = 1;
  });
  bojLog(x.id, {n: "Vráceno", ai: null, zt: `stav před: ${x.o.n || "krok"}${n ? ` (a ${n} pozdějších)` : ""}`}, x.kdo);
  mmHlasG("Boj vrácen do stavu před vybraným krokem.", 3500);
  renderBoj();
}

async function bojObnovSnap(P) {
  await bojZmen(s => {
    Object.keys(s).forEach(k => delete s[k]);
    Object.assign(s, JSON.parse(P.s));
  });
  try {
    bojHp.set(JSON.parse(P.hp));
  } catch (e) {}
  for (const [kid, js] of Object.entries(P.k || {})) {
    const K = KARTBY[kid];
    if (!K) continue;
    const A = JSON.parse(js),
      C = kartaStav(kid) || {},
      ch = {};
    new Set([...Object.keys(A), ...Object.keys(C)]).forEach(k => {
      /* portrét snímek nenese (bojSnapKarta) – Zpět ho nemění */
      if (k === "mods" || k === "img") return;
      if (JSON.stringify(A[k] ?? null) !== JSON.stringify(C[k] ?? null)) ch[k] = A[k] ?? null;
    });
    if (Object.keys(ch).length) await kartaStavZmen(kid, ch, null, {bezZpet: true});
  }
}
/* „Zpět“ u libovolného řádku záznamu: poslední známý stav před tímto řádkem */
async function bojVratCas(tr, popis) {
  const P = [...BHIST].reverse().find(x => x.t < tr - 30);
  if (!P) {
    mmHlasG("Tak daleko web stav nezná – řádek je z doby před otevřením Hry. Použij časovou osu v Hra › Sezení.", 6000);
    return;
  }
  const n = BLOGG.filter(y => (y.o.t || 0) >= tr && !y.o.undone).length;
  if (!confirm(`Vrátit boj do stavu před: ${popis || "tento řádek"}?\nVrátí se i všechno pozdější (pořadí a stavy, životy nepřátel, karty postav).`))
    return;
  await bojObnovSnap(P);
  BZUND.push([tr, Date.now()]);
  BLOGG.forEach(y => {
    if ((y.o.t || 0) >= tr) y.o.undone = 1;
  });
  bojLog("", {n: "Vráceno", ai: null, zt: `stav před: ${popis || "řádek záznamu"}`}, "");
  mmHlasG("Boj vrácen do stavu před vybraným řádkem.", 3500);
  renderBoj();
}

/* příležitostný útok (2026-10-25, Vojta): „Opouští dosah“ u nepřítele – vypravěč vybere postavy, od kterých odchází; do veřejného
   záznamu jde řádek s v = „opouští dosah“ a telefon postavy nabídne útok reakcí (bojPrilezNovy v 14c) */
function bojOdchodDlg(n) {
  const s = BOJ.s || {},
    L = (s.hraci || []).filter(h => !bojDsAkt(h) && !(s.reak || {})[h.id]);
  mmPop(
    `<h3 class="uvh2">${besc(n.n)} opouští dosah</h3><p class="rsmall">Od koho odchází? Vybraným se nabídne příležitostný útok (reakce už v tomto kole použitá se nenabízí).</p>
    <p class="kcilm bodchl">${L.length ? L.map(h => `<button type="button" class="kcilmb" data-bodchh="${besc(h.id)}" data-bodchn="${besc(n.id)}" aria-pressed="false">${besc(h.n)}</button>`).join("") : "<small>Nikdo nemá volnou reakci.</small>"}</p>
    <p><button type="button" class="gbtn" data-bodchok="${besc(n.id)}">Nabídnout příležitostný útok</button></p>`,
  );
}
document.addEventListener("click", e => {
  const T = q => e.target.closest && e.target.closest(q);
  const b = T("[data-bodchh]");
  if (b) {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    return;
  }
  const ok = T("[data-bodchok]");
  if (!ok) return;
  const s = BOJ.s || {},
    n = (s.npc || []).find(x => x.id === ok.dataset.bodchok),
    H = [...document.querySelectorAll('.mmpop [data-bodchh][aria-pressed="true"]')]
      .map(x => (s.hraci || []).find(h => h.id === x.dataset.bodchh))
      .filter(Boolean);
  mmPopX();
  if (!n || !H.length) return;
  H.forEach(h => bojZaz({a: n.n, ai: n.id, c: h.n, ci: h.id, cim: "příležitostný útok", v: "opouští dosah"}));
  bojLog(n.id, {n: "Opouští dosah", zt: `příležitostný útok: ${H.map(h => h.n).join(", ")}`}, n.n);
  mmHlasG(`${n.n} opouští dosah – ${H.map(h => h.n).join(", ")} ${H.length > 1 ? "mohou" : "může"} reakcí zaútočit.`, 4000);
  renderBoj();
});
