// src/pages/labs/chemistry/data/electrochemistry.js

/* =========================================================
   ELECTRODES DATA
========================================================= */

export const ELECTRODES = [
  {
    id: "mg",
    name: "Magnesium",
    symbol: "Mg",
    ion: "Mg²⁺",
    formula: "Mg(s)",
    electrolyte: "MgSO₄",
    color: "#94A3B8",
    potential: -2.37,
    electrons: 2,
    mass: 24.31,
    type: "metal",
    description:
      "Highly reactive metal with one of the lowest standard reduction potentials.",
  },

  {
    id: "al",
    name: "Aluminium",
    symbol: "Al",
    ion: "Al³⁺",
    formula: "Al(s)",
    electrolyte: "Al₂(SO₄)₃",
    color: "#CBD5E1",
    potential: -1.66,
    electrons: 3,
    mass: 26.98,
    type: "metal",
    description:
      "Lightweight metal commonly used in electrochemical demonstrations.",
  },

  {
    id: "zn",
    name: "Zinc",
    symbol: "Zn",
    ion: "Zn²⁺",
    formula: "Zn(s)",
    electrolyte: "ZnSO₄",
    color: "#9CA3AF",
    potential: -0.76,
    electrons: 2,
    mass: 65.38,
    type: "metal",
    description: "Common anode in Daniell cells.",
  },

  {
    id: "fe",
    name: "Iron",
    symbol: "Fe",
    ion: "Fe²⁺",
    formula: "Fe(s)",
    electrolyte: "FeSO₄",
    color: "#78716C",
    potential: -0.44,
    electrons: 2,
    mass: 55.85,
    type: "metal",
    description: "Moderately reactive transition metal.",
  },

  {
    id: "pb",
    name: "Lead",
    symbol: "Pb",
    ion: "Pb²⁺",
    formula: "Pb(s)",
    electrolyte: "Pb(NO₃)₂",
    color: "#6B7280",
    potential: -0.13,
    electrons: 2,
    mass: 207.2,
    type: "metal",
    description: "Heavy metal used in electrochemical experiments.",
  },

  {
    id: "h",
    name: "Hydrogen",
    symbol: "H₂",
    ion: "H⁺",
    formula: "H₂(g)",
    electrolyte: "HCl",
    color: "#F8FAFC",
    potential: 0.0,
    electrons: 2,
    mass: 2.016,
    type: "gas",
    description: "Standard Hydrogen Electrode (SHE).",
  },

  {
    id: "cu",
    name: "Copper",
    symbol: "Cu",
    ion: "Cu²⁺",
    formula: "Cu(s)",
    electrolyte: "CuSO₄",
    color: "#B45309",
    potential: 0.34,
    electrons: 2,
    mass: 63.55,
    type: "metal",
    description: "Common cathode in Daniell cells.",
  },

  {
    id: "ag",
    name: "Silver",
    symbol: "Ag",
    ion: "Ag⁺",
    formula: "Ag(s)",
    electrolyte: "AgNO₃",
    color: "#E5E7EB",
    potential: 0.8,
    electrons: 1,
    mass: 107.87,
    type: "metal",
    description: "Excellent electrical conductor with high reduction potential.",
  },

  {
    id: "pt",
    name: "Platinum",
    symbol: "Pt",
    ion: "Pt²⁺",
    formula: "Pt(s)",
    electrolyte: "H₂SO₄",
    color: "#D1D5DB",
    potential: 1.2,
    electrons: 2,
    mass: 195.08,
    type: "inert",
    description: "Inert electrode used when reaction does not involve a metal.",
  },

  {
    id: "graphite",
    name: "Graphite",
    symbol: "C",
    ion: "-",
    formula: "C(s)",
    electrolyte: "Any",
    color: "#1F2937",
    potential: null,
    electrons: 0,
    mass: 12.01,
    type: "inert",
    description: "Inert carbon electrode used in electrolysis.",
  },
];

/* =========================================================
   DEFAULT EXPERIMENT
========================================================= */

export const DEFAULT_CELL = {
  anode: "zn",
  cathode: "cu",
  anodeElectrolyte: "ZnSO₄",
  cathodeElectrolyte: "CuSO₄",
  saltBridge: "KNO₃",
};

/* =========================================================
   SALT BRIDGES
========================================================= */

export const SALT_BRIDGES = ["KNO₃", "NaNO₃", "NH₄NO₃", "KCl"];

/* =========================================================
   ELECTROLYTE OPTIONS (FIXED NAME)
========================================================= */

export const ELECTROLYTE_OPTIONS = [
  "ZnSO₄",
  "CuSO₄",
  "AgNO₃",
  "MgSO₄",
  "FeSO₄",
  "Pb(NO₃)₂",
  "Al₂(SO₄)₃",
  "H₂SO₄",
  "HCl",
  "NaCl",
  "KNO₃",
];

/* =========================================================
   PRESET EXPERIMENTS
========================================================= */

export const EXPERIMENTS = [
  {
    id: "daniell",
    name: "Daniell Cell",
    anode: "zn",
    cathode: "cu",
  },
  {
    id: "silverCopper",
    name: "Silver–Copper Cell",
    anode: "cu",
    cathode: "ag",
  },
  {
    id: "magnesiumCopper",
    name: "Magnesium–Copper Cell",
    anode: "mg",
    cathode: "cu",
  },
  {
    id: "ironCopper",
    name: "Iron–Copper Cell",
    anode: "fe",
    cathode: "cu",
  },
  {
    id: "leadCopper",
    name: "Lead–Copper Cell",
    anode: "pb",
    cathode: "cu",
  },
];