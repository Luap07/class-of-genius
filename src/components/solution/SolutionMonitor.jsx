import React from "react";
import {
  Droplets,
  FlaskConical,
  Thermometer,
  Zap,
  Beaker,
  Gauge,
  Activity,
} from "lucide-react";

const SolutionMonitor = ({ simulation }) => {
  if (!simulation) return null;

  const {
    solute,
    solvent,
    mass,
    volume,
    moles,
    molarity,
    concentration,
    conductivity,
    saturation,
    temperature,
    dissolvedPercent,
    solubility,
  } = simulation;

  const getBadgeColor = (value) => {
    switch (value) {
      case "Dilute":
        return "bg-blue-600";

      case "Moderate":
        return "bg-yellow-500 text-black";

      case "Concentrated":
        return "bg-red-600";

      case "High":
        return "bg-green-600";

      case "Very High":
        return "bg-emerald-600";

      case "Saturated":
        return "bg-purple-600";

      case "Unsaturated":
        return "bg-cyan-600";

      case "Highly Soluble":
        return "bg-green-600";

      case "Soluble":
        return "bg-blue-600";

      case "Completely Miscible":
        return "bg-indigo-600";

      case "None":
        return "bg-gray-600";

      default:
        return "bg-slate-700";
    }
  };

  const Card = ({ icon: Icon, title, value, badge = false }) => (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="text-cyan-400" size={22} />

        <span className="text-slate-300 font-semibold">
          {title}
        </span>
      </div>

      {badge ? (
        <span
          className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeColor(
            value
          )}`}
        >
          {value}
        </span>
      ) : (
        <div className="text-2xl font-bold text-white">
          {value}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

      <h2 className="text-2xl font-bold text-cyan-400">
        🧪 Solution Monitor
      </h2>

      {/* Solute & Solvent */}
      <div className="grid grid-cols-2 gap-4">

        <Card
          icon={FlaskConical}
          title="Solute"
          value={solute}
        />

        <Card
          icon={Droplets}
          title="Solvent"
          value={solvent}
        />

      </div>

      {/* Mass & Volume */}
      <div className="grid grid-cols-2 gap-4">

        <Card
          icon={Beaker}
          title="Mass"
          value={`${mass} g`}
        />

        <Card
          icon={Gauge}
          title="Volume"
          value={`${volume} mL`}
        />

      </div>

      {/* Moles & Molarity */}
      <div className="grid grid-cols-2 gap-4">

        <Card
          icon={Activity}
          title="Moles"
          value={Number(moles).toFixed(3)}
        />

        <Card
          icon={Droplets}
          title="Molarity"
          value={`${Number(molarity).toFixed(3)} M`}
        />

      </div>

      {/* Concentration */}
      <Card
        icon={Gauge}
        title="Concentration"
        value={concentration}
        badge
      />

      {/* Conductivity */}
      <Card
        icon={Zap}
        title="Conductivity"
        value={conductivity}
        badge
      />

      {/* Solubility */}
      <Card
        icon={Beaker}
        title="Solubility"
        value={solubility}
        badge
      />

      {/* Saturation */}
      <Card
        icon={Droplets}
        title="Saturation"
        value={saturation}
        badge
      />

      {/* Temperature */}
      <Card
        icon={Thermometer}
        title="Temperature"
        value={`${temperature} °C`}
      />

      {/* Dissolved Percentage */}
      <div>
        <div className="flex justify-between mb-2">
          <span>Dissolved</span>

          <span>{dissolvedPercent}%</span>
        </div>

        <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">

          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{
              width: `${dissolvedPercent}%`,
            }}
          />

        </div>
      </div>

    </div>
  );
};

export default SolutionMonitor;