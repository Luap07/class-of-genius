import React from "react";
import {
  Brain,
  Globe2,
  FlaskConical,
  GraduationCap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    title: "AI Learning Assistant",
    description:
      "Get explanations, personalized tutoring, quizzes, and instant feedback powered by AI.",
    icon: Brain,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "Global Curriculum",
    description:
      "Access curricula from multiple countries and international education systems in one place.",
    icon: Globe2,
    color: "from-green-500 to-emerald-600",
  },
  {
    title: "Virtual Laboratories",
    description:
      "Perform interactive science experiments without needing a physical laboratory.",
    icon: FlaskConical,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Structured Learning Paths",
    description:
      "Follow organized lessons, topics, and milestones that guide you from beginner to advanced.",
    icon: GraduationCap,
    color: "from-purple-500 to-violet-600",
  },
  {
    title: "Learning Analytics",
    description:
      "Track progress, strengths, study time, and performance with detailed dashboards.",
    icon: BarChart3,
    color: "from-pink-500 to-rose-600",
  },
  {
    title: "Trusted Content",
    description:
      "Curriculum-aligned lessons, assessments, and resources designed for effective learning.",
    icon: ShieldCheck,
    color: "from-yellow-500 to-amber-600",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="mt-24">

      <div className="text-center mb-14">

        <h2 className="text-5xl font-black text-white">
          Why Choose Our Platform?
        </h2>

        <p className="text-slate-400 mt-5 max-w-3xl mx-auto leading-8">
          Learn with a modern platform that combines curriculum,
          artificial intelligence, virtual laboratories, assessments,
          and personalized learning into one experience.
        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

        {features.map((feature) => {

          const Icon = feature.icon;

          return (

            <div
              key={feature.title}
              className="group rounded-3xl border border-slate-800 bg-slate-900 hover:border-cyan-500 transition-all duration-300 p-8"
            >

              <div
                className={`w-18 h-18 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
              >

                <Icon
                  size={34}
                  className="text-white"
                />

              </div>

              <h3 className="mt-8 text-2xl font-bold text-white">

                {feature.title}

              </h3>

              <p className="mt-4 text-slate-400 leading-7">

                {feature.description}

              </p>

            </div>

          );

        })}

      </div>

    </section>
  );
};

export default WhyChooseUs;