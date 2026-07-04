// src/components/simulation/SolutionEngine.js

const SOLUBILITY_LIMITS = {
  "Sodium Chloride (NaCl)": 6.1,
  "Sugar (C₁₂H₂₂O₁₁)": 5.8,
  "Copper Sulfate (CuSO₄)": 1.3,
  "Potassium Nitrate (KNO₃)": 3.2,
  "Silver Nitrate (AgNO₃)": 8.5,
  "Calcium Chloride (CaCl₂)": 7.2,
  "Ammonium Chloride (NH₄Cl)": 4.9,
  "Magnesium Sulfate (MgSO₄)": 2.8,
  "Sodium Hydroxide (NaOH)": 9.5,
  "Hydrochloric Acid (HCl)": 12.0,
};

const COLORS = {
  "Water (H₂O)": "#3b82f6",
  "Ethanol (C₂H₅OH)": "#60a5fa",
  "Methanol (CH₃OH)": "#93c5fd",
  "Acetone (CH₃COCH₃)": "#a5f3fc",
  "Benzene (C₆H₆)": "#fde68a",
};

export default function runSolutionSimulation({
  solute,
  solvent,
  volume,
  concentration,
  temperature,
  isRunning,
  isHeating,
  isStirring,
}) {
  const limit = SOLUBILITY_LIMITS[solute] || 5;

  let saturation = (concentration / limit) * 100;
  saturation = Math.max(0, Math.min(100, saturation));

  let state = "Unsaturated";

  if (saturation >= 95) {
    state = "Saturated";
  }

  if (concentration > limit) {
    state = "Supersaturated";
    saturation = 100;
  }

  const dissolveSpeed =
    (isRunning ? 25 : 0) +
    (isHeating ? 35 : 0) +
    (isStirring ? 30 : 0) +
    temperature / 10;

  const conductivity =
    concentration *
    (solute.includes("Sugar") ? 0.05 : 1.15);

  const density =
    1 +
    concentration * 0.06;

  const boilingPoint =
    100 +
    concentration * 2;

  const freezingPoint =
    0 -
    concentration * 1.5;

  const viscosity =
    1 +
    concentration * 0.25;

  const graphData = [];

  for (let x = 0; x <= 100; x += 5) {
    graphData.push({
      x,
      y:
        (x / 100) *
        concentration,
    });
  }

  return {
    solute,
    solvent,

    volume,

    concentration,

    temperature,

    solutionColor:
      COLORS[solvent] || "#3b82f6",

    saturation,

    state,

    dissolveSpeed,

    conductivity,

    density,

    boilingPoint,

    freezingPoint,

    viscosity,

    graphData,

    isRunning,

    isHeating,

    isStirring,
  };
}