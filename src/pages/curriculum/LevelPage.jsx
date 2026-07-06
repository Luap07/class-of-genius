import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Layers3 } from "lucide-react";
import curricula from "../../data/Curriculum/curricula";

const LevelPage = () => {
  const navigate = useNavigate();
  const { country, level } = useParams();

  const countryData = curricula.find(
    (item) => item.id === country
  );

  if (!countryData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Country not found.
      </div>
    );
  }

  const levelData = countryData.levels.find(
    (l) => l.id === level
  );

  if (!levelData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Level not found.
      </div>
    );
  }

  const years = levelData.years || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <h1 className="text-4xl font-black">
          {levelData.name}
        </h1>

        <p className="text-slate-400 mt-2">
          Select class/year
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">

          {years.map((year) => (
            <button
              key={year}
              onClick={() =>
                navigate(
                  `/curriculum/${country}/${level}/${year
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`
                )
              }
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition"
            >
              <Layers3 className="text-cyan-400 mb-6" />

              <h2 className="text-2xl font-bold">
                {year}
              </h2>

              <div className="flex justify-end mt-6">
                <ArrowRight className="text-cyan-400" />
              </div>
            </button>
          ))}

        </div>

      </div>
    </div>
  );
};

export default LevelPage;