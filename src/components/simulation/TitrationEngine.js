// src/components/simulation/TitrationEngine.js

/**
 * ---------------------------------------------
 * Virtual Titration Engine
 * ---------------------------------------------
 * Supports:
 *  - Strong Acid vs Strong Base
 *  - HCl + NaOH
 *  - pH calculation
 *  - Endpoint detection
 *  - Flask colour
 *  - Burette volume
 *  - Flask volume
 *  - Curve data generation
 * ---------------------------------------------
 */

const INDICATOR_COLOURS = {
  Phenolphthalein: {
    before: "#38bdf8",
    after: "#ec4899",
  },

  MethylOrange: {
    before: "#ef4444",
    after: "#f59e0b",
  },

  BromothymolBlue: {
    before: "#facc15",
    after: "#2563eb",
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function runTitration({
  acid = "HCl",
  base = "NaOH",

  indicator = "Phenolphthalein",

  acidConcentration = 0.1,
  baseConcentration = 0.1,

  acidVolume = 25,
  titrantAdded = 0,

  buretteCapacity = 50,
}) {
  //----------------------------------------
  // Moles
  //----------------------------------------

  const acidMoles =
    acidConcentration * (acidVolume / 1000);

  const baseMoles =
    baseConcentration * (titrantAdded / 1000);

  //----------------------------------------
  // Volumes
  //----------------------------------------

  const flaskVolume =
    acidVolume + titrantAdded;

  const buretteVolume = clamp(
    buretteCapacity - titrantAdded,
    0,
    buretteCapacity
  );

  //----------------------------------------
  // Endpoint
  //----------------------------------------

  const endpointVolume =
    (acidConcentration * acidVolume) /
    baseConcentration;

  const endpointReached =
    titrantAdded >= endpointVolume;

  //----------------------------------------
  // pH
  //----------------------------------------

  let ph = 7;

  if (baseMoles < acidMoles) {
    const excessH = acidMoles - baseMoles;

    const concentration =
      excessH / (flaskVolume / 1000);

    ph = -Math.log10(concentration);
  } else if (baseMoles > acidMoles) {
    const excessOH = baseMoles - acidMoles;

    const concentration =
      excessOH / (flaskVolume / 1000);

    const poh = -Math.log10(concentration);

    ph = 14 - poh;
  } else {
    ph = 7;
  }

  if (!Number.isFinite(ph)) ph = 7;

  ph = clamp(ph, 0, 14);

  //----------------------------------------
  // Flask Colour
  //----------------------------------------

  const colours =
    INDICATOR_COLOURS[indicator] ||
    INDICATOR_COLOURS.Phenolphthalein;

  const flaskColor = endpointReached
    ? colours.after
    : colours.before;

  //----------------------------------------
  // Curve Point
  //----------------------------------------

  const curvePoint = {
    x: Number(titrantAdded.toFixed(2)),
    y: Number(ph.toFixed(2)),
  };

  //----------------------------------------
  // Return Everything
  //----------------------------------------

  return {
    acid,
    base,

    ph: Number(ph.toFixed(2)),

    endpointReached,

    endpointVolume,

    flaskColor,

    buretteVolume,

    flaskVolume,

    titrantAdded,

    curvePoint,
  };
}

export default runTitration;