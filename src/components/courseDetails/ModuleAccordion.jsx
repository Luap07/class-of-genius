import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  Lock,
  Unlock,
  Clock3,
  BookOpen,
} from "lucide-react";

const defaultModules = [
  {
    id: 1,
    title: "Getting Started",
    duration: "1h 20m",
    lessons: [
      {
        title: "Course Introduction",
        type: "video",
        duration: "12 min",
        locked: false,
      },
      {
        title: "Setting Up",
        type: "video",
        duration: "15 min",
        locked: false,
      },
      {
        title: "Quick Quiz",
        type: "quiz",
        duration: "10 min",
        locked: false,
      },
    ],
  },
  {
    id: 2,
    title: "Core Concepts",
    duration: "3h 10m",
    lessons: [
      {
        title: "Fundamentals",
        type: "video",
        duration: "28 min",
        locked: false,
      },
      {
        title: "Practice Exercise",
        type: "weeklytasks",
        duration: "45 min",
        locked: false,
      },
      {
        title: "Knowledge Check",
        type: "quiz",
        duration: "15 min",
        locked: false,
      },
    ],
  },
  {
    id: 3,
    title: "Advanced Topics",
    duration: "4h 30m",
    lessons: [
      {
        title: "Advanced Lesson",
        type: "video",
        duration: "40 min",
        locked: true,
      },
      {
        title: "Case Study",
        type: "resource",
        duration: "25 min",
        locked: true,
      },
      {
        title: "Final Assessment",
        type: "quiz",
        duration: "30 min",
        locked: true,
      },
    ],
  },
];

const ModuleAccordion = ({ course }) => {

  const modules =
    course.modules || defaultModules;

  const [openModule, setOpenModule] =
    useState(1);

  const toggleModule = (id) => {

    setOpenModule((prev) =>
      prev === id ? null : id
    );

  };

  const lessonIcon = (type) => {

    switch (type) {

      case "video":
        return <PlayCircle size={18} />;

      case "quiz":
        return <HelpCircle size={18} />;

      case "weeklytask":
        return <BookOpen size={18} />;

      case "resource":
        return <FileText size={18} />;

      default:
        return <PlayCircle size={18} />;

    }

  };

  return (

    <section
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
      "
    >

      <div className="flex items-center gap-4">

        <div
          className="
            h-16
            w-16
            rounded-2xl
            bg-blue-600/10
            flex
            items-center
            justify-center
            text-blue-400
          "
        >

          <BookOpen size={30} />

        </div>

        <div>

          <h2 className="text-3xl font-bold">

            Course Curriculum

          </h2>

          <p className="mt-2 text-slate-400">

            Explore every module and lesson.

          </p>

        </div>

      </div>

      <div className="mt-10 space-y-6">
                {modules.map((module) => {

          const expanded =
            openModule === module.id;

          return (

            <motion.div
              key={module.id}
              layout
              className="
                overflow-hidden
                rounded-3xl
                border
                border-slate-800
                bg-slate-950
              "
            >

              {/* Module Header */}

              <button
                onClick={() =>
                  toggleModule(module.id)
                }
                className="
                  w-full
                  flex
                  items-center
                  justify-between
                  p-6
                  hover:bg-slate-900
                  transition
                "
              >

                <div className="flex items-center gap-5">

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

                    {expanded ? (
                      <ChevronDown size={24} />
                    ) : (
                      <ChevronRight size={24} />
                    )}

                  </div>

                  <div className="text-left">

                    <h3 className="text-xl font-bold">

                      {module.title}

                    </h3>

                    <div className="mt-2 flex flex-wrap gap-5 text-sm text-slate-400">

                      <span>

                        {module.lessons.length} Lessons

                      </span>

                      <span className="flex items-center gap-2">

                        <Clock3 size={15} />

                        {module.duration}

                      </span>

                    </div>

                  </div>

                </div>

                <div
                  className="
                    rounded-full
                    bg-blue-600/10
                    px-4
                    py-2
                    text-sm
                    text-blue-300
                  "
                >

                  Module {module.id}

                </div>

              </button>

              <AnimatePresence>

                {expanded && (

                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >

                    <div className="border-t border-slate-800">

                      {module.lessons.map(
                        (lesson, index) => (

                          <motion.div
                            key={index}
                            whileHover={{
                              x: 6,
                            }}
                            className="
                              flex
                              items-center
                              justify-between
                              p-5
                              border-b
                              border-slate-800
                              last:border-none
                            "
                          >

                            <div className="flex items-center gap-4">

                              <div
                                className="
                                  h-12
                                  w-12
                                  rounded-xl
                                  bg-slate-800
                                  flex
                                  items-center
                                  justify-center
                                  text-blue-400
                                "
                              >

                                {lessonIcon(
                                  lesson.type
                                )}

                              </div>

                              <div>

                                <h4 className="font-medium">

                                  {lesson.title}

                                </h4>

                                <p className="mt-1 text-sm text-slate-400">

                                  {lesson.type}

                                </p>

                              </div>

                            </div>

                            <div className="flex items-center gap-6">

                              <span className="text-slate-400 text-sm">

                                {lesson.duration}

                              </span>

                              {lesson.locked ? (

                                <Lock
                                  className="text-red-400"
                                  size={18}
                                />

                              ) : (

                                <Unlock
                                  className="text-green-400"
                                  size={18}
                                />

                              )}

                            </div>

                          </motion.div>

                        )
                      )}

                    </div>

                  </motion.div>

                )}

              </AnimatePresence>

            </motion.div>

          );

        })}
              </div>

      {/* ==========================================
          Curriculum Statistics
      ========================================== */}

      <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            p-6
            text-center
          "
        >

          <h2 className="text-4xl font-bold text-blue-400">

            {modules.length}

          </h2>

          <p className="mt-3 text-slate-400">

            Modules

          </p>

        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            p-6
            text-center
          "
        >

          <h2 className="text-4xl font-bold text-emerald-400">

            {modules.reduce(
              (total, module) =>
                total + module.lessons.length,
              0
            )}

          </h2>

          <p className="mt-3 text-slate-400">

            Lessons

          </p>

        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            p-6
            text-center
          "
        >

          <h2 className="text-4xl font-bold text-amber-400">

            {
              modules.flatMap(
                (m) => m.lessons
              ).filter(
                (lesson) =>
                  lesson.type === "quiz"
              ).length
            }

          </h2>

          <p className="mt-3 text-slate-400">

            Quizzes

          </p>

        </div>

        <div
          className="
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            p-6
            text-center
          "
        >

          <h2 className="text-4xl font-bold text-purple-400">

            {
              modules.flatMap(
                (m) => m.lessons
              ).filter(
                (lesson) =>
                  lesson.type === "resource"
              ).length
            }

          </h2>

          <p className="mt-3 text-slate-400">

            Resources

          </p>

        </div>

      </div>

      {/* ==========================================
          Learning Journey Banner
      ========================================== */}

      <motion.div
        whileHover={{
          scale: 1.01,
        }}
        className="
          mt-12
          rounded-[32px]
          overflow-hidden
          bg-gradient-to-r
          from-blue-700
          via-indigo-700
          to-violet-700
          p-10
        "
      >

        <h2 className="text-3xl font-bold">

          Complete Every Module

        </h2>

        <p className="mt-5 max-w-3xl text-blue-100 leading-8">

          Each completed lesson unlocks the next stage of your
          learning journey. Watch videos, complete quizzes,
          submit weeklytask and earn your Wonder Certificate.

        </p>

        <div className="mt-8">

          <div className="flex justify-between mb-3">

            <span>

              Overall Progress

            </span>

            <span>

              0%

            </span>

          </div>

          <div className="h-3 rounded-full bg-white/20 overflow-hidden">

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: "0%",
              }}
              className="
                h-full
                rounded-full
                bg-white
              "
            />

          </div>

        </div>

        <button
          className="
            mt-8
            rounded-2xl
            bg-white
            text-slate-900
            px-8
            py-4
            font-bold
            hover:scale-105
            transition
          "
        >

          Start Module 1

        </button>

      </motion.div>

    </section>
  );

};

export default ModuleAccordion;