// src/utils/acidBase/math.js

/**
 * ============================================================
 * STUDY AI
 * Acid vs Base Math Utilities
 * ------------------------------------------------------------
 * Mathematical helper functions used by the simulation.
 * ============================================================
 */

/* ============================================================
    Round
============================================================ */

export const round = (value, decimals = 2) => {
  return Number(Number(value).toFixed(decimals));
};

/* ============================================================
    Clamp
============================================================ */

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/* ============================================================
    Linear Interpolation
============================================================ */

export const lerp = (start, end, t) => {
  return start + (end - start) * t;
};

/* ============================================================
    Map Range
============================================================ */

export const mapRange = (
  value,
  inMin,
  inMax,
  outMin,
  outMax
) => {
  return (
    ((value - inMin) * (outMax - outMin)) /
      (inMax - inMin) +
    outMin
  );
};

/* ============================================================
    Percentage
============================================================ */

export const percentage = (value, total) => {
  if (total === 0) return 0;

  return round((value / total) * 100);
};

/* ============================================================
    Distance
============================================================ */

export const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(
    (x2 - x1) ** 2 +
      (y2 - y1) ** 2
  );
};

/* ============================================================
    Random Number
============================================================ */

export const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

/* ============================================================
    Random Integer
============================================================ */

export const randomInt = (min, max) => {
  return Math.floor(random(min, max + 1));
};

/* ============================================================
    Random Float
============================================================ */

export const randomFloat = (min, max) => {
  return round(random(min, max), 2);
};

/* ============================================================
    pH from H+
============================================================ */

export const calculatePH = (
  hydrogenIonConcentration
) => {
  if (hydrogenIonConcentration <= 0)
    return 7;

  return clamp(
    round(
      -Math.log10(
        hydrogenIonConcentration
      )
    ),
    0,
    14
  );
};

/* ============================================================
    pOH from OH-
============================================================ */

export const calculatePOH = (
  hydroxideConcentration
) => {
  if (hydroxideConcentration <= 0)
    return 7;

  return clamp(
    round(
      -Math.log10(
        hydroxideConcentration
      )
    ),
    0,
    14
  );
};

/* ============================================================
    pOH → pH
============================================================ */

export const pOHtoPH = (poh) => {
  return round(14 - poh);
};

/* ============================================================
    pH → pOH
============================================================ */

export const pHtoPOH = (ph) => {
  return round(14 - ph);
};

/* ============================================================
    Average
============================================================ */

export const average = (values = []) => {
  if (!values.length) return 0;

  return round(
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
};

/* ============================================================
    Normalize
============================================================ */

export const normalize = (
  value,
  min,
  max
) => {
  if (max === min) return 0;

  return (value - min) / (max - min);
};

/* ============================================================
    Ease In-Out
============================================================ */

export const easeInOut = (t) => {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
};

/* ============================================================
    Bubble Velocity
============================================================ */

export const bubbleVelocity = (
  temperature = 25
) => {
  return round(
    mapRange(
      clamp(temperature, 0, 100),
      0,
      100,
      0.5,
      3
    )
  );
};

/* ============================================================
    Heat Intensity
============================================================ */

export const heatIntensity = (
  temperature
) => {
  return round(
    normalize(
      clamp(temperature, 0, 100),
      0,
      100
    )
  );
};

/* ============================================================
    Reaction Progress
============================================================ */

export const reactionProgress = (
  elapsed,
  duration
) => {
  return clamp(
    percentage(elapsed, duration),
    0,
    100
  );
};

/* ============================================================
    Export
============================================================ */

export default {
  round,
  clamp,
  lerp,
  mapRange,
  percentage,
  distance,
  random,
  randomInt,
  randomFloat,
  calculatePH,
  calculatePOH,
  pOHtoPH,
  pHtoPOH,
  average,
  normalize,
  easeInOut,
  bubbleVelocity,
  heatIntensity,
  reactionProgress,
};