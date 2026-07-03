// src/components/simulation/ColorEngine.jsx

/**
 * ===========================================================
 * TITRATION COLOR ENGINE
 * -----------------------------------------------------------
 * Determines:
 *  • Solution colour before endpoint
 *  • Solution colour at endpoint
 *  • Solution colour after endpoint
 *  • Indicator transition
 *  • Approximate pH colour
 * ===========================================================
 */

const indicators = {
  Phenolphthalein: {
    acid: "#FFFFFF", // Colourless
    endpoint: "#F8BBD0", // Pale Pink
    base: "#EC4899", // Pink
    transitionPH: 8.3,
  },

  "Methyl Orange": {
    acid: "#EF4444", // Red
    endpoint: "#F97316", // Orange
    base: "#FACC15", // Yellow
    transitionPH: 3.7,
  },

  "Methyl Red": {
    acid: "#DC2626", // Red
    endpoint: "#FB923C", // Orange
    base: "#FACC15", // Yellow
    transitionPH: 5.1,
  },

  "Bromothymol Blue": {
    acid: "#FACC15", // Yellow
    endpoint: "#22C55E", // Green
    base: "#2563EB", // Blue
    transitionPH: 7.0,
  },

  Litmus: {
    acid: "#DC2626", // Red
    endpoint: "#8B5CF6", // Purple
    base: "#2563EB", // Blue
    transitionPH: 7.0,
  },
};

/**
 * Returns colour according to progress.
 * progress = 0 → beginning
 * progress = 1 → endpoint
 * progress >1 → excess titrant
 */

export function getIndicatorColor(
  indicator,
  progress = 0
) {
  const data =
    indicators[indicator] ||
    indicators["Phenolphthalein"];

  if (progress < 0.98) {
    return data.acid;
  }

  if (progress >= 0.98 && progress <= 1.02) {
    return data.endpoint;
  }

  return data.base;
}

/**
 * Returns colour from pH.
 */

export function getPHColor(ph) {
  if (ph <= 2) return "#DC2626";

  if (ph <= 4) return "#F97316";

  if (ph <= 6) return "#FACC15";

  if (ph <= 8) return "#22C55E";

  if (ph <= 10) return "#3B82F6";

  if (ph <= 12) return "#2563EB";

  return "#7C3AED";
}

/**
 * Calculates simple titration progress.
 */

export function getProgress(
  currentVolume,
  endpointVolume
) {
  if (endpointVolume === 0) return 0;

  return currentVolume / endpointVolume;
}

/**
 * Complete helper
 */

export function getSolutionColor({
  indicator = "Phenolphthalein",
  currentVolume = 0,
  endpointVolume = 25,
}) {
  const progress = getProgress(
    currentVolume,
    endpointVolume
  );

  return getIndicatorColor(
    indicator,
    progress
  );
}

/**
 * Indicator list
 */

export function getIndicatorList() {
  return Object.keys(indicators);
}

/**
 * Indicator information
 */

export function getIndicator(indicator) {
  return (
    indicators[indicator] ||
    indicators["Phenolphthalein"]
  );
}

export default {
  getIndicatorColor,
  getPHColor,
  getProgress,
  getSolutionColor,
  getIndicatorList,
  getIndicator,
};