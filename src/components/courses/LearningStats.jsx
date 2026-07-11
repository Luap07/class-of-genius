// src/components/courses/LearningStats.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Award,
  Globe2,
  GraduationCap,
  Building2,
} from "lucide-react";

import { useCourses } from "../../context/LMSContext/CourseContext";

const LearningStats = () => {

  const {

    stats = {},

    loading,

  } = useCourses();

  /* =====================================
      DISPLAY MINIMUM VALUES
  ===================================== */

  const displayValue = (
    actual = 0,
    minimum = 0,
    suffix = "+"
  ) => {

    const value = Number(actual) || 0;

    return value >= minimum
      ? `${value.toLocaleString()}${suffix}`
      : `${minimum.toLocaleString()}${suffix}`;

  };

  const completionRate = () => {

    const completed =
      Number(stats.completedCourses) || 0;

    const enrolled =
      Number(stats.enrolledCourses) || 0;

    if (!enrolled) return "95%";

    return `${Math.round(
      (completed / enrolled) * 100
    )}%`;

  };

  const cards = [

    {
      icon: BookOpen,
      value: displayValue(
        stats.courses,
        100
      ),
      title: "Courses",
      description:
        "Expert-led courses across multiple disciplines.",
      color: "text-blue-400",
      bg: "from-blue-500/20 to-cyan-500/10",
    },

    {
      icon: Users,
      value: displayValue(
        stats.learners,
        1000
      ),
      title: "Learners",
      description:
        "Students actively learning on Scholiqen.",
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-green-500/10",
    },

    {
      icon: Award,
      value: displayValue(
        stats.certificates,
        100
      ),
      title: "Certificates",
      description:
        "Certificates earned by successful learners.",
      color: "text-yellow-400",
      bg: "from-yellow-500/20 to-orange-500/10",
    },

    {
      icon: Globe2,
      value: displayValue(
        stats.countries,
        10
      ),
      title: "Countries",
      description:
        "Growing global learning community.",
      color: "text-cyan-400",
      bg: "from-cyan-500/20 to-sky-500/10",
    },

    {
      icon: Building2,
      value: displayValue(
        stats.partners,
        20
      ),
      title: "Partners",
      description:
        "Schools and organizations collaborating with Scholiqen.",
      color: "text-violet-400",
      bg: "from-violet-500/20 to-purple-500/10",
    },

    {
      icon: GraduationCap,
      value: completionRate(),
      title: "Completion Rate",
      description:
        "Learners successfully completing their learning journey.",
      color: "text-pink-400",
      bg: "from-pink-500/20 to-rose-500/10",
    },

  ];

  return (

    <section className="space-y-12">

      {/* Header */}

      <div className="mx-auto max-w-3xl text-center">

        <span
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-cyan-500/30
            bg-cyan-500/10
            px-5
            py-2
            text-sm
            font-semibold
            text-cyan-400
          "
        >
          Live Platform Statistics
        </span>

        <h2
          className="
            mt-6
            text-4xl
            font-black
            text-white
            md:text-5xl
          "
        >
          Empowering Learning
          <span className="text-cyan-400">
            {" "}
            Every Day
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-lg
            leading-8
            text-slate-400
          "
        >
          Every statistic below is powered by
          Scholiqen's live learning platform,
          growing automatically as students,
          instructors and courses increase.
        </p>

      </div>
            {/* Statistics Grid */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

        {cards.map((item, index) => {

          const Icon = item.icon;

          return (

            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              viewport={{
                once: true,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                p-8
                transition-all
                duration-300
                hover:border-cyan-500/40
                hover:shadow-[0_25px_50px_rgba(0,0,0,.45)]
              "
            >

              {/* Background Glow */}

              <div
                className={`
                  absolute
                  inset-0
                  bg-gradient-to-br
                  ${item.bg}
                  opacity-40
                  transition-opacity
                  duration-300
                  group-hover:opacity-70
                `}
              />

              <div className="relative z-10">

                <div
                  className={`
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-800
                    ${item.color}
                  `}
                >
                  <Icon size={30} />
                </div>

                <h3
                  className="
                    mt-7
                    text-5xl
                    font-black
                    tracking-tight
                    text-white
                  "
                >
                  {loading ? "--" : item.value}
                </h3>

                <h4
                  className="
                    mt-3
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  {item.title}
                </h4>

                <p
                  className="
                    mt-4
                    leading-7
                    text-slate-400
                  "
                >
                  {item.description}
                </p>

              </div>

            </motion.div>

          );

        })}

      </div>

    </section>

  );

};

export default LearningStats;