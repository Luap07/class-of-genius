// src/engine/acidBase/PHCalculator.js

class PHCalculator {
  /* =====================================================
      Convert Concentration → pH
  ===================================================== */

  calculateAcidPH(concentration = 1) {
    if (concentration <= 0) return 7;

    const ph = -Math.log10(concentration);

    return this.clamp(ph);
  }

  /* =====================================================
      Convert Concentration → pOH
  ===================================================== */

  calculateBasePH(concentration = 1) {
    if (concentration <= 0) return 7;

    const poh = -Math.log10(concentration);

    const ph = 14 - poh;

    return this.clamp(ph);
  }

  /* =====================================================
      Predict Final pH
  ===================================================== */

  mix(acid, base) {
    if (!acid && !base) return 7;

    if (acid && !base)
      return acid.ph ?? this.calculateAcidPH(acid.concentration);

    if (!acid && base)
      return base.ph ?? this.calculateBasePH(base.concentration);

    const acidStrength =
      acid.strength || "strong";

    const baseStrength =
      base.strength || "strong";

    if (
      acidStrength === "strong" &&
      baseStrength === "strong"
    )
      return 7;

    if (
      acidStrength === "strong" &&
      baseStrength === "weak"
    )
      return 5;

    if (
      acidStrength === "weak" &&
      baseStrength === "strong"
    )
      return 9;

    return 7;
  }

  /* =====================================================
      pH Classification
  ===================================================== */

  classify(ph) {
    if (ph < 3)
      return {
        label: "Strong Acid",
        color: "#dc2626",
      };

    if (ph < 7)
      return {
        label: "Weak Acid",
        color: "#f97316",
      };

    if (ph === 7)
      return {
        label: "Neutral",
        color: "#22c55e",
      };

    if (ph <= 11)
      return {
        label: "Weak Base",
        color: "#3b82f6",
      };

    return {
      label: "Strong Base",
      color: "#1d4ed8",
    };
  }

  /* =====================================================
      pH Color
  ===================================================== */

  getColor(ph) {
    return this.classify(ph).color;
  }

  /* =====================================================
      pH Description
  ===================================================== */

  getDescription(ph) {
    return this.classify(ph).label;
  }

  /* =====================================================
      Clamp
  ===================================================== */

  clamp(value) {
    if (value < 0) return 0;

    if (value > 14) return 14;

    return Number(value.toFixed(2));
  }

  /* =====================================================
      Universal Indicator Color
  ===================================================== */

  indicatorColor(ph) {
    if (ph <= 2) return "#dc2626"; // red
    if (ph <= 4) return "#ea580c"; // orange
    if (ph <= 6) return "#facc15"; // yellow
    if (ph === 7) return "#22c55e"; // green
    if (ph <= 9) return "#38bdf8"; // blue
    if (ph <= 11) return "#2563eb"; // dark blue
    return "#7c3aed"; // purple
  }

  /* =====================================================
      Full Analysis
  ===================================================== */

  analyze(acid, base) {
    const ph = this.mix(acid, base);

    return {
      ph,

      color: this.getColor(ph),

      indicatorColor: this.indicatorColor(ph),

      description: this.getDescription(ph),
    };
  }
}

const phCalculator = new PHCalculator();

export default phCalculator;