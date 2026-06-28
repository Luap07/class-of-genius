// src/engine/chemicalReaction/MoleculeEngine.js

class MoleculeEngine {
  constructor() {
    this.valency = {
      H: 1,
      O: 2,
      N: 3,
      C: 4,
      Cl: 1,
      Na: 1,
      K: 1,
      Ca: 2,
      Mg: 2,
      S: 2,
      P: 3,
      F: 1,
      Br: 1,
      I: 1,
    };

    this.molecules = {
      H2O: "Water",
      CO2: "Carbon Dioxide",
      CO: "Carbon Monoxide",
      O2: "Oxygen",
      H2: "Hydrogen",
      N2: "Nitrogen",
      NH3: "Ammonia",
      CH4: "Methane",
      HCl: "Hydrochloric Acid",
      NaCl: "Sodium Chloride",
      CaCO3: "Calcium Carbonate",
      H2O2: "Hydrogen Peroxide",
      CuSO4: "Copper Sulfate",
      AgNO3: "Silver Nitrate",
      PbI2: "Lead Iodide",
    };
  }

  /* ==========================
      Valency
  ========================== */

  getValency(symbol) {
    return this.valency[symbol] ?? 0;
  }

  isValidElement(symbol) {
    return symbol in this.valency;
  }

  /* ==========================
      Molecule Recognition
  ========================== */

  getFormula(atoms = []) {
    const count = {};

    atoms.forEach((atom) => {
      const symbol =
        typeof atom === "string"
          ? atom
          : atom.symbol;

      count[symbol] =
        (count[symbol] || 0) + 1;
    });

    return Object.keys(count)
      .sort()
      .map((key) =>
        count[key] === 1
          ? key
          : `${key}${count[key]}`
      )
      .join("");
  }

  getName(formula) {
    return (
      this.molecules[formula] ||
      "Unknown Molecule"
    );
  }

  identify(atoms = []) {
    const formula =
      this.getFormula(atoms);

    return {
      formula,
      name: this.getName(formula),
    };
  }

  /* ==========================
      Bond Counting
  ========================== */

  getBondOrder(type) {
    switch (type) {
      case "double":
        return 2;

      case "triple":
        return 3;

      default:
        return 1;
    }
  }

  calculateBondLoad(
    atomId,
    bonds = []
  ) {
    return bonds.reduce(
      (sum, bond) => {
        if (
          bond.from === atomId ||
          bond.to === atomId
        ) {
          return (
            sum +
            this.getBondOrder(
              bond.type
            )
          );
        }

        return sum;
      },
      0
    );
  }

  canCreateBond(
    atom,
    bonds,
    type = "single"
  ) {
    const used =
      this.calculateBondLoad(
        atom.id,
        bonds
      );

    const max =
      this.getValency(atom.symbol);

    return (
      used +
        this.getBondOrder(type) <=
      max
    );
  }

  /* ==========================
      Complete Validation
  ========================== */

  validateMolecule(
    atoms = [],
    bonds = []
  ) {
    for (const atom of atoms) {
      const used =
        this.calculateBondLoad(
          atom.id,
          bonds
        );

      const max =
        this.getValency(atom.symbol);

      if (used > max) {
        return {
          valid: false,
          message: `${atom.symbol} exceeds valency.`,
        };
      }
    }

    return {
      valid: true,
      message:
        "Valid molecular structure.",
    };
  }

  /* ==========================
      Formula Generator
  ========================== */

  generateFormula(atoms = []) {
    return this.getFormula(atoms);
  }

  /* ==========================
      Molecular Weight
      (Simple Demo)
  ========================== */

  getAtomicMass(symbol) {
    const masses = {
      H: 1.008,
      C: 12.011,
      N: 14.007,
      O: 15.999,
      Na: 22.99,
      Cl: 35.45,
      Ca: 40.08,
      K: 39.1,
      S: 32.06,
    };

    return masses[symbol] || 0;
  }

  molecularWeight(
    atoms = []
  ) {
    return atoms
      .reduce(
        (sum, atom) =>
          sum +
          this.getAtomicMass(
            atom.symbol
          ),
        0
      )
      .toFixed(3);
  }
}

const moleculeEngine =
  new MoleculeEngine();

export default moleculeEngine;