// src/utils/acidBase/helpers.js

/**
 * ============================================================
 * STUDY AI
 * Acid vs Base Helper Functions
 * ------------------------------------------------------------
 * Shared helper utilities used throughout the Acid/Base Lab.
 * ============================================================
 */

/* ============================================================
    Clamp Number
============================================================ */

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/* ============================================================
    Round Number
============================================================ */

export const round = (value, decimals = 2) => {
  return Number(Number(value).toFixed(decimals));
};

/* ============================================================
    Random Number
============================================================ */

export const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

/* ============================================================
    Normalize Name
============================================================ */

export const normalize = (text = "") => {
  return text.trim().toLowerCase();
};

/* ============================================================
    Compare Chemicals
============================================================ */

export const sameChemical = (a, b) => {
  if (!a || !b) return false;

  return normalize(a.name) === normalize(b.name);
};

/* ============================================================
    Get pH Label
============================================================ */

export const getPHLabel = (ph) => {
  if (ph <= 2) return "Strong Acid";

  if (ph <= 4) return "Weak Acid";

  if (ph < 7) return "Acid";

  if (ph === 7) return "Neutral";

  if (ph <= 10) return "Base";

  return "Strong Base";
};

/* ============================================================
    Universal Indicator Color
============================================================ */

export const getPHColor = (ph) => {
  if (ph <= 2) return "#dc2626";

  if (ph <= 4) return "#f97316";

  if (ph <= 6) return "#facc15";

  if (ph === 7) return "#22c55e";

  if (ph <= 10) return "#3b82f6";

  return "#7c3aed";
};

/* ============================================================
    Temperature Color
============================================================ */

export const getTemperatureColor = (temp) => {
  if (temp < 15) return "#38bdf8";

  if (temp < 35) return "#22c55e";

  if (temp < 60) return "#f59e0b";

  return "#ef4444";
};

/* ============================================================
    Generate ID
============================================================ */

export const generateId = () => {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
  );
};

/* ============================================================
    Delay
============================================================ */

export const sleep = (ms) => {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
};

/* ============================================================
    Shuffle Array
============================================================ */

export const shuffle = (array = []) => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

/* ============================================================
    Deep Copy
============================================================ */

export const clone = (object) => {
  return JSON.parse(JSON.stringify(object));
};

/* ============================================================
    Mix Colors (Simple)
============================================================ */

export const mixColors = (color1, color2) => {
  if (!color1) return color2;

  if (!color2) return color1;

  return color1;
};

/* ============================================================
    Format Equation
============================================================ */

export const formatEquation = (
  acid,
  base,
  products = []
) => {
  if (!acid || !base)
    return "Acid + Base → ?";

  const right =
    products.length > 0
      ? products
          .map((p) =>
            typeof p === "string"
              ? p
              : p.name
          )
          .join(" + ")
      : "?";

  return `${acid.formula} + ${base.formula} → ${right}`;
};

/* ============================================================
    Calculate Progress
============================================================ */

export const calculateProgress = (
  current,
  total
) => {
  if (total === 0) return 0;

  return round((current / total) * 100);
};

/* ============================================================
    Bubble Count
============================================================ */

export const bubbleCount = (
  strength = "weak"
) => {
  switch (strength.toLowerCase()) {
    case "strong":
      return 25;

    case "medium":
      return 15;

    case "weak":
    default:
      return 8;
  }
};

/* ============================================================
    Heat Level
============================================================ */

export const heatLevel = (temperature) => {
  if (temperature < 20) return "Cold";

  if (temperature < 35) return "Warm";

  if (temperature < 60) return "Hot";

  return "Very Hot";
};