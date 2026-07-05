import React from "react";
import {
  Globe2,
  BookOpen,
  GraduationCap,
  Users,
  School,
  FlaskConical,
  Brain,
  Award,
} from "lucide-react";

const stats = [
  {
    title: "Countries",
    value: "120+",
    icon: Globe2,
    color: "text-cyan-400",
  },
  {
    title: "Curricula",
    value: "250+",
    icon: BookOpen,
    color: "text-green-400",
  },
  {
    title: "Subjects",
    value: "2,000+",
    icon: GraduationCap,
    color: "text-yellow-400",
  },
  {
    title: "Students",
    value: "1M+",
    icon: Users,
    color: "text-pink-400",
  },
  {
    title: "Schools",
    value: "8,500+",
    icon: School,
    color: "text-indigo-400",
  },
  {
    title: "Virtual Labs",
    value: "150+",
    icon: FlaskConical,
    color: "text-orange-400",
  },
  {
    title: "AI Learning Sessions",
    value: "5M+",
    icon: Brain,
    color: "text-purple-400",
  },
  {
    title: "Certificates",
    value: "750K+",
    icon: Award,
    color: "text-emerald-400",
  },
];

const GlobalStatistics = () => {
  return (
    <section className="mt-20">

      <div className="text-center mb-12">

        <h2 className="text-4xl font-bold text-white">
          Learning Without Borders
        </h2>

        <p className="mt-4 text-slate-400 max-w-3xl mx-auto">
          Our vision is to connect learners with high-quality curricula,
          interactive resources, AI-powered learning, and virtual laboratories
          from around the world.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-slate-900 hover:border-cyan-500 transition-all duration-300 p-8"
            >

              <div
                className={`w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center ${item.color}`}
              >

                <Icon size={32} />

              </div>

              <h3 className="mt-8 text-4xl font-black text-white">

                {item.value}

              </h3>

              <p className="mt-3 text-slate-400">

                {item.title}

              </p>

            </div>

          );

        })}

      </div>

    </section>
  );
};

export default GlobalStatistics;