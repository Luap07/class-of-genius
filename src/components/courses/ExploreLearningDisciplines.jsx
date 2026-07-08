import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Brain,
  ShieldCheck,
  Cloud,
  Database,
  Cpu,
  Stethoscope,
  HeartPulse,
  Pill,
  Scale,
  Landmark,
  Briefcase,
  Calculator,
  LineChart,
  Megaphone,
  Building2,
  Wrench,
  Zap,
  Atom,
  FlaskConical,
  Dna,
  Sigma,
  Leaf,
  Globe2,
  Palette,
  Camera,
  Music4,
  Languages,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const disciplines = [
  {
    icon: Code2,
    name: "Computer Science",
    courses: 2450,
    color: "from-blue-500 to-cyan-500",
    description:
      "Programming, algorithms, operating systems and software engineering.",
  },
  {
    icon: Brain,
    name: "Artificial Intelligence",
    courses: 980,
    color: "from-violet-500 to-fuchsia-500",
    description:
      "Machine learning, deep learning and intelligent systems.",
  },
  {
    icon: ShieldCheck,
    name: "Cybersecurity",
    courses: 620,
    color: "from-red-500 to-orange-500",
    description:
      "Ethical hacking, digital security and network protection.",
  },
  {
    icon: Cloud,
    name: "Cloud Computing",
    courses: 510,
    color: "from-sky-500 to-blue-500",
    description:
      "AWS, Azure, Google Cloud and cloud architecture.",
  },
  {
    icon: Database,
    name: "Data Science",
    courses: 790,
    color: "from-emerald-500 to-green-500",
    description:
      "Data analysis, statistics and big data technologies.",
  },
  {
    icon: Cpu,
    name: "Software Engineering",
    courses: 1340,
    color: "from-indigo-500 to-blue-600",
    description:
      "Modern software development and engineering principles.",
  },
  {
    icon: Stethoscope,
    name: "Medicine",
    courses: 2150,
    color: "from-rose-500 to-red-500",
    description:
      "Medical sciences, diagnosis and clinical practice.",
  },
  {
    icon: HeartPulse,
    name: "Nursing",
    courses: 890,
    color: "from-pink-500 to-rose-500",
    description:
      "Patient care, healthcare practice and clinical nursing.",
  },
  {
    icon: Pill,
    name: "Pharmacy",
    courses: 620,
    color: "from-purple-500 to-pink-500",
    description:
      "Drug development, pharmacology and therapeutics.",
  },
  {
    icon: Scale,
    name: "Law",
    courses: 780,
    color: "from-amber-600 to-yellow-500",
    description:
      "Legal systems, constitutional law and advocacy.",
  },
  {
    icon: Landmark,
    name: "Political Science",
    courses: 510,
    color: "from-slate-600 to-slate-800",
    description:
      "Government, diplomacy and international politics.",
  },
  {
    icon: Briefcase,
    name: "Business Administration",
    courses: 1420,
    color: "from-orange-500 to-amber-500",
    description:
      "Leadership, management and entrepreneurship.",
  },
  {
    icon: Calculator,
    name: "Accounting",
    courses: 640,
    color: "from-lime-500 to-green-500",
    description:
      "Financial reporting, taxation and auditing.",
  },
  {
    icon: LineChart,
    name: "Economics",
    courses: 570,
    color: "from-cyan-500 to-blue-500",
    description:
      "Microeconomics, macroeconomics and global markets.",
  },
  {
    icon: Megaphone,
    name: "Marketing",
    courses: 680,
    color: "from-pink-500 to-purple-500",
    description:
      "Digital marketing, branding and advertising.",
  },
  {
    icon: Building2,
    name: "Architecture",
    courses: 530,
    color: "from-stone-500 to-slate-600",
    description:
      "Building design, planning and sustainable architecture.",
  },
  {
    icon: Wrench,
    name: "Mechanical Engineering",
    courses: 840,
    color: "from-gray-500 to-slate-700",
    description:
      "Machines, manufacturing and engineering systems.",
  },
  {
    icon: Zap,
    name: "Electrical Engineering",
    courses: 760,
    color: "from-yellow-400 to-orange-500",
    description:
      "Power systems, electronics and embedded systems.",
  },
  {
    icon: Atom,
    name: "Physics",
    courses: 640,
    color: "from-indigo-500 to-violet-600",
    description:
      "Mechanics, electricity, optics and quantum physics.",
  },
  {
    icon: FlaskConical,
    name: "Chemistry",
    courses: 710,
    color: "from-green-500 to-teal-500",
    description:
      "Organic, inorganic and analytical chemistry.",
  },
  {
    icon: Dna,
    name: "Biology",
    courses: 860,
    color: "from-emerald-500 to-lime-500",
    description:
      "Genetics, microbiology and life sciences.",
  },
  {
    icon: Sigma,
    name: "Mathematics",
    courses: 940,
    color: "from-blue-500 to-indigo-500",
    description:
      "Algebra, calculus, geometry and statistics.",
  },
  {
    icon: Leaf,
    name: "Agriculture",
    courses: 450,
    color: "from-green-600 to-lime-500",
    description:
      "Crop production, livestock and agricultural technology.",
  },
  {
    icon: Globe2,
    name: "Geography",
    courses: 390,
    color: "from-sky-500 to-cyan-500",
    description:
      "Earth systems, mapping and environmental studies.",
  },
  {
    icon: Palette,
    name: "Graphic Design",
    courses: 720,
    color: "from-fuchsia-500 to-pink-500",
    description:
      "Branding, illustration and digital creativity.",
  },
  {
    icon: Camera,
    name: "Photography",
    courses: 310,
    color: "from-slate-500 to-gray-700",
    description:
      "Photography, editing and visual storytelling.",
  },
  {
    icon: Music4,
    name: "Music",
    courses: 470,
    color: "from-purple-500 to-indigo-500",
    description:
      "Music theory, production and performance.",
  },
  {
    icon: Languages,
    name: "Languages",
    courses: 980,
    color: "from-cyan-500 to-teal-500",
    description:
      "English, French, Spanish and many more.",
  },
];

  const ExploreLearningDisciplines = ({
    onSelectDiscipline,
}) => {  return (
        <section className="space-y-12">

      {/* =========================
          Header
      ========================== */}

      <div className="max-w-4xl mx-auto text-center">

        <span
          className="
            inline-flex
            items-center
            rounded-full
            bg-blue-500/10
            border
            border-blue-500/20
            px-4
            py-2
            text-blue-400
            font-semibold
            text-sm
          "
        >
          Explore Learning Disciplines
        </span>

        <h2 className="mt-6 text-4xl lg:text-5xl font-extrabold">
          Learn Anything.
          <br />
          Build Everything.
        </h2>

        <p className="mt-5 text-slate-400 text-lg leading-8 max-w-3xl mx-auto">
          Explore thousands of expertly designed courses across science,
          technology, engineering, medicine, business, arts and many more.
          Start your journey in the discipline that matches your goals.
        </p>

      </div>

      {/* =========================
          Stats
      ========================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          {
            value: "30+",
            label: "Disciplines",
          },
          {
            value: "15K+",
            label: "Courses",
          },
          {
            value: "250K+",
            label: "Lessons",
          },
          {
            value: "1M+",
            label: "Topics",
          },
        ].map((item) => (

          <motion.div
            key={item.label}
            whileHover={{
              y: -6,
            }}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              p-6
              text-center
            "
          >

            <h3 className="text-4xl font-extrabold text-blue-400">
              {item.value}
            </h3>

            <p className="mt-2 text-slate-400">
              {item.label}
            </p>

          </motion.div>

        ))}

      </div>

      {/* =========================
          Discipline Cards
      ========================== */}

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {disciplines.map((discipline, index) => {

          const Icon = discipline.icon;

          return (

            <motion.div
  key={discipline.name}
  onClick={() => onSelectDiscipline?.(discipline.name)}
  initial={{
    opacity: 0,
    y: 25,
  }}
  whileInView={{
    opacity: 1,
    y: 0,
  }}
  viewport={{
    once: true,
  }}
  transition={{
    delay: index * 0.03,
  }}
  whileHover={{
    y: -10,
  }}
  className="
    cursor-pointer
    overflow-hidden
    rounded-[30px]
    border
    border-slate-800
    bg-slate-900
  "
>
              <div
                className={`
                  bg-gradient-to-r
                  ${discipline.color}
                  p-8
                `}
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-white/20
                    flex
                    items-center
                    justify-center
                  "
                >

                  <Icon size={32} />

                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {discipline.name}
                </h3>

              </div>

              <div className="p-8">

                <p className="text-slate-400 leading-7">
                  {discipline.description}
                </p>

                <div className="mt-6 flex items-center justify-between">

                  <div>

                    <p className="text-3xl font-bold text-blue-400">
                      {discipline.courses.toLocaleString()}+
                    </p>

                    <p className="text-slate-500">
                      Courses
                    </p>

                  </div>

                  <button
                 onClick={(e) => {
                  e.stopPropagation();
                  onSelectDiscipline?.(discipline.name);
                   }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition px-5 py-3 font-semibold">
             Explore
          <ArrowRight size={18} />
            </button>
                </div>

              </div>

            </motion.div>

          );

        })}

      </div>

      {/* =========================
          Bottom CTA
      ========================== */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
        className="
          rounded-[36px]
          bg-gradient-to-r
          from-blue-600
          via-indigo-600
          to-violet-700
          p-10
          lg:p-14
        "
      >

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>

            <GraduationCap
              size={56}
              className="mb-6"
            />

            <h2 className="text-4xl font-extrabold">

              Can't decide
              what to learn?

            </h2>

            <p className="mt-5 text-blue-100 text-lg leading-8">

              Let Wonder AI recommend the best discipline,
              courses and learning path based on your goals,
              experience and interests.

            </p>

          </div>

          <div className="flex justify-center lg:justify-end">

            <button
              className="
                rounded-2xl
                bg-white
                text-slate-900
                px-10
                py-5
                text-lg
                font-bold
                hover:scale-105
                transition
                flex
                items-center
                gap-3
              "
            >

              Get AI Recommendation

              <ArrowRight size={22} />

            </button>

          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default ExploreLearningDisciplines;