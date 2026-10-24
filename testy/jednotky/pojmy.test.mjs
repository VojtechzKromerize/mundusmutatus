// Pojmy česky v zobrazení (02d-pojmy.js, Vojta 2026-10-24): typy zranění se skloňují podle okolí, názvy kouzel zůstávají.
import {test} from "node:test";
import assert from "node:assert/strict";
import {ciste} from "./ciste.mjs";

const {ev} = ciste();
const cz = s => ev(`pojmyCz(${JSON.stringify(s)})`);

test("typ zranění: před „zranění“, za kostkou a za vůči / proti ve správném tvaru", () => {
  assert.equal(cz("jinak utrpí 2d6 Fire zranění."), "jinak utrpí 2d6 ohnivého zranění.");
  assert.equal(cz("utrpí 3 (1d6) Poison zranění"), "utrpí 3 (1d6) jedového zranění");
  assert.equal(cz("způsobí Fire zranění"), "způsobí ohnivé zranění");
  assert.equal(cz("zasáhne Slashing zraněním"), "zasáhne sečným zraněním");
  assert.equal(cz("Resistance vůči Acid, Cold, Fire, Lightning a Poison"), "Odolnost vůči kyselinovému, mrazivému, ohnivému, bleskovému a jedovému");
  assert.equal(cz("proti Slashing a Piercing"), "proti sečnému a bodnému");
  assert.equal(cz("| Dagger (dýka) | 1d4 Piercing | Finesse |"), "| Dagger (dýka) | 1d4 bodné | Finesse |");
  assert.equal(cz("+1d4 Acid/Cold/Fire/Lightning"), "+1d4 kyselinové/mrazivé/ohnivé/bleskové");
  assert.equal(cz("| Fire | Plameny |"), "| Ohnivé | Plameny |");
  assert.equal(cz("Necrotic"), "Prokleté");
  assert.equal(cz("Radiant zranění"), "Svaté zranění");
  assert.equal(cz(" Bludgeoning, Piercing, Slashing · "), " Drtivé, bodné, sečné · ", "samostatný seznam ve statbloku");
  assert.equal(cz("- 2: Cold"), "- 2: mrazivé");
});

test("názvy kouzel a předmětů zůstávají anglicky", () => {
  for (const s of ["Fire Bolt", "Cone of Cold", "Wall of Force", "Lightning Bolt", "Poison Spray", "Thunder Step", "Acid Splash", "Alchemist's Fire"])
    assert.equal(cz(s), s, s);
  assert.equal(cz("Fire Bolt: 1d10 Fire zranění"), "Fire Bolt: 1d10 ohnivého zranění");
});

test("odolnost, imunita, zranitelnost; dovednosti a Univerzální", () => {
  assert.equal(cz("**Resistance** Bludgeoning"), "**Odolnost** drtivé");
  assert.equal(cz("ignoruje Resistance zbroje"), "ignoruje odolnost zbroje");
  assert.equal(cz("bez Resistance"), "bez odolnosti");
  assert.equal(cz("Magic Resistance."), "Magic Resistance.", "název schopnosti zůstává");
  assert.equal(cz("má Immunity vůči Thunder"), "má imunitu vůči hromovému");
  assert.equal(cz("Vulnerability: Fire"), "Zranitelnost: ohnivé");
  assert.equal(cz("DEX (Stealth) a WIS (Perception), Sleight of Hand"), "DEX (Nenápadnost) a WIS (Vnímání), Kapsářství");
  assert.equal(cz("Versatile (1d8)"), "Univerzální (1d8)");
  assert.equal(cz("Nature's Veil"), "Nature's Veil", "název kouzla s dovedností zůstává");
  assert.equal(cz("bez anglických pojmů"), "bez anglických pojmů");
});
