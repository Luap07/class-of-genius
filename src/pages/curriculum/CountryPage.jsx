import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GraduationCap, School, University, ArrowRight, Globe2 } from "lucide-react";
import curricula from "../../data/Curriculum/curricula";

const CountryPage = () => {
  const navigate = useNavigate();
  const { country } = useParams();

  // ✅ FIX: match by ID only
  const countryData = curricula.find(
    (item) => item.id === country
  );

  if (!countryData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Country Not Found</h1>
          <p className="text-slate-400 mt-4">
            This curriculum has not been added yet or URL is incorrect.
          </p>
        </div>
      </div>
    );
  }

  const levels = countryData.levels || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}
      <section className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="flex items-center gap-6">

            <div className="text-6xl">{countryData.flag}</div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Globe2 size={18} />
                Country Curriculum
              </div>

              <h1 className="text-5xl font-black mt-2">
                {countryData.country}
              </h1>

              <p className="text-slate-400 mt-3 text-lg">
                {countryData.curriculum}
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* LEVELS */}
      <section className="max-w-7xl mx-auto px-6 py-14">

        <h2 className="text-3xl font-bold mb-8">
          Choose an Educational Level
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">

          {levels.map((level) => {
            const Icon =
              level.id === "primary"
                ? School
                : level.id === "university"
                ? University
                : GraduationCap;

            return (
              <button
                key={level.id}
                onClick={() =>
                  navigate(`/curriculum/${country}/${level.id}`)
                }
                className="text-left bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500"
              >
                <div className="flex justify-between items-start">

                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
                      <Icon className="text-cyan-400" />
                    </div>

                    <h3 className="text-2xl font-bold mt-6">
                      {level.name}
                    </h3>

                    <p className="text-slate-400 mt-3">
                      Age: {level.age}
                    </p>
                  </div>

                  <ArrowRight className="text-cyan-400" />

                </div>
              </button>
            );
          })}

        </div>

      </section>

    </div>
  );
};

export default CountryPage;