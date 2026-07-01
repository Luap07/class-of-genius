// src/engine/acidBase/IndicatorEngine.js

import indicators from "../../data/acidBase/indicators";

class IndicatorEngine {
  constructor() {
    this.indicators = indicators;
  }

  /* =====================================================
      Find Indicator
  ===================================================== */

  getIndicator(name = "") {
    return this.indicators.find(
      (indicator) =>
        indicator.name.toLowerCase() ===
        name.toLowerCase()
    );
  }

  /* =====================================================
      Determine Color
  ===================================================== */

  getColor(indicatorName, ph = 7) {
    const indicator =
      this.getIndicator(indicatorName);

    if (!indicator)
      return {
        color: "#64748b",
        state: "Unknown",
      };

    switch (indicator.name) {
      case "Litmus":
        if (ph < 7)
          return {
            color: "#dc2626",
            state: "Acidic",
          };

        if (ph > 7)
          return {
            color: "#2563eb",
            state: "Basic",
          };

        return {
          color: "#7c3aed",
          state: "Neutral",
        };

      case "Phenolphthalein":
        if (ph >= 8.2)
          return {
            color: "#ec4899",
            state: "Pink",
          };

        return {
          color: "#ffffff",
          state: "Colorless",
        };

      case "Methyl Orange":
        if (ph < 3.1)
          return {
            color: "#dc2626",
            state: "Red",
          };

        if (ph > 4.4)
          return {
            color: "#facc15",
            state: "Yellow",
          };

        return {
          color: "#fb923c",
          state: "Orange",
        };

      case "Universal Indicator":
        return {
          color:
            this.getUniversalColor(ph),
          state:
            this.getUniversalLabel(ph),
        };

      default:
        return {
          color: "#64748b",
          state: "Unknown",
        };
    }
  }

  /* =====================================================
      Universal Indicator
  ===================================================== */

  getUniversalColor(ph) {
    if (ph <= 2) return "#b91c1c";
    if (ph <= 4) return "#ea580c";
    if (ph <= 6) return "#facc15";
    if (ph === 7) return "#22c55e";
    if (ph <= 9) return "#38bdf8";
    if (ph <= 11) return "#2563eb";
    return "#7c3aed";
  }

  getUniversalLabel(ph) {
    if (ph <= 2)
      return "Strong Acid";

    if (ph <= 4)
      return "Weak Acid";

    if (ph <= 6)
      return "Slightly Acidic";

    if (ph === 7)
      return "Neutral";

    if (ph <= 9)
      return "Weak Base";

    if (ph <= 11)
      return "Base";

    return "Strong Base";
  }

  /* =====================================================
      Analyze
  ===================================================== */

  analyze(indicatorName, ph) {
    const result = this.getColor(
      indicatorName,
      ph
    );

    return {
      indicator: indicatorName,
      ph,
      color: result.color,
      state: result.state,
    };
  }

  /* =====================================================
      List Indicators
  ===================================================== */

  getAllIndicators() {
    return this.indicators;
  }

  /* =====================================================
      Exists
  ===================================================== */

  exists(name) {
    return !!this.getIndicator(name);
  }
}

const indicatorEngine =
  new IndicatorEngine();

export default indicatorEngine;
