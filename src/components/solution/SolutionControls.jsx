import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  FlaskConical,
  Droplets,
  Flame,
  Thermometer,
  Loader2,
  Gauge,
  Settings,
} from "lucide-react";

const SolutionControls = ({
  // Experiment
  running = false,
  heating = false,
  autoMode = false,

  // Values
  temperature = 25,
  setTemperature = () => {},

  soluteMass = 5,
  solutionVolume = 100,

  stirSpeed = 50,
  setStirSpeed = () => {},

  // Callbacks
  onMassChange = () => {},
  onVolumeChange = () => {},

  onStart = () => {},
  onPause = () => {},
  onReset = () => {},

  onToggleHeating = () => {},
  onToggleAuto = () => {},
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">

      {/* ================= Header ================= */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-cyan-400">
            ⚙ Solution Controls
          </h2>

          <p className="text-slate-400 text-sm">
            Configure the experiment before starting.
          </p>

        </div>

        <Settings
          className="text-cyan-400"
          size={30}
        />

      </div>

      {/* ================= Solute Mass ================= */}

      <div className="space-y-3">

        <div className="flex justify-between">

          <span className="flex items-center gap-2">

            <FlaskConical size={18} />

            Solute Mass

          </span>

          <span className="font-bold text-cyan-400">
            {soluteMass.toFixed(1)} g
          </span>

        </div>

        <input
          type="range"
          min={1}
          max={100}
          step={0.5}
          value={soluteMass}
          onChange={(e) =>
            onMassChange(Number(e.target.value))
          }
          className="w-full accent-cyan-500"
        />

      </div>

      {/* ================= Solution Volume ================= */}

      <div className="space-y-3">

        <div className="flex justify-between">

          <span className="flex items-center gap-2">

            <Droplets size={18} />

            Solution Volume

          </span>

          <span className="font-bold text-blue-400">
            {solutionVolume.toFixed(0)} mL
          </span>

        </div>

        <input
          type="range"
          min={50}
          max={1000}
          step={10}
          value={solutionVolume}
          onChange={(e) =>
            onVolumeChange(Number(e.target.value))
          }
          className="w-full accent-blue-500"
        />

      </div>
            {/* ================= Temperature ================= */}

      <div className="space-y-3">

        <div className="flex justify-between">

          <span className="flex items-center gap-2">

            <Thermometer size={18} />

            Temperature

          </span>

          <span className="font-bold text-red-400">
            {temperature.toFixed(0)}°C
          </span>

        </div>

        <input
          type="range"
          min={20}
          max={100}
          step={1}
          value={temperature}
          onChange={(e) =>
            setTemperature(Number(e.target.value))
          }
          className="w-full accent-red-500"
        />

        <div className="flex justify-between text-xs text-slate-400">

          <span>20°C</span>

          <span>Room Temp</span>

          <span>100°C</span>

        </div>

      </div>

      {/* ================= Heating ================= */}

      <button
        onClick={onToggleHeating}
        className={`w-full rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2 ${
          heating
            ? "bg-orange-600 hover:bg-orange-700"
            : "bg-slate-800 hover:bg-slate-700"
        }`}
      >

        <Flame size={20} />

        {heating ? "Heating ON" : "Heating OFF"}

      </button>

      {/* ================= Stirrer Speed ================= */}

      <div className="space-y-3">

        <div className="flex justify-between">

          <span className="flex items-center gap-2">

            <Loader2 size={18} />

            Stirrer Speed

          </span>

          <span className="font-bold text-green-400">
            {stirSpeed}%
          </span>

        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={stirSpeed}
          onChange={(e) =>
            setStirSpeed(Number(e.target.value))
          }
          className="w-full accent-green-500"
        />

      </div>

      {/* ================= Auto Mode ================= */}

      <button
        onClick={onToggleAuto}
        className={`w-full rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2 ${
          autoMode
            ? "bg-cyan-600 hover:bg-cyan-700"
            : "bg-slate-800 hover:bg-slate-700"
        }`}
      >

        <Gauge size={18} />

        {autoMode ? "Auto Mode ON" : "Auto Mode OFF"}

      </button>
            {/* ================= Experiment Controls ================= */}

      <div className="grid grid-cols-2 gap-3">

        <button
          onClick={running ? onPause : onStart}
          className={`rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition ${
            running
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {running ? <Pause size={18} /> : <Play size={18} />}

          {running ? "Pause" : "Start"}
        </button>

        <button
          onClick={onReset}
          className="rounded-xl py-3 font-semibold bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 transition"
        >
          <RotateCcw size={18} />

          Reset
        </button>

      </div>

      {/* ================= Quick Presets ================= */}

      <div>

        <h3 className="font-semibold text-slate-300 mb-3">
          Quick Presets
        </h3>

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={() => {
              onMassChange(5);
              onVolumeChange(100);
              setTemperature(25);
            }}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 py-3 transition"
          >
            Standard
          </button>

          <button
            onClick={() => {
              onMassChange(10);
              onVolumeChange(250);
              setTemperature(60);
            }}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 py-3 transition"
          >
            Warm Solution
          </button>

          <button
            onClick={() => {
              onMassChange(20);
              onVolumeChange(500);
              setTemperature(90);
            }}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 py-3 transition"
          >
            Hot Solution
          </button>

          <button
            onClick={() => {
              onMassChange(2);
              onVolumeChange(50);
              setTemperature(20);
            }}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 py-3 transition"
          >
            Dilute Sample
          </button>

        </div>

      </div>

      {/* ================= Progress ================= */}

      <div>

        <div className="flex justify-between text-sm mb-2">

          <span>Experiment Progress</span>

          <span>
            {running ? "Running..." : "Idle"}
          </span>

        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">

          <div
            className={`h-full transition-all duration-500 ${
              running
                ? "bg-green-500 w-full animate-pulse"
                : "bg-slate-700 w-0"
            }`}
          />

        </div>

      </div>
            {/* ================= Live Status ================= */}

      <div className="bg-slate-800 rounded-xl p-5 space-y-3">

        <h3 className="text-lg font-bold text-cyan-400">
          📊 Live Status
        </h3>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Experiment
          </span>

          <span
            className={`font-bold ${
              running
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {running ? "Running" : "Stopped"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Heating
          </span>

          <span
            className={`font-bold ${
              heating
                ? "text-orange-400"
                : "text-slate-400"
            }`}
          >
            {heating ? "ON" : "OFF"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Auto Mode
          </span>

          <span
            className={`font-bold ${
              autoMode
                ? "text-cyan-400"
                : "text-slate-400"
            }`}
          >
            {autoMode ? "Enabled" : "Disabled"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Temperature
          </span>

          <span className="font-bold text-red-400">
            {temperature.toFixed(1)}°C
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Solute
          </span>

          <span className="font-bold text-cyan-400">
            {soluteMass.toFixed(1)} g
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Volume
          </span>

          <span className="font-bold text-blue-400">
            {solutionVolume.toFixed(0)} mL
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Stir Speed
          </span>

          <span className="font-bold text-green-400">
            {stirSpeed}%
          </span>
        </div>

      </div>

      {/* ================= Experiment Summary ================= */}

      <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700 rounded-xl p-5">

        <h3 className="text-lg font-bold mb-4 text-cyan-300">
          🧪 Current Setup
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">

          <div>
            <p className="text-slate-400">
              Solute
            </p>

            <p className="font-semibold">
              {soluteMass.toFixed(1)} g
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Solvent
            </p>

            <p className="font-semibold">
              {solutionVolume.toFixed(0)} mL
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Temperature
            </p>

            <p className="font-semibold">
              {temperature.toFixed(1)}°C
            </p>
          </div>

          <div>
            <p className="text-slate-400">
              Stirring
            </p>

            <p className="font-semibold">
              {stirSpeed}%
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SolutionControls;