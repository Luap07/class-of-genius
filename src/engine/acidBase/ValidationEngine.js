// src/engine/acidBase/ValidationEngine.js

class ValidationEngine {
  constructor() {
    this.maxVolume = 1000; // mL
    this.minVolume = 1;
    this.maxTemperature = 150; // °C
    this.minTemperature = 0;
  }

  /* ===========================================
      ACID VALIDATION
  =========================================== */

  validateAcid(acid) {
    if (!acid) {
      return {
        valid: false,
        message: "Please select an acid.",
      };
    }

    if (acid.type !== "Acid") {
      return {
        valid: false,
        message: "Selected chemical is not an acid.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  /* ===========================================
      BASE VALIDATION
  =========================================== */

  validateBase(base) {
    if (!base) {
      return {
        valid: false,
        message: "Please select a base.",
      };
    }

    if (base.type !== "Base") {
      return {
        valid: false,
        message: "Selected chemical is not a base.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  /* ===========================================
      VOLUME
  =========================================== */

  validateVolume(volume) {
    if (volume == null || isNaN(volume)) {
      return {
        valid: false,
        message: "Invalid volume.",
      };
    }

    if (volume < this.minVolume) {
      return {
        valid: false,
        message: `Volume must be at least ${this.minVolume} mL.`,
      };
    }

    if (volume > this.maxVolume) {
      return {
        valid: false,
        message: `Maximum volume is ${this.maxVolume} mL.`,
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  /* ===========================================
      TEMPERATURE
  =========================================== */

  validateTemperature(temp) {
    if (temp == null || isNaN(temp)) {
      return {
        valid: false,
        message: "Invalid temperature.",
      };
    }

    if (temp < this.minTemperature) {
      return {
        valid: false,
        message: "Temperature is too low.",
      };
    }

    if (temp > this.maxTemperature) {
      return {
        valid: false,
        message: "Temperature exceeds safe laboratory limit.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  /* ===========================================
      INDICATOR
  =========================================== */

  validateIndicator(indicator) {
    if (!indicator) {
      return {
        valid: false,
        message: "Select an indicator.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  /* ===========================================
      COMPLETE LAB VALIDATION
  =========================================== */

  validateExperiment({
    acid,
    base,
    acidVolume = 50,
    baseVolume = 50,
    temperature = 25,
    indicator,
  }) {
    const acidCheck =
      this.validateAcid(acid);

    if (!acidCheck.valid) return acidCheck;

    const baseCheck =
      this.validateBase(base);

    if (!baseCheck.valid) return baseCheck;

    const acidVol =
      this.validateVolume(acidVolume);

    if (!acidVol.valid) return acidVol;

    const baseVol =
      this.validateVolume(baseVolume);

    if (!baseVol.valid) return baseVol;

    const temp =
      this.validateTemperature(
        temperature
      );

    if (!temp.valid) return temp;

    const indicatorCheck =
      this.validateIndicator(
        indicator
      );

    if (!indicatorCheck.valid)
      return indicatorCheck;

    return {
      valid: true,
      message: "Experiment ready.",
    };
  }

  /* ===========================================
      RESET
  =========================================== */

  reset() {
    return {
      valid: true,
      message: "",
    };
  }
}

const validationEngine =
  new ValidationEngine();

export default validationEngine;