// src/engine/chemicalReaction/ValidationEngine.js

class ValidationEngine {
  constructor() {
    this.maxReactants = 2;
  }

  /* ============================
      BASIC VALIDATION
  ============================ */

  validate(reactants = []) {
    if (!Array.isArray(reactants)) {
      return this.error("Invalid reactant list.");
    }

    if (reactants.length === 0) {
      return this.error("Select at least one reactant.");
    }

    if (reactants.length > this.maxReactants) {
      return this.error(
        `Maximum ${this.maxReactants} reactants allowed.`
      );
    }

    return this.success();
  }

  /* ============================
      REMOVE DUPLICATES
  ============================ */

  removeDuplicates(reactants = []) {
    const seen = new Set();

    return reactants.filter((item) => {
      const key = item.name;

      if (seen.has(key)) return false;

      seen.add(key);

      return true;
    });
  }

  /* ============================
      SAME CHEMICAL
  ============================ */

  containsSameChemical(reactants = []) {
    const names = reactants.map((r) => r.name);

    return new Set(names).size !== names.length;
  }

  /* ============================
      CHECK REACTIVITY
  ============================ */

  canReact(reactants = []) {
    if (reactants.length < 2)
      return this.error(
        "Two reactants required."
      );

    return this.success();
  }

  /* ============================
      TEMPERATURE
  ============================ */

  validateTemperature(temp) {
    if (temp < -273)
      return this.error(
        "Temperature below absolute zero."
      );

    if (temp > 3000)
      return this.error(
        "Temperature exceeds simulation limit."
      );

    return this.success();
  }

  /* ============================
      PRESSURE
  ============================ */

  validatePressure(pressure = 1) {
    if (pressure <= 0) {
      return this.error(
        "Invalid pressure."
      );
    }

    return this.success();
  }

  /* ============================
      PH RANGE
  ============================ */

  validatePH(ph = 7) {
    if (ph < 0 || ph > 14)
      return this.error(
        "pH must be between 0 and 14."
      );

    return this.success();
  }

  /* ============================
      CHECK REACTION CONDITIONS
  ============================ */

  validateConditions({
    temperature = 25,
    pressure = 1,
    ph = 7,
  }) {
    const t =
      this.validateTemperature(
        temperature
      );

    if (!t.valid) return t;

    const p =
      this.validatePressure(
        pressure
      );

    if (!p.valid) return p;

    const h =
      this.validatePH(ph);

    if (!h.valid) return h;

    return this.success();
  }

  /* ============================
      SUCCESS
  ============================ */

  success() {
    return {
      valid: true,
      message: "",
    };
  }

  /* ============================
      ERROR
  ============================ */

  error(message) {
    return {
      valid: false,
      message,
    };
  }
}

const validationEngine =
  new ValidationEngine();

export default validationEngine;