// src/pages/labs/chemistry/components/ElectrochemicalCell.jsx

import React, { useMemo, useState } from "react";

import CellDiagram from "./CellDiagram";
import Voltmeter from "./Voltmeter";
import ElectrodeSelector from "./ElectrodeSelector";
import ElectrolyteSelector from "./ElectrolyteSelector";
import SaltBridge from "./SaltBridge";
import ElectronAnimation from "./ElectronAnimation";
import IonAnimation from "./IonAnimation";

import HalfReactionPanel from "../../..../../../components/chemistry/ElectrochemistryLab/HalfReactionPanel";
import ObservationPanel from "../../../components/chemistry/ElectrochemistryLab/ObservationPanel";
import SimulationControls from "../../../components/chemistry/ElectrochemistryLab/SimulationControls";

import useCellPotential from "../../../hooks/ElectrochemistryLab/useCellPotential";

const ElectrochemicalCell = () => {
  /* ================= STATE ================= */

  const [running, setRunning] = useState(false);
  const [anode, setAnode] = useState(null);
  const [cathode, setCathode] = useState(null);

  const [anodeElectrolyte, setAnodeElectrolyte] =
    useState("ZnSO₄");

  const [cathodeElectrolyte, setCathodeElectrolyte] =
    useState("CuSO₄");

  const [saltBridge, setSaltBridge] =
    useState("KNO₃");

  /* ================= HOOK ================= */

  const {
    voltage,
    formattedVoltage,
    reaction,
    status,
    cellNotation,
    halfReactions,
    isSpontaneous,
    powerLevel,
  } = useCellPotential(anode?.id, cathode?.id);

  /* ================= CONTROL ================= */

  const ready = useMemo(() => {
    return anode && cathode && anode.id !== cathode.id;
  }, [anode, cathode]);

  const startSimulation = () => {
    if (!ready) return;
    setRunning(true);
  };

  const stopSimulation = () => setRunning(false);

  const resetSimulation = () => {
    setRunning(false);
    setAnode(null);
    setCathode(null);
    setAnodeElectrolyte("ZnSO₄");
    setCathodeElectrolyte("CuSO₄");
    setSaltBridge("KNO₃");
  };

  return (
    <div className="space-y-6">

      {/* ================= INPUT PANELS ================= */}

      <div className="grid lg:grid-cols-2 gap-6">

        <ElectrodeSelector className="h-72"
          anode={anode}
          cathode={cathode}
          onSelectAnode={setAnode}
          onSelectCathode={setCathode}
        />

        <ElectrolyteSelector className="h-72"
          anodeElectrolyte={anodeElectrolyte}
          cathodeElectrolyte={cathodeElectrolyte}
          onAnodeChange={setAnodeElectrolyte}
          onCathodeChange={setCathodeElectrolyte}
        />

      </div>

      {/* ================= SALT BRIDGE ================= */}

      <SaltBridge
        value={saltBridge}
        onChange={setSaltBridge}
        connected={ready}
        running={running}
      />

      {/* ================= MAIN CELL ================= */}

      <CellDiagram
        anode={anode}
        cathode={cathode}
        anodeElectrolyte={anodeElectrolyte}
        cathodeElectrolyte={cathodeElectrolyte}
        voltage={voltage}
        running={running}
      >

        <ElectronAnimation
          running={running}
          voltage={voltage}
          direction="left-to-right"
          anode={anode?.symbol || "Zn"}
          cathode={cathode?.symbol || "Cu"}
        />

        <IonAnimation
          running={running}
          voltage={voltage}
          anodeIon={anode?.ion || "Zn²⁺"}
          cathodeIon={cathode?.ion || "Cu²⁺"}
        />

      </CellDiagram>

      {/* ================= RESULTS ================= */}

      <div className="grid xl:grid-cols-2 gap-6">

        <Voltmeter
          voltage={voltage}
          running={running}
          spontaneous={isSpontaneous}
          powerLevel={powerLevel}
        />

        <HalfReactionPanel
          oxidation={halfReactions?.oxidation}
          reduction={halfReactions?.reduction}
          anodeSymbol={anode?.symbol}
          cathodeSymbol={cathode?.symbol}
        />

      </div>

      {/* ================= OBSERVATION ================= */}

      <ObservationPanel
        running={running}
        anodeSymbol={anode?.symbol}
        cathodeSymbol={cathode?.symbol}
        saltBridge={saltBridge}
        reaction={reaction}
      />

      {/* ================= CONTROLS ================= */}

      <SimulationControls
        running={running}
        ready={ready}
        onStart={startSimulation}
        onStop={stopSimulation}
        onReset={resetSimulation}
      />

    </div>
  );
};

export default ElectrochemicalCell;