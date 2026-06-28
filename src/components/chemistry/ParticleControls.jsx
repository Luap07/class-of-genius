import React from "react";

function Counter({
  label,
  value,
  setValue,
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="font-semibold mb-3">
        {label}
      </h3>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setValue(Math.max(0, value - 1))}
          className="px-4 py-2 bg-red-500 rounded-lg"
        >
          -
        </button>

        <span className="text-xl font-bold w-12 text-center">
          {value}
        </span>

        <button
          onClick={() => setValue(value + 1)}
          className="px-4 py-2 bg-green-500 rounded-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function ParticleControls({
  protons,
  setProtons,
  neutrons,
  setNeutrons,
  electrons,
  setElectrons,
}) {
  return (
    <div className="space-y-4">
      <Counter
        label="Protons"
        value={protons}
        setValue={setProtons}
      />

      <Counter
        label="Neutrons"
        value={neutrons}
        setValue={setNeutrons}
      />

      <Counter
        label="Electrons"
        value={electrons}
        setValue={setElectrons}
      />
    </div>
  );
}