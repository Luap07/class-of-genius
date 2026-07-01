// src/hooks/acidBase/useAcidBaseEngine.js

import { useCallback, useState } from "react";

import AcidBaseEngine from "../../engine/acidBase/AcidBaseEngine";
import PHCalculator from "../../engine/acidBase/PHCalculator";
import IndicatorEngine from "../../engine/acidBase/IndicatorEngine";
import NeutralizationEngine from "../../engine/acidBase/NeutralizationEngine";
import ValidationEngine from "../../engine/acidBase/ValidationEngine";
import AnimationEngine from "../../engine/acidBase/AnimationEngine";

export default function useAcidBaseEngine() {
  const [acid, setAcid] = useState(null);
  const [base, setBase] = useState(null);

  const [products, setProducts] = useState([]);

  const [equation, setEquation] = useState("");

  const [ph, setPH] = useState(7);

  const [indicator, setIndicator] =
    useState("Litmus");

  const [indicatorResult, setIndicatorResult] =
    useState(null);

  const [observation, setObservation] =
    useState("Select an acid and a base.");

  const [temperature, setTemperature] =
    useState(25);

  const [playing, setPlaying] =
    useState(false);

  const [speed, setSpeed] =
    useState(1);

  const [sessionId] = useState(
    () => `acidbase-${Date.now()}`
  );

  /* ===========================================
      Select Acid
  =========================================== */

  const selectAcid = useCallback((chemical) => {
    setAcid(chemical);
  }, []);

  /* ===========================================
      Select Base
  =========================================== */

  const selectBase = useCallback((chemical) => {
    setBase(chemical);
  }, []);

  /* ===========================================
      Change Indicator
  =========================================== */

  const changeIndicator =
    useCallback((name) => {
      setIndicator(name);

      const result =
        IndicatorEngine.analyze(name, ph);

      setIndicatorResult(result);
    }, [ph]);

  /* ===========================================
      Start Reaction
  =========================================== */

  const startReaction =
    useCallback(() => {
      const validation =
        ValidationEngine.validateExperiment({
          acid,
          base,
          acidVolume: 50,
          baseVolume: 50,
          temperature,
          indicator,
        });

      if (!validation.valid) {
        setObservation(validation.message);
        return;
      }

      const result =
        NeutralizationEngine.run({
          acid,
          base,
          indicator,
        });

      setProducts(result.products);

      setEquation(result.equation);

      setObservation(result.observation);

      setPH(result.ph);

      setIndicatorResult(result.indicator);

      setPlaying(true);

      AnimationEngine.start(
        sessionId,
        speed
      );

      AnimationEngine.triggerNeutralization(
        sessionId
      );
    }, [
      acid,
      base,
      indicator,
      temperature,
      speed,
      sessionId,
    ]);

  /* ===========================================
      Stop
  =========================================== */

  const stopReaction =
    useCallback(() => {
      AnimationEngine.stop(sessionId);

      setPlaying(false);
    }, [sessionId]);

  /* ===========================================
      Reset
  =========================================== */

  const resetReaction =
    useCallback(() => {
      setAcid(null);

      setBase(null);

      setProducts([]);

      setEquation("");

      setPH(7);

      setObservation(
        "Select an acid and a base."
      );

      setPlaying(false);

      setIndicatorResult(null);

      AnimationEngine.reset(sessionId);
    }, [sessionId]);

  /* ===========================================
      Tick Animation
  =========================================== */

  const tick = useCallback(() => {
    if (!playing) return;

    AnimationEngine.update(
      sessionId,
      speed
    );
  }, [
    playing,
    speed,
    sessionId,
  ]);

  /* ===========================================
      Calculate pH Only
  =========================================== */

  const calculatePH =
    useCallback(() => {
      const value =
        PHCalculator.mix(
          acid,
          base
        );

      setPH(value);

      const result =
        IndicatorEngine.analyze(
          indicator,
          value
        );

      setIndicatorResult(result);

      return value;
    }, [
      acid,
      base,
      indicator,
    ]);

  /* ===========================================
      Run Engine Only
  =========================================== */

  const simulate =
    useCallback(() => {
      return AcidBaseEngine.react(
        acid,
        base
      );
    }, [acid, base]);

  return {
    acid,
    base,

    products,

    equation,

    ph,

    indicator,

    indicatorResult,

    observation,

    temperature,

    speed,

    playing,

    selectAcid,

    selectBase,

    setTemperature,

    setSpeed,

    setIndicator:
      changeIndicator,

    startReaction,

    stopReaction,

    resetReaction,

    calculatePH,

    simulate,

    tick,
  };
}