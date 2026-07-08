import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Tag,
  GraduationCap,
  Clock3,
  Globe,
  BarChart3,
  Languages,
} from "lucide-react";

const CourseOverview = ({ course }) => {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
        lg:p-10
      "
    >

      <div className="flex items-center gap-4">

        <div
          className="
            h-14
            w-14
            rounded-2xl
            bg-blue-600/10
            text-blue-400
            flex
            items-center
            justify-center
          "
        >
          <BookOpen size={28} />
        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Course Overview

          </h2>

          <p className="text-slate-400 mt-1">

            Everything you need to know before starting.

          </p>

        </div>

      </div>

      {/* Description */}

      <div className="mt-10">

        <h3 className="text-xl font-semibold">

          About this Course

        </h3>

        <p className="mt-5 text-slate-300 leading-8">

          {course.description ||
            "This course has been carefully designed to provide practical knowledge, real-world experience and industry-standard skills. Through interactive lessons, quizzes, weeklytasks and projects, you'll develop the confidence needed to apply what you learn in real situations."}

        </p>

      </div>

      {/* Quick Facts */}

      <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="rounded-2xl border border-slate-800 p-6">

          <Clock3 className="text-blue-400" />

          <h4 className="mt-4 font-semibold">

            Duration

          </h4>

          <p className="mt-2 text-slate-400">

            {course.duration || "18 Hours"}

          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 p-6">

          <BarChart3 className="text-emerald-400" />

          <h4 className="mt-4 font-semibold">

            Level

          </h4>

          <p className="mt-2 text-slate-400">

            {course.level || "Beginner"}

          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 p-6">

          <Languages className="text-purple-400" />

          <h4 className="mt-4 font-semibold">

            Language

          </h4>

          <p className="mt-2 text-slate-400">

            {course.language || "English"}

          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 p-6">

          <GraduationCap className="text-amber-400" />

          <h4 className="mt-4 font-semibold">

            Certificate

          </h4>

          <p className="mt-2 text-slate-400">

            Included

          </p>

        </div>

      </div>
            {/* =========================
          Skills You'll Gain
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">

          Skills You'll Gain

        </h3>

        <div className="mt-6 grid md:grid-cols-2 gap-5">

          {(course.skills || [
            "Problem Solving",
            "Critical Thinking",
            "Practical Experience",
            "Industry Best Practices",
            "Communication",
            "Project Development",
            "Research Skills",
            "Career Readiness",
          ]).map((skill, index) => (

            <motion.div
              key={index}
              whileHover={{
                x: 6,
              }}
              className="
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-5
              "
            >

              <div
                className="
                  h-10
                  w-10
                  rounded-xl
                  bg-emerald-600/20
                  text-emerald-400
                  flex
                  items-center
                  justify-center
                "
              >

                <CheckCircle2 size={20} />

              </div>

              <span className="font-medium">

                {skill}

              </span>

            </motion.div>

          ))}

        </div>

      </div>

      {/* =========================
          Course Tags
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">

          Course Tags

        </h3>

        <div className="mt-6 flex flex-wrap gap-4">

          {(course.tags || [
            "Beginner",
            "Projects",
            "Certification",
            "Self Paced",
            "Interactive",
            "Career",
            "Professional",
            "AI Assisted",
          ]).map((tag) => (

            <span
              key={tag}
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-blue-600/10
                border
                border-blue-600/20
                px-5
                py-3
                text-blue-300
                font-medium
              "
            >

              <Tag size={16} />

              {tag}

            </span>

          ))}

        </div>

      </div>

      {/* =========================
          Prerequisites
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">

          Prerequisites

        </h3>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-8">

          <ul className="space-y-5">

            {(course.prerequisites || [
              "Basic computer knowledge",
              "Willingness to learn",
              "Internet connection",
              "No prior experience required",
            ]).map((item, index) => (

              <li
                key={index}
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <CheckCircle2
                  className="text-green-400"
                  size={20}
                />

                <span>

                  {item}

                </span>

              </li>

            ))}

          </ul>

        </div>

      </div>
            {/* =========================
          What You'll Build
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">
          What You'll Build
        </h3>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">

          {(course.projects || [
            "Real-world practical projects",
            "Industry-standard portfolio work",
            "Hands-on weeklytasks",
            "Capstone project",
          ]).map((project, index) => (

            <motion.div
              key={index}
              whileHover={{
                y: -4,
              }}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-6
              "
            >

              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-blue-600/15
                  flex
                  items-center
                  justify-center
                  text-blue-400
                "
              >
                <BookOpen size={22} />
              </div>

              <h4 className="mt-5 text-lg font-semibold">
                Project {index + 1}
              </h4>

              <p className="mt-3 text-slate-400 leading-7">
                {project}
              </p>

            </motion.div>

          ))}

        </div>

      </div>

      {/* =========================
          Course Statistics
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">
          Course Statistics
        </h3>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">

            <h2 className="text-4xl font-bold text-blue-400">
              {course.lessons || 86}
            </h2>

            <p className="mt-3 text-slate-400">
              Lessons
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">

            <h2 className="text-4xl font-bold text-emerald-400">
              {course.quizzes || 18}
            </h2>

            <p className="mt-3 text-slate-400">
              Quizzes
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">

            <h2 className="text-4xl font-bold text-amber-400">
              {course.weeklytasks || 12}
            </h2>

            <p className="mt-3 text-slate-400">
              WeeklyTasks
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">

            <h2 className="text-4xl font-bold text-cyan-400">
              {course.resources || 42}
            </h2>

            <p className="mt-3 text-slate-400">
              Resources
            </p>

          </div>

        </div>

      </div>

      {/* =========================
          Why Take This Course?
      ========================= */}

      <div className="mt-14 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8">

        <h3 className="text-3xl font-bold">
          Why Take This Course?
        </h3>

        <p className="mt-5 text-blue-100 leading-8">

          This course combines structured lessons, interactive quizzes,
          practical weeklytasks, AI-assisted learning and real-world
          projects to help you master the subject with confidence.
          Whether you're learning for school, university, career
          advancement or personal development, you'll gain practical
          skills that can be applied immediately.

        </p>

      </div>

      {/* =========================
          Career Opportunities
      ========================= */}

      <div className="mt-14">

        <h3 className="text-2xl font-bold">
          Career Opportunities
        </h3>

        <div className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {(course.careers || [
            "Software Engineer",
            "Data Analyst",
            "Project Manager",
            "Research Assistant",
            "Consultant",
            "Entrepreneur",
          ]).map((career, index) => (

            <motion.div
              key={index}
              whileHover={{
                scale: 1.03,
              }}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-6
              "
            >

              <CheckCircle2
                className="text-green-400"
                size={22}
              />

              <h4 className="mt-5 font-semibold">
                {career}
              </h4>

            </motion.div>

          ))}

        </div>

      </div>

    </motion.section>
  );
};

export default CourseOverview;