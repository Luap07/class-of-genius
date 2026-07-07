import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Stethoscope,
  Cpu,
  Briefcase,
  Scale,
  Palette,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const paths = [
  {
    icon: Code2,
    title: "Frontend Development",
    level: "Beginner → Advanced",
    duration: "6 Months",
    students: "120K+",
    color: "from-blue-500 to-cyan-500",
    modules: [
      "HTML & CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Projects",
      "Certificate",
    ],
  },
  {
    icon: Cpu,
    title: "Artificial Intelligence",
    level: "Intermediate",
    duration: "8 Months",
    students: "85K+",
    color: "from-violet-500 to-fuchsia-500",
    modules: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "LLMs",
      "Capstone Project",
    ],
  },
  {
    icon: Stethoscope,
    title: "Medical Sciences",
    level: "University",
    duration: "4 Years",
    students: "40K+",
    color: "from-emerald-500 to-green-500",
    modules: [
      "Anatomy",
      "Physiology",
      "Biochemistry",
      "Pathology",
      "Clinical Practice",
      "Assessment",
    ],
  },
  {
    icon: Briefcase,
    title: "Business Management",
    level: "Professional",
    duration: "5 Months",
    students: "70K+",
    color: "from-orange-500 to-amber-500",
    modules: [
      "Marketing",
      "Finance",
      "Leadership",
      "Operations",
      "Strategy",
      "Certificate",
    ],
  },
  {
    icon: Scale,
    title: "Law",
    level: "University",
    duration: "4 Years",
    students: "32K+",
    color: "from-slate-600 to-slate-800",
    modules: [
      "Constitutional Law",
      "Contract Law",
      "Criminal Law",
      "Civil Procedure",
      "Advocacy",
      "Examinations",
    ],
  },
  {
    icon: Palette,
    title: "Graphic Design",
    level: "Beginner",
    duration: "3 Months",
    students: "95K+",
    color: "from-pink-500 to-rose-500",
    modules: [
      "Color Theory",
      "Typography",
      "Photoshop",
      "Illustrator",
      "Branding",
      "Portfolio",
    ],
  },
];

const LearningPaths = () => {
  return (
    <section className="space-y-12">

      <div className="text-center max-w-3xl mx-auto">

        <span className="inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 text-indigo-400 text-sm font-semibold">
          Learning Paths
        </span>

        <h2 className="mt-5 text-4xl font-extrabold">
          Follow a Structured Roadmap
        </h2>

        <p className="mt-4 text-slate-400 text-lg">
          Don't just take random courses.
          Complete guided learning paths designed by experts.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {paths.map((path, index) => {
          const Icon = path.icon;

          return (
            <motion.div
              key={path.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.08,
              }}
              whileHover={{
                y: -8,
              }}
              className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden"
            >

              <div
                className={`bg-gradient-to-r ${path.color} p-8`}
              >

                <div className="flex justify-between">

                  <div>

                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">

                      <Icon size={30} />

                    </div>

                    <h3 className="mt-6 text-3xl font-bold">
                      {path.title}
                    </h3>

                    <p className="mt-2 text-white/80">
                      {path.level}
                    </p>

                  </div>

                  <div className="text-right">

                    <p>{path.students}</p>

                    <p className="text-white/70 text-sm">
                      Learners
                    </p>

                    <p className="mt-4">
                      {path.duration}
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-8">

                <div className="space-y-4">

                  {path.modules.map((module) => (

                    <div
                      key={module}
                      className="flex items-center gap-3"
                    >

                      <CheckCircle2
                        size={18}
                        className="text-emerald-400"
                      />

                      <span>{module}</span>

                    </div>

                  ))}

                </div>

                <button
                  className="
                    mt-8
                    w-full
                    rounded-2xl
                    bg-blue-600
                    hover:bg-blue-700
                    transition
                    py-4
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  Start Learning

                  <ArrowRight size={20} />

                </button>

              </div>

            </motion.div>
          );
        })}

      </div>

    </section>
  );
};

export default LearningPaths;