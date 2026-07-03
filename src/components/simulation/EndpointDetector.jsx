// src/components/simulation/EndpointDetector.jsx

/**
 * ==========================================================
 * EndpointDetector.jsx
 * ----------------------------------------------------------
 * Chemistry engine for the Virtual Titration Lab
 *
 * Calculates:
 * • Moles
 * • Equivalence volume
 * • Endpoint detection
 * • pH approximation
 * • Accuracy (%)
 * • Result object
 * ==========================================================
 */

/**
 * Calculate moles
 * n = C × V
 * Volume supplied in mL
 */
export const calculateMoles = (
  concentration,
  volume
) => {
  return concentration * (volume / 1000);
};

/**
 * Calculate required titrant volume
 * CaVa = CbVb
 */
export const calculateEndpointVolume = ({
  acidConcentration,
  acidVolume,
  baseConcentration,
  ratio = 1,
}) => {
  if (baseConcentration <= 0) return 0;

  return (
    (acidConcentration * acidVolume) /
    (baseConcentration * ratio)
  );
};

/**
 * Check if endpoint has been reached
 */
export const detectEndpoint = ({
  titrantAdded,
  endpointVolume,
  tolerance = 0.05,
}) => {
  return (
    Math.abs(titrantAdded - endpointVolume) <=
    tolerance
  );
};

/**
 * Estimate pH during titration
 * (Simple educational model)
 */
export const estimatePH = ({
  titrantAdded,
  endpointVolume,
}) => {
  const ratio =
    endpointVolume === 0
      ? 0
      : titrantAdded / endpointVolume;

  if (ratio < 0.2) return 1.2;
  if (ratio < 0.4) return 2.3;
  if (ratio < 0.6) return 3.8;
  if (ratio < 0.8) return 5.1;
  if (ratio < 0.95) return 6.4;
  if (ratio < 1.02) return 7.0;
  if (ratio < 1.1) return 8.5;
  if (ratio < 1.3) return 10.3;

  return 12.4;
};

/**
 * Accuracy of experiment
 */
export const calculateAccuracy = (
  measured,
  actual
) => {
  if (actual === 0) return 100;

  const error =
    Math.abs(measured - actual) / actual;

  return Number(
    ((1 - error) * 100).toFixed(2)
  );
};

/**
 * Run complete titration calculation
 */
export const runTitration = ({
  acidConcentration,
  acidVolume,

  baseConcentration,

  titrantAdded,

  ratio = 1,
}) => {
  const endpointVolume =
    calculateEndpointVolume({
      acidConcentration,
      acidVolume,
      baseConcentration,
      ratio,
    });

  const endpointReached =
    detectEndpoint({
      titrantAdded,
      endpointVolume,
    });

  const acidMoles = calculateMoles(
    acidConcentration,
    acidVolume
  );

  const baseMoles = calculateMoles(
    baseConcentration,
    titrantAdded
  );

  const ph = estimatePH({
    titrantAdded,
    endpointVolume,
  });

  const accuracy =
    calculateAccuracy(
      titrantAdded,
      endpointVolume
    );

  return {
    acidMoles,
    baseMoles,

    endpointVolume,

    titrantAdded,

    endpointReached,

    ph,

    accuracy,
  };
};

export default runTitration;