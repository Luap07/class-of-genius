import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Bot,
  Activity,
} from "lucide-react";

const ExperimentControls = ({
  isRunning = false,
  autoMode = false,
  onStart = () => {},
  onPause = () => {},
  onReset = () => {},
  onToggleAuto = () => {},
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

      <div className="flex items-center gap-3 mb-5">
        <Activity className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">
          Experiment Controls
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <button
          onClick={onStart}
          disabled={isRunning}
          className={`
            flex items-center justify-center gap-2
            rounded-xl
            py-3
            font-semibold
            transition
            ${
              isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }
          `}
        >
          <Play size={18} />
          Start
        </button>

        <button
          onClick={onPause}
          disabled={!isRunning}
          className={`
            flex items-center justify-center gap-2
            rounded-xl
            py-3
            font-semibold
            transition
            ${
              !isRunning
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400 text-black"
            }
          `}
        >
          <Pause size={18} />
          Pause
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 transition py-3 font-semibold text-white"
        >
          <RotateCcw size={18} />
          Reset
        </button>

        <button
          onClick={onToggleAuto}
          className={`
            flex items-center justify-center gap-2
            rounded-xl
            py-3
            font-semibold
            transition
            ${
              autoMode
                ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }
          `}
        >
          <Bot size={18} />
          {autoMode ? "Auto ON" : "Auto OFF"}
        </button>

      </div>

      <div className="mt-5 rounded-xl bg-slate-800 p-4 border border-slate-700">

        <div className="flex justify-between mb-2">

          <span className="text-slate-400">
            Status
          </span>

          <span
            className={
              isRunning
                ? "text-green-400 font-semibold"
                : "text-yellow-400 font-semibold"
            }
          >
            {isRunning ? "Running" : "Stopped"}
          </span>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Automation
          </span>

          <span
            className={
              autoMode
                ? "text-cyan-400 font-semibold"
                : "text-slate-300"
            }
          >
            {autoMode ? "Enabled" : "Disabled"}
          </span>

        </div>

      </div>

    </div>
  );
};

export default ExperimentControls;