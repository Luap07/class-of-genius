// src/utils/acidBase/constants.js

/**
 * ============================================================
 * STUDY AI
 * Acid vs Base Constants
 * ------------------------------------------------------------
 * Global constants shared across the Acid vs Base simulation.
 * ============================================================
 */

/* ============================================================
    pH
============================================================ */

export const PH = {
  MIN: 0,
  MAX: 14,
  NEUTRAL: 7,
};

/* ============================================================
    Temperature (°C)
============================================================ */

export const TEMPERATURE = {
  MIN: 0,
  DEFAULT: 25,
  MAX: 100,
};

/* ============================================================
    Volume (mL)
============================================================ */

export const VOLUME = {
  MIN: 10,
  DEFAULT: 50,
  MAX: 250,
};

/* ============================================================
    Animation
============================================================ */

export const ANIMATION = {
  DEFAULT_SPEED: 1,
  MIN_SPEED: 0.5,
  MAX_SPEED: 4,

  PARTICLE_COUNT: 30,
  BUBBLE_COUNT: 20,
  HEAT_PARTICLES: 15,

  DURATION: 3000,
};

/* ============================================================
    Solution States
============================================================ */

export const SOLUTION_STATE = {
  IDLE: "idle",
  MIXING: "mixing",
  REACTING: "reacting",
  COMPLETE: "complete",
};

/* ============================================================
    Energy Types
============================================================ */

export const ENERGY = {
  EXOTHERMIC: "Exothermic",
  ENDOTHERMIC: "Endothermic",
  NEUTRAL: "Neutral",
};

/* ============================================================
    Indicator Types
============================================================ */

export const INDICATORS = [
  "Litmus",
  "Phenolphthalein",
  "Methyl Orange",
  "Universal Indicator",
];

/* ============================================================
    Chemical Types
============================================================ */

export const CHEMICAL_TYPES = {
  ACID: "Acid",
  BASE: "Base",
  SALT: "Salt",
  WATER: "Water",
};

/* ============================================================
    Default Products
============================================================ */

export const DEFAULT_PRODUCTS = [
  {
    name: "Water",
    formula: "H₂O",
    type: "Water",
  },
  {
    name: "Salt",
    formula: "NaCl",
    type: "Salt",
  },
];

/* ============================================================
    Observation Messages
============================================================ */

export const OBSERVATIONS = {
  READY: "Select an acid and a base.",

  MIXING: "Mixing solutions...",

  REACTION:
    "Neutralization reaction is occurring.",

  COMPLETE:
    "Reaction completed successfully.",

  NO_REACTION:
    "No observable reaction occurred.",
};

/* ============================================================
    Colors
============================================================ */

export const COLORS = {
  ACID: "#ef4444",

  BASE: "#3b82f6",

  WATER: "#38bdf8",

  SALT: "#f8fafc",

  SUCCESS: "#22c55e",

  WARNING: "#f59e0b",

  ERROR: "#dc2626",

  BACKGROUND: "#0f172a",
};

/* ============================================================
    Bubble Effect
============================================================ */

export const BUBBLE = {
  MIN_RADIUS: 4,
  MAX_RADIUS: 10,
  LIFE: 100,
};

/* ============================================================
    Heat Effect
============================================================ */

export const HEAT = {
  PARTICLES: 12,
  MAX_RADIUS: 35,
};

/* ============================================================
    Toolbar Buttons
============================================================ */

export const TOOLS = [
  "Mix",
  "Reset",
  "Heat",
  "Cool",
  "Measure pH",
];

/* ============================================================
    Export Default
============================================================ */

export default {
  PH,
  TEMPERATURE,
  VOLUME,
  ANIMATION,
  SOLUTION_STATE,
  ENERGY,
  INDICATORS,
  CHEMICAL_TYPES,
  DEFAULT_PRODUCTS,
  OBSERVATIONS,
  COLORS,
  BUBBLE,
  HEAT,
  TOOLS,
};