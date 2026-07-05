import React from "react";
import {
  Calculator,
  FlaskConical,
  Atom,
  Dna,
  BookOpen,
  Languages,
  Globe,
  Landmark,
  Laptop,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const subjects = [
  {
    name: "Mathematics",
    lessons: "420 Lessons",
    icon: Calculator,
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Physics",
    lessons: "310 Lessons",
    icon: Atom,
    color: "from-indigo-500 to-violet-500",
  },
  {
    name: "Chemistry",
    lessons: "365 Lessons",
    icon: FlaskConical,
    color: "from-emerald-500 to-green-500",
  },
  {
    name: "Biology",
    lessons: "345 Lessons",
    icon: Dna,
    color: "from-lime-500 to-green-600",
  },
  {
    name: "English",
    lessons: "290 Lessons",
    icon: Languages,
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "Geography",
    lessons: "185 Lessons",
    icon: Globe,
    color: "from-cyan-500 to-sky-500",
  },
  {
    name: "History",
    lessons: "170 Lessons",
    icon: Landmark,
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Computer Science",
    lessons: "260 Lessons",
    icon: Laptop,
    color: "from-purple-500 to-indigo-500",
  },
];

const PopularSubjects = () => {
  return (
    <section className="mt-20">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-bold text-white">
            Popular Subjects
          </h2>

          <p className="text-slate-400 mt-2">
            Start learning from the world's most studied subjects.
          </p>

        </div>

        <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">

          Browse All

          <ArrowRight size={18} />

        </button>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {subjects.map((subject) => {

          const Icon = subject.icon;

          return (

            <div
              key={subject.name}
              className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500 transition-all duration-300 p-6 cursor-pointer"
            >

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center`}
              >

                <Icon
                  size={30}
                  className="text-white"
                />

              </div>

              <h3 className="mt-6 text-xl font-bold text-white">

                {subject.name}

              </h3>

              <p className="mt-2 text-slate-400">

                {subject.lessons}

              </p>

              <div className="mt-8 flex items-center justify-between">

                <span className="text-cyan-400 text-sm font-semibold">

                  Start Learning

                </span>

                <TrendingUp
                  size={18}
                  className="text-cyan-400 group-hover:translate-x-1 transition"
                />

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
};

export default PopularSubjects;