import React from "react";
import { Dna } from "lucide-react";
import { Link } from "react-router-dom";

export default function BiologyLab() {
  const experiments = [
    "Cell Structure",
    "Microscope Simulation",
    "Genetics Lab",
    "Photosynthesis",
    "Human Anatomy",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Dna className="text-pink-400" size={40} />
          <h1 className="text-5xl font-black">Biology Laboratory</h1>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((item) => (
            <div
              key={item}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold">{item}</h3>
              <button className="mt-4 px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700">
                Launch Experiment
              </button>
            </div>
          ))}
        </div>

        <Link to="/" className="inline-block mt-10 text-pink-400">
          ← Back Home
        </Link>
      </div>
    </div>
  );
}