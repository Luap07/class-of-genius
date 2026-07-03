// src/engine/acidBase/AcidBaseEngine.js

import reactions from "../../data/acidBase/reactions";

class AcidBaseEngine {
  constructor() {
    this.reactions = reactions;
  }

  /* =====================================================
      Normalize Names
  ===================================================== */

  normalize(name = "") {
    return name.trim().toLowerCase();
  }

  /* =====================================================
      Find Matching Reaction
  ===================================================== */

  findReaction(acid, base) {
    if (!acid || !base) return null;

    return this.reactions.find((reaction) => {
      return (
        this.normalize(reaction.acid) ===
          this.normalize(acid.name) &&
        this.normalize(reaction.base) ===
          this.normalize(base.name)
      );
    });
  }

  /* =====================================================
      Run Neutralization
  ===================================================== */

  run(acid, base) {
    if (!acid || !base) {
      return {
        success: false,

        equation: "",

        products: [],

        observation:
          "Select one acid and one base.",

        ph: 7,

        energy: "None",

        color: "#64748b",

        bubbles: false,

        precipitate: false,

        heat: false,
      };
    }

    const reaction = this.findReaction(acid, base);
    console.log("Reaction Found:", reaction);

    if (!reaction) {
      return {
        success: false,

        equation: "No Reaction",

        products: [],

        observation:
          "These chemicals do not react in this simulation.",

        ph: 7,

        energy: "None",

        color: "#64748b",

        bubbles: false,

        precipitate: false,

        heat: false,
      };
    }

    return {
      success: true,

      equation: reaction.equation,

      products: reaction.products,

      observation:
        reaction.observation,

      ph: this.calculatePH(acid, base),

      energy:
        reaction.energy,

      color:
        reaction.color,

      bubbles:
        reaction.bubbles,

      precipitate:
        reaction.precipitate,

      heat:
        reaction.heat,

      reaction,
    };
  }

  /* =====================================================
      Product Helpers
  ===================================================== */

  getProducts(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.products
      : [];
  }

  getEquation(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.equation
      : "";
  }

  getObservation(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.observation
      : "No reaction.";
  }

  getPH(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.ph
      : 7;
  }

  getEnergy(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.energy
      : "None";
  }

  getColor(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.color
      : "#64748b";
  }

  createsBubbles(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.bubbles
      : false;
  }

  createsHeat(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.heat
      : false;
  }

  createsPrecipitate(acid, base) {
    const reaction =
      this.findReaction(acid, base);

    return reaction
      ? reaction.precipitate
      : false;
  }

  /* =====================================================
      pH Prediction
  ===================================================== */

  calculatePH(acid, base) {
  console.log("Acid strength:", acid.strength);
  console.log("Base strength:", base.strength);

  if (!acid || !base) return 7;

  }

  calculatePH(acid, base) {
  if (!acid || !base) return 7;

  // Strong acid + strong base
  if (acid.strength === "strong" && base.strength === "strong") {
    return 7;
  }

  // Strong acid + weak base
  if (acid.strength === "strong" && base.strength === "weak") {
    return 3;
  }

  // Weak acid + strong base
  if (acid.strength === "weak" && base.strength === "strong") {
    return 9;
  }

  // Weak acid + weak base
  return 7.5;
}

  /* =====================================================
      Simulation
  ===================================================== */

  simulate({
    acid,
    base,
    indicator,
    temperature = 25,
  }) {
    const result =
      this.run(acid, base);

    return {
      ...result,

      indicator,

      temperature,

      timestamp:
        Date.now(),
    };
  }
}

const acidBaseEngine =
  new AcidBaseEngine();

export default acidBaseEngine;