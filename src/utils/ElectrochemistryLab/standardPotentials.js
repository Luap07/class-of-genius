// src/pages/labs/chemistry/utils/standardPotentials.js

import { ELECTRODES } from "../../data/ElectrochemistryLab/electrodes";

/*
|--------------------------------------------------------------------------
| Standard Reduction Potentials Database
|--------------------------------------------------------------------------
*/

export const STANDARD_POTENTIALS = ELECTRODES.reduce((acc, electrode) => {
  acc[electrode.id] = electrode.potential;
  return acc;
}, {});

/*
|--------------------------------------------------------------------------
| Get Electrode Object
|--------------------------------------------------------------------------
*/

export function getElectrode(id) {
  return ELECTRODES.find((e) => e.id === id) || null;
}

/*
|--------------------------------------------------------------------------
| Get Standard Reduction Potential
|--------------------------------------------------------------------------
*/

export function getPotential(id) {
  const electrode = getElectrode(id);

  if (!electrode) return null;

  return electrode.potential;
}

/*
|--------------------------------------------------------------------------
| Calculate Standard Cell Potential
| E°cell = E°cathode − E°anode
|--------------------------------------------------------------------------
*/

export function calculateCellPotential(anodeId, cathodeId) {
  const anode = getElectrode(anodeId);
  const cathode = getElectrode(cathodeId);

  if (!anode || !cathode) return 0;

  if (
    anode.potential === null ||
    cathode.potential === null
  ) {
    return 0;
  }

  return Number(
    (cathode.potential - anode.potential).toFixed(2)
  );
}

/*
|--------------------------------------------------------------------------
| Determine Anode & Cathode Automatically
|--------------------------------------------------------------------------
*/

export function determineElectrodes(firstId, secondId) {
  const first = getElectrode(firstId);
  const second = getElectrode(secondId);

  if (!first || !second) return null;

  if (first.potential < second.potential) {
    return {
      anode: first,
      cathode: second,
    };
  }

  if (second.potential < first.potential) {
    return {
      anode: second,
      cathode: first,
    };
  }

  return {
    anode: first,
    cathode: second,
  };
}

/*
|--------------------------------------------------------------------------
| Cell Notation
|--------------------------------------------------------------------------
*/

export function buildCellNotation(
  anode,
  cathode
) {
  if (!anode || !cathode) return "";

  return `${anode.symbol}(s) | ${anode.ion}(aq) || ${cathode.ion}(aq) | ${cathode.symbol}(s)`;
}

/*
|--------------------------------------------------------------------------
| Half Reactions
|--------------------------------------------------------------------------
*/

export function getHalfReactions(anode, cathode) {
  if (!anode || !cathode) return null;

  return {
    oxidation: `${anode.symbol}(s) → ${anode.ion}(aq) + ${anode.electrons}e⁻`,
    reduction: `${cathode.ion}(aq) + ${cathode.electrons}e⁻ → ${cathode.symbol}(s)`
  };
}

/*
|--------------------------------------------------------------------------
| Electron Flow
|--------------------------------------------------------------------------
*/

export function electronFlow(anode, cathode) {
  if (!anode || !cathode) return "";

  return `${anode.symbol} → ${cathode.symbol}`;
}

/*
|--------------------------------------------------------------------------
| Is Cell Spontaneous?
|--------------------------------------------------------------------------
*/

export function isSpontaneous(anodeId, cathodeId) {
  return calculateCellPotential(anodeId, cathodeId) > 0;
}

/*
|--------------------------------------------------------------------------
| Get Cell Summary
|--------------------------------------------------------------------------
*/

export function getCellSummary(anodeId, cathodeId) {
  const pair = determineElectrodes(anodeId, cathodeId);

  if (!pair) return null;

  const voltage = calculateCellPotential(
    pair.anode.id,
    pair.cathode.id
  );

  return {
    anode: pair.anode,
    cathode: pair.cathode,
    voltage,
    notation: buildCellNotation(
      pair.anode,
      pair.cathode
    ),
    reactions: getHalfReactions(
      pair.anode,
      pair.cathode
    ),
    electronFlow: electronFlow(
      pair.anode,
      pair.cathode
    ),
    spontaneous: voltage > 0
  };
}

/*
|--------------------------------------------------------------------------
| Voltage Label
|--------------------------------------------------------------------------
*/

export function formatVoltage(value) {
  return `${Number(value).toFixed(2)} V`;
}

/*
|--------------------------------------------------------------------------
| Common Cell Presets
|--------------------------------------------------------------------------
*/

export const COMMON_CELLS = [
  {
    name: "Daniell Cell",
    anode: "zn",
    cathode: "cu"
  },
  {
    name: "Silver–Copper",
    anode: "cu",
    cathode: "ag"
  },
  {
    name: "Magnesium–Copper",
    anode: "mg",
    cathode: "cu"
  },
  {
    name: "Iron–Copper",
    anode: "fe",
    cathode: "cu"
  },
  {
    name: "Lead–Copper",
    anode: "pb",
    cathode: "cu"
  }
];