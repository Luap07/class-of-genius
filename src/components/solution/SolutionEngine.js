// src/components/solution/SolutionEngine.js

const solutionDatabase = {
  "Sodium Chloride (NaCl)": {
    formula: "NaCl",
    molarMass: 58.44,
    color: "#60a5fa",
    conductivity: "High",
    solubility: "Highly Soluble",
  },

  NaCl: {
    formula: "NaCl",
    molarMass: 58.44,
    color: "#60a5fa",
    conductivity: "High",
    solubility: "Highly Soluble",
  },

  "Potassium Chloride (KCl)": {
    formula: "KCl",
    molarMass: 74.55,
    color: "#60a5fa",
    conductivity: "High",
    solubility: "Highly Soluble",
  },

  KCl: {
    formula: "KCl",
    molarMass: 74.55,
    color: "#60a5fa",
    conductivity: "High",
    solubility: "Highly Soluble",
  },

  "Copper Sulfate (CuSO₄)": {
    formula: "CuSO4",
    molarMass: 159.61,
    color: "#3b82f6",
    conductivity: "High",
    solubility: "Soluble",
  },

  CuSO4: {
    formula: "CuSO4",
    molarMass: 159.61,
    color: "#3b82f6",
    conductivity: "High",
    solubility: "Soluble",
  },

  "Hydrochloric Acid (HCl)": {
    formula: "HCl",
    molarMass: 36.46,
    color: "#38bdf8",
    conductivity: "Very High",
    solubility: "Completely Miscible",
  },

  HCl: {
    formula: "HCl",
    molarMass: 36.46,
    color: "#38bdf8",
    conductivity: "Very High",
    solubility: "Completely Miscible",
  },

  "Sodium Hydroxide (NaOH)": {
    formula: "NaOH",
    molarMass: 40,
    color: "#67e8f9",
    conductivity: "Very High",
    solubility: "Highly Soluble",
  },

  NaOH: {
    formula: "NaOH",
    molarMass: 40,
    color: "#67e8f9",
    conductivity: "Very High",
    solubility: "Highly Soluble",
  },

  "Sugar (Sucrose)": {
    formula: "Sugar",
    molarMass: 342.3,
    color: "#60a5fa",
    conductivity: "None",
    solubility: "Highly Soluble",
  },

  Sugar: {
    formula: "Sugar",
    molarMass: 342.3,
    color: "#60a5fa",
    conductivity: "None",
    solubility: "Highly Soluble",
  },
};

export default function SolutionEngine({
  solute = "Sodium Chloride (NaCl)",
  solvent = "Water (H₂O)",
  soluteMass = 5,
  solventVolume = 100,
  temperature = 25,
}) {
  const chemical =
    solutionDatabase[solute] ||
    solutionDatabase["Sodium Chloride (NaCl)"];

  const molarMass = chemical.molarMass;

  const moles = soluteMass / molarMass;

  const molarity = Number(
    (moles / (solventVolume / 1000)).toFixed(3)
  );

  let concentration;

  if (molarity < 0.1)
    concentration = "Dilute";
  else if (molarity < 1)
    concentration = "Moderate";
  else
    concentration = "Concentrated";

  const dissolvedPercent = Math.min(
    100,
    Math.round((molarity / 5) * 100)
  );

  return {
    solute,
    solvent,

    formula: chemical.formula,

    molarMass,

    mass: soluteMass,
    volume: solventVolume,

    temperature,

    moles,

    molarity,

    concentration,

    conductivity: chemical.conductivity,

    solubility: chemical.solubility,

    saturation:
      molarity >= 5
        ? "Saturated"
        : "Unsaturated",

    dissolvedPercent,

    dissolved: dissolvedPercent >= 100,

    solutionColor: chemical.color,

    liquidColor: chemical.color,

    liquidLevel: Math.min(
      100,
      (solventVolume / 500) * 100
    ),
  };
}