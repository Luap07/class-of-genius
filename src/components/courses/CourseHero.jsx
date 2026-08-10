import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate, useLocation } from "react-router-dom";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },

  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: "easeOut",
    },
  }),
};

const floating = {
  animate: {
    y: [-6, 6, -6],
    transition: {
      repeat: Infinity,
      duration: 6,
      ease: "easeInOut",
    },
  },
};

const CourseHero = ({
  onBrowseCourses,
  onExploreCategories,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    courses: 0,
    lessons: 0,
    assessments: 0,
    categories: 0,
  });

  const [loading, setLoading] = useState(true);

  /* =========================================================
     EXPLORE COURSES
  ========================================================= */

  const handleBrowseCourses = () => {
    if (location.pathname !== "/subjects") {
      navigate("/subjects");
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    if (typeof onBrowseCourses === "function") {
      onBrowseCourses();
    }
  };

  /* =========================================================
     EXPLORE CATEGORIES
  ========================================================= */

  const handleExploreCategories = () => {
    if (typeof onExploreCategories === "function") {
      onExploreCategories();
      return;
    }

    const categoriesSection =
      document.getElementById("course-categories");

    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  /* =========================================================
     LIVE PLATFORM STATS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchHeroStats = async () => {
      try {
        setLoading(true);

        const [
          coursesResult,
          topicsResult,
          weeklyTasksResult,
          monthlyQuizResult,
          categoriesResult,
        ] = await Promise.all([
          supabase
            .from("courses")
            .select("id"),

          supabase
            .from("topics")
            .select("id"),

          supabase
            .from("weekly_tasks")
            .select("id"),

          supabase
            .from("monthly_quizzes")
            .select("id"),

          supabase
            .from("course_categories")
            .select("id"),
        ]);

        if (!mounted) return;

        const courses = coursesResult?.data || [];
        const topics = topicsResult?.data || [];
        const weeklyTasks =
          weeklyTasksResult?.data || [];
        const quizzes =
          monthlyQuizResult?.data || [];
        const categories =
          categoriesResult?.data || [];

        setStats({
          courses: courses.length,
          lessons: topics.length,
          assessments:
            weeklyTasks.length + quizzes.length,
          categories: categories.length,
        });
      } catch (error) {
        console.error(
          "Course Hero Stats Error:",
          error
        );

        if (mounted) {
          setStats({
            courses: 0,
            lessons: 0,
            assessments: 0,
            categories: 0,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHeroStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#050912]
      "
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-500/[0.07]
            blur-[120px]
          "
        />

        <div
          className="
            absolute
            -bottom-48
            right-[-100px]
            h-[600px]
            w-[600px]
            rounded-full
            bg-blue-600/[0.06]
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.04]
            [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)]
            [background-size:48px_48px]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-40
            bg-gradient-to-t
            from-[#050912]
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-20
          sm:px-8
          lg:px-10
          lg:py-24
        "
      >
        <div
          className="
            grid
            items-center
            gap-16
            lg:grid-cols-[1.15fr_0.85fr]
            lg:gap-20
          "
        >
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div>
            {/* BADGE */}

            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/10
                px-5
                py-2
                text-sm
                font-medium
                text-cyan-300
              "
            >
              <Brain size={18} />
              AI Powered Learning Platform
            </motion.div>

            {/* TITLE */}

            <motion.h1
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-8
                max-w-4xl
                text-5xl
                font-black
                leading-[1.02]
                tracking-tight
                text-white
                sm:text-6xl
                lg:text-7xl
              "
            >
              Learn.
              <span className="text-cyan-400">
                {" "}
                Build.
              </span>

              <br />

              Become
              <span className="text-blue-400">
                {" "}
                Extraordinary.
              </span>
            </motion.h1>

            {/* DESCRIPTION */}

            <motion.p
              custom={0.4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-8
                max-w-3xl
                text-base
                leading-8
                text-slate-400
                sm:text-lg
              "
            >
              Scholiqen brings together courses,
              practical learning, AI tutoring,
              virtual laboratories, assessments,
              projects and other learning resources
              into one intelligent learning ecosystem
              designed to help you develop knowledge,
              skills and confidence.
            </motion.p>

            {/* ACTIONS */}

            <motion.div
              custom={0.6}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-10
                flex
                flex-wrap
                gap-4
              "
            >
              <button
                type="button"
                onClick={handleBrowseCourses}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-cyan-500
                  px-7
                  py-4
                  font-bold
                  text-slate-950
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-cyan-400
                  hover:shadow-[0_15px_40px_rgba(6,182,212,0.18)]
                "
              >
                <BookOpen size={19} />

                Explore Courses

                <ArrowRight
                  size={18}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>

              <button
                type="button"
                onClick={handleExploreCategories}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900/60
                  px-7
                  py-4
                  font-semibold
                  text-white
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-cyan-500/40
                  hover:bg-slate-800
                "
              >
                <PlayCircle size={19} />

                Explore Categories
              </button>
            </motion.div>

            {/* TRUST BADGES */}

            <motion.div
              custom={0.8}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-12
                flex
                flex-wrap
                gap-x-8
                gap-y-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-slate-300
                "
              >
                <ShieldCheck
                  size={20}
                  className="text-cyan-400"
                />

                Secure Learning
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-slate-300
                "
              >
                <Award
                  size={20}
                  className="text-yellow-400"
                />

                Industry Certificates
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-sm
                  text-slate-300
                "
              >
                <Brain
                  size={20}
                  className="text-blue-400"
                />

                AI Powered
              </div>
            </motion.div>

            {/* LIVE STATS */}

            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-14
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              {[
                {
                  icon: BookOpen,
                  value: stats.courses,
                  label: "Courses",
                  color: "text-cyan-400",
                  bg: "bg-cyan-500/10",
                },
                {
                  icon: PlayCircle,
                  value: stats.lessons,
                  label: "Lessons",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: Award,
                  value: stats.assessments,
                  label: "Assessments",
                  color: "text-violet-400",
                  bg: "bg-violet-500/10",
                },
                {
                  icon: TrendingUp,
                  value: stats.categories,
                  label: "Categories",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    whileHover={{
                      y: -5,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900/60
                      p-4
                      backdrop-blur-xl
                      transition-all
                      hover:border-cyan-500/20
                      hover:bg-slate-900/80
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${item.bg}
                      `}
                    >
                      <Icon
                        size={19}
                        className={item.color}
                      />
                    </div>

                    <h2
                      className="
                        mt-4
                        text-2xl
                        font-black
                        text-white
                      "
                    >
                      {loading
                        ? "--"
                        : item.value}
                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {item.label}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <motion.div
            variants={floating}
            animate="animate"
            className="
              relative
              hidden
              lg:block
            "
          >
            <div
              className="
                relative
                mx-auto
                max-w-[500px]
              "
            >
              {/* OUTER GLOW */}

              <div
                className="
                  absolute
                  -inset-8
                  rounded-[45px]
                  bg-cyan-500/[0.035]
                  blur-3xl
                "
              />

              {/* MAIN PANEL */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-white/[0.08]
                  bg-[#0b1220]/90
                  p-7
                  shadow-[0_35px_100px_rgba(0,0,0,0.35)]
                  backdrop-blur-2xl
                "
              >
                {/* TOP ICON */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-cyan-500/10
                      text-cyan-400
                    "
                  >
                    <Brain size={27} />
                  </div>

                  <div
                    className="
                      rounded-full
                      border
                      border-emerald-400/10
                      bg-emerald-400/10
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-emerald-300
                    "
                  >
                    LIVE PLATFORM
                  </div>
                </div>

                {/* HEADING */}

                <div className="mt-8">
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-cyan-400
                    "
                  >
                    Your learning ecosystem
                  </p>

                  <h2
                    className="
                      mt-3
                      text-3xl
                      font-black
                      leading-tight
                      text-white
                    "
                  >
                    Everything you need
                    <span className="text-cyan-400">
                      {" "}
                      to learn.
                    </span>
                  </h2>

                  <p
                    className="
                      mt-4
                      text-sm
                      leading-7
                      text-slate-500
                    "
                  >
                    Explore different subjects,
                    develop practical skills,
                    test your knowledge and keep
                    building your academic and
                    professional journey.
                  </p>
                </div>

                {/* LEARNING AREAS */}

                <div className="mt-8 space-y-3">
                  {[
                    {
                      icon: BookOpen,
                      title: "Courses & Lessons",
                      text:
                        "Structured learning content across different subjects.",
                      className:
                        "bg-cyan-500/10 text-cyan-400",
                    },
                    {
                      icon: Brain,
                      title: "Interactive Learning",
                      text:
                        "Practice, assessments and learning activities.",
                      className:
                        "bg-violet-500/10 text-violet-400",
                    },
                    {
                      icon: TrendingUp,
                      title: "Skill Development",
                      text:
                        "Build knowledge you can apply beyond the classroom.",
                      className:
                        "bg-emerald-500/10 text-emerald-400",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          border-white/[0.05]
                          bg-slate-950/50
                          p-4
                          transition
                          hover:border-cyan-400/10
                          hover:bg-slate-950/80
                        "
                      >
                        <div
                          className={`
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${item.className}
                          `}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3
                            className="
                              text-sm
                              font-bold
                              text-white
                            "
                          >
                            {item.title}
                          </h3>

                          <p
                            className="
                              mt-1
                              text-xs
                              leading-5
                              text-slate-500
                            "
                          >
                            {item.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM MESSAGE */}

                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-cyan-500/10
                    bg-cyan-500/[0.045]
                    p-5
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-500/10
                        text-cyan-400
                      "
                    >
                      <Award size={18} />
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-white
                        "
                      >
                        Learn at your own pace
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-500
                        "
                      >
                        Start with a subject and
                        continue building from there.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING STAT */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  -bottom-5
                  -left-7
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0b1220]/95
                  px-5
                  py-4
                  shadow-2xl
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-cyan-500/10
                      text-cyan-400
                    "
                  >
                    <BookOpen size={19} />
                  </div>

                  <div>
                    <p
                      className="
                        text-lg
                        font-black
                        text-white
                      "
                    >
                      {loading
                        ? "--"
                        : stats.courses}
                    </p>

                    <p
                      className="
                        text-[11px]
                        text-slate-500
                      "
                    >
                      Available courses
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* FLOATING BADGE */}

              <motion.div
                animate={{
                  y: [0, 7, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  -right-6
                  top-20
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0b1220]/95
                  px-4
                  py-3
                  shadow-2xl
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    size={18}
                    className="text-emerald-400"
                  />

                  <span
                    className="
                      text-xs
                      font-bold
                      text-slate-200
                    "
                  >
                    Learn. Practice. Grow.
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
