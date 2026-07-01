// src/data/acidBase/colors.js

const colors = {
  /* =========================
      Solution Colors
  ========================= */

  strongAcid: "#dc2626",
  acid: "#ef4444",
  weakAcid: "#fb923c",

  neutral: "#22c55e",

  weakBase: "#38bdf8",
  base: "#2563eb",
  strongBase: "#1d4ed8",

  water: "#60a5fa",

  /* =========================
      Indicator Colors
  ========================= */

  indicators: {
    litmus: {
      acid: "#ef4444",
      neutral: "#7c3aed",
      base: "#2563eb",
    },

    phenolphthalein: {
      acid: "#ffffff",
      neutral: "#ffffff",
      base: "#ec4899",
    },

    methylOrange: {
      acid: "#ef4444",
      neutral: "#f97316",
      base: "#facc15",
    },

    universal: {
      strongAcid: "#b91c1c",
      acid: "#ef4444",
      weakAcid: "#f97316",
      neutral: "#22c55e",
      weakBase: "#38bdf8",
      base: "#2563eb",
      strongBase: "#4c1d95",
    },
  },

  /* =========================
      UI Colors
  ========================= */

  ui: {
    background: "#020617",
    panel: "#0f172a",
    panelLight: "#1e293b",

    border: "#334155",

    success: "#22c55e",
    warning: "#facc15",
    danger: "#ef4444",

    text: "#f8fafc",
    textSecondary: "#94a3b8",
  },

  /* =========================
      Reaction Effects
  ========================= */

  effects: {
    bubbles: "#e0f2fe",
    steam: "#e5e7eb",
    heat: "#fb7185",
    glow: "#fde047",
    neutralization: "#14b8a6",
  },

  /* =========================
      pH Color Scale
  ========================= */

  phScale: {
    0: "#7f1d1d",
    1: "#991b1b",
    2: "#b91c1c",
    3: "#dc2626",
    4: "#ef4444",
    5: "#fb923c",
    6: "#facc15",
    7: "#22c55e",
    8: "#4ade80",
    9: "#38bdf8",
    10: "#0ea5e9",
    11: "#2563eb",
    12: "#1d4ed8",
    13: "#4338ca",
    14: "#581c87",
  },

  /* =========================
      Helper Function
  ========================= */

  getPHColor(ph = 7) {
    const rounded = Math.round(ph);

    return (
      this.phScale[rounded] ||
      this.neutral
    );
  },
};

export default colors;