// src/components/controls/ExperimentControls.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Timer,
  Droplets,
} from "lucide-react";

const ExperimentControls = ({
  isRunning = false,
  endpointReached = false,
  autoMode = false,
  setAutoMode = () => {},
  onStart = () => {},
  onPause = () => {},
  onReset = () => {},
  elapsedTime = 0,
  drops = 0,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FlaskConical
          className="text-cyan-400"
          size={20}
        />

        <h2 className="text-xl font-bold">
          Experiment Controls
        </h2>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-3 gap-3">

        {/* Start / Pause */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={isRunning ? onPause : onStart}
          className={`rounded-xl py-3 flex items-center justify-center gap-2 font-semibold transition ${
            isRunning
              ? "bg-yellow-600 hover:bg-yellow-500"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={18} />
              Pause
            </>
          ) : (
            <>
              <Play size={18} />
              Start
            </>
          )}
        </motion.button>

        {/* Reset */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onReset}
          className="rounded-xl bg-red-600 hover:bg-red-500 py-3 flex items-center justify-center gap-2 font-semibold"
        >
          <RotateCcw size={18} />
          Reset
        </motion.button>

        {/* Auto Mode */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setAutoMode(!autoMode)}
          className={`rounded-xl py-3 flex items-center justify-center gap-2 font-semibold transition ${
            autoMode
              ? "bg-cyan-600 hover:bg-cyan-500"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          <Droplets size={18} />
          {autoMode ? "Auto ON" : "Auto OFF"}
        </motion.button>

      </div>

      {/* Status */}
      <div className="mt-6 space-y-3">

        <div className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3">

          <span className="text-slate-400">
            Experiment
          </span>

          <span
            className={`font-semibold ${
              isRunning
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {isRunning ? "Running" : "Stopped"}
          </span>

        </div>

        <div className="flex justify-between items-center bg-slate-800 rounded-xl px-4 py-3">

          <span className="text-slate-400">
            Endpoint
          </span>

          <div className="flex items-center gap-2">

            {endpointReached ? (
              <>
                <CheckCircle2
                  className="text-green-400"
                  size={18}
                />

                <span className="text-green-400 font-semibold">
                  Reached
                </span>
              </>
            ) : (
              <>
                <XCircle
                  className="text-red-400"
                  size={18}
                />

                <span className="text-red-400 font-semibold">
                  Not Reached
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="bg-slate-800 rounded-xl p-4">

          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Timer size={18} />
            <span>Elapsed Time</span>
          </div>

          <div className="text-2xl font-bold">
            {formatTime(elapsedTime)}
          </div>

        </div>

        <div className="bg-slate-800 rounded-xl p-4">

          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Droplets size={18} />
            <span>Drops Added</span>
          </div>

          <div className="text-2xl font-bold">
            {drops}
          </div>

        </div>

      </div>

      {/* Progress */}
      <div className="mt-6">

        <div className="flex justify-between mb-2 text-sm">

          <span className="text-slate-400">
            Experiment Progress
          </span>

          <span className="text-cyan-400">
            {endpointReached ? "100%" : isRunning ? "In Progress" : "0%"}
          </span>

        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">

          <motion.div
            animate={{
              width: endpointReached
                ? "100%"
                : isRunning
                ? "60%"
                : "0%",
            }}
            transition={{
              duration: 0.5,
            }}
            className={`h-full ${
              endpointReached
                ? "bg-green-500"
                : "bg-cyan-500"
            }`}
          />

        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">

        <p className="text-sm text-slate-300 leading-6">
          Start the titration to begin adding the titrant drop by
          drop. The experiment will automatically stop when the
          endpoint is detected by the chemistry engine.
        </p>

      </div>

    </div>
  );
};

export default ExperimentControls;