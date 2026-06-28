export const VALENCY = {
  H: 1,
  O: 2,
  N: 3,
  C: 4,
};

export const BOND_COST = {
  single: 1,
  double: 2,
  triple: 3,
};

/* ---------- COUNT BONDS ---------- */
export function getBondCount(atomId, bonds) {
  return bonds.reduce((sum, b) => {
    if (b.from === atomId || b.to === atomId) {
      return sum + (BOND_COST[b.type] || 1);
    }
    return sum;
  }, 0);
}

/* ---------- VALIDATE BOND ---------- */
export function canFormBond(atomA, atomB, bonds, type = "single") {
  const cost = BOND_COST[type] || 1;

  const aUsed = getBondCount(atomA.id, bonds);
  const bUsed = getBondCount(atomB.id, bonds);

  const aLimit = VALENCY[atomA.symbol] || 4;
  const bLimit = VALENCY[atomB.symbol] || 4;

  return aUsed + cost <= aLimit && bUsed + cost <= bLimit;
}

/* ---------- MOLECULE DETECTOR ---------- */
export function detectMolecule(atoms) {
  const map = {};

  atoms.forEach((a) => {
    map[a.symbol] = (map[a.symbol] || 0) + 1;
  });

  const key = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => k + v)
    .join("");

  const database = {
    H2O: "Water",
    CO2: "Carbon Dioxide",
    NH3: "Ammonia",
    CH4: "Methane",
  };

  return database[key] || "Unknown Molecule";
}

/* ---------- STABILITY CHECK ---------- */
export function isStable(atoms, bonds) {
  return atoms.every((atom) => {
    const used = getBondCount(atom.id, bonds);
    const limit = VALENCY[atom.symbol] || 4;
    return used <= limit;
  });
}