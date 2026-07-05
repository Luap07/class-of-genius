// src/pages/labs/chemistry/components/IonAnimation.jsx

import React from "react";
import useIonMovement from "../../../hooks/ElectrochemistryLab/useIonMovement";

const Ion = ({ x, y, label, positive }) => (
  <div
    className="absolute transition-all duration-75"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)",
    }}
  >
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-lg ${
        positive
          ? "bg-blue-500 text-white border-blue-300"
          : "bg-orange-500 text-white border-orange-300"
      }`}
    >
      {label}
    </div>
  </div>
);

const IonAnimation = ({
  running = false,
  voltage = 0,
  anodeIon = "Zn²⁺",
  cathodeIon = "Cu²⁺",
}) => {
  const { cations, anions } = useIonMovement({
    running,
    voltage,
    anodeIon,
    cathodeIon,
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* Hide ions until the experiment starts */}

      {running && (
        <>
          {/* Positive ions */}
          {cations.map((ion) => (
            <Ion
              key={ion.id}
              x={ion.x}
              y={ion.y}
              label={ion.label}
              positive
            />
          ))}

          {/* Negative ions */}
          {anions.map((ion) => (
            <Ion
              key={ion.id}
              x={ion.x}
              y={ion.y}
              label={ion.label}
              positive={false}
            />
          ))}
        </>
      )}

    </div>
  );
};

export default IonAnimation;