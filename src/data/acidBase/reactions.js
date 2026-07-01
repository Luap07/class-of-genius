// src/data/acidBase/reactions.js

const reactions = [
  {
    id: 1,

    acid: "Hydrochloric Acid",
    base: "Sodium Hydroxide",

    acidFormula: "HCl",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
        state: "Liquid",
      },
      {
        name: "Sodium Chloride",
        formula: "NaCl",
        state: "Aqueous",
      },
    ],

    equation: "HCl + NaOH → NaCl + H₂O",

    observation:
      "The solution warms slightly as water and sodium chloride are produced.",

    energy: "Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 2,

    acid: "Hydrochloric Acid",
    base: "Potassium Hydroxide",

    acidFormula: "HCl",
    baseFormula: "KOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Potassium Chloride",
        formula: "KCl",
      },
    ],

    equation: "HCl + KOH → KCl + H₂O",

    observation:
      "Neutralization occurs with a noticeable temperature increase.",

    energy: "Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 3,

    acid: "Sulfuric Acid",
    base: "Sodium Hydroxide",

    acidFormula: "H₂SO₄",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Sodium Sulfate",
        formula: "Na₂SO₄",
      },
    ],

    equation: "H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O",

    observation:
      "The beaker becomes noticeably warm because the reaction releases heat.",

    energy: "Strongly Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 4,

    acid: "Nitric Acid",
    base: "Sodium Hydroxide",

    acidFormula: "HNO₃",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Sodium Nitrate",
        formula: "NaNO₃",
      },
    ],

    equation: "HNO₃ + NaOH → NaNO₃ + H₂O",

    observation:
      "A neutral salt solution is formed with mild heating.",

    energy: "Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 5,

    acid: "Acetic Acid",
    base: "Sodium Hydroxide",

    acidFormula: "CH₃COOH",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Sodium Acetate",
        formula: "CH₃COONa",
      },
    ],

    equation: "CH₃COOH + NaOH → CH₃COONa + H₂O",

    observation:
      "The weak acid is neutralized producing sodium acetate.",

    energy: "Slightly Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 6,

    acid: "Citric Acid",
    base: "Sodium Hydroxide",

    acidFormula: "C₆H₈O₇",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Sodium Citrate",
        formula: "Na₃C₆H₅O₇",
      },
    ],

    equation:
      "C₆H₈O₇ + 3NaOH → Na₃C₆H₅O₇ + 3H₂O",

    observation:
      "The acidic solution gradually becomes neutral.",

    energy: "Mildly Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: false,
    precipitate: false,
    heat: true,
  },

  {
    id: 7,

    acid: "Carbonic Acid",
    base: "Sodium Hydroxide",

    acidFormula: "H₂CO₃",
    baseFormula: "NaOH",

    products: [
      {
        name: "Water",
        formula: "H₂O",
      },
      {
        name: "Sodium Carbonate",
        formula: "Na₂CO₃",
      },
    ],

    equation:
      "H₂CO₃ + 2NaOH → Na₂CO₃ + 2H₂O",

    observation:
      "Small bubbles disappear as the acid is neutralized.",

    energy: "Exothermic",

    ph: 7,

    color: "#22c55e",

    bubbles: true,
    precipitate: false,
    heat: true,
  },

  /* ==========================
        NO REACTION
  ========================== */

  {
    id: 999,

    acid: "",
    base: "",

    products: [],

    equation: "No Reaction",

    observation:
      "Select one acid and one base to perform a neutralization reaction.",

    energy: "None",

    ph: 7,

    color: "#64748b",

    bubbles: false,
    precipitate: false,
    heat: false,
  },
];

export default reactions;