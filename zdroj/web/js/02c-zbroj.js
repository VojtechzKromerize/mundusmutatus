/* @čisté – Druhy zbroje podle Artikulí (2026-10-23): Resistance a výdrž zbroje, druh zbroje z popisu AC =====
   ČISTÝ SOUBOR v jádru (stahuje se hned): Artikule (03) z něj při načtení kreslí tabulku zbrojí (bikZb v 02), boj (10p) počítá
   Resistance zbroje. Proto nesmí do líných dílů 10–25. ===== */

/* z 02-mapa */
const BZBR = {
  Vycpávaná: ["Bludgeoning", "1×"],
  Kroužková: ["Bludgeoning, Slashing", "2×"],
  Plátová: ["Slashing, Piercing", "3×"],
  Komplexní: ["Bludgeoning, Slashing, Piercing", "3×"],
  Štít: ["—", "1×"],
};

/* z 02-mapa */
/* druhy zbroje z popisu AC („kroužková košile, štít“, „kyrys a pavéza“, „plná zbroj“) */
const bikZbDruhy = t => {
  t = String(t || "").toLowerCase();
  if (/kouzeln|přirozen|mage armor|zbytky/.test(t) && !/štít|pavéz/.test(t)) return [];
  const d = [];
  if (/plná zbroj|komplexn|\bplate\b/.test(t)) d.push("Komplexní");
  else if (/plátov|kyrys|brigantin|půlplát|breastplate|half-plate|splint/.test(t)) d.push("Plátová");
  else if (/kroužkov|drátěn|šupin|chain|scale|ring mail/.test(t)) d.push("Kroužková");
  else if (/kožen|prošívan|vycpávan|gambeson|padded|leather|hide/.test(t)) d.push("Vycpávaná");
  if (/štít|pavéz|shield/.test(t)) d.push("Štít");
  return d;
};
