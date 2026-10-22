/* ===== Vybavení: katalog (2026-10-20) – art/vybaveni.json z Vojtova Přehledu vybavení (zdroj/vybaveni) s pravidly Artikulí.
   Zbroj, zbraně, střelivo, výbava, nářadí, zvířata a doprava, jedy, magické předměty (SRD i mimo SRD). Stránka Pravidla › Vybavení
   s hledáním a tlačítkem „Přidat“ do vybavení postavy; nabídka na kartě (kPool) bere položky odtud; popis věci v inventáři. ===== */
let VYB = null,
  VYBP = null;
const VYBBY = {},
  VYBN = {};
const VYBSK = [
  ["zbroj", "Zbroj a štít"],
  ["zbrane", "Zbraně"],
  ["strelivo", "Střelivo"],
  ["vybava", "Dobrodružná výbava"],
  ["naradi", "Nářadí a soupravy"],
  ["zvirata", "Zvířata"],
  ["sedla", "Sedla"],
  ["vozy", "Vozy"],
  ["plavidla", "Plavidla"],
  ["jedy", "Jedy"],
  ["magicke", "Magické předměty"],
];
const VYBSKN = Object.fromEntries(VYBSK);
const vybNacti = () =>
  VYB
    ? Promise.resolve(VYB)
    : (VYBP =
        VYBP ||
        fetch("art/vybaveni.json")
          .then(r => {
            if (!r.ok) throw new Error(r.status);
            return r.json();
          })
          .then(d => {
            VYBSK.forEach(([sk]) =>
              (d[sk] || []).forEach(x => {
                x.sk = sk;
                VYBBY[x.id] = x;
                VYBN[vybKl(x.en)] = VYBN[vybKl(x.en)] || x;
                if (x.cz) VYBN[vybKl(x.cz)] = VYBN[vybKl(x.cz)] || x;
              }),
            );
            VYB = d;
            KPOOLM = null;
            return d;
          })
          .catch(e => {
            VYBP = null;
            throw e;
          }));
const vybKl = n =>
  String(n || "")
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s*\+\s*[1-3]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
/* položka katalogu podle názvu věci v inventáři (anglicky i česky, bez počtu a bonusu); id má přednost */
const vybNajdi = x => {
  if (!x || !VYB) return null;
  if (x.kat && VYBBY[x.kat]) return VYBBY[x.kat];
  const n = vybKl(typeof x === "string" ? x : x.n);
  return VYBN[n] || null;
};
const vybCena = x => (x && x.cena ? besc(x.cena) : "");
const vybLb = w => (w == null ? "" : w > 0 ? `${String(Math.round(w * 100) / 100).replace(".", ",")} lb.` : "—");
/* řádek parametrů podle druhu položky (zbraň: zranění, vlastnosti, mistrovství; zbroj: AC; …) */
function vybParam(x) {
  if (!x) return "";
  const sk = x.sk;
  if (sk === "zbrane")
    return `${besc(x.z)} ${bikZr(x.zt)}${besc(BZRT[x.zt] || x.zt)}${x.vl && x.vl.length ? ` · ${x.vl.map(v => besc(vybVl(v))).join(", ")}` : ""}${x.dostrel ? ` · dostřel ${besc(x.dostrel)}` : ""}${x.ma ? ` · mistrovství ${besc(x.ma)}${VYB.mistrovstvi && VYB.mistrovstvi[x.ma] ? ` (${besc(VYB.mistrovstvi[x.ma].cz)})` : ""}` : ""}`;
  if (sk === "zbroj")
    return x.typ === "štít"
      ? "+2 AC"
      : `AC ${x.ac}${x.typ !== "těžká" ? ` + AGI${x.agi === 2 ? " (nejvýš +2)" : ""}` : ""}${x.str ? ` · STR ${x.str}` : ""}${x.plizeni ? " · nevýhoda na plížení" : ""} · ${besc(x.typ)} zbroj`;
  if (sk === "strelivo") return `${x.pocet} ks`;
  if (sk === "naradi") return `${besc(x.sk2 || "")}${x.vl ? ` · ověření ${besc(x.vl)}` : ""}`;
  if (sk === "zvirata") return `nosnost ${besc(x.nosnost || "")}`;
  if (sk === "plavidla")
    return `${besc(x.rychlost || "")} · posádka ${besc(x.posadka || "")} · cestující ${besc(x.cestujici || "")} · náklad ${besc(x.naklad || "")} t · AC ${besc(x.ac || "")} · HP ${besc(x.hp || "")}${x.prah && x.prah !== "-" ? ` · práh zranění ${besc(x.prah)}` : ""}`;
  if (sk === "jedy") return `${besc(x.druh || "")} jed`;
  if (sk === "magicke")
    return `${besc(x.druh || "")} · ${besc(x.vz || "")}${x.pr ? " · připoutání" + (typeof x.pr === "string" ? " (" + besc(x.pr) + ")" : "") : ""}`;
  return "";
}
const vybVl = v => {
  const m = String(v).match(/^([A-Za-z-]+)(.*)$/),
    d = m && VYB.vlastnosti && VYB.vlastnosti[m[1]];
  return d && d.cz ? `${m[1]} (${d.cz})${m[2] || ""}` : v;
};
/* Artikule: vlastnosti zbraně s ikonami, druh zbroje s Resistance a obětováním */
function vybArtikule(x) {
  if (!x) return "";
  if (x.sk === "zbrane" && x.art && x.art.length)
    return `<div class="vybart"><b>Artikule:</b> ${x.art.map(a => `<span class="vybartv">${bikZv(a)}${besc(a)}</span>`).join(" ")}<ul class="rl">${x.art.map(a => `<li><b>${besc(a)}</b> – ${besc(BVLZ[a] || "")}</li>`).join("")}</ul></div>`;
  if (x.sk === "zbroj" && x.art) {
    const z = BZBR[x.art] || ["—", "—"];
    return `<div class="vybart"><b>Artikule:</b> <span class="vybartv">${bikZb(x.art)}${besc(x.art)}</span>${
      z[0] !== "—"
        ? ` · Resistance ${z[0]
            .split(", ")
            .map(t => `${bikZr(t)}${besc(BZRT[t] || t)}`)
            .join(", ")}`
        : ""
    } · vydrží obětování ${besc(z[1])}<p class="rsmall">Při kritickém zásahu lze zbroj nebo štít obětovat a zásah je běžný; po vyčerpání počtu přestane dávat AC a potřebuje opravu.</p></div>`;
  }
  return "";
}
/* karta položky (vyskakovací okno i řádek v katalogu) */
function vybKarta(x, pop) {
  if (!x) return "";
  const srd = x.srd && typeof PREDBY !== "undefined" ? PREDBY[x.srd] : null;
  return `<article class="kzkarta vybk${x.x ? " kmimo" : ""}">${pop ? `<button type="button" class="kzx" data-kzzavri aria-label="Zavřít">×</button>` : ""}<h3>${besc(x.en)}${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` <small>${besc(x.cz)}</small>` : ""}</h3>
    <p class="rsmall"><i>${besc(VYBSKN[x.sk] || "")}</i>${vybParam(x) ? ` · ${vybParam(x)}` : ""}${x.w != null ? ` · ${vybLb(x.w)}` : x.wtxt ? ` · ${besc(x.wtxt)}` : ""}${x.cena ? ` · <b>${vybCena(x)}</b>` : ""}</p>
    ${x.t ? `<p>${besc(x.t)}</p>` : ""}${x.tab ? x.tab.map(T => `<table class="rtab vybtab"><thead><tr>${(T.h || []).map(h => `<th>${besc(h)}</th>`).join("")}</tr></thead><tbody>${(T.r || []).map(r => `<tr>${r.map(c => `<td>${besc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`).join("") : ""}
    ${vybArtikule(x)}${srd ? `<details class="bjapd"><summary>Plné znění SRD 5.2.1</summary>${kzMd(srd.t)}<p class="rsmall">SRD 5.2.1, s. ${srd.str || ""}</p></details>` : ""}
    ${x.x && typeof MIMOPOZN === "string" ? `<p class="rsmall srdattr">${besc(MIMOPOZN)}</p>` : ""}</article>`;
}
/* ---- přidání do vybavení postavy (stránka Vybavení i nabídka na kartě) ---- */
function vybPoolVstup(x) {
  const e = {k: "kat", n: x.en, w: x.w || 0, kat: x.id, sk: x.sk};
  if (x.sk === "zbrane") e.k = "zbr";
  else if (x.sk === "zbroj") e.k = "zbroj";
  else if (x.sk === "magicke") {
    e.k = "mag";
    if (x.srd) e.mag = x.srd;
    if (x.pr) e.pr = x.pr;
  }
  return e;
}
const vybPopisekPool = x =>
  `${x.en}${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` (${x.cz})` : ""} – ${x.sk === "zbrane" ? `${x.kat || "zbraň"} ${x.z} ${BZRT[x.zt] || x.zt}` : x.sk === "zbroj" ? `${x.typ} zbroj${x.ac ? ", AC " + (x.typ === "štít" ? "+" : "") + x.ac : ""}` : x.sk === "magicke" ? `${x.druh || "magický předmět"}, ${x.vz || ""}${x.pr ? ", připoutání" : ""}` : VYBSKN[x.sk] || ""}${x.cena ? ` · ${x.cena}` : ""}`;
/* postava, do které se na stránce Vybavení přidává: hráč svou, vypravěč vybranou */
let VYBK = "";
const vybCil = () => {
  if (!GMV) {
    const K = typeof jaK === "function" ? jaK() : null;
    return K && kMuze(K) ? K : null;
  }
  const K = KARTBY[VYBK] || (KARTY || []).find(k => !k.test) || (KARTY || [])[0] || null;
  return K && kMuze(K) ? K : null;
};
function vybPridatBtn(x) {
  const K = vybCil();
  if (!K) return "";
  return `<button type="button" class="gbtn ghost vybadd" data-vybadd="${besc(x.id)}" ${btip(`Přidat do vybavení: ${K.n}`)}>+ Přidat</button>`;
}
/* ---- stránka Pravidla › Vybavení ---- */
let VYBF = {q: "", sk: "", vz: ""};
function renderVybaveni(main, c) {
  if (!VYB) {
    main.innerHTML = `<p class="rsmall">Načítám vybavení…</p>`;
    Promise.all([vybNacti(), typeof predNacti === "function" ? predNacti().catch(() => {}) : null]).then(
      () => {
        if (curView === "pravidla") renderVybaveni(main, c);
      },
      () => {
        main.innerHTML = `<p class="intro">Vybavení se nepodařilo načíst.</p>`;
      },
    );
    return;
  }
  const q = vybKl(VYBF.q),
    K = vybCil(),
    vz = VYBF.vz;
  const hit = x =>
    (!VYBF.sk || x.sk === VYBF.sk) &&
    (!vz || x.sk !== "magicke" || x.vz === vz) &&
    (!q || vybKl(x.en).includes(q) || vybKl(x.cz).includes(q) || (x.t && vybKl(x.t).includes(q)));
  const radek =
    x => `<li class="vybr${x.x ? " vybmimo" : ""}" id="vyb-${besc(x.id)}"><button type="button" class="kspn vybn" data-vybpop="${besc(x.id)}" ${btip("Popis")}>${besc(x.en)}</button>${x.cz && x.cz.toLowerCase() !== x.en.toLowerCase() ? ` <small class="vybcz">${besc(x.cz)}</small>` : ""}${x.sk === "zbrane" && x.art && x.art.length ? ` <span class="vybik">${x.art.map(a => bikZv(a)).join("")}</span>` : x.sk === "zbroj" && x.art ? ` <span class="vybik">${bikZb(x.art)}</span>` : ""}
    <span class="vybp">${vybParam(x)}</span><span class="vybw">${x.w != null ? vybLb(x.w) : x.wtxt ? besc(x.wtxt) : ""}</span><span class="vybc">${vybCena(x)}</span>${vybPridatBtn(x)}</li>`;
  const sekce = VYBSK.map(([sk, n]) => {
    const L = (VYB[sk] || []).filter(hit);
    if (!L.length) return "";
    const sub =
      sk === "zbrane"
        ? [...new Set(L.map(x => x.kat))].map(k => [k, L.filter(x => x.kat === k)])
        : sk === "zbroj"
          ? ["lehká", "střední", "těžká", "štít"]
              .map(t => [t === "štít" ? "Štít" : `${t[0].toUpperCase() + t.slice(1)} zbroj`, L.filter(x => x.typ === t)])
              .filter(a => a[1].length)
          : sk === "naradi"
            ? [...new Set(L.map(x => x.sk2 || ""))].map(k => [k, L.filter(x => (x.sk2 || "") === k)])
            : sk === "magicke"
              ? PRVZ.filter(v => L.some(x => x.vz === v)).map(v => [v[0].toUpperCase() + v.slice(1), L.filter(x => x.vz === v)])
              : [["", L]];
    return `<section class="vybsek" id="vyb-${sk}"><h3 class="uvh2">${n} <small>${L.length}</small></h3>${sk === "zbrane" ? `<p class="rsmall">Vlastnosti zbraní podle Artikulí (ikony) platí každému, kdo má se zbraní zdatnost. ${VYB.uvod && VYB.uvod["3"] ? besc(VYB.uvod["3"].join(" ")) : ""}</p>` : sk === "zbroj" ? `<p class="rsmall">Druh zbroje podle Artikulí dává Resistance a počet obětování – podrobnosti v <a href="#artikule/vyzbroj">Artikulích › Výzbroj</a>. ${VYB.uvod && VYB.uvod["2"] ? besc(VYB.uvod["2"].join(" ")) : ""}</p>` : sk === "jedy" && VYB.uvod && VYB.uvod["7"] ? `<p class="rsmall">${besc(VYB.uvod["7"].join(" "))}</p>` : ""}
      ${sub.map(([t, M]) => `${t ? `<h4>${besc(t[0].toUpperCase() + t.slice(1))}</h4>` : ""}<ul class="vybl">${M.map(radek).join("")}</ul>`).join("")}</section>`;
  }).join("");
  main.innerHTML = `<nav class="crumbs"><a href="#pravidla">Pravidla</a> › <b>Vybavení</b></nav><h2 class="arttitle">Vybavení</h2>
    <p class="intro">Zbroj, zbraně, výbava, nářadí, zvířata, doprava, jedy a magické předměty s cenami a stručným popisem. U zbraní a zbroje jsou vlastnosti podle <a href="#artikule/vyzbroj">Artikulí</a>. Klepnutím na název se ukáže popis; ${K ? `<b>+ Přidat</b> dá věc do vybavení postavy <b>${besc(K.n)}</b>` : GMV ? "vyber postavu, do které se má přidávat" : "přihlas se ke své postavě na stránce Hra a věci si rovnou přidáš do vybavení"}.</p>
    <form class="kvlh vybf" data-vybf><input type="search" name="q" value="${besc(VYBF.q)}" placeholder="hledat: meč, Rope, lektvar…" data-vybq autocomplete="off"><select name="sk" data-vybsk aria-label="Kategorie"><option value="">vše</option>${VYBSK.map(([sk, n]) => `<option value="${sk}"${VYBF.sk === sk ? " selected" : ""}>${n}</option>`).join("")}</select>
      ${
        !VYBF.sk || VYBF.sk === "magicke"
          ? `<select name="vz" data-vybvz aria-label="Vzácnost"><option value="">každá vzácnost</option>${PRVZ.filter(v => v !== "proměnlivá")
              .map(v => `<option value="${v}"${vz === v ? " selected" : ""}>${v}</option>`)
              .join("")}</select>`
          : ""
      }
      ${GMV ? `<select data-vybk aria-label="Postava">${(KARTY || []).map(k => `<option value="${besc(k.id)}"${K && K.id === k.id ? " selected" : ""}>${besc(k.n)}</option>`).join("")}</select>` : ""}</form>
    <p class="rsmall">${VYBSK.map(([sk, n]) => `<a href="#pravidla/vybaveni/vyb-${sk}">${n}</a>`).join(" · ")}</p>
    ${sekce || `<p class="rsmall">Nic nenalezeno.</p>`}
    <h3 class="uvh2" id="vyb-vlastnosti">Vlastnosti zbraní</h3><ul class="kfeat">${Object.entries(VYB.vlastnosti || {})
      .map(([k, v]) => `<li><b>${besc(k)}</b> <small>${besc(v.cz || "")}</small><br>${besc(v.t || "")}</li>`)
      .join("")}</ul>
    <h3 class="uvh2" id="vyb-mistrovstvi">Mistrovství zbraní</h3><ul class="kfeat">${Object.entries(VYB.mistrovstvi || {})
      .map(([k, v]) => `<li><b>${besc(k)}</b> <small>${besc(v.cz || "")}</small><br>${besc(v.t || "")}</li>`)
      .join("")}</ul>
    ${VYB.vyroba && VYB.vyroba.t ? `<h3 class="uvh2" id="vyb-vyroba">Výroba</h3>${VYB.vyroba.t.map(t => `<p>${besc(t)}</p>`).join("")}${VYB.vyroba.magicka ? `<table class="rtab vybtab"><thead><tr><th>Vzácnost</th><th>Pracovní dny</th><th>Materiál</th></tr></thead><tbody>${VYB.vyroba.magicka.map(r => `<tr><td>${besc(r.vz)}</td><td>${besc(r.dny)}</td><td>${besc(r.material)}</td></tr>`).join("")}</tbody></table>` : ""}` : ""}
    ${VYB.mince && VYB.mince.length ? `<h3 class="uvh2" id="vyb-mince">Mince</h3><p class="rsmall">${VYB.mince.map(m => `${besc(m.n)} ${besc(m.cz ? "(" + m.cz + ")" : "")} = ${besc(m.gp)} GP`).join(" · ")}. ${VYB.uvod && VYB.uvod["1"] ? besc(VYB.uvod["1"].join(" ")) : ""}</p>` : ""}
    <p class="rsmall srdattr">Přehled vybavení pro tažení Mundus Mutatus – vlastní shrnutí; položky SRD 5.2.1 odkazují na plné znění.${typeof MIMOPOZN === "string" ? " " + besc(MIMOPOZN) : ""}</p>`;
  const el = c && document.getElementById(c);
  if (el) el.scrollIntoView({block: "start"});
  else if (!VYBF.q) window.scrollTo(0, 0);
}
document.addEventListener("input", e => {
  const t = e.target;
  if (t.matches && t.matches("[data-vybq]")) {
    VYBF.q = t.value;
    clearTimeout(VYBF.t);
    VYBF.t = setTimeout(() => {
      const m = document.getElementById("srdmain");
      if (m && curView === "pravidla") {
        const a = document.activeElement === t,
          p = t.selectionStart;
        renderVybaveni(m);
        if (a) {
          const n = m.querySelector("[data-vybq]");
          if (n) {
            n.focus();
            try {
              n.setSelectionRange(p, p);
            } catch (x) {}
          }
        }
      }
    }, 200);
  }
});
document.addEventListener("change", e => {
  const t = e.target;
  if (!t.matches) return;
  let z = false;
  if (t.matches("[data-vybsk]")) {
    VYBF.sk = t.value;
    z = true;
  }
  if (t.matches("[data-vybvz]")) {
    VYBF.vz = t.value;
    z = true;
  }
  if (t.matches("[data-vybk]")) {
    VYBK = t.value;
    z = true;
  }
  if (z) {
    const m = document.getElementById("srdmain");
    if (m && curView === "pravidla") renderVybaveni(m);
  }
});
document.addEventListener("submit", e => {
  if (e.target.matches && e.target.matches("[data-vybf]")) e.preventDefault();
});
document.addEventListener("click", async e => {
  const T = s => e.target.closest && e.target.closest(s);
  const p = T("[data-vybpop]");
  if (p) {
    const x = VYBBY[p.dataset.vybpop];
    if (x) {
      if (x.srd && typeof predNacti === "function") await predNacti().catch(() => {});
      mmPop(vybKarta(x, false));
    }
    return;
  }
  const a = T("[data-vybadd]");
  if (a) {
    const x = VYBBY[a.dataset.vybadd],
      K = vybCil();
    if (!x || !K) return;
    const n = +(prompt(`Kolik přidat: ${x.en}${x.cz ? " (" + x.cz + ")" : ""}`, "1") || 0);
    if (!(n > 0)) return;
    await kVybPridej(K, vybPoolVstup(x), Math.min(999, Math.round(n)));
    return;
  }
});
