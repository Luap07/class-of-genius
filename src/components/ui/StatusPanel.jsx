// src/components/ui/StatusPanel.jsx

import React from "react";
import {
  Activity,
  Droplets,
  FlaskConical,
  CircleCheckBig,
  CircleX,
  Timer,
  Gauge,
  Thermometer,
} from "lucide-react";

const StatusCard = ({
  icon: Icon,
  title,
  value,
  color = "text-cyan-400",
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={18} className={color} />
      <span className="text-slate-400 text-sm">
        {title}
      </span>
    </div>

    <p className={`text-2xl font-bold ${color}`}>
      {value}
    </p>
  </div>
);

const StatusPanel = ({
  isRunning = false,
  endpointReached = false,

  ph = 7,

  volumeAdded = 0,

  endpointVolume = 25,

  drops = 0,

  elapsedTime = "00:00",

  temperature = 25,
}) => {
  const progress = Math.min(
    (volumeAdded / endpointVolume) * 100,
    100
  );

  return (
    <div className="space-y-5">

      {/* ================= Status ================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

        <div className="flex items-center gap-2 mb-4">

          <Activity
            size={20}
            className="text-cyan-400"
          />

          <h2 className="font-bold text-lg">
            Experiment Status
          </h2>

        </div>

        <div className="flex items-center justify-between">

          <span className="text-slate-400">
            Current State
          </span>

          <div className="flex items-center gap-2">

            {isRunning ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />

                <span className="text-green-400 font-semibold">
                  Running
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500" />

                <span className="text-red-400 font-semibold">
                  Stopped
                </span>
              </>
            )}

          </div>

        </div>

      </div>

      {/* ================= Statistics ================= */}

      <div className="grid grid-cols-2 gap-4">

        <StatusCard
          icon={Gauge}
          title="pH"
          value={Number(ph).toFixed(2)}
        />

        <StatusCard
          icon={Droplets}
          title="Drops"
          value={drops}
          color="text-blue-400"
        />

        <StatusCard
          icon={FlaskConical}
          title="Added"
          value={`${volumeAdded.toFixed(2)} mL`}
          color="text-purple-400"
        />

        <StatusCard
          icon={Timer}
          title="Time"
          value={elapsedTime}
          color="text-orange-400"
        />

      </div>

      {/* ================= Progress ================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

        <div className="flex justify-between mb-3">

          <span className="text-slate-400">
            Endpoint Progress
          </span>

          <span className="font-semibold text-cyan-400">
            {progress.toFixed(1)}%
          </span>

        </div>

        <div className="h-4 rounded-full bg-slate-800 overflow-hidden">

          <div
            className={`h-full transition-all duration-300 ${
              endpointReached
                ? "bg-green-500"
                : "bg-cyan-500"
            }`}
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* ================= Endpoint ================= */}

      <div
        className={`rounded-2xl border p-5 ${
          endpointReached
            ? "bg-green-500/10 border-green-500/20"
            : "bg-yellow-500/10 border-yellow-500/20"
        }`}
      >

        <div className="flex items-center gap-3">

          {endpointReached ? (
            <CircleCheckBig
              className="text-green-400"
              size={22}
            />
          ) : (
            <CircleX
              className="text-yellow-400"
              size={22}
            />
          )}

          <div>

            <h3
              className={`font-bold ${
                endpointReached
                  ? "text-green-300"
                  : "text-yellow-300"
              }`}
            >
              {endpointReached
                ? "Endpoint Reached"
                : "Endpoint Not Reached"}
            </h3>

            <p className="text-sm text-slate-400 mt-1">

              {endpointReached
                ? "The titration has reached the equivalence point."
                : "Continue adding titrant slowly."}

            </p>

          </div>

        </div>

      </div>

      {/* ================= Environment ================= */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

        <div className="flex items-center gap-2 mb-4">

          <Thermometer
            size={20}
            className="text-red-400"
          />

          <h2 className="font-bold">
            Laboratory Conditions
          </h2>

        </div>

        <div className="flex justify-between">

          <span className="text-slate-400">
            Temperature
          </span>

          <span className="font-semibold">
            {temperature} °C
          </span>

        </div>

        <div className="flex justify-between mt-3">

          <span className="text-slate-400">
            Endpoint Volume
          </span>

          <span className="font-semibold">
            {endpointVolume.toFixed(2)} mL
          </span>

        </div>

      </div>

    </div>
  );
};

export default StatusPanel;