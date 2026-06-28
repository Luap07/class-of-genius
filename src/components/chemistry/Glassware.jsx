import React from "react";
import {
  Beaker,
  TestTube,
  FlaskConical,
  Flame,
  Pipette,
  Thermometer,
} from "lucide-react";

export default function Glassware({
  selectedTool,
  setSelectedTool,
}) {
  const tools = [
    {
      id: "beaker",
      name: "Beaker",
      icon: Beaker,
      color: "from-cyan-500 to-blue-600",
      description: "Mix solutions",
    },
    {
      id: "testtube",
      name: "Test Tube",
      icon: TestTube,
      color: "from-green-500 to-emerald-600",
      description: "Small reactions",
    },
    {
      id: "flask",
      name: "Flask",
      icon: FlaskConical,
      color: "from-purple-500 to-pink-600",
      description: "Reaction vessel",
    },
    {
      id: "burner",
      name: "Burner",
      icon: Flame,
      color: "from-orange-500 to-red-600",
      description: "Heat chemicals",
    },
    {
      id: "dropper",
      name: "Dropper",
      icon: Pipette,
      color: "from-sky-500 to-cyan-600",
      description: "Add liquids",
    },
    {
      id: "thermometer",
      name: "Thermometer",
      icon: Thermometer,
      color: "from-yellow-500 to-orange-500",
      description: "Measure temperature",
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">

      {/* ================= HEADER ================= */}

      <div className="p-5 border-b border-slate-800">

        <h2 className="text-xl font-bold text-white">
          Laboratory Glassware
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Select equipment for the experiment
        </p>

      </div>

      {/* ================= TOOLS ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-5">

        {tools.map((tool) => {

          const Icon = tool.icon;

          const active =
            selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() =>
                setSelectedTool(tool.id)
              }
              className={`
                rounded-2xl
                border
                transition-all
                duration-300

                ${
                  active
                    ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                    : "border-slate-700 bg-slate-950 hover:border-cyan-500"
                }
              `}
            >

              <div className="p-5 flex flex-col items-center">

                <div
                  className={`
                    w-16
                    h-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    bg-gradient-to-br
                    ${tool.color}
                    mb-4
                  `}
                >
                  <Icon
                    size={30}
                    className="text-white"
                  />
                </div>

                <h3 className="text-white font-semibold text-center">
                  {tool.name}
                </h3>

                <p className="text-xs text-slate-400 mt-2 text-center">
                  {tool.description}
                </p>

                {active && (
                  <div className="mt-4 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-semibold">
                    Selected
                  </div>
                )}

              </div>

            </button>
          );
        })}

      </div>

      {/* ================= FOOTER ================= */}

      <div className="border-t border-slate-800 p-5 bg-slate-950">

        <div className="flex justify-between items-center">

          <span className="text-slate-400">
            Current Tool
          </span>

          <span className="font-bold text-cyan-400">
            {selectedTool
              ? tools.find(
                  (t) => t.id === selectedTool
                )?.name
              : "None"}
          </span>

        </div>

      </div>

    </div>
  );
}