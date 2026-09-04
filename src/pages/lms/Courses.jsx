import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Layers3,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Target,
  ArrowRight,
} from "lucide-react";

import CourseHero from "../../components/courses/CourseHero";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

/* =========================================================
   STAT COLORS
========================================================= */

const statThemes = {
  cyan: {
    border: "border-cyan-400/30",
    icon: "bg-cyan-400/10 text-cyan-300",
    number: "text-cyan-200",
  },

  violet: {
    border: "border-violet-400/30",
    icon: "bg-violet-400/10 text-violet-300",
    number: "text-violet-200",
  },

  blue: {
    border: "border-blue-400/30",
    icon: "bg-blue-400/10 text-blue-300",
    number: "text-blue-200",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function Courses() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    publishedCourses: null,
    courseCategories: null,
    learningMaterials: null,
  });

  const [loading, setLoading] = useState(true);

  /* =========================================================
     LOAD LIVE BACKEND STATS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/courses/stats`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch course statistics: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) return;

        const backendStats = data?.stats || {};

        /*
          These values come directly from the backend.

          Supported backend names:
          publishedCourses
          courseCategories
          learningMaterials

          Also supports snake_case names in case
          your backend returns those.
        */

        setStats({
          publishedCourses:
            backendStats.publishedCourses ??
            backendStats.published_courses ??
            backendStats.courses ??
            null,

          courseCategories:
            backendStats.courseCategories ??
            backendStats.course_categories ??
            backendStats.categories ??
            null,

          learningMaterials:
            backendStats.learningMaterials ??
            backendStats.learning_materials ??
            backendStats.materials ??
            null,
        });
      } catch (error) {
        console.error(
          "Courses statistics error:",
          error
        );

        if (!cancelled) {
          /*
            Keep values null instead of displaying
            fake 0 values when the backend fails.
          */
          setStats({
            publishedCourses: null,
            courseCategories: null,
            learningMaterials: null,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleBrowseCourses = () => {
    document
      .getElementById("learning-content")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleSubjects = () => {
    navigate("/subjects");
  };

  /* =========================================================
     LIVE BACKEND STATS
  ========================================================= */

  const statItems = [
    {
      label: "Published Courses",
      value: stats.publishedCourses,
      icon: BookOpen,
      theme: "cyan",
    },

    {
      label: "Course Categories",
      value: stats.courseCategories,
      icon: Layers3,
      theme: "violet",
    },

    {
      label: "Learning Materials",
      value: stats.learningMaterials,
      icon: FileText,
      theme: "blue",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_36%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-[140px]" />

        <div className="absolute -right-40 top-[45%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[160px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[160px]" />

      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <CourseHero
        onBrowseCourses={handleBrowseCourses}
      />

      {/* =====================================================
          LIVE BACKEND STATS
          
          ONLY 3 CARDS:
          1. Published Courses
          2. Course Categories
          3. Learning Materials
      ===================================================== */}

      <section className="border-y border-white/5 bg-[#050816]/90">

        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

          <div className="grid gap-4 md:grid-cols-3">

            {statItems.map((item, index) => {
              const Icon = item.icon;
              const theme = statThemes[item.theme];

              return (
                <motion.div
                  key={item.label}
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: index * 0.08,
                    duration: 0.45,
                  }}
                  className={`rounded-2xl border ${theme.border} bg-[#071126]/80 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1`}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {item.label}
                      </p>

                      <p
                        className={`mt-2 text-3xl font-black ${theme.number}`}
                      >
                        {loading
                          ? "—"
                          : item.value ?? "—"}
                      </p>

                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.icon}`}
                    >
                      <Icon size={22} />
                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          YOUR LEARNING SPACE
      ===================================================== */}

      <section
        id="learning-content"
        className="scroll-mt-24 border-b border-indigo-400/20 bg-gradient-to-br from-[#0d1027] via-[#080d20] to-[#07182b]"
      >

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">

            {/* LEFT */}

            <motion.div
              initial={{
                opacity: 0,
                x: -25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.55,
              }}
            >

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">

                <Sparkles size={14} />

                Your learning space

              </div>

              <h2 className="max-w-2xl text-3xl font-black leading-tight text-white md:text-5xl">
                Learning that is organized around what you want to master.
              </h2>

              <div className="mt-6 max-w-2xl space-y-4 text-base leading-8 text-slate-300">

                <p>
                  Explore published courses and learning materials
                  designed to help you study with structure and confidence.
                </p>

                <p>
                  Find the subjects you want to learn and access the
                  available educational content from one learning space.
                </p>

                <p>
                  New courses and learning materials added through the
                  backend can automatically become available to students.
                </p>

              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5">

                <button
                  type="button"
                  onClick={handleBrowseCourses}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-cyan-300/50 bg-cyan-400 px-5 py-3 text-sm font-black text-[#02111f] shadow-[0_0_30px_rgba(34,211,238,0.18)] transition duration-300 hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.30)]"
                >
                  Browse Courses

                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </button>

                <button
                  type="button"
                  onClick={handleSubjects}
                  className="group inline-flex items-center gap-2 text-sm font-bold text-violet-300 transition hover:text-violet-100"
                >
                  View Subjects

                  <ChevronRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />

                </button>

              </div>

            </motion.div>

            {/* RIGHT */}

            <motion.div
              initial={{
                opacity: 0,
                x: 25,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.55,
              }}
              className="grid grid-cols-2 gap-4"
            >

              <div className="rounded-3xl border border-cyan-300/50 bg-cyan-400/[0.08] p-5">

                <BookOpen
                  className="text-cyan-300"
                  size={25}
                />

                <p className="mt-5 text-lg font-black text-cyan-100">
                  Courses
                </p>

                <p className="mt-2 text-sm leading-6 text-cyan-100/60">
                  Explore published courses and organized educational
                  content.
                </p>

              </div>

              <div className="rounded-3xl border border-violet-300/50 bg-violet-400/[0.08] p-5">

                <Target
                  className="text-violet-300"
                  size={25}
                />

                <p className="mt-5 text-lg font-black text-violet-100">
                  Subjects
                </p>

                <p className="mt-2 text-sm leading-6 text-violet-100/60">
                  Find the subject you want to study and continue learning.
                </p>

              </div>

              <div className="rounded-3xl border border-emerald-300/50 bg-emerald-400/[0.08] p-5">

                <GraduationCap
                  className="text-emerald-300"
                  size={25}
                />

                <p className="mt-5 text-lg font-black text-emerald-100">
                  Study
                </p>

                <p className="mt-2 text-sm leading-6 text-emerald-100/60">
                  Stay focused and work through your available learning
                  content.
                </p>

              </div>

              <div className="rounded-3xl border border-orange-300/50 bg-orange-400/[0.08] p-5">

                <FileText
                  className="text-orange-300"
                  size={25}
                />

                <p className="mt-5 text-lg font-black text-orange-100">
                  Documents
                </p>

                <p className="mt-2 text-sm leading-6 text-orange-100/60">
                  Access uploaded PDF files and other learning materials.
                </p>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* =====================================================
          HOW LEARNING WORKS
      ===================================================== */}

      <section className="border-y border-white/5 bg-[#050816]">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              Simple learning flow
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              How learning works
            </h2>

            <p className="mt-4 text-slate-400">
              Explore your available courses, open the learning content,
              and use the uploaded materials to study.
            </p>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {/* 01 */}

            <div className="rounded-3xl border border-cyan-300/40 bg-cyan-400/[0.07] p-6">

              <div className="flex items-center justify-between">

                <span className="text-sm font-black text-cyan-300">
                  01
                </span>

                <BookOpen
                  size={22}
                  className="text-cyan-300"
                />

              </div>

              <h3 className="mt-8 text-xl font-black text-cyan-100">
                Course
              </h3>

              <p className="mt-3 text-sm leading-6 text-cyan-100/60">
                Choose a published course that matches what you want to
                learn.
              </p>

              <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-cyan-300 via-cyan-500 to-transparent" />

            </div>

            {/* 02 */}

            <div className="rounded-3xl border border-violet-300/40 bg-violet-400/[0.07] p-6">

              <div className="flex items-center justify-between">

                <span className="text-sm font-black text-violet-300">
                  02
                </span>

                <GraduationCap
                  size={22}
                  className="text-violet-300"
                />

              </div>

              <h3 className="mt-8 text-xl font-black text-violet-100">
                Learn
              </h3>

              <p className="mt-3 text-sm leading-6 text-violet-100/60">
                Open the course and work through the educational content
                available to you.
              </p>

              <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-violet-300 via-fuchsia-500 to-transparent" />

            </div>

            {/* 03 */}

            <div className="rounded-3xl border border-orange-300/40 bg-orange-400/[0.07] p-6">

              <div className="flex items-center justify-between">

                <span className="text-sm font-black text-orange-300">
                  03
                </span>

                <FileText
                  size={22}
                  className="text-orange-300"
                />

              </div>

              <h3 className="mt-8 text-xl font-black text-orange-100">
                Materials
              </h3>

              <p className="mt-3 text-sm leading-6 text-orange-100/60">
                Open or download uploaded documents and learning materials
                for study.
              </p>

              <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-orange-300 via-amber-500 to-transparent" />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/5 bg-[#02040d]">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div>

            <p className="text-lg font-black text-white">
              Scholiqen
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Learn. Practice. Grow.
            </p>

          </div>

          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Scholiqen. All rights reserved.
          </p>

        </div>

      </footer>

    </main>
  );
}
