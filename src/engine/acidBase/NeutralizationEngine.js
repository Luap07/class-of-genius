// src/engine/acidBase/NeutralizationEngine.js

import AcidBaseEngine from "./AcidBaseEngine";
import PHCalculator from "./PHCalculator";
import IndicatorEngine from "./IndicatorEngine";

class NeutralizationEngine {
  constructor() {
    this.acidBaseEngine = AcidBaseEngine;
    this.phCalculator = PHCalculator;
    this.indicatorEngine = IndicatorEngine;
  }

  /* =====================================================
      Run Neutralization
  ===================================================== */

  run({
    acid = null,
    base = null,
    indicator = "Litmus",
  }) {
    if (!acid || !base) {
      return {
        success: false,
        message: "Select an acid and a base.",
        equation: "",
        products: [],
        ph: 7,
        observation: "Waiting for reactants...",
        indicator: null,
      };
    }

    // Find reaction
    const reaction =
      this.acidBaseEngine.react(acid, base);

    // Calculate pH
    const ph =
      this.phCalculator.mix(acid, base);

    // Indicator result
    const indicatorResult =
      this.indicatorEngine.analyze(
        indicator,
        ph
      );

    return {
      success: reaction.success,

      acid,

      base,

      products:
        reaction.products || [],

      equation:
        reaction.equation || "",

      observation:
        reaction.observation ||
        "No observation.",

      energy:
        reaction.energy ||
        "Neutral",

      temperature:
        reaction.temperature || 25,

      color:
        reaction.color ||
        "#22c55e",

      ph,

      indicator:
        indicatorResult,

      resultColor:
        indicatorResult.color,
    };
  }

  /* =====================================================
      Can Neutralize?
  ===================================================== */

  canNeutralize(acid, base) {
    if (!acid || !base)
      return false;

    return (
      acid.type === "Acid" &&
      base.type === "Base"
    );
  }

  /* =====================================================
      Observation
  ===================================================== */

  getObservation(result) {
    if (!result.success)
      return "No reaction.";

    return result.observation;
  }

  /* =====================================================
      Products
  ===================================================== */

  getProducts(result) {
    return result.products || [];
  }

  /* =====================================================
      Equation
  ===================================================== */

  getEquation(result) {
    return result.equation || "";
  }

  /* =====================================================
      pH
  ===================================================== */

  getPH(result) {
    return result.ph;
  }

  /* =====================================================
      Indicator
  ===================================================== */

  getIndicator(result) {
    return result.indicator;
  }

  /* =====================================================
      Summary
  ===================================================== */

  summarize(result) {
    return {
      equation: result.equation,
      products: result.products,
      observation: result.observation,
      ph: result.ph,
      energy: result.energy,
      indicator:
        result.indicator?.state,
    };
  }
}

const neutralizationEngine =
  new NeutralizationEngine();

export default neutralizationEngine;