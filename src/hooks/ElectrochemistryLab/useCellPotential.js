// src/pages/labs/chemistry/hooks/useCellPotential.js

import { useEffect, useMemo, useState } from "react";

import {
  calculateCellPotential,
  determineElectrodes,
  buildCellNotation,
  getHalfReactions,
} from "../../utils/ElectrochemistryLab/standardPotentials";

import {
  generateReactionReport,
} from "../../utils/ElectrochemistryLab/reactionEngine";

/* ==========================================================
   useCellPotential
========================================================== */

const useCellPotential = (
  anodeId,
  cathodeId
) => {
  const [voltage, setVoltage] = useState(0);

  const [reaction, setReaction] = useState(null);

  const [cellNotation, setCellNotation] = useState("");

  const [halfReactions, setHalfReactions] = useState({
    oxidation: "",
    reduction: "",
  });

  const [status, setStatus] = useState({
    label: "",
    color: "green",
  });

  /* ======================================================
      Recalculate whenever electrodes change
  ====================================================== */

  useEffect(() => {
    if (!anodeId || !cathodeId) {
      setVoltage(0);

      setReaction(null);

      setCellNotation("");

      setHalfReactions({
        oxidation: "",
        reduction: "",
      });

      return;
    }

    const pair = determineElectrodes(
      anodeId,
      cathodeId
    );

    if (!pair) return;

    const cellVoltage = calculateCellPotential(
      pair.anode.id,
      pair.cathode.id
    );

    setVoltage(cellVoltage);

    setCellNotation(
      buildCellNotation(
        pair.anode,
        pair.cathode
      )
    );

    setHalfReactions(
      getHalfReactions(
        pair.anode,
        pair.cathode
      )
    );

    const report = generateReactionReport(
      pair.anode.id,
      pair.cathode.id
    );

    setReaction(report);

    setStatus(report.status);

  }, [anodeId, cathodeId]);

  /* ======================================================
      Memoized Values
  ====================================================== */

  const formattedVoltage = useMemo(() => {
    return `${voltage.toFixed(2)} V`;
  }, [voltage]);

  const isSpontaneous = useMemo(() => {
    return voltage > 0;
  }, [voltage]);

  const powerLevel = useMemo(() => {
    if (voltage >= 2)
      return "High";

    if (voltage >= 1)
      return "Medium";

    if (voltage > 0)
      return "Low";

    return "None";
  }, [voltage]);

  const efficiency = useMemo(() => {
    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (voltage / 2.5) * 100
        )
      )
    );
  }, [voltage]);

  /* ======================================================
      API
  ====================================================== */

  return {
    voltage,

    formattedVoltage,

    reaction,

    status,

    cellNotation,

    halfReactions,

    isSpontaneous,

    powerLevel,

    efficiency,
  };
};

export default useCellPotential;