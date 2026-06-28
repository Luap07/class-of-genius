import { useMemo, useState } from "react";
import elements from "../data/elements";

import AtomCanvas from "../components/atom/AtomCanvas";
import AtomStats from "../components/atom/AtomStats";
import ParticleControls from "../components/atom/ParticleControls";

// Reusable component for the top info cards
const StatCard = ({ label, value, colorClass = "text-white" }) => (
  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
    <p className="text-slate-400 text-sm">{label}</p>
    <h2 className={`text-2xl md:text-3xl font-bold mt-2 ${colorClass}`}>
      {value}
    </h2>
  </div>
);

export default function AtomBuilder() {
  const [protons, setProtons] = useState(1);
  const [neutrons, setNeutrons] = useState(0);
  const [electrons, setElectrons] = useState(1);

  const atomData = useMemo(() => {
    const element = elements.find((e) => e.number === protons) || null;
    const charge = protons - electrons;
    
    return {
      element,
      atomicNumber: protons,
      massNumber: protons + neutrons,
      charge,
      chargeText: charge === 0 ? "Neutral" : charge > 0 ? `+${charge}` : `${charge}`,
      chargeColor: charge === 0 ? "text-green-400" : charge > 0 ? "text-red-400" : "text-blue-400"
    };
  }, [protons, neutrons, electrons]);

  const { element, atomicNumber, massNumber, chargeText, chargeColor } = atomData;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Atom Builder
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            Interact with subatomic particles to visualize atomic structure.
          </p>
        </header>

        {/* Top Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Element" value={element?.name ?? "Unknown"} />
          <StatCard label="Atomic Number" value={atomicNumber} />
          <StatCard label="Mass Number" value={massNumber} />
          <StatCard label="Charge" value={chargeText} colorClass={chargeColor} />
        </section>

        {/* Main Workspace */}
        <main className="grid lg:grid-cols-4 gap-6">
          <ParticleControls 
            protons={protons} setProtons={setProtons}
            neutrons={neutrons} setNeutrons={setNeutrons}
            electrons={electrons} setElectrons={setElectrons}
          />
          
          <div className="lg:col-span-2">
            <AtomCanvas protons={protons} neutrons={neutrons} electrons={electrons} element={element} />
          </div>

          <AtomStats protons={protons} neutrons={neutrons} electrons={electrons} element={element} />
        </main>

        {/* Detailed Element Info */}
        <footer className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">Element Properties</h2>
          {element ? (
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-4xl font-bold">{element.name}</h3>
                <p className="text-cyan-400 text-xl font-mono">{element.symbol}</p>
                <p className="mt-6 text-slate-300 leading-relaxed">{element.description}</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Atomic Mass", value: element.mass },
                  { label: "Category", value: element.category },
                  { label: "Electron Config", value: element.config }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">{item.label}</span>
                    <span className="capitalize">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-red-400">No data found for atomic number {protons}.</p>
          )}
        </footer>
      </div>
    </div>
  );
}