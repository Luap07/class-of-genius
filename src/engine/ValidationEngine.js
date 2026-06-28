// src/data/chemicalReaction/reactions.js

const reactions = [

  /* =========================
        COMBUSTION
  ========================= */

  {
    id: 1,
    reactants: ["Hydrogen", "Oxygen"],

    products: ["Water"],

    equation:
      "2H₂ + O₂ → 2H₂O",

    observation:
      "A bright blue flame is produced and water droplets appear.",

    energy: "Exothermic",

    type: "Combustion",

    gas: false,

    precipitate: false,

    color: "#60a5fa",
  },

  {
    id: 2,

    reactants: ["Carbon", "Oxygen"],

    products: ["Carbon Dioxide"],

    equation:
      "C + O₂ → CO₂",

    observation:
      "The carbon burns with a glowing flame producing carbon dioxide.",

    energy: "Exothermic",

    type: "Combustion",

    gas: true,

    precipitate: false,

    color: "#94a3b8",
  },

  /* =========================
        NEUTRALIZATION
  ========================= */

  {
    id: 3,

    reactants: [
      "Hydrochloric Acid",
      "Sodium Hydroxide",
    ],

    products: [
      "Sodium Chloride",
      "Water",
    ],

    equation:
      "HCl + NaOH → NaCl + H₂O",

    observation:
      "Temperature increases slightly and the solution becomes neutral.",

    energy: "Exothermic",

    type: "Neutralization",

    gas: false,

    precipitate: false,

    color: "#22c55e",
  },

  /* =========================
        PRECIPITATION
  ========================= */

  {
    id: 4,

    reactants: [
      "Silver Nitrate",
      "Sodium Chloride",
    ],

    products: [
      "Silver Chloride",
      "Sodium Nitrate",
    ],

    equation:
      "AgNO₃ + NaCl → AgCl↓ + NaNO₃",

    observation:
      "A thick white precipitate forms instantly.",

    energy: "Neutral",

    type: "Precipitation",

    gas: false,

    precipitate: true,

    color: "#ffffff",
  },

  /* =========================
        GAS EVOLUTION
  ========================= */

  {
    id: 5,

    reactants: [
      "Hydrochloric Acid",
      "Calcium Carbonate",
    ],

    products: [
      "Calcium Chloride",
      "Carbon Dioxide",
      "Water",
    ],

    equation:
      "2HCl + CaCO₃ → CaCl₂ + CO₂ + H₂O",

    observation:
      "Rapid bubbling occurs as carbon dioxide gas is released.",

    energy: "Neutral",

    type: "Gas Evolution",

    gas: true,

    precipitate: false,

    color: "#38bdf8",
  },

  /* =========================
        SINGLE DISPLACEMENT
  ========================= */

  {
    id: 6,

    reactants: [
      "Iron",
      "Copper Sulfate",
    ],

    products: [
      "Iron Sulfate",
      "Copper",
    ],

    equation:
      "Fe + CuSO₄ → FeSO₄ + Cu",

    observation:
      "Copper deposits on the iron surface while the blue solution fades green.",

    energy: "Neutral",

    type: "Displacement",

    gas: false,

    precipitate: true,

    color: "#4ade80",
  },

  /* =========================
        DOUBLE DISPLACEMENT
  ========================= */

  {
    id: 7,

    reactants: [
      "Lead Nitrate",
      "Potassium Iodide",
    ],

    products: [
      "Lead Iodide",
      "Potassium Nitrate",
    ],

    equation:
      "Pb(NO₃)₂ + 2KI → PbI₂ + 2KNO₃",

    observation:
      "A brilliant yellow precipitate forms immediately.",

    energy: "Neutral",

    type: "Double Displacement",

    gas: false,

    precipitate: true,

    color: "#fde047",
  },

  /* =========================
        DECOMPOSITION
  ========================= */

  {
    id: 8,

    reactants: [
      "Hydrogen Peroxide",
    ],

    products: [
      "Water",
      "Oxygen",
    ],

    equation:
      "2H₂O₂ → 2H₂O + O₂",

    observation:
      "Oxygen bubbles are released as hydrogen peroxide decomposes.",

    energy: "Endothermic",

    type: "Decomposition",

    gas: true,

    precipitate: false,

    color: "#38bdf8",
  },

  /* =========================
        SYNTHESIS
  ========================= */

  {
    id: 9,

    reactants: [
      "Sodium",
      "Chlorine",
    ],

    products: [
      "Sodium Chloride",
    ],

    equation:
      "2Na + Cl₂ → 2NaCl",

    observation:
      "A bright yellow flame forms producing white sodium chloride crystals.",

    energy: "Exothermic",

    type: "Synthesis",

    gas: false,

    precipitate: true,

    color: "#ffffff",
  },

  /* =========================
        NO REACTION SAMPLE
  ========================= */

  {
    id: 10,

    reactants: [
      "Copper",
      "Water",
    ],

    products: [],

    equation:
      "No Reaction",

    observation:
      "Copper does not react with water under normal conditions.",

    energy: "None",

    type: "None",

    gas: false,

    precipitate: false,

    color: "#94a3b8",
  },

];

export default reactions;