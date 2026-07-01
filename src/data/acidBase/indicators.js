// src/data/acidBase/indicators.js

const indicators = [
  {
    id: 1,
    name: "Litmus",

    description:
      "Turns red in acidic solutions and blue in basic solutions.",

    acidColor: "#ef4444",
    neutralColor: "#7c3aed",
    baseColor: "#2563eb",

    acidLabel: "Red",
    neutralLabel: "Purple",
    baseLabel: "Blue",

    transition: {
      acid: { max: 6.8 },
      neutral: { min: 6.8, max: 7.2 },
      base: { min: 7.2 },
    },
  },

  {
    id: 2,
    name: "Phenolphthalein",

    description:
      "Colorless in acidic solutions and pink in alkaline solutions.",

    acidColor: "#ffffff",
    neutralColor: "#ffffff",
    baseColor: "#ec4899",

    acidLabel: "Colorless",
    neutralLabel: "Colorless",
    baseLabel: "Pink",

    transition: {
      acid: { max: 8.2 },
      neutral: { min: 8.2, max: 8.5 },
      base: { min: 8.5 },
    },
  },

  {
    id: 3,
    name: "Methyl Orange",

    description:
      "Red in acids, orange near neutral, yellow in bases.",

    acidColor: "#ef4444",
    neutralColor: "#f97316",
    baseColor: "#facc15",

    acidLabel: "Red",
    neutralLabel: "Orange",
    baseLabel: "Yellow",

    transition: {
      acid: { max: 3.1 },
      neutral: { min: 3.1, max: 4.4 },
      base: { min: 4.4 },
    },
  },

  {
    id: 4,
    name: "Universal Indicator",

    description:
      "Displays a full spectrum of colors corresponding to pH values.",

    spectrum: [
      { ph: 0, color: "#7f1d1d", label: "Dark Red" },
      { ph: 1, color: "#991b1b", label: "Red" },
      { ph: 2, color: "#b91c1c", label: "Red" },
      { ph: 3, color: "#dc2626", label: "Orange-Red" },
      { ph: 4, color: "#ef4444", label: "Orange" },
      { ph: 5, color: "#fb923c", label: "Yellow-Orange" },
      { ph: 6, color: "#facc15", label: "Yellow" },
      { ph: 7, color: "#22c55e", label: "Green" },
      { ph: 8, color: "#4ade80", label: "Light Green" },
      { ph: 9, color: "#38bdf8", label: "Blue-Green" },
      { ph: 10, color: "#0ea5e9", label: "Blue" },
      { ph: 11, color: "#2563eb", label: "Deep Blue" },
      { ph: 12, color: "#1d4ed8", label: "Indigo" },
      { ph: 13, color: "#4338ca", label: "Purple" },
      { ph: 14, color: "#581c87", label: "Violet" },
    ],
  },

  {
    id: 5,
    name: "Bromothymol Blue",

    description:
      "Yellow in acids, green at neutral, blue in bases.",

    acidColor: "#facc15",
    neutralColor: "#22c55e",
    baseColor: "#2563eb",

    acidLabel: "Yellow",
    neutralLabel: "Green",
    baseLabel: "Blue",

    transition: {
      acid: { max: 6.0 },
      neutral: { min: 6.0, max: 7.6 },
      base: { min: 7.6 },
    },
  },

  {
    id: 6,
    name: "Methyl Red",

    description:
      "Red in acidic solution and yellow in basic solution.",

    acidColor: "#dc2626",
    neutralColor: "#f97316",
    baseColor: "#facc15",

    acidLabel: "Red",
    neutralLabel: "Orange",
    baseLabel: "Yellow",

    transition: {
      acid: { max: 4.4 },
      neutral: { min: 4.4, max: 6.2 },
      base: { min: 6.2 },
    },
  },
];

export default indicators;