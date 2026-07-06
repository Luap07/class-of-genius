import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";

import curricula from "../../data/Curriculum/curricula";

const GradePage = () => {
  const navigate = useNavigate();
  const { country, level, grade } = useParams();

  // Normalize country slug
  const countryData = curricula.find(
    (c) =>
      c.country.toLowerCase().replace(/\s+/g, "-") === country
  );

  if (!countryData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Country not found.
      </div>
    );
  }

  // FIX: levels is an ARRAY, not object
  const levelData = countryData.levels?.find(
    (l) => l.id === level
  );

  if (!levelData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Level not found.
      </div>
    );
  }

  // FIX: supports BOTH subjects and years
  const items = levelData.subjects || levelData.years || [];

  if (!items.length) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        No content available for this level.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* HEADER */}
        <h1 className="text-5xl font-black">
          {levelData.name}
        </h1>

        <p className="text-slate-400 mt-3">
          Select a subject or study area
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-12">

          {items.map((item) => {
            const slug = item.toLowerCase().replace(/\s+/g, "-");

            return (
              <button
                key={item}
                onClick={() =>
                  navigate(
                    `/curriculum/${country}/${level}/${grade}/${slug}`
                  )
                }
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-cyan-500 transition duration-300 hover:-translate-y-1"
              >
                <BookOpen className="text-cyan-400 mb-5" />

                <h2 className="text-2xl font-bold">
                  {item}
                </h2>

                <p className="text-slate-400 mt-2">
                  Open content
                </p>

                <div className="flex justify-end mt-6">
                  <ArrowRight className="text-cyan-400" />
                </div>
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default GradePage;