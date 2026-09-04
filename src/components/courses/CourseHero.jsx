import React from "react";
import { motion } from "framer-motion";

import {
  ArrowRight,
  PlayCircle,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   ANIMATION
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },

  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const floating = {
  animate: {
    y: [-7, 7, -7],
    transition: {
      repeat: Infinity,
      duration: 7,
      ease: "easeInOut",
    },
  },
};

/* =========================================================
   LOCAL PLATFORM STATS
   NO SUPABASE
   NO API
   NO FETCH
========================================================= */

const stats = {
  courses: 10,
  lessons: 420,
  assessments: 85,
  categories: 8,
};

/* =========================================================
   NUMBER FORMAT
========================================================= */

const formatNumber = (value) => {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000)
      .toFixed(1)
      .replace(".0", "")}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000)
      .toFixed(1)
      .replace(".0", "")}K`;
  }

  return number.toLocaleString();
};

/* =========================================================
   COURSE HERO
========================================================= */

const CourseHero = ({
  onBrowseCourses,
  onExploreCategories,
}) => {
  const navigate = useNavigate();

  /* =======================================================
     EXPLORE COURSES
  ======================================================= */

  const handleBrowseCourses = () => {
    if (typeof onBrowseCourses === "function") {
      onBrowseCourses();
      return;
    }

    const catalogue = document.getElementById(
      "course-catalogue"
    );

    if (catalogue) {
      catalogue.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    navigate("/courses");
  };

  /* =======================================================
     EXPLORE CATEGORIES
  ======================================================= */

  const handleExploreCategories = () => {
    if (typeof onExploreCategories === "function") {
      onExploreCategories();
      return;
    }

    const categoriesSection =
      document.getElementById(
        "course-categories"
      );

    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    navigate("/subjects");
  };

  /* =======================================================
     STAT DATA
  ======================================================= */

  const statItems = [
    {
      icon: BookOpen,
      value: stats.courses,
      label: "Courses",
      iconClass: "text-cyan-400",
      bgClass: "bg-cyan-500/10",
    },

    {
      icon: PlayCircle,
      value: stats.lessons,
      label: "Lessons",
      iconClass: "text-blue-400",
      bgClass: "bg-blue-500/10",
    },

    {
      icon: Award,
      value: stats.assessments,
      label: "Assessments",
      iconClass: "text-violet-400",
      bgClass: "bg-violet-500/10",
    },

    {
      icon: TrendingUp,
      value: stats.categories,
      label: "Categories",
      iconClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
  ];

  /* =======================================================
     PLATFORM FEATURES
  ======================================================= */

  const platformFeatures = [
    {
      icon: BookOpen,
      title: "Courses & Lessons",
      description:
        "Structured learning content designed to take you from fundamentals to mastery.",
      iconClass:
        "bg-cyan-500/10 text-cyan-400",
    },

    {
      icon: Brain,
      title: "Intelligent Learning",
      description:
        "Practice, assessments and AI-powered learning experiences in one ecosystem.",
      iconClass:
        "bg-violet-500/10 text-violet-400",
    },

    {
      icon: TrendingUp,
      title: "Skill Development",
      description:
        "Turn knowledge into practical skills you can apply beyond the classroom.",
      iconClass:
        "bg-emerald-500/10 text-emerald-400",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="
        relative
        isolate
        overflow-hidden
        border-b
        border-slate-900
        bg-[#050912]
      "
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        {/* Cyan glow */}

        <div
          className="
            absolute
            -left-48
            -top-48
            h-[620px]
            w-[620px]
            rounded-full
            bg-cyan-500/[0.075]
            blur-[140px]
          "
        />

        {/* Blue glow */}

        <div
          className="
            absolute
            -bottom-64
            -right-48
            h-[700px]
            w-[700px]
            rounded-full
            bg-blue-600/[0.07]
            blur-[150px]
          "
        />

        {/* Violet glow */}

        <div
          className="
            absolute
            left-1/2
            top-1/3
            h-[500px]
            w-[500px]
            -translate-x-1/2
            rounded-full
            bg-indigo-500/[0.025]
            blur-[150px]
          "
        />

        {/* Neon grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
            [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)]
            [background-size:56px_56px]
          "
        />

        {/* Bottom fade */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-48
            bg-gradient-to-t
            from-[#050912]
            to-transparent
          "
        />
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-5
          py-20
          sm:px-8
          lg:px-10
          lg:py-28
        "
      >
        <div
          className="
            grid
            items-center
            gap-16
            lg:grid-cols-[1.1fr_0.9fr]
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
                gap-2.5
                rounded-full
                border
                border-cyan-500/20
                bg-cyan-500/[0.08]
                px-4
                py-2
                text-xs
                font-bold
                uppercase
                tracking-[0.16em]
                text-cyan-300
                shadow-[0_0_30px_rgba(6,182,212,0.06)]
              "
            >
              <Sparkles
                size={15}
                className="text-cyan-400"
              />

              Neon Learning Hub

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_10px_rgba(34,211,238,1)]
                "
              />
            </motion.div>

            {/* TITLE */}

            <motion.h1
              custom={0.12}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-7
                max-w-4xl
                text-5xl
                font-black
                leading-[0.98]
                tracking-[-0.045em]
                text-white
                sm:text-6xl
                lg:text-[76px]
              "
            >
              Learn.

              <span className="text-cyan-400">
                {" "}
                Build.
              </span>

              <br />

              Become

              <span
                className="
                  bg-gradient-to-r
                  from-blue-400
                  via-cyan-300
                  to-cyan-400
                  bg-clip-text
                  text-transparent
                "
              >
                {" "}
                Extraordinary.
              </span>
            </motion.h1>

            {/* DESCRIPTION */}

            <motion.p
              custom={0.24}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-7
                max-w-2xl
                text-base
                leading-8
                text-slate-400
                sm:text-lg
              "
            >
              Scholiqen brings courses, practical
              learning, AI tutoring, virtual
              laboratories, assessments and learning
              resources together in one intelligent
              ecosystem built for serious learners.
            </motion.p>

            {/* ACTIONS */}

            <motion.div
              custom={0.36}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-9
                flex
                flex-wrap
                gap-3
              "
            >
              <button
                type="button"
                onClick={handleBrowseCourses}
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-cyan-500
                  px-6
                  py-4
                  text-sm
                  font-black
                  text-slate-950
                  shadow-[0_12px_40px_rgba(6,182,212,0.12)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-cyan-400
                  hover:shadow-[0_18px_50px_rgba(6,182,212,0.2)]
                "
              >
                <BookOpen size={18} />

                Explore Courses

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
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
                  gap-3
                  rounded-2xl
                  border
                  border-slate-700
                  bg-slate-900/60
                  px-6
                  py-4
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-cyan-500/30
                  hover:bg-slate-800
                "
              >
                <PlayCircle size={18} />

                Explore Categories
              </button>
            </motion.div>

            {/* TRUST */}

            <motion.div
              custom={0.48}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-9
                flex
                flex-wrap
                gap-x-7
                gap-y-3
              "
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
                <ShieldCheck
                  size={17}
                  className="text-cyan-400"
                />

                Secure Learning
              </div>

              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
                <Award
                  size={17}
                  className="text-yellow-400"
                />

                Certificates
              </div>

              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
                <Brain
                  size={17}
                  className="text-violet-400"
                />

                AI Powered
              </div>
            </motion.div>

            {/* =================================================
                LOCAL STATS
            ================================================= */}

            <motion.div
              custom={0.6}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="
                mt-12
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              {statItems.map((item) => {
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
                      bg-[#091321]/80
                      p-4
                      backdrop-blur-xl
                      transition-colors
                      hover:border-cyan-500/20
                    "
                  >
                    <div
                      className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        ${item.bgClass}
                      `}
                    >
                      <Icon
                        size={17}
                        className={item.iconClass}
                      />
                    </div>

                    <div className="mt-3">
                      <p className="text-xl font-black text-white">
                        {formatNumber(item.value)}
                      </p>

                      <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* =================================================
              RIGHT PREMIUM NEON PANEL
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
            <div className="relative mx-auto max-w-[480px]">

              {/* OUTER GLOW */}

              <div
                className="
                  absolute
                  -inset-10
                  rounded-[50px]
                  bg-cyan-500/[0.035]
                  blur-3xl
                "
              />

              {/* MAIN CARD */}

              <div
                className="
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-white/[0.08]
                  bg-[#091321]/95
                  p-7
                  shadow-[0_40px_120px_rgba(0,0,0,0.4)]
                  backdrop-blur-2xl
                "
              >

                {/* TOP */}

                <div className="flex items-center justify-between">

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      from-cyan-500/20
                      to-blue-500/10
                      text-cyan-400
                      ring-1
                      ring-cyan-400/10
                    "
                  >
                    <Brain size={26} />
                  </div>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-emerald-500/15
                      bg-emerald-500/10
                      px-3
                      py-1.5
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-emerald-300
                    "
                  >
                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-emerald-400
                        shadow-[0_0_10px_rgba(52,211,153,0.7)]
                      "
                    />

                    Platform Online
                  </div>
                </div>

                {/* HEADING */}

                <div className="mt-8">

                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-400">
                    Your learning ecosystem
                  </p>

                  <h2
                    className="
                      mt-3
                      text-3xl
                      font-black
                      leading-tight
                      tracking-tight
                      text-white
                    "
                  >
                    Everything you need

                    <span className="text-cyan-400">
                      {" "}
                      to learn.
                    </span>
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    Discover courses, practise what
                    you learn, measure your progress
                    and keep moving forward.
                  </p>
                </div>

                {/* FEATURES */}

                <div className="mt-8 space-y-3">

                  {platformFeatures.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="
                          group
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          border-white/[0.05]
                          bg-slate-950/50
                          p-4
                          transition-all
                          duration-300
                          hover:border-cyan-500/10
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
                            ${item.iconClass}
                          `}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white">
                            {item.title}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>

                {/* PROGRESS */}

                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-white/[0.05]
                    bg-slate-950/60
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-bold text-slate-400">
                        Learning momentum
                      </p>

                      <p className="mt-1 text-sm font-black text-white">
                        Keep building
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-500/10
                      "
                    >
                      <TrendingUp
                        size={17}
                        className="text-cyan-400"
                      />
                    </div>

                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      initial={{
                        width: "0%",
                      }}
                      animate={{
                        width: "72%",
                      }}
                      transition={{
                        duration: 1.4,
                        delay: 0.7,
                        ease: "easeOut",
                      }}
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-cyan-500
                        to-blue-500
                        shadow-[0_0_15px_rgba(6,182,212,0.35)]
                      "
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                    <span>
                      Start learning
                    </span>

                    <span>
                      Keep progressing
                    </span>
                  </div>
                </div>

                {/* FOOTER */}

                <div
                  className="
                    mt-6
                    flex
                    items-center
                    gap-3
                    border-t
                    border-white/[0.05]
                    pt-5
                  "
                >
                  <CheckCircle2
                    size={18}
                    className="text-emerald-400"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    Learn at your own pace.
                    Build skills that last.
                  </p>
                </div>
              </div>

              {/* =================================================
                  FLOATING COURSE COUNT
              ================================================= */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  -bottom-6
                  -left-8
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0b1524]/95
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
                    "
                  >
                    <BookOpen
                      size={18}
                      className="text-cyan-400"
                    />
                  </div>

                  <div>
                    <p className="text-lg font-black text-white">
                      {formatNumber(stats.courses)}
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Courses available
                    </p>
                  </div>

                </div>
              </motion.div>

              {/* =================================================
                  FLOATING COMMUNITY BADGE
              ================================================= */}

              <motion.div
                animate={{
                  y: [0, 7, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  absolute
                  -right-7
                  top-24
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-[#0b1524]/95
                  px-4
                  py-3
                  shadow-2xl
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-2.5">

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                    "
                  >
                    <Users
                      size={16}
                      className="text-blue-400"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-black text-white">
                      Learn. Practice.
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Grow continuously.
                    </p>
                  </div>

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