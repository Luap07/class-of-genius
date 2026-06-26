import React, { useMemo, useState } from "react";
import useGravityEngine from "../hooks/useGravityEngine";

const PLANETS = {
  Earth: { gravity: 9.81 },
  Moon: { gravity: 1.62 },
  Mars: { gravity: 3.71 },
};

const SIM_HEIGHT = 300;
const RULER_STEPS = 10;

/* ================= MAIN COMPONENT ================= */
export default function GravitySimulation() {
  const [planet, setPlanet] = useState("Earth");
  const [mass, setMass] = useState(10);
  const [startHeight, setStartHeight] = useState(100);

  const [playing, setPlaying] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const gravity = PLANETS[planet].gravity;

  const { height, velocity, time, impactSpeed } =
    useGravityEngine(gravity, startHeight, playing, resetKey);

  const weight = useMemo(() => mass * gravity, [mass, gravity]);

  const ballY = useMemo(() => {
    const progress =
      (startHeight - height) / Math.max(startHeight, 1);

    return progress * SIM_HEIGHT;
  }, [height, startHeight]);

  const stepValue = useMemo(
    () => startHeight / RULER_STEPS,
    [startHeight]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* HEADER */}
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold">
          🌍 Gravity Simulation Lab
        </h1>
        <p className="text-slate-400">
          Glass UI Physics Engine
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* ================= LEFT CONTROLS ================= */}
        <Panel title="Controls">

            <h2>Planet</h2>
          <select
            value={planet}
            onChange={(e) => setPlanet(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700"
          >
            <option>Earth</option>
            <option>Moon</option>
            <option>Mars</option>
          </select>

            <h2>Mass (kg)</h2>
          <input
            type="number"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Mass (kg)"
          />

            <h2>Height (m)</h2>
          <input
            type="number"
            value={startHeight}
            onChange={(e) =>
              setStartHeight(Number(e.target.value))
            }
            className="w-full p-3 mb-4 rounded-lg bg-slate-800 border border-slate-700"
            placeholder="Height (m)"
          />

          <Info value={`Gravity: ${gravity.toFixed(2)} m/s²`} />

          <div className="flex gap-2 mt-4 flex-wrap">

            <Button color="blue" onClick={() => setPlaying(true)}>
              ▶ Play
            </Button>

            <Button color="blue" onClick={() => setPlaying(false)}>
              ⏸ Pause
            </Button>

            <Button
              color="blue"
              onClick={() => {
                setPlaying(false);
                setResetKey((p) => p + 1);
              }}
            >
              🔄 Reset
            </Button>

          </div>
        </Panel>

        {/* ================= CENTER SIMULATION ================= */}
        <Panel title="Simulation">

          <div className="flex">

            {/* 📏 RULER */}
            <div className="relative w-14 h-[350px] mr-3">
              {Array.from({ length: RULER_STEPS + 1 }).map((_, i) => {
                const value = startHeight - i * stepValue;

                return (
                  <div
                    key={i}
                    className="absolute left-0 flex items-center"
                    style={{
                      top: `${(i / RULER_STEPS) * SIM_HEIGHT}px`,
                    }}
                  >
                    <div className="w-3 h-[2px] bg-gray-400" />
                    <span className="text-[10px] ml-1 text-gray-400">
                      {value.toFixed(0)}m
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SIM AREA */}
            <div className="relative w-full h-[373px] bg-slate-800 rounded-lg overflow-hidden">

              <div
                className="absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-cyan-400 rounded-full shadow-lg"
                style={{
                  top: `${Math.min(ballY, SIM_HEIGHT)}px`,
                }}
              />

              <div className="absolute bottom-0 w-full h-4 bg-green-600" />
            </div>

          </div>
        </Panel>

        {/* ================= RIGHT DATA ================= */}
        <Panel title="Live Data">

          <Stat label="Height" value={`${height.toFixed(2)} m`} />
          <Stat label="Velocity" value={`${velocity.toFixed(2)} m/s`} />
          <Stat label="Time" value={`${time.toFixed(2)} s`} />
          <Stat
            label="Impact Speed"
            value={`${impactSpeed.toFixed(2)} m/s`}
            highlight
          />
          <Stat label="Weight" value={`${weight.toFixed(2)} N`} />

        </Panel>

      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Panel({ title, children }) {
  return (
    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Info({ value }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 text-cyan-400 font-bold">
      {value}
    </div>
  );
}

/* 💎 GLASSY BLUE BUTTON */
function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        relative px-3 py-2 rounded-xl font-semibold text-white
        backdrop-blur-md border border-blue-400/30
        bg-blue-500/20
        shadow-lg shadow-blue-500/20
        transition-all duration-300
        hover:bg-blue-500/30 hover:shadow-blue-400/40
        overflow-hidden
      "
    >
      {/* shine effect */}
      <span className="
        absolute inset-0
        bg-gradient-to-r from-transparent via-white/10 to-transparent
        opacity-0 hover:opacity-100
        transition-all duration-500
      " />

      <span className="relative z-10">{children}</span>
    </button>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg mb-3">
      <p className="text-slate-400">{label}</p>
      <h3
        className={`text-2xl font-bold ${
          highlight ? "text-red-400" : ""
        }`}
      >
        {value}
      </h3>
    </div>
  );
}