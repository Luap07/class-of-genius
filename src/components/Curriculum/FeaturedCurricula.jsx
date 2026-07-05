import React from "react";
import {
  ArrowRight,
  Globe2,
  GraduationCap,
} from "lucide-react";

const curricula = [
  {
    name: "Nigeria",
    framework: "NERDC",
    levels: "Primary • JSS • SSS",
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "United Kingdom",
    framework: "National Curriculum",
    levels: "KS1 • KS2 • KS3 • KS4",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "United States",
    framework: "Common Core",
    levels: "K–12",
    color: "from-cyan-500 to-sky-600",
  },
  {
    name: "Cambridge",
    framework: "Cambridge International",
    levels: "Primary • Lower Secondary • IGCSE • A Level",
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "International Baccalaureate",
    framework: "IB",
    levels: "PYP • MYP • DP",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "India",
    framework: "CBSE",
    levels: "Primary • Secondary • Senior Secondary",
    color: "from-pink-500 to-rose-600",
  },
];

const FeaturedCurricula = () => {
  return (
    <section className="mt-16">

      <div className="flex items-center justify-between mb-8">

        <div>
          <h2 className="text-3xl font-bold text-white">
            Featured Curricula
          </h2>

          <p className="text-slate-400 mt-2">
            Explore educational frameworks from around the world.
          </p>
        </div>

        <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
          View All
          <ArrowRight size={18} />
        </button>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {curricula.map((item) => (

          <div
            key={item.name}
            className="group rounded-3xl border border-slate-800 bg-slate-900 hover:border-cyan-500 transition-all duration-300 overflow-hidden"
          >

            <div
              className={`h-2 bg-gradient-to-r ${item.color}`}
            />

            <div className="p-6">

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
              >
                <Globe2 className="text-white" size={28} />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-white">
                {item.name}
              </h3>

              <p className="text-cyan-400 mt-2">
                {item.framework}
              </p>

              <div className="flex items-center gap-2 mt-6 text-slate-400">

                <GraduationCap size={18} />

                <span>{item.levels}</span>

              </div>

              <button className="mt-8 w-full py-3 rounded-xl bg-slate-800 group-hover:bg-cyan-500 transition font-semibold">
                Explore Curriculum
              </button>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default FeaturedCurricula;