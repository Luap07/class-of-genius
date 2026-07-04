import React from "react";

const Beaker = ({
  volume = 250,
  liquidLevel = 60,
  liquidColor = "#60a5fa",
  label = "Beaker",
  showScale = true,
}) => {
  return (
    <div className="flex flex-col items-center">

      {/* Label */}
      <p className="mb-2 text-sm font-semibold text-slate-300">
        {label}
      </p>

      {/* Beaker */}
      <div className="relative w-44 h-60">

        {/* Glass */}
        <div
          className="
            absolute inset-0
            border-[4px]
            border-slate-300
            rounded-b-3xl
            rounded-t-lg
            overflow-hidden
            bg-white/5
            backdrop-blur-sm
          "
        >

          {/* Liquid */}
          <div
            className="absolute bottom-0 left-0 w-full transition-all duration-700"
            style={{
              height: `${liquidLevel}%`,
              background: liquidColor,
              opacity: 0.8,
            }}
          />

          {/* Shine */}
          <div
            className="
              absolute
              left-4
              top-3
              w-3
              h-48
              bg-white/20
              rounded-full
            "
          />

          {/* Volume text */}
          <div className="absolute top-2 right-2 text-xs text-slate-200 font-bold">
            {volume} mL
          </div>
        </div>

        {/* Scale Marks */}
        {showScale && (
          <div className="absolute right-[-14px] top-2 h-[220px] flex flex-col justify-between">
            {[250, 200, 150, 100, 50].map((v) => (
              <div
                key={v}
                className="flex items-center gap-1"
              >
                <div className="w-3 h-[2px] bg-slate-300" />
                <span className="text-[10px] text-slate-400">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};

export default Beaker;