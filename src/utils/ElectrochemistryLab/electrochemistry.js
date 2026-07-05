// src/pages/labs/chemistry/utils/electrochemistry.js

import { getElectrode } from "./standardPotentials";

/* ==========================================================
   Create Initial Cell State
========================================================== */

export function createCellState(anodeId, cathodeId) {
  const anode = getElectrode(anodeId);
  const cathode = getElectrode(cathodeId);

  return {
    running: false,

    time: 0,

    voltage: 0,

    current: 1,

    electronsMoved: 0,

    ionsMoved: 0,

    anode,

    cathode,

    anodeMass: 100,

    cathodeMass: 100,

    anodeConcentration: 1,

    cathodeConcentration: 1,

    bubbles: false,

    completed: false,

    observations: [],
  };
}

/* ==========================================================
   Reset Experiment
========================================================== */

export function resetCell(state) {
  return {
    ...state,

    running: false,

    time: 0,

    electronsMoved: 0,

    ionsMoved: 0,

    anodeMass: 100,

    cathodeMass: 100,

    anodeConcentration: 1,

    cathodeConcentration: 1,

    bubbles: false,

    completed: false,

    observations: [],
  };
}

/* ==========================================================
   Advance Simulation
========================================================== */

export function simulateStep(state) {
  if (!state.running) return state;

  const anodeLoss = 0.05;

  const cathodeGain = 0.05;

  const concentrationChange = 0.002;

  const next = {
    ...state,

    time: Number((state.time + 0.1).toFixed(1)),

    electronsMoved: state.electronsMoved + 2,

    ionsMoved: state.ionsMoved + 2,

    anodeMass: Math.max(
      0,
      Number((state.anodeMass - anodeLoss).toFixed(2))
    ),

    cathodeMass: Number(
      (state.cathodeMass + cathodeGain).toFixed(2)
    ),

    anodeConcentration: Number(
      (state.anodeConcentration + concentrationChange).toFixed(3)
    ),

    cathodeConcentration: Math.max(
      0,
      Number(
        (state.cathodeConcentration - concentrationChange).toFixed(3)
      )
    ),
  };

  if (next.time > 10) {
    next.completed = true;
    next.running = false;
  }

  return next;
}

/* ==========================================================
   Generate Observation
========================================================== */

export function generateObservation(state) {
  const observations = [];

  if (state.anodeMass < 99.5)
    observations.push(
      `${state.anode.symbol} electrode is dissolving.`
    );

  if (state.cathodeMass > 100.5)
    observations.push(
      `${state.cathode.symbol} electrode is gaining mass.`
    );

  if (state.electronsMoved > 20)
    observations.push(
      "Electrons are flowing through the external circuit."
    );

  if (state.ionsMoved > 20)
    observations.push(
      "Ions are migrating through the salt bridge."
    );

  if (state.completed)
    observations.push("Reaction has reached completion.");

  return observations;
}

/* ==========================================================
   Cell Progress
========================================================== */

export function getProgress(state) {
  return Math.min(
    100,
    Math.round((state.time / 10) * 100)
  );
}

/* ==========================================================
   Cell Efficiency
========================================================== */

export function calculateEfficiency(state) {
  const loss = 100 - state.anodeMass;

  return Number(
    Math.max(0, 100 - loss).toFixed(1)
  );
}

/* ==========================================================
   Current
========================================================== */

export function calculateCurrent(state) {
  if (!state.running) return 0;

  return Number(
    (
      state.electronsMoved *
      0.02
    ).toFixed(2)
  );
}

/* ==========================================================
   Electron Speed
========================================================== */

export function electronSpeed(state) {
  return Math.min(
    8,
    1 + state.current
  );
}

/* ==========================================================
   Ion Speed
========================================================== */

export function ionSpeed(state) {
  return Math.min(
    6,
    1 + state.current * 0.8
  );
}

/* ==========================================================
   Bubble Detection
========================================================== */

export function hasGasEvolution(state) {
  const gases = ["pt", "graphite", "h"];

  return (
    gases.includes(state.anode.id) ||
    gases.includes(state.cathode.id)
  );
}

/* ==========================================================
   Reaction Summary
========================================================== */

export function reactionSummary(state) {
  return {
    anode: state.anode.name,

    cathode: state.cathode.name,

    time: state.time,

    electrons: state.electronsMoved,

    ions: state.ionsMoved,

    voltage: state.voltage,

    current: calculateCurrent(state),

    efficiency: calculateEfficiency(state),

    progress: getProgress(state),
  };
}

/* ==========================================================
   Export Simulation Controls
========================================================== */

export function startSimulation(state) {
  return {
    ...state,
    running: true,
  };
}

export function pauseSimulation(state) {
  return {
    ...state,
    running: false,
  };
}

export function stopSimulation(state) {
  return resetCell(state);
}