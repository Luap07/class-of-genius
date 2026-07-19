import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Globe,
  Laptop,
  Briefcase,
  Palette,
  HeartPulse,
  Landmark,
  GraduationCap,
  Cpu,
  Code2,
  Shield,
  Database,
} from "lucide-react";

/* ==========================================
   SUBJECTS
========================================== */

const SUBJECTS = {
  Science: [
    {
      id: "physics",
      title: "Physics",
      description: "Mechanics, Electricity, Waves & Modern Physics",
      icon: Atom,
      color: "from-cyan-500 to-blue-600",
    },
    {
      id: "chemistry",
      title: "Chemistry",
      description: "Organic, Inorganic & Physical Chemistry",
      icon: FlaskConical,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "biology",
      title: "Biology",
      description: "Genetics, Ecology & Human Biology",
      icon: Dna,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "mathematics",
      title: "Mathematics",
      description: "Pure & Applied Mathematics",
      icon: Calculator,
      color: "from-purple-500 to-indigo-600",
    },
  ],

  Technology: [
    {
      id: "computer-science",
      title: "Computer Science",
      description: "Programming, AI & Algorithms",
      icon: Laptop,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "software-engineering",
      title: "Software Engineering",
      description: "Full Stack Development",
      icon: Code2,
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "cybersecurity",
      title: "Cyber Security",
      description: "Ethical Hacking & Network Security",
      icon: Shield,
      color: "from-red-500 to-pink-500",
    },
    {
      id: "artificial-intelligence",
      title: "Artificial Intelligence",
      description: "Machine Learning & Deep Learning",
      icon: Cpu,
      color: "from-violet-500 to-purple-500",
    },
  ],

  Business: [
    {
      id: "accounting",
      title: "Accounting",
      description: "Financial & Management Accounting",
      icon: Briefcase,
      color: "from-emerald-500 to-green-600",
    },
  ],

  Arts: [
    {
      id: "fine-art",
      title: "Fine Art",
      description: "Creative Design & Visual Arts",
      icon: Palette,
      color: "from-pink-500 to-rose-500",
    },
  ],

  Geography: [
    {
      id: "geography",
      title: "Geography",
      description: "Physical & Human Geography",
      icon: Globe,
      color: "from-teal-500 to-cyan-500",
    },
  ],

  Health: [
    {
      id: "anatomy",
      title: "Anatomy",
      description: "Human Body Systems",
      icon: HeartPulse,
      color: "from-red-500 to-orange-500",
    },
  ],

  University: [
    {
      id: "engineering",
      title: "Engineering",
      description: "Engineering Courses",
      icon: Cpu,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "computer-science",
      title: "Computer Science",
      description: "University CS Courses",
      icon: Database,
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: "law",
      title: "Law",
      description: "Law Faculty",
      icon: Landmark,
      color: "from-amber-500 to-yellow-500",
    },
    {
      id: "medicine",
      title: "Medicine",
      description: "Medical Sciences",
      icon: HeartPulse,
      color: "from-red-500 to-pink-500",
    },
  ],
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
    },
  },
};

export default function CategorySubjects() {
  const navigate = useNavigate();

  const { category } = useParams();

  const subjects = SUBJECTS[category] || [];
    return (
    <div className="min-h-screen bg-[#040B14] text-white overflow-hidden">

      {/* ================= BACKGROUND ================= */}

      <div className="fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f2b46_0%,#040B14_60%)]" />

        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[170px]" />

        <div className="absolute inset-0 opacity-[0.04]
        [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]
        [background-size:45px_45px]" />

      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* ================= HERO ================= */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          className="mb-16"
        >

          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={18} />

            Back to Categories
          </button>

          <h1 className="mt-8 text-5xl lg:text-6xl font-black tracking-tight">

            {category}

            <span className="text-cyan-400">
              {" "}Subjects
            </span>

          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-400">

            Choose a subject to explore available learning paths,
            practical lessons, projects and certifications.

          </p>

        </motion.div>

        {/* ================= SUBJECT GRID ================= */}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
                      {subjects.map((subject) => {

            const Icon = subject.icon;

            return (

              <motion.div
                key={subject.id}
                variants={item}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                whileTap={{
                  scale: .98,
                }}
                onClick={() =>
                  navigate(
                    `/courses/${category}/${subject.id}`
                  )
                }
                className="group cursor-pointer relative overflow-hidden rounded-[30px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"
              >

                {/* Gradient */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${subject.color}`}
                />

                {/* Glow */}
                <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition duration-500" />

                <div className="relative z-10 p-8">

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${subject.color}`}
                  >
                    <Icon size={30} />
                  </div>

                  <h2 className="mt-8 text-3xl font-bold group-hover:text-white">
                    {subject.title}
                  </h2>

                  <p className="mt-4 leading-7 text-slate-400 group-hover:text-slate-200 transition">
                    {subject.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between">

                    <span className="text-cyan-400 font-semibold">
                      Explore Subject
                    </span>

                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">

                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1 transition"
                      />

                    </div>

                  </div>

                </div>

              </motion.div>

            );

          })}

        </motion.div>

        {/* ================= FOOTER CTA ================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: .6,
          }}
          className="mt-24 rounded-[32px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-10 text-center"
        >

          <GraduationCap
            size={60}
            className="mx-auto text-cyan-400"
          />

          <h2 className="mt-6 text-4xl font-black">
            Learn Without Limits
          </h2>

          <p className="mt-4 max-w-3xl mx-auto text-slate-400 leading-8">
            Every subject contains professional courses,
            practical projects, quizzes, certificates,
            AI tutoring and interactive laboratories.
          </p>

          <button
            onClick={() => navigate("/courses")}
            className="mt-10 px-8 py-4 rounded-2xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
          >
            Browse More Categories
          </button>

        </motion.div>

      </div>

    </div>
  );
}