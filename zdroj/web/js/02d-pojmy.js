/* @čisté – Pojmy pro zobrazení česky (Vojta 2026-10-24): typy zranění, odolnost / imunita / zranitelnost, dovednosti a Univerzální.
   Data, databáze a automatika dál čtou anglické názvy (Fire, Resistance, Stealth, Versatile…) – česky se jen ukazují:
   pojmyCz(text) převede souvislý text, stránka ho pouští na všechny zobrazené texty (pojmyStrana v 26). Názvy kouzel
   a předmětů (Fire Bolt, Cone of Cold, Wall of Force…) zůstávají: typ zranění se převádí jen v souvislosti zranění
   (před „zranění“, za kostkou či číslem, za „vůči / proti“, za odolností, v seznamu nebo v buňce tabulky). ===== */
const POJZR = {
  Acid: "kyselinov",
  Bludgeoning: "drtiv",
  Cold: "mraziv",
  Fire: "ohniv",
  Force: "silov",
  Lightning: "bleskov",
  Necrotic: "proklet",
  Piercing: "bodn",
  Poison: "jedov",
  Psychic: "psychick",
  Radiant: "svat",
  Slashing: "sečn",
  Thunder: "hromov",
};
const POJDOV = {
  Acrobatics: "Akrobacie",
  "Animal Handling": "Ovládání zvířat",
  Arcana: "Mystika",
  Athletics: "Atletika",
  Deception: "Klamání",
  History: "Historie",
  Insight: "Vhled",
  Intimidation: "Zastrašování",
  Investigation: "Pátrání",
  Medicine: "Lékařství",
  Nature: "Příroda",
  Perception: "Vnímání",
  Performance: "Umění",
  Persuasion: "Přesvědčování",
  Religion: "Náboženství",
  "Sleight of Hand": "Kapsářství",
  Stealth: "Nenápadnost",
  Survival: "Přežití",
};
/* typ zranění česky v daném tvaru: „é“ (ohnivé), „ého“ (ohnivého), „ému“ (ohnivému), „ým“ (ohnivým) */
const pojZr = (t, tvar = "é") => (POJZR[t] ? POJZR[t] + tvar : t);
const POJTYPY = Object.keys(POJZR).join("|"),
  POJSEP = "(?:\\s*,\\s*(?:(?:a|nebo|či|and|or)\\s+)?|\\s*/\\s*|\\s+(?:a|nebo|či|and|or)\\s+)",
  POJZRRE = new RegExp(`(?<![\\p{L}'’-])(?:${POJTYPY})(?:${POJSEP}(?:${POJTYPY}))*(?![\\p{L}'’-])`, "gu"),
  POJKOST = /(\d+\s*(?:[dk]\d+)?(?:\s*[+−-]\s*\d+)?\)?|\d+\s*\(\d+[dk]\d+(?:\s*[+−-]\s*\d+)?\))\s*$/u,
  POJOBR =
    /(Resistance|Immunity|Vulnerability|[Ii]munit\p{L}*|[Oo]dolnost\p{L}*|[Oo]doln\p{L}+|[Zz]ranitelnost\p{L}*|[Tt]yp\p{L}*(?:\s+zranění)?|[Dd]ruh\p{L}*(?:\s+zranění)?|zranění)(?:\*\*|\s|:|\()*$/u,
  POJVELKE = /(^|[.!?|])\s*(\*\*)?\s*$/u;
const pojVelke = s => s.charAt(0).toUpperCase() + s.slice(1);
/* tvar typu zranění podle okolí; null = nepřevádět (název kouzla, předmětu…) */
function pojZrTvar(pred, za) {
  if (/\bof\s*$/i.test(pred)) return null;
  if (/^\s*zraněním/u.test(za)) return "ým";
  if (/^\s*zranění/u.test(za)) return POJKOST.test(pred) ? "ého" : "é";
  if (/^\s+[A-Z][a-z]/.test(za)) return null;
  if (/(vůči|proti)\s*$/iu.test(pred)) return "ému";
  if (/(kromě|bez)\s*$/iu.test(pred)) return "ého";
  if (POJKOST.test(pred) || POJOBR.test(pred)) return "é";
  if (/(^|\||^\s*[-–•]?\s*\d+\s*[:.)])\s*$/.test(pred) && /^\s*(\||$|[,;.)·])/.test(za)) return "é";
  return null;
}
function pojmyCz(s) {
  s = String(s ?? "");
  if (
    !/Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder|Resistance|Immunity|Vulnerability|Versatile|Acrobatics|Animal Handling|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Sleight of Hand|Stealth|Survival/.test(
      s,
    )
  )
    return s;
  s = s.replace(POJZRRE, (m, i, celé) => {
    const pred = celé.slice(Math.max(0, i - 48), i),
      za = celé.slice(i + m.length, i + m.length + 24),
      tvar = pojZrTvar(pred, za);
    if (!tvar) return m;
    const o = m
      .replace(new RegExp(`(?<![\\p{L}])(${POJTYPY})(?![\\p{L}])`, "gu"), (x, t) => pojZr(t, tvar))
      .replace(/\band\b/g, "a")
      .replace(/\bor\b/g, "nebo");
    return POJVELKE.test(pred) ? pojVelke(o) : o;
  });
  s = s.replace(/(?<![\p{L}])(Resistance|Immunity|Vulnerability)(?![\p{L}])/gu, (m, w, i, celé) => {
    if (/[A-Z][a-z]+\s+$/.test(celé.slice(Math.max(0, i - 24), i))) return m; /* Magic Resistance, Spell Immunity… */
    const pred = celé.slice(Math.max(0, i - 24), i),
      gen = /(bez|kromě|vůči|proti)\s*$/iu.test(pred),
      acc = /(má|máš|mají|nemá\p{L}*|získ\p{L}*|dostan\p{L}*|dáv\p{L}*|dá|ignoruj\p{L}*|ztrác\p{L}*|ztratí)\s*$/iu.test(pred),
      o =
        w === "Resistance"
          ? gen
            ? "odolnosti"
            : "odolnost"
          : w === "Immunity"
            ? gen
              ? "imunity"
              : acc
                ? "imunitu"
                : "imunita"
            : gen
              ? "zranitelnosti"
              : "zranitelnost";
    return POJVELKE.test(pred) ? pojVelke(o) : o;
  });
  s = s.replace(
    /(?<![\p{L}])(Sleight of Hand|Animal Handling|Acrobatics|Arcana|Athletics|Deception|History|Insight|Intimidation|Investigation|Medicine|Nature|Perception|Performance|Persuasion|Religion|Stealth|Survival)(?![\p{L}'’])(?!\s+[A-Z][a-z])/gu,
    (m, w) => POJDOV[w] || m,
  );
  return s.replace(/(?<![\p{L}])Versatile(?![\p{L}])/gu, "Univerzální");
}
