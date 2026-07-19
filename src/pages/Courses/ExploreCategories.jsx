import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  Atom,
  Laptop,
  Briefcase,
  Palette,
  Globe,
  HeartPulse,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    id: "Science",
    title: "Science",
    subtitle: "Physics • Chemistry • Biology • Mathematics",
    icon: Atom,
    gradient: "from-cyan-500 to-blue-600",
    glow: "bg-cyan-500/20",
    courses: "120+ Courses",
  },
  {
    id: "Technology",
    title: "Technology",
    subtitle: "Programming • AI • Cyber Security",
    icon: Laptop,
    gradient: "from-indigo-500 to-blue-600",
    glow: "bg-indigo-500/20",
    courses: "90+ Courses",
  },
  {
    id: "Business",
    title: "Business",
    subtitle: "Accounting • Finance • Marketing",
    icon: Briefcase,
    gradient: "from-emerald-500 to-green-600",
    glow: "bg-emerald-500/20",
    courses: "70+ Courses",
  },
  {
    id: "Arts",
    title: "Arts",
    subtitle: "Design • Literature • Creative Arts",
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    glow: "bg-pink-500/20",
    courses: "60+ Courses",
  },
  {
    id: "Geography",
    title: "Geography",
    subtitle: "Earth Science • Environment",
    icon: Globe,
    gradient: "from-teal-500 to-cyan-600",
    glow: "bg-teal-500/20",
    courses: "40+ Courses",
  },
  {
    id: "Health",
    title: "Health",
    subtitle: "Anatomy • Nursing • Public Health",
    icon: HeartPulse,
    gradient: "from-red-500 to-orange-600",
    glow: "bg-red-500/20",
    courses: "80+ Courses",
  },
  {
    id: "University",
    title: "University",
    subtitle: "Engineering • Medicine • Law • Computer Science",
    icon: GraduationCap,
    gradient: "from-yellow-500 to-amber-600",
    glow: "bg-yellow-500/20",
    courses: "250+ Courses",
  },
];

export default function ExploreCategories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040B14] text-white overflow-hidden">

      <div className="fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#102845_0%,#040B14_65%)]" />

        <div className="absolute top-0 left-0 w-[550px] h-[550px] rounded-full bg-cyan-500/10 blur-[180px]" />

        <div className="absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[180px]" />

        <div
          className="absolute inset-0 opacity-[0.04]
          [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)]
          [background-size:42px_42px]"
        />

      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        <motion.div
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:.6 }}
          className="text-center"
        >

          <div className="inline-flex px-5 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10">

            <span className="text-cyan-300 font-semibold">
              Explore Every Learning Category
            </span>

          </div>

          <h1 className="mt-8 text-6xl font-black leading-tight">

            Choose Your

            <span className="text-cyan-400">
              {" "}Learning Path
            </span>

          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-slate-400 text-lg leading-8">

            Every category contains multiple subjects,
            professional courses,
            certificates,
            AI Tutor,
            practical projects
            and interactive labs.

          </p>

        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mt-20">
            {categories.map((category, index) => {

  const Icon = category.icon;

  return (

    <motion.div
      key={category.id}
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: .45,
        delay: index * .08,
      }}
      whileHover={{
        y: -12,
        scale: 1.02,
      }}
      whileTap={{
        scale: .98,
      }}
      onClick={() =>
        navigate(`/courses/${category.id}`)
      }
      className="group cursor-pointer relative overflow-hidden rounded-[34px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"
    >

      {/* Hover Gradient */}

      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-br ${category.gradient}`}
      />

      {/* Glow */}

      <div
        className={`absolute -right-24 -top-24 w-64 h-64 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition duration-700 ${category.glow}`}
      />

      {/* Content */}

      <div className="relative z-10 p-9">

        <div
          className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-2xl`}
        >

          <Icon
            size={36}
            className="text-white"
          />

        </div>

        <div className="mt-8">

          <h2 className="text-3xl font-black">

            {category.title}

          </h2>

          <p className="mt-4 text-slate-300 leading-7">

            {category.subtitle}

          </p>

        </div>

        <div className="mt-8 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2">

          <span className="text-cyan-300 font-semibold">

            {category.courses}

          </span>

        </div>

        <div className="mt-10 flex items-center justify-between">

          <span className="font-semibold text-cyan-300">

            Browse Subjects

          </span>

          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">

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
        </div>

        {/* ================= CTA ================= */}

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
            duration: 0.6,
          }}
          className="mt-24 overflow-hidden rounded-[36px] border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 p-12"
        >

          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            <div>

              <h2 className="text-4xl lg:text-5xl font-black">

                Unlimited Learning Starts Here

              </h2>

              <p className="mt-6 max-w-2xl text-slate-300 leading-8">

                Explore thousands of professional courses,
                interactive virtual laboratories,
                AI-powered tutoring,
                quizzes,
                downloadable resources,
                real-world projects,
                and internationally recognized certificates.

              </p>

            </div>

            <button
              onClick={() => navigate("/courses")}
              className="rounded-2xl bg-cyan-500 px-10 py-5 text-lg font-bold text-slate-950 transition hover:bg-cyan-400"
            >

              Back to Courses

            </button>

          </div>

        </motion.div>

      </div>

    </div>

  );

}