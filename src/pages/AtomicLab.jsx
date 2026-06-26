import React, { useEffect, useState } from "react";

const randomBetween = (min, max) =>
  Math.random() * (max - min) + min;

const createParticles = (count, type) => {
  return Array.from({ length: count }).map(() => ({
    x: randomBetween(-30, 30),
    y: randomBetween(-30, 30),
    vx: randomBetween(-0.3, 0.3),
    vy: randomBetween(-0.3, 0.3),
    type,
  }));
};

const NuclearLab = () => {
  const [protons, setProtons] = useState(() =>
    createParticles(8, "proton")
  );

  const [neutrons, setNeutrons] = useState(() =>
    createParticles(8, "neutron")
  );

  const [decay, setDecay] = useState(false);
  const [energy, setEnergy] = useState(0);

  // animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setProtons((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
        }))
      );

      setNeutrons((prev) =>
        prev.map((n) => ({
          ...n,
          x: n.x + n.vx,
          y: n.y + n.vy,
        }))
      );

      if (decay) {
        setEnergy((e) => e + 2);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [decay]);

  const triggerDecay = () => {
    setDecay(true);

    // simulate particle break
    setProtons((prev) =>
      prev.slice(0, Math.max(3, prev.length - 2))
    );
    setNeutrons((prev) =>
      prev.slice(0, Math.max(3, prev.length - 2))
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold mb-6">
        ⚛️ Nuclear Lab v1
      </h1>

      {/* Core nucleus */}
      <div className="flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-10">

        <div className="relative w-72 h-72 rounded-full border border-purple-500 flex items-center justify-center overflow-hidden">

          {/* Protons */}
          {protons.map((p, i) => (
            <div
              key={i}
              className="absolute w-5 h-5 bg-red-500 rounded-full shadow-lg"
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
              }}
            />
          ))}

          {/* Neutrons */}
          {neutrons.map((n, i) => (
            <div
              key={i}
              className="absolute w-5 h-5 bg-blue-500 rounded-full shadow-lg"
              style={{
                transform: `translate(${n.x}px, ${n.y}px)`,
              }}
            />
          ))}

          {/* nucleus glow */}
          <div className="absolute w-16 h-16 bg-purple-500 rounded-full blur-xl opacity-40" />
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={triggerDecay}
            className="bg-red-600 px-5 py-2 rounded-lg font-bold"
          >
            Trigger Decay
          </button>

          <button
            onClick={() => {
              setProtons(createParticles(8, "proton"));
              setNeutrons(createParticles(8, "neutron"));
              setDecay(false);
              setEnergy(0);
            }}
            className="bg-green-600 px-5 py-2 rounded-lg font-bold"
          >
            Reset Atom
          </button>
        </div>
      </div>

      {/* Energy meter */}
      <div className="mt-8 bg-slate-900 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-3">
          Nuclear Energy Output
        </h2>

        <div className="text-4xl text-yellow-400 font-bold">
          {energy} MeV
        </div>

        <div className="w-full h-3 bg-slate-700 mt-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${Math.min(energy, 100)}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-8 bg-slate-900 p-6 rounded-xl text-slate-300">
        <h2 className="text-xl font-bold mb-2">
          How it works
        </h2>

        <ul className="list-disc list-inside space-y-2">
          <li>Red particles = Protons</li>
          <li>Blue particles = Neutrons</li>
          <li>Particles move randomly (quantum motion simulation)</li>
          <li>Decay reduces nucleus stability</li>
          <li>Energy increases during decay events</li>
        </ul>
      </div>
    </div>
  );
};

export default NuclearLab;