// src/engine/chemicalReaction/ReactionEngine.js

/**
 * ==========================================================
 * STUDY AI
 * Chemical Reaction Engine
 * ----------------------------------------------------------
 * Handles:
 * • Reaction matching
 * • Product generation
 * • Observation text
 * • Energy changes
 * • Color changes
 * • Gas evolution
 * • Precipitate formation
 * ==========================================================
 */

import reactions from "../../data/chemicalReaction/reactions";

class ReactionEngine {
  constructor() {
    this.reactions = reactions || [];
  }

  /* =======================================================
      Normalize Reactants
  ======================================================= */

  normalizeReactants(reactants = []) {
    return reactants
      .map((r) => r.name)
      .sort()
      .join("+");
  }

  /* =======================================================
      Find Matching Reaction
  ======================================================= */

  findReaction(reactants = []) {
    const key = this.normalizeReactants(reactants);

    return this.reactions.find((reaction) => {
      const compare = [...reaction.reactants].sort().join("+");
      return compare === key;
    });
  }

  /* =======================================================
      Execute Reaction
  ======================================================= */

  runReaction(reactants = [], temperature = 25) {
    const reaction = this.findReaction(reactants);

    if (!reaction) {
      return {
        success: false,
        equation: "",
        products: [],
        observation:
          "No observable reaction occurred.",
        energy: "none",
        gas: false,
        precipitate: false,
        color: "#94a3b8",
      };
    }

    return {
      success: true,

      equation: reaction.equation,

      products: reaction.products,

      observation: reaction.observation,

      energy:
        reaction.energy || "neutral",

      gas:
        reaction.gas || false,

      precipitate:
        reaction.precipitate || false,

      color:
        reaction.color || "#38bdf8",

      temperature,

      reaction,
    };
  }

  /* =======================================================
      Temperature Effect
  ======================================================= */

  applyTemperature(result, temperature) {
    if (!result.success) return result;

    let speed = 1;

    if (temperature > 80) speed = 2;

    if (temperature > 150) speed = 3;

    if (temperature < 5) speed = 0.4;

    return {
      ...result,
      speed,
    };
  }

  /* =======================================================
      Complete Simulation
  ======================================================= */

  simulate({
    reactants = [],
    temperature = 25,
  }) {
    const result =
      this.runReaction(
        reactants,
        temperature
      );

    return this.applyTemperature(
      result,
      temperature
    );
  }

  /* =======================================================
      Helper
  ======================================================= */

  reactionExists(reactants = []) {
    return !!this.findReaction(
      reactants
    );
  }

  getProducts(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.products
      : [];
  }

  getEquation(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.equation
      : "";
  }

  getObservation(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.observation
      : "No reaction.";
  }

  getEnergy(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.energy
      : "none";
  }

  getColor(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.color
      : "#94a3b8";
  }

  createsGas(reactants = []) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.gas
      : false;
  }

  createsPrecipitate(
    reactants = []
  ) {
    const reaction =
      this.findReaction(reactants);

    return reaction
      ? reaction.precipitate
      : false;
  }
}


/* ==========================================================
    Export Singleton
========================================================== */

const engine = new ReactionEngine();

export default engine;