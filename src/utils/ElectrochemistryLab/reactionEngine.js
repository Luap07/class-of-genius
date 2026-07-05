// src/pages/labs/chemistry/utils/reactionEngine.js

import {
  calculateCellPotential,
  determineElectrodes,
  getHalfReactions,
  buildCellNotation,
} from "./standardPotentials";

/* ==========================================================
   Validate Cell
========================================================== */

export function validateCell(anodeId, cathodeId) {
  if (!anodeId || !cathodeId) {
    return {
      valid: false,
      message: "Select two electrodes.",
    };
  }

  if (anodeId === cathodeId) {
    return {
      valid: false,
      message: "Choose two different electrodes.",
    };
  }

  return {
    valid: true,
    message: "Electrochemical cell is valid.",
  };
}

/* ==========================================================
   Build Cell
========================================================== */

export function createReaction(anodeId, cathodeId) {
  const validation = validateCell(anodeId, cathodeId);

  if (!validation.valid) {
    return {
      ...validation,
      voltage: 0,
    };
  }

  const pair = determineElectrodes(anodeId, cathodeId);

  const voltage = calculateCellPotential(
    pair.anode.id,
    pair.cathode.id
  );

  return {
    valid: true,

    anode: pair.anode,

    cathode: pair.cathode,

    voltage,

    spontaneous: voltage > 0,

    notation: buildCellNotation(
      pair.anode,
      pair.cathode
    ),

    reactions: getHalfReactions(
      pair.anode,
      pair.cathode
    ),
  };
}

/* ==========================================================
   Oxidation
========================================================== */

export function oxidationReaction(electrode) {
  return `${electrode.symbol}(s) → ${electrode.ion}(aq) + ${electrode.electrons}e⁻`;
}

/* ==========================================================
   Reduction
========================================================== */

export function reductionReaction(electrode) {
  return `${electrode.ion}(aq) + ${electrode.electrons}e⁻ → ${electrode.symbol}(s)`;
}

/* ==========================================================
   Overall Reaction
========================================================== */

export function overallReaction(anode, cathode) {
  return `${anode.symbol}(s) + ${cathode.ion}(aq) → ${anode.ion}(aq) + ${cathode.symbol}(s)`;
}

/* ==========================================================
   Electron Flow
========================================================== */

export function getElectronFlow(anode, cathode) {
  return {
    from: anode.symbol,
    to: cathode.symbol,
    direction: `${anode.symbol} → ${cathode.symbol}`,
  };
}

/* ==========================================================
   Ion Movement
========================================================== */

export function getIonMovement(anode, cathode) {
  return {
    cations: `${cathode.ion} move toward the cathode`,
    anions: "Salt bridge anions move toward the anode",
  };
}

/* ==========================================================
   Observation Generator
========================================================== */

export function generateObservations(reaction) {
  if (!reaction.valid) return [];

  return [
    `${reaction.anode.symbol} loses mass.`,
    `${reaction.cathode.symbol} gains mass.`,
    "Electrons flow through the external wire.",
    "Ions migrate through the salt bridge.",
    `Cell potential = ${reaction.voltage.toFixed(2)} V`,
  ];
}

/* ==========================================================
   Reaction Status
========================================================== */

export function getReactionStatus(voltage) {
  if (voltage > 0) {
    return {
      label: "Spontaneous",
      color: "green",
    };
  }

  if (voltage < 0) {
    return {
      label: "Non-Spontaneous",
      color: "red",
    };
  }

  return {
    label: "Equilibrium",
    color: "yellow",
  };
}

/* ==========================================================
   Experiment Types
========================================================== */

export const EXPERIMENT_TYPES = [
  {
    id: "galvanic",
    name: "Galvanic Cell",
    description: "Produces electrical energy spontaneously.",
  },
  {
    id: "electrolytic",
    name: "Electrolytic Cell",
    description: "Consumes electrical energy to drive a reaction.",
  },
];

/* ==========================================================
   Build Complete Report
========================================================== */

export function generateReactionReport(anodeId, cathodeId) {
  const reaction = createReaction(anodeId, cathodeId);

  if (!reaction.valid) return reaction;

  return {
    ...reaction,

    oxidation: oxidationReaction(reaction.anode),

    reduction: reductionReaction(reaction.cathode),

    overall: overallReaction(
      reaction.anode,
      reaction.cathode
    ),

    electronFlow: getElectronFlow(
      reaction.anode,
      reaction.cathode
    ),

    ionMovement: getIonMovement(
      reaction.anode,
      reaction.cathode
    ),

    observations: generateObservations(reaction),

    status: getReactionStatus(reaction.voltage),
  };
}